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

export async function assertDatabaseConnection(): Promise<void> {
  try {
    console.log("⚙️  [DATABASE BOOTSTRAP] Verificando conexão do banco de dados PostgreSQL integrado...");
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ PostgreSQL conectado com sucesso");
    dbConnected = true;
  } catch (e: any) {
    dbConnected = false;
    console.error("✗ Falha ao conectar-se ao PostgreSQL:", e.message || e);
  }
}
