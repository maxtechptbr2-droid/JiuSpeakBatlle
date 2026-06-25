/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  GraduationCap,
  Building2,
  MessageSquare,
  Bell,
  X,
  Loader2
} from 'lucide-react';
import { UserProfile, BeltRank } from '../types';
import { AvatarWithFrame } from './AvatarWithFrame';

interface SidebarProps {
  user: UserProfile;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCheatModal?: () => void;
  onLogout?: () => void;
  unreadMessagesCount?: number;
}

export default function Sidebar({ user, currentTab, setCurrentTab, onOpenCheatModal, onLogout, unreadMessagesCount = 0 }: SidebarProps) {
  console.log("[SIDEBAR USER]", user);

  const [showInbox, setShowInbox] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const inboxRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [bellPos, setBellPos] = useState({ top: 0, left: 0 });

  const updateBellPos = () => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setBellPos({ top: rect.bottom + 8, left: rect.left });
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getToken = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');

  const fetchConversations = async () => {
    setLoadingInbox(true);
    try {
      const res = await fetch('/api/social/messages/recent', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) setConversations(await res.json());
    } catch (e) {}
    setLoadingInbox(false);
  };

  const fetchChat = async (contactId: string) => {
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/social/messages/chat/${contactId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        // Marcar como lidas
        await fetch('/api/social/messages/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify({ senderId: contactId })
        });
      }
    } catch (e) {}
    setLoadingChat(false);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/social/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ receiverId: selectedConv.contact.id, content: chatInput.trim() })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setChatInput('');
      }
    } catch (e) {}
    setSending(false);
  };

  useEffect(() => {
    if (showInbox && !selectedConv) fetchConversations();
  }, [showInbox]);

  useEffect(() => {
    if (selectedConv) fetchChat(selectedConv.contact.id);
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inboxRef.current && !inboxRef.current.contains(e.target as Node)) {
        setShowInbox(false);
        setSelectedConv(null);
        setMessages([]);
      }
    };
    if (showInbox) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInbox]);
  
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
    { id: 'lessons', label: 'Módulos do Curso', icon: BookOpen, badge: 'Módulos' },
    ...(hasConversacaoAccess ? [{ id: 'pvp', label: 'Prática Conversacional IA', icon: Sword, badge: 'Exclusivo' }] : []),
    ...(user.role === 'professor' || user.role === 'admin' ? [
      { id: 'creator', label: 'Painel do Professor', icon: Award, badge: 'Docente' }
    ] : []),
    ...(user.role === 'admin' ? [
      { id: 'admin', label: 'Painel Administrativo', icon: ShieldAlert, badge: 'Auditoria' }
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
          {/* Avatar + Nome clicável para ir ao perfil */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
            onClick={() => setCurrentTab('profile-settings')}
            title="Ir para Meu Perfil"
          >
            <div className="relative">
              <AvatarWithFrame
                avatarUrl={user.profilePhoto || user.avatar}
                userName={user.name}
                frame={user.equippedFrame}
                size="sm"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold text-sm text-slate-200 truncate group-hover:text-violet-300 transition-colors">{user.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${getBeltBg(user.belt)}`}>
                  Faixa {user.belt}
                </span>
                <span className="text-xs text-slate-400 font-mono">Nv. {user.level}</span>
              </div>
            </div>
          </div>

          {/* Sino de notificação de mensagens */}
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => {
                updateBellPos();
                setShowInbox(v => !v);
                setSelectedConv(null);
                setMessages([]);
              }}
              title={unreadMessagesCount > 0 ? `${unreadMessagesCount} mensagem(ns) não lida(s)` : 'Mensagens'}
              className="relative p-2 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all shrink-0 group"
            >
              <Bell className={`w-4 h-4 transition-colors ${unreadMessagesCount > 0 ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 border border-slate-950 animate-pulse">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Inbox via Portal — renderizado no body, nunca cortado por overflow */}
            {showInbox && createPortal(
              <div
                ref={inboxRef}
                style={{ position: 'fixed', top: bellPos.top, left: bellPos.left, zIndex: 9999 }}
                className="w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
              >
                {!selectedConv ? (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                      <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">Mensagens</span>
                      <button onClick={() => setShowInbox(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Conversation list */}
                    <div className="max-h-72 overflow-y-auto">
                      {loadingInbox ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs font-mono">Nenhuma mensagem ainda</div>
                      ) : conversations.map((conv: any) => (
                        <button
                          key={conv.contact.id}
                          onClick={() => setSelectedConv(conv)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 text-left"
                        >
                          <div className="relative shrink-0">
                            {conv.contact.avatar ? (
                              <img src={conv.contact.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center text-xs font-bold border border-violet-500/20">
                                {conv.contact.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                            {conv.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-slate-900">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-200 truncate">{conv.contact.name}</p>
                            <p className="text-[10px] text-slate-500 truncate font-mono">{conv.lastMessage?.content}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                      <button onClick={() => { setSelectedConv(null); setMessages([]); fetchConversations(); }} className="text-slate-500 hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {selectedConv.contact.avatar ? (
                          <img src={selectedConv.contact.avatar} className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center text-[10px] font-bold">
                            {selectedConv.contact.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-200 truncate">{selectedConv.contact.name}</span>
                      </div>
                      <button onClick={() => setShowInbox(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Messages */}
                    <div className="h-56 overflow-y-auto p-3 space-y-2 bg-slate-950/50">
                      {loadingChat ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-500 text-[10px] font-mono">Nenhuma mensagem ainda</div>
                      ) : messages.map((msg: any, i: number) => {
                        const isMe = msg.senderId !== selectedConv.contact.id;
                        return (
                          <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-xl px-3 py-1.5 text-[11px] ${isMe ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                              {msg.content}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                    {/* Input */}
                    <div className="flex gap-2 p-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Digite uma mensagem..."
                        className="flex-1 bg-slate-950 text-slate-100 text-[11px] border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 font-sans"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !chatInput.trim()}
                        className="p-2 bg-violet-600 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-xl transition-all"
                      >
                        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </>
                )}
              </div>,
              document.body
            )}
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
