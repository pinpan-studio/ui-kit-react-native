import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';

import { DEMO_CLIENTS } from '../../data/showcase';
import { Page } from '../../shell/Page';
import { AppShellDemo } from '../../showcase/layouts/AppShellDemo';
import { AuthDemo } from '../../showcase/layouts/AuthDemo';
import { DetailPageDemo } from '../../showcase/layouts/DetailPageDemo';
import { PublicPageDemo } from '../../showcase/layouts/PublicPageDemo';

/** `/layouts/<démo>` — exemple vivant d'un gabarit, en plein écran (sans la navigation du catalogue). */
export default function LayoutDemoPage() {
  const { demo, client } = useLocalSearchParams<{ demo: string; client?: string }>();
  if (demo === 'shell') return <AppShellDemo />;
  if (demo === 'detail')
    return <DetailPageDemo client={DEMO_CLIENTS.find((c) => c.id === client) ?? DEMO_CLIENTS[0]!} />;
  if (demo === 'auth') return <AuthDemo />;
  if (demo === 'public') return <PublicPageDemo />;
  return (
    <Page>
      <Text variant="bodyLarge">Gabarit inconnu.</Text>
    </Page>
  );
}
