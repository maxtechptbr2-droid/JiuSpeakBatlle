import { Router } from "express";
import { prisma, getPrisma, isDatabaseConnected } from "./db";
import { authenticateToken } from "./middleware/auth";
import { requireRole } from "./middleware/roles";

const router = Router();

console.log("⚡ [ACADEMY ROUTER] Módulo de Academias inicializado e carregado!");

router.use((req, res, next) => {
  console.log(`📡 [ACADEMY ROUTER REQUEST]: ${req.method} ${req.url}`);
  next();
});

// ==========================================
// UTILITY: DETECT DB OFFLINE FALLBACK
// ==========================================
async function isDbOnline(): Promise<boolean> {
  return isDatabaseConnected();
}

// Global In-Memory Cache/Fallback store for offline mode
const mockGlobalTeams = [
  { id: "team-gracie-barra", name: "Gracie Barra", slug: "gracie-barra", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://graciebarra.com", instagram: "@graciebarra", description: "Liderança global de Jiu-Jitsu fundada por Carlos Gracie Jr.", foundedYear: 1986, totalMembers: 120, totalPoints: 120500, active: true, verified: true },
  { id: "team-checkmat", name: "Checkmat", slug: "checkmat", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://checkmatbjj.com", instagram: "@checkmatbjj", description: "Equipe de elite fundada por Leo Vieira, famosa por seu jogo moderno e dinâmico.", foundedYear: 2008, totalMembers: 98, totalPoints: 110200, active: true, verified: true },
  { id: "team-alliance", name: "Alliance", slug: "alliance", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://alliancebjj.com", instagram: "@alliancebjj", description: "Multi-campeã mundial por equipes fundada por Fabio Gurgel e Romero Cavalcanti.", foundedYear: 1993, totalMembers: 110, totalPoints: 105400, active: true, verified: true },
  { id: "team-gfteam", name: "GF Team", slug: "gf-team", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://gfteam.com.br", instagram: "@gfteamoficial", description: "Grappling Fight Team, originária do emblemático tatame do Rio de Janeiro.", foundedYear: 1996, totalMembers: 84, totalPoints: 92100, active: true, verified: true },
  { id: "team-atos", name: "Atos Jiu-Jitsu", slug: "atos-jiu-jitsu", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://atosjiujitsuhq.com", instagram: "@atosbjj", description: "Inovação técnica internacional fundada por Ramon Lemos e Andre Galvão.", foundedYear: 2008, totalMembers: 78, totalPoints: 88500, active: true, verified: true },
  { id: "team-dream-art", name: "Dream Art", slug: "dream-art", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://dreamartproject.com", instagram: "@dream.art", description: "Projeto e escola profissional moderna revelando sucessivos campeões mundiais.", foundedYear: 2018, totalMembers: 68, totalPoints: 78900, active: true, verified: true },
  { id: "team-aoj", name: "Art of Jiu-Jitsu (AOJ)", slug: "art-of-jiu-jitsu", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "USA", website: "https://artofjiujitsu.com", instagram: "@artofjiujitsu", description: "Liderança estética e técnica minimalista premium fundada pelos irmãos Mendes.", foundedYear: 2012, totalMembers: 52, totalPoints: 65400, active: true, verified: true },
  { id: "team-fratres", name: "Fratres BJJ", slug: "fratres-bjj", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://fratresbjj.com", instagram: "@fratresbjj", description: "Equipe de competição de alto rendimento focada na performance de elite.", foundedYear: 2020, totalMembers: 45, totalPoints: 54100, active: true, verified: true },
  { id: "team-nova-uniao", name: "Nova União", slug: "nova-uniao", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://novauniao.co", instagram: "@novauniaooficial", description: "Equipe histórica formadora de lendas das artes marciais e cinturões mundiais.", foundedYear: 1995, totalMembers: 61, totalPoints: 48500, active: true, verified: true },
  { id: "team-carlson-gracie", name: "Carlson Gracie Team", slug: "carlson-gracie", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://carlsongracieteam.com", instagram: "@carlsongracieteam", description: "A clássica escuderia de jiu-jitsu ofensivo, pressão inabalável e raça nos tatames.", foundedYear: 1996, totalMembers: 55, totalPoints: 42300, active: true, verified: true }
];

const mockBranches = [
  // GRACIE BARRA branches
  { id: "branch-gb-sp", globalTeamId: "team-gracie-barra", name: "Gracie Barra - São Paulo", slug: "gb-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Paulista, 1200", headProfessor: "Professor Gracie SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 45, points: 15100, active: true, verified: true },
  { id: "branch-gb-rj", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Rio de Janeiro", slug: "gb-rj", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Av. das Américas, 4400, Barra", headProfessor: "Professor Gracie RJ", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 52, points: 14200, active: true, verified: true },
  { id: "branch-gb-curitiba", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Curitiba", slug: "gb-curitiba", country: "Brasil", state: "PR", city: "Curitiba", address: "Rua Brigadeiro Franco, 2300", headProfessor: "Professor Gracie PR", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 30, points: 12000, active: true, verified: true },
  { id: "branch-gb-bh", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Belo Horizonte", slug: "gb-bh", country: "Brasil", state: "MG", city: "Belo Horizonte", address: "Rua Paraíba, 550, Savassi", headProfessor: "Professor Gracie MG", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 22, points: 10500, active: true, verified: true },
  { id: "branch-gb-df", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Brasília", slug: "gb-brasilia", country: "Brasil", state: "DF", city: "Brasília", address: "CLS 409, Bloco B", headProfessor: "Professor Gracie DF", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 18, points: 9500, active: true, verified: true },
  { id: "branch-gb-orlando", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Orlando", slug: "gb-orlando", country: "USA", state: "FL", city: "Orlando", address: "Sand Lake Rd, 7300", headProfessor: "Professor Gracie Orlando", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 28, points: 11500, active: true, verified: true },
  { id: "branch-gb-irvine", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Irvine", slug: "gb-irvine", country: "USA", state: "CA", city: "Irvine", address: "Main St, 14900", headProfessor: "Professor Gracie Irvine", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 35, points: 12500, active: true, verified: true },
  { id: "branch-gb-sandiego", globalTeamId: "team-gracie-barra", name: "Gracie Barra - San Diego", slug: "gb-sandiego", country: "USA", state: "CA", city: "San Diego", address: "Morena Blvd, 4100", headProfessor: "Professor Gracie SD", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 41, points: 13800, active: true, verified: true },
  { id: "branch-gb-london", globalTeamId: "team-gracie-barra", name: "Gracie Barra - London", slug: "gb-london", country: "United Kingdom", state: "ENG", city: "London", address: "Shepherds Bush Rd, 12", headProfessor: "Professor Gracie UK", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 15, points: 8800, active: true, verified: true },
  { id: "branch-gb-dubai", globalTeamId: "team-gracie-barra", name: "Gracie Barra - Dubai", slug: "gb-dubai", country: "United Arab Emirates", state: "DXB", city: "Dubai", address: "Sheikh Zayed Rd, Opal Tower", headProfessor: "Professor Gracie Dubai", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 20, points: 13000, active: true, verified: true },

  // ALLIANCE branches
  { id: "branch-al-sp", globalTeamId: "team-alliance", name: "Alliance - São Paulo", slug: "alliance-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Augusta, 1050", headProfessor: "Fabio Gurgel", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 65, points: 16500, active: true, verified: true },
  { id: "branch-al-campinas", globalTeamId: "team-alliance", name: "Alliance - Campinas", slug: "alliance-campinas", country: "Brasil", state: "SP", city: "Campinas", address: "Av. Coronel Silva Teles, 340", headProfessor: "Alexandre Paiva", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 28, points: 9800, active: true, verified: true },
  { id: "branch-al-rj", globalTeamId: "team-alliance", name: "Alliance - Rio de Janeiro", slug: "alliance-rj", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Rua Visconde de Pirajá, 350, Ipanema", headProfessor: "Gigi Paiva", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 38, points: 11000, active: true, verified: true },
  { id: "branch-al-atlanta", globalTeamId: "team-alliance", name: "Alliance - Atlanta", slug: "alliance-atlanta", country: "USA", state: "GA", city: "Atlanta", address: "Cobb Pkwy, 2900", headProfessor: "Romero Cavalcanti", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 45, points: 13500, active: true, verified: true },
  { id: "branch-al-sandiego", globalTeamId: "team-alliance", name: "Alliance - San Diego", slug: "alliance-sandiego", country: "USA", state: "CA", city: "San Diego", address: "Miramar Rd, 5200", headProfessor: "Professor Alliance SD", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 30, points: 10500, active: true, verified: true },
  { id: "branch-al-stockholm", globalTeamId: "team-alliance", name: "Alliance - Stockholm", slug: "alliance-stockholm", country: "Sweden", state: "STH", city: "Stockholm", address: "Sveavägen, 98", headProfessor: "Professor Janson", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 14, points: 7200, active: true, verified: true },
  { id: "branch-al-lisboa", globalTeamId: "team-alliance", name: "Alliance - Lisboa", slug: "alliance-lisboa", country: "Portugal", state: "LIS", city: "Lisboa", address: "Av. da Liberdade, 22", headProfessor: "Professor Reis", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 22, points: 9100, active: true, verified: true },

  // ATOS branches
  { id: "branch-at-sandiego", globalTeamId: "team-atos", name: "Atos - San Diego HQ", slug: "atos-sandiego-hq", country: "USA", state: "CA", city: "San Diego", address: "Miramar Rd, 4811", headProfessor: "Andre Galvão", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 75, points: 17200, active: true, verified: true },
  { id: "branch-at-sp", globalTeamId: "team-atos", name: "Atos - São Paulo", slug: "atos-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Clélia, 800", headProfessor: "Professor Atos SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 38, points: 11000, active: true, verified: true },
  { id: "branch-at-curitiba", globalTeamId: "team-atos", name: "Atos - Curitiba", slug: "atos-curitiba", country: "Brasil", state: "PR", city: "Curitiba", address: "Av. Getúlio Vargas, 1400", headProfessor: "Professor Atos PR", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 24, points: 8900, active: true, verified: true },
  { id: "branch-at-orlando", globalTeamId: "team-atos", name: "Atos - Orlando", slug: "atos-orlando", country: "USA", state: "FL", city: "Orlando", address: "Semoran Blvd, 5400", headProfessor: "Professor Atos Orlando", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 29, points: 10200, active: true, verified: true },
  { id: "branch-at-houston", globalTeamId: "team-atos", name: "Atos - Houston", slug: "atos-houston", country: "USA", state: "TX", city: "Houston", address: "Westheimer Rd, 6200", headProfessor: "Professor Atos TX", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 21, points: 8400, active: true, verified: true },
  { id: "branch-at-europe", globalTeamId: "team-atos", name: "Atos - Europe HQ", slug: "atos-europe-hq", country: "Germany", state: "BY", city: "Munich", address: "Kaiserstraße, 12", headProfessor: "Professor Atos Europe", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 19, points: 9400, active: true, verified: true },

  // CHECKMAT branches
  { id: "branch-cm-sp", globalTeamId: "team-checkmat", name: "Checkmat - São Paulo", slug: "checkmat-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Capote Valente, 500", headProfessor: "Leo Vieira", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 55, points: 15500, active: true, verified: true },
  { id: "branch-cm-rj", globalTeamId: "team-checkmat", name: "Checkmat - Rio de Janeiro", slug: "checkmat-rj", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Av. Copacabana, 900", headProfessor: "Professor Checkmat RJ", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 32, points: 10200, active: true, verified: true },
  { id: "branch-cm-sandiego", globalTeamId: "team-checkmat", name: "Checkmat - San Diego", slug: "checkmat-sandiego", country: "USA", state: "CA", city: "San Diego", address: "Sports Arena Blvd, 3200", headProfessor: "Ricardinho", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 42, points: 12800, active: true, verified: true },
  { id: "branch-cm-portugal", globalTeamId: "team-checkmat", name: "Checkmat - Portugal", slug: "checkmat-portugal", country: "Portugal", state: "LIS", city: "Lisboa", address: "Av. de Roma, 45", headProfessor: "Professor Portugal", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 25, points: 9500, active: true, verified: true },
  { id: "branch-cm-london", globalTeamId: "team-checkmat", name: "Checkmat - London", slug: "checkmat-london", country: "United Kingdom", state: "ENG", city: "London", address: "Clapham High St, 85", headProfessor: "Chico Mendes", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 28, points: 11000, active: true, verified: true },

  // GF TEAM branches
  { id: "branch-gf-rj", globalTeamId: "team-gfteam", name: "GF Team - Rio de Janeiro", slug: "gfteam-rj", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Rua Dias da Cruz, 200, Méier", headProfessor: "Julio Cesar Pereira", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 71, points: 14800, active: true, verified: true },
  { id: "branch-gf-sp", globalTeamId: "team-gfteam", name: "GF Team - São Paulo", slug: "gfteam-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Santo Amaro, 3200", headProfessor: "Professor GFTeam SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 30, points: 9500, active: true, verified: true },
  { id: "branch-gf-manaus", globalTeamId: "team-gfteam", name: "GF Team - Manaus", slug: "gfteam-manaus", country: "Brasil", state: "AM", city: "Manaus", address: "Av. Djalma Batista, 1100", headProfessor: "Professor GFTeam Manaus", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 22, points: 8400, active: true, verified: true },
  { id: "branch-gf-miami", globalTeamId: "team-gfteam", name: "GF Team - Miami", slug: "gfteam-miami", country: "USA", state: "FL", city: "Miami", address: "Biscayne Blvd, 7800", headProfessor: "Professor GFTeam Miami", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 35, points: 11200, active: true, verified: true },
  { id: "branch-gf-portugal", globalTeamId: "team-gfteam", name: "GF Team - Portugal", slug: "gfteam-portugal", country: "Portugal", state: "LIS", city: "Lisboa", address: "Rua do Ouro, 150", headProfessor: "Professor GFTeam Portugal", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 24, points: 8900, active: true, verified: true },

  // DREAM ART branches
  { id: "branch-da-sp", globalTeamId: "team-dream-art", name: "Dream Art - São Paulo HQ", slug: "dreamart-sp-hq", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Ricardo Jafet, 1500", headProfessor: "Isaque Bahiense", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 68, points: 15900, active: true, verified: true },
  { id: "branch-da-houston", globalTeamId: "team-dream-art", name: "Dream Art - Houston", slug: "dreamart-houston", country: "USA", state: "TX", city: "Houston", address: "Westheimer Rd, 4500", headProfessor: "Professor DreamArt TX", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 24, points: 8900, active: true, verified: true },
  { id: "branch-da-orlando", globalTeamId: "team-dream-art", name: "Dream Art - Orlando", slug: "dreamart-orlando", country: "USA", state: "FL", city: "Orlando", address: "Colonial Dr, 4200", headProfessor: "Professor DreamArt FL", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 27, points: 9500, active: true, verified: true },
  { id: "branch-da-lisboa", globalTeamId: "team-dream-art", name: "Dream Art - Lisboa", slug: "dreamart-lisboa", country: "Portugal", state: "LIS", city: "Lisboa", address: "Av. Almirante Reis, 14", headProfessor: "Alex Souza", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 20, points: 8800, active: true, verified: true },

  // AOJ branches
  { id: "branch-aoj-costamesa", globalTeamId: "team-aoj", name: "Art of Jiu-Jitsu - Costa Mesa HQ", slug: "aoj-costamesa-hq", country: "USA", state: "CA", city: "Costa Mesa", address: "Randolph Ave, 2985", headProfessor: "Guilherme Mendes", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 52, points: 16200, active: true, verified: true },
  { id: "branch-aoj-la", globalTeamId: "team-aoj", name: "Art of Jiu-Jitsu - Los Angeles", slug: "aoj-la", country: "USA", state: "CA", city: "Los Angeles", address: "Wilshire Blvd, 6200", headProfessor: "Rafael Mendes", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 30, points: 11000, active: true, verified: true },
  { id: "branch-aoj-lasvegas", globalTeamId: "team-aoj", name: "Art of Jiu-Jitsu - Las Vegas", slug: "aoj-lasvegas", country: "USA", state: "NV", city: "Las Vegas", address: "Sahara Ave, 2500", headProfessor: "Professor AOJ LV", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 21, points: 8900, active: true, verified: true },
  { id: "branch-aoj-miami", globalTeamId: "team-aoj", name: "Art of Jiu-Jitsu - Miami", slug: "aoj-miami", country: "USA", state: "FL", city: "Miami", address: "Biscayne Blvd, 3200", headProfessor: "Professor AOJ Miami", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 28, points: 10400, active: true, verified: true },

  // FRATRES branches
  { id: "branch-fr-campinas", globalTeamId: "team-fratres", name: "Fratres - Campinas", slug: "fratres-campinas", country: "Brasil", state: "SP", city: "Campinas", address: "Rua Maria Monteiro, 1200", headProfessor: "Daniel Affonso", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 45, points: 14200, active: true, verified: true },
  { id: "branch-fr-sp", globalTeamId: "team-fratres", name: "Fratres - São Paulo", slug: "fratres-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Oscar Freire, 800", headProfessor: "Professor Fratres SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 38, points: 12000, active: true, verified: true },
  { id: "branch-fr-orlando", globalTeamId: "team-fratres", name: "Fratres - Orlando", slug: "fratres-orlando", country: "USA", state: "FL", city: "Orlando", address: "International Dr, 8100", headProfessor: "Professor Fratres Orlando", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 22, points: 9500, active: true, verified: true },

  // NOVA UNIÃO branches
  { id: "branch-nu-rj", globalTeamId: "team-nova-uniao", name: "Nova União - Rio de Janeiro HQ", slug: "nova-uniao-rj-hq", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Rua Marquês de Abrantes, 90, Flamengo", headProfessor: "Dedé Pederneiras", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 61, points: 14500, active: true, verified: true },
  { id: "branch-nu-sp", globalTeamId: "team-nova-uniao", name: "Nova União - São Paulo", slug: "nova-uniao-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Pompeia, 1500", headProfessor: "Professor NU SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 24, points: 8400, active: true, verified: true },
  { id: "branch-nu-manaus", globalTeamId: "team-nova-uniao", name: "Nova União - Manaus", slug: "nova-uniao-manaus", country: "Brasil", state: "AM", city: "Manaus", address: "Rua Silva Ramos, 80", headProfessor: "Nonato Machado", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 35, points: 11000, active: true, verified: true },
  { id: "branch-nu-lisboa", globalTeamId: "team-nova-uniao", name: "Nova União - Lisboa", slug: "nova-uniao-lisboa", country: "Portugal", state: "LIS", city: "Lisboa", address: "Rua da Prata, 10", headProfessor: "Reinaldo Ribeiro", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 18, points: 7900, active: true, verified: true },

  // CARLSON GRACIE branches
  { id: "branch-cg-rj", globalTeamId: "team-carlson-gracie", name: "Carlson Gracie Team - Rio de Janeiro HQ", slug: "carlson-rj-hq", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Rua Figueiredo de Magalhães, 414, Copacabana", headProfessor: "Carlson Gracie Jr", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 55, points: 15000, active: true, verified: true },
  { id: "branch-cg-chicago", globalTeamId: "team-carlson-gracie", name: "Carlson Gracie Team - Chicago", slug: "carlson-chicago", country: "USA", state: "IL", city: "Chicago", address: "Milwaukee Ave, 2300", headProfessor: "Professor Carlson Chicago", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 30, points: 9800, active: true, verified: true },
  { id: "branch-cg-london", globalTeamId: "team-carlson-gracie", name: "Carlson Gracie Team - London", slug: "carlson-london", country: "United Kingdom", state: "ENG", city: "London", address: "Castletown Rd, 12", headProfessor: "Simon Hayes", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 22, points: 8900, active: true, verified: true },
  { id: "branch-cg-sp", globalTeamId: "team-carlson-gracie", name: "Carlson Gracie Team - São Paulo", slug: "carlson-sp", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Moema, 120", headProfessor: "Professor Carlson SP", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 20, points: 8600, active: true, verified: true }
];

const mockIndependentAcademies = [
  { id: "independent-id-0", name: "Suave Arte Dojo São Paulo", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Alavanca, 200", headProfessor: "Sensei Mendes", logo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=150", membersCount: 34, points: 14120, active: true, verified: true },
  { id: "independent-id-1", name: "Golden Belt Academy Curitiba", country: "Brasil", state: "PR", city: "Curitiba", address: "Rua das Faixas, 432", headProfessor: "Sensei Oliveira", logo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=150", membersCount: 28, points: 10420, active: true, verified: false },
  { id: "independent-id-2", name: "Iron Guard Dojo Miami", country: "USA", state: "FL", city: "Miami", address: "Ocean Drive, 101", headProfessor: "Sensei Souza", logo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=150", membersCount: 41, points: 11890, active: true, verified: true }
];


// ==========================================
// TEST, COMPATIBILITY & HEALTH ENDPOINTS (Prevent falling through to index.html SPA fallback)
// ==========================================
router.get("/health", (req, res) => {
  console.log("🟢 [ACADEMY ROUTER] /health endpoint reached successfully!");
  return res.json({ ok: true, message: "Academy router is healthy and listening!", timestamp: new Date().toISOString() });
});

router.get("/", (req, res) => {
  console.log("🟠 [ACADEMY ROUTER] Root '/' endpoint reached!");
  return res.json({ 
    ok: true, 
    message: "Welcome to JiuSpeak Academy Router!", 
    availableEndpoints: [
      "/all-groups",
      "/debug",
      "/global-teams",
      "/independent-academies",
      "/rankings",
      "/stats",
      "/health"
    ] 
  });
});

router.get("/list", (req, res) => {
  console.log("🟡 [ACADEMY ROUTER] '/list' alias matched!");
  return res.json({
    message: "Alternative list endpoint. Use /all-groups or /global-teams to retrieve data.",
    suggestedEndpoints: ["/all-groups", "/global-teams", "/independent-academies"]
  });
});

router.get("/public", (req, res) => {
  console.log("🟡 [ACADEMY ROUTER] '/public' alias matched!");
  return res.json({
    message: "Alternative public endpoint. Use /all-groups to retrieve public academy hierarchies.",
    suggestedEndpoints: ["/all-groups"]
  });
});


// ==========================================
// 1. GET ALL OPTIONS (Helper API for dropdowns)
// ==========================================
router.get("/all-groups", async (req, res) => {
  try {
    const isOnline = await isDbOnline();
    if (!isOnline) {
      // Return custom mapped mock data to ensure correct dropdown fields
      const mappedMockGlobalTeams = mockGlobalTeams.map(t => ({
        ...t,
        logoUrl: t.logo,
        rankingPoints: t.totalPoints
      }));
      return res.json({
        globalTeams: mappedMockGlobalTeams,
        branches: mockBranches,
        independentAcademies: mockIndependentAcademies
      });
    }

    const [globalTeams, branches, independentAcademies] = await Promise.all([
      prisma.globalTeam.findMany({ select: { id: true, name: true, logo: true, totalPoints: true, countryOrigin: true, verified: true }, orderBy: { name: "asc" } }),
      prisma.academyBranch.findMany({ select: { id: true, globalTeamId: true, name: true, city: true, state: true, verified: true }, orderBy: { name: "asc" } }),
      prisma.independentAcademy.findMany({ select: { id: true, name: true, city: true, state: true, verified: true }, orderBy: { name: "asc" } })
    ]);

    const mappedGlobalTeams = globalTeams.map((t: any) => ({
      ...t,
      logoUrl: t.logo,
      rankingPoints: t.totalPoints
    }));

    res.json({ globalTeams: mappedGlobalTeams, branches, independentAcademies });
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao carregar afiliados: " + error.message });
  }
});

// ==========================================
// DEBUG DIAGNOSTICS ENDPOINT
// ==========================================
router.get("/debug", async (req, res) => {
  try {
    const isOnline = await isDbOnline();
    if (!isOnline) {
      return res.json({
        isOnline: false,
        source: "In-Memory Simulation Store",
        counts: {
          globalTeams: mockGlobalTeams.length,
          branches: mockBranches.length,
          independentAcademies: mockIndependentAcademies.length
        }
      });
    }

    const [globalTeamsCount, branchesCount, independentCount] = await Promise.all([
      prisma.globalTeam.count(),
      prisma.academyBranch.count(),
      prisma.independentAcademy.count()
    ]);

    res.json({
      isOnline: true,
      source: "PostgreSQL Production Database Engine",
      counts: {
        globalTeams: globalTeamsCount,
        branches: branchesCount,
        independentAcademies: independentCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Debug diagnostics failed: " + error.message });
  }
});

// ==========================================
// 2. GET GLOBAL TEAMS (Level 1)
// ==========================================
router.get("/global-teams", async (req, res) => {
  try {
    const isOnline = await isDbOnline();
    const { search } = req.query;

    let teamsList: any[] = [];
    if (!isOnline) {
      teamsList = [...mockGlobalTeams];
    } else {
      const where: any = {};
      if (search) {
        where.name = { contains: String(search), mode: "insensitive" };
      }
      teamsList = await prisma.globalTeam.findMany({
        where,
        orderBy: { totalPoints: "desc" }
      });
    }

    // Map each team with complete robust fields (logo, logoUrl, totalPoints, rankingPoints, etc.)
    const mappedTeams = teamsList.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logo: t.logo,
      logoUrl: t.logo || t.logoUrl,
      countryOrigin: t.countryOrigin,
      website: t.website,
      instagram: t.instagram,
      description: t.description,
      foundedYear: t.foundedYear,
      totalMembers: t.totalMembers || 0,
      totalPoints: t.totalPoints ?? t.points ?? 0,
      rankingPoints: t.totalPoints ?? t.rankingPoints ?? t.points ?? 0,
      active: t.active ?? t.verified ?? true,
      verified: t.verified ?? true
    }));

    // To prevent breaking legacy front-end, we can assign the globalTeams key on the array object, 
    // but the default JSON response remains the direct flattened array as required.
    res.json(mappedTeams);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. GET BRANCHES OF GLOBAL TEAM (Level 2)
// ==========================================
router.get("/global-teams/:id/branches", async (req, res) => {
  try {
    const teamId = req.params.id;
    const isOnline = await isDbOnline();

    let branchList: any[] = [];
    if (!isOnline) {
      branchList = mockBranches.filter(b => b.globalTeamId === teamId);
    } else {
      branchList = await prisma.academyBranch.findMany({
        where: { globalTeamId: teamId },
        orderBy: { points: "desc" }
      });
    }

    // Map elements with exact format requirements plus custom extra keys
    const mappedBranches = branchList.map(b => ({
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
      points: b.points ?? 0,
      verified: b.verified ?? true
    }));

    res.json(mappedBranches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. GET INDEPENDENT ACADEMIES (Level 3)
// ==========================================
router.get("/independent-academies", async (req, res) => {
  try {
    const isOnline = await isDbOnline();
    const { search } = req.query;

    let independentList: any[] = [];
    if (!isOnline) {
      independentList = [...mockIndependentAcademies];
    } else {
      const where: any = {};
      if (search) {
        where.name = { contains: String(search), mode: "insensitive" };
      }
      independentList = await prisma.independentAcademy.findMany({
        where,
        orderBy: { points: "desc" }
      });
    }

    const mappedIndependents = independentList.map(ind => ({
      id: ind.id,
      name: ind.name,
      country: ind.country,
      state: ind.state,
      city: ind.city,
      address: ind.address,
      headProfessor: ind.headProfessor,
      logo: ind.logo,
      points: ind.points ?? 0,
      verified: ind.verified ?? true,
      membersCount: ind.membersCount || 0
    }));

    res.json(mappedIndependents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. GET RANKINGS (World, Brazil, State, City, Branch, Independent)
// ==========================================
router.get("/rankings", async (req, res) => {
  try {
    const { country, state, city, format } = req.query;
    const isOnline = await isDbOnline();

    let worldTeamsData: any[] = [];
    let branchesData: any[] = [];
    let independentData: any[] = [];

    if (isOnline) {
      worldTeamsData = await prisma.globalTeam.findMany({
        orderBy: { totalPoints: "desc" },
        take: 20
      });
      
      const branchWhere: any = {};
      if (country) branchWhere.country = String(country);
      if (state) branchWhere.state = String(state);
      if (city) branchWhere.city = String(city);
      branchesData = await prisma.academyBranch.findMany({
        where: branchWhere,
        include: { globalTeam: { select: { name: true } } },
        orderBy: { points: "desc" },
        take: 50
      });

      const independentWhere: any = {};
      if (country) independentWhere.country = String(country);
      if (state) independentWhere.state = String(state);
      if (city) independentWhere.city = String(city);
      independentData = await prisma.independentAcademy.findMany({
        where: independentWhere,
        orderBy: { points: "desc" },
        take: 50
      });
    } else {
      worldTeamsData = [...mockGlobalTeams].sort((a,b) => b.totalPoints - a.totalPoints);
      branchesData = [...mockBranches].sort((a,b) => b.points - a.points);
      independentData = [...mockIndependentAcademies].sort((a,b) => b.points - a.points);
    }

    const mappedWorldTeams = worldTeamsData.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logo: t.logo,
      logoUrl: t.logo,
      countryOrigin: t.countryOrigin,
      website: t.website,
      instagram: t.instagram,
      description: t.description,
      foundedYear: t.foundedYear,
      totalMembers: t.totalMembers || 0,
      totalPoints: t.totalPoints ?? t.points ?? 0,
      rankingPoints: t.totalPoints ?? t.points ?? 0,
      verified: t.verified ?? true
    }));

    // If query requires a flat ranked array structure or non-filtered API request:
    if (format === "raw" || (!country && !state && !city && format !== "dashboard")) {
      const flattenedRankings = mappedWorldTeams.map((team, idx) => ({
        position: idx + 1,
        academy: team.name,
        points: team.rankingPoints
      }));
      return res.json(flattenedRankings);
    }

    // Otherwise, return full aggregated dashboard layout for modern Bento Grid UI
    res.json({
      worldTeams: mappedWorldTeams,
      branchesFiltered: branchesData,
      independentAcademies: independentData,
      filterMetadata: { country, state, city }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao gerar rankings: " + error.message });
  }
});

// ==========================================
// 6. ACCUMULATE POINTS (User action multiplier router)
// ==========================================
router.post("/points/add", authenticateToken, async (req: any, res: any) => {
  try {
    const { amount, actionName } = req.body;
    const userId = req.user.id;
    const pointsToAdd = Math.max(1, Number(amount || 10));

    const isOnline = await isDbOnline();
    if (!isOnline) {
      return res.json({
        success: true,
        message: `Offline mode: Adicionado ${pointsToAdd} pontos simulados por '${actionName || "Ação"}'`,
        pointsDispatched: pointsToAdd
      });
    }

    // Fetch user with affiliations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, globalTeamId: true, branchId: true, independentAcademyId: true, xp: true, level: true }
    });

    if (!user) {
      return res.status(404).json({ error: "Atleta não encontrado." });
    }

    // Accumulate on User (XP + Level-up formula verification)
    const newXp = (user.xp || 0) + pointsToAdd;
    const newLevel = Math.max(user.level || 1, Math.floor(Math.sqrt(newXp / 100)) + 1);

    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel
      }
    });

    // Accumulate on Branch / Global Team / Independent Academy
    if (user.branchId) {
      await prisma.academyBranch.update({
        where: { id: user.branchId },
        data: {
          points: { increment: pointsToAdd },
          membersCount: { increment: 1 } // ensure increment helper works to refresh headcounts
        }
      }).catch(() => {});
    }

    if (user.globalTeamId) {
      await prisma.globalTeam.update({
        where: { id: user.globalTeamId },
        data: {
          totalPoints: { increment: pointsToAdd },
          totalMembers: { increment: 1 }
        }
      }).catch(() => {});
    }

    if (user.independentAcademyId) {
      await prisma.independentAcademy.update({
        where: { id: user.independentAcademyId },
        data: {
          points: { increment: pointsToAdd },
          membersCount: { increment: 1 }
        }
      }).catch(() => {});
    }

    // Create activity logs entry dynamically
    await prisma.userActivityLog.create({
      data: {
        userId,
        actionType: "XP_GAIN",
        description: `Ganha ${pointsToAdd} XP pela ação: '${actionName || "Treino no Tatame"}' sincronizada com os afiliados.`
      }
    }).catch(() => {});

    // Create a social feed entry for competitive atmosphere
    await prisma.socialFeed.create({
      data: {
        userId,
        type: "XP_GAIN",
        title: `Evolução!`,
        content: `Acaba de adquirir ${pointsToAdd} pontos para si de para sua afiliação esportiva!`
      }
    }).catch(() => {});

    res.json({
      success: true,
      pointsAdded: pointsToAdd,
      userMetrics: { xp: newXp, level: newLevel },
      affiliationsSynced: {
        globalTeamId: user.globalTeamId,
        branchId: user.branchId,
        independentAcademyId: user.independentAcademyId
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Falha ao processar acumulo de pontos: " + error.message });
  }
});

// ==========================================
// 7. STATISTICS AND DASHBOARD (Bento Grid KPIs)
// ==========================================
router.get("/stats", async (req, res) => {
  try {
    const isOnline = await isDbOnline();
    if (!isOnline) {
      return res.json({
        totalGlobalTeams: mockGlobalTeams.length,
        totalBranches: mockBranches.length,
        totalIndependentAcademies: mockIndependentAcademies.length,
        verifiedGlobalTeams: mockGlobalTeams.filter(t => t.verified).length,
        verifiedBranches: mockBranches.filter(b => b.verified).length,
        verifiedIndependent: mockIndependentAcademies.filter(i => i.verified).length,
        pointsSum: mockGlobalTeams.reduce((acc, t) => acc + t.totalPoints, 0) + mockIndependentAcademies.reduce((acc, i) => acc + i.points, 0)
      });
    }

    const [gtCount, branchCount, independentCount, verifiedGtCount, verifiedBranchCount, verifiedIndependentCount, gtPointsSum, authUsers] = await Promise.all([
      prisma.globalTeam.count(),
      prisma.academyBranch.count(),
      prisma.independentAcademy.count(),
      prisma.globalTeam.count({ where: { verified: true } }),
      prisma.academyBranch.count({ where: { verified: true } }),
      prisma.independentAcademy.count({ where: { verified: true } }),
      prisma.globalTeam.aggregate({ _sum: { totalPoints: true } }),
      prisma.user.count({ where: { NOT: { globalTeamId: null } } })
    ]);

    res.json({
      totalGlobalTeams: gtCount,
      totalBranches: branchCount,
      totalIndependentAcademies: independentCount,
      verifiedGlobalTeams: verifiedGtCount,
      verifiedBranches: verifiedBranchCount,
      verifiedIndependent: verifiedIndependentCount,
      pointsSum: (gtPointsSum._sum.totalPoints || 0),
      affiliatedUsers: authUsers
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. OFFICIAL BADGE VERIFICATION CONTROL PANELS (ADMINS ONLY)
// ==========================================

// Global Team verification
router.put("/global-teams/:id/verify", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { verified } = req.body;
    const isOnline = await isDbOnline();

    if (!isOnline) {
      const team = mockGlobalTeams.find(t => t.id === req.params.id);
      if (team) team.verified = !!verified;
      return res.json({ success: true, message: `Equipe Global atualizada no cache simulado.` });
    }

    const team = await prisma.globalTeam.update({
      where: { id: req.params.id },
      data: { verified: !!verified }
    });

    res.json({ success: true, message: `Equipe '${team.name}' atualizada com sucesso para verificação: ${verified}`, team });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Branch verification
router.put("/branches/:id/verify", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { verified } = req.body;
    const isOnline = await isDbOnline();

    if (!isOnline) {
      const branch = mockBranches.find(b => b.id === req.params.id);
      if (branch) branch.verified = !!verified;
      return res.json({ success: true, message: `Filial Oficial atualizada no cache simulado.` });
    }

    const branch = await prisma.academyBranch.update({
      where: { id: req.params.id },
      data: { verified: !!verified }
    });

    res.json({ success: true, message: `Filial '${branch.name}' atualizada com sucesso para verificação: ${verified}`, branch });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Independent Academy verification
router.put("/independent-academies/:id/verify", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { verified } = req.body;
    const isOnline = await isDbOnline();

    if (!isOnline) {
      const academy = mockIndependentAcademies.find(i => i.id === req.params.id);
      if (academy) academy.verified = !!verified;
      return res.json({ success: true, message: `Academia Independente atualizada no cache simulado.` });
    }

    const academy = await prisma.independentAcademy.update({
      where: { id: req.params.id },
      data: { verified: !!verified }
    });

    res.json({ success: true, message: `Academia '${academy.name}' atualizada com sucesso para verificação: ${verified}`, academy });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
