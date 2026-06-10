import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prismaRaw?: PrismaClient;
  prisma?: any;
};

const prismaRaw = globalForPrisma.prismaRaw ?? new PrismaClient({
  log: ['error']
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaRaw = prismaRaw;
}

// Transparently handle serialization/deserialization of plan features list
export const prisma = globalForPrisma.prisma ?? prismaRaw.$extends({
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
        return (prismaRaw.plan as any).create(args);
      },
      async update(args: any) {
        if (args.data && Array.isArray(args.data.features)) {
          args.data.features = JSON.stringify(args.data.features);
        }
        return (prismaRaw.plan as any).update(args);
      },
      async upsert(args: any) {
        if (args.create && Array.isArray(args.create.features)) {
          args.create.features = JSON.stringify(args.create.features);
        }
        if (args.update && Array.isArray(args.update.features)) {
          args.update.features = JSON.stringify(args.update.features);
        }
        return (prismaRaw.plan as any).upsert(args);
      },
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export function getPrisma(): PrismaClient {
  return prisma as any;
}

let dbConnected = false;

export function isDatabaseConnected(): boolean {
  return dbConnected;
}

// Assert database readiness, logging connection health and status
export async function assertDatabaseConnection(): Promise<void> {
  try {
    console.log("⚙️  [DATABASE BOOTSTRAP] Verificando conexão do banco de dados PostgreSQL integrado...");
    await prismaRaw.$connect();
    
    // Attempt schema connection validation
    await prismaRaw.$queryRaw`SELECT 1`;
    console.log("✓ PostgreSQL conectado com sucesso");
    dbConnected = true;
  } catch (e: any) {
    dbConnected = false;
    console.error("✗ Falha ao conectar-se ao PostgreSQL:", e.message || e);
  }
}
