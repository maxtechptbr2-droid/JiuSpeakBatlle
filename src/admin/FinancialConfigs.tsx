/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import { 
  Landmark, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  CreditCard, 
  CheckSquare, 
  Square,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  agency: string;
  accountNumber: string;
  accountType: string;
  holder: string;
  cpfCnpj: string;
  pixKey: string;
  pixKeyType: string;
  isPrimary: boolean;
  active: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  identifier: string;
  active: boolean;
  displayOrder: number;
  description: string;
}

interface ReleasedFeatures {
  modulesAll: boolean;
  conversationalSection: boolean;
  arenaPvp: boolean;
  bjjAcademies: boolean;
  marketplace: boolean;
  jiuspeakLibrary: boolean;
  inventoryBackpack: boolean;
  jiuspeakStore: boolean;
  premiumResources: boolean;
}

interface PlanMetadata {
  priceBRL: number;
  priceYearlyBRL: number;
  promotionalText: string;
  badge: string;
  cardColor: string;
  displayOrder: number;
  active: boolean;
  releasedFeatures: ReleasedFeatures;
  description?: string;
  features?: string[];
}

interface FinancialConfig {
  bankAccounts: BankAccount[];
  paymentMethods: PaymentMethod[];
  plansMetadata: {
    FREE: PlanMetadata;
    VIP: PlanMetadata;
    PRO: PlanMetadata;
    MASTER: PlanMetadata;
  };
}

