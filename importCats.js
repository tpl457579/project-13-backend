import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Cat from './src/api/models/cats.js' 

dotenv.config()

// Fix for paths when running from different folders
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, 'cats_cleaned.json');

const importData = async () => {
  try {
    // 1. Check if URI exists
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your .env file!");
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');

    // 2. Check if JSON exists
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Could not find cats_cleaned.json at ${jsonPath}`);
    }

    const cats = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // 3. Import
    await Cat.deleteMany();
    console.log('🗑️  Existing cats cleared from DB');

    await Cat.insertMany(cats);
    console.log(`🚀 ${cats.length} cats successfully imported!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing data:', err.message);
    
    if (err.message.includes('ECONNREFUSED')) {
      console.log('\n💡 TIP: Your IP address might not be whitelisted on MongoDB Atlas.');
      console.log('Go to: MongoDB Atlas > Network Access > Add Current IP Address.');
    }
    
    process.exit(1);
  }
}

importData();