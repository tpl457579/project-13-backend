import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { connectDB } from './src/config/db.js'
import productsRouter from './src/api/routes/products.js'
import usersRouter from './src/api/routes/users.js'
import './src/utils/cron.js'

const app = express()

connectDB()

app.use(express.json())

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

app.use('/api/v1/products', productsRouter)
app.use('/api/v1/users', usersRouter)

app.get('/', (req, res) => {
  res.send('API is running')
})

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
