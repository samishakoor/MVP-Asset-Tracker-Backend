import AdminSummaryModel from '../models/adminSummaryModel.js';
import buildTargetEmployeeNameByEventId from '../utils/resolveEventTargetEmployeeNames.js';
import logger from '../utils/logger.js';
import { ERROR_TYPE } from '../constants/index.js';

/**
 * Service class for fetching audit logs (asset events).
 */
export class AuditLogsService {
  constructor() {
    this.AdminSummaryModel = new AdminSummaryModel();
  }

  /**
   * Returns paginated audit logs with asset and user details.
   *
   * @param {object} params
   * @param {number} params.page - Page number (1-indexed)
   * @param {number} params.limit - Items per page
   * @returns {Promise<object>}
   * @throws {APIError}
   */
  async getAuditLogs(params) {
    const { page, limit } = params;

    try {
      const skip = (page - 1) * limit;

      const eventsRaw = await this.AdminSummaryModel.findPaginatedEvents(skip, limit);
      const totalCount = await this.AdminSummaryModel.countEvents();

      const targetEmployeeNameByEventId = await buildTargetEmployeeNameByEventId(
        eventsRaw,
        {
          findUsersByIds: (ids) => this.AdminSummaryModel.findUsersByIds(ids),
          findAssignmentsByIds: (ids) => this.AdminSummaryModel.findAssignmentsByIds(ids),
          findTicketsByIds: (ids) => this.AdminSummaryModel.findTicketsByIds(ids),
        }
      );

      const events = eventsRaw.map((event) => ({
        id: event.id,
        asset_id: event.assetId,
        asset_name: event.asset.name,
        triggered_by: event.triggeredBy,
        triggered_by_name: event.trigger.name,
        event_type: event.eventType,
        notes: event.notes,
        created_at: event.createdAt,
        target_employee_id: event.metadata?.employeeId || null,
        target_employee_name: targetEmployeeNameByEventId[event.id] || null,
      }));

      return {
        events,
        pagination: {
          page,
          limit,
          total: totalCount,
          total_pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }
}

export default AuditLogsService;
