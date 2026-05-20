/**
 * Builds a map of event id -> target employee display name.
 * Uses metadata.employeeId first, then falls back to assignmentId or ticketId in metadata.
 *
 * @param {Array<{ id: string, metadata: object|null }>} events - Raw asset events.
 * @param {{ findUsersByIds: Function, findAssignmentsByIds: Function, findTicketsByIds: Function }} loaders
 * @returns {Promise<Record<string, string|null>>}
 */
export async function buildTargetEmployeeNameByEventId(events, loaders) {
  const employeeIdByEventId = {};

  for (const event of events) {
    const metadata = event.metadata;
    if (metadata !== null && metadata !== undefined && metadata.employeeId) {
      employeeIdByEventId[event.id] = metadata.employeeId;
    }
  }

  const assignmentIds = [];
  const ticketIds = [];

  for (const event of events) {
    if (employeeIdByEventId[event.id]) {
      continue;
    }

    const metadata = event.metadata;
    if (metadata === null || metadata === undefined) {
      continue;
    }

    if (metadata.assignmentId) {
      assignmentIds.push(metadata.assignmentId);
    }

    if (metadata.ticketId) {
      ticketIds.push(metadata.ticketId);
    }
  }

  const uniqueAssignmentIds = [...new Set(assignmentIds)];
  const uniqueTicketIds = [...new Set(ticketIds)];

  const assignmentEmployeeIdByAssignmentId = {};

  if (uniqueAssignmentIds.length > 0) {
    const assignments = await loaders.findAssignmentsByIds(uniqueAssignmentIds);

    for (const assignment of assignments) {
      assignmentEmployeeIdByAssignmentId[assignment.id] = assignment.employeeId;
    }
  }

  const ticketEmployeeIdByTicketId = {};

  if (uniqueTicketIds.length > 0) {
    const tickets = await loaders.findTicketsByIds(uniqueTicketIds);

    for (const ticket of tickets) {
      ticketEmployeeIdByTicketId[ticket.id] = ticket.assignment.employeeId;
    }
  }

  for (const event of events) {
    if (employeeIdByEventId[event.id]) {
      continue;
    }

    const metadata = event.metadata;
    if (metadata === null || metadata === undefined) {
      continue;
    }

    if (metadata.assignmentId && assignmentEmployeeIdByAssignmentId[metadata.assignmentId]) {
      employeeIdByEventId[event.id] = assignmentEmployeeIdByAssignmentId[metadata.assignmentId];
      continue;
    }

    if (metadata.ticketId && ticketEmployeeIdByTicketId[metadata.ticketId]) {
      employeeIdByEventId[event.id] = ticketEmployeeIdByTicketId[metadata.ticketId];
    }
  }

  const uniqueEmployeeIds = [...new Set(Object.values(employeeIdByEventId).filter((id) => id))];
  const employeeNameById = {};

  if (uniqueEmployeeIds.length > 0) {
    const users = await loaders.findUsersByIds(uniqueEmployeeIds);

    for (const user of users) {
      employeeNameById[user.id] = user.name;
    }
  }

  const nameByEventId = {};

  for (const event of events) {
    const employeeId = employeeIdByEventId[event.id];
    if (employeeId) {
      nameByEventId[event.id] = employeeNameById[employeeId] || null;
    } else {
      nameByEventId[event.id] = null;
    }
  }

  return nameByEventId;
}

export default buildTargetEmployeeNameByEventId;
