import { createContext, useContext, useState, type ReactNode } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions, type TextStyle } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';

import { KitAvatar, KitButton, KitCheckbox, StatusBadge, markdownInline } from '../../components';
import { compact } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import { FM_ITEMS, FM_KINDS, fmModified, type ArticleBlock, type CommentItem } from '../../data/examples';
import {
  breakpoints,
  font,
  radius,
  space,
  toneLight,
  toneText,
  useKitTheme,
  withAlpha,
  type KitTone,
} from '../../theme';

/**
 * Briques communes des écrans d'exemple (`ex_scaffold.dart` + en-tête d'`app_examples.dart`) :
 * page défilante centrée, en-têtes, lignes cliquables, Markdown en ligne, blocs d'article, commentaires,
 * donut, sélecteur de fichiers.
 */

// ── Navigation dans le shell d'exemples ─────────────────────────────

export interface ExNav {
  /** Ouvre une page du shell (avec paramètre éventuel) en l'empilant. */
  go: (id: string, param?: string) => void;
  /** Paramètre de la page courante (identifiant de client, index d'article…). */
  param?: string;
}

export const ExNavContext = createContext<ExNav>({ go: () => undefined });
export const useExNav = () => useContext(ExNavContext);

// ── Mise en page ────────────────────────────────────────────────────

/** Page d'exemple : contenu défilant, centré à une largeur maximale, marges selon la largeur. */
export function ExPage({ children, maxWidth = 720 }: { children: ReactNode; maxWidth?: number }) {
  const { width } = useWindowDimensions();
  const pad = width < breakpoints.tablet ? space.s4 : space.s6;
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: pad, paddingTop: space.s3, paddingBottom: pad }}>
      <View style={[styles.center, { maxWidth }]}>{children}</View>
    </ScrollView>
  );
}

