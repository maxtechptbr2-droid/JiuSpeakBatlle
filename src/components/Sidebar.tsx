/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  User, 
  Flame, 
  Coins, 
  Trophy, 
  BookOpen, 
  Sword, 
  Store, 
  Users, 
  DollarSign, 
  ShieldAlert, 
  ChevronRight,
  Sparkles,
  Award,
  LogOut,
  Wallet,
  CreditCard,
  Share2,
  Shield,
  GraduationCap
} from 'lucide-react';
import { UserProfile, BeltRank } from '../types';
import { AvatarWithFrame } from './AvatarWithFrame';

interface SidebarProps {
  user: UserProfile;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCheatModal?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({ user, currentTab, setCurrentTab, onOpenCheatModal, onLogout }: SidebarProps) {
  const [academyExpanded, setAcademyExpanded] = React.useState(true);
  
  // BJJ belt background configurations
  const getBeltBg = (belt: BeltRank) => {
    switch (belt) {
      case 'Branca': return 'bg-white text-slate-800 border border-slate-300';
      case 'Azul': return 'bg-blue-600 text-white';
      case 'Roxa': return 'bg-purple-700 text-white';
      case 'Marrom': return 'bg-amber-900 text-white';
      case 'Preto': return 'bg-slate-900 border border-red-600 text-red-500';
      default: return 'bg-white text-slate-800';
    }
  };

  const hasPermission = (featureKey: string): boolean => {
    return true;
  };

  const hasAcademyAccess = true;
  const hasConversacaoAccess = true;
  const hasArenaPvpAccess = true;

  const menuItems = [
    { id: 'dashboard', label: 'Painel do Aluno', icon: GraduationCap, badge: null },
    { id: 'profile-settings', label: 'Meu Perfil', icon: User, badge: 'Ajustes' },
    { id: 'lessons', label: 'Módulos do Curso', icon: BookOpen, badge: 'Aulas' },
    ...(hasConversacaoAccess ? [{ id: 'pvp', label: 'Sessões de Conversação', icon: Sword, badge: 'Desafios' }] : []),
    { id: 'market', label: 'Loja JiuSpeak', icon: Store, badge: 'Loja' },
    { id: 'inventory', label: 'Mochila JiuSpeak', icon: Award, badge: 'Mochila' },
    { id: 'subscriptions', label: 'Central de JiuTickets', icon: Coins, badge: 'JT' },
    { id: 'social', label: 'Comunidade', icon: Users, badge: 'Fórum' },
    ...(hasAcademyAccess ? [{ id: 'academies', label: 'Academias BJJ', icon: Shield, badge: 'Equipes' }] : []),
    { id: 'viral', label: 'Compartilhar Viral', icon: Share2, badge: 'Canvas' },
    ...(user.role === 'admin' ? [
      { id: 'finance', label: 'Finanças & Carteira', icon: Wallet, badge: 'Carteira' }
    ] : []),
    ...(user.role === 'admin' || user.role === 'professor' ? [
      { id: 'creator', label: 'Painel Professor', icon: DollarSign, badge: 'Docente' }
    ] : []),
    ...(user.role === 'admin' ? [
      { id: 'admin', label: 'Painel Admin', icon: ShieldAlert, badge: 'Auditoria' }
    ] : []),
  ];

  return (
    <aside className="w-full lg:w-72 bg-slate-950/80 backdrop-blur-md border-r border-slate-800 flex flex-col h-auto lg:h-screen sticky top-0" id="bjj-sidebar">
      {/* Branding Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="font-display font-bold text-white text-xl">🥋</span>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl bg-gradient-to-r from-violet-400 via-indigo-200 to-white bg-clip-text text-transparent tracking-tight">
              JiuSpeak
            </h1>
            <span className="text-[10px] text-slate-400 font-mono block">Inglês para Jiu-Jitsu</span>
          </div>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-900/25">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <AvatarWithFrame
              avatarUrl={user.avatar}
              userName={user.name}
              frame={user.equippedFrame}
              size="sm"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-sm text-slate-200 truncate">{user.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${getBeltBg(user.belt)}`}>
                Faixa {user.belt}
              </span>
              <span className="text-xs text-slate-400 font-mono">Nv. {user.level}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Belt Graphic representation */}
        <div className="my-3">
          <div className="text-[10px] uppercase font-mono text-slate-400 mb-1 flex justify-between">
            <span>Visual da Faixa</span>
            <span>{user.stripes} {user.stripes === 1 ? 'Grau' : 'Graus'}</span>
          </div>
          
          <div className="h-6 rounded bg-slate-800 border border-slate-700 overflow-hidden relative flex shadow-inner">
            {/* Main belt body */}
            <div className={`w-3/4 h-full ${
              user.belt === 'Branca' ? 'bg-white' : 
              user.belt === 'Azul' ? 'bg-blue-600' : 
              user.belt === 'Roxa' ? 'bg-purple-700' : 
              user.belt === 'Marrom' ? 'bg-amber-900' : 'bg-slate-900'
            }`} />
            
            {/* The tip sleeve (Preta na maioria, Vermelha no Preto) */}
            <div className={`w-1/4 h-full relative ${user.belt === 'Preto' ? 'bg-red-600' : 'bg-slate-950'} flex justify-around items-center px-1`}>
              {/* Vertical white lines representing stripes */}
              {Array.from({ length: 4 }).map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-0.5 h-4 rounded-sm transition-all ${idx < user.stripes ? 'bg-white' : 'bg-transparent'}`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Streaks and Currencies indicators */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10" />
            <div className="leading-none">
              <span className="block text-[10px] text-slate-500 font-mono">OFENSIVA</span>
              <span className="text-xs font-bold text-slate-200">{user.streak} Dias</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <Coins className="w-4 h-4 text-amber-500 fill-amber-500/10" />
            <div className="leading-none">
              <span className="block text-[10px] text-slate-500 font-mono">JIUTICKETS</span>
              <span className="text-xs font-bold text-slate-200">{user.coins} JT</span>
            </div>
          </div>
        </div>

        {/* XP Level Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
            <span>Progressão de Nível</span>
            <span>{user.xp} / {user.xpNextLevel} XP</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (user.xp / user.xpNextLevel) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        
        {/* Academy Accordion Section */}
        <div className="mb-4 bg-slate-900/10 border border-slate-900 rounded-2xl p-1.5 shadow-sm">
          <button
            onClick={() => setAcademyExpanded(!academyExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left opacity-95 text-violet-300 font-bold hover:text-white hover:bg-slate-900/60 rounded-xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4.5 h-4.5 text-violet-400" />
              <span className="text-xs uppercase tracking-wider font-mono font-black">📚 JiuSpeak Academy</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${academyExpanded ? 'rotate-90 text-violet-400' : ''}`} />
          </button>

          {academyExpanded && (
            <div className="pl-3.5 mt-1 space-y-0.5 border-l border-slate-800 ml-4.5 mb-1.5">
              {[
                { id: 'academy_white', label: '🤍 White Belt Path' },
                { id: 'academy_blue', label: '💙 Blue Belt Path' },
                { id: 'academy_purple', label: '💜 Purple Belt Path' },
                { id: 'academy_brown', label: '🤎 Brown Belt Path' },
                { id: 'academy_black', label: '🖤 Black Belt Path' },
                ...(hasArenaPvpAccess ? [{ id: 'academy_pvp', label: '🥊 Arena PVP' }] : []),
                { id: 'academy_progress', label: '📊 Meu Progresso' },
                { id: 'academy_certs', label: '📜 Certificados' },
                ...(user.role === 'admin' ? [
                  { id: 'academy_admin', label: '🛠️ Academy Manager' }
                ] : [])
              ].map((sub) => {
                const isSubActive = currentTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setCurrentTab(sub.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isSubActive
                        ? 'bg-violet-950/50 text-violet-300 font-bold border-l-2 border-violet-500 pl-2'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    }`}
                  >
                    <span>{sub.label}</span>
                    {isSubActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-violet-600/20 to-indigo-900/10 text-indigo-200 border-l-4 border-violet-500 pl-2 bg-slate-900' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-violet-400' : 'text-slate-500'
                }`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              
              {item.badge ? (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase transition-all ${
                  isActive 
                    ? 'bg-violet-500/20 text-violet-300' 
                    : 'bg-slate-800/80 text-slate-500 group-hover:bg-slate-800'
                }`}>
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-slate-500 ${
                  isActive ? 'text-violet-400' : ''
                }`} />
              )}
            </button>
          );
        })}
      </nav>

      {onLogout && (
        <div className="px-4 pb-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-red-400 hover:text-red-300 hover:bg-red-950/20 group cursor-pointer border border-transparent hover:border-red-900/10 font-mono text-xs transition-all"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              <span>Sair do Sistema</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-red-450 transition-all" />
          </button>
        </div>
      )}

      {/* Bottom Footer Credits */}
      <div className="p-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Servidores SP-1 OK</span>
        </div>
        <span>JiuSpeak SaaS</span>
      </div>
    </aside>
  );
}
