import { authStore, patchUserObjectWithDeterministicAvatar, inMemoryUsers } from "../authStore";
import { prisma, isDatabaseConnected } from "../db";

// Belt Priority Map (BLACK -> BROWN -> PURPLE -> BLUE -> WHITE)
// RED is mapped higher than BLACK just in case it appears.
export const BELT_PRIORITY: Record<string, number> = {
  RED: 6,
  BLACK: 5,
  BROWN: 4,
  PURPLE: 3,
  BLUE: 2,
  WHITE: 1
};

export const REGIONS = ["Sudeste", "Sul", "Nordeste", "Norte", "Centro-Oeste", "Internacional"];

export function getUserRegion(userId: string): string {
  const hash = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return REGIONS[hash % REGIONS.length];
}

export function calculateRankScore(elo: number, level: number, stripes: number): number {
  return (elo * 0.5) + (level * 50) + (stripes * 25);
}

export class RankingService {
  /**
   * Computes Elo Rating adjustment following standard ELO math constraints
   */
  static calculateElo(ratingA: number, ratingB: number, outcome: "WIN" | "LOSS" | "DRAW"): { changeA: number; changeB: number } {
    const K = 32; // standard K-Factor
    
    const Ea = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const Eb = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

    let Sa = 0.5;
    let Sb = 0.5;

    if (outcome === "WIN") {
      Sa = 1;
      Sb = 0;
    } else if (outcome === "LOSS") {
      Sa = 0;
      Sb = 1;
    }

    const changeA = Math.round(K * (Sa - Ea));
    const changeB = Math.round(K * (Sb - Eb));

    return { changeA, changeB };
  }

  /**
   * Updates user profile in-db or locally: level, xp, elo, coins.
   * FIX: Removed automatic belt and stripe promotions ("Faixas evoluem automaticamente" fixed).
   */
  static async applyMatchResults(
    playerAId: string, 
    playerBId: string, 
    winnerId: string | null
  ): Promise<{
    playerA: { elo: number; eloChange: number; coinsGained: number; xpGained: number; levelUp: boolean };
    playerB: { elo: number; eloChange: number; coinsGained: number; xpGained: number; levelUp: boolean };
  }> {
    // 1. Fetch profiles
    const playerA = await authStore.findById(playerAId);
    const playerB = await authStore.findById(playerBId);

    const oldEloA = playerA?.elo || 1000;
    const oldEloB = playerB?.elo || 1000;

    let outcome: "WIN" | "LOSS" | "DRAW" = "DRAW";
    if (winnerId === playerAId) outcome = "WIN";
    else if (winnerId === playerBId) outcome = "LOSS";

    // 2. Compute rating changes
    const { changeA, changeB } = this.calculateElo(oldEloA, oldEloB, outcome);

    const newEloA = Math.max(100, oldEloA + changeA);
    const newEloB = Math.max(100, oldEloB + changeB);

    // 3. Rewards configuration (JT is exclusively bought; users gain 0 JT from PvP)
    let coinsA = 0;
    let xpA = 20;
    let coinsB = 0;
    let xpB = 20;

    if (outcome === "WIN") {
      coinsA = 0;
      xpA = 150;
      coinsB = 0;
      xpB = 30;
    } else if (outcome === "LOSS") {
      coinsA = 0;
      xpA = 30;
      coinsB = 0;
      xpB = 150;
    } else {
      coinsA = 0;
      xpA = 50;
      coinsB = 0;
      xpB = 50;
    }

    // Process Level-ups
    const processXpAndLevel = (currentXp: number, currentLevel: number, gainedXp: number) => {
      let nextXp = currentXp + gainedXp;
      let nextLevel = currentLevel;
      let levelUp = false;
      
      const xpNeeded = 1000; // standard XP milestone threshold per level
      if (nextXp >= xpNeeded) {
        nextLevel += Math.floor(nextXp / xpNeeded);
        nextXp = nextXp % xpNeeded;
        levelUp = true;
      }

      return { nextXp, nextLevel, levelUp };
    };

    const resA = processXpAndLevel(playerA?.xp || 0, playerA?.level || 1, xpA);
    const resB = processXpAndLevel(playerB?.xp || 0, playerB?.level || 1, xpB);

    // FIX: Belts and stripes DO NOT automatically transition during standard match play.
    const nextBeltA = playerA?.belt || "WHITE";
    const nextBeltB = playerB?.belt || "WHITE";
    const nextStripesA = playerA?.stripes || 0;
    const nextStripesB = playerB?.stripes || 0;

    // 4. Update databases safely
    if (playerA) {
      await authStore.updateUser(playerAId, {
        elo: newEloA,
        coins: (playerA.coins || 0) + coinsA,
        xp: resA.nextXp,
        level: resA.nextLevel,
        belt: nextBeltA,
        stripes: Math.floor(nextStripesA)
      });
    }

    if (playerB) {
      await authStore.updateUser(playerBId, {
        elo: newEloB,
        coins: (playerB.coins || 0) + coinsB,
        xp: resB.nextXp,
        level: resB.nextLevel,
        belt: nextBeltB,
        stripes: Math.floor(nextStripesB)
      });
    }

    // Audit logs entry if Prisma exists
    try {
      await prisma.auditLog.create({
          data: {
            actorId: playerAId,
            action: "PVP_MATCH_COMPLETE",
            description: `Partida PVP concluída. ELO: ${oldEloA} -> ${newEloA}. Ganhou: ${coinsA} JiuTickets e ${xpA} XP.`
          }
        });
        await prisma.auditLog.create({
          data: {
            actorId: playerBId,
            action: "PVP_MATCH_COMPLETE",
            description: `Partida PVP concluída. ELO: ${oldEloB} -> ${newEloB}. Ganhou: ${coinsB} JiuTickets e ${xpB} XP.`
          }
        });
    } catch (err) {
      console.warn("Audit logs creation skipped or Prisma connection offline.", err);
    }

    return {
      playerA: { elo: newEloA, eloChange: changeA, coinsGained: coinsA, xpGained: xpA, levelUp: resA.levelUp },
      playerB: { elo: newEloB, eloChange: changeB, coinsGained: coinsB, xpGained: xpB, levelUp: resB.levelUp }
    };
  }

