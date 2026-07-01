import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Edit3, CheckCircle, MapPin, Scale, ShieldCheck, Activity } from 'lucide-react';
import { UserProfile } from '../../types';

const getToken = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
const authFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}`, ...(opts.headers || {}) } });

interface RegistryData {
  academy: string;
  category: string;
  guardsPreference: string;
  submitsPreference: string;
  gender: 'Masculino' | 'Feminino';
}

interface AthleteProfileProps {
  user: UserProfile;
  getWinRate: () => number;
}

const WEIGHT_MASC = [
  'Galo (-57,5kg)', 'Pluma (-64kg)', 'Pena (-70kg)', 'Leve (-76kg)',
  'Médio (-82,3kg)', 'Meio-Pesado (-88,3kg)', 'Pesado (-94,3kg)',
  'Super-Pesado (-100,5kg)', 'Pesadíssimo (+100,5kg)', 'Absoluto (Sem limite)'
];
const WEIGHT_FEM = [
  'Palha (-48,5kg)', 'Pluma (-53,5kg)', 'Pena (-58,5kg)', 'Leve (-63,5kg)',
  'Médio (-69kg)', 'Meio-Pesado (-74kg)', 'Pesado (-79,3kg)',
  'Super-Pesado (-100kg)', 'Pesadíssimo (+100kg)', 'Absoluto (Sem limite)'
];
const GUARD_OPTIONS = ['Guarda Fechada de Aço', 'Laço de Borracha', 'Guarda Aberta Dinâmica', 'Meia Guarda Profunda', 'Passador Pressão Brutal', 'Guarda Aranha Flexível'];
const SUBMIT_OPTIONS = ['Estrangulamento Cruzado', 'Armlock Voador', 'Mata-Leão Pelas Costas', 'Triângulo no Aperto', 'Chave de Pé Estilo Caipira', 'Mão de Vaca Oculta'];

export default function AthleteProfile({ user, getWinRate }: AthleteProfileProps) {
  const [registry, setRegistry] = useState<RegistryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<RegistryData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistry = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/athlete-registry');
      if (res.ok) {
        const data = await res.json();
        setRegistry(data.registry);
      } else {
        setError('Erro ao carregar dados do banco.');
      }
    } catch (e) {
      setError('Erro de conexão.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchRegistry(); }, []);

  const startEditing = () => {
    if (!registry) return;
    setEditForm({ ...registry });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    setError(null);
    try {
      const res = await authFetch('/api/athlete-registry', {
        method: 'PATCH',
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const data = await res.json();
        setRegistry(data.registry);
        setIsEditing(false);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Erro ao salvar no banco de dados.');
      }
    } catch (e) {
      setError('Erro de conexão ao salvar.');
    }
    setSaving(false);
  };

  const activeGender = isEditing && editForm ? editForm.gender : (registry?.gender || 'Masculino');
  const weightCategories = activeGender === 'Feminino' ? WEIGHT_FEM : WEIGHT_MASC;

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
            else startEditing();
          }}
          disabled={loading || saving}
          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer font-sans disabled:opacity-50"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
          {saving ? 'Salvando...' : isEditing ? 'Salvar Perfil' : 'Editar Atributos'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-xs text-rose-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-xs text-zinc-500 font-mono">Carregando dados do banco...</div>
      ) : isEditing && editForm ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-zinc-500 font-mono text-[10px] uppercase">Academia</label>
            <input
              type="text"
              value={editForm.academy}
              onChange={(e) => setEditForm({ ...editForm, academy: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-500 font-mono text-[10px] uppercase">Gênero</label>
            <select
              value={editForm.gender}
              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as 'Masculino' | 'Feminino', category: '' })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-xs cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-zinc-500 font-mono text-[10px] uppercase">
              Categoria de Peso — {editForm.gender === 'Feminino' ? 'Feminino IBJJF' : 'Masculino IBJJF'}
            </label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-xs cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Selecione...</option>
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
              {GUARD_OPTIONS.map((grd) => (
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
              {SUBMIT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
      ) : registry ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80">
              <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Academia</span>
              </div>
              <p className="text-xs font-semibold text-zinc-200 truncate">{registry.academy || 'Não informado'}</p>
            </div>
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80">
              <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Gênero</span>
              </div>
              <p className="text-xs font-semibold text-zinc-200 truncate">{registry.gender === 'Feminino' ? '♀ Feminino' : '♂ Masculino'}</p>
            </div>
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80">
              <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase mb-1">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Divisão Peso</span>
              </div>
              <p className="text-xs font-semibold text-zinc-200 truncate">{registry.category || 'Não Informado'}</p>
            </div>
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80">
              <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span>Sistema Guarda</span>
              </div>
              <p className="text-xs font-semibold text-zinc-200 truncate">{registry.guardsPreference || 'Não Informado'}</p>
            </div>
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80">
              <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase mb-1">
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                <span>Sub Assinatura</span>
              </div>
              <p className="text-xs font-semibold text-zinc-200 truncate">{registry.submitsPreference || 'Não Informado'}</p>
            </div>
          </div>
        </>
      ) : null}

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-900">
        <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80 text-center">
          <p className="text-zinc-500 font-mono text-[9px] uppercase mb-1">PvP Arena ELO</p>
          <p className="text-blue-400 font-black text-lg">{user.elo} <span className="text-[9px] text-zinc-500 font-normal">pts</span></p>
        </div>
        <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80 text-center">
          <p className="text-zinc-500 font-mono text-[9px] uppercase mb-1">Sparring W / L</p>
          <p className="font-black text-lg"><span className="text-emerald-400">{user.winCount}</span> <span className="text-zinc-600">/</span> <span className="text-rose-400">{user.lossCount}</span></p>
        </div>
        <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80 text-center">
          <p className="text-zinc-500 font-mono text-[9px] uppercase mb-1">Taxa de Vitória</p>
          <p className="text-amber-400 font-black text-lg">{getWinRate()}%</p>
        </div>
      </div>
    </motion.div>
  );
}
