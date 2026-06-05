export interface AvatarMapping {
  id: number;
  gender: "male" | "female";
  name: string;
  image: string;
  order: number;
}

export const FEMALE_NAMES = [
  "Ana Beatriz",
  "Maria Clara",
  "Juliana Mendes",
  "Laura Souza",
  "Rafaela Lima",
  "Isabela Costa",
  "Gabriela Silva",
  "Bianca Oliveira",
  "Flavio Martins",
  "Amanda Rocha",
  "Eduarda Alves",
  "Camila Ferreira",
  "Valentina Dias",
  "Manuela Prado",
  "Sophia Moretti",
  "Mariana Nunes",
  "Alice Carvalho",
  "Luiza Menezes",
  "Beatriz Santos",
  "Helena Monteiro"
];

export const MALE_NAMES = [
  "Lucas Monteiro",
  "Gabriel Santos",
  "Rafael Almeida",
  "João Pedro",
  "Matheus Lima",
  "Felipe Costa",
  "Bruno Ferreira",
  "Vinicius Rocha",
  "Thiago Martins",
  "Caio Oliveira",
  "André Silva",
  "Murilo Souza",
  "Leonardo Dias",
  "Igor Barbosa",
  "Pedro Henrique",
  "Enzo Moretti",
  "Guilherme Prado",
  "Daniel Nunes",
  "Hugo Carvalho",
  "Davi Menezes"
];

// Helper to generate consistent, highly-optimized SVG avatars representing BJJ fighters 
// with randomized hairstyles/appearances and colored background to mimic BJJ belts
// order: 1 to 12 map to the 12 visual rows shown in the prompt image
export const avatarMappingList: AvatarMapping[] = [
  ...FEMALE_NAMES.map((name, index) => {
    const order = index + 1;
    // Set matching BJJ theme background hex codes depending on index
    // simulating the belt colors and background rings shown in the image
    const bgColors = ["ff4a5a", "4a60ff", "7e49ff", "ffffff", "2a2a2a", "a65c2e"];
    const bgColor = bgColors[index % bgColors.length];
    
    const isMale = name.toLowerCase().includes("flavio") || name.toLowerCase().includes("flávio");
    const gender = isMale ? ("male" as const) : ("female" as const);
    const eyebrows = isMale 
      ? "variant01,variant06,variant07,variant08" 
      : "variant02,variant03,variant04,variant05";
    
    return {
      id: order, // IDs 1 to 20 for female but can override gender
      gender,
      name,
      // Dicebear adventurer avatar with custom look
      image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bgColor}&radius=50&mouth=smile&eyebrows=${eyebrows}`,
      order
    };
  }),

  ...MALE_NAMES.map((name, index) => {
    const order = index + 1;
    const bgColors = ["ff4a5a", "4a60ff", "7e49ff", "ffffff", "2a2a2a", "a65c2e"];
    const bgColor = bgColors[index % bgColors.length];
    
    return {
      id: 20 + order, // IDs 21 to 40 for male
      gender: "male" as const,
      name,
      // Dicebear adventurer avatar with masculine custom look
      image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bgColor}&radius=50&mouth=smile&eyebrows=variant01,variant06,variant07,variant08`,
      order
    };
  })
];

export function getAvatarByName(name: string): AvatarMapping | undefined {
  const normalized = name.toLowerCase().trim();
  return avatarMappingList.find((avatar) => 
    normalized.includes(avatar.name.toLowerCase().trim()) || 
    avatar.name.toLowerCase().trim().includes(normalized)
  );
}

export function getAvatarById(id: number): AvatarMapping | undefined {
  return avatarMappingList.find((avatar) => avatar.id === id);
}

export function getRandomFemaleAvatar(): AvatarMapping {
  const list = avatarMappingList.filter((a) => a.gender === 'female');
  return list[Math.floor(Math.random() * list.length)];
}

export function getRandomMaleAvatar(): AvatarMapping {
  const list = avatarMappingList.filter((a) => a.gender === 'male');
  return list[Math.floor(Math.random() * list.length)];
}
