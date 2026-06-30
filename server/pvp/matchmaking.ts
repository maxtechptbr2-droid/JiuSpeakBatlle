import { getRedisClient } from "./redis";
import { ArenaService, ArenaPlayer } from "./arena";
import { authStore } from "../authStore";
import { logPvP } from "../logger";
import { prisma, getPrisma, isDatabaseConnected } from "../db";

export interface QueueUser {
  userId: string;
  name: string;
  avatar: string;
  elo: number;
  socketId: string;
  joinedAt: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  level?: number;
  role?: string;
  equippedFrame?: any;
}

export class MatchmakingService {
  private static queue: Map<string, QueueUser> = new Map();
  private static ticker: NodeJS.Timeout | null = null;
  private static REDIS_QUEUE_KEY = "jiuspeak:pvp:matchmaking_queue_3";

  static init() {
    console.log("⚔️ MatchmakingService iniciado e monitorando a fila PVP.");
    this.startTicker();
  }

  static async enterQueue(user: QueueUser) {
    const { client } = getRedisClient();
    
    // Check if already in queue, prevent duplication
    const list = await client.lrange(this.REDIS_QUEUE_KEY, 0, -1);
    if (!list.includes(user.userId)) {
      await client.rpush(this.REDIS_QUEUE_KEY, user.userId);
    }

    this.queue.set(user.userId, user);
    console.log(`➕ [FILA] Jogador ${user.name} entrou na fila de matchmaking (ELO: ${user.elo}, Cidade: ${user.city || "N/A"}, Estado: ${user.state || "N/A"})`);
    logPvP("QUEUE_JOIN", user.userId, { name: user.name, elo: user.elo });
    
    // Trigger tick immediately
    this.pairPlayers();
  }

  static async leaveQueue(userId: string) {
    const { client } = getRedisClient();
    await client.lrem(this.REDIS_QUEUE_KEY, 0, userId);
    this.queue.delete(userId);
    console.log(`➖ [FILA] Jogador de id ${userId} saiu da fila.`);
    logPvP("QUEUE_LEAVE", userId);
  }

  static getQueueStatus(userId: string): { position: number; count: number } | null {
    const players = Array.from(this.queue.values());
    const index = players.findIndex(p => p.userId === userId);
    if (index === -1) return null;
    return {
      position: index + 1,
      count: players.length
    };
  }

  private static startTicker() {
    if (this.ticker) return;

    this.ticker = setInterval(() => {
      this.pairPlayers();
    }, 2500); // scan every 2.5 seconds
  }

  /**
   * Safe transaction debit of 5.000 JT upon match confirmation.
   * Professors pay 0 JT.
   */
  static async chargePvpFee(userId: string): Promise<boolean> {
    try {
      const userObj = await authStore.findById(userId);
      if (!userObj) return false;


      // Admins, Teachers e Instructors são gratuitos
      if (userObj.role === "INSTRUCTOR" || userObj.role === "TEACHER" || userObj.role === "ADMIN") {
        console.log(`[PVP FEE] Usuário ${userObj.name} é ${userObj.role}, combate PvP gratuito.`);
        return true;
      }

      // Trial: 3 batalhas gratuitas
      const pvpUsed = (userObj as any).pvpFreeMatchesUsed || 0;
      const aiExpiry = (userObj as any).aiConversationExpiresAt ? new Date((userObj as any).aiConversationExpiresAt) : null;
      const hasActiveSub = aiExpiry && aiExpiry.getTime() > Date.now();
      if (!hasActiveSub && pvpUsed < 3) {
        const newCount = pvpUsed + 1;
        const db = getPrisma();
        if (db) {
          await db.user.update({ where: { id: userId }, data: { pvpFreeMatchesUsed: newCount } }).catch((e: any) => console.error("[PVP TRIAL] Erro banco:", e.message));
        }
        await authStore.updateUser(userId, { pvpFreeMatchesUsed: newCount } as any);
        console.log(`[PVP FEE] Trial: ${userObj.name} usou ${newCount}/3 batalhas gratuitas.`);
        return true;
      }

      const cost = 5000;
      const balanceJT = (userObj as any).coins || 0;
      if (balanceJT < cost) {
        console.log(`[PVP FEE] Usuário ${userObj.name} possui saldo insuficiente (${balanceJT} JT). Requer ${cost} JT.`);
        return false;
      }
      if (prisma) {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({
            where: { userId },
            data: { balanceJT: { decrement: cost } }
          });
          await tx.auditLog.create({
            data: {
              actorId: userId,
              action: "MARKETPLACE_BUY",
              description: `Tarifa de Entrada na Arena PvP descontada com sucesso: -${cost} JT.`
            }
          });
        });
      }

