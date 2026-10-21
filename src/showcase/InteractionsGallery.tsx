import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, List, Searchbar, Text } from 'react-native-paper';

import { hapticToggle } from '../mobile/haptics';
import { Page } from '../shell/Page';
import { radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

const commands = [
  ['Typographie', 'Navigation · Galerie de composants'],
  ['Formulaires', 'Navigation · Galerie de composants'],
  ['Boutons', 'Navigation · Galerie de composants'],
  ['Nouveau client', 'Actions · ⌘N'],
  ['Nouvelle intervention', 'Actions · ⌘I'],
  ['Basculer le thème', 'Actions · ⌘⇧L'],
  ['Exporter la liste', 'Actions · ⌘E'],
] as const;
const initialNotifications = [
  { id: 1, title: 'Balise CI-0418-GH hors ligne', detail: 'Il y a 8 min · Alerte véhicule', unread: true },
  { id: 2, title: 'Intervention INT-0412 clôturée', detail: 'Il y a 24 min · Opérations', unread: true },
  { id: 3, title: 'Facture FAC-2026-0874 réglée', detail: 'Il y a 1 h · Facturation', unread: true },
  { id: 4, title: 'Rapport mensuel disponible', detail: 'Hier · Rapports', unread: false },
];
const documentsInitial = ['Contrat-cadre-2026.pdf', 'Photos installation', 'Relevé T3.xlsx', 'Rapport INT-0412.pdf'];

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

export function InteractionsGallery() {
  const theme = useKitTheme();
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [gesture, setGesture] = useState('Essayez toucher, double-toucher ou appui long');
  const [popover, setPopover] = useState('');
  const [tourStep, setTourStep] = useState(-1);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [documents, setDocuments] = useState(documentsInitial);
  const [starred, setStarred] = useState<string[]>([]);
  const [contextTarget, setContextTarget] = useState('');
  const filteredCommands = useMemo(
    () => commands.filter(([title, detail]) => `${title} ${detail}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const tour = [
    ['Recherche instantanée', 'Retrouvez un véhicule par immatriculation, chauffeur ou client.'],
    ['Indicateurs clés', 'Suivez l’état de la flotte d’un coup d’œil.'],
    ['Alertes', 'Les sorties de zone et excès de vitesse arrivent ici.'],
    ['Créer une mission', 'Planifiez une intervention et assignez un technicien.'],
  ] as const;
  const unread = notifications.filter((item) => item.unread).length;
  const dismissContext = () => setContextTarget('');

  return (
    <Page testID="category-interactions">
      <Text variant="titleLarge" accessibilityRole="header">
        Interactions
      </Text>
      <Text variant="bodyLarge">
        Palette de commandes, raccourcis, gestes tactiles, cartes contextuelles, visite guidée, notifications et menus
        d’appui long.
      </Text>

      <Section title="Palette de commandes (⌘K)">
        <Button
          icon="magnify"
          mode="outlined"
          onPress={() => {
            setQuery('');
            setPaletteVisible(true);
          }}
        >
          Rechercher ou lancer une commande… · ⌘K
        </Button>
        <Modal visible={paletteVisible} animationType="slide" onRequestClose={() => setPaletteVisible(false)}>
          <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge">Commandes</Text>
              <IconButton
                icon="close"
                accessibilityLabel="Fermer les commandes"
                onPress={() => setPaletteVisible(false)}
              />
            </View>
            <Searchbar placeholder="Rechercher une page ou une action…" value={query} onChangeText={setQuery} />
            {filteredCommands.length ? (
              filteredCommands.map(([title, detail]) => (
                <List.Item
                  key={title}
                  title={title}
                  description={detail}
                  left={(p) => <List.Icon {...p} icon="arrow-top-left" />}
                  onPress={() => setPaletteVisible(false)}
                />
              ))
            ) : (
              <Text>Aucun résultat.</Text>
            )}
          </View>
        </Modal>
      </Section>

      <Section title="Raccourcis & gestes">
        {(
          [
            ['⌘ K', 'Palette de commandes'],
            ['⌘ N', 'Nouveau client'],
            ['⌘ E', 'Exporter'],
            ['?', 'Aide des raccourcis'],
          ] as const
        ).map(([key, label]) => (
          <View key={key} style={styles.shortcut}>
            <Text>{label}</Text>
            <Text variant="labelLarge" style={[styles.key, { color: theme.colors.primary }]}>
              {key}
            </Text>
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zone de démonstration de gestes"
          onPress={() => setGesture('Toucher')}
          onLongPress={() => {
            hapticToggle();
            setGesture('Appui long · retour haptique');
          }}
          onAccessibilityTap={() => setGesture('Double-toucher')}
          style={[styles.gestureArea, { backgroundColor: theme.colors.primaryContainer }]}
        >
          <Text variant="titleMedium">{gesture}</Text>
          <Text variant="bodySmall">Touchez ou maintenez votre doigt sur la zone</Text>
        </Pressable>
        <View style={styles.row}>
          {['Toucher', 'Double-toucher', 'Appui long', 'Balayage', 'Pincement', 'Tirer pour rafraîchir'].map(
            (label) => (
              <Chip key={label} onPress={() => setGesture(label)}>
                {label}
              </Chip>
            ),
          )}
        </View>
      </Section>

      <Section title="Popover riche">
        <View style={styles.row}>
          <Button
            mode="outlined"
            icon="account-circle-outline"
            onPress={() => setPopover(popover === 'profile' ? '' : 'profile')}
          >
            Profil de Koffi
          </Button>
          <Button mode="outlined" icon="chart-box-outline" onPress={() => setPopover(popover === 'kpi' ? '' : 'kpi')}>
            CA d’octobre
          </Button>
        </View>
        {popover ? (
          <Card mode="elevated">
            <Card.Content style={styles.content}>
              {popover === 'profile' ? (
                <>
                  <Text variant="titleMedium">Koffi N’Guessan · En ligne</Text>
                  <Text>Technicien · Abidjan Sud</Text>
                  <Text>+225 07 22 31 44 58</Text>
                  <Text>4 interventions aujourd’hui</Text>
                  <View style={styles.row}>
                    <Button onPress={() => setPopover('')}>Appeler</Button>
                    <Button mode="contained" onPress={() => setPopover('')}>
                      Assigner
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <Text variant="labelMedium">CA d’octobre</Text>
                  <Text variant="headlineMedium">55,8 M FCFA</Text>
                  <Chip icon="trending-up">+9,2 % vs septembre</Chip>
                  <Divider />
                  <Text>Abonnements · 38,1 M</Text>
                  <Text>Installations · 11,4 M</Text>
                  <Text>Matériel · 6,3 M</Text>
                </>
              )}
            </Card.Content>
          </Card>
        ) : (
          <Text variant="bodySmall">La carte contextuelle s’ouvre sous le bouton sélectionné.</Text>
        )}
      </Section>

      <Section title="Visite guidée / onboarding">
        <View style={styles.row}>
          <Card mode="contained">
            <Card.Content>
              <Text variant="labelMedium">TABLEAU DE BORD</Text>
              <Text variant="headlineSmall">Bonjour Mariam</Text>
            </Card.Content>
          </Card>
          <Card mode="contained">
            <Card.Content>
              <Text variant="headlineSmall">42 · 96 %</Text>
              <Text>Véhicules actifs · Disponibilité</Text>
            </Card.Content>
          </Card>
        </View>
        <View style={styles.row}>
          <Chip icon="bell-outline">{unread} alertes</Chip>
          <Button mode="contained-tonal" icon="plus" onPress={() => setTourStep(0)}>
            Lancer la visite
          </Button>
        </View>
        {tourStep >= 0 ? (
          <Card mode="outlined">
            <Card.Content style={styles.content}>
              <Text variant="labelMedium">
                ÉTAPE {tourStep + 1} / {tour.length}
              </Text>
              <Text variant="titleMedium">{tour[tourStep]?.[0]}</Text>
              <Text>{tour[tourStep]?.[1]}</Text>
              <Progress value={(tourStep + 1) / tour.length} color={theme.colors.primary} />
              <View style={styles.row}>
                <Button onPress={() => setTourStep(-1)}>Quitter</Button>
                <Button mode="contained" onPress={() => setTourStep(tourStep + 1 >= tour.length ? -1 : tourStep + 1)}>
                  {tourStep + 1 === tour.length ? 'Terminer' : 'Suivant'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : null}
      </Section>

      <Section title="Centre de notifications">
        <View style={styles.row}>
          <Chip selected={!unreadOnly} onPress={() => setUnreadOnly(false)}>
            Toutes
          </Chip>
          <Chip selected={unreadOnly} onPress={() => setUnreadOnly(true)}>
            Non lues · {unread}
          </Chip>
          <Button
            compact
            onPress={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))}
          >
            Tout marquer lu
          </Button>
        </View>
        {notifications
          .filter((item) => !unreadOnly || item.unread)
          .map((item) => (
            <List.Item
              key={item.id}
              title={item.title}
              description={item.detail}
              left={(p) => <List.Icon {...p} icon={item.unread ? 'bell-badge-outline' : 'bell-outline'} />}
              right={(p) => (
                <IconButton
                  {...p}
                  icon="check"
                  accessibilityLabel={`Marquer comme lu : ${item.title}`}
                  onPress={() =>
                    setNotifications((items) =>
                      items.map((current) => (current.id === item.id ? { ...current, unread: false } : current)),
                    )
                  }
                />
              )}
              onPress={() =>
                setNotifications((items) =>
                  items.map((current) => (current.id === item.id ? { ...current, unread: false } : current)),
                )
              }
            />
          ))}
      </Section>

      <Section title="Menu contextuel">
        {documents.map((name) => (
          <Pressable
            key={name}
            onLongPress={() => {
              hapticToggle();
              setContextTarget(contextTarget === name ? '' : name);
            }}
            onPress={() => setContextTarget(name)}
            style={styles.document}
            accessibilityHint="Maintenez pour afficher les actions"
          >
            <List.Item
              title={name}
              description={
                contextTarget === name ? 'Menu d’actions ouvert' : 'Modifié aujourd’hui · appui long pour le menu'
              }
              left={(p) => (
                <List.Icon
                  {...p}
                  icon={
                    name.endsWith('.pdf')
                      ? 'file-pdf-box'
                      : name.endsWith('.xlsx')
                        ? 'file-excel-outline'
                        : 'folder-outline'
                  }
                />
              )}
              right={() =>
                starred.includes(name) ? (
                  <IconButton icon="star" iconColor={theme.colors.tertiary} accessibilityLabel="Favori" />
                ) : null
              }
            />
          </Pressable>
        ))}
        {contextTarget ? (
          <View style={[styles.contextMenu, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="labelLarge">{contextTarget}</Text>
            <View style={styles.row}>
              <Button icon="open-in-new" onPress={dismissContext}>
                Ouvrir
              </Button>
              <Button
                icon={starred.includes(contextTarget) ? 'star-off' : 'star-outline'}
                onPress={() => {
                  setStarred((items) =>
                    items.includes(contextTarget)
                      ? items.filter((item) => item !== contextTarget)
                      : [...items, contextTarget],
                  );
                  dismissContext();
                }}
              >
                {starred.includes(contextTarget) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </Button>
              <Button icon="share-outline" onPress={dismissContext}>
                Partager
              </Button>
              <Button
                icon="delete-outline"
                textColor={theme.colors.error}
                onPress={() => {
                  setDocuments((items) => items.filter((item) => item !== contextTarget));
                  dismissContext();
                }}
              >
                Supprimer
              </Button>
              <IconButton icon="close" accessibilityLabel="Fermer le menu" onPress={dismissContext} />
            </View>
          </View>
        ) : null}
      </Section>
    </Page>
  );
}

function Progress({ value, color }: { value: number; color: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${value * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s2 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s1 },
  modal: { flex: 1, padding: space.s4, paddingTop: space.s8, gap: space.s3 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shortcut: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  key: {
    borderWidth: 1,
    borderColor: '#aab2c0',
    borderRadius: radius.sm,
    paddingHorizontal: space.s2,
    paddingVertical: space.s1,
  },
  gestureArea: {
    minHeight: 132,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s1,
    padding: space.s3,
  },
  document: { borderRadius: radius.md },
  contextMenu: { borderRadius: radius.md, padding: space.s3, gap: space.s1 },
  progressTrack: { height: 6, backgroundColor: '#d7dbe4', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
});
