import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary';
import path from 'path';

interface UploadResult {
  imageUrl: string;
  thumbnailUrl?: string;
  publicId?: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder = 'aes'
): Promise<UploadResult> => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !file.buffer) {
    // Local storage — file.path is set
    const baseUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}`;
    const filename = file.filename || path.basename(file.path || '');
    return { imageUrl: `${baseUrl}/uploads/${filename}` };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve({
          imageUrl: result.secure_url,
          thumbnailUrl: cloudinary.url(result.public_id, {
            width: 400,
            height: 300,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto',
          }),
          publicId: result.public_id,
        });
      }
    );
    streamifier.createReadStream(file.buffer!).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Non-critical — log but don't throw
  }
};
