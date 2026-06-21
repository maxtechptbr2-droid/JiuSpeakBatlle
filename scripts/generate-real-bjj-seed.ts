import { PrismaClient } from '@prisma/client';

if (process.env.NODE_ENV === "production" && process.env.ALLOW_DATABASE_SEED !== "true") {
  console.log("🚫 Seed de academias bloqueado em produção. Defina ALLOW_DATABASE_SEED=true para permitir execução manual.");
  process.exit(0);
}

const prisma = new PrismaClient();

async function runMasterSeed() {
  console.log("\n================================================================================");
  console.log("🥋 [MASTER SEED] INICIANDO CARGA COMPREENSIVA DE EQUIPES E FEDERAÇÕES REAIS 🥋");
  console.log("================================================================================\n");

  try {
    await prisma.$connect();
    console.log("✓ Conexão com o banco de dados estabelecida.");

    const globalTeamsToInsert = [
      {
        name: "Gracie Barra",
        slug: "gracie-barra",
        founders: "Carlos Gracie Jr.",
        foundedYear: 1986,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: "graciebarra.com",
        description: "Maior rede de escolas de Jiu-Jitsu do mundo, com mais de 800 unidades em dezenas de países."
      },
      {
        name: "Alliance Jiu-Jitsu",
        slug: "alliance",
        founders: "Romero 'Jacaré' Cavalcanti, Fábio Gurgel, Fernando Gurgel, Alexandre Paiva",
        foundedYear: 1993,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "SP",
        headquartersCity: "São Paulo",
        website: null,
        description: "Equipe com mais títulos mundiais por equipes da história do IBJJF (15 títulos até 2025)."
      },
      {
        name: "Checkmat",
        slug: "checkmat",
        founders: "Leonardo Vieira, Ricardo Vieira, Leandro Vieira",
        foundedYear: 2008,
        countryOrigin: "Brasil / EUA",
        headquartersCountry: "EUA",
        headquartersState: "CA",
        headquartersCity: "Signal Hill",
        website: null,
        description: "Formada após o encerramento da equipe Brasa; sede mundial na região de Long Beach/Signal Hill, Califórnia."
      },
      {
        name: "Atos Jiu-Jitsu",
        slug: "atos",
        founders: "Ramon Lemos, André Galvão",
        foundedYear: 2008,
        countryOrigin: "Brasil / EUA",
        headquartersCountry: "EUA",
        headquartersState: "CA",
        headquartersCity: "San Diego",
        website: "atosjiujitsuhq.com",
        description: "Fundada em 2008 em Rio Claro (SP), mudou sede para San Diego (CA). (NÃO atribua liderança atual a nenhuma pessoa específica devido a situação sensível em curso desde fevereiro/2026.)"
      },
      {
        name: "Art of Jiu Jitsu (AOJ)",
        slug: "aoj",
        founders: "Rafael Mendes, Guilherme Mendes, PM Tenore",
        foundedYear: 2012,
        countryOrigin: "EUA",
        headquartersCountry: "EUA",
        headquartersState: "CA",
        headquartersCity: "Costa Mesa",
        website: "artofjiujitsu.com",
        description: "Fundada pelos irmãos Mendes; independente da Atos desde 2020. Vice-campeã por equipes no Mundial IBJJF 2025."
      },
      {
        name: "GFTeam (Grappling Fight Team)",
        slug: "gfteam",
        founders: "Julio Cesar Pereira",
        foundedYear: 2007,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro (Méier)",
        website: null,
        description: "Nasceu da extinção do projeto Gama Filho Jiu-Jitsu; formou campeões como Rodolfo Vieira."
      },
      {
        name: "Nova União",
        slug: "nova-uniao",
        founders: "André Pederneiras, Wendell Alexander",
        foundedYear: 1988,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: null,
        description: "Uma das equipes históricas mais tradicionais do Jiu-Jitsu, com forte presença também no MMA."
      },
      {
        name: "Carlson Gracie Team",
        slug: "carlson-gracie-team",
        founders: "Carlson Gracie",
        foundedYear: 1965,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro (Copacabana)",
        website: null,
        description: "Fundada por Carlson Gracie, filho de Carlos Gracie Sr.; expandiu posteriormente para Chicago, EUA."
      },
      {
        name: "Brazilian Top Team (BTT)",
        slug: "btt",
        founders: "Murilo Bustamante, Mário 'Zé Mario' Sperry, Ricardo 'Bebeo' Duarte",
        foundedYear: 1996,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: null,
        description: "Pioneira na transição entre Jiu-Jitsu esportivo e MMA (PRIDE/UFC)."
      },
      {
        name: "De La Riva Jiu-Jitsu",
        slug: "de-la-riva",
        founders: "Ricardo De La Riva",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: null,
        description: "Fundada pelo criador da guarda De La Riva, uma das posições mais influentes do Jiu-Jitsu moderno."
      },
      {
        name: "Soul Fighters",
        slug: "soul-fighters",
        founders: "Augusto 'Tanquinho' Mendes, Bruno Mendes",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: null,
        description: "Equipe carioca com forte presença no circuito internacional de competição."
      },
      {
        name: "Ribeiro Jiu-Jitsu / Six Blades",
        slug: "ribeiro-jiu-jitsu",
        founders: "Saulo Ribeiro, Xande Ribeiro",
        foundedYear: null,
        countryOrigin: "Brasil / EUA",
        headquartersCountry: "EUA",
        headquartersState: "CA",
        headquartersCity: "San Diego",
        website: null,
        description: "Associação liderada pelos irmãos Ribeiro, multicampeões mundiais; Xande Ribeiro também lidera a marca Six Blades em Austin, TX."
      },
      {
        name: "Fight Sports",
        slug: "fight-sports",
        founders: "Roberto 'Cyborg' Abreu",
        foundedYear: null,
        countryOrigin: "Brasil / EUA",
        headquartersCountry: "EUA",
        headquartersState: "FL",
        headquartersCity: "Miami",
        website: null,
        description: "Uma das principais equipes de Jiu-Jitsu sem kimono (no-gi) do circuito profissional."
      },
      {
        name: "Cicero Costha (Alavanca)",
        slug: "cicero-costha",
        founders: "Cícero Costha",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "SP",
        headquartersCity: "São Paulo",
        website: null,
        description: "Projeto social e competitivo paulista, referência na formação de guardeiros."
      },
      {
        name: "Zenith BJJ",
        slug: "zenith",
        founders: "Rodrigo Cavaca, Robert Drysdale",
        foundedYear: null,
        countryOrigin: "Brasil / EUA",
        headquartersCountry: "EUA",
        headquartersState: "NV",
        headquartersCity: "Las Vegas",
        website: null,
        description: "Organização global com unidades no Brasil e nos Estados Unidos."
      },
      {
        name: "Gracie Humaitá",
        slug: "gracie-humaita",
        founders: "Royler Gracie, Rolker Gracie",
        foundedYear: 1985,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: null,
        description: "Ramo da academia original da família Gracie, sediada no bairro do Humaitá desde 1985; hoje com afiliadas em diversos países."
      },
      {
        name: "Gracie Academy (Gracie University)",
        slug: "gracie-academy",
        founders: "Rener Gracie, Ryron Gracie",
        foundedYear: null,
        countryOrigin: "EUA",
        headquartersCountry: "EUA",
        headquartersState: "CA",
        headquartersCity: "Torrance",
        website: null,
        description: "Maior plataforma de ensino online de Jiu-Jitsu do mundo, com foco em autodefesa."
      },
      {
        name: "Renzo Gracie Academy",
        slug: "renzo-gracie",
        founders: "Renzo Gracie",
        foundedYear: null,
        countryOrigin: "EUA",
        headquartersCountry: "EUA",
        headquartersState: "NY",
        headquartersCity: "New York",
        website: null,
        description: "Academia de referência em Nova York, formou diversos campeões de MMA e Jiu-Jitsu."
      },
      {
        name: "Yamasaki Jiu-Jitsu",
        slug: "yamasaki",
        founders: "Julio Cesar Yamasaki",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "AM",
        headquartersCity: "Manaus",
        website: null,
        description: "Equipe tradicional do norte do Brasil. (Confiança moderada nos detalhes — recomenda-se validação manual antes de publicar.)"
      },
      {
        name: "Brasa Clube de Jiu-Jitsu",
        slug: "brasa",
        founders: "Leonardo Vieira, Ricardo Vieira, Leandro Vieira e ex-integrantes da Alliance",
        foundedYear: 2004,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "RJ",
        headquartersCity: "Rio de Janeiro",
        website: null,
        description: "Equipe histórica de transição (cisão da Alliance) que originou o Checkmat e influenciou a fundação da Atos."
      },
      {
        name: "B-Team Jiu-Jitsu",
        slug: "b-team",
        founders: "Craig Jones",
        foundedYear: null,
        countryOrigin: "Austrália / EUA",
        headquartersCountry: "EUA",
        headquartersState: "TX",
        headquartersCity: "Austin",
        website: null,
        description: "Equipe moderna focada em no-gi e competições ADCC."
      },
      {
        name: "10th Planet Jiu-Jitsu",
        slug: "10th-planet",
        founders: "Eddie Bravo",
        foundedYear: 2003,
        countryOrigin: "EUA",
        headquartersCountry: "EUA",
        headquartersState: "CA",
        headquartersCity: "Los Angeles",
        website: null,
        description: "Maior organização de Jiu-Jitsu sem kimono (no-gi) do mundo, com sistema próprio de faixas."
      },
      {
        name: "Lotus Club",
        slug: "lotus-club",
        founders: "Moisés Muradi",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "SP",
        headquartersCity: "São Paulo",
        website: null,
        description: "Fundação tradicional paulista com foco em autodefesa e competições estaduais."
      },
      {
        name: "Fratres Jiu-Jitsu",
        slug: "fratres",
        founders: "Daniel Affonso",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "SP",
        headquartersCity: "São Paulo",
        website: null,
        description: "Clube competitivo paulista com presença no circuito internacional."
      },
      {
        name: "Melqui Galvão (MGA)",
        slug: "melqui-galvao",
        founders: "Melquisedeque Galvão",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "SP",
        headquartersCity: "Jundiaí",
        website: null,
        description: "Equipe em ascensão, forte em wrestling ofensivo e Jiu-Jitsu livre."
      },
      {
        name: "Dream Art",
        slug: "dream-art",
        founders: "Isaque Bahiense",
        foundedYear: null,
        countryOrigin: "Brasil",
        headquartersCountry: "Brasil",
        headquartersState: "SP",
        headquartersCity: "São Paulo",
        website: null,
        description: "Projeto de alta performance com suporte a atletas de elite em todos os cinturões."
      }
    ];

    console.log(`🌱 Cadastrando / Atualizando as ${globalTeamsToInsert.length} Equipes Globais Oficiais...`);
    const teamIdMap: Record<string, string> = {};

    for (const data of globalTeamsToInsert) {
      const existing = await prisma.globalTeam.findUnique({ where: { slug: data.slug } });
      let teamId = "";

      const payload = {
        name: data.name,
        founders: data.founders,
        foundedYear: data.foundedYear,
        countryOrigin: data.countryOrigin,
        headquartersCountry: data.headquartersCountry,
        headquartersState: data.headquartersState,
        headquartersCity: data.headquartersCity,
        website: data.website,
        description: data.description,
        verified: true,
        verifiedOfficial: true,
        totalMembers: 0,
        totalPoints: 0,
        headquartersInstructor: null // Mantenha null por padrão, inclusive Atos!
      };

      if (existing) {
        const updated = await prisma.globalTeam.update({
          where: { slug: data.slug },
          data: payload
        });
        teamId = updated.id;
        console.log(`   [UPDATED] ${data.name}`);
      } else {
        const created = await prisma.globalTeam.create({
          data: {
            ...payload,
            slug: data.slug
          }
        });
        teamId = created.id;
        console.log(`   [CREATED] ${data.name}`);
      }

      teamIdMap[data.slug] = teamId;
    }

    // 1.B — AcademyBranch (Nível 2 — uma filial-sede por equipe)
    console.log("\n🌱 Sincronizando Filiais Oficiais HQ...");

    for (const data of globalTeamsToInsert) {
      const globalTeamId = teamIdMap[data.slug];
      if (!globalTeamId) {
        console.error(`❌ GlobalTeam com slug ${data.slug} não encontrado para a filial-sede.`);
        continue;
      }

      const branchSlug = `${data.slug}-hq`;
      const branchName = `${data.name} — Matriz`;

      // Se a equipe for Atos, headProfessor da filial deve ser null (Passo 5)
      const isAtos = data.slug === "atos";
      const headProfessor = isAtos ? null : data.founders;

      const existingBranch = await prisma.academyBranch.findUnique({ where: { slug: branchSlug } });

      const branchPayload = {
        globalTeamId: globalTeamId,
        name: branchName,
        country: data.headquartersCountry,
        state: data.headquartersState,
        city: data.headquartersCity,
        address: null, // deixar null conforme regra 1.B
        headProfessor: headProfessor,
        membersCount: 0,
        points: 0,
        verified: true,
        verifiedExternally: false
      };

      if (existingBranch) {
        await prisma.academyBranch.update({
          where: { slug: branchSlug },
          data: branchPayload
        });
        console.log(`   [UPDATED-BRANCH-HQ] ${branchName}`);
      } else {
        await prisma.academyBranch.create({
          data: {
            ...branchPayload,
            slug: branchSlug
          }
        });
        console.log(`   [CREATED-BRANCH-HQ] ${branchName}`);
      }
    }

    // 1.C — IndependentAcademy (Nível 3 — academias independentes reais, sem rede global)
    const independentAcademiesToInsert = [
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
      }
    ];

    console.log("\n🌱 Sincronizando Academias Independentes Reais...");
    for (const ind of independentAcademiesToInsert) {
      const existing = await prisma.independentAcademy.findFirst({
        where: { name: ind.name }
      });

      const indPayload = {
        country: ind.country,
        state: ind.state,
        city: ind.city,
        address: null, // Deixe null conforme regra 1.C
        headProfessor: ind.headProfessor,
        membersCount: 0,
        points: 0,
        verified: true,
        verifiedExternally: false
      };

      if (existing) {
        await prisma.independentAcademy.update({
          where: { id: existing.id },
          data: indPayload
        });
        console.log(`   [UPDATED-INDEPENDENT] ${ind.name}`);
      } else {
        await prisma.independentAcademy.create({
          data: {
            name: ind.name,
            ...indPayload
          }
        });
        console.log(`   [CREATED-INDEPENDENT] ${ind.name}`);
      }
    }

    console.log("\n================================================================================");
    console.log("🎉 MASTER SEED DE PRODUÇÃO EXECUTADO COM ESTILO E SUCESSO ABSOLUTO! 🎉");
    console.log("================================================================0\n");

  } catch (error: any) {
    console.error("❌ ERRO AO EXECUTAR MASTER SEED:", error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMasterSeed();
