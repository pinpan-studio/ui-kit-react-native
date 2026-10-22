import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, PanResponder, ScrollView, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Rect } from 'react-native-svg';

import { ago, compact as fmtCompact, number, time, weekday } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import { useReducedMotion } from '../../mobile/useReducedMotion';
import { KitIconButton } from '../../mobile/KitIconButton';
import { font, kitText, radius, space, tabular, toneColor, toneLight, useKitTheme, type KitTone } from '../../theme';
import { ON_LIGHT, WHITE } from '../../theme/swatches';
import { KitAvatar } from '../core/Avatars';
import { StatusBadge } from '../core/Badges';
import { EmptyState } from '../core/States';
import { KitChip } from '../core/Toggles';

// ── Timeline ───────────────────────────────────────────────────────

export interface TimelineEntry {
  title: string;
  text?: string;
  time?: string;
  icon?: string;
  tone?: KitTone;
}

/** Timeline verticale : pastilles d'icône reliées par un trait (`KitTimeline` Flutter). */
export function KitTimeline({ items, dense = false }: { items: TimelineEntry[]; dense?: boolean }) {
  const { kit } = useKitTheme();
  const dot = dense ? 26 : 34;
  return (
    <View accessibilityRole="list">
      {items.map((it, i) => {
        const tone = it.tone ?? 'primary';
        const last = i === items.length - 1;
        return (
          <View
            key={`${it.title}-${i}`}
            style={styles.row}
            accessible
            accessibilityLabel={[it.title, it.text, it.time].filter(Boolean).join(', ')}
          >
            <View style={{ width: dot, alignItems: 'center' }}>
              <View
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: dot / 2,
                  backgroundColor: toneLight(tone, kit),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon source={it.icon ?? 'mi:circle'} size={dot * 0.5} color={toneColor(tone, kit)} />
              </View>
              {last ? null : <View style={[styles.tlLine, { backgroundColor: kit.border }]} />}
            </View>
            <View style={[styles.fill, { paddingTop: dense ? 3 : 6, paddingBottom: last ? 0 : dense ? 12 : 18 }]}>
              <View style={styles.rowCenter}>
                <Text style={[font('700', dense ? 13 : 14), styles.fill, { color: kit.textPrimary }]}>{it.title}</Text>
                {it.time ? <Text style={[font('400', 11.5), tabular, { color: kit.textMuted }]}>{it.time}</Text> : null}
              </View>
              {it.text ? (
                <Text
                  style={[
                    font('400', dense ? 12 : 13),
                    styles.mt2,
                    { lineHeight: (dense ? 12 : 13) * 1.45, color: kit.textSecondary },
                  ]}
                >
                  {it.text}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Liste descriptive ──────────────────────────────────────────────

export type DescType = 'text' | 'mono' | 'badge' | 'email' | 'phone' | 'link' | 'multiline';

export interface DescItem {
  label: string;
  value?: string | null;
  icon?: string;
  type?: DescType;
  tone?: KitTone;
  copy?: boolean;
  hint?: string;
  /** Occupe toute la largeur de la grille. */
  full?: boolean;
}

/** `<app-description-list>` : grille clé / valeur responsive ou disposition horizontale (`DescriptionList`). */
export function DescriptionList({
  items,
  columns = 2,
  horizontal = false,
  bordered = false,
  title,
}: {
  items: DescItem[];
  columns?: number;
  horizontal?: boolean;
  bordered?: boolean;
  title?: string;
}) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [w, setW] = useState(0);
  const value = (it: DescItem) => {
    if (!it.value) return <Text style={[font('500', 14), { color: kit.textMuted }]}>—</Text>;
    const base: TextStyle = { ...font('500', 14), color: kit.textPrimary };
    const type = it.type ?? 'text';
    const node =
      type === 'badge' ? (
        <StatusBadge label={it.value} tone={it.tone ?? 'neutral'} />
      ) : type === 'mono' ? (
        <Text style={[base, font('400', 12.5, 'mono')]}>{it.value}</Text>
      ) : type === 'email' || type === 'link' || type === 'phone' ? (
        <Text
          accessibilityRole="link"
          onPress={() => snack.demoAction(`Ouverture de ${it.value}`)}
          style={[base, { color: kit.primary }]}
        >
          {it.value}
        </Text>
      ) : (
        <Text style={[base, horizontal && styles.right]}>{it.value}</Text>
      );
    if (!it.copy) return node;
    return (
      <View style={styles.rowCenter}>
        <View style={styles.shrink}>{node}</View>
        <TouchableRipple
          onPress={() => snack.copy(it.value ?? '')}
          borderless
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Copier ${it.label}`}
          style={styles.copyBtn}
        >
          <Icon source="mi:content-copy" size={16} color={kit.textMuted} />
        </TouchableRipple>
      </View>
    );
  };
  const label = (it: DescItem) => (
    <View style={styles.rowCenter}>
      {it.icon ? <Icon source={it.icon} size={15} color={kit.textMuted} /> : null}
      <Text style={[font('500', 12), it.icon ? styles.ml5 : null, { color: kit.textSecondary }]}>{it.label}</Text>
    </View>
  );
  const body = horizontal ? (
    <View>
      {items.map((it, i) => (
        <View key={it.label} style={[styles.descH, i > 0 && { borderTopWidth: 1, borderTopColor: kit.border }]}>
          {label(it)}
          <View style={[styles.fill, styles.end]}>{value(it)}</View>
        </View>
      ))}
    </View>
  ) : (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={styles.descGrid}>
      {items.map((it) => {
        const cols = w < 360 ? 1 : w < 600 ? Math.min(columns, 2) : columns;
        const width = it.full || !w ? w || '100%' : (w - (cols - 1) * 16) / cols;
        return (
          <View
            key={it.label}
            style={[
              { width },
              bordered && { padding: space.s3, borderRadius: radius.md, borderWidth: 1, borderColor: kit.border },
            ]}
          >
            {label(it)}
            <View style={styles.mt4}>{value(it)}</View>
            {it.hint ? <Text style={[font('400', 11), { color: kit.textMuted }]}>{it.hint}</Text> : null}
          </View>
        );
      })}
    </View>
  );
  if (!title) return body;
  return (
    <View>
      <Text accessibilityRole="header" style={[kitText.cardTitle, styles.mb8, { color: kit.textPrimary }]}>
        {title}
      </Text>
      {body}
    </View>
  );
}

// ── Compteur animé ─────────────────────────────────────────────────

/** `<app-stat-counter>` : valeur animée jusqu'à la cible (`StatCounter` Flutter). */
export function StatCounter({
  value,
  compact = false,
  suffix = '',
  duration = 1200,
  style,
}: {
  value: number;
  compact?: boolean;
  suffix?: string;
  duration?: number;
  style?: TextStyle;
}) {
  const { kit } = useKitTheme();
  const reduced = useReducedMotion();
  const [animated, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (reduced) {
      from.current = value;
      return;
    }
    const start = Date.now();
    const origin = from.current;
    let frame = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const v = origin + (value - origin) * eased;
      setShown(v);
      if (t < 1) frame = requestAnimationFrame(step);
      else from.current = value;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduced]);
  const shown = reduced ? value : animated;
  const label = `${compact ? fmtCompact(value) : number(value)}${suffix}`;
  return (
    <Text accessibilityLabel={label} style={[styles.counter, tabular, { color: kit.textPrimary }, style]}>
      {`${compact ? fmtCompact(shown) : number(shown)}${suffix}`}
    </Text>
  );
}

// ── Diff ───────────────────────────────────────────────────────────

export type DiffOp = 'same' | 'add' | 'del';

export interface DiffLine {
  op: DiffOp;
  text: string;
  oldNo?: number;
  newNo?: number;
}

/** Diff ligne à ligne par plus longue sous-séquence commune (`diffLines` Flutter, `diff.util.ts`). */
export function diffLines(a: string, b: string): DiffLine[] {
  const x = a.split('\n');
  const y = b.split('\n');
  const n = x.length;
  const m = y.length;
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  const at = (i: number, j: number) => dp[i]?.[j] ?? 0;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      (dp[i] as number[])[j] = x[i] === y[j] ? at(i + 1, j + 1) + 1 : Math.max(at(i + 1, j), at(i, j + 1));
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) {
      out.push({ op: 'same', text: x[i] ?? '', oldNo: i + 1, newNo: j + 1 });
      i++;
      j++;
    } else if (at(i + 1, j) >= at(i, j + 1)) {
      out.push({ op: 'del', text: x[i] ?? '', oldNo: i + 1 });
      i++;
    } else {
      out.push({ op: 'add', text: y[j] ?? '', newNo: j + 1 });
      j++;
    }
  }
  for (; i < n; i++) out.push({ op: 'del', text: x[i] ?? '', oldNo: i + 1 });
  for (; j < m; j++) out.push({ op: 'add', text: y[j] ?? '', newNo: j + 1 });
  return out;
}

/** `<app-text-diff>` : vue unifiée, statistiques, lignes identiques repliables (`TextDiff` Flutter). */
export function TextDiff({
  before,
  after,
  fileName,
  mono = false,
}: {
  before: string;
  after: string;
  fileName?: string;
  mono?: boolean;
}) {
  const { kit } = useKitTheme();
  const [collapse, setCollapse] = useState(false);
  const lines = diffLines(before, after);
  const adds = lines.filter((l) => l.op === 'add').length;
  const dels = lines.filter((l) => l.op === 'del').length;
  const size = mono ? 11.5 : 12.5;
  const base: TextStyle = { ...(mono ? font('400', size, 'mono') : font('400', size)), lineHeight: size * 1.5 };
  return (
    <View style={[styles.diff, { borderColor: kit.border, backgroundColor: kit.card }]}>
      <View style={[styles.diffHead, { backgroundColor: kit.tableHeader }]}>
        <Icon source="mi:difference" size={18} color={kit.textSecondary} />
        <Text style={[font('400', 12, 'mono'), styles.fill, { color: kit.textPrimary }]}>
          {fileName ?? 'Comparaison'}
        </Text>
        <Text style={[font('700', 12), { color: kit.successText }]}>{`+${adds}`}</Text>
        <Text style={[font('700', 12), { color: kit.errorText }]}>{`−${dels}`}</Text>
        <KitIconButton
          icon={collapse ? 'mi:unfold-more' : 'mi:unfold-less'}
          size={18}
          accessibilityLabel={collapse ? 'Afficher tout' : 'Masquer les lignes identiques'}
          iconColor={kit.textSecondary}
          onPress={() => setCollapse(!collapse)}
        />
      </View>
      {lines
        .filter((l) => !collapse || l.op !== 'same')
        .map((l, k) => (
          <View
            key={k}
            accessible
            accessibilityLabel={`${l.op === 'add' ? 'Ajouté' : l.op === 'del' ? 'Supprimé' : 'Inchangé'} : ${l.text}`}
            style={[
              styles.diffRow,
              l.op === 'add' && { backgroundColor: kit.successLight },
              l.op === 'del' && { backgroundColor: kit.errorLight },
            ]}
          >
            <Text
              style={[font('400', 10.5, 'mono'), styles.diffNo, { color: kit.textMuted, lineHeight: base.lineHeight }]}
            >
              {l.newNo ?? l.oldNo ?? ''}
            </Text>
            <Text
              style={[
                base,
                font('700', size),
                styles.diffSign,
                { color: l.op === 'add' ? kit.successText : kit.errorText },
              ]}
            >
              {l.op === 'add' ? '+' : l.op === 'del' ? '−' : ''}
            </Text>
            <Text
              style={[
                base,
                styles.fill,
                styles.diffText,
                { color: l.op === 'same' ? kit.textSecondary : kit.textPrimary },
                l.op === 'del' && styles.strike,
              ]}
            >
              {l.text || ' '}
            </Text>
          </View>
        ))}
    </View>
  );
}

// ── Journal d'audit ────────────────────────────────────────────────

export type AuditAction = 'create' | 'update' | 'delete' | 'status' | 'comment' | 'export' | 'login';

export interface AuditEntry {
  user: string;
  action: AuditAction;
  hoursAgo: number;
  target?: string;
  changes?: { label: string; before?: string | null; after?: string | null }[];
  comment?: string;
  meta?: string;
}

const AUDIT_META: Record<AuditAction, [string, string, KitTone]> = {
  create: ['mi:add-circle-outline', 'a créé', 'success'],
  update: ['mi:edit', 'a modifié', 'info'],
  delete: ['mi:delete-outline', 'a supprimé', 'error'],
  status: ['mi:published-with-changes', 'a changé le statut de', 'purple'],
  comment: ['mi:chat-bubble-outline', 'a commenté', 'primary'],
  export: ['mi:download', 'a exporté', 'warning'],
  login: ['mi:login', 's’est connecté', 'neutral'],
};

const AUDIT_FILTERS: [AuditAction, string][] = [
  ['update', 'Modifs'],
  ['status', 'Statuts'],
  ['create', 'Créations'],
  ['comment', 'Commentaires'],
  ['delete', 'Suppressions'],
];

/** Libellé de groupe d'un jour : « Aujourd’hui », « Hier » ou « mardi 14 octobre ». */
export function dayKey(d: Date, now: Date): string {
  const strip = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((strip(now) - strip(d)) / 86400000);
  return days === 0 ? 'Aujourd’hui' : days === 1 ? 'Hier' : weekday(d);
}

/** `<app-audit-log>` : fil d'activité groupé par jour, avant → après, filtres par type (`AuditLog` Flutter). */
export function AuditLog({ entries, now: nowProp }: { entries: AuditEntry[]; now?: Date }) {
  const { kit } = useKitTheme();
  const [filter, setFilter] = useState<AuditAction | null>(null);
  const [now] = useState(() => nowProp ?? new Date());
  const list = entries.filter((e) => !filter || e.action === filter);
  const groups: [string, AuditEntry[]][] = [];
  for (const e of list) {
    const key = dayKey(new Date(now.getTime() - Math.round(e.hoursAgo * 60) * 60000), now);
    const g = groups.find(([k]) => k === key);
    if (g) g[1].push(e);
    else groups.push([key, [e]]);
  }
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <KitChip label="Tout" selected={!filter} onPress={() => setFilter(null)} />
        {AUDIT_FILTERS.map(([a, l]) => (
          <KitChip
            key={a}
            label={l}
            icon={AUDIT_META[a][0]}
            selected={filter === a}
            onPress={() => setFilter(filter === a ? null : a)}
          />
        ))}
      </ScrollView>
      {list.length === 0 ? (
        <EmptyState compact icon="mi:history" title="Aucune activité" subtitle="Aucune entrée pour ce filtre." />
      ) : null}
      {groups.map(([key, items]) => (
        <View key={key}>
          <Text accessibilityRole="header" style={[styles.dayKey, { color: kit.textMuted }]}>
            {key.toUpperCase()}
          </Text>
          {items.map((e, k) => {
            const [icon, verb, tone] = AUDIT_META[e.action];
            const at = new Date(now.getTime() - Math.round(e.hoursAgo * 60) * 60000);
            return (
              <View key={k} style={styles.entry}>
                <View>
                  <KitAvatar name={e.user} size={34} />
                  <View style={[styles.entryIcon, { backgroundColor: kit.card }]}>
                    <Icon source={icon} size={13} color={toneColor(tone, kit)} />
                  </View>
                </View>
                <View style={styles.fill}>
                  <Text style={[font('400', 13), { lineHeight: 18.2, color: kit.textPrimary }]}>
                    <Text style={font('700', 13)}>{e.user}</Text>
                    {` ${verb} `}
                    {e.target ? <Text style={[font('600', 13), { color: kit.primary }]}>{e.target}</Text> : null}
                  </Text>
                  <Text style={[font('400', 11.5), { color: kit.textMuted }]}>
                    {`${ago(at, now)} · ${time(at.getHours(), at.getMinutes())}${e.meta ? ` · ${e.meta}` : ''}`}
                  </Text>
                  {e.comment ? (
                    <View style={[styles.comment, { backgroundColor: kit.hover }]}>
                      <Text style={[font('400', 12.5), { lineHeight: 18, color: kit.textPrimary }]}>{e.comment}</Text>
                    </View>
                  ) : null}
                  {(e.changes ?? []).map((ch) => (
                    <View key={ch.label} style={styles.change}>
                      <Text style={[font('400', 12), { color: kit.textSecondary }]}>{`${ch.label} :`}</Text>
                      {ch.before ? (
                        <>
                          <View style={[styles.pill, { backgroundColor: kit.errorLight }]}>
                            <Text style={[font('400', 12), styles.strike, { color: kit.errorText }]}>{ch.before}</Text>
                          </View>
                          <Icon source="mi:arrow-forward" size={14} color={kit.textMuted} />
                        </>
                      ) : null}
                      <View style={[styles.pill, { backgroundColor: kit.successLight }]}>
                        <Text style={[font('600', 12), { color: kit.successText }]}>{ch.after ?? '—'}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── QR code et code-barres ─────────────────────────────────────────

const LOGO = require('../../../assets/images/logo.png');

/** `<app-qr-code>` : QR code sur fond blanc, logo optionnel (correction H), libellé (`QrBlock` Flutter). */
export function QrBlock({
  data,
  label,
  size = 150,
  withLogo = false,
}: {
  data: string;
  label?: string;
  size?: number;
  withLogo?: boolean;
}) {
  const { kit } = useKitTheme();
  return (
    <View
      style={styles.center}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`QR code${label ? ` : ${label}` : ''}`}
    >
      <View style={[styles.codeBox, { borderColor: kit.border }]}>
        <QRCode
          value={data}
          size={size}
          color={ON_LIGHT}
          backgroundColor={WHITE}
          ecl={withLogo ? 'H' : 'M'}
          logo={withLogo ? LOGO : undefined}
          logoSize={34}
          logoBackgroundColor={WHITE}
        />
      </View>
      {label ? (
        <Text style={[font('600', 12), styles.mt8, styles.textCenter, { color: kit.textSecondary }]}>{label}</Text>
      ) : null}
    </View>
  );
}

/** Motifs Code 128 (largeurs barre / espace en modules), valeurs 0 → 106. */
const CODE128 = (
  '212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 ' +
  '123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 ' +
  '232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 ' +
  '313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 ' +
  '111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 ' +
  '111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 ' +
  '114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112'
).split(' ');

/** Encode un texte ASCII imprimable en Code 128 B (départ B, données, clé modulo 103, arrêt). */
export function code128(data: string): number[] {
  const values = [...data].map((ch) => ch.charCodeAt(0) - 32).filter((v) => v >= 0 && v < 95);
  const check = values.reduce((sum, v, i) => sum + v * (i + 1), 104) % 103;
  return [104, ...values, check, 106].flatMap((v) => [...(CODE128[v] ?? '')].map(Number));
}

/** Code-barres Code 128 sur fond blanc, texte lisible dessous (`BarcodeBlock` Flutter). */
export function BarcodeBlock({ data, width = 240, height = 80 }: { data: string; width?: number; height?: number }) {
  const { kit } = useKitTheme();
  const widths = code128(data);
  const modules = widths.reduce((a, b) => a + b, 0);
  const unit = width / modules;
  const bars: ReactNode[] = [];
  let x = 0;
  widths.forEach((w, i) => {
    if (i % 2 === 0)
      bars.push(<Rect key={i} x={x * unit} y={0} width={w * unit} height={height - 18} fill={ON_LIGHT} />);
    x += w;
  });
  return (
    <View
      style={[styles.codeBox, { borderColor: kit.border }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Code-barres ${data}`}
    >
      <Svg width={width} height={height - 18}>
        {bars}
      </Svg>
      <Text style={[font('400', 12, 'mono'), styles.textCenter, styles.mt4, { color: ON_LIGHT }]}>{data}</Text>
    </View>
  );
}

// ── Ligne à balayer ────────────────────────────────────────────────

const BOTH_SWIPES: ('archive' | 'delete')[] = ['archive', 'delete'];

/**
 * Ligne qui se balaie pour archiver (vers la droite) ou supprimer (vers la gauche) — `Dismissible` Flutter.
 * Les deux gestes sont aussi proposés comme actions de lecteur d'écran.
 */
export function SwipeRow({
  children,
  onDismiss,
  allow = BOTH_SWIPES,
}: {
  children: ReactNode;
  onDismiss: (direction: 'archive' | 'delete') => void;
  /** Sens autorisés : `archive` (vers la droite) et / ou `delete` (vers la gauche). */
  allow?: ('archive' | 'delete')[];
}) {
  const { kit } = useKitTheme();
  const [x] = useState(() => new Animated.Value(0));
  const [width, setWidth] = useState(0);
  const [dir, setDir] = useState<'archive' | 'delete'>('archive');
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
        onPanResponderMove: (_, g) => {
          const d = g.dx >= 0 ? 'archive' : 'delete';
          x.setValue(allow.includes(d) ? g.dx : 0);
          setDir(d);
        },
        onPanResponderRelease: (_, g) => {
          const d = g.dx > 0 ? 'archive' : 'delete';
          if (allow.includes(d) && (Math.abs(g.dx) > 120 || Math.abs(g.vx) > 0.8)) {
            Animated.timing(x, {
              toValue: d === 'archive' ? width : -width,
              duration: 180,
              useNativeDriver: true,
            }).start(() => onDismiss(d));
          } else Animated.spring(x, { toValue: 0, useNativeDriver: true }).start();
        },
        onPanResponderTerminate: () => Animated.spring(x, { toValue: 0, useNativeDriver: true }).start(),
      }),
    [x, width, onDismiss, allow],
  );
  const archive = dir === 'archive';
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityActions={[
        { name: 'archive', label: 'Archiver' },
        { name: 'delete', label: 'Supprimer' },
      ].filter((a) => allow.includes(a.name as 'archive' | 'delete'))}
      onAccessibilityAction={(e) => onDismiss(e.nativeEvent.actionName === 'archive' ? 'archive' : 'delete')}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.swipeBg,
          {
            backgroundColor: archive ? kit.successLight : kit.errorLight,
            justifyContent: archive ? 'flex-start' : 'flex-end',
          },
        ]}
      >
        <Icon
          source={archive ? 'mi:archive' : 'mi:delete-outline'}
          size={24}
          color={archive ? kit.successText : kit.errorText}
        />
      </View>
      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }], backgroundColor: kit.card }}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  shrink: { flexShrink: 1 },
  row: { flexDirection: 'row', gap: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center' },
  end: { alignItems: 'flex-end' },
  right: { textAlign: 'right' },
  textCenter: { textAlign: 'center' },
  strike: { textDecorationLine: 'line-through' },
  ml5: { marginLeft: 5 },
  mt2: { marginTop: 2 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: space.s2 },
  mb8: { marginBottom: space.s2 },
  tlLine: { flex: 1, width: 2, marginVertical: space.s1 },
  copyBtn: { padding: 4, borderRadius: 12 },
  descH: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: space.s3 },
  descGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 14 },
  counter: font('700', 26, 'heading'),
  diff: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  diffHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: space.s3 },
  diffRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: space.s0_5 },
  diffNo: { width: 30, textAlign: 'right' },
  diffSign: { width: 20, textAlign: 'center' },
  diffText: { paddingRight: space.s2 },
  chips: { gap: space.s2, paddingBottom: 12 },
  dayKey: { ...font('700', 11), letterSpacing: 0.8, marginBottom: space.s2, marginTop: space.s1 },
  entry: { flexDirection: 'row', gap: 12, marginBottom: space.s4 },
  entryIcon: { position: 'absolute', right: -4, bottom: -4, padding: 2, borderRadius: 10 },
  comment: {
    marginTop: space.s2,
    padding: space.s3,
    borderTopRightRadius: radius.md,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  change: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: space.s2 },
  pill: { paddingHorizontal: space.s2, paddingVertical: 1, borderRadius: radius.xs },
  codeBox: { padding: space.s3, backgroundColor: WHITE, borderRadius: radius.md, borderWidth: 1, alignItems: 'center' },
  swipeBg: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.s5 },
});
