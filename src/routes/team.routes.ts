import { Router } from 'express';
import { getTeam, getAllTeam, createTeamMember, updateTeamMember, deleteTeamMember } from '../controllers/team.controller';
import { protect, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getTeam);
router.get('/all', protect, getAllTeam);
router.post('/', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'), createTeamMember);
router.put('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('image'), updateTeamMember);
router.delete('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), deleteTeamMember);

export default router;
