import { KIT_CATEGORIES, type KitCategory, type KitSection } from './kitNav';

/** Minuscules sans accents : « Éléments » et « elements » se valent. */
export const normalize = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export type SearchHit =
  { kind: 'category'; category: KitCategory } | { kind: 'section'; category: KitCategory; section: KitSection };

/** Recherche du tiroir (KitDrawer Flutter) : catégories puis leurs sections, dans l'ordre du catalogue. */
export function searchCatalog(query: string, categories: readonly KitCategory[] = KIT_CATEGORIES): SearchHit[] {
  const q = normalize(query);
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const category of categories) {
    if (normalize(category.label).includes(q)) hits.push({ kind: 'category', category });
    for (const section of category.sections) {
      if (normalize(section.label).includes(q)) hits.push({ kind: 'section', category, section });
    }
  }
  return hits;
}
