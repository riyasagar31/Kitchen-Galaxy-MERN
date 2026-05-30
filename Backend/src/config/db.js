// src/config/db.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // Force IPv4 to prevent getaddrinfo ENOTFOUND issues in Node.js
      serverSelectionTimeoutMS: 5000 // Timeout early if selecting a server fails
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
