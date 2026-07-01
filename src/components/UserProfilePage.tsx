import React, { useState, useEffect } from 'react';
import { ChevronLeft, Grid, Film, Bookmark, UserCheck, UserPlus, MoreHorizontal, CheckCircle } from 'lucide-react';
import { UserProfile } from '../types';

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

export default function UserProfilePage({ userId, currentUser, showToast, onBack }: Props) {
  const [profile, setProfile] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [tab, setTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [fullscreen, setFullscreen] = useState<{type: string, url: string, content?: string} | null>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [following, setFollowing] = useState<boolean>(false);

  useEffect(() => { fetchProfile(); }, [userId]);

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

  const openFollowers = async () => {
    const res = await authFetch(`/api/social/users/${userId}/followers`);
    if (res.ok) {
      const d = await res.json();
      setFollowersList(d.followers || []);
    }
    setShowFollowers(true);
    setShowFollowing(false);
  };

  const openFollowing = async () => {
    const res = await authFetch(`/api/social/users/${userId}/following`);
    if (res.ok) {
      const d = await res.json();
      setFollowingList(d.following || []);
    }
    setShowFollowing(true);
    setShowFollowers(false);
  };

  const imagePosts = posts.filter(p => p.imageUrl);
  const videoPosts = posts.filter(p => p.videoUrl && !p.imageUrl);

  if (loading) return (
    <div style={{ background: '#080a12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5075' }}>
      Carregando perfil...
    </div>
  );

  if (!profile) return (
    <div style={{ background: '#080a12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#4a5075' }}>
      <p>Perfil não encontrado.</p>
      <button onClick={onBack} style={{ background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '8px 16px', color: '#c0c5e0', cursor: 'pointer', fontSize: 13 }}>Voltar</button>
    </div>
  );

  const isMe = userId === currentUser.id;

  return (
    <div style={{ background: '#080a12', minHeight: '100vh', color: '#c0c5e0', fontFamily: 'var(--font-sans)', maxWidth: 470, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid #1e2235', position: 'sticky', top: 0, background: '#080a12', zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0c5e0', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={24} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#c0c5e0' }}>{profile.username || profile.name}</span>
        <MoreHorizontal size={22} color="#c0c5e0" style={{ cursor: 'pointer' }} />
      </div>

      {/* Info do perfil */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
          {/* Avatar */}
          <div style={{ width: 86, height: 86, borderRadius: '50%', overflow: 'hidden', background: '#2a2d45', border: '2px solid #c9a84c44', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#c9a84c', fontWeight: 500 }}>
            {profile.avatar ? <img src={profile.avatar} style={{ width: 86, height: 86, objectFit: 'cover' }} /> : profile.name?.[0]}
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, flex: 1, justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#c0c5e0', margin: '0 0 2px' }}>{posts.length}</p>
              <p style={{ fontSize: 11, color: '#7b83b0', margin: 0 }}>Publicações</p>
            </div>
            <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={openFollowers}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#c0c5e0', margin: '0 0 2px' }}>{profile.followersCount || 0}</p>
              <p style={{ fontSize: 11, color: '#7b83b0', margin: 0 }}>Seguidores</p>
            </div>
            <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={openFollowing}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#c0c5e0', margin: '0 0 2px' }}>{profile.followingCount || 0}</p>
              <p style={{ fontSize: 11, color: '#7b83b0', margin: 0 }}>Seguindo</p>
            </div>
          </div>
        </div>

        {/* Nome + faixa + bio */}
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
        </div>

        {/* Botões */}
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
          <div key={p.id} onClick={() => setFullscreen({ type: 'image', url: p.imageUrl, content: p.content })}
            style={{ aspectRatio: '1', overflow: 'hidden', background: '#1a1d2e', cursor: 'pointer' }}>
            <img src={p.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
        {tab === 'reels' && videoPosts.map(p => (
          <div key={p.id} onClick={() => setFullscreen({ type: 'video', url: p.videoUrl, content: p.content })}
            style={{ aspectRatio: '1', overflow: 'hidden', background: '#1a1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
            <video src={p.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Film size={20} color="#fff" style={{ position: 'absolute', top: 6, right: 6 }} />
          </div>
        ))}
        {tab === 'saved' && !isMe && (
          <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#4a5075', fontSize: 13 }}>
            Conteúdo salvo é privado.
          </div>
        )}
        {((tab === 'posts' && imagePosts.length === 0) || (tab === 'reels' && videoPosts.length === 0)) && (
          <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#4a5075', fontSize: 13 }}>
            Nenhuma publicação ainda.
          </div>
        )}
      </div>
    {/* LISTA SEGUIDORES */}
    {(showFollowers || showFollowing) && (
      <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{ background: '#0d0f1a', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 470, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '0.5px solid #1e2235' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#c0c5e0' }}>{showFollowers ? 'Seguidores' : 'Seguindo'}</span>
            <button onClick={() => { setShowFollowers(false); setShowFollowing(false); }} style={{ background: 'none', border: 'none', color: '#7b83b0', fontSize: 22, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {(showFollowers ? followersList : followingList).length === 0 && (
              <p style={{ textAlign: 'center', color: '#4a5075', padding: 24, fontSize: 13 }}>Nenhum resultado.</p>
            )}
            {(showFollowers ? followersList : followingList).map((u: any) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '0.5px solid #1a1d2e' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#2a2d45', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#c9a84c' }}>
                  {u.avatar ? <img src={u.avatar} style={{ width: 44, height: 44, objectFit: 'cover' }} /> : u.name?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#c0c5e0', margin: 0 }}>{u.name}</p>
                  {u.belt && <span style={{ background: BELT_COLORS[u.belt] || '#333', color: u.belt === 'WHITE' ? '#000' : '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 3 }}>{BELT_LABELS[u.belt] || u.belt}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* FULLSCREEN MIDIA */}
    {fullscreen && (
      <div onClick={() => setFullscreen(null)} style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => setFullscreen(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', zIndex: 10 }}>×</button>
        {fullscreen.type === 'image' && <img src={fullscreen.url} style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />}
        {fullscreen.type === 'video' && <video src={fullscreen.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '85vh' }} onClick={e => e.stopPropagation()} />}
        {fullscreen.content && <p style={{ color: '#c0c5e0', fontSize: 13, padding: '12px 20px', textAlign: 'center', maxWidth: 470 }}>{fullscreen.content}</p>}
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
            <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b83b0', fontSize: 20 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chatMessages.length === 0 && <p style={{ textAlign: 'center', color: '#4a5075', fontSize: 13 }}>Nenhuma mensagem ainda. Diga olá!</p>}
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
    </div>
  );
}
