import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Vozes masculinas da ElevenLabs — 5 timbres completamente distintos por personagem.
export const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  thomas:  'TxGEqnHWrfWFTfGW9XjX', // Josh   — jovem, americano, grave e claro (White Belt USA)
  tyler:   'pNInz6obpgDQGcFmaJgB', // Adam   — americano, caloroso e descontraído (Cali Blue Belt)
  yuki:    'N2lVS1w4EtoT3dr4eOWO', // Callum — contido e preciso, sotaque britânico (Tokyo Purple)
  roberto: 'nPczCjzI2devNBz1zQrb', // Brian  — grave, narrador, tom maduro internacional (London)
  john:    'JBFqnCBsd6RMkjVDRZzb', // George — britânico refinado, autoritário (Austin Texas Master)
};

const ELEVEN_MODEL_ID = 'eleven_flash_v2_5'; // baixa latência, ideal para conversa em tempo real
const DEFAULT_VOICE_ID = ELEVENLABS_VOICE_MAP.thomas;

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error('ELEVENLABS_API_KEY não configurada no servidor.');
  }
  return key;
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.trim().slice(0, 1000).replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
}

export function resolveVoiceId(partnerKeyOrVoice: string): string {
  return ELEVENLABS_VOICE_MAP[partnerKeyOrVoice] || partnerKeyOrVoice || DEFAULT_VOICE_ID;
}

export function generateHash(text: string, voiceId: string): string {
  return crypto.createHash('md5').update(`el_${sanitizeText(text)}_${voiceId}`).digest('hex');
}

const getCacheDir = () => path.join(process.cwd(), 'server', 'cache', 'audio_elevenlabs');

export function getCachedAudio(hash: string): Buffer | null {
  const cacheFilePath = path.join(getCacheDir(), `${hash}.mp3`);
  if (fs.existsSync(cacheFilePath)) {
    try {
      return fs.readFileSync(cacheFilePath);
    } catch (err) {
      console.error(`[ELEVENLABS CACHE READ ERROR] hash ${hash}:`, err);
    }
  }
  return null;
}

function saveCachedAudio(hash: string, buffer: Buffer) {
  const dir = getCacheDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFile(path.join(dir, `${hash}.mp3`), buffer, (err) => {
    if (err) console.error('[ELEVENLABS CACHE WRITE WARNING]', err);
  });
}

export async function gerarAudioElevenLabs(text: string, partnerKeyOrVoice: string): Promise<Buffer> {
  const cleanText = sanitizeText(text);
  if (!cleanText) throw new Error('Texto vazio ou inválido.');

  const voiceId = resolveVoiceId(partnerKeyOrVoice);
  const hash = generateHash(cleanText, voiceId);

  const cached = getCachedAudio(hash);
  if (cached) return cached;

  const apiKey = getApiKey();

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: ELEVEN_MODEL_ID,
      voice_settings: { stability: 0.45, similarity_boost: 0.8 },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`ElevenLabs TTS falhou (status ${response.status}): ${errBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  saveCachedAudio(hash, buffer);
  return buffer;
}
