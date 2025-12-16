import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

/* export const scrapeSingle = async (productUrl) => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  })

  try {
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 60000 })
    const html = await page.content()
    const $ = cheerio.load(html)

    const name = $('h1').first().text().trim() || $('title').text().trim() || ''
    const imageUrl =
      $('#landingImage').attr('src') ||
      $('#landingImage').attr('data-old-hires') ||
      $('#imgTagWrapperId img').attr('src') ||
      ''
    const priceText =
      $('.a-price .a-offscreen').first().text().trim() ||
      $('#priceblock_ourprice').text().trim() ||
      $('#priceblock_dealprice').text().trim() ||
      null
    const price = priceText
      ? parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'))
      : null

    const ratingText = $('span.a-icon-alt').first().text().trim()
    const rating = ratingText
      ? parseFloat(ratingText.replace(/[^0-9.]/g, ''))
      : null

    return { name, imageUrl, price, rating, url: productUrl }
  } finally {
    await browser.close()
  }
}
 */
