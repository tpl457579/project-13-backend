import Cat from '../models/cats.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

cloudinary.config({
  cloud_name: process.env.VITE_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper: Standardize temperament
const normalizeTemperament = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(t => t.trim()).filter(Boolean);
  return String(input).split(',').map(t => t.trim()).filter(Boolean);
};

// --- Cat Facts ---

export const getCatFacts = async (req, res) => {
  try {
    // Use the mongoose connection to access the collection directly
    const facts = await mongoose.connection.db.collection('cat_facts').find().toArray();
    res.status(200).json(facts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching facts", error: error.message });
  }
};

// --- Cat CRUD ---

export const getCats = async (req, res) => {
  try {
    const cats = await Cat.find().sort({ name: 1 }).lean();
    res.json({ cats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cats' });
  }
};

export const saveCat = async (req, res) => {
  try {
    const { _id, publicId, name, weight, height, temperament, ...rest } = req.body;

    const updateData = {
      ...rest,
      name: name?.trim(),
      weight: weight ? (weight.toLowerCase().includes('kg') ? weight : `${weight} kg`) : "",
      height: height ? (height.toLowerCase().includes('cm') ? height : `${height} cm`) : "",
      temperament: normalizeTemperament(temperament),
      publicId
    };

    if (_id) {
      const existingCat = await Cat.findById(_id);
      
      if (existingCat && existingCat.publicId && existingCat.publicId !== publicId) {
        try {
          await cloudinary.uploader.destroy(existingCat.publicId);
        } catch (cloudErr) {
          console.error("Cloudinary Delete Error:", cloudErr);
        }
      }

      const updatedCat = await Cat.findByIdAndUpdate(_id, updateData, { new: true });
      return res.status(200).json(updatedCat);
    }

    const newCat = new Cat(updateData);
    await newCat.save();
    res.status(201).json(newCat);

  } catch (error) {
    console.error("Save Cat Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getCatById = async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Cat not found' });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cat' });
  }
};

export const deleteCat = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Cat.findById(id);

    if (!cat) {
      return res.status(404).json({ message: "Cat not found" });
    }

    if (cat.publicId) {
      await cloudinary.uploader.destroy(cat.publicId);
    }

    await Cat.findByIdAndDelete(id);
    res.status(200).json({ message: "Cat and image deleted successfully" });
    
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};