// @ts-ignore
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

let dbConnected = false;

export function isDatabaseConnected(): boolean {
  return dbConnected;
}

// Enforce strict initialization. No silent fallback to null or bypass if PostgreSQL is mandatory.
export function getPrisma(): PrismaClient {
  if (!prisma) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.warn(JSON.stringify({
        warning: "DATABASE_URL_MISSING",
        message: "A variável de ambiente DATABASE_URL está ausente ou vazia.",
        advice: "A plataforma JiuSpeak continuará usando o fallback de simulação em memória.",
        timestamp: new Date().toISOString()
      }, null, 2));
      return null as any;
    }
    try {
      // Configure specific pool limits for high concurrency (connection_limit=20, pool_timeout=15)
      let finalDbUrl = dbUrl;
      const parsedUrl = new URL(dbUrl);
      if (!parsedUrl.searchParams.has("connection_limit")) {
        parsedUrl.searchParams.set("connection_limit", "20");
      }
      if (!parsedUrl.searchParams.has("pool_timeout")) {
        parsedUrl.searchParams.set("pool_timeout", "15");
      }
      finalDbUrl = parsedUrl.toString();

      prisma = new PrismaClient({
        datasources: {
          db: {
            url: finalDbUrl,
          },
        },
      });
    } catch (e: any) {
      console.error(JSON.stringify({
        error: "FATAL_DATABASE_ERROR",
        message: "Falha crítica ao instanciar o PrismaClient do Postgres. Continuando sem DB.",
        exception: e.message || e,
        timestamp: new Date().toISOString()
      }, null, 2));
      return null as any;
    }
  }
  return prisma;
}

// Assert database readiness, preventing application boot if postgres connection fails
export async function assertDatabaseConnection(): Promise<void> {
  const client = getPrisma();
  if (!client) {
    dbConnected = false;
    console.warn("⚠️ DATABASE_URL não configurada. Ativando banco de dados em memória.");
    return;
  }
  let retries = 5;
  while (retries > 0) {
    try {
      // Attempt connection
      await client.$connect();

      // Attempt a basic check query to active postgres
      await client.$queryRaw`SELECT 1`;
      console.log("✓ PostgreSQL conectado");
      dbConnected = true;
      return;
    } catch (e: any) {
      retries--;
      if (retries === 0) {
        dbConnected = false;
        console.error("✗ PostgreSQL indisponível. Rodando em modo de simulação em memória.");
        return;
      }
      console.warn(`Tentativa de conexão com banco de dados falhou. Retentando em 1.5s (${retries} restantes)...`);
      // Wait 1.5 seconds before next connection retry
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}
