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
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
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
        <Text style={[styles.hint, { color: error ? kit.errorText : kit.textMuted }]}>{error ?? hint}</Text>
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
  onFocus,
  onBlur,
  accessibilityLabel,
  ...input
}: KitTextFieldProps) {
  const { kit } = useKitTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = errorText ? kit.error : focused ? kit.primary : enabled ? kit.border : withAlpha(kit.border, 0.5);
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
        editable={enabled}
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
    <FormFieldLabel label={label} required={required} hint={helper} error={errorText}>
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
