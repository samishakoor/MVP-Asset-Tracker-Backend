import Joi from 'joi';

export const notificationIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

