/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { authFetch } from '../utils/authFetch';
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
    handleRestoreUser,
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

  // Advanced Operations State
  const [advancedTab, setAdvancedTab] = useState<'sessions' | 'inventory' | 'marketplace' | 'subscriptions' | 'combat' | 'finance' | 'purchases' | 'study' | 'actions'>('sessions');
  const [doubleConfirmAction, setDoubleConfirmAction] = useState<{ actionType: string; title: string; message: string; onConfirm: () => void } | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [transferPayload, setTransferPayload] = useState({
    targetUserId: '',
    assetType: 'COINS' as 'BELT' | 'XP' | 'ELO' | 'COINS' | 'ITEM' | 'ITENS',
    value: ''
  });

  const callAdminAction = async (endpoint: string, method = 'POST', body?: any) => {
    try {
      const targetUrl = endpoint.startsWith('/') ? endpoint : `/api/admin/users/${endpoint}`;
      const res = await authFetch(targetUrl, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Ação executada com sucesso!", "success");
        if (activeAuditUser) {
          const updatedInfo = await fetchAdvancedInfo(activeAuditUser.id);
          if (updatedInfo) setAdvancedInfo(updatedInfo);
        }
        fetchUsers();
        return true;
      } else {
        showToast(data.error || "Erro ao processar ação administrativa.", "error");
        return false;
      }
    } catch {
      showToast("Erro técnico de rede ao processar requisição.", "error");
      return false;
    }
  };

  const onTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferPayload.targetUserId) {
      showToast("Selecione o atleta destinatário.", "error");
      return;
    }
    
    const targetName = registeredUsers.find(u => u.id === transferPayload.targetUserId)?.name || "Lutador Destino";
    const sourceName = activeAuditUser.name;
    const { assetType, value } = transferPayload;
    
    let valueDisplay = value;
    if (assetType === 'BELT') {
      valueDisplay = `Faixa atual (${activeAuditUser.belt || 'Branca'})`;
    } else if (assetType === 'ITEM') {
      const selectedItemName = advancedInfo?.inventory?.find((itm: any) => itm.id === value)?.name || 'Item selecionado';
      valueDisplay = `O item cosmético "${selectedItemName}" (ID: ${value})`;
    }
    
    setDoubleConfirmAction({
      actionType: 'TRANSFER',
      title: 'Confirmar Transferência de Ativos',
      message: `Você está prestes a transferir irreversivelmente ${valueDisplay} do tipo [${assetType}] de "${sourceName}" para "${targetName}".`,
      onConfirm: async () => {
        const success = await callAdminAction('/api/admin/users/transfer', 'POST', {
          sourceUserId: activeAuditUser.id,
          targetUserId: transferPayload.targetUserId,
          type: assetType,
          value
        });
        if (success) {
          setTransferPayload({ targetUserId: '', assetType: 'COINS', value: '' });
        }
      }
    });
  };

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
    csvContent += "ID,Nome,Email,Cargo,Faixa,Graus,Nivel,XP,ELO,Moedas JT,Saldo BRL,Suspenso,Banido\n";
    
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
    tableHtml += "<th>ID</th><th>Nome</th><th>Email</th><th>Cargo</th><th>Faixa</th><th>Graus</th><th>Nivel</th><th>XP</th><th>ELO</th><th>Moedas (JT)</th><th>Saldo (BRL)</th><th>Suspenso</th><th>Banido</th>";
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
        <td style="padding: 8px;">${u.coins || 0} JT</td>
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
                <th>Coins (JT)</th>
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
                      {regUser.deletedAt ? (
                        <span className="p-1 px-2 rounded bg-purple-500/10 border border-purple-500/25 text-purple-400 font-extrabold uppercase text-[9px]">ARQUIVADO</span>
                      ) : regUser.isBanned ? (
                        <span className="p-1 px-2 rounded bg-rose-500/10 border border-rose-500/25 text-rose-400 font-extrabold uppercase text-[9px]">BANIDO</span>
                      ) : regUser.isSuspended ? (
                        <span className="p-1 px-2 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 font-extrabold uppercase text-[9px]">SUSPENSO</span>
                      ) : regUser.isOnline ? (
                        <span className="p-1 px-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold uppercase text-[9px] animate-pulse">● ONLINE</span>
                      ) : (
                        <span className="p-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-extrabold uppercase text-[9px]">ATIVO</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs">
                      <div className="space-y-0.5 font-mono text-[10.5px]">
                        <p className="text-yellow-500 font-semibold">{regUser.coins || 0} JT</p>
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

                      {regUser.deletedAt ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDoubleConfirmAction({
                              actionType: 'RESTORE',
                              title: 'Reativar Atleta',
                              message: `Deseja desfazer a exclusão e reativar a conta do lutador "${regUser.name}" (${regUser.email})?`,
                              onConfirm: async () => {
                                await handleRestoreUser(regUser.id);
                              }
                            });
                          }}
                          className="p-1 px-2.5 bg-emerald-950/25 hover:bg-emerald-900 border border-emerald-950/30 text-[10px] text-emerald-400 hover:text-white rounded cursor-pointer transition-all uppercase font-sans font-bold inline-block"
                          title="Restabelecer Acesso do Lutador/Atleta"
                        >
                          Restaurar
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => {
                            if (regUser.id === user.id) {
                              showToast("Não é possível auto-excluir seu login atual.", "error");
                              return;
                            }
                            const reason = window.prompt("Motivo para arquivar a conta do atleta:", "Opção do aluno");
                            if (reason === null) return;
                            setDoubleConfirmAction({
                              actionType: 'DELETE',
                              title: 'Arquivar Atleta (Soft-Delete)',
                              message: `Deseja realmente arquivar a conta do lutador "${regUser.name}"? Motivo: ${reason}`,
                              onConfirm: async () => {
                                await handleDeleteUser(regUser.id, reason);
                              }
                            });
                          }}
                          disabled={regUser.id === user.id}
                          className="p-1 px-2 bg-rose-950/20 hover:bg-rose-900 border border-rose-950/30 disabled:opacity-30 disabled:hover:bg-transparent text-[10px] text-rose-450 hover:text-white rounded cursor-pointer transition-all"
                          title="Arquivar Atleta"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline-block" />
                        </button>
                      )}
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
                  <label className="text-[10px] text-slate-500 uppercase block">Username (@):</label>
                  <input 
                    type="text" 
                    value={editingUser.username || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="ex: roger_gracie"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Atleta Verificado:</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox"
                      checked={!!editingUser.isVerified}
                      onChange={(e) => setEditingUser({ ...editingUser, isVerified: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 bg-slate-900 border border-slate-800 rounded cursor-pointer accent-indigo-600"
                    />
                    <span className="text-[9px] text-slate-400 font-mono select-none">Selo Oficial (✓)</span>
                  </div>
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
                  <label className="text-[10px] text-slate-500 uppercase block">Coins (JT):</label>
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
              <div className="space-y-4 text-xs font-mono text-slate-350">
                
                {/* Atletas general attributes panel widget */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 uppercase">Graduação</p>
                    <p className="font-bold text-slate-200 text-xs">{advancedInfo.user.belt || 'Branca'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 uppercase">ELO Rating / Nivel</p>
                    <p className="font-bold text-indigo-400 text-xs">{advancedInfo.user.elo || 1000} ELO / Lvl {advancedInfo.user.level || 1}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 uppercase">JiuTickets</p>
                    <p className="font-bold text-yellow-500 text-xs">{advancedInfo.user.coins || 0} JT</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 uppercase">Estatuto Geral</p>
                    <p className="font-bold text-xs">
                      {advancedInfo.user.isBanned ? (
                        <span className="text-rose-500">🚫 BANIDO</span>
                      ) : advancedInfo.user.isSuspended ? (
                        <span className="text-amber-500">⏳ SUSPENSO</span>
                      ) : (
                        <span className="text-emerald-400">● ATIVO</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 uppercase">Condição Financeira</p>
                    <p className="font-bold text-xs">
                      {advancedInfo.user.isFrozen ? (
                        <span className="text-cyan-400 animate-pulse">❄️ CONGELADA</span>
                      ) : (
                        <span className="text-slate-400">✓ NORMAL</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Elegant administrative premium tab controller */}
                <div className="flex gap-1.5 border-b border-slate-850 pb-2 overflow-x-auto">
                  {[
                    { id: 'sessions', label: 'Sessões & Logins', icon: Terminal },
                    { id: 'inventory', label: 'Inventário (Armário)', icon: UserIcon },
                    { id: 'marketplace', label: 'Marketplace', icon: Trophy },
                    { id: 'subscriptions', label: 'Contratos VIP', icon: Award },
                    { id: 'combat', label: 'Combates (PVP)', icon: Swords },
                    { id: 'finance', label: 'Histórico de Pagamentos', icon: Wallet },
                    { id: 'purchases', label: 'Histórico de Compras', icon: FileText },
                    { id: 'study', label: 'Histórico de Aulas', icon: CheckCircle },
                    { id: 'actions', label: 'Controle Executivo', icon: Sliders }
                  ].map(tabItem => {
                    const IconComponent = tabItem.icon;
                    return (
                      <button
                        key={tabItem.id}
                        type="button"
                        onClick={() => setAdvancedTab(tabItem.id as any)}
                        className={`flex items-center gap-1.5 p-1.5 px-3 rounded text-[10px] font-bold tracking-wide font-mono cursor-pointer transition-all border shrink-0 ${
                          advancedTab === tabItem.id 
                            ? 'bg-indigo-650 border-indigo-505 text-white shadow-lg' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{tabItem.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Tab contents router */}
                <div className="min-h-[250px] max-h-[50vh] overflow-y-auto pr-1 space-y-4">
                  
                  {/* Tab 1: SESSIONS & LOGINS */}
                  {advancedTab === 'sessions' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                      <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                        <h5 className="text-[10px] uppercase font-bold text-slate-350 border-b border-slate-850 pb-1.5 flex items-center justify-between gap-1.5">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Terminal className="w-4 h-4 text-emerald-400" />
                            <span>Dispositivos & IPs de Entrada (Sessões Ativas)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setDoubleConfirmAction({
                                actionType: 'DISCONNECT_SESSIONS',
                                title: 'Desconectar Todas as Sessões',
                                message: `Deseja invalidar e revogar TODAS as sessões ativas e dispositivos de ${activeAuditUser.name}? Isso forçará a saída dele em todos os navegadores.`,
                                onConfirm: async () => {
                                  await callAdminAction(`${activeAuditUser.id}/sessions/disconnect-all`, 'POST');
                                }
                              });
                            }}
                            className="bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-400 font-bold text-[8.5px] p-1 px-2 rounded cursor-pointer transition-all uppercase shrink-0"
                          >
                            Encerrar Todos
                          </button>
                        </h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {advancedInfo.tokens && advancedInfo.tokens.length > 0 ? (
                            advancedInfo.tokens.map((token: any) => (
                              <div key={token.id} className="p-2 rounded bg-slate-900 border border-slate-850 text-[10px] space-y-1">
                                <div className="flex justify-between items-center text-[9.5px]">
                                  <span className="font-bold text-indigo-400 font-mono">{token.ipAddress || '127.0.0.1'}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500 flex items-center gap-1 font-mono text-[8.5px]">
                                      <Clock className="w-3 h-3" /> {new Date(token.issuedAt || token.createdAt).toLocaleString()}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDoubleConfirmAction({
                                          actionType: 'TERMINATE_TOKEN',
                                          title: 'Encerrar Dispositivo',
                                          message: `Revogar a autorização de acesso e derrubar o dispositivo IP ${token.ipAddress || '127.0.0.1'} do atleta ${activeAuditUser.name}?`,
                                          onConfirm: async () => {
                                            await callAdminAction(`${activeAuditUser.id}/sessions/${token.id}/terminate`, 'POST');
                                          }
                                        });
                                      }}
                                      className="text-rose-400 hover:text-white font-bold text-[8px] p-0.5 px-1.5 rounded border border-rose-500/20 bg-rose-950/30 cursor-pointer transition-all"
                                    >
                                      Derrubar ✕
                                    </button>
                                  </div>
                                </div>
                                <p className="text-slate-450 font-sans text-[9px] truncate" title={token.userAgent}>Browser Agent: {token.userAgent || 'Desconhecido'}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-500 text-center py-8">Nenhuma sessão síncrona aberta no banco.</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                        <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>Histórico de Tentativas de Login (IP Logins)</span>
                        </h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {advancedInfo.logins && advancedInfo.logins.length > 0 ? (
                            advancedInfo.logins.map((lg: any, idx: number) => (
                              <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-850 text-[9.5px] flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-slate-350 font-mono">IP: {lg.ipAddress || 'Sem IP'}</p>
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
                            <p className="text-[10px] text-slate-500 text-center py-8">Nenhum log cadastral de login.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: INVENTORY (Visualizar inventário) */}
                  {advancedTab === 'inventory' && (
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5 animate-fadeIn">
                      <h5 className="text-[10px] uppercase font-bold text-slate-300 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-emerald-400" />
                        <span>Inventário de Itens Adquiridos & Cosméticos</span>
                      </h5>
                      {advancedInfo.inventory && advancedInfo.inventory.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 select-none text-[10px]">
                          {advancedInfo.inventory.map((item: any) => (
                            <div key={item.id} className="p-3 rounded-lg bg-slate-900 border border-slate-850 flex items-start gap-2.5">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover border border-slate-700 shrink-0" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-10 h-10 bg-indigo-950 text-indigo-400 rounded border border-indigo-900 flex items-center justify-center font-bold text-xs shrink-0 font-mono">🥋</div>
                              )}
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <p className="font-bold text-slate-200 truncate">{item.name}</p>
                                <p className="text-[9px] text-slate-450 line-clamp-1">{item.description || 'Kimono ou insígnia adquirida'}</p>
                                <div className="flex gap-1.5 items-center pt-0.5">
                                  <span className={`text-[8px] font-bold px-1 rounded uppercase ${
                                    item.rarity === 'LEGENDARY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    item.rarity === 'EPIC' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                    item.rarity === 'RARE' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                    'bg-slate-500/10 text-slate-400 border border-slate-550/10'
                                  }`}>{item.rarity}</span>
                                  {item.isEquipped && (
                                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1 rounded font-bold uppercase">Equipado</span>
                                  )}
                                </div>
                                <p className="text-[8px] font-mono text-slate-600 truncate pt-0.5">Item ID: {item.id}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-550 text-center py-10">Este atleta possui o armário vazio ou não há itens registrados no inventário.</p>
                      )}
                    </div>
                  )}

                  {/* Tab: MARKETPLACE (Visualizar marketplace) */}
                  {advancedTab === 'marketplace' && (
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5 animate-fadeIn">
                      <h5 className="text-[10px] uppercase font-bold text-slate-300 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>Ofertas Ativas de Anúncios no Marketplace Central</span>
                      </h5>
                      {advancedInfo.marketplace && advancedInfo.marketplace.length > 0 ? (
                        <div className="space-y-2">
                          {advancedInfo.marketplace.map((m: any) => (
                            <div key={m.id} className="p-3 rounded-lg bg-slate-900 border border-slate-850 text-[10px] flex justify-between items-center">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-200">
                                  Item anunciado: {m.inventoryItem?.name || 'Item de Coleção'}
                                </p>
                                <div className="flex gap-2 text-[8.5px] text-slate-500">
                                  <span>ID Anúncio: <span className="font-mono text-slate-400 font-bold">{m.id}</span></span>
                                  <span>•</span>
                                  <span>Cadastrado em: {new Date(m.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-yellow-500 font-mono">{m.priceJT} JT</p>
                                <span className={`text-[8.5px] uppercase font-bold rounded px-1.5 ${
                                  m.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                }`}>
                                  {m.active ? 'ATIVO' : 'CONCLUÍDO/PAUSADO'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-550 text-center py-10">Nenhuma oferta de venda ativa registrada no marketplace por este atleta.</p>
                      )}
                    </div>
                  )}

                  {/* Tab: SUBSCRIPTIONS (Visualizar assinaturas) */}
                  {advancedTab === 'subscriptions' && (
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5 animate-fadeIn">
                      <h5 className="text-[10px] uppercase font-bold text-slate-300 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>Planos e Contratos de Assinatura Ativos</span>
                      </h5>
                      {advancedInfo.subscriptions && advancedInfo.subscriptions.length > 0 ? (
                        <div className="space-y-2">
                          {advancedInfo.subscriptions.map((sub: any) => (
                            <div key={sub.id} className="p-3 rounded-lg bg-slate-900 border border-slate-850 text-[10px] space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-indigo-400 text-[11px]">{sub.plan?.name || 'Acesso VIP Premium'}</span>
                                <span className={`p-0.5 px-2 rounded text-[8px] font-bold ${
                                  sub.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-505/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                }`}>
                                  {sub.status}
                                </span>
                              </div>
                              <p className="text-slate-450 text-[9px]">{sub.plan?.description || 'Acesso liberado às aulas e treinos recomendados.'}</p>
                              <div className="grid grid-cols-2 gap-3 text-[8.5px] text-slate-505 pt-1 border-t border-slate-850/50 font-mono">
                                <p>Início: {new Date(sub.startDate).toLocaleDateString()}</p>
                                <p>Término: {new Date(sub.endDate).toLocaleDateString()}</p>
                              </div>
                              <p className="text-[8px] font-mono text-slate-600">Assinatura ID: {sub.id}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-550 text-center py-10">Este atleta não possui nenhum plano ou contrato de assinatura ativa cadastrada.</p>
                      )}
                    </div>
                  )}

                  {/* Tab 2: COMBAT PVP */}
                  {advancedTab === 'combat' && (
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                        <Swords className="w-4 h-4 text-rose-500" />
                        <span>Histórico de PVP na Arena de Combates</span>
                      </h5>
                      <div className="space-y-2">
                        {advancedInfo.pvpHistory && advancedInfo.pvpHistory.length > 0 ? (
                          advancedInfo.pvpHistory.map((pvp: any) => {
                            const isChallenger = pvp.challengerId === activeAuditUser.id;
                            const opponent = isChallenger ? pvp.defender?.name : pvp.challenger?.name;
                            const opponentBelt = isChallenger ? pvp.defender?.belt : pvp.challenger?.belt;
                            const didWin = pvp.winnerId === activeAuditUser.id;
                            return (
                              <div key={pvp.id} className="p-3 rounded-lg bg-slate-900 border border-slate-850 text-[10px] space-y-1.5 flex justify-between items-center">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-200">vs {opponent || 'Oponente'}</span>
                                    <span className="text-[8.5px] px-1 bg-slate-950 text-slate-500 font-sans border border-slate-800 rounded">{opponentBelt || 'Branca'}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-450 display flex gap-3">
                                    <span>Placar: {pvp.challengerScore || 0} x {pvp.defenderScore || 0}</span>
                                    <span>•</span>
                                    <span>{new Date(pvp.createdAt).toLocaleString()}</span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className={`p-1 px-3 rounded text-[8.5px] font-black border uppercase ${
                                    didWin ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    {didWin ? "VITÓRIA" : "DERROTA"}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[11px] text-slate-500 text-center py-12">Inexistência de lutas e duelos registrados.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: FINANCE & PAYMENTS */}
                  {advancedTab === 'finance' && (
                    <div className="space-y-4">
                      {/* Financial ledger transactions list */}
                      <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                        <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>Razão Geral de Conta - Transações Analítico</span>
                        </h5>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {advancedInfo.transactions && advancedInfo.transactions.length > 0 ? (
                            advancedInfo.transactions.map((tx: any) => (
                              <div key={tx.id} className="p-2 rounded bg-slate-900 border border-slate-850 text-[9.5px] space-y-0.5">
                                <div className="flex justify-between">
                                  <span className="font-bold text-slate-250 truncate block max-w-[250px]">{tx.notes || tx.type}</span>
                                  <span className={`font-bold ${tx.amountBRL > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>R$ {tx.amountBRL.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-500">
                                  <span>Saldo virtual: {tx.amountJT || 0} JT</span>
                                  <span>{new Date(tx.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-500 text-center py-6">Sem registros de transações financeiras arquivadas.</p>
                          )}
                        </div>
                      </div>

                      {/* Subscriptions historical logs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                          <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-indigo-400" />
                            <span>Contratos de Assinatura (Pagamentos VIP)</span>
                          </h5>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {advancedInfo.subPayments && advancedInfo.subPayments.length > 0 ? (
                              advancedInfo.subPayments.map((p: any) => (
                                <div key={p.id} className="p-2 rounded bg-slate-900 border border-slate-850 text-[9.5px] space-y-1">
                                  <div className="flex justify-between font-bold">
                                    <span className="text-indigo-300">{p.subscription?.plan?.title || 'Plano VIP'}</span>
                                    <span className="text-slate-300">R$ {parseFloat(p.amountBRL).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-[8px] text-slate-500">
                                    <span className="uppercase">{p.status}</span>
                                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-slate-500 text-center py-6">Nenhum pagamento correspondido.</p>
                            )}
                          </div>
                        </div>

                        {/* Withdrawals lists */}
                        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                          <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                            <Download className="w-4 h-4 text-cyan-400" />
                            <span>Solicitações de Saque Efetuadas (Transações PIX)</span>
                          </h5>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {advancedInfo.withdrawals && advancedInfo.withdrawals.length > 0 ? (
                              advancedInfo.withdrawals.map((w: any) => (
                                <div key={w.id} className="p-2 rounded bg-slate-900 border border-slate-850 text-[9.5px] space-y-1">
                                  <div className="flex justify-between font-bold">
                                    <span className="text-slate-200">R$ {parseFloat(w.amountBRL).toFixed(2)}</span>
                                    <span className={`text-[8px] rounded px-1 ${
                                      w.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      w.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                      {w.status}
                                    </span>
                                  </div>
                                  <p className="text-[8.5px] text-slate-500 truncate">PIX ({w.keyType}): {w.pixKey}</p>
                                  <p className="text-[7.5px] text-slate-600 text-right">{new Date(w.createdAt).toLocaleString()}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-slate-500 text-center py-6">Nenhum levantamento ou saque pendente/efetuado.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: PURCHASES */}
                  {advancedTab === 'purchases' && (
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-indigo-400" />
                        <span>Histórico de Compras de Cosméticos & Loja Especial</span>
                      </h5>
                      <div className="space-y-2">
                        {advancedInfo.purchases && advancedInfo.purchases.length > 0 ? (
                          advancedInfo.purchases.map((pc: any) => (
                            <div key={pc.id} className="p-3 rounded-lg bg-slate-900 border border-slate-850 text-[10px] flex justify-between items-center">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-200">{pc.product?.name || 'Item de Especialidade'}</p>
                                <p className="text-[8.5px] text-slate-500">ID Cupom: <span className="text-slate-400 font-mono">{pc.id}</span></p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-yellow-500">{pc.pricePaidJT || pc.product?.priceJT || 0} JT</p>
                                <p className="text-[8px] text-slate-500">{new Date(pc.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-500 text-center py-12">Sem compras registradas na loja de cosméticos.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 5: LESSONS & AUDIT */}
                  {advancedTab === 'study' && (
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2.5">
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Histórico de Aulas & Conclusões de Estudo</span>
                      </h5>
                      <div className="space-y-2">
                        {advancedInfo.auditLogs && advancedInfo.auditLogs.filter((l: any) => l.action === 'LESSON_COMPLETE' || l.description.toLowerCase().includes('aula') || l.description.toLowerCase().includes('concluiu')).length > 0 ? (
                          advancedInfo.auditLogs.filter((l: any) => l.action === 'LESSON_COMPLETE' || l.description.toLowerCase().includes('aula') || l.description.toLowerCase().includes('concluiu')).map((log: any) => (
                            <div key={log.id} className="p-3 rounded-lg bg-slate-900 border border-slate-850 text-[10px] space-y-1">
                              <div className="flex justify-between items-center text-slate-400">
                                <span className="font-bold text-indigo-400 flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{log.action}</span>
                                </span>
                                <span className="text-slate-500 text-[8.5px]">{new Date(log.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-slate-350 text-[9.5px] leading-relaxed font-sans">{log.description}</p>
                              {log.amountJT && <p className="text-[8.5px] text-yellow-500 font-sans">XP/Moedas recebidas: +{log.amountJT} JT</p>}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 space-y-2">
                            <Clock className="w-8 h-8 text-slate-650 mx-auto" />
                            <p className="text-[11px] text-slate-550">Nenhuma conclusão expressa de módulo ou aula reportada no banco.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 6: EXPERT EXECUTIVE CONTROLS */}
                  {advancedTab === 'actions' && (
                    <div className="space-y-4">
                      
                      {/* Sub-section A: Asset Transfers (P2P Belt/XP/ELO/Coins) */}
                      <div className="bg-slate-950 p-4 border border-indigo-900/20 rounded-xl space-y-3">
                        <h5 className="text-[10px] uppercase font-bold text-indigo-300 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-indigo-400" />
                          <span>Migrar / Transferir de Ativos Organizacionais</span>
                        </h5>

                        <form onSubmit={onTransferSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div className="space-y-1 md:col-span-1.5">
                            <label className="text-[9px] text-slate-500 uppercase">Atleta de Destino:</label>
                            <select
                              value={transferPayload.targetUserId}
                              onChange={(e) => setTransferPayload({ ...transferPayload, targetUserId: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-[10px] text-slate-200 focus:outline-none"
                              required
                            >
                              <option value="">-- Selecione o Destinatário --</option>
                              {registeredUsers.filter(u => u.id !== activeAuditUser.id).map(u => (
                                <option key={u.id} value={u.id}>
                                  {u.name} ({u.belt} • Lvl {u.level})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1 md:col-span-1">
                            <label className="text-[9px] text-slate-500 uppercase">Tipo de Recurso:</label>
                            <select
                              value={transferPayload.assetType}
                              onChange={(e) => setTransferPayload({ ...transferPayload, assetType: e.target.value as any, value: '' })}
                              className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-[10px] text-slate-200 focus:outline-none"
                            >
                              <option value="COINS">JiuTickets (JT)</option>
                              <option value="XP">Estudos XP (Pontos)</option>
                              <option value="ELO">ELO Rating (Pontos)</option>
                              <option value="BELT">Graduação (Faixa Atual)</option>
                              <option value="ITEM">Item do Inventário (Cosmético)</option>
                            </select>
                          </div>

                          <div className="space-y-1 md:col-span-1">
                            <label className="text-[9px] text-slate-500 uppercase">Quantidade / Item:</label>
                            {transferPayload.assetType === 'ITEM' ? (
                              <select
                                value={transferPayload.value}
                                onChange={(e) => setTransferPayload({ ...transferPayload, value: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-[10px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                              >
                                <option value="">-- Selecione o Item --</option>
                                {advancedInfo?.inventory && advancedInfo.inventory.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} ({item.rarity})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                disabled={transferPayload.assetType === 'BELT'}
                                value={transferPayload.assetType === 'BELT' ? 'F_B_001' : transferPayload.value}
                                onChange={(e) => setTransferPayload({ ...transferPayload, value: e.target.value })}
                                placeholder={transferPayload.assetType === 'BELT' ? 'Migra a Faixa Inteira' : 'Ex: 500'}
                                className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-[10px] text-slate-200 focus:outline-none disabled:opacity-40"
                                required={transferPayload.assetType !== 'BELT'}
                              />
                            )}
                          </div>

                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] p-2.5 rounded cursor-pointer transition-all uppercase font-sans md:col-span-0.5"
                          >
                            Transferir
                          </button>
                        </form>
                      </div>

                      {/* Sub-section B: Moderative blocks (Freeze and suspensions) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
                          <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                            <Ban className="w-4 h-4 text-cyan-400" />
                            <span>Segurança & Estatuto de Operabilidade</span>
                          </h5>
                          
                          <div className="space-y-2.5">
                            {/* Freeze / Unfreeze block */}
                            <div className="flex justify-between items-center p-2 rounded bg-slate-925 border border-slate-850">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-200 text-[10.5px]">Congelar Carteira e Conta</p>
                                <p className="text-[8.5px] text-slate-500">Impede compras, saques PIX e transferências de saldo em definitivo</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const isFrozen = advancedInfo.user.isFrozen;
                                  setDoubleConfirmAction({
                                    actionType: 'FREEZE_TOGGLE',
                                    title: isFrozen ? 'Descongelar Conta' : 'Congelar Conta',
                                    message: `Deseja realmente ${isFrozen ? 'DESCONGELAR' : 'CONGELAR'} os fundos e transações de ${activeAuditUser.name}?`,
                                    onConfirm: async () => {
                                      await callAdminAction(isFrozen ? `${activeAuditUser.id}/unfreeze` : `${activeAuditUser.id}/freeze`, 'POST');
                                    }
                                  });
                                }}
                                className={`text-[9.5px] font-bold p-1 px-3.5 rounded border transition-all cursor-pointer ${
                                  advancedInfo.user.isFrozen
                                    ? 'bg-emerald-600/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-600/30'
                                    : 'bg-cyan-600/15 text-cyan-400 border-cyan-500/25 hover:bg-cyan-600/30'
                                }`}
                              >
                                {advancedInfo.user.isFrozen ? "❄️ RETIRAR GEL" : "❄️ CONGELAR"}
                              </button>
                            </div>

                            {/* Suspend Account block */}
                            <div className="flex justify-between items-center p-2 rounded bg-slate-925 border border-slate-850">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-200 text-[10.5px]">Bloqueio de Suspensão de Acesso</p>
                                <p className="text-[8.5px] text-slate-500">Interrompe a autenticação do lutador impedindo login</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = !advancedInfo.user.isSuspended;
                                  setDoubleConfirmAction({
                                    actionType: 'SUSPEND_TOGGLE',
                                    title: newVal ? 'Suspender Usuário' : 'Reativar Usuário',
                                    message: `Escreva "SIM" para comissionar a ${newVal ? 'SUSPENSÃO' : 'REATIVAÇÃO'} de acesso de ${activeAuditUser.name}.`,
                                    onConfirm: async () => {
                                      await callAdminAction(`${activeAuditUser.id}/update`, 'POST', { isSuspended: newVal });
                                    }
                                  });
                                }}
                                className={`text-[9.5px] font-bold p-1 px-3.5 rounded border transition-all cursor-pointer ${
                                  advancedInfo.user.isSuspended
                                    ? 'bg-emerald-650/15 text-emerald-450 border-emerald-500/30'
                                    : 'bg-amber-600/15 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {advancedInfo.user.isSuspended ? "✓ REATIVAR CONTA" : "⏳ SUSPENDER"}
                              </button>
                            </div>

                            {/* Ban Account block */}
                            <div className="flex justify-between items-center p-2 rounded bg-slate-925 border border-slate-850">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-200 text-[10.5px]">Banimento Permanente (Ban)</p>
                                <p className="text-[8.5px] text-slate-500">Bane permanente o atleta do ranking competitivo e acessividade</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = !advancedInfo.user.isBanned;
                                  setDoubleConfirmAction({
                                    actionType: 'BAN_TOGGLE',
                                    title: newVal ? 'Banir Usuário' : 'Desbanir Usuário',
                                    message: `Deseja realmente ${newVal ? 'BANIR DEFINITIVAMENTE' : 'REATIVAR / RETIRAR BLACKLIST DE'} ${activeAuditUser.name}?`,
                                    onConfirm: async () => {
                                      await callAdminAction(`${activeAuditUser.id}/update`, 'POST', { isBanned: newVal });
                                    }
                                  });
                                }}
                                className={`text-[9.5px] font-bold p-1 px-3.5 rounded border transition-all cursor-pointer ${
                                  advancedInfo.user.isBanned
                                    ? 'bg-emerald-650/15 text-emerald-450 border-emerald-500/30'
                                    : 'bg-rose-950/40 text-rose-450 border-rose-500/30 hover:bg-rose-900/30'
                                }`}
                              >
                                {advancedInfo.user.isBanned ? "✓ DESBANIR CONTA" : "🚫 BANIR ATLETA"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Reset items of the combatant */}
                        <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
                          <h5 className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                            <span>Redefinições de Atleta (Regeneradores)</span>
                          </h5>

                          <div className="grid grid-cols-1 gap-2">
                            {/* Reset Progress */}
                            <button
                              type="button"
                              onClick={() => {
                                setDoubleConfirmAction({
                                  actionType: 'RESET_PROGRESS',
                                  title: 'Resetar Progresso de Estudos',
                                  message: `Esta ação executa um wipe completo nos levels obtidos e XP de "${activeAuditUser.name}". O progresso será resetado para o Nível 1, 0 XP.`,
                                  onConfirm: async () => {
                                    await callAdminAction(`${activeAuditUser.id}/reset-progress`, 'POST');
                                  }
                                });
                              }}
                              className="text-left p-2 rounded bg-slate-920 border border-slate-850 hover:bg-slate-900 transition-all flex justify-between items-center text-[10px] font-bold text-slate-300"
                            >
                              <span>📘 Limpar Progresso (Resetar Nível & XP)</span>
                              <span className="text-slate-500 text-[9px]">EXECUTE ❯</span>
                            </button>

                            {/* Reset Inventory */}
                            <button
                              type="button"
                              onClick={() => {
                                setDoubleConfirmAction({
                                  actionType: 'RESET_INVENTORY',
                                  title: 'Resetar Inventário Cosmético',
                                  message: `Esta ação limpa permanentemente o armário de medalhas, avatares masculinos/femininos e molduras obtidas na loja de "${activeAuditUser.name}".`,
                                  onConfirm: async () => {
                                    await callAdminAction(`${activeAuditUser.id}/reset-inventory`, 'POST');
                                  }
                                });
                              }}
                              className="text-left p-2 rounded bg-slate-920 border border-slate-850 hover:bg-slate-900 transition-all flex justify-between items-center text-[10px] font-bold text-slate-300"
                            >
                              <span>🥋 Limpar Inventário (Esvaziar Itens da Loja)</span>
                              <span className="text-slate-500 text-[9px]">EXECUTE ❯</span>
                            </button>

                            {/* Reset Ranking */}
                            <button
                              type="button"
                              onClick={() => {
                                setDoubleConfirmAction({
                                  actionType: 'RESET_RANKING',
                                  title: 'Resetar Ranking PVP (ELO)',
                                  message: `A ação recalibra a pontuação competitiva da Arena PVP do atleta "${activeAuditUser.name}" de volta para o padrão de 1000 ELO pontos.`,
                                  onConfirm: async () => {
                                    await callAdminAction(`${activeAuditUser.id}/reset-ranking`, 'POST');
                                  }
                                });
                              }}
                              className="text-left p-2 rounded bg-slate-920 border border-slate-850 hover:bg-slate-900 transition-all flex justify-between items-center text-[10px] font-bold text-slate-300"
                            >
                              <span>🏆 Limpar Ranking PVP (Resetar ELO para 1000)</span>
                              <span className="text-slate-500 text-[9px]">EXECUTE ❯</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sub-section C: Permanent wipe delete button */}
                      <div className="bg-rose-950/20 p-4 border border-rose-500/30 rounded-xl space-y-2">
                        <h6 className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4 animate-bounce" />
                          <span>Área de Destruição Peremptória (Ação Executiva Máxima)</span>
                        </h6>
                        <p className="text-[9px] text-slate-400">
                          A exclusão removerá todas as chaves estrangeiras, estatísticas, carteiras e logins associados a este usuário na base central.
                        </p>
                        <div className="flex justify-between items-center pt-1.5">
                          {activeAuditUser.deletedAt ? (
                            <>
                              <span className="text-[9px] text-purple-400 font-bold uppercase">Esta conta está arquivada (soft-deleted)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setDoubleConfirmAction({
                                    actionType: 'RESTORE',
                                    title: 'Restabelecer Matrícula',
                                    message: `Restabelecer as credenciais e remover suspensão de "${activeAuditUser.name}"?`,
                                    onConfirm: async () => {
                                      await handleRestoreUser(activeAuditUser.id);
                                      setActiveAuditUser(null);
                                      setAdvancedInfo(null);
                                    }
                                  });
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-[9px] p-2 px-4 rounded cursor-pointer transition-all uppercase"
                              >
                                Restaurar Conta
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-[9px] text-rose-400/80 font-bold uppercase">Arquivamento seguro com motivo de auditoria</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (activeAuditUser.id === user.id) {
                                    showToast("Não é possível auto-excluir o login atual.", "error");
                                    return;
                                  }
                                  const reason = window.prompt("Motivo do arquivamento (Soft-Delete):", "Solicitado pelo aluno");
                                  if (reason === null) return;
                                  setDoubleConfirmAction({
                                    actionType: 'DELETE',
                                    title: 'Arquivar Atleta (Soft-Delete)',
                                    message: `Confirmar arquivamento de "${activeAuditUser.name}"? Motivo: ${reason}`,
                                    onConfirm: async () => {
                                      await handleDeleteUser(activeAuditUser.id, reason);
                                      setActiveAuditUser(null);
                                      setAdvancedInfo(null);
                                    }
                                  });
                                }}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-[9px] p-2 px-4 rounded cursor-pointer transition-all uppercase"
                              >
                                Arquivar Usuário
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

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
                className="p-1.5 px-4 bg-slate-950 hover:bg-slate-850 text-slate-450 hover:text-white rounded border border-slate-800 text-[11px] cursor-pointer"
              >
                Fechar Painel Raio-X
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DOUBLE CONFIRMATION LAYER ELEMENT FOR ALL EXECUTIVES MODAL ACTIONS */}
      {doubleConfirmAction && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/30 rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp shadow-2xl relative">
            <div className="text-center space-y-2">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
              <h5 className="font-display font-black text-sm text-slate-200 uppercase tracking-wider">
                Ação Executiva Crítica
              </h5>
              <p className="text-[11px] text-rose-400 font-sans leading-relaxed">
                {doubleConfirmAction.message}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider font-bold">
                Escreva "SIM" para homologar a instrução
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ESCREVA SIM E CLIQUE EM CONFIRMAR"
                className="w-full bg-slate-950 border border-slate-800 p-2 text-center text-slate-200 outline-none focus:border-rose-500 font-bold uppercase text-xs rounded-lg"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDoubleConfirmAction(null);
                  setConfirmText('');
                }}
                className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer text-center font-bold text-xs"
              >
                Abortar
              </button>
              <button
                type="button"
                disabled={confirmText.trim().toUpperCase() !== 'SIM'}
                onClick={() => {
                  doubleConfirmAction.onConfirm();
                  setDoubleConfirmAction(null);
                  setConfirmText('');
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-35 disabled:hover:bg-rose-600 text-white font-bold rounded-lg cursor-pointer text-center text-xs"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
