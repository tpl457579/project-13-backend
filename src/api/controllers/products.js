import Product from '../models/products.js'
import User from '../models/users.js'
import { cloudinary } from '../../middlewares/file.js'
import {
  extractPublicId,
  uploadImageFromUrl
} from '../../utils/cloudinaryHelper.js'

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
    const { id, name, price, description, imageUrl, publicId } = req.body

    let product

    if (id) {
      product = await Product.findById(id)
      if (!product)
        return res.status(404).json({ message: 'Product not found' })

      if (imageUrl && publicId && product.imagePublicId !== publicId) {
        if (product.imagePublicId) {
          await cloudinary.uploader.destroy(product.imagePublicId)
        }
        product.imageUrl = imageUrl
        product.imagePublicId = publicId
      }

      product.name = name ?? product.name
      product.price = price ?? product.price
      product.description = description ?? product.description

      await product.save()
    } else {
      product = await Product.create({
        name,
        price,
        description,
        imageUrl,
        imagePublicId: publicId
      })
    }

    res.status(200).json({ message: 'Product saved', product })
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to save product', error: err.message })
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
