import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import { fold } from '../../core/format';
import {
  MIN_TOUCH,
  elevation,
  font,
  radius,
  space,
  toneColor,
  useKitTheme,
  withAlpha,
  type KitTone,
} from '../../theme';
import { KitAvatar } from '../core/Avatars';
import { KitButton } from '../core/Button';
import { EmptyState } from '../core/States';
import { KitBottomSheet, SheetHeader } from '../overlays/Overlays';
import { KitCheckbox } from './Choice';
import { FormFieldLabel, KitTextField } from './TextField';

/** Option de sélection (`SelectOption` Flutter). */
export interface SelectOption<T> {
  value: T;
  label: string;
  subtitle?: string;
  icon?: string;
  tone?: KitTone;
}

/** Déclencheur au look « field-box » : fond, contour, chevron (`FieldTrigger` Flutter). */
export function FieldTrigger({
  text,
  placeholder = 'Sélectionner…',
  icon,
  onPress,
  error = false,
  enabled = true,
  trailing,
  accessibilityLabel,
}: {
  text?: string | null;
  placeholder?: string;
  icon?: string;
  onPress?: () => void;
  error?: boolean;
  enabled?: boolean;
  trailing?: ReactNode;
  accessibilityLabel?: string;
}) {
  const { kit } = useKitTheme();
  const empty = !text;
  return (
    <TouchableRipple
      onPress={onPress}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: empty ? placeholder : text }}
      accessibilityState={{ disabled: !enabled }}
      style={[
        styles.trigger,
        { backgroundColor: kit.fieldBg, borderColor: error ? kit.error : kit.border, opacity: enabled ? 1 : 0.6 },
      ]}
    >
      <View style={styles.row}>
        {icon ? <Icon source={icon} size={20} color={kit.textSecondary} /> : null}
        <Text numberOfLines={2} style={[styles.triggerText, { color: empty ? kit.textMuted : kit.textPrimary }]}>
          {empty ? placeholder : text}
        </Text>
        {trailing ?? <Icon source="mi:expand-more" size={24} color={kit.textSecondary} />}
      </View>
    </TouchableRipple>
  );
}

/** Ligne d'option de la feuille de sélection. */
function OptionRow<T>({
  option,
  selected,
  multi,
  onPress,
}: {
  option: SelectOption<T>;
  selected: boolean;
  multi: boolean;
  onPress: () => void;
}) {
  const { kit } = useKitTheme();
  const color = selected && !multi ? kit.primary : kit.textPrimary;
  const leading = option.icon ? (
    <Icon source={option.icon} size={20} color={selected && !multi ? kit.primary : kit.textSecondary} />
  ) : option.tone ? (
    <View style={[styles.dot, { backgroundColor: toneColor(option.tone, kit) }]} />
  ) : null;
  return (
    <TouchableRipple
      onPress={onPress}
      accessibilityRole={multi ? 'checkbox' : 'button'}
      accessibilityState={multi ? { checked: selected } : { selected }}
      style={[styles.option, selected && !multi && { backgroundColor: kit.primaryLight }]}
    >
      <View style={styles.row}>
        {leading}
        <View style={styles.fill}>
          <Text style={[styles.optionTitle, { color }]}>{option.label}</Text>
          {option.subtitle ? (
            <Text style={[styles.optionSubtitle, { color: kit.textSecondary }]}>{option.subtitle}</Text>
          ) : null}
        </View>
        {multi ? (
          <KitCheckbox value={selected} onChange={onPress} />
        ) : selected ? (
          <Icon source="mi:check" size={24} color={kit.primary} />
        ) : null}
      </View>
    </TouchableRipple>
  );
}

/**
 * Feuille de sélection recherchable (remplace le panneau overlay de `<app-searchable-select>`) :
 * recherche dès 7 options, choix simple ou multiple.
 */
