import { useRef, useState, type ComponentRef } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import { date as fmtDate, dayMonth, time, weekday } from '../../core/format';
import { KitIconButton } from '../../mobile/KitIconButton';
import { font, mix, radius, space, toneColor, toneLight, useKitTheme, withAlpha } from '../../theme';
import { KitAvatar } from '../core/Avatars';
import { StatusBadge } from '../core/Badges';
import { KitButton } from '../core/Button';
import { KitCard } from '../core/Card';
import { KitProgressBar, ResponsiveGrid } from '../core/Layout';
import { EmptyState } from '../core/States';
import { SegmentedToggle } from '../core/Toggles';
import { DragArea, Draggable, DropTarget } from '../interaction/DragDrop';
import { FilterDropdown } from '../inputs/Selects';
import { KitSlider } from '../inputs/Slider';
import { KitTextField } from '../inputs/TextField';
import { KitBottomSheet } from '../overlays/Overlays';
import {
  MONTHS_CAP,
  WEEKDAYS,
  addDays,
  anchorOf,
  daysBetween,
  isLate,
  itemColor,
  sameDay,
  startOfDay,
  startOfWeek,
  type PlanningColumn,
  type PlanningFilter,
  type PlanningFilterState,
  type PlanningGroup,
  type PlanningItem,
} from './models';

// ── Barre d'outils ─────────────────────────────────────────────────

