import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  asin: { type: String, index: true },
  name: String,
  url: String,
  imageUrl: String,
  imagePublicId: String,
  rating: Number,
  price: Number,
  priceWhole: Number,
  priceFraction: Number,
  lastUpdated: { type: Date, default: Date.now }
})

export default mongoose.model('Product', productSchema)
