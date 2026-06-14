import React from 'react';
import { Sparkles, Trophy, Navigation, Target, ShieldCheck, ArrowRight, Award } from 'lucide-react';

interface HeroSectionProps {
  onStartClick: () => void;
  onExploreClick: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function HeroSection({ onStartClick, onExploreClick, showToast }: HeroSectionProps) {
  
  const features = [
    { text: 'Inglês específico para jiu-jitsu', desc: 'Comandos de tatame, esgrima e regras' },
    { text: 'Método prático e 100% aplicado', desc: 'Simulações e dublagem de lutadores' },
    { text: 'Evolução por faixas', desc: 'Do White ao Black Belt do inglês gringo' },
    { text: 'Comunidade global de lutadores', desc: 'Networking com lutadores e donos de dojôs' }
  ];

  return (
    <section 
      id="inicio" 
      className="relative min-h-[calc(100vh-80px)] pt-24 md:pt-36 pb-20 px-6 md:px-12 xl:px-20 bg-gradient-to-b from-[#000814] via-[#050B14] to-[#020617] overflow-hidden flex items-center"
    >
      {/* Cinematic ambient spotlight & background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Soft spotlight filter simulation */}
      <div className="absolute inset-0 bg-[#000814] -z-10 mix-blend-multiply opacity-20" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* LEFT COLUMN: CRITICAL HEADLINES */}
        <div className="lg:col-span-7 space-y-8 animate-fadeIn text-left">
          
          {/* Subheading high-level indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,132,255,0.15)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Premium Athletic English Solution</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl tracking-tight leading-[1.0] font-black text-white uppercase select-none">
              <span className="block text-slate-100 font-sans tracking-tight">TRAIN HARD.</span>
              <span 
                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 text-transparent font-sans tracking-tighter filter drop-shadow-[0_0_35px_rgba(0,132,255,0.5)]"
                style={{ fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif" }}
              >
                SPEAK GLOBALLY.
              </span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg max-w-xl font-normal leading-relaxed">
              Aprenda inglês com o jiu-jitsu e prepare-se para competir, ensinar e viver o jiu-jitsu em qualquer lugar do mundo.
            </p>
          </div>

          {/* Minimal features with glow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {features.map((feat, index) => (
              <div 
                key={index} 
                className="group flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-900 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,132,255,0.05)]"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(0,132,255,0.1)]">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">{feat.text}</h4>
                  <p className="text-[10px] text-slate-400">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-4.5 pt-2">
            <button
              onClick={onStartClick}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(0,132,255,0.35)] hover:shadow-[0_0_30px_rgba(0,132,255,0.55)] cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98]"
            >
              Começar Agora
              <ArrowRight className="w-4.5 h-4.5 animate-bounce-right" />
            </button>

            <button
              onClick={onExploreClick}
              className="px-8 py-4 bg-transparent border border-blue-500/30 text-blue-400 hover:text-white hover:border-blue-500 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 bg-blue-950/5 hover:bg-blue-950/20 cursor-pointer"
            >
              Explorar a Jornada
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: HIGH-IMPACT FIGHTER IMAGE & LAUREL BADGE */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          
          {/* Main Fighter Graphic Container */}
          <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-[2.5rem] bg-[#020617] border border-blue-500/15 overflow-hidden shadow-[0_0_50px_rgba(0,132,255,0.1)] group">
            
            {/* Spotlight and smoke overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#000814]/10 z-20" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#000814] to-transparent z-10" />

            {/* Stadium illumination light streams */}
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blue-400/40 via-blue-500/5 to-transparent blur-[1px]" />
            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-blue-300/30 via-blue-400/5 to-transparent blur-[2px]" />

            {/* Floating particle sparkles */}
            <div className="absolute inset-0 z-25 pointer-events-none">
              <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full blur-[1px] opacity-40 animate-pulse" />
              <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-blue-500 rounded-full blur-[1.5px] opacity-35 animate-bounce-slow" />
              <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-[#0084FF] rounded-full opacity-50 animate-pulse" />
              <div className="absolute top-1/4 right-1/3 w-2.5 h-2.5 bg-indigo-400/35 rounded-full blur-[1px] opacity-30 animate-pulse" />
            </div>

            {/* High-Impact Photographic / Styled Athletic representation */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 z-30 select-none">
              
              {/* Back view of fighter representation */}
              <div className="absolute inset-0 bg-[#081223]/20 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                
                {/* Background stadium lights / flags shape */}
                <div className="absolute top-12 flex gap-4 opacity-40 z-0">
                  <div className="w-8 h-5 border border-slate-705/30 bg-slate-800/20 transform skew-x-12 flex items-center justify-center font-mono text-[6px] text-slate-500">USA</div>
                  <div className="w-8 h-5 border border-slate-705/30 bg-slate-800/20 transform -skew-x-12 flex items-center justify-center font-mono text-[6px] text-slate-500">BRA</div>
                  <div className="w-8 h-5 border border-slate-705/30 bg-slate-800/20 transform skew-x-12 flex items-center justify-center font-mono text-[6px] text-slate-500">UAE</div>
                  <div className="w-8 h-5 border border-slate-705/30 bg-slate-800/20 transform -skew-x-12 flex items-center justify-center font-mono text-[6px] text-slate-500">JPN</div>
                </div>

                {/* Styled illustration of white gi with JIUSPEAK brand */}
                <div className="relative w-80 h-96 flex flex-col items-center justify-end">
                  
                  {/* Shoulders and collar lines */}
                  <div className="absolute bottom-[-10px] w-64 h-80 bg-slate-100 rounded-t-[5rem] border-x-4 border-t-8 border-slate-350 shadow-inner flex flex-col items-center justify-start pt-10">
                    
                    {/* GI Lapel */}
                    <div className="absolute inset-y-0 w-12 bg-slate-200 border-x border-slate-300 transform rotate-12 left-20 z-10" />
                    <div className="absolute inset-y-0 w-12 bg-slate-200 border-x border-slate-300 transform -rotate-12 right-20 z-10" />
                    
                    {/* Black Belt across neck/shoulder simulation */}
                    <div className="absolute top-2 w-[110%] h-8 bg-neutral-900 border-b border-black flex items-center justify-end pr-10">
                      <div className="w-12 h-full bg-red-600 border-x border-red-700 font-mono text-[8px] text-white flex items-center justify-center font-bold tracking-tighter">
                        4 GR
                      </div>
                    </div>

                    {/* JIUSPEAK Brand across the back of the white Kimono */}
                    <div className="z-20 text-center mt-12 space-y-1 rotate-1 hover:rotate-0 transition-transform duration-500">
                      <h3 className="font-sans font-black tracking-widest text-[#0c0f1d] uppercase text-4xl block">
                        JIUSPEAK
                      </h3>
                      <div className="inline-flex items-center gap-1 bg-[#0f172a] text-[#0084FF] px-3 py-0.5 rounded-full border border-blue-500/20 font-mono text-[8px] font-bold tracking-wider">
                        CHAMPION EDITION
                      </div>
                    </div>

                    {/* Wrinkles layout / shadows */}
                    <div className="absolute bottom-6 left-8 w-px h-24 bg-slate-300/40 rotate-12" />
                    <div className="absolute bottom-10 right-8 w-px h-20 bg-slate-300/40 -rotate-12" />
                  </div>

                </div>

              </div>
              
              {/* Overlay card details */}
              <div className="space-y-1 relative z-30">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-500/20 w-fit block">
                  ARENA CHAMPIONSHIP
                </span>
                <p className="text-sm font-sans font-bold text-white drop-shadow-md">
                  Vença barreiras corporais e verbais.
                </p>
              </div>

            </div>

          </div>

          {/* DYNAMIC LAUREL BADGE */}
          <div className="absolute -bottom-6 -right-6 md:-right-8 bg-slate-950/95 border border-blue-500/30 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,132,255,0.15)] flex items-center gap-3 z-40 max-w-xs animate-float">
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_15px_rgba(0,132,255,0.2)]">
              <Award className="w-7 h-7 text-[#0084FF]" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-mono font-black text-blue-400 tracking-widest block">
                GLOBAL ACCREDITED
              </span>
              <span className="text-sm font-sans font-black text-white block uppercase tracking-tight">
                +50K ALUNOS NO MUNDO
              </span>
              <span className="text-[9px] text-slate-400">Combatentes preparados para o Tatame Global</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
