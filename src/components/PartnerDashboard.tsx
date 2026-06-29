import React, { useState, useEffect, useRef } from 'react';
import {
  Store, Package, ShoppingBag, DollarSign, TrendingUp,
  Plus, Edit, Trash2, Eye, EyeOff, Upload, X, Save,
  CheckCircle, Clock, AlertCircle, ArrowLeft, Image,
  Tag, Layers, ToggleLeft, ToggleRight, Star, Truck
} from 'lucide-react';

const getToken = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
const authFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, { ...opts, headers: { 'Authorization': `Bearer ${getToken()}`, ...(opts.headers || {}) } });

const CATEGORIES = [
  { id: 'kimonos', label: 'Kimonos & Gi', emoji: '🥋' },
  { id: 'no-gi', label: 'No-Gi', emoji: '👊' },
  { id: 'acessorios', label: 'Acessórios', emoji: '🎽' },
  { id: 'suplementos', label: 'Suplementos', emoji: '💊' },
  { id: 'livros', label: 'Livros & Cursos', emoji: '📚' },
  { id: 'equipamentos', label: 'Equipamentos', emoji: '🏋️' },
  { id: 'geral', label: 'Geral', emoji: '📦' },
];

interface PartnerDashboardProps {
  user: any;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function PartnerDashboard({ user, showToast }: PartnerDashboardProps) {
  const [tab, setTab] = useState<'overview' | 'products' | 'orders' | 'store'>('overview');
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noStore, setNoStore] = useState(false);

  // Form produto
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: 'geral', stock: '', images: [] as string[], isFeatured: false, tags: ''
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form loja
  const [storeForm, setStoreForm] = useState<any>({});
  const [savingStore, setSavingStore] = useState(false);

  useEffect(() => { fetchStore(); }, []);

