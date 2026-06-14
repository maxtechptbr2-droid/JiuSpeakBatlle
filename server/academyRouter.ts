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
  { id: "team-global-id-0", name: "Gracie Barra", slug: "gracie-barra-0", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://www.graciebarra.com", instagram: "@graciebarra", description: "Liderança global de Jiu-Jitsu", foundedYear: 1986, totalMembers: 120, totalPoints: 15400, verified: true },
  { id: "team-global-id-1", name: "Alliance", slug: "alliance-1", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://www.alliancebjj.com", instagram: "@alliancebjj", description: "Multi-campeã mundial por equipes", foundedYear: 1993, totalMembers: 95, totalPoints: 12750, verified: true },
  { id: "team-global-id-2", name: "Atos Jiu-Jitsu", slug: "atos-2", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://www.atosbjj.com", instagram: "@atosbjj", description: "Inovação técnica internacional", foundedYear: 2008, totalMembers: 78, totalPoints: 10420, verified: true },
  { id: "team-global-id-3", name: "GFTeam", slug: "gfteam-3", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://www.gfteam.com", instagram: "@gfteam", description: "Força e versatilidade", foundedYear: 1996, totalMembers: 64, totalPoints: 8520, verified: false },
  { id: "team-global-id-4", name: "Checkmat", slug: "checkmat-4", logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200", countryOrigin: "Brasil", website: "https://www.checkmat.com", instagram: "@checkmat", description: "Xadrez moderno no tatame", foundedYear: 2008, totalMembers: 70, totalPoints: 9230, verified: true }
];

const mockBranches = [
  { id: "branch-id-0", globalTeamId: "team-global-id-0", name: "Gracie Barra - Headquarter São Paulo", slug: "gracie-barra-headquarter-sp-0", country: "Brasil", state: "SP", city: "São Paulo", address: "Av. Paulista, 1000", headProfessor: "Professor Gracie", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 45, points: 6500, verified: true },
  { id: "branch-id-1", globalTeamId: "team-global-id-0", name: "Gracie Barra - Rio de Janeiro", slug: "gracie-barra-rj-1", country: "Brasil", state: "RJ", city: "Rio de Janeiro", address: "Av. Atlântica, 500", headProfessor: "Professor Silva", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 52, points: 5800, verified: true },
  { id: "branch-id-2", globalTeamId: "team-global-id-1", name: "Alliance - SP HQ", slug: "alliance-sp-hq-2", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Augusta, 120", headProfessor: "Professor Gurgel", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 61, points: 8100, verified: true },
  { id: "branch-id-3", globalTeamId: "team-global-id-2", name: "Atos - San Diego HQ", slug: "atos-san-diego-hq-3", country: "USA", state: "CA", city: "San Diego", address: "Miramar Rd, 500", headProfessor: "Professor Galvão", logo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=150", membersCount: 48, points: 7200, verified: true }
];

const mockIndependentAcademies = [
  { id: "independent-id-0", name: "Suave Arte Dojo São Paulo", country: "Brasil", state: "SP", city: "São Paulo", address: "Rua Alavanca, 200", headProfessor: "Sensei Mendes", logo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=150", membersCount: 34, points: 4120, verified: true },
  { id: "independent-id-1", name: "Golden Belt Academy Curitiba", country: "Brasil", state: "PR", city: "Curitiba", address: "Rua das Faixas, 432", headProfessor: "Sensei Oliveira", logo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=150", membersCount: 28, points: 3040, verified: false },
  { id: "independent-id-2", name: "Iron Guard Dojo Miami", country: "USA", state: "FL", city: "Miami", address: "Ocean Drive, 101", headProfessor: "Sensei Souza", logo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=150", membersCount: 41, points: 4890, verified: true }
];


// ==========================================
// 1. GET ALL OPTIONS (Helper API for dropdowns)
// ==========================================
router.get("/all-groups", async (req, res) => {
  try {
    const isOnline = await isDbOnline();
    if (!isOnline) {
      return res.json({
        globalTeams: mockGlobalTeams,
        branches: mockBranches,
        independentAcademies: mockIndependentAcademies
      });
    }

    const [globalTeams, branches, independentAcademies] = await Promise.all([
      prisma.globalTeam.findMany({ select: { id: true, name: true, verified: true }, orderBy: { name: "asc" } }),
      prisma.academyBranch.findMany({ select: { id: true, globalTeamId: true, name: true, city: true, state: true, verified: true }, orderBy: { name: "asc" } }),
      prisma.independentAcademy.findMany({ select: { id: true, name: true, city: true, state: true, verified: true }, orderBy: { name: "asc" } })
    ]);

    res.json({ globalTeams, branches, independentAcademies });
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao carregar afiliados: " + error.message });
  }
});

// ==========================================
// 2. GET GLOBAL TEAMS (Level 1)
// ==========================================
router.get("/global-teams", async (req, res) => {
  try {
    const isOnline = await isDbOnline();
    if (!isOnline) {
      return res.json({ globalTeams: mockGlobalTeams });
    }

    const { search } = req.query;
    const where: any = {};
    if (search) {
      where.name = { contains: String(search), mode: "insensitive" };
    }

    const globalTeams = await prisma.globalTeam.findMany({
      where,
      orderBy: { totalPoints: "desc" }
    });

    res.json({ globalTeams });
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
    if (!isOnline) {
      const branches = mockBranches.filter(b => b.globalTeamId === teamId);
      return res.json({ branches });
    }

    const branches = await prisma.academyBranch.findMany({
      where: { globalTeamId: teamId },
      orderBy: { points: "desc" }
    });

    res.json({ branches });
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
    if (!isOnline) {
      return res.json({ independentAcademies: mockIndependentAcademies });
    }

    const { search } = req.query;
    const where: any = {};
    if (search) {
      where.name = { contains: String(search), mode: "insensitive" };
    }

    const independentAcademies = await prisma.independentAcademy.findMany({
      where,
      orderBy: { points: "desc" }
    });

    res.json({ independentAcademies });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. GET RANKINGS (World, Brazil, State, City, Branch, Independent)
// ==========================================
router.get("/rankings", async (req, res) => {
  try {
    const { country, state, city } = req.query;
    const isOnline = await isDbOnline();

    if (!isOnline) {
      // Return cached/mock ranking configurations
      return res.json({
        worldTeams: mockGlobalTeams.sort((a,b) => b.totalPoints - a.totalPoints),
        branchesFiltered: mockBranches.sort((a,b) => b.points - a.points),
        independentAcademies: mockIndependentAcademies.sort((a,b) => b.points - a.points),
        filterMetadata: { country, state, city }
      });
    }

    // 1. World Teams Ranking (Level 1)
    const worldTeams = await prisma.globalTeam.findMany({
      orderBy: { totalPoints: "desc" },
      take: 20
    });

    // 2. Headquarter/Branch Regional Rankings (Level 2)
    const branchWhere: any = {};
    if (country) branchWhere.country = String(country);
    if (state) branchWhere.state = String(state);
    if (city) branchWhere.city = String(city);

    const branchesFiltered = await prisma.academyBranch.findMany({
      where: branchWhere,
      include: { globalTeam: { select: { name: true } } },
      orderBy: { points: "desc" },
      take: 50
    });

    // 3. Independent Academies Rankings (Level 3)
    const independentWhere: any = {};
    if (country) independentWhere.country = String(country);
    if (state) independentWhere.state = String(state);
    if (city) independentWhere.city = String(city);

    const independentAcademies = await prisma.independentAcademy.findMany({
      where: independentWhere,
      orderBy: { points: "desc" },
      take: 50
    });

    res.json({
      worldTeams,
      branchesFiltered,
      independentAcademies,
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
