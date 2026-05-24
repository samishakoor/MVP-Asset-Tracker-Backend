import Joi from 'joi';

export const notificationIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const getNotificationsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional(),
  offset: Joi.number().integer().min(0).optional(),
});
