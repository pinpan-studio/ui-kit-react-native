import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  FAB,
  IconButton,
  List,
  SegmentedButtons,
  Text,
} from 'react-native-paper';

import { Page } from '../shell/Page';
import { MIN_TOUCH, space } from '../theme/tokens';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" accessibilityRole="header">
        {title}
      </Text>
      <Card mode="outlined">
        <Card.Content style={styles.content}>{children}</Card.Content>
      </Card>
    </View>
  );
}

/** Portage mobile de ButtonsGallery : variantes, états, actions, segmentés et FAB. */
export function ButtonsGallery() {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');
  const [view, setView] = useState('cards');
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [fabPressed, setFabPressed] = useState(false);

  return (
    <Page testID="category-buttons">
      <Text variant="titleLarge" accessibilityRole="header">
        Boutons
      </Text>
      <Text variant="bodyLarge">
        Variantes Material 3, états, actions de page, choix segmentés et actions flottantes. Les contrôles gardent des
        zones tactiles d’au moins 48 dp.
      </Text>

      <Section title="Variantes">
        <View style={styles.row}>
          <Button mode="contained" onPress={() => setFilter('primary')}>
            Primary
          </Button>
          <Button mode="contained-tonal" onPress={() => setFilter('secondary')}>
            Secondary
          </Button>
          <Button mode="outlined" onPress={() => setFilter('outline')}>
            Outline
          </Button>
          <Button mode="text" onPress={() => setFilter('ghost')}>
            Ghost
          </Button>
          <Button mode="contained" buttonColor="#b3261e" onPress={() => setFilter('danger')}>
            Danger
          </Button>
          <Button mode="contained" buttonColor="#166534" textColor="#ffffff" onPress={() => setFilter('success')}>
            Success
          </Button>
        </View>
        <Text variant="bodySmall">Dernière variante choisie : {filter}</Text>
        <Divider />
        <View style={styles.row}>
          <Button icon="content-save-outline" mode="contained" onPress={() => setFilter('saved')}>
            Enregistrer
          </Button>
          <Button icon="arrow-right" contentStyle={styles.button} mode="outlined" onPress={() => setFilter('next')}>
            Continuer
          </Button>
          <Button icon="delete-outline" mode="outlined" textColor="#b3261e" onPress={() => setFilter('delete')}>
            Supprimer
          </Button>
        </View>
      </Section>

      <Section title="États">
        <View style={styles.row}>
          <Button mode="contained" disabled>
            Indisponible
          </Button>
          <Button
            mode="contained"
            loading={loading}
            icon={loading ? undefined : 'content-save-outline'}
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1200);
            }}
          >
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
          {loading ? <ActivityIndicator accessibilityLabel="Enregistrement en cours" /> : null}
        </View>
        <Button mode="contained" style={styles.full} onPress={() => setFilter('accepted')}>
          Accepter et continuer
        </Button>
        <Button mode="outlined" style={styles.full} onPress={() => setFilter('email')}>
          Se connecter par e-mail
        </Button>
      </Section>

      <Section title="Icon buttons">
        <View style={styles.row}>
          <IconButton
            icon="pencil-outline"
            mode="outlined"
            accessibilityLabel="Modifier"
            onPress={() => setFilter('edit')}
          />
          <IconButton
            icon="plus-circle"
            iconColor="#3157c8"
            accessibilityLabel="Ajouter"
            onPress={() => setFilter('add')}
          />
          <IconButton
            icon="delete-outline"
            iconColor="#b3261e"
            accessibilityLabel="Supprimer"
            onPress={() => setFilter('delete')}
          />
          <IconButton
            icon="dots-vertical"
            mode="contained-tonal"
            accessibilityLabel="Plus d’options"
            onPress={() => setMenuOpen(!menuOpen)}
          />
          <IconButton
            icon="refresh"
            mode={menuOpen ? 'contained' : 'outlined'}
            accessibilityLabel="Rafraîchir"
            onPress={() => setMenuOpen(!menuOpen)}
          />
        </View>
        {menuOpen ? <Text variant="bodyMedium">Options · Actualiser · Exporter</Text> : null}
      </Section>

      <Section title="Actions de page">
        <Text variant="labelMedium">Catalogue / Produits</Text>
        <Text variant="headlineSmall">Produits</Text>
        <Text variant="bodyMedium">128 produits référencés</Text>
        <View style={styles.row}>
          <SegmentedButtons
            value={view}
            onValueChange={setView}
            buttons={[
              { value: 'cards', label: 'Cartes', icon: 'view-grid-outline' },
              { value: 'list', label: 'Liste', icon: 'view-list-outline' },
            ]}
          />
          <IconButton
            icon="refresh"
            accessibilityLabel="Actualiser les produits"
            onPress={() => setFilter('refreshed')}
          />
          <Button mode="contained" icon="plus" onPress={() => setFilter('created')}>
            Nouveau produit
          </Button>
        </View>
        <List.Item
          title="3 éléments sélectionnés"
          description="Actions groupées"
          right={() => (
            <IconButton
              icon="delete-outline"
              accessibilityLabel="Supprimer la sélection"
              onPress={() => setFilter('bulk-delete')}
            />
          )}
        />
      </Section>

      <Section title="Segmentés & toggles">
        <Text variant="labelLarge">Période du rapport</Text>
        <SegmentedButtons
          value={period}
          onValueChange={setPeriod}
          buttons={[
            { value: 'month', label: 'Mois' },
            { value: 'quarter', label: 'Trimestre' },
            { value: 'year', label: 'Année' },
          ]}
        />
        <View style={styles.row}>
          {(
            [
              ['all', 'Tous', 48],
              ['active', 'Actifs', 31],
              ['planned', 'Planifiés', 6],
              ['removed', 'Désinstallés', 4],
            ] as const
          ).map(([id, label, count]) => (
            <Chip key={id} selected={filter === id} onPress={() => setFilter(id)}>
              {label} · {count}
            </Chip>
          ))}
        </View>
        <Text variant="bodySmall">
          Période : {period === 'month' ? 'Mois' : period === 'quarter' ? 'Trimestre' : 'Année'} · vue :{' '}
          {view === 'cards' ? 'Cartes' : 'Liste'}
        </Text>
      </Section>

      <Section title="Menu & split">
        <Text variant="bodyMedium">Actions liées au contexte de la page.</Text>
        <View style={styles.row}>
          <Button mode="outlined" icon="dots-horizontal" onPress={() => setMenuOpen(!menuOpen)}>
            Actions
          </Button>
          <Button mode="contained" onPress={() => setFilter('published')}>
            Publier
          </Button>
          <IconButton
            icon="chevron-down"
            accessibilityLabel="Autres actions de publication"
            onPress={() => setMenuOpen(!menuOpen)}
          />
        </View>
        {menuOpen ? (
          <View style={styles.row}>
            <Chip onPress={() => setFilter('draft')}>Enregistrer le brouillon</Chip>
            <Chip onPress={() => setFilter('preview')}>Aperçu</Chip>
            <Chip onPress={() => setFilter('archive')}>Archiver</Chip>
          </View>
        ) : null}
      </Section>

      <Section title="FAB">
        <Text variant="bodyMedium">Action principale flottante, adaptée au pouce.</Text>
        <View style={styles.fabRow}>
          <FAB
            icon={fabPressed ? 'check' : 'plus'}
            label={fabPressed ? 'Créé' : 'Créer'}
            onPress={() => setFabPressed(!fabPressed)}
          />
          <FAB size="small" icon="pencil" accessibilityLabel="Modifier" onPress={() => setFilter('fab-edit')} />
          <FAB variant="secondary" icon="filter-variant" label="Filtrer" onPress={() => setFilter('fab-filter')} />
        </View>
      </Section>

      <Section title="Tailles & formes">
        <View style={styles.row}>
          <Button compact mode="contained-tonal" onPress={() => setFilter('small')}>
            Compact
          </Button>
          <Button mode="contained" onPress={() => setFilter('medium')}>
            Standard
          </Button>
          <Button mode="outlined" contentStyle={styles.largeButton} onPress={() => setFilter('large')}>
            Grand format
          </Button>
          <IconButton
            mode="outlined"
            size={24}
            icon="star-outline"
            accessibilityLabel="Favori"
            onPress={() => setFilter('favorite')}
          />
        </View>
        <Text variant="bodySmall">La taille des cibles d’action reste au minimum à 48 dp.</Text>
      </Section>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s2 },
  button: { minHeight: MIN_TOUCH },
  full: { minHeight: MIN_TOUCH, justifyContent: 'center' },
  largeButton: { minHeight: 56, paddingHorizontal: space.s3 },
  fabRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s3 },
});
