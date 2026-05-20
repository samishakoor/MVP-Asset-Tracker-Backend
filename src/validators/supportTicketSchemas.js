import Joi from 'joi';

export const createTicketSchema = Joi.object({
  assignmentId: Joi.string().uuid().required(),
  description: Joi.string().trim().min(1).max(2000).required(),
});

export const ticketIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const reviewTicketSchema = Joi.object({
  action: Joi.string().valid('start_repair', 'resolve').required(),
  adminNotes: Joi.string().trim().max(2000).optional().allow(''),
});
