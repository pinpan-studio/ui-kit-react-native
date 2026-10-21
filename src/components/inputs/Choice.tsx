import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, RadioButton, TouchableRipple } from 'react-native-paper';

import { hapticToggle } from '../../mobile/haptics';
import { MIN_TOUCH, font, space, useKitTheme } from '../../theme';

/** État d'une case : cochée, décochée, ou indéterminée (`null`, case parent partiellement cochée). */
export type CheckState = boolean | null;

/**
 * Case à cocher Material 3 sur toutes les plateformes (Paper rend sinon une coche iOS sur iPhone) :
 * carré de 18 dp, coins de 2, contour de 2 ; coche ou tiret sur fond primaire. `null` = indéterminée,
 * annoncée « partiellement cochée ».
 */
export function KitCheckbox({
  value,
  onChange,
  disabled = false,
  error = false,
  accessibilityLabel,
}: {
  value: CheckState;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  accessibilityLabel?: string;
}) {
  const { kit, roles } = useKitTheme();
  const on = value !== false;
  const accent = error ? kit.error : kit.primary;
  const color = disabled ? kit.disabledContent : on ? accent : error ? kit.error : roles.onSurfaceVariant;
  return (
    <TouchableRipple
      onPress={onChange && !disabled ? () => onChange(value !== true) : undefined}
      disabled={disabled || !onChange}
      borderless
      hitSlop={4}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value === null ? 'mixed' : value, disabled: disabled || !onChange }}
      style={styles.checkTarget}
    >
      <View style={[styles.box, { borderColor: color }, on && { backgroundColor: color }]}>
        {on ? (
          <Icon
            source={value === null ? 'mi:remove' : 'mi:check'}
            size={16}
            color={error ? roles.onError : kit.onPrimary}
          />
        ) : null}
      </View>
    </TouchableRipple>
  );
}

/** Ligne de liste M3 commune : contrôle en tête, titre 14/500, sous-titre 12,5. */
function Tile({
  leading,
  trailing,
  title,
  subtitle,
  subtitleColor,
  onPress,
  disabled,
  dense,
  indent = 0,
  role,
  state,
  bold,
}: {
  leading?: ReactNode;
  trailing?: ReactNode;
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  onPress?: () => void;
  disabled?: boolean;
  dense?: boolean;
  indent?: number;
  role: 'checkbox' | 'radio' | 'switch';
  state: { checked?: boolean | 'mixed'; disabled?: boolean };
  bold?: boolean;
}) {
  const { kit } = useKitTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityState={state}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={[styles.tile, { minHeight: dense ? MIN_TOUCH : 56, paddingLeft: indent }]}
    >
      <View style={styles.row}>
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {leading}
        </View>
        <View style={styles.fill}>
          <Text
            style={[
              bold ? styles.titleBold : styles.title,
              { color: disabled ? kit.disabledContent : kit.textPrimary },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: subtitleColor ?? kit.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
        {trailing ? (
          <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {trailing}
          </View>
        ) : null}
      </View>
    </TouchableRipple>
  );
}

/** `CheckboxListTile` (case en tête). */
export function CheckboxTile({
  value,
  onChange,
  title,
  subtitle,
  disabled = false,
  error = false,
  dense = false,
  indent,
  bold,
}: {
  value: CheckState;
  onChange?: (next: boolean) => void;
  title: string;
  subtitle?: string;
  disabled?: boolean;
  error?: boolean;
  dense?: boolean;
  indent?: number;
  bold?: boolean;
}) {
  const { kit } = useKitTheme();
  const toggle = onChange && !disabled ? () => onChange(value !== true) : undefined;
  return (
    <Tile
      role="checkbox"
      state={{ checked: value === null ? 'mixed' : value, disabled: disabled || !onChange }}
      onPress={toggle}
      disabled={disabled || !onChange}
      title={title}
      subtitle={subtitle}
      subtitleColor={error ? kit.errorText : undefined}
      dense={dense}
      indent={indent}
      bold={bold}
      leading={
        <KitCheckbox
          value={value}
          onChange={toggle ? () => toggle() : undefined}
          disabled={disabled || !onChange}
          error={error}
        />
      }
    />
  );
}

/** `RadioListTile` : à placer dans une liste où une seule valeur est choisie. */
export function RadioTile<T extends string>({
  value,
  selected,
  onSelect,
  title,
  subtitle,
  disabled = false,
}: {
  value: T;
  selected: T;
  onSelect: (value: T) => void;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}) {
  const { kit, roles } = useKitTheme();
  const checked = value === selected;
  return (
    <Tile
      role="radio"
      state={{ checked, disabled }}
      onPress={() => onSelect(value)}
      disabled={disabled}
      title={title}
      subtitle={subtitle}
      leading={
        <RadioButton.Android
          value={value}
          status={checked ? 'checked' : 'unchecked'}
          onPress={() => onSelect(value)}
          disabled={disabled}
          color={kit.primary}
          uncheckedColor={roles.onSurfaceVariant}
        />
      }
    />
  );
}

/**
 * Interrupteur Material 3 (`Switch` Flutter) sur toutes les plateformes : piste 52 × 32,
 * pouce de 16 (éteint, contour) ou 24 (allumé, on-primary).
 */
export function KitSwitch({
  value,
  onChange,
  disabled = false,
  accessibilityLabel,
}: {
  value: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const { kit, roles } = useKitTheme();
  const toggle = onChange && !disabled ? () => (hapticToggle(), onChange(!value)) : undefined;
  return (
    <Pressable
      onPress={toggle}
      disabled={!toggle}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !toggle }}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.track,
        value
          ? { backgroundColor: kit.primary, borderColor: kit.primary }
          : { backgroundColor: roles.surfaceContainerHighest, borderColor: roles.outline },
        !toggle && styles.disabled,
      ]}
    >
      <View
        style={[
          value
            ? { width: 24, height: 24, borderRadius: 12, backgroundColor: kit.onPrimary, alignSelf: 'flex-end' }
            : { width: 16, height: 16, borderRadius: 8, backgroundColor: roles.outline, marginLeft: 6 },
        ]}
      />
    </Pressable>
  );
}

/** `SwitchListTile` (interrupteur en fin de ligne). */
export function SwitchTile({
  value,
  onChange,
  title,
  subtitle,
  disabled = false,
}: {
  value: boolean;
  onChange?: (next: boolean) => void;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}) {
  return (
    <Tile
      role="switch"
      state={{ checked: value, disabled: disabled || !onChange }}
      onPress={onChange && !disabled ? () => (hapticToggle(), onChange(!value)) : undefined}
      disabled={disabled || !onChange}
      title={title}
      subtitle={subtitle}
      trailing={<KitSwitch value={value} disabled={disabled || !onChange} />}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  tile: { justifyContent: 'center', borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s2, paddingVertical: space.s1 },
  title: font('500', 14),
  titleBold: font('700', 14),
  subtitle: font('400', 12.5),
  track: { width: 52, height: 32, borderRadius: 16, borderWidth: 2, justifyContent: 'center', paddingHorizontal: 2 },
  disabled: { opacity: 0.38 },
  checkTarget: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  box: { width: 18, height: 18, borderRadius: 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
