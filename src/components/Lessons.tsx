/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Trophy, 
  CheckCircle2, 
  BookOpen, 
  Video, 
  Music, 
  FileText, 
  HelpCircle, 
  Layers, 
  Lock, 
  Unlock, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  Award, 
  ArrowLeft, 
  Volume2, 
  RotateCcw, 
  FileDown, 
  X, 
  ShieldAlert, 
  Sparkles,
  BookMarked
} from 'lucide-react';
import { UserProfile, Course } from '../types';

interface LessonsProps {
  user: UserProfile;
  courses: Course[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  onAddAuditLog: (type: any, desc: string, amtBRL?: number, amtJT?: number) => void;
  addXp: (amount: number, reason: string) => void;
  addCoins: (amount: number, reason: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface ModuleData {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  coverImage: string;
  order: number;
  estimatedHours: number;
  passingScore: number;
  completeness: number;
  completedCount: number;
  lessonsCount: number;
  unlocked: boolean;
  lockReason: string;
  latestAttemptScore: number | null;
  latestAttemptPassed: boolean | null;
  blockTimeRemainingMs: number;
}

interface LessonData {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  videoUrl: string;
  videoType: string;
  audioUrl: string;
  readingText: string;
  complementaryMaterialUrl: string;
  xpReward: number;
  order: number;
  unlocked: boolean;
  progress: {
    videoCompleted: boolean;
    audioCompleted: boolean;
    textCompleted: boolean;
    quizCompleted: boolean;
    flashcardsCompleted: boolean;
    completed: boolean;
  };
}

interface QuizQuestion {
  id: string;
  lessonId: string;
  type: string; // "SINGLE", "MULTIPLE", "TEXT", "TRUE_FALSE"
  question: string;
  options: string[]; // Options stored as JSON array string or normal array
  correctAnswer: string;
  order: number;
}

interface Flashcard {
  id: string;
  lessonId: string;
  front: string;
  back: string;
  pronunciationHint: string;
  order: number;
}

interface ExamQuestion {
  id: string;
  examId: string;
  question: string;
  options: string[] | string;
  correctAnswer: string;
  order: number;
}

export default function Lessons({ 
  user, 
  updateUser, 
  addXp, 
  addCoins, 
  showToast 
}: LessonsProps) {

  // UI state controllers
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [studySeconds, setStudySeconds] = useState<number>(() => {
    const cached = localStorage.getItem('js_study_seconds');
    return cached ? parseInt(cached, 10) : 3600; 
  });

  // Navigation states
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeExamModuleId, setActiveExamModuleId] = useState<string | null>(null);

  // Loaded child states
  const [activeModule, setActiveModule] = useState<ModuleData | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [moduleLoading, setModuleLoading] = useState<boolean>(false);
  const [lessonLoading, setLessonLoading] = useState<boolean>(false);
  const [examLoading, setExamLoading] = useState<boolean>(false);

  // Interactive study view states
  const [studyTab, setStudyTab] = useState<'video' | 'audio' | 'text' | 'quiz' | 'flashcard'>('video');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState<number>(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, string>>({});
  const [quizScoreChecked, setQuizScoreChecked] = useState<boolean>(false);
  const [quizSuccess, setQuizSuccess] = useState<boolean | null>(null);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState<number>(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState<boolean>(false);
  const [memorizedCardIds, setMemorizedCardIds] = useState<Record<string, boolean>>({});

  // Exam view states
  const [selectedExamAnswers, setSelectedExamAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<{ passed: boolean; score: number; correctCount: number; totalCount: number } | null>(null);

  // Incremental study timer in background
  useEffect(() => {
    const t = setInterval(() => {
      setStudySeconds(prev => {
        const next = prev + 1;
        localStorage.setItem('js_study_seconds', String(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatStudyTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Helper auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('jiuspeak_access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 1. Fetch modules on load
  const loadModulesList = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/modules', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setModules(data.modules || []);
      } else {
        showToast(data.error || "Erro ao consultar módulos do curso.", "error");
      }
    } catch (e) {
      console.error("Fetch modules error:", e);
      showToast("Não foi possível conectar com o servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModulesList();
  }, []);

  // 2. Fetch specific module + lessons
  const handleOpenModule = async (moduleId: string) => {
    try {
      setModuleLoading(true);
      setActiveModuleId(moduleId);
      const modObj = modules.find(m => m.id === moduleId);
      if (modObj) setActiveModule(modObj);

      const res = await fetch(`/api/modules/${moduleId}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setLessons(data.lessons || []);
        if (data.module) {
          setActiveModule(data.module);
        }
      } else {
        showToast(data.error || "Erro ao abrir módulo.", "error");
        setActiveModuleId(null);
      }
    } catch (e) {
      showToast("Erro de conexão ao ler aulas.", "error");
      setActiveModuleId(null);
    } finally {
      setModuleLoading(false);
    }
  };

  // 3. Fetch specific active lesson details
  const handleOpenLesson = async (lessonId: string) => {
    try {
      setLessonLoading(true);
      setActiveLessonId(lessonId);
      
      const res = await fetch(`/api/lessons/${lessonId}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setActiveLesson(data.lesson);
        setQuizzes(data.quizQuestions || []);
        setFlashcards(data.flashcards || []);
        
        // Reset interactive state
        setStudyTab('video');
        setIsPlayingAudio(false);
        setAudioPlaybackProgress(0);
        setSelectedQuizAnswers({});
        setQuizScoreChecked(false);
        setQuizSuccess(null);
        setActiveFlashcardIndex(0);
        setIsFlashcardFlipped(false);
        setMemorizedCardIds({});
      } else {
        showToast(data.error || "Erro ao carregar aula.", "error");
        setActiveLessonId(null);
      }
    } catch (e) {
      showToast("Falha de rede ao acessar aula.", "error");
      setActiveLessonId(null);
    } finally {
      setLessonLoading(false);
    }
  };

  // Load Exam questions
  const handleOpenExam = async (moduleId: string) => {
    try {
      setExamLoading(true);
      setActiveExamModuleId(moduleId);
      setSelectedExamAnswers({});
      setExamResult(null);

      const res = await fetch(`/api/exams/${moduleId}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setExamQuestions(data.questions || []);
      } else {
        showToast(data.error || "Erro na coleta de materiais de avaliação.", "error");
        setActiveExamModuleId(null);
      }
    } catch (e) {
      showToast("Não foi possível alcançar o servidor.", "error");
      setActiveExamModuleId(null);
    } finally {
      setExamLoading(false);
    }
  };

  // Submit component lesson progress to backend
  const handleMarkComponentCompleted = async (type: 'video' | 'audio' | 'text' | 'quiz' | 'flashcard') => {
    if (!activeLesson) return;
    try {
      const res = await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          lessonId: activeLesson.id,
          component_type: type
        })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local lesson progress immediately
        setActiveLesson(prev => {
          if (!prev) return null;
          const upProg = { ...prev.progress };
          if (type === 'video') upProg.videoCompleted = true;
          if (type === 'audio') upProg.audioCompleted = true;
          if (type === 'text') upProg.textCompleted = true;
          if (type === 'quiz') upProg.quizCompleted = true;
          if (type === 'flashcard') upProg.flashcardsCompleted = true;
          
          // Check complete condition
          const isDoneNow = upProg.videoCompleted && upProg.audioCompleted && upProg.textCompleted && upProg.quizCompleted && upProg.flashcardsCompleted;
          
          return {
            ...prev,
            progress: {
              ...upProg,
              completed: isDoneNow
            }
          };
        });

        // If newly completed lesson
        if (data.lessonCompleted && data.xpReward > 0) {
          addXp(data.xpReward, `Conclusão da Aula ${activeLesson.title}`);
          showToast(`🏆 Aula concluída com sucesso! +${data.xpReward} XP Adicionados!`, "success");
        } else {
          showToast(`Progresso de ${type.toUpperCase()} registrado!`, "success");
        }

        // Auto reload module contents to update sequential listings
        if (activeModuleId) {
          const modRes = await fetch(`/api/modules/${activeModuleId}`, { headers: getAuthHeaders() });
          const modData = await modRes.json();
          if (modData.success) {
            setLessons(modData.lessons || []);
          }
        }
      } else {
        showToast(data.error || "Erro ao gravar componente.", "error");
      }
    } catch (e) {
      showToast("Erro na submissão do progresso.", "error");
    }
  };

  // Check interactive locally-submitted mock lesson Quiz answer
  const handleCheckQuizAnswers = () => {
    if (quizzes.length === 0) return;
    let correct = true;
    quizzes.forEach(q => {
      const uAns = selectedQuizAnswers[q.id];
      if (!uAns || String(uAns).trim().toUpperCase() !== String(q.correctAnswer).trim().toUpperCase()) {
        correct = false;
      }
    });

    setQuizScoreChecked(true);
    setQuizSuccess(correct);

    if (correct) {
      showToast("Parabéns! Todas as respostas do Quiz estão certas!", "success");
      // Auto complete the Quiz portion
      handleMarkComponentCompleted('quiz');
    } else {
      showToast("Alguma resposta não está correta. Tente novamente revisando os materiais!", "error");
    }
  };

  // Text-To-Speech (Pronunciation hint playback for English study Cards)
  const handlePronounce = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85; // Slightly slower for training comprehension
        window.speechSynthesis.speak(utterance);
      } else {
        showToast("Seu navegador não oferece suporte nativo para SpeechSynthesis.", "info");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleMemorized = (cardId: string) => {
    setMemorizedCardIds(prev => {
      const updated = { ...prev, [cardId]: !prev[cardId] };
      
      // Auto check if all flashcards have been memorized
      const allMemorized = flashcards.every(f => updated[f.id]);
      if (allMemorized) {
        showToast("Increível! Todos os Flashcards deste deck foram revisados!", "success");
        handleMarkComponentCompleted('flashcard');
      }
      return updated;
    });
  };

  // Exam evaluation submitter
  const handleSubmitExamAnswers = async () => {
    try {
      setExamLoading(true);
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          moduleId: activeExamModuleId,
          answers: selectedExamAnswers
        })
      });
      const data = await res.json();
      if (data.success) {
        setExamResult({
          passed: data.passed,
          score: data.score,
          correctCount: data.correctCount,
          totalCount: data.totalCount
        });

        if (data.passed) {
          addXp(300, `Aprovação no Exame Final do Módulo ${activeModule?.title}`);
          showToast("🎓 Espetacular! Você PASSOU no exame final do módulo! +300 XP Adicionados!", "success");
          
          // Re-fetch global modules list to unlock the next module sequential order
          loadModulesList();
        } else {
          showToast(`Sinto muito, você obteve ${data.score}% mas precisava de ${data.passingScore || 70}%. O módulo ficará retido para estudo por 24 horas.`, "error");
        }
      } else {
        showToast(data.error || "Falha ao submeter avaliação.", "error");
      }
    } catch (e) {
      showToast("Falha técnica no processamento do teste.", "error");
    } finally {
      setExamLoading(false);
    }
  };

  return (
    <div className="bg-[#0b0c10] text-[#c5c6c7] min-h-screen p-4 sm:p-6 pb-28 space-y-6 relative font-sans select-none" id="core-course-modules-root">
      
      {/* TEST BANNER */}
      <div className="bg-red-600 text-white text-center py-3 font-semibold text-sm rounded-lg shadow-lg mb-4 animate-bounce">
        CURSOS BUILD TEST V99
      </div>
      
      {/* GLOBAL HERO AND XP SUMMARY SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-display font-black text-2xl text-white shadow-xl">
            📚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-lg tracking-tight text-white uppercase sm:text-xl">Módulos do Curso</h2>
              <span className="p-0.5 px-2 bg-indigo-505/10 border border-indigo-500/30 rounded font-mono text-[9px] font-black text-indigo-400 uppercase tracking-widest">Ativo</span>
            </div>
            <p className="text-xs text-slate-400">Currículo estruturado em 20 módulos sequenciais para atletas profissionais.</p>
          </div>
        </div>

        {/* Global summary stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="p-2.5 px-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <p className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider">Tempo de Estudo</p>
            <p className="font-black text-slate-100 font-mono flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-violet-400" />
              <span>{formatStudyTime(studySeconds)}</span>
            </p>
          </div>
          <div className="p-2.5 px-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <p className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider">Desempenho Geral</p>
            <p className="font-black text-violet-400 font-mono flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
              <span>{modules.filter(m => m.completeness === 100).length} Concluídos</span>
            </p>
          </div>
          <div className="p-2.5 px-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <p className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider">Pontuação Aluno</p>
            <p className="font-black text-amber-500 font-mono flex items-center gap-1.5 mt-0.5 animate-pulse">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{user.xp} XP</span>
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 text-center space-y-4" id="modules-loading-spinner-state">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-mono">Conectando ao banco de dados e preparando os módulos do curso...</p>
        </div>
      ) : (
        /* ROUTING PANELS */
        <>
          {/* STATE A: ALL MODULES GALLERY GRID LIST */}
          {!activeModuleId && !activeExamModuleId && (
            <div className="space-y-4 animate-fadeIn" id="modules-gallery-panel">
              <div className="flex justify-between items-center bg-slate-950/50 p-3 px-4 rounded-2xl border border-slate-850">
                <span className="text-xs uppercase text-slate-400 font-mono font-bold tracking-wider">Graus e Requisitos</span>
                <span className="text-xs text-slate-500 font-mono">{modules.length} Módulos Integrados</span>
              </div>

              {modules.length === 0 ? (
                <div className="bg-slate-900/40 p-16 rounded-3xl text-center border border-slate-800 space-y-3">
                  <span className="text-4xl block">🥋</span>
                  <p className="text-sm font-semibold text-slate-400">Ranking ainda não possui atletas cadastrados.</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">Nenhum módulo de curso foi semeado ou adicionado no banco de dados. Por favor certifique-se de executar um reload.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modules.map(mod => {
                    const beltName = mod.order <= 4 ? "Faixa Branca" : mod.order <= 8 ? "Faixa Azul" : mod.order <= 12 ? "Faixa Roxa" : mod.order <= 16 ? "Faixa Marrom" : "Faixa Preta";
                    const beltBadgeColor = mod.order <= 4 ? "bg-white text-slate-900 border-white/40" : mod.order <= 8 ? "bg-blue-600 text-white border-blue-500/40" : mod.order <= 12 ? "bg-purple-600 text-white border-purple-500/40" : mod.order <= 16 ? "bg-amber-800 text-amber-100 border-amber-900/40" : "bg-zinc-900 text-red-500 border-red-600/40";

                    return (
                      <div 
                        key={mod.id}
                        id={`module-card-${mod.id}`}
                        className={`bg-slate-900/50 rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                          mod.unlocked 
                            ? 'border-slate-800 hover:border-violet-500/30 shadow-lg hover:shadow-violet-500/5' 
                            : 'border-slate-900/60 opacity-65 grayscale'
                        }`}
                      >
                        {/* Thumbnail cover design */}
                        <div className="h-40 w-full relative overflow-hidden bg-slate-950 group">
                          <img 
                            src={mod.thumbnail || "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=500&auto=format&fit=crop&q=80"}
                            alt={mod.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                          
                          {/* Top floating tags */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="p-1 px-2 bg-slate-950/80 backdrop-blur-md rounded-lg font-mono text-[9px] font-bold text-violet-400 uppercase tracking-widest border border-slate-800">
                              Módulo {String(mod.order).padStart(2, '0')}
                            </span>
                            <span className={`p-1 px-2 border rounded-lg font-mono text-[9px] font-bold uppercase ${beltBadgeColor}`}>
                              {beltName}
                            </span>
                          </div>

                          {/* Completion indicator */}
                          {mod.unlocked && mod.completeness > 0 && (
                            <div className="absolute bottom-3 right-3 p-1 px-2.5 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-800 text-[10px] font-mono font-extrabold text-violet-400">
                              {mod.completeness}%
                            </div>
                          )}

                          {/* Locked cover overlay */}
                          {!mod.unlocked && (
                            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                              <Lock className="w-8 h-8 text-slate-500 mb-2" />
                              <span className="text-[10px] font-mono tracking-wider text-rose-400 uppercase font-black bg-rose-500/10 p-1 px-2 rounded-md border border-rose-500/20">Módulo Retido</span>
                              <p className="text-[10px] text-slate-400 mt-2 font-mono max-w-[200px] leading-relaxed">{mod.lockReason}</p>
                            </div>
                          )}
                        </div>

                        {/* Card metadata segment */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <h3 className="font-display font-black text-sm text-slate-100 uppercase tracking-tight">{mod.title}</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">{mod.description}</p>
                          </div>

                          <div className="space-y-3 pt-2">
                            {/* Inner mini visual statistics */}
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                              <span>📚 {mod.lessonsCount} aulas completas</span>
                              <span>⏱️ Est. {mod.estimatedHours}h estudo</span>
                            </div>

                            {/* Completeness progress bar */}
                            {mod.unlocked && (
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850/60">
                                <div 
                                  className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${mod.completeness}%` }}
                                ></div>
                              </div>
                            )}

                            {/* Blocking lockout warning banner */}
                            {mod.blockTimeRemainingMs > 0 && (
                              <div className="p-2 rounded-xl bg-rose-950/50 border border-rose-900/30 flex items-center gap-2 text-[10px] text-rose-300 font-mono">
                                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>Bloqueio do exame ativo. Nova chance em breve.</span>
                              </div>
                            )}

                            {/* Actions bar */}
                            {mod.unlocked ? (
                              <div className="flex gap-2 pt-1">
                                {mod.completeness === 100 && !mod.latestAttemptPassed && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenExam(mod.id)}
                                    className="flex-1 p-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-white font-mono font-bold text-xs uppercase cursor-pointer hover:shadow-lg hover:shadow-violet-600/20 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                                  >
                                    <Award className="w-4 h-4" />
                                    <span>Prestar Prova Final</span>
                                  </button>
                                )}
                                
                                <button
                                  type="button"
                                  onClick={() => handleOpenModule(mod.id)}
                                  className={`p-2 px-4 rounded-xl font-mono font-bold text-xs uppercase cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 ${
                                    mod.completeness === 100 && !mod.latestAttemptPassed
                                      ? 'bg-slate-850 hover:bg-slate-800 text-slate-205 border border-slate-750'
                                      : 'flex-1 bg-violet-600 hover:bg-violet-550 text-white shadow-md hover:shadow-violet-500/10'
                                  }`}
                                >
                                  <span>{mod.completeness === 100 ? "Revisar Aulas" : "Treinar Módulo"}</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="w-full p-2.5 rounded-xl bg-slate-950/60 text-slate-550 font-mono text-[10px] uppercase border border-slate-900 flex items-center justify-center gap-1.5"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Grau Retido</span>
                              </button>
                            )}

                            {/* Pre-recorded historic status badge */}
                            {mod.latestAttemptPassed !== null && (
                              <div className={`p-2 rounded-xl text-center text-[9px] font-mono border ${
                                mod.latestAttemptPassed 
                                  ? 'bg-emerald-950/40 border-emerald-900/30 text-emerald-400' 
                                  : 'bg-rose-950/40 border-rose-900/30 text-rose-400'
                              }`}>
                                {mod.latestAttemptPassed 
                                  ? `🎓 Aprovado com Nota ${mod.latestAttemptScore}%`
                                  : `🔴 Reprovado com Nota ${mod.latestAttemptScore}%`
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STATE B: INDIVIDUAL MODULE LESSONS TIMELINE VIEW */}
          {activeModuleId && !activeLessonId && !activeExamModuleId && (
            <div className="space-y-6 animate-fadeIn" id="module-lessons-timeline">
              
              {/* Goback path button direction */}
              <button
                type="button"
                onClick={() => {
                  setActiveModuleId(null);
                  setActiveModule(null);
                  setLessons([]);
                }}
                className="p-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-205 hover:text-white border border-slate-800 cursor-pointer flex items-center gap-2 text-xs font-mono font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Módulos</span>
              </button>

              {moduleLoading ? (
                <div className="p-24 text-center space-y-3" id="single-modules-loading">
                  <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500 font-mono">Requisitando trilha curricular e status do progresso...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left overview pane sidebar */}
                  <div className="lg:col-span-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4 self-start">
                    {/* Thumbnail representation banner */}
                    <div className="rounded-2xl h-44 overflow-hidden relative border border-slate-800">
                      <img 
                        src={activeModule?.coverImage || activeModule?.thumbnail} 
                        alt={activeModule?.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                      <span className="absolute bottom-3 left-3 p-1 px-2.5 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-slate-800 text-[10px] font-mono text-indigo-400 font-bold">
                        Grau {activeModule?.order}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-[9px] uppercase font-bold text-violet-400">Guia de Estudos</span>
                      <h2 className="font-display font-black text-base text-white uppercase">{activeModule?.title}</h2>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{activeModule?.description}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>Completes total do Grau</span>
                        <span className="text-white font-bold">{activeModule?.completeness}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${activeModule?.completeness}%` }}
                        ></div>
                      </div>

                      <div className="pt-2 flex flex-col gap-2">
                        {/* If completeness is 100% and not authorized final passed, show Final exam submitter button! */}
                        {activeModule?.completeness === 100 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenExam(activeModuleId)}
                            className="w-full p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-white font-mono font-bold text-xs uppercase cursor-pointer hover:shadow-lg hover:shadow-violet-600/20 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                          >
                            <Award className="w-4 h-4" />
                            <span>Iniciar Avaliação de Certificado</span>
                          </button>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center space-y-1">
                            <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">Trilha em Aprendizado</p>
                            <p className="text-[9.5px] text-slate-500 font-sans">Complete todas as 40 aulas sequenciais deste módulo para habilitar a prova final teórica-prática.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side syllabus timeline tracker */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Cronograma de Aulas</span>
                      <span className="text-[10px] py-0.5 px-2 bg-slate-900 text-slate-405 border border-slate-800 font-mono rounded">Sequencial</span>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                      {lessons.length === 0 ? (
                        <div className="bg-slate-900/30 p-12 text-center rounded-2xl border border-slate-850/60">
                          <p className="text-xs text-slate-500 font-mono">Semeando novas aulas para o módulo seletivo...</p>
                        </div>
                      ) : (
                        lessons.map((les, idx) => {
                          const isDone = les.progress?.completed;
                          
                          return (
                            <div 
                              key={les.id}
                              id={`lesson-row-${les.id}`}
                              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row justify-between gap-4 items-start md:items-center ${
                                les.unlocked 
                                  ? isDone
                                    ? 'bg-indigo-950/5 border-indigo-950/40 hover:bg-indigo-950/10'
                                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                                  : 'bg-slate-950/40 border-slate-900/80 opacity-55 justify-between'
                              }`}
                            >
                              <div className="flex gap-3 items-start">
                                {/* Locking icon index indicator */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 ${
                                  isDone
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : les.unlocked
                                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                      : 'bg-slate-950 text-slate-600'
                                }`}>
                                  {isDone ? '✓' : idx + 1}
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-display font-extrabold text-xs text-slate-205 sm:text-sm uppercase tracking-tight">{les.title}</h4>
                                    {isDone && (
                                      <span className="p-0.5 px-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[8px] font-mono tracking-widest font-bold uppercase shrink-0">CONCLUÍDO</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-405 leading-relaxed line-clamp-1">{les.description}</p>
                                  
                                  {/* Micro badges showing completeness values */}
                                  {les.unlocked && (
                                    <div className="flex flex-wrap gap-1.5 pt-1 text-[8.5px] font-mono select-none">
                                      <span className={`p-0.5 px-1.5 rounded ${les.progress?.videoCompleted ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/30' : 'bg-slate-950 text-slate-550'}`}>Vídeo</span>
                                      <span className={`p-0.5 px-1.5 rounded ${les.progress?.audioCompleted ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/30' : 'bg-slate-950 text-slate-550'}`}>Audio</span>
                                      <span className={`p-0.5 px-1.5 rounded ${les.progress?.textCompleted ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/30' : 'bg-slate-950 text-slate-550'}`}>Leitura</span>
                                      <span className={`p-0.5 px-1.5 rounded ${les.progress?.quizCompleted ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/30' : 'bg-slate-950 text-slate-550'}`}>Quiz</span>
                                      <span className={`p-0.5 px-1.5 rounded ${les.progress?.flashcardsCompleted ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/30' : 'bg-slate-950 text-slate-550'}`}>Cards</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0 w-full md:w-auto">
                                {les.unlocked ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenLesson(les.id)}
                                    className={`w-full md:w-auto p-2 px-4 rounded-xl font-mono font-bold text-xs uppercase cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 ${
                                      isDone
                                        ? 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-755'
                                        : 'bg-violet-600 hover:bg-violet-550 text-white shadow-md shadow-violet-500/5'
                                    }`}
                                  >
                                    <span>{isDone ? "Estudar de Novo" : "Treinar Postura"}</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <div className="text-[10px] text-slate-600 font-mono uppercase bg-slate-950 p-2 rounded-xl text-center border border-slate-900/50 flex items-center justify-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Aula Bloqueada</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE C: ACTIVE LESSON MULTI-COMPONENT STUDY MODE VIEW */}
          {activeLessonId && activeLesson && (
            <div className="space-y-6 animate-fadeIn" id="active-lesson-dashboard">
              
              {/* Goback link */}
              <button
                type="button"
                onClick={() => {
                  setActiveLessonId(null);
                  setActiveLesson(null);
                  setQuizzes([]);
                  setFlashcards([]);
                }}
                className="p-2 px-4 rounded-xl bg-slate-905 hover:bg-slate-850 text-slate-205 hover:text-white border border-slate-800 cursor-pointer flex items-center gap-2 text-xs font-mono font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Trilha de Aulas</span>
              </button>

              {lessonLoading ? (
                <div className="p-24 text-center space-y-3" id="lesson-screen-loading">
                  <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500 font-mono">Preparando áudio, vídeos, quizzes e flashcards de pronúncia...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left component content display pane (8 columns) */}
                  <div className="lg:col-span-8 bg-slate-900/40 rounded-3xl border border-slate-800 overflow-hidden flex flex-col justify-between min-h-[500px]" id="lesson-study-player">
                    
                    {/* Top sub tabs controllers selector */}
                    <div className="flex overflow-x-auto bg-slate-950/80 border-b border-slate-800 p-2 sm:p-2.5 gap-1 scrollbar-none sticky top-0 z-10">
                      <button
                        type="button"
                        onClick={() => setStudyTab('video')}
                        className={`p-2.5 px-4 rounded-xl text-xs font-mono font-extrabold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                          studyTab === 'video' 
                            ? 'bg-violet-650 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>Vídeo-Aula</span>
                        {activeLesson.progress?.videoCompleted && <span className="text-[9px] text-emerald-400">✓</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudyTab('audio')}
                        className={`p-2.5 px-4 rounded-xl text-xs font-mono font-extrabold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                          studyTab === 'audio' 
                            ? 'bg-violet-650 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
                        }`}
                      >
                        <Music className="w-4 h-4" />
                        <span>Podcast Podcast</span>
                        {activeLesson.progress?.audioCompleted && <span className="text-[9px] text-emerald-400">✓</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudyTab('text')}
                        className={`p-2.5 px-4 rounded-xl text-xs font-mono font-extrabold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                          studyTab === 'text' 
                            ? 'bg-violet-650 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Leitura Memorize</span>
                        {activeLesson.progress?.textCompleted && <span className="text-[9px] text-emerald-400">✓</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudyTab('quiz')}
                        className={`p-2.5 px-4 rounded-xl text-xs font-mono font-extrabold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                          studyTab === 'quiz' 
                            ? 'bg-violet-650 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Quiz Vocabulário</span>
                        {activeLesson.progress?.quizCompleted && <span className="text-[9px] text-emerald-400">✓</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudyTab('flashcard')}
                        className={`p-2.5 px-4 rounded-xl text-xs font-mono font-extrabold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                          studyTab === 'flashcard' 
                            ? 'bg-violet-650 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>Flashcards</span>
                        {activeLesson.progress?.flashcardsCompleted && <span className="text-[9px] text-emerald-400">✓</span>}
                      </button>
                    </div>

                    {/* Outer Body Container for Current Active Tab */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      
                      {/* SUBTAB 1: VIDEO-AULA */}
                      {studyTab === 'video' && (
                        <div className="space-y-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            {/* Embedded clean iframe component */}
                            <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-video shadow-2xl border border-slate-800">
                              <iframe 
                                className="absolute top-0 left-0 w-full h-full"
                                src={activeLesson.videoUrl || "https://www.youtube.com/embed/Wt_RyWErotc"} 
                                title={activeLesson.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                referrerPolicy="no-referrer"
                              ></iframe>
                            </div>
                            
                            <div className="space-y-1 pt-1">
                              <span className="text-[9.5px] font-mono tracking-widest text-indigo-400 uppercase font-bold">Estudo Guiado de Vídeo</span>
                              <h3 className="font-display font-black text-sm text-white uppercase sm:text-base">{activeLesson.title}</h3>
                              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">Assista a aula teórica instrucional em inglês sobre técnicas corporais e gramática comunicativa essencial.</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 font-mono">Recompensa: {activeLesson.xpReward || 30} XP acumulados no progresso global.</span>
                            {!activeLesson.progress?.videoCompleted ? (
                              <button
                                type="button"
                                onClick={() => handleMarkComponentCompleted('video')}
                                className="p-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center gap-2 active:scale-95 transition-all shadow shadow-indigo-500/10"
                              >
                                <span>Marcar Vídeo como Concluído</span>
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="p-2 px-4 rounded-xl bg-slate-950 text-emerald-400 border border-emerald-900/30 font-mono text-xs font-bold flex items-center gap-1.5 select-none">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Vídeo Concluído ✓</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 2: PODCAST/AUDIO PLAYER */}
                      {studyTab === 'audio' && (
                        <div className="space-y-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-6">
                            <div className="p-6 bg-slate-950/70 border border-slate-850 rounded-3xl flex flex-col items-center justify-center py-12 text-center relative overflow-hidden">
                              {/* Glowing radial backdraft overlay */}
                              <div className="absolute w-44 h-44 rounded-full bg-violet-600/10 blur-3xl"></div>

                              <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl mb-4 relative shadow-lg">
                                🎧
                              </div>
                              <h4 className="font-display font-black text-sm text-slate-205 uppercase tracking-wider">Listening Podcast</h4>
                              <p className="text-[10px] text-slate-500 font-mono mt-1">Nomenclaturas, comandos de tatame e conversação ativa no fone</p>
                              
                              {/* Audio Sound Wave animation simulation */}
                              <div className="flex gap-1.5 items-end justify-center h-8 my-6 w-full">
                                {[1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2, 1, 4, 2].map((val, idx) => (
                                  <div 
                                    key={idx}
                                    className="w-1 bg-violet-500 rounded-full transition-all duration-300"
                                    style={{ 
                                      height: isPlayingAudio ? `${val * 6}px` : '3px',
                                      animation: isPlayingAudio ? `pulse 1s ease-in-out infinite alternate ${idx * 0.08}s` : 'none'
                                    }}
                                  ></div>
                                ))}
                              </div>

                              {/* Interactive local custom simulation controller */}
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsPlayingAudio(!isPlayingAudio);
                                    if(!isPlayingAudio){
                                      const interval = setInterval(() => {
                                        setAudioPlaybackProgress(prev => {
                                          if (prev >= 100) {
                                            clearInterval(interval);
                                            setIsPlayingAudio(false);
                                            return 100;
                                          }
                                          return prev + 5;
                                        });
                                      }, 500);
                                    }
                                  }}
                                  className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-550 transition-all cursor-pointer shadow-lg active:scale-90"
                                >
                                  {isPlayingAudio ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAudioPlaybackProgress(0)}
                                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all"
                                  title="Reiniciar áudio"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Playback timeline slider */}
                              <div className="w-full max-w-sm mt-6 space-y-1">
                                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                                  <div className="bg-violet-500 h-full transition-all duration-300" style={{ width: `${audioPlaybackProgress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[8px] font-mono text-slate-650">
                                  <span>00:{String(Math.floor(audioPlaybackProgress / 10)).padStart(2, '0')}</span>
                                  <span>01:40</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest block">Podcast Integrado</span>
                              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{activeLesson.description}</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 font-mono">Tópico: Vocabulário focado em submissões.</span>
                            {!activeLesson.progress?.audioCompleted ? (
                              <button
                                type="button"
                                onClick={() => handleMarkComponentCompleted('audio')}
                                className="p-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center gap-2 active:scale-95 transition-all shadow shadow-indigo-500/10"
                              >
                                <span>Concluir Escuta Podcast</span>
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="p-2 px-4 rounded-xl bg-slate-950 text-emerald-400 border border-emerald-900/30 font-mono text-xs font-bold flex items-center gap-1.5 select-none">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Podcast Concluído ✓</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 3: READING/TEXT MATERIALS */}
                      {studyTab === 'text' && (
                        <div className="space-y-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-6">
                            <div className="p-6 bg-slate-950/40 rounded-3xl border border-slate-850 prose prose-invert font-sans max-h-[350px] overflow-y-auto max-w-none scrollbar-thin">
                              <span className="p-1 px-2.5 bg-slate-900 border border-slate-800 text-[9px] text-amber-400 font-mono rounded inline-block mb-3">APOSTILA DIGITAL</span>
                              
                              <h3 className="text-white font-display font-black text-sm uppercase mb-3 text-slate-101 select-text">BJJ Lexicon & Tactical Commands</h3>
                              
                              <div className="text-xs text-slate-350 leading-relaxed space-y-4 select-text">
                                <p>No Jiu-Jitsu de competição internacional, entender os comandos em inglês ditados pelos árbitros assim como terminologia tática é fundamental para o sucesso absoluto em campeonatos mundiais.</p>
                                
                                <div className="p-3 bg-slate-900/80 rounded-2xl border border-indigo-900/20 my-4 space-y-2 font-mono">
                                  <p className="text-[9px] uppercase font-bold text-indigo-400">Glossário Chave do Grau {activeModule?.order}</p>
                                  <ul className="list-inside space-y-1 list-disc text-[10px] text-slate-300">
                                    <li><strong className="text-slate-102">"Lock up the guard"</strong> - Fechar a guarda / travar postura por baixo</li>
                                    <li><strong className="text-slate-102">"Pass the guard"</strong> - Passar a guarda / contornar pernas do oponente</li>
                                    <li><strong className="text-slate-102">"Sweep"</strong> - Raspar / inverter de baixo para cima</li>
                                    <li><strong className="text-slate-102">"Tap out"</strong> - Bater / desistir / finalizar</li>
                                  </ul>
                                </div>

                                <p>{activeLesson.readingText || "Documento complementar didático disponível para download rápido. Use para construir fichas físicas se necessário."}</p>
                              </div>
                            </div>

                            {/* Complementary resource file downloader and metadata link */}
                            <a 
                              href={activeLesson.complementaryMaterialUrl || "/api/payments/simulator"}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 flex justify-between items-center transition-all cursor-pointer select-none group"
                            >
                              <div className="flex gap-3 items-center">
                                <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-505/25 flex items-center justify-center">
                                  <FileDown className="w-5 h-5 text-violet-400" />
                                </div>
                                <div>
                                  <h5 className="font-mono text-[10px] text-white uppercase font-black tracking-wider group-hover:text-violet-400 transition-colors">Study_Booklet_Unit_{activeLesson.order}.pdf</h5>
                                  <p className="text-[9px] text-slate-500 font-sans">Material didático de apoio e vocabulário • PDF • 1.2MB</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                            </a>
                          </div>

                          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 font-mono">Utilize a seleção de texto para copiar vocábulos.</span>
                            {!activeLesson.progress?.textCompleted ? (
                              <button
                                type="button"
                                onClick={() => handleMarkComponentCompleted('text')}
                                className="p-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center gap-2 active:scale-95 transition-all shadow shadow-indigo-500/10"
                              >
                                <span>Marcar Leitura como Concluída</span>
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="p-2 px-4 rounded-xl bg-slate-950 text-emerald-400 border border-emerald-900/30 font-mono text-xs font-bold flex items-center gap-1.5 select-none">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Apostila Concluída ✓</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 4: INTERACTIVE VOCABULARY QUIZ */}
                      {studyTab === 'quiz' && (
                        <div className="space-y-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">Mini Teste Vocabulários</span>
                              <h3 className="font-display font-black text-sm text-white uppercase">Responda corretamente as perguntas baseadamente na aula</h3>
                            </div>

                            {quizzes.length === 0 ? (
                              <div className="bg-slate-950/60 p-12 text-center rounded-2xl border border-slate-850/60 font-mono text-xs text-slate-500">
                                📝 Nenhum questionário cadastrado para esta lição. Marque como concluído diretamente para avançar.
                              </div>
                            ) : (
                              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                                {quizzes.map((q, qIndex) => {
                                  // Parse options list
                                  let finalOptions: string[] = [];
                                  if (Array.isArray(q.options)) {
                                    finalOptions = q.options;
                                  } else {
                                    try {
                                      finalOptions = JSON.parse(q.options as any || "[]");
                                    } catch (err) {
                                      finalOptions = [];
                                    }
                                  }

                                  return (
                                    <div key={q.id} className="p-4 bg-slate-950/50 border border-slate-850 rounded-2xl space-y-3">
                                      <p className="text-xs text-slate-205 font-mono select-text font-bold"><span className="text-violet-400">P{qIndex + 1}:</span> {q.question}</p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {finalOptions.map((opt, optIdx) => {
                                          const isSelected = selectedQuizAnswers[q.id] === opt;
                                          return (
                                            <button
                                              key={optIdx}
                                              type="button"
                                              onClick={() => {
                                                if (quizScoreChecked) return;
                                                setSelectedQuizAnswers(prev => ({
                                                  ...prev,
                                                  [q.id]: opt
                                                }));
                                              }}
                                              className={`p-3 rounded-xl border text-left text-[11px] font-mono transition-all cursor-pointer ${
                                                isSelected 
                                                  ? 'bg-violet-650 text-white border-violet-500 shadow'
                                                  : 'bg-slate-900 text-slate-350 border-slate-800 hover:bg-slate-850'
                                              }`}
                                            >
                                              <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)})</span>
                                              <span>{opt}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-slate-800 flex justify-between items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-mono">Respostas e validações automáticas por IA corporativa.</span>
                            
                            {quizzes.length > 0 && (
                              <div className="flex gap-2">
                                {quizScoreChecked && !quizSuccess && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedQuizAnswers({});
                                      setQuizScoreChecked(false);
                                      setQuizSuccess(null);
                                    }}
                                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 cursor-pointer active:scale-95 transition-all text-xs font-mono"
                                  >
                                    Tentar Novamente
                                  </button>
                                )}

                                {!activeLesson.progress?.quizCompleted ? (
                                  <button
                                    type="button"
                                    onClick={handleCheckQuizAnswers}
                                    className="p-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center gap-2 active:scale-95 transition-all shadow shadow-indigo-500/10"
                                  >
                                    <span>Corrigir Respostas</span>
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <span className="p-2 px-4 rounded-xl bg-slate-950 text-emerald-400 border border-emerald-900/30 font-mono text-xs font-bold flex items-center gap-1.5 select-none">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Quiz Aprovado ✓</span>
                                  </span>
                                )}
                              </div>
                            )}

                            {quizzes.length === 0 && (
                              <button
                                type="button"
                                onClick={() => handleMarkComponentCompleted('quiz')}
                                className="p-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono font-bold text-xs uppercase cursor-pointer active:scale-95 transition-all"
                              >
                                Concluir Módulo Quiz
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 5: ENGLISH PRO/MEMORIZATION FLASHCARDS */}
                      {studyTab === 'flashcard' && (
                        <div className="space-y-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">Deck Memorize & TTS Pronúncia</span>
                              {flashcards.length > 0 && (
                                <span className="text-[10px] font-mono text-slate-500">Card {activeFlashcardIndex + 1} de {flashcards.length}</span>
                              )}
                            </div>

                            {flashcards.length === 0 ? (
                              <div className="bg-slate-950/60 p-12 text-center rounded-2xl border border-slate-850/60 font-mono text-xs text-slate-500">
                                🗃️ Nenhum flashcard cadastrado nesta lição.
                              </div>
                            ) : (
                              <div className="flex flex-col items-center space-y-6">
                                
                                {/* Flippable card display unit with perspective mechanics */}
                                <div 
                                  onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                                  className={`w-full max-w-sm h-56 rounded-3xl border cursor-pointer relative transition-all duration-300 transform select-none flex flex-col items-center justify-center p-6 text-center shadow-lg active:scale-98 ${
                                    isFlashcardFlipped 
                                      ? 'bg-slate-900 border-indigo-500/30 rotate-y-360' 
                                      : 'bg-slate-950 border-slate-800'
                                  }`}
                                >
                                  {isFlashcardFlipped ? (
                                    /* Back side */
                                    <div className="space-y-3 animate-fadeIn">
                                      <span className="text-[8.5px] font-mono tracking-widest text-indigo-400 uppercase font-black">PORTUGUÊS / DEFINIÇÃO</span>
                                      <h3 className="font-display font-black text-lg text-white uppercase select-text">{flashcards[activeFlashcardIndex].back}</h3>
                                      <p className="text-[9.5px] italic text-slate-500">Dica: {flashcards[activeFlashcardIndex].pronunciationHint || "Pronuncie abrindo o quadril"}</p>
                                    </div>
                                  ) : (
                                    /* Front side with audio trigger option */
                                    <div className="space-y-4 animate-fadeIn">
                                      <span className="text-[8.5px] font-mono tracking-widest text-violet-400 uppercase font-black">TERMO EM INGLÊS DE COMBATE</span>
                                      <h3 className="font-display font-black text-xl text-slate-101 uppercase select-text tracking-wide">{flashcards[activeFlashcardIndex].front}</h3>
                                      
                                      <div className="flex justify-center gap-2 pt-1">
                                        <button 
                                          type="button" 
                                          onClick={(e) => {
                                            e.stopPropagation(); // Avoid triggering flip
                                            handlePronounce(flashcards[activeFlashcardIndex].front);
                                          }}
                                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-[9.5px] font-mono"
                                        >
                                          <Volume2 className="w-4 h-4 text-violet-400" />
                                          <span>Escutar Pronúncia</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Absolute click to flip status indicator block */}
                                  <div className="absolute bottom-3 text-[8.5px] font-mono tracking-wider text-slate-500 uppercase select-none">
                                    Clique para virar o card 🔄
                                  </div>
                                </div>

                                {/* Controller navigation options */}
                                <div className="flex justify-between items-center w-full max-w-sm">
                                  <button
                                    type="button"
                                    disabled={activeFlashcardIndex === 0}
                                    onClick={() => {
                                      setActiveFlashcardIndex(prev => prev - 1);
                                      setIsFlashcardFlipped(false);
                                    }}
                                    className="p-2 sm:p-2.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-850 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-mono"
                                  >
                                    Anterior
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleMemorized(flashcards[activeFlashcardIndex].id)}
                                    className={`p-2.5 px-4 rounded-xl font-mono text-[10px] font-bold uppercase cursor-pointer transition-all ${
                                      memorizedCardIds[flashcards[activeFlashcardIndex].id]
                                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-101'
                                    }`}
                                  >
                                    {memorizedCardIds[flashcards[activeFlashcardIndex].id] ? "✓ Já de Corei!" : "☑ Memorizar Card"}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={activeFlashcardIndex === flashcards.length - 1}
                                    onClick={() => {
                                      setActiveFlashcardIndex(prev => prev + 1);
                                      setIsFlashcardFlipped(false);
                                    }}
                                    className="p-2 sm:p-2.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-850 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-mono"
                                  >
                                    Próximo
                                  </button>
                                </div>

                                {/* Custom checklist metric progress for Deck */}
                                <div className="text-[10px] text-slate-500 font-mono select-none">
                                  Revisado: {Object.keys(memorizedCardIds).filter(k => memorizedCardIds[k]).length} de {flashcards.length} cards memorizados.
                                </div>

                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 font-mono">Dica de arbitragem e pronúncia em fones.</span>
                            {!activeLesson.progress?.flashcardsCompleted ? (
                              <button
                                type="button"
                                onClick={() => handleMarkComponentCompleted('flashcard')}
                                className="p-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center gap-2 active:scale-95 transition-all shadow shadow-indigo-500/10"
                              >
                                <span>Concluir Deck Flashcards</span>
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="p-2 px-4 rounded-xl bg-slate-950 text-emerald-400 border border-emerald-900/30 font-mono text-xs font-bold flex items-center gap-1.5 select-none">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Cartas Concluídas ✓</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Right hand checklist overview stats sidebar (4 columns) */}
                  <div className="lg:col-span-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4 self-start" id="lesson-checklist-sidebar">
                    <span className="text-[9.5px] uppercase font-bold text-violet-400 font-mono">Status da Lição</span>
                    <h3 className="font-display font-black text-base text-white uppercase">{activeLesson.title}</h3>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{activeLesson.description}</p>

                    <div className="pt-4 border-t border-slate-850 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">Checklist de Sub-Módulos</span>
                      
                      <div className="space-y-2">
                        <div className={`p-3 rounded-2xl border flex justify-between items-center font-mono text-xs ${activeLesson.progress?.videoCompleted ? 'bg-emerald-950/20 border-emerald-900/20 text-emerald-400' : 'bg-slate-950/70 border-slate-850 text-slate-400'}`}>
                          <span className="flex items-center gap-2"><Video className="w-3.5 h-3.5" /> 1. Vídeo-Aula</span>
                          <span>{activeLesson.progress?.videoCompleted ? "✓ Concluído" : "Pendente"}</span>
                        </div>

                        <div className={`p-3 rounded-2xl border flex justify-between items-center font-mono text-xs ${activeLesson.progress?.audioCompleted ? 'bg-emerald-950/20 border-emerald-900/20 text-emerald-400' : 'bg-slate-950/70 border-slate-850 text-slate-400'}`}>
                          <span className="flex items-center gap-2"><Music className="w-3.5 h-3.5" /> 2. Podcast</span>
                          <span>{activeLesson.progress?.audioCompleted ? "✓ Concluído" : "Pendente"}</span>
                        </div>

                        <div className={`p-3 rounded-2xl border flex justify-between items-center font-mono text-xs ${activeLesson.progress?.textCompleted ? 'bg-emerald-950/20 border-emerald-900/20 text-emerald-400' : 'bg-slate-950/70 border-slate-850 text-slate-400'}`}>
                          <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> 3. Leitura</span>
                          <span>{activeLesson.progress?.textCompleted ? "✓ Concluído" : "Pendente"}</span>
                        </div>

                        <div className={`p-3 rounded-2xl border flex justify-between items-center font-mono text-xs ${activeLesson.progress?.quizCompleted ? 'bg-emerald-950/20 border-emerald-900/20 text-emerald-400' : 'bg-slate-950/70 border-slate-850 text-slate-400'}`}>
                          <span className="flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5" /> 4. Quiz</span>
                          <span>{activeLesson.progress?.quizCompleted ? "✓ Concluído" : "Pendente"}</span>
                        </div>

                        <div className={`p-3 rounded-2xl border flex justify-between items-center font-mono text-xs ${activeLesson.progress?.flashcardsCompleted ? 'bg-emerald-950/20 border-emerald-900/20 text-emerald-400' : 'bg-slate-950/70 border-slate-850 text-slate-400'}`}>
                          <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> 5. Flashcards</span>
                          <span>{activeLesson.progress?.flashcardsCompleted ? "✓ Concluído" : "Pendente"}</span>
                        </div>
                      </div>

                      {/* Lesson locked summary block */}
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 text-center space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Completeness Lição</span>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${
                                [
                                  activeLesson.progress?.videoCompleted,
                                  activeLesson.progress?.audioCompleted,
                                  activeLesson.progress?.textCompleted,
                                  activeLesson.progress?.quizCompleted,
                                  activeLesson.progress?.flashcardsCompleted
                                ].filter(Boolean).length * 20
                              }%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-[9px] text-slate-500 font-sans">Sua lição só será consolidada como concluída no Postgres quando todos os 5 sub-módulos estiverem preenchidos.</p>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* STATE D: MODULE FINAL TEST / EXAM INTERFACE SUBVIEW */}
          {activeExamModuleId && (
            <div className="space-y-6 animate-fadeIn" id="module-final-exam-board">
              
              {/* Back to module curriculum timeline button */}
              <button
                type="button"
                onClick={() => {
                  setActiveExamModuleId(null);
                  setExamQuestions([]);
                  setSelectedExamAnswers({});
                  setExamResult(null);
                }}
                className="p-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-205 hover:text-white border border-slate-800 cursor-pointer flex items-center gap-2 text-xs font-mono font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Módulo</span>
              </button>

              {examLoading ? (
                <div className="p-24 text-center space-y-3" id="exam-loading-screen">
                  <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500 font-mono">Indexando questionário avaliativo, notas mínimas e cronômetros de trava...</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  {/* Exam Instructions Banner */}
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-display font-black text-sm text-white uppercase sm:text-base">Prova Final Teórica</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-xl">Demonstre domínio textual e conceitual do inglês de combate do Módulo {activeModule?.order}. Esta avaliação possui regras rígidas.</p>
                    </div>
                    <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-2xl text-center shrink-0 min-w-[120px]">
                      <span className="text-[8.5px] text-slate-550 uppercase font-mono block">Nota de Passagem</span>
                      <strong className="text-sm font-mono text-emerald-400">{activeModule?.passingScore || 70}%</strong>
                    </div>
                  </div>

                  {/* Warning on lockout mechanism beforehand */}
                  {!examResult && (
                    <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-2xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-1 font-sans text-xs">
                        <strong className="text-rose-400 font-display uppercase text-[11px] block">ALERTA DE SEGURANÇA CURRICULAR DE 24 HORAS!</strong>
                        <p className="text-rose-300 leading-relaxed text-[10.5px]">Se você fracassar e obtiver nota abaixo de {activeModule?.passingScore || 70}%, sua conta no banco de dados sofrerá uma <strong>retensão didática de 24 horas</strong> para revisão mandatório! Nenhuma nova tentativa ou acesso à avaliação será admitidos neste período.</p>
                      </div>
                    </div>
                  )}

                  {/* Exam Result Outcome screen display */}
                  {examResult ? (
                    <div className="p-8 bg-slate-950 border border-slate-850 rounded-3xl text-center space-y-6 animate-pulse" id="exam-outcome-screen">
                      <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg border relative">
                        {examResult.passed ? '🎓' : '🔴'}
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-display font-black text-xl text-white uppercase">{examResult.passed ? "MÓDULO CERTIFICADO COM SUCESSO!" : "RETENÇÃO DIDÁTICA ATIVADA"}</h3>
                        <p className="text-xs text-slate-400 font-sans max-w-md mx-auto leading-relaxed">
                          {examResult.passed
                            ? `Você acertou ${examResult.correctCount} de ${examResult.totalCount} questões, obtendo nota final de ${examResult.score}%. Este grau foi arquivado com maestria! O próximo módulo da sequência está desbloqueado para treino!`
                            : `Desempenho obtido: ${examResult.score}%. Mínimo para avanço: ${activeModule?.passingScore || 70}%. O sistema determinou uma suspensão temporária de 24 horas para estudo e retenção de vocábulo.`
                          }
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-2xl max-w-sm mx-auto space-y-1 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total de Questões</span>
                          <span className="text-white font-bold">{examResult.totalCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Respostas Corretas</span>
                          <span className="text-white font-bold">{examResult.correctCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Pontuação Obtida</span>
                          <span className={`font-bold ${examResult.passed ? 'text-emerald-450' : 'text-rose-450'}`}>{examResult.score}%</span>
                        </div>
                      </div>

                      <div className="flex justify-center gap-3">
                        {examResult.passed ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveExamModuleId(null);
                              setExamQuestions([]);
                              setActiveModuleId(null);
                            }}
                            className="p-3 px-6 rounded-2xl bg-violet-650 hover:bg-violet-600 text-white font-mono font-bold text-xs uppercase cursor-pointer"
                          >
                            Ir Para Próximo Módulo
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveExamModuleId(null);
                              setExamQuestions([]);
                              setActiveModuleId(null);
                            }}
                            className="p-3 px-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-405 hover:text-white cursor-pointer"
                          >
                            Entendido, Voltar para Módulos
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* The Exam questionnaire form */
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {examQuestions.map((q, idx) => {
                          let optionsList: string[] = [];
                          if (Array.isArray(q.options)) {
                            optionsList = q.options;
                          } else {
                            try {
                              optionsList = JSON.parse(q.options as any || "[]");
                            } catch (e) {
                              optionsList = [];
                            }
                          }

                          return (
                            <div key={q.id} className="p-5 bg-slate-900/30 border border-slate-850 rounded-3xl space-y-3 relative overflow-hidden select-text">
                              <p className="text-xs sm:text-sm text-slate-205 font-mono leading-relaxed"><span className="text-indigo-400 font-bold mr-1">{idx + 1}.</span> {q.question}</p>
                              
                              <div className="grid grid-cols-1 gap-2 pt-2 select-none">
                                {optionsList.map((opt, optIdx) => {
                                  const isChecked = selectedExamAnswers[q.id] === opt;
                                  return (
                                    <button
                                      key={optIdx}
                                      type="button"
                                      onClick={() => {
                                        setSelectedExamAnswers(prev => ({
                                          ...prev,
                                          [q.id]: opt
                                        }));
                                      }}
                                      className={`p-3.5 rounded-2xl border text-left text-xs font-mono transition-all cursor-pointer ${
                                        isChecked 
                                          ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white border-violet-500 shadow-md'
                                          : 'bg-slate-950 text-slate-350 border-slate-850 hover:bg-slate-900'
                                      }`}
                                    >
                                      <span className="font-bold mr-2 text-[10px] uppercase opacity-70">Opção {String.fromCharCode(65 + optIdx)}:</span>
                                      <span>{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <span className="text-[10px] text-slate-500 font-mono">Assinado sob verificação de gabarito e regras da ecossistema.</span>
                        <button
                          type="button"
                          onClick={handleSubmitExamAnswers}
                          disabled={Object.keys(selectedExamAnswers).length < examQuestions.length}
                          className="w-full sm:w-auto p-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono font-bold text-xs uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Enviar Minha Avaliação</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
