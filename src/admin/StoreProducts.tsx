/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Tag, 
  Calendar, 
  Search, 
  ToggleLeft, 
  ToggleRight, 
  Lock, 
  Unlock, 
  Percent, 
  Coins, 
  Sparkles, 
  RefreshCcw,
  Layers,
  Clock,
  Archive,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAdmin } from './AdminContext';

interface StoreItemPayload {
  id?: string;
  name: string;
  description: string;
  priceKC: number;
  priceBRL: number | null;
  category: string;
  rarity: string;
  imageUrl: string;
  stock: number | null;
  active: boolean;
  isPromo: boolean;
  promoPriceKC: number | null;
  releaseDate: string | null;
  promoEndDate: string | null;
}

const CATEGORIES = [
  { value: "Todos", label: "Todos os Itens" },
  { value: "AVATAR", label: "Avatares" },
  { value: "TITLE", label: "Títulos / Tags" },
  { value: "GI", label: "Kimonos / GIs" },
  { value: "BELT_STRIPE", label: "Graus de Faixa" },
  { value: "Itens Especiais", label: "Especiais & PDFs" }
];

const RARITIES = [
  { value: "COMMON", label: "Comum (Common)", color: "text-slate-400" },
  { value: "RARE", label: "Raro (Rare)", color: "text-blue-400" },
  { value: "EPIC", label: "Épico (Epic)", color: "text-violet-400" },
  { value: "LEGENDARY", label: "Lendário (Legendary)", color: "text-amber-400" }
];

