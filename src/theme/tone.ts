import { withAlpha, type KitColors } from './colors';

/** Teintes sémantiques communes (badges, planning, harnais, cartes…) : `KitTone` Flutter. */
export type KitTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error' | 'purple' | 'cyan' | 'tertiary';

export const KIT_TONES: readonly KitTone[] = [
  'neutral',
  'primary',
  'info',
  'success',
  'warning',
  'error',
  'purple',
  'cyan',
  'tertiary',
];

/** Couleur pleine de la teinte. */
export function toneColor(tone: KitTone, c: KitColors): string {
  return tone === 'neutral' ? c.textMuted : c[tone];
}

/** Fond léger de la teinte (`--*-color-light`). */
export function toneLight(tone: KitTone, c: KitColors): string {
  return tone === 'neutral' ? withAlpha(c.textPrimary, 0.06) : c[`${tone}Light`];
}

/** Couleur de texte lisible sur le fond léger (`--*-color-text`). */
export function toneText(tone: KitTone, c: KitColors): string {
  switch (tone) {
    case 'success':
      return c.successText;
    case 'warning':
      return c.warningText;
    case 'error':
      return c.errorText;
    case 'neutral':
      return c.textSecondary;
    default:
      return c[tone];
  }
}
