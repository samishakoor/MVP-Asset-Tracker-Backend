import NotificationModel from '../models/notificationModel.js';
import { PaginationService } from './paginationService.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import { STATUS_CODE, ERROR_TYPE, ERROR_MESSAGE, NotificationType } from '../constants/index.js';

/**
 * Notification service for business logic.
 * Manages notifications for employees - creation, retrieval, and read status.
 */
export class NotificationService {
  constructor() {
    this.NotificationModel = new NotificationModel();
    this.PaginationService = new PaginationService();
  }

  /**
   * Create a notification for a user
   * @param {Object} data - Notification data
   * @param {string} data.userId - User ID to notify
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {string} data.type - Notification type
   * @param {string} [data.assetId] - Related asset ID
   * @param {string} [data.assetName] - Related asset name
   * @returns {Promise<Object>} Created notification
   * @throws {APIError} If creation fails
   */
  async createNotification(data) {
    try {
      const notification = await this.NotificationModel.create({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        assetId: data.assetId,
        assetName: data.assetName,
      });

      return notification;
    } catch (err) {
      logger.error({
        errorType: ERROR_TYPE.API_ERROR,
        message: err.message,
      });
      throw err;
    }
  }

  /**
   * Get notifications for authenticated user with pagination
   * @param {string} userId - User ID
   * @param {object} query - Validated pagination query
   * @returns {Promise<Object>} Notifications, unread count, and pagination metadata
   * @throws {APIError} If fetch fails
   */
  async getUserNotifications(userId, query) {
    try {
      const notificationsSortFieldMap = {
        createdAt: (order) => ({ createdAt: order }),
      };

      const paginationConfig = {
        defaultPage: 1,
        defaultPerPage: 10,
        defaultSortBy: 'createdAt',
        defaultOrderBy: 'desc',
        allowedSortFields: ['createdAt'],
      };

      const resolved = this.PaginationService.resolveQuery(query, paginationConfig);
      const prismaOrderBy = this.PaginationService.buildPrismaOrderBy(
        resolved,
        notificationsSortFieldMap
      );

      const paginated = await this.PaginationService.paginate(
        resolved,
        (params) =>
          this.NotificationModel.findByUserId(
            userId,
            params.take,
            params.skip,
            prismaOrderBy
          ),
        () => this.NotificationModel.countByUserId(userId)
      );

      const unreadCount = await this.NotificationModel.countUnread(userId);

      return {
        notifications: paginated.items,
        unreadCount,
        pagination: paginated.pagination,
      };
    } catch (err) {
      logger.error({
        errorType: ERROR_TYPE.API_ERROR,
        message: err.message,
      });
      throw err;
    }
  }

  /**
   * Get unread notification count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread notification count
   * @throws {APIError} If count fails
   */
  async getUnreadCount(userId) {
    try {
      return await this.NotificationModel.countUnread(userId);
    } catch (err) {
      logger.error({
        errorType: ERROR_TYPE.API_ERROR,
        message: err.message,
      });
      throw err;
    }
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for ownership check)
   * @returns {Promise<Object>} Updated notification
   * @throws {APIError} If notification not found or not owned by user
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await this.NotificationModel.findById(notificationId);

      if (!notification) {
        throw new APIError(
          ERROR_MESSAGE.NOTIFICATION_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      if (notification.userId !== userId) {
        throw new APIError(
          ERROR_MESSAGE.INSUFFICIENT_PERMISSIONS,
          STATUS_CODE.FORBIDDEN,
          ERROR_TYPE.AUTHORIZATION_ERROR
        );
      }

      const updated = await this.NotificationModel.markAsRead(notificationId);
      return updated;
    } catch (err) {
      logger.error({
        errorType: ERROR_TYPE.API_ERROR,
        message: err.message,
      });
      throw err;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Update result with count
   * @throws {APIError} If update fails
   */
  async markAllAsRead(userId) {
    try {
      const result = await this.NotificationModel.markAllAsRead(userId);
      return result;
    } catch (err) {
      logger.error({
        errorType: ERROR_TYPE.API_ERROR,
        message: err.message,
      });
      throw err;
    }
  }
}

export default NotificationService;
