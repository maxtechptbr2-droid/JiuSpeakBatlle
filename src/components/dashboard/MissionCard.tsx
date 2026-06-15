import React from 'react';
import { motion } from 'motion/react';
import { Target, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface MissionCardProps {
  mission1Count: number;
  mission2Count: number;
  toggleMission1: () => void;
  toggleMission2: () => void;
}

export default function MissionCard({ mission1Count, mission2Count, toggleMission1, toggleMission2 }: MissionCardProps) {
  const completedMissions = mission1Count + mission2Count;
  const isEverythingFinished = completedMissions === 2;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-[#0b101f]/70 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
      id="daily-missions-card"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            <div>
              <h4 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight font-sans">Op. Diárias (Missions)</h4>
              <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Acumule Proficiência Atleta</p>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
            isEverythingFinished 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
          }`}>
            {isEverythingFinished ? 'CONCLUÍDO! 🎉' : `${completedMissions}/2 Missões`}
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Complete as operações obrigatórias hoje para acelerar seu bônus de aprendizado internacional e decolar no ranking.
        </p>

        {/* Missions Stack */}
        <div className="space-y-3">
          
          {/* Mission 1 */}
          <div 
            onClick={toggleMission1}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-300 ${
              mission1Count > 0 
                ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-all border shrink-0 ${
                mission1Count > 0 
                  ? 'bg-emerald-500 border-emerald-400 text-black' 
                  : 'border-zinc-750 bg-zinc-900'
              }`}>
                {mission1Count > 0 && <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3px]" />}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold font-sans ${mission1Count > 0 ? 'text-zinc-400 line-through' : 'text-zinc-100'}`}>
                  Assistir 1 aula acadêmica
                </p>
                <span className="text-[10px] text-zinc-500 block font-mono">Teoria & Vocabulário Técnico</span>
              </div>
            </div>
            <div className="text-right flex flex-col gap-0.5 whitespace-nowrap text-[9px] font-mono">
              <span className="text-orange-400 font-extrabold">+100 XP</span>
              <span className="text-blue-400 font-extrabold">+10 JT</span>
            </div>
          </div>

          {/* Mission 2 */}
          <div 
            onClick={toggleMission2}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-300 ${
              mission2Count > 0 
                ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-all border shrink-0 ${
                mission2Count > 0 
                  ? 'bg-emerald-500 border-emerald-400 text-black' 
                  : 'border-zinc-750 bg-zinc-900'
              }`}>
                {mission2Count > 0 && <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3px]" />}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold font-sans ${mission2Count > 0 ? 'text-zinc-400 line-through' : 'text-zinc-100'}`}>
                  Fatiar 1 exercício prático
                </p>
                <span className="text-[10px] text-zinc-500 block font-mono">Arena PvP / Tatame Virtual</span>
              </div>
            </div>
            <div className="text-right flex flex-col gap-0.5 whitespace-nowrap text-[9px] font-mono">
              <span className="text-orange-400 font-extrabold">+150 XP</span>
              <span className="text-blue-400 font-extrabold">+15 JT</span>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
          <span>Reseta diariamente à meia-noite</span>
        </span>
        {isEverythingFinished && (
          <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
            Bônus Máximo Ativo!
          </span>
        )}
      </div>
    </motion.div>
  );
}
