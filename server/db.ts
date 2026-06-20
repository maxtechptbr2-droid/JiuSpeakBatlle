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
let retryInterval: any = null;

export function isDatabaseConnected(): boolean {
  return dbConnected;
}

export function setDatabaseConnected(connected: boolean) {
  dbConnected = connected;
}

export async function assertDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ PostgreSQL conectado');
    dbConnected = true;
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
    return true;
  } catch (error: any) {
    console.warn('⚠️ Banco de dados offline (usando o mecanismo simulado em memória). Tentando reconectar em 10 segundos...');
    dbConnected = false;
    
    if (!retryInterval) {
      retryInterval = setInterval(async () => {
        console.log('🔄 Tentando reconectar ao PostgreSQL...');
        const success = await prisma.$connect()
          .then(() => prisma.$queryRaw`SELECT 1`)
          .then(() => true)
          .catch(() => false);
          
        if (success) {
          console.log('✅ Reconexão ao PostgreSQL realizada com sucesso!');
          dbConnected = true;
          if (retryInterval) {
            clearInterval(retryInterval);
            retryInterval = null;
          }
        }
      }, 10000);
      if (retryInterval && typeof retryInterval.unref === 'function') {
        retryInterval.unref();
      }
    }
    return false;
  }
}
