import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const notificationRouter = express.Router();

// All notification routes require authentication
// Get user notifications with pagination
notificationRouter.get('/', authenticateUser, getNotifications);

// Get unread notification count
notificationRouter.get('/unread-count', authenticateUser, getUnreadCount);

// Mark single notification as read
notificationRouter.patch('/:id/read', authenticateUser, markAsRead);

// Mark all notifications as read
notificationRouter.patch('/read-all', authenticateUser, markAllAsRead);

export default notificationRouter;
