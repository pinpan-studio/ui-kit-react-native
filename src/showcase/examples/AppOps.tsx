import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from 'react-native-paper';

import {
  CountDot,
  EmptyState,
  KitAvatar,
  KitButton,
  KitCard,
  KitChip,
  KitIconButton,
  KitProgressBar,
  KpiCard,
  ResponsiveGrid,
  SegmentedToggle,
  StatusBadge,
} from '../../components';
import { decimal1, fcfa } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import {
  BOARD_COLUMNS,
  BOARD_TASKS,
  CURRENT_USER,
  EX_CATEGORIES,
  EX_MODULES,
  EX_PRODUCTS,
  FM_ITEMS,
  FM_KINDS,
  MON_HEALTH,
  MON_INCIDENTS,
  MON_JOBS,
  MON_KPIS,
  MON_SERVICES,
  ORGANISATION,
  fmModified,
  fmSize,
  type FmItem,
} from '../../data/examples';
import { breakpoints, font, radius, space, toneText, useKitTheme, withAlpha, type KitTone } from '../../theme';
import { ExHeader, ExHeading, ExPage, ExTile, FilePicker, hueColors, useExNav } from './ExKit';

// ── Catalogue ───────────────────────────────────────────────────────

/** Catalogue (`CatalogExample` Flutter) : catégories, cartes produit, panier. */
export function CatalogExample() {
  const { kit, colorMode } = useKitTheme();
  const snack = useKitSnack();
  const [cat, setCat] = useState('Tout');
  const [cart, setCart] = useState<string[]>([]);
  const items = EX_PRODUCTS.filter((p) => cat === 'Tout' || p.category === cat);
  return (
    <ExPage maxWidth={1280}>
      <ExHeader
        title="Catalogue"
        subtitle={`${EX_PRODUCTS.length} produits`}
        actions={
          <KitButton
            label={cart.length ? `Panier · ${cart.length}` : 'Panier'}
            icon="mi:shopping-cart"
            variant="outline"
            onPress={() => snack.demoAction('Panier')}
          />
        }
      />
      <View style={styles.chips}>
        {['Tout', ...EX_CATEGORIES].map((c) => (
          <KitChip key={c} label={c} selected={cat === c} onPress={() => setCat(c)} />
        ))}
      </View>
      <ResponsiveGrid minItemWidth={220} spacing={space.s3}>
        {items.map((p) => {
          const hue = hueColors(p.hue, colorMode === 'dark');
          const inCart = cart.includes(p.id);
          return (
            <KitCard key={p.id}>
              <View style={[styles.visual, { backgroundColor: hue.bg }]}>
                <Icon source={p.icon} size={48} color={hue.fg} />
                {p.badge ? (
                  <View style={styles.badge}>
                    <StatusBadge label={p.badge} tone={p.badge === 'Nouveau' ? 'info' : 'error'} uppercase={false} />
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={1} style={[font('600', 14), styles.mt12, { color: kit.textPrimary }]}>
                {p.name}
              </Text>
              <View style={styles.rowGap4}>
                <Icon source="mi:star" size={14} color={kit.warning} />
                <Text style={[font('400', 12), { color: kit.textPrimary }]}>{decimal1(p.rating)}</Text>
                <Text
                  numberOfLines={1}
                  style={[font('400', 12), styles.fill, { color: p.stock === 0 ? kit.errorText : kit.textMuted }]}
                >
                  {p.stock === 0 ? 'Rupture' : `${p.stock} en stock`}
                </Text>
              </View>
              <View style={[styles.rowGap4, styles.mt8]}>
                <Text style={[font('700', 14), styles.fill, { color: kit.textPrimary }]}>{fcfa(p.price)}</Text>
                <KitIconButton
                  icon={inCart ? 'mi:check' : 'mi:add-shopping-cart'}
                  mode="contained-tonal"
                  disabled={p.stock === 0}
                  accessibilityLabel={inCart ? 'Retirer du panier' : 'Ajouter au panier'}
                  onPress={() => setCart((c) => (inCart ? c.filter((x) => x !== p.id) : [...c, p.id]))}
                />
              </View>
            </KitCard>
          );
        })}
      </ResponsiveGrid>
    </ExPage>
  );
}

// ── Kanban ──────────────────────────────────────────────────────────

/** Tableau kanban (`BoardExample` Flutter) : colonnes défilant horizontalement, cartes de tâches. */
export function BoardExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const { width } = useWindowDimensions();
  const colW = width < breakpoints.tablet ? width * 0.85 : 300;
  return (
    <ScrollView horizontal contentContainerStyle={styles.pad16}>
      {BOARD_COLUMNS.map(([id, label, tone]) => {
        const tasks = BOARD_TASKS.filter((t) => t.status === id);
        return (
          <ScrollView
            key={id}
            style={[styles.column, { width: colW, backgroundColor: kit.hover }]}
            contentContainerStyle={styles.columnInner}
          >
            <View style={styles.rowGap8}>
              <Text style={[font('700', 14), styles.fill, { color: kit.textPrimary }]}>{label}</Text>
              <StatusBadge label={`${tasks.length} / 4`} tone={tone} uppercase={false} />
            </View>
            {tasks.map((t) => (
              <KitCard key={t.id} onPress={() => snack.demoAction(t.title)} accessibilityLabel={`${t.ref}, ${t.title}`}>
                <View style={styles.rowGap8}>
                  <Text style={[font('400', 11, 'mono'), styles.fill, { color: kit.textMuted }]}>{t.ref}</Text>
                  {t.badge ? <StatusBadge label={t.badge[0]} tone={t.badge[1]} uppercase={false} /> : null}
                </View>
                <Text style={[font('600', 14), styles.mt4, { color: kit.textPrimary }]}>{t.title}</Text>
                {t.progress !== undefined && t.progress < 100 ? (
                  <View style={styles.mt8}>
                    <KitProgressBar value={t.progress / 100} />
                  </View>
                ) : null}
                <View style={[styles.rowGap8, styles.mt8]}>
                  <KitAvatar name={t.assignee} size={24} />
                  <Text numberOfLines={1} style={[font('400', 13), styles.fill, { color: kit.textPrimary }]}>
                    {t.assignee}
                  </Text>
                  {t.tags?.map((g) => (
                    <StatusBadge key={g} label={g} uppercase={false} />
                  ))}
                </View>
              </KitCard>
            ))}
            <KitButton
              label="Ajouter une carte"
              icon="mi:add"
              variant="ghost"
              onPress={() => snack.demoAction('Ajout de carte')}
            />
          </ScrollView>
        );
      })}
    </ScrollView>
  );
}

// ── Modules ─────────────────────────────────────────────────────────

/** Lanceur de modules (`ModulesExample` Flutter). */
export function ModulesExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  return (
    <ExPage maxWidth={1200}>
      <ExHeader
        title={`Bonjour, ${CURRENT_USER.fullname.split(' ')[0]}`}
        subtitle={`${ORGANISATION.nom} · ${EX_MODULES.length} modules`}
      />
      <ResponsiveGrid minItemWidth={240} spacing={space.s3}>
        {EX_MODULES.map((m) => (
          <KitCard
            key={m.id}
            onPress={() => snack.demoAction(m.label)}
            accessibilityLabel={`${m.label}. ${m.description}`}
          >
            <View style={styles.rowGap12}>
              <View style={[styles.moduleIcon, { backgroundColor: withAlpha(m.color, 0.15) }]}>
                <Icon source={m.icon} size={24} color={m.color} />
              </View>
              <View style={styles.fill}>
                <Text style={[font('600', 14), { color: kit.textPrimary }]}>{m.label}</Text>
                <Text style={[font('400', 12), { color: kit.textMuted }]}>{m.description}</Text>
                {m.count ? <Text style={[font('600', 12), { color: kit.textSecondary }]}>{m.count}</Text> : null}
              </View>
              {m.badge ? <CountDot count={m.badge} /> : null}
            </View>
          </KitCard>
        ))}
      </ResponsiveGrid>
    </ExPage>
  );
}

