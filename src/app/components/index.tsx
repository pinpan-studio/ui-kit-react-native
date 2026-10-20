import { router } from 'expo-router';
import { List } from 'react-native-paper';

import { Page } from '../../shell/Page';
import { KIT_CATEGORIES } from '../../showcase/kitNav';
import { MIN_TOUCH } from '../../theme/tokens';

/** Index des composants (`ComponentsIndexPage` de Flutter) : les 13 catégories du catalogue. */
export default function ComponentsIndex() {
  return (
    <Page testID="components-index">
      {KIT_CATEGORIES.map((c) => (
        <List.Item
          key={c.id}
          title={c.label}
          description={c.description}
          descriptionNumberOfLines={3}
          left={(p) => <List.Icon {...p} icon={c.icon} />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          style={{ minHeight: MIN_TOUCH }}
          onPress={() => router.navigate(`/components/${c.id}`)}
          accessibilityLabel={`${c.label}, ${c.sections.length} sections`}
        />
      ))}
    </Page>
  );
}
