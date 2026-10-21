import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon, Menu, TouchableRipple } from 'react-native-paper';

import { KitIconButton } from '../../mobile/KitIconButton';
import { breakpoints, font, radius, space, tabular, useKitTheme, withAlpha } from '../../theme';
import { KitCard } from '../core/Card';
import { SkeletonListTile } from '../core/Skeleton';
import { EmptyState } from '../core/States';
import { ViewModeToggle, type ViewMode } from '../core/Toggles';
import { KitCheckbox } from '../inputs/Choice';
import { KitSearchBar } from '../inputs/TextField';
import { KitPaginator } from '../navigation/Navigation';

/** Colonne d'un tableau du kit (`KitColumn` Flutter). */
export interface KitColumn<T> {
  label: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | Date;
  width?: number;
  numeric?: boolean;
  hidden?: boolean;
  /** Valeur de la ligne de total (pied de tableau). */
  total?: (rows: T[]) => string;
  /** Édition en ligne : appelé au toucher de la cellule (marquée ✎). */
  onEdit?: (row: T) => void;
}

/** Action groupée sur la sélection. */
export interface BulkAction {
  id: string;
  label: string;
  icon: string;
  danger?: boolean;
}

/**
 * Tableau de données mobile (`KitDataTable` Flutter) : recherche, tri, sélection multiple et actions groupées,
 * colonnes masquables, total, pagination ; vue cartes (appui long pour sélectionner) ou tableau défilant
 * à première colonne fixe.
 */
