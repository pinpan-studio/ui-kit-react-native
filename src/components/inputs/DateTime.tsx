import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import { date as fmtDate, dayHeadline, MONTHS, time as fmtTime } from '../../core/format';
import { font, radius, space, useKitTheme, withAlpha } from '../../theme';
import { KitButton } from '../core/Button';
import { FieldTrigger } from './Selects';
import { FormFieldLabel } from './TextField';

export interface DateRange {
  start: Date;
  end: Date;
}

const WEEK_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a?: Date | null, b?: Date | null) => !!a && !!b && startOfDay(a).getTime() === startOfDay(b).getTime();

/**
 * Calendrier mensuel Material 3 (`CalendarDatePicker` Flutter) : mois et année, flèches, initiales des jours,
 * jour choisi en disque primaire, aujourd'hui cerclé, bornes désactivées ; mode période avec bande.
 */
export function KitCalendar({
  value,
  range,
  onSelect,
  first = new Date(2020, 0, 1),
  last = new Date(2030, 11, 31),
  today = new Date(),
}: {
  value?: Date | null;
  /** Mode période : début et fin (fin absente pendant la sélection). */
  range?: { start: Date | null; end: Date | null };
  onSelect: (d: Date) => void;
  first?: Date;
  last?: Date;
  today?: Date;
}) {
  const { kit, roles } = useKitTheme();
  const anchor = range?.start ?? value ?? today;
  const [month, setMonth] = useState(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  const canPrev = new Date(month.getFullYear(), month.getMonth(), 0) >= startOfDay(first);
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= last;

  const lead = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  const rs = range?.start ? startOfDay(range.start).getTime() : null;
  const re = range?.end ? startOfDay(range.end).getTime() : null;

  return (
    <View>
      <View style={styles.calHead}>
        <Text style={[styles.monthLabel, { color: kit.textSecondary }]}>
          {`${MONTHS[month.getMonth()]} ${month.getFullYear()}`}
        </Text>
        <View style={styles.fill} />
        <NavArrow icon="mi:chevron-left" label="Mois précédent" disabled={!canPrev} onPress={() => shift(-1)} />
        <NavArrow icon="mi:chevron-right" label="Mois suivant" disabled={!canNext} onPress={() => shift(1)} />
      </View>
      <View style={styles.week}>
        {WEEK_LETTERS.map((l, i) => (
          <Text key={i} style={[styles.weekLetter, { color: kit.textPrimary }]}>
            {l}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={styles.cell} />;
          const t = d.getTime();
          const disabled = d < startOfDay(first) || d > last;
          const isStart = rs === t;
          const isEnd = re === t;
          const selected = range ? isStart || isEnd : sameDay(d, value);
          const inBand = rs !== null && re !== null && t > rs && t < re;
          const isToday = sameDay(d, today);
          const label = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
          return (
            <View key={i} style={styles.cell}>
              {(inBand || (isStart && re !== null && re !== rs) || (isEnd && rs !== re)) && (
                <View
                  style={[
                    styles.band,
                    { backgroundColor: roles.secondaryContainer },
                    isStart && styles.bandStart,
                    isEnd && styles.bandEnd,
                  ]}
                />
              )}
              <TouchableRipple
                onPress={() => onSelect(d)}
                disabled={disabled}
                borderless
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected, disabled }}
                style={[
                  styles.day,
                  selected && { backgroundColor: kit.primary },
                  !selected && isToday && { borderWidth: 1, borderColor: kit.primary },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: selected
                        ? kit.onPrimary
                        : disabled
                          ? withAlpha(kit.textPrimary, 0.38)
                          : isToday
                            ? kit.primary
                            : inBand
                              ? roles.onSecondaryContainer
                              : kit.textPrimary,
                    },
                  ]}
                >
                  {d.getDate()}
                </Text>
              </TouchableRipple>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function NavArrow({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { kit } = useKitTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      disabled={disabled}
      borderless
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.arrow}
    >
      <Icon source={icon} size={24} color={disabled ? withAlpha(kit.textPrimary, 0.38) : kit.textSecondary} />
    </TouchableRipple>
  );
}

/** Cadre des sélecteurs (M3 : surface-container-high, coins de 28) : en-tête, contenu, Annuler / OK. */
function PickerDialog({
  visible,
  onDismiss,
  help,
  headline,
  onConfirm,
  confirmLabel = 'OK',
  confirmDisabled,
  children,
}: {
  visible: boolean;
  onDismiss: () => void;
  help: string;
  headline: string;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  children: React.ReactNode;
}) {
  const { kit, roles } = useKitTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={styles.center}>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(roles.scrim, 0.32) }]}
        />
        <View accessibilityViewIsModal style={[styles.picker, { backgroundColor: roles.surfaceContainerHigh }]}>
          <View style={styles.pickerHead}>
            <Text style={[styles.help, { color: kit.textSecondary }]}>{help}</Text>
            <Text accessibilityRole="header" style={[styles.headline, { color: kit.textPrimary }]}>
              {headline}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: roles.outlineVariant }]} />
          <View style={styles.pickerBody}>{children}</View>
          <View style={styles.pickerActions}>
            <KitButton label="Annuler" variant="ghost" onPress={onDismiss} />
            <KitButton label={confirmLabel} variant="ghost" onPress={confirmDisabled ? undefined : onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** `showDatePicker` Flutter (locale fr-FR). */
export function DatePickerDialog({
  visible,
  onDismiss,
  value,
  onConfirm,
  help = 'Choisir une date',
  first,
  last,
}: {
  visible: boolean;
  onDismiss: () => void;
  value: Date | null;
  onConfirm: (d: Date) => void;
  help?: string;
  first?: Date;
  last?: Date;
}) {
  const [pick, setPick] = useState<Date>(value ?? new Date());
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setPick(value ?? new Date());
  }
  return (
    <PickerDialog
      visible={visible}
      onDismiss={onDismiss}
      help={help}
      headline={dayHeadline(pick)}
      onConfirm={() => onConfirm(pick)}
    >
      <KitCalendar value={pick} onSelect={setPick} first={first} last={last} />
    </PickerDialog>
  );
}

