import AdminSummaryModel from '../models/adminSummaryModel.js';
import buildTargetEmployeeNameByEventId from '../utils/resolveEventTargetEmployeeNames.js';
import logger from '../utils/logger.js';
import {
  ERROR_TYPE,
  AssetStatus,
} from '../constants/index.js';

/**
 * Service class for admin dashboard summary statistics.
 */
export class AdminSummaryService {
  constructor() {
    this.AdminSummaryModel = new AdminSummaryModel();
  }

  /**
   * Builds count map from Prisma groupBy status results.
   *
   * @param {Array<{ status: string, _count: { _all: number } }>} statusGroups
   * @returns {object}
   */
  buildStatusCountMap(statusGroups) {
    const counts = {};

    for (const group of statusGroups) {
      counts[group.status] = group._count._all;
    }

    return counts;
  }

  /**
   * Returns admin dashboard summary with asset, ticket, and event aggregates.
   *
   * @returns {Promise<object>}
   * @throws {APIError}
   */
  async getSummary() {
    try {
      const totalAssets = await this.AdminSummaryModel.countAssets();
      const statusGroups = await this.AdminSummaryModel.groupAssetsByStatus();
      const statusCounts = this.buildStatusCountMap(statusGroups);

      const available = statusCounts[AssetStatus.AVAILABLE] || 0;
      const assignedStatusCount = statusCounts[AssetStatus.ASSIGNED] || 0;
      const acknowledgedStatusCount = statusCounts[AssetStatus.ACKNOWLEDGED] || 0;
      const assigned = assignedStatusCount + acknowledgedStatusCount;
      const underRepair = statusCounts[AssetStatus.UNDER_REPAIR] || 0;
      const pendingReview = statusCounts[AssetStatus.PENDING_REVIEW] || 0;

      const openTickets = await this.AdminSummaryModel.countOpenTickets();

      const assignmentGroups = await this.AdminSummaryModel.groupActiveAssignmentsByEmployee();
      const employeeIds = assignmentGroups.map((group) => group.employeeId);
      const users = await this.AdminSummaryModel.findUsersByIds(employeeIds);

      const userNameById = {};
      const userEmailById = {};
      for (const user of users) {
        userNameById[user.id] = user.name;
        userEmailById[user.id] = user.email;
      }

      const assetsPerEmployee = assignmentGroups.map((group) => ({
        employee_id: group.employeeId,
        name: userNameById[group.employeeId] || 'Unknown',
        email: userEmailById[group.employeeId] || null,
        asset_count: group._count._all,
      }));

      const recentEventsRaw = await this.AdminSummaryModel.findRecentEvents(5);

      const targetEmployeeNameByEventId = await buildTargetEmployeeNameByEventId(
        recentEventsRaw,
        {
          findUsersByIds: (ids) => this.AdminSummaryModel.findUsersByIds(ids),
          findAssignmentsByIds: (ids) => this.AdminSummaryModel.findAssignmentsByIds(ids),
          findTicketsByIds: (ids) => this.AdminSummaryModel.findTicketsByIds(ids),
        }
      );

      const recentEvents = recentEventsRaw.map((event) => ({
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
        total_assets: totalAssets,
        available,
        assigned,
        under_repair: underRepair,
        pending_review: pendingReview,
        open_tickets: openTickets,
        assets_per_employee: assetsPerEmployee,
        recent_events: recentEvents,
      };
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.API_ERROR, message: err.message });
      throw err;
    }
  }
}

export default AdminSummaryService;
