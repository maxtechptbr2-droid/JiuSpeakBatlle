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
  onAddAuditLog: (type: any, desc: string, amtBRL?: number, amtJT?: number) => void;
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
  
  // Tabs within economics: 'loja' | 'market' | 'inventorio' | 'admin_store'
  const [activeSubTab, setActiveSubTab] = useState<'loja' | 'market' | 'inventorio' | 'admin_store'>('loja');
  const [viewItemModal, setViewItemModal] = useState<any | null>(null);

  // Admin Store control states
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [isAdminListLoading, setIsAdminListLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState('Todos');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminModalMode, setAdminModalMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [adminForm, setAdminForm] = useState({
    name: '',
    description: '',
    priceJT: 500,
    priceBRL: '',
    category: 'AVATAR',
    rarity: 'COMMON',
    imageUrl: '',
    stock: '',
    active: true,
    isPromo: false,
    promoPriceJT: '',
    isBundle: false,
    isSeasonal: false,
    isExclusive: false
  });

  const fetchAdminProducts = async () => {
    setIsAdminListLoading(true);
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const url = `/api/admin/store/items?category=${adminCategory}&search=${encodeURIComponent(adminSearch)}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token || ''}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setAdminProducts(data.items);
      }
    } catch (e) {
      console.error("Erro ao carregar itens admin:", e);
    } finally {
      setIsAdminListLoading(false);
    }
  };

  const handleCreateOrUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) {
      showToast("Você não está autenticado.", "error");
      return;
    }

    const payload = {
      ...adminForm,
      priceJT: Number(adminForm.priceJT),
      priceBRL: adminForm.priceBRL !== "" ? Number(adminForm.priceBRL) : null,
      stock: adminForm.stock !== "" ? Number(adminForm.stock) : null,
      promoPriceJT: adminForm.promoPriceJT !== "" ? Number(adminForm.promoPriceJT) : null
    };

    try {
      const url = adminModalMode === 'create' 
        ? "/api/admin/store/create" 
        : `/api/admin/store/${editingItem.id}/update`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, "success");
        setShowAdminModal(false);
        fetchAdminProducts();
        fetchStoreProducts();
      } else {
        showToast(data.error || "Erro ao salvar item.", "error");
      }
    } catch (err) {
      showToast("Falha de comunicação com o servidor.", "error");
    }
  };

  const handleDuplicateItem = async (id: string) => {
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/store/${id}/duplicate`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, "success");
        fetchAdminProducts();
        fetchStoreProducts();
      } else {
        showToast(data.error || "Erro ao duplicar item.", "error");
      }
    } catch (err) {
      showToast("Falha de comunicação.", "error");
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza de que deseja excluir permanentemente o item "${name}"?`)) return;
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/store/${id}/delete`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, "success");
        fetchAdminProducts();
        fetchStoreProducts();
      } else {
        showToast(data.error || "Erro ao excluir o item. Ele pode estar referenciado em vendas prévias ou inventários de alunos.", "error");
      }
    } catch (err) {
      showToast("Falha de comunicação ao excluir produto.", "error");
    }
  };

  const openCreateItemModal = () => {
    setAdminForm({
      name: '',
      description: '',
      priceJT: 500,
      priceBRL: '',
      category: 'AVATAR',
      rarity: 'COMMON',
      imageUrl: '',
      stock: '',
      active: true,
      isPromo: false,
      promoPriceJT: '',
      isBundle: false,
      isSeasonal: false,
      isExclusive: false
    });
    setEditingItem(null);
    setAdminModalMode('create');
    setShowAdminModal(true);
  };

  const openEditItemModal = (item: any) => {
    setEditingItem(item);
    setAdminModalMode('edit');
    setAdminForm({
      name: item.name || '',
      description: item.description || '',
      priceJT: item.priceJT || 0,
      priceBRL: item.priceBRL !== null && item.priceBRL !== undefined ? String(item.priceBRL) : '',
      category: item.category || 'AVATAR',
      rarity: item.rarity || 'COMMON',
      imageUrl: item.imageUrl || '',
      stock: item.stock !== null && item.stock !== undefined ? String(item.stock) : '',
      active: item.active !== undefined ? Boolean(item.active) : true,
      isPromo: item.isPromo !== undefined ? Boolean(item.isPromo) : false,
      promoPriceJT: item.promoPriceJT !== null && item.promoPriceJT !== undefined ? String(item.promoPriceJT) : '',
      isBundle: item.isBundle !== undefined ? Boolean(item.isBundle) : false,
      isSeasonal: item.isSeasonal !== undefined ? Boolean(item.isSeasonal) : false,
      isExclusive: item.isExclusive !== undefined ? Boolean(item.isExclusive) : false
    });
    setShowAdminModal(true);
  };

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

  const promoProductIds = ['prod_frame_neon_glaze', 'prod_effect_smoke', 'gi_shibori', 'prod_theme_classic_dark', 'prod_belt_neon_blue'];
  const limitedProductIds = ['prod_frame_gold_aurora', 'prod_effect_galaxy', 'gi_gold', 'prod_theme_cyberpunk_neon', 'prod_belt_rainbow', 'prod_legend_gi_gold'];

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
    const totalCost = cart.reduce((sum, item) => sum + item.priceJT, 0);
    if (user.coins < totalCost) {
      showToast(`JT insuficiente! Total: ${totalCost} JT. Você possui: ${user.coins} JT.`, "error");
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
            `Loja Especial: Desbloqueou o item cosmético "${item.name}" por ${item.priceJT} JT (Via Carrinho).`,
            undefined,
            item.priceJT
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
        console.log('[PROFILE READ]', parsed);
        parsed.coins = currentCoins;
        parsed.inventory = currentInventory;
        localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(parsed));
        console.log('[PROFILE WRITE]', parsed);
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
      let apiCategory = 'Todos';
      if (storeCategory === 'Kimonos') apiCategory = 'Kimonos';
      else if (storeCategory === 'Rash Guards') apiCategory = 'Rash Guards';
      else if (storeCategory === 'Molduras') apiCategory = 'Molduras de Perfil';
      else if (storeCategory === 'Medalhas') apiCategory = 'Medalhas';
      else if (storeCategory === 'Avatares') apiCategory = 'Avatares';

      let apiRarity = storeRarity;
      if (storeRarity === 'Comum') apiRarity = 'COMMON';
      else if (storeRarity === 'Raro') apiRarity = 'RARE';
      else if (storeRarity === 'Épico') apiRarity = 'EPIC';
      else if (storeRarity === 'Lendário') apiRarity = 'LEGENDARY';
      else if (storeRarity === 'Mítico') apiRarity = 'MYTHIC';

      const token = localStorage.getItem('jiuspeak_access_token');
      const url = `/api/store?category=${apiCategory}&rarity=${apiRarity}&search=${encodeURIComponent(storeSearch)}&page=${storePage}&limit=12`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token || ''}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setStoreProducts(data.items);
        setStoreTotalPages(data.pagination.totalPages || 1);
        setStoreTotalItems(data.pagination.totalItems || data.items.length);
      }
    } catch (error) {
      console.error("Erro ao carregar catálogo da Loja:", error);
    } finally {
      setIsStoreLoading(false);
    }
  };

  // Direct buy handler utilizing Express Secure Transaction Layer
  const handlePurchaseProduct = async (product: any) => {
    if (user.coins < product.priceJT) {
      showToast(`JiuTickets insuficientes! Você possui ${user.coins} JT e este item custa ${product.priceJT} JT. Complete tarefas ou use cheats se necessário.`, "error");
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
        `Loja Especial: Atleta desbloqueou o item cosmético "${product.name}" por ${product.priceJT} JT.`,
        undefined,
        product.priceJT
      );

      showToast(`Parabéns! "${product.name}" foi desbloqueado com sucesso!`, "success");
      
      // Update local storage representation in sync
      const cached = localStorage.getItem('jiuspeak_user_profile_v2');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          console.log('[PROFILE READ]', parsed);
          parsed.coins = data.updatedCoins;
          parsed.inventory = [...(parsed.inventory || []), product.id];
          localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(parsed));
          console.log('[PROFILE WRITE]', parsed);
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

  useEffect(() => {
    if (activeSubTab === 'admin_store' && user.role === 'admin') {
      fetchAdminProducts();
    }
  }, [adminCategory, adminSearch, activeSubTab]);
  
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
      showToast(`JiuTickets insuficientes! Você tem ${user.coins} JT e precisa de ${item.price} JT. Participe de lições ou altere cheat codes para testar.`, "error");
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
      `Loja Oficial: Atleta adquiriu cosmetic "${item.name}" por ${item.price} JT.`,
      undefined,
      item.price
    );

    showToast(`Parabéns! "${item.name}" foi adicionado ao seu inventário.`, "success");
  };

  // Resolve visual/name details of inventory item IDs
  const resolveItemDetails = (itId: string) => {
    // 1. Search in unlockedItems (PostgreSQL synchronized items)
    const fromUnlocked = unlockedItems.find(ui => ui.id === itId || ui.productId === itId);
    if (fromUnlocked) {
      return {
        id: fromUnlocked.productId || fromUnlocked.id,
        name: fromUnlocked.name,
        description: fromUnlocked.description || "Recurso cosmético do banco de dados.",
        category: fromUnlocked.category || "Itens Especiais",
        price: 0,
        rarity: fromUnlocked.rarity || "COMMON",
        imageUrl: fromUnlocked.imageUrl || ""
      };
    }

    // 2. Search in storeProducts (active store catalogue fetched loaded state)
    const fromStore = storeProducts.find(sp => sp.id === itId);
    if (fromStore) {
      return {
        id: fromStore.id,
        name: fromStore.name,
        description: fromStore.description || "",
        category: fromStore.category,
        price: fromStore.priceJT,
        rarity: fromStore.rarity,
        imageUrl: fromStore.imageUrl || ""
      };
    }

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
      showToast(`JiuTickets insuficientes! Você precisa de ${item.price} JT e possui ${user.coins} JT.`, "error");
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
        `Mercado Coin: Adquiriu "${item.name}" de "${item.sellerName}" por ${item.price} JT. Comissão foi retida.`,
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
        priceJT: listForm.price
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
    if (setCurrentTab) {
      setCurrentTab('subscriptions');
      setSubscribingTier(null);
    } else {
      showToast('Por favor, navegue até a aba de Assinaturas para obter cobrança real via Mercado Pago.', 'info');
      setSubscribingTier(null);
    }
  };

  const copyPixCode = () => {
    showToast('Processamento exclusivo via aba de Assinaturas.', 'info');
  };

  const getRarityBadgeColor = (rarity: string, productName?: string) => {
    const nameLower = productName?.toLowerCase() || '';
    if (nameLower.includes('eclipse celestial') || nameLower.includes('legado do fundador') || nameLower.includes('neon cyber') || nameLower.includes('ia master futuro')) {
      return 'bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 text-white border-violet-400 font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse';
    }
    if (nameLower.includes('faixa cinza') || nameLower.includes('faixa branca') || nameLower.includes('grey') || nameLower.includes('white')) {
      return 'bg-slate-800 text-slate-350 border-slate-700';
    }
    if (nameLower.includes('faixa amarela') || nameLower.includes('faixa laranja') || nameLower.includes('yellow') || nameLower.includes('orange')) {
      return 'bg-amber-600/10 text-amber-500 border-amber-500/25';
    }
    if (nameLower.includes('faixa verde') || nameLower.includes('faixa azul') || nameLower.includes('green') || nameLower.includes('blue')) {
      return 'bg-blue-600/10 text-blue-400 border-blue-500/20';
    }
    if (nameLower.includes('faixa roxa') || nameLower.includes('faixa marrom') || nameLower.includes('purple') || nameLower.includes('brown')) {
      return 'bg-purple-650/10 text-purple-400 border-purple-500/20';
    }
    if (nameLower.includes('faixa preta') || nameLower.includes('black')) {
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse';
    }
    if (nameLower.includes('faixa coral') || nameLower.includes('coral')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse';
    }
    if (nameLower.includes('faixa vermelha e preta') || nameLower.includes('red_black')) {
      return 'bg-gradient-to-r from-red-650/10 to-slate-900/15 text-red-500 border-red-500/25 font-bold animate-pulse';
    }
    if (nameLower.includes('faixa vermelha e branca') || nameLower.includes('red_white')) {
      return 'bg-gradient-to-r from-red-600/15 to-white/10 text-rose-400 border-rose-400/35 font-extrabold animate-pulse';
    }

    const r = rarity?.toUpperCase();
    switch (r) {
      case 'DIVINE':
      case 'DIVINO':
        return 'bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 text-white border-violet-400 font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse';
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

  const getRarityLabel = (rarity: string, productName?: string) => {
    const nameLower = productName?.toLowerCase() || '';
    if (nameLower.includes('eclipse celestial') || nameLower.includes('legado do fundador') || nameLower.includes('neon cyber') || nameLower.includes('ia master futuro')) {
      return 'Divino';
    }
    if (nameLower.includes('faixa cinza') || nameLower.includes('grey')) return 'Comum';
    if (nameLower.includes('faixa branca') || nameLower.includes('white')) return 'Comum';
    if (nameLower.includes('faixa amarela') || nameLower.includes('yellow')) return 'Incomum';
    if (nameLower.includes('faixa laranja') || nameLower.includes('orange')) return 'Incomum';
    if (nameLower.includes('faixa verde') || nameLower.includes('green')) return 'Raro';
    if (nameLower.includes('faixa azul') || nameLower.includes('blue')) return 'Raro';
    if (nameLower.includes('faixa roxa') || nameLower.includes('purple')) return 'Épico';
    if (nameLower.includes('faixa marrom') || nameLower.includes('brown')) return 'Épico';
    if (nameLower.includes('faixa preta') || nameLower.includes('black')) return 'Lendário';
    if (nameLower.includes('faixa coral') || nameLower.includes('coral')) return 'Mestre';
    if (nameLower.includes('faixa vermelha e preta') || nameLower.includes('red_black')) return 'Grão-Mestre';
    if (nameLower.includes('faixa vermelha e branca') || nameLower.includes('red_white')) return 'Mestre Supremo';

    const r = rarity?.toUpperCase();
    switch (r) {
      case 'DIVINE':
      case 'DIVINO': return 'Divino';
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-950/60 p-6 rounded-xl border border-zinc-900 shadow-xl" id="bjj-store-header-panel">
        <div>
          <span className="text-[9px] bg-red-955/20 text-red-400 border border-red-900/40 font-mono font-bold uppercase py-1 px-2.5 rounded tracking-widest block w-fit">
            BOUTIQUE DE IDENTIDADE MARCIAL
          </span>
          <h3 className="text-xl md:text-2xl font-mono font-black text-white flex items-center gap-2 mt-2.5 tracking-tight uppercase">
            <Store className="w-5 h-5 text-red-500" />
            <span>LOJA EXCLUSIVA</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Personalize sua presença com armaduras digitais de elite: kimonos refinados, rash guards exclusivas, molduras de perfil e medalhas raras adquiridas exclusivamente com seus JiuTickets (JT).
          </p>
        </div>

        {/* Currency summary counters */}
        <div className="flex gap-3 shrink-0">
          <div className="bg-zinc-900/80 border border-zinc-800/80 px-5 py-3 rounded flex items-center gap-3">
            <Coins className="w-5 h-5 text-amber-505" />
            <div>
              <span className="block text-[8px] text-zinc-500 font-mono tracking-wider">SALDO DISPONÍVEL</span>
              <span className="text-base font-black font-mono text-white tracking-tight">{user.coins} <span className="text-[10px] text-amber-500 font-normal">JT</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Economics selector micro tabs */}
      <div className="flex border-b border-zinc-900 gap-1 overflow-x-auto scroller-hidden">
        {[
          { id: 'loja', label: '🥋 LOJA DE ITENS', desc: 'Desbloquear com JT' },
          { id: 'market', label: '🤝 SWAP DE CONTEÚDO', desc: 'Trocas entre alunos' },
          { id: 'inventorio', label: '🎒 MOCHILA JIUSPEAK', desc: `${user.inventory.length} itens` },
          ...(user.role === 'admin' ? [{ id: 'admin_store', label: '⚙️ PAINEL DE OPERAÇÕES', desc: 'Gerenciar Catálogo' }] : [])
        ].map((sub) => {
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`px-5 py-3 text-xs text-left font-mono font-bold tracking-wider transition-all border-b-2 cursor-pointer shrink-0 ${
                isActive 
                  ? 'border-red-500 text-white bg-zinc-900/30 rounded-t' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div>{sub.label}</div>
              <span className="text-[8px] text-zinc-500 block font-mono font-normal tracking-wide mt-0.5">{sub.desc}</span>
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
                  className="relative overflow-hidden rounded-xl bg-zinc-900/60 border border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col xl:flex-row group transition-all duration-300 hover:border-zinc-700/60"
                >
                  {/* Subtle panning background grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:1.25rem_1.25rem] opacity-30 pointer-events-none" />
                  
                  {/* Glowing core orb */}
                  <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-red-500/10 blur-3xl opacity-60 pointer-events-none" />

                  {/* Left content block */}
                  <div className="p-8 flex-1 flex flex-col justify-between relative z-10 space-y-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="bg-red-950/60 border border-red-900/40 text-red-400 text-[9px] uppercase tracking-widest font-mono font-bold px-3 py-1 rounded flex items-center gap-1.5 shadow-sm">
                          <Flame className="w-3.5 h-3.5" />
                          <span>EDIÇÃO DE ELITE LIMITADA</span>
                        </span>
                        
                        <span className="bg-zinc-950 border border-zinc-900 text-zinc-400 text-[9px] font-mono px-3 py-1 rounded flex items-center gap-1.5">
                          <Clock className="text-red-405 w-3.5 h-3.5 shrink-0" />
                          <span>EXPIRA EM: <strong className="text-white font-bold font-mono">{timeLeft}</strong></span>
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-mono font-black text-white leading-none tracking-tight uppercase">
                        {featured.name}
                      </h2>
                      <p className="text-xs text-zinc-405 mt-2.5 max-w-xl leading-relaxed">
                        {featured.description || "Consiga este cosmético de elite do jiu-jitsu militar e personalize seu perfil de lutador para as arenas competitivas do JiuSpeak."}
                      </p>
                    </div>

                    {/* Stock tracker bar */}
                    <div className="max-w-md w-full space-y-1.5 bg-zinc-950/80 p-4 rounded border border-zinc-850">
                      <div className="flex justify-between items-center text-[9px] font-mono tracking-wider uppercase text-zinc-400">
                        <span className="flex items-center gap-1 text-red-400 font-bold"><Flame className="w-3.5 h-3.5" /> LOTE COM ALTA PROCURA</span>
                        <span className="font-bold text-white">88% ADQUIRIDO</span>
                      </div>
                      <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-900">
                        <div className="h-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>

                    {/* Purchase actions row */}
                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-zinc-900/80">
                      <div>
                        <span className="text-[8px] text-zinc-500 font-mono block tracking-wider uppercase">CUSTO DE ADQUISIÇÃO</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Coins className="w-5 h-5 text-amber-500" />
                          <span className="text-2xl font-mono font-black text-white tracking-tight">{featured.priceJT}</span>
                          <span className="text-xs text-zinc-500 font-mono font-bold">JT</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isAlreadyOwned ? (
                          <div className="px-5 py-3 bg-emerald-950/30 border border-emerald-950/40 text-emerald-400 text-[10px] font-mono font-bold rounded flex items-center gap-1.5 uppercase">
                            <Check className="w-4 h-4" /> ADQUIRIDO NA MOCHILA
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handlePurchaseProduct(featured)}
                              disabled={purchasingProductId === featured.id}
                              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2"
                            >
                              {purchasingProductId === featured.id ? (
                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                              ) : (
                                <>
                                  <ShoppingBag className="w-4 h-4" />
                                  <span>RESGATAR ITEM</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => addToCart(featured)}
                              className="px-4 py-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700/80 rounded transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold"
                              title="Adicionar ao Carrinho"
                            >
                              <ShoppingCart className="w-4 h-4 text-zinc-400" />
                              <span>+ CARRINHO</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right massive visuals block */}
                  <div className="xl:w-80 h-52 xl:h-auto bg-gradient-to-b from-zinc-900 to-zinc-950 shrink-0 flex items-center justify-center p-8 border-t xl:border-t-0 xl:border-l border-zinc-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-gradient-to-b from-red-500/5 to-transparent opacity-80" />
                    
                    {/* Rotating star back effect */}
                    <div className="absolute w-44 h-44 rounded-full border border-dashed border-zinc-800/60 animate-[spin_60s_linear_infinite]" />

                    <div className="relative group-hover:scale-105 transition-transform duration-500 flex flex-col items-center z-10">
                      {featured.imageUrl ? (
                        <div className="w-32 h-32 rounded border border-zinc-800 p-1 bg-zinc-950/80 shadow-2xl relative overflow-hidden">
                          <img 
                            src={featured.imageUrl} 
                            alt={featured.name} 
                            className="w-full h-full object-cover rounded-sm opacity-90"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        <div className="text-7xl filter grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110">
                          {getCategoryIcon(featured.category)}
                        </div>
                      )}
                      
                      <span className="mt-4 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[8px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded uppercase">
                        {featured.category} PREMIUM
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
                p.priceJT <= user.coins && !user.inventory.includes(p.id)
              ).slice(0, 3);

              if (affordableAndUnpossessed.length === 0) return null;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3.5 bg-red-500 rounded" />
                      <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-red-400">
                        RECOMENDAÇÕES DE RESGATE (DISPONÍVEIS)
                      </h4>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">Saldo atualizado em tempo real</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="recommended-products-tray">
                    {affordableAndUnpossessed.map(p => {
                      return (
                        <div 
                          key={`rec-${p.id}`} 
                          className="bg-zinc-950/40 hover:bg-zinc-900/60 hover:border-zinc-700/50 border border-zinc-900 rounded-lg p-3.5 flex justify-between items-center transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl shrink-0 opacity-80">{p.imageUrl ? '🖼️' : '🥋'}</span>
                            <div>
                              <h5 className="font-mono text-[11px] font-bold text-white line-clamp-1 uppercase">{p.name}</h5>
                              <span className="text-[8px] tracking-wider uppercase font-mono text-zinc-500">{p.rarity}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                <span className="text-xs font-bold font-mono text-white">{p.priceJT}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => addToCart(p)}
                              className="p-1.5 bg-red-650 hover:bg-red-500 text-white rounded transition-all active:scale-95 cursor-pointer"
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
          <div className="bg-zinc-950/45 p-6 rounded-xl border border-zinc-900/80 backdrop-blur-md space-y-5 shadow-inner">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Category Pills Selector */}
              <div className="flex flex-wrap gap-1.5" id="store-category-filters">
                {[
                  'Todos',
                  'Kimonos',
                  'Rash Guards',
                  'Molduras',
                  'Medalhas',
                  'Avatares'
                ].map((cat) => {
                  const isActive = storeCategory === cat;
                  return (
                    <button
                      key={cat}
                      id={`btn-cat-${cat.toLowerCase().replace(' ', '-')}`}
                      onClick={() => { setStoreCategory(cat); setStorePage(1); }}
                      className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-300 border relative ${
                        isActive
                          ? 'bg-red-500/10 text-white border-red-500/30 font-bold shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                          : 'bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:border-zinc-800 focus:outline-none'
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
                  placeholder="DIGITE O NOME DO SEU EQUIPAMENTO DE ELITE..."
                  value={storeSearch}
                  onChange={(e) => { setStoreSearch(e.target.value); setStorePage(1); }}
                  className="w-full pl-9 pr-4 py-2 text-[10px] bg-zinc-950/60 text-zinc-100 rounded border border-zinc-900 focus:border-red-500 focus:outline-none transition-all placeholder-zinc-600 font-mono tracking-wider"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-red-400 transition-colors" />
              </div>

            </div>

            {/* Rarity filtration pills */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-900/60">
              <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 mr-2">FILTRAR POR CLASSE:</span>
              <div className="flex flex-wrap gap-1.5" id="store-rarity-filters">
                {['Todos', 'Comum', 'Raro', 'Épico', 'Lendário', 'Mítico'].map((rarity) => {
                  const isActive = storeRarity === rarity;
                  
                  // Stylized gaming pill coloring
                  const pillStyle = () => {
                    if (!isActive) return 'bg-zinc-950/60 text-zinc-400 border border-zinc-900 hover:text-zinc-100 hover:border-zinc-800';
                    switch (rarity) {
                      case 'Todos': return 'bg-zinc-800 text-white border border-zinc-700 font-bold';
                      case 'Comum': return 'bg-zinc-850 text-zinc-200 border border-zinc-700';
                      case 'Raro': return 'bg-blue-950/40 text-blue-400 border border-blue-900/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]';
                      case 'Épico': return 'bg-purple-950/40 text-purple-400 border border-purple-900/50 shadow-[0_0_12px_rgba(168,85,247,0.15)]';
                      case 'Lendário': return 'bg-amber-500/10 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
                      case 'Mítico': return 'bg-red-950/50 text-red-400 border border-red-900/50 shadow-[0_0_12px_rgba(239,68,68,0.2)] font-black';
                      default: return '';
                    }
                  };

                  return (
                    <button
                      key={rarity}
                      id={`btn-rarity-${rarity.toLowerCase()}`}
                      onClick={() => { setStoreRarity(rarity); setStorePage(1); }}
                      className={`px-3 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${pillStyle()}`}
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
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-12 text-center text-zinc-500">
              <Sparkle className="w-6 h-6 text-zinc-700 mx-auto mb-3 opacity-50 animate-pulse" />
              <p className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">Nenhum equipamento militar encontrado</p>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">Digite outro termo de busca ou selecione outra categoria.</p>
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
                  const displayPrice = product.priceJT;
                  const originalPrice = isPromo ? Math.floor(product.priceJT * 1.25) : null;

                  const getCategoryDisplay = (cat: string) => {
                    switch (cat?.toUpperCase()) {
                      case 'AVATAR': return { icon: '👤', name: 'AVATAR' };
                      case 'FRAME': return { icon: '🖼️', name: 'MOLDURA' };
                      case 'TITLE': return { icon: '🏷️', name: 'TÍTULO' };
                      case 'EMOTE': return { icon: '💬', name: 'EMOJI' };
                      case 'EFFECT': return { icon: '✨', name: 'EFEITO' };
                      case 'THEME': return { icon: '🎨', name: 'TEMA' };
                      case 'BELT': return { icon: '🥋', name: 'FAIXA' };
                      case 'LEGENDARY': return { icon: '👑', name: 'ELITE' };
                      default: return { icon: '🎒', name: 'KIMONO' };
                    }
                  };

                  const catDisplay = getCategoryDisplay(product.category);

                  // Custom border and shadow coloring classes according to esports tier
                  const getEsportsCardTheme = (rar: string, name?: string) => {
                    const r = rar?.toUpperCase();
                    const nameLower = name?.toLowerCase() || '';
                    if (nameLower.includes('eclipse celestial') || nameLower.includes('legado do fundador') || nameLower.includes('neon cyber') || nameLower.includes('ia master futuro')) {
                      return 'border-red-500/30 bg-zinc-950/40 hover:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]';
                    }
                    switch(r) {
                      case 'DIVINE':
                      case 'DIVINO':
                        return 'border-fuchsia-500/30 bg-zinc-950/40 hover:border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.15)]';
                      case 'COMMON':
                      case 'COMUM': 
                        return 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-700/60 hover:bg-zinc-900/10';
                      case 'RARE':
                      case 'RARO':
                        return 'border-blue-900/40 bg-zinc-950/30 hover:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
                      case 'EPIC':
                      case 'ÉPICO':
                        return 'border-purple-900/45 bg-zinc-950/30 hover:border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]';
                      case 'LEGENDARY':
                      case 'LENDÁRIO':
                        return 'border-amber-500/25 bg-zinc-950/40 hover:border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.15)]';
                      case 'MYTHIC':
                      case 'MÍTICO':
                        return 'border-red-500/30 bg-zinc-950/40 hover:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]';
                      default:
                        return 'border-zinc-900 bg-zinc-950/30';
                    }
                  };

                  return (
                    <div
                      key={product.id}
                      id={`product-card-${product.id}`}
                      className={`rounded border flex flex-col justify-between overflow-hidden group transition-all duration-300 relative ${getEsportsCardTheme(product.rarity, product.name)}`}
                    >
                      {/* Interactive shine sweep */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                      {/* Promo tag */}
                      {isPromo && (
                        <span className="absolute top-3 right-3 bg-red-650 text-white text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider z-15 shadow-md flex items-center gap-1">
                          <Percent className="w-2.5 h-2.5" /> -20% OFF
                        </span>
                      )}

                      {/* Hot limited deal badge */}
                      {isLimited && !isPromo && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider z-15 flex items-center gap-1 animate-pulse">
                          <Flame className="w-2.5 h-2.5" /> LIMITADO
                        </span>
                      )}

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4 relative z-10">
                        <div className="cursor-pointer group/card" onClick={() => setViewItemModal(product)} title="Clique para abrir detalhes do item">
                          {/* Image Box / Visualizer with high glare */}
                          <div className="h-32 bg-zinc-950/80 rounded border border-zinc-900/60 mb-3 flex items-center justify-center relative overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover/card:scale-105 transition-all duration-500 opacity-90"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-4xl filter grayscale opacity-70 group-hover/card:scale-110 transition-transform duration-300">{catDisplay.icon}</div>
                            )}

                            {/* Class Badge */}
                            <span className="absolute bottom-2 left-2 bg-zinc-950 border border-zinc-900 px-2 py-0.5 rounded text-[8px] font-mono font-bold text-zinc-400 flex items-center gap-1 uppercase tracking-wider">
                              <span>{catDisplay.icon}</span>
                              <span>{catDisplay.name}</span>
                            </span>

                            {/* Rarity Star Badge */}
                            <span className={`absolute top-2 left-2 text-[8px] font-mono font-extrabold px-2 py-0.5 rounded border tracking-widest uppercase ${getRarityBadgeColor(product.rarity, product.name)} flex items-center gap-1`}>
                              <Sparkle className="w-2 h-2 fill-current" />
                              <span>{getRarityLabel(product.rarity, product.name)}</span>
                            </span>
                          </div>

                          {/* Titles */}
                          <div className="space-y-1">
                            <h4 className="font-mono font-bold text-[11px] text-white tracking-tight uppercase line-clamp-1 group-hover/card:text-red-400 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-zinc-400 leading-normal font-normal line-clamp-2 h-7 overflow-hidden">
                              {product.description || "Customização de cosmético oficial para a sua identidade marcial no ecossistema de elite do JiuSpeak."}
                            </p>
                          </div>
                        </div>

                        {/* Spark stock depletion meter if item is limited */}
                        {isLimited && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                              <span>RESTAM POUCOS NO LOTE</span>
                              <span className="font-bold text-red-500">ÚLTIMAS UNIDADES</span>
                            </div>
                            <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                              <div className="h-full bg-red-655" style={{ width: '20%' }} />
                            </div>
                          </div>
                        )}

                        {/* Dynamic purchase layout pricing */}
                        <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] text-zinc-500 font-mono block tracking-wider uppercase">CUSTO</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Coins className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-xs font-mono font-bold text-white">{displayPrice}</span>
                              {originalPrice && (
                                <span className="text-[9px] text-zinc-650 font-mono line-through ml-1">{originalPrice}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            {isOwned ? (
                              <span className="bg-zinc-950 text-zinc-500 border border-zinc-900 px-2.5 py-1.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
                                UNLOCKED
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handlePurchaseProduct(product)}
                                  disabled={isBusy}
                                  className="px-3 py-1.5 bg-red-650 hover:bg-red-500 active:scale-95 text-white font-mono font-bold text-[9px] uppercase tracking-wider rounded transition-all flex items-center gap-1 cursor-pointer"
                                  title={`Adquirir por ${product.priceJT} JT`}
                                >
                                  {isBusy ? (
                                    <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                  ) : "RESGATAR"}
                                </button>

                                <button
                                  onClick={() => addToCart(product)}
                                  className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:text-white rounded text-zinc-400 transition-colors cursor-pointer flex items-center"
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
              <div className="flex items-center justify-between pt-4 border-t border-zinc-900 text-[10px] text-zinc-500 font-mono">
                <div>
                  VISUALIZANDO <span className="text-zinc-350 font-bold">{storeProducts.length}</span> DE <span className="text-zinc-350 font-bold">{storeTotalItems}</span> COSMÉTICOS DISPONÍVEIS
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={storePage === 1}
                    onClick={() => setStorePage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded bg-zinc-950 border border-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-805 transition-all text-zinc-300 hover:text-white cursor-pointer"
                    id="btn-prev-page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: storeTotalPages }).map((_, idx) => {
                    const pageNo = idx + 1;
                    const isCurrent = pageNo === storePage;
                    return (
                      <button
                        key={pageNo}
                        onClick={() => setStorePage(pageNo)}
                        className={`w-7 h-7 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850'
                        }`}
                      >
                        {pageNo}
                      </button>
                    );
                  })}

                  <button
                    disabled={storePage === storeTotalPages}
                    onClick={() => setStorePage(prev => Math.min(storeTotalPages, prev + 1))}
                    className="p-1.5 rounded bg-zinc-950 border border-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-805 transition-all text-zinc-300 hover:text-white cursor-pointer"
                    id="btn-next-page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950/40 p-5 rounded-lg border border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 rounded text-red-400 border border-red-500/15">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-zinc-500 font-mono tracking-wider uppercase">COMISSÃO DA PLATAFORMA</span>
                <span className="text-xs font-bold text-zinc-200">10% Retido por Transação</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded text-emerald-400 border border-emerald-500/15">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-zinc-500 font-mono tracking-wider uppercase">SHIELD PROTECT ANTIFRAUDE</span>
                <span className="text-xs font-bold text-emerald-450">Ativo & Monitorando</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded text-amber-400 border border-amber-500/15">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-zinc-500 font-mono tracking-wider uppercase">TETOS REGULATÓRIOS</span>
                <span className="text-xs font-bold text-amber-450">Min: 50 | Max: 50.000 JT</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <h4 className="font-mono font-bold text-[10px] uppercase text-zinc-400 tracking-wider">OFERTAS DE COMÉRCIO ATIVAS:</h4>
            
            <button
              onClick={() => setListModalOpen(true)}
              className="px-4 py-2 bg-red-650 hover:bg-red-500 text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded transition-all cursor-pointer shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Vender meu Item
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-[10px] text-zinc-500 font-mono tracking-wider animate-pulse uppercase">
              Consultando livro de ofertas e garantias securitárias do JiuSpeak...
            </div>
          ) : marketItems.length === 0 ? (
            <div className="py-12 border border-zinc-900 bg-zinc-950/30 rounded-lg text-center text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Nenhuma oferta ativa no mercado no momento. Publique seu próprio anúncio para comercializar cosméticos!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketItems.map((item) => {
                const owned = user.inventory.includes(item.inventoryItemId);
                
                return (
                  <div 
                    key={item.id}
                    className="bg-zinc-950/40 p-5 rounded border border-zinc-900 flex flex-col justify-between hover:border-zinc-800 transition-all duration-300 group"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRarityBadgeColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono">ID: {item.sellerName}</span>
                      </div>

                      <div>
                        <h4 className="font-mono font-bold text-xs uppercase text-zinc-100 tracking-tight">{item.name}</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed h-[36px] overflow-hidden line-clamp-2">{item.description}</p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-900/60 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.price} <span className="text-[9px] text-zinc-550 font-normal">JT</span></span>
                      </div>

                      <button
                        onClick={() => buyMarketplaceItem(item)}
                        className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                          owned 
                            ? 'bg-zinc-950 border border-zinc-900 text-emerald-450' 
                            : 'bg-red-650 hover:bg-red-500 text-white'
                        }`}
                      >
                        {owned ? 'VOCÊ TEM ✅' : 'RESGATAR'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ledger of completed trades & dynamic fraud monitoring */}
          <div className="mt-8 space-y-4 pt-6 border-t border-zinc-900">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-red-500" />
              <h5 className="font-mono font-bold text-[10px] uppercase tracking-wider text-white">LIVRO DE HISTÓRICO & AUDITORIA ANTIFRAUDE</h5>
            </div>
            
            <p className="text-[10px] text-zinc-500 max-w-2xl mt-0.5 leading-relaxed font-mono">
              Consulte faturas, comissões de 10% cobradas automaticamente pelo ecossistema SaaS de Mestres do JiuSpeak, além de Risk Scores atribuídos por nossos algoritmos de fiscalização ativa.
            </p>

            <div className="bg-zinc-950/80 p-4 rounded border border-zinc-900 overflow-x-auto">
              {salesHistory.length === 0 ? (
                <div className="text-center py-6 text-zinc-650 text-[10px] font-mono uppercase tracking-wider">
                  Nenhuma transação registrada no ledger de auditorias.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-[10px] font-semibold text-zinc-400 min-w-[600px]">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                      <th className="py-2.5">Item Negociado</th>
                      <th className="py-2.5">Comprador</th>
                      <th className="py-2.5">Vendedor</th>
                      <th className="py-2.5">Valor Total</th>
                      <th className="py-2.5">Taxa (10%)</th>
                      <th className="py-2.5">Risk Score</th>
                      <th className="py-2.5 text-right font-mono">Status Antifraude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesHistory.map((sale) => (
                      <tr key={sale.id} className="border-b border-zinc-900/55 hover:bg-zinc-900/30 transition-all font-mono">
                        <td className="py-2.5 text-zinc-200">{sale.itemName}</td>
                        <td className="py-2.5 text-zinc-400">{sale.buyerName}</td>
                        <td className="py-2.5 text-zinc-400">{sale.sellerName}</td>
                        <td className="py-2.5 text-white">{sale.pricePaidJT} JT</td>
                        <td className="py-2.5 text-zinc-500">{sale.feePaidJT} JT</td>
                        <td className="py-2.5 font-bold">
                          <span className={sale.riskScore > 50 ? 'text-red-400' : 'text-emerald-450'}>
                            {sale.riskScore}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-sans">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-mono font-bold border uppercase tracking-wider ${
                            sale.status === 'Seguro'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                              : sale.status === 'Suspeito'
                              ? 'bg-amber-950/40 text-amber-400 border-amber-900/40 animate-pulse'
                              : 'bg-red-950/40 text-red-400 border-red-900/40'
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
            <div className="bg-zinc-900/10 p-4 rounded border border-zinc-900 space-y-2">
              <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider uppercase font-bold text-red-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Logs de Fiscalização e Segurança (Real-time Audit Logs)</span>
              </div>
              <div className="space-y-1 max-h-[160px] overflow-y-auto pr-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="text-[10px] font-mono text-zinc-400 bg-zinc-950/80 p-2 rounded border border-zinc-900 flex justify-between gap-4 items-start font-mono">
                    <span>{log.description}</span>
                    <span className="text-zinc-650 block shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</span>
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
            <div className="h-48 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Inspecionando mochila do atleta...</p>
            </div>
          ) : unlockedItems.length === 0 && user.inventory.length === 0 ? (
            <div className="py-12 border border-zinc-900 bg-zinc-950/30 rounded text-center text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Sua biblioteca de materiais está vazia! Participe das lições e da arena prática para acumular JiuTickets e desbloquear materiais na loja virtual.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" id="inventory-grid">
              {/* Database-unlocked items */}
              {unlockedItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-zinc-950/40 border border-zinc-900 p-5 rounded flex flex-col justify-between space-y-4 hover:border-zinc-800 transition-all duration-300 group"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRarityBadgeColor(item.rarity)}`}>
                        {item.rarity || 'ESPECIAL'}
                      </span>
                      <span className="text-xs">🥋</span>
                    </div>
                    
                    <h4 className="font-mono font-bold text-xs uppercase text-zinc-100 tracking-tight mt-3">{item.name}</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed h-[36px] overflow-hidden line-clamp-2">{item.description}</p>
                  </div>

                  <div className="pt-2 border-t border-zinc-900/60 flex justify-between items-center text-[9px] font-mono">
                    <span className="text-zinc-500">ID: {item.productId?.replace('prod_', '')}</span>
                    <span className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider text-[8px]">
                      🎒 EQUIPADO
                    </span>
                  </div>
                </div>
              ))}

              {/* Offline fallback / user profile sync */}
              {user.inventory.filter(invId => !unlockedItems.some(ui => ui.productId === invId)).map((invId) => {
                const item = resolveItemDetails(invId);

                return (
                  <div 
                    key={invId}
                    className="bg-zinc-950/40 border border-zinc-900 p-5 rounded flex flex-col justify-between space-y-4 hover:border-zinc-800 transition-all duration-300 group"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRarityBadgeColor(item.rarity as any)}`}>
                          {item.rarity || 'ESPECIAL'}
                        </span>
                        <span className="text-xs">💎</span>
                      </div>
                      
                      <h4 className="font-mono font-bold text-xs uppercase text-zinc-100 tracking-tight mt-3">{item.name}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed h-[36px] overflow-hidden line-clamp-2">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-zinc-900/60 flex justify-between items-center text-[9px] font-mono">
                      <span className="text-zinc-500">OFFLINE SYNC</span>
                      <span className="bg-red-950/40 border border-red-900/40 text-red-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider text-[8px]">
                        🎒 ATIVO
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}



      {/* 4. ADMINISTRATIVE CATALOUGE OPERATIONS PANEL */}
      {activeSubTab === 'admin_store' && user.role === 'admin' && (
        <div className="space-y-6" id="admin-store-operations-panel">
          
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-450" />
                <span>Painel Operacional da Loja Virtual</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Crie, duplique, edite ou exclua itens do catálogo oficial. Suporta promoções e tags temporárias.
              </p>
            </div>
            <button
              onClick={openCreateItemModal}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow shadow-emerald-500/10 cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>CRIAR NOVO ITEM</span>
            </button>
          </div>

          {/* Filters shelf */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Box */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-550">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all font-sans"
              />
            </div>

            {/* Category selection */}
            <div className="sm:col-span-2 flex overflow-x-auto gap-1.5 pb-1 sm:pb-0 scroller-hidden">
              {[
                { id: 'Todos', label: 'Todos' },
                { id: 'AVATAR', label: '👤 Avatares' },
                { id: 'FRAME', label: '🖼️ Molduras' },
                { id: 'TITLE', label: '🏷️ Títulos' },
                { id: 'EMOTE', label: '💬 Emotes' },
                { id: 'EFFECT', label: '✨ Efeitos' },
                { id: 'THEME', label: '🥋 Temas/Kimono' },
                { id: 'BELT', label: '🎗️ Faixas' },
                { id: 'Itens Especiais', label: '📦 Outros' }
              ].map((cat) => {
                const isActive = adminCategory === cat.id;
                return (
                  <button
                    key={`admin-cat-${cat.id}`}
                    onClick={() => {
                      setAdminCategory(cat.id);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all shrink-0 cursor-pointer border ${
                      isActive 
                        ? 'bg-violet-650 text-violet-100 border-violet-500' 
                        : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Layout */}
          {isAdminListLoading ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[10px] text-slate-500 font-mono">Sincronizando banco de dados...</p>
            </div>
          ) : adminProducts.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/30 rounded-xl border border-dashed border-slate-800 space-y-2">
              <p className="text-sm font-bold text-slate-400">Nenhum item localizado</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Tente alterar os filtros de busca ou crie o seu primeiro material de estudos clicando no botão acima.</p>
            </div>
          ) : (
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] font-semibold text-slate-300 min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-900/30 text-slate-500 font-mono text-[9px] uppercase">
                      <th className="p-4">Item</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Raridade</th>
                      <th className="p-4">Preço (JT)</th>
                      <th className="p-4">Preço (BRL)</th>
                      <th className="p-4">Estoque / Limite</th>
                      <th className="p-4 flex items-center gap-1">Indicadores</th>
                      <th className="p-4 text-right">Ações Operacionais</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {adminProducts.map((item) => {
                      const getCatLabel = (cat: string) => {
                        const c = cat?.toUpperCase();
                        if (c === "AVATAR") return "Avatar";
                        if (c === "FRAME") return "Moldura";
                        if (c === "TITLE") return "Título";
                        if (c === "EMOTE") return "Emote";
                        if (c === "EFFECT") return "Efeito Especial";
                        if (c === "THEME") return "Tema";
                        if (c === "BELT") return "Faixa Especial";
                        return cat || "Especial";
                      };

                      return (
                        <tr key={`admin-row-${item.id}`} className="hover:bg-slate-900/40 transition-all">
                          {/* Image & Title */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-9 h-9 object-cover rounded-lg border border-slate-800 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-9 h-9 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center text-lg shrink-0">
                                  {item.category?.toUpperCase() === 'AVATAR' ? '👤' : 
                                   item.category?.toUpperCase() === 'FRAME' ? '🖼️' :
                                   item.category?.toUpperCase() === 'TITLE' ? '🏷️' : '🥋'}
                                </div>
                              )}
                              <div className="max-w-[200px]">
                                <h5 className="font-bold text-white leading-tight font-sans truncate" title={item.name}>{item.name}</h5>
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5" title={item.description}>{item.description || "Sem descrição técnica definida."}</p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-4 font-mono text-[10px] text-slate-400">
                            {getCatLabel(item.category)}
                          </td>

                          {/* Rarity */}
                          <td className="p-4">
                            <span className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-bold ${getRarityBadgeColor(item.rarity)} uppercase`}>
                              {getRarityLabel(item.rarity)}
                            </span>
                          </td>

                          {/* Price JT */}
                          <td className="p-4">
                            <div className="flex items-center gap-1 font-mono">
                              <Coins className="w-3.5 h-3.5 text-yellow-500" />
                              {item.isPromo && item.promoPriceJT ? (
                                <div>
                                  <span className="text-white font-bold">{item.promoPriceJT} JT</span>
                                  <span className="text-red-400 line-through text-[9px] ml-1.5 block">{item.priceJT} JT</span>
                                </div>
                              ) : (
                                <span className="text-slate-100 font-bold">{item.priceJT} JT</span>
                              )}
                            </div>
                          </td>

                          {/* Price BRL */}
                          <td className="p-4 font-mono font-bold text-slate-350">
                            {item.priceBRL !== null && item.priceBRL !== undefined ? (
                              <span className="text-emerald-450">R$ {Number(item.priceBRL).toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-600 font-normal">-</span>
                            )}
                          </td>

                          {/* Stock/Limit */}
                          <td className="p-4 font-mono text-slate-400">
                            {item.stock !== null && item.stock !== undefined ? (
                              <span className={Number(item.stock) === 0 ? "text-rose-400 font-bold" : "font-bold text-slate-100"}>
                                {item.stock} un.
                              </span>
                            ) : (
                              <span className="text-slate-600">Ilimitado</span>
                            )}
                          </td>

                          {/* Indicators row */}
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {item.active ? (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-bold px-1 py-0.5 rounded">ATIVO</span>
                              ) : (
                                <span className="bg-slate-900 text-slate-500 border border-slate-800 text-[8px] font-bold px-1 py-0.5 rounded">INATIVO</span>
                              )}
                              {item.isPromo && (
                                <span className="bg-red-500/15 text-red-400 border border-red-500/20 text-[8px] font-bold px-1 py-0.5 rounded">OFERTA</span>
                              )}
                              {item.isBundle && (
                                <span className="bg-blue-500/15 text-blue-400 border border-blue-500/20 text-[8px] font-bold px-1 py-0.5 rounded">COLEÇÃO</span>
                              )}
                              {item.isSeasonal && (
                                <span className="bg-yellow-500/15 text-yellow-500 border border-yellow-500/20 text-[8px] font-bold px-1 py-0.5 rounded">SAZONAL</span>
                              )}
                              {item.isExclusive && (
                                <span className="bg-purple-500/15 text-purple-400 border border-purple-500/20 text-[8px] font-bold px-1 py-0.5 rounded">VIP</span>
                              )}
                            </div>
                          </td>

                          {/* Operations/Acoes */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit */}
                              <button
                                onClick={() => openEditItemModal(item)}
                                className="p-1.5 bg-slate-900 border border-slate-800 hover:border-violet-500 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Editar configurações"
                              >
                                ✏️
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicateItem(item.id)}
                                className="p-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Duplicar item de lote"
                              >
                                📋
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                className="p-1.5 bg-slate-900 border border-slate-850 hover:bg-rose-950/20 hover:border-rose-700 hover:text-rose-455 text-slate-500 rounded-lg transition-all cursor-pointer"
                                title="Excluir produto"
                              >
                                ❌
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. CREATE / EDIT DIALOG FORM MODAL BOX (Overlay) */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateOrUpdateItem}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 animate-scaleUp shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Gerenciador Geral de Produto</span>
                <h5 className="font-display font-extrabold text-sm text-white">
                  {adminModalMode === 'create' ? "🚀 Cadastrar Novo Equipamento" : "✏️ Configurar Item Existente"}
                </h5>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="p-1.5 text-slate-500 hover:text-slate-100 rounded-lg hover:bg-slate-950/50 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Core Fields */}
            <div className="space-y-3.5 text-xs text-left">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-slate-450 font-mono font-bold uppercase block text-[9px] tracking-wide">Nome do Cosmético/Material</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Faixa Branca com 4 Graus"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-semibold focus:outline-none focus:border-violet-500 block"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-450 font-mono font-bold uppercase block text-[9px] tracking-wide">Descrição Comercial & Técnica</label>
                <textarea
                  placeholder="Explique o que o aluno ganha com isso e os detalhes técnicos deste item..."
                  value={adminForm.description}
                  onChange={(e) => setAdminForm({ ...adminForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-250 font-sans focus:outline-none focus:border-violet-500 block leading-relaxed"
                />
              </div>

              {/* Category, Rarity, ImageUrl Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-450 font-mono font-bold uppercase block text-[9px] tracking-wide">Categoria do Produto</label>
                  <select
                    value={adminForm.category}
                    onChange={(e) => setAdminForm({ ...adminForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 cursor-pointer focus:outline-none"
                  >
                    <option value="AVATAR">👤 Avatar Masculino / Feminino</option>
                    <option value="FRAME">🖼️ Moldura de Avatar</option>
                    <option value="TITLE">🏷️ Título Honorífico</option>
                    <option value="EMOTE">💬 Emote de Chat</option>
                    <option value="EFFECT">✨ Efeito Visual Especial</option>
                    <option value="THEME">🥋 Temas Visuais / Quimonos</option>
                    <option value="BELT">🎗️ Faixa Especial</option>
                    <option value="Itens Especiais">📦 Outros Equipamentos / Pacotes VIP</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-450 font-mono font-bold uppercase block text-[9px] tracking-wide">Raridade de Loot</label>
                  <select
                    value={adminForm.rarity}
                    onChange={(e) => setAdminForm({ ...adminForm, rarity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 cursor-pointer focus:outline-none"
                  >
                    <option value="COMMON">Comum</option>
                    <option value="RARE">Raro</option>
                    <option value="EPIC">Épico</option>
                    <option value="LEGENDARY">Lendário</option>
                    <option value="MYTHIC">Mítico</option>
                  </select>
                </div>
              </div>

              {/* Photo Image Url */}
              <div className="space-y-1">
                <label className="text-slate-450 font-mono font-bold uppercase block text-[9px] tracking-wide">URL da Imagem Ilustrativa</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Cole um link https://images.unsplash.com/..."
                    value={adminForm.imageUrl}
                    onChange={(e) => setAdminForm({ ...adminForm, imageUrl: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-250 font-mono text-[10.5px] focus:outline-none focus:border-violet-500"
                  />
                  {adminForm.imageUrl && (
                    <img 
                      src={adminForm.imageUrl} 
                      alt="Preview" 
                      className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=200'; }}
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>

              {/* Prices Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-450 font-mono font-bold uppercase block text-[9px] tracking-wide">Preço Original JT</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={adminForm.priceJT}
                    onChange={(e) => setAdminForm({ ...adminForm, priceJT: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono text-center font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-450 font-mono font-bold uppercase block text-[9px] tracking-wide">Preço BRL (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Sem valor SaaS"
                    value={adminForm.priceBRL}
                    onChange={(e) => setAdminForm({ ...adminForm, priceBRL: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono text-center font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-450 font-mono font-bold uppercase block text-[9px] tracking-wide">Unidades em Estoque</label>
                  <input
                    type="number"
                    placeholder="Ilimitado"
                    value={adminForm.stock}
                    onChange={(e) => setAdminForm({ ...adminForm, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-250 font-mono text-center"
                  />
                </div>
              </div>

              {/* Switches Block container */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                {/* Active Indicator toggle switch */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-[11px] block">Item Disponível/Ativo</label>
                    <span className="text-[9.5px] text-slate-500 font-normal">Exibir este item nas listagens da loja virtual pública.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={adminForm.active}
                    onChange={(e) => setAdminForm({ ...adminForm, active: e.target.checked })}
                    className="w-4.5 h-4.5 text-violet-650 rounded border-slate-700 bg-slate-950 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Promo check */}
                <div className="pt-2.5 border-t border-slate-900 flex justify-between gap-4">
                  <div className="flex-1">
                    <label className="font-bold text-white text-[11px] block flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-red-400" />
                      <span>Item promocional ativa</span>
                    </label>
                    <span className="text-[9.5px] text-slate-500 font-normal">Aplicar redução temporária em JiuTickets.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {adminForm.isPromo && (
                      <input
                        type="number"
                        placeholder="JT Promo"
                        required
                        value={adminForm.promoPriceJT}
                        onChange={(e) => setAdminForm({ ...adminForm, promoPriceJT: e.target.value })}
                        className="w-24 bg-slate-900 border border-slate-750 text-slate-100 p-1.5 rounded text-center text-[10.5px] font-mono font-bold focus:outline-none"
                      />
                    )}
                    <input
                      type="checkbox"
                      checked={adminForm.isPromo}
                      onChange={(e) => setAdminForm({ ...adminForm, isPromo: e.target.checked, promoPriceJT: e.target.checked ? String(Math.floor(adminForm.priceJT * 0.8)) : '' })}
                      className="w-4.5 h-4.5 text-violet-650 rounded border-slate-700 bg-slate-950 focus:ring-0 cursor-pointer shrink-0"
                    />
                  </div>
                </div>

                {/* Bundle tags checkboxes */}
                <div className="pt-2.5 border-t border-slate-900 grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-all font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={adminForm.isBundle}
                      onChange={(e) => setAdminForm({ ...adminForm, isBundle: e.target.checked })}
                      className="rounded border-slate-800 text-violet-500 focus:ring-0"
                    />
                    <span>Pacote/Combo</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-all font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={adminForm.isSeasonal}
                      onChange={(e) => setAdminForm({ ...adminForm, isSeasonal: e.target.checked })}
                      className="rounded border-slate-800 text-violet-500 focus:ring-0"
                    />
                    <span>Sazonal</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-all font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={adminForm.isExclusive}
                      onChange={(e) => setAdminForm({ ...adminForm, isExclusive: e.target.checked })}
                      className="rounded border-slate-800 text-violet-500 focus:ring-0"
                    />
                    <span>VIP Exclusivo</span>
                  </label>
                </div>

              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-slate-850 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="flex-1 py-2.5 bg-slate-950 border border-slate-800 hover:text-white text-slate-400 font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-550 hover:to-indigo-550 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow shadow-violet-550/15 cursor-pointer"
              >
                {adminModalMode === 'create' ? "🚀 ADICIONAR AO TATAME" : "✔ GRAVAR ALTERAÇÕES"}
              </button>
            </div>
          </form>
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
                <label className="text-slate-500 font-mono font-bold uppercase block text-[10px]">Preço Solicitado (JT)</label>
                {listForm.price > 0 && (
                  <span className="text-[9px] text-slate-400 font-mono font-normal">Sellers Net: {Math.floor(listForm.price * 0.9)} JT (taxa 10%)</span>
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
                <span className="text-[9px] font-mono text-violet-400 uppercase tracking-wider font-black block">Central Jiuspeak Battle</span>
                <h5 className="font-display font-extrabold text-base text-white">Adquirir Plano {subscribingTier.type}</h5>
              </div>
              <button 
                onClick={() => setSubscribingTier(null)}
                className="text-slate-500 hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full flex items-center justify-center text-xl mx-auto float-effect">
                🔒
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                As assinaturas do JiuSpeak são processadas de forma segura e oficial utilizando faturamento direto via <strong>Mercado Pago</strong> (PIX, Cartão de Crédito ou Boleto).
              </p>

              <div className="p-3 bg-slate-950 rounded-xl text-left border border-slate-850">
                <span className="text-[8px] font-mono text-slate-505 uppercase block">Plano Selecionado</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs font-bold text-white">{subscribingTier.type}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">R$ {subscribingTier.price.toFixed(2)} / mês</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSubscribingTier(null);
                  if (setCurrentTab) setCurrentTab('subscriptions');
                }}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow shadow-violet-500/10 cursor-pointer"
              >
                Ir para o Painel de Assinaturas 🥋
              </button>
            </div>

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
                  Seus JiuTickets (JT) foram computados com sucesso e o item cosmético já está na sua biblioteca portátil de conquistas.
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
                                  <span className="text-xs font-mono font-bold text-slate-300">{item.priceJT}</span>
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
                          <span>{user.coins} JT</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-300">Total do Carrinho (Resgate):</span>
                        <span className="font-mono text-white text-base flex items-center gap-1 text-glow-indigo">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span>{cart.reduce((sum, item) => sum + item.priceJT, 0)} JT</span>
                        </span>
                      </div>
                    </div>

                    {(() => {
                      const cartTotal = cart.reduce((sum, it) => sum + it.priceJT, 0);
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
                                <Info className="w-3.5 h-3.5" /> Saldo JT Insuficiente
                              </p>
                              <p className="opacity-90 font-normal">
                                Você precisa de mais <strong>{cartTotal - user.coins} JT</strong> para aprovar esta transação. Jogue partidas ou use o painel de faturamento para carregar tokens imediatos!
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

      {/* ITEM DETAILS MODAL OVERLAY */}
      {viewItemModal && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-mono animate-fade-in" id="bjj-item-detail-modal">
          <div className="bg-zinc-950 border border-zinc-900 rounded w-full max-w-md overflow-hidden shadow-2xl relative">
            
            {/* Glowing core background effect */}
            <div className={`absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-20 ${
              viewItemModal.rarity?.toUpperCase() === 'MYTHIC' ? 'bg-red-500' :
              viewItemModal.rarity?.toUpperCase() === 'LEGENDARY' ? 'bg-amber-500' :
              viewItemModal.rarity?.toUpperCase() === 'EPIC' ? 'bg-red-500' : 'bg-red-500'
            }`} />

            {/* Absolute close button */}
            <button 
              onClick={() => setViewItemModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-950 p-1.5 rounded border border-zinc-900 transition-colors cursor-pointer z-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Body Info Container */}
            <div className="p-6 md:p-8 space-y-6">
              
              <div className="text-center pt-2">
                <span className={`text-[8px] font-mono tracking-wider font-extrabold px-3 py-1 rounded border ${getRarityBadgeColor(viewItemModal.rarity, viewItemModal.name)} uppercase`}>
                  🎯 CODEX — {getRarityLabel(viewItemModal.rarity, viewItemModal.name)}
                </span>
              </div>

              {/* Large item image visualization chamber */}
              <div className="w-full h-48 bg-zinc-950 rounded overflow-hidden relative border border-zinc-900 flex items-center justify-center group">
                {viewItemModal.imageUrl ? (
                  <img 
                    src={viewItemModal.imageUrl} 
                    alt={viewItemModal.name} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-5xl text-zinc-800 drop-shadow select-none group-hover:scale-105 transition-transform">🥋</div>
                )}
                
                {/* Glowing shadow chamber inside */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="bg-zinc-950 border border-zinc-900 text-zinc-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
                    {viewItemModal.category || "Cosmético"}
                  </span>
                </div>
              </div>

              {/* Item nomenclature text header */}
              <div className="space-y-2">
                <h3 className="text-base font-mono font-bold text-white text-center uppercase tracking-tight">
                  {viewItemModal.name}
                </h3>
                <p className="text-[10px] text-zinc-400 leading-relaxed text-center font-mono max-w-sm mx-auto">
                  {viewItemModal.description || "Incrível item de customização oficial. Equipando este cosmético, seu perfil e conquistas refletirão seu estilo inovador de rolar no tatame virtual."}
                </p>
              </div>

              {/* Pricing & Rarity Metadata Chamber */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-950/80 p-4 rounded border border-zinc-900 text-[10px] font-mono">
                <div className="space-y-0.5">
                  <span className="block text-[8px] text-zinc-650 font-mono uppercase">CLASSIFICAÇÃO</span>
                  <span className="font-bold text-zinc-300 uppercase">{getRarityLabel(viewItemModal.rarity, viewItemModal.name)}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[8px] text-zinc-650 font-mono uppercase">VALOR DE RESGATE</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    {viewItemModal.priceJT || 0} JT
                  </span>
                </div>
              </div>

              {/* Modal footer call actions */}
              <div className="flex gap-3 justify-center text-[9px] font-mono">
                <button
                  onClick={() => {
                    if (user.inventory.includes(viewItemModal.id)) {
                      showToast("Você já possui este item na mochila!", "info");
                    } else {
                      handlePurchaseProduct(viewItemModal);
                    }
                    setViewItemModal(null);
                  }}
                  disabled={user.inventory.includes(viewItemModal.id)}
                  className="flex-1 py-2.5 bg-red-650 hover:bg-red-500 text-white font-bold uppercase tracking-wider rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {user.inventory.includes(viewItemModal.id) ? '✓ ADQUIRIDO' : '🛒 COMPRAR AGORA'}
                </button>

                <button
                  onClick={() => setViewItemModal(null)}
                  className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white rounded transition-all cursor-pointer"
                >
                  FECHAR
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
