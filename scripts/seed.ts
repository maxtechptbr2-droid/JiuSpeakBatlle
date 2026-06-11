import { prisma, assertDatabaseConnection } from "../server/db";
import { seedInitialUsers, seedStoreProducts } from "../server/authStore";
import { seedQuestionsInDb } from "../server/pvp/questions";
import * as fs from "fs";
import * as path from "path";

// Mutex lock file path to prevent concurrent seeder executions
const LOCK_FILE = path.join(process.cwd(), ".seed.lock");

const inMemoryAcademyModules = [
  { id: "mod_white", title: "White Belt Foundations", description: "Aprenda os fundamentos do Brazilian Jiu-Jitsu enquanto desenvolve seu inglês técnico.", beltLevel: "WHITE", orderIndex: 1, active: true },
  { id: "mod_blue", title: "Blue Belt Path - Guard Passing & Defense", description: "Aprofunde na passagem de guarda, finalizações avançadas e nomenclaturas em inglês de alto nível.", beltLevel: "BLUE", orderIndex: 2, active: true },
  { id: "mod_purple", title: "Purple Belt Tactics - Submissions & Transitions", description: "Conecte transições e domine termos técnicos e termos de arbitragem internacional.", beltLevel: "PURPLE", orderIndex: 3, active: true },
  { id: "mod_brown", title: "Brown Belt Dominance - Pressure & Submissions", description: "Aperfeiçoe sua pressão de quadril e seu vocabulário de coaching internacional.", beltLevel: "BROWN", orderIndex: 4, active: true },
  { id: "mod_black", title: "Black Belt Mastery - Leadership & Strategy", description: "Explore táticas de campeonato internacional, liderança, técnicas avançadas e mentoria de alta performance.", beltLevel: "BLACK", orderIndex: 5, active: true }
];

