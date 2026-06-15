import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, Star, Award, User } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onNavigateToSection: (id: string) => void;
  user?: any;
}

export default function Header({ onLoginClick, onRegisterClick, onNavigateToSection, user }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Início', targetId: 'inicio' },
    { label: 'A Jornada', targetId: 'jornada' },
    { label: 'Cursos', targetId: 'cursos' },
    { label: 'Comunidade', targetId: 'comunidade' },
    { label: 'Sobre', targetId: 'sobre' },
  ];

  const handleMenuClick = (targetId: string) => {
    onNavigateToSection(targetId);
    setMobileMenuOpen(false);
  };

  const isLoggedIn = user && user.id !== 'visitor';

  return (
    <nav
      id="header-premium-bar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-sans ${
        isScrolled
          ? 'bg-[#030712]/95 backdrop-blur-lg border-b border-blue-500/10 shadow-[0_4px_30px_rgba(0,132,255,0.06)] py-2'
          : 'bg-transparent py-4'
      }`}
    >
      {/* Top International flags banner matching UI screenshot exactly */}
      <div className="w-full flex justify-center items-center gap-4 text-[10px] font-mono font-bold tracking-widest text-[#94a3b8] mb-1 opacity-85 select-none">
        <span className="flex items-center gap-1">🇺🇸 <span className="text-[9px] uppercase text-slate-400">USA</span></span>
        <span className="w-1 h-1 rounded-full bg-blue-500" />
        <span className="flex items-center gap-1">🇧🇷 <span className="text-[9px] uppercase text-slate-400">BRA</span></span>
        <span className="w-1 h-1 rounded-full bg-blue-500" />
        <span className="flex items-center gap-1">🇦🇪 <span className="text-[9px] uppercase text-slate-400">UAE</span></span>
        <span className="w-1 h-1 rounded-full bg-blue-500" />
        <span className="flex items-center gap-1">🇯🇵 <span className="text-[9px] uppercase text-slate-400">JPN</span></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* LEFT: LOGO */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 group cursor-pointer shrink-0"
        >
          <span className="text-2xl transition-transform group-hover:rotate-12 duration-300">🥋</span>
          <span className="font-sans font-black text-2xl tracking-widest text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-400">
            JIUSPEAK
          </span>
        </button>

        {/* CENTER: DESKTOP NAVIGATION (REMOVED PLANOS) */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.targetId)}
              className="text-xs uppercase tracking-widest font-extrabold text-slate-350 hover:text-[#00bfff] transition-all cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#009dff] after:transition-all hover:after:w-full select-none whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* RIGHT: ACTION CONTROLS */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 shrink-0">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 lg:gap-4">
              <button
                onClick={() => handleMenuClick('inicio')} // triggers show dashboard context
                className="text-[10px] sm:text-xs font-mono font-bold text-blue-400 hover:text-white transition-all cursor-pointer bg-blue-950/40 px-3 py-2 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(0,132,255,0.1)] flex items-center gap-1.5 whitespace-nowrap"
              >
                <Award className="w-4 h-4 text-blue-400 shrink-0" />
                <span>MEU TATAME PREMIUM ({user.belt || 'WHITE'})</span>
              </button>
              
              <div className="w-9 h-9 rounded-full bg-slate-900 border border-blue-500 flex items-center justify-center shrink-0">
                <img 
                  src={user.avatar || '/avatars/default.png'} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="text-xs font-extrabold uppercase tracking-widest text-slate-300 hover:text-white transition-all cursor-pointer px-3 sm:px-4.5 py-2.5 hover:bg-slate-900/40 rounded-xl whitespace-nowrap"
              >
                Entrar
              </button>
              
              <button
                onClick={onRegisterClick}
                className="relative overflow-hidden px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,132,255,0.3)] hover:shadow-[0_0_25px_rgba(0,132,255,0.5)] active:scale-95 whitespace-nowrap"
              >
                Criar conta
              </button>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white cursor-pointer bg-slate-900/40 rounded-xl border border-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 right-0 bg-[#020617]/95 backdrop-blur-lg border-b border-blue-500/10 p-6 space-y-6 animate-fadeIn shadow-2xl">
          <div className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleMenuClick(item.targetId)}
                className="text-left py-2 text-sm uppercase tracking-widest font-black text-slate-300 hover:text-[#00bfff] transition-all border-b border-slate-900/40"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-slate-950">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleMenuClick('inicio');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-3 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-xs font-black tracking-widest uppercase cursor-pointer"
              >
                ACESSAR JIUSPEAK ACADEMY
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    onLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-black tracking-widest uppercase border border-slate-800 cursor-pointer"
                >
                  Entrar
                </button>
                
                <button
                  onClick={() => {
                    onRegisterClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-xs font-black tracking-widest uppercase cursor-pointer shadow-[0_0_15px_rgba(0,132,255,0.3)]"
                >
                  Criar conta
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
