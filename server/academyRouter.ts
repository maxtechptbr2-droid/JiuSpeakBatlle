import { Router } from "express";
import { prisma } from "./db";
import { authenticateToken } from "./middleware/auth";
import { requireRole } from "./middleware/roles";

const router = Router();

console.log("⚡ [ACADEMY ROUTER] Módulo de Academias inicializado e carregado com dados 100% REAIS!");

router.use((req, res, next) => {
  console.log(`📡 [ACADEMY ROUTER REQUEST]: ${req.method} ${req.url}`);
  next();
});

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
    const [globalTeams, branches, independentAcademies] = await Promise.all([
      prisma.globalTeam.findMany({ 
        select: { id: true, name: true, logo: true, totalPoints: true, countryOrigin: true, verified: true }, 
        orderBy: { name: "asc" } 
      }).catch(() => []),
      prisma.academyBranch.findMany({ 
        select: { id: true, globalTeamId: true, name: true, city: true, state: true, verified: true }, 
        orderBy: { name: "asc" } 
      }).catch(() => []),
      prisma.independentAcademy.findMany({ 
        select: { id: true, name: true, city: true, state: true, verified: true }, 
        orderBy: { name: "asc" } 
      }).catch(() => [])
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
    const [globalTeamsCount, branchesCount, independentCount] = await Promise.all([
      prisma.globalTeam.count().catch(() => 0),
      prisma.academyBranch.count().catch(() => 0),
      prisma.independentAcademy.count().catch(() => 0)
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
    const { search } = req.query;

    const where: any = {};
    if (search) {
      where.name = { contains: String(search), mode: "insensitive" };
    }
    
    const teamsList = await prisma.globalTeam.findMany({
      where,
      orderBy: { totalPoints: "desc" }
    }).catch(() => []);

    const mappedTeams = teamsList.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logo: t.logo,
      logoUrl: t.logo || null,
      countryOrigin: t.countryOrigin,
      website: t.website,
      instagram: t.instagram,
      description: t.description,
      foundedYear: t.foundedYear,
      totalMembers: t.totalMembers || 0,
      totalPoints: t.totalPoints ?? 0,
      rankingPoints: t.totalPoints ?? 0,
      active: t.verified ?? true,
      verified: t.verified ?? true
    }));

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

    const branchList = await prisma.academyBranch.findMany({
      where: { globalTeamId: teamId },
      orderBy: { points: "desc" }
    }).catch(() => []);

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
    const { search } = req.query;

    const where: any = {};
    if (search) {
      where.name = { contains: String(search), mode: "insensitive" };
    }
    const independentList = await prisma.independentAcademy.findMany({
      where,
      orderBy: { points: "desc" }
    }).catch(() => []);

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

    const [worldTeamsData, branchesData, independentData] = await Promise.all([
      prisma.globalTeam.findMany({
        orderBy: { totalPoints: "desc" },
        take: 20
      }).catch(() => []),
      
      prisma.academyBranch.findMany({
        where: {
          ...(country ? { country: String(country) } : {}),
          ...(state ? { state: String(state) } : {}),
          ...(city ? { city: String(city) } : {})
        },
        include: { globalTeam: { select: { name: true } } },
        orderBy: { points: "desc" },
        take: 50
      }).catch(() => []),

      prisma.independentAcademy.findMany({
        where: {
          ...(country ? { country: String(country) } : {}),
          ...(state ? { state: String(state) } : {}),
          ...(city ? { city: String(city) } : {})
        },
        orderBy: { points: "desc" },
        take: 50
      }).catch(() => [])
    ]);

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

    if (format === "raw" || (!country && !state && !city && format !== "dashboard")) {
      const flattenedRankings = mappedWorldTeams.map((team, idx) => ({
        position: idx + 1,
        academy: team.name,
        points: team.rankingPoints
      }));
      return res.json(flattenedRankings);
    }

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
          membersCount: { increment: 1 }
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
    const [gtCount, branchCount, independentCount, verifiedGtCount, verifiedBranchCount, verifiedIndependentCount, gtPointsSum, authUsers] = await Promise.all([
      prisma.globalTeam.count().catch(() => 0),
      prisma.academyBranch.count().catch(() => 0),
      prisma.independentAcademy.count().catch(() => 0),
      prisma.globalTeam.count({ where: { verified: true } }).catch(() => 0),
      prisma.academyBranch.count({ where: { verified: true } }).catch(() => 0),
      prisma.independentAcademy.count({ where: { verified: true } }).catch(() => 0),
      prisma.globalTeam.aggregate({ _sum: { totalPoints: true } }).catch(() => ({ _sum: { totalPoints: null } })),
      prisma.user.count({ where: { NOT: { globalTeamId: null } } }).catch(() => 0)
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

    const academy = await prisma.independentAcademy.update({
      where: { id: req.params.id },
      data: { verified: !!verified }
    });

    res.json({ success: true, message: `Academia '${academy.name}' atualizada com sucesso para verificação: ${verified}`, academy });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ADMIN CAPABILITIES (POST, PUT, DELETE) FOR TEAMS AND ACADEMIES
// ==========================================

// Create Global Team
router.post("/global-teams", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { name, countryOrigin, website, instagram, description, foundedYear, verified } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const team = await prisma.globalTeam.create({
      data: {
        name,
        slug,
        logo: `https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=150`,
        countryOrigin: countryOrigin || "Brasil",
        website: website || "",
        instagram: instagram || "",
        description: description || "",
        foundedYear: Number(foundedYear) || new Date().getFullYear(),
        verified: verified !== undefined ? !!verified : true
      }
    });
    res.status(201).json({ success: true, message: `Equipe '${name}' criada com sucesso!`, team });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Academy Branch
router.post("/branches", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { globalTeamId, name, country, state, city, address, headProfessor, verified } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const branch = await prisma.academyBranch.create({
      data: {
        globalTeamId,
        name,
        slug,
        country: country || "Brasil",
        state: state || "",
        city: city || "",
        address: address || "",
        headProfessor: headProfessor || "",
        logo: `https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=150`,
        verified: verified !== undefined ? !!verified : true
      }
    });
    res.status(201).json({ success: true, message: `Filial '${name}' criada com sucesso!`, branch });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Independent Academy
router.post("/independent-academies", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { name, country, state, city, address, headProfessor, verified } = req.body;
    const academy = await prisma.independentAcademy.create({
      data: {
        name,
        country: country || "Brasil",
        state: state || "",
        city: city || "",
        address: address || "",
        headProfessor: headProfessor || "",
        logo: `https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=150`,
        verified: verified !== undefined ? !!verified : true
      }
    });
    res.status(201).json({ success: true, message: `Academia independente '${name}' criada!`, academy });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Edit Global Team
router.put("/global-teams/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { name, countryOrigin, website, instagram, description, foundedYear, verified } = req.body;
    const data: any = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    if (countryOrigin !== undefined) data.countryOrigin = countryOrigin;
    if (website !== undefined) data.website = website;
    if (instagram !== undefined) data.instagram = instagram;
    if (description !== undefined) data.description = description;
    if (foundedYear !== undefined) data.foundedYear = Number(foundedYear);
    if (verified !== undefined) data.verified = !!verified;

    const team = await prisma.globalTeam.update({
      where: { id: req.params.id },
      data
    });
    res.json({ success: true, message: `Equipe '${team.name}' atualizada!`, team });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Edit Branch (Support for Transferring Branch via globalTeamId updates)
router.put("/branches/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { globalTeamId, name, country, state, city, address, headProfessor, verified } = req.body;
    const data: any = {};
    if (globalTeamId !== undefined) data.globalTeamId = globalTeamId;
    if (name !== undefined) {
      data.name = name;
      data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    if (country !== undefined) data.country = country;
    if (state !== undefined) data.state = state;
    if (city !== undefined) data.city = city;
    if (address !== undefined) data.address = address;
    if (headProfessor !== undefined) data.headProfessor = headProfessor;
    if (verified !== undefined) data.verified = !!verified;

    const branch = await prisma.academyBranch.update({
      where: { id: req.params.id },
      data
    });
    res.json({ success: true, message: `Filial '${branch.name}' atualizada!`, branch });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Edit Independent Academy
router.put("/independent-academies/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { name, country, state, city, address, headProfessor, verified } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (country !== undefined) data.country = country;
    if (state !== undefined) data.state = state;
    if (city !== undefined) data.city = city;
    if (address !== undefined) data.address = address;
    if (headProfessor !== undefined) data.headProfessor = headProfessor;
    if (verified !== undefined) data.verified = !!verified;

    const academy = await prisma.independentAcademy.update({
      where: { id: req.params.id },
      data
    });
    res.json({ success: true, message: `Academia '${academy.name}' atualizada!`, academy });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Global Team
router.delete("/global-teams/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    await prisma.globalTeam.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Equipe deletada com sucesso!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Branch
router.delete("/branches/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    await prisma.academyBranch.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Filial deletada com sucesso!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Independent Academy
router.delete("/independent-academies/:id", authenticateToken, requireRole(["ADMIN"]), async (req, res) => {
  try {
    await prisma.independentAcademy.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Academia independente deletada com sucesso!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
