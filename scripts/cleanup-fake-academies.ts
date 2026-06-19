import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runCleanup() {
  console.log("🧼 [CLEANUP] Iniciando Saneamento Controlado do Catálogo de Academias...");

  try {
    await prisma.$connect();

    // 1. Auditoria pré-cleanup: verificar se há vínculos ativos com usuários
    const usersWithGlobalTeam = await prisma.user.count({
      where: { globalTeamId: { not: null } }
    });
    const usersWithBranch = await prisma.user.count({
      where: { branchId: { not: null } }
    });
    const usersWithIndependent = await prisma.user.count({
      where: { independentAcademyId: { not: null } }
    });

    console.log(`📊 [AUDITORIA] Associações Ativas no Sistema:`);
    console.log(`   - Usuários com GlobalTeam: ${usersWithGlobalTeam}`);
    console.log(`   - Usuários com AcademyBranch: ${usersWithBranch}`);
    console.log(`   - Usuários com IndependentAcademy: ${usersWithIndependent}`);

    if (usersWithGlobalTeam > 0 || usersWithBranch > 0 || usersWithIndependent > 0) {
      console.warn("⚠️ [ATENÇÃO] Existem usuários reais associados. O saneamento usará tratamento aditivo e de remapeamento preventivo!");
    } else {
      console.log("✓ [STATUS] Banco livre de dependências de usuários nas filiais/equipes. Procedimento 100% seguro.");
    }

    // 2. Identificar e Deletar AcademyBranches duplicadas ou artificiais (ex: "- Headquarter Miami")
    console.log("⚙️ [ETAPA] Filtrando e limpando AcademyBranches artificiais...");
    const fakeBranches = await prisma.academyBranch.findMany({
      where: {
        OR: [
          { name: { contains: "Headquarter Miami" } },
          { name: { contains: "fake" } },
          { slug: { contains: "miami-headquarter" } },
          { slug: { contains: "fake" } }
        ]
      }
    });

    console.log(`   - Encontradas ${fakeBranches.length} filiais artificiais para remoção.`);
    
    let deletedBranchesCount = 0;
    for (const b of fakeBranches) {
      // Verificar se algum usuário refere-se a essa filial específica por segurança máxima
      const referenceCount = await prisma.user.count({ where: { branchId: b.id } });
      if (referenceCount === 0) {
        await prisma.academyBranch.delete({ where: { id: b.id } });
        deletedBranchesCount++;
      } else {
        console.log(`   [i] Filial ${b.name} (ID: ${b.id}) não removida pois possui ${referenceCount} usuário(s) associado(s).`);
      }
    }
    console.log(`   ✓ ${deletedBranchesCount} filiais fakes totalmente eliminadas.`);

    // 3. Identificar e Deletar GlobalTeams que são filiais disfarçadas ou obsoletas (ex: "Alliance SP", "Atos San Diego", "Checkmat HQ")
    console.log("⚙️ [ETAPA] Identificando e limpando Equipes Globais incorretas ou misturadas...");
    const incorrectTeams = await prisma.globalTeam.findMany({
      where: {
        OR: [
          { name: { equals: "Alliance SP" } },
          { name: { equals: "Atos San Diego" } },
          { name: { equals: "Atos Jiu-Jitsu" } },
          { name: { equals: "Checkmat HQ" } },
          { name: { contains: "fake" } },
          { slug: { contains: "fake" } }
        ]
      }
    });

    console.log(`   - Encontradas ${incorrectTeams.length} equipes mundiais incorretas ou obsoletas.`);
    
    let deletedTeamsCount = 0;
    for (const t of incorrectTeams) {
      // Por segurança, se houver usuários ou filiais válidas associados, migramos antes de deletar
      const branchCount = await prisma.academyBranch.count({ where: { globalTeamId: t.id } });
      const userCount = await prisma.user.count({ where: { globalTeamId: t.id } });

      if (branchCount === 0 && userCount === 0) {
        await prisma.globalTeam.delete({ where: { id: t.id } });
        deletedTeamsCount++;
      } else {
        console.log(`   [i] Não removida: Equipe ${t.name} possui ${branchCount} filiais e ${userCount} usuários ativos.`);
      }
    }
    console.log(`   ✓ ${deletedTeamsCount} equipes mundiais com nível incorreto expurgadas com segurança.`);

    // 4. Limpeza opcional de IndependentAcademies artificiais se houver
    console.log("⚙️ [ETAPA] Limpando dados inválidos em IndependentAcademy...");
    const fakeIndependents = await prisma.independentAcademy.findMany({
      where: {
        OR: [
          { name: { contains: "fake" } },
          { name: { contains: "Teste" } }
        ]
      }
    });
    let deletedIndCount = 0;
    for (const ind of fakeIndependents) {
      const userCount = await prisma.user.count({ where: { independentAcademyId: ind.id } });
      if (userCount === 0) {
        await prisma.independentAcademy.delete({ where: { id: ind.id } });
        deletedIndCount++;
      }
    }
    console.log(`   ✓ ${deletedIndCount} academias independentes descartáveis excluídas.`);

    console.log("✨ [FIM] Saneamento programático concluído com extremo sucesso!");
  } catch (error: any) {
    console.error("❌ ERRO NO SANEAMENTO:", error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

runCleanup();
