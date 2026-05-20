import catchAsync from '../utils/catchAsync.js';
import APIError from '../utils/APIError.js';
import { STATUS_CODE, ERROR_TYPE, SUCCESS_MESSAGE } from '../constants/index.js';
import { successWithData } from '../utils/response.js';
import logger from '../utils/logger.js';
import { SupportTicketService } from '../services/supportTicketService.js';
import {
  createTicketSchema,
  ticketIdSchema,
  reviewTicketSchema,
} from '../validators/supportTicketSchemas.js';

const supportTicketService = new SupportTicketService();

export const createTicket = catchAsync(async (req, res, next) => {
  const { error, value: validatedBody } = createTicketSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await supportTicketService.createTicket(
    validatedBody.assignmentId,
    req.user.id,
    validatedBody.description
  );
  res.status(STATUS_CODE.CREATED).json(successWithData(data, SUCCESS_MESSAGE.TICKET_CREATED));
});

export const getAllTickets = catchAsync(async (req, res, next) => {
  const data = await supportTicketService.getAllTickets();
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.TICKETS_FETCHED));
});

export const reviewTicket = catchAsync(async (req, res, next) => {
  const { error: paramError, value: validatedParams } = ticketIdSchema.validate(req.params, {
    abortEarly: false,
  });
  if (paramError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: paramError.message });
    return next(
      new APIError(paramError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const { error: bodyError, value: validatedBody } = reviewTicketSchema.validate(req.body, {
    abortEarly: false,
  });
  if (bodyError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: bodyError.message });
    return next(
      new APIError(bodyError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await supportTicketService.reviewTicket(
    validatedParams.id,
    req.user.id,
    validatedBody.action,
    validatedBody.adminNotes
  );
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.TICKET_REVIEWED));
});
