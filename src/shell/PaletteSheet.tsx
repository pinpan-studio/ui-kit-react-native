import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { KitBottomSheet } from '../components';
import { KitIconButton } from '../mobile';
import { MIN_TOUCH, space } from '../theme/tokens';
import { ThemeSettings } from './ThemeSettings';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Feuille « Apparence » (`showThemeSheet` Flutter) : mode clair / sombre / système et 41 palettes.
 * `KitBottomSheet` : poignée et coins de 24 comme la feuille Flutter, glissé pour fermer, sortie animée,
 * retour Android.
 */
export function PaletteSheet({ visible, onDismiss }: Props) {
  return (
    <KitBottomSheet visible={visible} onDismiss={onDismiss} maxHeightRatio={0.85}>
      <View style={styles.header}>
        <Text variant="titleLarge" accessibilityRole="header" style={styles.flex}>
          Apparence
        </Text>
        <KitIconButton icon="close" accessibilityLabel="Fermer les réglages d’apparence" onPress={onDismiss} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <ThemeSettings />
      </ScrollView>
    </KitBottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH,
    marginBottom: space.s2,
    paddingHorizontal: space.l,
  },
  flex: { flex: 1 },
  body: { paddingHorizontal: space.l, paddingBottom: space.s4 },
});
