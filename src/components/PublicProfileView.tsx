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
  Users, 
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Heart,
  Eye,
  CheckCircle,
  Plus,
  Minus
} from 'lucide-react';
import { UserProfile } from '../types';

interface PublicProfileViewProps {
  username: string; // The username to fetch
  currentUser: UserProfile;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onNavigate: (tab: string) => void;
}

export default function PublicProfileView({ username, currentUser, showToast, onNavigate }: PublicProfileViewProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFriend, setIsFriend] = useState(false); // Mutual following check

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      
      const res = await fetch(`/api/profile/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setProfileData(data.profile);
        setIsFollowing(data.isFollowing || false);
        setIsFriend(data.isFriend || false);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Não foi possível encontrar o perfil do lutador.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Erro de conexão ao carregar o portfólio amigável.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const handleFollowAction = async () => {
    try {
      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      const serviceUrl = '/api/profile/follow';
      const method = isFollowing ? 'DELETE' : 'POST';

      const res = await fetch(serviceUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUsername: username })
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        // Refresh profile stats
        fetchPublicProfile();
        showToast(isFollowing ? `Deixou de seguir @${username}` : `Agora você segue @${username}!`, "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Fracasso na ação de seguir.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Não foi possível processar pedido social.", "error");
    }
  };

  const getBeltColorStyle = (belt: string) => {
    switch (belt?.toUpperCase()) {
      case 'WHITE':
      case 'BRANCA': return 'border-slate-300 text-slate-100 bg-slate-950';
      case 'BLUE':
      case 'AZUL': return 'border-blue-500 text-blue-450 bg-blue-950/45';
      case 'PURPLE':
      case 'ROXA': return 'border-purple-500 text-purple-400 bg-purple-950/45';
      case 'BROWN':
      case 'MARROM': return 'border-amber-750 text-amber-500 bg-amber-950/45';
      case 'BLACK':
      case 'PRETO': return 'border-red-600 text-red-550 bg-red-950/45 font-bold';
      default: return 'border-slate-600 text-slate-400 bg-slate-900';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-400" id="pub-profile-loader">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin"></div>
        <p className="text-xs font-mono">Indexando portfólio oficial de @{username}...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-4 shadow-2xl" id="pub-profile-error">
        <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 text-xl">
          ⚠️
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Lutador não indexado</h4>
          <p className="text-xs text-slate-450 leading-relaxed">{errorMsg}</p>
        </div>
        <button
          onClick={() => onNavigate('social')}
          className="py-2 px-5 bg-slate-950 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-800"
        >
          Voltar para Comunidade
        </button>
      </div>
    );
  }

  // Handle Privacy Restrictions
  const isMine = currentUser.name.toLowerCase() === profileData?.name?.toLowerCase();
  const privacyLevel = profileData?.privacyLevel || 'public';
  const isRestrictedByPrivacy = !isMine && (
    (privacyLevel === 'private') ||
    (privacyLevel === 'friends' && !isFriend)
  );

  return (
    <div className="space-y-8 animate-fadeIn" id="public-profile-root">
      
      {/* 1. BACK CONTROLS */}
      <div className="flex justify-between items-center bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
        <button
          onClick={() => onNavigate('social')}
          className="text-xs font-mono text-slate-400 hover:text-white transition-all flex items-center gap-1.5"
        >
          ← Voltar para Comunidade
        </button>
        <span className="text-[10px] font-mono text-slate-600">Portfólio ID: #{profileData?.id?.substring(0, 8)}</span>
      </div>

      {/* 2. THE STUNNING PROFILE DISPLAY CARD */}
      <div 
        className="relative rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl"
        style={{ borderTopColor: profileData?.themeColor || '#7c3aed', borderTopWidth: '6px' }}
      >
        {/* Cover canvas */}
        <div className="h-44 md:h-64 relative bg-slate-900 overflow-hidden">
          {profileData?.coverPhoto ? (
            <img src={profileData.coverPhoto} alt="Capa" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 flex items-center justify-center">
              <span className="text-xs font-mono text-slate-600 font-bold uppercase tracking-widest">Sem capa configurada</span>
            </div>
          )}
        </div>

        {/* Info Row overlaying the cover */}
        <div className="p-6 md:p-8 pt-0 relative flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end -mt-16 md:-mt-20 z-10">
          
          {/* Custom framed avatar */}
          <div className="relative shrink-0">
            <div className={`rounded-full p-1.5 bg-slate-950 shadow-2xl overflow-hidden ${
              profileData?.avatarFrame === 'royal_gold' ? 'ring-4 ring-yellow-500 animate-pulse' :
              profileData?.avatarFrame === 'neon_shogun' ? 'ring-4 ring-red-500' :
              profileData?.avatarFrame === 'cyber_bjj' ? 'ring-4 ring-cyan-400' :
              profileData?.avatarFrame === 'forest_zen' ? 'ring-4 ring-emerald-500' : 'ring-2 ring-slate-800'
            }`}>
              <img 
                src={profileData?.profilePhoto || profileData?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                alt={profileData?.name} 
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {profileData?.isVerified && (
              <span className="absolute bottom-1 right-2 w-7 h-7 rounded-full bg-violet-600 border-2 border-slate-950 flex items-center justify-center text-white text-xs shadow-lg" title="Perfil Verificado">
                ✓
              </span>
            )}
          </div>

          {/* Quick Identifiers */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-display font-black text-white leading-tight">
                {profileData?.name}
              </h2>
              {profileData?.username && (
                <span className="text-xs font-mono text-slate-400 bg-slate-900 py-1 px-2.5 rounded-full border border-slate-800">
                  @{profileData.username}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{profileData?.city || 'Planeta Terra'}, {profileData?.country || 'Navegação'}</span>
              <span className="text-slate-700">•</span>
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Nativo: {profileData?.nativeLanguage || 'Português'}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className={`text-[10px] px-2.5 py-1 rounded-full border uppercase tracking-wider font-extrabold ${getBeltColorStyle(profileData?.belt || 'WHITE')}`}>
                🥋 Faixa {profileData?.belt || 'Branca'} — {profileData?.stripes || 0} de 4 graus
              </span>
              <span className="bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase">
                {profileData?.level || 1} ACADÊMICO
              </span>
            </div>
          </div>

          {/* Social Follow Actions & follower counters */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <div className="flex gap-4">
              <div className="text-center bg-slate-900/60 p-2.5 border border-slate-850 rounded-2xl min-w-[70px]">
                <span className="block text-base font-black text-white">{profileData?.followersCount || 0}</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Seguidores</span>
              </div>
              <div className="text-center bg-slate-900/60 p-2.5 border border-slate-850 rounded-2xl min-w-[70px]">
                <span className="block text-base font-black text-white">{profileData?.followingCount || 0}</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Seguindo</span>
              </div>
            </div>

            {!isMine && (
              <button
                onClick={handleFollowAction}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  isFollowing 
                    ? 'bg-slate-800 text-red-400 hover:text-red-300 border border-slate-700 hover:bg-slate-750' 
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/10'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Minus className="w-3.5 h-3.5" />
                    <span>Deixar de Seguir</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Seguir Competidor</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. CORE PROFILE DATA GRID OR PRIVACY ENFORCEMENT */}

      {isRestrictedByPrivacy ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl max-w-xl mx-auto" id="privacy-restricted">
          <div className="w-14 h-14 rounded-full bg-violet-950/50 border border-violet-500/10 flex items-center justify-center mx-auto text-violet-400 text-2xl animate-pulse">
            🔒
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">Histórico de Atleta Restrito</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O lutador configurou as regras de visualização do seu portfólio de combatante para <strong>{privacyLevel === 'friends' ? 'Apenas Amigos Mútuos' : 'Totalmente Privado'}</strong>.
            </p>
          </div>
          {privacyLevel === 'friends' && !isFollowing && (
            <button
              onClick={handleFollowAction}
              className="py-2.5 px-6 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Seguir para Solicitar Mutalidade</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="profile-detailed-panels">
          
          {/* Left Column (span 4): Social Links, Bio, preferred stats */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Biography */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                About / Biografia
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-normal italic">
                {profileData?.bio ? `"${profileData.bio}"` : '"Este lutador não cadastrou uma biografia de tatame até o momento."'}
              </p>
            </div>

            {/* Social Network Links */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                🔗 Rede Social
              </h4>
              
              <div className="space-y-2.5">
                {profileData?.instagram && (
                  <a 
                    href={`https://instagram.com/${profileData.instagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-rose-400">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">@{profileData.instagram}</span>
                  </a>
                )}

                {profileData?.youtube && (
                  <a 
                    href={`https://youtube.com/${profileData.youtube}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-red-500">
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{profileData.youtube}</span>
                  </a>
                )}

                {profileData?.facebook && (
                  <a 
                    href={profileData.facebook.startsWith('http') ? profileData.facebook : `https://${profileData.facebook}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-blue-500">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Visitar</span>
                  </a>
                )}

                {profileData?.website && (
                  <a 
                    href={profileData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-indigo-400">
                      <Link className="w-4 h-4" />
                      Website
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Visitar</span>
                  </a>
                )}

                {!profileData?.instagram && !profileData?.youtube && !profileData?.facebook && !profileData?.website && (
                  <p className="text-[11px] text-slate-500 italic py-2 text-center">Nenhum canal de transmissão oficial associado.</p>
                )}
              </div>
            </div>

            {/* BJJ Preferences */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                🥋 PREFERÊNCIAS TÉCNICAS
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl">
                  <span className="text-slate-500 font-mono text-[10px]">TÉCNICA FAVORITA:</span>
                  <span className="font-bold text-slate-200">{profileData?.favoriteTechnique || 'Omoplata Clássica'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl">
                  <span className="text-slate-500 font-mono text-[10px]">ÍDOLO/REFERÊNCIA:</span>
                  <span className="font-bold text-slate-200">{profileData?.favoriteAthlete || 'Roger Gracie'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl">
                  <span className="text-slate-500 font-mono text-[10px]">ORGANIZAÇÃO:</span>
                  <span className="font-bold text-violet-300 font-mono">{profileData?.academy || 'Atama Team'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (span 8): Academic Metrics & Lanuguage Proficiencies */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Academic stats card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
              <div>
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                  📈 MÁSTER DE HISTÓRICO DE APREENSÃO
                </h3>
                <p className="text-xs text-slate-500 mt-1">Calibração de níveis auto-avaliados e fluência do lutador.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900/60 text-center space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Nível de Inglês</span>
                  <span className="text-sm font-black text-white-300 font-display uppercase tracking-wide block py-1 bg-slate-900 rounded-lg">
                    {profileData?.englishLevel || 'Iniciante'}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900/60 text-center space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Nível de Espanhol</span>
                  <span className="text-sm font-black text-white-300 font-display uppercase tracking-wide block py-1 bg-slate-900 rounded-lg">
                    {profileData?.spanishLevel || 'Iniciante'}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900/60 text-center space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Nível de Francês</span>
                  <span className="text-sm font-black text-white-300 font-display uppercase tracking-wide block py-1 bg-slate-900 rounded-lg">
                    {profileData?.frenchLevel || 'Iniciante'}
                  </span>
                </div>
              </div>

              {profileData?.learningGoal && (
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900/60 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 block font-bold">Foco & Meta de Estudos</span>
                  <p className="text-xs text-slate-300 font-sans tracking-wide leading-relaxed">
                    "{profileData.learningGoal}"
                  </p>
                </div>
              )}
            </div>

            {/* Gamification indicators */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
              <div>
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" /> CONQUISTAS DO DOJO ACADÊMICO
                </h3>
                <p className="text-xs text-slate-500 mt-1">Conquistas e marcos acumulados dentro do ecossistema de lutas e idiomas.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-center space-y-1">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto fill-orange-500/10" />
                  <span className="block text-lg font-black text-white">{profileData?.streak || 0} Dias</span>
                  <span className="text-[10px] font-mono text-slate-500">Ofensiva Ativa</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-center space-y-1">
                  <Award className="w-6 h-6 text-violet-400 mx-auto fill-violet-500/10" />
                  <span className="block text-lg font-black text-white">{profileData?.xp || 0}</span>
                  <span className="text-[10px] font-mono text-slate-500">XP Geral</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-center space-y-1">
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto fill-yellow-500/10" />
                  <span className="block text-lg font-black text-white">{profileData?.winCount || 0}</span>
                  <span className="text-[10px] font-mono text-slate-500">Vitórias Arena</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-center space-y-1">
                  <Sparkles className="w-6 h-6 text-amber-500 mx-auto" />
                  <span className="block text-lg font-black text-white">{profileData?.elo || 1000}</span>
                  <span className="text-[10px] font-mono text-slate-500">PONTOS ELO</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
