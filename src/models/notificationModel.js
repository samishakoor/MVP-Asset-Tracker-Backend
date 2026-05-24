import prisma from '../config/database.js';

/**
 * Notification model for database operations.
 * Handles CRUD operations for employee notifications.
 */
class NotificationModel {
  /**
   * Create a new notification
   * @param {Object} data - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async create(data) {
    return await prisma.notification.create({
      data,
    });
  }

  /**
   * Find notifications by user ID with pagination
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of notifications
   * @param {number} offset - Number of notifications to skip
   * @returns {Promise<Object[]>} List of notifications
   */
  async findByUserId(userId, limit, offset) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Count unread notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Count of unread notifications
   */
  async countUnread(userId) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Find notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Object|null>} Notification or null
   */
  async findById(id) {
    return await prisma.notification.findUnique({
      where: { id },
    });
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(id) {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Update result with count
   */
  async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}

export default NotificationModel;