export default function FinancialConfigs() {
  const [activeSubTab, setActiveSubTab] = useState<'banks' | 'payments' | 'plans'>('banks');
  const [config, setConfig] = useState<FinancialConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Bank accounts editing helper states
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState<Partial<BankAccount>>({});
  const [isInsertingBank, setIsInsertingBank] = useState<boolean>(false);

  // Payment method editing helper states
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethod>>({});

  // Plan editing helper states
  const [selectedPlanKey, setSelectedPlanKey] = useState<'FREE' | 'VIP' | 'PRO' | 'MASTER'>('FREE');
  const [planForm, setPlanForm] = useState<Partial<PlanMetadata>>({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const showToastMsg = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/financial-configs');
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('403 - Acesso Negado. Privilégios insuficientes.');
        }
        throw new Error('Não foi possível obter as configurações financeiras do servidor.');
      }
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        // Initialize active plan edit form
        const currentSelectedPlan = 'FREE';
        setPlanForm(data.config.plansMetadata[currentSelectedPlan]);
      } else {
        throw new Error(data.error || 'Retorno incorreto de API.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro de conexão com a API.');
      showToastMsg(err.message || 'Erro carregar configurações.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveConfigToServer = async (updatedConfig: FinancialConfig) => {
    setSaveLoading(true);
    try {
      const res = await authFetch('/api/admin/financial-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedConfig)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        showToastMsg(data.message || 'Configurações financeiras persistidas no banco com sucesso!', 'success');
      } else {
        throw new Error(data.error || 'Falha ao processar reconfiguração no servidor.');
      }
    } catch (err: any) {
      console.error(err);
      showToastMsg(err.message || 'Erro ao persistir configurações.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const updateSelectedPlanMeta = (key: 'FREE' | 'VIP' | 'PRO' | 'MASTER') => {
    setSelectedPlanKey(key);
    if (config) {
      setPlanForm(config.plansMetadata[key]);
    }
  };

  // ==========================================
  // BANK ACCOUNTS LOGIC
  // ==========================================
  const handleAddNewBankClick = () => {
    setIsInsertingBank(true);
    setEditingBankId(null);
    setBankForm({
      bankName: '',
      bankCode: '',
      agency: '',
      accountNumber: '',
      accountType: 'Corrente',
      holder: '',
      cpfCnpj: '',
      pixKey: '',
      pixKeyType: 'Instalar Chave PIX',
      isPrimary: false,
      active: true
    });
  };

  const handleEditBankClick = (bank: BankAccount) => {
    setEditingBankId(bank.id);
    setIsInsertingBank(false);
    setBankForm(bank);
  };

  const handleSaveBankSubmit = () => {
    if (!config) return;
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.agency || !bankForm.holder) {
      showToastMsg('Preencha os campos obrigatórios: Nome do Banco, Agência, Conta e Titular!', 'error');
      return;
    }

    let updatedBanks = [...config.bankAccounts];

    if (isInsertingBank) {
      const newBank: BankAccount = {
        id: 'bank_' + Date.now(),
        bankName: bankForm.bankName || '',
        bankCode: bankForm.bankCode || '',
        agency: bankForm.agency || '',
        accountNumber: bankForm.accountNumber || '',
        accountType: bankForm.accountType || 'Corrente',
        holder: bankForm.holder || '',
        cpfCnpj: bankForm.cpfCnpj || '',
        pixKey: bankForm.pixKey || '',
        pixKeyType: bankForm.pixKeyType || 'E-mail',
        isPrimary: !!bankForm.isPrimary,
        active: bankForm.active !== undefined ? bankForm.active : true
      };

      if (newBank.isPrimary) {
        updatedBanks = updatedBanks.map(b => ({ ...b, isPrimary: false }));
      }
      updatedBanks.push(newBank);
    } else {
      if (bankForm.isPrimary) {
        updatedBanks = updatedBanks.map(b => ({ ...b, isPrimary: false }));
      }
      updatedBanks = updatedBanks.map(b => b.id === editingBankId ? { ...b, ...bankForm } as BankAccount : b);
    }

    // Ensure at least one primary if check is left empty but list is not vacant
    if (updatedBanks.length > 0 && !updatedBanks.some(b => b.isPrimary)) {
      updatedBanks[0].isPrimary = true;
    }

    const updatedConfig = {
      ...config,
      bankAccounts: updatedBanks
    };

    setConfig(updatedConfig);
    saveConfigToServer(updatedConfig);
    setIsInsertingBank(false);
    setEditingBankId(null);
  };

  const handleDeleteBank = (id: string) => {
    if (!config) return;
    if (config.bankAccounts.length <= 1) {
      showToastMsg('Você precisa manter pelo menos 1 (um) banco de recebimentos cadastrado para auditorias!', 'error');
      return;
    }
    if (window.confirm('Tem certeza absoluta que deseja desvincular e excluir permanentemente este portal bancário?')) {
      let updatedBanks = config.bankAccounts.filter(b => b.id !== id);
      if (!updatedBanks.some(b => b.isPrimary) && updatedBanks.length > 0) {
        updatedBanks[0].isPrimary = true;
      }
      const updatedConfig = {
        ...config,
        bankAccounts: updatedBanks
      };
      setConfig(updatedConfig);
      saveConfigToServer(updatedConfig);
    }
  };

  // ==========================================
  // PAYMENT METHODS LOGIC
  // ==========================================
  const handleEditPaymentClick = (pay: PaymentMethod) => {
    setEditingPaymentId(pay.id);
    setPaymentForm(pay);
  };

  const handleSavePaymentSubmit = () => {
    if (!config) return;
    const updatedPayments = config.paymentMethods.map(p => {
      if (p.id === editingPaymentId) {
        return { ...p, ...paymentForm } as PaymentMethod;
      }
      return p;
    });

    const updatedConfig = {
      ...config,
      paymentMethods: updatedPayments
    };

    setConfig(updatedConfig);
    saveConfigToServer(updatedConfig);
    setEditingPaymentId(null);
  };

  const movePaymentOrder = (index: number, direction: 'UP' | 'DOWN') => {
    if (!config) return;
    const updatedPayments = [...config.paymentMethods];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= updatedPayments.length) return;

    // Swap items
    const temp = updatedPayments[index];
    updatedPayments[index] = updatedPayments[targetIdx];
    updatedPayments[targetIdx] = temp;

    // Re-adjust displayOrder properties
    const finalOrdered = updatedPayments.map((p, idx) => ({
      ...p,
      displayOrder: idx + 1
    }));

    const updatedConfig = {
      ...config,
      paymentMethods: finalOrdered
    };

    setConfig(updatedConfig);
    saveConfigToServer(updatedConfig);
  };

  // ==========================================
  // PLANS CONFIG LOGIC
  // ==========================================
  const handleSavePlanSubmit = () => {
    if (!config) return;
    
    // Save benefits string parsed to array
    const updatedMetadata = {
      ...config.plansMetadata,
      [selectedPlanKey]: {
        ...config.plansMetadata[selectedPlanKey],
        ...planForm
      }
    };

    const updatedConfig = {
      ...config,
      plansMetadata: updatedMetadata
    };

    setConfig(updatedConfig);
    saveConfigToServer(updatedConfig);
  };

  const handleFeatureCheckboxToggle = (featureKey: keyof ReleasedFeatures) => {
    const currentFeatures = planForm.releasedFeatures || {
      modulesAll: false,
      conversationalSection: false,
      arenaPvp: false,
      bjjAcademies: false,
      marketplace: false,
      jiuspeakLibrary: true,
      inventoryBackpack: true,
      jiuspeakStore: false,
      premiumResources: false
    };

    const updatedFeatures = {
      ...currentFeatures,
      [featureKey]: !currentFeatures[featureKey]
    };

    setPlanForm(prev => ({
      ...prev,
      releasedFeatures: updatedFeatures
    }));
  };

  const handleCustomFeatureArrayChange = (text: string) => {
    const featuresArray = text.split('\n').map(l => l.trim()).filter(l => l !== '');
    setPlanForm(prev => ({
      ...prev,
      features: featuresArray
    }));
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-805 rounded-2xl p-16 text-center animate-pulse shadow-xl" id="admin-financial-config-loading">
        <RotateCcw className="w-10 h-10 text-violet-400 mx-auto animate-spin mb-4" />
        <h3 className="font-display font-extrabold text-base text-slate-100 mb-1">Indexando parâmetros corporativos...</h3>
        <p className="text-xs text-slate-400">Verificando arquivos locais e validando permissões de administração do tatame.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-805 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-xl" id="admin-financial-config-error">
        <AlertCircle className="w-14 h-14 text-rose-500 mx-auto animate-bounce" />
        <h3 className="font-display font-black text-lg text-slate-100">Erro na Consulta Administradora</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        <button 
          onClick={fetchConfig}
          className="p-2.5 px-5 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl cursor-pointer transition-all border border-slate-750"
        >
          Tentar Reestabelecer Conexão
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="admin-financial-configs-view">
      
      {/* Mini Toast Notification Screen overlay */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 text-xs font-mono flex items-center gap-3 animate-scaleUp ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400 shadow-emerald-950/20' 
            : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500 text-rose-400 shadow-rose-950/20' 
              : 'bg-indigo-950/90 border-indigo-500 text-indigo-400 shadow-indigo-950/20'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 shrink-0 bg-emerald-500/10 p-0.5 rounded-full" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sub-Header Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-850 p-1.5 rounded-xl flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSubTab('banks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'banks'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-450 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            🏦 Recebimentos Bancários
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('payments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'payments'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-450 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            💳 Formas de Pagamento
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('plans')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'plans'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-450 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            🥋 Planos de Assinatura & Gates
          </button>
        </div>

        {saveLoading && (
          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-1 px-2.5 rounded font-mono uppercase animate-pulse">
            Sincronizando...
          </span>
        )}
      </div>

      {/* VIEW SECTION 1: BANK ACCOUNTS */}
      {activeSubTab === 'banks' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="font-display font-extrabold text-base text-slate-100 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-400" />
                  Dados Bancários Institucionais
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xl font-sans">
                  Gerencie as contas bancárias corporativas homologadas para recepções de assinaturas e liquidações gerais do JiuSpeak.
                </p>
              </div>

              {!isInsertingBank && !editingBankId && (
                <button
                  type="button"
                  onClick={handleAddNewBankClick}
                  className="p-2 py-2 px-4 rounded-lg bg-indigo-650 hover:bg-indigo-600 border border-indigo-550 hover:border-indigo-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Novo Banco
                </button>
              )}
            </div>

            {/* Insertion/Edition Form Overlay Card inside workspace */}
            {(isInsertingBank || editingBankId) && (
              <div className="bg-slate-950/40 border border-indigo-500/20 p-5 rounded-xl space-y-4 animate-scaleUp">
                <div className="font-display font-extrabold text-slate-200 text-xs tracking-wider uppercase border-b border-slate-850 pb-2">
                  {isInsertingBank ? '➕ Cadastrar Banco de Recebimentos' : '✏️ Editar Registro de Banco'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Nome do Banco *</label>
                    <input 
                      type="text" 
                      value={bankForm.bankName || ''} 
                      onChange={e => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                      placeholder="Ex: Itaú Unibanco"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Código do Banco</label>
                    <input 
                      type="text" 
                      value={bankForm.bankCode || ''} 
                      onChange={e => setBankForm(prev => ({ ...prev, bankCode: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                      placeholder="Ex: 341"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Agência *</label>
                    <input 
                      type="text" 
                      value={bankForm.agency || ''} 
                      onChange={e => setBankForm(prev => ({ ...prev, agency: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                      placeholder="Ex: 0201"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Conta Especial *</label>
                    <input 
                      type="text" 
                      value={bankForm.accountNumber || ''} 
                      onChange={e => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                      placeholder="Ex: 98765-4"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Tipo de Conta</label>
                    <select 
                      value={bankForm.accountType || 'Corrente'} 
                      onChange={e => setBankForm(prev => ({ ...prev, accountType: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="Corrente">Corrente</option>
                      <option value="Poupança">Poupança</option>
                      <option value="Pagamento">Pagamento</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Titular *</label>
                    <input 
                      type="text" 
                      value={bankForm.holder || ''} 
                      onChange={e => setBankForm(prev => ({ ...prev, holder: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                      placeholder="Ex: JiuSpeak Tecnologia Ltda."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">CPF/CNPJ Titular</label>
                    <input 
                      type="text" 
                      value={bankForm.cpfCnpj || ''} 
                      onChange={e => setBankForm(prev => ({ ...prev, cpfCnpj: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none"
                      placeholder="Ex: 12.345.678/0001-90"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Chave PIX Recebimentos</label>
                    <input 
                      type="text" 
                      value={bankForm.pixKey || ''} 
                      onChange={e => setBankForm(prev => ({ ...prev, pixKey: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none"
                      placeholder=" financeiro@jiuspeak.com.br"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Tipo Chave PIX</label>
                    <select 
                      value={bankForm.pixKeyType || 'E-mail'} 
                      onChange={e => setBankForm(prev => ({ ...prev, pixKeyType: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="E-mail">E-mail</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="CPF">CPF</option>
                      <option value="Celular">Celular</option>
                      <option value="Chave Aleatória">Chave Aleatória</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-6 items-center pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-medium select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={!!bankForm.isPrimary} 
                      onChange={e => setBankForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                      className="rounded accent-violet-600 scale-110"
                    />
                    <span>Ativar como Banco Principal de Recebimentos</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 font-medium select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={bankForm.active !== false} 
                      onChange={e => setBankForm(prev => ({ ...prev, active: e.target.checked }))}
                      className="rounded accent-violet-600 scale-110"
                    />
                    <span>Registro Disponível e Ativo</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-850 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInsertingBank(false);
                      setEditingBankId(null);
                    }}
                    className="p-2 px-4 rounded-lg bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-805 text-xs font-bold border border-slate-750 cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBankSubmit}
                    className="p-2 px-4 rounded-lg bg-violet-650 hover:bg-violet-600 text-white hover:border-violet-500 text-xs font-bold border border-violet-700 cursor-pointer transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar Dados Bancários
                  </button>
                </div>
              </div>
            )}

            {/* List Table of bank records */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Banco</th>
                    <th className="py-3 px-2">Código</th>
                    <th className="py-3 px-2">Agência / Conta</th>
                    <th className="py-3 px-2">Titular / CNPJ</th>
                    <th className="py-3 px-2">Chave PIX</th>
                    <th className="py-3 px-2 text-center">Status / Flag</th>
                    <th className="py-3 px-2 text-right">Controles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {config?.bankAccounts.map((bank) => (
                    <tr 
                      key={bank.id} 
                      className={`hover:bg-slate-950/20 transition-all ${
                        bank.isPrimary 
                          ? 'bg-indigo-950/10' 
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-2 font-bold text-slate-100 flex items-center gap-2">
                        <span>{bank.bankName}</span>
                        {bank.isPrimary && (
                          <span className="p-0.5 px-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-mono tracking-wider font-bold">PRINCIPAL</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 font-mono text-slate-350">{bank.bankCode || '—'}</td>
                      <td className="py-3.5 px-2 text-slate-200 font-mono">
                        Ag. {bank.agency} / C. {bank.accountNumber}
                        <div className="text-[10px] text-slate-500 font-sans">{bank.accountType}</div>
                      </td>
                      <td className="py-3.5 px-2 text-slate-200">
                        <div className="truncate max-w-[150px] font-medium" title={bank.holder}>{bank.holder}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{bank.cpfCnpj || '—'}</div>
                      </td>
                      <td className="py-3.5 px-2 text-slate-300 font-mono">
                        <div className="truncate max-w-[150px]" title={bank.pixKey}>{bank.pixKey || '—'}</div>
                        <div className="text-[9px] text-indigo-400 uppercase tracking-wider font-bold">{bank.pixKeyType || '—'}</div>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        {bank.active ? (
                          <span className="p-0.5 px-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">ATIVO</span>
                        ) : (
                          <span className="p-0.5 px-2 rounded-full bg-slate-800 border border-slate-700 text-slate-500 text-[9px] font-bold">DESATIVADO</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditBankClick(bank)}
                            className="p-1 px-2.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                            title="Editar Dados"
                          >
                            <Edit2 className="w-3 h-3 text-indigo-400" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBank(bank.id)}
                            className="p-1 px-2 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-450 border border-slate-700 hover:border-rose-900 text-[10px] font-bold cursor-pointer transition-all"
                            title="Excluir Registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* VIEW SECTION 2: PAYMENT METHODS */}
      {activeSubTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="font-display font-extrabold text-base text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                Formas de Pagamento Comerciais
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Edite os portais e formas de cobrança exibidos na fatura de checkout e no upgrade BJJ. Ordene sua prioridade de apresentação.
              </p>
            </div>

            {/* Payment method editing active form overlay inside tabular zone */}
            {editingPaymentId && (
              <div className="bg-slate-950/40 border border-indigo-500/20 p-5 rounded-xl space-y-4 animate-scaleUp">
                <div className="font-display font-extrabold text-slate-200 text-xs tracking-wider uppercase border-b border-slate-850 pb-2 flex items-center justify-between">
                  <span>✏️ Configurar Meio de Pagamento</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold font-mono tracking-widest">{paymentForm.identifier}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Nome de Exibição / Público *</label>
                    <input 
                      type="text" 
                      value={paymentForm.name || ''} 
                      onChange={e => setPaymentForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                      placeholder="Ex: Pix Instantâneo"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Ordem de Apresentação *</label>
                    <input 
                      type="number" 
                      value={paymentForm.displayOrder !== undefined ? paymentForm.displayOrder : 1} 
                      onChange={e => setPaymentForm(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Descrição Informativa da Fatura</label>
                    <textarea 
                      value={paymentForm.description || ''} 
                      onChange={e => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none resize-none" 
                      placeholder="Indique as vantagens ou prazos de compensação..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-medium select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={paymentForm.active !== false} 
                      onChange={e => setPaymentForm(prev => ({ ...prev, active: e.target.checked }))}
                      className="rounded accent-violet-600 scale-110"
                    />
                    <span>Ativar e aceitar pagamentos por esse método</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-850 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPaymentId(null);
                    }}
                    className="p-2 px-4 rounded-lg bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-805 text-xs font-bold border border-slate-750 cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePaymentSubmit}
                    className="p-2 px-4 rounded-lg bg-violet-650 hover:bg-violet-600 text-white hover:border-violet-500 text-xs font-bold border border-violet-700 cursor-pointer transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar Método
                  </button>
                </div>
              </div>
            )}

            {/* List Table of payment methods */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2 text-center w-12">Ordem</th>
                    <th className="py-3 px-2">Forma de Pagamento</th>
                    <th className="py-3 px-2">Identificador Técnico</th>
                    <th className="py-3 px-2 w-[40%]">Descrição da Amostragem</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2 text-right">Controles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {config?.paymentMethods.map((pay, pIdx) => (
                    <tr key={pay.id} className="hover:bg-slate-950/20 transition-all">
                      <td className="py-4 px-2 text-center font-mono font-black text-indigo-400 text-sm">
                        {pay.displayOrder}
                      </td>
                      <td className="py-4 px-2 font-bold text-slate-100">{pay.name}</td>
                      <td className="py-4 px-2 text-slate-400 font-mono uppercase tracking-wide text-[10px]">
                        {pay.identifier}
                      </td>
                      <td className="py-4 px-2 text-slate-300 leading-relaxed max-w-sm">
                        {pay.description || '—'}
                      </td>
                      <td className="py-4 px-2 text-center">
                        {pay.active ? (
                          <span className="p-0.5 px-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">ATIVO</span>
                        ) : (
                          <span className="p-0.5 px-2 rounded-full bg-slate-800 border border-slate-700 text-slate-500 text-[9px] font-bold">SUSPENSO</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Ordering moves widgets */}
                          <button
                            type="button"
                            onClick={() => movePaymentOrder(pIdx, 'UP')}
                            disabled={pIdx === 0}
                            className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Reordenar para Cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePaymentOrder(pIdx, 'DOWN')}
                            disabled={pIdx === (config.paymentMethods.length - 1)}
                            className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Reordenar para Baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditPaymentClick(pay)}
                            className="p-1.5 px-2 rounded bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white border border-slate-700 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ml-1"
                          >
                            <Edit2 className="w-3 h-3 text-indigo-400" />
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* VIEW SECTION 3: SUBSCRIPTION PLANS & CHECKBOX GATES */}
      {activeSubTab === 'plans' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Left Plan Tab Switchers List */}
          <div className="space-y-2 bg-slate-950/20 p-4 border border-slate-800 rounded-2xl self-start">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block ml-1 mb-2">Planos de Assinatura</span>
            
            {(['FREE', 'VIP', 'PRO', 'MASTER'] as const).map((key) => {
              const pData = config?.plansMetadata[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSelectedPlanMeta(key)}
                  className={`w-full text-left p-3.5 rounded-xl font-bold flex flex-col transition-all cursor-pointer border ${
                    selectedPlanKey === key
                      ? 'bg-gradient-to-r from-violet-950/70 to-indigo-900/60 text-white border-violet-500 shadow-lg'
                      : 'bg-slate-900/40 text-slate-400 border-slate-850 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-black font-display tracking-widest">{key}</span>
                    {pData?.badge && (
                      <span className="text-[8px] bg-violet-500 text-white px-1.5 py-0.5 rounded-md font-mono tracking-wider text-[8px] uppercase">{pData.badge}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-450 mt-1 font-mono">
                    Mensal: R$ {pData?.priceBRL.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right main configurations container for selected plan */}
          <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 flex-wrap gap-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Editar Plano: <span className="text-indigo-400 font-mono">{selectedPlanKey}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Defina os preços corporativos, benefícios e bloqueios imediatos dos módulos do sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSavePlanSubmit}
                className="p-2 py-2 px-5 rounded-lg bg-violet-650 hover:bg-violet-600 text-white font-black text-xs cursor-pointer border border-violet-700 hover:border-violet-500 transition-all flex items-center gap-1.5 shadow-lg"
              >
                <Save className="w-4 h-4" />
                Gravar Configuração {selectedPlanKey}
              </button>
            </div>

            {/* Plan inputs panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 font-mono uppercase block">Preço Mensal (R$) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={planForm.priceBRL !== undefined ? planForm.priceBRL : 0} 
                  onChange={e => setPlanForm(prev => ({ ...prev, priceBRL: Number(e.target.value) }))}
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 font-mono uppercase block">Preço Anual (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={planForm.priceYearlyBRL !== undefined ? planForm.priceYearlyBRL : 0} 
                  onChange={e => setPlanForm(prev => ({ ...prev, priceYearlyBRL: Number(e.target.value) }))}
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 font-mono uppercase block">Badge do Plano (Etiqueta)</label>
                <input 
                  type="text" 
                  value={planForm.badge || ''} 
                  onChange={e => setPlanForm(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                  placeholder="Ex: Mais Popular, Melhor Custo, Premium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 font-mono uppercase block">Cor Temática do Card</label>
                <select 
                  value={planForm.cardColor || 'slate'} 
                  onChange={e => setPlanForm(prev => ({ ...prev, cardColor: e.target.value }))}
                  className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none cursor-pointer"
                >
                  <option value="slate">Slate / Cinza Neutro</option>
                  <option value="blue">Blue / Azul Profissional</option>
                  <option value="indigo">Indigo / Roxo Elétrico</option>
                  <option value="purple">Purple / Mestre Imperial</option>
                  <option value="rose">Rose / Vermelho Neon</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 font-mono uppercase block">Ordem de Exibição</label>
                <input 
                  type="number" 
                  value={planForm.displayOrder !== undefined ? planForm.displayOrder : 1} 
                  onChange={e => setPlanForm(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                  className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 font-mono uppercase block">Texto Auxiliar Promocional</label>
                <input 
                  type="text" 
                  value={planForm.promotionalText || ''} 
                  onChange={e => setPlanForm(prev => ({ ...prev, promotionalText: e.target.value }))}
                  className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none" 
                  placeholder="Ex: economize 20% no plano recorrente!"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] text-slate-450 font-mono uppercase block">Descrição de Apresentação *</label>
                <textarea 
                  value={planForm.description || ''} 
                  onChange={e => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none resize-none" 
                  placeholder="Descrição amigável do plano apresentada aos alunos."
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] text-slate-450 font-mono uppercase block">Benefícios Exibidos em Lista (Um por linha)</label>
                <textarea 
                  value={planForm.features ? planForm.features.join('\n') : ''} 
                  onChange={e => handleCustomFeatureArrayChange(e.target.value)}
                  rows={4}
                  className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-indigo-500 p-2.5 rounded-lg text-slate-100 outline-none resize-none font-sans leading-relaxed" 
                  placeholder="Acesso a conteúdos de elite&#10;Insignia lendária de Tatame&#10;Selecione até 10 recursos..."
                />
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-xs text-slate-300 font-medium select-none cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={planForm.active !== false} 
                  onChange={e => setPlanForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded accent-violet-600 scale-110"
                />
                <span>Habilitar contratação e manter este plano como Ativo</span>
              </label>
            </div>

            {/* AUTHORIZATION FEATURES CHECKBOX GATES DESIGN SECTION */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold font-display text-slate-200 uppercase tracking-widest flex items-center gap-1 text-fuchsia-400">
                  <ShieldCheck className="w-4 h-4" />
                  Autorização de Módulos (Gates de Recursos)
                </h4>
                <p className="text-[10px] text-slate-450 max-w-2xl font-sans mt-0.5">
                  Selecione as abas, arenas práticas e módulos do JiuSpeak que serão completamente liberados aos alunos portadores deste plano.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {[
                  { key: 'modulesAll', label: 'Todos os módulos do curso' },
                  { key: 'conversationalSection', label: 'Seção de Conversação' },
                  { key: 'arenaPvp', label: 'Arena PVP' },
                  { key: 'bjjAcademies', label: 'Academias BJJ' },
                  { key: 'marketplace', label: 'Marketplace' },
                  { key: 'jiuspeakLibrary', label: 'Biblioteca JiuSpeak' },
                  { key: 'inventoryBackpack', label: 'Mochila & Inventário' },
                  { key: 'jiuspeakStore', label: 'Loja JiuSpeak' },
                  { key: 'premiumResources', label: 'Recursos Premium' }
                ].map((gate) => {
                  const isChecked = planForm.releasedFeatures ? !!planForm.releasedFeatures[gate.key as keyof ReleasedFeatures] : false;
                  return (
                    <button
                      key={gate.key}
                      type="button"
                      onClick={() => handleFeatureCheckboxToggle(gate.key as keyof ReleasedFeatures)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-violet-950/20 border-violet-500/60 text-slate-200' 
                          : 'bg-slate-900/60 border-slate-850 hover:border-slate-800 text-slate-500 hover:text-slate-405'
                      }`}
                    >
                      <div className="shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-violet-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-650 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs font-bold truncate select-none">{gate.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
