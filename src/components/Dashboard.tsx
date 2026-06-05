/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  MapPin, 
  Scale, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Edit3, 
  Sparkles,
  BookOpen,
  Sword,
  Coins,
  Tv,
  Monitor,
  KeyRound,
  ShieldAlert,
  RefreshCw,
  Trash2,
  Clock,
  Target,
  Award,
  Shield,
  ListOrdered
} from 'lucide-react';
import { UserProfile, Achievement, BeltRank, Course } from '../types';

interface DashboardProps {
  user: UserProfile;
  achievements: Achievement[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  claimAchievement: (id: string) => void;
  onNavigate: (tab: string) => void;
  courses?: Course[];
}

export default function Dashboard({ user, achievements, updateUser, claimAchievement, onNavigate, courses = [] }: DashboardProps) {
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
    // Fallback: first lesson in first course if all are finished or none found
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
      // Intuitively estimate based on completed count so they don't see 0 mins when they already studied
      const estimatedSecs = (completedCount * 12 * 60) + 480; // 12 mins per lesson + 8 mins initial buffer
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

  // Daily Missions status checked & persisted safely for today's date
  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [mission1Count, setMission1Count] = useState<number>(0); // Watch 1 class
  const [mission2Count, setMission2Count] = useState<number>(0); // Complete 1 exercise

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

  // Realistic dynamic bjj belt CSS widget
  const renderBjjBeltCSS = (belt: BeltRank, stripes: number) => {
    const beltColors: Record<BeltRank, string> = {
      'Branca': 'bg-slate-200 border-slate-350 text-slate-800',
      'Azul': 'bg-blue-600 border-blue-700 text-blue-50',
      'Roxa': 'bg-purple-700 border-purple-800 text-purple-50',
      'Marrom': 'bg-amber-800 border-amber-900 text-amber-50',
      'Preto': 'bg-neutral-900 border-neutral-950 text-red-500',
    };

    const barColor = belt === 'Preto' ? 'bg-red-600' : 'bg-neutral-900';
    const beltBg = beltColors[belt] || 'bg-slate-200 border-slate-350 text-slate-800';

    return (
      <div className={`relative h-12 w-full max-w-[320px] rounded-xl shadow-inner border flex items-center justify-between overflow-hidden p-1.5 ${beltBg}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/15 pointer-events-none" />
        <span className="z-10 pl-3 font-display font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-current rounded-full" />
          {belt === 'Branca' && 'White Belt'}
          {belt === 'Azul' && 'Blue Belt'}
          {belt === 'Roxa' && 'Purple Belt'}
          {belt === 'Marrom' && 'Brown Belt'}
          {belt === 'Preto' && 'Black Belt'}
          {` (${belt})`}
        </span>
        <div className={`relative h-full w-[85px] rounded border border-white/5 flex items-center justify-evenly px-2 ${barColor}`}>
          {stripes === 0 ? (
            <span className="text-[7px] font-mono text-white/50 font-bold tracking-tighter">0 GRAUS</span>
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i} 
                className={`h-6 w-1 rounded-sm transition-all ${
                  i < stripes ? 'bg-white shadow-sm shadow-black/80' : 'bg-transparent'
                }`} 
              />
            ))
          )}
        </div>
      </div>
    );
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
            setLeaderboard(data.leaderboard.slice(0, 5));
          } else {
            setLeaderboard(STATIC_LEADERBOARD);
          }
        } else {
          setLeaderboard(STATIC_LEADERBOARD);
        }
      } catch (e) {
        setLeaderboard(STATIC_LEADERBOARD);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchBoard();
  }, []);

  const STATIC_LEADERBOARD = [
    { id: '1', name: 'Jean-Jacques Machado', elo: 2450, belt: 'Preto', level: 32, avatar: '🤼' },
    { id: '2', name: 'Kyra Gracie', elo: 2320, belt: 'Marrom', level: 28, avatar: '🥋' },
    { id: '3', name: 'Braulio Estima', elo: 2210, belt: 'Marrom', level: 25, avatar: '🧬' },
    { id: '4', name: 'Marcelo Garcia', elo: 2190, belt: 'Preto', level: 35, avatar: '🦁' },
    { id: '5', name: 'Renzo Gracie', elo: 2120, belt: 'Preto', level: 30, avatar: '🦅' }
  ];

  // Active sessions audit configurations
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    setSessionError(null);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) throw new Error('Autenticação necessária.');

      const res = await fetch('/api/auth/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/auth/sessions/revoke-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/auth/sessions/${id}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
    academy: user.academy,
    category: user.category,
    guardsPreference: user.guardsPreference,
    submitsPreference: user.submitsPreference
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

  const beltRoadmap: { belt: BeltRank; avgLvl: number; reqXp: number; unlocked: boolean; color: string }[] = [
    { belt: 'Branca', avgLvl: 1, reqXp: 0, unlocked: true, color: 'border-slate-300 text-slate-100 bg-slate-800' },
    { belt: 'Azul', avgLvl: 5, reqXp: 1200, unlocked: user.level >= 5 || user.belt !== 'Branca', color: 'border-blue-500 text-blue-200 bg-blue-950/40' },
    { belt: 'Roxa', avgLvl: 12, reqXp: 3000, unlocked: ['Roxa', 'Marrom', 'Preto'].includes(user.belt), color: 'border-purple-500 text-purple-200 bg-purple-950/40' },
    { belt: 'Marrom', avgLvl: 20, reqXp: 6000, unlocked: ['Marrom', 'Preto'].includes(user.belt), color: 'border-amber-600 text-amber-200 bg-amber-950/40' },
    { belt: 'Preto', avgLvl: 30, reqXp: 10000, unlocked: user.belt === 'Preto', color: 'border-red-600 text-red-100 bg-slate-900 border-2 shadow-red-500/20 shadow' },
  ];

  return (
    <div className="space-y-6" id="bjj-dashboard">
      {/* Top Welcome Title */}
      <div className="bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-indigo-950/20 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pulse-glow -z-10" />
        
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 fill-violet-400/20 text-violet-400" />
            <span>Escola de Idiomas JiuSpeak</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
            Oss, {user.name}! 🎓
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Sua jornada educacional definitiva rumo à fluência em inglês para praticantes de Jiu-Jítsu. Domine a terminologia teórica nos nossos módulos acadêmicos, aprimore sua conversação em sessões práticas e explore materiais exclusivos.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('lessons')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" /> Ver Módulos
          </button>
          <button 
            onClick={() => onNavigate('pvp')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sword className="w-3.5 h-3.5 text-indigo-400" /> Sessões Práticas
          </button>
        </div>
      </div>

      {/* Main Grid: Left Athlete Bio & Pathway / Right Calendar & Achievements */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side (Col span 2) athlete profiles & pathways */}
        <div className="xl:col-span-2 space-y-6">

          {/* Card Principal: Continue de Onde Parou */}
          <div className="bg-gradient-to-br from-[#121c32] via-[#0b101c] to-[#0d1627] p-6 rounded-2xl border border-indigo-500/20 shadow-xl relative overflow-hidden group">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all duration-500 pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-40 h-40 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] bg-indigo-500/15 text-indigo-400 font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                Estação de Estudos
              </span>
              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sincronizado via LocalStorage
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left & Middle details: Course Info */}
              <div className="md:col-span-2 space-y-3.5">
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">Continue de Onde Parou:</span>
                <div>
                  <h4 className="text-white text-base font-extrabold tracking-tight line-clamp-1">
                    {nextLessonInfo?.lesson?.title || 'Todas as aulas concluídas! 🎉'}
                  </h4>
                  <p className="text-slate-400 text-xs font-normal mt-1 leading-relaxed line-clamp-2">
                    {nextLessonInfo?.lesson?.description || 'Você completou 100% da apostila. Continue praticando seu inglês nas arenas PvP e desafiando novos oponentes.'}
                  </p>
                </div>

                {nextLessonInfo?.lesson && (
                  <button
                    onClick={() => onNavigate('lessons')}
                    className="mt-1.5 p-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Estudar Agora ({nextLessonInfo.lesson.duration})
                  </button>
                )}
              </div>

              {/* Right details: Progress Circle / Stats */}
              <div className="bg-[#070b14]/50 p-4 rounded-xl border border-slate-900 flex flex-col justify-center items-center gap-3 text-center">
                <div className="relative flex items-center justify-center">
                  {/* Progress Ring */}
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="text-slate-850"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="text-violet-500 transition-all duration-1000"
                      strokeWidth="5"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - progressPercent / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-xs font-black font-mono text-white">
                    {progressPercent}%
                  </span>
                </div>
                
                <div className="space-y-1">
                  <span className="block text-[9.5px] text-slate-500 font-bold tracking-wider uppercase font-mono">Progresso Total</span>
                  <span className="text-[10.5px] font-mono text-indigo-350 font-bold">
                    {completedCount} de {totalLessons} Aulas
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom bar studies metadata: elapsed study timer */}
            <div className="mt-5 pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Tempo Estudado (Sessão Ativa):</span>
                <span className="text-indigo-400 font-bold text-xs">{formatStudyTime(studySeconds)}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono italic">
                Aulas assistidas geram Kimono Coins de recompensa automaticamente.
              </span>
            </div>
          </div>

          {/* Missões Diárias e Faixa Atual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Panel: Missão Diária */}
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-900">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-200">Missões Diárias</h4>
                      <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Fature XP + Kimono Coins</p>
                    </div>
                  </div>
                  <span className="bg-[#0f1d32] text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                    {((mission1Count + mission2Count) === 2) ? 'Completo! 🎉' : `${mission1Count + mission2Count}/2 Concluído`}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug mb-4">
                  Complete essas missões de estudo hoje e garanta bônus extras de proficiência na plataforma!
                </p>

                <div className="space-y-2.5">
                  <div 
                    onClick={toggleMission1}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      mission1Count > 0 
                        ? 'bg-emerald-950/15 border-emerald-500/30' 
                        : 'bg-[#060a12] border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-5 h-5 rounded-sm flex items-center justify-center transition-all border ${
                        mission1Count > 0 
                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                          : 'border-slate-700 bg-slate-900 group-hover:border-indigo-500'
                      }`}>
                        {mission1Count > 0 && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${mission1Count > 0 ? 'text-emerald-400 line-through font-medium' : 'text-slate-300'}`}>
                          Assistir 1 aula acadêmica
                        </p>
                        <span className="text-[9.5px] text-slate-500 block font-mono">Válido em qualquer módulo</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-0.5 whitespace-nowrap text-[8.5px] font-mono">
                      <span className="text-orange-400 font-black">+100 XP</span>
                      <span className="text-violet-400 font-black">+10 KC</span>
                    </div>
                  </div>

                  <div 
                    onClick={toggleMission2}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      mission2Count > 0 
                        ? 'bg-emerald-950/15 border-emerald-500/30' 
                        : 'bg-[#060a12] border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-5 h-5 rounded-sm flex items-center justify-center transition-all border ${
                        mission2Count > 0 
                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                          : 'border-slate-700 bg-slate-900 group-hover:border-indigo-500'
                      }`}>
                        {mission2Count > 0 && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${mission2Count > 0 ? 'text-emerald-400 line-through font-medium' : 'text-slate-300'}`}>
                          Completar 1 exercício prático
                        </p>
                        <span className="text-[9.5px] text-slate-500 block font-mono">Válido na Arena PvP</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-0.5 whitespace-nowrap text-[8.5px] font-mono">
                      <span className="text-orange-400 font-black">+150 XP</span>
                      <span className="text-violet-400 font-black">+15 KC</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Reseta à meia-noite</span>
                { (mission1Count + mission2Count) === 2 && (
                  <span className="text-emerald-400 font-bold uppercase animate-pulse">Parabéns! Tudo Completo</span>
                )}
              </div>
            </div>

            {/* Panel: Faixa Atual */}
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-900">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-violet-400" />
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-200">Faixa Atual</h4>
                      <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Patente de Fluência</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">Nível {user.level}</span>
                </div>

                <div className="py-2.5 flex justify-center">
                  {renderBjjBeltCSS(user.belt, user.stripes)}
                </div>

                <p className="text-[11px] text-slate-400 leading-snug mt-2 text-center md:text-left">
                  {user.belt === 'Branca' && 'Sua jornada iniciou! Domine o vocabulário básico, nomes de kimono e posições do tatame.'}
                  {user.belt === 'Azul' && 'Faixa Azul! Você já domina termos de guarda, raspagens e transições básicas.'}
                  {user.belt === 'Roxa' && 'Faixa Roxa! O domínio de estrangulamentos complexos e combos dinâmicos começou.'}
                  {user.belt === 'Marrom' && 'Faixa Marrom! Excelente fluência com capacidade de explicar técnicas livremente.'}
                  {user.belt === 'Preto' && 'Faixa Preta! Fluência impecável e domínio técnico integral de terminologia BJJ.'}
                </p>
              </div>

              {/* Belt progression bar */}
              <div className="mt-4 pt-3 border-t border-slate-900/60 space-y-1">
                <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-400">
                  <span>XP Atual: <span className="text-white font-bold">{user.xp} XP</span></span>
                  <span>Próximo nível: <span className="text-indigo-400 font-bold">{user.xpNextLevel} XP</span></span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (user.xp / user.xpNextLevel) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Athlete Profile Card */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80 relative">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-display font-bold text-lg text-slate-200">Perfil do Atleta (Fighter Registry)</h3>
              </div>
              <button
                onClick={() => {
                  if (isEditing) handleSave();
                  else setIsEditing(true);
                }}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3 text-violet-400" />
                {isEditing ? 'Salvar Perfil' : 'Editar Atributos'}
              </button>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[10px] uppercase">Apelido do Lutador</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[10px] uppercase">Escola / Academia</label>
                  <input
                    type="text"
                    value={editForm.academy}
                    onChange={(e) => setEditForm({ ...editForm, academy: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[10px] uppercase">Categoria de Peso</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    {weightCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[10px] uppercase">Especialidade de Guarda / Passing</label>
                  <select
                    value={editForm.guardsPreference}
                    onChange={(e) => setEditForm({ ...editForm, guardsPreference: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    {guardPreferences.map((grd) => (
                      <option key={grd} value={grd}>{grd}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-slate-500 font-mono text-[10px] uppercase">Finalização Assinatura</label>
                  <select
                    value={editForm.submitsPreference}
                    onChange={(e) => setEditForm({ ...editForm, submitsPreference: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    {submissionPreferences.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Academy metadata */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase mb-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>Academia</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.academy}</p>
                </div>

                {/* Category Weight */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase mb-1">
                    <Scale className="w-3.5 h-3.5 text-blue-400" />
                    <span>Categoria</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.category}</p>
                </div>

                {/* Guard Preference */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                    <span>Preferência</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.guardsPreference}</p>
                </div>

                {/* Signature Submissions */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase mb-1">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                    <span>Assinatura</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.submitsPreference}</p>
                </div>

              </div>
            )}

            {/* Quick stats indicators */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/40 text-center">
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Arena ELO</span>
                <span className="text-lg font-bold text-violet-400 tracking-tight">{user.elo} elo</span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Sparring W/L</span>
                <span className="text-lg font-bold text-slate-200 tracking-tight">
                  <span className="text-emerald-500">{user.winCount}</span>
                  <span className="text-slate-600 font-normal">/</span>
                  <span className="text-red-500">{user.lossCount}</span>
                </span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Aproveitamento</span>
                <span className="text-lg font-bold text-yellow-500 tracking-tight">{getWinRate()}%</span>
              </div>
            </div>
          </div>

          {/* Active Database Sessions & Token Audits (Enterprise Security) */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-200">Segurança da Conta (Sessões SQL)</h4>
                  <p className="text-[10px] text-slate-500 font-mono">AUTENTICAÇÃO ROTATIVA ENTERPRISE (OWASP ASVS)</p>
                </div>
              </div>
              <button 
                onClick={loadSessions}
                disabled={isLoadingSessions}
                className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            {sessionError && (
              <div className="p-3 bg-red-950/20 border border-red-900/60 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>{sessionError}</span>
              </div>
            )}

            {isLoadingSessions ? (
              <div className="py-6 text-center text-xs text-slate-500 font-mono">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-violet-500" />
                Consultando sessões ativas no PostgreSQL...
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhuma outra sessão ativa encontrada.</p>
                ) : (
                  <div className="divide-y divide-slate-900">
                    {sessions.map((sess: any) => {
                      return (
                        <div key={sess.id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <Monitor className={`w-4 h-4 mt-0.5 ${sess.isCurrent ? "text-emerald-400" : "text-slate-500"}`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-200 truncate max-w-[180px] md:max-w-[280px]">
                                  {sess.userAgent || "Navegador Desconhecido"}
                                </span>
                                {sess.isCurrent && (
                                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">
                                    Atual
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                IP: <span className="text-slate-300">{sess.ipAddress || "Interno"}</span> • Criado em: <span className="text-slate-500">{new Date(sess.createdAt).toLocaleDateString()}</span>
                              </p>
                            </div>
                          </div>

                          {!sess.isCurrent && (
                            <button
                              onClick={() => handleRevokeSpecificSession(sess.id)}
                              title="Encerrar sessão imediatamente"
                              className="p-1 px-2.5 bg-slate-900 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900/40 rounded-lg text-[10px] uppercase font-mono transition-all cursor-pointer"
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
                  <div className="pt-3 border-t border-slate-900 flex justify-end">
                    <button
                      onClick={handleRevokeAllOtherSessions}
                      className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/60 hover:border-red-900 text-red-200 hover:text-red-100 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      Encerrar Outras Sessões Globais
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gamified Belt Trail Roadmap (Duolingo Belt map) */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-slate-200 flex items-center gap-2">
                <span>🛣️</span> Progressão de Faixas Acadêmicas (Syllabus Route)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Suba o nível da sua faixa avançando nos Módulos Curriculares e praticando seu vocabulário nas sessões interativas.
              </p>
            </div>

            {/* Path UI */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2 relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800/60 hidden md:block -translate-y-1/2 -z-10" />
              
              {beltRoadmap.map((node, idx) => {
                const isActive = user.belt === node.belt;
                const translatedBelt = 
                  node.belt === 'Branca' ? 'White Belt' :
                  node.belt === 'Azul' ? 'Blue Belt' :
                  node.belt === 'Roxa' ? 'Purple Belt' :
                  node.belt === 'Marrom' ? 'Brown Belt' : 'Black Belt';
                
                return (
                  <div 
                    key={node.belt}
                    className="flex-1 flex flex-row md:flex-col items-center gap-3 bg-slate-900/30 md:bg-transparent p-3 md:p-0 rounded-xl border border-slate-800/40 md:border-none relative z-10"
                  >
                    {/* Circle Node */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all relative ${
                      node.unlocked 
                        ? 'bg-slate-900 hover:scale-105 shadow-md shadow-violet-500/10' 
                        : 'bg-slate-950 opacity-40 border-slate-800 text-slate-600'
                    } ${node.color} ${isActive ? 'scale-110 ring-4 ring-violet-500/30' : ''}`}>
                      {node.unlocked ? (
                        <CheckCircle2 className={`w-5 h-5 ${isActive ? 'text-violet-400 animate-pulse' : 'text-emerald-500'}`} />
                      ) : (
                        <span className="text-xs font-bold font-mono">BLOQUEADO</span>
                      )}
                      
                      {/* Interactive current pointer */}
                      {isActive && (
                        <span className="absolute -top-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-[8px] font-mono font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                          ATUAL
                        </span>
                      )}
                    </div>

                    {/* Metadata text */}
                    <div className="text-left md:text-center min-w-0">
                      <p className="font-display font-bold text-xs text-slate-100">{translatedBelt}</p>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {node.belt === 'Branca' ? 'Iniciante' : `Min. Nível ${node.avgLvl}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-slate-900/50 p-3 h-11 rounded-lg border border-slate-800/40 mt-5 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                Dica do Mestre: "Mantenha gola tensionada e postura firme."
              </span>
              <span className="text-[10px] text-slate-500">Auto-Refresco 5s</span>
            </div>
          </div>

        </div>

        {/* Right Side: Daily Flame Streaks & Achievements Board */}
        <div className="space-y-6">

          {/* Ranking de Alunos (Top Fluency) */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
            {/* Elegant Background Grid Subtle Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 pointer-events-none transition-all duration-500" />
            
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-display font-bold text-base text-slate-205">Ranking de Alunos</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Duelos de Fluência (Top ELO)</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold text-emerald-450">Ativo</span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Pratique no tatame para acumular pontos de ELO e escalar até o topo da academia JiuSpeak!
            </p>

            {loadingLeaderboard ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-violet-505" />
                Carregando posições...
              </div>
            ) : (
              <div className="space-y-2.5">
                {leaderboard.map((player, idx) => {
                  const isUser = player.name === user.name;
                  const rankIcons = ['🥇', '🥈', '🥉'];
                  const isTop3 = idx < 3;
                  
                  return (
                    <div 
                      key={player.id || idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isUser 
                          ? 'bg-violet-605/10 border-violet-500/35 ring-1 ring-violet-500/20' 
                          : 'bg-[#070b13] border-slate-900/60 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Position Indicator */}
                        <div className="w-6 h-6 flex items-center justify-center font-mono text-xs font-black text-slate-400">
                          {isTop3 ? rankIcons[idx] : `#${idx + 1}`}
                        </div>
                        
                        {/* Avatar bubble */}
                        <div className="w-7 h-7 bg-slate-800/80 rounded-full flex items-center justify-center text-sm border border-slate-700/50 shadow-sm relative shrink-0 overflow-hidden">
                          {player.avatar && (player.avatar.startsWith('http') || player.avatar.startsWith('/') || player.avatar.includes('.') || player.avatar.includes('api.dicebear.com')) ? (
                            <img 
                              src={player.avatar} 
                              alt={player.name} 
                              className="w-full h-full object-cover rounded-full" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            player.avatar || '🥋'
                          )}
                          {/* Mini-belt color dot */}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                            (player.belt === 'Branca' || String(player.belt).toUpperCase() === 'WHITE') ? 'bg-slate-205 border-slate-300' :
                            (player.belt === 'Azul' || String(player.belt).toUpperCase() === 'BLUE') ? 'bg-blue-500' :
                            (player.belt === 'Roxa' || String(player.belt).toUpperCase() === 'PURPLE') ? 'bg-purple-600' :
                            (player.belt === 'Marrom' || String(player.belt).toUpperCase() === 'BROWN') ? 'bg-amber-700' : 'bg-red-650'
                          }`} />
                        </div>

                        {/* Name & level */}
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isUser ? 'text-violet-300' : 'text-slate-200'}`}>
                            {player.name}
                            {isUser && <span className="ml-1 text-[8.5px] font-black uppercase text-violet-400 bg-violet-600/10 px-1 rounded">Você</span>}
                          </p>
                          <span className="text-[9.5px] text-slate-500 block font-mono">
                            Nível {player.level || 1} • {
                              (() => {
                                const b = String(player.belt || '').toUpperCase();
                                if (b === 'WHITE') return 'Branca';
                                if (b === 'BLUE') return 'Azul';
                                if (b === 'PURPLE') return 'Roxa';
                                if (b === 'BROWN') return 'Marrom';
                                if (b === 'BLACK') return 'Preta';
                                if (b === 'RED') return 'Vermelha';
                                return player.belt || 'Branca';
                              })()
                            }
                          </span>
                        </div>
                      </div>

                      {/* ELO or score */}
                      <div className="text-right whitespace-nowrap bg-indigo-505/5 px-2 py-1 rounded border border-indigo-500/10 font-bold text-xs text-indigo-400">
                        <span>{player.elo} <span className="text-[9.2px] text-slate-500 font-normal">ELO</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Streak Board (Duolingo Style) */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-slate-200 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                <span>Ofensiva Diária</span>
              </h3>
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold font-display">
                {user.streak} DIAS SEGUIDOS
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-normal">
              Estude conceitos todos os dias no JiuSpeak para manter o cérebro afiado! Perder um dia quebra o multiplicador de XP.
            </p>

            {/* Streak Calendar Grid Sim */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-slate-500">
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="block text-slate-400 font-bold">{day}</span>
                  <div className={`h-8 rounded-md flex items-center justify-center transition-all ${
                    idx < Math.min(7, user.streak)
                      ? 'bg-orange-500 text-slate-950 font-bold shadow-lg shadow-orange-500/20' 
                      : (idx === 6 ? 'bg-slate-900 border border-slate-800 text-slate-500' : 'bg-slate-900 border border-slate-800 text-slate-500')
                  }`}>
                    {idx < Math.min(7, user.streak) ? '🔥' : '•'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/40 text-[11px] text-slate-500 font-mono text-center">
              Última atividade: {user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString('pt-BR') : 'Hoje'}
            </div>
          </div>

          {/* Gamified Achievements Box */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-805">
              <h3 className="font-display font-bold text-lg text-slate-200">
                🏆 Conquistas Disponíveis
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {achievements.filter(a => a.isUnlocked).length} / {achievements.length} Completas
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
                        ? 'bg-slate-900/30 border-emerald-500/20 opacity-75' 
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-display font-bold text-xs text-slate-250 flex items-center gap-1">
                          {ach.isUnlocked ? '✅ ' : '🔒 '}
                          {ach.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">{ach.description}</p>
                      </div>

                      {/* Currency badge */}
                      <div className="text-right whitespace-nowrap">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 font-bold border border-violet-500/20">
                          +{ach.xpReward} XP
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 block mt-1">
                          +{ach.coinReward} KC
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar (if applicable) */}
                    {ach.progressMax && ach.progressCurrent !== undefined && (
                      <div className="mt-2 pt-2 border-t border-slate-800/45 flex items-center justify-between gap-4">
                        <div className="flex-1 bg-slate-800 rounded-full h-1 relative overflow-hidden">
                          <div 
                            className="bg-violet-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (ach.progressCurrent / ach.progressMax) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {ach.progressCurrent}/{ach.progressMax}
                        </span>
                      </div>
                    )}

                    {/* Reward Claim Action Button */}
                    {!ach.isUnlocked && (
                      <div className="mt-2.5 flex justify-end">
                        <button
                          disabled={ach.progressCurrent !== undefined && ach.progressMax !== undefined && (ach.progressCurrent < ach.progressMax)}
                          onClick={() => claimAchievement(ach.id)}
                          className={`w-full py-1 rounded text-[10px] font-semibold text-center uppercase tracking-wider transition-all cursor-pointer ${
                            (ach.progressCurrent === undefined || (ach.progressCurrent >= (ach.progressMax || 1)))
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                              : 'bg-slate-850 text-slate-500 border border-slate-800/80 cursor-not-allowed'
                          }`}
                        >
                          {(ach.progressCurrent === undefined || (ach.progressCurrent >= (ach.progressMax || 1))) ? '🔄 RESGATAR PRÊMIO' : 'Em progresso'}
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
  );
}
