import { createContext, useContext, useState, type ReactNode } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon, RadioButton, SegmentedButtons, TouchableRipple } from 'react-native-paper';

import {
  DateField,
  DemoArt,
  DemoFilePicker,
  ExpansionTile,
  FormFieldLabel,
  GanttTimeline,
  KanbanBoard,
  KitAvatar,
  KitBottomSheet,
  KitButton,
  KitChart,
  KitCheckbox,
  KitChip,
  KitMap,
  KitProgressBar,
  KitSlider,
  KitTextField,
  KitTimeline,
  MonthCalendar,
  AgendaView,
  CheckboxTile,
  CountDot,
  RatingInput,
  ResponsiveGrid,
  SearchableSelect,
  Sparkline,
  StatusBadge,
  SwitchTile,
  TextDiff,
  TrendChip,
  markdownInline,
  type PlanningItem,
} from '../components';
import { date as fmtDate, number } from '../core/format';
import { useKitSnack } from '../core/snack';
import { CodeBlock } from '../showcase/doc/Demo';
import {
  font,
  radius,
  space,
  tabular,
  toneColor,
  toneLight,
  toneText,
  useKitTheme,
  withAlpha,
  type KitTone,
} from '../theme';
import {
  attachmentIcon,
  leavesOf,
  type HzAttachment,
  type HzColumn,
  type HzField,
  type HzOption,
  type HzSlide,
  type HzTreeNode,
  type HzValue,
  type HzValues,
  type HzW,
  type JsonValue,
} from './models';

/** Rendu des widgets de réponse du Harnais (`hz_widgets.dart`). */

/** Rappels vers le store (réponses interactives, formulaires). */
export interface HzActions {
  onAnswer: (w: HzW, option: HzOption) => void;
  onSubmit: (form: HzW, values: HzValues, summary: string) => void;
  busy: boolean;
}

const ActionsContext = createContext<HzActions>({ onAnswer: () => undefined, onSubmit: () => undefined, busy: false });
export const HzActionsProvider = ActionsContext.Provider;
const useActions = () => useContext(ActionsContext);

type Of<T extends HzW['type']> = Extract<HzW, { type: T }>;

/** Cadre commun d'un widget : carte arrondie, en-tête icône / titre / sous-titre. */
export function HzFrame({
  w,
  children,
  pad = 'body',
  trailing,
}: {
  w: HzW;
  children: ReactNode;
  /** Marges du contenu : normales, latérales réduites, ou nulles (tableaux, cartes). */
  pad?: 'body' | 'tight' | 'none';
  trailing?: ReactNode;
}) {
  const { kit } = useKitTheme();
  const head = w.title != null;
  return (
    <View style={[styles.frame, { backgroundColor: kit.card, borderColor: kit.border }]}>
      {head ? (
        <View style={styles.frameHead}>
          {w.icon ? (
            <View style={[styles.frameIcon, { backgroundColor: kit.primaryLight }]}>
              <Icon source={w.icon} size={17} color={kit.primary} />
            </View>
          ) : null}
          <View style={styles.flex}>
            <Text style={[font('700', 14.5, 'heading'), { color: kit.textPrimary }]}>{w.title}</Text>
            {w.subtitle ? <Text style={[font('400', 11.5), { color: kit.textMuted }]}>{w.subtitle}</Text> : null}
          </View>
          {trailing}
        </View>
      ) : null}
      <View style={!head ? styles.padAll : pad === 'body' ? styles.padBody : pad === 'tight' ? styles.padTight : null}>
        {children}
      </View>
    </View>
  );
}

/** Rendu d'un widget selon son type. */
export function HzWidgetView({ w }: { w: HzW }) {
  const { kit } = useKitTheme();
  switch (w.type) {
    case 'stats':
      return <Stats w={w} />;
    case 'chart':
      return (
        <HzFrame w={w}>
          <KitChart
            kind={w.kind}
            labels={w.labels}
            series={w.series}
            unit={w.unit}
            height={w.kind === 'hbar' ? 190 : 200}
          />
        </HzFrame>
      );
    case 'table':
      return (
        <HzFrame w={w} pad="none">
          <HzTable w={w} />
        </HzFrame>
      );
    case 'map':
      return (
        <HzFrame w={w} pad="none">
          <KitMap height={280} radius={0} markers={w.markers} fitToContent legend={w.legend} />
        </HzFrame>
      );
    case 'form':
      return (
        <HzFrame w={w}>
          <HzForm w={w} />
        </HzFrame>
      );
    case 'choices':
      return <Choices w={w} />;
    case 'records':
      return (
        <HzFrame w={w} pad="tight">
          {w.items.map((r) => (
            <View key={r.title} style={styles.record}>
              <KitAvatar name={r.title} tone={r.tone} size={38} />
              <View style={styles.flex}>
                <Text style={[font('600', 14), { color: kit.textPrimary }]}>{r.title}</Text>
                <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>
                  {[r.subtitle, r.meta].filter(Boolean).join(' · ')}
                </Text>
                {r.tags?.length ? (
                  <View style={[styles.wrap, styles.gap4, styles.mt4]}>
                    {r.tags.map((t) => (
                      <StatusBadge key={t} label={t} uppercase={false} />
                    ))}
                  </View>
                ) : null}
              </View>
              {r.badge ? <StatusBadge label={r.badge} tone={r.badgeTone} uppercase={false} /> : null}
            </View>
          ))}
        </HzFrame>
      );
    case 'timeline':
      return (
        <HzFrame w={w}>
          <KitTimeline dense items={w.items} />
        </HzFrame>
      );
    case 'callout':
      return (
        <View
          style={[styles.callout, { backgroundColor: toneLight(w.tone, kit), borderLeftColor: toneColor(w.tone, kit) }]}
        >
          <Icon source={w.icon} size={20} color={toneColor(w.tone, kit)} />
          <View style={styles.flex}>
            <Text style={[font('700', 14), { color: toneText(w.tone, kit) }]}>{w.title}</Text>
            <Text style={[font('400', 13), styles.mt2, { color: kit.textPrimary, lineHeight: 19 }]}>{w.text}</Text>
          </View>
        </View>
      );
    case 'calendar':
      return (
        <HzFrame w={w}>
          <MonthCalendar items={w.items} />
        </HzFrame>
      );
    case 'kanban':
      return (
        <HzFrame w={w}>
          <HzKanban w={w} />
        </HzFrame>
      );
    case 'gantt':
      return (
        <HzFrame w={w}>
          <GanttTimeline items={w.items} groups={w.groups} days={18} dayWidth={36} startOffset={-4} />
        </HzFrame>
      );
    case 'agenda':
      return (
        <HzFrame w={w}>
          <AgendaView items={w.items} />
        </HzFrame>
      );
    case 'tree':
      return (
        <HzFrame w={w}>
          <HzTree w={w} />
        </HzFrame>
      );
    case 'carousel':
      return (
        <HzFrame w={w} pad="none">
          <Carousel slides={w.slides} />
        </HzFrame>
      );
    case 'modal':
      return <HzModal w={w} />;
    case 'tabs':
      return (
        <HzFrame w={w} pad="none">
          <HzTabs w={w} />
        </HzFrame>
      );
    case 'accordion':
      return (
        <HzFrame w={w} pad="none">
          {w.items.map(([title, icon, open, blocks]) => (
            <Accordion key={title} title={title} icon={icon} open={open} blocks={blocks} />
          ))}
        </HzFrame>
      );
    case 'steps':
      return (
        <HzFrame w={w}>
          <Steps w={w} />
        </HzFrame>
      );
    case 'keyvalue':
      return (
        <HzFrame w={w}>
          <KeyValues w={w} />
        </HzFrame>
      );
    case 'checklist':
      return (
        <HzFrame w={w}>
          <Checklist items={w.items} />
        </HzFrame>
      );
    case 'progress':
      return (
        <HzFrame w={w}>
          {w.items.map((m) => (
            <View key={m.label} style={styles.meter}>
              <View style={styles.row}>
                <Text style={[font('500', 13), styles.flex, { color: kit.textPrimary }]}>{m.label}</Text>
                <Text style={[font('400', 12), tabular, { color: kit.textSecondary }]}>
                  {`${number(m.value)}${m.unit ?? ''} / ${number(m.target)}${m.unit ?? ''}`}
                </Text>
              </View>
              <KitProgressBar value={m.value / m.target} tone={m.tone} height={7} />
            </View>
          ))}
        </HzFrame>
      );
    case 'diff':
      return (
        <HzFrame w={w}>
          <TextDiff before={w.before} after={w.after} fileName={w.file} mono />
        </HzFrame>
      );
    case 'json':
      return <JsonWidget w={w} />;
    case 'sources':
      return (
        <HzFrame w={w}>
          <Sources w={w} />
        </HzFrame>
      );
    case 'tags':
      return (
        <HzFrame w={w}>
          <View style={[styles.wrap, styles.gap6]}>
            {w.items.map(([label, count, tone]) => (
              <View key={label} style={[styles.tag, { backgroundColor: toneLight(tone ?? 'neutral', kit) }]}>
                <Text style={[font('600', 12), { color: toneText(tone ?? 'neutral', kit) }]}>
                  {count == null ? label : `${label} · ${count}`}
                </Text>
              </View>
            ))}
          </View>
        </HzFrame>
      );
    case 'heatmap':
      return (
        <HzFrame w={w}>
          <Heatmap w={w} />
        </HzFrame>
      );
    case 'files':
      return (
        <HzFrame w={w} pad="tight">
          <Files w={w} />
        </HzFrame>
      );
    case 'cards':
      return (
        <HzFrame w={w}>
          <Cards w={w} />
        </HzFrame>
      );
    case 'compare':
      return (
        <HzFrame w={w} pad="none">
          <Compare w={w} />
        </HzFrame>
      );
    case 'approval':
      return <Approval w={w} />;
    case 'upload':
      return (
        <HzFrame w={w}>
          <Upload w={w} />
        </HzFrame>
      );
    case 'paragraph': {
      const base = { ...font('400', 13.5), lineHeight: 21, color: kit.textPrimary };
      return <Text style={base}>{markdownInline(w.text, base, kit)}</Text>;
    }
  }
}

