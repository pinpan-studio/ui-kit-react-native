import { useState } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';
import Svg, { Circle, Path } from 'react-native-svg';

import { fold } from '../../core/format';
import { DEMO_PLACES, PLACE_ICON, type PlaceOption } from '../../data/showcase';
import { KitIconButton } from '../../mobile/KitIconButton';
import { font, radius, space, useKitTheme, withAlpha } from '../../theme';
import { INK_BLUE } from '../../theme/swatches';
import { KitSlider } from '../inputs/Slider';
import { KitTextField } from '../inputs/TextField';

interface Stroke {
  color: string;
  width: number;
  points: [number, number][];
}

/** Chemin lissé par points milieux (courbes quadratiques), comme `_SignaturePainter` Flutter. */
function smoothPath(points: [number, number][]): string {
  const [first, ...rest] = points;
  if (!first) return '';
  let d = `M${first[0]} ${first[1]}`;
  for (let i = 0; i < rest.length - 1; i++) {
    const [x, y] = rest[i] as [number, number];
    const [nx, ny] = rest[i + 1] as [number, number];
    d += ` Q${x} ${y} ${(x + nx) / 2} ${(y + ny) / 2}`;
  }
  const last = rest[rest.length - 1];
  if (last) d += ` L${last[0]} ${last[1]}`;
  return d;
}

/** `<app-signature-pad>` : tracé lissé au doigt, encre, épaisseur, annuler, effacer (`SignaturePad` Flutter). */
export function SignaturePad({ height = 180, onChange }: { height?: number; onChange?: (signed: boolean) => void }) {
  const { kit } = useKitTheme();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [ink, setInk] = useState<string | null>(null);
  const [width, setWidth] = useState(2.6);
  const color = ink ?? kit.textPrimary;
  const inks = [kit.textPrimary, INK_BLUE, kit.primary];
  const at = (e: GestureResponderEvent): [number, number] => [e.nativeEvent.locationX, e.nativeEvent.locationY];
  const update = (next: Stroke[]) => {
    setStrokes(next);
    onChange?.(next.length > 0);
  };
  return (
    <View style={styles.gap8}>
      <View
        accessible
        accessibilityLabel={strokes.length ? 'Zone de signature, signée' : 'Zone de signature, vide'}
        accessibilityHint="Tracez votre signature avec le doigt"
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => update([...strokes, { color, width, points: [at(e)] }])}
        onResponderMove={(e) => {
          const p = at(e);
          setStrokes((s) => s.map((st, i) => (i === s.length - 1 ? { ...st, points: [...st.points, p] } : st)));
        }}
        style={[styles.pad, { height, backgroundColor: kit.card, borderColor: kit.border }]}
      >
        <View pointerEvents="none" style={styles.baseline}>
          <Text style={[font('400', 16), { color: kit.textMuted }]}>✕</Text>
          <View style={[styles.line, { backgroundColor: withAlpha(kit.textMuted, 0.5) }]} />
        </View>
        {strokes.length === 0 ? (
          <View pointerEvents="none" style={styles.placeholder}>
            <Text style={[font('400', 14), styles.italic, { color: kit.textMuted }]}>Signez ici avec le doigt</Text>
          </View>
        ) : null}
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
          {strokes.map((s, i) => {
            const only = s.points.length === 1 ? s.points[0] : undefined;
            return only ? (
              <Circle key={i} cx={only[0]} cy={only[1]} r={s.width / 2} fill={s.color} />
            ) : (
              <Path
                key={i}
                d={smoothPath(s.points)}
                stroke={s.color}
                strokeWidth={s.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            );
          })}
        </Svg>
      </View>
      <View style={styles.tools}>
        {inks.map((c, i) => (
          <TouchableRipple
            key={i}
            onPress={() => setInk(c)}
            borderless
            hitSlop={12}
            accessibilityRole="radio"
            accessibilityLabel={['Encre noire', 'Encre bleue', 'Encre primaire'][i]}
            accessibilityState={{ checked: color === c }}
            style={[
              styles.ink,
              {
                backgroundColor: c,
                borderColor: color === c ? kit.primary : kit.border,
                borderWidth: color === c ? 2.5 : 1,
              },
            ]}
          >
            <View />
          </TouchableRipple>
        ))}
        <View style={styles.fill}>
          <KitSlider
            value={width}
            min={1.5}
            max={6}
            onChange={setWidth}
            accessibilityLabel="Épaisseur du trait"
            valueText={`${width.toFixed(1)} px`}
          />
        </View>
        <KitIconButton
          icon="mi:undo"
          accessibilityLabel="Annuler"
          disabled={!strokes.length}
          onPress={() => update(strokes.slice(0, -1))}
        />
        <KitIconButton
          icon="mi:delete-outline"
          accessibilityLabel="Effacer"
          disabled={!strokes.length}
          onPress={() => update([])}
        />
      </View>
    </View>
  );
}

