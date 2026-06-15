import sharp from 'sharp';

export interface ThumbnailSet {
  t128: Buffer;
  t256: Buffer;
  t512: Buffer;
}

/**
 * Renders thumbnail sizes for websites, mobile apps, and game engines.
 */
export async function generateThumbnails(inputBuffer: Buffer): Promise<ThumbnailSet> {
  const sizes = [128, 256, 512];
  const results: Buffer[] = [];

  for (const size of sizes) {
    const resized = await sharp(inputBuffer)
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ compressionLevel: 9 })
      .toBuffer();
    
    results.push(resized);
  }

  return {
    t128: results[0],
    t256: results[1],
    t512: results[2]
  };
}
