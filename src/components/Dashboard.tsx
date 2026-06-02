/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  MapPin, 
  Scale, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Edit3, 
  Sparkles,
  BookOpen,
  Sword,
  Coins,
  Tv
} from 'lucide-react';
import { UserProfile, Achievement, BeltRank } from '../types';

interface DashboardProps {
  user: UserProfile;
  achievements: Achievement[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  claimAchievement: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ user, achievements, updateUser, claimAchievement, onNavigate }: DashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for editing form
  const [editForm, setEditForm] = useState({
    name: user.name,
    academy: user.academy,
    category: user.category,
    guardsPreference: user.guardsPreference,
    submitsPreference: user.submitsPreference
  });

  const handleSave = () => {
    updateUser(editForm);
    setIsEditing(false);
  };

  const getWinRate = () => {
    const total = user.winCount + user.lossCount;
    if (total === 0) return 0;
    return Math.round((user.winCount / total) * 100);
  };

  // Predefined lists for BJJ preferences
  const weightCategories = ['Pluma (-64kg)', 'Pena (-70kg)', 'Leve (-76kg)', 'Médio (-82.3kg)', 'Meio-Pesado (-88.3kg)', 'Pesado (-94.3kg)', 'Absoluto (Sem limite)'];
  const guardPreferences = ['Guarda Fechada de Aço', 'Laço de Borracha', 'Guarda Aberta Dinâmica', 'Meia Guarda Profunda', 'Passador Pressão Brutal', 'Guarda Aranha Flexível'];
  const submissionPreferences = ['Estrangulamento Cruzado', 'Armlock Voador', 'Mata-Leão Pelas Costas', 'Triângulo no Aperto', 'Chave de Pé Estilo Caipira', 'Mão de Vaca Oculta'];

  const beltRoadmap: { belt: BeltRank; avgLvl: number; reqXp: number; unlocked: boolean; color: string }[] = [
    { belt: 'Branca', avgLvl: 1, reqXp: 0, unlocked: true, color: 'border-slate-300 text-slate-100 bg-slate-800' },
    { belt: 'Azul', avgLvl: 5, reqXp: 1200, unlocked: user.level >= 5 || user.belt !== 'Branca', color: 'border-blue-500 text-blue-200 bg-blue-950/40' },
    { belt: 'Roxa', avgLvl: 12, reqXp: 3000, unlocked: ['Roxa', 'Marrom', 'Preto'].includes(user.belt), color: 'border-purple-500 text-purple-200 bg-purple-950/40' },
    { belt: 'Marrom', avgLvl: 20, reqXp: 6000, unlocked: ['Marrom', 'Preto'].includes(user.belt), color: 'border-amber-600 text-amber-200 bg-amber-950/40' },
    { belt: 'Preto', avgLvl: 30, reqXp: 10000, unlocked: user.belt === 'Preto', color: 'border-red-600 text-red-100 bg-slate-900 border-2 shadow-red-500/20 shadow' },
  ];

