/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Crown, 
  Users, 
  Trophy, 
  Calendar, 
  Sword, 
  MessageSquare, 
  Plus, 
  PlusCircle,
  ThumbsUp, 
  ArrowLeft, 
  CheckCircle, 
  Target, 
  MapPin, 
  Sparkles,
  Search,
  Clock,
  Briefcase,
  AlertCircle,
  UserPlus,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, BeltRank } from '../types';

interface AcademiesCommunitiesProps {
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface Academy {
  id: string;
  name: string;
  crest: string;
  accentColor: string;
  borderAccent: string;
  hoverAccent: string;
  bannerGradient: string;
  points: number;
  membersCount: number;
  motto: string;
  master: string;
  masterBelt: string;
  foundationYear: number;
  challengeStats: { wins: number; losses: number };
}

interface AcademyPost {
  id: string;
  academyId: string;
  authorName: string;
  authorAvatar: string;
  authorBelt: string;
  content: string;
  likes: number;
  likedByUser: boolean;
  timestamp: string;
  category: 'Estudos' | 'Treino' | 'Meme' | 'Técnico';
}

interface AcademyEvent {
  id: string;
  academyId: string;
  title: string;
  date: string;
  instructor: string;
  description: string;
  location: string;
  membersJoined: number;
  isJoinedByUser: boolean;
}

interface AcademyTournament {
  id: string;
  academyId: string;
  name: string;
  beltRestriction: string;
  prizePoolKC: number;
  status: 'Inscrições Abertas' | 'Em Andamento' | 'Concluído';
  competitorsCount: number;
  matches: { round: string; p1: string; p2: string; winner?: string }[];
}

interface AcademyChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  targetId: string;
  targetName: string;
  discipline: string;
  beltRestriction: string;
  prizeKC: number;
  status: 'Pendente' | 'Aceito' | 'Concluído';
  date: string;
  winnerName?: string;
}

