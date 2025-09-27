import cron from 'node-cron'
import { cleanupFavourites } from '../../src/api/controllers/products.js'
import { scrapeProducts } from '../../scraper.js'

cron.schedule('0 2 * * *', async () => {
  try {
    await scrapeProducts()
    console.log('Products scraped and saved successfully!')

    await cleanupFavourites()
    console.log('Favourites cleaned successfully!')
  } catch (err) {
    console.error('Scheduled job error:', err)
  }
})
