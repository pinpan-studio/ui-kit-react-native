import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon, Menu, TouchableRipple } from 'react-native-paper';

import { compact, decimal1, number } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import { MIN_TOUCH, font, radius, space, tabular, useKitTheme, withAlpha } from '../../theme';
import { KitChip } from '../core/Toggles';
import { InputChip } from '../inputs/Selects';
import { FormFieldLabel } from '../inputs/TextField';

/**
 * `<app-otp-input>` (`OtpInput` Flutter) : cases individuelles portées par un champ invisible —
 * clavier numérique, remplissage automatique du code SMS, avance et effacement arrière natifs.
 */
export function OtpInput({
  value,
  onChange,
  onCompleted,
  length = 6,
  obscure = false,
  error = false,
  enabled = true,
  accessibilityLabel = 'Code de vérification',
}: {
  value: string;
  onChange: (code: string) => void;
  onCompleted?: (code: string) => void;
  length?: number;
  obscure?: boolean;
  error?: boolean;
  enabled?: boolean;
  accessibilityLabel?: string;
}) {
  const { kit } = useKitTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.otp}>
      {Array.from({ length }, (_, i) => {
        const ch = value[i] ?? '';
        const active = focused && (i === value.length || (i === length - 1 && value.length === length));
        return (
          <View
            key={i}
            style={[
              styles.otpCell,
              i > 0 && { marginLeft: length > 4 && i === Math.floor(length / 2) ? 14 : 8 },
              {
                backgroundColor: active ? kit.card : kit.fieldBg,
                borderColor: error ? kit.error : active ? kit.primary : kit.border,
                borderWidth: active ? 1.8 : 1,
              },
              active && { boxShadow: `0 0 0 3px ${withAlpha(kit.primary, 0.15)}` },
            ]}
          >
            <Text style={[styles.otpChar, { color: kit.textPrimary }]}>{ch ? (obscure ? '•' : ch) : ''}</Text>
          </View>
        );
      })}
      <TextInput
        value={value}
        onChangeText={(s) => {
          const code = s.replace(/\D/g, '').slice(0, length);
          onChange(code);
          if (code.length === length) onCompleted?.(code);
        }}
        editable={enabled}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        caretHidden
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: obscure ? `${value.length} chiffres saisis sur ${length}` : value || 'vide' }}
        style={styles.otpInput}
      />
    </View>
  );
}

/** `<app-number-stepper>` : − / + avec bornes et pas (`NumberStepper` Flutter). */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
  compact: small = false,
  accessibilityLabel = 'Valeur',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  compact?: boolean;
  accessibilityLabel?: string;
}) {
  const { kit } = useKitTheme();
  const size = small ? 30 : 36;
  const display = Number.isInteger(value) ? number(value) : decimal1(value);
  const btn = (icon: string, enabled: boolean, next: number, label: string) => (
    <TouchableRipple
      onPress={() => onChange(Math.round(next * 1000) / 1000)}
      disabled={!enabled}
      borderless
      hitSlop={(MIN_TOUCH - size) / 2}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      style={[
        styles.stepBtn,
        { width: size, height: size, borderRadius: size / 2, borderColor: kit.border },
        enabled && { backgroundColor: kit.card },
      ]}
    >
      <Icon source={icon} size={18} color={enabled ? kit.textPrimary : kit.textMuted} />
    </TouchableRipple>
  );
  return (
    <View accessible={false} style={[styles.stepper, { backgroundColor: kit.fieldBg, borderColor: kit.border }]}>
      {btn('mi:remove', value > min, Math.max(min, value - step), `Diminuer ${accessibilityLabel}`)}
      <Text
        accessibilityLabel={`${accessibilityLabel} : ${display}${unit ? ` ${unit}` : ''}`}
        style={[styles.stepValue, { minWidth: small ? 44 : 64, color: kit.textPrimary }]}
      >
        {display}
        {unit ? <Text style={[styles.stepUnit, { color: kit.textSecondary }]}>{` ${unit}`}</Text> : null}
      </Text>
      {btn('mi:add', value < max, Math.min(max, value + step), `Augmenter ${accessibilityLabel}`)}
    </View>
  );
}

