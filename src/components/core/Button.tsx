import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ActivityIndicator, Icon, TouchableRipple } from 'react-native-paper';

import { MIN_TOUCH, elevation, font, radius, sizes, space, useKitTheme, withAlpha } from '../../theme';

/**
 * Variantes (correspondance Angular Material) : primary = flat · raised · secondary = contour primaire ·
 * outline = contour neutre · ghost = texte · danger = warn · success · tertiary.
 */
export type KitButtonVariant =
  | 'primary'
  | 'raised'
  | 'tonal'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'dangerOutline'
  | 'success'
  | 'tertiary';
export type KitButtonSize = keyof typeof sizes.button;
export type KitButtonShape = 'pill' | 'rounded';

export interface KitButtonProps {
  label: string;
  /** Absent : bouton désactivé. */
  onPress?: () => void;
  variant?: KitButtonVariant;
  icon?: string;
  iconEnd?: string;
  loading?: boolean;
  loadingLabel?: string;
  size?: KitButtonSize;
  shape?: KitButtonShape;
  /** Pleine largeur. */
  expand?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Bouton du kit (`KitButton` Flutter) : pilule 40 dp, Inter 600, 9 variantes, 4 tailles, état de chargement. */
export function KitButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconEnd,
  loading = false,
  loadingLabel,
  size = 'standard',
  shape = 'pill',
  expand = false,
  accessibilityLabel,
  style,
  testID,
}: KitButtonProps) {
  const { kit, roles, colorMode } = useKitTheme();

  const spec: Record<KitButtonVariant, { bg?: string; fg: string; border?: string }> = {
    primary: { bg: kit.primary, fg: kit.onPrimary },
    raised: { bg: roles.surfaceContainerLow, fg: kit.primary },
    tonal: { bg: roles.secondaryContainer, fg: roles.onSecondaryContainer },
    secondary: { fg: kit.primary, border: roles.outlineVariant },
    outline: { fg: kit.textPrimary, border: roles.outlineVariant },
    ghost: { fg: kit.primary },
    danger: { bg: kit.error, fg: roles.onError },
    dangerOutline: { fg: kit.error, border: withAlpha(kit.error, 0.5) },
    // Flutter : texte blanc. On garde #052e16 (contraste AA 6,54:1, le blanc n'atteint que 2,3:1).
    success: { bg: kit.success, fg: kit.onSuccess },
    tertiary: { bg: kit.tertiary, fg: roles.onTertiary },
  };
  const { bg, fg, border } = spec[variant];

  const inactive = loading || !onPress;
  const disabledLayer = withAlpha(kit.textPrimary, 0.12);
  const background = bg ? (inactive ? disabledLayer : bg) : 'transparent';
  const color = inactive && !loading ? withAlpha(kit.textPrimary, 0.38) : fg;
  const borderColor = border && (inactive ? disabledLayer : border);

  const height = sizes.button[size];
  const compact = size === 'compact';
  const iconSize = compact ? sizes.buttonIcon.compact : sizes.buttonIcon.standard;
  const corner = shape === 'pill' ? height / 2 : 10;
  const slop = Math.max(0, (MIN_TOUCH - height) / 2);

  return (
    <View
      style={[
        {
          borderRadius: corner,
          backgroundColor: background,
          alignSelf: expand ? 'stretch' : 'flex-start',
        },
        borderColor ? { borderWidth: 1, borderColor } : null,
        variant === 'raised' && !inactive ? elevation(1, colorMode) : null,
        style,
      ]}
    >
      <TouchableRipple
        onPress={onPress}
        disabled={inactive}
        borderless
        rippleColor={withAlpha(fg, 0.1)}
        hitSlop={{ top: slop, bottom: slop }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: inactive, busy: loading }}
        testID={testID}
        style={[
          styles.touch,
          {
            borderRadius: corner,
            minHeight: height - (borderColor ? 2 : 0),
            minWidth: expand ? undefined : sizes.buttonMinWidth,
            paddingHorizontal: compact ? space.s4 : space.s5,
          },
        ]}
      >
        <View style={styles.row}>
          {loading ? (
            <ActivityIndicator size={iconSize} color={fg} />
          ) : icon ? (
            <Icon source={icon} size={iconSize} color={color} />
          ) : null}
          <Text numberOfLines={1} style={[styles.label, compact && styles.labelCompact, { color }]}>
            {loading ? (loadingLabel ?? label) : label}
          </Text>
          {iconEnd ? <Icon source={iconEnd} size={iconSize} color={color} /> : null}
        </View>
      </TouchableRipple>
    </View>
  );
}

/** Lien d'action souligné (`LineAction` Flutter, `.line-action`). */
export function LineAction({
  label,
  onPress,
  icon = 'arrow-right',
}: {
  label: string;
  onPress?: () => void;
  icon?: string | null;
}) {
  const { kit } = useKitTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole="link"
      style={styles.line}
      hitSlop={{ top: space.s3, bottom: space.s3 }}
    >
      <View style={styles.lineRow}>
        <Text style={[styles.lineLabel, { color: kit.primary, textDecorationColor: withAlpha(kit.primary, 0.4) }]}>
          {label}
        </Text>
        {icon ? <Icon source={icon} size={14} color={kit.primary} /> : null}
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  touch: { justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.s2 },
  label: { ...font('600', 14), flexShrink: 1 },
  labelCompact: { fontSize: 13 },
  line: { borderRadius: radius.xs, paddingVertical: space.s1, paddingHorizontal: space.s0_5, alignSelf: 'flex-start' },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: space.s1 },
  lineLabel: { ...font('600', 13), textDecorationLine: 'underline' },
});
