import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle,
  Coins,
  Cpu,
  Zap,
  Sparkles,
  MessageSquare,
  Volume2,
  Mic,
  ArrowRight,
  BookmarkCheck,
  CreditCard,
  Tv
} from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';

interface SubscriptionPanelProps {
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface JtPackage {
  id: string;
  name: string;
  jtAmount: number;
  priceBRL: number;
  description: string;
  badge?: string;
  gradient: string;
}

export default function SubscriptionPanel({ user, updateUser, showToast }: SubscriptionPanelProps) {
  const { accessToken: token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activatingAi, setActivatingAi] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<JtPackage | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  
  const [checkoutData, setCheckoutData] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeCopyPaste: string;
    amountBRL: number;
    jtAmount: number;
  } | null>(null);

  const [pollingStatus, setPollingStatus] = useState<string>('pending');

  useEffect(() => {
    if (!checkoutData || !token) {
      setPollingStatus('pending');
      return;
    }

    let intervalId: any;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status/${checkoutData.paymentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && (data.status === 'approved' || data.status === 'completed' || data.processed)) {
            setPollingStatus('approved');
            showToast(`Pagamento de ${checkoutData.jtAmount} JT Aprovado!`, 'success');
            
            // Refresh balance
            const meRes = await fetch('/api/auth/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const meData = await meRes.json();
            if (meData.user) {
              updateUser(meData.user);
            }
            
            clearInterval(intervalId);
            setTimeout(() => {
              setCheckoutData(null);
              setSelectedPackage(null);
            }, 4000);
          }
        }
      } catch (err) {
        console.warn('Erro ao verificar status do PIX:', err);
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [checkoutData, token]);

  // New gamer AAA Packages as requested by instructions
  const jtPackages: JtPackage[] = [
    {
      id: '500jt',
      name: 'Pacote Faixa Branca',
      jtAmount: 500,
      priceBRL: 5.00,
      description: 'Ideal para um início básico e experimentar os diálogos táticos.',
      gradient: 'from-slate-900 via-slate-950 to-slate-900 border-slate-800 shadow-slate-950/40 hover:border-violet-500/50 hover:shadow-violet-950/20'
    },
    {
      id: '1200jt',
      name: 'Pacote Faixa Azul',
      jtAmount: 1200,
      priceBRL: 10.05,
      description: 'Excelente custo-benefício com 20% de bônus extra de JT incluso.',
      badge: '20% EXTRA',
      gradient: 'from-blue-950/30 via-slate-950 to-slate-900 border-blue-900/40 shadow-blue-950/20 hover:border-blue-500 hover:shadow-blue-500/20'
    },
    {
      id: '2500jt',
      name: 'Pacote Faixa Roxa',
      jtAmount: 2500,
      priceBRL: 20.00,
      description: 'Quantidade exata para ativar 1 mês inteiro de IA Conversacional.',
      badge: 'Recomendado IA',
      gradient: 'from-purple-950/40 via-slate-950 to-slate-900 border-purple-900/40 shadow-purple-950/35 hover:border-purple-500 hover:shadow-purple-500/25'
    },
    {
      id: '5000jt',
      name: 'Pacote Faixa Marrom',
      jtAmount: 5000,
      priceBRL: 35.00,
      description: 'Economia ideal para atletas focados no aprendizado avançado tático.',
      badge: 'Melhor Custo',
      gradient: 'from-amber-950/30 via-slate-950 to-slate-900 border-amber-900/40 shadow-amber-950/20 hover:border-amber-500 hover:shadow-amber-500/25'
    },
    {
      id: '12000jt',
      name: 'Pacote Faixa Preta',
      jtAmount: 12000,
      priceBRL: 75.00,
      description: 'O ápice da economia de JiuTickets para lutadores de elite.',
      badge: 'Elite Valiosa',
      gradient: 'from-emerald-950/30 via-slate-940 to-slate-950 border-emerald-900/40 shadow-emerald-950/20 hover:border-emerald-500 hover:shadow-emerald-500/30'
    }
  ];

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'bolbradesco'>('pix');
  const [cpf, setCpf] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);

