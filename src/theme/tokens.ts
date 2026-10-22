import type { ViewStyle } from 'react-native';

import { CSS_ELEVATION, RADIUS, SPACE, STATE_LAYERS } from './generated/tokens';

/** Espacements (base 4 dp) : `--space-*` d'Angular, `Space` du kit Flutter. */
export const space = {
  s0: SPACE['0'],
  s0_5: SPACE['0-5'],
  s1: SPACE['1'],
  s2: SPACE['2'],
  s3: SPACE['3'],
  s4: SPACE['4'],
  s5: SPACE['5'],
  s6: SPACE['6'],
  s8: SPACE['8'],
  s10: SPACE['10'],
  s12: SPACE['12'],
  s16: SPACE['16'],
  xs: SPACE.xs,
  s: SPACE.s,
  m: SPACE.m,
  l: SPACE.l,
  xl: SPACE.xl,
  xxl: SPACE.xxl,
} as const;

/** Rayons : `--radius-*` d'Angular, `Radii` du kit Flutter. */
export const radius = {
  none: RADIUS.none,
  xs: RADIUS.xs,
  sm: RADIUS.sm,
  md: RADIUS.md,
  lg: RADIUS.lg,
  xl: RADIUS.xl,
  x2l: RADIUS['2xl'],
  full: RADIUS.full,
  card: RADIUS.card,
  input: RADIUS.input,
} as const;

export const stateLayers = STATE_LAYERS;

/**
 * Points de rupture (dp) : ceux du kit Flutter (`Breakpoints`, `_breakpoints.scss`)
 * plus `rail` / `drawer` pour la navigation adaptative Material 3 du shell.
 */
export const breakpoints = {
  xs: 375,
  sm: 480,
  md: 600,
  tablet: 768,
  lg: 960,
  xl: 1024,
  rail: 600,
  drawer: 840,
} as const;

/** Nombre de colonnes d'une grille de démos : 1 sous 600 dp, 2 jusqu'à 960 dp, `max` au-delà. */
export function columns(width: number, max = 3): number {
  if (width >= breakpoints.lg) return max;
  if (width >= breakpoints.md) return max >= 2 ? 2 : 1;
  return 1;
}

/** Taille minimale d'une cible tactile (Material / kit Flutter). */
export const MIN_TOUCH = 48;

/** Dimensions récurrentes des composants du kit Flutter. */
export const sizes = {
  /** Hauteur des boutons : `KitButtonSize` compact / standard / create / large. */
  button: { compact: 32, standard: 40, create: 42, large: 48 },
  buttonMinWidth: 64,
  /** Icône dans un bouton : 16 en compact, 18 sinon. */
  buttonIcon: { compact: 16, standard: 18 },
  icon: { sm: 16, md: 20, lg: 24 },
  avatar: 36,
  /** Hauteur de la barre d'application et du sommaire en puces. */
  appBar: 64,
  toc: 48,
} as const;

export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Ombres `--elevation-0..5` (doubles, plus marquées en sombre), identiques à `Elevations` Flutter.
 * `boxShadow` est pris en charge nativement par la nouvelle architecture React Native.
 */
export function elevation(level: ElevationLevel, mode: 'light' | 'dark'): ViewStyle {
  const value = CSS_ELEVATION[mode][`--elevation-${level}`];
  return value === 'none' ? {} : { boxShadow: value };
}
