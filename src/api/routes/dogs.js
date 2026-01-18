import express from 'express'
import { isAdmin } from '../../middlewares/adminAuth.js'
import { getDogs, getDogById, saveDog, deleteDog } from '../controllers/dogs.js'

const router = express.Router()

router.get('/', getDogs)
router.get('/:id', getDogById)
router.post('/add', isAdmin, saveDog)
router.delete('/:id', isAdmin, deleteDog)

export default router
