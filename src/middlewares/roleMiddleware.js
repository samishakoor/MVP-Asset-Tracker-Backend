import catchAsync from '../utils/catchAsync.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import { STATUS_CODE, ERROR_TYPE, ERROR_MESSAGE } from '../constants/index.js';

/**
 * Returns true if the user has at least one of the allowed roles.
 *
 * @param {string[]} allowedRoles - Roles required for the route.
 * @param {string[]} userRoles - Roles from req.user (JWT payload).
 * @returns {boolean}
 */
export function matchRoles(allowedRoles, userRoles) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return true;
  }
  if (!Array.isArray(userRoles) || userRoles.length === 0) {
    return false;
  }
  return allowedRoles.some((role) => userRoles.includes(role));
}

/**
 * Use after authenticateUser so req.user is set.
 *
 * @param {...string} allowedRoles - One or more role values (e.g. UserRole.ADMIN).
 * @returns {import('express').RequestHandler}
 */
export function requireRoles(...allowedRoles) {
  return catchAsync(async (req, res, next) => {
    if (allowedRoles.length === 0) {
      return next();
    }

    const user = req.user;

    if (!user) {
      logger.error({
        errorType: ERROR_TYPE.AUTHENTICATION_ERROR,
        message: ERROR_MESSAGE.USER_NOT_AUTHENTICATED,
      });
      return next(
        new APIError(
          ERROR_MESSAGE.USER_NOT_AUTHENTICATED,
          STATUS_CODE.UNAUTHORIZED,
          ERROR_TYPE.AUTHENTICATION_ERROR
        )
      );
    }

    const userRoles = user.roles;

    if (!userRoles) {
      logger.error({
        errorType: ERROR_TYPE.AUTHORIZATION_ERROR,
        message: ERROR_MESSAGE.USER_ROLES_NOT_FOUND,
      });
      return next(
        new APIError(
          ERROR_MESSAGE.USER_ROLES_NOT_FOUND,
          STATUS_CODE.FORBIDDEN,
          ERROR_TYPE.AUTHORIZATION_ERROR
        )
      );
    }

    const rolesList = Array.isArray(userRoles) ? userRoles : [userRoles];

    if (!matchRoles(allowedRoles, rolesList)) {
      logger.error({
        errorType: ERROR_TYPE.AUTHORIZATION_ERROR,
        message: ERROR_MESSAGE.INSUFFICIENT_PERMISSIONS,
      });
      return next(
        new APIError(
          ERROR_MESSAGE.INSUFFICIENT_PERMISSIONS,
          STATUS_CODE.FORBIDDEN,
          ERROR_TYPE.AUTHORIZATION_ERROR
        )
      );
    }

    next();
  });
}
