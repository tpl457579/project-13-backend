import Dog from '../models/dogs.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.VITE_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const normalizeTemperament = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(t => t.trim()).filter(Boolean);
  return String(input).split(',').map(t => t.trim()).filter(Boolean);
};

export const getDogFacts = async (req, res) => {
  try {
    const facts = await mongoose.connection.db.collection('dog_facts').find().toArray();
    res.status(200).json(facts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching facts", error: error.message });
  }
};

export const getDogs = async (req, res) => {
  try {
    const dogs = await Dog.find().sort({ name: 1 }).lean();
    res.json({ dogs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
};

export const saveDog = async (req, res) => {
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
      const existingDog = await Dog.findById(_id);
      
      // Cleanup old Cloudinary image if publicId changed
      if (existingDog && existingDog.publicId && existingDog.publicId !== publicId) {
        try {
          await cloudinary.uploader.destroy(existingDog.publicId);
        } catch (cloudErr) {
          console.error("Cloudinary Delete Error:", cloudErr);
        }
      }

      const updatedDog = await Dog.findByIdAndUpdate(_id, updateData, { new: true });
      return res.status(200).json(updatedDog);
    }

    const newDog = new Dog(updateData);
    await newDog.save();
    res.status(201).json(newDog);

  } catch (error) {
    console.error("Save Dog Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getDogById = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    res.json(dog);
  } catch {
    res.status(500).json({ error: 'Failed to fetch dog' });
  }
};

export const deleteDog = async (req, res) => {
  try {
    const { id } = req.params;
    const dog = await Dog.findById(id);

    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    if (dog.publicId) {
      await cloudinary.uploader.destroy(dog.publicId);
    }

    await Dog.findByIdAndDelete(id);
    res.status(200).json({ message: "Dog and associated image deleted successfully" });
    
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};