/** `showDateRangePicker` Flutter : toucher le début puis la fin. */
export function DateRangeDialog({
  visible,
  onDismiss,
  value,
  onConfirm,
  help = 'Période',
}: {
  visible: boolean;
  onDismiss: () => void;
  value: DateRange | null;
  onConfirm: (r: DateRange) => void;
  help?: string;
}) {
  const [start, setStart] = useState<Date | null>(value?.start ?? null);
  const [end, setEnd] = useState<Date | null>(value?.end ?? null);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setStart(value?.start ?? null);
      setEnd(value?.end ?? null);
    }
  }
  const select = (d: Date) => {
    if (!start || end || d < start) {
      setStart(d);
      setEnd(null);
    } else setEnd(d);
  };
  const headline = `${start ? fmtDate(start) : 'Début'}  –  ${end ? fmtDate(end) : 'Fin'}`;
  return (
    <PickerDialog
      visible={visible}
      onDismiss={onDismiss}
      help={help}
      headline={headline}
      confirmLabel="Enregistrer"
      confirmDisabled={!start || !end}
      onConfirm={() => start && end && onConfirm({ start, end })}
    >
      <KitCalendar
        range={{ start, end }}
        onSelect={select}
        first={new Date(2024, 0, 1)}
        last={new Date(2028, 11, 31)}
      />
    </PickerDialog>
  );
}

export interface TimeOfDay {
  hour: number;
  minute: number;
}

/** `showTimePicker` Flutter en mode saisie 24 h : heures et minutes dans deux grandes cases. */
export function TimePickerDialog({
  visible,
  onDismiss,
  value,
  onConfirm,
}: {
  visible: boolean;
  onDismiss: () => void;
  value: TimeOfDay | null;
  onConfirm: (t: TimeOfDay) => void;
}) {
  const { kit, roles } = useKitTheme();
  const init = value ?? { hour: 9, minute: 0 };
  const [h, setH] = useState(String(init.hour).padStart(2, '0'));
  const [m, setM] = useState(String(init.minute).padStart(2, '0'));
  const [focus, setFocus] = useState<'h' | 'm' | null>('h');
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setH(String(init.hour).padStart(2, '0'));
      setM(String(init.minute).padStart(2, '0'));
    }
  }
  const hour = Number(h);
  const minute = Number(m);
  const valid = h !== '' && m !== '' && hour < 24 && minute < 60;
  const box = (which: 'h' | 'm', v: string, set: (s: string) => void, label: string) => (
    <View style={styles.timeCol}>
      <TextInput
        value={v}
        onChangeText={(s) => set(s.replace(/\D/g, '').slice(0, 2))}
        onFocus={() => setFocus(which)}
        keyboardType="number-pad"
        maxLength={2}
        selectTextOnFocus
        accessibilityLabel={label}
        selectionColor={kit.primary}
        style={[
          styles.timeBox,
          focus === which
            ? { backgroundColor: roles.primaryContainer, borderColor: kit.primary, color: roles.onPrimaryContainer }
            : { backgroundColor: roles.surfaceContainerHighest, borderColor: 'transparent', color: kit.textPrimary },
        ]}
      />
      <Text style={[styles.timeLabel, { color: kit.textSecondary }]}>{label}</Text>
    </View>
  );
  return (
    <PickerDialog
      visible={visible}
      onDismiss={onDismiss}
      help="Saisir l’heure"
      headline={valid ? fmtTime(hour, minute) : '--:--'}
      confirmDisabled={!valid}
      onConfirm={() => onConfirm({ hour, minute })}
    >
      <View style={styles.timeRow}>
        {box('h', h, setH, 'Heure')}
        <Text style={[styles.timeSep, { color: kit.textPrimary }]}>:</Text>
        {box('m', m, setM, 'Minute')}
      </View>
    </PickerDialog>
  );
}

