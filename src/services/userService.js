import UserModel from '../models/userModel.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import { hashPassword } from '../utils/passwordHelper.js';
import { STATUS_CODE, ERROR_TYPE, ERROR_MESSAGE, UserRole } from '../constants/index.js';

/**
 * Service class for user-related operations i.e. list, get, create, update, delete.
 */
export class UserService {
  constructor() {
    this.UserModel = new UserModel();
  }

  /**
   * Returns all users.
   *
   * @returns {Promise<Array>}
   * @throws {APIError}
   */
  async getAllUsers() {
    try {
      return await this.UserModel.findAll();
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Returns a single user by id.
   *
   * @param {string} id - User UUID.
   * @returns {Promise<object>}
   * @throws {APIError}
   */
  async getUserById(id) {
    try {
      const user = await this.UserModel.findById(id);

      if (!user) {
        throw new APIError(
          ERROR_MESSAGE.USER_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.API_ERROR
        );
      }

      return user;
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Creates a new user with password hashing and role assignment.
   *
   * @param {{ email: string, password: string, name: string, role?: string }} userData - Validated user payload.
   * @returns {Promise<object>}
   * @throws {APIError}
   */
  async createUser(userData) {
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
      const role = userData.role || UserRole.EMPLOYEE;

      const user = await this.UserModel.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Updates an existing user.
   *
   * @param {string} id - User UUID.
   * @param {{ email?: string, name?: string }} userData - Validated update payload.
   * @returns {Promise<object>}
   * @throws {APIError}
   */
  async updateUser(id, userData) {
    try {
      return await this.UserModel.update(id, userData);
    } catch (err) {
      if (err.code === 'P2025') {
        throw new APIError(
          ERROR_MESSAGE.USER_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.API_ERROR
        );
      }
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Deletes a user by id.
   *
   * @param {string} id - User UUID.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async deleteUser(id) {
    try {
      await this.UserModel.delete(id);
    } catch (err) {
      if (err.code === 'P2025') {
        throw new APIError(
          ERROR_MESSAGE.USER_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.API_ERROR
        );
      }
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }
}

export default UserService;
