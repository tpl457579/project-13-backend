import express from 'express'
// Keep the import, but we'll be careful with the usage below
import { isAdmin } from '../../middlewares/adminAuth.js' 
import { getCats, getCatById, saveCat, deleteCat } from '../controllers/cats.js'

const catsRouter = express.Router()

// Public routes
catsRouter.get('/', getCats)
catsRouter.get('/:id', getCatById)

// Protected routes 
// TIP: If you get "Unauthorized" in the frontend, check the isAdmin middleware logic
catsRouter.post('/save', isAdmin, saveCat) 
catsRouter.delete('/:id', isAdmin, deleteCat)

export default catsRouter