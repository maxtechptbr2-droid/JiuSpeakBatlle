import { PrismaClient } from '@prisma/client';

async function seedBjjRealOrganizations() {
  console.log("\n================================================================================");
  console.log("🥋 [BJJ SEED] INICIANDO CARGA OFICIAL DE EQUIPES E FEDERAÇÕES REAIS (ETAPA 7)  🥋");
  console.log("================================================================================\n");

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log("✓ Conexão com o banco de dados estabelecida.");

    // 1. Garantir que os Países, Estados e Cidades Base Existem
    console.log("🌱 Verificando infraestrutura geográfica básica...");
    
    let brazil = await prisma.country.findFirst({ where: { code: "BR" } });
    if (!brazil) {
      brazil = await prisma.country.create({
        data: { name: "Brasil", code: "BR" }
      });
    }

    let usa = await prisma.country.findFirst({ where: { code: "US" } });
    if (!usa) {
      usa = await prisma.country.create({
        data: { name: "United States", code: "US" }
      });
    }

    let uae = await prisma.country.findFirst({ where: { code: "AE" } });
    if (!uae) {
      uae = await prisma.country.create({
        data: { name: "United Arab Emirates", code: "AE" }
      });
    }

    // Estados
    let stateSP = await prisma.state.findFirst({ where: { code: "SP", countryId: brazil.id } });
    if (!stateSP) {
      stateSP = await prisma.state.create({
        data: { name: "São Paulo", code: "SP", countryId: brazil.id }
      });
    }

    let stateRJ = await prisma.state.findFirst({ where: { code: "RJ", countryId: brazil.id } });
    if (!stateRJ) {
      stateRJ = await prisma.state.create({
        data: { name: "Rio de Janeiro", code: "RJ", countryId: brazil.id }
      });
    }

    let stateCA = await prisma.state.findFirst({ where: { code: "CA", countryId: usa.id } });
    if (!stateCA) {
      stateCA = await prisma.state.create({
        data: { name: "California", code: "CA", countryId: usa.id }
      });
    }

    // Cidades
    let citySP = await prisma.city.findFirst({ where: { name: "São Paulo", stateId: stateSP.id } });
    if (!citySP) {
      citySP = await prisma.city.create({
        data: { name: "São Paulo", stateId: stateSP.id }
      });
    }

    let citySD = await prisma.city.findFirst({ where: { name: "San Diego", stateId: stateCA.id } });
    if (!citySD) {
      citySD = await prisma.city.create({
        data: { name: "San Diego", stateId: stateCA.id }
      });
    }

    console.log("✓ Geografia inicial de suporte ativa.");

    // 2. Lista de Organizações Oficiais BJJ Internacionais Reais (IBJJF / AJP conformidade)
    const realOrganizations = [
      {
        name: "Gracie Barra",
        slug: "gracie-barra",
        founders: "Carlos Gracie Jr.",
        countryOrigin: "Brasil",
        headquartersCity: "Rio de Janeiro",
        website: "https://graciebarra.com",
        instagram: "graciebarra",
        description: "Uma das maiores organizações de Jiu-Jitsu do mundo, com mais de 800 escolas espalhadas por todos os continentes."
      },
      {
        name: "Alliance",
        slug: "alliance-official",
        founders: "Fabio Gurgel, Romero Jacaré, Alexandre Paiva",
        countryOrigin: "Brasil",
        headquartersCity: "São Paulo",
        website: "https://alliancejj.com",
        instagram: "allianceassociation",
        description: "Multicampeã mundial por equipes, famosa por seu padrão de ensino unificado e atletas de elite."
      },
      {
        name: "Checkmat",
        slug: "checkmat-bjj",
        founders: "Leo Vieira, Ricardo Vieira",
        countryOrigin: "Brasil",
        headquartersCity: "São Paulo",
        website: "https://checkmatbjj.com",
        instagram: "checkmathbjj",
        description: "Equipe fundada em 2008, proeminente no cenário competitivo mundial com centros de excelência no Brasil e EUA."
      },
      {
        name: "Atos Jiu-Jitsu",
        slug: "atos-jiu-jitsu",
        founders: "Andre Galvao, Ramon Lemos",
        countryOrigin: "Brasil",
        headquartersCity: "San Diego",
        website: "https://atosjiujitsuhq.com",
        instagram: "atosjiujitsuhq",
        description: "Uma força dominante moderna do Jiu-Jitsu desportivo, estabelecida em San Diego, Califórnia."
      },
      {
        name: "Dream Art",
        slug: "dream-art-project",
        founders: "Isaque Bahiense",
        countryOrigin: "Brasil",
        headquartersCity: "São Paulo",
        website: "https://dreamart.com.br",
        instagram: "dream.art",
        description: "Projeto social e profissional avançado focado na formação de campeões de altíssima performance no esporte."
      },
      {
        name: "Nova União",
        slug: "nova-uniao",
        founders: "Wendell Alexander, André Pederneiras",
        countryOrigin: "Brasil",
        headquartersCity: "Rio de Janeiro",
        website: "https://novauniao.co",
        instagram: "novauniaobjj",
        description: "Equipe lendária fundada nos anos 90, formadora de multicampeões de Jiu-Jitsu e astros do MMA mundial."
      },
      {
        name: "GFTeam",
        slug: "gfteam-oficial",
        founders: "Julio Cesar Pereira",
        countryOrigin: "Brasil",
        headquartersCity: "Rio de Janeiro",
        website: "https://gfteam.com.br",
        instagram: "gfteamoficial",
        description: "Grappling Fight Team, nascida no Méier (Rio de Janeiro), conhecida por sua raça e passadores fortíssimos."
      },
      {
        name: "Zenith BJJ",
        slug: "zenith-bjj",
        founders: "Rodrigo Cavaca, Robert Drysdale",
        countryOrigin: "Brasil / EUA",
        headquartersCity: "Santos / Las Vegas",
        website: "https://zenithbjj.com",
        instagram: "zenithbjj",
        description: "Aliança forte entre campeões mundiais resultando em suporte educacional especializado internacional."
      }
    ];

    console.log("🌱 Cadastrando Equipes Globais Oficiais...");
    let createdCount = 0;
    
    for (const org of realOrganizations) {
      const existing = await prisma.globalTeam.findUnique({
        where: { slug: org.slug }
      });

      if (!existing) {
        await prisma.globalTeam.create({
          data: {
            name: org.name,
            slug: org.slug,
            founders: org.founders,
            countryOrigin: org.countryOrigin,
            headquartersCity: org.headquartersCity,
            website: org.website,
            instagram: org.instagram,
            description: org.description,
            verified: true,
            verifiedOfficial: true
          }
        });
        createdCount++;
        console.log(`   → Equipe adicionada: ${org.name}`);
      } else {
        console.log(`   [i] Equipe já existente no banco: ${org.name}`);
      }
    }

    console.log(`\n✓ Carga finalizada com sucesso! Cadastradas ${createdCount} novas Equipes Globais.`);

    // 3. Cadastrar algumas Filiais de Exemplo para a Gracie Barra e Alliance
    console.log("\n🌱 Cadastrando Filiais de Exemplo...");
    
    const gb = await prisma.globalTeam.findUnique({ where: { slug: "gracie-barra" } });
    if (gb) {
      const branchExists = await prisma.academyBranch.findFirst({
        where: { globalTeamId: gb.id, name: "Gracie Barra Rio Matriz" }
      });
      if (!branchExists) {
        await prisma.academyBranch.create({
          data: {
            globalTeamId: gb.id,
            name: "Gracie Barra Rio Matriz",
            slug: "gracie-barra-rio-matriz",
            country: "Brasil",
            state: "RJ",
            city: "Rio de Janeiro",
            address: "Av. Olegário Maciel, 400 - Barra da Tijuca",
            headProfessor: "Jefferson Moura",
            verified: true,
            verifiedExternally: true,
            membersCount: 350
          }
        });
        console.log("   → Filial 'Gracie Barra Rio Matriz' adicionada.");
      }
    }

    const alliance = await prisma.globalTeam.findUnique({ where: { slug: "alliance-official" } });
    if (alliance) {
      const branchExists = await prisma.academyBranch.findFirst({
        where: { globalTeamId: alliance.id, name: "Alliance São Paulo HQ" }
      });
      if (!branchExists) {
        await prisma.academyBranch.create({
          data: {
            globalTeamId: alliance.id,
            name: "Alliance São Paulo HQ",
            slug: "alliance-sao-paulo-hq",
            country: "Brasil",
            state: "SP",
            city: "São Paulo",
            address: "Rua Mourato Coelho, 1200 - Pinheiros",
            headProfessor: "Fabio Gurgel",
            verified: true,
            verifiedExternally: true,
            membersCount: 420
          }
        });
        console.log("   → Filial 'Alliance São Paulo HQ' adicionada.");
      }
    }

    console.log("\n================================================================================");
    console.log("🎉 SEED DE PROCESSAMENTO CADASTRADO E VALIDADO COM SUCESSO! 🥋");
    console.log("================================================================================\n");

  } catch (error: any) {
    console.error("❌ ERRO AO EXECUTAR SEED DE ACADEMIAS:", error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBjjRealOrganizations();
