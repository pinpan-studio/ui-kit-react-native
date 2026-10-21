import { useState } from 'react';
import { StyleSheet, View, type AccessibilityActionEvent, type GestureResponderEvent } from 'react-native';

import { MIN_TOUCH, useKitTheme } from '../../theme';

const THUMB = 20;
const TRACK = 4;

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
  const usable = Math.max(0, width - THUMB);

  const snap = (v: number) => {
    const c = Math.min(max, Math.max(min, v));
    if (!divisions) return c;
    const step = span / divisions;
    return min + Math.round((c - min) / step) * step;
  };
  const fromX = (e: GestureResponderEvent) => {
    if (usable === 0) return;
    const next = snap(min + ((e.nativeEvent.locationX - THUMB / 2) / usable) * span);
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
  root: { height: MIN_TOUCH, justifyContent: 'center' },
  fill: { height: THUMB, justifyContent: 'center' },
  track: { position: 'absolute', left: 0, right: 0, height: TRACK, borderRadius: TRACK / 2 },
  active: { position: 'absolute', left: 0, height: TRACK, borderRadius: TRACK / 2 },
  tick: { position: 'absolute', width: 2, height: 2, borderRadius: 1 },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2 },
});
