import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export function getPrisma(): PrismaClient {
  return prisma;
}

let dbConnected = false;

export function isDatabaseConnected(): boolean {
  return dbConnected;
}

export async function assertDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ PostgreSQL conectado');
    dbConnected = true;
    return true;
  } catch (error) {
    console.error('✗ PostgreSQL indisponível', error);
    dbConnected = false;
    return false;
  }
}
