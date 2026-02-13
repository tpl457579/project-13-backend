import mongoose from 'mongoose';

const catSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  temperament: { type: String },
  lifeSpan: { type: String },
  affectionLevel: { type: Number, min: 1, max: 5 },
  childFriendly: { type: Number, min: 1, max: 5 },
  dogFriendly: { type: Number, min: 1, max: 5 },
  energyLevel: { type: Number, min: 1, max: 5 },
  grooming: { type: Number, min: 1, max: 5 },
  sheddingLevel: { type: Number, min: 1, max: 5 },
  strangerFriendly: { type: Number, min: 1, max: 5 },
  lastUpdated: { type: Date, default: Date.now }
});

const Cat = mongoose.model('Cat', catSchema);

export default Cat;