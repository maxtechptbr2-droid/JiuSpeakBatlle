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
  Compass
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

// 1. Detailed Interactive syllabus matching the specified structure per belt rank
interface PlaybookSyllabus {
  belt: BeltRank;
  title: string;
  courseId: string;
  modules: {
    title: string;
    description: string;
    lessons: {
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
    }[];
  }[];
}

const PLAYBOOK_DATA: PlaybookSyllabus[] = [
  {
    belt: 'Branca',
    title: 'Grade Curricular da Faixa Branca',
    courseId: 'course_modulo_1',
    modules: [
      {
        title: 'Boas-vindas & Pronomes (Greetings & Numbers)',
        description: 'Fundamentos iniciais de etiqueta de tatame, saudações tradicionais de artes marciais e contagem oficial de rounds.',
        lessons: [
          {
            id: 'les_m1_1',
            title: 'Posições e Pegadas (Positions & Grips)',
            duration: '10 min',
            overview: 'O pontapé inicial no vocabulário de combate. Aprenda a cumprimentar parceiros internacionais, os nomes das principais amarras de pegada e comandos de emergência.',
            vocabulary: [
              { term: 'Pull Guard', translation: 'Puxar para a guarda', pronunciation: 'pʊl ɡɑːrd' },
              { term: 'Hip Escape', translation: 'Fuga de quadril', pronunciation: 'hɪp ɪˈskeɪp' },
              { term: 'Grip / Collar & Sleeve', translation: 'Pegada / Gola e Manga', pronunciation: 'ɡrɪp / ˈkɒl.ər ænd sliːv' },
              { term: 'Oss!', translation: 'Oss! (Saudação tradicional)', pronunciation: 'ɒs' }
            ],
            dialogue: [
              { speaker: 'Professor', textEN: 'Hello everybody, shake hands, slap and bump and let’s start the practice!', textPT: 'Olá pessoal, apertem as mãos, deem o tapa-e-soco e vamos iniciar o treino!' },
              { speaker: 'Student', textEN: 'Oss Professor! Can we check how to perform a proper collar and sleeve grip first?', textPT: 'Oss Professor! Podemos conferir como fazer uma pegada correta de gola e manga primeiro?' }
            ],
            masterTip: 'No exterior, o cumprimento clássico antes de começar o rola é de fato "slap and bump" (tocar as mãos e dar o soco amigável). Sempre mantenha a compostura, cumprimentando com respeito.',
            exercises: [
              {
                id: 'ex_m1_1_mc',
                type: 'multiple_choice',
                question: 'Como traduzimos "Puxar para a Guarda" e "Fuga de quadril" no inglês de tatame?',
                options: [
                  'Pull guard & Hip escape / Shrimping',
                  'Push floor & Skip butt',
                  'Jump guard & Move down',
                  'Bring body & Leg out'
                ],
                correctOptionIndex: 0,
                explanation: '"Pull guard" é o termo exato para puxar para a guarda. "Hip escape" ou "shrimping" (pelo formato lembrar um camarão) refere-se à fuga de quadril clássica.'
              },
              {
                id: 'ex_m1_1_ls',
                type: 'listening',
                phraseEN: 'Always secure a strong collar and sleeve grip before pulling guard.',
                question: 'Escute a frase tocando no botão acima. Qual palavra chave em inglês refere-se à Pegada de Gola e Manga?',
                options: [
                  'Underhook protection',
                  'Collar and sleeve grip',
                  'Leg lock trap',
                  'Ankle grip sweep'
                ],
                correctOptionIndex: 1,
                explanation: '"Collar and sleeve grip" significa literal e anatomicamente a pegada coordenada de gola e manga.'
              },
              {
                id: 'ex_m1_1_sp',
                type: 'speaking',
                phraseEN: 'Let’s start with a light roll, slap and bump!',
                question: 'Fale esta clássica frase de início de luta para testar sua dicção técnica.',
                options: [],
                correctOptionIndex: 0,
                explanation: 'Esta frase estabelece que você quer rolar mais solto ("light roll") chamando para o tradicional cumprimento ("slap and bump")!'
              },
              {
                id: 'ex_m1_1_tr',
                type: 'translation',
                question: 'Traduza o clássico comando para encerrar o rola ou desistir: "TAP OUT"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'bater',
                wordBank: ['Bater (desistir)', 'Pular guarda', 'Cem quilos', 'Fuga lateral'],
                explanation: '"Tap out" ou simplesmente "tap" significa dar os três tapinhas de desistência para interromper o combate com total segurança.'
              }
            ]
          },
          {
            id: 'les_m1_2',
            title: 'Uniforme, Direções e Fisiologia Básica',
            duration: '8 min',
            overview: 'Conheça o seu uniforme de treino, os nomes corretos e termos anatômicos para braço, joelho, cotovelo e tornozelo para descrever lesões ou posições.',
            vocabulary: [
              { term: 'Gi / Kimono', translation: 'Quimono / Uniforme', pronunciation: 'ɡiː' },
              { term: 'Belt & Stripes', translation: 'Faixa e Graus', pronunciation: 'bɛlt ænd straɪps' },
              { term: 'Mouthguard / Rashguard', translation: 'Protetor bucal / Camiseta de lycra', pronunciation: 'ˈmaʊθ.ɡɑːrd' },
              { term: 'Elbow / Joint', translation: 'Cotovelo / Articulação', pronunciation: 'ˈɛl.boʊ / dʒɔɪnt' }
            ],
            dialogue: [
              { speaker: 'Partner', textEN: 'Wait, my mouthguard fell out! Let me grab it quickly.', textPT: 'Espere, meu protetor bucal caiu! Deixe-me pegá-lo rapidamente.' },
              { speaker: 'You', textEN: 'No problem, put it on and let’s start from side control.', textPT: 'Sem problemas, coloque-o e vamos recomeçar a partir dos cem quilos.' }
            ],
            masterTip: 'Para o Kimono, o termo inglês unânime e preferencial nas academias gringas é "Gi". Para quem luta sem quimono, chamamos de "No-Gi". Esqueça "suit" ou "clothes".',
            exercises: [
              {
                id: 'ex_m1_2_mc',
                type: 'multiple_choice',
                question: 'Como chamamos as proteções básicas obrigatórias: "Protetor bucal" e o uniforme de lycra?',
                options: [
                  'Teeth plate & Elastic shirt',
                  'Mouthguard & Rashguard',
                  'Dental shield & Sport fit',
                  'Mouth cover & Silk cover'
                ],
                correctOptionIndex: 1,
                explanation: '"Mouthguard" é o protetor bucal definitivo e "Rashguard" é a proteção de lycra usada sob o quimono.'
              },
              {
                id: 'ex_m1_2_ls',
                type: 'listening',
                phraseEN: 'Make sure your belt is tight and fix your rashguard.',
                question: 'O que o instrutor pediu na gravação de voz?',
                options: [
                  'Amarre a sua faixa firme e ajuste sua rashguard',
                  'Compre um novo quimono e saia do tatame',
                  'Preste atenção ao ataque de cotovelo',
                  'Inicie o rola de joelhos'
                ],
                correctOptionIndex: 0,
                explanation: '"Make sure your belt is tight" significa garantir que sua faixa está bem amarrada/apertada.'
              },
              {
                id: 'ex_m1_2_sp',
                type: 'speaking',
                phraseEN: 'My left elbow and wrist are injured, be careful please.',
                question: 'Fale a frase sinalizando dores nas articulações:',
                options: [],
                correctOptionIndex: 0,
                explanation: '"Elbow" (cotovelo) e "wrist" (punho) são chaves para evitar finalizações excessivas por parte de parceiros brutamontes.'
              },
              {
                id: 'ex_m1_2_tr',
                type: 'translation',
                question: 'Traduza o termo anatômico: "ANKLE"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'tornozelo',
                wordBank: ['Tornozelo', 'Pescoço', 'Cotovelo', 'Ombro'],
                explanation: '"Ankle" significa tornozelo, muito usado para descrever chaves de pé como o clássico "ankle lock".'
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
        title: 'Mecânicas de Repetição & Ajustes (Drills & Corrections)',
        description: 'Termos cruciais para repetição de drill, correção postural de colegas e etiqueta avançada de resenha de treino.',
        lessons: [
          {
            id: 'les_m2_1',
            title: 'Parcerias e Ajustes Posturais (Inviting & Flow)',
            duration: '12 min',
            overview: 'Descubra como convidar parceiros de forma nobre, aceitar recusas, sugerir correções educadas de peso e estruturar sequências repetitivas (drills) em alta velocidade.',
            vocabulary: [
              { term: 'Light Roll / Flow Roll', translation: 'Treino leve fluído (foco técnico)', pronunciation: 'laɪt roʊl / floʊ roʊl' },
              { term: 'Keep your posture', translation: 'Mantenha sua postura armada', pronunciation: 'kiːp jɔːr ˈpɒs.tʃər' },
              { term: 'Tuck your elbows', translation: 'Cole seus cotovelos nas costelas', pronunciation: 'tʌk jɔːr ˈɛl.boʊz' },
              { term: 'Do ten repetitions', translation: 'Faça dez repetições de drill', pronunciation: 'duː tɛn ˌrɛp.ɪˈtɪʃ.ənz' }
            ],
            dialogue: [
              { speaker: 'Colega Gringo', textEN: 'Let’s do some sweeps for drill first. Ten reps each side, alright?', textPT: 'Vamos fazer algumas raspagens como drill primeiro. Dez repetições de cada lado, beleza?' },
              { speaker: 'Você', textEN: 'Awesome! Then we can do a nice flow roll, focus on movement.', textPT: 'Maravilha! Depois podemos fazer um flow roll bacana, com foco na movimentação.' }
            ],
            masterTip: 'Em academias estrangeiras premium, o termo "drill" é sagrado. Um "flow roll" não é uma competição até a morte, mas uma movimentação onde ambos dão espaço para ataques e defesas coordenadas. Respeite o ritmo!',
            exercises: [
              {
                id: 'ex_m2_1_mc',
                type: 'multiple_choice',
                question: 'Qual expressão expressa melhor seu desejo de convidar alguém para um treino de pura movimentação sem força máxima?',
                options: [
                  'Do you want to fight death match with me?',
                  'Would you like to do a light roll / flow roll?',
                  'Let’s play weak with zero power',
                  'Can we simulate a soft punch?'
                ],
                correctOptionIndex: 1,
                explanation: 'A frase unânime é "Do you want to flow roll?" ou "light roll", sinalizando foco total em transições e técnica apurada.'
              },
              {
                id: 'ex_m2_1_ls',
                type: 'listening',
                phraseEN: 'If you want to survive his closed guard, keep your posture high.',
                question: 'O áudio alerta sobre qual perigo na guarda fechada?',
                options: [
                  'Manter a cabeça no abdômen dele',
                  'Desistir da luta antes de começar',
                  'Manter a sua postura bem alta para sobreviver à guarda',
                  'Arriscar sua rashguard de luxo'
                ],
                correctOptionIndex: 2,
                explanation: '"Keep your posture" é o mais importante comando defensivo na guarda fechada, impossibilitando estrangulamentos fáceis.'
              },
              {
                id: 'ex_m2_1_sp',
                type: 'speaking',
                phraseEN: 'Let’s pair up and drill the guard pass ten times each.',
                question: 'Convide o parceiro para fazer drills de passagem de guarda:',
                options: [],
                correctOptionIndex: 0,
                explanation: '"Let\'s pair up" significa "Vamos nos juntar/fazer dupla" e "Drill" significa repetir sistematicamente.'
              },
              {
                id: 'ex_m2_1_tr',
                type: 'translation',
                question: 'Traduza o clássico aviso de instrução: "TUCK YOUR ELBOWS IN"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'colar',
                wordBank: ['Mantenha os cotovelos fechados/enclausurados', 'Suba os calcanhares', 'Abra as pernas', 'Esgrime os braços'],
                explanation: '"Tuck your elbows" serve para evitar dar o braço de bandeja ao adversário, mantendo-os colados ao seu corpo.'
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
    courseId: 'course_modulo_4',
    modules: [
      {
        title: 'Mecânica Avançada, Estratégia & Arbitragem',
        description: 'Táticas complexas de laço, berimbolo, amarrações de lapela e pontuações nas regras oficiais da IBJJF.',
        lessons: [
          {
            id: 'les_m4_1',
            title: 'Pontuação Real nas Regras Internacionais',
            duration: '12 min',
            overview: 'Conheça o vocabulário oficial da arbitragem da IBJJF. Evite ser punido por amarração de luta ("stalling") ou falsas pegadas e saiba como solicitar sua vantagem na gringa.',
            vocabulary: [
              { term: 'Sweep (2 points)', translation: 'Raspagem (concede 2 pontos)', pronunciation: 'swiːp' },
              { term: 'Guard Pass (3 points)', translation: 'Passagem de guarda (3 pontos)', pronunciation: 'ɡɑːrd pæs' },
              { term: 'Stalling', translation: 'Amarração / Falta de combatividade', pronunciation: 'ˈstɔː.lɪŋ' },
              { term: 'Advantage / Penalty', translation: 'Vantagem / Punição', pronunciation: 'ədˈvɑːn.tɪdʒ / ˈpɛn.əl.ti' }
            ],
            dialogue: [
              { speaker: 'Competitor', textEN: 'Referee, that was a safe sweep! I need my two points!', textPT: 'Árbitro, aquilo foi uma raspagem consolidada! Eu preciso dos meus dois pontos!' },
              { speaker: 'Referee', textEN: 'No! There was no control of the hips on top. Play active, no stalling!', textPT: 'Não! Não houve controle de quadril por cima. Jogue ativo, sem amarração!' }
            ],
            masterTip: 'A punição de "amarração" no tatame ou campeonatos é chamada unicamente de "stalling". Se o árbitro gritar "stalling" apontando para você, mova-se imediatamente ou concederá pontos de graça para o oponente.',
            exercises: [
              {
                id: 'ex_m4_1_mc',
                type: 'multiple_choice',
                question: 'Qual o valor oficial de pontos para uma raspagem ("Sweep") seguido de uma passagem ("Guard Pass") nas regras?',
                options: [
                  '2 pontos para o Sweep, 3 pontos para o Guard Pass',
                  '3 pontos para o Sweep, 4 pontos para o Guard Pass',
                  '1 ponto para o Sweep, 2 pontos para o Guard Pass',
                  'Ambos conferem 4 pontos de montada'
                ],
                correctOptionIndex: 0,
                explanation: 'A correta relação matemática oficial de pontuação IBJJF confere 2 pontos à raspagem e 3 pontos adicionais à passagem estabilizada.'
              },
              {
                id: 'ex_m4_1_ls',
                type: 'listening',
                phraseEN: 'The referee warned him for stalling because he was holding the lapel for too long.',
                question: 'Por qual motivo o lutador foi punido?',
                options: [
                  'Ele estava amarrando a luta segurando a lapela por muito tempo.',
                  'Ele completou um estrangulamento voador rápido.',
                  'Ele xingou a torcida organizada.',
                  'Ele rasgou o quimono do adversário.'
                ],
                correctOptionIndex: 0,
                explanation: '"Warned for stalling" indica que foi advertido por amarrar e "holding the lapel" por travar na lapela sem combatividade.'
              },
              {
                id: 'ex_m4_1_sp',
                type: 'speaking',
                phraseEN: 'I got two points for the sweep and stabilized on side control.',
                question: 'Pronuncie sua conquista de pontos para consagrar seu domínio tático:',
                options: [],
                correctOptionIndex: 0,
                explanation: 'Esta frase explica que você obteve 2 pontos da raspagem e estabilizou perfeitamente nos cem quilos ("side control").'
              },
              {
                id: 'ex_m4_1_tr',
                type: 'translation',
                question: 'Traduza o jargão pejorativo no circuito competitivo: "SANDBAGGER"',
                options: [],
                correctOptionIndex: 0,
                translationKey: 'segura',
                wordBank: ['Aquele que segura de faixa de propósito para lutar com atletas mais fracos', 'O mestre da academia', 'Um passador ultra leve', 'Bolsa de areia'],
                explanation: 'Um "Sandbagger" é o temido atleta que amarra sua faixa ou atrasa sua graduação de propósito para conquistar medalhas fáceis no circuito inferior.'
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

  // Active module/lesson selected in sidebar navigation
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  
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
      setStudyTab('study');
      setActiveExerciseStep(0);
      resetAnswers();
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
          
          {/* Active course block banner */}
          <div className={`p-4 rounded-xl bg-gradient-to-br ${getBeltColorHeader(selectedBelt)}`}>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono uppercase bg-slate-950/20 px-2 py-0.5 rounded font-bold">
                MÓDULO DE CURSO
              </span>
              {!isEnrolledInActiveBelt && (
                <span className="bg-yellow-500 text-slate-950 text-[8px] px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-1 animate-pulse">
                  <Lock className="w-2.5 h-2.5" /> BLOQUEADO
                </span>
              )}
            </div>
            <h4 className="font-display font-extrabold text-sm mt-2 leading-tight">
              {activeSyllabus.title}
            </h4>
            <p className="text-[10px] opacity-90 mt-1 leading-relaxed">
              {activeSyllabus.modules[0]?.description || 'Aprenda vocabulários técnicos específicos de tatame americano para campeonatos e aulas.'}
            </p>

            {/* In-belt progress line */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex justify-between text-[9px] font-mono">
                <span>CONCLUÍDO DO MÓDULO:</span>
                <span>{overallBeltProgressPercent}% ({completedLessonsInBelt}/{totalLessonsInBelt})</span>
              </div>
              <div className="w-full bg-slate-950/25 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-white h-1 rounded-full" style={{ width: `${overallBeltProgressPercent}%` }} />
              </div>
            </div>
          </div>

          {!isEnrolledInActiveBelt && (
            <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/35 rounded-xl space-y-2 text-center text-xs text-yellow-300">
              <p className="leading-normal">
                Você ainda não está matriculado neste módulo avançado gringo para obter as credenciais oficiais.
              </p>
              <button
                onClick={handleTriggerEnroll}
                className="w-full py-2 bg-yellow-500 text-slate-950 hover:bg-yellow-450 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
              >
                🔓 Desbloquear Módulo via Pix
              </button>
            </div>
          )}

          {/* Module Lessons tree navigator */}
          <div className="space-y-4">
            <h5 className="text-[11px] font-mono text-slate-450 uppercase tracking-widest pl-1 font-bold">
              Estrutura de Aulas da Apostila
            </h5>

            <div className="space-y-4">
              {activeSyllabus.modules.map((mod, mIdx) => (
                <div key={mIdx} className="space-y-2">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-violet-400" />
                    <span>{mod.title}</span>
                  </div>

                  <div className="space-y-1.5">
                    {mod.lessons.map((les, lIdx) => {
                      const isActive = activeModuleIdx === mIdx && activeLessonIdx === lIdx;
                      const isCompleted = completedLessonIds.includes(les.id);

                      return (
                        <button
                          key={les.id}
                          onClick={() => {
                            setActiveModuleIdx(mIdx);
                            setActiveLessonIdx(lIdx);
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-violet-950/20 border-violet-500 text-white'
                              : 'bg-slate-900/40 border-slate-850 hover:border-slate-800 text-slate-350 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono shrink-0 ${
                              isActive ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {lIdx + 1}
                            </div>
                            <div className="min-w-0">
                              <span className="block text-xs font-semibold truncate leading-tight">
                                {les.title}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono inline-block">
                                ⏱️ {les.duration}
                              </span>
                            </div>
                          </div>

                          {/* Completed lesson checked graphic indicator */}
                          {isCompleted ? (
                            <div className="w-5 h-5 bg-emerald-500/15 border border-emerald-505 rounded-full flex items-center justify-center text-[9px] text-emerald-400">
                              ✔
                            </div>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 flex items-start gap-2.5 text-[10px] text-slate-400 mt-4 leading-normal">
            <span>🥋</span>
            <p>
              Complete as aulas práticas de speaking e listening para fixar os conteúdos de tatame no cérebro e faturar muitos <strong>Kimono Coins</strong> para trocar na biblioteca de recursos!
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
                
                {/* Introduction */}
                <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[9px] font-mono tracking-widest text-violet-400 bg-violet-950/20 px-2 py-0.5 rounded font-black inline-block uppercase">
                    Apresentação no Tatame
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

                {/* Call to active exercises action */}
                <div className="pt-4 border-t border-slate-900 flex justify-end">
                  <button
                    onClick={() => {
                      if (!handleCheckEnrollment()) return;
                      setStudyTab('exercises');
                      resetAnswers();
                    }}
                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold font-display rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-violet-500/10 flex items-center gap-2"
                  >
                    <span>💪 Ir para Exercícios Práticos</span>
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
