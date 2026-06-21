/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  InventoryItem, 
  Course, 
  Opponent, 
  CombatCard, 
  SocialPost, 
  AuditLog, 
  Achievement 
} from './types';
import { avatarMappingList } from './avatarMapping';


// Peer-to-Peer marketplace items with custom sellers
export const INITIAL_MARKETPLACE_ITEMS: InventoryItem[] = [];

// Duolingo-style structured learning syllabus
export const COURSES: Course[] = [];

// Matchmaking Pool for PVP simulation
export const OPPONENTS_POOL: Opponent[] = [
  {
    id: 'opp_marcolino',
    name: 'Rafael Almeida',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rafael%20Almeida&backgroundColor=4a60ff&radius=50&mouth=smile&eyebrows=variant01,variant06,variant07,variant08',
    elo: 1150,
    belt: 'Azul',
    stripes: 2,
    category: 'Médio',
    winCount: 45,
    lossCount: 38
  },
  {
    id: 'opp_renato',
    name: 'João Pedro',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jo%C3%A3o%20Pedro&backgroundColor=7e49ff&radius=50&mouth=smile&eyebrows=variant01,variant06,variant07,variant08',
    elo: 1300,
    belt: 'Roxa',
    stripes: 1,
    category: 'Pena',
    winCount: 78,
    lossCount: 42
  },
  {
    id: 'opp_carla',
    name: 'Ana Beatriz',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ana%20Beatriz&backgroundColor=ff4a5a&radius=50&mouth=smile&eyebrows=variant02,variant03,variant04,variant05',
    elo: 1450,
    belt: 'Roxa',
    stripes: 4,
    category: 'Leve',
    winCount: 112,
    lossCount: 65
  },
  {
    id: 'opp_braulio',
    name: 'Matheus Lima',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Matheus%20Lima&backgroundColor=ffffff&radius=50&mouth=smile&eyebrows=variant01,variant06,variant07,variant08',
    elo: 1680,
    belt: 'Marrom',
    stripes: 3,
    category: 'Pesada',
    winCount: 160,
    lossCount: 95
  },
  {
    id: 'opp_helio',
    name: 'Maria Clara',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maria%20Clara&backgroundColor=4a60ff&radius=50&mouth=smile&eyebrows=variant02,variant03,variant04,variant05',
    elo: 2200,
    belt: 'Preto',
    stripes: 4,
    category: 'Absoluto',
    winCount: 540,
    lossCount: 110
  }
];

// Tactical Battle Deck
export const COMBAT_CARDS: CombatCard[] = [
  {
    id: 'pull_guard',
    name: 'Puxar para a Guarda',
    description: 'Evita a queda direta do adversário e traz o jogo para o chão de forma segura.',
    type: 'setup',
    energyCost: 15,
    staminaCost: 10,
    damagePoints: 5,
    staminaDrain: 5,
    requiredPosition: 'feet',
    transitsTo: 'guard'
  },
  {
    id: 'double_leg',
    name: 'Double Leg Explosivo',
    description: 'Queda clássica! Atira-se nas duas pernas com cabeçada na costela e ganha controle de cima.',
    type: 'offensive',
    energyCost: 25,
    staminaCost: 20,
    damagePoints: 18,
    staminaDrain: 10,
    requiredPosition: 'feet',
    transitsTo: 'top_mount'
  },
  {
    id: 'spider_guard',
    name: 'Defesa de Guarda Aranha',
    description: 'Estica um braço por vez e cansa o adversário com o apoio constante nos bíceps.',
    type: 'defensive',
    energyCost: 10,
    staminaCost: 10,
    damagePoints: 0,
    staminaDrain: 25,
    requiredPosition: 'guard'
  },
  {
    id: 'sweep',
    name: 'Raspagem de Balão',
    description: 'Puxa o adversário acima do abdômen e joga-o de costas usando a alavanca dos joelhos.',
    type: 'offensive',
    energyCost: 20,
    staminaCost: 15,
    damagePoints: 12,
    staminaDrain: 15,
    requiredPosition: 'guard',
    transitsTo: 'top_mount'
  },
  {
    id: 'pass_guard',
    name: 'Passagem emborrachada',
    description: 'Joga o quadril, mata os dois joelhos dele em concha e abraça a cabeça passando solidamente.',
    type: 'offensive',
    energyCost: 25,
    staminaCost: 25,
    damagePoints: 14,
    staminaDrain: 12,
    requiredPosition: 'guard',
    transitsTo: 'top_mount'
  },
  {
    id: 'posture_up',
    name: 'Posturar no Tráfego',
    description: 'Trava os cotovelos no quadril adversário, ergue as costas e respira profundamente para recuperar suas forças.',
    type: 'defensive',
    energyCost: 0,
    staminaCost: -30, // Recovers Stamina
    damagePoints: 0,
    staminaDrain: 0,
    requiredPosition: 'any'
  },
  {
    id: 'escape_position',
    name: 'Explodir na Ponte (Upa)',
    description: 'Ponte de quadril ultra explosiva para escapar do sufoco da montada.',
    type: 'defensive',
    energyCost: 15,
    staminaCost: 25,
    damagePoints: 5,
    staminaDrain: 10,
    requiredPosition: 'top_mount',
    transitsTo: 'guard'
  },
  {
    id: 'armbar_attempt',
    name: 'Chave de Braço (Armlock)',
    description: 'Isola o pulso, passa a perna sobre a cabeça e traciona o quadril para engrenar a finalização.',
    type: 'submission',
    energyCost: 35,
    staminaCost: 20,
    damagePoints: 35,
    staminaDrain: 15,
    requiredPosition: 'top_mount'
  },
  {
    id: 'choke_attempt',
    name: 'Mata-Leão Pelas Costas',
    description: 'Arbusto de gola ajustável e trave de bíceps direto no pescoço adversário. Finalização infalível!',
    type: 'submission',
    energyCost: 40,
    staminaCost: 15,
    damagePoints: 45,
    staminaDrain: 20,
    requiredPosition: 'back_mount'
  },
  {
    id: 'tap_out',
    name: 'Três Tapinhas (Desistir)',
    description: 'Preserve sua integridade física virtuais. Desiste da peleja amigavelmente.',
    type: 'defensive',
    energyCost: 0,
    staminaCost: 0,
    damagePoints: -100,
    staminaDrain: 0,
    requiredPosition: 'any'
  }
];

