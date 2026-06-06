/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BeltRank } from '../types';

export interface PlaybookLesson {
  id: string;
  title: string;
  duration: string;
  overview: string;
  vocabulary: { term: string; translation: string; pronunciation: string }[];
  dialogue: { speaker: string; textEN: string; textPT: string }[];
  masterTip: string;
  exercises: {
    id: string;
    type: 'multiple_choice' | 'listening' | 'speaking' | 'translation';
    phraseEN?: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    translationKey?: string;
    wordBank?: string[];
    explanation: string;
  }[];
}

export interface PlaybookSyllabus {
  belt: BeltRank;
  title: string;
  courseId: string;
  modules: {
    title: string;
    description: string;
    lessons: PlaybookLesson[];
  }[];
}

export interface NetflixAsset {
  id: string;
  title: string;
  type: 'course' | 'video' | 'pdf' | 'audio' | 'technique' | 'quiz';
  category: BeltRank;
  subcategory: 'Posições' | 'Passagens' | 'Raspagens' | 'Finalizações' | 'Defesa Pessoal' | 'Competições' | 'Arbitragem' | 'Inglês Técnico' | 'Conversação';
  duration: string;
  description: string;
  imageUrl: string;
  xpReward: number;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Profissional';
  videoUrl?: string;
  pdfLines?: string[];
  audioWords?: { word: string; translation: string; pronunciation: string }[];
  quizQuestions?: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }[];
  steps?: {
    title: string;
    description: string;
    dialogueEN?: string;
    dialoguePT?: string;
  }[];
}

