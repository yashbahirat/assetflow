import { Router } from 'express';
import { getDashboardStats, getReports, getActivityLogs, exportInventoryCSV, exportMaintenanceCSV, getNotifications } from '../controllers/analyticsController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, getDashboardStats);
router.get('/reports', authenticate, getReports);
router.get('/activity', authenticate, getActivityLogs);
router.get('/notifications', authenticate, getNotifications);
router.get('/export/inventory', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER']), exportInventoryCSV);
router.get('/export/maintenance', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER']), exportMaintenanceCSV);

export default router;
