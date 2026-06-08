/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AvatarBase {
  id: string;
  name: string;
  description: string;
  gender: "male" | "female";
  bgColor1: string;
  bgColor2: string;
  skinColor: string;
  eyeColor: string;
  hairStyle: "ponytail" | "bun" | "curly_bun" | "braid" | "oriental" | "short_young" | "long_tied" | "curly_afro" | "short_cropped" | "messy" | "buzz" | "bearded" | "wise_old" | "neat_cut";
  hairColor: string;
  giColor: string;
  giLapelColor: string;
}

export const BASE_CHARACTERS: AvatarBase[] = [
  // FEMALE CHARACTERS (1 to 12)
  {
    id: "isabella",
    name: "Isabella",
    description: "Avatar feminino brasileiro, especialista em guarda fechada clássica e botes velozes.",
    gender: "female",
    bgColor1: "#4c1d95", // Purple gradient
    bgColor2: "#1e1b4b",
    skinColor: "#E8A26A", // Brazilian olive
    eyeColor: "#5c3d24", // Brown eyes
    hairStyle: "ponytail", // Rabo de cavalo alto
    hairColor: "#2D1D13", // Dark brown hair
    giColor: "#F9FAFB", // White GI
    giLapelColor: "#E5E7EB"
  },
  {
    id: "valentina",
    name: "Valentina",
    description: "Avatar feminino brasileiro, competidora destemida com olhar tático concentrado.",
    gender: "female",
    bgColor1: "#7c3aed", // Purple neon gradient
    bgColor2: "#0f052d",
    skinColor: "#FCD0A1", // Fair skin
    eyeColor: "#1a1a1a", // Deep black/dark brown eyes
    hairStyle: "bun", // Coque de luta
    hairColor: "#111111", // Black hair
    giColor: "#111827", // Premium black GI
    giLapelColor: "#374151"
  },
  {
    id: "sophia",
    name: "Sophia",
    description: "Avatar feminino de postura elegante, técnica polida e passagens milimétricas.",
    gender: "female",
    bgColor1: "#ec4899", // Pink premium gradient
    bgColor2: "#500724",
    skinColor: "#FFD1B3", // Fair skin
    eyeColor: "#3b82f6", // Blue eyes
    hairStyle: "short_young", // Blonde short cut
    hairColor: "#F59E0B", // Golden blonde hair
    giColor: "#F9FAFB", // White GI
    giLapelColor: "#E5E7EB"
  },
  {
    id: "camila",
    name: "Camila",
    description: "Avatar feminino brasileiro, mestre de transições laterais e ataques na trança.",
    gender: "female",
    bgColor1: "#0ea5e9", // Blue neon gradient
    bgColor2: "#042f44",
    skinColor: "#D48D57", // Moreno skin
    eyeColor: "#4E2F1B",
    hairStyle: "braid", // Trança lateral
    hairColor: "#3A2212", // Auburn dark hair
    giColor: "#1D4ED8", // Premium blue GI
    giLapelColor: "#1E40AF"
  },
  {
    id: "maya",
    name: "Maya",
    description: "Avatar feminino afro-brasileira, cheia de elasticidade e especialista em triângulos.",
    gender: "female",
    bgColor1: "#6d28d9", // Purple gradient
    bgColor2: "#2e1065",
    skinColor: "#7c411b", // Afro skin
    eyeColor: "#321d10",
    hairStyle: "curly_bun", // Cacheado preso
    hairColor: "#0a0a0a",
    giColor: "#F9FAFB", // White GI
    giLapelColor: "#E5E7EB"
  },
  {
    id: "helena",
    name: "Helena",
    description: "Avatar feminino descendência oriental, precisão implacável nas finalizações de braço.",
    gender: "female",
    bgColor1: "#be185d", // Dark pink gradient
    bgColor2: "#3f0712",
    skinColor: "#FEDB9B", // Oriental light skin
    eyeColor: "#232323",
    hairStyle: "oriental", // Cabelo curto oriental liso
    hairColor: "#0e0e0e",
    giColor: "#111827", // Black GI
    giLapelColor: "#374151"
  },
  {
    id: "bianca",
    name: "Bianca",
    description: "Avatar feminino jovem brasileira, velocidade insana nos giros de guarda Berimbolo.",
    gender: "female",
    bgColor1: "#0284c7", // Vibrant blue gradient
    bgColor2: "#082f49",
    skinColor: "#E8A26A",
    eyeColor: "#3d2212",
    hairStyle: "long_tied", // Cabelo longo rabo de cavalo padrão
    hairColor: "#4A2E1C",
    giColor: "#1D4ED8", // Blue GI
    giLapelColor: "#1E40AF"
  },
  {
    id: "gabriela",
    name: "Gabriela",
    description: "Avatar feminino, sorriso no rosto mas pressão sufocante na montada.",
    gender: "female",
    bgColor1: "#f472b6", // Light pink gradient
    bgColor2: "#4c0519",
    skinColor: "#FCD0A1",
    eyeColor: "#502d16",
    hairStyle: "ponytail",
    hairColor: "#3d1e08",
    giColor: "#F9FAFB", // White GI
    giLapelColor: "#E5E7EB"
  },
  {
    id: "rafaela",
    name: "Rafaela",
    description: "Avatar feminino campeã refinada, vestindo lapela com fios dourados imperiais.",
    gender: "female",
    bgColor1: "#d97706", // Gold/Amber gradient
    bgColor2: "#451a03",
    skinColor: "#E8A26A",
    eyeColor: "#3a210f",
    hairStyle: "bun",
    hairColor: "#1a1008",
    giColor: "#111827", // Black GI
    giLapelColor: "#FBBF24" // Gold lapels
  },
  {
    id: "olivia",
    name: "Olivia",
    description: "Avatar feminino loira instrutora mestre da didática e quedas de quadril.",
    gender: "female",
    bgColor1: "#6b7280", // Silver gradient
    bgColor2: "#111827",
    skinColor: "#FFD1B3",
    eyeColor: "#059669", // Dark green eyes
    hairStyle: "long_tied",
    hairColor: "#fbbf24", // Golden blonde hair
    giColor: "#F9FAFB", // White GI
    giLapelColor: "#9CA3AF"
  },
  {
    id: "julia",
    name: "Júlia",
    description: "Avatar feminino brasileira campeã sul-americana peso pluma, guarda ativa.",
    gender: "female",
    bgColor1: "#1d4ed8", // Royal blue gradient
    bgColor2: "#1e1b4b",
    skinColor: "#FCD0A1",
    eyeColor: "#4a3525",
    hairStyle: "braid",
    hairColor: "#1c110a",
    giColor: "#1D4ED8", // Blue GI
    giLapelColor: "#1E40AF"
  },
  {
    id: "larissa",
    name: "Larissa",
    description: "Avatar feminino faixa-preta consagrada veterana de mil batalhas.",
    gender: "female",
    bgColor1: "#991b1b", // Dark red gradient
    bgColor2: "#450a0a",
    skinColor: "#E8A26A",
    eyeColor: "#22140a",
    hairStyle: "long_tied",
    hairColor: "#111111",
    giColor: "#111827", // Black GI
    giLapelColor: "#EF4444" // Deep red lapels
  },

  // MALE CHARACTERS (13 to 24)
  {
    id: "lucas",
    name: "Lucas",
    description: "Avatar masculino brasileiro, cabelo cacheado, focando no desenvolvimento de pegadas.",
    gender: "male",
    bgColor1: "#4b5563", // Gray premium
    bgColor2: "#1f2937",
    skinColor: "#D48D57", // Moreno brasileiro
    eyeColor: "#2e1a0b",
    hairStyle: "curly_afro", // Cacheado bagunçado
    hairColor: "#15100c",
    giColor: "#F9FAFB", // White GI
    giLapelColor: "#E5E7EB"
  },
  {
    id: "thiago",
    name: "Thiago",
    description: "Avatar masculino brasileiro, atleta veloz especialista em passagens de guarda em pé.",
    gender: "male",
    bgColor1: "#1e3a8a", // Dark blue gradient
    bgColor2: "#070a1e",
    skinColor: "#E8A26A",
    eyeColor: "#3c2108",
    hairStyle: "buzz", // Cabelo curto raspado de atleta
    hairColor: "#0a0a0a",
    giColor: "#1D4ED8", // Blue GI
    giLapelColor: "#1E40AF"
  },
  {
    id: "enzo",
    name: "Enzo",
    description: "Avatar masculino estrategista com corte degradê técnico, mestre de chaves de calcanhar.",
    gender: "male",
    bgColor1: "#581c87", // Purple premium gradient
    bgColor2: "#17012c",
    skinColor: "#FCD0A1",
    eyeColor: "#111111",
    hairStyle: "short_cropped", // Corte degrade de luta
    hairColor: "#181818",
    giColor: "#111827", // Black GI
    giLapelColor: "#374151"
  },
  {
    id: "gabriel",
    name: "Gabriel",
    description: "Avatar masculino competidor nato, focado no topo absoluto do pódio esportivo.",
    gender: "male",
    bgColor1: "#475569", // Silver/slate gradient
    bgColor2: "#0f172a",
    skinColor: "#FFD1B3",
    eyeColor: "#1e3a8a", // Soft blue-ish dark eyes
    hairStyle: "short_cropped",
    hairColor: "#332211",
    giColor: "#F9FAFB", // White GI
    giLapelColor: "#D1D5DB"
  },
  {
    id: "noah",
    name: "Noah",
    description: "Avatar masculino jovem promessa ágil, sempre focado nas transições para as costas.",
    gender: "male",
    bgColor1: "#06b6d4", // Vibrant cyan/blue gradient
    bgColor2: "#083344",
    skinColor: "#FFD1B3",
    eyeColor: "#047857", // Green eyes
    hairStyle: "messy", // Cabelo jovem bagunçado
    hairColor: "#D97706", // Dark blonde/sandy hair
    giColor: "#1D4ED8", // Blue GI
    giLapelColor: "#1E40AF"
  },
  {
    id: "rafael",
    name: "Rafael",
    description: "Avatar masculino negro de porte imponente com detalhes dourados no kimono fúria.",
    gender: "male",
    bgColor1: "#d97706", // Gold gradient
    bgColor2: "#451a03",
    skinColor: "#5C3818", // Dark skin tone
    eyeColor: "#1a1005",
    hairStyle: "buzz",
    hairColor: "#050505",
    giColor: "#111827", // Black GI
    giLapelColor: "#FBBF24" // Gold lapels
  },
  {
    id: "bruno",
    name: "Bruno",
    description: "Avatar masculino passador implacável, focado no esmagamento tradicional no controle lateral.",
    gender: "male",
    bgColor1: "#991b1b", // Dark red
    bgColor2: "#450a0a",
    skinColor: "#E8A26A",
    eyeColor: "#3a2512",
    hairStyle: "buzz",
    hairColor: "#222",
    giColor: "#111827", // Black GI
    giLapelColor: "#374151"
  },
  {
    id: "kenji",
    name: "Kenji",
    description: "Avatar masculino de descendência nikkei, paciência samurai e contra-ataques precisos.",
    gender: "male",
    bgColor1: "#d1d5db", // Light silver
    bgColor2: "#374151",
    skinColor: "#FCD0A1",
    eyeColor: "#111111",
    hairStyle: "oriental", // Cabelo samurai oriental liso preto
    hairColor: "#0f0f0f",
    giColor: "#F9FAFB", // White GI
    giLapelColor: "#E5E7EB"
  },
  {
    id: "diego",
    name: "Diego",
    description: "Avatar masculino wrestler, agressividade controlada em quedas explosivas de single leg.",
    gender: "male",
    bgColor1: "#4c1d95", // Purple gradient
    bgColor2: "#0f052d",
    skinColor: "#D48D57",
    eyeColor: "#452811",
    hairStyle: "buzz",
    hairColor: "#121212",
    giColor: "#F9FAFB", // White GI
    giLapelColor: "#E5E7EB"
  },
  {
    id: "miguel",
    name: "Miguel",
    description: "Avatar masculino experiente professor faixa coral, liderança virtuosa.",
    gender: "male",
    bgColor1: "#ea580c", // Coral orange / gold blend
    bgColor2: "#431407",
    skinColor: "#E8A26A",
    eyeColor: "#28180d",
    hairStyle: "bearded", // Com barba respeitosa
    hairColor: "#111111",
    giColor: "#111827", // Black GI
    giLapelColor: "#FBBF24" // Gold details
  },
  {
    id: "arthur",
    name: "Arthur",
    description: "Avatar masculino loiro de estilo europeu, joga na meia guarda profunda com paciência.",
    gender: "male",
    bgColor1: "#1e40af", // Royal blue
    bgColor2: "#0f172a",
    skinColor: "#FFD1B3",
    eyeColor: "#2563eb", // Blue eyes
    hairStyle: "messy",
    hairColor: "#fbbf24", // Blonde
    giColor: "#1D4ED8", // Blue GI
    giLapelColor: "#1E40AF"
  },
  {
    id: "victor",
    name: "Victor",
    description: "Avatar masculino mestre veterano lendário de cabelos grisalhos e alma de bronze.",
    gender: "male",
    bgColor1: "#374151", // Graphite gradient
    bgColor2: "#030712",
    skinColor: "#FCD0A1",
    eyeColor: "#443c33",
    hairStyle: "wise_old", // Grisalho experiente com barba grisalha
    hairColor: "#D1D5DB", // Gray/white hair
    giColor: "#F9FAFB", // White GI
    giLapelColor: "#9CA3AF"
  }
];

