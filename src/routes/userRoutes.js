import express from 'express';
import {
  getMyAssets,
  getMyAssetDetail,
  getMyHistory,
  getMyProfile,
  updateMyProfile,
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

// Private (Employee) — Get the logged-in employee's profile
userRouter.get('/me/profile', authenticateUser, requireRoles(UserRole.EMPLOYEE), getMyProfile);

// Private (Employee) — Update the logged-in employee's profile name
userRouter.patch('/me/profile', authenticateUser, requireRoles(UserRole.EMPLOYEE), updateMyProfile);

// Private (Employee) — List active asset assignments for the logged-in employee
userRouter.get('/me/assets', authenticateUser, requireRoles(UserRole.EMPLOYEE), getMyAssets);

// Private (Employee) — Get detail for one assigned asset by asset id
userRouter.get('/me/assets/:assetId', authenticateUser, requireRoles(UserRole.EMPLOYEE), getMyAssetDetail);

// Private (Employee) — Get paginated history of returned assignments
userRouter.get('/me/history', authenticateUser, requireRoles(UserRole.EMPLOYEE), getMyHistory);

// Private (Admin) — Create a new user account
userRouter.post('/', authenticateUser, requireRoles(UserRole.ADMIN), createUser);

// Private (Admin) — List all users
userRouter.get('/', authenticateUser, requireRoles(UserRole.ADMIN), getAllUsers);

// Private (Admin) — Get a single user by id
userRouter.get('/:id', authenticateUser, requireRoles(UserRole.ADMIN), getUserById);

// Private (Admin) — Update a user by id
userRouter.put('/:id', authenticateUser, requireRoles(UserRole.ADMIN), updateUser);

// Private (Admin) — Delete a user by id
userRouter.delete('/:id', authenticateUser, requireRoles(UserRole.ADMIN), deleteUser);

export default userRouter;
