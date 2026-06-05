/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Dumbbell 
} from 'lucide-react';
import { UserProfile, BeltRank } from '../types';

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
  mediaType: 'photo' | 'video' | 'achievement_card';
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
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [mediaUrlInput, setMediaUrlInput] = useState<string>('');
  const [storyType, setStoryType] = useState<'photo' | 'achievement_card'>('photo');
  
  const [achievementType, setAchievementType] = useState<string>('streak');

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

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let payload: any = {
        mediaType: storyType,
        mediaUrl: mediaUrlInput || undefined
      };

      if (storyType === 'achievement_card') {
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
          metricValue: `${user.streak || 5} Dias Secutivos`,
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

        payload.cardData = cardDataObj;
        payload.mediaUrl = "https://images.unsplash.com/photo-1517438476312-10d79c07750d?auto=format&fit=crop&q=80&w=600";
      }

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
        setShowCreateModal(false);
        setMediaUrlInput('');
        fetchStories();
      } else {
        showToast("Erro ao publicar story.", "error");
      }
    } catch (err) {
      showToast("Erro de rede.", "error");
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
                // Standard visual unsplash image
                <div className="absolute inset-x-0 inset-y-0 p-3 h-full">
                  <img 
                    src={currentActiveStory.mediaUrl} 
                    alt="Story image" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute bottom-6 inset-x-6 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 select-text text-slate-300 text-xs text-center backdrop-blur-sm">
                    Estudo de transições no quimono pesado e treinos contínuos de Jiu-Jitsu. Oss! 🥋🔥
                  </div>
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

      {/* CREATE STORY DIALOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-[990] p-4 text-left">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-mono font-black text-white flex items-center gap-1.5 uppercase">
                <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                <span>Adicionar ao Diário</span>
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-450 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo do Story:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStoryType('photo')}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      storyType === 'photo' 
                        ? 'bg-violet-605/10 border-violet-500 text-violet-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-450'
                    }`}
                  >
                    <Dumbbell className="w-4 h-4" />
                    <span>Foto de Treino</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryType('achievement_card')}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      storyType === 'achievement_card' 
                        ? 'bg-violet-605/10 border-violet-500 text-violet-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-450'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Card de Conquista</span>
                  </button>
                </div>
              </div>

              {storyType === 'photo' ? (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">URL da Foto do Quimono:</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/your-bjj-photo"
                    value={mediaUrlInput}
                    onChange={(e) => setMediaUrlInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 rounded-xl text-slate-205 placeholder-slate-500"
                  />
                  <p className="text-[9.5px] text-slate-500 leading-normal">Selecione uma imagem válida da internet para exibir aos seguidores.</p>
                </div>
              ) : (
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-1.5">Escolher conquista de tatame:</span>
                  <div className="space-y-1">
                    {[
                      { id: 'streak', label: '🔥 ' + (user.streak || 5) + ' Dias Consecutivos (Duolingo Style)' },
                      { id: 'p_belt', label: `🥋 Graduação Faixa ${user.belt} (LinkedIn Style)` },
                      { id: 'lvl', label: `🎯 Evolução Nível ${user.level} (XP Milestone)` },
                      { id: 'pvp', label: `⚔️ ${user.winCount || 4} Vitórias na Arena PVP (Strava Style)` }
                    ].map(ach => (
                      <label key={ach.id} className="flex items-center gap-2.5 p-1.5 hover:bg-slate-900 rounded text-[11px] text-slate-350 select-none cursor-pointer">
                        <input 
                          type="radio" 
                          name="achievement_choice"
                          checked={achievementType === ach.id}
                          onChange={() => setAchievementType(ach.id)}
                          className="accent-violet-500"
                        />
                        <span>{ach.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-colors"
              >
                Publicar no Diário de Tatame
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
