import { Text } from 'react-native-paper';

import { Page } from '../shell/Page';

export default function HarnaisPage() {
  return (
    <Page testID="harnais">
      <Text variant="titleLarge" accessibilityRole="header">
        Harnais
      </Text>
      <Text variant="bodyLarge">Harnais de test des composants — étape 2.</Text>
    </Page>
  );
}
