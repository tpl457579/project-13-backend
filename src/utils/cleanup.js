import 'dotenv/config'
import mongoose from 'mongoose'
import { cloudinary } from '../middlewares/file.js'
import Product from '../api/models/products.js'

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    const products = await Product.find({}, 'imagePublicId')
    const dbPublicIds = new Set(
      products.map((p) => p.imagePublicId).filter(Boolean)
    )

    const { resources } = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'products/',
      max_results: 500
    })

    const unused = resources.filter((r) => !dbPublicIds.has(r.public_id))

    for (const img of unused) {
      await cloudinary.uploader.destroy(img.public_id)
      console.log(`Deleted ${img.public_id}`)
    }

    console.log('Cleanup complete')
  } catch (err) {
    console.error('Cleanup error:', err)
  } finally {
    await mongoose.disconnect()
  }
}

cleanup()
