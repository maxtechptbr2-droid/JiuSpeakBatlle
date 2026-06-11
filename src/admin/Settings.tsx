/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  Terminal, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCcw, 
  Sparkles, 
  Database,
  Cpu
} from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function Settings() {
  const {
    user,
    showToast,
    fetchDashboardStats,
    handleForceCronSimulate,
    handleQuickInfieldCoins,
    handleQuickInfieldXp
  } = useAdmin();

  // Internal configuration states
  const [allowSandbox, setAllowSandbox] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [auditLogLevel, setAuditLogLevel] = useState<'INFO' | 'WARN' | 'DEBUG'>('INFO');

  const handleSaveConfigs = () => {
    showToast("Configurações do painel atualizadas com sucesso!", "success");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fadeIn" id="admin-settings-root">
      
      <div className="pb-4 border-b border-slate-800">
        <h3 className="font-display font-medium text-sm text-slate-201 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Configurações do Tatame & Direção</span>
        </h3>
        <p className="text-[10px] text-slate-500 font-sans">
          Parametrize as diretrizes operacionais, logs do sistema PostgreSQL e chaves de segurança.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 font-mono">
        
        {/* Left Column: General Configuration */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-850 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Diretrizes Administrativas
          </h4>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase block">Ambiente Operacional:</label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-center">
              <span>Modo Sandbox Ativo</span>
              <button 
                type="button"
                onClick={() => {
                  setAllowSandbox(!allowSandbox);
                  showToast(`Modo Sandbox ${!allowSandbox ? 'Habilitado' : 'Desabilitado'}!`, 'info');
                }}
                className={`p-1 px-3.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                  allowSandbox 
                    ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' 
                    : 'bg-rose-950/20 text-rose-400 border-rose-900/40'
                }`}
              >
                {allowSandbox ? 'ATIVO' : 'DESATIVADO'}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase block">Modo Manutenção:</label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-center">
              <span>Restringir acesso para manutenção</span>
              <button 
                type="button"
                onClick={() => {
                  setMaintenanceMode(!maintenanceMode);
                  showToast(`Modo de Manutenção ${!maintenanceMode ? 'Sinalizado' : 'Cancelado'}!`, 'info');
                }}
                className={`p-1 px-3.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                  maintenanceMode
                    ? 'bg-amber-950/20 text-amber-400 border-amber-500/20 animate-pulse'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {maintenanceMode ? 'MANUTENÇÃO' : 'ONLINE'}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase block">Nível de Auditoria CCTV Log:</label>
            <select
              value={auditLogLevel}
              onChange={(e) => setAuditLogLevel(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
            >
              <option value="INFO">INFO (Recomendado - Apenas mutações críticas)</option>
              <option value="WARN">WARN (Apenas advertências severas de IP)</option>
              <option value="DEBUG">DEBUG (Modo verboso - Rastrear todas rotas API)</option>
            </select>
          </div>
        </div>

        {/* Right Column: Advanced Sandbox Tools & Database Actions */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-850 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" /> Operações do Database
          </h4>

          <div className="space-y-2.5">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200 text-xs">Simular Recorrências</span>
                <span className="text-[9px] bg-slate-900 p-0.5 px-2 rounded border border-slate-800 text-slate-500">CRON JOB</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Gatilha o script de simulação de recorrência do Postgres, rodando débitos em atraso e expirando assinaturas VIP pendentes.
              </p>
              <button 
                type="button"
                onClick={handleForceCronSimulate}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-[10.5px] border border-slate-800 rounded-lg text-slate-300 font-semibold cursor-pointer text-center hover:text-white transition-all"
              >
                Disparar Sincronização Cron
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200 text-xs text-yellow-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Cheat Sandbox
                </span>
                <span className="text-[9px] bg-yellow-500/10 p-0.5 px-2 rounded border border-yellow-500/20 text-yellow-400 font-bold">FAST CHEATS</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Adicione JiuTickets (JT) locais ou suba níveis e patentes de forma instantânea para fins de validação em homologação.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleQuickInfieldCoins}
                  className="py-1.5 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold rounded-lg cursor-pointer text-center transition-all"
                >
                  +2.000 JT (Coins)
                </button>
                <button
                  type="button"
                  onClick={handleQuickInfieldXp}
                  className="py-1.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 text-[10px] font-bold rounded-lg cursor-pointer text-center transition-all"
                >
                  Avançar Nível
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="pt-4 flex justify-between items-center border-t border-slate-800">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Sua permissão: Diretor Administrativo de Alto Grau</span>
        </div>
        <button
          type="button"
          onClick={handleSaveConfigs}
          className="p-2 px-6 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer transition-all hover:shadow-lg"
        >
          Salvar Todas Configurações
        </button>
      </div>

    </div>
  );
}
