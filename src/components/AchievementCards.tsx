/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  Flame, 
  Sparkles, 
  Share2, 
  Link, 
  Check, 
  Upload, 
  ArrowRight,
  Download,
  BookOpen
} from 'lucide-react';
import { UserProfile } from '../types';
import { AvatarWithFrame } from './AvatarWithFrame';

interface AchievementCardsProps {
  user: UserProfile;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onPostCreated: () => void;
}

interface AchievementCard {
  id: string;
  type: string;
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  badgeIcon: any;
  borderTheme: string;
  glowTheme: string;
  isUnlocked: boolean;
}

export function AchievementCards({ user, showToast, onPostCreated }: AchievementCardsProps) {
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [sharingCardId, setSharingCardId] = useState<string | null>(null);

  const translateBelt = (b: string) => {
    switch (String(b).toUpperCase()) {
      case 'WHITE': return 'Branca';
      case 'BLUE': return 'Azul';
      case 'PURPLE': return 'Roxa';
      case 'BROWN': return 'Marrom';
      case 'BLACK': return 'Preto';
      default: return b;
    }
  };

  const getBeltBg = (belt: string) => {
    switch (String(belt).toUpperCase()) {
      case 'WHITE':
      case 'BRANCA':
        return 'bg-white text-slate-850';
      case 'BLUE':
      case 'AZUL':
        return 'bg-blue-600 text-white';
      case 'PURPLE':
      case 'ROXA':
        return 'bg-purple-700 text-white';
      case 'BROWN':
      case 'MARROM':
        return 'bg-amber-900 text-white';
      case 'BLACK':
      case 'PRETO':
        return 'bg-slate-900 border border-red-500 text-red-500';
      default:
        return 'bg-slate-900 text-slate-400';
    }
  };

  const achievementCards: AchievementCard[] = [
    {
      id: 'belt_prog',
      type: 'BELT',
      title: `Evolução de Faixa: ${translateBelt(user.belt)}`,
      description: "Graduação oficial conquistada com honra através do mérito e esforço no tatame.",
      metricLabel: "Status Faixa",
      metricValue: `${translateBelt(user.belt)} (${user.stripes || 0} Graus)`,
      badgeIcon: Award,
      borderTheme: 'border-yellow-500 bg-slate-950',
      glowTheme: 'shadow-[0_0_15px_rgba(234,179,8,0.25)]',
      isUnlocked: true
    },
    {
      id: 'xp_level',
      type: 'LEVEL',
      title: `Graduado Nível ${user.level}`,
      description: "Conclusão contínua de aulas mentais e teóricas sobre a biomecânica do Jiu-Jitsu.",
      metricLabel: "XP de Atleta",
      metricValue: `${user.xp} XP totalizados`,
      badgeIcon: Sparkles,
      borderTheme: 'border-cyan-500/80 bg-slate-950',
      glowTheme: 'shadow-[0_0_15px_rgba(6,182,212,0.25)]',
      isUnlocked: user.level >= 1
    },
    {
      id: 'streak_30',
      type: 'STREAK',
      title: `Foco Supremo: ${user.streak || 5} Dias`,
      description: "Persistência inabalável estudando Jiu-Jitsu diariamente sem interrupções.",
      metricLabel: "Frequência",
      metricValue: `${user.streak || 5} Dias Seguidos`,
      badgeIcon: Flame,
      borderTheme: 'border-rose-500 bg-slate-950',
      glowTheme: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]',
      isUnlocked: (user.streak || 0) >= 1
    },
    {
      id: 'pvp_milestone',
      type: 'ARENA',
      title: `Guerreiro: ${user.winCount || 4} Vitórias`,
      description: "Dominância incontestável na arena PVP superando oponentes em quizzes de tatame.",
      metricLabel: "Combates Vencidos",
      metricValue: `${user.winCount || 4} Vitórias Reais`,
      badgeIcon: Trophy,
      borderTheme: 'border-purple-500 bg-slate-950',
      glowTheme: 'shadow-[0_0_15px_rgba(168,85,247,0.25)]',
      isUnlocked: (user.winCount || 0) >= 1
    },
    {
      id: 'course_comp',
      type: 'MODULE',
      title: "Mestre Teórico",
      description: "Curso avançado de técnicas e conceitos de alavancas anatômicas finalizado com sucesso.",
      metricLabel: "Treinos",
      metricValue: "Concluído",
      badgeIcon: BookOpen,
      borderTheme: 'border-emerald-500/80 bg-slate-950',
      glowTheme: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      isUnlocked: (user.enrolledCourses || []).length >= 1
    }
  ];

  // Trigger official Canvas visual image sharing card builder
  const handleShareCard = (card: AchievementCard) => {
    let type: 'nova_faixa' | 'novo_nivel' | 'top_ranking' | 'avatar_raro' | 'moldura_lendaria' | 'vitoria_pvp' | 'nova_conquista' = 'nova_conquista';
    if (card.id === 'belt_prog') type = 'nova_faixa';
    else if (card.id === 'xp_level') type = 'novo_nivel';
    else if (card.id === 'pvp_milestone') type = 'vitoria_pvp';

    window.dispatchEvent(new CustomEvent('trigger-viral-share', {
      detail: {
        type,
        customTitle: card.title.toUpperCase()
      }
    }));
    showToast("Gerador de Compartilhamento Viral carregado com sua conquista!", "success");
  };

  // Convert visual card to Official Post inside global feed!
  const handlePublishToFeed = async (card: AchievementCard) => {
    try {
      const token = localStorage.getItem('token');
      const textContent = `🏆 [CONQUISTA DO ATHLETA] Acabo de desbloquear o card oficial: "${card.title}"! \n\n"${card.description}"\n\n📌 Status: ${card.metricValue} | ELO: ${user.elo || 1000} \n\n#JiuSpeakConquistas #TatameConectado #JiuJitsu`;
      
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: textContent,
          category: 'Treino'
        })
      });

      if (res.ok) {
        showToast("Sua conquista automática de medalha foi listada no feed!", "success");
        onPostCreated();
      } else {
        showToast("Não foi possível transferir conquista ao feed.", "error");
      }
    } catch (err) {
      showToast("Erro ao conectar com o servidor.", "error");
    }
  };

  return (
    <div className="space-y-4" id="bjj-achievement-cards">
      <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div>
          <h4 className="font-display font-extrabold text-xs text-white">Visualização de Conquistas Individuais</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Clique para carregar cards dinâmicos do ranking no Instagram Bio ou Whatsapp.</p>
        </div>
        <span className="text-[9px] bg-amber-400/20 border border-amber-400/30 text-amber-400 font-mono font-bold py-0.5 px-2 rounded-md uppercase shrink-0">
          Oficial
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievementCards.map((card) => {
          const IconComponent = card.badgeIcon;
          
          return (
            <div 
              key={card.id}
              className={`rounded-2xl border p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${card.borderTheme} ${card.glowTheme} ${
                card.isUnlocked ? 'opacity-100 hover:scale-[1.01]' : 'opacity-50 select-none'
              }`}
            >
              {/* Card Ribbon Branding */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-amber-400 shrink-0">
                    <IconComponent className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-[12px] text-slate-100 truncate max-w-[150px] uppercase tracking-wider">{card.title}</h5>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block mt-0.5">Certificado JIUSPEAK</span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end">
                  <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${getBeltBg(user.belt)}`}>
                    🥋 {translateBelt(user.belt)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[10.5px] text-slate-400 leading-normal font-sans py-3 min-h-[50px]">
                {card.description}
              </p>

              {/* Target / Stats details preview */}
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-xs">
                <div className="leading-none text-left">
                  <span className="text-[8px] uppercase font-bold text-slate-500 block">{card.metricLabel}</span>
                  <span className="font-mono text-[11px] font-black text-emerald-400 block mt-1">{card.metricValue}</span>
                </div>
                
                {/* Visual Avatar with cosmetic dynamic frames */}
                <AvatarWithFrame
                  avatarUrl={user.profilePhoto || user.avatar}
                  userName={user.name}
                  frame={user.equippedFrame}
                  size="xs"
                />
              </div>

              {/* Actions list */}
              {card.isUnlocked ? (
                <div className="flex gap-2 pt-3.5 mt-3.5 border-t border-slate-900/60 text-xs">
                  <button
                    type="button"
                    onClick={() => handleShareCard(card)}
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold font-mono text-[10px] rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Enviar para Redes Sociais"
                  >
                    {copiedCardId === card.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 text-violet-400" />
                    )}
                    <span>{copiedCardId === card.id ? "Copiado!" : "Enviar"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePublishToFeed(card)}
                    className="flex-1 py-1.5 px-2 bg-violet-600 hover:bg-violet-500 text-white font-bold font-mono text-[10px] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Compartilhar Conquistas no Feed principal"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Postar Feed</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3.5 mt-3.5 border-t border-slate-900/60 text-[10px] font-mono font-bold text-slate-500 text-center uppercase tracking-wider">
                  ⚠️ Atividade Bloqueada
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
