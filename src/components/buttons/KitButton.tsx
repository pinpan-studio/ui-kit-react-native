import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { fontFamily } from '../../theme/fonts';
import { elevation, MIN_TOUCH } from '../../theme/tokens';
import { useKitTheme } from '../../theme/useKitTheme';
import { buttonColors, type KitButtonVariant } from './buttonColors';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export type KitButtonSize = 'compact' | 'standard' | 'create' | 'large';
export type KitButtonShape = 'pill' | 'rounded';

/** Hauteurs visuelles Flutter ; la zone tactile est portée à 48 dp par hitSlop. */
export const BUTTON_HEIGHTS: Record<KitButtonSize, number> = { compact: 32, standard: 40, create: 42, large: 48 };

export interface KitButtonProps {
  label: string;
  onPress?: () => void;
  variant?: KitButtonVariant;
  icon?: IconName;
  iconEnd?: IconName;
  loading?: boolean;
  loadingLabel?: string;
  size?: KitButtonSize;
  shape?: KitButtonShape;
  expand?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Bouton du kit (KitButton Flutter). Sans `onPress` : désactivé (M3 38 % / 12 %). */
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
  const theme = useKitTheme();
  const disabled = !onPress && !loading;
  const col = buttonColors(variant, theme, disabled);
  const height = BUTTON_HEIGHTS[size];
  const slop = Math.max(0, (MIN_TOUCH - height) / 2);
  const iconSize = size === 'compact' ? 16 : 18;
  const text = loading ? (loadingLabel ?? label) : label;
  return (
    <Pressable
      testID={testID}
      onPress={loading ? undefined : onPress}
      disabled={disabled || loading}
      hitSlop={{ top: slop, bottom: slop }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      android_ripple={{ color: `${col.fg}1a`, borderless: false }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: height,
          paddingHorizontal: size === 'compact' ? 14 : 20,
          borderRadius: shape === 'pill' ? height / 2 : 10,
          backgroundColor: col.bg ?? 'transparent',
          borderWidth: col.border ? 1 : 0,
          borderColor: col.border ?? 'transparent',
          alignSelf: expand ? 'stretch' : 'flex-start',
          opacity: pressed ? 0.9 : 1,
        },
        col.elevation ? elevation(1, theme.colorMode) : null,
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size={iconSize} color={col.fg} testID={testID ? `${testID}-spinner` : undefined} />
        ) : icon ? (
          <MaterialCommunityIcons name={icon} size={iconSize} color={col.fg} />
        ) : null}
        <Text
          numberOfLines={1}
          style={{
            color: col.fg,
            fontFamily: fontFamily('body', '600'),
            fontSize: size === 'compact' ? 13 : 14,
            flexShrink: 1,
          }}
        >
          {text}
        </Text>
        {iconEnd ? <MaterialCommunityIcons name={iconEnd} size={iconSize} color={col.fg} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { justifyContent: 'center', minWidth: 64, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 6 },
});
