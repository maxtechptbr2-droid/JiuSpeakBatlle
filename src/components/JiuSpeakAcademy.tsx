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
  BookMarked
} from 'lucide-react';
import { UserProfile } from '../types';

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

export default function JiuSpeakAcademy({ activeSubTab, setCurrentTab, user, updateUser, showToast }: JiuSpeakAcademyProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
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
  const vocabularyFlashcards: Record<string, { term: string; phonetic: string; translation: string; bjjContext: string }[]> = {
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

  // Sample dynamic flashcard deck
  const generalFlashcards = [
    { term: "Choke", phonetic: "/tʃəʊk/", translation: "Estrangulamento", bjjContext: "Applying carotid pressure." },
    { term: "Pass the Guard", phonetic: "/pæs ðə ɡɑːd/", translation: "Passar a Guarda", bjjContext: "Getting past the defense legs." },
    { term: "Sweep", phonetic: "/swiːp/", translation: "Raspagem", bjjContext: "Reversing from guard bottom to top position." },
    { term: "Half Guard", phonetic: "/hɑːf ɡɑːd/", translation: "Meia Guarda", bjjContext: "Controlling one leg of top opponent." },
    { term: "Full Mount", phonetic: "/fʊl maʊnt/", translation: "Montada Completa", bjjContext: "Dominant chest on chest seat atop." }
  ];

  // Technical English Quiz Questions for White Belt final graduation test
  const quizQuestions = [
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completeLesson = async (lesson: Lesson) => {
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
        setActiveLesson(null);
      } else {
        showToast(data.error || "Falha ao gravar check-in.", "error");
      }
    } catch (e) {
      showToast("Falha de conexão com a VPS.", "error");
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
    
    return (
      <div className="space-y-6" id="academy-active-lesson">
        <button 
          onClick={() => {
            setActiveLesson(null);
            setQuizActive(false);
          }}
          className="flex items-center gap-2 text-xs font-mono text-violet-300 hover:text-white transition-colors cursor-pointer bg-slate-900/80 p-2.5 rounded-xl border border-slate-850 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para os Módulos
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative aspect-video">
              {activeLesson.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeLesson.youtubeId}?autoplay=1`}
                  title={activeLesson.title}
                  className="w-full h-full absolute inset-0 border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
                  <Play className="w-12 h-12 text-violet-400 mb-3 animate-pulse" />
                  <p className="font-display font-semibold text-white">Vídeo Demonstrativo</p>
                  <a href={activeLesson.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-300 font-mono mt-2 underline flex items-center gap-1 justify-center">
                    Assistir direto no YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded border border-violet-500/20">
                      RECOMPENSA: +{activeLesson.xpReward} XP
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">
                      ESTIMADO: 10 MINS
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-xl text-white">{activeLesson.title}</h2>
                </div>

                {!activeLesson.completed && (
                  <button
                    onClick={() => completeLesson(activeLesson)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-bold cursor-pointer text-xs uppercase shadow-md transition-all shrink-0 hover:scale-[1.02]"
                  >
                    <CheckCircle className="w-4 h-4" /> Finalizar Aula
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-350 leading-relaxed font-sans">{activeLesson.description}</p>
            </div>
          </div>

          {/* Flashcards & English Helper Content */}
          <div className="space-y-5">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookMarked className="w-5 h-5 text-violet-400" />
                  <h3 className="font-display font-semibold text-white text-sm">BJJ Vocabulary Decks</h3>
                </div>
                
                <p className="text-xs text-slate-400 mb-4 font-sans leading-snug">
                  Estude e domine os termos em inglês usados globalmente no tatame de lutas e em campeonatos de Jiu-Jitsu:
                </p>

                <div className="space-y-3.5">
                  {flashcards.map((fc, idx) => (
                    <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 hover:border-violet-600/30 transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-sm font-semibold text-violet-300">{fc.term}</span>
                        <span className="font-mono text-[10px] text-slate-500">{fc.phonetic}</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1 font-sans">
                        👉 <strong className="text-slate-300">Tradução:</strong> {fc.translation}
                      </p>
                      <p className="text-[10px] text-slate-450 mt-1.5 leading-snug font-sans bg-slate-900/50 p-2 rounded">
                        ℹ️ {fc.bjjContext}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-violet-950/10 border border-violet-900/20 text-center">
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                  📖 Memorize estes termos! No final do curso você precisará deles para passar no exame de graduação nacional e internacional.
                </p>
              </div>
            </div>
          </div>
        </div>
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
    if (user.role !== 'admin' && user.role !== 'professor') {
      return (
        <div className="p-12 text-center text-red-400 font-mono text-sm border border-red-950/50 rounded-2xl bg-red-950/10">
          Acesso restrito apenas a administradores homologados.
        </div>
      );
    }

    return (
      <div className="space-y-6" id="academy-admin-panel">
        <div className="bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-900 flex justify-between items-center">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white">🛠️ JiuSpeak Academy Manager</h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Painel interno restrito para controle de módulos práticos, publicação de grade de vídeos e monitoramento de alunos.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setEditingModule({ title: "", description: "", beltLevel: "WHITE", orderIndex: 1, active: true })}
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

        {/* Editing or Creating module modal form */}
        {editingModule && (
          <form onSubmit={handleSaveModule} className="bg-slate-900 border border-violet-500/20 p-6 rounded-2xl max-w-lg space-y-4 animate-scaleIn">
            <h3 className="font-display font-bold text-base text-white">{editingModule.id ? "Editar Módulo" : "Criar Novo Módulo Acadêmico"}</h3>
            
            <div className="space-y-3 font-sans text-xs">
              <label className="block text-slate-400">Título do Módulo:</label>
              <input 
                type="text" 
                required 
                value={editingModule.title} 
                onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
              />

              <label className="block text-slate-400">Descrição/Objetivo:</label>
              <textarea 
                required 
                rows={3}
                value={editingModule.description} 
                onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Graduação Categoria:</label>
                  <select
                    value={editingModule.beltLevel}
                    onChange={(e) => setEditingModule({ ...editingModule, beltLevel: e.target.value })}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
                  >
                    <option value="WHITE">WHITE (Branca)</option>
                    <option value="BLUE">BLUE (Azul)</option>
                    <option value="PURPLE">PURPLE (Roxa)</option>
                    <option value="BROWN">BROWN (Marrom)</option>
                    <option value="BLACK">BLACK (Preta)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Índice de Ordenação:</label>
                  <input 
                    type="number" 
                    required 
                    value={editingModule.orderIndex} 
                    onChange={(e) => setEditingModule({ ...editingModule, orderIndex: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 justify-end">
              <button type="button" onClick={() => setEditingModule(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-xl text-xs font-bold cursor-pointer">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-505 text-white rounded-xl font-bold text-xs cursor-pointer">
                Salvar Módulo
              </button>
            </div>
          </form>
        )}

        {/* Editing or Creating lesson modal form */}
        {editingLesson && (
          <form onSubmit={handleSaveLesson} className="bg-slate-900 border border-violet-500/20 p-6 rounded-2xl max-w-lg space-y-4 animate-scaleIn">
            <h3 className="font-display font-bold text-base text-white">{editingLesson.id ? "Editar Lição de Vídeo" : "Adicionar Nova Lição de Vídeo"}</h3>
            
            <div className="space-y-3 font-sans text-xs">
              <label className="block text-slate-400">Vincular ao Módulo Belt:</label>
              <select
                value={editingLesson.moduleId}
                onChange={(e) => setEditingLesson({ ...editingLesson, moduleId: e.target.value })}
                className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
              >
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>

              <label className="block text-slate-400">Título da Lição:</label>
              <input 
                type="text" 
                required 
                value={editingLesson.title} 
                onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
              />

              <label className="block text-slate-400">Descrição em Inglês/Português:</label>
              <textarea 
                required 
                rows={3}
                value={editingLesson.description} 
                onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
              />

              <label className="block text-slate-400">YouTube URL Completa:</label>
              <input 
                type="url" 
                required 
                placeholder="https://www.youtube.com/watch?v=..."
                value={editingLesson.youtubeUrl} 
                onChange={(e) => setEditingLesson({ ...editingLesson, youtubeUrl: e.target.value })}
                className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Recompensa XP:</label>
                  <input 
                    type="number" 
                    required 
                    value={editingLesson.xpReward} 
                    onChange={(e) => setEditingLesson({ ...editingLesson, xpReward: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ordem / Índice:</label>
                  <input 
                    type="number" 
                    required 
                    value={editingLesson.orderIndex} 
                    onChange={(e) => setEditingLesson({ ...editingLesson, orderIndex: Number(e.target.value) })}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 justify-end">
              <button type="button" onClick={() => setEditingLesson(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-xl text-xs font-bold cursor-pointer">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-505 text-white rounded-xl font-bold text-xs cursor-pointer">
                Gravar Lição
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List of modules and editing shortcuts */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
            <h3 className="font-display font-semibold text-white text-base">Currículo Acadêmico Publicado</h3>
            
            <div className="space-y-4">
              {modules.map((mod) => (
                <div key={mod.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <div className="flex justify-between items-center bg-[#070a13] p-2.5 rounded border border-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-violet-300">[{mod.beltLevel}]</span>
                      <h4 className="font-display font-bold text-sm text-slate-200">{mod.title}</h4>
                    </div>
                    
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setEditingModule(mod)}
                        className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[10px] uppercase cursor-pointer"
                      >
                        Editar Módulo
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-sans">{mod.description}</p>
                  
                  <div className="pl-4 border-l-2 border-slate-800 space-y-2 mt-2">
                    {mod.lessons.map(les => (
                      <div key={les.id} className="flex justify-between items-center text-xs p-1.5 py-2 hover:bg-slate-900/40 rounded transition-colors border border-transparent hover:border-slate-850">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${les.completed ? 'text-emerald-500' : 'text-slate-600'}`} />
                          <span className="text-slate-300 font-semibold truncate text-[11px]">{les.title}</span>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <span className="bg-slate-900 text-[10px] text-slate-500 px-1.5 py-0.5 rounded font-mono">+{les.xpReward} XP</span>
                          <button 
                            onClick={() => setEditingLesson(les)}
                            className="text-violet-400 hover:text-white font-mono text-[10px] uppercase align-middle"
                            title="Editar Lição"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students Tracker Table */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
            <h3 className="font-display font-semibold text-white text-base">Alunos Matriculados</h3>
            
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Monitore o rendimento e a conquista de diplomas táticos de cada estudante matriculado na JiuSpeak Academy:
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {adminProgress?.studentsProgress?.map((student: any) => (
                <div key={student.id} className="bg-slate-950 p-3 rounded-xl border border-slate-855 flex justify-between items-center text-xs gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-250 truncate">{student.name}</p>
                    <p className="text-[10px] text-slate-550 font-mono truncate">{student.email}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end font-mono text-[10px]">
                      <CheckCircle2 className={`w-3 h-3 ${student.completedLessons >= 10 ? 'text-emerald-500' : 'text-slate-500'}`} />
                      <span className="text-slate-400">{student.completedLessons} Aulas</span>
                    </div>
                    {student.isWhiteBeltGraduate ? (
                      <span className="text-[9px] font-mono uppercase bg-violet-500/10 text-violet-300 border border-violet-500/20 px-1.5 rounded-full mt-1 inline-block">
                        🎓 White Belt Grad
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono uppercase bg-slate-900 text-slate-600 px-1.5 rounded-full mt-1 inline-block">
                        Cursando
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{beltLabelMeta.icon}</span>
            <span className="text-[10px] font-mono tracking-widest text-violet-300 uppercase font-black">GRADUAÇÃO {beltLabelMeta.label}</span>
          </div>
          <h2 className="font-display font-black text-2xl text-white tracking-tight leading-none mt-1">{currentModule.title}</h2>
          <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed mt-1.5">{currentModule.description}</p>
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
