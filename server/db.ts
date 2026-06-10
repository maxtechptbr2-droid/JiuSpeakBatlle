import { PrismaClient } from '@prisma/client';

// Core Prisma Client Instance using PostgreSQL
const globalForPrisma = globalThis as unknown as {
  prismaRaw?: PrismaClient;
};

// Instantiate the real, native PostgreSQL Prisma Client
export const prismaRaw =
  globalForPrisma.prismaRaw ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaRaw = prismaRaw;
}

let dbConnected = false;

export function isDatabaseConnected(): boolean {
  return dbConnected;
}

// =========================================================================
// HIGH-FIDELITY OFFLINE MOCK DATASTORE FOR THE PREVIEW / DEVELOPMENT RUNS
// =========================================================================

// Memory-based tables seeded with realistic BJJ data
const mockTables: Record<string, any[]> = {
  user: [
    {
      id: "admin-id-123",
      email: "mestre.carlos@jiuspeak.com.br",
      name: "Mestre Carlos (ADMIN)",
      password: "$2b$10$xyzHashedPasswordPlaceholder",
      isEmailVerified: true,
      role: "admin",
      belt: "BLACK",
      stripes: 4,
      xp: 2500,
      level: 30,
      elo: 1500,
      avatar: "default",
      bio: "Mestre faixa preta de Jiu-Jitsu, fundador e treinador principal do Tatame Virtual da JiuSpeak.",
      city: "Rio de Janeiro",
      country: "Brasil",
      vipActive: true,
      masterActive: true,
      createdAt: new Date("2026-06-01T00:00:00.000Z"),
      updatedAt: new Date("2026-06-01T00:00:00.000Z"),
    },
    {
      id: "athlete-id-1",
      email: "luana.silva@gmail.com",
      name: "Luana Silva",
      password: "$2b$10$xyzHashedPasswordPlaceholder",
      isEmailVerified: true,
      role: "ATHLETE",
      belt: "BLUE",
      stripes: 2,
      xp: 980,
      level: 8,
      elo: 1150,
      avatar: "default",
      city: "São Paulo",
      country: "Brasil",
      vipActive: true,
      createdAt: new Date("2026-06-02T10:00:00.000Z"),
      updatedAt: new Date("2026-06-02T10:00:00.000Z"),
    },
    {
      id: "athlete-id-2",
      email: "bruno.bjj@gmail.com",
      name: "Bruno Santos",
      password: "$2b$10$xyzHashedPasswordPlaceholder",
      isEmailVerified: true,
      role: "ATHLETE",
      belt: "PURPLE",
      stripes: 1,
      xp: 1750,
      level: 14,
      elo: 1320,
      avatar: "default",
      city: "Curitiba",
      country: "Brasil",
      vipActive: false,
      createdAt: new Date("2026-06-03T14:30:00.000Z"),
      updatedAt: new Date("2026-06-03T14:30:00.000Z"),
    }
  ],
  wallet: [
    {
      id: "wallet-id-admin",
      userId: "admin-id-123",
      balanceKC: 5000,
      balanceAvailable: 2500.50,
      balancePending: 0.00,
      withdrawnTotal: 450.00,
      createdAt: new Date("2026-06-01T00:01:00.000Z"),
      updatedAt: new Date(),
    },
    {
      id: "wallet-id-1",
      userId: "athlete-id-1",
      balanceKC: 1500,
      balanceAvailable: 0.00,
      balancePending: 0.00,
      withdrawnTotal: 0.00,
      createdAt: new Date("2026-06-02T10:01:00.000Z"),
      updatedAt: new Date(),
    },
    {
      id: "wallet-id-2",
      userId: "athlete-id-2",
      balanceKC: 250,
      balanceAvailable: 0.00,
      balancePending: 0.00,
      withdrawnTotal: 0.00,
      createdAt: new Date("2026-06-03T14:31:00.000Z"),
      updatedAt: new Date(),
    }
  ],
  plan: [
    {
      id: "plan-basico-id",
      name: "Básico",
      description: "Plano essencial gratuito para atletas iniciarem as lições.",
      priceBRL: 0.00,
      interval: "monthly",
      features: '["Acesso a conteúdos básicos", "Fórum comum de Jiu-Jitsu", "Perfil de atleta básico"]',
      active: true,
      createdAt: new Date("2026-05-01"),
    },
    {
      id: "plan-vip-fighter-id",
      name: "VIP Fighter",
      description: "Aceleração completa com inteligência artificial e multiplicadores.",
      priceBRL: 49.90,
      interval: "monthly",
      features: '["2x XP multiplicador em pvp e lições", "Selo VIP de Atleta Verificado", "Cursos VIP exclusivos", "Mentor Inteligente IA (Gemini API)"]',
      active: true,
      createdAt: new Date("2026-05-01"),
    },
    {
      id: "plan-mestre-imperial-id",
      name: "Mestre Imperial",
      description: "Acesso total, moedas imediatas e conteúdo definitivo liberado.",
      priceBRL: 99.90,
      interval: "yearly",
      features: '["Todos os cursos Premium liberados", "Kimono Imperial Digital Raro", "2000 Kimon Coins de bônus imediato", "Canal exclusivo e relatórios de métricas avançadas"]',
      active: true,
      createdAt: new Date("2026-05-01"),
    }
  ],
  subscription: [],
  payment: [],
  auditlog: [
    {
      id: "audit-1",
      action: "USER_AUTHENTICATION",
      ipAddress: "127.0.0.1",
      userId: "admin-id-123",
      payload: '{"details":"Successful administrator root console auth done via web interface"}',
      createdAt: new Date(),
    }
  ]
};

