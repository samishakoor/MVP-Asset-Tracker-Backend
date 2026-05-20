import prisma from '../config/database.js';

const activeAssignmentInclude = {
  where: { isActive: true },
  take: 1,
  include: {
    employee: {
      select: { id: true, name: true, email: true },
    },
  },
};

const detailInclude = {
  assignments: {
    orderBy: { assignedAt: 'desc' },
    include: {
      employee: {
        select: { id: true, name: true, email: true },
      },
      assignedByAdmin: {
        select: { id: true, name: true },
      },
      supportTickets: {
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { id: true, name: true },
          },
        },
      },
    },
  },
  events: {
    orderBy: { createdAt: 'desc' },
    include: {
      trigger: {
        select: { id: true, name: true },
      },
    },
  },
};

export class AssetModel {
  async runTransaction(callback) {
    return await prisma.$transaction(callback);
  }

  async create(data) {
    return await prisma.asset.create({
      data,
    });
  }

  async createInTransaction(tx, data) {
    return await tx.asset.create({
      data,
    });
  }

  async findBySerialNumber(serialNumber) {
    return await prisma.asset.findUnique({
      where: { serialNumber },
    });
  }

  async findAll(where) {
    return await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: activeAssignmentInclude,
      },
    });
  }

  async findById(id) {
    return await prisma.asset.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  async updateStatus(id, status) {
    return await prisma.asset.update({
      where: { id },
      data: { status },
    });
  }

  async updateStatusInTransaction(tx, id, status) {
    return await tx.asset.update({
      where: { id },
      data: { status },
    });
  }

  async update(id, data) {
    return await prisma.asset.update({
      where: { id },
      data,
    });
  }

  async updateInTransaction(tx, id, data) {
    return await tx.asset.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return await prisma.asset.delete({
      where: { id },
    });
  }

  async countActiveAssignments(assetId) {
    return await prisma.assignment.count({
      where: {
        assetId,
        isActive: true,
      },
    });
  }

  async findDistinctAssetTypes() {
    return await prisma.asset.findMany({
      select: { assetType: true },
      distinct: ['assetType'],
      orderBy: { assetType: 'asc' },
    });
  }
}

export default AssetModel;
