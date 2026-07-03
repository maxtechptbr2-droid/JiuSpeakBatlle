/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  Trophy,
  Flame,
  Award,
  Zap,
  Image as ImageIcon,
  Smile,
  AtSign,
  Send,
  Trash2
} from 'lucide-react';
import { UserProfile, BeltRank } from '../types';
import { STORY_FILTERS, filterCss } from './storyFilters';
import { MentionSearchModal, MentionEditor, MentionViewer, Mention } from './StoryMentions';
import { StoryMusicPicker, StoryAudioPlayer, MusicChip, SelectedMusic } from './StoryMusicPicker';

interface SocialStoriesProps {
  user: UserProfile;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userBelt: string;
  mediaUrl?: string;
  mediaType: 'photo' | 'image' | 'video' | 'achievement_card';
  caption?: string | null;
  cardData?: {
    title: string;
    description: string;
    metricLabel: string;
    metricValue: string;
    bgTheme: 'gold' | 'purple' | 'crimson' | 'ocean';
  } | null;
  createdAt: string;
}

export function SocialStories({ user, showToast }: SocialStoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [storyType, setStoryType] = useState<'photo' | 'achievement_card'>('photo');
  const [achievementType, setAchievementType] = useState<string>('streak');

  // Upload de mídia via /api/social/upload-media (estilo Instagram)
  const [storyMediaUrl, setStoryMediaUrl] = useState<string>('');
  const [storyMediaType, setStoryMediaType] = useState<'image' | 'video'>('image');
  const [storyFilter, setStoryFilter] = useState('normal');
  const [storyMentions, setStoryMentions] = useState<Mention[]>([]);
  const [showMentionSearch, setShowMentionSearch] = useState(false);
  const [storyMusic, setStoryMusic] = useState<SelectedMusic | null>(null);
  const [storyMusicStart, setStoryMusicStart] = useState(0);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [storyTextColor, setStoryTextColor] = useState<string>('#ffffff');
  const [showStoryEmoji, setShowStoryEmoji] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLInputElement>(null);
  const STORY_TEXT_COLORS = ['#ffffff', '#c9a84c', '#e74c3c', '#1a5aad', '#22c55e', '#111111'];
  const STORY_EMOJIS = ['🥋','🔥','💪','🏆','😤','👊','🤙','⚔️','🙏','🎯','🥇','🐍','🦵','🫡','😅','💥'];

  // Load backend active stories
  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/social/stories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stories) {
          setStories(data.stories);
        }
      }
    } catch (err) {
      console.error("Failed to load stories:", err);
    }
  };

  const handleDeleteStory = async () => {
    const cur = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
    if (!cur) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/social/stories/${cur.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok || res.status === 204) {
        showToast?.('Story excluído.', 'success');
        setConfirmDelete(false);
        setActiveStoryIndex(null);
        fetchStories();
      } else showToast?.('Erro ao excluir story', 'error');
    } catch { showToast?.('Erro ao excluir story', 'error'); }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Story playback timer
  useEffect(() => {
    if (activeStoryIndex === null) return;
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          // Slide finished
          handleNextSlide();
          return 0;
        }
        return p + 2; // Tick progress up every 100ms
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, slideIndex, isPaused]);

  const handleNextSlide = () => {
    setProgress(0);
    if (activeStoryIndex === null) return;

    // Check if current user story has multiple slides (for now, 1 story = 1 slide, but we can play next users stories!)
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      // Finished all stories
      setActiveStoryIndex(null);
    }
  };

  const handlePrevSlide = () => {
    setProgress(0);
    if (activeStoryIndex === null) return;

    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  // Upload de foto/vídeo do dispositivo — usa o endpoint que já existe
  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('media', file);
      const res = await fetch('/api/social/upload-media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const url = data.url || data.mediaUrl || data.imageUrl || data.videoUrl;
        setStoryMediaUrl(url);
        setStoryMediaType(file.type.startsWith('video/') ? 'video' : 'image');
        setStoryPreview(URL.createObjectURL(file));
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Erro ao enviar mídia.', 'error');
      }
    } catch (err) {
      showToast('Erro de rede no upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const resetCreator = () => {
    setShowCreateModal(false);
    setStoryType('photo');
    setStoryMediaUrl('');
    setStoryPreview(null);
    setStoryCaption('');
    setShowStoryEmoji(false);
    setStoryTextColor('#ffffff');
    setPublishing(false);
    setStoryFilter('normal');
    setStoryMentions([]);
    setShowMentionSearch(false);
    setStoryMusic(null);
    setStoryMusicStart(0);
    setShowMusicPicker(false);
  };

  const handleCreateStory = async () => {
    try {
      const token = localStorage.getItem('token');
      let payload: any;

      if (storyType === 'photo') {
        if (!storyMediaUrl) { showToast('Selecione uma foto ou vídeo da galeria.', 'error'); return; }
        payload = {
          mediaType: storyMediaType,
          mediaUrl: storyMediaUrl,
          caption: storyCaption.trim() || undefined,
          filter: storyFilter,
          mentions: storyMentions.map(m => ({ userId: m.userId, username: m.username, x: m.x, y: m.y })),
          musicId: storyMusic?.id || null,
          musicStartAt: storyMusicStart
        };
      } else {
        // Card de conquista (opção extra) — persistimos imagem temática + legenda-resumo
        let cardDataObj: {
          title: string;
          description: string;
          metricLabel: string;
          metricValue: string;
          bgTheme: 'gold' | 'purple' | 'crimson' | 'ocean';
        } = {
          title: "Sequência Extrema",
          description: "Praticando Jiu-Jitsu sem parar no Tatame Conectado!",
          metricLabel: "Duração",
          metricValue: `${user.streak || 5} Dias Consecutivos`,
          bgTheme: 'gold'
        };

        if (achievementType === 'p_belt') {
          cardDataObj = {
            title: `Graduado a Faixa ${user.belt}`,
            description: "Evolução e mérito técnico comprovados pelo Sensei",
            metricLabel: "Status",
            metricValue: "Faixa Confirmada",
            bgTheme: 'purple'
          };
        } else if (achievementType === 'lvl') {
          cardDataObj = {
            title: `Nível ${user.level} Conquistado`,
            description: "Mais XP adicionado ao cadastro de atleta",
            metricLabel: "XP Atual",
            metricValue: `${user.xp} XP`,
            bgTheme: 'ocean'
          };
        } else if (achievementType === 'pvp') {
          cardDataObj = {
            title: "Guerreiro do PVP",
            description: "Vitórias confirmadas em tempo real na Arena de Tatame",
            metricLabel: "Vitórias",
            metricValue: `${user.winCount || 4} Combates PVP`,
            bgTheme: 'crimson'
          };
        }

        payload = {
          mediaType: 'achievement_card',
          mediaUrl: "https://images.unsplash.com/photo-1517438476312-10d79c07750d?auto=format&fit=crop&q=80&w=600",
          caption: `${cardDataObj.title} • ${cardDataObj.metricValue}`,
          cardData: cardDataObj
        };
      }

      setPublishing(true);
      const res = await fetch('/api/social/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message || "Story publicado no diário!", "success");
        resetCreator();
        fetchStories();
      } else {
        showToast("Erro ao publicar story.", "error");
      }
    } catch (err) {
      showToast("Erro de rede.", "error");
    } finally {
      setPublishing(false);
    }
  };

  const getBeltRingColor = (belt: string) => {
    switch (String(belt).toUpperCase()) {
      case 'WHITE':
      case 'BRANCA':
        return 'border-slate-300 ring-slate-400';
      case 'BLUE':
      case 'AZUL':
        return 'border-blue-500 ring-blue-600';
      case 'PURPLE':
      case 'ROXA':
        return 'border-purple-500 ring-purple-600';
      case 'BROWN':
      case 'MARROM':
        return 'border-amber-700 ring-amber-800';
      case 'BLACK':
      case 'PRETO':
        return 'border-red-600 ring-zinc-950';
      default:
        return 'border-violet-500 ring-violet-600';
    }
  };

  const currentActiveStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <div className="w-full bg-slate-900/60 p-4 rounded-2xl border border-slate-800" id="bjj-social-stories">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
        
        {/* ADD STORY BUTTON */}
        <div className="flex flex-col items-center gap-1 cursor-pointer shrink-0 snap-start">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-14 h-14 rounded-full bg-slate-950 border-2 border-dashed border-violet-500 flex items-center justify-center hover:bg-slate-900 transition-all cursor-pointer relative group"
            title="Publicar Story"
          >
            <Plus className="w-6 h-6 text-violet-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-600 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-extrabold font-mono">
              +
            </span>
          </button>
          <span className="text-[10px] font-bold text-slate-400 font-mono">Meu Story</span>
        </div>

        {/* STORIES LIST */}
        {stories.map((story, idx) => (
          <div 
            key={story.id}
            onClick={() => {
              setActiveStoryIndex(idx);
              setSlideIndex(0);
              setProgress(0);
              setIsPaused(false);
            }}
            className="flex flex-col items-center gap-1 cursor-pointer shrink-0 snap-start active:scale-95 transition-transform"
          >
            <div className={`w-14 h-14 rounded-full p-[2px] border-2 ring-2 ring-offset-2 ring-offset-slate-900 ${getBeltRingColor(story.userBelt)}`}>
              <img 
                src={story.userAvatar} 
                alt={story.userName} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full bg-slate-950 border border-slate-800"
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-300 font-sans max-w-[65px] truncate text-center block leading-tight">
              {story.userName.split(' ')[0]}
            </span>
          </div>
        ))}

        {stories.length === 0 && (
          <div className="flex items-center text-[11px] text-zinc-500 font-medium pl-2 select-none">
             Historias ativas expiraram. Comece postando a primeira! 🥋
          </div>
        )}
      </div>

      {/* STORY VIEWER OVERLAY MODAL */}
      {currentActiveStory && (
        <div className="fixed inset-0 bg-black/95 z-[999] flex flex-col items-center justify-center p-3 sm:p-6 animate-fadeIn text-left">
          
          <div className="w-full max-w-[450px] aspect-[9/16] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative flex flex-col justify-between shadow-2xl">
            
            {/* PROGRESS BARS */}
            <div className="absolute top-3 left-3 right-3 flex gap-1 z-50">
              {stories.map((_, idx) => {
                let p = 0;
                if (idx < (activeStoryIndex || 0)) p = 100;
                if (idx === activeStoryIndex) p = progress;
                return (
                  <div key={idx} className="flex-1 h-1 bg-slate-850 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-400 transition-all duration-100 ease-linear"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* HEADER ATLETA INFO */}
            <div className="p-4 pt-7 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-40 relative">
              <div className="flex items-center gap-2">
                <img 
                  src={currentActiveStory.userAvatar} 
                  alt={currentActiveStory.userName} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-slate-800 bg-slate-950 object-cover"
                />
                <div>
                  <span className="block font-bold text-xs text-white leading-none">{currentActiveStory.userName}</span>
                  <span className="text-[9px] font-bold uppercase text-slate-400 mt-1 block">Faixa {currentActiveStory.userBelt}</span>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-2.5">
                {currentActiveStory.userId === user.id && (
                  <button
                    onClick={() => { setIsPaused(true); setConfirmDelete(true); }}
                    className="p-1 rounded-lg bg-black/35 text-slate-300 hover:text-white cursor-pointer"
                    title="Excluir story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1 rounded-lg bg-black/35 text-slate-300 hover:text-white cursor-pointer"
                  title={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1 rounded-lg bg-black/35 text-slate-350 hover:text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {confirmDelete && (
              <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 p-6" onClick={() => setConfirmDelete(false)}>
                <div className="w-full max-w-[300px] rounded-2xl border border-slate-700 bg-slate-900 p-5 text-center" onClick={e => e.stopPropagation()}>
                  <Trash2 className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-100 mb-1">Excluir este story?</p>
                  <p className="text-xs text-slate-400 mb-4">Essa ação não pode ser desfeita.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-lg border border-slate-700 py-2 text-xs text-slate-200 cursor-pointer">Cancelar</button>
                    <button onClick={handleDeleteStory} className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white cursor-pointer">Excluir</button>
                  </div>
                </div>
              </div>
            )}

            {/* BODY SLIDE DISPLAY */}
            <div className="flex-1 relative flex items-center justify-center p-6 select-none">
              
              {currentActiveStory.mediaType === 'achievement_card' && currentActiveStory.cardData ? (
                // Gamified gold/purple certificate layout
                <div className="w-full py-8 px-6 bg-slate-900/90 border border-slate-800 rounded-2xl relative shadow-2xl text-center space-y-4 overflow-hidden before:absolute before:inset-0 before:bg-radial-gradient before:pointer-events-none">
                  {/* Glowing ambient border depending on theme */}
                  <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none opacity-60 ${
                    currentActiveStory.cardData.bgTheme === 'gold' ? 'border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.2)]' :
                    currentActiveStory.cardData.bgTheme === 'purple' ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' :
                    currentActiveStory.cardData.bgTheme === 'crimson' ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]' :
                    'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  }`} />

                  {/* Icon */}
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center relative">
                    {currentActiveStory.cardData.bgTheme === 'gold' && <Trophy className="w-6 h-6 text-amber-400" />}
                    {currentActiveStory.cardData.bgTheme === 'purple' && <Award className="w-6 h-6 text-purple-400" />}
                    {currentActiveStory.cardData.bgTheme === 'crimson' && <Flame className="w-6 h-6 text-rose-400 animate-bounce" />}
                    {currentActiveStory.cardData.bgTheme === 'ocean' && <Zap className="w-6 h-6 text-cyan-400" />}
                  </div>

                  <div className="space-y-1.5 relative z-10">
                    <h4 className="text-sm font-display font-black text-slate-100 uppercase tracking-widest leading-tight">
                      {currentActiveStory.cardData.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-sans mx-auto leading-relaxed max-w-[240px]">
                      {currentActiveStory.cardData.description}
                    </p>
                  </div>

                  {/* Highlighted Value */}
                  <div className="py-2.5 px-4 bg-slate-950 rounded-xl inline-block border border-slate-800">
                    <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{currentActiveStory.cardData.metricLabel}</span>
                    <span className="font-mono text-xs font-black text-emerald-400 block mt-0.5">{currentActiveStory.cardData.metricValue}</span>
                  </div>

                  {/* Branding */}
                  <div className="pt-3 border-t border-slate-805 text-[9px] font-medium text-slate-500 flex justify-center items-center gap-1 font-mono">
                    <span>👑 JIUSPEAK SOCIAL</span>
                  </div>
                </div>
              ) : (
                // Mídia enviada pelo atleta (foto ou vídeo)
                <div className="absolute inset-x-0 inset-y-0 p-3 h-full">
                  {currentActiveStory.mediaType === 'video' ? (
                    <video
                      src={currentActiveStory.mediaUrl}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover rounded-xl bg-black"
                      style={{ filter: filterCss((currentActiveStory as any).filter) }}
                    />
                  ) : (
                    <img
                      src={currentActiveStory.mediaUrl}
                      alt="Story"
                      className="w-full h-full object-cover rounded-xl"
                      style={{ filter: filterCss((currentActiveStory as any).filter) }}
                    />
                  )}
                  <MentionViewer
                    mentions={((currentActiveStory as any).mentions) || []}
                    onOpenProfile={(_uid, username) => { if (username) window.location.href = '/u/' + username; }}
                  />
                  {(currentActiveStory as any).music && (
                    <StoryAudioPlayer musicId={(currentActiveStory as any).music.id} startAt={(currentActiveStory as any).musicStartAt || 0} />
                  )}
                  {(currentActiveStory as any).music && (
                    <div className="absolute bottom-6 inset-x-6 flex justify-center z-[6]">
                      <MusicChip title={(currentActiveStory as any).music.title} artist={(currentActiveStory as any).music.artist} />
                    </div>
                  )}
                  {currentActiveStory.caption && (
                    <div className="absolute bottom-6 inset-x-6 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 select-text text-slate-100 text-sm text-center backdrop-blur-sm font-semibold">
                      {currentActiveStory.caption}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* SIDE NAVIGATION TOGGLES */}
            <button 
              type="button"
              onClick={handlePrevSlide}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white cursor-pointer z-40 transition-colors"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button 
              type="button"
              onClick={handleNextSlide}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white cursor-pointer z-40 transition-colors"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>

            {/* VIEWERS FOOTER */}
            <div className="p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-center text-[10px] text-slate-500 font-mono z-40 relative">
              Visualizando 1 de {stories.length} publicações do dia
            </div>

          </div>

        </div>
      )}

      {/* CRIAR STORY — TELA FULLSCREEN ESTILO INSTAGRAM */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black z-[990] flex flex-col text-left overflow-hidden animate-fadeIn">
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleStoryUpload} className="hidden" />

          {/* TOPO: fechar + toggle + ferramentas */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
            <button onClick={resetCreator} className="text-white cursor-pointer shrink-0"><X className="w-7 h-7" /></button>

            <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
              <button onClick={() => setStoryType('photo')} className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${storyType === 'photo' ? 'bg-white text-black' : 'text-white/80'}`}>Foto/Vídeo</button>
              <button onClick={() => setStoryType('achievement_card')} className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${storyType === 'achievement_card' ? 'bg-white text-black' : 'text-white/80'}`}>Conquista</button>
            </div>

            {storyType === 'photo' && storyMediaUrl ? (
              <div className="flex items-center gap-4 shrink-0">
                <button onClick={() => { setStoryTextColor(c => STORY_TEXT_COLORS[(STORY_TEXT_COLORS.indexOf(c) + 1) % STORY_TEXT_COLORS.length]); captionRef.current?.focus(); }} title="Texto" className="cursor-pointer">
                  <span className="text-xl font-bold" style={{ color: storyTextColor, textShadow: '0 1px 3px #000', fontFamily: 'Georgia, serif' }}>Aa</span>
                </button>
                <button onClick={() => setShowStoryEmoji(v => !v)} title="Figurinhas" className="cursor-pointer"><Smile className="w-6 h-6" style={{ color: showStoryEmoji ? '#c9a84c' : '#fff' }} /></button>
                <button onClick={() => setShowMentionSearch(true)} title="Mencionar" className="cursor-pointer"><AtSign className="w-6 h-6" style={{ color: storyMentions.length ? '#c9a84c' : '#fff' }} /></button>
                <button onClick={() => setShowMusicPicker(true)} title="Música" className="cursor-pointer text-xl leading-none" style={{ color: storyMusic ? '#c9a84c' : '#fff' }}>🎵</button>
              </div>
            ) : (
              <span className="w-16 shrink-0" />
            )}
          </div>

          {/* CORPO */}
          <div className="flex-1 flex items-center justify-center relative min-h-0">
            {storyType === 'achievement_card' ? (
              <div className="w-full max-w-sm px-6 space-y-3">
                <span className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" /> Escolher conquista de tatame
                </span>
                <div className="space-y-2">
                  {[
                    { id: 'streak', label: '🔥 ' + (user.streak || 5) + ' Dias Consecutivos (Duolingo Style)' },
                    { id: 'p_belt', label: `🥋 Graduação Faixa ${user.belt} (LinkedIn Style)` },
                    { id: 'lvl', label: `🎯 Evolução Nível ${user.level} (XP Milestone)` },
                    { id: 'pvp', label: `⚔️ ${user.winCount || 4} Vitórias na Arena PVP (Strava Style)` }
                  ].map(ach => (
                    <label key={ach.id} className={`flex items-center gap-2.5 p-3 rounded-xl border text-[12px] select-none cursor-pointer transition-colors ${achievementType === ach.id ? 'bg-amber-500/10 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                      <input type="radio" name="achievement_choice" checked={achievementType === ach.id} onChange={() => setAchievementType(ach.id)} className="accent-amber-500" />
                      <span>{ach.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : !storyMediaUrl ? (
              <div className="flex flex-col items-center gap-5 px-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <ImageIcon className="w-9 h-9 text-black" />
                </div>
                <div>
                  <p className="text-white text-lg font-bold mb-1">Criar novo story</p>
                  <p className="text-slate-400 text-xs max-w-[260px] leading-relaxed">Selecione uma foto ou vídeo do dispositivo. Seu story fica visível por 24 horas.</p>
                </div>
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 bg-amber-500 text-black font-bold text-sm px-7 py-3 rounded-full cursor-pointer disabled:opacity-60">
                  <ImageIcon className="w-4 h-4" /> {uploading ? 'Enviando...' : 'Galeria'}
                </button>
              </div>
            ) : (
              <>
                {storyMediaType === 'image'
                  ? <img src={storyPreview!} alt="Preview" className="w-full h-full object-contain" style={{ filter: filterCss(storyFilter) }} />
                  : <video src={storyPreview!} autoPlay loop playsInline className="w-full h-full object-contain bg-black" style={{ filter: filterCss(storyFilter) }} />}

                <MentionEditor mentions={storyMentions} setMentions={setStoryMentions} />

                {/* Faixa de filtros */}
                {storyPreview && (
                  <div className="absolute bottom-24 inset-x-0 z-20 flex gap-2 overflow-x-auto px-3">
                    {STORY_FILTERS.map(f => (
                      <div key={f.id} onClick={() => setStoryFilter(f.id)} className="shrink-0 text-center cursor-pointer">
                        <div className="w-[52px] h-[52px] rounded-lg overflow-hidden" style={{ border: `2px solid ${storyFilter === f.id ? '#c9a84c' : 'transparent'}` }}>
                          {storyMediaType === 'image'
                            ? <img src={storyPreview} className="w-full h-full object-cover" style={{ filter: f.css }} />
                            : <video src={storyPreview} muted className="w-full h-full object-cover" style={{ filter: f.css }} />}
                        </div>
                        <span className="text-[9px] block mt-0.5" style={{ color: storyFilter === f.id ? '#c9a84c' : '#c0c5e0' }}>{f.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {storyCaption.trim() && (
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-2xl font-bold break-words" style={{ color: storyTextColor, textShadow: '0 2px 8px rgba(0,0,0,0.8)', lineHeight: 1.3 }}>{storyCaption}</span>
                  </div>
                )}

                {showStoryEmoji && (
                  <div className="absolute bottom-24 inset-x-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-3 flex flex-wrap gap-1.5 justify-center backdrop-blur">
                    {STORY_EMOJIS.map(em => (
                      <button key={em} onClick={() => { setStoryCaption(c => c + em); captionRef.current?.focus(); }} className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 cursor-pointer">{em}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* RODAPÉ: legenda + publicar */}
          {(storyType === 'achievement_card' || storyMediaUrl) && (
            <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col gap-2 p-4 bg-gradient-to-t from-black/80 to-transparent">
              {storyMusic && <div><MusicChip title={storyMusic.title} artist={storyMusic.artist} onRemove={() => { setStoryMusic(null); setStoryMusicStart(0); }} /></div>}
              <div className="flex items-center gap-3">
              {storyType === 'photo' ? (
                <input ref={captionRef} value={storyCaption} onChange={e => setStoryCaption(e.target.value)} placeholder="Adicionar legenda..."
                  className="flex-1 bg-slate-800/80 border border-slate-700 rounded-full px-4 py-3 text-white text-sm outline-none placeholder-slate-400" />
              ) : (
                <span className="flex-1 text-slate-400 text-xs">Publicar card de conquista no seu diário de tatame.</span>
              )}
              <button onClick={handleCreateStory} disabled={publishing} title="Publicar story"
                className="shrink-0 rounded-full bg-amber-500 flex items-center justify-center cursor-pointer disabled:opacity-60"
                style={{ width: 52, height: 52 }}>
                <Send className="w-5 h-5 text-black" />
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

    </div>
  );
}
