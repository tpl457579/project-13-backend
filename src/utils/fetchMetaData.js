import { chromium } from 'playwright'

export const fetchMetadata = async (url) => {
  const browser = await chromium.launch({ headless: true })
  let name = ''
  let imageUrl = ''
  let price = null

  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    })

    const page = await context.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

    try {
      await page.click('#onetrust-accept-btn-handler', { timeout: 5000 })
    } catch {}

    await page.waitForSelector('h1', { timeout: 10000 })

    name = (await page.textContent('h1'))?.trim() || ''

    imageUrl =
      (await page.getAttribute('#imgTagWrapperId img', 'src')) ||
      (await page.getAttribute('#landingImage', 'src')) ||
      (await page.getAttribute('#imgTagWrapperId img', 'data-old-hires')) ||
      (await page.getAttribute('#landingImage', 'data-old-hires')) ||
      ''

    const priceText =
      (await page.textContent('.a-price .a-offscreen')) ||
      (await page.textContent('#priceblock_ourprice')) ||
      (await page.textContent('#priceblock_dealprice')) ||
      (await page.textContent('#priceblock_saleprice')) ||
      null

    if (priceText) {
      price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'))
    }
  } finally {
    await browser.close()
  }

  return { name, imageUrl, price }
}
