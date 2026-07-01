import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Search, ChevronLeft, MessageSquare, Heart, Send, Bookmark, MoreHorizontal, Pin, Lock, Trash2, Shield, Crown, CheckCircle, Globe, X, Camera, Edit2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import FeedInstagram from './FeedInstagram';
import { AvatarWithFrame } from './AvatarWithFrame';

const getToken = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
const authFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) } });

const CATEGORIES = ['Todos', 'Técnicas', 'Preparação Física', 'Histórias de Tatame', 'Competições', 'Memes', 'Equipamentos', 'Academias'];
const BELT_COLORS: Record<string, string> = { WHITE: '#fff', BLUE: '#1a5aad', PURPLE: '#6b21a8', BROWN: '#78350f', BLACK: '#111' };
const BELT_LABELS: Record<string, string> = { WHITE: 'Branca', BLUE: 'Azul', PURPLE: 'Roxa', BROWN: 'Marrom', BLACK: 'Preta' };

interface CommunityProps {
  user: UserProfile;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Community({ user, showToast }: CommunityProps) {
  const [mainTab, setMainTab] = useState<'feed' | 'communities'>('feed');
  const [view, setView] = useState<'list' | 'detail' | 'create' | 'topic'>('list');
  const [communities, setCommunities] = useState<any[]>([]);
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [innerTab, setInnerTab] = useState<'feed' | 'forum' | 'members'>('feed');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newReply, setNewReply] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [saving, setSaving] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNewTopic, setShowNewTopic] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '', description: '', rules: '', category: 'Técnicas', isPrivate: false, coverImage: '', avatar: ''
  });

  useEffect(() => { fetchCommunities(); }, [category, search]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'Todos') params.set('category', category);
      if (search) params.set('search', search);
      const [allRes, myRes] = await Promise.all([
        authFetch(`/api/communities?${params}`),
        authFetch('/api/communities?mine=true')
      ]);
      if (allRes.ok) setCommunities((await allRes.json()).communities || []);
      if (myRes.ok) setMyCommunities((await myRes.json()).communities || []);
    } catch (e) {}
    setLoading(false);
  };

  const openCommunity = async (comm: any) => {
    setSelected(comm);
    setView('detail');
    setInnerTab('feed');
    await Promise.all([fetchPosts(comm.id), fetchTopics(comm.id), fetchMembers(comm.id)]);
  };

  const fetchPosts = async (id: string) => {
    const res = await authFetch(`/api/communities/${id}/posts`);
    if (res.ok) setPosts((await res.json()).posts || []);
  };

  const fetchTopics = async (id: string) => {
    const res = await authFetch(`/api/communities/${id}/topics`);
    if (res.ok) setTopics((await res.json()).topics || []);
  };

  const fetchMembers = async (id: string) => {
    const res = await authFetch(`/api/communities/${id}/members`);
    if (res.ok) setMembers((await res.json()).members || []);
  };

  const openTopic = async (topic: any) => {
    setSelectedTopic(topic);
    setView('topic');
    const res = await authFetch(`/api/communities/${selected.id}/topics/${topic.id}/replies`);
    if (res.ok) {
      const data = await res.json();
      setSelectedTopic(data.topic);
      setReplies(data.replies || []);
    }
  };

  const handleJoin = async (commId: string) => {
    const res = await authFetch(`/api/communities/${commId}/join`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      showToast(data.action === 'joined' ? 'Você entrou na comunidade!' : 'Você saiu da comunidade.', 'success');
      fetchCommunities();
      if (selected?.id === commId) {
        const updated = await authFetch(`/api/communities/${commId}`);
        if (updated.ok) setSelected((await updated.json()).community);
      }
    }
  };

  const handleLike = async (postId: string) => {
    await authFetch(`/api/social/posts/${postId}/like`, { method: 'POST' });
    if (selected) fetchPosts(selected.id);
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    await authFetch(`/api/social/posts/${postId}/comment`, { method: 'POST', body: JSON.stringify({ content }) });
    setCommentInputs(p => ({ ...p, [postId]: '' }));
    if (selected) fetchPosts(selected.id);
    loadComments(postId);
  };

  const loadComments = async (postId: string) => {
    const res = await authFetch(`/api/social/posts/${postId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setPostComments(p => ({ ...p, [postId]: data.comments || [] }));
    }
    setShowComments(p => ({ ...p, [postId]: true }));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selected) return;
    setSaving(true);
    const res = await authFetch(`/api/communities/${selected.id}/posts`, {
      method: 'POST',
      body: JSON.stringify({ content: newPostContent, imageUrl: newPostImage || null, category: 'Geral' })
    });
    if (res.ok) {
      showToast('Post publicado!', 'success');
      setNewPostContent('');
      setNewPostImage('');
      setShowCreatePost(false);
      fetchPosts(selected.id);
    } else {
      const d = await res.json();
      showToast(d.error || 'Erro ao publicar', 'error');
    }
    setSaving(false);
  };

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !selected) return;
    setSaving(true);
    const res = await authFetch(`/api/communities/${selected.id}/topics`, {
      method: 'POST',
      body: JSON.stringify({ title: newTopicTitle, content: newTopicContent })
    });
    if (res.ok) {
      showToast('Tópico criado!', 'success');
      setNewTopicTitle('');
      setNewTopicContent('');
      setShowNewTopic(false);
      fetchTopics(selected.id);
    } else {
      const d = await res.json();
      showToast(d.error || 'Erro ao criar tópico', 'error');
    }
    setSaving(false);
  };

  const handleReply = async () => {
    if (!newReply.trim() || !selectedTopic || !selected) return;
    setSaving(true);
    const res = await authFetch(`/api/communities/${selected.id}/topics/${selectedTopic.id}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content: newReply })
    });
    if (res.ok) {
      showToast('Resposta enviada!', 'success');
      setNewReply('');
      openTopic(selectedTopic);
    }
    setSaving(false);
  };

  const handleCreateCommunity = async () => {
    if (!createForm.name || !createForm.category) { showToast('Nome e categoria são obrigatórios.', 'error'); return; }
    setSaving(true);
    const res = await authFetch('/api/communities', { method: 'POST', body: JSON.stringify(createForm) });
    if (res.ok) {
      showToast('Comunidade criada!', 'success');
      setView('list');
      setCreateForm({ name: '', description: '', rules: '', category: 'Técnicas', isPrivate: false, coverImage: '', avatar: '' });
      fetchCommunities();
    } else {
      const d = await res.json();
      showToast(d.error || 'Erro ao criar comunidade', 'error');
    }
    setSaving(false);
  };

  const handlePinTopic = async (topicId: string, isPinned: boolean) => {
    await authFetch(`/api/communities/${selected.id}/topics/${topicId}`, { method: 'PATCH', body: JSON.stringify({ isPinned: !isPinned, isLocked: false }) });
    fetchTopics(selected.id);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Excluir este post?')) return;
    await authFetch(`/api/communities/${selected.id}/posts/${postId}`, { method: 'DELETE' });
    fetchPosts(selected.id);
  };

  const myRole = selected ? (members.find(m => m.userId === user.id)?.role || null) : null;
  const canModerate = myRole === 'owner' || myRole === 'moderator' || user.role === 'ADMIN';
  const isMember = !!members.find(m => m.userId === user.id && !m.isBanned);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
    if (d > 0) return `${d}d`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  };

  return (
    <div className="min-h-screen" style={{ background: '#080a12', color: '#c0c5e0', fontFamily: 'var(--font-sans)' }}>

      {/* ABAS PRINCIPAIS */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid #1e2235', background: '#0d0f1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setMainTab('feed')}
          style={{ flex: 1, padding: '12px 0', textAlign: 'center', fontSize: 13, color: mainTab === 'feed' ? '#c9a84c' : '#4a5075', background: 'none', border: 'none', borderBottom: `2px solid ${mainTab === 'feed' ? '#c9a84c' : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit', fontWeight: mainTab === 'feed' ? 500 : 400 }}>
          Feed Geral
        </button>
        <button onClick={() => { setMainTab('communities'); setView('list'); }}
          style={{ flex: 1, padding: '12px 0', textAlign: 'center', fontSize: 13, color: mainTab === 'communities' ? '#c9a84c' : '#4a5075', background: 'none', border: 'none', borderBottom: `2px solid ${mainTab === 'communities' ? '#c9a84c' : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit', fontWeight: mainTab === 'communities' ? 500 : 400 }}>
          Comunidades
        </button>
      </div>

      {/* ABA: FEED GERAL */}
      {mainTab === 'feed' && (
        <FeedInstagram user={user} showToast={showToast} />
      )}

      {/* ABA: COMUNIDADES */}
      {mainTab === 'communities' && (
      <div>

      {/* TELA: LISTA DE COMUNIDADES */}
      {view === 'list' && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: '#c9a84c', fontSize: 20, fontWeight: 500 }}>Comunidades</h2>
            <button onClick={() => setView('create')} style={{ background: '#c9a84c', color: '#000', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Plus size={14} /> Criar
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a5075' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar comunidades..."
              style={{ width: '100%', background: '#1a1d2e', border: '0.5px solid #1e2235', borderRadius: 10, padding: '8px 8px 8px 32px', color: '#c0c5e0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ flexShrink: 0, background: category === cat ? '#c9a84c22' : '#1a1d2e', border: `0.5px solid ${category === cat ? '#c9a84c' : '#2a2d45'}`, borderRadius: 20, padding: '4px 12px', fontSize: 11, color: category === cat ? '#c9a84c' : '#7b83b0', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {cat}
              </button>
            ))}
          </div>

          {myCommunities.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Suas comunidades</p>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {myCommunities.map((c: any) => (
                  <button key={c.id} onClick={() => openCommunity(c)}
                    style={{ flexShrink: 0, background: '#1a1d2e', border: '0.5px solid #1e2235', borderRadius: 10, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000', fontWeight: 500, flexShrink: 0 }}>
                      {c.avatar ? <img src={c.avatar} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} /> : c.name[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 11, color: '#c0c5e0', whiteSpace: 'nowrap' }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Descobrir</p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#4a5075', fontSize: 13 }}>Carregando...</div>
          ) : communities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Users size={40} style={{ color: '#2a2d45', margin: '0 auto 8px', display: 'block' }} />
              <p style={{ color: '#4a5075', fontSize: 13 }}>Nenhuma comunidade encontrada.</p>
              <button onClick={() => setView('create')} style={{ marginTop: 12, background: '#c9a84c', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Criar a primeira</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {communities.map((c: any) => (
                <div key={c.id} style={{ background: '#1a1d2e', border: '0.5px solid #1e2235', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }} onClick={() => openCommunity(c)}>
                  {c.coverImage && <img src={c.coverImage} style={{ width: '100%', height: 80, objectFit: 'cover' }} />}
                  {!c.coverImage && <div style={{ height: 60, background: 'linear-gradient(135deg, #1a1d2e, #0d1033)' }} />}
                  <div style={{ padding: '8px 12px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: c.coverImage ? 0 : -20 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#c9a84c', border: '2px solid #0d0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#000', fontWeight: 500, flexShrink: 0 }}>
                        {c.avatar ? <img src={c.avatar} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} /> : c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <p style={{ fontSize: 13, color: '#c0c5e0', fontWeight: 500, margin: 0 }}>{c.name}</p>
                          {c.isPrivate && <Lock size={10} style={{ color: '#7b83b0' }} />}
                        </div>
                        <p style={{ fontSize: 10, color: '#4a5075', margin: 0 }}>{c.category} · {Number(c.memberCount||0).toLocaleString()} membros · {Number(c.weeklyPosts||0)} posts esta semana</p>
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleJoin(c.id); }}
                      style={{ background: c.isMember ? '#1a1d2e' : 'transparent', border: `0.5px solid ${c.isMember ? '#2a2d45' : '#c9a84c'}`, color: c.isMember ? '#7b83b0' : '#c9a84c', borderRadius: 8, padding: '5px 12px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                      {c.isMember ? 'Membro' : 'Entrar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TELA: CRIAR COMUNIDADE */}
      {view === 'create' && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b83b0' }}><ChevronLeft size={20} /></button>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#c0c5e0' }}>Criar comunidade</span>
            </div>
            <button onClick={handleCreateCommunity} disabled={saving}
              style={{ background: '#c9a84c', color: '#000', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Criando...' : 'Criar'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#1a1d2e', borderRadius: 10, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #2a2d45', position: 'relative' }}>
              <div style={{ textAlign: 'center' }}>
                <Camera size={20} style={{ color: '#4a5075', margin: '0 auto 4px', display: 'block' }} />
                <span style={{ fontSize: 11, color: '#4a5075' }}>Banner da comunidade</span>
              </div>
            </div>

            {[
              { label: 'Nome da comunidade *', key: 'name', placeholder: 'Ex: Leg Lock Nação BR' },
              { label: 'Descrição', key: 'description', placeholder: 'Fale sobre sua comunidade...' },
              { label: 'Regras', key: 'rules', placeholder: 'Regras da comunidade...' },
            ].map(field => (
              <div key={field.key}>
                <p style={{ fontSize: 10, color: '#7b83b0', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</p>
                <textarea value={(createForm as any)[field.key]} onChange={e => setCreateForm(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder} rows={field.key === 'name' ? 1 : 2}
                  style={{ width: '100%', background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '8px 12px', color: '#c0c5e0', fontSize: 12, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            ))}

            <div>
              <p style={{ fontSize: 10, color: '#7b83b0', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoria *</p>
              <select value={createForm.category} onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))}
                style={{ width: '100%', background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '8px 12px', color: '#c0c5e0', fontSize: 12, outline: 'none' }}>
                {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <p style={{ fontSize: 10, color: '#7b83b0', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Privacidade</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ val: false, icon: <Globe size={16} />, label: 'Pública' }, { val: true, icon: <Lock size={16} />, label: 'Privada' }].map(opt => (
                  <button key={String(opt.val)} onClick={() => setCreateForm(p => ({ ...p, isPrivate: opt.val }))}
                    style={{ flex: 1, background: createForm.isPrivate === opt.val ? '#c9a84c22' : '#1a1d2e', border: `0.5px solid ${createForm.isPrivate === opt.val ? '#c9a84c' : '#2a2d45'}`, borderRadius: 8, padding: 10, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: createForm.isPrivate === opt.val ? '#c9a84c' : '#4a5075' }}>{opt.icon}</span>
                    <span style={{ fontSize: 11, color: createForm.isPrivate === opt.val ? '#c9a84c' : '#4a5075' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#1a1d2e', border: '0.5px solid #c9a84c44', borderRadius: 10, padding: 10, display: 'flex', gap: 8 }}>
              <AlertCircle size={14} style={{ color: '#c9a84c', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 11, color: '#c9a84c88', margin: 0 }}>Você pode criar apenas 1 comunidade. Para criar uma nova, delete a atual.</p>
            </div>
          </div>
        </div>
      )}

      {/* TELA: DETALHE DA COMUNIDADE */}
      {view === 'detail' && selected && (
        <div className="max-w-2xl mx-auto">
          <div style={{ position: 'relative' }}>
            <div style={{ height: 100, background: selected.coverImage ? `url(${selected.coverImage}) center/cover` : 'linear-gradient(135deg, #1a1030, #0d1033)' }} />
            <button onClick={() => setView('list')} style={{ position: 'absolute', top: 10, left: 10, background: '#0008', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              <ChevronLeft size={18} />
            </button>
          </div>

          <div style={{ padding: '0 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -24, marginBottom: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#c9a84c', border: '2px solid #0d0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#000', fontWeight: 500, flexShrink: 0 }}>
                {selected.avatar ? <img src={selected.avatar} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} /> : selected.name[0].toUpperCase()}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {canModerate && (
                  <button style={{ background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '5px 10px', color: '#7b83b0', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Edit2 size={12} /> Editar
                  </button>
                )}
                <button onClick={() => handleJoin(selected.id)}
                  style={{ background: isMember ? '#1a1d2e' : '#c9a84c', color: isMember ? '#7b83b0' : '#000', border: `0.5px solid ${isMember ? '#2a2d45' : '#c9a84c'}`, borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                  {isMember ? 'Membro' : 'Entrar'}
                </button>
              </div>
            </div>

            <p style={{ fontSize: 15, color: '#c0c5e0', fontWeight: 500, margin: '0 0 2px' }}>{selected.name}</p>
            <p style={{ fontSize: 11, color: '#4a5075', margin: '0 0 4px' }}>
              {selected.category} · {Number(selected.memberCount||0).toLocaleString()} membros · {Number(selected.weeklyPosts||0)} posts esta semana
            </p>
            {selected.description && <p style={{ fontSize: 12, color: '#7b83b0', margin: '4px 0 0' }}>{selected.description}</p>}
          </div>

          <div style={{ display: 'flex', borderBottom: '0.5px solid #1e2235', marginTop: 12 }}>
            {[{ id: 'feed', label: 'Feed' }, { id: 'forum', label: 'Fórum' }, { id: 'members', label: 'Membros' }].map(t => (
              <button key={t.id} onClick={() => setInnerTab(t.id as any)}
                style={{ flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 12, color: innerTab === t.id ? '#c9a84c' : '#4a5075', background: 'none', border: 'none', borderBottom: `2px solid ${innerTab === t.id ? '#c9a84c' : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '12px 16px' }}>

            {/* FEED */}
            {innerTab === 'feed' && (
              <div>
                {isMember && (
                  <div style={{ marginBottom: 12 }}>
                    {!showCreatePost ? (
                      <button onClick={() => setShowCreatePost(true)}
                        style={{ width: '100%', background: '#1a1d2e', border: '0.5px solid #1e2235', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a2d45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#c9a84c', flexShrink: 0 }}>
                          {user.name[0]}
                        </div>
                        <span style={{ fontSize: 12, color: '#4a5075' }}>Compartilhe algo na comunidade...</span>
                      </button>
                    ) : (
                      <div style={{ background: '#1a1d2e', border: '0.5px solid #1e2235', borderRadius: 12, padding: 12 }}>
                        <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="O que você quer compartilhar?" rows={3}
                          style={{ width: '100%', background: 'transparent', border: 'none', color: '#c0c5e0', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        <input value={newPostImage} onChange={e => setNewPostImage(e.target.value)} placeholder="URL da imagem (opcional)"
                          style={{ width: '100%', background: '#12152a', border: '0.5px solid #2a2d45', borderRadius: 6, padding: '6px 10px', color: '#c0c5e0', fontSize: 11, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => setShowCreatePost(false)} style={{ background: 'none', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '6px 12px', color: '#7b83b0', fontSize: 11, cursor: 'pointer' }}>Cancelar</button>
                          <button onClick={handleCreatePost} disabled={saving} style={{ background: '#c9a84c', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#000', fontSize: 11, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                            {saving ? 'Publicando...' : 'Publicar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {posts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#4a5075', fontSize: 13 }}>Nenhum post ainda. Seja o primeiro!</div>
                ) : posts.map((post: any) => (
                  <div key={post.id} style={{ background: '#0d0f1a', borderRadius: 12, marginBottom: 12, overflow: 'hidden', border: '0.5px solid #1e2235' }}>
                    <div style={{ padding: '10px 12px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a2d45', overflow: 'hidden', flexShrink: 0 }}>
                          {post.authorAvatar ? <img src={post.authorAvatar} style={{ width: 32, height: 32, objectFit: 'cover' }} /> : <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#c9a84c', fontWeight: 500 }}>{post.authorName?.[0]}</div>}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 12, color: '#c0c5e0', fontWeight: 500 }}>{post.authorName}</span>
                            {post.authorBelt && <span style={{ background: BELT_COLORS[post.authorBelt] || '#333', color: post.authorBelt === 'WHITE' ? '#000' : '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 500 }}>{BELT_LABELS[post.authorBelt] || post.authorBelt}</span>}
                            {post.authorVerified && <CheckCircle size={11} style={{ color: '#c9a84c' }} />}
                          </div>
                          <span style={{ fontSize: 10, color: '#4a5075' }}>{timeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                      {(post.authorId === user.id || canModerate) && (
                        <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5075' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {post.imageUrl && <img src={post.imageUrl} style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />}

                    <div style={{ padding: '8px 12px' }}>
                      <p style={{ fontSize: 13, color: '#c0c5e0', margin: '0 0 8px', lineHeight: 1.5 }}>{post.content}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 14 }}>
                          <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: post.isLiked ? '#e74c3c' : '#7b83b0', fontSize: 11 }}>
                            <Heart size={17} fill={post.isLiked ? '#e74c3c' : 'none'} /> {Number(post.likesCount||0)}
                          </button>
                          <button onClick={() => { setShowComments(p => ({ ...p, [post.id]: !p[post.id] })); if (!postComments[post.id]) loadComments(post.id); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#7b83b0', fontSize: 11 }}>
                            <MessageSquare size={17} /> {Number(post.commentsCount||0)}
                          </button>
                        </div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b83b0' }}><Bookmark size={17} /></button>
                      </div>

                      {showComments[post.id] && (
                        <div style={{ borderTop: '0.5px solid #1e2235', paddingTop: 8 }}>
                          {(postComments[post.id] || []).map((c: any) => (
                            <div key={c.id} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2a2d45', flexShrink: 0, overflow: 'hidden' }}>
                                {c.authorAvatar ? <img src={c.authorAvatar} style={{ width: 24, height: 24, objectFit: 'cover' }} /> : <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#c9a84c' }}>{c.authorName?.[0]}</div>}
                              </div>
                              <div style={{ background: '#1a1d2e', borderRadius: 8, padding: '5px 8px', flex: 1 }}>
                                <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>{c.authorName} </span>
                                <span style={{ fontSize: 11, color: '#c0c5e0' }}>{c.content}</span>
                              </div>
                            </div>
                          ))}
                          {isMember && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2a2d45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#c9a84c', flexShrink: 0 }}>{user.name[0]}</div>
                              <input value={commentInputs[post.id] || ''} onChange={e => setCommentInputs(p => ({ ...p, [post.id]: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                                placeholder="Comentar..." style={{ flex: 1, background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 20, padding: '5px 12px', color: '#c0c5e0', fontSize: 12, outline: 'none' }} />
                              <button onClick={() => handleComment(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a84c' }}><Send size={16} /></button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FÓRUM */}
            {innerTab === 'forum' && (
              <div>
                {isMember && (
                  <div style={{ marginBottom: 12 }}>
                    {!showNewTopic ? (
                      <button onClick={() => setShowNewTopic(true)}
                        style={{ width: '100%', background: '#c9a84c', border: 'none', borderRadius: 10, padding: '10px', color: '#000', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Plus size={14} /> Novo tópico
                      </button>
                    ) : (
                      <div style={{ background: '#1a1d2e', border: '0.5px solid #1e2235', borderRadius: 12, padding: 12 }}>
                        <input value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} placeholder="Título do tópico *"
                          style={{ width: '100%', background: '#12152a', border: '0.5px solid #2a2d45', borderRadius: 6, padding: '7px 10px', color: '#c0c5e0', fontSize: 12, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
                        <textarea value={newTopicContent} onChange={e => setNewTopicContent(e.target.value)} placeholder="Conteúdo *" rows={3}
                          style={{ width: '100%', background: '#12152a', border: '0.5px solid #2a2d45', borderRadius: 6, padding: '7px 10px', color: '#c0c5e0', fontSize: 12, outline: 'none', resize: 'none', fontFamily: 'inherit', marginBottom: 8, boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => setShowNewTopic(false)} style={{ background: 'none', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '6px 12px', color: '#7b83b0', fontSize: 11, cursor: 'pointer' }}>Cancelar</button>
                          <button onClick={handleCreateTopic} disabled={saving} style={{ background: '#c9a84c', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#000', fontSize: 11, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                            {saving ? 'Criando...' : 'Criar tópico'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {topics.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#4a5075', fontSize: 13 }}>Nenhum tópico ainda. Inicie a discussão!</div>
                ) : topics.map((t: any) => (
                  <div key={t.id} onClick={() => openTopic(t)}
                    style={{ background: '#1a1d2e', border: `0.5px solid ${t.isPinned ? '#c9a84c44' : '#1e2235'}`, borderRadius: 10, padding: '10px 12px', marginBottom: 8, cursor: 'pointer' }}>
                    {t.isPinned && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <Pin size={10} style={{ color: '#c9a84c' }} />
                        <span style={{ fontSize: 9, color: '#c9a84c', fontWeight: 500, textTransform: 'uppercase' }}>Fixado</span>
                      </div>
                    )}
                    <p style={{ fontSize: 13, color: '#c0c5e0', fontWeight: 500, margin: '0 0 4px' }}>{t.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 10, color: '#4a5075', margin: 0 }}>por {t.authorName} · {timeAgo(t.createdAt)}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#7b83b0', fontSize: 10 }}>
                        <MessageSquare size={11} /> {t.replyCount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MEMBROS */}
            {innerTab === 'members' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {members.map((m: any) => (
                  <div key={m.id} style={{ background: '#1a1d2e', border: '0.5px solid #1e2235', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2d45', overflow: 'hidden', flexShrink: 0 }}>
                      {m.avatar ? <img src={m.avatar} style={{ width: 36, height: 36, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#c9a84c', fontWeight: 500 }}>{m.name?.[0]}</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 12, color: '#c0c5e0', fontWeight: 500 }}>{m.name}</span>
                        {m.belt && <span style={{ background: BELT_COLORS[m.belt] || '#333', color: m.belt === 'WHITE' ? '#000' : '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 3 }}>{BELT_LABELS[m.belt] || m.belt}</span>}
                        {m.isVerified && <CheckCircle size={11} style={{ color: '#c9a84c' }} />}
                      </div>
                      <span style={{ fontSize: 10, color: '#4a5075' }}>{m.academy || ''}</span>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {m.role === 'owner' && <Crown size={14} style={{ color: '#c9a84c' }} />}
                      {m.role === 'moderator' && <Shield size={14} style={{ color: '#7b83b0' }} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TELA: TÓPICO */}
      {view === 'topic' && selectedTopic && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <button onClick={() => setView('detail')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b83b0' }}><ChevronLeft size={20} /></button>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#c0c5e0', flex: 1 }}>Tópico</span>
            {canModerate && (
              <button onClick={() => handlePinTopic(selectedTopic.id, selectedTopic.isPinned)}
                style={{ background: selectedTopic.isPinned ? '#c9a84c22' : '#1a1d2e', border: `0.5px solid ${selectedTopic.isPinned ? '#c9a84c' : '#2a2d45'}`, borderRadius: 8, padding: '4px 10px', color: selectedTopic.isPinned ? '#c9a84c' : '#7b83b0', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Pin size={11} /> {selectedTopic.isPinned ? 'Desafixar' : 'Fixar'}
              </button>
            )}
          </div>

          <div style={{ background: '#1a1d2e', border: '0.5px solid #1e2235', borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <p style={{ fontSize: 15, color: '#c0c5e0', fontWeight: 500, margin: '0 0 8px' }}>{selectedTopic.title}</p>
            <p style={{ fontSize: 13, color: '#c0c5e0', margin: '0 0 10px', lineHeight: 1.6 }}>{selectedTopic.content}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2a2d45', overflow: 'hidden', flexShrink: 0 }}>
                {selectedTopic.authorAvatar ? <img src={selectedTopic.authorAvatar} style={{ width: 24, height: 24, objectFit: 'cover' }} /> : <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#c9a84c' }}>{selectedTopic.authorName?.[0]}</div>}
              </div>
              <span style={{ fontSize: 11, color: '#4a5075' }}>{selectedTopic.authorName} · {timeAgo(selectedTopic.createdAt)} · {selectedTopic.viewCount} visualizações</span>
            </div>
          </div>

          <p style={{ fontSize: 11, color: '#4a5075', margin: '0 0 10px' }}>{replies.length} resposta{replies.length !== 1 ? 's' : ''}</p>

          {replies.map((r: any) => (
            <div key={r.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a2d45', overflow: 'hidden', flexShrink: 0 }}>
                {r.authorAvatar ? <img src={r.authorAvatar} style={{ width: 32, height: 32, objectFit: 'cover' }} /> : <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#c9a84c', fontWeight: 500 }}>{r.authorName?.[0]}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ background: '#1a1d2e', border: '0.5px solid #1e2235', borderRadius: 10, padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#c9a84c', fontWeight: 500 }}>{r.authorName}</span>
                    {r.authorBelt && <span style={{ background: BELT_COLORS[r.authorBelt] || '#333', color: r.authorBelt === 'WHITE' ? '#000' : '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 3 }}>{BELT_LABELS[r.authorBelt] || r.authorBelt}</span>}
                    {r.authorVerified && <CheckCircle size={10} style={{ color: '#c9a84c' }} />}
                  </div>
                  <p style={{ fontSize: 12, color: '#c0c5e0', margin: 0, lineHeight: 1.5 }}>{r.content}</p>
                </div>
                <span style={{ fontSize: 10, color: '#4a5075', marginLeft: 8 }}>{timeAgo(r.createdAt)}</span>
              </div>
            </div>
          ))}

          {isMember && !selectedTopic.isLocked && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a2d45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#c9a84c', flexShrink: 0 }}>{user.name[0]}</div>
              <div style={{ flex: 1, background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 10, padding: '8px 12px' }}>
                <textarea value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Escreva sua resposta..." rows={2}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#c0c5e0', fontSize: 12, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleReply} disabled={saving}
                    style={{ background: '#c9a84c', border: 'none', borderRadius: 8, padding: '5px 14px', color: '#000', fontSize: 11, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                    {saving ? 'Enviando...' : 'Responder'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTopic.isLocked && (
            <div style={{ textAlign: 'center', padding: '12px', color: '#4a5075', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Lock size={12} /> Tópico bloqueado
            </div>
          )}
        </div>
      )}
    </div>
      )}
    </div>
  );
}
