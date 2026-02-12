import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4, 
      serverSelectionTimeoutMS: 5000
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  }
};