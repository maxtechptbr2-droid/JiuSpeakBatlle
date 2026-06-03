/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  RefreshCcw, 
  User as UserIcon, 
  Sliders 
} from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function Users() {
  const {
    user,
    registeredUsers,
    isLoading,
    userSearchText,
    setUserSearchText,
    userFilterBelt,
    setUserFilterBelt,
    editingUser,
    setEditingUser,
    fetchUsers,
    handleChangeRole,
    handleApproveUser,
    handleUpdateUsersProfile,
    handleUpdateUserScores
  } = useAdmin();

  const filteredUsers = registeredUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchText.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearchText.toLowerCase());
    const matchesBelt = userFilterBelt === 'ALL' || u.belt === userFilterBelt;
    return matchesSearch && matchesBelt;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn" id="admin-users-root">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-sm text-slate-200">Fichas Cadastrais de Lutadores</h3>
          <p className="text-[10px] font-sans text-slate-500">Editores de XP, ELO Arena, Kimono Coins, Stripes de faixa e cargária.</p>
        </div>

        <button 
          type="button"
          onClick={fetchUsers}
          disabled={isLoading.users}
          className="p-2 px-4 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white transition-all font-mono flex items-center gap-2 cursor-pointer"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isLoading.users ? 'animate-spin' : ''}`} /> Sincronizar DB
        </button>
      </div>

      {/* Filtering bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Filtrar por nome ou e-mail..."
            value={userSearchText}
            onChange={(e) => setUserSearchText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 pl-9 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-mono"
          />
        </div>

        <select
          value={userFilterBelt}
          onChange={(e) => setUserFilterBelt(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl p-2 px-3 text-xs text-slate-300 focus:outline-none cursor-pointer font-mono"
        >
          <option value="ALL">Todas Faixas</option>
          <option value="Branca">Branca</option>
          <option value="Azul">Azul</option>
          <option value="Roxa">Roxa</option>
          <option value="Marrom">Marrom</option>
          <option value="Preto">Preto</option>
        </select>
      </div>

      {isLoading.users ? (
        <div className="py-20 text-center text-slate-500 text-xs font-mono animate-pulse">
          Conectando PostgreSQL / prisma client...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">Atleta / Cadastro</th>
                <th className="py-2.5 px-3">Conexão Postal</th>
                <th className="py-2.5 px-3">Nível & Faixa</th>
                <th className="py-2.5 px-3">Cargo Real</th>
                <th className="py-2.5 px-3">Patrimônio</th>
                <th className="py-2.5 px-3 text-right">Diretoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">Nenhum atleta filtrado nas especificações.</td>
                </tr>
              ) : (
                filteredUsers.map((regUser) => (
                  <tr key={regUser.id} className="hover:bg-slate-950/40 text-slate-300">
                    <td className="py-3 px-3 font-semibold text-white">
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{regUser.name}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{regUser.email}</td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <p className="text-slate-300 font-bold">LVL {regUser.level || 1} <span className="font-normal text-slate-500">({regUser.elo || 1000} ELO)</span></p>
                        <span className="p-0.5 px-1.5 rounded bg-slate-950 border border-slate-800 text-[9px] uppercase font-bold text-slate-200">
                          {regUser.belt || 'Branca'} ({regUser.stripes || 0} G)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          regUser.role === 'ADMIN' 
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' 
                            : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {regUser.role}
                        </span>
                        {regUser.role === 'ADMIN' && regUser.isAdminApproved === false && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20">
                            PENDENTE APROVAÇÃO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs">
                      <div className="space-y-0.5 font-mono text-[10.5px]">
                        <p className="text-yellow-500 font-semibold">{regUser.coins || 0} KC</p>
                        <p className="text-emerald-400 font-medium">R$ {(regUser.balanceBRL || 0).toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      {regUser.role === 'ADMIN' && regUser.isAdminApproved === false && (
                        <button
                          type="button"
                          onClick={() => handleApproveUser(regUser.id)}
                          className="p-1 px-2.5 bg-emerald-650 hover:bg-emerald-600 text-[10px] text-white font-bold rounded border border-emerald-500 cursor-pointer transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          Liberar Acesso
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => setEditingUser(regUser)}
                        className="p-1 px-2.5 bg-slate-800 hover:bg-slate-750 text-[10px] text-white hover:text-indigo-300 rounded border border-slate-700 cursor-pointer transition-all"
                      >
                        Editar Ficha
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleChangeRole(regUser.id, regUser.role)}
                        disabled={regUser.id === user.id}
                        className="p-1 px-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-950 text-[10px] text-slate-400 hover:text-white rounded border border-slate-800 cursor-pointer transition-all"
                      >
                        Cargo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateUserScores(regUser.id, regUser.elo || 1000)}
                        className="p-1 px-2.5 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 hover:text-amber-300 border border-amber-900/40 rounded text-[10px] cursor-pointer transition-all"
                      >
                        Ajustar ELO
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL WINDOW: EDIT USER RECORD */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp shadow-2xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-display font-extrabold text-sm text-slate-200 tracking-wide flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Parametrizar Ficha de Atleta: {editingUser.name}</span>
              </h4>
              <button 
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white font-bold font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUsersProfile} className="space-y-3 text-xs text-slate-300 font-mono">
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block">Nome cadastrado:</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block">Correio eletrônico (E-mail):</label>
                <input 
                  type="email" 
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Faixas BJJ:</label>
                  <select 
                    value={editingUser.belt}
                    onChange={(e) => setEditingUser({ ...editingUser, belt: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="Branca">Branca</option>
                    <option value="Azul">Azul</option>
                    <option value="Roxa">Roxa</option>
                    <option value="Marrom">Marrom</option>
                    <option value="Preto">Preto</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Graus (Stripes):</label>
                  <select 
                    value={editingUser.stripes || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, stripes: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none cursor-pointer font-mono"
                  >
                    {[0, 1, 2, 3, 4].map(g => (
                      <option key={g} value={g}>{g} Graus</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Nível (Rank):</label>
                  <input 
                    type="number" 
                    value={editingUser.level}
                    min="1"
                    onChange={(e) => setEditingUser({ ...editingUser, level: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Arena ELO Rating:</label>
                  <input 
                    type="number" 
                    value={editingUser.elo}
                    min="1"
                    onChange={(e) => setEditingUser({ ...editingUser, elo: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Saldo de Moedas (KC):</label>
                  <input 
                    type="number" 
                    value={editingUser.coins}
                    min="0"
                    onChange={(e) => setEditingUser({ ...editingUser, coins: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Saldo Monetário (BRL):</label>
                  <input 
                    type="text" 
                    value={editingUser.balanceBRL || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, balanceBRL: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer text-center font-bold"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-all cursor-pointer text-center"
                >
                  Regravar Lutador
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