export default function StoreProducts() {
  const { showToast } = useAdmin();
  
  // Product state limits
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Todos");
  
  // Modal / Form triggers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [formData, setFormData] = useState<StoreItemPayload>({
    name: "",
    description: "",
    priceKC: 1000,
    priceBRL: null,
    category: "Itens Especiais",
    rarity: "COMMON",
    imageUrl: "",
    stock: null,
    active: true,
    isPromo: false,
    promoPriceKC: null,
    releaseDate: null,
    promoEndDate: null
  });

  const [dateFieldUseRelease, setDateFieldUseRelease] = useState(false);
  const [dateFieldUsePromoEnd, setDateFieldUsePromoEnd] = useState(false);
  const [releaseDateString, setReleaseDateString] = useState("");
  const [promoEndDateString, setPromoEndDateString] = useState("");

  const [doubleConfirmDeleteId, setDoubleConfirmDeleteId] = useState<string | null>(null);

  // Fetch admin products
  const loadAdminProducts = async () => {
    setIsLoading(true);
    try {
      const url = `/api/admin/store/items?search=${encodeURIComponent(searchText)}&category=${selectedCategoryFilter === "Todos" ? "Todos" : selectedCategoryFilter}`;
      const res = await authFetch(url);
      const data = await res.json();
      if (data && data.success) {
        setProducts(data.items || []);
      } else {
        showToast(data.error || "Erro ao listar itens da loja.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Falha ao comunicar com os servidores de gerenciamento.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminProducts();
  }, [searchText, selectedCategoryFilter]);

  // Open creation modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      priceKC: 1000,
      priceBRL: null,
      category: "AVATAR",
      rarity: "COMMON",
      imageUrl: "",
      stock: null,
      active: true,
      isPromo: false,
      promoPriceKC: null,
      releaseDate: null,
      promoEndDate: null
    });
    setDateFieldUseRelease(false);
    setDateFieldUsePromoEnd(false);
    setReleaseDateString("");
    setPromoEndDateString("");
    setIsFormOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (prod: any) => {
    setEditingId(prod.id);
    setFormData({
      name: prod.name,
      description: prod.description || "",
      priceKC: prod.priceKC,
      priceBRL: prod.priceBRL !== null && prod.priceBRL !== undefined ? Number(prod.priceBRL) : null,
      category: prod.category,
      rarity: prod.rarity,
      imageUrl: prod.imageUrl || "",
      stock: prod.stock !== null && prod.stock !== undefined ? Number(prod.stock) : null,
      active: prod.active !== undefined ? Boolean(prod.active) : true,
      isPromo: prod.isPromo !== undefined ? Boolean(prod.isPromo) : false,
      promoPriceKC: prod.promoPriceKC !== null && prod.promoPriceKC !== undefined ? Number(prod.promoPriceKC) : null,
      releaseDate: prod.releaseDate || null,
      promoEndDate: prod.promoEndDate || null
    });

    if (prod.releaseDate) {
      setDateFieldUseRelease(true);
      // Format DateTime fordatetime-local input (YYYY-MM-DDTHH:MM)
      const d = new Date(prod.releaseDate);
      const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setReleaseDateString(isoLocal);
    } else {
      setDateFieldUseRelease(false);
      setReleaseDateString("");
    }

    if (prod.promoEndDate) {
      setDateFieldUsePromoEnd(true);
      const d = new Date(prod.promoEndDate);
      const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setPromoEndDateString(isoLocal);
    } else {
      setDateFieldUsePromoEnd(false);
      setPromoEndDateString("");
    }

    setIsFormOpen(true);
  };

  // Submit creation/edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast("O nome do item é obrigatório.", "error");
      return;
    }
    if (formData.priceKC < 0) {
      showToast("O preço em Kimono Coins não pode ser negativo.", "error");
      return;
    }

    // Process program dates
    const payload: any = {
      ...formData,
      releaseDate: dateFieldUseRelease && releaseDateString ? new Date(releaseDateString).toISOString() : null,
      promoEndDate: dateFieldUsePromoEnd && promoEndDateString ? new Date(promoEndDateString).toISOString() : null,
      promoPriceKC: formData.isPromo ? (formData.promoPriceKC !== null ? Number(formData.promoPriceKC) : null) : null
    };

    try {
      const url = editingId ? `/api/admin/store/${editingId}/update` : `/api/admin/store/create`;
      const res = await authFetch(url, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(editingId ? "Item atualizado com sucesso!" : "Item criado com sucesso!", "success");
        setIsFormOpen(false);
        loadAdminProducts();
      } else {
        showToast(data.error || "Erro ao salvar informações do item.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Falha de rede ao salvar produto.", "error");
    }
  };

  // Duplicate product
  const handleDuplicate = async (id: string, name: string) => {
    try {
      const res = await authFetch(`/api/admin/store/${id}/duplicate`, {
        method: "POST"
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(`Item "${name}" duplicado com sucesso!`, "success");
        loadAdminProducts();
      } else {
        showToast(data.error || "Erro ao duplicar item.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Falha de rede ao tentar duplicar item.", "error");
    }
  };

  // Toggle activation
  const handleToggleActive = async (prod: any) => {
    const nextVal = !prod.active;
    try {
      const res = await authFetch(`/api/admin/store/${prod.id}/update`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: nextVal })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(nextVal ? `Produto "${prod.name}" Ativado!` : `Produto "${prod.name}" Desativado!`, "info");
        // Update local status directly for snappy performance prior to full load
        setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, active: nextVal } : p));
      } else {
        showToast(data.error || "Erro ao alterar visibilidade.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao tentar alterar status de ativação.", "error");
    }
  };

  // Delete product definitely
  const handleDeleteDefinitive = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/store/${id}/delete`, {
        method: "POST"
      });
      const data = await res.json();
      if (data && data.success) {
        showToast("Item excluído permanentemente do catálogo!", "success");
        setDoubleConfirmDeleteId(null);
        loadAdminProducts();
      } else {
        showToast(data.error || "Erro ao excluir item do catálogo.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Falha de rede ao tentar deletar item.", "error");
    }
  };

  // Direct fast-edit price
  const handleQuickPriceChange = async (id: string, currentVal: number) => {
    const rawVal = window.prompt("Digite o novo valor em Kimono Coins (KC):", String(currentVal));
    if (rawVal === null) return;
    const nextVal = Number(rawVal);
    if (isNaN(nextVal) || nextVal < 0) {
      showToast("Valor inválido inserido.", "error");
      return;
    }

    try {
      const res = await authFetch(`/api/admin/store/${id}/update`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priceKC: nextVal })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast("Preço atualizado com sucesso!", "success");
        setProducts(prev => prev.map(p => p.id === id ? { ...p, priceKC: nextVal } : p));
      }
    } catch (E) {
      showToast("Erro ao atualizar preço diretamente.", "error");
    }
  };

  // Direct fast-edit stock limit
  const handleQuickStockChange = async (id: string, currentVal: number | null) => {
    const promptStr = window.prompt("Qual o limite de estoque disponível? (Deixe em branco ou digite 'null' para ilimitado):", currentVal === null ? "" : String(currentVal));
    if (promptStr === null) return;
    
    let nextVal: number | null = null;
    if (promptStr.trim() !== "" && promptStr.trim().toLowerCase() !== "null") {
      nextVal = Number(promptStr);
      if (isNaN(nextVal) || nextVal < 0) {
        showToast("Limite de estoque inválido inserido.", "error");
        return;
      }
    }

    try {
      const res = await authFetch(`/api/admin/store/${id}/update`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock: nextVal })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast("Estoque operacional atualizado!", "success");
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: nextVal } : p));
      }
    } catch (E) {
      showToast("Erro ao salvar limite de estoque.", "error");
    }
  };

  // Helper label formatting
  const getRarityLabel = (rar: string) => {
    const found = RARITIES.find(r => r.value === rar);
    return found ? found.label : rar;
  };

  const getRarityBadgeStyle = (rar: string) => {
    switch(rar) {
      case 'COMMON': return 'bg-slate-900 border border-slate-700/50 text-slate-400';
      case 'RARE': return 'bg-blue-950/40 border border-blue-900/50 text-blue-405';
      case 'EPIC': return 'bg-violet-950/40 border border-violet-900/50 text-violet-405 font-semibold';
      case 'LEGENDARY': return 'bg-amber-950/40 border border-amber-900/50 text-amber-405 font-bold animate-pulse';
      default: return 'bg-slate-900 border border-slate-700 text-slate-400';
    }
  };

  const getCategoryLabel = (cat: string) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.label : cat;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fadeIn" id="admin-store-products-tab-root">
      
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="font-display font-medium text-sm text-slate-201 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-400" />
            <span>Centro de Cadastro de Cosméticos & Loja Virtual</span>
          </h3>
          <p className="text-[10px] text-slate-500 font-sans">
            Crie, programe novos lançamentos de cosméticos, edite preços promocionais e pilote campanhas ativas no banco de dados.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold p-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all self-start md:self-auto shadow-lg shadow-indigo-950/50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Item</span>
        </button>
      </div>

      {/* Filter and search utilities toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs font-mono">
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-850">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat.value)}
              className={`p-1.5 px-3 rounded-lg text-[10.5px] font-semibold cursor-pointer transition-all ${
                selectedCategoryFilter === cat.value
                  ? 'bg-indigo-605 text-white'
                  : 'text-slate-400 hover:text-slate-201'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Filtrar por nome de item..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-slate-950 border border-slate-850 p-2 pl-8.5 rounded-xl text-slate-101 placeholder-slate-500 text-xs font-sans w-full md:w-64 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Catalog inventory items layout */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3 font-mono text-xs text-slate-500 animate-pulse bg-slate-950/20 rounded-2xl border border-slate-850">
          <RefreshCcw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
          <span>Sincronizando registros do catálogo com PostgreSQL...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-slate-950/20 rounded-2xl border border-slate-850 text-slate-500 text-xs">
          <Archive className="w-10 h-10 mx-auto text-slate-650" />
          <p className="font-semibold">Nenhum cosmético catalogado</p>
          <p className="text-[10px] text-slate-600 font-sans max-w-sm mx-auto">
            Não há nenhum item registrado para os filtros ativos. Use o botão superior para registrar um novo cosmético.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-950/20">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-850 text-[10.5px] uppercase font-bold text-slate-400">
                <th className="p-3 w-12 text-center">Preview</th>
                <th className="p-3">Identificação / Detalhes</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Raridade</th>
                <th className="p-3">Estoque</th>
                <th className="p-3 text-right">Preço (KC)</th>
                <th className="p-3 w-28 text-center">Status</th>
                <th className="p-3 w-32 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-[11.5px] text-slate-300">
              {products.map((prod) => {
                const now = new Date();
                const isPromoActive = prod.isPromo && (prod.promoEndDate === null || prod.promoEndDate === undefined || now <= new Date(prod.promoEndDate));
                const isFutureLaunch = prod.releaseDate && now < new Date(prod.releaseDate);

                return (
                  <tr 
                    key={prod.id}
                    className={`hover:bg-slate-900/40 transition-colors ${
                      !prod.active ? 'opacity-55' : ''
                    }`}
                  >
                    {/* Image Preview */}
                    <td className="p-3 text-center">
                      <div className="w-8 h-8 rounded bg-slate-900 border border-slate-750 flex items-center justify-center overflow-hidden mx-auto">
                        {prod.imageUrl ? (
                          <img 
                            src={prod.imageUrl} 
                            alt={prod.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-sm">🥋</span>
                        )}
                      </div>
                    </td>

                    {/* Name & details */}
                    <td className="p-3 space-y-0.5 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-101 font-sans text-xs">{prod.name}</span>
                        {isPromoActive && (
                          <span className="bg-rose-950/55 border border-rose-800/60 text-rose-400 font-bold px-1.5 py-0.2 rounded text-[8px] flex items-center gap-0.5 animate-pulse">
                            <Percent className="w-2 h-2" /> OFF
                          </span>
                        )}
                        {isFutureLaunch && (
                          <span className="bg-amber-950/50 border border-amber-800/40 text-amber-500 px-1 py-0.2 rounded text-[8px] font-semibold flex items-center gap-0.5" title={`Lançamento programado para: ${new Date(prod.releaseDate).toLocaleString()}`}>
                            <Clock className="w-2 h-2" /> {new Date(prod.releaseDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-550 line-clamp-1 font-sans">{prod.description || "Sem descrição registrada."}</p>
                    </td>

                    {/* Category */}
                    <td className="p-3 text-slate-400">
                      <span className="bg-slate-900/60 p-1 px-2 rounded border border-slate-805 text-[10px] uppercase">
                        {getCategoryLabel(prod.category)}
                      </span>
                    </td>

                    {/* Rarity */}
                    <td className="p-3">
                      <span className={`p-1 px-2 rounded text-[10px] font-semibold uppercase ${getRarityBadgeStyle(prod.rarity)}`}>
                        {getRarityLabel(prod.rarity)}
                      </span>
                    </td>

                    {/* Stock limit */}
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleQuickStockChange(prod.id, prod.stock)}
                        className="text-left font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                        title="Clique para alterar limite de estoque"
                      >
                        {prod.stock !== null && prod.stock !== undefined ? (
                          <span className={prod.stock === 0 ? 'text-rose-500' : prod.stock < 10 ? 'text-amber-550' : 'text-slate-300'}>
                            {prod.stock} un.
                          </span>
                        ) : (
                          <span className="text-slate-500">Ilimitado ♾️</span>
                        )}
                      </button>
                    </td>

                    {/* Price in KC */}
                    <td className="p-3 text-right">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => handleQuickPriceChange(prod.id, prod.priceKC)}
                          className="font-bold text-slate-101 hover:text-indigo-400 hover:underline cursor-pointer text-xs"
                          title="Clique para alterar preço em KC"
                        >
                          {prod.priceKC.toLocaleString()} KC
                        </button>
                        {isPromoActive && prod.promoPriceKC !== null && (
                          <p className="text-[9.5px] text-rose-450 font-bold line-through ml-auto block">
                            De {prod.priceKC} KC
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status Toggle switch */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(prod)}
                        className="mx-auto block text-slate-400 hover:text-white cursor-pointer"
                        title={prod.active ? "Desativar Item" : "Ativar Item"}
                      >
                        {prod.active ? (
                          <span className="text-emerald-450 hover:opacity-80 flex items-center justify-center gap-1 text-[10px] font-bold">
                            <ToggleRight className="w-5.5 h-5.5 text-emerald-500" />
                            <span>ATIVO</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 hover:opacity-80 flex items-center justify-center gap-1 text-[10px] font-semibold">
                            <ToggleLeft className="w-5.5 h-5.5 text-slate-600" />
                            <span>INATIVO</span>
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions Trigger panel */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(prod)}
                          title="Editar item cadastrado"
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:text-indigo-400 cursor-pointer text-slate-400 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(prod.id, prod.name)}
                          title="Duplicar item cosmético"
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500 hover:text-amber-400 cursor-pointer text-slate-400 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {doubleConfirmDeleteId === prod.id ? (
                          <div className="flex items-center gap-1 bg-rose-955/40 border border-rose-900/60 p-0.5 rounded leading-none">
                            <button
                              type="button"
                              onClick={() => handleDeleteDefinitive(prod.id)}
                              className="text-[9px] font-bold text-rose-500 hover:underline px-1 py-0.5 cursor-pointer uppercase shrink-0"
                            >
                              SIM, EXCLUIR
                            </button>
                            <button
                              type="button"
                              onClick={() => setDoubleConfirmDeleteId(null)}
                              className="text-[9px] text-slate-400 hover:text-white px-1 shrink-0 font-bold"
                            >
                              NÃO
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDoubleConfirmDeleteId(prod.id)}
                            title="Remover definitivamente"
                            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-rose-500/80 hover:text-rose-455 cursor-pointer text-slate-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FOOTER METRICS INFO */}
      <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 text-[10px] text-slate-500 flex justify-between items-center font-mono">
        <span>Sincronia: PostgreSQL / In-Memory Table Dual Engine Ativa</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Pronto • {products.length} cosméticos indexados</span>
        </span>
      </div>

      {/* ==========================================
          MODAL FORM: CADASTRAR OU EDITAR PRODUTO
          ========================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto" id="store-form-modal">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/15">
              <div className="space-y-0.5">
                <h4 className="font-display font-extrabold text-sm text-slate-201 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-indigo-400" />
                  <span>{editingId ? "Editar Registro Cosmético" : "Cadastrar Novo Cosmético"}</span>
                </h4>
                <p className="text-[9px] text-slate-500 font-mono">
                  {editingId ? `ID DO OBJETO: ${editingId}` : "Preencha os campos para cadastrar no PostgreSQL."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 px-2 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs">
              
              {/* Nome & Categoria row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-450 uppercase block">Nome do Item *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kimono Imperial Dourado"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-101 placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-450 uppercase block">Categoria de Destino</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-101 focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                  >
                    <option value="AVATAR">Avatar Perfil</option>
                    <option value="TITLE">Título / Tag Especial</option>
                    <option value="GI">Kimono / GI Especial</option>
                    <option value="BELT_STRIPE">Resgate de Graus / Faixas</option>
                    <option value="Itens Especiais">Apostila / PDF Técnico</option>
                  </select>
                </div>
              </div>

              {/* Descricao text area */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-450 uppercase block">Descrição Técnica / Comercial</label>
                <textarea
                  rows={2}
                  placeholder="Explique o que o lutador ganha ao obter este cosmético..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-101 placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs font-sans text-slate-100 resize-none"
                />
              </div>

              {/* Preço KC, Estoque Limite, Raridade row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-450 uppercase block">Preço Padrão (Coins KC) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.priceKC}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceKC: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 pl-8.5 rounded-lg text-slate-101 focus:outline-none focus:border-indigo-500 text-xs font-mono text-slate-100"
                    />
                    <Coins className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-slate-450 uppercase">Estoque Operacional</label>
                    <span className="text-[8.5px] text-slate-500 uppercase">Vazio = Ilimitado</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    placeholder="♾️ Ilimitado de fábrica"
                    value={formData.stock === null ? "" : formData.stock}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData(prev => ({ ...prev, stock: v === "" ? null : Number(v) }));
                    }}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-101 focus:outline-none focus:border-indigo-500 text-xs font-mono text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-450 uppercase block">Patente / Raridade</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-101 focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                  >
                    {RARITIES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* URL da Imagem Preview */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-450 uppercase block">Endereço URL da Imagem (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-... ou URL CDN"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-101 placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs font-mono text-slate-100"
                />
              </div>

              {/* PROGRAMAÇÃO DE LANÇAMENTO (Lançamento Programado) */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 uppercase text-[9.5px] font-mono tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Programar Lançamento Temporizado
                  </span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10.5px]">
                    <input
                      type="checkbox"
                      checked={dateFieldUseRelease}
                      onChange={(e) => setDateFieldUseRelease(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-400 font-mono">Agendar</span>
                  </label>
                </div>
                
                {dateFieldUseRelease ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div className="space-y-0.5">
                      <p className="text-[9.5px] text-slate-400 font-mono">Data e Hora do Lançamento:</p>
                      <p className="text-[8.5px] text-slate-500 leading-normal font-sans">
                        O item só ficará visível e exposto na loja oficial para compra de alunos após esta data e hora exatas.
                      </p>
                    </div>
                    <input
                      type="datetime-local"
                      required
                      value={releaseDateString}
                      onChange={(e) => setReleaseDateString(e.target.value)}
                      className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 text-xs font-mono w-full"
                    />
                  </div>
                ) : (
                  <p className="text-[8.5px] text-slate-550 italic font-sans">
                    Lançamento imediato habilitado. Sem timer de lançamento.
                  </p>
                )}
              </div>

              {/* PROGRAMAÇÃO DE PROMOÇÃO (Promoção Programada) */}
              <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/30 space-y-3">
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-rose-450 uppercase text-[9.5px] font-mono tracking-wider flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-rose-500" /> Programar Promoção Ativa
                  </span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10.5px]">
                    <input
                      type="checkbox"
                      checked={formData.isPromo}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPromo: e.target.checked }))}
                      className="rounded border-slate-800 bg-slate-900 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-slate-400 font-mono">Ativar Promoção</span>
                  </label>
                </div>

                {formData.isPromo && (
                  <div className="space-y-3 pt-1 animate-fadeIn border-t border-slate-900/60">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-450 uppercase block">Preço Promocional (KC) *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          placeholder="Valor de desconto"
                          value={formData.promoPriceKC === null ? "" : formData.promoPriceKC}
                          onChange={(e) => {
                            const valStr = e.target.value;
                            setFormData(prev => ({ ...prev, promoPriceKC: valStr === "" ? null : Number(valStr) }));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-mono text-slate-450 uppercase">Programar Fim:</label>
                          <label className="inline-flex items-center gap-1 text-[9px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={dateFieldUsePromoEnd}
                              onChange={(e) => setDateFieldUsePromoEnd(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-900 text-rose-600 focus:ring-rose-500 scale-75"
                            />
                            <span className="text-slate-500">Com Prazo</span>
                          </label>
                        </div>

                        {dateFieldUsePromoEnd ? (
                          <input
                            type="datetime-local"
                            required
                            value={promoEndDateString}
                            onChange={(e) => setPromoEndDateString(e.target.value)}
                            className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-101 focus:outline-none focus:border-rose-505 text-xs font-mono w-full text-slate-100"
                          />
                        ) : (
                          <div className="text-[8.5px] text-slate-500 leading-normal font-sans pt-1">
                            Sem limite de expiração automática (permanente até desmarcar a flag).
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Active & Status checkboxes row */}
              <div className="flex items-center gap-5 p-2 px-3.5 rounded-xl bg-slate-950/60 border border-slate-850 justify-between">
                <span className="font-mono text-[9.5px] uppercase text-slate-500 block">Status Operacional</span>
                <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Disponibilizar no Banco de Dados (Ativo)</span>
                </label>
              </div>

              {/* Action buttons footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-400 font-bold rounded-xl transition-all cursor-pointer hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="p-2 px-5 bg-indigo-605 text-white hover:bg-indigo-600 font-bold rounded-xl shadow-lg shadow-indigo-950/50 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? "Salvar Alterações" : "Gravar no Banco"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
