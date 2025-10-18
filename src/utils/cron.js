import 'dotenv/config'
import cron from 'node-cron'
import mongoose from 'mongoose'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { scrapeProducts } from './scraper.js'
import { cleanupFavourites } from '../api/controllers/products.js'

const transport = new DailyRotateFile({
  filename: 'logs/cron-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '31d'
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [new winston.transports.Console(), transport]
})

logger.info('Connecting to MongoDB...')
await mongoose.connect(process.env.MONGO_URI)
logger.info('Connected to MongoDB')

cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Running scrapeProducts...')
    await scrapeProducts()
    logger.info('scrapeProducts completed successfully.')
  } catch (err) {
    logger.error(`scrapeProducts failed: ${err.message}`)
  }
})

cron.schedule('0 4 * * *', async () => {
  try {
    logger.info('Running cleanupFavourites...')
    await cleanupFavourites()
    logger.info('cleanupFavourites completed successfully.')
  } catch (err) {
    logger.error(`cleanupFavourites failed: ${err.message}`)
  }
})

logger.info('Cron jobs scheduled for 2AM and 4AM')
process.stdin.resume()
