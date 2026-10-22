import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Icon, Menu, TouchableRipple } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';

import { ago } from '../../core/format';
import { NOTIFICATIONS, type DemoNotification } from '../../data/showcase';
import { hapticToggle } from '../../mobile/haptics';
import { elevation, font, radius, space, toneColor, toneLight, useKitTheme } from '../../theme';
import { BLACK, WHITE } from '../../theme/swatches';
import { CountDot } from '../core/Badges';
import { KitButton } from '../core/Button';
import { EmptyState } from '../core/States';
import { KitChip } from '../core/Toggles';
import { SwipeRow } from '../data/Display';
import { KitTextField } from '../inputs/TextField';
import { KitBottomSheet } from '../overlays/Overlays';

type ViewRef = ComponentRef<typeof View>;

// ── Palette de commandes ───────────────────────────────────────────

export interface PaletteCommand {
  label: string;
  icon: string;
  group: string;
  hint?: string;
  shortcut?: string;
  keywords?: string;
}

/** Correspondance « floue » : la requête en sous-chaîne, sinon toutes ses lettres dans l'ordre. */
export function fuzzyScore(q: string, text: string): number | null {
  if (!q) return 0;
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  if (idx >= 0) return idx;
  let pos = 0;
  for (const ch of q) {
    pos = t.indexOf(ch, pos);
    if (pos < 0) return null;
    pos++;
  }
  return 100 + pos;
}

/** Touche de clavier dessinée (raccourcis). */
export function KeyCap({ label }: { label: string }) {
  const { kit } = useKitTheme();
  return (
    <View
      style={[
        styles.keycap,
        { backgroundColor: kit.card, borderColor: kit.border, boxShadow: `0 2px 0 ${kit.border}` },
      ]}
    >
      <Text style={[font('700', 12, 'mono'), { color: kit.textSecondary }]}>{label}</Text>
    </View>
  );
}

/**
 * Palette de commandes (`showCommandPalette` Flutter) : feuille quasi plein écran, recherche floue,
 * groupes, raccourcis affichés ; « Entrée » exécute la meilleure correspondance.
 */
