import Dog from '../models/dogs.js'

const normalizeTemperament = (input) => {
  if (!input) return []
  if (Array.isArray(input)) return input.map(t => t.trim()).filter(Boolean)
  return String(input).split(',').map(t => t.trim()).filter(Boolean)
}

export const getDogs = async (req, res) => {
  try {
    const dogs = await Dog.find().sort({ name: 1 }).lean()
    res.json({ dogs })
  } catch {
    res.status(500).json({ error: 'Failed to fetch dogs' })
  }
}

export const getDogById = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id)
    if (!dog) return res.status(404).json({ error: 'Dog not found' })
    res.json(dog)
  } catch {
    res.status(500).json({ error: 'Failed to fetch dog' })
  }
}

export const saveDog = async (req, res) => {
  try {
    const data = {
      ...req.body,
      name: req.body.name?.trim(),
      temperament: normalizeTemperament(req.body.temperament)
    }

    let dog
    if (req.body._id) {
      dog = await Dog.findByIdAndUpdate(req.body._id, data, { new: true })
    } else {
      dog = new Dog(data)
      await dog.save()
    }

    res.json({ dog })
  } catch {
    res.status(500).json({ error: 'Failed to save dog' })
  }
}

export const deleteDog = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id)
    if (!dog) return res.status(404).json({ error: 'Dog not found' })
    await dog.deleteOne()
    res.json({ message: 'Dog deleted' })
  } catch {
    res.status(500).json({ error: 'Failed to delete dog' })
  }
}