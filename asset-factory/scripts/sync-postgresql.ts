import { PrismaClient } from '../database/client';

const prisma = new PrismaClient();

export interface AssetRecord {
  id: string;
  name: string;
  categorySlug: string;
  rarity: string;
  priceJT: number;
  tradable: boolean;
  equippable: boolean;
  usableInWebsite: boolean;
  usableInMobile: boolean;
  usableInJiuVerse: boolean;
  pngPath: string;
  webpPath: string;
  thumbnailPath: string;
  cdnUrl: string;
}

/**
 * Synchronizes generated asset records to the PostgreSQL database via Prisma client.
 */
export async function syncAssetsToDatabase(assetList: AssetRecord[]): Promise<void> {
  console.log(`[DB SYNC] Syncing ${assetList.length} asset records to PostgreSQL...`);
  
  try {
    // 1. Fetch categories and rarities we previously seeded to map ids correctly
    const categories = await prisma.assetCategory.findMany();
    const rarities = await prisma.assetRarity.findMany();

    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
    const rarityMap = new Map(rarities.map(r => [r.name, r.id]));

    let syncedCount = 0;

    for (const item of assetList) {
      // Find category ID or fall back to creating one dynamically
      let categoryId = categoryMap.get(item.categorySlug);
      if (!categoryId) {
        console.log(`[DB SYNC] Category "${item.categorySlug}" not found. Creating...`);
        const newCat = await prisma.assetCategory.create({
          data: {
            name: item.categorySlug.toUpperCase(),
            slug: item.categorySlug,
            description: `Auto-generated category for ${item.categorySlug}`
          }
        });
        categoryId = newCat.id;
        categoryMap.set(item.categorySlug, categoryId);
      }

      // Find rarity ID or use standard COMMON
      let rarityId = rarityMap.get(item.rarity.toUpperCase()) || rarityMap.get('COMMON');
      if (!rarityId) {
        // Fallback create COMMON
        const commonRarity = await prisma.assetRarity.create({
          data: { name: 'COMMON', colorHex: '#FFFDD0', priceMult: 1.0 }
        });
        rarityId = commonRarity.id;
        rarityMap.set('COMMON', rarityId);
      }

      // Sync master asset
      // Check if entry exists or update it
      const existingProduct = await prisma.asset.findFirst({
        where: { name: item.name, categoryId: categoryId }
      });

      if (existingProduct) {
        await prisma.asset.update({
          where: { id: existingProduct.id },
          data: {
            priceJT: item.priceJT,
            tradable: item.tradable,
            equippable: item.equippable,
            usableInWebsite: item.usableInWebsite,
            usableInMobile: item.usableInMobile,
            usableInJiuVerse: item.usableInJiuVerse,
            pngPath: item.pngPath,
            webpPath: item.webpPath,
            thumbnailPath: item.thumbnailPath,
            cdnUrl: item.cdnUrl
          }
        });
      } else {
        await prisma.asset.create({
          data: {
            id: item.id,
            name: item.name,
            categoryId: categoryId,
            rarityId: rarityId,
            priceJT: item.priceJT,
            tradable: item.tradable,
            equippable: item.equippable,
            usableInWebsite: item.usableInWebsite,
            usableInMobile: item.usableInMobile,
            usableInJiuVerse: item.usableInJiuVerse,
            pngPath: item.pngPath,
            webpPath: item.webpPath,
            thumbnailPath: item.thumbnailPath,
            cdnUrl: item.cdnUrl
          }
        });
      }

      syncedCount++;
    }

    console.log(`[DB SYNC SUCCESS] Completed! Successfully upserted ${syncedCount} assets.`);
  } catch (err: any) {
    console.error(`[DB SYNC ERROR] Synchronization failed:`, err?.message || err);
    console.warn(`[WARN] Database update skipped. Proceeding on memory catalog.`);
  } finally {
    await prisma.$disconnect();
  }
}
