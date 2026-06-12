import { Belt } from './index';

export const whiteBeltData: Belt = {
  id: 'belt_white',
  name: 'Branca',
  slug: 'white-belt',
  level: 'Survival English',
  themeColor: 'slate',
  colorClass: 'from-slate-100 to-slate-200 border-slate-300 text-slate-800',
  description: 'Sobrevivência & Confiança. Aprenda os fundamentos do BJJ, comandos de segurança vitais, gírias de tatame brasileiras vs americanas e como pedir rola leve no exterior.',
  unlockRequirement: 'Liberado por padrão para todos os atletas.',
  modules: [
    {
      id: 'mod_white_1',
      title: 'Fundamentos e Primeiras Frases de Segurança',
      description: 'Como chegar no tatame americano sem passar vergonha e se manter seguro.',
      slug: 'fundamentos-seguranca',
      order: 1,
      missions: [
        {
          id: 'miss_white_1_1',
          title: 'Primeiro Dia de Treino: OSS & Slap and Bump',
          slug: 'oss-slap-and-bump',
          description: 'Aprenda a cumprimentar os parceiros e o coach com polidez internacional e a etiqueta do tatame.',
          xpReward: 120,
          jtReward: 40,
          difficulty: 'Iniciante',
          order: 1,
          steps: [
            {
              id: 'w_step_1',
              type: 'intro',
              title: 'Faixa Branca - Missão 1: Etiqueta Básica',
              description: 'O tatame de Jiu-Jitsu fala uma linguagem própria. Para treinar no exterior (EUA, Europa, Japão), existem rituais fundamentais de comunicação que garantem que você seja respeitado desde o primeiro segundo.',
              content: {
                bannerImage: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800',
                tips: [
                  'Oss!: Usado universalmente, mas cuidado para não gritar excessivamente.',
                  'Slap and Bump: O "toco de mão e soquinho". Cumprimento padrão antes de começar qualquer rola.',
                  'Line up!: Alinhamento por faixa no começo e fim do treino.',
                  'Coach / Professor: Sempre chame o instrutor principal de "Coach" ou "Professor".'
                ]
              }
            },
            {
              id: 'w_step_2',
              type: 'video',
              title: 'Como Cumprimentar Corretamente no Tatame',
              description: 'Assista ao vídeo explicativo de postura inicial e ao ritual do Slap and Bump.',
              content: {
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                masterTip: 'Sempre faça contato visual durante o "slap and bump". Demonstra respeito e foco total.'
              }
            },
            {
              id: 'w_step_3',
              type: 'vocabulary',
              title: 'Vocabulário do Tatame Autêntico',
              description: 'Toque para ouvir a pronúncia correta de termos essenciais usando a OpenAI tts.',
              content: {
                words: [
                  { term: 'Slap and bump', translation: 'Toco de mão e soquinho', pronunciation: 'slæp ænd bʌmp' },
                  { term: 'Mat / Mats', translation: 'Tatame / Lonas', pronunciation: 'mæt' },
                  { term: 'Gi / Kimono', translation: 'Quimono de treino', pronunciation: 'ɡiː' },
                  { term: 'No-Gi', translation: 'Treino sem quimono (Shorts/Rashguard)', pronunciation: 'noʊ ɡiː' }
                ]
              }
            },
            {
              id: 'w_step_4',
              type: 'dialogue',
              title: 'Simulando Conversa Inicial',
              description: 'Acompanhe o diálogo no início de um treino livre entre atletas do exterior.',
              content: {
                dialogue: [
                  { speaker: 'John (Americano)', textEN: 'Hey brother! Down to roll? Let’s do a light round.', textPT: 'Ei irmão! Pronto pra rolar? Vamos fazer um rola de leve.' },
                  { speaker: 'Você (Atleta)', textEN: 'Sure, let’s go! Slap and bump. Have a great roll!', textPT: 'Claro, vamos! Toco de mão e soquinho. Tenha um ótimo rola!' },
                  { speaker: 'John (Americano)', textEN: 'Awesome! Be careful with my left knee, it is a bit sore.', textPT: 'Incrível! Cuidado com meu joelho esquerdo, está um pouco dolorido.' }
                ]
              }
            },
            {
              id: 'w_step_5',
              type: 'listening',
              title: 'Treino de Escuta Fina',
              description: 'Ouça o comando de voz e determine qual é a tradução em português.',
              content: {
                phrase: 'Can we roll easy, please? I am coming back from injury.',
                options: [
                  'Podemos ir devagar por favor? Estou voltando de lesão.',
                  'Você quer apostar quem finaliza primeiro?',
                  'Onde compro um quimono azul para campeonato?',
                  'O tatame está sujo, precisamos limpar agora.'
                ],
                correctOptionIndex: 0,
                explanation: '"Roll easy" é pedir rola de leve, e "coming back from injury" significa estar retornando de lesão médica.'
              }
            },
            {
              id: 'w_step_6',
              type: 'speaking',
              title: 'Pronúncia Ativa: Tap Out!',
              description: 'Fale de forma clara a palavra de desistência universal usada em todo tatame.',
              content: {
                phraseToRecord: "Tap out immediately when caught in a tight submission.",
                expectedAccuracy: 85
              }
            },
            {
              id: 'w_step_7',
              type: 'quiz',
              title: 'Exame de Sobrevivência 1',
              description: 'Agora responda ao quiz de validação com feedback tático do mestre.',
              content: {
                questions: [
                  {
                    question: 'Como você avisa o oponente que desistiu verbalmente se seus braços estiverem presos?',
                    options: [
                      'I give up forever!',
                      'Tap, tap, tap! Or "verbal tap"!',
                      'Freeze, brother!',
                      'Wait, let me breathe!'
                    ],
                    correctOptionIndex: 1,
                    explanation: 'Dizer "Tap" ou falar em voz alta "Tap, tap, tap" quando seus braços estão presos é classificado pela IBJJF como desistência verbal ("verbal tap").'
                  },
                  {
                    question: 'Qual é o termo correspondente se o coach gritar: "Close your guard!"?',
                    options: [
                      'Abre a guarda agora',
                      'Fecha a sua guarda',
                      'Foge o quadril para trás',
                      'Segura na perna do adversário'
                    ],
                    correctOptionIndex: 1,
                    explanation: 'Close your guard significa "Fecha a sua guarda". É o comando básico que todo faixa branca ouve o tempo inteiro.'
                  }
                ]
              }
            },
            {
              id: 'w_step_8',
              type: 'reward',
              title: 'Vitória! Missão Concluída!',
              description: 'Parabéns, Guerreiro! Você dominou a etiqueta fundamental de sobrevivência do tatame internacional.',
              content: {
                xpEarned: 120,
                jtEarned: 40,
                badgeId: 'white_etiquette_conquered'
              }
            }
          ]
        }
      ],
      exam: {
        id: 'exam_white_1',
        moduleId: 'mod_white_1',
        title: 'Exame de Graduação - Sobrevivência Básica',
        passingScore: 75,
        questions: [
          {
            id: 'ex_w_q1',
            type: 'multiple_choice',
            question: 'O sinal clássico de toque múltiplo rápido no tatame ou no corpo do oponente para sinalizar que você desiste é:',
            options: ['Oss', 'Line up', 'Tap out', 'Slap and bump'],
            correctAnswer: '2',
            explanation: 'Sinalizar a desistência física batendo no oponente ou no tatame repetidamente e rapidamente é chamado de "Tap Out".'
          },
          {
            id: 'ex_w_q2',
            type: 'listening',
            question: 'Escute a instrução de escuta fina e selecione a tradução adequada:',
            audioPhrase: "Please don't choke me too hard, I have a sore neck.",
            options: [
              'Por favor não aperte muito meu pescoço, estou com torcicolo/dor no pescoço.',
              'Deixe-me passar sua meia guarda por favor.',
              'Onde estão os protetores de orelha para comprar?',
              'Ele me finalizou em cinco segundos de triângulo.'
            ],
            correctAnswer: '0',
            explanation: '"Choke" refere-se a estrangulamento pesado, e "sore neck" é pescoço dolorido/machucado.'
          },
          {
            id: 'ex_w_q3',
            type: 'speaking',
            question: 'Projete sua voz e diga "Let\'s do a light roll, my friend" com confiança:',
            correctAnswer: "Let's do a light roll, my friend.",
            explanation: 'Dizer isso de antemão evita acidentes de atletas hiperativos ("spazzy white belts").'
          }
        ]
      }
    }
  ]
};
