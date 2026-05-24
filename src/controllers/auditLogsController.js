import Joi from 'joi';
import catchAsync from '../utils/catchAsync.js';
import { STATUS_CODE, SUCCESS_MESSAGE, ERROR_TYPE } from '../constants/index.js';
import { successWithData } from '../utils/response.js';
import { AuditLogsService } from '../services/auditLogsService.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';

const auditLogsService = new AuditLogsService();

const auditLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const getAuditLogs = catchAsync(async (req, res, next) => {
  const { error, value: validatedQuery } = auditLogsQuerySchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(', ');
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message });
    return next(
      new APIError(message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await auditLogsService.getAuditLogs({
    page: validatedQuery.page,
    limit: validatedQuery.limit,
  });

  res
    .status(STATUS_CODE.OK)
    .json(successWithData(data, SUCCESS_MESSAGE.AUDIT_LOGS_FETCHED));
});
