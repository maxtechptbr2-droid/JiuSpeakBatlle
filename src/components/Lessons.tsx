/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Plus, 
  Check, 
  Heading, 
  Search, 
  Heart, 
  Download, 
  Clock, 
  Award, 
  CheckCircle, 
  BookOpen, 
  Volume2, 
  Mic, 
  Languages, 
  Brain, 
  ArrowRight, 
  History, 
  Trophy, 
  Sparkles, 
  Compass, 
  ChevronRight, 
  Maximize2, 
  VolumeX, 
  Volume1, 
  Loader2, 
  FileText, 
  ThumbsUp, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Printer,
  ChevronDown
} from 'lucide-react';
import { UserProfile, Course, Lesson, QuizQuestion, BeltRank } from '../types';
import { PLAYBOOK_DATA, NETFLIX_ASSETS, NetflixAsset, PlaybookLesson, PlaybookSyllabus } from '../data/lessonsData';

interface LessonsProps {
  user: UserProfile;
  courses: Course[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  onAddAuditLog: (type: any, desc: string, amtBRL?: number, amtKC?: number) => void;
  addXp: (amount: number, reason: string) => void;
  addCoins: (amount: number, reason: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
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

  // --- PERSISTENCE & ANALYTICAL STATES ---
  
  // Favorites list for Netflix list
  const [favorites, setFavorites] = useState<string[]>(() => {
    const cached = localStorage.getItem('jiuspeak_netflix_favorites');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return []; }
    }
    return ['vid-postura-branca', 'pdf-vocab-tatame'];
  });

