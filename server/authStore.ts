import bcrypt from 'bcrypt';
import { getPrisma } from './db';

// Unified type representation for authentication states
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // matches 'password' field in Prisma
  role: 'ATHLETE' | 'INSTRUCTOR' | 'ADMIN';
  isAdminApproved: boolean;
  belt: 'WHITE' | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK' | 'RED';
  stripes: number;
  xp: number;
  level: number;
  elo: number;
  avatar?: string | null;
  coins?: number;
  balanceAvailableBRL?: number;
  balancePendingBRL?: number;
  totalEarnedBRL?: number;
  totalWithdrawnBRL?: number;
  isEmailVerified: boolean;
  isSuspended?: boolean;
  isBanned?: boolean;
  verificationToken: string | null;
  resetToken: string | null;
  resetTokenExpires: Date | null;
  refreshToken: string | null;
}

// Deprecated in-memory store preserved as an empty map for import-compatibility but completely unused
export const inMemoryUsers: Map<string, AuthUser> = new Map();

export const simulatedSentEmails: Array<{
  id: string;
  to: string;
  subject: string;
  body: string;
  token: string;
  timestamp: Date;
}> = [];

// Seed initial test administrative and athlete accounts into the PostgreSQL database.
export const seedInitialUsers = async () => {
  const adminPassHash = await bcrypt.hash('98922678aA', 10);
  const userPassHash = await bcrypt.hash('user123', 10);

  // Set up inMemoryUsers (fallback memory store)
  const usersToSeed: AuthUser[] = [
    {
      id: 'user_admin_test_1',
      email: 'maxtechptbr@gmail.com',
      name: 'Mestre Carlos (ADMIN)',
      passwordHash: adminPassHash,
      role: 'ADMIN',
      isAdminApproved: true,
      belt: 'BLACK',
      stripes: 4,
      xp: 2500,
      level: 30,
      elo: 2200,
      isEmailVerified: true,
      verificationToken: null,
      resetToken: null,
      resetTokenExpires: null,
      refreshToken: null,
      coins: 5000,
      balanceAvailableBRL: 1500.00,
      balancePendingBRL: 350.00,
      totalEarnedBRL: 1850.00,
      totalWithdrawnBRL: 0.00
    },
    {
      id: 'user_admin_test_con',
      email: 'maxtechptbr@gmail.con',
      name: 'Mestre Carlos (SUPER ADMIN)',
      passwordHash: adminPassHash,
      role: 'ADMIN',
      isAdminApproved: true,
      belt: 'BLACK',
      stripes: 4,
      xp: 2500,
      level: 30,
      elo: 2200,
      isEmailVerified: true,
      verificationToken: null,
      resetToken: null,
      resetTokenExpires: null,
      refreshToken: null,
      coins: 5000,
      balanceAvailableBRL: 1500.00,
      balancePendingBRL: 350.00,
      totalEarnedBRL: 1850.00,
      totalWithdrawnBRL: 0.00
    },
    {
      id: 'user_admin_test_9',
      email: 'maxtechptbr9@gmail.com',
      name: 'Mestre Carlos 9 (ADMIN)',
      passwordHash: adminPassHash,
      role: 'ADMIN',
      isAdminApproved: true,
      belt: 'BLACK',
      stripes: 4,
      xp: 3000,
      level: 35,
      elo: 2300,
      isEmailVerified: true,
      verificationToken: null,
      resetToken: null,
      resetTokenExpires: null,
      refreshToken: null,
      coins: 6000,
      balanceAvailableBRL: 2500.00,
      balancePendingBRL: 500.00,
      totalEarnedBRL: 3000.00,
      totalWithdrawnBRL: 0.00
    },
    {
      id: 'user_athlete_test_1',
      email: 'usuario@jiuspeak.com',
      name: 'Fabio Gurgel Fan (USER)',
      passwordHash: userPassHash,
      role: 'ATHLETE',
      isAdminApproved: true,
      belt: 'WHITE',
      stripes: 1,
      xp: 120,
      level: 2,
      elo: 1050,
      isEmailVerified: false,
      verificationToken: 'initial_verify_token_example_123',
      resetToken: null,
      resetTokenExpires: null,
      refreshToken: null,
      coins: 2200,
      balanceAvailableBRL: 420.00,
      balancePendingBRL: 155.00,
      totalEarnedBRL: 575.00,
      totalWithdrawnBRL: 0.00
    }
  ];

  for (const u of usersToSeed) {
    inMemoryUsers.set(u.id, u);
  }

  if (process.env.NODE_ENV === "production") {
    console.log("⚠️ Production Mode: Seeding test accounts or seed users bypassed.");
    return;
  }

  const prisma = getPrisma();
  if (!prisma) return;

  try {
    // 1. Seed Admin Accounts
    const adminExists = await prisma.user.findFirst({
      where: { email: 'maxtechptbr@gmail.com' }
    });

    if (!adminExists) {
      await prisma.user.create({
        data: {
          id: 'user_admin_test_1',
          email: 'maxtechptbr@gmail.com',
          name: 'Mestre Carlos (ADMIN)',
          password: adminPassHash,
          role: 'ADMIN',
          isAdminApproved: true,
          belt: 'BLACK',
          stripes: 4,
          xp: 2500,
          level: 30,
          elo: 2200,
          isEmailVerified: true,
          wallet: {
            create: {
              balanceKC: 5000,
              balanceAvailable: 1500.00,
              balanceBRL: 1500.00,
              balancePending: 350.00,
              totalEarned: 1850.00,
              totalWithdrawn: 0.00,
            }
          },
          inventory: {
            create: {}
          }
        }
      });
      console.log('🌱 Admin user "maxtechptbr@gmail.com" seeded successfully inside Postgres.');
    } else {
      // Keep credentials perfectly in sync with requested updates
      await prisma.user.update({
        where: { id: adminExists.id },
        data: {
          email: 'maxtechptbr@gmail.com',
          password: adminPassHash,
          role: 'ADMIN',
          isAdminApproved: true
        }
      });
      console.log('🌱 Admin credentials updated successfully to match user intent.');
    }

    // Seed Admin Account maxtechptbr@gmail.con
    const adminConExists = await prisma.user.findFirst({
      where: { email: 'maxtechptbr@gmail.con' }
    });

    if (!adminConExists) {
      await prisma.user.create({
        data: {
          id: 'user_admin_test_con',
          email: 'maxtechptbr@gmail.con',
          name: 'Mestre Carlos (SUPER ADMIN)',
          password: adminPassHash,
          role: 'ADMIN',
          isAdminApproved: true,
          belt: 'BLACK',
          stripes: 4,
          xp: 2500,
          level: 30,
          elo: 2200,
          isEmailVerified: true,
          wallet: {
            create: {
              balanceKC: 5000,
              balanceAvailable: 1500.00,
              balanceBRL: 1500.00,
              balancePending: 350.00,
              totalEarned: 1850.00,
              totalWithdrawn: 0.00,
            }
          },
          inventory: {
            create: {}
          }
        }
      });
      console.log('🌱 Admin user "maxtechptbr@gmail.con" seeded successfully inside Postgres.');
    } else {
      await prisma.user.update({
        where: { id: adminConExists.id },
        data: {
          email: 'maxtechptbr@gmail.con',
          password: adminPassHash,
          role: 'ADMIN',
          isAdminApproved: true
        }
      });
      console.log('🌱 Admin "maxtechptbr.con" credentials updated successfully.');
    }

    // Seed Second Admin Account maxtechptbr9@gmail.com (current workspace environment user)
    const admin9Exists = await prisma.user.findFirst({
      where: { email: 'maxtechptbr9@gmail.com' }
    });

    if (!admin9Exists) {
      await prisma.user.create({
        data: {
          id: 'user_admin_test_9',
          email: 'maxtechptbr9@gmail.com',
          name: 'Mestre Carlos 9 (ADMIN)',
          password: adminPassHash,
          role: 'ADMIN',
          belt: 'BLACK',
          stripes: 4,
          xp: 3000,
          level: 35,
          elo: 2300,
          isEmailVerified: true,
          wallet: {
            create: {
              balanceKC: 6000,
              balanceAvailable: 2500.00,
              balanceBRL: 2500.00,
              balancePending: 500.00,
              totalEarned: 3000.00,
              totalWithdrawn: 0.00,
            }
          },
          inventory: {
            create: {}
          }
        }
      });
      console.log('🌱 Admin user "maxtechptbr9@gmail.com" seeded successfully inside Postgres.');
    } else {
      await prisma.user.update({
        where: { id: admin9Exists.id },
        data: {
          role: 'ADMIN',
          password: adminPassHash
        }
      });
      console.log('🌱 Admin "maxtechptbr9" role updated safely to ADMIN.');
    }

    // 2. Seed Standard Test Athlete Account
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [
          { id: 'user_athlete_test_1' },
          { email: 'usuario@jiuspeak.com' }
        ]
      }
    });

    if (!userExists) {
      await prisma.user.create({
        data: {
          id: 'user_athlete_test_1',
          email: 'usuario@jiuspeak.com',
          name: 'Fabio Gurgel Fan (USER)',
          password: userPassHash,
          role: 'ATHLETE',
          belt: 'WHITE',
          stripes: 1,
          xp: 120,
          level: 2,
          elo: 1050,
          isEmailVerified: false,
          verificationToken: 'initial_verify_token_example_123',
          wallet: {
            create: {
              balanceKC: 2200,
              balanceAvailable: 420.00,
              balanceBRL: 420.00,
              balancePending: 155.00,
              totalEarned: 575.00,
              totalWithdrawn: 0.00,
            }
          },
          inventory: {
            create: {}
          }
        }
      });
      console.log('🌱 Athlete user "usuario@jiuspeak.com" seeded successfully inside Postgres.');
    } else {
      // Keep password in sync for athlete
      await prisma.user.update({
        where: { id: userExists.id },
        data: {
          password: userPassHash
        }
      });
      console.log('🌱 Athlete test credentials updated successfully.');
    }

  } catch (error) {
    console.error('❌ Critical error seeding initial user accounts into PostgreSQL:', error);
  }
};