export function SelectSheet<T>({
  visible,
  onDismiss,
  title,
  options,
  selected,
  onSelect,
  multi = false,
  multiSelected = [],
  onConfirm,
  searchable = true,
  allowNull = false,
}: {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  options: SelectOption<T>[];
  selected?: T | null;
  /** Choix simple : `null` pour « Aucun » (`allowNull`). */
  onSelect?: (value: T | null) => void;
  multi?: boolean;
  multiSelected?: T[];
  onConfirm?: (values: T[]) => void;
  searchable?: boolean;
  allowNull?: boolean;
}) {
  const { kit } = useKitTheme();
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<T[]>(multiSelected);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setQ('');
      setPicked(multiSelected);
    }
  }
  const query = fold(q.trim());
  const list = options.filter(
    (o) => !query || fold(o.label).includes(query) || (o.subtitle ? fold(o.subtitle).includes(query) : false),
  );
  const togglePick = (v: T) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  return (
    <KitBottomSheet visible={visible} onDismiss={onDismiss}>
      <SheetHeader title={title}>
        {multi ? (
          <>
            <KitButton label="Effacer" variant="ghost" size="compact" onPress={() => setPicked([])} />
            <KitButton label={`Valider (${picked.length})`} size="compact" onPress={() => onConfirm?.(picked)} />
          </>
        ) : null}
      </SheetHeader>
      {searchable && options.length > 6 ? (
        <View style={styles.search}>
          <KitTextField hint="Rechercher…" icon="mi:search" value={q} onChangeText={setQ} autoCorrect={false} />
        </View>
      ) : null}
      {list.length === 0 ? (
        <EmptyState compact icon="mi:search-off" title="Aucun résultat" subtitle="Essayez un autre terme." />
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}>
          {allowNull && !multi ? (
            <TouchableRipple onPress={() => onSelect?.(null)} accessibilityRole="button" style={styles.option}>
              <View style={styles.row}>
                <Icon source="mi:block" size={20} color={kit.textSecondary} />
                <Text style={[styles.optionTitle, { color: kit.textMuted }]}>Aucun</Text>
              </View>
            </TouchableRipple>
          ) : null}
          {list.map((o, i) => (
            <OptionRow
              key={`${String(o.value)}-${i}`}
              option={o}
              multi={multi}
              selected={multi ? picked.includes(o.value) : o.value === selected}
              onPress={() => (multi ? togglePick(o.value) : onSelect?.(o.value))}
            />
          ))}
        </ScrollView>
      )}
    </KitBottomSheet>
  );
}

