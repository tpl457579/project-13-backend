import Product from '../models/products.js'
import User from '../models/users.js'
import { cloudinary } from '../../middlewares/file.js'
import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

// Express route handler: POST /products/scrape-single
export const scrapeSingle = async (req, res) => {
  const { url } = req.body
  console.log('Incoming scrape request:', req.body) // <-- log body
  if (!url) return res.status(400).json({ error: 'URL is required' })

  let browser
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    })

    console.log('Navigating to:', url)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

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

    console.log({ name, imageUrl, price, rating })
    res.json({ name, imageUrl, price, rating, url })
  } catch (err) {
    console.error('Scrape error:', err)
    res
      .status(500)
      .json({ error: 'Failed to scrape product', details: err.message })
  } finally {
    if (browser) await browser.close()
  }
}

export const getProducts = async (req, res) => {
  try {
    const { size, maxPrice, minRating } = req.query
    const query = {}

    if (size) query.size = size
    if (maxPrice) query.price = { $lte: Number(maxPrice) }
    if (minRating) query.rating = { $gte: Number(minRating) }

    const products = await Product.find(query)
    res.json(products)
  } catch (err) {
    console.error('Scrape error:', err) // <-- log full error
    res
      .status(500)
      .json({ error: 'Failed to scrape product', details: err.message })
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.status(200).json(product)
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch product', error: err.message })
  }
}

export const saveProduct = async (req, res) => {
  try {
    const { _id, name, price, description, imageUrl, publicId, url, rating } =
      req.body
    let product

    if (_id) {
      product = await Product.findByIdAndUpdate(
        _id,
        {
          name,
          price,
          description,
          imageUrl,
          imagePublicId: publicId,
          url,
          rating
        },
        { new: true }
      )
    } else {
      product = new Product({
        name,
        price,
        description,
        imageUrl,
        imagePublicId: publicId,
        url,
        rating
      })
      await product.save()
    }

    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ product })
  } catch (err) {
    console.error('Save product error:', err)
    res
      .status(500)
      .json({ error: 'Failed to save product', details: err.message })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId)
    }

    await product.deleteOne()
    res.status(200).json({ message: 'Product and image deleted successfully' })
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to delete product', error: err.message })
  }
}

export const cleanupFavourites = async () => {
  const users = await User.find()
  for (const user of users) {
    const validIds = await Promise.all(
      user.favourites.map(async (favId) => {
        const exists = await Product.exists({ _id: favId })
        return exists ? favId : null
      })
    )
    const filtered = validIds.filter(Boolean)
    if (filtered.length !== user.favourites.length) {
      user.favourites = filtered
      await user.save()
    }
  }
}
