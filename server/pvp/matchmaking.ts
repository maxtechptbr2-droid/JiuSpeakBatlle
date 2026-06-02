import { getRedisClient } from "./redis";
import { ArenaService, ArenaPlayer, BotConfig } from "./arena";
import { authStore } from "../authStore";

export interface QueueUser {
  userId: string;
  name: string;
  avatar: string;
  elo: number;
  socketId: string;
  joinedAt: number;
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
    const { client, isMock } = getRedisClient();
    
    // Check if already in queue, prevent duplication
    const list = await client.lrange(this.REDIS_QUEUE_KEY, 0, -1);
    if (!list.includes(user.userId)) {
      await client.rpush(this.REDIS_QUEUE_KEY, user.userId);
    }

    this.queue.set(user.userId, user);
    console.log(`➕ [FILA] Jogador ${user.name} entrou na fila de matchmaking (ELO: ${user.elo})`);
    
    // Trigger tick immediately to see if we can pair right away
    this.pairPlayers();
  }

  static async leaveQueue(userId: string) {
    const { client } = getRedisClient();
    await client.lrem(this.REDIS_QUEUE_KEY, 0, userId);
    this.queue.delete(userId);
    console.log(`➖ [FILA] Jogador de id ${userId} saiu da fila.`);
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

  private static async pairPlayers() {
    const { client } = getRedisClient();
    const queuedIds: string[] = await client.lrange(this.REDIS_QUEUE_KEY, 0, -1);

    if (queuedIds.length < 2) return;

    // Fetch details of all queued players ready contextually
    const activeCandidates: QueueUser[] = [];
    for (const uid of queuedIds) {
      const u = this.queue.get(uid);
      if (u) {
        activeCandidates.push(u);
      }
    }

    // Sort by ELO for alignment pairing
    activeCandidates.sort((a, b) => a.elo - b.elo);

    // Look for pairings within acceptable threshold delta (starts at 200, relaxes by 50 for every 5s waiting)
    for (let i = 0; i < activeCandidates.length - 1; i++) {
      const p1 = activeCandidates[i];
      const p2 = activeCandidates[i+1];

      const eloDiff = Math.abs(p1.elo - p2.elo);
      const timeInQueueSecs = Math.floor((Date.now() - Math.min(p1.joinedAt, p2.joinedAt)) / 1000);
      
      // Dynamic ELO bracket relaxation over time
      const allowableBracket = 200 + (timeInQueueSecs * 15);

      if (eloDiff <= allowableBracket) {
        // MATCH MADE! Remove from queue and construct arena
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
          currentResponseTime: null
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
          currentResponseTime: null
        };

        ArenaService.createArena(matchId, challenger, defender);
        // Recurse to handle multiple potential pairs
        this.pairPlayers();
        break;
      }
    }
  }

  /**
   * Spawns an instant match against an automated computer Bot
   */
  static async spawnBotMatch(userId: string, requestedBelt?: string): Promise<string> {
    const user = this.queue.get(userId);
    if (!user) {
      // Fetch profile directly
      const profile = await authStore.findById(userId);
      if (!profile) throw new Error("Usuário não encontrado.");
      
      this.queue.set(userId, {
        userId,
        name: profile.name || "Offline Athlete",
        avatar: profile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
        elo: profile.elo || 1000,
        socketId: "direct",
        joinedAt: Date.now()
      });
    }

    const p = this.queue.get(userId)!;
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
      // Pick based on user ELO
      const userElo = p.elo;
      if (userElo < 1100) beltKey = "WHITE";
      else if (userElo < 1400) beltKey = "BLUE";
      else if (userElo < 1700) beltKey = "PURPLE";
      else if (userElo < 2000) beltKey = "BROWN";
      else beltKey = "BLACK";
    }

    const template = BOT_TEMPLATES[beltKey];

    // Build Bot Profile
    const botElo = Math.max(100, Math.round(template.baseElo + (Math.random() * 100 - 50)));
    const botName = template.name;
    const botAvatar = template.avatar;

    const matchId = `arena_bot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const challenger: ArenaPlayer = {
      id: p.userId,
      name: p.name,
      avatar: p.avatar,
      elo: p.elo,
      socketId: p.socketId,
      isBot: false,
      score: 0,
      currentAnswer: null,
      currentResponseTime: null
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
    return matchId;
  }
}
