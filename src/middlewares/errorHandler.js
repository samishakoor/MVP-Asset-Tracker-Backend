import APIError from '../utils/APIError.js';
import { STATUS_CODE, ERROR_TYPE } from '../constants/index.js';

/**
 * Express error middleware. Sends JSON with statusCode, message, and errorType from APIError.
 * Register after all routes and notFound; includes stack in development for non-APIError errors.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR;
  const errorType = err.errorType || ERROR_TYPE.INTERNAL_ERROR;
  const message = err.message || 'Internal Server Error';

  if (!(err instanceof APIError)) {
    console.error({ errorType: ERROR_TYPE.INTERNAL_ERROR, message: err.message, stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorType,
    ...(process.env.NODE_ENV === 'development' && err.stack && { stack: err.stack }),
  });
};

export default errorHandler;