/** Liste verticale de widgets imbriqués (onglets, accordéon, modale). */
function Blocks({ blocks, gap = space.s3 }: { blocks: HzW[]; gap?: number }) {
  return (
    <View style={{ gap }}>
      {blocks.map((b) => (
        <HzWidgetView key={b.id} w={b} />
      ))}
    </View>
  );
}

// ── Indicateurs ─────────────────────────────────────────────────────

function Stats({ w }: { w: Of<'stats'> }) {
  const { kit } = useKitTheme();
  return (
    <ResponsiveGrid minItemWidth={150} spacing={8}>
      {w.items.map((s) => (
        <View key={s.label} style={[styles.stat, { backgroundColor: kit.card, borderColor: kit.border }]}>
          <View style={[styles.row, styles.gap6]}>
            {s.icon ? <Icon source={s.icon} size={16} color={toneColor(s.tone, kit)} /> : null}
            <Text numberOfLines={1} style={[font('400', 11.5), styles.flex, { color: kit.textSecondary }]}>
              {s.label}
            </Text>
          </View>
          <Text numberOfLines={1} style={[font('700', 20, 'heading'), styles.mt4, { color: kit.textPrimary }]}>
            {s.value}
          </Text>
          <View style={[styles.row, styles.gap4]}>
            {s.delta ? (
              <TrendChip text={s.delta} up={s.up ?? true} goodWhenUp={s.tone !== 'error' && s.tone !== 'warning'} />
            ) : null}
            {s.hint ? (
              <Text numberOfLines={1} style={[font('400', 11), styles.shrink, { color: kit.textMuted }]}>
                {s.hint}
              </Text>
            ) : null}
          </View>
          {s.spark ? (
            <View style={styles.mt6}>
              <Sparkline data={s.spark} color={toneColor(s.tone, kit)} height={26} />
            </View>
          ) : null}
        </View>
      ))}
    </ResponsiveGrid>
  );
}

// ── Tableau ─────────────────────────────────────────────────────────

const colWidth = (c: HzColumn) =>
  c.kind === 'person' ? 190 : c.kind === 'progress' ? 140 : c.kind === 'badge' || c.kind === 'number' ? 120 : 110;

