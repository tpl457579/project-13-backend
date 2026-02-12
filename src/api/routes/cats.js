import express from 'express'
import { isAdmin } from '../../middlewares/adminAuth.js'
import { getCats, getCatById, saveCat, deleteCat } from '../controllers/cats.js'

const catsRouter = express.Router()

catsRouter.get('/', getCats)
catsRouter.get('/:id', getCatById)
catsRouter.post('/save', isAdmin, saveCat)
catsRouter.delete('/:id', isAdmin, deleteCat)

export default catsRouter