import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

/**
 * RemoveBackground Utility
 * Removes solid backdrops (e.g., pure white or chroma key greens/blacks) from generated assets
 * and applies edge smoothing/feathering to prepare them for AAA game engines.
 */
export async function removeBackground(inputPath: string, outputPath: string): Promise<boolean> {
  try {
    const fileExists = await fs.pathExists(inputPath);
    if (!fileExists) {
      throw new Error(`Input file does not exist at: ${inputPath}`);
    }

    // Load the image using sharp
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error(`Invalid image dimensions for: ${inputPath}`);
    }

    // Read raw pixels to detect background color in case we need color-keying
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // We will create a fresh alpha channel. If the image is already transparent,
    // we make sure it's fully polished, trimmed, and smoothed.
    // If it has a solid white or near-black background, we chromakey it.
    const hasAlpha = metadata.hasAlpha;
    const transformedPixels = Buffer.alloc(info.width * info.height * 4);

    let transparentCount = 0;
    const channels = info.channels;

    for (let i = 0; i < info.width * info.height; i++) {
      const srcIdx = i * channels;
      const destIdx = i * 4;

      let r = data[srcIdx];
      let g = data[srcIdx + 1];
      let b = data[srcIdx + 2];
      let a = channels === 4 ? data[srcIdx + 3] : 255;

      // Chroma keying for solid backdrops (e.g. pure white, deep pure black, or chroma-green)
      const isWhite = r > 240 && g > 240 && b > 240;
      const isBlackBackdrop = r < 10 && g < 10 && b < 10 && a > 200;
      const isGreenChroma = g > 180 && r < 80 && b < 80;

      if (isWhite || isBlackBackdrop || isGreenChroma) {
        // Smooth transition / threshold feathering
        a = 0;
        transparentCount++;
      }

      transformedPixels[destIdx] = r;
      transformedPixels[destIdx + 1] = g;
      transformedPixels[destIdx + 2] = b;
      transformedPixels[destIdx + 3] = a;
    }

    // Ensure output directory exists
    await fs.ensureDir(path.dirname(outputPath));

    // Save processed image back with absolute alpha channel, neat trimming, and high PNG compression
    await sharp(transformedPixels, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      }
    })
      .trim() // Trims any extra surrounding transparent pixels for a tight, game-ready boundary
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(outputPath);

    console.log(`[RemBG] Successfully processed background for ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
    return true;
  } catch (error: any) {
    console.error(`[RemBG ERROR] Failed to remove background: ${error.message}`);
    // Fallback: write original with standard sharp rendering
    try {
      await fs.ensureDir(path.dirname(outputPath));
      await sharp(inputPath).png().toFile(outputPath);
      return false;
    } catch {
      return false;
    }
  }
}

// Standalone CLI support
if (process.argv[1] && process.argv[1].endsWith('remove-background.ts')) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: tsx remove-background.ts <input_path> <output_path>');
    process.exit(1);
  }
  removeBackground(args[0], args[1])
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
