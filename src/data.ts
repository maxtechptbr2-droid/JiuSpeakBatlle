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

// Predefined official shop products (Kimono Coins or real cash)
export const LOJA_ITEMS: InventoryItem[] = [
  {
    id: 'gi_gold',
    name: 'Kimono Imperial Dourado',
    description: 'Um quimono lendário com trançado dourado reluzente de alta densidade.',
    category: 'gi',
    price: 3500,
    currency: 'KC',
    rarity: 'Lendário',
    imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'gi_shibori',
    name: 'Kimono Vulkan Shibori',
    description: 'Edição limitada com tingimento tie-dye inspirado nas raízes samurai.',
    category: 'gi',
    price: 2400,
    currency: 'KC',
    rarity: 'Épico',
    imageUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'gi_classic_blue',
    name: 'Kimono Atama Blue Master',
    description: 'O clássico quimono azul ultra resistente, ideal para competições da IBJJF.',
    category: 'gi',
    price: 1200,
    currency: 'KC',
    rarity: 'Raro',
    imageUrl: 'https://images.unsplash.com/photo-1615117971313-71f77fe49927?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'stripe_gold',
    name: 'Grau Dourado Adesivo',
    description: 'Transforme o visual da sua faixa com graus em linha metálica brilhante.',
    category: 'belt_stripe',
    price: 500,
    currency: 'KC',
    rarity: 'Raro',
    imageUrl: ''
  },
  {
    id: 'title_pitbull',
    name: 'Título: "Pitbull dos Tatames"',
    description: 'Título exclusivo exibível no perfil ao lado do seu nome.',
    category: 'title',
    price: 400,
    currency: 'KC',
    rarity: 'Épico',
    imageUrl: ''
  },
  {
    id: 'title_monge',
    name: 'Título: "Guardião da Guarda Fechada"',
    description: 'O título definitivo para os lutadores táticos que adoram a guarda clássica.',
    category: 'title',
    price: 300,
    currency: 'KC',
    rarity: 'Comum',
    imageUrl: ''
  },
  {
    id: 'avatar_samurai',
    name: 'Fighter Pack: Ronin Sem Destino',
    description: 'Exclusivo pacote de imagem estilo anime para seu lutador.',
    category: 'avatar',
    price: 800,
    currency: 'KC',
    rarity: 'Épico',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'vip_pass_30',
    name: 'Passe Premium VIP (30 Dias)',
    description: 'Acesso imediato a todas as aulas de mestres, suporte de IA e bônus de 2x XP.',
    category: 'badge',
    price: 49.90,
    currency: 'BRL',
    rarity: 'Lendário',
    imageUrl: ''
  }
];

// Peer-to-Peer marketplace items with custom sellers
export const INITIAL_MARKETPLACE_ITEMS: InventoryItem[] = [
  {
    id: 'p2p_gi_koral',
    name: 'Kimono Koral Vintage 1998',
    description: 'Direto do armário de um faixa preta aposentado. Desgastado na dose certa para assustar adversários.',
    category: 'gi',
    price: 4500,
    currency: 'KC',
    rarity: 'Lendário',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    sellerId: 'user_4593',
    sellerName: 'Mestre_Cascão90'
  },
  {
    id: 'p2p_title_canela',
    name: 'Título: "Perna de Borracha"',
    description: 'Somente para raspadores flexíveis de laço.',
    category: 'title',
    price: 1500,
    currency: 'KC',
    rarity: 'Épico',
    imageUrl: '',
    sellerId: 'user_7733',
    sellerName: 'GuardaAranhaGuy'
  },
  {
    id: 'p2p_title_leao',
    name: 'Título: "Caçador de Faixas Pretas"',
    description: 'Ostente uma autoconfiança lendária nos saguões virtuais!',
    category: 'title',
    price: 6000,
    currency: 'KC',
    rarity: 'Lendário',
    imageUrl: '',
    sellerId: 'user_2288',
    sellerName: 'RyanGracieFan'
  }
];

