/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Ensure database URL is loaded
import dotenv from "dotenv";
dotenv.config();

const BASE_DIR = path.join(process.cwd(), "public", "assets", "avatars");

const BELT_MAPPINGS: Record<string, { name: string; rarity: string; priceKC: number }> = {
  white: { name: "Faixa Branca", rarity: "COMMON", priceKC: 400 },
  grey: { name: "Faixa Cinza", rarity: "COMMON", priceKC: 500 },
  yellow: { name: "Faixa Amarela", rarity: "RARE", priceKC: 600 },
  orange: { name: "Faixa Laranja", rarity: "RARE", priceKC: 700 },
  green: { name: "Faixa Verde", rarity: "RARE", priceKC: 800 },
  blue: { name: "Faixa Azul", rarity: "RARE", priceKC: 1000 },
  purple: { name: "Faixa Roxa", rarity: "EPIC", priceKC: 1500 },
  brown: { name: "Faixa Marrom", rarity: "EPIC", priceKC: 2000 },
  black: { name: "Faixa Preta", rarity: "LEGENDARY", priceKC: 5000 },
  coral: { name: "Faixa Coral", rarity: "LEGENDARY", priceKC: 6000 },
  red_black: { name: "Faixa Vermelha e Preta", rarity: "LEGENDARY", priceKC: 7500 },
  red_white: { name: "Faixa Vermelha e Branca", rarity: "LEGENDARY", priceKC: 9000 },
};

function capitalize(s: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface ScannedAvatar {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  imageUrl: string;
  priceKC: number;
  stock: number;
  active: boolean;
}

export function scanAvatarsDirectory(): ScannedAvatar[] {
  console.log(`🔍 Iniciando varredura no repositório de avatares: ${BASE_DIR}`);

  // Create folders if they don't exist
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }

  const femaleDir = path.join(BASE_DIR, "female");
  const maleDir = path.join(BASE_DIR, "male");

  if (!fs.existsSync(femaleDir)) fs.mkdirSync(femaleDir, { recursive: true });
  if (!fs.existsSync(maleDir)) fs.mkdirSync(maleDir, { recursive: true });

  const scanned: ScannedAvatar[] = [];

  const scanDir = (dir: string, gender: "female" | "male") => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (![".webp", ".png", ".jpg", ".jpeg", ".svg"].includes(ext)) {
        continue;
      }

      const baseName = path.basename(file, ext); // e.g., "isabella_black"
      const parts = baseName.split("_");
      if (parts.length < 2) {
        // e.g. "isabella.webp" -> fallback to white belt
        parts.push("white");
      }

      const characterRaw = parts[0];
      const beltRaw = parts.slice(1).join("_").toLowerCase(); // e.g. "red_black"

      const beltInfo = BELT_MAPPINGS[beltRaw] || BELT_MAPPINGS["white"];
      const characterName = capitalize(characterRaw);

      const prodId = `prod_imported_avatar_${gender}_${characterRaw}_${beltRaw}`;
      const name = `${characterName} - ${beltInfo.name}`;
      const description = `Avatar Premium ${characterName} ${beltInfo.name}. Gênero: ${gender === "female" ? "Feminino" : "Masculino"}.`;

      // Public URL generation. Since /public contents are served directly at /, the URL path is:
      const imageUrl = `/assets/avatars/${gender}/${file}`;

      scanned.push({
        id: prodId,
        name,
        description,
        category: "AVATAR",
        rarity: beltInfo.rarity,
        imageUrl,
        priceKC: beltInfo.priceKC,
        stock: 999999,
        active: true,
      });
    }
  };

  scanDir(femaleDir, "female");
  scanDir(maleDir, "male");

  console.log(`✅ Varredura concluída. Encontrados ${scanned.length} arquivos WebP correspondentes.`);
  return scanned;
}

async function runImport() {
  const avatars = scanAvatarsDirectory();
  if (avatars.length === 0) {
    console.log("ℹ️ Nenhum avatar físico encontrado para importar no momento.");
    console.log("💡 Para importar, adicione arquivos de imagem em: public/assets/avatars/female/ ou male/");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("🌱 Conectado ao banco de dados. Gravando produtos encontrados...");

    for (const av of avatars) {
      await prisma.storeProduct.upsert({
        where: { id: av.id },
        update: {
          name: av.name,
          description: av.description,
          priceKC: av.priceKC,
          category: av.category,
          rarity: av.rarity as any,
          imageUrl: av.imageUrl,
          stock: av.stock,
          active: av.active,
        },
        create: {
          id: av.id,
          name: av.name,
          description: av.description,
          priceKC: av.priceKC,
          category: av.category,
          rarity: av.rarity as any,
          imageUrl: av.imageUrl,
          stock: av.stock,
          active: av.active,
        },
      });
      console.log(`✨ Upserted: ${av.name} [${av.id}]`);
    }

    console.log("🏆 Importação de avatares físicos concluída com sucesso!");
  } catch (err: any) {
    console.error("❌ Erro durante a gravação dos avatares no banco:", err);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if this file is run directly (not loaded as a module)
if (process.argv[1] && process.argv[1].endsWith("import-avatars.ts")) {
  runImport();
}
