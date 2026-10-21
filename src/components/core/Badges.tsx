import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';

import { font, radius, space, toneColor, toneLight, toneText, useKitTheme, type KitTone } from '../../theme';

/** `<app-status-badge>` / `.m3-badge` : capitales 11 px, fond léger, rayon 12. */
export function StatusBadge({
  label,
  tone = 'neutral',
  icon,
  uppercase = true,
}: {
  label: string;
  tone?: KitTone;
  icon?: string;
  uppercase?: boolean;
}) {
  const { kit } = useKitTheme();
  const color = toneText(tone, kit);
  return (
    <View style={[styles.badge, { backgroundColor: toneLight(tone, kit) }]}>
      {icon ? <Icon source={icon} size={14} color={color} /> : null}
      <Text numberOfLines={1} style={[styles.badgeText, { color }]}>
        {uppercase ? label.toUpperCase() : label}
      </Text>
    </View>
  );
}

/** Pastille compteur d'icône (`CountDot` Flutter) : « 99+ » au-delà de 99. */
export function CountDot({ count, tone = 'error' }: { count: number; tone?: KitTone }) {
  const { kit } = useKitTheme();
  const text = count > 99 ? '99+' : `${count}`;
  return (
    <View style={[styles.dot, { backgroundColor: toneColor(tone, kit) }]} accessibilityLabel={text} accessible>
      <Text style={[styles.dotText, { color: kit.onTone }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.s1,
    paddingHorizontal: space.s3,
    paddingVertical: space.s1,
    borderRadius: radius.md,
  },
  badgeText: { ...font('700', 11), letterSpacing: 0.4, lineHeight: 13.2, flexShrink: 1 },
  dot: {
    minWidth: 18,
    minHeight: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  dotText: font('700', 10.5),
});
