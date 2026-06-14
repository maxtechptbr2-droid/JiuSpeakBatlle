import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Lock } from 'lucide-react';

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onNavigateToSection: (id: string) => void;
}

export default function Navbar({ onLoginClick, onRegisterClick, onNavigateToSection }: NavbarProps) {
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

  return (
    <nav
      id="navbar-jiuspeak"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-sans ${
        isScrolled
          ? 'bg-[#030712]/90 backdrop-blur-md border-b border-blue-500/10 shadow-[0_4px_30px_rgba(0,132,255,0.05)] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* LOGO */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <span className="text-2xl transition-transform group-hover:rotate-12 duration-300">🥋</span>
          <span className="font-sans font-black text-2xl tracking-widest text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-400">
            JIUSPEAK
          </span>
        </button>

        {/* DESKTOP DESCRIPTIVE MENU */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.targetId)}
              className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-all cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all hover:after:w-full"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* LOG IN / REGISTER BUTONS */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-all cursor-pointer px-4 py-2 hover:bg-slate-900/40 rounded-lg"
          >
            Entrar
          </button>
          
          <button
            onClick={onRegisterClick}
            className="relative overflow-hidden px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,132,255,0.35)] hover:shadow-[0_0_25px_rgba(0,132,255,0.55)] active:scale-95 flex items-center gap-1.5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 hover:opacity-100 transition-opacity" />
            <span className="relative z-10">Criar conta</span>
          </button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white cursor-pointer bg-slate-900/50 rounded-lg border border-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 right-0 bg-[#020617] border-b border-blue-500/10 p-6 space-y-6 animate-fadeIn shadow-2xl">
          <div className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleMenuClick(item.targetId)}
                className="text-left py-2 text-lg font-medium text-slate-300 hover:text-blue-400 transition-all border-b border-slate-900"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-slate-900">
            <button
              onClick={() => {
                onLoginClick();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-3 bg-slate-900 hover:bg-slate-855 text-slate-300 hover:text-white rounded-xl text-sm font-semibold border border-slate-800 cursor-pointer"
            >
              Entrar
            </button>
            
            <button
              onClick={() => {
                onRegisterClick();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold cursor-pointer shadow-[0_0_15px_rgba(0,132,255,0.3)]"
            >
              Criar conta
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