export function KitDataTable<T>({
  rows,
  columns,
  cardBuilder,
  keyOf,
  searchText,
  selectable = false,
  bulkActions = [],
  onBulk,
  pageSize: initialPageSize = 8,
  initialMode = 'list',
  onRowPress,
  loading = false,
  emptyTitle = 'Aucun résultat',
  emptySubtitle = 'Ajustez vos critères de recherche.',
  columnToggle = false,
  dense = false,
}: {
  rows: T[];
  columns: KitColumn<T>[];
  cardBuilder: (row: T, selected: boolean) => ReactNode;
  keyOf: (row: T) => string;
  searchText?: (row: T) => string;
  selectable?: boolean;
  bulkActions?: BulkAction[];
  onBulk?: (action: string, rows: T[]) => void;
  pageSize?: number;
  initialMode?: ViewMode;
  onRowPress?: (row: T) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  columnToggle?: boolean;
  dense?: boolean;
}) {
  const { kit } = useKitTheme();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [asc, setAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const [sel, setSel] = useState<string[]>([]);
  const [hidden, setHidden] = useState(() => columns.flatMap((c, i) => (c.hidden ? [i] : [])));
  const [colMenu, setColMenu] = useState(false);

  let all = rows;
  const query = q.trim().toLowerCase();
  if (query && searchText) all = all.filter((r) => searchText(r).toLowerCase().includes(query));
  const sortFn = sortCol !== null ? columns[sortCol]?.sortValue : undefined;
  if (sortFn) {
    const v = (r: T) => {
      const x = sortFn(r);
      return x instanceof Date ? x.getTime() : x;
    };
    all = [...all].sort((a, b) => {
      const x = v(a);
      const y = v(b);
      const c = typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y, 'fr') : Number(x) - Number(y);
      return asc ? c : -c;
    });
  }
  const pages = Math.max(1, Math.ceil(all.length / pageSize));
  const current = Math.min(page, pages);
  const shown = all.slice((current - 1) * pageSize, current * pageSize);
  const cols = columns.map((_, i) => i).filter((i) => !hidden.includes(i));
  const isSel = (r: T) => sel.includes(keyOf(r));
  const toggle = (r: T) => setSel((s) => (s.includes(keyOf(r)) ? s.filter((k) => k !== keyOf(r)) : [...s, keyOf(r)]));

  const sortBy = (i: number) => {
    if (sortCol === i) {
      if (asc) setAsc(false);
      else setSortCol(null);
    } else {
      setSortCol(i);
      setAsc(true);
    }
  };

  const toolbar = (
    <View style={styles.toolbar}>
      {searchText ? (
        <View style={styles.fill}>
          <KitSearchBar
            hint="Rechercher…"
            value={q}
            onChangeText={(v) => {
              setQ(v);
              setPage(1);
            }}
          />
        </View>
      ) : (
        <View style={styles.fill} />
      )}
      {columnToggle && mode === 'list' ? (
        <Menu
          visible={colMenu}
          onDismiss={() => setColMenu(false)}
          anchor={
            <KitIconButton
              icon="mi:view-column"
              accessibilityLabel="Colonnes"
              iconColor={kit.textSecondary}
              onPress={() => setColMenu(true)}
            />
          }
        >
          {columns.slice(1).map((c, k) => {
            const i = k + 1;
            const on = !hidden.includes(i);
            return (
              <Menu.Item
                key={c.label}
                title={c.label}
                leadingIcon={on ? 'mi:check' : 'mi:check-box-outline-blank'}
                onPress={() => setHidden((h) => (on ? [...h, i] : h.filter((x) => x !== i)))}
              />
            );
          })}
        </Menu>
      ) : null}
      <ViewModeToggle mode={mode} showLabels={false} onChange={setMode} />
    </View>
  );

  const selection = sel.length ? (
    <View style={[styles.selBar, { backgroundColor: kit.primaryLight, borderColor: withAlpha(kit.primary, 0.3) }]}>
      <Text
        accessibilityLiveRegion="polite"
        style={[font('700', 14), styles.fill, { color: kit.primary }]}
      >{`${sel.length} sélectionné(s)`}</Text>
      {bulkActions.map((a) => (
        <KitIconButton
          key={a.id}
          icon={a.icon}
          accessibilityLabel={a.label}
          iconColor={a.danger ? kit.error : kit.primary}
          onPress={() => {
            onBulk?.(a.id, rows.filter(isSel));
            setSel([]);
          }}
        />
      ))}
      <KitIconButton
        icon="mi:close"
        accessibilityLabel="Désélectionner"
        iconColor={kit.textSecondary}
        onPress={() => setSel([])}
      />
    </View>
  ) : null;

  const rowH = dense ? 44 : 52;
  const hasTotal = columns.some((c) => c.total);
  const allSel = shown.length > 0 && shown.every(isSel);
  const someSel = shown.some(isSel);

  const header = (i: number) => {
    const c = columns[i];
    if (!c) return null;
    const on = sortCol === i;
    return (
      <TouchableRipple
        key={c.label}
        onPress={c.sortValue ? () => sortBy(i) : undefined}
        disabled={!c.sortValue}
        accessibilityRole="button"
        accessibilityLabel={`${c.label}${on ? (asc ? ', tri croissant' : ', tri décroissant') : ''}`}
        style={[styles.th, { width: c.width ?? 140, alignItems: c.numeric ? 'flex-end' : 'flex-start' }]}
      >
        <View style={styles.thRow}>
          <Text numberOfLines={1} style={[styles.thText, { color: on ? kit.primary : kit.textSecondary }]}>
            {c.label.toUpperCase()}
          </Text>
          {on ? <Icon source={asc ? 'mi:arrow-upward' : 'mi:arrow-downward'} size={14} color={kit.primary} /> : null}
        </View>
      </TouchableRipple>
    );
  };
  const cell = (i: number, r: T) => {
    const c = columns[i];
    if (!c) return null;
    const content = (
      <View
        style={[styles.td, { width: c.width ?? 140, height: rowH, alignItems: c.numeric ? 'flex-end' : 'flex-start' }]}
      >
        {typeof c.cell(r) === 'string' ? (
          <Text numberOfLines={1} style={[font('400', 13), c.numeric && tabular, { color: kit.textPrimary }]}>
            {c.cell(r)}
          </Text>
        ) : (
          c.cell(r)
        )}
      </View>
    );
    if (!c.onEdit) return <View key={c.label}>{content}</View>;
    return (
      <TouchableRipple
        key={c.label}
        onPress={() => c.onEdit?.(r)}
        accessibilityRole="button"
        accessibilityLabel={`Modifier ${c.label}`}
      >
        <View>
          {content}
          <View style={styles.editMark}>
            <Icon source="mi:edit" size={11} color={kit.textMuted} />
          </View>
        </View>
      </TouchableRipple>
    );
  };
  const rowBg = (r: T) => ({ backgroundColor: isSel(r) ? kit.primaryLight : kit.card, borderTopColor: kit.divider });
  const firstIdx = cols[0] ?? 0;
  const rest = cols.slice(1);
  const selW = selectable ? 44 : 0;

  const table = (
    <View style={[styles.table, { backgroundColor: kit.card }]}>
      <View style={[styles.firstCol, { borderRightColor: kit.divider }]}>
        <View style={[styles.rowFlex, { backgroundColor: kit.tableHeader }]}>
          {selectable ? (
            <View style={[styles.selCell, { width: selW }]}>
              <KitCheckbox
                value={allSel ? true : someSel ? null : false}
                accessibilityLabel="Tout sélectionner"
                onChange={() =>
                  setSel((s) =>
                    allSel
                      ? s.filter((k) => !shown.some((r) => keyOf(r) === k))
                      : [...new Set([...s, ...shown.map(keyOf)])],
                  )
                }
              />
            </View>
          ) : null}
          {header(firstIdx)}
        </View>
        {shown.map((r) => (
          <TouchableRipple
            key={keyOf(r)}
            onPress={onRowPress ? () => onRowPress(r) : undefined}
            disabled={!onRowPress}
            style={[styles.tr, rowBg(r)]}
          >
            <View style={styles.rowFlex}>
              {selectable ? (
                <View style={[styles.selCell, { width: selW }]}>
                  <KitCheckbox
                    value={isSel(r)}
                    onChange={() => toggle(r)}
                    accessibilityLabel={`Sélectionner la ligne`}
                  />
                </View>
              ) : null}
              {cell(firstIdx, r)}
            </View>
          </TouchableRipple>
        ))}
        {hasTotal ? (
          <View
            style={[
              styles.totalCell,
              {
                backgroundColor: kit.tableHeader,
                borderTopColor: kit.divider,
                width: selW + (columns[firstIdx]?.width ?? 140),
              },
            ]}
          >
            <Text style={[font('700', 12.5), { color: kit.textPrimary }]}>{`Total (${all.length})`}</Text>
          </View>
        ) : null}
      </View>
      <ScrollView horizontal style={styles.fill} showsHorizontalScrollIndicator>
        <View>
          <View style={[styles.rowFlex, { backgroundColor: kit.tableHeader }]}>{rest.map(header)}</View>
          {shown.map((r) => (
            <View key={keyOf(r)} style={[styles.rowFlex, styles.tr, rowBg(r)]}>
              {rest.map((i) => cell(i, r))}
            </View>
          ))}
          {hasTotal ? (
            <View
              style={[
                styles.rowFlex,
                styles.totalRow,
                { backgroundColor: kit.tableHeader, borderTopColor: kit.divider },
              ]}
            >
              {rest.map((i) => (
                <View
                  key={i}
                  style={[
                    styles.td,
                    {
                      width: columns[i]?.width ?? 140,
                      height: 44,
                      alignItems: columns[i]?.numeric ? 'flex-end' : 'flex-start',
                    },
                  ]}
                >
                  <Text style={[font('700', 12.5), tabular, { color: kit.textPrimary }]}>
                    {columns[i]?.total?.(all) ?? ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View>
      {toolbar}
      {selection}
      {loading ? (
        <View>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonListTile key={i} />
          ))}
        </View>
      ) : all.length === 0 ? (
        <KitCard>
          <EmptyState compact icon="mi:search-off" title={emptyTitle} subtitle={emptySubtitle} />
        </KitCard>
      ) : mode === 'card' ? (
        <View style={styles.cards}>
          {shown.map((r) => (
            <TouchableRipple
              key={keyOf(r)}
              borderless
              style={styles.cardTouch}
              onLongPress={selectable ? () => toggle(r) : undefined}
              onPress={sel.length ? () => toggle(r) : onRowPress ? () => onRowPress(r) : undefined}
              accessibilityRole="button"
              accessibilityState={selectable ? { selected: isSel(r) } : undefined}
              accessibilityHint={selectable ? 'Appui long pour sélectionner' : undefined}
            >
              <View>{cardBuilder(r, isSel(r))}</View>
            </TouchableRipple>
          ))}
          {selectable ? (
            <Text style={[font('400', 11.5), { color: kit.textMuted }]}>
              Appui long sur une carte pour la sélectionner.
            </Text>
          ) : null}
        </View>
      ) : (
        table
      )}
      <View style={styles.mt8}>
        <KitPaginator
          page={current}
          pageSize={pageSize}
          total={all.length}
          compact={width < breakpoints.sm}
          onPage={setPage}
          onPageSize={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  mt8: { marginTop: space.s2 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: space.s2, marginBottom: 10 },
  selBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingLeft: space.s3,
    paddingRight: space.s1,
    marginBottom: space.s3,
  },
  table: { flexDirection: 'row', borderRadius: radius.md, overflow: 'hidden' },
  firstCol: { borderRightWidth: 1 },
  rowFlex: { flexDirection: 'row', alignItems: 'center' },
  selCell: { alignItems: 'center', justifyContent: 'center' },
  th: { height: 44, paddingHorizontal: space.s3, justifyContent: 'center' },
  thRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  thText: { ...font('700', 11), letterSpacing: 0.5, flexShrink: 1 },
  td: { paddingHorizontal: space.s3, justifyContent: 'center' },
  tr: { borderTopWidth: 1 },
  editMark: { position: 'absolute', right: 2, top: 4 },
  totalCell: { height: 44, paddingHorizontal: space.s3, justifyContent: 'center', borderTopWidth: 1.5 },
  totalRow: { borderTopWidth: 1.5 },
  cards: { gap: space.s3 },
  cardTouch: { borderRadius: radius.card },
});
