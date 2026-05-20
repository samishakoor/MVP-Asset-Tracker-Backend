import APIError from './APIError.js';
import { STATUS_CODE, ERROR_TYPE, AssetStatus, EventType } from '../constants/index.js';

/**
 * Maps an assignment current status to the closest audit event type.
 *
 * @param {string} status - AssetStatus value on an active assignment.
 * @returns {string}
 * @throws {APIError}
 */
export function eventTypeFromAssignmentStatus(status) {
  if (status === AssetStatus.ASSIGNED) {
    return EventType.ASSIGNED;
  }

  if (status === AssetStatus.ACKNOWLEDGED) {
    return EventType.ACKNOWLEDGED;
  }

  if (status === AssetStatus.PENDING_REVIEW) {
    return EventType.TICKET_OPENED;
  }

  if (status === AssetStatus.UNDER_REPAIR) {
    return EventType.REPAIR_STARTED;
  }

  throw new APIError(
    `Cannot map assignment status "${status}" to an event type`,
    STATUS_CODE.BAD_REQUEST,
    ERROR_TYPE.VALIDATION_ERROR
  );
}