export interface BeltConfig {
  key: string;
  name: string;
  beltColor: string;
  sleeveColor: string;
  borderColor: string;
  textColor: string;
  glowEffect: boolean;
  effectType?: "none" | "subtle" | "stars" | "flame" | "lightning" | "gold_dust";
}

export const BELTS: BeltConfig[] = [
  { key: "white", name: "Faixa Branca", beltColor: "#E5E7EB", sleeveColor: "#111827", borderColor: "#F3F4F6", textColor: "#9CA3AF", glowEffect: false },
  { key: "gray", name: "Faixa Cinza", beltColor: "#9CA3AF", sleeveColor: "#111827", borderColor: "#9CA3AF", textColor: "#4B5563", glowEffect: false },
  { key: "yellow", name: "Faixa Amarela", beltColor: "#FBBF24", sleeveColor: "#111827", borderColor: "#F59E0B", textColor: "#D97706", glowEffect: false },
  { key: "orange", name: "Faixa Laranja", beltColor: "#F97316", sleeveColor: "#111827", borderColor: "#EA580C", textColor: "#C2410C", glowEffect: false },
  { key: "green", name: "Faixa Verde", beltColor: "#10B981", sleeveColor: "#111827", borderColor: "#059669", textColor: "#047857", glowEffect: false },
  { key: "blue", name: "Faixa Azul", beltColor: "#2563EB", sleeveColor: "#111827", borderColor: "#1D4ED8", textColor: "#1E40AF", glowEffect: true, effectType: "subtle" },
  { key: "purple", name: "Faixa Roxa", beltColor: "#7C3AED", sleeveColor: "#E5E7EB", borderColor: "#8B5CF6", textColor: "#6D28D9", glowEffect: true, effectType: "stars" },
  { key: "brown", name: "Faixa Marrom", beltColor: "#78350F", sleeveColor: "#111827", borderColor: "#92400E", textColor: "#451A03", glowEffect: true, effectType: "subtle" },
  { key: "black", name: "Faixa Preta", beltColor: "#1F2937", sleeveColor: "#EF4444", borderColor: "#111827", textColor: "#B91C1C", glowEffect: true, effectType: "lightning" },
  { key: "coral", name: "Faixa Coral", beltColor: "url(#coralPattern)", sleeveColor: "#111827", borderColor: "url(#coralRing)", textColor: "#EF4444", glowEffect: true, effectType: "gold_dust" },
  { key: "red_black", name: "Faixa Vermelha e Preta", beltColor: "url(#redBlackPattern)", sleeveColor: "#1F2937", borderColor: "url(#redBlackRing)", textColor: "#DC2626", glowEffect: true, effectType: "flame" },
  { key: "red_white", name: "Faixa Vermelha e Branca", beltColor: "url(#redWhitePattern)", sleeveColor: "#FFFFFF", borderColor: "url(#redWhiteRing)", textColor: "#DC2626", glowEffect: true, effectType: "gold_dust" }
];

