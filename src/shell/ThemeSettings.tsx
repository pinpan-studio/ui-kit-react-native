import { StyleSheet, Text, View } from 'react-native';
import { Icon, SegmentedButtons, TouchableRipple } from 'react-native-paper';
import Svg, { Circle, Path } from 'react-native-svg';

import { hapticToggle } from '../mobile';
import { useThemeStore, type ModePreference } from '../store/themeStore';
import { PALETTE_META, PALETTES, type PaletteId } from '../theme/generated/palettes';
import { font, MIN_TOUCH, space, useKitTheme, withAlpha } from '../theme';

/**
 * Pastille d'un thème (`PaletteSwatch` Flutter) : moitié haute primary, quarts bas secondary / tertiary,
 * comme le sélecteur « Fond d'écran et style » d'Android. Cible tactile de 48 dp.
 */
export function PaletteSwatch({
  label,
  colors,
  selected,
  onPress,
  testID,
}: {
  label: string;
  colors: { primary: string; secondary: string; tertiary: string };
  selected: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const { roles } = useKitTheme();
  const size = selected ? 34 : 40;
  const r = size / 2;
  return (
    <TouchableRipple
      borderless
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`Palette ${label}`}
      testID={testID}
      style={styles.swatchHit}
    >
      <View
        style={[
          { width: size, height: size, borderRadius: r },
          selected && { boxShadow: `0 0 0 3px ${roles.surfaceContainerLow}, 0 0 0 5px ${colors.primary}` },
        ]}
      >
        <Svg width={size} height={size}>
          <Path d={`M0 ${r} A${r} ${r} 0 0 1 ${size} ${r} Z`} fill={colors.primary} />
          <Path d={`M${r} ${r} L0 ${r} A${r} ${r} 0 0 0 ${r} ${size} Z`} fill={colors.secondary} />
          <Path d={`M${r} ${r} L${r} ${size} A${r} ${r} 0 0 0 ${size} ${r} Z`} fill={colors.tertiary} />
          <Circle cx={r} cy={r} r={r - 0.5} fill="none" stroke={withAlpha(roles.onSurface, 0.12)} />
        </Svg>
        {selected ? (
          <View style={styles.check}>
            <View style={[styles.checkDisc, { backgroundColor: roles.surfaceContainerHighest }]}>
              <Icon source="mi:check" size={18} color={roles.onSurface} />
            </View>
          </View>
        ) : null}
      </View>
    </TouchableRipple>
  );
}

/** Réglages d'apparence (`ThemeSettings` Flutter) : mode (bouton segmenté M3) et couleur (41 palettes). */
export function ThemeSettings() {
  const { kit, colorMode } = useKitTheme();
  const { paletteId, mode, setPalette, setMode } = useThemeStore();
  const current = PALETTE_META.find((p) => p.id === paletteId)?.label ?? paletteId;
  const pick = (id: PaletteId) => {
    hapticToggle();
    setPalette(id);
  };
  return (
    <View>
      <Text style={[font('500', 14), styles.title, { color: kit.textPrimary }]}>Mode</Text>
      <SegmentedButtons
        value={mode}
        onValueChange={(v) => {
          hapticToggle();
          setMode(v as ModePreference);
        }}
        buttons={[
          { value: 'light', label: 'Clair', icon: 'mi:light-mode', style: styles.seg },
          { value: 'dark', label: 'Sombre', icon: 'mi:dark-mode', style: styles.seg },
          { value: 'system', label: 'Système', icon: 'mi:brightness-auto', style: styles.seg },
        ]}
      />
      <View style={styles.colorRow}>
        <Text style={[font('500', 14), { color: kit.textPrimary }]}>Couleur</Text>
        <Text style={[font('400', 12), { color: kit.textSecondary }]}>{current}</Text>
      </View>
      <View accessibilityRole="radiogroup" style={styles.swatches}>
        {PALETTE_META.map((p) => (
          <PaletteSwatch
            key={p.id}
            label={p.label}
            colors={PALETTES[p.id][colorMode]}
            selected={p.id === paletteId}
            onPress={() => pick(p.id)}
            testID={`palette-${p.id}`}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 10 },
  seg: { minHeight: MIN_TOUCH, justifyContent: 'center' },
  colorRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.s2, marginTop: space.l, marginBottom: 10 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  swatchHit: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  check: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDisc: { borderRadius: 999, padding: 1 },
});
