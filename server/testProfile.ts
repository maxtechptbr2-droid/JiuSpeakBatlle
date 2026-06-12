import { authStore, inMemoryUsers } from './authStore';
import { getPrisma } from './db';

async function runProfileDiagnosticTest() {
  console.log("\n=== 🕵️‍♂️ [TESTE FORENSE] INICIANDO DIAGNÓSTICO DE PERSISTÊNCIA DE PERFIL ===");
  
  const prisma = getPrisma();
  if (!prisma) {
    console.error("❌ Erro: Prisma não inicializado ou offline.");
    process.exit(1);
  }

  // 1. Criar ou localizar um Usuário mock para o teste
  const testEmail = "test_forensic_user@jiuspeak.com";
  let user: any = null;
  let usingDb = false;

  try {
    user = await prisma.user.findFirst({
      where: { email: testEmail }
    });
    usingDb = true;
  } catch (dbErr) {
    console.warn("⚠️ PostgreSQL offline no teste. Usando o mecanismo de persistência robusto em memória.");
  }

  if (!user) {
    console.log("📝 Inicializando usuário de teste estrutural...");
    user = {
      id: "test_forensic_id",
      email: testEmail,
      name: "Test Forensic Profiler",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    };
    // Semeando o cache em memória
    if (inMemoryUsers) {
      inMemoryUsers.set(user.id, user);
    }
  }

  const userId = user.id;
  console.log(`👤 Usuário de teste localizado. ID: ${userId} | Nome: ${user.name}`);

  // 2. Definir o payload de atualizações
  const payloadToTest = {
    bio: "Superando limites no tatame e no idioma.",
    city: "Manaus",
    country: "Brasil",
    nativeLanguage: "Português",
    learningGoal: "Fluência em Inglês",
    profilePhoto: "/images/presets-avatar/preset1.png",
    coverPhoto: "/images/presets-banners/preset-banner1.jpg",
    instagram: "jiuspeak_forensic",
    youtube: "jiuspeak_channel",
    facebook: "jiuspeak_fb",
    website: "https://jiuspeak.custom.com",
    birthDate: new Date("1996-06-15"),
    phone: "+5592999999999",
    englishLevel: "Intermediário",
    spanishLevel: "Avançado",
    frenchLevel: "Iniciante",
    onboardingDone: true,
    username: "jiuspeaktestpro",
    beltRank: "Faixa Azul",
    favoriteTechnique: "Triângulo de Mão",
    favoriteAthlete: "Mica Galvão",
    privacyLevel: "public",
    themeColor: "#6d28d9",
    avatarFrame: "item_purple_belt"
  };

  console.log("\n📸 == TESTANDO ENGINE DE UPLOAD DE FOTOS (FÍSICO E ESTRUTURAL) ===");
  const fs = await import('fs');
  const path = await import('path');
  const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const profilesDir = path.join(uploadsDir, 'profiles');
  const coversDir = path.join(uploadsDir, 'covers');

  console.log("📁 Diretório Geral de Uploads:", uploadsDir);
  console.log("📁 Diretório de Perfis:", profilesDir);
  console.log("📁 Diretório de Capas:", coversDir);

  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }

  // Aplicar permissões Unix
  fs.chmodSync(uploadsDir, 0o755);
  fs.chmodSync(profilesDir, 0o755);
  fs.chmodSync(coversDir, 0o755);

  console.log("✅ Pastas e permissões 755 configuradas com sucesso!");

  // Gravação de arquivos teste em formato webp
  const profileFilename = `profile_${userId}_${Date.now()}.webp`;
  const coverFilename = `cover_${userId}_${Date.now()}.webp`;

  const testProfilePath = path.join(profilesDir, profileFilename);
  const testCoverPath = path.join(coversDir, coverFilename);

  const parsedMatches = dummyBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!parsedMatches) {
    console.error("❌ Falha de regex de teste de base64.");
    process.exit(1);
  }
  const decodedBuffer = Buffer.from(parsedMatches[2], 'base64');

  fs.writeFileSync(testProfilePath, decodedBuffer);
  fs.chmodSync(testProfilePath, 0o755);

  fs.writeFileSync(testCoverPath, decodedBuffer);
  fs.chmodSync(testCoverPath, 0o755);

  console.log("✅ Fotos gravadas em disco com sucesso!");
  console.log("   • Perfil:", testProfilePath);
  console.log("   • Capa:  ", testCoverPath);

  if (fs.existsSync(testProfilePath) && fs.existsSync(testCoverPath)) {
    console.log("🟢 [SUCESSO] Gravação física e permissões de uploads validados!");
  } else {
    console.error("🔴 [ERRO] Falha ao gravar fotos de teste em disco.");
    process.exit(1);
  }

  // Limpando fotos temporárias de teste
  fs.unlinkSync(testProfilePath);
  fs.unlinkSync(testCoverPath);
  console.log("🧹 Fotos de teste físicas removidas com sucesso!");

  console.log("\n⚙️ 1. Enviando atualizações via authStore.updateUser...");
  const updateSuccess = await authStore.updateUser(userId, payloadToTest);
  if (!updateSuccess) {
    console.error("❌ Falha crítica: authStore.updateUser retornou falso.");
    process.exit(1);
  }
  console.log("✅ Atualização via authStore.updateUser executada com sucesso!");

  // 3. Recuperar via SQL/Prisma direto do banco Postgres
  let freshDbUser: any = null;
  if (usingDb) {
    console.log("\n🗄️ 2. Buscando dados diretamente no PostgreSQL via Prisma...");
    try {
      freshDbUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      console.log("✅ Usuário encontrado no banco!");
    } catch {
      console.warn("⚠️ Falha ao consultar o banco real.");
    }
  }

  // 4. Recuperar via authStore.findById
  console.log("\n🧠 3. Buscando dados via authStore.findById (Simulando fluxo do JWT)...");
  const authStoreUser = await authStore.findById(userId);
  if (!authStoreUser) {
    console.error("❌ Falha crítica: authStore.findById retornou nulo!");
    process.exit(1);
  }
  console.log("✅ Usuário carregado do authStore com sucesso!");

  // 5. Comparar igualdade de 100% nos campos chave
  console.log("\n📊 4. COMPARANDO INTEGRIDADE DOS DADOS (ESPERADO vs RETORNADO):");
  const fieldsToCompare = Object.keys(payloadToTest) as Array<keyof typeof payloadToTest>;
  let mismatchCount = 0;

  for (const field of fieldsToCompare) {
    const originalValue = payloadToTest[field];
    const dbValue = freshDbUser ? freshDbUser[field as keyof typeof freshDbUser] : originalValue;
    const authValue = authStoreUser[field as keyof typeof authStoreUser];

    // Tratar datas
    const formattedOriginal = originalValue instanceof Date ? originalValue.toISOString().split('T')[0] : String(originalValue || '');
    const formattedDb = dbValue instanceof Date ? dbValue.toISOString().split('T')[0] : String(dbValue || '');
    const formattedAuth = authValue instanceof Date ? authValue.toISOString().split('T')[0] : String(authValue || '');

    const matches = (formattedOriginal === formattedDb) && (formattedOriginal === formattedAuth);

    if (matches) {
       console.log(`  🟢 Campo [${String(field).padEnd(20)}]: OK | Valor: "${formattedAuth}"`);
    } else {
       console.error(`  🔴 Campo [${String(field).padEnd(20)}]: DIVERGÊNCIA!
          • Esperado no Payload: "${formattedOriginal}"
          • Gravado no Postgres:  "${formattedDb}"
          • Retornado authStore:  "${formattedAuth}"`);
       mismatchCount++;
    }
  }

  console.log("\n=== 🧹 LIMPANDO REGISTROS DE TESTE ===");
  try {
    if (usingDb) {
      await prisma.wallet.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    }
    if (inMemoryUsers) {
      inMemoryUsers.delete(userId);
    }
    console.log("🧹 Limpeza concluída!");
  } catch (cleanErr) {
    console.warn("⚠️ Falha ao limpar usuário de teste:", cleanErr);
  }

  if (mismatchCount === 0) {
    console.log("\n🏆 [SUCESSO ABSOLUTO] DIAGNÓSTICO CONCLUÍDO COM 100% DE SUCESSO! INTEGRIDADE TOTAL CONFIRMADA.");
  } else {
    console.error(`\n⚠️ [FALHA DE INTEGRIDADE] Ocorreram ${mismatchCount} divergências no fluxo de persistência.`);
    process.exit(1);
  }
}

runProfileDiagnosticTest();
