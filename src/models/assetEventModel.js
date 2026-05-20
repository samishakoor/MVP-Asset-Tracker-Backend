import prisma from '../config/database.js';

export class AssetEventModel {
  async create(data) {
    return await prisma.assetEvent.create({
      data,
    });
  }

  async createInTransaction(tx, data) {
    return await tx.assetEvent.create({
      data,
    });
  }
}

export default AssetEventModel;
