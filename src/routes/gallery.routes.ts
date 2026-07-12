import { Router } from 'express';
import {
  getGallery, getFeaturedGallery, getGalleryById, getAllGallery,
  uploadGalleryImage, updateGalleryImage, deleteGalleryImage, toggleGalleryStatus
} from '../controllers/gallery.controller';
import { protect, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public
router.get('/', getGallery);
router.get('/featured', getFeaturedGallery);
router.get('/:id', getGalleryById);

// Admin
router.get('/admin/all', protect, getAllGallery);
router.post('/upload', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'), uploadGalleryImage);
router.put('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'), updateGalleryImage);
router.delete('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), deleteGalleryImage);
router.patch('/:id/toggle', protect, requireRole('ADMIN', 'SUPER_ADMIN'), toggleGalleryStatus);

export default router;
