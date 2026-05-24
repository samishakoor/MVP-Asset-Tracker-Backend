import prisma from '../config/database.js';

export class AdminSummaryModel {
  async countAssets() {
    return await prisma.asset.count();
  }

  async groupAssetsByStatus() {
    return await prisma.asset.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });
  }

  async countOpenTickets() {
    return await prisma.supportTicket.count({
      where: {
        status: 'open',
      },
    });
  }

  async groupActiveAssignmentsByEmployee() {
    return await prisma.assignment.groupBy({
      by: ['employeeId'],
      where: {
        isActive: true,
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
