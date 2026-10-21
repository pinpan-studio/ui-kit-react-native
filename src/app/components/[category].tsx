import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  DataTable,
  Divider,
  IconButton,
  List,
  ProgressBar,
  RadioButton,
  Searchbar,
  SegmentedButtons,
  Surface,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';

import { Page } from '../../shell/Page';
import { categoryById } from '../../showcase/kitNav';
import { FormsGallery } from '../../showcase/FormsGallery';
import { ButtonsGallery } from '../../showcase/ButtonsGallery';
import { PlanningGallery } from '../../showcase/PlanningGallery';
import { MediaGallery } from '../../showcase/MediaGallery';
import { MapsGallery } from '../../showcase/MapsGallery';
import { InteractionsGallery } from '../../showcase/InteractionsGallery';
import { MaterialGallery } from '../../showcase/MaterialGallery';
import { LayoutGallery } from '../../showcase/LayoutGallery';
import { NavigationGallery } from '../../showcase/NavigationGallery';
import { FieldsGallery } from '../../showcase/FieldsGallery';
import { FeedbackGallery } from '../../showcase/FeedbackGallery';
import { DataGallery } from '../../showcase/DataGallery';
import { TypographyGallery } from '../../showcase/TypographyGallery';
import { radius, space } from '../../theme/tokens';
import { useKitTheme } from '../../theme/useKitTheme';

function SampleCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card mode="outlined">
      <Card.Content style={styles.sample}>
        <Text variant="titleSmall">{title}</Text>
        {children}
      </Card.Content>
    </Card>
  );
}

