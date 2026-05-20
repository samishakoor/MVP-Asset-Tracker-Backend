import catchAsync from '../utils/catchAsync.js';
import APIError from '../utils/APIError.js';
import { STATUS_CODE, ERROR_TYPE, SUCCESS_MESSAGE } from '../constants/index.js';
import { successWithData } from '../utils/response.js';
import logger from '../utils/logger.js';
import { AuthService } from '../services/authService.js';
import { signupSchema, loginSchema } from '../validators/authSchemas.js';

const authService = new AuthService();

export const signup = catchAsync(async (req, res, next) => {
  const { error, value: validatedBody } = signupSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await authService.signup(validatedBody);
  res.status(STATUS_CODE.CREATED).json(successWithData(data, SUCCESS_MESSAGE.SIGNUP_SUCCESS));
});

export const login = catchAsync(async (req, res, next) => {
  const { error, value: validatedBody } = loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await authService.login(validatedBody);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.LOGIN_SUCCESS));
});
