import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/aes_db';
  try {
    const conn = await mongoose.connect(uri);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    throw error;
  }
};