export default function AcademiesCommunities({ user, updateUser, showToast }: AcademiesCommunitiesProps) {
  // 1. Initial High-Fidelity Academies List Data
  const initialAcademies: Academy[] = [
    {
      id: 'atama_team',
      name: 'Atama Virtual Team',
      crest: '🥋',
      accentColor: 'from-violet-600 via-indigo-600 to-indigo-800',
      borderAccent: 'border-violet-500/30',
      hoverAccent: 'hover:border-violet-500/60',
      bannerGradient: 'from-violet-950/40 via-indigo-950/20 to-slate-950',
      points: 15400,
      membersCount: 142,
      motto: 'A primeira equipe de língua e luta 100% conectada do Brasil.',
      master: 'Roger Gracie',
      masterBelt: 'Preto',
      foundationYear: 2024,
      challengeStats: { wins: 14, losses: 5 }
    },
    {
      id: 'gracie_barra',
      name: 'Gracie Barra',
      crest: '🔺',
      accentColor: 'from-red-650 via-rose-600 to-rose-850',
      borderAccent: 'border-red-500/30',
      hoverAccent: 'hover:border-red-500/60',
      bannerGradient: 'from-red-950/40 via-slate-950 to-slate-950',
      points: 14850,
      membersCount: 184,
      motto: 'Jiu-Jitsu para Todos • Fluência comunicativa em qualquer tatame.',
      master: 'Carlos Gracie Jr',
      masterBelt: 'Preto 7º Grau',
      foundationYear: 1986,
      challengeStats: { wins: 18, losses: 9 }
    },
    {
      id: 'alliance',
      name: 'Alliance BJJ',
      crest: '🦅',
      accentColor: 'from-emerald-600 via-teal-700 to-emerald-900',
      borderAccent: 'border-emerald-500/30',
      hoverAccent: 'hover:border-emerald-500/60',
      bannerGradient: 'from-emerald-950/40 via-slate-950 to-slate-950',
      points: 13900,
      membersCount: 110,
      motto: 'Disciplina, técnica absurda e controle absoluto na conversação.',
      master: 'Fabio Gurgel',
      masterBelt: 'Preto 6º Grau',
      foundationYear: 1993,
      challengeStats: { wins: 12, losses: 4 }
    },
    {
      id: 'checkmat',
      name: 'Checkmat',
      crest: '♟️',
      accentColor: 'from-amber-600 via-yellow-600 to-amber-800',
      borderAccent: 'border-amber-500/30',
      hoverAccent: 'hover:border-amber-500/60',
      bannerGradient: 'from-amber-950/40 via-slate-950 to-slate-950',
      points: 12100,
      membersCount: 94,
      motto: 'Estratégia xadrez sob pressão e precisão no inglês de combate.',
      master: 'Leo Vieira',
      masterBelt: 'Preto',
      foundationYear: 2008,
      challengeStats: { wins: 9, losses: 7 }
    },
    {
      id: 'nova_uniao',
      name: 'Nova União',
      crest: '⚡',
      accentColor: 'from-cyan-600 via-blue-700 to-blue-900',
      borderAccent: 'border-cyan-500/30',
      hoverAccent: 'hover:border-cyan-500/60',
      bannerGradient: 'from-cyan-950/40 via-slate-950 to-slate-950',
      points: 11200,
      membersCount: 81,
      motto: 'Do peso leve ao absoluto, velocidade técnica e punch linguístico.',
      master: 'André Pederneiras',
      masterBelt: 'Preto',
      foundationYear: 1995,
      challengeStats: { wins: 8, losses: 6 }
    }
  ];

  // 2. Pre-seeded State Data Holders (Using localStorage persistent engine for full rich interaction)
  const [academies, setAcademies] = useState<Academy[]>(() => {
    const saved = localStorage.getItem('bjj_academies_list');
    return saved ? JSON.parse(saved) : initialAcademies;
  });

  const [posts, setPosts] = useState<AcademyPost[]>(() => {
    const saved = localStorage.getItem('bjj_academies_posts');
    if (saved) return JSON.parse(saved);
    
    // Default seeded posts
    return [
      {
        id: 'post_1',
        academyId: 'atama_team',
        authorName: 'Thiago "Filho do Vento"',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        authorBelt: 'Azul',
        content: 'Treino de inglês excelente ontem focado na tradução técnica do mata-leão ("rear naked choke"). Agora sim a explicação está fluida no exterior!',
        likes: 12,
        likedByUser: false,
        timestamp: 'há 10 minutos',
        category: 'Treino'
      },
      {
        id: 'post_2',
        academyId: 'atama_team',
        authorName: 'Fabrícia Guardeira',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        authorBelt: 'Roxa',
        content: 'Como traduzir corretamente as diretrizes para ficar em pé ("stand up") sem soar rude para os gringos? Usei o módulo de estudos e ajudou demais.',
        likes: 8,
        likedByUser: false,
        timestamp: 'há 1 hora',
        category: 'Estudos'
      },
      {
        id: 'post_3',
        academyId: 'gracie_barra',
        authorName: 'Victor Gracie Barra Fan',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        authorBelt: 'Marrom',
        content: 'Atenção alunos! Praticar os termos de arbitragem do JiuSpeak de forma intensa. Os gringos da filiada de Londres vêm visitar semana que vem.',
        likes: 15,
        likedByUser: false,
        timestamp: 'há 2 horas',
        category: 'Meme'
      },
      {
        id: 'post_4',
        academyId: 'alliance',
        authorName: 'Lucas Passador Supremo',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
        authorBelt: 'Preto',
        content: 'Seminário do mestre Gurgel amanhã focado nas variações de "Leg Drag" e a gíria internacional "drag that shin to the mat"!',
        likes: 24,
        likedByUser: false,
        timestamp: 'há 3 horas',
        category: 'Técnico'
      }
    ];
  });

  const [events, setEvents] = useState<AcademyEvent[]>(() => {
    const saved = localStorage.getItem('bjj_academies_events');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'event_1',
        academyId: 'atama_team',
        title: 'Masterclass: Regras Internacionais de Arbitragem da IBJJF',
        date: 'Próxima Sexta, às 19h',
        instructor: 'Referee Principal Douglas',
        description: 'Exposição de termos em inglês obrigatórios exigidos em competições de elite fora do Brasil (Vantagem, Punição, Desclassificação).',
        location: 'Tatame de Voz Integrado',
        membersJoined: 24,
        isJoinedByUser: false
      },
      {
        id: 'event_2',
        academyId: 'atama_team',
        title: 'Sparring Vocabular: Conexões de Raspagem de Meia Guarda',
        date: 'Sábado, às 10h',
        instructor: 'Professora Letícia',
        description: 'Passeio prático focado nas raspagens clássicas e modernas traduzindo no momento real do gancho.',
        location: 'Sala Sparring #3',
        membersJoined: 18,
        isJoinedByUser: false
      },
      {
        id: 'event_3',
        academyId: 'gracie_barra',
        title: 'Workshop Gracie Barra: Comunicação Externa Segura',
        date: 'Terça-feira, às 20h',
        instructor: 'Mestre Carlos Jr.',
        description: 'Focado em networking internacional no mundo do BJJ para atletas que desejam treinar no exterior.',
        location: 'Auditório Principal',
        membersJoined: 42,
        isJoinedByUser: false
      }
    ];
  });

  const [tournaments, setTournaments] = useState<AcademyTournament[]>(() => {
    const saved = localStorage.getItem('bjj_academies_tournaments');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'tour_1',
        academyId: 'atama_team',
        name: 'Taça de Outono de Fluência Atama',
        beltRestriction: 'Todas as Faixas',
        prizePoolKC: 1500,
        status: 'Inscrições Abertas',
        competitorsCount: 16,
        matches: [
          { round: 'Oitavas', p1: 'Guilherme Faixa Azul', p2: 'Thiago Sparring' },
          { round: 'Oitavas', p1: 'Fabrícia Guardeira', p2: 'Claudio Chave de Pé' },
          { round: 'Quartas', p1: 'Vencedor Luta 1', p2: 'Vencedor Luta 2' }
        ]
      },
      {
        id: 'tour_2',
        academyId: 'atama_team',
        name: 'Desafio Interno de Guarda Fechada ("Closed Guard")',
        beltRestriction: 'Iniciantes (Branca e Azul)',
        prizePoolKC: 800,
        status: 'Em Andamento',
        competitorsCount: 8,
        matches: [
          { round: 'Semifinal', p1: 'Lucas Novato', p2: 'Matheus Kimura', winner: 'Lucas Novato' },
          { round: 'Semifinal', p1: 'Gabriel Raspador', p2: 'Enzo Passador', winner: 'Gabriel Raspador' },
          { round: 'Final', p1: 'Lucas Novato', p2: 'Gabriel Raspador' }
        ]
      }
    ];
  });

  const [challenges, setChallenges] = useState<AcademyChallenge[]>(() => {
    const saved = localStorage.getItem('bjj_academies_challenges');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'chall_1',
        challengerId: 'gracie_barra',
        challengerName: 'Gracie Barra',
        targetId: 'atama_team',
        targetName: 'Atama Virtual Team',
        discipline: 'Vocabulário Ativo e Regras',
        beltRestriction: 'Faixa Azul e Roxa',
        prizeKC: 1000,
        status: 'Pendente',
        date: 'Próxima Quinta, 20h'
      },
      {
        id: 'chall_2',
        challengerId: 'alliance',
        challengerName: 'Alliance BJJ',
        targetId: 'checkmat',
        targetName: 'Checkmat',
        discipline: 'Sparring de Áudio AI Real',
        beltRestriction: 'Sem Limites (Absoluto)',
        prizeKC: 1500,
        status: 'Aceito',
        date: 'Próxima Sexta, 21h'
      }
    ];
  });

  // 3. Persist State Changes Whenever They Mutate
  useEffect(() => {
    localStorage.setItem('bjj_academies_list', JSON.stringify(academies));
  }, [academies]);

  useEffect(() => {
    localStorage.setItem('bjj_academies_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('bjj_academies_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('bjj_academies_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem('bjj_academies_challenges', JSON.stringify(challenges));
  }, [challenges]);

  // 4. Interactive UX States
  const [selectedAcademyId, setSelectedAcademyId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'feed' | 'ranking' | 'eventos' | 'campeonatos' | 'desafios'>('info');
  const [academySearch, setAcademySearch] = useState<string>('');
  const [topTabNav, setTopTabNav] = useState<'academies' | 'rankings_league' | 'my_academy'>('academies');

  // Input creation modes
  const [newPostText, setNewPostText] = useState<string>('');
  const [newPostCat, setNewPostCat] = useState<'Estudos' | 'Treino' | 'Meme' | 'Técnico'>('Estudos');
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [showTournamentForm, setShowTournamentForm] = useState<boolean>(false);
  const [showChallengeForm, setShowChallengeForm] = useState<boolean>(false);

  // Forms values
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventInstructor, setEventInstructor] = useState<string>('');
  const [eventDescription, setEventDescription] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventLoc, setEventLoc] = useState<string>('');

  const [tourName, setTourName] = useState<string>('');
  const [tourBeltRest, setTourBeltRest] = useState<string>('Todas as Faixas');
  const [tourPrize, setTourPrize] = useState<number>(500);

  const [challTargetId, setChallTargetId] = useState<string>('');
  const [challDiscipline, setChallDiscipline] = useState<string>('Sparring de Áudio AI Real');
  const [challBeltLimit, setChallBeltLimit] = useState<string>('Todas as Faixas');
  const [challPrizeKC, setChallPrizeKC] = useState<number>(300);

  // 5. Get current selected academy
  const activeAcademy = academies.find(ac => ac.id === selectedAcademyId);
  const userAcademyObj = academies.find(ac => ac.name.toLowerCase() === user.academy.toLowerCase()) || academies[0];

  // Helper to handle joining a new academy community
  const handleJoinAcademy = (academyName: string) => {
    updateUser({ academy: academyName });
    
    // Add dynamic feedback and update state counters
    setAcademies(prev => prev.map(ac => {
      // If user is leaving former academy, decrease former, increase new
      if (ac.name === academyName) {
        return { ...ac, membersCount: ac.membersCount + 1, points: ac.points + 200 };
      }
      if (ac.name === user.academy) {
        return { ...ac, membersCount: Math.max(10, ac.membersCount - 1) };
      }
      return ac;
    }));

    showToast(`Filiação atualizada! Você agora luta pela bandeira "${academyName}". 🥋`, 'success');
  };

  // Helper to publish posts on the internal team feed
  const handleCreateTeamPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || !selectedAcademyId) return;

    const newPost: AcademyPost = {
      id: `post_${Date.now()}`,
      academyId: selectedAcademyId,
      authorName: user.name,
      authorAvatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      authorBelt: user.belt,
      content: newPostText,
      likes: 0,
      likedByUser: false,
      timestamp: 'Agora mesmo',
      category: newPostCat
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');

    // Boost academy points for communication effort
    setAcademies(prev => prev.map(ac => {
      if (ac.id === selectedAcademyId) {
        return { ...ac, points: ac.points + 50 };
      }
      return ac;
    }));

    showToast('Post publicado com sucesso no mural da sua academia!', 'success');
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(pt => {
      if (pt.id === postId) {
        const liked = !pt.likedByUser;
        return {
          ...pt,
          likedByUser: liked,
          likes: pt.likes + (liked ? 1 : -1)
        };
      }
      return pt;
    }));
  };

  // Create customized events for the community
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !selectedAcademyId) {
      showToast('Por favor, preencha o título do evento.', 'error');
      return;
    }

    const newEvent: AcademyEvent = {
      id: `event_${Date.now()}`,
      academyId: selectedAcademyId,
      title: eventTitle,
      date: eventDate || 'Próximo sábado',
      instructor: eventInstructor || user.name,
      description: eventDescription || 'Discussões livres e sparrings técnicos.',
      location: eventLoc || 'Sala de Voz Principal',
      membersJoined: 1,
      isJoinedByUser: true
    };

    setEvents([...events, newEvent]);
    setShowEventForm(false);
    
    // Clear inputs
    setEventTitle('');
    setEventInstructor('');
    setEventDescription('');
    setEventDate('');
    setEventLoc('');

    showToast('Novo evento acadêmico cadastrado com sucesso!', 'success');
  };

  const handleToggleJoinEvent = (eventId: string) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const joined = !ev.isJoinedByUser;
        return {
          ...ev,
          isJoinedByUser: joined,
          membersJoined: ev.membersJoined + (joined ? 1 : -1)
        };
      }
      return ev;
    }));
    showToast('Presença atualizada com sucesso!', 'info');
  };

  // Launch Internal Tournaments
  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourName.trim() || !selectedAcademyId) return;

    const newTour: AcademyTournament = {
      id: `tour_${Date.now()}`,
      academyId: selectedAcademyId,
      name: tourName,
      beltRestriction: tourBeltRest,
      prizePoolKC: tourPrize,
      status: 'Inscrições Abertas',
      competitorsCount: 6,
      matches: [
        { round: 'Semifinal', p1: user.name, p2: 'Thiago Sparring' },
        { round: 'Semifinal', p1: 'Fabrícia Guardeira', p2: 'Claudio Chave de Pé' },
        { round: 'Final', p1: 'A vencer', p2: 'A vencer' }
      ]
    };

    setTournaments([...tournaments, newTour]);
    setShowTournamentForm(false);
    setTourName('');
    setTourPrize(500);

    showToast(`Torneio "${tourName}" lançado na academia!`, 'success');
  };

  // Issue custom Inter-Academy Challenge
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcademyId || !challTargetId) {
      showToast('Selecione uma academia adversária para o desafio!', 'error');
      return;
    }

    const currentAc = academies.find(ac => ac.id === selectedAcademyId);
    const targetAc = academies.find(ac => ac.id === challTargetId);
    if (!currentAc || !targetAc) return;

    if (challTargetId === selectedAcademyId) {
      showToast('Você não pode desafiar a sua própria academia!', 'error');
      return;
    }

    const newChall: AcademyChallenge = {
      id: `chall_${Date.now()}`,
      challengerId: selectedAcademyId,
      challengerName: currentAc.name,
      targetId: challTargetId,
      targetName: targetAc.name,
      discipline: challDiscipline,
      beltRestriction: challBeltLimit,
      prizeKC: challPrizeKC,
      status: 'Pendente',
      date: 'Neste final de semana, às 18h'
    };

    setChallenges([newChall, ...challenges]);
    setShowChallengeForm(false);
    showToast(`Desafio de Tatame enviado para ${targetAc.name}!`, 'success');
  };

  const handleAcceptChallenge = (challId: string) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id === challId) {
        return { ...ch, status: 'Aceito' };
      }
      return ch;
    }));
    showToast('Desafio de Tatame aceito com honras de lutador! Preparem a equipe.', 'success');
  };

  // Get dynamic internal members ranking based on absolute XP / elo metric
  const getInternalRankingList = (academyId: string) => {
    const isAtama = academyId === 'atama_team';
    
    const academyMockUsers = isAtama ? [
      { id: 'usr_roxa', name: 'Fabrícia Guardeira', belt: 'Roxa', level: 14, score: 3200, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
      { id: 'usr_blue', name: 'Thiago "Filho do Vento"', belt: 'Azul', level: 11, score: 2800, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
      { id: 'usr_white', name: 'Lucas Novato', belt: 'Branca', level: 5, score: 1400, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' }
    ] : [
      { id: 'usr_ext1', name: 'Claudio Chave de Pé', belt: 'Marrom', level: 16, score: 3800, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' },
      { id: 'usr_ext2', name: 'Ana Passadora', belt: 'Preta', level: 20, score: 4500, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' }
    ];

    // Append current user dynamically if they belong to this academy
    const joinedAcademy = academies.find(ac => ac.id === academyId);
    const userBelongsHere = joinedAcademy && user.academy.toLowerCase() === joinedAcademy.name.toLowerCase();

    if (userBelongsHere) {
      const userMapped = {
        id: 'me',
        name: `${user.name} (Você)`,
        belt: user.belt,
        level: user.level,
        score: user.xp + (user.level * 1000) + (user.elo > 1000 ? user.elo / 2 : 50),
        avatar: user.avatar
      };
      academyMockUsers.push(userMapped);
    }

    return academyMockUsers.sort((a, b) => b.score - a.score).map((itm, idx) => ({
      ...itm,
      rank: idx + 1
    }));
  };

  // Filter list of academies based on user query
  const filteredAcademies = academies.filter(ac => 
    ac.name.toLowerCase().includes(academySearch.toLowerCase()) || 
    ac.motto.toLowerCase().includes(academySearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-200 p-1 md:p-4 text-left" id="academies-communities-panel">
      
      {/* 1. Header Banner of the Communities Module */}
      <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950/40 p-6 md:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40" />
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-violet-950/40 px-3 py-1 rounded-full border border-violet-500/20 text-xs font-mono font-bold text-violet-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Aliança de Tatames Conectados</span>
          </div>
          <h2 className="font-display font-black text-xl md:text-2xl text-white tracking-widest uppercase">
            Comunidade de Academias
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Lute, jogue e estude vestindo a camisa do seu tatame! Publique em murais da equipe, dispute torneios internos, realize seminários de regras e desafie equipes rivais por honra e Kimono Coins.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[100px]">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">Sua Bandeira</span>
            <span className="font-sans font-black text-xs text-white truncate max-w-[140px] block mt-0.5">
              {user.academy || 'Nenhuma'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top-tier selection Navigation Tabs */}
      <div className="flex border-b border-slate-850 justify-between items-center gap-3">
        <div className="flex gap-2">
          {[
            { id: 'academies', label: '🥋 Todas as Academias', tab: 'academies' },
            { id: 'my_academy', label: '🏆 Sua Academia', tab: 'my_academy' },
            { id: 'rankings_league', label: '📊 Tabela da Liga', tab: 'rankings_league' }
          ].map((tab) => {
            const isActive = topTabNav === tab.tab;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  const isFreePlan = !user.subscription || ['FREE', 'GRATUITO'].includes(user.subscription.type.toUpperCase());
                  if (tab.tab === 'my_academy' && isFreePlan) {
                    showToast("Acesso às academias BJJ é exclusivo para os planos PRO e MASTER. Faça o upgrade para fazer parte de equipes!", "info");
                    return;
                  }
                  setTopTabNav(tab.tab as any);
                  if (tab.tab === 'my_academy') {
                    // Instantly open the user's active academy
                    setSelectedAcademyId(userAcademyObj.id);
                  } else {
                    setSelectedAcademyId(null);
                  }
                }}
                className={`text-xs py-3 px-4 font-black transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-violet-500 text-violet-400 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="text-[10px] bg-slate-950/40 px-3 py-1 rounded-xl border border-slate-850 text-slate-500 font-mono hidden md:block">
          Sua filiação militar ativa: {user.academy}
        </div>
      </div>

      {/* 3. Render content flow depending on the page router state */}
      <AnimatePresence mode="wait">
        
        {/* LEAGUE RANKINGS SUB-VIEW */}
        {topTabNav === 'rankings_league' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
            key="league-rankings-box animate"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              
              <div className="text-center max-w-md mx-auto space-y-1">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto animate-bounce mt-2" />
                <h3 className="font-display font-black text-md text-white uppercase">Campeonato Geral do Tatame Dinâmico</h3>
                <p className="text-xs text-slate-500">
                  Pontuações gerais computadas pela soma de XP, lutas ganhas no PVP e postagens de alto valor pedagógico de todos os membros de cada filiada.
                </p>
              </div>

              {/* STYLISH LEAGUE PODIUM DISPLAY */}
              <div className="grid grid-cols-3 gap-3 pt-6 max-w-2xl mx-auto items-end">
                
                {/* 2nd Place */}
                <div className="text-center space-y-2">
                  <div className="text-3xl">🧩</div>
                  <h4 className="font-bold text-xs text-slate-300 truncate">{academies[1].name}</h4>
                  <div className="bg-slate-850 border border-slate-750/30 rounded-t-2xl p-4 h-24 flex flex-col justify-end">
                    <span className="text-xs font-mono font-black text-amber-500">{academies[1].points} pts</span>
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">2º Lugar</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center space-y-2">
                  <div className="text-4xl animate-bounce">👑</div>
                  <h4 className="font-black text-xs text-violet-400 truncate">{academies[0].name}</h4>
                  <div className="bg-gradient-to-t from-violet-950/40 via-slate-800/80 to-indigo-950/40 border border-violet-500/30 rounded-t-2xl p-4 h-32 flex flex-col justify-end ring-1 ring-violet-500/20">
                    <span className="text-sm font-mono font-black text-violet-300">{academies[0].points} pts</span>
                    <span className="text-[9px] uppercase font-mono text-violet-400 font-extrabold block">Campeão</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center space-y-2">
                  <div className="text-3xl">🦅</div>
                  <h4 className="font-bold text-xs text-slate-300 truncate">{academies[2].name}</h4>
                  <div className="bg-slate-850 border border-slate-755/30 rounded-t-2xl p-4 h-20 flex flex-col justify-end">
                    <span className="text-xs font-mono font-black text-amber-600">{academies[2].points} pts</span>
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">3º Lugar</span>
                  </div>
                </div>

              </div>

              {/* LIST TABLE FOR ALL SQUADS */}
              <div className="space-y-2.5">
                {[...academies].sort((a,b) => b.points - a.points).map((ac, idx) => {
                  const isUserMember = user.academy.toLowerCase() === ac.name.toLowerCase();
                  return (
                    <div 
                      key={ac.id} 
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-colors ${
                        isUserMember 
                          ? 'bg-violet-950/20 border-violet-500/30' 
                          : 'bg-slate-950/40 border-slate-900 hover:bg-slate-950/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-slate-500 w-6">#{idx + 1}</span>
                        <span className="text-2xl">{ac.crest}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-semibold text-xs text-white">{ac.name}</h4>
                            {isUserMember && (
                              <span className="text-[8px] bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded px-1 uppercase font-bold">
                                Minha Equipe
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 italic mt-0.5">{ac.motto}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right shrink-0">
                        <div className="hidden sm:block">
                          <span className="block text-xs font-mono font-black text-slate-300">
                            {ac.membersCount}
                          </span>
                          <span className="text-[8px] uppercase text-slate-500 font-mono">Lutadores</span>
                        </div>
                        <div className="hidden sm:block">
                          <span className="block text-xs font-mono font-black text-emerald-400">
                            {ac.challengeStats.wins}V - {ac.challengeStats.losses}D
                          </span>
                          <span className="text-[8px] uppercase text-slate-500 font-mono">Duelos</span>
                        </div>
                        <div>
                          <span className="block text-xs font-mono font-black text-amber-400">
                            {ac.points}
                          </span>
                          <span className="text-[8px] uppercase text-slate-500 font-mono">Pontos</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </motion.div>
        )}

        {/* LIST OF ALL ACADEMIAS VIEW */}
        {topTabNav === 'academies' && !selectedAcademyId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
            key="academies-cards-flow animate"
          >
            {/* Search Input Filter */}
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2 shadow focus-within:border-violet-500 transition-colors">
                <Search className="w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Pesquisar academia por nome ou filosofia de luta..."
                  value={academySearch}
                  onChange={(e) => setAcademySearch(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-xs text-slate-200 placeholder-slate-500 focus:ring-0"
                />
              </div>
            </div>

            {/* Grid display cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAcademies.length === 0 ? (
                <div className="col-span-full py-16 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
                  Nenhuma academia conectada ao banco de dados com este termo de busca.
                </div>
              ) : (
                filteredAcademies.map((ac) => {
                  const isEquippedUserAcademy = user.academy.toLowerCase() === ac.name.toLowerCase();
                  return (
                    <div 
                      key={ac.id}
                      className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between hover:scale-[1.01] hover:bg-slate-900/90 transition-all duration-200 cursor-pointer shadow-xl relative overflow-hidden group ${ac.borderAccent} ${ac.hoverAccent}`}
                      onClick={() => {
                        const isFreePlan = !user.subscription || ['FREE', 'GRATUITO'].includes(user.subscription.type.toUpperCase());
                        if (isFreePlan) {
                          showToast("Acesso às academias BJJ é exclusivo para os planos PRO e MASTER. Faça o upgrade para fazer parte de equipes!", "info");
                          return;
                        }
                        setSelectedAcademyId(ac.id);
                        setActiveSubTab('info');
                      }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-full blur-xl opacity-60" />
                      
                      <div className="space-y-4">
                        {/* Upper line */}
                        <div className="flex justify-between items-start">
                          <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner shadow-black">
                            {ac.crest}
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-mono font-black text-amber-400">
                              🥇 {ac.points} PTS
                            </span>
                            <span className="text-[8px] uppercase text-slate-500 font-mono mt-0.5">
                              Rendimento Geral
                            </span>
                          </div>
                        </div>

                        {/* Middle title */}
                        <div className="text-left">
                          <h3 className="font-display font-black text-sm text-white flex items-center gap-1.5 uppercase tracking-wide group-hover:text-violet-400 transition-colors">
                            <span>{ac.name}</span>
                          </h3>
                          <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-2 pr-2">
                            "{ac.motto}"
                          </p>
                        </div>

                        {/* Technical info labels */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-950 text-left">
                          <div>
                            <span className="block text-[8px] uppercase text-slate-500 font-mono font-bold leading-none">Mestre</span>
                            <span className="text-[9.5px] font-semibold text-slate-300 truncate block mt-0.5">{ac.master}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase text-slate-500 font-mono font-bold leading-none">Integrantes</span>
                            <span className="text-[9.5px] font-semibold text-slate-300 truncate block mt-0.5">{ac.membersCount} atletas</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer actions/badges detail */}
                      <div className="pt-4 border-t border-slate-800/60 mt-4 flex justify-between items-center text-xs">
                        {isEquippedUserAcademy ? (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 py-1 px-2.5 rounded-full font-black uppercase flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Sua Bandeira Activa
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500 group-hover:text-violet-400 transition-colors font-mono">
                            Ver tatame →
                          </span>
                        )}

                        <span className="text-[9px] text-slate-500 font-mono">
                          {ac.challengeStats.wins}V - {ac.challengeStats.losses}D em desafios
                        </span>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </motion.div>
        )}

        {/* DETAILED VIEW - LANDING PAGE OF A CHOSEN ACADEMY */}
        {selectedAcademyId && activeAcademy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
            key="selected-academy-detail-box animate"
          >
            {/* Back Button and action menu */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedAcademyId(null);
                  if (topTabNav === 'my_academy') {
                    setTopTabNav('academies');
                  }
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl font-bold flex items-center gap-2 cursor-pointer border border-slate-800 text-xs transition-transform hover:-translate-x-0.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Geral</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">Membro desde {activeAcademy.foundationYear}</span>
              </div>
            </div>

            {/* Giant Hero banner specific to that academy */}
            <div className={`relative bg-gradient-to-r ${activeAcademy.bannerGradient} rounded-3xl border ${activeAcademy.borderAccent} p-6 md:p-8 shadow-2xl`}>
              <div className="absolute top-0 right-0 w-[300px] h-full bg-gradient-to-l from-violet-500/10 to-transparent pointer-events-none rounded-r-3xl" />
              
              <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
                {/* School emblem shield badge */}
                <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center text-4xl shadow-inner shadow-black shrink-0 animate-pulse">
                  {activeAcademy.crest}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h2 className="font-display font-black text-2xl text-white tracking-wide uppercase">
                      {activeAcademy.name}
                    </h2>
                    {user.academy.toLowerCase() === activeAcademy.name.toLowerCase() && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        Sua Equipe Oficial
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-violet-300 font-mono tracking-widest italic uppercase font-bold">
                    "{activeAcademy.motto}"
                  </p>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Comandada por Master <strong>{activeAcademy.master}</strong> ({activeAcademy.masterBelt}), esta corporação possui alto rendimento em treinamento online e torneios de sparring físico-inglês!
                  </p>
                </div>

                {/* Switch or join alliance action button */}
                <div className="shrink-0 pt-2">
                  {user.academy.toLowerCase() === activeAcademy.name.toLowerCase() ? (
                    <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl font-black text-xs text-center flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Alinhamento Ativo
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoinAcademy(activeAcademy.name)}
                      className="px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-550 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-violet-500/25 cursor-pointer transition-transform hover:scale-[1.02] flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" /> Filiar-se Gratuitamente
                    </button>
                  )}
                </div>
              </div>

              {/* Grid indicators list */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-950 mt-6 text-left">
                <div>
                  <span className="block text-[8px] uppercase text-slate-500 font-mono font-bold">Pontuação Acumulada</span>
                  <span className="text-sm font-mono font-black text-amber-400">🥇 {activeAcademy.points}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase text-slate-500 font-mono font-bold">Membros Ativos</span>
                  <span className="text-sm font-mono font-black text-slate-100">{activeAcademy.membersCount} Atletas</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase text-slate-500 font-mono font-bold">Vitórias em Desafios</span>
                  <span className="text-sm font-mono font-black text-emerald-400">{activeAcademy.challengeStats.wins} Vitórias</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase text-slate-500 font-mono font-bold">Fundado em</span>
                  <span className="text-sm font-mono font-black text-slate-100">{activeAcademy.foundationYear} DC</span>
                </div>
              </div>

            </div>

            {/* Inner Sub tabs switcher */}
            <div className="flex border-b border-slate-800 whitespace-nowrap overflow-x-auto no-scrollbar gap-1.5 pb-0.5">
              {[
                { id: 'info', label: '🏟️ Visão Geral' },
                { id: 'feed', label: '💬 Mural & Discussões' },
                { id: 'ranking', label: '📊 Ranking Interno' },
                { id: 'eventos', label: '📅 Eventos da Equipe' },
                { id: 'campeonatos', label: '🏆 Campeonatos Ativos' },
                { id: 'desafios', label: '⚔️ Desafios com Rivais' }
              ].map((subTab) => {
                const isActive = activeSubTab === subTab.id;
                return (
                  <button
                    key={subTab.id}
                    onClick={() => {
                      setActiveSubTab(subTab.id as any);
                      // Clear forms is modal is changed
                      setShowEventForm(false);
                      setShowTournamentForm(false);
                      setShowChallengeForm(false);
                    }}
                    className={`text-[11px] py-2 px-3 rounded-xl cursor-pointer font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 border border-slate-800 text-violet-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {subTab.label}
                  </button>
                );
              })}
            </div>

            {/* Sub views selectors */}
            <div className="space-y-6">
              
              {/* TAB 1: VISÃO GERAL */}
              {activeSubTab === 'info' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  
                  {/* Left Column stats details (Col span 2) */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <h4 className="font-display font-black text-xs text-white uppercase tracking-wider">
                        Filosofia e Métodos da {activeAcademy.name}
                      </h4>
                      <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                        <p>
                          A filiação à {activeAcademy.name} permite que você junte suas forças técnicas de jiu-jitsu com o estudo internacional linguístico necessário para dar palestras, seminar, lutar no exterior ou arbitrar eventos de ponta.
                        </p>
                        <p>
                          Nesta equipe, você treina com colegas do mesmo fardamento que oferecem sparring de conversação diários, organizam chamadas de vídeo temáticas com áudio em alta definição e competem por recompensas em Kimono Coins patrocinadas pelas lojas afiliadas.
                        </p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-3">
                        <Compass className="w-5 h-5 text-violet-450 shrink-0" />
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Dica do Coach: Publique no mural da equipe para tirar dúvidas diretamente com os faixas-pretas afiliados! Isso gera +50 pontos de rendimento de equipe instantaneamente.
                        </p>
                      </div>
                    </div>

                    {/* Show recent events preview */}
                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-display font-black text-xs text-white uppercase tracking-wider">
                          Próximo Evento Destacado
                        </h4>
                        <span 
                          onClick={() => setActiveSubTab('eventos')}
                          className="text-[10px] text-violet-400 hover:underline cursor-pointer"
                        >
                          Ver calendário →
                        </span>
                      </div>

                      {events.filter(ev => ev.academyId === activeAcademy.id).slice(0, 1).map(ev => (
                        <div key={ev.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex justify-between items-center gap-3">
                          <div className="space-y-1">
                            <span className="text-[9px] bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800 text-violet-400 font-mono">
                              {ev.date}
                            </span>
                            <h5 className="font-bold text-xs text-white mt-1">{ev.title}</h5>
                            <p className="text-[10px] text-slate-400 truncate max-w-sm">{ev.description}</p>
                          </div>
                          <button 
                            onClick={() => handleToggleJoinEvent(ev.id)}
                            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            {ev.isJoinedByUser ? 'Confirmado ✓' : 'Inscrever-se'}
                          </button>
                        </div>
                      ))}

                      {events.filter(ev => ev.academyId === activeAcademy.id).length === 0 && (
                        <div className="text-center py-6 text-[11px] text-slate-500 italic">
                          Nenhum evento registrado hoje para esta bandeira.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right column quick internal members and challenge stats overview */}
                  <div className="space-y-6">
                    
                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <h4 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-yellow-500" />
                        <span>Top Luta Interno</span>
                      </h4>
                      
                      <div className="space-y-2">
                        {getInternalRankingList(activeAcademy.id).slice(0, 3).map((rk, idx) => (
                          <div key={rk.id} className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-950 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[10px] text-slate-500 font-bold">#{idx+1}</span>
                              <img src={rk.avatar} alt="" className="w-6 h-6 rounded-full border border-slate-800 shrink-0 object-cover" />
                              <span className="text-[11px] font-bold text-slate-200 truncate">{rk.name}</span>
                            </div>
                            <span className="text-[9px] font-mono font-black text-violet-400">{rk.belt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Challenge Stats banner mini */}
                    <div className="bg-gradient-to-br from-indigo-950/20 to-slate-950 p-5 rounded-2xl border border-indigo-500/20 text-center space-y-2 relative">
                      <Sword className="w-6 h-6 text-violet-400 mx-auto animate-pulse" />
                      <h4 className="text-white text-xs font-black uppercase">Ficha Militar de Duelos</h4>
                      <p className="text-[10px] text-slate-400">
                        Nossos gladiadores acumulam <strong>{activeAcademy.challengeStats.wins} vitórias</strong> contra <strong>{activeAcademy.challengeStats.losses} derrotas</strong> na liga inter-academias.
                      </p>
                      <button 
                        onClick={() => setActiveSubTab('desafios')}
                        className="w-full py-1.5 bg-indigo-900/35 hover:bg-violet-900/40 border border-indigo-700/35 hover:border-violet-600 rounded text-[9.5px] font-mono text-indigo-300 font-bold uppercase cursor-pointer"
                      >
                        Nova Intimação →
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: MURAL / TEAM FEED */}
              {activeSubTab === 'feed' && (
                <div className="space-y-4 text-left">
                  
                  {/* Create post box specific inside the academy */}
                  <form 
                    onSubmit={handleCreateTeamPost}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl"
                  >
                    <div className="flex gap-3 items-center">
                      <img src={user.avatar} alt="Me" className="w-8 h-8 rounded-full border border-slate-800 shrink-0 object-cover" />
                      <div className="flex-1">
                        <textarea 
                          placeholder={`Escrever algo importante no mural da equipe "${activeAcademy.name}"...`}
                          value={newPostText}
                          onChange={(e) => setNewPostText(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all font-semibold resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-slate-850 gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-mono text-[9px] uppercase">Categoria:</span>
                        <select 
                          value={newPostCat}
                          onChange={(e: any) => setNewPostCat(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg text-[9.5px] px-2 py-1 text-slate-300 focus:outline-none"
                        >
                          <option value="Estudos">📚 Dúvida de Estudo / Glossário</option>
                          <option value="Treino">🥋 Feedback de Sparring</option>
                          <option value="Meme">😂 Resenha de Quimono / Meme</option>
                          <option value="Técnico">🧠 Técnica / Arbitragem</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-[10.5px] cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        Publicar Mural 🚀
                      </button>
                    </div>
                  </form>

                  {/* Feed stream list inside this academy */}
                  <div className="space-y-4">
                    {posts.filter(p => p.academyId === activeAcademy.id).map((pt) => (
                      <div key={pt.id} className="bg-slate-900 border border-slate-850/80 rounded-2xl p-4 space-y-3.5 shadow-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={pt.authorAvatar} alt="" className="w-7 h-7 rounded-full border border-slate-800 shrink-0 object-cover" />
                            <div className="min-w-0 leading-tight">
                              <span className="block text-[11.5px] font-bold text-slate-100 truncate">{pt.authorName}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[7.5px] bg-slate-950 text-slate-400 font-mono px-1 rounded uppercase font-black">
                                  Faixa {pt.authorBelt}
                                </span>
                                <span className="text-[8.5px] text-slate-500 font-mono">{pt.timestamp}</span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[9.5px] bg-indigo-950/30 text-indigo-300 border border-indigo-900/35 py-0.5 px-2 rounded-full font-bold">
                            #{pt.category}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pl-1">
                          {pt.content}
                        </p>

                        <div className="pt-2 border-t border-slate-850/60 flex items-center justify-between text-xs text-slate-500">
                          <button
                            onClick={() => handleLikePost(pt.id)}
                            className={`flex items-center gap-1.5 font-mono cursor-pointer transition-colors hover:text-slate-300 ${
                              pt.likedByUser ? 'text-violet-400' : 'text-slate-500'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${pt.likedByUser ? 'fill-violet-500 text-violet-400' : ''}`} />
                            <span>Apoiar ({pt.likes})</span>
                          </button>

                          <span className="text-[9.5px] font-mono">Bandeira Oficial {activeAcademy.crest}</span>
                        </div>
                      </div>
                    ))}

                    {posts.filter(p => p.academyId === activeAcademy.id).length === 0 && (
                      <div className="py-20 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800/60 rounded-3xl">
                        Nenhuma discussão cadastrada na {activeAcademy.name} até o momento. Escreva o primeiro post!
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 3: RANKING INTERNO */}
              {activeSubTab === 'ranking' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 text-left">
                  <div className="border-b border-slate-800/80 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-display font-black text-xs text-white uppercase tracking-wider">
                        Tabela de Liderança Oficial da Equipe
                      </h4>
                      <p className="text-[10px] text-slate-500">As posições mudam automaticamente à medida que os colegas acumulam XP estudando.</p>
                    </div>

                    <span className="text-[9.5px] font-mono text-violet-400 font-bold bg-violet-950/20 border border-violet-900/30 px-3 py-1 rounded-full">
                      Liga Ativa
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {getInternalRankingList(activeAcademy.id).map((rk, idx) => {
                      const isMe = rk.id === 'me' || rk.name.includes('(Você)');
                      return (
                        <div 
                          key={rk.id} 
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isMe 
                              ? 'bg-violet-950/25 border-violet-500/40 ring-1 ring-violet-500/10' 
                              : 'bg-slate-950/40 border-slate-950 hover:bg-slate-950/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Positions icon / order badge */}
                            <div className="w-8 shrink-0 flex justify-center text-xs font-mono text-slate-500 font-extrabold">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`}
                            </div>

                            <img src={rk.avatar} alt="Photo" className="w-8 h-8 rounded-full border border-slate-800 shrink-0 object-cover" />

                            <div>
                              <span className={`block text-xs font-bold leading-none ${isMe ? 'text-violet-400' : 'text-slate-100'}`}>
                                {rk.name}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono uppercase mt-1 block">
                                Nível {rk.level} • Faixa {rk.belt}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="block font-mono text-xs font-black text-amber-400 leading-none">
                              {rk.score}
                            </span>
                            <span className="text-[7.5px] uppercase font-mono font-bold text-slate-500 mt-1 block">
                              Graus d'estudo
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* TAB 4: EVENTOS */}
              {activeSubTab === 'eventos' && (
                <div className="space-y-4 text-left">
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Inscreva-se em treinamentos coletivos de audio-coach:</span>
                    <button
                      onClick={() => setShowEventForm(!showEventForm)}
                      className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer shadow shadow-violet-600/10"
                    >
                      <PlusCircle className="w-4 h-4" /> Marcar Aulão / Treinamento
                    </button>
                  </div>

                  {/* Form toggle overlay card */}
                  <AnimatePresence>
                    {showEventForm && (
                      <motion.form
                        onSubmit={handleCreateEvent}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-xl pointer-events-none" />
                        
                        <h4 className="font-display font-black text-xs text-violet-400 uppercase tracking-wider">Apreçar Novo Evento da Equipe</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Tema do Aulão / Título</label>
                            <input 
                              type="text" 
                              placeholder="ex: Terminologia de Raspagem Profunda"
                              value={eventTitle}
                              onChange={(e) => setEventTitle(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-xs text-slate-200 placeholder-slate-600"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Instrutor / Professor</label>
                            <input 
                              type="text" 
                              placeholder="ex: Mestre Roger Gracie"
                              value={eventInstructor}
                              onChange={(e) => setEventInstructor(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-xs text-slate-200 placeholder-slate-600"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Data e Horário</label>
                            <input 
                              type="text" 
                              placeholder="ex: Próxima Quarta, às 19h"
                              value={eventDate}
                              onChange={(e) => setEventDate(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-xs text-slate-200 placeholder-slate-600"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Localização / URL da Conversa</label>
                            <input 
                              type="text" 
                              placeholder="ex: Tatame Conversação Ativo"
                              value={eventLoc}
                              onChange={(e) => setEventLoc(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-xs text-slate-200 placeholder-slate-600"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Breve Descrição didática</label>
                          <textarea 
                            placeholder="Descreva o que os estudantes irão aprender neste encontro..."
                            value={eventDescription}
                            onChange={(e) => setEventDescription(e.target.value)}
                            rows={2}
                            className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-xs text-slate-200 placeholder-slate-600 resize-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2 text-xs">
                          <button 
                            type="button" 
                            onClick={() => setShowEventForm(false)}
                            className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            className="px-6 py-2 bg-violet-600 text-white rounded-xl font-bold cursor-pointer hover:bg-violet-500"
                          >
                            Publicar Evento Oficial
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Events listings list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.filter(ev => ev.academyId === activeAcademy.id).map((ev) => (
                      <div 
                        key={ev.id} 
                        className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700/60 transition-all ${
                          ev.isJoinedByUser ? 'border-violet-500/20' : 'border-slate-850/80'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] bg-slate-950 border border-slate-850 text-violet-400 font-mono px-2.5 py-1 rounded-full font-black">
                              📅 {ev.date}
                            </span>
                            <span className="text-[8.5px] text-slate-500 font-mono">
                              👤 {ev.membersJoined} confirmados
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-xs text-white max-w-sm">{ev.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-1">{ev.description}</p>
                          </div>

                          <div className="bg-slate-950 p-2 rounded-xl text-[9px] text-slate-400 space-y-0.5 text-left">
                            <p><strong>Coach/Orador:</strong> {ev.instructor}</p>
                            <p><strong>Localidade:</strong> {ev.location}</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-850/60 mt-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleJoinEvent(ev.id)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                              ev.isJoinedByUser
                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {ev.isJoinedByUser ? 'Vou estar presente ✓' : 'Inscrever-se no aulão'}
                          </button>
                        </div>
                      </div>
                    ))}

                    {events.filter(ev => ev.academyId === activeAcademy.id).length === 0 && (
                      <div className="col-span-full py-16 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-801/60 rounded-3xl">
                        Nenhum evento registrado nesta academia. Que tal criar um?
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 5: CAMPEONATOS */}
              {activeSubTab === 'campeonatos' && (
                <div className="space-y-4 text-left">
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Torneios e Copas de chaves estruturadas internas para ganhar KC:</span>
                    <button
                      onClick={() => setShowTournamentForm(!showTournamentForm)}
                      className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" /> Lançar Campeonato Interno
                    </button>
                  </div>

                  {/* Tournament launch form */}
                  <AnimatePresence>
                    {showTournamentForm && (
                      <motion.form
                        onSubmit={handleCreateTournament}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl"
                      >
                        <h4 className="font-display font-black text-xs text-violet-400 uppercase">Parametrizar Chave de Campeonato</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Nome da Copa / Copa Interna</label>
                            <input 
                              type="text" 
                              placeholder="ex: Open Atama Absoluto"
                              value={tourName}
                              onChange={(e) => setTourName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-xs text-slate-200"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Restrição de Faixa</label>
                            <select 
                              value={tourBeltRest}
                              onChange={(e) => setTourBeltRest(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2 rounded-xl text-xs text-slate-300"
                            >
                              <option value="Todas as Faixas">Todas as Faixas</option>
                              <option value="Iniciante (Branca e Azul)">Iniciante (Branca e Azul)</option>
                              <option value="Apenas Elite (Preta/Marrom)">Apenas Elite (Preta/Marrom)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Premiação (KC)</label>
                            <input 
                              type="number" 
                              value={tourPrize}
                              onChange={(e) => setTourPrize(parseInt(e.target.value || '100'))}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-xs text-slate-200"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 text-xs">
                          <button type="button" onClick={() => setShowTournamentForm(false)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl">
                            Cancelar
                          </button>
                          <button type="submit" className="px-6 py-2 bg-violet-600 text-white rounded-xl font-bold">
                            Lançar Chaves do Campeonato
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Tournament lists grids */}
                  <div className="space-y-6">
                    {tournaments.filter(tr => tr.academyId === activeAcademy.id).map((tr) => (
                      <div key={tr.id} className="bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-4 shadow-md">
                        
                        <div className="flex justify-between items-center border-b border-slate-850 pb-3 flex-wrap gap-2">
                          <div>
                            <h4 className="font-display font-black text-xs text-white uppercase">{tr.name}</h4>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono">
                              Restrição: {tr.beltRestriction} • 🏅 {tr.prizePoolKC} KC de prêmio
                            </p>
                          </div>

                          <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase ${
                            tr.status === 'Inscrições Abertas' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {tr.status}
                          </span>
                        </div>

                        {/* Interactive Tournament bracket tree display */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {tr.matches.map((lc, lIdx) => (
                            <div key={lIdx} className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 relative text-[11px]">
                              <span className="text-[8px] uppercase text-slate-500 font-mono block border-b border-slate-900 pb-1">
                                {lc.round} #{lIdx+1}
                              </span>
                              
                              <div className="space-y-1.5 font-mono">
                                <div className={`flex justify-between items-center p-1 rounded ${lc.winner === lc.p1 ? 'bg-emerald-950/20 text-emerald-400 font-black' : 'text-slate-350'}`}>
                                  <span>{lc.p1}</span>
                                  {lc.winner === lc.p1 && <span className="text-[8px] uppercase bg-emerald-500/10 text-emerald-400 px-1 rounded font-black">Ganhou</span>}
                                </div>
                                <div className="text-center text-[9px] text-slate-600 font-bold">- VS -</div>
                                <div className={`flex justify-between items-center p-1 rounded ${lc.winner === lc.p2 ? 'bg-emerald-950/20 text-emerald-400 font-black' : 'text-slate-350'}`}>
                                  <span>{lc.p2}</span>
                                  {lc.winner === lc.p2 && <span className="text-[8px] uppercase bg-emerald-500/10 text-emerald-400 px-1 rounded font-black">Ganhou</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {tr.status === 'Inscrições Abertas' && (
                          <div className="pt-2 text-right">
                            <button
                              onClick={() => {
                                showToast('Você se inscreveu de forma oficial nesta chave de campeonato!', 'success');
                                setTournaments(prev => prev.map(t => {
                                  if (t.id === tr.id) {
                                    return { 
                                      ...t, 
                                      competitorsCount: t.competitorsCount + 1,
                                      status: 'Em Andamento'
                                    };
                                  }
                                  return t;
                                }));
                              }}
                              className="px-5 py-2 bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-300 rounded-xl font-bold font-mono text-[9px] uppercase cursor-pointer"
                            >
                              🥋 Entrar na Chave do Torneio
                            </button>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 6: DESAFIOS ENTRE ACADEMIAS */}
              {activeSubTab === 'desafios' && (
                <div className="space-y-4 text-left">
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Intime outras corporações de Jiu-Jitsu para competirem em duelos de áudio/área pvp de sparring:</span>
                    <button
                      onClick={() => setShowChallengeForm(!showChallengeForm)}
                      className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Sword className="w-4 h-4 animate-spin-slow" /> Intimar Academia Rival
                    </button>
                  </div>

                  {/* Challenge submission form */}
                  <AnimatePresence>
                    {showChallengeForm && (
                      <motion.form
                        onSubmit={handleCreateChallenge}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl"
                      >
                        <h4 className="font-display font-black text-xs text-red-400 uppercase flex items-center gap-1.5">
                          <Sword className="w-4 h-4" /> Configurar Intimação Bélica de Tatame
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Alvo a Desafiar</label>
                            <select 
                              value={challTargetId} 
                              onChange={(e) => setChallTargetId(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-xs text-slate-300"
                              required
                            >
                              <option value="">-- Escolha a Equipe --</option>
                              {academies.filter(ac => ac.id !== selectedAcademyId).map(ac => (
                                <option key={ac.id} value={ac.id}>{ac.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Disciplina do Duelo</label>
                            <select 
                              value={challDiscipline} 
                              onChange={(e) => setChallDiscipline(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2 rounded-xl text-xs text-slate-300"
                            >
                              <option value="Sparring de Áudio AI Real">Sparring de Áudio AI Real</option>
                              <option value="Vocabulário Ativo e Regras">Vocabulário Ativo e Regras</option>
                              <option value="Submissão Gramatical de Chaves">Submissão Gramatical de Chaves</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Restrição de Faixa</label>
                            <select 
                              value={challBeltLimit} 
                              onChange={(e) => setChallBeltLimit(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2 rounded-xl text-xs text-slate-300"
                            >
                              <option value="Todas as Faixas">Todas as Faixas</option>
                              <option value="Apenas Faixa Azul">Apenas Faixa Azul</option>
                              <option value="Elite (Apenas Roxa/Preta)">Elite (Apenas Roxa/Preta)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] uppercase text-slate-500 font-mono block">Bilhete / Aposta (KC)</label>
                            <input 
                              type="number" 
                              value={challPrizeKC} 
                              onChange={(e) => setChallPrizeKC(parseInt(e.target.value || '100'))}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-xs text-slate-300"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 text-xs">
                          <button type="button" onClick={() => setShowChallengeForm(false)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl">
                            Arrepender-se
                          </button>
                          <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-550 text-white rounded-xl font-bold cursor-pointer">
                            Enfiar o Pé no Balde / Desafiar
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* List of active challenges/duels */}
                  <div className="space-y-3">
                    {challenges.filter(ch => ch.challengerId === activeAcademy.id || ch.targetId === activeAcademy.id).map((ch) => {
                      const isTargetOurAcademy = ch.targetId === activeAcademy.id;
                      return (
                        <div key={ch.id} className="bg-slate-900 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow shadow-black">
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-white">{ch.challengerName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">DESAFIOU</span>
                              <span className="text-xs font-black text-rose-450">{ch.targetName}</span>
                            </div>

                            <p className="text-[10px] text-slate-400 font-sans">
                              Modalidade: <strong>{ch.discipline}</strong> • Nível: <strong>{ch.beltRestriction}</strong>
                            </p>
                            <p className="text-[9px] text-indigo-400 font-mono select-none">
                              📅 Luta agendada: {ch.date} • Aposta: 🪙 {ch.prizeKC} KC
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-3">
                            <span className={`text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded border ${
                              ch.status === 'Pendente' 
                                ? 'bg-slate-950 border-slate-800 text-slate-500'
                                : 'bg-green-500/10 border-green-500/20 text-green-400'
                            }`}>
                              {ch.status}
                            </span>

                            {ch.status === 'Pendente' && isTargetOurAcademy && (
                              <button
                                onClick={() => handleAcceptChallenge(ch.id)}
                                className="px-4 py-1.5 bg-gradient-to-r from-red-650 to-orange-600 hover:from-red-555 text-white font-black text-[9px] rounded-lg uppercase cursor-pointer"
                              >
                                Aceitar Combate ⚔️
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}

                    {challenges.filter(ch => ch.challengerId === activeAcademy.id || ch.targetId === activeAcademy.id).length === 0 && (
                      <div className="py-16 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800/60 rounded-3xl">
                        Nenhum duelo de tatame agendado hoje. Escreva uma nova intimação de honra!
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
