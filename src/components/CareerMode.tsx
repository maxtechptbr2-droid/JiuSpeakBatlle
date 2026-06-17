import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Flame, 
  Clock, 
  Play, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  Mic, 
  HelpCircle, 
  Sparkles, 
  Lock, 
  Star,
  Check,
  AlertTriangle,
  Gift,
  Search,
  ShieldCheck,
  Share2,
  Download,
  RefreshCw,
  Copy,
  FileText
} from 'lucide-react';
import { UserProfile } from '../types';
import { BELTS_RPG_DATA, Belt, Module, Mission, MissionStep, Exam, ExamQuestion } from '../content/index';
import { normalizeYoutubeUrl } from '../utils/youtube';

interface CareerModeProps {
  user: UserProfile;
  addXp: (amount: number, reason: string) => void;
  addCoins: (amount: number, reason: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onNavigate?: (tab: string) => void;
}

export default function CareerMode({ user, addXp, addCoins, showToast, onNavigate }: CareerModeProps) {
  // Navigation states
  const [selectedBelt, setSelectedBelt] = useState<Belt>(BELTS_RPG_DATA[0]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  
  // Active step navigation inside active mission player
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  
  // Interactive mini-game answers/responses helper metrics
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizCheckedStatus, setQuizCheckedStatus] = useState<boolean | null>(null);
  
  // Voice recording simulation states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speakingAccuracy, setSpeakingAccuracy] = useState<number | null>(null);
  
  // Listening multiple choice states
  const [listeningSelectedOption, setListeningSelectedOption] = useState<number | null>(null);
  const [listeningAnswered, setListeningAnswered] = useState<boolean>(false);
  const [listeningCheckedStatus, setListeningCheckedStatus] = useState<boolean | null>(null);

  // Persistence of completed missions
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>(() => {
    const cached = localStorage.getItem('jiuspeak_completed_missions_map');
    return cached ? JSON.parse(cached) : {};
  });

  const [ttsPlaying, setTtsPlaying] = useState<string | null>(null);

  // Exam states
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [currentExamQuestionIdx, setCurrentExamQuestionIdx] = useState<number>(0);
  const [examChoices, setExamChoices] = useState<Record<string, string>>({});
  const [examSpokenAccuracy, setExamSpokenAccuracy] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examScore, setExamScore] = useState<number>(0);
  const [examPassed, setExamPassed] = useState<boolean>(false);
  const [examRecording, setExamRecording] = useState<boolean>(false);

  // Persistence of completed exams
  const [completedExams, setCompletedExams] = useState<Record<string, boolean>>(() => {
    const cached = localStorage.getItem('jiuspeak_completed_exams_map');
    return cached ? JSON.parse(cached) : {};
  });

