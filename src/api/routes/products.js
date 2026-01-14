import express from 'express'
import { isAuth } from '../../middlewares/auth.js'
import { isAdmin } from '../../middlewares/adminAuth.js'
import {
  saveProduct,
  getProducts,
  getProductById,
  deleteProduct,
  fetchMetadata
} from '../controllers/products.js'

const productsRouter = express.Router()

productsRouter.post('/fetch-metadata', fetchMetadata)

productsRouter.get('/', getProducts)
productsRouter.get('/:id', getProductById)
productsRouter.post('/save', isAuth, isAdmin, saveProduct)
productsRouter.put('/save/:id', isAuth, isAdmin, saveProduct)
productsRouter.delete('/:id', isAuth, isAdmin, deleteProduct)

export default productsRouter
