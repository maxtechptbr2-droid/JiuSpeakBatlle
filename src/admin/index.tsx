/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCcw, 
  Cpu, 
  User as UserIcon, 
  UserCheck, 
  DollarSign, 
  ShoppingCart, 
  ShieldAlert as AlertIcon, 
  Terminal, 
  Sliders, 
  ChevronRight 
} from 'lucide-react';
import { UserProfile, AuditLog } from '../types';
import { AdminProvider, useAdmin } from './AdminContext';

// Lazy loading sub-modules using dynamic imports
const DashboardModule = lazy(() => import('./Dashboard'));
const UsersModule = lazy(() => import('./Users'));
const PaymentsModule = lazy(() => import('./Payments'));
const MarketplaceModule = lazy(() => import('./Marketplace'));
const SubscriptionsModule = lazy(() => import('./Subscriptions'));
const ReportsModule = lazy(() => import('./Reports'));
const AuditLogsModule = lazy(() => import('./AuditLogs'));
const SettingsModule = lazy(() => import('./Settings'));

interface AdminEntryProps {
  user: UserProfile;
  auditLogs: AuditLog[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  onClearLogs: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

// Inner router that selects component based on activeTab state
function AdminPanelShell() {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    dashboardStats, 
    fetchDashboardStats, 
    showToast 
  } = useAdmin();

  // Enforce Protected Route: Check for administrator privileges
  const isAuthorized = user.role === 'admin' || user.role === 'ADMIN';
  if (!isAuthorized) {
    return (
      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xl animate-fadeIn">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
        <h2 className="font-display font-extrabold text-lg text-slate-100">Acesso Restrito / Bloqueado</h2>
        <p className="text-xs text-slate-450 leading-relaxed">
          Apenas lutadores com cargo de ADMIN ou DIREÇÃO estão autorizados a acessar este console de controle corporativo. Seu cargo atual é: <span className="p-0.5 px-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold uppercase">{user.role}</span>.
        </p>
      </div>
    );
  }

  // Helper inside shell to render components lazy loaded with fallback suspense
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardModule />;
      case 'users':
        return <UsersModule />;
      case 'subscriptions':
        return <SubscriptionsModule />;
      case 'payments':
        return <PaymentsModule />;
      case 'marketplace':
        return <MarketplaceModule />;
      case 'reports':
        return <ReportsModule />;
      case 'audit-logs':
        return <AuditLogsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  const handleManualSync = () => {
    fetchDashboardStats();
    showToast("Indicadores de saúde sincronizados com sucesso!", "info");
  };

  return (
    <div className="space-y-6" id="jiuspeak-admin-master">
      {/* Admin Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h1 className="font-display font-extrabold text-xl text-slate-100 tracking-wide">
              Torre de Controle & Administração
            </h1>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-sans">
            Console executivo síncrobano sobre banco de dados PostgreSQL. Moderação ativa de conteúdo, planos de assinantes BJJ, fluxos financeiros PIX e saques instrutores.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="p-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold tracking-widest uppercase">
            Diretor Geral
          </span>
          <button 
            type="button"
            onClick={handleManualSync}
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
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5 font-sans font-semibold">
              <Cpu className="w-4 h-4 shrink-0 text-slate-300" />
              <span>Painel Central</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5 font-sans font-semibold">
              <UserIcon className="w-4 h-4 shrink-0 text-slate-300" />
              <span>Atletas & Fichas</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'subscriptions' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5 font-sans font-semibold">
              <UserCheck className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Inscrições VIP</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'payments' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5 font-sans font-semibold">
              <DollarSign className="w-4 h-4 shrink-0 text-emerald-400 animate-pulse" />
              <span>Fluxos Financeiros</span>
            </span>
            {dashboardStats?.pendingWithdrawalsVolume > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[8px] scale-90 select-none">PENDENTE</span>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('marketplace')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'marketplace' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5 font-sans font-semibold">
              <ShoppingCart className="w-4 h-4 shrink-0 text-orange-400" />
              <span>Monitoria Market</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'reports' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5 font-sans font-semibold">
              <AlertIcon className="w-4 h-4 shrink-0 text-rose-500" />
              <span>Fila de Denúncias</span>
            </span>
            {dashboardStats?.pendingReports > 0 && (
              <span className="bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded text-[8px] shrink-0 select-none">{dashboardStats.pendingReports}</span>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit-logs')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'audit-logs' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5 font-sans font-semibold">
              <Terminal className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Registros CCTV</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-indigo-650 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-205 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5 font-sans font-semibold">
              <Sliders className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Configurações</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right column: Dynamic section output panel */}
        <div className="md:col-span-3 space-y-6">
          <Suspense fallback={
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-xs font-mono text-slate-500 animate-pulse py-24">
              <div className="flex flex-col items-center justify-center gap-3">
                <RefreshCcw className="w-6 h-6 animate-spin text-slate-400" />
                <span>Indexando módulo administrativo...</span>
              </div>
            </div>
          }>
            {renderTabContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Wrapper export that wraps the page in AdminProvider
export default function AdminPanel({
  user,
  auditLogs,
  updateUser,
  onClearLogs,
  showToast
}: AdminEntryProps) {
  return (
    <AdminProvider
      user={user}
      auditLogs={auditLogs}
      updateUser={updateUser}
      onClearLogs={onClearLogs}
      showToast={showToast}
    >
      <AdminPanelShell />
    </AdminProvider>
  );
}
