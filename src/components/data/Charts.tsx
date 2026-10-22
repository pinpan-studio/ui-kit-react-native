import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polygon, Stop, Text as SvgText } from 'react-native-svg';

import { compact as fmtCompact, decimal1, number } from '../../core/format';
import { useReducedMotion } from '../../mobile/useReducedMotion';
import { font, radius, space, toneColor, useKitTheme, type KitColors, type KitTone } from '../../theme';

/** Types de graphiques (`ChartKind` Flutter). */
export type ChartKind = 'line' | 'area' | 'bar' | 'hbar' | 'stacked' | 'doughnut' | 'pie' | 'radar';

export interface ChartSeries {
  label: string;
  data: number[];
  color?: string;
}

/** Palette catégorielle du kit : primaire, info, tertiaire, violet, success, warning, cyan, erreur. */
export const chartPalette = (c: KitColors) => [
  c.primary,
  c.info,
  c.tertiary,
  c.purple,
  c.success,
  c.warning,
  c.cyan,
  c.error,
];

const LEFT = 38;
const BOTTOM = 24;
const TOP = 8;

/** Maximum « rond » de l'axe des valeurs et pas de grille (environ 6 intervalles, comme fl_chart). */
export function niceScale(max: number): { max: number; step: number } {
  if (max <= 0) return { max: 1, step: 0.25 };
  const raw = max / 6;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  return { max: Math.ceil(max / step) * step, step };
}

