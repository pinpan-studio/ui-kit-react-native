import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type DimensionValue } from 'react-native';

import { useReducedMotion } from '../../mobile/useReducedMotion';
import { mix, space, useKitTheme } from '../../theme';

/** Opacités du reflet : approximation du dégradé `[base, hi, base]` (arrêts 0,2 / 0,5 / 0,8) de Flutter. */
const RAMP = [0.15, 0.45, 0.8, 1, 0.8, 0.45, 0.15];

/** Squelette animé (`Skeleton` Flutter, `ngx-skeleton-loader`) : reflet qui balaie en 1,4 s. */
export function Skeleton({
  width,
  height = 14,
  radius = 8,
  circle = false,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  circle?: boolean;
}) {
  const { kit } = useKitTheme();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced || w === 0) return;
    const loop = Animated.loop(
      Animated.timing(progress, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, reduced, w]);

  const band = w * 0.6;
  // Le centre du reflet parcourt 0 → 1,5 largeur, comme l'alignement −1 → 2 du dégradé Flutter.
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-band / 2, w * 1.5 - band / 2] });
  const highlight = mix(kit.card, kit.fieldBg, 0.7);

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[
        styles.base,
        {
          width: circle ? height : width,
          height,
          borderRadius: circle ? height / 2 : radius,
          backgroundColor: kit.fieldBg,
        },
      ]}
    >
      {reduced || w === 0 ? null : (
        <Animated.View style={[styles.band, { width: band, transform: [{ translateX }] }]}>
          {RAMP.map((opacity, i) => (
            <View key={i} style={[styles.flex, { backgroundColor: highlight, opacity }]} />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

/** Squelette d'une ligne de liste : avatar + 2 lignes. */
export function SkeletonListTile() {
  return (
    <View style={styles.tile}>
      <Skeleton height={40} circle />
      <View style={[styles.flex, styles.lines]}>
        <Skeleton width={160} height={12} />
        <Skeleton height={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  base: { overflow: 'hidden' },
  band: { position: 'absolute', top: 0, bottom: 0, left: 0, flexDirection: 'row' },
  tile: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: space.s3 },
  lines: { gap: space.s2 },
});
