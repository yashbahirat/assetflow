import { Router } from 'express';
import { createAuditCycle, getAuditCycles, getAuditCycleDetails, updateAuditItem, closeAuditCycle } from '../controllers/auditController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, requireRole(['ADMIN']), createAuditCycle);
router.get('/', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER']), getAuditCycles);
router.get('/:id', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER']), getAuditCycleDetails);
router.put('/items/:itemId', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER']), updateAuditItem);
router.put('/:id/close', authenticate, requireRole(['ADMIN']), closeAuditCycle);

export default router;
