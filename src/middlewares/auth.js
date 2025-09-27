import jwt from 'jsonwebtoken'
import User from '../api/models/users.js'

export const isAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  if (!process.env.SECRET_KEY) {
    console.error('SECRET_KEY not defined')
    return res.status(500).json({ message: 'Server configuration error' })
  }

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY)

    const userId = payload.id
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user

    next()
  } catch (error) {
    console.error('Auth error:', error.message)
    return res
      .status(401)
      .json({ message: 'Unauthorized', error: error.message })
  }
}
