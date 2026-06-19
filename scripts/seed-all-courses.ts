import { PrismaClient } from '@prisma/client';

async function seedAllCourses() {
  console.log("🥋 [COURSE DATABASE SEED] Starting comprehensive load of 20 English & BJJ modules...");
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    
    // Clear old course data to ensure a fresh, consistent, non-conflicting slate
    console.log("🧹 Clearing existing course records...");
    await prisma.courseExamAttempt.deleteMany({});
    await prisma.courseLessonProgress.deleteMany({});
    await prisma.courseExamQuestion.deleteMany({});
    await prisma.courseExam.deleteMany({});
    await prisma.courseQuizQuestion.deleteMany({});
    await prisma.courseFlashcard.deleteMany({});
    await prisma.courseLesson.deleteMany({});
    await prisma.courseModule.deleteMany({});

    console.log("🌱 Inserting 20 BJJ English course modules with lessons, quizzes, and exams...");

    for (let m = 1; m <= 20; m++) {
      const modId = `course_mod_${m}`;
      const beltName = m <= 4 ? "Faixa Branca (White Belt)" : 
                       m <= 8 ? "Faixa Azul (Blue Belt)" : 
                       m <= 12 ? "Faixa Roxa (Purple Belt)" : 
                       m <= 16 ? "Faixa Marrom (Brown Belt)" : "Faixa Preta (Black Belt)";
      
      const module = await prisma.courseModule.create({
        data: {
          id: modId,
          title: `English Mastery - Módulo ${String(m).padStart(2, '0')}`,
          slug: `english-mastery-modulo-${m}`,
          description: `Vocabulário especializado de Jiu-Jitsu, diálogos de tatame e termos de sobrevivência em inglês para atletas de ${beltName}.`,
          thumbnail: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&auto=format&fit=crop&q=80",
          coverImage: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&auto=format&fit=crop&q=80",
          order: m,
          estimatedHours: 8 + m,
          passingScore: 70,
          version: 1,
          isPublished: true,
          isArchived: false,
          createdBy: "system",
          updatedBy: "system"
        }
      });

      // Create Exam
      const examId = `course_exam_${m}`;
      const exam = await prisma.courseExam.create({
        data: {
          id: examId,
          moduleId: modId,
          title: `Avaliação Final do Módulo ${String(m).padStart(2, '0')}`,
          description: `Teste de proficiência linguística para validar seu aprendizado no Módulo ${m}. Passando com 70% você desbloqueia o próximo nível!`,
          passingScore: 70,
          version: 1,
          isPublished: true
        }
      });

      // Exam Questions
      const questionsData = [
        {
          id: `ex_q_${m}_1`,
          question: `Qual termo em inglês significa deter o ímpeto adversário esparramando o quadril para trás ao defender uma queda?`,
          optionA: "Sprawl",
          optionB: "Guard Pull",
          optionC: "Sweep",
          optionD: "Half Guard",
          correctAnswer: "A"
        },
        {
          id: `ex_q_${m}_2`,
          question: `Como traduzimos 'Esgrimar o braço' no vocabulário oficial internacional do Jiu-Jitsu?`,
          optionA: "To Underhook the arm",
          optionB: "To Push the arm",
          optionC: "To Lock the elbow",
          optionD: "To Posture up",
          correctAnswer: "A"
        },
        {
          id: `ex_q_${m}_3`,
          question: `Se o árbitro disser 'Combative', ele está ordenando que os atletas:`,
          optionA: "Lutem ativamente (evitem falta de combatividade)",
          optionB: "Parem a luta",
          optionC: "Voltem em pé",
          optionD: "Ajeitem o kimono",
          correctAnswer: "A"
        },
        {
          id: `ex_q_${m}_4`,
          question: `A finalização de estrangulamento pelas costas em inglês é amplamente conhecida como:`,
          optionA: "Rear Naked Choke (RNC)",
          optionB: "Guillotine Choke",
          optionC: "Armlock from the guard",
          optionD: "Triangle choke",
          correctAnswer: "A"
        },
        {
          id: `ex_q_${m}_5`,
          question: `Qual expressão descreve a batida de desistência de um lutador que bate três vezes no tatame?`,
          optionA: "Tap Out",
          optionB: "Break Down",
          optionC: "Roll On",
          optionD: "Stand Up",
          correctAnswer: "A"
        }
      ];

      for (const q of questionsData) {
        await prisma.courseExamQuestion.create({
          data: {
            id: q.id,
            examId: examId,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            points: 20,
            order: questionsData.indexOf(q) + 1
          }
        });
      }

      // Create 5 Lessons
      for (let l = 1; l <= 5; l++) {
        const lesId = `course_les_${m}_${l}`;
        const lesson = await prisma.courseLesson.create({
          data: {
            id: lesId,
            moduleId: modId,
            title: `Aula ${String(l).padStart(2, '0')}: Diálogos de Tatame & Técnicas ${l}`,
            slug: `aula-${l}-diatlogos-competitivos-${m}`,
            description: `Aprenda frases essenciais e explicações técnicas detalhadas para uso em seminários e academias gringas.`,
            thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
            videoType: "youtube",
            videoSource: l % 2 === 0 ? "dQw4w9WgXcQ" : "Wt_RyWErotc",
            audioType: "external",
            audioSource: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            lessonContent: `Nesta aula especial ${l} do Módulo ${m}, focaremos na correta pronúncia de termos como "closed guard", "side control", "knee on belly" e "mount position". Pratique o uso correspondente destas expressões ao passar a instrução ao parceiro.`,
            transcript: `Transcrição detalhada de apoio didático para a aula ${l} do módulo ${m}. Use para revisar termos em inglês.`,
            duration: "10:30",
            xpReward: 30,
            order: l,
            version: 1,
            isPublished: true,
            isArchived: false
          }
        });

        // Create Flashcard
        await prisma.courseFlashcard.create({
          data: {
            id: `course_fc_${m}_${l}`,
            lessonId: lesId,
            frontText: l === 1 ? "Como dizemos 'Raspagem' em inglês?" :
                       l === 2 ? "Como dizemos 'Passagem de Guarda'?" :
                       l === 3 ? "Como dizemos 'Postura'?" :
                       l === 4 ? "Como dizemos 'Estrangulamento'?" : "Como dizemos 'Chave de Braço'?",
            backText: l === 1 ? "Sweep" :
                      l === 2 ? "Guard Pass" :
                      l === 3 ? "Posture" :
                      l === 4 ? "Choke" : "Armbar",
            order: 1
          }
        });

        // Create Quiz Question
        await prisma.courseQuizQuestion.create({
          data: {
            id: `course_quiz_q_${m}_${l}`,
            lessonId: lesId,
            question: l === 1 ? "Qual das seguintes descreve 'To Sweep'?" :
                      l === 2 ? "O que significa 'Underhook'?" :
                      l === 3 ? "Complete a frase: 'Always keep your ... when inside their guard.'" :
                      l === 4 ? "Como dizemos bater de desistência?" : "Knee on Belly se traduz como:",
            optionA: l === 1 ? "Raspagem (gira por baixo invertendo posição)" :
                     l === 2 ? "Esgrimar" :
                     l === 3 ? "posture (postura)" :
                     l === 4 ? "Tap out" : "Joelho na barriga",
            optionB: l === 1 ? "Finalização" :
                     l === 2 ? "Dar tapinha" :
                     l === 3 ? "hips (quadril)" :
                     l === 4 ? "Sprawl" : "Mão na cabeça",
            optionC: l === 1 ? "Passagem" :
                     l === 2 ? "Raspar" :
                     l === 3 ? "guard (guarda)" :
                     l === 4 ? "Pull" : "Sentar no tronco",
            optionD: l === 1 ? "Queda" :
                     l === 2 ? "Chutar" :
                     l === 3 ? "feet (pés)" :
                     l === 4 ? "Stand" : "Pegada falsa",
            correctAnswer: "A",
            explanation: "As alternativas corretas foram mapeadas com a opção A como gabarito padrão para esta carga didática.",
            points: 10,
            order: 1
          }
        });
      }
      console.log(`   → Módulo ${m} criado e populado.`);
    }

    console.log("🚀 [COURSE DATABASE SEED SUCCESS] All 20 modules and resources are loaded into PostgreSQL!");
  } catch (err: any) {
    console.error("❌ Error running course seed:", err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

seedAllCourses();
