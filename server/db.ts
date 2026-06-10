import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let prismaRaw: PrismaClient | null = null;
let prisma: any = null;
let dbConnected = false;

export function isDatabaseConnected(): boolean {
  return dbConnected;
}

// Enforce strict initialization of SQLite PrismaClient with Client Extension.
export function getPrisma(): PrismaClient {
  if (!prisma) {
    let finalDbUrl = "file:./prisma/dev.db";
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.startsWith("file:")) {
      finalDbUrl = dbUrl;
    }

    try {
      prismaRaw = new PrismaClient({
        datasources: {
          db: {
            url: finalDbUrl,
          },
        },
      });

      // Extend Prisma Client to handle serialization/deserialization of plan features list transparently for SQLite
      prisma = prismaRaw.$extends({
        result: {
          plan: {
            features: {
              needs: { features: true },
              compute(plan: any) {
                try {
                  return JSON.parse(plan.features) as string[];
                } catch {
                  if (typeof plan.features === "string") {
                    return plan.features.split(",").map((f: string) => f.trim()).filter(Boolean);
                  }
                  return [];
                }
              },
            },
          },
        },
        model: {
          plan: {
            async create(args: any) {
              if (args.data && Array.isArray(args.data.features)) {
                args.data.features = JSON.stringify(args.data.features);
              }
              return (prismaRaw!.plan as any).create(args);
            },
            async update(args: any) {
              if (args.data && Array.isArray(args.data.features)) {
                args.data.features = JSON.stringify(args.data.features);
              }
              return (prismaRaw!.plan as any).update(args);
            },
            async upsert(args: any) {
              if (args.create && Array.isArray(args.create.features)) {
                args.create.features = JSON.stringify(args.create.features);
              }
              if (args.update && Array.isArray(args.update.features)) {
                args.update.features = JSON.stringify(args.update.features);
              }
              return (prismaRaw!.plan as any).upsert(args);
            },
          },
        },
      }) as any;
    } catch (e: any) {
      console.error("FATAL_DATABASE_ERROR: Falha ao instanciar PrismaClient do SQLite:", e.message || e);
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
    console.error("✗ Falha inicial ao carregar o Prisma:", err.message || err);
    return;
  }

  try {
    console.log("⚙️  [DATABASE BOOTSTRAP] Verificando conexão do banco de dados SQLite local...");
    await (client as any).$connect();
    
    // Attempt schema connection validation
    await (client as any).$queryRaw`SELECT 1`;
    console.log("✓ SQLite conectado com sucesso");
    dbConnected = true;
  } catch (e: any) {
    dbConnected = false;
    console.error("✗ Falha ao conectar-se ao SQLite:", e.message || e);
  }
}
