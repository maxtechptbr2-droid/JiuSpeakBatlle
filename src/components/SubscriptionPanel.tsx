import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XOctagon, 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Copy, 
  Check, 
  HelpCircle, 
  Zap,
  Clock, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../types';

interface SubscriptionPanelProps {
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  priceBRL: number;
  interval: string;
  features: string[];
  active: boolean;
}

interface CurrentSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  canceledAt?: string | null;
  autoRenew: boolean;
}

interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  amountBRL: number;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'REFUNDED';
  txid: string;
  qrCode: string;
  paidAt?: string | null;
  createdAt: string;
}

export default function SubscriptionPanel({ user, updateUser, showToast }: SubscriptionPanelProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [checkoutData, setCheckoutData] = useState<{
    subscriptionId: string;
    paymentId: string;
    txid: string;
    qrCode: string;
    qrCodeCopyPaste: string;
    amountBRL: number;
  } | null>(null);
  
  const [payingState, setPayingState] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);


  // Load plans & current status
  const loadSubscriptionInfo = async () => {
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) return;

    try {
      setLoading(true);
      // Get plans
      const plansRes = await fetch('/api/subscriptions/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const plansData = await plansRes.json();
      if (plansData.plans) {
        setPlans(plansData.plans);
      }

      // Get current sub
      const currentRes = await fetch('/api/subscriptions/current', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const currentData = await currentRes.json();
      setCurrentSub(currentData.subscription);
      setPayments(currentData.payments || []);
    } catch (err) {
      console.error('Error loading subscription info:', err);
      showToast('Erro ao carregar dados do provedor de assinaturas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionInfo();
  }, [user.subscription.type]);

  // Initiate checkout
  const handleInitiateCheckout = async (plan: Plan) => {
    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) {
      showToast('Autentique-se novamente para prosseguir.', 'error');
      return;
    }

    try {
      setCheckoutPlan(plan);
      setCheckoutData(null);

      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId: plan.id })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.activated) {
          showToast(`Plano ${plan.name} ativado com sucesso!`, 'success');
          // Re-get me
          const meRes = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const meData = await meRes.json();
          if (meData.user) {
            updateUser(meData.user);
          }
          setCheckoutPlan(null);
          loadSubscriptionInfo();
        } else {
          setCheckoutData(data);
          showToast(`Chave de cobrança para ${plan.name} gerada via PIX!`, 'info');
        }
      } else {
        showToast(data.error || 'Erro ao processar checkout.', 'error');
        setCheckoutPlan(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Erro de conexao no faturamento.', 'error');
      setCheckoutPlan(null);
    }
  };



  // Cancel automatic renewal
  const handleCancelAutoRenew = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar a renovação automática da sua assinatura? Seus benefícios continuarão ativos até a data de expiração.')) {
      return;
    }

    const token = localStorage.getItem('jiuspeak_access_token');
    if (!token) return;

    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
        
        // sync
        const meRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        if (meData.user) {
          updateUser(meData.user);
        }
        loadSubscriptionInfo();
      } else {
        showToast(data.error || 'Erro ao cancelar renovação.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao comunicar pedido de suspensão de SaaS.', 'error');
    }
  };



  const handleCopyClipboardPix = () => {
    if (!checkoutData) return;
    navigator.clipboard.writeText(checkoutData.qrCodeCopyPaste);
    setCopiedKey(true);
    showToast('Código de pagamento PIX copiado!', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5 fill-emerald-550/10" /> Ativa</span>;
      case 'PAST_DUE':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-505/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Aguardando Pix</span>;
      case 'CANCELED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-slate-400 border border-slate-750"><XOctagon className="w-3.5 h-3.5" /> Cancelada</span>;
      case 'EXPIRED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/10 text-rose-450 border border-rose-500/20"><AlertTriangle className="w-3.5 h-3.5" /> Expirada</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6" id="subscription-management-panel">
      
      {/* SaaS Main Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800/80 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" /> JiuSpeak SaaS Premium
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight leading-none">
              Nível da sua conta: <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-230">{user.subscription.type}</span>
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl">
              Descubra técnicas avançadas do tatame, desafie oponentes infinitamente e receba consultorias digitais premium do nosso assistente de IA Gemini.
            </p>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px] bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Assinatura Atual</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 text-base">{user.subscription.type}</span>
              {currentSub ? getStatusBadge(currentSub.status) : <span className="text-[11px] text-slate-400">Gratuito</span>}
            </div>
            {currentSub && currentSub.status === 'ACTIVE' && (
              <div className="text-[10px] text-slate-400 font-mono space-y-1.5 pt-2 border-t border-slate-800/60">
                <div className="flex justify-between">
                  <span>Vencimento:</span>
                  <span className="text-slate-200">{new Date(currentSub.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Renova auto:</span>
                  <span className={currentSub.autoRenew ? "text-emerald-400 font-bold" : "text-amber-500"}>
                    {currentSub.autoRenew ? "Sim" : "Não"}
                  </span>
                </div>
              </div>
            )}
            
            {currentSub && currentSub.status === 'ACTIVE' && currentSub.autoRenew && (
              <button
                onClick={handleCancelAutoRenew}
                className="mt-2 text-center text-[10px] text-rose-450 hover:text-rose-350 hover:underline font-mono"
              >
                Desativar Renovação Automática
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-slate-400 font-mono text-xs">Acessando central de cobrança do JiuSpeak...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Comparison Cards Grid */}
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">Planos Disponíveis</h3>
              <p className="text-xs text-slate-500">Mude de faixa a qualquer momento! Selecione o ideal para a sua rotina de treinamento.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => {
                const isActivePlan = user.subscription.type.toUpperCase() === p.name.toUpperCase();
                return (
                  <div 
                    key={p.id}
                    className={`relative flex flex-col justify-between rounded-xl p-6 border transition-all ${
                      isActivePlan 
                        ? 'bg-violet-950/20 border-violet-500 shadow-lg shadow-violet-500/5' 
                        : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isActivePlan && (
                      <span className="absolute -top-3 left-6 inline-flex items-center gap-1 bg-violet-600 text-white font-bold text-[9px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                        Ativo Atualmente
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-display font-black text-white">{p.name}</h4>
                        <p className="text-slate-403 text-xs mt-1.5 leading-relaxed min-h-[40px]">{p.description}</p>
                      </div>

                      <div className="flex items-baseline gap-1 py-1">
                        <span className="text-2xl font-black text-white font-mono">R$ {Number(p.priceBRL).toFixed(2)}</span>
                        <span className="text-slate-500 font-mono text-xs">/ mês</span>
                      </div>

                      <ul className="space-y-2 pt-2 border-t border-slate-850">
                        {p.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-350">
                            <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      {isActivePlan ? (
                        <button
                          disabled
                          className="w-full py-2.5 text-xs font-bold rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300 font-mono"
                        >
                          Plano Vigente
                        </button>
                      ) : p.name === 'FREE' ? (
                        <button
                          onClick={() => handleInitiateCheckout(p)}
                          className="w-full py-2.5 text-xs font-bold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 font-mono transition-all"
                        >
                          Voltar ao Gratuito
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInitiateCheckout(p)}
                          className="w-full py-2.5 text-xs font-bold rounded-lg bg-violet-700 hover:bg-violet-600 text-white font-mono shadow-md shadow-violet-500/10 transition-all"
                        >
                          Assinar {p.name}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulated PIX QR Code Modal Checkout container */}
          {checkoutPlan && checkoutData && (
            <div className="rounded-xl border border-violet-500 bg-violet-950/15 p-6 animate-fadeIn space-y-6">
              <div className="flex items-center justify-between border-b border-violet-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-xl">
                    🥋
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Fatura de Contratação: Plano JiuSpeak {checkoutPlan.name}</h4>
                    <span className="text-[10px] text-violet-350 font-mono">ID de Transação: {checkoutData.txid}</span>
                  </div>
                </div>

                <button 
                  onClick={() => { setCheckoutPlan(null); setCheckoutData(null); }}
                  className="text-xs text-slate-500 hover:text-slate-300 pointer font-mono"
                >
                  [Cancelar Fatura]
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                {/* QR code block */}
                <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg border border-slate-200">
                  <div className="w-40 h-40 flex items-center justify-center bg-slate-100 rounded-lg relative overflow-hidden">
                    <QrCode className="w-28 h-28 text-slate-805" />
                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/10 backdrop-blur-[1px] font-mono text-[9px] text-indigo-900 font-semibold uppercase text-center p-2 leading-tight">
                      Pix QR Code Oficial
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase tracking-wide">Pague usando seu app do banco</span>
                </div>

                {/* Billing Data details */}
                <div className="space-y-4 md:col-span-2">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Dados Pix Copia e Cola</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={checkoutData.qrCodeCopyPaste}
                        className="flex-1 bg-slate-900/90 border border-slate-800 rounded px-3 py-1.5 text-[10px] font-mono text-slate-350 select-all focus:outline-none"
                      />
                      <button
                        onClick={handleCopyClipboardPix}
                        className="bg-slate-900 border border-slate-800 text-slate-300 px-3 hover:bg-slate-850 hover:text-white rounded transition-colors text-xs flex items-center gap-1.5"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-3 pt-2 bg-slate-900/45 p-4 rounded-lg border border-slate-850">
                    <div>
                      <span className="text-slate-500 font-mono text-[8px] uppercase tracking-wider block">Valor a ser Pago</span>
                      <p className="text-xl font-mono font-black text-white">R$ {checkoutData.amountBRL.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-550/20 px-4 py-2.5 rounded-lg text-slate-350 max-w-sm">
                      <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                      <div className="text-[10px] leading-tight">
                        <strong className="text-white block uppercase font-mono text-[9px] text-indigo-305 tracking-wider mb-0.5">Aguardando Liquidação PIX</strong>
                        O gateway está monitorando o Banco Central em tempo real para ativar seus privilégios SaaS.
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Account Invoices Receipts list */}
          <div className="bg-slate-950/40 rounded-xl border border-slate-900 p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" /> Histórico de Recibos & Faturas de SaaS
            </h4>

            {payments.length === 0 ? (
              <p className="text-[11px] text-slate-500 font-mono italic">Nenhum histórico de faturamento localizado na plataforma ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-left text-slate-400">
                  <thead className="bg-slate-900/60 text-slate-500 uppercase text-[9px] border-b border-slate-850">
                    <tr>
                      <th className="p-2.5">Datafatura</th>
                      <th className="p-2.5">Código PIX</th>
                      <th className="p-2.5">Preço</th>
                      <th className="p-2.5">Estado</th>
                      <th className="p-2.5">Liquidação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-slate-900 hover:bg-slate-900/15">
                        <td className="p-2.5">{new Date(invoice.createdAt).toLocaleDateString()} {new Date(invoice.createdAt).toLocaleTimeString()}</td>
                        <td className="p-2.5 text-slate-500 max-w-[150px] truncate" title={invoice.txid}>{invoice.txid || 'N/A'}</td>
                        <td className="p-2.5 text-slate-200 font-bold">R$ {Number(invoice.amountBRL).toFixed(2)}</td>
                        <td className="p-2.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            invoice.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-[10px] text-slate-450">{invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'Aguardando'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