// Seed initial Store cosmetics into PostgreSQL database.
export const seedStoreProducts = async () => {
  const prisma = getPrisma();
  if (!prisma) return;

  try {
    const count = await prisma.storeProduct.count();
    if (count >= 130) {
      console.log('✅ Store already has at least 130 seeded products. Skipping product seeding.');
      return;
    }

    const seedProducts = [
      // ==========================================
      // AVATARS (30 items)
      // ==========================================
      {
        id: "prod_avatar_pitbull",
        name: "Avatar: Pitbull Lendário",
        description: "O lendário cão de combate do tatame pronto para rolar.",
        priceKC: 1500,
        category: "AVATAR",
        rarity: "LEGENDARY",
        imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_cyber_samurai",
        name: "Avatar: Samurai Cibernético",
        description: "Espírito guerreiro ancestral revestido de armadura tecnológica.",
        priceKC: 5000,
        category: "AVATAR",
        rarity: "LEGENDARY",
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_panda_bjj",
        name: "Avatar: Mestre Panda BJJ",
        description: "Aparência calma, mas joga com pressão pesada de cem quilos.",
        priceKC: 800,
        category: "AVATAR",
        rarity: "EPIC",
        imageUrl: "https://images.unsplash.com/photo-1508138221679-760a23a2285b?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_chapa",
        name: "Avatar: Chapa Quente",
        description: "Aquele atleta do rola solto e do gás infinito.",
        priceKC: 300,
        category: "AVATAR",
        rarity: "COMMON",
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=85&w=200"
      },
      {
        id: "prod_avatar_shogun",
        name: "Avatar: Shogun Supremo",
        description: "O líder militar supremo da dinastia de guerreiros do Dojô.",
        priceKC: 7500,
        category: "AVATAR",
        rarity: "MYTHIC",
        imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_ninja_shadow",
        name: "Avatar: Sombra do Shinobi",
        description: "Sorrateiro e letal na penumbra, mestre das chaves de pé.",
        priceKC: 4000,
        category: "AVATAR",
        rarity: "LEGENDARY",
        imageUrl: "https://images.unsplash.com/photo-1555679427-1f6dfcce188b?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_mestre_antigo",
        name: "Avatar: Grão-Mestre de Elite",
        description: "Guardião da linhagem pura do jiu-jitsu tradicional.",
        priceKC: 8050,
        category: "AVATAR",
        rarity: "MYTHIC",
        imageUrl: "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_lioness_matte",
        name: "Avatar: Leoa do Absoluto",
        description: "Sua determinação a consagra rainha do tatame competitivo.",
        priceKC: 3500,
        category: "AVATAR",
        rarity: "LEGENDARY",
        imageUrl: "https://images.unsplash.com/photo-1602491453977-63adc9f4a56f?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_ronin_bjj",
        name: "Avatar: Ronin Errante",
        description: "Sem mestre fixo, coleciona medalhas em todas as federações.",
        priceKC: 2500,
        category: "AVATAR",
        rarity: "EPIC",
        imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_guard_passer",
        name: "Avatar: Passador Implacável",
        description: "Especialista em amassar guardas flexíveis com técnica ancestral.",
        priceKC: 1200,
        category: "AVATAR",
        rarity: "RARE",
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_berimbolo_king",
        name: "Avatar: Rei do Berimbolo",
        description: "Gira como pião na velocidade da luz para pegar as costas.",
        priceKC: 2200,
        category: "AVATAR",
        rarity: "EPIC",
        imageUrl: "https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_championship_gold",
        name: "Avatar: Campeão do Grand Slam",
        description: "Ostentando o ouro nos maiores palcos esportivos do globo.",
        priceKC: 1900,
        category: "AVATAR",
        rarity: "EPIC",
        imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b5a19adf?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_oss_avatar",
        name: "Avatar: Boneco do Dojo",
        description: "Humilde, focado e sempre pronto para levar cem amassos ao dia.",
        priceKC: 350,
        category: "AVATAR",
        rarity: "COMMON",
        imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_faixa_preta_pro",
        name: "Avatar: Samurai Faixa Preta",
        description: "Sua vida é consagrada aos princípios e técnicas de combate refinado.",
        priceKC: 4500,
        category: "AVATAR",
        rarity: "LEGENDARY",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_samurai_cat",
        name: "Avatar: Felino do Dojô",
        description: "Tem sete vidas e cai em pé em todas as tentativas de queda.",
        priceKC: 1500,
        category: "AVATAR",
        rarity: "EPIC",
        imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_gorilla_press",
        name: "Avatar: Gorila da Pressão",
        description: "Usa e abusa da força física aliada ao posicionamento perfeito.",
        priceKC: 3804,
        category: "AVATAR",
        rarity: "LEGENDARY",
        imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_leglock_monster",
        name: "Avatar: Monstro do Leglock",
        description: "Um mergulhador das pernas, perigo garantido se pisar perto dele.",
        priceKC: 2400,
        category: "AVATAR",
        rarity: "EPIC",
        imageUrl: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_kimono_azul",
        name: "Avatar: Competidor de Azul",
        description: "Guerreiro clássico trajando armadura azul de lona trançada.",
        priceKC: 1000,
        category: "AVATAR",
        rarity: "RARE",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_kimono_branco",
        name: "Avatar: Iniciante Perseverante",
        description: "Seu kimono branco ainda está limpo, mas a determinação é cinza.",
        priceKC: 250,
        category: "AVATAR",
        rarity: "COMMON",
        imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_speedy_ninja",
        name: "Avatar: Ninja Veloz",
        description: "Especialista em transições acrobáticas no tatame do futuro.",
        priceKC: 1100,
        category: "AVATAR",
        rarity: "RARE",
        imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_as_do_absoluto",
        name: "Avatar: Ás do Absoluto",
        description: "O atleta mais leve que enfileira gigantes no topo dos pódios.",
        priceKC: 3200,
        category: "AVATAR",
        rarity: "LEGENDARY",
        imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_tatame_kid",
        name: "Avatar: Garoto do Tatame",
        description: "Treina desde os 4 anos de idade, mestre na arte das chaves.",
        priceKC: 950,
        category: "AVATAR",
        rarity: "RARE",
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_velha_guarda",
        name: "Avatar: Veterano Velha Guarda",
        description: "Guarda fechada inexpugnável e piadas antigas antes de amassar.",
        priceKC: 2101,
        category: "AVATAR",
        rarity: "EPIC",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_guardeiro_sinistro",
        name: "Avatar: Guardeiro Macabro",
        description: "Te puxa pra guarda com um sorriso assustador na cara.",
        priceKC: 1050,
        category: "AVATAR",
        rarity: "RARE",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_dragao_tatame",
        name: "Avatar: Dragão Reluzente",
        description: "Representação do espírito mitológico que guia lutadores lendários.",
        priceKC: 9000,
        category: "AVATAR",
        rarity: "MYTHIC",
        imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_tigre_bjj",
        name: "Avatar: Tigre de Bengala BJJ",
        description: "Velocidade feroz e garras afiadas para finalizar em 12 segundos.",
        priceKC: 3600,
        category: "AVATAR",
        rarity: "LEGENDARY",
        imageUrl: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_faixa_coral",
        name: "Avatar: Mestre Faixa Coral",
        description: "Meio século de dedicação, fonte inesgotável de sabedoria marcial.",
        priceKC: 7800,
        category: "AVATAR",
        rarity: "MYTHIC",
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_capuz_ninja",
        name: "Avatar: Ninja Invisível",
        description: "Invisível até o momento em que a lapela está no seu pescoço.",
        priceKC: 1800,
        category: "AVATAR",
        rarity: "EPIC",
        imageUrl: "https://images.unsplash.com/photo-1555679427-1f6dfcce188b?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_kamikaze_bjj",
        name: "Avatar: Kamikaze do Tatame",
        description: "Não calcula riscos, mergulha de cabeça em todas as finalizações.",
        priceKC: 1300,
        category: "AVATAR",
        rarity: "RARE",
        imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_avatar_guerreiro_espartano",
        name: "Avatar: Gladiador de Lona",
        description: "Sua determinação a par de guerreiros espartanos antigos.",
        priceKC: 1250,
        category: "AVATAR",
        rarity: "RARE",
        imageUrl: "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&q=80&w=200"
      },

      // ==========================================
      // MOLDURAS (25 items)
      // ==========================================
      {
        id: "prod_frame_gold_aurora",
        name: "Moldura: Aurora Dourada",
        description: "Uma moldura cintilante em dourado real para coroar sua foto de perfil.",
        priceKC: 2000,
        category: "FRAME",
        rarity: "LEGENDARY",
        imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_frame_neon_glaze",
        name: "Moldura: Holo-Neon Roxa",
        description: "Efeitos neon ultra-brilhantes em tom de faixa roxa competitiva.",
        priceKC: 1200,
        category: "FRAME",
        rarity: "EPIC",
        imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=85&w=200"
      },
      {
        id: "prod_frame_samurai_armor",
        name: "Moldura: Placas do Shogun",
        description: "Moldura detalhada com placas de ferro de armaduras samurais.",
        priceKC: 2550,
        category: "FRAME",
        rarity: "LEGENDARY",
        imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_frame_bamboo_classic",
        name: "Moldura: Bambu Secreto",
        description: "Modesta moldura talhada em bambu orgânico do templo.",
        priceKC: 300,
        category: "FRAME",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_frame_sakura_petals",
        name: "Moldura: Pétalas de Sakura",
        description: "Charmosas pétalas cor-de-rosa caem em volta de sua foto.",
        priceKC: 850,
        category: "FRAME",
        rarity: "RARE",
        imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=200"
      },
      {
        id: "prod_frame_carbon_fiber",
        name: "Moldura: Fibra de Carbono",
        description: "Revestimento tecnológico de alta resistência mecânica para o dojô.",
        priceKC: 1400,
        category: "FRAME",
        rarity: "EPIC",
        imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=85&w=200"
      },
      {
        id: "prod_frame_tatame_border",
        name: "Moldura: Linha Vermelha de Combate",
        description: "Design inspirado na borda de segurança regulamentar internacional.",
        priceKC: 200,
        category: "FRAME",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_frame_faixa_azul_frame",
        name: "Moldura: Faixa Azul Lapela",
        description: "Firme e encorpado tom azulado que simboliza a maturidade técnica.",
        priceKC: 250,
        category: "FRAME",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_frame_faixa_roxa_frame",
        name: "Moldura: Realeza Roxa",
        description: "Brilho místico dedicado aos que começam a dominar o berimbolo.",
        priceKC: 750,
        category: "FRAME",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_frame_faixa_marrom_frame",
        name: "Moldura: Terra Marrom",
        description: "Textura arenosa pesada simbolizando o limiar do cinturão negro.",
        priceKC: 1350,
        category: "FRAME",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_frame_faixa_preta_frame",
        name: "Moldura: Faixa Preta Absoluta",
        description: "Soberba moldura de fios pretos e ponteira vermelha clássica de respeito.",
        priceKC: 2500,
        category: "FRAME",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_frame_ninja_darkness",
        name: "Moldura: Sombra do Shinobi",
        description: "Design furtivo envelopado por sombras cinzas acetinadas.",
        priceKC: 1600,
        category: "FRAME",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_frame_draconic_fire",
        name: "Moldura: Fogo do Dragão",
        description: "Chamas flamejantes orientais crepitam ao redor do seu perfil.",
        priceKC: 5000,
        category: "FRAME",
        rarity: "MYTHIC",
        imageUrl: ""
      },
      {
        id: "prod_frame_ocean_wave",
        name: "Moldura: Grande Onda de BJJ",
        description: "Inspirada na gravura clássica japonesa com grandes redemoinhos de água.",
        priceKC: 1850,
        category: "FRAME",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_frame_championship_gold_frame",
        name: "Moldura: Ouro Supremo",
        description: "O brilho mais puro reservado para campeões de categoria e absoluto.",
        priceKC: 3000,
        category: "FRAME",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_frame_gold_bronze_vintage",
        name: "Moldura: Bronze Escovado",
        description: "Acabamento retrô em bronze metálico acetinado.",
        priceKC: 600,
        category: "FRAME",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_frame_silver_medal_frame",
        name: "Moldura: Prata Refletiva",
        description: "Fino contorno prateado espelhado com acabamento polido.",
        priceKC: 800,
        category: "FRAME",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_frame_cyberpunk_matrix",
        name: "Moldura: Matrix Cibernética",
        description: "Feixes digitais verdes rolando pelas frestas de sua imagem de perfil.",
        priceKC: 1500,
        category: "FRAME",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_frame_lava_flow",
        name: "Moldura: Lava Vulcânica",
        description: "Quente como o calor do dojo no verão de 40 graus carioca.",
        priceKC: 2400,
        category: "FRAME",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_frame_ice_crystal",
        name: "Moldura: Gelo Glacial",
        description: "Mantenha a mente fria e calculista sob o pior dos amassos.",
        priceKC: 900,
        category: "FRAME",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_frame_bjj_stars",
        name: "Moldura: Constelação BJJ",
        description: "Estrelas cintilantes que representam as cinco regiões da federação.",
        priceKC: 1300,
        category: "FRAME",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_frame_minimalist_dark",
        name: "Moldura: Escuro Minimalista",
        description: "Borda extra fina em preto fosco para os amantes do minimalismo.",
        priceKC: 150,
        category: "FRAME",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_frame_imperial_gold",
        name: "Moldura: Aura Imperial",
        description: "Luxo indescritível com detalhes de filigranas de ouro feudal.",
        priceKC: 6500,
        category: "FRAME",
        rarity: "MYTHIC",
        imageUrl: ""
      },
      {
        id: "prod_frame_tribal_warrior",
        name: "Moldura: Marcas de Guerra",
        description: "Inscrições tribais esculpidas que contam sua história no tatame.",
        priceKC: 700,
        category: "FRAME",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_frame_vortex_void",
        name: "Moldura: Vazio Abissal",
        description: "Buraco negro elegante que suga olhares de seus oponentes.",
        priceKC: 2800,
        category: "FRAME",
        rarity: "LEGENDARY",
        imageUrl: ""
      },

      // ==========================================
      // TÍTULOS (20 items)
      // ==========================================
      {
        id: "prod_title_rubber_guard",
        name: "Título: 'Perna de Polvo'",
        description: "Sua elasticidade e destreza na guarda aberta são assustadoras.",
        priceKC: 400,
        category: "TITLE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_title_sandbagger",
        name: "Título: 'Sandbagger Profissional'",
        description: "Mostre que você joga como marrom mas ainda veste faixa branca sim.",
        priceKC: 900,
        category: "TITLE",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_title_unbreakable",
        name: "Título: 'INQUEBRÁVEL'",
        description: "A alcunha daqueles cuja barreira defensiva jamais se rompe.",
        priceKC: 4500,
        category: "TITLE",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_title_world_champion",
        name: "Título: 'Lenda Mundial (Mundial Gold)'",
        description: "Uma honra suprema, reservada à elite que governou o topo do pódio.",
        priceKC: 8000,
        category: "TITLE",
        rarity: "MYTHIC",
        imageUrl: ""
      },
      {
        id: "prod_title_bushido_code",
        name: "Título: 'Caminho do Bushido'",
        description: "Lealdade, disciplina, honra e coragem inabaláveis em combate.",
        priceKC: 4000,
        category: "TITLE",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_title_cree_boy",
        name: "Título: 'Atleta Casca Grossa'",
        description: "Aguenta pancada, calor de 50 graus e treina com kimono rasgado.",
        priceKC: 300,
        category: "TITLE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_title_choke_master",
        name: "Título: 'Executor de Lapelas'",
        description: "Especialista sutil em fazer oponentes dormirem suavemente no tatame.",
        priceKC: 1000,
        category: "TITLE",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_title_ankles_collector",
        name: "Título: 'Colecionador de Tornozelos'",
        description: "Nenhum tornozelo está seguro quando este atleta se joga nas pernas.",
        priceKC: 2000,
        category: "TITLE",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_title_oss_spammer",
        name: "Título: 'Spammer de OSS'",
        description: "Diz 'Oss' a cada frase, inclusive para o cobrador do ônibus.",
        priceKC: 150,
        category: "TITLE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_title_double_gold",
        name: "Título: 'Peso & Absoluto (Double Gold)'",
        description: "Dono absoluto da categoria de peso e do absoluto livre de limites.",
        priceKC: 5000,
        category: "TITLE",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_title_berimbolo_prince",
        name: "Título: 'Doutor do Berimbolo'",
        description: "Sua tese acadêmica foi baseada na rotação pélvica de 360 graus.",
        priceKC: 1800,
        category: "TITLE",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_title_mat_owner",
        name: "Título: 'Dono do Tatame'",
        description: "Chega primeiro no treino, sai por último e ajuda a limpar a lona.",
        priceKC: 1200,
        category: "TITLE",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_title_gord_pass",
        name: "Título: 'Amassador de Guardeiros'",
        description: "Sua passagem causa claustrofobia generalizada no ginásio.",
        priceKC: 2200,
        category: "TITLE",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_title_shou_ninja",
        name: "Título: 'Shinobi Invisível'",
        description: "Ninguém ouve seus passos antes da finalização plástica.",
        priceKC: 2400,
        category: "TITLE",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_title_samurai_honor",
        name: "Título: 'Honra do Samurai'",
        description: "Prefere bater o braço a violar a etiqueta técnica ideal de respeito.",
        priceKC: 3500,
        category: "TITLE",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_title_creepy_kid",
        name: "Título: 'Iniciante Destemido'",
        description: "Não importa se é campeão mundial, ele chama pro rola do mesmo jeito.",
        priceKC: 250,
        category: "TITLE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_title_half_guard_king",
        name: "Título: 'Lorde da Meia Guarda'",
        description: "Diz a lenda que ele acorda dormindo em meia guarda profunda.",
        priceKC: 950,
        category: "TITLE",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_title_takedown_machine",
        name: "Título: 'Máquina de Quedas'",
        description: "Seu double leg quebra as leis da física tradicional do tatame.",
        priceKC: 1100,
        category: "TITLE",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_title_jiu_jitsu_lifestyle",
        name: "Título: 'BJJ Lifestyle'",
        description: "Dieta Gracie, açaí diário, roupão de banho por cima do kimono.",
        priceKC: 500,
        category: "TITLE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_title_grand_master",
        name: "Título: 'Eterno Faixa Vermelha'",
        description: "Representante mitológico do mais alto degrau do jiu-jitsu mundial.",
        priceKC: 7500,
        category: "TITLE",
        rarity: "MYTHIC",
        imageUrl: ""
      },

      // ==========================================
      // EMOTES (15 items)
      // ==========================================
      {
        id: "prod_emote_shaka_oss",
        name: "Emote: Shaka de Respeito",
        description: "O clássico 'Shaka + Oss' para cumprimentar antes do massacre.",
        priceKC: 250,
        category: "EMOTE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_emote_tap_quickly",
        name: "Emote: Bate Três Vezes!",
        description: "Uma animação elegante de desitência saudável e rápida.",
        priceKC: 750,
        category: "EMOTE",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_emote_samurai_bow",
        name: "Emote: Curvatura de Respeito",
        description: "Incline o corpo demonstrando humildade perante o mestre do dojo.",
        priceKC: 200,
        category: "EMOTE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_emote_shaka_boom",
        name: "Emote: Punch virtual",
        description: "Aquele soquinho que selamos com o parceiro de treino antes de começar.",
        priceKC: 300,
        category: "EMOTE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_emote_king_crown",
        name: "Emote: Coroa Virtuosa",
        description: "Coloca uma coroa reluzente dourada sobre os cabelos do avatar.",
        priceKC: 2500,
        category: "EMOTE",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_emote_ninja_disappear",
        name: "Emote: Chafariz de fumaça",
        description: "Fuga teatral ninja explodindo bomba de fumaça cinzenta na lona.",
        priceKC: 1550,
        category: "EMOTE",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_emote_meditation_pose",
        name: "Emote: Zen Budista",
        description: "Seu boneco flutua por alguns segundos concentrando energia cósmica.",
        priceKC: 900,
        category: "EMOTE",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_emote_flex_biceps",
        name: "Emote: Mostra o Gás!",
        description: "Contraia o muque esbanjando energia ilimitada de treino.",
        priceKC: 350,
        category: "EMOTE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_emote_facepalm_guard",
        name: "Emote: Puxou pra Guarda de Novo?",
        description: "O desespero clássico de enfrentar guardeiros incansáveis.",
        priceKC: 800,
        category: "EMOTE",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_emote_creepy_grin",
        name: "Emote: Sorriso Amigável",
        description: "Aquele sorriso maroto que o parceiro dá após travar seu pescoço.",
        priceKC: 400,
        category: "EMOTE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_emote_gold_medal_kiss",
        name: "Emote: Beijando o Ouro",
        description: "Simule a merecida pose tradicional de beijar a medalha de primeiro lugar.",
        priceKC: 1800,
        category: "EMOTE",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_emote_heart_hands_oss",
        name: "Emote: Coração de Oss",
        description: "Mãos fazendo coraçãozinho com um OSS flutuando fofinho por cima.",
        priceKC: 300,
        category: "EMOTE",
        rarity: "COMMON",
        imageUrl: ""
      },
      {
        id: "prod_emote_no_neck",
        name: "Emote: Cadê meu Pescoço?",
        description: "Atleta esconde a cabeça simulando ausência total de pescoço para travas.",
        priceKC: 850,
        category: "EMOTE",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_emote_wrist_lock_evil",
        name: "Emote: Malícia do Mão de Vaca",
        description: "Visual engraçado tramando um wrist lock inesperado saindo da meia.",
        priceKC: 1600,
        category: "EMOTE",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_emote_legend_dance",
        name: "Emote: Ginga da Vitória",
        description: "Dancinha tradicional do pódio de campeonatos internacionais absolutos.",
        priceKC: 3000,
        category: "EMOTE",
        rarity: "LEGENDARY",
        imageUrl: ""
      },

      // ==========================================
      // EFEITOS ESPECIAIS (10 items)
      // ==========================================
      {
        id: "prod_effect_smoke",
        name: "Efeito: Nuvem de Magnésio",
        description: "Fumaça de magnésio envolve seu competidor ao carregar cards PVP.",
        priceKC: 1200,
        category: "EFFECT",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_effect_thunder",
        name: "Efeito: Divindade do Relâmpago",
        description: "Raios crepitam ao fundo de sua moldura durante o matchmaking.",
        priceKC: 3500,
        category: "EFFECT",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_effect_galaxy",
        name: "Efeito: Cosmo Fluído BJJ",
        description: "Partículas cósmicas fluem sobre o layout com brilho iridescente.",
        priceKC: 4850,
        category: "EFFECT",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_effect_cherry_blossoms",
        name: "Efeito: Chuva de Sakura",
        description: "Chuva de flores cor-de-rosa caindo lentamente por trás do seu card.",
        priceKC: 1800,
        category: "EFFECT",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_effect_shadows_shinobi",
        name: "Efeito: Sombras do Dojo",
        description: "Uma névoa preta e densa e misteriosa sobe pelos cantos exteriores.",
        priceKC: 4200,
        category: "EFFECT",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_effect_golden_sparkles",
        name: "Efeito: Faíscas de Ouro",
        description: "Centelhas brilhantes e puras de pedras brilhantes flutuando pelo card.",
        priceKC: 3800,
        category: "EFFECT",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_effect_rage_aura",
        name: "Efeito: Aura do Lutador",
        description: "Chamas místicas cor de fogo vermelho envolvendo todo o seu perfil.",
        priceKC: 6000,
        category: "EFFECT",
        rarity: "MYTHIC",
        imageUrl: ""
      },
      {
        id: "prod_effect_digital_rain",
        name: "Efeito: Cascata Teológica",
        description: "Símbolos e bytes rolando sob o fundo como o filme Matrix do Jiu Speak.",
        priceKC: 2200,
        category: "EFFECT",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_effect_blood_sweat",
        name: "Efeito: Sangue & Suor",
        description: "Pingos clássicos de suor e fagulhas vermelhas de atitude no combate.",
        priceKC: 950,
        category: "EFFECT",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_effect_void_gate",
        name: "Efeito: Portal do Vazio",
        description: "Portal galáctico cinzento que gira vagarosamente atrás da sua foto.",
        priceKC: 7500,
        category: "EFFECT",
        rarity: "MYTHIC",
        imageUrl: ""
      },
      {
        id: "prod_theme_classic_dark",
        name: "Tema: Clássico Dojô Escuro",
        description: "Altera o plano de fundo e o painel de faturamento para um clássico cinza e violeta escuro.",
        priceKC: 1200,
        category: "THEME",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_theme_cherry_blossom",
        name: "Tema: Dojô das Cerejeiras",
        description: "Transforma sua jornada em uma serena floresta de cerejeiras com detalhes rosa e preto.",
        priceKC: 2500,
        category: "THEME",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_theme_cyberpunk_neon",
        name: "Tema: Arena Cyber Neon",
        description: "Visual cibernético inspirado nos campeonatos internacionais noturnos de Tóquio.",
        priceKC: 5000,
        category: "THEME",
        rarity: "MYTHIC",
        imageUrl: ""
      },
      {
        id: "prod_theme_royal_gold",
        name: "Tema: Tatame Imperial Dourado",
        description: "O prestígio definitivo. Interface inteiramente folheada a ouro com nuances reais.",
        priceKC: 8000,
        category: "THEME",
        rarity: "MYTHIC",
        imageUrl: ""
      },
      {
        id: "prod_belt_neon_blue",
        name: "Faixa Especial: Azul Neon Cintilante",
        description: "Sua faixa padrão com um brilho neon ciano radiante que se move.",
        priceKC: 1500,
        category: "BELT",
        rarity: "RARE",
        imageUrl: ""
      },
      {
        id: "prod_belt_lava",
        name: "Faixa Especial: Magma em Fusão",
        description: "Efeito animado de lava incandescente escorrendo ao redor do seu rank atual.",
        priceKC: 3000,
        category: "BELT",
        rarity: "EPIC",
        imageUrl: ""
      },
      {
        id: "prod_belt_glitch",
        name: "Faixa Especial: Glitch Cyberpunk",
        description: "Faixa futurista com estática visual instável de distorção holo-digital.",
        priceKC: 4500,
        category: "BELT",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_belt_rainbow",
        name: "Faixa Especial: Arco-Íris Místico",
        description: "Transições suaves de gradiente em todas as cores do prisma pelo tatame.",
        priceKC: 9000,
        category: "BELT",
        rarity: "MYTHIC",
        imageUrl: ""
      },
      {
        id: "prod_legend_katana",
        name: "Item Lendário: Katana de Hattori Hanzo",
        description: "Uma verdadeira obra de arte de aço dobrado. Símbolo de precisão.",
        priceKC: 10000,
        category: "LEGENDARY",
        rarity: "LEGENDARY",
        imageUrl: ""
      },
      {
        id: "prod_legend_gi_gold",
        name: "Item Lendário: Kimono Imperial de Ouro",
        description: "Kimono sagrado indestrutível tecido inteiramente com fios dourados de elite.",
        priceKC: 15000,
        category: "LEGENDARY",
        rarity: "MYTHIC",
        imageUrl: ""
      },
      {
        id: "prod_legend_badge",
        name: "Item Lendário: Insígnia Ancestral Gracie",
        description: "A joia da coroa da tradição do Jiu-Jitsu brasileiro absoluto.",
        priceKC: 20000,
        category: "LEGENDARY",
        rarity: "MYTHIC",
        imageUrl: ""
      }
    ];

    for (const prod of seedProducts) {
      const patchedProd = patchProductObjectWithBjjAvatar(prod);
      const dbRarity = patchedProd.rarity === "MYTHIC" ? "LEGENDARY" : patchedProd.rarity;
      await prisma.storeProduct.upsert({
        where: { id: patchedProd.id },
        update: {
          name: patchedProd.name,
          description: patchedProd.description,
          priceKC: patchedProd.priceKC,
          category: patchedProd.category,
          rarity: dbRarity as any,
          imageUrl: patchedProd.imageUrl,
          active: true
        },
        create: {
          id: patchedProd.id,
          name: patchedProd.name,
          description: patchedProd.description,
          priceKC: patchedProd.priceKC,
          category: patchedProd.category,
          rarity: dbRarity as any,
          imageUrl: patchedProd.imageUrl,
          active: true
        }
      });
    }

    console.log(`🌱 ${seedProducts.length} Store Products seeded inside PostgreSQL database!`);

  } catch (error) {
    console.error('❌ Critical error seeding Store Products:', error);
  }
};

