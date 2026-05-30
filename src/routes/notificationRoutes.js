import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { UserRole } from '../constants/index.js';

const notificationRouter = express.Router();

// Private (Employee) — Get paginated notifications for the logged-in user
notificationRouter.get('/', authenticateUser, requireRoles(UserRole.EMPLOYEE), getNotifications);

// Private (Employee) — Get unread notification count for the logged-in user
notificationRouter.get('/unread-count', authenticateUser, requireRoles(UserRole.EMPLOYEE), getUnreadCount);

// Private (Employee) — Mark a single notification as read by id
notificationRouter.patch('/:id/read', authenticateUser, requireRoles(UserRole.EMPLOYEE), markAsRead);

// Private (Employee) — Mark all notifications as read for the logged-in user
notificationRouter.patch('/read-all', authenticateUser, requireRoles(UserRole.EMPLOYEE), markAllAsRead);

export default notificationRouter;
