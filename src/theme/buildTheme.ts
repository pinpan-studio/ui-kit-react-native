import { MD3DarkTheme, MD3LightTheme, configureFonts, type MD3Theme } from 'react-native-paper';
import type { MD3Type } from 'react-native-paper/lib/typescript/types';

import { buildKitColors, getRoles, withAlpha, type ColorMode, type KitColors } from './colors';
import { fontFamily, type FontWeight } from './fonts';
import { TYPE_SCALE } from './generated/tokens';
import type { M3Roles, PaletteId } from './generated/palettes';
import { radius } from './tokens';

export interface KitTheme extends MD3Theme {
  paletteId: PaletteId;
  colorMode: ColorMode;
  /** Les 49 rôles M3 + tons bruts, valeurs exactes d'Angular. */
  roles: M3Roles;
  kit: KitColors;
}

type ScaleKey = keyof typeof TYPE_SCALE;

/** Graisses surchargées par `AppTheme` Flutter (titres plus affirmés que l'échelle M3 par défaut). */
const WEIGHT_OVERRIDES: Partial<Record<ScaleKey, FontWeight>> = {
  headlineLarge: '700',
  headlineMedium: '700',
  headlineSmall: '600',
  titleLarge: '600',
  titleMedium: '600',
};

function buildFonts() {
  const config: Partial<Record<ScaleKey, MD3Type>> = {};
  for (const key of Object.keys(TYPE_SCALE) as ScaleKey[]) {
    const t = TYPE_SCALE[key];
    const weight = WEIGHT_OVERRIDES[key] ?? (t.weight as FontWeight);
    config[key] = {
      fontFamily: fontFamily(t.family === 'Outfit' ? 'heading' : 'body', weight),
      fontSize: t.size,
      lineHeight: t.lineHeight,
      letterSpacing: t.tracking,
      // La graisse est portée par la famille (Inter_500Medium…) ; 'normal' évite le faux gras Android.
      fontWeight: 'normal',
    };
  }
  return configureFonts({ config });
}

const FONTS = buildFonts();

/** Thème Paper MD3 d'une palette Angular, sans recalcul : chaque rôle reprend la valeur exportée. */
export function buildTheme(paletteId: PaletteId, mode: ColorMode): KitTheme {
  const r = getRoles(paletteId, mode);
  const base = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    dark: mode === 'dark',
    roundness: radius.xs,
    fonts: FONTS,
    paletteId,
    colorMode: mode,
    roles: r,
    kit: buildKitColors(r, mode),
    colors: {
      ...base.colors,
      primary: r.primary,
      onPrimary: r.onPrimary,
      primaryContainer: r.primaryContainer,
      onPrimaryContainer: r.onPrimaryContainer,
      secondary: r.secondary,
      onSecondary: r.onSecondary,
      secondaryContainer: r.secondaryContainer,
      onSecondaryContainer: r.onSecondaryContainer,
      tertiary: r.tertiary,
      onTertiary: r.onTertiary,
      tertiaryContainer: r.tertiaryContainer,
      onTertiaryContainer: r.onTertiaryContainer,
      error: r.error,
      onError: r.onError,
      errorContainer: r.errorContainer,
      onErrorContainer: r.onErrorContainer,
      background: r.background,
      onBackground: r.onBackground,
      surface: r.surface,
      onSurface: r.onSurface,
      surfaceVariant: r.surfaceVariant,
      onSurfaceVariant: r.onSurfaceVariant,
      outline: r.outline,
      outlineVariant: r.outlineVariant,
      shadow: r.shadow,
      scrim: r.scrim,
      inverseSurface: r.inverseSurface,
      inverseOnSurface: r.inverseOnSurface,
      inversePrimary: r.inversePrimary,
      // Paper exprime les élévations tonales en couleurs de surface : on les cale sur les surface-container M3.
      elevation: {
        level0: 'transparent',
        level1: r.surfaceContainerLow,
        level2: r.surfaceContainer,
        level3: r.surfaceContainerHigh,
        level4: r.surfaceContainerHigh,
        level5: r.surfaceContainerHighest,
      },
      // État désactivé M3 : contenu on-surface 38 %, conteneur on-surface 12 %.
      surfaceDisabled: withAlpha(r.onSurface, 0.12),
      onSurfaceDisabled: withAlpha(r.onSurface, 0.38),
      backdrop: withAlpha(r.scrim, 0.32),
    },
  };
}
