import React, { useState, useEffect } from 'react';
import {
  Store, CheckCircle, XCircle, Clock, Eye,
  ChevronDown, ChevronUp, Search, Filter,
  Phone, Mail, Instagram, Globe, Package,
  TrendingUp, Users, DollarSign, AlertCircle,
  Plus, Edit, Trash2, ToggleLeft, ToggleRight, X, Save, BarChart3
} from 'lucide-react';

const getToken = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');

const authFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}`, ...(opts.headers || {}) } });

export default function PartnersAdmin() {
  const [tab, setTab] = useState<'applications' | 'stores' | 'orders'>('applications');
  const [applications, setApplications] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const [editingStore, setEditingStore] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingStore, setDeletingStore] = useState<any | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingLoading, setDeletingLoading] = useState(false);

  const [auditStore, setAuditStore] = useState<any | null>(null);
  const [auditData, setAuditData] = useState<any | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'applications') {
        const res = await authFetch('/api/admin/partners/applications');
        if (res.ok) setApplications((await res.json()).applications || []);
      } else if (tab === 'stores') {
        const res = await authFetch('/api/admin/partners/stores');
        if (res.ok) setStores((await res.json()).stores || []);
      } else if (tab === 'orders') {
        const res = await authFetch('/api/admin/partners/orders');
        if (res.ok) setOrders((await res.json()).orders || []);
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      const res = await authFetch(`/api/admin/partners/applications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, reviewNote })
      });
      if (res.ok) {
        showToast(status === 'approved' ? 'Parceiro aprovado!' : 'Solicitação rejeitada.');
        setReviewNote('');
        setExpanded(null);
        fetchData();
      } else {
        showToast('Erro ao processar solicitação', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
    }
    setProcessing(null);
  };

  const handleToggleStore = async (id: string, isActive: boolean) => {
    try {
      const res = await authFetch(`/api/admin/partners/stores/${id}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ isActive: !isActive })
      });
      if (res.ok) {
        showToast(isActive ? 'Loja desativada' : 'Loja ativada');
        fetchData();
      }
    } catch (e) {}
  };

  const handleVerifyStore = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/partners/stores/${id}/verify`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast('Loja verificada com selo!');
        fetchData();
      }
    } catch (e) {}
  };

  const openEditStore = (store: any) => {
    setEditingStore(store);
    setEditForm({
      storeName: store.storeName || '',
      description: store.description || '',
      commission: store.commission ?? 10,
      whatsapp: store.whatsapp || '',
      pixKey: store.pixKey || '',
      instagram: store.instagram || '',
      website: store.website || '',
      category: store.category || 'geral'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingStore) return;
    if (!editForm.storeName) { showToast('Nome da loja é obrigatório', 'error'); return; }
    setSavingEdit(true);
    try {
      const res = await authFetch(`/api/admin/partners/stores/${editingStore.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        showToast('Loja atualizada com sucesso!');
        setEditingStore(null);
        fetchData();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || 'Erro ao salvar', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
    }
    setSavingEdit(false);
  };

  const openDeleteStore = (store: any) => {
    setDeletingStore(store);
    setDeleteConfirmText('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingStore) return;
    if (deleteConfirmText !== deletingStore.storeName) {
      showToast('Digite o nome exato da loja para confirmar', 'error');
      return;
    }
    setDeletingLoading(true);
    try {
      const res = await authFetch(`/api/admin/partners/stores/${deletingStore.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Loja excluída permanentemente.');
        setDeletingStore(null);
        fetchData();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || 'Erro ao excluir', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
    }
    setDeletingLoading(false);
  };

  const openAudit = async (store: any) => {
    setAuditStore(store);
    setAuditData(null);
    setAuditLoading(true);
    try {
      const res = await authFetch(`/api/admin/partners/stores/${store.id}/audit`);
      if (res.ok) {
        setAuditData(await res.json());
      } else {
        showToast('Erro ao carregar auditoria', 'error');
        setAuditStore(null);
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
      setAuditStore(null);
    }
    setAuditLoading(false);
  };

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending:  { label: 'Pendente',  color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',  icon: Clock },
    approved: { label: 'Aprovado',  color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
    rejected: { label: 'Rejeitado', color: 'text-red-400 bg-red-500/10 border-red-500/20',   icon: XCircle },
  };

  const filtered = (list: any[]) =>
    list.filter(item =>
      JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-xl ${
          toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-emerald-900 text-emerald-200 border border-emerald-700'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">🏪</div>
          <div>
            <h2 className="font-black text-white text-lg">Gestão de Parceiros</h2>
            <p className="text-xs text-slate-500 font-mono">Stand Parceiros — Marketplace BRL</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Solicitações', value: applications.length, sub: `${applications.filter(a => a.status === 'pending').length} pendentes`, color: 'text-amber-400', icon: Clock },
          { label: 'Lojas Ativas', value: stores.filter(s => s.isActive).length, sub: `${stores.filter(s => s.isVerified).length} verificadas`, color: 'text-emerald-400', icon: Store },
          { label: 'Pedidos', value: orders.length, sub: `${orders.filter(o => o.status === 'pending').length} pendentes`, color: 'text-blue-400', icon: Package },
          { label: 'Volume Total', value: `R$ ${stores.reduce((a, s) => a + (s.totalSales || 0), 0).toFixed(2)}`, sub: `R$ ${stores.reduce((a, s) => a + (s.platformRevenue || 0), 0).toFixed(2)} de comissão`, color: 'text-violet-400', icon: DollarSign },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-mono uppercase">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`font-black text-xl ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-slate-800 pb-0">
        {[
          { id: 'applications', label: 'Solicitações', count: applications.filter(a => a.status === 'pending').length },
          { id: 'stores', label: 'Lojas Parceiras', count: stores.length },
          { id: 'orders', label: 'Pedidos', count: orders.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
              tab === t.id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                tab === t.id ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tab === 'applications' && (
            <div className="space-y-3">
              {filtered(applications).length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm">
                  <Store className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  Nenhuma solicitação encontrada.
                </div>
              ) : filtered(applications).map((app: any) => {
                const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                const isOpen = expanded === app.id;
                return (
                  <div key={app.id} className={`bg-slate-900/60 border rounded-2xl overflow-hidden transition-all ${
                    app.status === 'pending' ? 'border-amber-900/30' : 'border-slate-800'
                  }`}>
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                      onClick={() => setExpanded(isOpen ? null : app.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">🏪</div>
                        <div>
                          <p className="font-bold text-white text-sm">{app.storeName}</p>
                          <p className="text-xs text-slate-500">{app.name} · {app.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono font-black px-2 py-1 rounded border ${cfg.color}`}>
                          {cfg.label.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500 font-mono hidden sm:block">
                          {new Date(app.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="border-t border-slate-800 p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2">
                            <p className="text-slate-500 font-mono uppercase text-[10px] font-bold">Dados do Solicitante</p>
                            <div className="flex items-center gap-2 text-slate-300"><Mail className="w-3.5 h-3.5 text-slate-500" />{app.email}</div>
                            <div className="flex items-center gap-2 text-slate-300"><Phone className="w-3.5 h-3.5 text-slate-500" />{app.phone}</div>
                            {app.instagram && <div className="flex items-center gap-2 text-slate-300"><Instagram className="w-3.5 h-3.5 text-slate-500" />@{app.instagram}</div>}
                            {app.website && <div className="flex items-center gap-2 text-slate-300"><Globe className="w-3.5 h-3.5 text-slate-500" />{app.website}</div>}
                          </div>
                          <div className="space-y-2">
                            <p className="text-slate-500 font-mono uppercase text-[10px] font-bold">Dados da Loja</p>
                            <p className="text-white font-bold">{app.storeName}</p>
                            <p className="text-slate-400 leading-relaxed">{app.storeDesc}</p>
                            <span className="inline-block bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">{app.category}</span>
                          </div>
                        </div>
                        {app.status === 'pending' && (
                          <div className="space-y-3 pt-2 border-t border-slate-800">
                            <div>
                              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">Nota de revisão (opcional)</label>
                              <textarea
                                value={reviewNote}
                                onChange={e => setReviewNote(e.target.value)}
                                rows={2}
                                placeholder="Ex: Aprovado! Bem-vindo à família JiuSpeak. / Rejeitado pois o produto não está alinhado com nossa comunidade."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 font-sans resize-none"
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleReview(app.id, 'approved')}
                                disabled={processing === app.id}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {processing === app.id ? 'Processando...' : 'APROVAR PARCEIRO'}
                              </button>
                              <button
                                onClick={() => handleReview(app.id, 'rejected')}
                                disabled={processing === app.id}
                                className="flex-1 py-2.5 bg-red-900/40 hover:bg-red-900/60 border border-red-900/30 disabled:bg-slate-700 text-red-400 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                REJEITAR
                              </button>
                            </div>
                          </div>
                        )}
                        {app.status !== 'pending' && app.reviewNote && (
                          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                            <span className="font-bold text-slate-300">Nota: </span>{app.reviewNote}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'stores' && (
            <div className="space-y-3">
              {filtered(stores).length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm">
                  <Store className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  Nenhuma loja cadastrada ainda.
                </div>
              ) : filtered(stores).map((store: any) => (
                <div key={store.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {store.logo ? <img src={store.logo} className="w-full h-full object-cover" /> : <Store className="w-6 h-6 text-amber-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm truncate">{store.storeName}</p>
                          {store.isVerified && <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          {!store.isActive && <span className="text-[10px] text-red-400 font-mono bg-red-500/10 px-1.5 py-0.5 rounded">INATIVA</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{store.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-mono flex-wrap">
                          <span>{store._count?.products || 0} produtos</span>
                          <span>{store.totalOrders || 0} pedidos</span>
                          <span>R$ {(store.totalSales || 0).toFixed(2)} em vendas</span>
                          <span className="text-amber-400">Comissão: {store.commission}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => openAudit(store)}
                        title="Auditoria completa"
                        className="p-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 rounded-lg transition-all"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditStore(store)}
                        title="Editar loja"
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {!store.isVerified && (
                        <button
                          onClick={() => handleVerifyStore(store.id)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-black rounded-lg transition-all"
                        >
                          VERIFICAR
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStore(store.id, store.isActive)}
                        className={`px-3 py-1.5 text-[10px] font-mono font-black rounded-lg transition-all border ${
                          store.isActive
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {store.isActive ? 'DESATIVAR' : 'ATIVAR'}
                      </button>
                      <button
                        onClick={() => openDeleteStore(store)}
                        title="Excluir loja permanentemente"
                        className="p-2 bg-red-900/30 hover:bg-red-900/50 border border-red-900/30 text-red-500 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-3">
              {filtered(orders).length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  Nenhum pedido registrado ainda.
                </div>
              ) : filtered(orders).map((order: any) => (
                <div key={order.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                          order.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                          order.status === 'pending' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                          'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>{order.status?.toUpperCase()}</span>
                        <span className="text-xs text-slate-500 font-mono">{order.id.slice(0,8)}...</span>
                      </div>
                      <p className="text-sm text-white font-bold">{order.product?.name}</p>
                      <p className="text-xs text-slate-500">{order.buyerName} · {order.buyerEmail}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-mono">
                        <span>Loja: {order.store?.storeName}</span>
                        <span>{order.quantity}x R$ {order.unitPrice?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-emerald-400 text-lg">R$ {order.totalPrice?.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Parceiro: R$ {order.partnerAmount?.toFixed(2)}</p>
                      <p className="text-[10px] text-amber-400 font-mono">Comissão: R$ {(order.totalPrice - order.partnerAmount)?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {editingStore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <p className="text-xs text-blue-400 font-mono">Editando loja</p>
                <h3 className="font-black text-white">{editingStore.storeName}</h3>
              </div>
              <button onClick={() => setEditingStore(null)} className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Nome da Loja *</label>
                <input value={editForm.storeName} onChange={e => setEditForm((p: any) => ({ ...p, storeName: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Descrição</label>
                <textarea value={editForm.description} onChange={e => setEditForm((p: any) => ({ ...p, description: e.target.value }))} rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-amber-400 uppercase block mb-1">Comissão JiuSpeak (%)</label>
                  <input type="number" min={0} max={100} step={0.5} value={editForm.commission}
                    onChange={e => setEditForm((p: any) => ({ ...p, commission: e.target.value }))}
                    className="w-full bg-slate-800 border border-amber-700/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Categoria</label>
                  <input value={editForm.category} onChange={e => setEditForm((p: any) => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">WhatsApp</label>
                  <input value={editForm.whatsapp} onChange={e => setEditForm((p: any) => ({ ...p, whatsapp: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Chave PIX</label>
                  <input value={editForm.pixKey} onChange={e => setEditForm((p: any) => ({ ...p, pixKey: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Instagram</label>
                  <input value={editForm.instagram} onChange={e => setEditForm((p: any) => ({ ...p, instagram: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Website</label>
                  <input value={editForm.website} onChange={e => setEditForm((p: any) => ({ ...p, website: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={handleSaveEdit} disabled={savingEdit}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingStore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-900/40 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">⚠️</div>
                <div>
                  <h3 className="font-black text-white">Excluir loja permanentemente</h3>
                  <p className="text-xs text-slate-500">Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Isso vai excluir <strong className="text-white">{deletingStore.storeName}</strong>, todos os seus produtos e o histórico de pedidos. Para confirmar, digite o nome exato da loja abaixo:
              </p>
              <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder={deletingStore.storeName}
                className="w-full bg-slate-800 border border-red-900/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500" />
              <div className="flex gap-3">
                <button onClick={() => setDeletingStore(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all">
                  Cancelar
                </button>
                <button onClick={handleConfirmDelete} disabled={deletingLoading || deleteConfirmText !== deletingStore.storeName}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" />
                  {deletingLoading ? 'Excluindo...' : 'EXCLUIR PERMANENTEMENTE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {auditStore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-violet-900/40 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <p className="text-xs text-violet-400 font-mono">Auditoria completa</p>
                <h3 className="font-black text-white">{auditStore.storeName}</h3>
              </div>
              <button onClick={() => { setAuditStore(null); setAuditData(null); }} className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {auditLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : auditData ? (
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Produtos', value: auditData.summary.totalProducts, sub: `${auditData.summary.activeProducts} ativos`, color: 'text-amber-400' },
                    { label: 'Pedidos', value: auditData.summary.totalOrders, sub: `${auditData.summary.paidOrders} pagos`, color: 'text-blue-400' },
                    { label: 'Vendas Totais', value: `R$ ${auditData.summary.totalSales.toFixed(2)}`, sub: 'bruto', color: 'text-emerald-400' },
                    { label: 'Comissão JiuSpeak', value: `R$ ${auditData.summary.totalPlatformRevenue.toFixed(2)}`, sub: `${auditStore.commission}% por venda`, color: 'text-violet-400' },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                      <p className="text-[10px] text-slate-500 font-mono uppercase">{s.label}</p>
                      <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
                      <p className="text-[9px] text-slate-500">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Repasse total ao parceiro: <strong className="text-emerald-400">R$ {auditData.summary.totalPartnerEarnings.toFixed(2)}</strong></p>
                  <p className="text-xs text-slate-400 mt-1">Pedidos pendentes de pagamento: <strong className="text-amber-400">{auditData.summary.pendingOrders}</strong></p>
                </div>
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase font-bold mb-2">Produtos ({auditData.products.length})</p>
                  {auditData.products.length === 0 ? (
                    <p className="text-xs text-slate-500">Nenhum produto cadastrado.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {auditData.products.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between bg-slate-950/40 rounded-lg px-3 py-2 text-xs">
                          <span className="text-white truncate flex-1">{p.name}</span>
                          <span className="text-emerald-400 font-bold ml-2">R$ {Number(p.price).toFixed(2)}</span>
                          <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded ${p.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                            {p.isActive ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase font-bold mb-2">Histórico de Pedidos ({auditData.orders.length})</p>
                  {auditData.orders.length === 0 ? (
                    <p className="text-xs text-slate-500">Nenhum pedido registrado.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {auditData.orders.map((o: any) => (
                        <div key={o.id} className="flex items-center justify-between bg-slate-950/40 rounded-lg px-3 py-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="text-white truncate">{o.productName || 'Produto removido'}</p>
                            <p className="text-slate-500 text-[10px]">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded mr-2 ${o.paymentStatus === 'paid' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                            {o.paymentStatus === 'paid' ? 'PAGO' : 'PENDENTE'}
                          </span>
                          <span className="text-emerald-400 font-bold">R$ {Number(o.totalPrice || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 text-center text-slate-500 text-sm">Erro ao carregar dados.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
