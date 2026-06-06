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
  type: 'video' | 'audio' | 'pdf' | 'quiz' | 'exercise';
  category: BeltRank;
  subcategory: string;
  duration: string;
  description: string;
  imageUrl: string;
  xpReward: number;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Profissional' | 'Mestre';
  videoUrl?: string;
  pdfLines?: string[];
  audioWords?: { word: string; translation: string; pronunciation: string }[];
  quizQuestions?: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }[];
  exerciseGoal?: string;
  exerciseTask?: string;
  exerciseAnswerOptions?: string[];
  correctExerciseIndex?: number;
}

// Complete 5-Belt Curriculum with matching Video, Audio, PDF, Quiz, and Exercise for each!
export const NETFLIX_ASSETS: NetflixAsset[] = [
  // ==================== FAIXA BRANCA ====================
  {
    id: 'w-vid-1',
    title: 'Vídeo: Guarda Fechada - Alinhamento Postural',
    type: 'video',
    category: 'Branca',
    subcategory: 'Posições',
    duration: '10 min',
    description: 'Aprenda os segredos da postura vertical de sobrevivência e como falar "Posturing Up" na guarda fechada.',
    imageUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=600',
    xpReward: 100,
    difficulty: 'Iniciante',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'w-aud-1',
    title: 'Áudio: Primeiras Conversas de Tatame',
    type: 'audio',
    category: 'Branca',
    subcategory: 'Conversação',
    duration: '6 min',
    description: 'Como cumprimentar e falar termos essenciais de segurança como "Tap Out" e pedir rola leve ("Go Easy").',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=600',
    xpReward: 80,
    difficulty: 'Iniciante',
    audioWords: [
      { word: 'Slap and bump', translation: 'Toco de mão e soquinho', pronunciation: 'slæp ænd bʌmp' },
      { word: 'Can we roll easy?', translation: 'Podemos rolar leve?', pronunciation: 'kæn wi roʊl ˈiːzi' },
      { word: 'Tap out', translation: 'Bater em desistência', pronunciation: 'tæp aʊt' }
    ]
  },
  {
    id: 'w-pdf-1',
    title: 'PDF: Dicionário Vital do Tatame',
    type: 'pdf',
    category: 'Branca',
    subcategory: 'Inglês Técnico',
    duration: '8 páginas',
    description: 'O guia de bolso do iniciante contendo as fotos anatômicas e nomenclaturas das articulações e comandos básicos.',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    xpReward: 90,
    difficulty: 'Iniciante',
    pdfLines: [
      'Pág 1: Saudações Básicas do Tatame (Oss!, Good morning coach)',
      'Pág 2: Comandos verbais primários (Let’s sit down, Stand up)',
      'Pág 3: Termos de Segurança Essencial (Stop immediately, Tap Out)',
      'Pág 4: Vestimenta e Peças do Quimono (Gi, Pants, Belt, Collar)'
    ]
  },
  {
    id: 'w-qz-1',
    title: 'Quiz: Primeiros Comandos de Sobrevivência',
    type: 'quiz',
    category: 'Branca',
    subcategory: 'Arbitragem',
    duration: '3 Questões',
    description: 'Teste se você sabe agir rapidamente sob pressão linguística e responder a comandos de segurança do juiz.',
    imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    xpReward: 120,
    difficulty: 'Iniciante',
    quizQuestions: [
      {
        question: 'O que o termo "Tap Out" instrui o atleta a fazer?',
        options: ['Desistir / Bater dando três tapinhas', 'Atacar com mais velocidade', 'Chamar o médico', 'Ir para o vestiário'],
        correctOptionIndex: 0,
        explanation: 'Tap out significa sinalizar a desistência física batendo três vezes com a mão no oponente, no tatame ou simulando com o pé.'
      },
      {
        question: 'Como solicitar educadamente um treino cooperativo mais calmo?',
        options: ['Can we roll easy, please?', 'Fight me hard now!', 'I am the champion!', 'Go sleep!'],
        correctOptionIndex: 0,
        explanation: '"Can we roll easy, please?" é a frase correta para pedir uma rodada leve e evitar lesões.'
      }
    ]
  },
  {
    id: 'w-ex-1',
    title: 'Exercício: Vocabulário Prático da Branca',
    type: 'exercise',
    category: 'Branca',
    subcategory: 'Inglês Técnico',
    duration: 'Interativo',
    description: 'Ordene ou monte as sentenças essenciais para pedir instrução de postura de forma correta ao coach.',
    imageUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1be?auto=format&fit=crop&q=80&w=600',
    xpReward: 110,
    difficulty: 'Iniciante',
    exerciseGoal: 'Como dizer "Como faço postura na guarda?"',
    exerciseTask: 'Monte a forma correta da pergunta em inglês:',
    exerciseAnswerOptions: [
      'How do I posture up inside the guard?',
      'Posture up how I guard do in?',
      'Guard do I posture how up inside?',
      'Do I posture guard inside?'
    ],
    correctExerciseIndex: 0
  },

  // ==================== FAIXA AZUL ====================
  {
    id: 'b-vid-1',
    title: 'Vídeo: Passagem Bulls Fighter (Toureada)',
    type: 'video',
    category: 'Azul',
    subcategory: 'Passagens',
    duration: '12 min',
    description: 'Domine o desvio dinâmico de pernas e o jogo de pés técnico para passar a guarda no exterior.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
    xpReward: 130,
    difficulty: 'Intermediário',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'b-aud-1',
    title: 'Áudio: Administrando Intensidade do Rola',
    type: 'audio',
    category: 'Azul',
    subcategory: 'Conversação',
    duration: '7 min',
    description: 'Diálogos de negociação para ajustar o ritmo de treino técnico ou propor treinos específicos ("Specific training").',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=600',
    xpReward: 100,
    difficulty: 'Intermediário',
    audioWords: [
      { word: 'Specific training', translation: 'Treino situacional / focado', pronunciation: 'spəˈsɪfɪk ˈtreɪnɪŋ' },
      { word: 'Let’s start from the closed guard', translation: 'Vamos começar da guarda fechada', pronunciation: 'lɛts stɑːrt frʌm ðə kloʊzd ɡɑːrd' }
    ]
  },
  {
    id: 'b-pdf-1',
    title: 'PDF: Guia Completo de Escapadas',
    type: 'pdf',
    category: 'Azul',
    subcategory: 'Defesa Pessoal',
    duration: '12 páginas',
    description: 'Manual de defesa pessoal detalhando quadris livres, pontes e reposição da guarda de forma segura.',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    xpReward: 110,
    difficulty: 'Intermediário',
    pdfLines: [
      'Pág 1: Defendendo o Cem Quilos (Underhooking, hip escape)',
      'Pág 2: Escapadas de Montada - Bridge and roll (Barrigada e giro)',
      'Pág 3: Alívio de sufocamentos no pescoço (Choking defense)',
      'Pág 4: Saída das costas (Clearing the seatbelt control)'
    ]
  },
  {
    id: 'b-qz-1',
    title: 'Quiz: Posicionamento Defensivo na Gringa',
    type: 'quiz',
    category: 'Azul',
    subcategory: 'Arbitragem',
    duration: '3 Questões',
    description: 'Mantenha os termos de defesa em dia. Teste a precisão técnica do seu vocabulário defensivo.',
    imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    xpReward: 125,
    difficulty: 'Intermediário',
    quizQuestions: [
      {
        question: 'O termo "Hip Escape" equivale a qual ação básica no tatame?',
        options: ['Fuga de quadril', 'Rolar de costas', 'Puxar a cortina', 'Chutão de sola'],
        correctOptionIndex: 0,
        explanation: 'Fuga de quadril é o principal pilar técnico defensivo para recuperar a guarda ou escapar de posições de controle.'
      }
    ]
  },
  {
    id: 'b-ex-1',
    title: 'Exercício: Expressões de Combate',
    type: 'exercise',
    category: 'Azul',
    subcategory: 'Conversação',
    duration: 'Interativo',
    description: 'Selecione a tradução perfeita para planejar um treino situacional focado na costas com seu parceiro gringo.',
    imageUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1be?auto=format&fit=crop&q=80&w=600',
    xpReward: 120,
    difficulty: 'Intermediário',
    exerciseGoal: 'Dizer: "Vamos começar o treino específico das costas"',
    exerciseTask: 'Escolha a frase gramatical correta:',
    exerciseAnswerOptions: [
      'Let’s start specific training from the back.',
      'From specific the start back roll.',
      'We do go easy specific back?',
      'Let’s roll very hard and screaming back.'
    ],
    correctExerciseIndex: 0
  },

  // ==================== FAIXA ROXA ====================
  {
    id: 'p-vid-1',
    title: 'Vídeo: Raspagem com Controle de Esgrima (Underhook)',
    type: 'video',
    category: 'Roxa',
    subcategory: 'Raspagens',
    duration: '15 min',
    description: 'Estratégias avançadas de raspagem baseadas em angulações de esgrima pesada e empurradas transversais.',
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=600',
    xpReward: 140,
    difficulty: 'Avançado',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'p-aud-1',
    title: 'Áudio: Dialogando com Árbitros Internacionais',
    type: 'audio',
    category: 'Roxa',
    subcategory: 'Arbitragem',
    duration: '8 min',
    description: 'Como argumentar pontuações ou vantagens pendentes usando uma linguagem respeitosa no exterior.',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=600',
    xpReward: 120,
    difficulty: 'Avançado',
    audioWords: [
      { word: 'Sir, I established position for 3 seconds', translation: 'Senhor, estabeleci a posição por 3 segundos', pronunciation: 'sɜːr, aɪ ɪsˈtæblɪʃt pəˈzɪʃən fɔːr θriː ˈsɛkəndz' },
      { word: 'Sweep points', translation: 'Pontos de raspagem', pronunciation: 'swiːp pɔɪnts' }
    ]
  },
  {
    id: 'p-pdf-1',
    title: 'PDF: Livro Oficial de Regras IBJJF Traduzido',
    type: 'pdf',
    category: 'Roxa',
    subcategory: 'Arbitragem',
    duration: '20 páginas',
    description: 'Regulamentação completa de pontuação unificada, infrações e posturas passivas ("Stalling").',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    xpReward: 130,
    difficulty: 'Avançado',
    pdfLines: [
      'Seção 1: Quedas e Raspagens - 2 Pontos (Sweep and takedown)',
      'Seção 2: Passagem de guarda estável - 3 Pontos (Guard pass)',
      'Seção 3: Pegada de costas e montada - 4 Pontos (Back control and mount)',
      'Seção 4: Punições por passividade no combate (Stalling penalties)'
    ]
  },
  {
    id: 'p-qz-1',
    title: 'Quiz: Dilemas Técnicos e Arbitragem',
    type: 'quiz',
    category: 'Roxa',
    subcategory: 'Arbitragem',
    duration: '4 Questões',
    description: 'Teste suas tomadas de decisão sob o rigoroso regulamento do circuito mundial em inglês.',
    imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    xpReward: 150,
    difficulty: 'Avançado',
    quizQuestions: [
      {
        question: 'O que o árbitro sinaliza quando aponta para o atleta e pronuncia "Stalling"?',
        options: ['O atleta está amarrando/travando a luta por falta de combatividade', 'O atleta ganhou 2 pontos de esgrima', 'A luta foi encerrada por finalização', 'O quimono está sujo'],
        correctOptionIndex: 0,
        explanation: 'Stalling (passividade ou amarração) é passível de punição segundo as regras técnicas das federações oficiais.'
      }
    ]
  },
  {
    id: 'p-ex-1',
    title: 'Exercício: Esgrima Perfeita',
    type: 'exercise',
    category: 'Roxa',
    subcategory: 'Posições',
    duration: 'Interativo',
    description: 'Construa a sentença de instrução que o córner deve bradar para garantir a esgrima salvadora.',
    imageUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1be?auto=format&fit=crop&q=80&w=600',
    xpReward: 140,
    difficulty: 'Avançado',
    exerciseGoal: 'Como orientar: "Lute pelo controle da esgrima de braço!"',
    exerciseTask: 'Escolha a ordem gramatical americana nativa:',
    exerciseAnswerOptions: [
      'Fight for the underhook control!',
      'Underhook the fight control for!',
      'Roll very hard under the hook no fight!',
      'Tap out under pressure no esgrima!'
    ],
    correctExerciseIndex: 0
  },

  // ==================== FAIXA MARROM ====================
  {
    id: 'm-vid-1',
    title: 'Vídeo: Didática de Ensino de Tatame',
    type: 'video',
    category: 'Marrom',
    subcategory: 'Inglês Técnico',
    duration: '18 min',
    description: 'Como assumir posições de liderança, abrir espaço e dar feedback oral refinado para alunos gringos.',
    imageUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1be?auto=format&fit=crop&q=80&w=600',
    xpReward: 160,
    difficulty: 'Profissional',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'm-aud-1',
    title: 'Áudio: Comandos Coletivos de Aula',
    type: 'audio',
    category: 'Marrom',
    subcategory: 'Conversação',
    duration: '10 min',
    description: 'Treine sua voz de comando para conduzir aquecimentos ("Warm-ups") e coordenar rotações de tatame de forma profissional.',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=600',
    xpReward: 140,
    difficulty: 'Profissional',
    audioWords: [
      { word: 'Everyone, line up by belt rank!', translation: 'Todos, alinhem-se por ordem de faixa!', pronunciation: 'ˈɛvriwʌn, laɪn ʌp baɪ bɛlt ræŋk' },
      { word: 'Time to switch partners!', translation: 'Hora de trocar de parceiro!', pronunciation: 'taɪm tuː swɪʧ ˈpɑːtnəz' }
    ]
  },
  {
    id: 'm-pdf-1',
    title: 'PDF: Currículo Didático de um Professor de Elite',
    type: 'pdf',
    category: 'Marrom',
    subcategory: 'Conversação',
    duration: '15 páginas',
    description: 'Exemplos estruturados de planejamento de aulas diárias, planos de treinos situacionais e instruções em inglês.',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    xpReward: 150,
    difficulty: 'Profissional',
    pdfLines: [
      'Módulo 1: Condução dos primeiros 10 minutos (Warm-ups, light jogging)',
      'Módulo 2: Explicação da técnica primária (Anatomical alignment, core details)',
      'Módulo 3: Rounds de repetição orientada (Specific technical drills)',
      'Módulo 4: Gerenciamento e segurança na luta livre (Sparring rules)'
    ]
  },
  {
    id: 'm-qz-1',
    title: 'Quiz: Pedagogia Corporativa do BJJ',
    type: 'quiz',
    category: 'Marrom',
    subcategory: 'Inglês Técnico',
    duration: '3 Questões',
    description: 'Teste sua postura pedagógica ao ensinar comandos avançados de quadril em turmas de língua inglesa.',
    imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    xpReward: 160,
    difficulty: 'Profissional',
    quizQuestions: [
      {
        question: 'Qual é o comando mais comum para iniciar o alinhamento inicial da classe?',
        options: ['Please line up by your belt ranks', 'Go to sleep everyone', 'Run outside the building', 'Start fighting immediately'],
        correctOptionIndex: 0,
        explanation: '"Line up by belt rank" é o comando oficial e milenar usado para colocar os atletas em ordem de graduação ao longo da parede.'
      }
    ]
  },
  {
    id: 'm-ex-1',
    title: 'Exercício: Liderança Pedagógica',
    type: 'exercise',
    category: 'Marrom',
    subcategory: 'Conversação',
    duration: 'Interativo',
    description: 'Monte a chamada de segurança médica ideal para parar um combate caso algum atleta apresente sangramento físico.',
    imageUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1be?auto=format&fit=crop&q=80&w=600',
    xpReward: 150,
    difficulty: 'Profissional',
    exerciseGoal: 'Como exclamar: "Parem todos! Tem alguém sangrando!"',
    exerciseTask: 'Escolha a frase gramatical de autoridade nativa:',
    exerciseAnswerOptions: [
      'Stop everyone! Someone is bleeding!',
      'Bleeding start fight hard go!',
      'Bleed tap out everyone stop!',
      'Roll and bleed no medical help!'
    ],
    correctExerciseIndex: 0
  },

  // ==================== FAIXA PRETA ====================
  {
    id: 'k-vid-1',
    title: 'Vídeo: Masterclass - Ministrando Seminários de Sucesso',
    type: 'video',
    category: 'Preto',
    subcategory: 'Competições',
    duration: '25 min',
    description: 'Diga as palavras exatas e aplique gatilhos didáticos para conduzir seminários lotados nos EUA e Europa.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
    xpReward: 300,
    difficulty: 'Mestre',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'k-aud-1',
    title: 'Áudio: Entrevista em Podcast de Grande Audiência',
    type: 'audio',
    category: 'Preto',
    subcategory: 'Conversação',
    duration: '15 min',
    description: 'Treine a fluência em perguntas e respostas típicas de podcasts prestigiados sobre carreiras de luta e dedicação integral.',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=600',
    xpReward: 250,
    difficulty: 'Mestre',
    audioWords: [
      { word: 'It is an absolute honor to be here', translation: 'É uma honra absoluta estar aqui', pronunciation: 'ɪt ɪz ən ˈæbsəluːt ˈɒnər tuː biː hɪə' },
      { word: 'Obtaining my athlete visa', translation: 'A obtenção do meu visto de atleta', pronunciation: 'əbˈteɪnɪŋ maɪ ˈæθliːt ˈviːzə' }
    ]
  },
  {
    id: 'k-pdf-1',
    title: 'PDF: Dossiê de Imigração e Carreira Esportiva',
    type: 'pdf',
    category: 'Preto',
    subcategory: 'Conversação',
    duration: '35 páginas',
    description: 'Como organizar seu portfólio de atleta extraordinário de BJJ para obter vistos consulares americanos do tipo P1 e EB1-A.',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    xpReward: 260,
    difficulty: 'Mestre',
    pdfLines: [
      'Gatilho 1: Acumular prêmios e medalhas em torneios IBJJF mundiais e open',
      'Gatilho 2: Obter cartas de recomendação de lendas do esporte (Roger, Gracie)',
      'Gatilho 3: Reportagens de portais internacionais de jiu-jitsu (FloGrappling)',
      'Gatilho 4: Contratos e licenças de ensino no exterior (Filiais)'
    ]
  },
  {
    id: 'k-qz-1',
    title: 'Quiz: Negociações e Contratos Internacionais',
    type: 'quiz',
    category: 'Preto',
    subcategory: 'Inglês Técnico',
    duration: '3 Questões',
    description: 'Avalie como conduzir de forma segura cláusulas de faturamento para turnês internacionais de seminários.',
    imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    xpReward: 300,
    difficulty: 'Mestre',
    quizQuestions: [
      {
        question: 'Qual a forma correta em inglês para propor uma divisão de 70% do faturamento de um seminário para o mestre?',
        options: [
          'We propose a seventy-thirty split of the seminar revenue',
          'Divide thirty dollar seventy cent let’s go',
          'Give me all your money split seventy to you zero',
          'Free roll for seventy hours split contract'
        ],
        correctOptionIndex: 0,
        explanation: '"A seventy-thirty split" é a nomenclatura técnica refinada usada para descrever partilha de comissão sobre eventos esportivos.'
      }
    ]
  },
  {
    id: 'k-ex-1',
    title: 'Exercício: Discurso de Campeão Mundial',
    type: 'exercise',
    category: 'Preto',
    subcategory: 'Conversação',
    duration: 'Interativo',
    description: 'Monte o agradecimento de vitória mais empoderado para conquistar a simpatia dos patrocinadores mundiais.',
    imageUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1be?auto=format&fit=crop&q=80&w=600',
    xpReward: 250,
    difficulty: 'Mestre',
    exerciseGoal: 'Dizer: "Gostaria de agradecer ao meu professor, equipe e patrocinadores!"',
    exerciseTask: 'Ordene a oratória profissional em inglês:',
    exerciseAnswerOptions: [
      'I would like to thank my head coach, team and sponsors!',
      'Coach head sponsors team thank would like I!',
      'Team sponsors fight would thank me coach like!',
      'Thank you my sponsor and gym give me money!'
    ],
    correctExerciseIndex: 0
  }
];

// Re-export PLAYBOOK_DATA as legacy syllabus backup
export const PLAYBOOK_DATA: PlaybookSyllabus[] = [
  {
    belt: 'Branca',
    title: 'Aquecimentos Mentais',
    courseId: 'white_play',
    modules: [
      {
        title: 'Greetings Vital',
        description: 'Conceitos gramaticais.',
        lessons: []
      }
    ]
  }
];
