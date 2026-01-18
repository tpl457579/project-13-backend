import dogSchema from '../models/dogs.js'

function normalizeTemperament(input) {
  if (!input) return []
  if (Array.isArray(input)) {
    return Array.from(
      new Set(input.map(String).map(s => s.trim()).filter(Boolean))
    )
  }
  return Array.from(
    new Set(String(input).split(',').map(s => s.trim()).filter(Boolean))
  )
}

function validateBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid payload'
  if (!body.name || typeof body.name !== 'string' || !body.name.trim())
    return 'Missing or invalid name'
  if (body.weight && !/^\s*\d+\s*-\s*\d+\s*kg\s*$/i.test(body.weight))
    return 'Weight must be like "10 - 20 kg"'
  if (body.height && !/^\s*\d+\s*-\s*\d+\s*cm\s*$/i.test(body.height))
    return 'Height must be like "10 - 20 cm"'
  if (body.life_span && !/^\s*\d+\s*-\s*\d+\s*years\s*$/i.test(body.life_span))
    return 'Life span must be like "10 - 14 years"'
  return null
}

export const saveDog = async (req, res) => {
  try {
    const body = req.body || {}
    const validationError = validateBody(body)
    if (validationError)
      return res.status(400).json({ error: validationError })

    const temperament = normalizeTemperament(body.temperament)

    let dog

    if (body._id) {
      dog = await dogSchema.findByIdAndUpdate(
        body._id,
        {
          name: body.name.trim(),
          image_link: body.image_link || '',
          temperament,
          weight: body.weight || '',
          height: body.height || '',
          life_span: body.life_span || '',
          good_with_children: Number(body.good_with_children) || 0,
          good_with_other_dogs: Number(body.good_with_other_dogs) || 0,
          shedding: Number(body.shedding) || 0,
          grooming: Number(body.grooming) || 0,
          good_with_strangers: Number(body.good_with_strangers) || 0,
          playfulness: Number(body.playfulness) || 0,
          protectiveness: Number(body.protectiveness) || 0,
          energy: Number(body.energy) || 0
        },
        { new: true }
      )
    } else {
      dog = new dogSchema({
        name: body.name.trim(),
        image_link: body.image_link || '',
        temperament,
        weight: body.weight || '',
        height: body.height || '',
        life_span: body.life_span || '',
        good_with_children: Number(body.good_with_children) || 0,
        good_with_other_dogs: Number(body.good_with_other_dogs) || 0,
        shedding: Number(body.shedding) || 0,
        grooming: Number(body.grooming) || 0,
        good_with_strangers: Number(body.good_with_strangers) || 0,
        playfulness: Number(body.playfulness) || 0,
        protectiveness: Number(body.protectiveness) || 0,
        energy: Number(body.energy) || 0
      })
      await dog.save()
    }

    if (!dog) return res.status(404).json({ error: 'Dog not found' })
    res.status(200).json({ dog })
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to save dog', details: err.message })
  }
}

export const getDogs = async (req, res) => {
  try {
    const dogs = await dogSchema.find().sort({ createdAt: -1 })
    res.json(dogs)
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch dogs', error: err.message })
  }
}

export const getDogById = async (req, res) => {
  try {
    const dog = await dogSchema.findById(req.params.id)
    if (!dog) return res.status(404).json({ message: 'Dog not found' })
    res.status(200).json(dog)
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch dog', error: err.message })
  }
}

export const deleteDog = async (req, res) => {
  try {
    const dog = await dogSchema.findById(req.params.id)
    if (!dog) return res.status(404).json({ message: 'Dog not found' })
    await dog.deleteOne()
    res.status(200).json({ message: 'Dog deleted successfully' })
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to delete dog', error: err.message })
  }
}
