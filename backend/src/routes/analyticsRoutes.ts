import { Router } from 'express';
import { getDashboardStats, getReports, getActivityLogs } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, getDashboardStats);
router.get('/reports', authenticate, getReports);
router.get('/activity', authenticate, getActivityLogs);

export default router;
