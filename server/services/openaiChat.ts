import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Define Scenarios and partner voices
export interface Message {
  role: 'system' | 'user' | 'assistant';
  text: string;
  timestamp: string;
  translation?: string;
  pronunciationTips?: string;
  keyVocabulary?: string[];
  performanceAnalysis?: string;
  eloDelta?: number;
}

export interface ConversationSession {
  id: string;
  userId: string;
  scenario: 'competição' | 'seminário' | 'sparring' | 'viagem' | 'privada';
  partnerKey: 'thomas' | 'tyler' | 'yuki' | 'roberto' | 'john';
  partnerName: string;
  partnerVoice: string;
  history: Message[];
  createdAt: string;
  updatedAt: string;
}

const PARTNERS = {
  thomas: { name: "Thomas (USA)", voice: "onyx", description: "American Referee / Technical Coach. Speaks strictly, uses official tournament commands." },
  tyler: { name: "Tyler (Cali)", voice: "echo", description: "Chill California Blue Belt. Speaks in modern surf slang and open-mat dialogue." },
  yuki: { name: "Yuki (Tokyo)", voice: "fable", description: "Japanese BJJ black-belt visiting. Polite, but demands laser precision in positions." },
  roberto: { name: "Roberto (BJJ)", voice: "alloy", description: "Old school Brazilian professor based in London. Passionate and intense." },
  john: { name: "John (Austin)", voice: "nova", description: "Texas tough instructor. Direct, gravelly tone, focuses on underhooks and leverage." }
};

const SCENARIO_PROMPTS = {
  competição: `
You are {partnerName}, in an intense international BJJ Competition (IBJJF finals match).
The user is a competitor. You may act as either the strict tournament REFEREE demanding action or an aggressive rival.
Your English must feature tournament terms such as 'Combative!', 'Passage!', 'Sub Back!', 'Inside current guards!', 'Advantages and penalties', 'Sweep!', 'Disqualification' or 'Points registered!'.
Write realistic, short, urgent statements. Speak as if you're in a noisy stadium. Keep it professional but high-pressure.
  `,
  seminário: `
You are {partnerName}, a world-class guest champion conducting a highly detailed Seminar.
The user is a Seminar attendee asking questions or managing organization.
You speak about deep mechanics of complex sports positions: wedges, levers, mechanical margins for 'De la Riva guard', 'Lapel frames', 'Leg Weave passes', 'Spaghetti grips', or organizing logistically for seminar split fees (e.g. 70/30 splits or flat fees) and signed liability waivers.
Format your voice as a highly authoritative, welcoming, but sophisticated world-champion instructor.
  `,
  sparring: `
You are {partnerName}, rolling right now with the user inside a hard Sparring round.
The user is your sparring partner. You are both gasping and swapping technical threats.
Shout immediate technical cues like: 'Watch your collar!', 'Underhook me!', 'Sweep coming!', 'I\\'m going for the knee bar!', 'Post up!', 'Don\\'t let me pass your half guard!', 'Tap-out!'.
Speak with fatigue, passion, and quick-thinking tactical commentary on the fly.
  `,
  viagem: `
You are {partnerName}, the front-desk manager or senior coach at an ultra-exclusive BJJ Academy in California or Austin (e.g., Atos, AOJ, or Renzo Gracie's headquarters).
The user is a traveling foreign athlete checking in.
Discuss the mandatory white gi uniform policy, Day Pass rules (costs $50/day or $200/week), completing the online waiver, signing off the liability form, and explaining their belt lineage. Mention things like 'Mat cleanliness', 'Wash your belt!', 'BJJ Lineage', and 'Be ready by 6:00 AM sharp!'.
Speak politely but strictly.
  `,
  privada: `
You are {partnerName}, a high-level black belt booking or conducting an exclusive Private Lesson (1-on-1 coaching).
The user is the student.
Talk about customized drilling plans to fix their defensive gaps in Closed Guard/Spider Guard, posture alignment, rates ($150-$250 per hour), reservation deposits, calendar hours, and camera breakdowns of video footage.
Speak like a premium personal consultant who desires their rapid promotion.
  `
};

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("A chave OPENAI_API_KEY não está configurada no servidor.");
    }
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

