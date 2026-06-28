const CHALLENGE_THEMES = [
  'Closed Guard: Cross Collar Choke','Open Guard: De La Riva Sweeps','Spider Guard: Triangle Setup',
  'Butterfly Guard: Hook Sweep','Half Guard: Deep Half Entry','Lasso Guard: Omoplata Finish',
  'X-Guard: Leg Drag to Back','Rubber Guard: Mission Control','Worm Guard: Lapel Attacks',
  'Reverse De La Riva: Kiss of Dragon','Torreando Pass: Hip Control','Knee Slice Pass: Shoulder Pressure',
  'Leg Drag Pass: Back Take','Stack Pass: Neck Crank Defense','Over-Under Pass: Gripping Mechanics',
  'Smash Pass: Leg Weave','Bullfighter Pass: De La Riva Counter','Double Under Pass: Posture Break',
  'Triangle Choke: Hip Angle Adjustment','Rear Naked Choke: Finishing Details','Armbar from Mount: Hip Extension',
  'Kimura from Side Control','Guillotine Choke: High Elbow Finish','Bow and Arrow Choke: Belt Grip',
  'Clock Choke from Turtle Position','Omoplata: Shoulder Lock Mechanics','North-South Choke: Head Position',
  "D'Arce Choke: Arm Thread",'Anaconda Choke vs Turtle','Heel Hook: Inside vs Outside',
  'Toe Hold: Ankle Mechanics','Kneebar: Entry from Guard','Double Leg Takedown: Level Change',
  'Single Leg: Finish Options','Osoto Gari: Judo Throw Entry','Seoi Nage: Grip Breaking',
  'Uchi Mata: Inside Leg Trip','Guard Pull: Gripping Strategy','Ankle Pick: Timing and Setup',
  'Foot Sweep: Kuzushi','Mount: High vs Low Mount','Back Control: Seatbelt Grip',
  'Side Control: Scarf Hold vs Kesa Gatame','North-South: Transition Options','Turtle Control: Breakdown Entries',
  'Knee on Belly: Weight Distribution','IBJJF Rules: Points and Advantages','Referee Commands in Competition',
  'Weight Classes and Registration','Bracket Reading and Seeding','Stalling Penalties: Rules and Strategy',
  'Submission Only Format: EBI Rules','No-Gi Competition Differences','Absolute Division Strategy',
  'Podium Interview at World Championships','Medal Ceremony and Protocol','First Day at a BJJ Academy',
  'Asking for a Roll: Dojo Etiquette','Gi Care: Washing and Patch Rules','Belt Promotion Ceremony',
  'Open Mat Sparring Protocol','Drilling Partners: Giving Feedback','Injury on the Mat: Communication',
  'Asking Technical Questions to Coach','Training with Higher Belts','Tapping Out: Safety Communication',
  'Visiting a BJJ Academy Abroad','Training at Gracie Barra HQ','Attending an IBJJF Pan Championship',
  'BJJ Camp in Brazil: Daily Routine','Training with Japanese Black Belts','Seminar with a World Champion',
  'Airport and Gi Check-in for Tournaments','Team Dinner Before Competition','Weight Cutting for Competition',
  'Injury Prevention: Finger Taping','Physical Therapy After Mat Injury','Nutrition Strategy for Grapplers',
  'Strength and Conditioning for BJJ','Recovery Between Training Sessions','Mental Preparation: Visualization',
  'Warm-up Routine Before Rolling','Gracie Family and BJJ Origins','Helio Gracie vs Masahiko Kimura',
  'BJJ in MMA: UFC and Royce Gracie','Evolution of the Guard Game','Leg Locks Revolution: John Danaher',
  'Gordon Ryan: Modern Submission Grappling','ADCC Rules and Prestige','Marcelo Garcia: Guard Pulling Genius',
  'Opening a BJJ School: First Steps','Teaching Kids BJJ Classes',"Women's BJJ: Growing the Sport",
  'Online BJJ Coaching Setup','Sponsorship in BJJ: How to Approach',
];

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getOrCreateDailyChallenge(
  prisma: any,
  userId: string,
  userBelt: string,
  userLevel: number,
  _openaiKey: string
): Promise<any> {
  const today = getTodayString();

  const existing = await prisma.dailyChallenge.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  if (existing) return existing;

  const history = await prisma.dailyChallengeHistory.findMany({
    where: { userId },
    select: { theme: true },
    orderBy: { date: 'desc' },
  });
  const usedThemes = new Set(history.map((h: any) => h.theme));
  const available = CHALLENGE_THEMES.filter(t => !usedThemes.has(t));
  const pool = available.length > 0 ? available : CHALLENGE_THEMES;
  const theme = pool[Math.floor(Math.random() * pool.length)];

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY não configurada.');

  const content = await generateChallengeContentClaude(theme, userBelt, userLevel, anthropicKey);

  const challenge = await prisma.$transaction(async (tx: any) => {
    const created = await tx.dailyChallenge.create({
      data: {
        userId, date: today, theme,
        beltContext: userBelt || 'WHITE',
        levelContext: userLevel || 1,
        vocabulary: JSON.stringify(content.vocabulary),
        phrase:     JSON.stringify(content.phrase),
        dialogue:   JSON.stringify(content.dialogue),
        quiz:       JSON.stringify(content.quiz),
        voiceTopic: content.voiceTopic,
      },
    });
    await tx.dailyChallengeHistory.create({ data: { userId, theme, date: today } });
    await tx.notification.create({
      data: {
        userId,
        title: '🥋 Novo Desafio do Dia!',
        content: `Seu desafio de hoje é sobre "${theme}". Complete as 5 seções e ganhe até 240 XP!`,
        type: 'DAILY_CHALLENGE',
        isRead: false,
        linkTo: 'daily-challenge',
      },
    });
    return created;
  });

  return challenge;
}

