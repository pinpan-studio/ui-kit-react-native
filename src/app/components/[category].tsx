import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';

import { Page } from '../../shell/Page';
import { ButtonsGallery } from '../../showcase/components/ButtonsGallery';
import { DocPage } from '../../showcase/doc/DocPage';
import { categoryById } from '../../showcase/kitNav';

/** Galerie d'une catégorie ; `?section=<id>` fait défiler jusqu'à la section. */
export default function CategoryPage() {
  const { category, section } = useLocalSearchParams<{ category: string; section?: string }>();
  const cat = categoryById(String(category));
  const initial = typeof section === 'string' ? section : undefined;
  if (!cat) {
    return (
      <Page>
        <Text variant="bodyLarge">Catégorie inconnue.</Text>
      </Page>
    );
  }
  if (cat.id === 'buttons') return <ButtonsGallery initialSection={initial} />;
  return (
    <DocPage
      testID={`category-${cat.id}`}
      title={cat.label}
      subtitle={cat.description}
      initialSection={initial}
      sections={cat.sections.map((s) => ({ id: s.id, title: s.label, description: 'Composants à venir.' }))}
    />
  );
}
