import { PrismaClient } from "@prisma/client";

export async function seedAcademyHierarchy(prisma: PrismaClient) {
  console.log("🌱 [SEED MODULE: ACADEMY HIERARCHY] Iniciando UPSERT seguro da hierarquia de academias...");
  try {
    // 1. Definição das 10 Equipes Globais Oficiais da IBJJF
    const globalTeams = [
      {
        id: "team-gracie-barra",
        name: "Gracie Barra",
        slug: "gracie-barra",
        logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200",
        countryOrigin: "Brasil",
        website: "https://graciebarra.com",
        instagram: "@graciebarra",
        description: "Liderança global de Jiu-Jitsu fundada por Carlos Gracie Jr., com milhares de escolas espalhadas pelo mundo.",
        foundedYear: 1986,
        totalPoints: 120500,
        verified: true
      },
      {
        id: "team-checkmat",
        name: "Checkmat",
        slug: "checkmat",
        logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200",
        countryOrigin: "Brasil",
        website: "https://checkmatbjj.com",
        instagram: "@checkmatbjj",
        description: "Equipe de elite fundada por Leo Vieira, mundialmente prestigiada por seu jogo agressivo, moderno e de altíssimo nível técnico.",
        foundedYear: 2008,
        totalPoints: 110200,
        verified: true
      },
      {
        id: "team-alliance",
        name: "Alliance",
        slug: "alliance",
        logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200",
        countryOrigin: "Brasil",
        website: "https://alliancebjj.com",
        instagram: "@alliancebjj",
        description: "A mais vitoriosa equipe de competição do jiu-jitsu moderno, focada na excelência técnica, fundada por Fabio Gurgel, Romero Cavalcanti e Alexandre Paiva.",
        foundedYear: 1993,
        totalPoints: 105400,
        verified: true
      },
      {
        id: "team-gfteam",
        name: "GF Team",
        slug: "gf-team",
        logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200",
        countryOrigin: "Brasil",
        website: "https://gfteam.com.br",
        instagram: "@gfteamoficial",
        description: "Grappling Fight Team, tradicional celeiro de campeões casca-grossas diretamente do subúrbio e das comunidades do Rio de Janeiro.",
        foundedYear: 1996,
        totalPoints: 92100,
        verified: true
      },
      {
        id: "team-atos",
        name: "Atos Jiu-Jitsu",
        slug: "atos-jiu-jitsu",
        logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200",
        countryOrigin: "Brasil",
        website: "https://atosjiujitsuhq.com",
        instagram: "@atosbjj",
        description: "Referência absoluta do jiu-jitsu esportivo e inovação tática fundada pelos lendários mestres Ramon Lemos e Andre Galvão.",
        foundedYear: 2008,
        totalPoints: 88500,
        verified: true
      },
      {
        id: "team-dream-art",
        name: "Dream Art",
        slug: "dream-art",
        logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200",
        countryOrigin: "Brasil",
        website: "https://dreamartproject.com",
        instagram: "@dream.art",
        description: "Projeto profissional e escola moderna que revolucionou o amparo aos atletas e revelou sucessivos campeões mundiais.",
        foundedYear: 2018,
        totalPoints: 78900,
        verified: true
      },
      {
        id: "team-aoj",
        name: "Art of Jiu-Jitsu (AOJ)",
        slug: "art-of-jiu-jitsu",
        logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200",
        countryOrigin: "USA",
        website: "https://artofjiujitsu.com",
        instagram: "@artofjiujitsu",
        description: "Inovação conceitual estético-técnica de excelência minimalista premium fundada na Califórnia pelos renomados irmãos Mendes.",
        foundedYear: 2012,
        totalPoints: 65400,
        verified: true
      },
      {
        id: "team-fratres",
        name: "Fratres BJJ",
        slug: "fratres-bjj",
        logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200",
        countryOrigin: "Brasil",
        website: "https://fratresbjj.com",
        instagram: "@fratresbjj",
        description: "Equipe de competição moderna de alto rendimento focada na performance e suporte de atletas profissionais de elite.",
        foundedYear: 2020,
        totalPoints: 54100,
        verified: true
      },
      {
        id: "team-nova-uniao",
        name: "Nova União",
        slug: "nova-uniao",
        logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200",
        countryOrigin: "Brasil",
        website: "https://novauniao.co",
        instagram: "@novauniaooficial",
        description: "Escola histórica tradicional que produziu lendas absolutas tanto do Jiu-Jitsu de quimono quanto do MMA, liderada por Dedé Pederneiras.",
        foundedYear: 1995,
        totalPoints: 48500,
        verified: true
      },
      {
        id: "team-carlson-gracie",
        name: "Carlson Gracie Team",
        slug: "carlson-gracie",
        logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200",
        countryOrigin: "Brasil",
        website: "https://carlsongracieteam.com",
        instagram: "@carlsongracieteam",
        description: "A clássica e temida escuderia de jiu-jitsu ofensivo, pressão tática inabalável e raça pura nos tatames mundiais.",
        foundedYear: 1996,
        totalPoints: 42300,
        verified: true
      }
    ];

    // 2. Executando os UPSERTS para cada Equipe Global
    console.log("⚡ Executando Upserts das equipes no banco...");
    for (const team of globalTeams) {
      await prisma.globalTeam.upsert({
        where: { id: team.id },
        update: {
          name: team.name,
          slug: team.slug,
          logo: team.logo,
          countryOrigin: team.countryOrigin,
          website: team.website,
          instagram: team.instagram,
          description: team.description,
          foundedYear: team.foundedYear,
          totalPoints: team.totalPoints,
          verified: team.verified
        },
        create: {
          id: team.id,
          name: team.name,
          slug: team.slug,
          logo: team.logo,
          countryOrigin: team.countryOrigin,
          website: team.website,
          instagram: team.instagram,
          description: team.description,
          foundedYear: team.foundedYear,
          totalPoints: team.totalPoints,
          verified: team.verified
        }
      });
    }
    console.log("✓ Equipes Globais sincronizadas com sucesso no PostgreSQL!");

    // 3. Definição das Filiais Reais Autorizadas
    const branches = [
      // GRACIE BARRA branches (10)
      { id: "branch-gb-sp", globalTeamId: "team-gracie-barra", name: "Gracie Barra - São Paulo", slug: "gb-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Paulista, 1200", headProfessor: "Professor Gracie SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 15100, verified: true },
      { id: "branch-gb-rj", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Rio de Janeiro", slug: "gb-rj", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Av. das Américas, 4400, Barra", headProfessor: "Professor Gracie RJ", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 14200, verified: true },
      { id: "branch-gb-curitiba", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Curitiba", slug: "gb-curitiba", country: "Brasil", state: "PR", city: "Curitiba", address: "Rua Brigadeiro Franco, 2300", headProfessor: "Professor Gracie PR", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 12000, verified: true },
      { id: "branch-gb-bh", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Belo Horizonte", slug: "gb-bh", country: "Brasil", state: "MG", city: "Belo Horizonte", address: "Rua Paraíba, 550, Savassi", headProfessor: "Professor Gracie MG", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 10500, verified: true },
      { id: "branch-gb-df", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Brasília", slug: "gb-brasilia", country: "Brasil", state: "DF", city: "Brasília", address: "CLS 409, Bloco B", headProfessor: "Professor Gracie DF", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 9500, verified: true },
      { id: "branch-gb-orlando", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Orlando", slug: "gb-orlando", country: "USA", state: "FL", city: "Orlando", address: "Sand Lake Rd, 7300", headProfessor: "Professor Gracie Orlando", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 11500, verified: true },
      { id: "branch-gb-irvine", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Irvine", slug: "gb-irvine", country: "USA", state: "CA", city: "Irvine", address: "Main St, 14900", headProfessor: "Professor Gracie Irvine", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 12500, verified: true },
      { id: "branch-gb-sandiego", globalTeamId: "team-gracie-barra", name: "Gracie Barra - San Diego", slug: "gb-sandiego", country: "USA", state: "CA", city: "San Diego", address: "Morena Blvd, 4100", headProfessor: "Professor Gracie SD", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 13800, verified: true },
      { id: "branch-gb-london", globalTeamId: "team-gracie-barra", name: "Gracie Barra - London", slug: "gb-london", country: "United Kingdom", state: "ENG", city: "London", address: "Shepherds Bush Rd, 12", headProfessor: "Professor Gracie UK", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8800, verified: true },
      { id: "branch-gb-dubai", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Dubai", slug: "gb-dubai", country: "United Arab Emirates", state: "DXB", city: "Dubai", address: "Sheikh Zayed Rd, Opal Tower", headProfessor: "Professor Gracie Dubai", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 13000, verified: true },

      // ALLIANCE branches (7)
      { id: "branch-al-sp", globalTeamId: "team-alliance", name: "Alliance - São Paulo", slug: "alliance-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Augusta, 1050", headProfessor: "Fabio Gurgel", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 16500, verified: true },
      { id: "branch-al-campinas", globalTeamId: "team-alliance", name: "Alliance - Campinas", slug: "alliance-campinas", country: "Brasil", state: "SP", city: "Campinas", address: "Av. Coronel Silva Teles, 340", headProfessor: "Alexandre Paiva", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 9800, verified: true },
      { id: "branch-al-rj", globalTeamId: "team-alliance", name: "Alliance - Rio de Janeiro", slug: "alliance-rj", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Rua Visconde de Pirajá, 350, Ipanema", headProfessor: "Gigi Paiva", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 11000, verified: true },
      { id: "branch-al-atlanta", globalTeamId: "team-alliance", name: "Alliance - Atlanta", slug: "alliance-atlanta", country: "USA", state: "GA", city: "Atlanta", address: "Cobb Pkwy, 2900", headProfessor: "Romero Cavalcanti", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 13500, verified: true },
      { id: "branch-al-sandiego", globalTeamId: "team-alliance", name: "Alliance - San Diego", slug: "alliance-sandiego", country: "USA", state: "CA", city: "San Diego", address: "Miramar Rd, 5200", headProfessor: "Professor Alliance SD", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 10500, verified: true },
      { id: "branch-al-stockholm", globalTeamId: "team-alliance", name: "Alliance - Stockholm", slug: "alliance-stockholm", country: "Sweden", state: "STH", city: "Stockholm", address: "Sveavägen, 98", headProfessor: "Professor Janson", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 7200, verified: true },
      { id: "branch-al-lisboa", globalTeamId: "team-alliance", name: "Alliance - Lisboa", slug: "alliance-lisboa", country: "Portugal", state: "LIS", city: "Lisboa", address: "Av. da Liberdade, 22", headProfessor: "Professor Reis", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 9100, verified: true },

      // ATOS branches (6)
      { id: "branch-at-sandiego", globalTeamId: "team-atos", name: "Atos - San Diego HQ", slug: "atos-sandiego-hq", country: "USA", state: "CA", city: "San Diego", address: "Miramar Rd, 4811", headProfessor: "Andre Galvão", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 17200, verified: true },
      { id: "branch-at-sp", globalTeamId: "team-atos", name: "Atos - São Paulo", slug: "atos-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Clélia, 800", headProfessor: "Professor Atos SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 11000, verified: true },
      { id: "branch-at-curitiba", globalTeamId: "team-atos", name: "Atos - Curitiba", slug: "atos-curitiba", country: "Brasil", state: "PR", city: "Curitiba", address: "Av. Getúlio Vargas, 1400", headProfessor: "Professor Atos PR", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8900, verified: true },
      { id: "branch-at-orlando", globalTeamId: "team-atos", name: "Atos - Orlando", slug: "atos-orlando", country: "USA", state: "FL", city: "Orlando", address: "Semoran Blvd, 5400", headProfessor: "Professor Atos Orlando", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 10200, verified: true },
      { id: "branch-at-houston", globalTeamId: "team-atos", name: "Atos - Houston", slug: "atos-houston", country: "USA", state: "TX", city: "Houston", address: "Westheimer Rd, 6200", headProfessor: "Professor Atos TX", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8400, verified: true },
      { id: "branch-at-europe", globalTeamId: "team-atos", name: "Atos - Europe HQ", slug: "atos-europe-hq", country: "Germany", state: "BY", city: "Munich", address: "Kaiserstraße, 12", headProfessor: "Professor Atos Europe", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 9400, verified: true },

      // CHECKMAT branches (5)
      { id: "branch-cm-sp", globalTeamId: "team-checkmat", name: "Checkmat - São Paulo", slug: "checkmat-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Capote Valente, 500", headProfessor: "Leo Vieira", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 15500, verified: true },
      { id: "branch-cm-rj", globalTeamId: "team-checkmat", name: "Checkmat - Rio de Janeiro", slug: "checkmat-rj", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Av. Copacabana, 900", headProfessor: "Professor Checkmat RJ", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 10200, verified: true },
      { id: "branch-cm-sandiego", globalTeamId: "team-checkmat", name: "Checkmat - San Diego", slug: "checkmat-sandiego", country: "USA", state: "CA", city: "San Diego", address: "Sports Arena Blvd, 3200", headProfessor: "Ricardinho", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 12800, verified: true },
      { id: "branch-cm-portugal", globalTeamId: "team-checkmat", name: "Checkmat - Portugal", slug: "checkmat-portugal", country: "Portugal", state: "LIS", city: "Lisboa", address: "Av. de Roma, 45", headProfessor: "Professor Portugal", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 9500, verified: true },
      { id: "branch-cm-london", globalTeamId: "team-checkmat", name: "Checkmat - London", slug: "checkmat-london", country: "United Kingdom", state: "ENG", city: "London", address: "Clapham High St, 85", headProfessor: "Chico Mendes", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 11000, verified: true },

      // GF TEAM branches (5)
      { id: "branch-gf-rj", globalTeamId: "team-gfteam", name: "GF Team - Rio de Janeiro", slug: "gfteam-rj", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Rua Dias da Cruz, 200, Méier", headProfessor: "Julio Cesar Pereira", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 14800, verified: true },
      { id: "branch-gf-sp", globalTeamId: "team-gfteam", name: "GF Team - São Paulo", slug: "gfteam-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Santo Amaro, 3200", headProfessor: "Professor GFTeam SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 9500, verified: true },
      { id: "branch-gf-manaus", globalTeamId: "team-gfteam", name: "GF Team - Manaus", slug: "gfteam-manaus", country: "Brasil", state: "AM", city: "Manaus", address: "Av. Djalma Batista, 1100", headProfessor: "Professor GFTeam Manaus", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8400, verified: true },
      { id: "branch-gf-miami", globalTeamId: "team-gfteam", name: "GF Team - Miami", slug: "gfteam-miami", country: "USA", state: "FL", city: "Miami", address: "Biscayne Blvd, 7800", headProfessor: "Professor GFTeam Miami", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 11200, verified: true },
      { id: "branch-gf-portugal", globalTeamId: "team-gfteam", name: "GF Team - Portugal", slug: "gfteam-portugal", country: "Portugal", state: "LIS", city: "Lisboa", address: "Rua do Ouro, 150", headProfessor: "Professor GFTeam Portugal", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8900, verified: true },

      // DREAM ART branches (4)
      { id: "branch-da-sp", globalTeamId: "team-dream-art", name: "Dream Art - São Paulo HQ", slug: "dreamart-sp-hq", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Ricardo Jafet, 1500", headProfessor: "Isaque Bahiense", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 15900, verified: true },
      { id: "branch-da-houston", globalTeamId: "team-dream-art", name: "Dream Art - Houston", slug: "dreamart-houston", country: "USA", state: "TX", city: "Houston", address: "Westheimer Rd, 4500", headProfessor: "Professor DreamArt TX", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8900, verified: true },
      { id: "branch-da-orlando", globalTeamId: "team-dream-art", name: "Dream Art - Orlando", slug: "dreamart-orlando", country: "USA", state: "FL", city: "Orlando", address: "Colonial Dr, 4200", headProfessor: "Professor DreamArt FL", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 9500, verified: true },
      { id: "branch-da-lisboa", globalTeamId: "team-dream-art", name: "Dream Art - Lisboa", slug: "dreamart-lisboa", country: "Portugal", state: "LIS", city: "Lisboa", address: "Av. Almirante Reis, 14", headProfessor: "Alex Souza", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8800, verified: true },

      // AOJ branches (4)
      { id: "branch-aoj-costamesa", globalTeamId: "team-aoj", name: "Art of Jiu-Jitsu - Costa Mesa HQ", slug: "aoj-costamesa-hq", country: "USA", state: "CA", city: "Costa Mesa", address: "Randolph Ave, 2985", headProfessor: "Guilherme Mendes", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 16200, verified: true },
      { id: "branch-aoj-la", globalTeamId: "team-aoj", name: "Art of Jiu-Jitsu - Los Angeles", slug: "aoj-la", country: "USA", state: "CA", city: "Los Angeles", address: "Wilshire Blvd, 6200", headProfessor: "Rafael Mendes", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 11000, verified: true },
      { id: "branch-aoj-lasvegas", globalTeamId: "team-aoj", name: "Art of Jiu-Jitsu - Las Vegas", slug: "aoj-lasvegas", country: "USA", state: "NV", city: "Las Vegas", address: "Sahara Ave, 2500", headProfessor: "Professor AOJ LV", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8900, verified: true },
      { id: "branch-aoj-miami", globalTeamId: "team-aoj", name: "Art of Jiu-Jitsu - Miami", slug: "aoj-miami", country: "USA", state: "FL", city: "Miami", address: "Biscayne Blvd, 3200", headProfessor: "Professor AOJ Miami", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 10400, verified: true },

      // FRATRES branches (3)
      { id: "branch-fr-campinas", globalTeamId: "team-fratres", name: "Fratres - Campinas", slug: "fratres-campinas", country: "Brasil", state: "SP", city: "Campinas", address: "Rua Maria Monteiro, 1200", headProfessor: "Daniel Affonso", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 14200, verified: true },
      { id: "branch-fr-sp", globalTeamId: "team-fratres", name: "Fratres - São Paulo", slug: "fratres-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Oscar Freire, 800", headProfessor: "Professor Fratres SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 12000, verified: true },
      { id: "branch-fr-orlando", globalTeamId: "team-fratres", name: "Fratres - Orlando", slug: "fratres-orlando", country: "USA", state: "FL", city: "Orlando", address: "International Dr, 8100", headProfessor: "Professor Fratres Orlando", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 9500, verified: true },

      // NOVA UNIÃO branches (4)
      { id: "branch-nu-rj", globalTeamId: "team-nova-uniao", name: "Nova União - Rio de Janeiro HQ", slug: "nova-uniao-rj-hq", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Rua Marquês de Abrantes, 90, Flamengo", headProfessor: "Dedé Pederneiras", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 14500, verified: true },
      { id: "branch-nu-sp", globalTeamId: "team-nova-uniao", name: "Nova União - São Paulo", slug: "nova-uniao-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Pompeia, 1500", headProfessor: "Professor NU SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8400, verified: true },
      { id: "branch-nu-manaus", globalTeamId: "team-nova-uniao", name: "Nova União - Manaus", slug: "nova-uniao-manaus", country: "Brasil", state: "AM", city: "Manaus", address: "Rua Silva Ramos, 80", headProfessor: "Nonato Machado", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 11000, verified: true },
      { id: "branch-nu-lisboa", globalTeamId: "team-nova-uniao", name: "Nova União - Lisboa", slug: "nova-uniao-lisboa", country: "Portugal", state: "LIS", city: "Lisboa", address: "Rua da Prata, 10", headProfessor: "Reinaldo Ribeiro", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 7900, verified: true },

      // CARLSON GRACIE branches (4)
      { id: "branch-cg-rj", globalTeamId: "team-carlson-gracie", name: "Carlson Gracie Team - Rio de Janeiro HQ", slug: "carlson-rj-hq", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Rua Figueiredo de Magalhães, 414, Copacabana", headProfessor: "Carlson Gracie Jr", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 15000, verified: true },
      { id: "branch-cg-chicago", globalTeamId: "team-carlson-gracie", name: "Carlson Gracie Team - Chicago", slug: "carlson-chicago", country: "USA", state: "IL", city: "Chicago", address: "Milwaukee Ave, 2300", headProfessor: "Professor Carlson Chicago", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 9800, verified: true },
      { id: "branch-cg-london", globalTeamId: "team-carlson-gracie", name: "Carlson Gracie Team - London", slug: "carlson-london", country: "United Kingdom", state: "ENG", city: "London", address: "Castletown Rd, 12", headProfessor: "Simon Hayes", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8900, verified: true },
      { id: "branch-cg-sp", globalTeamId: "team-carlson-gracie", name: "Carlson Gracie Team - São Paulo", slug: "carlson-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Moema, 120", headProfessor: "Professor Carlson SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", points: 8600, verified: true }
    ];

    console.log("⚡ Executando Upserts das filiais no banco...");
    for (const b of branches) {
      await prisma.academyBranch.upsert({
        where: { id: b.id },
        update: {
          globalTeamId: b.globalTeamId,
          name: b.name,
          slug: b.slug,
          country: b.country,
          state: b.state,
          city: b.city,
          address: b.address,
          headProfessor: b.headProfessor,
          logo: b.logo,
          points: b.points,
          verified: b.verified
        },
        create: {
          id: b.id,
          globalTeamId: b.globalTeamId,
          name: b.name,
          slug: b.slug,
          country: b.country,
          state: b.state,
          city: b.city,
          address: b.address,
          headProfessor: b.headProfessor,
          logo: b.logo,
          points: b.points,
          verified: b.verified
        }
      });
    }
    console.log("✓ Filiais Oficiais sincronizadas com sucesso no PostgreSQL!");

    // 4. Semeando algumas Academias Independentes reais com valores mais altos de ranking
    const independents = [
      { id: "independent-id-0", name: "Suave Arte Dojo São Paulo", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Alavanca, 200, Centro", headProfessor: "Sensei Mendes", logo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=150", points: 14120, verified: true },
      { id: "independent-id-1", name: "Golden Belt Academy Curitiba", country: "Brasil", state: "PR", city: "Curitiba", address: "Rua das Faixas, 432", headProfessor: "Sensei Oliveira", logo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=150", points: 10420, verified: false },
      { id: "independent-id-2", name: "Iron Guard Dojo Miami", country: "USA", state: "FL", city: "Miami", address: "Ocean Drive, 101", headProfessor: "Sensei Souza", logo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=150", points: 11890, verified: true }
    ];

    console.log("⚡ Executando Upserts das academias independentes no banco...");
    for (const ind of independents) {
      await prisma.independentAcademy.upsert({
        where: { id: ind.id },
        update: {
          name: ind.name,
          country: ind.country,
          state: ind.state,
          city: ind.city,
          address: ind.address,
          headProfessor: ind.headProfessor,
          logo: ind.logo,
          points: ind.points,
          verified: ind.verified
        },
        create: {
          id: ind.id,
          name: ind.name,
          country: ind.country,
          state: ind.state,
          city: ind.city,
          address: ind.address,
          headProfessor: ind.headProfessor,
          logo: ind.logo,
          points: ind.points,
          verified: ind.verified
        }
      });
    }
    console.log("✓ Academias Independentes sincronizadas com sucesso no PostgreSQL!");
    console.log("🎉 [SEED MODULE: ACADEMY HIERARCHY COMPLETE SUCCESSFULLY]");
  } catch (error: any) {
    console.error("✗ [SEED MODULE: ACADEMY HIERARCHY ERROR]:", error.message || error);
  }
}
