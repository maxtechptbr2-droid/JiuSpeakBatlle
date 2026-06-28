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
  Coins,
  Radio,
  ShoppingBag
} from 'lucide-react';
import { UserProfile, Achievement, Course, BeltRank } from '../types';
import { authFetch } from '../utils/authFetch';
import { removeFakeUsers } from '../utils/removeFakeUsers';

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
  hasDailyChallenge?: boolean;
}

export default function Dashboard({ 
  user, 
  achievements, 
  updateUser, 
  claimAchievement, 
  onNavigate, 
  courses = [],
  hasDailyChallenge = false
}: DashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'leaderboard' | 'streak' | 'medals' | 'profile'>('leaderboard');

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  useEffect(() => {
    const cached = localStorage.getItem('jiuspeak_completed_lessons_list');
    if (cached) {
      try { setCompletedLessons(JSON.parse(cached)); } catch (e) {}
    }
  }, []);

  const totalLessons = courses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0);
  const completedCount = completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const getNextLesson = () => {
    if (!courses || courses.length === 0) return null;
    for (const course of courses) {
      if (course.lessons) {
        for (const lesson of course.lessons) {
          if (!completedLessons.includes(lesson.id)) {
            return { courseTitle: course.title, lesson };
          }
        }
      }
    }
    return { courseTitle: courses[0]?.title || 'Inglês Básico do Tatame', lesson: courses[0]?.lessons?.[0] || null };
  };
  const nextLessonInfo = getNextLesson();

  const [studySeconds, setStudySeconds] = useState<number>(0);
  useEffect(() => {
    const stored = localStorage.getItem('jiuspeak_total_study_seconds');
    if (stored) { setStudySeconds(parseInt(stored, 10)); }
    else {
      const est = (completedCount * 12 * 60) + 480;
      setStudySeconds(est);
      localStorage.setItem('jiuspeak_total_study_seconds', est.toString());
    }
  }, [completedCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStudySeconds((prev: number) => {
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
    const s = secs % 60;
    return hrs > 0 ? `${hrs}h ${mins}m ${s}s` : `${mins}m ${s}s`;
  };

  const [mission1Count, setMission1Count] = useState(0);
  const [mission2Count, setMission2Count] = useState(0);
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const today = getTodayDateString();
    setMission1Count(localStorage.getItem(`jiuspeak_m1_class_${today}`) === 'true' ? 1 : 0);
    setMission2Count(localStorage.getItem(`jiuspeak_m2_exercise_${today}`) === 'true' ? 1 : 0);
  }, []);

  const toggleMission1 = () => {
    const today = getTodayDateString();
    const next = mission1Count === 0 ? 1 : 0;
    setMission1Count(next);
    localStorage.setItem(`jiuspeak_m1_class_${today}`, next === 1 ? 'true' : 'false');
  };
  const toggleMission2 = () => {
    const today = getTodayDateString();
    const next = mission2Count === 0 ? 1 : 0;
    setMission2Count(next);
    localStorage.setItem(`jiuspeak_m2_exercise_${today}`, next === 1 ? 'true' : 'false');
  };

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    const fetchBoard = async () => {
      setLoadingLeaderboard(true);
      try {
        const res = await fetch('/api/pvp/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard?.length ? removeFakeUsers(data.leaderboard).slice(0, 5) : []);
        } else { setLeaderboard([]); }
      } catch { setLeaderboard([]); }
      finally { setLoadingLeaderboard(false); }
    };
    fetchBoard();
  }, []);

  // Partner product for Stand Parceiro card
  const [partnerProduct, setPartnerProduct] = useState<any>(null);
  useEffect(() => {
    fetch('/api/partners/products')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const products = d?.products || [];
        if (products.length > 0) setPartnerProduct(products[0]);
      })
      .catch(() => {});
  }, []);

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
    } finally { setIsLoadingSessions(false); }
  };

  const handleRevokeAllOtherSessions = async () => {
    try { const res = await authFetch('/api/auth/sessions/revoke-all', { method: 'POST' }); if (res.ok) await loadSessions(); } catch {}
  };
  const handleRevokeSpecificSession = async (id: string) => {
    try { const res = await authFetch(`/api/auth/sessions/${id}/revoke`, { method: 'POST' }); if (res.ok) await loadSessions(); } catch {}
  };
  useEffect(() => { loadSessions(); }, []);

  const [editForm, setEditForm] = useState({
    name: user.name,
    academy: user.academy || 'Gracie Barra International',
    category: user.category || 'Médio (-82.3kg)',
    guardsPreference: user.guardsPreference || 'Guarda Aberta Dinâmica',
    submitsPreference: user.submitsPreference || 'Mata-Leão Pelas Costas',
    gender: (user.gender || 'Masculino') as 'Masculino' | 'Feminino',
  });

  const handleSave = () => { updateUser(editForm); setIsEditing(false); };
  const getWinRate = () => {
    const total = user.winCount + user.lossCount;
    return total === 0 ? 0 : Math.round((user.winCount / total) * 100);
  };

  const weightCategoriesMasc = [
    'Galo (-57,5kg)', 'Pluma (-64kg)', 'Pena (-70kg)', 'Leve (-76kg)',
    'Médio (-82,3kg)', 'Meio-Pesado (-88,3kg)', 'Pesado (-94,3kg)',
    'Super-Pesado (-100,5kg)', 'Pesadíssimo (+100,5kg)', 'Absoluto (Sem limite)'
  ];
  const weightCategoriesFem = [
    'Palha (-48,5kg)', 'Pluma (-53,5kg)', 'Pena (-58,5kg)', 'Leve (-63,5kg)',
    'Médio (-69kg)', 'Meio-Pesado (-74kg)', 'Pesado (-79,3kg)',
    'Super-Pesado (-100kg)', 'Pesadíssimo (+100kg)', 'Absoluto (Sem limite)'
  ];
  const activeGender = isEditing ? editForm.gender : (user.gender || 'Masculino');
  const weightCategories = activeGender === 'Feminino' ? weightCategoriesFem : weightCategoriesMasc;
  const guardPreferences = ['Guarda Fechada de Aço', 'Laço de Borracha', 'Guarda Aberta Dinâmica', 'Meia Guarda Profunda', 'Passador Pressão Brutal', 'Guarda Aranha Flexível'];
  const submissionPreferences = ['Estrangulamento Cruzado', 'Armlock Voador', 'Mata-Leão Pelas Costas', 'Triângulo no Aperto', 'Chave de Pé Estilo Caipira', 'Mão de Vaca Oculta'];

  // ─── Reusable: Leaderboard rows ───────────────────────────────────
  const LeaderboardRows = () => (
    <>
      <p className="text-xs text-zinc-400 mb-3 leading-relaxed font-sans hidden lg:block">
        Pratique nas arenas interativas de matchmaking para acumular pontos de ELO e escalar até o topo do ranking global.
      </p>
      {loadingLeaderboard ? (
        <div className="py-6 text-center text-xs text-zinc-500 font-mono">
          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-blue-400" />
          Carregando posições...
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500 italic">Nenhum atleta ranqueado ainda.</div>
          ) : leaderboard.map((player: any, idx: number) => {
            const isUser = player.name === user.name;
            const rankIcons = ['🥇', '🥈', '🥉'];
            return (
              <div key={player.id || idx} className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all font-sans ${isUser ? 'bg-blue-500/10 border-blue-500/35 ring-1 ring-blue-500/20' : 'bg-zinc-950/60 border-zinc-900/60 hover:border-zinc-800'}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 flex items-center justify-center font-mono text-xs font-black text-zinc-400">
                    {idx < 3 ? rankIcons[idx] : `#${idx + 1}`}
                  </div>
                  <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center text-sm border border-zinc-700 relative shrink-0 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => player.username && onNavigate('profile-public-' + player.username)}>
                    {(player.profilePhoto || player.avatar) ? (
                      <img src={player.profilePhoto || player.avatar} alt={player.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                    ) : '🥋'}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                      (String(player.belt).toUpperCase() === 'WHITE' || player.belt === 'Branca') ? 'bg-zinc-100' :
                      (String(player.belt).toUpperCase() === 'BLUE' || player.belt === 'Azul') ? 'bg-blue-500' :
                      (String(player.belt).toUpperCase() === 'PURPLE' || player.belt === 'Roxa') ? 'bg-purple-600' :
                      (String(player.belt).toUpperCase() === 'BROWN' || player.belt === 'Marrom') ? 'bg-amber-700' : 'bg-zinc-900'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isUser ? 'text-blue-300' : 'text-zinc-200'}`}>
                      <span className="cursor-pointer hover:text-blue-400 transition-colors" onClick={() => player.username && onNavigate('profile-public-' + player.username)}>{player.name}</span>
                      {isUser && <span className="ml-1 text-[8px] font-black uppercase text-blue-400 bg-blue-500/10 px-1 rounded font-mono">Você</span>}
                    </p>
                    <span className="text-[9px] text-zinc-500 font-mono">Nível {player.level || 1} • {(() => { const b = String(player.belt || '').toUpperCase(); return b === 'WHITE' ? 'Branca' : b === 'BLUE' ? 'Azul' : b === 'PURPLE' ? 'Roxa' : b === 'BROWN' ? 'Marrom' : b === 'BLACK' ? 'Preta' : player.belt || 'Branca'; })()}</span>
                  </div>
                </div>
                <div className="whitespace-nowrap bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 font-bold text-xs text-blue-400 font-mono">
                  {player.elo} <span className="text-[9px] text-zinc-500">ELO</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // ─── Reusable: Streak panel ────────────────────────────────────────
  const StreakPanel = () => (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          <span className="text-xs font-black text-zinc-100 uppercase tracking-tight font-sans">Ofensiva Regrada</span>
        </div>
        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">{user.streak} DIAS</span>
      </div>
      <p className="text-[10px] text-zinc-500 mb-3 font-sans hidden lg:block">Treine diariamente para manter o bônus de XP intacto.</p>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-zinc-500">
        {['S','T','Q','Q','S','S','D'].map((day, idx) => (
          <div key={idx} className="space-y-1">
            <span className="block text-zinc-400 font-bold">{day}</span>
            <div className={`h-7 rounded-md flex items-center justify-center transition-all ${idx < Math.min(7, user.streak) ? 'bg-orange-500 text-slate-950 font-bold shadow-orange-500/25' : 'bg-zinc-950 border border-zinc-900 text-zinc-600'}`}>
              {idx < Math.min(7, user.streak) ? '🔥' : '•'}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 font-mono text-center">
        Última Atividade: {user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString('pt-BR') : 'Hoje'}
      </div>
    </>
  );

  // ─── Reusable: Achievements panel ─────────────────────────────────
  const AchievementsPanel = () => (
    <>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-900">
        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-tight font-sans">🏆 Medalheiro do Atleta</h3>
        <span className="text-[10px] font-mono text-zinc-500">{achievements.filter(a => a.isUnlocked).length} / {achievements.length}</span>
      </div>
      <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
        {achievements.map((ach) => (
          <div key={ach.id} className={`p-3 rounded-xl border transition-all ${ach.isUnlocked ? 'bg-zinc-950/20 border-emerald-500/10 opacity-70' : 'bg-zinc-950/60 border-zinc-900'}`}>
            <div className="flex justify-between items-start gap-2 text-xs font-sans">
              <div>
                <h4 className="font-bold text-zinc-200">{ach.isUnlocked ? '🏆 ' : '🔒 '}{ach.title}</h4>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">{ach.description}</p>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 shrink-0">+{ach.xpReward} XP</span>
            </div>
            {ach.progressMax && ach.progressCurrent !== undefined && (
              <div className="mt-2.5 pt-2 border-t border-zinc-900 flex items-center justify-between gap-4">
                <div className="flex-1 bg-zinc-900 rounded-full h-1 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (ach.progressCurrent / ach.progressMax) * 100)}%` }} />
                </div>
                <span className="text-[9px] text-zinc-500 font-mono shrink-0">{ach.progressCurrent}/{ach.progressMax}</span>
              </div>
            )}
            {!ach.isUnlocked && (
              <div className="mt-2.5">
                <button
                  disabled={ach.progressCurrent !== undefined && ach.progressMax !== undefined && ach.progressCurrent < ach.progressMax}
                  onClick={() => claimAchievement(ach.id)}
                  className={`w-full py-1.5 rounded text-[10px] font-bold text-center uppercase tracking-wider transition-all cursor-pointer font-sans ${(ach.progressCurrent === undefined || ach.progressCurrent >= (ach.progressMax || 1)) ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-900 cursor-not-allowed'}`}
                >
                  {(ach.progressCurrent === undefined || ach.progressCurrent >= (ach.progressMax || 1)) ? '🔄 RESGATAR RECOMPENSA' : 'Em progresso'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  // ─── Reusable: Stand Parceiro side card ───────────────────────────
  const StandParceiro = ({ compact = false }: { compact?: boolean }) => (
    <div
      onClick={() => onNavigate('partner-store')}
      className="bg-[#0b101f]/70 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-4 cursor-pointer transition-all hover:bg-purple-950/10 relative overflow-hidden group"
      style={{ background: 'rgba(88,28,135,0.04)' }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-start gap-3 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <ShoppingBag className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider">Stand Parceiro</span>
            <span className="text-[8px] bg-purple-500/15 text-purple-400 border border-purple-500/25 px-1.5 py-0.5 rounded font-bold">NOVO</span>
          </div>
          {partnerProduct ? (
            <>
              <div className="text-xs font-bold text-zinc-100 mt-1 truncate">{partnerProduct.name}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-purple-400">R$ {Number(partnerProduct.price || 0).toFixed(2)}</span>
                {partnerProduct.store?.name && <span className="text-[9px] text-zinc-500">{partnerProduct.store.name}</span>}
              </div>
            </>
          ) : (
            <div className="text-xs text-zinc-400 mt-1">Produtos exclusivos de parceiros BJJ</div>
          )}
        </div>
        <span className="text-zinc-500 group-hover:text-purple-400 transition-colors text-xs mt-1">→</span>
      </div>
    </div>
  );

  // ─── Reusable: Desafio do Dia side card ───────────────────────────
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  useEffect(() => {
    authFetch('/api/daily-challenge')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.challenge && setDailyChallenge(d.challenge))
      .catch(() => {});
  }, []);

  const completedSections = dailyChallenge ? ['completedVocabulary','completedPhrase','completedDialogue','completedQuiz','completedVoice'].filter(k => dailyChallenge[k]).length : 0;

  const DesafioDoDia = () => (
    <div
      onClick={() => onNavigate('daily-challenge')}
      className="bg-[#0b101f]/70 border border-amber-500/20 hover:border-amber-500/35 rounded-2xl p-4 cursor-pointer transition-all relative overflow-hidden group"
      style={{ background: 'rgba(120,53,15,0.04)' }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-start gap-3 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-amber-500/12 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-600 font-mono uppercase tracking-wider">Desafio do Dia</span>
            <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${hasDailyChallenge ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse' : 'text-zinc-500'}`}>
              +240 XP
            </span>
          </div>
          <div className="text-xs font-bold text-zinc-100 mt-1 truncate">
            {dailyChallenge?.theme || 'Gerando desafio...'}
          </div>
          <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${dailyChallenge ? (completedSections / 5) * 100 : 0}%` }} />
          </div>
          <div className="text-[9px] text-zinc-500 font-mono mt-1">{completedSections}/5 seções completas</div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen w-full relative bg-cover bg-center bg-no-repeat bg-fixed py-6 sm:py-8 lg:py-10"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(2,6,23,0.95), rgba(3,7,18,0.98), rgba(0,8,20,0.99))`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
      id="cinematic-rpg-dashboard"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-11">

        {/* ── Banner Topo ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/45 p-5 sm:p-6 rounded-2xl border border-zinc-900 shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest mb-1.5 font-bold flex-wrap">
              <Sparkles className="w-4 h-4 fill-blue-400/20 text-blue-400" />
              <span>Plataforma Internacional AAA • Edição de Atleta</span>
              {hasDailyChallenge && (
                <button onClick={() => onNavigate('daily-challenge')} className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2 py-0.5 rounded-full transition-all cursor-pointer normal-case">
                  <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span className="text-[9px] text-amber-300 font-mono font-bold tracking-wide">Novo desafio!</span>
                </button>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase font-sans">
              Seu próximo passo: <span className="text-blue-400">competir internacionalmente.</span>
            </h1>
            <p className="text-zinc-400 text-xs mt-1 font-normal font-sans">
              Continue evoluindo sua comunicação no jiu-jitsu e amplie os horizontes de sua carreira no tatame global.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button onClick={() => onNavigate('lessons')} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer font-sans uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" /> Módulos Teóricos
            </button>
            <button onClick={() => onNavigate('pvp')} className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer font-sans uppercase tracking-wider">
              <Sword className="w-3.5 h-3.5 text-blue-400" /> Tatame Virtual PvP
            </button>
          </div>
        </div>

        {/* ── Mobile: Desafio + Stand Parceiro destaque ───────────── */}
        <div className="grid grid-cols-2 gap-3 lg:hidden">
          <DesafioDoDia />
          <StandParceiro compact />
        </div>

        {/* ── Estação de Treinamento ──────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-950/20 via-zinc-950/65 to-indigo-950/20 border border-blue-500/15 p-5 sm:p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition duration-500" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
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
                <button onClick={() => onNavigate('lessons')} className="mt-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer font-sans uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" /> Iniciar Aula ({nextLessonInfo.lesson.duration})
                </button>
              )}
            </div>
            <div className="md:col-span-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/60 flex items-center gap-4 justify-center">
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90 shrink-0">
                  <circle cx="32" cy="32" r="28" className="text-zinc-850" strokeWidth="4" stroke="currentColor" fill="transparent" />
                  <circle cx="32" cy="32" r="28" className="text-blue-500 transition-all duration-1000" strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - progressPercent / 100)}
                    strokeLinecap="round" stroke="currentColor" fill="transparent" />
                </svg>
                <span className="absolute text-xs font-black font-mono text-white">{progressPercent}%</span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-[9px] text-zinc-500 font-black tracking-wider uppercase font-mono">Status Estudo</span>
                <p className="text-xs font-bold text-zinc-100 font-mono">{completedCount} de {totalLessons} Módulos</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Acesso Rápido ───────────────────────────────────────── */}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { id: 'profile-settings', title: 'Meu Perfil', description: 'Gerencie suas informações pessoais, foto, preferências e configurações da conta.', icon: User, color: 'border-violet-500/10 text-violet-400 bg-violet-500/5', iconBg: 'bg-violet-500/10 text-violet-400' },
              { id: 'inventory', title: 'Mochila do Aluno', description: 'Visualize itens, recompensas, equipamentos, conquistas e benefícios obtidos na plataforma.', icon: Backpack, color: 'border-blue-500/10 text-blue-400 bg-blue-500/5', iconBg: 'bg-blue-500/10 text-blue-400' },
              { id: 'live', title: '🔴 Lives ao Vivo', description: 'Assista transmissões ao vivo da comunidade ou inicie sua própria live de treino.', icon: Radio, color: 'border-red-500/10 text-red-400 bg-red-500/5', iconBg: 'bg-red-500/10 text-red-400' },
              { id: 'social', title: 'Comunidade', description: 'Conecte-se com outros praticantes, participe de discussões e compartilhe experiências.', icon: Users, color: 'border-pink-500/10 text-pink-400 bg-pink-500/5', iconBg: 'bg-pink-500/10 text-pink-400' },
              { id: 'academies', title: 'Academias BJJ', description: 'Encontre academias parceiras e conecte-se com a comunidade local.', icon: Building2, color: 'border-emerald-500/10 text-emerald-400 bg-emerald-500/5', iconBg: 'bg-emerald-500/10 text-emerald-400' },
              { id: 'market', title: 'Loja JiuSpeak (JT)', description: 'Utilize seus JiuTickets para adquirir benefícios e produtos disponíveis.', icon: Store, color: 'border-amber-500/10 text-amber-400 bg-amber-500/5', iconBg: 'bg-amber-500/10 text-amber-400' },
              { id: 'subscriptions', title: 'Central de JiuTickets', description: 'Gerencie saldo, histórico e movimentações de JiuTickets.', icon: Coins, color: 'border-cyan-500/10 text-cyan-400 bg-cyan-500/5', iconBg: 'bg-cyan-500/10 text-cyan-400' },
            ].map((card) => {
              const CardIcon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  onClick={() => onNavigate(card.id)}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`p-4 sm:p-5 rounded-2xl bg-[#0b101f]/70 border ${card.color} hover:bg-slate-900/40 transition-all duration-300 cursor-pointer flex gap-3 sm:gap-4 items-start shadow-xl`}
                >
                  <div className={`p-2.5 sm:p-3 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                    <CardIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-100 transition-colors">{card.title}</h3>
                    <p className="text-zinc-400 text-[10px] sm:text-xs font-normal leading-relaxed font-sans hidden sm:block">{card.description}</p>
                  </div>
                </motion.div>
              );
            })}
            {/* Stand Parceiro — destaque 2 colunas */}
            <motion.div
              onClick={() => onNavigate('partner-store')}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="col-span-2 sm:col-span-1 lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-[#0b101f]/70 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-950/5 transition-all duration-300 cursor-pointer flex gap-3 sm:gap-4 items-start shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="p-2.5 sm:p-3 rounded-xl bg-purple-500/12 shrink-0 relative z-10">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <div className="space-y-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-purple-300">Stand Parceiro</h3>
                  <span className="text-[8px] bg-purple-500/15 text-purple-400 border border-purple-500/25 px-1.5 py-0.5 rounded font-bold uppercase">Novo</span>
                </div>
                <p className="text-zinc-400 text-[10px] sm:text-xs font-normal leading-relaxed font-sans">
                  {partnerProduct ? `${partnerProduct.name} — R$ ${Number(partnerProduct.price||0).toFixed(2)}` : 'Produtos exclusivos de parceiros BJJ — kimonos, rashguards e equipamentos selecionados.'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Grid Principal (col-8 + col-4) ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ── Coluna Esquerda (8 cols) ───────────────────────────── */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">

            <AthleteHero user={user} updateUser={updateUser} studySeconds={studySeconds} formatStudyTime={formatStudyTime} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <XPProgress user={user} totalLessons={totalLessons} completedCount={completedCount} progressPercent={progressPercent} />
              <MissionCard mission1Count={mission1Count} mission2Count={mission2Count} toggleMission1={toggleMission1} toggleMission2={toggleMission2} />
            </div>

            <BeltProgression user={user} />

            <AthleteProfile
              user={user} isEditing={isEditing} setIsEditing={setIsEditing}
              editForm={editForm} setEditForm={setEditForm} handleSave={handleSave}
              getWinRate={getWinRate} weightCategories={weightCategories}
              guardPreferences={guardPreferences} submissionPreferences={submissionPreferences}
            />

            {/* Sessões Criptográficas */}
            <div className="bg-[#0b101f]/70 p-5 sm:p-6 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight font-sans">Controle de Sessões Criptográficas</h4>
                    <p className="text-[9px] text-zinc-500 font-mono">AUTENTICAÇÃO ROTATIVA PERSISTENTE (OWASP ASVS)</p>
                  </div>
                </div>
                <button onClick={loadSessions} disabled={isLoadingSessions} className="p-1 px-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer font-mono">
                  <RefreshCw className={`w-3 h-3 ${isLoadingSessions ? 'animate-spin' : ''}`} /> SYNC
                </button>
              </div>
              {sessionError && (
                <div className="p-3 bg-rose-950/20 border border-rose-900/60 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /><span>{sessionError}</span>
                </div>
              )}
              {isLoadingSessions ? (
                <div className="py-6 text-center text-xs text-zinc-500 font-mono">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-blue-400" />Verificando sessões...
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">Nenhuma outra sessão ativa encontrada.</p>
                  ) : (
                    <div className="divide-y divide-zinc-900">
                      {sessions.map((sess: any) => (
                        <div key={sess.id} className="py-2.5 flex items-center justify-between text-xs gap-4 font-sans">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <Monitor className={`w-4 h-4 mt-0.5 ${sess.isCurrent ? 'text-emerald-400' : 'text-zinc-500'}`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-zinc-200 truncate max-w-[180px] md:max-w-[280px]">{sess.userAgent || 'Navegador Desconhecido'}</span>
                                {sess.isCurrent && <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] px-1.5 rounded font-mono uppercase animate-pulse">Atual</span>}
                              </div>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">IP: <span className="text-zinc-400">{sess.ipAddress || 'Interno'}</span> • {new Date(sess.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {!sess.isCurrent && (
                            <button onClick={() => handleRevokeSpecificSession(sess.id)} className="p-1 px-2.5 bg-zinc-950 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/40 rounded-lg text-[10px] uppercase font-mono transition-all cursor-pointer font-bold">Encerrar</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {sessions.length > 1 && (
                    <div className="pt-3 border-t border-zinc-900 flex justify-end">
                      <button onClick={handleRevokeAllOtherSessions} className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/60 text-rose-200 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer font-sans">
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />Encerrar Outras Sessões Globais
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Coluna Direita (4 cols) — apenas desktop ──────────── */}
          <div className="lg:col-span-4 space-y-5 hidden lg:flex lg:flex-col">

            {/* Streak */}
            <div className="bg-[#0b101f]/70 p-5 rounded-2xl border border-zinc-800">
              <StreakPanel />
            </div>

            {/* Estudo de Hoje */}
            <div className="bg-[#0b101f]/70 p-4 rounded-2xl border border-indigo-500/15 flex items-center gap-4" style={{ background: 'rgba(49,46,129,0.04)' }}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Estudo de Hoje</p>
                <h4 className="text-lg font-black text-white tracking-tight">{formatStudyTime(studySeconds)}</h4>
              </div>
            </div>

            {/* Desafio do Dia */}
            <DesafioDoDia />

            {/* Stand Parceiro */}
            <StandParceiro />

            {/* Leaderboard */}
            <div className="bg-[#0b101f]/70 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-900">
                <ListOrdered className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-black text-sm text-zinc-100 uppercase tracking-tight font-sans">Leaderboard Dojo</h3>
                  <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Top Fluency ELO</p>
                </div>
              </div>
              <LeaderboardRows />
            </div>

            {/* Community Card */}
            <CommunityCard />

            {/* Medalheiro */}
            <div className="bg-[#0b101f]/70 p-5 rounded-2xl border border-zinc-800">
              <AchievementsPanel />
            </div>

          </div>
        </div>

        {/* ── Mobile: Tabs para conteúdo secundário ───────────────── */}
        <div className="lg:hidden">
          {/* Tab nav */}
          <div className="flex gap-0 border-b border-zinc-800 mb-4 overflow-x-auto scrollbar-none">
            {[
              { key: 'leaderboard', label: 'Ranking' },
              { key: 'streak', label: 'Streak' },
              { key: 'medals', label: 'Medalhas' },
              { key: 'profile', label: 'Atleta' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveRightTab(t.key as any)}
                className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all font-mono flex-shrink-0 ${activeRightTab === t.key ? 'text-blue-400 border-blue-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-[#0b101f]/70 rounded-2xl border border-zinc-800 p-4">
            {activeRightTab === 'leaderboard' && <LeaderboardRows />}
            {activeRightTab === 'streak' && <StreakPanel />}
            {activeRightTab === 'medals' && <AchievementsPanel />}
            {activeRightTab === 'profile' && (
              <div className="space-y-4">
                <CommunityCard />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
