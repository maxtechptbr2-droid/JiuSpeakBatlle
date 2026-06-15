import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { generateLocalSVG, renderSVGToPNG, AssetData } from '../providers/local.provider.ts';
import { generateImagenAsset } from '../providers/imagen.provider.ts';
import { generateGeminiAsset } from '../providers/gemini.provider.ts';
import { generateFluxAsset } from '../providers/flux.provider.ts';

import { removeBackground } from './remove-background.ts';
import { upscaleAsset } from './upscale-assets.ts';
import { generateThumbnails } from './generate-thumbnails.ts';
import { optimizeToWebP } from './optimize-assets.ts';
import { uploadToCDN } from './upload-cdn.ts';
import { syncAssetsToDatabase } from './sync-postgresql.ts';
import { createManifest, ManifestItem } from './create-manifest.ts';
import { createZipArchive } from './create-zip.ts';

// Main Configuration Paths (organized inside /asset-factory)
const rootDir = path.resolve(import.meta.dirname, '..');
const assetsDir = path.join(rootDir, 'assets');
const outputDir = path.join(rootDir, 'output');
const logsDir = path.join(rootDir, 'logs');
const logFilePath = path.join(logsDir, 'pipeline.log');

// Setup directory structures
async function initializeDirectories() {
  await fs.ensureDir(assetsDir);
  await fs.ensureDir(outputDir);
  await fs.ensureDir(logsDir);

  const categories = ['kimonos', 'rashguards', 'medalhas', 'molduras', 'avatares', 'icones', 'thumbnails'];
  for (const cat of categories) {
    await fs.ensureDir(path.join(assetsDir, cat));
    if (cat === 'thumbnails') {
      await fs.ensureDir(path.join(assetsDir, cat, '128'));
      await fs.ensureDir(path.join(assetsDir, cat, '256'));
      await fs.ensureDir(path.join(assetsDir, cat, '512'));
    }
  }
}

// Logging Utility
function writePipelineLog(message: string) {
  const timestamp = new Date().toISOString();
  const formattedLine = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.ensureDirSync(logsDir);
    fs.appendFileSync(logFilePath, formattedLine, 'utf8');
  } catch (err: any) {
    console.error(`[LOG ERROR] Failed to append to logfile:`, err.message);
  }
}

