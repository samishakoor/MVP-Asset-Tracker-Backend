import catchAsync from '../utils/catchAsync.js';
import APIError from '../utils/APIError.js';
import { STATUS_CODE, ERROR_TYPE, SUCCESS_MESSAGE } from '../constants/index.js';
import { successWithData, success } from '../utils/response.js';
import logger from '../utils/logger.js';
import { NotificationService } from '../services/notificationService.js';
import { notificationIdSchema } from '../validators/notificationSchemas.js';
import { notificationsPaginationSchema } from '../validators/paginationSchemas.js';

const notificationService = new NotificationService();

export const getNotifications = catchAsync(async (req, res, next) => {
  const { error, value: validatedQuery } = notificationsPaginationSchema.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await notificationService.getUserNotifications(req.user.id, validatedQuery);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.NOTIFICATIONS_FETCHED));
});

export const getUnreadCount = catchAsync(async (req, res, next) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  res.status(STATUS_CODE.OK).json(successWithData({ count }, SUCCESS_MESSAGE.NOTIFICATIONS_FETCHED));
});

export const markAsRead = catchAsync(async (req, res, next) => {
  const { error, value: validatedParams } = notificationIdSchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await notificationService.markAsRead(validatedParams.id, req.user.id);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.NOTIFICATION_MARKED_READ));
});

export const markAllAsRead = catchAsync(async (req, res, next) => {
  const data = await notificationService.markAllAsRead(req.user.id);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.ALL_NOTIFICATIONS_MARKED_READ));
});
