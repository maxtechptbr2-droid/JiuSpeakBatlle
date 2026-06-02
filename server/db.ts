// @ts-ignore
import { PrismaClient } from '@prisma/client';

let prisma: any = null;

// Defensive initialization to prevent crashes if DATABASE_URL is missing or postgres is not running.
export function getPrisma(): any {
  if (process.env.DATABASE_URL) {
    if (!prisma) {
      try {
        prisma = new PrismaClient();
      } catch (e) {
        console.warn('Failing to initialize Prisma client. Check database credentials.', e);
        prisma = null;
      }
    }
    return prisma;
  }
  return null;
}
