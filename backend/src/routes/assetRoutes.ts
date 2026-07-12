import { Router } from 'express';
import { createAsset, getAssets, getAssetHistory, updateAsset } from '../controllers/assetController';
import { authenticate, requireRole } from '../middleware/auth';


const router = Router();

router.get('/', authenticate, getAssets);
router.post('/', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER']), createAsset);
router.get('/:id/history', authenticate, getAssetHistory);
router.put('/:id', authenticate, requireRole(['ADMIN', 'ASSET_MANAGER']), updateAsset);

export default router;
