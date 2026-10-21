import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KitIconButton, useBackClose } from '../mobile';
import { MIN_TOUCH, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';
import { ThemeSettings } from './ThemeSettings';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

/** Feuille « Apparence » (`showThemeSheet` Flutter) : mode clair / sombre / système et 41 palettes. */
export function PaletteSheet({ visible, onDismiss }: Props) {
  const theme = useKitTheme();
  const insets = useSafeAreaInsets();
  const close = useCallback(() => onDismiss(), [onDismiss]);
  useBackClose(visible, close);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={close}
        style={styles.modal}
        contentContainerStyle={[
          styles.sheet,
          { backgroundColor: theme.roles.surfaceContainerLow, paddingBottom: insets.bottom + space.s4 },
        ]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" accessibilityRole="header" style={styles.flex}>
            Apparence
          </Text>
          <KitIconButton icon="close" accessibilityLabel="Fermer les réglages d’apparence" onPress={close} />
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <ThemeSettings />
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: space.l,
    paddingTop: space.s2,
    maxHeight: '85%',
  },
  header: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TOUCH, marginBottom: space.s2 },
  flex: { flex: 1 },
  body: { paddingBottom: space.s4 },
});
