import mongoose from 'mongoose'

const dogSchema = new mongoose.Schema(
  {
    id: Number,
    name: { type: String, required: true },
    image_link: String,
    temperament: { type: [String], default: [] },
    weight: String,
    height: String,
    publicId: stringStream,
    life_span: String,
    good_with_children: Number,
    good_with_other_dogs: Number,
    shedding: Number,
    grooming: Number,
    good_with_strangers: Number,
    playfulness: Number,
    protectiveness: Number,
    energy: Number
  },
  { timestamps: true }
)

export default mongoose.model('Dog', dogSchema)