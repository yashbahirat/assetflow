import { Router } from 'express';
import { allocateAsset, requestTransfer, approveTransfer, returnAsset } from '../controllers/allocationController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), allocateAsset);
router.post('/assets/:id/transfer', authenticate, requestTransfer);
router.put('/transfers/:id/approve', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), approveTransfer);
router.put('/:id/return', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), returnAsset);

export default router;
