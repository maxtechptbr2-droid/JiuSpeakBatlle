import { Belt } from './index';

export const blueBeltData: Belt = {
  id: 'belt_blue',
  name: 'Azul',
  slug: 'blue-belt',
  level: 'Communication & Consistency',
  themeColor: 'blue',
  colorClass: 'from-blue-900 to-indigo-950 border-blue-800 text-blue-400',
  description: 'Comunicação & Parceria. Aprenda a explicar posições avançadas de guarda (Knee slide, De la Riva), pedir orientações detalhadas sobre movimentação de quadril e consolidar sua rotina de treinos.',
  unlockRequirement: 'Requer nível 5 ou 200 XP obtido na Faixa Branca.',
  modules: [
    {
      id: 'mod_blue_1',
      title: 'Descrevendo Passagens de Guarda & Raspagens',
      description: 'Como falar as posições mais complexas da faixa azul em inglês sem hesitação.',
      slug: 'passagens-guardas',
      order: 1,
      missions: [
        {
          id: 'miss_blue_1_1',
          title: 'Guia Prático da Passagem de Guarda "Knee Slide"',
          slug: 'knee-slide-guide',
          description: 'Aprenda a explicar e direcionar verbalmente a esgrima e o corte de joelho em competições.',
          xpReward: 150,
          jtReward: 50,
          difficulty: 'Intermediário',
          order: 1,
          steps: [
            {
              id: 'b_step_1',
              type: 'intro',
              title: 'Faixa Azul - Missão 1: Domínio Cinestésico',
              description: 'Para o faixa azul, o vocabulário estratégico entra em cena. Agora, além de sobreviver, você precisa começar a ditar o ritmo das técnicas e orientar seus parceiros em posições chave de passagem.',
              content: {
                bannerImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800',
                tips: [
                  'Knee Slide / Knee Cut: Corte de joelho cruzado na coxa.',
                  'Underhook: A famosa esgrima de braço por baixo do braço do adversário.',
                  'Chinstrap: Controle de queixo/pescoço na guilhotina.',
                  'Crossface: Pressão de ombro no rosto do oponente para tirar sua espinha de alinhamento.'
                ]
              }
            },
            {
              id: 'b_step_2',
              type: 'video',
              title: 'Explicação Mecânica do Knee Slide Pass',
              description: 'Mecânica fina com detalhes em áudio técnico americano.',
              content: {
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                masterTip: 'Sempre garanta o underhook (esgrima) antes de deslizar o joelho, caso contrário você cederá as costas!'
              }
            },
            {
              id: 'b_step_3',
              type: 'vocabulary',
              title: 'Posições Técnicas da Azul',
              description: 'Pronuncie e compreenda o vocabulário avançado de passador.',
              content: {
                words: [
                  { term: 'Underhook', translation: 'Esgrima de braço', pronunciation: 'ˈʌndər hʊk' },
                  { term: 'Crossface', translation: 'Presionar ombro no queixo / quebrar cruzado', pronunciation: 'krɔːs feɪs' },
                  { term: 'Active toes', translation: 'Dedos do pé ativos no chão (para pressão)', pronunciation: 'ˈæktɪv toʊz' },
                  { term: 'Pin the knee', translation: 'Grampear ou estabilizar o joelho', pronunciation: 'pɪn ðə niː' }
                ]
              }
            },
            {
              id: 'b_step_4',
              type: 'dialogue',
              title: 'Perguntando Dúvidas Prolixas ao Coach',
              description: 'Pratique como formular questionamentos de refino mecânico após sofrer uma raspagem.',
              content: {
                dialogue: [
                  { speaker: 'Você (Atleta)', textEN: 'Coach, how can I prevent my partner from getting an underhook when I try to knee slide?', textPT: 'Coach, como posso evitar que meu parceiro esgrime quando tento passar de knee slide?' },
                  { speaker: 'Coach (Instrutor)', textEN: 'You must secure a deep crossface first and pin his far shoulder to the floor.', textPT: 'Você deve garantir um crossface profundo primeiro e grampear o ombro oposto dele no chão.' }
                ]
              }
            },
            {
              id: 'b_step_5',
              type: 'quiz',
              title: 'Exame de Precisão da Azul',
              description: 'Resolva o quiz para consolidar sua transição técnica.',
              content: {
                questions: [
                  {
                    question: 'Qual é o termo correspondente em inglês para "Grampear o joelho ou o quadril do adversário"?',
                    options: [
                      'Lock the foot',
                      'Pin the knee / Hip posting',
                      'Grab the neck',
                      'Push the collar'
                    ],
                    correctOptionIndex: 1,
                    explanation: '"Pin the knee" é o termo exato em inglês para pregar o joelho do oponente no chão mantendo posturas ativas.'
                  }
                ]
              }
            },
            {
              id: 'b_step_6',
              type: 'reward',
              title: 'Excelente Trabalho!',
              description: 'Você completou os conceitos de passagem de guarda fundamentais.',
              content: {
                xpEarned: 150,
                jtEarned: 50,
                badgeId: 'blue_positional_conquered'
              }
            }
          ]
        }
      ],
      exam: {
        id: 'exam_blue_1',
        moduleId: 'mod_blue_1',
        title: 'Exame de Graduação - Faixa Azul (Tática & Estrutura)',
        passingScore: 75,
        questions: [
          {
            id: 'ex_b_q1',
            type: 'multiple_choice',
            question: 'Em uma passagem de guarda do tipo "Knee Slide", qual o controle de esgrima indispensável que evita que você tenha as costas expostas?',
            options: ['Underhook', 'Crossface', 'Chinstrap', 'Collar grip'],
            correctAnswer: '0',
            explanation: 'Garantir o "underhook" (esgrima) impede que o oponente de baixo suba para as suas costas.'
          },
          {
            id: 'ex_b_q2',
            type: 'listening',
            question: 'Escute a frase de áudio e selecione a tradução adequada:',
            audioPhrase: "You must secure active toes to prevent falling backward.",
            options: [
              'Você deve manter os dedos dos pés ativos no tatame para evitar cair para trás.',
              'Segure a lapela com firmeza para raspar no final do round.',
              'Coloque a canela no joelho para evitar a esgrima cruzada.',
              'Ele me finalizou por não ouvir a recomendação técnica.'
            ],
            correctAnswer: '0',
            explanation: '"Active toes" refere-se a mola ou pés ativamente apoiados na lona, garantindo centro de gravidade firme.'
          },
          {
            id: 'ex_b_q3',
            type: 'speaking',
            question: 'Fale em inglês a frase tática: "My favorite pass is the knee cut."',
            correctAnswer: "My favorite pass is the knee cut.",
            explanation: 'Demonstrar sua preferência de passagem de forma curta e assertiva com o coach.'
          }
        ]
      }
    }
  ]
};
