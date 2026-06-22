import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Send, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  Users, 
  Award,
  ArrowRight
} from 'lucide-react';
import { authFetch } from '../utils/authFetch';

export default function AcademiesModule() {
  const [loading, setLoading] = useState(false);
  const [globals, setGlobals] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [independents, setIndependents] = useState<any[]>([]);
  
  // Create / Edit states
  const [activeSubTab, setActiveSubTab] = useState<'globals' | 'branches' | 'independents'>('globals');
  
  // Forms states
  const [showForm, setShowForm] = useState<string | null>(null); // 'create-global' | 'edit-global' | 'create-branch' | 'edit-branch' | 'create-independent' | 'edit-independent' | 'transfer-branch'
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form values
  const [globalName, setGlobalName] = useState('');
  const [globalLogo, setGlobalLogo] = useState('');
  const [globalBio, setGlobalBio] = useState('');
  const [globalWebsite, setGlobalWebsite] = useState('');
  
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchState, setBranchState] = useState('');
  const [branchCountry, setBranchCountry] = useState('Brasil');
  const [branchProfessor, setBranchProfessor] = useState('');
  const [branchGlobalId, setBranchGlobalId] = useState('');
  
  const [indName, setIndName] = useState('');
  const [indCity, setIndCity] = useState('');
  const [indState, setIndState] = useState('');
  const [indCountry, setIndCountry] = useState('Brasil');
  const [indProfessor, setIndProfessor] = useState('');
  
  const [targetGlobalId, setTargetGlobalId] = useState(''); // for transfer branch

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch Globals
      const resG = await fetch('/api/academy/globals');
      if (resG.ok) {
        const data = await resG.json();
        setGlobals(data.globalTeams || data || []);
      }
      
      // Fetch Branches
      const resB = await fetch('/api/academy/branches');
      if (resB.ok) {
        const data = await resB.json();
        setBranches(data.branches || data || []);
      }

      // Fetch Independents
      const resI = await fetch('/api/academy/independents');
      if (resI.ok) {
        const data = await resI.json();
        setIndependents(data.independentAcademies || data || []);
      }
    } catch (e) {
      console.error(e);
      showToast("Erro de rede ao carregar as academias.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // CRUD Globals
  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalName.trim()) return showToast("Nome da equipe é obrigatório.", "error");
    
    try {
      const isEdit = showForm === 'edit-global';
      const url = isEdit ? `/api/academy/globals/${selectedItem.id}` : '/api/academy/globals';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: globalName,
          logoUrl: globalLogo,
          bio: globalBio,
          website: globalWebsite
        })
      });

      if (res.ok) {
        showToast(isEdit ? "Equipe Global editada com sucesso!" : "Equipe Global criada com sucesso!", "success");
        setShowForm(null);
        setSelectedItem(null);
        clearGlobalForm();
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.error || "Fracasso na gravação da equipe.", "error");
      }
    } catch (err) {
      showToast("Erro na comunicação das academias.", "error");
    }
  };

  const clearGlobalForm = () => {
    setGlobalName('');
    setGlobalLogo('');
    setGlobalBio('');
    setGlobalWebsite('');
  };

  const handleEditGlobalClick = (item: any) => {
    setSelectedItem(item);
    setGlobalName(item.name || '');
    setGlobalLogo(item.logoUrl || '');
    setGlobalBio(item.bio || '');
    setGlobalWebsite(item.website || '');
    setShowForm('edit-global');
  };

  const handleDeleteGlobal = async (id: string) => {
    if (!window.confirm("Deseja realmente REMOVER esta Equipe Global do banco de dados?")) return;
    try {
      const res = await authFetch(`/api/academy/globals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Equipe excluída com sucesso!", "success");
        fetchAllData();
      } else {
        showToast("Erro ao excluir equipe global.", "error");
      }
    } catch (e) {
      showToast("Falha de rede.", "error");
    }
  };

  const handleVerifyGlobal = async (id: string, current: boolean) => {
    try {
      const res = await authFetch(`/api/academy/globals/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !current })
      });
      if (res.ok) {
        showToast(!current ? "Afiliação Verificada e homologada com selo oficial!" : "Selo de verificação retirado.", "success");
        fetchAllData();
      } else {
        showToast("Falha ao atualizar selo.", "error");
      }
    } catch (e) {
      showToast("Erro técnico na rede.", "error");
    }
  };

  // CRUD Branches
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return showToast("Nome da filial é obrigatório.", "error");
    if (!branchGlobalId) return showToast("Selecione a Equipe Global associada.", "error");
    
    try {
      const isEdit = showForm === 'edit-branch';
      const url = isEdit ? `/api/academy/branches/${selectedItem.id}` : '/api/academy/branches';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: branchName,
          city: branchCity,
          state: branchState,
          country: branchCountry,
          professor: branchProfessor,
          globalTeamId: branchGlobalId
        })
      });

      if (res.ok) {
        showToast(isEdit ? "Filial editada com sucesso!" : "Filial criada com sucesso!", "success");
        setShowForm(null);
        setSelectedItem(null);
        clearBranchForm();
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.error || "Fracasso na gravação da filial.", "error");
      }
    } catch (err) {
      showToast("Erro de rede.", "error");
    }
  };

  const clearBranchForm = () => {
    setBranchName('');
    setBranchCity('');
    setBranchState('');
    setBranchCountry('Brasil');
    setBranchProfessor('');
    setBranchGlobalId('');
  };

  const handleEditBranchClick = (item: any) => {
    setSelectedItem(item);
    setBranchName(item.name || '');
    setBranchCity(item.city || '');
    setBranchState(item.state || '');
    setBranchCountry(item.country || 'Brasil');
    setBranchProfessor(item.professor || '');
    setBranchGlobalId(item.globalTeamId || '');
    setShowForm('edit-branch');
  };

  const handleDeleteBranch = async (id: string) => {
    if (!window.confirm("Deseja realmente EXCLUIR esta Filial do banco de dados?")) return;
    try {
      const res = await authFetch(`/api/academy/branches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Filial BJJ excluída do mapa!", "success");
        fetchAllData();
      } else {
        showToast("Erro ao excluir filial.", "error");
      }
    } catch (e) {
      showToast("Falha de rede.", "error");
    }
  };

  const handleVerifyBranch = async (id: string, current: boolean) => {
    try {
      const res = await authFetch(`/api/academy/branches/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !current })
      });
      if (res.ok) {
        showToast(!current ? "Filial do Dojo Homologada e Verificada!" : "Selo de filial retirado.", "success");
        fetchAllData();
      } else {
        showToast("Falha ao calibrar verificação.", "error");
      }
    } catch (e) {
      showToast("Erro de conexão.", "error");
    }
  };

  const handleTransferBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGlobalId) return showToast("Escolha a nova Equipe Global para transferência.", "error");
    try {
      const res = await authFetch(`/api/academy/branches/${selectedItem.id}/transfer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newGlobalTeamId: targetGlobalId })
      });
      if (res.ok) {
        showToast("Filial transferida com sucesso integrando nova bandeira global!", "success");
        setShowForm(null);
        setSelectedItem(null);
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.error || "Fracasso na transferência comercial.", "error");
      }
    } catch (e) {
      showToast("Erro de comunicação.", "error");
    }
  };

  // CRUD Independents
  const handleSaveIndependent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indName.trim()) return showToast("Nome da academia é obrigatório.", "error");
    
    try {
      const isEdit = showForm === 'edit-independent';
      const url = isEdit ? `/api/academy/independents/${selectedItem.id}` : '/api/academy/independents';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: indName,
          city: indCity,
          state: indState,
          country: indCountry,
          professor: indProfessor
        })
      });

      if (res.ok) {
        showToast(isEdit ? "Academia independente gravada com êxito!" : "Academia independente cadastrada no mapa!", "success");
        setShowForm(null);
        setSelectedItem(null);
        clearIndependentForm();
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.error || "Fracasso ao gravar academia independente.", "error");
      }
    } catch (err) {
      showToast("Erro na requisição técnica.", "error");
    }
  };

  const clearIndependentForm = () => {
    setIndName('');
    setIndCity('');
    setIndState('');
    setIndCountry('Brasil');
    setIndProfessor('');
  };

  const handleEditIndependentClick = (item: any) => {
    setSelectedItem(item);
    setIndName(item.name || '');
    setIndCity(item.city || '');
    setIndState(item.state || '');
    setIndCountry(item.country || 'Brasil');
    setIndProfessor(item.professor || '');
    setShowForm('edit-independent');
  };

  const handleDeleteIndependent = async (id: string) => {
    if (!window.confirm("Deseja realmente EXCLUIR esta Academia independente do banco de dados?")) return;
    try {
      const res = await authFetch(`/api/academy/independents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Academia independente excluída!", "success");
        fetchAllData();
      } else {
        showToast("Erro ao excluir academia.", "error");
      }
    } catch (e) {
      showToast("Falha de rede.", "error");
    }
  };

  const handleVerifyIndependent = async (id: string, current: boolean) => {
    try {
      const res = await authFetch(`/api/academy/independents/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !current })
      });
      if (res.ok) {
        showToast(!current ? "Academia Independente Homologada com Selo Verde!" : "Selo retirado.", "success");
        fetchAllData();
      } else {
        showToast("Erro ao arbitrar selo.", "error");
      }
    } catch (e) {
      showToast("Conexão técnica recusada.", "error");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl" id="admin-academies-panel">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-2xl border text-xs font-mono flex items-center gap-3 shadow-2xl transition-all ${
          toast.type === 'error' 
            ? 'bg-rose-950/90 border-rose-500/25 text-rose-300' 
            : 'bg-emerald-950/90 border-emerald-500/25 text-emerald-300'
        }`}>
          <span>{toast.type === 'error' ? '❌' : '⚡'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-xl text-slate-100 uppercase tracking-wider flex items-center gap-2">
            🥋 Torre de Academias & Bandeiras BJJ
          </h2>
          <p className="text-xs text-slate-450 mt-1">Defina bandeiras de redes internacionais, filiais regionais autorizadas, e centros de instrução independentes.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchAllData}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-xs flex items-center gap-1.5"
            title="Recarregar Bandeiras"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sincronizar</span>
          </button>
          
          <button
            onClick={() => {
              if (activeSubTab === 'globals') setShowForm('create-global');
              else if (activeSubTab === 'branches') setShowForm('create-branch');
              else setShowForm('create-independent');
            }}
            className="p-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-550 text-white font-bold transition-all cursor-pointer text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova {activeSubTab === 'globals' ? 'Equipe Global' : activeSubTab === 'branches' ? 'Filial Dojo' : 'Academia Independente'}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs controller */}
      <div className="flex border-b border-slate-800/80 gap-6">
        <button
          onClick={() => { setActiveSubTab('globals'); setShowForm(null); }}
          className={`pb-3 text-xs font-bold font-mono tracking-wider transition-all cursor-pointer relative ${
            activeSubTab === 'globals' ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeSubTab === 'globals' && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-violet-400 rounded-full" />}
          🌎 Equipes Globais ({globals.length})
        </button>

        <button
          onClick={() => { setActiveSubTab('branches'); setShowForm(null); }}
          className={`pb-3 text-xs font-bold font-mono tracking-wider transition-all cursor-pointer relative ${
            activeSubTab === 'branches' ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeSubTab === 'branches' && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-violet-400 rounded-full" />}
          🏢 Filiais Regionais ({branches.length})
        </button>

        <button
          onClick={() => { setActiveSubTab('independents'); setShowForm(null); }}
          className={`pb-3 text-xs font-bold font-mono tracking-wider transition-all cursor-pointer relative ${
            activeSubTab === 'independents' ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeSubTab === 'independents' && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-violet-400 rounded-full" />}
          🏝️ Independentes ({independents.length})
        </button>
      </div>

      {/* Modal / Form render block */}
      {showForm && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800/80 p-5 md:p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {showForm.startsWith('create') ? 'Cadastrar Novo Elemento' : showForm.startsWith('edit') ? 'Ajustar Cadastro' : 'Transferência de Bandeira'}
            </h3>
            <button 
              onClick={() => { setShowForm(null); setSelectedItem(null); }}
              className="text-xs text-slate-500 hover:text-slate-350 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          {/* Form Content selector */}
          {(showForm === 'create-global' || showForm === 'edit-global') && (
            <form onSubmit={handleSaveGlobal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Nome da Equipe</label>
                  <input 
                    type="text"
                    value={globalName}
                    onChange={(e) => setGlobalName(e.target.value)}
                    placeholder="Ex: Roger Gracie, Gracie Barra"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 font-sans focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">URL do Logotipo (Imagem)</label>
                  <input 
                    type="text"
                    value={globalLogo}
                    onChange={(e) => setGlobalLogo(e.target.value)}
                    placeholder="Ex: https://dominio.com/logo.png"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 font-sans focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block">Biografia ou Valores da Equipe</label>
                <textarea 
                  value={globalBio}
                  onChange={(e) => setGlobalBio(e.target.value)}
                  placeholder="Descreva a história da equipe..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 font-sans focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block">Website Oficial</label>
                <input 
                  type="text"
                  value={globalWebsite}
                  onChange={(e) => setGlobalWebsite(e.target.value)}
                  placeholder="Ex: https://equipeoficial.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 font-sans focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full p-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Salvar Equipe Global</span>
              </button>
            </form>
          )}

          {(showForm === 'create-branch' || showForm === 'edit-branch') && (
            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Equipe Global Associada</label>
                  <select
                    value={branchGlobalId}
                    onChange={(e) => setBranchGlobalId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                  >
                    <option value="">Selecione a equipe de filiação...</option>
                    {globals.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Nome da Filial</label>
                  <input 
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Ex: Gracie Barra - Ipanema, Alliance - SP"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 font-sans focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Professor Responsável</label>
                  <input 
                    type="text"
                    value={branchProfessor}
                    onChange={(e) => setBranchProfessor(e.target.value)}
                    placeholder="Nome do Head Coach (Faixa Preta)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Cidade</label>
                  <input 
                    type="text"
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    placeholder="Ex: Rio de Janeiro"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">UF / Estado</label>
                  <input 
                    type="text"
                    value={branchState}
                    onChange={(e) => setBranchState(e.target.value)}
                    placeholder="Ex: RJ"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block">País</label>
                <select
                  value={branchCountry}
                  onChange={(e) => setBranchCountry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="Brasil">Brasil</option>
                  <option value="EUA">EUA</option>
                  <option value="Reino Unido">Reino Unido</option>
                  <option value="Canadá">Canadá</option>
                  <option value="Japão">Japão</option>
                  <option value="Austrália">Austrália</option>
                  <option value="Emirados Árabes Unidos">Emirados Árabes Unidos</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Espanha">Espanha</option>
                  <option value="França">França</option>
                  <option value="Alemanha">Alemanha</option>
                  <option value="Itália">Itália</option>
                  <option value="Suécia">Suécia</option>
                  <option value="Finlândia">Finlândia</option>
                  <option value="Suíça">Suíça</option>
                  <option value="Singapura">Singapura</option>
                  <option value="Tailândia">Tailândia</option>
                  <option value="Nova Zelândia">Nova Zelândia</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full p-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Salvar Filial</span>
              </button>
            </form>
          )}

          {(showForm === 'create-independent' || showForm === 'edit-independent') && (
            <form onSubmit={handleSaveIndependent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Nome da Academia</label>
                  <input 
                    type="text"
                    value={indName}
                    onChange={(e) => setIndName(e.target.value)}
                    placeholder="Ex: Templo da Luta, BJJ Cave"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 font-sans focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Professor Responsável</label>
                  <input 
                    type="text"
                    value={indProfessor}
                    onChange={(e) => setIndProfessor(e.target.value)}
                    placeholder="Ex: Alexandre de Souza"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 font-sans focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Cidade</label>
                  <input 
                    type="text"
                    value={indCity}
                    onChange={(e) => setIndCity(e.target.value)}
                    placeholder="Ex: Florianópolis"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Estado / UF</label>
                  <input 
                    type="text"
                    value={indState}
                    onChange={(e) => setIndState(e.target.value)}
                    placeholder="Ex: SC"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">País</label>
                  <select
                    value={indCountry}
                    onChange={(e) => setIndCountry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="Brasil">Brasil</option>
                    <option value="EUA">EUA</option>
                    <option value="Reino Unido">Reino Unido</option>
                    <option value="Canadá">Canadá</option>
                    <option value="Japão">Japão</option>
                    <option value="Austrália">Austrália</option>
                    <option value="Emirados Árabes Unidos">Emirados Árabes Unidos</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Espanha">Espanha</option>
                    <option value="França">França</option>
                    <option value="Alemanha">Alemanha</option>
                    <option value="Itália">Itália</option>
                    <option value="Suécia">Suécia</option>
                    <option value="Finlândia">Finlândia</option>
                    <option value="Suíça">Suíça</option>
                    <option value="Singapura">Singapura</option>
                    <option value="Tailândia">Tailândia</option>
                    <option value="Nova Zelândia">Nova Zelândia</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Salvar Academia Independente</span>
              </button>
            </form>
          )}

          {showForm === 'transfer-branch' && (
            <form onSubmit={handleTransferBranchSubmit} className="space-y-4">
              <div className="rounded-xl bg-slate-900 p-4 border border-indigo-500/10 space-y-2">
                <p className="text-xs text-slate-300">
                  Você está prestes a transferir a filial <span className="font-bold text-white underline">{selectedItem?.name}</span> para uma nova filiação de rede global.
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Prof: {selectedItem?.professor || 'N/A'} • {selectedItem?.city}, {selectedItem?.state}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block">Selecione o Destinatário Global (Nova Bandeira)</label>
                <select
                  value={targetGlobalId}
                  onChange={(e) => setTargetGlobalId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-250 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  <option value="">Selecione nova Equipe Global destino...</option>
                  {globals.filter(g => g.id !== selectedItem?.globalTeamId).map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full p-2.5 bg-amber-600 hover:bg-amber-550 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Confirmar Transferência de Filial</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Lists Output */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] gap-2 text-slate-500 text-xs font-mono">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          <span>Sincronizando bancos de dados...</span>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Globals Output */}
          {activeSubTab === 'globals' && (
            <div className="space-y-3" id="admin-globals-list">
              {globals.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-8 text-center bg-slate-950 rounded-2xl border border-slate-800">Nenhuma Equipe Global cadastrada.</p>
              ) : (
                globals.map(item => (
                  <div key={item.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-900 hover:border-slate-850 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-violet-400 font-mono shrink-0 overflow-hidden">
                        {item.logoUrl ? (
                          <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : 'BJJ'}
                      </div>
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-200">{item.name}</h4>
                          {item.verified && (
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[8px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider flex items-center gap-1">
                              ✓ Verificada
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-550 italic font-mono truncate max-w-sm">
                          {item.bio || 'Sem descrição ou valores cadastrados.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleVerifyGlobal(item.id, item.verified || false)}
                        className={`p-2 rounded-xl text-[10px] font-bold font-mono tracking-wider cursor-pointer border transition-all ${
                          item.verified 
                            ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-500' 
                            : 'bg-emerald-950 hover:bg-emerald-900 border-emerald-900/50 text-emerald-400'
                        }`}
                      >
                        {item.verified ? 'Remover Selo' : 'Aprovar & Verificar'}
                      </button>

                      <button
                        onClick={() => handleEditGlobalClick(item)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-350 border border-slate-800 hover:text-white transition-all cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteGlobal(item.id)}
                        className="p-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-450 border border-rose-900/50 hover:text-rose-200 transition-all cursor-pointer"
                        title="Deletar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Branches Output */}
          {activeSubTab === 'branches' && (
            <div className="space-y-3" id="admin-branches-list">
              {branches.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-8 text-center bg-slate-950 rounded-2xl border border-slate-800">Nenhuma Filial Regionais cadastrada.</p>
              ) : (
                branches.map(item => (
                  <div key={item.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-900 hover:border-slate-850 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{item.name}</h4>
                        {item.verified && (
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[8px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider">
                            ✓ Verificada
                          </span>
                        )}
                        <span className="bg-indigo-950/40 border border-indigo-900/50 text-indigo-400 font-mono text-[8px] py-0.5 px-2 rounded-full">
                          {item.globalTeam?.name || 'Equipe Desconhecida'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-slate-500">
                        <span>Prof: {item.professor || 'Sem Professor Cadastrado'}</span>
                        <span>Cidade: {item.city} - {item.state} ({item.country})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setTargetGlobalId('');
                          setShowForm('transfer-branch');
                        }}
                        className="p-2 px-3 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-900 text-amber-400 text-[10px] font-bold font-mono tracking-wider cursor-pointer"
                      >
                        Transferir Equipe
                      </button>

                      <button
                        onClick={() => handleVerifyBranch(item.id, item.verified || false)}
                        className={`p-2 rounded-xl text-[10px] font-bold font-mono tracking-wider cursor-pointer border transition-all ${
                          item.verified 
                            ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-500' 
                            : 'bg-emerald-950 hover:bg-emerald-900 border-emerald-900/50 text-emerald-400'
                        }`}
                      >
                        {item.verified ? 'Remover Selo' : 'Homologar'}
                      </button>

                      <button
                        onClick={() => handleEditBranchClick(item)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-350 border border-slate-800 hover:text-white transition-all cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteBranch(item.id)}
                        className="p-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-450 border border-rose-900/50 hover:text-rose-200 transition-all cursor-pointer"
                        title="Deletar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Independents Output */}
          {activeSubTab === 'independents' && (
            <div className="space-y-3" id="admin-independents-list">
              {independents.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-8 text-center bg-slate-950 rounded-2xl border border-slate-800">Nenhuma Academia Independente cadastrada.</p>
              ) : (
                independents.map(item => (
                  <div key={item.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-900 hover:border-slate-850 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-200">{item.name}</h4>
                        {item.verified && (
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[8px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider">
                            ✓ Verificada
                          </span>
                        )}
                        <span className="bg-slate-900 border border-slate-800 text-slate-450 text-[8px] font-mono py-0.5 px-2 rounded-full uppercase">
                          Independente
                        </span>
                      </div>
                      
                      <div className="flex gap-x-4 text-[10px] font-mono text-slate-500">
                        <span>Prof: {item.professor || 'Sem Professor Cadastrado'}</span>
                        <span>Local: {item.city} - {item.state}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleVerifyIndependent(item.id, item.verified || false)}
                        className={`p-2 rounded-xl text-[10px] font-bold font-mono tracking-wider cursor-pointer border transition-all ${
                          item.verified 
                            ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-500' 
                            : 'bg-emerald-950 hover:bg-emerald-900 border-emerald-900/50 text-emerald-400'
                        }`}
                      >
                        {item.verified ? 'Remover Selo' : 'Aprovar & Homologar'}
                      </button>

                      <button
                        onClick={() => handleEditIndependentClick(item)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-350 border border-slate-800 hover:text-white transition-all cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteIndependent(item.id)}
                        className="p-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-450 border border-rose-900/50 hover:text-rose-200 transition-all cursor-pointer"
                        title="Deletar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
