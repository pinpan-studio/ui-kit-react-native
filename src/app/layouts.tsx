import { Text } from 'react-native-paper';

import { Page } from '../shell/Page';

export default function LayoutsPage() {
  return (
    <Page testID="layouts">
      <Text variant="titleLarge" accessibilityRole="header">
        Layouts
      </Text>
      <Text variant="bodyLarge">
        Gabarits d’écran (shell, fiche détail, authentification, page publique) — étape 3.
      </Text>
    </Page>
  );
}
