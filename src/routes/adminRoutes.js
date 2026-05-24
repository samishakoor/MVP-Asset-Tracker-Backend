import express from 'express';
import { getAdminSummary } from '../controllers/adminController.js';
import { getAuditLogs } from '../controllers/auditLogsController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { UserRole } from '../constants/index.js';

const adminRouter = express.Router();

// Protected routes — admin only
adminRouter.get(
  '/summary',
  authenticateUser,
  requireRoles(UserRole.ADMIN),
  getAdminSummary
);

adminRouter.get(
  '/audit-logs',
  authenticateUser,
  requireRoles(UserRole.ADMIN),
  getAuditLogs
);

export default adminRouter;
