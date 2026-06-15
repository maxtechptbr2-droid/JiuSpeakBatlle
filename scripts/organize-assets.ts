import fs from 'fs-extra';
import path from 'path';

/**
 * OrganizeAssets Utility
 * Places generated assets (PNGs, upscale images, and WebP copies) into their
 * designated structured game asset directories and generates the required manifest.json file.
 */
export async function organizeAssets(
  tempOutputDir: string,
  baseAssetsDir: string,
  totalCount: number
): Promise<boolean> {
  try {
    console.log('[Organizer] Sorting generated source textures into categories...');

    const categories = ['kimonos', 'rashguards', 'medalhas', 'molduras', 'avatares', 'icones'];

    // Ensure all category directories exist under /assets
    for (const cat of categories) {
      await fs.ensureDir(path.join(baseAssetsDir, cat));
    }

    // Read all files from temp output directory
    const tempFiles = await fs.readdir(tempOutputDir);

    for (const file of tempFiles) {
      const srcPath = path.join(tempOutputDir, file);
      const stats = await fs.stat(srcPath);

      if (stats.isDirectory()) continue;

      // Determine correct classification folder
      let targetSubFolder = 'misc';
      const fileLower = file.toLowerCase();

      if (fileLower.includes('kimono')) {
        targetSubFolder = 'kimonos';
      } else if (fileLower.includes('rash')) {
        targetSubFolder = 'rashguards';
      } else if (fileLower.includes('medal')) {
        targetSubFolder = 'medalhas';
      } else if (fileLower.includes('frame') || fileLower.includes('moldura')) {
        targetSubFolder = 'molduras';
      } else if (fileLower.includes('avatar')) {
        targetSubFolder = 'avatares';
      } else if (fileLower.includes('icon') || fileLower.includes('icone')) {
        targetSubFolder = 'icones';
      } else {
        // Fallback checks
        continue;
      }

      const destPath = path.join(baseAssetsDir, targetSubFolder, file);
      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(srcPath, destPath, { overwrite: true });
    }

    // Step 7: Generate manifest.json file
    const manifestPath = path.join(baseAssetsDir, 'manifest.json');
    const manifest = {
      name: "JiuSpeak Assets",
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      totalAssets: totalCount,
      categories: categories.reduce((acc, cat) => {
        acc[cat] = { path: `./${cat}` };
        return acc;
      }, {} as Record<string, any>)
    };

    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    console.log(`[Organizer] Successfully wrote complete package details to ${manifestPath}`);

    return true;
  } catch (error: any) {
    console.error(`[Organizer ERROR] Sorting pipeline failed: ${error.message}`);
    return false;
  }
}

// Standalone CLI support
if (process.argv[1] && process.argv[1].endsWith('organize-assets.ts')) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: tsx organize-assets.ts <temp_output_dir> <base_assets_dir> <total_count>');
    process.exit(1);
  }
  const count = parseInt(args[2], 10) || 43;
  organizeAssets(args[0], args[1], count)
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
