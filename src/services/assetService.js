import AssetModel from '../models/assetModel.js';
import AssetEventModel from '../models/assetEventModel.js';
import UserModel from '../models/userModel.js';
import SupportTicketModel from '../models/supportTicketModel.js';
import buildTargetEmployeeNameByEventId from '../utils/resolveEventTargetEmployeeNames.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import { normalizeAssetType, isValidAssetType } from '../utils/normalizeAssetType.js';
import {
  STATUS_CODE,
  ERROR_TYPE,
  ERROR_MESSAGE,
  AssetStatus,
  EventType,
  DEFAULT_ASSET_TYPES,
} from '../constants/index.js';

/**
 * Service class for asset inventory and lifecycle operations.
 */
export class AssetService {
  constructor() {
    this.AssetModel = new AssetModel();
    this.AssetEventModel = new AssetEventModel();
    this.UserModel = new UserModel();
    this.SupportTicketModel = new SupportTicketModel();
  }

  /**
   * Maps a list asset record with active assignment to API shape.
   *
   * @param {object} asset - Prisma asset with assignments include.
   * @returns {object}
   */
  formatListAsset(asset) {
    const activeAssignment =
      asset.assignments && asset.assignments.length > 0 ? asset.assignments[0] : null;

    const displayStatus = activeAssignment
      ? activeAssignment.currentStatus
      : asset.status;

    const formatted = {
      id: asset.id,
      name: asset.name,
      assetType: asset.assetType,
      serialNumber: asset.serialNumber,
      condition: asset.condition,
      status: displayStatus,
      notes: asset.notes,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      currentAssignment: null,
      assignedEmployeeName: null,
    };

    if (activeAssignment) {
      formatted.currentAssignment = {
        id: activeAssignment.id,
        assetId: activeAssignment.assetId,
        employeeId: activeAssignment.employeeId,
        assignedBy: activeAssignment.assignedBy,
        assignedAt: activeAssignment.assignedAt,
        acknowledgedAt: activeAssignment.acknowledgedAt,
        returnedAt: activeAssignment.returnedAt,
        isActive: activeAssignment.isActive,
        currentStatus: activeAssignment.currentStatus,
      };
      if (activeAssignment.employee) {
        formatted.assignedEmployeeName = activeAssignment.employee.name;
      }
    }

    return formatted;
  }

