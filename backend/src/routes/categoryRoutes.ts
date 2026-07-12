import { Router } from 'express';
import { getCategories, createCategory, updateCategory } from '../controllers/categoryController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getCategories);
router.post('/', authenticate, requireRole(['ADMIN']), createCategory);
router.put('/:id', authenticate, requireRole(['ADMIN']), updateCategory);

export default router;
