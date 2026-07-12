import { Router } from 'express';
import {
  getServices, getServiceBySlug, getAllServices,
  createService, updateService, deleteService, toggleServiceStatus, deleteServiceImage
} from '../controllers/service.controller';
import { protect, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public
router.get('/', getServices);
router.get('/slug/:slug', getServiceBySlug);

// Admin
router.get('/all', protect, getAllServices);
router.post('/', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.array('images', 10), createService);
router.put('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.array('images', 10), updateService);
router.delete('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), deleteService);
router.patch('/:id/toggle', protect, requireRole('ADMIN', 'SUPER_ADMIN'), toggleServiceStatus);
router.delete('/:id/images/:imageIndex', protect, requireRole('ADMIN', 'SUPER_ADMIN'), deleteServiceImage);

export default router;
