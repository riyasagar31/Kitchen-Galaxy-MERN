import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';

console.log("Testing DNS resolution for MongoDB cluster...");
dns.lookup('ac-cu646cj-shard-00-00.kidittt.mongodb.net', (err, address, family) => {
  console.log('Lookup (default):', err ? err.message : `${address} IPv${family}`);
});

dns.lookup('ac-cu646cj-shard-00-00.kidittt.mongodb.net', { family: 4 }, (err, address) => {
  console.log('Lookup (IPv4):', err ? err.message : `${address} IPv4`);
});

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 
    });
    console.log('MongoDB connected successfully');
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    
    console.log("\nAttempting to connect to MongoDB with IPv4 family...");
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 5000 
        });
        console.log('MongoDB connected successfully with IPv4 override!');
        process.exit(0);
    } catch (err2) {
        console.error('MongoDB connection error (IPv4 override):', err2);
        process.exit(1);
    }
  }
};

setTimeout(connectDB, 1000);
