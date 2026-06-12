import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_VOICE = 'nova'; // Warm, clear, didactical female voice

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

  const voice = voiceName.trim() || DEFAULT_VOICE;
  const hash = generateHash(cleanText, voice);

  // Check cache first
  const cached = getCachedAudio(hash);
  if (cached) {
    console.log(`[TTS CACHE HIT] Reusing cached OpenAI TTS voice audio | Hash: ${hash} | Text: "${cleanText.substring(0, 45)}..."`);
    return cached;
  }

  console.log(`[TTS CACHE MISS] Querying OpenAI TTS API for: "${cleanText.substring(0, 45)}..." | Voice: ${voice} | Hash: ${hash}`);

  if (!OPENAI_API_KEY) {
    console.warn("[TTS WARN] OPENAI_API_KEY is not defined in the environment.");
    throw new Error("A chave OPENAI_API_KEY não está configurada no servidor.");
  }

  const cacheDir = path.join(process.cwd(), 'server', 'cache', 'audio');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: cleanText,
      voice: voice,
      response_format: 'mp3'
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[OPENAI TTS API ERROR] Status ${response.status}`, errorBody);
    throw new Error(`Erro na API OpenAI TTS: status ${response.status} - ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Write to cache
  const cacheFilePath = path.join(cacheDir, `${hash}.mp3`);
  try {
    fs.writeFileSync(cacheFilePath, buffer);
    console.log(`[TTS CACHE SAVED] Saved generated speech disk cache file. Hash: ${hash}`);
  } catch (err) {
    console.error("[TTS CACHE WRITE ERROR] Failed to save mp3 file to disk:", err);
  }

  return buffer;
}
