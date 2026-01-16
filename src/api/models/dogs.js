import mongoose from 'mongoose'

const dogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image_link: { type: String, trim: true, default: '' },
    temperament: { type: [String], default: [] },
    weight: { type: String, trim: true, default: '' },
    height: { type: String, trim: true, default: '' },
    life_span: { type: String, trim: true, default: '' },
    good_with_children: { type: Number, min: 0, max: 10, default: 0 },
    good_with_other_dogs: { type: Number, min: 0, max: 10, default: 0 },
    shedding: { type: Number, min: 0, max: 10, default: 0 },
    grooming: { type: Number, min: 0, max: 10, default: 0 },
    good_with_strangers: { type: Number, min: 0, max: 10, default: 0 },
    playfulness: { type: Number, min: 0, max: 10, default: 0 },
    protectiveness: { type: Number, min: 0, max: 10, default: 0 },
    energy: { type: Number, min: 0, max: 10, default: 0 }
  },
  {
    timestamps: true,
    collection: 'dogs'
  }
)

export default mongoose.models.Dog || mongoose.model('Dog', dogSchema)

