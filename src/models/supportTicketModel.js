import prisma from '../config/database.js';
import { supportTicketActiveAssetFilter } from './assetModel.js';

const ticketListInclude = {
  assignment: {
    include: {
      asset: {
        select: {
          id: true,
          name: true,
          assetType: true,
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
    },
  },
  reporter: {
    select: {
      id: true,
      name: true,
    },
  },
  reviewer: {
    select: {
      id: true,
      name: true,
    },
  },
};

export class SupportTicketModel {
  async create(data) {
    return await prisma.supportTicket.create({
      data,
    });
  }

  async createInTransaction(tx, data) {
    return await tx.supportTicket.create({
      data,
    });
  }

  async findAll() {
    return await prisma.supportTicket.findMany({
      where: supportTicketActiveAssetFilter,
      include: ticketListInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPaginated(where, skip, take, orderBy) {
    return await prisma.supportTicket.findMany({
      where: {
        ...where,
        ...supportTicketActiveAssetFilter,
      },
      skip,
      take,
      orderBy,
      include: ticketListInclude,
    });
  }

  async count(where) {
    return await prisma.supportTicket.count({
      where: {
        ...where,
        ...supportTicketActiveAssetFilter,
      },
    });
  }

  async groupCountByStatus() {
    const rows = await prisma.supportTicket.groupBy({
      by: ['status'],
      where: supportTicketActiveAssetFilter,
      _count: {
        _all: true,
      },
    });

    return rows;
  }

  async findById(id) {
    return await prisma.supportTicket.findFirst({
      where: {
        id,
        ...supportTicketActiveAssetFilter,
      },
      include: ticketListInclude,
    });
  }

  async findByIdsForEmployeeLookup(ids) {
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

  async update(id, data) {
    return await prisma.supportTicket.update({
      where: { id },
      data,
    });
  }

  async updateInTransaction(tx, id, data) {
    return await tx.supportTicket.update({
      where: { id },
      data,
    });
  }
}

export default SupportTicketModel;