// ── Fichiers ────────────────────────────────────────────────────────

function FmIcon({ f, size = 28 }: { f: FmItem; size?: number }) {
  const [, icon, color] = FM_KINDS[f.kind];
  return <Icon source={icon} size={size} color={f.color ?? color} />;
}

function FmFlags({ f }: { f: FmItem }) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.rowGap4}>
      {f.starred ? <Icon source="mi:star" size={14} color={kit.warning} /> : null}
      {f.shared ? <Icon source="mi:people-outline" size={14} color={kit.textMuted} /> : null}
    </View>
  );
}

/** Fichiers (`FilesExample` Flutter) : fil d'Ariane, grille ou liste, import. */
export function FilesExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [grid, setGrid] = useState<'grid' | 'list'>('grid');
  const nav = useExNav();
  const [folder, setFolder] = useState<string | null>(null);
  const [picker, setPicker] = useState(nav.param === 'picker');
  const crumbs: FmItem[] = [];
  for (let id = folder; id;) {
    const f = FM_ITEMS.find((i) => i.id === id)!;
    crumbs.unshift(f);
    id = f.parent;
  }
  const items = FM_ITEMS.filter((i) => i.parent === folder).sort(
    (a, b) => (a.kind === 'folder' ? 0 : 1) - (b.kind === 'folder' ? 0 : 1),
  );
  const tap = (f: FmItem) => (f.kind === 'folder' ? setFolder(f.id) : snack.demoAction(f.name));
  return (
    <ExPage maxWidth={1280}>
      <ExHeader
        title="Mes fichiers"
        subtitle={`${FM_ITEMS.filter((i) => i.kind !== 'folder').length} fichiers`}
        actions={
          <>
            <SegmentedToggle
              value={grid}
              onChange={setGrid}
              options={[
                { value: 'grid', label: 'Grille', icon: 'mi:grid-view' },
                { value: 'list', label: 'Liste', icon: 'mi:list' },
              ]}
            />
            <KitButton label="Importer" icon="mi:upload" onPress={() => setPicker(true)} />
          </>
        }
      />
      <View style={styles.crumbs}>
        <KitButton label="Mes fichiers" variant="ghost" size="compact" onPress={() => setFolder(null)} />
        {crumbs.map((f) => (
          <View key={f.id} style={styles.rowGap4}>
            <Icon source="mi:chevron-right" size={18} color={kit.textMuted} />
            <KitButton label={f.name} variant="ghost" size="compact" onPress={() => setFolder(f.id)} />
          </View>
        ))}
      </View>
      {items.length === 0 ? (
        <EmptyState icon="mi:folder-open" title="Dossier vide" subtitle="Déposez des fichiers ici." />
      ) : null}
      {grid === 'grid' ? (
        <ResponsiveGrid minItemWidth={160} spacing={space.s3}>
          {items.map((f) => (
            <KitCard key={f.id} onPress={() => tap(f)} accessibilityLabel={f.name}>
              <View style={styles.rowGap8}>
                <FmIcon f={f} size={36} />
                <View style={styles.fill} />
                <FmFlags f={f} />
              </View>
              <Text numberOfLines={2} style={[font('600', 14), styles.mt12, { color: kit.textPrimary }]}>
                {f.name}
              </Text>
              <Text style={[font('400', 12), { color: kit.textMuted }]}>
                {f.kind === 'folder'
                  ? `${FM_ITEMS.filter((i) => i.parent === f.id).length} éléments`
                  : `${fmSize(f.size)} · ${fmModified(f.days)}`}
              </Text>
            </KitCard>
          ))}
        </ResponsiveGrid>
      ) : (
        <KitCard padding={0}>
          {items.map((f) => (
            <ExTile
              key={f.id}
              onPress={() => tap(f)}
              leading={<FmIcon f={f} />}
              title={f.name}
              subtitle={`${FM_KINDS[f.kind][0]} · ${f.owner} · ${fmModified(f.days)}`}
              trailing={
                <View style={styles.rowGap8}>
                  <FmFlags f={f} />
                  {f.kind === 'folder' ? null : (
                    <Text style={[font('400', 14), { color: kit.textPrimary }]}>{fmSize(f.size)}</Text>
                  )}
                </View>
              }
            />
          ))}
        </KitCard>
      )}
      <FilePicker visible={picker} onClose={() => setPicker(false)} />
    </ExPage>
  );
}

