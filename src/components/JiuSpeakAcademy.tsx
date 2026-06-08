/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Play, 
  ArrowLeft, 
  Award, 
  Trophy, 
  Lock, 
  BookOpen, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Clock, 
  Coins, 
  Flame,
  CheckCircle2,
  Users,
  Layers,
  Activity,
  User,
  ExternalLink,
  Shield,
  BookMarked,
  Trash2,
  Copy,
  Search,
  Filter,
  Volume2,
  ArrowUp,
  ArrowDown,
  Eye,
  FileText,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import * as lessonsData from '../data/lessonsData';

interface JiuSpeakAcademyProps {
  activeSubTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile;
  updateUser: (newData: Partial<UserProfile>) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeId: string | null;
  xpReward: number;
  orderIndex: number;
  completed: boolean;
  completedAt: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  beltLevel: 'WHITE' | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK';
  orderIndex: number;
  active: boolean;
  lessons: Lesson[];
}

interface YoutubeAutoPlayerProps {
  youtubeId: string;
  onStartInProgress: () => void;
  onVideoEnded: () => void;
  onPlayerRef: (player: any) => void;
}

const YoutubeAutoPlayer = ({ youtubeId, onStartInProgress, onVideoEnded, onPlayerRef }: YoutubeAutoPlayerProps) => {
  const containerId = `yt-player-${youtubeId}`;
  
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let ytPlayer: any = null;

    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      const el = document.getElementById(containerId);
      if (!el) {
        setTimeout(initPlayer, 100);
        return;
      }

      try {
        ytPlayer = new (window as any).YT.Player(containerId, {
          height: '100%',
          width: '100%',
          videoId: youtubeId,
          playerVars: {
            autoplay: 1,
            mute: 1, // Crucial default mute to comply with strict automatic play policies of modern browsers
            rel: 0,
            modestbranding: 1,
            controls: 1,
            playsinline: 1, // Crucial for automatic playing in iOS
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              if (!active) return;
              event.target.playVideo();
              onPlayerRef(event.target);
            },
            onStateChange: (event: any) => {
              if (!active) return;
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                onStartInProgress();
              }
              if (event.data === (window as any).YT.PlayerState.ENDED) {
                onVideoEnded();
              }
            }
          }
        });
      } catch (err) {
        console.error("Erro ao inicializar player do YouTube", err);
      }
    };

    const timer = setTimeout(() => {
      initPlayer();
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
      onPlayerRef(null);
      if (ytPlayer && typeof ytPlayer.destroy === 'function') {
        try {
          ytPlayer.destroy();
        } catch (e) {}
      }
    };
  }, [youtubeId]);

  return (
    <div className="w-full h-full relative">
      <div id={containerId} className="w-full h-full absolute inset-0 border-0 rounded-2xl" />
    </div>
  );
};

