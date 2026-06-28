/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sword, 
  Search, 
  Loader2, 
  ShieldAlert, 
  Flame, 
  Trophy, 
  RotateCcw, 
  Award, 
  Zap, 
  BookOpen, 
  Clock,
  User,
  Crown,
  ChevronRight,
  Sparkles,
  Volume2,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';
import { UserProfile, BeltRank } from '../types';
import { AvatarWithFrame } from './AvatarWithFrame';
import { io, Socket } from 'socket.io-client';
import { authFetch } from '../utils/authFetch';
import { removeFakeUsers } from '../utils/removeFakeUsers';

interface LeaderboardEntry {
  id: string;
  name: string;
  elo: number;
  belt: string;
  level: number;
  stripes: number;
  score: number;
  region: string;
  avatar: string;
  equippedFrame?: any;
}

const BOT_SELECT_LIST = [
  {
    key: "WHITE",
    name: "Thomas (White Belt • USA)",
    belt: "Branca",
    beltBg: "bg-white text-slate-900 border border-slate-300",
    difficulty: "EASY",
    difficultyLabel: "Fácil",
    speed: 35,
    aggressiveness: 45,
    intelligence: 30,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=thomas_usa",
    desc: "Estudante americano iniciante na sua academia. Fala de forma simples e precisa de ajuda com termos básicos."
  },
  {
    key: "BLUE",
    name: "Coach Tyler (California)",
    belt: "Azul",
    beltBg: "bg-blue-600 text-white",
    difficulty: "MEDIUM",
    difficultyLabel: "Média",
    speed: 55,
    aggressiveness: 85,
    intelligence: 50,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=tyler_cali",
    desc: "Instrutor californiano que adora usar gírias locais e termos informais do dia-a-dia do tatame."
  },
  {
    key: "PURPLE",
    name: "Yuki (Purple Belt • Japan)",
    belt: "Roxa",
    beltBg: "bg-purple-700 text-white",
    difficulty: "MEDIUM",
    difficultyLabel: "Média-Alta",
    speed: 70,
    aggressiveness: 40,
    intelligence: 75,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=yuki_tokyo",
    desc: "Atleta tática japonesa focada em discussões sobre a guarda de lapela (lapel guard mechanics)."
  },
  {
    key: "BROWN",
    name: "Referee Marcus (IBJJF Referee)",
    belt: "Marrom",
    beltBg: "bg-amber-900 text-white",
    difficulty: "HARD",
    difficultyLabel: "Alta",
    speed: 85,
    aggressiveness: 75,
    intelligence: 88,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=roberto_bjj",
    desc: "Árbitro oficial da IBJJF. Desafie-o para testar seus conhecimentos em regras e pontuações de campeonatos."
  },
  {
    key: "BLACK",
    name: "Master John (Austin • Texas)",
    belt: "Preta",
    beltBg: "bg-slate-950 text-red-505 border border-red-500",
    difficulty: "HARD",
    difficultyLabel: "Extrema",
    speed: 95,
    aggressiveness: 90,
    intelligence: 98,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=john_austin",
    desc: "Mentor internacional sênior. Ele simula diálogos filosóficos e correções didáticas de alta complexidade."
  }
];

interface PvPArenaProps {
  user: UserProfile;
  updateUser: (newUser: Partial<UserProfile>) => void;
  onAddAuditLog: (type: any, desc: string, amtBRL?: number, amtJT?: number) => void;
  addXp: (amount: number, reason: string) => void;
  addCoins: (amount: number, reason: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  setCurrentTab?: (tab: string) => void;
}

export default function PvPArena({ 
  user, 
  updateUser, 
  onAddAuditLog,
  addXp,
  addCoins,
  showToast,
  setCurrentTab
}: PvPArenaProps) {
  
  // Navigation & Real-time game state
  // 'lobby' | 'matchmaking' | 'versus' | 'match_active' | 'round_review' | 'gameover'
  const [arenaState, setArenaState] = useState<'lobby' | 'matchmaking' | 'versus' | 'match_active' | 'round_review' | 'gameover'>('lobby');
  const [selectedBotIdx, setSelectedBotIdx] = useState<number>(0);
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15);
  
  // Match participants
  const [opponent, setOpponent] = useState<{
    id: string;
    name: string;
    avatar: string;
    elo: number;
    isBot: boolean;
    equippedFrame?: any;
  } | null>(null);

  // Active round quiz details
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [roundsCount, setRoundsCount] = useState<number>(5);
  const [question, setQuestion] = useState<{
    id: string;
    text: string;
    category: string;
    difficulty: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
  } | null>(null);

  // User input responses
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [answeredCount, setAnsweredCount] = useState<{challenger: boolean, defender: boolean}>({
    challenger: false,
    defender: false
  });

  // Round resolution state
  const [roundResult, setRoundResult] = useState<{
    correctOption: string;
    explanation: string;
    challengerAnswer: string | null;
    defenderAnswer: string | null;
    challengerEarned: number;
    defenderEarned: number;
    challengerScore: number;
    defenderScore: number;
  } | null>(null);

  // Game over state
  const [gameOverResult, setGameOverResult] = useState<{
    winnerId: string | null;
    challengerFinalScore: number;
    defenderFinalScore: number;
    ratingResults: any;
    history: any[];
  } | null>(null);

  // Leaderboard data
  const [rankingType, setRankingType] = useState<'global' | 'regional' | 'mensal' | 'semanal'>('global');
  const [rankingRegion, setRankingRegion] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [matchmakingTime, setMatchmakingTime] = useState<number>(0);
  
  const matchmakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // =========================================================================
  // PREMIUM ENTERPRISE BJJ VOICE SPARRING STATES & HANDLERS
  // =========================================================================
  const [arenaTab, setArenaTab] = useState<'quiz' | 'voice_sparring'>('quiz');
  const [voiceSessions, setVoiceSessions] = useState<any[]>([]);
  const [activeVoiceSession, setActiveVoiceSession] = useState<any | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<'competição' | 'seminário' | 'sparring' | 'viagem' | 'privada'>('competição');
  const [selectedPartner, setSelectedPartner] = useState<'thomas' | 'tyler' | 'yuki' | 'roberto' | 'john'>('thomas');
  const [voiceChatOpen, setVoiceChatOpen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [micErrorText, setMicErrorText] = useState<string>('');
  const [voiceDraftText, setVoiceDraftText] = useState<string>('');
  const [audioUrlCache, setAudioUrlCache] = useState<Record<string, string>>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [nowPlayingText, setNowPlayingText] = useState<string | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array.from({ length: 15 }, () => 4));

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Poll random bars for live visual waveform animation when audio is playing or mic is recording
  useEffect(() => {
    let interval: any = null;
    if (isPlayingAudio || isRecording || aiThinking) {
      interval = setInterval(() => {
        setWaveformBars(Array.from({ length: 15 }, () => {
          if (isPlayingAudio) return Math.floor(Math.random() * 25) + 5;
          if (isRecording) return Math.floor(Math.random() * 18) + 3;
          if (aiThinking) return Math.floor(Math.random() * 10) + 2;
          return 4;
        }));
      }, 100);
    } else {
      setWaveformBars(Array.from({ length: 15 }, () => 4));
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, isRecording, aiThinking]);

  // Clean audio players on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  const fetchVoiceSessions = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await authFetch("/api/conversational/sessions");
      if (res.ok) {
        const data = await res.json();
        setVoiceSessions(data.sessions || []);
      }
    } catch (e) {
      console.error("Error fetching voice sessions history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const startNewVoiceSession = async () => {
    setAiThinking(true);
    setMicErrorText('');
    setVoiceChatOpen(true);
    try {
      const res = await authFetch("/api/conversational/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: selectedScenario, partnerKey: selectedPartner })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveVoiceSession(data.session);
        setVoiceSessions(prev => [data.session, ...prev]);
        
        // Auto play the opening coach response
        const newestMsg = data.session.history[data.session.history.length - 1];
        if (newestMsg && newestMsg.role === 'assistant') {
          playVoiceSpeech(newestMsg.text, data.session.partnerVoice);
        }
      } else {
        const errData = await res.json();
        setMicErrorText(errData.error || "Não foi possível iniciar o robô de voz BJJ.");
      }
    } catch (e) {
      setMicErrorText("Falha técnica de conexão com o servidor de voz.");
    } finally {
      setAiThinking(false);
    }
  };

  const deleteVoiceSession = async (sid: string) => {
    try {
      const res = await authFetch("/api/conversational/sessions/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid })
      });
      if (res.ok) {
        setVoiceSessions(prev => prev.filter(s => s.id !== sid));
        if (activeVoiceSession?.id === sid) {
          setActiveVoiceSession(null);
          setVoiceChatOpen(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendVoiceChatMessage = async (typedText?: string) => {
    const finalMsg = typedText || voiceDraftText;
    if (!finalMsg.trim() || !activeVoiceSession) return;

    setAiThinking(true);
    setVoiceDraftText('');
    setMicErrorText('');
    
    // Add user message to UI immediately for lightning-fast optimistic UX responsive visual
    const tempUserMsg = { role: 'user', text: finalMsg, timestamp: new Date().toISOString() };
    setActiveVoiceSession((prev: any) => ({
      ...prev,
      history: [...prev.history, tempUserMsg]
    }));

    try {
      const res = await authFetch("/api/conversational/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeVoiceSession.id, text: finalMsg })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveVoiceSession(data.session);
        
        // Dynamic ELO visual sync in UI
        const latestMsg = data.session.history[data.session.history.length - 1];
        if (latestMsg && latestMsg.eloDelta) {
          // Optimistically update parent profile data
          user.elo = (user.elo || 1000) + latestMsg.eloDelta;
          if (updateUser) {
            updateUser({ elo: user.elo });
          }
          if (addXp) {
            addXp(latestMsg.eloDelta * 2, "Voice Sparring Victory");
          }
        }

        // Auto speak the companion response
        if (latestMsg && latestMsg.role === 'assistant') {
          playVoiceSpeech(latestMsg.text, data.session.partnerVoice);
        }
        
        setVoiceSessions(prev => prev.map(s => s.id === data.session.id ? data.session : s));
      } else {
        const errData = await res.json();
        setMicErrorText(errData.error || "IA falhou ao projetar contraguarda verbal.");
      }
    } catch (e) {
      setMicErrorText("Conexão perdida com o quartel-general cognitivo BJJ.");
    } finally {
      setAiThinking(false);
    }
  };

  const playVoiceSpeech = (text: string, voice: string) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    setNowPlayingText(text);
    setIsPlayingAudio(true);

    const cacheKey = `${text}_${voice}`;
    if (audioUrlCache[cacheKey]) {
      const audio = new Audio(audioUrlCache[cacheKey]);
      audioPlayerRef.current = audio;
      audio.onended = () => {
        setIsPlayingAudio(false);
        setNowPlayingText(null);
      };
      audio.play().catch(e => {
        console.warn("Cached run ended in bypass fallbacks:", e);
        setIsPlayingAudio(false);
        setNowPlayingText(null);
      });
      return;
    }

    // Direct stream connection
    const audioUrl = `/api/conversational/stream-tts?text=${encodeURIComponent(text)}&voice=${voice}`;
    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    audio.onended = () => {
      setIsPlayingAudio(false);
      setNowPlayingText(null);
    };
    audio.play().catch(e => {
      console.warn("[TTS] Stream falhou, usando Web Speech API:", e);
    });
    // Web Speech API — gratuita, nativa, sem quota
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.88;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
                        voices.find(v => v.lang === 'en-US') ||
                        voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
        utterance.onstart = () => { setIsPlayingAudio(true); setNowPlayingText(text); };
        utterance.onend = () => { setIsPlayingAudio(false); setNowPlayingText(null); };
        utterance.onerror = () => { setIsPlayingAudio(false); setNowPlayingText(null); };
        window.speechSynthesis.speak(utterance);
      };
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
      } else {
        speak();
      }
    }

    // Save playing url reference to memory cache for instantaneous subsequent replays
    setAudioUrlCache(prev => ({ ...prev, [cacheKey]: audioUrl }));
  };

  const startListening = () => {
    setMicErrorText('');
    const SpeechLib = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechLib) {
      setMicErrorText("Seu navegador não possui suporte ao Speech API por voz. Utilize o campo de digitação.");
      return;
    }

    try {
      const rec = new SpeechLib();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setVoiceDraftText('');
      };

      rec.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setVoiceDraftText(result);
      };

