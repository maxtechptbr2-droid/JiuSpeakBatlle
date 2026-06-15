import fs from 'fs-extra';
import path from 'path';
import * as archiverNamespace from 'archiver';
const archiver = ((archiverNamespace as any).default || archiverNamespace) as any;

/**
 * CreateZip Utility
 * Archives the finalized visual portfolio (/assets) into a streamlined, high-compression
 * ZIP bundle optimized for content delivery networks and game client deployment.
 */
export async function createZip(sourceDir: string, outputZipPath: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      console.log(`[Archiver] Packaging all textures from ${sourceDir} into ZIP file...`);

      // Ensure destination directory exists
      await fs.ensureDir(path.dirname(outputZipPath));

      // Create a file to write archive data to
      const output = fs.createWriteStream(outputZipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression level (9)
      });

      // Listen for all archive data as it finishes writing
      output.on('close', () => {
        console.log(`[Archiver] Archive generated successfully! Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
        console.log(`[Archiver] Location: ${outputZipPath}`);
        resolve(true);
      });

      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('[Archiver Warning]', err);
        } else {
          console.error('[Archiver Warning]', err);
        }
      });

      archive.on('error', (err) => {
        console.error('[Archiver ERROR] Packaging process crashed:', err);
        resolve(false);
      });

      // Stream archive data to output file
      archive.pipe(output);

      // Append files from directory, putting them in the root of the archive
      archive.directory(sourceDir, false);

      // Finalize the archive (this triggers 'close' when done)
      await archive.finalize();

    } catch (error: any) {
      console.error(`[Archiver ERROR] Pipeline initiation failed: ${error.message}`);
      resolve(false);
    }
  });
}

// Standalone CLI support
if (process.argv[1] && process.argv[1].endsWith('create-zip.ts')) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: tsx create-zip.ts <source_dir> <output_zip_path>');
    process.exit(1);
  }
  createZip(args[0], args[1])
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