class MockModel {
  table: any[];
  modelName: string;

  constructor(modelName: string, table: any[]) {
    this.modelName = modelName;
    this.table = table;
  }

  private resolveRelationships(item: any, args: any) {
    if (!item) return item;
    const cloned = { ...item };
    
    // Check if relationships are requested in 'include'
    if (args.include) {
      for (const rel in args.include) {
        if (args.include[rel]) {
          const lowerRel = rel.toLowerCase();
          
          if (lowerRel === "wallet") {
            const relWallet = mockTables.wallet.find(w => w.userId === cloned.id);
            cloned.wallet = relWallet || null;
          } else if (lowerRel === "user") {
            const relUser = mockTables.user.find(u => u.id === cloned.userId);
            cloned.user = relUser || null;
          } else if (lowerRel === "subscriptions") {
            const relSubs = mockTables.subscription.filter(s => s.userId === cloned.id);
            cloned.subscriptions = relSubs || [];
          } else if (lowerRel === "payments") {
            const relPayments = mockTables.payment.filter(p => p.userId === cloned.id);
            cloned.payments = relPayments || [];
          } else if (lowerRel === "plan") {
            const relPlan = mockTables.plan.find(p => p.id === cloned.planId);
            cloned.plan = relPlan || null;
          } else {
            cloned[rel] = null;
          }
        }
      }
    }
    return cloned;
  }

  async findMany(args: any = {}) {
    let result = [...this.table];
    
    if (args.where) {
      result = result.filter(item => {
        for (const key in args.where) {
          const val = args.where[key];
          if (val === undefined) continue;
          
          if (val && typeof val === "object") {
            if ("in" in val) {
              if (Array.isArray(val.in) && !val.in.includes(item[key])) return false;
            }
            if ("not" in val) {
              if (item[key] === val.not) return false;
            }
          } else if (item[key] !== val) {
            return false;
          }
        }
        return true;
      });
    }

    if (args.orderBy) {
      const keys = Object.keys(args.orderBy);
      if (keys.length > 0) {
        const key = keys[0];
        const dir = args.orderBy[key];
        result.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return dir === "desc" ? 1 : -1;
          if (valA > valB) return dir === "desc" ? -1 : 1;
          return 0;
        });
      }
    }

    if (args.skip !== undefined) {
      result = result.slice(args.skip);
    }
    if (args.take !== undefined) {
      result = result.slice(0, args.take);
    }

    return result.map(item => this.resolveRelationships(item, args));
  }

  async findFirst(args: any = {}) {
    const list = await this.findMany(args);
    return list[0] || null;
  }

  async findUnique(args: any = {}) {
    if (args.where) {
      if (args.where.id) {
        const item = this.table.find(x => x.id === args.where.id);
        return this.resolveRelationships(item, args);
      }
      if (args.where.email) {
        const item = this.table.find(x => x.email === args.where.email);
        return this.resolveRelationships(item, args);
      }
      if (args.where.username) {
        const item = this.table.find(x => x.username === args.where.username);
        return this.resolveRelationships(item, args);
      }
    }
    return this.findFirst(args);
  }

  async count(args: any = {}) {
    const list = await this.findMany(args);
    return list.length;
  }

  async create(args: any = {}) {
    // Stringify features if they are an array (e.g. for Plan creation compatibility)
    if (args.data && Array.isArray(args.data.features)) {
      args.data.features = JSON.stringify(args.data.features);
    }

    const data = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...args.data,
    };
    
    this.table.push(data);
    return this.resolveRelationships(data, args);
  }

  async update(args: any = {}) {
    if (args.data && Array.isArray(args.data.features)) {
      args.data.features = JSON.stringify(args.data.features);
    }

    const item = this.table.find(x => x.id === args.where?.id || x.email === args.where?.email);
    if (item) {
      Object.assign(item, args.data);
      item.updatedAt = new Date();
      return this.resolveRelationships(item, args);
    }
    return null;
  }

  async upsert(args: any = {}) {
    if (args.create && Array.isArray(args.create.features)) {
      args.create.features = JSON.stringify(args.create.features);
    }
    if (args.update && Array.isArray(args.update.features)) {
      args.update.features = JSON.stringify(args.update.features);
    }

    let item = this.table.find(x => x.id === args.where?.id || x.email === args.where?.email);
    if (item) {
      Object.assign(item, args.update);
      item.updatedAt = new Date();
      return this.resolveRelationships(item, args);
    } else {
      const data = {
        id: args.where?.id || Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.create,
      };
      this.table.push(data);
      return this.resolveRelationships(data, args);
    }
  }

  async delete(args: any = {}) {
    const idx = this.table.findIndex(x => x.id === args.where?.id || x.email === args.where?.email);
    if (idx !== -1) {
      const deleted = this.table[idx];
      this.table.splice(idx, 1);
      return this.resolveRelationships(deleted, args);
    }
    return null;
  }

  async updateMany(args: any = {}) {
    return { count: this.table.length };
  }

  async deleteMany(args: any = {}) {
    const qty = this.table.length;
    this.table.length = 0;
    return { count: qty };
  }
}

