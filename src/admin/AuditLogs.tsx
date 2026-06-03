/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Trash2, 
  RefreshCcw 
} from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function AuditLogs() {
  const {
    auditLogs,
    generalLogs,
    onClearLogs,
    fetchAuditLogs
  } = useAdmin();

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn" id="admin-auditlogs-root">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="font-display font-medium text-sm text-slate-205">Sistemas de Auditoria Geral (CCTV Log)</h3>
          <p className="text-[10px] text-slate-500 font-sans">Histórico em tempo real de eventos operacionais e administrativos.</p>
        </div>

        <div className="flex gap-2">
          <button 
            type="button"
            onClick={onClearLogs}
            className="p-1 px-3.5 bg-slate-950 hover:bg-slate-850 text-red-400 hover:text-red-300 border border-slate-800 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar Local
          </button>
          
          <button 
            type="button"
            onClick={fetchAuditLogs}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all text-slate-450 animate-duration-1000"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Console Logs representation */}
      <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 h-[350px] overflow-y-auto font-mono text-[10px] space-y-2.5">
        
        {/* Fallback to local logs passing from parent if query empty */}
        {generalLogs.length === 0 && auditLogs.length > 0 ? (
          auditLogs.map((log: any) => (
            <div key={log.id} className="p-2.5 bg-slate-900/40 rounded border border-slate-850/60 flex items-start gap-2.5 leading-relaxed">
              <span className="text-[9.5px] text-indigo-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="text-slate-500 font-bold uppercase shrink-0">[{log.type || 'SYS_LOG'}]</span>
              <span className="text-slate-350">{log.description}</span>
            </div>
          ))
        ) : generalLogs.length === 0 ? (
          <div className="text-slate-600 italic py-12 text-center">Nenhum evento registrado no arquivo syslog.</div>
        ) : (
          generalLogs.map((log: any) => (
            <div key={log.id} className="p-2.5 bg-slate-900/40 rounded border border-slate-850/60 flex items-start gap-2.5 leading-relaxed">
              <span className="text-[9.5px] text-indigo-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="text-slate-500 font-bold uppercase shrink-0">[{log.type}]</span>
              <span className="text-slate-300 flex-1">{log.description} <strong className="text-indigo-400">@{log.actorName}</strong></span>
            </div>
          ))
        )}

      </div>
    </div>
  );
}
