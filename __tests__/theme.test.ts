import angular from '../scripts/source/angular-palettes.json';
import { buildTheme } from '../src/theme/buildTheme';
import { withAlpha } from '../src/theme/colors';
import { fontFamily } from '../src/theme/fonts';
import { PALETTE_ORDER, PALETTES } from '../src/theme/generated/palettes';
import { KIT_TONES, toneColor, toneLight, toneText } from '../src/theme/tone';
import { columns, elevation } from '../src/theme/tokens';
import { coloredText, kitText } from '../src/theme/typography';

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
  it('polices : Inter pour le corps, Outfit pour les titres, graisses de AppTheme Flutter', () => {
    const t = buildTheme('cyan', 'light');
    expect(t.fonts.bodyLarge.fontFamily).toBe('Inter_400Regular');
    expect(t.fonts.labelLarge.fontFamily).toBe('Inter_500Medium');
    expect(t.fonts.headlineMedium.fontFamily).toBe('Outfit_700Bold');
    expect(t.fonts.headlineSmall.fontFamily).toBe('Outfit_600SemiBold');
    expect(t.fonts.titleLarge.fontFamily).toBe('Outfit_600SemiBold');
    expect(t.fonts.titleMedium.fontFamily).toBe('Inter_600SemiBold');
    expect(t.fonts.displaySmall.fontFamily).toBe('Outfit_400Regular');
  });
});

/** Rapport de contraste WCAG, comme `_contrast` de `theme_test.dart`. */
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('contrastes M3 (paires rôle / on-rôle ≥ 4,5:1, comme Flutter)', () => {
  it.each(PALETTE_ORDER.flatMap((id) => MODES.map((m) => [id, m] as const)))('%s / %s', (id, mode) => {
    const r = PALETTES[id][mode];
    const pairs: Record<string, [string, string]> = {
      primary: [r.primary, r.onPrimary],
      primaryContainer: [r.primaryContainer, r.onPrimaryContainer],
      secondary: [r.secondary, r.onSecondary],
      secondaryContainer: [r.secondaryContainer, r.onSecondaryContainer],
      tertiary: [r.tertiary, r.onTertiary],
      tertiaryContainer: [r.tertiaryContainer, r.onTertiaryContainer],
      error: [r.error, r.onError],
      errorContainer: [r.errorContainer, r.onErrorContainer],
      surface: [r.surface, r.onSurface],
      surfaceVariant: [r.surfaceContainerHighest, r.onSurfaceVariant],
      inverseSurface: [r.inverseSurface, r.inverseOnSurface],
    };
    for (const [name, [bg, fg]] of Object.entries(pairs)) {
      expect({ name, ok: contrast(bg, fg) >= 4.5 }).toEqual({ name, ok: true });
    }
  });
});

describe('KitColors (KitColors.fromScheme Flutter)', () => {
  it('clair : dérivés des rôles M3', () => {
    const { kit, roles } = buildTheme('cyan', 'light');
    expect(kit.primary).toBe(roles.primary);
    expect(kit.textPrimary).toBe(roles.onSurface);
    expect(kit.textSecondary).toBe(roles.onSurfaceVariant);
    expect(kit.textMuted).toBe(withAlpha(roles.onSurfaceVariant, 0.7));
    expect(kit.bg).toBe(roles.surface);
    expect(kit.card).toBe(roles.surfaceContainerLow);
    expect(kit.hover).toBe(roles.surfaceContainerHigh);
    expect(kit.tableHeader).toBe(roles.surfaceContainer);
    expect(kit.fieldBg).toBe(roles.surfaceContainerHigh);
    expect(kit.border).toBe('#00000014');
    expect(kit.divider).toBe(withAlpha(roles.outlineVariant, 0.45));
    expect(kit.primaryLight).toBe(withAlpha(roles.primary, 0.08));
    expect(kit.errorLight).toBe(withAlpha(roles.error, 0.1));
    expect(kit.successText).toBe('#15803d');
  });
  it('sombre : opacités et textes sémantiques propres au mode', () => {
    const { kit, roles } = buildTheme('cyan', 'dark');
    expect(kit.textMuted).toBe(withAlpha(roles.onSurfaceVariant, 0.65));
    expect(kit.border).toBe('#ffffff14');
    expect(kit.primaryLight).toBe(withAlpha(roles.primary, 0.14));
    expect(kit.errorLight).toBe(withAlpha(roles.error, 0.16));
    expect(kit.successText).toBe('#4ade80');
  });
});