  /**
   * Builds Prisma where clause from list filters.
   *
   * @param {{ status?: string, assetType?: string, employeeId?: string, hasActiveAssignment?: boolean }} filters
   * @returns {object}
   */
  buildListWhereClause(filters) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.assetType) {
      where.assetType = filters.assetType;
    }

    if (filters.employeeId) {
      where.assignments = {
        some: {
          employeeId: filters.employeeId,
          isActive: true,
        },
      };
    } else if (filters.hasActiveAssignment) {
      where.assignments = {
        some: {
          isActive: true,
        },
      };
    }

    return where;
  }

  /**
   * Normalizes and validates a user-provided asset type slug.
   *
   * @param {string} raw - Raw asset type input.
   * @returns {string}
   * @throws {APIError}
   */
  resolveAssetType(raw) {
    const normalized = normalizeAssetType(raw);

    if (!isValidAssetType(normalized)) {
      throw new APIError(
        'Asset type must be 1–64 characters and use letters, numbers, hyphens, or underscores',
        STATUS_CODE.BAD_REQUEST,
        ERROR_TYPE.VALIDATION_ERROR
      );
    }

    return normalized;
  }

  /**
   * Returns default and custom asset types used in the inventory.
   *
   * @returns {Promise<{ defaults: string[], custom: string[], all: string[] }>}
   * @throws {APIError}
   */
  async getAssetTypes() {
    try {
      const rows = await this.AssetModel.findDistinctAssetTypes();
      const usedTypes = rows.map((row) => row.assetType);
      const customTypes = usedTypes.filter((type) => !DEFAULT_ASSET_TYPES.includes(type));
      const allTypes = [...new Set([...DEFAULT_ASSET_TYPES, ...usedTypes])].sort();

      return {
        defaults: DEFAULT_ASSET_TYPES,
        custom: customTypes.sort(),
        all: allTypes,
      };
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Registers a new asset in available status and logs a REGISTERED event.
   *
   * @param {{ name: string, assetType: string, serialNumber: string, condition: string, notes?: string }} data
   * @param {string} triggeredByUserId - Admin user UUID.
   * @returns {Promise<object>}
   * @throws {APIError}
   */
  async createAsset(data, triggeredByUserId) {
    try {
      const existing = await this.AssetModel.findBySerialNumber(data.serialNumber);

      if (existing) {
        throw new APIError(
          ERROR_MESSAGE.ASSET_SERIAL_EXISTS,
          STATUS_CODE.CONFLICT,
          ERROR_TYPE.CONFLICT
        );
      }

      const notesValue =
        data.notes === '' || data.notes === undefined ? null : data.notes;
      const assetType = this.resolveAssetType(data.assetType);

      const asset = await this.AssetModel.runTransaction(async (tx) => {
        const createdAsset = await this.AssetModel.createInTransaction(tx, {
          name: data.name,
          assetType,
          serialNumber: data.serialNumber,
          condition: data.condition,
          status: AssetStatus.AVAILABLE,
          notes: notesValue,
        });

        await this.AssetEventModel.createInTransaction(tx, {
          assetId: createdAsset.id,
          triggeredBy: triggeredByUserId,
          eventType: EventType.REGISTERED,
          notes: null,
          metadata: { status: AssetStatus.AVAILABLE },
        });

        return createdAsset;
      });

      return {
        id: asset.id,
        name: asset.name,
        assetType: asset.assetType,
        serialNumber: asset.serialNumber,
        condition: asset.condition,
        status: asset.status,
        notes: asset.notes,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      };
    } catch (err) {
      if (err.code === 'P2002') {
        throw new APIError(
          ERROR_MESSAGE.ASSET_SERIAL_EXISTS,
          STATUS_CODE.CONFLICT,
          ERROR_TYPE.CONFLICT
        );
      }
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Returns all assets with optional filters and active assignment summary.
   *
   * @param {{ status?: string, assetType?: string, employeeId?: string, hasActiveAssignment?: boolean }} filters
   * @returns {Promise<Array>}
   * @throws {APIError}
   */
  async getAllAssets(filters) {
    try {
      const normalizedFilters = {
        status: filters.status,
        employeeId: filters.employeeId,
        assetType: filters.assetType ? this.resolveAssetType(filters.assetType) : undefined,
        hasActiveAssignment: filters.hasActiveAssignment,
      };
      const where = this.buildListWhereClause(normalizedFilters);
      const assets = await this.AssetModel.findAll(where);
      return assets.map((asset) => this.formatListAsset(asset));
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Returns a single asset with full assignment and ticket history.
   *
   * @param {string} id - Asset UUID.
   * @returns {Promise<object>}
   * @throws {APIError}
   */
  async getAssetById(id) {
    try {
      const asset = await this.AssetModel.findById(id);

      if (!asset) {
        throw new APIError(
          ERROR_MESSAGE.ASSET_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      const activeAssignment = asset.assignments.find((assignment) => assignment.isActive);
      const displayStatus = activeAssignment
        ? activeAssignment.currentStatus
        : asset.status;

      const targetEmployeeNameByEventId = await buildTargetEmployeeNameByEventId(
        asset.events,
        {
          findUsersByIds: async (ids) => {
            const users = await Promise.all(
              ids.map((userId) => this.UserModel.findById(userId))
            );
            return users.filter((user) => user !== null);
          },
          findAssignmentsByIds: async (ids) => {
            return asset.assignments
              .filter((assignment) => ids.includes(assignment.id))
              .map((assignment) => ({
                id: assignment.id,
                employeeId: assignment.employee.id,
              }));
          },
          findTicketsByIds: (ids) => this.SupportTicketModel.findByIdsForEmployeeLookup(ids),
        }
      );

      const eventsWithTargetEmployee = asset.events.map((event) => {
        const targetName = targetEmployeeNameByEventId[event.id];
        const employeeId = event.metadata?.employeeId || null;

        return {
          ...event,
          targetEmployee: targetName
            ? {
                id: employeeId,
                name: targetName,
              }
            : null,
        };
      });

      return {
        id: asset.id,
        name: asset.name,
        assetType: asset.assetType,
        serialNumber: asset.serialNumber,
        condition: asset.condition,
        status: displayStatus,
        notes: asset.notes,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
        assignments: asset.assignments,
        events: eventsWithTargetEmployee,
      };
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Updates asset details.
   *
   * @param {string} assetId - Asset UUID.
   * @param {{ name?: string, assetType?: string, serialNumber?: string, condition?: string, notes?: string }} updateData
   * @returns {Promise<object>}
   * @throws {APIError}
   */
  async updateAsset(assetId, updateData) {
    try {
      const existing = await this.AssetModel.findById(assetId);

      if (!existing) {
        throw new APIError(
          ERROR_MESSAGE.ASSET_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      if (updateData.serialNumber && updateData.serialNumber !== existing.serialNumber) {
        const duplicate = await this.AssetModel.findBySerialNumber(updateData.serialNumber);
        if (duplicate) {
          throw new APIError(
            ERROR_MESSAGE.ASSET_SERIAL_EXISTS,
            STATUS_CODE.CONFLICT,
            ERROR_TYPE.CONFLICT
          );
        }
      }

      const dataToUpdate = {};
      if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
      if (updateData.assetType !== undefined) {
        dataToUpdate.assetType = this.resolveAssetType(updateData.assetType);
      }
      if (updateData.serialNumber !== undefined) dataToUpdate.serialNumber = updateData.serialNumber;
      if (updateData.condition !== undefined) dataToUpdate.condition = updateData.condition;
      if (updateData.notes !== undefined) {
        dataToUpdate.notes = updateData.notes === '' ? null : updateData.notes;
      }

      const updatedAsset = await this.AssetModel.update(assetId, dataToUpdate);

      return {
        id: updatedAsset.id,
        name: updatedAsset.name,
        assetType: updatedAsset.assetType,
        serialNumber: updatedAsset.serialNumber,
        condition: updatedAsset.condition,
        status: updatedAsset.status,
        notes: updatedAsset.notes,
        createdAt: updatedAsset.createdAt,
        updatedAt: updatedAsset.updatedAt,
      };
    } catch (err) {
      if (err.code === 'P2002') {
        throw new APIError(
          ERROR_MESSAGE.ASSET_SERIAL_EXISTS,
          STATUS_CODE.CONFLICT,
          ERROR_TYPE.CONFLICT
        );
      }
      if (err.code === 'P2025') {
        throw new APIError(
          ERROR_MESSAGE.ASSET_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Deletes an asset if it has no active assignments.
   *
   * @param {string} assetId - Asset UUID.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async deleteAsset(assetId) {
    try {
      const existing = await this.AssetModel.findById(assetId);

      if (!existing) {
        throw new APIError(
          ERROR_MESSAGE.ASSET_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      const activeAssignmentCount = await this.AssetModel.countActiveAssignments(assetId);

      if (activeAssignmentCount > 0) {
        throw new APIError(
          ERROR_MESSAGE.ASSET_HAS_ACTIVE_ASSIGNMENTS,
          STATUS_CODE.BAD_REQUEST,
          ERROR_TYPE.VALIDATION_ERROR
        );
      }

      await this.AssetModel.delete(assetId);
    } catch (err) {
      if (err.code === 'P2025') {
        throw new APIError(
          ERROR_MESSAGE.ASSET_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }
}

export default AssetService;
