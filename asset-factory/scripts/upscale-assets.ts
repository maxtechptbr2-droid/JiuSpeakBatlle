import sharp from 'sharp';

/**
 * Upscales an image to 4k or custom resolution with high-fidelity resamplers and edge-enhancing filters.
 */
export async function upscaleAsset(inputBuffer: Buffer, targetWidth = 4096): Promise<Buffer> {
  try {
    console.log(`[INFO] Upscaling asset to ${targetWidth}x${targetWidth} using Lanczos kernel...`);
    
    // Perform upscaling with sharp's native lanczos kernel, followed by mild sharpening to bring back high frequency PBR details
    return await sharp(inputBuffer)
      .resize({
        width: targetWidth,
        height: targetWidth,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({
        sigma: 1.0,
      })
      .png()
      .toBuffer();
  } catch (error: any) {
    console.error(`[ERROR] Upscaling failed, returning original:`, error?.message || error);
    return inputBuffer;
  }
}