  const handleBuyPackage = (pack: JtPackage) => {
    setSelectedPackage(pack);
    setCheckoutData(null);
    setPollingStatus('pending');
  };

  const handleGeneratePayment = async () => {
    if (!token || !selectedPackage) {
      showToast('Autentique-se novamente para prosseguir.', 'error');
      return;
    }

    if ((paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (!cardHolder || !cardNumber || !cardExpiry || !cardCvv || !cpf)) {
      showToast('Preencha os dados do cartão de crédito/débito e CPF.', 'error');
      return;
    }

    if (paymentMethod === 'bolbradesco' && !cpf) {
      showToast('Por favor, informe seu CPF para emissão do boleto bancário.', 'error');
      return;
    }

    try {
      setLoading(true);
      setCheckoutData(null);
      setPollingStatus('pending');

      const bodyPayload: any = {
        packageId: selectedPackage.id,
        paymentMethodId: paymentMethod,
        identificationType: 'CPF',
        identificationNumber: cpf.replace(/\D/g, '')
      };

      if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
        bodyPayload.installments = installments;
        bodyPayload.payerFirstName = cardHolder.split(' ')[0] || 'Atleta';
        bodyPayload.payerLastName = cardHolder.split(' ').slice(1).join(' ') || 'JiuSpeak';
        bodyPayload.token = 'mock_card_token_' + Math.random().toString(36).substring(7);
      }

      const res = await fetch('/api/payments/mercadopago/create-jt-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutData({
          paymentId: data.paymentId,
          qrCode: data.qrCodeBase64 || '',
          qrCodeCopyPaste: data.pixCopiaECola || '',
          amountBRL: data.amount,
          jtAmount: selectedPackage.jtAmount
        });

        if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
          if (data.status === 'approved' || data.status === 'completed') {
            setPollingStatus('approved');
            showToast(`Pagamento do Pacote ${selectedPackage.name} Aprovado!`, 'success');
            
            // Refresh User Balance State
            const meRes = await fetch('/api/auth/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const meData = await meRes.json();
            if (meData.user) {
              updateUser(meData.user);
            }
            setTimeout(() => {
              setCheckoutData(null);
              setSelectedPackage(null);
            }, 5000);
          } else {
            setPollingStatus('in_process');
            showToast('Pagamento com cartão em análise de crédito.', 'info');
          }
        } else if (paymentMethod === 'bolbradesco') {
          showToast('Boleto Bancário emitido com sucesso!', 'success');
        } else {
          showToast('Chave PIX e QR Code emitidos. Aguardando compensação...', 'success');
        }
      } else {
        showToast(data.error || 'Erro ao gerar checkout de JiuTickets.', 'error');
      }
    } catch (err: any) {
      showToast('Falha na comunicação com o checkout.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAi = async () => {
    if (!token) return;
    try {
      setActivatingAi(true);
      const res = await fetch('/api/conversational/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
        // Refresh profile
        const meRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        if (meData.user) {
          updateUser(meData.user);
        }
      } else {
        showToast(data.error || 'Erro ao ativar conversação com IA.', 'error');
      }
    } catch (err) {
      showToast('Erro de comunicação para ativação de IA.', 'error');
    } finally {
      setActivatingAi(false);
    }
  };

  const handleCopyClipboardPix = () => {
    if (!checkoutData) return;
    navigator.clipboard.writeText(checkoutData.qrCodeCopyPaste);
    setCopiedKey(true);
    showToast('Código de pagamento copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const formatDateString = (iso: string | undefined): string => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR');
    } catch (e) {
      return '-';
    }
  };

  const isAiActive = (): boolean => {
    if (!user.aiConversationExpiresAt) return false;
    const expiry = new Date(user.aiConversationExpiresAt);
    return expiry.getTime() > Date.now();
  };

  // Safely formulate image src for PIX base64 or url fallback as requested
  const getQrCodeImageSrc = () => {
    if (!checkoutData || !checkoutData.qrCode) {
      // Dynamic fallback if QR is empty/failed using external API
      if (checkoutData && checkoutData.qrCodeCopyPaste) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkoutData.qrCodeCopyPaste)}`;
      }
      return '';
    }
    const q = checkoutData.qrCode;
    if (q.startsWith('http') || q.startsWith('data:')) {
      return q;
    }
    // Prepend standard base-64 schema to display official RAW MP Base64 image
    return `data:image/png;base64,${q}`;
  };

  return (
    <div id="central-jiutickets-hub" className="max-w-6xl mx-auto space-y-8 p-1 sm:p-4">
      
      {/* HEADER: GAMER TITLE & SALDO (No-SaaS Premium, purely virtual economy with aesthetic layout) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black tracking-widest bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20 uppercase">
            ⚡ Nova Economia JiuSpeak Battle
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Central de JiuTickets
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Adquira moedas virtuais (JT) para desbloquear itens cosméticos raros na Loja ou habilitar seu Sparring Verbal com Inteligência Artificial.
          </p>
        </div>

        {/* Current JT Balance Container (Fortnite V-bucks style box) */}
        <div className="bg-slate-900/90 border-2 border-amber-500/20 p-5 rounded-2xl flex items-center gap-4 min-w-[240px] relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-lg pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20 transform group-hover:rotate-12 transition-transform duration-300">
            🪙
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Sua Carteira de JT</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-400 tracking-tight drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                {Number(user.coins || 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-black text-amber-500 uppercase font-mono">JT</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECHARGE SECURE CHECKOUT DRAWER OPTION */}
      {selectedPackage && (
        <div id="checkout-container-gate" className="bg-slate-950 border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-6 relative animate-fadeIn shadow-2xl shadow-indigo-950/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <button 
            type="button"
            onClick={() => { setSelectedPackage(null); setCheckoutData(null); }}
            className="absolute top-4 right-4 px-3 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ← Voltar ao Catálogo
          </button>

          <div className="text-center sm:text-left space-y-1 border-b border-slate-850 pb-5">
            <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider flex items-center gap-1 justify-center sm:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" /> Checkout Transparente Homologado
            </span>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Efetuar Recarga Segura</h2>
            <p className="text-xs text-slate-400">
              Assinatura: <span className="text-amber-400 font-bold">{selectedPackage.name}</span> • <span className="text-amber-500 font-bold">{selectedPackage.jtAmount.toLocaleString()} JT</span> por <span className="text-emerald-400 font-bold font-mono">R$ {selectedPackage.priceBRL.toFixed(2)}</span>.
            </p>
          </div>

          {!checkoutData ? (
            /* PASSO 1: CHOOSING METHOD AND FILLING CARD/CPF FIELDS */
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'pix', label: 'Pix Instantâneo', icon: '⚡' },
                  { value: 'credit_card', label: 'Cartão de Crédito', icon: '💳' },
                  { value: 'debit_card', label: 'Cartão de Débito', icon: '🏦' },
                  { value: 'bolbradesco', label: 'Boleto Bancário', icon: '📄' }
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value as any)}
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === m.value 
                        ? 'border-indigo-500 bg-indigo-500/10 text-white font-extrabold shadow-md' 
                        : 'border-slate-850 bg-slate-900/60 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-[10px] uppercase tracking-wider block font-bold leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* CARD DETAILS FORM */}
              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                <div className="bg-slate-900/70 border border-slate-850 p-5 rounded-2xl gap-6 grid md:grid-cols-2 items-center animate-slideUp">
                  
                  {/* Visual Premium Mock Card (Interactiveness AAA quality) */}
                  <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/30 p-6 rounded-2xl space-y-6 relative overflow-hidden shadow-xl min-h-[175px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl" />
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-black uppercase text-indigo-400 tracking-widest">JiuSpeak Premium Member</span>
                      <CreditCard className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[9px] font-bold block uppercase tracking-wider">Número do Cartão</span>
                      <span className="text-white text-base font-bold font-mono tracking-widest block">
                        {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[8px] font-bold block uppercase">Titular</span>
                        <span className="text-slate-200 text-[10px] font-mono uppercase truncate max-w-[140px]">
                          {cardHolder || 'NOME DO ATLETA'}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[8px] font-bold block uppercase">Venc.</span>
                          <span className="text-slate-200 text-[10px] font-mono">
                            {cardExpiry || 'MM/YY'}
                          </span>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-slate-400 text-[8px] font-bold block uppercase">CVV</span>
                          <span className="text-slate-200 text-[10px] font-mono">
                            {cardCvv || '•••'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input form fields */}
                  <div className="space-y-3.5 text-left text-xs">
                    <div className="grid grid-cols-12 gap-3.5">
                      <div className="col-span-12">
                        <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Nome Completo do Titular (conforme cartão)</label>
                        <input 
                          type="text" 
                          placeholder="EX: CLAN JIUSPEAK ATHLETE" 
                          value={cardHolder} 
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white font-semibold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="col-span-12">
                        <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Número do Cartão de Crédito/Débito</label>
                        <input 
                          type="text" 
                          maxLength={16}
                          placeholder="EX: 4111222233334444" 
                          value={cardNumber} 
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white font-mono font-semibold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="col-span-6">
                        <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Validade (MM/YY)</label>
                        <input 
                          type="text" 
                          maxLength={5}
                          placeholder="09/29" 
                          value={cardExpiry} 
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white font-mono font-semibold text-center focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="col-span-6">
                        <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Cód. Segurança (CVV)</label>
                        <input 
                          type="text" 
                          maxLength={4}
                          placeholder="123" 
                          value={cardCvv} 
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white font-mono font-semibold text-center focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-12">
                        <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Parcelas (Installments)</label>
                        <select 
                          value={installments} 
                          onChange={(e) => setInstallments(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 px-3.5 text-slate-200 font-semibold focus:border-indigo-500 focus:outline-none"
                        >
                          <option value={1}>1x de R$ {selectedPackage.priceBRL.toFixed(2)} sem juros</option>
                          <option value={2}>2x de R$ {(selectedPackage.priceBRL / 2).toFixed(2)} sem juros</option>
                          <option value={3}>3x de R$ {(selectedPackage.priceBRL / 3).toFixed(2)} sem juros</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SHARED REQUIREMENT: CPF COMPLIANCE IN BRAZIL PAYMENTS */}
              {paymentMethod !== 'pix' && (
                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl text-left text-xs max-w-md mx-auto animate-fadeIn">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5 font-bold tracking-wider">🔒 CPF do Titular (Obrigatório para faturamento bancário)</label>
                  <input 
                    type="text" 
                    maxLength={14}
                    placeholder="EX: 123.456.789-00" 
                    value={cpf} 
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.2 px-3 text-white font-semibold focus:border-indigo-500 focus:outline-none font-mono"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">Sua conexão é criptografada de ponta a ponta. Obedecemos às normas de conformidade do Banco Central.</span>
                </div>
              )}

              {/* TRIGGER GENERATE BILL ACTION BUTTON */}
              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  onClick={handleGeneratePayment}
                  disabled={loading}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white hover:text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer tracking-wider"
                >
                  {loading ? 'Processando faturamento seguro...' : paymentMethod === 'pix' ? '✓ Emitir Chave PIX' : paymentMethod === 'bolbradesco' ? '✓ Emitir Boleto Bancário' : '✓ Finalizar Pagamento com Cartão'}
                </button>
              </div>
            </div>
          ) : (
            /* PASSO 2: EXTREMELY VISUALLY POLISHED INVOICE SLIP (PIX / BOLETO / CARD COMPLETED) */
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10 select-none">
              
              {paymentMethod === 'pix' && (
                <>
                  <div className="flex flex-col items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                    {getQrCodeImageSrc() ? (
                      <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-200">
                        <img 
                          src={getQrCodeImageSrc()} 
                          alt="QR Code PIX oficial" 
                          className="w-48 h-48 object-contain transition-transform" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-850 text-xs">
                        Construindo Pix dinâmico...
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono text-center leading-normal max-w-[240px]">
                      Escaneie o código QR com o app do seu banco ou copie a chave Pix ao lado.
                    </span>
                  </div>

                  <div className="space-y-5 text-left">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">Código Copia e Cola PIX</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={checkoutData.qrCodeCopyPaste} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono focus:outline-none" 
                        />
                        <button 
                          type="button"
                          onClick={handleCopyClipboardPix}
                          className="px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl active:scale-95 flex items-center justify-center transition-all cursor-pointer font-bold shrink-0"
                          title="Copiar código PIX"
                        >
                          {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-900/65 border border-amber-500/10 p-5 rounded-2xl space-y-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${pollingStatus === 'approved' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          {pollingStatus === 'approved' ? '✓ CONFIRMADO COM SUCESSO' : '⚡ AGUARDANDO REDE BACEN...'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                        {pollingStatus === 'approved' 
                          ? 'Seu pagamento Pix foi compensado! Os JiuTickets correspondentes já foram adicionados ao seu saldo de atleta.'
                          : 'Aguardando liquidação do Pix pelo Banco Central. Identificação automática de faturas em tempo real via webhook integrado.'}
                      </p>
                      {pollingStatus === 'approved' ? (
                        <div className="py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-emerald-400 font-bold text-[10.5px] uppercase font-mono tracking-wider animate-bounce">
                          ✓ Confirmado e Creditado!
                        </div>
                      ) : (
                        <div className="py-2.5 px-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center text-amber-500 font-bold text-[10px] font-mono tracking-widest uppercase animate-pulse">
                          Aguardando webhook oficial...
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === 'bolbradesco' && (
                <>
                  <div className="flex flex-col items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5 text-center">
                    <span className="text-5xl">📄</span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Fatura de Boleto Gerada</h4>
                      <p className="text-[10px] text-slate-400 leading-normal max-w-[220px]">Efetue o pagamento através do código de barras ao lado ou visualize o boleto formal.</p>
                    </div>
                    {/* Visual Printable PDF link button */}
                    <a 
                      href="/api/payments/mock-boleto-pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase rounded-xl transition-all shadow cursor-pointer text-center"
                    >
                      📄 Visualizar Boleto em PDF
                    </a>
                  </div>

                  <div className="space-y-5 text-left">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">Linha Digitável do Código de Barras</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={checkoutData.qrCodeCopyPaste} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-indigo-200 font-mono focus:outline-none" 
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(checkoutData.qrCodeCopyPaste);
                            showToast('Código de barras copiado!', 'success');
                          }}
                          className="px-4 bg-indigo-500 hover:bg-indigo-400 text-slate-950 rounded-xl active:scale-95 flex items-center justify-center transition-all cursor-pointer font-bold shrink-0"
                          title="Copiar código de barras"
                        >
                          <Copy className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-900/65 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono text-[11px] text-slate-400">
                      <div className="flex justify-between items-center text-white font-bold mb-1">
                        <span>ESTÁGIO</span>
                        <span className="text-amber-500 uppercase">AGUARDANDO COMPENSAÇÃO</span>
                      </div>
                      <p className="leading-relaxed">A aprovação do boleto bancário acontece tradicionalmente no primeiro dia útil subsequente ao pagamento, através do sweep de reconciliação de cobranças.</p>
                      <button 
                        type="button"
                        onClick={async () => {
                          // Allow sandbox instant bypass for Boleto in manual sweep
                          try {
                            setLoading(true);
                            const response = await fetch('/api/payments/reconcile', {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const result = await response.json();
                            if (response.ok && result.success) {
                              showToast('Sweep manual executado com sucesso!', 'success');
                              setPollingStatus('approved');
                              // refresh auth balance
                              const meRes = await fetch('/api/auth/me', {
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              const meData = await meRes.json();
                              if (meData.user) {
                                updateUser(meData.user);
                              }
                            }
                          } catch (err) {
                            showToast('Erro ao rodar conciliação manual.', 'error');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="w-full mt-2 py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-center text-[10px] uppercase font-bold border border-slate-800 rounded-lg tracking-widest cursor-pointer"
                      >
                        ⚡ Simular Homologação Manual do Boleto (Sweep instantâneo)
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* CARD ACCREDITED NOTIFICATION */}
              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                <div className="col-span-2 flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl shadow-inner animate-pulse">
                    ✅
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Transação Autorizada com Sucesso!</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      A operadora do seu cartão autorizou a liberação do pacote <span className="text-amber-400 font-bold">{selectedPackage.name}</span>. Seus <span className="text-amber-500 font-bold">{selectedPackage.jtAmount.toLocaleString()} JiuTickets (JT)</span> foram carregados instantaneamente em sua carteira!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedPackage(null); setCheckoutData(null); }}
                    className="px-6 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase transition"
                  >
                    Excelente, fechar painel
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* CORE LAYOUT: DOUBLE COLUMN COMPONENT SHOP CATALOG */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN 1: COMPRAR JIUTICKETS PACKAGES (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-850 pb-3">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
            <div>
              <h2 className="text-lg font-extrabold text-white uppercase tracking-wide">Comprar JiuTickets</h2>
              <p className="text-[11px] text-slate-450">Escolha o seu pacote. Métodos disponíveis: Pix, Crédito, Débito e Boleto.</p>
            </div>
          </div>

          {/* Epic Store Grid Package list */}
          <div className="grid sm:grid-cols-2 gap-5">
            {jtPackages.map((pack) => (
              <div 
                key={pack.id}
                className={`group border rounded-2xl p-5 flex flex-col justify-between bg-gradient-to-b ${pack.gradient} transition-all duration-300 hover:-translate-y-1 relative`}
              >
                {pack.badge && (
                  <span className="absolute -top-3 left-6 px-2.5 py-0.5 text-[9px] font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-full tracking-wider border border-amber-400 shadow-lg">
                    {pack.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase block mb-1">
                      🥋 Recarga de Elite
                    </span>
                    <h3 className="text-sm font-black text-white uppercase tracking-wide group-hover:text-amber-400 transition-colors">
                      {pack.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed min-h-[36px]">
                      {pack.description}
                    </p>
                  </div>

                  {/* Quantity and value */}
                  <div className="space-y-0.5 py-1.5 border-t border-b border-slate-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">🪙</span>
                      <span className="text-2xl font-black text-white tracking-tight">
                        {pack.jtAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-amber-500 uppercase">JT</span>
                    </div>
                    <span className="text-sm font-black text-emerald-450 font-mono">
                      R$ {pack.priceBRL.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Purchase buttons */}
                <div className="mt-4 pt-1">
                  <button
                    onClick={() => handleBuyPackage(pack)}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-xs font-black uppercase tracking-wider text-white hover:text-emerald-400 transition-all cursor-pointer active:scale-95"
                  >
                    Adquirir Pacote
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Game-like Store Warning rules (No play generation of JTs) */}
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-start gap-3">
            <span className="text-base">⚠️</span>
            <div className="space-y-0.5">
              <h5 className="text-[11px] font-bold text-slate-350 uppercase">Políticas da Virtuconomia</h5>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                Atenção: Os usuários do JiuSpeak <strong>não ganham JiuTickets jogando, estudando ou praticando lições</strong>. JTs são moedas premium exclusivas adquiridas por compra direta para manter e customizar avatares e habilitar o Sparring de IA. Todos os cosméticos do marketplace aceitam apenas JT.
              </p>
            </div>
          </div>
        </div>

        {/* COLUMN 2: EXPERT AI CONVERSATIONAL ASSISTANT SECTION (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-850 pb-3">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            <div>
              <h2 className="text-lg font-extrabold text-white uppercase tracking-wide">Inteligência Artificial</h2>
              <p className="text-[11px] text-slate-450">Treine com o melhor assistente tático virtual de áudio.</p>
            </div>
          </div>

          {/* AI CYBERPUNK PREMIUM CARD */}
          <div className="relative overflow-hidden bg-gradient-to-b from-indigo-950/60 via-slate-950 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 space-y-6 hover:shadow-indigo-500/10 hover:shadow-xl transition-all duration-300">
            {/* Ambient visual glowing mesh grids */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Header of AI */}
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                  <Cpu className="w-3 h-3 text-indigo-400" /> Sparring de Idioma
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wide">
                  Prática Conversacional IA
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center justify-center font-bold text-lg">
                🤖
              </div>
            </div>

            {/* Expired/Active Banner Indicator */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs relative z-10">
              <span className="text-slate-400 font-medium">Status do Servidor:</span>
              <div>
                {isAiActive() ? (
                  <span className="inline-flex items-center gap-1.5 px-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ATIVO até {formatDateString(user.aiConversationExpiresAt)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-rose-450" /> INDISPONÍVEL
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed font-sans relative z-10">
              Treine inglês real com uma inteligência artificial avançada e especializada em Jiu-Jitsu brasileiro para lutas internacionais. Exercite áudio natural em tempo real e perca o medo de falar inglês no tatame!
            </p>

            {/* Core benefits detailed list */}
            <div className="space-y-2.5 py-4 border-t border-slate-900 relative z-10">
              {[
                { title: 'Voz IA Natural', desc: 'Sintetização de voz avançada com pronúncia de atletas reais.' },
                { title: 'Conversação em tempo real', desc: 'Respostas em menos de 1 segundo de Sparring.' },
                { title: 'Correção de Pronúncia', desc: 'Identifica e exibe termos e estruturas gramaticais para melhorar.' },
                { title: 'Treino de Audição Avançado', desc: 'Aperfeiçoe sua compreensão do dialeto do judô/BJJ.' },
                { title: 'Situações Reais de Campeonato', desc: 'Instruções de juízes, entrevistas e seminários no exterior.' },
                { title: 'Sparring verbal em inglês', desc: 'Feedback imediato de gírias e técnicas com termos do tatame.' }
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-indigo-400 shrink-0 select-none mt-0.5">✦</span>
                  <div>
                    <strong className="text-white font-bold block">{benefit.title}</strong>
                    <span className="text-slate-400 text-[10px] leading-normal">{benefit.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Tag */}
            <div className="bg-slate-900 border border-slate-805 p-4 rounded-xl flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Mensalidade Única</span>
                <span className="text-xs text-slate-350">Acesso por 30 Dias</span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-black text-indigo-300">2.500</span>
                  <span className="text-xs font-bold text-indigo-400 uppercase">JT</span>
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">cobrana não-recorrente</span>
              </div>
            </div>

            {/* Activation CTA Button */}
            <div className="pt-2 relative z-10">
              <button 
                onClick={handleActivateAi}
                disabled={activatingAi || user.coins < 2500 && !isAiActive()}
                className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAiActive() 
                    ? 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700' 
                    : user.coins >= 2500 
                      ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white hover:shadow-indigo-500/25 active:scale-98' 
                      : 'bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed'
                }`}
              >
                {activatingAi ? (
                  <span>Processando...</span>
                ) : isAiActive() ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>RENOVAR ACESSO (CUSTA 2.500 JT)</span>
                  </>
                ) : user.coins >= 2500 ? (
                  <>
                    <Zap className="w-4 h-4 text-indigo-350 fill-indigo-350" />
                    <span>ATIVAR IA AGORA</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>SALDO INSUFICIENTE (2.500 JT)</span>
                  </>
                )}
              </button>
              
              {user.coins < 2500 && !isAiActive() && (
                <p className="text-center text-[10px] text-rose-450 mt-2 font-medium font-sans">
                  Você precisa de mais {2500 - user.coins} JTs. Escolha um pacote à esquerda para ativar!
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
