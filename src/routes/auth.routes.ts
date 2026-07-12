import { Router } from 'express';
import { login, refreshToken, getMe, changePassword, logout, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
