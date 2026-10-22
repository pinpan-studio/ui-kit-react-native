import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions, type GestureResponderEvent } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { TreeNodeData } from '../../data/showcase';
import { KitIconButton } from '../../mobile/KitIconButton';
import { breakpoints, elevation, font, radius, space, useKitTheme } from '../../theme';
import { BLACK, COLOR_PRESETS, HUE_STOPS, ON_LIGHT, WHITE } from '../../theme/swatches';
import { KitCheckbox, type CheckState } from '../inputs/Choice';
import { KitTextField } from '../inputs/TextField';

// ── Couleurs HSV ───────────────────────────────────────────────────

export interface Hsv {
  h: number;
  s: number;
  v: number;
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return `#${[f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export function hexToHsv(hex: string): Hsv {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

/** `#RRGGBB` valide, ou `null`. */
export function parseHex(s: string): string | null {
  const h = s.replace('#', '').trim();
  return /^[0-9a-fA-F]{6}$/.test(h) ? `#${h.toLowerCase()}` : null;
}

/** Texte lisible sur une couleur (`contrastOn` Flutter). */
export function contrastOn(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? ON_LIGHT : WHITE;
}

/** `<app-color-picker>` : carré saturation / valeur, barre de teinte, hexadécimal, pastilles (`ColorPickerField`). */
export function ColorPickerField({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const { kit, colorMode } = useKitTheme();
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [hex, setHex] = useState(value.toUpperCase());
  const [w, setW] = useState(0);
  const H = 160;
  const color = hsvToHex(hsv);
  const pure = hsvToHex({ h: hsv.h, s: 1, v: 1 });
  const set = (next: Hsv, syncHex = true) => {
    setHsv(next);
    const c = hsvToHex(next);
    if (syncHex) setHex(c.toUpperCase());
    onChange(c);
  };
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const pickSv = (e: GestureResponderEvent) =>
    w && set({ ...hsv, s: clamp(e.nativeEvent.locationX / w), v: 1 - clamp(e.nativeEvent.locationY / H) });
  const pickHue = (e: GestureResponderEvent) => w && set({ ...hsv, h: clamp(e.nativeEvent.locationX / w) * 359.9 });
  const responder = (fn: (e: GestureResponderEvent) => void) => ({
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: fn,
    onResponderMove: fn,
  });
  const thumb = { borderColor: WHITE, ...elevation(2, colorMode) };
  return (
    <View style={styles.gap12} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <View
        {...responder(pickSv)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Saturation et luminosité"
        accessibilityValue={{ text: `${Math.round(hsv.s * 100)} %, ${Math.round(hsv.v * 100)} %` }}
        style={[styles.sv, { height: H, backgroundColor: pure }]}
      >
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="sat" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={WHITE} stopOpacity={1} />
              <Stop offset="1" stopColor={WHITE} stopOpacity={0} />
            </LinearGradient>
            <LinearGradient id="val" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={BLACK} stopOpacity={0} />
              <Stop offset="1" stopColor={BLACK} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#sat)" />
          <Rect width="100%" height="100%" fill="url(#val)" />
        </Svg>
        <View
          pointerEvents="none"
          style={[styles.svThumb, thumb, { left: hsv.s * w - 10, top: (1 - hsv.v) * H - 10, backgroundColor: color }]}
        />
      </View>
      <View
        {...responder(pickHue)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Teinte"
        accessibilityValue={{ min: 0, max: 360, now: Math.round(hsv.h) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) =>
          set({ ...hsv, h: (hsv.h + (e.nativeEvent.actionName === 'increment' ? 10 : 350)) % 360 })
        }
        style={styles.hue}
      >
        <Svg pointerEvents="none" style={styles.hueBar}>
          <Defs>
            <LinearGradient id="hue" x1="0" y1="0" x2="1" y2="0">
              {HUE_STOPS.map((c, i) => (
                <Stop key={i} offset={i / (HUE_STOPS.length - 1)} stopColor={c} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx={7} fill="url(#hue)" />
        </Svg>
        <View
          pointerEvents="none"
          style={[styles.hueThumb, thumb, { left: (hsv.h / 360) * w - 11, backgroundColor: pure }]}
        />
      </View>
      <View style={styles.hexRow}>
        <View style={[styles.swatch, { backgroundColor: color, borderColor: kit.border }]}>
          <Text style={[font('700', 14), { color: contrastOn(color) }]}>Aa</Text>
        </View>
        <View style={styles.fill}>
          <KitTextField
            icon="mi:tag"
            value={hex}
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel="Couleur hexadécimale"
            onChangeText={(t) => {
              setHex(t);
              const p = parseHex(t);
              if (p) set(hexToHsv(p), false);
            }}
          />
        </View>
      </View>
      <View style={styles.presets}>
        {COLOR_PRESETS.map((p) => {
          const on = p === color;
          return (
            <TouchableRipple
              key={p}
              onPress={() => {
                set(hexToHsv(p));
              }}
              borderless
              hitSlop={7}
              accessibilityRole="button"
              accessibilityLabel={`Couleur ${p.toUpperCase()}`}
              accessibilityState={{ selected: on }}
              style={[styles.preset, { backgroundColor: p, borderColor: on ? kit.textPrimary : 'transparent' }]}
            >
              {on ? <Icon source="mi:check" size={16} color={contrastOn(p)} /> : <View />}
            </TouchableRipple>
          );
        })}
      </View>
    </View>
  );
}

// ── Arborescence ───────────────────────────────────────────────────

const leaves = (n: TreeNodeData): TreeNodeData[] => (n.children?.length ? n.children.flatMap(leaves) : [n]);

/** `<app-tree-select>` : cases en cascade, état indéterminé, dépliage, filtre (`TreeSelect` Flutter). */
export function TreeSelect({
  nodes,
  selected,
  onChange,
  searchable = true,
}: {
  nodes: TreeNodeData[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  searchable?: boolean;
}) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState(() => new Set(nodes.map((n) => n.id)));
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const state = (n: TreeNodeData): CheckState => {
    if (!n.children?.length) return selected.has(n.id);
    const ids = leaves(n).map((l) => l.id);
    const count = ids.filter((id) => selected.has(id)).length;
    return count === 0 ? false : count === ids.length ? true : null;
  };
  const toggle = (n: TreeNodeData) => {
    const next = new Set(selected);
    const ids = leaves(n).map((l) => l.id);
    if (state(n) === true) ids.forEach((id) => next.delete(id));
    else ids.forEach((id) => next.add(id));
    onChange(next);
  };
  const matches = (n: TreeNodeData): boolean =>
    !query || n.label.toLowerCase().includes(query) || (n.children ?? []).some(matches);
  const labels = nodes
    .flatMap(leaves)
    .filter((l) => selected.has(l.id))
    .map((l) => l.label);

  const render = (n: TreeNodeData, depth: number): React.ReactNode[] => {
    const leaf = !n.children?.length;
    const expanded = open.has(n.id) || !!query;
    const s = state(n);
    return [
      <TouchableRipple
        key={n.id}
        onPress={() =>
          leaf
            ? toggle(n)
            : setOpen((o) => {
                const next = new Set(o);
                if (expanded) next.delete(n.id);
                else next.add(n.id);
                return next;
              })
        }
        accessibilityRole={leaf ? 'checkbox' : 'button'}
        accessibilityState={leaf ? { checked: s === true } : { expanded }}
        accessibilityLabel={leaf ? n.label : `${n.label}, ${leaves(n).length} zones`}
        style={[styles.treeRow, { paddingLeft: space.s1 + depth * 22 }]}
      >
        <View style={styles.rowCenter}>
          <View style={styles.chevron}>
            {leaf ? null : (
              <Icon source={expanded ? 'mi:expand-more' : 'mi:chevron-right'} size={20} color={kit.textSecondary} />
            )}
          </View>
          <KitCheckbox value={s} onChange={() => toggle(n)} accessibilityLabel={`Sélectionner ${n.label}`} />
          {n.icon ? <Icon source={n.icon} size={18} color={kit.textSecondary} /> : null}
          <Text style={[leaf ? styles.leaf : styles.branch, styles.fill, { color: kit.textPrimary }]}>{n.label}</Text>
          {leaf ? null : <Text style={[styles.meta, { color: kit.textMuted }]}>{leaves(n).length}</Text>}
        </View>
      </TouchableRipple>,
      ...(expanded && !leaf ? (n.children ?? []).filter(matches).flatMap((c) => render(c, depth + 1)) : []),
    ];
  };

  return (
    <View style={styles.gap8}>
      {searchable ? <KitTextField hint="Filtrer…" icon="mi:search" value={q} onChangeText={setQ} /> : null}
      <View style={[styles.tree, { borderColor: kit.border }]}>
        {nodes.filter(matches).flatMap((n) => render(n, 0))}
      </View>
      <Text style={[styles.meta, { color: kit.textMuted }]}>
        {labels.length === 0
          ? 'Aucune zone sélectionnée'
          : `${labels.length} sélectionnée(s) : ${labels.slice(0, 4).join(', ')}${labels.length > 4 ? '…' : ''}`}
      </Text>
    </View>
  );
}

// ── Liste de transfert ─────────────────────────────────────────────

/**
 * `<app-transfer-list>` (`TransferList` Flutter) : deux listes, sélection, déplacement, recherche.
 * Sur téléphone, les listes s'empilent avec les commandes de transfert entre elles.
 */
export function TransferList({
  available,
  chosen,
  onChange,
  leftTitle = 'Disponibles',
  rightTitle = 'Sélectionnés',
}: {
  available: string[];
  chosen: string[];
  onChange: (available: string[], chosen: string[]) => void;
  leftTitle?: string;
  rightTitle?: string;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.tablet;
  const [selL, setSelL] = useState<string[]>([]);
  const [selR, setSelR] = useState<string[]>([]);
  const move = (toRight: boolean, all = false) => {
    const from = toRight ? available : chosen;
    const sel = toRight ? selL : selR;
    const moving = all ? from : from.filter((x) => sel.includes(x));
    if (!moving.length) return;
    const a = toRight ? available.filter((x) => !moving.includes(x)) : [...available, ...moving];
    const b = toRight ? [...chosen, ...moving] : chosen.filter((x) => !moving.includes(x));
    if (toRight) setSelL([]);
    else setSelR([]);
    onChange(a, b);
  };
  const buttons = (
    <View style={[styles.transferBtns, wide && styles.column]}>
      <KitIconButton
        mode="outlined"
        icon={wide ? 'mi:keyboard-double-arrow-right' : 'mi:keyboard-double-arrow-down'}
        accessibilityLabel="Tout ajouter"
        onPress={() => move(true, true)}
      />
      <KitIconButton
        mode="contained-tonal"
        icon={wide ? 'mi:chevron-right' : 'mi:expand-more'}
        accessibilityLabel="Ajouter la sélection"
        disabled={!selL.length}
        onPress={() => move(true)}
      />
      <KitIconButton
        mode="contained-tonal"
        icon={wide ? 'mi:chevron-left' : 'mi:expand-less'}
        accessibilityLabel="Retirer la sélection"
        disabled={!selR.length}
        onPress={() => move(false)}
      />
      <KitIconButton
        mode="outlined"
        icon={wide ? 'mi:keyboard-double-arrow-left' : 'mi:keyboard-double-arrow-up'}
        accessibilityLabel="Tout retirer"
        onPress={() => move(false, true)}
      />
    </View>
  );
  const left = <TransferPanel title={leftTitle} items={available} sel={selL} onSel={setSelL} />;
  const right = <TransferPanel title={rightTitle} items={chosen} sel={selR} onSel={setSelR} />;
  return wide ? (
    <View style={styles.rowStretch}>
      <View style={styles.fill}>{left}</View>
      {buttons}
      <View style={styles.fill}>{right}</View>
    </View>
  ) : (
    <View>
      {left}
      {buttons}
      {right}
    </View>
  );
}

function TransferPanel({
  title,
  items,
  sel,
  onSel,
}: {
  title: string;
  items: string[];
  sel: string[];
  onSel: (s: string[]) => void;
}) {
  const { kit } = useKitTheme();
  const [q, setQ] = useState('');
  const shown = items.filter((e) => !q || e.toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={[styles.panel, { backgroundColor: kit.card, borderColor: kit.border }]}>
      <View style={styles.panelHead}>
        <Text accessibilityRole="header" style={[font('700', 14), styles.fill, { color: kit.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.meta, { color: kit.textMuted }]}>{`${sel.length}/${items.length}`}</Text>
      </View>
      <View style={styles.panelSearch}>
        <KitTextField
          hint="Rechercher…"
          icon="mi:search"
          value={q}
          onChangeText={setQ}
          accessibilityLabel={`Rechercher dans ${title}`}
        />
      </View>
      <ScrollView nestedScrollEnabled style={styles.panelList}>
        {shown.length === 0 ? (
          <Text style={[styles.empty, { color: kit.textMuted }]}>Aucun élément</Text>
        ) : (
          shown.map((e) => {
            const on = sel.includes(e);
            const toggle = () => onSel(on ? sel.filter((x) => x !== e) : [...sel, e]);
            return (
              <TouchableRipple
                key={e}
                onPress={toggle}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={e}
                style={styles.panelRow}
              >
                <View style={styles.rowCenter}>
                  <KitCheckbox value={on} onChange={toggle} />
                  <Text style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>{e}</Text>
                </View>
              </TouchableRipple>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gap8: { gap: space.s2 },
  gap12: { gap: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowStretch: { flexDirection: 'row', alignItems: 'stretch' },
  column: { flexDirection: 'column', paddingHorizontal: space.s2, paddingVertical: 0 },
  sv: { borderRadius: radius.md, overflow: 'hidden' },
  svThumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderWidth: 3 },
  hue: { height: 22, justifyContent: 'center' },
  hueBar: { height: 14 },
  hueThumb: { position: 'absolute', top: 0, width: 22, height: 22, borderRadius: 11, borderWidth: 3 },
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { width: 46, height: 46, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  preset: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tree: { borderWidth: 1, borderRadius: radius.md, paddingVertical: space.s1 },
  treeRow: { paddingRight: space.s2, minHeight: 44, justifyContent: 'center' },
  chevron: { width: 32, alignItems: 'center' },
  leaf: font('400', 13.5),
  branch: font('600', 13.5),
  meta: font('400', 12),
  transferBtns: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: space.s2,
  },
  panel: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  panelHead: { flexDirection: 'row', alignItems: 'center', padding: space.s3, paddingBottom: space.s2 },
  panelSearch: { paddingHorizontal: space.s2 },
  panelList: { height: 180 },
  panelRow: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.s1 },
  empty: { ...font('400', 12.5), textAlign: 'center', marginTop: 70 },
});
