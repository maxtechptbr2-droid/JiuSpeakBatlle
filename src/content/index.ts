import { whiteBeltData } from './white-belt';
import { blueBeltData } from './blue-belt';
import { purpleBeltData } from './purple-belt';
import { brownBeltData } from './brown-belt';
import { blackBeltData } from './black-belt';

export interface MissionStep {
  id: string;
  type: 'intro' | 'video' | 'vocabulary' | 'dialogue' | 'listening' | 'speaking' | 'pronunciation' | 'roleplay' | 'quiz' | 'challenge' | 'reward';
  title?: string;
  description?: string;
  content?: any;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  slug: string;
  xpReward: number;
  jtReward: number;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Profissional' | 'Mestre';
  order: number;
  steps: MissionStep[];
}

export interface ExamQuestion {
  id: string;
  type: 'multiple_choice' | 'writing' | 'listening' | 'speaking';
  question: string;
  options?: string[];
  correctAnswer: string; // e.g., index of correct answer or string text
  explanation?: string;
  audioPhrase?: string; // for listening exam types
}

export interface Exam {
  id: string;
  moduleId: string;
  title: string;
  passingScore: number; // percentage required (usually 70 or 80)
  questions: ExamQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  slug: string;
  order: number;
  missions: Mission[];
  exam?: Exam;
}

export interface Belt {
  id: string;
  name: string; // "Branca", "Azul", "Roxa", "Marrom", "Preto"
  slug: string;
  level: string; // "Survival", "Communication", "Competition", "Coaching", "Business"
  themeColor: string; // e.g. "sky", "blue", "purple", "amber", "zinc" (Tailwind classes)
  colorClass: string; // primary color for accentuation
  description: string;
  unlockRequirement: string;
  modules: Module[];
}

export const BELTS_RPG_DATA: Belt[] = [
  whiteBeltData,
  blueBeltData,
  purpleBeltData,
  brownBeltData,
  blackBeltData
];

export function getBeltBySlug(slug: string): Belt | undefined {
  return BELTS_RPG_DATA.find(b => b.slug === slug);
}

export function getMissionById(missionId: string): Mission | undefined {
  for (const b of BELTS_RPG_DATA) {
    for (const m of b.modules) {
      const match = m.missions.find(mi => mi.id === missionId);
      if (match) return match;
    }
  }
  return undefined;
}
