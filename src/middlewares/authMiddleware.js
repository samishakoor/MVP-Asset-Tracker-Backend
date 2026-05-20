import catchAsync from '../utils/catchAsync.js';
import APIError from '../utils/APIError.js';
import { verifyToken } from '../utils/jwtHelper.js';
import logger from '../utils/logger.js';
import { STATUS_CODE, ERROR_TYPE, ERROR_MESSAGE } from '../constants/index.js';

export const authenticateUser = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    logger.error({
      errorType: ERROR_TYPE.AUTHENTICATION_ERROR,
      message: ERROR_MESSAGE.TOKEN_NOT_FOUND,
    });
    return next(
      new APIError(
        ERROR_MESSAGE.TOKEN_NOT_FOUND,
        STATUS_CODE.UNAUTHORIZED,
        ERROR_TYPE.AUTHENTICATION_ERROR
      )
    );
  }

  const tokenPayload = await verifyToken(token);

  if (!tokenPayload) {
    logger.error({
      errorType: ERROR_TYPE.AUTHENTICATION_ERROR,
      message: ERROR_MESSAGE.ACCESS_TOKEN_EXPIRED,
    });
    return next(
      new APIError(
        ERROR_MESSAGE.ACCESS_TOKEN_EXPIRED,
        STATUS_CODE.UNAUTHORIZED,
        ERROR_TYPE.AUTHENTICATION_ERROR
      )
    );
  }

  req.user = tokenPayload;

  next();
});
