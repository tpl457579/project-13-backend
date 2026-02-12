import mongoose from 'mongoose';

const catSchema = new mongoose.Schema({
  // Using the image ID (e.g., '0XYvRd7oD') as a unique identifier
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  
  // Breed Details
  temperament: { type: String },
  lifeSpan: { type: String },
  
  // Numeric Stats (1-5 scale from the API)
  affectionLevel: { type: Number, min: 1, max: 5 },
  childFriendly: { type: Number, min: 1, max: 5 },
  dogFriendly: { type: Number, min: 1, max: 5 },
  energyLevel: { type: Number, min: 1, max: 5 },
  grooming: { type: Number, min: 1, max: 5 },
  sheddingLevel: { type: Number, min: 1, max: 5 },
  strangerFriendly: { type: Number, min: 1, max: 5 },

  // Metadata
  type: { type: String, default: 'cat' },
  lastUpdated: { type: Date, default: Date.now }
});

// Create the model
const Cat = mongoose.model('Cat', catSchema);

export default Cat;