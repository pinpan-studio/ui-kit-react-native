import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, List, Text, TextInput } from 'react-native-paper';

import { Page } from '../shell/Page';
import { radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

const LAYOUTS = [
  {
    id: 'shell',
    title: 'Shell applicatif',
    description: 'Barre d’application, destinations mobiles et contenu défilant.',
    slug: 'dashboard',
  },
  {
    id: 'detail',
    title: 'Fiche détaillée',
    description: 'Informations client, statut, activité et actions contextuelles.',
    slug: 'client-detail',
  },
  {
    id: 'auth',
    title: 'Authentification',
    description: 'Identité, formulaire de connexion et fournisseurs SSO.',
    slug: 'auth-centered',
  },
  {
    id: 'public',
    title: 'Page publique',
    description: 'Présentation éditoriale, contenu et action principale.',
    slug: 'article',
  },
  {
    id: 'panel',
    title: 'Panneau / feuille',
    description: 'Contenu principal accompagné d’un panneau secondaire mobile.',
    slug: 'settings',
  },
  {
    id: 'dialog',
    title: 'Dialogs / formulaires',
    description: 'Saisie courte, validation et confirmation contextuelle.',
    slug: 'contact',
  },
  {
    id: 'catalog',
    title: 'Shell du catalogue',
    description: 'Navigation entre catégories, recherche et contenu de galerie.',
    slug: 'catalog',
  },
] as const;

export default function LayoutsPage() {
  const theme = useKitTheme();
  const [expanded, setExpanded] = useState('');
  const [choice, setChoice] = useState('Résumé');
  return (
    <Page testID="layouts">
      <Text variant="titleLarge" accessibilityRole="header">
        Layouts
      </Text>
      <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
        Sept gabarits d’écran tirés de la galerie Flutter. Chaque aperçu montre une composition adaptée au tactile;
        ouvrez l’exemple associé pour poursuivre.
      </Text>
      {LAYOUTS.map((item, index) => (
        <Card key={item.id} mode="outlined">
          <Card.Content style={styles.card}>
            <View style={styles.heading}>
              <Text variant="titleMedium">{item.title}</Text>
              <Text variant="labelMedium">0{index + 1}</Text>
            </View>
            <Text variant="bodyMedium">{item.description}</Text>
            <View style={[styles.preview, { backgroundColor: theme.colors.surfaceVariant }]}>
              {item.id === 'shell' ? (
                <>
                  <View style={[styles.topbar, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text variant="labelLarge">☰　Tableau de bord</Text>
                    <Text>⌕　♧</Text>
                  </View>
                  <Text variant="titleSmall">Bonjour Jean 👋</Text>
                  <View style={styles.row}>
                    {[
                      ['42', 'Véhicules'],
                      ['5', 'Alertes'],
                      ['4', 'Missions'],
                    ].map(([value, label]) => (
                      <Card key={label} mode="contained" style={styles.metric}>
                        <Card.Content>
                          <Text variant="titleMedium">{value}</Text>
                          <Text variant="labelSmall">{label}</Text>
                        </Card.Content>
                      </Card>
                    ))}
                  </View>
                  <View style={[styles.bottomNav, { backgroundColor: theme.colors.surface }]}>
                    <Text>⌂　Accueil　　 ♙　Clients　　 ⚒　Missions　　 ☺　Compte</Text>
                  </View>
                </>
              ) : null}
              {item.id === 'detail' ? (
                <>
                  <View style={styles.row}>
                    <IconButton icon="arrow-left" accessibilityLabel="Retour" />
                    <View style={styles.flex}>
                      <Text variant="titleMedium">Transports Yao & Fils</Text>
                      <Text variant="bodySmall">CLI-1040 · Abidjan</Text>
                    </View>
                    <IconButton icon="dots-vertical" accessibilityLabel="Autres actions" />
                  </View>
                  <Chip icon="check-circle">Compte actif · Premium</Chip>
                  <View style={styles.columns}>
                    <MiniBlock label="24 véhicules" color={theme.colors.primaryContainer} />
                    <MiniBlock label="Activité récente" color={theme.colors.secondaryContainer} />
                  </View>
                  <Text variant="bodySmall">Contact · Jean Kouassi</Text>
                </>
              ) : null}
              {item.id === 'auth' ? (
                <View style={styles.authPreview}>
                  <Text variant="titleMedium">SC Storage</Text>
                  <Text variant="headlineSmall">Bon retour !</Text>
                  <TextInput label="Adresse e-mail" mode="outlined" dense />
                  <TextInput label="Mot de passe" mode="outlined" dense secureTextEntry />
                  <Button mode="contained">Se connecter</Button>
                  <Text variant="bodySmall">ou continuer avec · Google · Apple</Text>
                </View>
              ) : null}
              {item.id === 'public' ? (
                <>
                  <View style={[styles.hero, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text variant="labelMedium">SC STORAGE · JOURNAL</Text>
                    <Text variant="headlineSmall">Concevoir de meilleures expériences mobiles</Text>
                  </View>
                  <Text variant="bodySmall">Produit · 6 min de lecture · Aïcha Koné</Text>
                  <Text numberOfLines={2}>
                    Des principes simples pour concevoir des interfaces claires, accessibles et agréables à utiliser au
                    quotidien.
                  </Text>
                  <Button mode="contained-tonal">Découvrir la solution</Button>
                </>
              ) : null}
              {item.id === 'panel' ? (
                <>
                  <View style={styles.columns}>
                    <View style={styles.flex}>
                      <Text variant="titleSmall">Aperçu</Text>
                      <Text variant="bodySmall">Liste ou détail</Text>
                      <Button onPress={() => setExpanded(expanded ? '' : 'panel')}>Ouvrir les paramètres</Button>
                    </View>
                    {expanded === 'panel' ? (
                      <View style={[styles.sidePanel, { backgroundColor: theme.colors.surface }]}>
                        <Text variant="labelLarge">Paramètres</Text>
                        <Text variant="bodySmall">Apparence</Text>
                        <Text variant="bodySmall">Notifications</Text>
                        <IconButton
                          icon="close"
                          accessibilityLabel="Fermer le panneau"
                          onPress={() => setExpanded('')}
                        />
                      </View>
                    ) : null}
                  </View>
                </>
              ) : null}
              {item.id === 'dialog' ? (
                <>
                  <Text variant="titleSmall">Nouvelle intervention</Text>
                  <TextInput label="Véhicule" mode="outlined" dense defaultValue="CI-4521-AB" />
                  <TextInput label="Motif" mode="outlined" dense defaultValue="Contrôle de balise" />
                  <View style={styles.row}>
                    <Button onPress={() => setExpanded('')}>Annuler</Button>
                    <Button mode="contained" onPress={() => setExpanded('Intervention enregistrée.')}>
                      Enregistrer
                    </Button>
                  </View>
                  {expanded && expanded !== 'panel' ? <Chip icon="check">{expanded}</Chip> : null}
                </>
              ) : null}
              {item.id === 'catalog' ? (
                <>
                  <View style={styles.row}>
                    <Chip selected onPress={() => setChoice('Composants')}>
                      Composants
                    </Chip>
                    <Chip onPress={() => setChoice('Layouts')}>Layouts</Chip>
                    <Chip onPress={() => setChoice('Harnais')}>Harnais</Chip>
                  </View>
                  <TextInput label="Rechercher dans le catalogue" mode="outlined" dense />
                  <List.Item
                    title={choice}
                    description="13 catégories · démos tactiles"
                    left={(p) => <List.Icon {...p} icon="view-grid-outline" />}
                    right={(p) => <List.Icon {...p} icon="chevron-right" />}
                  />
                </>
              ) : null}
            </View>
            <Divider />
            <Button
              mode="text"
              icon="arrow-right"
              contentStyle={styles.action}
              onPress={() => router.push(`/pages/${item.slug}`)}
            >
              Explorer l’exemple associé
            </Button>
          </Card.Content>
        </Card>
      ))}
    </Page>
  );
}

function MiniBlock({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.miniBlock, { backgroundColor: color }]}>
      <Text variant="labelSmall">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.s3 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  preview: { padding: space.s3, gap: space.s2, borderRadius: radius.lg },
  topbar: {
    minHeight: 44,
    borderRadius: radius.sm,
    paddingHorizontal: space.s2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  metric: { flex: 1, minWidth: 82 },
  bottomNav: { minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  flex: { flex: 1 },
  miniBlock: {
    flex: 1,
    minWidth: 100,
    minHeight: 58,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authPreview: { maxWidth: 360, width: '100%', alignSelf: 'center', gap: space.s2 },
  hero: { minHeight: 100, padding: space.s3, justifyContent: 'center', gap: space.s1, borderRadius: radius.md },
  sidePanel: { width: 150, minHeight: 120, borderRadius: radius.md, padding: space.s2 },
  action: { minHeight: 48, justifyContent: 'flex-start' },
});
