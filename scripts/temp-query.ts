import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- RESULTADOS DAS CONSULTAS JIUSPEAK ---");
  const queries = [
    { name: "GlobalTeam", query: 'SELECT COUNT(*) FROM "GlobalTeam";' },
    { name: "Academy", query: 'SELECT COUNT(*) FROM "Academy";' },
    { name: "AcademyBranch", query: 'SELECT COUNT(*) FROM "AcademyBranch";' },
    { name: "AcademyRanking", query: 'SELECT COUNT(*) FROM "AcademyRanking";' }
  ];

  for (const q of queries) {
    try {
      const res = await prisma.$queryRawUnsafe(q.query);
      console.log(`✅ [${q.name}]:`, JSON.stringify(res));
    } catch (e: any) {
      console.log(`❌ [${q.name}] FALHOU:`, e.message);
    }
  }
}

main()
  .catch(err => {
    console.error("Erro fatal:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
