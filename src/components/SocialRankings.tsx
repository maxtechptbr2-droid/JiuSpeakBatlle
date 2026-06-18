/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Users,
  Flame,
  Sword,
  BookOpen,
  Award,
  UserCheck,
  RefreshCw,
  MessageSquare,
  Zap,
  Calendar,
  Lock,
  Share2
} from 'lucide-react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { removeFakeUsers, clearStorageCaches } from '../utils/removeFakeUsers';

interface SocialRankingsProps {
  user: UserProfile;
}

interface RankedItem {
  id: string;
  name: string;
  avatar: string;
  belt?: string;
  level?: number;
  xp?: number;
  elo?: number;
  winCount?: number;
  academy?: string;
  score: number;
  rank: number;
  isAcademy?: boolean;
  isProfessor?: boolean;
  membersCount?: number;
}

// 14 Categories categorized into 3 clean visual groups
const GROUPS = [
  { id: 'graduations', label: 'Graduações / Faixas 🥋' },
  { id: 'performance', label: 'Rendimento & Estudos 📚' },
  { id: 'social_competitive', label: 'Competição & Social ⚔️' }
];

const CATEGORIES = [
  // Group 1: Graduations
  { id: 'global', label: 'Global 🌎', group: 'graduations', icon: Trophy, desc: 'Classificação unificada de toda recompensa', rewardLabel: 'Pontos' },
  { id: 'white_belt', label: 'Faixa Branca ⚪', group: 'graduations', icon: Award, desc: 'Novos prodígios no tatame (White Belts)', rewardLabel: 'Pontos' },
  { id: 'blue_belt', label: 'Faixa Azul 🔵', group: 'graduations', icon: Award, desc: 'Frequência consistente (Blue Belts)', rewardLabel: 'Pontos' },
  { id: 'purple_belt', label: 'Faixa Roxa 🟣', group: 'graduations', icon: Award, desc: 'Nível avançado de Jiu-Jitsu (Purple Belts)', rewardLabel: 'Pontos' },
  { id: 'marrom_belt', label: 'Faixa Marrom 🟤', group: 'graduations', icon: Award, desc: 'Lutadores de elite refinados (Brown Belts)', rewardLabel: 'Pontos' },
  { id: 'preta_belt', label: 'Faixa Preta ⚫', group: 'graduations', icon: Award, desc: 'Mestres supremos das alavancas (Black Belts)', rewardLabel: 'Pontos' },

  // Group 2: Performance
  { id: 'xp', label: 'XP 🔥', group: 'performance', icon: Flame, desc: 'Experiência de estudo conquistada', rewardLabel: 'XP' },
  { id: 'estudos', label: 'Estudos 📖', group: 'performance', icon: BookOpen, desc: 'Aulas concluídas e revisões de curso', rewardLabel: 'Aulas' },
  { id: 'professores', label: 'Professores 🎓', group: 'performance', icon: UserCheck, desc: 'Docentes que lideram o conhecimento', rewardLabel: 'Pontos' },
  { id: 'academias', label: 'Academias 🛡️', group: 'performance', icon: Users, desc: 'Força das alianças coletivas de Jiu-Jitsu', rewardLabel: 'Pontos' },

  // Group 3: Competition & Social
  { id: 'elo', label: 'ELO 🏆', group: 'social_competitive', icon: Zap, desc: 'Pontuação de matchmaking competitivo', rewardLabel: 'ELO' },
  { id: 'vitorias', label: 'Vitórias ⭐', group: 'social_competitive', icon: Sparkles, desc: 'Duelos individuais vencidos na arena', rewardLabel: 'Vitórias' },
  { id: 'pvp', label: 'PVP ⚔️', group: 'social_competitive', icon: Sword, desc: 'Atividade Geral e participação na Arena PvP', rewardLabel: 'PDD' },
  { id: 'rede_social', label: 'Rede Social 💬', group: 'social_competitive', icon: MessageSquare, desc: 'Engajamento, fórum e rede social', rewardLabel: 'Likes / Posts' }
];

const PERIODS = [
  { id: 'hoje', label: 'Hoje ⏰' },
  { id: 'semana', label: 'Semana 📆' },
  { id: 'mes', label: 'Mês 🌙' },
  { id: 'ano', label: 'Ano ☀️' },
  { id: 'todos', label: 'Todos ♾️' }
];

