import { StyleSheet, Text, View } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import {
  MIN_TOUCH,
  elevation,
  font,
  space,
  toneColor,
  toneLight,
  toneText,
  useKitTheme,
  withAlpha,
  type KitTone,
} from '../../theme';

/** Chip de filtre avec compteur (`FilterChipButton` Flutter, `.filter-chip` + `.chip-count`). */
export function FilterChipButton({
  label,
  count,
  active = false,
  tone = 'primary',
  onPress,
}: {
  label: string;
  count?: number;
  active?: boolean;
  tone?: KitTone;
  onPress?: () => void;
}) {
  const { kit } = useKitTheme();
  const color = toneText(tone, kit);
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      hitSlop={{ top: 6, bottom: 6 }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
      style={[
        styles.chip,
        {
          backgroundColor: active ? toneLight(tone, kit) : kit.card,
          borderColor: active ? withAlpha(toneColor(tone, kit), 0.6) : kit.border,
        },
      ]}
    >
      <View style={styles.chipRow}>
        <Text style={[styles.chipLabel, { color: active ? color : kit.textSecondary }]}>{label}</Text>
        {count === undefined ? null : (
          <View style={[styles.count, { backgroundColor: active ? withAlpha(toneColor(tone, kit), 0.18) : kit.hover }]}>
            <Text style={[styles.countText, { color: active ? color : kit.textMuted }]}>{count}</Text>
          </View>
        )}
      </View>
    </TouchableRipple>
  );
}

export interface SegmentOption<T> {
  value: T;
  label: string;
  icon?: string;
  /** Requis quand `label` est vide (segment icône seule). */
  accessibilityLabel?: string;
}

/** Bascule segmentée (`SegmentedToggle` Flutter, `.m3-filter-toggle`) : options pilules dans un rail. */
export function SegmentedToggle<T extends string | number>({
  options,
  value,
  onChange,
  expand = false,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  expand?: boolean;
}) {
  const { kit, colorMode } = useKitTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.rail, { backgroundColor: kit.fieldBg }, expand ? styles.railExpand : styles.railFit]}
    >
      {options.map((o) => {
        const active = o.value === value;
        const color = active ? kit.primary : kit.textSecondary;
        return (
          <TouchableRipple
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            borderless
            hitSlop={{ top: 4, bottom: 4 }}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={o.accessibilityLabel ?? o.label}
            style={[
              styles.segment,
              { paddingHorizontal: expand ? space.s2 : space.s3 },
              expand && styles.flex,
              active && { backgroundColor: kit.card, ...elevation(1, colorMode) },
            ]}
          >
            <View style={styles.segmentRow}>
              {o.icon ? <Icon source={o.icon} size={16} color={color} /> : null}
              {o.label ? (
                <Text numberOfLines={1} style={[styles.segmentLabel, { color }]}>
                  {o.label}
                </Text>
              ) : null}
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

export type ViewMode = 'card' | 'list';

/** `<app-view-mode-toggle>` : Cartes / Liste. */
export function ViewModeToggle({
  mode,
  onChange,
  showLabels = true,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  showLabels?: boolean;
}) {
  return (
    <SegmentedToggle<ViewMode>
      value={mode}
      onChange={onChange}
      options={[
        { value: 'card', label: showLabels ? 'Cartes' : '', icon: 'mi:grid-view', accessibilityLabel: 'Cartes' },
        { value: 'list', label: showLabels ? 'Liste' : '', icon: 'mi:view-list', accessibilityLabel: 'Liste' },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    minHeight: MIN_TOUCH - 12,
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: space.s4,
    paddingRight: space.s2,
    paddingVertical: space.s2,
  },
  chipLabel: font('600', 13),
  count: { paddingHorizontal: space.s2, paddingVertical: 1, borderRadius: 999 },
  countText: font('700', 11),
  rail: { flexDirection: 'row', padding: space.s1, borderRadius: 999 },
  railFit: { alignSelf: 'flex-start' },
  railExpand: { alignSelf: 'stretch' },
  segment: { borderRadius: 999, paddingVertical: space.s2, justifyContent: 'center' },
  segmentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  segmentLabel: { ...font('600', 12.5), flexShrink: 1 },
});
