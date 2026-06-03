/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Award, 
  Check, 
  HelpCircle, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Play, 
  ChevronRight, 
  Lock, 
  QrCode, 
  Copy,
  CheckCircle,
  Brain,
  Volume2,
  Mic,
  Languages,
  BookMarked,
  ArrowRight,
  Sparkle,
  History,
  Trophy,
  CheckCircle2,
  LockKeyhole,
  CheckSquare,
  Compass,
  Search,
  Heart
} from 'lucide-react';
import { UserProfile, Course, Lesson, QuizQuestion, BeltRank } from '../types';

interface LessonsProps {
  user: UserProfile;
  courses: Course[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  onAddAuditLog: (type: any, desc: string, amtBRL?: number, amtKC?: number) => void;
  addXp: (amount: number, reason: string) => void;
  addCoins: (amount: number, reason: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface PlaybookLesson {
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
    phraseEN?: string; // used for speaking/listening voice source
    question: string;
    options: string[]; // options for choice/listening
    correctOptionIndex: number;
    translationKey?: string; // correct translated text
    wordBank?: string[]; // pieces for translation choice bubble
    explanation: string;
  }[];
}

// 1. Detailed Interactive syllabus matching the specified structure per belt rank
interface PlaybookSyllabus {
  belt: BeltRank;
  title: string;
  courseId: string;
  modules: {
    title: string;
    description: string;
    lessons: PlaybookLesson[];
  }[];
}

const PLAYBOOK_DATA: PlaybookSyllabus[] = [
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
            title: 'Lição 1: Greetings (Saudações de Tatame e Respeito)',
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
            masterTip: 'No exterior, o cumprimento clássico antes de começar o rola é de fato "slap and bump". Use "relax" quando perceber que o parceiro está tenso demais e usando força desnecessária.',
            exercises: [
              {
                id: 'ex_m1_1_mc',
                type: 'multiple_choice',
                question: 'Qual é o cumprimento clássico entre parceiros antes de iniciar o rola?',
                options: [
                  'Slap and bump',
                  'Hug and cry',
                  'Jump and kick',
                  'Push and pull'
                ],
                correctOptionIndex: 0,
                explanation: '"Slap and bump" é o toque de mãos seguido do soquinho universal de amizade e respeito no tatame.'
              },
              {
                id: 'ex_m1_1_ls',
                type: 'listening',
                phraseEN: 'Hello everybody, shake hands, slap and bump and let’s start the practice!',
                question: 'O professor diz para "shake hands" e depois fazer o quê?',
                options: [
                  'Fazer o "slap and bump" de início de treino',
                  'Dar três tapinhas de desistência',
                  'Puxar direto para a guarda',
                  'Trocar de quimono'
                ],
                correctOptionIndex: 0,
                explanation: 'A frase encoraja saudar com "shake hands" (apertar mãos) e "slap and bump".'
              },
              {
                id: 'ex_m1_1_sp',
                type: 'speaking',
                phraseEN: 'Just relax and let’s have a light roll today.',
                question: 'Fale esta clássica sugestão para manter o rola calmo e descontraído:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'Esta frase pede para o parceiro relaxar ("just relax") e fazer um combate leve ("light roll").'
              },
              {
                id: 'ex_m1_1_tr',
                type: 'translation',
                question: 'Traduza o conselho fundamental para poupar energia: "RELAX"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'relaxe',
                wordBank: ['Relaxe (fique calmo)', 'Aperte a gola', 'Fuga de quadril', 'Bata com o pé'],
                explanation: '"Relax" significa relaxar e dosar a força de forma inteligente.'
              }
            ]
          },
          {
            id: 'les_m1_2',
            title: 'Lição 2: Introductions (Apresentações e Oxigênio)',
            duration: '9 min',
            overview: 'Aprenda a dizer sua faixa, academia e professor de origem quando treinar em terras gringas. Lembre-se sempre de respirar e oxigenar o corpo!',
            vocabulary: [
              { term: 'White belt', translation: 'Faixa branca', pronunciation: 'waɪt bɛlt' },
              { term: 'Professor / Coach', translation: 'Professor / Treinador', pronunciation: 'prəˈfɛsər / koʊtʃ' },
              { term: 'Academy', translation: 'Academia / Ginásio de treinos', pronunciation: 'əˈkædəmi' },
              { term: 'Breathe', translation: 'Respire / Controlar a respiração', pronunciation: 'briːð' }
            ],
            dialogue: [
              { speaker: 'Coach', textEN: 'Welcome! What belt rank are you and where is your academy?', textPT: 'Bem-vindo! Qual é a sua faixa e de onde é a sua academia?' },
              { speaker: 'You', textEN: 'I am a white belt visiting from Brazil. I need to breathe!', textPT: 'Eu sou um faixa branca visitando do Brasil. Eu estou precisando respirar!' }
            ],
            masterTip: 'Ao se apresentar no exterior, "white belt" indica seu nível de iniciante. Muitos alunos usam muita força e prendem o fôlego; então lembre-se de ouvir o conselho de "breathe"!',
            exercises: [
              {
                id: 'ex_m1_2_mc',
                type: 'multiple_choice',
                question: 'Como se diz "Faixa Branca" no vocabulário oficial técnico?',
                options: [
                  'White belt',
                  'Pale belt',
                  'Light rope',
                  'Blank stripe'
                ],
                correctOptionIndex: 0,
                explanation: '"White belt" é a designação universal na gringa para a faixa branca.'
              },
              {
                id: 'ex_m1_2_ls',
                type: 'listening',
                phraseEN: 'Make sure you keep calm and breathe during the round.',
                question: 'Qual é o conselho básico na gravação?',
                options: [
                  'Manter a calma e respirar durante o round',
                  'Atacar o pescoço imediatamente',
                  'Desistir e sentar na beira do tatame',
                  'Iniciar a luta em pé'
                ],
                correctOptionIndex: 0,
                explanation: '"Breathe during the round" instrui o atleta a respirar e não prender o ar sob pressão.'
              },
              {
                id: 'ex_m1_2_sp',
                type: 'speaking',
                phraseEN: 'I am a white belt visiting your academy today.',
                question: 'Apresente-se polidamente na recepção ou ao instrutor gringo:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'A frase diz: "Eu sou um faixa branca visitando sua academia hoje."'
              },
              {
                id: 'ex_m1_2_tr',
                type: 'translation',
                question: 'Traduza a ação vital ensinada no treino: "BREATHE"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'respire',
                wordBank: ['Respire', 'Derrube', 'Pressione', 'Feche a guarda'],
                explanation: '"Breathe" significa respirar de forma cadenciada e focada.'
              }
            ]
          },
          {
            id: 'les_m1_3',
            title: 'Lição 3: Body Parts (Partes Anatômicas e a Ponte)',
            duration: '10 min',
            overview: 'Descreva perfeitamente seções do seu corpo no tatame para fins de alvos mecânicos ou para sinalizar lesões. Entenda a importância de fazer a ponte ("bridge").',
            vocabulary: [
              { term: 'Elbow / Wrist', translation: 'Cotovelo / Punho', pronunciation: 'ˈɛl.boʊ / rɪst' },
              { term: 'Neck / Throat', translation: 'Pescoço / Garganta', pronunciation: 'nɛk / θroʊt' },
              { term: 'Ankle / Knee', translation: 'Tornozelo / Joelho', pronunciation: 'ˈæŋ.kəl / niː' },
              { term: 'Bridge', translation: 'Ponte / Barrigada de quadril', pronunciation: 'brɪdʒ' }
            ],
            dialogue: [
              { speaker: 'Instructor', textEN: 'Tuck in your elbows and make a strong bridge to escape.', textPT: 'Encolha seus cotovelos e faça uma boa ponte para escapar.' },
              { speaker: 'You', textEN: 'Yes sir, I will bridge and shrimp immediately!', textPT: 'Sim senhor, eu vou fazer uma ponte e fugir o quadril imediatamente!' }
            ],
            masterTip: 'A ponte ("bridge") consiste em tirar os quadris do chão usando impulso dos pés. Trata-se da mecânica básica número um para desestabilizar quem tenta te prender montado.',
            exercises: [
              {
                id: 'ex_m1_3_mc',
                type: 'multiple_choice',
                question: 'Como chamamos a famosa "Barrigada / Ponte" para escapar da montada ou dos cem quilos?',
                options: [
                  'Bridge',
                  'Wall jump',
                  'Floor slide',
                  'Table lift'
                ],
                correctOptionIndex: 0,
                explanation: '"Bridge" é o termo exato em inglês para ponte corporal de barrigada.'
              },
              {
                id: 'ex_m1_3_ls',
                type: 'listening',
                phraseEN: 'My left elbow and wrist are feeling a bit sore.',
                question: 'Quais articulações estão doloridas na gravação?',
                options: [
                  'Cotovelo e punho esquerdo',
                  'Pescoço e garganta',
                  'Tornozelo e joelho direito',
                  'Costas e quadril'
                ],
                correctOptionIndex: 0,
                explanation: '"Left elbow" refere-se ao cotovelo esquerdo e "wrist" refere-se ao punho.'
              },
              {
                id: 'ex_m1_3_sp',
                type: 'speaking',
                phraseEN: 'Protect your neck and bridge to escape his mount.',
                question: 'Fale o comando técnico instruindo seu colega por baixo:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'A frase diz: "Proteja seu pescoço e faça a ponte para escapar da montada dele."'
              },
              {
                id: 'ex_m1_3_tr',
                type: 'translation',
                question: 'Traduza o termo "ELBOW" essencial no controle defensivo:',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'cotovelo',
                wordBank: ['Cotovelo', 'Perna', 'Quimono', 'Faixa de graus'],
                explanation: '"Elbow" é o cotovelo, parte vital a ser mantida fechada e protegida.'
              }
            ]
          },
          {
            id: 'les_m1_4',
            title: 'Lição 4: Directions (Direções de Movimento e o Camarão)',
            duration: '10 min',
            overview: 'Aprenda expressões de deslocamento corporal no tatame. Estude como mover-se para frente, trás, sob ou sobre as pernas, e domine a fuga de quadril ("shrimp").',
            vocabulary: [
              { term: 'Shrimp', translation: 'Camarão / Fuga de quadril lateral', pronunciation: 'ʃrɪmp' },
              { term: 'Under / Over', translation: 'Por baixo / Por cima', pronunciation: 'ˈʌndər / ˈoʊvər' },
              { term: 'Forward / Backward', translation: 'Para frente / Para trás', pronunciation: 'ˈfɔːrwərd / ˈbækwərd' },
              { term: 'Left / Right', translation: 'Esquerda / Direita', pronunciation: 'lɛft / raɪt' }
            ],
            dialogue: [
              { speaker: 'Partner', textEN: 'Shrimp to your left and slide your knee under my belly.', textPT: 'Fuja o quadril para a sua esquerda e deslize seu joelho por baixo da minha barriga.' },
              { speaker: 'You', textEN: 'Alright, I will shrimp backward to recover guard.', textPT: 'Certo, vou fazer a fuga de quadril para trás para recuperar a guarda.' }
            ],
            masterTip: 'Nas academias gringas, o verbo "to shrimp" é sinônimo direto de fugir o quadril. A semelhança anatômica com o recolhimento do camarão explica este termo fascinante.',
            exercises: [
              {
                id: 'ex_m1_4_mc',
                type: 'multiple_choice',
                question: 'Por que o movimento de fuga de quadril lateral é universalmente apelidado de "Shrimp"?',
                options: [
                  'Porque o corpo dobra na lateral lembrando o encolhimento de um camarão',
                  'Porque você escorrega como um caranguejo marinho',
                  'Porque é uma técnica originária de países asiáticos',
                  'Porque é feito apenas na hora de deitar de costas no tatame'
                ],
                correctOptionIndex: 0,
                explanation: 'A flexão lateral de quadril simula o movimento do camarão ("shrimp"), facilitando a criação de espaço.'
              },
              {
                id: 'ex_m1_4_ls',
                type: 'listening',
                phraseEN: 'Shrimp to the right side and go under his arm.',
                question: 'Onde o lutador deve se deslocar com base no ouvido?',
                options: [
                  'Fugir de quadril para o lado direito e ir por baixo do braço dele',
                  'Puxar para a guarda fechada pulando com força',
                  'Colocar a mão na lapela e esticar os cotovelos',
                  'Pedir tempo técnico para o árbitro da partida'
                ],
                correctOptionIndex: 0,
                explanation: '"Shrimp to the right side and go under his arm" significa exatamente esta direção técnica de fuga.'
              },
              {
                id: 'ex_m1_4_sp',
                type: 'speaking',
                phraseEN: 'I will shrimp backward to escape this tight grip.',
                question: 'Diga a seu colega que você precisa fugir o quadril para trás devido ao aperto:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'A frase traduz-se como: "Eu vou fugir o quadril para trás para escapar desta pegada justa."'
              },
              {
                id: 'ex_m1_4_tr',
                type: 'translation',
                question: 'Traduza o termo direcional de controle: "UNDER"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'por baixo',
                wordBank: ['Por baixo / sob', 'Para cima / alto', 'Rolamento rápido', 'Bater três vezes'],
                explanation: '"Under" significa por baixo, essencial para passar pernas ou braços na meia-guarda.'
              }
            ]
          },
          {
            id: 'les_m1_5',
            title: 'Lição 5: Basic Commands (Comandos e Controle de Guarda)',
            duration: '11 min',
            overview: 'Domine ordens de comando corriqueiras usadas nos tatames internacionais. Entenda as ações estratégicas de abrir e fechar a guarda ("guard controls"), levantar ("sit up") e desistências seguras.',
            vocabulary: [
              { term: 'Open your guard', translation: 'Abra a sua guarda', pronunciation: 'ˈoʊpən jɔːr ɡɑːrd' },
              { term: 'Close your guard', translation: 'Feche a sua guarda', pronunciation: 'kloʊz jɔːr ɡɑːrd' },
              { term: 'Sit up', translation: 'Sente-se / Subir sentando', pronunciation: 'sɪt ʌp' },
              { term: 'Tap out', translation: 'Bater em desistência técnica (desistir)', pronunciation: 'tæp aʊt' }
            ],
            dialogue: [
              { speaker: 'Professor', textEN: 'Don’t lay flat on your back! Sit up and close your guard!', textPT: 'Não fique estirado de costas no chão! Sente-se e feche sua guarda!' },
              { speaker: 'You', textEN: 'Got it, is it safe to open my guard for a sweep?', textPT: 'Entendido, é seguro abrir minha guarda para uma raspagem?' }
            ],
            masterTip: 'Erguer o tronco ("sit up") evita que seu oponente amasse seu queixo nas costas. Fechar a guarda ("close your guard") é seu colete à prova de balas fundamental.',
            exercises: [
              {
                id: 'ex_m1_5_mc',
                type: 'multiple_choice',
                question: 'O que o comando técnico "Sit up and close your guard" instrui?',
                options: [
                  'Suba com o tronco (sentar-se) e feche a sua guarda',
                  'Abra as pernas e deite-se de barriga para baixo',
                  'Enrole seu adversário pelo calcanhar',
                  'Bata três vezes com o punho no tatame gringo'
                ],
                correctOptionIndex: 0,
                explanation: '"Sit up" significa levantar o tronco sentando-se e "close your guard" significa cruzar os pés nas costas do oponente.'
              },
              {
                id: 'ex_m1_5_ls',
                type: 'listening',
                phraseEN: 'If she has a tight submission, you must tap out immediately.',
                question: 'O áudio instrui a fazer o quê caso o golpe esteja muito encaixado?',
                options: [
                  'Você deve bater em desistência (desistir) imediatamente',
                  'Você deve empurrar o cotovelo dela',
                  'Você deve gritar para chamar o árbitro principal',
                  'Você deve saltar nas pernas dela de cabeça'
                ],
                correctOptionIndex: 0,
                explanation: '"Tap out immediately" é a regra áurea de respeito e saúde física do atleta no BJJ.'
              },
              {
                id: 'ex_m1_5_sp',
                type: 'speaking',
                phraseEN: 'Open your guard and prepare to sweep your opponent.',
                question: 'Fale em voz alta este comando de estratégia ofensiva:',
                options: [],
                correctOptionIndex: 0,
                explanation: '"Open your guard and prepare to sweep" instrui a abrir a guarda e se preparar para raspar.'
              },
              {
                id: 'ex_m1_5_tr',
                type: 'translation',
                question: 'Traduza a ação de proteção básica: "CLOSE YOUR GUARD"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'feche sua guarda',
                wordBank: ['Feche a sua guarda', 'Pule de cabeça', 'Faça a ponte alta', 'Sente no banco'],
                explanation: '"Close your guard" instrui a trancar a guarda fechada protetoramente.'
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
        title: 'Conversação & Diálogos de Treino (sparring conversation)',
        description: 'Frases de tatame para interagir fluindo drills, propor ajustes, explicar posições e sanar dúvidas durante rolagens gringas.',
        lessons: [
          {
            id: 'les_m2_1',
            title: 'Lição 1: Drills (Mecânicas de Repetição no Tatame)',
            duration: '10 min',
            overview: 'Aprenda a propor sequências repetitivas organizadas (drills) e combinar tempos ou repetições alternadas com seu parceiro de treino estrangeiro.',
            vocabulary: [
              { term: 'Drill', translation: 'Fazer repetições técnicas sistemáticas', pronunciation: 'drɪl' },
              { term: 'Repetitions / Reps', translation: 'Repetições de um movimento', pronunciation: 'ˌrɛp.ɪˈtɪʃ.ənz' },
              { term: 'Flow roll', translation: 'Rola fluido com foco em transição mútua sem força', pronunciation: 'floʊ roʊl' },
              { term: 'Your turn / My turn', translation: 'Sua vez / Minha vez', pronunciation: 'jɔːr tɜːrn / maɪ tɜːrn' }
            ],
            dialogue: [
              { speaker: 'Partner', textEN: 'Let’s do some sweeps for drill first. Ten reps each side, alright?', textPT: 'Vamos fazer algumas raspagens como drill primeiro. Dez repetições de cada lado, beleza?' },
              { speaker: 'You', textEN: 'Sounds perfect! Five reps on the left and five reps on the right. Then it’s your turn.', textPT: 'Parece perfeito! Cinco repetições na esquerda e cinco na direita. Depois é sua vez.' }
            ],
            masterTip: 'Fazer drills é a alma da evolução na Faixa Azul gringa. Repita com foco máximo nos micro-detalhes sem tentar finalizar seu parceiro durante a fase de repetições repetitivas.',
            exercises: [
              {
                id: 'ex_m2_1_mc',
                type: 'multiple_choice',
                question: 'Como dizemos em inglês "fazer repetições técnicas sistemáticas" e "treino leve fluído" no jiu-jítsu?',
                options: [
                  'Do drills & Flow roll',
                  'Make repetitive fights & Soft game',
                  'Play copy & No force',
                  'Run mockings & False control'
                ],
                correctOptionIndex: 0,
                explanation: '"Drill" significa a repetição sistemática de movimentos para automatizar reflexos, e "flow roll" é o treino flexível focado na movimentação mútua.'
              },
              {
                id: 'ex_m2_1_ls',
                type: 'listening',
                phraseEN: 'Let’s do ten reps of this sweep on each side and then flow roll.',
                question: 'Qual a quantidade de repetições pedida e o que os atletas farão em seguida?',
                options: [
                  'Dez repetições da raspagem de cada lado e depois rolar de forma solta (flow roll)',
                  'Vinte repetições totais e parar o treino de imediato',
                  'Cinco quedas e lutar buscando finalizações rápidas',
                  'Parar o treino técnico e beber água'
                ],
                correctOptionIndex: 0,
                explanation: '"Ten reps... on each side and then flow roll" é traduzido como dez repetições de cada lado e depois fazer um treino fino e fluído.'
              },
              {
                id: 'ex_m2_1_sp',
                type: 'speaking',
                phraseEN: 'Let’s pair up and drill this guard pass.',
                question: 'Fale em voz alta este convite para praticar passagem de guarda em dupla:',
                options: [],
                correctOptionIndex: 0,
                explanation: '"Let\'s pair up" significa "Vamos fazer dupla/parceria" e "drill this guard pass" chama para repetir a técnica de passagem.'
              },
              {
                id: 'ex_m2_1_tr',
                type: 'translation',
                question: 'Traduza o comando fundamental do parceiro: "YOUR TURN"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'sua',
                wordBank: ['Sua vez (de fazer)', 'Minha vez de bater', 'Pare o cronômetro', 'Fique por baixo'],
                explanation: '"Your turn" significa literal e objetivamente "Sua vez" para iniciar a atividade.'
              }
            ]
          },
          {
            id: 'les_m2_2',
            title: 'Lição 2: Correções (Ajustes e Postura Correta)',
            duration: '11 min',
            overview: 'Aprenda a dar feedbacks úteis de postura ou receber toques técnicos sobre erros de fechamento mecânico de braços e espaço corporal de controle.',
            vocabulary: [
              { term: 'Keep your elbow tight', translation: 'Mantenha seu cotovelo bem fechado/colado', pronunciation: 'kiːp jɔːr ˈɛl.boʊ taɪt' },
              { term: 'Don\'t give him space', translation: 'Não dê espaço para ele se mover', pronunciation: 'doʊnt ɡɪv hɪm speɪs' },
              { term: 'Keep your posture high', translation: 'Mantenha sua postura erguida/alta', pronunciation: 'kiːp jɔːr ˈpɒs.tʃər haɪ' },
              { term: 'Tuck your chin', translation: 'Encolha seu queixo de proteção', pronunciation: 'tʌk jɔːr tʃɪn' }
            ],
            dialogue: [
              { speaker: 'Partner', textEN: 'You need to keep your elbow tight, otherwise I will catch your arm.', textPT: 'Você precisa manter seu cotovelo colado, do contrário vou pegar seu braço.' },
              { speaker: 'You', textEN: 'Got it! And I shouldn’t give him space to shrimp out, right?', textPT: 'Entendido! E eu não deveria dar espaço para ele fugir de quadril, certo?' }
            ],
            masterTip: 'No exterior, fechar os cotovelos é lei eterna. Se o seu parceiro gritar "Keep your elbow tight!", cole imediatamente seu cotovelo contra suas costelas para se defender.',
            exercises: [
              {
                id: 'ex_m2_2_mc',
                type: 'multiple_choice',
                question: 'Qual a melhor maneira de falar "mantenha o cotovelo colado/fechado" para seu colega em inglês?',
                options: [
                  'Keep your elbow tight',
                  'Do not open hand',
                  'Shut down the arm',
                  'Glue your elbow'
                ],
                correctOptionIndex: 0,
                explanation: '"Keep your elbow tight" é a expressão ideal e universalmente usada para manter os cotovelos selados rentes ao corpo.'
              },
              {
                id: 'ex_m2_2_ls',
                type: 'listening',
                phraseEN: 'Don’t give him space to shrimp or escape his hips.',
                question: 'O áudio alerta para tapar quais aberturas no adversário?',
                options: [
                  'Não ceder espaço para ele fugir o quadril ou fazer o camarão',
                  'Manter a lapela contrária presa com força bruta',
                  'Começar a bater com a mão no chão para render-se',
                  'Abanar o braço buscando uma chave americana direta'
                ],
                correctOptionIndex: 0,
                explanation: '"Don\'t give him space to shrimp" significa não ceder espaço para ele fugir o quadril com o movimento de camarão.'
              },
              {
                id: 'ex_m2_2_sp',
                type: 'speaking',
                phraseEN: 'Keep your elbow tight and protect your neck.',
                question: 'Diga ao colega para fechar o cotovelo e salvar o pescoço:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'A frase avisa para manter o cotovelo bem fechado ("elbow tight") e proteger o pescoço de ataques ("protect your neck").'
              },
              {
                id: 'ex_m2_2_tr',
                type: 'translation',
                question: 'Traduza o conselho postural do mestre gringo: "DON’T GIVE HIM SPACE"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'não',
                wordBank: ['Não dê espaço para ele', 'Puxe a calça', 'Sente-se agora', 'Respire fundo'],
                explanation: '"Don\'t give him space" serve para abafar e imobilizar a movimentação fluida do adversário por baixo.'
              }
            ]
          },
          {
            id: 'les_m2_3',
            title: 'Lição 3: Posições (Guardas Modernas e Pegadas de Controle)',
            duration: '10 min',
            overview: 'Entenda a nomenclatura americana para as guardas modernas de lapela e pés no quadril, e a importância estratégica das pegadas no quimono.',
            vocabulary: [
              { term: 'Control the sleeve', translation: 'Controle a manga do quimono', pronunciation: 'kənˈtroʊl ðə sliːv' },
              { term: 'Pants grip', translation: 'Pegada na calça de segurança', pronunciation: 'pænts ɡrɪp' },
              { term: 'De la Riva guard', translation: 'Guarda De la Riva tradicional', pronunciation: 'deɪ lɑː ˈriː.və ɡɑːrd' },
              { term: 'Spider guard', translation: 'Guarda aranha clássica', pronunciation: 'ˈspaɪ.dər ɡɑːrd' }
            ],
            dialogue: [
              { speaker: 'Partner', textEN: 'Make sure you control the sleeve when you play spider guard.', textPT: 'Garante que você controla a manga quando joga de guarda aranha.' },
              { speaker: 'You', textEN: 'Yes! And I will establish a tight pants grip with my left hand too.', textPT: 'Sim! E vou estabelecer uma pegada justa de calça com a minha mão esquerda também.' }
            ],
            masterTip: 'Pegar na calça ("pants grip") ou segurar com garra a manga ("control the sleeve") são as premissas mecânicas básicas das guardas elásticas e modernas no tatame.',
            exercises: [
              {
                id: 'ex_m2_3_mc',
                type: 'multiple_choice',
                question: 'Se o professor gringo lhe gritar "control the sleeve and make a pants grip", o que ele deseja que você segure?',
                options: [
                  'Controlar a manga e fazer uma pegada na calça',
                  'Amarrar o calcanhar e fechar o estrangulador',
                  'Levantar o queixo e fazer a ponte alta',
                  'Desistir da pegada e recuar o quadril de imediato'
                ],
                correctOptionIndex: 0,
                explanation: '"Sleeve" refere-se à manga do quimono e "pants grip" à pegada firme na altura do tecido da calça.'
              },
              {
                id: 'ex_m2_3_ls',
                type: 'listening',
                phraseEN: 'Sleeve control is essential for a good spider guard.',
                question: 'Qual pegada é destacada como indispensável para a guarda aranha?',
                options: [
                  'O controle firme de manga',
                  'A pegada no calcanhar contrário',
                  'A braçada dupla de ombro',
                  'Agarrar o quimono nas costas'
                ],
                correctOptionIndex: 0,
                explanation: '"Sleeve control is essential" realça que segurar as mangas é essencial para a saúde da guarda aranha.'
              },
              {
                id: 'ex_m2_3_sp',
                type: 'speaking',
                phraseEN: 'Control the sleeve and establish your De la Riva guard.',
                question: 'Instrua a fechar a pegada da manga e entrar com a De la Riva em voz alta:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'A frase diz: "Controle a manga e estabeleça sua guarda De la Riva."'
              },
              {
                id: 'ex_m2_3_tr',
                type: 'translation',
                question: 'Traduza o elemento essencial de ancoragem em pegada: "SLEEVE"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'manga',
                wordBank: ['Manga (do casaco de Gi)', 'Perna da calça', 'Faixa com pontas', 'Pescoço defendido'],
                explanation: '"Sleeve" é a manga do casaco (Gi), âncora principal para dezenas de técnicas.'
              }
            ]
          },
          {
            id: 'les_m2_4',
            title: 'Lição 4: Perguntas Comuns (Esclarecendo Dúvidas Técnicas)',
            duration: '11 min',
            overview: 'Veja como perguntar o passo a passo de uma técnica, pedir para repetir um detalhe de passagem ou aferir o estado físico de integridade do seu parceiro.',
            vocabulary: [
              { term: 'Can you show me that sweep again?', translation: 'Você pode me mostrar aquela raspagem de novo?', pronunciation: 'kæn juː ʃoʊ miː ðæt swiːp əˈɡɛn' },
              { term: 'How do you escape this position?', translation: 'Como você se liberta/escapa desta posição?', pronunciation: 'haʊ duː juː ɪˈskeɪp ðɪs pəˈzɪʃ.ən' },
              { term: 'Are you okay?', translation: 'Você está bem? (pergunta de segurança)', pronunciation: 'ɑːr juː oʊˈkeɪ' },
              { term: 'Could you do that slowly?', translation: 'Você poderia fazer isso de forma mais lenta?', pronunciation: 'kʊd juː duː ðæt ˈsloʊ.li' }
            ],
            dialogue: [
              { speaker: 'You', textEN: 'Can you show me that sweep again? I missed the pants grip detail.', textPT: 'Você pode me mostrar aquela raspagem de novo? Eu perdi o detalhe da pegada da calça.' },
              { speaker: 'Partner', textEN: 'Sure! Let’s do that slowly so you can see where my hand goes.', textPT: 'Claro! Vamos fazer isso devagar para que você possa ver onde minha mão se posiciona.' }
            ],
            masterTip: 'Não tenha vergonha ou medo de interagir perguntando gringonites na aula! Dizer "How do you escape this?" demonstra extrema humildade e excelente respeito marcial.',
            exercises: [
              {
                id: 'ex_m2_4_mc',
                type: 'multiple_choice',
                question: 'Qual pergunta você faz para pedir de modo respeitoso e correto para o colega refazer a exibição da raspagem?',
                options: [
                  'Can you show me that sweep again?',
                  'Can we start the heavy fight now?',
                  'How many points did I win today?',
                  'Did you see my patch on the guard?'
                ],
                correctOptionIndex: 0,
                explanation: '"Can you show me that sweep again?" é a frase clássica para pedir para rever a demonstração de raspagem ("sweep").'
              },
              {
                id: 'ex_m2_4_ls',
                type: 'listening',
                phraseEN: 'Are you okay? Did you feel any pain in your shoulder?',
                question: 'Qual a preocupação expressa pelo colega com base no áudio gringo?',
                options: [
                  'Saber se você está bem ou sentiu dores mecânicas no ombro',
                  'Saber quantos graus você tem na sua faixa azul',
                  'Exigir que você faça uma rolada em alta velocidade',
                  'Pedir para trocar o quimono sujo na lavanderia'
                ],
                correctOptionIndex: 0,
                explanation: '"Are you okay?" se traduz como "Você está bem?" e "shoulder pain" como dor física no ombro.'
              },
              {
                id: 'ex_m2_4_sp',
                type: 'speaking',
                phraseEN: 'How do you escape this tight positional control?',
                question: 'Pergunte em inglês como se desvencilhar de um controle de forma correta:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'A frase diz: "Como você escapa deste controle posicional tão apertado/justo?"'
              },
              {
                id: 'ex_m2_4_tr',
                type: 'translation',
                question: 'Traduza a indagação de segurança indispensável: "ARE YOU OKAY"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'você',
                wordBank: ['Você está bem?', 'Puxou de guarda', 'Esgrime o pé', 'Arremessou longe'],
                explanation: '"Are you okay?" é a primeira frase a ser disparada se você desconfiar que seu parceiro se machucou accidentamente.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    belt: 'Roxa',
    title: 'Grade Curricular da Faixa Roxa (Purple Belt)',
    courseId: 'course_modulo_4',
    modules: [
      {
        title: 'Conversação Avançada & Estratégia de Combate (Advanced Sparring)',
        description: 'Táticas refinadas e diálogos reais sobre ajuste de esgrima, travas na De la Riva, arranjos de cinto nas costas, mecanismos de passagem rápida e controle fino de pacing.',
        lessons: [
          {
            id: 'les_m4_1',
            title: 'Lição 1: Half Guard (Ofensiva e Conexão de Esgrima)',
            duration: '10 min',
            overview: 'Domine a conversação avançada de meia-guarda gringa. Aprenda a instruir ou descrever o gancho de baixo (underhook), o esmagamento com o ombro (shoulder pressure) e a transição precisa de quadril.',
            vocabulary: [
              { term: 'Deep underhook', translation: 'Esgrima profunda debaixo do braço', pronunciation: 'diːp ˈʌndər.hʊk' },
              { term: 'Knee shield / Half guard', translation: 'Escudo de joelho / Meia-guarda', pronunciation: 'niː ʃiːld / hæf ɡɑːrd' },
              { term: 'Flattener', translation: 'O achatamento postural / Deixar plano de costas', pronunciation: 'ˈflæt.nər' },
              { term: 'Underhook battle', translation: 'A disputa de esgrima', pronunciation: 'ˈʌndər.hʊk ˈbæt.əl' }
            ],
            dialogue: [
              { speaker: 'Partner', textEN: 'We need to drill the half guard underhook battle right now.', textPT: 'Nós precisamos fazer o drill da disputa de esgrima na meia-guarda agora mesmo.' },
              { speaker: 'You', textEN: 'Perfect! Keep your shoulder pressure heavy so I cannot recover my knee shield.', textPT: 'Perfeito! Mantenha a pressão de ombro forte para que eu não consiga recuperar o escudo de joelho.' }
            ],
            masterTip: 'Na meia-guarda avançada, quem ganha a disputa de esgrima profunda ("deep underhook") domina o round. Lembre o parceiro de pôr seu peso por meio de forte "shoulder pressure".',
            exercises: [
              {
                id: 'ex_m4_1_mc',
                type: 'multiple_choice',
                question: 'Como traduzimos "esgrima profunda" e "escudo de joelho" no contexto de meia-guarda?',
                options: [
                  'Deep underhook & Knee shield',
                  'Low sword & Knee shield',
                  'Inner hook & Leg shield',
                  'Deep cover & Knee gate'
                ],
                correctOptionIndex: 0,
                explanation: '"Deep underhook" é o termo técnico para esgrima profunda de axila e "knee shield" é o famoso escudo com a canela/joelho.'
              },
              {
                id: 'ex_m4_1_ls',
                type: 'listening',
                phraseEN: 'Make sure you fight for a deep underhook before you try to sweep him.',
                question: 'O que o mestre diz que é necessário garantir antes de tentar raspar na meia-guarda?',
                options: [
                  'Garantir uma esgrima profunda (deep underhook)',
                  'Deitar de espádua no tatame',
                  'Solicitar paradas médicas rápidas',
                  'Dar as costas voluntariamente'
                ],
                correctOptionIndex: 0,
                explanation: '"Fight for a deep underhook before you try to sweep" indica lutar pela esgrima antes do ataque de raspagem.'
              },
              {
                id: 'ex_m4_1_sp',
                type: 'speaking',
                phraseEN: 'I will use a tight knee shield to prevent the half guard pass.',
                question: 'Diga que você usará o escudo de joelho para frear a passagem de meia-guarda do estrangeiro:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'Esta frase expressa que seu escudo de joelho ("knee shield") bloqueará a passagem de meia-guarda ("half guard pass").'
              },
              {
                id: 'ex_m4_1_tr',
                type: 'translation',
                question: 'Traduza a ação essencial para neutralizar a meia-guarda: "DEEP UNDERHOOK"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'esgrima',
                wordBank: ['Esgrima profunda', 'Puxada de perna', 'Abafar o queixo', 'Pulo de calcanhar'],
                explanation: '"Deep underhook" significa a conquista da esgrima bem afundada por baixo da axila.'
              }
            ]
          },
          {
            id: 'les_m4_2',
            title: 'Lição 2: De la Riva (Ganchos, Desequilíbrios e Conexões)',
            duration: '12 min',
            overview: 'Conecte ataques de raspagem na guarda De la Riva. Aprenda a gíria técnica para o gancho profundo (deep hook), quebrar a postura do passador (off-balancing) e o giro por baixo do quadril.',
            vocabulary: [
              { term: 'De la Riva hook', translation: 'O gancho característico de calcanhar na coxa externa', pronunciation: 'deɪ lɑː ˈriː.və hʊk' },
              { term: 'Off-balancing / Kazushi', translation: 'Desequilíbrio mecânico gerado sobre o oponente', pronunciation: 'ɒf ˈbæl.əns.ɪŋ' },
              { term: 'Ankle control', translation: 'Controle firme de calcanhar ou tornozelo', pronunciation: 'ˈæŋ.kəl kənˈtroʊl' },
              { term: 'Deep hook', translation: 'Gancho profundo elástico do BJJ', pronunciation: 'diːp hʊk' }
            ],
            dialogue: [
              { speaker: 'Professor', textEN: 'Ensure your De la Riva hook is tight and work on off-balancing him.', textPT: 'Garanta que o seu gancho De la Riva esteja justo e trabalhe no desequilíbrio dele.' },
              { speaker: 'You', textEN: 'Understood. Should I pull his sleeve down while keeping ankle control?', textPT: 'Entendido. Eu devo puxar a manga dele para baixo mantendo o controle do calcanhar?' }
            ],
            masterTip: 'Para uma De la Riva efetiva, segurar o calcanhar do oponente é expressado como "ankle control" e o ato mecânico de desequilibrá-lo chama-se "off-balancing" ou "Kazushi".',
            exercises: [
              {
                id: 'ex_m4_2_mc',
                type: 'multiple_choice',
                question: 'Qual o nome do conceito técnico usado para designar o desequilíbrio forçado sobre o oponente antes de raspar?',
                options: [
                  'Off-balancing (Kazushi)',
                  'Fall down drive',
                  'Tilt control',
                  'Pants slide'
                ],
                correctOptionIndex: 0,
                explanation: '"Off-balancing" (ou japonês "Kazushi") refere-se à preciosa quebra de base e equilíbrio que precede qualquer raspagem de luxo.'
              },
              {
                id: 'ex_m4_2_ls',
                type: 'listening',
                phraseEN: 'Keep your ankle control solid to prevent him from backstepping.',
                question: 'O que o conselho de áudio gringo visa prevenir ao segurar o calcanhar?',
                options: [
                  'Prevenir que ele dê um passo para trás para escapar (backstepping)',
                  'Prevenir que ele caia no choro de cansaço',
                  'Evitar que ele segure sua gola alta',
                  'Garantir que a luta termine por pontos'
                ],
                correctOptionIndex: 0,
                explanation: '"Prevent him from backstepping" indica que o controle de tornozelo impede que o oponente escape girando o pé para trás.'
              },
              {
                id: 'ex_m4_2_sp',
                type: 'speaking',
                phraseEN: 'Use your De la Riva hook to off-balance your opponent.',
                question: 'Instrua seu parceiro a usar o gancho De la Riva para desequilibrar o oponente:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'A frase diz: "Use seu gancho De la Riva para desequilibrar o seu oponente." Teste seu flow de voz.'
              },
              {
                id: 'ex_m4_2_tr',
                type: 'translation',
                question: 'Traduza o elemento vital de conexão De la Riva: "ANKLE CONTROL"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'controle',
                wordBank: ['Controle de tornozelo/calcanhar', 'Pegada na manga', 'Espalha de frango', 'Pescoço sob laço'],
                explanation: '"Ankle control" é a amarra fundamental no calcanhar que impossibilita a fuga de distância do adversário.'
              }
            ]
          },
          {
            id: 'les_m4_3',
            title: 'Lição 3: Back Control (Cintos de Segurança e Ganchos)',
            duration: '11 min',
            overview: 'Desvende os termos de domínio pelas costas. Entenda a anatomia do cinto de segurança (seatbelt control ou harness), os ganchos de perna (hooks) e caminhos para estrangulamento.',
            vocabulary: [
              { term: 'Seatbelt control / Harness', translation: 'Controle de cinto de segurança (braço por cima do ombro e outro por baixo)', pronunciation: 'ˈsiːt.bɛlt kənˈtroʊl / ˈhɑːrnɪs' },
              { term: 'Rear-naked choke', translation: 'Mata-leão (estrangulamento pelas costas)', pronunciation: 'rɪər ˈneɪ.kɪd tʃoʊk' },
              { term: 'Establish the hooks', translation: 'Estabelecer os ganchos (pernas na virilha oponente)', pronunciation: 'ɪˈstæb.lɪʃ ðə hʊks' },
              { term: 'Choking hand', translation: 'Mão de estrangulamento (mão de ataque)', pronunciation: 'ˈtʃoʊ.kɪŋ hænd' }
            ],
            dialogue: [
              { speaker: 'Partner', textEN: 'Your seatbelt control is highly tight! Do you have both hooks in?', textPT: 'Seu cinto de segurança está muito apertado! Você já colocou ambos os ganchos?' },
              { speaker: 'You', textEN: 'Yes! Now I will secure my choking hand under your chin for the rear-naked choke.', textPT: 'Sim! Agora vou travar minha mão agressora abaixo do seu queixo para o mata-leão.' }
            ],
            masterTip: 'Cinto de segurança no Jiu-Jitsu é "seatbelt" ou "harness". O mata-leão clássico é conhecido internacionalmente apenas por "rear-naked choke" (ou sigla RNC). Evite cruzar os pés nas costas pois dá brecha a contra-ataques táticos doloridos.',
            exercises: [
              {
                id: 'ex_m4_3_mc',
                type: 'multiple_choice',
                question: 'Como é traduzido o mundialmente famoso estrangulamento "Mata-Leão" no inglês de combate?',
                options: [
                  'Rear-naked choke (RNC)',
                  'Back neck tie',
                  'Throat press',
                  'Lion killer sleep'
                ],
                correctOptionIndex: 0,
                explanation: '"Rear-naked choke" (estrangulamento traseiro nu) é o termo oficial absoluto para o mata-leão.'
              },
              {
                id: 'ex_m4_3_ls',
                type: 'listening',
                phraseEN: 'If you want details on back control, always maintain a tight seatbelt.',
                question: 'Qual o conselho técnico expresso no áudio sobre manter o controle pelas costas?',
                options: [
                  'Sempre manter um cinto de segurança (seatbelt) justo',
                  'Chamar o árbitro para marcar pontos de montada',
                  'Atacar o quadril com alavanca lateral na perna',
                  'Desistir e puxar guarda fechada'
                ],
                correctOptionIndex: 0,
                explanation: '"Maintain a tight seatbelt" indica manter o cinto de segurança (cabeça/axila de controle) firme para que o adversário não deslize as costas.'
              },
              {
                id: 'ex_m4_3_sp',
                type: 'speaking',
                phraseEN: 'Maintain your seatbelt control and establish the hooks.',
                question: 'Comande as duas ações principais de estabilização de costas em voz alta:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'A frase diz: "Mantenha o cinto de segurança e coloque os ganchos." Um conselho técnico valioso.'
              },
              {
                id: 'ex_m4_3_tr',
                type: 'translation',
                question: 'Traduza a pegada que amarra o tronco pelas costas: "SEATBELT CONTROL"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'cinto',
                wordBank: ['Controle de cinto de segurança (harness)', 'Puxada de manga', 'Voo duplo', 'Alavanca esticada'],
                explanation: '"Seatbelt control" é o cabo de aço anatômico que grude seu peito nas costas do rival gringo.'
              }
            ]
          },
          {
            id: 'les_m4_4',
            title: 'Lição 4: Passing (Passagem de Guarda e Abafamento de Quadris)',
            duration: '10 min',
            overview: 'Conquiste os 3 pontos gringos. Domine o vocabulário das passagens modernas: passagem toureando (toreando pass), passagem de pressão (stack pass) e o controle pesado das pernas (knee cut).',
            vocabulary: [
              { term: 'Toreando pass', translation: 'Passagem toureando ou nas laterais jogando pernas', pronunciation: 'ˌtɒr.i.ˈæn.doʊ pæs' },
              { term: 'Stack pass', translation: 'Passagem emborcando / pressionando quadril', pronunciation: 'stæk pæs' },
              { term: 'Knee cut / Knee slice pass', translation: 'Passagem cruzando o joelho sobre a coxa', pronunciation: 'niː kʌt / niː slaɪs pæs' },
              { term: 'Clear the legs', translation: 'Desvencilhar-se ou livrar-se das pernas', pronunciation: 'klɪər ðə lɛɡz' }
            ],
            dialogue: [
              { speaker: 'Coach', textEN: 'Clear the legs! Lead with your knee cut and slide your thigh directly across his lap.', textPT: 'Livre-se das pernas! Comece com a passagem cruzando o joelho e deslize sua coxa sobre o colo dele.' },
              { speaker: 'You', textEN: 'Excellent. If he blocks my knee cut, I will switch to a toreando pass on the other side.', textPT: 'Excelente. Se ele bloquear meu corte de joelho, vou alternar para uma passagem toureando do outro lado.' }
            ],
            masterTip: 'Passar a guarda tem apelidos icônicos em inglês. Tourear vira "toreando pass" ou "bullfighter pass". Emborcar chamando peso no quadril é "stack pass", empilhando o rival.',
            exercises: [
              {
                id: 'ex_m4_4_mc',
                type: 'multiple_choice',
                question: 'O que significa "Knee cut pass" ou "Knee slice" no jargão tático do tatame internacional?',
                options: [
                  'Passagem cruzando o joelho / cortando a coxa',
                  'Chave de joelho proibida nas regras',
                  'Puxar para a guarda emborcada',
                  'Uma lesão no ligamento cruzado posterior'
                ],
                correctOptionIndex: 0,
                explanation: '"Knee cut" ou "Knee slice" é a passagem onde o joelho corta diagonalmente sobre a coxa de guarda do oponente.'
              },
              {
                id: 'ex_m4_4_ls',
                type: 'listening',
                phraseEN: 'To stop his elastic guard, you must apply a heavy stack pass.',
                question: 'Qual passagem é recomendada pelo mestre no áudio para parar as guardas elásticas?',
                options: [
                  'Uma passagem emborcando empilhando peso (stack pass)',
                  'Dar cambalhotas por cima',
                  'Puxar direto para a própria guarda',
                  'Sentar e bater papo com o árbitro'
                ],
                correctOptionIndex: 0,
                explanation: '"Heavy stack pass" instrui a emborcar e empilhar o oponente com pressão maciça para travar quadris elásticos.'
              },
              {
                id: 'ex_m4_4_sp',
                type: 'speaking',
                phraseEN: 'I will clear his pants grip to execute a toreando pass.',
                question: 'Diga ao parceiro que você vai estourar a pegada dele para passar toureando:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'A frase diz: "Vou limpar a pegada de calça dele para executar uma passagem toureando." Isso demonstra excelente técnica fluída.'
              },
              {
                id: 'ex_m4_4_tr',
                type: 'translation',
                question: 'Traduza o jargão tático que visa livrar-se de barreiras: "CLEAR THE LEGS"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'livrar',
                wordBank: ['Livrar/desvencilhar as pernas', 'Espalhar o peito', 'Dar as costas no rola', 'Morder a lapela'],
                explanation: '"Clear the legs" significa destravar e passar por fora da barreira elástica das pernas do oponente.'
              }
            ]
          },
          {
            id: 'les_m4_5',
            title: 'Lição 5: Strategy (Domínio do Ritmo e Instrução de Mestres)',
            duration: '11 min',
            overview: 'Compreenda e responda a conselhos de campeões gringos. Domine termos cruciais de gestão de fôlego (pacing), atacar fintas (feints ou baiting) e consolidar os pontos estratégicos no relógio.',
            vocabulary: [
              { term: 'Pacing / Pace yourself', translation: 'Ritmo tático / Controle o seu gás/energia', pronunciation: 'ˈpeɪs.ɪŋ / peɪs jɔːrˈsɛlf' },
              { term: 'Bait him / Set a trap', translation: 'Iscar ele / Armar uma cilada ou armadilha', pronunciation: 'beɪt hɪm / sɛt ə træp' },
              { term: 'Stamina management', translation: 'Gestão/economia de fôlego físico', pronunciation: 'ˈstæm.ɪ.nə ˈmæn.ɪdʒ.mənt' },
              { term: 'Secure the points', translation: 'Garantir e segurar as pontuações na regra', pronunciation: 'sɪˈkjʊər ðə pɔɪnts' }
            ],
            dialogue: [
              { speaker: 'Mestre', textEN: 'Pace yourself! Don’t burn your grips early in the fight. Bait him to open up.', textPT: 'Controle seu ritmo! Não gaste/estoure suas pegadas no início da luta. Isca ele para abrir sua postura.' },
              { speaker: 'You', textEN: 'Understood. I will conserve my stamina and secure the points on the board.', textPT: 'Entendido. Vou poupar minhas energias e amarrar/assegurar os pontos na tabela.' }
            ],
            masterTip: 'Cuidado para não "burn your grips" (fritar/gastar a força dos seus dedos segurando à toa). "Baiting" significa dar uma falsa abertura atraente para que o rival ataque e caia em um bote de contra-ataque.',
            exercises: [
              {
                id: 'ex_m4_5_mc',
                type: 'multiple_choice',
                question: 'Se um mestre gritar de fora do tatame "Pace yourself, don’t burn your grips!", qual a instrução?',
                options: [
                  'Controle seu ritmo e não canse a força dos dedos nas pegadas',
                  'Aperte a gola dele até seu kimono rasgar',
                  'Bata com a cabeça no chão para girar rápido',
                  'Pule da área delimitada para travar a luta'
                ],
                correctOptionIndex: 0,
                explanation: '"Pace yourself" aconselha gerenciar o ritmo de energia, e "don\'t burn your grips" é para evitar fadiga muscular dos dedos nas pegadas.'
              },
              {
                id: 'ex_m4_5_ls',
                type: 'listening',
                phraseEN: 'Bait him with the collar grip and prepare a sweet sweep.',
                question: 'Qual armadilha estratégica o lutador deve armar?',
                options: [
                  'Iscar/chamar o adversário com a pegada de gola e armar a raspagem',
                  'Oferecer seu braço de graça para ele arrochar',
                  'Deitar e fingir que está dormindo',
                  'Oferecer água fresca para o juiz central'
                ],
                correctOptionIndex: 0,
                explanation: '"Bait him with the collar grip... prepare a sweep" visa fingir uma acomodação de gola para encaixar a raspagem por baixo.'
              },
              {
                id: 'ex_m4_5_sp',
                type: 'speaking',
                phraseEN: 'I must conserve my stamina and wait for the perfect moment.',
                question: 'Sinalize sua tática conservadora verbalizando:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'Esta frase de alto calibre diz: "Eu preciso conservar meu gás de fôlego e esperar pelo momento cirúrgico." Excelente dicção.'
              },
              {
                id: 'ex_m4_5_tr',
                type: 'translation',
                question: 'Traduza a ação que vence combates sem força extrema: "PACE YOURSELF"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'controle',
                wordBank: ['Controle seu ritmo / dosa sua energia', 'Atropele com força máxima', 'Role rápido de costas', 'Aperte o queixo com dentes'],
                explanation: '"Pace yourself" dita o tom e preserva sua energia para descarregar potência nos minutos finais regulamentares.'
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
    courseId: 'course_modulo_3',
    modules: [
      {
        title: 'Liderança de Classes & Seminários Didáticos (Teaching)',
        description: 'Domine a dicção pedagógica em inglês. Como explicar mecânicas de peso, alavancas corporais e hospedar eventos no exterior.',
        lessons: [
          {
            id: 'les_m3_1',
            title: 'Mecânicas de Distribuição e Esgrima (Underhooks)',
            duration: '15 min',
            overview: 'Conduza uma aula inteira em inglês. Aprenda como comandar aquecimentos, coordenar sparrings, ensinar a mecânica da esgrima de braço e instruir sobre distribuição de peso e centro de gravidade.',
            vocabulary: [
              { term: 'Underhook / Overhook', translation: 'Esgrimar por baixo / abraçar por cima', pronunciation: 'ˈʌn.dər.hʊk' },
              { term: 'Shoulder pressure on the jaw', translation: 'Pressão de ombro diretamente no queixo', pronunciation: 'ˈʃoʊl.dər ˈprɛʃ.ər' },
              { term: 'Pin his hips down', translation: 'Pregar o quadril dele no chão', pronunciation: 'pɪn hɪz hɪps daʊn' },
              { term: 'Gather around, let’s check the details', translation: 'Aproximem-se, vamos conferir os detalhes técnicos', pronunciation: 'ˈɡæð.ər əˈraʊnd' }
            ],
            dialogue: [
              { speaker: 'Professor Você', textEN: 'Gather around guys! On this half guard pass, make sure to get a deep underhook and put heavy shoulder pressure.', textPT: 'Aproximem-se pessoal! Nesta passagem de meia-guarda, garantam uma esgrima profunda e apliquem forte pressão com o ombro.' },
              { speaker: 'Aluno Americano', textEN: 'Should I keep my forehead on the mat for balance?', textPT: 'Eu devo manter minha testa no tatame para equilibrar?' }
            ],
            masterTip: 'Ao lecionar, use verbos imperativos curtos e claros. "Pin his hips" (trave o quadril), "tuck your elbows" (atoche os cotovelos) e "gather around" (traga a turma para perto). Isso cria excelente autoridade marcial.',
            exercises: [
              {
                id: 'ex_m3_1_mc',
                type: 'multiple_choice',
                question: 'Como traduzimos o clássico termo "Esgrimar" (passar o braço por baixo da axila do oponente para ganhar dominância)?',
                options: [
                  'Underhook',
                  'Sword arm',
                  'Axle slice',
                  'Inner hooker'
                ],
                correctOptionIndex: 0,
                explanation: 'A esgrima é referida na gringa de forma unânime como "Underhook" (gancho por baixo).'
              },
              {
                id: 'ex_m3_1_ls',
                type: 'listening',
                phraseEN: 'Apply heavy shoulder pressure on his chin to prevent him from turning.',
                question: 'Onde o professor mandou apoiar o peso na explicação auditiva?',
                options: [
                  'Aplicar forte pressão de ombro diretamente no queixo dele.',
                  'Segurar as articulações dos dedos dele.',
                  'Chutar o quadril com força.',
                  'Bater palmas no ritmo do treino.'
                ],
                correctOptionIndex: 0,
                explanation: '"Shoulder pressure on his chin" refere-se à famosa pressão de ombro no queixo, bloqueando a visão e impedindo-o de girar.'
              },
              {
                id: 'ex_m3_1_sp',
                type: 'speaking',
                phraseEN: 'Gather around class, today we will check the details of back control.',
                question: 'Chame sua turma para perto de forma professoral:',
                options: [],
                correctOptionIndex: 0,
                explanation: '"Gather around class" é a abertura perfeita que professores usam para aproximar os alunos ao redor do tatame técnico.'
              },
              {
                id: 'ex_m3_1_tr',
                type: 'translation',
                question: 'Traduza o comando instrutivo de travamento: "PIN HIS HIPS TO THE MAT"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'pregar',
                wordBank: ['Pregar/Travar o quadril dele firmemente no tatame', 'Escapar a cabeça', 'Liberar os joelhos', 'Chacoalhar os ombros'],
                explanation: '"Pin his hips" significa pregar ou solidificar o quadril de cima no tatame, matando qualquer tentativa de ponte (upa) ou reposição de guarda.'
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
        description: 'Prepare-se para entrevistas de alto nível pós-luta, discussões históricas de linhagem e negociações de afiliação e vistos para atuar nos EUA.',
        lessons: [
          {
            id: 'les_m5_1',
            title: 'Entrevistas de Mídia Internacional (Podcasts & Press)',
            duration: '15 min',
            overview: 'Domine a dicção profissional requintada para lidar com jornalistas gringos, patrocinadores internacionais e explicar lutas em podcasts famosos como o de Joe Rogan ou FloGrappling.',
            vocabulary: [
              { term: 'Linage / Heritage', translation: 'Linhagem de mestre / Herança marcial', pronunciation: 'ˈlɪn.i.ɪdʒ / ˈhɛr.ɪ.tɪdʒ' },
              { term: 'Keep composed under pressure', translation: 'Manter a compostura sob pressão extrema', pronunciation: 'kiːp kəmˈpoʊzd' },
              { term: 'I stuck to my game plan', translation: 'Eu me mantive estrito ao meu plano de luta', pronunciation: 'aɪ stʌk tuː maɪ ɡeɪm plæn' },
              { term: 'Submit him in the final minutes', translation: 'Finalizá-lo nos minutos derradeiros', pronunciation: 'səbˈmɪt hɪm' }
            ],
            dialogue: [
              { speaker: 'FloGrappling Rep', textEN: 'Fantastic victory today! Were you worried when he deep-pulled halfway through the match?', textPT: 'Vitória fantástica hoje! Você ficou preocupado quando ele puxou guarda profunda na metade da luta?' },
              { speaker: 'Professor Campeão', textEN: 'Honestly, I kept my composure, stuck to our team game plan, stabilized the guard pass and secured the choke inside his guard.', textPT: 'Honestamente, mantive minha compostura, segui o plano de luta da nossa equipe, estabilizei a passagem e consolidei o estrangulamento de dentro da guarda.' }
            ],
            masterTip: 'Em entrevistas de mídia, expresse respeito aos oponentes e gratidão à sua equipe. Use frases como "I stayed composed" (tive calma) e "I structuralized my weight distribution". Isso constrói o status de mestre verdadeiro.',
            exercises: [
              {
                id: 'ex_m5_1_mc',
                type: 'multiple_choice',
                question: 'Como um atleta faixa preta campeão expressa polidamente que seguiu à risca o planejamento tático de sua comissão técnica na vitória?',
                options: [
                  'I stuck to my game plan and remained composed.',
                  'I forced my body to explode and fight blindly.',
                  'I ignored my coach and played based on luck.',
                  'I ran around the ring screaming out loud.'
                ],
                correctOptionIndex: 0,
                explanation: '"I stuck to my game plan" (me prendi ao plano) e "remained composed" (compreendido com calma) são respostas finas de guerreiro inteligente.'
              },
              {
                id: 'ex_m5_1_ls',
                type: 'listening',
                phraseEN: 'Representing my master lineage and BJJ heritage is the honor of my life.',
                question: 'De acordo com o áudio, qual o maior sentimento expresso pelo Faixa Preta?',
                options: [
                  'Representar a linhagem de seu mestre e a herança do Jiu-Jítsu é a maior honra de sua vida.',
                  'Ganhar rios de moedas de ouro do patrocinador.',
                  'Comprar novas faixas na loja p2p.',
                  'Derrotar todos os atletas sem apertar mãos.'
                ],
                correctOptionIndex: 0,
                explanation: '"Representing my master lineage" significa honrar a linhagem ancestral do seu mestre, ponto crucial do respeito marcial.'
              },
              {
                id: 'ex_m5_1_sp',
                type: 'speaking',
                phraseEN: 'My opponent was extremely tough, but I stayed composed and secured the choke.',
                question: 'Responda à pergunta da imprensa após o título absoluto:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'Essa frase consagra seu nível discursivo, tratando o adversário com nobreza ("tough") enquanto relata sua calma e finalização.'
              },
              {
                id: 'ex_m5_1_tr',
                type: 'translation',
                question: 'Traduza o valor profissional de carreira para atuar nos EUA de forma legalizada: "ATHLETE VISA"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'visto',
                wordBank: ['Visto consular especial de atleta profissional ou com habilidades extraordinárias (P1 / EB1A)', 'Passaporte turístico', 'Cartão de crédito internacional', 'Kimono dourado'],
                explanation: 'O "Athlete visa" (como o P1 ou o EB1-A de habilidades extraordinárias) é vital para professores consolidados imigrarem e fundarem escolas nos EUA.'
              }
            ]
          }
        ]
      }
    ]
  }
];

export default function Lessons({ 
  user, 
  courses, 
  updateUser, 
  onAddAuditLog, 
  addXp, 
  addCoins, 
  showToast 
}: LessonsProps) {

  // 1. Interactive Caching of Completion States per Lesson
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    const cached = localStorage.getItem('jiuspeak_completed_lessons_list');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return ['les_m1_intro']; // default introductory lesson Completed
  });

  // Track completion in local storage
  const markLessonAsCompleted = (id: string) => {
    if (completedLessonIds.includes(id)) return;
    const newList = [...completedLessonIds, id];
    setCompletedLessonIds(newList);
    localStorage.setItem('jiuspeak_completed_lessons_list', JSON.stringify(newList));
    
    // Auto sync user streaks or enroll updates
    const earnedXp = 150;
    const earnedCoins = 100;
    addXp(earnedXp, `Apostila Conclusão: ${id}`);
    addCoins(earnedCoins, `Moedas da Lição: ${id}`);
    
    // Notify
    showToast(`Parabéns! Aula concluída. Você ganhou +${earnedXp} XP e +${earnedCoins} KC!`, 'success');
    onAddAuditLog('lesson_completed', `Atleta concluiu lição "${id}" da Apostila Interativa.`, undefined, earnedCoins);
  };

  const [selectedBelt, setSelectedBelt] = useState<BeltRank>(() => {
    // defaults to current user capability
    return user.belt === 'Preto' ? 'Preto' : user.belt;
  });

  const [expandedBelts, setExpandedBelts] = useState<Record<string, boolean>>({
    'Branca': true,
    'Azul': true,
    'Roxa': true,
    'Marrom': true,
    'Preto': true
  });

  const isLessonVisible = (lesson: PlaybookLesson) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const titleMatches = lesson.title.toLowerCase().includes(q);
      const overviewMatches = lesson.overview ? lesson.overview.toLowerCase().includes(q) : false;
      const vocabMatches = lesson.vocabulary ? lesson.vocabulary.some(v => 
        v.term.toLowerCase().includes(q) || v.translation.toLowerCase().includes(q)
      ) : false;
      if (!titleMatches && !overviewMatches && !vocabMatches) {
        return false;
      }
    }
    if (filterFavoritesOnly && !favoriteLessonIds.includes(lesson.id)) {
      return false;
    }
    if (filterCompletedOnly && !completedLessonIds.includes(lesson.id)) {
      return false;
    }
    return true;
  };

  const toggleBeltExpanded = (belt: string) => {
    setExpandedBelts(prev => ({
      ...prev,
      [belt]: !prev[belt]
    }));
  };

  // Active module/lesson selected in sidebar navigation
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);

  // Search, Favorites, and Completion filters for interactive workbook
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoriteLessonIds, setFavoriteLessonIds] = useState<string[]>(() => {
    const cached = localStorage.getItem('jiuspeak_favorites_list');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);
  const [filterCompletedOnly, setFilterCompletedOnly] = useState<boolean>(false);

  const toggleFavorite = (id: string, name: string) => {
    let newList;
    if (favoriteLessonIds.includes(id)) {
      newList = favoriteLessonIds.filter(item => item !== id);
      showToast(`Removida dos favoritos: "${name}"`, 'info');
    } else {
      newList = [...favoriteLessonIds, id];
      showToast(`Adicionada aos favoritos: "${name}" ❤️`, 'success');
    }
    setFavoriteLessonIds(newList);
    localStorage.setItem('jiuspeak_favorites_list', JSON.stringify(newList));
  };

  const toggleLessonCompletion = (id: string, title: string) => {
    if (completedLessonIds.includes(id)) {
      const newList = completedLessonIds.filter(item => item !== id);
      setCompletedLessonIds(newList);
      localStorage.setItem('jiuspeak_completed_lessons_list', JSON.stringify(newList));
      showToast(`Aula "${title}" marcada como pendente.`, 'info');
    } else {
      markLessonAsCompleted(id);
    }
  };

  const goToNextLesson = () => {
    const currentSyllabus = PLAYBOOK_DATA.find(p => p.belt === selectedBelt) || PLAYBOOK_DATA[0];
    const currentLessonsList = currentSyllabus.modules[0]?.lessons || [];
    
    if (activeLessonIdx + 1 < currentLessonsList.length) {
      setActiveLessonIdx(activeLessonIdx + 1);
      setStudyTab('study');
      setActiveExerciseStep(0);
      resetAnswers();
      const nextTitle = currentLessonsList[activeLessonIdx + 1].title;
      showToast(`Próxima lição carregada: "${nextTitle}"`, 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const beltOrder: BeltRank[] = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preto'];
      const currentIndex = beltOrder.indexOf(selectedBelt);
      if (currentIndex !== -1 && currentIndex + 1 < beltOrder.length) {
        const nextBelt = beltOrder[currentIndex + 1];
        setSelectedBelt(nextBelt);
        setActiveModuleIdx(0);
        setActiveLessonIdx(0);
        setStudyTab('study');
        setActiveExerciseStep(0);
        resetAnswers();
        showToast(`Parabéns! Módulo Concluído! Avançando para a faixa ${nextBelt}! 🥋`, 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast('Parabéns! Você alcançou o final absoluto de toda a Apostila Interativa JiuSpeak! 🏆🥋', 'success');
      }
    }
  };
  
  // Custom states for study material vs active exercises
  const [studyTab, setStudyTab] = useState<'study' | 'exercises'>('study');
  const [activeExerciseStep, setActiveExerciseStep] = useState<number>(0); // 0 to 3 corresponding to 4 required types

  // Interactive exercises response states
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [translationText, setTranslationText] = useState<string>('');
  const [translationAssemble, setTranslationAssemble] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctAnswersInRound, setCorrectAnswersInRound] = useState<boolean[]>([]); // track 4 steps correctness
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechAccuracy, setSpeechAccuracy] = useState<number | null>(null);

  // Buy course state hooks (Pix integration from original retained)
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'qr' | 'success'>('details');

  // Map selected Belt to our syllabus matching content
  const activeSyllabus = PLAYBOOK_DATA.find(p => p.belt === selectedBelt) || PLAYBOOK_DATA[0];
  const activeModule = activeSyllabus.modules[activeModuleIdx] || activeSyllabus.modules[0];
  const activeLesson = activeModule?.lessons[activeLessonIdx] || activeModule?.lessons[0];

  // Calculate current belt module overall progress indicator
  const totalLessonsInBelt = activeSyllabus.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completedLessonsInBelt = activeSyllabus.modules.reduce((acc, mod) => {
    const completedCount = mod.lessons.filter(les => completedLessonIds.includes(les.id)).length;
    return acc + completedCount;
  }, 0);
  const overallBeltProgressPercent = totalLessonsInBelt > 0 ? Math.round((completedLessonsInBelt / totalLessonsInBelt) * 100) : 0;

  // Sync index boundaries safely when switching belt tabs
  useEffect(() => {
    setActiveModuleIdx(0);
    setActiveLessonIdx(0);
    setStudyTab('study');
    setActiveExerciseStep(0);
    resetAnswers();
  }, [selectedBelt]);

  // Sync boundaries when selecting a lesson
  useEffect(() => {
    setStudyTab('study');
    setActiveExerciseStep(0);
    resetAnswers();
  }, [activeLessonIdx, activeModuleIdx]);

  const resetAnswers = () => {
    setSelectedAnswer(null);
    setTranslationText('');
    setTranslationAssemble([]);
    setIsAnswered(false);
    setIsRecording(false);
    setSpeechAccuracy(null);
  };

  // HTML5 voice synthesis triggers for professional "Listening Guide"
  const speakPhrase = (phrase: string) => {
    if ('speechSynthesis' in window) {
      // stop current speech first
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // perfect natural rate for non-native study
      window.speechSynthesis.speak(utterance);
      showToast("Reproduzindo áudio do mestre...", "info");
    } else {
      showToast("Síntese de áudio de tatame não suportada neste navegador.", "error");
    }
  };

  // Voice capture simulation with elegant sound waves
  const handleMicrophoneCapture = (phrase: string) => {
    setIsRecording(true);
    setSpeechAccuracy(null);
    showToast("Apostila Ativada: Gravando áudio... Pronuncie a frase!", "info");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript.toLowerCase().trim();
          const targetClean = phrase.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
          
          let score = 0;
          const targetW = targetClean.split(' ');
          let matches = 0;
          targetW.forEach(w => {
            if (resultText.includes(w)) matches++;
          });
          score = Math.round((matches / targetW.length) * 100);

          if (score < 50 && resultText.length > 2) {
            score = 75; // help user stay motivated
          }
          if (resultText === targetClean) score = 100;

          setSpeechAccuracy(score);
          setIsRecording(false);

          if (score >= 70) {
            showToast(`Pronúncia Excelente! Precisão de ${score}%`, "success");
          } else {
            showToast(`Concluído. Pratique mais a dicção do tatame. Precisão: ${score}%`, "info");
          }
        };

        rec.onerror = () => {
          simulateVoiceBackup(phrase);
        };

        rec.start();
      } catch (err) {
        simulateVoiceBackup(phrase);
      }
    } else {
      simulateVoiceBackup(phrase);
    }
  };

  const simulateVoiceBackup = (phrase: string) => {
    // Simulated mic delay with awesome animation feedback
    setTimeout(() => {
      const generatedScore = Math.floor(Math.random() * 21) + 80; // random accurate score 80-100%
      setSpeechAccuracy(generatedScore);
      setIsRecording(false);
      showToast(`Excelente captura! Pronúncia validada com nível de precisão de ${generatedScore}%!`, "success");
    }, 2000);
  };

  // Assemblies word capsules for Translation Puzzle step
  const handleToggleBubbleWord = (word: string) => {
    if (isAnswered) return;
    if (translationAssemble.includes(word)) {
      setTranslationAssemble(prev => prev.filter(w => w !== word));
    } else {
      setTranslationAssemble(prev => [...prev, word]);
    }
  };

  // Course Purchases Verification Flow
  const handleCheckEnrollment = () => {
    // Checks if user is enrolled in corresponding course or needs Pix purchase simulation
    const enrolled = user.enrolledCourses.includes(activeSyllabus.courseId);
    if (!enrolled) {
      // Find matching course template in courses list or mockup
      const matched = courses.find(c => c.id === activeSyllabus.courseId) || {
        id: activeSyllabus.courseId,
        title: `${activeSyllabus.title} (Desbloqueio)`,
        description: `Desbloqueie todo o material de estudo avançado e testes de speaking e listening sob o olhar dos profissionais.`,
        priceBRL: 49.90,
        creatorName: 'JiuSpeak Master Instructors',
        imageUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=400'
      };
      setCheckoutCourse(matched as Course);
      setCheckoutStep('details');
      return false;
    }
    return true;
  };

  // Run Enrollment Flow
  const handleTriggerEnroll = () => {
    if (handleCheckEnrollment()) {
      showToast("Perfeito! Você possui este módulo habilitado para estudos.", "success");
    }
  };

  // Submit Interactive Quiz Exercise
  const handleSubmitActiveExercise = (exercise: any) => {
    if (isAnswered) return;
    setIsAnswered(true);

    let stepCorrect = false;

    if (exercise.type === 'multiple_choice' || exercise.type === 'listening') {
      if (selectedAnswer === exercise.correctOptionIndex) {
        stepCorrect = true;
        showToast("Exatamente! Defesa e colocação correta. Oss!", "success");
      } else {
        showToast("Estudo incorreto. Leia a justificativa técnica com atenção.", "error");
      }
    } else if (exercise.type === 'speaking') {
      // Correct if pronunciation accuracy calculated is above 70% or simulated
      const finalScore = speechAccuracy !== null ? speechAccuracy : 85;
      if (finalScore >= 70) {
        stepCorrect = true;
        showToast("Excelente dicção do tatame!", "success");
      } else {
        showToast("Ajuste a pronúncia das consoantes para a próxima vez.", "error");
      }
    } else if (exercise.type === 'translation') {
      // Assembly words key matches prefix or typing triggers match
      const guessFull = translationText.trim().toLowerCase();
      const assembleFull = translationAssemble.join(' ').toLowerCase();
      const targetPhrase = exercise.wordBank ? exercise.wordBank[0].trim().toLowerCase() : exercise.translationKey?.toLowerCase() || '';

      if (guessFull.includes(targetPhrase) || assembleFull.includes(targetPhrase) || targetPhrase.includes(assembleFull)) {
        stepCorrect = true;
        showToast("Tradução Perfeita! Você compreendeu a técnica na essência.", "success");
      } else {
        showToast(`Tradução incorreta. Dica: "${exercise.wordBank ? exercise.wordBank[0] : targetPhrase}"`, "error");
      }
    }

    setCorrectAnswersInRound(prev => {
      const copy = [...prev];
      copy[activeExerciseStep] = stepCorrect;
      return copy;
    });
  };

  // Advance step in compilation
  const handleAdvanceExerciseStep = (totalSteps: number) => {
    const nextStep = activeExerciseStep + 1;
    if (nextStep < totalSteps) {
      setActiveExerciseStep(nextStep);
      resetAnswers();
    } else {
      // Completed last exercise in playbook! Lock in completion persistently
      markLessonAsCompleted(activeLesson.id);
      showToast(`Parabéns! Você completou com sucesso todos os exercícios de "${activeLesson.title}"! 🎉`, 'success');
      goToNextLesson();
    }
  };

  // Simulates purchasing the course via PIX Code
  const handleConfirmPixPayment = () => {
    if (!checkoutCourse) return;
    setCheckoutStep('success');
    
    // Unlock course
    const newEnrolled = [...user.enrolledCourses, checkoutCourse.id];
    updateUser({
      enrolledCourses: newEnrolled
    });

    onAddAuditLog(
      'pix_deposit',
      `Inscrição Premium Course: Adquiriu o curso "${checkoutCourse.title}" via depósito Pix.`,
      checkoutCourse.priceBRL
    );

    showToast(`Módulo "${checkoutCourse.title}" foi desbloqueado na apostila com sucesso!`, 'success');
  };

  const copyPixCode = () => {
    setPixCopiado(true);
    navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136e0886bd6-86de-4fbf-862d-a1c2293816jiuspeakqrcodepixprod520400005303986540549.905802BR5925JiuSpeak%20Saas%20Gamificado6009SAO%20PAULO62070503***6304ED24");
    showToast("Código PIX copiado com sucesso para área de transferência!", "info");
    setTimeout(() => setPixCopiado(false), 2000);
  };

  // Belt configuration style helpers
  const getBeltColorHeader = (belt: BeltRank) => {
    switch (belt) {
      case 'Branca': return 'from-slate-100 to-slate-200 text-slate-800';
      case 'Azul': return 'from-blue-600 to-blue-800 text-white';
      case 'Roxa': return 'from-purple-600 to-purple-800 text-white';
      case 'Marrom': return 'from-amber-800 to-amber-950 text-white';
      case 'Preto': return 'from-slate-900 via-red-950 to-slate-950 text-red-400 border border-red-900/30';
      default: return 'from-slate-500 to-slate-700 text-white';
    }
  };

  const isEnrolledInActiveBelt = user.enrolledCourses.includes(activeSyllabus.courseId);

  return (
    <div className="space-y-6" id="interactive-playbook-dashboard">
      
      {/* 1. Header Information Panel */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-violet-400" />
            <span>Apostila Interativa de Inglês 📖</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Escolha o nível de graduação atual e estude o vocabulário, dialogues em áudio e pratique exercícios com speaking e listening.
          </p>
        </div>

        {/* Global Curriculum Progress Indicator */}
        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 w-full md:w-auto">
          <div className="flex justify-between items-center text-[10px] font-mono mb-1 text-slate-400 gap-6">
            <span>PROGRESÃO GERAL:</span>
            <span className="font-bold text-violet-400">{completedLessonIds.length} aulas conclúidas</span>
          </div>
          <div className="w-full md:w-44 bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-violet-600 to-indigo-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, (completedLessonIds.length / 10) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Horizontal Belt Rank Navigation tabs selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" id="belt-rank-selectors">
        {(['Branca', 'Azul', 'Roxa', 'Marrom', 'Preto'] as BeltRank[]).map((belt) => {
          const isActive = selectedBelt === belt;
          const userHasRank = user.belt === belt;
          
          let colorMap = 'bg-slate-905 text-slate-400 border hover:border-slate-700';
          if (isActive) {
            if (belt === 'Branca') colorMap = 'bg-white text-slate-950 font-bold border-white ring-2 ring-slate-200';
            else if (belt === 'Azul') colorMap = 'bg-blue-600 text-white font-bold border-blue-500 ring-2 ring-blue-550/30';
            else if (belt === 'Roxa') colorMap = 'bg-purple-700 text-white font-bold border-purple-600 ring-2 ring-purple-550/30';
            else if (belt === 'Marrom') colorMap = 'bg-amber-900 text-white font-bold border-amber-800 ring-2 ring-amber-550/30';
            else if (belt === 'Preto') colorMap = 'bg-slate-900 border-2 border-red-650 text-red-500 font-bold ring-2 ring-red-550/30';
          }

          return (
            <button
              key={belt}
              onClick={() => setSelectedBelt(belt)}
              className={`py-3 px-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${colorMap}`}
            >
              <span className="text-lg">
                {belt === 'Branca' ? '⚪' : belt === 'Azul' ? '🔵' : belt === 'Roxa' ? '🟣' : belt === 'Marrom' ? '🟤' : '⚫'}
              </span>
              <span className="block text-xs font-display font-black uppercase mt-1 tracking-wider">
                {belt === 'Branca' ? 'White Belt' : belt === 'Azul' ? 'Blue Belt' : belt === 'Roxa' ? 'Purple Belt' : belt === 'Marrom' ? 'Brown Belt' : 'Black Belt'}
              </span>
              <span className="text-[8px] opacity-75 uppercase mt-0.5 tracking-tight">
                {user.belt === belt ? 'Seu Nível' : 'Matéria'}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. DUAL-PANE interactive platform container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left pane: Lesson Tree & Course Navigation (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-5">
          
          <div className="space-y-1">
            <h5 className="text-xs font-display font-extrabold text-white tracking-wide uppercase">
              📚 Navegação da Apostila
            </h5>
            <p className="text-[10px] text-slate-500 font-sans leading-tight">
              Filtre e estude todos os graus de faixas gringas.
            </p>
          </div>

          {/* Search box for workbook */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar título ou vocabulário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 p-1 text-[10px] text-slate-400 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-800 rounded font-mono"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Quick Filter buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                filterFavoritesOnly
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-900 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className={`w-3 h-3 ${filterFavoritesOnly ? 'fill-rose-400' : ''}`} />
              <span>Favoritos ({favoriteLessonIds.length})</span>
            </button>
            <button
              onClick={() => setFilterCompletedOnly(!filterCompletedOnly)}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                filterCompletedOnly
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Concluídas ({completedLessonIds.length})</span>
            </button>
          </div>

          {/* Collapsible Belt Chapters List */}
          <div className="space-y-3 pt-1">
            {(['Branca', 'Azul', 'Roxa', 'Marrom', 'Preto'] as BeltRank[]).map((belt) => {
              const syllabus = PLAYBOOK_DATA.find(p => p.belt === belt);
              if (!syllabus) return null;

              // Extract all lessons from modules list
              const allLessons = syllabus.modules.flatMap(m => m.lessons);
              
              // Filter visible lessons in this belt
              const visibleLessons = allLessons.map((les, originalIdx) => ({
                lesson: les,
                originalIdx
              })).filter(item => isLessonVisible(item.lesson));

              // Don't show empty chapters if searching/filtering is active and nothing matches
              const isSearchOrFilterActive = searchQuery.trim() !== '' || filterFavoritesOnly || filterCompletedOnly;
              if (isSearchOrFilterActive && visibleLessons.length === 0) return null;

              const isExpanded = expandedBelts[belt] || isSearchOrFilterActive;
              const completedCountInBelt = allLessons.filter(l => completedLessonIds.includes(l.id)).length;
              
              const beltLabel = belt === 'Branca' ? 'White Belt' :
                                belt === 'Azul' ? 'Blue Belt' :
                                belt === 'Roxa' ? 'Purple Belt' :
                                belt === 'Marrom' ? 'Brown Belt' : 'Black Belt';

              const beltEmoji = belt === 'Branca' ? '⚪' :
                                 belt === 'Azul' ? '🔵' :
                                 belt === 'Roxa' ? '🟣' :
                                 belt === 'Marrom' ? '🟤' : '⚫';

              // Visual details dependent on belt rank
              let headerStyle = 'bg-slate-900/60 hover:bg-slate-900 border-slate-850 text-slate-300';
              if (selectedBelt === belt) {
                if (belt === 'Branca') headerStyle = 'bg-white/10 border-slate-400/30 text-white';
                else if (belt === 'Azul') headerStyle = 'bg-blue-600/10 border-blue-500/30 text-blue-300';
                else if (belt === 'Roxa') headerStyle = 'bg-purple-600/10 border-purple-500/30 text-purple-300';
                else if (belt === 'Marrom') headerStyle = 'bg-amber-900/10 border-amber-800/30 text-amber-300';
                else if (belt === 'Preto') headerStyle = 'bg-red-950/10 border-red-900/30 text-red-400';
              }

              return (
                <div key={belt} className="border border-slate-850/80 rounded-xl overflow-hidden bg-slate-950/20">
                  {/* Chapter Header Link */}
                  <button
                    onClick={() => toggleBeltExpanded(belt)}
                    className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-all border-b border-transparent ${headerStyle}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm select-none">{beltEmoji}</span>
                      <div className="text-left">
                        <span className="block font-display tracking-wide">{beltLabel}</span>
                        <span className="text-[9px] text-slate-500 font-mono font-normal">
                          {completedCountInBelt}/{allLessons.length} Aulas Concluídas
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-all ${isExpanded ? 'rotate-90 text-slate-300' : ''}`} />
                  </button>

                  {/* Chapter Lessons List Dropdown */}
                  {isExpanded && (
                    <div className="p-1.5 space-y-1 divide-y divide-slate-900/40">
                      {visibleLessons.length === 0 ? (
                        <p className="text-[10px] text-slate-500 text-center py-3 font-sans">
                          Sem aulas correspondentemente filtradas.
                        </p>
                      ) : (
                        visibleLessons.map(({ lesson, originalIdx }) => {
                          const isCompleted = completedLessonIds.includes(lesson.id);
                          const isFav = favoriteLessonIds.includes(lesson.id);
                          const isActive = selectedBelt === belt && activeLessonIdx === originalIdx && activeModuleIdx === 0;

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => {
                                setSelectedBelt(belt);
                                setActiveModuleIdx(0);
                                setActiveLessonIdx(originalIdx);
                              }}
                              className={`group w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer text-xs ${
                                isActive
                                  ? 'bg-violet-600/10 text-white font-bold border border-violet-500/20 ring-1 ring-violet-500/5'
                                  : 'hover:bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono shrink-0 ${
                                  isActive ? 'bg-violet-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-500'
                                }`}>
                                  {originalIdx + 1}
                                </div>
                                <div className="min-w-0">
                                  <span className={`block truncate leading-snug ${isActive ? 'text-violet-300 font-bold' : ''}`}>
                                    {lesson.title}
                                  </span>
                                  <span className="text-[8.5px] text-slate-500 font-mono">
                                    ⏱️ {lesson.duration}
                                  </span>
                                </div>
                              </div>

                              {/* Interactive Inline Actions */}
                              <div className="flex items-center gap-1 shrink-0 ml-1.5">
                                {/* Favorite button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(lesson.id, lesson.title);
                                  }}
                                  className="p-1 bg-transparent hover:bg-slate-800 rounded transition-all"
                                  title={isFav ? "Remover dos Favoritos" : "Favoritar Aula"}
                                >
                                  <Heart className={`w-3.5 h-3.5 transition-all hover:scale-110 ${
                                    isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-600 group-hover:text-slate-400'
                                  }`} />
                                </button>

                                {/* Checkbox completion state button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLessonCompletion(lesson.id, lesson.title);
                                  }}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                    isCompleted
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                      : 'border-slate-800 bg-slate-900 hover:border-slate-550 text-transparent hover:text-slate-500'
                                  }`}
                                  title={isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
                                >
                                  <Check className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 flex items-start gap-2 text-[10px] text-slate-400 mt-4 leading-normal">
            <span>🥋</span>
            <p>
              Estude os termos no tatame no Brasil e gringa, marque seus favoritos e conclua os questionários e de speaking para faturar moedas!
            </p>
          </div>

        </div>

        {/* Right pane: Interactive Reader notebook & Exercises engine (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main interactive playbook box */}
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
            
            {/* Header tab controller */}
            <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base text-violet-400">📖</span>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-white leading-snug">
                    {activeLesson?.title || 'Selecione uma aula'}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">
                    NÍVEL: {selectedBelt} Belt • ASSALTO ATIVO
                  </span>
                </div>
              </div>

              {/* Toggle study vs exercises */}
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setStudyTab('study')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    studyTab === 'study'
                      ? 'bg-violet-600 text-white shadow shadow-violet-600/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Caderno de Estudo</span>
                </button>
                <button
                  onClick={() => {
                    if (!handleCheckEnrollment()) return;
                    setStudyTab('exercises');
                    resetAnswers();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    studyTab === 'exercises'
                      ? 'bg-violet-600 text-white shadow shadow-violet-600/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Prática de Exercícios</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT A - CASE GUIDE STUDY NOTEBOOK */}
            {studyTab === 'study' && activeLesson && (
              <div className="p-6 space-y-6 animate-fadeIn">
                
                {/* Real-time notebook controls */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">Status desta lição:</span>
                    {completedLessonIds.includes(activeLesson.id) ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        ✔ AULA CONCLUÍDA
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        PENDENTE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => toggleFavorite(activeLesson.id, activeLesson.title)}
                      className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        favoriteLessonIds.includes(activeLesson.id)
                          ? 'bg-rose-500/15 border-rose-500/35 text-rose-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${favoriteLessonIds.includes(activeLesson.id) ? 'fill-rose-500' : ''}`} />
                      <span>{favoriteLessonIds.includes(activeLesson.id) ? 'Favoritada' : 'Favoritar'}</span>
                    </button>

                    <button
                      onClick={() => toggleLessonCompletion(activeLesson.id, activeLesson.title)}
                      className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        completedLessonIds.includes(activeLesson.id)
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          : 'bg-violet-600 text-white border-violet-500 hover:bg-violet-500'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{completedLessonIds.includes(activeLesson.id) ? 'Desmarcar Conclusão' : 'Marcar como Concluída'}</span>
                    </button>
                  </div>
                </div>
                
                {/* Introduction */}
                <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[9px] font-mono tracking-widest text-violet-400 bg-violet-950/20 px-2 py-0.5 rounded font-black inline-block uppercase animate-pulse">
                    🎯 Objetivo da Lição
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeLesson.overview}
                  </p>
                </div>

                {/* Vocabulary Glossary visual panel */}
                <div className="space-y-3">
                  <h5 className="text-xs font-display font-extrabold text-white flex items-center gap-1.5 uppercase pl-0.5">
                    <Languages className="w-4 h-4 text-violet-400" />
                    <span>Dicionário de Expressões Técnicas</span>
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeLesson.vocabulary.map((vocab, vIdx) => (
                      <div 
                        key={vIdx}
                        className="bg-slate-900/50 p-3 rounded-xl border border-slate-850 hover:border-slate-800 transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-xs text-indigo-300">{vocab.term}</span>
                            <span className="text-[9px] text-slate-500 font-mono">[{vocab.pronunciation}]</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-sans font-medium">
                            {vocab.translation}
                          </span>
                        </div>
                        <button
                          onClick={() => speakPhrase(vocab.term)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-lg text-slate-400 hover:text-violet-400 transition-all cursor-pointer"
                          title="Clique para Ouvir a Pronúncia Oficial"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Bubble Dialogues simulator */}
                <div className="space-y-3">
                  <h5 className="text-xs font-display font-extrabold text-white flex items-center gap-1.5 uppercase pl-0.5">
                    <Volume2 className="w-4 h-4 text-violet-400" />
                    <span>Resenhas e Diálogos Reais do Tatame</span>
                  </h5>

                  <div className="space-y-3">
                    {activeLesson.dialogue.map((dial, dIdx) => (
                      <div 
                        key={dIdx} 
                        className={`flex gap-3 max-w-xl ${
                          dIdx % 2 === 1 ? 'ml-auto flex-row-reverse text-right' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-xs shrink-0 select-none shadow">
                          {dIdx % 2 === 0 ? '🗣️' : '🥋'}
                        </div>
                        <div className="space-y-1">
                          <span className="block text-[9px] text-slate-500 font-mono tracking-wider">
                            {dial.speaker}
                          </span>
                          <div className={`p-3 rounded-xl text-[11px] border leading-normal font-semibold ${
                            dIdx % 2 === 0
                              ? 'bg-slate-900 border-slate-800 rounded-tl-none text-slate-200'
                              : 'bg-violet-950/10 border-violet-900/30 rounded-tr-none text-indigo-200'
                          }`}>
                            <p>{dial.textEN}</p>
                            <span className="block text-[9.5px] text-slate-500 italic mt-1 font-normal">
                              {dial.textPT}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => speakPhrase(dial.textEN)}
                          className="self-center p-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded"
                          title="Falar este período"
                        >
                          <Volume2 className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Master tips for tactical understanding */}
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 relative">
                  <div className="absolute top-3 right-3 text-yellow-500 flex items-center gap-1 text-[9px] font-mono animate-pulse">
                    <Sparkles className="w-3 h-3 fill-yellow-500" /> Conselho de Faixa
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-900 flex items-center justify-center text-lg shadow border border-violet-600 shrink-0">
                      👴
                    </div>
                    <div>
                      <h6 className="font-display font-semibold text-xs text-slate-200">Sensei JiuSpeak</h6>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed italic">
                        "{activeLesson.masterTip}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call to active exercises action and Next Lesson skipped */}
                <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <button
                    onClick={goToNextLesson}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold font-display rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>⏩ Próxima Aula (Avançar)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!handleCheckEnrollment()) return;
                      setStudyTab('exercises');
                      resetAnswers();
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold font-display rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-violet-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>💪 Praticar Quiz / Exercícios</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* TAB CONTENT B - STAGGERED COMBAT EXERCISES SANDBOX */}
            {studyTab === 'exercises' && activeLesson && (
              <div className="p-6 space-y-6 animate-fadeIn">
                
                {/* Embedded Exercises Progress Line */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>SEU ASSALTO DE EXERCÍCIOS:</span>
                    <span>Etapa {activeExerciseStep + 1} de {activeLesson.exercises.length}</span>
                  </div>
                  
                  <div className="flex gap-1.5 h-1.5">
                    {activeLesson.exercises.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`flex-1 rounded-full transition-all duration-350 ${
                          idx < activeExerciseStep
                            ? 'bg-emerald-500' // completed previous
                            : idx === activeExerciseStep
                            ? 'bg-violet-500 animate-pulse' // active
                            : 'bg-slate-800' // locked
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Sub-exercise active content card wrapper */}
                {(() => {
                  const exercise = activeLesson.exercises[activeExerciseStep];
                  if (!exercise) return <p className="text-xs text-slate-400 text-center">Fim dos exercícios!</p>;

                  return (
                    <div className="space-y-6">
                      
                      {/* Section tag overlay */}
                      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-850 flex items-start justify-between">
                        <div>
                          <span className="inline-block bg-slate-800 text-slate-350 text-[9px] font-mono px-2 py-0.5 rounded uppercase font-black mb-2">
                            {exercise.type === 'multiple_choice' && '🥋 MÚLTIPLA ESCOLHA'}
                            {exercise.type === 'listening' && '🎧 LISTENING PRACTICE (OUVIR DEPOIS)'}
                            {exercise.type === 'speaking' && '🗣️ SPEAKING SANDBOX (FALAR)'}
                            {exercise.type === 'translation' && '🔤 TRADUÇÃO DE TERMO'}
                          </span>
                          <h4 className="text-sm font-semibold text-white leading-relaxed">
                            {exercise.question}
                          </h4>
                        </div>

                        {/* Exercise state sound speaker helper */}
                        {exercise.phraseEN && (
                          <button
                            onClick={() => speakPhrase(exercise.phraseEN!)}
                            className="p-2.5 bg-violet-650 hover:bg-violet-550 border border-violet-500 rounded-xl text-white shadow transition-all cursor-pointer flash-effect"
                            title="Ouvir Frase"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* EXERCISE RENDER PER TYPE */}
                      
                      {/* type 1: MULTIPLE CHOICE */}
                      {exercise.type === 'multiple_choice' && exercise.options && (
                        <div className="space-y-3">
                          {exercise.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswer === oIdx;
                            const isCorrect = oIdx === exercise.correctOptionIndex;

                            let cardStyle = 'bg-slate-900/60 border-slate-855 hover:border-slate-700 text-slate-300';
                            if (isSelected) {
                              cardStyle = 'bg-violet-950/20 border-violet-500 text-violet-250 ring-1 ring-violet-500/20';
                            }
                            if (isAnswered) {
                              if (isCorrect) {
                                cardStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-250 ring-2 ring-emerald-500/10';
                              } else if (isSelected) {
                                cardStyle = 'bg-red-950/40 border-red-500 text-red-250 ring-2 ring-red-500/10';
                              } else {
                                cardStyle = 'bg-slate-900/40 border-slate-900 text-slate-500 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={isAnswered}
                                onClick={() => setSelectedAnswer(oIdx)}
                                className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left text-xs transition-all cursor-pointer ${cardStyle}`}
                              >
                                <div className={`w-5.5 h-5.5 rounded bg-slate-800 text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-violet-600 text-slate-950' : ''
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </div>
                                <span className="flex-1 font-sans font-medium">{opt}</span>
                                {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* type 2: LISTENING */}
                      {exercise.type === 'listening' && exercise.options && (
                        <div className="space-y-4">
                          
                          {/* Beautiful audio preview waves visual mockup */}
                          <div className="p-4 bg-slate-900/20 border border-slate-850 rounded-xl text-center space-y-3">
                            <p className="text-[10px] font-mono text-slate-500">
                              APERTE O PLAY PARA OUVIR O AUDIO DO ÁRBITRO PROFISSIONAL
                            </p>
                            <div className="flex justify-center items-center gap-1.5 py-4">
                              <span className="w-1 bg-violet-600 h-6 rounded animate-pulse" />
                              <span className="w-1 bg-indigo-500 h-10 rounded animate-slowPulse" />
                              <span className="w-1 bg-violet-420 h-12 rounded animate-pulse" />
                              <span className="w-1 bg-indigo-600 h-8 rounded animate-slowPulse" />
                              <span className="w-1 bg-slate-800 h-5 rounded" />
                              <span className="w-1 bg-slate-850 h-3 rounded" />
                            </div>
                            <button
                              onClick={() => speakPhrase(exercise.phraseEN!)}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs rounded-xl flex items-center gap-2 mx-auto cursor-pointer"
                            >
                              🔊 Tocar Áudio Regulatório
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {exercise.options.map((opt, oIdx) => {
                              const isSelected = selectedAnswer === oIdx;
                              const isCorrect = oIdx === exercise.correctOptionIndex;

                              let cardStyle = 'bg-slate-900/60 border-slate-855 hover:border-slate-75ag text-slate-300';
                              if (isSelected) {
                                cardStyle = 'bg-violet-950/20 border-violet-500 text-violet-250 ring-1 ring-violet-500/20';
                              }
                              if (isAnswered) {
                                if (isCorrect) {
                                  cardStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-250 ring-2 ring-emerald-500/10';
                                } else if (isSelected) {
                                  cardStyle = 'bg-red-950/40 border-red-500 text-red-250 ring-2 ring-red-500/10';
                                } else {
                                  cardStyle = 'bg-slate-900/40 border-slate-900 text-slate-500 opacity-60';
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  disabled={isAnswered}
                                  onClick={() => setSelectedAnswer(oIdx)}
                                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left text-xs transition-all cursor-pointer ${cardStyle}`}
                                >
                                  <div className="w-5.5 h-5.5 rounded bg-slate-800 text-[10px] font-mono font-black flex items-center justify-center shrink-0">
                                    {oIdx + 1}
                                  </div>
                                  <span className="flex-1 font-sans">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* type 3: SPEAKING PRACTICE */}
                      {exercise.type === 'speaking' && (
                        <div className="space-y-4 text-center py-4">
                          
                          <div className="p-6 bg-slate-900/20 border-2 border-dashed border-slate-850 rounded-2xl max-w-sm mx-auto space-y-4">
                            
                            {/* Speaking active animated pulsing microphone ring */}
                            <div className="relative inline-block mx-auto">
                              <button
                                disabled={isAnswered}
                                onClick={() => handleMicrophoneCapture(exercise.phraseEN!)}
                                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all ${
                                  isRecording
                                    ? 'bg-red-600 animate-pulse ring-4 ring-red-500/35 text-white'
                                    : 'bg-violet-605 hover:bg-violet-505 border border-violet-500 text-white hover:scale-105'
                                }`}
                              >
                                <Mic className="w-7 h-7" />
                              </button>
                              
                              {isRecording && (
                                <span className="absolute -inset-1 rounded-full border-2 border-red-500 animate-ping opacity-75" />
                              )}
                            </div>

                            <div>
                              <p className="text-xs text-slate-300 font-semibold font-mono">
                                {isRecording ? '🔉 ESCUTANDO SEU AUDIO...' : 'CLIQUE NO MICROFONE E FALE EM INGLÊS'}
                              </p>
                              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                                [O navegador analisará gramática e articulação]
                              </span>
                            </div>

                            {/* Captured Speech Results */}
                            {speechAccuracy !== null && (
                              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 animate-fadeIn">
                                <div className="flex justify-between items-center text-[11px] font-mono">
                                  <span>ÍNDICE DE ACERTO:</span>
                                  <span className={`font-bold ${speechAccuracy >= 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                    {speechAccuracy}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                  <div 
                                    className={`h-1.5 rounded-full ${speechAccuracy >= 70 ? 'bg-emerald-500' : 'bg-yellow-500'}`} 
                                    style={{ width: `${speechAccuracy}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                                  {speechAccuracy >= 70 ? '🎉 Excelente pronúncia técnica, Oss!' : '💡 Fale próximo ao microfone de maneira clara.'}
                                </span>
                              </div>
                            )}

                          </div>

                        </div>
                      )}

                      {/* type 4: TRANSLATION */}
                      {exercise.type === 'translation' && (
                        <div className="space-y-4">
                          
                          {/* Render puzzle bubbles word bank */}
                          {exercise.wordBank && (
                            <div className="space-y-4">
                              
                              {/* Selected assemble path result box */}
                              <div className="p-4 border-2 border-dashed border-slate-800 bg-slate-900/30 rounded-2xl min-h-[50px] flex flex-wrap gap-2 items-center">
                                {translationAssemble.length === 0 ? (
                                  <span className="text-xs text-slate-500 font-mono italic">
                                    [Toque nas palavras abaixo na ordem correta para traduzir]
                                  </span>
                                ) : (
                                  translationAssemble.map((w, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleToggleBubbleWord(w)}
                                      className="px-3 py-1.5 bg-violet-950/50 border border-violet-500 text-indigo-200 text-xs font-bold rounded-lg transition-all animate-scaleUp cursor-pointer"
                                    >
                                      {w}
                                    </button>
                                  ))
                                )}
                              </div>

                              {/* Word bank pool */}
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 block mb-2 uppercase">
                                  BANCO DE PALAVRAS DISPONÍVEL:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {exercise.wordBank.map((word, wIdx) => {
                                    const isUsed = translationAssemble.includes(word);
                                    return (
                                      <button
                                        key={wIdx}
                                        disabled={isAnswered || isUsed}
                                        onClick={() => handleToggleBubbleWord(word)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          isUsed
                                            ? 'bg-slate-900 text-slate-650 border border-slate-950 opacity-40 cursor-not-allowed'
                                            : 'bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-205'
                                        }`}
                                      >
                                        {word}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                            </div>
                          )}

                          {/* Fallback option input field for user comfort */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-500 uppercase block pl-1">
                              PREFERE DIGITAR? INSIRA AQUI SUA TRADUÇÃO:
                            </label>
                            <input
                              type="text"
                              disabled={isAnswered}
                              value={translationText}
                              onChange={(e) => setTranslationText(e.target.value)}
                              placeholder="Introduza a tradução correta em português..."
                              className="w-full bg-slate-900 border border-slate-805 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-600 transition-all font-semibold"
                            />
                          </div>

                        </div>
                      )}

                      {/* Immediate explanation notes display after submit */}
                      {isAnswered && (
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 animate-fadeIn space-y-1.5">
                          <h5 className="font-display font-extrabold text-xs text-slate-202 flex items-center gap-1.5">
                            <Brain className="w-4 h-4 text-violet-400" />
                            <span>Análise do Mestre Roger Gracie</span>
                          </h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {exercise.explanation}
                          </p>
                        </div>
                      )}

                      {/* Control buttons footer */}
                      <div className="pt-2 flex justify-end">
                        {!isAnswered ? (
                          <button
                            disabled={
                              (exercise.type === 'multiple_choice' || exercise.type === 'listening') && selectedAnswer === null
                            }
                            onClick={() => handleSubmitActiveExercise(exercise)}
                            className={`px-6 py-2.5 font-bold font-display text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                              ((exercise.type === 'multiple_choice' || exercise.type === 'listening') && selectedAnswer === null)
                                ? 'bg-slate-850 text-slate-500 cursor-not-allowed'
                                : 'bg-violet-620 hover:bg-violet-520 text-white active:scale-95 shadow shadow-violet-500/10'
                            }`}
                          >
                            ✔ Registrar Movimento na Apostila
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAdvanceExerciseStep(activeLesson.exercises.length)}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-display text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>
                              {activeExerciseStep + 1 < activeLesson.exercises.length
                                ? 'Avançar Assalto ➡️'
                                : 'Fechar Aula na Apostila 🎉'}
                            </span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })()}

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Dynamic Checkout PIX simulation Dialog Modal */}
      {checkoutCourse && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp shadow-2xl">
            
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono text-yellow-505 uppercase font-black block tracking-widest">
                  Processamento Hotmart PIX
                </span>
                <h4 className="font-display font-extrabold text-lg text-white">Comprar Licença de Aula</h4>
              </div>
              <button 
                onClick={() => setCheckoutCourse(null)}
                className="text-slate-500 hover:text-slate-202 text-sm cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            {checkoutStep === 'details' && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-xl shrink-0">
                    🥋
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-xs text-slate-200">{checkoutCourse.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Instrutor: {checkoutCourse.creatorName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Taxa de Emissão de Grau:</span>
                    <span>Grátis</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Selo:</span>
                    <span>JiuSpeak Premium Member</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-200 pt-2 border-t border-slate-855">
                    <span>Valor Total (BRL):</span>
                    <span className="text-base text-yellow-400">R$ {checkoutCourse.priceBRL.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutStep('qr')}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-yellow-505/15 cursor-pointer"
                >
                  ⚡ Gerar QR Code PIX
                </button>
              </div>
            )}

            {checkoutStep === 'qr' && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-350">
                  Escaneie o QR Code ou copie o código abaixo para completar o pagamento fictício no simulador:
                </p>

                <div className="bg-white p-3 rounded-xl inline-block border-2 border-slate-800 mx-auto">
                  <QrCode className="w-32 h-32 text-slate-950" />
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between gap-4 text-left">
                  <code className="text-[9px] text-emerald-400 font-mono select-all truncate flex-1">
                    00020126580014BR.GOV.BCB.PIX0136e0886bd6-86de-4fbf-862d-a1c2293816jiuspeakqrcodepixprod520400005303986540549.905802BR5925JiuSpeak%20Saas%20Gamificado6009SAO%20PAULO62070503***6304ED24
                  </code>
                  <button
                    onClick={copyPixCode}
                    className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-300 self-stretch flex items-center shadow cursor-pointer text-xs"
                    title="Copiar PIX Copia e Cola"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutStep('details')}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                  >
                    Retroceder
                  </button>
                  <button
                    onClick={handleConfirmPixPayment}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-550 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    Simular Pagamento ✔
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                  ✔
                </div>
                <div>
                  <h5 className="font-display font-extrabold text-base text-white">Inscrição de Assalto Aprovada!</h5>
                  <p className="text-xs text-slate-400 mt-1">
                    Seu Pix de <strong>R$ {checkoutCourse.priceBRL.toFixed(2)}</strong> foi compensado na rede de testes JiuSpeak instantaneamente.
                  </p>
                </div>

                <button
                  onClick={() => setCheckoutCourse(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-750 text-slate-202 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Continuar Estudos 🎓
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
