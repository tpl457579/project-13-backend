import express from 'express'
import { isAdmin } from '../../middlewares/adminAuth.js'
import { getDogs, getDogById, saveDog, deleteDog } from '../controllers/dogs.js'

const dogsRouter = express.Router()

router.get('/dogs', getDogs)
router.get('/:id', getDogById)
router.post('/save', isAdmin, saveDog)
router.delete('/:id', isAdmin, deleteDog)

export default dogsRouter