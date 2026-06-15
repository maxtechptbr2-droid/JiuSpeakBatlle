/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Clock, 
  Trophy, 
  CheckCircle2 
} from 'lucide-react';
import { UserProfile, Course } from '../types';
import CareerMode from './CareerMode';

interface LessonsProps {
  user: UserProfile;
  courses: Course[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  onAddAuditLog: (type: any, desc: string, amtBRL?: number, amtJT?: number) => void;
  addXp: (amount: number, reason: string) => void;
  addCoins: (amount: number, reason: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Lessons({ 
  user, 
  updateUser, 
  addXp, 
  addCoins, 
  showToast 
}: LessonsProps) {

  const [studySeconds] = useState<number>(() => {
    const cached = localStorage.getItem('js_study_seconds');
    return cached ? parseInt(cached, 10) : 3400; // start with ~56m
  });

  const formatStudyTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-[#111111] text-zinc-100 min-h-screen p-4 sm:p-6 pb-24 space-y-6 select-none relative font-sans" id="netflix-lessons-core">
      
      {/* 1. BRAND HEADER BLOCK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-850 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-display font-black text-xl text-white shadow-xl rotate-[-3deg]">
            J
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-sm tracking-wider uppercase text-violet-500 font-sans">Jornada RPG de Carreira</h2>
              <span className="p-0.5 px-2 bg-violet-600/10 border border-violet-650/30 rounded font-mono text-[9px] font-black text-violet-400 uppercase tracking-widest animate-pulse">RPG Core</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">Dedicado: {user.name} • Graduação Atual: Faixa {user.belt}</p>
          </div>
        </div>

        {/* Global summary card stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
          <div className="p-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-0.5">
            <p className="text-[8px] text-zinc-500 uppercase font-mono">Tempo de Estudo</p>
            <p className="font-black text-white font-mono flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-violet-500" />
              <span>{formatStudyTime(studySeconds)}</span>
            </p>
          </div>
          <div className="p-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-0.5">
            <p className="text-[8px] text-zinc-500 uppercase font-mono">Modo de Aprendizado</p>
            <p className="font-black text-violet-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-violet-400" />
              <span>RPG Ativo Plan</span>
            </p>
          </div>
          <div className="p-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-0.5">
            <p className="text-[8px] text-zinc-500 uppercase font-mono">XP de Aulas</p>
            <p className="font-black text-amber-500 font-mono flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-amber-500 animate-bounce" />
              <span>{user.xp} XP</span>
            </p>
          </div>
        </div>
      </div>

      {/* Render exclusively standard CareerMode - Jornada RPG de Carreira */}
      <CareerMode user={user} addXp={addXp} addCoins={addCoins} showToast={showToast} />
    </div>
  );
}