  return (
    <div className="space-y-6" id="bjj-dashboard">
      {/* Top Welcome Title */}
      <div className="bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-indigo-950/20 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pulse-glow -z-10" />
        
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 fill-violet-400/20 text-violet-400" />
            <span>Tatame Virtual Iniciado</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
            Oss, {user.name}! 🥊
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Sua jornada virtual rumo à Faixa Preta de Jiu-Jitsu. Complete lições do Duolingo, participe de sparrings táticos estilo Chess.com e gerencie suas vendas acadêmicas.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('lessons')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" /> Estudar Lição
          </button>
          <button 
            onClick={() => onNavigate('pvp')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sword className="w-3.5 h-3.5 text-indigo-400" /> Desafiar PVP
          </button>
        </div>
      </div>

      {/* Main Grid: Left Athlete Bio & Pathway / Right Calendar & Achievements */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side (Col span 2) athlete profiles & pathways */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Athlete Profile Card */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80 relative">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-display font-bold text-lg text-slate-200">Perfil do Atleta (Fighter Registry)</h3>
              </div>
              <button
                onClick={() => {
                  if (isEditing) handleSave();
                  else setIsEditing(true);
                }}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3 text-violet-400" />
                {isEditing ? 'Salvar Perfil' : 'Editar Atributos'}
              </button>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[10px] uppercase">Apelido do Lutador</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[10px] uppercase">Escola / Academia</label>
                  <input
                    type="text"
                    value={editForm.academy}
                    onChange={(e) => setEditForm({ ...editForm, academy: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[10px] uppercase">Categoria de Peso</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    {weightCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[10px] uppercase">Especialidade de Guarda / Passing</label>
                  <select
                    value={editForm.guardsPreference}
                    onChange={(e) => setEditForm({ ...editForm, guardsPreference: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    {guardPreferences.map((grd) => (
                      <option key={grd} value={grd}>{grd}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-slate-500 font-mono text-[10px] uppercase">Finalização Assinatura</label>
                  <select
                    value={editForm.submitsPreference}
                    onChange={(e) => setEditForm({ ...editForm, submitsPreference: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    {submissionPreferences.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Academy metadata */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase mb-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>Academia</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.academy}</p>
                </div>

                {/* Category Weight */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase mb-1">
                    <Scale className="w-3.5 h-3.5 text-blue-400" />
                    <span>Categoria</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.category}</p>
                </div>

                {/* Guard Preference */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                    <span>Preferência</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.guardsPreference}</p>
                </div>

                {/* Signature Submissions */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase mb-1">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                    <span>Assinatura</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.submitsPreference}</p>
                </div>

              </div>
            )}

            {/* Quick stats indicators */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/40 text-center">
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Arena ELO</span>
                <span className="text-lg font-bold text-violet-400 tracking-tight">{user.elo} elo</span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Sparring W/L</span>
                <span className="text-lg font-bold text-slate-200 tracking-tight">
                  <span className="text-emerald-500">{user.winCount}</span>
                  <span className="text-slate-600 font-normal">/</span>
                  <span className="text-red-500">{user.lossCount}</span>
                </span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Aproveitamento</span>
                <span className="text-lg font-bold text-yellow-500 tracking-tight">{getWinRate()}%</span>
              </div>
            </div>
          </div>

          {/* Gamified Belt Trail Roadmap (Duolingo Belt map) */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-slate-200 flex items-center gap-2">
                <span>🛣️</span> Trilha Gamificada de Faixas (Syllabus Route)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Suba de nível praticando aulas teóricas e sparring PvP para progredir na hierarquia do Jiu-Jitsu.
              </p>
            </div>

            {/* Path UI */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2 relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800/60 hidden md:block -translate-y-1/2 -z-10" />
              
              {beltRoadmap.map((node, idx) => {
                const isActive = user.belt === node.belt;
                return (
                  <div 
                    key={node.belt}
                    className="flex-1 flex flex-row md:flex-col items-center gap-3 bg-slate-900/30 md:bg-transparent p-3 md:p-0 rounded-xl border border-slate-800/40 md:border-none relative z-10"
                  >
                    {/* Circle Node */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all relative ${
                      node.unlocked 
                        ? 'bg-slate-900 hover:scale-105 shadow-md shadow-violet-500/10' 
                        : 'bg-slate-950 opacity-40 border-slate-800 text-slate-600'
                    } ${node.color} ${isActive ? 'scale-110 ring-4 ring-violet-500/30' : ''}`}>
                      {node.unlocked ? (
                        <CheckCircle2 className={`w-5 h-5 ${isActive ? 'text-violet-400 animate-pulse' : 'text-emerald-500'}`} />
                      ) : (
                        <span className="text-xs font-bold font-mono">LOCKED</span>
                      )}
                      
                      {/* Interactive current pointer */}
                      {isActive && (
                        <span className="absolute -top-3 bg-violet-600 text-[8px] font-mono font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                          VOCÊ
                        </span>
                      )}
                    </div>

                    {/* Metadata text */}
                    <div className="text-left md:text-center min-w-0">
                      <p className="font-display font-medium text-xs text-slate-200">{node.belt} Belt</p>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {node.belt === 'Branca' ? 'Iniciante' : `Min. Nível ${node.avgLvl}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-slate-900/50 p-3 h-11 rounded-lg border border-slate-800/40 mt-5 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                Dica da IA Gracie: "Mantenha gola tensionada e quadril solto."
              </span>
              <span className="text-[10px] text-slate-500">Auto-Refresco 5s</span>
            </div>
          </div>

        </div>

        {/* Right Side: Daily Flame Streaks & Achievements Board */}
        <div className="space-y-6">
          
          {/* Daily Streak Board (Duolingo Style) */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-slate-200 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                <span>Ofensiva Diária</span>
              </h3>
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold font-display">
                {user.streak} DIAS SEGUIDOS
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-normal">
              Estude conceitos todos os dias no JiuSpeak para manter o cérebro afiado! Perder um dia quebra o multiplicador de XP.
            </p>

            {/* Streak Calendar Grid Sim */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-slate-500">
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="block text-slate-400 font-bold">{day}</span>
                  <div className={`h-8 rounded-md flex items-center justify-center transition-all ${
                    idx < Math.min(7, user.streak)
                      ? 'bg-orange-500 text-slate-950 font-bold shadow-lg shadow-orange-500/20' 
                      : (idx === 6 ? 'bg-slate-900 border border-slate-800 text-slate-500' : 'bg-slate-900 border border-slate-800 text-slate-500')
                  }`}>
                    {idx < Math.min(7, user.streak) ? '🔥' : '•'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/40 text-[11px] text-slate-500 font-mono text-center">
              Última atividade: {user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString('pt-BR') : 'Hoje'}
            </div>
          </div>

          {/* Gamified Achievements Box */}
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-805">
              <h3 className="font-display font-bold text-lg text-slate-200">
                🏆 Conquistas Disponíveis
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {achievements.filter(a => a.isUnlocked).length} / {achievements.length} Completas
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {achievements.map((ach) => {
                const canClaim = ach.progressCurrent !== undefined && ach.progressMax !== undefined && (ach.progressCurrent >= ach.progressMax) && !ach.isUnlocked;
                
                return (
                  <div 
                    key={ach.id} 
                    className={`p-3 rounded-xl border transition-all ${
                      ach.isUnlocked 
                        ? 'bg-slate-900/30 border-emerald-500/20 opacity-75' 
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-display font-bold text-xs text-slate-250 flex items-center gap-1">
                          {ach.isUnlocked ? '✅ ' : '🔒 '}
                          {ach.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">{ach.description}</p>
                      </div>

                      {/* Currency badge */}
                      <div className="text-right whitespace-nowrap">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 font-bold border border-violet-500/20">
                          +{ach.xpReward} XP
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 block mt-1">
                          +{ach.coinReward} KC
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar (if applicable) */}
                    {ach.progressMax && ach.progressCurrent !== undefined && (
                      <div className="mt-2 pt-2 border-t border-slate-800/45 flex items-center justify-between gap-4">
                        <div className="flex-1 bg-slate-800 rounded-full h-1 relative overflow-hidden">
                          <div 
                            className="bg-violet-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (ach.progressCurrent / ach.progressMax) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {ach.progressCurrent}/{ach.progressMax}
                        </span>
                      </div>
                    )}

                    {/* Reward Claim Action Button */}
                    {!ach.isUnlocked && (
                      <div className="mt-2.5 flex justify-end">
                        <button
                          disabled={ach.progressCurrent !== undefined && ach.progressMax !== undefined && (ach.progressCurrent < ach.progressMax)}
                          onClick={() => claimAchievement(ach.id)}
                          className={`w-full py-1 rounded text-[10px] font-semibold text-center uppercase tracking-wider transition-all cursor-pointer ${
                            (ach.progressCurrent === undefined || (ach.progressCurrent >= (ach.progressMax || 1)))
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                              : 'bg-slate-850 text-slate-500 border border-slate-800/80 cursor-not-allowed'
                          }`}
                        >
                          {(ach.progressCurrent === undefined || (ach.progressCurrent >= (ach.progressMax || 1))) ? '🔄 RESGATAR PRÊMIO' : 'Em progresso'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
