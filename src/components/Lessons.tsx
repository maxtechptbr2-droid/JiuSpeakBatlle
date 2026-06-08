/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Check, 
  Search, 
  Heart, 
  Clock, 
  Award, 
  BookOpen, 
  Volume2, 
  Mic, 
  Languages, 
  Trophy, 
  Sparkles, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Printer,
  FileText,
  Info,
  ShieldCheck,
  Zap,
  Star,
  HelpCircle,
  PlayCircle,
  Activity,
  Download
} from 'lucide-react';
import { UserProfile, Course, BeltRank } from '../types';
import { NETFLIX_ASSETS, NetflixAsset } from '../data/lessonsData';
import * as lessonsData from '../data/lessonsData';

interface LessonsProps {
  user: UserProfile;
  courses: Course[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  onAddAuditLog: (type: any, desc: string, amtBRL?: number, amtKC?: number) => void;
  addXp: (amount: number, reason: string) => void;
  addCoins: (amount: number, reason: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

// Custom achievement interface for lesson accomplishments
interface LessonAchievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  condition: string;
  points: number;
}

export default function Lessons({ 
  user, 
  courses, 
  updateUser, 
  onAddAuditLog, 
  addXp, 
  addCoins, 
  showToast 
}: LessonsProps) {

  // --- COMPONENT PERSISTED STATES ---
  const [favorites, setFavorites] = useState<string[]>(() => {
    const cached = localStorage.getItem('js_fav_assets');
    return cached ? JSON.parse(cached) : ['w-vid-1', 'b-vid-1'];
  });

  const [assetProgress, setAssetProgress] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('js_asset_progress');
    return cached ? JSON.parse(cached) : { 'w-vid-1': 100, 'w-aud-1': 40 };
  });

  const [studySeconds, setStudySeconds] = useState<number>(() => {
    const cached = localStorage.getItem('js_study_seconds');
    return cached ? parseInt(cached, 10) : 3400; // start with ~56m
  });

  const [unlockedCertificates, setUnlockedCertificates] = useState<string[]>(() => {
    const cached = localStorage.getItem('js_certificates_unlocked');
    return cached ? JSON.parse(cached) : ['Branca']; // Branca starts unlocked as onboarding trial
  });

  const [assetsList, setAssetsList] = useState<NetflixAsset[]>(NETFLIX_ASSETS);

  const getYoutubeId = (url: string | undefined): string => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const mapBeltToBrazilian = (beltLevel: string): BeltRank => {
    const b = beltLevel.toUpperCase();
    if (b === 'WHITE') return 'Branca';
    if (b === 'BLUE') return 'Azul';
    if (b === 'PURPLE') return 'Roxa';
    if (b === 'BROWN') return 'Marrom';
    if (b === 'BLACK') return 'Preto';
    return 'Branca';
  };

  useEffect(() => {
    const fetchDynamicModules = async () => {
      try {
        const res = await fetch('/api/academy/modules', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success && data.modules) {
          localStorage.setItem('jiuspeak_academy_modules_data', JSON.stringify(data.modules));
          const dbVideoAssets: NetflixAsset[] = [];
          data.modules.forEach((mod: any) => {
            const category = mapBeltToBrazilian(mod.beltLevel);
            if (mod.lessons) {
              mod.lessons.forEach((les: any) => {
                const yId = getYoutubeId(les.youtubeUrl);
                dbVideoAssets.push({
                  id: les.id,
                  title: les.title,
                  type: 'video',
                  category: category,
                  subcategory: 'Posições',
                  duration: '10 min',
                  description: les.description,
                  imageUrl: yId 
                    ? `https://img.youtube.com/vi/${yId}/maxresdefault.jpg` 
                    : 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=600',
                  xpReward: les.xpReward || 100,
                  difficulty: category === 'Branca' ? 'Iniciante' : category === 'Azul' ? 'Intermediário' : category === 'Roxa' ? 'Avançado' : 'Mestre',
                  videoUrl: les.youtubeUrl,
                });
              });
            }
          });
          const nonVideoAssets = NETFLIX_ASSETS.filter(asset => asset.type !== 'video');
          setAssetsList([...nonVideoAssets, ...dbVideoAssets]);
        }
      } catch (err) {
        console.warn("⚠️ Falha ao carregar aulas dinâmicas em Lessons.tsx. Usando cache local se disponível.", err);
        const cachedStr = localStorage.getItem('jiuspeak_academy_modules_data');
        if (cachedStr) {
          try {
            const cachedModules = JSON.parse(cachedStr);
            const dbVideoAssets: NetflixAsset[] = [];
            cachedModules.forEach((mod: any) => {
              const category = mapBeltToBrazilian(mod.beltLevel);
              if (mod.lessons) {
                mod.lessons.forEach((les: any) => {
                  const yId = getYoutubeId(les.youtubeUrl);
                  dbVideoAssets.push({
                    id: les.id,
                    title: les.title,
                    type: 'video',
                    category: category,
                    subcategory: 'Posições',
                    duration: '10 min',
                    description: les.description,
                    imageUrl: yId 
                      ? `https://img.youtube.com/vi/${yId}/maxresdefault.jpg` 
                      : 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=600',
                    xpReward: les.xpReward || 100,
                    difficulty: category === 'Branca' ? 'Iniciante' : category === 'Azul' ? 'Intermediário' : category === 'Roxa' ? 'Avançado' : 'Mestre',
                    videoUrl: les.youtubeUrl,
                  });
                });
              }
            });
            const nonVideoAssets = NETFLIX_ASSETS.filter(asset => asset.type !== 'video');
            setAssetsList([...nonVideoAssets, ...dbVideoAssets]);
          } catch (e) {}
        }
      }
    };
    fetchDynamicModules();
  }, []);

  // --- SELECTION & OUTLET STATES ---
  const [selectedBelt, setSelectedBelt] = useState<'ALL' | BeltRank>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'video' | 'audio' | 'pdf' | 'quiz' | 'exercise'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Media Player Active Overlay state
  const [activePlayAsset, setActivePlayAsset] = useState<NetflixAsset | null>(null);
  const [mediaTab, setMediaTab] = useState<'play' | 'exercise' | 'quiz' | 'achieve'>('play');
  const [isPlayingMedia, setIsPlayingMedia] = useState(false);
  const [mediaPlaybackProgress, setMediaPlaybackProgress] = useState(0);

  // Active quiz solver states
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Active exercise solver states
  const [exerciseSelectedAnswer, setExerciseSelectedAnswer] = useState<number | null>(null);
  const [exerciseSolved, setExerciseSolved] = useState(false);

  // Active speak simulator state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceAccuracyPercent, setVoiceAccuracyPercent] = useState<number | null>(null);

