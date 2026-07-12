import { Router } from 'express';
import {
  registerForTraining, getAllRegistrations, getRegistrationById, updateRegistrationStatus
} from '../controllers/registration.controller';
import { protect, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public — submit registration
router.post('/', registerForTraining);

// Admin
router.get('/', protect, requireRole('ADMIN', 'SUPER_ADMIN'), getAllRegistrations);
router.get('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), getRegistrationById);
router.patch('/:id/status', protect, requireRole('ADMIN', 'SUPER_ADMIN'), updateRegistrationStatus);

export default router;
