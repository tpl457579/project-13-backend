import mongoose from 'mongoose';

export const connectDB = async () => {
  const connect = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        family: 4,
        serverSelectionTimeoutMS: 30000, // 30 seconds
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000
      });
      console.log("✅ MongoDB Connected");
    } catch (error) {
      console.error("❌ Connection failed:", error.message);
      console.log("🔁 Retrying in 5 seconds...");
      setTimeout(connect, 5000);
    }
  };

  connect();
};
