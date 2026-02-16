import Cat from '../models/cats.js'
import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'

cloudinary.config({
  cloud_name: process.env.VITE_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const getCats = async (req, res) => {
  try {
    const cats = await Cat.find().sort({ name: 1 }).lean()

    const normalized = cats.map(cat => ({
      ...cat,
      _id: cat._id?.toString(),
      id: cat.id ?? cat._id?.toString(),
      childFriendly: Number(cat.childFriendly),
      dogFriendly: Number(cat.dogFriendly),
      grooming: Number(cat.grooming),
      energyLevel: Number(cat.energyLevel),
      strangerFriendly: Number(cat.strangerFriendly),
      affectionLevel: Number(cat.affectionLevel),
      sheddingLevel: Number(cat.sheddingLevel)
    }))

    res.json({ cats: normalized })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cats' })
  }
}

export const getCatFacts = async (req, res) => {
  try {
    const facts = await mongoose.connection.db
      .collection('cat_facts')
      .find()
      .toArray()

    res.status(200).json(facts)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facts', error: error.message })
  }
}

export const saveCat = async (req, res) => {
  try {
    const { _id, id, publicId, name, temperament, imageUrl, ...rest } = req.body

    const updateData = {
      ...rest,
      name: name?.trim(),
      imageUrl,
      temperament: Array.isArray(temperament)
        ? temperament.join(', ')
        : temperament,
      lastUpdated: Date.now()
    }

    if (_id || id) {
      const existingCat = await Cat.findOne({
        $or: [
          { _id: mongoose.isValidObjectId(_id) ? _id : null },
          { id }
        ]
      })

      if (existingCat?.publicId && existingCat.publicId !== publicId) {
        try {
          await cloudinary.uploader.destroy(existingCat.publicId)
        } catch {}
      }

      const updated = await Cat.findOneAndUpdate(
        { $or: [{ _id }, { id }] },
        updateData,
        { new: true, runValidators: true }
      )

      return res.status(200).json(updated)
    }

    const newCat = new Cat({
      ...updateData,
      id: id || new mongoose.Types.ObjectId().toString(),
      publicId
    })

    await newCat.save()
    res.status(201).json(newCat)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getCatById = async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id)
    if (!cat) return res.status(404).json({ error: 'Cat not found' })
    res.json(cat)
  } catch {
    res.status(500).json({ error: 'Failed to fetch cat' })
  }
}

export const deleteCat = async (req, res) => {
  try {
    const { id } = req.params
    const cat = await Cat.findById(id)

    if (!cat) {
      return res.status(404).json({ message: 'Cat not found' })
    }

    if (cat.publicId) {
      await cloudinary.uploader.destroy(cat.publicId)
    }

    await Cat.findByIdAndDelete(id)
    res.status(200).json({ message: 'Cat and image deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message })
  }
}
