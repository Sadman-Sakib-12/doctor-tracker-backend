import mongoose from 'mongoose';

// Cache connection across serverless function invocations
let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', (error as Error).message);
    process.exit(1);
  }
};

export default connectDB;
