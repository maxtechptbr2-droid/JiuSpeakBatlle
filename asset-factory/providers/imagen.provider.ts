import { GoogleGenAI } from '@google/genai';
import { AssetData } from './local.provider.ts';

const aiApiKey = process.env.GEMINI_API_KEY;

export async function generateImagenAsset(asset: AssetData): Promise<Buffer | null> {
  if (!aiApiKey) {
    console.warn(`[WARN] GEMINI_API_KEY is not defined. Skipping Imagen provider for "${asset.name}".`);
    return null;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: aiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `A premium AAA 3D asset of ${asset.name}, categorized as ${asset.category}, styled as an esports MMORPG collectible, professional studio lighting, dark luxurious black and gold style, game assets concept art, extreme high detail, PBR textures, centered, fully isolated on transparent solid flat background, game inventory icon ready, 4K quality. No labels, no mockups, no watermark, no text.`;

    console.log(`[INFO] Requesting Imagen 4 generation for "${asset.name}"...`);
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      }
    });

    if (response?.generatedImages?.[0]?.image?.imageBytes) {
      console.log(`[SUCCESS] Imagen generated beautiful image bytes for "${asset.name}".`);
      return Buffer.from(response.generatedImages[0].image.imageBytes, 'base64');
    }
    
    return null;
  } catch (error: any) {
    console.error(`[ERROR] Imagen provider failed for "${asset.name}":`, error?.message || error);
    return null;
  }
}
