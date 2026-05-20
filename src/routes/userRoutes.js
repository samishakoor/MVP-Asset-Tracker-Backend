import express from 'express';
import {
  getMyAssets,
  getMyAssetDetail,
  getMyHistory,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { UserRole } from '../constants/index.js';

const userRouter = express.Router();

// Employee routes — fetch own assignments
userRouter.get('/me/assets', authenticateUser, getMyAssets);
userRouter.get('/me/assets/:assetId', authenticateUser, getMyAssetDetail);
userRouter.get('/me/history', authenticateUser, getMyHistory);

// Admin routes — user management
userRouter.post('/', authenticateUser, requireRoles(UserRole.ADMIN), createUser);
userRouter.get('/', authenticateUser, requireRoles(UserRole.ADMIN), getAllUsers);
userRouter.get('/:id', authenticateUser, requireRoles(UserRole.ADMIN), getUserById);
userRouter.put('/:id', authenticateUser, requireRoles(UserRole.ADMIN), updateUser);
userRouter.delete('/:id', authenticateUser, requireRoles(UserRole.ADMIN), deleteUser);

export default userRouter;
