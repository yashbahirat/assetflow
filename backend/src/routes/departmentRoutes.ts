import { Router } from 'express';
import { getDepartments, createDepartment, updateDepartment } from '../controllers/departmentController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getDepartments);
router.post('/', authenticate, requireRole(['ADMIN']), createDepartment);
router.put('/:id', authenticate, requireRole(['ADMIN']), updateDepartment);

export default router;
