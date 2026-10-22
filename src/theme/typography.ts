import { useMemo } from 'react';
import type { TextStyle } from 'react-native';

import type { KitColors } from './colors';
import { fontFamily, type FontRole, type FontWeight } from './fonts';
import { useKitTheme } from './useKitTheme';

function style(
  role: FontRole,
  weight: FontWeight,
  fontSize: number,
  height?: number,
  letterSpacing?: number,
): TextStyle {
  return {
    fontFamily: fontFamily(role, weight),
    fontSize,
    ...(height ? { lineHeight: Math.round(fontSize * height * 100) / 100 } : null),
    ...(letterSpacing ? { letterSpacing } : null),
  };
}

/**
 * Échelle typographique du kit (`KitText` Flutter, `styles/_typography.scss`) :
 * Outfit pour les titres, Inter pour le texte. La graisse est portée par la famille.
 */
export const kitText = {
  display: style('heading', '700', 40, 1.15, -1.2),
  h1: style('heading', '700', 32, 1.2, -0.64),
  h2: style('heading', '600', 24, 1.25, -0.24),
  h3: style('heading', '600', 20, 1.3),
  h4: style('heading', '600', 16, 1.4),
  pageTitle: style('heading', '700', 22, 1.3),
  cardTitle: style('heading', '700', 16, 1.35),
  bodyLg: style('body', '400', 16, 1.7),
  body: style('body', '400', 14, 1.55),
  bodySm: style('body', '400', 13, 1.55),
  label: style('body', '600', 12, 1.4),
  caption: style('body', '400', 12, 1.4),
  /** Petite étiquette (puces, filtres, métadonnées compactes). */
  labelSm: style('body', '600', 11.5, 1.4),
  /** Plus petit texte lisible : badges, compteurs, légendes. Jamais pour un texte cliquable. */
  micro: style('body', '500', 11, 1.35),
  overline: style('body', '700', 11, 1.4, 0.66),
  mono: style('mono', '400', 12.5, 1.5),
  brand: style('brand', '600', 18),
} satisfies Record<string, TextStyle>;

export type KitTextVariant = keyof typeof kitText;

/** Style ponctuel hors échelle (`TextStyle(fontSize: 13, fontWeight: w600)` Flutter) ; Inter par défaut. */
export const font = (weight: FontWeight, fontSize: number, role: FontRole = 'body'): TextStyle => ({
  fontFamily: fontFamily(role, weight),
  fontSize,
});

/** Chiffres tabulaires (`.text-tabular`). */
export const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

/** Couleur par défaut de chaque style (`context.t` Flutter). */
const TEXT_COLOR: Record<KitTextVariant, keyof KitColors> = {
  display: 'textPrimary',
  h1: 'textPrimary',
  h2: 'textPrimary',
  h3: 'textPrimary',
  h4: 'textPrimary',
  pageTitle: 'textPrimary',
  cardTitle: 'textPrimary',
  bodyLg: 'textPrimary',
  body: 'textPrimary',
  bodySm: 'textSecondary',
  label: 'textSecondary',
  caption: 'textMuted',
  labelSm: 'textSecondary',
  micro: 'textMuted',
  overline: 'textMuted',
  mono: 'textPrimary',
  brand: 'textPrimary',
};

export function coloredText(c: KitColors): Record<KitTextVariant, TextStyle> {
  const out = {} as Record<KitTextVariant, TextStyle>;
  for (const key of Object.keys(kitText) as KitTextVariant[]) {
    out[key] = { ...kitText[key], color: c[TEXT_COLOR[key]] };
  }
  return out;
}

/** Styles de texte colorés selon le thème courant : `const t = useKitText(); <Text style={t.bodySm} />`. */
export function useKitText(): Record<KitTextVariant, TextStyle> {
  const { kit } = useKitTheme();
  return useMemo(() => coloredText(kit), [kit]);
}
