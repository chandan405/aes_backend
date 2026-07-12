import { Router } from 'express';
import {
  getBanners, getAllBanners, createBanner, updateBanner, deleteBanner, toggleBannerStatus
} from '../controllers/banner.controller';
import { protect, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public
router.get('/', getBanners);

// Admin
router.get('/all', protect, getAllBanners);
router.post('/', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'), createBanner);
router.put('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'), updateBanner);
router.delete('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), deleteBanner);
router.patch('/:id/toggle', protect, requireRole('ADMIN', 'SUPER_ADMIN'), toggleBannerStatus);

export default router;
