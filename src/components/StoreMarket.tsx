/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Lock, 
  Tag, 
  PlusCircle, 
  Sparkles, 
  Check, 
  QrCode, 
  Copy,
  Coins,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  History,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { UserProfile, InventoryItem, MarketplaceItem, MarketplaceSale } from '../types';
import { LOJA_ITEMS } from '../data';

interface StoreMarketProps {
  user: UserProfile;
  updateUser: (newUser: Partial<UserProfile>) => void;
  onAddAuditLog: (type: any, desc: string, amtBRL?: number, amtKC?: number) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  setCurrentTab?: (tab: string) => void;
}

export default function StoreMarket({ 
  user, 
  updateUser, 
  onAddAuditLog, 
  showToast,
  setCurrentTab
}: StoreMarketProps) {
  
  // Tabs within economics: 'loja' | 'market' | 'inventorio' | 'vip'
  const [activeSubTab, setActiveSubTab] = useState<'loja' | 'market' | 'inventorio' | 'vip'>('loja');
  
  // Marketplace active items
  const [marketItems, setMarketItems] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<MarketplaceSale[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Listing configuration
  const [listModalOpen, setListModalOpen] = useState(false);
  const [sellOption, setSellOption] = useState<'inventory' | 'custom'>('inventory');
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState('');
  const [listForm, setListForm] = useState({
    name: '',
    description: '',
    category: 'gi' as any,
    price: 300,
    rarity: 'Comum' as any
  });

  // VIP subscribe modal state
  const [subscribingTier, setSubscribingTier] = useState<any>(null);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');

  // Load Marketplace listings and transaction audits from backend
  const loadMarketData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/marketplace/items');
      const data = await response.json();
      if (data && data.items) {
        setMarketItems(data.items);
      }

      const token = localStorage.getItem('token');
      if (token) {
        const sRes = await fetch('/api/marketplace/sales', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const sData = await sRes.json();
        if (sData && sData.sales) {
          setSalesHistory(sData.sales);
        }

        const aRes = await fetch('/api/marketplace/audit', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const aData = await aRes.json();
        if (aData && aData.logs) {
          setAuditLogs(aData.logs);
        }
      }
    } catch (err) {
      console.error("Could not load marketplace info:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  // Sync when sub tab changes
  useEffect(() => {
    if (activeSubTab === 'market') {
      loadMarketData();
    }
  }, [activeSubTab]);

  // Handle Purchase of official Loja item
  const buyLojaItem = (item: InventoryItem) => {
    if (user.coins < item.price) {
      showToast(`Kimono Coins insuficientes! Você tem ${user.coins} KC e precisa de ${item.price} KC. Participe de lições ou altere cheat codes para testar.`, "error");
      return;
    }

    if (user.inventory.includes(item.id)) {
      showToast("Você já possui este item em seu inventário!", "info");
      return;
    }

    // Process buy
    const updatedCoins = user.coins - item.price;
    const updatedInventory = [...user.inventory, item.id];

    updateUser({
      coins: updatedCoins,
      inventory: updatedInventory
    });

    onAddAuditLog(
      'market_trade',
      `Loja Oficial: Atleta adquiriu cosmetic "${item.name}" por ${item.price} KC.`,
      undefined,
      item.price
    );

    showToast(`Parabéns! "${item.name}" foi adicionado ao seu inventário.`, "success");
  };

  // Resolve visual/name details of inventory item IDs
  const resolveItemDetails = (itId: string) => {
    const found = LOJA_ITEMS.find(i => i.id === itId);
    if (found) return found;

    // Default seeded mappings or custom fallbacks
    switch (itId) {
      case 'item_purple_belt':
        return {
          id: 'item_purple_belt',
          name: 'Faixa Roxa Autografada',
          description: 'Uma faixa roxa autografada por Royce Gracie de valor histórico.',
          category: 'gi',
          price: 3500,
          rarity: 'Épico',
          imageUrl: ''
        };
      case 'item_armor_badge':
        return {
          id: 'item_armor_badge',
          name: "Emblema 'Guarda Inabalável'",
          description: 'Emblema especial que exibe no perfil sua perícia técnica.',
          category: 'badge',
          price: 1200,
          rarity: 'Raro',
          imageUrl: ''
        };
      case 'item_gold_gi':
        return {
          id: 'item_gold_gi',
          name: 'Quimono Imperial Dourado',
          description: 'Costurado à mão com detalhes em ouro virtual cintilante.',
          category: 'gi',
          price: 8000,
          rarity: 'Lendário',
          imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=200'
        };
      case 'p2p_gi_koral':
        return {
          id: 'p2p_gi_koral',
          name: 'Kimono Koral Vintage 1998',
          description: 'Direto do armário de um faixa preta aposentado. Desgastado na dose certa para assustar adversários.',
          category: 'gi',
          price: 4500,
          rarity: 'Lendário',
          imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
        };
      case 'p2p_title_canela':
        return {
          id: 'p2p_title_canela',
          name: 'Título: "Perna de Borracha"',
          description: 'Somente para raspadores flexíveis de laço.',
          category: 'title',
          price: 1500,
          rarity: 'Épico',
          imageUrl: ''
        };
      case 'p2p_title_leao':
        return {
          id: 'p2p_title_leao',
          name: 'Título: "Caçador de Faixas Pretas"',
          description: 'Ostente uma autoconfiança lendária nos saguões virtuais!',
          category: 'title',
          price: 6000,
          rarity: 'Lendário',
          imageUrl: ''
        };
      default:
        return {
          id: itId,
          name: 'Equipamento de Elite',
          description: 'Acessório exclusivo conquistado no tatame.',
          category: 'gi',
          price: 450,
          rarity: 'Comum',
          imageUrl: ''
        };
    }
  };

  // Buy Peer-to-Peer marketplace item using BACKEND secure validation & anti-fraud limits
  const buyMarketplaceItem = async (item: any) => {
    if (user.coins < item.price) {
      showToast(`Kimono Coins insuficientes! Você precisa de ${item.price} KC e possui ${user.coins} KC.`, "error");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Por favor, autentique-se primeiro para operar trocas.", "error");
      return;
    }

    try {
      const response = await fetch('/api/marketplace/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ marketplaceItemId: item.id })
      });

      const resData = await response.json();
      if (!response.ok) {
        showToast(resData.error || "Tentativa rejeitada pelos servidores de segurança.", "error");
        return;
      }

      showToast(resData.message || "Troca efetuada sob supervisão jurídica e antifraude!", "success");

      // Update local wallet and bag immediately
      const nextCoins = user.coins - item.price;
      const nextInventory = [...user.inventory, item.inventoryItemId];
      updateUser({
        coins: nextCoins,
        inventory: nextInventory
      });

      // Log activity
      onAddAuditLog(
        'market_trade',
        `Mercado Coin: Adquiriu "${item.name}" de "${item.sellerName}" por ${item.price} KC. Comissão foi retida.`,
        undefined,
        item.price
      );

      // Reload
      loadMarketData();
    } catch (err) {
      showToast("Falha de rede ao interagir com o broker P2P.", "error");
    }
  };

  // List item on Peer-to-Peer Marketplace using physical owned asset or virtual creator item
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Sessão expirada. Refaça o login.", "error");
      return;
    }

    try {
      const payload: any = {
        priceKC: listForm.price
      };

      if (sellOption === 'inventory') {
        if (!selectedInventoryItemId) {
          showToast("Selecione qual item de sua mochila você deseja vender!", "error");
          return;
        }
        payload.inventoryItemId = selectedInventoryItemId;
      } else {
        if (!listForm.name || !listForm.description) {
          showToast("Nome e descrição do item são obrigatórios!", "error");
          return;
        }
        payload.name = listForm.name;
        payload.description = listForm.description;
        payload.category = listForm.category;
        payload.rarity = listForm.rarity;
      }

      const response = await fetch('/api/marketplace/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok) {
        showToast(resData.error || "Operação rejeitada pelos parâmetros do corretor.", "error");
        return;
      }

      showToast(resData.message || "Anúncio publicado com selo de custódia securitária!", "success");
      setListModalOpen(false);

      // Reflect in local inventory removal if they sold a real owned physical asset
      if (sellOption === 'inventory') {
        const remainingInv = user.inventory.filter(id => id !== selectedInventoryItemId);
        updateUser({ inventory: remainingInv });
      }

      // Reset
      setListForm({
        name: '',
        description: '',
        category: 'gi',
        price: 300,
        rarity: 'Comum'
      });
      setSelectedInventoryItemId('');
      
      // Update
      loadMarketData();
    } catch (error) {
      showToast("Erro ao contatar o servidor de listagem.", "error");
    }
  };

  // VIP subscription buy simulators
  const handleBuySubscription = (type: 'Premium VIP' | 'Mestre Gracie', price: number) => {
    if (setCurrentTab) {
      showToast('Redirecionando para a central de planos e faturamento SaaS!', 'info');
      setCurrentTab('subscriptions');
      return;
    }
    setSubscribingTier({ type, price });
    setCheckoutStep('details');
  };

  const confirmSubscriptionPix = () => {
    if (!subscribingTier) return;
    
    // Simulate activation
    updateUser({
      subscription: {
        type: subscribingTier.type,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priceBRL: subscribingTier.price
      }
    });

    onAddAuditLog(
      'pix_deposit',
      `Assinatura SaaS: Atleta contratou plano "${subscribingTier.type}" via PIX. Conta premium estendida por 30 dias.`,
      subscribingTier.price
    );

    setCheckoutStep('success');
    showToast(`Sua assinatura "${subscribingTier.type}" está ativa de forma simulada!`, 'success');
  };

  const copyPixCode = () => {
    setPixCopiado(true);
    navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136e0886bd6-8aab-4bef-811c-a1c2293816jiuspeakqrcodepixprod520400005303986540549.905802BR5925JiuSpeak%20Saas%2520Gamificado6009SAO%20PAULO62070503***6304ED24");
    showToast("Código Copiado! Use no leitor de testes.", "info");
    setTimeout(() => setPixCopiado(false), 2000);
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'Comum': return 'bg-slate-800 text-slate-350 border-slate-700';
      case 'Raro': return 'bg-blue-600/10 text-blue-400 border-blue-500/20';
      case 'Épico': return 'bg-purple-650/10 text-purple-400 border-purple-500/20';
      case 'Lendário': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse';
      default: return 'bg-slate-800 text-slate-350';
    }
  };

  return (
    <div className="space-y-6" id="bjj-store-marketplace">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-xl md:text-2xl font-display font-extrabold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-violet-400" />
            <span>Mercado & Loja de Cosméticos</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Gaste seus Kimono Coins conquistados em aulas e arenas, ou compre assinaturas VIP do clube.
          </p>
        </div>

        {/* Currency summary counters */}
        <div className="flex gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <div>
              <span className="block text-[9px] text-slate-500 font-mono">SEU SALDO (KC)</span>
              <span className="text-sm font-bold text-slate-202">{user.coins} KC</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-violet-400" />
            <div>
              <span className="block text-[9px] text-slate-500 font-mono">ASSINATURA</span>
              <span className="text-sm font-bold text-slate-202 truncate max-w-[120px]">{user.subscription.type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Economics selector micro tabs */}
      <div className="flex border-b border-slate-800 gap-1">
        {[
          { id: 'loja', label: '🥋 Loja Oficial', desc: 'Kimono Coins' },
          { id: 'market', label: '🤝 Mercado P2P', desc: 'Atletas trocando' },
          { id: 'inventorio', label: '🎒 Meu Inventário', desc: `${user.inventory.length} itens` },
          { id: 'vip', label: '👑 Assinatura VIP', desc: 'BRL / Pix' }
        ].map((sub) => {
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`px-4 py-2.5 text-xs text-left font-bold transition-all border-b-2 cursor-pointer ${
                isActive 
                  ? 'border-violet-500 text-violet-300 bg-slate-900/40 rounded-t-xl' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>{sub.label}</div>
              <span className="text-[9px] text-slate-500 block font-mono font-normal">{sub.desc}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Official Store (Kimono Coins) */}
      {activeSubTab === 'loja' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LOJA_ITEMS.filter(it => it.currency === 'KC').map((item) => {
              const owned = user.inventory.includes(item.id);
              
              return (
                <div 
                  key={item.id}
                  className="bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden group hover:border-slate-700 transition-all"
                >
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Image placeholder wrapper */}
                      <div className="h-28 bg-slate-900 rounded-lg overflow-hidden relative border border-slate-800 mb-3">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all opacity-80"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🥋</div>
                        )}
                        
                        <span className={`absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getRarityBadgeColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-xs text-slate-101">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Coins className="w-3.5 h-3.5 text-yellow-500" />
                        <span>{item.price} KC</span>
                      </div>

                      <button
                        disabled={owned}
                        onClick={() => buyLojaItem(item)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          owned 
                            ? 'bg-slate-900 border border-slate-850 text-emerald-400 cursor-not-allowed' 
                            : 'bg-violet-650 hover:bg-violet-600 text-white shadow shadow-violet-500/10'
                        }`}
                      >
                        {owned ? 'Adquirido ✓' : 'Comprar Item'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Peer-to-Peer Trading Marketplace */}
      {activeSubTab === 'market' && (
        <div className="space-y-6">
          
          {/* Safety & Commission Stats Header Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-500/10 rounded-lg text-violet-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-mono">COMISSÃO DA PLATAFORMA</span>
                <span className="text-sm font-bold text-slate-200">10% Retido por Transação</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-mono">SHIELD PROTECT ANTIFRAUDE</span>
                <span className="text-sm font-bold text-emerald-400">Ativo & Monitorando</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-mono">TETOS REGULATÓRIOS</span>
                <span className="text-sm font-bold text-amber-400">Min: 50 KC | Max: 50k KC</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h4 className="font-display font-bold text-xs text-slate-400">Anúncios de Atletas Ativos:</h4>
            
            <button
              onClick={() => setListModalOpen(true)}
              className="px-3.5 py-1.5 bg-violet-650 hover:bg-violet-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow shadow-violet-600/15"
            >
              <PlusCircle className="w-4 h-4" /> Vender meu Item
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-6 text-xs text-slate-500 font-mono animate-pulse">
              Consultando livro de ofertas e garantias securitárias...
            </div>
          ) : marketItems.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
              Nenhuma oferta ativa no mercado no momento. Publique seu próprio anúncio para comercializar cosméticos!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketItems.map((item) => {
                const owned = user.inventory.includes(item.inventoryItemId);
                
                return (
                  <div 
                    key={item.id}
                    className="bg-slate-901/40 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-705 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getRarityBadgeColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                        <span className="text-[9.5px] text-slate-500 font-mono">Vendedor: {item.sellerName}</span>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-205">{item.name}</h4>
                        <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">{item.description}</p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/50 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-202">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>{item.price} KC</span>
                      </div>

                      <button
                        onClick={() => buyMarketplaceItem(item)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          owned 
                            ? 'bg-slate-905 border border-slate-850 text-emerald-450' 
                            : 'bg-indigo-650 hover:bg-indigo-600 text-white'
                        }`}
                      >
                        {owned ? 'Você já possui ✅' : 'Adquirir Item'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ledger of completed trades & dynamic fraud monitoring */}
          <div className="mt-8 space-y-4 pt-6 border-t border-slate-850">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-violet-405" />
              <h5 className="font-display font-extrabold text-sm text-white">Livro de Histórico & Auditoria Antifraude</h5>
            </div>
            
            <p className="text-[11px] text-slate-450 max-w-2xl mt-0.5 leading-relaxed">
              Consulte faturas, comissões de 10% cobradas automaticamente pelo ecossistema SaaS de Mestres, além de Risk Scores atribuídos por nossos algoritmos de fiscalização de sessão e endereços.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
              {salesHistory.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-[11px] font-mono">
                  Nenhuma transação registrada no ledger de auditorias.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-[11px] font-semibold text-slate-350 min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 font-mono text-[9px] uppercase">
                      <th className="py-2">Item Negociado</th>
                      <th className="py-2">Comprador</th>
                      <th className="py-2">Vendedor</th>
                      <th className="py-2">Valor Total</th>
                      <th className="py-2">Taxa (10%)</th>
                      <th className="py-2">Risk Score</th>
                      <th className="py-2 text-right">Status Antifraude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesHistory.map((sale) => (
                      <tr key={sale.id} className="border-b border-slate-900/50 hover:bg-slate-900/20 transition-all font-mono">
                        <td className="py-2.5 text-slate-201 font-sans">{sale.itemName}</td>
                        <td className="py-2.5 text-slate-400">{sale.buyerName}</td>
                        <td className="py-2.5 text-slate-400">{sale.sellerName}</td>
                        <td className="py-2.5 text-white">{sale.pricePaidKC} KC</td>
                        <td className="py-2.5 text-slate-500">{sale.feePaidKC} KC</td>
                        <td className="py-2.5 font-bold">
                          <span className={sale.riskScore > 50 ? 'text-rose-400' : 'text-emerald-450'}>
                            {sale.riskScore}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-sans">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                            sale.status === 'Seguro'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : sale.status === 'Suspeito'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Auditing controls and system alarm triggers */}
          {auditLogs.length > 0 && (
            <div className="bg-slate-900/20 p-4 rounded-xl border border-slate-850 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                <ShieldAlert className="w-4 h-4" />
                <span>Logs de Fiscalização e Segurança (Real-time Audit Logs)</span>
              </div>
              <div className="space-y-1 max-h-[160px] overflow-y-auto pr-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="text-[10px] font-mono text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between gap-4 items-start">
                    <span>{log.description}</span>
                    <span className="text-slate-600 block shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. Owned Fighter Inventory list */}
      {activeSubTab === 'inventorio' && (
        <div className="space-y-6">
          {user.inventory.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
              Sua mochila está vazia! Conmpre e adquira grauzinhos ou panos na Loja oficial para vê-los aqui.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {user.inventory.map((invId) => {
                // look up product details in official or custom lists
                const item = LOJA_ITEMS.find(i => i.id === invId) || marketItems.find(i => i.id === invId) || {
                  id: invId,
                  name: 'Equipamento de Competição',
                  description: 'Peça oficial recebida via conquistas.',
                  category: 'gi',
                  price: 0,
                  currency: 'KC',
                  rarity: 'Comum',
                  imageUrl: ''
                };

                return (
                  <div 
                    key={invId}
                    className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">{item.category}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getRarityBadgeColor(item.rarity as any)}`}>
                          {item.rarity}
                        </span>
                      </div>
                      
                      <h4 className="font-display font-bold text-xs text-slate-205 mt-1.5">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/40 flex justify-end">
                      <span className="text-[10px] bg-slate-820 font-bold text-slate-405 px-2 py-0.5 rounded border border-slate-750">
                        🎒 Ativo no Perfil
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Creator Assinaturas membership buying */}
      {activeSubTab === 'vip' && (
        <div className="space-y-6">
          <div className="text-center max-w-sm mx-auto space-y-1">
            <h4 className="font-display font-extrabold text-base text-slate-101">Plano Assinaturas de Mestres</h4>
            <p className="text-xs text-slate-450 leading-relaxed font-normal">
              Apoie grandes Senseis e ganhe aulas ilimitadas, 2x XP em todas as arenas e o selo VIP cintilante ao lado do nome.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            
            {/* VIP Pass */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-5 text-center group hover:border-violet-500 transition-all">
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-violet-405 uppercase font-bold tracking-widest bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full inline-block">
                  Acesso Duplicado
                </span>
                <h5 className="font-display font-bold text-base text-white">VIP Club Pass</h5>
                <h6 className="text-2xl font-black text-slate-102">R$ 29,90<span className="text-xs font-normal text-slate-500">/mês</span></h6>
                
                <ul className="text-left text-[11px] text-slate-400 space-y-2 pt-3 font-normal border-t border-slate-900">
                  <li className="flex items-center gap-1.5">⚡ Ganhe o dobro de XP por lição</li>
                  <li className="flex items-center gap-1.5">🛡️ Selo VIP de prestígio no perfil</li>
                  <li className="flex items-center gap-1.5">📖 Desbloqueia cursos básicos extras</li>
                  <li className="flex items-center gap-1.5">🤖 Mentor IA ativado no Sparring</li>
                </ul>
              </div>

              <button
                onClick={() => handleBuySubscription('Premium VIP', 29.90)}
                className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow shadow-violet-500/10 cursor-pointer"
              >
                Assinar via Pix
              </button>
            </div>

            {/* Mestre Gracie */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-5 text-center group hover:border-yellow-500 transition-all">
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-yellow-500 uppercase font-black tracking-widest bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full inline-block">
                  Acesso Completo
                </span>
                <h5 className="font-display font-bold text-base text-white">Mestre Gracie Club</h5>
                <h6 className="text-2xl font-black text-slate-102">R$ 49,90<span className="text-xs font-normal text-slate-500">/mês</span></h6>
                
                <ul className="text-left text-[11px] text-slate-400 space-y-2 pt-3 font-normal border-t border-slate-900">
                  <li className="flex items-center gap-1.5">💎 Liberação TOTAL de todos os cursos Premium</li>
                  <li className="flex items-center gap-1.5">🥋 Kimono Imperial Dourado Grátis no inventário</li>
                  <li className="flex items-center gap-1.5">🏅 +2.000 Kimono Coins de saldo inicial imediato</li>
                  <li className="flex items-center gap-1.5">💬 Canal de áudio exclusivo no Discord</li>
                </ul>
              </div>

              <button
                onClick={() => handleBuySubscription('Mestre Gracie', 49.90)}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow shadow-yellow-500/10 cursor-pointer"
              >
                Assinar via Pix
              </button>
            </div>

          </div>
        </div>
      )}

      {/* P2P Product listing modal */}
      {listModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateListing}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-805">
              <h5 className="font-display font-bold text-sm text-slate-205">Anunciar meu Equipamento</h5>
              <button 
                type="button" 
                onClick={() => setListModalOpen(false)}
                className="text-slate-500 hover:text-slate-200 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Sell Option Mode Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSellOption('inventory');
                  setSelectedInventoryItemId('');
                }}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${sellOption === 'inventory' ? 'bg-indigo-600 text-white shadow' : 'text-slate-405 hover:text-slate-200'}`}
              >
                🎒 Meu Inventário ({user.inventory.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSellOption('custom');
                  setListForm({
                    name: '',
                    description: '',
                    category: 'gi',
                    rarity: 'Comum',
                    price: 300
                  });
                }}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${sellOption === 'custom' ? 'bg-indigo-600 text-white shadow' : 'text-slate-405 hover:text-slate-200'}`}
              >
                🛠️ Criar Item Novo
              </button>
            </div>

            {sellOption === 'inventory' ? (
              <div className="space-y-3">
                <div className="space-y-1 text-xs">
                  <label className="text-slate-500 font-mono font-bold uppercase block text-[10px]">Escolher da minha Mochila</label>
                  {user.inventory.length === 0 ? (
                    <div className="p-3 text-[10px] text-amber-400 bg-amber-500/5 rounded border border-amber-500/20 leading-relaxed font-normal">
                      Sua mochila está vazia. Compre algo na Loja Oficial primeiro ou use a aba de "Criar Item Novo" acima.
                    </div>
                  ) : (
                    <select
                      required
                      value={selectedInventoryItemId}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        setSelectedInventoryItemId(selectedVal);
                        const details = resolveItemDetails(selectedVal);
                        setListForm({
                          name: details.name,
                          description: details.description,
                          category: details.category,
                          rarity: details.rarity,
                          price: listForm.price
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2 text-slate-201 cursor-pointer focus:outline-none"
                    >
                      <option value="">-- Selecione um Item --</option>
                      {user.inventory.map((invId, idx) => {
                        const itemData = resolveItemDetails(invId);
                        return (
                          <option key={`${invId}-${idx}`} value={invId}>
                            {itemData.name} ({itemData.rarity})
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                {selectedInventoryItemId && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5 text-left text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Visualização Prévia</span>
                      <span className={`text-[8px] font-bold px-1 py-0.2 rounded border uppercase ${getRarityBadgeColor(listForm.rarity)}`}>
                        {listForm.rarity}
                      </span>
                    </div>
                    <div className="font-bold text-white font-sans">{listForm.name}</div>
                    <p className="text-[10px] text-slate-400 leading-normal font-normal">{listForm.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono font-bold uppercase block text-[10px]">Nome do Produto</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Faixa Branca com 4 Graus"
                    value={listForm.name}
                    onChange={(e) => setListForm({...listForm, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2 text-slate-250 font-semibold focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-mono font-bold uppercase block text-[10px]">Descrição Técnica</label>
                  <textarea 
                    required
                    placeholder="Ex: Tecido Ultra-Heavy de algodão egípcio..."
                    value={listForm.description}
                    onChange={(e) => setListForm({...listForm, description: e.target.value})}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2 text-slate-250 font-semibold focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-mono font-bold uppercase block text-[10px]">Categoria</label>
                    <select 
                      value={listForm.category}
                      onChange={(e) => setListForm({...listForm, category: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-755 rounded-lg p-2 text-slate-201 cursor-pointer focus:outline-none"
                    >
                      <option value="gi">Quimono</option>
                      <option value="title">Título</option>
                      <option value="badge">Emblema</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-mono font-bold uppercase block text-[10px]">Raridade</label>
                    <select 
                      value={listForm.rarity}
                      onChange={(e) => setListForm({...listForm, rarity: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-755 rounded-lg p-2 text-slate-201 cursor-pointer focus:outline-none"
                    >
                      <option value="Comum">Comum</option>
                      <option value="Raro">Raro</option>
                      <option value="Épico">Épico</option>
                      <option value="Lendário">Lendário</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <label className="text-slate-500 font-mono font-bold uppercase block text-[10px]">Preço Solicitado (KC)</label>
                {listForm.price > 0 && (
                  <span className="text-[9px] text-slate-400 font-mono font-normal">Sellers Net: {Math.floor(listForm.price * 0.9)} KC (taxa 10%)</span>
                )}
              </div>
              <input 
                type="number" 
                min={50}
                max={50000}
                value={listForm.price}
                onChange={(e) => setListForm({...listForm, price: parseInt(e.target.value) || 100})}
                className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2 text-slate-250 font-semibold focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={sellOption === 'inventory' && !selectedInventoryItemId}
              className="w-full py-2 bg-emerald-650 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-emerald-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all mt-2 cursor-pointer"
            >
              🚀 Publicar no Mercado
            </button>
          </form>
        </div>
      )}

      {/* VIP Checkout confirmation Pix modal drawer */}
      {subscribingTier && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp shadow-2xl">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono text-yellow-500 uppercase tracking-wider font-black block">Simulador Assinatura</span>
                <h5 className="font-display font-extrabold text-base text-white"> Checkout do Plano</h5>
              </div>
              <button 
                onClick={() => setSubscribingTier(null)}
                className="text-slate-500 hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕ Cancelar
              </button>
            </div>

            {checkoutStep === 'details' ? (
              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-400">
                  Para ativar o plano virtual de {subscribingTier.type}, escaneie o PIX abaixo:
                </p>

                <div className="bg-white p-3.5 rounded-xl inline-block mx-auto">
                  <QrCode className="w-28 h-28 text-slate-950" />
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between gap-3 text-left">
                  <code className="text-[9px] text-indigo-405 font-mono select-all truncate flex-1">
                    00020126580014BR.GOV.BCB.PIX0136e0886bd6-8aab-4bef-811c-a1c2293816jiuspeakqrcodepixprod520400005303986540549.905802BR5925JiuSpeak%20Saas6009
                  </code>
                  <button
                    onClick={copyPixCode}
                    className="p-1 text-slate-350 bg-slate-900 border border-slate-800 rounded hover:text-violet-405 cursor-pointer"
                    title="Copiar PIX"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 flex justify-between font-bold text-xs text-slate-202 border-t border-slate-805">
                  <span>Plano de Adesão:</span>
                  <span className="text-yellow-505">R$ {subscribingTier.price.toFixed(2)}</span>
                </div>

                <button
                  onClick={confirmSubscriptionPix}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow shadow-emerald-550/15 cursor-pointer"
                >
                  Simular Pagamento Pix ✔
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto float-effect">
                  👑
                </div>
                <div>
                  <h6 className="font-display font-bold text-xs text-slate-101">Assinatura Ativada!</h6>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Seu perfil recebeu status <strong>{subscribingTier.type}</strong>. Ative cheats ou jogue na arena para desfrutar do sitema virtual de recompensas.
                  </p>
                </div>

                <button
                  onClick={() => setSubscribingTier(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-lg transition-all"
                >
                  Retornar ao Mercado
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
