import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import {
  elevation,
  font,
  radius as radii,
  space,
  tabular,
  toneColor,
  toneLight,
  useKitTheme,
  useKitText,
  type KitTone,
} from '../../theme';

export interface KitCardProps {
  children: ReactNode;
  /** Marge intérieure du contenu (16 par défaut). */
  padding?: number;
  onPress?: () => void;
  title?: string;
  icon?: string;
  trailing?: ReactNode;
  color?: string;
  /** Contour d'état (sélection) ; la carte n'a pas de contour par défaut. */
  borderColor?: string;
  radius?: number;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Panneau (`KitCard` Flutter, `.panel-card`) : fond `card`, rayon 24, sans contour —
 * la carte se détache par son fond.
 */
export function KitCard({
  children,
  padding = space.m,
  onPress,
  title,
  icon,
  trailing,
  color,
  borderColor,
  radius = radii.card,
  shadow = false,
  style,
  contentStyle,
  accessibilityLabel,
  testID,
}: KitCardProps) {
  const { kit, colorMode } = useKitTheme();
  const t = useKitText();
  const body = (
    <View>
      {title ? (
        <View style={styles.header}>
          {icon ? <Icon source={icon} size={20} color={kit.primary} /> : null}
          <Text style={[t.cardTitle, styles.flex]} accessibilityRole="header">
            {title}
          </Text>
          {trailing}
        </View>
      ) : null}
      <View style={[{ padding }, contentStyle]}>{children}</View>
    </View>
  );
  return (
    <View
      testID={testID}
      style={[
        { backgroundColor: color ?? kit.card, borderRadius: radius },
        borderColor ? { borderWidth: 1, borderColor } : null,
        shadow ? elevation(2, colorMode) : null,
        style,
      ]}
    >
      {onPress ? (
        <TouchableRipple
          onPress={onPress}
          borderless
          style={{ borderRadius: radius }}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          {body}
        </TouchableRipple>
      ) : (
        body
      )}
    </View>
  );
}

/** Variation ▲ / ▼ colorée (`TrendChip` Flutter). */
export function TrendChip({
  text,
  up = true,
  goodWhenUp = true,
}: {
  text: string;
  up?: boolean;
  goodWhenUp?: boolean;
}) {
  const { kit } = useKitTheme();
  const color = up === goodWhenUp ? kit.successText : kit.errorText;
  return (
    <View style={styles.trend}>
      <Icon source={up ? 'trending-up' : 'trending-down'} size={14} color={color} />
      <Text numberOfLines={1} style={[styles.trendText, { color }]}>
        {text}
      </Text>
    </View>
  );
}

export interface KpiCardProps {
  icon: string;
  value: string;
  label: string;
  tone?: KitTone;
  unit?: string;
  delta?: string;
  up?: boolean;
  /** `false` pour un indicateur où la hausse est mauvaise (impayés, latence…). */
  goodWhenUp?: boolean;
  onPress?: () => void;
}

/** `.kpi-card` : disque d'icône teinté, valeur Outfit 22, libellé 12, tendance optionnelle. */
export function KpiCard({
  icon,
  value,
  label,
  tone = 'primary',
  unit,
  delta,
  up,
  goodWhenUp = true,
  onPress,
}: KpiCardProps) {
  const { kit } = useKitTheme();
  return (
    <KitCard onPress={onPress} padding={space.s4}>
      <View style={styles.kpi}>
        <View style={[styles.kpiDisc, { backgroundColor: toneLight(tone, kit) }]}>
          <Icon source={icon} size={22} color={toneColor(tone, kit)} />
        </View>
        <View style={styles.flex}>
          <Text numberOfLines={1} style={[styles.kpiValue, { color: kit.textPrimary }]}>
            {value}
            {unit ? <Text style={[styles.kpiUnit, { color: kit.textSecondary }]}>{` ${unit}`}</Text> : null}
          </Text>
          <View style={styles.kpiMeta}>
            <Text numberOfLines={2} style={[styles.kpiLabel, { color: kit.textSecondary }]}>
              {label}
            </Text>
            {delta ? <TrendChip text={delta} up={up ?? true} goodWhenUp={goodWhenUp} /> : null}
          </View>
        </View>
      </View>
    </KitCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: space.m,
    paddingTop: space.s4,
    paddingRight: space.s,
  },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 1 },
  trendText: { ...font('700', 11.5), flexShrink: 1 },
  kpi: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  kpiDisc: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { ...font('700', 22, 'heading'), lineHeight: 26.4, ...tabular },
  kpiUnit: font('600', 12),
  kpiMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 2, marginTop: 2 },
  kpiLabel: font('500', 12),
});
