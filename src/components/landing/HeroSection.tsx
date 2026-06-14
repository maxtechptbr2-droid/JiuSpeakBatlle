import React from 'react';
import { motion } from 'motion/react';
import { Star, Award, Shield, Trophy, Globe, Flame, ShieldAlert, Sparkles, Languages, ChevronRight, Users } from 'lucide-react';
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
      className="relative z-10 min-h-screen flex items-center justify-center bg-[#000814] pt-24 pb-16 lg:py-32"
    >
      {/* Background container: Panoramic Cinematic Dark Blue Stadium Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Soft stadium dark blue backdrop */}
        <div className="absolute inset-0 bg-[#000814]" />
        
        {/* Real High-Resolution Stadium background photo */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{
            backgroundImage: `url('https://www.jiuspeak.com.br/images/hero-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Perspective Blue Tatame floor of the stadium matching the mockup */}
        <div 
          className="absolute bottom-0 right-0 w-[100%] lg:w-[65%] h-[42%] bg-gradient-to-t from-blue-950 via-[#0a2352] to-[#071635] border-t border-blue-500/25 opacity-75 shadow-[0_0_80px_rgba(0,132,255,0.15)]"
          style={{
            transform: 'perspective(160px) rotateX(22deg) translateY(20px)',
            transformOrigin: 'bottom right',
          }}
        >
          {/* Internal tatame fight line */}
          <div className="absolute inset-2 border border-blue-500/25 opacity-35" />
          <div className="absolute inset-6 border border-yellow-500/10 opacity-20" />
        </div>

        {/* Cinematic ambient colorful glowing halos */}
        <div className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Extreme Vignette Overlay to ensure perfect text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#000814]/95 via-[#000814]/75 to-[#000814]/30 z-10 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-between h-full">
        
        {/* Main Grid: Left copy, Right athletic arena box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* LEFT COLUMN: CRITICAL TYPOGRAPHY & FEATURES */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            
            {/* Subheading Badge - Premium Motto */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/45 border border-blue-500/20 text-[#00bfff] text-[10px] font-mono font-black uppercase tracking-widest mx-auto lg:mx-0">
              <Sparkles className="w-3.5 h-3.5 text-[#00bfff] animate-pulse" />
              <span>CHAMPION EDITION</span>
            </div>

            {/* Epic Main Headline exactly as mockup */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-sans font-black tracking-tighter leading-[1.05] text-white uppercase select-none flex flex-col">
                <span className="block text-white">TRAIN HARD.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#009dff] via-[#00bfff] to-blue-600 drop-shadow-[0_0_35px_rgba(0,157,255,0.25)]">
                  SPEAK GLOBALLY.
                </span>
              </h1>
              
              {/* Mockup Subtitle */}
              <p className="text-slate-300 text-base sm:text-lg lg:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Aprenda inglês para competir, ensinar e viver o jiu-jitsu em qualquer lugar do mundo.
              </p>
            </div>

            {/* Features pills container (Grid - 2 Columns) - Perfectly clean and space-efficient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl pt-2 mx-auto lg:mx-0 text-left">
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
                className="w-full sm:w-auto px-8 py-4 bg-[#009dff] hover:bg-blue-505 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,157,255,0.35)] flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <Users className="w-4 h-4 text-white" />
                <span>COMEÇAR AGORA</span>
              </button>
              
              <button
                type="button"
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-blue-950/20 border border-slate-700 hover:border-blue-500/50 text-slate-355 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-350 cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
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
                    className="w-9 h-9 rounded-full border-2 border-[#000814] object-cover"
                  />
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-[#000814] bg-[#009dff] flex items-center justify-center text-[10px] font-sans font-black text-white">
                  10K+
                </div>
              </div>
              <div className="text-left font-sans">
                <p className="text-xs font-semibold text-slate-200">
                  Mais de 10.000 atletas
                </p>
                <p className="text-[10px] text-slate-400 leading-tight font-medium">conectados globalmente</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: HIGH FIDELITY FIGHTER BACK COMPOSITE standing directly on the arena floor */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-end h-[420px] sm:h-[500px] lg:h-[600px] mt-8 lg:mt-0 select-none pointer-events-none self-end">
            
            {/* Realistically Scale-rendered Athlete GI on the Tatame */}
            <div className="relative w-[340px] h-[450px] sm:w-[400px] sm:h-[520px] lg:w-[480px] lg:h-[600px] flex flex-col items-center justify-end z-20 pb-0 scale-[0.85] sm:scale-100 origin-bottom">
              
              {/* Short athletic haircut */}
              <div className="absolute top-[8%] w-14 h-16 bg-[#121620] rounded-b-xl border-t-[8px] border-[#0a0d14]" />
              {/* Tanned muscular athlete neck */}
              <div className="absolute top-[10%] w-8 h-[32px] bg-[#c88c6c] rounded-b-md shadow-sm" />
              
              {/* White Kimono Gi Representing Elite Athlete Back with 100% Correct Anatomy */}
              <svg viewBox="0 0 200 300" className="w-[85%] h-[85%] drop-shadow-[0_25px_45px_rgba(0,0,0,0.8)]">
                <defs>
                  <linearGradient id="giColorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="60%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <linearGradient id="giCollarGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
                
                {/* Gi Jacket Outline with realistic sleeves & folds */}
                <path d="M25,300 L15,100 C15,70 50,45 100,45 C150,45 185,70 185,100 L175,300 Z" fill="url(#giColorGrad)" />
                
                {/* Crease shadow lines / fold depth */}
                <path d="M45,95 Q30,160 25,240" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M155,95 Q170,160 175,240" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Left & Right Fold Lapels */}
                <path d="M100,75 L45,185 L50,195 L100,85 Z" fill="url(#giCollarGrad)" opacity="0.95" />
                <path d="M100,75 L155,185 L150,195 L100,85 Z" fill="url(#giCollarGrad)" opacity="0.95" />

                {/* Premium Delta Triangle patch logo centered on back of Gi */}
                <g transform="translate(100, 115) scale(0.92)" opacity="0.9">
                  <path d="M-25,25 L25,25 L0,-20 Z" fill="#009dff" />
                  <path d="M-28,28 L28,28 L0,-24 Z" fill="none" stroke="#000" strokeWidth="3" />
                  <line x1="-30" y1="-5" x2="30" y2="-5" stroke="#000" strokeWidth="4.5" strokeLinecap="round" />
                </g>
                
                {/* JIUSPEAK brand letters uppercase on back of Gi */}
                <text x="100" y="172" fontFamily="Inter, sans-serif" fontWeight="950" fontSize="16" letterSpacing="0.22em" fill="#0f172a" textAnchor="middle">
                  JIUSPEAK
                </text>

                {/* Solid BJJ Black Belt (Faixa Preta) with Red block & Degrees */}
                <g transform="translate(0, 205)">
                  <rect x="33" y="0" width="134" height="19" fill="#1e1e1e" rx="4" />
                  <rect x="110" y="0" width="32" height="19" fill="#ef4444" />
                  <line x1="116" y1="3" x2="116" y2="16" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="121" y1="3" x2="121" y2="16" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="127" y1="3" x2="127" y2="16" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="132" y1="3" x2="132" y2="16" stroke="#fbbf24" strokeWidth="1.5" />
                  <path d="M58,15 L48,55 L38,50 L54,12 Z" fill="#1e1e1e" />
                  <path d="M66,15 L76,58 L86,52 L70,12 Z" fill="#1e1e1e" />
                  <path d="M70,30 L73,46 L82,42 L78,26 Z" fill="#ef4444" />
                </g>
              </svg>

            </div>

            {/* DYNAMIC SPARK FLOATING LAUREL EMBLEM - Floating on bottom-right of the fight composite */}
            <div className="absolute bottom-6 right-2 sm:-right-4 bg-[#030712]/95 border border-blue-500/25 rounded-2xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,157,255,0.15)] flex items-center justify-between gap-4 z-40 w-full max-w-[280px] sm:max-w-[320px] transition-transform duration-300 hover:translate-y-[-4px] backdrop-blur-xl pointer-events-auto cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-[#009dff] shrink-0">
                  <Trophy className="w-6 h-6 text-[#009dff]" />
                </div>
                <div className="text-left font-sans">
                  <span className="text-[9px] uppercase font-mono font-black text-[#009dff] tracking-widest block mb-0.5">
                    GLOBAL SYSTEM
                  </span>
                  <span className="text-xs sm:text-sm font-sans font-black text-white block uppercase tracking-tight">
                    CERTIFICADO IBJJF
                  </span>
                  <span className="text-[10px] text-slate-405 block mt-0.5 leading-normal">
                    Desenvolva a oratória de campeão mundial
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-505 shrink-0 ml-1" />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
