import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BUTTON_VARIANTS, buttonColors, KitButton } from '../src/components/buttons';
import { ButtonsGallery } from '../src/showcase/components/ButtonsGallery';
import { categoryById } from '../src/showcase/kitNav';
import { buildTheme } from '../src/theme/buildTheme';
import { PALETTE_ORDER, PALETTES } from '../src/theme/generated/palettes';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

const MODES = ['light', 'dark'] as const;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const alphaOf = (h: string) => (h.length === 9 ? parseInt(h.slice(7, 9), 16) / 255 : 1);
const over = (top: string, bottom: string) => {
  const a = alphaOf(top);
  const t = hex(top);
  const b = hex(bottom);
  return `#${t
    .map((v, i) =>
      Math.round(v * a + (b[i] ?? 0) * (1 - a))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
};
const lum = (h: string) => {
  const [r = 0, g = 0, b = 0] = hex(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
};

describe('KitButton : couleurs', () => {
  it.each(PALETTE_ORDER.flatMap((id) => MODES.map((m) => [id, m] as const)))('%s / %s', (id, mode) => {
    const t = buildTheme(id, mode);
    const r = PALETTES[id][mode];
    expect(buttonColors('success', t)).toMatchObject({ bg: '#22c55e', fg: '#052e16' });
    expect(buttonColors('danger', t)).toMatchObject({ bg: r.error, fg: r.onError });
    expect(buttonColors('primary', t)).toMatchObject({ bg: r.primary, fg: r.onPrimary });
    expect(buttonColors('tertiary', t)).toMatchObject({ bg: r.tertiary, fg: r.onTertiary });
    for (const v of BUTTON_VARIANTS) {
      const d = buttonColors(v, t, true);
      expect(d.fg).toBe(`${r.onSurface}61`); // 38 %
      if (d.bg !== null) expect(d.bg).toBe(`${r.onSurface}1f`); // 12 %
      if (d.border !== null) expect(d.border).toBe(`${r.onSurface}1f`);
      expect(d.elevation).toBe(0);
    }
  });

  it('cyan sombre : danger = #ffb4ab / #690005 (rôle M3, 7,72:1)', () => {
    const d = buttonColors('danger', buildTheme('cyan', 'dark'));
    expect(d).toMatchObject({ bg: '#ffb4ab', fg: '#690005' });
    expect(ratio(d.bg ?? '', d.fg)).toBeGreaterThan(7.7);
  });

  it('success : contraste 6,54:1', () => {
    expect(ratio('#22c55e', '#052e16')).toBeCloseTo(6.54, 1);
  });
});

describe('ButtonsGallery', () => {
  const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
  const show = () =>
    render(
      <SafeAreaProvider initialMetrics={metrics}>
        <KitThemeProvider>
          <ButtonsGallery />
        </KitThemeProvider>
      </SafeAreaProvider>,
    );

  it('sections dans l’ordre Flutter', async () => {
    await show();
    for (const s of categoryById('buttons')?.sections ?? []) {
      expect(screen.getByTestId(`doc-section-${s.id}`)).toBeTruthy();
    }
    expect(categoryById('buttons')?.sections.map((s) => s.id)).toEqual([
      'variants',
      'states',
      'icon',
      'header',
      'segmented',
      'menu',
      'fab',
      'sizes',
    ]);
  });

  it('les 9 variantes, Success en #052e16, désactivé sans onPress', async () => {
    await show();
    for (const v of BUTTON_VARIANTS) expect(screen.getByTestId(`btn-${v}`)).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByText('Success').props.style).color).toBe('#052e16');
    expect(screen.getByTestId('btn-disabled-primary').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('chargement : libellé, indicateur, état occupé', async () => {
    const onPress = jest.fn();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <KitThemeProvider>
          <KitButton testID="b" label="Enregistrer" loadingLabel="Enregistrement…" loading onPress={onPress} />
        </KitThemeProvider>
      </SafeAreaProvider>,
    );
    expect(screen.getByText('Enregistrement…')).toBeTruthy();
    expect(screen.getByTestId('b-spinner')).toBeTruthy();
    expect(screen.getByTestId('b').props.accessibilityState).toMatchObject({ busy: true });
    await fireEvent.press(screen.getByTestId('b'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('chaque bouton d’icône a un nom accessible', async () => {
    await show();
    for (const l of ['Modifier', 'Ajouter', 'Supprimer', 'Options', 'Rafraîchir', 'Filtre actif', 'Plus d’options']) {
      expect(screen.getAllByLabelText(l).length).toBeGreaterThan(0);
    }
  });
});
