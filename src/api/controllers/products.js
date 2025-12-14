import Product from '../models/products.js'
import User from '../models/users.js'
import { cloudinary } from '../../middlewares/file.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export const fetchMetadata = async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL is required' })

  try {
    // Fetch the HTML
    const response = await axios.get(url, {
      headers: {
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
    console.error('Fetch metadata error:', err)
    res
      .status(500)
      .json({ error: 'Failed to fetch metadata', details: err.message })
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
    res
      .status(500)
      .json({ message: 'Failed to fetch products', error: err.message })
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
  console.log('Received request body:', req.body)

  const { _id, name, price, description, imageUrl, publicId, url } = req.body

  if (!name || !price) {
    console.warn('Missing required fields:', { name, price })
    return res.status(400).json({ error: 'Name and price are required' })
  }

  try {
    let product
    if (_id) {
      console.log('Updating existing product with ID:', _id)
      product = await Product.findByIdAndUpdate(
        _id,
        { name, price, description, imageUrl, publicId, url },
        { new: true, runValidators: true }
      )
    } else {
      console.log('Creating new product')
      product = await Product.create({
        name,
        price: Number(price),
        description,
        imageUrl,
        publicId,
        url
      })
    }

    console.log('Product saved successfully:', product)
    res.json({ product })
  } catch (err) {
    console.error('Error saving product:', err)
    res.status(500).json({ error: 'Failed to save product' })
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
