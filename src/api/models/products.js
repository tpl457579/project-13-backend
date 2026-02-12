import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  asin: String,
  name: String,
  url: String,
  imageUrl: String,
  imagePublicId: String,
  petType: { type: String, default: 'dog' },
  category: String, 
  rating: Number,
  price: Number,
  priceWhole: Number,
  priceFraction: Number,
  lastScrapedImageUrl: String,
  lastUpdated: { type: Date, default: Date.now }
})

export default mongoose.model('Product', productSchema)
