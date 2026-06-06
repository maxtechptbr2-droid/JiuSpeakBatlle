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
      console.error(JSON.stringify({
        error: "FATAL_DATABASE_ERROR",
        message: "A variável de ambiente DATABASE_URL está ausente ou vazia.",
        advice: "A plataforma JiuSpeak requer um banco de dados PostgreSQL rodando para persistência confiável de dados de produção.",
        timestamp: new Date().toISOString()
      }, null, 2));
      process.exit(1);
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
        message: "Falha crítica ao instanciar o PrismaClient do Postgres.",
        exception: e.message || e,
        timestamp: new Date().toISOString()
      }, null, 2));
      process.exit(1);
    }
  }
  return prisma;
}

// Assert database readiness, preventing application boot if postgres connection fails
export async function assertDatabaseConnection(): Promise<void> {
  const client = getPrisma();
  let retries = 5;
  while (retries > 0) {
    try {
      // Attempt connection
      await client.$connect();
      console.log("✓ Prisma conectado com sucesso");

      // Attempt a basic check query to active postgres
      await client.$queryRaw`SELECT 1`;
      console.log("✓ PostgreSQL conectado e verificado com sucesso");
      dbConnected = true;
      return;
    } catch (e: any) {
      retries--;
      console.error("✗ Erro de tentativa ao conectar ao PostgreSQL / Prisma", {
        message: e.message || e,
        retriesRemaining: retries,
        timestamp: new Date().toISOString()
      });
      if (retries === 0) {
        dbConnected = false;
        console.error("\n" + "=".repeat(80));
        console.error("[CATASTRÓFICO] ERRO DE CONEXÃO COM O POSTGRESQL:");
        console.error("Não foi possível estabelecer conexão estável com o banco de dados principal.");
        console.error("Como as diretrizes de produção proíbem qualquer fallback para banco em memória, encerraremos o processo para impedir inconsistência de dados (mecanismo anti-502).");
        console.error("Detalhes do erro do driver:", e.message || e);
        console.error("=".repeat(80) + "\n");
        process.exit(1);
      }
      // Wait 1.5 seconds before next connection retry
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}
