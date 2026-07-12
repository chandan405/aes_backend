import { Router } from 'express';
import { getAbout, updateAbout } from '../controllers/about.controller';
import { protect, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getAbout);
router.put('/', protect, requireRole('ADMIN', 'SUPER_ADMIN'),
  upload.fields([{ name: 'aboutImage', maxCount: 1 }, { name: 'visionImage', maxCount: 1 }]),
  updateAbout
);

export default router;
