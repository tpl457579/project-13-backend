import express from 'express'
import { isAuth } from '../../middlewares/auth.js'
import { isAdmin } from '../../middlewares/adminAuth.js'
import {
  saveProduct,
  getProducts,
  getProductById,
  deleteProduct
} from '../controllers/products.js'

const productsRouter = express.Router()

import axios from 'axios'
import * as cheerio from 'cheerio'

productsRouter.post('/fetch-metadata', async (req, res) => {
  console.log('Incoming body:', req.body)
  const url = req.body?.url?.trim()
  if (!url) return res.status(400).json({ error: 'URL is required' })

  try {
    // Fetch the HTML
    const response = await axios.get(url, {
      headers: {
        // Pretend to be a browser
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      }
    })

    const html = response.data
    const $ = cheerio.load(html)

    // Extract product name
    const name = $('h1').first().text().trim() || $('title').text().trim() || ''

    // Extract image URL
    const imageUrl =
      $('#landingImage').attr('src') ||
      $('#landingImage').attr('data-old-hires') ||
      $('#imgTagWrapperId img').attr('src') ||
      ''

    // Extract price
    let price = null
    const priceText =
      $('.a-price .a-offscreen').first().text().trim() ||
      $('#priceblock_ourprice').text().trim() ||
      $('#priceblock_dealprice').text().trim() ||
      null

    if (priceText) {
      price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'))
    }

    res.json({ name, imageUrl, price })
  } catch (err) {
    console.error('Metadata error:', err)
    res.status(500).json({ error: 'Failed to fetch metadata' })
  }
})

productsRouter.get('/', getProducts)
productsRouter.get('/:id', getProductById)
productsRouter.post('/save', isAuth, isAdmin, saveProduct)
productsRouter.put('/save/:id', isAuth, isAdmin, saveProduct)
productsRouter.delete('/delete/:id', isAuth, isAdmin, deleteProduct)

export default productsRouter
