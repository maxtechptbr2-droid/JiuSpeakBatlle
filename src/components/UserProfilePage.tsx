import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Grid, Film, Bookmark, UserCheck, UserPlus, MoreHorizontal, CheckCircle, Search, X, Edit2, MapPin } from 'lucide-react';
import { UserProfile } from '../types';
import ProfileEditModal from './ProfileEditModal';
import { SocialIcon, detectSocial } from './socialIcons';

const getToken = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
const authFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) } });

const BELT_COLORS: Record<string, string> = { WHITE: '#e5e7eb', BLUE: '#1a5aad', PURPLE: '#6b21a8', BROWN: '#78350f', BLACK: '#111' };
const BELT_LABELS: Record<string, string> = { WHITE: 'Branca', BLUE: 'Azul', PURPLE: 'Roxa', BROWN: 'Marrom', BLACK: 'Preta' };

interface Props {
  userId: string;
  currentUser: UserProfile;
  showToast: (msg: string, type?: string) => void;
  onBack: () => void;
}

export default function UserProfilePage({ userId: initialUserId, currentUser, showToast, onBack }: Props) {
  const [userId, setUserId] = useState(initialUserId);
  const [navStack, setNavStack] = useState<string[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [tab, setTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [fullscreen, setFullscreen] = useState<{type: string, url: string, content?: string, locationName?: string, locationLat?: number, locationLng?: number} | null>(null);
  const [socialModal, setSocialModal] = useState<'followers' | 'following' | null>(null);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [togglingFollow, setTogglingFollow] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [following, setFollowing] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProfile(); }, [userId]);

  useEffect(() => {
    if (socialModal && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 200);
    }
  }, [socialModal]);

  const fetchProfile = async () => {
    setLoading(true);
    const [profRes, postsRes] = await Promise.all([
      authFetch(`/api/social/users/${userId}/profile`),
      authFetch(`/api/social/posts?authorId=${userId}&limit=30`)
    ]);
    if (profRes.ok) {
      const d = await profRes.json();
      setProfile(d.user);
      setFollowing(d.user.isFollowing === true || d.user.isFollowing === 't' || d.user.isFollowing === 'true');
    }
    if (postsRes.ok) {
      const d = await postsRes.json();
      setPosts(d.posts || []);
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    const res = await authFetch(`/api/social/users/${userId}/follow`, { method: 'POST' });
    if (res.ok) {
      const d = await res.json();
      const nowFollowing = d.following ?? d.isFollowing ?? !following;
      setFollowing(nowFollowing);
      setProfile((p: any) => ({ ...p, followersCount: nowFollowing ? (p.followersCount || 0) + 1 : Math.max(0, (p.followersCount || 1) - 1) }));
      showToast(nowFollowing ? 'Seguindo!' : 'Deixou de seguir', 'success');
    } else {
      showToast('Erro ao seguir', 'error');
    }
  };

  const navigateToUser = (targetId: string) => {
    if (targetId === currentUser.id) return;
    setSocialModal(null);
    setSearchQuery('');
    setNavStack(prev => [...prev, userId]);
    setUserId(targetId);
  };

  const goBack = () => {
    if (navStack.length > 0) {
      const prev = navStack[navStack.length - 1];
      setNavStack(s => s.slice(0, -1));
      setUserId(prev);
    } else {
      onBack();
    }
  };

  const openSocialModal = async (type: 'followers' | 'following') => {
    setSocialModal(type);
    setSearchQuery('');
    const [fersRes, fingRes] = await Promise.all([
      authFetch(`/api/social/users/${userId}/followers`),
      authFetch(`/api/social/users/${userId}/following`)
    ]);
    if (fersRes.ok) { const d = await fersRes.json(); setFollowersList(d.followers || []); }
    if (fingRes.ok) { const d = await fingRes.json(); setFollowingList(d.following || []); }

    // Descobrir quem EU sigo pra mostrar botao correto
    const myRes = await authFetch(`/api/social/users/${currentUser.id}/following`);
    if (myRes.ok) {
      const d = await myRes.json();
      const map: Record<string, boolean> = {};
      (d.following || []).forEach((u: any) => { map[u.id] = true; });
      setFollowingMap(map);
    }
  };

  const toggleFollowInList = async (targetId: string) => {
    if (targetId === currentUser.id) return;
    setTogglingFollow(targetId);
    const res = await authFetch(`/api/social/users/${targetId}/follow`, { method: 'POST' });
    if (res.ok) {
      const d = await res.json();
      const nowFollowing = d.following ?? d.isFollowing ?? !followingMap[targetId];
      setFollowingMap(prev => ({ ...prev, [targetId]: nowFollowing }));
      // Atualizar contagem se estamos no perfil desse usuario
      if (targetId === userId) {
        setFollowing(nowFollowing);
        setProfile((p: any) => p ? { ...p, followersCount: nowFollowing ? (p.followersCount || 0) + 1 : Math.max(0, (p.followersCount || 1) - 1) } : p);
      }
    }
    setTogglingFollow(null);
  };

  const loadChat = async () => {
    const res = await authFetch(`/api/social/messages/chat/${userId}`);
    if (res.ok) {
      const d = await res.json();
      setChatMessages(Array.isArray(d) ? d : (d.messages || []));
    }
    setShowChat(true);
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    setSendingMsg(true);
    const res = await authFetch('/api/social/messages', { method: 'POST', body: JSON.stringify({ receiverId: userId, content: chatInput }) });
    if (res.ok) { setChatInput(''); loadChat(); }
    setSendingMsg(false);
  };

  const imagePosts = posts.filter(p => p.imageUrl);
  const videoPosts = posts.filter(p => p.videoUrl && !p.imageUrl);

  const currentList = socialModal === 'followers' ? followersList : followingList;
  const filteredList = searchQuery.trim()
    ? currentList.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.academy || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : currentList;

  if (loading) return (
    <div style={{ background: '#080a12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5075' }}>
      Carregando perfil...
    </div>
  );

  if (!profile) return (
    <div style={{ background: '#080a12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#4a5075' }}>
      <p>Perfil nao encontrado.</p>
      <button onClick={goBack} style={{ background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '8px 16px', color: '#c0c5e0', cursor: 'pointer', fontSize: 13 }}>Voltar</button>
    </div>
  );

  const isMe = userId === currentUser.id;

  return (
    <div style={{ background: '#080a12', minHeight: '100vh', color: '#c0c5e0', fontFamily: 'var(--font-sans)', maxWidth: 470, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid #1e2235', position: 'sticky', top: 0, background: '#080a12', zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0c5e0', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={24} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#c0c5e0' }}>{profile.username || profile.name}</span>
        <MoreHorizontal size={22} color="#c0c5e0" style={{ cursor: 'pointer' }} />
      </div>

      {/* Info do perfil */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
          <div style={{ width: 86, height: 86, borderRadius: '50%', overflow: 'hidden', background: '#2a2d45', border: '2px solid #c9a84c44', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#c9a84c', fontWeight: 500 }}>
            {profile.avatar ? <img src={profile.avatar} style={{ width: 86, height: 86, objectFit: 'cover' }} /> : profile.name?.[0]}
          </div>
          <div style={{ display: 'flex', gap: 0, flex: 1, justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#c0c5e0', margin: '0 0 2px' }}>{posts.length}</p>
              <p style={{ fontSize: 11, color: '#7b83b0', margin: 0 }}>Publicacoes</p>
            </div>
            <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => openSocialModal('followers')}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#c0c5e0', margin: '0 0 2px' }}>{profile.followersCount || 0}</p>
              <p style={{ fontSize: 11, color: '#7b83b0', margin: 0 }}>Seguidores</p>
            </div>
            <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => openSocialModal('following')}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#c0c5e0', margin: '0 0 2px' }}>{profile.followingCount || 0}</p>
              <p style={{ fontSize: 11, color: '#7b83b0', margin: 0 }}>Seguindo</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#c0c5e0' }}>{profile.name}</span>
            {profile.isVerified && <CheckCircle size={14} color="#c9a84c" />}
            {profile.belt && (
              <span style={{ background: BELT_COLORS[profile.belt] || '#333', color: profile.belt === 'WHITE' ? '#000' : '#fff', fontSize: 10, padding: '1px 7px', borderRadius: 3, fontWeight: 500 }}>
                {BELT_LABELS[profile.belt] || profile.belt}
              </span>
            )}
          </div>
          {profile.academy && <p style={{ fontSize: 13, color: '#7b83b0', margin: '0 0 2px' }}>{profile.academy}</p>}
          {profile.bio && <p style={{ fontSize: 13, color: '#c0c5e0', margin: '4px 0 0', lineHeight: 1.5 }}>{profile.bio}</p>}
          {profile.city && <p style={{ fontSize: 12, color: '#4a5075', margin: '3px 0 0' }}>{profile.city}{profile.country ? `, ${profile.country}` : ''}</p>}
          {profile.learningGoal && <p style={{ fontSize: 12, color: '#7b83b0', margin: '6px 0 0', lineHeight: 1.5 }}>🎯 {profile.learningGoal}</p>}

          {/* Links externos */}
          {(() => {
            let links: any[] = [];
            try { links = Array.isArray(profile.links) ? profile.links : JSON.parse(profile.links || '[]'); } catch { links = []; }
            if (!links.length) return null;
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {links.map((l: any, i: number) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#c0c5e0', textDecoration: 'none' }}>
                    <span style={{ color: detectSocial(l.url).color, display: 'flex' }}><SocialIcon url={l.url} size={14} /></span>
                    {l.title || 'Link'}
                  </a>
                ))}
              </div>
            );
          })()}

          {isMe && (
            <button onClick={() => setShowEdit(true)}
              style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: '0.5px solid #c9a84c', borderRadius: 8, padding: '7px 16px', color: '#c9a84c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Edit2 size={14} /> Editar Perfil
            </button>
          )}
        </div>

        {!isMe && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={handleFollow}
              style={{ flex: 1, background: following ? '#1a1d2e' : '#c9a84c', border: `0.5px solid ${following ? '#2a2d45' : '#c9a84c'}`, borderRadius: 8, padding: '8px 0', color: following ? '#c0c5e0' : '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              {following ? <><UserCheck size={15} /> Seguindo</> : <><UserPlus size={15} /> Seguir</>}
            </button>
            <button onClick={loadChat} style={{ flex: 1, background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '8px 0', color: '#c0c5e0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Mensagem
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderTop: '0.5px solid #1e2235', borderBottom: '0.5px solid #1e2235' }}>
        {[
          { id: 'posts', icon: <Grid size={20} /> },
          { id: 'reels', icon: <Film size={20} /> },
          { id: 'saved', icon: <Bookmark size={20} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flex: 1, padding: '12px 0', display: 'flex', justifyContent: 'center', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#c0c5e0' : 'transparent'}`, color: tab === t.id ? '#c0c5e0' : '#4a5075', cursor: 'pointer' }}>
            {t.icon}
          </button>
        ))}
      </div>

      {/* Grid de posts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {tab === 'posts' && imagePosts.map(p => (
          <div key={p.id} onClick={() => setFullscreen({ type: 'image', url: p.imageUrl, content: p.content, locationName: p.locationName, locationLat: p.locationLat, locationLng: p.locationLng })}
            style={{ aspectRatio: '1', overflow: 'hidden', background: '#1a1d2e', cursor: 'pointer', position: 'relative' }}>
            <img src={p.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {p.locationName && <div style={{ position: 'absolute', top: 6, left: 6, background: '#000000aa', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={12} color="#c9a84c" /></div>}
          </div>
        ))}
        {tab === 'reels' && videoPosts.map(p => (
          <div key={p.id} onClick={() => setFullscreen({ type: 'video', url: p.videoUrl, content: p.content, locationName: p.locationName, locationLat: p.locationLat, locationLng: p.locationLng })}
            style={{ aspectRatio: '1', overflow: 'hidden', background: '#1a1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
            <video src={p.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Film size={20} color="#fff" style={{ position: 'absolute', top: 6, right: 6 }} />
            {p.locationName && <div style={{ position: 'absolute', top: 6, left: 6, background: '#000000aa', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={12} color="#c9a84c" /></div>}
          </div>
        ))}
        {tab === 'saved' && !isMe && (
          <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#4a5075', fontSize: 13 }}>
            Conteudo salvo e privado.
          </div>
        )}
        {((tab === 'posts' && imagePosts.length === 0) || (tab === 'reels' && videoPosts.length === 0)) && (
          <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#4a5075', fontSize: 13 }}>
            Nenhuma publicacao ainda.
          </div>
        )}
      </div>

      {/* MODAL SEGUIDORES / SEGUINDO — ESTILO INSTAGRAM */}
      {socialModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => { setSocialModal(null); setSearchQuery(''); }}>
          <div style={{ background: '#0d0f1a', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 470, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            {/* Indicador de arrasto */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#2a2d45' }} />
            </div>

            {/* Tabs Seguidores / Seguindo */}
            <div style={{ display: 'flex', borderBottom: '0.5px solid #1e2235' }}>
              {(['followers', 'following'] as const).map(t => (
                <button key={t} onClick={() => { setSocialModal(t); setSearchQuery(''); }}
                  style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: `2px solid ${socialModal === t ? '#c0c5e0' : 'transparent'}`, color: socialModal === t ? '#c0c5e0' : '#4a5075', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  {t === 'followers' ? `Seguidores` : `Seguindo`}
                </button>
              ))}
            </div>

            {/* Barra de busca */}
            <div style={{ padding: '12px 16px 8px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#4a5075" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar..."
                  style={{ width: '100%', background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 10, padding: '10px 36px 10px 36px', color: '#c0c5e0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: '#2a2d45', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={11} color="#c0c5e0" />
                  </button>
                )}
              </div>
            </div>

            {/* Lista */}
            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 20 }}>
              {filteredList.length === 0 && (
                <p style={{ textAlign: 'center', color: '#4a5075', padding: 32, fontSize: 13 }}>
                  {searchQuery ? 'Nenhum resultado encontrado.' : 'Nenhum resultado.'}
                </p>
              )}
              {filteredList.map((u: any) => {
                const isCurrentUser = u.id === currentUser.id;
                const iFollow = followingMap[u.id] || false;
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
                    {/* Avatar clicavel */}
                    <div onClick={() => navigateToUser(u.id)}
                      style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: '#2a2d45', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#c9a84c', cursor: 'pointer' }}>
                      {u.avatar ? <img src={u.avatar} style={{ width: 48, height: 48, objectFit: 'cover' }} /> : u.name?.[0]}
                    </div>
                    {/* Info clicavel */}
                    <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={() => navigateToUser(u.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#c0c5e0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                        {u.isVerified && <CheckCircle size={12} color="#c9a84c" />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {u.belt && <span style={{ background: BELT_COLORS[u.belt] || '#333', color: u.belt === 'WHITE' ? '#000' : '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 500 }}>{BELT_LABELS[u.belt] || u.belt}</span>}
                        {u.academy && <span style={{ fontSize: 11, color: '#4a5075', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.academy}</span>}
                      </div>
                    </div>
                    {/* Botao seguir/seguindo */}
                    {!isCurrentUser && (
                      <button
                        onClick={() => toggleFollowInList(u.id)}
                        disabled={togglingFollow === u.id}
                        style={{
                          background: iFollow ? '#1a1d2e' : '#c9a84c',
                          border: `0.5px solid ${iFollow ? '#2a2d45' : '#c9a84c'}`,
                          borderRadius: 8,
                          padding: '6px 16px',
                          color: iFollow ? '#c0c5e0' : '#000',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          minWidth: 80,
                          opacity: togglingFollow === u.id ? 0.6 : 1,
                          flexShrink: 0
                        }}>
                        {iFollow ? 'Seguindo' : 'Seguir'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN MIDIA */}
      {fullscreen && (
        <div onClick={() => setFullscreen(null)} style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setFullscreen(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', zIndex: 10 }}>x</button>
          {fullscreen.type === 'image' && <img src={fullscreen.url} style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />}
          {fullscreen.type === 'video' && <video src={fullscreen.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '85vh' }} onClick={e => e.stopPropagation()} />}
          {fullscreen.content && <p style={{ color: '#c0c5e0', fontSize: 13, padding: '12px 20px 4px', textAlign: 'center', maxWidth: 470 }}>{fullscreen.content}</p>}
          {fullscreen.locationName && (
            <a onClick={e => e.stopPropagation()} href={fullscreen.locationLat != null ? `https://www.google.com/maps?q=${fullscreen.locationLat},${fullscreen.locationLng}` : undefined} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#c9a84c', textDecoration: 'none', padding: '4px 0 12px' }}>
              <MapPin size={13} /> {String(fullscreen.locationName).split(',').slice(0, 2).join(',')}
            </a>
          )}
        </div>
      )}

      {/* CHAT DIRETO */}
      {showChat && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#0d0f1a', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 470, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '0.5px solid #1e2235' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: '#2a2d45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#c9a84c' }}>
                  {profile?.avatar ? <img src={profile.avatar} style={{ width: 32, height: 32, objectFit: 'cover' }} /> : profile?.name?.[0]}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#c0c5e0' }}>{profile?.name}</span>
              </div>
              <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b83b0', fontSize: 20 }}>x</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chatMessages.length === 0 && <p style={{ textAlign: 'center', color: '#4a5075', fontSize: 13 }}>Nenhuma mensagem ainda. Diga ola!</p>}
              {chatMessages.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.senderId === currentUser.id ? 'flex-end' : 'flex-start' }}>
                  <div style={{ background: m.senderId === currentUser.id ? '#c9a84c' : '#1a1d2e', color: m.senderId === currentUser.id ? '#000' : '#c0c5e0', borderRadius: m.senderId === currentUser.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '8px 12px', fontSize: 13, maxWidth: '75%' }}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '10px 16px 16px', borderTop: '0.5px solid #1e2235' }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Mensagem..." style={{ flex: 1, background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 24, padding: '9px 14px', color: '#c0c5e0', fontSize: 13, outline: 'none' }} />
              <button onClick={sendMessage} disabled={sendingMsg || !chatInput.trim()}
                style={{ background: '#c9a84c', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: !chatInput.trim() ? 0.5 : 1 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#000"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <ProfileEditModal
          profile={profile}
          showToast={showToast}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setProfile(updated); fetchProfile(); }}
        />
      )}
    </div>
  );
}
