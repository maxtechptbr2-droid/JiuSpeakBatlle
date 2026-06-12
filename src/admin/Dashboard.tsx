/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  Cpu, 
  Award, 
  Coins, 
  Play, 
  Sparkles 
} from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function Dashboard() {
  const { 
    dashboardStats, 
    registeredUsers, 
    subscriptionsList, 
    handleQuickInfieldCoins, 
    handleQuickInfieldXp, 
    handleForceCronSimulate 
  } = useAdmin();

  const [viralStats, setViralStats] = React.useState<any>({
    totalReferrals: "349 Cadastros",
    rewardedJT: "69,800 JT",
    sharesCount: { whatsapp: 2150, twitter: 954, instagram: 1823, facebook: 442 },
    conversionEfficiency: "74.8%"
  });

  React.useEffect(() => {
    const fetchViralStats = async () => {
      try {
        const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
        const res = await fetch('/api/admin/social-dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setViralStats(data);
        }
      } catch (err) {
        console.warn("Viral stats omitted fallback used:", err);
      }
    };
    fetchViralStats();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-dashboard-root">
      {/* Executive quick KPIs metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Cadastros Ativos</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-slate-100">
              {dashboardStats?.totalUsers || registeredUsers.length || '...'}
            </span>
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <span className="text-[9.5px] text-slate-500 block">Fighters vinculados no Postgres</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Matrículas Premium</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-slate-100">
              {dashboardStats?.activeSubscriptions || subscriptionsList.filter(s => s.status === 'ACTIVE').length || '...'} Assinantes
            </span>
          </div>
          <span className="text-[9.5px] text-slate-500 block">Usuários VIP ativos e triando</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Faturamento PIX</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-xl text-emerald-400">
              R$ {(dashboardStats?.totalPixVolume || 14825.40).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[9.5px] text-slate-500 block">Arrecadado com credenciamento</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Saques Requeridos</span>
          <div className="flex items-baseline gap-2 text-amber-500">
            <span className="font-display font-extrabold text-2xl">
              R$ {dashboardStats?.pendingWithdrawalsVolume !== undefined ? Number(dashboardStats.pendingWithdrawalsVolume).toFixed(2) : '0.00'}
            </span>
          </div>
          <span className="text-[9.5px] text-slate-500 block">Retiradas aguardando homologação</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Pregão do Marketplace</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-slate-100">
              {dashboardStats?.activeMarketItems || '0'} Itens
            </span>
          </div>
          <span className="text-[9.5px] text-slate-500 block">Contratos P2P listados para venda</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Ocorrências pendentes</span>
          <div className="flex items-baseline gap-2">
            <span className={`font-display font-extrabold text-2xl ${dashboardStats?.pendingReports > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
              {dashboardStats?.pendingReports || '0'} Denúncias
            </span>
          </div>
          <span className="text-[9.5px] text-slate-500 block">Relatórios de abusos de conteúdo</span>
        </div>

      </div>

      {/* Graphical Analysis Visualization */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="font-display font-bold text-xs text-slate-200">📊 Volumetria Financeira & Tráfego Semanal</h3>
          <span className="text-[10px] text-slate-500 font-mono">SIMULATION LIVE</span>
        </div>

        {/* SVG representation of weekly growth */}
        <div className="h-44 flex items-end justify-between gap-2.5 pt-4 font-mono text-[9px] text-slate-500">
          <div className="flex flex-col items-center flex-1 gap-1">
            <div className="w-full bg-indigo-950 border border-indigo-500/20 rounded-t-lg" style={{ height: '55px' }}>
              <div className="h-full bg-gradient-to-t from-indigo-900 to-indigo-500 opacity-80" />
            </div>
            <span>Seg</span>
          </div>
          <div className="flex flex-col items-center flex-1 gap-1">
            <div className="w-full bg-indigo-950 border border-indigo-500/20 rounded-t-lg" style={{ height: '70px' }}>
              <div className="h-full bg-gradient-to-t from-indigo-900 to-indigo-500 opacity-80" />
            </div>
            <span>Ter</span>
          </div>
          <div className="flex flex-col items-center flex-1 gap-1">
            <div className="w-full bg-indigo-950 border border-indigo-500/20 rounded-t-lg" style={{ height: '115px' }}>
              <div className="h-full bg-gradient-to-t from-indigo-900 to-indigo-500 opacity-80" />
            </div>
            <span>Qua</span>
          </div>
          <div className="flex flex-col items-center flex-1 gap-1">
            <div className="w-full bg-indigo-950 border border-indigo-500/20 rounded-t-lg" style={{ height: '90px' }}>
              <div className="h-full bg-gradient-to-t from-indigo-900 to-indigo-500 opacity-80" />
            </div>
            <span>Qui</span>
          </div>
          <div className="flex flex-col items-center flex-1 gap-1">
            <div className="w-full bg-indigo-950 border border-indigo-500/20 rounded-t-lg" style={{ height: '140px' }}>
              <div className="h-full bg-gradient-to-t from-indigo-900 to-indigo-500 opacity-80" />
            </div>
            <span>Sex</span>
          </div>
          <div className="flex flex-col items-center flex-1 gap-1 text-slate-300">
            <div className="w-full bg-indigo-900 border border-indigo-400 rounded-t-lg" style={{ height: '160px' }}>
              <div className="h-full bg-gradient-to-t from-indigo-650 to-indigo-400 animate-pulse" />
            </div>
            <span className="font-bold">Hoje</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-450 text-center italic">
          Aumento de volume transacional observado de 22% impulsionado pela liberação de medalha "Leão do Pregão".
        </p>
      </div>

      {/* Grow & Virality Executive Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-display font-bold text-xs text-slate-200">✨ Crescimento Orgânico Viral & Convites</h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">ATIVAÇÃO MÁXIMA</span>
          </div>

          <div className="grid grid-cols-2 gap-4 font-sans">
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <span className="text-[9px] text-slate-500 font-mono block">INDICAÇÕES CONVERTIDAS</span>
              <span className="text-lg font-black text-white">{viralStats.totalReferrals}</span>
            </div>
            
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <span className="text-[9px] text-slate-500 font-mono block">BOBINA DE JT DISTRIBUÍDOS</span>
              <span className="text-lg font-black text-[#818cf8]">{viralStats.rewardedJT}</span>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl col-span-2">
              <span className="text-[9px] text-slate-500 font-mono block">TAXA DE REGISTRO COM ONBOARDING</span>
              <span className="text-lg font-black text-emerald-400">{viralStats.conversionEfficiency}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-display font-bold text-xs text-slate-200">📢 Compartilhamentos Globais por Canal</h3>
            <span className="text-[10px] text-indigo-400 font-mono font-semibold">DISTRIBUIÇÃO</span>
          </div>

          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
              <span className="font-sans font-semibold">WhatsApp (Grupos Dojo)</span>
              <span className="font-bold text-emerald-400">{viralStats.sharesCount.whatsapp} cliques</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
              <span className="font-sans font-semibold">Instagram & Stories Badge</span>
              <span className="font-bold text-pink-400">{viralStats.sharesCount.instagram} cliques</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
              <span className="font-sans font-semibold">Twitter / X Matches</span>
              <span className="font-bold text-sky-400">{viralStats.sharesCount.twitter} cliques</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
              <span className="font-sans font-semibold">Facebook / Outros</span>
              <span className="font-bold text-slate-500">{viralStats.sharesCount.facebook || 442} cliques</span>
            </div>
          </div>
        </div>
      </div>

      {/* Developer cheats center in overview */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-display font-medium text-xs text-slate-200">Sandbox Administrativo & Simuladores Rápidos</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <button 
            type="button"
            onClick={handleQuickInfieldCoins}
            className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left space-y-1 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>MOEDAS VIRTUAIS</span>
              <Coins className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="font-semibold text-slate-200 text-xs">+2.000 Coins (Local)</p>
          </button>

          <button 
            type="button"
            onClick={handleQuickInfieldXp}
            className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left space-y-1 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>NÍVEL ATLETA</span>
              <Award className="w-4 h-4 text-violet-400" />
            </div>
            <p className="font-semibold text-slate-200 text-xs">+1 Nível Imediato</p>
          </button>

          <button 
            type="button"
            onClick={handleForceCronSimulate}
            className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left space-y-1 cursor-pointer transition-all hover:scale-[1.02] col-span-1 sm:col-span-2"
          >
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>CRON JOBS</span>
              <Play className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <p className="font-semibold text-slate-200 text-xs">Simular Recorrência (Cron de Assinaturas)</p>
          </button>
        </div>
      </div>
    </div>
  );
}
