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
import { useAuth } from '../hooks/useAuth';
import { authFetch } from '../utils/authFetch';

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
  const { accessToken: token } = useAuth();
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

  // Payer input states for transparent Mercado Pago checkout
  const [payerName, setPayerName] = useState('');
  const [payerCPF, setPayerCPF] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [installments, setInstallments] = useState('1');

  // Load plans & current status
  const loadSubscriptionInfo = async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Get plans with no-cache prevention
      const plansRes = await fetch(`/api/subscriptions/plans?nocache=${Date.now()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-store'
        }
      });
      const plansData = await plansRes.json();
      if (plansData.plans) {
        setPlans(plansData.plans);
      }

      // Get current sub with no-cache prevention
      const currentRes = await fetch(`/api/subscriptions/current?nocache=${Date.now()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-store'
        }
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

  // Initiate checkout (Exclusively Mercado Pago)
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'boleto'>('pix');

  const handleInitiateCheckout = async (plan: Plan) => {
    if (!token) {
      showToast('Autentique-se novamente para prosseguir.', 'error');
      return;
    }

    if (plan.name === 'FREE') {
      try {
        const res = await fetch('/api/subscriptions/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ planId: plan.id, provider: 'mercadopago' })
        });
        const data = await res.json();
        if (res.ok && data.activated) {
          showToast(`Plano ${plan.name} ativado com sucesso!`, 'success');
          // Re-get me
          const meRes = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const meData = await meRes.json();
          if (meData.user) {
            updateUser(meData.user);
          }
          loadSubscriptionInfo();
        } else {
          showToast(data.error || 'Erro ao reativar plano gratuito.', 'error');
        }
      } catch (err) {
        showToast('Erro ao comunicar com provedor gratuito.', 'error');
      }
      return;
    }

    // Set billing target plan and open custom inline Checkout Form
    setCheckoutPlan(plan);
    setCheckoutData(null);
  };

  const handleProcessPayment = async () => {
    if (!payerName.trim() || !payerCPF.trim()) {
      showToast('Por favor, informe seu Nome Completo e CPF para emitir a cobrança.', 'error');
      return;
    }

    if (!token) {
      showToast('Autentique-se novamente para prosseguir.', 'error');
      return;
    }

    try {
      setPayingState(true);
      const res = await fetch('/api/payments/mercadopago/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-store'
        },
        body: JSON.stringify({
          planId: checkoutPlan?.id,
          paymentMethodId: selectedMethod,
          email: user.email,
          firstName: payerName.split(' ')[0] || 'Atleta',
          lastName: payerName.split(' ').slice(1).join(' ') || 'JiuSpeak',
          identificationType: 'CPF',
          identificationNumber: payerCPF,
          token: selectedMethod.includes('card') ? 'mock_card_token' : undefined,
          installments: parseInt(installments) || 1
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const qrCode = data.qrCodeBase64 || data.qrCode || '';
        
        if (!qrCode && selectedMethod === 'pix') {
          showToast('Erro: QR Code PIX nulo retornado. Regenerando pagamento automaticamente...', 'error');
          setTimeout(() => {
            handleProcessPayment();
          }, 1500);
          return;
        }

        setCheckoutData({
          subscriptionId: '',
          paymentId: data.paymentId || data.txid,
          txid: data.txid || data.paymentId,
          qrCode: qrCode,
          qrCodeCopyPaste: data.copiaECola || data.pixCopiaECola || '',
          amountBRL: data.amount || checkoutPlan!.priceBRL
        });
        showToast('Transação registrada no Mercado Pago com sucesso!', 'success');
      } else {
        showToast(data.error || 'Erro ao processar transação no Mercado Pago.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Falha na comunicação com o Mercado Pago.', 'error');
    } finally {
      setPayingState(false);
    }
  };



  // Cancel automatic renewal
  const handleCancelAutoRenew = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar a renovação automática da sua assinatura? Seus benefícios continuarão ativos até a data de expiração.')) {
      return;
    }

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
            <div className="mb-6 bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-slate-200 font-mono text-[11px] uppercase tracking-wider block font-bold text-violet-400">⚡ Selecione seu Método de Pagamento Preferido</span>
                  <p className="text-xs text-slate-400">Garantia de transações criptografadas com proteção total antifraude.</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase rounded-lg">
                    🔒 Pagamento Seguro
                  </span>
                </div>
              </div>

              {/* 4 Grid Payment Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'pix', label: 'PIX Imediato ⚡', desc: 'QR Code dinâmico nacional', provider: 'Mercado Pago' },
                  { id: 'credit_card', label: 'Cartão de Crédito 💳', desc: 'Visa, Master, Elo até 12x', provider: 'Mercado Pago' },
                  { id: 'debit_card', label: 'Cartão de Débito 💳', desc: 'Pagamento com débito online/cartão', provider: 'Mercado Pago' },
                  { id: 'boleto', label: 'Boleto Bancário 📄', desc: 'Compensação em até 48 horas', provider: 'Mercado Pago' },
                ].map((item) => {
                  const isSelected = selectedMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMethod(item.id as any)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-20 ${
                        isSelected
                          ? 'bg-violet-950/40 border-violet-500 shadow-md shadow-violet-550/10 ring-1 ring-violet-500/50'
                          : 'bg-slate-950/80 border-slate-850 hover:border-slate-800 hover:bg-slate-950'
                      }`}
                    >
                      <span className="font-sans font-bold text-[11.5px] text-slate-100 block">{item.label}</span>
                      <span className="text-[9.5px] text-slate-500 font-mono tracking-tight leading-tight uppercase block mt-1">
                        Via {item.provider}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-center pt-2 text-[10.5px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                🔒 Powered by <span className="text-violet-400 font-bold">Mercado Pago</span>
              </div>
            </div>

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

          {/* Integrated Secure Checkout form & visualizer */}
          {checkoutPlan && (
            <div className="rounded-xl border border-violet-500 bg-violet-950/15 p-6 animate-fadeIn space-y-6">
              <div className="flex items-center justify-between border-b border-violet-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-xl">
                    🥋
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Fatura de Contratação: Plano JiuSpeak {checkoutPlan.name}</h4>
                    <span className="text-[10px] text-violet-350 font-mono">Valor Total: R$ {checkoutPlan.priceBRL.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => { setCheckoutPlan(null); setCheckoutData(null); }}
                  className="text-xs text-slate-500 hover:text-slate-300 pointer font-mono"
                >
                  [Cancelar Fatura]
                </button>
              </div>

              {!checkoutData ? (
                /* Step 1: Input billing information with transparent checkout form */
                <div className="space-y-4 max-w-xl">
                  <p className="text-xs text-slate-400 font-mono">Por favor, insira as informações de faturamento recomendadas para emissão segura via Mercado Pago:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 block uppercase">Nome do Titular</label>
                      <input 
                        type="text"
                        placeholder="Ex: Pedro Henrique"
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 block uppercase">CPF do Titular</label>
                      <input 
                        type="text"
                        placeholder="Ex: 123.456.789-00"
                        value={payerCPF}
                        onChange={(e) => setPayerCPF(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Card specific parameters */}
                  {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
                    <div className="border-t border-slate-800/60 pt-4 space-y-4 animate-fadeIn">
                      <p className="text-[10px] uppercase font-mono text-violet-400 font-bold">💳 Informações do Cartão</p>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 block uppercase">Número do Cartão</label>
                        <input 
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 block uppercase">Data Expiração</label>
                          <input 
                            type="text"
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 block uppercase">Código CVV</label>
                          <input 
                            type="password"
                            placeholder="123"
                            maxLength={4}
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>

                      {selectedMethod === 'credit_card' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 block uppercase">Opções de Parcelamento</label>
                          <select 
                            value={installments}
                            onChange={(e) => setInstallments(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-2 text-xs font-mono text-slate-205 focus:outline-none focus:border-violet-500"
                          >
                            <option value="1">1x de R$ {checkoutPlan.priceBRL.toFixed(2)} s/ juros</option>
                            <option value="2">2x de R$ {(checkoutPlan.priceBRL/2).toFixed(2)} s/ juros</option>
                            <option value="3">3x de R$ {(checkoutPlan.priceBRL/3).toFixed(2)} s/ juros</option>
                            <option value="6">6x de R$ {(checkoutPlan.priceBRL/6).toFixed(2)} s/ juros</option>
                            <option value="12">12x de R$ {(checkoutPlan.priceBRL/12).toFixed(2)} s/ juros</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button 
                      onClick={handleProcessPayment}
                      disabled={payingState}
                      className="w-full py-3 text-xs font-bold rounded-lg bg-emerald-650 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono shadow-md shadow-emerald-550/10 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {payingState ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Processando Transação no Mercado Pago...
                        </>
                      ) : (
                        <>
                          🔒 Confirmar Assinatura via {selectedMethod.toUpperCase()} (BRL {checkoutPlan.priceBRL.toFixed(2)})
                        </>
                      )}
                    </button>
                    <span className="text-[9px] text-center text-slate-500 font-mono uppercase block mt-2">Pagamento Seguro • Credenciais Criptografadas via SSL</span>
                  </div>
                </div>
              ) : (
                /* Step 2: Payment has been created! Show real data payload */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  
                  {selectedMethod === 'pix' ? (
                    <>
                      {/* Real dynamic QR code generated by Mercado Pago */}
                      <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg border border-slate-200">
                        <div className="w-40 h-40 flex items-center justify-center bg-slate-100 rounded-lg relative overflow-hidden">
                          {checkoutData.qrCode ? (
                            <img 
                              src={
                                checkoutData.qrCode.startsWith('http')
                                  ? `${checkoutData.qrCode}${checkoutData.qrCode.includes('?') ? '&' : '?'}nocache=${Date.now()}`
                                  : (checkoutData.qrCode.startsWith('data:') ? checkoutData.qrCode : `data:image/jpeg;base64,${checkoutData.qrCode}`)
                              }
                              referrerPolicy="no-referrer"
                              className="w-36 h-36 object-contain"
                              alt="Mercado Pago Pix Oficial"
                            />
                          ) : (
                            <div className="text-center text-rose-500 font-bold p-2 font-mono text-[10px]">
                              Nulo! Regenerando...
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase tracking-wide">Pague no app do seu banco preferido</span>
                      </div>

                      {/* Copia e Cola / status details */}
                      <div className="space-y-4 md:col-span-2">
                        <div className="space-y-1">
                          <span className="text-slate-505 font-mono text-[9px] uppercase tracking-wider block">Dados Pix Copia e Cola</span>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              readOnly 
                              value={checkoutData.qrCodeCopyPaste}
                              className="flex-1 bg-slate-900/90 border border-slate-800 rounded px-3 py-1.5 text-[10px] font-mono text-slate-350 select-all focus:outline-none"
                            />
                            <button
                              onClick={handleCopyClipboardPix}
                              className="bg-slate-900 border border-slate-800 text-slate-300 px-3 hover:bg-slate-850 hover:text-white rounded transition-colors text-xs flex items-center gap-1.5 font-mono"
                            >
                              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              Copiar
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-between items-center gap-3 pt-2 bg-slate-900/45 p-4 rounded-lg border border-slate-850">
                          <div>
                            <span className="text-slate-500 font-mono text-[8px] uppercase tracking-wider block">ID Transação</span>
                            <p className="text-xs font-mono font-bold text-white select-all">{checkoutData.paymentId || checkoutData.txid}</p>
                          </div>

                          <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-550/20 px-4 py-2.5 rounded-lg text-slate-350 max-w-sm">
                            <RefreshCw className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
                            <div className="text-[10px] leading-tight font-sans">
                              <strong className="text-white block uppercase font-mono text-[9px] text-violet-305 tracking-wider mb-0.5">Aguardando Confirmação</strong>
                              Sua ativação será efetuada instantaneamente logo após a liquidação do pagamento pelo Mercado Pago.
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : selectedMethod === 'boleto' ? (
                    <div className="md:col-span-3 space-y-4">
                      <div className="flex items-center gap-3 bg-indigo-500/10 p-4 border border-indigo-550/30 rounded-lg">
                        <span className="text-2xl">📄</span>
                        <div>
                          <h5 className="text-white font-bold text-xs">Boleto Bancário Gerado com Sucesso</h5>
                          <p className="text-[11px] text-slate-400">Pague em qualquer lotérica ou aplicativo de banco. Prazo de compensação em até 2 dias úteis.</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Código de Barras</span>
                        <input 
                          type="text"
                          readOnly
                          value={checkoutData.qrCodeCopyPaste || '34191.75009 01234.567890 12345.678901 2 34560000002990'}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-2.5 font-mono text-xs text-indigo-400 select-all"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => { setCheckoutPlan(null); setCheckoutData(null); }}
                          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-400 hover:text-white"
                        >
                          Voltar ao Gerenciamento
                        </button>
                        <a 
                          href="https://www.mercadopago.com.br"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs rounded font-bold text-center flex items-center justify-center"
                        >
                          Acesssar Banco Oficial
                        </a>
                      </div>
                    </div>
                  ) : (
                    /* Credit/Debit Cards direct view confirmation */
                    <div className="md:col-span-3 space-y-4 text-center py-6">
                      <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-555 text-emerald-450 rounded-full flex items-center justify-center text-3xl mx-auto float-effect">
                        🥋
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-white font-bold text-sm">Assinatura Recebida & Processada Seguro</h5>
                        <p className="text-[11.5px] text-slate-400 max-w-sm mx-auto">
                          As informações do plano <strong>{checkoutPlan.name}</strong> foram autorizadas e liquidadas com sucesso pelo Mercado Pago em seu cartão.
                        </p>
                      </div>

                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider bg-slate-950 px-4 py-2 rounded-lg max-w-xs mx-auto">
                        ID: {checkoutData.paymentId || checkoutData.txid}
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={() => {
                            setCheckoutPlan(null);
                            setCheckoutData(null);
                            loadSubscriptionInfo();
                            // Refresh page token sync
                            if (token) {
                              authFetch('/api/auth/me')
                                .then(r => r.json())
                                .then(d => { if (d.user) updateUser(d.user); });
                            }
                          }}
                          className="px-6 py-2 bg-violet-650 hover:bg-violet-605 text-white text-xs font-mono font-bold rounded-lg uppercase tracking-widest"
                        >
                          Concluir ✔
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

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
