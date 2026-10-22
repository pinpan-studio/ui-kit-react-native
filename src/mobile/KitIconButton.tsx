import { IconButton, type IconButtonProps } from 'react-native-paper';

import { MIN_TOUCH } from '../theme/tokens';

type Props = Omit<IconButtonProps, 'accessibilityLabel'> & {
  /** Obligatoire : nom lu par TalkBack / VoiceOver. */
  accessibilityLabel: string;
};

/** IconButton avec une zone tactile d'au moins 48 × 48 dp, quelle que soit la taille de l'icône. */
export function KitIconButton({ size = 24, style, ...rest }: Props) {
  const box = Math.max(MIN_TOUCH, size + 16);
  return (
    <IconButton
      size={size}
      accessibilityRole="button"
      style={[{ width: box, height: box, borderRadius: box / 2, margin: 0 }, style]}
      {...rest}
    />
  );
}
