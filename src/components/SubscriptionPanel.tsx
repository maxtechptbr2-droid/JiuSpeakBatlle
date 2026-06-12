import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle
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

  const jtPackages: JtPackage[] = [
    {
      id: '1k',
      name: 'Pacote Iniciante',
      jtAmount: 1000,
      priceBRL: 10.00,
      description: 'Ideal para experimentar as sessões de conversação básicas.',
      gradient: 'from-slate-800 to-slate-900 border-slate-700'
    },
    {
      id: '5k',
      name: 'Pacote Competidor',
      jtAmount: 5000,
      priceBRL: 45.00,
      description: 'Mais popular! Perfeito para 2 ativações completas de IA do JiuSpeak.',
      badge: 'Popular (10% OFF)',
      gradient: 'from-blue-900/60 via-slate-900 to-slate-950 border-blue-500/30 shadow-blue-950/20 shadow-lg'
    },
    {
      id: '10k',
      name: 'Pacote Faixa Preta',
      jtAmount: 10000,
      priceBRL: 80.00,
      description: 'Excelente custo-benefício! Ideal para atletas focados no aprendizado avançado.',
      badge: 'Melhor Valor (20% OFF)',
      gradient: 'from-amber-900/40 via-slate-900 to-slate-950 border-amber-600/30 shadow-amber-950/20 shadow-xl'
    }
  ];

  const handleBuyPackage = async (pack: JtPackage) => {
    if (!token) {
      showToast('Autentique-se novamente para prosseguir.', 'error');
      return;
    }

    try {
      setLoading(true);
      setSelectedPackage(pack);
      setCheckoutData(null);

      const res = await fetch('/api/payments/mercadopago/create-jt-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ packageId: pack.id, paymentMethodId: 'pix' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutData({
          paymentId: data.paymentId,
          qrCode: data.qrCodeBase64 || '',
          qrCodeCopyPaste: data.pixCopiaECola || '',
          amountBRL: data.amount,
          jtAmount: pack.jtAmount
        });
        showToast(`Checkout para ${pack.name} gerado de forma segura no Mercado Pago!`, 'success');
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

  const handleSimulatePayment = async () => {
    if (!checkoutData) return;
    try {
      setLoading(true);
      // Directly invoke our newly expanded local payment simulator URL
      const res = await fetch(`/api/payments/simulator?provider=mercadopago&sessionId=${checkoutData.paymentId}&amount=${checkoutData.amountBRL}&userId=${user.id}&purchaseType=JT_PACKAGE_PURCHASE&jtAmount=${checkoutData.jtAmount}`);
      if (res.ok) {
        // Trigger simulated webhook ping
        const webhookRes = await fetch('/api/payments/mercadopago/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'payment.created',
            data: { id: checkoutData.paymentId },
            metadata: {
              userId: user.id,
              purchaseType: 'JT_PACKAGE_PURCHASE',
              jtAmount: checkoutData.jtAmount,
              amountBRL: checkoutData.amountBRL
            }
          })
        });

        if (webhookRes.ok) {
          showToast(`Sucesso! Seu pagamento de R$ ${checkoutData.amountBRL.toFixed(2)} foi processado e ${checkoutData.jtAmount} JT foram creditados!`, 'success');
          // Reload profile
          const meRes = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const meData = await meRes.json();
          if (meData.user) {
            updateUser(meData.user);
          }
          setCheckoutData(null);
          setSelectedPackage(null);
        } else {
          showToast('Erro ao simular webhook de compensação.', 'error');
        }
      } else {
        showToast('Erro no portal de simulação de pagamentos.', 'error');
      }
    } catch (err) {
      showToast('Erro ao homologar pagamento simulado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyClipboardPix = () => {
    if (!checkoutData) return;
    navigator.clipboard.writeText(checkoutData.qrCodeCopyPaste);
    setCopiedKey(true);
    showToast('Código de pagamento PIX copiado!', 'success');
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

  return (
    <div id="recharge-jt-panel" className="max-w-5xl mx-auto space-y-8 p-1 sm:p-4">
      {/* Visual Identity Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/20 uppercase">
              Economia JiuSpeak
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Loja de JiuTickets</h1>
          <p className="text-xs text-slate-400">Adquira moedas virtuais (JT) e ative ferramentas com inteligência artificial para treinar seu inglês de tatame.</p>
        </div>

        {/* Current JT Balance Highlight */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 min-w-[220px]">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner">
            🪙
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">Seu Saldo e Wallet</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-500 tracking-tight">
                {Number(user.coins || 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-black text-amber-500/80 uppercase">JT</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Access Control Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center md:justify-start">
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wide">Servidor de Conversação com IA</h3>
            <div>
              {isAiActive() ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ativo até {formatDateString(user.aiConversationExpiresAt)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-450 border border-rose-500/20 uppercase tracking-widest animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-rose-450" /> Expirado ou Sem Acesso
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Tenha conversações por áudio guiadas por Inteligência Artificial focadas em situações reais de treino, instrução e competições. A ativação é manual: sem renovação indesejada ou cobranças recorrentes.
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2.5">
          <button 
            onClick={handleActivateAi}
            disabled={activatingAi}
            className={`px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all ${
              isAiActive() 
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700' 
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 hover:shadow-emerald-500/20 active:scale-[0.98]'
            } disabled:opacity-50`}
          >
            {activatingAi ? 'Processando...' : isAiActive() ? 'Renovar 30 Dias (Custa 2.500 JT)' : 'Ativar 30 Dias (Custa 2.500 JT)'}
          </button>
          <span className="text-[10px] text-slate-550 font-mono">Débito único de 2.500 JT</span>
        </div>
      </div>

      {/* Package Checkout Section or Catalog */}
      {selectedPackage && checkoutData ? (
        <div id="checkout-container-gate" className="bg-slate-900 border-2 border-emerald-500/20 rounded-3xl p-6 sm:p-8 space-y-6 relative">
          <button 
            onClick={() => { setSelectedPackage(null); setCheckoutData(null); }}
            className="absolute top-4 right-4 px-3 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-800 rounded-lg hover:text-white"
          >
            Voltar ao Catálogo
          </button>

          <div className="text-center sm:text-left space-y-1.5 border-b border-slate-800 pb-5">
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Checkout Seguro Mercado Pago</span>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Pagamento com PIX</h2>
            <p className="text-xs text-slate-400">Você está adquirindo <span className="text-amber-500 font-bold">{selectedPackage.name}</span> por <span className="text-white font-bold">R$ {checkoutData.amountBRL.toFixed(2)}</span>.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Interactive QR Code Display */}
            <div className="flex flex-col items-center bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-4">
              {checkoutData.qrCode ? (
                <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-200">
                  <img src={checkoutData.qrCode} alt="QR Code PIX Mercado Pago" className="w-52 h-52 object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="w-52 h-52 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-800 text-xs">
                  Carregando QR Code...
                </div>
              )}
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono text-center">Escaneie o código QR com o app do seu banco</span>
            </div>

            {/* Pix Copy and Paste & Simulator */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Código Copia e Cola PIX</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={checkoutData.qrCodeCopyPaste} 
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono focus:outline-none" 
                  />
                  <button 
                    onClick={handleCopyClipboardPix}
                    className="px-4 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 active:scale-95 flex items-center justify-center transition-all"
                    title="Copiar código PIX"
                  >
                    {copiedKey ? <Check className="w-4 h-4 stroke-slate-950" /> : <Copy className="w-4 h-4 stroke-slate-950" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-emerald-500/10 p-5 rounded-2xl space-y-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Ambiente Sandbox Homologado</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  Clique abaixo para simular a liquidação imediata da fatura Pix no webhook integrador do Mercado Pago no ambiente local de testes.
                </p>
                <button 
                  onClick={handleSimulatePayment}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs uppercase font-extrabold tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98]"
                >
                  {loading ? 'Processando Simulação...' : '✓ Simular Confirmação Pix'}
                </button>
              </div>

              <div className="text-[10px] text-slate-550 leading-relaxed text-center sm:text-left font-mono">
                Seu pagamento expira em 15 minutos. Após o processamento, seu saldo de JT será creditado imediatamente em sua carteira.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center sm:text-left space-y-1.5">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Selecione um Pacote de JiuTickets</h2>
            <p className="text-xs text-slate-400">Escolha a recarga ideal para seu ritmo de estudos de conversação com IA.</p>
          </div>

          {/* Catalog Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {jtPackages.map((pack) => (
              <div 
                key={pack.id} 
                className={`border rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-b ${pack.gradient} transition-all hover:scale-[1.01] relative`}
              >
                {pack.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[9px] font-black uppercase bg-amber-500 text-slate-950 rounded-full tracking-widest border border-amber-400 shadow-md">
                    {pack.badge}
                  </span>
                )}

                <div className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-350 uppercase tracking-wider">{pack.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">{pack.description}</p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white tracking-tight">🪙 {pack.jtAmount.toLocaleString()}</span>
                      <span className="text-xs font-black text-slate-400 uppercase">JT</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-400 font-mono">R$ {pack.priceBRL.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => handleBuyPackage(pack)}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md active:scale-[0.98]"
                  >
                    Adquirir com PIX
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
