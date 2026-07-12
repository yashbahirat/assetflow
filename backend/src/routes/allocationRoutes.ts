import { Router } from 'express';
import { allocateAsset, requestTransfer, approveTransfer, rejectTransfer, getTransferRequests, returnAsset, getOverdueAllocations } from '../controllers/allocationController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Only Asset Managers and Admins register/allocate assets
router.post('/', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER']), allocateAsset);

// Any authenticated user can request a transfer (employee initiates)
router.post('/assets/:id/transfer', authenticate, requestTransfer);

// Admins, Asset Managers, and Department Heads can view/approve/reject transfers
router.get('/transfers', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), getTransferRequests);
router.put('/transfers/:id/approve', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), approveTransfer);
router.put('/transfers/:id/reject', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), rejectTransfer);

// Return: Asset Managers, Admins, and Dept Heads can mark assets returned
router.put('/:id/return', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), returnAsset);
router.get('/overdue', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), getOverdueAllocations);

export default router;