/**
 * `<app-address-field>` : recherche locale insensible aux accents (16 adresses ivoiriennes, sans géocodeur).
 * La carte interactive (`KitMap`) sera branchée avec la galerie Cartes ; d'ici là, un aperçu schématique.
 */
export function AddressField({
  initial,
  onChange,
  mapHeight = 200,
}: {
  initial?: PlaceOption;
  onChange?: (p: PlaceOption) => void;
  mapHeight?: number;
}) {
  const { kit, roles } = useKitTheme();
  const [place, setPlace] = useState<PlaceOption | undefined>(initial);
  const [q, setQ] = useState('');
  const query = fold(q.trim());
  const results =
    query.length < 2 ? [] : DEMO_PLACES.filter((o) => fold(`${o.label} ${o.detail}`).includes(query)).slice(0, 6);
  const select = (p: PlaceOption) => {
    setPlace(p);
    setQ('');
    onChange?.(p);
  };
  return (
    <View style={styles.gap8}>
      <KitTextField
        hint="Rechercher une adresse (ex : Marcory)…"
        icon="mi:search"
        value={q}
        onChangeText={setQ}
        autoCorrect={false}
        accessibilityLabel="Rechercher une adresse"
      />
      {results.length ? (
        <View style={[styles.results, { backgroundColor: roles.surfaceContainer }]}>
          {results.map((o) => (
            <TouchableRipple
              key={o.id}
              onPress={() => select(o)}
              accessibilityRole="button"
              accessibilityLabel={`${o.label}, ${o.detail}`}
              style={styles.result}
            >
              <View style={styles.row}>
                <Icon source={PLACE_ICON[o.kind]} size={24} color={kit.primary} />
                <View style={styles.fill}>
                  <Text style={[font('500', 14), { color: kit.textPrimary }]}>{o.label}</Text>
                  <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{o.detail}</Text>
                </View>
              </View>
            </TouchableRipple>
          ))}
        </View>
      ) : null}
      <View
        accessible
        accessibilityLabel={place ? `Carte centrée sur ${place.label}` : 'Carte'}
        style={[styles.map, { height: mapHeight, backgroundColor: kit.fieldBg, borderColor: kit.border }]}
      >
        <View style={[styles.road, { backgroundColor: kit.card }]} />
        <View style={[styles.road, styles.roadV, { backgroundColor: kit.card }]} />
        {place ? <Icon source="mi:place" size={36} color={kit.primary} /> : null}
      </View>
      {place ? (
        <View style={styles.row}>
          <Icon source={PLACE_ICON[place.kind]} size={18} color={kit.primary} />
          <Text
            style={[font('600', 12.5), styles.fill, { color: kit.textPrimary }]}
          >{`${place.label} — ${place.detail}`}</Text>
          <Text style={[font('400', 10.5, 'mono'), { color: kit.textMuted }]}>
            {`${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}`}
          </Text>
        </View>
      ) : (
        <Text style={[font('400', 12), { color: kit.textMuted }]}>Recherchez une adresse.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gap8: { gap: space.s2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  italic: { fontStyle: 'italic' },
  pad: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  baseline: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  line: { flex: 1, height: 1 },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tools: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  ink: { width: 24, height: 24, borderRadius: 12 },
  results: { borderRadius: radius.md, overflow: 'hidden' },
  result: { minHeight: 52, paddingHorizontal: space.s4, justifyContent: 'center' },
  map: { borderRadius: radius.md, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  road: { position: 'absolute', width: '140%', height: 14, transform: [{ rotate: '-14deg' }] },
  roadV: { width: 12, height: '160%', transform: [{ rotate: '22deg' }] },
});
