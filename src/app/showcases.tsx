import { Text } from 'react-native-paper';

import { Page } from '../shell/Page';

export default function ShowcasesGallery() {
  return (
    <Page testID="showcases">
      <Text variant="titleLarge" accessibilityRole="header">
        Showcases
      </Text>
      <Text variant="bodyLarge">Vitrines d’applications complètes — à venir (étape 3).</Text>
    </Page>
  );
}