const inMemoryAcademyLessons = [
  { id: "less_white_1", moduleId: "mod_white", title: "Introdução ao BJJ", description: "BJJ Fundamentals for Beginners - Conceitos fundamentais de postura, base e alavancas.", youtubeUrl: "https://www.youtube.com/watch?v=Wt_RyWErotc", xpReward: 100, orderIndex: 1 },
  { id: "less_white_2", moduleId: "mod_white", title: "Defesa Pessoal Básica", description: "Postura contra agressão, saídas de gravata e defesa de golpes no chão.", youtubeUrl: "https://www.youtube.com/watch?v=BWB1R3SdAyk", xpReward: 100, orderIndex: 2 },
  { id: "less_white_3", moduleId: "mod_white", title: "Guarda Fechada", description: "Closed Guard Basics - Como manter seu oponente sob controle de postura.", youtubeUrl: "https://www.youtube.com/watch?v=2U5fREK9W5I", xpReward: 100, orderIndex: 3 },
  { id: "less_white_4", moduleId: "mod_white", title: "Armbar", description: "BJJ Armbar for Beginners - Alavanca clássica partindo do controle fechado.", youtubeUrl: "https://www.youtube.com/watch?v=9_jGszL3j9o", xpReward: 100, orderIndex: 4 },
  { id: "less_white_5", moduleId: "mod_white", title: "Triangle Choke", description: "Triangle Choke Fundamentals - Estrangulamento clássico usando as pernas.", youtubeUrl: "https://www.youtube.com/watch?v=R9_mGka2yYg", xpReward: 100, orderIndex: 5 },
  { id: "less_white_6", moduleId: "mod_white", title: "Kimura", description: "Kimura from Closed Guard - Chave de ombro clássica de controle e submissão.", youtubeUrl: "https://www.youtube.com/watch?v=yW6WvA0hG2s", xpReward: 100, orderIndex: 6 },
  { id: "less_white_7", moduleId: "mod_white", title: "Escape da Montada", description: "Mount Escape BJJ - Saídas de Upa e Cotovelo sob forte pressão do montador.", youtubeUrl: "https://www.youtube.com/watch?v=Xh0l07f607g", xpReward: 100, orderIndex: 7 },
  { id: "less_white_8", moduleId: "mod_white", title: "Side Control Escape", description: "Side Control Escape Basics - Criação de frames, pontes e reposição completa.", youtubeUrl: "https://www.youtube.com/watch?v=P_V6XNfHIs0", xpReward: 100, orderIndex: 8 },
  { id: "less_white_9", moduleId: "mod_white", title: "Guard Pass", description: "Guard Passing Fundamentals - Postura por cima e abertura de joelhos ativa.", youtubeUrl: "https://www.youtube.com/watch?v=X-8v_Y9rQzU", xpReward: 100, orderIndex: 9 },
  { id: "less_white_10", moduleId: "mod_white", title: "White Belt Final Challenge", description: "Exame teórico cobrando 20 questões fundamentais de jiu-jitsu e vocabulário em inglês.", youtubeUrl: "https://www.youtube.com/watch?v=vAg_m9X_qK0", xpReward: 100, orderIndex: 10 },

  { id: "less_blue_1", moduleId: "mod_blue", title: "Knee Slide Guard Pass", description: "Como cruzar o joelho com velocidade, esgrima forte de tronco e estabilização nos 100kg.", youtubeUrl: "https://www.youtube.com/watch?v=Y8Y52nswWAs", xpReward: 150, orderIndex: 1 },
  { id: "less_purple_1", moduleId: "mod_purple", title: "Berimbolo Tech & Concepts", description: "Entrada moderna rolando por baixo do quadril do oponente para expor e atacar as costas.", youtubeUrl: "https://www.youtube.com/watch?v=84G477f1f3A", xpReward: 200, orderIndex: 1 },
  { id: "less_brown_1", moduleId: "mod_brown", title: "Deep Half Guard Mastery", description: "Como se posicionar embaixo do centro de gravidade de adversários pesados e golpear raspagens.", youtubeUrl: "https://www.youtube.com/watch?v=7hR9qgI0jhs", xpReward: 250, orderIndex: 1 },
  { id: "less_black_1", moduleId: "mod_black", title: "Leglock Defense & Counters", description: "Aprenda rotas de liberação da linha de joelho e saídas seguras do sela/ashi garami.", youtubeUrl: "https://www.youtube.com/watch?v=QfJbAtW1v_A", xpReward: 300, orderIndex: 1 }
];

async function seedAcademyInDb() {
  console.log("🌱 [SEED MODULE: ACADEMY] Iniciando semeamento de módulos e lições no banco...");
  try {
    const existing = await prisma.academyModule.count();
    if (existing > 0) {
      console.log("✓ [SEED MODULE: ACADEMY] Encontrado módulos existentes. Ignorando...");
      return;
    }
    for (const mod of inMemoryAcademyModules) {
      const createdMod = await prisma.academyModule.create({
        data: {
          id: mod.id,
          title: mod.title,
          description: mod.description,
          beltLevel: mod.beltLevel,
          orderIndex: mod.orderIndex,
          active: mod.active
        }
      });
      console.log(`  └ Módulo adicionado: ${mod.title}`);
      const modLessons = inMemoryAcademyLessons.filter(l => l.moduleId === mod.id);
      for (const les of modLessons) {
        await prisma.academyLesson.create({
          data: {
            id: les.id,
            moduleId: createdMod.id,
            title: les.title,
            description: les.description,
            youtubeUrl: les.youtubeUrl,
            xpReward: les.xpReward,
            orderIndex: les.orderIndex
          }
        });
        console.log(`    ├ Lição adicionada: ${les.title}`);
      }
    }
    console.log("✓ [SEED MODULE: ACADEMY] Concluído semeamento com sucesso!");
  } catch (err: any) {
    console.error("✗ [SEED MODULE: ACADEMY ERROR] Falhou na carga do conteúdo academy:", err.message);
  }
}

