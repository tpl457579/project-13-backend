import express from 'express'
import { isAuth } from '../../middlewares/auth.js'
import { isAdmin } from '../../middlewares/adminAuth.js'
import {
  saveProduct,
  getProducts,
  getProductById,
  deleteProduct
} from '../controllers/products.js'

import axios from 'axios'
import * as cheerio from 'cheerio'

const productsRouter = express.Router()

// Metadata scraping route
productsRouter.post('/fetch-metadata', async (req, res) => {
  console.log('Incoming headers:', req.headers)
  console.log('Incoming body:', req.body)
  const url = req.body?.url?.trim()
  if (!url) return res.status(400).json({ error: 'URL is required' })

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      }
    })

    const html = response.data
    const $ = cheerio.load(html)

    const name = $('h1').first().text().trim() || $('title').text().trim() || ''
    const imageUrl =
      $('#landingImage').attr('src') ||
      $('#landingImage').attr('data-old-hires') ||
      $('#imgTagWrapperId img').attr('src') ||
      ''
    let price = null
    const priceText =
      $('.a-price .a-offscreen').first().text().trim() ||
      $('#priceblock_ourprice').text().trim() ||
      $('#priceblock_dealprice').text().trim() ||
      null

    if (priceText) {
      price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'))
    }
    let rating = null
    const ratingText = $('.a-icon-alt').first().text().trim()
    if (ratingText) {
      rating = parseFloat(ratingText.replace(/[^\d.]/g, ''))
    }

    res.json({ name, imageUrl, price, rating })
  } catch (err) {
    console.error('Metadata error:', err)
    res.status(500).json({ error: 'Failed to fetch metadata' })
  }
})

// Product CRUD routes
productsRouter.get('/', getProducts)
productsRouter.get('/:id', getProductById)
productsRouter.post('/save', saveProduct)
productsRouter.put('/save/:id', saveProduct)
productsRouter.delete('/:id', isAuth, isAdmin, deleteProduct)

export default productsRouter
