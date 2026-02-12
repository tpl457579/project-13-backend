import 'dotenv/config'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import mongoose from 'mongoose'
import Product from '../api/models/products.js'
import fs from 'fs'
import path from 'path'
import { cloudinary } from '../middlewares/file.js'
import * as cheerio from 'cheerio'

puppeteer.use(StealthPlugin())

const SCRAPE_CONFIG = [
  { category: 'Toys', petType: 'dog', baseUrl: 'https://www.amazon.ie/s?k=dog+toys', pages: 3 },
  { category: 'Food', petType: 'dog', baseUrl: 'https://www.amazon.ie/s?k=dog+food', pages: 3 },
  { category: 'Clothing', petType: 'dog', baseUrl: 'https://www.amazon.ie/s?k=dog+clothing', pages: 3 },
  { category: 'Toys', petType: 'cat', baseUrl: 'https://www.amazon.ie/s?k=cat+toys', pages: 3 },
  { category: 'Food', petType: 'cat', baseUrl: 'https://www.amazon.ie/s?k=cat+food', pages: 3 },
  { category: 'Clothing', petType: 'cat', baseUrl: 'https://www.amazon.ie/s?k=cat+clothing', pages: 3 }
]

export const scrapeProducts = async () => {
  const stats = { new: 0, updated: 0, skipped: 0, errors: 0 }
  const startTime = Date.now()
  
  try {
    await mongoose.connect(process.env.MONGO_URI)


// ... inside your scrape function
const getExecutablePath = () => {
  // 1. Check if the env var works first
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  // 2. Fallback: Search the Render cache directory for any chrome executable
  const baseCache = '/opt/render/.cache/puppeteer/chrome';
  if (fs.existsSync(baseCache)) {
    const files = fs.readdirSync(baseCache, { recursive: true });
    const chromeRelPath = files.find(f => f.endsWith('chrome-linux64/chrome'));
    if (chromeRelPath) return path.join(baseCache, chromeRelPath);
  }

  return null; 
};

const browser = await puppeteer.launch({
  executablePath: getExecutablePath(),
  headless: "new",
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
    
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    for (const config of SCRAPE_CONFIG) {
      console.log(`🚀 Starting: ${config.petType} ${config.category}`)

      for (let i = 1; i <= config.pages; i++) {
        const url = `${config.baseUrl}&page=${i}`
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

        if (i === 1) {
          try {
            await page.waitForSelector('#sp-cc-accept', { timeout: 3000 })
            await page.click('#sp-cc-accept')
          } catch (e) {}
        }

        await page.evaluate(() => window.scrollBy(0, window.innerHeight))
        await new Promise(r => setTimeout(r, 2000))

        const html = await page.content()
        const $ = cheerio.load(html)
        const items = []

        $('div[data-component-type="s-search-result"]').each((_, el) => {
          if ($(el).find('.puis-sponsored-label-text, .s-sponsored-label-text').length > 0) return 

          const asin = $(el).attr('data-asin')
          const name = $(el).find('h2 span').first().text().trim()
          if (!asin || !name) return

          const ratingText = $(el).find('span.a-icon-alt').first().text().trim()
          const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : null

          const rawWhole = $(el).find('span.a-price-whole').text().trim()
          const rawFraction = $(el).find('span.a-price-fraction').text().trim()
          const cleanWhole = rawWhole.replace(/[^\d]/g, '') || '0'
          const cleanFraction = rawFraction.replace(/[^\d]/g, '') || '00'

          items.push({
            asin,
            name,
            url: `https://www.amazon.ie${$(el).find('a.a-link-normal.s-no-outline').attr('href')}`,
            imageUrl: $(el).find('img.s-image').attr('src'),
            rating,
            price: parseFloat(`${cleanWhole}.${cleanFraction.padStart(2, '0')}`),
            category: config.category,
            petType: config.petType
          })
        })

        for (const p of items) {
          try {
            const existing = await Product.findOne({ asin: p.asin });

            if (existing) {
              const needsUpdate = existing.price !== p.price || 
                                  existing.petType !== p.petType || 
                                  !existing.category;

              if (needsUpdate) {
                await Product.updateOne({ asin: p.asin }, { ...p, lastUpdated: new Date() });
                stats.updated++;
              } else {
                stats.skipped++;
              }
            } else {
              const uploadRes = await cloudinary.uploader.upload(p.imageUrl, { folder: 'products' });
              await Product.create({ 
                ...p, 
                imageUrl: uploadRes.secure_url, 
                imagePublicId: uploadRes.public_id,
                lastScrapedImageUrl: p.imageUrl 
              });
              stats.new++;
            }
          } catch (err) {
            stats.errors++;
          }
        }
        await new Promise(r => setTimeout(r, 1000))
      }
    }

    await browser.close()
  } catch (err) {
    console.error('🚨 Fatal:', err.message)
  } finally {
    console.log('--- Final Summary ---')
    console.log(`New: ${stats.new} | Updated: ${stats.updated} | Errors: ${stats.errors}`)
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
  }
}

scrapeProducts().then(() => process.exit(0))