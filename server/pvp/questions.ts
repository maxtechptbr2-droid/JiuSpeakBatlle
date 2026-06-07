import { getPrisma } from "../db";

export interface BJJQuestion {
  id: string;
  text: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
}

export const bjjQuestionsPool: BJJQuestion[] = [
  {
    id: "q1",
    text: "Qual é a pontuação oficial recebida por uma passagem de guarda bem-sucedida e estabilizada por 3 segundos de acordo com as regras da IBJJF?",
    category: "Regras IBJJF",
    difficulty: "EASY",
    optionA: "2 pontos",
    optionB: "3 pontos",
    optionC: "4 pontos",
    optionD: "1 ponto e uma vantagem",
    correctOption: "B",
    explanation: "A passagem de guarda pura vale 3 pontos de acordo com a tabela oficial de regras da IBJJF."
  },
  {
    id: "q2",
    text: "Quantos pontos são atribuídos a um lutador que alcança e estabiliza a posição de montada?",
    category: "Regras IBJJF",
    difficulty: "EASY",
    optionA: "2 pontos",
    optionB: "3 pontos",
    optionC: "4 pontos",
    optionD: "5 pontos",
    correctOption: "C",
    explanation: "A montada sólida por mais de 3 segundos confere 4 pontos na tabela da IBJJF."
  },
  {
    id: "q3",
    text: "Quem é conhecido na história do Jiu-Jitsu brasileiro como a figura japonesa que ensinou o jiu-jitsu japonês tradicional à família Gracie no Pará?",
    category: "História",
    difficulty: "MEDIUM",
    optionA: "Mitsuyo Maeda (Conde Koma)",
    optionB: "Jigoro Kano",
    optionC: "Masahiko Kimura",
    optionD: "Rickson Gracie",
    correctOption: "A",
    explanation: "Mitsuyo Maeda, conhecido como Conde Koma, fixou-se no estado do Pará e ensinou as técnicas iniciais de luta a Carlos Gracie."
  },
  {
    id: "q4",
    text: "Qual raspagem é famosa por envolver o domínio de uma das mangas e da calça do oponente, usando os joelhos flexionados no peito para arremessá-lo de lado?",
    category: "Posições & Guarda",
    difficulty: "EASY",
    optionA: "Raspagem De la Riva",
    optionB: "Raspagem da Tesoura (Scissor Sweep)",
    optionC: "Raspagem de Helicóptero",
    optionD: "Tornado Sweep",
    correctOption: "B",
    explanation: "A raspagem de tesoura é um clássico de guarda fechada onde as canelas agem em tesoura controlando manga e calça."
  },
  {
    id: "q5",
    text: "Ao encaixar um estrangulamento Ezequiel (Ezekiel Choke) clássico, de onde provém a alavanca principal executada pelas mãos?",
    category: "Finalizações",
    difficulty: "MEDIUM",
    optionA: "Do uso da força pura sobre a traqueia",
    optionB: "Da inserção da mão por dentro da própria manga do seu kimono",
    optionC: "Do fechamento de pernas em triângulo",
    optionD: "Do estiramento das lapelas cruzadas do oponente",
    correctOption: "B",
    explanation: "O Ezequiel clássico utiliza o apoio de enfiar quatro dedos dentro da própria manga do kimono para travar e deslizar a outra mão sob o pescoço."
  },
  {
    id: "q6",
    text: "Nas regras oficiais da IBJJF para faixas pretas adultos, qual das seguintes finalizações é estritamente PROIBIDA sob pena de desclassificação imediata?",
    category: "Regras IBJJF",
    difficulty: "HARD",
    optionA: "Mão de Vaca (Wrist lock)",
    optionB: "Chave de Calcanhar (Heel Hook) em lutas COM kimono",
    optionC: "Triângulo de Mão (Anaconda choke)",
    optionD: "Chave de Joelho Reta (Kneebar)",
    correctOption: "B",
    explanation: "Chave de calcanhar é proibida em lutas oficiais de kimono de todas as graduações na IBJJF."
  },
  {
    id: "q7",
    text: "Qual dos seguintes lendários lutadores detém a ilustre reputação invicta de ter finalizado todas as suas lutas de campeonato mundial como faixa preta?",
    category: "Curiosidades & Lendas",
    difficulty: "MEDIUM",
    optionA: "Roger Gracie",
    optionB: "Marcus Buchecha",
    optionC: "Marcelinho Garcia",
    optionD: "Leandro Lo",
    correctOption: "A",
    explanation: "No Mundial de 2009, Roger Gracie finalizou todos os seus adversários no peso e absoluto de faixa preta em um feito histórico."
  },
  {
    id: "q8",
    text: "O que caracteriza a posição chamada de guarda 'De la Riva', criada pelo mestre Ricardo De la Riva?",
    category: "Posições & Guarda",
    difficulty: "EASY",
    optionA: "Um gancho envolvendo a perna externa do oponente por fora",
    optionB: "Um triângulo trancado na cintura",
    optionC: "O controle das duas lapelas por baixo das pernas do oponente",
    optionD: "O abraço de cabeça e braço simultaneamente",
    correctOption: "A",
    explanation: "A guarda De la Riva é definida pelo uso da perna como um gancho circulando a coxa externa por fora, enquanto segura o calcanhar correspondente."
  },
  {
    id: "q9",
    text: "Quantos graus (stripes) no total recebe um faixa preta antes de ser promovido à faixa Coral (Vermelha e Preta)?",
    category: "Graduação",
    difficulty: "HARD",
    optionA: "5 graus",
    optionB: "6 graus",
    optionC: "7 graus",
    optionD: "4 graus",
    correctOption: "B",
    explanation: "O faixa preta recebe até 6 graus de graduação. Ao alcançar o 7º grau, recebe a Faixa Coral Vermelha e Preta."
  },
  {
    id: "q10",
    text: "Na pontuação de lutas, se um lutador tenta uma finalização encaixada e o oponente escapa com extremo perigo real de bater, o atacante recebe:",
    category: "Regras IBJJF",
    difficulty: "MEDIUM",
    optionA: "2 pontos de queda",
    optionB: "Uma vantagem (advantage)",
    optionC: "1 ponto de punição para o defensor",
    optionD: "A vitória imediata por pontos acumulados",
    correctOption: "B",
    explanation: "Ataques de finalização reais que colocam o adversário em situação clara e imediata de submissão pontuam como vantagem."
  }
];

// Seed in Prisma DB if database active
export async function seedQuestionsInDb() {
  try {
    const prisma = getPrisma();
    if (!prisma) return;

    const count = await prisma.pvpQuestion.count();
    if (count === 0) {
      console.log("🌱 Semeando banco de dados com perguntas de BJJ de alta fidelidade...");
      for (const q of bjjQuestionsPool) {
        await prisma.pvpQuestion.upsert({
          where: { id: q.id },
          update: {
            text: q.text,
            category: q.category,
            difficulty: q.difficulty,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
            explanation: q.explanation,
            isActive: true
          },
          create: {
            id: q.id,
            text: q.text,
            category: q.category,
            difficulty: q.difficulty,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
            explanation: q.explanation,
            isActive: true
          }
        });
      }
      console.log("🌱 Semeadura de perguntas PVP finalizada.");
    }
  } catch (err) {
    console.error("Erro ao semear perguntas no banco:", err);
  }
}
