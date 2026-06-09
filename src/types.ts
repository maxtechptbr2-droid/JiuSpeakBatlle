/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BeltRank = 'Branca' | 'Azul' | 'Roxa' | 'Marrom' | 'Preto';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpNextLevel: number;
  belt: BeltRank;
  stripes: number; // 0 to 4
  coins: number; // Kimono Coins (KC)
  elo: number; // PVP Arena Ranking
  winCount: number;
  lossCount: number;
  streak: number; // Daily learning streak
  lastActiveDate?: string; // ISO date format
  academy: string;
  category: string; // Weight category (Pluma, Leve, Médio, Pesada, Absoluto)
  guardsPreference: string; // "Guarda Aberta", "Guarda Fechada", "Guarda Aranha", "Passador"
  submitsPreference: string; // "Armlock", "Mão de Vaca", "Estrangulamento", "Chave de Pé"
  inventory: string[]; // List of item IDs
  enrolledCourses: string[]; // List of course IDs
  unlockedAchievements: string[]; // List of achievement IDs
  subscription: {
    type: 'FREE' | 'PRO' | 'MASTER' | 'Gratuito' | 'Premium VIP' | 'Mestre Gracie';
    expiresAt?: string; // ISO String
    priceBRL: number;
    autoRenew?: boolean;
  };
  role: 'athlete' | 'professor' | 'admin';
  balanceBRL: number; // Legacy balance / maps to balanceAvailableBRL
  balanceAvailableBRL: number; // Saldo disponível para saque
  balancePendingBRL: number;   // Saldo pendente (vendas aprovadas)
  totalEarnedBRL: number;      // Total ganho (faturamento bruto aprovado)
  totalWithdrawnBRL: number;   // Total acumulado que foi sacado
  equippedFrame?: {
    id: string;
    name: string;
    rarity: string;
    description?: string;
    imageUrl?: string;
  } | null;
  onboardingDone?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'gi' | 'belt_stripe' | 'title' | 'avatar' | 'background' | 'badge';
  price: number;
  currency: 'KC' | 'BRL';
  rarity: 'Comum' | 'Raro' | 'Épico' | 'Lendário';
  imageUrl: string;
  sellerId?: string | null; // For peer-to-peer marketplace (null = Official Store)
  sellerName?: string;
  isEquipped?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  avatarInstruction?: string; // AI Coach tips
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string; // Standard video/gif preview illustration
  quiz: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorBadge: BeltRank;
  priceBRL: number;
  rating: number;
  lessons: Lesson[];
  imageUrl: string;
  studentCount: number;
  reviews?: number;
}

export interface Opponent {
  id: string;
  name: string;
  avatar: string;
  elo: number;
  belt: BeltRank;
  stripes: number;
  category: string;
  winCount: number;
  lossCount: number;
}

export type FighterMove = 
  | 'pull_guard'
  | 'double_leg'
  | 'spider_guard'
  | 'sweep'
  | 'armbar_attempt'
  | 'choke_attempt'
  | 'posture_up'
  | 'pass_guard'
  | 'escape_position'
  | 'tap_out';

export interface CombatCard {
  id: FighterMove;
  name: string;
  description: string;
  type: 'offensive' | 'defensive' | 'submission' | 'setup';
  energyCost: number;
  staminaCost: number;
  damagePoints: number;
  staminaDrain: number;
  requiredPosition?: 'feet' | 'guard' | 'top_mount' | 'back_mount' | 'any';
  transitsTo?: 'feet' | 'guard' | 'top_mount' | 'back_mount';
}

export interface CombatState {
  userHp: number; // Focus or submission defense pool (0 - 100)
  userStamina: number; // Performance reserve (0 - 100)
  userPosition: 'feet' | 'guard' | 'top_mount' | 'back_mount';
  opponentHp: number;
  opponentStamina: number;
  opponentPosition: 'feet' | 'guard' | 'top_mount' | 'back_mount';
  log: string[];
  turn: number;
  winner: 'user' | 'opponent' | null;
  submitted: boolean;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBelt: BeltRank;
  content: string;
  timestamp: string;
  authorFrame?: any;
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBelt: BeltRank;
  content: string;
  category: 'Treino' | 'Dúvida' | 'Petiço' | 'Meme' | 'Campeonato';
  upvotes: number;
  hasUpvoted: boolean;
  comments: Comment[];
  timestamp: string;
  authorFrame?: any;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  type: 'security_alert' | 'pix_deposit' | 'withdrawal' | 'market_trade' | 'lesson_completed' | 'cheat';
  description: string;
  amountKC?: number;
  amountBRL?: number;
  status: 'Aprovado' | 'Pendente' | 'Negado';
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon ID string
  xpReward: number;
  coinReward: number;
  isUnlocked: boolean;
  progressMax?: number;
  progressCurrent?: number;
}

export interface MarketplaceItem {
  id: string;
  inventoryItemId: string;
  sellerId: string;
  sellerName: string;
  priceKC: number;
  active: boolean;
  createdAt: string;
  itemDetails?: InventoryItem;
}

export interface MarketplaceSale {
  id: string;
  marketplaceItemId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  pricePaidKC: number;
  feePaidKC: number;
  itemName: string;
  createdAt: string;
  status: 'Seguro' | 'Suspeito' | 'Analise_Manual' | 'Bloqueado';
  riskScore: number;
  securityNotes?: string;
}

