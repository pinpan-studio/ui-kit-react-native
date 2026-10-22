import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BUTTON_VARIANTS, buttonColors, KitButton, toneLight, toneText, type KitTone } from '../src/components/buttons';
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

describe('chips de filtre : texte de ton sur fond -light ≥ 4,5:1 (lot contraste)', () => {
  const tones: KitTone[] = ['primary', 'success', 'warning', 'error'];
  it.each(PALETTE_ORDER.flatMap((id) => MODES.map((m) => [id, m] as const)))('%s / %s', (id, mode) => {
    const t = buildTheme(id, mode);
    for (const tone of tones) {
      const bg = over(toneLight(tone, t), t.colors.surface);
      expect([tone, ratio(toneText(tone, t), bg) >= 4.5]).toEqual([tone, true]);
    }
  });
  it('valeurs du lot : clair 800, sombre 300', () => {
    const l = buildTheme('cyan', 'light');
    const d = buildTheme('cyan', 'dark');
    expect([toneText('success', l), toneText('warning', l)]).toEqual(['#166534', '#854d0e']);
    expect([toneText('success', d), toneText('warning', d)]).toEqual(['#86efac', '#fde047']);
    expect(toneText('error', d)).toBe('#ffdad6');
  });
});
