import { prisma } from '../server/db.js';

// Curated lookup maps for BJJ Global Teams (Corrections for countryOrigin and headquartersCountry)
const GLOBAL_TEAM_FIXES: Record<string, { countryOrigin: string; headquartersCountry: string }> = {
  "Gracie Barra": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Alliance Jiu-Jitsu": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Checkmat": { countryOrigin: "Brasil", headquartersCountry: "EUA" },
  "Atos Jiu-Jitsu": { countryOrigin: "Brasil", headquartersCountry: "EUA" },
  "Art of Jiu Jitsu (AOJ)": { countryOrigin: "EUA", headquartersCountry: "EUA" },
  "GFTeam (Grappling Fight Team)": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Nova União": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Carlson Gracie Team": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Brazilian Top Team (BTT)": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "De La Riva Jiu-Jitsu": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Soul Fighters": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Ribeiro Jiu-Jitsu / Six Blades": { countryOrigin: "Brasil", headquartersCountry: "EUA" },
  "Fight Sports": { countryOrigin: "EUA", headquartersCountry: "EUA" },
  "Cicero Costha (Alavanca)": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Zenith BJJ": { countryOrigin: "Brasil", headquartersCountry: "EUA" },
  "Gracie Humaitá": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Gracie Academy (Gracie University)": { countryOrigin: "Brasil", headquartersCountry: "EUA" },
  "Renzo Gracie Academy": { countryOrigin: "Brasil", headquartersCountry: "EUA" },
  "Yamasaki Jiu-Jitsu": { countryOrigin: "Brasil", headquartersCountry: "EUA" },
  "Brasa Clube de Jiu-Jitsu": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "B-Team Jiu-Jitsu": { countryOrigin: "Austrália / EUA", headquartersCountry: "EUA" },
  "10th Planet Jiu-Jitsu": { countryOrigin: "EUA", headquartersCountry: "EUA" },
  "Lotus Club": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Fratres Jiu-Jitsu": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Melqui Galvão (MGA)": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Dream Art": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
  "Kioto BJJ": { countryOrigin: "Brasil", headquartersCountry: "Brasil" },
};

// Curated mappings for branches or independent academies (Corrections for country)
const BRANCH_COUNTRY_FIXES: Record<string, string> = {
  // We can match by name or sub-strings
  "Matriz": "Brasil",
  "São Paulo": "Brasil",
  "Rio de Janeiro": "Brasil",
  "Belo Horizonte": "Brasil",
  "Curitiba": "Brasil",
  "Porto Alegre": "Brasil",
  "Florianópolis": "Brasil",
  "Manaus": "Brasil",
  "Brasília": "Brasil",
  "Salvador": "Brasil",
  "Recife": "Brasil",
  "Miami": "EUA",
  "Las Vegas": "EUA",
  "San Diego": "EUA",
  "New York": "EUA",
  "Los Angeles": "EUA",
  "Austin": "EUA",
  "Brooklyn": "EUA",
  "Signal Hill": "EUA",
  "Costa Mesa": "EUA",
  "Orlando": "EUA",
  "Boston": "EUA",
  "Chicago": "EUA",
  "Houston": "EUA",
  "San Francisco": "EUA",
};

async function main() {
  console.log("=== INICIANDO AJUSTE DE PAÍSES DAS EQUIPES E FILIAIS ===");

  // 1. Audit and fix GlobalTeams
  console.log("\n1. Corrigindo Equipes Globais (GlobalTeam)...");
  const teams = await prisma.globalTeam.findMany();
  let teamUpdateCount = 0;

  for (const team of teams) {
    const fix = GLOBAL_TEAM_FIXES[team.name];
    if (fix) {
      const needsOriginUpdate = team.countryOrigin !== fix.countryOrigin;
      const needsHQUpdate = team.headquartersCountry !== fix.headquartersCountry;

      if (needsOriginUpdate || needsHQUpdate) {
        console.log(`[FIX] Atualizando '${team.name}':`);
        if (needsOriginUpdate) {
          console.log(`   - País de Origem: '${team.countryOrigin || 'N/A'}' => '${fix.countryOrigin}'`);
        }
        if (needsHQUpdate) {
          console.log(`   - País da Sede: '${team.headquartersCountry || 'N/A'}' => '${fix.headquartersCountry}'`);
        }

        await prisma.globalTeam.update({
          where: { id: team.id },
          data: {
            countryOrigin: fix.countryOrigin,
            headquartersCountry: fix.headquartersCountry,
          }
        });
        teamUpdateCount++;
      }
    }
  }
  console.log(`✓ Rodada de equipes globais concluída. ${teamUpdateCount} registros corrigidos.`);

  // 2. Audit and fix AcademyBranches
  console.log("\n2. Corrigindo Filiais de Academia (AcademyBranch)...");
  const branches = await prisma.academyBranch.findMany();
  let branchUpdateCount = 0;

  for (const branch of branches) {
    let targetCountry = branch.country;

    // Check if branch name contains city/country keywords (e.g. "São Paulo", "Miami")
    for (const [key, countryVal] of Object.entries(BRANCH_COUNTRY_FIXES)) {
      if (branch.name.toLowerCase().includes(key.toLowerCase())) {
        targetCountry = countryVal;
        break;
      }
    }

    // Default corrections/sanitizations (e.g. if country is missing or empty)
    if (!targetCountry || targetCountry.trim() === "") {
      targetCountry = "Brasil";
    }

    if (branch.country !== targetCountry) {
      console.log(`[FIX] Atualizando Filial '${branch.name}':`);
      console.log(`   - País: '${branch.country || 'N/A'}' => '${targetCountry}'`);

      await prisma.academyBranch.update({
        where: { id: branch.id },
        data: { country: targetCountry }
      });
      branchUpdateCount++;
    }
  }
  console.log(`✓ Rodada de filiais concluída. ${branchUpdateCount} registros corrigidos.`);

  // 3. Audit and fix IndependentAcademies
  console.log("\n3. Corrigindo Academias Independentes (IndependentAcademy)...");
  const independents = await prisma.independentAcademy.findMany();
  let independentUpdateCount = 0;

  for (const ind of independents) {
    let targetCountry = ind.country;

    for (const [key, countryVal] of Object.entries(BRANCH_COUNTRY_FIXES)) {
      if (ind.name.toLowerCase().includes(key.toLowerCase())) {
        targetCountry = countryVal;
        break;
      }
    }

    if (!targetCountry || targetCountry.trim() === "") {
      targetCountry = "Brasil";
    }

    if (ind.country !== targetCountry) {
      console.log(`[FIX] Atualizando Academia Independente '${ind.name}':`);
      console.log(`   - País: '${ind.country || 'N/A'}' => '${targetCountry}'`);

      await prisma.independentAcademy.update({
        where: { id: ind.id },
        data: { country: targetCountry }
      });
      independentUpdateCount++;
    }
  }
  console.log(`✓ Rodada de academias independentes concluída. ${independentUpdateCount} registros corrigidos.`);

  await prisma.$disconnect();
  console.log("\n=== AJUSTES FINALIZADOS COM ABSOLUTO SUCESSO! ===");
}

main().catch(async (e) => {
  console.error("Erro ao rodar script de correção de países:", e);
  await prisma.$disconnect();
  process.exit(1);
});
