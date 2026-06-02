/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Send, 
  Plus, 
  Sparkles, 
  Bookmark,
  Share2,
  Bell,
  BellRing,
  UserPlus,
  UserCheck,
  Hash,
  Activity,
  User,
  CheckCircle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { UserProfile, SocialPost, Comment, BeltRank } from '../types';

interface SocialFeedProps {
  user: UserProfile;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface NetworkUser {
  id: string;
  name: string;
  avatar: string;
  belt: string;
  role: string;
  level: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface SocialNotification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  linkTo?: string;
  createdAt: string;
}

export default function SocialFeed({ user, showToast }: SocialFeedProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [networkUsers, setNetworkUsers] = useState<NetworkUser[]>([]);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostCategory, setNewPostCategory] = useState<'Treino' | 'Dúvida' | 'Meme' | 'Campeonato'>('Treino');
  
  // Track open comment input per post ID
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch all Social Network Data from the actual SaaS Backend
  const loadSocialData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // 1. Fetch posts
      const postsRes = await fetch('/api/social/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        if (postsData && postsData.posts) {
          setPosts(postsData.posts);
        }
      }

      // 2. Fetch network users (follow options)
      const networkRes = await fetch('/api/social/network', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (networkRes.ok) {
        const networkData = await networkRes.json();
        if (networkData && networkData.network) {
          setNetworkUsers(networkData.network);
        }
      }

      // 3. Fetch notifications
      const notifRes = await fetch('/api/social/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (notifData && notifData.notifications) {
          setNotifications(notifData.notifications);
        }
      }
    } catch (err) {
      console.error("Failed to sync social network feed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSocialData();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPostContent,
          category: newPostCategory
        })
      });

      const data = await response.json();
      if (response.ok && data.post) {
        setPosts(prev => [data.post, ...prev]);
        setNewPostContent('');
        showToast("Seu rolo foi publicado com sucesso no feed!", "success");
        // Reload in background to sync any newly generated user structures
        loadSocialData();
      } else {
        showToast(data.error || "Erro ao publicar no feed", "error");
      }
    } catch (err) {
      showToast("Não foi possível conectar com o servidor.", "error");
    }
  };

  const toggleUpvote = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const alreadyUpvoted = p.hasUpvoted;
          return {
            ...p,
            upvotes: alreadyUpvoted ? p.upvotes - 1 : p.upvotes + 1,
            hasUpvoted: !alreadyUpvoted
          };
        }
        return p;
      }));

      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Sync correct server count
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              upvotes: data.upvotes,
              hasUpvoted: data.hasUpvoted
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/social/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: text })
      });

      const data = await response.json();
      if (response.ok && data.comment) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comments: [...p.comments, data.comment]
            };
          }
          return p;
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        showToast("Seu comentário foi publicado!", "success");
      } else {
        showToast(data.error || "Erro ao publicar comentário", "error");
      }
    } catch (err) {
      showToast("Falha de rede ao comentar.", "error");
    }
  };

  const handleToggleFollow = async (targetUserId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Optimistic Update in UI
      setNetworkUsers(prev => prev.map(u => {
        if (u.id === targetUserId) {
          const nowFollowing = !u.isFollowing;
          return {
            ...u,
            isFollowing: nowFollowing,
            followersCount: nowFollowing ? u.followersCount + 1 : Math.max(0, u.followersCount - 1)
          };
        }
        return u;
      }));

      const response = await fetch(`/api/social/users/${targetUserId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        showToast(data.message, "success");
        // Reload stats in general background
        loadSocialData();
      } else {
        const data = await response.json();
        showToast(data.error || "Não foi possível seguir este atleta", "error");
        loadSocialData();
      }
    } catch (err) {
      showToast("Falha de rede ao seguir atleta.", "error");
    }
  };

  const handleMarkNotifsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      await fetch('/api/social/notifications/read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast("Mensagens marcadas como lidas!", "info");
    } catch (err) {
      console.error("Failed to clean notifications:", err);
    }
  };

  const getBeltBg = (belt: any) => {
    const b = String(belt).toUpperCase();
    switch (b) {
      case 'BRANCA': 
      case 'WHITE':
        return 'bg-white text-slate-800 border border-slate-350';
      case 'AZUL': 
      case 'BLUE':
        return 'bg-blue-600 text-white';
      case 'ROXA': 
      case 'PURPLE':
        return 'bg-purple-700 text-white';
      case 'MARROM': 
      case 'BROWN':
        return 'bg-amber-900 text-white';
      case 'PRETO': 
      case 'BLACK':
        return 'bg-slate-900 border border-red-500 text-red-500';
      default: 
        return 'bg-white text-slate-800';
    }
  };

  const translateBelt = (belt: string) => {
    switch (belt.toUpperCase()) {
      case 'WHITE': return 'Branca';
      case 'BLUE': return 'Azul';
      case 'PURPLE': return 'Roxa';
      case 'BROWN': return 'Marrom';
      case 'BLACK': return 'Preto';
      case 'RED': return 'Vermelha';
      default: return belt;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Treino': return '🥋';
      case 'Dúvida': return '❓';
      case 'Meme': return '😂';
      case 'Campeonato': return '🏆';
      default: return '📢';
    }
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  const filteredPosts = activeCategory === 'Todos' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-6" id="bjj-social-feed">
      
      {/* Header bar and Notification Alert Trigger */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950/70 p-6 rounded-2xl border border-slate-800 gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-display font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400 animate-pulse" />
            <span>Tatame Conectado - Rede Social</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Conexão em tempo real inspirada no Discord e Instagram. Siga atletas, curta posições, solucione dúvidas técnicas e receba interações.
          </p>
        </div>

        {/* Notifications Dropdown Selector */}
        <div className="relative self-stretch md:self-auto">
          <button 
            type="button"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="w-full md:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between md:justify-center gap-2.5 text-xs font-bold text-slate-201 cursor-pointer transition-colors relative"
          >
            <div className="flex items-center gap-2">
              {unreadNotifsCount > 0 ? (
                <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
              ) : (
                <Bell className="w-4 h-4 text-slate-400" />
              )}
              <span>Notificações ({unreadNotifsCount})</span>
            </div>
            {unreadNotifsCount > 0 && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping absolute top-1 right-1" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3 max-h-[360px] overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-[11px]">
                <span className="font-bold text-white uppercase tracking-wider font-mono">Campainha Social</span>
                {unreadNotifsCount > 0 && (
                  <button 
                    onClick={handleMarkNotifsRead}
                    className="text-violet-400 hover:text-violet-300 font-bold font-mono transition-colors cursor-pointer"
                  >
                    Marcar lidas
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-6 text-center text-[11px] text-slate-500 leading-normal font-normal">
                  Nenhuma notificação por aqui ainda. Siga atletas e publique para receber interações!
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-2.5 rounded-xl border transition-all text-left text-[11px] ${
                        notif.isRead 
                          ? 'bg-slate-950/20 border-slate-950/40 opacity-70' 
                          : 'bg-indigo-950/20 border-indigo-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-slate-201">{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1 shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-400 mt-1 font-normal leading-relaxed">{notif.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* DISCORD-LIKE LEFT SIDEBAR (Col span 1) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-violet-500" />
                <span>Canais do Servidor</span>
              </h4>
            </div>

            {/* Channels selectors list */}
            <div className="flex flex-col gap-1.5">
              {[
                { name: 'Todos', label: '🌐 visão-geral' },
                { name: 'Treino', label: '# treinos-tatame' },
                { name: 'Dúvida', label: '# duvidas-posicoes' },
                { name: 'Meme', label: '# memes-tatame' },
                { name: 'Campeonato', label: '# campeonatos' }
              ].map((channel) => {
                const isSelected = activeCategory === channel.name;
                return (
                  <button
                    key={channel.name}
                    onClick={() => setActiveCategory(channel.name)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-violet-605/10 text-violet-400 border-l-4 border-violet-500 pl-2 bg-slate-950/50' 
                        : 'text-slate-400 hover:bg-slate-955/20 hover:text-slate-201 pl-3'
                    }`}
                  >
                    <span>{channel.label}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guidelines info card */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-3 pr-5 text-left">
            <h4 className="font-display font-bold text-xs text-slate-205 flex items-center gap-1.5">
              <span>🔰</span> Discord Guidelines
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              Este canal foi idealizado para atletas, faixas pretas e novatos debaterem ciência de finalizações e transição. 
            </p>
            <div className="border-t border-slate-850 pt-2 space-y-1 text-[9.5px] text-slate-501 font-mono">
              <div className="flex gap-1.5">• <span>Dúvidas devem usar termos anatômicos.</span></div>
              <div className="flex gap-1.5">• <span>Respeito absoluto à hierarquia.</span></div>
            </div>
          </div>
        </div>

        {/* FEED SECTION (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Post Form */}
          <form 
            onSubmit={handleCreatePost}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4"
          >
            <div className="flex gap-3">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-10 h-10 rounded-xl object-cover border border-slate-705 shrink-0"
                referrerPolicy="no-referrer"
              />
              <textarea 
                required
                placeholder="Compartilhe seu treino pesado, dicas de guarda, fotos ou memes de tatame hoje..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={2}
                className="flex-1 bg-slate-950 border border-slate-750 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all font-semibold resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-3 border-t border-slate-800/60 gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-mono text-[10px] uppercase">Publicar no Canal:</span>
                <select 
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as any)}
                  className="bg-slate-950 border border-slate-750 text-slate-300 rounded p-1 text-[11px] font-bold cursor-pointer"
                >
                  <option value="Treino">🥋 #treinos-tatame</option>
                  <option value="Dúvida">❓ #duvidas-posicoes</option>
                  <option value="Meme">😂 #memes-tatame</option>
                  <option value="Campeonato">🏆 #campeonatos</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition-all hover:scale-[1.01]"
              >
                <Send className="w-3.5 h-3.5" /> Postar Conteúdo
              </button>
            </div>
          </form>

          {/* Active channel head banner */}
          <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-850/80 flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-slate-401 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-violet-505 animate-ping" />
              Canal ativo: {activeCategory === 'Todos' ? '🌐 Visão Geral' : `# ${activeCategory.toLowerCase()}`}
            </span>
            <span className="text-[10px] text-slate-550 font-mono">{filteredPosts.length} postagens catalogadas</span>
          </div>

          {/* Posts Feed list */}
          <div className="space-y-4">
            {isLoading && posts.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-xs font-mono">
                Sincronizando postagens reais do servidor...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-slate-950/40 p-12 rounded-2xl border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-450 font-mono">Nenhuma postagem ativa encontrada aqui.</p>
                <p className="text-[10px] text-slate-500 leading-normal font-normal">Escreva sua primeira jornada ou posições novas acima!</p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const showComments = openCommentsPostId === post.id;
                
                return (
                  <div 
                    key={post.id}
                    className="bg-slate-950/45 p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-750/70 transition-all text-left"
                  >
                    {/* Post header author metadata */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-3">
                        <img 
                          src={post.authorAvatar} 
                          alt={post.authorName} 
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-display font-semibold text-xs text-slate-205 flex items-center gap-1.5 flex-wrap">
                            {post.authorName}
                            <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider ${getBeltBg(post.authorBelt)}`}>
                              Faixa {translateBelt(post.authorBelt)}
                            </span>
                          </h4>
                          <span className="text-[9.5px] text-slate-500 font-mono block mt-0.5">{post.timestamp}</span>
                        </div>
                      </div>

                      <span className="bg-slate-900 border border-slate-800/80 text-[10px] text-slate-400 font-mono px-2.5 py-0.5 rounded-lg shrink-0 uppercase tracking-wider">
                        {getCategoryIcon(post.category)} {post.category === 'Dúvida' ? 'posições' : post.category.toLowerCase()}
                      </span>
                    </div>

                    {/* Body Content */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-900/30 p-3.5 rounded-xl border border-slate-850/50 whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Operational actions footer */}
                    <div className="flex items-center gap-5 text-xs pt-2 border-t border-slate-900/40">
                      <button
                        type="button"
                        onClick={() => toggleUpvote(post.id)}
                        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                          post.hasUpvoted ? 'text-rose-400 font-bold' : 'text-slate-500 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.hasUpvoted ? 'fill-rose-400 text-rose-400' : ''}`} />
                        <span>{post.upvotes} curtidas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpenCommentsPostId(showComments ? null : post.id)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-200 cursor-pointer transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <span>{post.comments?.length || 0} respostas</span>
                      </button>
                    </div>

                    {/* Comments section expanding */}
                    {showComments && (
                      <div className="pt-4 border-t border-slate-900/80 space-y-4 animate-fadeIn">
                        
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-3 pl-3 border-l-2 border-slate-800">
                            {post.comments.map((comm) => (
                              <div key={comm.id} className="bg-slate-900/30 p-3 rounded-xl border border-slate-850/60 space-y-1 text-xs">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-semibold text-[11px] text-slate-205 flex items-center gap-1.5">
                                    {comm.authorName}
                                    <span className={`text-[7px] px-1 rounded font-black uppercase ${getBeltBg(comm.authorBelt)}`}>
                                      🥋 {translateBelt(comm.authorBelt)}
                                    </span>
                                  </h5>
                                  <span className="text-[9px] text-slate-500 font-mono">{comm.timestamp}</span>
                                </div>
                                <p className="text-slate-400 font-normal leading-relaxed mt-0.5">{comm.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Write Comment Form */}
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Escreva um conselho técnico ou resposta para este atleta..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            className="flex-1 bg-slate-950 border border-slate-750 text-xs text-slate-205 placeholder-slate-500 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono"
                          >
                            Enviar
                          </button>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* INSTAGRAM-STYLE ATLETAS NETWORK SUGESTIONS (Col span 1) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Active Player Social Profile Summary */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3.5 text-center">
            <div className="flex flex-col items-center">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-14 h-14 rounded-full object-cover border-2 border-violet-502/60"
                referrerPolicy="no-referrer"
              />
              <h4 className="font-display font-extrabold text-white text-xs mt-2 truncate max-w-full">
                {user.name}
              </h4>
              <span className={`text-[8px] px-1.5 py-0.2 rounded font-black uppercase mt-1 tracking-wider ${getBeltBg(user.belt)}`}>
                Faixa {translateBelt(user.belt)}
              </span>
            </div>

            {/* General metrics */}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-[10px]">
              <div className="text-center border-r border-slate-800/60">
                <span className="block font-mono font-black text-slate-101 text-xs">
                  {networkUsers.filter(u => u.isFollowing).length}
                </span>
                <span className="text-slate-502 uppercase font-mono text-[8px] tracking-wide">Seguindo</span>
              </div>
              <div className="text-center">
                <span className="block font-mono font-black text-slate-101 text-xs">
                  {/* Dynamic calculation: how many users follow us in the memory or context */}
                  {notifications.filter(n => n.type === 'FOLLOWER').length}
                </span>
                <span className="text-slate-550 uppercase font-mono text-[8px] tracking-wide">Novos Seguidores</span>
              </div>
            </div>
          </div>

          {/* Atletas Network Suggestions (Recomendações Instagram-style) */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4 text-left">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <SmileIcon />
                <span>Sugestões para seguir</span>
              </h4>
            </div>

            <div className="space-y-3">
              {networkUsers.length === 0 ? (
                <div className="py-4 text-center text-[10px] text-slate-500">
                  Sem outros atletas descobertos ainda.
                </div>
              ) : (
                networkUsers.slice(0, 5).map((net) => (
                  <div 
                    key={net.id} 
                    className="flex flex-col bg-slate-950/30 p-2.5 rounded-xl border border-slate-850 gap-2 text-xs"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-2 min-w-0">
                        <img 
                          src={net.avatar} 
                          alt={net.name} 
                          className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 leading-none">
                          <span className="block font-semibold text-slate-201 text-[11px] truncate">{net.name}</span>
                          <span className={`text-[7px] px-1 inline-block rounded font-bold uppercase mt-1 leading-normal ${getBeltBg(net.belt as any)}`}>
                            🥋 {translateBelt(net.belt)}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleToggleFollow(net.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          net.isFollowing 
                            ? 'bg-slate-800 text-emerald-400 hover:bg-slate-750' 
                            : 'bg-violet-605/20 text-violet-300 hover:bg-violet-600 hover:text-white'
                        }`}
                        title={net.isFollowing ? "Deixar de seguir" : "Seguir atleta"}
                      >
                        {net.isFollowing ? (
                          <UserCheck className="w-3.5 h-3.5" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-slate-900 pt-1.5 mt-0.5 px-0.5">
                      <span>Nível {net.level}</span>
                      <span>{net.followersCount} seguidores</span>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* Social feed stats widget */}
          <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 p-4 rounded-xl text-left space-y-2">
            <h5 className="text-[10px] uppercase font-bold font-mono text-violet-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Estatísticas do Tatame
            </h5>
            <div className="space-y-1 text-[10px] text-slate-400 font-mono">
              <div className="flex justify-between"><span>Registros no DB:</span><span className="text-slate-201">{posts.length}</span></div>
              <div className="flex justify-between"><span>Categorias disponíveis:</span><span className="text-slate-201">4 canais</span></div>
              <div className="flex justify-between"><span>Feed Integrado:</span><span className="text-emerald-400">Prisma ORM</span></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Small inline helper component for styling
function SmileIcon() {
  return (
    <span className="text-slate-400">👥</span>
  );
}
