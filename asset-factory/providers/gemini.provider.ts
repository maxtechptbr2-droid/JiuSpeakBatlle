import { GoogleGenAI } from '@google/genai';
import { AssetData } from './local.provider.ts';

const aiApiKey = process.env.GEMINI_API_KEY;

export async function generateGeminiAsset(asset: AssetData): Promise<Buffer | null> {
  if (!aiApiKey) {
    console.warn(`[WARN] GEMINI_API_KEY is not defined. Skipping Gemini Image provider for "${asset.name}".`);
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

    const prompt = `Premium AAA game asset model for ${asset.name}, category: ${asset.category}, rarity: ${asset.rarity}, esports tournament cosmetic item, PBR lighting, black gold luxury styling, high resolution texture surface, centered layout, completely isolated clear visual profile, transparent backdrop. No text tags, no UI overlays.`;

    console.log(`[INFO] Requesting Gemini Image generation for "${asset.name}" using gemini-3.1-flash-image...`);
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    const candidates = response?.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          console.log(`[SUCCESS] Gemini Image generated image parts containing inline base64 data for "${asset.name}".`);
          return Buffer.from(part.inlineData.data, 'base64');
        }
      }
    }

    return null;
  } catch (error: any) {
    console.error(`[ERROR] Gemini Image provider failed for "${asset.name}":`, error?.message || error);
    return null;
  }
}