  const fetchStore = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/partner/my-store');
      const data = await res.json();
      if (data.success && data.store) {
        setStore(data.store);
        setStoreForm(data.store);
        fetchProducts(data.store.id);
        fetchOrders(data.store.id);
      } else {
        setNoStore(true);
      }
    } catch (e) { setNoStore(true); }
    setLoading(false);
  };

  const fetchProducts = async (storeId: string) => {
    try {
      const res = await authFetch(`/api/partner/products?storeId=${storeId}`);
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
    } catch (e) {}
  };

  const fetchOrders = async (storeId: string) => {
    try {
      const res = await authFetch(`/api/partner/orders?storeId=${storeId}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
    } catch (e) {}
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'product');
      const res = await fetch('/api/admin/upload-media', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setProductForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
        showToast('Imagem enviada!', 'success');
      } else {
        showToast('Erro ao enviar imagem', 'error');
      }
    } catch (e) { showToast('Erro de conexão', 'error'); }
    setUploadingImage(false);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.stock) {
      showToast('Preencha nome, preço e estoque', 'error');
      return;
    }
    setSavingProduct(true);
    try {
      const payload = {
        ...productForm,
        storeId: store.id,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        stock: parseInt(productForm.stock),
        tags: productForm.tags ? productForm.tags.split(',').map((t: string) => t.trim()) : [],
        id: editingProduct?.id
      };
      const res = await authFetch('/api/partner/products/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingProduct ? 'Produto atualizado!' : 'Produto criado!', 'success');
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', originalPrice: '', category: 'geral', stock: '', images: [], isFeatured: false, tags: '' });
        fetchProducts(store.id);
      } else {
        showToast(data.error || 'Erro ao salvar produto', 'error');
      }
    } catch (e) { showToast('Erro de conexão', 'error'); }
    setSavingProduct(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que quer excluir este produto?')) return;
    try {
      const res = await authFetch(`/api/partner/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Produto excluído!', 'success');
        fetchProducts(store.id);
      }
    } catch (e) { showToast('Erro ao excluir', 'error'); }
  };

  const handleToggleProduct = async (id: string, isActive: boolean) => {
    try {
      await authFetch(`/api/partner/products/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });
      fetchProducts(store.id);
    } catch (e) {}
  };

  const handleSaveStore = async () => {
    setSavingStore(true);
    try {
      const res = await authFetch('/api/partner/store/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...storeForm, id: store.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Loja atualizada!', 'success');
        setStore({ ...store, ...storeForm });
      } else {
        showToast(data.error || 'Erro ao salvar', 'error');
      }
    } catch (e) { showToast('Erro de conexão', 'error'); }
    setSavingStore(false);
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      category: product.category,
      stock: String(product.stock),
      images: product.images || [],
      isFeatured: product.isFeatured,
      tags: (product.tags || []).join(', ')
    });
    setShowProductForm(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  if (noStore) {
    const isApproved = (user as any).partnerApplicationStatus === 'approved';
    const isPending = (user as any).partnerApplicationStatus === 'pending';
    const [setupForm, setSetupForm] = React.useState({ storeName: user?.name || '', description: '', whatsapp: '', pixKey: '' });
    const [creatingStore, setCreatingStore] = React.useState(false);
    const handleCreateStore = async () => {
      if (!setupForm.storeName) { showToast('Informe o nome da loja', 'error'); return; }
      setCreatingStore(true);
      try {
        const res = await authFetch('/api/partner/create-store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setupForm)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Loja criada com sucesso! Bem-vindo ao JiuSpeak Partners! 🏪', 'success');
          fetchStore();
        } else {
          showToast(data.error || 'Erro ao criar loja', 'error');
        }
      } catch (e) { showToast('Erro de conexão', 'error'); }
      setCreatingStore(false);
    };
    if (!isApproved) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl">🏪</div>
        <div>
          <h2 className="font-black text-white text-xl mb-2">Você ainda não tem uma loja</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {isPending ? 'Sua solicitação está em análise pela equipe JiuSpeak. Aguarde até 48h.' : 'Para ter acesso ao painel do parceiro, sua solicitação precisa ser aprovada pela equipe JiuSpeak.'}
          </p>
        </div>
        <div className={`border rounded-2xl p-4 w-full text-left space-y-2 ${isPending ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-900/60 border-slate-800'}`}>
          <p className="text-xs font-mono text-amber-400 uppercase font-bold">Status:</p>
          <p className="text-sm text-slate-300">{isPending ? '⏳ Em análise — aguarde até 48h' : '❌ Nenhuma solicitação. Acesse Stand Parceiros para se inscrever.'}</p>
        </div>
      </div>
    );
    return (
      <div className="max-w-lg mx-auto space-y-6 py-8">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl mx-auto">🏪</div>
          <h2 className="font-black text-white text-xl">Configure sua loja</h2>
          <p className="text-slate-400 text-sm">Sua solicitação foi aprovada! Agora configure sua loja para começar a vender.</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs font-mono text-amber-400 uppercase font-bold block mb-1">Nome da Loja *</label>
            <input value={setupForm.storeName} onChange={e => setSetupForm(p => ({...p, storeName: e.target.value}))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="Ex: BJJ Store Brasil" />
          </div>
          <div>
            <label className="text-xs font-mono text-amber-400 uppercase font-bold block mb-1">Descrição</label>
            <textarea value={setupForm.description} onChange={e => setSetupForm(p => ({...p, description: e.target.value}))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 resize-none h-20"
              placeholder="Descreva sua loja em poucas palavras..." />
          </div>
          <div>
            <label className="text-xs font-mono text-amber-400 uppercase font-bold block mb-1">WhatsApp</label>
            <input value={setupForm.whatsapp} onChange={e => setSetupForm(p => ({...p, whatsapp: e.target.value}))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="(11) 99999-9999" />
          </div>
          <div>
            <label className="text-xs font-mono text-amber-400 uppercase font-bold block mb-1">Chave PIX</label>
            <input value={setupForm.pixKey} onChange={e => setSetupForm(p => ({...p, pixKey: e.target.value}))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="CPF, CNPJ, email ou chave aleatória" />
          </div>
          <button onClick={handleCreateStore} disabled={creatingStore}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all cursor-pointer disabled:opacity-50">
            {creatingStore ? 'Criando...' : '🏪 Criar Minha Loja'}
          </button>
        </div>
      </div>
    );
  }

  // FORM DE PRODUTO
  if (showProductForm) return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-mono transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para produtos
      </button>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
        <h3 className="font-black text-white text-lg">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Nome do produto *</label>
            <input type="text" value={productForm.name}
              onChange={e => setProductForm({...productForm, name: e.target.value})}
              placeholder="Ex: Kimono BJJ Competição A2"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
          </div>
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Preço (R$) *</label>
            <input type="number" step="0.01" value={productForm.price}
              onChange={e => setProductForm({...productForm, price: e.target.value})}
              placeholder="0.00"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
          </div>
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Preço original (R$) — opcional</label>
            <input type="number" step="0.01" value={productForm.originalPrice}
              onChange={e => setProductForm({...productForm, originalPrice: e.target.value})}
              placeholder="Para mostrar desconto"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
          </div>
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Estoque *</label>
            <input type="number" value={productForm.stock}
              onChange={e => setProductForm({...productForm, stock: e.target.value})}
              placeholder="Ex: 10"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
          </div>
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Categoria *</label>
            <select value={productForm.category}
              onChange={e => setProductForm({...productForm, category: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Descrição *</label>
            <textarea value={productForm.description}
              onChange={e => setProductForm({...productForm, description: e.target.value})}
              rows={4} placeholder="Descreva o produto em detalhes..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Tags (separadas por vírgula)</label>
            <input type="text" value={productForm.tags}
              onChange={e => setProductForm({...productForm, tags: e.target.value})}
              placeholder="Ex: kimono, competição, A2, azul"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
          </div>
        </div>

        {/* Upload de imagens */}
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase block mb-2">Imagens do produto</label>
          <div className="flex flex-wrap gap-3">
            {productForm.images.map((img: string, i: number) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                <img src={img} className="w-full h-full object-cover" />
                <button
                  onClick={() => setProductForm(prev => ({ ...prev, images: prev.images.filter((_: any, idx: number) => idx !== i) }))}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingImage}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-amber-400 transition-all">
              {uploadingImage ? (
                <div className="w-5 h-5 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="text-[9px] font-mono">Adicionar</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>

        {/* Destaque */}
        <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div>
            <p className="text-sm font-bold text-white">Produto em destaque</p>
            <p className="text-xs text-slate-500">Aparece no topo da vitrine</p>
          </div>
          <button
            onClick={() => setProductForm(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
            className={`w-12 h-6 rounded-full transition-all relative ${productForm.isFeatured ? 'bg-amber-500' : 'bg-slate-700'}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${productForm.isFeatured ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        <button
          onClick={handleSaveProduct}
          disabled={savingProduct}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-black font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {savingProduct ? 'Salvando...' : (editingProduct ? 'Salvar alterações' : 'Criar produto')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header da loja */}
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-900/20 rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
            {store.logo ? <img src={store.logo} className="w-full h-full object-cover" /> : <Store className="w-7 h-7 text-amber-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-white text-lg">{store.storeName}</h2>
              {store.isVerified && <CheckCircle className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-xs text-slate-500 font-mono">Comissão: {store.commission}% · {products.length} produtos</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border ${store.isActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
          {store.isActive ? 'ATIVA' : 'INATIVA'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Produtos', value: products.length, sub: `${products.filter(p => p.isActive).length} ativos`, color: 'text-amber-400', icon: Package },
          { label: 'Pedidos', value: orders.length, sub: `${orders.filter(o => o.status === 'pending').length} pendentes`, color: 'text-blue-400', icon: ShoppingBag },
          { label: 'Vendas', value: `R$ ${orders.filter(o => o.paymentStatus === 'paid').reduce((a: number, o: any) => a + o.partnerAmount, 0).toFixed(2)}`, sub: 'líquido (após comissão)', color: 'text-emerald-400', icon: DollarSign },
          { label: 'Total pedidos', value: orders.reduce((a: number, o: any) => a + o.totalPrice, 0).toFixed(2), sub: 'em BRL', color: 'text-violet-400', icon: TrendingUp },
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {[
          { id: 'overview', label: '📊 Visão Geral' },
          { id: 'products', label: '📦 Produtos' },
          { id: 'orders', label: '🛍️ Pedidos' },
          { id: 'store', label: '⚙️ Minha Loja' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 transition-all ${
              tab === t.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ABA: VISÃO GERAL */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Últimos pedidos */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-white text-sm">Últimos Pedidos</h4>
              {orders.slice(0, 5).length === 0 ? (
                <p className="text-xs text-slate-500">Nenhum pedido ainda.</p>
              ) : orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-white font-bold truncate max-w-32">{order.product?.name || 'Produto'}</p>
                    <p className="text-slate-500">{order.buyerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">R$ {order.totalPrice?.toFixed(2)}</p>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      order.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10' :
                      order.status === 'pending' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
                    }`}>{order.status?.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Produtos mais vendidos */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-white text-sm">Produtos em Destaque</h4>
              {products.filter(p => p.isFeatured).slice(0, 5).length === 0 ? (
                <p className="text-xs text-slate-500">Nenhum produto em destaque. Edite um produto e marque como destaque.</p>
              ) : products.filter(p => p.isFeatured).slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                    {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-lg">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{p.name}</p>
                    <p className="text-emerald-400">R$ {p.price.toFixed(2)} · {p.stock} em estoque</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA: PRODUTOS */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-mono">{products.length} produtos cadastrados</p>
            <button
              onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', price: '', originalPrice: '', category: 'geral', stock: '', images: [], isFeatured: false, tags: '' }); setShowProductForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all">
              <Plus className="w-4 h-4" />
              Novo Produto
            </button>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Package className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-slate-400">Nenhum produto ainda. Cadastre seu primeiro produto!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product: any) => (
                <div key={product.id} className={`bg-slate-900/60 border rounded-2xl p-4 flex items-center gap-4 ${product.isActive ? 'border-slate-800' : 'border-red-900/20 opacity-60'}`}>
                  <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                    {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm truncate">{product.name}</p>
                      {product.isFeatured && <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500">{product.category} · {product.stock} em estoque · {product.sold} vendidos</p>
                    <p className="text-emerald-400 font-black text-sm">R$ {product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleToggleProduct(product.id, product.isActive)}
                      className={`p-2 rounded-xl border transition-all ${product.isActive ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                      {product.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEditProduct(product)}
                      className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA: PEDIDOS */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-slate-400">Nenhum pedido ainda.</p>
            </div>
          ) : orders.map((order: any) => (
            <div key={order.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                      order.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      order.status === 'pending' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                      'text-red-400 bg-red-500/10 border-red-500/20'
                    }`}>{order.status?.toUpperCase()}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      order.paymentStatus === 'paid' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}>{order.paymentStatus === 'paid' ? 'PAGO' : 'AGUARDANDO PAGAMENTO'}</span>
                  </div>
                  <p className="text-sm text-white font-bold">{order.product?.name || 'Produto'}</p>
                  <p className="text-xs text-slate-500">{order.buyerName} · {order.buyerEmail}</p>
                  {order.buyerAddress && <p className="text-xs text-slate-500 flex items-center gap-1"><Truck className="w-3 h-3" />{order.buyerAddress}</p>}
                  <p className="text-[10px] text-slate-600 font-mono mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-white text-lg">R$ {order.totalPrice?.toFixed(2)}</p>
                  <p className="text-xs text-emerald-400">Você recebe: R$ {order.partnerAmount?.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500">Comissão JiuSpeak: R$ {(order.totalPrice - order.partnerAmount)?.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA: MINHA LOJA */}
      {tab === 'store' && (
        <div className="space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Nome da loja</label>
              <input type="text" value={storeForm.storeName || ''}
                onChange={e => setStoreForm({...storeForm, storeName: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Descrição</label>
              <textarea value={storeForm.description || ''}
                onChange={e => setStoreForm({...storeForm, description: e.target.value})}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans resize-none" />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">WhatsApp</label>
              <input type="text" value={storeForm.whatsapp || ''}
                onChange={e => setStoreForm({...storeForm, whatsapp: e.target.value})}
                placeholder="(11) 99999-9999"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Instagram</label>
              <input type="text" value={storeForm.instagram || ''}
                onChange={e => setStoreForm({...storeForm, instagram: e.target.value})}
                placeholder="@sujaloja"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Website</label>
              <input type="text" value={storeForm.website || ''}
                onChange={e => setStoreForm({...storeForm, website: e.target.value})}
                placeholder="https://sujaloja.com.br"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Chave PIX</label>
              <input type="text" value={storeForm.pixKey || ''}
                onChange={e => setStoreForm({...storeForm, pixKey: e.target.value})}
                placeholder="CPF, e-mail ou chave aleatória"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
            </div>
          </div>
          <button onClick={handleSaveStore} disabled={savingStore}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-black font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {savingStore ? 'Salvando...' : 'Salvar configurações da loja'}
          </button>
        </div>
      )}
    </div>
  );
}
