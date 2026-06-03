// @ts-ignore
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

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
      prisma = new PrismaClient();
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
  // Let's perform a database schema push to PostgreSQL automatically at start
  try {
    const { execSync } = require("child_process");
    console.log("🔄 [JiuSpeak OS] Sincronizando tabelas do banco de dados (Prisma push)...");
    execSync("npx prisma db push --accept-data-loss", { 
      stdio: "inherit",
      env: { ...process.env }
    });
    console.log("✅ [JiuSpeak OS] Tabelas sincronizadas com sucesso!");
  } catch (pushErr: any) {
    console.warn("⚠️ [JiuSpeak OS] Ocorreu uma advertência durante a sincronização de banco (db push):", pushErr.message || pushErr);
  }

  const client = getPrisma();
  try {
    // Attempt a basic check query to active postgres
    await client.$queryRaw`SELECT 1`;
    console.log("✅ [JiuSpeak OS] Conexão com o banco de dados PostgreSQL estabelecida com sucesso via Prisma.");
  } catch (e: any) {
    console.error("\n" + "=".repeat(80));
    console.error(JSON.stringify({
      error: "DATABASE_CONNECTION_FAILED",
      message: "Falha crítica: Não foi possível conectar ao banco de dados PostgreSQL na inicialização da aplicação.",
      details: e.message || e,
      advice: "Garanta que o serviço do Postgres esteja online e acessível no endereço fornecido em DATABASE_URL no .env.",
      timestamp: new Date().toISOString()
    }, null, 2));
    console.error("=".repeat(80) + "\n");
    process.exit(1);
  }
}