/** Fichiers en colonnes (`FilesColumnsExample` Flutter) : navigation de type Finder, aperçu du fichier. */
export function FilesColumnsExample() {
  const { kit } = useKitTheme();
  const { height } = useWindowDimensions();
  const [path, setPath] = useState<string[]>([]);
  const [file, setFile] = useState<FmItem | null>(null);
  const column = (parent: string | null, depth: number) => (
    <ScrollView
      key={parent ?? 'root'}
      style={[styles.fmColumn, { borderRightColor: kit.border }]}
      contentContainerStyle={styles.pad4}
    >
      {FM_ITEMS.filter((i) => i.parent === parent).map((f) => (
        <ExTile
          key={f.id}
          selected={path[depth] === f.id || file?.id === f.id}
          leading={<FmIcon f={f} size={20} />}
          title={f.name}
          trailing={
            f.kind === 'folder' ? <Icon source="mi:chevron-right" size={18} color={kit.textSecondary} /> : undefined
          }
          onPress={() => {
            if (f.kind === 'folder') {
              setPath([...path.slice(0, depth), f.id]);
              setFile(null);
            } else {
              setPath(path.slice(0, depth));
              setFile(f);
            }
          }}
        />
      ))}
    </ScrollView>
  );
  return (
    <ScrollView horizontal>
      <View style={[styles.row, { height }]}>
        {column(null, 0)}
        {path.map((id, i) => column(id, i + 1))}
        {file ? (
          <View style={styles.preview}>
            <FmIcon f={file} size={56} />
            <Text style={[font('700', 14), styles.mt12, { color: kit.textPrimary }]}>{file.name}</Text>
            <Text style={[font('400', 14), styles.mt8, styles.lh, { color: kit.textMuted }]}>
              {`${FM_KINDS[file.kind][0]} · ${fmSize(file.size)}\n${file.owner}\n${fmModified(file.days)}`}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

// ── Supervision ─────────────────────────────────────────────────────

const SEVERITY: Record<string, KitTone> = { critique: 'error', majeur: 'warning' };
const JOB: Record<string, [string, KitTone]> = {
  ok: ['Réussi', 'success'],
  running: ['En cours', 'info'],
  failed: ['Échec', 'error'],
};

/** Supervision (`MonitoringExample` Flutter) : KPI, services, incidents, tâches planifiées. */
export function MonitoringExample() {
  const { kit } = useKitTheme();
  const degraded = MON_SERVICES.filter((s) => s[4] !== 'up').length;
  return (
    <ExPage maxWidth={1280}>
      <ExHeader
        title="État des services"
        subtitle={degraded === 0 ? 'Tous les systèmes sont opérationnels' : `${degraded} services à surveiller`}
      />
      <ResponsiveGrid minItemWidth={220}>
        {MON_KPIS.map(([label, value, unit, icon, hint]) => (
          <KpiCard key={label} icon={icon} value={value} unit={unit || undefined} label={`${label} · ${hint}`} />
        ))}
      </ResponsiveGrid>
      <View style={styles.h16} />
      <KitCard padding={0}>
        {MON_SERVICES.map(([id, name, group, icon, health, uptime, latency]) => {
          const [label, tone] = MON_HEALTH[health];
          return (
            <ExTile
              key={id}
              leading={<Icon source={icon} size={24} color={toneText(tone, kit)} />}
              title={name}
              subtitle={`${group} · ${uptime.toFixed(2).replace('.', ',')} % · ${latency === 0 ? '—' : `${latency} ms`}`}
              trailing={<StatusBadge label={label} tone={tone} uppercase={false} />}
            />
          );
        })}
      </KitCard>
      <View style={styles.h16} />
      <ExHeading title="Incidents" />
      {MON_INCIDENTS.map(([ref, title, sev, status, start, service, owner]) => (
        <View key={ref} style={styles.mb8}>
          <KitCard>
            <View style={styles.wrap}>
              <Text style={[font('400', 12, 'mono'), { color: kit.textMuted }]}>{ref}</Text>
              <StatusBadge label={sev} tone={SEVERITY[sev] ?? 'info'} uppercase={false} />
              <StatusBadge label={status} tone={status === 'résolu' ? 'success' : 'neutral'} uppercase={false} />
            </View>
            <Text style={[font('600', 14), styles.mt4, { color: kit.textPrimary }]}>{title}</Text>
            <Text style={[font('400', 12), { color: kit.textMuted }]}>{`${service} · ${owner} · ${start}`}</Text>
          </KitCard>
        </View>
      ))}
      <View style={styles.h16} />
      <ExHeading title="Tâches planifiées" />
      <KitCard padding={0}>
        {MON_JOBS.map(([name, plan, last, duration, status]) => (
          <ExTile
            key={name}
            leading={<Icon source="mi:schedule" size={24} color={kit.textSecondary} />}
            title={name}
            subtitle={`${plan} · ${last} · ${duration}`}
            trailing={<StatusBadge label={JOB[status]![0]} tone={JOB[status]![1]} uppercase={false} />}
          />
        ))}
      </KitCard>
    </ExPage>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  rowGap4: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowGap8: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  rowGap12: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2 },
  pad4: { padding: space.s1 },
  pad16: { padding: space.s4 },
  h16: { height: space.s4 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: space.s2 },
  mt12: { marginTop: space.s3 },
  mb8: { marginBottom: space.s2 },
  lh: { lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, marginBottom: space.s4 },
  visual: { height: 110, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: space.s2, left: space.s2 },
  column: { marginRight: space.s3, borderRadius: radius.lg, flexGrow: 0 },
  columnInner: { padding: space.s3, gap: space.s2 },
  moduleIcon: { padding: space.s3, borderRadius: radius.md },
  crumbs: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: space.s3 },
  fmColumn: { width: 240, borderRightWidth: 1 },
  preview: { width: 260, padding: space.s4 },
});
