import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Menu } from 'react-native-paper';

import { hapticToggle } from '../../mobile';
import { withAlpha } from '../../theme/colors';
import { fontFamily } from '../../theme/fonts';
import { elevation, MIN_TOUCH, radius, space } from '../../theme/tokens';
import { useKitTheme } from '../../theme/useKitTheme';
import { toneColor, toneLight, toneText, type KitTone } from './buttonColors';
import type { IconName } from './KitButton';

/** `.refresh-btn` : bouton icône rond bordé (40 dp visuel, 48 dp tactile). */
export function RoundIconButton({
  icon,
  label,
  onPress,
  active = false,
  size = 40,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  active?: boolean;
  size?: number;
}) {
  const theme = useKitTheme();
  const slop = Math.max(0, (MIN_TOUCH - size) / 2);
  return (
    <Pressable
      onPress={onPress}
      hitSlop={slop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[
        styles.round,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: active ? theme.kit.primaryLight : theme.colors.surface,
          borderColor: active ? theme.colors.primary : theme.colors.outlineVariant,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={size * 0.5}
        color={active ? theme.colors.primary : theme.colors.onSurfaceVariant}
      />
    </Pressable>
  );
}

export interface SegOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

/** Bascule segmentée (`.m3-filter-toggle`) : pilules dans un rail ; haptique à la sélection. */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: readonly SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel?: string;
}) {
  const theme = useKitTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.rail, { backgroundColor: theme.roles.surfaceContainerHigh }]}
    >
      {options.map((o) => {
        const active = o.value === value;
        const fg = active ? theme.colors.primary : theme.colors.onSurfaceVariant;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              if (!active) hapticToggle();
              onChange(o.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label || o.value}
            hitSlop={{ top: 4, bottom: 4 }}
            style={[styles.seg, active && { backgroundColor: theme.colors.surface, ...elevation(1, theme.colorMode) }]}
          >
            {o.icon ? <MaterialCommunityIcons name={o.icon} size={16} color={fg} /> : null}
            {o.label ? <Text style={[styles.segText, { color: fg }]}>{o.label}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export type ViewMode = 'card' | 'list';

/** `<app-view-mode-toggle>` : Cartes / Liste. */
export function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <SegmentedToggle<ViewMode>
      value={mode}
      onChange={onChange}
      accessibilityLabel="Mode d’affichage"
      options={[
        { value: 'card', label: 'Cartes', icon: 'view-grid-outline' },
        { value: 'list', label: 'Liste', icon: 'view-list' },
      ]}
    />
  );
}

/** Chip de filtre avec compteur (`.filter-chip` + `.chip-count`), couleurs du lot contraste. */
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
  const theme = useKitTheme();
  const text = toneText(tone, theme);
  return (
    <Pressable
      onPress={() => {
        hapticToggle();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
      style={[
        styles.chip,
        {
          backgroundColor: active ? toneLight(tone, theme) : theme.colors.surface,
          borderColor: active ? withAlpha(toneColor(tone, theme), 0.6) : theme.colors.outlineVariant,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? text : theme.colors.onSurfaceVariant }]}>{label}</Text>
      {count !== undefined ? (
        <View
          style={[
            styles.count,
            {
              backgroundColor: active ? withAlpha(toneColor(tone, theme), 0.18) : theme.roles.surfaceContainerHighest,
            },
          ]}
        >
          <Text style={[styles.countText, { color: active ? text : theme.colors.onSurfaceVariant }]}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Bouton partagé : action principale + menu d'actions secondaires. */
export function SplitButton({
  label,
  icon,
  onPress,
  items,
  onSelect,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
  items: readonly { label: string; icon: IconName }[];
  onSelect: (label: string) => void;
}) {
  const theme = useKitTheme();
  const [open, setOpen] = useState(false);
  const fg = theme.colors.onPrimary;
  return (
    <View style={[styles.split, { backgroundColor: theme.colors.primary }]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.splitMain}>
        <MaterialCommunityIcons name={icon} size={18} color={fg} />
        <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
      </Pressable>
      <View style={[styles.splitDivider, { backgroundColor: withAlpha(fg, 0.3) }]} />
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchor={
          <Pressable
            onPress={() => setOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Plus d’options"
            style={styles.splitMore}
          >
            <MaterialCommunityIcons name="menu-down" size={24} color={fg} />
          </Pressable>
        }
      >
        {items.map((i) => (
          <Menu.Item
            key={i.label}
            leadingIcon={i.icon}
            title={i.label}
            onPress={() => {
              setOpen(false);
              onSelect(i.label);
            }}
          />
        ))}
      </Menu>
    </View>
  );
}

/** Lien d'action souligné (`.line-action`). */
export function LineAction({
  label,
  onPress,
  icon = 'arrow-right',
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
}) {
  const theme = useKitTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={label} style={styles.line}>
      <Text
        style={[
          styles.lineText,
          { color: theme.colors.primary, textDecorationColor: withAlpha(theme.colors.primary, 0.4) },
        ]}
      >
        {label}
      </Text>
      {icon ? <MaterialCommunityIcons name={icon} size={14} color={theme.colors.primary} /> : null}
    </Pressable>
  );
}

/** En-tête de page liste (PageHeader) : fil, titre, sous-titre, actions qui reviennent à la ligne. */
export function PageHeader({
  title,
  breadcrumb,
  subtitle,
  actions,
}: {
  title: string;
  breadcrumb?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const theme = useKitTheme();
  return (
    <View style={styles.header}>
      {breadcrumb ? (
        <Text style={[styles.crumb, { color: theme.colors.onSurfaceVariant }]}>{breadcrumb.toUpperCase()}</Text>
      ) : null}
      <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      {subtitle ? <Text style={{ color: theme.colors.onSurfaceVariant }}>{subtitle}</Text> : null}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  round: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rail: { flexDirection: 'row', alignSelf: 'flex-start', padding: space.s1, borderRadius: radius.full },
  seg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.s3,
    minHeight: 40,
    borderRadius: radius.full,
  },
  segText: { fontSize: 12.5, fontFamily: fontFamily('body', '600') },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingLeft: 14,
    paddingRight: 8,
    minHeight: MIN_TOUCH - 8,
  },
  chipText: { fontSize: 13, fontFamily: fontFamily('body', '600') },
  count: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: radius.full },
  countText: { fontSize: 11, fontFamily: fontFamily('body', '700') },
  split: { flexDirection: 'row', alignSelf: 'flex-start', borderRadius: radius.full, overflow: 'hidden' },
  splitMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 18,
    paddingRight: 14,
    minHeight: MIN_TOUCH,
  },
  splitDivider: { width: 1 },
  splitMore: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 14, fontFamily: fontFamily('body', '600') },
  line: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: MIN_TOUCH, alignSelf: 'flex-start' },
  lineText: { fontSize: 13, fontFamily: fontFamily('body', '600'), textDecorationLine: 'underline' },
  header: { gap: space.s1 },
  crumb: { fontSize: 11.5, letterSpacing: 0.9, fontFamily: fontFamily('body', '600') },
  title: { fontSize: 24, lineHeight: 30, fontFamily: fontFamily('heading', '600') },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, alignItems: 'center', marginTop: space.s3 },
});
