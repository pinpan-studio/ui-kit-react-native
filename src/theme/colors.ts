import { PALETTES, type M3Roles, type PaletteId } from './generated/palettes';

export type ColorMode = 'light' | 'dark';

/** Couleurs sémantiques fixes du kit (styles.scss / KitColors Flutter), identiques pour toutes les palettes. */
const SEMANTIC = {
  success: '#22c55e',
  warning: '#eab308',
  info: '#3b82f6',
  purple: '#a855f7',
  cyan: '#06b6d4',
} as const;

export interface KitColors {
  success: string;
  successLight: string;
  successText: string;
  /** Texte posé sur un fond `success` (bouton Success) : #052e16, contraste AA 6,54:1. */
  onSuccess: string;
  warning: string;
  warningLight: string;
  warningText: string;
  info: string;
  infoLight: string;
  purple: string;
  purpleLight: string;
  cyan: string;
  cyanLight: string;
  errorText: string;
  /** M3 désactivé : contenu on-surface 38 %, conteneur on-surface 12 %. */
  disabledContent: string;
  disabledContainer: string;
  primaryLight: string;
  tertiaryLight: string;
}

/** `#rrggbb` + opacité → `#rrggbbaa`. */
export const withAlpha = (hex: string, alpha: number): string =>
  `${hex.slice(0, 7)}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;

export const getRoles = (id: PaletteId, mode: ColorMode): M3Roles => PALETTES[id][mode];

export function buildKitColors(roles: M3Roles, mode: ColorMode): KitColors {
  const light = mode === 'light';
  const a15 = (c: string) => withAlpha(c, 0.15);
  return {
    success: SEMANTIC.success,
    successLight: a15(SEMANTIC.success),
    successText: light ? '#15803d' : '#4ade80',
    onSuccess: '#052e16',
    warning: SEMANTIC.warning,
    warningLight: a15(SEMANTIC.warning),
    warningText: light ? '#a16207' : '#fbbf24',
    info: SEMANTIC.info,
    infoLight: a15(SEMANTIC.info),
    purple: SEMANTIC.purple,
    purpleLight: a15(SEMANTIC.purple),
    cyan: SEMANTIC.cyan,
    cyanLight: a15(SEMANTIC.cyan),
    errorText: light ? '#b91c1c' : '#f87171',
    disabledContent: withAlpha(roles.onSurface, 0.38),
    disabledContainer: withAlpha(roles.onSurface, 0.12),
    primaryLight: withAlpha(roles.primary, light ? 0.08 : 0.14),
    tertiaryLight: withAlpha(roles.tertiary, light ? 0.1 : 0.14),
  };
}
