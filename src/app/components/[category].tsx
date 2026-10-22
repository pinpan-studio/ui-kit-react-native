import { useLocalSearchParams } from 'expo-router';
import type { ComponentType } from 'react';
import { Text } from 'react-native-paper';

import { Page } from '../../shell/Page';
import { ButtonsGallery } from '../../showcase/ButtonsGallery';
import { DataGallery } from '../../showcase/DataGallery';
import { FeedbackGallery } from '../../showcase/FeedbackGallery';
import { FieldsGallery } from '../../showcase/FieldsGallery';
import { FormsGallery } from '../../showcase/FormsGallery';
import { InteractionsGallery } from '../../showcase/InteractionsGallery';
import { LayoutGallery } from '../../showcase/LayoutGallery';
import { MapsGallery } from '../../showcase/MapsGallery';
import { MaterialGallery } from '../../showcase/MaterialGallery';
import { MediaGallery } from '../../showcase/MediaGallery';
import { NavigationGallery } from '../../showcase/NavigationGallery';
import { PlanningGallery } from '../../showcase/PlanningGallery';
import { TypographyGallery } from '../../showcase/TypographyGallery';

/** Galerie de chaque catégorie du catalogue (`kitNav`). */
const GALLERIES: Record<string, ComponentType<{ initialSection?: string }>> = {
  typography: TypographyGallery,
  forms: FormsGallery,
  fields: FieldsGallery,
  buttons: ButtonsGallery,
  navigation: NavigationGallery,
  data: DataGallery,
  feedback: FeedbackGallery,
  planning: PlanningGallery,
  maps: MapsGallery,
  media: MediaGallery,
  interactions: InteractionsGallery,
  material: MaterialGallery,
  layout: LayoutGallery,
};

/** `/components/<catégorie>?section=<id>` : galerie ouverte sur la section demandée. */
export default function CategoryPage() {
  const { category, section } = useLocalSearchParams<{ category: string; section?: string }>();
  const Gallery = GALLERIES[String(category)];
  if (!Gallery)
    return (
      <Page>
        <Text variant="bodyLarge">Catégorie inconnue.</Text>
      </Page>
    );
  return <Gallery key={section} initialSection={section} />;
}
