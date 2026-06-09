import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Globe, 
  Award, 
  Trophy, 
  Flame, 
  Hourglass, 
  Instagram, 
  Facebook, 
  Youtube, 
  Link, 
  Camera, 
  Save, 
  PenTool, 
  Download, 
  Share2, 
  BookOpen, 
  CheckCircle,
  Clock,
  Sparkles,
  Shield,
  FileText,
  Trash2,
  Maximize,
  Briefcase
} from 'lucide-react';
import { UserProfile, BeltRank } from '../types';
import { avatarMappingList } from '../avatarMapping';

interface ProfilePanelProps {
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onNavigate: (tab: string) => void;
}

interface AdditionalProfileMeta {
  surname: string;
  publicName: string;
  country: string;
  city: string;
  nativeLanguage: string;
  targetLanguage: string;
  mainGoal: string;
  bio: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  website: string;
  academy: string;
  professor: string;
  trainingTime: string;
  goalsBjj: string;
  realPhoto: string | null; // Base64 or URL
  preferRealPhoto: boolean;
  isPremium: boolean;
  studyHours: number;
  completedLessonsCount: number;
  performanceAverage: number;
}

export default function ProfilePanel({ user, updateUser, showToast, onNavigate }: ProfilePanelProps) {
  // Local profile metadata
  const [profile, setProfile] = useState<AdditionalProfileMeta>({
    surname: '',
    publicName: '',
    country: 'Brasil',
    city: 'São Paulo',
    nativeLanguage: 'Português',
    targetLanguage: 'Inglês',
    mainGoal: 'Competir internacionalmente e entender seminários de BJJ gringos.',
    bio: 'Faixa Azul de Jiu-Jitsu. Estudando Inglês através do JiuSpeak. Objetivo competir no Europeu da IBJJF e dar aulas no exterior.',
    instagram: 'atleta_jiuspeak',
    facebook: '',
    tiktok: '',
    youtube: '',
    website: '',
    academy: user.academy || 'Atama Virtual Team',
    professor: 'Professor Cascão',
    trainingTime: '4 Anos',
    goalsBjj: 'Campeão Europeu IBJJF na categoria Pena.',
    realPhoto: null,
    preferRealPhoto: false,
    isPremium: !['Gratuito', 'FREE', 'free'].includes(user.subscription?.type || 'FREE'),
    studyHours: 24,
    completedLessonsCount: 18,
    performanceAverage: 94
  });

  // UI State Managers
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isAvatarGalleryOpen, setIsAvatarGalleryOpen] = useState(false);
  
  // Custom Photo Crop/Scale simulations
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [photoScale, setPhotoScale] = useState(1);
  const [photoCropX, setPhotoCropX] = useState(0);
  const [photoCropY, setPhotoCropY] = useState(0);

  // Sync initial stats on load
  useEffect(() => {
    // Attempt full-stack fetch
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('jiuspeak_access_token');
        if (!token) return;
        const res = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(prev => ({ ...prev, ...data.profile }));
          }
        }
      } catch (err) {
        console.warn('API /api/user/profile fallback local.');
      }
    };
    
    // Load local config
    const local = localStorage.getItem(`jiuspeak_profile_meta_${user.id}`);
    if (local) {
      try {
        setProfile(JSON.parse(local));
      } catch (e) {
        fetchProfileData();
      }
    } else {
      fetchProfileData();
    }
  }, [user.id]);

  // Persist Profile Meta
  const saveProfileMeta = async (updated: AdditionalProfileMeta) => {
    setProfile(updated);
    localStorage.setItem(`jiuspeak_profile_meta_${user.id}`, JSON.stringify(updated));

    // Update global app state user name & academy
    updateUser({
      name: `${user.name.split(' ')[0]} ${updated.surname}`.trim() || user.name,
      academy: updated.academy
    });

    // Post to backend API
    try {
      const token = localStorage.getItem('jiuspeak_access_token');
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profile: updated })
      });
    } catch (e) {
      console.warn('Failsafe saved inside client state cache.');
    }
  };

  // Profile Edit fields change handler
  const handleMetaFieldChange = <K extends keyof AdditionalProfileMeta>(key: K, value: AdditionalProfileMeta[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileMeta(profile);
    setIsEditing(false);
    showToast('Perfil atualizado com sucesso!', 'success');
  };

  // Mock Photo File Upload Processing
  const handlePhotoUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempPhoto(reader.result as string);
        setPhotoScale(1.2);
        setPhotoCropX(0);
        setPhotoCropY(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save the cropped simulated photo
  const handleSaveCroppedPhoto = () => {
    if (tempPhoto) {
      const updated = {
        ...profile,
        realPhoto: tempPhoto,
        preferRealPhoto: true
      };
      saveProfileMeta(updated);
      
      // Update User Avatar
      updateUser({ avatar: tempPhoto });
      setIsPhotoModalOpen(false);
      setTempPhoto(null);
      showToast('Sua foto real foi carregada, recortada e definida como foto principal!', 'success');
    }
  };

  // Select System avatar
  const handleEquipSystemAvatar = (imgUrl: string) => {
    const updated = {
      ...profile,
      preferRealPhoto: false
    };
    saveProfileMeta(updated);
    updateUser({ avatar: imgUrl });
    setIsAvatarGalleryOpen(false);
    showToast('Novo Avatar equipado com sucesso!', 'success');
  };

  const handleRemovePhoto = () => {
    const updated = {
      ...profile,
      realPhoto: null,
      preferRealPhoto: false
    };
    saveProfileMeta(updated);
    
    // Fallback default avatar
    const defaultAv = 'https://api.dicebear.com/7.x/adventurer/svg?seed=atleta_speak&radius=50';
    updateUser({ avatar: defaultAv });
    showToast('Foto removida! O sistema retornará ao avatar padrão.', 'info');
  };

  // Belt design bg styler
  const getBeltColorStyle = (belt: BeltRank) => {
    switch (belt) {
      case 'Branca': return 'border-slate-300 text-slate-100 bg-slate-950';
      case 'Azul': return 'border-blue-500 text-blue-400 bg-blue-950/40';
      case 'Roxa': return 'border-purple-500 text-purple-400 bg-purple-950/40';
      case 'Marrom': return 'border-amber-700 text-amber-500 bg-amber-950/40';
      case 'Preto': return 'border-red-600 text-red-500 bg-red-950/40 font-bold';
    }
  };

  // Pre-seeded high fidelity achievements
  const systemAchievements = [
    { id: 'first_lesson', title: 'Primeira Aula', desc: 'Concluiu a primeira lição de inglês técnico.', icon: '🎓', unlocked: true },
    { id: 'first_login', title: 'Primeiro Login', desc: 'Ativou a conta no Tatame do JiuSpeak.', icon: '🥋', unlocked: true },
    { id: 'xp_100', title: '100 XP', desc: 'Desbloqueou a marca inicial de 100 pontos.', icon: '✨', unlocked: user.xp >= 100 || user.level > 1 },
    { id: 'xp_500', title: '500 XP', desc: 'Mostrou consistência acumulando 500 XP.', icon: '🔥', unlocked: user.xp >= 500 || user.level > 3 },
    { id: 'xp_1000', title: '1000 XP', desc: 'Ascendeu aos tatames alcançando 1000 XP.', icon: '🏆', unlocked: user.xp >= 1000 || user.level >= 5 },
    { id: 'first_pvp', title: 'Primeira Conversação', desc: 'Completou seu primeiro diálogo interativo em áudio.', icon: '🎙️', unlocked: user.winCount + user.lossCount > 0 },
    { id: 'first_cert', title: 'Primeiro Certificado', desc: 'Conquistou um diploma oficial de proficiência.', icon: '📜', unlocked: user.level >= 5 },
    { id: 'first_purchase', title: 'Primeira Compra', desc: 'Comprou um avatar premium ou moldura na loja.', icon: '🛍️', unlocked: user.inventory.length > 0 },
  ];

  // Dynamically simulated academy certificates based on level
  const mockCertificates = [
    { id: 'cert_1', title: 'Fundamentos das Posições de Guarda (A1)', code: 'JS-FG-A1-2049', date: '01/05/2026', unlocked: true },
    { id: 'cert_2', title: 'Vocabulário Técnico de Finalização & Raspagem (A2)', code: 'JS-VT-A2-4421', date: '12/05/2026', unlocked: user.level >= 5 },
    { id: 'cert_3', title: 'Comandos de Árbitro em Competição (B1)', code: 'JS-CA-B1-9981', date: '28/05/2026', unlocked: user.level >= 12 },
    { id: 'cert_4', title: 'Conversão em Seminário Prático Profissional (B2)', code: 'JS-SP-B2-0192', date: 'Pendente', unlocked: user.level >= 20 },
  ];

  // Friendly URL public portfolio link copy helper
  const handleCopyPublicUrl = () => {
    const publicNameClean = profile.publicName || user.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fullUrl = `${window.location.origin}/profile/${publicNameClean}`;
    navigator.clipboard.writeText(fullUrl);
    showToast(`Link amigável copiado: ${fullUrl}`, 'success');
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="profile-container-panel">
      
      {/* 1. PROFILE CARD HEADER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        {/* Profile Avatar Frame Container with Actions */}
        <div className="flex flex-col items-center gap-3 relative shrink-0">
          <div className="relative group">
            {profile.preferRealPhoto && profile.realPhoto ? (
              <img 
                src={profile.realPhoto} 
                alt={user.name} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-850 object-cover shadow-2xl referrerPolicy='no-referrer'" 
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-950 border-4 border-slate-850 rounded-full flex items-center justify-center overflow-hidden shadow-2xl relative">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Premium Gold Seal / Banner Cues */}
            {profile.isPremium && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border border-yellow-400 flex items-center gap-0.5 shadow-md">
                <Sparkles className="w-3 h-3 fill-slate-950 animate-spin" /> PRO
              </span>
            )}

            <div className="absolute inset-0 bg-slate-950/60 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
              <button 
                onClick={() => setIsPhotoModalOpen(true)}
                className="p-2 bg-slate-900 border border-slate-700 text-white rounded-full hover:scale-105 transition-all"
                title="Trocar Foto"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsAvatarGalleryOpen(true)}
                className="p-2 bg-slate-900 border border-slate-700 text-violet-300 rounded-full hover:scale-105 transition-all"
                title="Escolher Avatar Oficial"
              >
                <PenTool className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 text-[10px]">
            <button 
              onClick={() => setIsPhotoModalOpen(true)}
              className="text-slate-400 hover:text-white transition-all underline font-medium"
            >
              Alterar Foto
            </button>
            {profile.realPhoto && (
              <button 
                onClick={handleRemovePhoto}
                className="text-red-400 hover:text-red-300 transition-all font-mono"
              >
                Remover
              </button>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Display Primary Header Text */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-display font-black text-white leading-none tracking-tight flex items-center justify-center md:justify-start gap-2.5">
              <span>{user.name}</span>
              {/* Gold Star Seal */}
              {profile.isPremium && (
                <span className="w-5 h-5 rounded-full bg-yellow-400/10 border border-yellow-500/50 flex items-center justify-center text-xs text-yellow-400" title="Membro Premium JiuSpeak">
                  ★
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono flex items-center justify-center md:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{profile.city}, {profile.country}</span>
              <span className="text-slate-655">•</span>
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Nativo: {profile.nativeLanguage}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
            <span className={`text-[10px] px-2.5 py-1 rounded-full border uppercase tracking-wider font-extrabold ${getBeltColorStyle(user.belt)}`}>
              🥋 FAIXA {user.belt.toUpperCase()} — {user.stripes} {user.stripes === 1 ? 'GRAU' : 'GRAUS'}
            </span>
            <span className="bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              NÍVEL {user.level} ACADÊMICO
            </span>
            <span className="bg-indigo-950/45 text-indigo-300 border border-indigo-500/15 text-[10px] px-2.5 py-1 rounded-full font-bold">
              RANKING GLOBAL #{Math.max(12, 545 - user.level * 12)}º
            </span>
          </div>

          <p className="text-slate-300 text-xs italic line-clamp-2 md:max-w-2xl font-normal leading-relaxed">
            "{profile.bio}"
          </p>

          <div className="border-t border-slate-800/60 pt-4 flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-slate-400 font-mono">
            <div>
              <span className="text-slate-500 block">MEMBRO DESDE</span>
              <span className="font-bold text-slate-200">MAIO 2026</span>
            </div>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-slate-500 block">DESEMPENHO MÉDIO</span>
              <span className="font-bold text-emerald-400">{profile.performanceAverage}% APREENSÃO</span>
            </div>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-slate-500 block">IDIOMA ALVO</span>
              <span className="font-bold text-violet-400">EN - {profile.targetLanguage.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Action button inside Header */}
        <div className="shrink-0 flex gap-2">
          <button 
            type="button"
            onClick={handleCopyPublicUrl}
            className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Copiar link de Perfil Público"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden md:inline">Compartilhar</span>
          </button>

          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              isEditing 
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-650' 
                : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>{isEditing ? 'Cancelar' : 'Editar Perfil'}</span>
          </button>
        </div>
      </div>

      {isEditing && (
        <form onSubmit={handleSaveProfileForm} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
              📝 FORMULÁRIO DE ATUALIZAÇÃO CADASTRAL
            </h3>
            <span className="text-[10px] font-mono text-slate-500">PRODUÇÃO LOCAL LOCK ATIVO</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome no Perfil</label>
              <input 
                type="text" 
                value={user.name.split(' ')[0]} 
                onChange={(e) => {
                  const label = e.target.value;
                  updateUser({ name: `${label} ${profile.surname}`.trim() });
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sobrenome</label>
              <input 
                type="text" 
                value={profile.surname} 
                onChange={(e) => handleMetaFieldChange('surname', e.target.value)} 
                placeholder="Ex. Gracie"
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Apelido / Nome Público amigável</label>
              <input 
                type="text" 
                value={profile.publicName} 
                onChange={(e) => handleMetaFieldChange('publicName', e.target.value)} 
                placeholder="Ex. roger-gracie"
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none placeholder:text-slate-650" 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cidade</label>
                <input 
                  type="text" 
                  value={profile.city} 
                  onChange={(e) => handleMetaFieldChange('city', e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">País</label>
                <input 
                  type="text" 
                  value={profile.country} 
                  onChange={(e) => handleMetaFieldChange('country', e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Idioma Nativo</label>
              <input 
                type="text" 
                value={profile.nativeLanguage} 
                onChange={(e) => handleMetaFieldChange('nativeLanguage', e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Idioma de Interesse</label>
              <select 
                value={profile.targetLanguage} 
                onChange={(e) => handleMetaFieldChange('targetLanguage', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Inglês">Aprender Inglês</option>
                <option value="Espanhol">Aprender Espanhol</option>
                <option value="Português">Aprender Português</option>
                <option value="Francês">Aprender Francês</option>
                <option value="Italiano">Aprender Italiano</option>
                <option value="Alemão">Aprender Alemão</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Objetivo de Idioma</label>
              <input 
                type="text" 
                value={profile.mainGoal} 
                onChange={(e) => handleMetaFieldChange('mainGoal', e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Biografia ("Sobre Mim")</label>
            <textarea 
              value={profile.bio} 
              onChange={(e) => handleMetaFieldChange('bio', e.target.value)} 
              rows={3} 
              placeholder="Fale um pouco sobre sua rotina, sua experiência no Jiu-Jitsu e seus objetivos acadêmicos de idiomas..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-3 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Social Links Sub-Module */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest flex items-center gap-1.5">
              🔗 INTEGRAÇÃO DE REDES SOCIAIS (LINKS CLICÁVEIS)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">YOUTUBE USERNAME</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-2.5 w-4 h-4 text-red-500" />
                  <input 
                    type="text" 
                    value={profile.youtube} 
                    onChange={(e) => handleMetaFieldChange('youtube', e.target.value)} 
                    placeholder="Ex: @AllianceMundial"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">INSTAGRAM USERNAME</label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-2.5 w-4 h-4 text-rose-500" />
                  <input 
                    type="text" 
                    value={profile.instagram} 
                    onChange={(e) => handleMetaFieldChange('instagram', e.target.value)} 
                    placeholder="Ex: atleta_brave"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">TIKTOK ID</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 w-4 h-4 text-sky-400" />
                  <input 
                    type="text" 
                    value={profile.tiktok} 
                    onChange={(e) => handleMetaFieldChange('tiktok', e.target.value)} 
                    placeholder="Ex: bjj_tiktok"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">FACEBOOK LINK</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-2.5 w-4 h-4 text-blue-500" />
                  <input 
                    type="text" 
                    value={profile.facebook} 
                    onChange={(e) => handleMetaFieldChange('facebook', e.target.value)} 
                    placeholder="Ex: facebook.com/rogergracie"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">WEBSITE COMPACT PORTFOLIO URL</label>
                <div className="relative">
                  <Link className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={profile.website} 
                    onChange={(e) => handleMetaFieldChange('website', e.target.value)} 
                    placeholder="Ex: https://www.gracieonline.com"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BJJ Credentials Section */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest flex items-center gap-1.5">
              🥋 PARÂMETROS MARCIAIS E CREDENCIAIS JIU-JITSU
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Faixa Atual</label>
                <select 
                  value={user.belt} 
                  onChange={(e) => {
                    updateUser({ belt: e.target.value as BeltRank });
                    showToast(`Sua graduação de teste foi atualizada para Faixa ${e.target.value}!`, 'info');
                  }}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Branca">Branca</option>
                  <option value="Azul">Azul</option>
                  <option value="Roxa">Roxa</option>
                  <option value="Marrom">Marrom</option>
                  <option value="Preto">Preto</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Academia</label>
                <input 
                  type="text" 
                  value={profile.academy} 
                  onChange={(e) => handleMetaFieldChange('academy', e.target.value)} 
                  placeholder="Nome do dojô atual"
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Professor Responsável</label>
                <input 
                  type="text" 
                  value={profile.professor} 
                  onChange={(e) => handleMetaFieldChange('professor', e.target.value)} 
                  placeholder="Seu mestre"
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tempo de Treino Geral</label>
                <input 
                  type="text" 
                  value={profile.trainingTime} 
                  onChange={(e) => handleMetaFieldChange('trainingTime', e.target.value)} 
                  placeholder="Ex: 5 Anos"
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Objetivos de Combate / Categoria</label>
              <input 
                type="text" 
                value={profile.goalsBjj} 
                onChange={(e) => handleMetaFieldChange('goalsBjj', e.target.value)} 
                placeholder="Ex. Competir o Europeu, dar aulas no exterior"
                className="w-full bg-slate-955 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)} 
              className="py-2.5 px-6 bg-slate-955 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold hover:text-white"
            >
              Cancelar Edições
            </button>
            <button 
              type="submit" 
              className="py-2.5 px-8 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/10 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Dados Cadastrais</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. CORE GRID: SOCIALS, STATS, CERTIFICATES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stats Cards, Social, BJJ Credentials (span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Stats Bento */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              📊 HISTÓRICO GERAL DE ESTUDOS
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900/60 flex flex-col justify-between">
                <Clock className="w-5 h-5 text-indigo-400 mb-2" />
                <div className="leading-none">
                  <span className="block text-2xl font-black text-white">{profile.studyHours}h</span>
                  <span className="text-[10px] text-slate-500 font-mono">Horas Estudadas</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900/60 flex flex-col justify-between">
                <CheckCircle className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="leading-none">
                  <span className="block text-2xl font-black text-white">{profile.completedLessonsCount}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Lições Concluídas</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900/60 flex flex-col justify-between">
                <Flame className="w-5 h-5 text-orange-500 mb-2" />
                <div className="leading-none">
                  <span className="block text-2xl font-black text-white">{user.streak}d</span>
                  <span className="text-[10px] text-slate-500 font-mono">Dias Consecutivos</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900/60 flex flex-col justify-between">
                <Award className="w-5 h-5 text-yellow-500 mb-2" />
                <div className="leading-none">
                  <span className="block text-2xl font-black text-white">{user.xp} XP</span>
                  <span className="text-[10px] text-slate-500 font-mono">Pontuação Total</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-[11px] text-slate-405 flex justify-between">
              <span>ÚLTIMA ATIVIDADE:</span>
              <span className="font-mono text-slate-300">Hoje às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Social Networks Links Panel (Visually Polished) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              🌐 REDE SOCIAL E CONTATOS
            </h4>
            
            <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
              Visualização simplificada de redes sociais associadas ao portfólio acadêmico para o tatame global.
            </p>

            <div className="space-y-2.5">
              {profile.instagram && (
                <a 
                  href={`https://instagram.com/${profile.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-900 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Instagram className="w-4 h-4 text-rose-500" />
                    <span>Instagram</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">@{profile.instagram}</span>
                </a>
              )}

              {profile.facebook && (
                <a 
                  href={profile.facebook.startsWith('http') ? profile.facebook : `https://${profile.facebook}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-900 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Facebook className="w-4 h-4 text-blue-500" />
                    <span>Facebook</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Vincular</span>
                </a>
              )}

              {profile.tiktok && (
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-900 text-xs text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span>TikTok</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">@{profile.tiktok}</span>
                </div>
              )}

              {profile.youtube && (
                <a 
                  href={`https://youtube.com/${profile.youtube}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-900 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>YouTube Channel</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{profile.youtube}</span>
                </a>
              )}

              {profile.website && (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-900 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Link className="w-4 h-4 text-violet-400" />
                    <span>Meu Website / Blog</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Visitar</span>
                </a>
              )}

              {!profile.instagram && !profile.facebook && !profile.youtube && !profile.website && !profile.tiktok && (
                <div className="p-4 bg-slate-950 text-center rounded-2xl border border-slate-900 text-xs text-slate-500 italic">
                  Nenhuma rede social vinculada. Clique em "Editar Perfil" para integrar seus links.
                </div>
              )}
            </div>
          </div>

          {/* Martial Info Frame */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              🥋 CREDECIAMENTO DO TATAME BJJ
            </h4>

            <div className="space-y-3 font-sans text-xs">
              <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl">
                <span className="text-slate-500 font-mono">ACADEMIA:</span>
                <span className="font-bold text-slate-200 uppercase">{profile.academy}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl">
                <span className="text-slate-500 font-mono">PROFESSOR / MESTRE:</span>
                <span className="font-bold text-slate-200 uppercase">{profile.professor}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl">
                <span className="text-slate-500 font-mono">TEMPO DE TATAME:</span>
                <span className="font-bold text-slate-200">{profile.trainingTime}</span>
              </div>
              <div className="flex flex-col gap-1 p-2.5 bg-slate-950/60 rounded-xl">
                <span className="text-slate-500 font-mono">OBJETIVOS ATUAIS DE COMBATE:</span>
                <span className="font-bold text-violet-300 leading-normal">{profile.goalsBjj}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Achievements & Certificates (span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Certificates portfolio */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                  📜 PORTFÓLIO DE CERTIFICAÇÕES IDIOMÁTICAS
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Certificados emitidos pela JiuSpeak Academy auditados pela blockchain do Tatame.</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-500/10">
                Aprovados: {mockCertificates.filter(c => c.unlocked).length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockCertificates.map((cert) => (
                <div 
                  key={cert.id} 
                  className={`border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${
                    cert.unlocked 
                      ? 'bg-slate-950/80 border-slate-800 hover:border-violet-600 shadow-lg' 
                      : 'bg-slate-900/20 border-slate-950 opacity-55'
                  }`}
                >
                  {cert.unlocked && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-violet-600/10 to-transparent rounded-full blur-xl pointer-events-none" />
                  )}

                  <div className="flex items-start gap-4 h-full flex-col justify-between">
                    <div className="space-y-1.5 w-full">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono py-0.5 px-2 bg-slate-900 rounded border border-slate-800 font-bold uppercase text-slate-400">
                          {cert.unlocked ? '✅ Emitido' : '🔒 Requer Nível'}
                        </span>
                        {cert.unlocked && (
                          <span className="text-xs text-yellow-500" title="Selo Oficial de Proficiência">🎖️</span>
                        )}
                      </div>

                      <h4 className={`text-xs font-bold leading-snug ${cert.unlocked ? 'text-white' : 'text-slate-500'}`}>
                        {cert.title}
                      </h4>
                      <p className="text-[9px] font-mono text-slate-600 truncate">SÉRIE: {cert.code}</p>
                    </div>

                    <div className="border-t border-slate-900/60 pt-3 w-full flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>DATA: {cert.date}</span>
                      {cert.unlocked ? (
                        <div className="flex items-center gap-2">
                          <button 
                            type="button" 
                            onClick={() => showToast(`Iniciando download do PDF auditado do certificado ${cert.code}...`, 'success')}
                            className="p-1 h-7 w-7 rounded bg-slate-900 border border-slate-850 hover:text-white transition-all hover:scale-105"
                            title="Baixar Certificado em PDF completo"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400 hover:text-white mx-auto" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-indigo-400">Pendente</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gamificação: Badges achievements display (Visually Polished bento) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
            <div>
              <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                🏆 MURAL DE CONQUISTAS GAMIFICADO
              </h3>
              <p className="text-[11px] text-slate-550 mt-0.5">Vincule insígnias de proficiência para aumentar seu engajamento com a comunidade.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {systemAchievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`p-4 rounded-2xl border text-center relative overflow-hidden transition-all ${
                    ach.unlocked 
                      ? 'bg-slate-950 border-slate-800 hover:border-violet-500 shadow-md' 
                      : 'bg-slate-900/10 border-slate-950 opacity-40'
                  }`}
                >
                  <div className="text-3xl mb-1.5 block">{ach.unlocked ? ach.icon : '🔒'}</div>
                  <h4 className={`text-xs font-bold truncate ${ach.unlocked ? 'text-slate-200' : 'text-slate-600'}`}>
                    {ach.title}
                  </h4>
                  <p className="text-[9px] text-slate-550 leading-snug mt-1 max-w-sm mx-auto line-clamp-2">
                    {ach.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 3. SIMULATED FOTO DE PERFIL CROPPER MODAL */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl max-w-md w-full p-6 space-y-6 animate-scaleUp shadow-2xl">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h4 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                📸 SELETOR & RECORTADOR DE FOTO REAL
              </h4>
              <button 
                onClick={() => { setIsPhotoModalOpen(false); setTempPhoto(null); }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {!tempPhoto ? (
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 hover:border-violet-500 transition-all text-center space-y-4">
                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-slate-500 mx-auto border border-slate-850">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white font-bold">Faça o upload do seu avatar real</p>
                  <p className="text-[10px] text-slate-500">Aceita formatos JPG, PNG, WEBP (Mock-cropper integrado)</p>
                </div>
                <label className="inline-block px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer">
                  Selecione Arquivo do Disco
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUploadChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Simulated canvas cropper view */}
                <div className="relative w-full h-48 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 pointer-events-none z-10" />
                  {/* Crop Target Indicator Area */}
                  <div className="absolute w-32 h-32 rounded-full border-2 border-dashed border-violet-500 z-20 pointer-events-none" />
                  
                  <img 
                    src={tempPhoto} 
                    alt="Processando"
                    className="object-contain transition-transform"
                    style={{ 
                      transform: `scale(${photoScale}) translate(${photoCropX}px, ${photoCropY}px)`,
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }} 
                  />
                </div>

                {/* Sizing scale indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>AJUSTAR ZOOM:</span>
                    <span>{photoScale.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    value={photoScale} 
                    onChange={(e) => setPhotoScale(parseFloat(e.target.value))} 
                    className="w-full accent-violet-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                  <button 
                    onClick={() => { setTempPhoto(null); }} 
                    className="py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg hover:text-white"
                  >
                    Trocar Arquivo
                  </button>
                  <button 
                    onClick={handleSaveCroppedPhoto}
                    className="py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-550 font-bold"
                  >
                    Recortar & Aplicar
                  </button>
                </div>
              </div>
            )}

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-[10px] text-slate-500 leading-snug flex items-start gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
              <span>Ao aplicar uma foto real, ela terá prioridade de exibição no cabeçalho do perfil e nos fóruns da Atama Virtual Team.</span>
            </div>

          </div>
        </div>
      )}

      {/* 4. OFFICIAL SYSTEM AVATARS GALLERY GALLERY MODAL */}
      {isAvatarGalleryOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl max-w-xl w-full p-6 space-y-6 animate-scaleUp shadow-2xl max-h-[85vh] flex flex-col justify-between">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
              <h4 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                🥋 COLEÇÃO DE AVATARES OFICIAIS DO JIUSPEAK
              </h4>
              <button 
                onClick={() => setIsAvatarGalleryOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-1 py-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 flex-1 my-4">
              {avatarMappingList.slice(0, 20).map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleEquipSystemAvatar(av.image)}
                  className="p-2.5 bg-slate-955 hover:bg-slate-850 border border-slate-800 hover:border-violet-500 rounded-2xl text-center space-y-1.5 transition-all cursor-pointer group"
                >
                  <img src={av.image} alt={av.name} className="w-12 h-12 rounded-full mx-auto" referrerPolicy="no-referrer" />
                  <p className="text-[9px] text-slate-450 truncate group-hover:text-white font-sans">{av.name}</p>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-3 shrink-0 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Selecione para equipar instantaneamente.</span>
              <button 
                onClick={() => setIsAvatarGalleryOpen(false)} 
                className="py-1 px-4 bg-slate-950 border border-slate-850 rounded-lg hover:text-white text-xs font-bold"
              >
                Fechar Galeria
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
