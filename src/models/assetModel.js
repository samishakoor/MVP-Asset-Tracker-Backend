import prisma from '../config/database.js';

export const activeAssetFilter = { isDeleted: false };

export const assignmentActiveAssetFilter = {
  asset: activeAssetFilter,
};

export const supportTicketActiveAssetFilter = {
  assignment: assignmentActiveAssetFilter,
};

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

  async findActiveBySerialNumber(serialNumber) {
    return await prisma.asset.findFirst({
      where: {
        serialNumber,
        ...activeAssetFilter,
      },
    });
  }

  async findAll(where) {
    return await prisma.asset.findMany({
      where: {
        ...where,
        ...activeAssetFilter,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: activeAssignmentInclude,
      },
    });
  }

  async findPaginated(where, skip, take, orderBy) {
    return await prisma.asset.findMany({
      where: {
        ...where,
        ...activeAssetFilter,
      },
      skip,
      take,
      orderBy,
      include: {
        assignments: activeAssignmentInclude,
      },
    });
  }

  async count(where) {
    return await prisma.asset.count({
      where: {
        ...where,
        ...activeAssetFilter,
      },
    });
  }

  async findById(id) {
    return await prisma.asset.findFirst({
      where: {
        id,
        ...activeAssetFilter,
      },
      include: detailInclude,
    });
  }

  async findRawById(id) {
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

  async softDelete(id) {
    return await prisma.asset.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async softDeleteInTransaction(tx, id) {
    return await tx.asset.update({
      where: { id },
      data: { isDeleted: true },
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
      where: activeAssetFilter,
      select: { assetType: true },
      distinct: ['assetType'],
      orderBy: { assetType: 'asc' },
    });
  }
}

export default AssetModel;
