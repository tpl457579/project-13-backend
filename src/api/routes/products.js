import express from 'express'
import { isAuth } from '../../middlewares/auth.js'
import { isAdmin } from '../../middlewares/adminAuth.js'
import { chromium } from 'playwright'
import {
  saveProduct,
  getProducts,
  getProductById,
  deleteProduct
} from '../controllers/products.js'

const productsRouter = express.Router()

productsRouter.post('/fetch-metadata', async (req, res) => {
  const url = req.body?.url?.trim()
  if (!url) return res.status(400).json({ error: 'URL is required' })

  let browser
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    })
    const page = await context.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

    try {
      await page.click('#onetrust-accept-btn-handler', { timeout: 5000 })
    } catch {}

    const name =
      (await page.textContent('h1'))?.trim() || (await page.title()) || ''
    const imageUrl =
      (await page.getAttribute('#landingImage', 'src')) ||
      (await page.getAttribute('#landingImage', 'data-old-hires')) ||
      (await page.getAttribute('#imgTagWrapperId img', 'src')) ||
      ''
    let price = null
    const priceText =
      (await page.textContent('.a-price .a-offscreen')) ||
      (await page.textContent('#priceblock_ourprice')) ||
      (await page.textContent('#priceblock_dealprice')) ||
      null
    if (priceText)
      price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'))

    res.json({ name, imageUrl, price })
  } catch (err) {
    console.error('Metadata error:', err)
    res.status(500).json({ error: 'Failed to fetch metadata' })
  } finally {
    if (browser) await browser.close()
  }
})

productsRouter.get('/', getProducts)
productsRouter.get('/:id', getProductById)
productsRouter.post('/save', isAuth, isAdmin, saveProduct)
productsRouter.put('/save/:id', isAuth, isAdmin, saveProduct)
productsRouter.delete('/delete/:id', isAuth, isAdmin, deleteProduct)

export default productsRouter
