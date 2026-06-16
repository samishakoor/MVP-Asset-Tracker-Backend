import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('Start seeding...');

  const adminEmail = 'sami.shakoor788@gmail.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
      console.log('Admin already exists, skipping seed:', {
        id: existingAdmin.id,
        email: existingAdmin.email,
        role: existingAdmin.role,
      });
    return;
  }

  const adminPasswordHash = await bcrypt.hash('Admin123!', SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isVerified: true,
    },
  });
  console.log('Seeded admin:', { id: admin.id, email: admin.email, role: admin.role });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
