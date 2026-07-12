import { Router } from 'express';
import { getIndustries, getAllIndustries, createIndustry, updateIndustry, deleteIndustry } from '../controllers/industry.controller';
import { protect, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
router.get('/', getIndustries);
router.get('/all', protect, getAllIndustries);
router.post('/', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'), createIndustry);
router.put('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'), updateIndustry);
router.delete('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), deleteIndustry);
export default router;
