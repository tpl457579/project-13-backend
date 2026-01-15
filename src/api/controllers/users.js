import dotenv from 'dotenv'
dotenv.config()
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/users.js'


export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('favourites')
    return res.status(200).json(users)
  } catch (error) {
    return res.status(400).json({ message: 'Failed to fetch users' })
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('favourites')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.status(200).json(user)
  } catch (error) {
    return res
      .status(400)
      .json({ message: 'Invalid user ID format or request' })
  }
}

export const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body

    if (!userName || !email || !password) {
      return res.status(400).json({
        message: 'All fields (username, email, password) are required'
      })
    }

    const cleanUserName = userName.trim()
    const cleanEmail = email.trim().toLowerCase()

    const existingUser = await User.findOne({
      $or: [{ userName: cleanUserName }, { email: cleanEmail }]
    })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Username or email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      userName: cleanUserName,
      email: cleanEmail,
      password: hashedPassword
    })

    await newUser.save()

    const token = jwt.sign(
      { id: newUser._id },
      process.env.SECRET_KEY || 'supersecret',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      user: {
        _id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        favourites: []
      },
      token
    })
  } catch (error) {
    console.error('Register error:', error)

    res
      .status(500)
      .json({ message: 'Registration failed', error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { userName, password } = req.body

    const user = await User.findOne({ userName })
    if (!user) {
      return res.status(400).json({ message: 'Username or password incorrect' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Username or password incorrect' })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY || 'supersecret',
      { expiresIn: '7d' }
    )

    res.status(200).json({
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        favourites: user.favourites || [],
        role: user.role
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { userName, email, password, productId, remove } = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (userName) user.userName = userName
    if (email) user.email = email
    if (password && password.trim())
      user.password = await bcrypt.hash(password, 10)

    if (productId) {
      let favourites = Array.isArray(user.favourites)
        ? [...user.favourites]
        : []
      if (remove === true || remove === 'true') {
        favourites = favourites.filter(
          (id) => id.toString() !== productId.toString()
        )
      } else if (
        !favourites.find((id) => id.toString() === productId.toString())
      ) {
        favourites.push(productId)
      }
      user.favourites = favourites
    }

    await user.save()
    const token = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY || 'supersecret',
      {
        expiresIn: '1y'
      }
    )

    return res.status(200).json({ user, token })
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id)
    if (!deletedUser) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getFavourites = async (req, res) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await user.populate('favourites')
    res.json({ favourites: user.favourites })
  } catch (err) {
    console.error('getFavourites error:', err)
    res
      .status(500)
      .json({ message: 'Failed to fetch favourites', error: err.message })
  }
}

export const toggleFavourite = async (req, res) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { productId } = req.params
    if (!productId) {
      return res.status(400).json({ message: 'No product ID provided' })
    }

    const index = user.favourites.findIndex(
      (id) => id.toString() === productId.toString()
    )

    let message
    if (index > -1) {
      user.favourites.splice(index, 1)
      message = 'Removed from favourites'
    } else {
      user.favourites.push(productId)
      message = 'Added to favourites'
    }

    await user.save()
    await user.populate('favourites')
    res.json({ favourites: user.favourites })
  } catch (err) {
    console.error('toggleFavourite error:', err)
    res
      .status(500)
      .json({ message: 'Failed to toggle favourite', error: err.message })
  }
}
