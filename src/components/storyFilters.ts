// Filtros visuais de story (CSS puro, estilo Instagram) — compartilhado entre criadores/visualizadores
export interface StoryFilter { id: string; name: string; css: string; }

export const STORY_FILTERS: StoryFilter[] = [
  { id: 'normal', name: 'Normal', css: 'none' },
  { id: 'clarendon', name: 'Clarendon', css: 'contrast(1.2) saturate(1.35)' },
  { id: 'gingham', name: 'Gingham', css: 'brightness(1.05) hue-rotate(-10deg)' },
  { id: 'moon', name: 'Moon', css: 'grayscale(1) contrast(1.1) brightness(1.1)' },
  { id: 'lark', name: 'Lark', css: 'contrast(0.9) brightness(1.1) saturate(1.2)' },
  { id: 'reyes', name: 'Reyes', css: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)' },
  { id: 'juno', name: 'Juno', css: 'contrast(1.15) saturate(1.8) sepia(0.1)' },
  { id: 'aden', name: 'Aden', css: 'hue-rotate(20deg) contrast(0.9) saturate(0.85) brightness(1.2)' },
  { id: 'ludwig', name: 'Ludwig', css: 'contrast(1.05) saturate(0.9) sepia(0.08)' },
  { id: 'bjj_fire', name: 'BJJ Fire', css: 'contrast(1.3) saturate(1.5) hue-rotate(-15deg) brightness(0.95)' },
  { id: 'tatame', name: 'Tatame', css: 'sepia(0.3) contrast(1.1) saturate(0.8)' },
  { id: 'faixa_preta', name: 'Faixa Preta', css: 'grayscale(0.8) contrast(1.4) brightness(0.9)' },
];

export function filterCss(id?: string | null): string {
  const f = STORY_FILTERS.find(x => x.id === (id || 'normal'));
  return f ? f.css : 'none';
}
