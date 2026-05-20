import AssignmentModel from '../models/assignmentModel.js';
import AssetModel from '../models/assetModel.js';
import AssetEventModel from '../models/assetEventModel.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import { eventTypeFromAssignmentStatus } from '../utils/eventTypeFromAssignmentStatus.js';
import {
  STATUS_CODE,
  ERROR_TYPE,
  ERROR_MESSAGE,
  AssetStatus,
  EventType,
} from '../constants/index.js';

/**
 * Service class for assignment management operations.
 */
export class AssignmentService {
  constructor() {
    this.AssignmentModel = new AssignmentModel();
    this.AssetModel = new AssetModel();
    this.AssetEventModel = new AssetEventModel();
  }

  /**
   * Assigns an asset to an employee.
   *
   * @param {string} assetId - Asset UUID.
   * @param {string} employeeId - Employee UUID.
   * @param {string} adminId - Admin UUID who is assigning.
   * @param {string|undefined} assignedAt - Assignment date (YYYY-MM-DD); defaults to now when omitted.
   * @returns {Promise<object>} Created assignment.
   * @throws {APIError}
   */
  async assignAsset(assetId, employeeId, adminId, assignedAt) {
    try {
      const asset = await this.AssetModel.findById(assetId);

      if (!asset) {
        throw new APIError(
          ERROR_MESSAGE.ASSET_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      if (asset.status !== AssetStatus.AVAILABLE) {
        throw new APIError(
          ERROR_MESSAGE.ASSET_NOT_AVAILABLE,
          STATUS_CODE.BAD_REQUEST,
          ERROR_TYPE.API_ERROR
        );
      }

      const assignedAtDate = assignedAt ? new Date(assignedAt) : new Date();

      const assignment = await this.AssetModel.runTransaction(async (tx) => {
        const createdAssignment = await this.AssignmentModel.createInTransaction(tx, {
          assetId,
          employeeId,
          assignedBy: adminId,
          assignedAt: assignedAtDate,
          isActive: true,
          currentStatus: AssetStatus.ASSIGNED,
        });

        await this.AssetModel.updateStatusInTransaction(tx, assetId, AssetStatus.ASSIGNED);

        await this.AssetEventModel.createInTransaction(tx, {
          assetId,
          triggeredBy: adminId,
          eventType: EventType.ASSIGNED,
          notes: null,
          metadata: {
            assignmentId: createdAssignment.id,
            employeeId,
          },
        });

        return createdAssignment;
      });

      const fullAssignment = await this.AssignmentModel.findById(assignment.id);
      return fullAssignment;
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Acknowledges an assignment by the employee.
   *
   * @param {string} assignmentId - Assignment UUID.
   * @param {string} employeeId - Employee UUID.
   * @returns {Promise<object>} Updated assignment.
   * @throws {APIError}
   */
  async acknowledgeAsset(assignmentId, employeeId) {
    try {
      const assignment = await this.AssignmentModel.findActiveByIdAndEmployee(
        assignmentId,
        employeeId
      );

      if (!assignment) {
        throw new APIError(
          ERROR_MESSAGE.ASSIGNMENT_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      if (assignment.employeeId !== employeeId) {
        throw new APIError(
          ERROR_MESSAGE.ASSIGNMENT_NOT_OWNED,
          STATUS_CODE.FORBIDDEN,
          ERROR_TYPE.AUTHORIZATION_ERROR
        );
      }

      const acknowledgedAt = new Date();

      const updatedAssignment = await this.AssetModel.runTransaction(async (tx) => {
        await this.AssignmentModel.updateAcknowledgedInTransaction(
          tx,
          assignmentId,
          acknowledgedAt,
          AssetStatus.ACKNOWLEDGED
        );

        await this.AssetModel.updateStatusInTransaction(
          tx,
          assignment.assetId,
          AssetStatus.ACKNOWLEDGED
        );

        await this.AssetEventModel.createInTransaction(tx, {
          assetId: assignment.assetId,
          triggeredBy: employeeId,
          eventType: EventType.ACKNOWLEDGED,
          notes: null,
          metadata: {
            assignmentId,
            employeeId,
          },
        });

        return await tx.assignment.findUnique({
          where: { id: assignmentId },
          include: {
            asset: {
              select: {
                id: true,
                name: true,
                assetType: true,
                status: true,
                serialNumber: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            assignedByAdmin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      });

      return updatedAssignment;
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Returns an asset, marking assignment as inactive.
   *
   * @param {string} assignmentId - Assignment UUID.
   * @param {string} adminId - Admin UUID.
   * @returns {Promise<object>} Updated assignment.
   * @throws {APIError}
   */
  async returnAsset(assignmentId, adminId) {
    try {
      const assignment = await this.AssignmentModel.findActiveById(assignmentId);

      if (!assignment) {
        throw new APIError(
          ERROR_MESSAGE.ASSIGNMENT_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      if (!assignment.isActive) {
        throw new APIError(
          ERROR_MESSAGE.ASSIGNMENT_NOT_ACTIVE,
          STATUS_CODE.BAD_REQUEST,
          ERROR_TYPE.API_ERROR
        );
      }

      const returnedAt = new Date();

      const updatedAssignment = await this.AssetModel.runTransaction(async (tx) => {
        await this.AssignmentModel.updateReturnedInTransaction(tx, assignmentId, returnedAt);

        await this.AssetModel.updateStatusInTransaction(
          tx,
          assignment.assetId,
          AssetStatus.AVAILABLE
        );

        await this.AssetEventModel.createInTransaction(tx, {
          assetId: assignment.assetId,
          triggeredBy: adminId,
          eventType: EventType.RETURNED,
          notes: null,
          metadata: {
            assignmentId,
            employeeId: assignment.employeeId,
          },
        });

        return await tx.assignment.findUnique({
          where: { id: assignmentId },
          include: {
            asset: {
              select: {
                id: true,
                name: true,
                assetType: true,
                status: true,
                serialNumber: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            assignedByAdmin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      });

      return updatedAssignment;
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Updates the current status of an active assignment and syncs asset status.
   *
   * @param {string} assignmentId - Assignment UUID.
   * @param {string} currentStatus - Target AssetStatus value.
   * @param {string} adminId - Admin UUID who triggered the change.
   * @returns {Promise<object>} Updated assignment.
   * @throws {APIError}
   */
  async updateAssignmentStatus(assignmentId, currentStatus, adminId) {
    try {
      const assignment = await this.AssignmentModel.findActiveById(assignmentId);

      if (!assignment) {
        throw new APIError(
          ERROR_MESSAGE.ASSIGNMENT_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      const previousStatus = assignment.currentStatus;
      const eventType = eventTypeFromAssignmentStatus(currentStatus);

      const updatedAssignment = await this.AssetModel.runTransaction(async (tx) => {
        await this.AssignmentModel.updateCurrentStatusInTransaction(
          tx,
          assignmentId,
          currentStatus
        );

        await this.AssetModel.updateStatusInTransaction(
          tx,
          assignment.assetId,
          currentStatus
        );

        await this.AssetEventModel.createInTransaction(tx, {
          assetId: assignment.assetId,
          triggeredBy: adminId,
          eventType,
          notes: null,
          metadata: {
            assignmentId,
            employeeId: assignment.employeeId,
            previousStatus,
            newStatus: currentStatus,
          },
        });

        return await tx.assignment.findUnique({
          where: { id: assignmentId },
          include: {
            asset: {
              select: {
                id: true,
                name: true,
                assetType: true,
                status: true,
                serialNumber: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            assignedByAdmin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      });

      return updatedAssignment;
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Returns active assignments for an employee.
   *
   * @param {string} employeeId - Employee UUID.
   * @returns {Promise<Array>} Active assignments with asset details.
   * @throws {APIError}
   */
  async getMyActiveAssets(employeeId) {
    try {
      const assignments = await this.AssignmentModel.findActiveByEmployeeId(employeeId);

      return assignments.map((assignment) => ({
        id: assignment.id,
        assetId: assignment.assetId,
        assetName: assignment.asset.name,
        assetType: assignment.asset.assetType,
        condition: assignment.asset.condition,
        currentStatus: assignment.currentStatus,
        serialNumber: assignment.asset.serialNumber,
        assignedAt: assignment.assignedAt,
        acknowledgedAt: assignment.acknowledgedAt,
      }));
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Returns asset detail for a specific asset assigned to an employee,
   * including active assignment info and full ticket history for this employee.
   *
   * @param {string} employeeId - Employee UUID.
   * @param {string} assetId - Asset UUID.
   * @returns {Promise<object>}
   * @throws {APIError} If no active assignment found for this employee + asset.
   */
  async getMyAssetDetail(employeeId, assetId) {
    try {
      const assignments = await this.AssignmentModel.findByAssetAndEmployee(assetId, employeeId);
      const activeAssignment = assignments.find((a) => a.isActive);

      if (!activeAssignment) {
        throw new APIError(
          ERROR_MESSAGE.ASSET_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      const asset = activeAssignment.asset;

      const allTickets = assignments
        .flatMap((a) => a.supportTickets)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        id: asset.id,
        name: asset.name,
        assetType: asset.assetType,
        condition: asset.condition,
        serialNumber: asset.serialNumber,
        status: activeAssignment.currentStatus,
        activeAssignment: {
          id: activeAssignment.id,
          assignedAt: activeAssignment.assignedAt,
          acknowledgedAt: activeAssignment.acknowledgedAt,
        },
        tickets: allTickets.map((ticket) => ({
          id: ticket.id,
          description: ticket.description,
          status: ticket.status,
          adminNotes: ticket.adminNotes,
          createdAt: ticket.createdAt,
        })),
      };
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Returns past assignments for an employee.
   *
   * @param {string} employeeId - Employee UUID.
   * @returns {Promise<Array>} Past assignments with asset details.
   * @throws {APIError}
   */
  async getMyHistory(employeeId) {
    try {
      const assignments = await this.AssignmentModel.findHistoryByEmployeeId(employeeId);

      return assignments.map((assignment) => ({
        id: assignment.id,
        assetId: assignment.assetId,
        assetName: assignment.asset.name,
        assetType: assignment.asset.assetType,
        serialNumber: assignment.asset.serialNumber,
        currentStatus: assignment.currentStatus,
        assignedAt: assignment.assignedAt,
        returnedAt: assignment.returnedAt,
      }));
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }
}

export default AssignmentService;
