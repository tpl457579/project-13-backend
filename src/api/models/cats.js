import mongoose from 'mongoose';

const catSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  imageUrl: String,
 temperament: { type: [String], default: [] },
  lifeSpan: String,
  affectionLevel: String,
  childFriendly: String,
  dogFriendly:String,
  energyLevel: String,
  grooming: String,
  sheddingLevel: String,
  strangerFriendly: String,
  lastUpdated: { type: Date, default: Date.now }
});

const Cat = mongoose.model('Cat', catSchema);

export default Cat;