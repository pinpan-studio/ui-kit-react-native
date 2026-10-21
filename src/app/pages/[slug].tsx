import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';

import { KitButton } from '../../components';
import { Page } from '../../shell/Page';
import { ExampleScreen } from '../../showcase/examples/ExampleScreen';
import { pageExampleBySlug } from '../../showcase/pageExamples';

/** `/pages/<slug>` — page d'exemple en plein écran. */
export default function PageExampleScreen() {
  const { slug = '' } = useLocalSearchParams<{ slug: string }>();
  const page = pageExampleBySlug(slug);
  if (!page)
    return (
      <Page>
        <Text variant="titleLarge">Page introuvable</Text>
        <KitButton label="Retour aux pages d’exemple" variant="ghost" onPress={() => router.replace('/pages')} />
      </Page>
    );
  return <ExampleScreen page={page} />;
}
