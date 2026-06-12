import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// Rachel voice: clear dictionary and voice profile
const VOICE_RACHEL = '21m00Tcm4TlvDq8ikWAM'; 

export async function generateSpeech(text: string, voiceId: string = VOICE_RACHEL): Promise<Buffer> {
  const cleanText = text.trim();
  const hash = crypto.createHash('md5').update(cleanText).digest('hex');
  const cacheDir = path.join(process.cwd(), 'server', 'cache', 'audio');
  const cacheFilePath = path.join(cacheDir, `${hash}.mp3`);

  // Ensure cache directory exists
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Check cache first
  if (fs.existsSync(cacheFilePath)) {
    console.log(`[TTS CACHE HIT] Reusing cached file for: "${cleanText.substring(0, 40)}..." | Hash: ${hash}`);
    return fs.readFileSync(cacheFilePath);
  }

  console.log(`[TTS CACHE MISS] Generating speech via ElevenLabs for: "${cleanText.substring(0, 40)}..." | Hash: ${hash}`);

  if (!ELEVENLABS_API_KEY) {
    console.warn("[TTS WARN] ELEVENLABS_API_KEY is not configured in the environment.");
    throw new Error("A chave ELEVENLABS_API_KEY não está configurada nas variáveis de ambiente do servidor.");
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.75,
        style: 0.2,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[TTS ELEVENLABS ERROR]", response.status, errText);
    throw new Error(`Serviço ElevenLabs retornou erro: ${response.status} - ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Write to cache
  fs.writeFileSync(cacheFilePath, buffer);
  console.log(`[TTS CACHE SAVED] Saved generated speech to disk, hash: ${hash}`);

  return buffer;
}
