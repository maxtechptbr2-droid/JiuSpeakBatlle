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
  Minus,
  X,
  Grid
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
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [activeModal, setActiveModal] = useState<'followers' | 'following' | null>(null);

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
    if (togglingFollow) return;
    try {
      setTogglingFollow(true);
      const token = localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
      const serviceUrl = '/api/profile/follow';
      const method = isFollowing ? 'DELETE' : 'POST';
      const url = method === 'DELETE' ? `${serviceUrl}?targetUserId=${profileData.id}` : serviceUrl;

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: method === 'POST' ? JSON.stringify({ targetUserId: profileData.id }) : undefined
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        // Refresh profile stats
        await fetchPublicProfile();
        showToast(isFollowing ? `Deixou de seguir @${username}` : `Agora você segue @${username}!`, "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Fracasso na ação de seguir.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Não foi possível processar pedido social.", "error");
    } finally {
      setTogglingFollow(false);
    }
  };

  const getBeltColorStyle = (belt: string) => {
    switch (belt?.toUpperCase()) {
      case 'WHITE':
      case 'BRANCA': return 'border-slate-300 text-slate-100 bg-slate-950';
      case 'BLUE':
      case 'AZUL': return 'border-blue-500 text-blue-400 bg-blue-950/45';
      case 'PURPLE':
      case 'ROXA': return 'border-purple-500 text-purple-400 bg-purple-950/45';
      case 'BROWN':
      case 'MARROM': return 'border-amber-700 text-amber-500 bg-amber-950/45';
      case 'BLACK':
      case 'PRETO': return 'border-red-650 text-red-500 bg-red-950/45 font-bold';
      default: return 'border-slate-600 text-slate-400 bg-slate-900';
    }
  };

  const getBeltBeltRingColor = (belt: string) => {
    switch (belt?.toUpperCase()) {
      case 'WHITE':
      case 'BRANCA': return 'border-slate-300 ring-2 ring-slate-100 ring-offset-4 ring-offset-slate-950';
      case 'BLUE':
      case 'AZUL': return 'border-blue-500 ring-2 ring-blue-500 ring-offset-4 ring-offset-slate-950';
      case 'PURPLE':
      case 'ROXA': return 'border-purple-500 ring-2 ring-purple-500 ring-offset-4 ring-offset-slate-950';
      case 'BROWN':
      case 'MARROM': return 'border-amber-700 ring-2 ring-amber-600 ring-offset-4 ring-offset-slate-950';
      case 'BLACK':
      case 'PRETO': return 'border-red-650 ring-2 ring-red-550 ring-offset-4 ring-offset-slate-950';
      default: return 'border-slate-600 ring-2 ring-slate-500 ring-offset-4 ring-offset-slate-950';
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
      <div className="bg-slate-905 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-4 shadow-2xl animate-fadeIn" id="pub-profile-error">
        <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 text-xl">
          ⚠️
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Lutador não indexado</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{errorMsg}</p>
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
          className="text-xs font-mono text-slate-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
        >
          ← Voltar para Comunidade
        </button>
        <span className="text-[10px] font-mono text-slate-600">Portfólio ID: #{profileData?.id?.substring(0, 8)}</span>
      </div>

      {/* 2. THE STUNNING PROFILE DISPLAY CARD - Instagram Style */}
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
          
          {/* Custom framed avatar following modern user preferences */}
          <div className="relative shrink-0">
            <div className={`rounded-full p-1 border-4 ${
              getBeltBeltRingColor(profileData?.belt)
            } bg-slate-950 shadow-2xl relative overflow-hidden shrink-0`}>
              <img 
                src={profileData?.profilePhoto || profileData?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                alt={profileData?.name} 
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover shrink-0"
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
                <span className="inline-block text-xs font-mono text-slate-400 bg-slate-900 py-1 px-2.5 rounded-full border border-slate-800">
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

            {/* Instagram Style Statistics Row (POSTS, SEGUIDORES, SEGUINDO) */}
            <div className="flex gap-6 md:gap-8 py-3 px-4 outline-none border-y border-slate-900/65 md:border-none justify-center md:justify-start w-full md:w-auto font-sans pt-3">
              <div className="text-center md:text-left">
                <span className="font-extrabold text-sm md:text-base text-slate-100">{profileData?.posts?.length || 0} </span>
                <span className="text-xs text-slate-400">publicações</span>
              </div>
              
              <div 
                className="text-center md:text-left cursor-pointer hover:text-violet-400 transition-colors group"
                onClick={() => setActiveModal('followers')}
              >
                <span className="font-extrabold text-sm md:text-base text-slate-100 group-hover:text-violet-400 transition-colors">
                  {profileData?.followersCount || 0}{' '}
                </span>
                <span className="text-xs text-slate-400 group-hover:text-violet-350 transition-colors">seguidores</span>
              </div>

              <div 
                className="text-center md:text-left cursor-pointer hover:text-violet-400 transition-colors group"
                onClick={() => setActiveModal('following')}
              >
                <span className="font-extrabold text-sm md:text-base text-slate-100 group-hover:text-violet-400 transition-colors">
                  {profileData?.followingCount || 0}{' '}
                </span>
                <span className="text-xs text-slate-400 group-hover:text-violet-350 transition-colors">seguindo</span>
              </div>
            </div>
          </div>

          {/* Follow CTA controls */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            {!isMine && (
              <button
                onClick={handleFollowAction}
                disabled={togglingFollow}
                className={`w-48 py-2.5 px-4 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-102 cursor-pointer disabled:opacity-50 ${
                  isFollowing 
                    ? 'bg-slate-800 text-red-400 hover:text-red-300 border border-slate-700 hover:bg-slate-750' 
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/10'
                }`}
              >
                {togglingFollow ? (
                  <div className="w-4.5 h-4.5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                ) : isFollowing ? (
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
              className="py-2.5 px-6 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Seguir para Solicitar Mutualidade</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="profile-detailed-panels">
          
          {/* Left Column (span 4): Social Links, Bio, preferred stats */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Biography */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider font-sans">
                About / Biografia
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-normal italic">
                {profileData?.bio ? `"${profileData.bio}"` : '"Este lutador não cadastrou uma biografia de tatame até o momento."'}
              </p>
            </div>

            {/* Social Network Links */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider font-sans">
                🔗 Rede Social
              </h4>
              
              <div className="space-y-2.5 font-sans">
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
                    <span className="text-[10px] font-mono text-slate-500 font-normal">Visitar</span>
                  </a>
                )}

                {!profileData?.instagram && !profileData?.youtube && !profileData?.facebook && !profileData?.website && (
                  <p className="text-[11px] text-slate-500 italic py-2 text-center">Nenhum canal de transmissão oficial associado.</p>
                )}
              </div>
            </div>

            {/* BJJ Preferences */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider font-sans">
                🥋 PREFERÊNCIAS TÉCNICAS
              </h4>

              <div className="space-y-3 text-xs font-sans">
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl">
                  <span className="text-slate-500 font-mono text-[10px]">TÉCNICA FAVORITA:</span>
                  <span className="font-bold text-slate-205">{profileData?.favoriteTechnique || 'Omoplata Clássica'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl">
                  <span className="text-slate-500 font-mono text-[10px]">ÍDOLO/REFERÊNCIA:</span>
                  <span className="font-bold text-slate-205">{profileData?.favoriteAthlete || 'Roger Gracie'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl font-mono">
                  <span className="text-slate-500 text-[10px]">ORGANIZAÇÃO:</span>
                  <span className="font-bold text-violet-300 uppercase truncate">{profileData?.academy || 'Atama Team'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (span 8): Academic Metrics & post timeline */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Academic stats card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
              <div>
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                  📈 MÁSTER DE HISTÓRICO DE APREENSÃO
                </h3>
                <p className="text-xs text-slate-500 mt-1">Calibração de níveis auto-avaliados e fluência do lutador de jiu-jitsu.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
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
                <div className="bg-slate-950/65 p-4 rounded-2xl border border-slate-900/60 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 block font-bold font-sans">Foco & Meta de Estudos</span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
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
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Ofensiva</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-center space-y-1">
                  <Award className="w-6 h-6 text-violet-400 mx-auto fill-violet-500/10" />
                  <span className="block text-lg font-black text-white">{profileData?.xp || 0}</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">XP Geral</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-905 text-center space-y-1">
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto fill-yellow-500/10" />
                  <span className="block text-lg font-black text-white">{profileData?.winCount || 0}</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Vitórias</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-center space-y-1">
                  <Sparkles className="w-6 h-6 text-amber-500 mx-auto" />
                  <span className="block text-lg font-black text-white">{profileData?.elo || 1000}</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">ELO</span>
                </div>
              </div>
            </div>

            {/* Timeline of Social Posts (Modern Instagram Grid Style) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-md" id="profile-posts-timeline">
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Grid className="w-4.5 h-4.5 text-violet-400" />
                  TIMELINE DE PUBLICAÇÕES
                </h3>
                <span className="text-[11px] font-mono text-slate-450 bg-slate-950 px-2.5 py-1 border border-slate-850 rounded-full font-bold">
                  {profileData?.posts?.length || 0} publicações
                </span>
              </div>

              {profileData?.posts && profileData.posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {profileData.posts.map((post: any) => (
                    <div 
                      key={post.id} 
                      className="group relative aspect-square rounded-2xl border border-slate-850 bg-slate-950 p-4 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-violet-500/5 hover:border-slate-700 transition-all duration-300"
                    >
                      {/* Hover stats overlay */}
                      <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 p-4">
                        <div className="flex items-center gap-1.5 text-slate-100 font-bold font-sans">
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                          <span>{post.upvotes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-100 font-bold font-sans">
                          <Eye className="w-5 h-5 text-violet-400" />
                          <span>{post.comments ? post.comments.length : 0}</span>
                        </div>
                      </div>

                      {/* Card standard content preview */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold">
                            #{post.category || 'Geral'}
                          </span>
                          <span className="text-[8.5px] font-mono text-slate-500">{post.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-350 leading-relaxed font-sans line-clamp-4 font-medium italic">
                          "{post.content}"
                        </p>
                      </div>

                      {/* Bottom row summary */}
                      <div className="flex items-center justify-between border-t border-slate-900/60 pt-2 text-[10px] text-slate-500 font-mono">
                        <span>❤️ {post.upvotes || 0}</span>
                        <span>💬 {post.comments ? post.comments.length : 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                  <span className="text-2xl">📝</span>
                  <div className="space-y-0.5 animate-fadeIn">
                    <p className="text-xs font-semibold text-slate-400">Nenhuma publicação até o momento.</p>
                    <p className="text-[10px] text-slate-650">Este competidor ainda não compartilhou atualizações de treino.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4. MODALS/POPUPS FOR FOLLOWERS & FOLLOWING LISTS */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn" 
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
              <h3 className="font-display font-black text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                {activeModal === 'followers' ? 'Seguidores' : 'Seguindo'}
              </h3>
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 max-h-[360px] overflow-y-auto space-y-3">
              {(activeModal === 'followers' ? profileData?.followersList : profileData?.followingList)?.length > 0 ? (
                (activeModal === 'followers' ? profileData.followersList : profileData.followingList).map((f: any) => (
                  <div 
                    key={f.id}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850/60 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={f.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150'} 
                        alt={f.name}
                        className="w-9 h-9 rounded-full border border-slate-800 object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="leading-tight min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-xs font-bold text-slate-205 truncate">{f.name}</p>
                          {f.isVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0 inline" />}
                        </div>
                        {f.username && (
                          <span className="text-[10px] text-slate-500 block font-mono">@{f.username}</span>
                        )}
                        <span className={`inline-block text-[8px] font-black uppercase text-center mt-1 px-1.5 py-0.2 border rounded ${getBeltColorStyle(f.belt)}`}>
                          Faixa {f.belt || 'WHITE'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        onNavigate(`profile-public-${f.username || f.name}`);
                      }}
                      className="py-1.5 px-3.5 bg-violet-600/10 hover:bg-violet-650 hover:text-white border border-violet-500/30 text-violet-450 hover:border-transparent rounded-lg text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Ver Perfil
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 italic text-xs font-sans">
                  Nenhum registro para exibir aqui.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
