import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
  useUnifiedTopology: true,
      family: 4,
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};