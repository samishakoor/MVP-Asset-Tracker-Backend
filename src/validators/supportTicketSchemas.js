import Joi from 'joi';
import { TicketStatus } from '../constants/index.js';
import { createPaginationQuerySchema } from './paginationSchemas.js';

const ticketStatusValues = Object.values(TicketStatus);

export const getAllTicketsQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...ticketStatusValues)
    .optional(),
}).concat(
  createPaginationQuerySchema({
    allowedSortFields: ['createdAt', 'status'],
    defaultPage: 1,
    defaultPerPage: 15,
    defaultSortBy: 'createdAt',
    defaultOrderBy: 'desc',
  })
);

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
