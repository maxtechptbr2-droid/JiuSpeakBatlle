import React from 'react';
import { Users, Globe2, BookOpen, Clock } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    {
      value: '+12.500',
      label: 'Alunos Ativos',
      desc: 'Atletas acelerando carreiras globais',
      icon: Users,
    },
    {
      value: '+150',
      label: 'Países Alcançados',
      desc: 'Do dojô no Brasil para os tatames globais',
      icon: Globe2,
    },
    {
      value: '+2.5M',
      label: 'Aulas Concluídas',
      desc: 'Milhares de combates linguísticos resolvidos',
      icon: BookOpen,
    },
    {
      value: '+500K',
      label: 'Horas de Vocabulário',
      desc: 'Tempo investido em domínio prático',
      icon: Clock,
    },
  ];

  return (
    <section id="sobre" className="py-16 bg-gradient-to-b from-[#000814] to-[#040815] relative overflow-hidden">
      
      {/* Visual neon light highlights */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-[#030612]/75 border border-slate-900 hover:border-blue-500/30 rounded-3xl p-6 md:p-8 transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-start gap-4 hover:shadow-[0_0_20px_rgba(0,132,255,0.12)]"
              >
                {/* Glowing icon */}
                <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,132,255,0.15)] shrink-0">
                  <IconComponent className="w-5.5 h-5.5 text-blue-400" />
                </div>

                <div className="space-y-1">
                  <span className="text-3xl md:text-4xl font-black text-white block tracking-tight font-sans">
                    {stat.value}
                  </span>
                  <span className="text-xs font-bold text-slate-200 block uppercase tracking-wide">
                    {stat.label}
                  </span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {stat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
