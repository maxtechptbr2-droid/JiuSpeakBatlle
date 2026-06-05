/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Sparkles,
  ShoppingBag,
  Search,
  Check,
  X,
  History,
  Sparkle,
  Calendar,
  Layers,
  Sword,
  Target,
  Crown,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';
import { AvatarWithFrame } from './AvatarWithFrame';

interface InventoryPanelProps {
  user: UserProfile;
  updateUser: (updatedFields: Partial<UserProfile>) => void;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
  onAddAuditLog: (type: any, description: string, amountBRL?: number, amountKC?: number) => void;
}

export default function InventoryPanel({
  user,
  updateUser,
  showToast,
  onAddAuditLog
}: InventoryPanelProps) {
  // Inventory items fetched from DB
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom interactive subcategories mapping standard BJJ categories
  // "Todos" | "AVATAR" | "FRAME" | "TITLE" | "EMOTE" | "EFFECT"
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  // Preview States for equipable avatar previewing before confirming
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [previewItemName, setPreviewItemName] = useState<string | null>(null);
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  const [previewFrameName, setPreviewFrameName] = useState<string | null>(null);

  // Lazy loading state
  const [visibleLimit, setVisibleLimit] = useState(8);
  const [isLazyLoadingMore, setIsLazyLoadingMore] = useState(false);

  // Loading indicator for actions
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Sincronizar Mochila do Atleta
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      const res = await fetch('/api/inventory', {
        headers: { 'Authorization': `Bearer ${token || ''}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setItems(data.items);
      } else {
        showToast(data.error || "Operação contábil para requisitar mochila falhou.", "error");
      }
    } catch (err) {
      console.error("Erro técnico ao carregar mochila:", err);
      showToast("Conexão interrompida com os servidores de tesouraria.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 4. Equip Item Action (mutually exclusive by category)
  const handleEquipItem = async (item: any) => {
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) {
      showToast("Sessão expirada. Autentique-se novamente.", "error");
      return;
    }

    setActionInProgressId(item.id);
    try {
      const res = await fetch('/api/inventory/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: item.id })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Ação de equipamento bloqueada.", "error");
        return;
      }

      showToast(`Equipamento Concluído: "${item.name}" já está ativo!`, "success");
      onAddAuditLog(
        'market_trade',
        `Atleta ativou o item cosmético "${item.name}" em seu perfil.`,
        undefined,
        0
      );

      // Trigger automatic viral share modal if rare avatar or legendary/rare frame
      if (item.product?.category === 'FRAME' && (item.product?.rarity === 'Mitica' || item.product?.rarity === 'Lendária' || item.product?.rarity === 'Mestre' || item.product?.rarity === 'Diamante' || item.product?.rarity === 'Ouro')) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('trigger-viral-share', {
            detail: {
              type: 'moldura_lendaria',
              customTitle: `${item.name.toUpperCase()} EQUIPADA!`
            }
          }));
        }, 1000);
      } else if (item.product?.category === 'AVATAR') {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('trigger-viral-share', {
            detail: {
              type: 'avatar_raro',
              customTitle: `${item.name.toUpperCase()} ATIVADO!`
            }
          }));
        }, 1000);
      }

      // Instantly optimize local image / avatar if setting custom equipped profile items
      if (item.product?.category === 'AVATAR' && item.product?.imageUrl) {
        updateUser({
          avatar: item.product.imageUrl
        });
        // Cache user details locally
        const cached = localStorage.getItem('jiuspeak_user_profile_v2');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.avatar = item.product.imageUrl;
            localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(parsed));
          } catch (e) {}
        }
      }

      // Sincronizar inventário
      await fetchInventory();

    } catch (err) {
      console.error(err);
      showToast("Erro de rede ao equipar item.", "error");
    } finally {
      setActionInProgressId(null);
    }
  };

  // 5. Unequip Item Action
  const handleUnequipItem = async (item: any) => {
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) {
      showToast("Sessão expirada. Autentique-se novamente.", "error");
      return;
    }

    setActionInProgressId(item.id);
    try {
      const res = await fetch('/api/inventory/unequip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: item.id })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Ação de desequipamentos falhou.", "error");
        return;
      }

      showToast(`Item "${item.name}" foi desequipado.`, "info");
      onAddAuditLog(
        'market_trade',
        `Atleta desabilitou o item de status "${item.name}".`,
        undefined,
        0
      );

      // If we desequipped avatar, restore standard placeholder
      if (item.product?.category === 'AVATAR') {
        const fallbackAvatar = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200";
        updateUser({
          avatar: fallbackAvatar
        });
        const cached = localStorage.getItem('jiuspeak_user_profile_v2');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.avatar = fallbackAvatar;
            localStorage.setItem('jiuspeak_user_profile_v2', JSON.stringify(parsed));
          } catch (e) {}
        }
      }

      await fetchInventory();

    } catch (err) {
      console.error(err);
      showToast("Erro de comunicação ao desequipar item.", "error");
    } finally {
      setActionInProgressId(null);
    }
  };

  // Filters catalog lists matching categorization tabs + query
  const getFilteredItems = () => {
    return items.filter((item) => {
      // 1. Filter by category
      if (activeCategory !== 'Todos') {
        const itemCat = item.product?.category?.toUpperCase();
        if (itemCat !== activeCategory) return false;
      }

      // 2. Filter by search query (name / description)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }

      return true;
    });
  };

  const filteredItems = getFilteredItems();
  const paginatedItems = filteredItems.slice(0, visibleLimit);
  const hasMoreToLoad = filteredItems.length > visibleLimit;

  // Custom simulation for smooth lazy loading triggers
  const triggerLoadMore = () => {
    setIsLazyLoadingMore(true);
    setTimeout(() => {
      setVisibleLimit((prev) => prev + 8);
      setIsLazyLoadingMore(false);
    }, 450);
  };

  // Helper values for equipped showcase panel
  const equippedAvatar = items.find(it => it.isEquipped && it.product?.category === 'AVATAR');
  const equippedFrame = items.find(it => it.isEquipped && it.product?.category === 'FRAME');
  const equippedTitle = items.find(it => it.isEquipped && it.product?.category === 'TITLE');
  const equippedEmote = items.find(it => it.isEquipped && it.product?.category === 'EMOTE');
  const equippedEffect = items.find(it => it.isEquipped && it.product?.category === 'EFFECT');
  const equippedTheme = items.find(it => it.isEquipped && it.product?.category === 'THEME');
  const equippedBelt = items.find(it => it.isEquipped && it.product?.category === 'BELT');
  const equippedLegendary = items.find(it => it.isEquipped && it.product?.category === 'LEGENDARY');

  // Beautiful cosmetic badge styler
  const getRarityBadgeStyle = (rarity: string) => {
    const r = rarity?.toUpperCase();
    switch (r) {
      case 'COMMON':
      case 'COMUM':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'RARE':
      case 'RARO':
        return 'bg-blue-600/10 text-blue-400 border-blue-500/25';
      case 'EPIC':
      case 'ÉPICO':
        return 'bg-purple-650/10 text-purple-400 border-purple-500/25';
      case 'LEGENDARY':
      case 'LENDÁRIO':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold';
      case 'MYTHIC':
      case 'MÍTICO':
        return 'bg-gradient-to-r from-red-600/15 to-orange-500/15 text-orange-400 border-orange-500/40 font-extrabold shadow-sm';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-850';
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

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "03/06/2026";
    }
  };

  return (
    <div className="space-y-6" id="bjj-inventory-module">
      
      {/* MMORPG Header Title & Status */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-violet-400 px-2 py-0.5 bg-violet-950/40 border border-violet-850 rounded-full">
            MOCHILA DE ATRIBUTOS
          </span>
          <h2 className="text-3xl font-display font-extrabold text-white mt-1.5 flex items-center gap-2">
            <Award className="w-8 h-8 text-violet-500 animate-pulse" />
            Inventário do Combatente
          </h2>
          <p className="text-xs text-slate-420 font-sans mt-0.5">
            Gerencie e equipe seus itens cosméticos, insígnias de prestígio, molduras honorárias e efeitos especiais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-violet-400' : ''}`} />
            <span>Sincronizar</span>
          </button>

          <div className="bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-[10px] uppercase font-mono text-slate-500">SEU SALDO:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-amber-400 font-mono">{user.coins}</span>
              <span className="text-[10px] font-bold text-slate-450 font-sans">KC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Competitive MMORPG Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Dynamic Fighter Active Cosmetic Cards Core (MMORPG Style) */}
        <div className="xl:col-span-4 bg-gradient-to-b from-slate-900/80 to-slate-950/90 rounded-2xl border border-slate-800 p-5 space-y-6 flex flex-col justify-between shadow-xl">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-display font-black text-xs text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500 animate-pulse" />
                Visual Ativo (Equipado)
              </h3>
              <span className="text-[9px] font-mono bg-violet-950/40 text-violet-300 border border-violet-900/40 px-1.5 py-0.5 rounded">
                MMORPG Equip v1
              </span>
            </div>

            {/* Simulated BJJ Athlete Avatar Holographic Frame with live active options */}
            <div className={`relative w-44 h-44 mx-auto my-6 flex items-center justify-center ${previewAvatarUrl || previewFrame ? 'ring-2 ring-violet-500 ring-offset-4 ring-offset-slate-900 rounded-full' : ''}`}>
              {/* Outer Cosmic glow ring if equipped effects */}
              {equippedEffect && (
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-cyan-500/30 animate-spin pointer-events-none" />
              )}
              
              <AvatarWithFrame
                avatarUrl={previewAvatarUrl || user.avatar}
                userName={user.name}
                frame={previewFrame ? { id: 'preview', name: previewFrameName || 'Preview Frame', rarity: previewFrame || 'COMMON' } : equippedFrame ? equippedFrame.product : null}
                size="xl"
              />

              {/* Subtitle / Icon overlay if avatar has effects */}
              {equippedEffect && (
                <div className="absolute bottom-1 right-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 z-2 z-20 shadow">
                  <span>⚡ EFFECT</span>
                </div>
              )}

              {/* Holographic glowing grids */}
              <div className="absolute inset-0 border border-violet-500/10 rounded-full scale-105 animate-ping pointer-events-none" />
            </div>

            {/* PREVIEW CONTROLS */}
            {previewAvatarUrl && (
              <div className="p-3 bg-violet-950/25 rounded-xl border border-violet-850/50 space-y-2 text-center animate-fadeIn">
                <span className="text-[10px] font-mono text-violet-300 font-bold tracking-wider uppercase block">
                  ✨ PRÉ-VISUALIZANDO: {previewItemName}
                </span>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={async () => {
                      const matchingItem = items.find(it => (it.imageUrl || it.product?.imageUrl) === previewAvatarUrl);
                      if (matchingItem) {
                        await handleEquipItem(matchingItem);
                      }
                      setPreviewAvatarUrl(null);
                      setPreviewItemName(null);
                    }}
                    className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Equipar Avatar
                  </button>
                  <button
                    onClick={() => {
                      setPreviewAvatarUrl(null);
                      setPreviewItemName(null);
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-lg text-[10px] transition-all cursor-pointer"
                  >
                    Descarregar Prévia
                  </button>
                </div>
              </div>
            )}

            {previewFrame && (
              <div className="p-3 bg-violet-950/25 rounded-xl border border-violet-850/50 space-y-2 text-center animate-fadeIn mt-2">
                <span className="text-[10px] font-mono text-violet-300 font-bold tracking-wider uppercase block">
                  👁️ PRÉ-VISUALIZANDO MOLDURA: {previewFrameName}
                </span>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={async () => {
                      const matchingItem = items.find(it => it.name === previewFrameName && it.product?.category === 'FRAME');
                      if (matchingItem) {
                        await handleEquipItem(matchingItem);
                      }
                      setPreviewFrame(null);
                      setPreviewFrameName(null);
                    }}
                    className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Equipar Moldura
                  </button>
                  <button
                    onClick={() => {
                      setPreviewFrame(null);
                      setPreviewFrameName(null);
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-lg text-[10px] transition-all cursor-pointer"
                  >
                    Descarregar Prévia
                  </button>
                </div>
              </div>
            )}

            {/* Display active Title under character picture */}
            <div className="text-center space-y-1">
              <div className="flex justify-center items-center gap-1">
                <span className="text-[10px] text-slate-500 font-mono">Faixa {user.belt}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <span className="text-[10px] text-slate-500 font-mono">Nv. {user.level}</span>
              </div>
              <h4 className="font-display font-extrabold text-lg text-slate-105 tracking-tight truncate px-4">
                {user.name}
              </h4>
              
              {/* Interactive badge for equipped TITLE */}
              {equippedTitle ? (
                <div className="inline-block bg-gradient-to-r from-amber-600/20 via-yellow-500/10 to-amber-600/20 border border-yellow-500/30 px-3 py-1 rounded-md mt-1">
                  <p className="text-xs font-mono font-bold text-yellow-500 flex items-center justify-center gap-1">
                    <Sparkle className="w-3 h-3 animate-spin text-yellow-500" />
                    "{equippedTitle.name}"
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 font-mono">Nenhum título equipado</p>
              )}
            </div>

          </div>

          {/* Slot Grid representing combat accessories */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider text-center">Status de Equipamentos</p>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              
              {/* Category: Avatar */}
              <div className={`p-2 rounded-xl flex items-center justify-between border ${equippedAvatar ? 'bg-violet-950/20 border-violet-500/30' : 'bg-slate-950/40 border-slate-900'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">👤</span>
                  <div className="leading-tight">
                    <span className="block text-[8px] text-slate-500 font-mono">AVATAR</span>
                    <span className="text-[10px] font-semibold truncate text-slate-350 max-w-[80px] block">
                      {equippedAvatar ? equippedAvatar.name : 'Vazio'}
                    </span>
                  </div>
                </div>
                {equippedAvatar && <X onClick={() => handleUnequipItem(equippedAvatar)} className="w-3 h-3 text-slate-500 hover:text-red-400 cursor-pointer" />}
              </div>

              {/* Category: Frame */}
              <div className={`p-2 rounded-xl flex items-center justify-between border ${equippedFrame ? 'bg-violet-950/20 border-violet-500/30' : 'bg-slate-950/40 border-slate-900'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🖼️</span>
                  <div className="leading-tight">
                    <span className="block text-[8px] text-slate-500 font-mono">MOLDURA</span>
                    <span className="text-[10px] font-semibold truncate text-slate-350 max-w-[80px] block">
                      {equippedFrame ? equippedFrame.name : 'Vazio'}
                    </span>
                  </div>
                </div>
                {equippedFrame && <X onClick={() => handleUnequipItem(equippedFrame)} className="w-3 h-3 text-slate-500 hover:text-red-400 cursor-pointer" />}
              </div>

              {/* Category: Title */}
              <div className={`p-2 rounded-xl flex items-center justify-between border ${equippedTitle ? 'bg-violet-950/20 border-violet-500/30' : 'bg-slate-950/40 border-slate-900'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🏷️</span>
                  <div className="leading-tight">
                    <span className="block text-[8px] text-slate-500 font-mono">TÍTULO</span>
                    <span className="text-[10px] font-semibold truncate text-slate-350 max-w-[80px] block">
                      {equippedTitle ? equippedTitle.name : 'Vazio'}
                    </span>
                  </div>
                </div>
                {equippedTitle && <X onClick={() => handleUnequipItem(equippedTitle)} className="w-3 h-3 text-slate-500 hover:text-red-400 cursor-pointer" />}
              </div>

              {/* Category: Emote */}
              <div className={`p-2 rounded-xl flex items-center justify-between border ${equippedEmote ? 'bg-violet-950/20 border-violet-500/30' : 'bg-slate-950/40 border-slate-900'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">💬</span>
                  <div className="leading-tight">
                    <span className="block text-[8px] text-slate-500 font-mono">EMOTE</span>
                    <span className="text-[10px] font-semibold truncate text-slate-350 max-w-[80px] block">
                      {equippedEmote ? equippedEmote.name : 'Vazio'}
                    </span>
                  </div>
                </div>
                {equippedEmote && <X onClick={() => handleUnequipItem(equippedEmote)} className="w-3 h-3 text-slate-500 hover:text-red-400 cursor-pointer" />}
              </div>

              {/* Category: Theme */}
              <div className={`p-2 rounded-xl flex items-center justify-between border ${equippedTheme ? 'bg-violet-950/20 border-violet-500/30' : 'bg-slate-950/40 border-slate-900'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🎨</span>
                  <div className="leading-tight">
                    <span className="block text-[8px] text-slate-500 font-mono">TEMA</span>
                    <span className="text-[10px] font-semibold truncate text-slate-350 max-w-[80px] block">
                      {equippedTheme ? equippedTheme.name : 'Padrão'}
                    </span>
                  </div>
                </div>
                {equippedTheme && <X onClick={() => handleUnequipItem(equippedTheme)} className="w-3 h-3 text-slate-500 hover:text-red-400 cursor-pointer" />}
              </div>

              {/* Category: Special Belt */}
              <div className={`p-2 rounded-xl flex items-center justify-between border ${equippedBelt ? 'bg-violet-950/20 border-violet-500/30' : 'bg-slate-950/40 border-slate-900'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🥋</span>
                  <div className="leading-tight">
                    <span className="block text-[8px] text-slate-500 font-mono">FAIXA ESP.</span>
                    <span className="text-[10px] font-semibold truncate text-slate-350 max-w-[80px] block">
                      {equippedBelt ? equippedBelt.name : 'Padrão'}
                    </span>
                  </div>
                </div>
                {equippedBelt && <X onClick={() => handleUnequipItem(equippedBelt)} className="w-3 h-3 text-slate-500 hover:text-red-400 cursor-pointer" />}
              </div>

              {/* Category: Legendary Item */}
              <div className={`p-2 rounded-xl flex items-center justify-between border ${equippedLegendary ? 'bg-violet-950/20 border-violet-500/30' : 'bg-slate-950/40 border-slate-900'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">👑</span>
                  <div className="leading-tight">
                    <span className="block text-[8px] text-slate-500 font-mono">LENDÁRIO</span>
                    <span className="text-[10px] font-semibold truncate text-slate-350 max-w-[80px] block">
                      {equippedLegendary ? equippedLegendary.name : 'Vazio'}
                    </span>
                  </div>
                </div>
                {equippedLegendary && <X onClick={() => handleUnequipItem(equippedLegendary)} className="w-3 h-3 text-slate-500 hover:text-red-400 cursor-pointer" />}
              </div>

            </div>

            {/* Row-wide category slot for special effects */}
            <div className={`p-2 rounded-xl flex items-center justify-between border ${equippedEffect ? 'bg-indigo-950/20 border-indigo-500/30 ring-1 ring-indigo-500/10' : 'bg-slate-950/40 border-slate-900'}`}>
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <div className="leading-tight">
                  <span className="block text-[8px] text-indigo-400 font-mono font-bold uppercase">EFEITO ESPECIAL ATIVO</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {equippedEffect ? equippedEffect.name : 'Fundo padrão do tatame ativo'}
                  </span>
                </div>
              </div>
              {equippedEffect && (
                <button
                  onClick={() => handleUnequipItem(equippedEffect)}
                  className="p-1 rounded bg-slate-900 hover:bg-red-950/40 border border-slate-800 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Right Column - Beautiful filtering menu and real backpack grid loaded lazily */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Filtering cockpit, MMORPG theme */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-850 space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Category Selector Tabs */}
              <div className="flex flex-wrap gap-1.5" id="inventory-cat-filters">
                {[
                  { value: 'Todos', label: 'Todos os Itens' },
                  { value: 'AVATAR', label: '👤 Avatares' },
                  { value: 'FRAME', label: '🖼️ Molduras' },
                  { value: 'TITLE', label: '🏷️ Títulos' },
                  { value: 'EMOTE', label: '💬 Emojis' },
                  { value: 'EFFECT', label: '✨ Efeitos' },
                  { value: 'THEME', label: '🎨 Temas' },
                  { value: 'BELT', label: '🥋 Faixas Esp.' },
                  { value: 'LEGENDARY', label: '👑 Lendários' }
                ].map((cat) => {
                  const isActive = activeCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setActiveCategory(cat.value);
                        setVisibleLimit(8); // Reset lazy loading limit
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-violet-600 text-white shadow shadow-violet-500/20 border-l-2 border-violet-450'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-100 border border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic search inside backpack */}
              <div className="relative group min-w-[240px]">
                <input
                  type="text"
                  placeholder="Pesquisar na mochila..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleLimit(8); // Reset limit
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 text-slate-100 rounded-xl border border-slate-850 focus:border-violet-500 focus:outline-none transition-all placeholder-slate-550 font-mono"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              </div>

            </div>

          </div>

          {/* Grid display with real records */}
          {isLoading ? (
            <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-16 text-center text-slate-500 h-96 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Requisitando cofre de itens do lutador...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-16 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center mx-auto text-slate-500 text-xl">
                🎒
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-300">Nenhum recurso encontrado nesta categoria.</p>
                <p className="text-xs text-slate-505 max-w-sm mx-auto leading-normal">
                  Visite a **Biblioteca de Recursos / Loja Virtual** para desbloquear avatares personalizados, títulos e efeitos especiais usando seus Kimono Coins.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="inventory-grid">
                {paginatedItems.map((item) => {
                  const isEquipped = item.isEquipped;
                  const isBusy = actionInProgressId === item.id;
                  
                  // Helper function for display icon mappings according to category
                  const getItemTypePrefix = (cat: string) => {
                    switch (cat?.toUpperCase()) {
                      case 'AVATAR': return { icon: '👤', text: 'Avatar' };
                      case 'FRAME': return { icon: '🖼️', text: 'Moldura' };
                      case 'TITLE': return { icon: '🏷', text: 'Título' };
                      case 'EMOTE': return { icon: '💬', text: 'Emoji' };
                      case 'EFFECT': return { icon: '✨', text: 'Efeito' };
                      case 'THEME': return { icon: '🎨', text: 'Tema' };
                      case 'BELT': return { icon: '🥋', text: 'Faixa Esp.' };
                      case 'LEGENDARY': return { icon: '👑', text: 'Lendário' };
                      default: return { icon: '🎒', text: 'Especial' };
                    }
                  };

                  const typeDetails = getItemTypePrefix(item.product?.category);

                  return (
                    <div
                      key={item.id}
                      className={`bg-slate-950/70 rounded-2xl border flex flex-col justify-between overflow-hidden group transition-all duration-300 ${
                        isEquipped
                          ? 'border-yellow-500 ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/5'
                          : 'border-slate-850 hover:border-slate-700/80 hover:bg-slate-950'
                      }`}
                      id={`inventory-card-${item.id}`}
                    >
                      {/* Top visualization preview block */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          
                          {/* Image Box */}
                          <div className="h-28 bg-slate-900/60 rounded-xl overflow-hidden relative border border-slate-850/65 flex items-center justify-center mb-3">
                            {item.imageUrl || item.product?.imageUrl ? (
                              <img
                                src={item.imageUrl || item.product?.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-4xl filter drop-shadow">{typeDetails.icon}</div>
                            )}

                            {/* Category Indicator overlay */}
                            <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-310 border border-slate-800">
                              {typeDetails.icon} {typeDetails.text}
                            </span>

                            {/* Rarity Star marker */}
                            <span className={`absolute top-1.5 left-1.5 text-[8px] font-extrabold px-1.5 py-0.5 rounded border tracking-wide uppercase ${getRarityBadgeStyle(item.rarity)}`}>
                              {getRarityLabel(item.rarity)}
                            </span>

                            {isEquipped && (
                              <span className="absolute top-1.5 right-1.5 bg-yellow-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider shadow-sm animate-pulse flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" />
                                <span>ATIVO</span>
                              </span>
                            )}
                          </div>

                          <h4 className="font-display font-bold text-xs text-slate-101 truncate leading-tight">
                            {item.name}
                          </h4>
                          
                          <p className="text-[10px] text-slate-400 mt-1 lines-clamp-3 leading-snug">
                            {item.description || "Este item faz parte da sua coleção de conquistas e itens de tatame."}
                          </p>
                        </div>

                        {/* Footer detailing timestamp */}
                        <div className="mt-4 pt-3 border-t border-slate-900 flex flex-col gap-1 text-[9px] text-slate-500 italic">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-600" />
                            Adquirido em {formatDate(item.acquiredAt)}
                          </span>
                        </div>

                      </div>

                      {/* Equipment Action button */}
                      <div className="p-3 bg-slate-950/30 border-t border-slate-900/60">
                        {isEquipped ? (
                          <button
                            disabled={isBusy}
                            onClick={() => handleUnequipItem(item)}
                            className="w-full py-1.5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400 font-mono text-[10px] font-bold transition-all flex items-center justify-center gap-1 animate-fadeIn cursor-pointer"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <X className="w-3 h-3" />
                                <span>DESEQUIPAR</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {item.product?.category?.toUpperCase() === 'AVATAR' && (
                              <button
                                disabled={isBusy}
                                onClick={() => {
                                  const url = item.imageUrl || item.product?.imageUrl;
                                  if (url) {
                                    setPreviewAvatarUrl(url);
                                    setPreviewItemName(item.name);
                                    showToast(`Pré-visualização do avatar "${item.name}" ativada! Veja à esquerda.`, "info");
                                  }
                                }}
                                className="w-full py-1.5 rounded-xl border border-violet-500/20 bg-violet-950/10 text-violet-400 hover:bg-violet-950/20 hover:text-violet-350 font-mono text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                👁️ PRÉ-VISUALIZAR
                              </button>
                            )}
                            {item.product?.category?.toUpperCase() === 'FRAME' && (
                              <button
                                disabled={isBusy}
                                onClick={() => {
                                  setPreviewFrame(item.product?.rarity || 'COMMON');
                                  setPreviewFrameName(item.name);
                                  showToast(`Pré-visualização da moldura "${item.name}" ativada! Veja à esquerda.`, "info");
                                }}
                                className="w-full py-1.5 rounded-xl border border-violet-500/20 bg-violet-950/10 text-violet-400 hover:bg-violet-950/20 hover:text-violet-350 font-mono text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                👁️ PRÉ-VISUALIZAR
                              </button>
                            )}
                            <button
                              disabled={isBusy}
                              onClick={() => handleEquipItem(item)}
                              className="w-full py-1.5 rounded-xl bg-violet-650 hover:bg-violet-600 text-white font-mono text-[10px] font-extrabold transition-all shadow shadow-violet-500/10 flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer"
                            >
                              {isBusy ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>EQUIPAR ITEM</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Lazy Loading Triggers */}
              {hasMoreToLoad && (
                <div className="flex justify-center pt-4" id="lazy-loading-cockpit">
                  <button
                    onClick={triggerLoadMore}
                    disabled={isLazyLoadingMore}
                    className="px-6 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-violet-600/40 hover:shadow shadow-violet-500/5 font-mono text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {isLazyLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                        <span>Carregando materiais adicionais...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4 text-violet-400" />
                        <span>Carregando Mais Itens ({filteredItems.length - visibleLimit} restantes)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
