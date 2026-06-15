import fs from 'fs-extra';
import path from 'path';
import * as archiverNamespace from 'archiver';
const archiver = ((archiverNamespace as any).default || archiverNamespace) as any;

/**
 * Packs the entire generated assets ecosystem into an ultra-compressed premium ZIP archive.
 */
export async function createZipArchive(sourceDir: string, outputFile: string): Promise<void> {
  console.log(`[ZIP] Archiving all assets inside "${sourceDir}" to "${outputFile}"...`);
  
  await fs.ensureDir(path.dirname(outputFile));
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputFile);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression level
    });

    output.on('close', () => {
      const sizeMb = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`[ZIP SUCCESS] Complete! Created archive. Total size: ${sizeMb} MB.`);
      resolve();
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn(`[ZIP WARN] Missing file encountered:`, err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      console.error(`[ZIP ERROR] Archive bundling failed:`, err);
      reject(err);
    });

    archive.pipe(output);

    // Append directories and files recursively
    archive.directory(sourceDir, false);

    archive.finalize();
  });
}
