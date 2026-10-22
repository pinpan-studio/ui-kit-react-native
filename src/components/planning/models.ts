import type { KitColors, KitTone } from '../../theme';
import { toneColor } from '../../theme';

/**
 * Modèle générique des vues de planification (kanban, Gantt, notes, vue groupée, calendrier, agenda) —
 * `PlanningItem` Flutter, `planning.models.ts`. Aucun champ propre à un métier.
 */
export interface PlanningItem {
  id: string;
  title: string;
  ref?: string;
  description?: string;
  status?: string;
  group?: string;
  start?: Date;
  end?: Date;
  due?: Date;
  done?: boolean;
  /** 0 → 100 */
  progress?: number;
  tone?: KitTone;
  badge?: string;
  badgeTone?: KitTone;
  assignee?: string;
  tags?: string[];
  /** Valeurs filtrables. */
  fields?: Record<string, string>;
}

export interface PlanningColumn {
  key: string;
  label: string;
  tone: KitTone;
}

export interface PlanningGroup {
  key: string;
  label: string;
  subtitle?: string;
  tone?: KitTone;
  icon?: string;
}

/** Filtre déclaratif : lit `fields[key]` (ou `group` / `status`). */
export interface PlanningFilter {
  key: string;
  label: string;
  allLabel?: string;
  options: { value: string; label: string }[];
}

export interface PlanningFilterState {
  search: string;
  values: Record<string, string>;
  lateOnly: boolean;
}

export const EMPTY_FILTERS: PlanningFilterState = { search: '', values: {}, lateOnly: false };

/** En retard : échéance dépassée et non terminé. */
export const isLate = (it: PlanningItem, now: Date = new Date()) => !it.done && !!it.due && it.due < now;

/** Date de référence (début, sinon échéance). */
export const anchorOf = (it: PlanningItem) => it.start ?? it.due;

/** `itemColor` : teinte, sinon terminé / en retard / primaire. */
export function itemColor(it: PlanningItem, c: KitColors): string {
  if (it.tone) return toneColor(it.tone, c);
  if (it.done) return c.success;
  if (isLate(it)) return c.error;
  return c.primary;
}

const valueOf = (f: PlanningFilter, it: PlanningItem) =>
  f.key === 'group' ? it.group : f.key === 'status' ? it.status : it.fields?.[f.key];

/** Applique recherche, filtres déclarés et « en retard uniquement ». */
export function applyPlanningFilters(
  items: PlanningItem[],
  filters: PlanningFilter[],
  s: PlanningFilterState,
): PlanningItem[] {
  const q = s.search.trim().toLowerCase();
  const active = filters.filter((f) => (s.values[f.key] ?? 'all') !== 'all');
  if (!q && !active.length && !s.lateOnly) return items;
  return items.filter((it) => {
    if (q) {
      const hay = [it.title, it.ref, it.description, it.assignee, ...(it.tags ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (active.some((f) => valueOf(f, it) !== s.values[f.key])) return false;
    return !(s.lateOnly && !isLate(it));
  });
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());
/** Lundi de la semaine de `d`. */
export const startOfWeek = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));
/** Nombre de jours entiers entre deux dates (minuit à minuit). */
export const daysBetween = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);

export const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const MONTHS_CAP = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];
