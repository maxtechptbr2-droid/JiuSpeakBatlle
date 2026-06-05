/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  MapPin, 
  Target, 
  ShieldAlert, 
  Sparkles,
  Users,
  Activity,
  Flame
} from 'lucide-react';
import { UserProfile } from '../types';
import { AvatarWithFrame } from './AvatarWithFrame';

interface SocialRankingsProps {
  user: UserProfile;
}

interface RankedUser {
  id: string;
  name: string;
  avatar: string;
  belt: string;
  level: number;
  xp: number;
  winCount: number;
  academy: string;
  category: string;
  socialScore: number;
  rank: number;
}

export function SocialRankings({ user }: SocialRankingsProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'belt' | 'state' | 'academy'>('global');
  const [rankingLists, setRankingLists] = useState<{
    rankingGlobal: RankedUser[];
    rankingBelt: RankedUser[];
    rankingAcademy: RankedUser[];
    rankingState: RankedUser[];
  }>({
    rankingGlobal: [],
    rankingBelt: [],
    rankingAcademy: [],
    rankingState: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRankings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/social/rankings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRankingLists({
            rankingGlobal: data.rankingGlobal,
            rankingBelt: data.rankingBelt,
            rankingAcademy: data.rankingAcademy,
            rankingState: data.rankingState
          });
        }
      }
    } catch (err) {
      console.error("Failed to load rankings stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [user]);

  const getActiveList = () => {
    switch (activeTab) {
      case 'belt': return rankingLists.rankingBelt;
      case 'state': return rankingLists.rankingState;
      case 'academy': return rankingLists.rankingAcademy;
      default: return rankingLists.rankingGlobal;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="font-mono text-slate-500 font-extrabold text-[11px] leading-none">#{rank}</span>;
  };

  const translateBelt = (b: string) => {
    switch (String(b).toUpperCase()) {
      case 'WHITE': return 'Branca';
      case 'BLUE': return 'Azul';
      case 'PURPLE': return 'Roxa';
      case 'BROWN': return 'Marrom';
      case 'BLACK': return 'Preto';
      default: return b;
    }
  };

  const getBeltBg = (belt: string) => {
    switch (String(belt).toUpperCase()) {
      case 'WHITE':
      case 'BRANCA':
        return 'bg-white text-slate-850 border border-slate-300';
      case 'BLUE':
      case 'AZUL':
        return 'bg-blue-600 text-white';
      case 'PURPLE':
      case 'ROXA':
        return 'bg-purple-750 text-white';
      case 'BROWN':
      case 'MARROM':
        return 'bg-amber-900 text-white';
      case 'BLACK':
      case 'PRETO':
        return 'bg-slate-900 border border-red-500 text-red-500';
      default:
        return 'bg-slate-950 text-slate-400';
    }
  };

  const activeList = getActiveList();

  return (
    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4" id="bjj-social-rankings">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5 uppercase">
          <Trophy className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
          <span>Liga de Rendimento de Tatame</span>
        </h3>
        <span className="text-[10px] font-mono font-bold text-slate-500">Gamificação Ativa</span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl">
        {[
          { id: 'global', label: 'Global', icon: <Trophy className="w-3 h-3" /> },
          { id: 'belt', label: 'Faixa', icon: <Sparkles className="w-3 h-3" /> },
          { id: 'state', label: 'Categoria', icon: <MapPin className="w-3 h-3" /> },
          { id: 'academy', label: 'Equipe', icon: <Users className="w-3 h-3" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-1.5 px-0.5 rounded-lg text-[10px] font-bold font-mono flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-amber-400 border border-slate-800 shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Ranking List */}
      <div className="space-y-2.5 max-h-[295px] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            Sincronizando as chaves do torneio...
          </div>
        ) : activeList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono bg-slate-950 rounded-xl">
            Nenhum atleta registrado nesta categoria.
          </div>
        ) : (
          activeList.map((ranked, idx) => {
            const isMe = ranked.id === user.id;
            return (
              <div 
                key={ranked.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  isMe 
                    ? 'bg-violet-950/20 border-violet-500/50 shadow-sm' 
                    : 'bg-slate-950/40 border-slate-950 hover:bg-slate-950/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Position Medal / Slot */}
                  <div className="w-8 shrink-0 flex justify-center">
                    {getRankBadge(ranked.rank)}
                  </div>

                  {/* Profile photo */}
                  <img 
                    src={ranked.avatar} 
                    alt={ranked.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-slate-800 shrink-0 bg-slate-950 object-cover"
                  />

                  {/* Name and label details */}
                  <div className="min-w-0 leading-tight">
                    <span className={`block text-[11px] font-bold truncate ${isMe ? 'text-violet-400' : 'text-slate-201'}`}>
                      {ranked.name} {isMe && '(Você)'}
                    </span>
                    <div className="flex gap-1 items-center flex-wrap mt-1">
                      <span className={`text-[7px] px-1 rounded font-black uppercase ${getBeltBg(ranked.belt)}`}>
                        {translateBelt(ranked.belt)}
                      </span>
                      <span className="text-[8px] text-slate-500 font-mono">
                        Nível {ranked.level} • {ranked.academy.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score badge details (LinkedIn / Strava type stats) */}
                <div className="text-right shrink-0">
                  <span className="block font-mono text-[11px] font-black text-amber-400 leading-none">
                    {ranked.socialScore}
                  </span>
                  <span className="text-[7.5px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                    Pontos
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

      <div className="bg-slate-950/50 p-2.5 border border-slate-850 rounded-xl text-[9px] text-slate-400 leading-relaxed font-sans text-center">
         As dinâmicas de pontos acumulam XP de módulos cursados, vitórias em tempo real na Arena PvP, novos seguidores no Tatame Conectado e curtidas recebidas.
      </div>

    </div>
  );
}
