import { NBSP, NNBSP } from './format';

/**
 * Corrige la typographie française d'un texte saisi au clavier (`frenchTypography` Flutter,
 * `french-typography.util.ts`) : guillemets « », apostrophe ’, points de suspension …, tiret –,
 * espaces insécables avant : ; ! ? », séparateurs de milliers, unités et heures (14 h 05).
 */
const URL_RE = /(https?:\/\/\S+|www\.\S+|\S+@\S+\.\w+)/g;
const UNITS = 'FCFA|F CFA|F|XOF|€|EUR|\\$|km|kg|m|habitants|véhicules|balises|clients|Mo|Ko|Go';

export function frenchTypography(input: string): string {
  let out = '';
  let last = 0;
  for (const m of input.matchAll(URL_RE)) {
    out += fix(input.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + fix(input.slice(last));
}

function fix(input: string): string {
  let s = input.replaceAll('...', '…');
  s = s.replace(/(\p{L})'(\p{L})/gu, '$1’$2');
  let open = true;
  s = s.replace(/"/g, () => {
    const q = open ? '«' : '»';
    open = !open;
    return q;
  });
  s = s.replace(/«\s*/g, `«${NBSP}`).replace(/\s*»/g, `${NBSP}»`);
  s = s.replaceAll(' - ', ' – ');
  s = s.replace(/\b(\d{1,2})\s?h\s?(\d{2})?\b/g, (_, h: string, m?: string) => `${h}${NBSP}h${m ? `${NBSP}${m}` : ''}`);
  s = s.replace(new RegExp(`(?<![\\d,.\\p{L}-])(\\d{4,})(?=(?:[.,]\\d+)?\\s?(?:${UNITS})(?![\\p{L}\\d]))`, 'gu'), (d) =>
    d.replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP),
  );
  s = s.replace(/(\d)\s?(FCFA|F CFA|€|%|km\/h|km|kg|m|h|min|Mo|Ko|Go)(?![\p{L}\d])/gu, `$1${NBSP}$2`);
  s = s.replace(/\s*([;!?])/g, `${NNBSP}$1`);
  s = s.replace(/(\S)\s*:(?!\/\/|\d)/g, `$1${NBSP}:`);
  s = s
    .replace(/\bEtat\b/g, 'État')
    .replace(/\bEquipe\b/g, 'Équipe')
    .replace(/\bA (?=\p{Ll})/gu, 'À ');
  return s;
}

export type SpaceKind = 'text' | 'nbsp' | 'nnbsp';

/** Segments pour visualiser les espaces spéciales (◦ insécable, · fine insécable). */
export function revealSpaces(s: string): [string, SpaceKind][] {
  const out: [string, SpaceKind][] = [];
  for (const ch of s) {
    const kind: SpaceKind = ch === NBSP ? 'nbsp' : ch === NNBSP ? 'nnbsp' : 'text';
    const prev = out[out.length - 1];
    if (kind === 'text' && prev?.[1] === 'text') prev[0] += ch;
    else out.push([kind === 'text' ? ch : ' ', kind]);
  }
  return out;
}
