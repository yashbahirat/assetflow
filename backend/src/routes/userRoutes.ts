import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getUsers);
router.put('/:id/role', authenticate, requireRole(['ADMIN']), updateUserRole);

export default router;