      rec.onerror = (e: any) => {
        if (e.error === 'no-speech') {
          setMicErrorText("Nenhuma voz detectada. Encaixe sua pegada e fale perto do microfone!");
        } else if (e.error === 'not-allowed') {
          setMicErrorText("Permissão do microfone bloqueada pelo navegador.");
        } else {
          setMicErrorText(`Erro de captação verbal: ${e.error}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error(err);
      setMicErrorText("Falha ao preparar o driver de gravação.");
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // Fetch PostgreSQL active matches PvP ELO Leaderboard
  const fetchLeaderboard = async (type: string = rankingType, region: string = rankingRegion) => {
    setIsLoadingLeaderboard(true);
    try {
      let url = `/api/pvp/leaderboard?type=${type}`;
      if (type === 'regional' && region) {
        url += `&region=${encodeURIComponent(region)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(removeFakeUsers(data.leaderboard || []));
      } else {
        setLeaderboard([]);
      }
    } catch (e) {
      console.error(e);
      setLeaderboard([]);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(rankingType, rankingRegion);
    fetchVoiceSessions();
  }, [rankingType, rankingRegion]);

  // 1. Initialize Socket.IO connection and bind event loops of matches
  useEffect(() => {

    // Create single socket instance
    const newSocket = io({
      transports: ['websocket', 'polling'],
      autoConnect: false
    });

    newSocket.on('connect', () => {
      setConnected(true);
      // Authenticar no socket de forma segura via JWT
      const token = localStorage.getItem('jiuspeak_access_token');
      if (token) {
        newSocket.emit('auth:register', { token });
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      resetMatchStates();
    });

    newSocket.on('auth:success', (authData: any) => {
      console.log('🔌 PvP Socket devidamente autenticado com sucesso', authData);
    });

    newSocket.on('auth:error', (err: any) => {
      showToast(err.message || "Erro na autenticação de tempo real.", "error");
    });

    // Matchmaking events
    newSocket.on('matchmaking:queued', (data: any) => {
      setArenaState('matchmaking');
      setMatchmakingTime(0);
      startTimeRef.current = Date.now();
      
      if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current);
      matchmakingTimerRef.current = setInterval(() => {
        setMatchmakingTime(prev => prev + 1);
      }, 1000);

      showToast("Fila de pareamento por ELO iniciada!", "success");
    });

    newSocket.on('matchmaking:unqueued', () => {
      setArenaState('lobby');
      if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current);
      showToast("Busca por oponentes cancelada.", "info");
    });

    // Versus Found Event
    newSocket.on('arena:matched', (data: any) => {
      if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current);
      
      setMatchId(data.matchId);
      
      const isChallengerSelf = data.challenger.id === user.id;
      const matchedOpponent = isChallengerSelf ? data.defender : data.challenger;
      
      setOpponent({
        id: matchedOpponent.id,
        name: matchedOpponent.name,
        avatar: matchedOpponent.avatar,
        elo: matchedOpponent.elo,
        isBot: matchedOpponent.isBot,
        equippedFrame: matchedOpponent.equippedFrame || null
      });

      setArenaState('versus');
      showToast("Oponente Encontrado! Prepare-se para rolar!", "success");
    });

    newSocket.on('matchmaking:bot_matched', (data: any) => {
      // Fast bot match trigger
    });

    // Game loop events
    newSocket.on('arena:round_start', (data: any) => {
      setArenaState('match_active');
      setCurrentRound(data.currentRound);
      setRoundsCount(data.roundsCount);
      setQuestion(data.question);
      setSecondsRemaining(15);
      setSelectedOption(null);
      setHasSubmitted(false);
      setAnsweredCount({ challenger: false, defender: false });
      setRoundResult(null);
    });

    newSocket.on('arena:clock_tick', (data: any) => {
      setSecondsRemaining(data.secondsRemaining);
    });

    newSocket.on('arena:player_answered', (data: any) => {
      setAnsweredCount(prev => ({
        ...prev,
        challenger: prev.challenger || data.isChallenger,
        defender: prev.defender || !data.isChallenger
      }));
    });

    newSocket.on('arena:round_end', (data: any) => {
      // Sync exact selections from server
      setRoundResult(data);
      setArenaState('round_review');
    });

    newSocket.on('arena:game_over', (data: any) => {
      setArenaState('gameover');
      setGameOverResult(data);

      const won = data.winnerId === user.id;

      // Force updating local React state values dynamically
      if (data.ratingResults) {
        const isChallengerSelf = opponent?.id !== data.ratingResults.playerA?.id;
        const myRatingResults = isChallengerSelf ? data.ratingResults.playerA : data.ratingResults.playerB;
        if (myRatingResults) {
          updateUser({
            elo: myRatingResults.elo,
            winCount: user.winCount + (won ? 1 : 0),
            lossCount: user.lossCount + (!won && data.winnerId !== null ? 1 : 0),
          });
        }
      }

      if (won) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('trigger-viral-share', {
            detail: {
              type: 'vitoria_pvp',
              customTitle: 'VITÓRIA NA ARENA PVP SPARRING!'
            }
          }));
        }, 1500);
      }

      fetchLeaderboard();
    });

    newSocket.on('arena:abandoned', (data: any) => {
      setArenaState('gameover');
      showToast("O oponente desconectou ou bateu por desistência!", "info");
      
      const won = data.winnerId === user.id;

      setGameOverResult({
        winnerId: data.winnerId,
        challengerFinalScore: 100,
        defenderFinalScore: 0,
        ratingResults: data.ratingResults,
        history: []
      });

      if (data.ratingResults) {
        updateUser({
          elo: user.elo + 25,
          winCount: user.winCount + 1
        });
      }

      if (won) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('trigger-viral-share', {
            detail: {
              type: 'vitoria_pvp',
              customTitle: 'VITÓRIA POR DESISTÊNCIA NA ARENA!'
            }
          }));
        }, 1500);
      }

      fetchLeaderboard();
    });

    newSocket.on('matchmaking:error', (err: any) => {
      showToast(err.error || "Ocorreu um erro no servidor de matchmaking.", "error");
    });

    newSocket.connect();
    setSocket(newSocket);

    return () => {
      if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current);
      newSocket.disconnect();
    };
  }, []);

  const resetMatchStates = () => {
    setMatchId(null);
    setOpponent(null);
    setQuestion(null);
    setSelectedOption(null);
    setHasSubmitted(false);
    setRoundResult(null);
    setGameOverResult(null);
  };

  // Trigger entering matchmaking queue
  const joinMatchmakingQueue = () => {
    const pvpUsed = (user as any).pvpFreeMatchesUsed || 0;
    const aiExpiry = user.aiConversationExpiresAt ? new Date(user.aiConversationExpiresAt) : null;
    const isAiSubscriptionActive = (aiExpiry && aiExpiry.getTime() > Date.now()) || user.role === 'admin' || user.role === 'professor' || pvpUsed < 3;
    if (!isAiSubscriptionActive) {
      showToast(`Você usou suas 3 batalhas gratuitas! Ative a Arena PvP com 5.000 JT para continuar.`, "info");
      if (setCurrentTab) setCurrentTab('subscriptions');
      return;
    }
    if (!socket || !connected) {
      showToast("Reconectando serviços em tempo real...", "info");
      socket?.connect();
      return;
    }
    socket.emit('matchmaking:join');
  };

  // Leave queue
  const leaveMatchmakingQueue = () => {
    socket?.emit('matchmaking:leave');
  };

  // Quick bot session
  const joinBotMatch = (belt?: string) => {
    const pvpUsed = (user as any).pvpFreeMatchesUsed || 0;
    const aiExpiry = user.aiConversationExpiresAt ? new Date(user.aiConversationExpiresAt) : null;
    const isAiSubscriptionActive = (aiExpiry && aiExpiry.getTime() > Date.now()) || user.role === 'admin' || user.role === 'professor' || pvpUsed < 3;
    if (!isAiSubscriptionActive) {
      showToast(`Você usou suas 3 batalhas gratuitas! Ative a Arena com 5.000 JT para continuar.`, "info");
      if (setCurrentTab) setCurrentTab('subscriptions');
      return;
    }

    if (!socket || !connected) {
      showToast("Conexão indisponível.", "error");
      return;
    }
    socket.emit('matchmaking:fast_bot_join', { belt });
    setArenaState('matchmaking');
    setMatchmakingTime(0);
    showToast("Gerando arena de treino contra IA...", "info");
  };

  // Active round submission choice
  const submitAnswer = (option: "A" | "B" | "C" | "D") => {
    if (hasSubmitted || !socket || !matchId) return;

    setSelectedOption(option);
    setHasSubmitted(true);

    const timeDiff = 15 - secondsRemaining;
    const responseTimeMs = Math.round(timeDiff * 1000);

    socket.emit('arena:submit_answer', {
      matchId,
      selectedOption: option,
      responseTimeMs
    });
  };

  const getBeltBg = (beltStr: string) => {
    const b = beltStr.toUpperCase();
    if (b === 'WHITE' || b === 'BRANCA') return 'bg-white text-slate-900 border border-slate-300';
    if (b === 'BLUE' || b === 'AZUL') return 'bg-indigo-650 text-white';
    if (b === 'PURPLE' || b === 'ROXA') return 'bg-purple-700 text-white';
    if (b === 'BROWN' || b === 'MARROM') return 'bg-amber-900 text-white';
    if (b === 'BLACK' || b === 'PRETO') return 'bg-slate-900 border border-red-500 text-red-500';
    return 'bg-slate-800 text-slate-200';
  };

  const getBeltLabel = (beltStr: string) => {
    const b = beltStr.toUpperCase();
    if (b === 'WHITE') return 'Branca';
    if (b === 'BLUE') return 'Azul';
    if (b === 'PURPLE') return 'Roxa';
    if (b === 'BROWN') return 'Marrom';
    if (b === 'BLACK') return 'Preta';
    return beltStr;
  };

  return (
    <div className="space-y-6" id="bjj-pvp-arena">
      
      {/* ==========================================
          STATE LOBBY - PORTAL INICIAL STYLE CHESS.COM
          ========================================== */}
      {arenaState === 'lobby' && (
        <div className="space-y-6">
          {/* Main Mode Tabs */}
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-900 max-w-sm">
            <button
              onClick={() => setArenaTab('quiz')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-display tracking-wider transition-all duration-200 gap-1.5 flex items-center justify-center cursor-pointer ${
                arenaTab === 'quiz'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-750 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sword className="w-3 h-3" /> Duelos / PvP
            </button>
            <button
              onClick={() => {
                setArenaTab('voice_sparring');
                fetchVoiceSessions();
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-display tracking-wider transition-all duration-200 gap-1.5 flex items-center justify-center cursor-pointer ${
                arenaTab === 'voice_sparring'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-650 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="relative flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 mr-0.5"></span>
              Voice Sparring 🗣️
            </button>
          </div>

          {arenaTab === 'quiz' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Esquerda: Painel de Jogo */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-850 space-y-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-650/10 rounded-full blur-3xl -z-10" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-semibold tracking-wider uppercase">
                      PVP ONLINE EM TEMPO REAL
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-black text-white leading-tight">
                    Arena de Conversação & Vocabulário 🗣️
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-xl">
                    Pratique seu inglês sob o contexto real do tatame. Teste seus reflexos de vocabulário e tomadas de decisão estruturadas de forma dinâmica! Cada acerto consolida seus pontos de proficiência (ELO), concede JiuTickets escolares e acelera sua progressão de faixa.
                  </p>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl shrink-0 text-center w-full sm:w-auto">
                  <span className="block text-[9px] text-slate-500 font-mono tracking-wider">ELO DE FLUÊNCIA</span>
                  <span className="text-2xl font-black text-indigo-400 tracking-tight font-mono">{user.elo || 1000}</span>
                  <span className="block text-[8px] text-slate-405 font-mono mt-0.5">{user.belt === 'Branca' ? 'White Belt' : user.belt === 'Azul' ? 'Blue Belt' : user.belt === 'Roxa' ? 'Purple Belt' : user.belt === 'Marrom' ? 'Brown Belt' : 'Black Belt'}</span>
                </div>
              </div>

              {/* Conditional upgrade awareness banners invitation */}
              {(() => {
                const pvpUsedUI = (user as any).pvpFreeMatchesUsed || 0;
                const aiExpiryUI = user.aiConversationExpiresAt ? new Date(user.aiConversationExpiresAt) : null;
                const isAiSubscriptionActive = (aiExpiryUI && aiExpiryUI.getTime() > Date.now()) || user.role === 'admin' || user.role === 'professor' || pvpUsedUI < 3;
                if (!isAiSubscriptionActive) {
                  return (
                    <div className="bg-gradient-to-r from-indigo-950/40 to-slate-950 border border-indigo-500/20 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
                      <div className="space-y-1.5 flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] bg-indigo-500/10 text-[#009dff] font-mono font-extrabold uppercase tracking-widest border border-indigo-500/20">JIUSPEAK IA COPILOT</span>
                        </div>
                        <h4 className="font-display font-extrabold text-sm text-slate-200">Prática Conversacional Premium IA</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Acesse treinamentos avançados em inglês de tatame, simulações realistas e diálogos inteligentes integrados com nossa IA de última geração. Você tem <strong className="text-amber-400">{3 - ((user as any).pvpFreeMatchesUsed || 0)} batalha(s) gratuita(s) restante(s)</strong>. O acesso ilimitado custa <strong className="text-[#009dff]">5.000 JT / mês</strong>.
                        </p>
                      </div>
                      {setCurrentTab && (
                        <button
                          onClick={() => setCurrentTab('subscriptions')}
                          className="px-5 py-2.5 bg-gradient-to-tr from-[#009dff] to-indigo-600 hover:from-indigo-600 hover:to-[#009dff] text-slate-900 hover:text-white font-mono font-extrabold uppercase tracking-wider text-xs rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,157,255,0.2)] shrink-0 w-full md:w-auto cursor-pointer"
                        >
                          Ativar Assinatura IA
                        </button>
                      )}
                    </div>
                  );
                } else if (pvpUsedUI < 3 && !(aiExpiryUI && aiExpiryUI.getTime() > Date.now()) && user.role !== 'admin' && user.role !== 'professor') {
                  // Trial ativo — mostrar contador com aviso claro
                  const remaining = 3 - pvpUsedUI;
                  return (
                    <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fadeIn">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-2xl">🎁</span>
                        <div className="flex flex-col">
                          <span className="text-amber-400 font-black text-xs uppercase tracking-widest">Trial Gratuito</span>
                          <span className="text-amber-300 font-mono font-black text-xl leading-none">{remaining}/3</span>
                          <span className="text-amber-500/70 text-[9px] font-mono">batalhas restantes</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Você tem <strong className="text-amber-400">{remaining} batalha(s) gratuita(s)</strong> para experimentar a Arena de Conversação com IA. Após isso, o acesso custa <strong className="text-[#009dff]">5.000 JT / 30 dias</strong>.
                        </p>
                      </div>
                      {setCurrentTab && remaining <= 1 && (
                        <button
                          onClick={() => setCurrentTab('subscriptions')}
                          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-mono font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all shrink-0 cursor-pointer"
                        >
                          Adquirir JiuTickets
                        </button>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3.5 animate-fadeIn">
                      <span className="text-xl shrink-0 text-emerald-400">✓</span>
                      <div className="space-y-1 text-left">
                        <h5 className="font-bold text-xs text-emerald-400">Sua Assinatura de IA está Ativa!</h5>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Aproveite o acesso completo e ilimitado para treinar seu inglês de tatame, voz natural com IA e disputar na arena PVP do JiuSpeak.
                        </p>
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Botões de Ação para Ingressar em Partida */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                 {/* 1. Quick Play contra IA Bot Selecionável */}
                 <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-805 hover:border-slate-800 transition duration-250 flex flex-col justify-between space-y-4">
                   <div>
                     <div className="flex items-center gap-2.5 mb-3">
                       <div className="w-8 h-8 bg-indigo-950/40 rounded-lg border border-indigo-505/20 flex items-center justify-center text-md">
                         🤖
                       </div>
                       <div>
                         <h4 className="font-display font-extrabold text-xs text-slate-200">Prática Conversacional com IA</h4>
                         <p className="text-[10px] text-slate-400">Selecione um parceiro de treino internacional:</p>
                       </div>
                     </div>
 
                     {/* Horizontal Selector Buttons representing Belts */}
                     <div className="grid grid-cols-5 gap-1 mb-3.5">
                       {BOT_SELECT_LIST.map((bot, idx) => {
                         const isSel = selectedBotIdx === idx;
                         let btnBg = "bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400";
                         if (isSel) {
                           if (bot.key === "WHITE") btnBg = "bg-white text-slate-950 border border-slate-300 font-bold scale-102";
                           else if (bot.key === "BLUE") btnBg = "bg-blue-605 text-white font-bold scale-102";
                           else if (bot.key === "PURPLE") btnBg = "bg-purple-700 text-white font-bold scale-102";
                           else if (bot.key === "BROWN") btnBg = "bg-amber-900 text-white font-bold scale-102";
                           else if (bot.key === "BLACK") btnBg = "bg-slate-950 text-red-500 border border-red-500/80 font-bold scale-102";
                         }
                         return (
                           <button
                             key={bot.key}
                             type="button"
                             onClick={(e) => { e.preventDefault(); setSelectedBotIdx(idx); }}
                             className={`py-1.5 text-[9px] uppercase font-mono rounded-lg transition-all tracking-wider font-semibold cursor-pointer ${btnBg}`}
                             title={bot.name}
                           >
                             {bot.belt.substring(0, 5)}
                           </button>
                         );
                       })}
                     </div>
 
                     {/* Selected Bot Detailed Card Preview */}
                     {(() => {
                       const activeBot = BOT_SELECT_LIST[selectedBotIdx];
                       return (
                         <div className="bg-slate-950/80 border border-slate-850/80 p-3.5 rounded-xl space-y-3">
                           <div className="flex items-center gap-3">
                             <img 
                               src={activeBot.avatar} 
                               alt={activeBot.name} 
                               className="w-10 h-10 rounded-lg border border-slate-800 bg-slate-905 shrink-0 object-cover"
                               referrerPolicy="no-referrer"
                             />
                             <div className="leading-tight overflow-hidden">
                               <span className={`inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded mb-1.5 ${activeBot.beltBg}`}>
                                 {activeBot.belt === 'Branca' ? 'White Belt' : activeBot.belt === 'Azul' ? 'Blue Belt' : activeBot.belt === 'Roxa' ? 'Purple Belt' : activeBot.belt === 'Marrom' ? 'Brown Belt' : 'Black Belt'}
                               </span>
                               <h5 className="font-display font-extrabold text-xs text-white truncate">{activeBot.name}</h5>
                             </div>
                           </div>
 
                           <p className="text-[10px] text-slate-400 leading-normal italic pb-2 border-b border-slate-900">
                             "{activeBot.desc}"
                           </p>
 
                           {/* Bot Attributes meters */}
                           <div className="space-y-1.5 pt-1 text-[9px] font-mono">
                             {/* Inteligência */}
                             <div className="space-y-0.5">
                               <div className="flex justify-between text-slate-500">
                                 <span>PRECISÃO DIDÁTICA</span>
                                 <span className="text-slate-350 font-bold">{activeBot.intelligence}%</span>
                               </div>
                               <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${activeBot.intelligence}%` }} />
                               </div>
                             </div>
 
                             {/* Velocidade */}
                             <div className="space-y-0.5">
                               <div className="flex justify-between text-slate-500">
                                 <span>RITMO DE CONVERSAÇÃO</span>
                                 <span className="text-slate-350 font-bold">{activeBot.speed}%</span>
                               </div>
                               <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                 <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeBot.speed}%` }} />
                               </div>
                             </div>
 
                             {/* Agressividade */}
                             <div className="space-y-0.5">
                               <div className="flex justify-between text-slate-500">
                                 <span>REQUISITOS TÉCNICOS</span>
                                 <span className="text-slate-350 font-bold">{activeBot.aggressiveness}%</span>
                               </div>
                               <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                 <div className="h-full bg-red-500 rounded-full" style={{ width: `${activeBot.aggressiveness}%` }} />
                               </div>
                             </div>
                           </div>
                         </div>
                       );
                     })()}
                   </div>
                   
                   <button
                     onClick={() => joinBotMatch(BOT_SELECT_LIST[selectedBotIdx].key)}
                     className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold font-display text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-md shadow-indigo-650/10"
                   >
                     <Play className="w-3 h-3 fill-current" /> Praticar com {BOT_SELECT_LIST[selectedBotIdx].name.split(' (')[0]}
                   </button>
                 </div>

                {/* 2. PVP Matchmaking com Faturamento Real */}
                <div className="bg-gradient-to-br from-indigo-950/20 to-slate-950 p-5 rounded-2xl border border-indigo-950/30 hover:border-indigo-500/30 transition duration-250 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 text-[50px] opacity-10 select-none">🚨</div>
                  <div>
                    <div className="w-10 h-10 bg-violet-950/50 rounded-xl border border-violet-500/30 flex items-center justify-center text-xl mb-3 text-violet-400">
                      <Sword className="w-5 h-5" />
                    </div>
                    <h4 className="font-display font-extrabold text-sm text-white">Sessão Online com Outros Alunos</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Conecte-se com alunos reais em ambiente síncrono. O pareamento buscará no banco de dados parceiros com o nível de conversação mais próximo ao seu.
                    </p>
                  </div>
                  <button
                    onClick={joinMatchmakingQueue}
                    className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold font-display text-xs transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/30 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Sword className="w-3.5 h-3.5" /> Encontrar Parceiro de Conversação
                  </button>
                </div>

              </div>

              {/* Banner Instruções */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850/80 text-[11px] text-slate-400 flex items-start gap-3">
                <span className="text-base shrink-0">💡</span>
                <p className="leading-normal">
                  <strong>Estrutura Temática:</strong> Cada simulação consiste em 5 assaltos rápidos com questões práticas focadas em jargões de tatame, comandos de arbitragem (IBJJF), regras oficiais de campeonatos internacionais e conversação em viagens. Responda rápido e com precisão para turbinar sua fluência!
                </p>
              </div>

            </div>
          </div>

          {/* Direita: Chess.com Style Leaderboard */}
          <div className="space-y-6">
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-850 backdrop-blur-md space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h4 className="font-display font-extrabold text-sm text-slate-205">Ranking de Fluência (Score BJJ)</h4>
                </div>
                <button 
                  onClick={() => fetchLeaderboard(rankingType, rankingRegion)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-305 transition font-mono cursor-pointer"
                >
                  Atualizar
                </button>
              </div>

              {/* Leaderboard Type Selector Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/70 rounded-xl border border-slate-855">
                {(['global', 'regional', 'mensal', 'semanal'] as const).map((tab) => {
                  const isActive = rankingType === tab;
                  const label = tab === 'global' ? 'Global' : tab === 'regional' ? 'Regional' : tab === 'mensal' ? 'Mensal' : 'Semanal';
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setRankingType(tab);
                        if (tab !== 'regional') setRankingRegion('');
                      }}
                      className={`py-1.5 px-0.5 rounded-lg text-[9px] font-display font-bold transition-all duration-200 cursor-pointer text-center truncate ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Special Controls for Regional selection */}
              {rankingType === 'regional' && (
                <div className="flex gap-1.5 items-center justify-between pb-1 animate-fadeIn">
                  <span className="text-[10px] text-slate-400 font-medium">Filtrar Região:</span>
                  <select
                    value={rankingRegion}
                    onChange={(e) => setRankingRegion(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-[10px] rounded px-2 py-1 text-slate-250 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono cursor-pointer"
                  >
                    <option value="">Todas Regiões</option>
                    <option value="Sudeste">Sudeste</option>
                    <option value="Sul">Sul</option>
                    <option value="Nordeste">Nordeste</option>
                    <option value="Norte">Norte</option>
                    <option value="Centro-Oeste">Centro-Oeste</option>
                    <option value="Internacional">Internacional</option>
                  </select>
                </div>
              )}

              {isLoadingLeaderboard ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-medium font-sans">
                  Ranking ainda não possui atletas cadastrados.
                </div>
              ) : (
                <div className="divide-y divide-slate-900 max-h-96 overflow-y-auto pr-1">
                  {leaderboard.map((player, idx) => {
                    const isSelf = player.id === user.id;
                    const trophyColor = idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-600' : 'text-slate-600';
                    return (
                      <div 
                        key={player.id} 
                        className={`flex items-center justify-between py-2 px-1.5 transition rounded-lg ${isSelf ? 'bg-indigo-950/20 border border-indigo-950' : 'hover:bg-slate-900/10'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          {idx < 3 ? (
                            <Trophy className={`w-3.5 h-3.5 font-bold ${trophyColor}`} />
                          ) : (
                            <span className="w-3.5 text-center text-[10px] font-mono text-slate-500">{idx + 1}</span>
                          )}
                          <AvatarWithFrame
                            avatarUrl={player.profilePhoto || player.avatar}
                            userName={player.name}
                            frame={player.equippedFrame}
                            size="xs"
                          />
                          <div className="leading-tight">
                            <span className={`block text-[11px] font-semibold truncate max-w-[110px] ${isSelf ? 'text-indigo-300' : 'text-slate-350'}`}>
                               {player.name} {isSelf && "(Você)"}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`inline-block text-[7px] font-black uppercase px-1 rounded-sm ${getBeltBg(player.belt)}`}>
                                {getBeltLabel(player.belt)}
                              </span>
                              {player.stripes > 0 && (
                                <span className="text-[7.5px] font-black text-amber-500 font-mono" title={`${player.stripes} Graus`}>
                                  {player.stripes}G
                                </span>
                              )}
                              {player.region && (
                                <span className="text-[7.5px] font-medium text-slate-500 truncate max-w-[50px]" title={player.region}>
                                  {player.region}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right leading-tight min-w-[70px]">
                          <span className="block text-xs font-extrabold font-mono text-indigo-400" title="Score de Ranking (Score BJJ)">
                            {player.score || player.elo} <span className="text-[8px] text-slate-500 font-normal">pts</span>
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono">
                            {player.elo} ELO • Lvl {player.level || 1}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Voice Sparring Header Banner */}
              <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-850 space-y-4 relative overflow-hidden backdrop-blur-md text-left">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-650/5 rounded-full blur-3xl -z-10" />
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                      Pioneiro em IA Conversacional
                    </span>
                    <h3 className="text-xl font-display font-black text-white leading-tight mt-1">
                      Voice Sparring BJJ 🗣️
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      Dobre seus reflexos verbais e de pronúncia em inglês! Treine conversando de viva voz com professores e adversários internacionais sob cenários reais do jiu-jitsu profissional.
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl text-center shrink-0 w-full sm:w-auto">
                    <span className="block text-[8px] text-slate-500 font-mono tracking-wider">SEU ELO ATUAL</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">{user.elo || 1000}</span>
                  </div>
                </div>

                {/* Scenario Select Row */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 font-extrabold tracking-wider">
                    Passo 1: Selecione o Cenário do Rolo
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { key: 'competição', label: 'Match Day', icon: '🏆', desc: 'Finais da IBJJF' },
                      { key: 'seminário', label: 'Seminário', icon: '📖', desc: 'Detalhes mecânicos' },
                      { key: 'sparring', label: 'Sparring', icon: '🥋', desc: 'Durante o rolo' },
                      { key: 'viagem', label: 'Intercâmbio', icon: '✈️', desc: 'White gi policy & fees' },
                      { key: 'privada', label: 'Aula Privada', icon: '🎯', desc: '1-on-1 premium coaching' }
                    ].map((scenario) => {
                      const isSelected = selectedScenario === scenario.key;
                      return (
                        <button
                          key={scenario.key}
                          onClick={() => setSelectedScenario(scenario.key as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/30 border-emerald-500/60 text-white shadow-md shadow-emerald-950/10'
                              : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-205'
                          }`}
                        >
                          <span className="text-lg mb-1">{scenario.icon}</span>
                          <span className="text-[10px] font-bold font-display leading-tight truncate w-full">{scenario.label}</span>
                          <span className="text-[8px] text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap w-full">{scenario.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Companion/Partner Selector row */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 font-extrabold tracking-wider">
                    Passo 2: Escolha seu Companheiro de Treino
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {[
                      { key: 'thomas', name: 'Thomas (White Belt)', origin: 'USA', difficulty: 'Fácil', attr: 'Thomas_USA', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=thomas_usa' },
                      { key: 'tyler', name: 'Tyler (Média)', origin: 'Cali', difficulty: 'Média', attr: 'Tyler_Cali', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=tyler_cali' },
                      { key: 'yuki', name: 'Yuki (Guarda)', origin: 'Tokyo', difficulty: 'Alta', attr: 'Yuki_Tokyo', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=yuki_tokyo' },
                      { key: 'roberto', name: 'Roberto (Intenso)', origin: 'London', difficulty: 'Média', attr: 'Roberto_BJJ', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=roberto_bjj' },
                      { key: 'john', name: 'John (Preta)', origin: 'Austin', difficulty: 'Preta', attr: 'John_Austin', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=john_austin' }
                    ].map((p) => {
                      const isSelected = selectedPartner === p.key;
                      return (
                        <button
                          key={p.key}
                          onClick={() => setSelectedPartner(p.key as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-950/30 border-indigo-500/60 text-white shadow-md shadow-indigo-950/10'
                              : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-205'
                          }`}
                        >
                          <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-md bg-slate-950 mb-1.5 border border-slate-850" referrerPolicy="no-referrer" />
                          <span className="text-[10px] font-bold font-display leading-tight">{p.name}</span>
                          <span className="text-[8px] text-indigo-400 font-mono mt-0.5">{p.difficulty}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subscribed Access rules logic verification */}
                {(() => {
                  const isAiSubscriptionActive = (user.aiConversationExpiresAt ? new Date(user.aiConversationExpiresAt).getTime() > Date.now() : false) || user.role === 'admin';
                  if (!isAiSubscriptionActive) {
                    return (
                      <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-[10px] text-amber-500 font-mono flex items-center gap-1">
                          ⚠️ Assinatura IA necessária para treinar com áudio em tempo real.
                        </span>
                        {setCurrentTab && (
                          <button
                            onClick={() => setCurrentTab('subscriptions')}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] font-mono uppercase tracking-wider font-extrabold text-white cursor-pointer"
                          >
                            Ir para Assinatura IA
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="pt-4 border-t border-slate-905 flex justify-end">
                      <button
                        onClick={startNewVoiceSession}
                        disabled={aiThinking}
                        className="px-6 py-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {aiThinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>🗣️ Iniciar Treino de Voz</span>}
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* History list of current voice sessions */}
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2 font-display text-sm font-extrabold text-slate-200">
                  <span>🕰️ Seus Treinos de Voz Anteriores</span>
                  <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-normal font-mono">
                    {voiceSessions.length} sessões salvas
                  </span>
                </div>

                {isLoadingHistory ? (
                  <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    Carregando tatame conversacional...
                  </div>
                ) : voiceSessions.length === 0 ? (
                  <div className="bg-slate-950/20 p-8 rounded-xl border border-dashed border-slate-850 text-center text-xs text-slate-500">
                    Nenhum simulado de voz recente. Selecione as diretrizes acima e entre no tatame de voz!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {voiceSessions.map((session) => (
                      <div key={session.id} className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition flex items-center justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono uppercase bg-emerald-955 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                              {session.scenario}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{session.partnerName}</span>
                            <span className="text-[9px] text-indigo-400">({session.history?.length || 0} turnos)</span>
                          </div>
                          {session.history?.length > 0 && (
                            <p className="text-[11px] text-slate-400 truncate italic">
                              "{session.history[session.history.length - 1].text}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setActiveVoiceSession(session);
                              setVoiceChatOpen(true);
                              const lastMsg = session.history.filter((m: any) => m.role === 'assistant').pop();
                              if (lastMsg) {
                                playVoiceSpeech(lastMsg.text, session.partnerVoice);
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono px-3 py-1.5 rounded-lg font-bold cursor-pointer transition uppercase"
                          >
                            Retomar
                          </button>
                          <button
                            onClick={() => deleteVoiceSession(session.id)}
                            className="p-1.5 bg-slate-900 hover:bg-red-950/50 hover:text-red-400 text-slate-500 rounded-lg cursor-pointer transition-all border border-slate-850"
                            title="Excluir histórico"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          STATE MATCHMAKING - PROCURANDO OPONENTE RADAR
          ========================================== */}
      {arenaState === 'matchmaking' && (
        <div className="bg-slate-950/60 p-12 rounded-3xl border border-slate-850 text-center space-y-8 max-w-md mx-auto animate-fadeIn backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-[0.03]">
            <Sword className="w-96 h-96" />
          </div>

          {/* Radar effect container */}
          <div className="relative inline-block mt-4">
            <div className="w-24 h-24 rounded-full border border-indigo-500/25 flex items-center justify-center animate-pulse">
              <div className="w-20 h-20 rounded-full border border-indigo-500/40 flex items-center justify-center animate-ping absolute" />
              <div className="w-16 h-16 rounded-full bg-indigo-950/30 border border-indigo-500/50 flex items-center justify-center text-4xl shadow-inner">
                🥋
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-display font-black text-white uppercase tracking-wider animate-pulse">
              Pareando Tatames...
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal">
              Buscando atletas próximos ao seu nível (<strong className="text-indigo-405">{user.elo - 200} - {user.elo + 200} ELO</strong>) na cache de alta performance PostgreSQL (Prisma).
            </p>
          </div>

          {/* Matchmaking timer counters */}
          <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-2xl max-w-xs mx-auto">
            <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">Tempo de Espera</span>
            <span className="text-2xl font-mono font-bold text-white block mt-1">
              {Math.floor(matchmakingTime / 60)}:{(matchmakingTime % 60).toString().padStart(2, '0')}
            </span>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Aproximando brackets de tolerância tática...</p>
          </div>

          {/* Fast single action bypass */}
          <div className="pt-2 space-y-3">
            {matchmakingTime >= 5 && (
              <button
                onClick={() => joinBotMatch()}
                className="w-full py-2 bg-indigo-950 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-500/50 text-xs font-mono rounded-xl transition duration-200 cursor-pointer"
              >
                ⚡ Matchmaking demorando? Jogar Solo contra Bot (Criar Arena)
              </button>
            )}
            
            <button
              onClick={leaveMatchmakingQueue}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-405 hover:text-white text-xs font-mono rounded-xl transition duration-200 cursor-pointer"
            >
              Cancelar Ingressão & Sair
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          STATE VERSUS - COMPARATOR 2 PLAYERS PRE-MATCH
          ========================================== */}
      {arenaState === 'versus' && opponent && (
        <div className="bg-slate-950/70 p-8 rounded-3xl border border-slate-850 space-y-8 max-w-3xl mx-auto backdrop-blur-md animate-fadeIn shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-650/[0.03] rounded-full blur-3xl -z-10" />

          <div className="text-center">
            <span className="bg-red-950 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-black animate-pulse">
              Tatame Selecionado! Combate Iminente
            </span>
            <h4 className="text-2xl font-display font-black text-white mt-3 uppercase tracking-tight">VERSUS APRESENTAÇÃO</h4>
          </div>

          {/* Comparator Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
            
            {/* Challenger Card */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-805 text-center space-y-4 flex flex-col items-center">
              <AvatarWithFrame
                avatarUrl={user.profilePhoto || user.avatar}
                userName={user.name}
                frame={user.equippedFrame}
                size="lg"
                className="mx-auto"
              />
              <div>
                <p className="font-display font-black text-sm text-slate-200 uppercase truncate">{user.name}</p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${getBeltBg(user.belt)}`}>
                    🥋 {user.belt}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Lvl. {user.level}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-850">
                <span className="block text-[9px] text-slate-500 font-mono">CHALLENGER ELO</span>
                <span className="text-base font-black font-mono text-indigo-400">{user.elo || 1000} PTS</span>
              </div>
            </div>

            {/* Middle Section: VS separator bar */}
            <div className="text-center space-y-1.5 py-4 md:py-0">
              <div className="w-14 h-14 bg-red-500/10 border-2 border-red-500/30 text-red-500 rounded-full flex items-center justify-center font-display font-black text-xl mx-auto shadow-lg shadow-red-500/5 animate-bounce">
                VS
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Divisão Absoluto</p>
              <div className="inline-flex items-center gap-1 bg-slate-900 px-3 py-1 rounded-full border border-slate-850">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-wider font-semibold">TICK-CLOCK...</span>
              </div>
            </div>

            {/* Defender Card */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-805 text-center space-y-4 flex flex-col items-center">
              <AvatarWithFrame
                avatarUrl={opponent.profilePhoto || opponent.avatar}
                userName={opponent.name}
                frame={opponent.equippedFrame}
                size="lg"
                className="mx-auto"
              />
              <div>
                <p className="font-display font-black text-sm text-slate-200 uppercase truncate">{opponent.name}</p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${getBeltBg(opponent.isBot ? 'Preto' : 'Azul')}`}>
                    🥋 {opponent.isBot ? 'Preto' : 'Lutador'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{opponent.isBot ? "COMP" : "PVP"}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-850">
                <span className="block text-[9px] text-slate-500 font-mono">DEFENDER ELO</span>
                <span className="text-base font-black font-mono text-yellow-500">{opponent.elo} PTS</span>
              </div>
            </div>

          </div>

          <div className="py-2 text-center text-xs text-slate-400 font-mono animate-pulse">
            Iniciando primeiro assalto regulamentar... prepare sua postura!
          </div>
        </div>
      )}

      {/* ==========================================
          STATE MATCH ACTIVE - CHESS MULTIPLE CHOICE QUIZ
          ========================================== */}
      {arenaState === 'match_active' && question && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Esquerda: A pergunta ativa */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950/70 p-6 rounded-3xl border border-slate-850 backdrop-blur-md space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-650/[0.04] rounded-full blur-3xl -z-10" />

              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div className="leading-tight">
                  <span className="text-[10px] bg-indigo-950 border border-indigo-500/30 font-mono font-bold text-indigo-400 px-2 py-0.5 rounded uppercase">
                    Assalto {currentRound} de {roundsCount}
                  </span>
                  <p className="text-[11px] text-slate-500 font-mono mt-1">Categoria: {question.category}</p>
                </div>

                {/* Clock indicator */}
                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold leading-none shrink-0 ${secondsRemaining <= 4 ? 'bg-red-950/30 border-red-500 text-red-400 animate-bounce' : 'bg-slate-900 border-slate-800 text-slate-200'}`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{secondsRemaining}s</span>
                </div>
              </div>

              {/* Pergunta Text */}
              <div className="py-4">
                <h4 className="text-base md:text-lg font-display font-bold text-white leading-relaxed">
                  {question.text}
                </h4>
              </div>

              {/* Opções de Respostas */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { key: "A", text: question.optionA },
                  { key: "B", text: question.optionB },
                  { key: "C", text: question.optionC },
                  { key: "D", text: question.optionD }
                ].map((opt) => {
                  const isSelected = selectedOption === opt.key;
                  return (
                    <button
                      key={opt.key}
                      disabled={hasSubmitted}
                      onClick={() => submitAnswer(opt.key as any)}
                      className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                        hasSubmitted
                          ? (isSelected 
                              ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 font-semibold ring-2 ring-indigo-500/10' 
                              : 'bg-slate-950/40 border-slate-900 text-slate-550 opacity-50 cursor-not-allowed')
                          : 'bg-slate-905 border-slate-805 hover:border-indigo-500/50 hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer active:scale-95'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-7 h-7 rounded-lg font-mono font-extrabold text-xs flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-850 text-slate-400 group-hover:bg-slate-800 group-hover:text-indigo-400'}`}>
                          {opt.key}
                        </span>
                        <span className="text-xs font-medium leading-normal pr-4">{opt.text}</span>
                      </div>
                      
                      {isSelected && (
                        <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase shrink-0 animate-pulse">Registrado</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status do envio */}
              {hasSubmitted && (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 flex justify-center items-center gap-3 text-xs text-slate-400 font-mono animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                  <span>Sua tática foi submetida! Aguardando oponente concluir a guarda...</span>
                </div>
              )}

            </div>
          </div>

          {/* Direita: Placar Síncrono Kahoot Style */}
          <div className="space-y-6">
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-850 backdrop-blur-md space-y-4">
              <h4 className="font-display font-extrabold text-xs text-slate-300 pb-2 border-b border-slate-850">
                ⚡ Status da Arena PvP
              </h4>

              <div className="space-y-3">
                {/* Atleta Challenger (Você) */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${answeredCount.challenger ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-slate-900 border-slate-800/60'}`}>
                  <div className="flex items-center gap-3">
                    <AvatarWithFrame
                      avatarUrl={user.profilePhoto || user.avatar}
                      userName={user.name}
                      frame={user.equippedFrame}
                      size="xs"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-200">Você</span>
                      <span className="text-[9px] text-slate-500 font-mono">Challenger</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-mono font-bold uppercase rounded ${answeredCount.challenger ? 'text-indigo-400' : 'text-slate-500 animate-pulse'}`}>
                      {answeredCount.challenger ? '✓ Encarou' : 'Pensando...'}
                    </span>
                  </div>
                </div>

                {/* Atleta Defender (Oponente) */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${answeredCount.defender ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-slate-900 border-slate-800/60'}`}>
                  <div className="flex items-center gap-3">
                    <AvatarWithFrame
                      avatarUrl={opponent.profilePhoto || opponent.avatar}
                      userName={opponent.name}
                      frame={opponent.equippedFrame}
                      size="xs"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-200 leading-none truncate max-w-[100px]">{opponent.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Defender</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-mono font-bold uppercase rounded ${answeredCount.defender ? 'text-indigo-400' : 'text-slate-500 animate-pulse'}`}>
                      {answeredCount.defender ? '✓ Encarou' : 'Pensando...'}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          STATE ROUND REVIEW - CORRECT ANSWER & EXPLANATION
          ========================================== */}
      {arenaState === 'round_review' && roundResult && question && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Esquerda: Resultado oficial comentando a posição */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950/75 p-6 rounded-3xl border border-indigo-950/40 space-y-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.03] rounded-full blur-3xl -z-10" />

              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div>
                  <span className="text-[10px] bg-emerald-950 border border-emerald-500/20 font-mono font-bold text-emerald-400 px-2 py-0.5 rounded uppercase">
                    Fim do Assalto {currentRound}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono ml-3">Explicação Tática</span>
                </div>
              </div>

              {/* Pergunta text */}
              <div>
                <h5 className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block mb-1">Enunciado Anterior</h5>
                <p className="text-sm font-semibold text-slate-350 leading-relaxed">{question.text}</p>
              </div>

              {/* Correct box details */}
              <div className="p-4 bg-emerald-950/15 border border-emerald-500/40 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-display font-extrabold text-sm uppercase">Opção Correta: {roundResult.correctOption}</span>
                </div>
                
                <p className="text-xs font-medium text-slate-205 leading-normal">
                  {roundResult.correctOption === "A" && question.optionA}
                  {roundResult.correctOption === "B" && question.optionB}
                  {roundResult.correctOption === "C" && question.optionC}
                  {roundResult.correctOption === "D" && question.optionD}
                </p>
              </div>

              {/* Bot Dynamic Comment Speech Balloon */}
              {(roundResult as any).botComment && (
                <div className="bg-indigo-950/20 border border-indigo-505/30 p-4 rounded-2xl flex items-start gap-3.5 animate-fadeIn">
                  <AvatarWithFrame
                    avatarUrl={opponent.profilePhoto || opponent.avatar}
                    userName={opponent.name}
                    frame={opponent.equippedFrame}
                    size="sm"
                    className="shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-extrabold block">{opponent.name} diz:</span>
                    <p className="text-xs italic text-slate-200">
                      "{ (roundResult as any).botComment }"
                    </p>
                  </div>
                </div>
              )}

              {/* Explicaçao Oficial */}
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-850 space-y-2 leading-relaxed">
                <h6 className="font-display font-extrabold text-xs text-indigo-405 uppercase flex items-center gap-1.5 pb-2 border-b border-slate-850/60">
                  <BookOpen className="w-3.5 h-3.5" /> Estudo Técnico das Regras / Posições:
                </h6>
                <p className="text-[11px] text-slate-400 leading-normal font-medium leading-relaxed">
                  {roundResult.explanation}
                </p>
              </div>

              {/* Banner timer info */}
              <div className="p-3 bg-slate-900 border border-slate-855 text-center text-xs text-slate-455 font-mono rounded-xl">
                Próximo assalto inicia automaticamente em instantes... prepare sua respiração.
              </div>

            </div>
          </div>

          {/* Direita: Resultados do Round */}
          <div className="space-y-6">
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-850 backdrop-blur-md space-y-5">
              <h4 className="font-display font-extrabold text-xs text-slate-300 pb-2 border-b border-slate-850">
                🥊 Placar da Rodada
              </h4>

              <div className="space-y-4">
                
                {/* Challenger result */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">Você</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${roundResult.challengerAnswer === roundResult.correctOption ? 'bg-emerald-950 text-emerald-450 border border-emerald-500/20' : 'bg-red-950 text-red-450 border border-red-500/20'}`}>
                      {roundResult.challengerAnswer || 'Sem Resposta'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-850/40 text-[11px] font-mono leading-none">
                    <span className="text-slate-500">Acerto da Postura</span>
                    <span className={roundResult.challengerEarned > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      +{roundResult.challengerEarned} XP-Points
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono leading-none">
                    <span className="text-slate-500">Score Acumulado</span>
                    <span className="text-white font-bold">{roundResult.challengerScore} PTS</span>
                  </div>
                </div>

                {/* Defender result */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 leading-none truncate max-w-[100px]">{opponent.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${roundResult.defenderAnswer === roundResult.correctOption ? 'bg-emerald-950 text-emerald-450 border border-emerald-500/20' : 'bg-red-950 text-red-450 border border-red-500/20'}`}>
                      {roundResult.defenderAnswer || 'Sem Resposta'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-850/40 text-[11px] font-mono leading-none">
                    <span className="text-slate-500">Acerto da Postura</span>
                    <span className={roundResult.defenderEarned > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      +{roundResult.defenderEarned} XP-Points
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono leading-none">
                    <span className="text-slate-500">Score Acumulado</span>
                    <span className="text-white font-bold">{roundResult.defenderScore} PTS</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          STATE GAMEOVER - FINAL RESOLUTIONS SUMMARY & PAYOUTS
          ========================================== */}
      {arenaState === 'gameover' && gameOverResult && opponent && (
        <div className="bg-slate-950/70 p-8 rounded-3xl border border-slate-850 text-center space-y-6 max-w-lg mx-auto backdrop-blur-md animate-fadeIn shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-radial-gradient from-indigo-500/5 to-transparent" />
          
          {gameOverResult.winnerId === user.id ? (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
                👑
              </div>
              <div>
                <h4 className="text-2xl font-display font-black text-emerald-400 uppercase tracking-widest leading-none">
                  Lutador Vencedor!
                </h4>
                <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                  A sua agilidade tática desestruturou as defesas de <strong>{opponent.name}</strong>. Parabéns!
                </p>
              </div>

              {/* Rewards payouts summary */}
              {gameOverResult.ratingResults && (
                <div className="p-4 bg-slate-900 border border-slate-850/80 rounded-2xl grid grid-cols-3 gap-2">
                  <div className="text-center bg-slate-950 p-2 rounded-xl">
                    <span className="block text-[8px] text-slate-550 font-mono">ELO MUDANÇA</span>
                    <span className="text-base font-mono font-black text-violet-400">+{gameOverResult.ratingResults.playerA?.eloChange || 32}</span>
                  </div>
                  <div className="text-center bg-slate-950 p-2 rounded-xl">
                    <span className="block text-[8px] text-slate-550 font-mono">JIUTICKETS</span>
                    <span className="text-base font-mono font-black text-amber-500">+{gameOverResult.ratingResults.playerA?.coinsGained || 100} JT</span>
                  </div>
                  <div className="text-center bg-slate-950 p-2 rounded-xl">
                    <span className="block text-[8px] text-slate-550 font-mono">XP CONQUISTADO</span>
                    <span className="text-base font-mono font-black text-white">+{gameOverResult.ratingResults.playerA?.xpGained || 150}</span>
                  </div>
                </div>
              )}
            </div>
          ) : gameOverResult.winnerId === null ? (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500 text-amber-500 rounded-full flex items-center justify-center text-4xl mx-auto">
                🤝
              </div>
              <div>
                <h4 className="text-2xl font-display font-black text-amber-400 uppercase tracking-widest leading-none">
                  Empate de Posturas!
                </h4>
                <p className="text-xs text-slate-450 mt-2 max-w-xs mx-auto">
                  Equilíbrio absoluto! Ambos os atletas pontuaram igulamente nas avaliações do tatame.
                </p>
              </div>

              {gameOverResult.ratingResults && (
                <div className="p-4 bg-slate-900 border border-slate-850/80 rounded-2xl grid grid-cols-2 gap-2">
                  <div className="text-center bg-slate-950 p-2 rounded-xl">
                    <span className="block text-[8px] text-slate-550 font-mono">ELO MUDANÇA</span>
                    <span className="text-base font-mono font-black text-indigo-400">0</span>
                  </div>
                  <div className="text-center bg-slate-950 p-2 rounded-xl">
                    <span className="block text-[8px] text-slate-550 font-mono">XP CONQUISTADO</span>
                    <span className="text-base font-mono font-black text-white">+{gameOverResult.ratingResults.playerA?.xpGained || 50}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto">
                🤕
              </div>
              <div>
                <h4 className="text-2xl font-display font-black text-red-400 uppercase tracking-widest leading-none">
                  Derrota no Combate
                </h4>
                <p className="text-xs text-slate-450 mt-2 max-w-xs mx-auto">
                  <strong>{opponent.name}</strong> posturou de forma mais firme. Lembre-se: "Você não perde no Jiu-Jitsu; ou vence, ou aprende!"
                </p>
              </div>

              {gameOverResult.ratingResults && (
                <div className="p-4 bg-slate-900 border border-slate-850/80 rounded-2xl grid grid-cols-2 gap-2">
                  <div className="text-center bg-slate-950 p-2 rounded-xl">
                    <span className="block text-[8px] text-slate-550 font-mono">ELO MUDANÇA</span>
                    <span className="text-base font-mono font-black text-red-500">-{Math.abs(gameOverResult.ratingResults.playerA?.eloChange || -12)}</span>
                  </div>
                  <div className="text-center bg-slate-950 p-2 rounded-xl">
                    <span className="block text-[8px] text-slate-550 font-mono">XP CONQUISTADO</span>
                    <span className="text-base font-mono font-black text-white">+{gameOverResult.ratingResults.playerA?.xpGained || 30}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scores breakdown side-by-side */}
          <div className="p-5 bg-slate-900 border border-slate-850 rounded-2xl">
            <span className="block text-[9px] text-slate-500 font-mono uppercase mb-2">Pontuação Final</span>
            <div className="flex items-center justify-around">
              <div className="text-center leading-none">
                <span className="block text-2xl font-black text-white font-mono">{gameOverResult.challengerFinalScore}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Você</span>
              </div>
              <div className="text-slate-700 font-display font-bold text-lg">vs</div>
              <div className="text-center leading-none">
                <span className="block text-2xl font-black text-white font-mono">{gameOverResult.defenderFinalScore}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block truncate max-w-[100px]">{opponent.name}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                resetMatchStates();
                setArenaState('lobby');
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-650/15"
            >
              Voltar ao Saguão da Arena
            </button>
          </div>
        </div>
      )}

      {/* ==============================================
          IMERSIVE VOICE SPARRING MODAL OVERLAY
          ============================================== */}
      {voiceChatOpen && activeVoiceSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-4xl h-[95vh] md:h-[80vh] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="bg-slate-950/80 border-b border-slate-850 px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={activeVoiceSession.partnerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeVoiceSession.partnerKey}`} 
                    alt={activeVoiceSession.partnerName} 
                    className="w-10 h-10 rounded-lg border border-slate-850 bg-slate-900"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-black text-white text-sm">
                      Treino com {activeVoiceSession.partnerName}
                    </h4>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-mono font-bold border border-emerald-500/20">
                      {activeVoiceSession.scenario}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    PVP Sparring de Voz • Conectado à IA Copilot
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-900 border border-slate-850 px-3 py-1 rounded-xl text-center hidden sm:block">
                  <span className="text-[8px] text-slate-500 block font-mono">SEU ELO</span>
                  <span className="text-xs font-black text-indigo-400 font-mono leading-none">{user.elo || 1000} ELO</span>
                </div>
                <button
                  onClick={() => {
                    if (audioPlayerRef.current) {
                      audioPlayerRef.current.pause();
                    }
                    setVoiceChatOpen(false);
                    setActiveVoiceSession(null);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono transition cursor-pointer"
                >
                  Sair do Tatame
                </button>
              </div>
            </div>

            {/* Modal Body: Split-Screen Layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Panel: Active Status, Waveform Visualizer & Coaching Insights */}
              <div className="w-full md:w-80 bg-slate-950/40 p-5 border-b md:border-b-0 md:border-r border-slate-850 flex flex-col justify-between space-y-4 shrink-0">
                
                {/* Micro animation waveform card */}
                <div className="bg-slate-950/80 border border-slate-850/60 p-4 rounded-xl space-y-4 text-center">
                  <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                    RECORTE DE FREQUÊNCIA VERBAL
                  </span>
                  
                  {/* Waveform graphic bars */}
                  <div className="h-10 flex items-center justify-center gap-[4px] px-4">
                    {waveformBars.map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-1 rounded-full transition-all duration-100 ${
                          isPlayingAudio 
                            ? 'bg-emerald-500' 
                            : isRecording 
                            ? 'bg-red-500' 
                            : aiThinking 
                            ? 'bg-indigo-500 animate-pulse' 
                            : 'bg-slate-700'
                        }`}
                        style={{ height: `${h * 1.5}px` }} 
                      />
                    ))}
                  </div>

                  <div className="text-left py-1">
                    {isPlayingAudio ? (
                      <div className="text-center text-xs text-emerald-400 font-mono font-bold animate-pulse">
                        🔊 Ouvindo {activeVoiceSession.partnerName}...
                      </div>
                    ) : isRecording ? (
                      <div className="text-center text-xs text-red-500 font-mono font-bold animate-pulse">
                        🎙️ Gravando seu inglês... Fale agora!
                      </div>
                    ) : aiThinking ? (
                      <div className="text-center text-xs text-indigo-400 font-mono font-bold flex items-center justify-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Coach está formulando conselho...
                      </div>
                    ) : (
                      <div className="text-center text-xs text-slate-500 font-mono">
                        Silêncio no Tatame. Aperte o microfone para falar!
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical coaching summary details */}
                <div className="bg-slate-900 border border-slate-850/60 p-4 rounded-xl flex-1 text-left overflow-y-auto space-y-3.5 max-h-[180px] md:max-h-none">
                  <span className="block text-[9px] font-mono text-[#009dff] uppercase tracking-wider font-extrabold">
                    COACHING ANALYTICS IA
                  </span>

                  {/* Interactive display of last assistant feedback */}
                  {(() => {
                    const assistantMsgs = activeVoiceSession.history.filter((m: any) => m.role === 'assistant');
                    const lastBotMsg = assistantMsgs[assistantMsgs.length - 1];
                    if (!lastBotMsg) {
                      return (
                        <p className="text-[10px] text-slate-400 italic">
                          Fale seu primeiro input para habilitar as métricas de análise de tom, precisão de vocábulos e pronúncia americana.
                        </p>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[8px] font-mono text-slate-500 uppercase block">Pronúncia & Fonética:</span>
                          <p className="text-[11px] text-slate-300 leading-normal bg-slate-950 p-2 rounded border border-slate-900 font-mono">
                            {lastBotMsg.pronunciationTips || 'Feedback fonético indisponível.'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] font-mono text-slate-500 uppercase block">Análise de Performance:</span>
                          <p className="text-[11px] text-slate-300 leading-normal italic">
                            {lastBotMsg.performanceAnalysis || 'Perfeito! Conteúdo e tom perfeitamente adequados ao tatame.'}
                          </p>
                        </div>

                        {lastBotMsg.keyVocabulary && lastBotMsg.keyVocabulary.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block">Vocabulário Chave:</span>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {lastBotMsg.keyVocabulary.map((word: string, i: number) => (
                                <span key={i} className="text-[9px] text-[#009dff] bg-indigo-950/60 border border-indigo-900/40 px-2 py-0.5 rounded font-bold font-mono">
                                  {word}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Mic error / instructions block */}
                {micErrorText && (
                  <div className="bg-red-950/20 border border-red-500/20 px-3 py-2 rounded-xl text-left">
                    <span className="block text-[8px] text-red-400 font-mono uppercase font-bold">AVISO TÉCNICO:</span>
                    <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5">{micErrorText}</p>
                  </div>
                )}
              </div>

              {/* Right Panel: Immersive Transcript Chronology of this sparring session */}
              <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-955">
                
                {/* Scrolling transcripts area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left font-sans">
                  {activeVoiceSession.history.map((msg: any, idx: number) => {
                    const isBot = msg.role === 'assistant';
                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-3 max-w-[85%] ${
                          isBot ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'
                        } animate-fadeIn`}
                      >
                        {isBot && (
                          <img 
                            src={activeVoiceSession.partnerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeVoiceSession.partnerKey}`} 
                            alt={activeVoiceSession.partnerName} 
                            className="w-7 h-7 rounded-md border border-slate-800 bg-slate-900 shrink-0 select-none" 
                            referrerPolicy="no-referrer"
                          />
                        )}

                        <div className="space-y-1.5 min-w-0">
                          {/* Chat bubble body */}
                          <div 
                            className={`p-3.5 rounded-2xl relative ${
                              isBot 
                                ? 'bg-slate-900 border border-slate-850 text-slate-100 rounded-tl-none' 
                                : 'bg-indigo-600 text-white rounded-br-none'
                            }`}
                          >
                            <p className="text-xs leading-relaxed font-sans select-all">{msg.text}</p>
                            
                            {/* Embedded Portuguese Translation Accordion inside the bubble */}
                            {isBot && msg.translation && (
                              <details className="mt-2 text-[11px] text-slate-405 border-t border-slate-800 pt-2 cursor-pointer select-none">
                                <summary className="hover:text-indigo-400 transition font-bold font-mono text-[9px] list-none flex items-center gap-1">
                                  <span>🇧🇷 Ver Tradução</span>
                                </summary>
                                <p className="mt-1 text-[11px] text-slate-300 leading-normal animate-fadeIn font-normal select-all">
                                  {msg.translation}
                                </p>
                              </details>
                            )}
                          </div>

                          {/* Extra feedback labels under bubble */}
                          {isBot && (
                            <div className="flex flex-wrap items-center gap-1.5 px-1 font-mono text-[9px]">
                              {/* Audio Repeat Button */}
                              <button
                                onClick={() => playVoiceSpeech(msg.text, activeVoiceSession.partnerVoice)}
                                className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5 cursor-pointer font-bold shrink-0"
                              >
                                🔊 Ouvir Novamente
                              </button>

                              {/* Awarded ELO highlight */}
                              {msg.eloDelta > 0 && (
                                <span className="bg-yellow-950/80 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5">
                                  🏆 +{msg.eloDelta} ELO (Faixa)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing/Thinking indicator */}
                  {aiThinking && (
                    <div className="flex gap-3 max-w-[80%] mr-auto items-center animate-pulse">
                      <img 
                        src={activeVoiceSession.partnerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeVoiceSession.partnerKey}`} 
                        alt="Bot Avatar" 
                        className="w-7 h-7 rounded-md border border-slate-800 bg-slate-900 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="bg-slate-900 border border-slate-850 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Controls Area */}
                <div className="bg-slate-950/80 border-t border-slate-850 p-4 shrink-0 space-y-3">
                  
                  {/* Option 1: Live Voice Recording Trigger (Preferred standard) */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 min-h-[44px]">
                      {isRecording ? (
                        <div className="flex-1 flex items-center gap-2 text-red-400 font-mono text-xs">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          Gravando áudio de voz... Fale agora em Inglês!
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          value={voiceDraftText} 
                          onChange={(e) => setVoiceDraftText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              sendVoiceChatMessage();
                            }
                          }}
                          placeholder={isRecording ? "Listening..." : "Escreva em inglês ou fale no microfone..."}
                          className="w-full bg-transparent border-0 text-white placeholder-slate-500 outline-none text-xs"
                          disabled={aiThinking}
                        />
                      )}
                    </div>

                    {/* Microphone trigger Button */}
                    <button
                      type="button"
                      onMouseDown={startListening}
                      onMouseUp={stopListening}
                      onTouchStart={startListening}
                      onTouchEnd={stopListening}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 transform select-none cursor-pointer ${
                        isRecording 
                          ? 'bg-red-600 border-red-500 text-white animate-pulse scale-105 shadow-md shadow-red-950/50' 
                          : 'bg-indigo-600 hover:bg-indigo-400 border-indigo-505 text-white shadow-md shadow-indigo-950/50'
                      }`}
                      title="Segure para falar (🇺🇸)"
                    >
                      🗣️
                    </button>

                    {/* Submit text query trigger */}
                    <button
                      onClick={() => sendVoiceChatMessage()}
                      disabled={!voiceDraftText.trim() || aiThinking}
                      className="px-4 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 disabled:opacity-40 text-[#009dff] hover:text-white font-mono font-bold text-xs uppercase rounded-xl tracking-wider transition cursor-pointer"
                    >
                      Enviar
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono text-center">
                    📢 Segure o botão do microfone 🗣  para falar em Inglês. Solte para enviar automaticamente!
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
