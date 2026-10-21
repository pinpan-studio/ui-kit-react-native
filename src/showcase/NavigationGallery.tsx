import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, List, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { Page } from '../shell/Page';
import { MIN_TOUCH, radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

const destinations = ['Accueil', 'Clients', 'Interventions', 'Compte'];

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

export function NavigationGallery() {
  const theme = useKitTheme();
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState('info');
  const [page, setPage] = useState(3);
  const [step, setStep] = useState(1);
  const [menu, setMenu] = useState(false);
  const [crumb, setCrumb] = useState('Requêtes');
  const [query, setQuery] = useState('');

  return (
    <Page testID="category-navigation">
      <Text variant="titleLarge" accessibilityRole="header">
        Navigation
      </Text>
      <Text variant="bodyLarge">
        Barres d’application, navigation adaptative, onglets, fil d’Ariane, pagination, étapes et menus.
      </Text>

      <Section title="Header (barre d’application)">
        <View style={[styles.appBar, { backgroundColor: theme.colors.surfaceVariant }]}>
          <IconButton icon="menu" accessibilityLabel="Ouvrir le menu" onPress={() => setDrawer(true)} />
          {searching ? (
            <TextInput
              placeholder="Rechercher un client…"
              value={query}
              onChangeText={setQuery}
              dense
              style={styles.searchInput}
            />
          ) : (
            <Text variant="titleMedium" style={styles.appBarTitle}>
              Tableau de bord
            </Text>
          )}
          <IconButton
            icon={searching ? 'close' : 'magnify'}
            accessibilityLabel={searching ? 'Fermer la recherche' : 'Rechercher'}
            onPress={() => setSearching(!searching)}
          />
          <IconButton
            icon="bell-outline"
            accessibilityLabel="Notifications, 3 non lues"
            onPress={() => setSelected(2)}
          />
          <Chip compact>JK</Chip>
        </View>
        <View style={[styles.appBar, { backgroundColor: theme.colors.primaryContainer }]}>
          <IconButton icon="close" accessibilityLabel="Annuler la sélection" onPress={() => setSelected(0)} />
          <Text variant="titleMedium" style={styles.appBarTitle}>
            {selected} sélectionné(s)
          </Text>
          <IconButton
            icon="archive-outline"
            accessibilityLabel="Archiver"
            onPress={() => setSelected(Math.max(0, selected - 1))}
          />
          <IconButton
            icon="delete-outline"
            iconColor={theme.colors.error}
            accessibilityLabel="Supprimer"
            onPress={() => setSelected(0)}
          />
        </View>
      </Section>

      <Section title="Sidebar / drawer">
        <Button mode="outlined" icon="menu-open" onPress={() => setDrawer(true)}>
          Ouvrir le tiroir
        </Button>
        <Modal visible={drawer} transparent animationType="fade" onRequestClose={() => setDrawer(false)}>
          <View style={styles.drawerBackdrop}>
            <View style={[styles.drawer, { backgroundColor: theme.colors.surface }]}>
              <Text variant="headlineSmall">Lookas</Text>
              <Text variant="bodySmall">Suivi de flotte</Text>
              <Divider />
              {destinations.map((item, index) => (
                <List.Item
                  key={item}
                  title={item}
                  style={selected === index ? { backgroundColor: theme.colors.secondaryContainer } : undefined}
                  left={(p) => (
                    <List.Icon
                      {...p}
                      icon={
                        ['view-dashboard-outline', 'account-group-outline', 'wrench-outline', 'account-outline'][
                          index
                        ] ?? 'circle'
                      }
                    />
                  )}
                  onPress={() => {
                    setSelected(index);
                    setDrawer(false);
                  }}
                />
              ))}
              <Button onPress={() => setDrawer(false)}>Fermer</Button>
            </View>
          </View>
        </Modal>
        <View style={styles.rail}>
          <Text variant="labelLarge">NavigationRail · tablette</Text>
          {destinations.slice(0, 3).map((item, index) => (
            <Chip
              key={item}
              selected={selected === index}
              icon={['view-dashboard-outline', 'account-group-outline', 'wrench-outline'][index]}
              onPress={() => setSelected(index)}
            >
              {item}
            </Chip>
          ))}
        </View>
      </Section>

      <Section title="Barre de navigation">
        <View style={[styles.bottomNav, { backgroundColor: theme.colors.surfaceVariant }]}>
          {destinations.map((item, index) => (
            <Button
              key={item}
              compact
              mode={selected === index ? 'contained-tonal' : 'text'}
              icon={['view-dashboard-outline', 'account-group-outline', 'wrench-outline', 'account-outline'][index]}
              style={styles.navButton}
              onPress={() => setSelected(index)}
            >
              {item}
            </Button>
          ))}
        </View>
        <Text variant="bodySmall">Destination active : {destinations[selected] ?? destinations[0]}</Text>
        <View style={styles.pageHeader}>
          <Text variant="labelMedium">SERVICE CLIENT / {crumb.toUpperCase()}</Text>
          <Text variant="headlineSmall">Requêtes clients</Text>
          <Text>42 requêtes ouvertes · 6 en retard</Text>
          <View style={styles.row}>
            <Button icon="refresh" onPress={() => setPage(1)}>
              Actualiser
            </Button>
            <Button mode="contained" icon="plus" onPress={() => setSelected(2)}>
              Nouvelle requête
            </Button>
          </View>
        </View>
      </Section>

      <Section title="Tabs">
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'info', label: 'Infos' },
            { value: 'vehicles', label: 'Véhicules · 12' },
            { value: 'invoices', label: 'Factures · 3' },
          ]}
        />
        <Card mode="contained">
          <Card.Content style={styles.tabPanel}>
            <Text variant="titleMedium">
              {tab === 'info'
                ? 'Coordonnées et contrat'
                : tab === 'vehicles'
                  ? '12 véhicules suivis'
                  : '3 factures en attente'}
            </Text>
            <Text>Transports Yao & Fils · CLI-1040</Text>
          </Card.Content>
        </Card>
      </Section>

      <Section title="Breadcrumb">
        <View style={styles.row}>
          {['Accueil', 'Service client', 'Requêtes'].map((item, index) => (
            <View key={item} style={styles.row}>
              <Button compact mode="text" onPress={() => setCrumb(item)}>
                {item}
              </Button>
              {index < 2 ? <Text>›</Text> : null}
            </View>
          ))}
        </View>
        <Text variant="bodySmall">Élément courant : {crumb}</Text>
      </Section>

      <Section title="Pagination">
        <Text variant="bodyMedium">41–60 sur 128 produits</Text>
        <View style={styles.row}>
          <IconButton icon="chevron-double-left" accessibilityLabel="Première page" onPress={() => setPage(1)} />
          <IconButton
            icon="chevron-left"
            accessibilityLabel="Page précédente"
            onPress={() => setPage(Math.max(1, page - 1))}
          />
          {[1, 2, 3, 4, 5].map((number) => (
            <Button key={number} compact mode={page === number ? 'contained' : 'text'} onPress={() => setPage(number)}>
              {number}
            </Button>
          ))}
          <IconButton
            icon="chevron-right"
            accessibilityLabel="Page suivante"
            onPress={() => setPage(Math.min(7, page + 1))}
          />
          <IconButton icon="chevron-double-right" accessibilityLabel="Dernière page" onPress={() => setPage(7)} />
        </View>
        <SegmentedButtons
          value={String(page)}
          onValueChange={(value) => setPage(Number(value))}
          buttons={[
            { value: '2', label: '10 / page' },
            { value: '3', label: '20 / page' },
            { value: '4', label: '50 / page' },
          ]}
        />
      </Section>

      <Section title="Stepper">
        <View style={styles.stepper}>
          {['Client', 'Intervention', 'Confirmation'].map((label, index) => (
            <View key={label} style={styles.stepItem}>
              <Chip
                selected={step === index}
                icon={step > index ? 'check' : String(index + 1)}
                onPress={() => setStep(index)}
              >
                {label}
              </Chip>
              {index < 2 ? (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: step > index ? theme.colors.primary : theme.colors.outlineVariant },
                  ]}
                />
              ) : null}
            </View>
          ))}
        </View>
        <Card mode="contained">
          <Card.Content style={styles.tabPanel}>
            <Text variant="titleMedium">
              Étape {step + 1} · {['Choisir un client', 'Décrire l’intervention', 'Vérifier et confirmer'][step]}
            </Text>
            <Text>
              {step === 0
                ? 'Sélectionnez le client concerné.'
                : step === 1
                  ? 'Indiquez le véhicule, le motif et le créneau.'
                  : 'Les informations sont prêtes à être confirmées.'}
            </Text>
            <View style={styles.row}>
              <Button disabled={step === 0} onPress={() => setStep(step - 1)}>
                Précédent
              </Button>
              <Button mode="contained" onPress={() => setStep((step + 1) % 3)}>
                {step === 2 ? 'Terminer' : 'Suivant'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Section>

      <Section title="Menu">
        <View style={styles.row}>
          <Button mode="outlined" icon="dots-vertical" onPress={() => setMenu(!menu)}>
            Actions de la requête
          </Button>
          <Button mode="contained" onPress={() => setMenu(false)}>
            Assigner
          </Button>
        </View>
        {menu ? (
          <Card mode="elevated">
            <List.Item
              title="Modifier"
              left={(p) => <List.Icon {...p} icon="pencil-outline" />}
              onPress={() => setMenu(false)}
            />
            <List.Item
              title="Dupliquer"
              left={(p) => <List.Icon {...p} icon="content-copy" />}
              onPress={() => setMenu(false)}
            />
            <List.Item
              title="Archiver"
              left={(p) => <List.Icon {...p} icon="archive-outline" />}
              onPress={() => setMenu(false)}
            />
          </Card>
        ) : null}
      </Section>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s1 },
  appBar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s1,
    borderRadius: radius.md,
  },
  appBarTitle: { flex: 1 },
  searchInput: { flex: 1 },
  drawerBackdrop: { flex: 1, backgroundColor: '#0007', flexDirection: 'row' },
  drawer: { width: 320, maxWidth: '85%', padding: space.s4, paddingTop: space.s8, gap: space.s1 },
  rail: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s2 },
  bottomNav: {
    minHeight: 68,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  navButton: { minHeight: MIN_TOUCH },
  pageHeader: { gap: space.s1 },
  tabPanel: { minHeight: 112, justifyContent: 'center', gap: space.s2 },
  stepper: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s1 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepLine: { height: 2, width: 12 },
});
