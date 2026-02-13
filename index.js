import 'dotenv/config' // Cleaner way to load variables in 2026
import express from 'express'
import cors from 'cors'
import { connectDB } from './src/config/db.js'
import productsRouter from './src/api/routes/products.js'
import usersRouter from './src/api/routes/users.js'
import dogsRouter from './src/api/routes/dogs.js'



const app = express()

// Connect to Database
connectDB()

// MIDDLEWARES
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true // Helpful for handling auth cookies if needed later
}))

// Increased limit to handle image data/metadata if necessary
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ROUTES
// Note: Ensure frontend calls /api/v1/products
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/dogs', dogsRouter)

// Status Check
app.get('/', (req, res) => {
  res.send('API is running...')
})

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack)
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  })
})

const PORT = process.env.PORT || 5000 // Port 5000 is standard for many MERN tutorials
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})