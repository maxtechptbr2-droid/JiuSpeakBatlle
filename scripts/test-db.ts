import { PrismaClient } from '@prisma/client';

async function test() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("Connect successful!");
    const count = await prisma.storeProduct.count();
    console.log("StoreProduct count:", count);
  } catch (err: any) {
    console.error("Database test error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