const FlashcardItem = ({ fc }: { fc: { term: string; phonetic: string; translation: string; bjjContext: string }; key?: any }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div 
      onClick={() => setFlipped(!flipped)}
      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none text-left min-h-[150px] flex flex-col justify-between h-full ${
        flipped 
          ? 'bg-violet-950/20 border-violet-500/30 ring-1 ring-violet-500/25 shadow-lg' 
          : 'bg-slate-950 border-slate-850 hover:border-slate-755 hover:bg-slate-900/40 shadow'
      }`}
    >
      {!flipped ? (
        <>
          <div className="flex justify-between items-start gap-2">
            <span className="font-mono text-sm font-bold text-violet-350">{fc.term}</span>
            <span className="font-mono text-[9.5px] text-slate-500 tracking-wider font-semibold">{fc.phonetic}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-450 font-sans">
            <span>Clique para revelar</span>
            <span className="text-violet-400 text-xs">➔</span>
          </div>
        </>
      ) : (
        <>
          <div>
            <span className="text-[10px] font-mono font-bold bg-violet-600/15 text-violet-300 px-1.5 py-0.5 rounded border border-violet-600/20">
              {fc.translation}
            </span>
            <p className="text-[11px] text-slate-300 mt-2.5 font-sans leading-relaxed">
              {fc.bjjContext}
            </p>
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-2 text-right block italic font-semibold">Girar de volta</span>
        </>
      )}
    </div>
  );
};

const FALLBACK_MODULES: Module[] = [
  {
    id: "mod_white",
    title: "White Belt Foundations",
    description: "Aprenda os fundamentos do Brazilian Jiu-Jitsu enquanto desenvolve seu inglês técnico.",
    beltLevel: "WHITE",
    orderIndex: 1,
    active: true,
    lessons: [
      { id: "less_white_1", moduleId: "mod_white", title: "Introdução ao BJJ", description: "BJJ Fundamentals for Beginners - Conceitos fundamentais de postura, base e alavancas.", youtubeUrl: "https://www.youtube.com/watch?v=Wt_RyWErotc", youtubeId: "Wt_RyWErotc", xpReward: 100, orderIndex: 1, completed: false, completedAt: null },
      { id: "less_white_2", moduleId: "mod_white", title: "Defesa Pessoal Básica", description: "Postura contra agressão, saídas de gravata e defesa de golpes no chão.", youtubeUrl: "https://www.youtube.com/watch?v=BWB1R3SdAyk", youtubeId: "BWB1R3SdAyk", xpReward: 100, orderIndex: 2, completed: false, completedAt: null },
      { id: "less_white_3", moduleId: "mod_white", title: "Guarda Fechada", description: "Closed Guard Basics - Como manter seu oponente sob controle de postura.", youtubeUrl: "https://www.youtube.com/watch?v=2U5fREK9W5I", youtubeId: "2U5fREK9W5I", xpReward: 100, orderIndex: 3, completed: false, completedAt: null },
      { id: "less_white_4", moduleId: "mod_white", title: "Armbar", description: "BJJ Armbar for Beginners - Alavanca clássica partindo do controle fechado.", youtubeUrl: "https://www.youtube.com/watch?v=9_jGszL3j9o", youtubeId: "9_jGszL3j9o", xpReward: 100, orderIndex: 4, completed: false, completedAt: null },
      { id: "less_white_5", moduleId: "mod_white", title: "Triangle Choke", description: "Triangle Choke Fundamentals - Estrangulamento clássico usando as pernas.", youtubeUrl: "https://www.youtube.com/watch?v=R9_mGka2yYg", youtubeId: "R9_mGka2yYg", xpReward: 100, orderIndex: 5, completed: false, completedAt: null },
      { id: "less_white_6", moduleId: "mod_white", title: "Kimura", description: "Kimura from Closed Guard - Chave de ombro clássica de controle e submissão.", youtubeUrl: "https://www.youtube.com/watch?v=yW6WvA0hG2s", youtubeId: "yW6WvA0hG2s", xpReward: 100, orderIndex: 6, completed: false, completedAt: null },
      { id: "less_white_7", moduleId: "mod_white", title: "Escape da Montada", description: "Mount Escape BJJ - Saídas de Upa e Cotovelo sob forte pressão do montador.", youtubeUrl: "https://www.youtube.com/watch?v=Xh0l07f607g", youtubeId: "Xh0l07f607g", xpReward: 100, orderIndex: 7, completed: false, completedAt: null },
      { id: "less_white_8", moduleId: "mod_white", title: "Side Control Escape", description: "Side Control Escape Basics - Criação de frames, pontes e reposição completa.", youtubeUrl: "https://www.youtube.com/watch?v=P_V6XNfHIs0", youtubeId: "P_V6XNfHIs0", xpReward: 100, orderIndex: 8, completed: false, completedAt: null },
      { id: "less_white_9", moduleId: "mod_white", title: "Guard Pass", description: "Guard Passing Fundamentals - Postura por cima e abertura de joelhos ativa.", youtubeUrl: "https://www.youtube.com/watch?v=X-8v_Y9rQzU", youtubeId: "X-8v_Y9rQzU", xpReward: 100, orderIndex: 9, completed: false, completedAt: null },
      { id: "less_white_10", moduleId: "mod_white", title: "White Belt Final Challenge", description: "Exame teórico cobrando 20 questões fundamentais de jiu-jitsu e vocabulário em inglês.", youtubeUrl: "https://www.youtube.com/watch?v=vAg_m9X_qK0", youtubeId: "vAg_m9X_qK0", xpReward: 100, orderIndex: 10, completed: false, completedAt: null }
    ]
  },
  {
    id: "mod_blue",
    title: "Blue Belt Path - Guard Passing & Defense",
    description: "Aprofunde na passagem de guarda, finalizações avançadas e nomenclaturas em inglês de alto nível.",
    beltLevel: "BLUE",
    orderIndex: 2,
    active: true,
    lessons: [
      { id: "less_blue_1", moduleId: "mod_blue", title: "Knee Slide Guard Pass", description: "Como cruzar o joelho com velocidade, esgrima forte de tronco e estabilização nos 100kg.", youtubeUrl: "https://www.youtube.com/watch?v=Y8Y52nswWAs", youtubeId: "Y8Y52nswWAs", xpReward: 150, orderIndex: 1, completed: false, completedAt: null }
    ]
  },
  {
    id: "mod_purple",
    title: "Purple Belt Tactics - Submissions & Transitions",
    description: "Conecte transições e domine termos técnicos e termos de arbitragem internacional.",
    beltLevel: "PURPLE",
    orderIndex: 3,
    active: true,
    lessons: [
      { id: "less_purple_1", moduleId: "mod_purple", title: "Berimbolo Tech & Concepts", description: "Entrada moderna rolando por baixo do quadril do oponente para expor e atacar as costas.", youtubeUrl: "https://www.youtube.com/watch?v=84G477f1f3A", youtubeId: "84G477f1f3A", xpReward: 200, orderIndex: 1, completed: false, completedAt: null }
    ]
  },
  {
    id: "mod_brown",
    title: "Brown Belt Dominance - Pressure & Submissions",
    description: "Aperfeiçoe sua pressão de quadril e seu vocabulário de coaching internacional.",
    beltLevel: "BROWN",
    orderIndex: 4,
    active: true,
    lessons: [
      { id: "less_brown_1", moduleId: "mod_brown", title: "Deep Half Guard Mastery", description: "Como se posicionar embaixo do centro de gravidade de adversários pesados e golpear raspagens.", youtubeUrl: "https://www.youtube.com/watch?v=7hR9qgI0jhs", youtubeId: "7hR9qgI0jhs", xpReward: 250, orderIndex: 1, completed: false, completedAt: null }
    ]
  },
  {
    id: "mod_black",
    title: "Black Belt Mastery - Leadership & Strategy",
    description: "Explore táticas de campeonato internacional, liderança, técnicas avançadas e mentoria de alta performance.",
    beltLevel: "BLACK",
    orderIndex: 5,
    active: true,
    lessons: [
      { id: "less_black_1", moduleId: "mod_black", title: "Leglock Defense & Counters", description: "Aprenda rotas de liberação da linha de joelho e saídas seguras do sela/ashi garami.", youtubeUrl: "https://www.youtube.com/watch?v=QfJbAtW1v_A", youtubeId: "QfJbAtW1v_A", xpReward: 300, orderIndex: 1, completed: false, completedAt: null }
    ]
  }
];

export default function JiuSpeakAcademy({ activeSubTab, setCurrentTab, user, updateUser, showToast }: JiuSpeakAcademyProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // States and refs to support autoplay and automated sequence progression
  const activeLessonRef = React.useRef<Lesson | null>(null);
  useEffect(() => {
    activeLessonRef.current = activeLesson;
  }, [activeLesson]);

  useEffect(() => {
    if (activeLesson) {
      const parseYoutubeId = (url: string | undefined): string => {
        if (!url) return "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : "";
      };

      const lesson = { ...activeLesson, videoUrl: activeLesson.youtubeUrl };
      const yId = parseYoutubeId(activeLesson.youtubeUrl);
      const embedUrl = yId ? `https://www.youtube.com/embed/${yId}?autoplay=1&mute=1&rel=0&modestbranding=1` : "";

      console.log("Lessons Source:", lessonsData);
      console.log("Current Lesson:", lesson);
      console.log("Video URL:", lesson.videoUrl);
      console.log("Embed URL:", embedUrl);
    }
  }, [activeLesson]);

  const [currentPlayerInstance, setCurrentPlayerInstance] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const [inProgressLessons, setInProgressLessons] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('jiuspeak_in_progress_lessons');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const markLessonInProgress = (lessonId: string) => {
    setInProgressLessons(prev => {
      if (prev.includes(lessonId)) return prev;
      const updated = [...prev, lessonId];
      try {
        localStorage.setItem('jiuspeak_in_progress_lessons', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const [reviewActive, setReviewActive] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showingTranslation, setShowingTranslation] = useState(false);
  
  // Quiz State for White Belt Final Challenge
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Arena PvP State
  const [pvpQuizActive, setPvpQuizActive] = useState(false);
  const [pvpQuestionIndex, setPvpQuestionIndex] = useState(0);
  const [pvpCorrectCount, setPvpCorrectCount] = useState(0);
  const [pvpXPGoal, setPvpXPGoal] = useState(150);
  const [pvpFinished, setPvpFinished] = useState(false);

  // Admin Panel State
  const [adminProgress, setAdminProgress] = useState<any>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  
  // Technical BJJ Flashcards data
  const [vocabularyFlashcards, setVocabularyFlashcards] = useState<Record<string, { term: string; phonetic: string; translation: string; bjjContext: string }[]>>(() => {
    try {
      const stored = localStorage.getItem('jiuspeak_vocabulary_flashcards');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      less_white_1: [
        { term: "Posture", phonetic: "/ˈpɒs.tʃər/", translation: "Postura", bjjContext: "Crucial inside the closed guard to prevent sweeps and submissions." },
        { term: "Leverage", phonetic: "/ˈliː.vər.ɪdʒ/", translation: "Alavanca", bjjContext: "Using mechanic force advantage instead of pure muscular power." },
        { term: "Base", phonetic: "/beɪs/", translation: "Base / Equilíbrio", bjjContext: "Spreading weight wide to prevent being easily knocked over." }
      ],
      less_white_3: [
        { term: "Closed Guard", phonetic: "/kləʊzd ɡɑːd/", translation: "Guarda Fechada", bjjContext: "Wrapping both legs around the opponent's waist with locked ankles." },
        { term: "Underhook", phonetic: "/ˈʌn.dər.hʊk/", translation: "Esgrima (por baixo)", bjjContext: "Slipping your arm under the opponent's armpit to gain superior body control." },
        { term: "Posture control", phonetic: "/ˈpɒs.tʃər kənˈtrəʊl/", translation: "Controle de postura", bjjContext: "Pulling the opponent down using collar and sleeve grips to neutralize threat." }
      ],
      less_white_4: [
        { term: "Armbar", phonetic: "/ˈɑːm.bɑːr/", translation: "Chave de braço", bjjContext: "An entry attacking the elbow joint by creating a fulcrum with your hips." },
        { term: "Bridge", phonetic: "/brɪdʒ/", translation: "Ponte (Upa)", bjjContext: "Exploding hips off the ground supporting weight on heels and shoulders." },
        { term: "Tap out", phonetic: "/tæp aʊt/", translation: "Bater (desistir)", bjjContext: "The physical gesture of submitting to tap the mat or opponent." }
      ],
      less_white_5: [
        { term: "Triangle choke", phonetic: "/ˈtraɪ.æŋ.ɡəl tʃəʊk/", translation: "Triângulo", bjjContext: "Strangling using your leg crossed over opponent's neck and arm." },
        { term: "Shin", phonetic: "/ʃɪn/", translation: "Canela", bjjContext: "Gripping your own shin with hands to secure and lock the triangle figure four." },
        { term: "Choke", phonetic: "/tʃəʊk/", translation: "Estrangulamento", bjjContext: "Cutting block to blood flow or airway for submission victory." }
      ]
    };
  });

  const updateVocabularyFlashcards = (newFlashcards: Record<string, any[]>) => {
    setVocabularyFlashcards(newFlashcards);
    try {
      localStorage.setItem('jiuspeak_vocabulary_flashcards', JSON.stringify(newFlashcards));
    } catch (e) {}
    fetch('/api/admin/academy/flashcards/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ flashcards: newFlashcards })
    }).catch(() => {});
  };

  // Sample dynamic flashcard deck
  const generalFlashcards = [
    { term: "Choke", phonetic: "/tʃəʊk/", translation: "Estrangulamento", bjjContext: "Applying carotid pressure." },
    { term: "Pass the Guard", phonetic: "/pæs ðə ɡɑːd/", translation: "Passar a Guarda", bjjContext: "Getting past the defense legs." },
    { term: "Sweep", phonetic: "/swiːp/", translation: "Raspagem", bjjContext: "Reversing from guard bottom to top position." },
    { term: "Half Guard", phonetic: "/hɑːf ɡɑːd/", translation: "Meia Guarda", bjjContext: "Controlling one leg of top opponent." },
    { term: "Full Mount", phonetic: "/fʊl maʊnt/", translation: "Montada Completa", bjjContext: "Dominant chest on chest seat atop." }
  ];

  // Technical English Quiz Questions for White Belt final graduation test
  const [quizQuestions, setQuizQuestions] = useState<{ q: string; options: string[]; answer: number; explanation: string }[]>(() => {
    try {
      const stored = localStorage.getItem('jiuspeak_quiz_questions');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        q: "Qual termo em inglês refere-se à famosa raspagem onde o de baixo vai para cima na guarda?",
        options: ["Submission", "Sweep", "Guard Pass", "Sprawl"],
        answer: 1,
        explanation: "Sweep significa golpear a raspagem partindo de posições inferiores de guarda para dominar por cima."
      },
      {
        q: "Como se traduz 'estrangulamento' no vocabulário oficial norte-americano?",
        options: ["Lock", "Choke", "Sweep", "Escape"],
        answer: 1,
        explanation: "Choke refere-se a qualquer estrangulamento de carótida ou via aérea."
      },
      {
        q: "Diga a tradução correta para a ação de 'bater em desistência':",
        options: ["Break out", "Underhook", "Tap out", "Takedown"],
        answer: 2,
        explanation: "Tap out significa dar tapinhas no corpo do colega ou tatame em sinal de desistência segura."
      },
      {
        q: "O golpe clássico 'Upa' de elevação explosiva de quadril é traduzido graficamente como:",
        options: ["Hip Throw", "Sprawl", "Bridge", "Sweep"],
        answer: 2,
        explanation: "Bridge ou Upa é o principal movimento de ponte ponte-escape do sistema defensivo."
      },
      {
        q: "O termo 'Underhook' significa o que na prática dos treinos de luta?",
        options: ["Dar as costas ao adversário", "Girar em Berimbolo", "Realizar a pegada de esgrima por baixo do braço", "Chave de calcanhar"],
        answer: 2,
        explanation: "Underhook é a tradicional esgrima por baixo da axila adversária para travar distância."
      },
      {
        q: "O que significa 'Full Mount' no Jiu-Jitsu?",
        options: ["Montada completa por cima", "Guarda fechada", "Pegada pelas costas", "Passagem de joelho cruzado"],
        answer: 0,
        explanation: "Full Mount é a posição de dominância total montado sobre o peito/quadril adversário."
      },
      {
        q: "Seu professor ensinou um 'Guard Pass'. Ele quer que você:",
        options: ["Responda perguntas", "Passe a guarda do companheiro de treino", "Defenda uma pegada", "Finalize de triângulo"],
        answer: 1,
        explanation: "Guard Pass indica a progressão de transpasse da linha das pernas do oponente."
      },
      {
        q: "Como dizemos 'chave de braço' em inglês?",
        options: ["Armbar", "Leglock", "Choke hold", "Wristlock"],
        answer: 0,
        explanation: "Armbar é a alavanca mecânica direta sobre o cotovelo."
      },
      {
        q: "O que é um 'Takedown'?",
        options: ["Passagem de guarda", "Queda / Projeção para o solo", "Pegada pelas costas", "Defesa contra mata leão"],
        answer: 1,
        explanation: "Takedown refere-se a quedas, como baiana/Double Leg ou quedas de judô."
      },
      {
        q: "Qual é a tradução mais precisa para 'Postura' inside guard?",
        options: ["Leverage", "Posture", "Kimono", "Base"],
        answer: 1,
        explanation: "Posture refere-se a boa verticalidade de coluna por cima para evitar triângulos e raspagens."
      }
    ];
  });

  const updateQuizQuestions = (newQuestions: any[]) => {
    setQuizQuestions(newQuestions);
    try {
      localStorage.setItem('jiuspeak_quiz_questions', JSON.stringify(newQuestions));
    } catch (e) {}
    fetch('/api/admin/academy/quizzes/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ quizzes: newQuestions })
    }).catch(() => {});
  };

  const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'modules' | 'lessons' | 'videos' | 'quizzes' | 'flashcards' | 'vocabulary' | 'course-order' | 'preview'>('dashboard');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminFilterBelt, setAdminFilterBelt] = useState('ALL');

  // Preview and Quizzes/Flashcards administrative states
  const [previewLesson, setPreviewLesson] = useState<any>(null);
  const [previewMuted, setPreviewMuted] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedLessonForFlashcards, setSelectedLessonForFlashcards] = useState<string>('');
  const [editingFlashcard, setEditingFlashcard] = useState<any>(null);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);

  useEffect(() => {
    const loadCustomItems = async () => {
      try {
        const quizRes = await fetch('/api/admin/academy/quizzes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const quizData = await quizRes.json();
        if (quizData.success && quizData.quizzes && quizData.quizzes.length > 0) {
          setQuizQuestions(quizData.quizzes);
          localStorage.setItem('jiuspeak_quiz_questions', JSON.stringify(quizData.quizzes));
        }

        const fcRes = await fetch('/api/admin/academy/flashcards', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const fcData = await fcRes.json();
        if (fcData.success && fcData.flashcards && Object.keys(fcData.flashcards).length > 0) {
          setVocabularyFlashcards(fcData.flashcards);
          localStorage.setItem('jiuspeak_vocabulary_flashcards', JSON.stringify(fcData.flashcards));
        }
      } catch (e) {}
    };
    loadCustomItems();
  }, []);

  // Arena PvP multiple choice queries
  const pvpBank = [
    { q: "You hold the opponent with both legs from behind. You gained:", options: ["The Mount", "The Back Control (Pegada de Costas)", "Side Control", "Half Guard"], answer: 1 },
    { q: "Tap out immediately when trapped in a tight mechanical:", options: ["Post-workout", "Submission (Finalização)", "Social Story", "Warm up"], answer: 1 },
    { q: "A BJJ practitioner's suit jacket is called:", options: ["Armor", "Shirt", "Gi (Kimono)", "Coat"], answer: 2 },
    { q: "Your opponent is in deep guard. You should try to stay heavy and maintain good:", options: ["Postures", "Grips & Posture", "Leg swings", "Speed rushes"], answer: 1 },
    { q: "When you project the opponent onto the canvas with wrestling, you scored a:", options: ["Guard pull", "Takedown", "Sweep", "Refuse"], answer: 1 }
  ];

  // Fetch Modules & Student Progress from Backend
  useEffect(() => {
    fetchModules();
  }, [activeSubTab]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academy/modules', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setModules(data.modules);
      } else {
        showToast("Erro ao ler matriz da academia. Usando in-memory.", "error");
        const localCompletions = JSON.parse(localStorage.getItem('jiuspeak_completed_lessons') || '[]');
        const fallbackWithCompletions = FALLBACK_MODULES.map(m => ({
          ...m,
          lessons: m.lessons.map(l => ({
            ...l,
            completed: localCompletions.includes(l.id)
          }))
        }));
        setModules(fallbackWithCompletions);
      }
    } catch (err) {
      console.error(err);
      const localCompletions = JSON.parse(localStorage.getItem('jiuspeak_completed_lessons') || '[]');
      const fallbackWithCompletions = FALLBACK_MODULES.map(m => ({
        ...m,
        lessons: m.lessons.map(l => ({
          ...l,
          completed: localCompletions.includes(l.id)
        }))
      }));
      setModules(fallbackWithCompletions);
    } finally {
      setLoading(false);
    }
  };

  const completeLesson = async (lesson: Lesson, shouldExitView: boolean = true) => {
    try {
      showToast("Salvando progresso e computando XP...", "info");
      const res = await fetch('/api/academy/progress/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ lessonId: lesson.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🥋 Aula concluída com sucesso! Ganhou +${data.xpReward} XP!`, "success");
        updateUser({
          xp: user.xp + data.xpReward,
          coins: user.coins + 20 // award bonus Kimono Coins too!
        });
        
        // Refresh local progress state
        setModules(prev => prev.map(m => {
          return {
            ...m,
            lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, completed: true } : l)
          };
        }));
        
        if (shouldExitView) {
          setActiveLesson(null);
        } else {
          setActiveLesson(prev => prev && prev.id === lesson.id ? { ...prev, completed: true } : prev);
        }
        return true;
      } else {
        // Fallback local completion
        const localCompletions = JSON.parse(localStorage.getItem('jiuspeak_completed_lessons') || '[]');
        if (!localCompletions.includes(lesson.id)) {
          localCompletions.push(lesson.id);
          localStorage.setItem('jiuspeak_completed_lessons', JSON.stringify(localCompletions));
        }
        showToast(`🥋 Concluído em modo in-memory! Ganhou +${lesson.xpReward} XP!`, "success");
        updateUser({
          xp: user.xp + lesson.xpReward,
          coins: user.coins + 20
        });
        setModules(prev => prev.map(m => ({
          ...m,
          lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, completed: true } : l)
        })));
        if (shouldExitView) {
          setActiveLesson(null);
        } else {
          setActiveLesson(prev => prev && prev.id === lesson.id ? { ...prev, completed: true } : prev);
        }
        return true;
      }
    } catch (e) {
      // Fallback local completion on connection error
      const localCompletions = JSON.parse(localStorage.getItem('jiuspeak_completed_lessons') || '[]');
      if (!localCompletions.includes(lesson.id)) {
        localCompletions.push(lesson.id);
        localStorage.setItem('jiuspeak_completed_lessons', JSON.stringify(localCompletions));
      }
      showToast(`🥋 Concluído em modo local! Ganhou +${lesson.xpReward} XP!`, "success");
      updateUser({
        xp: user.xp + lesson.xpReward,
        coins: user.coins + 20
      });
      setModules(prev => prev.map(m => ({
        ...m,
        lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, completed: true } : l)
      })));
      if (shouldExitView) {
        setActiveLesson(null);
      } else {
        setActiveLesson(prev => prev && prev.id === lesson.id ? { ...prev, completed: true } : prev);
      }
      return true;
    }
  };

  const findNextLesson = (currentLesson: Lesson) => {
    const parentModule = modules.find(m => m.id === currentLesson.moduleId);
    if (!parentModule) return null;
    const currentIndex = parentModule.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex !== -1 && currentIndex + 1 < parentModule.lessons.length) {
      return parentModule.lessons[currentIndex + 1];
    }
    return null;
  };

  const handleVideoEnded = async () => {
    const currentActive = activeLessonRef.current;
    if (!currentActive) return;
    if (isAdvancing) return;

    setIsAdvancing(true);
    showToast("🎯 Vídeo concluído! Aula registrada com sucesso.", "success");
    
    // Complete lesson and keep active view open
    const success = await completeLesson(currentActive, false);
    
    if (success) {
      setTimeout(() => {
        const next = findNextLesson(currentActive);
        if (next) {
          showToast("➔ Carregando próxima lição automaticamente em 2 segundos...", "info");
          setActiveLesson(next);
        } else {
          showToast("🏁 Módulo Concluído!", "success");
        }
        setIsAdvancing(false);
      }, 2000);
    } else {
      setIsAdvancing(false);
    }
  };

  const handleStartInProgress = (lessonId: string) => {
    markLessonInProgress(lessonId);
  };

  const startCourseMode = () => {
    if (!currentModule) return;
    const firstIncomplete = currentModule.lessons.find(l => !l.completed);
    const target = firstIncomplete || currentModule.lessons[0];
    if (target) {
      setActiveLesson(target);
      showToast(`▶ Modo Curso Iniciado: ${target.title}`, "success");
    } else {
      showToast("Aulas indisponíveis neste módulo.", "error");
    }
  };

  const submitFinalChallengeQuiz = async (percentageScore: number) => {
    try {
      showToast("Enviando notas de Exame de Graduação...", "info");
      const res = await fetch('/api/academy/progress/final-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score: percentageScore })
      });
      const data = await res.json();
      if (data.success) {
        showToast("👑 PARABÉNS! Graduação Faixa Branca aprovada com 100% de sucesso!", "success");
        updateUser({
          xp: user.xp + 1000,
          unlockedAchievements: [...(user.unlockedAchievements || []), "White Belt Graduate"]
        });
        setQuizActive(false);
        setActiveLesson(null);
        fetchModules();
      } else {
        showToast(data.error || "Infelizmente você não atingiu o score tático de 70%!", "error");
      }
    } catch (err) {
      showToast("Erro ao computar diploma de conclusão.", "error");
    }
  };

  const handleQuizAnswer = (optionIdx: number) => {
    const isCorrect = quizQuestions[quizQuestionIndex].answer === optionIdx;
    if (isCorrect) {
      showToast("✓ Correct Vocab!", "success");
    } else {
      showToast("🚨 Resposta errada. Tente prestar atenção no bjjContext!", "error");
    }

    const nextAnswers = [...quizAnswers, optionIdx];
    setQuizAnswers(nextAnswers);

    if (quizQuestionIndex + 1 < quizQuestions.length) {
      setQuizQuestionIndex(quizQuestionIndex + 1);
    } else {
      // Calculate final score
      let correct = 0;
      nextAnswers.forEach((ans, idx) => {
        if (ans === quizQuestions[idx].answer) correct++;
      });
      const finalScore = Math.round((correct / quizQuestions.length) * 100);
      setQuizScore(finalScore);
      submitFinalChallengeQuiz(finalScore);
    }
  };

  const handlePvpAnswer = (optionIdx: number) => {
    const isCorrect = pvpBank[pvpQuestionIndex].answer === optionIdx;
    if (isCorrect) {
      setPvpCorrectCount(prev => prev + 1);
      showToast("⚡ +30 XP! Jab certeiro!", "success");
    } else {
      showToast("💥 Bloqueado! Defesa vulnerável.", "error");
    }

    if (pvpQuestionIndex + 1 < pvpBank.length) {
      setPvpQuestionIndex(prev => prev + 1);
    } else {
      // Finished PvP Arena
      setPvpFinished(true);
      const earnedXp = pvpCorrectCount * 30 + 50; // standard bonus 
      submitPvpResults(earnedXp);
    }
  };

  const submitPvpResults = async (earnedXp: number) => {
    try {
      const res = await fetch('/api/academy/pvp/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          correctCount: pvpCorrectCount,
          totalCount: pvpBank.length,
          xpEarned: earnedXp,
          belt: user.belt.toUpperCase()
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🥊 PvP Arena finalizada! Total de ${earnedXp} XP creditados com sucesso!`, "success");
        updateUser({ xp: user.xp + earnedXp });
      }
    } catch (e) {
      showToast("Erro ao processar pontos pvp.", "error");
    }
  };

  // Fetch Admin Student summary
  const loadAdminProgress = async () => {
    try {
      const res = await fetch('/api/admin/academy/progress', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminProgress(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (activeSubTab === 'academy_admin') {
      loadAdminProgress();
    }
  }, [activeSubTab]);

  // Handle module create/save on Admin Mode
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/academy/modules/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editingModule)
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Módulo Academy gravado com sucesso!", "success");
        setEditingModule(null);
        loadAdminProgress();
        fetchModules();
      }
    } catch (e) {}
  };

  // Handle lesson edit/save on Admin Mode
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/academy/lessons/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editingLesson)
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Lição salva com sucesso!", "success");
        setEditingLesson(null);
        loadAdminProgress();
        fetchModules();
      }
    } catch (e) {}
  };

  // Handle module delete on Admin Mode
  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm("Atenção! Excluir um módulo removerá permanentemente todas as suas lições e dados associados. Deseja continuar?")) {
      return;
    }
    try {
      const res = await fetch('/api/admin/academy/modules/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: moduleId })
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Módulo e suas lições excluídos do sistema!", "success");
        loadAdminProgress();
        fetchModules();
      } else {
        showToast("❌ Falha ao excluir o módulo.", "error");
      }
    } catch (e) {
      showToast("❌ Erro de comunicação com o servidor.", "error");
    }
  };

  // Handle lesson delete on Admin Mode
  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm("Deseja realmente excluir esta lição permanentemente?")) {
      return;
    }
    try {
      const res = await fetch('/api/admin/academy/lessons/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: lessonId })
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Lição removida do sistema com sucesso!", "success");
        loadAdminProgress();
        fetchModules();
      } else {
        showToast("❌ Falha ao excluir a lição.", "error");
      }
    } catch (e) {
      showToast("❌ Erro de comunicação com o servidor.", "error");
    }
  };

  // Helper mapping target belt levels
  const getBeltLabel = (lvl: string) => {
    switch (lvl) {
      case 'WHITE': return { icon: '🤍', label: 'White Belt', bg: 'border-white/20 text-white bg-slate-900', hoverBg: 'hover:bg-white/5' };
      case 'BLUE': return { icon: '💙', label: 'Blue Belt', bg: 'border-blue-500/30 text-blue-400 bg-blue-950/20', hoverBg: 'hover:bg-blue-900/10' };
      case 'PURPLE': return { icon: '💜', label: 'Purple Belt', bg: 'border-purple-500/30 text-purple-400 bg-purple-950/20', hoverBg: 'hover:bg-purple-900/10' };
      case 'BROWN': return { icon: '🤎', label: 'Brown Belt', bg: 'border-amber-700/30 text-amber-500 bg-amber-950/20', hoverBg: 'hover:bg-amber-900/10' };
      case 'BLACK': return { icon: '🖤', label: 'Black Belt', bg: 'border-red-500/30 text-red-400 bg-slate-950 border border-red-950', hoverBg: 'hover:bg-red-950/20' };
      default: return { icon: '🥋', label: 'Fases', bg: 'border-slate-800 text-slate-350 bg-slate-900/80', hoverBg: 'hover:bg-slate-800' };
    }
  };

  // Get current active module from subTab ID
  const activeBeltKey = activeSubTab.replace('academy_', '').toUpperCase(); // 'white', 'blue' etc
  const currentModule = modules.find(m => m.beltLevel === activeBeltKey);

  // Layout Renders
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-sm text-slate-400">Carregando tatame acadêmico...</p>
      </div>
    );
  }

  // Active Lesson Detail Page
  if (activeLesson) {
    const flashcards = vocabularyFlashcards[activeLesson.id] || generalFlashcards;
    
    // Find current module information to populate above-the-video headers and progress percentages
    const currentModuleInfo = modules.find(m => m.id === activeLesson.moduleId);
    const completedCountInfo = currentModuleInfo?.lessons.filter(l => l.completed).length || 0;
    const totalCountInfo = currentModuleInfo?.lessons.length || 0;
    const modulePercentInfo = totalCountInfo > 0 ? Math.round((completedCountInfo / totalCountInfo) * 100) : 0;
    const beltLabelMetaInfo = currentModuleInfo ? getBeltLabel(currentModuleInfo.beltLevel) : { icon: "🥋", label: "Academy" };
    const lessonIndexInfo = currentModuleInfo?.lessons.findIndex(l => l.id === activeLesson.id) ?? -1;
    const lessonNumberInfo = lessonIndexInfo !== -1 ? lessonIndexInfo + 1 : activeLesson.orderIndex;
    const hasNextLessonInfo = currentModuleInfo && lessonIndexInfo !== -1 && lessonIndexInfo + 1 < currentModuleInfo.lessons.length;

    const handlePlayerRef = (player: any) => {
      setCurrentPlayerInstance(player);
      if (player) {
        setIsMuted(player.isMuted());
      } else {
        setIsMuted(true);
      }
    };

    const handleUnmute = () => {
      if (currentPlayerInstance && typeof currentPlayerInstance.unMute === 'function') {
        currentPlayerInstance.unMute();
        setIsMuted(false);
        showToast("🔊 Som ativado!", "success");
      }
    };

    return (
      <div className="space-y-6 animate-fadeIn" id="academy-active-lesson">
        {/* Upper Back Button Area */}
        <button 
          onClick={() => {
            setActiveLesson(null);
            setQuizActive(false);
            setReviewActive(false);
          }}
          className="flex items-center gap-2 text-xs font-mono text-violet-300 hover:text-white transition-colors cursor-pointer bg-slate-900/80 p-2.5 rounded-xl border border-slate-850 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para os Módulos
        </button>

        {/* INTERFACE: Acima do vídeo */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-850 space-y-3.5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{beltLabelMetaInfo.icon}</span>
                <span className="text-[10px] font-mono tracking-widest text-violet-300 uppercase font-black">
                  Nível: {beltLabelMetaInfo.label} • Lição {lessonNumberInfo} de {totalCountInfo}
                </span>
                {activeLesson.completed ? (
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    CONCLUÍDA
                  </span>
                ) : inProgressLessons.includes(activeLesson.id) ? (
                  <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                    EM ANDAMENTO
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                    NÃO INICIADA
                  </span>
                )}
              </div>
              <h2 className="font-display font-black text-2xl text-white tracking-tight mt-1">
                {activeLesson.title}
              </h2>
              <p className="text-xs text-slate-455 font-sans max-w-2xl leading-relaxed">
                {activeLesson.description}
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 min-w-[160px] text-center space-y-1.5 shadow-inner">
              <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Progresso do Módulo</span>
              <span className="text-sm font-black text-violet-300 font-mono">{completedCountInfo} / {totalCountInfo} ({modulePercentInfo}%)</span>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-violet-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${modulePercentInfo}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Video Player and Flashcards Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Embedded YouTube Iframe container with smart overlay state check */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center">
              {activeLesson.youtubeId ? (
                <>
                  <YoutubeAutoPlayer
                    youtubeId={activeLesson.youtubeId}
                    onStartInProgress={() => handleStartInProgress(activeLesson.id)}
                    onVideoEnded={handleVideoEnded}
                    onPlayerRef={handlePlayerRef}
                  />

                  {/* Autoplay blocker Unmute Floating Button */}
                  {isMuted && (
                    <button
                      onClick={handleUnmute}
                      className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-xs tracking-wide shadow-lg cursor-pointer animate-bounce border border-violet-400 transition-all active:scale-[0.98]"
                    >
                      🔊 Ativar Som
                    </button>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
                  <Play className="w-12 h-12 text-zinc-650 mb-3 animate-pulse" />
                  <p className="font-display font-semibold text-white">Vídeo ainda não cadastrado.</p>
                </div>
              )}
            </div>

            {/* INTERFACE: Abaixo do vídeo */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6 shadow-sm">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-5">
                {/* XP ganho & Status label list */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-violet-500/10 text-violet-300 border border-violet-500/20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-violet-400" />
                    Recompensa: +{activeLesson.xpReward} XP
                  </div>

                  {/* Status checklist representation */}
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850 text-xs">
                    <span className="text-slate-455 font-sans font-medium">Status da Lição:</span>
                    {activeLesson.completed ? (
                      <span className="text-emerald-400 font-bold font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Concluída
                      </span>
                    ) : inProgressLessons.includes(activeLesson.id) ? (
                      <span className="text-amber-400 font-bold font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Em andamento
                      </span>
                    ) : (
                      <span className="text-slate-500 font-bold font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-500" /> Não iniciada
                      </span>
                    )}
                  </div>
                </div>

                {/* Navigation and state management controls */}
                <div className="flex items-center gap-2">
                  {!activeLesson.completed ? (
                    <button
                      onClick={() => completeLesson(activeLesson, false)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-bold cursor-pointer text-xs uppercase shadow-md transition-all shrink-0 hover:scale-[1.02]"
                    >
                      <CheckCircle className="w-4 h-4" /> Finalizar Aula Manuscrita
                    </button>
                  ) : null}

                  {hasNextLessonInfo ? (
                    <button
                      disabled={!activeLesson.completed}
                      onClick={() => {
                        const nextLes = findNextLesson(activeLesson);
                        if (nextLes) {
                          setActiveLesson(nextLes);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs uppercase shadow-md transition-all cursor-pointer ${
                        activeLesson.completed
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white hover:scale-[1.02]'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'
                      }`}
                    >
                      Próxima Lição <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled={!activeLesson.completed}
                      onClick={() => {
                        showToast("🎉 Parabéns! Módulo completado com absoluto sucesso!", "success");
                        setActiveLesson(null);
                      }}
                      className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs uppercase shadow-md transition-all cursor-pointer ${
                        activeLesson.completed
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'
                      }`}
                    >
                      Módulo Finalizado 🏁
                    </button>
                  )}
                </div>
              </div>

              {/* Vocabulário em inglês & flashcard layouts as requested */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <span>✓</span> Vocabulário em Inglês & Flashcards
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans leading-snug">
                      Domine os principais jargões em inglês usados globalmente no tatame de lutas e em torneios. Clique para virar o card:
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setReviewIndex(0);
                      setShowingTranslation(false);
                      setReviewActive(true);
                      showToast("🔄 Modo revisão iniciado!", "info");
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono border border-slate-750 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    🔄 Botão Revisar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-1.5">
                  {flashcards.map((fc, idx) => (
                    <FlashcardItem key={idx} fc={fc} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right rail - Vocabulary Study references */}
          <div className="space-y-5">
            <div className="bg-slate-900/85 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col h-full justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-850">
                  <BookMarked className="w-4.5 h-4.5 text-violet-400" />
                  <h3 className="font-display font-bold text-sm text-white">Manual Teórico JiuSpeak</h3>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  A fluência tática exige consistência. Estude a pronúncia fonética e coloque em prática os termos anotados:
                </p>

                <div className="space-y-3 pt-1">
                  {flashcards.map((fc, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/80 rounded-xl border border-slate-855 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold text-violet-300">{fc.term}</span>
                        <span className="font-mono text-[9px] text-slate-500 font-medium">{fc.phonetic}</span>
                      </div>
                      <p className="text-[11px] text-slate-350 leading-tight">
                        <strong className="text-slate-400">Significado:</strong> {fc.translation}
                      </p>
                      <p className="text-[10px] text-slate-505 italic leading-snug pt-1">
                        👉 {fc.bjjContext}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-violet-950/10 border border-violet-900/20 text-center">
                <p className="text-[10px] text-slate-455 font-sans leading-relaxed">
                  📖 Memorize estes termos! No final do curso você realizará o exame de graduação oral para a liberação da blockchain de faixas!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Modal for interactive "Botão Revisar" study deck */}
        {reviewActive && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-violet-500/30 rounded-2xl max-w-md w-full p-6 space-y-6 animate-scaleIn shadow-2xl relative">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-bold block">RECONHECIMENTO VOCABULÁRIO TÁTICO</span>
                  <h3 className="font-display font-extrabold text-white text-sm">Painel de Revisão Ativa</h3>
                </div>
                <button 
                  onClick={() => setReviewActive(false)}
                  className="p-1 px-2.5 bg-slate-850 hover:bg-slate-800 rounded font-mono text-slate-300 text-xs cursor-pointer"
                >
                  Sair
                </button>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 text-center space-y-5 min-h-[200px] flex flex-col justify-center items-center relative overflow-hidden group">
                <span className="text-3xl">🎴</span>
                <h4 className="font-mono font-black text-xl text-violet-300">{flashcards[reviewIndex]?.term}</h4>
                <p className="font-mono text-xs text-slate-500 font-semibold">{flashcards[reviewIndex]?.phonetic}</p>
                
                {showingTranslation ? (
                  <div className="pt-2 animate-fadeIn space-y-2.5">
                    <p className="text-sm text-emerald-400 font-black">Tradução: {flashcards[reviewIndex]?.translation}</p>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-sm">{flashcards[reviewIndex]?.bjjContext}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowingTranslation(true)}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-xs cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    Revelar Significado
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center font-sans text-xs pt-2">
                <span className="text-slate-500 font-mono text-[10px] font-bold">Carta {reviewIndex + 1} de {flashcards.length}</span>
                
                <div className="flex gap-2">
                  <button
                    disabled={reviewIndex === 0}
                    onClick={() => {
                      setReviewIndex(prev => prev - 1);
                      setShowingTranslation(false);
                    }}
                    className="px-3 py-1.5 bg-slate-855 hover:bg-slate-800 text-slate-300 rounded-lg text-[10.5px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
                  >
                    Anterior
                  </button>
                  {reviewIndex + 1 < flashcards.length ? (
                    <button
                      onClick={() => {
                        setReviewIndex(prev => prev + 1);
                        setShowingTranslation(false);
                      }}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10.5px] font-bold cursor-pointer"
                    >
                      Avançar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setReviewActive(false);
                        showToast("✓ Revisão de lição completada com sucesso!", "success");
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-bold cursor-pointer"
                    >
                      Terminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SubTab: Certificados VIEW
  if (activeSubTab === 'academy_certs') {
    const isGraduate = (user.unlockedAchievements || []).includes("White Belt Graduate");
    
    return (
      <div className="space-y-6" id="academy-certs-board">
        <div className="bg-gradient-to-r from-violet-950/40 via-indigo-950/20 to-slate-950 p-6 rounded-2xl border border-slate-900">
          <h2 className="font-display font-extrabold text-2xl text-white">📜 Meus Certificados JiuSpeak</h2>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Aqui você emite diplomas oficiais com autenticação em blockchain assim que aprovar nos desafios táticos de cada faixa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* White Belt Diploma card */}
          <div className={`bg-slate-900 rounded-2xl border p-5 relative overflow-hidden flex flex-col justify-between ${
            isGraduate ? 'border-violet-500/40 bg-slate-900/60' : 'border-slate-850'
          }`}>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-3xl">🎓</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  isGraduate ? 'bg-emerald-500/10 text-emerald-350 border border-emerald-500/20' : 'bg-slate-800 text-slate-450'
                }`}>
                  {isGraduate ? "LIBERADO" : "BLOQUEADO"}
                </span>
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-white">White Belt Graduate</h4>
                <p className="text-xs text-slate-400 font-sans leading-snug mt-1">
                  Certifica o domínio tático de postura básica, transições, submissões primárias e vocabulário chave em inglês do nível.
                </p>
              </div>
            </div>

            {isGraduate ? (
              <div className="mt-6 space-y-4">
                {/* Print area representation */}
                <div className="p-4 bg-white text-slate-950 rounded-xl font-serif text-center shadow-inner border border-slate-350 select-none scale-[0.9] origin-center shadow-2xl">
                  <p className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">JIUSPEAK ACADEMY CERTIFICATE</p>
                  <h5 className="font-extrabold text-[11px] mt-1.5 uppercase font-sans">DIPLOMA DE GRADUAÇÃO</h5>
                  <p className="text-[7px] italic mt-1 text-slate-700">Certificamos de forma solene que o atleta</p>
                  <p className="text-xs font-black uppercase text-violet-950 tracking-wide my-1.5 font-sans">{user.name}</p>
                  <p className="text-[6.5px] leading-snug text-slate-600 px-1 font-sans">
                    concluiu com êxito todos os testes e exames orais com fluência em inglês técnico de grau <strong>WHITE BELT FOUNDATIONS</strong>.
                  </p>
                  <div className="border-t border-slate-350 mt-3 pt-1 flex justify-between items-center text-[5.5px] font-sans text-slate-500">
                    <span>Aulas Comprovadas • 10/10</span>
                    <span>Assinado: JiuSpeak Admin</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase cursor-pointer transition-colors shadow-lg shadow-violet-500/10 flex items-center justify-center gap-1.5"
                >
                  📥 Baixar / Imprimir Certificado
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                  <Lock className="w-4 h-4 text-slate-600 hover:text-white" />
                  <p className="text-[10px] text-slate-450 leading-snug font-sans">
                    Aprove no **White Belt Final Challenge** localizado no final do módulo de Faixa Branca para obter este diploma.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Locked indicators for higher belts */}
          {['Blue', 'Purple', 'Brown', 'Black'].map((bl) => (
            <div key={bl} className="bg-slate-900/30 rounded-2xl border border-slate-850 p-5 relative opacity-60 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-3xl">🔒</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-slate-450">
                    Indisponível
                  </span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-slate-400">{bl} Belt Path Completion</h4>
                  <p className="text-xs text-slate-500 font-sans leading-snug mt-1">
                    Exige o cumprimento dos correspondentes exames práticos em inglês tático do currículo.
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-450 mt-6 bg-slate-950/40 p-2.5 rounded border border-slate-850/30 font-mono">
                Requisito: Desbloquear faixa {bl} na Árvore Acadêmica.
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // SubTab: Meu Progresso (Recharts Metrics / Cumulative tracker)
  if (activeSubTab === 'academy_progress') {
    const isGraduate = (user.unlockedAchievements || []).includes("White Belt Graduate");
    const completedWhite = modules.find(m => m.beltLevel === 'WHITE')?.lessons.filter(l => l.completed).length || 0;
    const completedBlue = modules.find(m => m.beltLevel === 'BLUE')?.lessons.filter(l => l.completed).length || 0;
    
    return (
      <div className="space-y-6" id="academy-student-progress">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Daily Streaks */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">OFENSIVA DIÁRIA</span>
              <span className="text-2xl font-black text-orange-500 font-mono flex items-center gap-1">
                <Flame className="w-6 h-6 fill-orange-500/10" /> {user.streak} Dias
              </span>
              <p className="text-[10px] text-slate-450 font-sans">Sua consistência tática está excelente!</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          {/* Card: XP Acumulado */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">PONTUAÇÃO DE XP</span>
              <span className="text-2xl font-black text-violet-400 font-mono flex items-center gap-1">
                <Zap className="w-6 h-6 text-violet-400 fill-violet-400/10" /> {user.xp} XP
              </span>
              <p className="text-[10px] text-slate-450 font-sans">Nível atual do aluno: {user.level}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <Zap className="w-6 h-6 text-violet-400" />
            </div>
          </div>

          {/* Card: Kimono Coins */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">CARTEIRA COINS</span>
              <span className="text-2xl font-black text-yellow-500 font-mono flex items-center gap-1">
                <Coins className="w-6 h-6 text-yellow-500 fill-yellow-500/10" /> {user.coins} KC
              </span>
              <p className="text-[10px] text-slate-450 font-sans">Moedas para compras extras na loja.</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Coins className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Modular Progress Graphs & Performance Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-400" />
              <h3 className="font-display font-bold text-white text-base">Desempenho Acadêmico de Faixas</h3>
            </div>

            <p className="text-xs text-slate-400 font-sans">
              Veja a quantidade de aulas concluídas em cada módulo belt para ganhar suas medalhas táticas na blockchain:
            </p>

            <div className="space-y-4 pt-2">
              {[
                { label: "🤍 White Belt Foundations", percent: Math.round((completedWhite / 10) * 100), val: `${completedWhite}/10` },
                { label: "💙 Blue Belt Path", percent: Math.round((completedBlue / 1) * 100), val: `${completedBlue}/1` },
                { label: "💜 Purple Belt Tactics", percent: 0, val: "0/1" },
                { label: "🤎 Brown Belt Dominance", percent: 0, val: "0/1" },
                { label: "🖤 Black Belt Mastery", percent: 0, val: "0/1" }
              ].map((bjj, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-950 hover:bg-[#070a13] border border-slate-850 transition-colors">
                  <div className="flex justify-between text-xs">
                    <span className="font-sans font-medium text-slate-300">{bjj.label}</span>
                    <span className="font-mono text-violet-300 font-bold">{bjj.val} ({bjj.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${bjj.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Status summary */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-display font-semibold text-white text-base">Medalhas de Nível</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-850">
                <span className="text-2xl">🥇</span>
                <div>
                  <h4 className="font-display font-bold text-xs text-white">Pronto para Combater</h4>
                  <p className="text-[10px] text-slate-450 font-sans-dense font-medium">Completou sua primeira aula no tatame.</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 bg-slate-950 rounded-xl border ${
                isGraduate ? 'border-violet-500/30' : 'border-slate-850 opacity-40'
              }`}>
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="font-display font-bold text-xs text-white">White Belt Graduate</h4>
                  <p className="text-[10px] text-slate-450 font-sans-dense font-medium">
                    {isGraduate ? "Exame oral aprovado com fluência!" : "Aprovar exame final do White Belt."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-850 opacity-40">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-display font-bold text-xs text-slate-400">PVP Champion</h4>
                  <p className="text-[10px] text-slate-450 font-sans-dense font-medium">Vencer 10 partidas consecutivas de Arena.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SubTab: Arena PVP VIEW
  if (activeSubTab === 'academy_pvp') {
    const plan = user.subscription?.type?.toUpperCase() || 'FREE';
    const isMasterOrAdmin = ['MASTER', 'MESTRE', 'MESTRE GRACIE'].includes(plan) || user.role === 'admin';
    if (!isMasterOrAdmin) {
      return (
        <div className="p-12 text-center text-amber-500 font-mono text-sm border border-amber-500/30 rounded-2xl bg-slate-900 max-w-lg mx-auto my-12" id="403-access-denied-academy-pvp">
          <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
          <h3 className="font-display font-extrabold text-lg text-white mb-2">Acesso Exclusivo</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A Arena PVP é um recurso exclusivo para membros do plano <strong>MASTER</strong>. Faça o upgrade do seu plano na aba correspondente para destravar este recurso e lutar no tatame oficial!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6" id="academy-pvp-arena">
        <div className="bg-gradient-to-tr from-violet-950/40 via-purple-950/20 to-slate-950 p-6 rounded-2xl border border-slate-900 flex justify-between items-center gap-4 flex-wrap">
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-2xl text-white">🥊 Arena PvP - Conversação Prática</h2>
            <p className="text-xs text-slate-400 font-sans">
              Desafie o bot simulador em uma rodada rápida de 5 perguntas em inglês tático sobre conceitos reais de lutas e do tatame.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-right shrink-0">
            <span className="block text-[9px] font-mono text-slate-500 uppercase">SUA LIGA</span>
            <span className="text-sm font-bold text-violet-300 font-mono">LIGA JIU-JITSU BRASIL</span>
          </div>
        </div>

        {!pvpQuizActive ? (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-violet-500/10">
              ⚔️
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-white">Iniciar Combate de Conversação</h3>
              <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
                Ao entrar no tatame verbal, você responderá a 5 perguntas táticas. Cada golpe certeiro concede **+30 XP Extra** e bônus passivo para a sua carteira!
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setPvpQuizActive(true);
                  setPvpQuestionIndex(0);
                  setPvpCorrectCount(0);
                  setPvpFinished(false);
                }}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold uppercase transition-all shadow-lg hover:scale-[1.02] cursor-pointer text-xs"
              >
                🥋 Entrar na Luta (Combate Solo)
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 max-w-xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-violet-300 uppercase font-bold tracking-wider">Combate em Progresso</span>
              <span className="text-xs font-mono font-bold text-slate-400">Golpe {pvpQuestionIndex + 1} de {pvpBank.length}</span>
            </div>

            {pvpFinished ? (
              <div className="text-center space-y-4 py-4">
                <span className="text-4xl">👑</span>
                <h4 className="font-display font-bold text-xl text-white">Vitória de Luta Verbal!</h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm mx-auto">
                  Combate finalizado com sucesso! Você acertou **{pvpCorrectCount}** golpes de **{pvpBank.length}** e recebeu um bônus pesado na carteira!
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 inline-block">
                  <span className="text-sm font-bold text-violet-300 font-mono">+{pvpCorrectCount * 30 + 50} XP Creditados!</span>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setPvpQuizActive(false);
                      setPvpFinished(false);
                    }}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Voltar para o Hall
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm text-slate-200 font-semibold leading-relaxed">
                  {pvpBank[pvpQuestionIndex].q}
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {pvpBank[pvpQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePvpAnswer(idx)}
                      className="w-full text-left p-4 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-850 hover:border-violet-500 text-xs font-sans text-slate-300 transition-colors cursor-pointer"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // SubTab: Admin Panel for Academy Manager
  if (activeSubTab === 'academy_admin') {
    if (user.role !== 'admin') {
      return (
        <div className="p-12 text-center text-red-500 font-mono text-sm border border-red-500/30 rounded-2xl bg-red-950/20 max-w-lg mx-auto my-12" id="403-access-denied-academy">
          <Shield className="w-12 h-12 text-red-550 mx-auto mb-4 animate-bounce" />
          <h3 className="font-display font-extrabold text-lg text-white mb-2">403 - Acesso Negado</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Esta seção é restrita exclusivamente a administradores do ecossistema JiuSpeak.
          </p>
        </div>
      );
    }

    // Embed/YouTube URL parsing functions
    const getYoutubeId = (url: string) => {
      if (!url) return "";
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : "";
    };

    const getThumbnailUrl = (url: string) => {
      const id = getYoutubeId(url);
      if (!id) return "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80";
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    };

    const allLessons = modules.flatMap(m => m.lessons || []);
    const totalLessons = allLessons.length;
    const videoLessons = allLessons.filter(l => l.youtubeUrl);
    const activeStudents = adminProgress?.studentsProgress?.length || 0;
    const completedAulasCount = adminProgress?.studentsProgress?.reduce((acc: number, val: any) => acc + (val.completedLessons || 0), 0) || 0;
    const totalXPDistributed = adminProgress?.studentsProgress?.reduce((acc: number, val: any) => acc + ((val.completedLessons || 0) * 100), 0) || 0;

    // Filters for lists
    const filteredModules = modules.filter(m => {
      if (adminFilterBelt !== 'ALL' && m.beltLevel !== adminFilterBelt) return false;
      if (adminSearch && !m.title.toLowerCase().includes(adminSearch.toLowerCase())) return false;
      return true;
    });

    const filteredLessons = allLessons.filter(l => {
      const parentMod = modules.find(m => m.id === l.moduleId);
      if (adminFilterBelt !== 'ALL' && parentMod?.beltLevel !== adminFilterBelt) return false;
      if (adminSearch && !l.title.toLowerCase().includes(adminSearch.toLowerCase())) return false;
      return true;
    });

    return (
      <div className="space-y-6" id="academy-admin-panel">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-violet-955/40 via-slate-900 to-slate-955 p-6 rounded-2xl border border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white">🛠️ JiuSpeak Academy Manager</h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Painel interno restrito para controle de módulos práticos, publicação de grade de vídeos e monitoramento de alunos.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setEditingModule({ title: "", description: "", beltLevel: "WHITE", orderIndex: modules.length + 1, active: true })}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Novo Módulo
            </button>
            <button
              onClick={() => setEditingLesson({ moduleId: modules[0]?.id || "", title: "", description: "", youtubeUrl: "", xpReward: 100, orderIndex: 1 })}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white border border-indigo-600 rounded-xl font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Nova Lição
            </button>
          </div>
        </div>

        {/* MODAL: Edit/Create Module */}
        {editingModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <form onSubmit={handleSaveModule} className="bg-slate-900 border border-violet-500/30 p-6 rounded-2xl max-w-lg w-full space-y-4 animate-scaleIn">
              <h3 className="font-display font-bold text-base text-white">{editingModule.id ? "Editar Módulo" : "Criar Novo Módulo Acadêmico"}</h3>
              
              <div className="space-y-3 font-sans text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Título do Módulo:</label>
                  <input 
                    type="text" 
                    required 
                    value={editingModule.title} 
                    onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Descrição/Objetivo:</label>
                  <textarea 
                    required 
                    value={editingModule.description} 
                    onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Graduação Vinculada (Faixa):</label>
                    <select 
                      value={editingModule.beltLevel} 
                      onChange={(e) => setEditingModule({ ...editingModule, beltLevel: e.target.value })}
                      className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
                    >
                      <option value="WHITE">WHITE BELT</option>
                      <option value="BLUE">BLUE BELT</option>
                      <option value="PURPLE">PURPLE BELT</option>
                      <option value="BROWN">BROWN BELT</option>
                      <option value="BLACK">BLACK BELT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Ordem (Índice):</label>
                    <input 
                      type="number" 
                      required 
                      value={editingModule.orderIndex} 
                      onChange={(e) => setEditingModule({ ...editingModule, orderIndex: Number(e.target.value) })}
                      className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="module-active"
                    checked={editingModule.active !== false}
                    onChange={(e) => setEditingModule({ ...editingModule, active: e.target.checked })}
                    className="accent-violet-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="module-active" className="text-slate-200 cursor-pointer text-xs font-semibold">Definir como módulo ativo no currículo</label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setEditingModule(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-violet-650 hover:bg-violet-555 text-white rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Gravar Módulo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: Edit/Create Lesson */}
        {editingLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <form onSubmit={handleSaveLesson} className="bg-slate-900 border border-violet-500/30 p-6 rounded-2xl max-w-lg w-full space-y-4 animate-scaleIn">
              <h3 className="font-display font-bold text-base text-white">{editingLesson.id ? "Editar Lição Acadêmica" : "Criar Nova Lição Acadêmica"}</h3>
              
              <div className="space-y-3 font-sans text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Módulo Vinculado:</label>
                  <select 
                    value={editingLesson.moduleId} 
                    onChange={(e) => setEditingLesson({ ...editingLesson, moduleId: e.target.value })}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
                  >
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.title} ({m.beltLevel})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Módulo / Título da Lição:</label>
                  <input 
                    type="text" 
                    required 
                    value={editingLesson.title} 
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Descrição didática / Inglês Técnico:</label>
                  <textarea 
                    required 
                    value={editingLesson.description} 
                    onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 h-20"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">YouTube URL (watch?v=... ou embed ou youtu.be):</label>
                  <input 
                    type="url" 
                    required 
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={editingLesson.youtubeUrl} 
                    onChange={(e) => setEditingLesson({ ...editingLesson, youtubeUrl: e.target.value })}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 font-mono"
                  />
                  <p className="text-[10px] text-slate-550 mt-1 font-sans">
                    Aceita URLs normais do YouTube. O sistema converte automaticamente para incorporação segura.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">XP Recompensado:</label>
                    <input 
                      type="number" 
                      required 
                      value={editingLesson.xpReward} 
                      onChange={(e) => setEditingLesson({ ...editingLesson, xpReward: Number(e.target.value) })}
                      className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Ordem (Índice):</label>
                    <input 
                      type="number" 
                      required 
                      value={editingLesson.orderIndex} 
                      onChange={(e) => setEditingLesson({ ...editingLesson, orderIndex: Number(e.target.value) })}
                      className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-555 text-white rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Salvar Lição
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MAIN CMS FLEX WORKSPACE */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]" id="academy-editor-root">
          {/* LEFT SUBMENU RAIL */}
          <div className="w-full lg:w-64 shrink-0 bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-col gap-1.5 h-fit">
            <div className="pb-3 border-b border-slate-800 px-2 mb-2">
              <h3 className="font-display font-extrabold text-[10px] tracking-wider text-slate-400 uppercase">📚 Academy CMS Menu</h3>
            </div>
            
            <button 
              onClick={() => setAdminSubTab('dashboard')} 
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${adminSubTab === 'dashboard' ? 'bg-violet-650 text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
            >
              <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Dashboard Academy</span>
              <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full font-mono font-bold">Resumo</span>
            </button>

            <button 
              onClick={() => setAdminSubTab('modules')} 
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${adminSubTab === 'modules' ? 'bg-violet-650 text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
            >
              <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Módulos</span>
              <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full font-mono">{modules.length}</span>
            </button>

            <button 
              onClick={() => setAdminSubTab('lessons')} 
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${adminSubTab === 'lessons' ? 'bg-violet-650 text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
            >
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Lições</span>
              <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full font-mono">{totalLessons}</span>
            </button>

            <button 
              onClick={() => setAdminSubTab('videos')} 
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${adminSubTab === 'videos' ? 'bg-violet-650 text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
            >
              <span className="flex items-center gap-2"><Play className="w-4 h-4" /> Vídeos / Players</span>
              <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full font-mono">{videoLessons.length}</span>
            </button>

            <button 
              onClick={() => setAdminSubTab('quizzes')} 
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${adminSubTab === 'quizzes' ? 'bg-violet-650 text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
            >
              <span className="flex items-center gap-2"><Award className="w-4 h-4" /> Quizzes / Exames</span>
              <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full font-mono">{quizQuestions.length}</span>
            </button>

            <button 
              onClick={() => {
                setAdminSubTab('flashcards');
                if (allLessons.length > 0 && !selectedLessonForFlashcards) {
                  setSelectedLessonForFlashcards(allLessons[0].id);
                }
              }} 
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${adminSubTab === 'flashcards' ? 'bg-violet-650 text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
            >
              <span className="flex items-center gap-2"><BookMarked className="w-4 h-4" /> Flashcards</span>
              <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full font-mono">Vocab</span>
            </button>

            <button 
              onClick={() => {
                setAdminSubTab('vocabulary');
                if (allLessons.length > 0 && !selectedLessonForFlashcards) {
                  setSelectedLessonForFlashcards(allLessons[0].id);
                }
              }} 
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${adminSubTab === 'vocabulary' ? 'bg-violet-650 text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
            >
              <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Vocabulário</span>
              <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full font-mono">Dicionário</span>
            </button>

            <button 
              onClick={() => setAdminSubTab('course-order')} 
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${adminSubTab === 'course-order' ? 'bg-violet-650 text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
            >
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Ordem do Curso</span>
              <span className="bg-violet-950 text-[10px] text-violet-400 px-1.5 py-0.5 rounded-full font-bold">D&D</span>
            </button>

            <button 
              onClick={() => {
                setAdminSubTab('preview');
                if (allLessons.length > 0 && !previewLesson) {
                  setPreviewLesson(allLessons[0]);
                }
              }} 
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${adminSubTab === 'preview' ? 'bg-emerald-650 text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-emerald-400'}`}
            >
              <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> Pré-visualização</span>
              <span className="bg-emerald-950 text-[10px] text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">PLAY</span>
            </button>
          </div>

          {/* RIGHT WORKBENCH WORKSPACE PANEL */}
          <div className="flex-1 bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl min-w-0" id="academy-editor-body">
            
            {/* SEARCH AND FILTER BAR (except for Dashboard / Course order / Preview) */}
            {adminSubTab !== 'dashboard' && adminSubTab !== 'course-order' && adminSubTab !== 'preview' && (
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-5 border-b border-slate-850 mb-6 gap-4">
                <div className="relative w-full md:w-72">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filtrar por nome/pesquisar..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full bg-slate-950 pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-850 text-slate-300 focus:outline-none focus:border-violet-500 font-sans"
                  />
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400 text-xs font-sans flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Faixa:
                  </span>
                  {['ALL', 'WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK'].map(b => (
                    <button
                      key={b}
                      onClick={() => setAdminFilterBelt(b)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider cursor-pointer border transition-all ${adminFilterBelt === b ? 'border-violet-500 bg-violet-600/20 text-violet-300' : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/**************************************/}
            {/* SUBTAB: DASHBOARD                  */}
            {/**************************************/}
            {adminSubTab === 'dashboard' && (
              <div className="space-y-6 animate-scaleIn">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-semibold text-lg text-white">Resumo Geral da Academia</h3>
                  <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10">● Servidor Sincronizado</span>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Módulos</p>
                    <p className="text-3xl font-extrabold text-white mt-1 font-display">{modules.length}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Faixas de ensino</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Lições Gravadas</p>
                    <p className="text-3xl font-extrabold text-indigo-400 mt-1 font-display">{totalLessons}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Teóricas & Práticas</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Aulas em Vídeo</p>
                    <p className="text-3xl font-extrabold text-violet-400 mt-1 font-display">{videoLessons.length}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Com player ativo</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Alunos Ativos</p>
                    <p className="text-3xl font-extrabold text-emerald-400 mt-1 font-display">{activeStudents}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">No Tatame Virtual</p>
                  </div>
                </div>

                {/* Extended info widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase font-mono">Estudos Completos</p>
                      <p className="text-xl font-extrabold text-white font-display mt-0.5">{completedAulasCount}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-emerald-500/25 shrink-0" />
                  </div>

                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase font-mono">Tempo Estimado</p>
                      <p className="text-xl font-extrabold text-white font-display mt-0.5">{totalLessons * 10} min</p>
                    </div>
                    <Clock className="w-8 h-8 text-sky-500/25 shrink-0" />
                  </div>

                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase font-mono">XP Recompensada</p>
                      <p className="text-xl font-extrabold text-white font-display mt-0.5">{totalXPDistributed} XP</p>
                    </div>
                    <Coins className="w-8 h-8 text-amber-500/25 shrink-0" />
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="bg-indigo-950/20 border border-indigo-900/30 p-5 rounded-xl space-y-3">
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono">Ações Administrativas Rápidas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <button 
                      onClick={() => setEditingModule({ title: "", description: "", beltLevel: "WHITE", orderIndex: modules.length + 1, active: true })}
                      className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold border border-slate-800 text-left flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4 text-violet-500" /> Adicionar Módulo
                    </button>
                    <button 
                      onClick={() => setEditingLesson({ moduleId: modules[0]?.id || "", title: "", description: "", youtubeUrl: "", xpReward: 100, orderIndex: 1 })}
                      className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold border border-slate-800 text-left flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4 text-indigo-500" /> Adicionar Lição
                    </button>
                    <button 
                      onClick={() => {
                        setAdminSubTab('quizzes');
                        setEditingQuestion({ idx: -1, q: "", options: ["", "", "", ""], answer: 0, explanation: "" });
                        setShowQuestionModal(true);
                      }}
                      className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold border border-slate-800 text-left flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Award className="w-4 h-4 text-amber-500" /> Nova Questão
                    </button>
                    <button 
                      onClick={() => {
                        setAdminSubTab('preview');
                        if (allLessons.length > 0) setPreviewLesson(allLessons[0]);
                      }}
                      className="p-3 bg-emerald-650 hover:bg-emerald-555 text-white rounded-xl font-bold text-center flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Eye className="w-4 h-4" /> Visualizar Curso
                    </button>
                  </div>
                </div>

                {/* Student logs summary */}
                <div className="bg-slate-950 p-4 border border-slate-855 rounded-xl space-y-4">
                  <h4 className="text-white text-xs font-semibold family-display">Alunos Ativos no Currículo</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto font-sans text-xs">
                    {adminProgress?.studentsProgress?.map((student: any) => (
                      <div key={student.id} className="bg-slate-900 border border-slate-855 px-3 py-2.5 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-200">{student.name}</p>
                          <p className="text-[10px] text-slate-550 font-mono">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-indigo-400">{student.completedLessons} Lições feitas</p>
                          <p className="text-[9px] text-slate-500 font-mono">Nível {student.level} • {student.xp} XP</p>
                        </div>
                      </div>
                    ))}
                    {(!adminProgress?.studentsProgress || adminProgress.studentsProgress.length === 0) && (
                      <p className="text-slate-550 text-center py-4 font-mono">Sem dados de atividade no histórico.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/**************************************/}
            {/* SUBTAB: MODULES MANAGER             */}
            {/**************************************/}
            {adminSubTab === 'modules' && (
              <div className="space-y-4 animate-scaleIn">
                <div className="flex justify-between items-center pb-2">
                  <h3 className="font-display font-semibold text-white">Módulos de Estudo ({filteredModules.length})</h3>
                  <p className="text-xs text-slate-400 font-sans">Ordene e duplique módulos rapidamente.</p>
                </div>

                <div className="space-y-2.5">
                  {filteredModules.map((mod, idx) => {
                    const belt = getBeltLabel(mod.beltLevel);
                    return (
                      <div key={mod.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-slate-900/50">
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border truncate uppercase ${belt.bg}`}>
                              {belt.icon} {belt.label}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Ordem: {mod.orderIndex}</span>
                            {!mod.active && <span className="px-1.5 py-0.5 bg-red-950/40 text-red-500 border border-red-950 border-dotted text-[8px] font-mono uppercase rounded">Inativo</span>}
                          </div>
                          <p className="text-xs font-bold text-slate-200 leading-snug">{mod.title}</p>
                          <p className="text-[10px] text-slate-400 truncate leading-relaxed">{mod.description}</p>
                        </div>

                        {/* Control actions */}
                        <div className="flex gap-1.5 shrink-0 w-full md:w-auto justify-end">
                          {/* Reordering Controls */}
                          <button 
                            disabled={idx === 0}
                            onClick={() => {
                              // Swap order up
                              const targetIdx = idx - 1;
                              if (targetIdx >= 0) {
                                const targetMod = filteredModules[targetIdx];
                                const temp = mod.orderIndex;
                                mod.orderIndex = targetMod.orderIndex;
                                targetMod.orderIndex = temp;
                                handleSaveModule({ preventDefault: () => {} } as any);
                              }
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-400 rounded-lg cursor-pointer"
                            title="Subir na lista"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            disabled={idx === filteredModules.length - 1}
                            onClick={() => {
                              // Swap order down
                              const targetIdx = idx + 1;
                              if (targetIdx < filteredModules.length) {
                                const targetMod = filteredModules[targetIdx];
                                const temp = mod.orderIndex;
                                mod.orderIndex = targetMod.orderIndex;
                                targetMod.orderIndex = temp;
                                handleSaveModule({ preventDefault: () => {} } as any);
                              }
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-400 rounded-lg cursor-pointer"
                            title="Descer na lista"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Action triggers */}
                          <button 
                            onClick={() => setEditingModule({ ...mod })}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded-lg text-[10px] font-mono cursor-pointer flex items-center gap-1 border border-slate-800"
                          >
                            <Edit3 className="w-3 h-3 text-violet-400" /> Editar
                          </button>

                          <button 
                            onClick={async () => {
                              const duplicated = {
                                title: `${mod.title} (Cópia)`,
                                description: mod.description,
                                beltLevel: mod.beltLevel,
                                orderIndex: modules.length + 1,
                                active: mod.active
                              };
                              try {
                                const res = await fetch('/api/admin/academy/modules/save', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                  body: JSON.stringify(duplicated)
                                });
                                if ((await res.json()).success) {
                                  showToast("✓ Módulo duplicado com sucesso!", "success");
                                  fetchModules();
                                }
                              } catch(e) {}
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded-lg cursor-pointer flex items-center gap-1 border border-slate-800 text-[10px] font-mono"
                            title="Duplicar módulo"
                          >
                            <Copy className="w-3 h-3 text-sky-400" /> Duplicar
                          </button>

                          <button 
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1.5 bg-red-955/40 hover:bg-red-955 text-red-400 rounded-lg cursor-pointer flex items-center gap-1 border border-red-900/30"
                            title="Excluir módulo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredModules.length === 0 && (
                    <p className="text-center py-12 text-slate-550 font-mono text-xs">Nenhum módulo corresponde aos filtros de busca.</p>
                  )}
                </div>
              </div>
            )}

            {/**************************************/}
            {/* SUBTAB: LESSONS MANAGER             */}
            {/**************************************/}
            {adminSubTab === 'lessons' && (
              <div className="space-y-4 animate-scaleIn">
                <div className="flex justify-between items-center pb-2">
                  <h3 className="font-display font-semibold text-white">Lições Acadêmicas ({filteredLessons.length})</h3>
                  <button 
                    onClick={() => setEditingLesson({ moduleId: modules[0]?.id || "", title: "", description: "", youtubeUrl: "", xpReward: 100, orderIndex: 1 })}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold uppercase transition cursor-pointer"
                  >
                    ➕ Adicionar Lição
                  </button>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredLessons.map((lesson, idx) => {
                    const parentMod = modules.find(m => m.id === lesson.moduleId);
                    const belt = parentMod ? getBeltLabel(parentMod.beltLevel) : null;
                    return (
                      <div key={lesson.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-900/50">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-200">{lesson.title}</p>
                          <p className="text-[10px] text-slate-450 line-clamp-1 leading-relaxed">{lesson.description}</p>
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            {belt && (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${belt.bg}`}>
                                {belt.icon} {belt.label}
                              </span>
                            )}
                            <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/10">+{lesson.xpReward} XP</span>
                            <span className="text-[9px] font-mono text-slate-550">Ordem: {lesson.orderIndex}</span>
                            <span className="text-[9px] font-mono text-slate-550 underline truncate max-w-xs">{lesson.youtubeUrl}</span>
                          </div>
                        </div>

                        {/* Quick lesson edit actions */}
                        <div className="flex gap-1.5 shrink-0 select-none w-full md:w-auto justify-end">
                          <button 
                            onClick={() => setEditingLesson({ ...lesson })}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded-lg text-[10px] font-mono cursor-pointer flex items-center gap-1 border border-slate-800"
                          >
                            <Edit3 className="w-3 h-3 text-violet-400" /> Editar
                          </button>

                          <button 
                            onClick={async () => {
                              const duplicated = {
                                moduleId: lesson.moduleId,
                                title: `${lesson.title} (Cópia)`,
                                description: lesson.description,
                                youtubeUrl: lesson.youtubeUrl,
                                xpReward: lesson.xpReward,
                                orderIndex: lesson.orderIndex + 1
                              };
                              try {
                                const res = await fetch('/api/admin/academy/lessons/save', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                  body: JSON.stringify(duplicated)
                                });
                                if ((await res.json()).success) {
                                  showToast("✓ Lição duplicada no módulo!", "success");
                                  fetchModules();
                                }
                              } catch(e) {}
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-355 rounded-lg cursor-pointer flex items-center gap-1 border border-slate-800 text-[10px] font-mono font-bold"
                            title="Duplicar lição"
                          >
                            <Copy className="w-3 h-3 text-sky-400" /> Duplicar
                          </button>

                          <button 
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="p-1.5 bg-red-955/40 hover:bg-red-955 text-red-450 rounded-lg cursor-pointer flex items-center border border-red-900/30"
                            title="Remover lição"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredLessons.length === 0 && (
                    <p className="text-center py-12 text-slate-550 font-mono text-xs">Nenhuma lição encontrada para os termos inseridos.</p>
                  )}
                </div>
              </div>
            )}

            {/**************************************/}
            {/* SUBTAB: VIDEOS MANAGER              */}
            {/**************************************/}
            {adminSubTab === 'videos' && (
              <div className="space-y-4 animate-scaleIn">
                <div className="pb-2 border-b border-slate-850">
                  <h3 className="font-display font-semibold text-white">Central de Vídeos dos Players</h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Foque em gerenciar URLs incorporadas oficial do YouTube, Thumbnails e tempos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {filteredLessons.map(lesson => {
                    const thumb = getThumbnailUrl(lesson.youtubeUrl);
                    const vId = getYoutubeId(lesson.youtubeUrl);
                    return (
                      <div key={lesson.id} className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex flex-col justify-between">
                        <div>
                          {/* Thumbnail display */}
                          <div className="relative aspect-video bg-slate-900 w-full group overflow-hidden">
                            <img 
                              src={thumb} 
                              alt="Thumbnail" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.target as any).src = "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80";
                              }}
                            />
                            {vId ? (
                              <span className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur text-[9px] text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-bold">
                                YouTube ID: {vId}
                              </span>
                            ) : (
                              <span className="absolute bottom-2 right-2 bg-red-950/90 backdrop-blur text-[9px] text-red-400 font-mono px-2 py-0.5 rounded border border-red-550/20 uppercase font-bold">
                                Sem ID Ativo
                              </span>
                            )}
                          </div>

                          <div className="p-4 space-y-2">
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-1 leading-snug">{lesson.title}</h4>
                            <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">{lesson.description}</p>
                          </div>
                        </div>

                        {/* Inline Quick Edit of Video Link */}
                        <div className="p-4 pt-0 border-t border-slate-850 bg-slate-950 flex flex-col gap-2">
                          <div className="space-y-1 pt-3">
                            <label className="text-[9px] text-slate-500 uppercase font-mono font-bold">URL Oficial do Player:</label>
                            <input 
                              type="text"
                              value={lesson.youtubeUrl}
                              onChange={async (e) => {
                                const newUrl = e.target.value;
                                lesson.youtubeUrl = newUrl;
                                // Save modification instantly to server
                                try {
                                  await fetch('/api/admin/academy/lessons/save', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                    body: JSON.stringify(lesson)
                                  });
                                } catch(err) {}
                              }}
                              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono text-slate-350 focus:border-violet-500 focus:outline-none"
                              placeholder="Faltando link do YouTube..."
                            />
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[9px] text-slate-550 font-mono">Recompensa: +{lesson.xpReward} XP</span>
                            <button 
                              onClick={() => setEditingLesson({ ...lesson })}
                              className="px-2.5 py-1 text-[9px] font-bold font-mono uppercase text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              Editar Lição Completa
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredLessons.length === 0 && (
                    <p className="text-center py-12 text-slate-550 font-mono text-xs col-span-2">Nenhum vídeo acadêmico disponível.</p>
                  )}
                </div>
              </div>
            )}

            {/**************************************/}
            {/* SUBTAB: QUIZZES MANAGER             */}
            {/**************************************/}
            {adminSubTab === 'quizzes' && (
              <div className="space-y-4 animate-scaleIn">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <div>
                    <h3 className="font-display font-semibold text-white">Banco de Questões / Exame de Graduação</h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">Gerencie os exames teóricos de graduação técnica.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingQuestion({ idx: -1, q: "", options: ["", "", "", ""], answer: 0, explanation: "" });
                      setShowQuestionModal(true);
                    }}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                  >
                    ➕ Adicionar Questão
                  </button>
                </div>

                {/* MODAL / FORM: Adding & Editing Question */}
                {showQuestionModal && editingQuestion && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-violet-500/30 p-6 rounded-2xl max-w-lg w-full space-y-4 font-sans text-xs">
                      <h3 className="font-display font-bold text-sm text-white">
                        {editingQuestion.idx !== -1 ? `Editar Questão #${editingQuestion.idx + 1}` : "Inserir Nova Pergunta Teórica"}
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-450 block mb-1">Enunciado da pergunta:</label>
                          <textarea 
                            required
                            value={editingQuestion.q}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, q: e.target.value })}
                            className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg w-full text-slate-100 font-bold"
                            placeholder="Ex: Qual palavra traduz o golpe 'Montada'?"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-slate-450 block font-bold leading-relaxed">Alternativas:</label>
                          {editingQuestion.options.map((opt: string, optI: number) => (
                            <div key={optI} className="flex gap-2 items-center">
                              <span className="font-mono text-[10px] font-bold text-slate-500 w-5">
                                {optI === 0 ? "A" : optI === 1 ? "B" : optI === 2 ? "C" : "D"}
                              </span>
                              <input 
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => {
                                  const clonedOpts = [...editingQuestion.options];
                                  clonedOpts[optI] = e.target.value;
                                  setEditingQuestion({ ...editingQuestion, options: clonedOpts });
                                }}
                                className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex-1 text-slate-200"
                                placeholder={`Ex: Mount para opção ${optI + 1}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="text-slate-450 block mb-1">Opção Correta:</label>
                          <select
                            value={editingQuestion.answer}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: Number(e.target.value) })}
                            className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg w-full text-slate-200 font-mono font-bold"
                          >
                            <option value={0}>OPÇÃO A</option>
                            <option value={1}>OPÇÃO B</option>
                            <option value={2}>OPÇÃO C</option>
                            <option value={3}>OPÇÃO D</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-450 block mb-1">Explicação Teórica (Feedback Acadêmico):</label>
                          <textarea 
                            value={editingQuestion.explanation}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                            className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg w-full text-slate-305"
                            placeholder="Diga por que essa é a alternativa correta e o contexto técnico para ajudar no inglês."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                        <button 
                          onClick={() => {
                            setShowQuestionModal(false);
                            setEditingQuestion(null);
                          }}
                          className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg font-bold hover:text-slate-300 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => {
                            const updatedList = [...quizQuestions];
                            if (editingQuestion.idx !== -1) {
                              updatedList[editingQuestion.idx] = {
                                q: editingQuestion.q,
                                options: editingQuestion.options,
                                answer: editingQuestion.answer,
                                explanation: editingQuestion.explanation
                              };
                            } else {
                              updatedList.push({
                                q: editingQuestion.q,
                                options: editingQuestion.options,
                                answer: editingQuestion.answer,
                                explanation: editingQuestion.explanation
                              });
                            }
                            updateQuizQuestions(updatedList);
                            setShowQuestionModal(false);
                            setEditingQuestion(null);
                            showToast("✓ Questões do exame salvas com sucesso!", "success");
                          }}
                          className="px-4 py-1.5 bg-violet-650 hover:bg-violet-555 text-white rounded-lg font-bold cursor-pointer"
                        >
                          Salvar Questão
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Inventory List */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 hover:bg-slate-900/40 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-505/10 font-mono uppercase font-bold">Questão #{idx + 1}</span>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingQuestion({ idx, ...q });
                              setShowQuestionModal(true);
                            }}
                            className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 rounded font-mono text-[9px]"
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm("Remover esta questão do exame final permanentemente?")) {
                                const list = quizQuestions.filter((_, i) => i !== idx);
                                updateQuizQuestions(list);
                                showToast("✓ Questão eliminada do exame com sucesso!", "success");
                              }
                            }}
                            className="p-1 bg-red-955/40 hover:bg-red-955 border border-red-900/30 text-red-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="font-bold text-xs text-slate-200 mt-1">{q.q}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-sans text-slate-400 pt-1">
                        {q.options.map((opt, oI) => (
                          <div 
                            key={oI} 
                            className={`p-2 rounded-lg border ${oI === q.answer ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold' : 'border-slate-850 bg-slate-950/50 text-slate-350'}`}
                          >
                            <span className="font-mono font-extrabold pr-1.5 text-slate-500">{oI === 0 ? "A" : oI === 1 ? "B" : oI === 2 ? "C" : "D"}:</span> {opt}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-855 rounded-xl text-[10px] text-slate-450 leading-relaxed font-sans">
                        💡 <strong className="text-slate-300">Explicação didática:</strong> {q.explanation}
                      </div>
                    </div>
                  ))}
                  {quizQuestions.length === 0 && (
                    <p className="text-center py-12 text-slate-550 font-mono text-xs">Exame sem questões ativas. Crie novos enunciados.</p>
                  )}
                </div>
              </div>
            )}

            {/**************************************/}
            {/* SUBTAB: FLASHCARDS MANAGER          */}
            {/**************************************/}
            {adminSubTab === 'flashcards' && (
              <div className="space-y-4 animate-scaleIn">
                <div className="pb-3 border-b border-slate-850 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display font-semibold text-white">Gerenciador de Flashcards Técnicos</h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-sans">Vincule e edite flashcards específicos para fixação de termos por lição.</p>
                    </div>

                    <button
                      onClick={() => {
                        if (!selectedLessonForFlashcards) {
                          showToast("Por favor, selecione ou crie uma lição primeiro.", "error");
                          return;
                        }
                        setEditingFlashcard({ idx: -1, term: "", phonetic: "", translation: "", bjjContext: "" });
                        setShowFlashcardModal(true);
                      }}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10px] font-bold uppercase shrink-0 transition cursor-pointer"
                    >
                      ➕ Adicionar Card
                    </button>
                  </div>

                  {/* Dropdown to SELECT Lesson for vocabulary study */}
                  <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850 flex-wrap">
                    <label className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold shrink-0">Filtrar por Lição Ativa:</label>
                    <select
                      value={selectedLessonForFlashcards}
                      onChange={(e) => setSelectedLessonForFlashcards(e.target.value)}
                      className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-slate-200 flex-1 font-mono outline-none cursor-pointer"
                    >
                      {allLessons.map(l => (
                        <option key={l.id} value={l.id}>{l.title} ({modules.find(m => m.id === l.moduleId)?.beltLevel})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* MODAL / FORM: Adding & Editing Flashcard */}
                {showFlashcardModal && editingFlashcard && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-violet-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 font-sans text-xs">
                      <h3 className="font-display font-bold text-sm text-white">
                        {editingFlashcard.idx !== -1 ? "Editar Flashcard Técnico" : "Adicionar Novo Flashcard"}
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-450 block mb-1">Termo em Inglês (Ex: Posture):</label>
                          <input 
                            type="text"
                            required
                            value={editingFlashcard.term}
                            onChange={(e) => setEditingFlashcard({ ...editingFlashcard, term: e.target.value })}
                            className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg w-full text-slate-100 font-bold"
                            placeholder="Posture"
                          />
                        </div>

                        <div>
                          <label className="text-slate-455 block mb-1">Pronúncia Fonética (Fonética - Ex: /ˈpɒs.tʃər/):</label>
                          <input 
                            type="text"
                            required
                            value={editingFlashcard.phonetic}
                            onChange={(e) => setEditingFlashcard({ ...editingFlashcard, phonetic: e.target.value })}
                            className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg w-full text-slate-200 font-mono"
                            placeholder="/ˈpɒs.tʃər/"
                          />
                        </div>

                        <div>
                          <label className="text-slate-450 block mb-1">Tradução em Português (Ex: Postura):</label>
                          <input 
                            type="text"
                            required
                            value={editingFlashcard.translation}
                            onChange={(e) => setEditingFlashcard({ ...editingFlashcard, translation: e.target.value })}
                            className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg w-full text-slate-200"
                            placeholder="Postura"
                          />
                        </div>

                        <div>
                          <label className="text-slate-450 block mb-1">Contexto Técnico no Jiu-Jitsu (BJJ Context em Inglês):</label>
                          <textarea 
                            required
                            value={editingFlashcard.bjjContext}
                            onChange={(e) => setEditingFlashcard({ ...editingFlashcard, bjjContext: e.target.value })}
                            className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg w-full text-slate-300"
                            placeholder="Ex: Crucial inside guard to prevent submissions."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                        <button 
                          onClick={() => {
                            setShowFlashcardModal(false);
                            setEditingFlashcard(null);
                          }}
                          className="px-3 py-1.5 bg-slate-800 text-slate-450 rounded-lg hover:text-slate-300 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => {
                            const deck = [...(vocabularyFlashcards[selectedLessonForFlashcards] || [])];
                            if (editingFlashcard.idx !== -1) {
                              deck[editingFlashcard.idx] = {
                                term: editingFlashcard.term,
                                phonetic: editingFlashcard.phonetic,
                                translation: editingFlashcard.translation,
                                bjjContext: editingFlashcard.bjjContext
                              };
                            } else {
                              deck.push({
                                term: editingFlashcard.term,
                                phonetic: editingFlashcard.phonetic,
                                translation: editingFlashcard.translation,
                                bjjContext: editingFlashcard.bjjContext
                              });
                            }
                            const updatedVocab = { ...vocabularyFlashcards, [selectedLessonForFlashcards]: deck };
                            updateVocabularyFlashcards(updatedVocab);
                            setShowFlashcardModal(false);
                            setEditingFlashcard(null);
                            showToast("✓ Flashcards salvos com sucesso!", "success");
                          }}
                          className="px-4 py-1.5 bg-violet-650 hover:bg-violet-555 text-white rounded-lg font-bold cursor-pointer"
                        >
                          Salvar Card
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Display active list for selected lesson */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                  {(vocabularyFlashcards[selectedLessonForFlashcards] || []).map((card, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-wider">Card #{idx + 1}</span>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingFlashcard({ idx, ...card });
                                setShowFlashcardModal(true);
                              }}
                              className="text-[9px] font-mono hover:text-white text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Deseja realmente excluir este flashcard da lição?")) {
                                  const list = (vocabularyFlashcards[selectedLessonForFlashcards] || []).filter((_, i) => i !== idx);
                                  const updated = { ...vocabularyFlashcards, [selectedLessonForFlashcards]: list };
                                  updateVocabularyFlashcards(updated);
                                  showToast("✓ Card removido do baralho!", "success");
                                }
                              }}
                              className="text-red-450 bg-red-955/20 border border-red-955 px-1 rounded hover:bg-red-955 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="font-extrabold text-sm text-indigo-400">{card.term}</p>
                          <p className="text-[10px] font-mono text-slate-500">{card.phonetic}</p>
                        </div>
                        <p className="text-xs text-slate-200 leading-snug"><strong className="text-slate-500">Tradução:</strong> {card.translation}</p>
                        <p className="text-[11px] text-slate-400 italic leading-relaxed">"{card.bjjContext}"</p>
                      </div>
                    </div>
                  ))}
                  {(!vocabularyFlashcards[selectedLessonForFlashcards] || vocabularyFlashcards[selectedLessonForFlashcards].length === 0) && (
                    <div className="bg-slate-950 border border-slate-850 border-dashed rounded-xl p-8 text-center col-span-2 space-y-2">
                      <p className="text-slate-550 text-xs font-mono">Sem flashcards técnicos configurados nesta lição.</p>
                      <button 
                        onClick={() => {
                          setEditingFlashcard({ idx: -1, term: "", phonetic: "", translation: "", bjjContext: "" });
                          setShowFlashcardModal(true);
                        }}
                        className="text-[10px] px-3 py-1 bg-violet-650 hover:bg-violet-555 text-white rounded-lg font-bold cursor-pointer"
                      >
                        ➕ Criar primeiro card
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/**************************************/}
            {/* SUBTAB: VOCABULARIO MANAGER         */}
            {/**************************************/}
            {adminSubTab === 'vocabulary' && (
              <div className="space-y-4 animate-scaleIn">
                <div className="pb-3 border-b border-slate-850">
                  <h3 className="font-display font-semibold text-white">Dicionário e Banco de Vocabulário Técnico</h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Defina correspondência técnica de termos do jiu-jitsu em inglês / português.</p>
                </div>

                <div className="flex gap-2 bg-slate-950 p-4 rounded-xl border border-slate-850 items-center justify-between flex-wrap">
                  <span className="text-xs font-sans text-slate-350">Selecione uma lição para ver seu glossário estruturado ou editar termos.</span>
                  <select 
                    value={selectedLessonForFlashcards}
                    onChange={(e) => setSelectedLessonForFlashcards(e.target.value)}
                    className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 font-mono outline-none cursor-pointer"
                  >
                    {allLessons.map(l => (
                      <option key={l.id} value={l.id}>{l.title} ({modules.find(m => m.id === l.moduleId)?.beltLevel})</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-x-auto overflow-y-auto max-h-[450px] font-sans text-xs">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-mono text-[9px] uppercase tracking-wider border-b border-slate-800">
                        <th className="p-3">Inglês Técnico</th>
                        <th className="p-3">Phonetic</th>
                        <th className="p-3">Tradução Oficial</th>
                        <th className="p-3">Contexto (Prático)</th>
                        <th className="p-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(vocabularyFlashcards[selectedLessonForFlashcards] || []).map((v, i) => (
                        <tr key={i} className="border-b border-slate-855 hover:bg-slate-900/40">
                          <td className="p-3 font-bold text-indigo-400 font-mono">{v.term}</td>
                          <td className="p-3 font-mono text-slate-500">{v.phonetic}</td>
                          <td className="p-3 text-slate-200">{v.translation}</td>
                          <td className="p-3 text-slate-400 italic">"{v.bjjContext}"</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setEditingFlashcard({ idx: i, ...v });
                                setShowFlashcardModal(true);
                              }}
                              className="text-violet-400 hover:text-violet-300 font-bold font-mono text-[10px] cursor-pointer"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!vocabularyFlashcards[selectedLessonForFlashcards] || vocabularyFlashcards[selectedLessonForFlashcards].length === 0) && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">Nenhum termo técnico registrado nesta lição acadêmica.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/**************************************/}
            {/* SUBTAB: COURSE ORDER                */}
            {/**************************************/}
            {adminSubTab === 'course-order' && (
              <div className="space-y-4 animate-scaleIn">
                <div className="pb-3 border-b border-slate-850">
                  <h3 className="font-display font-semibold text-white">Estrutura e Ordem do Currículo</h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Visualize a árvore didática estrutural completa de ponta a ponta e reordene usando controles de um clique.</p>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {modules.map((mod, modIdx) => {
                    const belt = getBeltLabel(mod.beltLevel);
                    return (
                      <div key={mod.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-lg border border-slate-850">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-550 text-xs font-bold">#{modIdx + 1}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase truncate border ${belt.bg}`}>
                              {belt.icon} {belt.label}
                            </span>
                            <span className="text-xs font-bold text-slate-200 truncate">{mod.title}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 select-none">
                            <button 
                              disabled={modIdx === 0}
                              onClick={async () => {
                                // Swap up
                                const prevMod = modules[modIdx - 1];
                                const temp = mod.orderIndex;
                                mod.orderIndex = prevMod.orderIndex;
                                prevMod.orderIndex = temp;
                                try {
                                  await fetch('/api/admin/academy/modules/save', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                    body: JSON.stringify(mod)
                                  });
                                  await fetch('/api/admin/academy/modules/save', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                    body: JSON.stringify(prevMod)
                                  });
                                  showToast("✓ Ordem do módulo alterada com sucesso!", "success");
                                  fetchModules();
                                } catch(e) {}
                              }}
                              className="p-1 px-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-20 text-slate-400 rounded cursor-pointer text-xs"
                              title="Mover módulo para cima"
                            >
                              ⬆️
                            </button>
                            <button 
                              disabled={modIdx === modules.length - 1}
                              onClick={async () => {
                                // Swap down
                                const nextMod = modules[modIdx + 1];
                                const temp = mod.orderIndex;
                                mod.orderIndex = nextMod.orderIndex;
                                nextMod.orderIndex = temp;
                                try {
                                  await fetch('/api/admin/academy/modules/save', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                    body: JSON.stringify(mod)
                                  });
                                  await fetch('/api/admin/academy/modules/save', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                    body: JSON.stringify(nextMod)
                                  });
                                  showToast("✓ Ordem do módulo alterada com sucesso!", "success");
                                  fetchModules();
                                } catch(e) {}
                              }}
                              className="p-1 px-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-20 text-slate-400 rounded cursor-pointer text-xs"
                              title="Mover módulo para baixo"
                            >
                              ⬇️
                            </button>
                          </div>
                        </div>

                        {/* Lessons nested rail under module */}
                        <div className="pl-4 space-y-1 border-l border-slate-850">
                          {mod.lessons && [...mod.lessons].sort((a,b) => a.orderIndex - b.orderIndex).map((les, lesIdx, lesArr) => (
                            <div key={les.id} className="bg-slate-900 border border-slate-855 px-3 py-2 rounded-lg flex justify-between items-center text-xs">
                              <span className="text-slate-400 truncate flex-1 leading-snug">
                                <span className="font-mono text-[9px] text-slate-600 mr-2">Ordem {les.orderIndex} •</span> {les.title}
                              </span>

                              <div className="flex gap-1 shrink-0 select-none">
                                <button 
                                  disabled={lesIdx === 0}
                                  onClick={async () => {
                                    const prevLes = lesArr[lesIdx - 1];
                                    const temp = les.orderIndex;
                                    les.orderIndex = prevLes.orderIndex;
                                    prevLes.orderIndex = temp;
                                    try {
                                      await fetch('/api/admin/academy/lessons/save', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                        body: JSON.stringify(les)
                                      });
                                      await fetch('/api/admin/academy/lessons/save', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                        body: JSON.stringify(prevLes)
                                      });
                                      showToast("✓ Ordem da lição modificada com sucesso!", "success");
                                      fetchModules();
                                    } catch(e) {}
                                  }}
                                  className="p-0.5 px-1 bg-slate-950 hover:bg-slate-800 disabled:opacity-20 text-slate-400 rounded cursor-pointer text-[10px]"
                                  title="Subir lição"
                                >
                                  ⬆️
                                </button>
                                <button 
                                  disabled={lesIdx === lesArr.length - 1}
                                  onClick={async () => {
                                    const nextLes = lesArr[lesIdx + 1];
                                    const temp = les.orderIndex;
                                    les.orderIndex = nextLes.orderIndex;
                                    nextLes.orderIndex = temp;
                                    try {
                                      await fetch('/api/admin/academy/lessons/save', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                        body: JSON.stringify(les)
                                      });
                                      await fetch('/api/admin/academy/lessons/save', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                                        body: JSON.stringify(nextLes)
                                      });
                                      showToast("✓ Ordem da lição modificada com sucesso!", "success");
                                      fetchModules();
                                    } catch(e) {}
                                  }}
                                  className="p-0.5 px-1 bg-slate-950 hover:bg-slate-800 disabled:opacity-20 text-slate-400 rounded cursor-pointer text-[10px]"
                                  title="Descer lição"
                                >
                                  ⬇️
                                </button>
                              </div>
                            </div>
                          ))}
                          {(!mod.lessons || mod.lessons.length === 0) && (
                            <p className="text-slate-550 text-[10px] font-mono italic pl-2">Nenhuma lição vinculada a este módulo.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/**************************************/}
            {/* SUBTAB: COURSE PREVIEW              */}
            {/**************************************/}
            {adminSubTab === 'preview' && previewLesson && (
              <div className="space-y-4 animate-scaleIn">
                <div className="pb-3 border-b border-slate-850 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-white">Simulador de Aluno - Premium Player</h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">Visualize e teste a navegação do player tal como o aluno interage.</p>
                  </div>
                  <button 
                    onClick={() => setPreviewMuted(!previewMuted)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-slate-700 transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> {previewMuted ? "Mutado (Muted)" : "Som Ativo (Unmuted)"}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Student View Official Player */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="aspect-video bg-black rounded-2xl border border-slate-800 overflow-hidden relative shadow-lg shadow-black/40">
                      {getYoutubeId(previewLesson.youtubeUrl) ? (
                        <iframe 
                          src={`https://www.youtube.com/embed/${getYoutubeId(previewLesson.youtubeUrl)}?autoplay=1&mute=${previewMuted ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1`}
                          title={previewLesson.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-center p-6 space-y-2">
                          <Play className="w-12 h-12 text-slate-700 animate-pulse" />
                          <p className="text-xs font-semibold text-white">Vídeo ainda não cadastrado.</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase border border-emerald-500/25 font-bold">PREVIEW MODE</span>
                        <span className="font-mono text-[9px] text-slate-500">+{previewLesson.xpReward} XP Recompensa</span>
                      </div>
                      <h4 className="font-display font-extrabold text-white text-base leading-snug">{previewLesson.title}</h4>
                      <p className="text-xs text-slate-350 leading-relaxed font-sans">{previewLesson.description}</p>
                    </div>
                  </div>

                  {/* Navigation simulator */}
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3 flex flex-col h-[400px]">
                    <h5 className="font-display font-bold text-slate-300 text-[10px] uppercase tracking-wider font-mono">Navegar como Aluno:</h5>
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-sans text-xs">
                      {modules.map(mod => (
                        <div key={mod.id} className="space-y-1">
                          <p className="text-[9px] text-slate-500 font-mono font-bold uppercase leading-none pt-2">{mod.title}</p>
                          <div className="space-y-1 pl-1">
                            {mod.lessons && [...mod.lessons].sort((a,b) => a.orderIndex - b.orderIndex).map(les => (
                              <button
                                key={les.id}
                                onClick={() => setPreviewLesson(les)}
                                className={`w-full text-left p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${previewLesson.id === les.id ? 'bg-violet-650 border-violet-500 text-white font-bold' : 'bg-slate-900/50 border-slate-855 text-slate-450 hover:text-slate-200'}`}
                              >
                                <span className="truncate flex-1 pr-2">{les.title}</span>
                                <Play className="w-3 h-3 shrink-0 opacity-70" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // Fallback if current active sub-tab module does not exist (not loaded yet)
  if (!currentModule) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-violet-950/40 via-indigo-950/20 to-slate-950 p-6 rounded-2xl border border-slate-900 flex justify-between items-center gap-4 flex-wrap">
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-2xl text-white">🥋 Módulos de Combate</h2>
            <p className="text-xs text-slate-400 font-sans">
              Cada faixa possui suas próprias lições e exames práticos em inglês tático para alavancar seu nível.
            </p>
          </div>
        </div>
        <div className="p-12 text-center text-slate-400 font-mono text-xs border border-slate-850/50 rounded-2xl bg-slate-900/60 transition-all max-w-lg mx-auto">
          🚫 Este módulo belt está temporariamente bloqueado ou vazio. Conclua os módulos anteriores de graduações menores do tatame!
        </div>
      </div>
    );
  }

  // Active Belt Path Main Node View
  const completedCount = currentModule.lessons.filter(l => l.completed).length;
  const totalCount = currentModule.lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const beltLabelMeta = getBeltLabel(currentModule.beltLevel);

  return (
    <div className="space-y-6" id="academy-belt-path-view">
      {/* Upper overview header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#070a13] to-slate-950 p-6 rounded-2xl border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="space-y-1.5 flex-1 w-full">
          <div className="flex items-center gap-2">
            <span className="text-xl">{beltLabelMeta.icon}</span>
            <span className="text-[10px] font-mono tracking-widest text-violet-300 uppercase font-black">GRADUAÇÃO {beltLabelMeta.label}</span>
          </div>
          <h2 className="font-display font-black text-2xl text-white tracking-tight leading-none mt-1">{currentModule.title}</h2>
          <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed mt-1.5">{currentModule.description}</p>
          
          <div className="pt-3">
            <button
              onClick={startCourseMode}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs uppercase cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-100 shadow-lg shadow-violet-600/10"
            >
              ▶ Iniciar Curso
            </button>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col items-center justify-center shrink-0 w-full md:w-fit text-center space-y-1 min-w-36">
          <span className="text-[10.5px] font-mono text-slate-500 uppercase tracking-wider">Aulas Concluídas</span>
          <span className="text-xl font-mono text-violet-300 font-black tracking-tight">{completedCount} / {totalCount}</span>
          <div className="w-24 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-1">
            <div 
              className="bg-violet-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Duolingo-style Lesson Path Node Tree representation */}
      <div className="bg-[#070a13]/25 border border-slate-900/60 p-8 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center py-12">
        <div className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 left-1/2 -ml-0.75 z-0" />

        <div className="flex flex-col items-center w-full max-w-md space-y-8 relative z-10">
          
          {currentModule.lessons.map((lesson, idx) => {
            const isSelectableValue = idx === 0 || currentModule.lessons[idx - 1]?.completed;
            const shiftClass = idx % 2 === 0 ? "translate-x-4 md:translate-x-8" : "-translate-x-4 md:-translate-x-8";
            
            return (
              <div key={lesson.id} className={`flex flex-col items-center transition-all ${shiftClass}`}>
                
                {lesson.orderIndex === 10 ? (
                  // Exclusive UI styling render for the interactive graduate challenge exam
                  <button
                    onClick={() => {
                      if (!isSelectableValue) {
                        showToast(`🚨 Bloqueado! Você precisa passar em todas as 9 aulas do módulo antes do Exame Final!`, "error");
                        return;
                      }
                      setQuizActive(true);
                      setQuizQuestionIndex(0);
                      setQuizAnswers([]);
                      setQuizScore(null);
                      setActiveLesson(lesson);
                    }}
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl transition-all cursor-pointer border-3 relative z-10 shadow-2xl ${
                      lesson.completed
                        ? 'bg-gradient-to-tr from-yellow-500 via-amber-600 to-orange-500 border-yellow-300 text-slate-950 scale-105'
                        : (isSelectableValue 
                            ? 'bg-slate-900 hover:bg-slate-800 border-yellow-500 text-yellow-500 animate-pulse'
                            : 'bg-slate-950 border-slate-850 text-slate-650 cursor-not-allowed')
                    }`}
                    title={lesson.title}
                  >
                    <span>🎓</span>
                    
                    {/* Ring orbit representation */}
                    <div className="absolute inset-0 border-2 border-dashed border-violet-500/20 rounded-3xl animate-[spin_20s_infinite_linear]" />
                  </button>
                ) : (
                  // Traditional circular lesson node
                  <button
                    onClick={() => {
                      if (!isSelectableValue) {
                        showToast(`🚨 Bloqueado! Conclua a aula ${idx} primeiro antes de desbloquear esta etapa!`, "error");
                        return;
                      }
                      setActiveLesson(lesson);
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all relative z-10 shadow-lg border-2.5 cursor-pointer ${
                      lesson.completed
                        ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white'
                        : (isSelectableValue
                            ? 'bg-slate-900 hover:bg-slate-800 border-violet-500 text-violet-300 ring-2 ring-violet-500/10'
                            : 'bg-slate-950 border-slate-850 text-slate-600 cursor-not-allowed')
                    }`}
                    title={lesson.title}
                  >
                    {lesson.completed ? "✓" : (idx + 1)}
                  </button>
                )}

                <div className="text-center mt-2.5 max-w-xs bg-slate-950/90 p-2.5 rounded-xl border border-slate-900 leading-snug">
                  <span className="block text-[10.5px] font-sans font-bold text-slate-200">{lesson.title}</span>
                  <span className="text-[9px] font-mono text-slate-500 block uppercase pt-0.5">+{lesson.xpReward} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlay Graduation Quiz Modal Panel */}
      {quizActive && activeLesson && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-violet-500/30 rounded-2xl max-w-2xl w-full p-6 space-y-6 animate-scaleIn shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest font-bold block">EXAME DE GRADUAÇÃO NACIONAL / INTERNACIONAL</span>
                <h3 className="font-display font-extrabold text-base text-white">White Belt Final Graduation</h3>
              </div>
              <button 
                onClick={() => {
                  setQuizActive(false);
                  setActiveLesson(null);
                }}
                className="p-1 px-2.5 bg-slate-850 hover:bg-slate-800 rounded font-mono text-slate-400 text-xs text-right cursor-pointer"
              >
                Sair do Exame
              </button>
            </div>

            {quizScore !== null ? (
              <div className="text-center space-y-4 py-8">
                <span className="text-5xl">👑</span>
                <h4 className="font-display font-extrabold text-xl text-white">Exame Finalizado!</h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm mx-auto">
                  Seu aproveitamento conceitual tático de tradução foi de <strong>{quizScore}%</strong>.
                </p>

                {quizScore >= 70 ? (
                  <div className="space-y-4 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl inline-block max-w-sm">
                    <p className="text-emerald-300 text-xs font-semibold">✓ APROVADO! Você atendeu ao score tático de fluência.</p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      A medalha de prestígio **White Belt Graduate** foi injetada em sua mochila e o diploma de graduado está liberado no painel 'Certificados'!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-4 bg-red-950/20 border border-red-500/20 rounded-xl inline-block max-w-sm">
                    <p className="text-red-300 text-xs font-semibold">🚨 REPROVADO!</p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Para aprovação você precisa obter no mínimo de **70%** de aproveitamento dos vocabulários. Estude as apostilas, assista aos vídeos e tente novamente!
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setQuizActive(false);
                      setActiveLesson(null);
                      setQuizScore(null);
                    }}
                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Estudar de Volta
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-violet-500 h-full transition-all duration-300"
                    style={{ width: `${((quizQuestionIndex) / quizQuestions.length) * 100}%` }}
                  />
                </div>

                <div className="space-y-5">
                  <span className="text-[10px] font-mono text-slate-500">QUESTÃO {quizQuestionIndex + 1} DE {quizQuestions.length}</span>
                  <p className="text-sm text-slate-200 font-bold leading-relaxed">{quizQuestions[quizQuestionIndex].q}</p>
                  
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {quizQuestions[quizQuestionIndex].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        className="w-full text-left p-4 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-850 hover:border-violet-500 text-xs font-sans text-slate-350 transition-colors cursor-pointer"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