/** Titre + sous-titre de section. */
export function ExHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={[font('700', 24, 'heading'), { color: kit.textPrimary }]}>
        {title}
      </Text>
      {subtitle ? <Text style={[font('400', 14), styles.mt4, { color: kit.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

/** En-tête de page : sur-titre, titre, sous-titre et actions qui passent à la ligne. */
export function ExHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { kit } = useKitTheme();
  return (
    <View>
      {eyebrow ? <Text style={[font('600', 12), { color: kit.textMuted }]}>{eyebrow}</Text> : null}
      <ExHeading title={title} subtitle={subtitle} />
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

/** Colonne régulièrement espacée. */
export function ExGap({ children, gap = space.s4 }: { children: ReactNode; gap?: number }) {
  return <View style={{ gap }}>{children}</View>;
}

/** Deux champs côte à côte au-delà de 600 dp, empilés en dessous. */
export function ExRow({ children }: { children: ReactNode }) {
  const [w, setW] = useState(0);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={w >= breakpoints.md ? styles.row : styles.stack}>
      {Array.isArray(children)
        ? children.map((c, i) => (
            <View key={i} style={w >= breakpoints.md ? styles.fill : undefined}>
              {c}
            </View>
          ))
        : children}
    </View>
  );
}

/** Ligne cliquable : élément de tête, titre, sous-titre (2 lignes), élément de fin, état sélectionné. */
export function ExTile({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  selected = false,
}: {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  selected?: boolean;
}) {
  const { kit } = useKitTheme();
  const body = (
    <View style={styles.tile}>
      {leading}
      <View style={styles.fill}>
        <Text numberOfLines={1} style={[font('600', 14), { color: kit.textPrimary }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={2} style={[font('400', 13), { color: kit.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
  const bg = selected ? { backgroundColor: kit.primaryLight } : null;
  if (!onPress) return <View style={[styles.tileBox, bg]}>{body}</View>;
  return (
    <TouchableRipple
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      style={[styles.tileBox, bg]}
    >
      {body}
    </TouchableRipple>
  );
}

/** Écran de succès commun aux formulaires. */
export function ExSuccess({ title, message, onReset }: { title: string; message: string; onReset: () => void }) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.success}>
      <Icon source="mi:check-circle" size={64} color={kit.successText} />
      <Text style={[font('700', 22, 'heading'), styles.centerText, { color: kit.textPrimary }]}>{title}</Text>
      <Text style={[font('400', 14), styles.centerText, { color: kit.textMuted }]}>{message}</Text>
      <KitButton label="Recommencer" icon="mi:refresh" variant="outline" onPress={onReset} />
    </View>
  );
}

/** Texte avec Markdown en ligne (**gras**, *italique*, `code`, [lien](#)). */
export function ExInline({ text, style, numberOfLines }: { text: string; style?: TextStyle; numberOfLines?: number }) {
  const { kit } = useKitTheme();
  const base: TextStyle = { ...font('400', 14), color: kit.textPrimary, ...style };
  return (
    <Text numberOfLines={numberOfLines} style={base}>
      {markdownInline(text, base, kit)}
    </Text>
  );
}

/** Montant compact sans décimale nulle (`27,9 M`, `990 M`, `1,1 Md`), comme `exCompact` Flutter. */
export const exCompact = (v: number) => compact(v).replace(/,0(?=\s)/, '');

/** Pastille d'illustration teintée (couverture d'article, visuel produit) selon une teinte HSL. */
export function hueColors(hue: number, dark: boolean) {
  return {
    bg: `hsl(${hue}, 50%, ${dark ? 22 : 90}%)`,
    fg: `hsl(${hue}, 60%, ${dark ? 75 : 35}%)`,
  };
}

export function HueCover({
  hue,
  icon,
  ratio = 16 / 9,
  height,
}: {
  hue: number;
  icon: string;
  ratio?: number;
  height?: number;
}) {
  const { colorMode } = useKitTheme();
  const c = hueColors(hue, colorMode === 'dark');
  return (
    <View style={[styles.cover, height ? { height } : { aspectRatio: ratio }, { backgroundColor: c.bg }]}>
      <Icon source={icon} size={48} color={c.fg} />
    </View>
  );
}

// ── Blocs d'article et commentaires ─────────────────────────────────

const BLOCK_TONE: Record<string, KitTone> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  neutral: 'neutral',
};

/** Rendu d'un bloc d'article (`exBlock`), partagé par l'article et la documentation. */
export function ArticleBlockView({ block: b }: { block: ArticleBlock }) {
  const { kit } = useKitTheme();
  let w: ReactNode = null;
  switch (b.type) {
    case 'lead':
      w = <ExInline text={b.text} style={{ ...font('600', 16), lineHeight: 24, color: kit.textSecondary }} />;
      break;
    case 'p':
      w = <ExInline text={b.text} style={{ lineHeight: 22 }} />;
      break;
    case 'h2':
      w = <Text style={[font('700', 22, 'heading'), { color: kit.textPrimary }]}>{b.text}</Text>;
      break;
    case 'h3':
      w = <Text style={[font('700', 16), { color: kit.textPrimary }]}>{b.text}</Text>;
      break;
    case 'list':
      w = (
        <View style={styles.gap4}>
          {b.items.map((i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={[font('400', 14), { color: kit.textPrimary }]}>•</Text>
              <View style={styles.fill}>
                <ExInline text={i} />
              </View>
            </View>
          ))}
        </View>
      );
      break;
    case 'table':
      w = (
        <View>
          <ScrollView horizontal>
            <View style={[styles.table, { borderColor: kit.border }]}>
              {[b.head, ...b.rows].map((r, i) => (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    { borderColor: kit.divider },
                    i === 0 && { backgroundColor: kit.tableHeader },
                  ]}
                >
                  {r.map((v, j) => (
                    <View key={j} style={styles.tableCell}>
                      <ExInline text={v} style={i === 0 ? font('700', 13) : font('400', 13)} />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
          {b.caption ? <Text style={[font('400', 12), styles.mt4, { color: kit.textMuted }]}>{b.caption}</Text> : null}
        </View>
      );
      break;
    case 'callout':
      w = (
        <View style={[styles.callout, { backgroundColor: toneLight(BLOCK_TONE[b.tone] ?? 'neutral', kit) }]}>
          {b.title ? (
            <Text style={[font('700', 14), { color: toneText(BLOCK_TONE[b.tone] ?? 'neutral', kit) }]}>{b.title}</Text>
          ) : null}
          <ExInline text={b.text} style={{ lineHeight: 21 }} />
        </View>
      );
      break;
    case 'pullquote':
      w = <Text style={[font('400', 22, 'heading'), styles.pullquote, { color: kit.primary }]}>{`« ${b.text} »`}</Text>;
      break;
    case 'quote':
      w = (
        <View style={[styles.quote, { borderLeftColor: kit.primary, backgroundColor: kit.hover }]}>
          <Text style={[font('400', 14), styles.italic, { color: kit.textPrimary }]}>{b.text}</Text>
          <Text style={[font('400', 13), styles.mt8, { color: kit.textMuted }]}>{`— ${b.cite}`}</Text>
        </View>
      );
      break;
    case 'code':
      w = (
        <View>
          {b.filename ? (
            <Text style={[font('400', 12, 'mono'), styles.mb4, { color: kit.textMuted }]}>{b.filename}</Text>
          ) : null}
          <ScrollView
            horizontal
            style={[styles.code, { backgroundColor: kit.tableHeader, borderColor: kit.border }]}
            contentContainerStyle={styles.codeInner}
          >
            <Text selectable style={[font('400', 13, 'mono'), { color: kit.textPrimary }]}>
              {b.code}
            </Text>
          </ScrollView>
        </View>
      );
      break;
    case 'figure':
      w = (
        <View>
          <View style={[styles.figure, { backgroundColor: kit.primaryLight }]}>
            <Icon source={b.icon} size={56} color={kit.primary} />
          </View>
          <Text style={[font('400', 12), styles.centerText, styles.mt8, { color: kit.textMuted }]}>{b.caption}</Text>
        </View>
      );
      break;
    case 'divider':
      w = <View style={[styles.rule, { backgroundColor: kit.divider }]} />;
      break;
  }
  return <View style={styles.block}>{w}</View>;
}

/** Commentaire (auteur, badges, texte Markdown, mentions J'aime et réactions) ; réponse en retrait. */
export function CommentView({ comment: k, reply = false }: { comment: CommentItem; reply?: boolean }) {
  const { kit } = useKitTheme();
  return (
    <View style={[styles.comment, reply && styles.reply]}>
      <KitAvatar name={k.author.name} size={reply ? 28 : 36} />
      <View style={styles.fill}>
        <View style={styles.commentHead}>
          <Text style={[font('600', 14), { color: kit.textPrimary }]}>{k.author.name}</Text>
          {k.byAuthor ? <StatusBadge label="Auteur" tone="primary" uppercase={false} /> : null}
          {k.pinned ? <StatusBadge label="Épinglé" icon="mi:push-pin" uppercase={false} /> : null}
          <Text style={[font('400', 12), { color: kit.textMuted }]}>{k.at}</Text>
        </View>
        <ExInline text={k.text} style={{ lineHeight: 21 }} />
        <View style={styles.reactions}>
          <View style={styles.likes}>
            <Icon source="mi:favorite-border" size={16} color={kit.textMuted} />
            <Text style={[font('400', 12), { color: kit.textMuted }]}>{k.likes}</Text>
          </View>
          {k.reactions?.map(([e, n]) => (
            <Text key={e} style={[font('400', 12), { color: kit.textPrimary }]}>{`${e} ${n}`}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Donut ───────────────────────────────────────────────────────────

/** Donut SVG aux couleurs du thème, contenu central libre. */
export function KitDonut({
  values,
  colors,
  size = 160,
  center,
}: {
  values: number[];
  colors: string[];
  size?: number;
  center?: ReactNode;
}) {
  const { kit } = useKitTheme();
  const stroke = size * 0.16;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = values.reduce((a, b) => a + b, 0);
  let start = 0;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.abs}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={kit.hover} strokeWidth={stroke} fill="none" />
        {total > 0
          ? values.map((v, i) => {
              const sweep = (v / total) * circ;
              const gap = Math.min(sweep, circ * 0.006);
              const el = (
                <Circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke={colors[i % colors.length]}
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={[Math.max(0, sweep - gap * 2), circ]}
                  strokeDashoffset={-(start + gap)}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              );
              start += sweep;
              return el;
            })
          : null}
      </Svg>
      <View style={styles.donutCenter}>{center}</View>
    </View>
  );
}

// ── Sélecteur de fichiers ───────────────────────────────────────────

/** Sélecteur de fichiers en modale, sélection multiple (`showFilePicker`). */
export function FilePicker({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { kit, roles } = useKitTheme();
  const snack = useKitSnack();
  const [sel, setSel] = useState<string[]>([]);
  const files = FM_ITEMS.filter((f) => f.kind !== 'folder');
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const close = () => {
    setSel([]);
    onClose();
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={[styles.scrim, { backgroundColor: withAlpha(roles.scrim, 0.32) }]}>
        <View accessibilityViewIsModal style={[styles.dialog, { backgroundColor: roles.surfaceContainerHigh }]}>
          <Text
            accessibilityRole="header"
            style={[font('400', 22, 'heading'), styles.dialogTitle, { color: kit.textPrimary }]}
          >
            Sélectionner des fichiers
          </Text>
          <ScrollView style={styles.dialogList}>
            {files.map((f) => {
              const [label, icon, color] = FM_KINDS[f.kind];
              const on = sel.includes(f.id);
              return (
                <ExTile
                  key={f.id}
                  selected={on}
                  onPress={() => toggle(f.id)}
                  leading={<Icon source={icon} size={24} color={color} />}
                  title={f.name}
                  subtitle={`${label} · ${fmModified(f.days)} · ${f.owner}`}
                  trailing={<KitCheckbox value={on} onChange={() => toggle(f.id)} accessibilityLabel={f.name} />}
                />
              );
            })}
          </ScrollView>
          <View style={styles.dialogActions}>
            <KitButton label="Annuler" variant="ghost" onPress={close} />
            <KitButton
              label={`Joindre (${sel.length})`}
              onPress={
                sel.length
                  ? () => {
                      snack.show(`${sel.length} fichier(s) sélectionné(s) (démo)`);
                      close();
                    }
                  : undefined
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  abs: { position: 'absolute', left: 0, top: 0 },
  center: { width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', gap: space.s4, alignItems: 'flex-start' },
  stack: { gap: space.s4 },
  centerText: { textAlign: 'center' },
  italic: { fontStyle: 'italic', lineHeight: 21 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mb4: { marginBottom: 4 },
  gap4: { gap: 4 },
  heading: { marginBottom: space.s4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, marginTop: -space.s1, marginBottom: space.s4 },
  tileBox: { borderRadius: radius.md },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    minHeight: 48,
    paddingHorizontal: space.s3,
    paddingVertical: space.s2,
  },
  success: { alignItems: 'center', gap: space.s3, paddingVertical: space.s10 },
  cover: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  block: { marginBottom: space.s4 },
  bulletRow: { flexDirection: 'row', gap: 8 },
  table: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 40, alignItems: 'center' },
  tableCell: { width: 130, paddingHorizontal: space.s3, paddingVertical: space.s2 },
  callout: { padding: space.s4, borderRadius: radius.md, gap: 4 },
  pullquote: { textAlign: 'center', fontStyle: 'italic', paddingVertical: space.s4 },
  quote: { padding: space.s4, borderLeftWidth: 4 },
  code: { borderWidth: 1, borderRadius: radius.md },
  codeInner: { padding: space.s4 },
  figure: { height: 160, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  rule: { height: 1 },
  comment: { flexDirection: 'row', gap: space.s3, marginBottom: space.s3 },
  reply: { marginLeft: space.s10 },
  commentHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2, marginBottom: 4 },
  reactions: { flexDirection: 'row', alignItems: 'center', gap: space.s3, marginTop: 4 },
  likes: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  donutCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.l },
  dialog: { width: '100%', maxWidth: 480, maxHeight: '85%', borderRadius: 28, paddingVertical: space.l },
  dialogTitle: { paddingHorizontal: space.l, marginBottom: space.m },
  dialogList: { paddingHorizontal: space.s2 },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: space.s2,
    paddingHorizontal: space.l,
    paddingTop: space.m,
  },
});
