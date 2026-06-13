/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  RefreshCcw, 
  Ban,
  Check,
  X,
  AlertTriangle,
  Award,
  Layers,
  Settings,
  DollarSign,
  History,
  Terminal,
  Sliders,
  Plus,
  Trash2,
  FileText,
  Percent,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ClipboardList,
  Edit2,
  Lock,
  Unlock,
  BookOpen,
  Eye,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { authFetch } from '../utils/authFetch';
import { useAdmin } from './AdminContext';

type SubSection = 
  | 'applications' 
  | 'pending_products' 
  | 'approvals' 
  | 'categories' 
  | 'finance' 
  | 'commissions' 
  | 'escrow' 
  | 'settings' 
  | 'audits' 
  | 'logs';

export default function Marketplace() {
  const { showToast } = useAdmin();
  
  // Navigation layout sub-section selection
  const [activeSub, setActiveSub] = useState<SubSection>('applications');
  const [isLoading, setIsLoading] = useState(false);

  // Core administrative states
  const [metrics, setMetrics] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    jtToBrlConversionRate: 0.10,
    defaultPlatformCommission: 15,
    escrowDays: 7
  });
  const [settingsHistory, setSettingsHistory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);

  // Action / Form states
  const [noteText, setNoteText] = useState('');
  const [judgingAppId, setJudgingAppId] = useState<string | null>(null);
  const [judgingProdId, setJudgingProdId] = useState<string | null>(null);
  
  // Category CRUD modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });

  // Settings Edit form state
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    jtToBrlConversionRate: 0.10,
    defaultPlatformCommission: 15,
    escrowDays: 7,
    reason: ''
  });

  // Load backend admin datasets
  const fetchAllData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [
        metricsRes,
        appsRes,
        pendingProductsRes,
        categoriesRes,
        settingsRes,
        historyRes,
        logsRes,
        purchasesRes
      ] = await Promise.all([
        authFetch('/api/marketplace/admin/dashboard').then(r => r.json()).catch(() => null),
        authFetch('/api/marketplace/admin/applications').then(r => r.json()).catch(() => []),
        authFetch('/api/marketplace/admin/products/pending').then(r => r.json()).catch(() => []),
        authFetch('/api/marketplace/store/categories').then(r => r.json()).catch(() => []),
        authFetch('/api/marketplace/admin/settings').then(r => r.json()).catch(() => null),
        authFetch('/api/marketplace/admin/settings/history').then(r => r.json()).catch(() => []),
        authFetch('/api/marketplace/admin/audit/logs').then(r => r.json()).catch(() => null),
        authFetch('/api/marketplace/admin/finance/purchases').then(r => r.json()).catch(() => [])
      ]);

      if (metricsRes) setMetrics(metricsRes);
      if (Array.isArray(appsRes)) setApplications(appsRes);
      if (Array.isArray(pendingProductsRes)) setPendingProducts(pendingProductsRes);
      if (Array.isArray(categoriesRes)) setCategories(categoriesRes);
      if (settingsRes) {
        setSettings(settingsRes);
        setSettingsForm({
          jtToBrlConversionRate: Number(settingsRes.jtToBrlConversionRate || 0.10),
          defaultPlatformCommission: Number(settingsRes.defaultPlatformCommission || 15),
          escrowDays: Number(settingsRes.escrowDays || 7),
          reason: ''
        });
      }
      if (Array.isArray(historyRes)) setSettingsHistory(historyRes);
      if (logsRes && Array.isArray(logsRes.logs)) setAuditLogs(logsRes.logs);
      if (Array.isArray(purchasesRes)) setPurchases(purchasesRes);

    } catch (e) {
      console.error("Falha ao puxar telemetria administrativa:", e);
      showToast("Alguns módulos de marketplace falharam na sincronização.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeSub]);

  // Action: Approve or Reject Instructor Candidate
  const handleJudgeApplication = async (appId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await authFetch(`/api/marketplace/admin/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: noteText })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(status === 'APPROVED' ? "Professor homologado com sucesso!" : "Candidatura rejeitada.", "success");
        setJudgingAppId(null);
        setNoteText('');
        fetchAllData(true);
      } else {
        showToast(data.error || "Ocorreu um erro ao avaliar candidatura.", "error");
      }
    } catch {
      showToast("Falha de rede ao julgar inscrição científica.", "error");
    }
  };

  // Action: Approve, Reject, or Request Revision for Course Item Listing
  const handleJudgeProduct = async (prodId: string, action: 'APPROVE' | 'REJECT' | 'REQUEST_REVISION') => {
    try {
      const res = await authFetch(`/api/marketplace/admin/products/${prodId}/judge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: noteText })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Tratamento concedido com sucesso: ${action}!`, "success");
        setJudgingProdId(null);
        setNoteText('');
        fetchAllData(true);
      } else {
        showToast(data.error || "Fracasso ao submeter julgamento físico.", "error");
      }
    } catch {
      showToast("Dificuldade operacional em processar item.", "error");
    }
  };

  // Action: Manual Escrow Reconciliation bypass
  const handleManualReconcile = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/marketplace/admin/finance/reconcile', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Auditoria financeira acionada!", "success");
        fetchAllData(false);
      } else {
        showToast(data.error || "Erro ao acionar conciliação de garantia.", "error");
      }
    } catch {
      showToast("Não foi possível acionar liquidação temporária.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Action: Update configurations and fee rates
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm.reason.trim()) {
      showToast("Forneça uma justificativa formal para audição geral.", "error");
      return;
    }

    setIsUpdatingSettings(true);
    try {
      const res = await authFetch('/api/marketplace/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Configurações financeiras consolidadas com êxito!", "success");
        fetchAllData(true);
      } else {
        showToast(data.error || "Erro de validação operacional.", "error");
      }
    } catch {
      showToast("Sem contato ativo com o provedor de parâmetros.", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // ActionCategory CRUD: Create or Edit Category record
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.slug) {
      showToast("Preencha nome e slug obrigatórios.", "error");
      return;
    }

    try {
      const url = editingCategory 
        ? `/api/marketplace/admin/categories/${editingCategory.id}` 
        : `/api/marketplace/admin/categories`;
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      
      if (res.ok) {
        showToast(editingCategory ? "Categoria atualizada!" : "Categoria inserida no Postgres!", "success");
        setCategoryModalOpen(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', slug: '', description: '', isActive: true });
        fetchAllData(true);
      } else {
        showToast(data.error || "Erro ao salvar categoria.", "error");
      }
    } catch {
      showToast("Falha de rede ao submeter categoria.", "error");
    }
  };

  // Soft Delete a Category
  const handleDeactivateCategory = async (catId: string) => {
    if (!window.confirm("Deseja realmente desativar esta categoria?")) return;
    try {
      const res = await authFetch(`/api/marketplace/admin/categories/${catId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast("Categoria desativada com sucesso.", "success");
        fetchAllData(true);
      } else {
        showToast(data.error || "Não foi possível desativar.", "error");
      }
    } catch {
      showToast("Erro ao tentar desativar categoria.", "error");
    }
  };

  const getSubSectionTitle = (sub: SubSection) => {
    switch (sub) {
      case 'applications': return 'Solicitações de Professor';
      case 'pending_products': return 'Produtos Pendentes';
      case 'approvals': return 'Aprovações & Catálogo';
      case 'categories': return 'Gestão de Categorias';
      case 'finance': return 'Fluxos Financeiros';
      case 'commissions': return 'Divisão de Comissões';
      case 'escrow': return 'Transações em Escrow';
      case 'settings': return 'Parâmetros Operacionais';
      case 'audits': return 'Histórico de Auditoria';
      case 'logs': return 'Registros de Telemetria (CCTV)';
      default: return 'Geral';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 animate-fadeIn" id="admin-marketplace-master-panel">
      
      {/* Module Title Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-400" />
            <h3 className="font-display font-semibold text-sm text-slate-100 uppercase tracking-wide">
              Marketplace Executive Console
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 font-sans font-medium">
            Central de moderação de professores, controle tributário, escrows e auditorias em tempo-real.
          </p>
        </div>

        <button 
          type="button"
          onClick={() => fetchAllData(false)}
          className="p-2 text-xs bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer text-slate-300 rounded-xl flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Sincronizar Banco</span>
        </button>
      </div>

      {/* Telemetry Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
          <p className="text-[9px] uppercase font-mono text-slate-500">Candidaturas Ativas</p>
          <p className="text-xl font-bold font-mono text-slate-100">{metrics?.pendingTeachers ?? applications.length}</p>
          <span className="text-[8px] font-sans text-amber-500 font-medium">Aguardando moderação</span>
        </div>
        <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
          <p className="text-[9px] uppercase font-mono text-slate-500">Cursos Pendentes</p>
          <p className="text-xl font-bold font-mono text-slate-100">{metrics?.pendingProducts ?? pendingProducts.length}</p>
          <span className="text-[8px] font-sans text-amber-500 font-medium">Análise técnica pendente</span>
        </div>
        <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
          <p className="text-[9px] uppercase font-mono text-slate-500">Balanço em Escrow</p>
          <p className="text-base font-bold font-mono text-indigo-400">R$ {(metrics?.volumePendingBRL ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <span className="text-[8px] font-sans text-indigo-500 font-medium">Locked {(metrics?.escrowLockedCount ?? 0)} transações</span>
        </div>
        <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
          <p className="text-[9px] uppercase font-mono text-slate-500">Faturamento Consolidado</p>
          <p className="text-base font-bold font-mono text-emerald-400">R$ {(metrics?.revenueReleasedBRL ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <span className="text-[8px] font-sans text-emerald-500 font-medium">Comitente sobre {metrics?.totalSalesCount ?? 0} downloads</span>
        </div>
      </div>

      {/* Internal Navigation Sub-sections */}
      <div className="flex flex-wrap gap-1 bg-slate-955 p-1 border border-slate-850 rounded-xl overflow-x-auto">
        {(['applications', 'pending_products', 'approvals', 'categories', 'finance', 'commissions', 'escrow', 'settings', 'audits', 'logs'] as SubSection[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveSub(tab);
              setNoteText('');
              setJudgingAppId(null);
              setJudgingProdId(null);
            }}
            className={`p-2 px-3 rounded-lg text-[10.5px] font-mono whitespace-nowrap cursor-pointer transition-all ${
              activeSub === tab 
                ? 'bg-indigo-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {getSubSectionTitle(tab)}
          </button>
        ))}
      </div>

      {/* Main Subpanel Output */}
      {isLoading ? (
        <div className="py-24 text-center font-mono text-xs text-slate-505 space-y-3 animate-pulse bg-slate-950/20 rounded-2xl border border-slate-855">
          <RefreshCcw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
          <span>Sincronizando registros com banco PostgreSQL...</span>
        </div>
      ) : (
        <div className="min-h-[350px]">
          
          {/* SECTION 1: SOLICITAÇÕES DE PROFESSOR */}
          {activeSub === 'applications' && (
            <div className="space-y-4 animate-scaleUp">
              <div className="flex justify-between items-center bg-slate-950/20 p-3 px-4 rounded-xl border border-slate-850">
                <div>
                  <h4 className="text-xs text-slate-100 font-mono font-bold uppercase tracking-wider">Candidaturas de Docentes (Instrutores/Sensei)</h4>
                  <p className="text-[9.5px] text-slate-550">Mapeamento de faixas-pretas cadastrados aguardando verificação de diploma e filiação técnica.</p>
                </div>
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-450 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  {applications.filter(a => a.status === 'PENDING').length} Aguardando
                </span>
              </div>

              {applications.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-2 text-slate-500 bg-slate-950/10">
                  <Award className="w-8 h-8 text-slate-605 mx-auto" />
                  <p className="text-xs font-semibold">Nenhuma candidatura de professor pendente</p>
                  <p className="text-[9px] max-w-xs mx-auto">Todos os cadastros foram julgados e calibrados pelo colegiado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-slate-955 p-5 rounded-xl border border-slate-850 space-y-4">
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="space-y-1 bg-slate-950/10">
                          <p className="text-xs font-bold text-slate-100">{app.user?.name || "Lutador de Jiu-Jitsu"}</p>
                          <p className="text-[10px] font-mono text-slate-400">{app.user?.email || "atleta@corp.com"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-indigo-500/15 border border-indigo-505/30 text-indigo-400 p-0.5 px-2 rounded text-[8.5px] font-bold uppercase">
                              Academia: {app.academy}
                            </span>
                            <span className="bg-slate-900 border border-slate-800 text-slate-400 p-0.5 px-2 rounded text-[8.5px] font-mono">
                              Cadastro: {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {app.status === 'PENDING' ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {judgingAppId === app.id ? (
                              <button
                                type="button"
                                onClick={() => setJudgingAppId(null)}
                                className="p-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 text-[10px] uppercase font-bold rounded-lg cursor-pointer"
                              >
                                Fechar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setJudgingAppId(app.id);
                                  setNoteText(app.adminNotes || '');
                                }}
                                className="bg-indigo-650 hover:bg-indigo-600 text-white p-1.5 px-3 rounded-lg text-[10px] uppercase font-bold cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> Analisar
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className={`p-1 px-2.5 rounded text-[9px] font-bold font-mono tracking-wide ${
                            app.status === 'APPROVED' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {app.status}
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-2">
                        <p className="text-[10px] font-mono text-slate-500">BIOGRAFIA & EXPERIÊNCIA PROFISSIONAL:</p>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">{app.bio}</p>
                        <p className="text-[10.5px] text-slate-400 bg-slate-909 p-2 rounded border border-slate-900 font-sans italic mt-1">
                          <strong className="font-mono text-slate-550 uppercase not-italic text-[9.5px]">Histórico Técnico:</strong> {app.experience}
                        </p>
                      </div>

                      {/* Verification Credentials/Files block */}
                      {app.documents && app.documents.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[9px] uppercase font-mono text-slate-550">Credenciais / Diplomas Anexados:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {app.documents.map((doc: any) => (
                              <a
                                key={doc.id}
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 p-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded-lg text-[10px] text-slate-300 hover:text-white transition-all text-ellipsis overflow-hidden"
                              >
                                <FileText className="w-4 h-4 text-orange-400" />
                                <div className="text-left font-mono truncate">
                                  <p className="font-bold text-slate-200">{doc.documentType}</p>
                                  <p className="text-[8px] text-slate-500 truncate">{doc.fileUrl}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Judgement interactive inline container */}
                      {judgingAppId === app.id && (
                        <div className="border border-indigo-900/30 p-4 bg-indigo-950/10 rounded-xl space-y-3 pt-3">
                          <p className="text-[10px] font-bold text-slate-100 uppercase tracking-wide">Sentença e Notas de Avaliação do Colegiado:</p>
                          <textarea
                            rows={2}
                            placeholder="Adicione observações para o professor (Justificativas caso reprovador ou nota de felicitações se aprovador)..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-201 placeholder-slate-600 text-xs font-sans focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleJudgeApplication(app.id, 'REJECTED')}
                              className="bg-red-955 border border-red-900/30 text-red-400 p-1.5 px-3 rounded text-[10px] font-bold uppercase hover:bg-red-950 cursor-pointer"
                            >
                              Reprovar Candidato
                            </button>
                            <button
                              type="button"
                              onClick={() => handleJudgeApplication(app.id, 'APPROVED')}
                              className="bg-emerald-600 text-white p-1.5 px-3.5 rounded text-[10px] font-bold uppercase hover:bg-emerald-555 cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar Diplomas
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: PRODUTOS PENDENTES */}
          {activeSub === 'pending_products' && (
            <div className="space-y-4 animate-scaleUp">
              <div className="bg-slate-950/20 p-3 px-4 rounded-xl border border-slate-850 flex justify-between items-center">
                <div>
                  <h4 className="text-xs text-slate-100 font-mono font-bold uppercase">Fila de Revisão de Produtos Anunciados</h4>
                  <p className="text-[9.5px] text-slate-550">Mapeamento de rascunhos de aulas digitais pendentes de auditoria regulamentar.</p>
                </div>
                <span className="p-0.5 px-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] rounded font-bold">
                  {pendingProducts.length} PENDENTE(S)
                </span>
              </div>

              {pendingProducts.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-2 text-slate-550 bg-slate-950/10">
                  <CheckCircle2 className="w-8 h-8 text-emerald-505 mx-auto animate-bounce" />
                  <p className="text-xs font-semibold">Tudo tranquilo por aqui!</p>
                  <p className="text-[9px] max-w-xs mx-auto">Nenhum curso ou apostila sob fila de revisão no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingProducts.map((prod) => (
                    <div key={prod.id} className="bg-slate-955 p-5 rounded-xl border border-slate-850 space-y-4">
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-100 uppercase tracking-wide">{prod.title}</p>
                          <p className="text-[9.5px] text-slate-500 font-mono">
                            Sensei ID: {prod.profileId} (Categoria: <span className="text-slate-400 font-bold">{prod.category?.name || "Sem Nome"}</span>)
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="p-0.5 px-2 bg-amber-500/10 border border-amber-505/20 text-amber-400 text-[8.5px] font-mono font-bold">
                              PREÇO: {prod.priceJT} JT
                            </span>
                            <span className="p-0.5 px-2 bg-slate-900 border border-slate-800 text-slate-404 text-[8.5px] font-mono">
                              Módulos: {prod.lessons?.length || 0} aulas
                            </span>
                          </div>
                        </div>

                        {judgingProdId === prod.id ? (
                          <button
                            type="button"
                            onClick={() => setJudgingProdId(null)}
                            className="bg-slate-800 text-slate-350 p-1 px-2.5 rounded text-[10px] uppercase font-bold cursor-pointer"
                          >
                            Fechar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setJudgingProdId(prod.id);
                              setNoteText(prod.adminNotes || '');
                            }}
                            className="bg-indigo-650 hover:bg-indigo-600 text-white p-1.5 px-3 rounded-lg text-[10px] uppercase font-bold cursor-pointer flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> Examinar Item
                          </button>
                        )}
                      </div>

                      {/* Description summary */}
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-900 font-sans">{prod.description}</p>

                      {/* Course Lesson and curriculum roadmap */}
                      {prod.lessons && prod.lessons.length > 0 && (
                        <div className="p-3 bg-slate-900/60 rounded-lg space-y-2 border border-slate-850">
                          <p className="text-[8.5px] font-mono text-slate-505 tracking-wider uppercase">Conteúdo do Currículo / Ementa do Curso:</p>
                          <div className="text-[10px] font-sans divide-y divide-slate-800/40">
                            {prod.lessons.map((lesson: any, idx: number) => (
                              <div key={lesson.id || idx} className="py-1 flex justify-between text-slate-400">
                                <span className="font-semibold truncate">Aula #{idx + 1}: {lesson.title || "Sem título"}</span>
                                <span className="font-mono text-slate-500 shrink-0 select-none ml-2">Video/Material</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Review decision container block */}
                      {judgingProdId === prod.id && (
                        <div className="border border-indigo-900/30 p-4 bg-indigo-950/10 rounded-xl space-y-3">
                          <p className="text-[10px] font-bold text-slate-100 uppercase font-mono">Submeter Análise de Avaliação Mercadológica:</p>
                          <textarea
                            rows={2}
                            placeholder="Escreva observações construtivas ou causa específica para pedir revisão ou recusar..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-201 placeholder-slate-600 text-xs font-sans focus:outline-none focus:border-indigo-500 text-slate-100"
                          />
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleJudgeProduct(prod.id, 'REJECT')}
                              className="bg-red-955 border border-red-900/30 text-red-400 p-1.5 px-3 rounded text-[10px] uppercase font-bold hover:bg-red-900 cursor-pointer"
                            >
                              Recusar Publicação
                            </button>
                            <button
                              type="button"
                              onClick={() => handleJudgeProduct(prod.id, 'REQUEST_REVISION')}
                              className="bg-amber-955 border border-amber-900/30 text-amber-500 p-1.5 px-3 rounded text-[10px] uppercase font-bold hover:bg-amber-900 cursor-pointer"
                            >
                              Pedir Ajustes
                            </button>
                            <button
                              type="button"
                              onClick={() => handleJudgeProduct(prod.id, 'APPROVE')}
                              className="bg-indigo-600 text-white p-1.5 px-3.5 rounded text-[10px] uppercase font-bold hover:bg-indigo-555 cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Validar & Publicar
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: APROVAÇÕES / HISTORICO */}
          {activeSub === 'approvals' && (
            <div className="space-y-4 animate-scaleUp">
              <div className="bg-slate-950/20 p-3 px-4 rounded-xl border border-slate-850">
                <h4 className="text-xs text-slate-100 font-mono font-bold uppercase">Auditoria Geral de Credenciados</h4>
                <p className="text-[9.5px] text-slate-550">Histórico de homologação de instrutores que possuem perfil verificado ativo.</p>
              </div>

              {/* Display approved application entries */}
              <div className="bg-slate-955 border border-slate-850 rounded-xl overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-850 text-slate-400 font-bold uppercase text-[9.5px]">
                      <th className="p-3">Professor</th>
                      <th className="p-3">Academia</th>
                      <th className="p-3">Parecer Admin</th>
                      <th className="p-3">Atualizado Em</th>
                      <th className="p-3 text-center">Status Histórico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-200 text-xs">
                    {applications.filter(a => a.status !== 'PENDING').length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">Sem registros históricos de moderação.</td>
                      </tr>
                    ) : (
                      applications.filter(a => a.status !== 'PENDING').map((historyItem) => (
                        <tr key={historyItem.id} className="hover:bg-slate-900/20">
                          <td className="p-3">
                            <span className="font-bold text-slate-100 block">{historyItem.user?.name}</span>
                            <span className="text-[9px] text-slate-500 block font-mono">{historyItem.user?.email}</span>
                          </td>
                          <td className="p-3 text-slate-400 font-sans">{historyItem.academy}</td>
                          <td className="p-3 text-slate-500 italic text-[10px] max-w-xs truncate" title={historyItem.adminNotes}>
                            {historyItem.adminNotes || "Aprovado via documentação verídica."}
                          </td>
                          <td className="p-3 text-slate-505 text-[10px]">{new Date(historyItem.updatedAt).toLocaleDateString()}</td>
                          <td className="p-3 text-center">
                            <span className={`p-0.5 px-2 bg-slate-900/60 rounded text-[9px] font-bold ${
                              historyItem.status === 'APPROVED' ? 'text-emerald-450' : 'text-red-400'
                            }`}>
                              {historyItem.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: CATEGORIAS (CRUD) */}
          {activeSub === 'categories' && (
            <div className="space-y-4 animate-scaleUp">
              <div className="bg-slate-950/20 p-3 px-4 rounded-xl border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h4 className="text-xs text-slate-100 font-mono font-bold uppercase">Categorias de Cursos & Apostilas</h4>
                  <p className="text-[9.5px] text-slate-550">Mapeamento dinâmico relacional das ramificações de conteúdos educacionais.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', slug: '', description: '', isActive: true });
                    setCategoryModalOpen(true);
                  }}
                  className="bg-indigo-650 hover:bg-indigo-600 text-white font-mono p-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Categoria
                </button>
              </div>

              {/* Categories list table */}
              <div className="bg-slate-955 border border-slate-850 rounded-xl overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 uppercase text-[9.5px] font-bold">
                      <th className="p-3">Nome</th>
                      <th className="p-3">Slug (Identificador)</th>
                      <th className="p-3 col-span-2">Descrição</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-200">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">Nenhuma categoria registrada no banco PostgreSQL.</td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat.id} className={`hover:bg-slate-900/20 ${!cat.isActive ? 'opacity-40' : ''}`}>
                          <td className="p-3 font-bold text-slate-100">{cat.name}</td>
                          <td className="p-3 font-mono text-slate-400">{cat.slug}</td>
                          <td className="p-3 font-sans max-w-sm text-slate-400 truncate" title={cat.description}>{cat.description || "Sem descrição registrada."}</td>
                          <td className="p-3 text-center">
                            <span className={`p-0.5 px-2 rounded text-[8.5px] font-bold uppercase ${
                              cat.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {cat.isActive ? "ATIVO" : "INATIVO"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setCategoryForm({
                                    name: cat.name,
                                    slug: cat.slug,
                                    description: cat.description || '',
                                    isActive: cat.isActive
                                  });
                                  setCategoryModalOpen(true);
                                }}
                                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500 transition-all cursor-pointer"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              
                              {cat.isActive && (
                                <button
                                  type="button"
                                  onClick={() => handleDeactivateCategory(cat.id)}
                                  className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900 transition-all cursor-pointer"
                                  title="Desativar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Category form modal popup inline */}
              {categoryModalOpen && (
                <div className="fixed inset-0 bg-slate-955/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative">
                    
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/15">
                      <h4 className="font-display font-extrabold text-sm text-slate-200 uppercase tracking-wide">
                        {editingCategory ? "Alterar Categoria" : "Nova Categoria do Market"}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryModalOpen(false);
                          setEditingCategory(null);
                        }}
                        className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <form onSubmit={handleCategorySubmit} className="p-4 space-y-4 text-xs font-sans">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono text-slate-500 uppercase block font-bold">Nome da Categoria *</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Treinos Sem Kimono (No-Gi)"
                          className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono text-slate-500 uppercase block font-bold">Slug Único (URL safe) *</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.slug}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                          placeholder="Ex: no-gi-treinos"
                          className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-100 font-mono placeholder-slate-655 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono text-slate-500 uppercase block font-bold">Descrição Detalhada</label>
                        <textarea
                          rows={3}
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Fale um pouco sobre qual é o público alvo de lutadores desta categoria..."
                          className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>

                      {editingCategory && (
                        <div className="flex items-center justify-between p-2 px-3 border border-slate-850 rounded-xl bg-slate-950/60">
                          <span className="text-[10px] font-mono uppercase text-slate-500">Status Operacional:</span>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300">
                            <input
                              type="checkbox"
                              checked={categoryForm.isActive}
                              onChange={(e) => setCategoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
                              className="rounded border-slate-800 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                            />
                            <span>Habilitado / Exponível</span>
                          </label>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryModalOpen(false);
                            setEditingCategory(null);
                          }}
                          className="p-2 px-4 bg-slate-800 text-slate-400 font-bold rounded-xl hover:text-white cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="p-2 px-5 bg-indigo-600 text-white hover:bg-indigo-505 font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                        >
                          {editingCategory ? "Salvar Registro" : "Gravar no Banco"}
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* SECTION 5: FINANCEIRO */}
          {activeSub === 'finance' && (
            <div className="space-y-4 animate-scaleUp">
              <div className="bg-slate-950/20 p-3 px-4 rounded-xl border border-slate-850">
                <h4 className="text-xs text-slate-100 font-mono font-bold uppercase">Transações e Fluxos Financeiros Consolidados</h4>
                <p className="text-[9.5px] text-slate-550">Razão contábil integrado com aquisições de materiais didáticos pelos lutadores.</p>
              </div>

              {/* Interactive full historic transactions list */}
              <div className="bg-slate-955 border border-slate-850 rounded-xl overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 uppercase text-[9.5px] font-bold">
                      <th className="p-3">Comprador</th>
                      <th className="p-3">Item do Market</th>
                      <th className="p-3 text-right">Preço (JT)</th>
                      <th className="p-3 text-right">Total (BRL)</th>
                      <th className="p-3 text-right">Taxa Plat (BRL)</th>
                      <th className="p-3 text-right">Sócio Líquido (BRL)</th>
                      <th className="p-3 text-center">Status Ledger</th>
                      <th className="p-3">Data Compra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-200 text-xs">
                    {purchases.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-500 italic">Nenhuma transação financeira registrada pelo PostgreSQL.</td>
                      </tr>
                    ) : (
                      purchases.map((pur) => (
                        <tr key={pur.id} className="hover:bg-slate-900/20">
                          <td className="p-3 font-sans">
                            <span className="font-bold text-slate-100 block text-xs">{pur.buyer?.name}</span>
                            <span className="text-[9px] text-slate-500 block font-mono">{pur.buyer?.email}</span>
                          </td>
                          <td className="p-3 truncate max-w-xs font-sans text-xs text-slate-300" title={pur.product?.title}>
                            {pur.product?.title}
                          </td>
                          <td className="p-3 text-right font-bold text-amber-500">{pur.priceSpentJT} JT</td>
                          <td className="p-3 text-right font-bold text-slate-100">
                            R$ {Number(pur.totalEquivalentBRL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right text-rose-400 text-[10px]">
                            R$ {Number(pur.platformCommissionBRL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right text-emerald-400 font-bold text-[10.5px]">
                            R$ {Number(pur.teacherNetBRL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`p-0.5 px-1.5 rounded text-[8px] font-bold uppercase inline-block leading-none ${
                              pur.status === 'RELEASED' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}>
                              {pur.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 text-[10px]">{new Date(pur.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 6: COMISSÕES */}
          {activeSub === 'commissions' && (
            <div className="space-y-4 animate-scaleUp font-sans">
              <div className="bg-slate-950/20 p-3 px-4 rounded-xl border border-slate-850">
                <h4 className="text-xs text-slate-100 font-mono font-bold uppercase">Taxação de Comissões & Provas de Repasse</h4>
                <p className="text-[9.5px] text-slate-550">Visualizador e simulador de split tributário de royalties dos Senseis verídicos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Commission split rules card */}
                <div className="bg-slate-955 p-5 rounded-xl border border-slate-850 h-fit space-y-3">
                  <span className="font-mono text-[9px] uppercase text-indigo-400 block tracking-widest font-bold animate-pulse">Tarifamento Padrão</span>
                  <div className="flex justify-between items-baseline border-b border-slate-850 pb-2">
                    <span className="text-2xl font-extrabold font-mono text-slate-100">{settings.defaultPlatformCommission} %</span>
                    <span className="text-[9px] text-slate-500 font-mono">SOBRE VALOR BRL</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Como taxa regulamentar de custódia e intermediação, o Tatame Conectado deduz <strong>{settings.defaultPlatformCommission}%</strong> de todas as faturas convertidas, repassando o líquido para a carteira disponível (wallet) do Sensei.
                  </p>
                  <p className="text-[10px] text-slate-500 italic font-mono pt-1">
                    Equação: [TeacherBalance] = LucroBRL * (1 - {settings.defaultPlatformCommission}/100)
                  </p>
                </div>

                {/* Simulated Revenue breakdown */}
                <div className="bg-slate-955 p-5 rounded-xl border border-slate-850 md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <span className="text-xs uppercase font-mono text-slate-300 font-bold">Simular Partilha de Royalties</span>
                    <span className="text-[9px] bg-slate-900 px-2 py-0.5 text-slate-500 rounded font-mono">Escrituração Direta</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-mono font-bold">Venda Virtual</p>
                      <p className="text-lg font-extrabold font-mono text-amber-500 mt-1">1.000 JT</p>
                      <span className="text-[8.5px] text-slate-500 font-mono">Fictício de Aula</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-mono font-bold">Fideicomisso BRL</p>
                      <p className="text-lg font-extrabold font-mono text-slate-100 mt-1">R$ {(1000 * settings.jtToBrlConversionRate).toFixed(2)}</p>
                      <span className="text-[8.5px] text-slate-500 font-mono">Câmbio R$ {settings.jtToBrlConversionRate}</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 text-center">
                      <p className="text-[9px] text-slate-505 uppercase font-mono font-bold">Royalties plataforma ({settings.defaultPlatformCommission}%)</p>
                      <p className="text-lg font-extrabold font-mono text-rose-450 mt-1">R$ {((1000 * settings.jtToBrlConversionRate) * (settings.defaultPlatformCommission / 100)).toFixed(2)}</p>
                      <span className="text-[8.5px] text-emerald-400 font-mono font-semibold">Livre Sensei: R$ {((1000 * settings.jtToBrlConversionRate) * (1 - settings.defaultPlatformCommission / 100)).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl space-y-1 text-[10px] border border-slate-900 leading-relaxed font-sans text-slate-500">
                    <p className="font-bold text-slate-300 uppercase tracking-wider font-mono text-[9px] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-450" /> Regimento Tributário de Marketplace:
                    </p>
                    <p>
                      1. O valor em moedas JiuTickets (JT) pago pelo aluno-comprador é sacado instantaneamente da carteira do comprador de forma transacional.
                    </p>
                    <p>
                      2. No momento da compra, o voucher é automaticamente lastreado para o real BRL conforme a taxa de conversão estabelecida para saques.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 7: ESCROW */}
          {activeSub === 'escrow' && (
            <div className="space-y-4 animate-scaleUp font-sans">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-955 p-3 px-4 rounded-xl border border-slate-850 gap-3">
                <div>
                  <h4 className="text-xs text-slate-101 font-mono font-bold uppercase flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" /> Detalhes de Garantias Retidas (Escrow)
                  </h4>
                  <p className="text-[9.5px] text-slate-500">Saldo assegurado para dar suporte a estornos ou disputas de alunos compradores.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualReconcile}
                    className="p-1.5 px-3 bg-indigo-650 hover:bg-indigo-600 text-white font-mono rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 uppercase"
                    title="Varre todas as pendências temporizadas para liberação em lote"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Forçar Conciliação
                  </button>
                </div>
              </div>

              {/* Escrow rules callout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-955 p-4 rounded-xl border border-slate-850 space-y-2 h-fit">
                  <p className="font-mono text-[9px] uppercase text-slate-500 font-bold tracking-wider">Período de Retenção Standard</p>
                  <p className="text-2xl font-extrabold text-slate-100 font-mono">{settings?.escrowDays ?? 7} dias</p>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Todos os fundos adquiridos em transações digitais ficam bloqueados por exatamente <strong>{settings?.escrowDays ?? 7} dias</strong> para mitigação de fraudes. Cumprido o lapso temporal, são liberados para solicitação de saques via Pix pelos professores.
                  </p>
                </div>

                {/* List of Escrow Purchases */}
                <div className="md:col-span-2 bg-slate-955 border border-slate-855 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-900 border-b border-slate-850 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase font-mono text-slate-400">Ordens sob custódia fiduciária</span>
                    <span className="text-[9px] font-mono text-slate-500 font-bold">
                      Total Ativos: {purchases.filter(p => p.status === 'PENDING').length}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-850 text-xs text-slate-300">
                    {purchases.filter(p => p.status === 'PENDING').length === 0 ? (
                      <div className="p-8 text-center text-slate-500 italic text-[11px] font-mono">Nenhuma ordem fiduciária sob detenção de carência.</div>
                    ) : (
                      purchases.filter(p => p.status === 'PENDING').map((pur) => {
                        const relDate = new Date(pur.releaseDate);
                        const isOver = new Date() >= relDate;
                        return (
                          <div key={pur.id} className="p-3.5 hover:bg-slate-900/10 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div className="space-y-0.5">
                              <p className="font-sans font-bold text-slate-101 text-xs truncate max-w-xs">{pur.product?.title}</p>
                              <p className="text-[9.5px] font-mono text-amber-500">Valor Líquido: R$ {Number(pur.teacherNetBRL).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                              <p className="text-[9px] font-mono text-slate-500">Adquirido em: {new Date(pur.createdAt).toLocaleString()} por {pur.buyer?.name}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`text-[9px] font-bold block ${isOver ? 'text-emerald-450' : 'text-slate-400'}`}>
                                Liberação: {relDate.toLocaleDateString()}
                              </span>
                              <span className={`text-[8.5px] font-semibold p-0.5 px-1.5 rounded uppercase mt-1 inline-block ${
                                isOver ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-600 border border-slate-850'
                              }`}>
                                {isOver ? 'Pronto p/ Conciliar' : 'Retido temporariamente'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: CONFIGURAÇÕES */}
          {activeSub === 'settings' && (
            <div className="space-y-4 animate-scaleUp font-sans">
              <div className="bg-slate-950/20 p-3 px-4 rounded-xl border border-slate-850">
                <h4 className="text-xs text-slate-101 font-mono font-bold uppercase">Calibragem das Variáveis de Conversão & Repasse</h4>
                <p className="text-[9.5px] text-slate-500">Configuração das taxas cambiais do JiuTicket (JT) em Real (BRL) e prazos fiscais de carência.</p>
              </div>

              <form onSubmit={handleUpdateSettings} className="bg-slate-955 p-6 rounded-xl border border-slate-850 space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Taxa Cambial (JT para BRL) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0.01"
                        value={settingsForm.jtToBrlConversionRate}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, jtToBrlConversionRate: Number(e.target.value) }))}
                        className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[10px] text-slate-500 absolute right-3 top-3.5 font-mono select-none">R$ POR JT</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Comissão da Plataforma (%) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        value={settingsForm.defaultPlatformCommission}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, defaultPlatformCommission: Number(e.target.value) }))}
                        className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[11px] text-slate-500 absolute right-3 top-3.5 font-mono select-none">% RETIDO</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Garantia Escrow (Dias) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        max="90"
                        value={settingsForm.escrowDays}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, escrowDays: Number(e.target.value) }))}
                        className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[11px] text-slate-500 absolute right-3 top-3.5 font-mono select-none">DIAS CARÊNCIA</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1.5 border-t border-slate-900">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold text-amber-500">Motivo formal da alteração / Justificativa *</label>
                  <input
                    type="text"
                    required
                    maxLength={300}
                    placeholder="Ex: Alinhamento de taxas conforme decisão da assembleia de investidores de Junho/2026..."
                    value={settingsForm.reason}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingSettings}
                    className="bg-indigo-650 hover:bg-indigo-600 text-white font-mono p-2 px-5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isUpdatingSettings ? (
                      <span>Salvando...</span>
                    ) : (
                      <>
                        <Sliders className="w-4 h-4" />
                        <span>Reconfigurar Parâmetros</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* SECTION 9: AUDITORIA */}
          {activeSub === 'audits' && (
            <div className="space-y-4 animate-scaleUp font-mono">
              <div className="bg-slate-950/20 p-3 px-4 rounded-xl border border-slate-850 font-sans">
                <h4 className="text-xs text-slate-101 font-mono font-bold uppercase">Auditoria de Parâmetros de Configuração</h4>
                <p className="text-[9.5px] text-slate-500">Histórico de todas as revisões de taxas efetuadas por administradores cadastrados.</p>
              </div>

              {/* Settings history logs table */}
              <div className="bg-slate-955 border border-slate-850 rounded-xl overflow-x-auto text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-bold uppercase text-[9.5px]">
                      <th className="p-3">Data e Hora</th>
                      <th className="p-3">Operador Admin</th>
                      <th className="p-3 text-right">Velho Parâmetro</th>
                      <th className="p-3 text-right text-indigo-400 font-bold">Novo Parâmetro</th>
                      <th className="p-3">Justificativa da Auditoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {settingsHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">Nenhum evento de alteração de taxas catalogado no banco.</td>
                      </tr>
                    ) : (
                      settingsHistory.map((hist) => {
                        let parsedOldStr = "";
                        let parsedNewStr = "";
                        try {
                          const oldV = typeof hist.oldValue === 'string' ? JSON.parse(hist.oldValue) : hist.oldValue;
                          const newV = typeof hist.newValue === 'string' ? JSON.parse(hist.newValue) : hist.newValue;
                          parsedOldStr = `Taxa: ${oldV?.jtToBrlConversionRate || 0} | Com: ${oldV?.defaultPlatformCommission || 0}% | Esc: ${oldV?.escrowDays || 0}d`;
                          parsedNewStr = `Taxa: ${newV?.jtToBrlConversionRate || 0} | Com: ${newV?.defaultPlatformCommission || 0}% | Esc: ${newV?.escrowDays || 0}d`;
                        } catch {
                          parsedOldStr = "Legado";
                          parsedNewStr = "Customizado";
                        }

                        return (
                          <tr key={hist.id} className="hover:bg-slate-900/10">
                            <td className="p-3 text-slate-500 whitespace-nowrap text-[10px]">
                              {new Date(hist.createdAt).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-101 block font-sans">{hist.adminName}</span>
                              <span className="text-[8.5px] text-slate-500 block truncate max-w-[120px]" title={hist.adminEmail}>{hist.adminEmail}</span>
                            </td>
                            <td className="p-3 text-right text-slate-505 text-[10px] whitespace-nowrap">{parsedOldStr}</td>
                            <td className="p-3 text-right font-bold text-indigo-400 text-[10px] whitespace-nowrap">{parsedNewStr}</td>
                            <td className="p-3 text-slate-400 italic font-sans" title={hist.reason}>{hist.reason}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 10: LOGS */}
          {activeSub === 'logs' && (
            <div className="space-y-4 animate-scaleUp font-mono">
              <div className="bg-slate-950/20 p-3 px-4 rounded-xl border border-slate-855 font-sans flex justify-between items-center">
                <div>
                  <h4 className="text-xs text-slate-101 font-bold uppercase flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-orange-400" /> Registros Finos de Depuração (CCTV Log)
                  </h4>
                  <p className="text-[9.5px] text-slate-500">Audit logs brutos de todas as concessões, compras e transações de conteúdo.</p>
                </div>
                <span className="bg-slate-900 border border-slate-800 text-slate-550 text-[9px] px-2 py-0.5 rounded font-bold">
                  {auditLogs.length} EVENTOS
                </span>
              </div>

              {/* Raw parsed logs logger console */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10.5px] leading-relaxed max-h-[400px] overflow-y-auto space-y-2 select-text shadow-inner">
                {auditLogs.length === 0 ? (
                  <p className="text-slate-500 italic hover:opacity-100">Não há registros forenses no arquivo de logs de auditoria do marketplace.</p>
                ) : (
                  auditLogs.map((log, index) => {
                    const isSystem = log.actor?.name?.toLowerCase().includes('global') || log.actor?.name?.toLowerCase().includes('sistema');
                    return (
                      <p key={log.id || index} className="text-slate-300 hover:text-white hover:bg-slate-900/60 p-1.5 rounded transition-all border-b border-slate-900/40">
                        <span className="text-slate-500 mr-2" title="Hora do Registro">[{new Date(log.timestamp || log.createdAt || Date.now()).toLocaleString()}]</span>
                        <span className="text-indigo-405 font-bold mr-2" title="Gatilho de Evento">&gt; {log.eventType ?? "EVENT_SÍNCRONO_SYS"}</span>
                        <span className="p-0.5 px-1 bg-slate-900 text-amber-500 border border-slate-800 rounded tracking-wide text-[9px] mr-2 shrink-0 font-bold">
                          {isSystem ? "SISTEMA" : log.actor?.name}
                        </span>
                        <span className="text-slate-300 font-sans leading-normal text-[11.5px]">{log.message || "Ação de auditoria registrada no marketplace."}</span>
                        {log.details && (
                          <span className="text-slate-605 font-mono text-[9px] ml-1 select-none" title={JSON.stringify(log.details)}>
                            (hash: {String(log.id).slice(0, 8)})
                          </span>
                        )}
                      </p>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* FOOTER AUDITING TAGLINE info */}
      <div className="bg-slate-955 border border-slate-850 p-3 rounded-xl flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>Tatame Conectado Administration Module v2.05 (PIX & Crypto Escrow)</span>
        <span className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
          <span>PostgreSQL Estável</span>
        </span>
      </div>

    </div>
  );
}