  /**
   * Enterprise-grade Ranking Engine
   * Generates highly optimized leaderboards for Global, Regional, Weekly, and Monthly ladders.
   */
  static async getLeaderboardData(
    type: "global" | "regional" | "mensal" | "semanal",
    targetRegion?: string,
    skip: number = 0,
    take: number = 50
  ): Promise<{ list: any[]; totalCount: number }> {
    try {
      let queryUsers: any[] = [];
      const frameMap = new Map<string, any>();
      const recentEloGains = new Map<string, number>();

      if (!isDatabaseConnected()) {
        const rawUsers = Array.from(inMemoryUsers.values());
        queryUsers = rawUsers.map((u) => patchUserObjectWithDeterministicAvatar({ ...u }));
      } else {
        try {
          // 1. Fetch active users (with select optimization)
          const rawUsers = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              elo: true,
              belt: true,
              level: true,
              stripes: true,
              avatar: true
            }
          });
          queryUsers = rawUsers.map((u) => patchUserObjectWithDeterministicAvatar({ ...u }));

          const forbiddenPatterns = ["fighter_", "bot_", "npc_", "player_", "fake", "test", "demo", "mock"];
          queryUsers = queryUsers.filter((u: any) => {
            const nameLower = String(u.name || "").toLowerCase();
            const emailLower = String(u.email || "").toLowerCase();
            
            const isForbidden = forbiddenPatterns.some(pat => {
              if (pat.endsWith("_")) {
                return nameLower.startsWith(pat) || emailLower.startsWith(pat) || nameLower.includes(pat) || emailLower.includes(pat);
              }
              return nameLower.includes(pat) || emailLower.includes(pat);
            });
            return !isForbidden;
          });

          // 2. Fetch cosmetic frames currently equipped (batch request)
          const userIds = queryUsers.map((u) => u.id);
          const equippedItems = await (prisma.inventoryItem as any).findMany({
            where: {
              inventory: {
                userId: { in: userIds }
              },
              isEquipped: true,
              product: {
                category: "FRAME"
              }
            },
            include: {
              inventory: true,
              product: true
            }
          });

          equippedItems.forEach((item: any) => {
            if (item.inventory?.userId) {
              frameMap.set(item.inventory.userId, {
                id: item.product?.id || item.id,
                name: item.name,
                rarity: item.product?.rarity || item.rarity,
                description: item.description,
                imageUrl: item.product?.imageUrl || item.imageUrl
              });
            }
          });

          // 3. If type is "mensal" or "semanal", fetch recent match historical outcomes to compute performance
          if (type === "mensal" || type === "semanal") {
            const daysLimit = type === "semanal" ? 7 : 30;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysLimit);

            const recentMatches = await prisma.pvpMatch.findMany({
              where: {
                status: "COMPLETED",
                createdAt: { gte: startDate }
              },
              select: {
                challengerId: true,
                defenderId: true,
                winnerId: true,
                eloChangeChallenger: true,
                eloChangeDefender: true
              }
            });

            recentMatches.forEach((m) => {
              if (m.winnerId) {
                // challenger gain
                const chGain = m.eloChangeChallenger ? Math.max(0, m.eloChangeChallenger) : 0;
                const defGain = m.eloChangeDefender ? Math.max(0, m.eloChangeDefender) : 0;

                recentEloGains.set(m.challengerId, (recentEloGains.get(m.challengerId) || 0) + chGain);
                recentEloGains.set(m.defenderId, (recentEloGains.get(m.defenderId) || 0) + defGain);
              }
            });
          }
        } catch (dbErr: any) {
          console.warn("⚠️ Banco de dados offline ou indisponível em getLeaderboardData. Usando dados em memória:", dbErr.message || dbErr);
          const rawUsers = Array.from(inMemoryUsers.values());
          queryUsers = rawUsers.map((u) => patchUserObjectWithDeterministicAvatar({ ...u }));
        }
      }

      // Map users to display objects with pre-calculated custom metrics
      let list = queryUsers.map((u) => {
        const beltStr = String(u.belt).toUpperCase();
        const baseScore = calculateRankScore(u.elo, u.level, u.stripes);
        const region = getUserRegion(u.id);
        const equippedFrame = frameMap.get(u.id) || null;

        // Custom scoring rules as per tier instruction
        let finalScore = baseScore;
        if (type === "semanal" || type === "mensal") {
          // Dynamic calculation: historical activity + 5% background base tie-breaker
          const recentGains = recentEloGains.get(u.id) || 0;
          finalScore = (recentGains * 2) + (baseScore * 0.05);
        }

        return {
          id: u.id,
          name: u.name,
          username: u.username || "",
          elo: u.elo,
          belt: u.belt,
          level: u.level,
          stripes: u.stripes,
          score: Math.round(finalScore * 10) / 10,
          region,
          avatar: u.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(u.name)}`,
          equippedFrame
        };
      });

      // 4. Implement Filtering for Regional Ranking
      if (type === "regional") {
        if (targetRegion) {
          list = list.filter((u) => u.region.toLowerCase() === targetRegion.toLowerCase());
        }
      }

      // 5. Apply the professional Olympic / BJJ Heroes sorting priority:
      // - Belt Rank Priority desc (Black -> Brown -> Purple -> Blue -> White)
      // - Computed Score desc
      // - Base ELO desc
      list.sort((a, b) => {
        const priorityA = BELT_PRIORITY[String(a.belt).toUpperCase()] || 0;
        const priorityB = BELT_PRIORITY[String(b.belt).toUpperCase()] || 0;

        if (priorityB !== priorityA) {
          return priorityB - priorityA; // Highest belt priority first
        }
        if (b.score !== a.score) {
          return b.score - a.score; // Highest custom score first
        }
        return b.elo - a.elo; // Tie breaker on base ELO
      });

      // Attach overall position ranks
      list = list.map((item, idx) => ({
        ...item,
        rankIndex: idx + 1
      }));

      const totalCount = list.length;
      const paginatedList = list.slice(skip, skip + take);

      return { list: paginatedList, totalCount };
    } catch (err: any) {
      console.warn("⚠️ Processamento do getLeaderboardData finalizado com fallback:", err.message || err);
      return { list: [], totalCount: 0 };
    }
  }
}
