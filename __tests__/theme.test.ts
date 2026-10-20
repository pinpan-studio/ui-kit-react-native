import angular from '../scripts/source/angular-palettes.json';
import { buildTheme } from '../src/theme/buildTheme';
import { PALETTE_ORDER, PALETTES } from '../src/theme/generated/palettes';

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
const src = angular.palettes as Record<string, Record<Mode, Record<string, string>>>;

describe('palettes générées depuis angular-palettes.json', () => {
  it('contient les 41 palettes, dans l’ordre Angular', () => {
    expect(PALETTE_ORDER).toHaveLength(41);
    expect([...PALETTE_ORDER]).toEqual(angular.paletteOrder);
  });

  it.each(PALETTE_ORDER.flatMap((id) => MODES.map((m) => [id, m] as const)))(
    '%s / %s : chaque rôle est identique à la source',
    (id, mode) => {
      const ref = src[id]?.[mode];
      expect(ref).toBeDefined();
      const ours = PALETTES[id][mode] as Record<string, string>;
      expect(Object.keys(ours)).toHaveLength(51);
      for (const [k, v] of Object.entries(ref ?? {})) {
        const key = k.replace(/^--mat-sys-/, '').replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
        expect(ours[key]).toBe(v);
      }
      const t = buildTheme(id, mode);
      expect(t.colors.primary).toBe(ref?.['--mat-sys-primary']);
      expect(t.colors.tertiary).toBe(ref?.['--mat-sys-tertiary']);
      expect(t.colors.onSurface).toBe(ref?.['--mat-sys-on-surface']);
      expect(t.colors.elevation.level5).toBe(ref?.['--mat-sys-surface-container-highest']);
      expect(t.kit.onSuccess).toBe('#052e16');
      expect(t.dark).toBe(mode === 'dark');
    },
  );
});

describe('palette de base cyan', () => {
  it('clair : primary #006a6a, tertiary #964900', () => {
    const t = buildTheme('cyan', 'light');
    expect(t.colors.primary).toBe('#006a6a');
    expect(t.colors.tertiary).toBe('#964900');
  });
  it('sombre : tertiary #ffb787', () => {
    expect(buildTheme('cyan', 'dark').colors.tertiary).toBe('#ffb787');
  });
  it('désactivé M3 : on-surface 38 % (contenu) et 12 % (conteneur)', () => {
    const t = buildTheme('cyan', 'light');
    expect(t.colors.onSurfaceDisabled).toBe('#191c1c61');
    expect(t.colors.surfaceDisabled).toBe('#191c1c1f');
  });
  it('polices : Inter pour le corps, Outfit pour les titres', () => {
    const t = buildTheme('cyan', 'light');
    expect(t.fonts.bodyLarge.fontFamily).toBe('Inter_400Regular');
    expect(t.fonts.labelLarge.fontFamily).toBe('Inter_500Medium');
    expect(t.fonts.headlineMedium.fontFamily).toBe('Outfit_400Regular');
  });
});
