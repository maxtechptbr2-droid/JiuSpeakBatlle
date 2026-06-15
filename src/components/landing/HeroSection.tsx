import React from 'react';
import { motion } from 'motion/react';
import { Star, Award, Shield, Trophy, Globe, Flame, ShieldAlert, Sparkles, Languages, ChevronRight, Users } from 'lucide-react';
import FeaturePill from './FeaturePill';
import CTAButton from './CTAButton';

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
      className="relative min-h-[92vh] sm:min-h-screen w-full overflow-hidden flex items-center justify-center pt-24 pb-16 lg:pt-32 lg:pb-24 bg-slate-950"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              rgba(2, 6, 23, 0.94),
              rgba(2, 6, 23, 0.78),
              rgba(2, 6, 23, 0.50)
            ),
            radial-gradient(
              circle at center,
              transparent 0%,
              rgba(0, 0, 0, 0.60) 100%
            ),
            url('https://www.jiuspeak.com.br/images/hero-bg.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Atmospheric minimal ambient glow (soft, not heavy or over-gamer) */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none mix-blend-screen z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-between h-full">
        
        {/* Main Grid: Left copy, Right athletic arena box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* LEFT COLUMN: CRITICAL TYPOGRAPHY & FEATURES */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            
            {/* Subheading Badge - Premium Motto */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider mx-auto lg:mx-0">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>DIAMOND ATHLETE SYSTEM</span>
            </div>

            {/* Epic Main Headline exactly as mockup */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-black tracking-tighter leading-[1.05] text-white uppercase select-none flex flex-col">
                <span className="block text-white">TRAIN HARD.</span>
                <span className="block text-blue-400">
                  SPEAK GLOBALLY.
                </span>
              </h1>
              
              {/* Mockup Subtitle */}
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 font-sans">
                Aprenda inglês para competir, ensinar e viver o jiu-jitsu em qualquer lugar do mundo.
              </p>
            </div>

            {/* Features pills container (Grid - 2 Columns) - Perfectly clean and space-efficient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl pt-2 mx-auto lg:mx-0 text-left">
              {featuresList.map((feat, idx) => (
                <FeaturePill 
                  key={idx} 
                  label={feat.label} 
                  icon={feat.icon} 
                />
              ))}
            </div>

            {/* CTA Action Trigger Button and Secondary outline button side-by-side matching mockup exactly */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
              <button
                type="button"
                onClick={handleAction}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <Users className="w-4 h-4 text-white" />
                <span>COMEÇAR AGORA</span>
              </button>
              
              <button
                type="button"
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-slate-900/40 border border-slate-850 hover:border-blue-500/30 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4 text-slate-400" />
                <span>EXPLORAR A JORNADA</span>
              </button>
            </div>

            {/* Stacked Athlete Avatars + Label exactly like the screenshot */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
              <div className="flex -space-x-3 select-none">
                {[
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120',
                  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120&h=120',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120'
                ].map((src, i) => (
                  <img 
                    key={i} 
                    src={src} 
                    alt="Atleta" 
                    className="w-9 h-9 rounded-full border-2 border-slate-950 object-cover"
                  />
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-slate-950 bg-blue-650 flex items-center justify-center text-[10px] font-sans font-extrabold text-white">
                  10K+
                </div>
              </div>
              <div className="text-left font-sans">
                <p className="text-xs font-semibold text-slate-250">
                  Mais de 10.000 atletas
                </p>
                <p className="text-[10px] text-slate-400 leading-tight font-medium">conectados globalmente</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Spacer to let the background image's cinematic athlete shine through unobstructed */}
          <div className="lg:col-span-6 h-[80px] lg:h-[600px] pointer-events-none select-none" />

        </div>

      </div>
    </section>
  );
}
