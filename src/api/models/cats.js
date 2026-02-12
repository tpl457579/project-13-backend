import mongoose from "mongoose";

const catSchema = new mongoose.Schema({
  // Using 'id' as a string is great for external API data (like TheCatAPI)
  id: { type: String, required: true, unique: true }, 
  publicId: { type: String }, 
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  
  temperament: [{ type: String }],
  lifeSpan: { type: String },
  
  affectionLevel: { type: Number, min: 1, max: 5 },
  childFriendly: { type: Number, min: 1, max: 5 },
  dogFriendly: { type: Number, min: 1, max: 5 },
  energyLevel: { type: Number, min: 1, max: 5 },
  grooming: { type: Number, min: 1, max: 5 },
  sheddingLevel: { type: Number, min: 1, max: 5 },
  strangerFriendly: { type: Number, min: 1, max: 5 },

  type: { type: String, default: 'cat' }
}, {
  // Automatically creates 'createdAt' and 'updatedAt' fields
  timestamps: true,
  // Ensures that when you convert to JSON (for the frontend), virtuals are included
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// If you want to use the 'id' field interchangeably with Mongoose's '_id'
catSchema.virtual('productId').get(function() {
  return this.id;
});

export default mongoose.model('Cat', catSchema);