async function generateChallengeContentClaude(
  theme: string, belt: string, level: number, apiKey: string
): Promise<any> {
  const beltLabel: Record<string, string> = {
    WHITE: 'White Belt', BLUE: 'Blue Belt', PURPLE: 'Purple Belt',
    BROWN: 'Brown Belt', BLACK: 'Black Belt',
  };
  const beltName = beltLabel[(belt || 'WHITE').toUpperCase()] || 'White Belt';

  const prompt = `You are a world-class BJJ English coach creating a highly specific daily challenge for a Brazilian ${beltName} (Level ${level}) student learning English for Jiu-Jitsu.

Today's BJJ theme: "${theme}"

CRITICAL RULES:
- Every vocabulary word must be a real BJJ technical term used on the mat, in competition, or in BJJ culture
- The dialogue must be a realistic conversation that could happen at a BJJ gym, tournament, or seminar
- Quiz questions must test BJJ-specific English knowledge directly related to the theme
- NO generic English — everything must be grounded in real Jiu-Jitsu situations

Respond ONLY with a valid JSON object. No markdown, no code blocks. Start with { end with }.

{"vocabulary":[{"word":"string","translation":"string in Portuguese","example":"string BJJ sentence","pronunciation":"string"},{"word":"string","translation":"string","example":"string","pronunciation":"string"},{"word":"string","translation":"string","example":"string","pronunciation":"string"},{"word":"string","translation":"string","example":"string","pronunciation":"string"},{"word":"string","translation":"string","example":"string","pronunciation":"string"}],"phrase":{"english":"string BJJ phrase","portuguese":"string","pronunciation_tip":"string","context":"string BJJ context"},"dialogue":[{"role":"Coach","text":"string","translation":"string"},{"role":"Athlete","text":"string","translation":"string"},{"role":"Coach","text":"string","translation":"string"},{"role":"Athlete","text":"string","translation":"string"},{"role":"Coach","text":"string","translation":"string"}],"quiz":[{"question":"string","options":["A: string","B: string","C: string","D: string"],"correct":"A","explanation":"string"},{"question":"string","options":["A: string","B: string","C: string","D: string"],"correct":"B","explanation":"string"},{"question":"string","options":["A: string","B: string","C: string","D: string"],"correct":"C","explanation":"string"}],"voiceTopic":"string BJJ speaking scenario"}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json() as any;
  const raw = data?.content?.[0]?.text || '';
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Falha ao parsear resposta da IA: ${clean.substring(0, 200)}`);
  }
}

export async function completeChallengeSection(
  prisma: any,
  challengeId: string,
  userId: string,
  section: 'vocabulary' | 'phrase' | 'dialogue' | 'quiz' | 'voice'
): Promise<{ xpGained: number; allDone: boolean }> {
  const challenge = await prisma.dailyChallenge.findFirst({ where: { id: challengeId, userId } });
  if (!challenge) throw new Error('Desafio não encontrado');

  const xpMap: Record<string, number> = { vocabulary: 20, phrase: 15, dialogue: 25, quiz: 30, voice: 50 };
  const fieldMap: Record<string, string> = {
    vocabulary: 'completedVocabulary', phrase: 'completedPhrase',
    dialogue: 'completedDialogue', quiz: 'completedQuiz', voice: 'completedVoice',
  };

  const xpGained = xpMap[section];
  const field = fieldMap[section];
  if (challenge[field]) return { xpGained: 0, allDone: false };

  const updated = await prisma.dailyChallenge.update({
    where: { id: challengeId },
    data: { [field]: true, xpAwarded: { increment: xpGained } },
  });

  await prisma.user.update({ where: { id: userId }, data: { xp: { increment: xpGained } } });

  const allDone = updated.completedVocabulary && updated.completedPhrase &&
    updated.completedDialogue && updated.completedQuiz && updated.completedVoice;

  if (allDone && !challenge.completedAt) {
    await prisma.$transaction([
      prisma.dailyChallenge.update({ where: { id: challengeId }, data: { completedAt: new Date() } }),
      prisma.user.update({ where: { id: userId }, data: { xp: { increment: 100 } } }),
      prisma.notification.create({
        data: {
          userId,
          title: '🏆 Desafio do Dia Completo!',
          content: 'Incrível! Você completou todas as 5 seções e ganhou +240 XP!',
          type: 'DAILY_CHALLENGE', isRead: false, linkTo: 'daily-challenge',
        },
      }),
    ]);
  }

  return { xpGained, allDone };
}
