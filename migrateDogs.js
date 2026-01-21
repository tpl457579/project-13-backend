import mongoose from 'mongoose';
import Dog from '../project-13-backend/src/api/models/dogs.js'; 
import dotenv from 'dotenv';

dotenv.config();

const migrateData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const dogs = await Dog.find();
    let updatedCount = 0;

    for (let dog of dogs) {
      let changed = false;

      // Update Weight: Only add 'kg' if it's not already there
      if (dog.weight && !dog.weight.includes('kg')) {
        dog.weight = `${dog.weight} kg`;
        changed = true;
      }

      // Update Height: Only add 'cm' if it's not already there
      if (dog.height && !dog.height.includes('cm')) {
        dog.height = `${dog.height} cm`;
        changed = true;
      }

      if (changed) {
        await dog.save();
        updatedCount++;
      }
    }

    console.log(`Success! Updated ${updatedCount} dogs.`);
    process.exit();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateData();