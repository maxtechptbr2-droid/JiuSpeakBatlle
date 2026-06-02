import { Server, Socket } from "socket.io";
import { bjjQuestionsPool, BJJQuestion } from "./questions";
import { RankingService } from "./ranking";
import { authStore } from "../authStore";
import { generateBotComment } from "./ai";

export interface BotConfig {
  belt: "WHITE" | "BLUE" | "PURPLE" | "BROWN" | "BLACK";
  dificuldade: "EASY" | "MEDIUM" | "HARD";
  velocidade: number;      // 1-100 (velocidade de resposta)
  agressividade: number;    // 1-100 (nível de marra/dialogo)
  inteligencia: number;     // 1-100 (precisão de acerto)
}

export interface ArenaPlayer {
  id: string;
  name: string;
  avatar: string;
  elo: number;
  socketId: string | null; // null if it is a Bot
  isBot: boolean;
  score: number;
  currentAnswer: string | null;
  currentResponseTime: number | null;
  botConfig?: BotConfig;
}

export interface ArenaState {
  matchId: string;
  playerChallenger: ArenaPlayer;
  playerDefender: ArenaPlayer;
  roundsCount: number;
  currentRound: number;
  currentQuestion: BJJQuestion | null;
  roundTimer: NodeJS.Timeout | null;
  secondsRemaining: number;
  status: "WAITING" | "ROUND_ACTIVE" | "ROUND_REVIEW" | "GAME_OVER";
  history: Array<{
    round: number;
    questionId: string;
    challengerAnswer: string | null;
    defenderAnswer: string | null;
    challengerCorrect: boolean;
    defenderCorrect: boolean;
  }>;
}

export class ArenaService {
  private static arenas: Map<string, ArenaState> = new Map();
  private static io: Server;

  static init(socketIo: Server) {
    this.io = socketIo;
  }

  static getArena(matchId: string): ArenaState | undefined {
    return this.arenas.get(matchId);
  }

  static createArena(
    matchId: string, 
    challenger: ArenaPlayer, 
    defender: ArenaPlayer
  ): ArenaState {
    const arena: ArenaState = {
      matchId,
      playerChallenger: challenger,
      playerDefender: defender,
      roundsCount: 5,
      currentRound: 0,
      currentQuestion: null,
      roundTimer: null,
      secondsRemaining: 15,
      status: "WAITING",
      history: []
    };

    this.arenas.set(matchId, arena);
    console.log(`🏟️ Arena ${matchId} criada com sucesso para ${challenger.name} VS ${defender.name}`);

    // Join players sockets to visual room if present
    const challengerSocket = this.getSocket(challenger.socketId);
    if (challengerSocket) challengerSocket.join(matchId);

    const defenderSocket = this.getSocket(defender.socketId);
    if (defenderSocket) defenderSocket.join(matchId);

    // Synchronize clients to start matching scene
    this.io.to(matchId).emit("arena:matched", {
      matchId,
      challenger,
      defender
    });

    // Stagger start round after 4s (matching animation)
    setTimeout(() => {
      this.startNextRound(matchId);
    }, 4000);

    return arena;
  }

  private static getSocket(socketId: string | null): Socket | null {
    if (!socketId) return null;
    return this.io.sockets.sockets.get(socketId) || null;
  }

  private static startNextRound(matchId: string) {
    const arena = this.arenas.get(matchId);
    if (!arena || arena.status === "GAME_OVER") return;

    // Clear any dangling interval
    if (arena.roundTimer) {
      clearInterval(arena.roundTimer);
    }

    arena.currentRound++;
    if (arena.currentRound > arena.roundsCount) {
      this.finishArena(matchId);
      return;
    }

    // Pick a random question
    const randomIndex = Math.floor(Math.random() * bjjQuestionsPool.length);
    const question = bjjQuestionsPool[randomIndex];
    arena.currentQuestion = question;
    arena.status = "ROUND_ACTIVE";
    arena.secondsRemaining = 15;

    // Reset player active states
    arena.playerChallenger.currentAnswer = null;
    arena.playerChallenger.currentResponseTime = null;
    arena.playerDefender.currentAnswer = null;
    arena.playerDefender.currentResponseTime = null;

    // Emit secure question metadata (do not include explanation or correct option)
    this.io.to(matchId).emit("arena:round_start", {
      currentRound: arena.currentRound,
      roundsCount: arena.roundsCount,
      question: {
        id: question.id,
        text: question.text,
        category: question.category,
        difficulty: question.difficulty,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD
      },
      secondsRemaining: arena.secondsRemaining
    });

    // Start Clock Tick interval
    arena.roundTimer = setInterval(() => {
      arena.secondsRemaining--;
      this.io.to(matchId).emit("arena:clock_tick", {
        secondsRemaining: arena.secondsRemaining
      });

      // Handle simulated Bot turn mid-clock if online
      if (arena.playerDefender.isBot && arena.playerDefender.currentAnswer === null) {
        const vel = arena.playerDefender.botConfig?.velocidade || 50;
        // Map speed (1-100) to round seconds left at which bot submits
        // Speed 100 -> target around 13-14s remaining. Speed 35 -> target around 6-8s remaining.
        const baseTarget = Math.round((vel / 100) * 10) + 3;
        const targetSecond = baseTarget + (Math.floor(Math.random() * 3) - 1); // small jitter
        if (arena.secondsRemaining <= targetSecond) {
          this.submitBotAnswer(matchId);
        }
      }

      if (arena.secondsRemaining <= 0) {
        this.evaluateAnswers(matchId);
      }
    }, 1000);
  }

  private static submitBotAnswer(matchId: string) {
    const arena = this.arenas.get(matchId);
    if (!arena || !arena.currentQuestion) return;

    // Accuracy draw based on inteligencia (accuracy 1-100)
    const botConfig = arena.playerDefender.botConfig;
    const accuracy = botConfig ? botConfig.inteligencia : 75;
    const isCorrect = (Math.random() * 100) < accuracy;
    
    let answer = arena.currentQuestion.correctOption;
    if (!isCorrect) {
      const wrongOptions = ["A", "B", "C", "D"].filter(opt => opt !== answer);
      answer = wrongOptions[Math.floor(Math.random() * wrongOptions.length)] as any;
    }

    const secondsElapsed = Math.max(1, 15 - arena.secondsRemaining);
    const responseTime = secondsElapsed * 1000 + Math.floor(Math.random() * 800);

    arena.playerDefender.currentAnswer = answer;
    arena.playerDefender.currentResponseTime = responseTime;

    // Check if both answered to auto-resolve early
    if (arena.playerChallenger.currentAnswer !== null) {
      this.evaluateAnswers(matchId);
    }
  }

  public static handlePlayerSubmit(
    matchId: string, 
    userId: string, 
    selectedOption: "A" | "B" | "C" | "D", 
    responseTimeMs: number
  ) {
    const arena = this.arenas.get(matchId);
    if (!arena || arena.status !== "ROUND_ACTIVE") return;

    const isChallenger = arena.playerChallenger.id === userId;
    const player = isChallenger ? arena.playerChallenger : arena.playerDefender;

    // Prevent duplicate submits
    if (player.currentAnswer !== null) return;

    player.currentAnswer = selectedOption;
    player.currentResponseTime = responseTimeMs;

    console.log(`🎯 Resposta enviada por ${player.name}: ${selectedOption} (${responseTimeMs}ms)`);

    // Broadcast that a player submitted their tactical answer
    this.io.to(matchId).emit("arena:player_answered", {
      userId,
      isChallenger
    });

    // Check if everyone has submitted
    const challengerDone = arena.playerChallenger.currentAnswer !== null;
    const defenderDone = arena.playerDefender.currentAnswer !== null || arena.playerDefender.isBot;

    if (challengerDone && defenderDone) {
      this.evaluateAnswers(matchId);
    }
  }

  private static async evaluateAnswers(matchId: string) {
    const arena = this.arenas.get(matchId);
    if (!arena || arena.status !== "ROUND_ACTIVE") return;

    // Clear timer
    if (arena.roundTimer) {
      clearInterval(arena.roundTimer);
    }

    arena.status = "ROUND_REVIEW";
    const question = arena.currentQuestion!;

    // Resolve scores
    const challengeCorrect = arena.playerChallenger.currentAnswer === question.correctOption;
    const defenderCorrect = arena.playerDefender.currentAnswer === question.correctOption;

    // Formulas: base (100 points) + speed bonus (up to 50 points based on velocity)
    const computeRewardPoints = (isCorrect: boolean, ms: number | null) => {
      if (!isCorrect || ms === null) return 0;
      const secondsLeft = Math.max(0, 15 - (ms / 1000));
      const speedBonus = Math.round((secondsLeft / 15) * 50);
      return 100 + speedBonus;
    };

    const cPoints = computeRewardPoints(challengeCorrect, arena.playerChallenger.currentResponseTime);
    const dPoints = computeRewardPoints(defenderCorrect, arena.playerDefender.currentResponseTime);

    arena.playerChallenger.score += cPoints;
    arena.playerDefender.score += dPoints;

    // Add to history
    arena.history.push({
      round: arena.currentRound,
      questionId: question.id,
      challengerAnswer: arena.playerChallenger.currentAnswer,
      defenderAnswer: arena.playerDefender.currentAnswer,
      challengerCorrect: challengeCorrect,
      defenderCorrect: defenderCorrect
    });

    // Generate dynamic AI dialogue comment
    let botComment = "";
    if (arena.playerDefender.isBot) {
      try {
        const optionKey = question.correctOption;
        let optText = "";
        if (optionKey === "A") optText = question.optionA;
        else if (optionKey === "B") optText = question.optionB;
        else if (optionKey === "C") optText = question.optionC;
        else if (optionKey === "D") optText = question.optionD;

        botComment = await generateBotComment({
          botName: arena.playerDefender.name,
          botBelt: arena.playerDefender.botConfig?.belt || "WHITE",
          botSpeed: arena.playerDefender.botConfig?.velocidade || 50,
          botAggressiveness: arena.playerDefender.botConfig?.agressividade || 50,
          botIntelligence: arena.playerDefender.botConfig?.inteligencia || 50,
          currentRound: arena.currentRound,
          questionText: question.text,
          correctOption: question.correctOption,
          correctOptionText: optText,
          challengerName: arena.playerChallenger.name,
          challengerAnswer: arena.playerChallenger.currentAnswer || "",
          challengerCorrect: challengeCorrect,
          defenderAnswer: arena.playerDefender.currentAnswer || "",
          defenderCorrect: defenderCorrect
        });
      } catch (err) {
        console.error("Falha ao computar comentário do oponente de IA:", err);
      }
    }

    // Broadcast results
    this.io.to(matchId).emit("arena:round_end", {
      currentRound: arena.currentRound,
      challengerEarned: cPoints,
      defenderEarned: dPoints,
      challengerScore: arena.playerChallenger.score,
      defenderScore: arena.playerDefender.score,
      correctOption: question.correctOption,
      explanation: question.explanation,
      challengerAnswer: arena.playerChallenger.currentAnswer,
      defenderAnswer: arena.playerDefender.currentAnswer,
      botComment: botComment || undefined
    });

    // Stagger progression after 7 seconds to let players review explanation and read bot comment safely
    setTimeout(() => {
      this.startNextRound(matchId);
    }, 7000);
  }

  private static async finishArena(matchId: string) {
    const arena = this.arenas.get(matchId);
    if (!arena) return;

    arena.status = "GAME_OVER";
    
    let winnerId: string | null = null;
    if (arena.playerChallenger.score > arena.playerDefender.score) {
      winnerId = arena.playerChallenger.id;
    } else if (arena.playerDefender.score > arena.playerChallenger.score) {
      winnerId = arena.playerDefender.id;
    }

    console.log(`🏁 Partida concluída ${matchId}. Vencedor: ${winnerId || "Empate"}`);

    // If defender is a real player, calculate ranking points
    let ratingResults = null;
    try {
      ratingResults = await RankingService.applyMatchResults(
        arena.playerChallenger.id,
        arena.playerDefender.id,
        winnerId
      );
    } catch (e) {
      console.error("Falha ao registrar ELO e recompensas financeiras/KCs", e);
    }

    this.io.to(matchId).emit("arena:game_over", {
      matchId,
      winnerId,
      challengerFinalScore: arena.playerChallenger.score,
      defenderFinalScore: arena.playerDefender.score,
      ratingResults,
      history: arena.history
    });

    // Clean memory cache after 15 seconds
    setTimeout(() => {
      this.arenas.delete(matchId);
    }, 15000);
  }

  public static handlePlayerDisconnect(userId: string) {
    // Traverse arenas detect if any are operating with this user
    for (const [matchId, arena] of this.arenas.entries()) {
      if (arena.status === "GAME_OVER") continue;

      if (arena.playerChallenger.id === userId || arena.playerDefender.id === userId) {
        console.warn(`🚨 Jogador com ID ${userId} abandonou ou desconectou durante arena ativa!`);
        
        // Define remaining player as Winner
        const winnerId = arena.playerChallenger.id === userId 
          ? arena.playerDefender.id 
          : arena.playerChallenger.id;

        // Auto-complete game
        arena.status = "GAME_OVER";
        if (arena.roundTimer) clearInterval(arena.roundTimer);

        RankingService.applyMatchResults(
          arena.playerChallenger.id,
          arena.playerDefender.id,
          winnerId
        ).then((ratingResults) => {
          this.io.to(matchId).emit("arena:abandoned", {
            abandonedId: userId,
            winnerId,
            ratingResults
          });
        }).catch(err => {
          this.io.to(matchId).emit("arena:abandoned", {
            abandonedId: userId,
            winnerId,
            ratingResults: null
          });
        });

        setTimeout(() => {
          this.arenas.delete(matchId);
        }, 5000);
      }
    }
  }
}
