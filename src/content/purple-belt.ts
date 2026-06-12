import { Belt } from './index';

export const purpleBeltData: Belt = {
  id: 'belt_purple',
  name: 'Roxa',
  slug: 'purple-belt',
  level: 'Competition & Strategy',
  themeColor: 'purple',
  colorClass: 'from-purple-900 to-indigo-950 border-purple-800 text-purple-400',
  description: 'Competição & Pressão. Domine termos de arbitragem da IBJJF, como contestar regras com respeito em inglês, descrever penalidades e traçar táticas de ganho de vantagem por pontos.',
  unlockRequirement: 'Requer nível 10 ou 500 XP acumulado nas faixas anteriores.',
  modules: [
    {
      id: 'mod_purple_1',
      title: 'Arbitragem da IBJJF & Vocabulário Competitivo',
      description: 'Como agir dentro de campeonatos internacionais com máxima fluidez linguística.',
      slug: 'arbitragem-ibjjf',
      order: 1,
      missions: [
        {
          id: 'miss_purple_1_1',
          title: 'Juiz e Regras: Penas, Faltas e Vantagem',
          slug: 'regras-faltas',
          description: 'Aprenda a entender e reagir aos comandos do árbitro como "Combative", ligando sua estratégia verbal.',
          xpReward: 200,
          jtReward: 70,
          difficulty: 'Avançado',
          order: 1,
          steps: [
            {
              id: 'p_step_1',
              type: 'intro',
              title: 'Faixa Roxa - Inteligência Estratégica',
              description: 'O faixa roxa é o coração do tatame competitivo. O domínio das nuances do regulamento da IBJJF faz a diferença entre subir no topo do pódium em Irvine (EUA) ou ser desclassificado por falta de vocabulário ou conduta tática errada.',
              content: {
                bannerImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
                tips: [
                  'Stalling / Lack of combativeness: Falta de combatividade (amarração).',
                  'Advantage: Vantagem de pontuação (raspagem quase estabilizada, finalização quase encaixada).',
                  'Disqualification (DQ): Desclassificação imediata.',
                  'Match restarts: Reinício da luta no centro do tatame conforme direção do juiz.'
                ]
              }
            },
            {
              id: 'p_step_2',
              type: 'video',
              title: 'Gestos do Árbitro Internacional',
              description: 'Vídeo descritivo ilustrando as marcações manuais para pontos, vantagens e penalizações.',
              content: {
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                masterTip: 'Sempre memorize "Fight" e "Stalling"! Amarração é penalizada rapidamente fora do Brasil!'
              }
            },
            {
              id: 'p_step_3',
              type: 'quiz',
              title: 'Quiz de Julgamento Tático',
              description: 'Avalie se você sabe contestar ou reagir a uma punição.',
              content: {
                questions: [
                  {
                    question: 'O técnico grita da lateral: "Watch out for stalling!". O que ele está dizendo?',
                    options: [
                      'Cuidado com a sua postura ereta',
                      'Cuidado para não ser punido por amarração de jogo',
                      'Foque em finalizar no pescoço',
                      'O tempo acabou, comemore a vitória'
                    ],
                    correctOptionIndex: 1,
                    explanation: '"Stalling" refere-se à amarração ou falta de combatividade. O técnico alerta o atleta que ele corre risco de sofrer penalidade.'
                  }
                ]
              }
            },
            {
              id: 'p_step_4',
              type: 'reward',
              title: 'Elite Roxa Conquistada!',
              description: 'Você dominou as nuances das regras internacionais e está pronto para as cabeças em competições fora de casa.',
              content: {
                xpEarned: 200,
                jtEarned: 70,
                badgeId: 'purple_referee_conquered'
              }
            }
          ]
        }
      ],
      exam: {
        id: 'exam_purple_1',
        moduleId: 'mod_purple_1',
        title: 'Exame de Graduação - Faixa Roxa (Arbitragem & Fluência)',
        passingScore: 75,
        questions: [
          {
            id: 'ex_p_q1',
            type: 'multiple_choice',
            question: 'Se o juiz sinalizar punição gesticulando um círculo fechado com as mãos e apontar para você, qual a infração correspondente?',
            options: ['Slam', 'Stalling / Lack of Combativeness', 'Illegal guard pull', 'Sore shoulder passive'],
            correctAnswer: '1',
            explanation: 'Gesticular círculos repetidos indica amarração de luta ou "stalling", punido por falta de combatividade.'
          },
          {
            id: 'ex_p_q2',
            type: 'listening',
            question: 'Escute atentamente e defina a tradução da expressão competitiva:',
            audioPhrase: "You were penalized for stalling, push the action now!",
            options: [
              'Você foi punido por amarração, tome a iniciativa e ataque agora!',
              'Você foi finalizado na chave de braço, parabéns pelo esforço.',
              'O árbitro mandou reposicionar os atletas no limite do tatame.',
              'Seu adversário cometeu uma penalidade grave e foi desclassificado.'
            ],
            correctAnswer: '0',
            explanation: '"Penalized for stalling" quer dizer punido por amarrar a luta, e "push the action" estimula a atacar/agir de forma ofensiva.'
          },
          {
            id: 'ex_p_q3',
            type: 'speaking',
            question: 'Fale em voz alta com foco tático: "Ref, that was not stalling, I was attacking the ankle."',
            correctAnswer: "Ref, that was not stalling, I was attacking the ankle.",
            explanation: 'Dizer isso polidamente ao árbitro demonstra que você estava trabalhando ativamente na finalização.'
          }
        ]
      }
    }
  ]
};
