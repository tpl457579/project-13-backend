import Cat from '../models/cats.js'
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.VITE_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const normalizeTemperament = (input) => {
  if (!input) return []
  if (Array.isArray(input)) return input.map(t => t.trim()).filter(Boolean)
  return String(input).split(',').map(t => t.trim()).filter(Boolean)
}

const ensureUnit = (value, unit) => {
  if (!value) return ""
  const str = String(value).trim()
  if (str.toLowerCase().endsWith(unit.toLowerCase())) return str
  return `${str} ${unit}`
}

export const getCats = async (req, res) => {
  try {
    const cats = await Cat.find().sort({ name: 1 }).lean()
    res.json({ cats })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cats' })
  }
}


export const saveCat = async (req, res) => {
  try {
    const { _id, publicId, name, weight, height, temperament, ...rest } = req.body;

    const formattedTemperament = Array.isArray(temperament) 
      ? temperament 
      : String(temperament || '').split(',').map(t => t.trim()).filter(Boolean);

    const updateData = {
      ...rest,
      name: name?.trim(),
      weight: weight?.toLowerCase().includes('kg') ? weight : `${weight} kg`,
      height: height?.toLowerCase().includes('cm') ? height : `${height} cm`,
      temperament: formattedTemperament,
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
    const cat = await Cat.findById(req.params.id)
    if (!cat) return res.status(404).json({ error: 'Cat not found' })
    res.json(cat)
  } catch {
    res.status(500).json({ error: 'Failed to fetch cat' })
  }
}


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
    res.status(200).json({ message: "Cat and associated image deleted successfully" });
    
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};