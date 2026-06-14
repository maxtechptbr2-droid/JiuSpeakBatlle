import React from 'react';
import { motion } from 'motion/react';
import { Star, Award, Shield, Trophy, Globe, Flame, ShieldAlert, Sparkles, Languages } from 'lucide-react';
import FeaturePill from './FeaturePill';
import CTAButton from './CTAButton';
import heroBg from '../../assets/hero/hero-bg.svg';

interface HeroSectionProps {
  onStartClick: () => void;
  onExploreClick: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  user?: any;
}

export default function HeroSection({ onStartClick, onExploreClick, showToast, user }: HeroSectionProps) {
  const isLoggedIn = user && user.id !== 'visitor';

  // 4 Features as shown exactly in the reference image
  const featuresList = [
    { label: 'Inglês específico para jiu-jitsu', icon: Star },
    { label: 'Método prático 100% aplicado', icon: Award },
    { label: 'Evolução por faixas', icon: Flame },
    { label: 'Comunidade global de lutadores', icon: Languages }
  ];

  const handleAction = () => {
    if (isLoggedIn) {
      showToast('Bem-vindo de volta ao tatame! Redirecionando para seu painel de treino...', 'success');
      // trigger page scroll to curriculum / dashboard
      const el = document.getElementById('cursos');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onStartClick();
    }
  };

  return (
    <section 
      id="inicio" 
      className="relative min-h-screen overflow-hidden flex items-center bg-[#000814]"
    >
      {/* Background: z-0 */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-80"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Cinematic star arena grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.15)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        {/* Neon glowing halos */}
        <div className="absolute top-[-5%] right-[-10%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-[#00bfff]/5 rounded-full blur-[110px]" />
      </div>

      {/* Overlay: z-10 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#040914]/98 via-[#010611]/85 to-[#00040a]/50 z-10 pointer-events-none" />

      {/* Conteúdo: z-20 */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* LEFT COLUMN: CRITICAL TYPOGRAPHY & FEATURES */}
        <div className="lg:col-span-6 space-y-6 md:space-y-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
          
          {/* Subheading Badge - Premium Motto */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/45 border border-blue-500/30 text-blue-450 text-[10px] font-mono font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,132,255,0.1)] mx-auto lg:mx-0">
            <Sparkles className="w-3.5 h-3.5 text-[#00bfff] animate-pulse" />
            <span>TRAIN HARD. SPEAK GLOBALLY.</span>
          </div>

          {/* Epic Main Headline exactly as mockup */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-sans font-black tracking-tighter leading-[1.05] text-white uppercase select-none flex flex-col">
              <span className="block text-white">TRAIN HARD.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#009dff] via-[#00bfff] to-blue-600 drop-shadow-[0_0_35px_rgba(0,157,255,0.45)]">
                SPEAK GLOBALLY.
              </span>
            </h1>
            
            {/* Mockup Subtitle */}
            <p className="text-slate-300 text-base sm:text-lg lg:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Aprenda inglês para competir, ensinar e viver o jiu-jitsu em qualquer lugar do mundo.
            </p>
          </div>

          {/* Features pills container (Grid - 2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl pt-2 mx-auto lg:mx-0 text-left">
            {featuresList.map((feat, idx) => (
              <FeaturePill 
                key={idx} 
                label={feat.label} 
                icon={feat.icon} 
              />
            ))}
          </div>

          {/* CTA Action Trigger Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
            <CTAButton 
              label={isLoggedIn ? "CONTINUAR TREINANDO" : "COMEÇAR AGORA"} 
              onClick={handleAction} 
              className="w-full sm:w-auto px-10 py-4 text-sm uppercase tracking-widest shadow-xl shrink-0"
            />
            
            {!isLoggedIn && (
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-6 py-3.5 bg-transparent hover:bg-blue-950/20 border border-blue-500/20 hover:border-blue-500/50 text-blue-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0"
              >
                Explorar as Faixas
              </button>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: REPRODUCING CINEMATIC EXTREME HIGH FIDELITY FIGHTER GI BACKDROP */}
        <div className="lg:col-span-6 relative flex justify-center items-center lg:pl-6">
          
          {/* Main Visual Arena Stage Box */}
          <div className="relative w-full max-w-[90vw] sm:max-w-[500px] aspect-[4/5] rounded-[2.5rem] bg-[#02050e] border border-blue-500/20 overflow-hidden shadow-[0_0_60px_rgba(0,157,255,0.15)] group">
            
            {/* Arena Spotlights and stadium light rays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#02050e] via-transparent to-[#000814]/20 z-20" />
            
            {/* Dark stadium bottom shadow */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#02050e] to-transparent z-10" />

            {/* Stadium Lights (Blurs) */}
            <div className="absolute top-8 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute top-12 right-1/4 w-40 h-40 bg-indigo-500/15 rounded-full blur-[50px] pointer-events-none" />

            {/* Neon Blue laser light streams */}
            <div className="absolute top-0 left-12 w-[1px] h-full bg-gradient-to-b from-[#00bfff]/40 via-blue-500/10 to-transparent blur-[1px]" />
            <div className="absolute top-0 right-16 w-[1.5px] h-full bg-gradient-to-b from-[#009dff]/30 via-indigo-400/5 to-transparent blur-[2px]" />

            {/* Dust particles */}
            <div className="absolute inset-0 z-25 pointer-events-none">
              <span className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-40 animate-pulse" />
              <span className="absolute top-1/2 right-1/5 w-1 h-1 bg-white rounded-full opacity-50 animate-ping" />
              <span className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400 rounded-full blur-[1.5px] opacity-35 animate-pulse" />
            </div>

            {/* Dangling International Flags of major tournaments (USA, BRA, JPN, UAE, EU) */}
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-3.5 px-6 opacity-30 z-10">
              <div className="flex flex-col items-center gap-1 scale-90">
                <div className="w-[28px] h-[16px] bg-[#111] border border-slate-800/50 flex flex-col justify-between overflow-hidden rounded-[2px]">
                  <div className="bg-blue-800 h-1.5 w-2 flex flex-wrap" />
                  <div className="h-[2px] bg-red-600" />
                </div>
                <span className="text-[7px] font-mono text-slate-450 font-black">USA</span>
              </div>
              <div className="flex flex-col items-center gap-1 scale-90">
                <div className="w-[28px] h-[16px] bg-green-700 pointer-events-none relative flex items-center justify-center rounded-[2px] overflow-hidden">
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-yellow-400" />
                </div>
                <span className="text-[7px] font-mono text-slate-450 font-black">BRA</span>
              </div>
              <div className="flex flex-col items-center gap-1 scale-90">
                <div className="w-[28px] h-[16px] bg-red-800 pointer-events-none relative flex items-center justify-center rounded-[2px] overflow-hidden">
                  <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center font-bold text-[4px] text-red-800">UAE</div>
                </div>
                <span className="text-[7px] font-mono text-slate-450 font-black">UAE</span>
              </div>
              <div className="flex flex-col items-center gap-1 scale-90">
                <div className="w-[28px] h-[16px] bg-white relative flex items-center justify-center rounded-[2px] border border-slate-700/10 overflow-hidden">
                  <div className="w-2.5 h-2.5 bg-red-650 rounded-full" />
                </div>
                <span className="text-[7px] font-mono text-slate-450 font-black">JPN</span>
              </div>
            </div>

            {/* ATHLETE BACK VISUAL COMPOSITE */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 z-30 select-none">
              
              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-102">
                
                {/* Back of athlete wearing a textured white Kimono / Gi */}
                <div className="relative w-[340px] h-[440px] flex flex-col items-center justify-end mt-12">
                  
                  {/* White Gi Fabric body */}
                  <div className="absolute bottom-[-15px] w-72 h-[350px] bg-slate-100 rounded-t-[5.5rem] border-x-[5px] border-t-[9px] border-slate-350 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start pt-12">
                    
                    {/* Collared lapels simulation */}
                    <div className="absolute inset-y-0 w-12 bg-slate-200 border-x border-slate-300/80 transform rotate-12 left-[84px] z-10" />
                    <div className="absolute inset-y-0 w-12 bg-slate-200 border-x border-slate-300/80 transform -rotate-12 right-[84px] z-10" />

                    {/* Dark Black Belt (Faixa Preta) wrapped around upper shoulder neck line with Red Bar on the right */}
                    <div className="absolute top-2.5 w-[108%] h-8 bg-neutral-900 border-b border-black flex items-center justify-end pr-8 shadow-sm">
                      <div className="w-11 h-full bg-red-650 border-x border-red-700/40 text-[7px] font-mono font-black text-white flex items-center justify-center tracking-tighter">
                        4 GR
                      </div>
                    </div>

                    {/* JIUSPEAK centered back logo representation exactly like in reference */}
                    <div className="z-20 text-center mt-12 space-y-2 pointer-events-none filter drop-shadow-md">
                      
                      {/* Stylized diamond-chevron crest emblem above the branding */}
                      <div className="mx-auto w-12 h-12 flex items-center justify-center text-blue-600 font-sans font-black bg-slate-100 rounded-lg shadow-sm border border-slate-200 flex-col relative">
                        <span className="text-2xl text-[#009dff] leading-none">▲</span>
                        <span className="text-[8px] text-[#009dff] leading-none tracking-widest mt-[-2px]">🛡️</span>
                      </div>

                      {/* Clean high-contrast bold lettering as in the gi mockup */}
                      <h3 className="font-sans font-black tracking-[0.25em] text-[#0a1122] uppercase text-4xl block font-semibold">
                        JIUSPEAK
                      </h3>

                      {/* Small accreditation tagline on the jacket fabric */}
                      <div className="inline-flex items-center gap-1 bg-slate-900 text-[#009dff] px-2.5 py-0.5 rounded-full border border-blue-500/30 text-[7px] font-mono font-bold tracking-wider">
                        CHAMPION EDITION
                      </div>
                    </div>

                    {/* Fabric Wrinkles & shadows */}
                    <div className="absolute bottom-16 left-6 w-[2px] h-32 bg-slate-300/45 rotate-15" />
                    <div className="absolute bottom-20 right-6 w-[2px] h-28 bg-slate-300/45 -rotate-15" />
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[1.5px] h-36 bg-slate-300/30" />
                  </div>

                </div>

              </div>

              {/* Status information overlay inside the Arena Card */}
              <div className="space-y-1 relative z-30 font-sans">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00bfff] bg-blue-950/70 px-3 py-1 rounded-full border border-blue-500/25 w-fit block shadow-sm">
                  ARENA OF CHAMPIONS
                </span>
                <p className="text-xs sm:text-sm font-sans font-extrabold text-white drop-shadow-md uppercase tracking-tight">
                  Supere seus limites. Domine em qualquer dojô.
                </p>
              </div>

            </div>

          </div>

          {/* DYNAMIC SPARK FLOATING LAUREL EMBLEM */}
          <div className="absolute -bottom-4 right-4 sm:-right-4 md:-right-6 bg-slate-950/95 border border-blue-500/30 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,157,255,0.18)] flex items-center gap-3 z-40 max-w-xs animate-float">
            <div className="w-11 h-11 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-450 shrink-0 shadow-[0_0_15px_rgba(0,157,255,0.2)]">
              <Trophy className="w-6 h-6 text-[#00bfff]" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-mono font-black text-blue-400 tracking-widest block">
                GLOBAL SYSTEM
              </span>
              <span className="text-xs font-sans font-black text-white block uppercase tracking-tight">
                CERTIFICADO IBJJF
              </span>
              <span className="text-[9px] text-slate-405">Desenvolva a oratória de campeão mundial</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
