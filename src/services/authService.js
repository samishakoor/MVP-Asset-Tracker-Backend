import UserModel from '../models/userModel.js';
import { EmailService } from './emailService.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import { hashPassword, comparePassword } from '../utils/passwordHelper.js';
import {
  signToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
  signEmailVerificationToken,
  verifyEmailVerificationToken,
} from '../utils/jwtHelper.js';
import { sanitizeUser } from '../utils/sanitizeUser.js';
import { CLIENT_URL } from '../config/index.js';
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
    this.emailService = new EmailService();
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
   * Registers a new employee account with an unverified email.
   *
   * @param {{ name: string, email: string, password: string }} userData - Validated signup payload.
   * @returns {Promise<{ user: object }>}
   * @throws {APIError}
   */
  async signup(userData) {
    try {
      const userEmail = userData.email.toLowerCase();
      const existingUser = await this.UserModel.findByEmail(userEmail);

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
        email: userEmail,
        passwordHash,
        role: UserRole.EMPLOYEE,
      });

      await this.sendVerificationEmailToUser(user);

      return { user: sanitizeUser(user) };
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
      const userEmail = credentials.email.toLowerCase();
      const user = await this.UserModel.findByEmail(userEmail);

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

      if (!user.isVerified) {
        throw new APIError(
          ERROR_MESSAGE.EMAIL_NOT_VERIFIED,
          STATUS_CODE.FORBIDDEN,
          ERROR_TYPE.AUTHENTICATION_ERROR
        );
      }

      return this.buildAuthResponse(user);
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Issues a JWT for a user authenticated via Google OAuth.
   *
   * @param {object} user - Passport-authenticated user record.
   * @returns {Promise<{ user: object, token: string }>}
   * @throws {APIError}
   */
  async loginWithGoogle(user) {
    try {
      if (!user || !user.id) {
        throw new APIError(
          ERROR_MESSAGE.INVALID_CREDENTIALS,
          STATUS_CODE.UNAUTHORIZED,
          ERROR_TYPE.AUTHENTICATION_ERROR
        );
      }

      const existingUser = await this.UserModel.findById(user.id);

      if (!existingUser) {
        throw new APIError(
          ERROR_MESSAGE.USER_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      if (!existingUser.isVerified) {
        throw new APIError(
          ERROR_MESSAGE.EMAIL_NOT_VERIFIED,
          STATUS_CODE.FORBIDDEN,
          ERROR_TYPE.AUTHENTICATION_ERROR
        );
      }

      return this.buildAuthResponse(existingUser);
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Sends a verification email to an existing unverified user record.
   *
   * @param {object} user - Prisma user record.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendVerificationEmailToUser(user) {
    if (user.isVerified) {
      throw new APIError(
        ERROR_MESSAGE.EMAIL_ALREADY_VERIFIED,
        STATUS_CODE.BAD_REQUEST,
        ERROR_TYPE.API_ERROR
      );
    }

    if (!CLIENT_URL) {
      throw new APIError(
        ERROR_MESSAGE.EMAIL_SEND_FAILED,
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        ERROR_TYPE.INTERNAL_ERROR
      );
    }

    const verificationToken = signEmailVerificationToken({
      id: user.id,
      email: user.email,
    });

    const verifyUrl = `${CLIENT_URL}/verify-email?token=${encodeURIComponent(verificationToken)}`;
    await this.emailService.sendEmailVerificationEmail(user.name, user.email, verifyUrl);
  }

  /**
   * Sends a verification email when the account exists and is not yet verified.
   * Used for resend requests after signup.
   *
   * @param {{ email: string }} payload - Validated send-verification-email payload.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendVerificationEmail(payload) {
    try {
      const userEmail = payload.email.toLowerCase();
      const user = await this.UserModel.findByEmail(userEmail);

      if (!user) {
        throw new APIError(
          ERROR_MESSAGE.ACCOUNT_EMAIL_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      await this.sendVerificationEmailToUser(user);
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Verifies a user's email using a valid verification JWT.
   *
   * @param {{ token: string }} payload - Validated verify-email payload.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async verifyEmail(payload) {
    try {
      const tokenPayload = verifyEmailVerificationToken(payload.token);

      if (!tokenPayload) {
        throw new APIError(
          ERROR_MESSAGE.INVALID_VERIFICATION_TOKEN,
          STATUS_CODE.BAD_REQUEST,
          ERROR_TYPE.API_ERROR
        );
      }

      const user = await this.UserModel.findByEmail(tokenPayload.email);

      if (!user || user.id !== tokenPayload.id) {
        throw new APIError(
          ERROR_MESSAGE.INVALID_VERIFICATION_TOKEN,
          STATUS_CODE.BAD_REQUEST,
          ERROR_TYPE.API_ERROR
        );
      }

      if (user.isVerified) {
        return;
      }

      await this.UserModel.markEmailVerified(user.id);
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Sends a password reset email when the account exists.
   *
   * @param {{ email: string }} payload - Validated forgot-password payload.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async forgotPassword(payload) {
    try {
      const userEmail = payload.email.toLowerCase();
      const user = await this.UserModel.findByEmail(userEmail);

      if (!user) {
        throw new APIError(
          ERROR_MESSAGE.ACCOUNT_EMAIL_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      if (!CLIENT_URL) {
        throw new APIError(
          ERROR_MESSAGE.EMAIL_SEND_FAILED,
          STATUS_CODE.INTERNAL_SERVER_ERROR,
          ERROR_TYPE.INTERNAL_ERROR
        );
      }

      const resetToken = signPasswordResetToken({
        id: user.id,
        email: user.email,
      });

      const resetUrl = `${CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
      await this.emailService.sendPasswordResetEmail(user.name, user.email, resetUrl);
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Resets a user's password using a valid reset JWT.
   *
   * @param {{ token: string, password: string }} payload - Validated reset-password payload.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async resetPassword(payload) {
    try {
      const tokenPayload = verifyPasswordResetToken(payload.token);

      if (!tokenPayload) {
        throw new APIError(
          ERROR_MESSAGE.INVALID_RESET_TOKEN,
          STATUS_CODE.BAD_REQUEST,
          ERROR_TYPE.API_ERROR
        );
      }

      const user = await this.UserModel.findById(tokenPayload.id);

      if (!user || user.email !== tokenPayload.email) {
        throw new APIError(
          ERROR_MESSAGE.INVALID_RESET_TOKEN,
          STATUS_CODE.BAD_REQUEST,
          ERROR_TYPE.API_ERROR
        );
      }

      const passwordHash = await hashPassword(payload.password);
      await this.UserModel.updatePasswordHash(user.id, passwordHash);
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }
}

export default AuthService;
