/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Send, 
  Plus, 
  Sparkles, 
  Bookmark,
  Share2,
  Repeat,
  Bell,
  BellRing,
  UserPlus,
  UserCheck,
  Hash,
  Activity,
  User,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  BookmarkCheck,
  Flag,
  BookOpen,
  Trophy,
  Flame,
  Award,
  ChevronDown,
  Globe,
  Crown,
  Shield,
  Calendar,
  Clock,
  Compass
} from 'lucide-react';
import { io } from 'socket.io-client';
import { UserProfile, SocialPost, Comment, BeltRank } from '../types';
import { normalizeYoutubeUrl } from '../utils/youtube';
import { AvatarWithFrame } from './AvatarWithFrame';
import { SocialStories } from './SocialStories';
import { SocialRankings } from './SocialRankings';
import { AchievementCards } from './AchievementCards';

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
  equippedFrame?: any;
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
  const [posts, setPosts] = useState<any[]>([]);
  const [networkUsers, setNetworkUsers] = useState<NetworkUser[]>([]);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  
  // Navigation & Sorter & Filter Active States
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'achievements' | 'rankings'>('feed');
  const [activeCategory, setActiveCategory] = useState<string>('Todos'); // This handles the requested Filters: Conquistas, Estudos, PVP, Eventos, Campeonatos, Promoções
  const [showOnlySaved, setShowOnlySaved] = useState<boolean>(false);
  
  // Timeline Premium Feed & Sorters States
  const [activeFeedTab, setActiveFeedTab] = useState<'global' | 'amigos' | 'academia' | 'campeoes' | 'pretas' | 'team' | 'city'>('global');
  const [activeSort, setActiveSort] = useState<'recente' | 'curtido' | 'comentado' | 'emalta'>('recente');
  
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostCategory, setNewPostCategory] = useState<string>('Estudos');
  const [newPostVideoUrl, setNewPostVideoUrl] = useState<string>('');
  
  // Custom interactive overlays
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Mentions autocomplete logic
  const [showMentionsPanel, setShowMentionsPanel] = useState<boolean>(false);
  const [mentionFilter, setMentionFilter] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hover reaction overlay state per post
  const [activeReactionPickerPostId, setActiveReactionPickerPostId] = useState<string | null>(null);
  
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('Spam ou publicidade repetitiva');

  const VALID_EMOJIS: Record<string, { label: string; icon: string }> = {
    OSS: { label: 'Oss', icon: '❤️' },
    BRABO: { label: 'Brabo', icon: '🔥' },
    FAIXAPRETA: { label: 'Faixa Preta', icon: '🥋' },
    GUERREIRO: { label: 'Guerreiro', icon: '⚔️' },
    CAMPEAO: { label: 'Campeão', icon: '🏆' },
    RESPEITO: { label: 'Respeito', icon: '👏' }
  };

  // 1. Fetch posts & network configurations
  const loadSocialData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const postsRes = await fetch('/api/social/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        if (postsData && postsData.posts) {
          setPosts(postsData.posts);
        }
      }

      const networkRes = await fetch('/api/social/network', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (networkRes.ok) {
        const networkData = await networkRes.json();
        if (networkData && networkData.network) {
          setNetworkUsers(networkData.network);
        }
      }

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
      console.error("Failed to load social metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // WebSocket Live alerts sync in BJJ Social Network
  useEffect(() => {
    loadSocialData();

    const socket = io({
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    const token = localStorage.getItem('token');
    if (token) {
      socket.emit('auth:register', { token });
    }

    socket.on('social:notification', (data: any) => {
      showToast(`🥋 ${data.title}: ${data.content}`, 'info');
      // Trigger background updates for notifications count
      loadSocialData();
    });

    return () => {
      socket.disconnect();
    };
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
          category: newPostCategory,
          videoUrl: newPostVideoUrl || undefined
        })
      });

      const data = await response.json();
      if (response.ok && data.post) {
        setPosts(prev => [data.post, ...prev]);
        setNewPostContent('');
        setNewPostVideoUrl('');
        showToast("Sua jornada de rolamento foi publicada com sucesso!", "success");
        loadSocialData();
      } else {
        showToast(data.error || "Erro ao publicar no feed", "error");
      }
    } catch (err) {
      showToast("Não foi possível conectar com o servidor.", "error");
    }
  };

  // Reactions custom triggers ❤️🔥🥋⚔️🏆👏
  const handleReactToPost = async (postId: string, reactionType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/social/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reactionType })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPosts(prev => prev.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                reactions: data.reactions,
                userReactions: data.userReactions
              };
            }
            return p;
          }));
          setActiveReactionPickerPostId(null);
        }
      }
    } catch (err) {
      console.error("Failed to react to post:", err);
    }
  };

  // Share interaction handler with strict deduplication
  const handleSharePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/social/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPosts(prev => prev.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                sharesCount: data.sharesCount,
                hasShared: data.shared
              };
            }
            return p;
          }));

          // Copy link to clipboard
          const shareUrl = `${window.location.origin}/social?post=${postId}`;
          await navigator.clipboard.writeText(shareUrl);
          
          showToast("🥋 Link copiado! Compartilhe o rolo com seus parceiros de tatame.", "success");
        }
      }
    } catch (err) {
      console.error("Failed to share post:", err);
      showToast("Não foi possível processar o compartilhamento.", "error");
    }
  };

  // Repost interaction handler with duplicate prevention
  const handleRepostPost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/social/posts/${postId}/repost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        if (data.success) {
          showToast("🥋 Repostagem técnica publicada com sucesso no feed!", "success");
          loadSocialData(); // Refresh the feed completely to see the new repost!
        }
      } else {
        showToast(data.error || "Erro ao fazer o repost.", "info");
      }
    } catch (err) {
      console.error("Failed to repost:", err);
      showToast("Não foi possível processar a repostagem.", "error");
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
              comments: [...(p.comments || []), data.comment]
            };
          }
          return p;
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        showToast("Seu comentário foi respondido!", "success");
      } else {
        showToast(data.error || "Erro ao enviar comentário", "error");
      }
    } catch (err) {
      showToast("Falha de rede ao responder comentário.", "error");
    }
  };

  const handleToggleFollow = async (targetUserId: string) => {
    try {
      const token = localStorage.getItem('token');
      
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
        loadSocialData();
      } else {
        const data = await response.json();
        showToast(data.error || "Incapaz de seguir", "error");
        loadSocialData();
      }
    } catch (err) {
      showToast("Falha técnica no processo.", "error");
    }
  };

  const handleToggleBookmark = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/social/posts/${postId}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPosts(prev => prev.map(p => {
            if (p.id === postId) {
              return { ...p, hasSaved: data.saved };
            }
            return p;
          }));
          showToast(data.message, "success");
        }
      }
    } catch (err) {
      console.error("Failed to bookmark post", err);
    }
  };

  const handleReportFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/social/posts/${reportingPostId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });

      if (response.ok) {
        const data = await response.json();
        showToast(data.message, "success");
        setReportingPostId(null);
      }
    } catch (err) {
      showToast("Erro ao processar relatório.", "error");
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
      console.error("Failed to mark read:", err);
    }
  };

  // Textarea listeners matching @mentions autocomplete popup
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewPostContent(text);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, selectionStart);
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setShowMentionsPanel(true);
      setMentionFilter(lastWord.slice(1).toLowerCase());
    } else {
      setShowMentionsPanel(false);
    }
  };

  const insertMention = (username: string) => {
    const text = newPostContent;
    const selectionStart = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = text.slice(0, selectionStart);
    const textAfterCursor = text.slice(selectionStart);

    const words = textBeforeCursor.split(/\s+/);
    // Replace last typed word (which started with @)
    words[words.length - 1] = `@${username.replace(/\s+/g, '_')}`;

    const joinedBefore = words.join(' ');
    setNewPostContent(joinedBefore + ' ' + textAfterCursor);
    setShowMentionsPanel(false);

    if (textareaRef.current) {
      textareaRef.current.focus();
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
        return 'bg-amber-950/80 text-amber-200 border border-amber-800';
      case 'PRETO': 
      case 'BLACK':
        return 'bg-slate-950 border border-red-500 text-red-500 font-extrabold';
      default: 
        return 'bg-slate-900 text-slate-400';
    }
  };

  const translateBelt = (belt: string) => {
    switch (belt.toUpperCase()) {
      case 'WHITE': return 'Branca';
      case 'BLUE': return 'Azul';
      case 'PURPLE': return 'Roxa';
      case 'BROWN': return 'Marrom';
      case 'BLACK': return 'Preto';
      default: return belt;
    }
  };

  // Dynamic formatting render for highlighted @mentions or #hashtags in bodies
  const formatPostBody = (text: string) => {
    if (!text) return '';
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span 
            key={index} 
            onClick={() => {
              const cleaned = part.replace(/[^\w]/g, '');
              setActiveCategory('Todos');
              setNewPostContent(part + ' ');
              showToast(`Filtrando feed por hashtag: ${part}`, 'info');
            }}
            className="text-indigo-400 font-extrabold hover:underline cursor-pointer font-sans"
          >
            {part}
          </span>
         );
      }
      if (part.startsWith('@')) {
        return (
          <span 
            key={index} 
            className="text-violet-400 font-bold bg-slate-950/40 py-0.5 px-1.5 rounded-md border border-slate-850/40 font-mono"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  // 1. Map posts from database directly
  const getExtendedAndEnrichedPosts = () => {
    const combined = [...posts];

    // Dynamically assign friend, champion and academy markers for premium feed filtering
    return combined.map(p => {
      const matchingUser = networkUsers.find(nu => nu.id === p.authorId);
      const isFollowing = matchingUser?.isFollowing || false;
      
      const authorBeltNormalized = String(p.authorBelt).toUpperCase();
      const isBlackOrMarrom = authorBeltNormalized === 'PRETO' || authorBeltNormalized === 'BLACK' || authorBeltNormalized === 'MARROM' || authorBeltNormalized === 'BROWN';
      
      // Calculate total reactions count for sorting
      const reactionsCount = p.reactions 
        ? Object.values(p.reactions).reduce((acc: number, val: any) => acc + (val || 0), 0)
        : 0;

      return {
        ...p,
        isFriend: p.isFriend || isFollowing || p.authorId === user.id,
        authorAcademy: p.authorAcademy || (matchingUser?.role === 'admin' ? 'Independente' : p.authorId === user.id ? (user.academy || 'Independente') : 'Independente'),
        isChampion: p.isChampion || isBlackOrMarrom || p.upvotes >= 70,
        totalReactionsCount: reactionsCount + (p.upvotes || 0)
      };
    });
  };

  const isPostMatchingFilter = (postCategory: string, filterVal: string) => {
    if (filterVal === 'Todos') return true;
    
    const catLower = String(postCategory).toLowerCase().trim();
    const filterLower = String(filterVal).toLowerCase().trim();

    if (catLower === filterLower) return true;

    // Backward compatibility adapters
    if (filterLower === 'estudos') {
      return catLower === 'treino' || catLower === 'dúvida' || catLower === 'duvida' || catLower === 'meme';
    }
    if (filterLower === 'campeonatos') {
      return catLower === 'campeonato';
    }
    return false;
  };

  const allTimelinePosts = getExtendedAndEnrichedPosts();

  // Multi-tier timeline filtering:
  // TIER A: Filter by Feed tab
  let feedFilteredPosts = allTimelinePosts;
  if (activeFeedTab === 'amigos') {
    feedFilteredPosts = allTimelinePosts.filter(p => p.isFriend);
  } else if (activeFeedTab === 'academia') {
    feedFilteredPosts = allTimelinePosts.filter(p => {
      if (user.branchId && p.authorBranchId === user.branchId) return true;
      if (user.independentAcademyId && p.authorIndependentAcademyId === user.independentAcademyId) return true;
      return p.authorAcademyName === user.academy || p.authorAcademy === (user.academy || 'Independente');
    });
  } else if (activeFeedTab === 'team') {
    feedFilteredPosts = allTimelinePosts.filter(p => {
      if (!user.globalTeamId) return false;
      return p.authorGlobalTeamId === user.globalTeamId;
    });
  } else if (activeFeedTab === 'city') {
    feedFilteredPosts = allTimelinePosts.filter(p => {
      const authorCityClean = String(p.authorCity || p.city || "").toLowerCase().trim();
      const userCityClean = String(user.city || "").toLowerCase().trim();
      return userCityClean && authorCityClean === userCityClean;
    });
  } else if (activeFeedTab === 'campeoes') {
    feedFilteredPosts = allTimelinePosts.filter(p => p.isChampion);
  } else if (activeFeedTab === 'pretas') {
    feedFilteredPosts = allTimelinePosts.filter(p => String(p.authorBelt).toUpperCase() === 'PRETO' || String(p.authorBelt).toUpperCase() === 'BLACK');
  }

  // TIER B: Filter by Category/Filter
  let displayPosts = activeCategory === 'Todos'
    ? feedFilteredPosts
    : feedFilteredPosts.filter(p => isPostMatchingFilter(p.category, activeCategory));

  if (showOnlySaved) {
    displayPosts = displayPosts.filter(p => p.hasSaved);
  }

  // TIER C: High-performance sorting
  displayPosts = [...displayPosts].sort((a: any, b: any) => {
    if (activeSort === 'recente') {
      const tA = new Date(a.createdAt || 0).getTime();
      const tB = new Date(b.createdAt || 0).getTime();
      return tB - tA;
    }
    if (activeSort === 'curtido') {
      const likesA = a.totalReactionsCount || a.upvotes || 0;
      const likesB = b.totalReactionsCount || b.upvotes || 0;
      return likesB - likesA;
    }
    if (activeSort === 'comentado') {
      const commA = (a.comments || []).length;
      const commB = (b.comments || []).length;
      return commB - commA;
    }
    if (activeSort === 'emalta') {
      // Premium interactive trending hot index: weighted scores
      const scoreA = (a.upvotes || 0) * 3 + (a.comments || []).length * 8 + (a.isChampion ? 20 : 0);
      const scoreB = (b.upvotes || 0) * 3 + (b.comments || []).length * 8 + (b.isChampion ? 20 : 0);
      return scoreB - scoreA;
    }
    return 0;
  });

  // Filter network suggestions
  const matchedMentions = networkUsers.filter(u => 
    u.name.toLowerCase().includes(mentionFilter)
  );

  return (
    <div className="space-y-6" id="bjj-social-feed">
      
      {/* HEADER SECTION WITH DROPDOWNS AND SUBTABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950/70 p-6 rounded-2xl border border-slate-800 gap-4">
        <div className="text-left">
          <h3 className="text-xl md:text-2xl font-display font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400 animate-pulse" />
            <span>Tatame Conectado - Rede Social</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Plataforma agregadora combinando Instagram, Strava, Duolingo e LinkedIn para praticantes reais de Jiu-Jitsu.
          </p>
        </div>

        {/* Notifications and Saves */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Notifications Dropdown Selector */}
          <div className="relative flex-1 md:flex-initial">
            <button 
              type="button"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="w-full md:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between md:justify-center gap-2 text-xs font-bold text-slate-201 cursor-pointer transition-colors relative"
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
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute top-0.5 right-0.5" />
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3 max-h-[360px] overflow-y-auto animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-[11px]">
                  <span className="font-bold text-white uppercase tracking-wider font-mono">Alertas do Tatame</span>
                  {unreadNotifsCount > 0 && (
                    <button 
                      onClick={handleMarkNotifsRead}
                      className="text-violet-400 hover:text-violet-300 font-bold font-mono transition-colors cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-slate-505 leading-normal font-normal">
                    Fique atento! Novos seguidores ou reações aparecem em tempo real aqui.
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
      </div>

      {/* CORE REDESIGNED SECTION NAVIGATION SUBTABS HEADER */}
      <div className="p-1 bg-slate-950 rounded-2xl border border-slate-800/80 grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveSubTab('feed')}
          className={`py-3 text-xs font-black uppercase tracking-widest font-mono rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'feed'
              ? 'bg-slate-900 border-slate-800 text-violet-400 shadow-md'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🥋 Feed Geral</span>
        </button>
        <button
          onClick={() => setActiveSubTab('achievements')}
          className={`py-3 text-xs font-black uppercase tracking-widest font-mono rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'achievements'
              ? 'bg-slate-900 border-slate-800 text-violet-400 shadow-md'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🏆 Gerador de Certificados</span>
        </button>
        <button
          onClick={() => setActiveSubTab('rankings')}
          className={`py-3 text-xs font-black uppercase tracking-widest font-mono rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'rankings'
              ? 'bg-slate-900 border-slate-800 text-violet-400 shadow-md'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🥇 Ligas de Desempenho</span>
        </button>
      </div>

      {/* THREE INTERACTIVE COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: CHANNELS & MEMOIZERS DISPLAY (Col span 1) */}
        <div className="lg:col-span-1 space-y-4 text-left">
          
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800/80 pb-2 flex justify-between items-center">
              <h4 className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-violet-500 animate-spin-slow" />
                <span>Filtros Premium</span>
              </h4>
            </div>

            <div className="flex flex-col gap-1.5">
              {[
                { name: 'Todos', label: '🌐 Todos os Feeds' },
                { name: 'Conquistas', label: '🏆 Conquistas' },
                { name: 'Estudos', label: '📚 Estudos' },
                { name: 'PVP', label: '⚔️ Lutas PVP' },
                { name: 'Eventos', label: '📅 Eventos' },
                { name: 'Campeonatos', label: '🎖️ Campeonatos' },
                { name: 'Promoções', label: '✨ Promoções' }
              ].map((channel) => {
                const isSelected = activeCategory === channel.name;
                return (
                  <button
                    key={channel.name}
                    onClick={() => {
                      setActiveSubTab('feed');
                      setActiveCategory(channel.name);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black font-mono transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      isSelected && activeSubTab === 'feed'
                        ? 'bg-slate-950 border-l-4 border-violet-500 text-violet-400 pl-2' 
                        : 'text-slate-400 hover:bg-slate-950/40 hover:text-slate-200 pl-3'
                    }`}
                  >
                    <span>{channel.label}</span>
                    {isSelected && activeSubTab === 'feed' ? (
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping" />
                    ) : (
                      <span className="text-[10px] font-normal text-slate-600">bjj</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Bio and Stats Board (LinkedIn-style) */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col items-center pb-3 border-b border-slate-850">
              <AvatarWithFrame
                avatarUrl={user.profilePhoto || user.avatar}
                userName={user.name}
                frame={user.equippedFrame}
                size="md"
              />
              <h4 className="font-display font-extrabold text-sm text-slate-100 mt-2.5 truncate max-w-full">
                {user.name}
              </h4>
              <span className={`text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md mt-1.5 ${getBeltBg(user.belt)}`}>
                Faixa {translateBelt(user.belt)}
              </span>
            </div>

            <div className="space-y-2 text-[10px] font-mono leading-relaxed">
              <div className="flex justify-between border-b border-slate-950 pb-1.5 text-slate-500">
                <span>Total Seguidores:</span>
                <span className="text-slate-300 font-bold">{notifications.filter(n => n.type === 'FOLLOWER').length + 3}</span>
              </div>
              <div className="flex justify-between border-b border-slate-950 pb-1.5 text-slate-500">
                <span>Estudos de Streak:</span>
                <span className="text-rose-400 font-bold flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {user.streak || 5} dias
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Elo PVP Arena:</span>
                <span className="text-amber-400 font-bold">{user.elo || 1000} LP</span>
              </div>
            </div>
          </div>

        </div>

        {/* INTEGRATED FEED AND ACTIONS ZONE (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">

          {/* ACTIVE TAB 1: RENDER USER SOCIAL FEED */}
          {activeSubTab === 'feed' && (
            <>
              {/* Premium Feeds Switcher Tab Bar */}
              <div className="p-1 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-6 gap-1 shadow-lg">
                {[
                  { id: 'global', label: 'Global', icon: Globe, desc: 'Feed Global' },
                  { id: 'team', label: 'Equipe', icon: Users, desc: 'Comunidade da Equipe' },
                  { id: 'academia', label: 'Academia', icon: Shield, desc: 'Comunidade da Academia' },
                  { id: 'city', label: 'Cidade', icon: Compass, desc: 'Comunidade da Cidade' },
                  { id: 'amigos', label: 'Amigos', icon: Heart, desc: 'Atletas Seguidos' },
                  { id: 'pretas', label: 'Mestres', icon: Award, desc: 'Faixas Pretas' },
                ].map((fd) => {
                  const isActive = activeFeedTab === fd.id;
                  const IconComp = fd.icon;
                  return (
                    <button
                      key={fd.id}
                      onClick={() => setActiveFeedTab(fd.id as any)}
                      className={`py-2 px-1 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden group ${
                        isActive
                          ? 'bg-slate-950 border border-slate-800 text-violet-400 shadow-md animate-pulse-once'
                          : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                      title={fd.desc}
                    >
                      <IconComp className={`w-4 h-4 ${isActive ? 'scale-110 text-violet-400' : 'text-slate-500 group-hover:text-slate-400'} transition-transform`} />
                      <span className="text-[10px] font-black tracking-tight font-sans block truncate max-w-full">
                        {fd.label}
                      </span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stories Rail layout */}
              <SocialStories user={user} showToast={showToast} />

              {/* Posting editor container */}
              <form 
                onSubmit={handleCreatePost}
                className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 text-left relative shadow-lg"
              >
                <div className="flex gap-3 items-center">
                  <AvatarWithFrame
                    avatarUrl={user.profilePhoto || user.avatar}
                    userName={user.name}
                    frame={user.equippedFrame}
                    size="sm"
                    className="shrink-0"
                  />
                  <div className="flex-1 relative">
                    <textarea 
                      ref={textareaRef}
                      required
                      placeholder="Marque um atleta com @ ou compartilhe conselhos de guarda usando #jiujitsu..."
                      value={newPostContent}
                      onChange={handleTextareaChange}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-755 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all font-semibold resize-none"
                    />

                    {/* Exclusivo Professores & Admin */}
                    {((user.role as string) === 'admin' || (user.role as string) === 'professor' || (user.role as string) === 'instructor' || (user.role as string) === 'teacher' || (user.role as string) === 'ADMIN' || (user.role as string) === 'TEACHER' || (user.role as string) === 'INSTRUCTOR') && (
                      <div className="mt-2 text-left">
                        <label className="text-[9px] font-mono text-indigo-400 uppercase font-black tracking-wider block mb-1">📽️ Vincular Vídeo (Link YouTube, Vimeo, etc):</label>
                        <input 
                          type="text"
                          value={newPostVideoUrl}
                          onChange={(e) => setNewPostVideoUrl(e.target.value)}
                          placeholder="Cole o link do vídeo aqui (ex: https://www.youtube.com/watch?v=...)"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 px-3 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    )}

                    {/* Mentions Auto-Complete Dropdown list overlay */}
                    {showMentionsPanel && matchedMentions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-xl max-h-[140px] overflow-y-auto z-50 p-1.5 space-y-1 shadow-2xl">
                        <span className="block text-[8px] uppercase font-bold text-slate-500 p-1 tracking-wider font-mono">Mencionar Atleta:</span>
                        {matchedMentions.map(net => (
                          <div
                            key={net.id}
                            onClick={() => insertMention(net.name)}
                            className="flex items-center gap-2 p-1.5 hover:bg-slate-900 rounded-lg cursor-pointer transition-colors text-xs text-slate-300"
                          >
                            <img src={net.profilePhoto || net.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                            <span className="font-bold text-[11px]">{net.name}</span>
                            <span className={`text-[7px] font-black uppercase px-1 rounded ${getBeltBg(net.belt)}`}>
                              {translateBelt(net.belt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-3 border-t border-slate-800/60 gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-mono text-[9px] uppercase">Tema de Discussão:</span>
                    <select 
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value as any)}
                      className="bg-slate-950 border border-slate-750 text-slate-300 rounded p-1 text-[11px] font-bold cursor-pointer"
                    >
                      <option value="Estudos">📚 Estudos & Posicionamento</option>
                      <option value="Conquistas">🏆 Conquista de Insígnia</option>
                      <option value="PVP">⚔️ Luta PVP Arena</option>
                      <option value="Eventos">📅 Seminário / Evento Especial</option>
                      <option value="Campeonatos">🎖️ Campeonato de Jiu-Jitsu</option>
                      <option value="Promoções">✨ Nova Faixa / Graduação</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition-all hover:scale-[1.01]"
                  >
                    <Send className="w-3.5 h-3.5" /> Postar Conteúdo
                  </button>
                </div>
              </form>

              {/* Premium Interactive Sort and Filter Toolbar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xl text-left">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="font-mono font-black text-xs text-slate-300 uppercase tracking-widest">
                      MURAL {[
                        { id: 'global', label: 'GLOBAL' },
                        { id: 'team', label: 'COMUNIDADE DA EQUIPE' },
                        { id: 'academia', label: 'COMUNIDADE DA ACADEMIA' },
                        { id: 'city', label: 'COMUNIDADE DA CIDADE' },
                        { id: 'amigos', label: 'AMIGOS SEGUIDOS' },
                        { id: 'pretas', label: 'FAIXAS PRETAS' }
                      ].find(f => f.id === activeFeedTab)?.label || activeFeedTab.toUpperCase()}: {activeCategory === 'Todos' ? '🌐 Visão Geral' : `# ${activeCategory.toUpperCase()}`}
                    </span>
                  </div>
                  
                  {/* Bookmark Toggle & Post count badge info */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-slate-400 font-mono">
                      {displayPosts.length} posts
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOnlySaved(!showOnlySaved)}
                      className={`px-3 py-1 rounded-xl border font-mono text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        showOnlySaved 
                          ? 'bg-amber-400/10 border-amber-500/55 text-amber-400 shadow-sm' 
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-355'
                      }`}
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>{showOnlySaved ? 'Exibindo Salvos' : 'Filtrar Salvos'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Premium Filter Badges (Excellent for Mobile Fallback) */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5">
                  <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider shrink-0 mr-1.5">Filtros:</span>
                  {[
                    { id: 'Todos', label: 'Tudo' },
                    { id: 'Conquistas', label: '🏆 Conquistas' },
                    { id: 'Estudos', label: '📚 Estudos' },
                    { id: 'PVP', label: '⚔️ PVP' },
                    { id: 'Eventos', label: '📅 Eventos' },
                    { id: 'Campeonatos', label: '🎖️ Campeonatos' },
                    { id: 'Promoções', label: '✨ Promoções' }
                  ].map((flt) => {
                    const isSelected = activeCategory === flt.id;
                    return (
                      <button
                        key={flt.id}
                        type="button"
                        onClick={() => setActiveCategory(flt.id)}
                        className={`text-[10px] px-3 py-1.5 rounded-full font-black tracking-wide shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600 border border-violet-500 text-white shadow-sm shadow-violet-600/10'
                            : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {flt.label}
                      </button>
                    );
                  })}
                </div>

                {/* ORDENAÇÃO (Sorting options) Segmented selectors */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 border-t border-slate-850/50 gap-2">
                  <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">Ordenação:</span>
                  <div className="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {[
                      { id: 'recente', label: '🕒 Mais recente' },
                      { id: 'curtido', label: '🔥 Mais curtido' },
                      { id: 'comentado', label: '💬 Mais comentado' },
                      { id: 'emalta', label: '📈 Em alta' }
                    ].map((srt) => {
                      const isSelected = activeSort === srt.id;
                      return (
                        <button
                          key={srt.id}
                          type="button"
                          onClick={() => setActiveSort(srt.id as any)}
                          className={`text-[10px] px-2.5 py-1 rounded bg-slate-950 border transition-all cursor-pointer font-bold shrink-0 ${
                            isSelected
                              ? 'border-violet-500 text-violet-400 font-black shadow-md'
                              : 'border-slate-800 text-slate-500 hover:text-slate-350'
                          }`}
                        >
                          {srt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Posts Render Grid */}
              <div className="space-y-4">
                {displayPosts.length === 0 ? (
                  <div className="bg-slate-900 p-12 rounded-2xl border border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-450 font-mono">Nenhuma postagem ativa encontrada.</p>
                    <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                      Sua seleção de canais ou filtros ativos retornou resultados em branco.
                    </p>
                  </div>
                ) : (
                  displayPosts.map((post) => {
                    const showComments = openCommentsPostId === post.id;
                    const isPostSaved = post.hasSaved;
                    
                    return (
                      <div 
                        key={post.id}
                        className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-750/70 transition-all text-left relative"
                      >
                        {/* Post Header */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-3 items-center">
                            <AvatarWithFrame
                              avatarUrl={post.authorProfilePhoto || post.authorAvatar}
                              userName={post.authorName}
                              frame={post.authorFrame}
                              size="sm"
                              className="shrink-0"
                            />
                            <div>
                              <h4 className="font-display font-semibold text-xs text-slate-201 flex items-center gap-1.5 flex-wrap">
                                {post.authorName}
                                {post.authorVerified && (
                                  <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0 inline-block align-middle" title="Verificado Oficial" />
                                )}
                                {post.authorRole === 'TEACHER' && (
                                  <span className="text-[8px] bg-indigo-500/10 border border-indigo-505/20 text-indigo-400 font-mono font-bold px-1 rounded">PROFESSOR</span>
                                )}
                                {post.authorRole === 'ADMIN' && (
                                  <span className="text-[8px] bg-red-650/15 border border-red-550/20 text-red-500 font-mono font-bold px-1 rounded">STAFF</span>
                                )}
                                <span className={`text-[8px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider ${getBeltBg(post.authorBelt)}`}>
                                  Faixa {translateBelt(post.authorBelt)}
                                </span>
                              </h4>
                              <span className="text-[9.5px] text-slate-500 font-mono block mt-0.5">{post.timestamp}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Category labels */}
                            <span className="bg-slate-900 border border-slate-800 text-[9px] text-slate-400 font-mono px-2.5 py-0.5 rounded-lg shrink-0 uppercase tracking-widest">
                              #{post.category.toLowerCase()}
                            </span>

                            {/* Save, Share, Flag popups */}
                            <button
                              type="button"
                              onClick={() => handleToggleBookmark(post.id)}
                              className={`p-1 border rounded-lg transition-colors cursor-pointer ${
                                isPostSaved 
                                  ? 'bg-amber-400/10 border-amber-500/50 text-amber-400' 
                                  : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
                              }`}
                              title={isPostSaved ? 'Remover do Diário' : 'Salvar no Diário'}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setReportingPostId(post.id)}
                              className="p-1 border border-slate-850 bg-slate-950 rounded-lg text-slate-500 hover:text-red-400 hover:border-red-950 transition-colors cursor-pointer"
                              title="Denunciar Conteúdo"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Post Body Content with highlighted tags */}
                        <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-850/50 whitespace-pre-wrap select-text">
                          {formatPostBody(post.content)}
                        </div>

                        {/* Video Attachment Player */}
                        {post.videoUrl && (
                          <div className="mt-3 aspect-video bg-black rounded-xl border border-slate-800 overflow-hidden relative shadow-lg">
                            {(() => {
                              const url = post.videoUrl.trim();
                              if (url.includes('youtube.com') || url.includes('youtu.be')) {
                                return (
                                  <iframe 
                                    src={`${normalizeYoutubeUrl(url)}?rel=0&modestbranding=1&enablejsapi=1`}
                                    title="Embedded video"
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                  />
                                );
                              } else if (url.includes('vimeo.com')) {
                                const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
                                const id = match ? match[3] : '';
                                if (id) {
                                  return (
                                    <iframe 
                                      src={`https://player.vimeo.com/video/${id}`}
                                      className="w-full h-full border-0"
                                      allow="autoplay; fullscreen; picture-in-picture"
                                      allowFullScreen
                                    />
                                  );
                                }
                              } else if (url.startsWith('http://') || url.startsWith('https://')) {
                                return (
                                  <video 
                                    src={url}
                                    controls
                                    className="w-full h-full object-contain"
                                  />
                                );
                              }
                              return (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-500 font-mono text-center">
                                  <span className="text-xs">Link de vídeo inválido ou inseguro.</span>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* REACTION PREVIEWS */}
                        {post.reactions && Object.keys(post.reactions).length > 0 && (
                          <div className="flex gap-1.5 flex-wrap pt-1">
                            {Object.entries(post.reactions).map(([reactKey, reactCount]) => {
                              if ((reactCount as number) === 0) return null;
                              const emojiObj = VALID_EMOJIS[reactKey] || { label: reactKey, icon: '🥋' };
                              const userReactedToThis = post.userReactions?.includes(reactKey);

                              return (
                                <button
                                  key={reactKey}
                                  onClick={() => handleReactToPost(post.id, reactKey)}
                                  className={`px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono flex items-center gap-1 cursor-pointer transition-all ${
                                    userReactedToThis 
                                      ? 'bg-violet-605/10 border-violet-500/50 text-violet-400' 
                                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                                  }`}
                                  title={`Reação: ${emojiObj.label}`}
                                >
                                  <span>{emojiObj.icon}</span>
                                  <span>{reactCount as number}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* SOCIAL STATISTICS COUNTERS BAR */}
                        <div className="flex justify-between items-center text-slate-400 text-[10px] font-medium font-mono pb-2 pt-1 border-b border-slate-900/30 px-1 select-none">
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
                            <span>{post.upvotes || 0} curtidas técnica</span>
                            {Number(post.sharesCount || 0) > 0 && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span>{post.sharesCount} compartilhamentos</span>
                              </>
                            )}
                            {Number(post.repostsCount || 0) > 0 && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span>{post.repostsCount} reposts</span>
                              </>
                            )}
                          </div>
                          <div>
                            <span>{post.comments?.length || 0} respostas técnica</span>
                          </div>
                        </div>

                        {/* Post footer and reaction tools */}
                        <div className="flex items-center justify-between gap-2 text-xs pt-2.5 relative">
                          <div 
                            className="relative"
                            onMouseEnter={() => setActiveReactionPickerPostId(post.id)}
                            onMouseLeave={() => setActiveReactionPickerPostId(null)}
                          >
                            <button
                              type="button"
                              onClick={() => handleReactToPost(post.id, 'OSS')}
                              className={`flex items-center gap-1.5 cursor-pointer transition-all duration-150 font-bold py-1 px-2.5 rounded-lg ${
                                post.userReactions && post.userReactions.length > 0
                                  ? 'text-rose-400 bg-rose-500/10'
                                  : 'text-slate-500 hover:text-rose-400 hover:bg-slate-900'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${post.userReactions && post.userReactions.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-500'}`} />
                              <span>{post.userReactions && post.userReactions.length > 0 ? 'Reagido' : 'Interagir'}</span>
                              <ChevronDown className="w-3 h-3 text-slate-500" />
                            </button>

                            {/* HOVER EMOJI PICKER POPOVER DISCORD STYLE (❤️🔥🥋⚔️🏆👏) */}
                            {activeReactionPickerPostId === post.id && (
                              <div className="absolute left-0 bottom-full mb-1 bg-slate-950 border border-slate-850 px-2.5 py-1.5 rounded-full flex gap-2.5 shadow-2xl z-50 animate-scaleUp">
                                {Object.entries(VALID_EMOJIS).map(([key, emoji]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleReactToPost(post.id, key)}
                                    className="text-lg hover:scale-130 transition-transform active:scale-95 duration-100 cursor-pointer"
                                    title={emoji.label}
                                  >
                                    {emoji.icon}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setOpenCommentsPostId(showComments ? null : post.id)}
                            className={`flex items-center gap-1.5 cursor-pointer transition-all duration-150 py-1 px-2.5 rounded-lg ${
                              showComments 
                                ? 'text-indigo-400 bg-indigo-500/10 font-bold' 
                                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900 font-medium'
                            }`}
                          >
                            <MessageSquare className="w-4 h-4 text-indigo-400" />
                            <span>Comentários ({post.comments?.length || 0})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRepostPost(post.id)}
                            className={`flex items-center gap-1.5 cursor-pointer transition-all duration-150 py-1 px-2.5 rounded-lg ${
                              post.hasReposted
                                ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                                : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-900 font-medium'
                            }`}
                            title="Repostagem rápida no seu feed de tatame"
                          >
                            <Repeat className={`w-4 h-4 ${post.hasReposted ? 'text-emerald-400 font-bold' : 'text-slate-500'}`} />
                            <span>Repostar</span>
                            {Number(post.repostsCount || 0) > 0 && <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded-full border border-slate-800">{post.repostsCount}</span>}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSharePost(post.id)}
                            className={`flex items-center gap-1.5 cursor-pointer transition-all duration-150 py-1 px-2.5 rounded-lg ${
                              post.hasShared
                                ? 'text-teal-400 bg-teal-500/10 font-bold'
                                : 'text-slate-500 hover:text-teal-400 hover:bg-slate-900 font-medium'
                            }`}
                            title="Compartilhar link da publicação técnica"
                          >
                            <Share2 className="w-4 h-4 text-teal-400" />
                            <span>Compartilhar</span>
                            {Number(post.sharesCount || 0) > 0 && <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded-full border border-slate-800">{post.sharesCount}</span>}
                          </button>
                        </div>

                        {/* Expandable comments */}
                        {showComments && (
                          <div className="pt-4 border-t border-slate-950 space-y-4 animate-fadeIn">
                            {post.comments && post.comments.length > 0 && (
                              <div className="space-y-3 pl-3 border-l-2 border-slate-800">
                                {post.comments.map((comm: any) => (
                                  <div key={comm.id} className="bg-slate-950/20 p-3 rounded-xl border border-slate-850/60 flex gap-3 text-xs items-start">
                                    <AvatarWithFrame
                                      avatarUrl={comm.authorProfilePhoto || comm.authorAvatar}
                                      userName={comm.authorName}
                                      frame={comm.authorFrame}
                                      size="xs"
                                      className="shrink-0"
                                    />
                                    <div className="space-y-1 flex-1">
                                      <div className="flex justify-between items-center">
                                        <h5 className="font-semibold text-[11px] text-slate-201 flex items-center gap-1.5 flex-wrap">
                                          {comm.authorName}
                                          <span className={`text-[7px] px-1 rounded font-black uppercase ${getBeltBg(comm.authorBelt)}`}>
                                            Faixa {translateBelt(comm.authorBelt)}
                                          </span>
                                        </h5>
                                        <span className="text-[9px] text-slate-500 font-mono">{comm.timestamp}</span>
                                      </div>
                                      <p className="text-slate-400 leading-relaxed font-medium mt-0.5">{formatPostBody(comm.content)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Write a reply form */}
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Insira seu conselho de guarda ou finalize uma resposta técnica..."
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddComment(post.id);
                                }}
                                className="flex-1 bg-slate-950 border border-slate-750 text-xs text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddComment(post.id)}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono"
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
            </>
          )}

          {/* ACTIVE TAB 2: RENDER AUTOMATIC CERTIFICATES GENERATOR */}
          {activeSubTab === 'achievements' && (
            <AchievementCards 
              user={user} 
              showToast={showToast} 
              onPostCreated={() => {
                setActiveSubTab('feed');
                loadSocialData();
              }} 
            />
          )}

          {/* ACTIVE TAB 3: RENDER GAMIFIED RANKINGS */}
          {activeSubTab === 'rankings' && (
            <SocialRankings user={user} />
          )}

        </div>

        {/* RIGHT COLUMN: RECOMMENDED USERS & COMMUNITY OVERVIEWS (Col span 1) */}
        <div className="lg:col-span-1 space-y-6 text-left">
          
          {/* Followers Suggestions (Instagram-style) */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="border-b border-slate-805 pb-2">
              <h4 className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span>👥</span>
                <span>Sugestões para seguir</span>
              </h4>
            </div>

            <div className="space-y-3">
              {networkUsers.filter(item => item.id !== user.id).length === 0 ? (
                <div className="py-4 text-center text-[10px] text-slate-500 font-mono">
                  Buscando outros atletas no radar...
                </div>
              ) : (
                networkUsers.filter(item => item.id !== user.id).slice(0, 5).map((net) => (
                  <div 
                    key={net.id} 
                    className="flex flex-col bg-slate-950/30 p-2.5 rounded-xl border border-slate-850 gap-2 text-xs"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-2 min-w-0">
                        <AvatarWithFrame
                          avatarUrl={net.profilePhoto || net.avatar}
                          userName={net.name}
                          frame={net.equippedFrame}
                          size="xs"
                        />
                        <div className="min-w-0 leading-tight">
                          <span className="block font-bold text-slate-201 text-[11px] truncate">{net.name}</span>
                          <span className={`text-[7px] px-1 inline-block rounded font-black uppercase mt-1 leading-normal ${getBeltBg(net.belt)}`}>
                            {translateBelt(net.belt)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleFollow(net.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          net.isFollowing 
                            ? 'bg-slate-800 text-emerald-400 hover:bg-slate-750' 
                            : 'bg-violet-605/20 text-violet-300 hover:bg-violet-650 hover:text-white'
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

                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-slate-950 pt-1.5 mt-0.5 px-0.5">
                      <span>Nível {net.level}</span>
                      <span>{net.followersCount || 12} seg</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Social Stats Widget */}
          <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <h5 className="text-[10px] uppercase font-bold font-mono text-violet-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Métricas Ativas da Lâmina
            </h5>
            <div className="space-y-1 text-[10px] text-slate-400 font-mono">
              <div className="flex justify-between"><span>Postagens do Clube:</span><span className="text-slate-201">{posts.length}</span></div>
              <div className="flex justify-between"><span>Minhas Conquistas:</span><span className="text-emerald-400">Totalmente Sinc</span></div>
              <div className="flex justify-between"><span>Engine Socket:</span><span className="text-emerald-400">Ativo</span></div>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: REPORT REASON PICKER DIALOG */}
      {reportingPostId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-[990] p-4 text-left">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
              <h3 className="font-mono text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                <Flag className="w-4 h-4" />
                <span>Denunciar Postagem</span>
              </h3>
            </div>

            <form onSubmit={handleReportFormSubmit} className="space-y-4 text-xs font-sans">
              <p className="text-slate-400 leading-relaxed font-semibold">
                Nossos moderadores auditarão este conteúdo em menos de 24 horas. Qual o principal motivo da irregularidade?
              </p>

              <div className="space-y-2">
                <label className="block text-[8px] uppercase tracking-wider font-bold text-slate-500">Selecione uma categoria:</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 font-semibold focus:outline-none"
                >
                  <option value="Spam ou publicidade repetitiva">Spam ou publicidade repetitiva</option>
                  <option value="Ofensa moral ou assédio a outro praticante">Ofensa moral ou assédio a outro praticante</option>
                  <option value="Conteúdo não relacionado a Jiu-Jitsu">Conteúdo não relacionado a Jiu-Jitsu</option>
                  <option value="Fake news ou mentira sobre graduação">Fake news ou mentira sobre graduação</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReportingPostId(null)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 font-bold font-mono rounded-lg border border-slate-850 text-center cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono rounded-lg text-center cursor-pointer"
                >
                  Enviar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
