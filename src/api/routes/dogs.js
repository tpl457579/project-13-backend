import express from 'express'
import { getDogs, getDogById, saveDog, deleteDog } from '../controllers/dogs.js'

const router = express.Router()

router.get('/dogs', getDogs)
router.get('/dogs/:id', getDogById)
router.post('/dogs', saveDog)
router.delete('/dogs/:id', deleteDog)


export default router
