import React from 'react';
import { motion } from 'motion/react';
import { Award, CheckCircle2, TrendingUp, Compass, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';

interface XPProgressProps {
  user: UserProfile;
  totalLessons: number;
  completedCount: number;
  progressPercent: number;
}

export default function XPProgress({ user, totalLessons, completedCount, progressPercent }: XPProgressProps) {
  const xpPercent = Math.min(100, Math.round((user.xp / user.xpNextLevel) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-[#0b101f]/70 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden"
      id="xp-progress-card"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight font-sans">XP de Operação</h4>
            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Combate Acadêmico Ativo</p>
          </div>
        </div>
        <div className="text-right font-mono">
          <span className="text-xs text-indigo-400 font-black">NÍVEL {user.level}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Interactive Gauge */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-zinc-500" />
              <span>Pontos de Proficiência</span>
            </span>
            <span>{user.xp} / {user.xpNextLevel} XP</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-900 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 h-full rounded-full shadow-[0_0_12px_rgba(0,132,255,0.4)]"
            />
          </div>
          <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
            <span>Falta {user.xpNextLevel - user.xp} XP para subir de nível</span>
            <span className="text-blue-400 font-bold">{xpPercent}%</span>
          </div>
        </div>

        {/* Detailed Stats Subgrid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          
          <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Aulas Concluídas</span>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-lg font-black text-white font-mono">{completedCount}</h3>
              <span className="text-[10px] text-zinc-400 font-mono">de {totalLessons}</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 flex flex-col justify-between">
            <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Progresso Geral</span>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-lg font-black text-blue-400 font-mono">{progressPercent}%</h3>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <span className="text-[9px] text-zinc-500 font-mono mt-2 block">
              {progressPercent === 100 ? 'Mestre Absoluto 🏆' : 'Estudo Consecutivo'}
            </span>
          </div>

        </div>

        {/* Motivation Accent */}
        <div className="p-2.5 rounded-xl bg-blue-950/10 border border-blue-900/10 flex items-center gap-2 mt-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <p className="text-[10px] text-zinc-400 font-sans italic font-normal leading-relaxed">
            Cada aula concluída gera XP e desbloqueia novos cenários da arena internacional. Continuar com foco!
          </p>
        </div>

      </div>
    </motion.div>
  );
}