export function SocialRankings({ user }: SocialRankingsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('global');
  const [activePeriod, setActivePeriod] = useState<string>('todos');
  const [activeGroup, setActiveGroup] = useState<string>('graduations');
  const [rankings, setRankings] = useState<RankedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [livePulse, setLivePulse] = useState<boolean>(false);
  const [socketStatus, setSocketStatus] = useState<'conctado' | 'desconectado'>('desconectado');

  useEffect(() => {
    clearStorageCaches();
  }, []);

  const fetchRankings = async (showLoadingOverlay = true) => {
    if (showLoadingOverlay) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/social/rankings?category=${activeCategory}&period=${activePeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.rankings) {
          setRankings(removeFakeUsers(data.rankings));
          // Highlight live pulse on real-time update
          setLivePulse(true);
          setTimeout(() => setLivePulse(false), 1200);
        } else {
          setRankings([]);
        }
      } else {
        setRankings([]);
      }
    } catch (err) {
      console.error("Failed to load rankings stats:", err);
      setRankings([]);
    } finally {
      if (showLoadingOverlay) setLoading(false);
    }
  };

  // Socket action subscription
  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socket.on('connect', () => {
      setSocketStatus('conctado');
      const token = localStorage.getItem('token');
      if (token) {
        socket.emit('auth:register', { token });
      }
    });

    socket.on('disconnect', () => {
      setSocketStatus('desconectado');
    });

    socket.on('rankings:update', () => {
      fetchRankings(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeCategory, activePeriod]);

  // Trigger loading on change
  useEffect(() => {
    fetchRankings(true);
  }, [activeCategory, activePeriod]);

  const translateBelt = (b?: string) => {
    if (!b) return '';
    switch (String(b).toUpperCase()) {
      case 'WHITE': return 'Branca';
      case 'BLUE': return 'Azul';
      case 'PURPLE': return 'Roxa';
      case 'BROWN': return 'Marrom';
      case 'BLACK': return 'Preto';
      default: return b;
    }
  };

  const getBeltBg = (belt?: string) => {
    if (!belt) return 'bg-slate-800 text-slate-300';
    switch (String(belt).toUpperCase()) {
      case 'WHITE':
      case 'BRANCA':
        return 'bg-white text-slate-900 border border-slate-300 font-extrabold';
      case 'BLUE':
      case 'AZUL':
        return 'bg-blue-600 text-white font-extrabold';
      case 'PURPLE':
      case 'ROXA':
        return 'bg-purple-700 text-white font-extrabold';
      case 'BROWN':
      case 'MARROM':
        return 'bg-amber-900 text-white font-extrabold';
      case 'BLACK':
      case 'PRETO':
        return 'bg-slate-905 border border-red-500 text-red-500 font-extrabold';
      default:
        return 'bg-slate-950 text-slate-400';
    }
  };

  const currentCategoryObj = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const groupFilteredCategories = CATEGORIES.filter(c => c.group === activeGroup);

  return (
    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-5" id="bjj-ultimate-leaderboards">
      
      {/* Header and Live Connection Status */}
      <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-800">
        <div className="space-y-0.5">
          <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Trophy className="w-4.5 h-4.5 text-amber-500" />
            <span>Liga JiuSpeak Suprema de Rendimento</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">
            Ranks e simulação de conciliação integrados em tempo real
          </p>
        </div>

        {/* Live Socket Status Badge */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-850">
          <div className={`w-1.5 h-1.5 rounded-full ${socketStatus === 'conctado' ? 'bg-emerald-500' : 'bg-rose-500'} ${livePulse || socketStatus === 'conctado' ? 'animate-pulse' : ''}`} />
          <span className="text-[9px] font-mono text-slate-400 lowercase tracking-tight">
            WebSocket: {socketStatus}
          </span>
        </div>
      </div>

      {/* Primary Category Groups Selector */}
      <div className="flex bg-slate-950 p-1 rounded-xl gap-1">
        {GROUPS.map(grp => (
          <button
            key={grp.id}
            onClick={() => {
              setActiveGroup(grp.id);
              // Set the default category for this group
              const firstCat = CATEGORIES.find(c => c.group === grp.id);
              if (firstCat) setActiveCategory(firstCat.id);
            }}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[9.5px] font-bold font-display uppercase tracking-tight text-center cursor-pointer transition-all duration-200 ${
              activeGroup === grp.id 
                ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            {grp.label}
          </button>
        ))}
      </div>

      {/* Secondary Subcategories Selector Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
        {groupFilteredCategories.map(cat => {
          const isSelected = activeCategory === cat.id;
          const IconComponent = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-1.5 rounded-lg text-[10px] font-mono transition-all border flex flex-col items-center justify-center gap-1 text-center cursor-pointer ${
                isSelected 
                  ? 'bg-slate-950 text-amber-400 border-amber-500 shadow-inner' 
                  : 'bg-slate-900/40 text-slate-400 hover:bg-slate-950 border-transparent hover:text-slate-200'
              }`}
              title={cat.desc}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="truncate w-full font-bold">{cat.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Date Filter Capsules Row */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-950/40 p-1.5 rounded-xl border border-slate-850">
        <span className="text-[9px] font-mono font-bold text-slate-500 mr-1.5 uppercase flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          Filtro Temporal:
        </span>
        {PERIODS.map(p => {
          const isSelected = activePeriod === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePeriod(p.id)}
              className={`px-3 py-1 rounded-full text-[10.5px] font-semibold tracking-tight transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-violet-600 text-white shadow-sm font-bold scale-105' 
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Selection Metric Description Banner */}
      <div className="bg-slate-950/70 py-2 px-3 border border-slate-850 rounded-xl flex items-center justify-between gap-3">
        <p className="text-[10px] text-slate-350 leading-relaxed font-sans first-letter:uppercase">
          💡 <strong className="text-white">{currentCategoryObj.label}</strong>: {currentCategoryObj.desc}
        </p>
        <button 
          onClick={() => fetchRankings(true)} 
          className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer self-center"
          title="Recarregar"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Ranking Scroller Container */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center text-xs text-slate-500 font-mono"
            >
              Recalculando matriz de pontuação competitiva...
            </motion.div>
          ) : rankings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 px-6 text-center text-xs text-slate-400 font-sans bg-slate-950 rounded-xl border border-slate-850 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
                ⏳
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-200">Nenhum atleta ranqueado ainda.</p>
                <p className="text-[10px] text-slate-500">Registre os primeiros praticantes reais no tatame virtual.</p>
              </div>
            </motion.div>
          ) : (
            rankings.map((ranked, idx) => {
              const isAcademy = !!ranked.isAcademy;
              const isMe = ranked.id === user.id;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.2) }}
                  key={ranked.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isMe 
                      ? 'bg-violet-950/20 border-violet-500/50 shadow-sm' 
                      : 'bg-slate-950/40 border-slate-950 hover:bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Position Badge */}
                    <div className="w-8 shrink-0 flex justify-center items-center">
                      {ranked.rank === 1 && <span className="text-xl">🥇</span>}
                      {ranked.rank === 2 && <span className="text-xl">🥈</span>}
                      {ranked.rank === 3 && <span className="text-xl">🥉</span>}
                      {ranked.rank > 3 && (
                        <span className="font-mono text-slate-500 font-extrabold text-[11px]">
                          #{ranked.rank}
                        </span>
                      )}
                    </div>

                    {/* Image Avatar */}
                    {isAcademy ? (
                      <span className="w-9 h-9 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center text-xl shrink-0">
                        {ranked.avatar}
                      </span>
                    ) : (
                      <img 
                        src={ranked.avatar} 
                        alt={ranked.name}
                        referrerPolicy="no-referrer"
                        className="w-8.5 h-8.5 rounded-full border border-slate-800 shrink-0 bg-slate-950 object-cover"
                      />
                    )}

                    {/* Meta info details */}
                    <div className="min-w-0 leading-tight">
                      <span className={`block text-[11.5px] font-bold truncate ${isMe ? 'text-violet-400' : 'text-slate-200'} flex items-center gap-1.5`}>
                        <span>{ranked.name} {isMe && '(Você)'}</span>
                        {isMe && (
                          <button
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('trigger-viral-share', {
                                detail: {
                                  type: 'top_ranking',
                                  customTitle: `TOP RANKING ALCANÇADO: #${ranked.rank}!`
                                }
                              }));
                            }}
                            className="p-1 bg-violet-600/20 hover:bg-violet-600 hover:text-white text-violet-400 rounded transition-all cursor-pointer border border-violet-500/20 hover:border-transparent flex items-center justify-center shrink-0"
                            title="Compartilhar sua posição"
                          >
                            <Share2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </span>

                      <div className="flex gap-1.5 items-center flex-wrap mt-1">
                        {!isAcademy && (
                          <span className={`text-[7.5px] px-1 rounded font-black uppercase tracking-wider ${getBeltBg(ranked.belt)}`}>
                            {translateBelt(ranked.belt)}
                          </span>
                        )}
                        <span className="text-[8.5px] text-slate-500 font-mono">
                          {isAcademy 
                            ? `Ativação por equipes • ${ranked.membersCount} integrantes` 
                            : `Nível ${ranked.level || 1} • ${ranked.academy ? ranked.academy.split(' ')[0] : 'JiuSpeak'}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reward units show / Points */}
                  <div className="text-right shrink-0">
                    <span className="block font-mono text-xs font-black text-amber-400 leading-none">
                      {ranked.score.toLocaleString()}
                    </span>
                    <span className="text-[7.5px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                      {currentCategoryObj.rewardLabel}
                    </span>
                  </div>

                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Adaptive informational note based on categories */}
      <div className="bg-slate-950/50 p-3 border border-slate-850 rounded-xl text-[9px] text-slate-400 leading-relaxed font-sans text-center">
        O sistema de rankings compõe pontuações a partir de aulas concluídas, lutas e vitórias no Arena PvP e interações de Tatame Conectado. As alterações em tempo real sincronizam com outros lutadores via canais websockets de forma autônoma.
      </div>

    </div>
  );
}
