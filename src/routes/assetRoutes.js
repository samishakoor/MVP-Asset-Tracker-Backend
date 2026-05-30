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

// Private (Admin) — Register a new asset in inventory
assetRouter.post('/', authenticateUser, requireRoles(UserRole.ADMIN), createAsset);

// Private (Admin) — List or filter assets (optional pagination query params)
assetRouter.get('/', authenticateUser, requireRoles(UserRole.ADMIN), getAllAssets);

// Private (Admin) — List distinct asset types for filters and forms
assetRouter.get('/types', authenticateUser, requireRoles(UserRole.ADMIN), getAssetTypes);

// Private (Admin) — Get a single asset with assignments, tickets, and events
assetRouter.get('/:id', authenticateUser, requireRoles(UserRole.ADMIN), getAssetById);

// Private (Admin) — Update asset fields by id
assetRouter.put('/:id', authenticateUser, requireRoles(UserRole.ADMIN), updateAsset);

// Private (Admin) — Soft-delete an asset by id
assetRouter.delete('/:id', authenticateUser, requireRoles(UserRole.ADMIN), deleteAsset);

export default assetRouter;
