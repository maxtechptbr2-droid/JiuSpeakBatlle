/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  RefreshCcw, 
  Play 
} from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function Subscriptions() {
  const {
    subscriptionsList,
    isLoading,
    fetchSubscriptions,
    handleSubscriptionAction,
    handleForceCronSimulate
  } = useAdmin();

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn" id="admin-subscriptions-root">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="font-display font-medium text-sm text-slate-201">Painel de Assinantes Premium VIP</h3>
          <p className="text-[10px] text-slate-500 font-sans">Contratos de alunos, vigência e faturamento de recorrências.</p>
        </div>

        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleForceCronSimulate}
            className="p-2 px-3.5 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-405 hover:text-emerald-300 border border-emerald-900/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-sans"
          >
            <Play className="w-4 h-4 text-emerald-400" /> Rodar Cron
          </button>

          <button 
            type="button"
            onClick={fetchSubscriptions}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all text-slate-400"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isLoading.subs ? (
        <div className="py-16 text-center text-slate-500 text-xs font-mono">Agregando registros de assinatura...</div>
      ) : subscriptionsList.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs font-mono italic">
          Sem assinaturas cadastradas. Simule checkout nas abas de assinaturas de sua conta teste para registrar.
        </div>
      ) : (
        <div className="overflow-x-auto animate-scaleUp">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 uppercase text-[9px] tracking-wider font-semibold">
                <th className="py-2.5 px-3">Assinante</th>
                <th className="py-2.5 px-3">E-mail</th>
                <th className="py-2.5 px-3">Plano</th>
                <th className="py-2.5 px-3">End Date (Status)</th>
                <th className="py-2.5 px-3 text-right">Diretriz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-305">
              {subscriptionsList.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-950/40">
                  <td className="py-3 px-3 font-semibold text-white">{sub.subscriberName}</td>
                  <td className="py-3 px-3 text-slate-450">{sub.subscriberEmail}</td>
                  <td className="py-3 px-3 font-bold text-indigo-400">
                    {sub.planName} <span className="text-[9px] font-normal text-slate-500">(R$ {sub.amountBRL?.toFixed(2)})</span>
                  </td>
                  <td className="py-3 px-3 space-y-1">
                    <p className="text-[11px] text-slate-400">{new Date(sub.endDate).toLocaleDateString()}</p>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                      sub.status === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-405 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-405 border border-red-500/20'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {sub.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        onClick={() => handleSubscriptionAction(sub.id, 'CANCEL')}
                        className="p-1 px-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-404 border border-red-900/30 rounded text-[10px] cursor-pointer font-bold transition-all"
                      >
                        Cancelar Plano
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSubscriptionAction(sub.id, 'REACTIVATE')}
                        className="p-1 px-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-405 border border-emerald-900/30 rounded text-[10px] cursor-pointer font-bold transition-all"
                      >
                        Reativar
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
  );
}
