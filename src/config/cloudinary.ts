import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger';

export const configureCloudinary = () => {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    logger.info('✅ Cloudinary configured');
  } else {
    logger.warn('⚠️  Cloudinary not configured - using local storage fallback');
  }
};

export { cloudinary };
