import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, Menu, TouchableRipple } from 'react-native-paper';

import { MIN_TOUCH, font, space, useKitTheme, withAlpha } from '../../theme';

/** Bouton icône rond bordé (`RoundIconButton` Flutter, `.refresh-btn`) : 40 dp visibles, cible de 48 dp. */
export function RoundIconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 40,
  active = false,
}: {
  icon: string;
  onPress?: () => void;
  /** Obligatoire : nom lu par TalkBack / VoiceOver (le `tooltip` Flutter). */
  accessibilityLabel: string;
  size?: number;
  active?: boolean;
}) {
  const { kit } = useKitTheme();
  const slop = Math.max(0, (MIN_TOUCH - size) / 2);
  return (
    <TouchableRipple
      onPress={onPress}
      disabled={!onPress}
      borderless
      hitSlop={slop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active, disabled: !onPress }}
      style={[
        styles.round,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: active ? kit.primaryLight : kit.card,
          borderColor: active ? kit.primary : kit.border,
        },
      ]}
    >
      <Icon source={icon} size={size * 0.5} color={active ? kit.primary : kit.textSecondary} />
    </TouchableRipple>
  );
}

export interface SplitButtonItem {
  label: string;
  icon: string;
}

/** Bouton partagé : action principale + menu d'actions secondaires (`SplitButton` Flutter). */
export function SplitButton({
  label,
  icon,
  onPress,
  items,
  onSelect,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  items: SplitButtonItem[];
  onSelect: (label: string) => void;
}) {
  const { kit, roles } = useKitTheme();
  const [open, setOpen] = useState(false);
  const ripple = withAlpha(kit.onPrimary, 0.12);
  return (
    <View style={[styles.split, { backgroundColor: kit.primary }]}>
      <TouchableRipple onPress={onPress} rippleColor={ripple} accessibilityRole="button" style={styles.splitMain}>
        <View style={styles.splitRow}>
          <Icon source={icon} size={18} color={kit.onPrimary} />
          <Text style={[styles.splitLabel, { color: kit.onPrimary }]}>{label}</Text>
        </View>
      </TouchableRipple>
      <View style={[styles.splitDivider, { backgroundColor: withAlpha(kit.onPrimary, 0.3) }]} />
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        contentStyle={{ backgroundColor: roles.surfaceContainer }}
        anchor={
          <TouchableRipple
            onPress={() => setOpen(true)}
            rippleColor={ripple}
            accessibilityRole="button"
            accessibilityLabel="Plus d’options"
            style={styles.splitMore}
          >
            <Icon source="menu-down" size={24} color={kit.onPrimary} />
          </TouchableRipple>
        }
      >
        {items.map((item) => (
          <Menu.Item
            key={item.label}
            leadingIcon={item.icon}
            title={item.label}
            onPress={() => {
              setOpen(false);
              onSelect(item.label);
            }}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  round: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  split: { flexDirection: 'row', alignSelf: 'flex-start', borderRadius: 999, overflow: 'hidden', minHeight: MIN_TOUCH },
  splitMain: { justifyContent: 'center', paddingLeft: 18, paddingRight: space.s4 },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  splitLabel: font('600', 14),
  splitDivider: { width: 1 },
  splitMore: { justifyContent: 'center', paddingHorizontal: space.s2 },
});
