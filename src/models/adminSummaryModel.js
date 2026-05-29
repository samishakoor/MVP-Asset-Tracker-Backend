import prisma from '../config/database.js';
import { activeAssetFilter, assignmentActiveAssetFilter, supportTicketActiveAssetFilter } from './assetModel.js';

export class AdminSummaryModel {
  async countAssets() {
    return await prisma.asset.count({
      where: activeAssetFilter,
    });
  }

  async groupAssetsByStatus() {
    return await prisma.asset.groupBy({
      by: ['status'],
      where: activeAssetFilter,
      _count: {
        _all: true,
      },
    });
  }

  async countOpenTickets() {
    return await prisma.supportTicket.count({
      where: {
        status: 'open',
        ...supportTicketActiveAssetFilter,
      },
    });
  }

  async groupActiveAssignmentsByEmployee() {
    return await prisma.assignment.groupBy({
      by: ['employeeId'],
      where: {
        isActive: true,
        ...assignmentActiveAssetFilter,
      },
      _count: {
        _all: true,
      },
    });
  }

  async findUsersByIds(ids) {
    return await prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findRecentEvents(limit) {
    return await prisma.assetEvent.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        asset: {
          select: {
            name: true,
          },
        },
        trigger: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findPaginatedEvents(skip, limit, orderBy) {
    return await prisma.assetEvent.findMany({
      skip,
      take: limit,
      orderBy,
      include: {
        asset: {
          select: {
            name: true,
          },
        },
        trigger: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async countEvents() {
    return await prisma.assetEvent.count();
  }

  async findAssignmentsByIds(ids) {
    return await prisma.assignment.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        employeeId: true,
      },
    });
  }

  async findTicketsByIds(ids) {
    return await prisma.supportTicket.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        assignment: {
          select: {
            employeeId: true,
          },
        },
      },
    });
  }
}

export default AdminSummaryModel;
