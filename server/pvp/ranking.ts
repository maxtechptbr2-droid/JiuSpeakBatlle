import { authStore } from "../authStore";
import { getPrisma } from "../db";

export class RankingService {
  /**
   * Computes Elo Rating adjustment following standard ELO math constraints (Chess.com / LoL structure)
   * 
   * Expected: Ea = 1 / (1 + 10^((Rb - Ra) / 400))
   * Change: Ra_new = Ra + K * (Sa - Ea)
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
   * Updates user profile in-db or locally: level, xp, elo, coins
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

    // 3. Rewards configuration
    let coinsA = 15;
    let xpA = 20;
    let coinsB = 15;
    let xpB = 20;

    if (outcome === "WIN") {
      coinsA = 100;
      xpA = 150;
      coinsB = 25;
      xpB = 30;
    } else if (outcome === "LOSS") {
      coinsA = 25;
      xpA = 30;
      coinsB = 100;
      xpB = 150;
    } else {
      coinsA = 40;
      xpA = 50;
      coinsB = 40;
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

    // Process Belt Upgrades automatically on level milestones for progression fun
    const determineBelt = (level: number, currentBelt: string): any => {
      if (level >= 30) return "BLACK";
      if (level >= 22) return "BROWN";
      if (level >= 15) return "PURPLE";
      if (level >= 8) return "BLUE";
      return currentBelt; // keep existing otherwise
    };

    const nextBeltA = determineBelt(resA.nextLevel, playerA?.belt || "WHITE");
    const nextBeltB = determineBelt(resB.nextLevel, playerB?.belt || "WHITE");

    // stripes increase every 2 levels within current belt limits
    const nextStripesA = Math.min(4, Math.floor(resA.nextLevel % 7) / 2);
    const nextStripesB = Math.min(4, Math.floor(resB.nextLevel % 7) / 2);

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
      const prisma = getPrisma();
      if (prisma) {
        await prisma.auditLog.create({
          data: {
            actorId: playerAId,
            action: "PVP_MATCH_COMPLETE",
            description: `Partida PVP concluída. ELO: ${oldEloA} -> ${newEloA}. Ganhou: ${coinsA} moedas e ${xpA} XP.`
          }
        });
        await prisma.auditLog.create({
          data: {
            actorId: playerBId,
            action: "PVP_MATCH_COMPLETE",
            description: `Partida PVP concluída. ELO: ${oldEloB} -> ${newEloB}. Ganhou: ${coinsB} moedas e ${xpB} XP.`
          }
        });
      }
    } catch (err) {
      console.warn("Audit logs creation skipped or Prisma connection offline.", err);
    }

    return {
      playerA: { elo: newEloA, eloChange: changeA, coinsGained: coinsA, xpGained: xpA, levelUp: resA.levelUp },
      playerB: { elo: newEloB, eloChange: changeB, coinsGained: coinsB, xpGained: xpB, levelUp: resB.levelUp }
    };
  }
}
