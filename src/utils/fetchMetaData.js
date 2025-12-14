/* import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'

export const fetchMetadata = async (url) => {
  let name = ''
  let imageUrl = ''
  let rating = null
  let price = null
  let priceWhole = 0
  let priceFraction = 0

  let browser

  try {
    // OPTIONAL: If you don't actually need fetch, you can remove this
    await fetch(url)

    browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    })

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

    // Cookie banner (safe to ignore if not present)
    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', {
        timeout: 5000
      })
      await page.click('#onetrust-accept-btn-handler')
      await page.waitForTimeout(1000)
    } catch {
      // No cookie banner found
    }

    const html = await page.content()
    const $ = cheerio.load(html)

    name = $('h1').first().text().trim() || ''
    const colonIndex = name.indexOf(':')
    if (colonIndex !== -1) {
      name = name.slice(0, colonIndex).trim()
    }

    imageUrl = $('img.a-dynamic-image').first().attr('src') || ''

    const ratingText = $('span.a-icon-alt, .rating').first().text().trim()
    rating = ratingText ? parseFloat(ratingText) : null

    const rawWhole = $('span.a-price-whole').first().text().trim() || '0'
    const rawFraction = $('span.a-price-fraction').first().text().trim() || '00'

    priceWhole = Number(rawWhole.replace(/[^\d]/g, ''))
    priceFraction = Number(rawFraction.replace(/[^\d]/g, ''))

    price = parseFloat(
      `${priceWhole}.${priceFraction.toString().padStart(2, '0')}`
    )
  } catch (error) {
    console.error('fetchMetadata error:', error)
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  return { name, imageUrl, rating, price, priceWhole, priceFraction }
}
 */
