import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { protect, requireRole } from '../middleware/auth.middleware';

const router = Router();
router.get('/', protect, requireRole('SUPER_ADMIN'), getUsers);
router.post('/', protect, requireRole('SUPER_ADMIN'), createUser);
router.put('/:id', protect, requireRole('SUPER_ADMIN'), updateUser);
router.delete('/:id', protect, requireRole('SUPER_ADMIN'), deleteUser);
export default router;
