import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Globe, 
  Award, 
  Trophy, 
  Flame, 
  Instagram, 
  Facebook, 
  Youtube, 
  Link, 
  Camera, 
  Save, 
  PenTool, 
  Share2, 
  CheckCircle,
  Clock,
  Sparkles,
  Shield,
  Phone,
  Calendar,
  Grid,
  Heart,
  Eye,
  Settings,
  Users,
  Image as ImageIcon,
  Check,
  Plus
} from 'lucide-react';
import { UserProfile, BeltRank } from '../types';

interface ProfilePanelProps {
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onNavigate: (tab: string) => void;
}

export default function ProfilePanel({ user, updateUser, showToast, onNavigate }: ProfilePanelProps) {
  // Enhanced state aligning with schema expansion
  const [profile, setProfile] = useState({
    bio: '',
    city: '',
    country: '',
    nativeLanguage: 'Português',
    learningGoal: '',
    profilePhoto: '',
    coverPhoto: '',
    instagram: '',
    youtube: '',
    facebook: '',
    website: '',
    birthDate: '',
    phone: '',
    englishLevel: 'Iniciante',
    spanishLevel: 'Iniciante',
    frenchLevel: 'Iniciante',
    username: '',
    beltRank: 'Faixa Branca',
    favoriteTechnique: '',
    favoriteAthlete: '',
    privacyLevel: 'public',
    followersCount: 0,
    followingCount: 0,
    themeColor: '#7c3aed',
    avatarFrame: 'none',
    isVerified: false
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'edit' | 'social'>('edit');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loadingSocial, setLoadingSocial] = useState(false);

  // Load profile data from API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          // Format date for input tag (YYYY-MM-DD)
          let formattedBirthDate = '';
          if (data.profile.birthDate) {
            formattedBirthDate = new Date(data.profile.birthDate).toISOString().split('T')[0];
          }
          setProfile({
            ...data.profile,
            birthDate: formattedBirthDate,
            bio: data.profile.bio || '',
            city: data.profile.city || '',
            country: data.profile.country || '',
            nativeLanguage: data.profile.nativeLanguage || 'Português',
            learningGoal: data.profile.learningGoal || '',
            profilePhoto: data.profile.profilePhoto || data.profile.avatar || user.avatar || '',
            coverPhoto: data.profile.coverPhoto || '',
            instagram: data.profile.instagram || '',
            youtube: data.profile.youtube || '',
            facebook: data.profile.facebook || '',
            website: data.profile.website || '',
            phone: data.profile.phone || '',
            englishLevel: data.profile.englishLevel || 'Iniciante',
            spanishLevel: data.profile.spanishLevel || 'Iniciante',
            frenchLevel: data.profile.frenchLevel || 'Iniciante',
            username: data.profile.username || '',
            beltRank: data.profile.beltRank || 'Faixa Branca',
            favoriteTechnique: data.profile.favoriteTechnique || '',
            favoriteAthlete: data.profile.favoriteAthlete || '',
            privacyLevel: data.profile.privacyLevel || 'public',
            themeColor: data.profile.themeColor || '#7c3aed',
            avatarFrame: data.profile.avatarFrame || 'none'
          });
        }
      }
    } catch (e) {
      console.error("Error fetching profile", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialLists = async () => {
    try {
      setLoadingSocial(true);
      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      
      const [resFollowers, resFollowing] = await Promise.all([
        fetch('/api/profile/followers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/profile/following', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (resFollowers.ok) {
        const d = await resFollowers.json();
        setFollowers(d.followers || []);
      }
      if (resFollowing.ok) {
        const d = await resFollowing.json();
        setFollowing(d.following || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSocial(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'social') {
      fetchSocialLists();
    }
  }, [activeTab]);

  // Handle saving form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        const data = await res.json();
        showToast("Perfil atualizado com sucesso!", "success");
        // Sync parent React user states
        updateUser({
          name: profile.name || user.name,
          avatar: profile.profilePhoto || user.avatar
        });
      } else {
        const err = await res.json();
        showToast(err.error || "Fracasso ao salvar as atualizações.", "error");
      }
    } catch (err: any) {
      showToast("Não foi possível salvar o perfil. Tente mais tarde.", "error");
    }
  };

  // Image Upload handler with previews, size caps, and automatic compression simulation
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type extension
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast("Formato inválido! Envie jpeg, jpg, png ou webp.", "error");
      return;
    }

    // Validate size limit (Profile = 5MB, Cover = 10MB)
    const limitMB = type === 'profile' ? 5 : 10;
    if (file.size > limitMB * 1024 * 1024) {
      showToast(`Imagem muito grande! O limite para ${type === 'profile' ? 'Foto de Perfil' : 'Capa'} é de ${limitMB}MB.`, "error");
      return;
    }

    // Convert to Base64 (High-fidelity instant preview)
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === 'profile') {
        setProfile(p => ({ ...p, profilePhoto: base64 }));
        showToast("Preview da Foto de Perfil carregado com sucesso!", "info");
      } else {
        setProfile(p => ({ ...p, coverPhoto: base64 }));
        showToast("Preview da Capa carregado com sucesso!", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  const getBeltColorStyle = (belt: string) => {
    switch (belt?.toUpperCase()) {
      case 'WHITE': return 'border-slate-300 text-slate-100 bg-slate-950';
      case 'BLUE': return 'border-blue-500 text-blue-400 bg-blue-950/45';
      case 'PURPLE': return 'border-purple-500 text-purple-400 bg-purple-950/45';
      case 'BROWN': return 'border-amber-750 text-amber-500 bg-amber-950/45';
      case 'BLACK': return 'border-red-600 text-red-550 bg-red-950/45 font-bold';
      default: return 'border-slate-600 text-slate-400 bg-slate-900';
    }
  };

  // Avatar frames mapping list
  const avatarFrames = [
    { id: 'none', name: 'Sem Moldura' },
    { id: 'royal_gold', name: 'Moldura Ouro Real 🏆' },
    { id: 'neon_shogun', name: 'Neon Samurai 🔥' },
    { id: 'cyber_bjj', name: 'Cyberpunk Absolute ⚡' },
    { id: 'forest_zen', name: 'Zen Tatame 🍃' }
  ];

  // Profile theme colors mapping list
  const themeColors = [
    { value: '#7c3aed', name: 'Roxo Imperial' },
    { value: '#ef4444', name: 'Combate Vermelho' },
    { value: '#3b82f6', name: 'Guarda Azul' },
    { value: '#10b981', name: 'Nativo Verde' },
    { value: '#f59e0b', name: 'Prestige Amarelo' },
    { value: '#0f172a', name: 'Absolute Charcoal' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-400" id="profile-loader">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin"></div>
        <p className="text-xs font-mono">Carregando dados estruturados do atleta...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn" id="profile-panel-container">
      
      {/* 1. COMPREHENSIVE COMBAT HEADER */}
      <div 
        className="relative rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl transition-all"
        style={{ borderTopColor: profile.themeColor, borderTopWidth: '6px' }}
      >
        {/* Cover Photo Area */}
        <div className="h-44 md:h-64 relative bg-slate-900 overflow-hidden group">
          {profile.coverPhoto ? (
            <img 
              src={profile.coverPhoto} 
              alt="Capa do Perfil" 
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 flex items-center justify-center">
              <span className="text-xs font-mono text-slate-600 font-bold uppercase tracking-widest">Sem foto de capa cadastrada</span>
            </div>
          )}
          
          {/* Cover Upload Button Overlay */}
          <label className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-violet-500 text-xs text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all shadow-md z-10">
            <Camera className="w-4 h-4 text-violet-400" />
            <span>Alterar Capa</span>
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png,.webp" 
              onChange={(e) => handleImageFileChange(e, 'cover')} 
              className="hidden" 
            />
          </label>
        </div>

        {/* Content Profile Avatar & Quick Info Row */}
        <div className="p-6 md:p-8 pt-0 relative flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end -mt-16 md:-mt-20 z-10">
          
          {/* Avatar Area with Frame simulation */}
          <div className="relative group shrink-0">
            <div className={`relative rounded-full p-1.5 bg-slate-950 shadow-2xl overflow-hidden ${
              profile.avatarFrame === 'royal_gold' ? 'ring-4 ring-yellow-500 animate-pulse' :
              profile.avatarFrame === 'neon_shogun' ? 'ring-4 ring-red-500' :
              profile.avatarFrame === 'cyber_bjj' ? 'ring-4 ring-cyan-400' :
              profile.avatarFrame === 'forest_zen' ? 'ring-4 ring-emerald-500' : 'ring-2 ring-slate-800'
            }`}>
              {profile.profilePhoto ? (
                <img 
                  src={profile.profilePhoto} 
                  alt={user.name} 
                  className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-slate-900 flex items-center justify-center font-bold text-white text-3xl">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Profile Picture Upload Button Overlay */}
            <label className="absolute inset-0 bg-slate-950/65 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-bold cursor-pointer transition-all gap-1">
              <Camera className="w-5 h-5 text-violet-400 animate-bounce" />
              <span>Trocar Foto</span>
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.webp" 
                onChange={(e) => handleImageFileChange(e, 'profile')} 
                className="hidden" 
              />
            </label>

            {/* Verification Mark */}
            {profile.isVerified && (
              <span className="absolute bottom-1 right-2 w-7 h-7 rounded-full bg-violet-600 border-2 border-slate-950 flex items-center justify-center text-white text-xs shadow-lg" title="Perfil Verificado Oficial">
                ✓
              </span>
            )}
          </div>

          {/* Quick Stats Panel & Identifiers */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h2 className="text-2xl md:text-3xl font-display font-black text-white leading-tight">
                  {user.name}
                </h2>
                {profile.username && (
                  <span className="text-xs font-mono text-slate-400 bg-slate-900 py-1 px-2.5 rounded-full border border-slate-800">
                    @{profile.username}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile.city || 'Doôjo Virtual'}, {profile.country || 'Nuvem'}</span>
                <span className="text-slate-700">•</span>
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Nativo: {profile.nativeLanguage}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className={`text-[9px] px-2.5 py-1 rounded-full border uppercase tracking-wider font-extrabold ${getBeltColorStyle(user.belt)}`}>
                🥋 FAIXA {user.belt.toUpperCase()} — {user.stripes} {user.stripes === 1 ? 'GRAU' : 'GRAUS'}
              </span>
              <span className="bg-slate-900 text-slate-400 border border-slate-800 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase">
                NÍVEL {user.level} SPEAK
              </span>
              <span className="bg-emerald-950/45 text-emerald-405 border border-emerald-500/10 text-[9px] font-bold px-2.5 py-1 rounded-full font-mono">
                {profile.privacyLevel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Followers metrics with list expansion */}
          <div className="flex gap-4 md:self-end pt-2">
            <button 
              onClick={() => setActiveTab('social')}
              className="text-center bg-slate-900 border border-slate-800 hover:border-violet-500 px-4 py-2 rounded-2xl transition-all"
            >
              <span className="block text-lg font-black text-white">{profile.followersCount}</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Seguidores</span>
            </button>
            <button 
              onClick={() => setActiveTab('social')}
              className="text-center bg-slate-900 border border-slate-800 hover:border-violet-500 px-4 py-2 rounded-2xl transition-all"
            >
              <span className="block text-lg font-black text-white">{profile.followingCount}</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Seguindo</span>
            </button>
          </div>
        </div>

        {/* View Switch bar */}
        <div className="border-t border-slate-900 px-6 py-2 bg-slate-900/30 flex gap-4">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'edit' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Editar Cadastro
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'social' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Seguidores & Amigos
          </button>
        </div>
      </div>

      {/* 2. TAB TRANSITIONS */}

      {activeTab === 'edit' ? (
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                📝 EDITAR PERFIL DE ATLETA
              </h3>
              <p className="text-[11px] text-slate-550">Customize os bônus cosméticos de molduras, assinaturas sociais e histórico.</p>
            </div>
            <span className="text-[9px] font-mono text-violet-400 bg-violet-950/20 px-2 py-0.5 rounded border border-violet-800/10 uppercase font-bold">PostgreSQL Ativo</span>
          </div>

          {/* FOTO DE PERFIL & AVATAR SELECTION COMPONENT */}
          <div className="border-b border-slate-800/80 pb-6 space-y-4">
            <h4 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
              <Camera className="w-4 h-4 text-violet-500" /> FOTO DE PERFIL & AVATAR PERSONALIZADO
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#060812] p-5 rounded-2xl border border-slate-800/65">
              {/* File Upload & Link Pasting Column */}
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Lutador, fique à vontade para customizar sua imagem. Escolha seu método preferido: suba um arquivo de foto pessoal, cole um link de imagem externo ou selecione um preset rápido.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Upload do computador */}
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enviar Arquivo Local</span>
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/10 cursor-pointer w-full text-center">
                      <Camera className="w-4 h-4" />
                      <span>Escolher Imagem</span>
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.webp" 
                        onChange={(e) => handleImageFileChange(e, 'profile')} 
                        className="hidden" 
                      />
                    </label>
                    <span className="text-[9px] text-slate-500 font-mono block">Suporta JPG, PNG, WEBP</span>
                  </div>

                  {/* URL customizada de imagem */}
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inserir Link Direto (URL)</span>
                    <input 
                      type="text" 
                      value={profile.profilePhoto} 
                      onChange={(e) => setProfile(p => ({ ...p, profilePhoto: e.target.value }))}
                      placeholder="https://exemplo.com/sua-foto.png"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-[11px] text-slate-200 focus:outline-none placeholder:text-slate-700" 
                    />
                    <span className="text-[9px] text-slate-500 font-mono block">Paste any photo URL from Web, Discord, Google, etc.</span>
                  </div>
                </div>
              </div>

              {/* Presets Clã de Atletas Criativos */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presets de Lutadores Exclusivos</span>
                <p className="text-[11px] text-slate-400">Escolha um dos nossos personagens artísticos do tatame militar:</p>
                
                <div className="grid grid-cols-4 gap-2 bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/80 max-h-[140px] overflow-y-auto">
                  {[
                    { name: "Preta Pro", seed: "Flavio" },
                    { name: "Mestre", seed: "Sage" },
                    { name: "Camila", seed: "Lila" },
                    { name: "Tiger", seed: "Tiger" },
                    { name: "Samurai", seed: "Samurai" },
                    { name: "Shadow", seed: "Shadow" },
                    { name: "Absolute", seed: "Garra" },
                    { name: "Finalizador", seed: "Rocky" },
                  ].map((preset) => {
                    const presetUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${preset.seed}`;
                    const isSelected = profile.profilePhoto === presetUrl;
                    return (
                      <button
                        key={preset.seed}
                        type="button"
                        onClick={() => {
                          setProfile(p => ({ ...p, profilePhoto: presetUrl }));
                          showToast(`Avatar ${preset.name} carregado no preview!`, "info");
                        }}
                        className={`p-1.5 rounded-xl border transition-all flex flex-col items-center gap-1 hover:bg-slate-800/80 relative cursor-pointer ${
                          isSelected ? 'border-violet-500 bg-slate-800 ring-2 ring-violet-600/20' : 'border-slate-800 bg-slate-950/40'
                        }`}
                      >
                        <img 
                          src={presetUrl} 
                          alt={preset.name} 
                          className="w-10 h-10 rounded-full object-cover bg-slate-900" 
                        />
                        <span className="text-[9px] font-bold text-slate-400 truncate max-w-full block select-none">{preset.name}</span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-slate-950">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Form Section 1: Identity & Credentials */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-violet-500" /> IDENTIDADE DO ALUNO
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={user.name} 
                  disabled
                  title="Nome Principal herdado da autenticação"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-500 cursor-not-allowed uppercase" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username Único</label>
                <input 
                  type="text" 
                  value={profile.username} 
                  onChange={(e) => setProfile(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))} 
                  placeholder="Ex: roger_gracie5"
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none placeholder:text-slate-700" 
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contato Telefônico</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                  <input 
                    type="text" 
                    value={profile.phone} 
                    onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} 
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data de Nascimento</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                  <input 
                    type="date" 
                    value={profile.birthDate} 
                    onChange={(e) => setProfile(p => ({ ...p, birthDate: e.target.value }))} 
                    className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cidade do Aluno</label>
                <input 
                  type="text" 
                  value={profile.city} 
                  onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))} 
                  placeholder="Rio de Janeiro" 
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">País</label>
                <input 
                  type="text" 
                  value={profile.country} 
                  onChange={(e) => setProfile(p => ({ ...p, country: e.target.value }))} 
                  placeholder="Brasil" 
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Biografria Curta ("Sobre Mim")</label>
              <textarea 
                value={profile.bio} 
                onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))} 
                rows={3} 
                placeholder="Uma breve biografia exibida aos outros atletas globais..."
                className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Form Section 2: Localization & Study Goals */}
          <div className="border-t border-slate-850 pt-6 space-y-4">
            <h4 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-500" /> LOCALIZAÇÃO E IDIOMAS
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Idioma Nativo</label>
                <select 
                  value={profile.nativeLanguage} 
                  onChange={(e) => setProfile(p => ({ ...p, nativeLanguage: e.target.value }))}
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Português">Português</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Espanhol">Espanhol</option>
                  <option value="Francês">Francês</option>
                  <option value="Japonês">Japonês</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nível de Inglês</label>
                <select 
                  value={profile.englishLevel} 
                  onChange={(e) => setProfile(p => ({ ...p, englishLevel: e.target.value }))}
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                  <option value="Fluente">Fluente</option>
                  <option value="Nativo">Nativo</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nível de Espanhol</label>
                <select 
                  value={profile.spanishLevel} 
                  onChange={(e) => setProfile(p => ({ ...p, spanishLevel: e.target.value }))}
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                  <option value="Fluente">Fluente</option>
                  <option value="Nativo">Nativo</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nível de Francês</label>
                <select 
                  value={profile.frenchLevel} 
                  onChange={(e) => setProfile(p => ({ ...p, frenchLevel: e.target.value }))}
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                  <option value="Fluente">Fluente</option>
                  <option value="Nativo">Nativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Objetivo Profissional ou de Viagem</label>
              <input 
                type="text" 
                value={profile.learningGoal} 
                onChange={(e) => setProfile(p => ({ ...p, learningGoal: e.target.value }))} 
                placeholder="Ex. Fazer seminários internacionais, se preparar para viagens de competição, etc."
                className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
              />
            </div>
          </div>

          {/* Form Section 3: Favorites & BJJ Preferences */}
          <div className="border-t border-slate-850 pt-6 space-y-4">
            <h4 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
              🥋 PREFERÊNCIAS DE TATAME
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Técnica Favorita de Finalização</label>
                <input 
                  type="text" 
                  value={profile.favoriteTechnique} 
                  onChange={(e) => setProfile(p => ({ ...p, favoriteTechnique: e.target.value }))} 
                  placeholder="Ex. Ezequiel, Triângulo de Mão, Omoplata"
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Atleta de Referência / Ídolo</label>
                <input 
                  type="text" 
                  value={profile.favoriteAthlete} 
                  onChange={(e) => setProfile(p => ({ ...p, favoriteAthlete: e.target.value }))} 
                  placeholder="Ex. Roger Gracie, Marcus Buchecha, Gordon Ryan"
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Graduação no Tatame (BeltRank)</label>
                <input 
                  type="text" 
                  value={profile.beltRank} 
                  onChange={(e) => setProfile(p => ({ ...p, beltRank: e.target.value }))} 
                  placeholder="Ex. 3 Graus no Preta / Campeão Sul-americano"
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                />
              </div>
            </div>
          </div>

          {/* Form Section 4: Social URLs */}
          <div className="border-t border-slate-850 pt-6 space-y-4">
            <h4 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
              🔗 INTEGRAÇÕES SOCIAIS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Instagram (@)</label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-2.5 w-4 h-4 text-pink-500" />
                  <input 
                    type="text" 
                    value={profile.instagram} 
                    onChange={(e) => setProfile(p => ({ ...p, instagram: e.target.value.replace(/@/g, '') }))} 
                    placeholder="rogergracie"
                    className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Canal do Youtube</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-2.5 w-4 h-4 text-red-500" />
                  <input 
                    type="text" 
                    value={profile.youtube} 
                    onChange={(e) => setProfile(p => ({ ...p, youtube: e.target.value }))} 
                    placeholder="alliancebjj"
                    className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Perfil Facebook</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-2.5 w-4 h-4 text-blue-500" />
                  <input 
                    type="text" 
                    value={profile.facebook} 
                    onChange={(e) => setProfile(p => ({ ...p, facebook: e.target.value }))} 
                    placeholder="facebook.com/rogergracie"
                    className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Website Pessoal</label>
                <div className="relative">
                  <Link className="absolute left-3 top-2.5 w-4 h-4 text-indigo-400" />
                  <input 
                    type="text" 
                    value={profile.website} 
                    onChange={(e) => setProfile(p => ({ ...p, website: e.target.value }))} 
                    placeholder="https://rogergracie.com"
                    className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Section 5: Profile Cosmetics & Privacy */}
          <div className="border-t border-slate-850 pt-6 space-y-4">
            <h4 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
              🎨 PREFERÊNCIAS VISUAIS DE TRANSMISSÃO
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cor Temática do Perfil</label>
                <div className="flex gap-2.5 flex-wrap">
                  {themeColors.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, themeColor: col.value }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                        profile.themeColor === col.value ? 'border-white scale-105 shadow-lg' : 'border-slate-800/60'
                      }`}
                      style={{ backgroundColor: col.value }}
                      title={col.name}
                    >
                      {profile.themeColor === col.value && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filtro de Moldura do Avatar</label>
                <select 
                  value={profile.avatarFrame} 
                  onChange={(e) => setProfile(p => ({ ...p, avatarFrame: e.target.value }))}
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  {avatarFrames.map((frame) => (
                    <option key={frame.id} value={frame.id}>{frame.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nível de Privacidade do Portfólio</label>
                <select 
                  value={profile.privacyLevel} 
                  onChange={(e) => setProfile(p => ({ ...p, privacyLevel: e.target.value }))}
                  className="w-full bg-slate-1000 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="public">Público (Visível para todos os lutadores)</option>
                  <option value="friends">Amigos (Seguidores mútuos apenas)</option>
                  <option value="private">Privado (Apenas eu)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-850 pt-5 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => showToast("Modificações limpas", "info")} 
              className="py-2.5 px-6 bg-slate-950 border border-slate-850 text-slate-400 rounded-xl text-xs font-bold hover:text-white transition-all"
            >
              Restaurar Originais
            </button>
            <button 
              type="submit" 
              className="py-2.5 px-8 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/10 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Salvar Perfil de Atleta</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl" id="social-tab-panel">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-500" /> SEUS AMIGOS CLÃ E SEGUIDORES
            </h3>
            <p className="text-[11px] text-slate-550">Sincronização instantânea de seguidores ativos sob a rede de competição.</p>
          </div>

          {loadingSocial ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin"></div>
              <span className="text-[11px] font-mono">Indexando relações mútua de tatame...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Followers list */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span>SEGUIDORES</span>
                  <span className="text-[10px] py-0.5 px-1.5 bg-slate-950 rounded text-violet-405 font-mono">({followers.length})</span>
                </h4>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {followers.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4">Nenhum seguidor registrado neste ciclo.</p>
                  ) : (
                    followers.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-900 shadow-inner">
                        <div className="flex items-center gap-3">
                          <img src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-slate-800" />
                          <div>
                            <p className="text-xs font-bold text-white">{item.name}</p>
                            <p className="text-[10px] font-mono text-slate-500">@{item.username || 'atleta'}</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">
                          FAIXA {item.belt || 'BRANCA'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Following list */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span>SEGUINDO</span>
                  <span className="text-[10px] py-0.5 px-1.5 bg-slate-950 rounded text-violet-405 font-mono">({following.length})</span>
                </h4>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {following.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4">Você ainda não segue nenhum competidor.</p>
                  ) : (
                    following.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-900 shadow-inner">
                        <div className="flex items-center gap-3">
                          <img src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-slate-800" />
                          <div>
                            <p className="text-xs font-bold text-white">{item.name}</p>
                            <p className="text-[10px] font-mono text-slate-500">@{item.username || 'atleta'}</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">
                          FAIXA {item.belt || 'BRANCA'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