function ExamplePreview({ category, index }: { category: string; index: number }) {
  const theme = useKitTheme();
  const [checked, setChecked] = useState(index % 2 === 0);
  const [selected, setSelected] = useState('standard');
  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(2);

  if (category === 'typography') {
    return (
      <SampleCard title="Échelle & hiérarchie">
        <Text variant="headlineSmall">Une interface lisible</Text>
        <Text variant="titleMedium">Titre de section en Outfit</Text>
        <Text variant="bodyMedium">Inter pour les textes et les libellés, avec un rythme confortable sur mobile.</Text>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Inter · 14 / 20 · contraste accessible
        </Text>
      </SampleCard>
    );
  }

  if (category === 'forms') {
    return (
      <SampleCard title="Champs & validation">
        <TextInput
          label="Adresse e-mail"
          value={value}
          onChangeText={setValue}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput label="Message" mode="outlined" multiline numberOfLines={3} />
        <View style={styles.inline}>
          <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => setChecked(!checked)} />
          <Text variant="bodyMedium" onPress={() => setChecked(!checked)}>
            J’accepte les conditions
          </Text>
        </View>
        <Button mode="contained" onPress={() => setChecked(true)}>
          Valider le formulaire
        </Button>
      </SampleCard>
    );
  }

  if (category === 'fields') {
    return (
      <SampleCard title="Champs avancés">
        <TextInput
          label="Montant (FCFA)"
          mode="outlined"
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
          left={<TextInput.Affix text="FCFA" />}
        />
        <View style={styles.inline}>
          <IconButton
            icon="minus"
            mode="outlined"
            accessibilityLabel="Diminuer"
            onPress={() => setCount(Math.max(0, count - 1))}
          />
          <Text variant="titleMedium">{count}</Text>
          <IconButton icon="plus" mode="outlined" accessibilityLabel="Augmenter" onPress={() => setCount(count + 1)} />
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Quantité</Text>
        </View>
        <View style={styles.inline}>
          {[1, 2, 3, 4, 5].map((n) => (
            <IconButton
              key={n}
              icon={n <= (count % 5 || 5) ? 'star' : 'star-outline'}
              size={20}
              accessibilityLabel={`${n} étoiles`}
              onPress={() => setCount(n)}
            />
          ))}
        </View>
        <Chip icon="tag-outline" onPress={() => setChecked(!checked)} selected={checked}>
          Design system
        </Chip>
      </SampleCard>
    );
  }

  if (category === 'buttons') {
    return (
      <SampleCard title="Variantes & états">
        <View style={styles.inline}>
          <Button mode="contained" onPress={() => setChecked(!checked)}>
            Primaire
          </Button>
          <Button mode="outlined" onPress={() => setChecked(!checked)}>
            Contour
          </Button>
        </View>
        <View style={styles.inline}>
          <Button mode="text" onPress={() => setChecked(!checked)}>
            Texte
          </Button>
          <Button mode="contained-tonal" onPress={() => setChecked(!checked)}>
            Tonal
          </Button>
          <Button mode="contained" disabled>
            Indisponible
          </Button>
        </View>
        <SegmentedButtons
          value={selected}
          onValueChange={setSelected}
          buttons={[
            { value: 'standard', label: 'Standard' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
      </SampleCard>
    );
  }

  if (category === 'navigation') {
    return (
      <SampleCard title="Navigation & choix">
        <SegmentedButtons
          value={selected}
          onValueChange={setSelected}
          buttons={[
            { value: 'overview', label: 'Aperçu', icon: 'view-dashboard-outline' },
            { value: 'activity', label: 'Activité', icon: 'chart-line' },
          ]}
        />
        <List.Item
          title="Éléments récents"
          description="Retrouvez vos dernières actions"
          left={(p) => <List.Icon {...p} icon="history" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          onPress={() => setSelected('overview')}
        />
        <View style={styles.inline}>
          <Chip selected>Tout</Chip>
          <Chip onPress={() => setSelected('activity')}>Favoris</Chip>
          <Chip>Archives</Chip>
        </View>
      </SampleCard>
    );
  }

  if (category === 'data') {
    return (
      <SampleCard title="Données & indicateurs">
        <View style={styles.metrics}>
          <Metric label="Utilisateurs" value="2 480" />
          <Metric label="Progression" value="+12 %" />
        </View>
        <ProgressBar progress={0.72} />
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Élément</DataTable.Title>
            <DataTable.Title numeric>Valeur</DataTable.Title>
          </DataTable.Header>
          <DataTable.Row>
            <DataTable.Cell>Actifs</DataTable.Cell>
            <DataTable.Cell numeric>1 824</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell>En attente</DataTable.Cell>
            <DataTable.Cell numeric>656</DataTable.Cell>
          </DataTable.Row>
        </DataTable>
        <View style={styles.inline}>
          <Avatar.Text size={36} label="AM" />
          <Text>Amadou M. · Administrateur</Text>
          <Badge>Actif</Badge>
        </View>
      </SampleCard>
    );
  }

  if (category === 'feedback') {
    return (
      <SampleCard title="États & retours">
        <Surface style={[styles.notice, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text>Les modifications ont été enregistrées.</Text>
        </Surface>
        <View style={styles.inline}>
          <ActivityIndicator />
          <Text>Chargement des données…</Text>
        </View>
        <ProgressBar progress={0.64} />
        <View style={styles.inline}>
          <Button mode="outlined" onPress={() => setChecked(!checked)}>
            {checked ? 'Afficher succès' : 'Afficher erreur'}
          </Button>
          <Chip icon={checked ? 'check-circle' : 'alert-circle'}>{checked ? 'Terminé' : 'À vérifier'}</Chip>
        </View>
      </SampleCard>
    );
  }

  if (category === 'planning') {
    return (
      <SampleCard title="Planning & tâches">
        <View style={styles.inline}>
          <Chip icon="circle-small">À faire · 3</Chip>
          <Chip icon="progress-clock">En cours · 2</Chip>
          <Chip icon="check-circle">Terminé · 5</Chip>
        </View>
        <List.Item
          title="Préparer la maquette"
          description="Aujourd’hui · 14:30"
          left={(p) => <List.Icon {...p} icon="drag" />}
        />
        <List.Item
          title="Revue de conception"
          description="Demain · 09:00"
          left={(p) => <List.Icon {...p} icon="calendar-outline" />}
        />
        <ProgressBar progress={0.58} />
      </SampleCard>
    );
  }

  if (category === 'maps') {
    return (
      <SampleCard title="Carte & marqueurs">
        <View style={[styles.map, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={[styles.road, { backgroundColor: theme.colors.surface }]} />
          <View style={[styles.roadVertical, { backgroundColor: theme.colors.surface }]} />
          <View style={[styles.pin, { backgroundColor: theme.colors.primary }]}>
            <Text style={{ color: theme.colors.onPrimary }}>A</Text>
          </View>
          <View style={[styles.pin, styles.pinB, { backgroundColor: theme.colors.tertiary }]}>
            <Text style={{ color: theme.colors.onTertiary }}>B</Text>
          </View>
        </View>
        <View style={styles.inline}>
          <Chip icon="map-marker">Abidjan</Chip>
          <Chip icon="map-marker-outline">Cocody</Chip>
        </View>
      </SampleCard>
    );
  }

  if (category === 'media') {
    return (
      <SampleCard title="Médias & fichiers">
        <View style={[styles.media, { backgroundColor: theme.colors.primaryContainer }]}>
          <IconButton icon="image-multiple-outline" size={36} accessibilityLabel="Aperçu de la galerie" />
          <Text variant="titleMedium">Galerie de photos</Text>
          <Text variant="bodySmall">4 éléments · JPG, PNG</Text>
        </View>
        <List.Item
          title="Rapport trimestriel.pdf"
          description="PDF · 2,4 Mo"
          left={(p) => <List.Icon {...p} icon="file-pdf-box" />}
          right={(p) => <IconButton {...p} icon="download-outline" accessibilityLabel="Télécharger le rapport" />}
        />
        <Button icon="play-circle-outline" mode="outlined" onPress={() => setChecked(!checked)}>
          {checked ? 'Lire le média' : 'En pause'}
        </Button>
      </SampleCard>
    );
  }

  if (category === 'interactions') {
    return (
      <SampleCard title="Recherche & interactions">
        <Searchbar placeholder="Rechercher…" value={query} onChangeText={setQuery} />
        <List.Item
          title="Notifications"
          description={checked ? '3 nouvelles notifications' : 'Tout est à jour'}
          left={(p) => <List.Icon {...p} icon="bell-outline" />}
          right={() => <Badge>{checked ? '3' : '0'}</Badge>}
          onPress={() => setChecked(!checked)}
        />
        <Button mode="contained-tonal" icon="gesture-tap" onPress={() => setChecked(!checked)}>
          Essayer l’interaction
        </Button>
      </SampleCard>
    );
  }

  if (category === 'material') {
    return (
      <SampleCard title="Composants Material">
        <List.Accordion title="Panneau dépliant" left={(p) => <List.Icon {...p} icon="chevron-down" />}>
          <List.Item title="Contenu révélé" description="Les détails restent accessibles au toucher." />
        </List.Accordion>
        <View style={styles.inline}>
          <RadioButton
            value="standard"
            status={selected === 'standard' ? 'checked' : 'unchecked'}
            onPress={() => setSelected('standard')}
          />
          <Text>Option standard</Text>
          <RadioButton
            value="express"
            status={selected === 'express' ? 'checked' : 'unchecked'}
            onPress={() => setSelected('express')}
          />
          <Text>Express</Text>
        </View>
        <View style={styles.inline}>
          <Switch value={checked} onValueChange={setChecked} />
          <Text>Activer l’option</Text>
        </View>
      </SampleCard>
    );
  }

  return (
    <SampleCard title="Gabarits adaptatifs">
      <View style={styles.inline}>
        <View style={[styles.layoutBlock, { backgroundColor: theme.colors.primaryContainer }]} />
        <View style={[styles.layoutBlock, { backgroundColor: theme.colors.secondaryContainer }]} />
      </View>
      <View style={[styles.layoutWide, { backgroundColor: theme.colors.tertiaryContainer }]} />
      <Text variant="bodyMedium">Espacements cohérents, contenu défilant et zones tactiles confortables.</Text>
    </SampleCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text variant="labelMedium">{label}</Text>
      <Text variant="headlineSmall">{value}</Text>
    </View>
  );
}

/** Galerie de démonstration native pour chaque catégorie et toutes ses sections. */
export default function CategoryPage() {
  const { category, section } = useLocalSearchParams<{ category: string; section?: string }>();
  const cat = categoryById(String(category));
  if (!cat)
    return (
      <Page>
        <Text variant="bodyLarge">Catégorie inconnue.</Text>
      </Page>
    );
  if (cat.id === 'typography') return <TypographyGallery key={section} initialSection={section} />;
  if (cat.id === 'forms') return <FormsGallery key={section} initialSection={section} />;
  if (cat.id === 'buttons') return <ButtonsGallery key={section} initialSection={section} />;
  if (cat.id === 'planning') return <PlanningGallery />;
  if (cat.id === 'media') return <MediaGallery />;
  if (cat.id === 'maps') return <MapsGallery />;
  if (cat.id === 'interactions') return <InteractionsGallery />;
  if (cat.id === 'material') return <MaterialGallery />;
  if (cat.id === 'layout') return <LayoutGallery />;
  if (cat.id === 'navigation') return <NavigationGallery />;
  if (cat.id === 'fields') return <FieldsGallery key={section} initialSection={section} />;
  if (cat.id === 'feedback') return <FeedbackGallery />;
  if (cat.id === 'data') return <DataGallery />;
  return (
    <Page testID={`category-${cat.id}`}>
      <Text variant="titleLarge" accessibilityRole="header">
        {cat.label}
      </Text>
      <Text variant="bodyLarge">{cat.description}</Text>
      {cat.sections.map((section, index) => (
        <View key={section.id}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {section.label}
          </Text>
          <ExamplePreview category={cat.id} index={index} />
          {index < cat.sections.length - 1 ? <Divider style={styles.divider} /> : null}
        </View>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { marginBottom: space.s2 },
  divider: { marginTop: space.s4 },
  sample: { gap: space.s3 },
  inline: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s2 },
  metrics: { flexDirection: 'row', gap: space.s3 },
  metric: { flex: 1, gap: space.s1 },
  notice: { padding: space.s3, borderRadius: radius.md },
  map: {
    height: 152,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  road: { position: 'absolute', width: '120%', height: 20, transform: [{ rotate: '-18deg' }] },
  roadVertical: { position: 'absolute', width: 18, height: '140%', transform: [{ rotate: '28deg' }] },
  pin: {
    position: 'absolute',
    left: '27%',
    top: '30%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinB: { left: '66%', top: '58%' },
  media: { minHeight: 140, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, padding: space.s3 },
  layoutBlock: { flex: 1, height: 44, borderRadius: radius.md },
  layoutWide: { height: 42, borderRadius: radius.md },
});