describe('KitTone', () => {
  const { kit } = buildTheme('cyan', 'light');
  it('couleur, fond léger et texte par teinte', () => {
    expect(toneColor('success', kit)).toBe('#22c55e');
    expect(toneLight('success', kit)).toBe(kit.successLight);
    expect(toneText('success', kit)).toBe('#15803d');
    expect(toneColor('primary', kit)).toBe(kit.primary);
    expect(toneText('primary', kit)).toBe(kit.primary);
  });
  it('neutre : texte atténué, fond on-surface 6 %', () => {
    expect(toneColor('neutral', kit)).toBe(kit.textMuted);
    expect(toneLight('neutral', kit)).toBe(withAlpha(kit.textPrimary, 0.06));
    expect(toneText('neutral', kit)).toBe(kit.textSecondary);
  });
  it('les 9 teintes ont des valeurs définies', () => {
    for (const t of KIT_TONES) {
      expect(toneColor(t, kit)).toMatch(/^#/);
      expect(toneLight(t, kit)).toMatch(/^#/);
      expect(toneText(t, kit)).toMatch(/^#/);
    }
  });
});

describe('KitText', () => {
  it('reprend l’échelle Flutter (taille, interligne, graisse, approche)', () => {
    expect(kitText.display).toEqual({
      fontFamily: 'Outfit_700Bold',
      fontSize: 40,
      lineHeight: 46,
      letterSpacing: -1.2,
    });
    expect(kitText.h2).toMatchObject({ fontFamily: 'Outfit_600SemiBold', fontSize: 24, lineHeight: 30 });
    expect(kitText.body).toMatchObject({ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21.7 });
    expect(kitText.label).toMatchObject({ fontFamily: 'Inter_600SemiBold', fontSize: 12 });
    expect(kitText.overline).toMatchObject({ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.66 });
    expect(kitText.mono).toMatchObject({ fontFamily: 'SpaceMono_400Regular', fontSize: 12.5 });
    expect(kitText.brand).toMatchObject({ fontFamily: 'TTWellingtons_600SemiBold', fontSize: 18 });
  });
  it('couleurs par défaut de context.t', () => {
    const { kit } = buildTheme('cyan', 'light');
    const t = coloredText(kit);
    expect(t.h1.color).toBe(kit.textPrimary);
    expect(t.bodySm.color).toBe(kit.textSecondary);
    expect(t.caption.color).toBe(kit.textMuted);
  });
  it('polices : graisses embarquées les plus proches', () => {
    expect(fontFamily('heading', '300')).toBe('Outfit_300Light');
    expect(fontFamily('body', '800')).toBe('Inter_800ExtraBold');
    expect(fontFamily('mono', '600')).toBe('SpaceMono_700Bold');
    expect(fontFamily('brand', '800')).toBe('TTWellingtons_700Bold');
    expect(fontFamily('brand', '300')).toBe('TTWellingtons_400Regular');
  });
});

describe('jetons', () => {
  it('colonnes : 1 < 600 dp ≤ 2 < 960 dp ≤ max', () => {
    expect(columns(390)).toBe(1);
    expect(columns(600)).toBe(2);
    expect(columns(959)).toBe(2);
    expect(columns(960)).toBe(3);
    expect(columns(1200, 2)).toBe(2);
    expect(columns(700, 1)).toBe(1);
  });
  it('élévations : ombres doubles identiques à Flutter, aucune au niveau 0', () => {
    expect(elevation(0, 'light')).toEqual({});
    expect(elevation(1, 'light').boxShadow).toBe('0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)');
    expect(elevation(5, 'dark').boxShadow).toBe(
      '0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 10px 20px -6px rgba(0, 0, 0, 0.5)',
    );
  });
});
