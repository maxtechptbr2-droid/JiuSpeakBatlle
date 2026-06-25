import React, { useState, useEffect } from 'react';
import {
  Store, ShoppingBag, Star, Package, ChevronRight,
  Search, Filter, Heart, Share2, ShoppingCart,
  MapPin, Phone, Instagram, Globe, CheckCircle,
  ArrowLeft, Plus, Minus, X, Send, Upload,
  Building2, Tag, Truck, Shield, Award
} from 'lucide-react';

interface PartnerStoreProps {
  user: any;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onNavigate: (tab: string) => void;
}

const CATEGORIES = [
  { id: 'todos', label: 'Todos', emoji: '🛍️' },
  { id: 'kimonos', label: 'Kimonos & Gi', emoji: '🥋' },
  { id: 'no-gi', label: 'No-Gi', emoji: '👊' },
  { id: 'acessorios', label: 'Acessórios', emoji: '🎽' },
  { id: 'suplementos', label: 'Suplementos', emoji: '💊' },
  { id: 'livros', label: 'Livros & Cursos', emoji: '📚' },
  { id: 'equipamentos', label: 'Equipamentos', emoji: '🏋️' },
  { id: 'geral', label: 'Geral', emoji: '📦' },
];

export default function PartnerStorePage({ user, showToast, onNavigate }: PartnerStoreProps) {
  const [view, setView] = useState<'vitrine' | 'produto' | 'loja' | 'aplicar' | 'sucesso'>('vitrine');
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('todos');
  const [search, setSearch] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);

  // Form de aplicação
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    storeName: '',
    storeDesc: '',
    category: 'geral',
    instagram: '',
    website: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const getToken = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'todos') params.append('category', category);
      if (search) params.append('search', search);
      const res = await fetch(`/api/partners/products?${params}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setStores(data.stores || []);
      }
    } catch (e) {
      // usar dados mock enquanto não há produtos
      setProducts([]);
      setStores([]);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!form.name || !form.email || !form.phone || !form.storeName || !form.storeDesc) {
      showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setView('sucesso');
      } else {
        showToast(data.error || 'Erro ao enviar solicitação', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
    }
    setSubmitting(false);
  };

  // ============================================================
  // VIEW: VITRINE PRINCIPAL
  // ============================================================
  if (view === 'vitrine') return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-900/30 rounded-3xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏪</span>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">Stand Parceiros</span>
            </div>
            <h2 className="font-black text-2xl text-white mb-2">Produtos dos Nossos Parceiros</h2>
            <p className="text-sm text-slate-400 max-w-lg">
              Encontre kimonos, equipamentos, suplementos e muito mais de lojistas parceiros certificados pela JiuSpeak.
            </p>
          </div>
          <button
            onClick={() => setView('aplicar')}
            className="shrink-0 flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded-2xl transition-all shadow-lg shadow-amber-500/20"
          >
            <Store className="w-4 h-4" />
            Quero ser Parceiro
          </button>
        </div>
      </div>

      {/* Busca e filtro */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 font-sans"
          />
        </div>
      </div>

      {/* Categorias */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              category === cat.id
                ? 'bg-amber-500 text-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid de produtos */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-900/50 rounded-2xl h-64 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <span className="text-6xl block">🏪</span>
          <h3 className="font-black text-white text-lg">Nenhum produto ainda</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Seja um dos primeiros parceiros a anunciar seus produtos aqui!
          </p>
          <button
            onClick={() => setView('aplicar')}
            className="mx-auto flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded-2xl transition-all"
          >
            <Store className="w-4 h-4" />
            Quero ser Parceiro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <div
              key={product.id}
              onClick={() => { setSelectedProduct(product); setView('produto'); setQuantity(1); }}
              className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-amber-500/5 group"
            >
              <div className="aspect-square bg-slate-800 relative overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
                {product.isFeatured && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-lg">DESTAQUE</span>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="text-xs text-amber-400 font-mono">{product.store?.storeName}</p>
                <p className="text-sm font-bold text-white line-clamp-2">{product.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-[10px] text-slate-500 line-through">R$ {product.originalPrice.toFixed(2)}</p>
                    )}
                    <p className="text-base font-black text-emerald-400">R$ {product.price.toFixed(2)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Parceiros em destaque */}
      {stores.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-black text-white text-sm uppercase font-mono tracking-wider">Lojas Parceiras</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store: any) => (
              <div
                key={store.id}
                onClick={() => { setSelectedStore(store); setView('loja'); }}
                className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {store.logo ? (
                    <img src={store.logo} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-6 h-6 text-amber-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-white text-sm truncate">{store.storeName}</p>
                    {store.isVerified && <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{store.description}</p>
                  <p className="text-[10px] text-amber-400 font-mono mt-0.5">{store.totalOrders} pedidos</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ============================================================
  // VIEW: DETALHE DO PRODUTO
  // ============================================================
  if (view === 'produto' && selectedProduct) return (
    <div className="space-y-6">
      <button onClick={() => setView('vitrine')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-mono transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para a vitrine
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagens */}
        <div className="space-y-3">
          <div className="aspect-square bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
            {selectedProduct.images?.[0] ? (
              <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
            )}
          </div>
        </div>

        {/* Detalhes */}
        <div className="space-y-5">
          <div>
            <p className="text-xs text-amber-400 font-mono mb-1">{selectedProduct.store?.storeName}</p>
            <h2 className="font-black text-white text-2xl">{selectedProduct.name}</h2>
          </div>

          <div className="flex items-end gap-3">
            <p className="font-black text-3xl text-emerald-400">R$ {selectedProduct.price.toFixed(2)}</p>
            {selectedProduct.originalPrice > selectedProduct.price && (
              <p className="text-slate-500 line-through text-lg">R$ {selectedProduct.originalPrice.toFixed(2)}</p>
            )}
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">{selectedProduct.description}</p>

          {/* Quantidade */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400 uppercase">Quantidade:</span>
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-black text-white w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(selectedProduct.stock, q + 1))} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-slate-500">{selectedProduct.stock} em estoque</span>
          </div>

          {/* Total */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white font-bold">R$ {(selectedProduct.price * quantity).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Frete</span>
              <span className="text-slate-400">Combinar com vendedor</span>
            </div>
          </div>

          {/* Botão comprar */}
          <button
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-base rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            onClick={() => showToast('Em breve! Checkout integrado disponível.', 'info')}
          >
            <ShoppingBag className="w-5 h-5" />
            Comprar Agora — R$ {(selectedProduct.price * quantity).toFixed(2)}
          </button>

          {/* Info da loja */}
          {selectedProduct.store && (
            <div className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded-2xl cursor-pointer hover:border-amber-500/30 transition-colors"
              onClick={() => { setSelectedStore(selectedProduct.store); setView('loja'); }}>
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <Store className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{selectedProduct.store.storeName}</p>
                <p className="text-xs text-slate-500">Ver loja completa</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
          )}

          {/* Garantias */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, label: 'Parceiro verificado', color: 'text-emerald-400' },
              { icon: Truck, label: 'Entrega combinada', color: 'text-blue-400' },
              { icon: Award, label: 'Qualidade garantida', color: 'text-amber-400' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-[10px] text-slate-400 font-mono">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // VIEW: PÁGINA DA LOJA
  // ============================================================
  if (view === 'loja' && selectedStore) return (
    <div className="space-y-6">
      <button onClick={() => setView('vitrine')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-mono transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      {/* Banner da loja */}
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        {selectedStore.banner ? (
          <img src={selectedStore.banner} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gradient-to-r from-amber-950/60 to-slate-900 flex items-center justify-center">
            <Store className="w-12 h-12 text-amber-400/30" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 to-transparent">
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-500/30 flex items-center justify-center overflow-hidden">
              {selectedStore.logo ? (
                <img src={selectedStore.logo} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-white text-xl">{selectedStore.storeName}</h2>
                {selectedStore.isVerified && <CheckCircle className="w-5 h-5 text-amber-400" />}
              </div>
              <p className="text-xs text-slate-400">{selectedStore.totalOrders} pedidos realizados</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-400">{selectedStore.description}</p>

      {/* Contatos */}
      <div className="flex flex-wrap gap-3">
        {selectedStore.whatsapp && (
          <a href={`https://wa.me/55${selectedStore.whatsapp.replace(/\D/g,'')}`} target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-green-950/40 border border-green-900/30 rounded-xl text-green-400 text-xs font-mono hover:bg-green-950/60 transition-colors">
            <Phone className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        )}
        {selectedStore.instagram && (
          <a href={`https://instagram.com/${selectedStore.instagram}`} target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-pink-950/40 border border-pink-900/30 rounded-xl text-pink-400 text-xs font-mono hover:bg-pink-950/60 transition-colors">
            <Instagram className="w-3.5 h-3.5" />
            @{selectedStore.instagram}
          </a>
        )}
        {selectedStore.website && (
          <a href={selectedStore.website} target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-blue-950/40 border border-blue-900/30 rounded-xl text-blue-400 text-xs font-mono hover:bg-blue-950/60 transition-colors">
            <Globe className="w-3.5 h-3.5" />
            Website
          </a>
        )}
      </div>

      {/* Produtos da loja */}
      <div className="space-y-3">
        <h3 className="font-black text-white text-sm uppercase font-mono">Produtos desta loja</h3>
        {selectedStore.products?.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhum produto disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(selectedStore.products || []).map((product: any) => (
              <div key={product.id}
                onClick={() => { setSelectedProduct({...product, store: selectedStore}); setView('produto'); setQuantity(1); }}
                className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 rounded-2xl overflow-hidden cursor-pointer transition-all">
                <div className="aspect-square bg-slate-800">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-white line-clamp-2">{product.name}</p>
                  <p className="text-base font-black text-emerald-400 mt-1">R$ {product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ============================================================
  // VIEW: FORMULÁRIO DE APLICAÇÃO
  // ============================================================
  if (view === 'aplicar') return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => setView('vitrine')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-mono transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-900/30 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">🏪</div>
          <div>
            <h2 className="font-black text-white text-xl">Quero ser Parceiro JiuSpeak</h2>
            <p className="text-xs text-amber-400 font-mono">Formulário de solicitação — análise em até 48h</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Venda seus produtos para toda a comunidade JiuSpeak. Após aprovação, você terá acesso ao painel do parceiro para cadastrar produtos e gerenciar pedidos.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
        <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider border-b border-slate-800 pb-3">
          Dados do Responsável
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Nome completo *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
          </div>
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">E-mail *</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
          </div>
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">WhatsApp / Telefone *</label>
            <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="(11) 99999-9999"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
          </div>
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Categoria principal *</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
              {CATEGORIES.filter(c => c.id !== 'todos').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider border-b border-slate-800 pb-3 pt-2">
          Dados da Loja
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Nome da loja *</label>
            <input type="text" value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})}
              placeholder="Ex: BJJ Gear Brasil"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
          </div>
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Descrição da loja *</label>
            <textarea value={form.storeDesc} onChange={e => setForm({...form, storeDesc: e.target.value})}
              rows={3} placeholder="Conte sobre sua loja, produtos que vende e diferenciais..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Instagram (opcional)</label>
              <input type="text" value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})}
                placeholder="@sujaloja"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Website (opcional)</label>
              <input type="text" value={form.website} onChange={e => setForm({...form, website: e.target.value})}
                placeholder="https://sujaloja.com.br"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none font-sans" />
            </div>
          </div>
        </div>

        {/* Termos */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-amber-400 font-mono uppercase">Condições de Parceria</h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />Comissão de 10% sobre cada venda realizada pela plataforma</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />Repasse realizado mensalmente via PIX</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />Parceiro responsável pela entrega e qualidade dos produtos</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />JiuSpeak pode recusar produtos que não sejam adequados à comunidade</li>
          </ul>
        </div>

        <button
          onClick={handleApply}
          disabled={submitting}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-black text-base rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>Enviando solicitação...</>
          ) : (
            <><Send className="w-5 h-5" />Enviar Solicitação</>
          )}
        </button>
      </div>
    </div>
  );

  // ============================================================
  // VIEW: SUCESSO
  // ============================================================
  if (view === 'sucesso') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto">
      <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-5xl animate-bounce">
        🎉
      </div>
      <div>
        <h2 className="font-black text-white text-2xl mb-2">Solicitação Enviada!</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Recebemos sua solicitação para se tornar parceiro JiuSpeak. Nossa equipe vai analisar e entrar em contato pelo e-mail <strong className="text-amber-400">{form.email}</strong> em até 48 horas.
        </p>
      </div>
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 w-full text-left space-y-2">
        <p className="text-xs font-mono text-amber-400 uppercase font-bold">Próximos passos:</p>
        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black">1</span>Análise da solicitação pela equipe JiuSpeak</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black">2</span>Contato por e-mail em até 48h</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black">3</span>Acesso ao painel do parceiro após aprovação</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black">4</span>Cadastro de produtos e início das vendas</li>
        </ul>
      </div>
      <button
        onClick={() => setView('vitrine')}
        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a loja
      </button>
    </div>
  );

  return null;
}
