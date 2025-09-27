import express from 'express'
import { isAuth } from '../../middlewares/auth.js'
import { isAdmin } from '../../middlewares/adminAuth.js'
import uploadImage from '../../middlewares/file.js'
import { scrapeProducts } from '../../../scraper.js'
import { saveProduct } from '../controllers/products.js'

import {
  getProducts,
  getProductById,
  deleteProduct
} from '../controllers/products.js'

const productsRouter = express.Router()
productsRouter.get('/scrape', isAuth, isAdmin, scrapeProducts)

productsRouter.get('/', getProducts)
productsRouter.get('/:id', getProductById)

productsRouter.post(
  '/save',
  isAuth,
  isAdmin,
  uploadImage.single('image'),
  saveProduct
)
productsRouter.put(
  '/save/:id',
  isAuth,
  isAdmin,
  uploadImage.single('image'),
  saveProduct
)
productsRouter.delete('/delete/:id', isAuth, isAdmin, deleteProduct)

export default productsRouter