export const PLAYBOOK_DATA: PlaybookSyllabus[] = [
  {
    belt: 'Branca',
    title: 'Grade Curricular da Faixa Branca',
    courseId: 'course_modulo_1',
    modules: [
      {
        title: 'Inglês Básico do Tatame (Basic Tatami English)',
        description: 'Fundamentos iniciais de saudações, apresentações, termos anatômicos, direções corporais e comandos vitais de segurança.',
        lessons: [
          {
            id: 'les_m1_1',
            title: 'Greetings (Saudações de Tatame e Respeito)',
            duration: '8 min',
            overview: 'Aprenda a saudar parceiros e professores em inglês com cortesia e respeito clássico do tatame gringo. Domine quando relaxar nas primeiras rolagens.',
            vocabulary: [
              { term: 'Slap and bump', translation: 'Tapa de mão e soquinho (cumprimento clássico)', pronunciation: 'slæp ænd bʌmp' },
              { term: 'How is it going?', translation: 'Como vão as coisas? / E aí?', pronunciation: 'haʊ ɪz ɪt ˈɡoʊ.ɪŋ' },
              { term: 'Oss!', translation: 'Oss! (Saudação tradicional de respeito)', pronunciation: 'ɒs' },
              { term: 'Relax', translation: 'Relaxe / Não use força excessiva', pronunciation: 'rɪˈlæks' }
            ],
            dialogue: [
              { speaker: 'Partner', textEN: 'Hey bro, how is it going? Slap and bump!', textPT: 'E aí mano, como estão as coisas? Tapa e soquinho!' },
              { speaker: 'You', textEN: 'Oss! Let’s have a light roll today, just relax.', textPT: 'Oss! Vamos dar um rola leve hoje, apenas relaxe.' }
            ],
            masterTip: 'No exterior, o cumprimento clássico antes de começar o rola é de fato "slap and bump". Use "relax" quando perceber que o parceiro está tenso demais.',
            exercises: [
              {
                id: 'ex_m1_1_mc',
                type: 'multiple_choice',
                question: 'Qual é o cumprimento clássico antes de iniciar o rola?',
                options: ['Slap and bump', 'Hug and cry', 'Jump and kick', 'Push and pull'],
                correctOptionIndex: 0,
                explanation: '"Slap and bump" é o toque de mãos seguido do soquinho universal de amizade no tatame.'
              },
              {
                id: 'ex_m1_1_ls',
                type: 'listening',
                phraseEN: 'Hello everybody, shake hands, slap and bump and let’s start the practice!',
                question: 'O professor diz para "shake hands" e depois fazer o quê?',
                options: ['Fazer o "slap and bump" de início de treino', 'Dar três tapinhas', 'Puxar direto para a guarda', 'Trocar de quimono'],
                correctOptionIndex: 0,
                explanation: 'A frase encoraja saudar com "shake hands" e "slap and bump".'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    belt: 'Azul',
    title: 'Grade Curricular da Faixa Azul',
    courseId: 'course_modulo_2',
    modules: [
      {
        title: 'Conversação & Diálogos de Treino (Sparring conversation)',
        description: 'Terminologias de rolagens, feedbacks instantâneos, correções de postura e pedidos de ajustes técnicos.',
        lessons: [
          {
            id: 'les_m2_1',
            title: 'Drills (Estratégias de Repetição Dinâmica)',
            duration: '10 min',
            overview: 'Aprenda a solicitar treinos de repetição (drills) e expressar intensidade desejada.',
            vocabulary: [
              { term: 'Drill', translation: 'Treino de repetição técnica', pronunciation: 'drɪl' },
              { term: 'Flow roll', translation: 'Rola focado em movimentação sem força máxima', pronunciation: 'floʊ roʊl' }
            ],
            dialogue: [
              { speaker: 'Partner', textEN: 'Do you want to do some reps of this guard pass?', textPT: 'Você quer fazer algumas repetições dessa passagem de guarda?' },
              { speaker: 'You', textEN: 'Sure! Let’s do a nice flow roll after.', textPT: 'Claro! Vamos fazer um flow roll bacana depois.' }
            ],
            masterTip: 'Sempre faça treinos de "flow roll" para ganhar mobilidade mental e de quadril rápida.',
            exercises: [
              {
                id: 'ex_m2_1_mc',
                type: 'multiple_choice',
                question: 'O que significa a expressão "flow roll" no tatame?',
                options: ['Mover-se fluindo, sem reter força exagerada', 'Lutar por pontos no limite absoluto', 'Fazer apenas queda de judô', 'Alongar os braços'],
                correctOptionIndex: 0,
                explanation: 'Flow roll é uma rolagem solta, fluida e de movimentação constante.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    belt: 'Roxa',
    title: 'Grade Curricular da Faixa Roxa',
    courseId: 'course_modulo_3',
    modules: [
      {
        title: 'Conversação Avançada & Estratégias Complexas',
        description: 'Combates avançados, explicações táticas de saídas e contra-ataques precisos.',
        lessons: [
          {
            id: 'les_m3_1',
            title: 'Underhook Control (Controle de Esgrima)',
            duration: '12 min',
            overview: 'Domine como comandar esgrima e focar em alinhamento de postura no tatame internacional.',
            vocabulary: [
              { term: 'Underhook', translation: 'Esgrima de braço', pronunciation: 'ˈʌndərhʊk' },
              { term: 'Frame', translation: 'Criar uma barreira com o braço/cotovelo', pronunciation: 'freɪm' }
            ],
            dialogue: [
              { speaker: 'You', textEN: 'Fight for the underhook! Don’t let him flatten you.', textPT: 'Lute pela esgrima! Não deixe ele te amassar.' },
              { speaker: 'Partner', textEN: 'I need to make a solid frame first.', textPT: 'Eu preciso fazer uma barreira sólida primeiro.' }
            ],
            masterTip: 'Esgrima ("underhook") manda no jogo de peito a peito. Defenda criando barreiras rígidas ("frames").',
            exercises: [
              {
                id: 'ex_m3_1_mc',
                type: 'multiple_choice',
                question: 'Como definiríamos "underhook" nos combates de solo?',
                options: ['Esgrimar o braço por baixo do ombro do parceiro', 'Dar uma chave de tornozelo', 'Puxar a calça do adversário', 'Amarrar a faixa'],
                correctOptionIndex: 0,
                explanation: '"Underhook" é a tradicional esgrima do Jiu-Jitsu.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    belt: 'Marrom',
    title: 'Grade Curricular da Faixa Marrom',
    courseId: 'course_modulo_4',
    modules: [
      {
        title: 'Liderança de Classes & Seminários Didáticos (Teaching)',
        description: 'Instruções técnicas claras de tatame, posicionamento corporal refinado e voz de comando profissional.',
        lessons: [
          {
            id: 'les_m4_1',
            title: 'Pressure Passing (Passagem de Pressão Absoluta)',
            duration: '15 min',
            overview: 'Aprenda a explicar e guiar passagens pesadas de meia guarda usando peso distribuído.',
            vocabulary: [
              { term: 'Distribute your weight', translation: 'Distribuir seu peso de forma balanceada', pronunciation: 'dɪˈstrɪbjuːt jɔːr weɪt' },
              { term: 'Pressure', translation: 'Pressão física esmagadora', pronunciation: 'ˈprɛʃər' }
            ],
            dialogue: [
              { speaker: 'Instructor', textEN: 'Distribute your weight evenly and apply head pressure.', textPT: 'Distribua seu peso uniformemente e aplique pressão com a cabeça.' },
              { speaker: 'You', textEN: 'Got it. Heavy pressure makes guard passing easy.', textPT: 'Entendi. Pressão pesada facilita a passagem de guarda.' }
            ],
            masterTip: 'Pressão constante esgota o oponente fisicamente e abre espaço seguro para focar o avanço.',
            exercises: [
              {
                id: 'ex_m4_1_mc',
                type: 'multiple_choice',
                question: 'Como falar "Distribua seu peso uniformemente"?',
                options: ['Distribute your weight evenly', 'Throw your belt away', 'Take a deep breath now', 'Jump guard instantly'],
                correctOptionIndex: 0,
                explanation: 'Distribute your weight evenly é a tradução técnica perfeita.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    belt: 'Preto',
    title: 'Grade Curricular da Faixa Preta',
    courseId: 'course_modulo_5',
    modules: [
      {
        title: 'Mestrado Fluente, Podcasts & Relações de Carreira',
        description: 'Gestão de academias globais, imigração e relações de imprensa internacional.',
        lessons: [
          {
            id: 'les_m5_1',
            title: 'Media Interviews & Podcasts (Entrevistas Internacionais)',
            duration: '20 min',
            overview: 'Aprenda a expressar sua jornada esportiva da faixa branca à faixa preta em podcasts de alta audiência.',
            vocabulary: [
              { term: 'Athlete visa', translation: 'Visto de atleta de alto rendimento (P1/EB1-A)', pronunciation: 'ˈæθliːt ˈviːzə' },
              { term: 'Found an academy', translation: 'Abrir / Fundar uma filial ou academia', pronunciation: 'faʊnd ən əˈkædəmi' }
            ],
            dialogue: [
              { speaker: 'Host', textEN: 'Congratulations! How was your journey to establishing your gym?', textPT: 'Parabéns! Como foi sua jornada para abrir seu próprio ginásio?' },
              { speaker: 'You', textEN: 'It was hard, but obtaining the athlete visa changed everything.', textPT: 'Foi difícil, mas conseguir o visto de atleta mudou tudo.' }
            ],
            masterTip: 'A representação clara da sua história de vida cria autoridade e atrai alunos qualificados no exterior.',
            exercises: [
              {
                id: 'ex_m5_1_mc',
                type: 'multiple_choice',
                question: 'Qual visto é o mais cobiçado por lutadores profissionais de BJJ para imigrar para os EUA?',
                options: ['Athlete Visa (P-1 / EB1-A)', 'Student Visa (F-1)', 'Tourist Visa (B-2)', 'Transit Visa (C-1)'],
                correctOptionIndex: 0,
                explanation: 'O visto de atleta de alta performance (P-1 ou EB1-A de habilidades extraordinárias) é vital para consolidar uma carreira nos EUA.'
              }
            ]
          }
        ]
      }
    ]
  }
];

export const NETFLIX_ASSETS: NetflixAsset[] = [
  {
    id: 'course-master-preta',
    title: 'Masterclass: Como Ministrar Seminários Internacionais',
    type: 'course',
    category: 'Preto',
    subcategory: 'Conversação',
    duration: '3 Módulos',
    description: 'Transforme seu conhecimento em faturamento internacional. Estrutura completa de como guiar perguntas com áudio nativo, termos de recepção em seminários, saudações da diretoria e gerenciamento de perguntas de alunos estrangeiros.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
    xpReward: 500,
    difficulty: 'Profissional',
    steps: [
      {
        title: 'Módulo 1: Boas-vindas e Abertura',
        description: 'Diga as palavras certas ao pisar no tatame anfitrião.',
        dialogueEN: 'Welcome everyone! Today we will analyze spatial distribution during guard passing. Grab a partner, let’s drill.',
        dialoguePT: 'Bem-vindos a todos! Hoje vamos analisar a distribuição espacial na passagem de guarda. Peguem um parceiro, vamos treinar.'
      },
      {
        title: 'Módulo 2: Respondendo Perguntas Técnicas',
        description: 'Como lidar com interrupções gringas polidas.',
        dialogueEN: 'That is an excellent question! If he hides his hand under my lapel, I switch my hip angle.',
        dialoguePT: 'Essa é uma excelente pergunta! Se ele esconder a mão embaixo da minha lapela, eu mudo o ângulo do meu quadril.'
      }
    ]
  },
  {
    id: 'vid-postura-branca',
    title: 'Vídeo: Guarda Fechada - Segredos de Postura e Escapadas',
    type: 'video',
    category: 'Branca',
    subcategory: 'Posições',
    duration: '12 min',
    description: 'Evite ser finalizado com facilidade aprendendo a restaurar seu alinhamento vertical dentro da guarda fechada, compreendendo os termos de postura "Posturing Up", "Shoulder Alignment" e comandos de voz rápidos.',
    imageUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=600',
    xpReward: 120,
    difficulty: 'Iniciante',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'pdf-vocab-tatame',
    title: 'PDF: Dicionário Definitivo do Jiu-Jitsu em Inglês',
    type: 'pdf',
    category: 'Branca',
    subcategory: 'Inglês Técnico',
    duration: '15 páginas',
    description: 'Guia definitivo de bolso para atletas que planejam treinar no exterior. Contém ilustrações anatômicas, gírias comuns de vestiário norte-americano e expressões para interações cotidianas na academia.',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    xpReward: 150,
    difficulty: 'Iniciante',
    pdfLines: [
      'Pág 1: Saudações Iniciais - Slap and Bump (Tapa de mão e soquinho)',
      'Pág 2: Nomes de golpes comuns - Armbar (Chave de Braço), Rear-Naked Choke (Mata-Leão)',
      'Pág 3: Comandos de urgência - Tap out (Bater/Desistir), Stop (Parar), Break (Soltar pegada)',
      'Pág 4: Áreas do tatame - Canvas (Tatame), Mat (Área regulamentar), Out of bounds (Fora da área)'
    ]
  },
  {
    id: 'aud-pod-conversacao',
    title: 'Áudio: Podcast - Sobrevivendo ao Primeiro Rola na Gringa',
    type: 'audio',
    category: 'Branca',
    subcategory: 'Conversação',
    duration: '8 min',
    description: 'Áudio dinâmico bilingue imitando o nervosismo de pisar em uma academia internacional. Pratique expressões para pedir rolas leves, explicar lesões prévias de ombro e joelho, e agradecer com total elegância após o combate.',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=600',
    xpReward: 140,
    difficulty: 'Iniciante',
    audioWords: [
      { word: 'My shoulder hurts.', translation: 'Meu ombro dói / estou lesionado', pronunciation: 'maɪ ˈʃoʊ.lər hɜːrts' },
      { word: 'Could we go easy?', translation: 'Poderíamos ir devagar/leve?', pronunciation: 'kʊd wiː ɡoʊ ˈiː.zi' },
      { word: 'Thank you for the roll.', translation: 'Obrigado por rolar comigo', pronunciation: 'θæŋk juː fɔːr ðə roʊl' }
    ]
  },
  {
    id: 'tech-bullfight-azul',
    title: 'Técnica: Passagem Bulls Fighter (Toureada)',
    type: 'technique',
    category: 'Azul',
    subcategory: 'Passagens',
    duration: '15 min',
    description: 'Um passo a passo dinâmico para romper as pegadas da guarda aranha gringa e executar o desvio de pernas torcendo os punhos ("steering the wheel"). Entenda o tempo técnico correto e as frases de instrução técnica.',
    imageUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1be?auto=format&fit=crop&q=80&w=600',
    xpReward: 180,
    difficulty: 'Intermediário',
    steps: [
      {
        title: 'Passo 1: Estabelecer as Pegadas',
        description: 'Pegue na calça do adversário na altura dos joelhos em inglês: "Control the pants right at the knee level."',
        dialogueEN: 'Break the sleeve grip first, then establish pants control.',
        dialoguePT: 'Estoure a pegada da manga primeiro, depois estabeleça o controle da calça.'
      },
      {
        title: 'Passo 2: Movimento de Toureador',
        description: 'Vire o adversário como se estivesse virando um volante: "Steer the wheel and step offline."',
        dialogueEN: 'Pull and push creating an angle to clear his legs.',
        dialoguePT: 'Puxe e empurre criando um ângulo para livrar as pernas dele.'
      },
      {
        title: 'Passo 3: Estabilização Lateral',
        description: 'Abaixo seu quadril e segure a gola de controle para estabilizar o Cem Quilos ("Knee-on-belly or Side control").',
        dialogueEN: 'Establish side control instantly, heavy chest-to-chest weight.',
        dialoguePT: 'Estabeleça o controle lateral imediatamente, peso pesado peito com peito.'
      }
    ]
  },
  {
    id: 'vid-arbitro-ingles',
    title: 'Vídeo: Conversações de Copa do Mundo - Diálogo com Árbitros',
    type: 'video',
    category: 'Azul',
    subcategory: 'Competições',
    duration: '18 min',
    description: 'Simulações reais de lutas de campeonato do circuito IBJJF/AJP em Londres e Los Angeles. Aprenda a pedir pontuações corretas taticamente, solicitar explicações sem ser punido, e interagir educadamente com a arbitragem internacional.',
    imageUrl: 'https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&q=80&w=600',
    xpReward: 200,
    difficulty: 'Intermediário',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'vid-sweep-underhook',
    title: 'Vídeo: Raspagem de Meia-Guarda com Garra de Esgrima',
    type: 'video',
    category: 'Roxa',
    subcategory: 'Raspagens',
    duration: '22 min',
    description: 'Mecânicas da esgrima profunda por baixo das pernas do oponente. Domine a transição para pegar as costas ou derrubar aplicando giro de quadril, enriquecido com frases e comandos em inglês de Roger Gracie.',
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=600',
    xpReward: 220,
    difficulty: 'Avançado',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'qz-regras-ibjjf',
    title: 'Quiz: Regras e Pontuações Internacionais da IBJJF',
    type: 'quiz',
    category: 'Roxa',
    subcategory: 'Arbitragem',
    duration: '5 Questões',
    description: 'Teste seus conhecimentos sobre o livro de regras unificado em inglês da IBJJF. Identifique o que gera punições ("stalling", "slamming") e como são pontuadas passagens, raspagens e quedas nas principais competições gringas.',
    imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    xpReward: 250,
    difficulty: 'Avançado',
    quizQuestions: [
      {
        question: 'O que significa o termo "stalling" na pontuação unificada internacional?',
        options: [
          'Amarrar a luta deliberadamente em uma posição (passividade)',
          'Executar uma finalização espetacular',
          'Tentar dar um golpe traumático ilegal',
          'Sair voando da área regulamentar'
        ],
        correctOptionIndex: 0,
        explanation: '"Stalling" significa travar rala ou jogo sem busca de progresso técnico de finalização, gerando punições cumulativas.'
      },
      {
        question: 'Você ganha quantos pontos por uma raspagem estável (Sweep) segundo as regras?',
        options: ['1 ponto', '2 pontos', '3 pontos', '4 pontos'],
        correctOptionIndex: 1,
        explanation: 'Qualquer inversão iniciada de baixo (da guarda) que dure 3 segundos estabilizada no topo concede exatamente 2 pontos.'
      },
      {
        question: 'O golpe ilegal "Slam" se refere a qual ação faltosa clássica?',
        options: [
          'Arremessar violentamente o parceiro de costas no chão para sair de finalizações regulamentares',
          'Enroscar a lapela no gogó',
          'Segurar os calcanhares sem pegar as mangas',
          'Pedir tempo extra para beber água'
        ],
        correctOptionIndex: 0,
        explanation: '"Slam" (bater estaca) é estritamente ilegal por causar extremo risco de lesão espinhal na cabeça e coluna de lutadores.'
      }
    ]
  },
  {
    id: 'pdf-comunicacao-tatame',
    title: 'PDF: Guia de Comunicação para dar Aulas no Exterior',
    type: 'pdf',
    category: 'Marrom',
    subcategory: 'Inglês Técnico',
    duration: '22 páginas',
    description: 'Fórmula completa e didática para organizar uma classe internacional. Aprenda os comandos de alinhamento de tatame, como chamar ao centro, comandos de segurança médica e incentivo técnico para motivar alunos de língua inglesa.',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=600',
    xpReward: 280,
    difficulty: 'Avançado',
    pdfLines: [
      'Cap 1: Alinhamento Inicial - Line up on the wall (Alinharem-se ao longo da parede por faixas)',
      'Cap 2: Instruções corporais - Keep your posture upright (Mantenham a postura reta e firme)',
      'Cap 3: Gerenciamento de Treinos - Roll in a controlled manner (Rolem de maneira segura e controlada)',
      'Cap 4: Paradas Médicas - Hold on, is anyone bleeding? (Parem, tem alguém sangrando?)'
    ]
  }
];