/** Champ date (`DateField` Flutter) : touche pour choisir, croix pour effacer. */
export function DateField({
  value,
  onChange,
  label,
  placeholder = 'JJ/MM/AAAA',
  first,
  last,
  error,
}: {
  value: Date | null;
  onChange: (d: Date | null) => void;
  label?: string;
  placeholder?: string;
  first?: Date;
  last?: Date;
  error?: string;
}) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState(false);
  const trigger = (
    <FieldTrigger
      text={value ? fmtDate(value) : null}
      placeholder={placeholder}
      icon="mi:event"
      error={!!error}
      accessibilityLabel={label ?? 'Date'}
      onPress={() => setOpen(true)}
      trailing={
        value ? (
          <TouchableRipple
            onPress={() => onChange(null)}
            borderless
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Effacer la date"
          >
            <Icon source="mi:close" size={18} color={kit.textSecondary} />
          </TouchableRipple>
        ) : (
          <Icon source="mi:calendar-month" size={24} color={kit.textSecondary} />
        )
      }
    />
  );
  return (
    <>
      {label ? (
        <FormFieldLabel label={label} error={error}>
          {trigger}
        </FormFieldLabel>
      ) : (
        trigger
      )}
      <DatePickerDialog
        visible={open}
        onDismiss={() => setOpen(false)}
        value={value}
        help={label?.replace(/ \*$/, '') ?? 'Choisir une date'}
        first={first}
        last={last}
        onConfirm={(d) => {
          setOpen(false);
          onChange(d);
        }}
      />
    </>
  );
}

/** Période début → fin (`DateRangeField` Flutter). */
export function DateRangeField({
  value,
  onChange,
  label,
}: {
  value: DateRange | null;
  onChange: (r: DateRange) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const trigger = (
    <FieldTrigger
      text={value ? `${fmtDate(value.start)}  →  ${fmtDate(value.end)}` : null}
      placeholder="Début  →  Fin"
      icon="mi:date-range"
      accessibilityLabel={label ?? 'Période'}
      onPress={() => setOpen(true)}
    />
  );
  return (
    <>
      {label ? <FormFieldLabel label={label}>{trigger}</FormFieldLabel> : trigger}
      <DateRangeDialog
        visible={open}
        onDismiss={() => setOpen(false)}
        value={value}
        help={label ?? 'Période'}
        onConfirm={(r) => {
          setOpen(false);
          onChange(r);
        }}
      />
    </>
  );
}

/** Champ heure 24 h (`TimeField` Flutter). */
export function TimeField({
  value,
  onChange,
  label,
  placeholder = 'HH:MM',
}: {
  value: TimeOfDay | null;
  onChange: (t: TimeOfDay) => void;
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const trigger = (
    <FieldTrigger
      text={value ? fmtTime(value.hour, value.minute) : null}
      placeholder={placeholder}
      icon="mi:schedule"
      accessibilityLabel={label ?? 'Heure'}
      onPress={() => setOpen(true)}
    />
  );
  return (
    <>
      {label ? <FormFieldLabel label={label}>{trigger}</FormFieldLabel> : trigger}
      <TimePickerDialog
        visible={open}
        onDismiss={() => setOpen(false)}
        value={value}
        onConfirm={(t) => {
          setOpen(false);
          onChange(t);
        }}
      />
    </>
  );
}

const CELL = 44;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.l },
  calHead: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.s4, paddingRight: space.s1, height: 52 },
  monthLabel: font('600', 14),
  arrow: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', paddingHorizontal: space.s3 },
  weekLetter: { ...font('400', 14), flex: 1, textAlign: 'center', lineHeight: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: space.s3, paddingBottom: space.s2 },
  cell: { width: `${100 / 7}%`, height: CELL, alignItems: 'center', justifyContent: 'center' },
  band: { position: 'absolute', left: 0, right: 0, top: 2, bottom: 2 },
  bandStart: { left: '50%' },
  bandEnd: { right: '50%' },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dayText: font('400', 15),
  picker: { width: '100%', maxWidth: 360, borderRadius: 28, overflow: 'hidden' },
  pickerHead: { paddingHorizontal: space.l, paddingTop: space.l, paddingBottom: space.s3, gap: space.s5 },
  help: font('500', 13),
  headline: font('400', 30, 'heading'),
  divider: { height: 1 },
  pickerBody: { paddingTop: space.s1 },
  pickerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: space.s2, padding: space.s3 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: space.s2,
    padding: space.l,
  },
  timeCol: { alignItems: 'flex-start', gap: 7 },
  timeBox: {
    ...font('400', 45, 'heading'),
    width: 96,
    height: 72,
    borderRadius: radius.sm,
    borderWidth: 2,
    textAlign: 'center',
    padding: 0,
  },
  timeLabel: font('400', 12),
  timeSep: { ...font('400', 57, 'heading'), lineHeight: 72 },
});
