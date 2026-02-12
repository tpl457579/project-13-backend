import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import { connectDB } from './src/config/db.js'
import productsRouter from './src/api/routes/products.js'
import usersRouter from './src/api/routes/users.js'
import dogsRouter from './src/api/routes/dogs.js'
import catsRouter from './src/api/routes/cats.js'

import './src/utils/cron.js'

const app = express()

// Connect to Database
connectDB()

// 1. CORS MUST be one of the first middlewares
app.use(
  cors({
    // REMOVED the trailing slash from the Netlify URL
    origin: ['http://localhost:5173', 'https://bejewelled-jelly-bcdcb3.netlify.app'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

// 2. Body Parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 3. Routes
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/dogs', dogsRouter)
app.use('/api/v1/cats', catsRouter)

app.get('/', (req, res) => {
  res.send('API is running')
})

// 4. Error Handling
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

// 5. Server Start
const PORT = process.env.PORT || 10000 
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`)
})