async function runSeed() {
  console.log("==================================================");
  console.log("   JIUSPEAK ENTERPRISE CENTRALIZED DATABASE SEED   ");
  console.log("==================================================");

  // Acquire concurrency mutex lock
  if (fs.existsSync(LOCK_FILE)) {
    const stat = fs.statSync(LOCK_FILE);
    const mtime = stat.mtimeMs;
    const now = Date.now();
    // Force release lock older than 10 minutes as safety measure against aborted seeds
    if (now - mtime < 10 * 60 * 1000) {
      console.error(`✗ [CONCURRENCY SECURE EXCEPTION] Uma operação de seed já está em andamento (Lock: ${LOCK_FILE}).`);
      process.exit(1);
    }
  }

  // Create Lock
  fs.writeFileSync(LOCK_FILE, String(Date.now()));

  try {
    // Assert DB Connection
    const connected = await assertDatabaseConnection();
    if (!connected) {
      console.error("✗ [SEED FATAL] Conexão com o banco de dados PostgreSQL indisponível. Abortando seed.");
      fs.unlinkSync(LOCK_FILE);
      process.exit(1);
    }

    console.log("⏳ [1/5] Semeando Usuários Administrativos...");
    await seedInitialUsers(true);

    console.log("⏳ [2/5] Semeando Planos e Metadados SaaS...");
    // Let's run robust plan seeds directly here to evade imports circularities
    await prisma.plan.upsert({
      where: { id: "plan-free-id" },
      update: {
        name: "FREE",
        description: "Acesso a conteúdos básicos de Jiu-Jitsu, fórum comum e testes elementares.",
        priceBRL: 0.00,
        interval: "monthly",
        features: ["Acesso a conteúdos básicos", "Fórum comum", "Perfil básico de jiu-jitsu"],
        active: true
      },
      create: {
        id: "plan-free-id",
        name: "FREE",
        description: "Acesso a conteúdos básicos de Jiu-Jitsu, fórum comum e testes elementares.",
        priceBRL: 0.00,
        interval: "monthly",
        features: ["Acesso a conteúdos básicos", "Fórum comum", "Perfil básico de jiu-jitsu"],
        active: true
      }
    });

    await prisma.plan.upsert({
      where: { id: "plan-pro-id" },
      update: {
        name: "VIP",
        description: "VIP Club Pass! Tenha acesso premium de alto nível para acelerar o seu aprendizado.",
        priceBRL: 29.90,
        interval: "monthly",
        features: ["2x XP multiplicador em pvp e lições", "Selo VIP de Atleta Verificado", "Cursos VIP exclusivos", "Mentor Inteligente IA (Gemini API)"],
        active: true
      },
      create: {
        id: "plan-pro-id",
        name: "VIP",
        description: "VIP Club Pass! Tenha acesso premium de alto nível para acelerar o seu aprendizado.",
        priceBRL: 29.90,
        interval: "monthly",
        features: ["2x XP multiplicador em pvp e lições", "Selo VIP de Atleta Verificado", "Cursos VIP exclusivos", "Mentor Inteligente IA (Gemini API)"],
        active: true
      }
    });

    await prisma.plan.upsert({
      where: { id: "plan-master-id" },
      update: {
        name: "MASTER",
        description: "Mestre Gracie Club! O nível supremo da arte suave para obter a faixa vermelha.",
        priceBRL: 49.90,
        interval: "monthly",
        features: ["Todos os cursos Premium liberados", "Kimono Imperial Digital Raro", "2000 JiuTickets de bônus imediato", "Canal exclusivo e relatórios de métricas avançadas"],
        active: true
      },
      create: {
        id: "plan-master-id",
        name: "MASTER",
        description: "Mestre Gracie Club! O nível supremo da arte suave para obter a faixa vermelha.",
        priceBRL: 49.90,
        interval: "monthly",
        features: ["Todos os cursos Premium liberados", "Kimono Imperial Digital Raro", "2000 JiuTickets de bônus imediato", "Canal exclusivo e relatórios de métricas avançadas"],
        active: true
      }
    });
    console.log("✓ Planos SaaS semeados.");

    console.log("⏳ [3/5] Semeando Catálogo de Produtos da Loja e Avatares Premium...");
    await seedStoreProducts();
    // Seed avatars directly to PostgreSQL using custom script loop to avoid complex file imports
    try {
      const BASE_CHARACTERS = [
        { id: "bjj_samurai", name: "Samurais da Arte Suave", description: "Design clássico do samurai moderno focado em defesa pessoal e estrangulamentos." },
        { id: "bjj_leao", name: "Leão de Quimono", description: "Representa a força de pressão do rei da selva nos tatames de competição." },
        { id: "bjj_pitbull", name: "Pitbull do Tatame", description: "A raça, agressividade e foco inabalável para atacar pernas e chaves de calcanhar." }
      ];
      const BELTS = [
        { key: "white", name: "Faixa Branca" },
        { key: "gray", name: "Faixa Cinza" },
        { key: "yellow", name: "Faixa Amarela" },
        { key: "orange", name: "Faixa Laranja" },
        { key: "green", name: "Faixa Verde" },
        { key: "blue", name: "Faixa Azul" },
        { key: "purple", name: "Faixa Roxa" },
        { key: "brown", name: "Faixa Marrom" },
        { key: "black", name: "Faixa Preta" },
        { key: "coral", name: "Faixa Coral" },
        { key: "red_black", name: "Faixa Vermelha e Preta" },
        { key: "red_white", name: "Faixa Vermelha e Branca" }
      ];
      for (const c of BASE_CHARACTERS) {
        for (const belt of BELTS) {
          let rarity = "COMMON";
          if (["yellow", "orange", "green", "blue"].includes(belt.key)) {
            rarity = "RARE";
          } else if (["purple", "brown"].includes(belt.key)) {
            rarity = "EPIC";
          } else if (["black", "coral", "red_black", "red_white"].includes(belt.key)) {
            rarity = "LEGENDARY";
          }

          let price = 400;
          switch (belt.key) {
            case "white": price = 400; break;
            case "gray": price = 500; break;
            case "yellow": price = 600; break;
            case "orange": price = 700; break;
            case "green": price = 800; break;
            case "blue": price = 1000; break;
            case "purple": price = 1500; break;
            case "brown": price = 2000; break;
            case "black": price = 3000; break;
            case "coral": price = 4000; break;
            case "red_black": price = 5000; break;
            case "red_white": price = 6000; break;
          }

          await prisma.storeProduct.upsert({
            where: { id: `prod_avatar_${c.id}_${belt.key}` },
            update: {
              name: `${c.name} (${belt.name})`,
              description: `${c.description} Especialidade: Nível de faixa ${belt.name}.`,
              priceJT: price,
              category: "AVATAR",
              rarity: rarity as any,
              imageUrl: `/api/avatars/render/${c.id}/${belt.key}`,
              active: true
            },
            create: {
              id: `prod_avatar_${c.id}_${belt.key}`,
              name: `${c.name} (${belt.name})`,
              description: `${c.description} Especialidade: Nível de faixa ${belt.name}.`,
              priceJT: price,
              category: "AVATAR",
              rarity: rarity as any,
              imageUrl: `/api/avatars/render/${c.id}/${belt.key}`,
              active: true
            }
          });
        }
      }
      console.log("✓ Avatares premium da loja semeados.");
    } catch (err: any) {
      console.error("✗ Erro de semeadura dos avatares premium: ", err.message);
    }

    console.log("⏳ [4/5] Semeando Banco de Perguntas PVP Arena...");
    await seedQuestionsInDb();

    console.log("⏳ [5/5] Semeando Portal Acadêmico (AcademyModules)...");
    await seedAcademyInDb();

    console.log("==================================================");
    console.log("🎉  SISTEMA JIUSPEAK SEMEADO COM ABSOLUTO SUCESSO! ");
    console.log("==================================================");
  } catch (error: any) {
    console.error("✗ [SEED ERROR] Ocorreu uma exceção crítica ao semear banco:", error);
  } finally {
    // Release mutex lock completely
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  }
}

runSeed();
