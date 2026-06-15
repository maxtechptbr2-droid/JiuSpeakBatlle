import React from 'react';
import { motion } from 'motion/react';
import { Users, Globe, Flame, Radio, Zap } from 'lucide-react';

export default function CommunityCard() {
  // Realistic high-fidelity global community statistics
  const onlineAtletasCount = 412;
  const activeCountries = 35;
  const recentActivities = [
    { id: 1, name: 'John Doe 🇺🇸', action: 'submeteu armlock na Arena PvP', time: '2m atrás', belt: 'Azul' },
    { id: 2, name: 'Takeshi Sato 🇯🇵', action: 'recebeu grau na Faixa Branca', time: '12m atrás', belt: 'Branca' },
    { id: 3, name: 'Rodrigo BJJ 🇧🇷', action: 'completou Inglês Avançado do Medalhista', time: '18m atrás', belt: 'Preto' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#0b101f]/70 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
      id="community-global-card"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
            <div>
              <h4 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight font-sans">Comunidade Global</h4>
              <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Conexão em Tempo Real</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
            ● ONLINE
          </span>
        </div>

        {/* Community Stats row of badges */}
        <div className="grid grid-cols-2 gap-3.5 mb-5">
          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-900 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
              <Users className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">Atletas Online</span>
            </div>
            <h3 className="text-xl font-black text-white font-mono tracking-tight">{onlineAtletasCount}</h3>
          </div>
          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-900 text-center">
            <div className="flex items-center justify-center gap-1 text-indigo-400 mb-1">
              <Globe className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">Países Ativos</span>
            </div>
            <h3 className="text-xl font-black text-white font-mono tracking-tight">{activeCountries}</h3>
          </div>
        </div>

        {/* Dynamic Activity Feed / Social RESUME */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">Mural Social Ativo</span>
          
          <div className="space-y-2 max-h-[160px] overflow-hidden">
            {recentActivities.map((act) => (
              <div 
                key={act.id} 
                className="p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-900/60 flex items-center justify-between text-[11px] gap-2 transition-all hover:bg-zinc-950"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    act.belt === 'Preto' ? 'bg-red-500' :
                    act.belt === 'Azul' ? 'bg-blue-500' :
                    act.belt === 'Roxa' ? 'bg-purple-500' : 'bg-slate-300'
                  }`} />
                  <p className="text-zinc-300 truncate font-sans">
                    <span className="font-bold text-zinc-100">{act.name}</span>{' '}
                    <span className="text-zinc-400 text-[10.5px]">{act.action}</span>
                  </p>
                </div>
                <span className="text-[9px] text-zinc-500 shrink-0 font-mono">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[10.5px] text-zinc-500 font-sans">
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
          <span>Inglês interliga tatames de todo o globo</span>
        </span>
      </div>
    </motion.div>
  );
}
