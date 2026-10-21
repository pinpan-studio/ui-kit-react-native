import { useState } from 'react';
import { StyleSheet, View, type AccessibilityActionEvent, type GestureResponderEvent } from 'react-native';

import { MIN_TOUCH, useKitTheme } from '../../theme';

const THUMB = 20;
const TRACK = 4;
// Retrait latéral de Flutter : la piste commence à 24 dp du bord (rayon du halo du pouce).
const INSET = 14;

/**
 * Curseur Material 3 (`Slider` Flutter) : piste active primaire, inactive surface-container-highest,
 * pouce de 20 dp, crans optionnels. Glisser ou toucher ; réglable au lecteur d'écran (balayage haut / bas).
 */
export function KitSlider({
  value,
  min = 0,
  max = 1,
  divisions,
  onChange,
  accessibilityLabel,
  valueText,
  testID,
}: {
  value: number;
  min?: number;
  max?: number;
  /** Nombre d'intervalles : la valeur se cale sur les crans. */
  divisions?: number;
  onChange: (value: number) => void;
  accessibilityLabel?: string;
  /** Valeur lue par le lecteur d'écran (« 1,55 », « 24 px »…). */
  valueText?: string;
  testID?: string;
}) {
  const { kit, roles } = useKitTheme();
  const [width, setWidth] = useState(0);
  const span = max - min;
  const clamped = Math.min(max, Math.max(min, value));
  const ratio = span === 0 ? 0 : (clamped - min) / span;
  const usable = Math.max(0, width - 2 * INSET - THUMB);

  const snap = (v: number) => {
    const c = Math.min(max, Math.max(min, v));
    if (!divisions) return c;
    const step = span / divisions;
    return min + Math.round((c - min) / step) * step;
  };
  const fromX = (e: GestureResponderEvent) => {
    if (usable === 0) return;
    const next = snap(min + ((e.nativeEvent.locationX - INSET - THUMB / 2) / usable) * span);
    if (next !== value) onChange(next);
  };
  const step = divisions ? span / divisions : span / 20;
  const onAction = (e: AccessibilityActionEvent) => {
    const delta = e.nativeEvent.actionName === 'increment' ? step : -step;
    onChange(snap(clamped + delta));
  };

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: clamped, text: valueText }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={onAction}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={fromX}
      onResponderMove={fromX}
      style={styles.root}
    >
      <View pointerEvents="none" style={styles.fill}>
        <View style={[styles.track, { backgroundColor: roles.surfaceContainerHighest }]} />
        <View style={[styles.active, { width: THUMB / 2 + ratio * usable, backgroundColor: kit.primary }]} />
        {divisions && divisions <= 40
          ? Array.from({ length: divisions + 1 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.tick,
                  {
                    left: THUMB / 2 + (i / divisions) * usable - 1,
                    backgroundColor: i / divisions <= ratio ? kit.onPrimary : roles.onSurfaceVariant,
                  },
                ]}
              />
            ))
          : null}
        <View style={[styles.thumb, { left: ratio * usable, backgroundColor: kit.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: INSET },
  fill: { height: THUMB, justifyContent: 'center' },
  track: { position: 'absolute', left: 0, right: 0, height: TRACK, borderRadius: TRACK / 2 },
  active: { position: 'absolute', left: 0, height: TRACK, borderRadius: TRACK / 2 },
  tick: { position: 'absolute', width: 2, height: 2, borderRadius: 1 },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2 },
});

/**
 * Double curseur Material 3 (`RangeSlider` Flutter) : le pouce le plus proche du toucher suit le doigt ;
 * chaque pouce est réglable au lecteur d'écran.
 */
export function KitRangeSlider({
  start,
  end,
  min = 0,
  max = 1,
  divisions,
  onChange,
  accessibilityLabel,
  format = (v: number) => String(Math.round(v)),
}: {
  start: number;
  end: number;
  min?: number;
  max?: number;
  divisions?: number;
  onChange: (start: number, end: number) => void;
  accessibilityLabel: string;
  format?: (v: number) => string;
}) {
  const { kit, roles } = useKitTheme();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<'start' | 'end'>('start');
  const span = max - min;
  const usable = Math.max(0, width - 2 * INSET - THUMB);
  const ratio = (v: number) => (span === 0 ? 0 : (Math.min(max, Math.max(min, v)) - min) / span);
  const snap = (v: number) => {
    const c = Math.min(max, Math.max(min, v));
    if (!divisions) return c;
    const step = span / divisions;
    return min + Math.round((c - min) / step) * step;
  };
  const valueAt = (x: number) => snap(min + ((x - THUMB / 2) / Math.max(1, usable)) * span);
  const move = (which: 'start' | 'end', v: number) =>
    which === 'start' ? onChange(Math.min(v, end), end) : onChange(start, Math.max(v, start));
  const onGrant = (e: GestureResponderEvent) => {
    const v = valueAt(e.nativeEvent.locationX - INSET);
    const which = Math.abs(v - start) <= Math.abs(v - end) ? 'start' : 'end';
    setActive(which);
    move(which, v);
  };
  const onMove = (e: GestureResponderEvent) => move(active, valueAt(e.nativeEvent.locationX - INSET));
  const step = divisions ? span / divisions : span / 20;
  const thumb = (which: 'start' | 'end') => {
    const v = which === 'start' ? start : end;
    return (
      <View
        key={which}
        pointerEvents="none"
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`${accessibilityLabel}, ${which === 'start' ? 'minimum' : 'maximum'}`}
        accessibilityValue={{ min, max, now: v, text: format(v) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => move(which, snap(v + (e.nativeEvent.actionName === 'increment' ? step : -step)))}
        style={[styles.thumb, { left: ratio(v) * usable, backgroundColor: kit.primary }]}
      />
    );
  };
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      style={styles.root}
    >
      <View style={styles.fill}>
        <View pointerEvents="none" style={[styles.track, { backgroundColor: roles.surfaceContainerHighest }]} />
        <View
          pointerEvents="none"
          style={[
            styles.active,
            {
              left: THUMB / 2 + ratio(start) * usable,
              width: (ratio(end) - ratio(start)) * usable,
              backgroundColor: kit.primary,
            },
          ]}
        />
        {thumb('start')}
        {thumb('end')}
      </View>
    </View>
  );
}
