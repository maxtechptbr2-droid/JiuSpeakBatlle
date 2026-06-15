import axios from 'axios';
import { AssetData } from './local.provider.ts';

const fluxApiKey = process.env.FLUX_API_KEY;

export async function generateFluxAsset(asset: AssetData): Promise<Buffer | null> {
  if (!fluxApiKey) {
    console.warn(`[WARN] FLUX_API_KEY is not defined. Skipping Flux provider for "${asset.name}".`);
    return null;
  }

  try {
    const prompt = `AAA high-fidelity game asset ${asset.name}, category: ${asset.category}, rarity: ${asset.rarity}, luxury black gold aesthetic, stunning details, centered, fully isolated, transparent background, studio lights. No texts.`;
    
    console.log(`[INFO] Requesting Flux generation for "${asset.name}" via API...`);
    const response = await axios.post(
      'https://api.fal.ai/v1/images/flux/dev',
      {
        prompt: prompt,
        image_size: 'square',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        sync_mode: true
      },
      {
        headers: {
          'Authorization': `Key ${fluxApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000
      }
    );

    const imageUrl = response.data?.images?.[0]?.url;
    if (imageUrl) {
      console.log(`[SUCCESS] Flux returned image URL: ${imageUrl}`);
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      return Buffer.from(imageResponse.data);
    }
    
    return null;
  } catch (error: any) {
    console.error(`[ERROR] Flux provider failed for "${asset.name}":`, error?.message || error);
    return null;
  }
}
