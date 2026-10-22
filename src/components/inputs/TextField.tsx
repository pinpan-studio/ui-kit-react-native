import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Icon } from 'react-native-paper';

import { MIN_TOUCH, font, radius, space, useKitTheme, withAlpha } from '../../theme';

/** Motif « field-box » : libellé 12/600 au-dessus d'un champ, aide ou erreur dessous (`FormFieldLabel` Flutter). */
export function FormFieldLabel({
  label,
  children,
  required = false,
  hint,
  error,
  hintAlign = 'left',
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
  hintAlign?: 'left' | 'right';
}) {
  const { kit } = useKitTheme();
  return (
    <View>
      <Text style={[styles.label, { color: kit.textSecondary }]}>
        {label}
        {required ? <Text style={{ color: kit.error }}> *</Text> : null}
      </Text>
      {children}
      {error || hint ? (
        <Text
          style={[styles.hint, { color: error ? kit.errorText : kit.textMuted, textAlign: error ? 'left' : hintAlign }]}
        >
          {error ?? hint}
        </Text>
      ) : null}
    </View>
  );
}

export interface KitTextFieldProps extends Omit<TextInputProps, 'style' | 'editable' | 'secureTextEntry'> {
  label?: string;
  hint?: string;
  icon?: string;
  suffix?: ReactNode;
  /** Plusieurs lignes : nombre de lignes visibles au minimum. */
  lines?: number;
  obscure?: boolean;
  enabled?: boolean;
  required?: boolean;
  helper?: string;
  errorText?: string;
  /** Lecture seule : non modifiable mais pleinement lisible (pas d'atténuation). */
  readOnly?: boolean;
  /** Masque de saisie : `#` chiffre, `A` lettre, `*` alphanumérique, le reste est littéral. */
  mask?: string;
  /** Validation réussie : contour success. */
  success?: boolean;
  /** Compteur `n / maxLength` sous le champ. */
  counter?: boolean;
}

const MASK_TEST: Record<string, RegExp> = { '#': /\d/, A: /[a-zA-Z]/, '*': /[a-zA-Z0-9]/ };

/** Applique un masque de saisie (`MaskFormatter` Flutter) ; les littéraux sont insérés automatiquement. */
export function maskFormat(mask: string, input: string, upperCase = true): string {
  const raw = input.replace(/[^a-zA-Z0-9]/g, '');
  let out = '';
  let i = 0;
  for (let m = 0; m < mask.length && i < raw.length; m++) {
    const mc = mask[m] ?? '';
    const test = MASK_TEST[mc];
    if (test) {
      while (i < raw.length && !test.test(raw[i] ?? '')) i++;
      if (i >= raw.length) break;
      const ch = raw[i] ?? '';
      out += upperCase ? ch.toUpperCase() : ch;
      i++;
    } else {
      out += mc;
      if (raw[i] === mc) i++;
    }
  }
  return out;
}

/**
 * Champ texte « field-box » (`KitTextField` Flutter) : fond surface-high, contour fin de rayon 12,
 * focus primaire 1,5, erreur rouge.
 */
export function KitTextField({
  label,
  hint,
  icon,
  suffix,
  lines,
  obscure = false,
  enabled = true,
  required = false,
  helper,
  errorText,
  readOnly = false,
  mask,
  success = false,
  counter = false,
  onFocus,
  onBlur,
  onChangeText,
  accessibilityLabel,
  ...input
}: KitTextFieldProps) {
  const { kit } = useKitTheme();
  const [focused, setFocused] = useState(false);
  const [length, setLength] = useState((input.value ?? input.defaultValue ?? '').length);
  const [masked, setMasked] = useState(mask ? maskFormat(mask, input.defaultValue ?? '') : '');
  const borderColor = errorText
    ? kit.error
    : focused
      ? kit.primary
      : success
        ? kit.success
        : enabled
          ? kit.border
          : withAlpha(kit.border, 0.5);
  const change = (text: string) => {
    const next = mask ? maskFormat(mask, text) : text;
    if (mask) setMasked(next);
    setLength(next.length);
    onChangeText?.(next);
  };
  const multiline = !obscure && (lines ?? 1) > 1;

  const field = (
    <View
      style={[
        styles.box,
        {
          backgroundColor: kit.fieldBg,
          borderColor,
          borderWidth: focused || errorText ? 1.5 : 1,
          opacity: enabled ? 1 : 0.6,
        },
      ]}
    >
      {icon ? <Icon source={icon} size={20} color={kit.textSecondary} /> : null}
      <TextInput
        {...input}
        {...(mask ? { value: masked, defaultValue: undefined } : null)}
        onChangeText={change}
        editable={enabled && !readOnly}
        secureTextEntry={obscure}
        multiline={multiline}
        numberOfLines={multiline ? lines : undefined}
        placeholder={hint}
        placeholderTextColor={kit.textMuted}
        selectionColor={kit.primary}
        cursorColor={kit.primary}
        accessibilityLabel={accessibilityLabel ?? label ?? hint}
        accessibilityHint={errorText ?? helper}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          { color: kit.textPrimary },
          multiline && { minHeight: (lines ?? 1) * 21.7, textAlignVertical: 'top' },
        ]}
      />
      {suffix}
    </View>
  );
  const helperText = counter && input.maxLength ? `${length} / ${input.maxLength}` : helper;
  if (!label) {
    return errorText ? (
      <View>
        {field}
        <Text style={[styles.hint, { color: kit.errorText }]}>{errorText}</Text>
      </View>
    ) : (
      field
    );
  }
  return (
    <FormFieldLabel
      label={label}
      required={required}
      hint={helperText}
      error={errorText}
      hintAlign={counter ? 'right' : 'left'}
    >
      {field}
    </FormFieldLabel>
  );
}

const styles = StyleSheet.create({
  label: { ...font('600', 12), marginBottom: 6 },
  hint: { ...font('400', 11.5), marginTop: space.s1 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    minHeight: MIN_TOUCH,
    borderRadius: radius.input,
    paddingHorizontal: space.s3,
  },
  input: { ...font('400', 14), flex: 1, paddingVertical: space.s3 },
});

/** Barre de recherche compacte en pilule (`KitSearchBar` Flutter, `.m3-search-bar`). */
export function KitSearchBar({
  value,
  onChangeText,
  hint = 'Rechercher…',
  trailing,
}: {
  value?: string;
  onChangeText?: (text: string) => void;
  hint?: string;
  trailing?: ReactNode;
}) {
  const { kit } = useKitTheme();
  return (
    <View style={[searchStyles.bar, { backgroundColor: kit.card, borderColor: kit.border }]}>
      <Icon source="mi:search" size={20} color={kit.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={hint}
        placeholderTextColor={kit.textMuted}
        selectionColor={kit.primary}
        accessibilityLabel={hint}
        returnKeyType="search"
        style={[searchStyles.input, { color: kit.textPrimary }]}
      />
      {trailing}
    </View>
  );
}

const searchStyles = StyleSheet.create({
  bar: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    borderRadius: 999,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
  },
  input: { ...font('400', 14), flex: 1, paddingVertical: space.s2 },
});
