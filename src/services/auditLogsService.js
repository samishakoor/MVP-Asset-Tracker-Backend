import AdminSummaryModel from '../models/adminSummaryModel.js';
import buildTargetEmployeeNameByEventId from '../utils/resolveEventTargetEmployeeNames.js';
import { PaginationService } from './paginationService.js';
import logger from '../utils/logger.js';
import { ERROR_TYPE } from '../constants/index.js';

const AUDIT_LOGS_SORT_FIELD_MAP = {
  createdAt: (order) => ({ createdAt: order }),
};

const AUDIT_LOGS_PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultPerPage: 20,
  defaultSortBy: 'createdAt',
  defaultOrderBy: 'desc',
  allowedSortFields: ['createdAt'],
};

/**
 * Service class for fetching audit logs (asset events).
 */
export class AuditLogsService {
  constructor() {
    this.AdminSummaryModel = new AdminSummaryModel();
    this.PaginationService = new PaginationService();
  }

  /**
   * Returns paginated audit logs with asset and user details.
   *
   * @param {object} query - Validated pagination query.
   * @returns {Promise<object>}
   * @throws {APIError}
   */
  async getAuditLogs(query) {
    try {
      const resolved = this.PaginationService.resolveQuery(
        query,
        AUDIT_LOGS_PAGINATION_CONFIG
      );
      const prismaOrderBy = this.PaginationService.buildPrismaOrderBy(
        resolved,
        AUDIT_LOGS_SORT_FIELD_MAP
      );

      const paginated = await this.PaginationService.paginate(
        resolved,
        (params) =>
          this.AdminSummaryModel.findPaginatedEvents(
            params.skip,
            params.take,
            prismaOrderBy
          ),
        () => this.AdminSummaryModel.countEvents()
      );

      const targetEmployeeNameByEventId = await buildTargetEmployeeNameByEventId(
        paginated.items,
        {
          findUsersByIds: (ids) => this.AdminSummaryModel.findUsersByIds(ids),
          findAssignmentsByIds: (ids) => this.AdminSummaryModel.findAssignmentsByIds(ids),
          findTicketsByIds: (ids) => this.AdminSummaryModel.findTicketsByIds(ids),
        }
      );

      const events = paginated.items.map((event) => ({
        id: event.id,
        asset_id: event.assetId,
        asset_name: event.asset?.name ?? event.metadata?.assetName ?? null,
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
        pagination: paginated.pagination,
      };
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }
}

export default AuditLogsService;
