import express from 'express';
import {
  assignAsset,
  acknowledgeAsset,
  returnAsset,
  cancelAssignment,
  updateAssignmentStatus,
} from '../controllers/assignmentController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { UserRole } from '../constants/index.js';

const assignmentRouter = express.Router();

// Admin routes — assign, return, and update assignment status
assignmentRouter.post('/', authenticateUser, requireRoles(UserRole.ADMIN), assignAsset);
assignmentRouter.patch(
  '/:id/status',
  authenticateUser,
  requireRoles(UserRole.ADMIN),
  updateAssignmentStatus
);
assignmentRouter.patch('/:id/return', authenticateUser, requireRoles(UserRole.ADMIN), returnAsset);
assignmentRouter.patch(
  '/:id/cancel',
  authenticateUser,
  requireRoles(UserRole.ADMIN),
  cancelAssignment
);

// Employee routes — acknowledge assignments
assignmentRouter.patch('/:id/acknowledge', authenticateUser, acknowledgeAsset);

export default assignmentRouter;
