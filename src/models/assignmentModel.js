import prisma from '../config/database.js';

const employeeAssignmentInclude = {
  asset: {
    select: {
      id: true,
      name: true,
      assetType: true,
      condition: true,
      status: true,
      serialNumber: true,
    },
  },
};

const fullAssignmentInclude = {
  asset: {
    select: {
      id: true,
      name: true,
      assetType: true,
      condition: true,
      status: true,
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
  assignedByAdmin: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

export class AssignmentModel {
  async create(data) {
    return await prisma.assignment.create({
      data,
    });
  }

  async createInTransaction(tx, data) {
    return await tx.assignment.create({
      data,
    });
  }

  async findById(id) {
    return await prisma.assignment.findUnique({
      where: { id },
      include: fullAssignmentInclude,
    });
  }

  async findActiveByIdAndEmployee(id, employeeId) {
    return await prisma.assignment.findFirst({
      where: {
        id,
        employeeId,
        isActive: true,
      },
      include: fullAssignmentInclude,
    });
  }

  async findActiveById(id) {
    return await prisma.assignment.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: fullAssignmentInclude,
    });
  }

  async findActiveByEmployeeId(employeeId) {
    return await prisma.assignment.findMany({
      where: {
        employeeId,
        isActive: true,
      },
      include: employeeAssignmentInclude,
      orderBy: {
        assignedAt: 'desc',
      },
    });
  }

  async findByAssetAndEmployee(assetId, employeeId) {
    return await prisma.assignment.findMany({
      where: {
        assetId,
        employeeId,
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetType: true,
            condition: true,
            serialNumber: true,
            status: true,
          },
        },
        supportTickets: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findHistoryByEmployeeId(employeeId) {
    return await prisma.assignment.findMany({
      where: {
        employeeId,
        isActive: false,
        returnedAt: {
          not: null,
        },
      },
      include: employeeAssignmentInclude,
      orderBy: {
        returnedAt: 'desc',
      },
    });
  }

  async updateAcknowledged(id, acknowledgedAt, currentStatus) {
    return await prisma.assignment.update({
      where: { id },
      data: { acknowledgedAt, currentStatus },
    });
  }

  async updateAcknowledgedInTransaction(tx, id, acknowledgedAt, currentStatus) {
    return await tx.assignment.update({
      where: { id },
      data: { acknowledgedAt, currentStatus },
    });
  }

  async updateCurrentStatus(id, currentStatus) {
    return await prisma.assignment.update({
      where: { id },
      data: { currentStatus },
    });
  }

  async updateCurrentStatusInTransaction(tx, id, currentStatus) {
    return await tx.assignment.update({
      where: { id },
      data: { currentStatus },
    });
  }

  async updateReturned(id, returnedAt) {
    return await prisma.assignment.update({
      where: { id },
      data: {
        returnedAt,
        isActive: false,
      },
    });
  }

  async updateReturnedInTransaction(tx, id, returnedAt) {
    return await tx.assignment.update({
      where: { id },
      data: {
        returnedAt,
        isActive: false,
      },
    });
  }
}

export default AssignmentModel;
