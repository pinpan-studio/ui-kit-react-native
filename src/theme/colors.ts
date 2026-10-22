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

/**
 * Couleurs du kit (`KitColors` Flutter, `context.kc`), dérivées des rôles M3 de la palette courante.
 * Les couleurs sémantiques (succès, alerte, info…) restent fixes d'une palette à l'autre.
 */
export interface KitColors {
  primary: string;
  primaryLight: string;
  onPrimary: string;
  tertiary: string;
  tertiaryLight: string;
  success: string;
  successLight: string;
  successText: string;
  /** Texte posé sur un fond `success` (bouton Success) : #052e16, contraste AA 6,54:1. */
  onSuccess: string;
  warning: string;
  warningLight: string;
  warningText: string;
  error: string;
  errorLight: string;
  errorText: string;
  info: string;
  infoLight: string;
  purple: string;
  purpleLight: string;
  cyan: string;
  cyanLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** Fond d'écran (surface). */
  bg: string;
  /** Fond des cartes et démos (surface-container-low). */
  card: string;
  /** Survol / pastilles neutres (surface-container-high). */
  hover: string;
  tableHeader: string;
  border: string;
  /** Séparateur de lignes de tableau, allégé (outline-variant à 45 %). */
  divider: string;
  /** Fond d'un champ au repos (surface-container-high). */
  fieldBg: string;
  /** M3 désactivé : contenu on-surface 38 %, conteneur on-surface 12 %. */
  disabledContent: string;
  disabledContainer: string;
  /** Texte sur une teinte pleine (pastille compteur, overlay) : blanc. */
  onTone: string;
  /** Bloc de code : toujours sombre (ardoise en clair, GitHub sombre en sombre), comme `CodeBlock` Flutter. */
  codeBg: string;
  codeFg: string;
  codeMuted: string;
}

/** `#rrggbb` + opacité → `#rrggbbaa`. */
export const withAlpha = (hex: string, alpha: number): string =>
  `${hex.slice(0, 7)}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;

/** Couleur opaque de `fg` posé à `alpha` sur `bg` (`Color.alphaBlend` Flutter). */
export function mix(fg: string, bg: string, alpha: number): string {
  const channel = (i: number) =>
    Math.round(parseInt(fg.slice(i, i + 2), 16) * alpha + parseInt(bg.slice(i, i + 2), 16) * (1 - alpha))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

/** Rapport de contraste WCAG 2.1 ; une couleur `#rrggbbaa` est d'abord composée sur le fond. */
export function contrast(fg: string, bg: string): number {
  const alpha = fg.length === 9 ? parseInt(fg.slice(7), 16) / 255 : 1;
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = lum(mix(fg, bg, alpha));
  const b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const getRoles = (id: PaletteId, mode: ColorMode): M3Roles => PALETTES[id][mode];

/** Équivalent de `KitColors.fromScheme` Flutter. */
export function buildKitColors(roles: M3Roles, mode: ColorMode): KitColors {
  const light = mode === 'light';
  const a15 = (c: string) => withAlpha(c, 0.15);
  return {
    primary: roles.primary,
    primaryLight: withAlpha(roles.primary, light ? 0.08 : 0.14),
    onPrimary: roles.onPrimary,
    tertiary: roles.tertiary,
    tertiaryLight: withAlpha(roles.tertiary, light ? 0.1 : 0.14),
    success: SEMANTIC.success,
    successLight: a15(SEMANTIC.success),
    successText: light ? '#15803d' : '#4ade80',
    onSuccess: '#052e16',
    warning: SEMANTIC.warning,
    warningLight: a15(SEMANTIC.warning),
    warningText: light ? '#a16207' : '#fbbf24',
    error: roles.error,
    errorLight: withAlpha(roles.error, light ? 0.1 : 0.16),
    errorText: light ? '#b91c1c' : '#f87171',
    info: SEMANTIC.info,
    infoLight: a15(SEMANTIC.info),
    purple: SEMANTIC.purple,
    purpleLight: a15(SEMANTIC.purple),
    cyan: SEMANTIC.cyan,
    cyanLight: a15(SEMANTIC.cyan),
    textPrimary: roles.onSurface,
    textSecondary: roles.onSurfaceVariant,
    textMuted: withAlpha(roles.onSurfaceVariant, light ? 0.7 : 0.65),
    bg: roles.surface,
    card: roles.surfaceContainerLow,
    hover: roles.surfaceContainerHigh,
    tableHeader: roles.surfaceContainer,
    border: light ? '#00000014' : '#ffffff14',
    divider: withAlpha(roles.outlineVariant, 0.45),
    fieldBg: roles.surfaceContainerHigh,
    disabledContent: withAlpha(roles.onSurface, 0.38),
    disabledContainer: withAlpha(roles.onSurface, 0.12),
    onTone: '#ffffff',
    codeBg: light ? '#1e293b' : '#0d1117',
    codeFg: '#e2e8f0',
    codeMuted: '#94a3b8',
  };
}
