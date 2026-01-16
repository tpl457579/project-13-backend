import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import dogSchema from '../models/dogs.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const jsonFilePath = path.join(__dirname, '..', '..', 'utils', 'mergedDogsFull.json')
const jsonTempPath = `${jsonFilePath}.tmp`

function normalizeTemperament(input) {
  if (!input) return []
  if (Array.isArray(input)) {
    return Array.from(new Set(input.map(String).map((s) => s.trim()).filter(Boolean)))
  }
  return Array.from(new Set(String(input).split(',').map((s) => s.trim()).filter(Boolean)))
}

async function ensureJsonFile() {
  try {
    await fs.access(jsonFilePath)
  } catch {
    await fs.mkdir(path.dirname(jsonFilePath), { recursive: true })
    await fs.writeFile(jsonFilePath, '[]', 'utf8')
  }
}

function validateFormats(payload) {
  if (payload.weight && !/^\s*\d+\s*-\s*\d+\s*kg\s*$/i.test(String(payload.weight).trim())) {
    return 'Weight must be like "10 - 20 kg"'
  }
  if (payload.height && !/^\s*\d+\s*-\s*\d+\s*cm\s*$/i.test(String(payload.height).trim())) {
    return 'Height must be like "10 - 20 cm"'
  }
  if (payload.life_span && !/^\s*\d+\s*-\s*\d+\s*years\s*$/i.test(String(payload.life_span).trim())) {
    return 'Life span must be like "10 - 14 years"'
  }
  return null
}

export const addDog = async (req, res) => {
  try {
    const body = req.body || {}

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return res.status(400).json({ error: 'Missing or invalid name' })
    }

    const formatError = validateFormats(body)
    if (formatError) return res.status(400).json({ error: formatError })

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

    try {
      await ensureJsonFile()
      const file = await fs.readFile(jsonFilePath, 'utf8')
      let arr = []
      try {
        arr = JSON.parse(file)
        if (!Array.isArray(arr)) arr = []
      } catch {
        arr = []
      }

      const jsonEntry = {
        id: saved._id ? String(saved._id) : randomUUID(),
        name: saved.name,
        image_link: saved.image_link || '',
        temperament: Array.isArray(saved.temperament) ? Array.from(new Set(saved.temperament.map(String).map((s) => s.trim()).filter(Boolean))) : [],
        weight: saved.weight || '',
        height: saved.height || '',
        life_span: saved.life_span || '',
        good_with_children: typeof saved.good_with_children === 'number' ? saved.good_with_children : 0,
        good_with_other_dogs: typeof saved.good_with_other_dogs === 'number' ? saved.good_with_other_dogs : 0,
        shedding: typeof saved.shedding === 'number' ? saved.shedding : 0,
        grooming: typeof saved.grooming === 'number' ? saved.grooming : 0,
        good_with_strangers: typeof saved.good_with_strangers === 'number' ? saved.good_with_strangers : 0,
        playfulness: typeof saved.playfulness === 'number' ? saved.playfulness : 0,
        protectiveness: typeof saved.protectiveness === 'number' ? saved.protectiveness : 0,
        energy: typeof saved.energy === 'number' ? saved.energy : 0,
        createdAt: saved.createdAt ? new Date(saved.createdAt).toISOString() : new Date().toISOString()
      }

      arr.push(jsonEntry)
      await fs.writeFile(jsonTempPath, JSON.stringify(arr, null, 2), 'utf8')
      await fs.rename(jsonTempPath, jsonFilePath)
    } catch (jsonErr) {
      console.error('Failed to append to JSON file:', jsonErr)
    }

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
