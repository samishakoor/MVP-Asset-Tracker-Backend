import UserModel from '../models/userModel.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import { hashPassword, comparePassword } from '../utils/passwordHelper.js';
import { signToken } from '../utils/jwtHelper.js';
import { sanitizeUser } from '../utils/sanitizeUser.js';
import {
  STATUS_CODE,
  ERROR_TYPE,
  ERROR_MESSAGE,
  UserRole,
} from '../constants/index.js';

/**
 * Service class for authentication (signup and login).
 */
export class AuthService {
  constructor() {
    this.UserModel = new UserModel();
  }

  /**
   * Builds a JWT payload and token for a user.
   *
   * @param {object} user - Prisma user record.
   * @returns {{ user: object, token: string }}
   */
  buildAuthResponse(user) {
    const sanitized = sanitizeUser(user);
    const token = signToken({
      id: sanitized.id,
      email: sanitized.email,
      name: sanitized.name,
      roles: [sanitized.role],
    });

    return { user: sanitized, token };
  }

  /**
   * Registers a new employee account.
   *
   * @param {{ name: string, email: string, password: string }} userData - Validated signup payload.
   * @returns {Promise<{ user: object, token: string }>}
   * @throws {APIError}
   */
  async signup(userData) {
    try {
      const existingUser = await this.UserModel.findByEmail(userData.email);

      if (existingUser) {
        throw new APIError(
          ERROR_MESSAGE.USER_ALREADY_EXIST,
          STATUS_CODE.CONFLICT,
          ERROR_TYPE.API_ERROR
        );
      }

      const passwordHash = await hashPassword(userData.password);

      const user = await this.UserModel.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: UserRole.EMPLOYEE,
      });

      return this.buildAuthResponse(user);
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Authenticates a user with email and password.
   *
   * @param {{ email: string, password: string }} credentials - Validated login payload.
   * @returns {Promise<{ user: object, token: string }>}
   * @throws {APIError}
   */
  async login(credentials) {
    try {
      const user = await this.UserModel.findByEmail(credentials.email);

      if (!user) {
        throw new APIError(
          ERROR_MESSAGE.INVALID_CREDENTIALS,
          STATUS_CODE.UNAUTHORIZED,
          ERROR_TYPE.AUTHENTICATION_ERROR
        );
      }

      const passwordMatches = await comparePassword(credentials.password, user.passwordHash);

      if (!passwordMatches) {
        throw new APIError(
          ERROR_MESSAGE.INVALID_CREDENTIALS,
          STATUS_CODE.UNAUTHORIZED,
          ERROR_TYPE.AUTHENTICATION_ERROR
        );
      }

      return this.buildAuthResponse(user);
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }
}

export default AuthService;
