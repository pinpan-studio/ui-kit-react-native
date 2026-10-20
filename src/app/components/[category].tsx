import { useLocalSearchParams } from 'expo-router';
import { List, Text } from 'react-native-paper';

import { Page } from '../../shell/Page';
import { categoryById } from '../../showcase/kitNav';

/** Galerie d'une catégorie : sections listées, composants livrés à l'étape 2. */
export default function CategoryPage() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const cat = categoryById(String(category));
  if (!cat)
    return (
      <Page>
        <Text variant="bodyLarge">Catégorie inconnue.</Text>
      </Page>
    );
  return (
    <Page testID={`category-${cat.id}`}>
      <Text variant="bodyLarge">{cat.description}</Text>
      <Text variant="bodySmall">Composants à venir à l’étape 2.</Text>
      {cat.sections.map((s) => (
        <List.Item key={s.id} title={s.label} left={(p) => <List.Icon {...p} icon="circle-small" />} />
      ))}
    </Page>
  );
}
