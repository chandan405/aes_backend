import { Router } from 'express';
import {
  getPublishedTrainings, getTrainingById, getAllTrainings,
  createTraining, updateTraining, deleteTraining, toggleTrainingStatus
} from '../controllers/training.controller';
import { protect, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public
router.get('/', getPublishedTrainings);
router.get('/:id', getTrainingById);

// Admin
router.get('/admin/all', protect, getAllTrainings);
router.post('/', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'), createTraining);
router.put('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'), updateTraining);
router.delete('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), deleteTraining);
router.patch('/:id/toggle', protect, requireRole('ADMIN', 'SUPER_ADMIN'), toggleTrainingStatus);

export default router;
