/**
 * Formats d'affichage fr-FR (`Fmt` Flutter, `lib/core/format.dart`). Implémentés sans `Intl` pour donner
 * exactement le même résultat sur Hermes, le web et Jest.
 */

/** Espace fine insécable : séparateur des milliers fr-FR. */
export const NNBSP = '\u202f';
/** Espace insécable. */
export const NBSP = '\u00a0';

export const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);

/** `1 250 000` */
export function number(v: number): string {
  const n = Math.round(v);
  return `${n < 0 ? '-' : ''}${group(String(Math.abs(n)))}`;
}

/** `96,4` — une décimale. */
export function decimal1(v: number): string {
  const [int = '0', dec = '0'] = Math.abs(v).toFixed(1).split('.');
  return `${v < 0 ? '-' : ''}${group(int)},${dec}`;
}

/** `1 250 000 FCFA` */
export const fcfa = (v: number): string => `${number(v)} FCFA`;

/** `55,8 M` — montants compacts des KPI. */
export function compact(v: number): string {
  if (Math.abs(v) >= 1e9) return `${decimal1(v / 1e9)} Md`;
  if (Math.abs(v) >= 1e6) return `${decimal1(v / 1e6)} M`;
  if (Math.abs(v) >= 1e3) return `${number(Math.round(v / 1e3))} k`;
  return number(v);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `16/10/2026` */
export const date = (d: Date): string => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

/** `16 octobre 2026` */
export const dateLong = (d: Date): string => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** « il y a 5 min », « hier »… (pipe `inTime`). */
export function ago(d: Date, now: Date = new Date()): string {
  const s = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (s < 60) return 'à l’instant';
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  const days = Math.floor(s / 86400);
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} j`;
  return date(d);
}

/** Initiales (2 au plus) d'un nom : « Mariam Koné » → « MK ». */
export function initials(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

/** `1,2 Mo`, `412 Ko`, `86 o` */
export function fileSize(bytes: number): string {
  if (bytes >= 1 << 20) return `${decimal1(bytes / (1 << 20))} Mo`;
  if (bytes >= 1 << 10) return `${Math.round(bytes / (1 << 10))} Ko`;
  return `${bytes} o`;
}

/** Jours de la semaine abrégés, du lundi au dimanche. */
export const WEEKDAYS_SHORT = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

/** `jeu. 24 oct.` — en-tête du sélecteur de date. */
export const MONTHS_SHORT = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

export function dayHeadline(d: Date): string {
  return `${WEEKDAYS_SHORT[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** `08:30` */
export const time = (h: number, m: number): string => `${pad(h)}:${pad(m)}`;

/** Supprime accents et ligatures pour une recherche tolérante (`_fold` Flutter). */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/’/g, "'");
}

/** `14 oct.` */
export const dayMonth = (d: Date): string => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

const WEEKDAYS_LONG = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/** `mardi 14 octobre` */
export const weekday = (d: Date): string =>
  `${WEEKDAYS_LONG[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

/** Durée `m:ss` (millisecondes). */
export function mmss(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
}
