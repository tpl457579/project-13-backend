import dogSchema from '../models/dogs.js'

function normalizeTemperament(input) {
  if (!input) return []
  if (Array.isArray(input)) {
    return Array.from(new Set(input.map(String).map((s) => s.trim()).filter(Boolean)))
  }
  return Array.from(new Set(String(input).split(',').map((s) => s.trim()).filter(Boolean)))
}

function validateBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid payload'
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) return 'Missing or invalid name'
  if (body.weight && !/^\s*\d+\s*-\s*\d+\s*kg\s*$/i.test(String(body.weight).trim())) return 'Weight must be like "10 - 20 kg"'
  if (body.height && !/^\s*\d+\s*-\s*\d+\s*cm\s*$/i.test(String(body.height).trim())) return 'Height must be like "10 - 20 cm"'
  if (body.life_span && !/^\s*\d+\s*-\s*\d+\s*years\s*$/i.test(String(body.life_span).trim())) return 'Life span must be like "10 - 14 years"'
  return null
}

export const addDog = async (req, res) => {
  try {
    const body = req.body || {}

    const validationError = validateBody(body)
    if (validationError) return res.status(400).json({ error: validationError })

    const temperament = normalizeTemperament(body.temperament)

    const doc = new dogSchema({
      name: String(body.name).trim(),
      image_link: body.image_link ? String(body.image_link).trim() : '',
      temperament,
      weight: body.weight ? String(body.weight).trim() : '',
      height: body.height ? String(body.height).trim() : '',
      life_span: body.life_span ? String(body.life_span).trim() : '',
      good_with_children: Number.isFinite(Number(body.good_with_children)) ? Number(body.good_with_children) : 0,
      good_with_other_dogs: Number.isFinite(Number(body.good_with_other_dogs)) ? Number(body.good_with_other_dogs) : 0,
      shedding: Number.isFinite(Number(body.shedding)) ? Number(body.shedding) : 0,
      grooming: Number.isFinite(Number(body.grooming)) ? Number(body.grooming) : 0,
      good_with_strangers: Number.isFinite(Number(body.good_with_strangers)) ? Number(body.good_with_strangers) : 0,
      playfulness: Number.isFinite(Number(body.playfulness)) ? Number(body.playfulness) : 0,
      protectiveness: Number.isFinite(Number(body.protectiveness)) ? Number(body.protectiveness) : 0,
      energy: Number.isFinite(Number(body.energy)) ? Number(body.energy) : 0
    })

    const saved = await doc.save()
    return res.status(201).json({ dog: saved })
  } catch (err) {
    console.error('addDog error:', err)
    return res.status(500).json({ error: 'Failed to save dog' })
  }
}

export const listDogs = async (req, res) => {
  try {
    const dogs = await dogSchema.find().sort({ createdAt: -1 }).lean()
    return res.json({ dogs })
  } catch (err) {
    console.error('listDogs error:', err)
    return res.status(500).json({ error: 'Failed to fetch dogs' })
  }
}
