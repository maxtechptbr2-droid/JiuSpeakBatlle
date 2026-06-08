/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck, 
  PiggyBank, 
  FileText, 
  Plus, 
  ArrowRight,
  RefreshCw,
  Award,
  Copy,
  Check,
  QrCode,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../types';

interface FinancePanelProps {
  user: UserProfile;
  updateUser: (newUser: Partial<UserProfile>) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onAddAuditLog?: (type: any, desc: string, amtBRL?: number, amtKC?: number) => void;
}

interface PixPaymentResult {
  id?: string;
  txid: string;
  amountBRL: number;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'REFUNDED';
  qrCode: string;
  qrCodeCopyPaste: string;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
  type: 'DEPOSIT' | 'MARKETPLACE_SELL';
  description: string;
}

export default function FinancePanel({ 
  user, 
  updateUser, 
  showToast,
  onAddAuditLog 
}: FinancePanelProps) {
  const [loading, setLoading] = useState(false);
  const [copiedTxid, setCopiedTxid] = useState<string | null>(null);
  
  const [wallet, setWallet] = useState({
    balanceAvailableBRL: user.balanceAvailableBRL ?? 420.00,
    balancePendingBRL: user.balancePendingBRL ?? 155.00,
    totalEarnedBRL: user.totalEarnedBRL ?? 575.00,
    totalWithdrawnBRL: user.totalWithdrawnBRL ?? 0.00,
  });

  // Pix state managers
  const [pixPayments, setPixPayments] = useState<PixPaymentResult[]>([]);
  const [pixAmount, setPixAmount] = useState('150.00');
  const [pixType, setPixType] = useState<'DEPOSIT' | 'MARKETPLACE_SELL'>('DEPOSIT');
  const [pixDescription, setPixDescription] = useState('Recarga de Saldo para Compra de Kimonos');
  const [activePix, setActivePix] = useState<PixPaymentResult | null>(null);

  // Simulator forms state
  const [saleForm, setSaleForm] = useState({
    amount: '199.90',
    description: 'Curso Triagem de Passagem de Guarda de Elite',
  });

  const [releaseForm, setReleaseForm] = useState({
    amount: '100.00',
  });

  const [withdrawForm, setWithdrawForm] = useState({
    amount: '150.00',
    keyType: 'CPF' as 'CPF' | 'CNPJ' | 'Email' | 'Celular' | 'Aleatoria',
    pixKey: '123.456.789-00',
  });

  // Withdrawal system states
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [withdrawalAudits, setWithdrawalAudits] = useState<any[]>([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchWithdrawals = async () => {
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) return;
    try {
      const isAdmin = user.role === 'admin';
      const endpoint = isAdmin ? '/api/admin/withdrawals' : '/api/finance/withdrawals';
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (err) {
      console.error("Erro ao obter saques:", err);
    }
  };

  const fetchAuditsForWithdrawal = async (id: string) => {
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/audits`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawalAudits(data.audits || []);
      }
    } catch (err) {
      console.error("Erro ao obter auditoria do saque:", err);
    }
  };

  const handleReviewWithdrawal = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedWithdrawal) return;
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) return;
    
    try {
      setReviewLoading(true);
      const res = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ action, notes: adminNotes })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        setAdminNotes('');
        setSelectedWithdrawal(null);
        fetchWalletState();
        fetchWithdrawals();
      } else {
        showToast(data.error || "Erro ao revisar o saque.", "error");
      }
    } catch (err) {
      showToast("Conexão falhou com a API de auditoria.", "error");
    } finally {
      setReviewLoading(false);
    }
  };

  // Sync state with backend on mount
  const fetchWalletState = async () => {
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch('/api/finance/wallet', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWallet(data);
        updateUser({
          balanceAvailableBRL: data.balanceAvailableBRL,
          balancePendingBRL: data.balancePendingBRL,
          totalEarnedBRL: data.totalEarnedBRL,
          totalWithdrawnBRL: data.totalWithdrawnBRL,
          balanceBRL: data.balanceAvailableBRL,
        });
      }
    } catch (err) {
      console.error("Erro ao sincronizar dados financeiros:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPixPayments = async () => {
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) return;
    try {
      const res = await fetch('/api/finance/pix', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPixPayments(data.payments || []);
        // Update active PIX state if exists in list to stay in sync
        if (activePix) {
          const updated = (data.payments as PixPaymentResult[]).find(p => p.txid === activePix.txid);
          if (updated) {
            setActivePix(updated);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao sincronizar lista PIX:", err);
    }
  };

  useEffect(() => {
    fetchWalletState();
    fetchPixPayments();
    fetchWithdrawals();
  }, []);

  // Sync props user changed state
  useEffect(() => {
    setWallet({
      balanceAvailableBRL: user.balanceAvailableBRL,
      balancePendingBRL: user.balancePendingBRL,
      totalEarnedBRL: user.totalEarnedBRL,
      totalWithdrawnBRL: user.totalWithdrawnBRL,
    });
  }, [user.balanceAvailableBRL, user.balancePendingBRL, user.totalEarnedBRL, user.totalWithdrawnBRL]);

  // Copy Pix Copia e Cola to Clipboard simulator
  const handleCopyToClipboard = (text: string, txid: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxid(txid);
    showToast("Código PIX Copia e Cola copiado!", "success");
    setTimeout(() => {
      setCopiedTxid(null);
    }, 2000);
  };

  // 1. Create professional PIX
  const handleCreatePixPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(pixAmount);
    if (isNaN(val) || val <= 0) {
      showToast("Insira um valor de PIX positivo válido.", "error");
      return;
    }

    const token = localStorage.getItem('jiuspeak_access_token');
    try {
      setLoading(true);
      const res = await fetch('/api/finance/pix', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          amount: val,
          type: pixType,
          description: pixDescription || "Depósito de fundos Geral"
        })
      });

      const data = await res.json();
      if (res.ok) {
        setActivePix(data.payment);
        showToast(data.message, "success");
        fetchPixPayments();
        if (onAddAuditLog) {
          onAddAuditLog(
            'pix_deposit',
            `Faturamento Acadêmico: PIX gerado no valor de R$ ${val.toFixed(2)} (${pixType === 'MARKETPLACE_SELL' ? 'Venda Pendente' : 'Depósito Disponível'})`,
            val
          );
        }
      } else {
        showToast(data.error || "Falha ao gerar QR Code PIX.", "error");
      }
    } catch (err) {
      showToast("Conexão falhou com API contábil PIX.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Simulate approved Webhook call
  const handleSimulateWebhook = async (txid: string, status: 'approved' | 'expired' = 'approved') => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/pix-webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txid,
          status
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        if (data.wallet) {
          setWallet(data.wallet);
          updateUser({
            balanceAvailableBRL: data.wallet.balanceAvailableBRL,
            balancePendingBRL: data.wallet.balancePendingBRL,
            totalEarnedBRL: data.wallet.totalEarnedBRL,
            totalWithdrawnBRL: data.wallet.totalWithdrawnBRL,
            balanceBRL: data.wallet.balanceAvailableBRL,
          });
        }
        
        // Sync structures
        await fetchPixPayments();
        await fetchWalletState();

        if (activePix && activePix.txid === txid) {
          setActivePix(prev => prev ? { ...prev, status: status === 'approved' ? 'COMPLETED' : 'EXPIRED', paidAt: status === 'approved' ? new Date().toISOString() : null } : null);
        }
      } else {
        showToast(data.error || "Falha ao processar simulação de webhook.", "error");
      }
    } catch (err) {
      showToast("Conexão falhou com a API de webhook.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 3. Approve sale simulation (Legacy custom sales)
  const handleSimulateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(saleForm.amount);
    if (isNaN(val) || val <= 0) {
      showToast("Insira um valor de venda positivo válido.", "error");
      return;
    }

    const token = localStorage.getItem('jiuspeak_access_token');
    try {
      setLoading(true);
      const res = await fetch('/api/finance/sale', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          amount: val,
          description: saleForm.description,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setWallet(data.wallet);
        updateUser({
          balanceAvailableBRL: data.wallet.balanceAvailableBRL,
          balancePendingBRL: data.wallet.balancePendingBRL,
          totalEarnedBRL: data.wallet.totalEarnedBRL,
          totalWithdrawnBRL: data.wallet.totalWithdrawnBRL,
          balanceBRL: data.wallet.balanceAvailableBRL,
        });
        showToast(data.message, "success");
      } else {
        showToast(data.error || "Falha ao registrar venda simulada.", "error");
      }
    } catch (err) {
      showToast("Conexão falhou com a API de vendas.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 4. Release pending balance simulation (Legacy manual compensations)
  const handleSimulateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(releaseForm.amount);
    if (isNaN(val) || val <= 0) {
      showToast("Insira um valor de liberação válido.", "error");
      return;
    }

    if (wallet.balancePendingBRL < val) {
      showToast("Seu saldo pendente é inferior ao valor solicitado para liberação.", "error");
      return;
    }

    const token = localStorage.getItem('jiuspeak_access_token');
    try {
      setLoading(true);
      const res = await fetch('/api/finance/release', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: val })
      });

      const data = await res.json();
      if (res.ok) {
        setWallet(data.wallet);
        updateUser({
          balanceAvailableBRL: data.wallet.balanceAvailableBRL,
          balancePendingBRL: data.wallet.balancePendingBRL,
          totalEarnedBRL: data.wallet.totalEarnedBRL,
          totalWithdrawnBRL: data.wallet.totalWithdrawnBRL,
          balanceBRL: data.wallet.balanceAvailableBRL,
        });
        showToast(data.message, "success");
      } else {
        showToast(data.error || "Falha ao liberar saldo.", "error");
      }
    } catch (err) {
      showToast("Conexão falhou com a API de liberação.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 5. Request withdrawal (Saque)
  const handleSimulateWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawForm.amount);
    if (isNaN(val) || val <= 0) {
      showToast("Insira um valor de saque válido.", "error");
      return;
    }

    if (wallet.balanceAvailableBRL < val) {
      showToast(`Saldo disponível insuficiente! Seu saldo é de R$ ${wallet.balanceAvailableBRL.toFixed(2)}.`, "error");
      return;
    }

    if (!withdrawForm.pixKey.trim()) {
      showToast("Forneça uma chave PIX destinatária.", "error");
      return;
    }

    const token = localStorage.getItem('jiuspeak_access_token');
    try {
      setLoading(true);
      const res = await fetch('/api/finance/withdraw', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          amount: val,
          pixKey: withdrawForm.pixKey,
          keyType: withdrawForm.keyType
        })
      });

      const data = await res.json();
      if (res.ok) {
        setWallet(data.wallet);
        updateUser({
          balanceAvailableBRL: data.wallet.balanceAvailableBRL,
          balancePendingBRL: data.wallet.balancePendingBRL,
          totalEarnedBRL: data.wallet.totalEarnedBRL,
          totalWithdrawnBRL: data.wallet.totalWithdrawnBRL,
          balanceBRL: data.wallet.balanceAvailableBRL,
        });
        showToast(data.message, "success");
        fetchWithdrawals();
      } else {
        showToast(data.error || "Falha ao processar transferência.", "error");
      }
    } catch (err) {
      showToast("Erro na requisição ao servidor financeiro.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="finance-completed-system">
      
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-400" /> Sistema Financeiro JiuSpeak SaaS
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Painel contábil unificado com carteira física persistida no banco de dados. Controle completo de comissões e retiradas de professores.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { fetchWalletState(); fetchPixPayments(); }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono transition-all border border-slate-800 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            Sincronizar Dados
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* 1. Saldo Disponível */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 p-5 rounded-xl border border-indigo-500/20 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-550/10 transition-all" />
          <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] uppercase tracking-wider">
            <span>Saldo Disponível</span>
            <PiggyBank className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-500 block">Disponível para Saque</span>
            <p className="text-2xl font-black text-white mt-1">R$ {wallet.balanceAvailableBRL.toFixed(2)}</p>
          </div>
          <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-indigo-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resgate PIX liberado
            </span>
          </div>
        </div>

        {/* 2. Saldo Pendente */}
        <div className="bg-slate-950/85 p-5 rounded-xl border border-slate-800/80 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all" />
          <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] uppercase tracking-wider">
            <span>Saldo Pendente</span>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-500 block">Vendas em Análise</span>
            <p className="text-2xl font-black text-white mt-1">R$ {wallet.balancePendingBRL.toFixed(2)}</p>
          </div>
          <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-yellow-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-yellow-500" /> Aguardando liberação
            </span>
          </div>
        </div>

        {/* 3. Total Ganho */}
        <div className="bg-slate-950/85 p-5 rounded-xl border border-slate-800/80 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] uppercase tracking-wider">
            <span>Total Ganho</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-500 block">Faturamento Bruto</span>
            <p className="text-2xl font-black text-white mt-1">R$ {wallet.totalEarnedBRL.toFixed(2)}</p>
          </div>
          <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-emerald-400">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" /> Vendas acumuladas
            </span>
          </div>
        </div>

        {/* 4. Total Sacado */}
        <div className="bg-slate-950/85 p-5 rounded-xl border border-slate-800/80 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all" />
          <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] uppercase tracking-wider">
            <span>Total Sacado</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-500 block">Resgates Confirmados</span>
            <p className="text-2xl font-black text-white mt-1">R$ {wallet.totalWithdrawnBRL.toFixed(2)}</p>
          </div>
          <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-rose-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-rose-400" /> Saques via PIX concluídos
            </span>
          </div>
        </div>

      </div>

      {/* Official Policy and Rules Board */}
      <div className="p-5 bg-indigo-950/20 border border-indigo-900/20 rounded-2xl space-y-3">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2 text-indigo-400 animate-pulse">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> Sistema Contábil Imutável Antifraude
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong>Nenhum saldo ou crédito pode ser liberado sem prévia confirmação e auditoria.</strong> O sistema PIX profissional exige a criação da cobrança pendente, o recebimento do Webhook bancário assinado e a consequente liquidação de dados com idempotência rígida.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 space-y-1.5">
            <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-extrabold block w-max uppercase">PASSO 1: Emissão</span>
            <p className="text-xs text-slate-300">Cria-se a cobrança <code>PixPayment</code> e <code>Transaction</code> com status <strong>PENDENTE</strong> de segurança.</p>
          </div>
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 space-y-1.5">
            <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-extrabold block w-max uppercase">PASSO 2: QR / Chave</span>
            <p className="text-xs text-slate-300">O motor gera o QR Code e string <i>Copia e Cola</i> válidos por 15 minutos para processamento.</p>
          </div>
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 space-y-1.5">
            <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-extrabold block w-max uppercase">PASSO 3: Webhook</span>
            <p className="text-xs text-slate-300">A confirmação em tempo real executa a aprovação e injeta os registros de auditoria no DB <code>AuditLog</code>.</p>
          </div>
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 space-y-1.5">
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-555/10 px-2 py-0.5 rounded font-extrabold block w-max uppercase">PASSO 4: Crédito</span>
            <p className="text-xs text-slate-300">Os fundos são integrados diretamente na carteira física do usuário de forma transacional segura.</p>
          </div>
        </div>
      </div>

      {/* ======================= PROFESSIONAL PIX PAYMENT GATEWAY ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pix-payment-gateway-engine">
        
        {/* Left Panel: Creator of PIX Billing */}
        <div className="lg:col-span-4 bg-slate-950/60 p-6 rounded-2xl border border-indigo-500/20 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-indigo-550/20 flex justify-between items-center mb-4">
              <h3 className="font-display font-extrabold text-[#7980ff] text-[14px] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400 animate-spin-slow" /> Emissão PIX Profissional
              </h3>
              <span className="text-[8px] bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded font-mono uppercase font-bold border border-indigo-500/30">Gateway V2</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Defina as especificações de faturamento abaixo. O gateway registrará uma transação financeira blindada que aguarda liquidação autorizada.
            </p>

            <form onSubmit={handleCreatePixPayment} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase tracking-wider block">Finalidade / Tipo da Transação</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPixType('DEPOSIT');
                      setPixDescription('Recarga de Saldo para Compra de Kimonos');
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-bold font-mono text-[10px] transition-all cursor-pointer ${
                      pixType === 'DEPOSIT' 
                        ? 'bg-indigo-650 border-indigo-500 text-white' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    📥 DEPÓSITO DIRETO
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPixType('MARKETPLACE_SELL');
                      setPixDescription('Venda de Mentoria Técnica Particular');
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-bold font-mono text-[10px] transition-all cursor-pointer ${
                      pixType === 'MARKETPLACE_SELL' 
                        ? 'bg-indigo-650 border-indigo-500 text-white' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🥋 VENDA DE CURSO
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 leading-snug mt-1.5 block">
                  {pixType === 'DEPOSIT' 
                    ? '*Alimenta diretamente o Saldo Disponível para resgate após aprovado pelo webhook.' 
                    : '*Alimenta o Saldo Pendente (Venda) e acumula no Total Ganho após confirmação.'
                  }
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase tracking-wider block">Identificação do faturamento</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Assinatura Anual Premium JiuSpeak"
                  value={pixDescription}
                  onChange={(e) => setPixDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] uppercase tracking-wider block">Valor Nominal (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono">R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    min="1"
                    value={pixAmount}
                    onChange={(e) => setPixAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-indigo-300 pl-9 pr-3 py-2.5 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-650 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                ⚡ Emitir QR Code PIX Pendente
              </button>

            </form>
          </div>
        </div>

        {/* Center Panel: Active PIX QR Visualizer Screen */}
        <div className="lg:col-span-8 bg-slate-950/60 p-6 rounded-2xl border border-indigo-500/20 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-indigo-550/20 flex justify-between items-center mb-4">
              <h3 className="font-display font-extrabold text-[14px] text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" /> Tela de Pagamento & Gateway Simulador
              </h3>
              {activePix ? (
                <span className={`text-[8px] px-2 py-0.5 rounded font-mono uppercase font-black border ${
                  activePix.status === 'COMPLETED' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : activePix.status === 'EXPIRED'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 animate-pulse'
                }`}>
                  {activePix.status === 'COMPLETED' ? '● APROVADO' : activePix.status === 'EXPIRED' ? '● EXPIRADO' : '● AGUARDANDO PAGAMENTO'}
                </span>
              ) : (
                <span className="text-[9px] text-slate-500">Nenhum PIX em exibição</span>
              )}
            </div>

            {activePix ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs transition-all">
                
                {/* QR Code Presentation Box */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="bg-white p-3 rounded-xl shadow-lg relative overflow-hidden group">
                    <img 
                      src={activePix.qrCode} 
                      alt="PIX QR Code" 
                      className="w-40 h-40 object-contain referrer-policy"
                      referrerPolicy="no-referrer"
                    />
                    {activePix.status === 'COMPLETED' && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                        <div className="bg-emerald-500 p-2 rounded-full text-slate-950">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono uppercase font-black">Pagamento Aprovado</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Valor Cobrado</span>
                    <strong className="text-xl font-mono text-white">R$ {activePix.amountBRL.toFixed(2)}</strong>
                  </div>

                  <span className="text-[9px] font-mono text-slate-500 leading-relaxed max-w-xs block">
                    Escaneie pelo aplicativo de seu banco ou use a chave copia-cola ao lado para simulação imediata. Escaneamento real não debitará fundos reais.
                  </span>
                </div>

                {/* API and Copia-cola specifications */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Descrição do Pedido</span>
                      <p className="text-slate-200 font-medium text-xs leading-relaxed">{activePix.description}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Chave TXID Única</span>
                      <code className="text-[10px] block font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg">
                        {activePix.txid}
                      </code>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase flex justify-between items-center">
                        <span>PIX Copia e Cola</span>
                        {copiedTxid === activePix.txid ? (
                          <span className="text-[9px] text-emerald-400 flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Copiado</span>
                        ) : null}
                      </span>
                      <div className="flex gap-1.5">
                        <textarea 
                          readOnly
                          value={activePix.qrCodeCopyPaste}
                          className="w-full h-11 bg-slate-900 border border-slate-800 text-slate-400 p-2 text-[9px] font-mono rounded-lg focus:outline-none resize-none"
                        />
                        <button 
                          onClick={() => handleCopyToClipboard(activePix.qrCodeCopyPaste, activePix.txid)}
                          className="px-2.5 py-1 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300 rounded-lg flex items-center justify-center"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] text-slate-450 font-mono">
                        Criado em: {new Date(activePix.createdAt).toLocaleString()}<br/>
                        Expira em: 15 minutos (Laboratório de testes)
                      </span>
                    </div>

                  </div>

                  {/* Professional tracking and status indicators for pending PIX payments */}
                  {activePix.status === 'PENDING' ? (
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin" /> Conciliação Bancária em Tempo Real
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Aguardando a liquidação do Pix na rede de pagamentos instantâneos do Banco Central. O tempo médio estimado de reconciliação é de 15 segundos.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        {activePix.status === 'COMPLETED' ? (
                          <>
                            <span className="text-[11px] font-bold text-emerald-400 block pb-0.5">Pagamento Aprovado via Webhook!</span>
                            <p className="text-[10px] text-slate-400 leading-snug">Seu saldo já foi creditado permanentemente com total garantia contábil.</p>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-bold text-rose-455 block pb-0.5">Transação Expirada / Cancelada</span>
                            <p className="text-[10px] text-slate-400 leading-snug">Este faturamento não pode mais ser liquidado. Gere outro código.</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <div className="bg-slate-900 p-4 rounded-full text-slate-700 border border-slate-800">
                  <QrCode className="w-12 h-12 text-slate-650" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-300">Nenhum PIX em Exibição</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mt-1">Preencha o formulário ao lado com o valor e a finalidade e clique para gerar um QR Code profissional.</p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Transaction History & Payments Pix Table logs list */}
      <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-4" id="pix-payments-historic-registry">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-850">
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Histórico de Transações e Cobranças PIX
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">Fila operacional de cobranças geradas. Clique para resgatar o QR Code ou despachar webhook.</p>
          </div>
          <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded font-black uppercase text-right">Idempotência Blindada</span>
        </div>

        {pixPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-450 font-mono">
                <tr>
                  <th className="p-3">Destinação</th>
                  <th className="p-3">Identificação</th>
                  <th className="p-3">Código TXID</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Data</th>
                  <th className="p-3 font-mono text-[9px]">Status</th>
                  <th className="p-3 text-center font-mono text-[9px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {pixPayments.map((p) => (
                  <tr key={p.txid} className={`hover:bg-slate-900/40 transition-all ${activePix?.txid === p.txid ? 'bg-indigo-950/10' : ''}`}>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                        p.type === 'MARKETPLACE_SELL' 
                          ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                          : 'bg-indigo-500/10 text-indigo-405 border border-indigo-500/20'
                      }`}>
                        {p.type === 'MARKETPLACE_SELL' ? 'VENDA' : 'DEPÓSITO'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-200">{p.description}</td>
                    <td className="p-3">
                      <code className="text-[10px] text-indigo-300 font-mono">{p.txid.slice(0, 10)}...{p.txid.slice(-4)}</code>
                    </td>
                    <td className="p-3 font-mono font-bold text-white">R$ {p.amountBRL.toFixed(2)}</td>
                    <td className="p-3 font-mono text-slate-450">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono inline-flex items-center gap-1 ${
                        p.status === 'COMPLETED'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : p.status === 'EXPIRED'
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-yellow-500 bg-yellow-500/10 animate-pulse'
                      }`}>
                        {p.status === 'COMPLETED' ? 'Aprovado' : p.status === 'EXPIRED' ? 'Cancelado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setActivePix(p)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] rounded cursor-pointer transition-colors"
                      >
                        Exibir QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 text-xs font-mono">
            Nenhuma cobrança registrada neste caixa contábil.
          </div>
        )}
      </div>

      {/* SEÇÃO COMPLETA DE SAQUES E AUDITORIA ANTIFRAUDE */}
      <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-850 space-y-5" id="withdrawal-system-section">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-450" /> 
              {user.role === 'admin' ? 'Painel de Homologação de Retiradas (MODO ADMIN)' : 'Meus Saques Solicitados & Histórico Contábil'}
            </h4>
            <p className="text-[11px] text-slate-450 mt-1">
              {user.role === 'admin' 
                ? 'Análise em tempo-real de pedidos de saques e envio de PIX. Inspecione logs robustos contra fraudes.' 
                : 'Acompanhe as suas solicitações de resgates. O saldo disponível é bloqueado preventivamente.'}
            </p>
          </div>
          <button
            onClick={fetchWithdrawals}
            className="text-[10px] font-mono bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 rounded font-black uppercase text-right border border-rose-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Sincronizar Fila
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {withdrawals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-350">
                  <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-450 font-mono">
                    <tr>
                      {user.role === 'admin' && <th className="p-3">Destinatário</th>}
                      <th className="p-3">Valor Solicitado</th>
                      <th className="p-3">Chave PIX Informada</th>
                      <th className="p-3">Data/Hora</th>
                      <th className="p-3">Status Contábil</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/80">
                    {withdrawals.map((w) => (
                      <tr 
                        key={w.id} 
                        onClick={() => {
                          setSelectedWithdrawal(w);
                          fetchAuditsForWithdrawal(w.id);
                        }}
                        className={`hover:bg-slate-900/50 cursor-pointer transition-all ${
                          selectedWithdrawal?.id === w.id ? 'bg-rose-950/15 border-l-2 border-rose-500' : ''
                        }`}
                      >
                        {user.role === 'admin' && (
                          <td className="p-3">
                            <span className="font-bold text-slate-200 block">{w.userName}</span>
                            <span className="text-[9px] text-slate-500 block font-mono">{w.userEmail}</span>
                          </td>
                        )}
                        <td className="p-3 font-mono font-bold text-white text-[13px]">R$ {Number(w.amountBRL).toFixed(2)}</td>
                        <td className="p-3">
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono block w-max">
                            {w.pixKeyType}: {w.pixKey}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-500 text-[10px]">{new Date(w.createdAt).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold flex items-center gap-1 w-max ${
                            w.status === 'COMPLETED'
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                              : w.status === 'REJECTED'
                              ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                              : 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 animate-pulse'
                          }`}>
                            {w.status === 'COMPLETED' ? '● Pago (PIX enviado)' : w.status === 'REJECTED' ? '● Recusado (Estornado)' : '⏳ Sob Auditoria (Bloqueado)'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            className="text-[9px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 px-2.5 py-1 rounded cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWithdrawal(w);
                              fetchAuditsForWithdrawal(w.id);
                            }}
                          >
                            Trace Logs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500 text-xs font-mono bg-slate-900/10 border border-dashed border-slate-850 rounded-xl">
                Nenhuma solicitação de saque de comissão registrada no caixa.
              </div>
            )}
          </div>

          {/* DETALHES & AUDIT LOG PANEL */}
          <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-850 text-xs space-y-4">
            <h5 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-500" /> Rastro Contábil Antifraude
            </h5>

            {selectedWithdrawal ? (
              <div className="space-y-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2 relative overflow-hidden">
                  <div className="absolute top-1 right-2 font-mono text-[8px] text-slate-600">ID: {selectedWithdrawal.id.slice(0, 10)}...</div>
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Valor Pretendido</span>
                  <p className="text-2xl font-black text-white font-mono">R$ {Number(selectedWithdrawal.amountBRL).toFixed(2)}</p>
                  
                  {user.role === 'admin' && (
                    <div className="pt-2 border-t border-slate-850/60 leading-relaxed text-[10px]">
                      <span className="text-slate-500 font-mono block uppercase text-[8px]">Beneficiário</span>
                      <strong className="text-indigo-400 block">{selectedWithdrawal.userName}</strong>
                      <span className="text-slate-500 block font-mono text-[9px]">{selectedWithdrawal.userEmail}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-850/60 leading-relaxed text-[10px]">
                    <span className="text-slate-500 font-mono block uppercase text-[8px]">Destinatário Pix</span>
                    <strong className="text-slate-300 font-mono block break-all bg-slate-950 px-2 py-1 rounded mt-0.5">{selectedWithdrawal.pixKeyType}: {selectedWithdrawal.pixKey}</strong>
                  </div>

                  {selectedWithdrawal.notes && (
                    <div className="pt-2 border-t border-slate-850/60 leading-relaxed">
                      <span className="text-slate-500 font-mono block uppercase text-[8px]">Despacho Administrativo</span>
                      <p className="text-yellow-450 font-mono bg-slate-950 p-2 rounded mt-1 border border-yellow-500/10 text-[10.5px]">
                        {selectedWithdrawal.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Audit Timeline */}
                <div className="space-y-3">
                  <h6 className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">Histórico de Auditoria do Saque (WithdrawalAudit)</h6>
                  {withdrawalAudits.length > 0 ? (
                    <div className="space-y-3 relative border-l border-slate-800 ml-2 pl-4">
                      {withdrawalAudits.map((a: any) => (
                        <div key={a.id} className="text-[10px] relative">
                          <span className={`absolute -left-[21px] top-1.5 w-1.5 h-1.5 rounded-full ring-4 ring-slate-950 ${
                            a.action === 'REQUEST' ? 'bg-indigo-500' :
                            a.action === 'BLOCKED_BALANCE' ? 'bg-amber-500' :
                            a.action === 'ADMIN_APPROVE' || a.action === 'PIX_DISPATCHED' ? 'bg-emerald-500' :
                            'bg-rose-500'
                          }`} />
                          <div className="flex justify-between items-center text-[9px] text-slate-500">
                            <span className="font-bold text-slate-300 font-mono">{a.action}</span>
                            <span className="font-mono text-[8px]">{new Date(a.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-400 mt-0.5 text-[9.5px] leading-relaxed">{a.details}</p>
                          <span className="text-[8px] text-slate-600 block font-mono">Por: {a.actorName} | IP: {a.ipAddress}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-slate-600 text-[10px] bg-slate-900/30 rounded border border-slate-850/40">
                      Nenhum timeline carregado. Clique em Trace Logs ou selecione outro saque.
                    </div>
                  )}
                </div>

                {/* Administative Action reviews */}
                {user.role === 'admin' && selectedWithdrawal.status === 'PENDING' && (
                  <div className="pt-4 border-t border-slate-850/80 space-y-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Nota de Homologação ou Motivo de Recusa</label>
                      <textarea
                        rows={2}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Insira as notas de auditoria..."
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleReviewWithdrawal('APPROVE')}
                        disabled={reviewLoading}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold rounded-lg text-[10.5px] uppercase cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-emerald-950/20"
                      >
                        ✔️ Autorizar e Simular PIX
                      </button>
                      <button
                        onClick={() => handleReviewWithdrawal('REJECT')}
                        disabled={reviewLoading}
                        className="py-2.5 bg-rose-900 hover:bg-rose-850 text-white font-mono font-bold rounded-lg text-[10.5px] uppercase cursor-pointer disabled:opacity-50 transition-all"
                      >
                        ✖️ Recusar / Estornar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600 font-mono text-[10px]">
                Toque em "Trace Logs" ou clique no item correspondente na tabela para abrir a trilha contábil do saque.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Commission Outflow & Security */}
      <h3 className="font-display font-extrabold text-[15px] text-slate-300 border-b border-slate-850 pb-2">
        💸 Canal de Saque de Comissões de Instrutores
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time compliance context column */}
        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between opacity-80 hover:opacity-100 transition-all lg:col-span-2">
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-indigo-405 uppercase flex items-center gap-1.5">
              🛡️ Governança Contábil de Alta Performance
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              O ecossistema JiuSpeak adota as melhores práticas de liquidação financeira e segurança contábil. Todas as comissões registradas no balanço operacional são conciliadas junto ao Banco Central do Brasil em contas de custódia corporativas individuais.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Disponível para Resgate</span>
                <strong className="text-lg font-mono text-emerald-400">R$ {wallet.balanceAvailableBRL.toFixed(2)}</strong>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-450 block uppercase font-mono">Total Bloqueado/Retido</span>
                <strong className="text-lg font-mono text-slate-300">R$ {wallet.balancePendingBRL.toFixed(2)}</strong>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
              * Recursos em custódia de intermediação são liberados automaticamente após 14 dias de conformidade conforme leis de gateway de pagamento brasileiras operadas sob segurança regulatória.
            </p>
          </div>
        </div>

        {/* Panel C: Execute cash withdrawal */}
        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between opacity-80 hover:opacity-100 transition-all">
          <div>
            <div className="pb-3 border-b border-slate-850/60 flex justify-between items-center">
              <h4 className="font-mono text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-rose-455" /> Saque PIX de Comissões
              </h4>
              <span className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded uppercase font-bold">WITHDRAW ENGINES</span>
            </div>
            
            <p className="text-[11px] text-slate-450 mt-2 leading-relaxed">
              Resgate as suas comissões acumuladas do saldo disponível fornecendo as informações bancárias.
            </p>

            <form onSubmit={handleSimulateWithdraw} className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">Chave PIX</label>
                  <select
                    value={withdrawForm.keyType}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, keyType: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-[11px] text-slate-300 focus:outline-none"
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="Email">E-mail</option>
                    <option value="Celular">Celular</option>
                    <option value="Aleatoria">Aleatória</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">Valor do Saque</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    min="1"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-250 p-2 rounded-lg text-[11px] font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">Destinatário da Chave</label>
                <input 
                  type="text" 
                  required
                  placeholder="Insira a chave pix"
                  value={withdrawForm.pixKey}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, pixKey: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-250 p-2 rounded-lg text-[11px] font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || wallet.balanceAvailableBRL <= 0}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-350 font-bold rounded-lg text-[11px] uppercase tracking-wide cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-1 border border-slate-700/80"
              >
                💸 Sacar via PIX (Comissões)
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