// Relational DB-Compliant List of 43 AAA Cosmetics Assets
const COSMETIC_ASSETS: AssetData[] = [
  // --- KIMONOS (6 items) ---
  { id: uuidv4(), name: 'Atama Mundial 2026', category: 'kimonos', rarity: 'LEGENDARY', description: 'The absolute sovereign tournament Kimono with luxury woven golden embroideries.' },
  { id: uuidv4(), name: 'Shoyoroll Competitor', category: 'kimonos', rarity: 'EPIC', description: 'Prestige limited edition competitor gear styled in deep slate grey with copper accents.' },
  { id: uuidv4(), name: 'Hyperfly Pro', category: 'kimonos', rarity: 'RARE', description: 'Ultra durable lightweight tactical weave armored for high mobility athletes.' },
  { id: uuidv4(), name: 'Kingz Balistico', category: 'kimonos', rarity: 'UNCOMMON', description: 'Ballistic standard armor featuring custom collar stitching and ocean-blue linings.' },
  { id: uuidv4(), name: 'Koral Elite', category: 'kimonos', rarity: 'COMMON', description: 'Classic rugged veteran canvas built for intense everyday academy training.' },
  { id: uuidv4(), name: 'KVRA Competition', category: 'kimonos', rarity: 'MYTHIC', description: 'Unleash inner combat spirits. Custom black-gold skulls edition with holographic labels.' },

  // --- RASHGUARDS (5 items) ---
  { id: uuidv4(), name: 'Venum Elite', category: 'rashguards', rarity: 'EPIC', description: 'High compression matrix-weave rashguard with biomechanical design accents.' },
  { id: uuidv4(), name: 'Hyperfly NoGi', category: 'rashguards', rarity: 'RARE', description: 'Minimalist sleek skin protective compression tunic optimized for fluid grappling.' },
  { id: uuidv4(), name: 'Kingz Pro', category: 'rashguards', rarity: 'UNCOMMON', description: 'Reinforced flatlock stitched performance layer styled in modern carbon fibre gradients.' },
  { id: uuidv4(), name: 'Tatami Competition', category: 'rashguards', rarity: 'COMMON', description: 'Standard rank protective compression gear for everyday competition preparation.' },
  { id: uuidv4(), name: 'Atama Rank', category: 'rashguards', rarity: 'LEGENDARY', description: 'Sovereign tier compression wear showing official IBJJF tournament color rankings.' },

  // --- MEDALHAS (5 items) ---
  { id: uuidv4(), name: 'Mundial', category: 'medalhas', rarity: 'MYTHIC', description: 'The peak of glory. Solid pure heavy gold core embedded with precious diamond relics.' },
  { id: uuidv4(), name: 'Grand Slam', category: 'medalhas', rarity: 'LEGENDARY', description: 'Laurel crowned solid heavy gold championship medallion from grand world tournaments.' },
  { id: uuidv4(), name: 'Brasileiro', category: 'medalhas', rarity: 'EPIC', description: 'Prestigious national championship gold award detailed with green and yellow gemstones.' },
  { id: uuidv4(), name: 'Pan', category: 'medalhas', rarity: 'RARE', description: 'Pan-American championship honor medal with deep obsidian steel side bands.' },
  { id: uuidv4(), name: 'Continental', category: 'medalhas', rarity: 'UNCOMMON', description: 'Vibrant championship silver award honoring continental tournament champions.' },

  // --- MOLDURAS (5 items) ---
  { id: uuidv4(), name: 'IBJJF', category: 'molduras', rarity: 'LEGENDARY', description: 'Elite framing border modeled in sovereign black, blue, and gold with IBJJF crests.' },
  { id: uuidv4(), name: 'AJP', category: 'molduras', rarity: 'EPIC', description: 'Pro league showcase model highlighted with crown motifs and glossy platinum plates.' },
  { id: uuidv4(), name: 'CBJJ', category: 'molduras', rarity: 'RARE', description: 'Sleek dark lacquer profile shield framed by fine green embroidery lines.' },
  { id: uuidv4(), name: 'World Champion', category: 'molduras', rarity: 'MYTHIC', description: 'The absolute sovereign framework studded with brilliant diamonds and revolving laurel wreaths.' },
  { id: uuidv4(), name: 'Grand Slam', category: 'molduras', rarity: 'LEGENDARY', description: 'Gilded crown layout with ruby embedded corners, indicating grand tour domination.' },

  // --- AVATARES MASCULINOS (7 items) ---
  { id: uuidv4(), name: 'Faixa Branca Masc', category: 'avatares', rarity: 'COMMON', description: 'Male character avatar beginning their martial path, belted with raw cotton cord.' },
  { id: uuidv4(), name: 'Faixa Azul Masc', category: 'avatares', rarity: 'UNCOMMON', description: 'Male practitioner showing strong technical foundations, wearing the ocean-blue belt.' },
  { id: uuidv4(), name: 'Faixa Roxa Masc', category: 'avatares', rarity: 'RARE', description: 'Male fighter of creative techniques, wearing the royal-purple master rank belt.' },
  { id: uuidv4(), name: 'Faixa Marrom Masc', category: 'avatares', rarity: 'EPIC', description: 'Male combatant refined in battlefield tactics, wearing the rich earth-brown belt.' },
  { id: uuidv4(), name: 'Faixa Preta Masc', category: 'avatares', rarity: 'LEGENDARY', description: 'Male master rank holding the ultimate charcoal black belt with professional red bars.' },
  { id: uuidv4(), name: 'Professor Masc', category: 'avatares', rarity: 'LEGENDARY', description: 'Male elite teacher wearing historical red-and-black stripes of martial legacy.' },
  { id: uuidv4(), name: 'Campeão Mundial Masc', category: 'avatares', rarity: 'MYTHIC', description: 'Male champion haloed in bright rays, celebrating international peak achievements.' },

  // --- AVATARES FEMININOS (7 items) ---
  { id: uuidv4(), name: 'Faixa Branca Fem', category: 'avatares', rarity: 'COMMON', description: 'Female practitioner beginning her tactical path, belted with raw cotton cord.' },
  { id: uuidv4(), name: 'Faixa Azul Fem', category: 'avatares', rarity: 'UNCOMMON', description: 'Female combatant holding solid technical base, belted in sapphire rank.' },
  { id: uuidv4(), name: 'Faixa Roxa Fem', category: 'avatares', rarity: 'RARE', description: 'Female fighter with lethal strategies, belted with royal purple crest.' },
  { id: uuidv4(), name: 'Faixa Marrom Fem', category: 'avatares', rarity: 'EPIC', description: 'Female tactical master holding complete locks and sweeps, belted in chocolate brown.' },
  { id: uuidv4(), name: 'Faixa Preta Fem', category: 'avatares', rarity: 'LEGENDARY', description: 'Female grand master bearing the prestigious black belt with crimson red bars.' },
  { id: uuidv4(), name: 'Professora Fem', category: 'avatares', rarity: 'LEGENDARY', description: 'Female instructor representing the academy with historical red stripes.' },
  { id: uuidv4(), name: 'Campeã Mundial Fem', category: 'avatares', rarity: 'MYTHIC', description: 'Female world champion framed with massive victory trophies and gold halos.' },

  // --- ÍCONES (8 items) ---
  { id: uuidv4(), name: 'Kimono Menu Icon', category: 'icones', rarity: 'COMMON', description: 'Crisp vector gear button indicating the active fighter Gi closet selection.' },
  { id: uuidv4(), name: 'Rashguard Menu Icon', category: 'icones', rarity: 'COMMON', description: 'Sleek interface button displaying NoGi tournament performance wear.' },
  { id: uuidv4(), name: 'Medalha Wardrobe Icon', category: 'icones', rarity: 'UNCOMMON', description: 'Navigation glyph leading to the champion collection showcase gallery.' },
  { id: uuidv4(), name: 'Moldura Profile Icon', category: 'icones', rarity: 'UNCOMMON', description: 'Menu label accessing profile framework and crown selection settings.' },
  { id: uuidv4(), name: 'Avatar Closet Icon', category: 'icones', rarity: 'RARE', description: 'Tactical button for character visual appearance custom profiles.' },
  { id: uuidv4(), name: 'Coleção Premium Icon', category: 'icones', rarity: 'RARE', description: 'Sovereign chest button containing all rare skins and collectibles.' },
  { id: uuidv4(), name: 'Personalize Weapon Icon', category: 'icones', rarity: 'EPIC', description: 'High contrast visual trigger representing cosmetic customization tools.' },
  { id: uuidv4(), name: 'Domine Event Icon', category: 'icones', rarity: 'LEGENDARY', description: 'Golden crown action selector designed to trigger pro league ranking tables.' }
];

