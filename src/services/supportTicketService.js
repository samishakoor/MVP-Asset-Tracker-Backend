import SupportTicketModel from '../models/supportTicketModel.js';
import AssignmentModel from '../models/assignmentModel.js';
import AssetModel from '../models/assetModel.js';
import AssetEventModel from '../models/assetEventModel.js';
import { EmailService } from './emailService.js';
import { NotificationService } from './notificationService.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import { CLIENT_URL } from '../config/index.js';
import {
  STATUS_CODE,
  ERROR_TYPE,
  ERROR_MESSAGE,
  AssetStatus,
  TicketStatus,
  EventType,
  NotificationType,
} from '../constants/index.js';

/**
 * Service class for support ticket management operations.
 */
export class SupportTicketService {
  constructor() {
    this.SupportTicketModel = new SupportTicketModel();
    this.AssignmentModel = new AssignmentModel();
    this.AssetModel = new AssetModel();
    this.AssetEventModel = new AssetEventModel();
    this.emailService = new EmailService();
    this.notificationService = new NotificationService();
  }

  /**
   * Creates a support ticket for an active assignment.
   *
   * @param {string} assignmentId - Assignment UUID.
   * @param {string} reportedBy - Employee UUID.
   * @param {string} description - Ticket description.
   * @returns {Promise<object>} Created ticket.
   * @throws {APIError}
   */
  async createTicket(assignmentId, reportedBy, description) {
    try {
      const assignment = await this.AssignmentModel.findById(assignmentId);

      if (!assignment) {
        throw new APIError(
          ERROR_MESSAGE.ASSIGNMENT_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      if (assignment.employeeId !== reportedBy) {
        throw new APIError(
          ERROR_MESSAGE.ASSIGNMENT_NOT_OWNED,
          STATUS_CODE.FORBIDDEN,
          ERROR_TYPE.AUTHORIZATION_ERROR
        );
      }

      if (!assignment.isActive) {
        throw new APIError(
          ERROR_MESSAGE.ASSIGNMENT_NOT_ACTIVE,
          STATUS_CODE.BAD_REQUEST,
          ERROR_TYPE.API_ERROR
        );
      }

      const ticket = await this.AssetModel.runTransaction(async (tx) => {
        const createdTicket = await this.SupportTicketModel.createInTransaction(tx, {
          assignmentId,
          reportedBy,
          description,
          status: TicketStatus.OPEN,
        });

        await this.AssignmentModel.updateCurrentStatusInTransaction(
          tx,
          assignmentId,
          AssetStatus.PENDING_REVIEW
        );

        await this.AssetModel.updateStatusInTransaction(
          tx,
          assignment.assetId,
          AssetStatus.PENDING_REVIEW
        );

        await this.AssetEventModel.createInTransaction(tx, {
          assetId: assignment.assetId,
          triggeredBy: reportedBy,
          eventType: EventType.TICKET_OPENED,
          notes: description,
          metadata: {
            ticketId: createdTicket.id,
            assignmentId,
            employeeId: assignment.employeeId,
          },
        });

        return createdTicket;
      });

      const fullTicket = await this.SupportTicketModel.findById(ticket.id);

      if (
        CLIENT_URL &&
        assignment.assignedByAdmin &&
        assignment.assignedByAdmin.email &&
        assignment.employee
      ) {
        const ticketsUrl = `${CLIENT_URL}/admin/tickets`;

        try {
          await this.emailService.sendSupportTicketReportedEmail(
            assignment.assignedByAdmin.name,
            assignment.assignedByAdmin.email,
            ticketsUrl,
            {
              employeeName: assignment.employee.name,
              name: assignment.asset.name,
              assetType: assignment.asset.assetType,
              serialNumber: assignment.asset.serialNumber,
              description,
            }
          );
        } catch (emailErr) {
          logger.error({
            errorType: ERROR_TYPE.INTERNAL_ERROR,
            message: emailErr.message,
            ticketId: fullTicket.id,
            adminId: assignment.assignedBy,
          });
        }
      }

      try {
        await this.notificationService.createNotification({
          userId: reportedBy,
          title: 'Support Ticket Created',
          message: `You reported an issue for ${assignment.asset.name}`,
          type: NotificationType.TICKET_CREATED,
          assetId: assignment.assetId,
          assetName: assignment.asset.name,
        });
      } catch (notifErr) {
        logger.error({
          errorType: ERROR_TYPE.INTERNAL_ERROR,
          message: notifErr.message,
          ticketId: fullTicket.id,
          employeeId: reportedBy,
        });
      }

      return fullTicket;
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Returns all support tickets with asset and employee details.
   *
   * @returns {Promise<Array>} All tickets.
   * @throws {APIError}
   */
  async getAllTickets() {
    try {
      const tickets = await this.SupportTicketModel.findAll();
      return tickets;
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }

  /**
   * Reviews a support ticket with an admin action.
   *
   * @param {string} ticketId - Ticket UUID.
   * @param {string} adminId - Admin UUID.
   * @param {string} action - One of: 'start_repair', 'resolve'.
   * @param {string|null|undefined} adminNotes - Optional admin notes.
   * @returns {Promise<object>} Updated ticket.
   * @throws {APIError}
   */
  async reviewTicket(ticketId, adminId, action, adminNotes) {
    try {
      const ticket = await this.SupportTicketModel.findById(ticketId);

      if (!ticket) {
        throw new APIError(
          ERROR_MESSAGE.TICKET_NOT_FOUND,
          STATUS_CODE.NOT_FOUND,
          ERROR_TYPE.NOT_FOUND
        );
      }

      const notesValue = adminNotes === '' ? null : adminNotes;
      const assetId = ticket.assignment.asset.id;
      const assignmentId = ticket.assignmentId;

      let ticketUpdate = {
        reviewedBy: adminId,
        adminNotes: notesValue,
      };

      let newAssignmentStatus = null;
      let eventType = null;

      switch (action) {
        case 'start_repair':
          ticketUpdate.status = TicketStatus.UNDER_REVIEW;
          newAssignmentStatus = AssetStatus.UNDER_REPAIR;
          eventType = EventType.REPAIR_STARTED;
          break;

        case 'resolve':
          ticketUpdate.status = TicketStatus.RESOLVED;
          newAssignmentStatus = AssetStatus.ACKNOWLEDGED;
          eventType = EventType.REPAIR_COMPLETED;
          break;

        default:
          throw new APIError(
            ERROR_MESSAGE.TICKET_INVALID_ACTION,
            STATUS_CODE.BAD_REQUEST,
            ERROR_TYPE.API_ERROR
          );
      }

      const updatedTicket = await this.AssetModel.runTransaction(async (tx) => {
        const updated = await this.SupportTicketModel.updateInTransaction(
          tx,
          ticketId,
          ticketUpdate
        );

        if (newAssignmentStatus) {
          await this.AssignmentModel.updateCurrentStatusInTransaction(
            tx,
            assignmentId,
            newAssignmentStatus
          );
          await this.AssetModel.updateStatusInTransaction(tx, assetId, newAssignmentStatus);
        }

        await this.AssetEventModel.createInTransaction(tx, {
          assetId,
          triggeredBy: adminId,
          eventType,
          notes: notesValue,
          metadata: {
            ticketId,
            action,
            employeeId: ticket.assignment.employeeId,
          },
        });

        return updated;
      });

      const fullTicket = await this.SupportTicketModel.findById(updatedTicket.id);

      const isFirstUnderRepairTransition =
        action === 'start_repair' &&
        ticket.assignment.currentStatus !== AssetStatus.UNDER_REPAIR;

      if (isFirstUnderRepairTransition) {
        const employee = fullTicket.assignment.employee;
        const asset = fullTicket.assignment.asset;
        const reviewer = fullTicket.reviewer;

        if (CLIENT_URL && employee && employee.email && asset && reviewer) {
          const assetDetailUrl = `${CLIENT_URL}/employee/dashboard/assets/${asset.id}`;

          try {
            await this.emailService.sendAssetUnderRepairEmail(
              employee.name,
              employee.email,
              assetDetailUrl,
              {
                name: asset.name,
                assetType: asset.assetType,
                serialNumber: asset.serialNumber,
                adminName: reviewer.name,
                adminNotes: notesValue,
              }
            );
          } catch (emailErr) {
            logger.error({
              errorType: ERROR_TYPE.INTERNAL_ERROR,
              message: emailErr.message,
              ticketId: fullTicket.id,
              employeeId: employee.id,
            });
          }
        }

        if (employee && asset && reviewer) {
          try {
            await this.notificationService.createNotification({
              userId: employee.id,
              title: 'Asset Under Repair',
              message: `${asset.name} is now under repair`,
              type: NotificationType.ASSET_UNDER_REPAIR,
              assetId: asset.id,
              assetName: asset.name,
            });
          } catch (notifErr) {
            logger.error({
              errorType: ERROR_TYPE.INTERNAL_ERROR,
              message: notifErr.message,
              ticketId: fullTicket.id,
              employeeId: employee.id,
            });
          }
        }
      }

      const isTicketResolvedTransition =
        action === 'resolve' &&
        ticket.status !== TicketStatus.RESOLVED;

      if (isTicketResolvedTransition) {
        const employee = fullTicket.assignment.employee;
        const asset = fullTicket.assignment.asset;
        const reviewer = fullTicket.reviewer;

        if (CLIENT_URL && employee && employee.email && asset && reviewer) {
          const assetDetailUrl = `${CLIENT_URL}/employee/dashboard/assets/${asset.id}`;

          try {
            await this.emailService.sendAssetTicketResolvedEmail(
              employee.name,
              employee.email,
              assetDetailUrl,
              {
                name: asset.name,
                assetType: asset.assetType,
                serialNumber: asset.serialNumber,
                adminName: reviewer.name,
                adminNotes: notesValue,
              }
            );
          } catch (emailErr) {
            logger.error({
              errorType: ERROR_TYPE.INTERNAL_ERROR,
              message: emailErr.message,
              ticketId: fullTicket.id,
              employeeId: employee.id,
            });
          }
        }

        if (employee && asset && reviewer) {
          try {
            await this.notificationService.createNotification({
              userId: employee.id,
              title: 'Ticket Resolved',
              message: `Your support ticket for ${asset.name} has been resolved`,
              type: NotificationType.TICKET_RESOLVED,
              assetId: asset.id,
              assetName: asset.name,
            });
          } catch (notifErr) {
            logger.error({
              errorType: ERROR_TYPE.INTERNAL_ERROR,
              message: notifErr.message,
              ticketId: fullTicket.id,
              employeeId: employee.id,
            });
          }
        }
      }

      return fullTicket;
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }
}

export default SupportTicketService;
