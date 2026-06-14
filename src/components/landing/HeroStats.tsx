import React from 'react';
import { Users, Globe2, Shield, Star } from 'lucide-react';

interface HeroStatsProps {
  id?: string;
  className?: string;
}

export default function HeroStats({ id, className = '' }: HeroStatsProps) {
  const stats = [
    {
      value: '10K+',
      label: 'ATLETAS',
      icon: Users,
      desc: 'Conectados globalmente'
    },
    {
      value: '50+',
      label: 'PAÍSES',
      icon: Globe2,
      desc: 'Representados'
    },
    {
      value: '100+',
      label: 'ACADEMIAS',
      icon: Shield,
      desc: 'Parcerias ativas'
    },
    {
      value: '4.9',
      label: 'AVALIAÇÃO',
      icon: Star,
      desc: 'Da comunidade'
    }
  ];

  return (
    <div
      id={id || 'hero-statistics-panel'}
      className={`relative py-6 sm:py-8 px-6 sm:px-10 rounded-[2rem] bg-[#030712]/50 border border-blue-500/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,132,255,0.05)] overflow-hidden ${className}`}
    >
      {/* Decorative background glow dots */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-[#00bfff]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 md:divide-x divide-blue-500/10">
        {stats.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div 
              key={idx} 
              className="flex flex-col items-center md:items-start text-center md:text-left gap-2 md:pl-6 md:first:pl-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-950/30 border border-blue-500/15 flex items-center justify-center text-[#00bfff] shrink-0 font-sans">
                  <Icon className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-sans font-black text-white tracking-tight leading-none drop-shadow-[0_0_15px_rgba(0,157,255,0.35)]">
                  {st.value}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-xs font-sans font-extrabold text-slate-200 uppercase tracking-wide">
                  {st.label}
                </span>
                <span className="block text-[10px] text-slate-450 font-medium leading-tight">
                  {st.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