// Helper to determine price base from rarity tier
function getPriceByRarity(r: string): number {
  if (r === 'UNCOMMON') return 800;
  if (r === 'RARE') return 1500;
  if (r === 'EPIC') return 2500;
  if (r === 'LEGENDARY') return 4500;
  if (r === 'MYTHIC') return 8000;
  return 500; // COMMON
}

// Main Factory Orchestrator
export async function runAssetGenerationPipeline() {
  writePipelineLog('=== INICIANDO JIUSPEAK ASSET FACTORY V3 ===');
  
  try {
    // Phase 0: Prep folder system
    await initializeDirectories();
    writePipelineLog('[PHASE 0] Diretorios criados e estruturas mapeadas.');

    const manifestItems: ManifestItem[] = [];
    const dbItemsForSync: any[] = [];

    // Let's iterate through each asset and run the complete 10-step pipeline
    for (let index = 0; index < COSMETIC_ASSETS.length; index++) {
      const asset = COSMETIC_ASSETS[index];
      const stepPrefix = `[ASSET ${index + 1}/${COSMETIC_ASSETS.length}] [${asset.name}]`;
      
      writePipelineLog(`${stepPrefix} === Iniciando pipeline de 10 passos ===`);

      // Determine output file names
      const fileSlug = asset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const originalPngFilename = `${fileSlug}.png`;
      const optimizedWebpFilename = `${fileSlug}.webp`;

      const categoryPath = path.join(assetsDir, asset.category);
      const outputPngPath = path.join(categoryPath, originalPngFilename);
      const outputWebpPath = path.join(categoryPath, optimizedWebpFilename);

      // STEP 1 & STEP 2: Generate Original & Fallback Engine
      let originalBuffer: Buffer | null = null;

      // Priority 1: Imagen 4
      if (!originalBuffer) {
        originalBuffer = await generateImagenAsset(asset);
        if (originalBuffer) writePipelineLog(`${stepPrefix} [STEP 1] Gerado via Imagen 4.`);
      }

      // Priority 2: Gemini Native Image
      if (!originalBuffer) {
        originalBuffer = await generateGeminiAsset(asset);
        if (originalBuffer) writePipelineLog(`${stepPrefix} [STEP 1] Gerado via Gemini Native Image.`);
      }

      // Priority 3: Flux Dev
      if (!originalBuffer) {
        originalBuffer = await generateFluxAsset(asset);
        if (originalBuffer) writePipelineLog(`${stepPrefix} [STEP 1] Gerado via Flux Dev.`);
      }

      // Priority 4: Premium Procedural Local Vector SVG (100% stable offline guarantee)
      if (!originalBuffer) {
        writePipelineLog(`${stepPrefix} [STEP 1] Utilizando fallback Procedural Local Vector do Arquiteto.`);
        const svgContent = generateLocalSVG(asset);
        originalBuffer = await renderSVGToPNG(svgContent, 2048);
      }

      const rawBuffer = originalBuffer as Buffer;

      // STEP 2 & STEP 3: Remove Background & Process Borders
      writePipelineLog(`${stepPrefix} [STEP 2 & 3] Removendo fundo e definindo transparencia...`);
      const transparentBuffer = await removeBackground(rawBuffer);

      // STEP 4: Upscaling 4X (4096 x 4096 px)
      writePipelineLog(`${stepPrefix} [STEP 4] Executando upscaling 4x (4096px)...`);
      const upscaledBuffer = await upscaleAsset(transparentBuffer, 4096);

      // STEP 5: Thumbnail Multi-resolution Rendering (128x128, 256x256, 512x512)
      writePipelineLog(`${stepPrefix} [STEP 5] Redimensionando para miniaturas (128px, 256px, 512px)...`);
      const thumbSet = await generateThumbnails(transparentBuffer);

      // STEP 6: Conversion to high-efficiency WebP format
      writePipelineLog(`${stepPrefix} [STEP 6] Otimizando e exportando para WebP...`);
      const webpBuffer = await optimizeToWebP(transparentBuffer, 85);

      // Save generated physical files locally
      // A. Original PNG in high resolution
      await fs.writeFile(outputPngPath, transparentBuffer);
      // B. Lightweight WebP
      await fs.writeFile(outputWebpPath, webpBuffer);
      // C. Save Thumbnails inside category folders
      const thumb128Path = path.join(assetsDir, 'thumbnails', '128', `${fileSlug}-128.png`);
      const thumb256Path = path.join(assetsDir, 'thumbnails', '256', `${fileSlug}-256.png`);
      const thumb512Path = path.join(assetsDir, 'thumbnails', '512', `${fileSlug}-512.png`);

      await fs.writeFile(thumb128Path, thumbSet.t128);
      await fs.writeFile(thumb256Path, thumbSet.t256);
      await fs.writeFile(thumb512Path, thumbSet.t512);

      writePipelineLog(`${stepPrefix} Arquivos locais salvos com sucesso.`);

      // STEP 7: CDN Cloudflare R2 Upload
      writePipelineLog(`${stepPrefix} [STEP 7] Carregando arquivos para a CDN Cloudflare R2...`);
      const finalWebpCdnKey = `${asset.category}/${optimizedWebpFilename}`;
      const cdnUrl = await uploadToCDN(webpBuffer, finalWebpCdnKey, 'image/webp');

      // Populate records
      const price = getPriceByRarity(asset.rarity);

      // STEP 8: Store items to catalog manifest
      const relativePng = path.relative(assetsDir, outputPngPath);
      const relativeWebp = path.relative(assetsDir, outputWebpPath);
      const relativeThumb = path.relative(assetsDir, thumb256Path); // Use 256x256 as our default thumbnail link

      manifestItems.push({
        id: asset.id,
        name: asset.name,
        category: asset.category,
        rarity: asset.rarity,
        priceJT: price,
        tradable: true,
        equippable: true,
        usableInWebsite: true,
        usableInMobile: true,
        usableInJiuVerse: true,
        png: relativePng,
        webp: relativeWebp,
        thumbnail: relativeThumb,
        cdnUrl: cdnUrl
      });

      // Prepare database entries for PostgreSQL Synchronization
      dbItemsForSync.push({
        id: asset.id,
        name: asset.name,
        categorySlug: asset.category,
        rarity: asset.rarity,
        priceJT: price,
        tradable: true,
        equippable: true,
        usableInWebsite: true,
        usableInMobile: true,
        usableInJiuVerse: true,
        pngPath: relativePng,
        webpPath: relativeWebp,
        thumbnailPath: relativeThumb,
        cdnUrl: cdnUrl
      });

      writePipelineLog(`${stepPrefix} Complete!`);
    }

    // STEP 9: Generate central Manifest.json
    writePipelineLog('[STEP 8] Compilando manifest.json geral...');
    const manifestFileSaved = await createManifest(manifestItems, assetsDir);
    writePipelineLog(`[MANIFEST SAVED] ${manifestFileSaved}`);

    // STEP 10: PostgreSQL Database Prisma synchronization
    writePipelineLog('[STEP 9] Iniciando sincronizacao PostgreSQL com Prisma...');
    await syncAssetsToDatabase(dbItemsForSync);
    writePipelineLog('[DB SYNC SUCCESS] Registro persistido.');

    // Write a beautiful internal README inside assets folder
    const assetsReadmeContent = `# JIUSPEAK DIGITAL COSMETIC ASSETS CATALOG

Fábrica automática de assets de alta definição modelo AAA JiuSpeak.

## Detalhes de Formatos
Este diretório abriga todos os conteúdos gerados pelo pipeline:
- Original PNG: Alta definição e canal de transparência limpo.
- Optimized WEBP: Transmissão rápida, comprimido com subsample inteligente.
- Miniaturas: Grade com 3 resoluções especificadas (128px, 256px, 512px).
- Manifest.json: Banco local de consulta de propriedades, preços, raridades e URLs da CDN.

Desenvolvido por JiuSpeak Sênior.
`;
    await fs.writeFile(path.join(assetsDir, 'README.md'), assetsReadmeContent, 'utf8');

    // STEP 11: Compress ZIP
    writePipelineLog('[STEP 10] Iniciando compressao para o pacote final JiuSpeak_Assets_AAA.zip...');
    const outputZipFile = path.join(outputDir, 'JiuSpeak_Assets_AAA.zip');
    await createZipArchive(assetsDir, outputZipFile);
    writePipelineLog(`[ZIP SAVED] Pacote final pronto na pasta output: ${outputZipFile}`);

    writePipelineLog('=== JIUSPEAK ASSET FACTORY V3 FINALIZADO COM EXITO TOTAL ===');
  } catch (error: any) {
    writePipelineLog(`[CRITICAL PIPELINE FATAL ERROR] ${error.message || error}`);
    throw error;
  }
}

// Auto-run if executed directly as entrypoint script
if (process.argv[1] === import.meta.filename || process.argv[1]?.endsWith('generate-assets.ts')) {
  runAssetGenerationPipeline();
}
