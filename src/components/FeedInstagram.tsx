import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, X, Globe, Users, Lock, Dumbbell, CheckCircle, Trash2, Edit2, Image as ImageIcon, Smile, AtSign, MapPin } from 'lucide-react';
import { UserProfile } from '../types';
import UserProfilePage from './UserProfilePage';
import LocationPicker, { LocationValue } from './LocationPicker';
import { STORY_FILTERS, filterCss } from './storyFilters';
import { MentionSearchModal, MentionEditor, MentionViewer, Mention } from './StoryMentions';
import { StoryMusicPicker, StoryAudioPlayer, MusicChip, SelectedMusic } from './StoryMusicPicker';

const getToken = () => localStorage.getItem('jiuspeak_access_token') || localStorage.getItem('token');
const authFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) } });

const BELT_COLORS: Record<string, string> = { WHITE: '#e5e7eb', BLUE: '#1a5aad', PURPLE: '#6b21a8', BROWN: '#78350f', BLACK: '#111' };
const BELT_LABELS: Record<string, string> = { WHITE: 'Branca', BLUE: 'Azul', PURPLE: 'Roxa', BROWN: 'Marrom', BLACK: 'Preta' };

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000), m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d`;
  if (h > 0) return `${h}h`;
  return `${m < 1 ? 1 : m}min`;
};

interface Props { user: UserProfile; showToast: (msg: string, type?: string) => void; }

export default function FeedInstagram({ user, showToast }: Props) {
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, any[]>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [storyView, setStoryView] = useState<any | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyMedia, setStoryMedia] = useState<string | null>(null);
  const [storyMediaType, setStoryMediaType] = useState<'image' | 'video'>('image');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [storyTextColor, setStoryTextColor] = useState('#ffffff');
  const [showStoryEmoji, setShowStoryEmoji] = useState(false);
  const storyFileRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLInputElement>(null);
  const STORY_TEXT_COLORS = ['#ffffff', '#c9a84c', '#e74c3c', '#1a5aad', '#22c55e', '#111111'];
  const STORY_EMOJIS = ['🥋','🔥','💪','🏆','😤','👊','🤙','⚔️','🙏','🎯','🥇','🐍','🦵','🫡','😅','💥'];
  const [newPost, setNewPost] = useState({ content: '', imageUrl: '', videoUrl: '', privacy: 'public', category: 'Treinos' });
  const [postLocation, setPostLocation] = useState<LocationValue | null>(null);
  const [storyLocation, setStoryLocation] = useState<LocationValue | null>(null);
  const [storyFilter, setStoryFilter] = useState('normal');
  const [storyMentions, setStoryMentions] = useState<Mention[]>([]);
  const [showMentionSearch, setShowMentionSearch] = useState(false);
  const [storyMusic, setStoryMusic] = useState<SelectedMusic | null>(null);
  const [storyMusicStart, setStoryMusicStart] = useState(0);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [confirmDeleteStory, setConfirmDeleteStory] = useState(false);
  const [diary, setDiary] = useState({ positions: '', fatigue: 3, duration: 60, notes: '' });
  const [saving, setSaving] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openProfile = (userId: string) => {
    if (userId === user.id) return;
    setViewingUserId(userId);
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [pr, sr] = await Promise.all([authFetch('/api/social/posts?limit=20'), authFetch('/api/social/stories')]);
    if (pr.ok) {
      const d = await pr.json();
      const rawPosts = d.posts || [];
      const mapped = rawPosts.map((p: any) => ({
        ...p,
        authorName: p.author?.name || p.authorName,
        authorAvatar: p.author?.avatar || p.authorAvatar,
        authorBelt: p.author?.belt || p.authorBelt,
        authorAcademy: p.author?.branch?.name || p.author?.independentAcademy?.name || p.authorAcademy,
        authorVerified: p.author?.isVerified || p.authorVerified,
        authorId: p.author?.id || p.authorId,
        isLiked: Array.isArray(p.likes) ? p.likes.some((l: any) => l.userId === user.id) : (p.hasUpvoted ?? !!p.isLiked),
        isFollowing: !!p.isFollowing,
        isSaved: Array.isArray(p.savedBy) ? p.savedBy.some((s: any) => s.userId === user.id) : (p.hasSaved ?? !!p.isSaved),
        upvotesCount: Array.isArray(p.likes) ? p.likes.length : (p.upvotes ?? p.upvotesCount ?? 0),
        commentsCount: Array.isArray(p.comments) ? p.comments.length : (p.commentsCount || 0),
      }));
      setPosts(mapped);
    }
    if (sr.ok) {
      const d = await sr.json();
      // O backend devolve userName/userAvatar/userBelt — normalizar para os campos usados no render
      setStories((d.stories || []).map((s: any) => ({
        ...s,
        authorName: s.authorName || s.userName,
        authorAvatar: s.authorAvatar || s.userAvatar,
        authorBelt: s.authorBelt || s.userBelt,
      })));
    }
    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    const res = await authFetch(`/api/social/posts/${postId}/like`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setPosts(p => p.map(x => x.id === postId ? { ...x, isLiked: data.hasUpvoted, upvotesCount: data.upvotes ?? (data.hasUpvoted ? x.upvotesCount + 1 : x.upvotesCount - 1) } : x));
    }
  };

  const handleSavePost = async (postId: string) => {
    const res = await authFetch(`/api/social/posts/${postId}/save`, { method: 'POST' });
    if (res.ok) {
      setPosts(p => p.map(x => x.id === postId ? { ...x, isSaved: !x.isSaved } : x));
    }
  };

  const handleShare = async (postId: string) => {
    await authFetch(`/api/social/posts/${postId}/share`, { method: 'POST' });
    if (navigator.share) {
      navigator.share({ url: `${window.location.origin}/post/${postId}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      showToast('Link copiado!', 'success');
    }
  };

  const handleFollow = async (targetUserId: string) => {
    const res = await authFetch(`/api/social/users/${targetUserId}/follow`, { method: 'POST' });
    if (res.ok) {
      const d = await res.json();
      showToast(d.following ? 'Seguindo!' : 'Deixou de seguir', 'success');
      setPosts(p => p.map(x => x.authorId === targetUserId ? { ...x, isFollowing: d.following } : x));
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Excluir este post?')) return;
    const res = await authFetch(`/api/social/posts/${postId}`, { method: 'DELETE' });
    if (res.ok) { setPosts(p => p.filter(x => x.id !== postId)); showToast('Post excluído', 'success'); }
    else showToast('Erro ao excluir', 'error');
    setPostMenuOpen(null);
  };

  const handleEdit = async () => {
    if (!editingPost || !editContent.trim()) return;
    setSaving(true);
    const res = await authFetch(`/api/social/posts/${editingPost.id}`, { method: 'PUT', body: JSON.stringify({ content: editContent }) });
    if (res.ok) { setPosts(p => p.map(x => x.id === editingPost.id ? { ...x, content: editContent } : x)); showToast('Post editado!', 'success'); setEditingPost(null); }
    else showToast('Erro ao editar', 'error');
    setSaving(false);
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    const res = await authFetch(`/api/social/posts/${postId}/comment`, { method: 'POST', body: JSON.stringify({ content }) });
    if (res.ok) {
      setCommentInputs(p => ({ ...p, [postId]: '' }));
      loadComments(postId);
      setPosts(p => p.map(x => x.id === postId ? { ...x, commentsCount: (x.commentsCount || 0) + 1 } : x));
    }
  };

  const loadComments = async (postId: string) => {
    // Comentarios ja vem no post - usar os que temos
    const post = posts.find(p => p.id === postId);
    if (post?.comments && Array.isArray(post.comments)) {
      const mapped = post.comments.map((c: any) => ({
        ...c,
        authorName: c.author?.name || c.authorName || 'Atleta',
        authorAvatar: c.author?.avatar || c.authorAvatar || null,
      }));
      setExpandedComments(p => ({ ...p, [postId]: mapped }));
    }
    setShowComments(p => ({ ...p, [postId]: true }));
  };

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    const formData = new FormData();
    formData.append('media', file);
    try {
      const res = await fetch('/api/social/upload-media', { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData });
      if (res.ok) {
        const data = await res.json();
        const url = data.url || data.imageUrl || data.videoUrl || data.mediaUrl;
        setStoryMedia(url);
        setStoryMediaType(file.type.startsWith('video/') ? 'video' : 'image');
        setStoryPreview(URL.createObjectURL(file));
      }
    } catch { showToast('Erro no upload', 'error'); }
    setUploadingMedia(false);
  };

  const resetStoryCreator = () => {
    setShowCreateStory(false);
    setStoryMedia(null);
    setStoryPreview(null);
    setStoryCaption('');
    setShowStoryEmoji(false);
    setStoryTextColor('#ffffff');
  };

  const handleDeleteStory = async () => {
    if (!storyView) return;
    const res = await authFetch(`/api/social/stories/${storyView.id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) { showToast('Story excluído.', 'success'); setConfirmDeleteStory(false); setStoryView(null); fetchAll(); }
    else showToast('Erro ao excluir story', 'error');
  };

  const handleCreateStory = async () => {
    if (!storyMedia) { showToast('Selecione uma mídia', 'error'); return; }
    setSaving(true);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const res = await authFetch('/api/social/stories', {
      method: 'POST',
      body: JSON.stringify({ mediaUrl: storyMedia, mediaType: storyMediaType, caption: storyCaption.trim() || null, expiresAt,
        locationName: storyLocation?.name || null, locationLat: storyLocation?.lat ?? null, locationLng: storyLocation?.lng ?? null,
        filter: storyFilter,
        mentions: storyMentions.map(m => ({ userId: m.userId, username: m.username, x: m.x, y: m.y })),
        musicId: storyMusic?.id || null, musicStartAt: storyMusicStart })
    });
    if (res.ok) {
      showToast('Story publicado!', 'success');
      setStoryLocation(null);
      setStoryFilter('normal');
      setStoryMentions([]);
      setStoryMusic(null); setStoryMusicStart(0);
      resetStoryCreator();
      fetchAll();
    } else showToast('Erro ao publicar story', 'error');
    setSaving(false);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    const formData = new FormData();
    formData.append('media', file);
    try {
      const res = await fetch('/api/social/upload-media', { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData });
      if (res.ok) {
        const data = await res.json();
        const url = data.url || data.imageUrl || data.videoUrl || data.mediaUrl;
        if (file.type.startsWith('video/')) setNewPost(p => ({ ...p, videoUrl: url, imageUrl: '' }));
        else setNewPost(p => ({ ...p, imageUrl: url, videoUrl: '' }));
        setMediaPreview(URL.createObjectURL(file));
      } else showToast('Erro no upload', 'error');
    } catch { showToast('Erro de conexão', 'error'); }
    setUploadingMedia(false);
  };

  const handlePost = async () => {
    if (!newPost.content.trim()) return;
    setSaving(true);
    const res = await authFetch('/api/social/posts', { method: 'POST', body: JSON.stringify({ ...newPost, locationName: postLocation?.name || null, locationLat: postLocation?.lat ?? null, locationLng: postLocation?.lng ?? null }) });
    if (res.ok) {
      showToast('Publicado!', 'success');
      setShowNewPost(false);
      setNewPost({ content: '', imageUrl: '', videoUrl: '', privacy: 'public', category: 'Treinos' });
      setPostLocation(null);
      setMediaPreview(null);
      fetchAll();
    } else showToast('Erro ao publicar', 'error');
    setSaving(false);
  };

  const handleSaveDiary = async () => {
    if (!diary.positions.trim()) { showToast('Informe as posições', 'error'); return; }
    setSaving(true);
    const res = await authFetch('/api/training-log', { method: 'POST', body: JSON.stringify({ ...diary, positions: JSON.stringify(diary.positions.split(',').map(p => p.trim()).filter(Boolean)) }) });
    if (res.ok) { showToast('Treino salvo!', 'success'); setShowDiary(false); setDiary({ positions: '', fatigue: 3, duration: 60, notes: '' }); }
    else showToast('Erro ao salvar', 'error');
    setSaving(false);
  };

  const S = {
    wrap: { background: '#080a12', minHeight: '100vh', color: '#c0c5e0', fontFamily: 'var(--font-sans)' } as React.CSSProperties,
    center: { maxWidth: 470, margin: '0 auto' } as React.CSSProperties,
    avatar: (size: number) => ({ width: size, height: size, borderRadius: '50%', background: '#2a2d45', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, color: '#c9a84c', fontWeight: 500 }) as React.CSSProperties,
    btn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' } as React.CSSProperties,
    input: { background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '9px 12px', color: '#c0c5e0', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' as const, fontFamily: 'inherit' },
    modal: { position: 'fixed' as const, inset: 0, background: '#000000cc', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
    modalBox: { background: '#0d0f1a', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' as const, padding: 20 },
    goldBtn: { width: '100%', background: '#c9a84c', border: 'none', borderRadius: 10, padding: 13, color: '#000', fontSize: 14, fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
  };

  if (viewingUserId) {
    return <UserProfilePage userId={viewingUserId} currentUser={user} showToast={showToast} onBack={() => setViewingUserId(null)} />;
  }

  return (
    <div style={S.wrap}>
      {/* STORIES */}
      <div style={{ ...S.center, display: 'flex', gap: 14, padding: '12px 14px', overflowX: 'auto', borderBottom: '0.5px solid #1e2235', scrollbarWidth: 'none' }}>
        <div onClick={() => setShowCreateStory(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, cursor: 'pointer' }}>
          <div style={{ position: 'relative', width: 58, height: 58 }}>
            <div style={{ ...S.avatar(58), border: '1.5px solid #2a2d45' }}>
              {user.avatar ? <img src={user.avatar} style={{ width: 58, height: 58, objectFit: 'cover' }} /> : user.name[0]}
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowCreateStory(true); }} style={{ ...S.btn, position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, background: '#c9a84c', borderRadius: '50%', border: '2px solid #080a12', justifyContent: 'center' }}>
              <Plus size={12} color="#000" />
            </button>
          </div>
          <span style={{ fontSize: 10, color: '#7b83b0' }}>Seu story</span>
        </div>
        {stories.map((s: any) => (
          <div key={s.id} onClick={() => setStoryView(s)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: 58, height: 58, borderRadius: '50%', padding: 2, background: 'linear-gradient(135deg, #c9a84c, #f59e0b)' }}>
              <div style={{ ...S.avatar(50), border: '2px solid #080a12' }}>
                {s.authorAvatar ? <img src={s.authorAvatar} style={{ width: 50, height: 50, objectFit: 'cover' }} /> : s.authorName?.[0]}
              </div>
              {s.locationName && (
                <div title={s.locationName} style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, background: '#c9a84c', borderRadius: '50%', border: '2px solid #080a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={11} color="#000" />
                </div>
              )}
            </div>
            <span style={{ fontSize: 10, color: '#c0c5e0', maxWidth: 58, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.authorName?.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* INPUT BAR */}
      <div style={{ ...S.center, display: 'flex', gap: 8, padding: '10px 14px', borderBottom: '0.5px solid #1e2235' }}>
        <button onClick={() => setShowNewPost(true)} style={{ flex: 1, background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 24, padding: '9px 16px', color: '#4a5075', fontSize: 13, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={S.avatar(28)}>{user.avatar ? <img src={user.avatar} style={{ width: 28, height: 28, objectFit: 'cover' }} /> : user.name[0]}</div>
          Compartilhe algo no tatame...
        </button>
        <button onClick={() => setShowDiary(true)} style={{ background: '#1a1d2e', border: '0.5px solid #c9a84c44', borderRadius: 10, padding: '0 12px', color: '#c9a84c', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
          <Dumbbell size={14} /> Diário
        </button>
      </div>

      {/* POSTS */}
      <div style={S.center}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#4a5075', fontSize: 13 }}>Carregando...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px', color: '#4a5075' }}>
            <p style={{ marginBottom: 10 }}>Nenhum post ainda.</p>
            <button onClick={() => setShowNewPost(true)} style={{ ...S.goldBtn, width: 'auto', padding: '8px 20px', borderRadius: 8, fontSize: 13 }}>Publicar primeiro</button>
          </div>
        ) : posts.map((post: any) => (
          <div key={post.id} style={{ borderBottom: '0.5px solid #1a1d2e' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ ...S.avatar(36), border: '1.5px solid #c9a84c33', flexShrink: 0 }}>
                  {post.authorAvatar ? <img src={post.authorAvatar} style={{ width: 36, height: 36, objectFit: 'cover' }} /> : post.authorName?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#c0c5e0', fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => openProfile(post.authorId)}>
                      {post.authorName}
                    </span>
                    {post.authorBelt && <span style={{ background: BELT_COLORS[post.authorBelt] || '#333', color: post.authorBelt === 'WHITE' ? '#000' : '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 500 }}>{BELT_LABELS[post.authorBelt] || post.authorBelt}</span>}
                    {post.authorVerified && <CheckCircle size={11} color="#c9a84c" />}
                    {post.authorId !== user.id && !post.isFollowing && (
                      <button onClick={() => handleFollow(post.authorId)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a84c', fontSize: 12, fontWeight: 500, padding: '0 4px' }}>
                        · Seguir
                      </button>
                    )}
                  </div>
                  {post.locationName && (
                    <a href={post.locationLat != null ? `https://www.google.com/maps?q=${post.locationLat},${post.locationLng}` : undefined}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#7b83b0', textDecoration: 'none', cursor: 'pointer' }}>
                      <MapPin size={11} style={{ color: '#c9a84c' }} /> {String(post.locationName).split(',').slice(0, 2).join(',')}
                    </a>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4a5075' }}>
                    {post.authorAcademy && <span>{post.authorAcademy}</span>}
                    {post.authorAcademy && <span>·</span>}
                    <span>{timeAgo(post.createdAt)}</span>
                    {post.privacy === 'friends' && <Users size={9} color="#4a5075" />}
                    {post.privacy === 'private' && <Lock size={9} color="#4a5075" />}
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setPostMenuOpen(postMenuOpen === post.id ? null : post.id)} style={S.btn}>
                  <MoreHorizontal size={20} color="#4a5075" />
                </button>
                {postMenuOpen === post.id && (
                  <div style={{ position: 'absolute', right: 0, top: 24, background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 10, padding: '4px 0', zIndex: 10, minWidth: 140, boxShadow: '0 4px 20px #000a' }}>
                    {post.authorId === user.id && (
                      <>
                        <button onClick={() => { setEditingPost(post); setEditContent(post.content); setPostMenuOpen(null); }}
                          style={{ ...S.btn, width: '100%', padding: '9px 14px', color: '#c0c5e0', fontSize: 13, gap: 8 }}>
                          <Edit2 size={14} color="#7b83b0" /> Editar
                        </button>
                        <button onClick={() => handleDelete(post.id)}
                          style={{ ...S.btn, width: '100%', padding: '9px 14px', color: '#e74c3c', fontSize: 13, gap: 8 }}>
                          <Trash2 size={14} color="#e74c3c" /> Excluir
                        </button>
                      </>
                    )}
                    {post.authorId !== user.id && (
                      <button onClick={() => setPostMenuOpen(null)} style={{ ...S.btn, width: '100%', padding: '9px 14px', color: '#7b83b0', fontSize: 13 }}>Denunciar</button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mídia */}
            {post.imageUrl && <img src={post.imageUrl} style={{ width: '100%', display: 'block', maxHeight: 500, objectFit: 'cover' }} />}
            {post.videoUrl && !post.imageUrl && <video src={post.videoUrl} controls style={{ width: '100%', display: 'block', maxHeight: 500, background: '#000' }} />}

            {/* Ações */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 6px' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={() => handleLike(post.id)} style={S.btn}>
                  <Heart size={26} fill={post.isLiked ? '#e74c3c' : 'none'} color={post.isLiked ? '#e74c3c' : '#c0c5e0'} />
                </button>
                <button onClick={() => showComments[post.id] ? setShowComments(p => ({ ...p, [post.id]: false })) : loadComments(post.id)} style={S.btn}>
                  <MessageCircle size={26} color="#c0c5e0" />
                </button>
                <button onClick={() => handleShare(post.id)} style={S.btn}><Send size={24} color="#c0c5e0" /></button>
              </div>
              <button onClick={() => handleSavePost(post.id)} style={S.btn}>
                <Bookmark size={26} fill={post.isSaved ? '#c9a84c' : 'none'} color={post.isSaved ? '#c9a84c' : '#c0c5e0'} />
              </button>
            </div>

            {/* Contagem + conteúdo */}
            <div style={{ padding: '0 14px 8px' }}>
              {(post.upvotesCount || 0) > 0 && <p style={{ fontSize: 13, color: '#c0c5e0', fontWeight: 500, margin: '0 0 5px' }}>{post.upvotesCount} curtida{post.upvotesCount !== 1 ? 's' : ''}</p>}
              <p style={{ fontSize: 14, color: '#c0c5e0', margin: '0 0 4px', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600, marginRight: 6 }}>{post.authorName?.split(' ')[0]}</span>{post.content}
              </p>
              {(post.commentsCount || 0) > 0 && !showComments[post.id] && (
                <button onClick={() => loadComments(post.id)} style={{ ...S.btn, color: '#7b83b0', fontSize: 13, marginTop: 2 }}>
                  Ver todos os {post.commentsCount} comentários
                </button>
              )}
            </div>

            {/* Comentários */}
            {showComments[post.id] && (
              <div style={{ padding: '0 14px 6px' }}>
                {(expandedComments[post.id] || post.comments || []).map((c: any) => (
                  <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <div style={{ ...S.avatar(26), flexShrink: 0 }}>
                      {(c.authorAvatar || c.author?.avatar) ? <img src={c.authorAvatar || c.author?.avatar} style={{ width: 26, height: 26, objectFit: 'cover' }} /> : (c.authorName || c.author?.name)?.[0]}
                    </div>
                    <p style={{ fontSize: 13, color: '#c0c5e0', margin: 0, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 600, marginRight: 5 }}>{(c.authorName || c.author?.name)?.split(' ')[0]}</span>{c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Input comentário */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 12px', borderTop: '0.5px solid #1a1d2e' }}>
              <div style={S.avatar(28)}>
                {user.avatar ? <img src={user.avatar} style={{ width: 28, height: 28, objectFit: 'cover' }} /> : user.name[0]}
              </div>
              <input value={commentInputs[post.id] || ''} onChange={e => setCommentInputs(p => ({ ...p, [post.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                placeholder="Adicionar comentário..."
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#c0c5e0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
              {commentInputs[post.id] && (
                <button onClick={() => handleComment(post.id)} style={{ ...S.btn, color: '#c9a84c', fontSize: 13, fontWeight: 600 }}>Publicar</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDITAR POST */}
      {editingPost && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#c0c5e0' }}>Editar post</span>
              <button onClick={() => setEditingPost(null)} style={S.btn}><X size={20} color="#7b83b0" /></button>
            </div>
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4}
              style={{ ...S.input, resize: 'none', marginBottom: 12, borderRadius: 10, padding: 12, fontSize: 14 }} />
            <button onClick={handleEdit} disabled={saving} style={{ ...S.goldBtn, opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}

      {/* CRIAR STORY — TELA FULLSCREEN ESTILO INSTAGRAM */}
      {showCreateStory && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 300, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <input ref={storyFileRef} type="file" accept="image/*,video/*" onChange={handleStoryUpload} style={{ display: 'none' }} />

          {/* TOPO: fechar + ferramentas */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'linear-gradient(to bottom, #000000aa, transparent)' }}>
            <button onClick={resetStoryCreator} style={S.btn}><X size={28} color="#fff" /></button>
            {storyMedia && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                <button
                  onClick={() => { setStoryTextColor(c => STORY_TEXT_COLORS[(STORY_TEXT_COLORS.indexOf(c) + 1) % STORY_TEXT_COLORS.length]); captionRef.current?.focus(); }}
                  title="Texto"
                  style={{ ...S.btn, width: 30, height: 30, justifyContent: 'center' }}>
                  <span style={{ fontSize: 21, fontWeight: 700, color: storyTextColor, textShadow: '0 1px 3px #000', fontFamily: 'Georgia, serif' }}>Aa</span>
                </button>
                <button onClick={() => setShowStoryEmoji(v => !v)} title="Figurinhas" style={{ ...S.btn, width: 30, height: 30, justifyContent: 'center' }}>
                  <Smile size={26} color={showStoryEmoji ? '#c9a84c' : '#fff'} />
                </button>
                <button
                  onClick={() => setShowMentionSearch(true)}
                  title="Mencionar"
                  style={{ ...S.btn, width: 30, height: 30, justifyContent: 'center' }}>
                  <AtSign size={25} color={storyMentions.length ? '#c9a84c' : '#fff'} />
                </button>
                <button onClick={() => setShowMusicPicker(true)} title="Música" style={{ ...S.btn, width: 30, height: 30, justifyContent: 'center', fontSize: 22 }}>
                  <span style={{ color: storyMusic ? '#c9a84c' : '#fff' }}>🎵</span>
                </button>
              </div>
            )}
          </div>

          {/* ÁREA DA MÍDIA */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 0 }}>
            {!storyMedia ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
                <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={38} color="#000" />
                </div>
                <div>
                  <p style={{ color: '#fff', fontSize: 17, fontWeight: 600, margin: '0 0 6px' }}>Criar novo story</p>
                  <p style={{ color: '#7b83b0', fontSize: 13, margin: 0, maxWidth: 260 }}>Selecione uma foto ou vídeo do seu dispositivo. Seu story fica visível por 24 horas.</p>
                </div>
                <button onClick={() => storyFileRef.current?.click()} disabled={uploadingMedia}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#c9a84c', border: 'none', borderRadius: 24, padding: '12px 28px', color: '#000', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: uploadingMedia ? 0.6 : 1 }}>
                  <ImageIcon size={18} /> {uploadingMedia ? 'Enviando...' : 'Galeria'}
                </button>
              </div>
            ) : (
              <>
                {storyMediaType === 'image'
                  ? <img src={storyPreview!} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: filterCss(storyFilter) }} />
                  : <video src={storyPreview!} autoPlay loop playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', filter: filterCss(storyFilter) }} />}

                <MentionEditor mentions={storyMentions} setMentions={setStoryMentions} />

                {/* legenda sobreposta (preview ao vivo) */}
                {storyCaption.trim() && (
                  <div style={{ position: 'absolute', left: 20, right: 20, top: '45%', transform: 'translateY(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: storyTextColor, fontSize: 26, fontWeight: 700, textShadow: '0 2px 8px #000c', lineHeight: 1.3, wordBreak: 'break-word' }}>{storyCaption}</span>
                  </div>
                )}

                {/* seletor de figurinhas/emoji */}
                {showStoryEmoji && (
                  <div style={{ position: 'absolute', bottom: 90, left: 16, right: 16, background: '#0d0f1aee', border: '0.5px solid #2a2d45', borderRadius: 14, padding: 12, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    {STORY_EMOJIS.map(em => (
                      <button key={em} onClick={() => { setStoryCaption(c => c + em); captionRef.current?.focus(); }}
                        style={{ ...S.btn, fontSize: 26, width: 40, height: 40, justifyContent: 'center', borderRadius: 8 }}>
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* FAIXA DE FILTROS (acima do rodapé) */}
          {storyMedia && storyPreview && (
            <div style={{ position: 'absolute', bottom: 120, left: 0, right: 0, zIndex: 21, display: 'flex', gap: 8, overflowX: 'auto', padding: '0 12px' }}>
              {STORY_FILTERS.map(f => (
                <div key={f.id} onClick={() => setStoryFilter(f.id)} style={{ flexShrink: 0, textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ width: 54, height: 54, borderRadius: 8, overflow: 'hidden', border: `2px solid ${storyFilter === f.id ? '#c9a84c' : 'transparent'}` }}>
                    {storyMediaType === 'image'
                      ? <img src={storyPreview} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: f.css }} />
                      : <video src={storyPreview} muted style={{ width: '100%', height: '100%', objectFit: 'cover', filter: f.css }} />}
                  </div>
                  <span style={{ fontSize: 9, color: storyFilter === f.id ? '#c9a84c' : '#c0c5e0', display: 'block', marginTop: 2 }}>{f.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* RODAPÉ: legenda + publicar */}
          {storyMedia && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: 'linear-gradient(to top, #000000cc, transparent)' }}>
              {storyMusic && <div><MusicChip title={storyMusic.title} artist={storyMusic.artist} onRemove={() => { setStoryMusic(null); setStoryMusicStart(0); }} /></div>}
              <div><LocationPicker value={storyLocation} onChange={setStoryLocation} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input ref={captionRef} value={storyCaption} onChange={e => setStoryCaption(e.target.value)} placeholder="Adicionar legenda..."
                style={{ flex: 1, background: '#1a1d2ecc', border: '0.5px solid #2a2d45', borderRadius: 24, padding: '12px 18px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
              <button onClick={handleCreateStory} disabled={saving} title="Publicar story"
                style={{ width: 52, height: 52, borderRadius: '50%', background: '#c9a84c', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: saving ? 0.6 : 1 }}>
                <Send size={22} color="#000" />
              </button>
              </div>
            </div>
          )}

          {showMentionSearch && (
            <MentionSearchModal
              existing={storyMentions.map(m => m.userId)}
              onClose={() => setShowMentionSearch(false)}
              onSelect={(u) => {
                if (storyMentions.length >= 10) { showToast('Máximo de 10 menções por story.', 'error'); return; }
                setStoryMentions([...storyMentions, { userId: u.id, username: u.username || u.displayName, x: 0.5, y: Math.min(0.85, 0.4 + storyMentions.length * 0.07), displayName: u.displayName, avatar: u.avatar }]);
                setShowMentionSearch(false);
              }}
            />
          )}

          {showMusicPicker && (
            <StoryMusicPicker
              onClose={() => setShowMusicPicker(false)}
              onSelect={(m, startAt) => { setStoryMusic(m); setStoryMusicStart(startAt); setShowMusicPicker(false); }}
            />
          )}
        </div>
      )}

      {/* MODAL NOVO POST */}
      {showNewPost && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#c0c5e0' }}>Nova publicação</span>
              <button onClick={() => setShowNewPost(false)} style={S.btn}><X size={20} color="#7b83b0" /></button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={S.avatar(36)}>{user.avatar ? <img src={user.avatar} style={{ width: 36, height: 36, objectFit: 'cover' }} /> : user.name[0]}</div>
              <textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                placeholder="O que você quer compartilhar?" rows={3}
                style={{ ...S.input, resize: 'none', flex: 1, background: 'transparent', border: 'none', fontSize: 14, padding: '4px 0' }} />
            </div>
            {mediaPreview && newPost.imageUrl && <img src={mediaPreview} style={{ width: '100%', borderRadius: 10, marginBottom: 10, maxHeight: 260, objectFit: 'cover' }} />}
            {mediaPreview && newPost.videoUrl && <video src={mediaPreview} controls style={{ width: '100%', borderRadius: 10, marginBottom: 10, maxHeight: 260, background: '#000' }} />}
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaUpload} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingMedia}
                style={{ flex: 1, background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '9px 0', color: '#7b83b0', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {uploadingMedia ? 'Enviando...' : '📷  Foto / Vídeo'}
              </button>
              {(newPost.imageUrl || newPost.videoUrl) && (
                <button onClick={() => { setNewPost(p => ({ ...p, imageUrl: '', videoUrl: '' })); setMediaPreview(null); }}
                  style={{ background: '#1a1d2e', border: '0.5px solid #e74c3c44', borderRadius: 8, padding: '0 14px', color: '#e74c3c', fontSize: 12, cursor: 'pointer' }}>
                  Remover
                </button>
              )}
            </div>
            <div style={{ marginBottom: 12 }}>
              <LocationPicker value={postLocation} onChange={setPostLocation} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[{ val: 'public', icon: <Globe size={13} />, label: 'Público' }, { val: 'friends', icon: <Users size={13} />, label: 'Amigos' }, { val: 'private', icon: <Lock size={13} />, label: 'Privado' }].map(opt => (
                <button key={opt.val} onClick={() => setNewPost(p => ({ ...p, privacy: opt.val }))}
                  style={{ flex: 1, background: newPost.privacy === opt.val ? '#c9a84c22' : '#1a1d2e', border: `0.5px solid ${newPost.privacy === opt.val ? '#c9a84c' : '#2a2d45'}`, borderRadius: 8, padding: '8px 0', color: newPost.privacy === opt.val ? '#c9a84c' : '#4a5075', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
            <button onClick={handlePost} disabled={saving || !newPost.content.trim()} style={{ ...S.goldBtn, opacity: saving || !newPost.content.trim() ? 0.5 : 1 }}>
              {saving ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DIÁRIO */}
      {showDiary && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Dumbbell size={18} color="#c9a84c" />
                <span style={{ fontSize: 15, fontWeight: 500, color: '#c0c5e0' }}>Diário Técnico</span>
              </div>
              <button onClick={() => setShowDiary(false)} style={S.btn}><X size={20} color="#7b83b0" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: '#7b83b0', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Posições treinadas * (vírgula)</p>
                <input value={diary.positions} onChange={e => setDiary(p => ({ ...p, positions: e.target.value }))}
                  placeholder="Ex: Guarda fechada, Passagem, Montada" style={S.input} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#7b83b0', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duração (minutos)</p>
                <input type="number" value={diary.duration} onChange={e => setDiary(p => ({ ...p, duration: Number(e.target.value) }))} style={S.input} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#7b83b0', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nível de cansaço: {diary.fatigue}/5</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setDiary(p => ({ ...p, fatigue: n }))}
                      style={{ flex: 1, padding: '9px 0', background: diary.fatigue >= n ? '#c9a84c' : '#1a1d2e', border: `0.5px solid ${diary.fatigue >= n ? '#c9a84c' : '#2a2d45'}`, borderRadius: 6, color: diary.fatigue >= n ? '#000' : '#4a5075', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#7b83b0', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anotações</p>
                <textarea value={diary.notes} onChange={e => setDiary(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="O que aprendeu hoje?"
                  style={{ ...S.input, resize: 'none' }} />
              </div>
              <button onClick={handleSaveDiary} disabled={saving} style={{ ...S.goldBtn, opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Salvando...' : 'Salvar Treino'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STORY */}
      {storyView && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setStoryView(null)} style={{ ...S.btn, position: 'absolute', top: 16, right: 16, zIndex: 10 }}><X size={28} color="#fff" /></button>
          {storyView.userId === user.id && (
            <button onClick={() => setConfirmDeleteStory(true)} title="Excluir story" style={{ ...S.btn, position: 'absolute', top: 18, right: 56, zIndex: 10 }}><Trash2 size={22} color="#fff" /></button>
          )}
          {confirmDeleteStory && (
            <div onClick={() => setConfirmDeleteStory(false)} style={{ position: 'absolute', inset: 0, background: '#000a', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <div onClick={e => e.stopPropagation()} style={{ background: '#1a1d2e', border: '0.5px solid #2a2d45', borderRadius: 14, padding: 20, width: 300, textAlign: 'center' }}>
                <Trash2 size={26} color="#e74c3c" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ fontSize: 15, color: '#c0c5e0', fontWeight: 600, margin: '0 0 4px' }}>Excluir este story?</p>
                <p style={{ fontSize: 12, color: '#7b83b0', margin: '0 0 16px' }}>Essa ação não pode ser desfeita.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setConfirmDeleteStory(false)} style={{ flex: 1, background: 'none', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '9px 0', color: '#c0c5e0', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={handleDeleteStory} style={{ flex: 1, background: '#e74c3c', border: 'none', borderRadius: 8, padding: '9px 0', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Excluir</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, left: 16, right: 48, display: 'flex', alignItems: 'center', gap: 10, zIndex: 5 }}>
              <div style={S.avatar(34)}>{storyView.authorAvatar ? <img src={storyView.authorAvatar} style={{ width: 34, height: 34, objectFit: 'cover' }} /> : storyView.authorName?.[0]}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{storyView.authorName}</span>
                {storyView.locationName && (
                  <a href={storyView.locationLat != null ? `https://www.google.com/maps?q=${storyView.locationLat},${storyView.locationLng}` : undefined} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: '#ffffffcc', textDecoration: 'none' }}>
                    <MapPin size={10} /> {String(storyView.locationName).split(',').slice(0, 2).join(',')}
                  </a>
                )}
              </div>
              <span style={{ fontSize: 11, color: '#ffffff88', marginLeft: 'auto' }}>{timeAgo(storyView.createdAt)}</span>
            </div>
            {storyView.mediaType === 'video' ? <video src={storyView.mediaUrl} autoPlay controls style={{ width: '100%', maxHeight: '85vh', objectFit: 'contain', filter: filterCss(storyView.filter) }} />
              : <img src={storyView.mediaUrl} style={{ width: '100%', maxHeight: '85vh', objectFit: 'contain', filter: filterCss(storyView.filter) }} />}
            <MentionViewer mentions={storyView.mentions || []} onOpenProfile={(uid) => { setStoryView(null); openProfile(uid); }} />
            {storyView.music && <StoryAudioPlayer musicId={storyView.music.id} startAt={storyView.musicStartAt || 0} />}
            {storyView.music && <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16, display: 'flex', justifyContent: 'center', zIndex: 6 }}><MusicChip title={storyView.music.title} artist={storyView.music.artist} /></div>}
            {storyView.caption && <p style={{ position: 'absolute', bottom: 20, left: 16, right: 16, color: '#fff', fontSize: 14, textAlign: 'center', textShadow: '0 1px 4px #000' }}>{storyView.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
