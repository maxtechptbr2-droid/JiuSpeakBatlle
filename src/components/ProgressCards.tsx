import React, { useState } from 'react';
import { Play, CheckCircle2, Flame, Trophy, Award, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile, Course } from '../types';

interface ProgressCardsProps {
  user: UserProfile;
  courses: Course[];
  onContinueClass: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function ProgressCards({ user, courses, onContinueClass, showToast }: ProgressCardsProps) {
  const [complete1, setComplete1] = useState(false);
  const [complete2, setComplete2] = useState(false);
  const [complete3, setComplete3] = useState(false);

  // Compute stats safely
  const completedCount = 4; // Mock completed list for nice visual feedback on landing
  const totalLessons = 35;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const handleMissionToggle = (index: number) => {
    if (index === 1) {
      setComplete1(!complete1);
      showToast(complete1 ? 'Missão desmarcada!' : 'Missão concluída! +150 XP adicionados ao diário! 👍', 'success');
    } else if (index === 2) {
      setComplete2(!complete2);
      showToast(complete2 ? 'Missão desmarcada!' : 'Missão de Speaking concluída! +250 XP adicionados! 🎙️', 'success');
    } else if (index === 3) {
      setComplete3(!complete3);
      showToast(complete3 ? 'Missão desmarcada!' : 'Aprendeu 10 palavras! +200 XP salvos! 🥋', 'success');
    }
  };

  return (
    <section id="jornada" className="py-20 bg-gradient-to-b from-[#020617] to-[#000814] relative">
      
      {/* Background visual spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase font-mono font-black text-blue-400 tracking-widest block">
            CENTRAL DO ATLETA • REAL-TIME INSIGHTS
          </span>
          <h2 className="text-3xl md:text-5xl font-sans font-black text-white tracking-tight uppercase">
            Acompanhe seu Ritmo de Treino
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Evolua no tatame técnico. Pratique diariamente, conquiste graduações por faixa e consolide sua reputação global.
          </p>
        </div>

        {/* 4 PREMIUM CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* CARD 1: CONTINUE DE ONDE PAROU */}
          <div className="group relative bg-[#040815]/90 border border-slate-900 hover:border-blue-500/40 rounded-3xl p-6 transition-all duration-300 shadow-[0_10px_30px_rgb(0,0,0,0.5)] flex flex-col justify-between hover:shadow-[0_0_20px_rgba(0,132,255,0.15)] h-64 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-mono font-black text-blue-400 tracking-wider">
                  Aula em Andamento
                </span>
                <span className="animate-ping w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                  Módulo 1: Fundamentos
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Lição 3: Fazendo pegadas, cumprimentando os parceiros e comando de Tap Out no Tatame.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Progress info */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-405">
                  <span>Progresso Geral</span>
                  <span className="text-blue-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onContinueClass}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,132,255,0.2)] hover:shadow-[0_4px_20px_rgba(0,132,255,0.35)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Continuar Aula
              </button>
            </div>
          </div>

          {/* CARD 2: MISSÕES DIÁRIAS (XP APENAS - NO JT TOKENS) */}
          <div className="group relative bg-[#040815]/90 border border-slate-900 hover:border-blue-500/40 rounded-3xl p-6 transition-all duration-300 shadow-[0_10px_30px_rgb(0,0,0,0.5)] flex flex-col justify-between hover:shadow-[0_0_20px_rgba(0,132,255,0.15)] h-64 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
            
            <div className="space-y-3.5">
              <span className="text-[9px] uppercase font-mono font-black text-blue-400 tracking-wider">
                Missões Diárias
              </span>
              
              <div className="space-y-2.5">
                {/* Mission Item 1 */}
                <button
                  onClick={() => handleMissionToggle(1)}
                  className="w-full text-left flex items-center justify-between text-xs cursor-pointer group"
                >
                  <span className={`transition-all font-sans ${complete1 ? 'line-through text-slate-500 font-normal' : 'text-slate-200 font-bold'}`}>
                    1. Assistir 1 aula tática
                  </span>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    complete1 ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800 bg-slate-950'
                  }`}>
                    {complete1 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>

                {/* Mission Item 2 */}
                <button
                  onClick={() => handleMissionToggle(2)}
                  className="w-full text-left flex items-center justify-between text-xs cursor-pointer group"
                >
                  <span className={`transition-all font-sans ${complete2 ? 'line-through text-slate-500 font-normal' : 'text-slate-200 font-bold'}`}>
                    2. Concluir 1 pronúncia viva
                  </span>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    complete2 ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800 bg-slate-950'
                  }`}>
                    {complete2 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>

                {/* Mission Item 3 */}
                <button
                  onClick={() => handleMissionToggle(3)}
                  className="w-full text-left flex items-center justify-between text-xs cursor-pointer group"
                >
                  <span className={`transition-all font-sans ${complete3 ? 'line-through text-slate-500 font-normal' : 'text-slate-200 font-bold'}`}>
                    3. Gravar 10 vocábulos
                  </span>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    complete3 ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800 bg-slate-950'
                  }`}>
                    {complete3 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Reward Summary */}
            <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                ⭐ Recompensa: <strong className="text-blue-400">XP Diário</strong>
              </span>
              <span className="text-blue-400 font-bold">+600 XP</span>
            </div>
          </div>

          {/* CARD 3: SEU PROGRESSO */}
          <div className="group relative bg-[#040815]/90 border border-slate-900 hover:border-blue-500/40 rounded-3xl p-6 transition-all duration-300 shadow-[0_10px_30px_rgb(0,0,0,0.5)] flex flex-col justify-between hover:shadow-[0_0_20px_rgba(0,132,255,0.15)] h-64 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-mono font-black text-blue-400 tracking-wider">
                  Métricas de Luta
                </span>
                <span className="px-2 py-0.5 bg-blue-950/55 rounded text-[9px] font-mono font-black text-blue-400 border border-blue-500/15">
                  NÍVEL {user.level || 15}
                </span>
              </div>

              {/* Belt graphics */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono tracking-wide uppercase">Faixa Equipada</span>
                <div className="relative h-10 w-full rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between overflow-hidden p-1 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🥋</span>
                    <span className="text-xs font-sans font-extrabold text-white">
                      Faixa {user.belt || 'Branca'}
                    </span>
                  </div>
                  {/* Stripes mock */}
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-5 w-1 rounded-sm ${i < (user.stripes || 2) ? 'bg-blue-400' : 'bg-slate-800'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience bars */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>XP para Próximo Grau</span>
                <span>{user.xp || 750} / {user.xpNextLevel || 1000}</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                <div 
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${Math.round(((user.xp || 750) / (user.xpNextLevel || 1000)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* CARD 4: ÚLTIMA CONQUISTA */}
          <div className="group relative bg-[#040815]/90 border border-slate-900 hover:border-blue-500/40 rounded-3xl p-6 transition-all duration-300 shadow-[0_10px_30px_rgb(0,0,0,0.5)] flex flex-col justify-between hover:shadow-[0_0_20px_rgba(0,132,255,0.15)] h-64 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
            
            <div className="space-y-3.5">
              <span className="text-[9px] uppercase font-mono font-black text-blue-400 tracking-wider">
                Auditoria de Medalhas
              </span>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-2xl text-blue-400 shrink-0 shadow-[0_0_15px_rgba(0,132,255,0.15)]">
                  🎖️
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Sparring de Ouro
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Completou seu primeiro sparring linguístico sem cometer erros táticos de comando de tap-out.
                  </p>
                </div>
              </div>
            </div>

            {/* Achievement details */}
            <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                🏆 Medalha Realizada
              </span>
              <span className="text-blue-400 font-bold">+500 XP Extra</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
