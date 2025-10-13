import 'dotenv/config'
import cron from 'node-cron'
import mongoose from 'mongoose'
import { scrapeProducts } from './scraper.js'
import { cleanupFavourites } from './src/api/controllers/products.js'

console.log('Connecting to MongoDB...')
await mongoose.connect(process.env.MONGO_URI)
console.log('Connected to MongoDB')

cron.schedule('0 2 * * *', () => {
  ;(async () => {
    try {
      console.log(`[${new Date().toISOString()}] Running scheduled tasks...`)
      await scrapeProducts()
      await cleanupFavourites()
      console.log('Tasks completed')
    } catch (err) {
      console.error('Tasks failed:', err.message)
    }
  })()
})

console.log('Cron job scheduled to run at 2:00 AM daily')
setInterval(() => {}, 1000 * 60 * 60)
