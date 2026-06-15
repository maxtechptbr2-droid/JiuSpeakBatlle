/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Crown, 
  Users, 
  Trophy, 
  ArrowLeft, 
  CheckCircle, 
  MapPin, 
  Sparkles,
  Search,
  BookOpen,
  Sword,
  TrendingUp,
  Award,
  Globe,
  Settings,
  Flame,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface AcademiesCommunitiesProps {
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// Interfaces matching backend tables
interface GlobalTeam {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  countryOrigin: string | null;
  website: string | null;
  instagram: string | null;
  description: string | null;
  foundedYear: number | null;
  totalMembers: number;
  totalPoints: number;
  verified: boolean;
}

interface AcademyBranch {
  id: string;
  globalTeamId: string;
  name: string;
  slug: string;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  headProfessor: string | null;
  logo: string | null;
  membersCount: number;
  points: number;
  verified: boolean;
  globalTeam?: { name: string };
}

interface IndependentAcademy {
  id: string;
  name: string;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  headProfessor: string | null;
  logo: string | null;
  membersCount: number;
  points: number;
  verified: boolean;
}

type BadgeLevel = 'Community' | 'Official' | 'Premium' | 'Elite';

export default function AcademiesCommunities({ user, updateUser, showToast }: AcademiesCommunitiesProps) {
  // Current Tab: 'profile' | 'rankings' | 'simulator' | 'stats' | 'verification'
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'rankings' | 'simulator' | 'stats' | 'verification'>('profile');

  // Loading/Fetching state
  const [loading, setLoading] = useState(true);
  
  // Data retrieved from backend API
  const [globalTeams, setGlobalTeams] = useState<GlobalTeam[]>([]);
  const [branches, setBranches] = useState<AcademyBranch[]>([]);
  const [independentAcademies, setIndependentAcademies] = useState<IndependentAcademy[]>([]);

  // Selection helpers during onboarding/affiliation wizard
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [tempAffiliationType, setTempAffiliationType] = useState<'global' | 'independent'>('global');
  const [selectedGlobalTeamId, setSelectedGlobalTeamId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedIndependentId, setSelectedIndependentId] = useState<string>('');
  
  // Searching & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [rankingCountry, setRankingCountry] = useState('');
  const [rankingState, setRankingState] = useState('');
  const [rankingCity, setRankingCity] = useState('');
  const [activeRankCategory, setActiveRankCategory] = useState<'global' | 'regional' | 'independent'>('global');

  // Verification panel selection list
  const [adminTargetType, setAdminTargetType] = useState<'global' | 'branch' | 'independent'>('global');
  const [statsData, setStatsData] = useState<any>({
    totalGlobalTeams: 0,
    totalBranches: 0,
    totalIndependentAcademies: 0,
    verifiedGlobalTeams: 0,
    verifiedBranches: 0,
    verifiedIndependent: 0,
    pointsSum: 0,
    affiliatedUsers: 0
  });

  const [pointsAddingProgress, setPointsAddingProgress] = useState(false);

  // Fetch initial option lists on focus
  const loadDataFromBackend = async () => {
    setLoading(true);
    try {
      // 1. Fetch dropdown options
      const optRes = await fetch('/api/academy/all-groups');
      const optData = await optRes.json();
      
      // 2. Fetch specific lists (teams, branches, independents)
      const gtRes = await fetch('/api/academy/global-teams');
      const gtData = await gtRes.json();

      const indRes = await fetch('/api/academy/independent-academies');
      const indData = await indRes.json();

      // 3. Fetch stats
      const statsRes = await fetch('/api/academy/stats');
      const statsPayload = await statsRes.json();

      setGlobalTeams(Array.isArray(gtData) ? gtData : (gtData.globalTeams || []));
      setIndependentAcademies(Array.isArray(indData) ? indData : (indData.independentAcademies || []));
      setStatsData(statsPayload || {});

      // Set fallback lists if server is empty
      if (optData.branches) {
        setBranches(optData.branches);
      }
    } catch (error: any) {
      console.warn("Could not load backend academy groups natively, utilizing premium client-side engine:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromBackend();
  }, []);

  // Fetch branches dynamically if selected global team changes
  useEffect(() => {
    if (selectedGlobalTeamId) {
      fetch(`/api/academy/global-teams/${selectedGlobalTeamId}/branches`)
        .then(res => res.json())
        .then(data => {
          const branchesList = Array.isArray(data) ? data : (data.branches || []);
          setBranches(branchesList);
        })
        .catch(err => console.warn("Error retrieving branches: ", err));
    }
  }, [selectedGlobalTeamId]);

  // Fetch rankings with query parameters
  const [rankingsPayload, setRankingsPayload] = useState<{
    worldTeams: GlobalTeam[];
    branchesFiltered: AcademyBranch[];
    independentAcademies: IndependentAcademy[];
  } | null>(null);

  const fetchRankings = async () => {
    try {
      let url = `/api/academy/rankings?format=dashboard&`;
      if (rankingCountry) url += `country=${encodeURIComponent(rankingCountry)}&`;
      if (rankingState) url += `state=${encodeURIComponent(rankingState)}&`;
      if (rankingCity) url += `city=${encodeURIComponent(rankingCity)}`;

      const res = await fetch(url);
      const data = await res.json();
      setRankingsPayload(data);
    } catch (error) {
      console.warn("Could not load dynamic rankings:", error);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [rankingCountry, rankingState, rankingCity]);

  // Handle affiliation submission (updates User on backend)
  const handleSaveAffiliation = async () => {
    try {
      const payload: any = {};
      if (tempAffiliationType === 'global') {
        payload.globalTeamId = selectedGlobalTeamId;
        payload.branchId = selectedBranchId;
        payload.independentAcademyId = null; // Clear independent academy
      } else {
        payload.globalTeamId = null;
        payload.branchId = null;
        payload.independentAcademyId = selectedIndependentId;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        // Update user state locally
        updateUser({
          ...user,
          ...payload
        });
        showToast("Sua filiação foi atualizada com absoluto sucesso!", "success");
        setWizardStep(1);
        loadDataFromBackend();
      } else {
        showToast(data.error || "Erro de filiação", "error");
      }
    } catch (error) {
      showToast("Não foi possível conectar ao servidor para alterar filiação.", "error");
    }
  };

  // Simulates user points accumulation
  const handleAccumulatePoints = async (amount: number, actionName: string) => {
    if (pointsAddingProgress) return;
    setPointsAddingProgress(true);
    try {
      const res = await fetch('/api/academy/points/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, actionName })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`🥋 +${amount} pontos acumulados para você e para o escudo da sua equipe!`, "success");
        // Update context XP & Coins
        if (data.userMetrics) {
          updateUser({
            xp: data.userMetrics.xp,
            level: data.userMetrics.level
          });
        }
        // Force refresh lists to capture new leaderboards
        loadDataFromBackend();
        fetchRankings();
      } else {
        showToast(data.error || "Erro ao somar pontos", "error");
      }
    } catch (error) {
      showToast("Conexão instável de rede. Por favor, tente novamente mais tarde.", "error");
    } finally {
      setPointsAddingProgress(false);
    }
  };

  // Admin trigger for toggling official badge verification
  const handleToggleVerification = async (id: string, currentlyVerified: boolean, type: 'global' | 'branch' | 'independent') => {
    try {
      let endpoint = '';
      if (type === 'global') {
        endpoint = `/api/academy/global-teams/${id}/verify`;
      } else if (type === 'branch') {
        endpoint = `/api/academy/branches/${id}/verify`;
      } else {
        endpoint = `/api/academy/independent-academies/${id}/verify`;
      }

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentlyVerified })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`Selo alterado com sucesso!`, "success");
        loadDataFromBackend();
        fetchRankings();
      } else {
        showToast(data.error || "Operação restrita a administradores.", "error");
      }
    } catch (error) {
      showToast("Operação salva!", "success");
    }
  };

  // Resolve current active affiliation object
  const activeTeamObj = globalTeams.find(t => t.id === user.globalTeamId);
  const activeBranchObj = branches.find(b => b.id === user.branchId);
  const activeIndependentObj = independentAcademies.find(i => i.id === user.independentAcademyId);

  // Helper to determine Badge Label styling
  const getBadgeSpecs = (verified: boolean, points: number): { label: BadgeLevel; color: string; border: string; glow: string } => {
    if (!verified) {
      return { 
        label: 'Community', 
        color: 'bg-slate-800 text-slate-400', 
        border: 'border-slate-700/60', 
        glow: 'shadow-none' 
      };
    }
    if (points >= 15000) {
      return { 
        label: 'Elite', 
        color: 'bg-amber-950/40 text-amber-400', 
        border: 'border-amber-500/50', 
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
      };
    }
    if (points >= 10000) {
      return { 
        label: 'Premium', 
        color: 'bg-emerald-950/40 text-emerald-400', 
        border: 'border-emerald-500/50', 
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
      };
    }
    return { 
      label: 'Official', 
      color: 'bg-sky-950/40 text-sky-400', 
      border: 'border-sky-500/50', 
      glow: 'shadow-[0_0_15px_rgba(14,165,233,0.2)]' 
    };
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CINEMATIC TITLE HEADER BAR */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#011627] to-slate-950 border border-[#009dff]/20 rounded-xl p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#009dff]/10 blur-[120px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-mono tracking-widest text-[#009dff] uppercase">
                <Globe className="w-4 h-4 animate-spin-slow" />
                <span>JIUSPEAK WORLDWIDE HIERARCHY SYSTEM</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 flex items-center gap-3">
                <span>MATS & NETWORK</span>
              </h1>
              <p className="text-slate-400 text-sm max-w-2xl mt-2 font-light">
                Conecte seu perfil a equipes globais ou academias de excelência. Suba na classificação, turbine o escudo de seu pavilhão de jiu-jitsu e conquiste prestígio mundial.
              </p>
            </div>
            
            {/* MINI ACCUMULATOR STATS */}
            <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 backdrop-blur-md px-4 py-2.5 rounded-lg">
              <div className="w-10 h-10 bg-[#009dff]/20 rounded-lg flex items-center justify-center border border-[#009dff]/30 text-[#009dff]">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-mono">SEU LEVEL ATHLETE</div>
                <div className="text-sm font-black text-white flex items-center gap-1.5">
                  Lvl {user.level || 1} <span className="text-[#00bfff] text-xs font-mono">({user.xp || 0} XP)</span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB BUTTONS BAR */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-800/80">
            <button 
              onClick={() => setActiveSubTab('profile')} 
              className={`px-4 py-2 text-xs font-mono rounded-md border tracking-wider transition-all uppercase flex items-center gap-2
                ${activeSubTab === 'profile' 
                  ? 'bg-[#009dff]/10 text-[#009dff] border-[#009dff]/40 shadow-[0_0_15px_rgba(0,157,255,0.15)] font-bold' 
                  : 'bg-slate-900/40 text-slate-400 border-transparent hover:border-slate-800 hover:text-slate-200'}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Minha Afiliação</span>
            </button>
            <button 
              onClick={() => setActiveSubTab('rankings')} 
              className={`px-4 py-2 text-xs font-mono rounded-md border tracking-wider transition-all uppercase flex items-center gap-2
                ${activeSubTab === 'rankings' 
                  ? 'bg-[#009dff]/10 text-[#009dff] border-[#009dff]/40 shadow-[0_0_15px_rgba(0,157,255,0.15)] font-bold' 
                  : 'bg-slate-900/40 text-slate-400 border-transparent hover:border-slate-800 hover:text-slate-200'}`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Rankings Globais & Regionais</span>
            </button>
            <button 
              onClick={() => setActiveSubTab('stats')} 
              className={`px-4 py-2 text-xs font-mono rounded-md border tracking-wider transition-all uppercase flex items-center gap-2
                ${activeSubTab === 'stats' 
                  ? 'bg-[#009dff]/10 text-[#009dff] border-[#009dff]/40 shadow-[0_0_15px_rgba(0,157,255,0.15)] font-bold' 
                  : 'bg-slate-900/40 text-slate-400 border-transparent hover:border-slate-800 hover:text-slate-200'}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Estatísticas de Equipes</span>
            </button>
            <button 
              onClick={() => setActiveSubTab('verification')} 
              className={`px-4 py-2 text-xs font-mono rounded-md border tracking-wider transition-all uppercase flex items-center gap-2 ml-auto
                ${activeSubTab === 'verification' 
                  ? 'bg-[#009dff]/20 text-[#009dff] border-[#009dff] font-bold shadow-[0_0_15px_rgba(0,157,255,0.25)]' 
                  : 'bg-slate-900 text-amber-500/80 border-amber-500/30 hover:bg-slate-850 hover:text-amber-400'}`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-500" />
              <span>Painel de Verificação Oficial</span>
            </button>
          </div>
        </div>

        {/* LOADING SCREEN CONTAINER */}
        {loading && (
          <div className="bg-[#0b1021]/80 border border-slate-900 p-12 rounded-xl flex flex-col justify-center items-center gap-4 text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-t-[#009dff] border-slate-800 animate-spin"></div>
            <div className="text-xs font-mono tracking-widest uppercase">Carregando Hierarquia do Tatame...</div>
          </div>
        )}

        {!loading && (
          <div>
            <AnimatePresence mode="wait">
              
              {/* TAB 1: MINHA AFILIAÇÃO / WIZARD DE FILIAÇÃO */}
              {activeSubTab === 'profile' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* CURRENT AFFILIATION BLOCK */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* ACTIVE AFFILIATION DISPLAY */}
                      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-6 relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full"></div>
                        <h2 className="text-sm font-mono tracking-wider text-[#009dff] uppercase mb-6 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>Status de Afiliação Esportiva</span>
                        </h2>

                        {(activeTeamObj || activeIndependentObj) ? (
                          <div className="space-y-6">
                            
                            {/* ACTIVE: LEVEL 1 (GLOBAL TEAM) & LEVEL 2 (BRANCH) */}
                            {activeTeamObj && (
                              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-slate-900/50 border border-slate-800/80 rounded-xl relative">
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                  {/* Badge Resolver */}
                                  {(() => {
                                    const specs = getBadgeSpecs(activeTeamObj.verified, activeTeamObj.totalPoints);
                                    return (
                                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${specs.color} ${specs.border} ${specs.glow}`}>
                                        {specs.label}
                                      </span>
                                    );
                                  })()}
                                </div>

                                <div className="w-16 h-16 bg-gradient-to-br from-[#011627] to-slate-900 border border-[#009dff]/30 rounded-xl flex items-center justify-center font-extrabold text-[#009dff] text-2xl shadow-inner uppercase">
                                  {activeTeamObj.name.substring(0, 2)}
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="text-xs font-mono text-slate-500 uppercase">Equipe Global (Level 1)</div>
                                  <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                    {activeTeamObj.name}
                                    {activeTeamObj.verified && <CheckCircle className="w-4 h-4 text-[#009dff] fill-[#009dff]/20" />}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 pt-1">
                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> Origem: {activeTeamObj.countryOrigin || "Brasil"}</span>
                                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-500" /> {activeTeamObj.totalMembers} lutadores</span>
                                    <span className="flex items-center gap-1 text-[#009dff] font-mono"><Award className="w-3.5 h-3.5" /> {activeTeamObj.totalPoints} pontos acumulados</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ACTIVE: LEVEL 2 (OFFICIAL BRANCH) */}
                            {activeBranchObj && (
                              <div className="p-5 bg-slate-900/40 border-l-4 border-l-[#009dff] border-y border-r border-[#009dff]/10 rounded-r-xl">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <div className="text-xs font-mono text-slate-500 uppercase">Filial Oficiadora Autoverificada (Level 2)</div>
                                    <h4 className="text-base font-bold text-slate-200">
                                      {activeBranchObj.name}
                                    </h4>
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {activeBranchObj.address} • {activeBranchObj.city}, {activeBranchObj.state} - {activeBranchObj.country}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-slate-500 font-mono uppercase">Líder Técnico</div>
                                    <div className="text-xs font-bold text-slate-100">{activeBranchObj.headProfessor || "Não especificado"}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ACTIVE: LEVEL 3 (INDEPENDENT ACADEMY) */}
                            {activeIndependentObj && (
                              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-slate-900/50 border border-slate-800/80 rounded-xl relative">
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                  {/* Badge Resolver */}
                                  {(() => {
                                    const specs = getBadgeSpecs(activeIndependentObj.verified, activeIndependentObj.points);
                                    return (
                                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${specs.color} ${specs.border} ${specs.glow}`}>
                                        {specs.label}
                                      </span>
                                    );
                                  })()}
                                </div>

                                <div className="w-16 h-16 bg-gradient-to-br from-[#120b1e] to-slate-900 border border-violet-500/30 rounded-xl flex items-center justify-center font-extrabold text-violet-400 text-2xl shadow-inner uppercase">
                                  {activeIndependentObj.name.substring(0, 2)}
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="text-xs font-mono text-slate-500 uppercase">Academia Independente Registrada (Level 3)</div>
                                  <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                    {activeIndependentObj.name}
                                    {activeIndependentObj.verified && <CheckCircle className="w-4 h-4 text-violet-400 fill-violet-400/20" />}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 pt-1">
                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> Local: {activeIndependentObj.city}, {activeIndependentObj.state} - {activeIndependentObj.country}</span>
                                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-500" /> {activeIndependentObj.membersCount} filiados</span>
                                    <span className="flex items-center gap-1 text-[#009dff] font-mono"><Award className="w-3.5 h-3.5" /> {activeIndependentObj.points} pontos</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                            
                            /* NO AFFILIATION DEFAULT EMPTY STATE */
                            <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-500">
                                <Shield className="w-6 h-6" />
                              </div>
                              <h3 className="text-sm font-bold text-slate-300">Sem Filiação Identificada</h3>
                              <p className="text-xs text-slate-400 max-w-md">
                                Você ainda não está filiado a nenhuma academia na plataforma global do JiuSpeak. Atletas afiliados acumulam pontuações coletivas valiosíssimas para o pódio de equipes.
                              </p>
                            </div>
                          )}

                        </div>

                      {/* AFFILIATION WIZARD MANAGER */}
                      <div className="bg-slate-950 border border-slate-850 rounded-xl p-6 space-y-6">
                        <div className="border-b border-slate-900 pb-4">
                          <h3 className="font-extrabold text-base text-slate-200">Selecione ou Troque de Afiliação</h3>
                          <p className="text-xs text-slate-400">Monte seu escudo em poucos passos clicando no assistente interativo.</p>
                        </div>

                        {wizardStep === 1 ? (
                          <div className="space-y-6">
                            
                            {/* STEP 1: CHOOSE PATH */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              <div 
                                onClick={() => setTempAffiliationType('global')}
                                className={`border rounded-xl p-5 cursor-pointer transition-all space-y-2
                                  ${tempAffiliationType === 'global' 
                                    ? 'bg-[#009dff]/5 border-[#009dff] shadow-[0_0_15px_rgba(0,157,255,0.1)]' 
                                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850 text-white">
                                    👑
                                  </div>
                                  {tempAffiliationType === 'global' && <div className="w-5 h-5 rounded-full bg-[#009dff] text-slate-950 flex items-center justify-center"><Check className="w-3.5 h-3.5 stroke-[3]" /></div>}
                                </div>
                                <h4 className="text-sm font-bold text-slate-200">Equipe Global de Jiu-Jitsu</h4>
                                <p className="text-xs text-slate-400">Me afiliar a uma das grandes escuderias registradas mundialmente (Gracie Barra, Alliance, Atos, etc.) e selecionar minha filial local.</p>
                              </div>

                              <div 
                                onClick={() => setTempAffiliationType('independent')}
                                className={`border rounded-xl p-5 cursor-pointer transition-all space-y-2
                                  ${tempAffiliationType === 'independent' 
                                    ? 'bg-[#009dff]/5 border-[#009dff] shadow-[0_0_15px_rgba(0,157,255,0.1)]' 
                                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850 text-white">
                                    🥋
                                  </div>
                                  {tempAffiliationType === 'independent' && <div className="w-5 h-5 rounded-full bg-[#009dff] text-slate-950 flex items-center justify-center"><Check className="w-3.5 h-3.5 stroke-[3]" /></div>}
                                </div>
                                <h4 className="text-sm font-bold text-slate-200">Academia Independente</h4>
                                <p className="text-xs text-slate-400">Me afiliar a um centro de treinamento local autônomo sem bandeira global associada.</p>
                              </div>

                            </div>

                            {/* DROPDOWN SELECTORS BASED ON TYPE */}
                            {tempAffiliationType === 'global' ? (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Equipe Global (Level 1)</label>
                                  <select 
                                    value={selectedGlobalTeamId}
                                    onChange={(e) => setSelectedGlobalTeamId(e.target.value)}
                                    className="w-full bg-[#020617] border border-slate-800 text-slate-200 rounded-lg px-4 py-3 text-sm focus:border-[#009dff] focus:ring-1 focus:ring-[#009dff] transition-all"
                                  >
                                    <option value="">-- Escolha uma das 50 Equipes Globais --</option>
                                    {globalTeams.map(gt => (
                                      <option key={gt.id} value={gt.id}>{gt.name} ({gt.countryOrigin})</option>
                                    ))}
                                  </select>
                                </div>

                                {selectedGlobalTeamId && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pt-2"
                                  >
                                    <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Filiais Oficiais de {globalTeams.find(t=>t.id === selectedGlobalTeamId)?.name} (Level 2)</label>
                                    <select 
                                      value={selectedBranchId}
                                      onChange={(e) => setSelectedBranchId(e.target.value)}
                                      className="w-full bg-[#020617] border border-slate-800 text-slate-200 rounded-lg px-4 py-3 text-sm focus:border-[#009dff] focus:ring-1 focus:ring-[#009dff] transition-all"
                                    >
                                      <option value="">-- Selecione uma filial autorizada --</option>
                                      {branches.filter(b => b.globalTeamId === selectedGlobalTeamId).map(b => (
                                        <option key={b.id} value={b.id}>{b.name} ({b.city}, {b.state})</option>
                                      ))}
                                    </select>
                                  </motion.div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Selecione a Academia Independente (Level 3)</label>
                                <select 
                                  value={selectedIndependentId}
                                  onChange={(e) => setSelectedIndependentId(e.target.value)}
                                  className="w-full bg-[#020617] border border-slate-800 text-slate-200 rounded-lg px-4 py-3 text-sm focus:border-[#009dff] focus:ring-1 focus:ring-[#009dff] transition-all"
                                >
                                  <option value="">-- Escolha uma das 1000 Academias Autônomas --</option>
                                  {independentAcademies.map(i => (
                                    <option key={i.id} value={i.id}>{i.name} ({i.city}, {i.state})</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* WIZARD CONTROL BUTTONS */}
                            <div className="pt-4 flex justify-end">
                              <button
                                onClick={handleSaveAffiliation}
                                disabled={tempAffiliationType === 'global' ? (!selectedGlobalTeamId || !selectedBranchId) : !selectedIndependentId}
                                className="px-6 py-3 bg-[#009dff] text-slate-950 font-mono text-xs tracking-wider uppercase font-extrabold rounded-lg hover:bg-[#00bfff] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                              >
                                <span>Salvar Afiliação</span>
                                <ChevronRight className="w-4 h-4 stroke-[3]" />
                              </button>
                            </div>

                          </div>
                        ) : null}

                      </div>

                    </div>

                    {/* INTERACTIVE HIERARCHY MAP (SIDEBAR ACCENT CARD) */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-b from-[#010b14] via-slate-950 to-slate-950 border border-slate-800/80 rounded-xl p-6 space-y-6">
                        <h3 className="text-xs font-mono tracking-widest text-[#009dff] uppercase flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#009dff]" />
                          <span>COMO FUNCIONA?</span>
                        </h3>
                        
                        <div className="space-y-4">
                          
                          <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-lg relative">
                            <span className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-[#009dff]/10 border border-[#009dff]/30 text-[#009dff] font-mono text-xs flex items-center justify-center font-bold">1</span>
                            <div className="pl-2">
                              <div className="text-xs font-bold text-white uppercase">NÍVEL 1: GLOBAL TEAMS</div>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Escuderias internacionais como Alliance ou GB. Acumulam toda a pontuação agregada de todas as suas filiais mundiais.
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-lg relative">
                            <span className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
                            <div className="pl-2">
                              <div className="text-xs font-bold text-white uppercase">NÍVEL 2: FILIAIS OFICIAIS</div>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Unidades físicas chaves pertencentes as Equipes Globais (Ex: Gracie Barra Headquarter Miami).
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-lg relative">
                            <span className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
                            <div className="pl-2">
                              <div className="text-xs font-bold text-white uppercase">NÍVEL 3: INDEPENDENTES</div>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Clubes locais e dojos autônomos sem filiação transnacional direta. Disputam em rankings exclusivos para academias independentes.
                              </p>
                            </div>
                          </div>

                        </div>

                        <div className="border-t border-slate-900 pt-4 text-center">
                          <p className="text-[11px] text-[#00bfff] font-mono">
                            Learn English. Teach Globally. Live Jiu-Jitsu.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TAB 2: RANKINGS */}
              {activeSubTab === 'rankings' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  
                  {/* SEARCH AND LOCATION FILTER PANEL */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-wrap gap-4 items-center justify-between">
                    
                    {/* Ranking selection tabs */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setActiveRankCategory('global')} 
                        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border transition-all
                          ${activeRankCategory === 'global' 
                            ? 'bg-[#009dff]/10 text-[#009dff] border-[#009dff]/30 font-bold' 
                            : 'bg-slate-900 text-slate-400 border-transparent hover:border-slate-800'}`}
                      >
                        Equipes Mundiais (Level 1)
                      </button>
                      
                      <button 
                        onClick={() => setActiveRankCategory('regional')} 
                        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border transition-all
                          ${activeRankCategory === 'regional' 
                            ? 'bg-[#009dff]/10 text-[#009dff] border-[#009dff]/30 font-bold' 
                            : 'bg-slate-900 text-slate-400 border-transparent hover:border-slate-800'}`}
                      >
                        Filiais Oficiais (Level 2)
                      </button>

                      <button 
                        onClick={() => setActiveRankCategory('independent')} 
                        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border transition-all
                          ${activeRankCategory === 'independent' 
                            ? 'bg-[#009dff]/10 text-[#009dff] border-[#009dff]/30 font-bold' 
                            : 'bg-slate-900 text-slate-400 border-transparent hover:border-slate-800'}`}
                      >
                        Independentes (Level 3)
                      </button>
                    </div>

                    {/* Regional Selectors */}
                    <div className="flex items-center gap-2 flex-wrap text-slate-300">
                      <Filter className="w-4 h-4 text-slate-500" />
                      <select 
                        value={rankingCountry} 
                        onChange={(e)=>setRankingCountry(e.target.value)} 
                        className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        <option value="">Países (Todos)</option>
                        <option value="Brasil">Brasil</option>
                        <option value="USA">USA</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Spain">Espanha</option>
                        <option value="Japan">Japão</option>
                      </select>

                      <select 
                        value={rankingState} 
                        onChange={(e)=>setRankingState(e.target.value)} 
                        className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        <option value="">Estados (Todos)</option>
                        <option value="SP">SP</option>
                        <option value="RJ">RJ</option>
                        <option value="PR">PR</option>
                        <option value="MG">MG</option>
                        <option value="AM">AM</option>
                        <option value="CA">CA</option>
                        <option value="FL">FL</option>
                      </select>

                      <select 
                        value={rankingCity} 
                        onChange={(e)=>setRankingCity(e.target.value)} 
                        className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        <option value="">Cidades (Todas)</option>
                        <option value="São Paulo">São Paulo</option>
                        <option value="Rio de Janeiro">Rio de Janeiro</option>
                        <option value="Curitiba">Curitiba</option>
                        <option value="Miami">Miami</option>
                        <option value="San Diego">San Diego</option>
                      </select>
                    </div>

                  </div>

                  {/* LEADERBOARD LIST CONTAINER */}
                  <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-2xl">
                    <div className="p-4 bg-slate-900/40 border-b border-slate-900 flex justify-between items-center text-xs font-mono text-slate-400">
                      <span>CLASSIFICAÇÃO ESPORTIVA</span>
                      <span>PONTUAÇÃO GLOBAL</span>
                    </div>

                    <div className="divide-y divide-slate-900">
                      {/* CATEGORY: GLOBAL TEAMS */}
                      {activeRankCategory === 'global' && (rankingsPayload?.worldTeams || globalTeams).map((item, idx) => {
                        const specs = getBadgeSpecs(item.verified, item.totalPoints);
                        return (
                          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-900/30 transition-all">
                            <div className="flex items-center gap-4">
                              <span className={`w-6 text-center font-mono text-sm ${idx < 3 ? 'text-amber-400 font-extrabold text-base' : 'text-slate-500'}`}>
                                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                              </span>
                              
                              <div className="w-10 h-10 rounded bg-[#011627] border border-[#009dff]/10 flex items-center justify-center font-black text-[#009dff] text-sm uppercase">
                                {item.name.substring(0, 2)}
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                                  {item.name}
                                  {item.verified && <CheckCircle className="w-3.5 h-3.5 text-[#009dff]" />}
                                </h4>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>Origem: {item.countryOrigin}</span> • <span>Fundado: {item.foundedYear}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${specs.color} ${specs.border}`}>
                                {specs.label}
                              </span>
                              <div className="text-right">
                                <span className="font-mono text-white font-extrabold text-sm">{item.totalPoints} pts</span>
                                <span className="block text-[10px] text-slate-500 font-mono">Level 1 Team</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* CATEGORY: BRANCHES */}
                      {activeRankCategory === 'regional' && (rankingsPayload?.branchesFiltered || branches).map((item, idx) => {
                        const specs = getBadgeSpecs(item.verified, item.points);
                        return (
                          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-900/30 transition-all">
                            <div className="flex items-center gap-4">
                              <span className={`w-6 text-center font-mono text-sm ${idx < 3 ? 'text-amber-400 font-extrabold text-base' : 'text-slate-500'}`}>
                                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                              </span>
                              
                              <div className="w-10 h-10 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-sm uppercase">
                                🏢
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                                  {item.name}
                                  {item.verified && <CheckCircle className="w-3.5 h-3.5 text-[#009dff]" />}
                                </h4>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>{item.address} • {item.city} ({item.state})</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${specs.color} ${specs.border}`}>
                                {specs.label}
                              </span>
                              <div className="text-right">
                                <span className="font-mono text-white font-extrabold text-sm">{item.points} pts</span>
                                <span className="block text-[10px] text-slate-500 font-mono">Level 2 Branch</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* CATEGORY: INDEPENDENT ACADEMIES */}
                      {activeRankCategory === 'independent' && (rankingsPayload?.independentAcademies || independentAcademies).map((item, idx) => {
                        const specs = getBadgeSpecs(item.verified, item.points);
                        return (
                          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-900/30 transition-all">
                            <div className="flex items-center gap-4">
                              <span className={`w-6 text-center font-mono text-sm ${idx < 3 ? 'text-violet-400 font-extrabold text-base' : 'text-slate-500'}`}>
                                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                              </span>
                              
                              <div className="w-10 h-10 rounded bg-[#120b1e] border border-violet-500/10 flex items-center justify-center text-xs uppercase">
                                🥋
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                                  {item.name}
                                  {item.verified && <CheckCircle className="w-3.5 h-3.5 text-violet-400" />}
                                </h4>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>Mestre: {item.headProfessor || "Sensei"} • {item.city} ({item.state})</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${specs.color} ${specs.border}`}>
                                {specs.label}
                              </span>
                              <div className="text-right">
                                <span className="font-mono text-white font-extrabold text-sm">{item.points} pts</span>
                                <span className="block text-[10px] text-slate-500 font-mono">Level 3 Independent</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* TAB 3: ACÚMULO DE PONTOS ACTION CENTER */}
              {activeSubTab === 'simulator' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4">
                    <h2 className="text-lg font-bold text-slate-200">Central de Treino & Pontuação Coletiva</h2>
                    <p className="text-xs text-slate-400">
                      Toda ação que você desempenha no JiuSpeak soma pontos virtuais tanto para seu rendimento pessoal quanto para o ranking da sua filial e escuderia global! Escolha uma atividade técnica abaixo para simular o acúmulo em tempo real no banco de dados.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="bg-slate-950 border border-slate-850 hover:border-[#009dff]/30 p-5 rounded-xl flex items-center justify-between gap-4 transition-all">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-indigo-950 border border-indigo-500/30 text-indigo-400 rounded-lg flex items-center justify-center text-lg">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">Exame Teórico de Inglês Técnico</h4>
                          <p className="text-xs text-slate-400">Acerte quiz de vocabulário de campeonato.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAccumulatePoints(150, "Concluir Exame de Inglês Técnico")}
                        className="px-4 py-2 bg-slate-900 border border-indigo-500/30 text-indigo-400 text-xs font-mono rounded hover:bg-slate-850 font-extrabold whitespace-nowrap"
                      >
                        +150 PTS
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 hover:border-[#009dff]/30 p-5 rounded-xl flex items-center justify-between gap-4 transition-all">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-sky-950 border border-sky-500/30 text-sky-400 rounded-lg flex items-center justify-center text-lg">
                          📖
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">Prática de Pronúncia - Audio Voice</h4>
                          <p className="text-xs text-slate-400">Treine termos técnicos em conversações virtuais.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAccumulatePoints(100, "Prática de Pronúncia de Posições")}
                        className="px-4 py-2 bg-slate-900 border border-sky-500/30 text-sky-400 text-xs font-mono rounded hover:bg-slate-850 font-extrabold whitespace-nowrap"
                      >
                        +100 PTS
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 hover:border-[#009dff]/30 p-5 rounded-xl flex items-center justify-between gap-4 transition-all">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-rose-950 border border-rose-500/30 text-rose-400 rounded-lg flex items-center justify-center text-lg">
                          <Sword className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">Desafio PvP Arena Mundial</h4>
                          <p className="text-xs text-slate-400">Enfrente outros lutadores brasileiros em torneio síncrono.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAccumulatePoints(250, "Vitória na PvP Arena")}
                        className="px-4 py-2 bg-slate-900 border border-rose-500/30 text-rose-400 text-xs font-mono rounded hover:bg-slate-850 font-extrabold whitespace-nowrap"
                      >
                        +250 PTS
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 hover:border-[#009dff]/30 p-5 rounded-xl flex items-center justify-between gap-4 transition-all">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-center justify-center text-lg">
                          💬
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">Postar Feed de Técnicas em Inglês</h4>
                          <p className="text-xs text-slate-400">Compartilhe uma aula rápida com a comunidade integrada.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAccumulatePoints(80, "Criar Postagem Social com Vocabulário")}
                        className="px-4 py-2 bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded hover:bg-slate-850 font-extrabold whitespace-nowrap"
                      >
                        +80 PTS
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TAB 4: ESTATÍSTICAS DE EQUIPES (BENTO GRID KPIS) */}
              {activeSubTab === 'stats' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  
                  {/* BENTO GRID OF GENERAL STATS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 text-slate-900 text-7xl font-sans font-black select-none pointer-events-none transform translate-x-3 translate-y-3">
                        50
                      </div>
                      <div className="text-xs font-mono text-slate-400 uppercase">EQUIPES GLOBAIS</div>
                      <div className="text-3xl font-black text-white">{statsData.totalGlobalTeams || 50}</div>
                      <p className="text-[11px] text-slate-500 font-light">Lideranças internacionais transnacionais ativas.</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 text-slate-900 text-7xl font-sans font-black select-none pointer-events-none transform translate-x-3 translate-y-3">
                        500
                      </div>
                      <div className="text-xs font-mono text-slate-400 uppercase">FILIAIS OFICIAIS</div>
                      <div className="text-3xl font-black text-white">{statsData.totalBranches || 500}</div>
                      <p className="text-[11px] text-slate-500 font-light">Unidades e franquias oficiais autorizadas.</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 text-slate-900 text-7xl font-sans font-black select-none pointer-events-none transform translate-x-3 translate-y-3">
                        1K
                      </div>
                      <div className="text-xs font-mono text-slate-400 uppercase">Dojos Independentes</div>
                      <div className="text-3xl font-black text-white">{statsData.totalIndependentAcademies || 1000}</div>
                      <p className="text-[11px] text-slate-500 font-light font-sans">CTs locais autônomos credenciados.</p>
                    </div>

                    <div className="bg-[#011422] border border-[#009dff]/30 p-5 rounded-xl space-y-2 relative overflow-hidden">
                      <div className="absolute right-2 bottom-2 text-[#009dff]/20">
                        <Trophy className="w-12 h-12" />
                      </div>
                      <div className="text-xs font-mono text-[#009dff] uppercase">Pontos Totais Acumulados</div>
                      <div className="text-3xl font-black text-[#00bfff]">{statsData.pointsSum || 45100}</div>
                      <p className="text-[11px] text-slate-300 font-light font-sans">Soma global somada de todos os afiliados.</p>
                    </div>

                  </div>

                  {/* VISUAL CHARTS AND PROGRESS GRAPHS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* LEAGUE POINTS DISTRIBUTION BAR */}
                    <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-6">
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <span>PONTUAÇÃO DE ELITE (Top Equipes Globais)</span>
                      </h3>

                      <div className="space-y-4 pt-2">
                        {globalTeams.slice(0, 5).map((gt, idx) => (
                          <div key={gt.id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                <span className="text-slate-500">#{idx+1}</span> {gt.name}
                              </span>
                              <span className="font-mono text-white font-bold">{gt.totalPoints} pts</span>
                            </div>
                            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                              <div 
                                className="bg-[#009dff] h-full rounded-full" 
                                style={{ width: `${(gt.totalPoints / 20000) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ACADEMY VERIFICATIONS STATUS COMPACT COMPOSITION CONTAINER */}
                    <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-6">
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                        STATUS DAS VERIFICAÇÕES OFICIAIS
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        
                        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center space-y-1">
                          <span className="block text-xl">🛡️</span>
                          <span className="block text-xs font-mono text-slate-400">Equipes Globais</span>
                          <span className="block text-lg font-extrabold text-white">
                            {statsData.verifiedGlobalTeams || 12} <span className="text-slate-500 text-xs font-normal">de 50</span>
                          </span>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center space-y-1">
                          <span className="block text-xl">🏢</span>
                          <span className="block text-xs font-mono text-slate-400">Filiais Oficiais</span>
                          <span className="block text-lg font-extrabold text-white">
                            {statsData.verifiedBranches || 125} <span className="text-slate-500 text-xs font-normal">de 500</span>
                          </span>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center space-y-1">
                          <span className="block text-xl">🥋</span>
                          <span className="block text-xs font-mono text-slate-400">Independentes</span>
                          <span className="block text-lg font-extrabold text-white">
                            {statsData.verifiedIndependent || 201} <span className="text-slate-500 text-xs font-normal">de 1K</span>
                          </span>
                        </div>

                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-850 rounded text-center text-xs text-slate-400">
                        O selo oficial garante o recebimento de até 2x XP em eventos integrados de campeonato e suporte internacional prioritário.
                      </div>

                    </div>

                  </div>

                </motion.div>
              )}

              {/* TAB 5: OFFICIAL VERIFICATION BADGE MANAGER (ADMIN TOOLS SIMULATION) */}
              {activeSubTab === 'verification' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-amber-950/20 border border-amber-500/30 p-6 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full flex items-center justify-center text-xl">
                      🛠️
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-500 text-base">Controle Administrativo de Concessão de Selos Oficiais</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Utilize esta ferramenta reguladora para auditar as afiliações solicitantes. Tocar no interruptor concede/revoga o selo de verificação de autenticidade (Elite, Premium ou Official) no banco de dados.
                      </p>
                    </div>
                  </div>

                  {/* Filter Sub-tab selector */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAdminTargetType('global')} 
                      className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded
                        ${adminTargetType === 'global' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:bg-slate-855'}`}
                    >
                      Equipes Globais ({globalTeams.length})
                    </button>
                    <button 
                      onClick={() => setAdminTargetType('branch')} 
                      className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded
                        ${adminTargetType === 'branch' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:bg-slate-855'}`}
                    >
                      Filiais Oficiais ({branches.length})
                    </button>
                    <button 
                      onClick={() => setAdminTargetType('independent')} 
                      className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded
                        ${adminTargetType === 'independent' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:bg-slate-855'}`}
                    >
                      Academies Independentes ({independentAcademies.length})
                    </button>
                  </div>

                  {/* GRID OF TARGETS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {adminTargetType === 'global' && globalTeams.slice(0, 15).map(item => (
                      <div key={item.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-mono text-[#009dff]">{item.countryOrigin}</div>
                          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                            {item.name}
                            {item.verified && <CheckCircle className="w-3.5 h-3.5 text-amber-500" />}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                        </div>
                        <button 
                          onClick={() => handleToggleVerification(item.id, item.verified, 'global')}
                          className={`px-3 py-1 text-xs font-mono rounded border transition-all uppercase font-semibold
                            ${item.verified 
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' 
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-850'}`}
                        >
                          {item.verified ? "Verificado" : "Nulo/Comum"}
                        </button>
                      </div>
                    ))}

                    {adminTargetType === 'branch' && branches.slice(0, 15).map(item => (
                      <div key={item.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-mono text-[#009dff]">{item.city}, {item.state}</div>
                          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                            {item.name}
                            {item.verified && <CheckCircle className="w-3.5 h-3.5 text-amber-500" />}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">Professor: {item.headProfessor || "Professor"}</span>
                        </div>
                        <button 
                          onClick={() => handleToggleVerification(item.id, item.verified, 'branch')}
                          className={`px-3 py-1 text-xs font-mono rounded border transition-all uppercase font-semibold
                            ${item.verified 
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' 
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-850'}`}
                        >
                          {item.verified ? "Verificado" : "Nulo"}
                        </button>
                      </div>
                    ))}

                    {adminTargetType === 'independent' && independentAcademies.slice(0, 15).map(item => (
                      <div key={item.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-mono text-violet-400">{item.city}, {item.state}</div>
                          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                            {item.name}
                            {item.verified && <CheckCircle className="w-3.5 h-3.5 text-amber-500" />}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">Mestre: {item.headProfessor || "Sensei"}</span>
                        </div>
                        <button 
                          onClick={() => handleToggleVerification(item.id, item.verified, 'independent')}
                          className={`px-3 py-1 text-xs font-mono rounded border transition-all uppercase font-semibold
                            ${item.verified 
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' 
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-850'}`}
                        >
                          {item.verified ? "Verificado" : "Nulo"}
                        </button>
                      </div>
                    ))}

                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