// Initial Social Discord Feed Sandbox - Cleared as requested to use only SQL posts
export const INITIAL_SOCIAL_POSTS: SocialPost[] = [];

// Achievements milestones
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_class',
    title: 'Faixa Amarrada',
    description: 'Complete o seu primeiro módulo de lição conceitual teórica.',
    icon: 'BookOpen',
    xpReward: 150,
    coinReward: 200,
    isUnlocked: false
  },
  {
    id: 'streak_3',
    title: 'Leão dos Treinos',
    description: 'Mantenha um streak diário de 3 dias de aprendizado ativo.',
    icon: 'Flame',
    xpReward: 300,
    coinReward: 400,
    isUnlocked: false,
    progressMax: 3,
    progressCurrent: 1
  },
  {
    id: 'first_pvp_win',
    title: 'Finalizador de Primeira',
    description: 'Vença sua primeira luta estratégica na Arena PvP contra uma inteligência artificial ou lutador.',
    icon: 'Sword',
    xpReward: 500,
    coinReward: 500,
    isUnlocked: false
  },
  {
    id: 'stripe_unlocked',
    title: 'Grau Conquistado',
    description: 'Suba o seu perfil para o nível 5 para ganhar o seu primeiro grau na faixa virtual.',
    icon: 'Award',
    xpReward: 400,
    coinReward: 300,
    isUnlocked: false,
    progressMax: 5,
    progressCurrent: 1
  },
  {
    id: 'millionaire',
    title: 'Passador Rico',
    description: 'Acumule mais de 2.000 JiuTickets simultaneamente em seu inventário.',
    icon: 'Coins',
    xpReward: 300,
    coinReward: 250,
    isUnlocked: false,
    progressMax: 2000,
    progressCurrent: 500
  }
];

// Initial Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit_001',
    userId: 'system_core',
    userName: 'Controle de Ingressos',
    type: 'security_alert',
    description: 'Novo login autenticado a partir de endereço IP não-maquiado do atleta.',
    status: 'Aprovado',
    timestamp: '2026-06-02T10:15:00Z'
  },
  {
    id: 'audit_002',
    userId: 'user_4593',
    userName: 'Guilherme Faixa Azul',
    type: 'pix_deposit',
    description: 'Recarga de 1000 JiuTickets aprovada via PIX Simulador.',
    amountBRL: 19.90,
    status: 'Aprovado',
    timestamp: '2026-06-02T11:24:00Z'
  },
  {
    id: 'audit_003',
    userId: 'prof_alliance',
    userName: 'Prof. Fábio Gurgel',
    type: 'withdrawal',
    description: 'Pedido de saque de comissões Hotmart/Creator processado para chave PIX cadastrada.',
    amountBRL: 420.00,
    status: 'Aprovado',
    timestamp: '2026-06-02T12:00:00Z'
  }
];
