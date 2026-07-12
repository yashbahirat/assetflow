import { Router } from 'express';
import { createMaintenanceRequest, getAllMaintenanceRequests, updateMaintenanceStatus } from '../controllers/maintenanceController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createMaintenanceRequest);
router.get('/', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER']), getAllMaintenanceRequests);
router.put('/:id/status', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER']), updateMaintenanceStatus);

export default router;