// Duolingo-style structured learning syllabus
export const COURSES: Course[] = [
  {
    id: 'course_fundamentals',
    title: 'Fundamentos Básicos: Sobrevivendo na Faixa Branca',
    description: 'Aprenda os pilares de postura, posicionamento sob pressão, defesas de esgrima, e fugas básicas de montada e controle lateral.',
    creatorId: 'prof_alliance',
    creatorName: 'Sensei Fábio Gurgel',
    creatorBadge: 'Preto',
    priceBRL: 0, // Free course
    rating: 4.9,
    studentCount: 1420,
    reviews: 320,
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=400',
    lessons: [
      {
        id: 'lesson_posture',
        title: 'Lição 1: Postura Defensiva na Guarda Fechada',
        description: 'Mantenha sua coluna reta, domine as mangas e evite ser puxado para o estrangulamento cruzado.',
        duration: '10 min',
        videoUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=400',
        quiz: [
          {
            id: 'q1',
            question: 'Qual é o maior perigo de quebrar a postura com a cabeça baixa dentro da guarda fechada?',
            options: [
              'Levar um estrangulamento cruzado de manga ou sofrer um triângulo direto.',
              'Ser raspado com a raspagem de tesoura facilmente.',
              'Nenhum, cabeça baixa é ideal para fazer pressão na barriga do oponente.',
              'Ser desclassificado por falta de combatividade.'
            ],
            correctOptionIndex: 0,
            explanation: 'Ao manter a cabeça baixa sem controle de pegadas, seu oponente ganha o controle da sua nuca, facilitando ataques de estrangulamento cruzado e ataques de braço/triângulo.',
            avatarInstruction: 'Oss! Lembre-se: coluna reta é o seu escudo número um na guarda de qualquer passador experiente!'
          },
          {
            id: 'q2',
            question: 'Onde suas mãos devem preferencialmente se apoiar para manter a distância e postura?',
            options: [
              'No chão frouxo ao lado dos quadris do adversário.',
              'Nas axilas, bíceps ou na altura das faixas/calças do oponente, mantendo os cotovelos fechados.',
              'Cruzadas atrás do próprio pescoço.',
              'Segurando a gola dupla esticada até a nuca.'
            ],
            correctOptionIndex: 1,
            explanation: 'Apoiar nos bíceps ou no quadril com cotovelos colados bloqueia a subida do quadril do oponente e previne que ele faça esgrimas por baixo dos seus braços.',
            avatarInstruction: 'Gire seus cotovelos para dentro para defender a esgrima e travar a subida dele!'
          }
        ]
      },
      {
        id: 'lesson_shrimp',
        title: 'Lição 2: Fuga de Quadril Lateral',
        description: 'A movimentação mais crucial do Jiu-Jitsu. Saiba como criar espaço para repor a guarda.',
        duration: '8 min',
        videoUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=400',
        quiz: [
          {
            id: 'q3',
            question: 'Ao fazer a fuga de quadril para sair do controle lateral (cem quilos), para qual lado você deve girar?',
            options: [
              'Girar de costas para o oponente, oferecendo a pegada de costas.',
              'Girar de frente, em direção (de barriga de lado) ao oponente, projetando a esgrima ou mão no quadril.',
              'Ficar totalmente chapado com as costas no chão fazendo força para cima.',
              'Girar em estrela sobre as próprias mãos.'
            ],
            correctOptionIndex: 1,
            explanation: 'Girar de frente para o adversário coloca você sobre seu ombro de lado, liberando o quadril para se deslocar para trás, criando o vão necessário para enfiar o joelho de volta.',
            avatarInstruction: 'Se ficar chapado no tatame, vai virar passageiro de balsa dos cem quilos! Gira de lado imediatamente!'
          }
        ]
      }
    ]
  },
  {
    id: 'course_spider',
    title: 'Guarda Aranha e Laço Profissional',
    description: 'Entenda os conceitos modernos de lavagem de gola, esticar o braço, ganchos cruzados e a demolição postural de passadores pesados.',
    creatorId: 'prof_gracie',
    creatorName: 'Mestre Roger Gracie',
    creatorBadge: 'Preto',
    priceBRL: 89.90, // Premium course
    rating: 5.0,
    studentCount: 880,
    reviews: 198,
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    lessons: [
      {
        id: 'lesson_spider_entry',
        title: 'Ponto de Alavanca: Pegadas de Calça e Mangas',
        description: 'Como estabelecer a guarda aranha sem permitir que o oponente mate seu bíceps.',
        duration: '15 min',
        quiz: [
          {
            id: 'q4',
            question: 'Qual a tensão ideal na pegada de manga na guarda aranha?',
            options: [
              'Braço esticado empurrando o bíceps enquanto o outro braço puxa a manga sob tensão constante.',
              'Ambos os braços frouxos esperando a reação do passador.',
              'Segurar as calças do oponente com as duas mãos.',
              'Estruturar o triângulo fechando na axila.'
            ],
            correctOptionIndex: 0,
            explanation: 'O jogo de oposição (uma perna estica o bíceps travando o lado esquerdo e o outro braço puxa a manga sob controle rápido) desestabiliza o centro de gravidade do passador.',
            avatarInstruction: 'Estique a perna como um macaco hidráulico e use a outra para hookar o quadril!'
          }
        ]
      }
    ]
  }
];

