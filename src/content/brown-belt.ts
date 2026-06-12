import { Belt } from './index';

export const brownBeltData: Belt = {
  id: 'belt_brown',
  name: 'Marrom',
  slug: 'brown-belt',
  level: 'Coaching & Biomechanics',
  themeColor: 'amber',
  colorClass: 'from-amber-900 to-amber-950 border-amber-800 text-amber-500',
  description: 'Liderança & Ensino. Aprenda a ministrar aulas inteiras em inglês, corrigir a biomecânica fina de alunos em tempo real, dar comandos verbais nítidos de postura de quadril, e como dar feedbacks didáticos.',
  unlockRequirement: 'Requer nível 15 ou 1000 XP acumulado.',
  modules: [
    {
      id: 'mod_brown_1',
      title: 'Ministrando Aulas Práticas de Alinhamento Coletivo',
      description: 'Como liderar aquecimentos e explicar biomecânica fina com fluidez internacional.',
      slug: 'teaching-biomechanics',
      order: 1,
      missions: [
        {
          id: 'miss_brown_1_1',
          title: 'Como dar Instruções de Aquecimento e Alongamento',
          slug: 'aquecimento-comandos',
          description: 'Aprenda comandos imperativos como "Spread out" e explique a cinemática de rolamentos de costas.',
          xpReward: 250,
          jtReward: 90,
          difficulty: 'Profissional',
          order: 1,
          steps: [
            {
              id: 'br_step_1',
              type: 'intro',
              title: 'Faixa Marrom - O Caminho do Professor',
              description: 'O faixa marrom é o formador de opinião. Nas academias estrangeiras, você frequentemente será escalado para ministrar aulas coletivas ("Classes"). Saber ditar comandos curtos coletivos e se expressar com autoridade pedagógica é um diferencial profissional enorme.',
              content: {
                bannerImage: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=800',
                tips: [
                  'Spread out!: Espalhem-se pelo tatame para que fiquem com distanciamento seguro.',
                  'Line up by rank!: Alinhem-se por ordem de faixa / graduação.',
                  'Pair up!: Formem duplas de treino imediatamente.',
                  'Time/Water break: Intervalo cronometrado breve para hidratação.'
                ]
              }
            },
            {
              id: 'br_step_2',
              type: 'dialogue',
              title: 'Interagindo como Líder de Aula',
              description: 'Pratique guiar a turma do tatame no aquecimento inicial com fluidez nativa.',
              content: {
                dialogue: [
                  { speaker: 'Você (Professor)', textEN: 'Alright everyone, line up by rank! Let’s start with twenty jumping jacks.', textPT: 'Muito bem pessoal, alinhem-se por faixa! Vamos começar com vinte polichinelos.' },
                  { speaker: 'Alunos', textEN: 'Yes coach!', textPT: 'Sim coach!' },
                  { speaker: 'Você (Professor)', textEN: 'Now pair up! One person on their back, one passing.', textPT: 'Agora formem duplas! Uma pessoa de costas no chão, uma passando.' }
                ]
              }
            },
            {
              id: 'br_step_3',
              type: 'reward',
              title: 'Didática Consolidada!',
              description: 'Excepcional! Você agora entende a linguagem imperativa da oratória internacional de ensino.',
              content: {
                xpEarned: 250,
                jtEarned: 90,
                badgeId: 'brown_didactic_conquered'
              }
            }
          ]
        }
      ],
      exam: {
        id: 'exam_brown_1',
        moduleId: 'mod_brown_1',
        title: 'Exame de Graduação - Faixa Marrom (Ensino & Biomecânica)',
        passingScore: 80,
        questions: [
          {
            id: 'ex_br_q1',
            type: 'multiple_choice',
            question: 'Qual o comando verbal que você grita para ordenar que os alunos formem duplas de treino imediatamente?',
            options: ['Line up', 'Spread out', 'Pair up', 'Dismissed'],
            correctAnswer: '2',
            explanation: '"Pair up!" significa literalmente formar duplas de treino.'
          },
          {
            id: 'ex_br_q2',
            type: 'listening',
            question: 'Escute a frase didática e defina a orientação dada aos alunos:',
            audioPhrase: "Line up by belt rank from white to black on the wall.",
            options: [
              'Alinhem-se por ordem de faixa da branca à preta na parede.',
              'Corram em círculo em volta do tatame levantando os joelhos.',
              'Bebam água rapidamente e voltem em trinta segundos.',
              'Fiquem em uma linha e comecem flexões imediatamente.'
            ],
            correctAnswer: '0',
            explanation: '"Line up by belt rank" significa alinhar-se por graduação de faixa.'
          },
          {
            id: 'ex_br_q3',
            type: 'speaking',
            question: 'Fale imperativamente de forma nítida: "Keep your hips heavy, guys!"',
            correctAnswer: "Keep your hips heavy, guys!",
            explanation: '"Hips heavy" instrui a manter o quadril pesado e colado no adversário para impedir raspagens.'
          }
        ]
      }
    }
  ]
};
