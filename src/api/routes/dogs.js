import express from 'express'
import { isAdmin } from '../../middlewares/adminAuth.js'
import { getDogs, getDogById, saveDog, deleteDog } from '../controllers/dogs.js'

const dogsRouter = express.Router()

dogsRouter.get('/', getDogs)
dogsRouter.get('/:id', getDogById)
dogsRouter.post('/save', isAdmin, saveDog)
dogsRouter.delete('/:id', isAdmin, deleteDog)

export default dogsRouter