import sharp from 'sharp';

export interface AssetData {
  id: string;
  name: string;
  category: 'kimonos' | 'rashguards' | 'medalhas' | 'molduras' | 'avatares' | 'icones';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  description: string;
}

/**
 * High-fidelity vector SVG artwork generator for the JiuSpeak cosmetic asset pipeline.
 * Paints beautiful and highly detailed game items in the designated PBR-inspired Black Gold Luxury style.
 */
export function generateLocalSVG(asset: AssetData): string {
  const r = asset.rarity;
  const c = asset.category;

  // Visual styling colors
  let rarityColor = "#FFFDD0"; // Default cream gold
  let gemColor = "#E2E8F0";
  let bgGradCenter = "rgba(43, 43, 56, 0.5)";

  if (r === 'UNCOMMON') {
    rarityColor = "#10B981"; // Green
    gemColor = "#A7F3D0";
    bgGradCenter = "rgba(6, 78, 59, 0.6)";
  } else if (r === 'RARE') {
    rarityColor = "#3B82F6"; // Blue
    gemColor = "#93C5FD";
    bgGradCenter = "rgba(30, 58, 138, 0.6)";
  } else if (r === 'EPIC') {
    rarityColor = "#A855F7"; // Purple
    gemColor = "#C084FC";
    bgGradCenter = "rgba(88, 28, 135, 0.65)";
  } else if (r === 'LEGENDARY') {
    rarityColor = "#F59E0B"; // Amber Gold
    gemColor = "#FDE047";
    bgGradCenter = "rgba(120, 53, 4, 0.7)";
  } else if (r === 'MYTHIC') {
    rarityColor = "#EF4444"; // Mythic Red
    gemColor = "#F43F5E";
    bgGradCenter = "rgba(127, 29, 29, 0.8)";
  }

  // Base SVG wrapper with luxury gradients & filters
  let svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${bgGradCenter}" stop-opacity="1" />
          <stop offset="100%" stop-color="#050508" stop-opacity="1" />
        </radialGradient>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D4AF37" />
          <stop offset="30%" stop-color="#FFFDD0" />
          <stop offset="70%" stop-color="#AA7C11" />
          <stop offset="100%" stop-color="#D4AF37" />
        </linearGradient>
        <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0" />
          <stop offset="50%" stop-color="#94A3B8" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="25" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="15" stdDeviation="10" flood-color="#000" flood-opacity="0.95" />
        </filter>
      </defs>

      <!-- Luxury Slate Canvas Backdrop -->
      <rect width="1000" height="1000" fill="url(#bg-grad)" />

      <!-- Tech-Esports Radar Lines -->
      <circle cx="500" cy="500" r="440" fill="none" stroke="${rarityColor}" stroke-opacity="0.08" stroke-width="2" />
      <circle cx="500" cy="500" r="360" fill="none" stroke="url(#gold-grad)" stroke-opacity="0.05" stroke-dasharray="10, 15" stroke-width="1.5" />
      <line x1="500" y1="60" x2="500" y2="940" stroke="url(#gold-grad)" stroke-opacity="0.04" stroke-dasharray="6, 6" />
      <line x1="60" y1="500" x2="940" y2="500" stroke="url(#gold-grad)" stroke-opacity="0.04" stroke-dasharray="6, 6" />
  `;

  // Draw Specific Categories with premium AAA asset features
  if (c === 'kimonos') {
    svg += `
      <!-- High-Fidelity AAA Gi Render -->
      <g filter="url(#shadow)">
        <!-- Kimono Outer Silhouette -->
        <path d="M220,200 L780,200 L840,480 L720,480 L700,340 L500,660 L300,340 L280,480 L160,480 Z" fill="#111116" stroke="url(#gold-grad)" stroke-width="8" stroke-linejoin="round" />
        <!-- Inner Lapel Folds -->
        <path d="M500,200 L360,540 L500,780 L640,540 Z" fill="#1E1E24" stroke="url(#gold-grad)" stroke-width="4" stroke-linejoin="round" />
        <path d="M260,200 L500,640 L500,780 L260,200 Z" fill="#16161C" opacity="0.9" />

        <!-- Brand Highlights -->
        <line x1="500" y1="200" x2="340" y2="580" stroke="url(#gold-grad)" stroke-width="12" />
        <line x1="500" y1="200" x2="660" y2="580" stroke="url(#gold-grad)" stroke-width="12" />

        <!-- Master Rank Belt representation -->
        <rect x="310" y="560" width="380" height="64" fill="#121212" stroke="url(#gold-grad)" stroke-width="6" rx="4" />
        <rect x="520" y="560" width="90" height="64" fill="#EF4444" stroke="#000" stroke-width="3" />
        <!-- Belt stripes (indicates practitioner rank) -->
        <rect x="540" y="560" width="8" height="64" fill="#FFF" />
        <rect x="555" y="560" width="8" height="64" fill="#FFF" />
        <rect x="570" y="560" width="8" height="64" fill="#FFF" />
        <rect x="585" y="560" width="8" height="64" fill="#FFF" />
      </g>
      <text x="500" y="860" fill="url(#gold-grad)" font-family="Courier New, monospace" font-size="34" font-weight="900" text-anchor="middle" letter-spacing="10">${asset.name.toUpperCase()}</text>
    `;
  } else if (c === 'rashguards') {
    svg += `
      <!-- Professional Athlete Tactical Compression Wear -->
      <g filter="url(#shadow)">
        <path d="M320,240 L680,240 L820,430 L720,470 L680,360 L640,800 L360,800 L320,360 L280,470 L180,430 Z" fill="#101015" stroke="url(#gold-grad)" stroke-width="8" stroke-linejoin="round" />
        <!-- Core body dynamic layout -->
        <path d="M380,340 C440,440 440,620 380,760 M620,340 C560,440 560,620 620,760" fill="none" stroke="${rarityColor}" stroke-opacity="0.3" stroke-width="5" />
        <!-- Dynamic gold emblem -->
        <polygon points="500,420 550,450 550,510 500,540 450,510 450,450" fill="#1F2937" stroke="url(#gold-grad)" stroke-width="4" />
        <polygon points="500,440 520,485 480,485" fill="url(#gold-grad)" />
      </g>
      <text x="500" y="870" fill="url(#gold-grad)" font-family="sans-serif" font-size="32" font-weight="900" text-anchor="middle" letter-spacing="8">${asset.name.toUpperCase()}</text>
    `;
  } else if (c === 'medalhas') {
    svg += `
      <!-- Sovereign World Championship Gold Medal -->
      <g filter="url(#shadow)">
        <!-- Grand cross-folded ribbon -->
        <polygon points="340,120 500,480 660,120" fill="url(#gold-grad)" stroke="#111" stroke-width="4" />
        <path d="M410,120 L500,440 L590,120" fill="#0038A8" opacity="0.85" />
        <path d="M440,120 L500,440 L560,120" fill="#FFDF00" opacity="0.95" />

        <!-- Solid gold heavy core -->
        <circle cx="500" cy="570" r="180" fill="url(#gold-grad)" stroke="#1A1A1E" stroke-width="12" />
        <circle cx="500" cy="570" r="150" fill="none" stroke="#FFF" stroke-opacity="0.2" stroke-width="4" stroke-dasharray="8,8" />
        
        <!-- Center shield of honors -->
        <polygon points="500,460 580,510 560,620 500,670 440,620 420,510" fill="#181820" stroke="url(#gold-grad)" stroke-width="6" />
        <polygon points="500,480 512,520 555,520 520,545 533,585 500,560 467,585 480,545 445,520 488,520" fill="url(#gold-grad)" filter="url(#glow)" />
      </g>
      <text x="500" y="860" fill="url(#gold-grad)" font-family="serif" font-size="34" font-weight="900" text-anchor="middle" letter-spacing="6">${asset.name.toUpperCase()}</text>
    `;
  } else if (c === 'molduras') {
    svg += `
      <!-- Royal Crown Custom Profile Badge Interface Frame -->
      <g filter="url(#shadow)">
        <!-- Placeholder user silhouette inside -->
        <circle cx="500" cy="500" r="140" fill="#AAA" opacity="0.25" />
        <path d="M360,670 Q500,510 640,670 Z" fill="#AAA" opacity="0.25" />

        <!-- Double layered luxury border -->
        <rect x="150" y="150" width="700" height="700" rx="36" fill="none" stroke="url(#gold-grad)" stroke-width="24" />
        <rect x="138" y="138" width="724" height="724" rx="48" fill="none" stroke="#12121A" stroke-width="10" />

        <!-- Crown Ornament (Top Center) -->
        <path d="M380,150 L440,50 L500,130 L560,50 L620,150 Z" fill="url(#gold-grad)" stroke="#000" stroke-width="4" />
        <circle cx="440" cy="50" r="8" fill="${gemColor}" />
        <circle cx="560" cy="50" r="8" fill="${gemColor}" />
        <circle cx="500" cy="130" r="10" fill="${gemColor}" />

        <!-- Bottom Banner Display (Rarity-tied) -->
        <rect x="300" y="800" width="400" height="80" fill="#111116" stroke="url(#gold-grad)" stroke-width="6" rx="10" />
        <text x="500" y="852" fill="url(#gold-grad)" font-family="monospace" font-size="32" font-weight="800" text-anchor="middle" letter-spacing="4">${asset.name.toUpperCase()}</text>
      </g>
    `;
  } else if (c === 'avatares') {
    let beltColor = "#FFF";
    if (asset.name.includes("Azul")) beltColor = "#3B82F6";
    else if (asset.name.includes("Roxa")) beltColor = "#A855F7";
    else if (asset.name.includes("Marrom")) beltColor = "#8B4513";
    else if (asset.name.includes("Preta") || asset.name.includes("Preto")) beltColor = "#1A1A1A";
    else if (asset.name.includes("Profess")) beltColor = "#DC2626";
    else if (asset.name.includes("Campeã") || asset.name.includes("Campeão")) beltColor = "url(#gold-grad)";

    svg += `
      <!-- Cyber Samurai Character Avatar Profile -->
      <g filter="url(#shadow)" transform="translate(0, 40)">
        <circle cx="500" cy="450" r="260" fill="#0A0A0F" stroke="url(#gold-grad)" stroke-width="8" />
        <circle cx="500" cy="450" r="280" fill="none" stroke="${rarityColor}" stroke-opacity="0.3" stroke-width="4" stroke-dasharray="10, 10" filter="url(#glow)" />
        
        <!-- Character Mask -->
        <path d="M320,560 C320,320 680,320 680,560 L610,680 L390,680 Z" fill="#16161D" stroke="url(#gold-grad)" stroke-width="6" />
        <!-- Glowing focus eyes -->
        <circle cx="440" cy="450" r="14" fill="${gemColor}" filter="url(#glow)" />
        <circle cx="560" cy="450" r="14" fill="${gemColor}" filter="url(#glow)" />

        <!-- Knotted high rank belt -->
        <path d="M380,670 L620,670" stroke="${beltColor}" stroke-width="36" stroke-linecap="round" />
        <circle cx="500" cy="670" r="20" fill="url(#gold-grad)" />
      </g>
      <text x="500" y="850" fill="url(#gold-grad)" font-family="sans-serif" font-size="32" font-weight="900" text-anchor="middle" letter-spacing="4">${asset.name.toUpperCase()}</text>
    `;
  } else if (c === 'icones') {
    let glyph = "";
    if (asset.name.includes("Kimono")) {
      glyph = `<path d="M350,300 L650,300 L720,480 L620,480 L600,380 L500,550 L400,380 L380,480 L280,480 Z" fill="none" stroke="url(#gold-grad)" stroke-width="24" stroke-linejoin="round" />`;
    } else if (asset.name.includes("Rashguard")) {
      glyph = `<path d="M380,300 L620,300 L700,450 L600,480 L500,740 L400,480 L300,450 Z" fill="none" stroke="url(#gold-grad)" stroke-width="24" stroke-linejoin="round" />`;
    } else if (asset.name.includes("Medalha")) {
      glyph = `
        <circle cx="500" cy="600" r="130" fill="none" stroke="url(#gold-grad)" stroke-width="24" />
        <polygon points="400,200 500,480 600,200" fill="none" stroke="url(#gold-grad)" stroke-width="20" />
      `;
    } else if (asset.name.includes("Moldura")) {
      glyph = `<rect x="300" y="300" width="400" height="400" rx="30" fill="none" stroke="url(#gold-grad)" stroke-width="28" />`;
    } else if (asset.name.includes("Avatar")) {
      glyph = `
        <circle cx="500" cy="400" r="110" fill="none" stroke="url(#gold-grad)" stroke-width="24" />
        <path d="M320,680 Q500,500 680,680" fill="none" stroke="url(#gold-grad)" stroke-width="24" />
      `;
    } else if (asset.name.includes("Coleção")) {
      glyph = `
        <rect x="280" y="320" width="440" height="360" rx="15" fill="none" stroke="url(#gold-grad)" stroke-width="24" />
        <circle cx="500" cy="500" r="40" fill="url(#gold-grad)" />
      `;
    } else if (asset.name.includes("Personalize")) {
      glyph = `
        <circle cx="430" cy="450" r="90" fill="none" stroke="url(#gold-grad)" stroke-width="20" />
        <line x1="560" y1="360" x2="680" y2="240" stroke="url(#gold-grad)" stroke-width="24" stroke-linecap="round" />
        <circle cx="500" cy="500" r="30" fill="url(#gold-grad)" />
      `;
    } else if (asset.name.includes("Domine")) {
      glyph = `<path d="M320,580 L410,300 L500,440 L590,300 L680,580 Z" fill="none" stroke="url(#gold-grad)" stroke-width="26" stroke-linejoin="round" />`;
    }

    svg += `
      <!-- Sleek High Contrast Menu Button Glyphs -->
      <g filter="url(#shadow)">
        <circle cx="500" cy="500" r="280" fill="#0A0A0F" stroke="url(#gold-grad)" stroke-width="12" />
        <circle cx="500" cy="500" r="240" fill="none" stroke="${rarityColor}" stroke-opacity="0.1" stroke-width="4" stroke-dasharray="12,12" />
        ${glyph}
      </g>
      <text x="500" y="860" fill="url(#gold-grad)" font-family="Courier New, monospace" font-size="32" font-weight="900" text-anchor="middle" letter-spacing="4">${asset.name.toUpperCase()}</text>
    `;
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Procedural implementation mimicking super-resolution upscaled export.
 */
export async function renderSVGToPNG(svgText: string, density = 2048): Promise<Buffer> {
  return await sharp(Buffer.from(svgText))
    .resize(density, density)
    .png()
    .toBuffer();
}