// Matchmaking Pool for PVP simulation
export const OPPONENTS_POOL: Opponent[] = [
  {
    id: 'opp_marcolino',
    name: 'Marcolino "O Chaveiro"',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    elo: 1150,
    belt: 'Azul',
    stripes: 2,
    category: 'Médio',
    winCount: 45,
    lossCount: 38
  },
  {
    id: 'opp_renato',
    name: 'Renatinho "Passador Liso"',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    elo: 1300,
    belt: 'Roxa',
    stripes: 1,
    category: 'Pena',
    winCount: 78,
    lossCount: 42
  },
  {
    id: 'opp_carla',
    name: 'Carla "Guarda de Borracha"',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    elo: 1450,
    belt: 'Roxa',
    stripes: 4,
    category: 'Leve',
    winCount: 112,
    lossCount: 65
  },
  {
    id: 'opp_braulio',
    name: 'Braulio "Pé de Chumbo"',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    elo: 1680,
    belt: 'Marrom',
    stripes: 3,
    category: 'Pesada',
    winCount: 160,
    lossCount: 95
  },
  {
    id: 'opp_helio',
    name: 'Mestre Hélio "Virtual Vision"',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
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

// Initial Social Discord Feed Sandbox
export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post_1',
    authorId: 'prof_gracie',
    authorName: 'Sensei Roger Gracie',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    authorBelt: 'Preto',
    category: 'Treino',
    content: 'Hoje às 19h teremos uma masterclass online aqui na JiuSpeak focada na transição da Guarda Fechada para a Raspagem de Tesoura. Não faltem aos treinos mentais, oss!',
    upvotes: 42,
    hasUpvoted: false,
    timestamp: '2 horas atrás',
    comments: [
      {
        id: 'c1',
        authorName: 'Thiago "Filho do Vento"',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        authorBelt: 'Azul',
        content: 'Estarei lá com certeza Mestre! Minha raspagem está travando na altura do joelho dele, preciso de ajuda com a alavanca.',
        timestamp: '1 hora atrás'
      },
      {
        id: 'c2',
        authorName: 'Mestre_Cascão90',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        authorBelt: 'Preto',
        content: 'Maravilha Roger! Essa aula vale ouro. Os detalhes desse quadril salvam qualquer jogo.',
        timestamp: '45 min atrás'
      }
    ]
  },
  {
    id: 'post_2',
    authorId: 'user_4593',
    authorName: 'Guilherme Faixa Azul',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    authorBelt: 'Azul',
    category: 'Meme',
    content: 'Aquele momento em que o faixa preta diz "vamos dar um rolinho leve", você aceita e seu corpo vira origami em 3 minutos de massacre 😂',
    upvotes: 89,
    hasUpvoted: false,
    timestamp: '5 horas atrás',
    comments: []
  },
  {
    id: 'post_3',
    authorId: 'user_1199',
    authorName: 'Fabrícia Guardeira',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    authorBelt: 'Roxa',
    category: 'Dúvida',
    content: 'Alguém mais sente muita fadiga no antebraço ao fazer pegadas na manga na Guarda De la Riva? Algum ajuste postural evita essa força excessiva dos dedos?',
    upvotes: 18,
    hasUpvoted: false,
    timestamp: '1 dia atrás',
    comments: [
      {
        id: 'c3',
        authorName: 'Claudio Chave de Pé',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        authorBelt: 'Marrom',
        content: 'Tente fazer pegada de concha (gancho com 4 dedos para dentro sem torcer) em vez de estrangular o pano do quimono. Use o osso do antebraço como gancho anatômico.',
        timestamp: '18 horas atrás'
      }
    ]
  }
];

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
    description: 'Acumule mais de 2.000 Kimono Coins simultaneamente em seu inventário.',
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
    description: 'Recarga de 1000 Kimono Coins aprovada via PIX Simulador.',
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
