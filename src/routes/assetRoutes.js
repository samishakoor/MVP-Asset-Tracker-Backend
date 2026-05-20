import express from 'express';
import {
  createAsset,
  getAllAssets,
  getAssetTypes,
  getAssetById,
  updateAsset,
  deleteAsset,
} from '../controllers/assetController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { UserRole } from '../constants/index.js';

const assetRouter = express.Router();

// Protected routes — admin only
assetRouter.post('/', authenticateUser, requireRoles(UserRole.ADMIN), createAsset);
assetRouter.get('/', authenticateUser, requireRoles(UserRole.ADMIN), getAllAssets);
assetRouter.get('/types', authenticateUser, requireRoles(UserRole.ADMIN), getAssetTypes);
assetRouter.get('/:id', authenticateUser, requireRoles(UserRole.ADMIN), getAssetById);
assetRouter.put('/:id', authenticateUser, requireRoles(UserRole.ADMIN), updateAsset);
assetRouter.delete('/:id', authenticateUser, requireRoles(UserRole.ADMIN), deleteAsset);

export default assetRouter;
