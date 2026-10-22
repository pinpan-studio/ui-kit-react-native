import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KitAppBar } from '../../components';
import { useKitTheme } from '../../theme';

/** Barre d'application des démos plein écran : sous la barre d'état, fond de page ou transparent. */
export function DemoBar({
  leading,
  title,
  actions,
  transparent = false,
}: {
  leading?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  transparent?: boolean;
}) {
  const { kit } = useKitTheme();
  const insets = useSafeAreaInsets();
  const background = transparent ? 'transparent' : kit.bg;
  return (
    <View style={[styles.bar, { paddingTop: insets.top, backgroundColor: background }]}>
      <KitAppBar leading={leading} title={title} actions={actions} background={background} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { zIndex: 1 },
});