// Exclusively relational data store actions
import { avatarMappingList } from "../src/avatarMapping";

export function getDeterministicIndexHex(id: string, max: number = 40): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

export function patchUserObjectWithDeterministicAvatar<T extends { id?: string; name?: string; avatar?: string | null; role?: string }>(user: T): T {
  if (!user || !user.id) return user;
  
  const idx = getDeterministicIndexHex(user.id, avatarMappingList.length);
  const mapped = avatarMappingList[idx];
  
  if (mapped) {
    let suffix = "";
    if (user.role === "ADMIN") {
      suffix = " (ADMIN)";
    } else if (user.role === "INSTRUCTOR") {
      suffix = " (INSTRUCTOR)";
    }
    user.name = mapped.name + suffix;
    user.avatar = mapped.image;
    (user as any).gender = mapped.gender;
  }
  return user;
}

export function patchProductObjectWithBjjAvatar<T extends { id?: string; name?: string; category?: string; imageUrl?: string }>(product: T): T {
  if (!product) return product;
  const isAvatar = product.category?.toUpperCase() === "AVATAR" || product.id?.startsWith("prod_avatar_");
  if (isAvatar) {
    const bjjAvatarMap: Record<string, string> = {
      "prod_avatar_pitbull": "https://api.dicebear.com/7.x/bottts/svg?seed=pitbulllendario&backgroundColor=ff4a5a&radius=50",
      "prod_avatar_cyber_samurai": "https://api.dicebear.com/7.x/bottts/svg?seed=samuraicyber&backgroundColor=2a2a2a&radius=50",
      "prod_avatar_panda_bjj": "https://api.dicebear.com/7.x/identicon/svg?seed=panda_bjj&backgroundColor=7e49ff&radius=50",
      "prod_avatar_chapa": "https://api.dicebear.com/7.x/adventurer/svg?seed=chapa_quente&backgroundColor=e65c2e&radius=50&mouth=smile",
      "prod_avatar_shogun": "https://api.dicebear.com/7.x/adventurer/svg?seed=shogun_supremo&backgroundColor=ff4a5a&radius=50",
      "prod_avatar_ninja_shadow": "https://api.dicebear.com/7.x/pixel-art/svg?seed=shinobishadow&backgroundColor=111111&radius=50",
      "prod_avatar_mestre_antigo": "https://api.dicebear.com/7.x/adventurer/svg?seed=graomestre&backgroundColor=7e49ff&radius=50",
      "prod_avatar_lioness_matte": "https://api.dicebear.com/7.x/lorelei/svg?seed=leoadotatame&backgroundColor=ff4a5a&radius=50",
      "prod_avatar_ronin_bjj": "https://api.dicebear.com/7.x/adventurer/svg?seed=roninerrante&backgroundColor=a65c2e&radius=50",
      "prod_avatar_guard_passer": "https://api.dicebear.com/7.x/adventurer/svg?seed=passadorimplacavel&backgroundColor=4a60ff&radius=50&mouth=smile",
      "prod_avatar_berimbolo_king": "https://api.dicebear.com/7.x/adventurer/svg?seed=reidoberimbolo&backgroundColor=ffffff&radius=50",
      "prod_avatar_championship_gold": "https://api.dicebear.com/7.x/adventurer/svg?seed=campeao&backgroundColor=ffbf00&radius=50",
      "prod_avatar_oss_avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=bonecodojodo&backgroundColor=a65c2e&radius=50",
      "prod_avatar_faixa_preta_pro": "https://api.dicebear.com/7.x/adventurer/svg?seed=samuraifaixapreta&backgroundColor=2a2a2a&radius=50",
      "prod_avatar_samurai_cat": "https://api.dicebear.com/7.x/bottts/svg?seed=catdojo&backgroundColor=ffffff&radius=50",
      "prod_avatar_gorilla_press": "https://api.dicebear.com/7.x/identicon/svg?seed=goriladapressao&backgroundColor=ff4a5a&radius=50",
      "prod_avatar_leglock_monster": "https://api.dicebear.com/7.x/bottts/svg?seed=monstroleglock&backgroundColor=7e49ff&radius=50",
      "prod_avatar_kimono_azul": "https://api.dicebear.com/7.x/adventurer/svg?seed=competidordeazul&backgroundColor=4a60ff&radius=50&mouth=smile",
      "prod_avatar_kimono_branco": "https://api.dicebear.com/7.x/adventurer/svg?seed=iniciante_bjj&backgroundColor=ffffff&radius=50&mouth=smile&eyebrows=variant05",
      "prod_avatar_speedy_ninja": "https://api.dicebear.com/7.x/adventurer/svg?seed=ninjaveloz&backgroundColor=2e2e2e&radius=50",
      "prod_avatar_as_do_absoluto": "https://api.dicebear.com/7.x/adventurer/svg?seed=asdoabsoluto&backgroundColor=7e49ff&radius=50",
      "prod_avatar_tatame_kid": "https://api.dicebear.com/7.x/adventurer/svg?seed=garotodotatame&backgroundColor=a65c2e&radius=50&mouth=smile",
      "prod_avatar_velha_guarda": "https://api.dicebear.com/7.x/adventurer/svg?seed=veterano&backgroundColor=ff4a5a&radius=50",
      "prod_avatar_guardeiro_sinistro": "https://api.dicebear.com/7.x/adventurer/svg?seed=guardeiromacabro&backgroundColor=7e49ff&radius=50&mouth=smile&eyebrows=variant01",
      "prod_avatar_dragao_tatame": "https://api.dicebear.com/7.x/identicon/svg?seed=dragaoreluzente&backgroundColor=ffbf00&radius=50",
      "prod_avatar_tigre_bjj": "https://api.dicebear.com/7.x/identicon/svg?seed=tigrebjj&backgroundColor=e65c2e&radius=50",
      "prod_avatar_faixa_coral": "https://api.dicebear.com/7.x/adventurer/svg?seed=mestrefaixacoral&backgroundColor=ff4a5a&radius=50",
      "prod_avatar_capuz_ninja": "https://api.dicebear.com/7.x/bottts/svg?seed=ninjainvisivel&backgroundColor=2a2a2a&radius=50",
      "prod_avatar_kamikaze_bjj": "https://api.dicebear.com/7.x/adventurer/svg?seed=kamikaze_bjj&backgroundColor=ff4a5a&radius=50&mouth=smile",
      "prod_avatar_guerreiro_espartano": "https://api.dicebear.com/7.x/adventurer/svg?seed=gladiadordelona&backgroundColor=4a60ff&radius=50&mouth=smile"
    };

    const key = product.id || "";
    if (bjjAvatarMap[key]) {
      product.imageUrl = bjjAvatarMap[key];
    } else {
      const seed = encodeURIComponent(product.name || "bjj_avatar");
      product.imageUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&radius=50&backgroundColor=b6e3f4`;
    }
  }
  return product;
}

export const authStore = {
  async findByEmail(email: string): Promise<Partial<AuthUser> | null> {
    const formattedEmail = email.toLowerCase().trim();
    try {
      const prisma = getPrisma();
      const u = await prisma.user.findUnique({ 
        where: { email: formattedEmail },
        include: { wallet: true }
      });

      if (u) {
        return patchUserObjectWithDeterministicAvatar({
          id: u.id,
          email: u.email,
          name: u.name,
          passwordHash: u.password,
          role: u.role as any,
          isAdminApproved: u.isAdminApproved,
          belt: u.belt as any,
          stripes: u.stripes,
          xp: u.xp,
          level: u.level,
          elo: u.elo,
          avatar: u.avatar,
          coins: u.wallet?.balanceKC || 0,
          balanceAvailableBRL: u.wallet?.balanceAvailable ? Number(u.wallet.balanceAvailable) : 0.00,
          balancePendingBRL: u.wallet?.balancePending ? Number(u.wallet.balancePending) : 0.00,
          totalEarnedBRL: u.wallet?.totalEarned ? Number(u.wallet.totalEarned) : 0.00,
          totalWithdrawnBRL: u.wallet?.totalWithdrawn ? Number(u.wallet.totalWithdrawn) : 0.00,
          isEmailVerified: u.isEmailVerified,
          verificationToken: u.verificationToken,
          resetToken: u.resetToken,
          resetTokenExpires: u.resetTokenExpires,
          refreshToken: u.refreshToken,
        });
      }
    } catch (dbErr) {
      console.warn("Prisma findByEmail error, falling back to inMemoryUsers:", dbErr);
    }

    // FALLBACK
    const foundMem = Array.from(inMemoryUsers.values()).find(
      u => u.email.toLowerCase().trim() === formattedEmail
    );
    if (foundMem) {
      return patchUserObjectWithDeterministicAvatar({ ...foundMem });
    }
    return null;
  },

  async findById(id: string): Promise<Partial<AuthUser> | null> {
    try {
      const prisma = getPrisma();
      const u = await prisma.user.findUnique({ 
        where: { id },
        include: { wallet: true }
      });

      if (u) {
        return patchUserObjectWithDeterministicAvatar({
          id: u.id,
          email: u.email,
          name: u.name,
          passwordHash: u.password,
          role: u.role as any,
          isAdminApproved: u.isAdminApproved,
          belt: u.belt as any,
          stripes: u.stripes,
          xp: u.xp,
          level: u.level,
          elo: u.elo,
          avatar: u.avatar,
          coins: u.wallet?.balanceKC || 0,
          balanceAvailableBRL: u.wallet?.balanceAvailable ? Number(u.wallet.balanceAvailable) : 0.00,
          balancePendingBRL: u.wallet?.balancePending ? Number(u.wallet.balancePending) : 0.00,
          totalEarnedBRL: u.wallet?.totalEarned ? Number(u.wallet.totalEarned) : 0.00,
          totalWithdrawnBRL: u.wallet?.totalWithdrawn ? Number(u.wallet.totalWithdrawn) : 0.00,
          isEmailVerified: u.isEmailVerified,
          verificationToken: u.verificationToken,
          resetToken: u.resetToken,
          resetTokenExpires: u.resetTokenExpires,
          refreshToken: u.refreshToken,
        });
      }
    } catch (dbErr) {
      console.warn("Prisma findById error, falling back to inMemoryUsers:", dbErr);
    }

    // FALLBACK
    const foundMem = inMemoryUsers.get(id);
    if (foundMem) {
      return patchUserObjectWithDeterministicAvatar({ ...foundMem });
    }
    return null;
  },

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: 'ATHLETE' | 'INSTRUCTOR' | 'ADMIN';
    isAdminApproved?: boolean;
    verificationToken: string;
  }): Promise<Partial<AuthUser>> {
    const formattedEmail = data.email.toLowerCase().trim();
    const role = data.role || 'ATHLETE';
    const approved = data.isAdminApproved !== undefined ? data.isAdminApproved : (role !== 'ADMIN');

    try {
      const prisma = getPrisma();
      const u = await prisma.user.create({
        data: {
          email: formattedEmail,
          name: data.name,
          password: data.passwordHash,
          role: role as any,
          isAdminApproved: approved,
          verificationToken: data.verificationToken,
          isEmailVerified: false,
          wallet: {
            create: {
              balanceKC: 200,
              balanceAvailable: 0.00,
              balanceBRL: 0.00,
              balancePending: 0.00,
              totalEarned: 0.00,
              totalWithdrawn: 0.00,
            }
          },
          inventory: {
            create: {}
          }
        },
      });

      const userObj: AuthUser = {
        id: u.id,
        email: u.email,
        name: u.name,
        passwordHash: u.password,
        role: u.role as any,
        isAdminApproved: u.isAdminApproved,
        belt: u.belt as any,
        stripes: u.stripes,
        xp: u.xp,
        level: u.level,
        elo: u.elo,
        avatar: u.avatar,
        coins: 200,
        balanceAvailableBRL: 0.00,
        balancePendingBRL: 0.00,
        totalEarnedBRL: 0.00,
        totalWithdrawnBRL: 0.00,
        isEmailVerified: u.isEmailVerified,
        verificationToken: u.verificationToken,
        resetToken: u.resetToken,
        resetTokenExpires: u.resetTokenExpires,
        refreshToken: u.refreshToken,
      };

      // Sync memory cache too
      inMemoryUsers.set(u.id, userObj);

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as any,
        isAdminApproved: u.isAdminApproved,
        isEmailVerified: u.isEmailVerified,
      };
    } catch (dbErr) {
      console.warn("Prisma createUser error, falling back to inMemoryUsers:", dbErr);
    }

    // FALLBACK
    const memId = 'mem_user_' + Math.random().toString(36).substring(2, 11);
    const userObj: AuthUser = {
      id: memId,
      email: formattedEmail,
      name: data.name,
      passwordHash: data.passwordHash,
      role: role as any,
      isAdminApproved: approved,
      belt: 'WHITE',
      stripes: 0,
      xp: 0,
      level: 1,
      elo: 1000,
      avatar: null,
      coins: 200,
      balanceAvailableBRL: 0.00,
      balancePendingBRL: 0.00,
      totalEarnedBRL: 0.00,
      totalWithdrawnBRL: 0.00,
      isEmailVerified: false,
      verificationToken: data.verificationToken,
      resetToken: null,
      resetTokenExpires: null,
      refreshToken: null,
    };

    inMemoryUsers.set(memId, userObj);

    return {
      id: userObj.id,
      email: userObj.email,
      name: userObj.name,
      role: userObj.role,
      isAdminApproved: userObj.isAdminApproved,
      isEmailVerified: userObj.isEmailVerified,
    };
  },

  async updateUser(id: string, fields: Partial<AuthUser>): Promise<boolean> {
    // 1. Sync in-memory cache
    const memUser = inMemoryUsers.get(id);
    if (memUser) {
      Object.assign(memUser, fields);
    }

    try {
      const prisma = getPrisma();
      const prismaData: any = {};

      if (fields.name !== undefined) prismaData.name = fields.name;
      if (fields.passwordHash !== undefined) prismaData.password = fields.passwordHash;
      if (fields.role !== undefined) prismaData.role = fields.role;
      if (fields.isAdminApproved !== undefined) prismaData.isAdminApproved = fields.isAdminApproved;
      if (fields.belt !== undefined) prismaData.belt = fields.belt;
      if (fields.stripes !== undefined) prismaData.stripes = fields.stripes;
      if (fields.xp !== undefined) prismaData.xp = fields.xp;
      if (fields.level !== undefined) prismaData.level = fields.level;
      if (fields.elo !== undefined) prismaData.elo = fields.elo;
      if (fields.avatar !== undefined) prismaData.avatar = fields.avatar;
      if (fields.isEmailVerified !== undefined) prismaData.isEmailVerified = fields.isEmailVerified;
      if (fields.isSuspended !== undefined) prismaData.isSuspended = fields.isSuspended;
      if (fields.isBanned !== undefined) prismaData.isBanned = fields.isBanned;
      if (fields.verificationToken !== undefined) prismaData.verificationToken = fields.verificationToken;
      if (fields.resetToken !== undefined) prismaData.resetToken = fields.resetToken;
      if (fields.resetTokenExpires !== undefined) prismaData.resetTokenExpires = fields.resetTokenExpires;
      if (fields.refreshToken !== undefined) prismaData.refreshToken = fields.refreshToken;

      await prisma.user.update({
        where: { id },
        data: prismaData,
      });

      // Handle updates of Wallet and Kimono Coins balance
      if (
        fields.coins !== undefined ||
        fields.balanceAvailableBRL !== undefined ||
        fields.balancePendingBRL !== undefined ||
        fields.totalEarnedBRL !== undefined ||
        fields.totalWithdrawnBRL !== undefined
      ) {
        const walletData: any = {};
        if (fields.coins !== undefined) walletData.balanceKC = fields.coins;
        if (fields.balanceAvailableBRL !== undefined) {
          walletData.balanceAvailable = fields.balanceAvailableBRL;
          walletData.balanceBRL = fields.balanceAvailableBRL;
        }
        if (fields.balancePendingBRL !== undefined) walletData.balancePending = fields.balancePendingBRL;
        if (fields.totalEarnedBRL !== undefined) walletData.totalEarned = fields.totalEarnedBRL;
        if (fields.totalWithdrawnBRL !== undefined) walletData.totalWithdrawn = fields.totalWithdrawnBRL;

        try {
          await prisma.wallet.update({
            where: { userId: id },
            data: walletData
          });
        } catch {
          // Fallback recreate of wallet if it is missing
          await prisma.wallet.create({
            data: {
              userId: id,
              balanceKC: fields.coins || 0,
              balanceAvailable: fields.balanceAvailableBRL || 0,
              balanceBRL: fields.balanceAvailableBRL || 0,
              balancePending: fields.balancePendingBRL || 0,
              totalEarned: fields.totalEarnedBRL || 0,
              totalWithdrawn: fields.totalWithdrawnBRL || 0
            }
          });
        }
      }
      return true;
    } catch (dbErr) {
      console.warn("Prisma updateUser error, falling back to inMemory cache only:", dbErr);
      return true;
    }
  },

  logSentEmail(to: string, subject: string, body: string, token: string) {
    const logItem = {
      id: `email_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      to,
      subject,
      body,
      token,
      timestamp: new Date(),
    };
    simulatedSentEmails.unshift(logItem);
    console.log(`\n========================================`);
    console.log(`✉ [SIMULATED EMAIL DISPATCH]`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TOKEN: ${token}`);
    console.log(`BODY: ${body}`);
    console.log(`========================================\n`);
  }
};
