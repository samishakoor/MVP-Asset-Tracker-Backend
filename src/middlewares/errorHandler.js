import APIError from '../utils/APIError.js';
import { STATUS_CODE, ERROR_TYPE } from '../constants/index.js';

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
