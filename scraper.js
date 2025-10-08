import puppeteer from 'puppeteer'
import mongoose from 'mongoose'
import Product from './src/api/models/products.js'
import { cloudinary } from './src/middlewares/file.js'
import * as cheerio from 'cheerio'
import 'dotenv/config'

await mongoose.connect(process.env.MONGO_URI)

export const scrapeProducts = async () => {
  console.log('Scrape started...')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    defaultViewport: { width: 1366, height: 900 }
  })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  })

  try {
    const url =
      'https://www.amazon.ie/s?k=dog+toys&crid=2MQ7LPZESCJQJ&sprefix=dog+%2Caps%2C975&ref=nb_sb_ss_i_2_4'
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', {
        timeout: 5000
      })
      await page.click('#onetrust-accept-btn-handler')
      await page.waitForTimeout(1000)
    } catch {
      console.log('No cookie banner found')
    }

    console.log('Scraping first page...')

    const html = await page.content()
    const $ = cheerio.load(html)

    const products = []
    $('div[data-component-type="s-search-result"]').each((_, el) => {
      const asin = $(el).attr('data-asin')
      const name = $(el).find('h2 span').text().trim()

      const rawUrl = $(el).find('a.a-link-normal.s-no-outline').attr('href')
      const productUrl = rawUrl?.startsWith('http')
        ? rawUrl
        : rawUrl
        ? `https://www.amazon.ie${rawUrl}`
        : null

      const imageUrl = $(el).find('img.s-image').attr('src')
      const ratingText = $(el).find('span.a-icon-alt').text().trim()

      const rawWhole = $(el).find('span.a-price-whole').text().trim()
      const rawFraction = $(el).find('span.a-price-fraction').text().trim()

      const cleanWhole = rawWhole.replace(/[^\d]/g, '') || '0'
      const cleanFraction = rawFraction.replace(/[^\d]/g, '') || '00'

      const priceWhole = Number(cleanWhole)
      const priceFraction = Number(cleanFraction)
      const price = parseFloat(
        `${priceWhole}.${priceFraction.toString().padStart(2, '0')}`
      )

      const rating = ratingText ? parseFloat(ratingText) : null

      products.push({
        asin,
        name,
        productUrl,
        imageUrl,
        rating,
        price,
        priceWhole,
        priceFraction
      })
    })

    for (const p of products) {
      try {
        const existing = await Product.findOne({ asin: p.asin })

        if (existing) {
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

        const uploadRes = await cloudinary.uploader.upload(p.imageUrl, {
          folder: 'products',
          overwrite: false,
          invalidate: true
        })

        const productDoc = new Product({
          asin: p.asin,
          name: p.name,
          url: p.productUrl,
          imageUrl: uploadRes.secure_url,
          imagePublicId: uploadRes.public_id,
          rating: p.rating,
          price: p.price,
          priceWhole: p.priceWhole,
          priceFraction: p.priceFraction,
          lastUpdated: new Date()
        })

        await productDoc.save()
      } catch (err) {
        console.error(`Error saving ${p.name}:`, err.message)
      }
    }
  } catch (err) {
    console.error('Scrape error:', err.message)
  } finally {
    await browser.close()
    console.log('Scrape finished, DB connection closed')
  }
}