  // Certificate modal state
  const [viewingCertificateBelt, setViewingCertificateBelt] = useState<BeltRank | null>(null);

  // --- DEFINE LESSON ACHIEVEMENTS ---
  const achievementsList: LessonAchievement[] = [
    { id: 'ach-first-step', title: 'Primeiro Rolê Gramatical', description: 'Conclua a primeira lição em vídeo da Faixa Branca.', badge: '🌱', condition: 'w-vid-1 concluído', points: 50 },
    { id: 'ach-pronounce-master', title: 'Fluente de Tatame', description: 'Consiga mais de 90% de precisão no exercício prático de pronúncia.', badge: '🗣️', condition: 'Treino de voz bem-sucedido', points: 100 },
    { id: 'ach-quiz-beast', title: 'Mestre Examinador', description: 'Seja aprovado com nota máxima em qualquer Quiz de arbitragem.', badge: '🎓', condition: 'Quiz finalizado com 100%', points: 150 },
    { id: 'ach-blue-unlocked', title: 'Graduação Azulada', description: 'Desbloqueie o certificado oficial da Faixa Azul.', badge: '🥋', condition: 'Todos os módulos de Faixa Azul concluídos', points: 200 },
    { id: 'ach-black-belt-seminar', title: 'Mestre de Negócios', description: 'Conclua todo o currículo avançado da Faixa Preta e emita o diploma executivo.', badge: '👑', condition: 'Diploma da Faixa Preta emitido', points: 500 }
  ];

