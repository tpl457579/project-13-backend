import express from 'express'
import { addDog, listDogs } from '../controllers/dogs.js'

const router = express.Router()

router.post('/add', addDog)
router.get('/', listDogs)

export default router
