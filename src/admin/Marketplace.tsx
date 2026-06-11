/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  RefreshCcw, 
  Ban 
} from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function Marketplace() {
  const {
    marketplaceList,
    isLoading,
    fetchMarketplace,
    handleSuspendListing
  } = useAdmin();

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn" id="admin-marketplace-root">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="font-display font-medium text-sm text-slate-201">Pregão Geral do Marketplace</h3>
          <p className="text-[10px] text-slate-500">Verificação de itens anunciados por atletas de kimono a badges de elite.</p>
        </div>

        <button 
          type="button"
          onClick={fetchMarketplace}
          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all text-slate-450"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading.marketplace ? (
        <div className="py-16 text-center text-slate-500 text-xs font-mono">Conectando leiloeiro...</div>
      ) : marketplaceList.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs font-mono italic">Sem mercadoria ativa no pregão no momento.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-scaleUp">
          {marketplaceList.map((item) => (
            <div key={item.id} className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs text-slate-100 uppercase">{item.name}</h4>
                  <span className="p-0.5 px-2 bg-slate-900 text-yellow-500 rounded text-[9px] font-bold font-mono">
                    {item.priceKC} JT
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Atleta: {item.sellerName} ({item.sellerEmail})</p>
                <p className="text-[9.5px] font-mono">RARIDADE: <span className="text-violet-400 font-bold uppercase">{item.rarity}</span></p>
                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold inline-block leading-none uppercase ${
                  item.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                }`}>
                  {item.status}
                </span>
              </div>

              {item.active && (
                <button
                  type="button"
                  onClick={() => handleSuspendListing(item.id)}
                  className="w-full py-1.5 bg-red-950/15 hover:bg-red-950/30 text-red-400 border border-red-900/20 rounded-lg text-[9.5px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5 text-red-500" /> Remover e Estornar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
