import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI || 'mongodb+srv://chandanbhola65_db_user:demo123@cluster0.lno8psu.mongodb.net/aes_db?appName=Cluster0';
  try {
    const conn = await mongoose.connect(uri);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    throw error;
  }
};
