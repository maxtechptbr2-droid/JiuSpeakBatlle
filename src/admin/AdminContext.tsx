/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuditLog } from '../types';

export interface AdminContextType {
  user: UserProfile;
  updateUser: (newUser: Partial<UserProfile>) => void;
  auditLogs: AuditLog[];
  onClearLogs: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  dashboardStats: any;
  registeredUsers: any[];
  subscriptionsList: any[];
  pixPaymentsList: any[];
  withdrawalsList: any[];
  marketplaceList: any[];
  generalLogs: any[];
  reportsList: any[];

  isLoading: Record<string, boolean>;
  userSearchText: string;
  setUserSearchText: (text: string) => void;
  userFilterBelt: string;
  setUserFilterBelt: (belt: string) => void;

  editingUser: any;
  setEditingUser: (u: any) => void;
  reviewingWithdrawal: any;
  setReviewingWithdrawal: (w: any) => void;
  auditedWithdrawal: any;
  setAuditedWithdrawal: (w: any) => void;
  withdrawalAudits: any[];
  reviewNotes: string;
  setReviewNotes: (notes: string) => void;

  fetchDashboardStats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  handleChangeRole: (targetId: string, currentRole: string) => Promise<void>;
  handleUpdateUsersProfile: (e: React.FormEvent) => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
  handleSubscriptionAction: (subId: string, action: 'CANCEL' | 'REACTIVATE') => Promise<void>;
  handleForceCronSimulate: () => Promise<void>;
  fetchPixPayments: () => Promise<void>;
  handlePixAction: (pixId: string, action: 'APPROVE' | 'EXPIRE') => Promise<void>;
  fetchWithdrawals: () => Promise<void>;
  fetchWithdrawalAudits: (wId: string) => Promise<void>;
  handleReviewWithdrawalSubmit: (e: React.FormEvent) => Promise<void>;
  fetchMarketplace: () => Promise<void>;
  handleSuspendListing: (listingId: string) => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  handleUpdateUserScores: (userId: string, currentElo: number) => Promise<void>;
  handleApproveUser: (userId: string) => Promise<void>;
  fetchReports: () => Promise<void>;
  handleReportDecision: (reportId: string, decision: 'DISMISS' | 'DELETE_CONTENT') => Promise<void>;

  handleQuickInfieldCoins: () => void;
  handleQuickInfieldXp: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }
  return context;
}

interface AdminProviderProps {
  user: UserProfile;
  updateUser: (newUser: Partial<UserProfile>) => void;
  auditLogs: AuditLog[];
  onClearLogs: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  children: React.ReactNode;
}

export function AdminProvider({
  user,
  updateUser,
  auditLogs,
  onClearLogs,
  showToast,
  children
}: AdminProviderProps) {
  // Tab control state (Default: 'overview' in Admin, which maps to 'Dashboard')
  const [activeTab, setActiveTab] = useState<string>('overview');

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

  // Modals / payload states
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

  const handleApproveUser = async (targetId: string) => {
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: targetId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Professor Administrador aprovado com sucesso!", "success");
        fetchUsers();
        fetchDashboardStats();
      } else {
        showToast(data.error || "Erro ao aprovar usuário.", "error");
      }
    } catch (err) {
      showToast("Erro ao contatar servidor de aprovação.", "error");
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

  // Sync data depending on activeTab change
  useEffect(() => {
    fetchDashboardStats();

    if (activeTab === 'overview') {
      // already loading stats
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    } else if (activeTab === 'payments') {
      fetchPixPayments();
      fetchWithdrawals();
    } else if (activeTab === 'marketplace') {
      fetchMarketplace();
    } else if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'audit-logs') {
      fetchAuditLogs();
    } else if (activeTab === 'settings') {
      fetchUsers();
    }
  }, [activeTab]);

  return (
    <AdminContext.Provider value={{
      user,
      updateUser,
      auditLogs,
      onClearLogs,
      showToast,

      activeTab,
      setActiveTab,

      dashboardStats,
      registeredUsers,
      subscriptionsList,
      pixPaymentsList,
      withdrawalsList,
      marketplaceList,
      generalLogs,
      reportsList,

      isLoading,
      userSearchText,
      setUserSearchText,
      userFilterBelt,
      setUserFilterBelt,

      editingUser,
      setEditingUser,
      reviewingWithdrawal,
      setReviewingWithdrawal,
      auditedWithdrawal,
      setAuditedWithdrawal,
      withdrawalAudits,
      reviewNotes,
      setReviewNotes,

      fetchDashboardStats,
      fetchUsers,
      handleChangeRole,
      handleUpdateUsersProfile,
      handleApproveUser,
      fetchSubscriptions,
      handleSubscriptionAction,
      handleForceCronSimulate,
      fetchPixPayments,
      handlePixAction,
      fetchWithdrawals,
      fetchWithdrawalAudits,
      handleReviewWithdrawalSubmit,
      fetchMarketplace,
      handleSuspendListing,
      fetchAuditLogs,
      handleUpdateUserScores,
      fetchReports,
      handleReportDecision,

      handleQuickInfieldCoins,
      handleQuickInfieldXp
    }}>
      {children}
    </AdminContext.Provider>
  );
}
