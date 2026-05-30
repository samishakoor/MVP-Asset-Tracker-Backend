import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const notificationRouter = express.Router();

// Private (Employee) — Get paginated notifications for the logged-in user
notificationRouter.get('/', authenticateUser, getNotifications);

// Private (Employee) — Get unread notification count for the logged-in user
notificationRouter.get('/unread-count', authenticateUser, getUnreadCount);

// Private (Employee) — Mark a single notification as read by id
notificationRouter.patch('/:id/read', authenticateUser, markAsRead);

// Private (Employee) — Mark all notifications as read for the logged-in user
notificationRouter.patch('/read-all', authenticateUser, markAllAsRead);

export default notificationRouter;
