import { Text } from 'react-native-paper';

import { Page } from '../shell/Page';

export default function ExamplesIndex() {
  return (
    <Page testID="examples">
      <Text variant="titleLarge" accessibilityRole="header">
        Pages d’exemple
      </Text>
      <Text variant="bodyLarge">Connexion, formulaires, applications et galeries — à venir (étape 3).</Text>
    </Page>
  );
}
