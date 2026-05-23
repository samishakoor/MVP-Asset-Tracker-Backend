import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Verifies the database is reachable before the HTTP server starts.
 * Prisma equivalent of Sequelize authenticate().
 */
export async function connectDatabase() {
  await prisma.$connect();
}

// Handle cleanup on app termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
