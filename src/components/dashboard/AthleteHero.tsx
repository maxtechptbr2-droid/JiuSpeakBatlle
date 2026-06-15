import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, Clock, Plane, Target, Edit3, CheckCircle, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../../types';

interface AthleteHeroProps {
  user: UserProfile;
  updateUser: (newUser: Partial<UserProfile>) => void;
  studySeconds: number;
  formatStudyTime: (secs: number) => string;
}

export default function AthleteHero({ user, updateUser, studySeconds, formatStudyTime }: AthleteHeroProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(user.learningGoal || 'Competir no Mundial da IBJJF e dar seminários em inglês');
  const [countryText, setCountryText] = useState(user.country || 'Estados Unidos 🇺🇸');

  const handleSaveInfo = () => {
    updateUser({
      learningGoal: goalText,
      country: countryText
    });
    setIsEditingGoal(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-[#070c1b]/80 backdrop-blur-md shadow-2xl p-6 sm:p-8"
      id="athlete-hero-section"
    >
      {/* Background Decorative Rings */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-600/10 to-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-[200px] h-[200px] bg-violet-600/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 z-10 relative">
        
        {/* Profile Info Row Left */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          
          {/* Avatar Container with Clean Premium Border */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-40 group-hover:opacity-60 transition duration-300" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
              {user.profilePhoto || user.avatar ? (
                <img 
                  src={user.profilePhoto || user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-4xl">🥋</span>
              )}
            </div>
            
            {/* Belt Rank Overlay Badge */}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-zinc-950 text-[10px] font-mono font-bold border border-zinc-805 text-zinc-350 uppercase tracking-widest shadow-md">
              FAIXA {user.belt}
            </span>
          </div>

          {/* Text Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight flex items-center gap-1.5 font-sans">
                {user.name}
              </h2>
              {user.isVerified !== false && (
                <ShieldCheck className="w-5 h-5 text-blue-400 fill-blue-500/10 shrink-0" />
              )}
              <span className="px-2.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 font-mono text-[9px] font-black text-blue-400 uppercase tracking-widest">
                {user.subscription?.type || 'PRO ATHLETE'}
              </span>
            </div>

            <p className="text-sm text-zinc-400 font-mono leading-relaxed max-w-lg">
              Academy: <span className="text-white font-semibold">{user.academy || 'Gracie Barra International'}</span> • Level {user.level} (Elite Student)
            </p>

            {/* Editable Dream Destination & Focus Target */}
            <div className="pt-2 flex flex-col gap-2 text-xs">
              {isEditingGoal ? (
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 space-y-3 max-w-md">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Meta / Foco Principal</label>
                    <input 
                      type="text" 
                      value={goalText} 
                      onChange={(e) => setGoalText(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">País dos Sonhos ✈️</label>
                    <input 
                      type="text" 
                      value={countryText} 
                      onChange={(e) => setCountryText(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleSaveInfo}
                    className="p-1 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Salvar Destino
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 text-zinc-300">
                  <span className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Target className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Foco Principal: <strong className="text-white font-bold">{user.learningGoal || goalText}</strong></span>
                  </span>
                  <span className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Plane className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Destino dos Sonhos: <strong className="text-white font-semibold">{user.country || countryText}</strong></span>
                  </span>
                  <button 
                    onClick={() => setIsEditingGoal(true)}
                    className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition font-mono mt-1"
                  >
                    <Edit3 className="w-3 h-3" /> Alterar Objetivos de Carreira
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Widgets Right Side (Streak and study tracker) */}
        <div className="flex flex-row sm:flex-col gap-3.5 w-full lg:w-auto self-stretch lg:self-center justify-center items-center">
          
          {/* Streak Indicator */}
          <div className="flex-1 lg:flex-none p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850 flex items-center gap-4.5 justify-center lg:justify-start min-w-[160px]">
            <div className="relative">
              <div className="w-11 h-11 bg-orange-950/10 rounded-xl border border-orange-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500/5 animate-pulse" />
              </div>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Streak Ativo</p>
              <h4 className="text-lg font-black text-white tracking-tight">{user.streak} DIAS</h4>
            </div>
          </div>

          {/* Study clock session */}
          <div className="flex-1 lg:flex-none p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850 flex items-center gap-4.5 justify-center lg:justify-start min-w-[160px]">
            <div className="w-11 h-11 bg-blue-950/10 rounded-xl border border-blue-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Estudo de Hoje</p>
              <h4 className="text-sm font-bold text-slate-100 tracking-tight">{formatStudyTime(studySeconds)}</h4>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
