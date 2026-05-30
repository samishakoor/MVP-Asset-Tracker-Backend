import express from 'express';
import { getAdminSummary } from '../controllers/adminController.js';
import { getAuditLogs } from '../controllers/auditLogsController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { UserRole } from '../constants/index.js';

const adminRouter = express.Router();

// Private (Admin) — Get dashboard summary counts and recent activity
adminRouter.get(
  '/summary',
  authenticateUser,
  requireRoles(UserRole.ADMIN),
  getAdminSummary
);

// Private (Admin) — Get paginated audit log events
adminRouter.get(
  '/audit-logs',
  authenticateUser,
  requireRoles(UserRole.ADMIN),
  getAuditLogs
);

export default adminRouter;
