import { PrismaClient } from "@prisma/client";

export async function seedAcademyHierarchy(prisma: PrismaClient) {
  console.log("🌱 [SEED MODULE: ACADEMY HIERARCHY] Verificando hierarquia de academias...");
  try {
    const existingTeams = await prisma.globalTeam.count();
    if (existingTeams >= 50) {
      console.log("✓ [SEED MODULE: ACADEMY HIERARCHY] Já existem equipes suficientes.");
      return;
    }

    console.log("🧹 [SEED] Limpando dados antigos das tabelas de academias para garantir consistência...");
    await prisma.independentAcademy.deleteMany({});
    await prisma.academyBranch.deleteMany({});
    await prisma.globalTeam.deleteMany({});

    console.log("✨ Semeando 50 Equipes Globais...");
    const globalTeamsToCreate = [];
    const baseNames = [
      "Gracie Barra", "Alliance", "Atos Jiu-Jitsu", "GFTeam", "Checkmat",
      "Nova União", "Dream Art", "Six Blades BJJ", "AOJ (Art of Jiu Jitsu)", "Carlson Gracie Team",
      "Zenith BJJ", "Brasa CTA", "Lotus Club", "Ribeiro Jiu-Jitsu", "Fight Sports",
      "De La Riva", "Fratres BJJ", "Cicero Costha", "Guigo Jiu-Jitsu", "Alliance SP",
      "Roger Gracie Academy", "Renzo Gracie Academy", "Kron Gracie Academy", "Relson Gracie Team", "Rickson Gracie Association",
      "Marcello Monteiro Association", "Checkmat HQ", "Atos San Diego", "Gracie Humaitá", "Ares BJJ",
      "Unity Jiu-Jitsu", "Studio 540", "Pedigo Submission Fighting", "10th Planet Jiu-Jitsu", "Jonas BJJ",
      "Infight", "Gibi Team", "Behring Jiu-Jitsu", "Cleyton Bastos Team", "Fadda BJJ",
      "Gordo Jiu-Jitsu", "Kioto BJJ", "Grateful BJJ", "Team Lloyd Irvin", "BTT (Brazilian Top Team)",
      "Valkyrie BJJ", "Black Sheep Syndicate", "Submission Club", "Apex Jiansen", "Elite Sampa BJJ"
    ];

    const countries = ["Brasil", "USA", "Portugal", "United Arab Emirates", "Spain", "Japan", "United Kingdom", "France", "Canada", "Australia"];
    const citiesBR = ["São Paulo", "Rio de Janeiro", "Curitiba", "Belo Horizonte", "Porto Alegre", "Manaus", "Florianópolis", "Fortaleza", "Salvador", "Goiânia"];
    const statesBR = ["SP", "RJ", "PR", "MG", "RS", "AM", "SC", "CE", "BA", "GO"];
    
    for (let i = 0; i < 50; i++) {
      const name = baseNames[i] || `Global Team Elite ${i + 1}`;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${i}`;
      globalTeamsToCreate.push({
        id: `team-global-id-${i}`,
        name,
        slug,
        logo: `https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200`,
        countryOrigin: countries[i % countries.length],
        website: `https://www.${slug}.com`,
        instagram: `@${slug}`,
        description: `Liderança global de Jiu-Jitsu com foco em auto-defesa, técnica avançada de competição, respeito, disciplina e alta performance.`,
        foundedYear: 1980 + (i % 40),
        totalMembers: 0,
        totalPoints: 0,
        verified: i % 3 === 0
      });
    }

    await prisma.globalTeam.createMany({
      data: globalTeamsToCreate
    });
    console.log("✓ 50 Equipes Globais criadas com sucesso!");

    console.log("✨ Semeando 500 Filiais Oficiais (10 por equipe)...");
    const branchesToCreate = [];
    let branchCounter = 0;

    for (let i = 0; i < 50; i++) {
      const teamId = `team-global-id-${i}`;
      const teamName = globalTeamsToCreate[i].name;

      for (let j = 0; j < 10; j++) {
        const country = countries[j % countries.length];
        const isBR = country === "Brasil";
        const city = isBR ? citiesBR[j % citiesBR.length] : "Miami";
        const state = isBR ? statesBR[j % statesBR.length] : "FL";
        const name = `${teamName} - Headquarter ${city}`;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${branchCounter}`;

        branchesToCreate.push({
          id: `branch-id-${branchCounter}`,
          globalTeamId: teamId,
          name,
          slug,
          country,
          state,
          city,
          address: `Av. Pres. Kennedy, ${100 + (j * 25)}, ${city}`,
          latitude: -23.5505 + (branchCounter * 0.0001),
          longitude: -46.6333 - (branchCounter * 0.0001),
          headProfessor: `Professor ${["Silva", "Santos", "Gracie", "Machado", "Ribeiro", "Cavalcanti", "Barbosa", "Nogueira", "Maia", "Vieira"][j % 10]}`,
          logo: `https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150`,
          membersCount: 0,
          points: 0,
          verified: branchCounter % 4 === 0
        });

        branchCounter++;
      }
    }

    await prisma.academyBranch.createMany({
      data: branchesToCreate
    });
    console.log(`✓ ${branchCounter} Filiais Oficiais criadas com sucesso!`);

    console.log("✨ Semeando 1000 Academias Independentes...");
    const chunkSize = 200;
    const prefixes = ["Suave Arte", "Gracie", "Tatame Ativo", "BJJ Elite", "Golden Belt", "Legacy BJJ", "Zenith", "Predator", "Iron Guard", "Gladiator"];
    const suffixes = ["Academy", "Club", "School", "Dojo", "Team", "Training Center", "Association", "Inc", "Society", "HQ"];

    for (let chunkIndex = 0; chunkIndex < 5; chunkIndex++) {
      const chunkData = [];
      for (let j = 0; j < chunkSize; j++) {
        const globalIndex = chunkIndex * chunkSize + j;
        const prefix = prefixes[globalIndex % prefixes.length];
        const suffix = suffixes[globalIndex % suffixes.length];
        const city = citiesBR[globalIndex % citiesBR.length];
        const state = statesBR[globalIndex % statesBR.length];
        const country = countries[globalIndex % countries.length];
        const name = `${prefix} ${suffix} ${city} #${globalIndex + 1}`;

        chunkData.push({
          id: `independent-id-${globalIndex}`,
          name,
          country,
          state,
          city,
          address: `Rua das Alavancas, ${200 + (globalIndex * 5)}, Centro`,
          headProfessor: `Sansei ${["Almeida", "Mendes", "Pena", "Lo", "Gama", "Ferreira", "Souza", "Pereira", "Oliveira", "Barbosa"][globalIndex % 10]}`,
          logo: `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=150`,
          membersCount: 0,
          points: 0,
          verified: globalIndex % 5 === 0
        });
      }

      await prisma.independentAcademy.createMany({
        data: chunkData
      });
      console.log(`   ├ Semeado lote ${chunkIndex + 1}/5 (Contém ${chunkSize} academias independentes)`);
    }

    console.log("✓ 1000 Academias Independentes criadas com sucesso!");
    console.log("🎉 [SEED MODULE: ACADEMY HIERARCHY COMPLETE]");
  } catch (error: any) {
    console.error("✗ [SEED MODULE: ACADEMY HIERARCHY ERROR]:", error.message || error);
  }
}
