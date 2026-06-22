import { PrismaClient } from '@prisma/client';

if (process.env.NODE_ENV === "production" && process.env.ALLOW_DATABASE_SEED !== "true") {
  console.log("🚫 Seed bloqueado em produção. Defina ALLOW_DATABASE_SEED=true para permitir.");
  process.exit(0);
}

const prisma = new PrismaClient();

async function runMasterSeed() {
  console.log("\n========================================================");
  console.log("🥋 [MASTER SEED] Carregando equipes e academias reais 🥋");
  console.log("========================================================\n");

  try {
    await prisma.$connect();

    // ── NÍVEL 1: GlobalTeams ──────────────────────────────
    const globalTeamsData = [
      {
        slug: "gracie-barra",
        name: "Gracie Barra",
        founders: "Carlos Gracie Jr.",
        foundedYear: 1986,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: "graciebarra.com",
        instagram: "graciebarra",
        description: "Maior rede de escolas de Jiu-Jitsu do mundo, com mais de 800 unidades em dezenas de países. Fundada por Carlos Gracie Jr. em 1986 no Rio de Janeiro."
      },
      {
        slug: "alliance",
        name: "Alliance Jiu-Jitsu",
        founders: "Romero 'Jacaré' Cavalcanti, Fábio Gurgel, Fernando Gurgel, Alexandre Paiva",
        foundedYear: 1993,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "SP",
        headquartersCity: "São Paulo",
        website: null,
        instagram: "allianceassociation",
        description: "Equipe com mais títulos mundiais por equipes da história do IBJJF, acumulando 15 títulos absolutos até 2025."
      },
      {
        slug: "checkmat",
        name: "Checkmat",
        founders: "Leonardo Vieira, Ricardo Vieira, Leandro Vieira",
        foundedYear: 2008,
        countryOrigin: "Brasil",
        headquartersCountry: "EUA",
        headquartersState: "CA",
        headquartersCity: "Signal Hill",
        website: "checkmatbjj.com",
        instagram: "checkmatbjj",
        description: "Formada após o fim da equipe Brasa em 2008; sede mundial na região de Long Beach/Signal Hill, Califórnia. Formadora de múltiplos campeões mundiais absolutos."
      },
      {
        slug: "atos",
        name: "Atos Jiu-Jitsu",
        founders: "Ramon Lemos, André Galvão",
        foundedYear: 2008,
        countryOrigin: "Brasil",
        headquartersCountry: "EUA",
        headquartersState: "CA",
        headquartersCity: "San Diego",
        website: "atosjiujitsuhq.com",
        instagram: "atosjiujitsuhq",
        description: "Fundada em 2008 em Rio Claro (SP), com sede transferida para San Diego (CA). Uma das forças dominantes no IBJJF e ADCC na última década."
      },
      {
        slug: "aoj",
        name: "Art of Jiu Jitsu (AOJ)",
        founders: "Rafael Mendes, Guilherme Mendes, PM Tenore",
        foundedYear: 2012,
        countryOrigin: "EUA",
        headquartersCountry: "EUA",
        headquartersState: "CA",
        headquartersCity: "Costa Mesa",
        website: "artofjiujitsu.com",
        instagram: "artofjiujitsu",
        description: "Fundada pelos irmãos Mendes em Costa Mesa, CA; independente da Atos desde 2020. Vice-campeã por equipes no Mundial IBJJF 2025."
      },
      {
        slug: "gfteam",
        name: "GFTeam (Grappling Fight Team)",
        founders: "Julio Cesar Pereira",
        foundedYear: 2007,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: "gfteam.com.br",
        instagram: "gfteamoficial",
        description: "Nasceu após extinção do projeto Gama Filho Jiu-Jitsu. Sediada no Méier, Rio de Janeiro. Formou campeões como Rodolfo Vieira e Leandro Lo."
      },
      {
        slug: "nova-uniao",
        name: "Nova União",
        founders: "André Pederneiras, Wendell Alexander",
        foundedYear: 1988,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: null,
        instagram: "novauniao_bjj",
        description: "Uma das equipes históricas mais tradicionais do Jiu-Jitsu, com forte presença no MMA e no circuito esportivo internacional."
      },
      {
        slug: "carlson-gracie-team",
        name: "Carlson Gracie Team",
        founders: "Carlson Gracie",
        foundedYear: 1965,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: null,
        instagram: null,
        description: "Fundada por Carlson Gracie, filho de Carlos Gracie Sr. Uma das linhagens mais influentes do Jiu-Jitsu. Expandiu para Chicago, EUA."
      },
      {
        slug: "btt",
        name: "Brazilian Top Team (BTT)",
        founders: "Murilo Bustamante, Mário 'Zé Mario' Sperry, Ricardo 'Bebeo' Duarte",
        foundedYear: 1996,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: null,
        instagram: null,
        description: "Pioneira na transição entre Jiu-Jitsu esportivo e MMA (PRIDE/UFC). Formou gerações de lutadores campeões mundiais."
      },
      {
        slug: "de-la-riva",
        name: "De La Riva Jiu-Jitsu",
        founders: "Ricardo De La Riva",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: "delariva.com.br",
        instagram: "delariva_bjj",
        description: "Fundada pelo criador da guarda De La Riva, uma das posições mais influentes e estudadas do Jiu-Jitsu moderno."
      },
      {
        slug: "soul-fighters",
        name: "Soul Fighters",
        founders: "Augusto 'Tanquinho' Mendes, Bruno Mendes",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: null,
        instagram: "soulfighters_bjj",
        description: "Equipe carioca com forte presença no circuito internacional de competição IBJJF e AJP."
      },
      {
        slug: "ribeiro-jiu-jitsu",
        name: "Ribeiro Jiu-Jitsu / Six Blades",
        founders: "Saulo Ribeiro, Xande Ribeiro",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "EUA",
        headquartersState: "CA",
        headquartersCity: "San Diego",
        website: null,
        instagram: null,
        description: "Liderada pelos irmãos Ribeiro, multicampeões mundiais. Xande Ribeiro também lidera a marca Six Blades em Austin, TX."
      },
      {
        slug: "fight-sports",
        name: "Fight Sports",
        founders: "Roberto 'Cyborg' Abreu",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "EUA",
        headquartersState: "FL",
        headquartersCity: "Miami",
        website: "fightsportsmiami.com",
        instagram: "fightsports_bjj",
        description: "Uma das principais equipes de Jiu-Jitsu no-gi do circuito profissional. Sediada em Miami, FL."
      },
      {
        slug: "cicero-costha",
        name: "Cicero Costha (Alavanca)",
        founders: "Cícero Costha",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "SP",
        headquartersCity: "São Paulo",
        website: null,
        instagram: null,
        description: "Projeto social e competitivo paulista, referência na formação de guardeiros e atletas de base no Jiu-Jitsu brasileiro."
      },
      {
        slug: "zenith",
        name: "Zenith BJJ",
        founders: "Rodrigo Cavaca, Robert Drysdale",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "EUA",
        headquartersState: "NV",
        headquartersCity: "Las Vegas",
        website: "zenithbjj.com",
        instagram: "zenithbjj",
        description: "Organização global com unidades no Brasil e nos Estados Unidos, fundada por Rodrigo Cavaca e Robert Drysdale."
      }
    ];

    const teamIdMap: Record<string, string> = {};

    for (const data of globalTeamsData) {
      const result = await prisma.globalTeam.upsert({
        where: { slug: data.slug },
        update: {
          name: data.name,
          founders: data.founders,
          foundedYear: data.foundedYear ?? null,
          countryOrigin: data.countryOrigin,
          headquartersCountry: data.headquartersCountry,
          headquartersState: data.headquartersState,
          headquartersCity: data.headquartersCity,
          website: data.website ?? null,
          instagram: data.instagram ?? null,
          description: data.description,
          verified: true,
          verifiedOfficial: true,
          headquartersInstructor: null,
        },
        create: {
          slug: data.slug,
          name: data.name,
          founders: data.founders,
          foundedYear: data.foundedYear ?? null,
          countryOrigin: data.countryOrigin,
          headquartersCountry: data.headquartersCountry,
          headquartersState: data.headquartersState,
          headquartersCity: data.headquartersCity,
          website: data.website ?? null,
          instagram: data.instagram ?? null,
          description: data.description,
          verified: true,
          verifiedOfficial: true,
          headquartersInstructor: null,
          totalMembers: 0,
          totalPoints: 0,
        },
      });
      teamIdMap[data.slug] = result.id;
      console.log(`  ✓ GlobalTeam: ${data.name}`);
    }

    // ── NÍVEL 2: AcademyBranch (HQ por equipe) ───────────
    for (const data of globalTeamsData) {
      const globalTeamId = teamIdMap[data.slug];
      const branchSlug = `${data.slug}-hq`;
      const branchName = `${data.name} — Matriz`;
      const isAtos = data.slug === "atos";
      const headProfessor = isAtos ? null : (data.founders?.split(",")[0].trim() ?? null);

      await prisma.academyBranch.upsert({
        where: { slug: branchSlug },
        update: {
          name: branchName,
          globalTeamId,
          country: data.headquartersCountry,
          state: data.headquartersState,
          city: data.headquartersCity,
          headProfessor,
          verified: true,
        },
        create: {
          slug: branchSlug,
          name: branchName,
          globalTeamId,
          country: data.headquartersCountry,
          state: data.headquartersState,
          city: data.headquartersCity,
          address: null,
          headProfessor,
          membersCount: 0,
          points: 0,
          verified: true,
          verifiedExternally: false,
        },
      });
      console.log(`  ✓ Branch HQ: ${branchName}`);
    }

    // ── NÍVEL 3: IndependentAcademy ───────────────────────
    const independentData = [
      {
        name: "Marcelo Garcia Jiu-Jitsu Academy",
        country: "EUA",
        state: "NY",
        city: "New York",
        headProfessor: "Marcelo Garcia"
      },
      {
        name: "Unity Jiu-Jitsu",
        country: "EUA",
        state: "NY",
        city: "New York",
        headProfessor: "Murilo Santana"
      },
      {
        name: "Caio Terra Academy",
        country: "EUA",
        state: "CA",
        city: "San Jose",
        headProfessor: "Caio Terra"
      },
      {
        name: "Cobrinha BJJ",
        country: "EUA",
        state: "CA",
        city: "Huntington Beach",
        headProfessor: "Rubens 'Cobrinha' Charles"
      },
      {
        name: "Renzo Gracie Academy - Brooklyn",
        country: "EUA",
        state: "NY",
        city: "Brooklyn",
        headProfessor: "Renzo Gracie"
      },
      {
        name: "Studio 540",
        country: "EUA",
        state: "CA",
        city: "Solana Beach",
        headProfessor: "Robert Drysdale"
      },
      {
        name: "University of Jiu-Jitsu",
        country: "EUA",
        state: "CA",
        city: "San Diego",
        headProfessor: "Saulo Ribeiro"
      },
      {
        name: "Fight Sports - Miami",
        country: "EUA",
        state: "FL",
        city: "Miami",
        headProfessor: "Roberto Abreu"
      },
      {
        name: "Dream Art",
        country: "Brasil",
        state: "SP",
        city: "São Paulo",
        headProfessor: "Isaque Bahiense"
      },
      {
        name: "Lotus Club BJJ",
        country: "Brasil",
        state: "SP",
        city: "São Paulo",
        headProfessor: "Moises Muradi"
      }
    ];

    for (const ind of independentData) {
      const existing = await prisma.independentAcademy.findFirst({
        where: { name: ind.name },
      });
      if (existing) {
        await prisma.independentAcademy.update({
          where: { id: existing.id },
          data: {
            country: ind.country,
            state: ind.state,
            city: ind.city,
            address: null,
            headProfessor: ind.headProfessor,
            verified: true,
          },
        });
      } else {
        await prisma.independentAcademy.create({
          data: {
            name: ind.name,
            country: ind.country,
            state: ind.state,
            city: ind.city,
            address: null,
            headProfessor: ind.headProfessor,
            membersCount: 0,
            points: 0,
            verified: true,
            verifiedExternally: false,
          },
        });
      }
      console.log(`  ✓ Independente: ${ind.name}`);
    }

    console.log("\n✅ Seed executado com sucesso!");

  } catch (error: any) {
    console.error("❌ ERRO:", error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMasterSeed();
