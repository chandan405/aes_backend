import { Router } from 'express';
import { submitContact, getAllEnquiries, updateEnquiryStatus, deleteEnquiry } from '../controllers/contact.controller';
import { protect, requireRole } from '../middleware/auth.middleware';

const router = Router();
router.post('/', submitContact);
router.get('/', protect, requireRole('ADMIN', 'SUPER_ADMIN'), getAllEnquiries);
router.patch('/:id/status', protect, requireRole('ADMIN', 'SUPER_ADMIN'), updateEnquiryStatus);
router.delete('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), deleteEnquiry);
export default router;
