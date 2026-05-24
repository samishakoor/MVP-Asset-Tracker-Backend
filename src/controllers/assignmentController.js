import catchAsync from '../utils/catchAsync.js';
import APIError from '../utils/APIError.js';
import { STATUS_CODE, ERROR_TYPE, SUCCESS_MESSAGE } from '../constants/index.js';
import { successWithData } from '../utils/response.js';
import logger from '../utils/logger.js';
import { AssignmentService } from '../services/assignmentService.js';
import {
  assignAssetSchema,
  assignmentIdSchema,
  acknowledgeAssetSchema,
  returnAssetSchema,
  cancelAssignmentSchema,
  updateAssignmentStatusSchema,
} from '../validators/assignmentSchemas.js';

const assignmentService = new AssignmentService();

export const assignAsset = catchAsync(async (req, res, next) => {
  const { error, value: validatedBody } = assignAssetSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await assignmentService.assignAsset(
    validatedBody.assetId,
    validatedBody.employeeId,
    req.user.id,
    validatedBody.assignedAt
  );
  res
    .status(STATUS_CODE.CREATED)
    .json(successWithData(data, SUCCESS_MESSAGE.ASSIGNMENT_CREATED));
});

export const acknowledgeAsset = catchAsync(async (req, res, next) => {
  const { error: paramError, value: validatedParams } = acknowledgeAssetSchema.validate(
    req.params,
    {
      abortEarly: false,
    }
  );
  if (paramError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: paramError.message });
    return next(
      new APIError(paramError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await assignmentService.acknowledgeAsset(validatedParams.id, req.user.id);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.ASSIGNMENT_ACKNOWLEDGED));
});

export const returnAsset = catchAsync(async (req, res, next) => {
  const { error: paramError, value: validatedParams } = returnAssetSchema.validate(req.params, {
    abortEarly: false,
  });
  if (paramError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: paramError.message });
    return next(
      new APIError(paramError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await assignmentService.returnAsset(validatedParams.id, req.user.id);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.ASSIGNMENT_RETURNED));
});

export const cancelAssignment = catchAsync(async (req, res, next) => {
  const { error: paramError, value: validatedParams } = cancelAssignmentSchema.validate(
    req.params,
    {
      abortEarly: false,
    }
  );
  if (paramError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: paramError.message });
    return next(
      new APIError(paramError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await assignmentService.cancelAssignment(validatedParams.id, req.user.id);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.ASSIGNMENT_CANCELLED));
});

export const updateAssignmentStatus = catchAsync(async (req, res, next) => {
  const { error: paramError, value: validatedParams } = assignmentIdSchema.validate(
    req.params,
    { abortEarly: false }
  );
  if (paramError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: paramError.message });
    return next(
      new APIError(paramError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const { error: bodyError, value: validatedBody } = updateAssignmentStatusSchema.validate(
    req.body,
    { abortEarly: false }
  );
  if (bodyError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: bodyError.message });
    return next(
      new APIError(bodyError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await assignmentService.updateAssignmentStatus(
    validatedParams.id,
    validatedBody.currentStatus,
    req.user.id
  );
  res
    .status(STATUS_CODE.OK)
    .json(successWithData(data, SUCCESS_MESSAGE.ASSIGNMENT_STATUS_UPDATED));
});