// Local cache database helper file paths
const getCacheDir = () => path.join(process.cwd(), 'server', 'cache', 'conversations');

/**
 * Loads sessions array of a specific user.
 */
export function loadUserConversations(userId: string): ConversationSession[] {
  const dir = getCacheDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, `conversations_${userId}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as ConversationSession[];
  } catch (err) {
    console.error(`[CHAT HISTORY READ ERROR] Failed reading conversations for user ${userId}:`, err);
    return [];
  }
}

/**
 * Saves sessions array for a specific user.
 */
export function saveUserConversations(userId: string, sessions: ConversationSession[]): void {
  const dir = getCacheDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, `conversations_${userId}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[CHAT HISTORY WRITE ERROR] Failed saving conversations for user ${userId}:`, err);
  }
}

/**
 * Creates and boots a new luxurious conversation session.
 */
export async function createSession(
  userId: string,
  scenario: ConversationSession['scenario'],
  partnerKey: ConversationSession['partnerKey'],
  userProfile: { name: string; belt: string; elo: number; goal?: string }
): Promise<ConversationSession> {
  const partnerInfo = PARTNERS[partnerKey] || PARTNERS.thomas;
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const newSession: ConversationSession = {
    id: sessionId,
    userId,
    scenario,
    partnerKey,
    partnerName: partnerInfo.name,
    partnerVoice: partnerKey,
    history: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Generate dynamic opening line using GPT-4o-mini
  try {
    const openai = getOpenAIClient();
    const scenarioPrompt = SCENARIO_PROMPTS[scenario].replace('{partnerName}', partnerInfo.name);

    const systemPrompt = `
      ${scenarioPrompt}
      You must begin the practice conversation. Generate a realistic and engaging OPENING line in English to greet the user.
      Refer to the following user context:
      - Student Name: ${userProfile.name}
      - BJJ Belt: ${userProfile.belt} Belt
      - Skill Level ELO: ${userProfile.elo}
      - Goal: ${userProfile.goal || "Be confident training BJJ globally"}

      Write in conversational English. Maintain the exact character constraints of your partner: ${partnerInfo.description}.
      Return a JSON object containing the opening remark and a brief Portuguese translation.
      JSON Format:
      {
        "responseEN": "The exact English opening sentence",
        "responsePT": "Portuguese translation"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Init session, coach!" }
      ],
      response_format: { type: "json_object" }
    });

    const body = JSON.parse(completion.choices[0].message.content || '{}');
    
    newSession.history.push({
      role: 'assistant',
      text: body.responseEN || `Alright, ${userProfile.name}! Let's hit the mat and start learning.`,
      translation: body.responsePT || `Certo, ${userProfile.name}! Vamos entrar no tatame e começar a aprender.`,
      timestamp: new Date().toISOString(),
      pronunciationTips: "Remember: 'Oss' is pronounced as a clean underhook-breath, and keep vowels open.",
      keyVocabulary: ["Mat", "Oss", "BJJ"],
      performanceAnalysis: "Aguardando seu primeiro avanço técnico para iniciar feedback de pronúncia.",
      eloDelta: 0
    });

  } catch (err: any) {
    console.error(`[OPENAI SESSION INITIALIZATION FAILED]`, err);
    // Safe manual generic fallback opening
    newSession.history.push({
      role: 'assistant',
      text: `Welcome to the mat, ${userProfile.name}. Let's test your vocabulary and fluency under this scenario: ${scenario}!`,
      translation: `Bem-vindo ao tatame, ${userProfile.name}. Vamos testar seu vocabulário e fluência sob o cenário: ${scenario}!`,
      timestamp: new Date().toISOString(),
      pronunciationTips: "Pronunciation is standard US English. Take a deep breath.",
      keyVocabulary: ["Welcome", "Mat", "Scenario"],
      performanceAnalysis: "Exercício inicial.",
      eloDelta: 0
    });
  }

  // Persist session
  const sessions = loadUserConversations(userId);
  sessions.push(newSession);
  saveUserConversations(userId, sessions);

  return newSession;
}

