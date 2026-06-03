/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  RefreshCcw 
} from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function Reports() {
  const {
    reportsList,
    isLoading,
    fetchReports,
    handleReportDecision
  } = useAdmin();

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn" id="admin-reports-root">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="font-display font-medium text-sm text-slate-201">Fila de Moderação de Conteúdo (Denúncias)</h3>
          <p className="text-[10px] text-slate-500">Analise reclamações apresentadas por lutadores ou simulações automatizadas.</p>
        </div>

        <button 
          type="button"
          onClick={fetchReports}
          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all text-slate-450"
          disabled={isLoading.reports}
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isLoading.reports ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading.reports ? (
        <div className="py-16 text-center text-slate-500 text-xs font-mono">Processando relatórios comunitários...</div>
      ) : reportsList.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs font-mono italic">Fila vazia! Tatame limpo, sem denúncias pendentes.</div>
      ) : (
        <div className="space-y-4 animate-scaleUp">
          {reportsList.map((report) => (
            <div key={report.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-3ClassName">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0">
                      RECLAMAÇÃO: {report.contentType}
                    </span>
                    <span className="text-slate-500 font-mono text-[9px]">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 font-medium text-xs">
                    Denunciado: <strong className="text-white text-xs">{report.reportedUserName}</strong>
                  </p>
                  <p className="text-[10px] text-slate-500 font-sans font-medium">
                    Autor da Denúncia: {report.reporterName} ({report.reporterEmail})
                  </p>
                </div>

                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold tracking-wider font-mono shrink-0 uppercase ${
                  report.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                  report.status === 'RESOLVED_DELETE' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' :
                  'bg-slate-800 text-slate-500 border border-slate-705'
                }`}>
                  {report.status === 'RESOLVED_DELETE' ? 'CONTEÚDO DERRUBADO' : report.status}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1">
                <span className="text-[9px] text-red-400 font-mono uppercase block">MOTIVO EXPRESSADO:</span>
                <p className="text-xs font-semibold text-slate-200">{report.reason}</p>
                <span className="text-[9px] text-slate-500 font-mono uppercase block pt-1.5">PREVIEW DETALHADO DO ALVO:</span>
                <p className="text-xs text-slate-400 italic">"{report.contentPreview}"</p>
              </div>

              {report.status === 'PENDING' && (
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleReportDecision(report.id, 'DISMISS')}
                    className="p-1 px-3.5 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white rounded border border-slate-800 cursor-pointer transition-all uppercase font-semibold"
                  >
                    Ignorar Notícia
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReportDecision(report.id, 'DELETE_CONTENT')}
                    className="p-1 px-3.5 bg-red-950/30 hover:bg-red-950/50 text-[10px] text-red-405 hover:text-red-300 rounded border border-red-900/30 font-bold cursor-pointer transition-all uppercase"
                  >
                    Excluir Conteúdo Nocivo
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
