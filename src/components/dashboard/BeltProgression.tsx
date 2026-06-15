import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile, BeltRank } from '../../types';

interface BeltProgressionProps {
  user: UserProfile;
}

export default function BeltProgression({ user }: BeltProgressionProps) {
  const beltRoadmap: { belt: BeltRank; avgLvl: number; reqXp: number; unlocked: boolean; color: string }[] = [
    { belt: 'Branca', avgLvl: 1, reqXp: 0, unlocked: true, color: 'border-slate-350 text-slate-100 bg-slate-800' },
    { belt: 'Azul', avgLvl: 5, reqXp: 1200, unlocked: user.level >= 5 || user.belt !== 'Branca', color: 'border-blue-500 text-blue-200 bg-blue-950/40' },
    { belt: 'Roxa', avgLvl: 12, reqXp: 3000, unlocked: ['Roxa', 'Marrom', 'Preto'].includes(user.belt), color: 'border-purple-500 text-purple-200 bg-purple-950/40' },
    { belt: 'Marrom', avgLvl: 20, reqXp: 6000, unlocked: ['Marrom', 'Preto'].includes(user.belt), color: 'border-amber-600 text-amber-200 bg-amber-950/40' },
    { belt: 'Preto', avgLvl: 30, reqXp: 10000, unlocked: user.belt === 'Preto', color: 'border-red-650 text-red-100 bg-slate-900 border-2 shadow-red-500/20 shadow' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[#0b101f]/70 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-xl relative"
      id="belt-roadmap-panel"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="mb-5">
        <h4 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight font-sans flex items-center gap-2">
          <span>🏆</span> Syllabus Route (Jornada de Faixas)
        </h4>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Avance na escala acadêmica completando os Módulos de Carreira e consolidando seu vocabulário em dotes globais de MMA/BJJ.
        </p>
      </div>

      {/* Grid Roadmap timeline */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4.5 py-2.5 relative">
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-zinc-800/80 hidden lg:block -translate-y-1/2 -z-10" />
        
        {beltRoadmap.map((node) => {
          const isActive = user.belt === node.belt;
          const translatedBelt = 
            node.belt === 'Branca' ? 'White Belt' :
            node.belt === 'Azul' ? 'Blue Belt' :
            node.belt === 'Roxa' ? 'Purple Belt' :
            node.belt === 'Marrom' ? 'Brown Belt' : 'Black Belt';
          
          return (
            <div 
              key={node.belt}
              className={`flex-1 flex flex-row lg:flex-col items-center gap-3.5 bg-zinc-950/40 lg:bg-transparent p-3 lg:p-0 rounded-xl border border-zinc-850 lg:border-none relative z-10 transition duration-300 ${
                isActive ? 'border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]' : ''
              }`}
            >
              {/* Circle belt hub node */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all relative ${
                node.unlocked 
                  ? 'bg-zinc-900 hover:scale-105 shadow-md shadow-indigo-500/10 cursor-default' 
                  : 'bg-zinc-950 opacity-40 border-zinc-805 text-zinc-650 cursor-not-allowed'
              } ${node.color} ${isActive ? 'scale-110 ring-4 ring-indigo-505/30' : ''}`}>
                {node.unlocked ? (
                  <CheckCircle2 className={`w-5 h-5 ${isActive ? 'text-indigo-400 animate-pulse' : 'text-emerald-500'}`} />
                ) : (
                  <span className="text-[9px] font-bold font-mono tracking-tighter text-zinc-600">LOCKED</span>
                )}
                
                {/* Visual "ATUAL" ticker pointer */}
                {isActive && (
                  <span className="absolute -top-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-[8px] font-mono font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-md">
                    ATUAL
                  </span>
                )}
              </div>

              {/* Title & info description */}
              <div className="text-left lg:text-center min-w-0">
                <p className="font-display font-black text-xs text-zinc-100 tracking-tight font-sans">{translatedBelt}</p>
                <span className="text-[10px] text-zinc-500 block font-mono">
                  {node.reqXp === 0 ? 'Iniciante' : `Min. Lvl ${node.avgLvl}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Dynamic tip bar footer */}
      <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-900/60 mt-5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Foco do Sensei: "O inglês é a sua melhor pegada de lapela no cenário mundial."</span>
        </span>
        <span className="text-[9.5px] text-zinc-500 hidden sm:inline-block">Auto-Sync</span>
      </div>
    </motion.div>
  );
}
