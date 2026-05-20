import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('Start seeding...');

  const adminPasswordHash = await bcrypt.hash('Admin123!', SALT_ROUNDS);
  const employeePasswordHash = await bcrypt.hash('Employee123!', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@test.com' },
    update: {
      name: 'Employee User',
      passwordHash: employeePasswordHash,
      role: 'employee',
    },
    create: {
      email: 'employee@test.com',
      name: 'Employee User',
      passwordHash: employeePasswordHash,
      role: 'employee',
    },
  });

  console.log('Seeded admin:', { id: admin.id, email: admin.email, role: admin.role });
  console.log('Seeded employee:', { id: employee.id, email: employee.email, role: employee.role });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
