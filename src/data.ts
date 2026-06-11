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
export const INITIAL_MARKETPLACE_ITEMS: InventoryItem[] = [
  {
    id: 'p2p_gi_koral',
    name: 'Kimono Koral Vintage 1998',
    description: 'Direto do armário de um faixa preta aposentado. Desgastado na dose certa para assustar adversários.',
    category: 'gi',
    price: 4500,
    currency: 'JT',
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
    currency: 'JT',
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
    currency: 'JT',
    rarity: 'Lendário',
    imageUrl: '',
    sellerId: 'user_2288',
    sellerName: 'RyanGracieFan'
  }
];

// Duolingo-style structured learning syllabus
export const COURSES: Course[] = [
  {
    id: 'course_modulo_1',
    title: 'Módulo 1 - Inglês Básico do Tatame',
    description: 'Aprenda os nomes das posições fundamentais, comandos de segurança, peças do uniforme e anatomia BJJ em inglês. O alicerce essencial para qualquer atleta internacional.',
    creatorId: 'prof_gracie',
    creatorName: 'Mestre Roger Gracie',
    creatorBadge: 'Preto',
    priceBRL: 0,
    rating: 4.9,
    studentCount: 3120,
    reviews: 580,
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=400',
    lessons: [
      {
        id: 'les_m1_1',
        title: 'Posições e Pegadas (Positions & Grips)',
        description: 'Domine a terminologia clássica para posições de dominância e tipos de pegada no kimono.',
        duration: '10 min',
        quiz: [
          {
            id: 'q_m1_1_1',
            question: 'Como traduzimos "Puxar para a Guarda" e "Fuga de Quadril" para o inglês correto do Jiu-Jitsu?',
            options: [
              'Pull guard & Hip escape / Shrimping',
              'Push floor & Skip butt',
              'Jump guard & Move down',
              'Bring body & Leg out'
            ],
            correctOptionIndex: 0,
            explanation: '"Pull guard" é o termo técnico para puxar para a guarda e "Hip escape" ou "shrimping" (pelo movimento lembrar um camarão) refere-se à fuga de quadril.',
            avatarInstruction: 'Hello! Lembre-se: no exterior, todos chamam a fuga de quadril de "shrimping". Fique atento!'
          },
          {
            id: 'q_m1_1_2',
            question: 'Qual é o nome em inglês para a clássica posição de "Cem Quilos"?',
            options: [
              'One hundred kilos',
              'Side control or Side mount',
              'Full chest pressure',
              'Heavy lateral holding'
            ],
            correctOptionIndex: 1,
            explanation: 'Embora alguns falem metros ou quilos em traduções literais, o termo correto e universalmente usado em todas as academias americanas é "Side control" ou "Side mount".',
            avatarInstruction: 'Never say "one hundred kilos" unless you want to confuse your partner! Say "side control"!'
          }
        ]
      },
      {
        id: 'les_m1_2',
        title: 'Uniforme e Gírias Iniciais',
        description: 'Termos práticos sobre quimono, protetor bocal e faixas.',
        duration: '8 min',
        quiz: [
          {
            id: 'q_m1_2_1',
            question: 'Como se fala "Quimono", "Faixa" e "Protetor Bucal" em inglês?',
            options: [
              'Kimono, Strap, Teeth guard',
              'Gi, Belt, Mouthguard',
              'Uniform, Ribbon, Mouth cover',
              'BJJ suit, Cord, Teeth buffer'
            ],
            correctOptionIndex: 1,
            explanation: 'No inglês de Jiu-Jitsu, "Gi" é o termo preferencial para Quimono, "Belt" é Faixa, e "Mouthguard" é o Protetor Bucal.',
            avatarInstruction: 'Safety first! Always ask: "Do you have your mouthguard on?" before a heavy round!'
          }
        ]
      }
    ]
  },
  {
    id: 'course_modulo_2',
    title: 'Módulo 2 - Conversação no Jiu-Jítsu',
    description: 'Aprenda como convidar parceiros internacionais para treinar, estabelecer limites com segurança, elogiar e tirar dúvidas antes e depois do rola.',
    creatorId: 'prof_mendes',
    creatorName: 'Mestre Guilherme Mendes (AOJ)',
    creatorBadge: 'Preto',
    priceBRL: 0,
    rating: 5.0,
    studentCount: 2450,
    reviews: 412,
    imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=400',
    lessons: [
      {
        id: 'les_m2_1',
        title: 'Convidando para Treinar (Iniviting to Roll)',
        description: 'Frases educadas e termos corretos para chamar alguém para rolar preservando a etiqueta do tatame.',
        duration: '12 min',
        quiz: [
          {
            id: 'q_m2_1_1',
            question: 'Se você quer convidar alguém de forma natural para um "treino leve", qual frase expressa melhor essa intenção?',
            options: [
              'Would you like to do a light roll / flow roll?',
              'Let’s fight light with no pressure',
              'Do you want to play weak with me?',
              'Can we simulate a soft combat?'
            ],
            correctOptionIndex: 0,
            explanation: '"Roll" é o verbo para treinar/rolar. "Light roll" ou "Flow roll" são os termos perfeitos para pedir um treino leve focado em movimentação técnica.',
            avatarInstruction: 'Be polite! In premium academies like AOJ, safe communication is highly valued.'
          },
          {
            id: 'q_m2_1_2',
            question: 'Como você avisa seu parceiro sobre uma lesão prévia para evitar contato forte na região?',
            options: [
              'I am broken here, please don\'t touch',
              'I have a minor injury in my shoulder/knee, so let\'s watch out there, please.',
              'My body is painful, be careful with your weight',
              'Don\'t squeeze my bone because it hurts'
            ],
            correctOptionIndex: 1,
            explanation: '"I have an injury in my..." é a expressão perfeita para sinalizar uma lesão prévia nas articulações antes de iniciar o rola, prevenindo acidentes.',
            avatarInstruction: 'Comunicação limpa evita cirurgias! Avise sempre antes de começar: "Let\'s keep it playful, my knee is injured."'
          }
        ]
      }
    ]
  },
  {
    id: 'course_modulo_3',
    title: 'Módulo 3 - Professor Internacional',
    description: 'Prepare-se para ministrar seminários, dar aulas em inglês e dar instruções corretas aos seus alunos estrangeiros com clareza e respeito.',
    creatorId: 'prof_danaher',
    creatorName: 'Professor John Danaher',
    creatorBadge: 'Preto',
    priceBRL: 99.90,
    rating: 4.8,
    studentCount: 1890,
    reviews: 322,
    imageUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=400',
    lessons: [
      {
        id: 'les_m3_1',
        title: 'Ganhando a Esgrima e Controlando as Alavancas',
        description: 'Aprenda os termos cruciais de distribuição de peso e criação de ganchos em inglês de nível didático.',
        duration: '15 min',
        quiz: [
          {
            id: 'q_m3_1_1',
            question: 'Qual é o termo específico em inglês usado para descrever a "Esgrima" (passar o braço por baixo da axila)?',
            options: [
              'Underhook',
              'Sword arm',
              'Underarm slice',
              'Inner hooker'
            ],
            correctOptionIndex: 0,
            explanation: 'A esgrima é chamada universalmente de "Underhook" (se for por baixo) ou "Overhook" (se for por cima, abraçando o braço adversário).',
            avatarInstruction: 'Danaher Mindset: "Underhook control is the basis of high-performance positional mechanics."'
          },
          {
            id: 'q_m3_1_2',
            question: 'Como o professor deve instruir em inglês para o aluno "colocar os dois ganchos" ao pegar as costas?',
            options: [
              'Put your two little feet inside',
              'Insert both hooks',
              'Catch the hips with legs',
              'Secure the double locks'
            ],
            correctOptionIndex: 1,
            explanation: 'O comando clássico usado por professores internacionais é "Insert both hooks" ou "Put your hooks in".',
            avatarInstruction: 'Sem os ganchos ("hooks"), você não ganha os pontos do controle de costas e seu oponente escorrega fácil!'
          }
        ]
      }
    ]
  },
  {
    id: 'course_modulo_4',
    title: 'Módulo 4 - Campeonatos Internacionais',
    description: 'Entenda os termos de pontuação, as regras oficiais da IBJJF divulgadas em inglês e entenda instantaneamente as chamadas do árbitro internacional.',
    creatorId: 'prof_alliance',
    creatorName: 'Sensei Fábio Gurgel',
    creatorBadge: 'Preto',
    priceBRL: 0,
    rating: 4.9,
    studentCount: 1540,
    reviews: 198,
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    lessons: [
      {
        id: 'les_m4_1',
        title: 'Pontuação e Faltas (Points & Penalties)',
        description: 'Conheça o valor de cada posição e como os árbitros chamam as vantagens e punições na gringa.',
        duration: '12 min',
        quiz: [
          {
            id: 'q_m4_1_1',
            question: 'Quantos pontos vale uma "Raspagem" (Sweep) e uma "Passagem de Guarda" (Guard Pass) de acordo com o livro de regras internacional?',
            options: [
              'Sweep is 2 points, Guard pass is 3 points',
              'Sweep is 3 points, Guard pass is 4 points',
              'Sweep is 1 point, Guard pass is 2 points',
              'Both positions are worth 2 points'
            ],
            correctOptionIndex: 0,
            explanation: 'De acordo com as regras oficiais, aplicar uma raspagem qualificada ("sweep") concede 2 pontos, e estabilizar a passagem de guarda ("guard pass") por 3 segundos concede 3 pontos.',
            avatarInstruction: 'Oss! Não confunda os pontos no calor da luta internacional. 2 para a raspagem, 3 para a passagem!'
          },
          {
            id: 'q_m4_1_2',
            question: 'Qual é o termo oficial para "Falta de combatividade" ou "Amarração"?',
            options: [
              'Stalling',
              'Stopping the match',
              'No fighting penalty',
              'Holding game'
            ],
            correctOptionIndex: 0,
            explanation: 'Amarrar a posição para atrasar o combate é chamado de "Stalling" (punido severamente pelas federações internacionais).',
            avatarInstruction: 'Active combat is key. Se ficar parado na meia-guarda sem progredir, o juiz gritará "Stalling!" e te punirá.'
          }
        ]
      }
    ]
  },
  {
    id: 'course_modulo_5',
    title: 'Módulo 5 - Inglês Real do Jiu-Jítsu',
    description: 'Prepare-se para lidar com as gírias de rua das maiores academias da Califórnia, Texas e Nova York. Jargões de fóruns online de BJJ que ninguém ensina nos livros.',
    creatorId: 'prof_alliance',
    creatorName: 'Atleta Internacional JiuSpeak Team',
    creatorBadge: 'Preto',
    priceBRL: 149.90,
    rating: 5.0,
    studentCount: 1100,
    reviews: 216,
    imageUrl: 'https://images.unsplash.com/photo-1615117971313-71f77fe49927?auto=format&fit=crop&q=80&w=400',
    lessons: [
      {
        id: 'les_m5_1',
        title: 'Gírias Urbanas e Fóruns de Discussão (Reddit & Reddit BJJ)',
        description: 'De oponentes "spazzing" a atletas "sandbaggers". Entenda bem o vocabulário das resenhas.',
        duration: '15 min',
        quiz: [
          {
            id: 'q_m5_1_1',
            question: 'O que a comunidade americana quer dizer com o termo "Spazzing White Belt"?',
            options: [
              'Um aluno inteligente de faixa branca com técnica impecável.',
              'Um faixa branca descontrolado, que treina com força desmedida e movimentos erráticos, arriscando machucar os parceiros.',
              'O uniforme oficial de cor branca usado por passadores experientes.',
              'Uma raspagem ultra rápida feita na guarda laçada.'
            ],
            correctOptionIndex: 1,
            explanation: 'Um "spazzing white belt" é o típico iniciante descontrolado que compensa a falta de técnica com pura adrenalina e força bruta explosiva.',
            avatarInstruction: 'Stay calm! Quando pegar um "spazzing belt", faça guarda fechada, controle a gola e deixe ele se cansar sozinho!'
          },
          {
            id: 'q_m5_1_2',
            question: 'O que significa o jargão sarcástico "Sandbagger"?',
            options: [
              'Um atleta que limpa os tatames no final do dia.',
              'Um lutador que finge cansaço para surpreender no final.',
              'Um competidor experiente que atrasa sua mudança de faixa de propósito para continuar ganhando campeonatos em categorias mais fracas.',
              'O saco de pancadas usado em treinos de wrestling e condicionamento.'
            ],
            correctOptionIndex: 2,
            explanation: '"Sandbagger" é o termo pejorativo usado para quem "segura a faixa", ou seja, o lutador que tem nível técnico de uma faixa superior, mas compete na inferior para garantir medalhas fáceis.',
            avatarInstruction: 'Ninguém respeita um sandbagger na comunidade! O verdadeiro guerreiro quer sempre progredir para testar seus limites!'
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

// Initial Social Discord Feed Sandbox
export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post_1',
    authorId: 'prof_gracie',
    authorName: 'Lucas Monteiro',
    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucas%20Monteiro&backgroundColor=ff4a5a&radius=50&mouth=smile&eyebrows=variant01,variant06,variant07,variant08',
    authorBelt: 'Preto',
    category: 'Treino',
    content: 'Hoje às 19h teremos uma masterclass online aqui na JiuSpeak focada na transição da Guarda Fechada para a Raspagem de Tesoura. Não faltem aos treinos mentais, oss!',
    upvotes: 42,
    hasUpvoted: false,
    timestamp: '2 horas atrás',
    comments: [
      {
        id: 'c1',
        authorName: 'Gabriel Santos',
        authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gabriel%20Santos&backgroundColor=4a60ff&radius=50&mouth=smile&eyebrows=variant01,variant06,variant07,variant08',
        authorBelt: 'Azul',
        content: 'Estarei lá com certeza Mestre! Minha raspagem está travando na altura do joelho dele, preciso de ajuda com a alavanca.',
        timestamp: '1 hora atrás'
      },
      {
        id: 'c2',
        authorName: 'Felipe Costa',
        authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felipe%20Costa&backgroundColor=2a2a2a&radius=50&mouth=smile&eyebrows=variant01,variant06,variant07,variant08',
        authorBelt: 'Preto',
        content: 'Maravilha Roger! Essa aula vale ouro. Os detalhes desse quadril salvam qualquer jogo.',
        timestamp: '45 min atrás'
      }
    ]
  },
  {
    id: 'post_2',
    authorId: 'user_4593',
    authorName: 'Bruno Ferreira',
    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bruno%20Ferreira&backgroundColor=ffffff&radius=50&mouth=smile&eyebrows=variant01,variant06,variant07,variant08',
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
    authorName: 'Juliana Mendes',
    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Juliana%20Mendes&backgroundColor=7e49ff&radius=50&mouth=smile&eyebrows=variant02,variant03,variant04,variant05',
    authorBelt: 'Roxa',
    category: 'Dúvida',
    content: 'Alguém mais sente muita fadiga no antebraço ao fazer pegadas na manga na Guarda De la Riva? Algum ajuste postural evita essa força excessiva dos dedos?',
    upvotes: 18,
    hasUpvoted: false,
    timestamp: '1 dia atrás',
    comments: [
      {
        id: 'c3',
        authorName: 'Vinicius Rocha',
        authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vinicius%20Rocha&backgroundColor=a65c2e&radius=50&mouth=smile&eyebrows=variant01,variant06,variant07,variant08',
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
    description: 'Acumule mais de 2.000 Jiutickets simultaneamente em seu inventário.',
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
    description: 'Recarga de 1000 Jiutickets aprovada via PIX Simulador.',
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
