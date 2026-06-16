import catchAsync from '../utils/catchAsync.js';
import APIError from '../utils/APIError.js';
import { STATUS_CODE, ERROR_TYPE, SUCCESS_MESSAGE } from '../constants/index.js';
import { success, successWithData } from '../utils/response.js';
import logger from '../utils/logger.js';
import { UserService } from '../services/userService.js';
import { AssignmentService } from '../services/assignmentService.js';
import {
  createUserSchema,
  updateUserSchema,
  updateMyProfileSchema,
  userIdParamSchema,
  assetIdParamForUserSchema,
} from '../validators/userSchemas.js';
import {
  myHistoryPaginationSchema,
  queryValidateOptions,
} from '../validators/paginationSchemas.js';

const userService = new UserService();
const assignmentService = new AssignmentService();

export const getMyAssets = catchAsync(async (req, res, next) => {
  const data = await assignmentService.getMyActiveAssets(req.user.id);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.MY_ASSETS_FETCHED));
});

export const getMyAssetDetail = catchAsync(async (req, res, next) => {
  const { error, value: validatedParams } = assetIdParamForUserSchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await assignmentService.getMyAssetDetail(req.user.id, validatedParams.assetId);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.MY_ASSET_DETAIL_FETCHED));
});

export const getMyHistory = catchAsync(async (req, res, next) => {
  const { error, value: validatedQuery } = myHistoryPaginationSchema.validate(
    req.query,
    queryValidateOptions
  );

  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await assignmentService.getMyHistory(req.user.id, validatedQuery);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.MY_HISTORY_FETCHED));
});

export const getMyProfile = catchAsync(async (req, res) => {
  const data = await userService.getMyProfile(req.user.id);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.MY_PROFILE_FETCHED));
});

export const updateMyProfile = catchAsync(async (req, res, next) => {
  const { error, value: validatedBody } = updateMyProfileSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await userService.updateMyProfile(req.user.id, validatedBody);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.MY_PROFILE_UPDATED));
});

export const getAllUsers = catchAsync(async (req, res) => {
  const data = await userService.getAllUsers();
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.USERS_FETCHED));
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { error, value: validatedParams } = userIdParamSchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await userService.getUserById(validatedParams.id);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.USER_FETCHED));
});

export const createUser = catchAsync(async (req, res, next) => {
  const { error, value: validatedParams } = createUserSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await userService.createUser(validatedParams);
  res.status(STATUS_CODE.CREATED).json(successWithData(data, SUCCESS_MESSAGE.USER_CREATED));
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { error: paramsError, value: validatedParams } = userIdParamSchema.validate(
    req.params,
    { abortEarly: false }
  );
  if (paramsError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: paramsError.message });
    return next(
      new APIError(paramsError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const { error: bodyError, value: validatedBody } = updateUserSchema.validate(req.body, {
    abortEarly: false,
  });
  if (bodyError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: bodyError.message });
    return next(
      new APIError(bodyError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await userService.updateUser(validatedParams.id, validatedBody);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.USER_UPDATED));
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const { error, value: validatedParams } = userIdParamSchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  await userService.deleteUser(validatedParams.id);
  res.status(STATUS_CODE.OK).json(success(SUCCESS_MESSAGE.USER_DELETED));
});
