import 'dotenv/config'
import cron from 'node-cron'
import mongoose from 'mongoose'
import { scrapeProducts } from './scraper.js'
import { cleanupFavourites } from './src/api/controllers/products.js'

await mongoose.connect(process.env.MONGO_URI)

cron.schedule('0 2 * * *', async () => {
  try {
    console.log(`[${new Date().toISOString()}] Running scheduled tasks...`)
    await scrapeProducts()
    await cleanupFavourites()
    console.log('Scheduled tasks completed')
  } catch (err) {
    console.error('Cron job failed:', err.message)
  }
})