function HzTable({ w }: { w: Of<'table'> }) {
  const { kit } = useKitTheme();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: string; asc: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = w.pageSize ?? 100;
  let rows = q
    ? w.rows.filter((r) => Object.values(r).some((v) => `${v}`.toLowerCase().includes(q.toLowerCase())))
    : [...w.rows];
  if (sort) {
    rows = rows.sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : `${x}`.localeCompare(`${y}`);
      return sort.asc ? r : -r;
    });
  }
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * pageSize, current * pageSize);

  const cell = (col: HzColumn, v: string | number | undefined) => {
    const base = [font('400', 12.5), { color: kit.textPrimary }];
    switch (col.kind) {
      case 'person':
        return (
          <View style={[styles.row, styles.gap6]}>
            <KitAvatar name={`${v}`} size={24} />
            <Text numberOfLines={1} style={[font('600', 12.5), styles.shrink, { color: kit.textPrimary }]}>
              {v}
            </Text>
          </View>
        );
      case 'number':
        return <Text style={[base, tabular]}>{`${number(Number(v))}${col.unit ?? ''}`}</Text>;
      case 'badge':
        return <StatusBadge label={`${v}`} tone={col.tones?.[`${v}`] ?? 'neutral'} uppercase={false} />;
      case 'progress': {
        const n = Number(v);
        return (
          <View style={[styles.row, styles.gap6]}>
            <View style={styles.flex}>
              <KitProgressBar value={n / 100} tone={n >= 80 ? 'success' : n >= 40 ? 'warning' : 'error'} />
            </View>
            <Text style={[font('400', 11.5), { color: kit.textPrimary }]}>{`${n} %`}</Text>
          </View>
        );
      }
      case 'mono':
        return <Text style={[font('400', 12, 'mono'), { color: kit.textPrimary }]}>{v}</Text>;
      default:
        return <Text style={base}>{v}</Text>;
    }
  };

  return (
    <View>
      {w.searchable ? (
        <View style={styles.tableSearch}>
          <KitTextField value={q} onChangeText={setQ} hint="Filtrer…" icon="mi:search" accessibilityLabel="Filtrer" />
        </View>
      ) : null}
      <ScrollView horizontal>
        <View>
          <View style={[styles.row, { backgroundColor: kit.tableHeader }]}>
            {w.columns.map((col) => {
              const on = sort?.key === col.key;
              return (
                <TouchableRipple
                  key={col.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Trier par ${col.label}`}
                  onPress={() => setSort(on ? { key: col.key, asc: !sort.asc } : { key: col.key, asc: true })}
                  style={[styles.th, { width: colWidth(col) }]}
                >
                  <View style={[styles.row, styles.gap4]}>
                    <Text
                      style={[
                        font('700', 10.5),
                        styles.shrink,
                        { letterSpacing: 0.4, color: on ? kit.primary : kit.textSecondary },
                      ]}
                    >
                      {col.label.toUpperCase()}
                    </Text>
                    {on ? (
                      <Icon source={sort.asc ? 'mi:arrow-upward' : 'mi:arrow-downward'} size={13} color={kit.primary} />
                    ) : null}
                  </View>
                </TouchableRipple>
              );
            })}
          </View>
          {shown.map((r, i) => (
            <View key={i} style={[styles.row, { borderTopWidth: 1, borderTopColor: kit.border }]}>
              {w.columns.map((col) => (
                <View key={col.key} style={[styles.td, { width: colWidth(col) }]}>
                  {cell(col, r[col.key])}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      {rows.length === 0 ? (
        <Text style={[font('400', 13), styles.empty, { color: kit.textMuted }]}>Aucune ligne</Text>
      ) : null}
      {pages > 1 ? (
        <View style={[styles.row, styles.pager]}>
          <Text style={[font('400', 12), styles.flex, { color: kit.textMuted }]}>{`${rows.length} lignes`}</Text>
          <PagerButton
            icon="mi:chevron-left"
            label="Page précédente"
            onPress={current > 1 ? () => setPage(current - 1) : undefined}
          />
          <Text style={[font('400', 12.5), { color: kit.textPrimary }]}>{`${current} / ${pages}`}</Text>
          <PagerButton
            icon="mi:chevron-right"
            label="Page suivante"
            onPress={current < pages ? () => setPage(current + 1) : undefined}
          />
        </View>
      ) : null}
    </View>
  );
}

function PagerButton({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  const { kit } = useKitTheme();
  return (
    <TouchableRipple
      borderless
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!onPress}
      onPress={onPress}
      style={styles.pagerBtn}
    >
      <Icon source={icon} size={22} color={onPress ? kit.textPrimary : kit.disabledContent} />
    </TouchableRipple>
  );
}

// ── Planning ────────────────────────────────────────────────────────

function HzKanban({ w }: { w: Of<'kanban'> }) {
  const [items, setItems] = useState<PlanningItem[]>(w.items);
  return (
    <KanbanBoard
      height={330}
      columns={w.columns}
      items={items}
      onMove={(it, s) => setItems((l) => l.map((x) => (x.id === it.id ? { ...x, status: s, done: s === 'done' } : x)))}
    />
  );
}

// ── Formulaire ──────────────────────────────────────────────────────

function initialValues(w: Of<'form'>): HzValues {
  if (w.submitted) return w.submitted;
  const v: HzValues = {};
  for (const f of w.fields) if (f.value !== undefined) v[f.key] = Array.isArray(f.value) ? [...f.value] : f.value;
  return v;
}

const empty = (v: HzValue | undefined) => v == null || v === '';

function describe(f: HzField, v: HzValue | undefined): string {
  if (empty(v)) return '—';
  if (v instanceof Date) return fmtDate(v);
  if (typeof v === 'boolean') return v ? 'oui' : 'non';
  const label = (x: string) => f.options?.find((o) => o.value === x)?.label ?? x;
  if (Array.isArray(v)) return v.length ? v.map(label).join(', ') : '—';
  if (f.kind === 'rating') return `${Math.round(Number(v))} / 5`;
  if (f.kind === 'slider') return `${Math.round(Number(v))}${f.unit ?? ''}`;
  return label(`${v}`);
}

function HzForm({ w }: { w: Of<'form'> }) {
  const { kit } = useKitTheme();
  const actions = useActions();
  const [values, setValues] = useState<HzValues>(() => initialValues(w));
  const [errors, setErrors] = useState<string[]>([]);
  const readOnly = w.submitted != null;

  const set = (key: string) => (v: HzValue) => {
    setValues((s) => ({ ...s, [key]: v }));
    setErrors((e) => e.filter((k) => k !== key));
  };

  const submit = () => {
    const missing = w.fields.filter((f) => f.required && empty(values[f.key])).map((f) => f.key);
    setErrors(missing);
    if (missing.length) return;
    const summary = w.fields
      .filter((f) => !empty(values[f.key]))
      .map((f) => `${f.label} : ${describe(f, values[f.key])}`)
      .join('\n');
    actions.onSubmit(w, { ...values }, summary);
  };

  const field = (f: HzField) => {
    const v = values[f.key];
    const err = errors.includes(f.key) ? 'Champ obligatoire' : undefined;
    const opts = f.options ?? [];
    const onChange = set(f.key);
    switch (f.kind) {
      case 'toggle':
        return <SwitchTile title={f.label} value={v === true} onChange={onChange} />;
      case 'checkbox':
        return <CheckboxTile title={f.label} value={v === true} onChange={onChange} />;
      default:
        break;
    }
    let input: ReactNode;
    switch (f.kind) {
      case 'select':
        input = (
          <SearchableSelect<string>
            options={opts.map((o) => ({ value: o.value, label: o.label, icon: o.icon }))}
            value={typeof v === 'string' ? v : null}
            icon={f.icon}
            error={err}
            sheetTitle={f.label}
            onChange={onChange}
          />
        );
        break;
      case 'date':
        input = <DateField value={v instanceof Date ? v : null} error={err} onChange={onChange} />;
        break;
      case 'segmented':
        input = (
          <SegmentedButtons
            value={typeof v === 'string' ? v : (opts[0]?.value ?? '')}
            onValueChange={onChange}
            buttons={opts.map((o) => ({ value: o.value, label: o.label, icon: o.icon, labelStyle: font('500', 13) }))}
          />
        );
        break;
      case 'radio':
        input = (
          <View style={[styles.wrap, styles.gap4]}>
            {opts.map((o) => {
              const on = v === o.value;
              return (
                <TouchableRipple
                  key={o.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={o.label}
                  onPress={() => onChange(o.value)}
                  style={styles.radio}
                >
                  <View style={styles.row}>
                    <RadioButton.Android
                      value={o.value}
                      status={on ? 'checked' : 'unchecked'}
                      onPress={() => onChange(o.value)}
                      color={kit.primary}
                      uncheckedColor={kit.textSecondary}
                    />
                    <Text style={[font('400', 14), { color: kit.textPrimary }]}>{o.label}</Text>
                  </View>
                </TouchableRipple>
              );
            })}
          </View>
        );
        break;
      case 'chips': {
        const list = Array.isArray(v) ? v : [];
        input = (
          <View style={[styles.wrap, styles.gap6]}>
            {opts.map((o) => (
              <KitChip
                key={o.value}
                label={o.label}
                selected={list.includes(o.value)}
                onPress={() =>
                  onChange(list.includes(o.value) ? list.filter((x) => x !== o.value) : [...list, o.value])
                }
              />
            ))}
          </View>
        );
        break;
      }
      case 'slider': {
        const min = f.min ?? 0;
        const max = f.max ?? 100;
        input = (
          <View style={[styles.row, styles.gap6]}>
            <View style={styles.flex}>
              <KitSlider
                value={typeof v === 'number' ? v : min}
                min={min}
                max={max}
                divisions={f.step ? Math.round((max - min) / f.step) : undefined}
                accessibilityLabel={f.label}
                onChange={onChange}
              />
            </View>
            <Text style={[font('700', 14), { color: kit.textPrimary }]}>{describe(f, v)}</Text>
          </View>
        );
        break;
      }
      case 'rating':
        input = (
          <RatingInput
            value={typeof v === 'number' ? v : 0}
            onChange={onChange}
            labels={['Mauvais', 'Passable', 'Correct', 'Très bien', 'Excellent']}
          />
        );
        break;
      default:
        input = (
          <KitTextField
            value={typeof v === 'string' ? v : ''}
            onChangeText={onChange}
            hint={f.placeholder}
            icon={f.icon}
            lines={f.kind === 'textarea' ? 3 : undefined}
            errorText={err}
            accessibilityLabel={f.label}
          />
        );
    }
    return (
      <FormFieldLabel label={f.label} required={f.required}>
        {input}
      </FormFieldLabel>
    );
  };

  return (
    <View pointerEvents={readOnly ? 'none' : 'auto'} style={readOnly ? styles.readOnly : null}>
      {w.description ? (
        <Text style={[font('400', 13), styles.mb12, { color: kit.textSecondary }]}>{w.description}</Text>
      ) : null}
      {w.fields.map((f) => (
        <View key={f.key} style={styles.mb12}>
          {field(f)}
        </View>
      ))}
      {readOnly ? (
        <Done label="Envoyé" />
      ) : (
        <KitButton
          label={w.submitLabel ?? 'Envoyer'}
          icon="mi:send"
          expand
          onPress={actions.busy ? undefined : submit}
        />
      )}
    </View>
  );
}

function Done({ label, tone = 'success' }: { label: string; tone?: KitTone }) {
  const { kit } = useKitTheme();
  return (
    <View style={[styles.row, styles.gap6]}>
      <Icon source={tone === 'success' ? 'mi:check-circle' : 'mi:cancel'} size={18} color={toneColor(tone, kit)} />
      <Text style={[font('700', 14), styles.shrink, { color: toneText(tone, kit) }]}>{label}</Text>
    </View>
  );
}

// ── Réponses interactives ───────────────────────────────────────────

function Choices({ w }: { w: Of<'choices'> }) {
  const { kit } = useKitTheme();
  const actions = useActions();
  const done = w.selected != null;
  return (
    <View>
      {w.question ? <Text style={[font('600', 14), styles.mb8, { color: kit.textPrimary }]}>{w.question}</Text> : null}
      <View style={[styles.wrap, styles.gap8]}>
        {w.options.map((o) => (
          <KitChip
            key={o.value}
            label={o.label}
            icon={o.icon}
            iconColor={kit.primary}
            check={false}
            selected={w.selected === o.value}
            onPress={done || actions.busy ? undefined : () => actions.onAnswer(w, o)}
          />
        ))}
      </View>
    </View>
  );
}

function HzTree({ w }: { w: Of<'tree'> }) {
  const { kit } = useKitTheme();
  const actions = useActions();
  const [sel, setSel] = useState<string[]>(['c1', 'f1']);
  const [open, setOpen] = useState<string[]>(['contrats', 'factures']);
  const done = w.selected != null;
  const all = w.nodes.flatMap(leavesOf);

  const node = (n: HzTreeNode, depth: number): ReactNode[] => {
    const leaf = !n.children?.length;
    const expanded = open.includes(n.id);
    const ids = leavesOf(n).map((l) => l.id);
    const count = ids.filter((id) => sel.includes(id)).length;
    const state = count === 0 ? false : count === ids.length ? true : null;
    return [
      <TouchableRipple
        key={n.id}
        disabled={leaf}
        accessibilityLabel={n.label}
        onPress={() => setOpen((o) => (expanded ? o.filter((x) => x !== n.id) : [...o, n.id]))}
      >
        <View style={[styles.row, styles.treeRow, { paddingLeft: depth * 18 }]}>
          <View style={styles.treeChevron}>
            {leaf ? null : (
              <Icon source={expanded ? 'mi:expand-more' : 'mi:chevron-right'} size={18} color={kit.textSecondary} />
            )}
          </View>
          <KitCheckbox
            value={state}
            disabled={done}
            accessibilityLabel={`Inclure ${n.label}`}
            onChange={() =>
              setSel((s) => (state === true ? s.filter((x) => !ids.includes(x)) : [...new Set([...s, ...ids])]))
            }
          />
          <Icon source={n.icon} size={17} color={leaf ? kit.textSecondary : kit.warning} />
          <Text numberOfLines={1} style={[font(leaf ? '400' : '600', 13), styles.flex, { color: kit.textPrimary }]}>
            {n.label}
          </Text>
          {n.badge ? <StatusBadge label={n.badge} tone={n.badgeTone} uppercase={false} /> : null}
          {n.meta ? (
            <Text numberOfLines={1} style={[font('400', 11), styles.treeMeta, { color: kit.textMuted }]}>
              {n.meta}
            </Text>
          ) : null}
        </View>
      </TouchableRipple>,
      ...(expanded && !leaf ? (n.children ?? []).flatMap((c) => node(c, depth + 1)) : []),
    ];
  };

  return (
    <View>
      {w.nodes.flatMap((n) => node(n, 0))}
      <View style={styles.mt8}>
        {done ? (
          <Done label="Sélection envoyée" />
        ) : (
          <KitButton
            label={w.submitLabel ?? 'Valider'}
            icon="mi:summarize"
            expand
            onPress={
              sel.length === 0 || actions.busy
                ? undefined
                : () =>
                    actions.onAnswer(w, {
                      value: 'tree',
                      label: `${sel.length} pièce(s) : ${all
                        .filter((l) => sel.includes(l.id))
                        .map((l) => l.label)
                        .join(', ')}`,
                    })
            }
          />
        )}
      </View>
    </View>
  );
}

function Approval({ w }: { w: Of<'approval'> }) {
  const { kit } = useKitTheme();
  const actions = useActions();
  const risk = w.risk ?? 'warning';
  const answer = (value: string, label: string) =>
    actions.busy ? undefined : () => actions.onAnswer(w, { value, label });
  return (
    <View
      style={[
        styles.approval,
        { backgroundColor: toneLight(risk, kit), borderColor: withAlpha(toneColor(risk, kit), 0.4) },
      ]}
    >
      <View style={[styles.row, styles.gap8]}>
        <Icon source="mi:shield" size={24} color={toneColor(risk, kit)} />
        <Text style={[font('700', 14), styles.flex, { color: kit.textPrimary }]}>{w.title}</Text>
      </View>
      <Text style={[font('400', 13), styles.mt6, { color: kit.textSecondary }]}>{w.text}</Text>
      {w.command ? (
        <View style={styles.mt10}>
          <CodeBlock code={`$ ${w.command}`} rounded />
        </View>
      ) : null}
      <View style={styles.mt10}>
        {w.selected != null ? (
          w.selected === 'approve' ? (
            <Done label="Autorisé" />
          ) : (
            <Done label="Refusé" tone="error" />
          )
        ) : (
          <View style={[styles.row, styles.gap10]}>
            <KitButton
              label="Refuser"
              variant="outline"
              expand
              style={styles.flex}
              onPress={answer('deny', 'Refuser')}
            />
            <KitButton label="Autoriser" expand style={styles.flex} onPress={answer('approve', 'Autoriser')} />
          </View>
        )}
      </View>
    </View>
  );
}

function Upload({ w }: { w: Of<'upload'> }) {
  const { kit } = useKitTheme();
  const actions = useActions();
  const [picking, setPicking] = useState(false);
  if (w.selected != null) return <Done label={w.selected} />;
  return (
    <View>
      <TouchableRipple
        accessibilityRole="button"
        accessibilityLabel="Choisir un fichier"
        disabled={actions.busy}
        onPress={() => setPicking(true)}
        style={[styles.drop, { borderColor: withAlpha(kit.primary, 0.5) }]}
      >
        <View style={styles.center}>
          <Icon source="mi:cloud-upload" size={34} color={kit.primary} />
          <Text style={[font('700', 14), styles.mt6, { color: kit.primary }]}>Choisir un fichier</Text>
        </View>
      </TouchableRipple>
      {w.hint ? <Text style={[font('400', 11.5), styles.mt8, { color: kit.textMuted }]}>{w.hint}</Text> : null}
      <DemoFilePicker
        visible={picking}
        title="Fichier à analyser"
        onDismiss={() => setPicking(false)}
        onPick={(f) => {
          setPicking(false);
          actions.onAnswer(w, { value: f.name, label: f.name });
        }}
      />
    </View>
  );
}

// ── Navigation dans la réponse ──────────────────────────────────────

function Carousel({ slides }: { slides: HzSlide[] }) {
  const { kit } = useKitTheme();
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const item = Math.round(width * 0.86);
  return (
    <View style={styles.carousel} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <FlatList
          horizontal
          data={slides}
          keyExtractor={(s) => s.title}
          showsHorizontalScrollIndicator={false}
          snapToInterval={item}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: (width - item) / 2 }}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / item))}
          renderItem={({ item: s }) => (
            <View style={[styles.slideWrap, { width: item }]}>
              <View style={[styles.slide, { borderColor: kit.border, backgroundColor: kit.bg }]}>
                <View style={[styles.slideHead, { backgroundColor: toneLight(s.tone, kit) }]}>
                  {s.image === 'truck' ? (
                    <Image
                      source={require('../../assets/images/camion.png')}
                      resizeMode="contain"
                      style={styles.fill}
                    />
                  ) : s.icon ? (
                    <Icon source={s.icon} size={40} color={toneColor(s.tone, kit)} />
                  ) : null}
                  {s.tag ? (
                    <View style={styles.slideTag}>
                      <StatusBadge label={s.tag} tone={s.tone} uppercase={false} />
                    </View>
                  ) : null}
                </View>
                <View style={styles.slideBody}>
                  <Text style={[font('700', 14), { color: kit.textPrimary }]}>{s.title}</Text>
                  {s.text ? (
                    <Text numberOfLines={3} style={[font('400', 12), styles.flex, { color: kit.textSecondary }]}>
                      {s.text}
                    </Text>
                  ) : null}
                  <View style={[styles.wrap, styles.gap12]}>
                    {(s.stats ?? []).map(([l, v]) => (
                      <Text key={l} style={[font('400', 11.5), { color: kit.textSecondary }]}>
                        {`${l} : `}
                        <Text style={font('700', 11.5)}>{v}</Text>
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      ) : null}
      <View style={[styles.row, styles.dots]}>
        {slides.map((s, i) => (
          <View
            key={s.title}
            style={[
              styles.dot,
              { width: i === index ? 18 : 6, backgroundColor: i === index ? kit.primary : kit.border },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

/** Onglets à icône en ligne (`Tab(child: Row)` Flutter), défilables, pastille de compteur rouge. */
function HzTabs({ w }: { w: Of<'tabs'> }) {
  const { kit } = useKitTheme();
  const [index, setIndex] = useState(0);
  const blocks = w.tabs[index]?.[3] ?? [];
  return (
    <View>
      <View style={[styles.tabBar, { borderBottomColor: kit.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {w.tabs.map(([label, icon, badge], i) => {
            const on = i === index;
            const color = on ? kit.primary : kit.textSecondary;
            return (
              <TouchableRipple
                key={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setIndex(i)}
                style={styles.tab}
              >
                <View style={styles.tabInner}>
                  <View style={[styles.row, styles.gap6]}>
                    <Icon source={icon} size={16} color={color} />
                    <Text style={[font(on ? '600' : '500', 14), { color }]}>{label}</Text>
                    {badge ? <CountDot count={Number(badge)} tone="error" /> : null}
                  </View>
                  <View style={[styles.tabIndicator, on && { backgroundColor: kit.primary }]} />
                </View>
              </TouchableRipple>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.padAllS3}>
        <Blocks blocks={blocks} />
      </View>
    </View>
  );
}

function Accordion({ title, icon, open, blocks }: { title: string; icon: string; open: boolean; blocks: HzW[] }) {
  const [expanded, setExpanded] = useState(open);
  return (
    <ExpansionTile title={title} icon={icon} expanded={expanded} onToggle={setExpanded}>
      <Blocks blocks={blocks} gap={space.s2} />
    </ExpansionTile>
  );
}

function HzModal({ w }: { w: Of<'modal'> }) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState(false);
  return (
    <HzFrame w={w}>
      <Text style={[font('400', 13), { color: kit.textSecondary, lineHeight: 19 }]}>{w.summary}</Text>
      <View style={[styles.row, styles.mt10]}>
        <KitButton label={w.button ?? 'Ouvrir'} icon="mi:open-in-full" variant="tonal" onPress={() => setOpen(true)} />
      </View>
      <KitBottomSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        resizable={{ initial: 0.85, min: 0.5, max: 0.95 }}
      >
        <ScrollView contentContainerStyle={styles.sheetBody}>
          <Text style={[font('600', 20, 'heading'), { color: kit.textPrimary }]}>{w.dialogTitle}</Text>
          {w.dialogSubtitle ? (
            <Text style={[font('400', 13), { color: kit.textSecondary }]}>{w.dialogSubtitle}</Text>
          ) : null}
          <View style={styles.mt14}>
            <Blocks blocks={w.blocks} />
          </View>
        </ScrollView>
      </KitBottomSheet>
    </HzFrame>
  );
}

// ── Données ─────────────────────────────────────────────────────────

const STEP_COLORS = {
  done: (k: ReturnType<typeof useKitTheme>['kit']) => [k.primary, k.primary],
  current: (k: ReturnType<typeof useKitTheme>['kit']) => [k.primaryLight, k.primary],
  error: (k: ReturnType<typeof useKitTheme>['kit']) => [k.error, k.error],
  todo: (k: ReturnType<typeof useKitTheme>['kit']) => [k.fieldBg, k.border],
} as const;

function Steps({ w }: { w: Of<'steps'> }) {
  const { kit } = useKitTheme();
  return (
    <View>
      {w.steps.map((s, i) => {
        const [bg, border] = STEP_COLORS[s.status](kit);
        return (
          <View key={s.label} style={styles.row}>
            <View style={styles.stepRail}>
              <View style={[styles.stepDot, { backgroundColor: bg, borderColor: border }]}>
                {s.status === 'done' || s.status === 'error' ? (
                  <Icon source={s.status === 'done' ? 'mi:check' : 'mi:close'} size={14} color={kit.onPrimary} />
                ) : (
                  <Text style={[font('700', 11), { color: s.status === 'current' ? kit.primary : kit.textMuted }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < w.steps.length - 1 ? (
                <View style={[styles.stepLine, { backgroundColor: s.status === 'done' ? kit.primary : kit.border }]} />
              ) : null}
            </View>
            <View style={[styles.row, styles.flex, styles.stepText]}>
              <Text
                style={[
                  font(s.status === 'current' ? '700' : '500', 14),
                  styles.flex,
                  { color: s.status === 'todo' ? kit.textMuted : kit.textPrimary },
                ]}
              >
                {s.label}
              </Text>
              {s.text ? <Text style={[font('400', 12), { color: kit.textMuted }]}>{s.text}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function KeyValues({ w }: { w: Of<'keyvalue'> }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  return (
    <View>
      {w.items.map((kv) => (
        <View key={kv.label} style={[styles.row, styles.kv]}>
          {kv.icon ? (
            <Icon source={kv.icon} size={16} color={kv.tone ? toneColor(kv.tone, kit) : kit.textMuted} />
          ) : null}
          <Text style={[font('400', 12.5), styles.flex, { color: kit.textSecondary }]}>{kv.label}</Text>
          <Text
            style={[
              font('600', 13, kv.mono ? 'mono' : 'body'),
              styles.kvValue,
              { color: kv.tone ? toneText(kv.tone, kit) : kit.textPrimary },
            ]}
          >
            {kv.value}
          </Text>
          {kv.copy ? (
            <TouchableRipple
              borderless
              accessibilityRole="button"
              accessibilityLabel={`Copier ${kv.label}`}
              onPress={() => snack.copy(kv.value)}
              style={styles.kvCopy}
            >
              <Icon source="mi:content-copy" size={15} color={kit.textMuted} />
            </TouchableRipple>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function Checklist({ items }: { items: [string, boolean, string | null][] }) {
  const { kit } = useKitTheme();
  const [done, setDone] = useState(() => items.map((i) => i[1]));
  const n = done.filter(Boolean).length;
  return (
    <View>
      <View style={[styles.row, styles.gap8]}>
        <View style={styles.flex}>
          <KitProgressBar value={n / done.length} tone={n === done.length ? 'success' : 'primary'} />
        </View>
        <Text style={[font('400', 12), { color: kit.textSecondary }]}>{`${n} / ${done.length}`}</Text>
      </View>
      {items.map(([label, , note], i) => {
        const on = done[i] ?? false;
        const toggle = () => setDone((d) => d.map((x, j) => (j === i ? !x : x)));
        return (
          <TouchableRipple
            key={label}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            accessibilityLabel={label}
            onPress={toggle}
          >
            <View style={[styles.row, styles.check]}>
              <KitCheckbox value={on} onChange={toggle} />
              <View style={styles.flex}>
                <Text style={[font('400', 14), on && styles.strike, { color: on ? kit.textMuted : kit.textPrimary }]}>
                  {label}
                </Text>
                {note ? <Text style={[font('400', 12), { color: kit.textSecondary }]}>{note}</Text> : null}
              </View>
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

function JsonWidget({ w }: { w: Of<'json'> }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  return (
    <HzFrame
      w={w}
      trailing={
        <TouchableRipple
          borderless
          accessibilityRole="button"
          accessibilityLabel="Copier"
          onPress={() => snack.copy(JSON.stringify(w.data, null, 2), 'JSON copié')}
          style={styles.iconBtn}
        >
          <Icon source="mi:content-copy" size={18} color={kit.textSecondary} />
        </TouchableRipple>
      }
    >
      <View style={[styles.jsonBox, { backgroundColor: withAlpha(kit.hover, 0.6) }]}>
        <JsonNode value={w.data} depth={0} />
      </View>
    </HzFrame>
  );
}

/** Arbre JSON dépliable. */
function JsonNode({ name, value, depth }: { name?: string; value: JsonValue; depth: number }) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState(depth < 2);
  const st = [font('400', 12, 'mono'), { lineHeight: 19 }];
  const key = name != null ? <Text style={{ color: kit.purple }}>{`"${name}": `}</Text> : null;
  if (value !== null && typeof value === 'object') {
    const isArr = Array.isArray(value);
    const entries: [string, JsonValue][] = isArr ? value.map((x, i) => [`${i}`, x]) : Object.entries(value);
    const [o, c] = isArr ? ['[', ']'] : ['{', '}'];
    return (
      <View>
        <TouchableRipple accessibilityRole="button" onPress={() => setOpen((x) => !x)}>
          <View style={styles.row}>
            <Icon source={open ? 'mi:arrow-drop-down' : 'mi:arrow-right'} size={16} color={kit.textMuted} />
            <Text style={[st, { color: kit.textPrimary }]}>
              {key}
              <Text style={{ color: kit.textMuted }}>{open ? o : `${o} … ${c}  `}</Text>
              {open ? null : (
                <Text style={[font('400', 10.5), { color: kit.textMuted }]}>{`${entries.length} élément(s)`}</Text>
              )}
            </Text>
          </View>
        </TouchableRipple>
        {open ? (
          <>
            <View style={styles.jsonIndent}>
              {entries.map(([k, x]) => (
                <JsonNode key={k} name={isArr ? undefined : k} value={x} depth={depth + 1} />
              ))}
            </View>
            <Text style={[st, styles.jsonIndent, { color: kit.textMuted }]}>{c}</Text>
          </>
        ) : null}
      </View>
    );
  }
  const color =
    typeof value === 'string'
      ? kit.successText
      : typeof value === 'number'
        ? kit.info
        : typeof value === 'boolean'
          ? kit.tertiary
          : kit.textMuted;
  return (
    <Text style={[st, styles.jsonIndent]}>
      {key}
      <Text style={{ color }}>{typeof value === 'string' ? `"${value}"` : `${value}`}</Text>
    </Text>
  );
}

function Sources({ w }: { w: Of<'sources'> }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  return (
    <View>
      {w.items.map((s, i) => (
        <TouchableRipple
          key={s.title}
          accessibilityRole="link"
          onPress={() => snack.demoAction(`Ouverture de ${s.site}`)}
        >
          <View style={[styles.row, styles.source]}>
            <View style={[styles.sourceNum, { backgroundColor: kit.primaryLight }]}>
              <Text style={[font('700', 11), { color: kit.primary }]}>{i + 1}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={[font('400', 11), { color: kit.textMuted }]}>
                {s.date ? `${s.site} · ${s.date}` : s.site}
              </Text>
              <Text style={[font('600', 14), { color: kit.primary }]}>{s.title}</Text>
              {s.snippet ? (
                <Text numberOfLines={2} style={[font('400', 12), { color: kit.textSecondary }]}>
                  {s.snippet}
                </Text>
              ) : null}
            </View>
          </View>
        </TouchableRipple>
      ))}
    </View>
  );
}

function Heatmap({ w }: { w: Of<'heatmap'> }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const max = Math.max(...w.values.flat());
  return (
    <View>
      <ScrollView horizontal>
        <View>
          <View style={styles.row}>
            <View style={styles.heatLabel} />
            {w.cols.map((c, j) => (
              <Text key={c} style={[font('400', 9.5), styles.heatCol, { color: kit.textMuted }]}>
                {j % 2 === 0 ? c : ''}
              </Text>
            ))}
          </View>
          {w.rows.map((r, i) => (
            <View key={r} style={styles.row}>
              <Text style={[font('400', 11), styles.heatLabel, { color: kit.textSecondary }]}>{r}</Text>
              {w.cols.map((c, j) => {
                const v = w.values[i]?.[j] ?? 0;
                return (
                  <TouchableRipple
                    key={c}
                    accessibilityLabel={`${r} ${c} : ${Math.round(v)}${w.unit ?? ''}`}
                    onPress={() => snack.show(`${r} ${c} : ${Math.round(v)}${w.unit ?? ''}`)}
                    style={[styles.heatCell, { backgroundColor: withAlpha(kit.primary, 0.08 + (0.85 * v) / max) }]}
                  >
                    <View />
                  </TouchableRipple>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.row, styles.heatLegend]}>
        <Text style={[font('400', 11), { color: kit.textMuted }]}>Faible</Text>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((a) => (
          <View key={a} style={[styles.heatSwatch, { backgroundColor: withAlpha(kit.primary, a) }]} />
        ))}
        <Text style={[font('400', 11), { color: kit.textMuted }]}>Fort</Text>
      </View>
    </View>
  );
}

function Files({ w }: { w: Of<'files'> }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  return (
    <View>
      {w.items.map((f) => (
        <View key={f.name} style={[styles.row, styles.file]}>
          <Icon
            source={
              f.ext === 'pdf'
                ? 'mi:picture-as-pdf'
                : f.ext === 'csv' || f.ext === 'xls'
                  ? 'mi:table-view'
                  : 'mi:insert-drive-file'
            }
            size={24}
            color={f.ext === 'pdf' ? kit.error : kit.success}
          />
          <View style={styles.flex}>
            <Text style={[font('600', 13.5), { color: kit.textPrimary }]}>{f.name}</Text>
            <Text style={[font('400', 12), { color: kit.textSecondary }]}>
              {[f.size, f.date, f.by].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <TouchableRipple
            borderless
            accessibilityRole="button"
            accessibilityLabel={`Télécharger ${f.name}`}
            onPress={() => snack.demoAction(`Téléchargement de ${f.name}`)}
            style={styles.iconBtn}
          >
            <Icon source="mi:download" size={22} color={kit.textSecondary} />
          </TouchableRipple>
        </View>
      ))}
    </View>
  );
}

function Cards({ w }: { w: Of<'cards'> }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gap10}>
      {w.items.map((card) => {
        const tone = card.tone ?? 'primary';
        return (
          <View key={card.title} style={[styles.card, { borderColor: kit.border, backgroundColor: kit.bg }]}>
            <View style={styles.row}>
              <View style={[styles.cardIcon, { backgroundColor: toneLight(tone, kit) }]}>
                <Icon source={card.icon} size={18} color={toneColor(tone, kit)} />
              </View>
              <View style={styles.flex} />
              {card.meta ? <Text style={[font('400', 10.5), { color: kit.textMuted }]}>{card.meta}</Text> : null}
            </View>
            <Text numberOfLines={1} style={[font('700', 14), styles.mt8, { color: kit.textPrimary }]}>
              {card.title}
            </Text>
            {card.text ? (
              <Text numberOfLines={2} style={[font('400', 11.5), { color: kit.textSecondary }]}>
                {card.text}
              </Text>
            ) : null}
            <View style={styles.flex} />
            <View style={styles.row}>
              <Text style={[font('800', 13), styles.flex, { color: kit.primary }]}>{card.price ?? ''}</Text>
              {card.cta ? (
                <TouchableRipple
                  borderless
                  accessibilityRole="button"
                  accessibilityLabel={`${card.cta} ${card.title}`}
                  onPress={() => snack.show(`${card.title} ajouté au devis`)}
                  style={[styles.cardAdd, { backgroundColor: kit.primaryLight }]}
                >
                  <Icon source="mi:add" size={18} color={kit.primary} />
                </TouchableRipple>
              ) : null}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function Compare({ w }: { w: Of<'compare'> }) {
  const { kit } = useKitTheme();
  const FW = 128;
  const PW = 104;
  return (
    <ScrollView horizontal contentContainerStyle={styles.compare}>
      <View>
        <View style={[styles.row, styles.end]}>
          <View style={{ width: FW }} />
          {w.plans.map(([name, price, note, rec]) => (
            <View key={name} style={[styles.plan, { width: PW, backgroundColor: rec ? kit.primaryLight : undefined }]}>
              {rec ? <StatusBadge label="Recommandé" tone="primary" uppercase={false} /> : null}
              <Text style={[font('700', 14), { color: rec ? kit.primary : kit.textPrimary }]}>{name}</Text>
              <Text style={[font('700', 14, 'heading'), { color: kit.textPrimary }]}>{price}</Text>
              {note ? (
                <Text style={[font('400', 10.5), styles.centerText, { color: kit.textMuted }]}>{note}</Text>
              ) : null}
            </View>
          ))}
        </View>
        {w.features.map(([label, values]) => (
          <View key={label} style={[styles.row, { borderTopWidth: 1, borderTopColor: kit.border }]}>
            <Text style={[font('400', 12.5), styles.feature, { width: FW, color: kit.textSecondary }]}>{label}</Text>
            {values.map((v, i) => (
              <View
                key={i}
                style={[
                  styles.featureCell,
                  { width: PW, backgroundColor: w.plans[i]?.[3] ? kit.primaryLight : undefined },
                ]}
              >
                {typeof v === 'boolean' ? (
                  <Icon
                    source={v ? 'mi:check-circle' : 'mi:remove'}
                    size={18}
                    color={v ? kit.success : kit.textMuted}
                  />
                ) : (
                  <Text style={[font('400', 12), styles.centerText, { color: kit.textPrimary }]}>{v}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/** Pièce jointe (message utilisateur, zone de saisie). */
export function HzAttachmentPreview({ a, onRemove }: { a: HzAttachment; onRemove?: () => void }) {
  const { kit } = useKitTheme();
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.attachment, { backgroundColor: kit.card, borderColor: kit.border }]}>
      {a.kind === 'image' ? (
        <View style={styles.attachThumb}>
          <DemoArt seed={2} style={styles.fill} />
        </View>
      ) : (
        <View style={[styles.attachThumb, styles.center, { backgroundColor: kit.primaryLight }]}>
          <Icon source={attachmentIcon(a)} size={16} color={kit.primary} />
        </View>
      )}
      <View style={{ maxWidth: Math.min(150, width * 0.4) }}>
        <Text numberOfLines={1} style={[font('600', 12), { color: kit.textPrimary }]}>
          {a.name}
        </Text>
        <Text style={[font('400', 10.5), { color: kit.textMuted }]}>{a.size}</Text>
      </View>
      {onRemove ? (
        <TouchableRipple
          borderless
          accessibilityRole="button"
          accessibilityLabel={`Retirer ${a.name}`}
          onPress={onRemove}
        >
          <Icon source="mi:close" size={16} color={kit.textMuted} />
        </TouchableRipple>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  fill: { width: '100%', height: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
  end: { alignItems: 'flex-end' },
  center: { alignItems: 'center', justifyContent: 'center' },
  centerText: { textAlign: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  gap4: { gap: 4 },
  gap6: { gap: 6 },
  gap8: { gap: 8 },
  gap10: { gap: 10 },
  gap12: { columnGap: 12 },
  mt2: { marginTop: 2 },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
  mt10: { marginTop: 10 },
  mt14: { marginTop: 14 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  readOnly: { opacity: 0.75 },
  frame: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  frameHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: space.s4,
    paddingRight: space.s2,
    paddingVertical: space.s3,
  },
  frameIcon: { width: 30, height: 30, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  padAll: { padding: space.s4 },
  padAllS3: { padding: space.s3 },
  padBody: { paddingHorizontal: space.s4, paddingBottom: space.s4 },
  padTight: { paddingHorizontal: space.s2, paddingBottom: space.s2 },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s4,
    paddingHorizontal: space.s2,
    paddingVertical: space.s2,
  },
  callout: {
    flexDirection: 'row',
    gap: 10,
    padding: space.s3,
    borderRadius: radius.md,
    borderLeftWidth: 4,
  },
  stat: { padding: space.s3, borderRadius: radius.lg, borderWidth: 1 },
  tableSearch: { paddingHorizontal: space.s3, paddingBottom: space.s2 },
  th: { paddingHorizontal: space.s3, paddingVertical: space.s3 },
  td: { paddingHorizontal: space.s3, paddingVertical: 9, justifyContent: 'center' },
  empty: { padding: space.s4, textAlign: 'center' },
  pager: { paddingLeft: space.s3, paddingRight: space.s1, paddingVertical: space.s1 },
  pagerBtn: { padding: 6, borderRadius: radius.full },
  meter: { paddingVertical: space.s2, gap: 5 },
  tag: { paddingHorizontal: space.s3, paddingVertical: 5, borderRadius: radius.full },
  treeRow: { gap: 6, minHeight: 40 },
  treeChevron: { width: 22, alignItems: 'center' },
  treeMeta: { marginLeft: space.s2, flexShrink: 1 },
  approval: { padding: space.s4, borderRadius: 18, borderWidth: 1 },
  drop: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.md, paddingVertical: 22 },
  carousel: { paddingBottom: space.s4 },
  slideWrap: { paddingHorizontal: 5 },
  slide: { height: 230, borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' },
  slideHead: { height: 84, alignItems: 'center', justifyContent: 'center' },
  slideTag: { position: 'absolute', left: 8, top: 8 },
  slideBody: { flex: 1, padding: space.s3, gap: 2 },
  dots: { justifyContent: 'center', marginTop: 8 },
  dot: { height: 6, borderRadius: 3, marginHorizontal: space.s1 },
  tabBar: { borderBottomWidth: 1 },
  tabs: { paddingHorizontal: space.s4 },
  tab: { paddingHorizontal: space.s4 },
  tabInner: { height: 46, justifyContent: 'center' },
  tabIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  radio: { borderRadius: radius.full, paddingRight: 6 },
  check: { gap: space.s2, minHeight: 48, paddingVertical: space.s1 },
  strike: { textDecorationLine: 'line-through' },
  sheetBody: { paddingHorizontal: space.s4, paddingBottom: space.s6 },
  stepRail: { alignItems: 'center', alignSelf: 'stretch' },
  stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, minHeight: 14 },
  stepText: { marginLeft: 10, paddingTop: space.s1, paddingBottom: space.s3, alignSelf: 'flex-start' },
  kv: { gap: 8, paddingVertical: 5 },
  kvValue: { flexShrink: 1, textAlign: 'right' },
  kvCopy: { marginLeft: space.s2, padding: 2 },
  iconBtn: { padding: 8, borderRadius: radius.full },
  jsonBox: { padding: space.s2, borderRadius: radius.md },
  jsonIndent: { paddingLeft: space.s4 },
  source: { alignItems: 'flex-start', gap: 10, paddingVertical: space.s2 },
  sourceNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  heatLabel: { width: 34 },
  heatCol: { width: 26, textAlign: 'center' },
  heatCell: { width: 24, height: 24, margin: 1, borderRadius: 5 },
  heatLegend: { justifyContent: 'flex-end', gap: 2, marginTop: 8 },
  heatSwatch: { width: 14, height: 10, borderRadius: 2, marginHorizontal: 1 },
  file: { gap: space.s4, paddingHorizontal: space.s3, paddingVertical: space.s2 },
  card: { width: 170, height: 200, padding: space.s3, borderRadius: radius.md, borderWidth: 1 },
  cardIcon: { width: 32, height: 32, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cardAdd: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  compare: { paddingBottom: space.s3 },
  plan: {
    paddingVertical: space.s2,
    paddingHorizontal: space.s1,
    alignItems: 'center',
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  feature: { paddingLeft: space.s4, paddingRight: space.s2, paddingVertical: space.s2 },
  featureCell: { alignItems: 'center', justifyContent: 'center', paddingVertical: space.s2, alignSelf: 'stretch' },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: space.s2,
    paddingRight: space.s3,
    paddingVertical: space.s2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  attachThumb: { width: 30, height: 30, borderRadius: radius.sm, overflow: 'hidden' },
});
