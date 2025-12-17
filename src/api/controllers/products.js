import Product from '../models/products.js'
import User from '../models/users.js'
import { cloudinary } from '../../middlewares/file.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export const fetchMetadata = async (req, res) => {
  const { url } = req.body
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
    const ratingText = $('span.a-icon-alt').first().text().trim()
    if (ratingText) {
      const parsed = parseFloat(ratingText)
      if (!isNaN(parsed)) rating = parsed
    }

    res.json({ name, imageUrl, price, rating })
  } catch (err) {
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
