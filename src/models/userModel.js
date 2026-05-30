import prisma from '../config/database.js';

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
};

export class UserModel {
  async findAll() {
    return await prisma.user.findMany({
      select: userPublicSelect,
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId) {
    return await prisma.user.findFirst({
      where: { googleId },
    });
  }

  async updateGoogleId(id, googleId) {
    return await prisma.user.update({
      where: { id },
      data: { googleId },
      select: userPublicSelect,
    });
  }

  async create(data) {
    return await prisma.user.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });
  }

  async updatePasswordHash(id, passwordHash) {
    return await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async markEmailVerified(id) {
    return await prisma.user.update({
      where: { id },
      data: { isVerified: true },
      select: userPublicSelect,
    });
  }

  async delete(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}

export default UserModel;
