import { PrismaClient } from '../client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_DATABASE_SEED !== 'true') {
    console.log('Seed bloqueado em produção');
    process.exit(0);
  }
  console.log('--- SEEDING JIUSPEAK ASSET FACTORY RECOGNIZED VALUES ---');

  // 1. Seed Categories
  const categories = [
    { name: 'Kimonos', slug: 'kimonos', description: 'AAA Character Kimonos for JiuVerse' },
    { name: 'Rashguards', slug: 'rashguards', description: 'Elite compression rash guards for NoGi' },
    { name: 'Medalhas', slug: 'medalhas', description: 'Historic championship gold/silver medals' },
    { name: 'Molduras', slug: 'molduras', description: 'High-status profile avatar board headers' },
    { name: 'Avatares Mal', slug: 'avatares-masculinos', description: 'Premium Male Practitioner Avatar models' },
    { name: 'Avatares Fem', slug: 'avatares-femininos', description: 'Premium Female Practitioner Avatar models' },
    { name: 'Ícones Portal', slug: 'icones', description: 'Sleek interface navigation buttons and icons' }
  ];

  for (const cat of categories) {
    await prisma.assetCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { name: cat.name, slug: cat.slug, description: cat.description }
    });
  }
  console.log('[SUCCESS] Categories seeded.');

  // 2. Seed Rarities
  const rarities = [
    { name: 'COMMON', colorHex: '#FFFDD0', priceMult: 1.0 },
    { name: 'UNCOMMON', colorHex: '#10B981', priceMult: 1.5 },
    { name: 'RARE', colorHex: '#3B82F6', priceMult: 2.2 },
    { name: 'EPIC', colorHex: '#A855F7', priceMult: 3.5 },
    { name: 'LEGENDARY', colorHex: '#F59E0B', priceMult: 5.0 },
    { name: 'MYTHIC', colorHex: '#EF4444', priceMult: 10.0 }
  ];

  for (const rarity of rarities) {
    await prisma.assetRarity.upsert({
      where: { name: rarity.name },
      update: { colorHex: rarity.colorHex, priceMult: rarity.priceMult },
      create: { name: rarity.name, colorHex: rarity.colorHex, priceMult: rarity.priceMult }
    });
  }
  console.log('[SUCCESS] Rarities seeded.');

  console.log('--- SEEDING OF MASTER ASSETS COMPLETED REGULARLY ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