  // Asset Study progress (id -> percentage 0 to 100)
  const [progress, setProgress] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('jiuspeak_netflix_progress');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return {}; }
    }
    // initialize some mock default progress
    return { 'vid-postura-branca': 65, 'pdf-vocab-tatame': 30 };
  });

  // Watch history list
  const [watchHistory, setWatchHistory] = useState<{ id: string; title: string; date: string; type: string }[]>(() => {
    const cached = localStorage.getItem('jiuspeak_netflix_history');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return []; }
    }
    return [
      { id: 'vid-postura-branca', title: 'Vídeo: Guarda Fechada - Segredos de Postura', date: new Date().toLocaleString(), type: 'video' }
    ];
  });

  // Study Time counter in seconds
  const [studyTime, setStudyTime] = useState<number>(() => {
    const cached = localStorage.getItem('jiuspeak_study_seconds');
    return cached ? parseInt(cached, 10) : 18200; // default 5 hours initial
  });

  // List of simulated downloaded asset IDs
  const [downloaded, setDownloaded] = useState<string[]>(() => {
    const cached = localStorage.getItem('jiuspeak_netflix_downloads');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return []; }
    }
    return [];
  });

  // Certificates list
  const [certificates, setCertificates] = useState<{ id: string; belt: string; date: string }[]>(() => {
    const cached = localStorage.getItem('jiuspeak_netflix_certificates');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return []; }
    }
    return [];
  });

  // --- INTERACTION & NAVIGATION STATES ---
  const [activeTab, setActiveTab] = useState<'home' | 'courses' | 'videos' | 'pdfs' | 'audios' | 'certificates'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeltFilter, setSelectedBeltFilter] = useState<'ALL' | BeltRank>('ALL');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>('ALL');

  // Active play / media model
  const [activeMedia, setActiveMedia] = useState<NetflixAsset | null>(null);
  const [isSimulatingPlay, setIsSimulatingPlay] = useState(false);
  const [simulatedMediaProgress, setSimulatedMediaProgress] = useState(0);

  // Download simulation
  const [downloadingAssetId, setDownloadingAssetId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Quiz active indexes
  const [activeQuizIdx, setActiveQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Step indicator for technique drill
  const [activeTechniqueStep, setActiveTechniqueStep] = useState(0);

  // Voice recording mock
  const [isRecording, setIsRecording] = useState(false);
  const [speechAccuracy, setSpeechAccuracy] = useState<number | null>(null);

  // Playbook Interactive course tab
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [activeSyllabus, setActiveSyllabus] = useState<PlaybookSyllabus>(PLAYBOOK_DATA[0]);
  const [activePlaybookLessonIdx, setActivePlaybookLessonIdx] = useState(0);
  const [activePlaybookStep, setActivePlaybookStep] = useState<'study' | 'quiz'>('study');
  const [playbookQuizAnswered, setPlaybookQuizAnswered] = useState(false);
  const [playbookQuizSelected, setPlaybookQuizSelected] = useState<number | null>(null);

  // --- USE EFFECTS ---

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem('jiuspeak_netflix_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_netflix_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_netflix_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_study_seconds', studyTime.toString());
  }, [studyTime]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_netflix_downloads', JSON.stringify(downloaded));
  }, [downloaded]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_netflix_certificates', JSON.stringify(certificates));
  }, [certificates]);

  // Handle live ticking countdown & progress simulator when video/audio is "playing"
  useEffect(() => {
    let interval: any = null;
    if (activeMedia && isSimulatingPlay) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
        setSimulatedMediaProgress(prev => {
          if (prev >= 100) {
            handleCompleteActiveAsset();
            return 100;
          }
          const nextVal = prev + 5; // advance 5% per second
          updateAssetProgress(activeMedia.id, nextVal);
          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeMedia, isSimulatingPlay]);

  // --- METHODS & HANDLERS ---

  const formatStudyTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const updateAssetProgress = (id: string, val: number) => {
    setProgress(prev => ({
      ...prev,
      [id]: Math.min(100, Math.max(prev[id] || 0, val))
    }));
  };

  const toggleFavorite = (id: string, title?: string) => {
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(x => x !== id));
      showToast(`Removido da Minha Lista`, 'info');
    } else {
      setFavorites(prev => [...prev, id]);
      showToast(`Adicionado à Minha Lista ❤️`, 'success');
    }
  };

  const triggerSearchAndFilters = (item: NetflixAsset) => {
    const matchSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.subcategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchBelt = selectedBeltFilter === 'ALL' || item.category === selectedBeltFilter;
    const matchSub = selectedSubcategoryFilter === 'ALL' || item.subcategory === selectedSubcategoryFilter;

    return matchSearch && matchBelt && matchSub;
  };

  // Open asset media player overlays
  const handleOpenMedia = (asset: NetflixAsset) => {
    setActiveMedia(asset);
    setIsSimulatingPlay(false);
    setSimulatedMediaProgress(progress[asset.id] || 0);
    setActiveQuizIdx(0);
    setQuizAnswers({});
    setIsQuizFinished(false);
    setActiveTechniqueStep(0);
    setSpeechAccuracy(null);
    setIsRecording(false);

    // Save history
    const alreadyLoggedExist = watchHistory.some(x => x.id === asset.id);
    if (!alreadyLoggedExist) {
      setWatchHistory(prev => [
        { id: asset.id, title: asset.title, date: new Date().toLocaleString(), type: asset.type },
        ...prev.slice(0, 19)
      ]);
    }
  };

  // Simulated completions with rewards
  const handleCompleteActiveAsset = () => {
    if (!activeMedia) return;
    setIsSimulatingPlay(false);
    updateAssetProgress(activeMedia.id, 100);
    
    // Reward XP + Coins
    const rewardXP = activeMedia.xpReward;
    const rewardCoins = Math.round(rewardXP / 2);
    
    addXp(rewardXP, `Conclusão do Conteúdo: ${activeMedia.title}`);
    addCoins(rewardCoins, `Moedas de Estudo: ${activeMedia.title}`);
    onAddAuditLog('module_completed', `Atleta concluiu o módulo de estudo "${activeMedia.title}"`, undefined, rewardCoins);

    showToast(`Parabéns! Você concluiu "${activeMedia.title}"! (+${rewardXP} XP e +${rewardCoins} KC)`, 'success');
  };

  // Trigger simulated offline download
  const handleTriggerDownload = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    if (downloaded.includes(assetId)) {
      setDownloaded(prev => prev.filter(x => x !== assetId));
      showToast(`Download excluído do dispositivo`, 'info');
      return;
    }

    setDownloadingAssetId(assetId);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloaded(p => [...p, assetId]);
          setDownloadingAssetId(null);
          showToast(`Download de Módulo concluído!`, 'success');
          return 100;
        }
        return prev + 20; // 20% steps
      });
    }, 300);
  };

  // Text-To-Speech Synthesis
  const speakCommandPhrase = (phrase: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
      showToast(`Fonoaudiologia: Reproduzindo pronúncia oficial...`, 'info');
    } else {
      showToast(`Síntese vocal de comandos de inglês não disponível no navegador`, 'error');
    }
  };

  // Voice recording simulation
  const handleTriggerSpeakDrill = (phrase: string) => {
    setIsRecording(true);
    setSpeechAccuracy(null);
    showToast(`Pronuncie em voz alta para avaliação automática...`, 'info');

    setTimeout(() => {
      const randomAcc = Math.floor(Math.random() * 21) + 80; // 80 - 100% accuracy
      setSpeechAccuracy(randomAcc);
      setIsRecording(false);
      showToast(`Gravação processada! Precisão de pronúncia: ${randomAcc}%`, 'success');
    }, 2000);
  };

  // Claim belt certificate if they achieved 100% progress
  const handleClaimCertificate = (belt: BeltRank) => {
    // Check if certificate already claimed
    const alreadyHas = certificates.some(x => x.belt === belt);
    if (alreadyHas) {
      showToast(`Você já possui este certificado de Faixa ${belt} emitido!`, 'info');
      return;
    }

    // Verify progress of that belt
    const beltAssets = NETFLIX_ASSETS.filter(x => x.category === belt);
    const completedCount = beltAssets.filter(x => progress[x.id] === 100).length;
    
    // Allow override / flexible claim for gamification so they can play with it
    const isEligible = completedCount > 0 || belt === 'Branca';

    if (!isEligible) {
      showToast(`Estude mais módulos da Faixa ${belt} para poder emitir sua licença de formação técnica!`, 'error');
      return;
    }

    const newCert = {
      id: `cert-${belt.toLowerCase()}-${Math.floor(Math.random()*90000) + 10000}`,
      belt,
      date: new Date().toLocaleDateString()
    };

    setCertificates(prev => [...prev, newCert]);
    addXp(300, `Geração de Certificado: Faixa ${belt}`);
    showToast(`Parabéns! Certificado de Graduação Faixa ${belt} emitido oficialmente! 🏆`, 'success');
  };

  // Compute Overall Progress
  const totalAssetsCount = NETFLIX_ASSETS.length;
  const completedAssetsCount = NETFLIX_ASSETS.filter(x => progress[x.id] === 100).length;
  const cumulativeProgress = (Object.values(progress) as number[]).reduce((a, b) => a + b, 0);
  const overallPerformance = totalAssetsCount > 0 ? Math.round(cumulativeProgress / totalAssetsCount) : 0;

  // Filter items by active tab selection
  const getFilteredAssets = () => {
    return NETFLIX_ASSETS.filter(item => {
      // Tab filter
      if (activeTab === 'courses' && item.type !== 'course') return false;
      if (activeTab === 'videos' && item.type !== 'video') return false;
      if (activeTab === 'pdfs' && item.type !== 'pdf') return false;
      if (activeTab === 'audios' && item.type !== 'audio' && item.type !== 'technique') return false;
      
      // Search / Selectors filters
      return triggerSearchAndFilters(item);
    });
  };

  // Continue Studying calculations
  const continueWatchingItems = NETFLIX_ASSETS.filter(item => {
    const val = progress[item.id] || 0;
    return val > 0 && val < 100;
  });

  // Favorites items list
  const favoritedList = NETFLIX_ASSETS.filter(item => favorites.includes(item.id));

  return (
    <div className="bg-[#141414] text-slate-100 min-h-screen p-1 sm:p-6 pb-20 space-y-6 select-none relative font-sans" id="netflix-bjj-root">
      
      {/* 1. UPPER NETFLIX NAVIGATION BAR & ADVANCED SEARCH GRID */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#181818] p-4 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-lg text-white shadow-md animate-pulse">
            🥋
          </div>
          <div>
            <h2 className="font-display font-extrabold text-base tracking-wider text-rose-500 uppercase">JiuSpeak Premium</h2>
            <p className="text-[10px] text-zinc-400 font-mono">Netflix do Jiu-Jitsu & Conversação Inglesa</p>
          </div>
        </div>

        {/* Tab switcher buttons structured like categories */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button 
            onClick={() => { setActiveTab('home'); }}
            className={`p-1.5 px-3 rounded-lg text-xs font-bold font-sans tracking-wide transition-all ${activeTab === 'home' ? 'bg-red-600 text-white shadow-lg' : 'bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-zinc-300'}`}
          >
            Início
          </button>
          <button 
            onClick={() => { setActiveTab('courses'); }}
            className={`p-1.5 px-3 rounded-lg text-xs font-bold font-sans tracking-wide transition-all ${activeTab === 'courses' ? 'bg-red-600 text-white shadow-lg' : 'bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-zinc-300'}`}
          >
            📚 Cursos
          </button>
          <button 
            onClick={() => { setActiveTab('videos'); }}
            className={`p-1.5 px-3 rounded-lg text-xs font-bold font-sans tracking-wide transition-all ${activeTab === 'videos' ? 'bg-red-600 text-white shadow-lg' : 'bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-zinc-300'}`}
          >
            🎥 Vídeos
          </button>
          <button 
            onClick={() => { setActiveTab('pdfs'); }}
            className={`p-1.5 px-3 rounded-lg text-xs font-bold font-sans tracking-wide transition-all ${activeTab === 'pdfs' ? 'bg-red-600 text-white shadow-lg' : 'bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-zinc-300'}`}
          >
            📄 PDFs
          </button>
          <button 
            onClick={() => { setActiveTab('audios'); }}
            className={`p-1.5 px-3 rounded-lg text-xs font-bold font-sans tracking-wide transition-all ${activeTab === 'audios' ? 'bg-red-600 text-white shadow-lg' : 'bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-zinc-300'}`}
          >
            🎧 Áudios & Técnicas
          </button>
          <button 
            onClick={() => { setActiveTab('certificates'); }}
            className={`p-1.5 px-3 rounded-lg text-xs font-bold font-sans tracking-wide transition-all ${activeTab === 'certificates' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-zinc-300'}`}
          >
            🏆 Certificados
          </button>
        </div>
      </div>

      {/* 2. ADVANCED FILTERS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#181818] p-3 rounded-xl border border-neutral-850">
        {/* Term search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Busca por termo técnica ou lição..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 p-2 pl-9 rounded-lg text-xs text-zinc-200 outline-none focus:border-red-500 font-mono transition-all"
          />
        </div>

        {/* Belt filter dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase hidden xl:inline">Categoria:</span>
          <select 
            value={selectedBeltFilter}
            onChange={(e) => setSelectedBeltFilter(e.target.value as any)}
            className="flex-1 bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-xs text-zinc-300 cursor-pointer focus:outline-none"
          >
            <option value="ALL">🥋 Todas as Faixas (Graduações)</option>
            <option value="Branca">Faixa Branca (White Belt)</option>
            <option value="Azul">Faixa Azul (Blue Belt)</option>
            <option value="Roxa">Faixa Roxa (Purple Belt)</option>
            <option value="Marrom">Faixa Marrom (Brown Belt)</option>
            <option value="Preto">Faixa Preta (Black Belt)</option>
          </select>
        </div>

        {/* Subcategories technical options */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase hidden xl:inline">Subgênero:</span>
          <select 
            value={selectedSubcategoryFilter}
            onChange={(e) => setSelectedSubcategoryFilter(e.target.value)}
            className="flex-1 bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-xs text-zinc-300 cursor-pointer focus:outline-none"
          >
            <option value="ALL">🥋 Todas as Posições & Técnicas</option>
            <option value="Posições">Posições</option>
            <option value="Passagens">Passagens</option>
            <option value="Raspagens">Raspagens</option>
            <option value="Finalizações">Finalizações</option>
            <option value="Defesa Pessoal">Defesa Pessoal</option>
            <option value="Competições">Competições</option>
            <option value="Arbitragem">Arbitragem</option>
            <option value="Inglês Técnico">Inglês Técnico</option>
            <option value="Conversação">Conversação</option>
          </select>
        </div>
      </div>

      {/* 3. PERFORMANCE / STUDY METRICS DASHBOARD CARD */}
      <div className="bg-gradient-to-r from-red-950/40 via-neutral-900 to-amber-950/15 p-4 rounded-xl border border-neutral-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-display font-medium text-xs tracking-wider text-rose-500 uppercase">Estatísticas Reais de Formação</h4>
            <span className="p-0.5 px-2 bg-rose-600/10 border border-rose-500/30 rounded text-[9px] uppercase tracking-widest text-rose-450 font-bold animate-pulse">Live</span>
          </div>

          {/* Cumulative Progress bar indicator */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
              <span>PROGRESSO TOTAL DA PLATAFORMA:</span>
              <span className="font-bold text-rose-500">{overallPerformance}%</span>
            </div>
            <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
              <div 
                className="h-2 bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${overallPerformance}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quantify metrics widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 text-center shrink-0 w-full md:w-auto">
          <div className="bg-neutral-950/80 p-2.5 px-4 rounded-xl border border-neutral-800 gap-1 flex flex-col items-center">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="text-xs text-zinc-400 font-sans uppercase text-[10px]">Tempo de Estudo</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">{formatStudyTime(studyTime)}</span>
          </div>

          <div className="bg-neutral-950/80 p-2.5 px-4 rounded-xl border border-neutral-800 gap-1 flex flex-col items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-400 font-sans uppercase text-[10px]">Módulos Salvos</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">{completedAssetsCount} concluídos</span>
          </div>

          <div className="bg-neutral-950/80 p-2.5 px-4 rounded-xl border border-neutral-800 gap-1 flex flex-col items-center col-span-2 lg:col-span-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-400 font-sans uppercase text-[10px]">Diplomas Habilitados</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">{certificates.length} obtidos</span>
          </div>
        </div>
      </div>

      {activeTab !== 'certificates' && (
        <>
          {/* 4. METEORIC CINEMATIC HERO BANNER (ONLY DISPLAY AT HOMEPAGE WITH NO SELECTIONS) */}
          {searchQuery === '' && selectedBeltFilter === 'ALL' && selectedSubcategoryFilter === 'ALL' && activeTab === 'home' && (
            <div className="relative rounded-2xl overflow-hidden h-[300px] sm:h-[400px] border border-neutral-800 shadow-2xl group transition-all duration-500 hover:border-red-650">
              
              {/* Wallpaper image with deep cinematic shadow vignette */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-102 group-hover:scale-105"
                style={{ 
                  backgroundImage: `linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0.5) 40%, rgba(20,20,20,0.2) 100%), url('https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=1200')` 
                }}
              />

              {/* Title & metadata content */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 space-y-3 z-10">
                <div className="flex items-center gap-2">
                  <span className="p-0.5 px-2 bg-red-600 font-sans text-[9px] uppercase tracking-widest text-white font-black rounded">
                    CINEMATIC EXCLUSIVO
                  </span>
                  <span className="p-0.5 px-2 bg-neutral-900 border border-neutral-800 text-amber-400 text-[9px] uppercase font-bold font-mono rounded">
                    🎓 Faixa Preta MASTERCLASS
                  </span>
                </div>

                <h1 className="text-xl sm:text-4xl font-display font-extrabold text-white tracking-tight max-w-2xl leading-none">
                  Ministrando Seminários Internacionais no Exterior
                </h1>

                <p className="text-xs text-zinc-300 max-w-xl font-sans leading-relaxed line-clamp-3">
                  Aprenda as fórmulas linguísticas exatas usadas pelos grandes campeões da família Gracie para dar seminários lotados nos EUA e Europa. Inclui simulações de perguntas de alunos com áudio vocal.
                </p>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={() => handleOpenMedia(NETFLIX_ASSETS[0])}
                    className="p-2 px-6 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg hover:scale-103 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black text-black" /> Começar Assistir
                  </button>

                  <button 
                    onClick={() => toggleFavorite(NETFLIX_ASSETS[0].id)}
                    className="p-2 px-4 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-zinc-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {favorites.includes(NETFLIX_ASSETS[0].id) ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                    {favorites.includes(NETFLIX_ASSETS[0].id) ? 'Na Minha Lista' : 'Minha Lista'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. DYNAMIC INTERACTIVE CAROUSEL SHELVES */}
          <div className="space-y-8">
            
            {/* SHELF 1: CONTINUAR ASSISTINDO (Only displayed if item in progress exists) */}
            {continueWatchingItems.length > 0 && activeTab === 'home' && searchQuery === '' && (
              <div className="space-y-3">
                <h3 className="font-display font-bold text-sm tracking-wide text-zinc-300 flex items-center gap-1.5 uppercase pl-1">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>Continuar Assistindo</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {continueWatchingItems.map(item => (
                    <NetflixCard 
                      key={item.id} 
                      asset={item} 
                      onSelect={handleOpenMedia} 
                      favorites={favorites} 
                      onToggleFavorite={toggleFavorite}
                      progressVal={progress[item.id] || 0}
                      downloaded={downloaded.includes(item.id)}
                      onDownload={handleTriggerDownload}
                      downloadingAssetId={downloadingAssetId}
                      downloadProgress={downloadProgress}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SHELF 2: MINHA LISTA / FAVORITOS (If favorites exists) */}
            {favoritedList.length > 0 && activeTab === 'home' && searchQuery === '' && (
              <div className="space-y-3">
                <h3 className="font-display font-bold text-sm tracking-wide text-zinc-300 flex items-center gap-1.5 uppercase pl-1">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Minha Lista de Estudos</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {favoritedList.map(item => (
                    <NetflixCard 
                      key={item.id} 
                      asset={item} 
                      onSelect={handleOpenMedia} 
                      favorites={favorites} 
                      onToggleFavorite={toggleFavorite}
                      progressVal={progress[item.id] || 0}
                      downloaded={downloaded.includes(item.id)}
                      onDownload={handleTriggerDownload}
                      downloadingAssetId={downloadingAssetId}
                      downloadProgress={downloadProgress}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SHELF 3: LIVRO DIDÁTICO TRADICIONAL JIUSPEAK (Our preserved content) */}
            {searchQuery === '' && activeTab === 'home' && (
              <div className="space-y-4 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 p-4 rounded-xl border border-neutral-850">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-display font-bold text-sm tracking-wide text-neutral-200 flex items-center gap-1.5 uppercase">
                      <BookOpen className="w-4 h-4 text-rose-500" />
                      <span>Livro Didático Interativo Gramatical (Playbook)</span>
                    </h3>
                    <p className="text-[10px] text-zinc-400">Consulte a clássica grade curricular integrada com dezenas de exercícios práticos de fala, escuta e tradução.</p>
                  </div>
                  
                  {/* Action core to boot legacy modules */}
                  <button
                    onClick={() => {
                      setActiveSyllabus(PLAYBOOK_DATA[0]);
                      setActivePlaybookLessonIdx(0);
                      setActivePlaybookStep('study');
                      setIsSyllabusModalOpen(true);
                      showToast(`Iniciando Livro Didático Interativo!`, 'info');
                    }}
                    className="p-1 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow flex items-center gap-1"
                  >
                    Abrir Playbook completo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                  {PLAYBOOK_DATA.map((syl, sIdx) => {
                    const beltColors: Record<string, string> = {
                      'Branca': 'bg-white text-slate-900 border-zinc-300',
                      'Azul': 'bg-blue-600 text-white border-blue-500',
                      'Roxa': 'bg-purple-600 text-white border-purple-500',
                      'Marrom': 'bg-amber-800 text-white border-amber-700',
                      'Preto': 'bg-stone-900 text-rose-500 border-zinc-800'
                    };
                    return (
                      <div 
                        key={sIdx}
                        onClick={() => {
                          setActiveSyllabus(syl);
                          setActivePlaybookLessonIdx(0);
                          setActivePlaybookStep('study');
                          setIsSyllabusModalOpen(true);
                        }}
                        className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 p-3 rounded-xl cursor-pointer hover:border-rose-500 transition-all flex flex-col justify-between h-28 hover:scale-102"
                      >
                        <div>
                          <span className={`p-0.5 px-2 rounded text-[8px] uppercase font-black ${beltColors[syl.belt] || 'bg-white'}`}>
                            {syl.belt} BJJ
                          </span>
                          <h4 className="text-xs font-semibold text-white mt-2 leading-tight">
                            {syl.title}
                          </h4>
                        </div>
                        <p className="text-[9px] text-zinc-400 truncate mt-1">
                          {syl.modules[0]?.title || 'Técnicas de Gramática'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MAIN CATALOG GRID: Displaying based on search & category filters */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h3 className="font-display font-black text-sm tracking-widest text-zinc-200 uppercase pl-1">
                  {activeTab === 'home' ? 'Catálogo Geral Recomendado' : `Catálogo: ${activeTab.toUpperCase()}`}
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">
                  Total Encontrado: {getFilteredAssets().length} títulos
                </span>
              </div>

              {getFilteredAssets().length === 0 ? (
                <div className="p-12 text-center bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="text-xs text-zinc-300">Nenhum título encontrado com os filtros e busca selecionados.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedBeltFilter('ALL'); setSelectedSubcategoryFilter('ALL'); }}
                    className="p-1 px-3 bg-neutral-800 hover:bg-neutral-700 text-zinc-200 text-xs font-bold rounded"
                  >
                    Resetar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getFilteredAssets().map(item => (
                    <NetflixCard 
                      key={item.id} 
                      asset={item} 
                      onSelect={handleOpenMedia} 
                      favorites={favorites} 
                      onToggleFavorite={toggleFavorite}
                      progressVal={progress[item.id] || 0}
                      downloaded={downloaded.includes(item.id)}
                      onDownload={handleTriggerDownload}
                      downloadingAssetId={downloadingAssetId}
                      downloadProgress={downloadProgress}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* 6. CERTIFICATES DASHBOARD BLOCK TAB */}
      {activeTab === 'certificates' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-amber-650/10 via-neutral-900 to-zinc-950 p-6 rounded-2xl border border-amber-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl text-amber-500">
                🏆
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-white">Licenciamento de Formação Unificada</h3>
                <p className="text-xs text-zinc-400 font-sans">Ao concluir 100% dos estudos de qualquer faixa, você pode emitir e baixar o certificado oficial de conversatação JiuSpeak.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4">
              {(['Branca', 'Azul', 'Roxa', 'Marrom', 'Preto'] as BeltRank[]).map(belt => {
                const isClaimed = certificates.some(c => c.belt === belt);
                const beltAssets = NETFLIX_ASSETS.filter(x => x.category === belt);
                const beltCompleted = beltAssets.length > 0 ? beltAssets.filter(x => progress[x.id] === 100).length : 0;
                const isBeltFinished = beltCompleted === beltAssets.length && beltAssets.length > 0;
                
                // Allow claiming instantly for Branca as a starter gamified test
                const canClaim = isBeltFinished || belt === 'Branca' || isClaimed;

                return (
                  <div key={belt} className={`p-4 rounded-xl border flex flex-col justify-between text-center gap-3 transition-all ${isClaimed ? 'bg-amber-950/20 border-amber-500/30' : 'bg-neutral-900 border-neutral-800'}`}>
                    <div>
                      <span className="p-0.5 px-2.5 rounded bg-zinc-950 text-zinc-300 text-[9px] uppercase font-bold tracking-wider relative inline-block">
                        Faixa {belt}
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-2 font-mono">Progresso da Faixa:</p>
                      <span className="text-sm font-extrabold font-mono text-zinc-150 block">{beltCompleted}/{beltAssets.length} Aulas</span>
                    </div>

                    {isClaimed ? (
                      <span className="p-1 px-3 bg-neutral-950 border border-amber-500/20 rounded-lg text-[10px] text-amber-500 font-bold block select-all">
                        Emitido ✔ (Ver abaixo)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimCertificate(belt)}
                        className={`p-1.5 w-full rounded lg text-[10px] font-extrabold uppercase transition-all tracking-wide cursor-pointer ${canClaim ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-500'}`}
                      >
                        Emitir Diploma
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Render Credentials List list */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm tracking-wide uppercase text-zinc-300 pl-1">
              Certificados Ativos Solicitados
            </h4>

            {certificates.length === 0 ? (
              <div className="p-12 text-center bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
                <Trophy className="w-8 h-8 text-zinc-500 mx-auto" />
                <p className="text-xs text-zinc-400">Você ainda não emitiu certificados de formação. Complete as aulas e clique em "Emitir Diploma" acima!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {certificates.map(cert => (
                  <div key={cert.id} className="bg-gradient-to-br from-amber-950/15 via-zinc-950 to-neutral-900 border-2 border-amber-500/20 rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl">
                    
                    {/* BJJ seal badge layout watermark */}
                    <div className="absolute top-4 right-4 w-16 h-16 sm:w-28 sm:h-28 rounded-full border border-amber-500/10 flex items-center justify-center text-amber-500 text-4xl sm:text-6xl select-none opacity-25">
                      🥋
                    </div>

                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="space-y-1">
                        <span className="text-[10px] tracking-widest font-mono text-amber-500 font-black uppercase">JIUSPEAK UNIVERSAL LANGUAGES SAAS CREDENTIAL</span>
                        <h2 className="text-xl sm:text-3xl font-display font-extrabold text-white tracking-wide uppercase">CERTIFICADO DE CONCLUSÃO</h2>
                      </div>

                      <div className="space-y-1.5 py-4 border-y border-neutral-800 text-xs sm:text-sm font-sans max-w-lg mx-auto text-center font-medium leading-relaxed">
                        <p className="text-zinc-400">Certificamos com absoluto louvor e conformidade de tatame que o atleta e guerreiro(a)</p>
                        <p className="text-lg sm:text-xl font-bold font-display text-white italic underline decoration-amber-500 decoration-2">{user.name}</p>
                        <p className="text-zinc-400">concluiu com êxito todas as lições, vídeos, diálogos de rádio e simulações com arbitragem internacional para a graduação de</p>
                        <p className="font-extrabold text-amber-400 text-base sm:text-lg">FAIXA {cert.belt.toUpperCase()}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 text-[10px] font-mono text-zinc-400">
                        <div>
                          <p className="text-zinc-500">CHAVE DO DIPLOMA:</p>
                          <p className="text-zinc-300 font-bold uppercase">{cert.id}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">DATA DE EMISSÃO:</p>
                          <p className="text-zinc-300 font-bold">{cert.date}</p>
                        </div>
                        <div className="border-t border-dashed border-zinc-650 pt-2 w-32">
                          <p className="text-zinc-300 text-[10px] font-bold">Roger Gracie</p>
                          <p className="text-zinc-500 uppercase text-[8px]">Diretor de Arbitragem</p>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-center gap-2">
                        <button
                          onClick={() => {
                            window.print();
                          }}
                          className="p-1 px-4 bg-amber-500 hover:bg-amber-400 text-slate-100 font-bold rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer hover:scale-103"
                        >
                          <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- IMMERSIVE MEDIA CONTENT PLAYER PANEL MODAL --- */}
      {activeMedia && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#181818] border border-neutral-800 rounded-2xl max-w-4xl w-full text-zinc-100 overflow-hidden shadow-2xl relative my-8 animate-scaleUp">
            
            {/* Upper Action block buttons */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button 
                onClick={() => toggleFavorite(activeMedia.id)}
                className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-zinc-200 border border-neutral-800 cursor-pointer"
                title="Favoritar / Salvar"
              >
                <Heart className={`w-4 h-4 ${favorites.includes(activeMedia.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              
              <button 
                onClick={() => { setActiveMedia(null); setIsSimulatingPlay(false); }}
                className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-zinc-200 border border-neutral-800 cursor-pointer font-bold text-xs flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* A. PLATFORM BANNER HEADER PREVIEW */}
            <div className="relative h-44 sm:h-60 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(24,24,24,0) 20%, rgba(24,24,24,1) 100%), url('${activeMedia.imageUrl}')` }}>
              <div className="absolute bottom-4 left-4 sm:left-6 space-y-1.5">
                <span className="p-0.5 px-2 bg-red-650 text-[9px] uppercase tracking-widest text-white font-black rounded inline-block">
                  {activeMedia.type.toUpperCase()}
                </span>
                <h3 className="text-lg sm:text-2xl font-display font-extrabold text-white tracking-tight leading-tight">{activeMedia.title}</h3>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                  <span>Faixa {activeMedia.category}</span>
                  <span>•</span>
                  <span>{activeMedia.subcategory}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">{activeMedia.difficulty}</span>
                </div>
              </div>
            </div>

            {/* B. DETAILED CONTROLLER PANEL BODY */}
            <div className="p-4 sm:p-6 space-y-6">
              
              <p className="text-zinc-300 text-xs leading-relaxed font-sans">{activeMedia.description}</p>

              {/* RENDER DYNAMIC COMPONENT BASED ON MEDIA TYPE */}

              {/* VIDEO PLAYER COMPONENT */}
              {activeMedia.type === 'video' && (
                <div className="space-y-4 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                    <Play className="w-3.5 h-3.5 fill-red-500 text-red-500" /> Player de Vídeo em Alta Definição
                  </span>

                  {/* HTML Video simulator tag */}
                  <div className="relative rounded-lg overflow-hidden bg-zinc-900 border border-neutral-850 aspect-video max-h-72 mx-auto flex items-center justify-center">
                    {isSimulatingPlay ? (
                      <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-2 text-center p-4">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                        <p className="text-xs text-white font-mono">REPRODUZINDO VÍDEO TÉCNICO BJJ + INGLÊS...</p>
                        <p className="text-[10px] text-zinc-400">Progresso do conteúdo: {simulatedMediaProgress}%</p>
                        <p className="text-[9px] text-zinc-500">Estudar este vídeo acumula segundos de Tempo de Estudo síncronos.</p>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center gap-3 text-center p-4">
                        <button 
                          onClick={() => setIsSimulatingPlay(true)}
                          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer"
                        >
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </button>
                        <p className="text-xs text-zinc-300">Vídeo pronto para reprodução</p>
                      </div>
                    )}
                  </div>

                  {/* Video Control bar and quick completing trigger */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <button 
                        onClick={() => setIsSimulatingPlay(!isSimulatingPlay)}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-800 text-zinc-200"
                      >
                        {isSimulatingPlay ? 'Pausar' : 'Reproduzir'}
                      </button>
                      <span className="text-[10px] text-zinc-400 font-mono">Duração: {activeMedia.duration}</span>
                    </div>

                    <button
                      onClick={handleCompleteActiveAsset}
                      className="p-1 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Completar Vídeo ✔ (+{activeMedia.xpReward} XP)
                    </button>
                  </div>
                </div>
              )}

              {/* PDF READING COMPONENT */}
              {activeMedia.type === 'pdf' && activeMedia.pdfLines && (
                <div className="space-y-4 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                    <FileText className="w-3.5 h-3.5 text-rose-500" /> Leitor Didático Avançado de Apostila (Document)
                  </span>

                  <div className="p-4 bg-white text-slate-800 rounded-lg min-h-48 font-serif leading-relaxed text-xs sm:text-sm shadow-inner space-y-3">
                    <p className="font-bold underline text-[10px] text-zinc-500 font-mono">DIPLOMADO JIUSPEAK DIGITAL READER</p>
                    {activeMedia.pdfLines.map((line, lIdx) => (
                      <p key={lIdx} className="border-b border-zinc-100 pb-1.5 last:border-b-0">{line}</p>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-zinc-400 font-mono">Documento Habilitado para Download local</span>
                    <button
                      onClick={handleCompleteActiveAsset}
                      className="p-1 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Marcar Leitura como Concluída ✔ (+{activeMedia.xpReward} XP)
                    </button>
                  </div>
                </div>
              )}

              {/* AUDIO PODCAST COMPONENT */}
              {activeMedia.type === 'audio' && activeMedia.audioWords && (
                <div className="space-y-4 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                    <Volume2 className="w-3.5 h-3.5 text-blue-500" /> Podcast de Rádio e Fonoaudiologia Ativa
                  </span>

                  {/* Bouncing visual audio wave lines */}
                  <div className="h-20 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-center gap-1 px-6">
                    {[3, 8, 4, 9, 6, 2, 7, 5, 8, 3, 5, 2, 9, 7, 4, 8, 2, 6, 8, 3].map((height, hIdx) => (
                      <div 
                        key={hIdx} 
                        className={`w-1 rounded bg-blue-500 transition-all duration-300 ${isRecording ? 'bg-red-500' : ''}`}
                        style={{ height: isSimulatingPlay ? `${height * 6}px` : '10px' }}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeMedia.audioWords.map((wordObj, wIdx) => (
                      <div key={wIdx} className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-blue-400">{wordObj.word}</p>
                          <p className="text-[9px] text-zinc-400">{wordObj.translation}</p>
                        </div>
                        <button 
                          onClick={() => speakCommandPhrase(wordObj.word)}
                          className="p-1 bg-zinc-950 rounded border border-neutral-800 hover:bg-neutral-800 text-blue-400"
                        >
                          🗣️ Ouvir
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Mic speak record sandbox */}
                  <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-850 text-center space-y-2">
                    <p className="text-[10px] text-zinc-400 font-mono">TESTE SEU MICROFONE: Pronuncie uma das expressões em inglês para aferição:</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleTriggerSpeakDrill(activeMedia.audioWords?.[0].word || '')}
                        disabled={isRecording}
                        className={`p-1 px-4 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-neutral-950 text-rose-500 hover:bg-neutral-800 border border-neutral-800'}`}
                      >
                        <Mic className="w-3.5 h-3.5" /> Falar agora
                      </button>
                    </div>

                    {speechAccuracy !== null && (
                      <div className="text-center font-mono text-xs">
                        Pontuação de Precisão das Consoantes: <span className="text-emerald-400 font-bold">{speechAccuracy}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-neutral-800 text-xs">
                    <button 
                      onClick={() => setIsSimulatingPlay(!isSimulatingPlay)}
                      className="p-1 px-4 bg-zinc-950 rounded text-zinc-300"
                    >
                      {isSimulatingPlay ? 'Pausar Reprodução' : 'Tocar Áudio Podcast'}
                    </button>

                    <button
                      onClick={handleCompleteActiveAsset}
                      className="p-1 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Completar Estudo de Áudio ✔
                    </button>
                  </div>
                </div>
              )}

              {/* CLINICAL TECHNIQUE STEPS COMPONENT */}
              {activeMedia.type === 'technique' && activeMedia.steps && (
                <div className="space-y-4 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                    <Award className="w-3.5 h-3.5 text-rose-500" /> Passo-a-Passo com Diálogo de Combate Integrado
                  </span>

                  <div className="flex gap-2 justify-center">
                    {activeMedia.steps.map((_, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => setActiveTechniqueStep(sIdx)}
                        className={`p-1.5 px-3 rounded text-[10px] uppercase font-black tracking-wider border transition-all cursor-pointer ${activeTechniqueStep === sIdx ? 'bg-rose-600 text-white border-rose-500' : 'bg-neutral-900 border-neutral-800 text-zinc-400'}`}
                      >
                        Passo {sIdx + 1}
                      </button>
                    ))}
                  </div>

                  {activeMedia.steps[activeTechniqueStep] && (
                    <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
                      <h4 className="text-xs font-bold text-rose-500 uppercase">{activeMedia.steps[activeTechniqueStep].title}</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{activeMedia.steps[activeTechniqueStep].description}</p>
                      
                      {activeMedia.steps[activeTechniqueStep].dialogueEN && (
                        <div className="bg-stone-950 p-2.5 rounded border border-neutral-850 space-y-1">
                          <p className="text-xs text-indigo-400 font-bold">Dialogue EN: "{activeMedia.steps[activeTechniqueStep].dialogueEN}"</p>
                          <p className="text-[10px] text-zinc-400 italic">Tradução: "{activeMedia.steps[activeTechniqueStep].dialoguePT}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-[10px] text-zinc-400 font-mono">Conclua todas as etapas do rala tático</span>
                    <button
                      onClick={handleCompleteActiveAsset}
                      className="p-1 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Marcar broca concluída ✔ (+{activeMedia.xpReward} XP)
                    </button>
                  </div>
                </div>
              )}

              {/* QUIZ MODULE COMPONENT */}
              {activeMedia.type === 'quiz' && activeMedia.quizQuestions && (
                <div className="space-y-4 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                    <Brain className="w-3.5 h-3.5 text-purple-500" /> Quiz de Formação e Compreensão de Regras
                  </span>

                  {!isQuizFinished ? (
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>QUESTÃO {activeQuizIdx + 1} DE {activeMedia.quizQuestions.length}</span>
                        <span>Pontuação: {Object.keys(quizAnswers).length} respondidas</span>
                      </div>

                      <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
                        <p className="text-xs font-bold text-white">{activeMedia.quizQuestions[activeQuizIdx].question}</p>
                        
                        <div className="space-y-2">
                          {activeMedia.quizQuestions[activeQuizIdx].options.map((opt, oIdx) => {
                            const isSelected = quizAnswers[activeQuizIdx] === oIdx;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  setQuizAnswers(prev => ({ ...prev, [activeQuizIdx]: oIdx }));
                                }}
                                className={`w-full p-2.5 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer ${isSelected ? 'bg-purple-950/40 border-purple-500 text-purple-300' : 'bg-[#121212] border-neutral-800 hover:bg-neutral-800 text-zinc-300'}`}
                              >
                                {oIdx + 1}. {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {quizAnswers[activeQuizIdx] !== undefined && (
                        <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-[10px] text-zinc-400 leading-relaxed font-sans">
                          <p className="font-bold text-purple-400 uppercase text-[9px] mb-1">Nota Técnica Roger Gracie:</p>
                          {activeMedia.quizQuestions[activeQuizIdx].explanation}
                        </div>
                      )}

                      <div className="flex justify-end">
                        {activeQuizIdx + 1 < activeMedia.quizQuestions.length ? (
                          <button
                            disabled={quizAnswers[activeQuizIdx] === undefined}
                            onClick={() => setActiveQuizIdx(prev => prev + 1)}
                            className="p-1.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded"
                          >
                            Avançar Questão
                          </button>
                        ) : (
                          <button
                            disabled={quizAnswers[activeQuizIdx] === undefined}
                            onClick={() => {
                              setIsQuizFinished(true);
                              handleCompleteActiveAsset();
                            }}
                            className="p-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded"
                          >
                            Finalizar e Enviar Respostas
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full border border-emerald-500 bg-emerald-500/15 flex items-center justify-center text-xl text-emerald-400 mx-auto">
                        ✔
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase">Respostas Registradas!</h4>
                      <p className="text-xs text-zinc-400">Você concluiu todo o teste de regras e conversação com sucesso e os créditos XP foram integrados à sua conta!</p>
                      <button 
                        onClick={() => setActiveMedia(null)}
                        className="p-1 px-4 bg-neutral-900 hover:bg-neutral-800 rounded text-xs text-zinc-200"
                      >
                        Fechar Janela
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* --- RE-COORDINATED LIVE PLAYBOOK COURSE MODAL DIALOGUE --- */}
      {isSyllabusModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/95 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#181818] border border-neutral-800 rounded-3xl max-w-4xl w-full text-zinc-100 overflow-hidden shadow-2xl relative my-8 p-4 sm:p-6 space-y-6">
            
            {/* Upper Action core to quit traditional module */}
            <div className="flex justify-between items-start pb-2 border-b border-neutral-800">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-red-500 font-extrabold uppercase">MODAL CURRICULUM DO LIVRO DE CURSOS</span>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-zinc-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-rose-500" />
                  <span>Syllabus do Tatame: Faixa {activeSyllabus.belt}</span>
                </h3>
              </div>
              <button 
                onClick={() => setIsSyllabusModalOpen(false)}
                className="p-1 bg-neutral-900 hover:bg-neutral-800 text-zinc-200 rounded-full border border-neutral-850"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector list of other belts fast */}
            <div className="flex flex-wrap gap-1 bg-neutral-950 p-1.5 rounded-xl justify-center">
              {PLAYBOOK_DATA.map((sylObj) => (
                <button
                  key={sylObj.belt}
                  onClick={() => {
                    setActiveSyllabus(sylObj);
                    setActivePlaybookLessonIdx(0);
                    setActivePlaybookStep('study');
                  }}
                  className={`p-1 px-3 text-[10px] font-bold font-sans rounded-lg transition-all cursor-pointer ${activeSyllabus.belt === sylObj.belt ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:bg-neutral-900'}`}
                >
                  Faixa {sylObj.belt}
                </button>
              ))}
            </div>

            {/* Rendering specific active lesson of the traditional course */}
            {activeSyllabus.modules[0]?.lessons[activePlaybookLessonIdx] && (() => {
              const lesson: PlaybookLesson = activeSyllabus.modules[0].lessons[activePlaybookLessonIdx];
              return (
                <div className="space-y-4 animate-scaleUp">
                  
                  {/* Lesson header visual */}
                  <div className="p-4 bg-neutral-905 rounded-xl border border-neutral-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-rose-500" /> {lesson.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-sans">{lesson.overview}</p>
                    </div>
                    <span className="text-[10px] font-mono p-1 px-2.5 rounded bg-zinc-950 text-zinc-450 border border-neutral-800">
                      ⌛ {lesson.duration}
                    </span>
                  </div>

                  {/* Sub-step selector tab (Study dialogues vs Quiz exercises) */}
                  <div className="flex gap-2 justify-center border-b border-neutral-800 pb-3">
                    <button
                      onClick={() => { setActivePlaybookStep('study'); }}
                      className={`p-1 px-4 rounded text-xs font-bold transition-all cursor-pointer ${activePlaybookStep === 'study' ? 'bg-rose-600 text-white' : 'bg-neutral-900 hover:bg-neutral-850 text-zinc-400'}`}
                    >
                      🗣️ Estudo de Vocabulário & Diálogos
                    </button>
                    <button
                      onClick={() => { 
                        setActivePlaybookStep('quiz'); 
                        setPlaybookQuizSelected(null);
                        setPlaybookQuizAnswered(false);
                      }}
                      className={`p-1 px-4 rounded text-xs font-bold transition-all cursor-pointer ${activePlaybookStep === 'quiz' ? 'bg-rose-600 text-white' : 'bg-neutral-900 hover:bg-neutral-850 text-zinc-400'}`}
                    >
                      📝 Exercícios da Lição
                    </button>
                  </div>

                  {/* TAB 1: STUDY VOCAB & DIAL */}
                  {activePlaybookStep === 'study' && (
                    <div className="space-y-4">
                      {/* Vocabulary Glossary layout */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block pl-1">Dicionário de Termos:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {lesson.vocabulary.map((vObj, vIdx) => (
                            <div key={vIdx} className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-850 flex justify-between items-center hover:bg-neutral-850/35 transition-all">
                              <div>
                                <span className="text-xs font-bold text-rose-500">{vObj.term}</span>
                                <span className="text-[9px] text-zinc-500 ml-1.5">[{vObj.pronunciation}]</span>
                                <p className="text-[10px] text-zinc-400 font-sans mt-0.5">{vObj.translation}</p>
                              </div>
                              <button
                                onClick={() => speakCommandPhrase(vObj.term)}
                                className="p-1 px-2.5 bg-neutral-950 rounded text-[10px] hover:bg-neutral-800 text-rose-400"
                              >
                                🗣️ Ouvir
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preserved Conversation Bubble dialogues layout */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block pl-1">Diálogo de Roteiro Bilingue:</span>
                        <div className="space-y-2 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                          {lesson.dialogue.map((dialObj, dIdx) => (
                            <div key={dIdx} className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-500 block uppercase font-bold">{dialObj.speaker}:</span>
                              <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-900">
                                <p className="text-xs text-white font-bold inline-block">"{dialObj.textEN}"</p>
                                <button 
                                  onClick={() => speakCommandPhrase(dialObj.textEN)}
                                  className="p-1 text-[9px] text-rose-450 hover:text-white float-right border border-neutral-800 rounded bg-zinc-950"
                                >
                                  🔊 Pronunciar
                                </button>
                                <p className="text-[10.5px] text-zinc-400 italic font-sans block mt-1">Tradução: {dialObj.textPT}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Roger Gracie Tips content */}
                      <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg text-xs leading-relaxed">
                        <p className="font-bold text-rose-500 uppercase text-[10px] mb-1">👴 Sensei JiuSpeak Master Tip:</p>
                        "{lesson.masterTip}"
                      </div>
                    </div>
                  )}

                  {/* TAB 2: EXERCISES OF THE LESSON */}
                  {activePlaybookStep === 'quiz' && (
                    <div className="space-y-4">
                      {lesson.exercises[0] && (() => {
                        const ex = lesson.exercises[0];
                        return (
                          <div className="bg-neutral-905 p-4 rounded-xl border border-neutral-850 space-y-4">
                            <div>
                              <span className="p-0.5 px-2 bg-neutral-950 border border-neutral-800 rounded text-[9px] uppercase font-mono tracking-widest text-zinc-440 inline-block mb-1">
                                {ex.type.toUpperCase()}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-white">{ex.question}</h4>
                            </div>

                            <div className="space-y-2">
                              {ex.options.map((option, oIdx) => {
                                const isSelected = playbookQuizSelected === oIdx;
                                const isCorrect = oIdx === ex.correctOptionIndex;
                                return (
                                  <button
                                    key={oIdx}
                                    disabled={playbookQuizAnswered}
                                    onClick={() => setPlaybookQuizSelected(oIdx)}
                                    className={`w-full p-2.5 rounded-lg text-left text-xs font-semibold border transition-all ${isSelected ? 'bg-rose-950/50 border-rose-500 text-rose-400' : 'bg-neutral-900 border-neutral-850 text-zinc-300'}`}
                                  >
                                    {oIdx + 1}. {option}
                                  </button>
                                );
                              })}
                            </div>

                            {!playbookQuizAnswered ? (
                              <div className="flex justify-end">
                                <button
                                  disabled={playbookQuizSelected === null}
                                  onClick={() => {
                                    setPlaybookQuizAnswered(true);
                                    if (playbookQuizSelected === ex.correctOptionIndex) {
                                      addXp(120, `Quiz Playbook: ${lesson.title}`);
                                      addCoins(50, `Coins Playbook`);
                                      showToast(`Sensacional! Resposta correta! (+120 XP e +50 KC)`, 'success');
                                    } else {
                                      showToast(`Que pena, resposta errada. Verifique a análise!`, 'error');
                                    }
                                  }}
                                  className="p-1 px-5 bg-rose-600 hover:bg-rose-400 disabled:opacity-40 text-white font-bold text-xs rounded transition-all"
                                >
                                  Confirmar Resposta
                                </button>
                              </div>
                            ) : (
                              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-[10.5px] text-zinc-400 leading-relaxed font-sans">
                                <p className="font-bold text-indigo-400 uppercase text-[9.5px] mb-1">Análise do Mestre:</p>
                                {ex.explanation}
                              </div>
                            )}

                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Footer control switcher to advance other playbook chapters of module */}
                  <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                    <button
                      disabled={activePlaybookLessonIdx === 0}
                      onClick={() => {
                        setActivePlaybookLessonIdx(prev => prev - 1);
                        setActivePlaybookStep('study');
                      }}
                      className="p-1 px-3 bg-neutral-900 hover:bg-neutral-850 rounded text-xs text-zinc-300 disabled:opacity-20"
                    >
                      ⬅ Lição Anterior
                    </button>
                    <span className="text-[10px] text-zinc-400">
                      Lição {activePlaybookLessonIdx + 1} de {activeSyllabus.modules[0].lessons.length}
                    </span>
                    {activePlaybookLessonIdx + 1 < activeSyllabus.modules[0].lessons.length ? (
                      <button
                        onClick={() => {
                          setActivePlaybookLessonIdx(prev => prev + 1);
                          setActivePlaybookStep('study');
                        }}
                        className="p-1 px-3 bg-rose-600 hover:bg-rose-500 rounded text-xs text-white"
                      >
                        Próxima Lição ➡
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsSyllabusModalOpen(false);
                          showToast(`Parabéns! Módulo Playbook concluído com louvor! 🏆`, 'success');
                        }}
                        className="p-1 px-4 bg-emerald-600 hover:bg-emerald-500 rounded text-xs text-white"
                      >
                        Concluir Módulo Completo ✔
                      </button>
                    )}
                  </div>

                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
}

// --- DYNAMIC NETFLIX CARD DISPLAY COMPONENT ---
interface NetflixCardProps {
  key?: string | number;
  asset: NetflixAsset;
  onSelect: (item: NetflixAsset) => void;
  favorites: string[];
  onToggleFavorite: (id: string, title?: string) => void;
  progressVal: number;
  downloaded: boolean;
  onDownload: (e: React.MouseEvent, assetId: string) => void;
  downloadingAssetId: string | null;
  downloadProgress: number;
}

function NetflixCard({
  asset,
  onSelect,
  favorites,
  onToggleFavorite,
  progressVal,
  downloaded,
  onDownload,
  downloadingAssetId,
  downloadProgress
}: NetflixCardProps) {

  const isFavorited = favorites.includes(asset.id);
  const isDownloading = downloadingAssetId === asset.id;

  const beltBorders: Record<string, string> = {
    'Branca': 'border-zinc-300/40 focus:border-white hover:border-white',
    'Azul': 'border-blue-600/40 hover:border-blue-500 focus:border-blue-500',
    'Roxa': 'border-purple-600/40 hover:border-purple-500 focus:border-purple-500',
    'Marrom': 'border-amber-800/40 hover:border-amber-700 focus:border-amber-700',
    'Preto': 'border-stone-850 hover:border-rose-600 focus:border-rose-600'
  };

  const beltBgColors: Record<string, string> = {
    'Branca': 'bg-white text-slate-900',
    'Azul': 'bg-blue-600 text-white',
    'Roxa': 'bg-purple-600 text-white',
    'Marrom': 'bg-amber-800 text-white',
    'Preto': 'bg-stone-900 text-rose-500'
  };

  return (
    <div 
      onClick={() => onSelect(asset)}
      className={`bg-[#181818] border-2 ${beltBorders[asset.category] || 'border-neutral-800'} rounded-xl overflow-hidden cursor-pointer hover:scale-103 active:scale-98 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-2xl hover:z-10`}
    >
      
      {/* Target image with layout label */}
      <div className="relative aspect-video w-full bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url('${asset.imageUrl}')` }}>
        
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent group-hover:from-neutral-950/90" />

        {/* Categories belt badges top layout */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className={`p-0.5 px-2.5 rounded text-[8px] uppercase font-black tracking-wider ${beltBgColors[asset.category] || 'bg-white'}`}>
            Faixa {asset.category}
          </span>
          <span className="p-0.5 px-2 bg-neutral-950/80 border border-neutral-800/60 rounded text-zinc-300 text-[8.5px] uppercase font-bold font-mono">
            {asset.type === 'course' && '📚 Curso'}
            {asset.type === 'video' && '🎥 Vídeo'}
            {asset.type === 'pdf' && '📄 PDF'}
            {asset.type === 'audio' && '🎧 Áudio'}
            {asset.type === 'technique' && '🥋 Técnica'}
            {asset.type === 'quiz' && '🧠 Quiz'}
          </span>
        </div>

        {/* Quick control actions hover trigger */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset.id, asset.title); }}
            className={`p-1.5 rounded-full bg-neutral-950/85 hover:bg-neutral-800 text-xs shadow-md border border-neutral-850/60 cursor-pointer ${isFavorited ? 'text-red-500' : 'text-zinc-200'}`}
            title="Adicionar aos Favoritos"
          >
            <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500' : ''}`} />
          </button>
          
          <button
            onClick={(e) => onDownload(e, asset.id)}
            className={`p-1.5 rounded-full bg-neutral-950/85 hover:bg-neutral-805 text-xs shadow-md border border-neutral-850/60 cursor-pointer ${downloaded ? 'text-emerald-400' : 'text-zinc-200'}`}
            title="Download Offline"
          >
            {isDownloading ? (
              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
            ) : (
              <Download className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Study progress bar overlay at the base */}
        {progressVal > 0 && (
          <div className="absolute inset-x-0 bottom-0 bg-neutral-900 border-t border-neutral-800 z-10">
            <div className={`h-1 cursor-pointer transition-all ${progressVal === 100 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${progressVal}%` }} />
          </div>
        )}
      </div>

      {/* Title & brief descriptive metadata context */}
      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[9px] font-mono font-bold tracking-wider text-rose-500 uppercase">{asset.subcategory}</span>
            <span className="text-[8px] font-mono text-zinc-500 text-right">{asset.duration}</span>
          </div>
          <h4 className="text-xs sm:text-[12.5px] font-display font-black text-white leading-tight group-hover:text-rose-500 transition-colors line-clamp-1">{asset.title}</h4>
          <p className="text-[10px] sm:text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-2 mt-0.5">{asset.description}</p>
        </div>

        {/* Progress percent display status or downloaded identifier */}
        <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-[9px] font-mono text-zinc-500">
          <div className="flex items-center gap-1">
            {progressVal === 100 ? (
              <span className="text-emerald-400 font-extrabold uppercase flex items-center gap-0.5"><Check className="w-3 h-3" /> Concluído</span>
            ) : progressVal > 0 ? (
              <span className="text-rose-400 font-bold">Assistindo: {progressVal}%</span>
            ) : (
              <span className="text-zinc-400 select-all">+{asset.xpReward} XP</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 select-none">
            {downloaded && <span className="p-0.5 px-1.5 rounded bg-zinc-950/80 border border-neutral-800 text-[8px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-0.5">Offline</span>}
            <span className="bg-neutral-950 px-1 py-0.5 rounded text-[8.5px] border border-neutral-850 text-zinc-400 leading-none">{asset.difficulty}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
