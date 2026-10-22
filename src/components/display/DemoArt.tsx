import { useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from 'react-native-paper';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Rect, Stop } from 'react-native-svg';

import { font, mix, radius, withAlpha } from '../../theme';
import { ART_PALETTES, ART_ROAD, BLACK, WHITE } from '../../theme/swatches';

/** Générateur pseudo-aléatoire déterministe (mulberry32) : une même graine donne la même scène. */
function seeded(seed: number) {
  let a = seed + 0x6d2b79f5;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Scène illustrée générée localement (`DemoArt` Flutter) : ciel en dégradé, soleil, trois collines,
 * route et véhicule. Déterministe selon `seed` ; `t` (0–1) décale collines et véhicule pour l'animer.
 * Remplace photos et vidéos de démonstration sans aucune ressource réseau.
 */
export function DemoArt({
  seed,
  t = 0,
  label,
  icon,
  style,
}: {
  seed: number;
  t?: number;
  label?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [sky, hill, light] = ART_PALETTES[seed % ART_PALETTES.length] ?? ART_PALETTES[0];
  const { w, h } = size;
  const rnd = seeded(seed);
  const sunX = w * (0.2 + rnd() * 0.6);
  const hills = [0, 1, 2].map((layer) => {
    const base = h * (0.55 + layer * 0.12);
    const amp = h * (0.08 + rnd() * 0.06);
    const phase = rnd() * Math.PI * 2 + t * Math.PI * 2 * (layer + 1) * 0.15;
    let d = `M0 ${h}`;
    for (let x = 0; x <= w; x += 6) d += ` L${x} ${base - Math.sin((x / w) * Math.PI * (1.5 + layer) + phase) * amp}`;
    return {
      key: layer,
      d: `${d} L${w} ${h} Z`,
      fill: mix(hill, sky, 1 - (0.45 - layer * 0.2)),
      opacity: 0.85 + layer * 0.05,
    };
  });
  const roadY = h * 0.86;
  const dashes: number[] = [];
  for (let x = -40 + ((t * 80) % 40); x < w; x += 40) dashes.push(x);
  const carX = (w + 60) * ((t + rnd()) % 1) - 40;
  const wheel = h * 0.018;

  return (
    <View
      style={[styles.fill, style]}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      accessibilityRole="image"
      accessibilityLabel={label ?? 'Illustration'}
    >
      {w > 0 ? (
        <Svg width={w} height={h} style={styles.layer}>
          <Defs>
            <LinearGradient id={`sky${seed}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={sky} />
              <Stop offset="1" stopColor={mix(light, sky, 0.6)} />
            </LinearGradient>
          </Defs>
          <Rect width={w} height={h} fill={`url(#sky${seed})`} />
          <Circle cx={sunX} cy={h * 0.28} r={Math.min(w, h) * 0.11} fill={light} fillOpacity={0.9} />
          {hills.map((p) => (
            <Path key={p.key} d={p.d} fill={p.fill} fillOpacity={p.opacity} />
          ))}
          <Rect y={roadY} width={w} height={h * 0.14} fill={ART_ROAD} />
          {dashes.map((x) => (
            <Line
              key={x}
              x1={x}
              x2={x + 18}
              y1={roadY + h * 0.07}
              y2={roadY + h * 0.07}
              stroke={WHITE}
              strokeOpacity={0.7}
              strokeWidth={2}
            />
          ))}
          <Rect x={carX} y={roadY - h * 0.07} width={w * 0.14} height={h * 0.07} rx={radius.xs} fill={light} />
          <Circle cx={carX + w * 0.03} cy={roadY} r={wheel} fill={BLACK} fillOpacity={0.87} />
          <Circle cx={carX + w * 0.11} cy={roadY} r={wheel} fill={BLACK} fillOpacity={0.87} />
        </Svg>
      ) : null}
      {icon ? (
        <View style={styles.center} pointerEvents="none">
          <Icon source={icon} size={42} color={withAlpha(WHITE, 0.9)} />
        </View>
      ) : null}
      {label ? (
        <Text style={[font('700', 12), styles.label, { color: WHITE, textShadowColor: withAlpha(BLACK, 0.54) }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
  layer: { position: 'absolute', top: 0, left: 0 },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { position: 'absolute', left: 10, bottom: 8, textShadowRadius: 4 },
});
