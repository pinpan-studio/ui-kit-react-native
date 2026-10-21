import { Children, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { font, space, toneColor, useKitTheme, useKitText, type KitTone } from '../../theme';

/** En-tête de page (`PageHeader` Flutter, `.page-header`) : fil d'Ariane, titre, badge, sous-titre, actions. */
export function PageHeader({
  title,
  breadcrumb,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  breadcrumb?: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  const { kit } = useKitTheme();
  const t = useKitText();
  return (
    <View>
      {breadcrumb ? (
        <Text style={[styles.breadcrumb, { color: kit.textMuted }]}>{breadcrumb.toUpperCase()}</Text>
      ) : null}
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={[t.pageTitle, styles.shrink]}>
          {title}
        </Text>
        {badge}
      </View>
      {subtitle ? <Text style={[t.bodySm, styles.subtitle]}>{subtitle}</Text> : null}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

/** Séparateur avec libellé centré (« ou »). */
export function LabeledDivider({ label }: { label: string }) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.divider}>
      <View style={[styles.line, { backgroundColor: kit.border }]} />
      <Text style={[styles.dividerLabel, { color: kit.textMuted }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: kit.border }]} />
    </View>
  );
}

/** Barre de progression arrondie (`KitProgressBar` Flutter) ; `value` entre 0 et 1. */
export function KitProgressBar({
  value,
  tone = 'primary',
  height = 6,
  trackColor,
  accessibilityLabel,
}: {
  value: number;
  tone?: KitTone;
  height?: number;
  /** Fond de piste (fond de champ par défaut ; secondary-container pour la barre Material d'origine). */
  trackColor?: string;
  accessibilityLabel?: string;
}) {
  const { kit } = useKitTheme();
  const v = Math.min(1, Math.max(0, value));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor ?? kit.fieldBg }]}
    >
      <View style={{ width: `${v * 100}%`, height, borderRadius: height / 2, backgroundColor: toneColor(tone, kit) }} />
    </View>
  );
}

/** Grille responsive (`ResponsiveGrid` Flutter) : autant de colonnes de `minItemWidth` que la largeur le permet. */
export function ResponsiveGrid({
  children,
  minItemWidth = 280,
  spacing = space.m,
  maxColumns = 4,
}: {
  children: ReactNode;
  minItemWidth?: number;
  spacing?: number;
  maxColumns?: number;
}) {
  const [width, setWidth] = useState(0);
  const cols = Math.max(1, Math.min(maxColumns, Math.floor((width + spacing) / (minItemWidth + spacing))));
  const itemWidth = width > 0 ? (width - spacing * (cols - 1)) / cols : undefined;
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[styles.grid, { gap: spacing }]}>
      {Children.toArray(children).map((child, i) => (
        <View key={i} style={itemWidth ? { width: itemWidth } : styles.full}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  breadcrumb: { ...font('600', 11.5), letterSpacing: 0.9, marginBottom: space.s1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subtitle: { marginTop: space.s1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2, marginTop: space.s3 },
  divider: { flexDirection: 'row', alignItems: 'center' },
  line: { flex: 1, height: StyleSheet.hairlineWidth * 2 },
  dividerLabel: { ...font('400', 12), paddingHorizontal: space.s3 },
  track: { overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  full: { width: '100%' },
});