export function CommandPalette({
  visible,
  onDismiss,
  commands,
  onRun,
}: {
  visible: boolean;
  onDismiss: () => void;
  commands: PaletteCommand[];
  onRun: (cmd: PaletteCommand) => void;
}) {
  const { kit } = useKitTheme();
  const { height } = useWindowDimensions();
  const [q, setQ] = useState('');
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setQ('');
  }
  const query = q.trim().toLowerCase();
  const scored = commands
    .map((c) => [c, fuzzyScore(query, `${c.label} ${c.keywords ?? ''} ${c.group}`)] as const)
    .filter((x): x is readonly [PaletteCommand, number] => x[1] !== null);
  if (query) scored.sort((a, b) => a[1] - b[1]);
  const groups: [string, PaletteCommand[]][] = [];
  for (const [c] of scored) {
    const g = groups.find(([k]) => k === c.group);
    if (g) g[1].push(c);
    else groups.push([c.group, [c]]);
  }
  const run = (c: PaletteCommand) => {
    onDismiss();
    onRun(c);
  };
  return (
    <KitBottomSheet visible={visible} onDismiss={onDismiss} handle={false} maxHeightRatio={0.85}>
      <View style={{ height: height * 0.85 }}>
        <View style={styles.paletteHead}>
          <View style={styles.fill}>
            <KitTextField
              autoFocus
              hint="Page, action, client…"
              icon="mi:search"
              value={q}
              onChangeText={setQ}
              returnKeyType="go"
              onSubmitEditing={() => scored[0] && run(scored[0][0])}
              accessibilityLabel="Rechercher une commande"
              suffix={<Text style={[styles.kbd, { borderColor: kit.border, color: kit.textMuted }]}>⌘K</Text>}
            />
          </View>
          <KitButton label="Annuler" variant="ghost" onPress={onDismiss} />
        </View>
        {scored.length === 0 ? (
          <EmptyState compact icon="mi:search-off" title="Aucune commande" subtitle={`Aucun résultat pour « ${q} ».`} />
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.paletteList}>
            {groups.map(([g, cmds]) => (
              <View key={g}>
                <Text accessibilityRole="header" style={[styles.groupLabel, { color: kit.textMuted }]}>
                  {g.toUpperCase()}
                </Text>
                {cmds.map((c) => (
                  <TouchableRipple key={c.label} onPress={() => run(c)} accessibilityRole="button" style={styles.cmd}>
                    <View style={styles.rowGap12}>
                      <View style={[styles.cmdIcon, { backgroundColor: kit.hover }]}>
                        <Icon source={c.icon} size={18} color={kit.textSecondary} />
                      </View>
                      <View style={styles.fill}>
                        <Text style={[font('500', 14), { color: kit.textPrimary }]}>{c.label}</Text>
                        {c.hint ? (
                          <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{c.hint}</Text>
                        ) : null}
                      </View>
                      {c.shortcut ? (
                        <Text style={[font('400', 11, 'mono'), { color: kit.textMuted }]}>{c.shortcut}</Text>
                      ) : null}
                    </View>
                  </TouchableRipple>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </KitBottomSheet>
  );
}

// ── Popover ────────────────────────────────────────────────────────

/** Popover riche ancré : au-dessus ou au-dessous selon la place ; toucher ailleurs le ferme (`Popover`). */
export function Popover({
  children,
  content,
  width = 280,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  content: (close: () => void) => ReactNode;
  width?: number;
  accessibilityLabel?: string;
  /** Style de l'ancre (calée à gauche, à sa taille, par défaut). */
  style?: StyleProp<ViewStyle>;
}) {
  const { kit, roles, colorMode } = useKitTheme();
  const { height, width: screenW } = useWindowDimensions();
  const anchor = useRef<ViewRef>(null);
  const [pos, setPos] = useState<{ x: number; y: number; h: number } | null>(null);
  const above = !!pos && pos.y > height * 0.55;
  const close = () => setPos(null);
  return (
    <View ref={anchor} collapsable={false} style={[styles.selfStart, style]}>
      <TouchableRipple
        borderless
        onPress={() => anchor.current?.measureInWindow((x, y, _w, h) => setPos({ x, y, h }))}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: !!pos }}
      >
        <View>{children}</View>
      </TouchableRipple>
      <Modal visible={!!pos} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
        />
        {pos ? (
          <View
            accessibilityViewIsModal
            style={[
              styles.popover,
              elevation(4, colorMode),
              {
                width,
                left: Math.min(pos.x, screenW - width - space.s4),
                backgroundColor: roles.surfaceContainer,
                borderColor: kit.border,
              },
              above ? { bottom: height - pos.y + 8 } : { top: pos.y + pos.h + 8 },
            ]}
          >
            {content(close)}
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

// ── Visite guidée ──────────────────────────────────────────────────

export interface TourStep {
  target: { current: ViewRef | null };
  title: string;
  text: string;
  icon?: string;
}

/**
 * Visite guidée (`startTour` Flutter) : voile sombre percé autour de la cible, bulle au-dessus ou
 * au-dessous, Passer / Précédent / Suivant, progression.
 */
export function Tour({ steps, visible, onClose }: { steps: TourStep[]; visible: boolean; onClose: () => void }) {
  const { kit, roles, colorMode } = useKitTheme();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setIndex(0);
  }
  const step = steps[index];
  useEffect(() => {
    if (!visible) return;
    steps[index]?.target.current?.measureInWindow((x, y, w, h) =>
      setRect({ x: x - 8, y: y - 8, w: w + 16, h: h + 16 }),
    );
  }, [visible, index, steps]);
  if (!step) return null;
  const r = rect ?? { x: 0, y: 0, w: 0, h: 0 };
  const below = r.y + r.h / 2 < height / 2;
  const R = radius.lg;
  const hole = `M${r.x + R} ${r.y} H${r.x + r.w - R} Q${r.x + r.w} ${r.y} ${r.x + r.w} ${r.y + R} V${r.y + r.h - R} Q${r.x + r.w} ${r.y + r.h} ${r.x + r.w - R} ${r.y + r.h} H${r.x + R} Q${r.x} ${r.y + r.h} ${r.x} ${r.y + r.h - R} V${r.y + R} Q${r.x} ${r.y} ${r.x + R} ${r.y} Z`;
  const last = index === steps.length - 1;
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.fill} accessibilityViewIsModal>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Path d={`M0 0 H${width} V${height} H0 Z ${hole}`} fill={BLACK} fillOpacity={0.62} fillRule="evenodd" />
          <Path d={hole} stroke={WHITE} strokeWidth={2} fill="none" />
        </Svg>
        <View
          style={[
            styles.bubble,
            elevation(5, colorMode),
            { backgroundColor: roles.surfaceContainerLow },
            below ? { top: r.y + r.h + 14 } : { bottom: height - r.y + 14 },
          ]}
        >
          <View style={styles.rowGap10}>
            <View style={[styles.bubbleIcon, { backgroundColor: kit.primaryLight }]}>
              <Icon source={step.icon ?? 'mi:lightbulb-outline'} size={18} color={kit.primary} />
            </View>
            <Text
              accessibilityRole="header"
              style={[font('700', 16, 'heading'), styles.fill, { color: kit.textPrimary }]}
            >
              {step.title}
            </Text>
            <Text style={[font('400', 12), { color: kit.textMuted }]}>{`${index + 1}/${steps.length}`}</Text>
          </View>
          <Text style={[font('400', 13.5), styles.mt8, { lineHeight: 20, color: kit.textSecondary }]}>{step.text}</Text>
          <View style={styles.bubbleActions}>
            <KitButton label="Passer" variant="ghost" onPress={onClose} />
            {index > 0 ? <KitButton label="Précédent" variant="ghost" onPress={() => setIndex(index - 1)} /> : null}
            <KitButton label={last ? 'Terminer' : 'Suivant'} onPress={() => (last ? onClose() : setIndex(index + 1))} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Centre de notifications ────────────────────────────────────────

/** Centre de notifications : catégories, non lues, « Tout lu », balayer pour supprimer, toucher pour lire. */
export function NotificationCenter({
  onUnreadChange,
  now: nowProp,
}: {
  onUnreadChange?: (n: number) => void;
  now?: Date;
}) {
  const { kit } = useKitTheme();
  const [items, setItems] = useState<[DemoNotification, boolean][]>(() => NOTIFICATIONS.map((n) => [n, !!n.read]));
  const [cat, setCat] = useState('Toutes');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [now] = useState(() => nowProp ?? new Date());
  const update = (next: [DemoNotification, boolean][]) => {
    setItems(next);
    onUnreadChange?.(next.filter(([, r]) => !r).length);
  };
  const cats = ['Toutes', ...new Set(NOTIFICATIONS.map((n) => n.category))];
  const list = items.filter(([n, r]) => (cat === 'Toutes' || n.category === cat) && (!unreadOnly || !r));
  const unread = items.filter(([, r]) => !r).length;
  return (
    <View>
      <View style={styles.rowCenter}>
        <Text accessibilityRole="header" style={[font('700', 17, 'heading'), { color: kit.textPrimary }]}>
          Notifications
        </Text>
        {unread ? (
          <View style={styles.ml8}>
            <CountDot count={unread} />
          </View>
        ) : null}
        <View style={styles.fill} />
        <KitButton
          label="Tout lu"
          variant="ghost"
          size="compact"
          onPress={unread ? () => update(items.map(([n]) => [n, true])) : undefined}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <KitChip label="Non lues" selected={unreadOnly} onPress={() => setUnreadOnly(!unreadOnly)} />
        {cats.map((c) => (
          <KitChip key={c} label={c} selected={cat === c} onPress={() => setCat(c)} />
        ))}
      </ScrollView>
      {list.length === 0 ? (
        <EmptyState compact icon="mi:notifications-off" title="Rien de neuf" subtitle="Vous êtes à jour." />
      ) : null}
      {list.map(([n, read]) => (
        <SwipeRow key={n.title} allow={['delete']} onDismiss={() => update(items.filter(([x]) => x !== n))}>
          <TouchableRipple
            onPress={() => update(items.map(([x, r]) => [x, x === n ? true : r]))}
            accessibilityRole="button"
            accessibilityLabel={`${read ? '' : 'Non lue, '}${n.title}. ${n.text}`}
            style={[styles.notif, { borderBottomColor: kit.border }]}
          >
            <View style={styles.rowTop12}>
              <View style={[styles.notifDisc, { backgroundColor: toneLight(n.tone, kit) }]}>
                <Icon source={n.icon} size={19} color={toneColor(n.tone, kit)} />
              </View>
              <View style={styles.fill}>
                <Text style={[font(read ? '500' : '700', 14), { color: kit.textPrimary }]}>{n.title}</Text>
                <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{n.text}</Text>
                <Text style={[font('400', 11), styles.mt2, { color: kit.textMuted }]}>
                  {`${ago(new Date(now.getTime() - n.minutesAgo * 60000), now)} · ${n.category}`}
                </Text>
              </View>
              {read ? null : <View style={[styles.unreadDot, { backgroundColor: kit.primary }]} />}
            </View>
          </TouchableRipple>
        </SwipeRow>
      ))}
    </View>
  );
}

// ── Menu contextuel ────────────────────────────────────────────────

export type MenuEntry<T> = { value: T; label: string; icon: string; danger?: boolean } | 'divider';

/** Menu contextuel à l'appui long, positionné sous le doigt, avec retour haptique (`LongPressMenu`). */
export function LongPressMenu<T>({
  children,
  items,
  onSelect,
  accessibilityLabel,
}: {
  children: ReactNode;
  items: MenuEntry<T>[];
  onSelect: (value: T) => void;
  accessibilityLabel?: string;
}) {
  const { kit, roles } = useKitTheme();
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  return (
    <>
      <TouchableRipple
        onLongPress={(e) => {
          hapticToggle();
          setAt({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
        }}
        onPress={() => undefined}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Appui long pour le menu"
        accessibilityActions={items
          .filter((x): x is Exclude<MenuEntry<T>, 'divider'> => x !== 'divider')
          .map((x, i) => ({ name: `a${i}`, label: x.label }))}
        onAccessibilityAction={(e) => {
          const real = items.filter((x): x is Exclude<MenuEntry<T>, 'divider'> => x !== 'divider');
          const it = real[Number(e.nativeEvent.actionName.slice(1))];
          if (it) onSelect(it.value);
        }}
      >
        <View>{children}</View>
      </TouchableRipple>
      <Menu
        visible={!!at}
        onDismiss={() => setAt(null)}
        anchor={at ?? { x: 0, y: 0 }}
        contentStyle={{ backgroundColor: roles.surfaceContainer }}
      >
        {items.map((it, i) =>
          it === 'divider' ? (
            <View key={`d${i}`} style={[styles.menuDivider, { backgroundColor: kit.border }]} />
          ) : (
            <Menu.Item
              key={it.label}
              title={it.label}
              titleStyle={it.danger ? { color: kit.error } : undefined}
              leadingIcon={({ size }) => (
                <Icon source={it.icon} size={size} color={it.danger ? kit.error : kit.textSecondary} />
              )}
              onPress={() => {
                setAt(null);
                onSelect(it.value);
              }}
            />
          ),
        )}
      </Menu>
    </>
  );
}

// ── Zone de gestes ─────────────────────────────────────────────────

/**
 * Zone de démonstration des gestes : toucher, double-toucher, appui long, balayage (4 sens), pincement.
 * Renvoie un libellé et l'échelle du pincement.
 */
export function GestureArea({
  onGesture,
  children,
  style,
}: {
  onGesture: (label: string, scale: number) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const start = useRef({ x: 0, y: 0, t: 0, dist: 0 });
  const lastTap = useRef(0);
  const long = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pinching = useRef(false);
  const longFired = useRef(false);
  const dist = (e: GestureResponderEvent) => {
    const [a, b] = e.nativeEvent.touches;
    return a && b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : 0;
  };
  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel="Zone de gestes"
      accessibilityActions={[{ name: 'activate' }, { name: 'longpress' }]}
      onAccessibilityAction={(e) => onGesture(e.nativeEvent.actionName === 'longpress' ? 'Appui long' : 'Toucher', 1)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => {
        start.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, t: Date.now(), dist: dist(e) };
        pinching.current = false;
        longFired.current = false;
        long.current = setTimeout(() => {
          longFired.current = true;
          hapticToggle();
          onGesture('Appui long', 1);
        }, 500);
      }}
      onResponderMove={(e) => {
        const d = dist(e);
        if (e.nativeEvent.touches.length > 1) {
          clearTimeout(long.current);
          if (!start.current.dist) start.current.dist = d;
          pinching.current = true;
          const s = Math.min(2.5, Math.max(0.5, d / (start.current.dist || d)));
          onGesture(`Pincement ×${s.toFixed(1).replace('.', ',')}`, s);
        } else if (Math.hypot(e.nativeEvent.pageX - start.current.x, e.nativeEvent.pageY - start.current.y) > 10) {
          clearTimeout(long.current);
        }
      }}
      onResponderRelease={(e) => {
        clearTimeout(long.current);
        if (pinching.current) return onGesture('Pincement', 1);
        if (longFired.current) return;
        const dx = e.nativeEvent.pageX - start.current.x;
        const dy = e.nativeEvent.pageY - start.current.y;
        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
          onGesture(
            Math.abs(dx) > Math.abs(dy)
              ? dx > 0
                ? 'Balayage → droite'
                : 'Balayage ← gauche'
              : dy > 0
                ? 'Balayage ↓ bas'
                : 'Balayage ↑ haut',
            1,
          );
          return;
        }
        const t = Date.now();
        if (t - lastTap.current < 300) {
          lastTap.current = 0;
          onGesture('Double-toucher', 1);
        } else {
          lastTap.current = t;
          onGesture('Toucher', 1);
        }
      }}
      style={style}
    >
      {children}
    </View>
  );
}

// ── Liste réordonnable ─────────────────────────────────────────────

/**
 * Liste réordonnable par poignée (`ReorderableListView` Flutter) : glisser la poignée déplace la ligne ;
 * actions « Monter » / « Descendre » au lecteur d'écran.
 */
export function ReorderList({
  items,
  onReorder,
  renderItem,
  rowHeight = 56,
}: {
  items: string[];
  onReorder: (from: number, to: number) => void;
  renderItem: (item: string, index: number) => ReactNode;
  rowHeight?: number;
}) {
  const { kit, colorMode } = useKitTheme();
  const [drag, setDrag] = useState<{ index: number; dy: number } | null>(null);
  const startY = useRef(0);
  const target = drag ? Math.min(items.length - 1, Math.max(0, drag.index + Math.round(drag.dy / rowHeight))) : -1;
  return (
    <View>
      {items.map((it, i) => {
        const dragging = drag?.index === i;
        let shift = 0;
        if (drag && !dragging) {
          if (drag.index < i && i <= target) shift = -rowHeight;
          if (drag.index > i && i >= target) shift = rowHeight;
        }
        return (
          <View
            key={it}
            accessible
            accessibilityLabel={`${i + 1}. ${it}`}
            accessibilityActions={[
              ...(i > 0 ? [{ name: 'up', label: 'Monter' }] : []),
              ...(i < items.length - 1 ? [{ name: 'down', label: 'Descendre' }] : []),
            ]}
            onAccessibilityAction={(e) => onReorder(i, e.nativeEvent.actionName === 'up' ? i - 1 : i + 1)}
            style={[
              styles.reorderRow,
              { height: rowHeight, transform: [{ translateY: dragging ? (drag?.dy ?? 0) : shift }] },
              dragging && [styles.lifted, { backgroundColor: kit.card }, elevation(3, colorMode)],
            ]}
          >
            <View style={styles.fill}>{renderItem(it, i)}</View>
            <View
              onStartShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
              onResponderGrant={(e) => {
                startY.current = e.nativeEvent.pageY;
                hapticToggle();
                setDrag({ index: i, dy: 0 });
              }}
              onResponderMove={(e) => setDrag({ index: i, dy: e.nativeEvent.pageY - startY.current })}
              onResponderRelease={() => {
                if (target !== i && target >= 0) onReorder(i, target);
                setDrag(null);
              }}
              onResponderTerminate={() => setDrag(null)}
              style={styles.handle}
            >
              <Icon source="mi:drag-indicator" size={24} color={kit.textMuted} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowGap10: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowGap12: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTop12: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  selfStart: { alignSelf: 'flex-start' },
  ml8: { marginLeft: space.s2 },
  mt2: { marginTop: 2 },
  mt8: { marginTop: space.s2 },
  keycap: {
    marginLeft: space.s1,
    paddingHorizontal: space.s2,
    paddingVertical: space.s1,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  kbd: { ...font('400', 11, 'mono'), borderWidth: 1, borderRadius: 5, paddingHorizontal: space.s2, paddingVertical: 2 },
  paletteHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    paddingLeft: space.s3,
    paddingRight: space.s2,
    paddingTop: space.s3,
    paddingBottom: space.s2,
  },
  paletteList: { paddingHorizontal: space.s2, paddingBottom: space.s4 },
  groupLabel: {
    ...font('700', 11),
    letterSpacing: 0.8,
    paddingHorizontal: space.s3,
    paddingTop: space.s3,
    paddingBottom: space.s1,
  },
  cmd: { minHeight: 56, justifyContent: 'center', paddingHorizontal: space.s3, borderRadius: radius.md },
  cmdIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  popover: { position: 'absolute', borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' },
  bubble: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: radius.x2l,
    paddingLeft: 18,
    paddingRight: space.s3,
    paddingTop: space.s4,
    paddingBottom: space.s3,
  },
  bubbleIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  bubbleActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: space.s2,
  },
  chips: { gap: space.s2, paddingVertical: space.s1 },
  notif: { paddingVertical: space.s3, paddingHorizontal: space.s1, borderBottomWidth: 1 },
  notifDisc: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 9, height: 9, borderRadius: 4.5, marginTop: space.s2, marginLeft: space.s2 },
  menuDivider: { height: 1, marginVertical: space.s2 },
  reorderRow: { flexDirection: 'row', alignItems: 'center' },
  lifted: { zIndex: 10, borderRadius: radius.md },
  handle: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
