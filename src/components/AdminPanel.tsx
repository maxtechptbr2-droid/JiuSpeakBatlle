/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Database, 
  Trash2, 
  RefreshCcw, 
  Cpu, 
  Layers, 
  TrendingUp,
  Award,
  Coins,
  ArrowDownLeft,
  UserCheck,
  Shield,
  User as UserIcon,
  HelpCircle,
  CheckCircle,
  XCircle,
  Search,
  ShoppingCart,
  Ban,
  MessageSquare,
  AlertCircle,
  Eye,
  Calendar,
  DollarSign,
  Filter,
  Sliders,
  Settings,
  ChevronRight,
  TrendingDown,
  Info,
  Clock,
  ArrowUpRight,
  Sparkles,
  Play
} from 'lucide-react';
import { UserProfile, AuditLog, BeltRank } from '../types';

interface AdminPanelProps {
  user: UserProfile;
  auditLogs: AuditLog[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  onClearLogs: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AdminPanel({ 
  user, 
  auditLogs, 
  updateUser, 
  onClearLogs, 
  showToast 
}: AdminPanelProps) {
  
  // Tab control state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'pix' | 'withdrawals' | 'marketplace' | 'audit' | 'rankings' | 'reports'>('overview');
  
  // Data lists states
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [pixPaymentsList, setPixPaymentsList] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [marketplaceList, setMarketplaceList] = useState<any[]>([]);
  const [generalLogs, setGeneralLogs] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);

  // Loading indicator states
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    stats: false,
    users: false,
    subs: false,
    pix: false,
    withdrawals: false,
    marketplace: false,
    audit: false,
    reports: false
  });

  // Search and filter states
  const [userSearchText, setUserSearchText] = useState('');
  const [userFilterBelt, setUserFilterBelt] = useState<string>('ALL');
  
  // Modal toggle and payload states
  const [editingUser, setEditingUser] = useState<any>(null);
  const [reviewingWithdrawal, setReviewingWithdrawal] = useState<any>(null);
  const [auditedWithdrawal, setAuditedWithdrawal] = useState<any>(null);
  const [withdrawalAudits, setWithdrawalAudits] = useState<any[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');

  // -------------------------------------------------------------
  // ANALYTICAL STATS FETCH
  // -------------------------------------------------------------
  const fetchDashboardStats = async () => {
    setIsLoading(prev => ({ ...prev, stats: true }));
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      if (!token) return;
      const res = await fetch('/api/admin/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data.stats);
      }
    } catch (err) {
      console.error("Stats fetching failed", err);
    } finally {
      setIsLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // -------------------------------------------------------------
  // USERS MANAGEMENT SECTION
  // -------------------------------------------------------------
  const fetchUsers = async () => {
    setIsLoading(prev => ({ ...prev, users: true }));
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      if (!token) return;
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRegisteredUsers(data.users || []);
      }
    } catch (err) {
      console.error("Users fetching failed", err);
    } finally {
      setIsLoading(prev => ({ ...prev, users: false }));
    }
  };

  const handleChangeRole = async (targetId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'ATHLETE' : 'ADMIN';
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch('/api/admin/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: targetId, newRole })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Cargo editado com sucesso!", "success");
        fetchUsers();
        fetchDashboardStats();
      } else {
        showToast(data.error || "Fracasso ao atualizar cargo.", "error");
      }
    } catch (err) {
      showToast("Erro ao contatar servidor.", "error");
    }
  };

  const handleUpdateUsersProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch(`/api/admin/users/${editingUser.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingUser)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Ficha do lutador regravada com êxito!", "success");
        
        // If editing ourselves, update state immediately
        if (editingUser.id === user.id) {
          updateUser(editingUser);
        }
        
        setEditingUser(null);
        fetchUsers();
        fetchDashboardStats();
      } else {
        showToast(data.error || "Fracasso ao gravar dados.", "error");
      }
    } catch (err) {
      showToast("Erro na requisição de cadastro.", "error");
    }
  };

  // -------------------------------------------------------------
  // SUBSCRIPTION MANAGEMENT SECTION
  // -------------------------------------------------------------
  const fetchSubscriptions = async () => {
    setIsLoading(prev => ({ ...prev, subs: true }));
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      if (!token) return;
      const res = await fetch('/api/admin/subscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptionsList(data.subscriptions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(prev => ({ ...prev, subs: false }));
    }
  };

  const handleSubscriptionAction = async (subId: string, action: 'CANCEL' | 'REACTIVATE') => {
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch(`/api/admin/subscriptions/${subId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Ação de assinatura gravada!", "success");
        fetchSubscriptions();
        fetchDashboardStats();
      } else {
        showToast(data.error || "Erro ao rodar ação.", "error");
      }
    } catch (err) {
      showToast("Erro de comunicação.", "error");
    }
  };

  const handleForceCronSimulate = async () => {
    try {
      const res = await fetch('/api/subscriptions/simulate-cron', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Cron de Assinaturas Executado! Processados: ${data.processedTotal || 0}. Expirados: ${data.expiredTotal || 0}.`, "success");
        fetchSubscriptions();
        fetchDashboardStats();
      } else {
        showToast(data.error || "Falha na cron.", "error");
      }
    } catch (err) {
       showToast("Falha técnica no gatilho cron.", "error");
    }
  };

  // -------------------------------------------------------------
  // PIX MANAGEMENT SECTION
  // -------------------------------------------------------------
  const fetchPixPayments = async () => {
    setIsLoading(prev => ({ ...prev, pix: true }));
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      if (!token) return;
      const res = await fetch('/api/admin/pix', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPixPaymentsList(data.pixPayments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(prev => ({ ...prev, pix: false }));
    }
  };

  const handlePixAction = async (pixId: string, action: 'APPROVE' | 'EXPIRE') => {
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch(`/api/admin/pix/${pixId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "PIX processado com sucesso!", "success");
        fetchPixPayments();
        fetchDashboardStats();
      } else {
        showToast(data.error || "Falha ao arbitrar PIX.", "error");
      }
    } catch (err) {
      showToast("Falha de rede.", "error");
    }
  };

  // -------------------------------------------------------------
  // WITHDRAWALS (SAQUES) MANAGEMENT SECTION
  // -------------------------------------------------------------
  const fetchWithdrawals = async () => {
    setIsLoading(prev => ({ ...prev, withdrawals: true }));
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      if (!token) return;
      const res = await fetch('/api/admin/withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawalsList(data.withdrawals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(prev => ({ ...prev, withdrawals: false }));
    }
  };

  const fetchWithdrawalAudits = async (wId: string) => {
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch(`/api/admin/withdrawals/${wId}/audits`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawalAudits(data.audits || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingWithdrawal) return;
    
    const { id, action } = reviewingWithdrawal;
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch(`/api/admin/withdrawals/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, notes: reviewNotes })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Decisão de saque homologada!", "success");
        setReviewingWithdrawal(null);
        setReviewNotes('');
        fetchWithdrawals();
        fetchDashboardStats();
      } else {
        showToast(data.error || "Erro ao emitir decisão.", "error");
      }
    } catch (err) {
      showToast("Servidor inacessível.", "error");
    }
  };

  // -------------------------------------------------------------
  // MARKETPLACE SECTION
  // -------------------------------------------------------------
  const fetchMarketplace = async () => {
    setIsLoading(prev => ({ ...prev, marketplace: true }));
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      if (!token) return;
      const res = await fetch('/api/admin/marketplace', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMarketplaceList(data.marketplace || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(prev => ({ ...prev, marketplace: false }));
    }
  };

  const handleSuspendListing = async (listingId: string) => {
    if (!window.confirm("Deseja realmente retirar este anúncio do ar? O item será devolvido ao vendedor com um alerta administrativo.")) return;
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch(`/api/admin/marketplace/${listingId}/action`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Anúncio suspenso!", "success");
        fetchMarketplace();
        fetchDashboardStats();
      } else {
        showToast(data.error || "Erro ao suspender.", "error");
      }
    } catch (err) {
      showToast("Falha na comunicação.", "error");
    }
  };

  // -------------------------------------------------------------
  // GENERAL SYSTEM AUDIT LOGS FETCH
  // -------------------------------------------------------------
  const fetchAuditLogs = async () => {
    setIsLoading(prev => ({ ...prev, audit: true }));
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      if (!token) return;
      const res = await fetch('/api/admin/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGeneralLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(prev => ({ ...prev, audit: false }));
    }
  };

  // -------------------------------------------------------------
  // RANKINGS MANAGEMENT
  // -------------------------------------------------------------
  const handleUpdateUserScores = async (userId: string, currentElo: number) => {
    const promptValue = window.prompt("Digite o novo ELO rating do atleta:", String(currentElo));
    if (promptValue === null) return;
    const newElo = parseInt(promptValue, 10);
    if (isNaN(newElo)) return showToast("Valor numérico inválido.", "error");

    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch(`/api/admin/rankings/${userId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ elo: newElo, wins: 15, losses: 5 })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Ranqueamento reajustado com êxito!", "success");
        fetchUsers();
      } else {
        showToast(data.error || "Fracasso ao calibrar elo.", "error");
      }
    } catch (err) {
      showToast("Não foi possível enviar ajuste.", "error");
    }
  };

  // -------------------------------------------------------------
  // COMPLAINTS & FLAGS (DENÚNCIAS MODERATOR)
  // -------------------------------------------------------------
  const fetchReports = async () => {
    setIsLoading(prev => ({ ...prev, reports: true }));
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      if (!token) return;
      const res = await fetch('/api/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReportsList(data.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(prev => ({ ...prev, reports: false }));
    }
  };

  const handleReportDecision = async (reportId: string, decision: 'DISMISS' | 'DELETE_CONTENT') => {
    const confirmation = decision === 'DELETE_CONTENT'
      ? "Deseja realmente REMOVER ESSE CONTEÚDO da plataforma e declarar a denúncia procedente?"
      : "Deseja IGNORAR esta denúncia?";
      
    if (!window.confirm(confirmation)) return;

    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch(`/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Denúncia moderada!", "success");
        fetchReports();
        fetchDashboardStats();
      } else {
        showToast(data.error || "Fracasso na moderação.", "error");
      }
    } catch (err) {
      showToast("Falha rede.", "error");
    }
  };

  // -------------------------------------------------------------
  // LIFECYCLE SYNC
  // -------------------------------------------------------------
  useEffect(() => {
    fetchDashboardStats();
    
    // Auto sync depending on tab index change
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'subscriptions') fetchSubscriptions();
    if (activeTab === 'pix') fetchPixPayments();
    if (activeTab === 'withdrawals') fetchWithdrawals();
    if (activeTab === 'marketplace') fetchMarketplace();
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'rankings') fetchUsers();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  // Fast Cheat actions mapped from static props to refresh states
  const handleQuickInfieldCoins = () => {
    const updated = user.coins + 2000;
    updateUser({ coins: updated });
    showToast("Cheat: +2.000 KC creditados no saldo local!", "success");
  };

  const handleQuickInfieldXp = () => {
    const updatedLvl = user.level + 1;
    updateUser({ level: updatedLvl, xp: 0 });
    showToast(`Cheat: Lutador evoluído para o nível ${updatedLvl}!`, "success");
  };

  // Filters for user listings
  const filteredUsers = registeredUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchText.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearchText.toLowerCase());
    const matchesBelt = userFilterBelt === 'ALL' || u.belt === userFilterBelt;
    return matchesSearch && matchesBelt;
  });

  return (
    <div className="space-y-6" id="jiuspeak-admin-master">
      {/* Admin Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            <h1 className="font-display font-extrabold text-xl text-slate-100 tracking-wide">
              Torre de Controle & Administração
            </h1>
          </div>
          <p className="text-xs text-slate-450 leading-relaxed max-w-xl">
            Console executivo síncrobano sobre banco de dados PostgreSQL. Moderação ativa de conteúdo, planos de assinantes BJJ, fluxos financeiros PIX e saques instrutores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="p-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold tracking-widest uppercase">
            Diretor Geral
          </span>
          <button 
            onClick={() => { fetchDashboardStats(); showToast("Indicadores de saúde sincronizados!", "info"); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-all"
            title="Atualizar Estatísticas"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tab selectors layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left column: Sidebar Tab selectors */}
        <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/80 self-start md:col-span-1">
          <span className="text-[10px] uppercase text-slate-500 font-mono tracking-wider ml-2.5 mb-1.5 block">Sectores Administrativos</span>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 shrink-0" />
              <span>Painel Central</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4 shrink-0" />
              <span>Atletas & Fichas</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'subscriptions' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Inscrições VIP</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('pix')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'pix' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ArrowDownLeft className="w-4 h-4 shrink-0 animate-pulse text-emerald-400" />
              <span>Depósitos PIX</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'withdrawals' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Saques Instrutores</span>
            </span>
            {dashboardStats?.pendingWithdrawalsVolume > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[8px] scale-90">PENDENTE</span>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'marketplace' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 shrink-0 text-orange-400" />
              <span>Monitoria Market</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'audit' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Registros Gerais</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('rankings')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'rankings' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Award className="w-4 h-4 shrink-0 text-yellow-500" />
              <span>PvP Rankings ELO</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'reports' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Fila de Denúncias</span>
            </span>
            {dashboardStats?.pendingReports > 0 && (
              <span className="bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded text-[8px] shrink-0">{dashboardStats.pendingReports}</span>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right column: Dynamic section output panel */}
        <div className="md:col-span-3 space-y-6">

          {/* ------------------------------------------------------------------------------------------------ */}
          {/* TAB: OVERVIEW */}
          {/* ------------------------------------------------------------------------------------------------ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Executive quick KPIs metrics row */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Cadastros Ativos</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-2xl text-slate-100">{dashboardStats?.totalUsers || registeredUsers.length || '...'}</span>
                    <span className="text-xs text-indigo-400 font-semibold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +12%
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-500 block">Fighters vinculados no Postgres</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Matrículas Premium</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-2xl text-slate-100">{dashboardStats?.activeSubscriptions || subscriptionsList.filter(s => s.status==='ACTIVE').length || '...'} Assinantes</span>
                  </div>
                  <span className="text-[9.5px] text-slate-500 block">Usuários VIP ativos e triando</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Faturamento PIX</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-xl text-emerald-400">
                      R$ {(dashboardStats?.totalPixVolume || 14825.40).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-50 block">Arrecadado com credenciamento</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Saques Requeridos</span>
                  <div className="flex items-baseline gap-2 text-amber-450">
                    <span className="font-display font-extrabold text-2xl">
                      R$ {dashboardStats?.pendingWithdrawalsVolume !== undefined ? Number(dashboardStats.pendingWithdrawalsVolume).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-5 block">Retiradas aguardando homologação</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Pregão do Marketplace</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-2xl text-slate-100">{dashboardStats?.activeMarketItems || '0'} Itens</span>
                  </div>
                  <span className="text-[9.5px] text-slate-51 block">Contratos P2P listados para venda</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Ocorrências pendentes</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`font-display font-extrabold text-2xl ${dashboardStats?.pendingReports > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                      {dashboardStats?.pendingReports || '0'} Denúncias
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-5 block">Relatórios de abusos de conteúdo</span>
                </div>

              </div>

              {/* Graphical Analysis Visualization Mock */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h3 className="font-display font-bold text-xs text-slate-200">📊 Volumetria Financeira & Tráfego Semanal</h3>
                  <span className="text-[10px] text-slate-500 font-mono">SIMULATION LIVE</span>
                </div>

                {/* SVG Pure representation of weekly growth */}
                <div className="h-44 flex items-end justify-between gap-2.5 pt-4 font-mono text-[9px] text-slate-500">
                  <div className="flex flex-col items-center flex-1 gap-1">
                    <div className="w-full bg-indigo-950 border border-indigo-500/20 rounded-t-lg" style={{ height: '55px' }}>
                      <div className="h-full bg-gradient-to-t from-indigo-900 to-indigo-500 opacity-80" />
                    </div>
                    <span>Seg</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 gap-1">
                    <div className="w-full bg-indigo-950 border border-indigo-500/20 rounded-t-lg" style={{ height: '70px' }}>
                      <div className="h-full bg-gradient-to-t from-indigo-900 to-indigo-500 opacity-80" />
                    </div>
                    <span>Ter</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 gap-1">
                    <div className="w-full bg-indigo-950 border border-indigo-500/20 rounded-t-lg" style={{ height: '115px' }}>
                      <div className="h-full bg-gradient-to-t from-indigo-900 to-indigo-500 opacity-80" />
                    </div>
                    <span>Qua</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 gap-1">
                    <div className="w-full bg-indigo-950 border border-indigo-500/20 rounded-t-lg" style={{ height: '90px' }}>
                      <div className="h-full bg-gradient-to-t from-indigo-900 to-indigo-500 opacity-80" />
                    </div>
                    <span>Qui</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 gap-1">
                    <div className="w-full bg-indigo-950 border border-indigo-500/20 rounded-t-lg" style={{ height: '140px' }}>
                      <div className="h-full bg-gradient-to-t from-indigo-900 or from-indigo-500 to-indigo-451 opacity-80" />
                    </div>
                    <span>Sex</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 gap-1 text-slate-300">
                    <div className="w-full bg-indigo-900 border border-indigo-400 rounded-t-lg" style={{ height: '160px' }}>
                      <div className="h-full bg-gradient-to-t from-indigo-650 to-indigo-400 animate-pulse" />
                    </div>
                    <span className="font-bold">Hoje</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-450 text-center italic">
                  Aumento de volume transacional observado de 22% impulsionado pela liberação de medalha "Leão do Pregão".
                </p>
              </div>

              {/* Developer cheats center in overview */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-display font-medium text-xs text-slate-200">Sandbox Administrativo & Simuladores Rápidos</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <button 
                    onClick={handleQuickInfieldCoins}
                    className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left space-y-1 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>MOEDAS VIRTUAIS</span>
                      <Coins className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="font-semibold text-slate-205 text-xs">+2.000 Coins (Local)</p>
                  </button>

                  <button 
                    onClick={handleQuickInfieldXp}
                    className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left space-y-1 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>NÍVEL ATLETA</span>
                      <Award className="w-4 h-4 text-violet-400" />
                    </div>
                    <p className="font-semibold text-slate-205 text-xs">+1 Nível Imediato</p>
                  </button>

                  <button 
                    onClick={handleForceCronSimulate}
                    className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left space-y-1 cursor-pointer transition-all hover:scale-[1.02] col-span-1 sm:col-span-2"
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>CRON JOBS</span>
                      <Play className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                    <p className="font-semibold text-slate-205 text-xs">Simular Recorrência (Cron de Assinaturas)</p>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------------------------------------------ */}
          {/* TAB: USERS (Atletas & Fichas) */}
          {/* ------------------------------------------------------------------------------------------------ */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-slate-200">Fichas Cadastrais de Lutadores</h3>
                  <p className="text-[10px] font-sans text-slate-500">Editores de XP, ELO Arena, Kimono Coins, Stripes de faixa e cargária.</p>
                </div>

                <button 
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
                              <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                                regUser.role === 'ADMIN' 
                                  ? 'bg-rose-500/15 text-rose-450 border border-rose-500/20' 
                                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {regUser.role}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs">
                              <div className="space-y-0.5 font-mono text-[10.5px]">
                                <p className="text-yellow-500 font-semibold">{regUser.coins || 0} KC</p>
                                <p className="text-emerald-400">R$ {(regUser.balanceBRL || 0).toFixed(2)}</p>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right space-x-1 shrink-0">
                              <button 
                                onClick={() => setEditingUser(regUser)}
                                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-750 text-[10px] text-white hover:text-indigo-300 rounded border border-slate-700 cursor-pointer transition-all"
                              >
                                Editar Ficha
                              </button>
                              <button 
                                onClick={() => handleChangeRole(regUser.id, regUser.role)}
                                disabled={regUser.id === user.id}
                                className="p-1 px-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-950 text-[10px] text-slate-400 hover:text-white rounded border border-slate-800 cursor-pointer transition-all"
                              >
                                Cargo
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* ------------------------------------------------------------------------------------------------ */}
          {/* TAB: SUBSCRIPTIONS (Assinaturas Premium) */}
          {/* ------------------------------------------------------------------------------------------------ */}
          {activeTab === 'subscriptions' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h3 className="font-display font-medium text-sm text-slate-205">Painel de Assinantes Premium VIP</h3>
                  <p className="text-[10px] text-slate-500">Contratos de alunos, vigência e faturamento de recorrências.</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleForceCronSimulate}
                    className="p-2 px-3.5 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 border border-emerald-900/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4" /> Rodar Cron
                  </button>

                  <button 
                    onClick={fetchSubscriptions}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all text-slate-400"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {isLoading.subs ? (
                <div className="py-16 text-center text-slate-500 text-xs font-mono">Agregando registros de assinatura...</div>
              ) : subscriptionsList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono italic">Sem assinaturas cadastradas. Simule checkout nas abas de assinaturas de sua conta teste para registrar.</div>
              ) : (
                <div className="overflow-x-auto animate-scaleUp">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 uppercase text-[9px] tracking-wider">
                        <th className="py-2.5 px-3">Assinante</th>
                        <th className="py-2.5 px-3">E-mail</th>
                        <th className="py-2.5 px-3">Plano</th>
                        <th className="py-2.5 px-3">End Date (Status)</th>
                        <th className="py-2.5 px-3 text-right">Diretriz</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {subscriptionsList.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-950/40">
                          <td className="py-3 px-3 font-semibold text-white">{sub.subscriberName}</td>
                          <td className="py-3 px-3 text-slate-450">{sub.subscriberEmail}</td>
                          <td className="py-3 px-3 font-bold text-indigo-400">
                            {sub.planName} <span className="text-[9px] font-normal text-slate-550">(R$ {sub.amountBRL?.toFixed(2)})</span>
                          </td>
                          <td className="py-3 px-3 space-y-1">
                            <p className="text-[11px] text-slate-400">{new Date(sub.endDate).toLocaleDateString()}</p>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                              sub.status === 'ACTIVE' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {sub.status === 'ACTIVE' ? (
                              <button
                                onClick={() => handleSubscriptionAction(sub.id, 'CANCEL')}
                                className="p-1 px-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 rounded text-[10px] cursor-pointer font-bold transition-all"
                              >
                                Cancelar Plano
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSubscriptionAction(sub.id, 'REACTIVATE')}
                                className="p-1 px-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 rounded text-[10px] cursor-pointer font-bold transition-all"
                              >
                                Reativar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------------------------------------ */}
          {/* TAB: PIX DEPOSITS */}
          {/* ------------------------------------------------------------------------------------------------ */}
          {activeTab === 'pix' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h3 className="font-display font-medium text-sm text-slate-205">Monitor de Depósitos Pix das Carteiras</h3>
                  <p className="text-[10px] text-slate-500 font-sans">Arbitre conciliações de PIX gerados externamente e credite moedas automaticamente.</p>
                </div>

                <button 
                  onClick={fetchPixPayments}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all text-slate-450"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoading.pix ? (
                <div className="py-16 text-center text-slate-500 text-xs font-mono">Processando conciliações BACEN...</div>
              ) : pixPaymentsList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono italic">Sem pagamentos gerados nesta sessão.</div>
              ) : (
                <div className="overflow-x-auto text-[11.5px] font-mono whitespace-nowrap">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 uppercase text-[9px] tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Sacado (Atleta)</th>
                        <th className="py-2.5 px-3">Código Txid PIX</th>
                        <th className="py-2.5 px-3">Valor Real</th>
                        <th className="py-2.5 px-3">Tipo</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Ação Conclusiva</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {pixPaymentsList.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-950/40">
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-white">{payment.userName}</p>
                              <p className="text-[9.5px] text-slate-500">{payment.userEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-mono text-[10px]">
                            {payment.txid?.substring(0, 16)}...
                          </td>
                          <td className="py-3 px-3 font-semibold text-emerald-400">
                            R$ {payment.amountBRL?.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-[10px]">
                            <span className="p-0.5 px-1.5 rounded bg-slate-950 text-slate-400 border border-slate-805">
                              {payment.type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold ${
                              payment.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 
                              payment.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse' : 
                              'bg-slate-800 text-slate-500'
                            }`}>
                              {payment.status === 'COMPLETED' ? 'PAGO (BACEN)' : payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {payment.status === 'PENDING' && (
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => handlePixAction(payment.txid, 'APPROVE')}
                                  className="p-1 px-2.5 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 rounded text-[9.5px] cursor-pointer font-bold transition-all uppercase"
                                >
                                  Forçar Pago
                                </button>
                                <button
                                  onClick={() => handlePixAction(payment.txid, 'EXPIRE')}
                                  className="p-1 px-2 bg-slate-800 hover:bg-slate-750 text-slate-400 border border-slate-700 rounded text-[9.5px] cursor-pointer font-bold transition-all uppercase"
                                >
                                  Expirar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------------------------------------ */}
          {/* TAB: WITHDRAWALS (Saques de Professores) */}
          {/* ------------------------------------------------------------------------------------------------ */}
          {activeTab === 'withdrawals' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h3 className="font-display font-medium text-sm text-slate-205">Gestão de Saques & Retiradas BRL</h3>
                  <p className="text-[10px] text-slate-500">Filas de aprovação Pix e auditoria de saldos de instrutores afiliados.</p>
                </div>

                <button 
                  onClick={fetchWithdrawals}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all text-slate-450"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoading.withdrawals ? (
                <div className="py-16 text-center text-slate-500 text-xs font-mono">Indexando pedidos BRL...</div>
              ) : withdrawalsList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono italic">Fila limpa. Aguardando requerimento de retiradas.</div>
              ) : (
                <div className="overflow-x-auto text-[11.5px] font-mono">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 uppercase text-[9px] tracking-wider">
                        <th className="py-2.5 px-3">Favorecido (Professor)</th>
                        <th className="py-2.5 px-3">Dados Pix Destino</th>
                        <th className="py-2.5 px-3">Retirada Requerida</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Pista / Homologação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {withdrawalsList.map((withdraw) => (
                        <tr key={withdraw.id} className="hover:bg-slate-950/40">
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-white">{withdraw.userName || 'Instrutor Associado'}</p>
                              <p className="text-[9.5px] text-slate-500">{withdraw.userEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3 space-y-0.5">
                            <p className="text-slate-200">{withdraw.pixKey}</p>
                            <p className="text-[9px] text-slate-500 uppercase">TIPO: {withdraw.pixKeyType}</p>
                          </td>
                          <td className="py-3 px-3 font-semibold text-amber-500">
                            R$ {Number(withdraw.amountBRL).toFixed(2)}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase ${
                              withdraw.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              withdraw.status === 'PENDING' || withdraw.status === 'PROCESSING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' : 
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {withdraw.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => { setAuditedWithdrawal(withdraw); fetchWithdrawalAudits(withdraw.id); }}
                              className="p-1 px-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded text-[10px] cursor-pointer transition-all border border-slate-805"
                              title="Ver Auditoria"
                            >
                              Auditar Track
                            </button>
                            
                            {(withdraw.status === 'PENDING' || withdraw.status === 'PROCESSING') && (
                              <button
                                onClick={() => { setReviewingWithdrawal({ ...withdraw, action: 'APPROVE' }); setReviewNotes(''); }}
                                className="p-1 px-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-450 border border-emerald-900/30 rounded text-[10px] cursor-pointer font-bold transition-all uppercase"
                              >
                                Decidir
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------------------------------------ */}
          {/* TAB: MARKETPLACE MONITORING */}
          {/* ------------------------------------------------------------------------------------------------ */}
          {activeTab === 'marketplace' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h3 className="font-display font-medium text-sm text-slate-202">Pregão Geral do Marketplace</h3>
                  <p className="text-[10px] text-slate-500">Verificação de itens anunciados por atletas de kimono a badges de elite.</p>
                </div>

                <button 
                  onClick={fetchMarketplace}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all text-slate-450"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoading.marketplace ? (
                <div className="py-16 text-center text-slate-500 text-xs font-mono">Conectando leiloeiro...</div>
              ) : marketplaceList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono italic">Sem mercadoria ativa no pregão no momento.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-scaleUp">
                  {marketplaceList.map((item) => (
                    <div key={item.id} className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-slate-100 uppercase">{item.name}</h4>
                          <span className="p-0.5 px-2 bg-slate-900 text-yellow-500 rounded text-[9px] font-bold font-mono">
                            {item.priceKC} KC
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">Atleta: {item.sellerName} ({item.sellerEmail})</p>
                        <p className="text-[9.5px] font-mono">RARIDADE: <span className="text-violet-400 font-bold uppercase">{item.rarity}</span></p>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold inline-block leading-none uppercase ${
                          item.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {item.active && (
                        <button
                          onClick={() => handleSuspendListing(item.id)}
                          className="w-full py-1.5 bg-red-950/15 hover:bg-red-950/30 text-red-400 border border-red-900/20 rounded-lg text-[9.5px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <Ban className="w-3.5 h-3.5 text-red-500" /> Remover e Estornar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------------------------------------ */}
          {/* TAB: AUDIT SYSTEM EVENT LOGS */}
          {/* ------------------------------------------------------------------------------------------------ */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h3 className="font-display font-medium text-sm text-slate-205">Sistemas de Auditoria Geral (CCTV Log)</h3>
                  <p className="text-[10px] text-slate-500 font-sans">Histórico em tempo real de eventos operacionais e administrativos.</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={onClearLogs}
                    className="p-1 px-3.5 bg-slate-950 hover:bg-slate-850 text-red-400 hover:text-red-300 border border-slate-800 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Limpar Local
                  </button>
                  <button 
                    onClick={fetchAuditLogs}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all text-slate-450"
                  >
                    <RefreshCcw className="w-3.5 h-3.5 animate-pulse" />
                  </button>
                </div>
              </div>

              {/* Console Logs representation */}
              <div className="bg-slate-955 border border-slate-850 rounded-xl p-4 h-[350px] overflow-y-auto font-mono text-[10px] space-y-2.5">
                
                {/* Fallback to local logs passing from parent if query empty */}
                {generalLogs.length === 0 && auditLogs.length > 0 ? (
                  auditLogs.map(log => (
                    <div key={log.id} className="p-2.5 bg-slate-900/40 rounded border border-slate-850/60 flex items-start gap-2.5 leading-relaxed">
                      <span className="text-[9.5px] text-indigo-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-slate-500 font-bold uppercase shrink-0">[{log.type || 'SYS_LOG'}]</span>
                      <span className="text-slate-350">{log.description}</span>
                    </div>
                  ))
                ) : generalLogs.length === 0 ? (
                  <div className="text-slate-600 italic py-12 text-center">Nenhum evento registrado no arquivo syslog.</div>
                ) : (
                  generalLogs.map(log => (
                    <div key={log.id} className="p-2.5 bg-slate-900/40 rounded border border-slate-850/60 flex items-start gap-2.5 leading-relaxed">
                      <span className="text-[9.5px] text-indigo-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-slate-500 font-bold uppercase shrink-0">[{log.type}]</span>
                      <span className="text-slate-300 flex-1">{log.description} <strong className="text-indigo-451">@{log.actorName}</strong></span>
                    </div>
                  ))
                )}

              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------------------------------ */}
          {/* TAB: PVP RANKINGS ELO */}
          {/* ------------------------------------------------------------------------------------------------ */}
          {activeTab === 'rankings' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h3 className="font-display font-medium text-sm text-slate-205">Calibração de Resultados PvP / ELO</h3>
                  <p className="text-[10px] text-slate-500 font-sans">Ajuste os ratings de competidores e as patentes arbitrariamente.</p>
                </div>

                <button 
                  onClick={fetchUsers}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-450 cursor-pointer hover:bg-slate-850 transition-all"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto text-[11px] font-mono text-slate-300">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 uppercase text-[9px] tracking-wider">
                      <th className="py-2.5 px-3">Atleta Competidor</th>
                      <th className="py-2.5 px-3">Faixa Belts</th>
                      <th className="py-2.5 px-3">Elo Escore Atual</th>
                      <th className="py-2.5 px-3 text-right">Diretoria PvP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-mono">
                    {registeredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">Simule competidores fazendo login no aplicativo.</td>
                      </tr>
                    ) : (
                      registeredUsers.map((regUser) => (
                        <tr key={regUser.id} className="hover:bg-slate-950/40">
                          <td className="py-3 px-3 font-semibold text-white">{regUser.name}</td>
                          <td className="py-3 px-3">
                            <span className="p-0.5 px-2 bg-slate-950 border border-slate-805 rounded uppercase font-bold text-slate-200">
                              {regUser.belt}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-yellow-500">
                            {regUser.elo || 1000} PTS
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleUpdateUserScores(regUser.id, regUser.elo || 1000)}
                              className="p-1 px-3 bg-slate-850 hover:bg-slate-750 text-white rounded text-[10px] cursor-pointer transition-all border border-slate-700"
                            >
                              Modificar ELO
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------------------------------ */}
          {/* TAB: REPORTS (Fila de Denúncias) */}
          {/* ------------------------------------------------------------------------------------------------ */}
          {activeTab === 'reports' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h3 className="font-display font-medium text-sm text-slate-205">Fila de Moderação de Conteúdo (Denúncias)</h3>
                  <p className="text-[10px] text-slate-500">Analise reclamações apresentadas por lutadores ou simulações automatizadas.</p>
                </div>

                <button 
                  onClick={fetchReports}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all text-slate-450"
                  disabled={isLoading.reports}
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isLoading.reports ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {isLoading.reports ? (
                <div className="py-16 text-center text-slate-500 text-xs font-mono">Processando relatórios comunitários...</div>
              ) : reportsList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono italic">Fila vazia! Tatame limpo, sem denúncias pendentes.</div>
              ) : (
                <div className="space-y-4 animate-scaleUp">
                  {reportsList.map((report) => (
                    <div key={report.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0">
                              RECLAMAÇÃO: {report.contentType}
                            </span>
                            <span className="text-slate-500 font-mono text-[9px]">{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-300 font-medium text-xs">
                            Denunciado: <strong className="text-white text-xs">{report.reportedUserName}</strong>
                          </p>
                          <p className="text-[10px] text-slate-500 font-sans">
                            Autor da Denúncia: {report.reporterName} ({report.reporterEmail})
                          </p>
                        </div>

                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold tracking-wider font-mono shrink-0 uppercase ${
                          report.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                          report.status === 'RESOLVED_DELETE' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' :
                          'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                          {report.status === 'RESOLVED_DELETE' ? 'CONTEÚDO DERRUBADO' : report.status}
                        </span>
                      </div>

                      <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1">
                        <span className="text-[9px] text-red-400 font-mono uppercase block">MOTIVO EXPRESSADO:</span>
                        <p className="text-xs font-semibold text-slate-205">{report.reason}</p>
                        <span className="text-[9px] text-slate-500 font-mono uppercase block pt-1.5">PREVIEW DETALHADO DO ALVO:</span>
                        <p className="text-xs text-slate-400 italic">"{report.contentPreview}"</p>
                      </div>

                      {report.status === 'PENDING' && (
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => handleReportDecision(report.id, 'DISMISS')}
                            className="p-1 px-3.5 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white rounded border border-slate-800 cursor-pointer transition-all uppercase font-medium"
                          >
                            Ignorar Notícia
                          </button>
                          <button
                            onClick={() => handleReportDecision(report.id, 'DELETE_CONTENT')}
                            className="p-1 px-3.5 bg-red-950/30 hover:bg-red-950/50 text-[10px] text-red-400 hover:text-red-300 rounded border border-red-900/30 font-bold cursor-pointer transition-all uppercase"
                          >
                            Excluir Conteúdo Nocivo
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ------------------------------------------------------------------------------------------------ */}
      {/* MODAL WINDOW: EDIT USER RECORD */}
      {/* ------------------------------------------------------------------------------------------------ */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp shadow-2xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-display font-extrabold text-sm text-slate-201 tracking-wide flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Parametrizar Ficha de Atleta: {editingUser.name}</span>
              </h4>
              <button 
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
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer text-center"
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

      {/* ------------------------------------------------------------------------------------------------ */}
      {/* MODAL WINDOW: EDIT WITHDRAWAL ACTION REVIEW */}
      {/* ------------------------------------------------------------------------------------------------ */}
      {reviewingWithdrawal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp shadow-2xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <h5 className="font-display font-medium text-xs text-slate-205 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                <span>Homologar Retirada BRL</span>
              </h5>
              <button 
                onClick={() => setReviewingWithdrawal(null)}
                className="text-slate-400 hover:text-white font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 font-mono space-y-1">
              <p>ID do Caso: <span className="text-slate-450">{reviewingWithdrawal.id?.substring(0, 16)}...</span></p>
              <p>Requerente: <span className="text-white font-bold">{reviewingWithdrawal.userName || 'Asssociado'}</span></p>
              <p>Montante: <span className="text-emerald-400 font-bold">R$ {Number(reviewingWithdrawal.amountBRL).toFixed(2)}</span></p>
              <p>Chave PIX: <span className="text-indigo-400">{reviewingWithdrawal.pixKey}</span></p>
            </div>

            <form onSubmit={handleReviewWithdrawalSubmit} className="space-y-3 text-xs">
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Sua Ação Administrativa:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewingWithdrawal({ ...reviewingWithdrawal, action: 'APPROVE' })}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono font-extrabold uppercase cursor-pointer transition-all text-center ${
                      reviewingWithdrawal.action === 'APPROVE'
                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500'
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    Despachar Pix (Aprovar)
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewingWithdrawal({ ...reviewingWithdrawal, action: 'REJECT' })}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono font-extrabold uppercase cursor-pointer transition-all text-center ${
                      reviewingWithdrawal.action === 'REJECT'
                        ? 'bg-rose-950/30 text-rose-450 border-rose-500'
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    Gargalar (Rejeitar)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block">Motivação / Detalhes de Nota Fiscal:</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Justifique a decisão ou anexe comprovante de despacho Pix..."
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded h-16 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs font-mono resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingWithdrawal(null)}
                  className="flex-1 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 cursor-pointer text-center hover:text-white"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg cursor-pointer text-center"
                >
                  Homologar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------------------------------ */}
      {/* MODAL WINDOW: WITHDRAWAL AUDIT TRACK LOGS */}
      {/* ------------------------------------------------------------------------------------------------ */}
      {auditedWithdrawal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp shadow-2xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 font-mono">
              <h5 className="font-display font-medium text-xs text-slate-205 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-400 animate-pulse" />
                <span>Trilha de Auditoria: {auditedWithdrawal.userName || 'Associado'}</span>
              </h5>
              <button 
                onClick={() => setAuditedWithdrawal(null)}
                className="text-slate-450 hover:text-white font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto font-mono text-[9.5px]">
              {withdrawalAudits.length === 0 ? (
                <div className="text-slate-500 italic py-6 text-center">Nenhum evento registrado nesta track de saques.</div>
              ) : (
                withdrawalAudits.map(track => (
                  <div key={track.id} className="p-2 bg-slate-950 border border-slate-850 rounded text-slate-350 space-y-1">
                    <div className="flex justify-between text-[8px] text-zinc-500">
                      <span>{new Date(track.createdAt).toLocaleString()}</span>
                      <span className="font-bold uppercase text-indigo-400">{track.action}</span>
                    </div>
                    <p className="font-semibold">{track.details}</p>
                    <p className="text-[8px] text-slate-600">IP: {track.ipAddress || '127.0.0.1'} | Ator: {track.actorName || 'Sistema'}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAuditedWithdrawal(null)}
                className="p-1 px-4 bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800 hover:text-white rounded cursor-pointer font-bold font-mono text-[10px]"
              >
                Fechar Painel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
