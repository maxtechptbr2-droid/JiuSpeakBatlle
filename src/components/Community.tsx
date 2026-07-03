import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Search, ChevronLeft, ChevronRight, MessageSquare, Heart, Send, Bookmark, Pin, Lock, Trash2, Shield, Crown, CheckCircle, Globe, Camera, Edit2, AlertCircle, BarChart2, Calendar, MapPin, Flag, UserPlus, Clock, X, Radio } from 'lucide-react';
import { UserProfile } from '../types';
import FeedInstagram from './FeedInstagram';
import CommunityLives from './CommunityLives';
import UserProfilePage from './UserProfilePage';
import { authFetch as authFetchBase } from '../utils/authFetch';
import CommunityInviteModal from './CommunityInviteModal';
import LocationPicker, { LocationValue } from './LocationPicker';

// Delega ao authFetch oficial (auto-refresh de JWT em 401). Injeta Content-Type JSON;
// para uploads (FormData) usa-se authFetchBase diretamente, sem Content-Type.
const authFetch = (url: string, opts: RequestInit = {}) =>
  authFetchBase(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });

const CATEGORIES = ['Todos', 'Técnicas', 'Preparação Física', 'Histórias de Tatame', 'Competições', 'Memes', 'Equipamentos', 'Academias'];
const BELT_COLORS: Record<string, string> = { WHITE: '#fff', BLUE: '#1a5aad', PURPLE: '#6b21a8', BROWN: '#78350f', BLACK: '#111' };
const BELT_LABELS: Record<string, string> = { WHITE: 'Branca', BLUE: 'Azul', PURPLE: 'Roxa', BROWN: 'Marrom', BLACK: 'Preta' };

// paleta
const C = { bg: '#080a12', gold: '#c9a84c', card: '#1a1d2e', card2: '#0d0f1a', text: '#c0c5e0', muted: '#7b83b0', faint: '#4a5075', line: '#1e2235', line2: '#2a2d45' };

