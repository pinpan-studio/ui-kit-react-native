import { Link } from 'expo-router';
import { Text } from 'react-native-paper';

import { Page } from '../shell/Page';

export default function NotFound() {
  return (
    <Page>
      <Text variant="titleLarge">Page introuvable</Text>
      <Link href="/">Retour à l’accueil</Link>
    </Page>
  );
}
