import 'dotenv/config'
import puppeteer from 'puppeteer'
import mongoose from 'mongoose'
import Product from '../api/models/products.js'
import { cloudinary } from '../middlewares/file.js'
import * as cheerio from 'cheerio'

export const scrapeProducts = async () => {
  console.log('🚀 Scrape started...')

  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected to MongoDB')

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  })

  try {
    const url = 'https://www.amazon.ie/s?k=dog+toys&crid=2MQ7LPZESCJQJ&sprefix=dog+%2Caps%2C975&ref=nb_sb_ss_i_2_4'
    console.log(`📡 Navigating to: ${url}`)
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

    // Check if we hit a Bot Block
    const pageTitle = await page.title()
    console.log(`📄 Page Title: "${pageTitle}"`)
    if (pageTitle.includes('Robot Check')) {
      console.error('❌ BLOCKED: Amazon is showing a CAPTCHA/Robot Check page.')
    }

    try {
      const cookieButton = '#sp-cc-accept'; 
      await page.waitForSelector(cookieButton, { timeout: 5000 });
      await page.click(cookieButton);
      console.log('🍪 Amazon cookie banner cleared');
    } catch {
      console.log('ℹ️ No cookie banner found (or already cleared)');
    }

    await new Promise(r => setTimeout(r, 2000));

    const html = await page.content()
    console.log(`📊 HTML Content Length: ${html.length} bytes`)
    
    const $ = cheerio.load(html)
    const products = []

    const searchResults = $('div[data-component-type="s-search-result"]')
    console.log(`🔎 Found ${searchResults.length} search result containers on page`)

    searchResults.each((_, el) => {
      const asin = $(el).attr('data-asin')
      const name = $(el).find('h2 span').text().trim()
      
      if (!asin || !name) return;

      const rawUrl = $(el).find('a.a-link-normal.s-no-outline').attr('href')
      const productUrl = rawUrl?.startsWith('http') ? rawUrl : `https://www.amazon.ie${rawUrl}`
      const imageUrl = $(el).find('img.s-image').attr('src')
      const ratingText = $(el).find('span.a-icon-alt').first().text().trim()

      const rawWhole = $(el).find('span.a-price-whole').text().trim()
      const rawFraction = $(el).find('span.a-price-fraction').text().trim()
      
      const cleanWhole = rawWhole.replace(/[^\d]/g, '') || '0'
      const cleanFraction = rawFraction.replace(/[^\d]/g, '') || '00'
      const price = parseFloat(`${cleanWhole}.${cleanFraction.toString().padStart(2, '0')}`)
      
      products.push({
        asin,
        name,
        productUrl,
        imageUrl,
        rating: ratingText ? parseFloat(ratingText) : null,
        price,
        priceWhole: Number(cleanWhole),
        priceFraction: Number(cleanFraction)
      })
    });

    console.log(`📦 Processed ${products.length} products. Starting Database/Cloudinary sync...`)

    for (const p of products) {
      try {
        const existing = await Product.findOne({ asin: p.asin })

        if (existing) {
          console.log(`Syncing existing product: ${p.asin}`)
          existing.name = p.name
          existing.url = p.productUrl
          existing.price = p.price
          existing.priceWhole = p.priceWhole
          existing.priceFraction = p.priceFraction
          existing.rating = p.rating
          existing.lastUpdated = new Date()
          await existing.save()
          continue
        }

        console.log(`Uploading image for NEW product: ${p.name.substring(0, 20)}...`)
        const uploadRes = await cloudinary.uploader.upload(p.imageUrl, {
          folder: 'products',
          overwrite: false,
          invalidate: true
        })

        const productDoc = new Product({
          ...p,
          imageUrl: uploadRes.secure_url,
          imagePublicId: uploadRes.public_id,
          lastUpdated: new Date()
        })

        await productDoc.save()
        console.log(`✅ Saved new product: ${p.asin}`)
      } catch (err) {
        console.error(`⚠️ Error saving ${p.asin}:`, err.message)
      }
    }
  } catch (err) {
    console.error('🚨 Scrape error:', err.message)
  } finally {
    await browser.close()
    console.log('🏁 Scrape finished, Browser closed')
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeProducts()
    .then(() => {
      console.log('✨ Success!')
      process.exit(0)
    })
    .catch((err) => {
      console.error('🔥 Failed:', err)
      process.exit(1)
    })
}