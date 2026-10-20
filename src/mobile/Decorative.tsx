import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

/** Élément purement décoratif : ignoré par les lecteurs d'écran. */
export function Decorative({ children, ...rest }: ViewProps & { children?: ReactNode }) {
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden {...rest}>
      {children}
    </View>
  );
}
