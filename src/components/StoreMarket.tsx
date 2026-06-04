/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  BarChart2,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkle,
  Bookmark,
  ShoppingCart,
  Trash2,
  Flame,
  Clock,
  Percent,
  Info,
  X,
  Plus
} from 'lucide-react';
import { UserProfile, InventoryItem, MarketplaceItem, MarketplaceSale } from '../types';
import { LOJA_ITEMS } from '../data';

// 1. High-Performance Canvas-based Gaming Particle Confetti Rain for legendary acquisitions
export function ConfettiRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#f43f5e', // Rose
      '#ec4899', // Pink
      '#d946ef', // Fuchsia
      '#a855f7', // Purple
      '#8b5cf6', // Violet
      '#6366f1', // Indigo
      '#3b82f6', // Blue
      '#0ea5e9', // Sky
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#eab308', // Yellow
      '#f97316'  // Orange
    ];
    
    // Generate particles
    const particles = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      r: Math.random() * 5 + 4,
      d: Math.random() * width,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.08 + 0.03,
      tiltAngle: 0,
      speed: Math.random() * 3 + 2.5
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speed;
        p.x += Math.sin(p.tiltAngle) * 0.5;
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 12;

        ctx.beginPath();
        ctx.lineWidth = p.r / 1.5;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        // Wrap particles around 
        if (p.y > height) {
          p.x = Math.random() * width;
          p.y = -20;
          p.speed = Math.random() * 3 + 2.5;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[999] w-full h-full" />;
}

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

  // Virtual Store dynamic state variables
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeCategory, setStoreCategory] = useState('Todos'); // 'Todos' | 'Avatares' | 'Molduras' | 'Títulos' | 'Emotes' | 'Efeitos Especiais'
  const [storeRarity, setStoreRarity] = useState('Todos'); // 'Todos' | 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Mítico'
  const [storePage, setStorePage] = useState(1);
  const [storeTotalPages, setStoreTotalPages] = useState(1);
  const [storeTotalItems, setStoreTotalItems] = useState(0);
  const [isStoreLoading, setIsStoreLoading] = useState(false);
  const [purchasingProductId, setPurchasingProductId] = useState<string | null>(null);
  
  // Custom interactive animations item overlay state
  const [successAnimationItem, setSuccessAnimationItem] = useState<any | null>(null);

  // Visual gaming cart & countdown states
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartCheckingOut, setIsCartCheckingOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState('23:59:59');

  // Triggering countdown clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date();
      end.setHours(24, 0, 0, 0);
      const diff = end.getTime() - now.getTime();
      const h = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
      const m = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
      const s = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const promoProductIds = ['prod_frame_neon_glaze', 'prod_effect_smoke', 'gi_shibori'];
  const limitedProductIds = ['prod_frame_gold_aurora', 'prod_effect_galaxy', 'gi_gold'];

  const addToCart = (product: any) => {
    const isOwned = user.inventory.includes(product.id);
    if (isOwned) {
      showToast(`Você já possui o item "${product.name}" na sua mochila!`, "info");
      return;
    }
    const alreadyInCart = cart.some(item => item.id === product.id);
    if (alreadyInCart) {
      showToast(`"${product.name}" já está no seu carrinho!`, "info");
      return;
    }
    setCart([...cart, product]);
    showToast(`"${product.name}" adicionado ao carrinho!`, "success");
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    showToast("Carrinho foi esvaziado.", "info");
  };

  const handleCheckoutCart = async () => {
    if (cart.length === 0) return;
    const totalCost = cart.reduce((sum, item) => sum + item.priceKC, 0);
    if (user.coins < totalCost) {
      showToast(`KC insuficiente! Total: ${totalCost} KC. Você possui: ${user.coins} KC.`, "error");
      return;
    }

    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) {
      showToast("Sessão expirada. Reconecte-se.", "error");
      return;
    }

    setIsCartCheckingOut(true);
    let successfullyBought: any[] = [];
    let currentCoins = user.coins;
    let currentInventory = [...user.inventory];

    for (const item of cart) {
      try {
        const res = await fetch("/api/store/buy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ productId: item.id })
        });
        const data = await res.json();
        if (res.ok) {
          currentCoins = data.updatedCoins;
          currentInventory.push(item.id);
          successfullyBought.push(item);
          onAddAuditLog(
            'market_trade',
            `Loja Especial: Desbloqueou o item cosmético "${item.name}" por ${item.priceKC} KC (Via Carrinho).`,
            undefined,
            item.priceKC
          );
        } else {
          showToast(`Erro ao adquirir "${item.name}": ${data.error}`, "error");
        }
      } catch (err) {
        console.error("Cart checkout item purchase failure", err);
      }
    }

    updateUser({
      coins: currentCoins,
      inventory: currentInventory
    });

    if (successfullyBought.length > 0) {
      const highestRarity = successfullyBought.find(it => ['LEGENDARY', 'MYTHIC', 'Lendário', 'Mítico'].includes(it.rarity?.toUpperCase() || '')) || successfullyBought[0];
      setSuccessAnimationItem({
        ...highestRarity,
        isBundle: true,
        bundleCount: successfullyBought.length,
        bundleList: successfullyBought
      });
      showToast(`Sucesso! ${successfullyBought.length} item(ns) adicionado(s) à sua mochila!`, "success");
    }

    const cached = localStorage.getItem('jiuspeak_user_profile_v2');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        parsed.coins = currentCoins;
        parsed.inventory = currentInventory;
        localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(parsed));
      } catch (e) {}
    }

    setCart([]);
    setIsCartOpen(false);
    setIsCartCheckingOut(false);
    fetchStoreProducts();
  };

  // Authenticated participant database chest inventory
  const [unlockedItems, setUnlockedItems] = useState<any[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);

  // Load and cache virtual store listings with optimized structures
  const fetchStoreProducts = async () => {
    setIsStoreLoading(true);
    try {
      let apiCategory = storeCategory;
      if (storeCategory === 'Avatares') apiCategory = 'AVATAR';
      else if (storeCategory === 'Molduras') apiCategory = 'FRAME';
      else if (storeCategory === 'Títulos') apiCategory = 'TITLE';
      else if (storeCategory === 'Emotes') apiCategory = 'EMOTE';
      else if (storeCategory === 'Efeitos Especiais') apiCategory = 'EFFECT';

      let apiRarity = storeRarity;
      if (storeRarity === 'Comum') apiRarity = 'COMMON';
      else if (storeRarity === 'Raro') apiRarity = 'RARE';
      else if (storeRarity === 'Épico') apiRarity = 'EPIC';
      else if (storeRarity === 'Lendário') apiRarity = 'LEGENDARY';
      else if (storeRarity === 'Mítico') apiRarity = 'MYTHIC';

      const token = localStorage.getItem('jiuspeak_access_token');
      const url = `/api/store?category=${apiCategory}&rarity=${apiRarity}&search=${encodeURIComponent(storeSearch)}&page=${storePage}&limit=8`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token || ''}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setStoreProducts(data.items);
        setStoreTotalPages(data.pagination.totalPages || 1);
        setStoreTotalItems(data.pagination.total || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar catálogo da Loja:", error);
    } finally {
      setIsStoreLoading(false);
    }
  };

  // Direct buy handler utilizing Express Secure Transaction Layer
  const handlePurchaseProduct = async (product: any) => {
    if (user.coins < product.priceKC) {
      showToast(`Kimono Coins insuficientes! Você possui ${user.coins} KC e este item custa ${product.priceKC} KC. Complete tarefas ou use cheats se necessário.`, "error");
      return;
    }

    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) {
      showToast("Sessão expirada. Por favor, faça login novamente.", "error");
      return;
    }

    setPurchasingProductId(product.id);
    try {
      const res = await fetch("/api/store/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro no processamento contábil de sua compra.", "error");
        return;
      }

      // Update parent states instantly for layout reactivity 
      updateUser({
        coins: data.updatedCoins,
        inventory: [...user.inventory, product.id]
      });

      // Trigger animation event with full stats 
      setSuccessAnimationItem(product);

      onAddAuditLog(
        'market_trade',
        `Loja Especial: Atleta desbloqueou o item cosmético "${product.name}" por ${product.priceKC} KC.`,
        undefined,
        product.priceKC
      );

      showToast(`Parabéns! "${product.name}" foi desbloqueado com sucesso!`, "success");
      
      // Update local storage representation in sync
      const cached = localStorage.getItem('jiuspeak_user_profile_v2');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          parsed.coins = data.updatedCoins;
          parsed.inventory = [...(parsed.inventory || []), product.id];
          localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(parsed));
        } catch (e) {}
      }

      // Refresh listings
      fetchStoreProducts();

    } catch (err) {
      console.error("Erro em transação de recursos da loja:", err);
      showToast("Falha de comunicação de rede nos servidores de faturamento.", "error");
    } finally {
      setPurchasingProductId(null);
    }
  };

  // Refresh user locker assets from backend database values
  const fetchUnlockedInventory = async () => {
    setIsInventoryLoading(true);
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      if (token) {
        const res = await fetch('/api/inventory', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data && data.success) {
          setUnlockedItems(data.items);
        }
      }
    } catch (err) {
      console.error("Falha ao sincronizar inventário:", err);
    } finally {
      setIsInventoryLoading(false);
    }
  };

  // React Query style cache trackers
  useEffect(() => {
    if (activeSubTab === 'loja') {
      fetchStoreProducts();
    }
  }, [storeCategory, storeRarity, storeSearch, storePage, activeSubTab]);

  useEffect(() => {
    if (activeSubTab === 'inventorio') {
      fetchUnlockedInventory();
    }
  }, [activeSubTab]);
  
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
    const r = rarity?.toUpperCase();
    switch (r) {
      case 'COMUM':
      case 'COMMON': 
        return 'bg-slate-800 text-slate-350 border-slate-700';
      case 'RARO':
      case 'RARE': 
        return 'bg-blue-600/10 text-blue-400 border-blue-500/20';
      case 'ÉPICO':
      case 'EPIC': 
        return 'bg-purple-650/10 text-purple-400 border-purple-500/20';
      case 'LENDÁRIO':
      case 'LEGENDARY': 
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse';
      case 'MÍTICO':
      case 'MYTHIC': 
        return 'bg-gradient-to-r from-red-500/15 to-orange-500/15 text-orange-400 border-orange-500/40 font-bold animate-pulse';
      default: 
        return 'bg-slate-800 text-slate-350';
    }
  };

  const getRarityLabel = (rarity: string) => {
    const r = rarity?.toUpperCase();
    switch (r) {
      case 'COMMON':
      case 'COMUM': return 'Comum';
      case 'RARE':
      case 'RARO': return 'Raro';
      case 'EPIC':
      case 'ÉPICO': return 'Épico';
      case 'LEGENDARY':
      case 'LENDÁRIO': return 'Lendário';
      case 'MYTHIC':
      case 'MÍTICO': return 'Mítico';
      default: return rarity || 'Comum';
    }
  };

  return (
    <div className="space-y-6" id="bjj-store-marketplace">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-xl md:text-2xl font-display font-extrabold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-violet-400" />
            <span>Biblioteca de Recursos & Guias de Estudo</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Desbloqueie guias de conversação, cheat sheets oficiais de arbitragem, dicionários ilustrados e áudio-guias de tatame.
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
              <span className="block text-[9px] text-slate-500 font-mono">CLUB STATUS</span>
              <span className="text-sm font-bold text-slate-202 truncate max-w-[120px]">{user.subscription.type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Economics selector micro tabs */}
      <div className="flex border-b border-slate-800 gap-1">
        {[
          { id: 'loja', label: '📖 Materiais Oficiais', desc: 'Desbloquear com KC' },
          { id: 'market', label: '🤝 Swap de Conteúdo', desc: 'Trocas entre alunos' },
          { id: 'inventorio', label: '🎒 Biblioteca Pessoal', desc: `${user.inventory.length} itens` },
          { id: 'vip', label: '👑 Planos Premium VIP', desc: 'BRL / Pix' }
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
      {activeSubTab === 'loja' && (
        <div className="space-y-8">
          
          {/* A. HEROIC SPOTLIGHT BANNER (Destaque do Dia) */}
          {storeProducts.length > 0 && (
            (() => {
              // Automatically pick a legendary/mythic item or first available
              const featured = storeProducts.find(p => 
                ['LEGENDARY', 'MYTHIC', 'Lendário', 'Mítico'].includes(p.rarity?.toUpperCase() || '')
              ) || storeProducts[0];

              const getCategoryIcon = (cat: string) => {
                switch (cat?.toUpperCase()) {
                  case 'AVATAR': return '👤';
                  case 'FRAME': return '🖼️';
                  case 'TITLE': return '🏷️';
                  case 'EMOTE': return '💬';
                  case 'EFFECT': return '✨';
                  default: return '🥋';
                }
              };

              const isAlreadyOwned = user.inventory.includes(featured.id);

              return (
                <div 
                  id={`featured-[${featured.id}]`} 
                  className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col xl:flex-row group"
                >
                  {/* Subtle panning background grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />
                  
                  {/* Glowing core orb */}
                  <div className="absolute -right-20 -top-20 w-85 h-85 rounded-full bg-amber-500/10 blur-3xl" />

                  {/* Left content block */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between relative z-10 space-y-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-amber-500 text-slate-950 text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/10">
                          <Flame className="w-3.5 h-3.5 animate-pulse" />
                          <span>Oferta Especial Limitada</span>
                        </span>
                        
                        <span className="bg-slate-900/90 border border-slate-800 text-slate-300 text-[10px] font-mono px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="text-violet-400 w-3.5 h-3.5 shrink-0" />
                          <span>Expira em: <strong className="text-white font-bold">{timeLeft}</strong></span>
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-display font-black text-white leading-tight tracking-tight drop-shadow-md">
                        {featured.name}
                      </h2>
                      <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
                        {featured.description || "Consiga este cosmético elite de jiu-jitsu e personalize seu perfil com status profissional para comemorar suas vitórias na arena competitiva."}
                      </p>
                    </div>

                    {/* Stock tracker bar */}
                    <div className="max-w-md w-full space-y-1 bg-slate-900/50 p-3 rounded-xl border border-slate-850">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-455">
                        <span className="flex items-center gap-1 text-red-400"><Flame className="w-3.5 h-3.5" /> Altíssima Demanda!</span>
                        <span className="font-bold text-white">88% Adquirido</span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 rounded-full animate-pulse" style={{ width: '88%' }} />
                      </div>
                      <p className="text-[9px] text-slate-500 text-right font-mono">Restam pouquíssimas unidades de lote virtual</p>
                    </div>

                    {/* Purchase actions row */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-900">
                      <div>
                        <span className="text-[9px] text-slate-505 font-mono block uppercase">Valor de Desbloqueio</span>
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-5 h-5 text-yellow-500" />
                          <span className="text-xl font-mono font-black text-white">{featured.priceKC}</span>
                          <span className="text-xs text-slate-500 font-mono">KC</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isAlreadyOwned ? (
                          <div className="px-5 py-2.5 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 uppercase font-sans">
                            <Check className="w-4 h-4" /> Unlocked na Mochila
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handlePurchaseProduct(featured)}
                              disabled={purchasingProductId === featured.id}
                              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              {purchasingProductId === featured.id ? (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                              ) : "RESGATAR AGORA"}
                            </button>

                            <button
                              onClick={() => addToCart(featured)}
                              className="p-2.5 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                              title="Adicionar ao Carrinho"
                            >
                              <ShoppingCart className="w-4.5 h-4.5" />
                              <span>+ Carrinho</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right massive visuals block */}
                  <div className="xl:w-80 h-52 xl:h-auto bg-gradient-to-b from-slate-900 to-black shrink-0 flex items-center justify-center p-6 border-t xl:border-t-0 xl:border-l border-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-gradient-to-b from-amber-500/10 to-transparent opacity-80" />
                    
                    {/* Rotating star back effect */}
                    <div className="absolute w-40 h-40 rounded-full border border-dashed border-amber-500/20 animate-[spin_40s_linear_infinite]" />

                    <div className="relative group-hover:scale-110 transition-transform duration-500 flex flex-col items-center">
                      {featured.imageUrl ? (
                        <div className="w-28 h-28 rounded-2xl overflow-hidden border border-amber-500/40 p-1 bg-slate-950/70 shadow-2xl relative">
                          <img 
                            src={featured.imageUrl} 
                            alt={featured.name} 
                            className="w-full h-full object-cover rounded-xl opacity-90"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        <div className="text-7xl drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)] filter transform hover:rotate-6 transition-transform">
                          {getCategoryIcon(featured.category)}
                        </div>
                      )}
                      
                      <span className="mt-4 bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                        {featured.category} Rarity Elite
                      </span>
                    </div>
                  </div>

                </div>
              );
            })()
          )}

          {/* B. SMART PERSONALIZED SUGGESTIONS (Sugeridos para Você) */}
          {storeProducts.length > 0 && (
            (() => {
              // Filter products user can afford and doesn't own yet
              const affordableAndUnpossessed = storeProducts.filter(p => 
                p.priceKC <= user.coins && !user.inventory.includes(p.id)
              ).slice(0, 3);

              if (affordableAndUnpossessed.length === 0) return null;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-emerald-500 rounded" />
                      <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-400">
                        Sugeridos Para Você (Seu Saldo Permite)
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Simulação com {user.coins} KC</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="recommended-products-tray">
                    {affordableAndUnpossessed.map(p => {
                      return (
                        <div 
                          key={`rec-${p.id}`} 
                          className="bg-emerald-950/10 hover:bg-emerald-950/20 hover:border-emerald-500/30 border border-emerald-900/20 rounded-xl p-3.5 flex justify-between items-center transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{p.imageUrl ? '🖼️' : '🥋'}</span>
                            <div>
                              <h5 className="font-bold text-xs text-white line-clamp-1">{p.name}</h5>
                              <span className="text-[9px] uppercase font-mono text-slate-500">{p.rarity}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                <span className="text-xs font-bold font-mono text-slate-101">{p.priceKC}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => addToCart(p)}
                              className="p-1.5 bg-emerald-650 hover:bg-emerald-500 text-slate-950 rounded-lg transition-transform group-hover:scale-105 cursor-pointer"
                              title="Adicionar ao Carrinho"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}

          {/* C. GENERAL CATALOGUE TOOLBAR WITH SEARCH / FILTERS */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-sm shadow-black">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Category Pills Selector */}
              <div className="flex flex-wrap gap-1.5 animate-fade-in" id="store-category-filters">
                {['Todos', 'Avatares', 'Molduras', 'Títulos', 'Emotes', 'Efeitos Especiais'].map((cat) => {
                  const isActive = storeCategory === cat;
                  return (
                    <button
                      key={cat}
                      id={`btn-cat-${cat.toLowerCase().replace(' ', '-')}`}
                      onClick={() => { setStoreCategory(cat); setStorePage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Live Search Input with magnification */}
              <div className="relative group max-w-sm w-full">
                <input
                  type="text"
                  placeholder="Buscar cosméticos..."
                  value={storeSearch}
                  onChange={(e) => { setStoreSearch(e.target.value); setStorePage(1); }}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 text-slate-100 rounded-lg border border-slate-850 focus:border-violet-500 focus:outline-none transition-all placeholder-slate-550 font-mono"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              </div>

            </div>

            {/* Rarity filtration pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-950/40">
              <span className="text-[10px] uppercase font-mono text-slate-500 mr-2">Filtrar por Raridade:</span>
              <div className="flex flex-wrap gap-1.5" id="store-rarity-filters">
                {['Todos', 'Comum', 'Raro', 'Épico', 'Lendário', 'Mítico'].map((rarity) => {
                  const isActive = storeRarity === rarity;
                  
                  // Stylized gaming pill coloring
                  const pillStyle = () => {
                    if (!isActive) return 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-slate-100';
                    switch (rarity) {
                      case 'Todos': return 'bg-slate-800 text-slate-200';
                      case 'Comum': return 'bg-slate-700/60 text-slate-200 border border-slate-650';
                      case 'Raro': return 'bg-blue-650/80 text-white border border-blue-500/40';
                      case 'Épico': return 'bg-purple-650/80 text-white border border-purple-500/40';
                      case 'Lendário': return 'bg-amber-500 text-slate-950 font-bold shadow shadow-amber-500/10';
                      case 'Mítico': return 'bg-gradient-to-r from-red-600 to-orange-500 text-white font-extrabold shadow shadow-red-500/20';
                      default: return '';
                    }
                  };

                  return (
                    <button
                      key={rarity}
                      id={`btn-rarity-${rarity.toLowerCase()}`}
                      onClick={() => { setStoreRarity(rarity); setStorePage(1); }}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${pillStyle()}`}
                    >
                      {rarity}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* D. PRODUCT LISTING GRID */}
          {isStoreLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400 font-mono text-center">Abrindo catálogo de cosméticos na base de dados...</p>
            </div>
          ) : storeProducts.length === 0 ? (
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <Sparkle className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-40 animate-pulse" />
              <p className="text-sm font-semibold">Nenhum cosmético corresponde aos filtros escolhidos.</p>
              <p className="text-xs text-slate-600 mt-1 font-mono">Pesquise por outro nome de item ou redefina os filtros selecionados.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" id="store-product-grid">
                {storeProducts.map((product) => {
                  const isOwned = user.inventory.includes(product.id);
                  const isBusy = purchasingProductId === product.id;
                  
                  const isPromo = promoProductIds.includes(product.id);
                  const isLimited = limitedProductIds.includes(product.id);

                  // Setup detailed pricing
                  const displayPrice = product.priceKC;
                  const originalPrice = isPromo ? Math.floor(product.priceKC * 1.25) : null;

                  const getCategoryDisplay = (cat: string) => {
                    switch (cat?.toUpperCase()) {
                      case 'AVATAR': return { icon: '👤', name: 'Avatar' };
                      case 'FRAME': return { icon: '🖼️', name: 'Moldura' };
                      case 'TITLE': return { icon: '🏷️', name: 'Título' };
                      case 'EMOTE': return { icon: '💬', name: 'Emote' };
                      case 'EFFECT': return { icon: '✨', name: 'Efe. Especial' };
                      default: return { icon: '🥋', name: 'Suporte' };
                    }
                  };

                  const catDisplay = getCategoryDisplay(product.category);

                  // Custom border and shadow coloring classes according to esports tier
                  const getEsportsCardTheme = (rar: string) => {
                    const r = rar?.toUpperCase();
                    switch(r) {
                      case 'COMMON':
                      case 'COMUM': 
                        return 'border-slate-850 hover:border-slate-700 hover:shadow-slate-900/10';
                      case 'RARE':
                      case 'RARO':
                        return 'border-blue-900/40 shadow-[0_0_15px_-4px_rgba(6,182,212,0.1)] hover:border-blue-500/40 hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.25)]';
                      case 'EPIC':
                      case 'ÉPICO':
                        return 'border-purple-900/40 shadow-[0_0_15px_-4px_rgba(168,85,247,0.1)] hover:border-purple-500/50 hover:shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)] bg-gradient-to-b from-purple-950/5 to-slate-950/10';
                      case 'LEGENDARY':
                      case 'LENDÁRIO':
                        return 'border-amber-500/25 shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)] hover:border-amber-400/70 hover:shadow-[0_0_25px_-3px_rgba(245,158,11,0.35)] bg-gradient-to-b from-amber-950/10 to-slate-950/15';
                      case 'MYTHIC':
                      case 'MÍTICO':
                        return 'border-red-500/35 shadow-[0_0_25px_-5px_rgba(239,68,68,0.2)] hover:border-red-400 hover:shadow-[0_0_30px_-3px_rgba(239,68,68,0.45)] bg-gradient-to-b from-red-950/10 to-slate-950/20';
                      default:
                        return 'border-slate-800';
                    }
                  };

                  return (
                    <div
                      key={product.id}
                      id={`product-card-${product.id}`}
                      className={`bg-slate-950/65 rounded-2xl border flex flex-col justify-between overflow-hidden group hover:scale-[1.03] transition-all duration-300 relative ${getEsportsCardTheme(product.rarity)}`}
                    >
                      {/* Interactive shine sweep */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                      {/* Promo tag */}
                      {isPromo && (
                        <span className="absolute top-3 right-3 bg-red-650 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md z-15 tracking-wider shadow-lg flex items-center gap-1">
                          <Percent className="w-2.5 h-2.5" /> -20% OFF
                        </span>
                      )}

                      {/* Hot limited deal badge */}
                      {isLimited && !isPromo && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-md z-15 tracking-wider flex items-center gap-1 animate-pulse">
                          <Flame className="w-2.5 h-2.5" /> RARO LOTE
                        </span>
                      )}

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 relative z-10">
                        <div>
                          {/* Image Box / Visualizer with high glare */}
                          <div className="h-32 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-850 mb-3 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 opacity-90"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-4xl filter drop-shadow group-hover:animate-bounce transition-transform">{catDisplay.icon}</div>
                            )}

                            {/* Class Badge */}
                            <span className="absolute bottom-2 left-2 bg-slate-950/95 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-semibold text-slate-200 border border-slate-850 flex items-center gap-1">
                              <span>{catDisplay.icon}</span>
                              <span>{catDisplay.name}</span>
                            </span>

                            {/* Rarity Star Badge */}
                            <span className={`absolute top-2 left-2 text-[8px] font-extrabold px-2 py-0.5 rounded-full border tracking-wide uppercase ${getRarityBadgeColor(product.rarity)} flex items-center gap-1`}>
                              <Sparkle className="w-2.5 h-2.5 fill-current" />
                              <span>{getRarityLabel(product.rarity)}</span>
                            </span>
                          </div>

                          {/* Titles */}
                          <div className="space-y-1">
                            <h4 className="font-display font-black text-xs text-white leading-tight line-clamp-1 group-hover:text-violet-300 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-slate-450 leading-relaxed font-normal line-clamp-2 h-7 overflow-hidden">
                              {product.description || "Customização cosmética oficial para enriquecer sua jornada acadêmica na nossa sandbox de lutas."}
                            </p>
                          </div>
                        </div>

                        {/* Spark stock depletion meter if item is limited */}
                        {isLimited && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-mono text-slate-500">
                              <span>Restam poucas unidades</span>
                              <span className="font-bold text-red-400">Apenas 3 restam!</span>
                            </div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500" style={{ width: '20%' }} />
                            </div>
                          </div>
                        )}

                        {/* Dynamic purchase layout pricing */}
                        <div className="pt-2 border-t border-slate-905 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] text-slate-500 font-mono block">RESGATE</span>
                            <div className="flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-yellow-500" />
                              <span className="text-xs font-mono font-black text-white">{displayPrice}</span>
                              {originalPrice && (
                                <span className="text-[9px] text-slate-500 font-mono line-through ml-1">{originalPrice}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            {isOwned ? (
                              <span className="bg-slate-900 text-slate-500 border border-slate-850 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase">
                                ADQUIRIDO
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handlePurchaseProduct(product)}
                                  disabled={isBusy}
                                  className="px-2.5 py-1.5 bg-violet-650 hover:bg-violet-600 active:scale-95 text-white font-bold text-[10px] uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                  title={`Adquirir por ${product.priceKC} KC`}
                                >
                                  {isBusy ? (
                                    <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                  ) : "RESGATAR"}
                                </button>

                                <button
                                  onClick={() => addToCart(product)}
                                  className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:text-white hover:border-slate-700 rounded-lg text-slate-400 transition-colors cursor-pointer flex items-center"
                                  title="Adicionar ao Carrinho"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Classic Pagination structure */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-900 text-xs text-slate-500 font-mono">
                <div>
                  Visualizando <span className="text-slate-300 font-bold">{storeProducts.length}</span> de <span className="text-slate-300 font-bold">{storeTotalItems}</span> cosméticos listados
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={storePage === 1}
                    onClick={() => setStorePage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all text-slate-300 hover:text-white cursor-pointer"
                    id="btn-prev-page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: storeTotalPages }).map((_, idx) => {
                    const pageNo = idx + 1;
                    const isCurrent = pageNo === storePage;
                    return (
                      <button
                        key={pageNo}
                        onClick={() => setStorePage(pageNo)}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-violet-600/20 text-violet-300 border border-violet-500'
                            : 'bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {pageNo}
                      </button>
                    );
                  })}

                  <button
                    disabled={storePage === storeTotalPages}
                    onClick={() => setStorePage(prev => Math.min(storeTotalPages, prev + 1))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all text-slate-300 hover:text-white cursor-pointer"
                    id="btn-next-page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

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
          {isInventoryLoading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500 font-mono">Abrindo mochila BJJ do atleta...</p>
            </div>
          ) : unlockedItems.length === 0 && user.inventory.length === 0 ? (
            <div className="py-12 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
              Sua biblioteca de materiais está vazia! Participe das lições e da arena prática para acumular Kimono Coins e desbloquear materiais na loja virtual.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" id="inventory-grid">
              {/* Database-unlocked items */}
              {unlockedItems.map((item) => {
                const getCategoryDisplay = (cat: string) => {
                  const c = cat?.toUpperCase();
                  switch (c) {
                    case 'AVATAR': return { icon: '👤', name: 'Avatar' };
                    case 'FRAME': return { icon: '🖼️', name: 'Moldura' };
                    case 'TITLE': return { icon: '🏷️', name: 'Título' };
                    case 'EMOTE': return { icon: '💬', name: 'Emote' };
                    case 'EFFECT': return { icon: '✨', name: 'Efe. Especial' };
                    default: return { icon: '🎒', name: 'Insígnia' };
                  }
                };
                const catDisplay = getCategoryDisplay(item.rarity || item.productId);
                
                return (
                  <div 
                    key={item.id}
                    className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-slate-700/80 transition-colors"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                          {getRarityLabel(item.rarity)}
                        </span>
                        <span className="text-xs filter drop-shadow">💎</span>
                      </div>
                      
                      <h4 className="font-display font-bold text-xs text-slate-200 mt-2">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/40 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-mono text-[9px]">ID: {item.productId?.replace('prod_', '')}</span>
                      <span className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 font-bold px-2 py-0.5 rounded">
                        🎒 Na Mochila
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Offline fallback / user profile sync */}
              {user.inventory.filter(invId => !unlockedItems.some(ui => ui.productId === invId)).map((invId) => {
                const item = LOJA_ITEMS.find(i => i.id === invId) || {
                  id: invId,
                  name: 'Guia de Conversação Prático',
                  description: 'Recurso cosmético ou técnico cadastrado em seu painel.',
                  category: 'TITLE',
                  rarity: 'COMMON',
                };

                return (
                  <div 
                    key={invId}
                    className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-slate-755 hover:transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">
                          {getRarityLabel(item.rarity as any)}
                        </span>
                        <span className="text-xs">🥋</span>
                      </div>
                      
                      <h4 className="font-display font-bold text-xs text-slate-200 mt-2">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/40 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-mono text-[9px]">Offline Sync</span>
                      <span className="bg-violet-950/40 border border-violet-900/60 text-violet-300 font-bold px-2 py-0.5 rounded">
                        🎒 Ativo
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

      {/* 5. SUCCESS TRANSACTION ANIMATION DIALOG OVERLAY */}
      <AnimatePresence>
        {successAnimationItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 shadow-2xl"
            id="store-purchase-success-overlay"
          >
            {/* AAA Competitive Game Confetti Rain Effect */}
            <ConfettiRain />

            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-3xl p-6 text-center space-y-5 relative overflow-hidden shadow-2xl shadow-violet-500/10 z-10"
            >
              {/* Spinning shiny light rays background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/15 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Top status indicator header */}
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl shadow-lg shadow-emerald-500/10 animate-bounce">
                🎉
              </div>

              <div className="space-y-1.5 relative z-10">
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-violet-400 bg-violet-955/40 px-2 py-0.5 border border-violet-900/30 rounded-full inline-block">Desbloqueio efetuado!</span>
                <h3 className="text-glow-indigo text-xl font-display font-black text-white">
                  Compra Concluída!
                </h3>
                <p className="text-[11px] text-slate-450 max-w-xs mx-auto leading-normal font-sans">
                  Seus Kimono Coins (KC) foram computados com sucesso e o item cosmético já está na sua biblioteca portátil de conquistas.
                </p>
              </div>

              {/* Custom card showcase inside animation itembox */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850 relative z-10 flex flex-col items-center gap-2">
                
                {successAnimationItem.imageUrl ? (
                  <img
                    src={successAnimationItem.imageUrl}
                    alt={successAnimationItem.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-850 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-4xl my-1 animate-[spin_10s_linear_infinite]">
                    {successAnimationItem.category?.toUpperCase() === 'AVATAR' ? '👤' : 
                     successAnimationItem.category?.toUpperCase() === 'FRAME' ? '🖼️' :
                     successAnimationItem.category?.toUpperCase() === 'TITLE' ? '🏷️' :
                     successAnimationItem.category?.toUpperCase() === 'EMOTE' ? '💬' : '✨'}
                  </div>
                )}

                <div className="leading-tight text-center">
                  <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded-full border ${getRarityBadgeColor(successAnimationItem.rarity)} uppercase inline-block`}>
                    {getRarityLabel(successAnimationItem.rarity)}
                  </span>
                  <p className="font-display font-bold text-slate-200 text-xs mt-2">{successAnimationItem.name}</p>
                  <p className="text-[10px] text-slate-500 leading-normal font-sans mt-1 px-2">{successAnimationItem.description}</p>
                </div>

              </div>

              {/* Close Button */}
              <button
                id="btn-close-success-anim"
                onClick={() => setSuccessAnimationItem(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-slate-105 text-xs font-bold transition-all shadow-md shadow-violet-950/50 cursor-pointer relative z-10"
              >
                Voltar ao Tatame
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. ESLYT SHINY SLIDEOUT SHOPPING CART DRAWER (Carrinho Visual) */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" id="visual-shopping-cart-drawer">
            {/* Dark back layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Slider Drawer Side */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="w-screen max-w-md bg-slate-950 border-l border-slate-900 shadow-2xl flex flex-col justify-between relative"
              >
                {/* Visual Glow Header background line */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-550 via-indigo-500 to-emerald-400" />

                {/* A. HEADER SECTION */}
                <div className="p-6 border-b border-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-sm text-white">Carrinho Desportivo</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Resgate múltiplo de cosméticos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cart.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="text-[10px] font-mono text-slate-500 hover:text-red-400 px-2 py-1 rounded hover:bg-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                        title="Limpar todos os itens"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Esvaziar</span>
                      </button>
                    )}
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5 font-bold" />
                    </button>
                  </div>
                </div>

                {/* B. LIST OF CHOSEN ITEMS */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                      <div className="text-4xl p-5 bg-slate-900 border border-slate-850 rounded-full animate-pulse text-slate-600">
                        🛒
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-300">Carrinho Vazio</h4>
                        <p className="text-[10px] text-slate-500 font-sans max-w-xs leading-normal">
                          Seu carrinho virtual de equipamentos não tem nenhum item pendente de aprovação. Navegue pela loja e clique no ícone de carrinho para carregar.
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all"
                      >
                        Ver Loja Oficial
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{cart.length} Cosméticos Selecionados</p>
                      
                      {cart.map((item) => {
                        const isPossessed = user.inventory.includes(item.id);
                        return (
                          <div 
                            key={`cart-item-${item.id}`}
                            className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex justify-between items-center hover:border-slate-800 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-slate-950 rounded-lg flex items-center justify-center text-xl border border-slate-900">
                                  {item.category?.toUpperCase() === 'AVATAR' ? '👤' : 
                                   item.category?.toUpperCase() === 'FRAME' ? '🖼️' :
                                   item.category?.toUpperCase() === 'TITLE' ? '🏷️' : '🥋'}
                                </div>
                              )}
                              
                              <div>
                                <h5 className="text-xs font-bold text-slate-200 line-clamp-1">{item.name}</h5>
                                <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-0.5">
                                  <span className="uppercase font-mono">{item.category}</span>
                                  <span>•</span>
                                  <span className="text-violet-400 font-semibold">{getRarityLabel(item.rarity)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="flex items-center gap-1">
                                  <Coins className="w-3 h-3 text-yellow-500" />
                                  <span className="text-xs font-mono font-bold text-slate-300">{item.priceKC}</span>
                                </div>
                                {isPossessed && <span className="text-[8px] text-red-400 font-sans block">Já obtido!</span>}
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1 px-1.5 hover:bg-red-950/10 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                                title="Remover"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* C. DRAWER FOOTER SUB-SECTION WITH SUMMARY & ACTIONS */}
                {cart.length > 0 && (
                  <div className="p-6 bg-slate-950/80 border-t border-slate-900 space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Saldo Atual do Aluno:</span>
                        <span className="font-mono font-bold text-slate-200 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-yellow-500" />
                          <span>{user.coins} KC</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-300">Total do Carrinho (Resgate):</span>
                        <span className="font-mono text-white text-base flex items-center gap-1 text-glow-indigo">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span>{cart.reduce((sum, item) => sum + item.priceKC, 0)} KC</span>
                        </span>
                      </div>
                    </div>

                    {(() => {
                      const cartTotal = cart.reduce((sum, it) => sum + it.priceKC, 0);
                      const isAffordable = user.coins >= cartTotal;

                      return (
                        <div className="space-y-2">
                          <button
                            disabled={isCartCheckingOut || !isAffordable}
                            onClick={handleCheckoutCart}
                            className={`w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-900 disabled:to-slate-950 disabled:text-slate-650 disabled:border-slate-850 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${isAffordable ? 'shadow-violet-600/10' : ''}`}
                          >
                            {isCartCheckingOut ? (
                              <>
                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                <span>Processando Desbloqueios...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Concluir Resgate Coletivo</span>
                              </>
                            )}
                          </button>

                          {!isAffordable && (
                            <div className="p-3 bg-red-950/20 border border-red-900/20 text-red-400 rounded-xl text-[10px] text-center font-sans space-y-1">
                              <p className="font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                                <Info className="w-3.5 h-3.5" /> Saldo KC Insuficiente
                              </p>
                              <p className="opacity-90 font-normal">
                                Você precisa de mais <strong>{cartTotal - user.coins} KC</strong> para aprovar esta transação. Jogue partidas ou use o painel de faturamento para carregar tokens imediatos!
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. FLOATING CAR COUNTER TRIGGER BUTTON */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-500/40 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer animate-bounce flex items-center justify-center"
          title="Ver meu Carrinho de Cosméticos"
          id="floating-cart-trigger"
        >
          <ShoppingCart className="w-5.5 h-5.5" />
          <span className="absolute -top-1 -right-1 bg-red-650 border border-slate-950 text-white text-[9.5px] font-mono font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {cart.length}
          </span>
        </button>
      )}

    </div>
  );
}
