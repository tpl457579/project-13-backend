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
  console.log("--- SAVE CAT REQUEST RECEIVED ---")
  console.log("Request body:", req.body)

  try {
    const { _id, id, imagePublicId, name, temperament, imageUrl, ...rest } = req.body

    console.log("Extracted fields:", { _id, id, imagePublicId, name, temperament, imageUrl, rest })

    const updateData = {
      ...rest,
      name: name?.trim(),
      imageUrl,
      imagePublicId,
      temperament: Array.isArray(temperament)
        ? temperament.join(', ')
        : temperament,
      lastUpdated: Date.now()
    }

    console.log("updateData prepared:", updateData)

    const query = []

    if (_id && mongoose.isValidObjectId(_id)) {
      console.log("Valid Mongo _id detected:", _id)
      query.push({ _id })
    }

    if (id && id.trim() !== '') {
      console.log("Custom id detected:", id)
      query.push({ id })
    }

    console.log("Final lookup query:", query)

    const existingCat = query.length
      ? await Cat.findOne({ $or: query })
      : null

    console.log("existingCat found:", existingCat)

    if (existingCat) {
      console.log("Updating existing cat:", existingCat._id)

      if (existingCat?.imagePublicId && existingCat.imagePublicId !== imagePublicId) {
        console.log("Removing old Cloudinary image:", existingCat.imagePublicId)
        try {
          await cloudinary.uploader.destroy(existingCat.imagePublicId)
        } catch (err) {
          console.log("Cloudinary delete failed:", err.message)
        }
      }

      const updateQuery = []

      if (_id && mongoose.isValidObjectId(_id)) updateQuery.push({ _id })
      if (id && id.trim() !== '') updateQuery.push({ id })

      console.log("updateQuery:", updateQuery)

      const updated = await Cat.findOneAndUpdate(
        { $or: updateQuery },
        updateData,
        { new: true, runValidators: true }
      )

      console.log("Updated cat:", updated)
      return res.status(200).json(updated)
    }

    console.log("Creating NEW cat")

    const newCat = new Cat({
      ...updateData,
      id: id || new mongoose.Types.ObjectId().toString(),
      imagePublicId
    })

    console.log("newCat before save:", newCat)

    await newCat.save()

    console.log("NEW CAT SAVED:", newCat)
    res.status(201).json(newCat)

  } catch (error) {
    console.log("ERROR IN saveCat:", error)
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

    if (cat.imagePublicId) {
      await cloudinary.uploader.destroy(cat.imagePublicId)
    }

    await Cat.findByIdAndDelete(id)
    res.status(200).json({ message: 'Cat and image deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message })
  }
}
