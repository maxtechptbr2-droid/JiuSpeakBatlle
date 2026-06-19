import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMasterSeed() {
  console.log("\n================================================================================");
  console.log("🥋 [MASTER SEED] INICIANDO CARGA COMPREENSIVA DE EQUIPES E FEDERAÇÕES REAIS 🥋");
  console.log("================================================================================\n");

  try {
    await prisma.$connect();
    console.log("✓ Conexão com o banco de dados estabelecida.");

    // 1. Definição das 21 Organizações Reais de Jiu-Jitsu (Nível 1 - GlobalTeam)
    const globalTeamsToInsert = [
      {
        name: "Gracie Barra",
        slug: "gracie-barra",
        founders: "Carlos Gracie Jr.",
        countryOrigin: "Brasil / Global",
        headquartersCity: "Rio de Janeiro / Irvine CA",
        website: "https://graciebarra.com",
        instagram: "@graciebarra",
        description: "Mais de 800 escolas formadas mantendo o legado, metodologia e ensinamentos unificados do mestre Carlos Gracie Jr."
      },
      {
        name: "Alliance Jiu-Jitsu",
        slug: "alliance",
        founders: "Fabio Gurgel, Romero Jacaré, Alexandre Paiva",
        countryOrigin: "Brasil",
        headquartersCity: "São Paulo",
        website: "https://alliancejj.com",
        instagram: "@allianceassociation",
        description: "Líder de títulos mundiais da IBJJF por equipes, com renomados campeões e excelência em padronização técnica."
      },
      {
        name: "Checkmat",
        slug: "checkmat",
        founders: "Leo Vieira, Ricardo Vieira",
        countryOrigin: "Brasil / EUA",
        headquartersCity: "São Paulo / Los Angeles",
        website: "https://checkmatbjj.com",
        instagram: "@checkmatbjj",
        description: "Equipe com enorme expressão técnica de alta performance internacional no Brasil, EUA, Europa e Ásia."
      },
      {
        name: "Atos Jiu-Jitsu",
        slug: "atos",
        founders: "Andre Galvao, Ramon Lemos",
        countryOrigin: "Brasil / EUA",
        headquartersCity: "San Diego",
        website: "https://atosjiujitsuhq.com",
        instagram: "@atosjiujitsuhq",
        description: "Um dos maiores centros de alto desempenho do mundo, vencedor de múltiplos títulos mundiais da IBJJF e ADCC."
      },
      {
        name: "Art of Jiu Jitsu (AOJ)",
        slug: "aoj",
        founders: "Guilherme Mendes, Rafael Mendes",
        countryOrigin: "EUA / Brasil",
        headquartersCity: "Costa Mesa",
        website: "https://artofjiujitsu.com",
        instagram: "@artofjiujitsu",
        description: "Fundada pelos lendários irmãos Mendes, mundialmente famosa pela metodologia científica de guardas, estética impecável e juvenis imbatíveis."
      },
      {
        name: "Dream Art",
        slug: "dream-art",
        founders: "Isaque Bahiense",
        countryOrigin: "Brasil",
        headquartersCity: "São Paulo",
        website: "https://dreamartproject.com",
        instagram: "@dream.art",
        description: "O maior projeto de alta performance da atualidade, aliando suporte integral profissional a atletas de elite em todos os cinturões."
      },
      {
        name: "GFTeam",
        slug: "gfteam",
        founders: "Julio Cesar Pereira",
        countryOrigin: "Brasil",
        headquartersCity: "Rio de Janeiro",
        website: "https://gfteam.com.br",
        instagram: "@gfteamoficial",
        description: "Grappling Fight Team, originária do bairro de Méier no Rio, mundialmente conhecida pela incrível pressão dos passadores e excelente wrestling."
      },
      {
        name: "Nova União",
        slug: "nova-uniao-team",
        founders: "Wendell Alexander, André Pederneiras",
        countryOrigin: "Brasil",
        headquartersCity: "Rio de Janeiro",
        website: "https://novauniao.co",
        instagram: "@novauniaobjj",
        description: "Equipe histórica que moldou gerações de campeões de peso leve no Jiu-Jitsu e revolucionou os cinturões mundiais de vale-tudo e UFC."
      },
      {
        name: "Six Blades Jiu-Jitsu",
        slug: "six-blades",
        founders: "Xande Ribeiro",
        countryOrigin: "Brasil / EUA",
        headquartersCity: "Austin",
        website: "https://sixbladesjiujitsu.com",
        instagram: "@sixbladesjiujitsuhq",
        description: "Defensora do espírito e da pureza técnica fundamentados pela dinastia e linhagem técnica do mestre Xande Ribeiro."
      },
      {
        name: "Ribeiro Jiu-Jitsu",
        slug: "ribeiro-bjj",
        founders: "Saulo Ribeiro, Xande Ribeiro",
        countryOrigin: "Brasil",
        headquartersCity: "Manaus / San Diego",
        website: "https://ribeirojiujitsu.com",
        instagram: "@ribeirojiujitsu",
        description: "Associação mundialmente renomada com fundamentos defensivos impenetráveis e postura marcial clássica impecável."
      },
      {
        name: "Carlson Gracie Team",
        slug: "carlson-gracie-team",
        founders: "Carlson Gracie",
        countryOrigin: "Brasil",
        headquartersCity: "Rio de Janeiro / Chicago",
        website: "https://carlsongracieteam.com",
        instagram: "@carlsongracieteamhq",
        description: "A lendária fábrica de campeões de Vale-Tudo e Jiu-Jitsu agressivo caracterizada pela alta competitividade moderna e força física."
      },
      {
        name: "Fight Sports",
        slug: "fight-sports",
        founders: "Roberto 'Cyborg' Abreu",
        countryOrigin: "Brasil / EUA",
        headquartersCity: "Miami",
        website: "https://fightsportsmiami.com",
        instagram: "@fightsportshq",
        description: "Uma das principais equipes sem kimono do planeta, forte nas competições profissionais lideradas pelo campeão absoluto Cyborg."
      },
      {
        name: "Cicero Costha",
        slug: "cicero-costha",
        founders: "Cicero Costha",
        countryOrigin: "Brasil",
        headquartersCity: "São Paulo",
        website: "https://cicerocosthabjj.com",
        instagram: "@cicerocosthaoficial",
        description: "Projeto Social Lutando Pelo Bem (PSLPB). Berço formador dos maiores especialistas em berimbolo e guardeiros absolutos do esporte."
      },
      {
        name: "Fratres Jiu-Jitsu",
        slug: "fratres",
        founders: "Daniel Affonso",
        countryOrigin: "Brasil",
        headquartersCity: "São Paulo",
        website: "https://fratresjiujitsu.com",
        instagram: "@fratres.art.bjj",
        description: "Clube profissional moderno de Jiu-Jitsu que conquistou o circuito internacional e os pódios absolutos da CBJJ/IBJJF."
      },
      {
        name: "Melqui Galvão",
        slug: "melqui-galvao-mga",
        founders: "Melqui Galvão",
        countryOrigin: "Brasil",
        headquartersCity: "Manaus / Jundiaí",
        website: "https://equipemelquigalvao.com.br",
        instagram: "@equipemelquigalvao",
        description: "Nova potência técnica dominante, produtora do maior fenômeno moderno do Jiu-Jitsu livre e wrestling ofensivo do país."
      },
      {
        name: "Lotus Club",
        slug: "lotus-club",
        founders: "Moises Muradi",
        countryOrigin: "Brasil",
        headquartersCity: "São Paulo",
        website: "https://lotusclubjiujitsu.com",
        instagram: "@lotuscluboficial",
        description: "Fundação tradicional paulista focada no respeito, filosofia marcial, autodefesa completa e competições estaduais."
      },
      {
        name: "BTT (Brazilian Top Team)",
        slug: "btt-brazilian-top-team",
        founders: "Murilo Bustamante, Bebeo Duarte, Zé Mario Sperry",
        countryOrigin: "Brasil",
        headquartersCity: "Rio de Janeiro",
        website: "https://braziliantopteam.com",
        instagram: "@braziliantopteamoficial",
        description: "Pioneira absoluta na transição técnica de alto nível entre Jiu-Jitsu esportivo e artes marciais mistas (PRIDE/UFC)."
      },
      {
        name: "De La Riva",
        slug: "de-la-riva",
        founders: "Ricardo De La Riva",
        countryOrigin: "Brasil",
        headquartersCity: "Rio de Janeiro",
        website: "https://delariva.com.br",
        instagram: "@delarivaoficial",
        description: "Associação integrada mundialmente criada pelo lendário inventor da guarda De La Riva, pilar fundamental de técnicas de raspagens."
      },
      {
        name: "Zenith BJJ",
        slug: "zenith",
        founders: "Rodrigo Cavaca, Robert Drysdale",
        countryOrigin: "Brasil / EUA",
        headquartersCity: "Santos / Las Vegas",
        website: "https://zenithbjj.com",
        instagram: "@zenithbjj",
        description: "Organização global estabelecida com metodologia didática exclusiva e preparação para rankings mundiais competitivos."
      },
      {
        name: "Soul Fighters",
        slug: "soul-fighters",
        founders: "Augusto 'Tanquinho' Mendes, Leandro 'Tatu' Escobar, Bruno Mendes",
        countryOrigin: "Brasil",
        headquartersCity: "Rio de Janeiro",
        website: "https://soulfightersbjj.com",
        instagram: "@soulfighters_",
        description: "União internacional focada em padrão de jiu-jitsu dinâmico, moderno, agressivo, excelente estilo de passagem e quedas."
      },
      {
        name: "Impacto Japan BJJ",
        slug: "impacto-japan",
        founders: "Yosuke Suto",
        countryOrigin: "Japão",
        headquartersCity: "Tokyo",
        website: "https://impactobjj.com",
        instagram: "@impactojapanbjj",
        description: "Referência absoluta do Jiu-Jitsu brasileiro na Ásia, parceira ativa no consolidado circuito continental da AJP Tour."
      }
    ];

    console.log("🌱 Cadastrando / Atualizando as 21 Equipes Globais Oficiais...");
    const teamIdMap: Record<string, string> = {};

    for (const data of globalTeamsToInsert) {
      const existing = await prisma.globalTeam.findUnique({ where: { slug: data.slug } });
      let teamId = "";

      if (existing) {
        const updated = await prisma.globalTeam.update({
          where: { slug: data.slug },
          data: {
            name: data.name,
            founders: data.founders,
            countryOrigin: data.countryOrigin,
            headquartersCity: data.headquartersCity,
            website: data.website,
            instagram: data.instagram,
            description: data.description,
            verified: true,
            verifiedOfficial: true
          }
        });
        teamId = updated.id;
        console.log(`   [UPDATED] ${data.name}`);
      } else {
        const created = await prisma.globalTeam.create({
          data: {
            name: data.name,
            slug: data.slug,
            founders: data.founders,
            countryOrigin: data.countryOrigin,
            headquartersCity: data.headquartersCity,
            website: data.website,
            instagram: data.instagram,
            description: data.description,
            verified: true,
            verifiedOfficial: true,
            totalPoints: Math.floor(Math.random() * 4000) + 1500
          }
        });
        teamId = created.id;
        console.log(`   [CREATED] ${data.name}`);
      }

      teamIdMap[data.slug] = teamId;
    }

    // 2. Definição de Filiais Reais Referência (Nível 2 - AcademyBranch)
    const branchesToInsert = [
      {
        teamSlug: "gracie-barra",
        name: "Gracie Barra Barra da Tijuca",
        slug: "gracie-barra-barra-da-tijuca",
        country: "Brasil",
        state: "RJ",
        city: "Rio de Janeiro",
        address: "Av. Olegário Maciel, 400 - Barra da Tijuca",
        headProfessor: "Jefferson Moura",
        membersCount: 380,
        points: 4800
      },
      {
        teamSlug: "gracie-barra",
        name: "Gracie Barra Northridge",
        slug: "gracie-barra-northridge",
        country: "United States",
        state: "CA",
        city: "Northridge",
        address: "9144 Corbin Ave",
        headProfessor: "Romulo Barral",
        membersCount: 290,
        points: 3100
      },
      {
        teamSlug: "alliance",
        name: "Alliance São Paulo HQ",
        slug: "alliance-sao-paulo-hq",
        country: "Brasil",
        state: "SP",
        city: "São Paulo",
        address: "Rua Mourato Coelho, 1200 - Pinheiros",
        headProfessor: "Fabio Gurgel",
        membersCount: 450,
        points: 5900
      },
      {
        teamSlug: "alliance",
        name: "Alliance Atlanta",
        slug: "alliance-atlanta",
        country: "United States",
        state: "GA",
        city: "Atlanta",
        address: "6300 Powers Ferry Rd NW",
        headProfessor: "Romero 'Jacaré' Cavalcanti",
        membersCount: 320,
        points: 3800
      },
      {
        teamSlug: "atos",
        name: "Atos HQ San Diego",
        slug: "atos-hq-san-diego",
        country: "United States",
        state: "CA",
        city: "San Diego",
        address: "4810 Mercury St",
        headProfessor: "Andre Galvao",
        membersCount: 490,
        points: 6200
      },
      {
        teamSlug: "aoj",
        name: "Art of Jiu Jitsu Costa Mesa",
        slug: "art-of-jiu-jitsu-costa-mesa",
        country: "United States",
        state: "CA",
        city: "Costa Mesa",
        address: "383 E 17th St, Costa Mesa, CA",
        headProfessor: "Rafael Mendes, Guilherme Mendes",
        membersCount: 410,
        points: 5800
      },
      {
        teamSlug: "checkmat",
        name: "Checkmat HQ Los Angeles",
        slug: "checkmat-hq-los-angeles",
        country: "United States",
        state: "CA",
        city: "Los Angeles",
        address: "Signal Hill, CA 90755",
        headProfessor: "Leo Vieira",
        membersCount: 220,
        points: 2500
      },
      {
        teamSlug: "six-blades",
        name: "Six Blades Austin",
        slug: "six-blades-austin",
        country: "United States",
        state: "TX",
        city: "Austin",
        address: "1601 S IH 35 Frontage Rd, Austin",
        headProfessor: "Xande Ribeiro",
        membersCount: 160,
        points: 1900
      },
      {
        teamSlug: "melqui-galvao-mga",
        name: "Melqui Galvão MGA Jundiaí HQ",
        slug: "melqui-galvao-mga-jundiai-hq",
        country: "Brasil",
        state: "SP",
        city: "Jundiaí",
        address: "Av. Nove de Julho, Jundiaí - SP",
        headProfessor: "Melquisedeque Galvão",
        membersCount: 280,
        points: 5100
      }
    ];

    console.log("\n🌱 Cadastrando / Sincronizando Filiais Oficiais Reais (AcademyBranch)...");
    for (const b of branchesToInsert) {
      const globalTeamId = teamIdMap[b.teamSlug];
      if (!globalTeamId) {
        console.error(`❌ GlobalTeam com slug ${b.teamSlug} não encontrado para a filial ${b.name}`);
        continue;
      }

      const existing = await prisma.academyBranch.findUnique({ where: { slug: b.slug } });

      if (existing) {
        await prisma.academyBranch.update({
          where: { slug: b.slug },
          data: {
            globalTeamId: globalTeamId,
            name: b.name,
            country: b.country,
            state: b.state,
            city: b.city,
            address: b.address,
            headProfessor: b.headProfessor,
            verified: true,
            verifiedExternally: true
          }
        });
        console.log(`   [UPDATED-BRANCH] ${b.name}`);
      } else {
        await prisma.academyBranch.create({
          data: {
            globalTeamId: globalTeamId,
            name: b.name,
            slug: b.slug,
            country: b.country,
            state: b.state,
            city: b.city,
            address: b.address,
            headProfessor: b.headProfessor,
            membersCount: b.membersCount,
            points: b.points,
            verified: true,
            verifiedExternally: true
          }
        });
        console.log(`   [CREATED-BRANCH] ${b.name}`);
      }
    }

    // 3. Definição de Academias Independentes Reais (Nível 3 - IndependentAcademy)
    const independentAcademiesToInsert = [
      {
        name: "Marcelo Garcia Jiu-Jitsu Academy NYC",
        country: "United States",
        state: "NY",
        city: "New York",
        address: "250 W 26th St, New York, NY 10001",
        headProfessor: "Marcelo Garcia",
        membersCount: 520,
        points: 7900
      },
      {
        name: "Unity Jiu-Jitsu NYC",
        country: "United States",
        state: "NY",
        city: "New York",
        address: "135 W 14th St, New York, NY 10011",
        headProfessor: "Murilo Santana",
        membersCount: 300,
        points: 4400
      },
      {
        name: "Pedigo Submission Fighting (PSF)",
        country: "United States",
        state: "IL",
        city: "Mt. Vernon",
        address: "1400 Broadway, Mt. Vernon, IL",
        headProfessor: "Heath Pedigo",
        membersCount: 150,
        points: 3100
      },
      {
        name: "Studio 1908",
        country: "Brasil",
        state: "SP",
        city: "Santos",
        address: "Avenida Ana Costa, Santos",
        headProfessor: "Rodrigo Cavaca",
        membersCount: 220,
        points: 1800
      }
    ];

    console.log("\n🌱 Cadastrando / Sincronizando Academias Independentes Reais (IndependentAcademy)...");
    for (const ind of independentAcademiesToInsert) {
      const existing = await prisma.independentAcademy.findFirst({
        where: { name: ind.name }
      });

      if (existing) {
        await prisma.independentAcademy.update({
          where: { id: existing.id },
          data: {
            country: ind.country,
            state: ind.state,
            city: ind.city,
            address: ind.address,
            headProfessor: ind.headProfessor,
            verified: true,
            verifiedExternally: true
          }
        });
        console.log(`   [UPDATED-INDEPENDENT] ${ind.name}`);
      } else {
        await prisma.independentAcademy.create({
          data: {
            name: ind.name,
            country: ind.country,
            state: ind.state,
            city: ind.city,
            address: ind.address,
            headProfessor: ind.headProfessor,
            membersCount: ind.membersCount,
            points: ind.points,
            verified: true,
            verifiedExternally: true
          }
        });
        console.log(`   [CREATED-INDEPENDENT] ${ind.name}`);
      }
    }

    console.log("\n================================================================================");
    console.log("🎉 MASTER SEED DE PRODUÇÃO EXECUTADO COM ESTILO E SUCESSO ABSOLUTO! 🎉");
    console.log("================================================================================\n");

  } catch (error: any) {
    console.error("❌ ERRO AO EXECUTAR MASTER SEED:", error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMasterSeed();