const digitsOf = (s: string) => s.replace(/\D/g, '').slice(0, 15);

/** `<app-currency-input>` : montant à séparateurs de milliers, devise, raccourcis (`CurrencyInput` Flutter). */
export function CurrencyInput({
  initial,
  onChange,
  currency = 'FCFA',
  currencies = ['FCFA', 'EUR', 'USD'],
  presets = [],
  label,
}: {
  initial?: number;
  onChange: (amount: number | null, currency: string) => void;
  currency?: string;
  currencies?: string[];
  presets?: number[];
  label?: string;
}) {
  const { kit } = useKitTheme();
  const [text, setText] = useState(initial === undefined ? '' : number(initial));
  const [cur, setCur] = useState(currency);
  const [menu, setMenu] = useState(false);
  const [focused, setFocused] = useState(false);
  const amount = (t: string) => (digitsOf(t) ? Number(digitsOf(t)) : null);
  const set = (t: string, c = cur) => {
    const d = digitsOf(t);
    const next = d ? number(Number(d)) : '';
    setText(next);
    onChange(amount(next), c);
  };
  const field = (
    <View
      style={[
        styles.money,
        {
          backgroundColor: kit.fieldBg,
          borderColor: focused ? kit.primary : kit.border,
          borderWidth: focused ? 1.5 : 1,
        },
      ]}
    >
      <Icon source="mi:payments" size={22} color={kit.textSecondary} />
      <TextInput
        value={text}
        onChangeText={(t) => set(t)}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={kit.textMuted}
        selectionColor={kit.primary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label ?? `Montant en ${cur}`}
        style={[styles.moneyInput, { color: kit.textPrimary }]}
      />
      {currencies.length < 2 ? (
        <Text style={[styles.currency, { color: kit.textSecondary }]}>{cur}</Text>
      ) : (
        <Menu
          visible={menu}
          onDismiss={() => setMenu(false)}
          anchor={
            <TouchableRipple
              onPress={() => setMenu(true)}
              borderless
              accessibilityRole="button"
              accessibilityLabel={`Devise : ${cur}`}
              style={styles.curBtn}
            >
              <View style={styles.row}>
                <Text style={[styles.currency, { color: kit.primary }]}>{cur}</Text>
                <Icon source="mi:arrow-drop-down" size={24} color={kit.primary} />
              </View>
            </TouchableRipple>
          }
        >
          {currencies.map((c) => (
            <Menu.Item
              key={c}
              title={c}
              onPress={() => {
                setMenu(false);
                setCur(c);
                onChange(amount(text), c);
              }}
            />
          ))}
        </Menu>
      )}
    </View>
  );
  return (
    <View style={styles.gap8}>
      {label ? <FormFieldLabel label={label}>{field}</FormFieldLabel> : field}
      {presets.length ? (
        <View style={styles.wrap6}>
          {presets.map((p) => (
            <KitChip key={p} label={compact(p)} onPress={() => set(String(p))} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** `<app-rating>` : étoiles (demi-étoiles en lecture), libellé, icône personnalisable (`RatingInput` Flutter). */
export function RatingInput({
  value,
  onChange,
  max = 5,
  size = 32,
  icon = 'star',
  emptyIcon = 'star-outline',
  halfIcon = 'star-half-full',
  color,
  labels,
  accessibilityLabel = 'Note',
}: {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
  size?: number;
  icon?: string;
  emptyIcon?: string;
  halfIcon?: string;
  color?: string;
  labels?: string[];
  accessibilityLabel?: string;
}) {
  const { kit } = useKitTheme();
  const col = color ?? kit.warning;
  const label = labels && value > 0 ? labels[Math.min(labels.length - 1, Math.max(0, Math.ceil(value) - 1))] : null;
  return (
    <View
      style={styles.row}
      accessible={!onChange}
      accessibilityLabel={!onChange ? `${accessibilityLabel} : ${decimal1(value)} sur ${max}` : undefined}
    >
      {Array.from({ length: max }, (_, k) => {
        const i = k + 1;
        const glyph =
          value >= i ? (
            <Icon source={icon} size={size} color={col} />
          ) : value >= i - 0.5 ? (
            <Icon source={halfIcon} size={size} color={col} />
          ) : (
            <Icon source={emptyIcon} size={size} color={withAlpha(kit.textMuted, 0.6)} />
          );
        return onChange ? (
          <TouchableRipple
            key={i}
            onPress={() => onChange(value === i ? 0 : i)}
            borderless
            accessibilityRole="radio"
            accessibilityLabel={`${accessibilityLabel} ${i} sur ${max}${labels?.[i - 1] ? `, ${labels[i - 1]}` : ''}`}
            accessibilityState={{ checked: value === i }}
            style={[styles.star, { transform: [{ scale: value >= i ? 1.08 : 1 }] }]}
          >
            {glyph}
          </TouchableRipple>
        ) : (
          <View key={i} style={styles.starStatic}>
            {glyph}
          </View>
        );
      })}
      {label ? <Text style={[styles.ratingLabel, { color: kit.textSecondary }]}>{label}</Text> : null}
    </View>
  );
}

/** Règles de mot de passe (`kPasswordRules` Flutter). */
export const PASSWORD_RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: '8 caractères minimum', test: (v) => v.length >= 8 },
  { label: 'Une majuscule et une minuscule', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: 'Un chiffre', test: (v) => /\d/.test(v) },
  { label: 'Un caractère spécial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** Score 0 → 4 (`passwordScore` Flutter). */
export function passwordScore(v: string): number {
  if (!v) return 0;
  let s = PASSWORD_RULES.filter((r) => r.test(v)).length;
  if (v.length >= 12 && s >= 3) s = 4;
  return Math.min(4, s);
}

const LEVELS = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
const PW_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#%&*?';

/** Générateur déterministe (graine croissante), comme `Random(_seed++)` Flutter. */
function generatePassword(seed: number): string {
  let x = seed * 9301 + 49297;
  let out = '';
  for (let i = 0; i < 14; i++) {
    x = (x * 9301 + 49297) % 233280;
    out += PW_CHARS[Math.floor((x / 233280) * PW_CHARS.length)] ?? 'a';
  }
  return passwordScore(out) < 4 ? `Ab3!${out}` : out;
}

/** `<app-password-field>` : visibilité, jauge 4 niveaux, règles, générateur (`PasswordField` Flutter). */
export function PasswordField({
  label = 'Mot de passe',
  generator = true,
  onChange,
}: {
  label?: string;
  generator?: boolean;
  onChange?: (v: string) => void;
}) {
  const { kit } = useKitTheme();
  const [v, setV] = useState('');
  const [visible, setVisible] = useState(false);
  const [seed, setSeed] = useState(3);
  const [focused, setFocused] = useState(false);
  const score = passwordScore(v);
  const col = score <= 1 ? kit.error : score === 2 ? kit.warning : score === 3 ? kit.info : kit.success;
  const textCol = score <= 1 ? kit.errorText : score === 2 ? kit.warningText : score === 3 ? kit.info : kit.successText;
  const set = (s: string) => {
    setV(s);
    onChange?.(s);
  };
  const iconBtn = (icon: string, a11y: string, onPress: () => void) => (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={styles.fieldIcon}
    >
      <Icon source={icon} size={20} color={kit.textSecondary} />
    </TouchableRipple>
  );
  return (
    <View>
      <Text style={[styles.fieldLabel, { color: kit.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.pwBox,
          {
            backgroundColor: kit.fieldBg,
            borderColor: focused ? kit.primary : kit.border,
            borderWidth: focused ? 1.5 : 1,
          },
        ]}
      >
        <Icon source="mi:lock-outline" size={20} color={kit.textSecondary} />
        <TextInput
          value={v}
          onChangeText={set}
          secureTextEntry={!visible}
          textContentType="newPassword"
          autoComplete="new-password"
          autoCapitalize="none"
          placeholder="••••••••"
          placeholderTextColor={kit.textMuted}
          selectionColor={kit.primary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          accessibilityHint={v ? `Robustesse : ${LEVELS[score]}` : undefined}
          style={[styles.pwInput, { color: kit.textPrimary }]}
        />
        {generator
          ? iconBtn('mi:auto-fix-high', 'Générer', () => {
              set(generatePassword(seed));
              setSeed(seed + 1);
              setVisible(true);
            })
          : null}
        {iconBtn(visible ? 'mi:visibility-off' : 'mi:visibility', visible ? 'Masquer' : 'Afficher', () =>
          setVisible(!visible),
        )}
      </View>
      <View style={[styles.row, styles.mt8]}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.gauge,
              i > 0 && styles.ml4,
              { backgroundColor: v && i < Math.max(1, score) ? col : kit.fieldBg },
            ]}
          />
        ))}
        <Text style={[styles.level, { color: textCol }]}>{v ? LEVELS[score] : ''}</Text>
      </View>
      <View style={[styles.rules, styles.mt8]}>
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(v);
          return (
            <View
              key={r.label}
              style={styles.rule}
              accessible
              accessibilityLabel={`${r.label} : ${ok ? 'respecté' : 'non respecté'}`}
            >
              <Icon
                source={ok ? 'mi:check-circle' : 'mi:radio-button-unchecked'}
                size={15}
                color={ok ? kit.success : kit.textMuted}
              />
              <Text style={[styles.ruleText, { color: ok ? kit.textPrimary : kit.textMuted }]}>{r.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** `<app-copy-field>` : valeur en lecture seule, bouton copier avec retour visuel, masquage (`CopyField` Flutter). */
export function CopyField({
  value,
  label,
  secret = false,
  mono = true,
  icon,
}: {
  value: string;
  label?: string;
  secret?: boolean;
  mono?: boolean;
  icon?: string;
}) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const shown = secret && !revealed ? '•'.repeat(Math.min(24, value.length)) : value;
  const box = (
    <View style={[styles.copy, { backgroundColor: kit.fieldBg, borderColor: kit.border }]}>
      {icon ? <Icon source={icon} size={20} color={kit.textSecondary} /> : null}
      <Text
        numberOfLines={1}
        accessibilityLabel={secret && !revealed ? `${label ?? 'Valeur'} masquée` : value}
        style={[mono ? styles.copyMono : styles.copyText, styles.fill, { color: kit.textPrimary }]}
      >
        {shown}
      </Text>
      {secret ? (
        <TouchableRipple
          onPress={() => setRevealed(!revealed)}
          borderless
          accessibilityRole="button"
          accessibilityLabel={revealed ? 'Masquer' : 'Afficher'}
          style={styles.fieldIcon}
        >
          <Icon source={revealed ? 'mi:visibility-off' : 'mi:visibility'} size={18} color={kit.textSecondary} />
        </TouchableRipple>
      ) : null}
      <TouchableRipple
        onPress={async () => {
          await snack.copy(value, 'Copié dans le presse-papiers');
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1500);
        }}
        borderless
        accessibilityRole="button"
        accessibilityLabel={copied ? 'Copié' : 'Copier'}
        style={styles.fieldIcon}
      >
        <Icon
          source={copied ? 'mi:check' : 'mi:content-copy'}
          size={18}
          color={copied ? kit.success : kit.textSecondary}
        />
      </TouchableRipple>
    </View>
  );
  return label ? (
    <View>
      <Text style={[styles.fieldLabel, { color: kit.textSecondary }]}>{label}</Text>
      {box}
    </View>
  ) : (
    box
  );
}

/** `<app-tag-input>` : tags libres (Entrée / virgule), suggestions, limite (`TagInput` Flutter). */
export function TagInput({
  tags,
  onChange,
  suggestions = [],
  max,
  hint = 'Ajouter un tag…',
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  max?: number;
  hint?: string;
}) {
  const { kit } = useKitTheme();
  const [text, setText] = useState('');
  const full = max !== undefined && tags.length >= max;
  const add = (raw: string) => {
    const t = raw.trim().replace(/,/g, '');
    setText('');
    if (!t || tags.some((x) => x.toLowerCase() === t.toLowerCase()) || full) return;
    onChange([...tags, t]);
  };
  const q = text.trim().toLowerCase();
  const sugg = suggestions.filter((s) => !tags.includes(s) && (!q || s.toLowerCase().includes(q))).slice(0, 8);
  return (
    <View style={styles.gap8}>
      <View style={[styles.tags, { backgroundColor: kit.fieldBg, borderColor: kit.border }]}>
        {tags.map((t) => (
          <InputChip key={t} label={t} tinted onRemove={() => onChange(tags.filter((x) => x !== t))} />
        ))}
        <TextInput
          value={text}
          editable={!full}
          onChangeText={(v) => (v.endsWith(',') ? add(v) : setText(v))}
          onSubmitEditing={() => add(text)}
          submitBehavior="submit"
          returnKeyType="done"
          autoCapitalize="none"
          placeholder={full ? 'Limite atteinte' : hint}
          placeholderTextColor={kit.textMuted}
          selectionColor={kit.primary}
          accessibilityLabel={hint}
          style={[styles.tagInput, { color: kit.textPrimary }]}
        />
      </View>
      {sugg.length && !full ? (
        <View style={styles.wrap6}>
          {sugg.map((s) => (
            <KitChip key={s} label={s} icon="mi:add" onPress={() => add(s)} />
          ))}
        </View>
      ) : null}
      {max !== undefined ? (
        <Text style={[styles.count, { color: kit.textMuted }]}>{`${tags.length} / ${max}`}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  gap8: { gap: space.s2 },
  wrap6: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  mt8: { marginTop: space.s2 },
  ml4: { marginLeft: 4 },
  otp: { flexDirection: 'row', alignSelf: 'center' },
  otpCell: { width: 44, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  otpChar: font('700', 22, 'heading'),
  otpInput: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.011, color: 'transparent' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.s1,
    borderRadius: 999,
    borderWidth: 1,
  },
  stepBtn: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepValue: { ...font('700', 16), ...tabular, textAlign: 'center' },
  stepUnit: font('500', 12),
  money: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    minHeight: 52,
    borderRadius: radius.input,
    paddingLeft: space.s3,
    paddingRight: space.s1,
  },
  moneyInput: { ...font('700', 18), ...tabular, flex: 1, textAlign: 'right', paddingVertical: space.s3 },
  currency: { ...font('700', 14), paddingHorizontal: space.s2 },
  curBtn: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingLeft: space.s1, borderRadius: radius.sm },
  star: { paddingHorizontal: 1, borderRadius: 999 },
  starStatic: { paddingHorizontal: 1 },
  ratingLabel: { ...font('600', 14), marginLeft: 10 },
  fieldLabel: { ...font('600', 12), marginBottom: 6 },
  pwBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    minHeight: MIN_TOUCH,
    borderRadius: radius.input,
    paddingLeft: space.s3,
  },
  pwInput: { ...font('400', 14), flex: 1, paddingVertical: space.s3 },
  fieldIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  gauge: { flex: 1, height: 4, borderRadius: 2 },
  level: { ...font('700', 11.5), width: 72, marginLeft: 10 },
  rules: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ruleText: font('400', 12),
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: MIN_TOUCH,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingLeft: space.s3,
  },
  copyMono: font('400', 13, 'mono'),
  copyText: font('400', 13),
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    padding: space.s2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  tagInput: { ...font('400', 14), minWidth: 120, maxWidth: 220, flexGrow: 1, paddingVertical: space.s1 },
  count: { ...font('400', 11.5), textAlign: 'right' },
});
