import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { KitButton, KitIconButton } from '../../components';
import { Page } from '../../shell/Page';
import { AuthenticationExample } from '../../showcase/AuthenticationExample';
import { ExampleForm } from '../../showcase/ExampleForms';
import { ExAppShell } from '../../showcase/examples/ExAppShell';
import { DemoBar } from '../../showcase/layouts/DemoBar';
import { pageExampleBySlug } from '../../showcase/pageExamples';
import { space, useKitTheme } from '../../theme';

/** `/pages/<slug>` — écran d'exemple en plein écran : shell applicatif, authentification ou formulaire. */
export default function PageExampleScreen() {
  const { kit } = useKitTheme();
  const { slug = '' } = useLocalSearchParams<{ slug: string }>();
  const example = pageExampleBySlug(slug);
  if (!example)
    return (
      <Page>
        <Text variant="titleLarge">Page introuvable</Text>
        <KitButton label="Retour aux pages d’exemple" variant="ghost" onPress={() => router.replace('/pages')} />
      </Page>
    );
  if (example.shell) return <ExAppShell initial={example.shell} />;
  return (
    <View style={[styles.fill, { backgroundColor: kit.bg }]} testID={`page-${slug}`}>
      <DemoBar
        leading={<KitIconButton icon="mi:arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />}
        title={example.title}
      />
      <ScrollView contentContainerStyle={styles.body}>
        {slug.startsWith('auth-') ? <AuthenticationExample slug={slug} /> : <ExampleForm slug={slug} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { padding: space.s4, gap: space.s3 },
});