/** `<app-searchable-select>` : champ qui ouvre la feuille de sélection (`SearchableSelect` Flutter). */
export function SearchableSelect<T>({
  options,
  value,
  onChange,
  label,
  placeholder = 'Sélectionner…',
  icon,
  allowNull = false,
  enabled = true,
  error,
  sheetTitle,
}: {
  options: SelectOption<T>[];
  value: T | null | undefined;
  onChange: (value: T | null) => void;
  label?: string;
  placeholder?: string;
  icon?: string;
  allowNull?: boolean;
  enabled?: boolean;
  error?: string;
  sheetTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  const trigger = (
    <FieldTrigger
      text={current?.label}
      placeholder={placeholder}
      icon={current?.icon ?? icon}
      error={!!error}
      enabled={enabled}
      onPress={() => setOpen(true)}
      accessibilityLabel={label ?? placeholder}
    />
  );
  return (
    <>
      {label || error ? (
        <FormFieldLabel label={label ?? ''} error={error}>
          {trigger}
        </FormFieldLabel>
      ) : (
        trigger
      )}
      <SelectSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        title={sheetTitle ?? label?.replace(/ \*$/, '') ?? placeholder}
        options={options}
        selected={value}
        allowNull={allowNull}
        onSelect={(v) => {
          setOpen(false);
          if (v !== null || allowNull) onChange(v);
        }}
      />
    </>
  );
}

/** Puce de saisie supprimable (`InputChip` Flutter). */
export function InputChip({
  label,
  onRemove,
  tinted = false,
}: {
  label: string;
  onRemove?: () => void;
  /** Teinte primaire (tags) plutôt que neutre. */
  tinted?: boolean;
}) {
  const { kit } = useKitTheme();
  const color = tinted ? kit.primary : kit.textPrimary;
  return (
    <View style={[styles.inputChip, { backgroundColor: tinted ? kit.primaryLight : kit.card }]}>
      <Text style={[tinted ? styles.inputChipTinted : styles.inputChipLabel, { color }]}>{label}</Text>
      {onRemove ? (
        <TouchableRipple
          onPress={onRemove}
          borderless
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Retirer ${label}`}
          style={styles.chipClose}
        >
          <Icon source="mi:cancel" size={18} color={tinted ? kit.primary : kit.textSecondary} />
        </TouchableRipple>
      ) : null}
    </View>
  );
}

/** Sélection multiple affichée en puces (`MultiSelectField` Flutter). */
export function MultiSelectField<T>({
  options,
  values,
  onChange,
  label,
  placeholder = 'Choisir…',
}: {
  options: SelectOption<T>[];
  values: T[];
  onChange: (values: T[]) => void;
  label?: string;
  placeholder?: string;
}) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState(false);
  const selected = options.filter((o) => values.includes(o.value));
  const field = (
    <TouchableRipple
      onPress={() => setOpen(true)}
      accessibilityRole="button"
      accessibilityLabel={label ?? placeholder}
      accessibilityValue={{ text: selected.map((o) => o.label).join(', ') || placeholder }}
      style={[styles.multi, { backgroundColor: kit.fieldBg, borderColor: kit.border }]}
    >
      <View style={styles.row}>
        <View style={[styles.fill, styles.wrap]}>
          {selected.length === 0 ? (
            <Text style={[styles.triggerText, styles.placeholderPad, { color: kit.textMuted }]}>{placeholder}</Text>
          ) : (
            selected.map((o) => (
              <InputChip
                key={String(o.value)}
                label={o.label}
                onRemove={() => onChange(values.filter((v) => v !== o.value))}
              />
            ))
          )}
        </View>
        <Icon source="mi:expand-more" size={24} color={kit.textSecondary} />
      </View>
    </TouchableRipple>
  );
  return (
    <>
      {label ? <FormFieldLabel label={label}>{field}</FormFieldLabel> : field}
      <SelectSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        title={label ?? placeholder}
        options={options}
        multi
        multiSelected={values}
        onConfirm={(v) => {
          setOpen(false);
          onChange(v);
        }}
      />
    </>
  );
}

/** `<app-filter-dropdown>` : puce compacte « Libellé : valeur ▾ » (`FilterDropdown` Flutter). */
export function FilterDropdown<T>({
  label,
  options,
  value,
  onChange,
  allValue,
  icon = 'mi:filter-list',
}: {
  label: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  allValue?: T;
  icon?: string;
}) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  const active = allValue !== undefined && value !== allValue;
  return (
    <>
      <TouchableRipple
        onPress={() => setOpen(true)}
        borderless
        hitSlop={{ top: 6, bottom: 6 }}
        accessibilityRole="button"
        accessibilityLabel={`${label} : ${current?.label ?? '—'}`}
        style={[
          styles.filter,
          {
            backgroundColor: active ? kit.primaryLight : kit.card,
            borderColor: active ? withAlpha(kit.primary, 0.6) : kit.border,
          },
        ]}
      >
        <View style={styles.filterRow}>
          <Icon source={current?.icon ?? icon} size={16} color={active ? kit.primary : kit.textSecondary} />
          <Text style={[styles.filterLabel, { color: kit.textSecondary }]}>{`${label} : `}</Text>
          <Text style={[styles.filterValue, { color: active ? kit.primary : kit.textPrimary }]}>
            {current?.label ?? '—'}
          </Text>
          <Icon source="mi:arrow-drop-down" size={18} color={kit.textSecondary} />
        </View>
      </TouchableRipple>
      <SelectSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        title={label}
        options={options}
        selected={value}
        searchable={options.length > 8}
        onSelect={(v) => {
          setOpen(false);
          if (v !== null) onChange(v);
        }}
      />
    </>
  );
}

/**
 * `<app-entity-autocomplete>` : recherche filtrée en mémoire, résultats enrichis affichés sous le champ
 * (`EntityAutocomplete` / `Autocomplete` Flutter).
 */
export function EntityAutocomplete<T>({
  items,
  display,
  subtitle,
  onSelect,
  hint = 'Rechercher…',
  icon = 'mi:search',
  maxResults = 8,
  avatar = true,
  startsWith = false,
}: {
  items: readonly T[];
  display: (item: T) => string;
  subtitle?: (item: T) => string;
  onSelect?: (item: T) => void;
  hint?: string;
  icon?: string;
  maxResults?: number;
  /** Avatar à initiales devant chaque résultat. */
  avatar?: boolean;
  /** Correspondance en début de libellé (suggestions simples) plutôt que n'importe où. */
  startsWith?: boolean;
}) {
  const { kit, roles, colorMode } = useKitTheme();
  const [q, setQ] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const query = q.trim().toLowerCase();
  const results =
    !query || chosen === q
      ? []
      : items
          .filter((e) => {
            const d = display(e).toLowerCase();
            const hit = startsWith ? d.startsWith(query) : d.includes(query);
            return hit || (!startsWith && subtitle ? subtitle(e).toLowerCase().includes(query) : false);
          })
          .slice(0, maxResults);
  return (
    <View>
      <KitTextField
        hint={hint}
        icon={icon}
        value={q}
        onChangeText={(v) => {
          setQ(v);
          setChosen(null);
        }}
        autoCorrect={false}
        suffix={
          q ? (
            <TouchableRipple
              onPress={() => setQ('')}
              borderless
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Effacer"
            >
              <Icon source="mi:close" size={18} color={kit.textSecondary} />
            </TouchableRipple>
          ) : null
        }
      />
      {results.length > 0 ? (
        <View
          accessibilityRole="list"
          style={[styles.results, { backgroundColor: roles.surfaceContainer, ...elevation(3, colorMode) }]}
        >
          {results.map((r, i) => (
            <TouchableRipple
              key={i}
              onPress={() => {
                const label = display(r);
                setQ(label);
                setChosen(label);
                onSelect?.(r);
              }}
              accessibilityRole="button"
              style={styles.result}
            >
              <View style={styles.row}>
                {avatar ? <KitAvatar name={display(r)} size={32} /> : null}
                <View style={styles.fill}>
                  <Text style={[styles.optionTitle, { color: kit.textPrimary }]}>{display(r)}</Text>
                  {subtitle ? (
                    <Text style={[styles.optionSubtitle, { color: kit.textSecondary }]}>{subtitle(r)}</Text>
                  ) : null}
                </View>
              </View>
            </TouchableRipple>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  trigger: {
    minHeight: MIN_TOUCH,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.s3,
    paddingVertical: space.s2,
    justifyContent: 'center',
  },
  triggerText: { ...font('400', 14), flex: 1 },
  placeholderPad: { padding: space.s1 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  search: { paddingHorizontal: space.s4, paddingBottom: space.s2 },
  list: { paddingHorizontal: space.s2, paddingBottom: space.s4 },
  option: { minHeight: 56, borderRadius: radius.md, paddingHorizontal: space.s4, justifyContent: 'center' },
  optionTitle: font('500', 14),
  optionSubtitle: font('400', 12.5),
  inputChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    minHeight: 32,
    borderRadius: radius.sm,
    paddingLeft: space.s3,
    paddingRight: space.s1,
  },
  inputChipLabel: font('500', 13),
  inputChipTinted: font('600', 12.5),
  chipClose: { borderRadius: 12, padding: 2 },
  multi: {
    minHeight: MIN_TOUCH,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingLeft: space.s3,
    paddingRight: space.s2,
    paddingVertical: space.s2,
    justifyContent: 'center',
  },
  filter: { borderRadius: 999, borderWidth: 1, alignSelf: 'flex-start' },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: space.s3,
    paddingRight: space.s2,
    paddingVertical: space.s2,
  },
  filterLabel: { ...font('400', 12.5), marginLeft: 6 },
  filterValue: font('700', 12.5),
  results: { marginTop: space.s1, borderRadius: radius.md, paddingVertical: space.s2, overflow: 'hidden' },
  result: { paddingHorizontal: space.s4, paddingVertical: space.s2, minHeight: MIN_TOUCH, justifyContent: 'center' },
});
