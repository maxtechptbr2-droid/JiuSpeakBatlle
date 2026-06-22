import { prisma } from '../server/db.js';

async function main() {
  console.log("=== AUDITANDO EQUIPES GLOBAIS (GlobalTeam) ===");
  const teams = await prisma.globalTeam.findMany({
    select: {
      id: true,
      name: true,
      countryOrigin: true,
      headquartersCountry: true,
    }
  });

  console.log("ID | Nome | País de Origem | País da Sede");
  console.log("-----------------------------------------");
  teams.forEach(t => {
    console.log(`${t.id} | ${t.name} | ${t.countryOrigin || 'N/A'} | ${t.headquartersCountry || 'N/A'}`);
  });

  console.log("\n=== AUDITANDO FILIAIS DE ACADEMIA (AcademyBranch) ===");
  const branches = await prisma.academyBranch.findMany({
    select: {
      id: true,
      name: true,
      country: true,
      globalTeam: {
        select: {
          name: true
        }
      }
    }
  });

  console.log("ID | Nome da Filial | País Atual | Equipe Global");
  console.log("-------------------------------------------------");
  branches.forEach(b => {
    console.log(`${b.id} | ${b.name} | ${b.country || 'N/A'} | ${b.globalTeam?.name || 'N/A'}`);
  });

  console.log("\n=== AUDITANDO ACADEMIAS INDEPENDENTES (IndependentAcademy) ===");
  const independents = await prisma.independentAcademy.findMany({
    select: {
      id: true,
      name: true,
      country: true
    }
  });

  console.log("ID | Nome da Academia | País Atual");
  console.log("----------------------------------");
  independents.forEach(i => {
    console.log(`${i.id} | ${i.name} | ${i.country || 'N/A'}`);
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
