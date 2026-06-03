/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  RefreshCcw, 
  ArrowDownLeft, 
  DollarSign, 
  Terminal 
} from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function Payments() {
  const {
    pixPaymentsList,
    withdrawalsList,
    isLoading,
    reviewingWithdrawal,
    setReviewingWithdrawal,
    auditedWithdrawal,
    setAuditedWithdrawal,
    withdrawalAudits,
    reviewNotes,
    setReviewNotes,
    fetchPixPayments,
    handlePixAction,
    fetchWithdrawals,
    fetchWithdrawalAudits,
    handleReviewWithdrawalSubmit
  } = useAdmin();

  // Internal sub-tab state ('pix' | 'withdrawals')
  const [subTab, setSubTab] = useState<'pix' | 'withdrawals'>('pix');

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fadeIn" id="admin-payments-root">
      
      {/* Header and sub-navigation in Payments */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-sm text-slate-200">
            {subTab === 'pix' ? 'Monitor de Depósitos Pix' : 'Gestão de Saques & Retiradas BRL'}
          </h3>
          <p className="text-[10px] text-slate-500">
            {subTab === 'pix' 
              ? 'Arbitre conciliações de PIX gerados externamente e credite moedas automaticamente.' 
              : 'Filas de aprovação Pix e auditoria de saldos de instrutores afiliados.'}
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 select-none">
          <button
            type="button"
            onClick={() => { setSubTab('pix'); fetchPixPayments(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              subTab === 'pix' ? 'bg-indigo-650 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monitor Pix
          </button>
          <button
            type="button"
            onClick={() => { setSubTab('withdrawals'); fetchWithdrawals(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              subTab === 'withdrawals' ? 'bg-indigo-650 text-white shadow-md' : 'text-slate-400 hover:text-slate-205'
            }`}
          >
            Saques Instrutores
          </button>
        </div>
      </div>

      {subTab === 'pix' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Transações Pix Ativas</span>
            <button 
              type="button"
              onClick={fetchPixPayments}
              className="p-1.5 px-3 bg-slate-950 hover:bg-slate-850 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Atualizar Lista
            </button>
          </div>

          {isLoading.pix ? (
            <div className="py-16 text-center text-slate-500 text-xs font-mono animate-pulse">Processando conciliações BACEN...</div>
          ) : pixPaymentsList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono italic">Sem pagamentos gerados nesta sessão.</div>
          ) : (
            <div className="overflow-x-auto text-[11.5px] font-mono whitespace-nowrap">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-550 uppercase text-[9px] tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Sacado (Atleta)</th>
                    <th className="py-2.5 px-3">Código Txid PIX</th>
                    <th className="py-2.5 px-3">Valor Real</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação Conclusiva</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {pixPaymentsList.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white">{payment.userName}</p>
                          <p className="text-[9.5px] text-slate-500">{payment.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-305 font-mono text-[10px]">
                        {payment.txid?.substring(0, 16)}...
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">
                        R$ {payment.amountBRL?.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-[10px]">
                        <span className="p-0.5 px-1.5 rounded bg-slate-950 text-slate-400 border border-slate-805">
                          {payment.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold ${
                          payment.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 
                          payment.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse' : 
                          'bg-slate-800 text-slate-500'
                        }`}>
                          {payment.status === 'COMPLETED' ? 'PAGO (BACEN)' : payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {payment.status === 'PENDING' && (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => handlePixAction(payment.txid, 'APPROVE')}
                              className="p-1 px-2.5 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 rounded text-[9.5px] cursor-pointer font-bold transition-all uppercase"
                            >
                              Forçar Pago
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePixAction(payment.txid, 'EXPIRE')}
                              className="p-1 px-2 bg-slate-850 hover:bg-slate-800 text-slate-400 border border-slate-700 rounded text-[9.5px] cursor-pointer font-bold transition-all uppercase"
                            >
                              Expirar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Fila de Saques</span>
            <button 
              type="button"
              onClick={fetchWithdrawals}
              className="p-1.5 px-3 bg-slate-950 hover:bg-slate-850 rounded-lg border border-slate-800 text-[11px] text-slate-450 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Atualizar Lista
            </button>
          </div>

          {isLoading.withdrawals ? (
            <div className="py-16 text-center text-slate-500 text-xs font-mono animate-pulse">Indexando pedidos BRL...</div>
          ) : withdrawalsList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono italic">Fila limpa. Aguardando requerimento de retiradas.</div>
          ) : (
            <div className="overflow-x-auto text-[11.5px] font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 px-3">Favorecido (Professor)</th>
                    <th className="py-2.5 px-3">Dados Pix Destino</th>
                    <th className="py-2.5 px-3">Retirada Requerida</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Pista / Homologação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {withdrawalsList.map((withdraw) => (
                    <tr key={withdraw.id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white">{withdraw.userName || 'Instrutor Associado'}</p>
                          <p className="text-[9.5px] text-slate-500">{withdraw.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 space-y-0.5">
                        <p className="text-slate-200">{withdraw.pixKey}</p>
                        <p className="text-[9px] text-slate-500 uppercase">TIPO: {withdraw.pixKeyType}</p>
                      </td>
                      <td className="py-3 px-3 font-semibold text-amber-500">
                        R$ {Number(withdraw.amountBRL).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase ${
                          withdraw.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          withdraw.status === 'PENDING' || withdraw.status === 'PROCESSING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' : 
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {withdraw.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => { setAuditedWithdrawal(withdraw); fetchWithdrawalAudits(withdraw.id); }}
                          className="p-1 px-2.5 bg-slate-950 hover:bg-slate-850 text-slate-450 hover:text-white rounded text-[10px] cursor-pointer transition-all border border-slate-805"
                          title="Ver Auditoria"
                        >
                          Auditar Track
                        </button>
                        
                        {(withdraw.status === 'PENDING' || withdraw.status === 'PROCESSING') && (
                          <button
                            type="button"
                            onClick={() => { setReviewingWithdrawal({ ...withdraw, action: 'APPROVE' }); setReviewNotes(''); }}
                            className="p-1 px-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-450 border border-emerald-900/30 rounded text-[10px] cursor-pointer font-bold transition-all uppercase"
                          >
                            Decidir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL WINDOW: EDIT WITHDRAWAL ACTION REVIEW */}
      {reviewingWithdrawal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp shadow-2xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <h5 className="font-display font-medium text-xs text-slate-205 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                <span>Homologar Retirada BRL</span>
              </h5>
              <button 
                type="button"
                onClick={() => setReviewingWithdrawal(null)}
                className="text-slate-400 hover:text-white font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 font-mono space-y-1">
              <p>ID do Caso: <span className="text-slate-450">{reviewingWithdrawal.id?.substring(0, 16)}...</span></p>
              <p>Requerente: <span className="text-white font-bold">{reviewingWithdrawal.userName || 'Associado'}</span></p>
              <p>Montante: <span className="text-emerald-400 font-bold">R$ {Number(reviewingWithdrawal.amountBRL).toFixed(2)}</span></p>
              <p>Chave PIX: <span className="text-indigo-400">{reviewingWithdrawal.pixKey}</span></p>
            </div>

            <form onSubmit={handleReviewWithdrawalSubmit} className="space-y-3 text-xs">
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Sua Ação Administrativa:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewingWithdrawal({ ...reviewingWithdrawal, action: 'APPROVE' })}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono font-extrabold uppercase cursor-pointer transition-all text-center ${
                      reviewingWithdrawal.action === 'APPROVE'
                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500'
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    Despachar Pix (Aprovar)
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewingWithdrawal({ ...reviewingWithdrawal, action: 'REJECT' })}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono font-extrabold uppercase cursor-pointer transition-all text-center ${
                      reviewingWithdrawal.action === 'REJECT'
                        ? 'bg-rose-950/30 text-rose-400 border-rose-500'
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    Gargalar (Rejeitar)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block">Motivação / Detalhes de Nota Fiscal:</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Justifique a decisão ou anexe comprovante de despacho Pix..."
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded h-16 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs font-mono resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingWithdrawal(null)}
                  className="flex-1 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 cursor-pointer text-center hover:text-white"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-650 text-white font-bold rounded-lg cursor-pointer text-center"
                >
                  Homologar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW: WITHDRAWAL AUDIT TRACK LOGS */}
      {auditedWithdrawal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp shadow-2xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 font-mono font-bold">
              <h5 className="font-display font-medium text-xs text-slate-205 flex items-center gap-1.5 font-bold">
                <Terminal className="w-4 h-4 text-slate-400 animate-pulse animate-duration-1000" />
                <span>Trilha de Auditoria: {auditedWithdrawal.userName || 'Associado'}</span>
              </h5>
              <button 
                type="button"
                onClick={() => setAuditedWithdrawal(null)}
                className="text-slate-450 hover:text-white font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto font-mono text-[9.5px]">
              {withdrawalAudits.length === 0 ? (
                <div className="text-slate-500 italic py-6 text-center">Nenhum evento registrado nesta track de saques.</div>
              ) : (
                withdrawalAudits.map((track: any) => (
                  <div key={track.id} className="p-2 bg-slate-950 border border-slate-850 rounded text-slate-350 space-y-1">
                    <div className="flex justify-between text-[8px] text-zinc-550">
                      <span>{new Date(track.createdAt).toLocaleString()}</span>
                      <span className="font-bold uppercase text-indigo-400">{track.action}</span>
                    </div>
                    <p className="font-semibold">{track.details}</p>
                    <p className="text-[8px] text-slate-655">IP: {track.ipAddress || '127.0.0.1'} | Ator: {track.actorName || 'Sistema'}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAuditedWithdrawal(null)}
                className="p-1 px-4 bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800 hover:text-white rounded cursor-pointer font-bold font-mono text-[10px]"
              >
                Fechar Painel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