      // Update local memory store
      const updatedBalance = balanceJT - cost;
      await authStore.updateUser(userId, { coins: updatedBalance });
      console.log(`[PVP FEE] Atleta ${userObj.name} pago com sucesso (-5.000 JT). Novo saldo: ${updatedBalance} JT.`);
      return true;
    } catch (err) {
      console.error("[PVP FEE] Erro ao cobrar tarifa PvP:", err);
      return false;
    }
  }

  /**
   * Refunder helper in case of matchmaking pairing failures
   */
  static async refundPvpFee(userId: string) {
    try {
      const userObj = await authStore.findById(userId);
      if (!userObj) return;
      if (userObj.role === "INSTRUCTOR") return;

      const cost = 5000;
      if (prisma) {
        await prisma.wallet.update({
          where: { userId },
          data: { balanceJT: { increment: cost } }
        });
      }
      await authStore.updateUser(userId, { coins: (userObj.coins || 0) + cost });
      console.log(`[PVP FEE REFUND] Reembolsados ${cost} JTs para ${userObj.name} devido a falha no adversário.`);
    } catch (err) {
      console.error("[PVP FEE REFUND] Erro ao reembolsar tarifa:", err);
    }
  }

  /**
   * Helper to compute geographic sorting hierarchy
   * Priority: Same City (1) -> Same State (2) -> Same Country (3) -> International (4)
   */
  private static getGeoTier(p1: QueueUser, p2: QueueUser): number {
    const c1 = p1.city?.toLowerCase().trim();
    const c2 = p2.city?.toLowerCase().trim();
    const s1 = p1.state?.toLowerCase().trim();
    const s2 = p2.state?.toLowerCase().trim();
    const co1 = p1.country?.toLowerCase().trim() || "brasil";
    const co2 = p2.country?.toLowerCase().trim() || "brasil";

    if (c1 && c2 && c1 === c2 && s1 && s2 && s1 === s2 && co1 === co2) {
      return 1; // mesma cidade
    }
    if (s1 && s2 && s1 === s2 && co1 === co2) {
      return 2; // mesmo estado
    }
    if (co1 === co2) {
      return 3; // mesmo país
    }
    return 4; // internacional
  }

  private static async pairPlayers() {
    const { client } = getRedisClient();
    const queuedIds: string[] = await client.lrange(this.REDIS_QUEUE_KEY, 0, -1);

    if (queuedIds.length < 1) return;

    // Fetch details of all queued players ready contextually
    const activeCandidates: QueueUser[] = [];
    for (const uid of queuedIds) {
      const u = this.queue.get(uid);
      if (u) {
        activeCandidates.push(u);
      }
    }

    if (activeCandidates.length === 0) return;

    // 1. Sort candidates chronologically (the one waiting the longest gets processed first)
    activeCandidates.sort((a, b) => a.joinedAt - b.joinedAt);

    for (const p1 of activeCandidates) {
      const waitTimeSecs = Math.floor((Date.now() - p1.joinedAt) / 1000);

      // 2. CHECK WAIT LIMIT (60 seconds)
      // Se não encontrar jogador em 60s, "BOT liberado!" -> Match with BOT immediately
      if (waitTimeSecs >= 60) {
        console.log(`⏰ [PVP MATCH] Tempo limite de 60s excedido para ${p1.name}. Ativando BOT SIMULADOR.`);
        await this.leaveQueue(p1.userId);
        
        try {
          await this.spawnBotMatch(p1.userId);
        } catch (err: any) {
          console.error(`Erro ao startar combate bot para ${p1.name}:`, err);
        }
        // Reprocess the rest
        this.pairPlayers();
        return;
      }

      // Find the best human partner p2 for p1
      const potentialPartners = activeCandidates.filter(c => c.userId !== p1.userId);
      if (potentialPartners.length === 0) continue;

      // 3. SORT PARTNERS BY STRICT SPECIFIED PRIORITIES:
      // - Proximidade geográfica (mesma cidade -> mesmo estado -> mesmo país -> internacional)
      // - Tempo na fila (tempo maior na fila tem prioridade para desengargalar)
      // - Nível/ELO semelhante
      potentialPartners.sort((a, b) => {
        const tierA = this.getGeoTier(p1, a);
        const tierB = this.getGeoTier(p1, b);
        if (tierA !== tierB) return tierA - tierB; // menor tier geográfico primeiro

        // mais tempo na fila primeiro
        if (a.joinedAt !== b.joinedAt) return a.joinedAt - b.joinedAt;

        // ELO semelhante
        return Math.abs(p1.elo - a.elo) - Math.abs(p1.elo - b.elo);
      });

      // Scan sorted candidates and pair with the first one that matches the ELO bracket
      const allowableBracket = 200 + (waitTimeSecs * 15);

      for (const p2 of potentialPartners) {
        const eloDiff = Math.abs(p1.elo - p2.elo);

        if (eloDiff <= allowableBracket) {
          // MATCH MADE! Deduct PvP Fee from both first (match confirmed)
          const p1Charged = await this.chargePvpFee(p1.userId);
          if (!p1Charged) {
            // Remove from queue due to insufficient JT
            await this.leaveQueue(p1.userId);
            // Sockets should be notified via error
            const p1Socket = ArenaService.getSocket ? ArenaService.getSocket(p1.socketId) : null;
            if (p1Socket) {
              p1Socket.emit("matchmaking:error", { error: "Você precisa adquirir JT para entrar na Arena PvP. Cada combate custa 5.000 JT." });
            }
            break; // restart loop
          }

          const p2Charged = await this.chargePvpFee(p2.userId);
          if (!p2Charged) {
            // Refund p1!
            await this.refundPvpFee(p1.userId);
            // Remove p2 from queue
            await this.leaveQueue(p2.userId);
            const p2Socket = ArenaService.getSocket ? ArenaService.getSocket(p2.socketId) : null;
            if (p2Socket) {
              p2Socket.emit("matchmaking:error", { error: "Você precisa adquirir JT para entrar na Arena PvP. Cada combate custa 5.000 JT." });
            }
            break; // restart loop
          }

          // Both successfully paid! Complete matchmaking pairing
          await this.leaveQueue(p1.userId);
          await this.leaveQueue(p2.userId);

          const matchId = `arena_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          
          const challenger: ArenaPlayer = {
            id: p1.userId,
            name: p1.name,
            avatar: p1.avatar,
            elo: p1.elo,
            socketId: p1.socketId,
            isBot: false,
            score: 0,
            currentAnswer: null,
            currentResponseTime: null,
            equippedFrame: p1.equippedFrame || null
          };

          const defender: ArenaPlayer = {
            id: p2.userId,
            name: p2.name,
            avatar: p2.avatar,
            elo: p2.elo,
            socketId: p2.socketId,
            isBot: false,
            score: 0,
            currentAnswer: null,
            currentResponseTime: null,
            equippedFrame: p2.equippedFrame || null
          };

          ArenaService.createArena(matchId, challenger, defender);
          logPvP("MATCH_START", p1.userId, { name: p1.name, opponentId: p2.userId, opponentName: p2.name, matchId, type: "HUMAN_PVP" });

          // Emite confirmação direta nos sockets
          const s1 = ArenaService.getSocket ? ArenaService.getSocket(p1.socketId) : null;
          const s2 = ArenaService.getSocket ? ArenaService.getSocket(p2.socketId) : null;
          if (s1) s1.emit("matchmaking:matched", { matchId });
          if (s2) s2.emit("matchmaking:matched", { matchId });

          // Restart scan to clear other players
          this.pairPlayers();
          return;
        }
      }
    }
  }

  /**
   * Spawns an instant match against an automated computer Bot
   */
  static async spawnBotMatch(userId: string, requestedBelt?: string, liveSocketId?: string): Promise<string> {
    const user = this.queue.get(userId);
    let profile = user ? { ...user } : null;
    if (profile && liveSocketId) {
      profile.socketId = liveSocketId;
    }
    
    if (!profile) {
      const dbProfile = await authStore.findById(userId);
      if (!dbProfile) throw new Error("Usuário não encontrado.");
      profile = {
        userId,
        name: dbProfile.name || "Atleta Anônimo",
        avatar: dbProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
        elo: dbProfile.elo || 1000,
        socketId: liveSocketId || "direct",
        joinedAt: Date.now()
      };
    }

    // Charge the human player (match is confirmed)
    const charged = await this.chargePvpFee(userId);
    if (!charged) {
      throw new Error("Você precisa adquirir JT para entrar na Arena PvP. Cada combate custa 5.000 JT.");
    }

    await this.leaveQueue(userId);

    // Bot Config Templates
    const BOT_TEMPLATES = {
      WHITE: {
        name: "Luizinho 'Amassa-Pão'",
        belt: "WHITE" as const,
        dificuldade: "EASY" as const,
        velocidade: 35,
        agressividade: 45,
        inteligencia: 30,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=luizinho_bjj",
        baseElo: 800
      },
      BLUE: {
        name: "Renatinho 'Berimbolo'",
        belt: "BLUE" as const,
        dificuldade: "MEDIUM" as const,
        velocidade: 55,
        agressividade: 85,
        inteligencia: 50,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=renatinho_bjj",
        baseElo: 1200
      },
      PURPLE: {
        name: "Felipe 'Guarda-Lasso'",
        belt: "PURPLE" as const,
        dificuldade: "MEDIUM" as const,
        velocidade: 70,
        agressividade: 40,
        inteligencia: 75,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=felipe_bjj",
        baseElo: 1550
      },
      BROWN: {
        name: "Roberto 'Pressão-Pesada'",
        belt: "BROWN" as const,
        dificuldade: "HARD" as const,
        velocidade: 85,
        agressividade: 75,
        inteligencia: 88,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=roberto_bjj",
        baseElo: 1850
      },
      BLACK: {
        name: "Mestre Rickson AI",
        belt: "BLACK" as const,
        dificuldade: "HARD" as const,
        velocidade: 95,
        agressividade: 90,
        inteligencia: 98,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rickson_bjj",
        baseElo: 2200
      }
    };

    let beltKey: keyof typeof BOT_TEMPLATES = "WHITE";
    if (requestedBelt) {
      const uBelt = requestedBelt.toUpperCase();
      if (uBelt.includes("BRANCA") || uBelt.includes("WHITE")) beltKey = "WHITE";
      else if (uBelt.includes("AZUL") || uBelt.includes("BLUE")) beltKey = "BLUE";
      else if (uBelt.includes("ROXA") || uBelt.includes("PURPLE")) beltKey = "PURPLE";
      else if (uBelt.includes("MARROM") || uBelt.includes("BROWN")) beltKey = "BROWN";
      else if (uBelt.includes("PRETA") || uBelt.includes("BLACK")) beltKey = "BLACK";
      else beltKey = "WHITE";
    } else {
      const userElo = profile.elo;
      if (userElo < 1100) beltKey = "WHITE";
      else if (userElo < 1400) beltKey = "BLUE";
      else if (userElo < 1700) beltKey = "PURPLE";
      else if (userElo < 2000) beltKey = "BROWN";
      else beltKey = "BLACK";
    }

    const template = BOT_TEMPLATES[beltKey];

    const botElo = Math.max(100, Math.round(template.baseElo + (Math.random() * 100 - 50)));
    const botName = template.name;
    const botAvatar = template.avatar;

    const matchId = `arena_bot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const challenger: ArenaPlayer = {
      id: profile.userId,
      name: profile.name,
      avatar: profile.avatar,
      elo: profile.elo,
      socketId: profile.socketId,
      isBot: false,
      score: 0,
      currentAnswer: null,
      currentResponseTime: null,
      equippedFrame: profile.equippedFrame || null
    };

    const defender: ArenaPlayer = {
      id: `bot_${Date.now()}`,
      name: botName,
      avatar: botAvatar,
      elo: botElo,
      socketId: null,
      isBot: true,
      score: 0,
      currentAnswer: null,
      currentResponseTime: null,
      botConfig: {
        belt: template.belt,
        dificuldade: template.dificuldade,
        velocidade: template.velocidade,
        agressividade: template.agressividade,
        inteligencia: template.inteligencia
      }
    };

    ArenaService.createArena(matchId, challenger, defender);
    logPvP("MATCH_START", profile.userId, { name: profile.name, opponentId: defender.id, opponentName: defender.name, matchId, type: "BOT_PVP", templateBelt: template.belt });

    // Emite notificações imediatas para transição no frontend
    const socket = ArenaService.getSocket ? ArenaService.getSocket(profile.socketId) : null;
    if (socket) {
      socket.emit("matchmaking:bot_matched", { matchId });
    }

    return matchId;
  }
}
