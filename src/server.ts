import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`🚀 AES Server running on http://localhost:${PORT}`);
      logger.info(`📦 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
