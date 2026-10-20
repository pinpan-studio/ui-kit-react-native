import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Modal, Portal, SegmentedButtons, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hapticToggle, KitIconButton, useBackClose } from '../mobile';
import { useThemeStore, type ModePreference } from '../store/themeStore';
import { PALETTE_META, PALETTES, type PaletteId } from '../theme/generated/palettes';
import { MIN_TOUCH, radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

/** Feuille du bas : choix du mode (clair / sombre / système) et des 41 palettes. */
export function PaletteSheet({ visible, onDismiss }: Props) {
  const theme = useKitTheme();
  const insets = useSafeAreaInsets();
  const { paletteId, mode, setPalette, setMode } = useThemeStore();
  const close = useCallback(() => onDismiss(), [onDismiss]);
  useBackClose(visible, close);

  const pick = (id: PaletteId) => {
    hapticToggle();
    setPalette(id);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={close}
        style={styles.modal}
        contentContainerStyle={[
          styles.sheet,
          { backgroundColor: theme.roles.surfaceContainerLow, paddingBottom: insets.bottom + space.s4 },
        ]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" accessibilityRole="header" style={styles.flex}>
            Thème
          </Text>
          <KitIconButton icon="close" accessibilityLabel="Fermer le choix du thème" onPress={close} />
        </View>
        <SegmentedButtons
          value={mode}
          onValueChange={(v) => {
            hapticToggle();
            setMode(v as ModePreference);
          }}
          buttons={[
            { value: 'light', label: 'Clair', icon: 'white-balance-sunny', style: styles.seg },
            { value: 'dark', label: 'Sombre', icon: 'weather-night', style: styles.seg },
            { value: 'system', label: 'Système', icon: 'theme-light-dark', style: styles.seg },
          ]}
        />
        <Text variant="titleSmall" style={styles.sub}>
          Palettes ({PALETTE_META.length})
        </Text>
        <ScrollView contentContainerStyle={styles.grid}>
          {PALETTE_META.map((p) => {
            const sw = PALETTES[p.id][theme.colorMode];
            const selected = p.id === paletteId;
            return (
              <Pressable
                key={p.id}
                testID={`palette-${p.id}`}
                onPress={() => pick(p.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`Palette ${p.label}`}
                style={[
                  styles.swatch,
                  { borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant },
                  selected && styles.swatchSelected,
                ]}
              >
                <View style={styles.dots} accessible={false} importantForAccessibility="no-hide-descendants">
                  <View style={[styles.dot, { backgroundColor: sw.primary }]} />
                  <View style={[styles.dot, { backgroundColor: sw.secondary }]} />
                  <View style={[styles.dot, { backgroundColor: sw.tertiary }]} />
                </View>
                <Text variant="labelMedium" numberOfLines={2}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: space.s4,
    paddingTop: space.s2,
    maxHeight: '85%',
  },
  header: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TOUCH },
  flex: { flex: 1 },
  seg: { minHeight: MIN_TOUCH, justifyContent: 'center' },
  sub: { marginTop: space.s4, marginBottom: space.s2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, paddingBottom: space.s4 },
  swatch: {
    width: 96,
    minHeight: 72,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.s2,
    gap: space.s1,
    justifyContent: 'center',
  },
  swatchSelected: { borderWidth: 2 },
  dots: { flexDirection: 'row', gap: space.s1 },
  dot: { width: 18, height: 18, borderRadius: radius.full },
});
