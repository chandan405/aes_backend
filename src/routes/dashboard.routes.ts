import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { protect, requireRole } from '../middleware/auth.middleware';

const router = Router();
router.get('/stats', protect, requireRole('ADMIN', 'SUPER_ADMIN'), getDashboardStats);
export default router;
