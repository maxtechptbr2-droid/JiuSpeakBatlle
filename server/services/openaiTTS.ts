import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import OpenAI from 'openai';

const DEFAULT_VOICE: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = 'nova';

let openaiClient: OpenAI | null = null;

/**
 * Initializes and returns the OpenAI SDK client lazily.
 */
function getOpenAIClient(): OpenAI {
  console.log("Checking if OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
  if (!openaiClient) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      console.warn("[TTS WARN] OPENAI_API_KEY is missing in process.env!");
      throw new Error("A chave OPENAI_API_KEY não está configurada no servidor.");
    }
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

/**
 * Sanitizes input text to prevent platform abuse/oversized inputs and path traversal.
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  // Limit text to 1000 chars to avoid flood or oversized payloads
  return text.trim()
    .slice(0, 1000)
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, ''); // strip abnormal control characters
}

/**
 * Generates an MD5 hash derived from sanitized text and requested voice identifier.
 */
export function generateHash(text: string, voice: string): string {
  const sanitized = sanitizeText(text);
  return crypto.createHash('md5').update(`${sanitized}_${voice}`).digest('hex');
}

/**
 * Checks for cached binary audio in the filesystem.
 */
export function getCachedAudio(hash: string): Buffer | null {
  const cacheDir = path.join(process.cwd(), 'server', 'cache', 'audio');
  const cacheFilePath = path.join(cacheDir, `${hash}.mp3`);

  if (fs.existsSync(cacheFilePath)) {
    try {
      return fs.readFileSync(cacheFilePath);
    } catch (err) {
      console.error(`[TTS CACHE READ ERROR] Failed reading file for hash ${hash}:`, err);
    }
  }
  return null;
}

/**
 * Requests speech audio buffer from OpenAI TTS API, then persists and returns it.
 */
export async function gerarAudio(text: string, voiceName: string = DEFAULT_VOICE): Promise<Buffer> {
  const cleanText = sanitizeText(text);
  if (!cleanText) {
    throw new Error("O texto fornecido está vazio ou é inválido.");
  }

  // Cast voiceName to supported OpenAI voices or fallback to DEFAULT_VOICE
  const requestedVoice = voiceName.trim().toLowerCase();
  const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
  const voice = (validVoices.includes(requestedVoice) ? requestedVoice : DEFAULT_VOICE) as typeof DEFAULT_VOICE;

  const hash = generateHash(cleanText, voice);

  // Check cache first
  const cached = getCachedAudio(hash);
  if (cached) {
    console.log(`[TTS CACHE HIT] Reusing cached OpenAI TTS voice audio | Hash: ${hash} | Text: "${cleanText.substring(0, 45)}..."`);
    return cached;
  }

  console.log(`[TTS CACHE MISS] Querying OpenAI TTS API for: "${cleanText.substring(0, 45)}..." | Voice: ${voice} | Hash: ${hash}`);

  const cacheDir = path.join(process.cwd(), 'server', 'cache', 'audio');
  if (!fs.existsSync(cacheDir)) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
    } catch (err) {
      console.error("[TTS DIR CREATE ERROR] Failed to create cache folders:", err);
    }
  }

  try {
    const openai = getOpenAIClient();
    console.log("Generating TTS from OpenAI. Trying model: gpt-4o-mini-tts with voice:", voice);
    
    let mp3;
    try {
      mp3 = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: voice,
        input: cleanText,
      });
      console.log("[TTS GENERATED] Voice generated successfully using gpt-4o-mini-tts");
    } catch (err: any) {
      console.warn("[TTS WARN] Failed to generate with gpt-4o-mini-tts mode. Falling back to standard tts-1. Error:", err.message || err);
      mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: cleanText,
      });
      console.log("[TTS GENERATED] Voice generated successfully using fallback model tts-1");
    }

    console.log("TTS audio ready, converting stream to buffer...");
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Write to cache
    const cacheFilePath = path.join(cacheDir, `${hash}.mp3`);
    try {
      fs.writeFileSync(cacheFilePath, buffer);
      console.log(`[TTS CACHE SAVED] Saved generated speech disk cache file. Hash: ${hash}`);
    } catch (err) {
      console.error("[TTS CACHE WRITE ERROR] Failed to save mp3 file to disk:", err);
    }

    return buffer;
  } catch (error: any) {
    console.error("[OPENAI TTS CRITICAL REJECTION]", error);
    throw new Error(`OpenAI Speech extraction failed: ${error.message || error}`);
  }
}
