import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let prisma: PrismaClient | null = null;
let dbConnected = false;

export function isDatabaseConnected(): boolean {
  return dbConnected;
}

// Enforce strict initialization of PostgreSQL PrismaClient.
export function getPrisma(): PrismaClient {
  if (!prisma) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error(JSON.stringify({
        error: "DATABASE_URL_MISSING",
        message: "A variável de ambiente DATABASE_URL está ausente ou vazia.",
         सलाह: "O banco de dados PostgreSQL real precisa estar configurado para operação segura.",
        timestamp: new Date().toISOString()
      }, null, 2));
      throw new Error("DATABASE_URL is missing or empty. Real database connection is required.");
    }

    try {
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
      throw e;
    }
  }
  return prisma;
}

// Assert database readiness, logging connection health and status
export async function assertDatabaseConnection(): Promise<void> {
  let client: PrismaClient;
  try {
    client = getPrisma();
  } catch (err: any) {
    dbConnected = false;
    console.error("✗ Falha inicial ao carregar o Prisma:</n>", err.message || err);
    return;
  }

  // Attempt to apply migrations automatically on boot to avoid schema drift
  if (process.env.DATABASE_URL) {
    try {
      console.log("⚙️  [DATABASE BOOTSTRAP] Verificando e aplicando migrações pendentes...");
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      console.log("✓ [DATABASE BOOTSTRAP] Migrações aplicadas ou verificadas com sucesso!");
    } catch (migError: any) {
      console.warn("⚠️ [DATABASE BOOTSTRAP FAILURE] Não foi possível rodar migrations automáticas:", migError.message || migError);
    }
  }

  let retries = 5;
  while (retries > 0) {
    try {
      // Attempt connection
      await client.$connect();

      // Attempt a basic check query to active postgres
      await client.$queryRaw`SELECT 1`;
      console.log("✓ PostgreSQL conectado com sucesso");
      dbConnected = true;
      return;
    } catch (e: any) {
      retries--;
      if (retries === 0) {
        dbConnected = false;
        console.error("✗ Falha ao conectar-se ao PostgreSQL. O sistema operará com erros reais de banco de dados.");
        return;
      }
      console.warn(`Tentativa de conexão com banco de dados falhou. Retentando em 1.5s (${retries} restantes)...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}
