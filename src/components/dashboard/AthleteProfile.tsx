import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Edit3, CheckCircle, MapPin, Scale, ShieldCheck, Activity } from 'lucide-react';
import { UserProfile } from '../../types';

interface AthleteProfileProps {
  user: UserProfile;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  editForm: {
    name: string;
    academy: string;
    category: string;
    guardsPreference: string;
    submitsPreference: string;
    gender: 'Masculino' | 'Feminino';
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    name: string;
    academy: string;
    category: string;
    guardsPreference: string;
    submitsPreference: string;
    gender: 'Masculino' | 'Feminino';
  }>>;
  handleSave: () => void;
  getWinRate: () => number;
  weightCategories: string[];
  guardPreferences: string[];
  submissionPreferences: string[];
}

export default function AthleteProfile({
  user,
  isEditing,
  setIsEditing,
  editForm,
  setEditForm,
  handleSave,
  getWinRate,
  weightCategories,
  guardPreferences,
  submissionPreferences
}: AthleteProfileProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="bg-[#0b101f]/70 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-xl relative"
      id="athlete-registry-card"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex justify-between items-center mb-5 pb-3 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <div>
            <h4 className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight font-sans">Athletic Registry</h4>
            <p className="text-[10px] text-zinc-500 font-mono">UFC & COMBAT ATLETAS REGISTRY</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer font-sans"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
          {isEditing ? 'Salvar Perfil' : 'Editar Atributos'}
        </button>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-zinc-500 font-mono text-[10px] uppercase">Apelido de Combate</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-500 font-mono text-[10px] uppercase">QG / Escola / Academia</label>
            <input
              type="text"
              value={editForm.academy}
              onChange={(e) => setEditForm({ ...editForm, academy: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-500 font-mono text-[10px] uppercase">Gênero (IBJJF)</label>
            <select
              value={editForm.gender}
              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as 'Masculino' | 'Feminino', category: '' })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-xs cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Masculino">♂ Masculino</option>
              <option value="Feminino">♀ Feminino</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-zinc-500 font-mono text-[10px] uppercase">
              Categoria de Peso — {editForm.gender === 'Feminino' ? 'Feminino IBJJF' : 'Masculino IBJJF'}
            </label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-xs cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {weightCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-zinc-500 font-mono text-[10px] uppercase">Guarda / Passing Assinatura</label>
            <select
              value={editForm.guardsPreference}
              onChange={(e) => setEditForm({ ...editForm, guardsPreference: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-xs cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {guardPreferences.map((grd) => (
                <option key={grd} value={grd}>{grd}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-zinc-500 font-mono text-[10px] uppercase">Finalização Principal</label>
            <select
              value={editForm.submitsPreference}
              onChange={(e) => setEditForm({ ...editForm, submitsPreference: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-xs cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {submissionPreferences.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Academy card detail */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80">
            <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase mb-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Academia</span>
            </div>
            <p className="text-xs font-semibold text-zinc-200 truncate">{user.academy || 'Gracie Barra'}</p>
          </div>

          {/* Gender */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80">
            <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase mb-1">
              <Scale className="w-3.5 h-3.5 text-pink-400" />
              <span>Gênero</span>
            </div>
            <p className="text-xs font-semibold text-zinc-200 truncate">
              {user.gender === 'Feminino' ? '♀ Feminino' : '♂ Masculino'}
            </p>
          </div>
          {/* Weight category preferred */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80">
            <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase mb-1">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>Divisão Peso</span>
            </div>
            <p className="text-xs font-semibold text-zinc-200 truncate">{user.category || 'Não Informado'}</p>
          </div>

          {/* Guard Specialty */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80">
            <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              <span>Sistema Guarda</span>
            </div>
            <p className="text-xs font-semibold text-zinc-200 truncate">{user.guardsPreference || 'Guarda Fechada'}</p>
          </div>

          {/* Ultimate finish */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80">
            <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase mb-1">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <span>Sub Assinatura</span>
            </div>
            <p className="text-xs font-semibold text-zinc-200 truncate">{user.submitsPreference || 'Mata Leão'}</p>
          </div>

        </div>
      )}

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-3 gap-3.5 mt-5 pt-4.5 border-t border-zinc-900/60 text-center font-sans">
        <div className="bg-[#121a2e]/30 dark:bg-[#0c1223]/50 p-3 rounded-xl border border-blue-500/10">
          <span className="block text-[9.5px] text-zinc-500 font-mono uppercase tracking-wider">PVP Arena ELO</span>
          <span className="text-xl font-black text-blue-400 tracking-tight font-mono">{user.elo} <span className="text-[10px] text-zinc-500 font-normal">pts</span></span>
        </div>
        <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-900">
          <span className="block text-[9.5px] text-zinc-500 font-mono uppercase tracking-wider font-semibold">Sparring W / L</span>
          <span className="text-xl font-black text-zinc-200 tracking-tight font-mono">
            <span className="text-emerald-500">{user.winCount}</span>
            <span className="text-zinc-650 mx-0.5">/</span>
            <span className="text-rose-500">{user.lossCount}</span>
          </span>
        </div>
        <div className="bg-zinc-950/50 p-3 rounded-xl border border-[#fee2e2]/5 border-zinc-900">
          <span className="block text-[9.5px] text-zinc-500 font-mono uppercase tracking-wider">Taxa de Vitória</span>
          <span className="text-xl font-black text-amber-500 tracking-tight font-mono">{getWinRate()}%</span>
        </div>
      </div>
    </motion.div>
  );
}
