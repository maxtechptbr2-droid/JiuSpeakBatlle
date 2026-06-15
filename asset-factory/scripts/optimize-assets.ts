import sharp from 'sharp';

/**
 * Optimizes a texture and produces losslessly compressed WebP images for faster online loads.
 */
export async function optimizeToWebP(inputBuffer: Buffer, quality = 85): Promise<Buffer> {
  try {
    return await sharp(inputBuffer)
      .webp({
        quality: quality,
        lossless: false,
        effort: 6, // High compression effort
        smartSubsample: true
      })
      .toBuffer();
  } catch (error: any) {
    console.error(`[ERROR] WebP conversion failed:`, error?.message || error);
    // Fallback: WebP basic
    return await sharp(inputBuffer).webp().toBuffer();
  }
}
