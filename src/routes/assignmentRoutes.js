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

// Private (Admin) — Assign an available asset to an employee
assignmentRouter.post('/', authenticateUser, requireRoles(UserRole.ADMIN), assignAsset);

// Private (Admin) — Update assignment workflow status by assignment id
assignmentRouter.patch(
  '/:id/status',
  authenticateUser,
  requireRoles(UserRole.ADMIN),
  updateAssignmentStatus
);

// Private (Admin) — Mark an assignment as returned by assignment id
assignmentRouter.patch('/:id/return', authenticateUser, requireRoles(UserRole.ADMIN), returnAsset);

// Private (Admin) — Cancel an unacknowledged assignment by assignment id
assignmentRouter.patch(
  '/:id/cancel',
  authenticateUser,
  requireRoles(UserRole.ADMIN),
  cancelAssignment
);

// Private (Employee) — Acknowledge receipt of an assigned asset by assignment id
assignmentRouter.patch('/:id/acknowledge', authenticateUser, requireRoles(UserRole.EMPLOYEE), acknowledgeAsset);

export default assignmentRouter;
