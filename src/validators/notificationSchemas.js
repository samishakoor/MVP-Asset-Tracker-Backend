import Joi from 'joi';

export const notificationIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const getNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
