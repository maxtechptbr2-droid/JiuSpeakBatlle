import fs from 'fs-extra';
import path from 'path';

export interface ManifestItem {
  id: string;
  name: string;
  category: string;
  rarity: string;
  priceJT: number;
  tradable: boolean;
  equippable: boolean;
  usableInWebsite: boolean;
  usableInMobile: boolean;
  usableInJiuVerse: boolean;
  png: string;
  webp: string;
  thumbnail: string;
  cdnUrl: string | null;
}

/**
 * Generates and saves a detailed manifest.json file containing all generated items' descriptors.
 */
export async function createManifest(items: ManifestItem[], outputDir: string): Promise<string> {
  const manifestPath = path.join(outputDir, 'manifest.json');
  console.log(`[MANIFEST] Creating catalog manifest inside: ${manifestPath}...`);
  
  const manifestData = {
    generatedAt: new Date().toISOString(),
    totalAssetsCount: items.length,
    assets: items
  };

  await fs.writeJson(manifestPath, manifestData, { spaces: 2 });
  console.log(`[MANIFEST SUCCESS] Saved manifest.json with ${items.length} items!`);
  return manifestPath;
}
