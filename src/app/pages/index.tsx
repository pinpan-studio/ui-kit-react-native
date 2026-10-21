import { router } from 'expo-router';
import { List, Text } from 'react-native-paper';

import { Page } from '../../shell/Page';
import { PAGE_EXAMPLES } from '../../showcase/pageExamples';
import { MIN_TOUCH } from '../../theme/tokens';

const GROUPS = ['Application', 'Authentification', 'Formulaires'] as const;

export default function PagesGallery() {
  return (
    <Page testID="pages-gallery">
      <Text variant="titleLarge" accessibilityRole="header">
        Pages d’exemple
      </Text>
      <Text variant="bodyLarge">
        33 écrans de démonstration, adaptés au mobile et construits avec les composants du kit.
      </Text>
      {GROUPS.map((group) => (
        <List.Section key={group} title={group}>
          {PAGE_EXAMPLES.filter((item) => item.group === group).map((item) => (
            <List.Item
              key={item.slug}
              title={item.title}
              description={item.description}
              left={(props) => <List.Icon {...props} icon={item.icon} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              style={{ minHeight: MIN_TOUCH }}
              onPress={() => router.push(`/pages/${item.slug}`)}
            />
          ))}
        </List.Section>
      ))}
    </Page>
  );
}