/** Chemin lissé (Catmull-Rom → Bézier), sans dépassement vertical entre deux points. */
function smooth(points: [number, number][]): string {
  const [first] = points;
  if (!first) return '';
  let d = `M${first[0]} ${first[1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i] ?? first;
    const p1 = points[i] ?? first;
    const p2 = points[i + 1] ?? p1;
    const p3 = points[i + 2] ?? p2;
    const t = 0.3;
    const clampY = (y: number) => Math.min(Math.max(y, Math.min(p1[1], p2[1])), Math.max(p1[1], p2[1]));
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) * t * 0.5, clampY(p1[1] + (p2[1] - p0[1]) * t * 0.5)];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) * t * 0.5, clampY(p2[1] - (p3[1] - p1[1]) * t * 0.5)];
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/** Arc d'anneau ou de secteur (angles en radians, 0 = midi). */
function arc(cx: number, cy: number, r: number, inner: number, a0: number, a1: number): string {
  const p = (rr: number, a: number) => `${cx + rr * Math.sin(a)} ${cy - rr * Math.cos(a)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  if (inner <= 0) return `M${cx} ${cy} L${p(r, a0)} A${r} ${r} 0 ${large} 1 ${p(r, a1)} Z`;
  return `M${p(r, a0)} A${r} ${r} 0 ${large} 1 ${p(r, a1)} L${p(inner, a1)} A${inner} ${inner} 0 ${large} 0 ${p(inner, a0)} Z`;
}

/**
 * Graphique du kit (`KitChart` Flutter, remplace Chart.js / fl_chart) : couleurs du thème, grille discrète,
 * info-bulle au toucher, légende en puces. Dessiné en SVG.
 */
export function KitChart({
  kind,
  labels,
  series,
  height = 220,
  unit = '',
  showLegend = true,
  compactValues = false,
}: {
  kind: ChartKind;
  labels: string[];
  series: ChartSeries[];
  height?: number;
  unit?: string;
  showLegend?: boolean;
  compactValues?: boolean;
}) {
  const { kit, roles } = useKitTheme();
  const [w, setW] = useState(0);
  const [tip, setTip] = useState<number | null>(null);
  const pal = chartPalette(kit);
  const col = (i: number) => series[i]?.color ?? pal[i % pal.length] ?? kit.primary;
  const fmt = (v: number) => (compactValues ? fmtCompact(v) : Number.isInteger(v) ? number(v) : decimal1(v));
  const first = series[0]?.data ?? [];
  const circular = kind === 'doughnut' || kind === 'pie';
  const legend: [string, string, number | null][] = circular
    ? labels.map((l, i) => [l, pal[i % pal.length] ?? kit.primary, first[i] ?? 0])
    : series.map((s, i) => [s.label, col(i), null]);

  const plotW = Math.max(0, w - LEFT);
  const plotH = height - BOTTOM - TOP;
  const n = labels.length;
  const stacked = kind === 'stacked';
  const maxVal = stacked
    ? Math.max(...labels.map((_, j) => series.reduce((a, s) => a + (s.data[j] ?? 0), 0)))
    : Math.max(...series.flatMap((s) => s.data));
  const scale = niceScale(maxVal);
  const yOf = (v: number) => TOP + plotH - (v / scale.max) * plotH;
  const bars = kind === 'bar' || stacked;
  const xOf = (j: number) =>
    bars ? LEFT + ((j + 0.5) * plotW) / n : LEFT + (n <= 1 ? plotW / 2 : (j * plotW) / (n - 1));
  const labelStep = n > 8 ? Math.ceil(n / 6) : 1;

  const interactive = !circular && kind !== 'hbar' && kind !== 'radar';
  const touch = (e: GestureResponderEvent) => {
    if (!w || !interactive) return;
    const x = e.nativeEvent.locationX - LEFT;
    const j = bars ? Math.floor((x / plotW) * n) : Math.round((x / plotW) * (n - 1));
    setTip(Math.min(n - 1, Math.max(0, j)));
  };

  const axes = (
    <G>
      {Array.from({ length: Math.round(scale.max / scale.step) + 1 }, (_, k) => {
        const v = k * scale.step;
        const y = yOf(v);
        return (
          <G key={k}>
            <Line x1={LEFT} x2={w} y1={y} y2={y} stroke={kit.border} strokeWidth={1} />
            {v < scale.max ? (
              <SvgText
                x={LEFT - 6}
                y={y + 3.5}
                fontSize={10.5}
                fill={kit.textMuted}
                textAnchor="end"
                fontFamily="Inter_400Regular"
              >
                {fmtCompact(v)}
              </SvgText>
            ) : null}
          </G>
        );
      })}
      {labels.map((l, j) =>
        j % labelStep === 0 ? (
          <SvgText
            key={l + j}
            x={xOf(j)}
            y={height - 6}
            fontSize={10.5}
            fill={kit.textMuted}
            textAnchor="middle"
            fontFamily="Inter_400Regular"
          >
            {l}
          </SvgText>
        ) : null,
      )}
    </G>
  );

  let body: React.ReactNode = null;
  if (w > 0 && (kind === 'line' || kind === 'area')) {
    body = (
      <Svg width={w} height={height}>
        <Defs>
          <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={col(0)} stopOpacity={0.28} />
            <Stop offset="1" stopColor={col(0)} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {axes}
        {series.map((s, i) => {
          const pts = s.data
            .map((v, j) => [j, v] as const)
            .filter(([, v]) => v > 0 || kind === 'line')
            .map(([j, v]) => [xOf(j), yOf(v)] as [number, number]);
          const path = smooth(pts);
          const last = pts[pts.length - 1];
          const firstPt = pts[0];
          return (
            <G key={s.label}>
              {kind === 'area' && i === 0 && last && firstPt ? (
                <Path d={`${path} L${last[0]} ${yOf(0)} L${firstPt[0]} ${yOf(0)} Z`} fill="url(#area)" />
              ) : null}
              <Path
                d={path}
                stroke={col(i)}
                strokeWidth={i === 0 ? 3 : 2}
                strokeDasharray={i > 0 && kind === 'area' ? '6 4' : undefined}
                strokeLinecap="round"
                fill="none"
              />
              {i === 0 && s.data.length <= 12
                ? pts.map(([x, y], k) => (
                    <Circle key={k} cx={x} cy={y} r={3} fill={col(i)} stroke={kit.card} strokeWidth={2} />
                  ))
                : null}
            </G>
          );
        })}
        {tip !== null ? (
          <Line
            x1={xOf(tip)}
            x2={xOf(tip)}
            y1={TOP}
            y2={TOP + plotH}
            stroke={kit.textMuted}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        ) : null}
      </Svg>
    );
  } else if (w > 0 && bars) {
    const bw = Math.max(6, Math.min(18, 220 / (n * (stacked ? 1 : series.length))));
    body = (
      <Svg width={w} height={height}>
        {axes}
        {labels.map((_, j) => {
          if (stacked) {
            let acc = 0;
            const width = bw * 1.4;
            return (
              <G key={j}>
                {series.map((s, i) => {
                  const v = s.data[j] ?? 0;
                  const y0 = yOf(acc);
                  acc += v;
                  return (
                    <Path
                      key={i}
                      d={`M${xOf(j) - width / 2} ${y0} V${yOf(acc)} H${xOf(j) + width / 2} V${y0} Z`}
                      fill={col(i)}
                    />
                  );
                })}
              </G>
            );
          }
          const total = series.length * bw + (series.length - 1) * 3;
          return (
            <G key={j}>
              {series.map((s, i) => {
                const x = xOf(j) - total / 2 + i * (bw + 3);
                const y = yOf(s.data[j] ?? 0);
                const r = Math.min(5, bw / 2, yOf(0) - y);
                return (
                  <Path
                    key={i}
                    d={`M${x} ${yOf(0)} V${y + r} Q${x} ${y} ${x + r} ${y} H${x + bw - r} Q${x + bw} ${y} ${x + bw} ${y + r} V${yOf(0)} Z`}
                    fill={col(i)}
                    opacity={tip === null || tip === j ? 1 : 0.55}
                  />
                );
              })}
            </G>
          );
        })}
      </Svg>
    );
  } else if (kind === 'hbar') {
    const max = Math.max(...first, 1);
    body = (
      <View style={styles.hbars}>
        {labels.map((l, i) => (
          <HBar
            key={l}
            label={l}
            value={`${fmt(first[i] ?? 0)}${unit}`}
            ratio={(first[i] ?? 0) / max}
            color={series[0]?.color ?? pal[0] ?? kit.primary}
            opacity={0.85 - i * 0.08}
            delay={i * 80}
          />
        ))}
      </View>
    );
  } else if (w > 0 && circular) {
    const total = first.reduce((a, b) => a + b, 0) || 1;
    const size = height;
    const cx = w / 2;
    const cy = size / 2;
    const doughnut = kind === 'doughnut';
    const outer = doughnut ? size * 0.27 + size * 0.16 : size * 0.42;
    const inner = doughnut ? size * 0.27 : 0;
    const gap = 2 / outer;
    const angles = first.reduce<number[]>(
      (acc, v) => [...acc, (acc[acc.length - 1] ?? 0) + (v / total) * Math.PI * 2],
      [0],
    );
    body = (
      <Svg width={w} height={size}>
        {first.map((v, i) => {
          const a0 = angles[i] ?? 0;
          const a = angles[i + 1] ?? a0;
          const mid = (a0 + a) / 2;
          return (
            <G key={i}>
              <Path
                d={arc(cx, cy, outer, inner, a0 + gap / 2, a - gap / 2)}
                fill={pal[i % pal.length]}
                opacity={tip === null || tip === i ? 1 : 0.55}
                onPress={() => setTip(tip === i ? null : i)}
              />
              {!doughnut ? (
                <SvgText
                  x={cx + outer * 0.62 * Math.sin(mid)}
                  y={cy - outer * 0.62 * Math.cos(mid) + 4}
                  fontSize={11}
                  fill={kit.onTone}
                  textAnchor="middle"
                  fontFamily="Inter_700Bold"
                >
                  {`${Math.round((v / total) * 100)} %`}
                </SvgText>
              ) : null}
            </G>
          );
        })}
      </Svg>
    );
  } else if (w > 0 && kind === 'radar') {
    const cx = w / 2;
    const cy = height / 2;
    const r = Math.min(w, height) / 2 - 28;
    const max = niceScale(Math.max(...series.flatMap((s) => s.data))).max;
    const pt = (i: number, ratio: number) => {
      const a = (i / n) * Math.PI * 2;
      return [cx + r * ratio * Math.sin(a), cy - r * ratio * Math.cos(a)] as const;
    };
    body = (
      <Svg width={w} height={height}>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <Polygon
            key={t}
            points={labels.map((_, i) => pt(i, t).join(',')).join(' ')}
            fill="none"
            stroke={kit.border}
            strokeWidth={1}
          />
        ))}
        {labels.map((l, i) => {
          const [x, y] = pt(i, 1);
          const [tx, ty] = pt(i, 1.18);
          return (
            <G key={l}>
              <Line x1={cx} y1={cy} x2={x} y2={y} stroke={kit.border} strokeWidth={1} />
              <SvgText
                x={tx}
                y={ty + 4}
                fontSize={11}
                fill={kit.textSecondary}
                textAnchor="middle"
                fontFamily="Inter_400Regular"
              >
                {l}
              </SvgText>
            </G>
          );
        })}
        {series.map((s, si) => (
          <G key={s.label}>
            <Polygon
              points={s.data.map((v, i) => pt(i, v / max).join(',')).join(' ')}
              fill={col(si)}
              fillOpacity={0.18}
              stroke={col(si)}
              strokeWidth={2}
            />
            {s.data.map((v, i) => {
              const [x, y] = pt(i, v / max);
              return <Circle key={i} cx={x} cy={y} r={2.5} fill={col(si)} />;
            })}
          </G>
        ))}
      </Svg>
    );
  }

  const summary = circular
    ? labels.map((l, i) => `${l} ${fmt(first[i] ?? 0)}${unit}`).join(', ')
    : series.map((s) => `${s.label} : ${s.data.map((v, j) => `${labels[j]} ${fmt(v)}${unit}`).join(', ')}`).join(' ; ');
  const tipLines =
    tip === null
      ? []
      : circular
        ? [`${labels[tip]} : ${fmt(first[tip] ?? 0)}${unit}`]
        : stacked
          ? [`${labels[tip]} : ${fmt(series.reduce((a, s) => a + (s.data[tip] ?? 0), 0))}${unit}`]
          : series.map((s) => `${s.label} : ${fmt(s.data[tip] ?? 0)}${unit}`);

  return (
    <View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Graphique : ${summary}`}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        {...(interactive
          ? {
              onStartShouldSetResponder: () => true,
              onResponderGrant: touch,
              onResponderMove: touch,
              onResponderRelease: () => setTimeout(() => setTip(null), 1500),
            }
          : null)}
        style={{ height: kind === 'hbar' ? undefined : height }}
      >
        {body}
        {kind === 'doughnut' && w > 0 ? (
          <View pointerEvents="none" style={styles.center}>
            <Text
              style={[font('700', 20, 'heading'), { color: kit.textPrimary }]}
            >{`${fmt(first.reduce((a, b) => a + b, 0))}${unit}`}</Text>
            <Text style={[font('400', 11), { color: kit.textMuted }]}>Total</Text>
          </View>
        ) : null}
        {tipLines.length ? (
          <View
            pointerEvents="none"
            style={[
              styles.tip,
              { backgroundColor: roles.inverseSurface },
              circular ? styles.tipTop : { left: Math.min(Math.max(0, xOf(tip ?? 0) - 70), Math.max(0, w - 150)) },
            ]}
          >
            {tipLines.map((t) => (
              <Text key={t} style={[font('600', 11.5), { color: roles.inverseOnSurface }]}>
                {t}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
      {showLegend && (legend.length > 1 || circular) ? (
        <View style={styles.legend}>
          {legend.map(([l, c, v]) => (
            <View key={l} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: c }]} />
              <Text style={[font('400', 12), { color: kit.textSecondary }]}>
                {v === null ? l : `${l} · ${fmt(v)}${unit}`}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Ligne de barre horizontale animée (graphique `hbar`). */
function HBar({
  label,
  value,
  ratio,
  color,
  opacity,
  delay,
}: {
  label: string;
  value: string;
  ratio: number;
  color: string;
  opacity: number;
  delay: number;
}) {
  const { kit } = useKitTheme();
  const reduced = useReducedMotion();
  const [p] = useState(() => new Animated.Value(reduced ? ratio : 0));
  useEffect(() => {
    Animated.timing(p, {
      toValue: ratio,
      duration: reduced ? 0 : 500 + delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [p, ratio, delay, reduced]);
  return (
    <View style={styles.hbarRow}>
      <Text numberOfLines={1} style={[font('400', 12), styles.hbarLabel, { color: kit.textSecondary }]}>
        {label}
      </Text>
      <View style={[styles.hbarTrack, { backgroundColor: kit.fieldBg }]}>
        <Animated.View
          style={[
            styles.hbarFill,
            {
              backgroundColor: color,
              opacity,
              width: p.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
      <Text style={[font('700', 12), styles.hbarValue, { color: kit.textPrimary }]}>{value}</Text>
    </View>
  );
}

/** Mini-courbe de tendance des tuiles KPI (`Sparkline` Flutter). */
export function Sparkline({
  data,
  color,
  height = 32,
  fill = true,
}: {
  data: number[];
  color?: string;
  height?: number;
  fill?: boolean;
}) {
  const { kit } = useKitTheme();
  const [w, setW] = useState(0);
  const c = color ?? kit.primary;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = (max - min) * 0.15 + 0.001;
  const pts = data.map(
    (v, i) =>
      [(i / Math.max(1, data.length - 1)) * w, height - ((v - (min - pad)) / (max - min + 2 * pad)) * height] as [
        number,
        number,
      ],
  );
  const path = smooth(pts);
  const id = `spark-${c.slice(1)}`;
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{ height }}
      importantForAccessibility="no-hide-descendants"
    >
      {w ? (
        <Svg width={w} height={height}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={c} stopOpacity={0.25} />
              <Stop offset="1" stopColor={c} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {fill ? <Path d={`${path} L${w} ${height} L0 ${height} Z`} fill={`url(#${id})`} /> : null}
          <Path d={path} stroke={c} strokeWidth={2} fill="none" />
        </Svg>
      ) : null}
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Jauge circulaire de progression / objectif (`RingGauge` Flutter). */
export function RingGauge({
  value,
  size = 72,
  stroke = 8,
  tone = 'primary',
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: KitTone;
  label?: string;
}) {
  const { kit } = useKitTheme();
  const reduced = useReducedMotion();
  const v = Math.min(1, Math.max(0, value));
  const [p] = useState(() => new Animated.Value(reduced ? v : 0));
  useEffect(() => {
    Animated.timing(p, {
      toValue: v,
      duration: reduced ? 0 : 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [p, v, reduced]);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const text = label ?? `${Math.round(v * 100)} %`;
  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
    >
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={kit.fieldBg} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={toneColor(tone, kit)}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={p.interpolate({ inputRange: [0, 1], outputRange: [circ, 0] })}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[font('700', size * 0.2, 'heading'), { color: kit.textPrimary }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  tip: {
    position: 'absolute',
    top: 0,
    borderRadius: radius.sm,
    paddingHorizontal: space.s2,
    paddingVertical: 6,
    minWidth: 140,
  },
  tipTop: { alignSelf: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14, rowGap: 6, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: radius.xs },
  hbars: { paddingVertical: space.s1 },
  hbarRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 8 },
  hbarLabel: { width: 92 },
  hbarTrack: { flex: 1, height: 22, borderRadius: radius.xs, overflow: 'hidden' },
  hbarFill: { height: 22, borderRadius: radius.xs },
  hbarValue: { width: 56, textAlign: 'right' },
});
