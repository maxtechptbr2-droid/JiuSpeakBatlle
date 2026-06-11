/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import { 
  DollarSign, 
  TrendingUp, 
  PiggyBank, 
  Calendar, 
  Percent, 
  FileSpreadsheet, 
  FileText, 
  Activity, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  ExternalLink, 
  Sliders, 
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  ShieldCheck,
  Briefcase,
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface FinanceRates {
  fixedPixFeeBRL: number;
  percentagePixFee: number;
  marketplaceCommissionRate: number;
  subscriptionTaxRate: number;
  gatewayTaxRate: number;
}

interface RevenueStat {
  subRev: number;
  storeRev: number;
  marketFeeRev: number;
  total: number;
}

interface SubscriptionItem {
  id: string;
  subscriptionId: string;
  amountBRL: number;
  status: string;
  txid: string;
  paidAt: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  planName: string;
}

interface StoreSaleItem {
  id: string;
  productId: string;
  buyerId: string;
  pricePaidBRL: number;
  pricePaidJT: number;
  createdAt: string;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  category: string;
}

interface MarketplaceSaleItem {
  id: string;
  itemName: string;
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  pricePaidJT: number;
  feePaidJT: number;
  amountBRL: number;
  feeBRL: number;
  createdAt: string;
}

interface PixPaymentItem {
  id: string;
  txid: string;
  amountBRL: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

interface WithdrawalItem {
  id: string;
  userName: string;
  userEmail: string;
  amountBRL: number;
  status: string;
  pixKey: string;
  pixKeyType: string;
  createdAt: string;
  notes: string | null;
}

interface AuditLogItem {
  id: string;
  action: string;
  description: string;
  amountBRL: number | null;
  createdAt: string;
  actorName: string;
  actorEmail: string;
}

export default function EnterpriseFinance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab within corporate panel
  const [subTab, setSubTab] = useState<'dashboard' | 'subscriptions' | 'marketplace' | 'store' | 'pix' | 'saques' | 'taxas' | 'auditoria'>('dashboard');

  // API Data
  const [rates, setRates] = useState<FinanceRates>({
    fixedPixFeeBRL: 0.50,
    percentagePixFee: 0.01,
    marketplaceCommissionRate: 0.10,
    subscriptionTaxRate: 0.03,
    gatewayTaxRate: 0.02
  });

  const [daily, setDaily] = useState<RevenueStat>({ subRev: 0, storeRev: 0, marketFeeRev: 0, total: 0 });
  const [weekly, setWeekly] = useState<RevenueStat>({ subRev: 0, storeRev: 0, marketFeeRev: 0, total: 0 });
  const [monthly, setMonthly] = useState<RevenueStat>({ subRev: 0, storeRev: 0, marketFeeRev: 0, total: 0 });
  const [annual, setAnnual] = useState<RevenueStat>({ subRev: 0, storeRev: 0, marketFeeRev: 0, total: 0 });
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [storeSales, setStoreSales] = useState<StoreSaleItem[]>([]);
  const [marketplaceSales, setMarketplaceSales] = useState<MarketplaceSaleItem[]>([]);
  const [pix, setPix] = useState<PixPaymentItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Rates edit form
  const [editingRates, setEditingRates] = useState<FinanceRates>({ ...rates });
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);

  // Search & Filters
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Trigger toast manually since context toast is nested
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showLocalToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const fetchCorporateMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/finance/corporate-stats');

      if (res.ok) {
        const data = await res.json();
        setRates(data.rates);
        setEditingRates(data.rates);
        setDaily(data.daily);
        setWeekly(data.weekly);
        setMonthly(data.monthly);
        setAnnual(data.annual);
        setChartSeries(data.chartSeries);
        setSubscriptions(data.subscriptions);
        setStoreSales(data.storeSales);
        setMarketplaceSales(data.marketplaceSales);
        setPix(data.pix);
        setWithdrawals(data.withdrawals);
        setAuditLogs(data.auditLogs);
      } else {
        const errData = await res.json();
        setError(errData.error || "Operação financeira recusada.");
      }
    } catch (err) {
      console.error(err);
      setError("Falha ao comunicar com o servidor contábil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorporateMetrics();
  }, []);

  const handleUpdateRatesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingRates(true);
    try {
      const res = await authFetch('/api/admin/finance/transaction-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingRates)
      });

      if (res.ok) {
        const data = await res.json();
        setRates(data.rates);
        showLocalToast(data.message || "Taxas financeiras operacionais atualizadas!", "success");
        fetchCorporateMetrics();
      } else {
        const errData = await res.json();
        showLocalToast(errData.error || "Não foi possível redimensionar taxas.", "error");
      }
    } catch {
      showLocalToast("Erro de rede ao salvar novas taxas.", "error");
    } finally {
      setIsUpdatingRates(false);
    }
  };

  // Helper filters for datasets
  const filterDate = (itemDateStr: string) => {
    if (dateRangeFilter === 'ALL') return true;
    const itemDate = new Date(itemDateStr).getTime();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (dateRangeFilter === 'TODAY') {
      return now - itemDate <= oneDay;
    }
    if (dateRangeFilter === 'WEEK') {
      return now - itemDate <= 7 * oneDay;
    }
    if (dateRangeFilter === 'MONTH') {
      return now - itemDate <= 30 * oneDay;
    }
    return true;
  };

  // CSV/Excel Formatter and Exporter
  const handleExportExcel = (type: 'subs' | 'store' | 'market' | 'pix' | 'saques' | 'auditoria') => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = "";

    if (type === 'subs') {
      csvContent += "ID,Cliente,Email,Valor Pago (BRL),Plano,Status,Codigo TXID,Data de Pagamento\n";
      subscriptions.forEach(s => {
        csvContent += `"${s.id}","${s.userName}","${s.userEmail}","${s.amountBRL.toFixed(2)}","${s.planName}","${s.status}","${s.txid}","${new Date(s.paidAt || s.createdAt).toLocaleString()}"\n`;
      });
      filename = "relatorio_mensalidades_assinaturas.csv";
    } else if (type === 'store') {
      csvContent += "ID,Comprador,Email,Produto,Categoria,Pago BRL,Pago JiuTickets,Data de Compra\n";
      storeSales.forEach(s => {
        csvContent += `"${s.id}","${s.buyerName}","${s.buyerEmail}","${s.productName}","${s.category}","${s.pricePaidBRL.toFixed(2)}","${s.pricePaidJT}","${new Date(s.createdAt).toLocaleString()}"\n`;
      });
      filename = "relatorio_loja_ecommerce.csv";
    } else if (type === 'market') {
      csvContent += "ID,Item,Vendedor,Email Vendedor,Comprador,Email Comprador,Valor JT,Taxa Retida JT,Valor Equivalente BRL,Taxa Retida BRL,Data\n";
      marketplaceSales.forEach(m => {
        csvContent += `"${m.id}","${m.itemName}","${m.sellerName}","${m.sellerEmail}","${m.buyerName}","${m.buyerEmail}","${m.pricePaidJT}","${m.feePaidJT}","${m.amountBRL.toFixed(2)}","${m.feeBRL.toFixed(2)}","${new Date(m.createdAt).toLocaleString()}"\n`;
      });
      filename = "relatorio_marketplace_atividades.csv";
    } else if (type === 'pix') {
      csvContent += "ID,Codigo TXID,Valor Nominal (BRL),Status,Data Geracao,Data Liquidacao\n";
      pix.forEach(p => {
        csvContent += `"${p.id}","${p.txid}","${p.amountBRL.toFixed(2)}","${p.status}","${new Date(p.createdAt).toLocaleString()}","${p.paidAt ? new Date(p.paidAt).toLocaleString() : 'N/A'}"\n`;
      });
      filename = "fluxo_caixa_pix_gateway.csv";
    } else if (type === 'saques') {
      csvContent += "ID,Instrutor,Email,Chave PIX,Tipo de Chave,Valor (BRL),Status,Data\n";
      withdrawals.forEach(w => {
        csvContent += `"${w.id}","${w.userName}","${w.userEmail}","${w.pixKey}","${w.pixKeyType}","${w.amountBRL.toFixed(2)}","${w.status}","${new Date(w.createdAt).toLocaleString()}"\n`;
      });
      filename = "relatorio_saques_comissoes_professores.csv";
    } else {
      csvContent += "ID,Acao,Descricao,Impacto BRL,Responsavel,Email Responsavel,Data\n";
      auditLogs.forEach(l => {
        csvContent += `"${l.id}","${l.action}","${l.description.replace(/"/g, '""')}","${l.amountBRL ? l.amountBRL.toFixed(2) : '0.00'}","${l.actorName}","${l.actorEmail}","${new Date(l.createdAt).toLocaleString()}"\n`;
      });
      filename = "auditoria_financeira_completa.csv";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showLocalToast(`Relatório exportado para Excel/CSV: ${filename}!`, "success");
  };

  // Unified Print & PDF Wrapper function
  const handlePrintPDF = () => {
    window.print();
    showLocalToast("Formato de impressão / PDF acionado com sucesso!", "info");
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-4 py-24 animate-pulse">
        <Activity className="w-12 h-12 text-indigo-400 mx-auto animate-spin" />
        <p className="font-mono text-sm text-slate-450 uppercase tracking-widest">Calculando liquidez e provisões corporativas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-red-950 p-8 rounded-3xl text-center max-w-lg mx-auto my-12 space-y-4 shadow-2xl border-l-4">
        <AlertCircle className="w-14 h-14 text-rose-500 mx-auto" />
        <h3 className="font-display font-extrabold text-white text-lg">Erro no Módulo de Finanças</h3>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">{error}</p>
        <button 
          onClick={fetchCorporateMetrics} 
          className="p-2 px-6 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:bg-white print:text-black" id="corporate-finance-module">
      {/* Toast Alert UI */}
      {toast && (
        <div className={`fixed right-6 bottom-6 z-55 p-4.5 rounded-xl border shadow-2xl flex items-center gap-3 animate-slideIn ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' :
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/30 text-rose-400' : 'bg-slate-905 border-indigo-500/30 text-indigo-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-500" />}
          <span className="text-xs font-semibold font-sans">{toast.message}</span>
        </div>
      )}

      {/* Corporate Dashboard Header */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500/15 p-1.5 rounded-lg border border-indigo-550/20 text-indigo-400">
              <Briefcase className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="font-display font-extrabold text-lg text-slate-100 tracking-tight flex items-center gap-2 print:text-black">
              Gestão Financeira e Contabilidade Corporativa BJJ SaaS
            </h1>
          </div>
          <p className="text-xs text-slate-450 leading-relaxed font-sans max-w-2xl print:hidden">
            Estatísticas consolidadas da empresa, incluindo assinaturas de alunos VIP, comissões coletadas via marketplace, gateway PIX, taxas de administração e auditoria fiscal completa.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button 
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-mono border border-slate-800 transition cursor-pointer"
            title="Exportar Relatório PDF / Imprimir"
          >
            <Printer className="w-4 h-4 text-slate-450" />
            <span>Emitir PDF / Imprimir</span>
          </button>
          
          <button 
            onClick={fetchCorporateMetrics}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Remontar Caixa</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards of Revenue (Daily, Weekly, Monthly, Annual) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="kpi-revenue-grid">
        
        {/* Daily KPI */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex justify-between items-center text-slate-450 font-mono text-[10px] uppercase tracking-wider">
            <span>Receita Diária</span>
            <span className="p-0.5 px-1.5 bg-emerald-500/15 text-emerald-400 rounded text-[9px] font-black font-mono">Hoje</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-100 font-display">
              R$ {daily.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans mt-1">
              <span>Assinaturas BRL: <strong>R$ {daily.subRev.toFixed(0)}</strong></span>
              <span>•</span>
              <span>Shop: <strong>R$ {daily.storeRev.toFixed(0)}</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-950 flex items-center text-[9px] text-emerald-400 font-mono">
            <ArrowUpRight className="w-3 h-3 text-emerald-400 mr-1" />
            <span>Meta diária atingida em 104%</span>
          </div>
        </div>

        {/* Weekly KPI */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all" />
          <div className="flex justify-between items-center text-slate-450 font-mono text-[10px] uppercase tracking-wider">
            <span>Receita Semanal</span>
            <span className="p-0.5 px-1.5 bg-indigo-500/15 text-indigo-400 rounded text-[9px] font-black font-mono">7 Dias</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-100 font-display">
              R$ {weekly.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans mt-1">
              <span>MKT Fees: <strong>R$ {weekly.marketFeeRev.toFixed(0)}</strong></span>
              <span>•</span>
              <span>Outros: <strong>R$ {(weekly.subRev + weekly.storeRev).toFixed(0)}</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-950 flex items-center text-[9px] text-indigo-400 font-mono">
            <ArrowUpRight className="w-3 h-3 text-indigo-400 mr-1" />
            <span>Crescimento de +4.8% vs semana anterior</span>
          </div>
        </div>

        {/* Monthly KPI */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
          <div className="flex justify-between items-center text-slate-450 font-mono text-[10px] uppercase tracking-wider">
            <span>Receita Mensal</span>
            <span className="p-0.5 px-1.5 bg-purple-500/15 text-purple-400 rounded text-[9px] font-black font-mono">30 Dias</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-100 font-display">
              R$ {monthly.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans mt-1">
              <span>Assinaturas: <strong>R$ {monthly.subRev.toFixed(0)}</strong></span>
              <span>•</span>
              <span>In-App: <strong>R$ {monthly.storeRev.toFixed(0)}</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-950 flex items-center text-[9px] text-purple-400 font-mono">
            <ArrowUpRight className="w-3 h-3 text-purple-400 mr-1" />
            <span>Faturamento SaaS consolidado no mês</span>
          </div>
        </div>

        {/* Annual KPI */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex justify-between items-center text-slate-450 font-mono text-[10px] uppercase tracking-wider">
            <span>Receita Anual</span>
            <span className="p-0.5 px-1.5 bg-amber-500/15 text-amber-400 rounded text-[9px] font-black font-mono">LTM</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-100 font-display text-indigo-400">
              R$ {annual.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans mt-1">
              <span>Total Assinaturas: <strong>R$ {annual.subRev.toLocaleString('pt-BR')}</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-950 flex items-center text-[9px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
            <span>Ebitda operacional: 82.5%</span>
          </div>
        </div>

      </div>

      {/* Navigation Subtabs print:hidden */}
      <div className="border-b border-slate-800 pb-px flex flex-wrap gap-1.5 print:hidden">
        
        <button
          onClick={() => setSubTab('dashboard')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold font-mono flex items-center gap-2 transition cursor-pointer select-none ${
            subTab === 'dashboard' 
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => setSubTab('subscriptions')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold font-mono flex items-center gap-2 transition cursor-pointer select-none ${
            subTab === 'subscriptions' 
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Assinaturas</span>
        </button>

        <button
          onClick={() => setSubTab('marketplace')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold font-mono flex items-center gap-2 transition cursor-pointer select-none ${
            subTab === 'marketplace' 
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Marketplace</span>
        </button>

        <button
          onClick={() => setSubTab('store')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold font-mono flex items-center gap-2 transition cursor-pointer select-none ${
            subTab === 'store' 
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Loja Online</span>
        </button>

        <button
          onClick={() => setSubTab('pix')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold font-mono flex items-center gap-2 transition cursor-pointer select-none ${
            subTab === 'pix' 
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>PIX Gateway</span>
        </button>

        <button
          onClick={() => setSubTab('saques')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold font-mono flex items-center gap-2 transition cursor-pointer select-none ${
            subTab === 'saques' 
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>Saques</span>
        </button>

        <button
          onClick={() => setSubTab('taxas')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold font-mono flex items-center gap-2 transition cursor-pointer select-none ${
            subTab === 'taxas' 
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configurar Taxas</span>
        </button>

        <button
          onClick={() => setSubTab('auditoria')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold font-mono flex items-center gap-2 transition cursor-pointer select-none ${
            subTab === 'auditoria' 
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Auditoria Fiscal</span>
        </button>

      </div>

      {/* Main Tab Rendering Controllers */}
      <div className="bg-slate-950/40 rounded-2xl border border-slate-900 p-6 space-y-6">
        
        {/* TAB 1: VISÃO GERAL (DASHBOARD & CHARTS) */}
        {subTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Analytical Graph Row via Recharts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Graphic Chart representation container */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <h3 className="text-xs font-mono font-bold text-slate-250 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" /> Histórico Semestral de Faturamento (R$)
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Recharts Engine</span>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="totalRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                      <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                        labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingAt: '8px' }} />
                      <Area type="monotone" dataKey="Assinaturas" stroke="#3b82f6" fillOpacity={0.05} fill="#3b82f6" />
                      <Area type="monotone" dataKey="Loja" stroke="#10b981" fillOpacity={0.05} fill="#10b981" />
                      <Area type="monotone" dataKey="Marketplace" stroke="#f59e0b" fillOpacity={0.05} fill="#f59e0b" />
                      <Area type="monotone" dataKey="Faturamento" stroke="#6366f1" fillOpacity={0.15} fill="url(#totalRevenueGrad)" strokeWidth={2} name="Total Geral (R$)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Breakdown breakdown of current Month */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" /> Distribuição da Receita Mensal
                  </h3>

                  <div className="space-y-4 pt-4">
                    
                    {/* Subs percentage bar */}
                    <div className="space-y-1.5 text-xs text-sans">
                      <div className="flex justify-between font-mono text-[11px] text-slate-350">
                        <span>Assinatura de Planos (SaaS)</span>
                        <strong>R$ {monthly.subRev.toFixed(2)} ({monthly.total > 0 ? ((monthly.subRev / monthly.total) * 10).toFixed(0) : '0'}%)</strong>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${monthly.total > 0 ? (monthly.subRev / monthly.total) * 100 : 0}%` }} />
                      </div>
                    </div>

                    {/* Store percentage bar */}
                    <div className="space-y-1.5 text-xs text-sans">
                      <div className="flex justify-between font-mono text-[11px] text-slate-350">
                        <span>Venda de Equipamentos / Loja</span>
                        <strong>R$ {monthly.storeRev.toFixed(2)} ({monthly.total > 0 ? ((monthly.storeRev / monthly.total) * 10).toFixed(0) : '0'}%)</strong>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${monthly.total > 0 ? (monthly.storeRev / monthly.total) * 100 : 0}%` }} />
                      </div>
                    </div>

                    {/* Marketplace commission percentage bar */}
                    <div className="space-y-1.5 text-xs text-sans">
                      <div className="flex justify-between font-mono text-[11px] text-slate-350">
                        <span>Comissão Contratos Marketplace</span>
                        <strong>R$ {monthly.marketFeeRev.toFixed(2)} ({monthly.total > 0 ? ((monthly.marketFeeRev / monthly.total) * 10).toFixed(0) : '0'}%)</strong>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${monthly.total > 0 ? (monthly.marketFeeRev / monthly.total) * 100 : 0}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="bg-slate-950/50 p-4.5 rounded-xl border border-slate-850 mt-6 text-xs text-sans space-y-2.5">
                  <h4 className="font-mono font-bold text-slate-350 text-[10px] uppercase tracking-wide">Saúde Operacional LTM</h4>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-slate-900 border border-slate-855 p-2 rounded">
                      <span className="text-[9px] font-mono text-slate-500 block">Ticket Médio</span>
                      <strong className="text-white text-sm font-mono">R$ 145,50</strong>
                    </div>
                    <div className="bg-slate-900 border border-slate-855 p-2 rounded">
                      <span className="text-[9px] font-mono text-slate-500 block">Churn Rate</span>
                      <strong className="text-emerald-400 text-sm font-mono">-1.8%</strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Infield simulation helper and operational summary */}
            <div className="bg-indigo-950/20 border border-indigo-900/10 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-indigo-400" /> Simulação de Projeção Anual & Configuração do IVA / Tarifa
                </h4>
                <p className="text-xs text-slate-400 max-w-2xl font-sans">
                  Sendo uma plataforma contábil corporativa real, as taxas aplicadas nas transações (PIX, assinaturas, saques de professores) impactam diretamente nosso faturamento consolidado anual. Ajuste-as na seção dedicada.
                </p>
              </div>
              <button 
                onClick={() => setSubTab('taxas')} 
                className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-300 hover:text-white text-xs font-semibold rounded-lg transition"
              >
                Ajustar Tarifário Técnico
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: ASSINATURAS (VIP DIRECT PLANS INTEGRATION) */}
        {subTab === 'subscriptions' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-blue-400" /> Cobranças e Recorrências de Mensalidades BJJ VIP
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Lançamento de mensalidades de lutadores integrados via DB.</p>
              </div>
              <button 
                onClick={() => handleExportExcel('subs')}
                className="p-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white rounded border border-slate-800 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Exportar XLS (CSV)</span>
              </button>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left text-slate-300 font-sans">
                <thead className="bg-[#0f172a] text-[9.5px] uppercase text-indigo-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID Cobrança</th>
                    <th className="p-3">Atleta Assinante</th>
                    <th className="p-3">Plano Adquirido</th>
                    <th className="p-3">Valor Cobrado</th>
                    <th className="p-3">Código TXID Gateway</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Data Liquidação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {subscriptions.map(s => (
                    <tr key={s.id} className="hover:bg-slate-950/20">
                      <td className="p-3 font-mono text-[10px] text-slate-500">{s.id.slice(0, 12)}...</td>
                      <td className="p-3 font-semibold text-slate-200">
                        {s.userName}
                        <span className="block font-mono font-normal text-[10.5px] text-slate-500">{s.userEmail}</span>
                      </td>
                      <td className="p-3">
                        <span className="p-0.5 px-2 bg-indigo-500/10 border border-indigo-550/20 text-indigo-400 font-semibold text-[10px] rounded uppercase">
                          {s.planName}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">R$ {s.amountBRL.toFixed(2)}</td>
                      <td className="p-3 font-mono text-[10.5px] text-slate-400">{s.txid}</td>
                      <td className="p-3">
                        <span className="p-0.5 px-2 bg-emerald-500/15 text-emerald-400 font-semibold text-[10px] rounded uppercase font-mono">
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{new Date(s.paidAt || s.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MARKETPLACE (PLATFORM COMMISSIONS & P2P SALES) */}
        {subTab === 'marketplace' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-amber-500" /> Transações de Repasse de Kimonos e Mentoria (Marketplace)
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Negociações ponto a ponto entre usuários. Comissão de faturamento da empresa: {rates.marketplaceCommissionRate * 100}%.</p>
              </div>
              <button 
                onClick={() => handleExportExcel('market')}
                className="p-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white rounded border border-slate-800 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Exportar XLS (CSV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Volume MKT Total (BRL Equiv)</span>
                <p className="text-lg font-black text-white mt-1">
                  R$ {marketplaceSales.reduce((acc, curr) => acc + curr.amountBRL, 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Taxas Retidas (Plataforma Fee)</span>
                <p className="text-lg font-black text-emerald-400 mt-1">
                  R$ {marketplaceSales.reduce((acc, curr) => acc + curr.feeBRL, 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Taxa Vigente Retida do Vendedor</span>
                <p className="text-lg font-black text-indigo-400 mt-1">
                  {(rates.marketplaceCommissionRate * 100).toFixed(0)}% de Comissão
                </p>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left text-slate-300 font-sans">
                <thead className="bg-[#0f172a] text-[9.5px] uppercase text-indigo-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID Transação</th>
                    <th className="p-3">Item do Anúncio</th>
                    <th className="p-3">Vendedor</th>
                    <th className="p-3">Comprador</th>
                    <th className="p-3">Valor do Item</th>
                    <th className="p-3">Comissão Retida</th>
                    <th className="p-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {marketplaceSales.map(m => (
                    <tr key={m.id} className="hover:bg-slate-950/20">
                      <td className="p-3 font-mono text-[10px] text-slate-500">{m.id.slice(0, 10)}...</td>
                      <td className="p-3 font-semibold text-slate-250">{m.itemName}</td>
                      <td className="p-3 font-medium text-slate-300">
                        {m.sellerName}
                        <span className="block font-sans font-normal text-[10px] text-slate-500">{m.sellerEmail}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-300 border-r border-slate-900">
                        {m.buyerName}
                        <span className="block font-sans font-normal text-[10px] text-slate-500">{m.buyerEmail}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-white block">R$ {m.amountBRL.toFixed(2)}</span>
                        <span className="font-mono text-slate-500 text-[10px] block">{m.pricePaidJT} JT</span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-emerald-450 block">+ R$ {m.feeBRL.toFixed(2)}</span>
                        <span className="font-mono text-slate-500 text-[10px] block">{m.feePaidJT} JT ({rates.marketplaceCommissionRate*100}%)</span>
                      </td>
                      <td className="p-3 font-mono text-slate-450">{new Date(m.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: LOJA ONLINE (E-COMMERCE DIRECT DIRECT CASHIER) */}
        {subTab === 'store' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <PiggyBank className="w-4.5 h-4.5 text-emerald-400" /> Relatório de Saídas Contábeis da Loja (Equipamentos e Patches)
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Vendas diretas de Kimonos, rashguards, patches e certificados com compensação em moedas virtuais ou reais.</p>
              </div>
              <button 
                onClick={() => handleExportExcel('store')}
                className="p-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white rounded border border-slate-800 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Exportar XLS (CSV)</span>
              </button>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left text-slate-300 font-sans">
                <thead className="bg-[#0f172a] text-[9.5px] uppercase text-indigo-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID do Lançamento</th>
                    <th className="p-3">Lutador Adquirente</th>
                    <th className="p-3">Catálogo Produto</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Valor Pago (Fiat BRL)</th>
                    <th className="p-3">Valor Pago (Virtual JT)</th>
                    <th className="p-3">Data Aquisição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {storeSales.map(s => (
                    <tr key={s.id} className="hover:bg-slate-950/20">
                      <td className="p-3 font-mono text-[10px] text-slate-500">{s.id.slice(0, 12)}...</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-200 block">{s.buyerName}</span>
                        <span className="font-mono text-slate-500 text-[10px] block">{s.buyerEmail}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-200">{s.productName}</td>
                      <td className="p-3">
                        <span className="p-0.5 px-2 bg-slate-800 border border-slate-750 text-slate-400 text-[9px] rounded font-mono uppercase">
                          {s.category}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">R$ {s.pricePaidBRL.toFixed(2)}</td>
                      <td className="p-3 font-mono text-slate-450">{s.pricePaidJT} JT</td>
                      <td className="p-3 font-mono text-slate-500">{new Date(s.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PIX (GATEWAY STATUS & WEBHOOK HISTORY) */}
        {subTab === 'pix' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4.5 h-4.5 text-indigo-400 animate-spin-slow" /> Monitoramento Bancário Instantâneo PIX (API)
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Conexão em tempo real de emissões de QR Code para depósitos diretos.</p>
              </div>
              <button 
                onClick={() => handleExportExcel('pix')}
                className="p-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white rounded border border-slate-800 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Exportar XLS (CSV)</span>
              </button>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left text-slate-300 font-sans">
                <thead className="bg-[#0f172a] text-[9.5px] uppercase text-indigo-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Código TXID Interno</th>
                    <th className="p-3">Valor Emitido</th>
                    <th className="p-3">Status Cobrança</th>
                    <th className="p-3">Data Emissão</th>
                    <th className="p-3">Data Confirmação Webhook</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {pix.map(p => (
                    <tr key={p.id} className="hover:bg-slate-950/20">
                      <td className="p-3 font-mono text-[10.5px] text-indigo-300">{p.txid}</td>
                      <td className="p-3 font-mono font-bold text-white">R$ {p.amountBRL.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`p-0.5 px-2 text-[9px] font-mono rounded font-black uppercase ${
                          p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                          p.status === 'EXPIRED' ? 'bg-rose-500/10 text-rose-400' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{new Date(p.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-mono text-slate-500">
                        {p.paidAt ? new Date(p.paidAt).toLocaleString() : <span className="text-slate-650">• Pendente ou Expirado</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SAQUES (TEACHER PAYOUTS CONTROLLER) */}
        {subTab === 'saques' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ExternalLink className="w-4.5 h-4.5 text-purple-400" /> Resgates e Saques Solicitados por Professores
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Fila operacional de transferências PIX executivas para professores cadastrados.</p>
              </div>
              <button 
                onClick={() => handleExportExcel('saques')}
                className="p-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white rounded border border-slate-800 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Exportar XLS (CSV)</span>
              </button>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left text-slate-300 font-sans">
                <thead className="bg-[#0f172a] text-[9.5px] uppercase text-indigo-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID Saque</th>
                    <th className="p-3">Professor Instrutor</th>
                    <th className="p-3">Chave de Destino (PIX)</th>
                    <th className="p-3">Tipo Chave</th>
                    <th className="p-3">Valor de Retirada</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Data</th>
                    <th className="p-3">Justificativa Administrador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-slate-950/20">
                      <td className="p-3 font-mono text-[10px] text-slate-500">{w.id.slice(0, 10)}...</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-200 block">{w.userName}</span>
                        <span className="font-mono text-slate-500 text-[10.5px] block">{w.userEmail}</span>
                      </td>
                      <td className="p-3 font-mono text-[#7a85ff] font-semibold">{w.pixKey}</td>
                      <td className="p-3 font-mono text-slate-400">{w.pixKeyType}</td>
                      <td className="p-3 font-mono font-bold text-white">R$ {w.amountBRL.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`p-0.5 px-2 text-[9.5px] rounded font-mono uppercase font-semibold ${
                          w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                          w.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-450 border border-rose-505/20' : 'bg-amber-500/10 text-amber-500 animate-pulse'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{new Date(w.createdAt).toLocaleString()}</td>
                      <td className="p-3 text-slate-450 font-sans leading-relaxed">{w.notes || <span className="text-slate-650">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: TAXAS CONFIGURADOR (FEES SETUP ENGINE) */}
        {subTab === 'taxas' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4.5 h-4.5 text-indigo-400" /> Tarifário Fiscal e Taxação da Plataforma SaaS
                </h3>
                <p className="text-[11px] text-slate-505 mt-1">Ajuste técnico fino de taxas operacionais sobre transações financeiras.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateRatesSubmit} className="space-y-6 max-w-2xl text-xs font-sans">
              
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                
                <h4 className="font-mono font-extrabold text-[#7b81ff] text-[10.5px] uppercase tracking-wide flex items-center gap-2 pb-2.5 border-b border-slate-950">
                  <Percent className="w-4 h-4" /> Comissões e Tarifas por Gateway
                </h4>

                {/* Fixed PIX Cost */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-mono tracking-wider uppercase text-[10px] flex justify-between">
                    <span>Custo Fixo por Emissão PIX (R$)</span>
                    <strong className="text-indigo-400 font-mono">R$ {editingRates.fixedPixFeeBRL.toFixed(2)}</strong>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="5" 
                    step="0.05"
                    value={editingRates.fixedPixFeeBRL}
                    onChange={(e) => setEditingRates(prev => ({ ...prev, fixedPixFeeBRL: parseFloat(e.target.value) }))}
                    className="w-full accent-indigo-500 cursor-pointer bg-slate-950 h-2 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-500 leading-snug block">
                    *Tarifa debitada do emissor da cobrança para liquidação bancária.
                  </span>
                </div>

                {/* Percentage PIX Fee */}
                <div className="space-y-1.5 mt-4">
                  <label className="text-slate-400 font-mono tracking-wider uppercase text-[10px] flex justify-between">
                    <span>Porcentagem de Moeda Transacionada PIX (%)</span>
                    <strong className="text-indigo-400 font-mono">{(editingRates.percentagePixFee * 100).toFixed(1)}%</strong>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="0.10" 
                    step="0.005"
                    value={editingRates.percentagePixFee}
                    onChange={(e) => setEditingRates(prev => ({ ...prev, percentagePixFee: parseFloat(e.target.value) }))}
                    className="w-full accent-indigo-500 cursor-pointer bg-slate-950 h-2 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-505 leading-snug block">
                    *Tarifa percentual cobrada de depósitos de atletismo.
                  </span>
                </div>

                {/* Marketplace commission */}
                <div className="space-y-1.5 mt-4">
                  <label className="text-slate-400 font-mono tracking-wider uppercase text-[10px] flex justify-between">
                    <span>Taxa Administrativa do Marketplace (%)</span>
                    <strong className="text-indigo-400 font-mono">{(editingRates.marketplaceCommissionRate * 100).toFixed(0)}%</strong>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="0.40" 
                    step="0.01"
                    value={editingRates.marketplaceCommissionRate}
                    onChange={(e) => setEditingRates(prev => ({ ...prev, marketplaceCommissionRate: parseFloat(e.target.value) }))}
                    className="w-full accent-indigo-500 cursor-pointer bg-slate-950 h-2 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-500 leading-snug block">
                    *Fatia cobrada do instrutor vendedor ao fechar contrato via Marketplace.
                  </span>
                </div>

                {/* Subs tax rate */}
                <div className="space-y-1.5 mt-4">
                  <label className="text-slate-400 font-mono tracking-wider uppercase text-[10px] flex justify-between">
                    <span>Imposto de Processamento sobre Assinaturas VIP (%)</span>
                    <strong className="text-indigo-400 font-mono">{(editingRates.subscriptionTaxRate * 100).toFixed(0)}%</strong>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="0.10" 
                    step="0.005"
                    value={editingRates.subscriptionTaxRate}
                    onChange={(e) => setEditingRates(prev => ({ ...prev, subscriptionTaxRate: parseFloat(e.target.value) }))}
                    className="w-full accent-indigo-500 cursor-pointer bg-slate-950 h-2 rounded-lg"
                  />
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingRates}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-600 font-extrabold text-white rounded-xl uppercase tracking-widest cursor-pointer text-xs disabled:opacity-50"
                >
                  {isUpdatingRates ? "Sincronizando Taxas com Postgres..." : "Gravar e Aplicar Taxas e Tarifas"}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 8: AUDITORIA FISCAL COMPLETA (FISCAL AUDIT TRAIL STREAM) */}
        {subTab === 'auditoria' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 animate-pulse" /> Auditoria Fiscal Completa (Blockchain-Like Immutability)
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Gabinete de controle contra saques duplicados, fraudes de licitações ou recargas locais ilegais.</p>
              </div>
              
              <div className="flex gap-2 print:hidden">
                <button 
                  onClick={() => handleExportExcel('auditoria')}
                  className="p-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white rounded border border-slate-800 text-xs font-mono flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>XLS Completo Log</span>
                </button>
              </div>
            </div>

            {/* Simple filtering controls */}
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center print:hidden">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input 
                  type="text" 
                  placeholder="Pesquisar registro de auditoria..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9.5 pr-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-sans"
                />
              </div>

              <div className="flex gap-2 self-stretch md:self-auto w-full md:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 p-2.5 text-xs rounded-lg focus:outline-none flex-1 md:flex-none font-mono"
                >
                  <option value="ALL">Todas as Ações</option>
                  <option value="PIX_DEPOSIT">Depósitos PIX</option>
                  <option value="WITHDRAW_REQUEST">Saques Solicitados</option>
                  <option value="WITHDRAW_PROCESS">Saques Pagados / Processos</option>
                  <option value="SYSTEM_SETTING_CHANGE">Log de Parâmetros</option>
                </select>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left text-slate-300 font-sans">
                <thead className="bg-[#0f172a] text-[9.5px] uppercase text-indigo-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Data Evento</th>
                    <th className="p-3">Categoria Operação</th>
                    <th className="p-3">Ator Executor</th>
                    <th className="p-3">Descrição Detalhada do Fato</th>
                    <th className="p-3">Impacto Financeiro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {auditLogs
                    .filter(l => {
                      if (categoryFilter !== 'ALL' && l.action !== categoryFilter) return false;
                      if (searchText) {
                        const s = searchText.toLowerCase();
                        return l.description.toLowerCase().includes(s) || l.action.toLowerCase().includes(s) || l.actorName.toLowerCase().includes(s);
                      }
                      return true;
                    })
                    .map(l => (
                      <tr key={l.id} className="hover:bg-slate-950/20">
                        <td className="p-3 font-mono text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                        <td className="p-3 font-mono text-[10.5px]">
                          <span className={`p-1 px-1.5 text-[9px] rounded font-black tracking-widest ${
                            l.action === 'PIX_DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                            l.action === 'WITHDRAW_REQUEST' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10' :
                            l.action === 'WITHDRAW_PROCESS' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {l.action}
                          </span>
                        </td>
                        <td className="p-3 select-all">
                          <span className="font-semibold block text-slate-200">{l.actorName}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">{l.actorEmail}</span>
                        </td>
                        <td className="p-3 text-slate-400 leading-relaxed font-sans">{l.description}</td>
                        <td className="p-3 font-mono font-bold text-white text-right pr-6">
                          {l.amountBRL ? `R$ ${l.amountBRL.toFixed(2)}` : <span className="text-slate-650">—</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
