import { Router } from 'express';
import { getClients, getAllClients, createClient, updateClient, deleteClient, reorderClients } from '../controllers/client.controller';
import { protect, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
router.get('/', getClients);
router.get('/all', protect, getAllClients);
router.post('/', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('logo'), createClient);
router.put('/reorder', protect, requireRole('ADMIN', 'SUPER_ADMIN'), reorderClients);
router.put('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('logo'), updateClient);
router.delete('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), deleteClient);
export default router;
