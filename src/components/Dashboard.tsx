import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  Sword, 
  Monitor, 
  KeyRound, 
  ShieldAlert, 
  RefreshCw, 
  Trash2, 
  Clock, 
  Award,
  ListOrdered,
  Flame,
  Tv,
  User,
  Backpack,
  Users,
  Building2,
  Store,
  Coins
} from 'lucide-react';
import { UserProfile, Achievement, Course, BeltRank } from '../types';
import { authFetch } from '../utils/authFetch';
import { removeFakeUsers } from '../utils/removeFakeUsers';

// Import our new cinematic athlete components
import AthleteHero from './dashboard/AthleteHero';
import XPProgress from './dashboard/XPProgress';
import MissionCard from './dashboard/MissionCard';
import CommunityCard from './dashboard/CommunityCard';
import AthleteProfile from './dashboard/AthleteProfile';
import BeltProgression from './dashboard/BeltProgression';

interface DashboardProps {
  user: UserProfile;
  achievements: Achievement[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  claimAchievement: (id: string) => void;
  onNavigate: (tab: string) => void;
  courses?: Course[];
}

export default function Dashboard({ 
  user, 
  achievements, 
  updateUser, 
  claimAchievement, 
  onNavigate, 
  courses = [] 
}: DashboardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Track completed lessons for real-time progress calculations
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  useEffect(() => {
    const cached = localStorage.getItem('jiuspeak_completed_lessons_list');
    if (cached) {
      try {
        setCompletedLessons(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to load completed lessons list", e);
      }
    }
  }, []);

  // Compute stats based on courses & completed lessons
  const totalLessons = courses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0);
  const completedCount = completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Next lesson identification dynamically
  const getNextLesson = () => {
    if (!courses || courses.length === 0) return null;
    for (const course of courses) {
      if (course.lessons) {
        for (const lesson of course.lessons) {
          if (!completedLessons.includes(lesson.id)) {
            return {
              courseTitle: course.title,
              lesson: lesson
            };
          }
        }
      }
    }
    return {
      courseTitle: courses[0]?.title || 'Inglês Básico do Tatame',
      lesson: courses[0]?.lessons?.[0] || null
    };
  };

  const nextLessonInfo = getNextLesson();

  // Real-time ticking study timer
  const [studySeconds, setStudySeconds] = useState<number>(0);
  useEffect(() => {
    const stored = localStorage.getItem('jiuspeak_total_study_seconds');
    if (stored) {
      setStudySeconds(parseInt(stored, 10));
    } else {
      const estimatedSecs = (completedCount * 12 * 60) + 480;
      setStudySeconds(estimatedSecs);
      localStorage.setItem('jiuspeak_total_study_seconds', estimatedSecs.toString());
    }
  }, [completedCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStudySeconds(prev => {
        const next = prev + 1;
        localStorage.setItem('jiuspeak_total_study_seconds', next.toString());
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatStudyTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${remainingSecs}s`;
    }
    return `${mins}m ${remainingSecs}s`;
  };

  const [mission1Count, setMission1Count] = useState<number>(0);
  const [mission2Count, setMission2Count] = useState<number>(0);

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    const today = getTodayDateString();
    const m1 = localStorage.getItem(`jiuspeak_m1_class_${today}`) === 'true';
    const m2 = localStorage.getItem(`jiuspeak_m2_exercise_${today}`) === 'true';
    setMission1Count(m1 ? 1 : 0);
    setMission2Count(m2 ? 1 : 0);
  }, []);

  const toggleMission1 = () => {
    const today = getTodayDateString();
    const nextVal = mission1Count === 0 ? 1 : 0;
    setMission1Count(nextVal);
    localStorage.setItem(`jiuspeak_m1_class_${today}`, nextVal === 1 ? 'true' : 'false');
  };

  const toggleMission2 = () => {
    const today = getTodayDateString();
    const nextVal = mission2Count === 0 ? 1 : 0;
    setMission2Count(nextVal);
    localStorage.setItem(`jiuspeak_m2_exercise_${today}`, nextVal === 1 ? 'true' : 'false');
  };

  // Student ranking states and fetching
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(false);

  useEffect(() => {
    const fetchBoard = async () => {
      setLoadingLeaderboard(true);
      try {
        const res = await fetch('/api/pvp/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (data.leaderboard && data.leaderboard.length > 0) {
            setLeaderboard(removeFakeUsers(data.leaderboard).slice(0, 5));
          } else {
            setLeaderboard([]);
          }
        } else {
          setLeaderboard([]);
        }
      } catch (e) {
        setLeaderboard([]);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchBoard();
  }, []);

  // Active sessions audit configurations
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    setSessionError(null);
    try {
      const res = await authFetch('/api/auth/sessions');
      if (!res.ok) throw new Error('Não foi possível carregar as sessões do PostgreSQL.');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err: any) {
      setSessionError(err.message || 'Erro de rede.');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      const res = await authFetch('/api/auth/sessions/revoke-all', {
        method: 'POST'
      });
      if (res.ok) {
        await loadSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeSpecificSession = async (id: string) => {
    try {
      const res = await authFetch(`/api/auth/sessions/${id}/revoke`, {
        method: 'POST'
      });
      if (res.ok) {
        await loadSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Local state for editing form
  const [editForm, setEditForm] = useState({
    name: user.name,
    academy: user.academy || 'Gracie Barra International',
    category: user.category || 'Médio (-82.3kg)',
    guardsPreference: user.guardsPreference || 'Guarda Aberta Dinâmica',
    submitsPreference: user.submitsPreference || 'Mata-Leão Pelas Costas'
  });

  const handleSave = () => {
    updateUser(editForm);
    setIsEditing(false);
  };

  const getWinRate = () => {
    const total = user.winCount + user.lossCount;
    if (total === 0) return 0;
    return Math.round((user.winCount / total) * 100);
  };

  // Predefined lists for BJJ preferences
  const weightCategories = ['Pluma (-64kg)', 'Pena (-70kg)', 'Leve (-76kg)', 'Médio (-82.3kg)', 'Meio-Pesado (-88.3kg)', 'Pesado (-94.3kg)', 'Absoluto (Sem limite)'];
  const guardPreferences = ['Guarda Fechada de Aço', 'Laço de Borracha', 'Guarda Aberta Dinâmica', 'Meia Guarda Profunda', 'Passador Pressão Brutal', 'Guarda Aranha Flexível'];
  const submissionPreferences = ['Estrangulamento Cruzado', 'Armlock Voador', 'Mata-Leão Pelas Costas', 'Triângulo no Aperto', 'Chave de Pé Estilo Caipira', 'Mão de Vaca Oculta'];

  return (
    <div 
      className="min-h-screen w-full relative bg-cover bg-center bg-no-repeat bg-fixed py-6 sm:py-8 lg:py-10"
      style={{
        backgroundImage: `
          linear-gradient(to bottom, rgba(2, 6, 23, 0.95), rgba(3, 7, 18, 0.98), rgba(0, 8, 20, 0.99)),
          url('https://www.jiuspeak.com.br/images/hero-bg.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
      id="cinematic-rpg-dashboard"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-11">
        
        {/* Title and Operations Core Selector Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/45 p-6 rounded-2xl border border-zinc-900 shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest mb-1.5 font-bold">
              <Sparkles className="w-4 h-4 fill-blue-400/20 text-blue-400" />
              <span>Plataforma Internacional AAA • Edição de Atleta</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase font-sans">
              Seu próximo passo: <span className="text-blue-400">competir internacionalmente.</span>
            </h1>
            <p className="text-zinc-400 text-xs mt-1 font-normal font-sans">
              Continue evoluindo sua comunicação no jiu-jitsu e amplie os horizontes de sua carreira no tatame global.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button 
              onClick={() => onNavigate('lessons')}
              className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all flex items-center gap-2 cursor-pointer font-sans uppercase tracking-wider"
            >
              <BookOpen className="w-3.5 h-3.5" /> Módulos Teóricos
            </button>
            <button 
              onClick={() => onNavigate('pvp')}
              className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer font-sans uppercase tracking-wider"
            >
              <Sword className="w-3.5 h-3.5 text-blue-400" /> Tatame Virtual PvP
            </button>
          </div>
        </div>

        {/* Dynamic Continue studying station card */}
        <div className="bg-gradient-to-r from-blue-950/20 via-zinc-950/65 to-indigo-950/20 border border-blue-500/15 p-5 sm:p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition duration-500" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left side detail study route */}
            <div className="md:col-span-8 space-y-3.5">
              <span className="text-[10px] bg-blue-500/15 text-blue-400 font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-blue-500/20 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                Estação Ativa de Treinamento
              </span>
              <div>
                <h3 className="text-white text-base sm:text-lg font-black tracking-tight font-sans">
                  {nextLessonInfo?.lesson?.title || 'Todas as aulas concluídas! 🎉'}
                </h3>
                <p className="text-zinc-400 text-xs mt-1 leading-normal font-sans">
                  {nextLessonInfo?.lesson?.description || 'Você completou 100% da apostila. Siga praticando nas arenas de matchmaking.'}
                </p>
              </div>

              {nextLessonInfo?.lesson && (
                <button
                  onClick={() => onNavigate('lessons')}
                  className="mt-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer font-sans uppercase tracking-wider"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Iniciar Aula ({nextLessonInfo.lesson.duration})
                </button>
              )}
            </div>

            {/* Progress metrics ring card */}
            <div className="md:col-span-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/60 flex items-center gap-4.5 justify-center">
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90 shrink-0">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="text-zinc-850"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="text-blue-500 transition-all duration-1000"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xs font-black font-mono text-white">
                  {progressPercent}%
                </span>
              </div>
              
              <div className="space-y-0.5">
                <span className="block text-[9px] text-zinc-500 font-black tracking-wider uppercase font-mono">Status Estudo</span>
                <p className="text-xs font-bold text-zinc-100 font-mono">
                  {completedCount} de {totalLessons} Módulos
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Access Central Hub Section */}
        <div className="space-y-4" id="bjj-student-panel-quick-access">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
            <h2 className="text-sm font-black text-white tracking-widest uppercase font-sans flex items-center gap-2">
              <span className="text-amber-500 animate-pulse text-base">⚡</span>
              Acesso Rápido
            </h2>
            <span className="text-[10px] bg-amber-500/10 text-amber-100 border border-amber-500/20 font-mono tracking-wider font-extrabold px-2 py-0.5 rounded-full uppercase select-none animate-pulse">
              Atalhos de Atleta
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 'profile-settings',
                title: 'Meu Perfil',
                description: 'Gerencie suas informações pessoais, foto, preferências e configurações da conta.',
                icon: User,
                color: 'border-violet-500/10 text-violet-400 bg-violet-500/5',
                hoverColor: 'border-violet-500/40 hover:shadow-violet-600/15',
                iconBg: 'bg-violet-500/10 text-violet-400'
              },
              {
                id: 'inventory',
                title: 'Mochila do Aluno',
                description: 'Visualize itens, recompensas, equipamentos, conquistas e benefícios obtidos na plataforma.',
                icon: Backpack,
                color: 'border-blue-500/10 text-blue-400 bg-blue-500/5',
                hoverColor: 'border-blue-500/40 hover:shadow-blue-600/15',
                iconBg: 'bg-blue-500/10 text-blue-400'
              },
              {
                id: 'social',
                title: 'Comunidade',
                description: 'Conecte-se com outros praticantes, participe de discussões e compartilhe experiências.',
                icon: Users,
                color: 'border-pink-500/10 text-pink-400 bg-pink-500/5',
                hoverColor: 'border-pink-500/40 hover:shadow-pink-600/15',
                iconBg: 'bg-pink-500/10 text-pink-400'
              },
              {
                id: 'academies',
                title: 'Academias BJJ',
                description: 'Encontre academias parceiras e conecte-se com a comunidade local.',
                icon: Building2,
                color: 'border-emerald-500/10 text-emerald-400 bg-emerald-500/5',
                hoverColor: 'border-emerald-500/40 hover:shadow-emerald-600/15',
                iconBg: 'bg-emerald-500/10 text-emerald-400'
              },
              {
                id: 'market',
                title: 'Loja JiuSpeak (JT)',
                description: 'Utilize seus JiuTickets para adquirir benefícios e produtos disponíveis.',
                icon: Store,
                color: 'border-amber-500/10 text-amber-400 bg-amber-500/5',
                hoverColor: 'border-amber-500/40 hover:shadow-amber-600/15',
                iconBg: 'bg-amber-500/10 text-amber-400'
              },
              {
                id: 'subscriptions',
                title: 'Central de JiuTickets',
                description: 'Gerencie saldo, histórico e movimentações de JiuTickets.',
                icon: Coins,
                color: 'border-cyan-500/10 text-cyan-400 bg-cyan-500/5',
                hoverColor: 'border-cyan-500/40 hover:shadow-cyan-600/15',
                iconBg: 'bg-cyan-500/10 text-cyan-400'
              }
            ].map((card) => {
              const CardIcon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  onClick={() => onNavigate(card.id)}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`p-5 rounded-2xl bg-[#0b101f]/70 border ${card.color} group hover:${card.hoverColor} hover:bg-slate-900/40 transition-all duration-300 cursor-pointer flex gap-4 items-start shadow-xl`}
                >
                  <div className={`p-3 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                    <CardIcon className="w-5 h-5 lg:w-6 h-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-display font-bold text-sm text-zinc-100 group-hover:text-white transition-colors flex items-center gap-1.5">
                      {card.title}
                      <span className="text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                    </h3>
                    <p className="text-zinc-400 text-xs font-normal leading-relaxed font-sans">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Left Columns (span 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Athlete operations banner */}
            <AthleteHero 
              user={user} 
              updateUser={updateUser} 
              studySeconds={studySeconds}
              formatStudyTime={formatStudyTime}
            />

            {/* RPG levels indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <XPProgress 
                user={user} 
                totalLessons={totalLessons} 
                completedCount={completedCount} 
                progressPercent={progressPercent} 
              />
              <MissionCard 
                mission1Count={mission1Count}
                mission2Count={mission2Count}
                toggleMission1={toggleMission1}
                toggleMission2={toggleMission2}
              />
            </div>

            {/* Syllabus belt path */}
            <BeltProgression user={user} />

            {/* Fighter attributes profile */}
            <AthleteProfile
              user={user}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              editForm={editForm}
              setEditForm={setEditForm}
              handleSave={handleSave}
              getWinRate={getWinRate}
              weightCategories={weightCategories}
              guardPreferences={guardPreferences}
              submissionPreferences={submissionPreferences}
            />

            {/* Active Database Sessions & Token Audits (Enterprise Security) */}
            <div className="bg-[#0b101f]/70 p-5 sm:p-6 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight font-sans">Controle de Sessões Criptográficas</h4>
                    <p className="text-[9px] text-zinc-500 font-mono">AUTENTICAÇÃO ROTATIVA PERSISTENTE (OWASP ASVS)</p>
                  </div>
                </div>
                <button 
                  onClick={loadSessions}
                  disabled={isLoadingSessions}
                  className="p-1 px-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer font-mono"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                  SYNC
                </button>
              </div>

              {sessionError && (
                <div className="p-3 bg-rose-950/20 border border-rose-900/60 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>{sessionError}</span>
                </div>
              )}

              {isLoadingSessions ? (
                <div className="py-6 text-center text-xs text-zinc-505 font-mono">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-blue-400" />
                  Verificando sessões no PostgreSQL persistente...
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">Nenhuma outra sessão ativa encontrada.</p>
                  ) : (
                    <div className="divide-y divide-zinc-900">
                      {sessions.map((sess: any) => {
                        return (
                          <div key={sess.id} className="py-2.5 flex items-center justify-between text-xs gap-4 font-sans">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <Monitor className={`w-4 h-4 mt-0.5 ${sess.isCurrent ? "text-emerald-400" : "text-zinc-500"}`} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-200 truncate max-w-[180px] md:max-w-[280px]">
                                    {sess.userAgent || "Navegador Desconhecido"}
                                  </span>
                                  {sess.isCurrent && (
                                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider font-extrabold animate-pulse">
                                      Atual
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                  IP: <span className="text-zinc-400">{sess.ipAddress || "Interno"}</span> • Logged: <span className="text-zinc-500">{new Date(sess.createdAt).toLocaleDateString()}</span>
                                </p>
                              </div>
                            </div>

                            {!sess.isCurrent && (
                              <button
                                onClick={() => handleRevokeSpecificSession(sess.id)}
                                title="Encerrar sessão imediatamente"
                                className="p-1 px-2.5 bg-zinc-950 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/40 rounded-lg text-[10px] uppercase font-mono transition-all cursor-pointer font-bold"
                              >
                                Encerrar
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {sessions.length > 1 && (
                    <div className="pt-3 border-t border-zinc-900 flex justify-end">
                      <button
                        onClick={handleRevokeAllOtherSessions}
                        className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/60 hover:border-rose-900 text-rose-200 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer font-sans"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        Encerrar Outras Sessões Globais
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right Columns (span 4) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Global community cards */}
            <CommunityCard />

            {/* Ranking de Alunos (Top ELO) */}
            <div className="bg-[#0b101f]/70 p-5 sm:p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight font-sans">Leaderboard Dojo</h3>
                    <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Top Fluency ELO</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-sans">
                Pratique nas arenas interativas de matchmaking para acumular pontos de ELO e escalar até o topo do ranking global.
              </p>

              {loadingLeaderboard ? (
                <div className="py-8 text-center text-xs text-zinc-505 font-mono">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-blue-405" />
                  Carregando posições...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leaderboard.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500 font-sans italic" id="empty-leaderboard-dojo">
                      Nenhum atleta ranqueado ainda.
                    </div>
                  ) : (
                    leaderboard.map((player, idx) => {
                      const isUser = player.name === user.name;
                      const rankIcons = ['🥇', '🥈', '🥉'];
                      const isTop3 = idx < 3;
                      
                      return (
                        <div 
                          key={player.id || idx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all duration-300 font-sans ${
                            isUser 
                              ? 'bg-blue-500/10 border-blue-500/35 ring-1 ring-blue-500/20' 
                              : 'bg-zinc-950/60 border-zinc-900/60 hover:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Position Indicator */}
                            <div className="w-6 h-6 flex items-center justify-center font-mono text-xs font-black text-zinc-400">
                              {isTop3 ? rankIcons[idx] : `#${idx + 1}`}
                            </div>
                            
                            {/* Avatar picture */}
                            <div 
                              className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center text-sm border border-zinc-700 shadow-sm relative shrink-0 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                              onClick={() => {
                                if (player.username) {
                                  onNavigate('profile-public-' + player.username);
                                }
                              }}
                            >
                              {(player.profilePhoto || player.avatar) && ((player.profilePhoto || player.avatar).startsWith('http') || (player.profilePhoto || player.avatar).startsWith('/') || (player.profilePhoto || player.avatar).includes('.') || (player.profilePhoto || player.avatar).includes('api.dicebear.com')) ? (
                                <img 
                                  src={player.profilePhoto || player.avatar} 
                                  alt={player.name} 
                                  className="w-full h-full object-cover rounded-full" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                player.profilePhoto || player.avatar || '🥋'
                              )}
                              {/* Belt status badge overlay */}
                              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                                (player.belt === 'Branca' || String(player.belt).toUpperCase() === 'WHITE') ? 'bg-zinc-100 border-zinc-300' :
                                (player.belt === 'Azul' || String(player.belt).toUpperCase() === 'BLUE') ? 'bg-blue-500' :
                                (player.belt === 'Roxa' || String(player.belt).toUpperCase() === 'PURPLE') ? 'bg-purple-600' :
                                (player.belt === 'Marrom' || String(player.belt).toUpperCase() === 'BROWN') ? 'bg-amber-700' : 'bg-red-650'
                              }`} />
                            </div>

                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isUser ? 'text-blue-300' : 'text-zinc-200'}`}>
                                <span
                                  className="cursor-pointer hover:text-blue-400 transition-colors"
                                  onClick={() => {
                                    if (player.username) {
                                      onNavigate('profile-public-' + player.username);
                                    }
                                  }}
                                >
                                  {player.name}
                                </span>
                                {isUser && <span className="ml-1 text-[8px] font-black uppercase text-blue-400 bg-blue-500/10 px-1 rounded font-mono">Você</span>}
                              </p>
                              <span className="text-[9px] text-zinc-500 block font-mono">
                                Nível {player.level || 1} • {
                                  (() => {
                                    const b = String(player.belt || '').toUpperCase();
                                    if (b === 'WHITE') return 'Branca';
                                    if (b === 'BLUE') return 'Azul';
                                    if (b === 'PURPLE') return 'Roxa';
                                    if (b === 'BROWN') return 'Marrom';
                                    if (b === 'BLACK') return 'Preta';
                                    return player.belt || 'Branca';
                                  })()
                                }
                              </span>
                            </div>
                          </div>

                          {/* score ELO */}
                          <div className="text-right whitespace-nowrap bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 font-bold text-xs text-blue-400 font-mono">
                            {player.elo} <span className="text-[9px] text-zinc-500">ELO</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Daily Streak calendar panel */}
            <div className="bg-[#0b101f]/70 p-5 sm:p-6 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight font-sans flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                  <span>Ofensiva Regrada</span>
                </h3>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold font-mono">
                  {user.streak} DIAS SEGUIDOS
                </span>
              </div>

              <p className="text-xs text-zinc-400 mb-4 font-normal font-sans">
                Treine seu vocabulário diariamente para blindar seu engajamento intelectual e manter o bônus de XP intacto.
              </p>

              {/* Grid representation */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-zinc-500">
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="block text-zinc-400 font-bold">{day}</span>
                    <div className={`h-8 rounded-md flex items-center justify-center transition-all ${
                      idx < Math.min(7, user.streak)
                        ? 'bg-orange-500 text-slate-950 font-bold shadow-lg shadow-orange-500/25' 
                        : 'bg-zinc-950 border border-zinc-900 text-zinc-600'
                    }`}>
                      {idx < Math.min(7, user.streak) ? '🔥' : '•'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-900 text-[10px] text-zinc-500 font-mono text-center">
                Última Atividade: {user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString('pt-BR') : 'Hoje'}
              </div>
            </div>

            {/* Achievements panel */}
            <div className="bg-[#0b101f]/70 p-5 sm:p-6 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
                <h3 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight font-sans">
                  🏆 Medalheiro do Atleta
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">
                  {achievements.filter(a => a.isUnlocked).length} / {achievements.length}
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {achievements.map((ach) => {
                  const canClaim = ach.progressCurrent !== undefined && ach.progressMax !== undefined && (ach.progressCurrent >= ach.progressMax) && !ach.isUnlocked;
                  
                  return (
                    <div 
                      key={ach.id} 
                      className={`p-3 rounded-xl border transition-all ${
                        ach.isUnlocked 
                          ? 'bg-zinc-950/20 border-emerald-500/10 opacity-70' 
                          : 'bg-zinc-950/60 border-zinc-900'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 text-xs font-sans">
                        <div>
                          <h4 className="font-bold text-zinc-200 flex items-center gap-1">
                            {ach.isUnlocked ? '🏆 ' : '🔒 '}
                            {ach.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-1 leading-normal">{ach.description}</p>
                        </div>

                        {/* Reward Badges */}
                        <div className="text-right shrink-0">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                            +{ach.xpReward} XP
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-bold border border-yellow-500/20 block mt-1">
                            +{ach.coinReward} JT
                          </span>
                        </div>
                      </div>

                      {/* Achievements progression */}
                      {ach.progressMax && ach.progressCurrent !== undefined && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-900 flex items-center justify-between gap-4">
                          <div className="flex-1 bg-zinc-900 rounded-full h-1 relative overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, (ach.progressCurrent / ach.progressMax) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                            {ach.progressCurrent}/{ach.progressMax}
                          </span>
                        </div>
                      )}

                      {/* Redeem feature */}
                      {!ach.isUnlocked && (
                        <div className="mt-3 flex justify-end">
                          <button
                            disabled={ach.progressCurrent !== undefined && ach.progressMax !== undefined && (ach.progressCurrent < ach.progressMax)}
                            onClick={() => claimAchievement(ach.id)}
                            className={`w-full py-1.5 rounded text-[10px] font-bold text-center uppercase tracking-wider transition-all cursor-pointer font-sans ${
                              (ach.progressCurrent === undefined || (ach.progressCurrent >= (ach.progressMax || 1)))
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-zinc-905 text-zinc-500 border border-zinc-900 cursor-not-allowed'
                            }`}
                          >
                            {(ach.progressCurrent === undefined || (ach.progressCurrent >= (ach.progressMax || 1))) ? '🔄 RESGATAR RECOMPENSA' : 'Em progresso'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
