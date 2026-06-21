import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
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
  Plus,
  MessageSquare,
  UserPlus,
  UserMinus,
  UserCheck
} from 'lucide-react';
import { UserProfile, BeltRank } from '../types';

interface ProfilePanelProps {
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onNavigate: (tab: string) => void;
}

export default function ProfilePanel({ user, updateUser, showToast, onNavigate }: ProfilePanelProps) {
  const { syncMe } = useAuth();
  // Enhanced state aligning with schema expansion
  const [profile, setProfile] = useState({
    bio: user.bio || '',
    city: user.city || '',
    country: user.country || '',
    nativeLanguage: user.nativeLanguage || 'Português',
    learningGoal: user.learningGoal || '',
    profilePhoto: user.profilePhoto || user.avatar || '',
    coverPhoto: user.coverPhoto || '',
    instagram: user.instagram || '',
    youtube: user.youtube || '',
    facebook: user.facebook || '',
    website: user.website || '',
    birthDate: user.birthDate || '',
    phone: user.phone || '',
    englishLevel: user.englishLevel || 'Iniciante',
    spanishLevel: user.spanishLevel || 'Iniciante',
    frenchLevel: user.frenchLevel || 'Iniciante',
    username: user.username || '',
    beltRank: user.beltRank || 'Faixa Branca',
    favoriteTechnique: user.favoriteTechnique || '',
    favoriteAthlete: user.favoriteAthlete || '',
    privacyLevel: user.privacyLevel || 'public',
    followersCount: user.followersCount || 0,
    followingCount: user.followingCount || 0,
    themeColor: user.themeColor || '#7c3aed',
    avatarFrame: user.avatarFrame || 'none',
    isVerified: user.isVerified || false
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'edit' | 'social' | 'invite'>('edit');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [socialSubTab, setSocialSubTab] = useState<'followers' | 'following'>('followers');
  const [togglingFollowId, setTogglingFollowId] = useState<string | null>(null);

  const getBeltBadgeStyle = (belt: string) => {
    switch (belt?.toUpperCase()) {
      case 'WHITE':
      case 'BRANCA': return 'bg-slate-100 text-slate-950 border-slate-350';
      case 'BLUE':
      case 'AZUL': return 'bg-blue-600/15 text-blue-400 border-blue-500/30';
      case 'PURPLE':
      case 'ROXA': return 'bg-purple-600/15 text-purple-400 border-purple-500/30';
      case 'BROWN':
      case 'MARROM': return 'bg-amber-800/15 text-amber-500 border-amber-800/30';
      case 'BLACK':
      case 'PRETA':
      case 'PRETO': return 'bg-red-650/15 text-red-500 border-red-600/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleFollowToggle = async (targetUserId: string, currentIsFollowing: boolean, targetUsername: string) => {
    if (togglingFollowId) return;
    try {
      setTogglingFollowId(targetUserId);
      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      const serviceUrl = '/api/profile/follow';
      const method = currentIsFollowing ? 'DELETE' : 'POST';
      const url = method === 'DELETE' ? `${serviceUrl}?targetUserId=${targetUserId}` : serviceUrl;

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: method === 'POST' ? JSON.stringify({ targetUserId }) : undefined
      });

      if (res.ok) {
        showToast(
          currentIsFollowing 
            ? `Você deixou de seguir @${targetUsername}` 
            : `Agora você segue @${targetUsername}!`, 
          "success"
        );
        
        // Dynamic re-fetch of social networks lists instantly
        await fetchSocialLists();
        
        // Re-synchronize stats to show updated followingCount / followersCount
        await fetchProfile();
      } else {
        const data = await res.json();
        showToast(data.error || "Não foi possível gerenciar as conexões.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Erro do servidor de rede ao ajustar ligação social.", "error");
    } finally {
      setTogglingFollowId(null);
    }
  };

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
      console.log(
        "[PROFILE SAVE PAYLOAD]",
        JSON.stringify(profile, null, 2)
      );

      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      console.log(
        "[PROFILE SAVE RESPONSE]",
        await res.clone().json()
      );

      if (res.ok) {
        const data = await res.json();
        console.log("[PROFILE SAVE RESPONSE]", data);
        showToast("Perfil atualizado com sucesso!", "success");
        
        // Sync immediately with the server's most accurate record state
        try {
          await syncMe();
        } catch (syncErr) {
          console.error("[PROFILE PANEL] syncMe failed after save:", syncErr);
        }

        // Sync parent React user states using the saved server object and call updateUser
        if (data.profile) {
          updateUser({
            ...data.profile,
            profilePhoto: data.profile.profilePhoto,
            coverPhoto: data.profile.coverPhoto,
            bio: data.profile.bio,
            city: data.profile.city,
            country: data.profile.country,
            instagram: data.profile.instagram,
            youtube: data.profile.youtube,
            facebook: data.profile.facebook,
            website: data.profile.website,
            avatar: data.profile.profilePhoto || data.profile.avatar || user.avatar
          });
          // Update local state with the saved fields to swap base64 back as real URL paths
          let formattedBirthDate = '';
          if (data.profile.birthDate) {
            formattedBirthDate = new Date(data.profile.birthDate).toISOString().split('T')[0];
          }
          setProfile(p => ({
            ...p,
            ...data.profile,
            birthDate: formattedBirthDate,
            profilePhoto: data.profile.profilePhoto || data.profile.avatar || user.avatar || '',
            coverPhoto: data.profile.coverPhoto || ''
          }));
        }
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
          <button
            onClick={() => setActiveTab('invite')}
            className={`px-4 py-2 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'invite' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Indicações (Ganhe JT)
          </button>
        </div>
      </div>

      {/* 2. TAB TRANSITIONS */}

      {activeTab === 'edit' && (
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
                  Lutador, fique à vontade para customizar sua imagem de perfil. Escolha seu método preferido: suba um arquivo de foto pessoal, cole um link de imagem externo ou selecione um preset rápido.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Upload do computador */}
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enviar Imagem Local</span>
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
                    <span className="text-[9px] text-slate-500 font-mono block">JPEG, PNG, WEBP</span>
                  </div>

                  {/* URL customizada de imagem */}
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Link de Imagem (URL)</span>
                    <input 
                      type="text" 
                      value={profile.profilePhoto} 
                      onChange={(e) => setProfile(p => ({ ...p, profilePhoto: e.target.value }))}
                      placeholder="https://exemplo.com/sua-foto.png"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2 text-[11px] text-slate-200 focus:outline-none placeholder:text-slate-700 font-mono" 
                    />
                    <span className="text-[9px] text-slate-500 font-mono block">Suporta qualquer URL de imagem da web.</span>
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
                          className="w-10 h-10 rounded-full object-cover bg-slate-900 animate-fadeIn" 
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

          {/* IMAGEM DE CAPA & BANNER SELECTION COMPONENT */}
          <div className="border-b border-slate-800/80 pb-6 space-y-4">
            <h4 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-violet-500" /> IMAGEM DE CAPA & BANNER PERSONALIZADO
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#060812] p-5 rounded-2xl border border-slate-800/65">
              {/* File Upload & Link Pasting Column */}
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Defina a imagem de fundo do cabeçalho do seu perfil. Você pode carregar um arquivo de banner pessoal, colar uma URL direta ou escolher um de nossos presets exclusivos temáticos de Jiu-Jitsu.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Upload do computador */}
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Enviar Capa Local</span>
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/10 cursor-pointer w-full text-center">
                      <Camera className="w-4 h-4" />
                      <span>Escolher Capa</span>
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.webp" 
                        onChange={(e) => handleImageFileChange(e, 'cover')} 
                        className="hidden" 
                      />
                    </label>
                    <span className="text-[9px] text-slate-500 font-mono block">JPEG, PNG, WEBP (Máx. 10MB)</span>
                  </div>

                  {/* URL customizada de imagem de capa */}
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Link da Capa (URL)</span>
                    <input 
                      type="text" 
                      value={profile.coverPhoto} 
                      onChange={(e) => setProfile(p => ({ ...p, coverPhoto: e.target.value }))}
                      placeholder="https://exemplo.com/banner-esportes.jpg"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-[11px] text-slate-200 focus:outline-none placeholder:text-slate-700 font-mono" 
                    />
                    <span className="text-[9px] text-slate-500 font-mono block">Cole link de imagem para aplicar instantaneamente.</span>
                  </div>
                </div>
              </div>

              {/* Presets Temáticos Tatame de Jiu-Jitsu */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Banners de Treino e Combate</span>
                <p className="text-[11px] text-slate-400">Selecione uma atmosfera de tatame profissional em alta definição para decorar seu fundo:</p>
                
                <div className="grid grid-cols-2 gap-2 bg-slate-900/30 p-2 rounded-xl border border-slate-800/80 max-h-[140px] overflow-y-auto">
                  {[
                    { name: "Tatame Dojo 🥋", url: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=800" },
                    { name: "Arena Combat 🔥", url: "https://images.unsplash.com/photo-1517438476312-10d79c0ae2f2?auto=format&fit=crop&q=80&w=800" },
                    { name: "Cyber Shogun ⚡", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800" },
                    { name: "Zen Absolute 🍂", url: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&q=80&w=800" },
                  ].map((presetBanner) => {
                    const isSelected = profile.coverPhoto === presetBanner.url;
                    return (
                      <button
                        key={presetBanner.url}
                        type="button"
                        onClick={() => {
                          setProfile(p => ({ ...p, coverPhoto: presetBanner.url }));
                          showToast(`Capa ${presetBanner.name} carregada no preview!`, "info");
                        }}
                        className={`p-1 rounded-lg border transition-all text-left overflow-hidden relative cursor-pointer group h-14 ${
                          isSelected ? 'border-violet-500 ring-2 ring-violet-500/20 bg-slate-900' : 'border-slate-800 bg-slate-950/50'
                        }`}
                      >
                        <img 
                          src={presetBanner.url} 
                          alt={presetBanner.name} 
                          className="w-full h-full object-cover rounded opacity-40 group-hover:opacity-75 transition-all" 
                        />
                        <span className="absolute bottom-1 left-2 text-[9px] font-bold text-white uppercase tracking-wider bg-slate-950/80 px-1 rounded-sm z-10 block select-none">
                          {presetBanner.name}
                        </span>
                        {isSelected && (
                          <span className="absolute top-1 right-1 bg-emerald-500 rounded-full p-0.5 border border-slate-950 z-15">
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
      )}

      {activeTab === 'social' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl" id="social-tab-panel">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-500" /> SEUS AMIGOS CLÃ E SEGUIDORES
            </h3>
            <p className="text-[11px] text-slate-400">Sincronização em tempo real das ligações e graduações dos atletas na rede.</p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-800/80 gap-2">
            <button
              type="button"
              onClick={() => setSocialSubTab('followers')}
              className={`pb-3 px-4 font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 ${
                socialSubTab === 'followers'
                  ? 'border-violet-500 text-violet-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-400'
              }`}
            >
              <span>SEGUIDORES</span>
              <span className="text-[10px] py-0.5 px-2 bg-slate-950 font-mono rounded-full border border-slate-800 text-slate-400">
                {followers.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSocialSubTab('following')}
              className={`pb-3 px-4 font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 ${
                socialSubTab === 'following'
                  ? 'border-violet-500 text-violet-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-400'
              }`}
            >
              <span>SEGUINDO</span>
              <span className="text-[10px] py-0.5 px-2 bg-slate-950 font-mono rounded-full border border-slate-800 text-slate-400">
                {following.length}
              </span>
            </button>
          </div>

          {loadingSocial ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin"></div>
              <span className="text-[11px] font-mono">Indexando relações mútuas de tatame...</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {socialSubTab === 'followers' ? (
                followers.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-850">
                    <Users className="w-8 h-8 text-slate-750 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 italic">Nenhum seguidor registrado neste ciclo.</p>
                  </div>
                ) : (
                  followers.map((item) => {
                    const isFollowingBack = following.some(f => f.id === item.id);
                    return (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/75 hover:bg-slate-950 rounded-2xl border border-slate-850 transition-all gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img 
                              src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                              alt={item.name} 
                              className="w-11 h-11 rounded-full object-cover border border-slate-800 cursor-pointer" 
                              onClick={() => onNavigate('profile-public-' + item.username)}
                            />
                            {item.isVerified && (
                              <span className="absolute -bottom-1 -right-1 bg-violet-600 rounded-full p-0.5 border border-slate-900" title="Verificado">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p 
                                className="text-xs font-bold text-white cursor-pointer hover:text-violet-400 transition-colors"
                                onClick={() => onNavigate('profile-public-' + item.username)}
                              >
                                {item.name}
                              </p>
                              {item.isVerified && (
                                <span className="text-[8px] bg-violet-500/10 text-violet-400 px-1 py-0.5 rounded font-mono font-bold tracking-wider">VERIFICADO</span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-slate-500">@{item.username || 'atleta'}</p>
                            
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className={`text-[9px] border px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider ${getBeltBadgeStyle(item.belt)}`}>
                                FAIXA {item.belt || 'BRANCA'}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono bg-slate-900/60 border border-slate-850 px-1.5 py-0.5 rounded">
                                LVL {item.level || 1}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono bg-violet-950/20 border border-violet-900/30 px-1.5 py-0.5 rounded truncate max-w-[150px]" title={item.academy}>
                                {item.academy || 'Independente'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onNavigate('profile-public-' + item.username)}
                            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>VER PERFIL</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Abrindo canal para enviar mensagens para @${item.username}... Recurso social em carregamento!`, "info");
                            }}
                            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                            <span>MENSAGEM</span>
                          </button>
                          <button
                            type="button"
                            disabled={togglingFollowId !== null}
                            onClick={() => handleFollowToggle(item.id, isFollowingBack, item.username)}
                            className={`py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                              isFollowingBack
                                ? 'bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300'
                                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/10'
                            }`}
                          >
                            {isFollowingBack ? (
                              <>
                                <UserMinus className="w-3.5 h-3.5" />
                                <span>REMOVER</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>SEGUIR DE VOLTA</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                following.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-850">
                    <Users className="w-8 h-8 text-slate-755 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 italic">Você ainda não segue nenhum competidor.</p>
                  </div>
                ) : (
                  following.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/75 hover:bg-slate-950 rounded-2xl border border-slate-850 transition-all gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                            alt={item.name} 
                            className="w-11 h-11 rounded-full object-cover border border-slate-800 cursor-pointer" 
                            onClick={() => onNavigate('profile-public-' + item.username)}
                          />
                          {item.isVerified && (
                            <span className="absolute -bottom-1 -right-1 bg-violet-600 rounded-full p-0.5 border border-slate-900" title="Verificado">
                              <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p 
                              className="text-xs font-bold text-white cursor-pointer hover:text-violet-400 transition-colors"
                              onClick={() => onNavigate('profile-public-' + item.username)}
                            >
                              {item.name}
                            </p>
                            {item.isVerified && (
                              <span className="text-[8px] bg-violet-500/10 text-violet-400 px-1 py-0.5 rounded font-mono font-bold tracking-wider">VERIFICADO</span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-500">@{item.username || 'atleta'}</p>
                          
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className={`text-[9px] border px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider ${getBeltBadgeStyle(item.belt)}`}>
                              FAIXA {item.belt || 'BRANCA'}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono bg-slate-900/60 border border-slate-850 px-1.5 py-0.5 rounded">
                              LVL {item.level || 1}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono bg-violet-950/20 border border-violet-900/30 px-1.5 py-0.5 rounded truncate max-w-[150px]" title={item.academy}>
                              {item.academy || 'Independente'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onNavigate('profile-public-' + item.username)}
                          className="py-1.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>VER PERFIL</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            showToast(`Abrindo canal para enviar mensagens para @${item.username}... Recurso social em carregamento!`, "info");
                          }}
                          className="py-1.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          <span>MENSAGEM</span>
                        </button>
                        <button
                          type="button"
                          disabled={togglingFollowId !== null}
                          onClick={() => handleFollowToggle(item.id, true, item.username)}
                          className="py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 transition-all flex items-center gap-1"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>DEIXAR SEGUIR</span>
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'invite' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl animate-fadeIn" id="invite-tab-panel">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" /> SISTEMA DE INDICAÇÕES JIUSPEAK (RECOMPENSA EM JT)
            </h3>
            <p className="text-[11px] text-slate-400">Ajude nossa comunidade de Jiu-Jitsu e Inglês a crescer pelo mundo e receba créditos oficiais em JiuTickets!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Link copier column */}
            <div className="md:col-span-2 space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-850">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block font-bold">Seu Link Único de indicação</span>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly
                  value={`${window.location.origin}/invite/${profile.username || user.username || user.id}`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none" 
                  id="referral-sharing-link-value"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('referral-sharing-link-value') as HTMLInputElement;
                    if (el) {
                      navigator.clipboard.writeText(el.value);
                      showToast("Link de indicação copiado! Envie nos grupos de WhatsApp da sua academia.", "success");
                    }
                  }}
                  className="px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  Copiar Link
                </button>
              </div>

              <div className="space-y-2 font-sans">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Compartilhar rápido nas redes</span>
                <div className="flex gap-2 flex-wrap">
                  <a
                    href={`https://api.whatsapp.com/send?text=Faça%20parte%20da%20maior%20plataforma%20de%20Jiu-Jitsu%20e%20Inglês%20do%20mundo,%20ganhe%20200%20JiuTickets%20ao%20entrar!%20Acesse:%20${window.location.origin}/invite/${profile.username || user.username || user.id}`}
                    target="_blank"
                    rel="referrer"
                    className="p-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all font-mono"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=Entrando%20no%20@JiuSpeak%20para%20dominar%20o%20Mundo.%20Cadastre-se%20com%20meu%20link:%20${window.location.origin}/invite/${profile.username || user.username || user.id}`}
                    target="_blank"
                    rel="referrer"
                    className="p-2 px-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold flex items-center gap-1.5 hover:bg-sky-500/20 transition-all font-mono"
                  >
                    Twitter / X
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const shareText = `Acabei de receber conquistas na JiuSpeak. Use meu link de indicação para obter recompensas em JT ao se registrar: ${window.location.origin}/invite/${profile.username || user.username || user.id}`;
                      navigator.clipboard.writeText(shareText);
                      showToast("Post pronto copiado para os Stories do Instagram/TikTok!", "success");
                    }}
                    className="p-2 px-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-450 text-xs font-bold flex items-center gap-1.5 hover:bg-pink-550/20 transition-all font-mono cursor-pointer"
                  >
                    TikTok / Instagram
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics column */}
            <div className="space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-850 font-sans">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Resumo Financeiro Virtual</span>
              
              <div className="space-y-3">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 block font-mono">INDICADOS CADASTRADOS</span>
                  <span className="text-xl font-mono font-black text-white">0 Atletas</span>
                </div>
                
                <div className="bg-indigo-950/40 border border-indigo-900/45 p-4 rounded-xl">
                  <span className="text-[10px] text-indigo-400 block font-mono">BÔNUS JT RECEBIDOS</span>
                  <span className="text-xl font-mono font-black text-indigo-300">0 JT</span>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850/60 space-y-2 font-sans">
            <span className="text-xs font-bold text-white block">Regras claras do Dojô Viral:</span>
            <ul className="text-slate-400 text-[11px] list-disc pl-5 space-y-1.5 font-sans leading-relaxed">
              <li>O indicado deve utilizar o link <strong>direto</strong> para acessar a plataforma para gravar o cookies de rastreio.</li>
              <li>A <strong>Recompensa em JT</strong> livre de tarifas para cada um será creditada assim que o indicado finalizar com maestria o Onboarding Wizard.</li>
              <li>Sistemas automatizados ou IPs idênticos para auto-indicação serão suspensos sumariamente pelo Painel Administrativo. Treine limpo, jogue limpo!</li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
