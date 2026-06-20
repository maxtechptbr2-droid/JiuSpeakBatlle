import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ override: true });

if (process.env.DATABASE_URL) {
  if (process.env.DATABASE_URL.includes('@localhost:')) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@localhost:', '@127.0.0.1:');
  }
}

// Logger altamente descritivo para tratamento e identificação de erros de banco em produção
export function logPrismaError(error: any, context: string = 'Prisma Operation') {
  console.error(`\n[FATAL DATABASE ERROR] ============ Contexto: ${context} ============`);
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error(`Tipo: PrismaClientInitializationError`);
    console.error(`Código de Erro: ${error.errorCode || 'N/A'}`);
    console.error(`Mensagem: ${error.message}`);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`Tipo: PrismaClientKnownRequestError`);
    console.error(`Código Próprio Prisma: ${error.code}`);
    console.error(`Mensagem: ${error.message}`);
    console.error(`Meta Informações:`, error.meta || {});
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    console.error(`Tipo: PrismaClientValidationError`);
    console.error(`Mensagem: ${error.message}`);
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    console.error(`Tipo: PrismaClientUnknownRequestError`);
    console.error(`Mensagem: ${error.message}`);
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    console.error(`Tipo: PrismaClientRustPanicError`);
    console.error(`Mensagem: ${error.message}`);
  } else {
    console.error(`Tipo: Erro Genérico de Banco de Dados`);
    console.error(`Mensagem: ${error.message || String(error)}`);
    if (error.stack) {
      console.error(`Stack Trace:\n${error.stack}`);
    }
  }
  console.error(`========================================================================\n`);
}

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
    console.log('✓ PostgreSQL conectado com absoluto sucesso!');
    dbConnected = true;
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
    return true;
  } catch (error: any) {
    logPrismaError(error, "assertDatabaseConnection (Bootstrap Connection Initializer)");
    dbConnected = false;
    
    if (!retryInterval) {
      retryInterval = setInterval(async () => {
        console.log('🔄 [RETRY LOG] Tentando restabelecer conexão segura ao PostgreSQL...');
        try {
          await prisma.$connect();
          await prisma.$queryRaw`SELECT 1`;
          console.log('✅ [RETRY LOG] Conexão ao PostgreSQL reestabelecida com absoluto sucesso!');
          dbConnected = true;
          if (retryInterval) {
            clearInterval(retryInterval);
            retryInterval = null;
          }
        } catch (retryErr: any) {
          logPrismaError(retryErr, "assertDatabaseConnection: retry reconnect interval");
          dbConnected = false;
        }
      }, 10000);
      if (retryInterval && typeof retryInterval.unref === 'function') {
        retryInterval.unref();
      }
    }
    return false;
  }
}

// Endpoint de status detalhado para auditoria de conexões, latência e migrações
export async function getDatabaseStatus() {
  const start = Date.now();
  let connected = false;
  let latency = 0;
  let migrationsUpToDate = false;
  let prismaClientReady = false;

  try {
    const p = getPrisma();
    if (p) {
      prismaClientReady = true;
      await p.$connect();
      await p.$queryRaw`SELECT 1`;
      connected = true;
      latency = Date.now() - start;
      
      try {
        // Tenta buscar o primeiro usuário para verificar se a tabela e as migrações estão criadas e atualizadas
        await p.user.findFirst({ select: { id: true } });
        migrationsUpToDate = true;
      } catch (migErr: any) {
        logPrismaError(migErr, "getDatabaseStatus: check migrations user query");
        migrationsUpToDate = false;
      }
    }
  } catch (error: any) {
    logPrismaError(error, "getDatabaseStatus: master telemetry audit");
    connected = false;
    migrationsUpToDate = false;
  }

  return {
    connected,
    latency,
    migrationsUpToDate,
    prismaClientReady
  };
}
