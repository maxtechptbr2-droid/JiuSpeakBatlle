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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'method'|'processing'|'pix'|'success'>('method');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix'|'credit_card'|'debit_card'>('pix');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [buyerDoc, setBuyerDoc] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardInstallments, setCardInstallments] = useState(1);

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

  const handleCheckout = async () => {
    if (!selectedProduct) return;
    setCheckoutLoading(true);
    setCheckoutStep('processing');
    try {
      const res = await fetch('/api/partner/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          paymentMethodId: paymentMethod,
          email: buyerEmail,
          identificationNumber: buyerDoc
        })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentData(data);
        if (paymentMethod === 'pix') {
          setCheckoutStep('pix');
        } else if (data.status === 'approved') {
          setCheckoutStep('success');
        } else {
          setCheckoutStep('processing');
        }
        // Polling
        const poll = setInterval(async () => {
          try {
            const sr = await fetch(`/api/partner/checkout/status/${data.paymentId}`, {
              headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const sd = await sr.json();
            if (sd.status === 'approved') { clearInterval(poll); setCheckoutStep('success'); }
          } catch {}
        }, 5000);
        setTimeout(() => clearInterval(poll), 15 * 60 * 1000);
      } else {
        showToast(data.error || 'Erro ao processar pagamento', 'error');
        setCheckoutStep('method');
      }
    } catch { showToast('Erro de conexão', 'error'); setCheckoutStep('method'); }
    setCheckoutLoading(false);
  };

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
        setProducts((data.products || []).map((p: any) => ({
          ...p,
          images: (() => { try { return Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'); } catch { return []; } })(),
          tags: (() => { try { return Array.isArray(p.tags) ? p.tags : JSON.parse(p.tags || '[]'); } catch { return []; } })(),
        })));
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
  const checkoutModal = checkoutOpen && selectedProduct ? (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" style={{zIndex:9999}}>
        <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <div>
              <p className="text-xs text-amber-400 font-mono">{selectedProduct.store?.storeName}</p>
              <h3 className="font-black text-white truncate max-w-xs">{selectedProduct.name}</h3>
            </div>
            <button onClick={() => setCheckoutOpen(false)} className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="p-4 space-y-3">
            {checkoutStep === 'method' && (<>
              <p className="text-sm text-slate-400">Total: <span className="text-white font-black text-xl">R$ {(selectedProduct.price * quantity).toFixed(2)}</span></p>
              <div>
                <p className="text-xs font-mono text-slate-400 uppercase mb-2">Forma de Pagamento</p>
                <div className="grid grid-cols-3 gap-2">
                  {([{id:'pix',icon:'⚡',label:'PIX',desc:'Instantâneo'},{id:'credit_card',icon:'💳',label:'Crédito',desc:'Parcelado'},{id:'debit_card',icon:'🏦',label:'Débito',desc:'À vista'}] as const).map(m => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${paymentMethod === m.id ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                      <div className="text-xl">{m.icon}</div>
                      <div className="text-xs font-bold text-white">{m.label}</div>
                      <div className="text-[9px] text-slate-500">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Email</label>
                <input value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} type="email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="seu@email.com" />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase block mb-1">CPF</label>
                <input value={buyerDoc} onChange={e => setBuyerDoc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="000.000.000-00" />
              </div>
              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (<>
                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Número do Cartão</label>
                  <input value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g,'').slice(0,16))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="0000 0000 0000 0000" maxLength={16} />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Nome no Cartão</label>
                  <input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="NOME COMO NO CARTÃO" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Validade</label>
                    <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value.replace(/\D/g,'').slice(0,4).replace(/(\d{2})(\d)/,'$1/$2'))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                      placeholder="MM/AA" maxLength={5} />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">CVV</label>
                    <input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                      placeholder="000" maxLength={4} type="password" />
                  </div>
                </div>
                {paymentMethod === 'credit_card' && (
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">Parcelas</label>
                    <select value={cardInstallments} onChange={e => setCardInstallments(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500">
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                        <option key={n} value={n}>{n}x de R$ {(selectedProduct.price * quantity / n).toFixed(2)}{n === 1 ? ' sem juros' : ''}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>)}
              <button onClick={handleCheckout} disabled={!buyerEmail || !buyerDoc || checkoutLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black rounded-xl transition-all">
                {checkoutLoading ? 'Processando...' : `Pagar R$ ${(selectedProduct.price * quantity).toFixed(2)}`}
              </button>
            </>)}
            {checkoutStep === 'processing' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"/>
                <p className="text-white font-bold">Processando pagamento...</p>
              </div>
            )}
            {checkoutStep === 'pix' && paymentData && (
              <div className="text-center space-y-3">
                <div className="text-3xl">⚡</div>
                <p className="font-black text-white text-lg">PIX Gerado!</p>
                <p className="text-slate-400 text-sm">Total: <strong className="text-white">R$ {paymentData.amount?.toFixed(2)}</strong></p>
                {paymentData.qrCodeBase64 && paymentData.qrCodeBase64.length > 100 && (
                  <div className="bg-white p-3 rounded-2xl mx-auto w-44 h-44 flex items-center justify-center">
                    <img src={`data:image/png;base64,${paymentData.qrCodeBase64}`} className="w-full h-full object-contain" alt="QR Code PIX" />
                  </div>
                )}
                {paymentData.pixCopiaECola && (
                  <button onClick={() => { navigator.clipboard.writeText(paymentData.pixCopiaECola); showToast('Código copiado!', 'success'); }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all">
                    📋 Copiar Código PIX
                  </button>
                )}
                <p className="text-xs text-slate-500 animate-pulse">Aguardando confirmação do pagamento...</p>
              </div>
            )}
            {checkoutStep === 'success' && (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">✅</div>
                <p className="font-black text-white text-xl">Pagamento Confirmado!</p>
                <p className="text-slate-400 text-sm">Entre em contato com o vendedor para combinar a entrega.</p>
                {selectedProduct.store?.whatsapp && (
                  <a href={`https://wa.me/55${selectedProduct.store.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Olá! Paguei o produto ' + selectedProduct.name + ' pelo JiuSpeak!')}`}
                    target="_blank"
                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 block text-center">
                    📱 Contatar Vendedor no WhatsApp
                  </a>
                )}
                <button onClick={() => { setCheckoutOpen(false); setView('vitrine'); }}
                  className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm">
                  Voltar para a loja
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
  ) : null;

  if (view === 'vitrine') return (
    <>{checkoutModal}<div className="space-y-6">
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
                onClick={() => { setSelectedStore({...store, products: products.filter((p: any) => p.storeId === store.id)}); setView('loja'); }}
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
  </>
  );

  // ============================================================
  // VIEW: DETALHE DO PRODUTO
  // ============================================================
  if (view === 'produto' && selectedProduct) return (
    <>{checkoutModal}<div className="space-y-6">
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
            onClick={() => { setBuyerEmail(user?.email || ''); setCheckoutStep('method'); setPaymentData(null); setCheckoutOpen(true); }}
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
  </>
  );

  // ============================================================
  // VIEW: PÁGINA DA LOJA
  // ============================================================
  if (view === 'loja' && selectedStore) return (
    <>{checkoutModal}<div className="space-y-6">
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
  </>
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
