import mongoose from 'mongoose'

const dogSchema = new mongoose.Schema(
  {
    id: Number,
    name: { type: String, required: true },
    image_link: { type: String, required: true },
    temperament: { type: [String], default: [] },
    weight: String,
    height: String,
    publicId: String,
    life_span: String,
    good_with_children: String,
    good_with_other_dogs: String,
    shedding: String,
    grooming: String,
    good_with_strangers: String,
    playfulness: String,
    protectiveness: String,
    energy: String
  },
  { timestamps: true }
)

export default mongoose.model('Dog', dogSchema)