// Transparently handle serialization/deserialization of plan features list in real PrismaClient
const extendedPrismaRaw = prismaRaw.$extends({
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

const mockModels: Record<string, MockModel> = {};

// Transparent global Proxy wrapping PrismaClient to fall back to memory when DB is offline
export const prisma = new Proxy(extendedPrismaRaw, {
  get(target, prop, receiver) {
    if (typeof prop === "string") {
      if (prop === "isMock" || prop === "isOffline") {
        return !isDatabaseConnected();
      }
      
      if (prop === "$queryRaw" || prop === "$queryRawUnsafe") {
        return async (...args: any[]) => {
          if (isDatabaseConnected()) {
            return (extendedPrismaRaw as any)[prop](...args);
          }
          return [];
        };
      }
      
      if (prop === "$executeRaw" || prop === "$executeRawUnsafe") {
        return async (...args: any[]) => {
          if (isDatabaseConnected()) {
            return (extendedPrismaRaw as any)[prop](...args);
          }
          return 0;
        };
      }
      
      if (prop === "$connect") {
        return async () => {
          if (isDatabaseConnected()) {
            return extendedPrismaRaw.$connect();
          }
        };
      }
      
      if (prop === "$disconnect") {
        return async () => {};
      }
      
      if (prop === "$transaction") {
        return async (arg: any) => {
          if (isDatabaseConnected()) {
            return (extendedPrismaRaw as any).$transaction(arg);
          }
          if (Array.isArray(arg)) {
            const results = [];
            for (const item of arg) {
              results.push(await item);
            }
            return results;
          }
          if (typeof arg === "function") {
            return arg(receiver);
          }
          return null;
        };
      }
      
      // If we are actively connected to PostgreSQL database, return the real extended model first!
      if (isDatabaseConnected()) {
        const originalModel = (extendedPrismaRaw as any)[prop];
        if (originalModel) return originalModel;
      }
      
      // If database is disconnected or unreachable, use high-fidelity offline mock tables
      const modelName = prop.toLowerCase();
      if (!mockModels[modelName]) {
        if (!mockTables[modelName]) {
          mockTables[modelName] = [];
        }
        mockModels[modelName] = new MockModel(prop, mockTables[modelName]);
      }
      return mockModels[modelName];
    }
    return Reflect.get(target, prop, receiver);
  }
}) as any;

export function getPrisma(): PrismaClient {
  return prisma;
}

export async function assertDatabaseConnection(): Promise<void> {
  try {
    console.log("⚙️  [DATABASE BOOTSTRAP] Verificando conexão do banco de dados PostgreSQL integrado...");
    await prismaRaw.$connect();
    await prismaRaw.$queryRaw`SELECT 1`;
    console.log("✓ PostgreSQL conectado com sucesso");
    dbConnected = true;
  } catch (e: any) {
    dbConnected = false;
    console.error("✗ Falha ao conectar-se ao PostgreSQL:", e.message || e);
    console.log("⚠️  [DATABASE FALLBACK] PostgreSQL indisponível na Sandbox. Ativando simulador integrado em-memória para garantir interface funcional sem erros.");
  }
}
