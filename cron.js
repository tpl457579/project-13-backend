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
      console.log(`[${new Date().toISOString()}] Running scrapeProducts`)
      await scrapeProducts()
      console.log('scrapeProducts completed')
    } catch (err) {
      console.error('scrapeProducts failed:', err.message)
    }
  })()
})

cron.schedule('0 4 * * *', () => {
  ;(async () => {
    try {
      console.log(`[${new Date().toISOString()}] Running cleanupFavourites`)
      await cleanupFavourites()
      console.log('cleanupFavourites completed')
    } catch (err) {
      console.error('cleanupFavourites failed:', err.message)
    }
  })()
})

console.log('Cron jobs scheduled for 2AM and 4AM')
process.stdin.resume()
