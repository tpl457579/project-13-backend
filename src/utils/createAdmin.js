import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import User from '../api/models/users.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    const existingAdmin = await User.findOne({ email: 'a@a.com' })
    if (existingAdmin) {
      console.log('Admin user already exists')
      process.exit(0)
    }

    const hashedPassword = await bcrypt.hash('123', 10)

    const adminUser = new User({
      userName: 'a',
      email: 'a@a.com',
      password: hashedPassword,
      role: 'admin',
      favourites: []
    })

    await adminUser.save()
    console.log('Admin user created successfully!')

    process.exit(0)
  } catch (err) {
    console.error('Error creating admin:', err)
    process.exit(1)
  }
}

createAdmin()
