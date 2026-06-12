import { Belt } from './index';

export const blackBeltData: Belt = {
  id: 'belt_black',
  name: 'Preto',
  slug: 'black-belt',
  level: 'Global Business & Mastery',
  themeColor: 'zinc',
  colorClass: 'from-zinc-900 via-zinc-950 to-black border-red-600 text-red-500',
  description: 'Negócios & Autoridade Global. Domine a condução de seminários remunerados, assinatura de termos de afiliação de academias no exterior (Licensing Contracts) e marketing digital voltado a lutadores profissionais de MMA e BJJ.',
  unlockRequirement: 'Requer nível 20 ou 2000 XP acumulado nas faixas anteriores.',
  modules: [
    {
      id: 'mod_black_1',
      title: 'Seminários Internacionais & Negócios Esportivos',
      description: 'Como faturar em dólares americanos com sua história e precisão metodológica técnica.',
      slug: 'seminars-and-business',
      order: 1,
      missions: [
        {
          id: 'miss_black_1_1',
          title: 'Fechando Contratos de Seminários via E-mail/WhatsApp',
          slug: 'closing-seminars',
          description: 'Aprenda expressões para determinar remuneração (Seminar fee, SPLIT, guarantees) e planeje logísticas de viagens esportivas.',
          xpReward: 350,
          jtReward: 120,
          difficulty: 'Mestre',
          order: 1,
          steps: [
            {
              id: 'bk_step_1',
              type: 'intro',
              title: 'Faixa Preta - O Negócio Global',
              description: 'O faixa preta maduro alcança a maestria unindo técnica e finanças. Fechar seminários bem-sucedidos em euros ou dólares exige domínio contratual profissional. Aprenda a negociar termos logísticos (visto, passagem, hotel) e estruturas de divisão de lucros com clareza mercantil.',
              content: {
                bannerImage: 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=800',
                tips: [
                  'Flat Fee: Taxa de honorário fixo pré-estabelecido pelo dia ou seminário.',
                  'Split deal / 60-40 split: Divisão percentual de ingressos vendidos (geralmente 60% para o palestrante, 40% para a academia anfitriã).',
                  'Affiliation Fee: Mensalidade de afiliação ou licenciamento de marca Gracie / Equipe.',
                  'Waiver of liability: Termo de isenção de responsabilidade médica e civil obrigatório assinado por alunos antes de iniciarem práticas físicas.'
                ]
              }
            },
            {
              id: 'bk_step_2',
              type: 'dialogue',
              title: 'Negociando Divisões de Lucro com Dono de Academia',
              description: 'Analise e interaja na troca de e-mails táticos com um empresário esportivo de Miami.',
              content: {
                dialogue: [
                  { speaker: 'Gym Owner (EUA)', textEN: 'We are excited to host you. What is your flat fee for a 3-hour seminar, or do you prefer a split?', textPT: 'Estamos empolgados em recebê-lo. Qual é a sua taxa fixa para um seminário de 3 horas ou você prefere divisão?' },
                  { speaker: 'Você (Professor)', textEN: 'I offer a flat fee of $1500 USD, or a 70-30 split on ticket sales with a $500 minimum guarantee.', textPT: 'Ofereço taxa fixa de $1500 USD ou divisão de 70-30 nas vendas de ingressos com garantia mínima de $500.' },
                  { speaker: 'Gym Owner (EUA)', textEN: 'The flat fee works for us. We will cover flights and hotel lodging. Deal.', textPT: 'O valor fixo funciona para nós. Nós cobriremos passagens aéreas e hotel. Fechado.' }
                ]
              }
            },
            {
              id: 'bk_step_3',
              type: 'reward',
              title: 'Autoridade Internacional Confirmada!',
              description: 'Excepcional! Você chegou ao nível do Black Belt Business, pronto para monetizar sua arte no mundo inteiro.',
              content: {
                xpEarned: 350,
                jtEarned: 120,
                badgeId: 'black_belt_deals_closed'
              }
            }
          ]
        }
      ],
      exam: {
        id: 'exam_black_1',
        moduleId: 'mod_black_1',
        title: 'Exame de Graduação - Faixa Preta (Seminários & Licenciamentos)',
        passingScore: 85,
        questions: [
          {
            id: 'ex_bk_q1',
            type: 'multiple_choice',
            question: 'Em termos contratuais de seminários, o que representa um "Waiver of liability"?',
            options: [
              'Uma taxa fixa cobrada por hora de palestra.',
              'Um termo de desoneração de responsabilidade médica/jurídica assinado pelos alunos.',
              'Um comprovante de embarque aéreo internacional.',
              'Uma premiação em dinheiro por finalizações realizadas.'
            ],
            correctAnswer: '1',
            explanation: 'O "Waiver of liability" serve para resguardar legalmente a academia de eventuais lesões físicas durante a prática.'
          },
          {
            id: 'ex_bk_q2',
            type: 'listening',
            question: 'Escute a proposta de negócio internacional e selecione a tradução exata:',
            audioPhrase: "We agree on a 70-30 split with a one thousand dollar minimum guarantee.",
            options: [
              'Concordamos com uma divisão de 70-30 com garantia mínima de mil dólares.',
              'Nós queremos pagar apenas a taxa fixa de quinhentos dólares.',
              'Os custos de hospedagem e translado serão pagos integralmente pela organização.',
              'Seu seminário de três horas foi cancelado por problemas de documentação e visto.'
            ],
            correctAnswer: '0',
            explanation: '"Split" refere-se à taxa de divisão de lucros de ingressos, e "one thousand dollar minimum guarantee" é a garantia mínima de $1000 USD.'
          },
          {
            id: 'ex_bk_q3',
            type: 'speaking',
            question: 'Fale de forma proeminente em inglês: "Our school requires a signed waiver from all seminar attendees."',
            correctAnswer: "Our school requires a signed waiver from all seminar attendees.",
            explanation: 'Esclarecer as regras do seminário é dever ético e mercantil do Mestre (Black Belt).'
          }
        ]
      }
    }
  ]
};