  // Auto-save mechanisms
  useEffect(() => {
    localStorage.setItem('js_fav_assets', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (activePlayAsset && activePlayAsset.type === 'video') {
      const lesson = { ...activePlayAsset, videoUrl: activePlayAsset.videoUrl || "" };
      const yId = getYoutubeId(lesson.videoUrl);
      const embedUrl = yId ? `https://www.youtube.com/embed/${yId}?autoplay=1&mute=1&rel=0&modestbranding=1` : "";
      
      console.log("Lessons Source:", lessonsData);
      console.log("Current Lesson:", lesson);
      console.log("Video URL:", lesson.videoUrl);
      console.log("Embed URL:", embedUrl);
    }
  }, [activePlayAsset]);

  useEffect(() => {
    localStorage.setItem('js_asset_progress', JSON.stringify(assetProgress));
  }, [assetProgress]);

  useEffect(() => {
    localStorage.setItem('js_study_seconds', studySeconds.toString());
  }, [studySeconds]);

  useEffect(() => {
    localStorage.setItem('js_certificates_unlocked', JSON.stringify(unlockedCertificates));
  }, [unlockedCertificates]);

  // Simulated stopwatch trigger when video/audio is active
  useEffect(() => {
    let watchTimer: any = null;
    if (isPlayingMedia && activePlayAsset) {
      watchTimer = setInterval(() => {
        setStudySeconds(prev => prev + 1);
        setMediaPlaybackProgress(prev => {
          if (prev >= 100) {
            handleCompleteAsset(activePlayAsset.id, activePlayAsset.xpReward);
            setIsPlayingMedia(false);
            return 100;
          }
          return prev + 4; // advance progress fast for testability
        });
      }, 1000);
    }
    return () => clearInterval(watchTimer);
  }, [isPlayingMedia, activePlayAsset]);

  // --- ACTIONS & MUTATORS ---
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(x => x !== id));
      showToast('Item removido da sua lista!', 'info');
    } else {
      setFavorites(prev => [...prev, id]);
      showToast('Item adicionado à sua lista Netflix! ❤️', 'success');
    }
  };

  const handleOpenAsset = (asset: NetflixAsset) => {
    setActivePlayAsset(asset);
    setMediaTab('play');
    setIsPlayingMedia(false);
    setMediaPlaybackProgress(assetProgress[asset.id] || 0);
    
    // Reset quiz options
    setCurrentQuizIndex(0);
    setQuizSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);

    // Reset exercises
    setExerciseSelectedAnswer(null);
    setExerciseSolved(false);

    // Reset voice
    setIsRecordingVoice(false);
    setVoiceAccuracyPercent(null);
  };

  const handleCompleteAsset = (id: string, rewardXP: number) => {
    setAssetProgress(prev => ({ ...prev, [id]: 100 }));
    
    // Check if progress already finished previously
    if (assetProgress[id] !== 100) {
      const rewardCoins = Math.round(rewardXP / 3);
      addXp(rewardXP, `Conclusão de Módulo: ${id}`);
      addCoins(rewardCoins, `Estudo do Tatame`);
      onAddAuditLog('lesson_completed', `Atleta concluiu com destaque o módulo de estudo ${id}`, undefined, rewardCoins);
      showToast(`Módulo Concluído! +${rewardXP} XP e +${rewardCoins} Kimono Coins acumulados!`, 'success');
    }
  };

  const handleStartSimulatedRecording = () => {
    setIsRecordingVoice(true);
    setVoiceAccuracyPercent(null);
    showToast('🔴 Gravando áudio vocal... Pronuncie agora!', 'info');

    setTimeout(() => {
      const accuracy = Math.floor(Math.random() * 16) + 85; // 85% - 100%
      setVoiceAccuracyPercent(accuracy);
      setIsRecordingVoice(false);
      
      const coinsGift = Math.floor(accuracy / 3);
      addXp(50, 'Treino de Pronúncia Técnica');
      addCoins(coinsGift, 'Pronúncia Fluida');
      
      if (accuracy >= 90) {
        showToast(`Excelente pronúncia! Precisão Técnica: ${accuracy}% (+50 XP).`, 'success');
      } else {
        showToast(`Boa tentativa! Precisão Técnica: ${accuracy}%. Tente espremer os fonemas mais forte.`, 'info');
      }
    }, 2000);
  };

  const speakTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
      showToast('🔊 Reproduzindo som nativo americano...', 'info');
    } else {
      showToast('A síntese vocal por voz não é suportada neste browser.', 'error');
    }
  };

  const submitQuizAnswer = (correctIndex: number, selectedIndex: number) => {
    setQuizSelectedOption(selectedIndex);
    const correct = selectedIndex === correctIndex;
    if (correct) {
      setQuizScore(prev => prev + 1);
      showToast('Resposta Correta! Parabéns!', 'success');
    } else {
      showToast('Resposta Incorreta. Revise a explicação.', 'error');
    }
  };

  const handleFinishQuiz = (totalQuestions: number, xpValue: number) => {
    setQuizFinished(true);
    const scorePct = Math.round((quizScore / totalQuestions) * 100);
    
    if (scorePct >= 70) {
      addXp(xpValue, 'Quiz de Fixação Aprovado');
      addCoins(30, 'Gabarito Técnico');
      showToast(`Aprovado no Quiz! Score: ${scorePct}% (+${xpValue} XP)`, 'success');
    } else {
      showToast(`Quiz encerrado. Pontuação de ${scorePct}% insuficiente para premiação total. Tente de novo!`, 'info');
    }
  };

  const submitExerciseAnswer = (correctIndex: number) => {
    if (exerciseSelectedAnswer === null) return;
    setExerciseSolved(true);
    const correct = exerciseSelectedAnswer === correctIndex;
    if (correct) {
      addXp(60, 'Exercício Prático Concluído');
      addCoins(15, 'Gramática Reorganizada');
      showToast('Exercício Resolvido com Sucesso! (+60 XP)', 'success');
    } else {
      showToast('Ordem gramatical incorreta. Revise e experimente uma nova ordenação.', 'error');
    }
  };

  // Claim Graduation Diploma Action
  const handleClaimGraduation = (belt: BeltRank) => {
    if (unlockedCertificates.includes(belt)) {
      setViewingCertificateBelt(belt);
      return;
    }

    const progressPercent = getBeltProgress(belt);
    if (progressPercent < 100 && belt !== 'Branca') {
      showToast(`Conclua 100% dos módulos da Faixa ${belt} para poder militar no exterior e gerar seu diploma!`, 'error');
      return;
    }

    setUnlockedCertificates(prev => [...prev, belt]);
    setViewingCertificateBelt(belt);
    addXp(400, `Diploma Emitido: Faixa ${belt}`);
    addCoins(200, `Licenciamento Internacional`);
    onAddAuditLog('pix_deposit', `Geração de Credencial Técnica da Graduação Faixa ${belt}`, undefined, 200);
    showToast(`Parabéns! Diploma Oficial de Faixa ${belt} emitido e homologado via Blockchain! 🏆`, 'success');
  };

  // --- STATS CALCULATIONS ---
  const getBeltProgress = (belt: BeltRank): number => {
    const beltAssets = assetsList.filter(x => x.category === belt);
    if (beltAssets.length === 0) return 0;
    const completedCount = beltAssets.filter(x => assetProgress[x.id] === 100).length;
    return Math.round((completedCount / beltAssets.length) * 100);
  };

  const totalProgress = Math.round(
    (Object.values(assetProgress).filter(v => v === 100).length / assetsList.length) * 100
  ) || 12;

  const getFilteredAssets = () => {
    return assetsList.filter(asset => {
      const matchBelt = selectedBelt === 'ALL' || asset.category === selectedBelt;
      const matchType = selectedType === 'ALL' || asset.type === selectedType;
      const matchSearch = searchQuery.trim() === '' || 
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBelt && matchType && matchSearch;
    });
  };

  const formatStudyTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-[#111111] text-zinc-100 min-h-screen p-4 sm:p-6 pb-24 space-y-6 select-none relative font-sans" id="netflix-lessons-core">
      
      {/* 1. BRAND HEADER BLOCK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-850 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-650 flex items-center justify-center font-display font-black text-xl text-white shadow-xl rotate-[-3deg]">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-sm tracking-wider uppercase text-red-600">JiuSpeak Cinema & Academy</h2>
              <span className="p-0.5 px-2 bg-red-600/10 border border-red-650/30 rounded font-mono text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">Enterprise</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">Dedicado: {user.name} • Graduação Atual: Faixa {user.belt}</p>
          </div>
        </div>

        {/* Global summary card stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="p-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-0.5">
            <p className="text-[8px] text-zinc-500 uppercase font-mono">Tempo de Estudo</p>
            <p className="font-black text-white font-mono flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-red-500" />
              <span>{formatStudyTime(studySeconds)}</span>
            </p>
          </div>
          <div className="p-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-0.5">
            <p className="text-[8px] text-zinc-500 uppercase font-mono">Progresso On-Demand</p>
            <p className="font-black text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{totalProgress}%</span>
            </p>
          </div>
          <div className="p-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-0.5">
            <p className="text-[8px] text-zinc-500 uppercase font-mono">XP de Aulas</p>
            <p className="font-black text-amber-500 font-mono flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-amber-500 animate-bounce" />
              <span>{user.xp} XP</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. CINEMATIC HEADLINE HERO BANNER */}
      {searchQuery === '' && selectedBelt === 'ALL' && (
        <div className="relative rounded-2xl overflow-hidden h-[300px] sm:h-[420px] border border-zinc-850 shadow-2xl group transition-all duration-300 hover:border-red-600/30">
          
          {/* Wallpaper dynamic visual gradient vignette */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-102 group-hover:scale-105"
            style={{ 
              backgroundImage: `linear-gradient(to top, rgba(17,17,17,1) 0%, rgba(17,17,17,0.6) 50%, rgba(17,17,17,0.1) 100%), url('https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200')` 
            }}
          />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 space-y-3 z-10 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-0.5 px-2 bg-red-600 text-white font-sans text-[8.5px] font-black rounded tracking-widest uppercase">
                Em Destaque
              </span>
              <span className="p-0.5 px-2 bg-zinc-950 border border-zinc-850 text-amber-500 text-[8.5px] font-black rounded tracking-widest uppercase flex items-center gap-1">
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                Faixa Preta Masterclass
              </span>
            </div>

            <h1 className="text-xl sm:text-4xl font-display font-black text-white tracking-tight leading-none text-glow">
              Como Conduzir Seminários Lucrativos com Oratória Técnica Americana
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed line-clamp-3">
              Não seja apenas um lutador excelente; aprenda a se expressar como um palestrante pedagógico internacional. Domine o vocabulário de posicionamento físico, comandos coletivos e como responder dúvidas técnicas com o prestígio acadêmico Gracie no exterior.
            </p>

            {/* Banner action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => handleOpenAsset(assetsList.find(x => x.id === 'k-vid-1') || assetsList[0])}
                className="p-2.5 px-6 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer transform hover:scale-103 font-sans"
              >
                <Play className="w-3.5 h-3.5 fill-black text-black" /> Começar Assistir
              </button>

              <button 
                onClick={() => toggleFavorite('k-vid-1')}
                className="p-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                {favorites.includes('k-vid-1') ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Star className="w-3.5 h-3.5 text-zinc-400" />}
                <span>Minha Lista</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BELTS HUB SELECTION ROADBLOCK (THE 5 BELTS CAROUSEL GAUGE) */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-xs tracking-widest text-zinc-400 uppercase">
          Filtragem por Faixas & Graduações de Formação
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {/* Universal tag */}
          <button
            onClick={() => setSelectedBelt('ALL')}
            className={`p-3 rounded-xl border transition-all text-xs text-left flex flex-col justify-between h-20 cursor-pointer ${
              selectedBelt === 'ALL' 
                ? 'bg-zinc-900 border-red-650 shadow-md text-white' 
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <span className="text-[8.5px] uppercase font-mono tracking-wider text-zinc-500">Geral</span>
            <span className="font-bold text-sm">Todas as Faixas</span>
            <div className="flex items-center justify-between w-full text-[9px] text-zinc-500 font-mono pt-1">
              <span>Syllabus Completo</span>
              <span>100%</span>
            </div>
          </button>

          {/* Render 5 interactive Belt selections mapping exactly */}
          {(['Branca', 'Azul', 'Roxa', 'Marrom', 'Preto'] as BeltRank[]).map(belt => {
            const progressVal = getBeltProgress(belt);
            const isCompleted = progressVal === 100;
            const certUnlocked = unlockedCertificates.includes(belt);

            // Style variations
            const colorMap: Record<string, { ring: string, bar: string, text: string }> = {
              'Branca': { ring: 'border-zinc-300', bar: 'bg-zinc-200', text: 'text-zinc-200' },
              'Azul': { ring: 'border-blue-600', bar: 'bg-blue-600', text: 'text-blue-500' },
              'Roxa': { ring: 'border-purple-650', bar: 'bg-purple-600', text: 'text-purple-500' },
              'Marrom': { ring: 'border-amber-800', bar: 'bg-amber-800', text: 'text-amber-700' },
              'Preto': { ring: 'border-stone-850', bar: 'bg-red-650', text: 'text-red-500' },
            };

            const styles = colorMap[belt];

            return (
              <div
                key={belt}
                onClick={() => setSelectedBelt(belt)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-24 hover:scale-102 ${
                  selectedBelt === belt 
                    ? 'bg-zinc-900 border-red-600 text-white shadow-xl scale-102' 
                    : 'bg-zinc-950 border-zinc-850 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[8.5px] uppercase font-black px-1.5 py-0.5 rounded ${styles.bar} text-zinc-950 font-mono`}>
                    Faixa {belt}
                  </span>
                  {certUnlocked && (
                    <Trophy className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-450">
                    <span>Progresso:</span>
                    <span className="font-bold">{progressVal}%</span>
                  </div>
                  {/* Miniature progress bar */}
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                    <div 
                      className={`h-full transition-all duration-500 ${styles.bar}`}
                      style={{ width: `${progressVal}%` }}
                    />
                  </div>
                </div>

                {/* Claim Certificate trigger inside Belt button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClaimGraduation(belt);
                  }}
                  className={`w-full text-center text-[8.5px] font-black uppercase text-zinc-400 py-0.5 rounded transition bg-zinc-950/80 border hover:bg-red-600 hover:text-white border-zinc-850`}
                >
                  {certUnlocked ? '📜 Ver Certificado' : progressVal >= 100 || belt === 'Branca' ? '🏆 Emitir Diploma' : '🔒 Bloqueado'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TECHNICAL OUTLET FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#161616] p-3 rounded-xl border border-zinc-850 text-xs">
        {/* Term search input */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Encontre termos do tatame, posições ou regras americanas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 p-2 pl-9 rounded-lg text-xs text-zinc-200 outline-none focus:border-red-500 font-mono transition-all"
          />
        </div>

        {/* Content type tag filters */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-lg md:col-span-2 overflow-x-auto">
          {([
            { id: 'ALL', label: 'Todos' },
            { id: 'video', label: '🎥 Vídeos' },
            { id: 'audio', label: '🎧 Áudios' },
            { id: 'pdf', label: '📄 PDFs' },
            { id: 'quiz', label: '❓ Quizzes' },
            { id: 'exercise', label: '🏋️ Exercícios' }
          ] as const).map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-1 px-2.5 rounded text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                selectedType === type.id 
                  ? 'bg-red-650 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. THE NETFLIX SHELF LINES ("PRATELEIRAS") */}
      <div className="space-y-8">
        
        {/* ROW 1: CONTINUAR ASSISTINDO */}
        {Object.keys(assetProgress).some(id => assetProgress[id] > 0 && assetProgress[id] < 100) && (
          <div className="space-y-3">
            <h3 className="font-display font-black text-sm tracking-widest text-zinc-250 flex items-center gap-2 uppercase">
              <Clock className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Continuar Assistindo / Estudando</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {assetsList.filter(x => assetProgress[x.id] > 0 && assetProgress[x.id] < 100).map(asset => (
                <NetflixAssetCard 
                  key={asset.id}
                  asset={asset}
                  progressVal={assetProgress[asset.id]}
                  isFavorite={favorites.includes(asset.id)}
                  onToggleFav={(e) => toggleFavorite(asset.id, e)}
                  onSelect={() => handleOpenAsset(asset)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ROW 2: FAVORITADOS / MINHA LISTA */}
        {favorites.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display font-black text-sm tracking-widest text-zinc-250 flex items-center gap-2 uppercase">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Minha Lista de Estudos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {assetsList.filter(x => favorites.includes(x.id)).map(asset => (
                <NetflixAssetCard 
                  key={asset.id}
                  asset={asset}
                  progressVal={assetProgress[asset.id] || 0}
                  isFavorite={true}
                  onToggleFav={(e) => toggleFavorite(asset.id, e)}
                  onSelect={() => handleOpenAsset(asset)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ROW 3: ALL MATCHED RESOURCE ENTRIES */}
        <div className="space-y-3">
          <div className="border-b border-zinc-850 pb-2 flex justify-between items-center">
            <h3 className="font-display font-black text-sm tracking-widest text-zinc-200 uppercase">
              Catálogo de Módulos ({selectedBelt === 'ALL' ? 'Todas as Faixas' : `Faixa ${selectedBelt}`})
            </h3>
            <span className="text-[10px] font-mono text-zinc-450">Títulos encontrados: {getFilteredAssets().length}</span>
          </div>

          {getFilteredAssets().length === 0 ? (
            <div className="p-12 text-center bg-zinc-950/60 rounded-xl border border-zinc-850 space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs text-zinc-400">Nenhum título localizado com os filtros aplicados.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedBelt('ALL'); setSelectedType('ALL'); }}
                className="p-1 px-3 bg-zinc-900 border border-zinc-805 hover:bg-zinc-800 text-zinc-300 text-xs rounded font-mono"
              >
                Resetar Filtros Generais
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="lessons-catalog-grid">
              {getFilteredAssets().map(asset => (
                <NetflixAssetCard 
                  key={asset.id}
                  asset={asset}
                  progressVal={assetProgress[asset.id] || 0}
                  isFavorite={favorites.includes(asset.id)}
                  onToggleFav={(e) => toggleFavorite(asset.id, e)}
                  onSelect={() => handleOpenAsset(asset)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ROW 4: BENTO BOX GAME ACHIEVEMENTS (CONQUISTAS) */}
        <div className="bg-[#151515] p-5 rounded-2xl border border-zinc-850 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display font-extrabold text-sm text-zinc-200">Recompensas Militares & Conquistas (Achievements Hub)</h3>
              <p className="text-[10px] text-zinc-500">Avance nos vídeos, áudios e manuais para liberar e dominar novos títulos de status.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {achievementsList.map(item => {
              // Simulated evaluation logic for testability:
              // ach-first-step: w-vid-1 completed
              // ach-pronounce-master: w-aud-1 progress > 0
              // ach-quiz-beast: score is top/saved
              // ach-blue-unlocked: azul unlocked in array
              // ach-black-belt-seminar: black belt is unlocked in certificates
              const isUnlocked = 
                item.id === 'ach-first-step' ? assetProgress['w-vid-1'] === 100 :
                item.id === 'ach-pronounce-master' ? Object.keys(assetProgress).some(id => id.includes('-aud-') && assetProgress[id] === 100) :
                item.id === 'ach-quiz-beast' ? Object.keys(assetProgress).some(id => id.includes('-qz-') && assetProgress[id] === 100) :
                item.id === 'ach-blue-unlocked' ? unlockedCertificates.includes('Azul') :
                item.id === 'ach-black-belt-seminar' ? unlockedCertificates.includes('Preto') : false;

              return (
                <div 
                  key={item.id}
                  className={`p-3 rounded-xl border flex gap-3 transition-all ${
                    isUnlocked 
                      ? 'bg-zinc-950/80 border-amber-500/20 text-white' 
                      : 'bg-zinc-950/30 border-zinc-850 opacity-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl shrink-0">
                    {item.badge}
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-[11px] font-black leading-tight ${isUnlocked ? 'text-amber-400' : 'text-zinc-400'}`}>
                      {item.title}
                    </p>
                    <p className="text-[9.5px] text-zinc-450 leading-relaxed font-sans">{item.description}</p>
                    <div className="flex items-center gap-1.5 pt-1 text-[8.5px] font-mono">
                      <span className="text-zinc-500">Gatilho:</span>
                      <span className="text-zinc-400 font-semibold">{item.condition}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* =======================================================================
          5. IMMERSIVE NETFLIX MEDIA PLAYER ACCORDION OVERLAY MODAL
          ======================================================================= */}
      {activePlayAsset && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#161616] border border-zinc-800 rounded-2xl max-w-3xl w-full text-zinc-100 overflow-hidden shadow-2xl relative my-8 animate-scaleUp">
            
            {/* Close button modal header */}
            <button
              onClick={() => {
                setActivePlayAsset(null);
                setIsPlayingMedia(false);
              }}
              className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-zinc-950 border border-zinc-805 text-zinc-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* A. PLATFORM BANNER HEADER PREVIEW */}
            <div 
              className="h-40 sm:h-56 bg-cover bg-center relative"
              style={{ 
                backgroundImage: `linear-gradient(to top, rgba(22,22,22,1) 0%, rgba(22,22,22,0.4) 60%, rgba(22,22,22,0.1) 100%), url('${activePlayAsset.imageUrl}')` 
              }}
            >
              <div className="absolute bottom-4 left-4 sm:left-6 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-0.5 px-2 bg-red-650 text-[8.5px] font-black uppercase rounded tracking-wider">
                    {activePlayAsset.category}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">{activePlayAsset.duration} • {activePlayAsset.difficulty}</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-display font-black text-white">{activePlayAsset.title}</h2>
              </div>
            </div>

            {/* B. DETAILED NAV TAB SELECTORS */}
            <div className="flex border-b border-zinc-800 bg-[#121212] px-4 overflow-x-auto text-xs font-bold gap-1 sm:gap-2">
              <button
                onClick={() => setMediaTab('play')}
                className={`py-3.5 px-3 border-b-2 text-[11px] transition-all cursor-pointer ${
                  mediaTab === 'play' ? 'border-red-650 text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {activePlayAsset.type === 'video' ? '🎥 Assistir Aula' : 
                 activePlayAsset.type === 'audio' ? '🎧 Escutar Pronúncia' : '📄 Ler Documento'}
              </button>

              {/* Sub-tab 1: Audio / voice exercise */}
              {activePlayAsset.type === 'audio' && (
                <button
                  onClick={() => setMediaTab('exercise')}
                  className={`py-3.5 px-3 border-b-2 text-[11px] transition-all cursor-pointer ${
                    mediaTab === 'exercise' ? 'border-red-650 text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  🗣️ Drill de Voz Artificial
                </button>
              )}

              {/* Sub-tab 2: Quiz fix */}
              {activePlayAsset.type === 'quiz' && (
                <button
                  onClick={() => setMediaTab('quiz')}
                  className={`py-3.5 px-3 border-b-2 text-[11px] transition-all cursor-pointer ${
                    mediaTab === 'quiz' ? 'border-red-650 text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  ❓ Desafio do Quiz
                </button>
              )}

              {/* Sub-tab 3: Structural exercises */}
              {activePlayAsset.type === 'exercise' && (
                <button
                  onClick={() => setMediaTab('exercise')}
                  className={`py-3.5 px-3 border-b-2 text-[11px] transition-all cursor-pointer ${
                    mediaTab === 'exercise' ? 'border-red-650 text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  🏋️ Aula de Fixação Gramatical
                </button>
              )}

              <button
                onClick={() => setMediaTab('achieve')}
                className={`py-3.5 px-3 border-b-2 text-[11px] transition-all cursor-pointer ${
                  mediaTab === 'achieve' ? 'border-red-650 text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                🎁 Recompensa (+{activePlayAsset.xpReward} XP)
              </button>
            </div>

            {/* C. BODY CONTENTS BY TAB */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {/* PLAY TAB (VIDEO / AUDIO / PDF PLAYER INTERFACE) */}
              {mediaTab === 'play' && (
                <div className="space-y-4 animate-fadeIn">
                   {/* 1. Video Player Custom layout styling */}
                  {activePlayAsset.type === 'video' && (
                    <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 relative h-48 sm:h-72 flex flex-col justify-between p-3">
                      
                      {/* Video playback monitor screen simulation */}
                      {isPlayingMedia ? (
                        (() => {
                          const yId = getYoutubeId(activePlayAsset.videoUrl);
                          if (!yId) {
                            return (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-red-500 font-mono text-center p-4">
                                <PlayCircle className="w-10 h-10 text-red-650 animate-pulse mb-2" />
                                <span className="text-xs font-bold uppercase">Vídeo ainda não cadastrado.</span>
                              </div>
                            );
                          }
                          return (
                            <iframe
                              src={`https://www.youtube.com/embed/${yId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                              title={activePlayAsset.title}
                              className="absolute inset-0 w-full h-full border-0 z-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          );
                        })()
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          <PlayCircle className="w-16 h-16 text-zinc-650" />
                        </div>
                      )}

                      {/* Video play control parameters */}
                      <div className="z-10 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850 flex justify-between items-center text-[10px] font-mono select-none">
                        <span className="text-glow text-red-500 uppercase">Stream: Active</span>
                        <span className="text-zinc-400">SSL Criptografado TLS 1.3</span>
                      </div>

                      <div className="z-10 bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 space-y-2.5">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <button
                            onClick={() => setIsPlayingMedia(!isPlayingMedia)}
                            className="bg-red-600 hover:bg-red-500 p-1 px-3 text-[10px] font-black rounded cursor-pointer transition text-white"
                          >
                            {isPlayingMedia ? '⏸ PAUSAR' : '▶ TRANSMITIR VÍDEO'}
                          </button>
                          <span>{mediaPlaybackProgress}% concluído</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                          <div className="h-full bg-red-650 transition-all duration-300" style={{ width: `${mediaPlaybackProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Audio Player interface layout */}
                  {activePlayAsset.type === 'audio' && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono">Vocabulário & Pronúncia Assistida</span>
                        <button
                          onClick={() => setIsPlayingMedia(!isPlayingMedia)}
                          className="p-1 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10.5px] rounded-lg font-bold text-red-500 cursor-pointer"
                        >
                          {isPlayingMedia ? '⏸ Pausar Áudio' : '▶ Tocar Explicação'}
                        </button>
                      </div>

                      {/* Interactive audio bars */}
                      <div className="flex items-end justify-center gap-1 h-14 bg-zinc-900 p-2 border border-zinc-850 rounded-lg overflow-hidden">
                        {[4, 8, 12, 6, 14, 9, 3, 10, 15, 7, 5, 11, 4, 8, 12, 6, 14, 9, 3, 10, 15, 7, 5, 11].map((bar, i) => (
                          <div 
                            key={i}
                            className={`w-1.5 h-full rounded transition bg-gradient-to-t`}
                            style={{ 
                              height: isPlayingMedia ? `${Math.max(10, Math.sin((mediaPlaybackProgress + i) * 0.5) * 45 + 50)}%` : `${bar * 6}%`,
                              backgroundColor: isPlayingMedia ? '#dc2626' : '#27272a'
                            }}
                          />
                        ))}
                      </div>

                      {/* Vocab click to speech column lines */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-zinc-500 uppercase font-mono">Clique no alto-falante para testar Speech Synthesis:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activePlayAsset.audioWords?.map((term, i) => (
                            <div key={i} className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-white leading-none">{term.word}</p>
                                <p className="text-[10px] font-mono text-zinc-400 mt-1 italic">Pronúncia: /{term.pronunciation}/</p>
                                <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Tradução: {term.translation}</p>
                              </div>
                              <button
                                onClick={() => speakTextToSpeech(term.word)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer text-[10px] flex items-center gap-1"
                                title="Pronunciar Inglês"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
                                <span>Falar</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. PDF Slide documentation reader */}
                  {activePlayAsset.type === 'pdf' && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase">Caderno Técnico (PDF Slide Viewer)</span>
                        <button
                          onClick={() => {
                            handleCompleteAsset(activePlayAsset.id, activePlayAsset.xpReward);
                            showToast('PDF baixado para seu dispositivo simulado!', 'info');
                          }}
                          className="p-1 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] rounded text-emerald-400 font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-emerald-400" />
                          <span>Baixar Manual</span>
                        </button>
                      </div>

                      {/* Simulated booklet slides */}
                      <div className="bg-zinc-900 rounded-xl border border-zinc-850 p-5 space-y-3 font-mono text-[11px] leading-relaxed relative min-h-36">
                        <h4 className="text-zinc-200 border-b border-zinc-800 pb-1.5 font-bold uppercase">{activePlayAsset.title}</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-zinc-305 scrollbar-thin">
                          {activePlayAsset.pdfLines?.map((line, k) => (
                            <p key={k} className="border-l border-red-650 pl-2 text-zinc-350">{line}</p>
                          ))}
                        </div>
                        <div className="text-[9px] text-zinc-650 pt-2 select-none">
                          © JiuSpeak Academy • Homologação de Tatame Corporativa
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual Mark Complete action indicator if they want to speed finish */}
                  {!isPlayingMedia && assetProgress[activePlayAsset.id] !== 100 && (
                    <button
                      onClick={() => handleCompleteAsset(activePlayAsset.id, activePlayAsset.xpReward)}
                      className="w-full py-2.5 bg-emerald-650 hover:bg-emerald-580 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span>MARCAR ESTADO COMO CONCLUÍDO (+{activePlayAsset.xpReward} XP)</span>
                    </button>
                  )}

                </div>
              )}

              {/* SPEAK SIMULATOR EXERCISE TAB */}
              {mediaTab === 'exercise' && activePlayAsset.type === 'audio' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-zinc-400">Exercício Integrado de Reconhecimento de Voz</h4>
                    <p className="text-xs text-zinc-300 font-sans">
                      Clique em gravar e repita a frase abaixo com precisão técnica em inglês para obter pontuação do AI Coach.
                    </p>

                    <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-xl text-center space-y-2">
                      <p className="text-[9px] text-zinc-500 uppercase font-mono">Frase Técnico-Foco:</p>
                      <p className="text-sm font-extrabold text-red-500 italic">"Could we go easy on this specific training round?"</p>
                      <p className="text-[10px] text-zinc-400">Tradução: "Poderíamos ir devagar nesta rodada de treino específico?"</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
                      <button
                        onClick={handleStartSimulatedRecording}
                        disabled={isRecordingVoice}
                        className={`p-2.5 px-6 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                          isRecordingVoice 
                            ? 'bg-rose-650 text-white animate-pulse' 
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-200 hover:border-red-500'
                        }`}
                      >
                        <Mic className="w-4 h-4 text-red-500 animate-pulse" />
                        <span>{isRecordingVoice ? '🔴 Gravando...' : 'Iniciar Gravação de Voz'}</span>
                      </button>

                      {voiceAccuracyPercent !== null && (
                        <div className="flex items-center gap-3 bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                          <span className="text-[11px] font-mono text-zinc-400">Precisão Auditada:</span>
                          <span className={`text-sm font-bold font-mono ${
                            voiceAccuracyPercent >= 90 ? 'text-emerald-400' : 'text-amber-500'
                          }`}>
                            {voiceAccuracyPercent}% {voiceAccuracyPercent >= 90 ? '✔ Aprovado!' : '⚠️ Pratique'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* GRAMMAR SENTENCE PUZZLE TAB */}
              {mediaTab === 'exercise' && activePlayAsset.type === 'exercise' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-3 font-sans">
                    <h4 className="text-xs font-mono font-bold text-zinc-400">Gramática: Conector de Palavras do Tatame</h4>
                    <p className="text-xs text-zinc-300">
                      Escolha a opção que monta a tradução recomendada em inglês para: <strong>"{activePlayAsset.exerciseGoal}"</strong>.
                    </p>

                    <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-lg text-center text-xs font-mono text-zinc-400 font-bold">
                      {activePlayAsset.exerciseTask}
                    </div>

                    <div className="space-y-2">
                      {activePlayAsset.exerciseAnswerOptions?.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          disabled={exerciseSolved}
                          onClick={() => setExerciseSelectedAnswer(oIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex justify-between items-center ${
                            exerciseSelectedAnswer === oIdx 
                              ? 'bg-[#1a1a1a] border-red-600 text-white font-bold' 
                              : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span>{opt}</span>
                          <span className="text-[9px] font-mono text-zinc-500">Opção {oIdx + 1}</span>
                        </button>
                      ))}
                    </div>

                    {exerciseSelectedAnswer !== null && !exerciseSolved && (
                      <button
                        onClick={() => submitExerciseAnswer(activePlayAsset.correctExerciseIndex || 0)}
                        className="w-full py-2.5 bg-red-650 hover:bg-red-580 text-white rounded-xl text-xs font-black transition cursor-pointer"
                      >
                        Submeter tradução para avaliação do Mestre
                      </button>
                    )}

                    {exerciseSolved && (
                      <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl space-y-1 text-xs">
                        <p className="font-bold font-mono text-red-500 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Gabarito Analisado:</span>
                        </p>
                        <p className="text-zinc-305">Muitos parabéns! Você acertou na mosca. Isso consolida sua precisão na gramática técnica.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* THE MULTIPLE CHOICE QUIZZES TAB */}
              {mediaTab === 'quiz' && activePlayAsset.type === 'quiz' && activePlayAsset.quizQuestions && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Progress indices */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                    <span>Questão {currentQuizIndex + 1} de {activePlayAsset.quizQuestions.length}</span>
                    <span>Acertos atuais: {quizScore}</span>
                  </div>

                  {!quizFinished ? (
                    <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-4" id="quiz-solver-cage">
                      <div className="p-3.5 bg-zinc-900 border border-zinc-850 rounded-xl font-bold font-sans text-xs sm:text-sm text-zinc-200">
                        {activePlayAsset.quizQuestions[currentQuizIndex].question}
                      </div>

                      <div className="space-y-2">
                        {activePlayAsset.quizQuestions[currentQuizIndex].options.map((option, oIdx) => {
                          const isSelected = quizSelectedOption === oIdx;
                          const correctIdx = activePlayAsset.quizQuestions?.[currentQuizIndex].correctOptionIndex ?? 0;
                          
                          let cardStyle = 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-zinc-700';
                          if (isSelected) {
                            cardStyle = oIdx === correctIdx 
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 font-bold' 
                              : 'bg-rose-950/40 border-rose-500/50 text-rose-455 font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={quizSelectedOption !== null}
                              onClick={() => submitQuizAnswer(correctIdx, oIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${cardStyle}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {quizSelectedOption !== null && (
                        <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-850 space-y-2 animate-fadeIn font-sans text-[11px] sm:text-xs">
                          <p className="font-extrabold text-amber-500 uppercase tracking-wider font-mono">Feedback e Análise do Coach:</p>
                          <p className="text-zinc-300">{activePlayAsset.quizQuestions[currentQuizIndex].explanation}</p>
                          
                          <div className="flex justify-end pt-2">
                            {currentQuizIndex < activePlayAsset.quizQuestions.length - 1 ? (
                              <button
                                onClick={() => {
                                  setCurrentQuizIndex(prev => prev + 1);
                                  setQuizSelectedOption(null);
                                }}
                                className="p-1 px-4 bg-red-650 hover:bg-red-580 text-white rounded text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                              >
                                <span>Próxima Questão</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleFinishQuiz(activePlayAsset.quizQuestions?.length || 0, activePlayAsset.xpReward)}
                                className="p-1 px-4 bg-emerald-650 hover:bg-emerald-580 text-white rounded text-[10px] font-bold cursor-pointer transition"
                              >
                                Encerrar Teste e Somar XP
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-zinc-950 rounded-xl border border-zinc-800 space-y-3 font-mono text-xs">
                      <Trophy className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
                      <p className="font-bold text-sm text-zinc-150">Gabarito de Fixação Concluído!</p>
                      <p className="text-zinc-400">Total de acertos pontuais: {quizScore} de {activePlayAsset.quizQuestions.length}</p>
                      <p className="text-zinc-550">Os pontos de experiência (XP) foram indexados ao painel principal do atleta.</p>
                      
                      <button
                        onClick={() => {
                          handleCompleteAsset(activePlayAsset.id, activePlayAsset.xpReward);
                          setActivePlayAsset(null);
                        }}
                        className="p-1.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-250 border border-zinc-800 rounded font-black cursor-pointer shadow mt-2"
                      >
                        Sair do Questionário
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* ACHIEVEMENTS & REWARDS LIST FOR ACTIVE MODAL ITEM */}
              {mediaTab === 'achieve' && (
                <div className="space-y-4 animate-fadeIn text-xs sm:text-sm font-sans">
                  <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider font-mono">
                      <Star className="w-4 h-4 fill-red-500" />
                      <span>Premiações de Conclusão Técnica</span>
                    </div>

                    <p className="text-zinc-300">
                      Cada lição concluída recompensa seu perfil com XP real e Kimono Coins (KCs). Isso impacta diretamente na sua elegância geral de faixas e ranking geral no PvP.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl text-center">
                        <p className="text-[10px] text-zinc-500 uppercase font-mono">XP de Maestria</p>
                        <p className="text-lg font-black text-rose-500 font-mono mt-0.5">+{activePlayAsset.xpReward} XP</p>
                      </div>
                      <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl text-center">
                        <p className="text-[10px] text-zinc-500 uppercase font-mono">Bônus Kimono Coins</p>
                        <p className="text-lg font-black text-amber-500 font-mono mt-0.5">+{Math.round(activePlayAsset.xpReward / 3)} KC</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#111] border border-zinc-900 text-zinc-400 font-extrabold flex justify-between items-center text-[10px] font-mono">
                      <span>Status da Lição:</span>
                      <span className={assetProgress[activePlayAsset.id] === 100 ? 'text-emerald-400' : 'text-zinc-500'}>
                        {assetProgress[activePlayAsset.id] === 100 ? '✔ CONCLUÍDA' : '⌛ PENDENTE'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* =======================================================================
          6. REAL-TIME HIGH RESOLUTION PRINTABLE COLD GRADUATION DIPLOMA
          ======================================================================= */}
      {viewingCertificateBelt && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
          <div className="bg-[#141414] border-2 border-amber-600/30 rounded-2xl max-w-3xl w-full text-zinc-100 p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Elegant watermark layout */}
            <div className="absolute top-4 right-4 w-20 h-20 sm:w-36 sm:h-36 rounded-full border border-amber-500/10 flex items-center justify-center text-amber-550 text-5xl sm:text-7xl select-none opacity-20 pointer-events-none">
              🥋
            </div>

            {/* Back Close button */}
            <button
              onClick={() => setViewingCertificateBelt(null)}
              className="absolute top-4 right-4 p-1 rounded-full bg-zinc-905 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-1">
                <span className="text-[9px] tracking-widest font-mono text-amber-500 font-black uppercase">
                  JIUSPEAK UNIVERSAL LANGUAGES SAAS CREDENTIAL
                </span>
                <h2 className="text-xl sm:text-3.5xl font-display font-black text-white tracking-wide uppercase">
                  CERTIFICADO DE GRADUANDO PREMIUM
                </h2>
              </div>

              <div className="space-y-2 py-5 border-y border-zinc-850 text-xs sm:text-sm font-sans max-w-lg mx-auto text-center font-medium leading-relaxed">
                <p className="text-zinc-400">Certificamos com absoluto louvor e conformidade técnica de tatame que o atleta e guerreiro(a)</p>
                <p className="text-lg sm:text-xl font-bold font-display text-white italic underline decoration-amber-500 decoration-2">
                  {user.name}
                </p>
                <p className="text-zinc-400">
                  concluiu com êxito todas as lições em vídeo, audioguivos de pronúncia, regras detalhadas com a arbitragem internacional, quizzes de fixação e diálogos de rádio na graduação esportiva de
                </p>
                <p className="font-extrabold text-amber-500 text-base sm:text-lg">
                  FAIXA {viewingCertificateBelt.toUpperCase()}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-[10px] font-mono text-zinc-400 text-left">
                <div>
                  <p className="text-zinc-550">CHAVE DO DIPLOMA:</p>
                  <p className="text-zinc-300 font-bold uppercase">JS-{viewingCertificateBelt.toLowerCase()}-{studySeconds}</p>
                </div>
                <div>
                  <p className="text-zinc-550">DATA DE EMISSÃO:</p>
                  <p className="text-zinc-300 font-bold">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="border-t border-dashed border-zinc-700 pt-2 text-center sm:text-left">
                  <p className="text-zinc-300 font-bold">Roger Gracie</p>
                  <p className="text-zinc-500 uppercase text-[8px]">Diretor de Arbitragem</p>
                </div>
              </div>

              {/* Printable PDF button */}
              <div className="pt-4 flex justify-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="p-1 px-4 bg-amber-500 hover:bg-amber-400 text-slate-100 font-black rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer hover:scale-103"
                >
                  <Printer className="w-4 h-4 text-slate-100" /> Print / Save Certificate PDF
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* FOOTER METRIC SLA */}
      <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-850 text-[10px] text-zinc-500 flex justify-between items-center font-mono">
        <span>Curriculum Unificado de Conversação e Arbitragem</span>
        <span className="flex items-center gap-1.5 text-glow select-none">
          <span>Ambiente Autêntico Premium</span>
          <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
        </span>
      </div>

    </div>
  );
}

// =========================================================================
// LOWER INLINE COMPONENT: NETFLIX CARDS WITH GRADIENTS AND PROGRESSES
// =========================================================================
interface CardProps {
  key?: string;
  asset: NetflixAsset;
  progressVal: number;
  isFavorite: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
  onSelect: () => void;
}

function NetflixAssetCard({ asset, progressVal, isFavorite, onToggleFav, onSelect }: CardProps) {
  
  const getBadgeTypeStyle = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-600 text-white';
      case 'audio': return 'bg-blue-650 text-white';
      case 'pdf': return 'bg-emerald-650 text-white';
      case 'quiz': return 'bg-purple-650 text-white';
      case 'exercise': return 'bg-amber-600 text-white';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  return (
    <div 
      onClick={onSelect}
      className="bg-zinc-950/80 border border-zinc-850 rounded-xl overflow-hidden hover:border-red-600/40 hover:-translate-y-1 hover:scale-[1.01] transition-all cursor-pointer shadow-md flex flex-col justify-between h-56 relative group group/card"
    >
      
      {/* Target visual image wrapper */}
      <div className="h-28 bg-cover bg-center relative" style={{ backgroundImage: `url('${asset.imageUrl}')` }}>
        {/* Dynamic vignette shadow on the lower layout */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
        
        {/* Micro overlay actions */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleFav}
            className="p-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-805 cursor-pointer flex items-center justify-center p-1"
            title="Adicionar à Minha Lista"
          >
            <Heart className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-550' : ''}`} />
          </button>
        </div>

        {/* Technical rank badge */}
        <span className="absolute top-2 left-2 text-[8px] font-mono tracking-wider font-extrabold uppercase p-1 bg-zinc-950/65 rounded text-zinc-200 border border-zinc-805/30 leading-none">
          Belt: {asset.category}
        </span>
      </div>

      {/* Narrative bodies */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1 pt-2">
        <div className="space-y-0.5">
          <div className="flex justify-between items-center text-[9px] font-mono font-bold leading-none select-none">
            <span className={`p-0.5 px-2.5 rounded font-black uppercase text-[8px] leading-tight ${getBadgeTypeStyle(asset.type)}`}>
              {asset.type.toUpperCase()}
            </span>
            <span className="text-zinc-500">{asset.duration}</span>
          </div>

          <h4 className="font-sans font-extrabold text-[12px] text-zinc-200 line-clamp-1 leading-tight pt-1 group-hover/card:text-red-500 transition-colors">
            {asset.title}
          </h4>
          <p className="text-[10.5px] text-zinc-450 line-clamp-2 leading-snug">{asset.description}</p>
        </div>

        {/* Dynamic lower progress bars */}
        <div className="space-y-1">
          {progressVal > 0 && (
            <div className="w-full bg-zinc-90 w bg-[#111] border border-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${progressVal}%` }}
              />
            </div>
          )}

          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-550 leading-none select-none">
            <span className="uppercase text-red-500 font-bold">+{asset.xpReward} XP</span>
            <span className="italic">{asset.subcategory}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
