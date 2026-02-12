
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import Product from '../api/models/products.js'
import { cloudinary } from '../middlewares/file.js'
import * as cheerio from 'cheerio'

puppeteer.use(StealthPlugin())

const SCRAPE_CONFIG = [
  {
    category: 'Toys',
    baseUrl: 'https://www.amazon.ie/s?k=dog+toys',
    pages: 5
  },
  {
    category: 'Food',
    baseUrl: 'https://www.amazon.ie/s?i=pets&rh=n%3A80928622031%2Cn%3A94832582031%2Cn%3A94832596031%2Cp_36%3A95174108031&s=popularity-rank',
    pages: 5
  }
]

export const scrapeProducts = async () => {
  console.log('Starting Scrape: 5 Pages per Category (Organic Only)...')

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    for (const config of SCRAPE_CONFIG) {
      console.log(`Category: ${config.category}`)

      for (let i = 1; i <= config.pages; i++) {
        const url = `${config.baseUrl}&page=${i}`
        console.log(`[${config.category}] Page ${i} -> ${url}`)

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

        if (config === SCRAPE_CONFIG[0] && i === 1) {
          try {
            const cookieButton = '#sp-cc-accept'
            await page.waitForSelector(cookieButton, { timeout: 4000 })
            await page.click(cookieButton)
            console.log('Cookies Accepted')
          } catch (e) {}
        }

        await page.evaluate(() => window.scrollBy(0, window.innerHeight))
        await new Promise(r => setTimeout(r, 2000))

        const html = await page.content()
        const $ = cheerio.load(html)
        const items = []

        $('div[data-component-type="s-search-result"]').each((_, el) => {
          const isSponsored = $(el).find('.puis-sponsored-label-text, .s-sponsored-label-text').length > 0
          if (isSponsored) return

          const asin = $(el).attr('data-asin')
          const name = $(el).find('h2 span').first().text().trim()
          if (!asin || !name) return

          const rawUrl = $(el).find('a.a-link-normal.s-no-outline').attr('href')
          const imageUrl = $(el).find('img.s-image').attr('src')

          const ratingText = $(el).find('span.a-icon-alt').first().text().trim()
          const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : null

          const rawWhole = $(el).find('span.a-price-whole').text().trim()
          const rawFraction = $(el).find('span.a-price-fraction').text().trim()
          const cleanWhole = rawWhole.replace(/[^\d]/g, '') || '0'
          const cleanFraction = rawFraction.replace(/[^\d]/g, '') || '00'

          items.push({
            asin,
            name,
            url: `https://www.amazon.ie${rawUrl}`,
            imageUrl,
            rating,
            priceWhole: Number(cleanWhole),
            priceFraction: Number(cleanFraction),
            price: parseFloat(`${cleanWhole}.${cleanFraction.padStart(2, '0')}`),
            category: config.category
          })
        })

        console.log(`Page ${i}: Found ${items.length} organic items.`)

        for (const p of items) {
          try {
            const existing = await Product.findOne({ asin: p.asin })

            if (existing) {
              const imageChanged = p.imageUrl !== existing.lastScrapedImageUrl

              if (imageChanged) {
                console.log(`Image changed for ${p.asin}. Re-uploading...`)
                const uploadRes = await cloudinary.uploader.upload(p.imageUrl, {
                  folder: 'products',
                  public_id: existing.imagePublicId,
                  overwrite: true
                })
                p.imageUrl = uploadRes.secure_url
              } else {
                p.imageUrl = existing.imageUrl
              }

              const sourceUrl = p.imageUrl === existing.imageUrl ? existing.lastScrapedImageUrl : p.imageUrl

              Object.assign(existing, p)
              existing.lastScrapedImageUrl = sourceUrl
              existing.lastUpdated = new Date()
              await existing.save()
            } else {
              console.log(`New product: ${p.asin}`)
              const uploadRes = await cloudinary.uploader.upload(p.imageUrl, { folder: 'products' })

              const newProduct = new Product({
                ...p,
                imageUrl: uploadRes.secure_url,
                imagePublicId: uploadRes.public_id,
                lastScrapedImageUrl: p.imageUrl
              })
              await newProduct.save()
            }
          } catch (err) {
            console.error(`DB Error for ${p.asin}:`, err.message)
          }
        }

        await new Promise(r => setTimeout(r, Math.floor(Math.random() * 2000) + 1000))
      }
    }

    await browser.close()
    console.log('Scrape Complete!')
  } catch (err) {
    console.error('Scraper Error:', err.message)
  }
}