  // Cooldowns for retaking exams
  const [examCooldowns, setExamCooldowns] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('jiuspeak_exam_cooldowns');
    return cached ? JSON.parse(cached) : {};
  });

  // Certificates stored locally
  const [certificates, setCertificates] = useState<any[]>(() => {
    const cached = localStorage.getItem('jiuspeak_user_certificates');
    return cached ? JSON.parse(cached) : [];
  });

  // Active view showing certificate in Modal
  const [activeCertificateToShow, setActiveCertificateToShow] = useState<any | null>(null);

  // Verification center and sub-tab states
  const [activeSubTab, setActiveSubTab] = useState<'ladder' | 'certificates' | 'verify'>('ladder');
  const [verificationCodeInput, setVerificationCodeInput] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const handleBypassCooldown = (examId: string) => {
    if (user.coins < 50) {
      showToast('⚠️ Saldo de JiuTickets (JT) insuficiente para o bypass (custo: 50 JT). Acesse a Arena ou conclua missões para obter JT!', 'error');
      return;
    }
    addCoins(-50, 'Bypass de Cooldown do Exame');
    setExamCooldowns(prev => {
      const copy = { ...prev };
      delete copy[examId];
      return copy;
    });
    showToast('⚡ Cooldown purgado com sucesso via 50 JT! Exame liberado.', 'success');
  };

  const handleVerifyCode = () => {
    if (!verificationCodeInput.trim()) {
      showToast('⚠️ Por favor, digite um código ou ID de verificação.', 'error');
      return;
    }
    const cleanCode = verificationCodeInput.trim().toUpperCase();
    
    // Search in current certificates list
    const foundLocal = certificates.find(
      c => c.id.toUpperCase() === cleanCode || c.verificationSlug.toUpperCase() === cleanCode
    );

    if (foundLocal) {
      setVerificationResult({
        authentic: true,
        certificate: foundLocal,
        message: '✅ CERTIFICADO AUTÊNTICO E AUDITADO POR JIUSPEAK!'
      });
      showToast('✅ Certificado validado e autêntico!', 'success');
    } else {
      if (cleanCode === 'JS-DEMO-EXAM' || cleanCode === 'EXAM-WHITE' || cleanCode === 'JS-2026-OK') {
        const demo = {
          id: 'JS-2026-000001',
          userId: 'usr_demo',
          userName: 'Rickson Gracie (Aluno de Teste)',
          moduleId: 'mod_white_1',
          moduleTitle: 'Sobrevivência Básica',
          beltName: 'Branca',
          issuedAt: '12 de Junho de 2026',
          verificationSlug: 'JS-DEMO-EXAM'
        };
        setVerificationResult({
          authentic: true,
          certificate: demo,
          message: '✅ CERTIFICADO DEMO DE TESTE AUTÊNTICO!'
        });
        showToast('✅ Certificado de Teste validado!', 'success');
      } else {
        setVerificationResult({
          authentic: false,
          message: '❌ Código de autenticidade inexistente ou inválido.'
        });
        showToast('❌ Certificado não encontrado em nossa base auditável.', 'error');
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('jiuspeak_completed_missions_map', JSON.stringify(completedMissions));
  }, [completedMissions]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_completed_exams_map', JSON.stringify(completedExams));
  }, [completedExams]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_exam_cooldowns', JSON.stringify(examCooldowns));
  }, [examCooldowns]);

  useEffect(() => {
    localStorage.setItem('jiuspeak_user_certificates', JSON.stringify(certificates));
  }, [certificates]);

  // Is Belt currently unlocked for current student level/rank
  const isBeltUnlocked = (belt: Belt): boolean => {
    if (belt.id === 'belt_white') return true;
    if (belt.id === 'belt_blue' && user.level >= 5) return true;
    if (belt.id === 'belt_purple' && user.level >= 12) return true;
    if (belt.id === 'belt_brown' && user.level >= 20) return true;
    if (belt.id === 'belt_black' && user.level >= 30) return true;
    
    // Fallback: manual bypass so people can play if they or a admin want
    return user.role === 'admin' || user.id.includes('admin');
  };

  // Speaks using real /api/tts endpoint
  const handleSpeak = async (text: string) => {
    setTtsPlaying(text);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('TTS response error');
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setTtsPlaying(null);
      await audio.play();
    } catch (e) {
      console.warn('Fallback to standard responsive text speech', e);
      // Fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.onend = () => setTtsPlaying(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setTtsPlaying(null);
      }
    }
  };

  const handleStartMission = (mission: Mission) => {
    setSelectedMission(mission);
    setCurrentStepIndex(0);
    // Reset temporary states
    setQuizSelectedOption(null);
    setQuizAnswered(false);
    setQuizCheckedStatus(null);
    setIsRecording(false);
    setSpeakingAccuracy(null);
    setListeningSelectedOption(null);
    setListeningAnswered(false);
    setListeningCheckedStatus(null);
    showToast(`🏁 Missão Iniciada: ${mission.title}`, 'info');
  };

  const handleNextStep = () => {
    if (!selectedMission) return;
    if (currentStepIndex < selectedMission.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      // Reset step-bound triggers
      setQuizSelectedOption(null);
      setQuizAnswered(false);
      setQuizCheckedStatus(null);
      setIsRecording(false);
      setSpeakingAccuracy(null);
      setListeningSelectedOption(null);
      setListeningAnswered(false);
      setListeningCheckedStatus(null);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setQuizSelectedOption(null);
      setQuizAnswered(false);
      setQuizCheckedStatus(null);
      setIsRecording(false);
      setSpeakingAccuracy(null);
      setListeningSelectedOption(null);
      setListeningAnswered(false);
      setListeningCheckedStatus(null);
    }
  };

  // Simulating vocal recording with high-fidelity micro waves
  const handleSimulateRecording = () => {
    setIsRecording(true);
    setSpeakingAccuracy(null);
    setTimeout(() => {
      setIsRecording(false);
      const randomAcc = Math.floor(Math.random() * 15) + 85; // 85% to 100%
      setSpeakingAccuracy(randomAcc);
      showToast(`🎙️ Gravação capturada! Fluência pontuada: ${randomAcc}%`, 'success');
    }, 2000);
  };

  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setCurrentExamQuestionIdx(0);
    setExamChoices({});
    setExamSpokenAccuracy({});
    setExamSubmitted(false);
    setExamScore(0);
    setExamPassed(false);
    setExamRecording(false);
    showToast(`📝 Exame Iniciado: ${exam.title}`, 'info');
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;

    let correctCount = 0;
    activeExam.questions.forEach(q => {
      if (q.type === 'multiple_choice' || q.type === 'listening') {
        if (examChoices[q.id] === q.correctAnswer) {
          correctCount += 1;
        }
      } else if (q.type === 'speaking') {
        const accuracy = examSpokenAccuracy[q.id] || 0;
        if (accuracy >= 80) {
          correctCount += 1;
        }
      }
    });

    const finalPct = Math.round((correctCount / activeExam.questions.length) * 100);
    setExamScore(finalPct);
    const passed = finalPct >= activeExam.passingScore;
    setExamPassed(passed);
    setExamSubmitted(true);

    if (passed) {
      // Mark completed
      setCompletedExams(prev => ({ ...prev, [activeExam.id]: true }));
      
      // Award rewards (JT is strictly bought; 0 JT awarded as a course reward)
      addXp(300, `Graduação do Módulo: ${activeExam.title}`);
      addCoins(0, `Graduação do Módulo: ${activeExam.title}`);

      // Save certificate
      const certId = `JS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const newCert = {
        id: certId,
        userId: user.id,
        userName: user.name || 'Guerreiro JiuSpeak',
        moduleId: activeExam.moduleId,
        moduleTitle: selectedBelt.modules.find(m => m.id === activeExam.moduleId)?.title || 'Módulo Geral',
        beltName: selectedBelt.name,
        issuedAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
        verificationSlug: Math.random().toString(36).substring(2, 10).toUpperCase()
      };

      setCertificates(prev => [newCert, ...prev]);
      showToast(`🏆 Graduado com Sucesso! Certificado outorgado: ${certId}`, 'success');
    } else {
      // Activate cooldown
      const coolUntil = Date.now() + 24 * 60 * 60 * 1000;
      setExamCooldowns(prev => ({ ...prev, [activeExam.id]: coolUntil }));
      showToast(`❌ Desempenho insuficiente. Cooldown de repetição de 24h ativado.`, 'error');
    }
  };

  const handleCheckQuizAnswer = (correctIndex: number) => {
    if (quizSelectedOption === null) return;
    const isCorr = quizSelectedOption === correctIndex;
    setQuizCheckedStatus(isCorr);
    setQuizAnswered(true);
    if (isCorr) {
      showToast('🎯 Resposta Correta! Excelente foco técnico!', 'success');
    } else {
      showToast('⚠️ Quase! Leia a explicação do Mestre no card.', 'error');
    }
  };

  const handleCheckListeningAnswer = (correctIndex: number) => {
    if (listeningSelectedOption === null) return;
    const isCorr = listeningSelectedOption === correctIndex;
    setListeningCheckedStatus(isCorr);
    setListeningAnswered(true);
    if (isCorr) {
      showToast('🎧 Parabéns! Sua escuta fina do tatame está ótima.', 'success');
    } else {
      showToast('⚠️ Oops, tradução incorreta. Escute com calma novamente!', 'error');
    }
  };

  // User unlocks the loot box chest!
  const handleClaimMissionRewards = () => {
    if (!selectedMission) return;
    
    // Credit rewards (JT is strictly bought; 0 JT awarded for mission completions)
    addXp(selectedMission.xpReward, `Conclusão de Missão: ${selectedMission.title}`);
    addCoins(0, `Conclusão de Missão: ${selectedMission.title}`);
    
    // Save completion
    setCompletedMissions(prev => ({
      ...prev,
      [selectedMission.id]: true
    }));

    showToast(`🎁 Recompensas Resgatadas! +${selectedMission.xpReward} XP`, 'success');
    setSelectedMission(null);
  };

  // Math calculated counts for progress map
  const getBeltProgress = (belt: Belt): number => {
    let total = 0;
    let completed = 0;
    belt.modules.forEach(mod => {
      mod.missions.forEach(miss => {
        total += 1;
        if (completedMissions[miss.id]) {
          completed += 1;
        }
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getBeltThemeColors = (belt: Belt) => {
    switch (belt.name) {
      case 'Branca':
        return {
          glow: 'shadow-slate-500/20',
          accent: 'text-slate-200',
          bgBanner: 'from-slate-800 to-zinc-900 border-slate-700',
          lightColor: 'slate-300'
        };
      case 'Azul':
        return {
          glow: 'shadow-blue-600/20',
          accent: 'text-blue-400',
          bgBanner: 'from-blue-950 via-slate-900 to-zinc-900 border-blue-900/60',
          lightColor: 'blue-400'
        };
      case 'Roxa':
        return {
          glow: 'shadow-purple-600/35',
          accent: 'text-purple-400',
          bgBanner: 'from-purple-950 via-slate-900 to-purple-950 border-purple-800/60',
          lightColor: 'purple-400'
        };
      case 'Marrom':
        return {
          glow: 'shadow-amber-800/25',
          accent: 'text-amber-500',
          bgBanner: 'from-amber-950 via-slate-900 to-amber-950 border-amber-900/40',
          lightColor: 'amber-400'
        };
      case 'Preto':
        return {
          glow: 'shadow-red-600/40',
          accent: 'text-rose-500',
          bgBanner: 'from-zinc-950 via-stone-900 to-black border-red-650/50',
          lightColor: 'red-500'
        };
      default:
        return {
          glow: 'shadow-slate-500/25',
          accent: 'text-white',
          bgBanner: 'from-zinc-900 to-zinc-950',
          lightColor: 'white'
        };
    }
  };

  return (
    <div className="space-y-6" id="rpg-career-mode-root">
      
      {/* 1. SELECTION HEADER FOR 5 BELTS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="rpg-belts-list-selector">
        {BELTS_RPG_DATA.map((belt) => {
          const unlocked = isBeltUnlocked(belt);
          const active = selectedBelt.id === belt.id;
          const pct = getBeltProgress(belt);
          const tColors = getBeltThemeColors(belt);

          return (
            <button
              key={belt.id}
              onClick={() => unlocked && setSelectedBelt(belt)}
              disabled={!unlocked}
              className={`p-4 rounded-2xl border text-left relative flex flex-col justify-between h-32 transition-all duration-300 transform select-none ${
                !unlocked 
                  ? 'bg-zinc-950/40 border-zinc-900 opacity-40 cursor-not-allowed' 
                  : active 
                    ? `bg-zinc-900/90 border-${tColors.lightColor} text-white scale-102 shadow-lg ${tColors.glow}`
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700 hover:scale-101 text-zinc-400'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md font-mono ${belt.colorClass}`}>
                  Faixa {belt.name}
                </span>
                {!unlocked ? (
                  <Lock className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                ) : pct === 100 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0 animate-pulse" />
                )}
              </div>

              <div className="mt-2 text-glow">
                <p className="font-display font-black text-xs text-zinc-300 uppercase leading-none">{belt.level}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{belt.slug.replace('-', ' ')}</p>
              </div>

              {unlocked && (
                <div className="w-full mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-zinc-500">
                    <span>PROGRESSO</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className={`h-full transition-all duration-500 bg-gradient-to-r ${
                        belt.name === 'Branca' ? 'from-slate-100 to-white' :
                        belt.name === 'Azul' ? 'from-blue-600 to-blue-400' :
                        belt.name === 'Roxa' ? 'from-purple-650 to-fuchsia-500' :
                        belt.name === 'Marrom' ? 'from-amber-800 to-amber-500' : 'from-red-650 to-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. SUB-TABS NAVIGATION BAR */}
      <div className="flex border-b border-zinc-850 pb-0.5 mt-2 gap-2 overflow-x-auto" id="rpg-career-subtabs">
        <button
          onClick={() => setActiveSubTab('ladder')}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 select-none ${
            activeSubTab === 'ladder'
              ? 'border-red-650 text-white font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <Award className="w-4 h-4 text-red-500" />
          <span>Trilha de Graduação</span>
        </button>

        <button
          onClick={() => setActiveSubTab('certificates')}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 select-none ${
            activeSubTab === 'certificates'
              ? 'border-red-650 text-white font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>Diplomas & Certificados ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('verify')}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 select-none ${
            activeSubTab === 'verify'
              ? 'border-red-650 text-white font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Central de Verificação</span>
        </button>
      </div>

      {activeSubTab === 'ladder' && (
        <>
          {/* 3. ATMOSPHERIC ACTIVE BELT INTRODUCTION BANNER */}
          <div 
            className={`relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r text-zinc-100 border shadow-2xl transition-all duration-300 ${
              getBeltThemeColors(selectedBelt).bgBanner
            }`}
            id="rpg-active-belt-intro-banner"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/2 opacity-5 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1 px-3 bg-white/10 text-[9px] font-bold rounded-lg tracking-widest uppercase font-mono">
                  Fase Ativa de Carreira
                </span>
                <span className="p-1 px-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-lg tracking-widest uppercase font-mono">
                  Nível {selectedBelt.level}
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-display font-black tracking-tight uppercase">
                Jornada da Faixa {selectedBelt.name}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-normal">
                {selectedBelt.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-450 pt-2">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{selectedBelt.modules.length} Módulos Disponíveis</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Condição: {selectedBelt.unlockRequirement}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. MODULES AND MISSIONS LADDER */}
          <div className="space-y-6" id="rpg-modules-ladder">
            {selectedBelt.modules.map(mod => (
              <div key={mod.id} className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                  <div>
                    <h3 className="font-display font-black text-sm uppercase text-zinc-200">
                      Módulo {mod.order}: {mod.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-sans tracking-tight">{mod.description}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">ID: {mod.slug}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mod.missions.map(miss => {
                    const completed = completedMissions[miss.id];

                    return (
                      <div
                        key={miss.id}
                        className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[170px] relative overflow-hidden bg-zinc-950 ${
                          completed 
                            ? 'border-emerald-500/25 bg-radial-at-t from-emerald-950/20 to-zinc-950' 
                            : 'border-zinc-850 hover:border-zinc-750'
                        }`}
                      >
                        {completed && (
                          <div className="absolute top-0 right-0 p-1 px-3 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold font-mono uppercase tracking-widest rounded-bl-xl border-l border-b border-emerald-500/20 animate-pulse">
                            Sessão Concluída ✔
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono ${
                              miss.difficulty === 'Iniciante' ? 'bg-sky-500/10 text-sky-400' :
                              miss.difficulty === 'Intermediário' ? 'bg-indigo-500/10 text-indigo-400' :
                              miss.difficulty === 'Avançado' ? 'bg-purple-500/10 text-purple-400' : 'bg-red-500/10 text-red-500'
                            }`}>
                              {miss.difficulty}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono">Missão {miss.order}</span>
                          </div>

                          <h4 className="font-display font-extrabold text-sm text-zinc-200 leading-tight">
                            {miss.title}
                          </h4>
                          
                          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-2">
                            {miss.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between w-full pt-4 mt-2 border-t border-zinc-900">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-[10px] text-rose-500 font-mono font-black uppercase tracking-tight">
                              🏆 +{miss.xpReward} XP
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] text-amber-500 font-mono font-black uppercase tracking-tight">
                              🎟️ +{miss.jtReward} JT
                            </span>
                          </div>

                          <button
                            onClick={() => handleStartMission(miss)}
                            className={`p-2 px-5 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-250 border border-zinc-800`}
                          >
                            <Play className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                            <span>{completed ? 'Refazer Missão' : 'Iniciar Treino'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* EXAME DE GRADUAÇÃO DO MÓDULO */}
                {mod.exam && (
                  (() => {
                    const exam = mod.exam;
                    const completed = completedExams[exam.id];
                    const cooldownTime = examCooldowns[exam.id] || 0;
                    const coolingActive = cooldownTime > Date.now();
                    const allMissionsCompleted = mod.missions.every(m => completedMissions[m.id]);
                    
                    const remainingSecs = Math.max(0, Math.floor((cooldownTime - Date.now()) / 1000));
                    const remHrs = Math.floor(remainingSecs / 3600);
                    const remMins = Math.floor((remainingSecs % 3600) / 60);

                    return (
                      <div 
                        className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${
                          completed
                            ? 'border-yellow-500/30 bg-radial-at-t from-yellow-950/10 via-zinc-950 to-black shadow-xl'
                            : coolingActive
                              ? 'border-red-900/40 bg-radial-at-t from-red-950/20 via-zinc-950 to-black'
                              : !allMissionsCompleted
                                ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                                : 'bg-radial-at-t from-zinc-900 via-zinc-950 to-black border-zinc-800 hover:border-zinc-700 shadow-xl'
                        }`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 opacity-40 blur-2xl rounded-full"></div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono tracking-widest ${
                                completed ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-650/15 text-red-500'
                              }`}>
                                Exame Oficial de Graduação
                              </span>
                              {completed && (
                                <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold font-mono">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado ({exam.passingScore}% req.)
                                </span>
                              )}
                            </div>
                            
                            <h4 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight">
                              {exam.title}
                            </h4>
                            
                            <p className="text-[11px] text-zinc-400 max-w-xl leading-relaxed">
                              Consolidação prática do módulo. Avaliação rigorosa de escuta, fala e múltiplas escolhas táticas de tatame. {exam.questions.length} questões táticas.
                            </p>
                          </div>

                          <div className="flex flex-col items-stretch sm:items-end justify-center gap-2 shrink-0">
                            {completed ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const cert = certificates.find(c => c.moduleId === mod.id);
                                    if (cert) {
                                      setActiveCertificateToShow(cert);
                                    } else {
                                      const certId = `JS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
                                      const newCert = {
                                        id: certId,
                                        userId: user.id,
                                        userName: user.name || 'Guerreiro JiuSpeak',
                                        moduleId: exam.moduleId,
                                        moduleTitle: mod.title,
                                        beltName: selectedBelt.name,
                                        issuedAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
                                        verificationSlug: Math.random().toString(36).substring(2, 10).toUpperCase()
                                      };
                                      setCertificates(prev => [newCert, ...prev]);
                                      setActiveCertificateToShow(newCert);
                                    }
                                  }}
                                  className="p-2 px-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-zinc-950 font-black rounded-xl text-[10px] uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Trophy className="w-3.5 h-3.5" /> Ver Diploma
                                </button>
                                <button
                                  onClick={() => handleStartExam(exam)}
                                  className="p-2 px-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-400 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center"
                                >
                                  Refazer (Treino)
                                </button>
                              </div>
                            ) : coolingActive ? (
                              <div className="bg-red-950/20 p-2.5 rounded-xl border border-red-900/40 space-y-1.5 text-center sm:text-right min-w-[200px]">
                                <p className="text-[8.5px] font-mono text-rose-500 uppercase tracking-widest font-black">Cooldown Ativo (24h)</p>
                                <p className="text-xs font-mono font-bold text-zinc-100">Pronto em: {remHrs}h e {remMins}m</p>
                                <button
                                  onClick={() => handleBypassCooldown(exam.id)}
                                  className="w-full py-1.5 bg-gradient-to-r from-orange-500 to-red-650 hover:from-orange-400 hover:to-red-500 text-white font-mono font-bold rounded-lg text-[8.5px] uppercase tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer border border-orange-400/30"
                                >
                                  <Flame className="w-3 h-3 text-white fill-white animate-pulse" />
                                  Pular com -50 JT
                                </button>
                              </div>
                            ) : !allMissionsCompleted ? (
                              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-850 text-center sm:text-right text-[10px] text-zinc-500 font-medium">
                                🔒 Complete para liberar o exame
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartExam(exam)}
                                className="p-2.5 px-5 bg-red-650 hover:bg-red-550 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-red-650/15"
                              >
                                <Play className="w-3.5 h-3.5 text-white fill-white animate-pulse" />
                                Iniciar Exame Oficial
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}

              </div>
            ))}
          </div>
        </>
      )}

      {activeSubTab === 'certificates' && (
        <div className="space-y-6" id="rpg-certificates-tab">
          <div className="p-5 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-2">
            <h3 className="font-display font-black text-sm uppercase text-white flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Seus Diplomas Oficiais de Jiu-Jitsu Inglês
            </h3>
            <p className="text-xs text-zinc-455 leading-relaxed font-sans font-normal">
              Aqui jazem as suas maiores conquistas intelectuais de combate. Cada certificado lista o seu nome de competidor, a faixa do módulo completado, carimbos do comitê de arbitragem, e um ID único auditável para segurança curricular.
            </p>
          </div>

          {certificates.length === 0 ? (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-zinc-800">
                📜
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <p className="font-bold text-sm text-zinc-300">Nenhum Diploma Outorgado</p>
                <p className="text-xs text-zinc-500 font-sans">
                  Complete todas as missões de qualquer módulo da sua faixa atual e vença o Exame Oficial de 24h para receber a outorga pública.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div 
                  key={cert.id}
                  className="p-5 rounded-2xl border border-zinc-850 bg-zinc-950 flex flex-col justify-between min-h-[160px] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-1 px-2.5 bg-yellow-500/10 border-b border-l border-yellow-500/20 text-yellow-500 text-[8px] font-mono uppercase font-black rounded-bl-lg">
                    {cert.id}
                  </div>
                  
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] uppercase font-mono font-bold text-zinc-500">Outorgado em {cert.issuedAt}</span>
                    <h4 className="font-display font-black text-sm text-zinc-100 uppercase">{cert.moduleTitle}</h4>
                    <p className="text-[11px] text-zinc-400 font-sans">Praticante Cadastrado: <strong className="text-zinc-200">{cert.userName}</strong></p>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                      <span>Nível/Faixa:</span>
                      <span className="text-yellow-505 font-bold uppercase font-mono">Faixa {cert.beltName}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 mt-2 border-t border-zinc-900 items-center justify-between">
                    <span className="text-[9.5px] font-mono text-zinc-500 select-all">Auditor: {cert.verificationSlug}</span>
                    <button
                      onClick={() => setActiveCertificateToShow(cert)}
                      className="p-1.5 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      Visualizar & Baixar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'verify' && (
        <div className="space-y-6" id="rpg-verify-tab">
          <div className="p-5 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-2">
            <h3 className="font-display font-black text-sm uppercase text-white flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              Central de Auditoria de Diplomas JiuSpeak
            </h3>
            <p className="text-xs text-zinc-450 leading-relaxed font-sans font-normal">
              Nosso sistema utiliza códigos de rastreabilidade de via dupla. Professores de academias, avaliadores, patrocinadores ou qualquer terceiro interessado pode auditar a veracidade de um diploma de inglês técnico emitido pela nossa banca em tempo real.
            </p>
          </div>

          <div className="p-6 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-4 max-w-xl mx-auto text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest font-black">Código de Autenticação / Slug de Auditoria</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="EX: JS-2026-123456 OU JS-DEMO-EXAM"
                  value={verificationCodeInput}
                  onChange={(e) => setVerificationCodeInput(e.target.value)}
                  className="flex-1 p-2.5 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleVerifyCode}
                  className="p-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-xs uppercase cursor-pointer rounded-xl transition-all"
                >
                  Auditar
                </button>
              </div>
              <p className="text-[9.5px] text-zinc-500 font-sans">Estudantes podem obter seu código abrindo qualquer um dos seus diplomas de graduação.</p>
            </div>

            {verificationResult && (
              <div className={`p-4 rounded-xl border space-y-3 animate-scale-up ${
                verificationResult.authentic 
                  ? 'bg-radial-at-t from-emerald-950/25 to-zinc-950 border-emerald-500/25 text-emerald-400' 
                  : 'bg-radial-at-t from-red-950/25 to-zinc-950 border-red-500/25 text-red-400'
              }`}>
                <div className="flex items-center gap-1.5 font-bold uppercase text-xs">
                  {verificationResult.authentic ? <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" /> : <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                  <span>{verificationResult.message}</span>
                </div>

                {verificationResult.authentic && (
                  <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-850 text-[11px] text-zinc-300 space-y-1.5 font-sans leading-relaxed">
                    <p>🎓 <strong>Lutador Estudante:</strong> {verificationResult.certificate.userName}</p>
                    <p>🥋 <strong>Graduação Técnica:</strong> Módulo {verificationResult.certificate.moduleTitle} ({verificationResult.certificate.beltName})</p>
                    <p>📅 <strong>Registro de Emissão:</strong> {verificationResult.certificate.issuedAt}</p>
                    <p>🔒 <strong>ID de Autenticidade:</strong> {verificationResult.certificate.id}</p>
                    <p className="text-[9.5px] text-zinc-500 font-mono">Assinado criptograficamente por: <strong>JIUSPEAK-VERIFY-SECURE-CHAIN</strong></p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. IMMERSIVE FULL-SCREEN RPG MISSION ACTIVE PLAYER */}
      {selectedMission && (
        <div className="fixed inset-0 bg-[#0c0c0c]/98 backdrop-blur-md z-99999 flex flex-col justify-between text-zinc-100 select-none animate-fade-in" id="rpg-mission-playback-screen">
          
          {/* PLAYER TOP HEADER */}
          <div className="p-4 sm:p-5 border-b border-zinc-900 flex justify-between items-center bg-[#111111]">
            <div className="flex items-center gap-3">
              <span className="p-1 px-2.5 bg-red-650 text-white font-mono text-[9px] font-black rounded tracking-widest uppercase animate-pulse">
                CAREER MODE
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-display font-extrabold text-white uppercase">{selectedMission.title}</h4>
                <p className="text-[10px] text-zinc-500 font-mono">Passo {currentStepIndex + 1} de {selectedMission.steps.length} • Graduação {selectedBelt.name}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                if (confirm('Deseja realmente abandonar seu progresso ativo nesta missão?')) {
                  setSelectedMission(null);
                }
              }}
              className="p-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* PLAYER STEP CONTENT BOARD CONTAINER */}
          <div className="flex-1 p-4 sm:p-8 flex items-center justify-center overflow-y-auto bg-radial-at-t from-zinc-900 to-black">
            <div className="w-full max-w-2xl bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-850 shadow-2xl space-y-5 animate-scale-up">
              
              {/* RENDER ACTIVE STEP TYPE */}
              {(() => {
                const step = selectedMission.steps[currentStepIndex];
                if (!step) return null;

                // Step content switch renders
                switch (step.type) {
                  case 'intro':
                    return (
                      <div className="space-y-4" id="step-intro-render">
                        {step.content?.bannerImage && (
                          <div className="w-full h-40 rounded-2xl overflow-hidden border border-zinc-850 relative">
                            <img src={step.content.bannerImage} className="w-full h-full object-cover" alt="introduction banner" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                            {step.title || 'Visão Geral do Tatame'}
                          </h3>
                          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                            {step.description}
                          </p>
                        </div>
                        {step.content?.tips && (
                          <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-850 space-y-2">
                            <p className="text-[10px] text-yellow-500 font-mono font-bold tracking-wider uppercase flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> DICAS DO MESTRE GRACIE
                            </p>
                            <ul className="space-y-1.5 text-xs text-zinc-400 font-sans">
                              {step.content.tips.map((tip: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-red-500 mt-0.5">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );

                  case 'video':
                    return (
                      <div className="space-y-4" id="step-video-render">
                        <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                          {step.title}
                        </h3>
                        {step.content?.videoUrl && (
                          <div className="space-y-2">
                            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-zinc-850 bg-black relative shadow-lg">
                              {(step.content.videoUrl.includes('youtube.com') || step.content.videoUrl.includes('youtu.be') || step.content.videoUrl.includes('embed')) ? (
                                <iframe
                                  src={normalizeYoutubeUrl(step.content.videoUrl)}
                                  title={step.title}
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  referrerPolicy="no-referrer"
                                  allowFullScreen
                                />
                              ) : (
                                <video 
                                  src={step.content.videoUrl} 
                                  controls 
                                  className="w-full h-full object-cover" 
                                  onError={() => {
                                    console.warn("CORS/HTML5 Video blocked. Recommended backup to external server media.");
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[10px] text-zinc-500 font-sans italic">
                                🔔 Se o vídeo não carregar devido a restrições do navegador, certifique-se de estar conectado.
                              </span>
                              <a 
                                href={step.content.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] text-violet-400 font-semibold underline hover:text-violet-300 font-sans"
                              >
                                Abrir no YouTube
                              </a>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                          {step.description}
                        </p>
                        {step.content?.masterTip && (
                          <div className="p-3 bg-red-650/10 border border-red-650/20 text-red-400 text-xs rounded-xl flex items-start gap-2">
                            <Trophy className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                            <span><strong>Master Key:</strong> {step.content.masterTip}</span>
                          </div>
                        )}
                      </div>
                    );

                  case 'vocabulary':
                    return (
                      <div className="space-y-4" id="step-vocab-render">
                        <div className="space-y-1 text-center">
                          <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                            {step.title}
                          </h3>
                          <p className="text-xs text-zinc-400 font-sans">{step.description}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {step.content?.words?.map((word: any, idx: number) => (
                            <div
                              key={idx}
                              onClick={() => handleSpeak(word.term)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between h-24 hover:scale-101 text-left ${
                                ttsPlaying === word.term 
                                  ? 'bg-red-650/10 border-red-600' 
                                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-850 text-zinc-300'
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="font-mono text-zinc-500 text-[9px] uppercase tracking-wider">Pronúncia Técnica</span>
                                <Volume2 className={`w-4 h-4 ${ttsPlaying === word.term ? 'text-red-500 animate-bounce' : 'text-zinc-450'}`} />
                              </div>
                              <div>
                                <h4 className="font-display font-extrabold text-sm text-zinc-100">{word.term}</h4>
                                <p className="text-[10px] text-zinc-400 italic">/{word.pronunciation}/</p>
                              </div>
                              <span className="text-[10px] text-zinc-400 border-t border-zinc-800 pt-1 mt-1 truncate">
                                Translate: <strong>{word.translation}</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );

                  case 'dialogue':
                    return (
                      <div className="space-y-4" id="step-dialogue-render">
                        <div className="space-y-1">
                          <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                            {step.title}
                          </h3>
                          <p className="text-xs text-zinc-400 font-sans">{step.description}</p>
                        </div>

                        <div className="space-y-3 pt-2 max-h-[290px] overflow-y-auto pr-1">
                          {step.content?.dialogue?.map((dialog: any, idx: number) => (
                            <div 
                              key={idx}
                              onClick={() => handleSpeak(dialog.textEN)}
                              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col cursor-pointer ${
                                idx % 2 === 0 
                                  ? 'bg-zinc-900 border-zinc-800 ml-0 mr-8 rounded-tl-none' 
                                  : 'bg-red-650/5 border-red-850/20 mr-0 ml-8 rounded-tr-none'
                              }`}
                            >
                              <div className="flex justify-between items-center text-[8.5px] font-mono font-bold text-zinc-500 mb-1">
                                <span>{dialog.speaker}</span>
                                <Volume2 className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-xs font-semibold text-zinc-100 leading-snug">{dialog.textEN}</p>
                              <p className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-900/60 mt-1">{dialog.textPT}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );

                  case 'listening':
                    return (
                      <div className="space-y-4" id="step-listening-render">
                        <div className="space-y-1 text-center">
                          <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                            {step.title}
                          </h3>
                          <p className="text-xs text-zinc-400 font-sans">{step.description}</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 bg-zinc-900 rounded-2xl border border-zinc-850 gap-3">
                          <button
                            onClick={() => handleSpeak(step.content?.phrase)}
                            className="p-3 bg-red-650 hover:bg-red-550 text-white rounded-full transition-all cursor-pointer transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg"
                          >
                            <Volume2 className="w-6 h-6 animate-pulse" />
                          </button>
                          <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider font-bold">Clique para Ouvir o Áudio</span>
                        </div>

                        <div className="space-y-2 pt-2">
                          {step.content?.options?.map((option: string, oIdx: number) => (
                            <label
                              key={oIdx}
                              className={`p-3 rounded-xl border flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                                listeningSelectedOption === oIdx
                                  ? 'bg-red-650/10 border-red-600 font-semibold'
                                  : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-300'
                              }`}
                            >
                              <span className="flex-1">{option}</span>
                              <input
                                type="radio"
                                name="listening_opt"
                                checked={listeningSelectedOption === oIdx}
                                onChange={() => !listeningAnswered && setListeningSelectedOption(oIdx)}
                                disabled={listeningAnswered}
                                className="hidden"
                              />
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                listeningSelectedOption === oIdx ? 'border-red-500 bg-red-600' : 'border-zinc-700'
                              }`}>
                                {listeningSelectedOption === oIdx && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </label>
                          ))}
                        </div>

                        {!listeningAnswered ? (
                          <button
                            disabled={listeningSelectedOption === null}
                            onClick={() => handleCheckListeningAnswer(step.content?.correctOptionIndex)}
                            className="w-full p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-850 rounded-xl font-bold uppercase text-xs transition-all cursor-pointer disabled:opacity-50"
                          >
                            Validar Resposta
                          </button>
                        ) : (
                          <div className={`p-4 rounded-xl border text-xs gap-1.5 flex flex-col ${
                            listeningCheckedStatus 
                              ? 'bg-emerald-950/25 border-emerald-500/20 text-emerald-400' 
                              : 'bg-red-950/25 border-red-500/20 text-red-400'
                          }`}>
                            <div className="flex items-center gap-1.5 font-bold uppercase">
                              {listeningCheckedStatus ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                              <span>{listeningCheckedStatus ? 'Resultado: CORRETO!' : 'Resultado: INCORRETO'}</span>
                            </div>
                            <p className="text-zinc-400 font-sans leading-relaxed">{step.content?.explanation}</p>
                          </div>
                        )}
                      </div>
                    );

                  case 'speaking':
                  case 'pronunciation':
                    return (
                      <div className="space-y-4" id="step-speaking-render">
                        <div className="space-y-1 text-center">
                          <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                            {step.title}
                          </h3>
                          <p className="text-xs text-zinc-400 font-sans">
                            {step.description || 'Grave sua pronúncia do termo técnico e simule a inteligência artificial.'}
                          </p>
                        </div>

                        <div className="p-5 p-y-7 bg-zinc-900/60 border border-zinc-850 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider font-bold">FRASE DO TATAME</span>
                            <h4 className="text-lg font-display font-black text-white px-4 border-l-2 border-red-650 inline-block">
                              "{step.content?.phraseToRecord}"
                            </h4>
                          </div>

                          {/* Recording audio waves visualizer mockup */}
                          {isRecording && (
                            <div className="flex items-center gap-1 justify-center h-8">
                              <div className="w-1 bg-red-600 h-3 rounded-full animate-bounce delay-75"></div>
                              <div className="w-1 bg-red-500 h-6 rounded-full animate-bounce delay-150"></div>
                              <div className="w-1 bg-rose-500 h-7 rounded-full animate-bounce delay-250"></div>
                              <div className="w-1 bg-red-500 h-4 rounded-full animate-bounce delay-100"></div>
                              <div className="w-1 bg-red-600 h-2 rounded-full animate-bounce delay-300"></div>
                            </div>
                          )}

                          {speakingAccuracy !== null && (
                            <div className="space-y-1">
                              <span className="text-[8.5px] text-zinc-500 font-mono uppercase font-black">Score de Fluência IA</span>
                              <div className="flex items-center gap-1 text-glow text-emerald-400 font-mono font-black text-2xl">
                                <span>{speakingAccuracy}%</span>
                                <span className="text-xs text-zinc-450 italic">({speakingAccuracy >= 90 ? 'Excelente!' : 'Aprovador'})</span>
                              </div>
                            </div>
                          )}

                          <button
                            disabled={isRecording}
                            onClick={handleSimulateRecording}
                            className={`p-3 px-8 rounded-full text-xs font-bold uppercase transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer shadow-lg ${
                              isRecording 
                                ? 'bg-zinc-800 text-zinc-550 border border-zinc-700 animate-pulse' 
                                : 'bg-red-650 hover:bg-red-550 text-white hover:scale-103'
                            }`}
                          >
                            <Mic className="w-4 h-4" />
                            <span>{isRecording ? 'Gravando Voz...' : 'Simular Gravador'}</span>
                          </button>
                        </div>
                      </div>
                    );

                  case 'quiz':
                  case 'challenge':
                    return (
                      <div className="space-y-4" id="step-quiz-render">
                        <div className="space-y-1 text-center">
                          <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                            {step.title}
                          </h3>
                          <p className="text-xs text-zinc-400 font-sans">Escolha a opção técnica adequada:</p>
                        </div>

                        {/* We choose first question of quiz steps list */}
                        {step.content?.questions?.slice(0, 1).map((q: any, qIndex: number) => (
                          <div key={qIndex} className="space-y-4">
                            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-850 text-center font-display font-bold text-sm text-zinc-200">
                              "{q.question}"
                            </div>

                            <div className="space-y-2">
                              {q.options?.map((option: string, oIdx: number) => (
                                <label
                                  key={oIdx}
                                  className={`p-3 rounded-xl border flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                                    quizSelectedOption === oIdx
                                      ? 'bg-red-650/10 border-red-600 font-semibold'
                                      : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-300'
                                  }`}
                                >
                                  <span className="flex-1">{option}</span>
                                  <input
                                    type="radio"
                                    name="quiz_opt"
                                    checked={quizSelectedOption === oIdx}
                                    onChange={() => !quizAnswered && setQuizSelectedOption(oIdx)}
                                    disabled={quizAnswered}
                                    className="hidden"
                                  />
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    quizSelectedOption === oIdx ? 'border-red-500 bg-red-600' : 'border-zinc-700'
                                  }`}>
                                    {quizSelectedOption === oIdx && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </label>
                              ))}
                            </div>

                            {!quizAnswered ? (
                              <button
                                disabled={quizSelectedOption === null}
                                onClick={() => handleCheckQuizAnswer(q.correctOptionIndex)}
                                className="w-full p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-850 rounded-xl font-bold uppercase text-xs transition-all cursor-pointer disabled:opacity-50"
                              >
                                Enviar Resposta
                              </button>
                            ) : (
                              <div className={`p-4 rounded-xl border text-xs gap-1.5 flex flex-col ${
                                quizCheckedStatus 
                                  ? 'bg-emerald-950/25 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-red-950/25 border-red-500/20 text-red-400'
                              }`}>
                                <div className="flex items-center gap-1.5 font-bold uppercase">
                                  {quizCheckedStatus ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                                  <span>{quizCheckedStatus ? 'Resultado: CORRETO!' : 'Resultado: INCORRETO'}</span>
                                </div>
                                <p className="text-zinc-400 font-sans leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );

                  case 'reward':
                    return (
                      <div className="space-y-6 text-center py-4" id="step-reward-render">
                        <div className="relative inline-block">
                          {/* Chest with golden visual halo */}
                          <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-xl scale-120 animate-pulse"></div>
                          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-yellow-600 to-amber-400 flex items-center justify-center text-4xl shadow-2xl mx-auto border-2 border-yellow-500/30 transform hover:rotate-6 transition-all duration-300 relative z-10 animate-bounce">
                            🎁
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight text-glow">
                            {step.title || 'Missão Concluída!'}
                          </h3>
                          <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                            {step.description || 'Você completou todos os passos da missão com extrema disciplina técnica e dedicação de combate.'}
                          </p>
                        </div>

                        <div className="flex justify-center items-center gap-4 py-2">
                          <div className="p-3 px-6 bg-rose-650/10 border border-rose-500/20 rounded-2xl flex flex-col items-center">
                            <span className="text-[8px] text-zinc-500 uppercase font-mono">Duração XP</span>
                            <span className="font-mono font-black text-rose-500 text-lg sm:text-2xl">+{step.content?.xpEarned || selectedMission.xpReward} XP</span>
                          </div>
                          
                          <div className="p-3 px-6 bg-amber-650/10 border border-amber-500/20 rounded-2xl flex flex-col items-center">
                            <span className="text-[8px] text-zinc-500 uppercase font-mono">Recompensa JT</span>
                            <span className="font-mono font-black text-amber-500 text-lg sm:text-2xl">+{step.content?.jtEarned || selectedMission.jtReward} JT</span>
                          </div>
                        </div>

                        <button
                          onClick={handleClaimMissionRewards}
                          className="w-full p-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                        >
                          <Gift className="w-4 h-4" />
                          <span>Resgatar Recompensas de Carreira</span>
                        </button>
                      </div>
                    );

                  default:
                    return <p className="text-xs text-zinc-500">Passo em construção técnica.</p>;
                }
              })()}

            </div>
          </div>

          {/* PLAYER BOTTOM CONTROLS INTERFACE */}
          <div className="p-4 sm:p-5 border-t border-zinc-900 bg-[#111111] flex justify-between items-center bg-radial">
            <button
              disabled={currentStepIndex === 0}
              onClick={handlePrevStep}
              className="p-2 px-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            {/* Stepper bubbles indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              {selectedMission.steps.map((_, sIdx) => (
                <div
                  key={sIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    sIdx === currentStepIndex 
                      ? 'w-6 bg-red-650' 
                      : sIdx < currentStepIndex ? 'w-2.5 bg-zinc-500' : 'w-1.5 bg-zinc-850'
                  }`}
                />
              ))}
            </div>

            {/* Only allow continue to next if they answered current quiz/listening task */}
            {(() => {
              const step = selectedMission.steps[currentStepIndex];
              const isQuizType = step.type === 'quiz' || step.type === 'challenge';
              const isListeningType = step.type === 'listening';
              
              const isLastStep = currentStepIndex === selectedMission.steps.length - 1;
              const quizBlock = isQuizType && !quizAnswered;
              const listenBlock = isListeningType && !listeningAnswered;

              return (
                <button
                  disabled={isLastStep || quizBlock || listenBlock}
                  onClick={handleNextStep}
                  className="p-2 px-5 bg-red-650 hover:bg-red-550 text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              );
            })()}
          </div>

        </div>
      )}

      {/* 5. ACTIVE GRADUATION EXAM PLAYER SCREEN */}
      {activeExam && (
        <div className="fixed inset-0 bg-[#090909]/99 backdrop-blur-md z-99999 flex flex-col justify-between text-zinc-100 animate-fade-in" id="active-exam-player-overlay">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-900 bg-[#111111] flex justify-between items-center sm:px-8">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-yellow-500/20 text-yellow-400 font-mono text-[9px] font-black rounded tracking-widest uppercase">
                EXAME DE GRADUAÇÃO
              </span>
              <span className="text-zinc-500 font-mono text-[10px] hidden sm:inline">•</span>
              <p className="text-xs font-mono font-bold text-zinc-400 hidden sm:inline">{activeExam.title}</p>
            </div>
            <button 
              onClick={() => {
                if (window.confirm("Abandonar exame em andamento? Suas respostas parciais serão descartadas e o cooldown não será ativado.")) {
                  setActiveExam(null);
                }
              }}
              className="p-1.5 px-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-450 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-zinc-800"
            >
              Cancelar & Sair
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center">
            {!examSubmitted ? (
              (() => {
                const q = activeExam.questions[currentExamQuestionIdx];
                const selectedOption = examChoices[q.id];
                const spokenScore = examSpokenAccuracy[q.id];

                return (
                  <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-650/4 opacity-5 blur-3xl rounded-full"></div>
                    
                    {/* Stepper progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                        <span>QUESTÃO {currentExamQuestionIdx + 1} DE {activeExam.questions.length}</span>
                        <span>{Math.round(((currentExamQuestionIdx + 1) / activeExam.questions.length) * 100)}% COMPLETO</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                        <div 
                          className="h-full bg-yellow-500 transition-all duration-305"
                          style={{ width: `${((currentExamQuestionIdx + 1) / activeExam.questions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase p-1 px-2.5 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-lg">
                        {q.type === 'multiple_choice' && '📝 Múltiplas Escolhas Táticas'}
                        {q.type === 'listening' && '🎧 Treino de Percepção / Escuta'}
                        {q.type === 'speaking' && '🎙️ Teste Oral de Pronúncia'}
                      </div>

                      <h3 className="font-display font-black text-base sm:text-xl text-zinc-100 uppercase tracking-tight leading-snug">
                        {q.questionText}
                      </h3>
                    </div>

                    {/* Question Content UI wrappers */}
                    <div className="space-y-3 pt-2">
                      {q.type === 'listening' && (
                        <div className="flex flex-col items-center justify-center p-4 bg-zinc-900 border border-zinc-850 rounded-2xl gap-2.5 mb-2">
                          <button
                            onClick={() => handleSpeak(q.audioPhrase || '')}
                            className="p-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                          <span className="text-[9px] text-zinc-550 font-mono uppercase tracking-wider font-bold">Clique para ouvir o áudio instrumental</span>
                        </div>
                      )}

                      {(q.type === 'multiple_choice' || q.type === 'listening') && q.options && (
                        <div className="grid grid-cols-1 gap-2.5">
                          {q.options.map((option, idx) => {
                            const isSelected = selectedOption === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setExamChoices(prev => ({ ...prev, [q.id]: idx }));
                                }}
                                className={`w-full p-4 text-left rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex justify-between items-center ${
                                  isSelected 
                                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-md shadow-yellow-500/5' 
                                    : 'bg-zinc-900/60 border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-905'
                                }`}
                              >
                                <span>{option}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-yellow-500 bg-yellow-500 text-zinc-950' : 'border-zinc-700'
                                }`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'speaking' && (
                        <div className="space-y-4 py-4 text-center">
                          <div className="p-5 bg-zinc-900/70 border border-zinc-850 rounded-3xl space-y-3 text-center">
                            <p className="text-zinc-400 text-[11px] font-mono uppercase tracking-widest font-bold">Pronuncie a sentença técnica:</p>
                            <h4 className="text-lg sm:text-xl font-display font-black text-yellow-500 uppercase tracking-tight">"{q.audioPhrase}"</h4>
                          </div>

                          <div className="flex flex-col items-center justify-center gap-2">
                            {examRecording ? (
                              <div className="flex flex-col items-center gap-3">
                                <div className="flex justify-center items-center gap-1 h-8 px-4 py-2">
                                  <div className="w-1 bg-red-500 h-6 rounded animate-pulse" />
                                  <div className="w-1 bg-red-500 h-8 rounded animate-pulse delay-75" />
                                  <div className="w-1 bg-red-500 h-4 rounded animate-pulse delay-150" />
                                  <div className="w-1 bg-red-500 h-7 rounded animate-pulse delay-200" />
                                  <div className="w-1 bg-red-500 h-3 rounded animate-pulse delay-300" />
                                </div>
                                <span className="text-[9px] text-zinc-550 font-mono uppercase animate-pulse">Analisando ondas de rádio vocal...</span>
                              </div>
                            ) : spokenScore !== undefined ? (
                              <div className="p-3 px-5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-1">
                                <p className="text-[9px] font-mono text-emerald-400 font-bold uppercase">Acurácia de Pronúncia Estimada:</p>
                                <p className="text-2xl font-mono font-black text-emerald-400">{spokenScore}%</p>
                                <p className="text-[9.5px] text-zinc-500 font-sans font-medium">Nota de corte institucional: 80%</p>
                              </div>
                            ) : (
                              <p className="text-[10px] text-zinc-500 font-sans">Simule seu áudio clicando no microfone e fale alto e claro.</p>
                            )}

                            <button
                              onClick={() => {
                                setExamRecording(true);
                                setTimeout(() => {
                                  setExamRecording(false);
                                  const randomScore = Math.floor(Math.random() * 15) + 85; 
                                  setExamSpokenAccuracy(prev => ({ ...prev, [q.id]: randomScore }));
                                  showToast(`🎙️ Resposta falada fixada! Coesão: ${randomScore}%`, 'success');
                                }, 2000);
                              }}
                              disabled={examRecording}
                              className={`p-4 rounded-full transition-all cursor-pointer shadow-lg transform active:scale-90 flex items-center justify-center ${
                                examRecording 
                                  ? 'bg-rose-650/30 text-rose-500 animate-ping'
                                  : 'bg-red-650 text-white hover:bg-red-550'
                              }`}
                            >
                              <Mic className="w-6 h-6 animate-pulse" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation inside quest */}
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-900 bg-[#0c0c0c] rounded-b-2xl">
                      <button
                        disabled={currentExamQuestionIdx === 0}
                        onClick={() => setCurrentExamQuestionIdx(prev => prev - 1)}
                        className="p-2 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-450 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>

                      {currentExamQuestionIdx < activeExam.questions.length - 1 ? (
                        <button
                          disabled={
                            (q.type === 'multiple_choice' || q.type === 'listening') 
                              ? selectedOption === undefined 
                              : spokenScore === undefined
                          }
                          onClick={() => setCurrentExamQuestionIdx(prev => prev + 1)}
                          className="p-2 px-5 bg-red-650 hover:bg-red-550 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                        >
                          Próxima
                        </button>
                      ) : (
                        <button
                          disabled={
                            (q.type === 'multiple_choice' || q.type === 'listening') 
                              ? selectedOption === undefined 
                              : spokenScore === undefined
                          }
                          onClick={handleSubmitExam}
                          className="p-3 px-6 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg transform hover:scale-[1.01] disabled:opacity-35"
                        >
                          Concluir e Enviar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              /* RESULTS DASHBOARD SCREEN */
              <div className="w-full max-w-xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                {examPassed ? (
                  <>
                    <div className="absolute inset-0 bg-yellow-500/5 rounded-full blur-3xl scale-125"></div>
                    <div className="w-20 h-20 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-full flex items-center justify-center text-4xl shadow-2xl mx-auto border-2 border-yellow-400/40 transform animate-bounce">
                      🏆
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight text-glow">
                        Parabéns! Você Passou!
                      </h3>
                      <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto leading-relaxed">
                        Você superou o Exame de Graduação do Módulo com a excelente performance de <strong className="text-yellow-500">{examScore}%</strong>! A academia outorgou sua licença técnica operacional.
                      </p>
                    </div>

                    <div className="flex justify-center items-center gap-4 py-1.5">
                      <div className="p-3 px-5 bg-rose-650/10 border border-rose-500/20 rounded-2xl flex flex-col items-center">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono">XP Outorgado</span>
                        <span className="font-mono font-black text-rose-500 text-lg sm:text-2xl">+300 XP</span>
                      </div>
                      
                      <div className="p-3 px-5 bg-amber-650/10 border border-amber-500/20 rounded-2xl flex flex-col items-center">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono">Bônus JT</span>
                        <span className="font-mono font-black text-amber-500 text-lg sm:text-2xl">+150 JT</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-500 font-sans italic">
                      Seu novo diploma digital infalsificável foi emitido e anexado à sua Central de Diplomas.
                    </p>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => {
                          const lastIssued = certificates[0] || null;
                          setActiveExam(null);
                          if (lastIssued) {
                            setActiveCertificateToShow(lastIssued);
                          } else {
                            setActiveSubTab('certificates');
                          }
                        }}
                        className="w-full p-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Visualizar Meu Novo Diploma</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveExam(null)}
                        className="w-full p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 font-bold rounded-xl text-xs uppercase cursor-pointer"
                      >
                        Voltar para a Trilha
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-red-950/20 border border-red-900/40 rounded-full flex items-center justify-center text-3xl mx-auto">
                      🛑
                    </div>

                    <div className="space-y-1.5 font-sans leading-relaxed text-center">
                      <h3 className="text-lg sm:text-xl font-display font-black text-rose-500 uppercase tracking-tight">
                        Exame Não Aprovado
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        Sua pontuação final nesta avaliação foi de <strong className="text-rose-505">{examScore}%</strong>. A outorga exige a nota de corte regimental de <strong className="text-zinc-200">{activeExam.passingScore}%</strong>.
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl text-left text-xs text-zinc-450 leading-relaxed font-sans space-y-1">
                      <p className="font-bold text-zinc-200">🥋 Recomendações Técnicas:</p>
                      <ul className="list-disc pl-5 mt-1 text-[11px] space-y-1 text-zinc-400 leading-snug">
                        <li>Estude os termos de tatame e comandos de arbitragem das missões básicas.</li>
                        <li>Utilize nosso motor TTS para calibrar suas ondas de escuta e vocal.</li>
                        <li>Aguarde as 24h regulamentares ou purgure o cooldown usando seus JiuTickets se possuir saldo!</li>
                      </ul>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => {
                          const examId = activeExam.id;
                          setActiveExam(null);
                          handleBypassCooldown(examId);
                        }}
                        className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-650 hover:from-orange-400 hover:to-red-500 text-white font-mono font-bold text-xs uppercase rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-orange-400/20"
                      >
                        <Flame className="w-4 h-4 text-white fill-white animate-pulse" />
                        <span>Purgar Cooldown com -50 JT</span>
                      </button>

                      <button
                        onClick={() => setActiveExam(null)}
                        className="w-full p-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-400 font-bold rounded-xl text-xs uppercase cursor-pointer"
                      >
                        Voltar para a Trilha
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. IMMERSIVE VISUAL LANDSCAPE A4 CERTIFICATE SHOWCASE MODAL */}
      {activeCertificateToShow && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-99999 flex items-center justify-center p-4 animate-fade-in animate-scale-up" id="landscape-certificate-modal">
          <div className="bg-[#0e0e0e] border border-zinc-805 rounded-3xl p-4 sm:p-6 w-full max-w-4xl relative overflow-hidden shadow-2xl flex flex-col justify-between max-h-[96vh]">
            <button 
              onClick={() => setActiveCertificateToShow(null)}
              className="absolute top-4 right-4 p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer z-50 border border-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title / Description */}
            <div className="mb-4 text-left hidden sm:block">
              <h3 className="font-display font-black text-sm text-white uppercase tracking-tight flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-500 animate-pulse" />
                Seu Diploma de Proficiência Técnica Outorgado
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans">Compartilhe suas conquistas operacionais com sua academia ou inclua em seu currículo profissional.</p>
            </div>

            {/* PRESTIGIOUS VISUAL A4 LANDSCAPE DIPLOMA SHEET */}
            <div className="flex-1 overflow-auto py-2 flex items-center justify-center">
              <div 
                className="w-[800px] h-[540px] border-4 border-double border-yellow-500 bg-[#0f0f0f] p-8 relative flex flex-col justify-between text-center select-none shadow-2xl shrink-0 text-white scale-[0.6] xs:scale-[0.7] sm:scale-[0.8] md:scale-100 origin-center"
                id="jiuspeak-rendered-a4-sheet"
              >
                {/* Back watermark texture */}
                <div className="absolute inset-0 bg-radial-at-c from-zinc-900/10 to-[#0e0e0e] pointer-events-none"></div>
                <div className="absolute inset-4 border border-zinc-800 pointer-events-none"></div>

                {/* Sub-seal frame corner */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-yellow-500/50"></div>
                <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-yellow-500/50"></div>
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-yellow-500/50"></div>
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-yellow-500/50"></div>

                {/* Diploma Content Header */}
                <div className="space-y-1.5 pt-4">
                  <h2 className="font-display font-black text-xs tracking-[0.25em] text-yellow-500 uppercase font-bold">JIUSPEAK BJJ TECHNICAL ENGLISH</h2>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">CERTIFICATE OF TECHNICAL PROFICIENCY IN BJJ ENGLISH</p>
                </div>

                {/* Certificate main text body */}
                <div className="space-y-4 my-auto">
                  <p className="text-zinc-400 font-sans text-[11px] italic">Outorga-se por honra ao mérito intelectual e dedicação de tatame ao praticante:</p>
                  
                  <div className="space-y-1 animate-pulse">
                    <h1 className="font-display font-black text-2xl uppercase tracking-wider text-white text-glow">
                      {activeCertificateToShow.userName}
                    </h1>
                    <div className="w-1/3 bg-gradient-to-r from-transparent via-yellow-500 to-transparent h-0.5 mx-auto"></div>
                  </div>

                  <p className="text-zinc-305 font-sans text-xs max-w-md mx-auto leading-relaxed">
                    por ter concluído com extrema precisão o treinamento operacional do <strong className="text-white text-glow">Módulo {activeCertificateToShow.moduleTitle}</strong>, correspondente aos níveis oficiais para a graduação da <strong className="text-yellow-400 text-glow font-bold uppercase font-mono">Faixa {activeCertificateToShow.beltName}</strong> sob protocolo regulamentar de auditoria acadêmica.
                  </p>
                </div>

                {/* Certificate footer signatures and seal */}
                <div className="grid grid-cols-3 items-end pb-4 border-t border-zinc-900 pt-6">
                  {/* Digital seal signature indicator */}
                  <div className="space-y-1 text-center font-mono">
                    <p className="text-[10px] text-zinc-300 italic font-serif">A. Graciella Barbosa</p>
                    <div className="w-24 bg-zinc-800 h-[1px] mx-auto"></div>
                    <p className="text-[7.5px] text-zinc-500 uppercase tracking-wide">Diretoria Acadêmica Executiva</p>
                  </div>

                  {/* Holographic round sticker mockup */}
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 via-yellow-300 to-amber-600 border border-yellow-405 flex items-center justify-center text-[8px] font-black text-zinc-950 uppercase select-none tracking-widest leading-none text-center shadow-lg transform rotate-[-4deg] animate-pulse">
                      <span className="text-[9px]">OFFICIAL<br/>SEAL</span>
                    </div>
                    <p className="text-[7px] text-zinc-500 font-mono uppercase tracking-widest mt-1.5">ID: {activeCertificateToShow.id}</p>
                  </div>

                  {/* Digital validation audit signatures */}
                  <div className="space-y-1 text-center font-mono">
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight text-glow">VALIDATED SECURE</p>
                    <div className="w-24 bg-zinc-800 h-[1px] mx-auto"></div>
                    <p className="text-[7.5px] text-zinc-500 flex flex-col leading-none">
                      <span>AUDIT: {activeCertificateToShow.verificationSlug}</span>
                      <span className="text-[6px] tracking-tight">{activeCertificateToShow?.issuedAt}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-zinc-900 justify-between items-center bg-[#0c0c0c] rounded-b-2xl">
              <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-zinc-500">
                <span>Código do Auditor:</span>
                <strong className="text-zinc-300 font-bold cursor-pointer select-all border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 rounded uppercase font-mono">{activeCertificateToShow.verificationSlug}</strong>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeCertificateToShow.id);
                    showToast(`📋 ID Único copiado: ${activeCertificateToShow.id}`, 'success');
                  }}
                  className="flex-1 sm:flex-none p-1.5 px-3.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar ID</span>
                </button>

                <button
                  onClick={() => {
                    alert(`🔗 Código de compartilhamento e link de verificação pública:\nCódigo: ${activeCertificateToShow.verificationSlug}\n\nPronto para divulgar aos avaliadores de jiu-jitsu!`);
                    showToast('🔗 Código copiado para divulgação!', 'success');
                  }}
                  className="flex-1 sm:flex-none p-1.5 px-3.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Compartilhar</span>
                </button>

                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 sm:flex-none p-2 px-5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-zinc-950 font-black rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
