import { Router, Request, Response, NextFunction } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { uploadToCloudinary } from '../utils/uploadHelper';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

const router = Router();

// Single image upload
router.post('/single', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return next(new AppError('No image file provided', 400));
      const folder = (req.query.folder as string) || 'aes/misc';
      const result = await uploadToCloudinary(req.file, folder);
      sendSuccess(res, result, 'Image uploaded', 201);
    } catch (err) { next(err); }
  }
);

// Multiple images upload
router.post('/multiple', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.array('images', 10),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || !Array.isArray(req.files)) return next(new AppError('No image files provided', 400));
      const folder = (req.query.folder as string) || 'aes/misc';
      const results = await Promise.all(
        (req.files as Express.Multer.File[]).map(file => uploadToCloudinary(file, folder))
      );
      sendSuccess(res, results, 'Images uploaded', 201);
    } catch (err) { next(err); }
  }
);

export default router;
