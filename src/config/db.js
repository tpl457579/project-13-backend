import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Safety check: Don't even try if the URI is missing
  if (!uri) {
    console.error("❌ Error: MONGO_URI is not defined in your .env file!");
    return;
  }

  const connect = async () => {
    try {
      // family: 4 is excellent—keep that to force IPv4
      await mongoose.connect(uri, {
        family: 4,
        serverSelectionTimeoutMS: 5000, // Reduced to 5s for faster retry feedback
        connectTimeoutMS: 10000,
      });
      console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
      console.error("❌ MongoDB Connection Error:", error.message);
      
      // Check for specific DNS/Network issues
      if (error.message.includes('ENOTFOUND')) {
        console.error("👉 Tip: Your computer cannot find the Atlas server. Check your internet or DNS settings.");
      }

      console.log("🔁 Retrying in 5 seconds...");
      setTimeout(connect, 5000);
    }
  };

  connect();
};