interface CommunityProps {
  user: UserProfile;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type InnerTab = 'feed' | 'forum' | 'polls' | 'events' | 'members' | 'lives' | 'admin';

export default function Community({ user, showToast }: CommunityProps) {
  const [mainTab, setMainTab] = useState<'feed' | 'communities'>('feed');
  const [view, setView] = useState<'list' | 'detail' | 'create' | 'topic'>('list');
  const [communities, setCommunities] = useState<any[]>([]);
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [moderators, setModerators] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [topicsPage, setTopicsPage] = useState(1);
  const [topicsTotalPages, setTopicsTotalPages] = useState(1);
  const [replies, setReplies] = useState<any[]>([]);
  const [repliesPage, setRepliesPage] = useState(1);
  const [repliesTotalPages, setRepliesTotalPages] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [innerTab, setInnerTab] = useState<InnerTab>('feed');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostLocation, setNewPostLocation] = useState<LocationValue | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newReply, setNewReply] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [saving, setSaving] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // enquetes / eventos / denúncia
  const [showNewPoll, setShowNewPoll] = useState(false);
  const [pollForm, setPollForm] = useState<{ question: string; options: string[]; expiresAt: string }>({ question: '', options: ['', ''], expiresAt: '' });
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', eventDate: '', location: '' });
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [adminDash, setAdminDash] = useState<any | null>(null);
  const [payingFee, setPayingFee] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '', description: '', rules: '', category: 'Técnicas', isPrivate: false, coverImage: '', avatar: '', locale: 'Português', location: ''
  });

  // layout adaptativo
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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
      else showToast('Não foi possível carregar as comunidades. Tente novamente.', 'error');
      if (myRes.ok) setMyCommunities((await myRes.json()).communities || []);
    } catch (e) {
      showToast('Erro de conexão ao carregar comunidades.', 'error');
    }
    setLoading(false);
  };

  const openCommunity = async (comm: any) => {
    setSelected(comm);
    setView('detail');
    setInnerTab('feed');
    setTopicsPage(1);
    // detalhe completo (com moderadores) + conteúdos
    const detailRes = await authFetch(`/api/communities/${comm.id}`);
    if (detailRes.ok) {
      const d = await detailRes.json();
      if (d.community) setSelected(d.community);
      setModerators(d.moderators || []);
    }
    await Promise.all([
      fetchPosts(comm.id), fetchTopics(comm.id, 1), fetchMembers(comm.id),
      fetchPolls(comm.id), fetchEvents(comm.id), fetchRelated(comm.id)
    ]);
  };

  const refreshDetail = async (id: string) => {
    const res = await authFetch(`/api/communities/${id}`);
    if (res.ok) {
      const d = await res.json();
      if (d.community) setSelected(d.community);
      setModerators(d.moderators || []);
    }
  };

  const fetchPosts = async (id: string) => {
    const res = await authFetch(`/api/communities/${id}/posts`);
    if (res.ok) setPosts((await res.json()).posts || []);
  };
  const fetchTopics = async (id: string, page = 1) => {
    const res = await authFetch(`/api/communities/${id}/topics?page=${page}`);
    if (res.ok) { const d = await res.json(); setTopics(d.topics || []); setTopicsPage(d.page || 1); setTopicsTotalPages(d.totalPages || 1); }
  };
  const fetchMembers = async (id: string) => {
    const res = await authFetch(`/api/communities/${id}/members`);
    if (res.ok) setMembers((await res.json()).members || []);
  };
  const fetchPolls = async (id: string) => {
    const res = await authFetch(`/api/communities/${id}/polls`);
    if (res.ok) setPolls((await res.json()).polls || []);
  };
  const fetchEvents = async (id: string) => {
    const res = await authFetch(`/api/communities/${id}/events`);
    if (res.ok) setEvents((await res.json()).events || []);
  };
  const fetchRelated = async (id: string) => {
    const res = await authFetch(`/api/communities/${id}/related`);
    if (res.ok) setRelated((await res.json()).related || []);
  };

  const openTopic = async (topic: any, page = 1) => {
    setSelectedTopic(topic);
    setView('topic');
    const res = await authFetch(`/api/communities/${selected.id}/topics/${topic.id}/replies?page=${page}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedTopic(data.topic);
      setReplies(data.replies || []);
      setRepliesPage(data.page || 1);
      setRepliesTotalPages(data.totalPages || 1);
    }
  };

  const openProfile = (userId: string) => {
    if (!userId || userId === user.id) return;
    setViewingUserId(userId);
  };

  const handleJoin = async (commId: string) => {
    const res = await authFetch(`/api/communities/${commId}/join`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      showToast(data.action === 'joined' ? 'Você entrou na comunidade!' : 'Você saiu da comunidade.', 'success');
      fetchCommunities();
      if (selected?.id === commId) { await refreshDetail(commId); fetchMembers(commId); }
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
    if (res.ok) { const data = await res.json(); setPostComments(p => ({ ...p, [postId]: data.comments || [] })); }
    setShowComments(p => ({ ...p, [postId]: true }));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selected) return;
    setSaving(true);
    const res = await authFetch(`/api/communities/${selected.id}/posts`, { method: 'POST', body: JSON.stringify({ content: newPostContent, imageUrl: newPostImage || null, category: 'Geral', locationName: newPostLocation?.name || null, locationLat: newPostLocation?.lat ?? null, locationLng: newPostLocation?.lng ?? null }) });
    if (res.ok) { showToast('Post publicado!', 'success'); setNewPostContent(''); setNewPostImage(''); setNewPostLocation(null); setShowCreatePost(false); fetchPosts(selected.id); }
    else { const d = await res.json(); showToast(d.error || 'Erro ao publicar', 'error'); }
    setSaving(false);
  };

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !selected) return;
    setSaving(true);
    const res = await authFetch(`/api/communities/${selected.id}/topics`, { method: 'POST', body: JSON.stringify({ title: newTopicTitle, content: newTopicContent }) });
    if (res.ok) { showToast('Tópico criado!', 'success'); setNewTopicTitle(''); setNewTopicContent(''); setShowNewTopic(false); fetchTopics(selected.id, 1); }
    else { const d = await res.json(); showToast(d.error || 'Erro ao criar tópico', 'error'); }
    setSaving(false);
  };

  const handleReply = async () => {
    if (!newReply.trim() || !selectedTopic || !selected) return;
    setSaving(true);
    const res = await authFetch(`/api/communities/${selected.id}/topics/${selectedTopic.id}/replies`, { method: 'POST', body: JSON.stringify({ content: newReply }) });
    if (res.ok) { showToast('Resposta enviada!', 'success'); setNewReply(''); openTopic(selectedTopic, repliesTotalPages); }
    setSaving(false);
  };

  const handleUploadImage = async (file: File, field: 'coverImage' | 'avatar') => {
    if (!file) return;
    setUploadingField(field);
    const fd = new FormData();
    fd.append('media', file); // mesmo nome de campo esperado pelo endpoint
    try {
      // authFetchBase: sem Content-Type (browser define o boundary do FormData) e com auto-refresh de JWT
      const res = await authFetchBase('/api/social/upload-media', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) { setCreateForm(p => ({ ...p, [field]: data.url })); showToast('Imagem enviada!', 'success'); }
      else showToast(data.error || 'Erro no upload', 'error');
    } catch { showToast('Erro no upload', 'error'); }
    setUploadingField(null);
  };

  const handleUploadPostImage = async (file: File) => {
    if (!file) return;
    setUploadingField('postImage');
    const fd = new FormData();
    fd.append('media', file);
    try {
      const res = await authFetchBase('/api/social/upload-media', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) setNewPostImage(data.url);
      else showToast(data.error || 'Erro no upload', 'error');
    } catch { showToast('Erro no upload', 'error'); }
    setUploadingField(null);
  };

  const handleCreateCommunity = async () => {
    if (!createForm.name || !createForm.category) { showToast('Nome e categoria são obrigatórios.', 'error'); return; }
    setSaving(true);
    const res = await authFetch('/api/communities', { method: 'POST', body: JSON.stringify(createForm) });
    if (res.ok) {
      showToast('Comunidade criada!', 'success');
      setView('list');
      setCreateForm({ name: '', description: '', rules: '', category: 'Técnicas', isPrivate: false, coverImage: '', avatar: '', locale: 'Português', location: '' });
      fetchCommunities();
    } else { const d = await res.json(); showToast(d.error || 'Erro ao criar comunidade', 'error'); }
    setSaving(false);
  };

  const handlePinTopic = async (topicId: string, isPinned: boolean) => {
    await authFetch(`/api/communities/${selected.id}/topics/${topicId}`, { method: 'PATCH', body: JSON.stringify({ isPinned: !isPinned, isLocked: false }) });
    fetchTopics(selected.id, topicsPage);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Excluir este post?')) return;
    await authFetch(`/api/communities/${selected.id}/posts/${postId}`, { method: 'DELETE' });
    fetchPosts(selected.id);
  };

  // --- ENQUETES ---
  const handleCreatePoll = async () => {
    const opts = pollForm.options.map(o => o.trim()).filter(Boolean);
    if (!pollForm.question.trim()) { showToast('Digite a pergunta.', 'error'); return; }
    if (opts.length < 2) { showToast('Adicione ao menos 2 opções.', 'error'); return; }
    setSaving(true);
    const res = await authFetch(`/api/communities/${selected.id}/polls`, { method: 'POST', body: JSON.stringify({ question: pollForm.question, options: opts, expiresAt: pollForm.expiresAt || null }) });
    if (res.ok) { showToast('Enquete criada!', 'success'); setPollForm({ question: '', options: ['', ''], expiresAt: '' }); setShowNewPoll(false); fetchPolls(selected.id); }
    else { const d = await res.json(); showToast(d.error || 'Erro ao criar enquete', 'error'); }
    setSaving(false);
  };
  const handleVote = async (pollId: string, optionId: string) => {
    const res = await authFetch(`/api/communities/${selected.id}/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify({ optionId }) });
    if (res.ok) { fetchPolls(selected.id); }
    else { const d = await res.json(); showToast(d.error || 'Erro ao votar', 'error'); }
  };

  // --- EVENTOS ---
  const handleCreateEvent = async () => {
    if (!eventForm.title.trim()) { showToast('Digite o título do evento.', 'error'); return; }
    if (!eventForm.eventDate) { showToast('Escolha a data do evento.', 'error'); return; }
    setSaving(true);
    const res = await authFetch(`/api/communities/${selected.id}/events`, { method: 'POST', body: JSON.stringify(eventForm) });
    if (res.ok) { showToast('Evento criado!', 'success'); setEventForm({ title: '', description: '', eventDate: '', location: '' }); setShowNewEvent(false); fetchEvents(selected.id); }
    else { const d = await res.json(); showToast(d.error || 'Erro ao criar evento', 'error'); }
    setSaving(false);
  };
  const handleRsvp = async (eventId: string, status: string) => {
    const res = await authFetch(`/api/communities/${selected.id}/events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify({ status }) });
    if (res.ok) fetchEvents(selected.id);
  };

  // --- CONVIDAR / DENUNCIAR ---
  const fetchAdminDashboard = async (id: string) => {
    const res = await authFetch(`/api/communities/${id}/admin-dashboard`);
    if (res.ok) setAdminDash(await res.json());
  };

  const handlePayFee = async () => {
    if (!selected) return;
    setPayingFee(true);
    const res = await authFetch(`/api/communities/${selected.id}/pay`, { method: 'POST' });
    const d = await res.json();
    if (res.ok) {
      showToast(`Mensalidade paga! Ativa até ${new Date(d.paidUntil).toLocaleDateString('pt-BR')}. Saldo: ${d.newBalance} JT.`, 'success');
      await refreshDetail(selected.id);
      fetchAdminDashboard(selected.id);
    } else {
      showToast(d.error || 'Erro ao pagar mensalidade', 'error');
    }
    setPayingFee(false);
  };

  const handleReport = async () => {
    if (!reportReason.trim()) { showToast('Descreva o motivo.', 'error'); return; }
    setSaving(true);
    const res = await authFetch(`/api/communities/${selected.id}/report`, { method: 'POST', body: JSON.stringify({ targetType: 'community', reason: reportReason }) });
    if (res.ok) { showToast('Denúncia enviada. Obrigado!', 'success'); setReportReason(''); setShowReport(false); }
    else { const d = await res.json(); showToast(d.error || 'Erro ao denunciar', 'error'); }
    setSaving(false);
  };

  const myRole = selected ? (members.find(m => m.userId === user.id)?.role || selected.myRole || null) : null;
  const canModerate = myRole === 'owner' || myRole === 'moderator' || user.role === 'ADMIN';
  const isMember = !!selected?.isMember || !!members.find(m => m.userId === user.id && !m.isBanned);
  const isOwner = !!selected && selected.ownerId === user.id;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d`;
    if (h > 0) return `${h}h`;
    return `${Math.max(0, m)}min`;
  };
  const fmtDate = (date: string) => { try { return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return ''; } };
  const fmtDateTime = (date: string) => { try { return new Date(date).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  // ---------- se estiver vendo perfil de usuário ----------
  if (viewingUserId) {
    return <UserProfilePage userId={viewingUserId} currentUser={user} showToast={showToast} onBack={() => setViewingUserId(null)} />;
  }

  // ========================= RENDER PARCIAIS =========================

  const InfoCard = () => (
    <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 14 }}>
      <p style={{ fontSize: 10, color: C.gold, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Informações</p>
      {selected.description && <p style={{ fontSize: 12.5, color: C.text, margin: '0 0 12px', lineHeight: 1.5 }}>{selected.description}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
        <InfoRow label="Categoria" value={selected.category} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ color: C.faint }}>Dono</span>
          <span onClick={() => openProfile(selected.ownerId)} style={{ color: C.gold, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Crown size={11} /> {selected.ownerName}
          </span>
        </div>
        {moderators.filter(m => m.role === 'moderator').length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: C.faint }}>Moderadores</span>
            <span style={{ textAlign: 'right' }}>
              {moderators.filter(m => m.role === 'moderator').map((m, i) => (
                <span key={m.userId} onClick={() => openProfile(m.userId)} style={{ color: C.text, cursor: 'pointer' }}>{m.name}{i < moderators.filter(x => x.role === 'moderator').length - 1 ? ', ' : ''}</span>
              ))}
            </span>
          </div>
        )}
        <InfoRow label="Tipo" value={selected.isPrivate ? 'Privada' : 'Pública'} icon={selected.isPrivate ? <Lock size={11} /> : <Globe size={11} />} />
        {selected.locale && <InfoRow label="Idioma" value={selected.locale} />}
        {selected.location && <InfoRow label="Local" value={selected.location} icon={<MapPin size={11} />} />}
        {selected.createdAt && <InfoRow label="Criada em" value={fmtDate(selected.createdAt)} />}
        <InfoRow label="Membros" value={Number(selected.memberCount || 0).toLocaleString()} />
      </div>
      {(canModerate) && (
        <button onClick={() => startEdit()} style={{ marginTop: 12, width: '100%', background: C.card2, border: `0.5px solid ${C.line2}`, borderRadius: 8, padding: '7px', color: C.muted, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Edit2 size={12} /> Editar comunidade
        </button>
      )}
    </div>
  );

  const MembersWidget = ({ horizontal }: { horizontal: boolean }) => (
    <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontSize: 10, color: C.gold, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Membros · {Number(selected.memberCount || 0).toLocaleString()}</p>
        <button onClick={() => setInnerTab('members')} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 11, cursor: 'pointer' }}>Ver todos</button>
      </div>
      <div style={horizontal
        ? { display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }
        : { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {members.slice(0, 9).map(m => (
          <div key={m.id} onClick={() => openProfile(m.userId)} style={{ textAlign: 'center', cursor: 'pointer', flexShrink: 0, width: horizontal ? 60 : 'auto' }}>
            <Avatar src={m.avatar} name={m.name} size={46} />
            <p style={{ fontSize: 10, color: C.text, margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name?.split(' ')[0]}</p>
            <p style={{ fontSize: 8, color: C.faint, margin: 0 }}>{BELT_LABELS[m.belt] || ''}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const RelatedWidget = ({ horizontal }: { horizontal: boolean }) => related.length > 0 && (
    <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 14 }}>
      <p style={{ fontSize: 10, color: C.gold, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Comunidades relacionadas</p>
      <div style={horizontal ? { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 } : { display: 'flex', flexDirection: 'column', gap: 10 }}>
        {related.map(r => (
          <div key={r.id} onClick={() => openCommunity(r)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0, minWidth: horizontal ? 160 : 'auto' }}>
            <Avatar src={r.avatar} name={r.name} size={34} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, color: C.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</p>
              <p style={{ fontSize: 10, color: C.faint, margin: 0 }}>{Number(r.memberCount || 0).toLocaleString()} membros</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const startEdit = () => {
    setCreateForm({
      name: selected.name || '', description: selected.description || '', rules: selected.rules || '',
      category: selected.category || 'Técnicas', isPrivate: !!selected.isPrivate, coverImage: selected.coverImage || '',
      avatar: selected.avatar || '', locale: selected.locale || 'Português', location: selected.location || ''
    });
    setEditingId(selected.id);
    setView('create');
  };

  // ---------- conteúdo de cada aba ----------
  const FeedTab = () => (
    <div>
      {isMember && (
        <div style={{ marginBottom: 12 }}>
          {!showCreatePost ? (
            <button onClick={() => setShowCreatePost(true)} style={{ width: '100%', background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left' }}>
              <Avatar name={user.name} size={32} />
              <span style={{ fontSize: 12, color: C.faint }}>Compartilhe algo na comunidade...</span>
            </button>
          ) : (
            <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 12 }}>
              <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="O que você quer compartilhar?" rows={3} style={{ width: '100%', background: 'transparent', border: 'none', color: C.text, fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              {newPostImage ? (
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <img src={newPostImage} style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8 }} />
                  <button onClick={() => setNewPostImage('')} style={{ position: 'absolute', top: 6, right: 6, background: '#000a', border: 'none', borderRadius: '50%', width: 24, height: 24, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                </div>
              ) : (
                <button onClick={() => postImageInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#12152a', border: `0.5px solid ${C.line2}`, borderRadius: 6, padding: '6px 10px', color: C.muted, fontSize: 11, cursor: 'pointer', marginBottom: 8 }}>
                  <Camera size={13} /> {uploadingField === 'postImage' ? 'Enviando...' : 'Adicionar imagem'}
                </button>
              )}
              <input ref={postImageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadPostImage(f); e.target.value = ''; }} />
              <div style={{ marginBottom: 8 }}><LocationPicker value={newPostLocation} onChange={setNewPostLocation} /></div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowCreatePost(false)} style={btnGhost}>Cancelar</button>
                <button onClick={handleCreatePost} disabled={saving} style={btnGold}>{saving ? 'Publicando...' : 'Publicar'}</button>
              </div>
            </div>
          )}
        </div>
      )}
      {posts.length === 0 ? <Empty text="Nenhum post ainda. Seja o primeiro!" /> : posts.map(post => (
        <div key={post.id} style={{ background: C.card2, borderRadius: 12, marginBottom: 12, overflow: 'hidden', border: `0.5px solid ${C.line}` }}>
          <div style={{ padding: '10px 12px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar src={post.authorAvatar} name={post.authorName} size={32} onClick={() => openProfile(post.authorId)} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span onClick={() => openProfile(post.authorId)} style={{ fontSize: 12, color: C.text, fontWeight: 500, cursor: 'pointer' }}>{post.authorName}</span>
                  <BeltTag belt={post.authorBelt} />
                  {post.authorVerified && <CheckCircle size={11} style={{ color: C.gold }} />}
                </div>
                {post.locationName && (
                  <a href={post.locationLat != null ? `https://www.google.com/maps?q=${post.locationLat},${post.locationLng}` : undefined} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: C.muted, textDecoration: 'none' }}>
                    <MapPin size={10} style={{ color: C.gold }} /> {String(post.locationName).split(',').slice(0, 2).join(',')}
                  </a>
                )}
                <span style={{ fontSize: 10, color: C.faint, display: 'block' }}>{timeAgo(post.createdAt)}</span>
              </div>
            </div>
            {(post.authorId === user.id || canModerate) && (
              <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.faint }}><Trash2 size={14} /></button>
            )}
          </div>
          {post.imageUrl && <img src={post.imageUrl} style={{ width: '100%', maxHeight: 340, objectFit: 'cover' }} />}
          <div style={{ padding: '8px 12px' }}>
            <p style={{ fontSize: 13, color: C.text, margin: '0 0 8px', lineHeight: 1.5 }}>{post.content}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => handleLike(post.id)} style={{ ...iconBtn, color: post.isLiked ? '#e74c3c' : C.muted }}><Heart size={17} fill={post.isLiked ? '#e74c3c' : 'none'} /> {Number(post.likesCount || 0)}</button>
                <button onClick={() => { setShowComments(p => ({ ...p, [post.id]: !p[post.id] })); if (!postComments[post.id]) loadComments(post.id); }} style={{ ...iconBtn, color: C.muted }}><MessageSquare size={17} /> {Number(post.commentsCount || 0)}</button>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><Bookmark size={17} /></button>
            </div>
            {showComments[post.id] && (
              <div style={{ borderTop: `0.5px solid ${C.line}`, paddingTop: 8 }}>
                {(postComments[post.id] || []).map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <Avatar src={c.authorAvatar} name={c.authorName} size={24} onClick={() => openProfile(c.authorId)} />
                    <div style={{ background: C.card, borderRadius: 8, padding: '5px 8px', flex: 1 }}>
                      <span style={{ fontSize: 11, color: C.gold, fontWeight: 500 }}>{c.authorName} </span>
                      <span style={{ fontSize: 11, color: C.text }}>{c.content}</span>
                    </div>
                  </div>
                ))}
                {isMember && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <Avatar name={user.name} size={24} />
                    <input value={commentInputs[post.id] || ''} onChange={e => setCommentInputs(p => ({ ...p, [post.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleComment(post.id)} placeholder="Comentar..." style={{ flex: 1, background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 20, padding: '5px 12px', color: C.text, fontSize: 12, outline: 'none' }} />
                    <button onClick={() => handleComment(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gold }}><Send size={16} /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const ForumTab = () => (
    <div>
      {isMember && (
        <div style={{ marginBottom: 12 }}>
          {!showNewTopic ? (
            <button onClick={() => setShowNewTopic(true)} style={{ width: '100%', ...btnGoldFull }}><Plus size={14} /> Novo tópico</button>
          ) : (
            <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 12 }}>
              <input value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} placeholder="Título do tópico *" style={inputDark} />
              <textarea value={newTopicContent} onChange={e => setNewTopicContent(e.target.value)} placeholder="Conteúdo *" rows={3} style={{ ...inputDark, resize: 'none', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowNewTopic(false)} style={btnGhost}>Cancelar</button>
                <button onClick={handleCreateTopic} disabled={saving} style={btnGold}>{saving ? 'Criando...' : 'Criar tópico'}</button>
              </div>
            </div>
          )}
        </div>
      )}
      {topics.length === 0 ? <Empty text="Nenhum tópico ainda. Inicie a discussão!" /> : (
        <>
          {topics.map(t => (
            <div key={t.id} onClick={() => openTopic(t)} style={{ background: C.card, border: `0.5px solid ${t.isPinned ? '#c9a84c44' : C.line}`, borderRadius: 10, padding: '10px 12px', marginBottom: 8, cursor: 'pointer' }}>
              {t.isPinned && <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}><Pin size={10} style={{ color: C.gold }} /><span style={{ fontSize: 9, color: C.gold, fontWeight: 500, textTransform: 'uppercase' }}>Fixado</span></div>}
              <p style={{ fontSize: 13.5, color: C.text, fontWeight: 500, margin: '0 0 4px' }}>{t.title}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 10, color: C.faint, margin: 0 }}>por {t.authorName} · última atividade {timeAgo(t.updatedAt || t.createdAt)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: C.muted, fontSize: 10 }}><MessageSquare size={11} /> {t.replyCount} · <Users size={10} /> {t.viewCount}</div>
              </div>
            </div>
          ))}
          <Pager page={topicsPage} totalPages={topicsTotalPages} onPage={p => fetchTopics(selected.id, p)} />
        </>
      )}
    </div>
  );

  const PollsTab = () => {
    const now = Date.now();
    return (
      <div>
        {isMember && (
          <div style={{ marginBottom: 12 }}>
            {!showNewPoll ? (
              <button onClick={() => setShowNewPoll(true)} style={{ width: '100%', ...btnGoldFull }}><BarChart2 size={14} /> Nova enquete</button>
            ) : (
              <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 12 }}>
                <input value={pollForm.question} onChange={e => setPollForm(p => ({ ...p, question: e.target.value }))} placeholder="Pergunta da enquete *" style={inputDark} />
                {pollForm.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <input value={opt} onChange={e => setPollForm(p => ({ ...p, options: p.options.map((o, j) => j === i ? e.target.value : o) }))} placeholder={`Opção ${i + 1}`} style={{ ...inputDark, marginBottom: 0 }} />
                    {pollForm.options.length > 2 && <button onClick={() => setPollForm(p => ({ ...p, options: p.options.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer' }}><X size={16} /></button>}
                  </div>
                ))}
                {pollForm.options.length < 6 && <button onClick={() => setPollForm(p => ({ ...p, options: [...p.options, ''] }))} style={{ background: 'none', border: 'none', color: C.gold, fontSize: 11, cursor: 'pointer', marginBottom: 8 }}>+ Adicionar opção</button>}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button onClick={() => setShowNewPoll(false)} style={btnGhost}>Cancelar</button>
                  <button onClick={handleCreatePoll} disabled={saving} style={btnGold}>{saving ? 'Criando...' : 'Criar enquete'}</button>
                </div>
              </div>
            )}
          </div>
        )}
        {polls.length === 0 ? <Empty text="Nenhuma enquete ainda." /> : polls.map(poll => {
          const total = Number(poll.totalVotes || 0);
          const voted = !!poll.myVote;
          const expired = poll.expiresAt && new Date(poll.expiresAt).getTime() < now;
          return (
            <div key={poll.id} style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <p style={{ fontSize: 14, color: C.text, fontWeight: 500, margin: '0 0 10px' }}>{poll.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {(poll.options || []).map((o: any) => {
                  const pct = total > 0 ? Math.round((Number(o.votesCount) / total) * 100) : 0;
                  const mine = poll.myVote === o.id;
                  const showResult = voted || expired;
                  return showResult ? (
                    <div key={o.id} style={{ position: 'relative', background: C.card2, borderRadius: 8, overflow: 'hidden', border: `0.5px solid ${mine ? C.gold : C.line}` }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct}%`, background: mine ? '#c9a84c33' : '#ffffff0d' }} />
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: 12.5 }}>
                        <span style={{ color: mine ? C.gold : C.text }}>{mine && '✓ '}{o.text}</span>
                        <span style={{ color: C.muted }}>{pct}%</span>
                      </div>
                    </div>
                  ) : (
                    <button key={o.id} onClick={() => isMember && handleVote(poll.id, o.id)} disabled={!isMember} style={{ textAlign: 'left', background: C.card2, border: `0.5px solid ${C.line2}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12.5, cursor: isMember ? 'pointer' : 'default' }}>{o.text}</button>
                  );
                })}
              </div>
              <p style={{ fontSize: 10, color: C.faint, margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                {total} voto{total !== 1 ? 's' : ''} · por {poll.authorName}{expired ? ' · encerrada' : poll.expiresAt ? ` · encerra ${fmtDate(poll.expiresAt)}` : ''}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const EventsTab = () => (
    <div>
      {isMember && (
        <div style={{ marginBottom: 12 }}>
          {!showNewEvent ? (
            <button onClick={() => setShowNewEvent(true)} style={{ width: '100%', ...btnGoldFull }}><Calendar size={14} /> Novo evento</button>
          ) : (
            <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 12 }}>
              <input value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} placeholder="Título do evento *" style={inputDark} />
              <textarea value={eventForm.description} onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição" rows={2} style={{ ...inputDark, resize: 'none', fontFamily: 'inherit' }} />
              <input type="datetime-local" value={eventForm.eventDate} onChange={e => setEventForm(p => ({ ...p, eventDate: e.target.value }))} style={inputDark} />
              <input value={eventForm.location} onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))} placeholder="Local (opcional)" style={inputDark} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowNewEvent(false)} style={btnGhost}>Cancelar</button>
                <button onClick={handleCreateEvent} disabled={saving} style={btnGold}>{saving ? 'Criando...' : 'Criar evento'}</button>
              </div>
            </div>
          )}
        </div>
      )}
      {events.length === 0 ? <Empty text="Nenhum evento agendado." /> : events.map(ev => (
        <div key={ev.id} style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ background: C.card2, borderRadius: 8, padding: '6px 10px', textAlign: 'center', flexShrink: 0, border: `0.5px solid ${C.line2}` }}>
              <div style={{ fontSize: 18, color: C.gold, fontWeight: 600, lineHeight: 1 }}>{new Date(ev.eventDate).getDate()}</div>
              <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase' }}>{new Date(ev.eventDate).toLocaleDateString('pt-BR', { month: 'short' })}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, color: C.text, fontWeight: 500, margin: '0 0 3px' }}>{ev.title}</p>
              <p style={{ fontSize: 11, color: C.muted, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {fmtDateTime(ev.eventDate)}</p>
              {ev.location && <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {ev.location}</p>}
            </div>
          </div>
          {ev.description && <p style={{ fontSize: 12, color: C.text, margin: '10px 0 0', lineHeight: 1.5 }}>{ev.description}</p>}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {[{ k: 'going', l: 'Vou', c: Number(ev.goingCount || 0) }, { k: 'maybe', l: 'Talvez', c: Number(ev.maybeCount || 0) }, { k: 'not_going', l: 'Não vou' }].map(b => (
              <button key={b.k} onClick={() => isMember && handleRsvp(ev.id, b.k)} disabled={!isMember} style={{ flex: 1, background: ev.myStatus === b.k ? '#c9a84c22' : C.card2, border: `0.5px solid ${ev.myStatus === b.k ? C.gold : C.line2}`, borderRadius: 8, padding: '6px', fontSize: 11, color: ev.myStatus === b.k ? C.gold : C.muted, cursor: isMember ? 'pointer' : 'default' }}>
                {b.l}{b.c !== undefined ? ` (${b.c})` : ''}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const MembersTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {members.map(m => (
        <div key={m.id} onClick={() => openProfile(m.userId)} style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Avatar src={m.avatar} name={m.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>{m.name}</span>
              <BeltTag belt={m.belt} />
              {m.isVerified && <CheckCircle size={11} style={{ color: C.gold }} />}
            </div>
            <span style={{ fontSize: 10, color: C.faint }}>{m.academy || ''}</span>
          </div>
          <div style={{ flexShrink: 0 }}>
            {m.role === 'owner' && <Crown size={14} style={{ color: C.gold }} />}
            {m.role === 'moderator' && <Shield size={14} style={{ color: C.muted }} />}
          </div>
        </div>
      ))}
    </div>
  );

  const AdminTab = () => {
    const d = adminDash;
    const cards = [
      { label: 'Membros', value: d?.totalMembers ?? '—' },
      { label: 'Convites Enviados', value: d?.totalInvitesSent ?? '—' },
      { label: 'Convites Aceitos', value: d?.totalInvitesAccepted ?? '—' },
      { label: 'JT Ganhos', value: d?.totalRewardsEarned ?? '—' },
    ];
    const paidUntilTxt = d?.paidUntil ? new Date(d.paidUntil).toLocaleDateString('pt-BR') : '—';
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 14 }}>
          {cards.map(c => (
            <div key={c.label} style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 22, color: C.gold, fontWeight: 700 }}>{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: C.card, border: `0.5px solid ${d?.isActive === false ? '#c0392b55' : C.line}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 13, color: C.text, fontWeight: 500, margin: 0 }}>Mensalidade da comunidade</p>
              <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>
                {d?.isActive === false ? 'Vencida — comunidade inativa' : `Ativa até ${paidUntilTxt}`} · {Number(d?.monthlyFee ?? 5000).toLocaleString()} JT/mês
              </p>
            </div>
            <button onClick={handlePayFee} disabled={payingFee} style={{ ...btnGold, opacity: payingFee ? 0.5 : 1 }}>
              {payingFee ? 'Processando...' : `Pagar ${Number(d?.monthlyFee ?? 5000).toLocaleString()} JT`}
            </button>
          </div>
        </div>

        <p style={sectionLabel}>Recompensas recentes</p>
        {(!d?.recentRewards || d.recentRewards.length === 0) ? <Empty text="Nenhuma recompensa ainda." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {d.recentRewards.map((r: any) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 10, padding: '8px 12px' }}>
                <Avatar src={r.userAvatar} name={r.userName} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: C.text, margin: 0 }}>{r.userName || 'Usuário'}</p>
                  <p style={{ fontSize: 10, color: C.faint, margin: 0 }}>{r.reason === 'SIGNUP_COMPLETED' ? 'Cadastro completo' : 'Convite aceito'} · {timeAgo(r.createdAt)}</p>
                </div>
                <span style={{ fontSize: 12, color: '#2ecc71', fontWeight: 600 }}>+{r.amount} JT</span>
              </div>
            ))}
          </div>
        )}

        <p style={sectionLabel}>Histórico de pagamentos</p>
        {(!d?.paymentHistory || d.paymentHistory.length === 0) ? <Empty text="Nenhum pagamento ainda." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.paymentHistory.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 10, padding: '8px 12px' }}>
                <div>
                  <p style={{ fontSize: 12, color: C.text, margin: 0 }}>{p.type === 'REACTIVATION' ? 'Reativação' : 'Mensalidade'}</p>
                  <p style={{ fontSize: 10, color: C.faint, margin: 0 }}>{new Date(p.periodStart).toLocaleDateString('pt-BR')} → {new Date(p.periodEnd).toLocaleDateString('pt-BR')}</p>
                </div>
                <span style={{ fontSize: 12, color: '#e74c3c', fontWeight: 600 }}>-{p.amount} JT</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const TabContent = () => {
    if (innerTab === 'feed') return FeedTab();
    if (innerTab === 'forum') return ForumTab();
    if (innerTab === 'polls') return PollsTab();
    if (innerTab === 'events') return EventsTab();
    if (innerTab === 'members') return MembersTab();
    if (innerTab === 'lives') return <CommunityLives community={selected} user={user} canModerate={canModerate} isOwner={isOwner} myRole={myRole} showToast={showToast} />;
    if (innerTab === 'admin') return AdminTab();
    return null;
  };

  const TABS: { id: InnerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'feed', label: 'Feed', icon: <Camera size={13} /> },
    { id: 'forum', label: 'Fórum', icon: <MessageSquare size={13} /> },
    { id: 'polls', label: 'Enquetes', icon: <BarChart2 size={13} /> },
    { id: 'events', label: 'Eventos', icon: <Calendar size={13} /> },
    { id: 'lives', label: 'Lives', icon: <Radio size={13} /> },
    { id: 'members', label: 'Membros', icon: <Users size={13} /> },
    ...(isOwner ? [{ id: 'admin' as InnerTab, label: 'Painel Admin', icon: <Shield size={13} /> }] : []),
  ];

  // ========================= RENDER =========================
  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text, fontFamily: 'var(--font-sans)' }}>
      {/* ABAS PRINCIPAIS */}
      <div style={{ display: 'flex', borderBottom: `0.5px solid ${C.line}`, background: '#0d0f1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setMainTab('feed')} style={topTabStyle(mainTab === 'feed')}>Feed Geral</button>
        <button onClick={() => { setMainTab('communities'); setView('list'); }} style={topTabStyle(mainTab === 'communities')}>Comunidades</button>
      </div>

      {mainTab === 'feed' && <FeedInstagram user={user} showToast={showToast} />}

      {mainTab === 'communities' && (
        <div>

          {/* ================= LISTA ================= */}
          {view === 'list' && (
            <div className="max-w-2xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ color: C.gold, fontSize: 20, fontWeight: 500 }}>Comunidades</h2>
                <button onClick={() => { setEditingId(null); setCreateForm({ name: '', description: '', rules: '', category: 'Técnicas', isPrivate: false, coverImage: '', avatar: '', locale: 'Português', location: '' }); setView('create'); }} style={{ ...btnGold, display: 'flex', alignItems: 'center', gap: 5 }}><Plus size={14} /> Criar</button>
              </div>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar comunidades..." style={{ width: '100%', background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 10, padding: '8px 8px 8px 32px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{ flexShrink: 0, background: category === cat ? '#c9a84c22' : C.card, border: `0.5px solid ${category === cat ? C.gold : C.line2}`, borderRadius: 20, padding: '4px 12px', fontSize: 11, color: category === cat ? C.gold : C.muted, cursor: 'pointer', whiteSpace: 'nowrap' }}>{cat}</button>
                ))}
              </div>
              {myCommunities.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={sectionLabel}>Suas comunidades</p>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {myCommunities.map(c => (
                      <button key={c.id} onClick={() => openCommunity(c)} style={{ flexShrink: 0, background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 10, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <Avatar src={c.avatar} name={c.name} size={24} />
                        <span style={{ fontSize: 11, color: C.text, whiteSpace: 'nowrap' }}>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p style={sectionLabel}>Descobrir</p>
              {loading ? <div style={{ textAlign: 'center', padding: '40px 0', color: C.faint, fontSize: 13 }}>Carregando...</div>
                : communities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Users size={40} style={{ color: C.line2, margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ color: C.faint, fontSize: 13 }}>Nenhuma comunidade encontrada.</p>
                    <button onClick={() => setView('create')} style={{ ...btnGold, marginTop: 12 }}>Criar a primeira</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {communities.map(c => (
                      <div key={c.id} style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }} onClick={() => openCommunity(c)}>
                        {c.coverImage ? <img src={c.coverImage} style={{ width: '100%', height: 80, objectFit: 'cover' }} /> : <div style={{ height: 60, background: 'linear-gradient(135deg, #1a1d2e, #0d1033)' }} />}
                        <div style={{ padding: '8px 12px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: c.coverImage ? 0 : -20 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                            <div style={{ border: '2px solid #0d0f1a', borderRadius: '50%' }}><Avatar src={c.avatar} name={c.name} size={40} /></div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <p style={{ fontSize: 13, color: C.text, fontWeight: 500, margin: 0 }}>{c.name}</p>
                                {c.isPrivate && <Lock size={10} style={{ color: C.muted }} />}
                                {c.hasActiveLive && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#e0245e', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 5, padding: '1px 5px' }}><Radio size={9} /> AO VIVO</span>}
                              </div>
                              <p style={{ fontSize: 10, color: C.faint, margin: 0 }}>{c.category} · {Number(c.memberCount || 0).toLocaleString()} membros · {Number(c.weeklyPosts || 0)} posts esta semana</p>
                            </div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); handleJoin(c.id); }} style={{ background: c.isMember ? C.card : 'transparent', border: `0.5px solid ${c.isMember ? C.line2 : C.gold}`, color: c.isMember ? C.muted : C.gold, borderRadius: 8, padding: '5px 12px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>{c.isMember ? 'Membro' : 'Entrar'}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* ================= CRIAR / EDITAR ================= */}
          {view === 'create' && (
            <div className="max-w-2xl mx-auto px-4 py-4">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setView(editingId ? 'detail' : 'list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><ChevronLeft size={20} /></button>
                  <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>{editingId ? 'Editar comunidade' : 'Criar comunidade'}</span>
                </div>
                <button onClick={editingId ? handleUpdateCommunity : handleCreateCommunity} disabled={saving} style={{ ...btnGold, opacity: saving ? 0.5 : 1 }}>{saving ? 'Salvando...' : (editingId ? 'Salvar' : 'Criar')}</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                  {/* Banner (coverImage) */}
                  <div onClick={() => bannerInputRef.current?.click()}
                    style={{ flex: 1, position: 'relative', height: 90, borderRadius: 10, cursor: 'pointer', overflow: 'hidden', border: `1px dashed ${C.line2}`, background: createForm.coverImage ? `url(${createForm.coverImage}) center/cover` : C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!createForm.coverImage && (
                      <div style={{ textAlign: 'center' }}>
                        <Camera size={20} style={{ color: C.faint, margin: '0 auto 4px', display: 'block' }} />
                        <span style={{ fontSize: 11, color: C.faint }}>{uploadingField === 'coverImage' ? 'Enviando...' : 'Banner da comunidade'}</span>
                      </div>
                    )}
                    {createForm.coverImage && (
                      <span style={{ position: 'absolute', bottom: 6, right: 8, background: '#000a', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Camera size={11} /> {uploadingField === 'coverImage' ? 'Enviando...' : 'Trocar'}
                      </span>
                    )}
                  </div>
                  {/* Foto/avatar da comunidade */}
                  <div onClick={() => avatarInputRef.current?.click()}
                    style={{ width: 90, height: 90, borderRadius: '50%', cursor: 'pointer', flexShrink: 0, border: `1px dashed ${C.line2}`, background: createForm.avatar ? `url(${createForm.avatar}) center/cover` : C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                    {!createForm.avatar && <Camera size={16} style={{ color: C.faint }} />}
                    {!createForm.avatar && <span style={{ fontSize: 8, color: C.faint }}>{uploadingField === 'avatar' ? '...' : 'Foto'}</span>}
                  </div>
                  <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadImage(f, 'coverImage'); e.target.value = ''; }} />
                  <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadImage(f, 'avatar'); e.target.value = ''; }} />
                </div>
                {[
                  { label: 'Nome da comunidade *', key: 'name', ph: 'Ex: Leg Lock Nação BR', rows: 1 },
                  { label: 'Descrição', key: 'description', ph: 'Fale sobre sua comunidade...', rows: 2 },
                  { label: 'Regras', key: 'rules', ph: 'Regras da comunidade...', rows: 2 },
                ].map(f => (
                  <div key={f.key}>
                    <p style={fieldLabel}>{f.label}</p>
                    <textarea value={(createForm as any)[f.key]} onChange={e => setCreateForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} rows={f.rows} style={{ ...inputDark, marginBottom: 0, resize: 'none', fontFamily: 'inherit' }} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={fieldLabel}>Categoria *</p>
                    <select value={createForm.category} onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputDark, marginBottom: 0 }}>
                      {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={fieldLabel}>Idioma</p>
                    <input value={createForm.locale} onChange={e => setCreateForm(p => ({ ...p, locale: e.target.value }))} placeholder="Português" style={{ ...inputDark, marginBottom: 0 }} />
                  </div>
                </div>
                <div>
                  <p style={fieldLabel}>Local</p>
                  <input value={createForm.location} onChange={e => setCreateForm(p => ({ ...p, location: e.target.value }))} placeholder="Ex: São Paulo, Brasil" style={{ ...inputDark, marginBottom: 0 }} />
                </div>
                <div>
                  <p style={fieldLabel}>Privacidade</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ val: false, icon: <Globe size={16} />, label: 'Pública' }, { val: true, icon: <Lock size={16} />, label: 'Privada' }].map(opt => (
                      <button key={String(opt.val)} onClick={() => setCreateForm(p => ({ ...p, isPrivate: opt.val }))} style={{ flex: 1, background: createForm.isPrivate === opt.val ? '#c9a84c22' : C.card, border: `0.5px solid ${createForm.isPrivate === opt.val ? C.gold : C.line2}`, borderRadius: 8, padding: 10, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: createForm.isPrivate === opt.val ? C.gold : C.faint }}>{opt.icon}</span>
                        <span style={{ fontSize: 11, color: createForm.isPrivate === opt.val ? C.gold : C.faint }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {!editingId && (
                  <div style={{ background: C.card, border: '0.5px solid #c9a84c44', borderRadius: 10, padding: 10, display: 'flex', gap: 8 }}>
                    <AlertCircle size={14} style={{ color: C.gold, flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: '#c9a84c88', margin: 0 }}>Você pode criar apenas 1 comunidade. Para criar uma nova, delete a atual.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= DETALHE (ORKUT) ================= */}
          {view === 'detail' && selected && (
            <div style={{ maxWidth: 1080, margin: '0 auto', padding: isDesktop ? '0 16px 24px' : '0' }}>

              {/* breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 11, color: C.faint, padding: isDesktop ? '14px 4px 10px' : '10px 14px 8px' }}>
                <span onClick={() => setMainTab('feed')} style={{ cursor: 'pointer' }}>Início</span>
                <ChevronRight size={11} />
                <span onClick={() => setView('list')} style={{ cursor: 'pointer' }}>Comunidades</span>
                <ChevronRight size={11} />
                <span onClick={() => { setCategory(selected.category); setView('list'); }} style={{ cursor: 'pointer' }}>{selected.category}</span>
                <ChevronRight size={11} />
                <span style={{ color: C.gold }}>{selected.name}</span>
              </div>

              {/* banner + cabeçalho */}
              <div style={{ position: 'relative' }}>
                <div style={{ height: isDesktop ? 140 : 100, borderRadius: isDesktop ? 14 : 0, background: selected.coverImage ? `url(${selected.coverImage}) center/cover` : 'linear-gradient(135deg, #1a1030, #0d1033)' }} />
                {!isDesktop && <button onClick={() => setView('list')} style={{ position: 'absolute', top: 10, left: 10, background: '#0008', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ChevronLeft size={18} /></button>}
              </div>

              <div style={{ padding: isDesktop ? '0 4px' : '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -28, marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                    <div style={{ position: 'relative', zIndex: 10, border: '4px solid #080a12', borderRadius: '50%', lineHeight: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}><Avatar src={selected.avatar} name={selected.name} size={64} /></div>
                    <div style={{ paddingBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <p style={{ fontSize: 17, color: C.text, fontWeight: 600, margin: 0 }}>{selected.name}</p>
                        {selected.isPrivate && <Lock size={12} style={{ color: C.muted }} />}
                      </div>
                      <p style={{ fontSize: 11, color: C.faint, margin: '2px 0 0' }}>{selected.category} · {Number(selected.memberCount || 0).toLocaleString()} membros</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button onClick={() => setShowInviteModal(true)} style={{ background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 8, padding: '6px 12px', color: C.muted, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><UserPlus size={13} /> Convidar</button>
                    <button onClick={() => setShowReport(true)} style={{ background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 8, padding: '6px 10px', color: C.muted, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Flag size={13} /> {isDesktop ? 'Denunciar' : ''}</button>
                    <button onClick={() => handleJoin(selected.id)} style={{ background: isMember ? C.card : C.gold, color: isMember ? C.muted : '#000', border: `0.5px solid ${isMember ? C.line2 : C.gold}`, borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{isMember ? 'Deixar' : 'Participar'}</button>
                  </div>
                </div>
              </div>

              {/* banner de live acontecendo agora */}
              {selected.hasActiveLive && innerTab !== 'lives' && (
                <div onClick={() => setInnerTab('lives')} style={{ margin: isDesktop ? '12px 0 0' : '12px 14px 0', background: '#e0245e1a', border: '0.5px solid #e0245e55', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Radio size={16} style={{ color: '#e0245e', flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: '#f0b8c4' }}>Live acontecendo agora nesta comunidade!</span>
                  </div>
                  <span style={{ background: '#e0245e', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>Assistir</span>
                </div>
              )}

              {/* banner de comunidade inativa (pagamento vencido) */}
              {selected.isActive === false && (
                <div style={{ margin: isDesktop ? '12px 0 0' : '12px 14px 0', background: '#c0392b1a', border: '0.5px solid #c0392b55', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={16} style={{ color: '#e74c3c', flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: '#e8b4b0' }}>
                      {isOwner ? 'Comunidade inativa — pagamento vencido.' : 'Comunidade temporariamente inativa.'}
                    </span>
                  </div>
                  {isOwner && (
                    <button onClick={handlePayFee} disabled={payingFee} style={{ background: '#c9a84c', color: '#000', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: payingFee ? 0.5 : 1 }}>
                      {payingFee ? 'Processando...' : `Reativar por ${Number(selected.monthlyFee ?? 5000).toLocaleString()} JT`}
                    </button>
                  )}
                </div>
              )}

              {/* corpo adaptativo */}
              <div style={{ display: isDesktop ? 'flex' : 'block', gap: 20, marginTop: 12, alignItems: 'flex-start' }}>
                {/* mobile: info no topo */}
                {!isDesktop && <div style={{ padding: '0 14px', marginBottom: 12 }}>{InfoCard()}</div>}

                {/* coluna principal */}
                <div style={{ flex: 1, minWidth: 0, padding: isDesktop ? 0 : '0 14px' }}>
                  {/* tabs */}
                  <div style={{ display: 'flex', borderBottom: `0.5px solid ${C.line}`, marginBottom: 14, overflowX: 'auto' }}>
                    {TABS.map(t => (
                      <button key={t.id} onClick={() => { setInnerTab(t.id); if (t.id === 'admin') fetchAdminDashboard(selected.id); }} style={{ flex: isDesktop ? 'none' : 1, minWidth: isDesktop ? 88 : 'auto', padding: '10px 14px', textAlign: 'center', fontSize: 12, color: innerTab === t.id ? C.gold : C.faint, background: 'none', border: 'none', borderBottom: `2px solid ${innerTab === t.id ? C.gold : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                  {TabContent()}
                </div>

                {/* sidebar desktop */}
                {isDesktop && (
                  <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {InfoCard()}
                    {MembersWidget({ horizontal: false })}
                    {RelatedWidget({ horizontal: false })}
                  </div>
                )}

                {/* mobile: membros + relacionadas embaixo */}
                {!isDesktop && (
                  <div style={{ padding: '4px 14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {MembersWidget({ horizontal: true })}
                    {RelatedWidget({ horizontal: true })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TÓPICO ================= */}
          {view === 'topic' && selectedTopic && (
            <div className="max-w-2xl mx-auto px-4 py-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <button onClick={() => setView('detail')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><ChevronLeft size={20} /></button>
                <span style={{ fontSize: 14, fontWeight: 500, color: C.text, flex: 1 }}>Tópico</span>
                {canModerate && (
                  <button onClick={() => handlePinTopic(selectedTopic.id, selectedTopic.isPinned)} style={{ background: selectedTopic.isPinned ? '#c9a84c22' : C.card, border: `0.5px solid ${selectedTopic.isPinned ? C.gold : C.line2}`, borderRadius: 8, padding: '4px 10px', color: selectedTopic.isPinned ? C.gold : C.muted, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Pin size={11} /> {selectedTopic.isPinned ? 'Desafixar' : 'Fixar'}</button>
                )}
              </div>
              <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <p style={{ fontSize: 15, color: C.text, fontWeight: 500, margin: '0 0 8px' }}>{selectedTopic.title}</p>
                <p style={{ fontSize: 13, color: C.text, margin: '0 0 10px', lineHeight: 1.6 }}>{selectedTopic.content}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar src={selectedTopic.authorAvatar} name={selectedTopic.authorName} size={24} onClick={() => openProfile(selectedTopic.authorId)} />
                  <span style={{ fontSize: 11, color: C.faint }}>{selectedTopic.authorName} · {timeAgo(selectedTopic.createdAt)} · {selectedTopic.viewCount} visualizações</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: C.faint, margin: '0 0 10px' }}>{selectedTopic.replyCount} resposta{selectedTopic.replyCount !== 1 ? 's' : ''}</p>
              {replies.map(r => (
                <div key={r.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <Avatar src={r.authorAvatar} name={r.authorName} size={32} onClick={() => openProfile(r.authorId)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ background: C.card, border: `0.5px solid ${C.line}`, borderRadius: 10, padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        <span onClick={() => openProfile(r.authorId)} style={{ fontSize: 12, color: C.gold, fontWeight: 500, cursor: 'pointer' }}>{r.authorName}</span>
                        <BeltTag belt={r.authorBelt} />
                        {r.authorVerified && <CheckCircle size={10} style={{ color: C.gold }} />}
                      </div>
                      <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.5 }}>{r.content}</p>
                    </div>
                    <span style={{ fontSize: 10, color: C.faint, marginLeft: 8 }}>{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
              ))}
              <Pager page={repliesPage} totalPages={repliesTotalPages} onPage={p => openTopic(selectedTopic, p)} />
              {isMember && !selectedTopic.isLocked && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Avatar name={user.name} size={32} />
                  <div style={{ flex: 1, background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 10, padding: '8px 12px' }}>
                    <textarea value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Escreva sua resposta..." rows={2} style={{ width: '100%', background: 'transparent', border: 'none', color: C.text, fontSize: 12, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={handleReply} disabled={saving} style={btnGold}>{saving ? 'Enviando...' : 'Responder'}</button>
                    </div>
                  </div>
                </div>
              )}
              {selectedTopic.isLocked && <div style={{ textAlign: 'center', padding: 12, color: C.faint, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Lock size={12} /> Tópico bloqueado</div>}
            </div>
          )}
        </div>
      )}

      {/* MODAL CONVIDAR */}
      {showInviteModal && selected && (
        <CommunityInviteModal
          communityId={selected.id}
          communityName={selected.name}
          slug={selected.slug}
          showToast={showToast}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* MODAL DENÚNCIA */}
      {showReport && (
        <div onClick={() => setShowReport(false)} style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 14, padding: 18, width: '100%', maxWidth: 380 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Flag size={16} style={{ color: C.gold }} /><span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>Denunciar comunidade</span></div>
            <textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Descreva o motivo da denúncia..." rows={4} style={{ ...inputDark, resize: 'none', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReport(false)} style={btnGhost}>Cancelar</button>
              <button onClick={handleReport} disabled={saving} style={btnGold}>{saving ? 'Enviando...' : 'Enviar denúncia'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // handler declarado após return via hoisting não funciona para const; definimos aqui como function
  async function handleUpdateCommunity() {
    if (!selected) return;
    setSaving(true);
    const res = await authFetch(`/api/communities/${selected.id}`, { method: 'PUT', body: JSON.stringify(createForm) });
    if (res.ok) { showToast('Comunidade atualizada!', 'success'); setEditingId(null); await refreshDetail(selected.id); setView('detail'); }
    else { const d = await res.json(); showToast(d.error || 'Erro ao atualizar', 'error'); }
    setSaving(false);
  }
}

// ---- estilos reutilizáveis ----
const topTabStyle = (active: boolean): React.CSSProperties => ({ flex: 1, padding: '12px 0', textAlign: 'center', fontSize: 13, color: active ? '#c9a84c' : '#4a5075', background: 'none', border: 'none', borderBottom: `2px solid ${active ? '#c9a84c' : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 500 : 400 });
const btnGold: React.CSSProperties = { background: '#c9a84c', color: '#000', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' };
const btnGoldFull: React.CSSProperties = { background: '#c9a84c', border: 'none', borderRadius: 10, padding: 10, color: '#000', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 };
const btnGhost: React.CSSProperties = { background: 'none', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '6px 12px', color: '#7b83b0', fontSize: 11, cursor: 'pointer' };
const iconBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 };
const inputDark: React.CSSProperties = { width: '100%', background: '#12152a', border: '0.5px solid #2a2d45', borderRadius: 6, padding: '8px 10px', color: '#c0c5e0', fontSize: 12, outline: 'none', marginBottom: 8, boxSizing: 'border-box' };
const sectionLabel: React.CSSProperties = { fontSize: 10, color: '#c9a84c', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 };
const fieldLabel: React.CSSProperties = { fontSize: 10, color: '#7b83b0', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' };

function Avatar({ src, name, size, onClick }: { src?: string; name?: string; size: number; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ width: size, height: size, borderRadius: '50%', background: '#2a2d45', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default' }}>
      {src ? <img src={src} style={{ width: size, height: size, objectFit: 'cover' }} /> : <span style={{ fontSize: size * 0.4, color: '#c9a84c', fontWeight: 500 }}>{(name || '?')[0]?.toUpperCase()}</span>}
    </div>
  );
}

function BeltTag({ belt }: { belt?: string }) {
  if (!belt) return null;
  return <span style={{ background: BELT_COLORS[belt] || '#333', color: belt === 'WHITE' ? '#000' : '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 500 }}>{BELT_LABELS[belt] || belt}</span>;
}

function InfoRow({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ color: '#4a5075' }}>{label}</span>
      <span style={{ color: '#c0c5e0', display: 'flex', alignItems: 'center', gap: 4, textAlign: 'right' }}>{icon}{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ textAlign: 'center', padding: '30px 0', color: '#4a5075', fontSize: 13 }}>{text}</div>;
}

function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '10px 0' }}>
      <button onClick={() => page > 1 && onPage(page - 1)} disabled={page <= 1} style={{ background: 'none', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '4px 10px', color: page <= 1 ? '#2a2d45' : '#c0c5e0', fontSize: 11, cursor: page <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><ChevronLeft size={13} /> Anterior</button>
      <span style={{ fontSize: 11, color: '#7b83b0' }}>{page} / {totalPages}</span>
      <button onClick={() => page < totalPages && onPage(page + 1)} disabled={page >= totalPages} style={{ background: 'none', border: '0.5px solid #2a2d45', borderRadius: 8, padding: '4px 10px', color: page >= totalPages ? '#2a2d45' : '#c0c5e0', fontSize: 11, cursor: page >= totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>Próxima <ChevronRight size={13} /></button>
    </div>
  );
}
