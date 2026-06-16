import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- INICIANDO EXTRATAÇÃO COMPLETA DE DADOS ---");
  
  // 1. Query all GlobalTeams
  const teams = await prisma.globalTeam.findMany({
    include: {
      _count: {
        select: {
          branches: true,
          users: true
        }
      }
    }
  });
  console.log("=== GLOBAL TEAMS ===");
  console.log(JSON.stringify(teams, null, 2));

  // 2. Query all AcademyBranches
  const branches = await prisma.academyBranch.findMany({
    include: {
      _count: {
        select: {
          users: true
        }
      }
    }
  });
  console.log("=== ACADEMY BRANCHES ===");
  console.log(JSON.stringify(branches, null, 2));

  // 3. Query all IndependentAcademies
  const independents = await prisma.independentAcademy.findMany({
    include: {
      _count: {
        select: {
          users: true
        }
      }
    }
  });
  console.log("=== INDEPENDENT ACADEMIES ===");
  console.log(JSON.stringify(independents, null, 2));

  // 4. Query users associated with academies/teams
  const totalUsersWithTeam = await prisma.user.count({
    where: {
      globalTeamId: { not: null }
    }
  });
  const totalUsersWithBranch = await prisma.user.count({
    where: {
      branchId: { not: null }
    }
  });
  const totalUsersWithIndependent = await prisma.user.count({
    where: {
      independentAcademyId: { not: null }
    }
  });
  
  console.log("=== METRICAS DE RELACIONAMENTO DE USUARIOS ===");
  console.log({
    totalUsersWithTeam,
    totalUsersWithBranch,
    totalUsersWithIndependent
  });
}

main()
  .catch(err => {
    console.error("Erro fatal:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

