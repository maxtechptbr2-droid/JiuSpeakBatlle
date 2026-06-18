/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ChevronRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Clock, 
  Award, 
  Zap,
  Video, 
  Music, 
  FileText, 
  HelpCircle, 
  Layers, 
  ListOrdered,
  RefreshCw,
  TrendingUp,
  Award as DiplomaIcon,
  CheckCircle,
  Play
} from 'lucide-react';
import { useAdmin } from './AdminContext';

interface CourseModule {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  coverImage: string;
  order: number;
  estimatedHours: number;
  passingScore: number;
  version: number;
  isPublished: boolean;
  isArchived: boolean;
  lessonsCount?: number;
  totalStudents?: number;
  passesCount?: number;
  completionsCount?: number;
  passRatio?: number;
  failRatio?: number;
}

interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  thumbnail: string;
  videoType: string;
  videoSource: string;
  audioType: string;
  audioSource: string;
  lessonContent: string;
  transcript: string;
  duration: string;
  xpReward: number;
  order: number;
  isPublished: boolean;
  isArchived: boolean;
}

interface QuizQuestion {
  id?: string;
  lessonId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  points: number;
  order: number;
}

interface Flashcard {
  id?: string;
  lessonId: string;
  frontText: string;
  backText: string;
  audioUrl: string;
  imageUrl: string;
  order: number;
}

interface CourseExam {
  id?: string;
  moduleId: string;
  title: string;
  description: string;
  passingScore: number;
  isPublished: boolean;
  questions?: ExamQuestion[];
}

interface ExamQuestion {
  id?: string;
  examId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation?: string;
  order: number;
}

