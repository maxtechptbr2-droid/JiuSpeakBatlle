/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  RefreshCcw, 
  User as UserIcon, 
  Sliders, 
  Shield, 
  ShieldAlert, 
  Trash2, 
  Key, 
  Plus, 
  Download, 
  FileText, 
  Calendar, 
  Wallet, 
  Trophy, 
  Swords, 
  Ban, 
  CheckCircle,
  Clock,
  Terminal,
  Activity,
  Award,
  ChevronRight
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
    handleUpdateUserScores,
    handleCreateUser,
    handleDeleteUser,
    handleResetPassword,
    fetchAdvancedInfo,
    showToast
  } = useAdmin();

  // ERP Screen States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ATHLETE',
    belt: 'WHITE'
  });

  const [resetPassUserId, setResetPassUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [activeAuditUser, setActiveAuditUser] = useState<any | null>(null);
  const [advancedInfo, setAdvancedInfo] = useState<any | null>(null);
  const [loadingAdvanced, setLoadingAdvanced] = useState(false);

  // Filters mapping
  const filteredUsers = registeredUsers.filter(u => {
    const sTerm = userSearchText.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(sTerm);
    const emailMatch = u.email?.toLowerCase().includes(sTerm);
    const matchesSearch = nameMatch || emailMatch;

    const matchesBelt = userFilterBelt === 'ALL' || u.belt === userFilterBelt;
    return matchesSearch && matchesBelt;
  });

  // Action: Create User
  const onCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      showToast("Por favor preencha todos os campos obrigatórios.", "error");
      return;
    }
    const success = await handleCreateUser(newUserData);
    if (success) {
      setIsCreateOpen(false);
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'ATHLETE',
        belt: 'WHITE'
      });
    }
  };

  // Action: Delete User with double check safety
  const onDeleteUserClick = async (userId: string, userName: string) => {
    if (userId === user.id) {
      showToast("Não é possível excluir seu próprio login ativo.", "error");
      return;
    }
    const confirm1 = window.confirm(`ATENÇÃO CRÍTICA!\nVocê está prestes a excluir permanentemente o lutador "${userName}". Tem certeza?`);
    if (!confirm1) return;
    const confirm2 = window.confirm(`CONFIRMAÇÃO EXECUTIVA FINAL:\nEscreva "SIM" para homologar a remoção permanente de "${userName}" do banco de dados JiuSpeak.`);
    if (confirm2) {
      await handleDeleteUser(userId);
    }
  };

  // Action: Reset User Password
  const onResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUserId || !newPassword) return;
    await handleResetPassword(resetPassUserId, newPassword);
    setResetPassUserId(null);
    setNewPassword('');
  };

  // Action: Load and Open advanced user analysis (Raio-X Audit)
  const openAdvancedAuditLog = async (regUser: any) => {
    setActiveAuditUser(regUser);
    setLoadingAdvanced(true);
    const info = await fetchAdvancedInfo(regUser.id);
    if (info) {
      setAdvancedInfo(info);
    } else {
      showToast("Falha ao ler dados analíticos de banco de dados do lutador.", "error");
    }
    setLoadingAdvanced(false);
  };

  // Action: Export CSV File
  const exportToCSV = () => {
    if (filteredUsers.length === 0) return showToast("Sem registros para exportação.", "info");
    
    let csvContent = "data:text/csv;charset=utf-8,";
    // Header row
    csvContent += "ID,Nome,Email,Cargo,Faixa,Graus,Nivel,XP,ELO,Moedas KC,Saldo BRL,Suspenso,Banido\n";
    
    filteredUsers.forEach(u => {
      csvContent += `"${u.id}","${u.name}","${u.email}","${u.role}","${u.belt}",${u.stripes || 0},${u.level || 1},${u.xp || 0},${u.elo || 1000},${u.coins || 0},${(u.balanceBRL || 0).toFixed(2)},${u.isSuspended ? "Sim" : "Não"},${u.isBanned ? "Sim" : "Não"}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jiuspeak-atletas-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Planilha CSV baixada com sucesso!", "success");
  };

  // Action: Export Excel File
  const exportToExcel = () => {
    if (filteredUsers.length === 0) return showToast("Sem registros para exportação.", "info");

    let tableHtml = "<table><thead><tr>";
    tableHtml += "<th>ID</th><th>Nome</th><th>Email</th><th>Cargo</th><th>Faixa</th><th>Graus</th><th>Nivel</th><th>XP</th><th>ELO</th><th>Moedas (KC)</th><th>Saldo (BRL)</th><th>Suspenso</th><th>Banido</th>";
    tableHtml += "</tr></thead><tbody>";

    filteredUsers.forEach(u => {
      tableHtml += `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.belt}</td><td>${u.stripes || 0}</td><td>${u.level || 1}</td><td>${u.xp || 0}</td><td>${u.elo || 1000}</td><td>${u.coins || 0}</td><td>${(u.balanceBRL || 0).toFixed(2)}</td><td>${u.isSuspended ? "Sim" : "Não"}</td><td>${u.isBanned ? "Sim" : "Não"}</td></tr>`;
    });

    tableHtml += "</tbody></table>";

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `jiuspeak-atletas-${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Planilha XLS gerada e exportada!", "success");
  };

  // Action: Print & Export PDF Layout
  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Permissão de bloqueio de popups ativa. Libere popups para gerar PDF.", "error");
      return;
    }

    const rowsJson = filteredUsers.map((u, idx) => `
      <tr style="border-bottom: 1px solid #ddd; font-family: monospace; font-size: 11px;">
        <td style="padding: 8px;">${idx + 1}</td>
        <td style="padding: 8px; font-weight: bold;">${u.name}</td>
        <td style="padding: 8px;">${u.email}</td>
        <td style="padding: 8px; text-transform: uppercase;">${u.role}</td>
        <td style="padding: 8px;">${u.belt} (${u.stripes || 0} G)</td>
        <td style="padding: 8px;">Lvl ${u.level || 1}</td>
        <td style="padding: 8px;">${u.elo || 1000} Rating</td>
        <td style="padding: 8px;">${u.coins || 0} KC</td>
        <td style="padding: 8px; font-weight: bold; color:green;">R$ ${(u.balanceBRL || 0).toFixed(2)}</td>
        <td style="padding: 8px;">${u.isSuspended ? 'SUSPENSO' : u.isBanned ? 'BANIDO' : 'ATIVO'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>JiuSpeak - Ficha Consolidada de Atletas ERP</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 20px; margin-bottom: 5px; }
            p { font-size: 11px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { border-bottom: 2px solid #333; padding: 8px; font-size: 12px; text-align: left; background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>JIUSPEAK CORPORATE - RELATÓRIO DE ATLETAS CADASTRADOS</h1>
          <p>Emitido em: ${new Date().toLocaleString()} | Total Filtrados: ${filteredUsers.length} atletas registrados</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Atleta</th>
                <th>E-mail</th>
                <th>Função</th>
                <th>Graduação</th>
                <th>Nível</th>
                <th>ELO</th>
                <th>Coins (KC)</th>
                <th>Disponível</th>
                <th>Estatuto</th>
              </tr>
            </thead>
            <tbody>
              ${rowsJson}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast("PDF gerado no painel de impressão nativo!", "success");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn" id="admin-users-root">
      
      {/* Upper header action list */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-sm text-slate-200">Fichas Cadastrais de Atletas</h3>
          <p className="text-[10px] font-sans text-slate-500">Mapeamento granular de lutadores, financeiro e controle síncronos com Postgres.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="p-2 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl border border-indigo-500 text-xs text-white font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Matricular Atleta
          </button>

          <button 
            type="button"
            onClick={fetchUsers}
            disabled={isLoading.users}
            className="p-2 px-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white transition-all font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isLoading.users ? 'animate-spin' : ''}`} /> Sincronizar DB
          </button>
        </div>
      </div>

      {/* Filtering and search row */}
      <div className="flex flex-col md:flex-row gap-3">
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

        <div className="flex items-center gap-2">
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

          {/* Export suite buttons card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
            <button
              type="button"
              onClick={exportToCSV}
              className="p-1 px-2 hover:bg-slate-800 rounded text-[10px] uppercase font-bold text-slate-400 hover:text-white cursor-pointer flex items-center gap-1 transition-colors"
              title="Exportar CSV"
            >
              <Download className="w-3 h-3 text-indigo-400" /> CSV
            </button>
            <button
              type="button"
              onClick={exportToExcel}
              className="p-1 px-2 hover:bg-slate-800 rounded text-[10px] uppercase font-bold text-slate-400 hover:text-white cursor-pointer flex items-center gap-1 transition-colors"
              title="Exportar Excel"
            >
              <Download className="w-3 h-3 text-emerald-400" /> XLS
            </button>
            <button
              type="button"
              onClick={exportToPDF}
              className="p-1 px-2 hover:bg-slate-800 rounded text-[10px] uppercase font-bold text-slate-400 hover:text-white cursor-pointer flex items-center gap-1 transition-colors"
              title="Gerar Relatório Analítico (PDF)"
            >
              <FileText className="w-3 h-3 text-rose-500" /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main registered users database overview layout */}
      {isLoading.users ? (
        <div className="py-20 text-center text-slate-500 text-xs font-mono animate-pulse">
          Sincronizando registros estruturados do GraphQL / Prisma Client...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">Cadastro do Atleta</th>
                <th className="py-2.5 px-3">E-mail Postal</th>
                <th className="py-2.5 px-3">Faixa & Atributos</th>
                <th className="py-2.5 px-3">Cargaria</th>
                <th className="py-2.5 px-3">Estatuto</th>
                <th className="py-2.5 px-3">Patrimônio</th>
                <th className="py-2.5 px-3 text-right">Diretoria Operacional Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">Nenhum atleta mapeado com estes critérios de busca.</td>
                </tr>
              ) : (
                filteredUsers.map((regUser) => (
                  <tr key={regUser.id} className="hover:bg-slate-950/40 text-slate-300 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-sans font-semibold text-white flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{regUser.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{regUser.email}</td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <p className="text-slate-200">LVL {regUser.level || 1} <span className="font-normal text-slate-500">({regUser.elo || 1000} ELO)</span></p>
                        <span className="p-0.5 px-1.5 rounded bg-slate-950 border border-slate-800 text-[9px] uppercase font-bold text-slate-200 inline-block">
                          {regUser.belt || 'Branca'} ({regUser.stripes || 0}º Grau)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          regUser.role === 'ADMIN' 
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' 
                            : regUser.role === 'INSTRUCTOR'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
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
                    <td className="py-3 px-3">
                      {regUser.isBanned ? (
                        <span className="p-1 px-2 rounded bg-rose-500/10 border border-rose-500/25 text-rose-400 font-extrabold uppercase text-[9px]">BANIDO</span>
                      ) : regUser.isSuspended ? (
                        <span className="p-1 px-2 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 font-extrabold uppercase text-[9px]">SUSPENSO</span>
                      ) : (
                        <span className="p-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-extrabold uppercase text-[9px]">ATIVO</span>
                      )}
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
                          className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-[10px] text-white font-bold rounded border border-emerald-500 cursor-pointer transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          Liberar
                        </button>
                      )}
                      
                      {/* Advanced analytical inspect button */}
                      <button
                        type="button"
                        onClick={() => openAdvancedAuditLog(regUser)}
                        className="p-1 px-2 bg-indigo-500/10 hover:bg-indigo-600 text-[10px] text-indigo-400 hover:text-white rounded border border-indigo-500/20 cursor-pointer transition-all"
                        title="Ver raio-X, auditoria de IPs, dispositivos e histórico"
                      >
                        Raio-X Audit
                      </button>

                      <button 
                        type="button"
                        onClick={() => setEditingUser(regUser)}
                        className="p-1 px-2 bg-slate-800 hover:bg-slate-755 text-[10px] text-white hover:text-indigo-300 rounded border border-slate-700 cursor-pointer transition-all"
                      >
                        Editar
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          setResetPassUserId(regUser.id);
                          setNewPassword('');
                        }}
                        className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 hover:text-white rounded border border-slate-750 cursor-pointer transition-all"
                        title="Resetar Senha"
                      >
                        <Key className="w-3 h-3" />
                      </button>

                      <button 
                        type="button"
                        onClick={() => onDeleteUserClick(regUser.id, regUser.name)}
                        disabled={regUser.id === user.id}
                        className="p-1 px-2 bg-rose-950/20 hover:bg-rose-900 border border-rose-950/30 disabled:opacity-30 disabled:hover:bg-transparent text-[10px] text-rose-450 hover:text-white rounded cursor-pointer transition-all"
                        title="Excluir Atleta Permanentemente"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL WINDOW: MATRICULAR NEW ATHLETE */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-display font-bold text-sm text-slate-200 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span>Matricular Novo Atleta na Academia</span>
              </h4>
              <button 
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white font-bold font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onCreateUserSubmit} className="space-y-3 text-xs text-slate-300 font-mono">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block">Nome Completo:</label>
                <input 
                  type="text" 
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Nome do atleta..."
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block">E-mail Postal:</label>
                <input 
                  type="email" 
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="exemplo@jiuspeak.com.br"
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block">Senha Inicial de Acesso:</label>
                <input 
                  type="password" 
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Mínimo de 4 dígitos..."
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Faixa Inicial:</label>
                  <select 
                    value={newUserData.belt}
                    onChange={(e) => setNewUserData({ ...newUserData, belt: e.target.value })}
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
                  <label className="text-[10px] text-slate-500 uppercase block">Cargo Corporativo:</label>
                  <select 
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="ATHLETE">ATHLETE (Atleta)</option>
                    <option value="INSTRUCTOR">INSTRUCTOR (Instrutor)</option>
                    <option value="ADMIN">ADMIN (Administrador)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer text-center font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all cursor-pointer text-center shadow-lg"
                >
                  Confirmar Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW: COMPREHENSIVE PARAMETRIZE PROFILE (EDIT USER) */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp shadow-2xl relative">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-display font-extrabold text-sm text-slate-200 tracking-wide flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Parametrizar de Atleta: {editingUser.name}</span>
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
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Nome Completo:</label>
                  <input 
                    type="text" 
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">E-mail Postal:</label>
                  <input 
                    type="email" 
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Função / Cargo:</label>
                  <select 
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="ATHLETE">ATHLETE (Atleta)</option>
                    <option value="INSTRUCTOR">INSTRUCTOR (Instrutor)</option>
                    <option value="ADMIN">ADMIN (Administrador)</option>
                  </select>
                </div>

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
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
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

                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Nível (Rank):</label>
                  <input 
                    type="number" 
                    value={editingUser.level}
                    min="1"
                    onChange={(e) => setEditingUser({ ...editingUser, level: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Atleta XP:</label>
                  <input 
                    type="number" 
                    value={editingUser.xp || 0}
                    min="0"
                    onChange={(e) => setEditingUser({ ...editingUser, xp: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] text-slate-500 uppercase block">ELO Rating:</label>
                  <input 
                    type="number" 
                    value={editingUser.elo}
                    min="1"
                    onChange={(e) => setEditingUser({ ...editingUser, elo: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Coins (KC):</label>
                  <input 
                    type="number" 
                    value={editingUser.coins}
                    min="0"
                    onChange={(e) => setEditingUser({ ...editingUser, coins: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Monetário BRL:</label>
                  <input 
                    type="text" 
                    value={editingUser.balanceBRL || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, balanceBRL: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* LOCK LAWS AND STATUTES: BANS & SUSPENSIONS */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850/80 space-y-2 mt-2">
                <p className="text-[10px] uppercase text-indigo-400 font-bold block tracking-wider">Conducta & Bloqueos de Segurança</p>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-200">Suspender de Atleta</span>
                    <span className="text-[9px] text-slate-500 block">Impede login temporariamente em caso de faltas leves</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={!!editingUser.isSuspended}
                    onChange={(e) => setEditingUser({ ...editingUser, isSuspended: e.target.checked })}
                    className="w-4 h-4 text-amber-500 bg-slate-900 border border-slate-800 rounded cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-850">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-200">Banir Permanentemente</span>
                    <span className="text-[9px] text-slate-500 block">Exclui o acesso de forma peremptória do ecossistema</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={!!editingUser.isBanned}
                    onChange={(e) => setEditingUser({ ...editingUser, isBanned: e.target.checked })}
                    className="w-4 h-4 text-rose-500 bg-slate-900 border border-slate-800 rounded cursor-pointer accent-rose-600"
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
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all cursor-pointer text-center"
                >
                  Regravar Ficha
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW: QUICK PASSWORD RESET */}
      {resetPassUserId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-display font-bold text-sm text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>Definir Senha de Acesso síncrona</span>
              </h4>
              <button 
                type="button"
                onClick={() => setResetPassUserId(null)}
                className="text-slate-400 hover:text-white font-bold font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onResetPasswordSubmit} className="space-y-4 text-xs text-slate-300 font-mono">
              <p className="text-[10px] text-slate-500 leading-normal">
                Esta ação altera instantaneamente o código MD5/Bcrypt do usuário no PostgreSQL, descartando sessões ativas correlatas.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block">Escreva a Nova Senha:</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres..."
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setResetPassUserId(null)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer text-center font-semibold"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-all cursor-pointer text-center"
                >
                  Homologar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW: GRAND ATLAS RAIO-X AUDIT ANALYSIS */}
      {activeAuditUser && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 animate-scaleUp shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-sm text-slate-200 tracking-wide flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <span>Raio-X Administrativo / Auditoria Granular: {activeAuditUser.name}</span>
                </h4>
                <p className="text-[9.5px] font-sans text-indigo-400">ID Único Prisma: <span className="text-slate-400 font-mono">{activeAuditUser.id}</span></p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setActiveAuditUser(null);
                  setAdvancedInfo(null);
                }}
                className="text-slate-400 hover:text-white font-bold font-mono text-xl cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {loadingAdvanced ? (
              <div className="py-24 text-center text-slate-500 text-xs font-mono animate-pulse flex flex-col items-center justify-center gap-3">
                <RefreshCcw className="w-6 h-6 animate-spin text-indigo-400" />
                <span>Escaneando logs, IPs, refresh tokens e histórico de combate no Postgres...</span>
              </div>
            ) : advancedInfo ? (
              <div className="space-y-5 text-xs font-mono text-slate-300">
                
                {/* Atletas general attributes panel widget */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 uppercase">Graduação</p>
                    <p className="font-bold text-slate-200 text-xs">{advancedInfo.user.belt || 'Branca'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 uppercase">ELO Rating / Nivel</p>
                    <p className="font-bold text-indigo-400 text-xs">{advancedInfo.user.elo || 1000} ELO / Lvl {advancedInfo.user.level || 1}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 uppercase">Kimono Coins</p>
                    <p className="font-bold text-yellow-500 text-xs">{advancedInfo.user.coins || 0} KC</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 uppercase">Estatuto Geral</p>
                    <p className="font-bold text-emerald-400 text-xs">
                      {advancedInfo.user.isBanned ? 'BANIDO' : advancedInfo.user.isSuspended ? 'SUSPENSO' : 'ATIVO'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left subcolumn: Active Sessions, Devices & IPs */}
                  <div className="space-y-3">
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span>Dispositivos & IPs de Entrada (Sessões Ativas)</span>
                      </h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {advancedInfo.tokens && advancedInfo.tokens.length > 0 ? (
                          advancedInfo.tokens.map((token: any) => (
                            <div key={token.id} className="p-2 rounded bg-slate-900 border border-slate-850 text-[10px] space-y-1">
                              <div className="flex justify-between text-[9.5px]">
                                <span className="font-bold text-indigo-400">{token.ipAddress || '127.0.0.1'}</span>
                                <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(token.issuedAt).toLocaleString()}</span>
                              </div>
                              <p className="text-slate-400 font-sans text-[9px] truncate" title={token.userAgent}>Browser Agent: {token.userAgent || 'Desconhecido'}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 text-center py-6">Nenhuma sessão síncrona aberta no banco.</p>
                        )}
                      </div>
                    </div>

                    {/* Historical logins tracking */}
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>Histórico de Tentativas de Login (IP Logins)</span>
                      </h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {advancedInfo.logins && advancedInfo.logins.length > 0 ? (
                          advancedInfo.logins.map((lg: any, idx: number) => (
                            <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-850 text-[9.5px] flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-350">IP: {lg.ipAddress || 'Sem IP'}</p>
                                <p className="text-[8.5px] text-slate-500">{new Date(lg.timestamp).toLocaleString()}</p>
                              </div>
                              <span className={`p-0.5 px-2 rounded text-[8px] font-bold ${
                                lg.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {lg.success ? "SUCESSO" : "REJEITADO"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 text-center py-6">Nenhum log cadastral de login.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right subcolumn: Combat/PVP history and Financial ledger */}
                  <div className="space-y-3">
                    {/* Combat Arena activity logs */}
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                        <Swords className="w-4 h-4 text-rose-500" />
                        <span>Histórico de PVP na Arena de Combates</span>
                      </h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {advancedInfo.pvpHistory && advancedInfo.pvpHistory.length > 0 ? (
                          advancedInfo.pvpHistory.map((pvp: any) => {
                            const isChallenger = pvp.challengerId === activeAuditUser.id;
                            const opponent = isChallenger ? pvp.defender?.name : pvp.challenger?.name;
                            const didWin = pvp.winnerId === activeAuditUser.id;
                            return (
                              <div key={pvp.id} className="p-2 rounded bg-slate-900 border border-slate-850 text-[9.5px] space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-200">vs {opponent || 'Oponente'}</span>
                                  <span className={`px-1 rounded text-[8px] font-extrabold ${didWin ? 'bg-emerald-505/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {didWin ? "VITORIA" : "DERROTA"}
                                  </span>
                                </div>
                                <div className="text-[8.5px] text-slate-500 flex justify-between">
                                  <span>Placagem: {pvp.challengerScore || 0} x {pvp.defenderScore || 0}</span>
                                  <span>{new Date(pvp.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[10px] text-slate-500 text-center py-6">Inexistência de lutas e duelos registrados.</p>
                        )}
                      </div>
                    </div>

                    {/* Financial Ledger transactions */}
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-400 animate-bounce" />
                        <span>Razão Analítico de Contas & Transações</span>
                      </h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {advancedInfo.transactions && advancedInfo.transactions.length > 0 ? (
                          advancedInfo.transactions.map((tx: any) => (
                            <div key={tx.id} className="p-2 rounded bg-slate-900 border border-slate-850 text-[9.5px] space-y-0.5">
                              <div className="flex justify-between">
                                <span className="font-bold text-slate-250 truncate block max-w-[200px]">{tx.notes || tx.type}</span>
                                <span className={`font-bold ${tx.amountBRL > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>R$ {tx.amountBRL.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-[8px] text-slate-500">
                                <span>Saldo KC: {tx.amountKC || 0} KC</span>
                                <span>{new Date(tx.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 text-center py-6">Sem transações financeiras arquivadas.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit log for full traceability */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                  <h5 className="text-[10px] uppercase font-bold text-slate-300 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-slate-400" />
                    <span>Rastro Síncrono de Atividades & Auditoria Básica</span>
                  </h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {advancedInfo.auditLogs && advancedInfo.auditLogs.length > 0 ? (
                      advancedInfo.auditLogs.map((log: any) => (
                        <div key={log.id} className="p-2 rounded bg-slate-900 border border-slate-850 text-[9.5px] space-y-1 text-slate-350">
                          <div className="flex justify-between font-bold text-indigo-400">
                            <span>Ação: {log.action}</span>
                            <span className="text-slate-500 font-normal">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-400 font-sans tracking-wide leading-relaxed">{log.description}</p>
                          <p className="text-[8.5px] text-slate-500">IP: {log.ipAddress || 'Unknown'}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500 text-center py-8">Vazio. Sem rastro de auditoria específico deste atleta.</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-500 py-12 text-center font-mono">Não foi possível processar informações avançadas.</p>
            )}

            <div className="pt-2 border-t border-slate-850 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveAuditUser(null);
                  setAdvancedInfo(null);
                }}
                className="p-1.5 px-4 bg-slate-950 hover:bg-slate-850 text-slate-450 hover:text-white rounded border border-slate-800 text-[11px]"
              >
                Fechar Painel Raio-X
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
