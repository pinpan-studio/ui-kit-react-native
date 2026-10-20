import { RADIUS, SPACE, STATE_LAYERS } from './generated/tokens';

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

/** Points de rupture (dp) des règles mobiles du kit Flutter. */
export const breakpoints = { rail: 600, drawer: 840, tablet: 768 } as const;

/** Taille minimale d'une cible tactile (Material / kit Flutter). */
export const MIN_TOUCH = 48;

export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Ombres natives équivalentes à `--elevation-0..5` (plus marquées en sombre, comme Angular).
 * `elevation` pilote Android, `shadow*` pilote iOS, `boxShadow` le web.
 */
export function elevation(level: ElevationLevel, mode: 'light' | 'dark') {
  const dark = mode === 'dark';
  const spec = [
    [0, 0, 0],
    [1, 3, dark ? 0.4 : 0.06],
    [4, 8, dark ? 0.45 : 0.07],
    [10, 20, dark ? 0.5 : 0.08],
    [16, 32, dark ? 0.55 : 0.12],
    [24, 48, dark ? 0.6 : 0.18],
  ] as const;
  const [y, blur, opacity] = spec[level] ?? spec[0];
  return {
    elevation: level === 0 ? 0 : [0, 1, 3, 6, 8, 12][level],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: y },
    shadowRadius: blur / 2,
    shadowOpacity: opacity,
  };
}