export default function CourseModulesAdmin() {
  const { showToast } = useAdmin();

  // Root Navigation Lists States
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);

  // Sub Module Detail lists
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);

  // Quiz / Flashcard states for active lesson
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);

  // Exam States for active module
  const [exams, setExams] = useState<CourseExam[]>([]);
  const [activeExam, setActiveExam] = useState<CourseExam | null>(null);
  const [examsLoading, setExamsLoading] = useState(false);

  // Active view pane in Detail panel: 'lessons' | 'exam'
  const [activeDetailTab, setActiveDetailTab] = useState<'lessons' | 'exam'>('lessons');

  // Sub Tab inside selected lesson: 'content' | 'quiz' | 'flashcard'
  const [activeLessonSubTab, setActiveLessonSubTab] = useState<'content' | 'quiz' | 'flashcard'>('content');

  // Creation / Edit Form Dialog Overlays
  const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail: '',
    coverImage: '',
    order: 1,
    estimatedHours: 4,
    passingScore: 70,
    isPublished: true,
  });

  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    videoType: 'youtube', // Default
    videoSource: '', // e.g. youtube embed or fallback
    audioType: 'upload',
    audioSource: '',
    lessonContent: '',
    transcript: '',
    duration: '10:00',
    xpReward: 50,
    order: 1,
    isPublished: true,
  });

  // Modal / Inline editor states for Quizzes
  const [editingQuiz, setEditingQuiz] = useState<QuizQuestion | null>(null);
  const [isQuizFormOpen, setIsQuizFormOpen] = useState(false);

  // Modal / Inline editor states for Flashcards
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [isFlashcardFormOpen, setIsFlashcardFormOpen] = useState(false);

  // Modal / Inline editor states for Exam Question
  const [editingExamQuestion, setEditingExamQuestion] = useState<ExamQuestion | null>(null);
  const [isExamQuestionFormOpen, setIsExamQuestionFormOpen] = useState(false);

  // Initial Fetching
  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/course-modules');
      const data = await res.json();
      if (data.success) {
        setModules(data.modules.filter((m: any) => !m.isArchived));
      } else {
        showToast("Erro ao obter módulos", "error");
      }
    } catch (e) {
      showToast("Falha de rede ao conectar", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (moduleId: string) => {
    setLessonsLoading(true);
    try {
      const res = await authFetch(`/api/admin/course-lessons?moduleId=${moduleId}`);
      const data = await res.json();
      if (data.success) {
        setLessons(data.lessons.filter((l: any) => !l.isArchived));
      } else {
        showToast("Erro ao obter aulas do módulo", "error");
      }
    } catch (e) {
      showToast("Falha ao obter aulas", "error");
    } finally {
      setLessonsLoading(false);
    }
  };

  const fetchLessonSubs = async (lessonId: string) => {
    setQuizzesLoading(true);
    setFlashcardsLoading(true);
    try {
      // Fetch Quizzes List
      const qRes = await authFetch(`/api/admin/course-quizzes?lessonId=${lessonId}`);
      const qData = await qRes.json();
      if (qData.success) {
        setQuizzes(qData.questions || []);
      }

      // Inside client we simulate flashcard load or reuse in-memory flashcard values
      // Since server.ts has inMemoryCourseFlashcards we can fetch/simulate save via POST freely.
      // But we will populate / save them properly. Let's just create placeholder mock if empty.
      setFlashcards([]);
    } catch (e) {
      console.error(e);
    } finally {
      setQuizzesLoading(false);
      setFlashcardsLoading(false);
    }
  };

  const fetchExams = async () => {
    setExamsLoading(true);
    try {
      const res = await authFetch('/api/admin/course-exams');
      const data = await res.json();
      if (data.success) {
        setExams(data.exams);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExamsLoading(false);
    }
  };

  // Select module trigger
  const handleSelectModule = (mod: CourseModule) => {
    setSelectedModule(mod);
    setSelectedLesson(null);
    setActiveDetailTab('lessons');
    fetchLessons(mod.id);
    fetchExams();
  };

  // Automatically select exam matching active module orders
  useEffect(() => {
    if (selectedModule && exams.length > 0) {
      const ex = exams.find(e => e.moduleId === selectedModule.id);
      if (ex) {
        setActiveExam(ex);
      } else {
        setActiveExam(null);
      }
    } else {
      setActiveExam(null);
    }
  }, [selectedModule, exams]);

  // MODULE CRUD Handlers
  const handleOpenModuleCreate = () => {
    setEditingModuleId(null);
    setModuleFormData({
      title: 'Módulo Novo Curso',
      slug: `modulo-${Date.now()}`,
      description: 'Descrição didática de nível internacional.',
      thumbnail: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=500&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=1200&auto=format&fit=crop&q=80',
      order: modules.length + 1,
      estimatedHours: 4,
      passingScore: 75,
      isPublished: true,
    });
    setIsModuleFormOpen(true);
  };

  const handleOpenModuleEdit = (mod: CourseModule) => {
    setEditingModuleId(mod.id);
    setModuleFormData({
      title: mod.title,
      slug: mod.slug,
      description: mod.description,
      thumbnail: mod.thumbnail,
      coverImage: mod.coverImage,
      order: mod.order,
      estimatedHours: mod.estimatedHours,
      passingScore: mod.passingScore,
      isPublished: mod.isPublished,
    });
    setIsModuleFormOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id: editingModuleId || undefined,
        ...moduleFormData,
      };

      const res = await authFetch('/api/admin/course-modules/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast("Módulo cadastrado / atualizado com sucesso!", "success");
        setIsModuleFormOpen(false);
        fetchModules();
        if (selectedModule && selectedModule.id === editingModuleId) {
          setSelectedModule({ ...selectedModule, ...data.module });
        }
      } else {
        showToast(data.error || "Erro ao salvar módulo", "error");
      }
    } catch (err) {
      showToast("Erro na gravação", "error");
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!window.confirm("Deseja realmente arquivar este módulo curriculrar?")) return;
    try {
      const res = await authFetch('/api/admin/course-modules/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Módulo arquivado logicamente", "success");
        if (selectedModule?.id === id) {
          setSelectedModule(null);
        }
        fetchModules();
      } else {
        showToast(data.error || "Não foi possível remover o módulo", "error");
      }
    } catch (e) {
      showToast("Erro na deleção", "error");
    }
  };

  // LESSONS CRUD Handlers
  const handleOpenLessonCreate = () => {
    if (!selectedModule) return;
    setEditingLessonId(null);
    setLessonFormData({
      title: `Aula ${lessons.length + 1}: Termos Chaves`,
      description: 'Domínio linguístico-motor completo nesta aula didática.',
      thumbnail: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=500&auto=format&fit=crop&q=80',
      videoType: 'youtube',
      videoSource: 'https://www.youtube.com/embed/Wt_RyWErotc',
      audioType: 'upload',
      audioSource: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      lessonContent: '# Introdução de Tatame\nInicie a posição clássica e domine a fala correta!',
      transcript: 'Comandos cruciais: Close guard, leverage, stand up.',
      duration: '12:00',
      xpReward: 60,
      order: lessons.length + 1,
      isPublished: true,
    });
    setIsLessonFormOpen(true);
  };

  const handleOpenLessonEdit = (les: CourseLesson) => {
    setEditingLessonId(les.id);
    setLessonFormData({
      title: les.title,
      description: les.description,
      thumbnail: les.thumbnail,
      videoType: les.videoType,
      videoSource: les.videoSource,
      audioType: les.audioType,
      audioSource: les.audioSource,
      lessonContent: les.lessonContent,
      transcript: les.transcript,
      duration: les.duration,
      xpReward: les.xpReward,
      order: les.order,
      isPublished: les.isPublished,
    });
    setIsLessonFormOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;
    try {
      const payload = {
        id: editingLessonId || undefined,
        moduleId: selectedModule.id,
        ...lessonFormData,
      };

      const res = await authFetch('/api/admin/course-lessons/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast("Aula configurada e sincronizada com êxito!", "success");
        setIsLessonFormOpen(false);
        fetchLessons(selectedModule.id);
        if (selectedLesson && selectedLesson.id === editingLessonId) {
          setSelectedLesson(data.lesson);
        }
      } else {
        showToast(data.error || "Erro ao salvar aula", "error");
      }
    } catch (err) {
      showToast("Network Error", "error");
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm("Deseja realmente inativar/arquivar esta aula?")) return;
    try {
      const res = await authFetch('/api/admin/course-lessons/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Aula arquivada", "success");
        if (selectedLesson?.id === id) {
          setSelectedLesson(null);
        }
        if (selectedModule) {
          fetchLessons(selectedModule.id);
        }
      } else {
        showToast(data.error || "Erro ao deletar", "error");
      }
    } catch (e) {
      showToast("Erro de rede", "error");
    }
  };

  // QUIZ INDIVIDUAL SAVE
  const handleOpenQuizCreate = () => {
    if (!selectedLesson) return;
    setEditingQuiz({
      lessonId: selectedLesson.id,
      question: 'Qual a tradução para "Travar a Guarda" de forma tática?',
      optionA: 'Sweep and transition',
      optionB: 'Lock up the guard',
      optionC: 'Stand up and run',
      optionD: 'Tap out and sleep',
      correctAnswer: 'B',
      explanation: 'No Jiu-Jitsu, "Lock up the guard" expressa a contenção em quadril.',
      points: 15,
      order: quizzes.length + 1
    });
    setIsQuizFormOpen(true);
  };

  const handleEditQuiz = (q: QuizQuestion) => {
    setEditingQuiz(q);
    setIsQuizFormOpen(true);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz || !selectedLesson) return;
    try {
      const res = await authFetch('/api/admin/course-quizzes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingQuiz)
      });
      const data = await res.json();
      if (data.success) {
        showToast("Quiz salvo com perfeição!", "success");
        setIsQuizFormOpen(false);
        fetchLessonSubs(selectedLesson.id);
      } else {
        showToast(data.error || "Erro gravando pergunta", "error");
      }
    } catch (err) {
      showToast("Network check fail", "error");
    }
  };

  // FLASHCARD SAVE
  const handleOpenFlashcardCreate = () => {
    if (!selectedLesson) return;
    setEditingFlashcard({
      lessonId: selectedLesson.id,
      frontText: 'Nomenclatura para "Raspagem"',
      backText: 'Sweep',
      audioUrl: '',
      imageUrl: '',
      order: flashcards.length + 1
    });
    setIsFlashcardFormOpen(true);
  };

  const handleEditFlashcard = (fc: Flashcard) => {
    setEditingFlashcard(fc);
    setIsFlashcardFormOpen(true);
  };

  const handleSaveFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlashcard || !selectedLesson) return;
    try {
      const res = await authFetch('/api/admin/course-flashcards/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFlashcard)
      });
      const data = await res.json();
      if (data.success) {
        showToast("Flashcard incorporado com sucesso!", "success");
        setIsFlashcardFormOpen(false);
        // Add to state temporarily as we construct live mockup flow
        setFlashcards(prev => {
          const idx = prev.findIndex(x => x.id === data.flashcard?.id);
          if (idx >= 0) {
            const up = [...prev];
            up[idx] = data.flashcard;
            return up;
          }
          return [...prev, data.flashcard];
        });
      } else {
        showToast("Falha ao salvar flashcard", "error");
      }
    } catch (e) {
      showToast("Erro do servidor", "error");
    }
  };

  // EXAMS CRUD
  const handleCreateOrUpdateExam = async () => {
    if (!selectedModule) return;
    try {
      const payload = {
        id: activeExam?.id || undefined,
        moduleId: selectedModule.id,
        title: activeExam?.title || `Exame Final do Grau ${selectedModule.order}`,
        description: activeExam?.description || `Consolidação integral do cinturão com foco em termos táticos e audição do Grau ${selectedModule.order}.`,
        passingScore: activeExam?.passingScore || 70,
        isPublished: activeExam?.isPublished !== undefined ? activeExam?.isPublished : true
      };

      const res = await authFetch('/api/admin/course-exams/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast("Configurações do Exame gravadas!", "success");
        fetchExams();
      } else {
        showToast("Erro ao gravar exame", "error");
      }
    } catch (e) {
      showToast("Erro de conexão", "error");
    }
  };

  // EXAM QUESTIONS CRUD
  const handleOpenExamQuestionCreate = () => {
    if (!activeExam) return;
    setEditingExamQuestion({
      examId: activeExam.id || '',
      question: 'Qual a postura esperada para repelir um ataque tipo "sweep"?',
      optionA: 'Lowering center of gravity and stabilizing base',
      optionB: 'Giving up posture immediately',
      optionC: 'Closing the guard tightly to freeze',
      optionD: 'Unlocking arms and yelling',
      correctAnswer: 'A',
      explanation: 'Para deter o raspador, base firme e gravidade rebaixada são cruciais.',
      order: (activeExam.questions?.length || 0) + 1
    });
    setIsExamQuestionFormOpen(true);
  };

  const handleEditExamQuestion = (q: ExamQuestion) => {
    setEditingExamQuestion(q);
    setIsExamQuestionFormOpen(true);
  };

  const handleSaveExamQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExamQuestion || !activeExam) return;
    try {
      // Inject correct exam ID if missing
      const toSend = {
        ...editingExamQuestion,
        examId: activeExam.id
      };

      const res = await authFetch('/api/admin/course-exams/save-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSend)
      });
      const data = await res.json();
      if (data.success) {
        showToast("Pergunta do Exame gravada com sucesso!", "success");
        setIsExamQuestionFormOpen(false);
        fetchExams();
      } else {
        showToast(data.error || "Erro de gravação", "error");
      }
    } catch (err) {
      showToast("Network Error", "error");
    }
  };

  return (
    <div className="space-y-6" id="course-modules-cms-container">
      {/* HEADER CONTROLS AND TITLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 px-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[9px] font-bold rounded-lg uppercase tracking-wider">CMS Curriculum</span>
            <span className="text-slate-500 text-xs font-mono">• Ativo</span>
          </div>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Módulos do Curso CMS</span>
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-sans">
            Gerencie módulos progressivos de graus do Jiu-Jitsu, com aulas, audios podcasts, apostila memorizável, perguntas de quizzes e os exames de certificação.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModuleCreate}
          className="flex items-center gap-1.5 p-2.5 px-4 bg-indigo-600 hover:bg-indigo-550 cursor-pointer active:scale-95 text-white text-xs font-mono font-bold rounded-xl shadow-lg shadow-indigo-500/10 transition-all select-none"
          id="btn-create-mod-top"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Módulo</span>
        </button>
      </div>

      {/* THREE PANELS LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: MODULES TIMELINE LISTING PANEL (5 columns) */}
        <div className="xl:col-span-4 bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4" id="cms-modules-master-panel">
          <div className="flex justify-between items-center text-xs font-mono font-semibold pb-1 border-b border-slate-800">
            <span className="text-slate-400">GRAUS INTEGRADORES ({modules.length})</span>
            <button 
              type="button" 
              onClick={fetchModules} 
              className="p-1 text-slate-550 hover:text-white transition-colors cursor-pointer"
              title="Recarregar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center space-y-3" id="loading-modules-spinner">
              <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-[11px] text-slate-500 font-mono">Listando graus do banco de dados...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="bg-slate-950/20 p-8 rounded-2xl text-center border border-dashed border-slate-850">
              <span className="block text-xl mb-2">🥋</span>
              <p className="text-[11px] font-bold text-slate-400">Nenhum módulo inicializado.</p>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">Clique no botão superior para cadastrar o primeiro grau prático.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto scrollbar-thin pr-1">
              {modules.map((mod) => {
                const isSelected = selectedModule?.id === mod.id;

                return (
                  <div
                    key={mod.id}
                    id={`cms-mod-card-${mod.id}`}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-950/20 border-indigo-500 shadow-md shadow-indigo-500/5'
                        : 'bg-slate-950/30 border-slate-850 hover:border-slate-700'
                    }`}
                    onClick={() => handleSelectModule(mod)}
                  >
                    <div className="flex gap-3 items-start justify-between">
                      <div className="flex gap-2.5 items-start">
                        {/* Compact belt design cover */}
                        <div className="w-12 h-12 rounded-xl bg-slate-950 overflow-hidden relative shrink-0 border border-slate-800/80">
                          <img 
                            src={mod.thumbnail || "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=500&auto=format&fit=crop&q=80"}
                            alt={mod.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                          <span className="absolute bottom-1 right-1 text-[8.5px] font-mono leading-none bg-slate-900 border border-slate-800 text-indigo-400 p-0.5 rounded font-black">
                            #{mod.order}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display font-black text-xs text-white uppercase tracking-tight line-clamp-1">{mod.title}</h3>
                            {!mod.isPublished && (
                              <EyeOff className="w-3 h-3 text-amber-500 shrink-0" title="Privado / Rascunho" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight line-clamp-1 font-sans">{mod.description}</p>
                          <div className="flex gap-2 text-[9px] font-mono text-slate-500">
                            <span>🎓 {mod.lessonsCount || 40} aulas</span>
                            <span>⏱️ {mod.estimatedHours}h</span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 mt-0.5 transition-transform ${isSelected ? 'translate-x-1 text-indigo-400' : ''}`} />
                    </div>

                    {/* Stats Mini Banner */}
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-850/60 flex justify-between gap-2 items-center text-[9px] font-mono select-none">
                      <div className="flex items-center gap-1 text-slate-400">
                        <TrendingUp className="w-3 h-3 text-indigo-400" />
                        <span>Alunos: <strong className="text-white">{mod.totalStudents || 0}</strong></span>
                      </div>
                      <div className="text-right flex gap-2">
                        <span>Aprovados: <strong className="text-emerald-400">{mod.passesCount || 0}</strong></span>
                        <span>Pass-Rate: <strong className="text-indigo-400">{mod.passRatio !== undefined ? mod.passRatio : 100}%</strong></span>
                      </div>
                    </div>

                    {/* Quick Config Row Buttons */}
                    <div className="flex gap-2.5 justify-end pt-1 border-t border-slate-850/50" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenModuleEdit(mod)}
                        className="p-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-205 text-[10px] font-mono font-bold cursor-pointer transition-colors flex items-center gap-1"
                        title="Modificar Dados Módulo"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-1.5 px-2 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/20 text-[10px] font-mono cursor-pointer transition-colors flex items-center gap-1"
                        title="Inativar Módulo"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Arquivar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: MODULE ACTIVE DETAILED WORKSPACE (8 columns) */}
        <div className="xl:col-span-8 space-y-6 flex flex-col justify-start" id="cms-module-drilldown-workspace">
          
          {!selectedModule ? (
            <div className="bg-slate-900/40 p-16 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 min-h-[450px]">
              <span className="text-5xl block animate-bounce">⚡</span>
              <div className="space-y-1">
                <h2 className="font-display font-black text-sm text-slate-205 uppercase">Painel de Estudo Direcionado</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
                  Selecione qualquer Grau na linha de tempo à esquerda para acessar as aulas integradas, podcast áudio, apostila complementar, questionários de vocabulário e exames teóricos.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* CURRENT SELECT MODULE RECAP BAR */}
              <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-3 items-center">
                  <div className="p-2 px-3.5 bg-indigo-505/10 rounded-xl border border-indigo-500/25 font-mono text-xs text-indigo-400 font-extrabold select-none">
                    Módulo {selectedModule.order}
                  </div>
                  <div>
                    <h2 className="font-display font-black text-sm text-white uppercase leading-none">{selectedModule.title}</h2>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Concebido em {selectedModule.estimatedHours}h • Nota mín. aprovação: {selectedModule.passingScore}%</p>
                  </div>
                </div>

                {/* Tab Controllers Switcher inside Workspace */}
                <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850 shrink-0 select-none">
                  <button
                    type="button"
                    onClick={() => setActiveDetailTab('lessons')}
                    className={`p-2 px-3.5 rounded-lg text-[10.5px] font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1.5 ${
                      activeDetailTab === 'lessons'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Cronograma de Aulas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDetailTab('exam')}
                    className={`p-2 px-3.5 rounded-lg text-[10.5px] font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1.5 ${
                      activeDetailTab === 'exam'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Prova Final do Grau</span>
                  </button>
                </div>
              </div>

              {/* DETAIL CONTENT PANEL SWITCH */}

              {/* PANEL STATE A: LESSON SYLLABUS LISTING */}
              {activeDetailTab === 'lessons' && (
                <div className="space-y-4 animate-fadeIn" id="syllabus-lessons-container">
                  
                  {/* Title banner */}
                  <div className="flex justify-between items-center p-3 px-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Aulas Ativas ({lessons.length})</span>
                    <button
                      type="button"
                      onClick={handleOpenLessonCreate}
                      className="p-1 px-3 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-700/30 font-mono font-bold text-[10px] uppercase text-indigo-300 rounded-lg cursor-pointer flex items-center gap-1 hover:text-white transition-all active:scale-95 select-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Aula</span>
                    </button>
                  </div>

                  {lessonsLoading ? (
                    <div className="p-20 text-center space-y-3" id="lessons-loader-spinner">
                      <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-[11px] text-slate-500 font-mono">Consultando cronograma curricular...</p>
                    </div>
                  ) : lessons.length === 0 ? (
                    <div className="bg-slate-900/10 p-12 text-center rounded-2xl border border-slate-850 space-y-2">
                      <p className="text-xs font-bold text-slate-400">Nenhuma aula cadastrada neste Grau.</p>
                      <p className="text-[10px] text-slate-500 font-sans">Adicione sequencialmente a grade prática esportiva agora para que os atletas possam treinar.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      
                      {lessons.map((les, idx) => {
                        const isLesSelected = selectedLesson?.id === les.id;

                        return (
                          <div 
                            key={les.id}
                            id={`cms-lesson-row-${les.id}`}
                            className={`p-4 rounded-2xl border transition-all ${
                              isLesSelected 
                                ? 'bg-slate-900 border-indigo-500/60 shadow shadow-indigo-500/5' 
                                : 'bg-slate-950/20 border-slate-850 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex gap-3 items-center">
                                {/* Order count */}
                                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center font-mono text-xs font-bold text-slate-450 select-none">
                                  {les.order}
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="font-display font-semibold text-xs uppercase text-white tracking-tight leading-none">{les.title}</h4>
                                    {!les.isPublished && (
                                      <span className="p-0.5 px-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-mono rounded">RASCUNHO</span>
                                    )}
                                  </div>
                                  <p className="text-[9.5px] text-slate-500 leading-none">{les.duration} • Recompense: {les.xpReward} XP • Recurso: {les.videoType}</p>
                                </div>
                              </div>

                              {/* Action Row */}
                              <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedLesson(les);
                                    setActiveLessonSubTab('content');
                                    fetchLessonSubs(les.id);
                                  }}
                                  className={`p-1.5 px-3 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all ${
                                    isLesSelected 
                                      ? 'bg-indigo-600 text-white shadow shadow-indigo-650/15' 
                                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                                  }`}
                                >
                                  <span>{isLesSelected ? "Feijar Expansão" : "Gerenciar Quizzes & Cards"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenLessonEdit(les)}
                                  className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-205 rounded-lg cursor-pointer transition-colors"
                                  title="Editar Aula"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(les.id)}
                                  className="p-1.5 bg-rose-955/20 hover:bg-rose-900/30 border border-rose-900/20 text-rose-400 rounded-lg cursor-pointer transition-colors"
                                  title="Desativar Aula"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* LESSON EXPANDED SUB DATA PANEL: QUIZ, CARDS, TEXTS */}
                            {isLesSelected && (
                              <div className="mt-4 pt-4 border-t border-slate-800/80 animate-fadeIn space-y-4" id="expanded-lesson-workspace">
                                
                                {/* Inner Sub navigation tabs */}
                                <div className="flex overflow-x-auto gap-1 bg-slate-950 p-1 rounded-xl border border-slate-900 max-w-sm select-none">
                                  <button
                                    type="button"
                                    onClick={() => setActiveLessonSubTab('content')}
                                    className={`flex-1 p-1.5 text-center rounded-lg text-[9px] font-mono font-bold uppercase cursor-pointer ${
                                      activeLessonSubTab === 'content' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-500 hover:text-slate-205'
                                    }`}
                                  >
                                    Material de Apoio
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setActiveLessonSubTab('quiz')}
                                    className={`flex-1 p-1.5 text-center rounded-lg text-[9px] font-mono font-bold uppercase cursor-pointer ${
                                      activeLessonSubTab === 'quiz' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-500 hover:text-slate-205'
                                    }`}
                                  >
                                    Quizzes ({quizzes.length})
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setActiveLessonSubTab('flashcard')}
                                    className={`flex-1 p-1.5 text-center rounded-lg text-[9px] font-mono font-bold uppercase cursor-pointer ${
                                      activeLessonSubTab === 'flashcard' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-500 hover:text-slate-205'
                                    }`}
                                  >
                                    Flashcards ({flashcards.length})
                                  </button>
                                </div>

                                {/* INNER SWITCH DETAIL CONTENT */}
                                
                                {/* SUB SECTION A: TEXT, AUDIO & VIDEO PARAM SUMMARY */}
                                {activeLessonSubTab === 'content' && (
                                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 space-y-3 font-sans" id="expanded-lesson-materials">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <span className="text-[9px] font-mono text-slate-500">Mídia e Vídeo Embed:</span>
                                        <div className="p-2 border border-slate-900 bg-slate-950 text-[10px] break-all text-slate-400 font-mono rounded">
                                          {les.videoSource || "Sem link anexado"}
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="text-[9px] font-mono text-slate-500">Áudio Podcast Anexo:</span>
                                        <div className="p-2 border border-slate-900 bg-slate-950 text-[10px] break-all text-slate-400 font-mono rounded">
                                          {les.audioSource || "Sem podcast configurado"}
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-mono text-slate-500">Descrição Longa / Apostila Markdown:</span>
                                      <p className="text-[10px] text-slate-400 mt-1 pl-2 border-l border-indigo-500/30 line-clamp-3 select-all">
                                        {les.lessonContent || "Não cadastrada."}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* SUB SECTION B: QUIZZES SUB-SECTION FORM */}
                                {activeLessonSubTab === 'quiz' && (
                                  <div className="space-y-3 animate-fadeIn" id="expanded-lesson-quizzes">
                                    <div className="flex justify-between items-center text-[10px] font-mono pb-2 border-b border-indigo-900/10">
                                      <span className="text-slate-400">QUESTÕES DIDÁTICAS DE VOCABULÁRIO DESTA AULA</span>
                                      <button
                                        type="button"
                                        onClick={handleOpenQuizCreate}
                                        className="p-1 px-2.5 bg-indigo-500/15 text-indigo-300 font-mono text-[8.5px] rounded border border-indigo-500/20 uppercase font-black hover:text-white transition-all cursor-pointer"
                                      >
                                        + Inserir Questão
                                      </button>
                                    </div>

                                    {quizzesLoading ? (
                                      <div className="text-center p-6 text-[10px] text-slate-500 font-mono">Listando questões...</div>
                                    ) : quizzes.length === 0 ? (
                                      <div className="p-6 text-center border border-slate-900 bg-slate-950/20 rounded-xl space-y-1">
                                        <p className="text-[10.5px] font-bold text-slate-400">Nenhum Quiz registrado.</p>
                                        <p className="text-[9.5px] text-slate-500">Utilize a inserção para adicionar perguntas de múltipla escolha.</p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {quizzes.map((quiz, qIdx) => (
                                          <div 
                                            key={quiz.id || qIdx} 
                                            className="p-3 rounded-xl bg-slate-950/60 border border-slate-900/80 flex flex-col sm:flex-row justify-between gap-3 items-start"
                                          >
                                            <div className="space-y-2">
                                              <span className="p-0.5 px-1 bg-slate-900 border border-slate-800 rounded font-mono text-[8px] font-bold text-slate-400">PERGUNTA {qIdx + 1}</span>
                                              <h5 className="text-[11.5px] text-white font-semibold">{quiz.question}</h5>
                                              
                                              {/* Options overview grid */}
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-w-xl">
                                                {['A', 'B', 'C', 'D'].map((opt) => {
                                                  const isCorrect = quiz.correctAnswer === opt;
                                                  const text = quiz[`option${opt}` as keyof QuizQuestion];
                                                  return (
                                                    <div 
                                                      key={opt}
                                                      className={`p-1 px-2 text-[10px] rounded font-sans border ${
                                                        isCorrect 
                                                          ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400' 
                                                          : 'bg-slate-955/20 border-slate-900 text-slate-450'
                                                      }`}
                                                    >
                                                      <strong className="font-mono text-[9.5px] mr-1">{opt}:</strong> {String(text)}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                              {quiz.explanation && (
                                                <p className="text-[9.5px] text-slate-500 border-l border-slate-800/80 pl-2 font-sans italic pt-1 text-slate-205 select-text">Dica: {quiz.explanation}</p>
                                              )}
                                            </div>

                                            <button
                                              type="button"
                                              onClick={() => handleEditQuiz(quiz)}
                                              className="p-1 px-2.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-205 font-mono text-[9px] font-bold cursor-pointer hover:text-white shrink-0"
                                            >
                                              Alterar
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* SUB SECTION C: FLASHCARDS SUB-SECTION FORM */}
                                {activeLessonSubTab === 'flashcard' && (
                                  <div className="space-y-3 animate-fadeIn" id="expanded-lesson-flashcards">
                                    <div className="flex justify-between items-center text-[10px] font-mono pb-2 border-b border-indigo-900/10">
                                      <span className="text-slate-400">MOCKUP CARDS DE MEMORIZAÇÃO DE PRONÚNCIA</span>
                                      <button
                                        type="button"
                                        onClick={handleOpenFlashcardCreate}
                                        className="p-1 px-2.5 bg-indigo-505/15 text-indigo-300 font-mono text-[8.5px] rounded border border-indigo-500/20 uppercase font-black hover:text-white transition-all cursor-pointer"
                                      >
                                        + Inserir Flashcard
                                      </button>
                                    </div>

                                    {flashcardsLoading ? (
                                      <div className="text-center p-6 text-[10px] text-slate-500 font-mono">Listando flashcards...</div>
                                    ) : flashcards.length === 0 ? (
                                      <div className="p-6 text-center border border-slate-900 bg-slate-950/20 rounded-xl space-y-1">
                                        <p className="text-[10.5px] font-bold text-slate-400">Sem Flashcards adicionados.</p>
                                        <p className="text-[9.5px] text-slate-500">Adicione memorizadores táticos para a aula corrente.</p>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {flashcards.map((fc, fIdx) => (
                                          <div 
                                            key={fc.id || fIdx} 
                                            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 flex justify-between gap-3 items-center"
                                          >
                                            <div className="space-y-1">
                                              <span className="text-[8.5px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Cartão {fIdx + 1}</span>
                                              <p className="text-[11px] text-slate-450 font-sans leading-tight"><span className="text-white font-bold block mb-0.5">Frente:</span> {fc.frontText}</p>
                                              <p className="text-[11px] text-slate-450 font-sans leading-tight"><span className="text-white font-bold block mt-1.5 mb-0.5">Verso:</span> {fc.backText}</p>
                                            </div>

                                            <button
                                              type="button"
                                              onClick={() => handleEditFlashcard(fc)}
                                              className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-205 font-mono cursor-pointer hover:bg-slate-850 hover:text-white shrink-0"
                                            >
                                              Alterar
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* PANEL STATE B: EXAM SETTINGS */}
              {activeDetailTab === 'exam' && (
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-6" id="exam-config-container">
                  
                  {/* Exam master metadata edit sheet */}
                  <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-850 space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono font-bold uppercase text-slate-400 border-b border-slate-850 pb-2">
                      <span>Configurações Gerais da Prova de Grau</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-indigo-900/30 text-indigo-300 rounded border border-indigo-900/20 uppercase font-extrabold select-none">CERTIFICATE DISPATCH</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="exam-fld-title">Título Oficiante</label>
                        <input 
                          type="text" 
                          id="exam-fld-title"
                          value={activeExam?.title || `Exame de Conclusão de Módulo`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setActiveExam(prev => prev ? { ...prev, title: val } : { moduleId: selectedModule.id, title: val, description: '', passingScore: 70, isPublished: true });
                          }}
                          className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="exam-fld-passing-score">Score Mín. Aprovação (%)</label>
                        <input 
                          type="number" 
                          id="exam-fld-passing-score"
                          value={activeExam?.passingScore || 70}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setActiveExam(prev => prev ? { ...prev, passingScore: val } : { moduleId: selectedModule.id, title: '', description: '', passingScore: val, isPublished: true });
                          }}
                          className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                          min="50"
                          max="100"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="exam-fld-desc">Termos de Avaliação Didática / Textos longos</label>
                        <textarea 
                          id="exam-fld-desc"
                          rows={2}
                          value={activeExam?.description || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setActiveExam(prev => prev ? { ...prev, description: val } : { moduleId: selectedModule.id, title: '', description: val, passingScore: 70, isPublished: true });
                          }}
                          className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500 focus:outline-none"
                          placeholder="Requisitos de aptidão, penalidades por falha ou bloqueios."
                        />
                      </div>

                    </div>

                    <div className="flex justify-between items-center pt-2 select-none">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="exam-published-check"
                          className="accent-indigo-500 rounded cursor-pointer" 
                          checked={activeExam?.isPublished !== false}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setActiveExam(prev => prev ? { ...prev, isPublished: val } : { moduleId: selectedModule.id, title: '', description: '', passingScore: 70, isPublished: val });
                          }}
                        />
                        <label htmlFor="exam-published-check" className="text-[10.5px] text-slate-405 font-mono cursor-pointer font-bold">Publicar Prova Final no Aluno</label>
                      </div>

                      <button
                        type="button"
                        onClick={handleCreateOrUpdateExam}
                        className="p-2 px-5 bg-indigo-600 hover:bg-indigo-550 text-white font-mono text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-md flex items-center gap-1"
                        id="btn-save-exam-top"
                      >
                        <Save className="w-4 h-4" />
                        <span>Salvar Parâmetros Prova</span>
                      </button>
                    </div>
                  </div>

                  {/* Exam Questions Management Master Detail Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono font-bold pb-2 border-b border-slate-855 select-none">
                      <span className="text-slate-400">QUESTÕES MÚLTIPLA ESCOLA CERTIFICADORAS ({activeExam?.questions?.length || 0})</span>
                      {activeExam && (
                        <button
                          type="button"
                          onClick={handleOpenExamQuestionCreate}
                          className="p-1 px-3 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-800/30 text-violet-300 uppercase rounded text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1 active:scale-95 text-white"
                        >
                          + Inserir Questão
                        </button>
                      )}
                    </div>

                    {!activeExam ? (
                      <div className="p-8 text-center bg-slate-950/25 border border-slate-850/60 rounded-2xl">
                        <p className="text-[10.5px] text-slate-500 font-mono">Por favor salve os parâmetros da Prova Final primeiro para que as questões de avaliação possam ser integradas.</p>
                      </div>
                    ) : !activeExam.questions || activeExam.questions.length === 0 ? (
                      <div className="p-12 text-center bg-slate-950/20 border border-slate-850/60 rounded-2xl space-y-1">
                        <p className="text-[11.5px] font-bold text-slate-400">Provas sem questões.</p>
                        <p className="text-[10px] text-slate-505">Certificações requerem no mínimo 5 questões complexas. Clique no botão de inserção acima!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeExam.questions.map((eq, eqIdx) => (
                          <div 
                            key={eq.id || eqIdx} 
                            className="p-4 rounded-2xl bg-slate-950/50 border border-slate-850/80 flex flex-col md:flex-row justify-between gap-4 items-start"
                          >
                            <div className="space-y-3 flex-1 select-text">
                              <span className="p-0.5 px-1.5 bg-slate-900 border border-slate-800 font-mono text-[8.5px] font-bold text-indigo-400 rounded">QUESTÃO #{eq.order}</span>
                              <h4 className="text-xs text-white font-black leading-tight">{eq.question}</h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl select-text">
                                {['A', 'B', 'C', 'D'].map((opt) => {
                                  const isCorrect = eq.correctAnswer === opt;
                                  const text = eq[`option${opt}` as keyof ExamQuestion];
                                  return (
                                    <div 
                                      key={opt}
                                      className={`p-2 rounded-xl text-[10.5px] border ${
                                        isCorrect 
                                          ? 'bg-emerald-950/30 border-emerald-900/35 text-emerald-400 font-semibold' 
                                          : 'bg-slate-900/60 border-slate-900 text-slate-400'
                                      }`}
                                    >
                                      <strong>{opt}:</strong> {String(text)}
                                    </div>
                                  );
                                })}
                              </div>

                              {eq.explanation && (
                                <p className="text-[10px] text-slate-500 italic border-l border-slate-810 pl-2">Feedback formativo: {eq.explanation}</p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleEditExamQuestion(eq)}
                              className="p-1 px-3 bg-slate-900 rounded-lg border border-slate-800 text-[9.5px] font-mono text-slate-300 hover:bg-slate-850 cursor-pointer text-white"
                            >
                              Modificar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* OVERLAY MODAL FORM A: COURSE MODULE SAVE */}
      {isModuleFormOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 select-text overflow-y-auto" onClick={() => setIsModuleFormOpen(false)}>
          <div 
            className="bg-slate-900 border border-slate-800 max-w-xl w-full p-6 h-auto max-h-[90vh] overflow-y-auto rounded-3xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-display font-black uppercase text-white tracking-tight">
                {editingModuleId ? "Editar Módulo do Curso" : "Criar Novo Módulo Teórico-Prático"}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModuleFormOpen(false)} 
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4 select-text">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="mod-title">Título do Módulo</label>
                  <input
                    type="text"
                    id="mod-title"
                    required
                    value={moduleFormData.title}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. Faixa Branca Sec. I: Tração Básica"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="mod-slug">Slug Link amigável</label>
                  <input
                    type="text"
                    id="mod-slug"
                    required
                    value={moduleFormData.slug}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, slug: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="submissoes-basicas"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="mod-order">Sequência de Ordem (Nível)</label>
                  <input
                    type="number"
                    id="mod-order"
                    required
                    value={moduleFormData.order}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, order: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                    min="1"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="mod-desc">Descrição Didática</label>
                  <textarea
                    id="mod-desc"
                    required
                    rows={2}
                    value={moduleFormData.description}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Descrição para orientar a jornada do estudante atleta..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="mod-hours">Estimação de Horas (Estudo)</label>
                  <input
                    type="number"
                    id="mod-hours"
                    required
                    value={moduleFormData.estimatedHours}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="mod-score">Nota Passing (%) Prova</label>
                  <input
                    type="number"
                    id="mod-score"
                    required
                    value={moduleFormData.passingScore}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, passingScore: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                    min="50"
                    max="100"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="mod-thumbnail">URL Imagem Capa Módulo</label>
                  <input
                    type="text"
                    id="mod-thumbnail"
                    value={moduleFormData.thumbnail}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, thumbnail: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="mod-cover">URL Imagem Banner Fundo</label>
                  <input
                    type="text"
                    id="mod-cover"
                    value={moduleFormData.coverImage}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, coverImage: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2 select-none pt-2">
                  <input 
                    type="checkbox" 
                    id="mod-ispublished"
                    className="accent-indigo-500 rounded cursor-pointer"
                    checked={moduleFormData.isPublished}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, isPublished: e.target.checked })}
                  />
                  <label htmlFor="mod-ispublished" className="text-xs text-slate-400 cursor-pointer font-bold">Tornar módulo visível aos alunos</label>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModuleFormOpen(false)}
                  className="p-2.5 px-4 rounded-xl bg-slate-950 text-slate-400 hover:text-white font-mono text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="p-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Gravar Módulo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL FORM B: COURSE LESSON SAVE */}
      {isLessonFormOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto select-text" onClick={() => setIsLessonFormOpen(false)}>
          <div 
            className="bg-slate-900 border border-slate-800 max-w-2xl w-full p-6 h-auto max-h-[90vh] overflow-y-auto rounded-3xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-display font-black uppercase text-white tracking-tight">
                {editingLessonId ? "Editar Aula Curricular" : "Criar Nova Aula do Módulo"}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsLessonFormOpen(false)} 
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 select-text">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="les-title">Título da Aula</label>
                  <input
                    type="text"
                    id="les-title"
                    required
                    value={lessonFormData.title}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500"
                    placeholder="e.g. Subissão: Arm-Lock Clássico"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="les-desc">Breve descrição didática</label>
                  <input
                    type="text"
                    id="les-desc"
                    required
                    value={lessonFormData.description}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500"
                    placeholder="Nesta aula os alunos dominarão as alavancas do cotovelo..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="les-duration">Duração Formatada</label>
                  <input
                    type="text"
                    id="les-duration"
                    required
                    value={lessonFormData.duration}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white focus:border-indigo-500"
                    placeholder="12:30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="les-xp">Recompensa de Treino (XP)</label>
                  <input
                    type="number"
                    id="les-xp"
                    required
                    value={lessonFormData.xpReward}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, xpReward: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="les-order">Ordem Sequencial</label>
                  <input
                    type="number"
                    id="les-order"
                    required
                    value={lessonFormData.order}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, order: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="les-vidtype">Tipo de reprodutor de Vídeo</label>
                  <select
                    id="les-vidtype"
                    value={lessonFormData.videoType}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, videoType: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="youtube">YouTube Embed Link</option>
                    <option value="vimeo">Vimeo Embed</option>
                    <option value="upload">Direto MP4 / Vídeo CDN URL</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="les-vidsrc">Link / URL do Recurso de Vídeo</label>
                  <input
                    type="text"
                    id="les-vidsrc"
                    value={lessonFormData.videoSource}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, videoSource: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="les-aud">Link / URL do Podcast Áudio (MP3)</label>
                  <input
                    type="text"
                    id="les-aud"
                    value={lessonFormData.audioSource}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, audioSource: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white"
                    placeholder="https://scans-bucket.online/audio.mp3"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="les-content">Apostila em Markdown / Texto longo</label>
                  <textarea
                    id="les-content"
                    rows={4}
                    value={lessonFormData.lessonContent}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, lessonContent: e.target.value })}
                    className="w-full bg-slate-955 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:outline-none"
                    placeholder="Markdown completo contendo diagramas, comandos do glossário etc..."
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="les-transcript">Transcrição do Podcast de Pronúncia</label>
                  <textarea
                    id="les-transcript"
                    rows={2}
                    value={lessonFormData.transcript}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, transcript: e.target.value })}
                    className="w-full bg-slate-955 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:outline-none"
                    placeholder="O que está sendo narrado para auxiliar o estudante atleta..."
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2 select-none pt-2">
                  <input 
                    type="checkbox" 
                    id="les-ispublished"
                    className="accent-indigo-500 rounded cursor-pointer"
                    checked={lessonFormData.isPublished}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, isPublished: e.target.checked })}
                  />
                  <label htmlFor="les-ispublished" className="text-xs text-slate-400 cursor-pointer font-bold">Publicar aula imediatamente</label>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLessonFormOpen(false)}
                  className="p-2.5 px-4 rounded-xl bg-slate-950 text-slate-400 hover:text-white font-mono text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="p-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Gravar Aula</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL FORM C: QUIZ QUESTION INDIVIDUAL EDIT */}
      {isQuizFormOpen && editingQuiz && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto select-text" onClick={() => setIsQuizFormOpen(false)}>
          <div 
            className="bg-slate-900 border border-slate-800 max-w-xl w-full p-6 h-auto max-h-[90vh] overflow-y-auto rounded-3xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-display font-black uppercase text-white">Configurar Pergunta de Vocabulário (Quiz)</h3>
              <button type="button" onClick={() => setIsQuizFormOpen(false)} className="text-slate-505 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-4 select-text">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="qz-question">Enunciado da Pergunta</label>
                <textarea
                  id="qz-question"
                  required
                  rows={2}
                  value={editingQuiz.question}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, question: e.target.value })}
                  className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-text">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt} className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor={`qz-opt-${opt}`}>Opção {opt}</label>
                    <input
                      type="text"
                      id={`qz-opt-${opt}`}
                      required
                      value={editingQuiz[`option${opt}` as keyof QuizQuestion] || ''}
                      onChange={(e) => setEditingQuiz({ ...editingQuiz, [`option${opt}`]: e.target.value })}
                      className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="qz-answer">Alternativa Correta</label>
                  <select
                    id="qz-answer"
                    value={editingQuiz.correctAnswer}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, correctAnswer: e.target.value as any })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="A">Alternativa A</option>
                    <option value="B">Alternativa B</option>
                    <option value="C">Alternativa C</option>
                    <option value="D">Alternativa D</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="qz-points">Pontuação / Recompensas</label>
                  <input
                    type="number"
                    id="qz-points"
                    required
                    value={editingQuiz.points}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, points: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="qz-expl">Justificativa / Comentário Formativo</label>
                <textarea
                  id="qz-expl"
                  rows={2}
                  value={editingQuiz.explanation}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, explanation: e.target.value })}
                  className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white"
                  placeholder="Por que essa opção é a correta? Ajude no aprendizado focado d0s atletas."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuizFormOpen(false)}
                  className="p-2.5 px-4 rounded-xl bg-slate-950 text-slate-400 hover:text-white font-mono text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="p-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono text-xs font-bold cursor-pointer"
                >
                  Gravar Questão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL FORM D: FLASHCARDS SAVE */}
      {isFlashcardFormOpen && editingFlashcard && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto select-text" onClick={() => setIsFlashcardFormOpen(false)}>
          <div 
            className="bg-slate-900 border border-slate-800 max-w-xl w-full p-6 h-auto rounded-3xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-display font-black uppercase text-white">Anexar Cartão Memorizador (Flashcard)</h3>
              <button type="button" onClick={() => setIsFlashcardFormOpen(false)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFlashcard} className="space-y-4 select-text">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="fc-front">Frente (Texto Português ou Conceito)</label>
                <input
                  type="text"
                  id="fc-front"
                  required
                  value={editingFlashcard.frontText}
                  onChange={(e) => setEditingFlashcard({ ...editingFlashcard, frontText: e.target.value })}
                  className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500"
                  placeholder="e.g. Forçar a passagem de guarda"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="fc-back">Verso (Termo Traduzido em Inglês)</label>
                <input
                  type="text"
                  id="fc-back"
                  required
                  value={editingFlashcard.backText}
                  onChange={(e) => setEditingFlashcard({ ...editingFlashcard, backText: e.target.value })}
                  className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500"
                  placeholder="e.g. Pass the guard"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-text">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="fc-order">Ordem da Pilha</label>
                  <input
                    type="number"
                    id="fc-order"
                    required
                    value={editingFlashcard.order}
                    onChange={(e) => setEditingFlashcard({ ...editingFlashcard, order: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFlashcardFormOpen(false)}
                  className="p-2.5 px-4 rounded-xl bg-slate-950 text-slate-400 hover:text-white font-mono text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="p-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono text-xs font-bold cursor-pointer"
                >
                  Anexar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL FORM E: EXAM QUESTION INDIVIDUAL ACTION */}
      {isExamQuestionFormOpen && editingExamQuestion && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto select-text" onClick={() => setIsExamQuestionFormOpen(false)}>
          <div 
            className="bg-slate-900 border border-slate-800 max-w-xl w-full p-6 h-auto max-h-[90vh] overflow-y-auto rounded-3xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-display font-black uppercase text-white">Configurar Pergunta Certificadora (Prova Final)</h3>
              <button type="button" onClick={() => setIsExamQuestionFormOpen(false)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExamQuestion} className="space-y-4 select-text">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="eq-question">Pergunta de Avaliação Física-Motor/Tática</label>
                <textarea
                  id="eq-question"
                  required
                  rows={2}
                  value={editingExamQuestion.question}
                  onChange={(e) => setEditingExamQuestion({ ...editingExamQuestion, question: e.target.value })}
                  className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-text">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt} className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor={`eq-opt-${opt}`}>Opção {opt}</label>
                    <input
                      type="text"
                      id={`eq-opt-${opt}`}
                      required
                      value={editingExamQuestion[`option${opt}` as keyof ExamQuestion] || ''}
                      onChange={(e) => setEditingExamQuestion({ ...editingExamQuestion, [`option${opt}`]: e.target.value })}
                      className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-sans text-white focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="eq-correct">Alternativa Gabarito</label>
                  <select
                    id="eq-correct"
                    value={editingExamQuestion.correctAnswer}
                    onChange={(e) => setEditingExamQuestion({ ...editingExamQuestion, correctAnswer: e.target.value as any })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="A">Opção A</option>
                    <option value="B">Opção B</option>
                    <option value="C">Opção C</option>
                    <option value="D">Opção D</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="eq-order">Ordem Sequencial</label>
                  <input
                    type="number"
                    id="eq-order"
                    required
                    value={editingExamQuestion.order}
                    onChange={(e) => setEditingExamQuestion({ ...editingExamQuestion, order: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-850 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5 select-text">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-black" htmlFor="eq-expl">Feedback de Erro/Acerto formativo</label>
                <textarea
                  id="eq-expl"
                  rows={2}
                  value={editingExamQuestion.explanation || ''}
                  onChange={(e) => setEditingExamQuestion({ ...editingExamQuestion, explanation: e.target.value })}
                  className="w-full bg-slate-950 p-2.5 px-3 rounded-xl border border-slate-855 text-xs font-sans text-white"
                  placeholder="Forneça a explicação correta para educar os alunos no tatame."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExamQuestionFormOpen(false)}
                  className="p-2.5 px-4 rounded-xl bg-slate-950 text-slate-400 hover:text-white font-mono text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="p-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-mono text-xs font-bold cursor-pointer"
                >
                  Gravar Pergunta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
