import sharp from 'sharp';

/**
 * Removes solid backdrops and cleans boundaries utilizing threshold matching and sharp.
 */
export async function removeBackground(inputBuffer: Buffer): Promise<Buffer> {
  try {
    // 1. First, we load the image and trim any existing flat borders automatically
    let img = sharp(inputBuffer).trim();

    // 2. We convert to raw pixels to do high-precision background check and set alpha channel to 0 for solid non-product colors
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    
    const outputBuffer = Buffer.alloc(info.width * info.height * 4);
    const hasAlphaInput = info.channels === 4;

    for (let i = 0; i < info.width * info.height; i++) {
      const idxIn = i * info.channels;
      const idxOut = i * 4;

      const r = data[idxIn];
      const g = data[idxIn + 1];
      const b = data[idxIn + 2];
      const a = hasAlphaInput ? data[idxIn + 3] : 255;

      // Identify typical bright/pure white or near-solid backgrounds to key out
      const isNearWhite = r > 240 && g > 240 && b > 240;
      const isNearBlackBackground = r < 12 && g < 12 && b < 12;

      // If it resembles the background, reduce its transparency
      if (isNearWhite || isNearBlackBackground) {
        outputBuffer[idxOut] = r;
        outputBuffer[idxOut + 1] = g;
        outputBuffer[idxOut + 2] = b;
        outputBuffer[idxOut + 3] = 0; // Transparent
      } else {
        outputBuffer[idxOut] = r;
        outputBuffer[idxOut + 1] = g;
        outputBuffer[idxOut + 2] = b;
        outputBuffer[idxOut + 3] = a;
      }
    }

    // 3. Re-assemble into sharp image and apply a minor feather/blur to smooth trimmed edges
    return await sharp(outputBuffer, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toBuffer();
  } catch (error: any) {
    console.warn(`[WARN] Advanced background removal failed: ${error.message || error}. Returning trimmed original.`);
    // Fallback: Trim boundaries and export PNG directly
    return await sharp(inputBuffer).trim().png().toBuffer();
  }
}