/**
 * Drives the conversation forward, calculating high-end feedback and vocabulary.
 */
export async function getGPTResponse(
  userId: string,
  sessionId: string,
  userMessageText: string,
  userProfile: { name: string; belt: string; elo: number; goal?: string }
): Promise<ConversationSession> {
  const sessions = loadUserConversations(userId);
  const sessionIdx = sessions.findIndex(s => s.id === sessionId);
  if (sessionIdx === -1) {
    throw new Error("Sessão não localizada no cache persistente.");
  }

  const session = sessions[sessionIdx];
  const partnerInfo = PARTNERS[session.partnerKey];

  try {
    const openai = getOpenAIClient();
    const scenarioPrompt = SCENARIO_PROMPTS[session.scenario].replace('{partnerName}', session.partnerName);

    // Limit conversation history in API calls for high token performance
    const conversationWindow = session.history.slice(-10).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
      content: msg.text
    }));

    const systemPrompt = `
      ${scenarioPrompt}
      You are having an interactive conversation practice with the student.
      Reference student profile:
      - Student Name: ${userProfile.name}
      - Belt: ${userProfile.belt} Belt
      - Current ELO: ${userProfile.elo}
      - Goal: ${userProfile.goal || "BJJ international travel and teaching"}

      Review the user's latest message: "${userMessageText}"
      Respond in English naturally and advance the dialogue under the scenario. Keep replies engaging and reasonably concise (1-3 sentences, maximum 45 words).

      Evaluate the user's reply for:
      1. BJJ Vocabulary accuracy (did they use correct concepts like 'mount, underhook, framing, sweep'?).
      2. Grammatical flow.
      Provide detailed structural constructive feedback and correct styling tips.
      Return a solid JSON object containing the exact fields below:

      JSON Format:
      {
        "responseEN": "your speech in English",
        "responsePT": "translation to Portuguese",
        "pronunciationTips": "Phonetic guide or pronouncing focus tip for jiu-jitsu words used in this round",
        "keyVocabulary": ["word1", "word2"],
        "performanceAnalysis": "Praise or corrective tips in Portuguese on how they answered, what terms they used, and how to improve",
        "eloDelta": 15
      }
    `;

    const chatMessages: any[] = [
      { role: "system", content: systemPrompt },
      ...conversationWindow,
      { role: "user", content: userMessageText }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      response_format: { type: "json_object" }
    });

    const body = JSON.parse(completion.choices[0].message.content || '{}');

    // 1. Store user's turn
    session.history.push({
      role: 'user',
      text: userMessageText,
      timestamp: new Date().toISOString()
    });

    // 2. Store assistant's turn
    session.history.push({
      role: 'assistant',
      text: body.responseEN || "Nice try! Tell me more.",
      translation: body.responsePT || "Bela jogada! Conte-me mais.",
      timestamp: new Date().toISOString(),
      pronunciationTips: body.pronunciationTips || "Foque em respirar durante as transições de pronúncia.",
      keyVocabulary: body.keyVocabulary || ["Guard", "BJJ"],
      performanceAnalysis: body.performanceAnalysis || "Boa resposta! Continue rolando verbalmente.",
      eloDelta: typeof body.eloDelta === 'number' ? body.eloDelta : 10
    });

    session.updatedAt = new Date().toISOString();

    // Limit history on state disk to avoid file bloating (e.g. max 100 messages total)
    if (session.history.length > 100) {
      session.history = session.history.slice(-100);
    }

    // Save back to sessions list
    sessions[sessionIdx] = session;
    saveUserConversations(userId, sessions);

    return session;

  } catch (err: any) {
    console.error(`[OPENAI CHAT GENERATION FAILED]`, err);
    throw new Error(`Falha ao se comunicar com o motor de conversação IA: ${err.message || err}`);
  }
}
