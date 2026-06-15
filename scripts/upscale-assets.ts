import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

/**
 * UpscaleAssets Utility
 * Performs a high-fidelity 4x upscale (resolving 2048x2048 into 4096x4096)
 * incorporating visual enhancers like edge-sharpening (unsharp mask) and 
 * high-quality Lanczos resampling to emulate deep-learning upscalers.
 */
export async function upscaleAsset(inputPath: string, outputPath: string, scaleFactor = 4): Promise<boolean> {
  try {
    const fileExists = await fs.pathExists(inputPath);
    if (!fileExists) {
      throw new Error(`Input file does not exist at: ${inputPath}`);
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error(`Invalid dimensions for upscale: ${inputPath}`);
    }

    const targetWidth = metadata.width * scaleFactor;
    const targetHeight = metadata.height * scaleFactor;

    console.log(`[Upscale] Upscaling ${path.basename(inputPath)} from ${metadata.width}x${metadata.height} to ${targetWidth}x${targetHeight}...`);

    await fs.ensureDir(path.dirname(outputPath));

    // High quality Lanczos scaling with an unsharp mask filter to sharpen upscaled edges
    await image
      .resize({
        width: targetWidth,
        height: targetHeight,
        kernel: sharp.kernel.lanczos3, // Maximum quality bicubic/lanczos filter
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .sharpen({
        sigma: 1.5
      }) // Edge restoration filter simulating generative super-resolution
      .png({ compressionLevel: 8 })
      .toFile(outputPath);

    console.log(`[Upscale] Successfully generated high-definition 4x texture: ${path.basename(outputPath)}`);
    return true;
  } catch (error: any) {
    console.error(`[Upscale ERROR] Failed upscaling asset: ${error.message}`);
    return false;
  }
}

// Standalone CLI support
if (process.argv[1] && process.argv[1].endsWith('upscale-assets.ts')) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: tsx upscale-assets.ts <input_path> <output_path> [scale_factor]');
    process.exit(1);
  }
  const scale = args[2] ? parseInt(args[2], 10) : 4;
  upscaleAsset(args[0], args[1], scale)
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
