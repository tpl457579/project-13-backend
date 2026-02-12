import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './src/config/db.js'

const app = express()

// WAIT for DB connection BEFORE anything else
await connectDB()

// Load cron AFTER DB is connected
import './src/utils/cron.js'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
)

import productsRouter from './src/api/routes/products.js'
import usersRouter from './src/api/routes/users.js'
import dogsRouter from './src/api/routes/dogs.js'
import catsRouter from './src/api/routes/cats.js'

app.use('/api/v1/products', productsRouter)
console.log('USING PRODUCTS ROUTER')

app.use('/api/v1/users', usersRouter)
app.use('/api/v1/dogs', dogsRouter)
app.use('/api/v1/cats', catsRouter)

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
