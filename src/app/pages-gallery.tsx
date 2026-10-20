import { Text } from 'react-native-paper';

import { Page } from '../shell/Page';

export default function PagesGallery() {
  return (
    <Page testID="pages-gallery">
      <Text variant="titleLarge" accessibilityRole="header">
        Galerie des pages
      </Text>
      <Text variant="bodyLarge">Vignettes de toutes les pages d’exemple — à venir (étape 3).</Text>
    </Page>
  );
}