export function getAvatarSvg(characterId: string, beltKey: string): string {
  const char = BASE_CHARACTERS.find(c => c.id === characterId) || BASE_CHARACTERS[0];
  const belt = BELTS.find(b => b.key === beltKey.toLowerCase()) || BELTS[0];

  // Particle graphics depending on effects
  let effectSvgContent = "";
  if (belt.effectType === "stars") {
    effectSvgContent = `
      <!-- Tiny sparkling stars -->
      <polygon points="15,20 18,23 15,26 12,23" fill="#FFF" opacity="0.8" />
      <polygon points="85,30 87,32 85,34 83,32" fill="#FFF" opacity="0.9" />
      <polygon points="20,70 21.5,71.5 20,73 18.5,71.5" fill="#FFF" opacity="0.75" />
      <circle cx="82" cy="72" r="1.5" fill="#C084FC" opacity="0.8" />
      <circle cx="12" cy="45" r="1" fill="#C084FC" opacity="0.8" />
    `;
  } else if (belt.effectType === "lightning") {
    effectSvgContent = `
      <!-- Crackling electricity arcs -->
      <path d="M 8,40 Q 15,38 12,32 Q 22,34 25,28" stroke="#60A5FA" stroke-width="1" fill="none" opacity="0.75" />
      <path d="M 92,42 Q 85,45 88,52 Q 78,50 76,58" stroke="#3B82F6" stroke-width="1" fill="none" opacity="0.75" />
      <polygon points="25,18 28,19 26,22" fill="#93C5FD" />
      <polygon points="74,15 77,17 74,18" fill="#93C5FD" />
    `;
  } else if (belt.effectType === "flame") {
    effectSvgContent = `
      <!-- Burning visual aura -->
      <path d="M 8,80 C 4,60 12,50 16,35 C 18,48 14,56 18,72 Z" fill="#F87171" opacity="0.2" />
      <path d="M 92,80 C 96,60 88,50 84,35 C 82,48 86,56 82,72 Z" fill="#EF4444" opacity="0.2" />
      <path d="M 50,5 C 55,15 48,22 45,30 C 42,20 46,12 50,5 Z" fill="#F59E0B" opacity="0.15" />
    `;
  } else if (belt.effectType === "gold_dust") {
    effectSvgContent = `
      <!-- Glitter gold dust -->
      <circle cx="22" cy="18" r="1.5" fill="#FBBF24" opacity="0.9" />
      <circle cx="25" cy="14" r="1" fill="#F59E0B" opacity="0.8" />
      <circle cx="78" cy="18" r="2" fill="#FBBF24" opacity="0.95" />
      <circle cx="82" cy="24" r="1" fill="#FFF" opacity="0.9" />
      <circle cx="15" cy="55" r="1.5" fill="#FB923C" opacity="0.8" />
      <circle cx="88" cy="52" r="1.2" fill="#FBBF24" opacity="0.8" />
      <polygon points="75,8 77,10 75,12 73,10" fill="#FFF" opacity="0.9" />
    `;
  }

  // Draw hair SVG parts
  let hairContent = "";
  const color = char.hairColor;

  if (char.hairStyle === "ponytail") {
    hairContent = `
      <!-- High Ponytail overlay at back -->
      <path d="M 45,28 C 42,12 58,10 65,18 C 68,22 66,28 62,32 C 55,27 48,30 45,28 Z" fill="${color}" />
      <!-- Elastic tie band -->
      <ellipse cx="48" cy="26" rx="4" ry="2" fill="#EF4444" />
      <!-- Main hair crown -->
      <path d="M 32,38 C 30,28 35,22 50,22 C 65,22 70,28 68,38 C 68,31 62,26 50,26 C 38,26 32,31 32,38 Z" fill="${color}" />
    `;
  } else if (char.hairStyle === "bun") {
    hairContent = `
      <!-- Tight fighter bun -->
      <circle cx="50" cy="18" r="7" fill="${color}" />
      <path d="M 44,19 Q 50,24 56,19" fill="#222" opacity="0.4" />
      <!-- Front bangs -->
      <path d="M 31,38 C 31,26 38,23 50,23 C 62,23 69,26 69,38 C 65,30 58,27 50,27 C 42,27 35,30 31,38 Z" fill="${color}" />
    `;
  } else if (char.hairStyle === "curly_bun") {
    hairContent = `
      <!-- Afro curly bun top knot -->
      <circle cx="50" cy="16" r="8" fill="${color}" />
      <circle cx="45" cy="14" r="6" fill="${color}" />
      <circle cx="55" cy="15" r="5" fill="${color}" />
      <circle cx="49" cy="20" r="4" fill="${color}" />
      <!-- Curly frame sides -->
      <path d="M 30,36 C 26,24 38,22 50,22 C 62,22 74,24 70,36 C 68,32 64,28 50,28 C 36,28 32,32 30,36 Z" fill="${color}" />
    `;
  } else if (char.hairStyle === "braid") {
    hairContent = `
      <!-- Side braid cascading over shoulder -->
      <path d="M 32,38 C 32,25 38,23 50,23 C 62,23 68,25 68,38" fill="none" stroke="${color}" stroke-width="15" stroke-linecap="round" />
      <path d="M 66,35 C 68,40 66,45 68,48 C 71,51 68,55 72,58 C 74,62 72,66 74,70" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" />
      <circle cx="74" cy="71" r="2" fill="#E11D48" /> <!-- Tie string -->
    `;
  } else if (char.hairStyle === "oriental") {
    hairContent = `
      <!-- Oriental sleek straight bob with bangs -->
      <path d="M 31,38 C 30,24 34,22 50,22 C 66,22 70,24 69,38 C 68,34 68,24 50,24 C 32,24 32,34 31,38 Z" fill="${color}" />
      <!-- Horizontal clean bangs -->
      <path d="M 34,31 L 66,31 L 66,34 L 59,33 L 50,34 L 41,33 L 34,34 Z" fill="${color}" />
    `;
  } else if (char.hairStyle === "short_young") {
    hairContent = `
      <!-- Modern shortcut pixie with style -->
      <path d="M 31,38 C 31,24 35,22 50,22 C 65,22 69,24 69,33 C 65,26 59,25 50,25 C 41,25 35,26 31,38 Z" fill="${color}" />
      <!-- Little stylish flick -->
      <path d="M 50,21 Q 48,15 42,18 Q 45,22 50,21 Z" fill="${color}" />
    `;
  } else if (char.hairStyle === "long_tied") {
    hairContent = `
      <!-- Long tied ponytail hanging down back -->
      <path d="M 46,38 L 47,72 L 53,72 L 54,38 Z" fill="${color}" />
      <circle cx="50" cy="32" r="1.5" fill="#121212" />
      <!-- Main bangs -->
      <path d="M 31,38 C 31,25 36,22 50,22 C 64,22 69,25 69,38 C 66,29 58,26 50,26 C 42,26 34,29 31,38 Z" fill="${color}" />
    `;
  } else if (char.hairStyle === "curly_afro") {
    hairContent = `
      <!-- Textured afro curls -->
      <ellipse cx="50" cy="26" rx="20" ry="12" fill="${color}" />
      <circle cx="34" cy="30" r="5" fill="${color}" />
      <circle cx="66" cy="30" r="5" fill="${color}" />
      <circle cx="38" cy="22" r="6" fill="${color}" />
      <circle cx="62" cy="22" r="6" fill="${color}" />
      <circle cx="50" cy="18" r="7" fill="${color}" />
    `;
  } else if (char.hairStyle === "short_cropped") {
    hairContent = `
      <!-- Modern fade cut -->
      <path d="M 32,38 C 32,24 38,21 50,21 C 62,21 68,24 68,38 C 68,36 65,24 50,24 C 35,24 32,36 32,38 Z" fill="${color}" />
      <path d="M 32,34 L 68,34" stroke="${color}" stroke-width="2" opacity="0.75" />
    `;
  } else if (char.hairStyle === "messy") {
    hairContent = `
      <!-- Casual young messy locks -->
      <path d="M 31,38 C 31,23 35,20 50,20 C 65,20 69,23 69,38" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" />
      <!-- Spikes -->
      <path d="M 38,20 Q 32,12 36,18 Z" fill="${color}" />
      <path d="M 48,18 Q 48,10 44,14 Z" fill="${color}" />
      <path d="M 52,18 Q 56,10 60,16 Z" fill="${color}" />
    `;
  } else if (char.hairStyle === "buzz") {
    hairContent = `
      <!-- Clean closely cropped athlete buzzcut -->
      <ellipse cx="50" cy="28" rx="17.5" ry="10" fill="${color}" opacity="0.9" />
      <path d="M 32.5,33 C 33,26 40,24 50,24 C 60,24 67,26 67.5,33 Z" fill="${color}" />
    `;
  } else if (char.hairStyle === "bearded") {
    hairContent = `
      <!-- Athlete bearded styled lookup -->
      <path d="M 32,38 C 32,24 38,22 50,22 C 62,22 68,24 68,38" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" />
      <!-- Mustache and beard wraps -->
      <path d="M 33,52 C 34,68 50,73 50,73 C 50,73 66,68 67,52 C 61,54 59,57 50,57 C 41,57 39,54 33,52 Z" fill="${color}" />
      <!-- Mustache overlay -->
      <path d="M 40,55 Q 50,49 60,55" stroke="${color}" stroke-width="4.5" fill="none" stroke-linecap="round" />
    `;
  } else if (char.hairStyle === "wise_old") {
    hairContent = `
      <!-- Mestre Graying/White hairline and flowing long beard -->
      <path d="M 32,38 C 32,25 38,22 50,22 C 62,25 68,25 68,38" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" />
      <!-- Old flowing beard -->
      <path d="M 33,52 C 34,74 42,88 50,92 C 58,88 66,74 67,52 L 50,58 Z" fill="${color}" />
      <!-- Mustache overlay -->
      <path d="M 42,54 Q 50,48 58,54" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round" />
    `;
  } else if (char.hairStyle === "neat_cut") {
    hairContent = `
      <!-- Clean gentleman crop -->
      <path d="M 31,38 C 31,23 37,22 50,22 C 63,22 69,23 69,38" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" />
    `;
  }

  // Draw eye accessories based on character details
  let eyesContent = `
    <!-- Eye Left -->
    <ellipse cx="43" cy="45" rx="3" ry="2" fill="${char.eyeColor}" />
    <circle cx="44" cy="44" r="0.8" fill="#FFF" />
    <!-- Eye Right -->
    <ellipse cx="57" cy="45" rx="3" ry="2" fill="${char.eyeColor}" />
    <circle cx="58" cy="44" r="0.8" fill="#FFF" />
  `;

  // Draw blush/cheek lines for females for that high-quality AAA look
  let cheeksContent = "";
  if (char.gender === "female") {
    cheeksContent = `
      <circle cx="36" cy="48" r="3" fill="#EC4899" opacity="0.3" filter="blur(1px)" />
      <circle cx="64" cy="48" r="3" fill="#EC4899" opacity="0.3" filter="blur(1px)" />
    `;
  }

  // Draw Gi Crossover and logo JiuSpeak of course!
  const gi = char.giColor;
  const lapel = char.giLapelColor;

  let giContent = `
    <!-- Gi (Kimono) base torso shoulders -->
    <path d="M 22,86 C 24,70 30,62 50,62 C 70,62 76,70 78,86 C 78,92 22,92 22,86 Z" fill="${gi}" />
    
    <!-- Left Lapel wrap -->
    <path d="M 32,62 L 50,84 L 56,84 L 38,62 Z" fill="${lapel}" />
    
    <!-- Right Lapel crossover (BJJ standard left over right wrapping) -->
    <path d="M 68,62 L 50,84 L 44,84 L 62,62 Z" fill="${lapel}" />

    <!-- Tiny JiuSpeak logo embroidery/patch on the chest shoulder (Left) -->
    <rect x="28" y="70" width="6" height="5" rx="1.5" fill="#3B82F6" transform="rotate(-15 28 70)" />
    <text x="31" y="74" font-family="'Inter', sans-serif" font-size="2.7" font-weight="900" fill="#FFFFFF" text-anchor="middle" transform="rotate(-15 28 70)">JS</text>
  `;

  // DRAW THE BELT (FAIXA) crossing at the lower chest/waist section!
  // It should alter based on the belt rank parameter!
  const bColor = belt.beltColor;
  const sColor = belt.sleeveColor;

  let beltContent = `
    <!-- BJJ Belt structure tied crossover at waist -->
    <g transform="translate(0, 1)">
      <!-- Main belt band crossing horizontally at body bottleneck -->
      <path d="M 32,80 L 68,80 C 67,86 33,86 32,80 Z" fill="${bColor}" stroke="#1E293B" stroke-width="0.75" />
      
      <!-- Rank Sleeve (Faixa Rank Block Bar on the right side of standard belt) -->
      <rect x="52" y="80.5" width="10" height="4.5" fill="${sColor}" />
      
      <!-- White stripes overlay details for rank indicator (4 stripes) -->
      <line x1="54" y1="80.5" x2="54" y2="85" stroke="#FFFFFF" stroke-width="1" />
      <line x1="56" y1="80.5" x2="56" y2="85" stroke="#FFFFFF" stroke-width="1" />
      <line x1="58" y1="80.5" x2="58" y2="85" stroke="#FFFFFF" stroke-width="1" />
      <line x1="60" y1="80.5" x2="60" y2="85" stroke="#FFFFFF" stroke-width="1" />
      
      <!-- Tied Knot tails dangling down elegantly -->
      <path d="M 46,82.5 L 43,91 L 39,90 C 39,90 42,83 44,82.5 Z" fill="${bColor}" stroke="#1E293B" stroke-width="0.5" />
      <path d="M 49,82.5 L 53,92 L 57,91 Q 52,83 49,82.5 Z" fill="${bColor}" stroke="#1E293B" stroke-width="0.5" />
      <!-- Knot center core wrapper -->
      <rect x="44.5" y="81" width="5" height="3" rx="1" fill="${bColor}" stroke="#1E293B" stroke-width="0.5" />
    </g>
  `;

  // Determine border rating design
  let outerRingContent = `
    <!-- Outer Premium circular frame matching Faixa quality -->
    <circle cx="50" cy="50" r="47.5" fill="none" stroke="${belt.borderColor}" stroke-width="2.5" />
  `;

  if (belt.glowEffect) {
    outerRingContent = `
      <!-- Outer Dynamic Border with glowing stroke design -->
      <circle cx="50" cy="50" r="47" fill="none" stroke="${belt.borderColor}" stroke-width="2.5" filter="drop-shadow(0 0 2px ${belt.textColor})" />
      <circle cx="50" cy="50" r="48" fill="none" stroke="${belt.borderColor}" stroke-width="0.5" opacity="0.6" />
    `;
  }

  // Full unified SVG output with beautiful linear embedded gradients for compatibility
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <!-- Background mesh gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${char.bgColor1}" />
        <stop offset="100%" stop-color="${char.bgColor2}" />
      </linearGradient>

      <!-- Coral Pattern definitions (Alternating red and black blocks) -->
      <linearGradient id="coralPattern" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#EF4444" />
        <stop offset="25%" stop-color="#EF4444" />
        <stop offset="25%" stop-color="#111827" />
        <stop offset="50%" stop-color="#111827" />
        <stop offset="50%" stop-color="#EF4444" />
        <stop offset="75%" stop-color="#EF4444" />
        <stop offset="75%" stop-color="#111827" />
        <stop offset="100%" stop-color="#111827" />
      </linearGradient>

      <!-- Red/White Pattern definitions (Alternating red and white blocks) -->
      <linearGradient id="redWhitePattern" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#EF4444" />
        <stop offset="25%" stop-color="#EF4444" />
        <stop offset="25%" stop-color="#FFFFFF" />
        <stop offset="50%" stop-color="#FFFFFF" />
        <stop offset="50%" stop-color="#EF4444" />
        <stop offset="75%" stop-color="#EF4444" />
        <stop offset="75%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#FFFFFF" />
      </linearGradient>

      <!-- Red/Black Pattern definitions (Alternating red and black blocks) -->
      <linearGradient id="redBlackPattern" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#EF4444" />
        <stop offset="25%" stop-color="#EF4444" />
        <stop offset="25%" stop-color="#1F2937" />
        <stop offset="50%" stop-color="#1F2937" />
        <stop offset="50%" stop-color="#EF4444" />
        <stop offset="75%" stop-color="#EF4444" />
        <stop offset="75%" stop-color="#1F2937" />
        <stop offset="100%" stop-color="#1F2937" />
      </linearGradient>

      <linearGradient id="coralRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EF4444" />
        <stop offset="50%" stop-color="#111827" />
        <stop offset="100%" stop-color="#EF4444" />
      </linearGradient>

      <linearGradient id="redBlackRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#DC2626" />
        <stop offset="50%" stop-color="#1F2937" />
        <stop offset="100%" stop-color="#DC2626" />
      </linearGradient>

      <linearGradient id="redWhiteRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#DC2626" />
        <stop offset="50%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#DC2626" />
      </linearGradient>

      <!-- Drop shadow for the head and chest -->
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000" flood-opacity="0.35" />
      </filter>
    </defs>

    <!-- Background housing circle -->
    <circle cx="50" cy="50" r="46.5" fill="url(#bgGrad)" />

    <!-- Visual effects layer behind athlete -->
    ${effectSvgContent}

    <!-- Athlete components assembled sequentially -->
    <g filter="url(#shadow)">
      <!-- Back hair overlay if applicable -->
      ${hairContent.includes("Back") || char.hairStyle === "ponytail" || char.hairStyle === "long_tied" ? hairContent : ""}
      
      <!-- Head / neck node -->
      <rect x="45" y="47" width="10" height="18" rx="4" fill="${char.skinColor}" />
      <circle cx="50" cy="48" r="17.5" fill="${char.skinColor}" />
      
      <!-- Facial overlays -->
      ${eyesContent}
      
      <!-- Eyebrows with confidence styling -->
      <path d="M 39,41 Q 43,39 46,42" fill="none" stroke="${char.hairColor}" stroke-width="1.75" stroke-linecap="round" />
      <path d="M 61,41 Q 57,39 54,42" fill="none" stroke="${char.hairColor}" stroke-width="1.75" stroke-linecap="round" />

      <!-- Cute blush for females -->
      ${cheeksContent}

      <!-- Confident Smile Mouth -->
      <path d="M 43.5,52 Q 50,57 56.5,52" fill="none" stroke="#651C05" stroke-width="1.75" stroke-linecap="round" />

      <!-- Regular/Front hair elements -->
      ${!hairContent.includes("Back") && char.hairStyle !== "ponytail" && char.hairStyle !== "long_tied" ? hairContent : ""}
      
      <!-- Gi/Kimono wrapping -->
      ${giContent}
    </g>

    <!-- Belt (Faixa) attached directly on top of the lapel crossover -->
    ${beltContent}

    <!-- Outer frame / border wrapper -->
    ${outerRingContent}
  </svg>`;

  return svg;
}
