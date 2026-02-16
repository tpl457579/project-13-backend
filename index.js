import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './src/config/db.js'

import productsRouter from './src/api/routes/products.js'
import usersRouter from './src/api/routes/users.js'
import dogsRouter from './src/api/routes/dogs.js'
import catsRouter from './src/api/routes/cats.js'

const app = express()

// Connect to MongoDB BEFORE starting the server
await connectDB()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// API Routes
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/dogs', dogsRouter)
app.use('/api/v1/cats', catsRouter)

// Root route
app.get('/', (req, res) => {
  res.send('API is running...')
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