/** Barre d'outils commune : recherche, filtres déclaratifs, « En retard » — chaque bloc est optionnel. */
export function PlanningToolbar({
  state,
  onChange,
  filters = [],
  search = true,
  lateToggle = true,
  count,
}: {
  state: PlanningFilterState;
  onChange: (s: PlanningFilterState) => void;
  filters?: PlanningFilter[];
  search?: boolean;
  lateToggle?: boolean;
  count?: number;
}) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.gap8}>
      {search ? (
        <KitTextField
          hint="Rechercher…"
          icon="mi:search"
          value={state.search}
          onChangeText={(v) => onChange({ ...state, search: v })}
        />
      ) : null}
      {filters.length || lateToggle ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarRow}>
          {filters.map((f) => (
            <FilterDropdown
              key={f.key}
              label={f.label}
              value={state.values[f.key] ?? 'all'}
              allValue="all"
              options={[{ value: 'all', label: f.allLabel ?? 'Tous' }, ...f.options]}
              onChange={(v) => onChange({ ...state, values: { ...state.values, [f.key]: v } })}
            />
          ))}
          {lateToggle ? (
            <TouchableRipple
              onPress={() => onChange({ ...state, lateOnly: !state.lateOnly })}
              borderless
              hitSlop={{ top: 8, bottom: 8 }}
              accessibilityRole="button"
              accessibilityState={{ selected: state.lateOnly }}
              style={[styles.lateChip, { backgroundColor: state.lateOnly ? kit.errorLight : kit.fieldBg }]}
            >
              <View style={styles.rowGap4}>
                <Icon source="mi:alarm" size={16} color={state.lateOnly ? kit.errorText : kit.textSecondary} />
                <Text style={[font('500', 13), { color: state.lateOnly ? kit.errorText : kit.textPrimary }]}>
                  En retard
                </Text>
              </View>
            </TouchableRipple>
          ) : null}
          {count !== undefined ? (
            <Text style={[font('400', 12), { color: kit.textMuted }]}>{`${count} élément(s)`}</Text>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

// ── Carte et fiche ─────────────────────────────────────────────────

/** Carte d'un élément (kanban, notes, vue groupée) : bord coloré, référence, badge, progression, échéance. */
export function PlanningCard({
  item,
  onPress,
  compact = false,
}: {
  item: PlanningItem;
  onPress?: () => void;
  compact?: boolean;
}) {
  const { kit } = useKitTheme();
  const late = isLate(item);
  const col = itemColor(item, kit);
  const body = (
    <View style={[styles.cardInner, { borderLeftColor: col }]}>
      <View style={styles.rowCenter}>
        <Text numberOfLines={1} style={[font('400', 11, 'mono'), styles.fill, { color: kit.textMuted }]}>
          {item.ref ?? ''}
        </Text>
        {item.badge ? <StatusBadge label={item.badge} tone={item.badgeTone ?? 'neutral'} /> : null}
      </View>
      <Text
        numberOfLines={2}
        style={[
          font('600', 13.5),
          styles.mt4,
          { lineHeight: 17.5, color: item.done ? kit.textMuted : kit.textPrimary },
          item.done && styles.strike,
        ]}
      >
        {item.title}
      </Text>
      {!compact && item.description ? (
        <Text numberOfLines={2} style={[font('400', 12), styles.mt4, { color: kit.textSecondary }]}>
          {item.description}
        </Text>
      ) : null}
      {item.progress && !item.done ? (
        <View style={styles.mt8}>
          <KitProgressBar value={item.progress / 100} height={4} tone={item.tone ?? 'primary'} />
        </View>
      ) : null}
      <View style={[styles.rowCenter, styles.mt8]}>
        <View style={[styles.fill, styles.wrap6]}>
          {item.due ? (
            <View style={styles.rowGap3}>
              <Icon source={late ? 'mi:alarm' : 'mi:event'} size={14} color={late ? kit.errorText : kit.textMuted} />
              <Text style={[font(late ? '700' : '400', 11.5), { color: late ? kit.errorText : kit.textMuted }]}>
                {dayMonth(item.due)}
              </Text>
            </View>
          ) : null}
          {(item.tags ?? []).map((t) => (
            <StatusBadge key={t} label={t} tone="error" uppercase={false} />
          ))}
        </View>
        {item.assignee ? <KitAvatar name={item.assignee} size={24} /> : null}
      </View>
    </View>
  );
  const frame = [
    styles.card,
    { backgroundColor: kit.card, borderColor: late ? withAlpha(kit.error, 0.45) : kit.border },
  ];
  return onPress ? (
    <TouchableRipple
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.ref ?? ''} ${item.title}${late ? ', en retard' : ''}`}
      style={frame}
    >
      {body}
    </TouchableRipple>
  ) : (
    <View style={frame}>{body}</View>
  );
}

/** Fiche détaillée d'un élément en feuille basse (`showPlanningItem` Flutter). */
export function PlanningItemSheet({
  item,
  statusLabel,
  onDismiss,
}: {
  item: PlanningItem | null;
  statusLabel?: string;
  onDismiss: () => void;
}) {
  const { kit } = useKitTheme();
  const meta = (icon: string, text: string) => (
    <View key={icon + text} style={styles.rowGap4}>
      <Icon source={icon} size={16} color={kit.textMuted} />
      <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{text}</Text>
    </View>
  );
  return (
    <KitBottomSheet visible={item !== null} onDismiss={onDismiss}>
      {item ? (
        <View style={styles.sheet}>
          <View style={styles.rowCenter}>
            <View style={[styles.dot12, { backgroundColor: itemColor(item, kit) }]} />
            {item.ref ? (
              <Text style={[font('400', 12, 'mono'), styles.ml8, { color: kit.textMuted }]}>{item.ref}</Text>
            ) : null}
            <View style={styles.fill} />
            {isLate(item) ? (
              <StatusBadge label="En retard" tone="error" icon="mi:alarm" />
            ) : item.done ? (
              <StatusBadge label="Terminé" tone="success" />
            ) : null}
          </View>
          <Text accessibilityRole="header" style={[font('600', 19, 'heading'), styles.mt8, { color: kit.textPrimary }]}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={[font('400', 14), styles.mt6, { lineHeight: 21, color: kit.textSecondary }]}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.metaWrap}>
            {statusLabel ? meta('mi:flag', statusLabel) : null}
            {item.assignee ? meta('mi:person-outline', item.assignee) : null}
            {item.start
              ? meta(
                  'mi:play-circle-outline',
                  `${fmtDate(item.start)} à ${time(item.start.getHours(), item.start.getMinutes())}`,
                )
              : null}
            {item.end ? meta('stop-circle-outline', fmtDate(item.end)) : null}
            {item.due ? meta('mi:event', `Échéance ${fmtDate(item.due)}`) : null}
            {item.progress !== undefined ? meta('mi:donut-large', `${item.progress} %`) : null}
          </View>
        </View>
      ) : null}
    </KitBottomSheet>
  );
}

// ── Kanban ─────────────────────────────────────────────────────────

/**
 * Kanban (`KanbanBoard` Flutter) : colonnes défilant horizontalement (≈ 82 % de l'écran) ; appui long sur
 * une carte pour la glisser dans une autre colonne — ou action « Déplacer vers… » au lecteur d'écran.
 */
export function KanbanBoard({
  columns,
  items,
  onMove,
  height = 460,
}: {
  columns: PlanningColumn[];
  items: PlanningItem[];
  onMove: (item: PlanningItem, status: string) => void;
  height?: number;
}) {
  const { kit } = useKitTheme();
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState<{ item: PlanningItem; label: string } | null>(null);
  const colW = Math.min(300, (width - 2 * space.m - 2 * space.m) * 0.82);
  return (
    <DragArea>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kanban}
        style={{ height }}
      >
        {columns.map((col) => {
          const its = items.filter((i) => i.status === col.key);
          return (
            <DropTarget
              key={col.key}
              id={col.key}
              accepts={(d) => (d as PlanningItem).status !== col.key}
              onDrop={(d) => onMove(d as PlanningItem, col.key)}
              style={{ width: colW }}
            >
              {(hover) => (
                <View
                  style={[
                    styles.column,
                    {
                      height,
                      backgroundColor: hover ? toneLight(col.tone, kit) : withAlpha(kit.hover, 0.5),
                      borderColor: hover ? toneColor(col.tone, kit) : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.columnHead}>
                    <View style={[styles.dot10, { backgroundColor: toneColor(col.tone, kit) }]} />
                    <Text accessibilityRole="header" style={[font('700', 14), styles.fill, { color: kit.textPrimary }]}>
                      {col.label}
                    </Text>
                    <View style={[styles.countPill, { backgroundColor: kit.card }]}>
                      <Text style={[font('700', 12), { color: kit.textSecondary }]}>{its.length}</Text>
                    </View>
                  </View>
                  {its.length === 0 ? (
                    <View style={styles.dropHere}>
                      <Text style={[font('400', 12), { color: kit.textMuted }]}>Déposez ici</Text>
                    </View>
                  ) : (
                    <ScrollView nestedScrollEnabled contentContainerStyle={styles.columnList}>
                      {its.map((it) => (
                        <Draggable
                          key={it.id}
                          data={it}
                          width={colW - 16}
                          ghost={<PlanningCard item={it} compact />}
                          onPress={() => setOpen({ item: it, label: col.label })}
                          accessibilityLabel={`${it.ref ?? ''} ${it.title}, ${col.label}`}
                          accessibilityActions={columns
                            .filter((c) => c.key !== col.key)
                            .map((c) => ({ name: c.key, label: `Déplacer vers ${c.label}` }))}
                          onAccessibilityAction={(name) => onMove(it, name)}
                        >
                          <PlanningCard item={it} compact />
                        </Draggable>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
            </DropTarget>
          );
        })}
      </ScrollView>
      <PlanningItemSheet item={open?.item ?? null} statusLabel={open?.label} onDismiss={() => setOpen(null)} />
    </DragArea>
  );
}

// ── Gantt ──────────────────────────────────────────────────────────

/** Gantt (`GanttTimeline` Flutter) : libellés fixes, jours défilants, zoom, week-ends, ligne « aujourd'hui ». */
export function GanttTimeline({
  items,
  groups,
  days = 21,
  dayWidth = 44,
  startOffset = -7,
}: {
  items: PlanningItem[];
  groups?: PlanningGroup[];
  days?: number;
  dayWidth?: number;
  startOffset?: number;
}) {
  const { kit } = useKitTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [dayW, setDayW] = useState(dayWidth);
  const [open, setOpen] = useState<PlanningItem | null>(null);
  const today = startOfDay(new Date());
  const start = addDays(today, startOffset);
  const ROW = 46;
  const HEAD = 46;
  const rows = groups
    ? groups.map((g) => ({
        label: g.label,
        sub: g.subtitle,
        icon: g.icon,
        tone: g.tone ?? 'primary',
        items: items.filter((i) => i.group === g.key),
      }))
    : items.map((i) => ({ label: i.title, sub: i.ref, icon: undefined, tone: i.tone ?? 'primary', items: [i] }));
  const x = (d: Date) => daysBetween(start, d) * dayW;
  const todayX = x(today) + dayW / 2;
  const goToday = () => scroll.current?.scrollTo({ x: Math.max(0, (-startOffset - 2) * dayW), animated: true });
  return (
    <View style={styles.gap8}>
      <View style={styles.rowCenter}>
        <Text style={[font('400', 12), { color: kit.textSecondary }]}>Zoom</Text>
        <View style={styles.fill}>
          <KitSlider
            value={dayW}
            min={26}
            max={72}
            onChange={setDayW}
            accessibilityLabel="Zoom du Gantt"
            valueText={`${Math.round(dayW)} px par jour`}
          />
        </View>
        <KitButton label="Aujourd’hui" icon="mi:today" variant="ghost" size="compact" onPress={goToday} />
      </View>
      <View style={[styles.gantt, { borderColor: kit.border, backgroundColor: kit.card }]}>
        <View style={styles.ganttLabels}>
          <View style={[styles.ganttHead, { height: HEAD, backgroundColor: kit.tableHeader }]}>
            <Text style={[styles.ganttHeadText, { color: kit.textSecondary }]}>{groups ? 'RESSOURCE' : 'PHASE'}</Text>
          </View>
          {rows.map((r) => (
            <View
              key={r.label}
              style={[styles.ganttLabel, { height: ROW, borderTopColor: kit.border, borderRightColor: kit.border }]}
            >
              {r.icon ? <Icon source={r.icon} size={16} color={toneColor(r.tone, kit)} /> : null}
              <View style={styles.fill}>
                <Text numberOfLines={1} style={[font('600', 12), { color: kit.textPrimary }]}>
                  {r.label}
                </Text>
                {r.sub ? (
                  <Text numberOfLines={1} style={[font('400', 11, 'mono'), { color: kit.textMuted }]}>
                    {r.sub}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
        <ScrollView
          ref={scroll}
          horizontal
          style={styles.fill}
          contentOffset={{ x: Math.max(0, (-startOffset - 2) * dayW), y: 0 }}
          nestedScrollEnabled
        >
          <View style={{ width: days * dayW, height: HEAD + rows.length * ROW }}>
            {Array.from({ length: days }, (_, i) => {
              const day = addDays(start, i);
              const wd = (day.getDay() + 6) % 7;
              return (
                <View key={i}>
                  {wd >= 5 ? (
                    <View
                      style={[
                        styles.abs,
                        {
                          left: i * dayW,
                          top: HEAD,
                          width: dayW,
                          height: rows.length * ROW,
                          backgroundColor: withAlpha(kit.hover, 0.6),
                        },
                      ]}
                    />
                  ) : null}
                  <View
                    style={[
                      styles.abs,
                      styles.dayHead,
                      { left: i * dayW, width: dayW, height: HEAD, backgroundColor: kit.tableHeader },
                    ]}
                  >
                    <Text style={[font('400', 11), { color: kit.textMuted }]}>
                      {(WEEKDAYS[wd] ?? '').slice(0, dayW < 36 ? 1 : 3)}
                    </Text>
                    <Text style={[font('700', 12.5), { color: sameDay(day, today) ? kit.primary : kit.textPrimary }]}>
                      {day.getDate()}
                    </Text>
                  </View>
                </View>
              );
            })}
            {rows.map((r, ri) => (
              <View
                key={`line-${ri}`}
                style={[
                  styles.abs,
                  { left: 0, right: 0, top: HEAD + ri * ROW, height: 1, backgroundColor: kit.border },
                ]}
              />
            ))}
            {rows.flatMap((r, ri) =>
              r.items
                .filter((it) => it.start)
                .map((it) => {
                  const s = it.start as Date;
                  const col = itemColor(it, kit);
                  const late = isLate(it);
                  return (
                    <TouchableRipple
                      key={it.id}
                      onPress={() => setOpen(it)}
                      accessibilityRole="button"
                      accessibilityLabel={`${it.title}, du ${fmtDate(s)} au ${fmtDate(it.end ?? s)}${late ? ', en retard' : ''}`}
                      style={[
                        styles.abs,
                        styles.bar,
                        {
                          left: x(s) + 2,
                          top: HEAD + ri * ROW + 9,
                          width: Math.max(dayW - 4, x(it.end ?? s) - x(s) + dayW - 4),
                          height: ROW - 18,
                          backgroundColor: withAlpha(col, it.done ? 0.35 : 0.18),
                          borderColor: late ? kit.error : col,
                          borderWidth: late ? 1.5 : 1,
                        },
                      ]}
                    >
                      <View style={styles.fill}>
                        {it.progress ? (
                          <View
                            style={[
                              styles.barProgress,
                              { width: `${it.progress}%`, backgroundColor: withAlpha(col, 0.35) },
                            ]}
                          />
                        ) : null}
                        <Text numberOfLines={1} style={[font('600', 11), styles.barText, { color: kit.textPrimary }]}>
                          {it.title}
                        </Text>
                      </View>
                    </TouchableRipple>
                  );
                }),
            )}
            <View
              style={[
                styles.abs,
                { left: todayX - 1, top: HEAD, width: 2, height: rows.length * ROW, backgroundColor: kit.error },
              ]}
            />
            <View
              style={[styles.abs, styles.todayDot, { left: todayX - 4, top: HEAD - 4, backgroundColor: kit.error }]}
            />
          </View>
        </ScrollView>
      </View>
      <PlanningItemSheet item={open} onDismiss={() => setOpen(null)} />
    </View>
  );
}

// ── Notes ──────────────────────────────────────────────────────────

/** Grille de notes (post-it) : colonnes adaptatives, cocher pour terminer (`NoteGrid` Flutter). */
export function NoteGrid({ items, onToggle }: { items: PlanningItem[]; onToggle: (it: PlanningItem) => void }) {
  const { kit, colorMode } = useKitTheme();
  const [open, setOpen] = useState<PlanningItem | null>(null);
  return (
    <>
      <ResponsiveGrid minItemWidth={150} spacing={10}>
        {items.map((it) => {
          const col = itemColor(it, kit);
          const late = isLate(it);
          return (
            <TouchableRipple
              key={it.id}
              onPress={() => setOpen(it)}
              accessibilityRole="button"
              accessibilityLabel={it.title}
              style={[
                styles.note,
                {
                  backgroundColor: mix(col, kit.card, colorMode === 'dark' ? 0.16 : 0.12),
                  borderColor: withAlpha(col, 0.3),
                },
              ]}
            >
              <View>
                <View style={styles.rowCenter}>
                  <Text style={[font('400', 11, 'mono'), styles.fill, { color: kit.textMuted }]}>{it.ref ?? ''}</Text>
                  <TouchableRipple
                    onPress={() => onToggle(it)}
                    borderless
                    hitSlop={12}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: !!it.done }}
                    accessibilityLabel={`Terminer ${it.title}`}
                  >
                    <Icon
                      source={it.done ? 'mi:check-circle' : 'mi:radio-button-unchecked'}
                      size={20}
                      color={it.done ? kit.success : kit.textMuted}
                    />
                  </TouchableRipple>
                </View>
                <Text
                  numberOfLines={3}
                  style={[font('600', 13), styles.mt6, { color: kit.textPrimary }, it.done && styles.strike]}
                >
                  {it.title}
                </Text>
                {it.due ? (
                  <Text
                    style={[
                      font(late ? '700' : '400', 11),
                      styles.mt8,
                      { color: late ? kit.errorText : kit.textMuted },
                    ]}
                  >
                    {dayMonth(it.due)}
                  </Text>
                ) : null}
              </View>
            </TouchableRipple>
          );
        })}
      </ResponsiveGrid>
      <PlanningItemSheet item={open} onDismiss={() => setOpen(null)} />
    </>
  );
}

// ── Vue groupée ────────────────────────────────────────────────────

/** Vue groupée : une section repliable par groupe — technicien, véhicule… (`GroupedBoard` Flutter). */
export function GroupedBoard({ groups, items }: { groups: PlanningGroup[]; items: PlanningItem[] }) {
  const { kit } = useKitTheme();
  const [expanded, setExpanded] = useState<string[]>(groups[0] ? [groups[0].key] : []);
  const [open, setOpen] = useState<PlanningItem | null>(null);
  return (
    <View style={styles.gap12}>
      {groups.map((g) => {
        const its = items.filter((i) => i.group === g.key);
        const on = expanded.includes(g.key);
        return (
          <KitCard key={g.key} padding={0}>
            <TouchableRipple
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
                setExpanded((e) => (on ? e.filter((k) => k !== g.key) : [...e, g.key]));
              }}
              accessibilityRole="button"
              accessibilityState={{ expanded: on }}
              style={styles.groupHead}
            >
              <View style={styles.rowGap12}>
                <KitAvatar name={g.label} tone={g.tone} size={36} />
                <View style={styles.fill}>
                  <Text style={[font('700', 14), { color: kit.textPrimary }]}>{g.label}</Text>
                  <Text
                    style={[font('400', 12.5), { color: kit.textSecondary }]}
                  >{`${g.subtitle ?? ''} · ${its.length} élément(s)`}</Text>
                </View>
                <Icon source={on ? 'mi:expand-less' : 'mi:expand-more'} size={24} color={kit.textSecondary} />
              </View>
            </TouchableRipple>
            {on ? (
              <View style={styles.groupBody}>
                {its.length ? (
                  its.map((it) => <PlanningCard key={it.id} item={it} compact onPress={() => setOpen(it)} />)
                ) : (
                  <Text style={[styles.pad8, { color: kit.textMuted }]}>Aucun élément</Text>
                )}
              </View>
            ) : null}
          </KitCard>
        );
      })}
      <PlanningItemSheet item={open} onDismiss={() => setOpen(null)} />
    </View>
  );
}

// ── Calendrier mensuel ─────────────────────────────────────────────

/** Calendrier mensuel : grille compacte à pastilles, liste du jour sélectionné (`MonthCalendar` Flutter). */
export function MonthCalendar({ items }: { items: PlanningItem[] }) {
  const { kit } = useKitTheme();
  const [today] = useState(() => startOfDay(new Date()));
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);
  const [open, setOpen] = useState<PlanningItem | null>(null);
  const gridStart = startOfWeek(month);
  const on = (d: Date) =>
    items.filter((i) => {
      const a = anchorOf(i);
      return a ? sameDay(a, d) : false;
    });
  const dayItems = on(selected);
  return (
    <View>
      <View style={styles.rowCenter}>
        <KitIconButton
          icon="mi:chevron-left"
          accessibilityLabel="Mois précédent"
          iconColor={kit.textSecondary}
          onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        />
        <Text
          accessibilityRole="header"
          style={[font('700', 17, 'heading'), styles.fill, styles.center, { color: kit.textPrimary }]}
        >
          {`${MONTHS_CAP[month.getMonth()]} ${month.getFullYear()}`}
        </Text>
        <KitIconButton
          icon="mi:chevron-right"
          accessibilityLabel="Mois suivant"
          iconColor={kit.textSecondary}
          onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        />
      </View>
      <View style={styles.row}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={[font('700', 11), styles.fill, styles.center, { color: kit.textMuted }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.mt6}>
        {Array.from({ length: 6 }, (_, wk) => (
          <View key={wk} style={styles.row}>
            {Array.from({ length: 7 }, (_, dd) => {
              const day = addDays(gridStart, wk * 7 + dd);
              const inMonth = day.getMonth() === month.getMonth();
              const its = on(day);
              const sel = sameDay(day, selected);
              const isToday = sameDay(day, today);
              return (
                <TouchableRipple
                  key={dd}
                  onPress={() => setSelected(day)}
                  borderless
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  accessibilityLabel={`${weekday(day)}${its.length ? `, ${its.length} élément(s)` : ''}`}
                  style={[
                    styles.calCell,
                    { backgroundColor: sel ? kit.primary : isToday ? kit.primaryLight : 'transparent' },
                  ]}
                >
                  <View style={styles.centerItems}>
                    <Text
                      style={[
                        font(isToday || sel ? '700' : '500', 13),
                        { color: sel ? kit.onPrimary : inMonth ? kit.textPrimary : withAlpha(kit.textMuted, 0.5) },
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                    <View style={styles.dots}>
                      {its.slice(0, 3).map((it) => (
                        <View
                          key={it.id}
                          style={[styles.dot5, { backgroundColor: sel ? kit.onPrimary : itemColor(it, kit) }]}
                        />
                      ))}
                    </View>
                  </View>
                </TouchableRipple>
              );
            })}
          </View>
        ))}
      </View>
      <View style={[styles.divider, { backgroundColor: kit.border }]} />
      <Text accessibilityLiveRegion="polite" style={[font('700', 14), styles.mb8, { color: kit.textPrimary }]}>
        {weekday(selected)}
      </Text>
      {dayItems.length === 0 ? (
        <Text style={[font('400', 13), { color: kit.textMuted }]}>Aucun élément ce jour.</Text>
      ) : (
        <View style={styles.gap8}>
          {dayItems.map((it) => (
            <PlanningCard key={it.id} item={it} compact onPress={() => setOpen(it)} />
          ))}
        </View>
      )}
      <PlanningItemSheet item={open} onDismiss={() => setOpen(null)} />
    </View>
  );
}

// ── Agenda ─────────────────────────────────────────────────────────

/**
 * Agenda (`AgendaView` Flutter) : bande de la semaine + chronologie horaire du jour (chevauchements en
 * colonnes, ligne de l'heure courante) ou liste de la semaine.
 */
export function AgendaView({
  items,
  startHour = 7,
  endHour = 19,
}: {
  items: PlanningItem[];
  startHour?: number;
  endHour?: number;
}) {
  const { kit } = useKitTheme();
  const [now] = useState(() => new Date());
  const today = startOfDay(now);
  const [day, setDay] = useState(today);
  const [week, setWeek] = useState(false);
  const [open, setOpen] = useState<PlanningItem | null>(null);
  const [w, setW] = useState(0);
  const weekStart = startOfWeek(day);
  const onDay = (d: Date) => items.filter((i) => i.start && sameDay(i.start, d));
  const HOUR = 52;
  const GUTTER = 46;
  const its = onDay(day);
  const allDay = its.filter((i) => i.start?.getHours() === 0 && !i.end);
  const timed = its
    .filter((i) => !allDay.includes(i))
    .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
  const laneEnds: number[] = [];
  const lanes = new Map<string, number>();
  for (const it of timed) {
    const s = it.start?.getTime() ?? 0;
    const e = it.end?.getTime() ?? s + 3600000;
    let lane = laneEnds.findIndex((end) => end <= s);
    if (lane < 0) {
      lane = laneEnds.length;
      laneEnds.push(e);
    } else laneEnds[lane] = e;
    lanes.set(it.id, lane);
  }
  const laneW = (w - GUTTER - 4) / Math.max(1, laneEnds.length);
  const y = (d: Date) => (d.getHours() + d.getMinutes() / 60 - startHour) * HOUR;
  return (
    <View>
      <View style={styles.rowCenter}>
        <KitIconButton
          icon="mi:chevron-left"
          accessibilityLabel="Semaine précédente"
          iconColor={kit.textSecondary}
          onPress={() => setDay(addDays(day, -7))}
        />
        <Text
          accessibilityRole="header"
          style={[font('700', 14), styles.fill, styles.center, { color: kit.textPrimary }]}
        >
          {`Semaine du ${dayMonth(weekStart)}`}
        </Text>
        <KitIconButton
          icon="mi:chevron-right"
          accessibilityLabel="Semaine suivante"
          iconColor={kit.textSecondary}
          onPress={() => setDay(addDays(day, 7))}
        />
      </View>
      <View style={styles.row}>
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(weekStart, i);
          const sel = sameDay(d, day) && !week;
          const n = onDay(d).length;
          return (
            <TouchableRipple
              key={i}
              onPress={() => {
                setDay(d);
                setWeek(false);
              }}
              borderless
              accessibilityRole="button"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={`${weekday(d)}${n ? `, ${n} rendez-vous` : ''}`}
              style={[
                styles.weekDay,
                {
                  backgroundColor: sel ? kit.primary : kit.card,
                  borderColor: sameDay(d, today) ? kit.primary : kit.border,
                },
              ]}
            >
              <View style={styles.centerItems}>
                <Text style={[font('400', 11), { color: sel ? kit.onPrimary : kit.textMuted }]}>{WEEKDAYS[i]}</Text>
                <Text style={[font('700', 16), { color: sel ? kit.onPrimary : kit.textPrimary }]}>{d.getDate()}</Text>
                <View
                  style={[
                    styles.dot5,
                    styles.mt2,
                    { backgroundColor: n === 0 ? 'transparent' : sel ? kit.onPrimary : kit.primary },
                  ]}
                />
              </View>
            </TouchableRipple>
          );
        })}
      </View>
      <View style={styles.agendaToggle}>
        <SegmentedToggle
          value={week ? 'week' : 'day'}
          onChange={(v) => setWeek(v === 'week')}
          options={[
            { value: 'day', label: 'Jour', icon: 'mi:view-day' },
            { value: 'week', label: 'Liste semaine', icon: 'mi:view-agenda' },
          ]}
        />
      </View>
      {week ? (
        <View>
          {Array.from({ length: 7 }, (_, i) => {
            const d = addDays(weekStart, i);
            const list = onDay(d).sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
            if (!list.length) return null;
            return (
              <View key={i}>
                <Text style={[styles.weekHead, { color: kit.textMuted }]}>{weekday(d).toUpperCase()}</Text>
                {list.map((it) => (
                  <TouchableRipple
                    key={it.id}
                    onPress={() => setOpen(it)}
                    accessibilityRole="button"
                    style={styles.weekRow}
                  >
                    <View style={styles.rowGap12}>
                      <Text style={[font('700', 14), styles.w48, { color: kit.textSecondary }]}>
                        {it.start && it.start.getHours() === 0 && !it.end
                          ? 'Jour'
                          : it.start
                            ? time(it.start.getHours(), it.start.getMinutes())
                            : ''}
                      </Text>
                      <View style={styles.fill}>
                        <Text style={[font('500', 14), { color: kit.textPrimary }]}>{it.title}</Text>
                        {it.assignee ? (
                          <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{it.assignee}</Text>
                        ) : null}
                      </View>
                      <View style={[styles.bar4, { backgroundColor: itemColor(it, kit) }]} />
                    </View>
                  </TouchableRipple>
                ))}
              </View>
            );
          })}
        </View>
      ) : (
        <View>
          {allDay.map((it) => (
            <View
              key={it.id}
              style={[
                styles.allDay,
                { backgroundColor: withAlpha(itemColor(it, kit), 0.15), borderLeftColor: itemColor(it, kit) },
              ]}
            >
              <Text style={[font('600', 12.5), { color: kit.textPrimary }]}>{`Journée · ${it.title}`}</Text>
            </View>
          ))}
          {timed.length === 0 && allDay.length === 0 ? (
            <EmptyState compact icon="mi:event-available" title="Journée libre" subtitle="Aucun rendez-vous ce jour." />
          ) : null}
          {timed.length || !allDay.length ? (
            <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: (endHour - startHour) * HOUR }}>
              {Array.from({ length: endHour - startHour }, (_, k) => (
                <View key={k} style={[styles.abs, styles.hourRow, { top: k * HOUR }]}>
                  <Text
                    style={[font('400', 11), { width: GUTTER, color: kit.textMuted }]}
                  >{`${String(startHour + k).padStart(2, '0')}:00`}</Text>
                  <View style={[styles.fill, styles.h1, { backgroundColor: kit.border }]} />
                </View>
              ))}
              {w > 0
                ? timed.map((it) => {
                    const s = it.start as Date;
                    const e = it.end ?? new Date(s.getTime() + 3600000);
                    const col = itemColor(it, kit);
                    return (
                      <TouchableRipple
                        key={it.id}
                        onPress={() => setOpen(it)}
                        accessibilityRole="button"
                        accessibilityLabel={`${it.title}, ${time(s.getHours(), s.getMinutes())}${it.end ? ` à ${time(it.end.getHours(), it.end.getMinutes())}` : ''}`}
                        style={[
                          styles.abs,
                          styles.event,
                          {
                            top: y(s) + 1,
                            left: GUTTER + (lanes.get(it.id) ?? 0) * laneW,
                            width: laneW - 3,
                            height: Math.max(26, y(e) - y(s) - 2),
                            backgroundColor: mix(col, kit.card, 0.18),
                            borderLeftColor: col,
                          },
                        ]}
                      >
                        <View>
                          <Text numberOfLines={2} style={[font('700', 11.5), { color: kit.textPrimary }]}>
                            {it.title}
                          </Text>
                          <Text numberOfLines={1} style={[font('400', 11), { color: kit.textSecondary }]}>
                            {`${time(s.getHours(), s.getMinutes())}${it.end ? ` – ${time(it.end.getHours(), it.end.getMinutes())}` : ''}`}
                          </Text>
                        </View>
                      </TouchableRipple>
                    );
                  })
                : null}
              {sameDay(now, day) && now.getHours() >= startHour && now.getHours() < endHour ? (
                <View pointerEvents="none" style={[styles.abs, styles.nowRow, { top: y(now), left: GUTTER - 4 }]}>
                  <View style={[styles.dot8, { backgroundColor: kit.error }]} />
                  <View style={[styles.fill, styles.h2, { backgroundColor: kit.error }]} />
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
      <PlanningItemSheet item={open} onDismiss={() => setOpen(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowGap3: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rowGap4: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowGap12: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wrap6: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  gap8: { gap: space.s2 },
  gap12: { gap: space.s3 },
  center: { textAlign: 'center' },
  centerItems: { alignItems: 'center' },
  strike: { textDecorationLine: 'line-through' },
  mt2: { marginTop: 2 },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: space.s2 },
  mb8: { marginBottom: space.s2 },
  ml8: { marginLeft: space.s2 },
  pad8: { padding: space.s2 },
  w48: { width: 48 },
  h1: { height: 1 },
  h2: { height: 2 },
  abs: { position: 'absolute' },
  toolbarRow: { alignItems: 'center', gap: space.s2 },
  lateChip: { borderRadius: radius.sm, minHeight: 32, paddingHorizontal: space.s3, justifyContent: 'center' },
  card: { borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' },
  cardInner: { borderLeftWidth: 4, padding: space.s3 },
  sheet: { paddingHorizontal: space.s5, paddingBottom: space.s5 },
  metaWrap: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 8, marginTop: 14 },
  dot12: { width: 12, height: 12, borderRadius: 6 },
  dot10: { width: 10, height: 10, borderRadius: 5 },
  dot8: { width: 8, height: 8, borderRadius: 4 },
  dot5: { width: 5, height: 5, borderRadius: 2.5 },
  kanban: { gap: 10 },
  column: { borderRadius: radius.md, borderWidth: 1.5 },
  columnHead: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: space.s3, paddingBottom: space.s2 },
  countPill: { paddingHorizontal: space.s2, paddingVertical: 1, borderRadius: 999 },
  dropHere: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  columnList: { paddingHorizontal: space.s2, paddingBottom: space.s2, gap: 8 },
  gantt: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  ganttLabels: { width: 118 },
  ganttHead: { justifyContent: 'center', paddingLeft: space.s3 },
  ganttHeadText: { ...font('700', 11), letterSpacing: 0.5 },
  ganttLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.s3,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  dayHead: { top: 0, alignItems: 'center', justifyContent: 'center' },
  bar: { borderRadius: radius.sm, overflow: 'hidden', justifyContent: 'center' },
  barProgress: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  barText: { paddingHorizontal: space.s2, marginTop: 6 },
  todayDot: { width: 8, height: 8, borderRadius: 4 },
  note: {
    minHeight: 130,
    padding: space.s3,
    borderWidth: 1,
    borderTopLeftRadius: radius.xs,
    borderTopRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.xs,
  },
  groupHead: { paddingHorizontal: space.s4, paddingVertical: space.s3 },
  groupBody: { paddingHorizontal: space.s3, paddingBottom: space.s3, gap: space.s2 },
  calCell: { flex: 1, height: 48, margin: 1.5, borderRadius: radius.md, justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 2, marginTop: 3, height: 5 },
  divider: { height: 1, marginVertical: 12 },
  weekDay: { flex: 1, marginHorizontal: 2, paddingVertical: space.s2, borderRadius: radius.md, borderWidth: 1 },
  agendaToggle: { flexDirection: 'row', justifyContent: 'flex-end', marginVertical: space.s2 },
  weekHead: { ...font('700', 11), letterSpacing: 0.6, marginTop: space.s2, marginBottom: space.s2 },
  weekRow: { minHeight: 56, justifyContent: 'center' },
  bar4: { width: 4, height: 32, borderRadius: 2 },
  allDay: {
    borderLeftWidth: 3,
    borderRadius: radius.xs,
    paddingHorizontal: space.s3,
    paddingVertical: space.s2,
    marginBottom: space.s2,
  },
  hourRow: { left: 0, right: 0, flexDirection: 'row', alignItems: 'center' },
  event: {
    borderLeftWidth: 3,
    borderRadius: radius.xs,
    paddingHorizontal: space.s2,
    paddingVertical: space.s1,
    overflow: 'hidden',
  },
  nowRow: { right: 0, flexDirection: 'row', alignItems: 'center' },
});
