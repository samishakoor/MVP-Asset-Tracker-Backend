import catchAsync from '../utils/catchAsync.js';
import { STATUS_CODE, SUCCESS_MESSAGE, ERROR_TYPE } from '../constants/index.js';
import { successWithData } from '../utils/response.js';
import { AuditLogsService } from '../services/auditLogsService.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import {
  auditLogsPaginationSchema,
  queryValidateOptions,
} from '../validators/paginationSchemas.js';

const auditLogsService = new AuditLogsService();

export const getAuditLogs = catchAsync(async (req, res, next) => {
  const { error, value: validatedQuery } = auditLogsPaginationSchema.validate(
    req.query,
    queryValidateOptions
  );

  if (error) {
    const message = error.details.map((detail) => detail.message).join(', ');
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message });
    return next(
      new APIError(message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await auditLogsService.getAuditLogs(validatedQuery);

  res
    .status(STATUS_CODE.OK)
    .json(successWithData(data, SUCCESS_MESSAGE.AUDIT_LOGS_FETCHED));
});
