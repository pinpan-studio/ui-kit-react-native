import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, IconButton, List, ProgressBar, Text, TextInput } from 'react-native-paper';

import { Page } from '../shell/Page';
import { KIT_CATEGORIES } from '../showcase/kitNav';
import { MIN_TOUCH, radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

type WidgetKind =
  | 'stats'
  | 'chart'
  | 'map'
  | 'table'
  | 'form'
  | 'calendar'
  | 'kanban'
  | 'gantt'
  | 'timeline'
  | 'records'
  | 'choices'
  | 'tree'
  | 'json'
  | 'carousel'
  | 'tabs'
  | 'accordion'
  | 'steps'
  | 'checklist'
  | 'progress'
  | 'heatmap'
  | 'diff'
  | 'approval'
  | 'sources'
  | 'tags'
  | 'files'
  | 'cards'
  | 'compare'
  | 'upload'
  | 'agenda';

interface DemoWidget {
  kind: WidgetKind;
  title: string;
  detail: string;
}
interface Message {
  id: number;
  text: string;
  from: 'assistant' | 'user';
  widgets?: DemoWidget[];
}

const STARTING_MESSAGES: Message[] = [
  {
    id: 1,
    from: 'assistant',
    text: 'Bienvenue dans le harnais. Posez une question ou choisissez un scénario pour afficher des composants en contexte. Les données sont simulées localement.',
  },
];

const SCENARIOS = [
  { title: 'Vue d’ensemble', message: 'Montre-moi le tableau de bord et la flotte.' },
  { title: 'Clients en retard', message: 'Quels clients dois-je relancer ?' },
  { title: 'Créer une intervention', message: 'Je veux planifier une intervention.' },
  { title: 'Planning', message: 'Affiche le calendrier des techniciens.' },
  { title: 'Équipe et tâches', message: 'Montre le kanban des tâches.' },
  { title: 'Déploiement', message: 'Affiche la feuille de route Gantt.' },
  { title: 'Documents', message: 'Ouvre l’arborescence des documents du client.' },
  { title: 'Comparer les offres', message: 'Compare les formules et les équipements.' },
  { title: 'Mise en service', message: 'Où en est la procédure d’installation ?' },
  { title: 'Questions fréquentes', message: 'Quelles sont les questions fréquentes ?' },
  { title: 'Toutes les capacités', message: 'Que sais-tu faire ?' },
];

const WIDGET_INFO: Record<WidgetKind, { icon: string; label: string }> = {
  stats: { icon: 'chart-box-outline', label: 'Indicateurs' },
  chart: { icon: 'chart-line', label: 'Graphique' },
  map: { icon: 'map-outline', label: 'Carte' },
  table: { icon: 'table-large', label: 'Tableau filtrable' },
  form: { icon: 'form-select', label: 'Formulaire' },
  calendar: { icon: 'calendar-month-outline', label: 'Calendrier' },
  kanban: { icon: 'view-kanban-outline', label: 'Kanban' },
  gantt: { icon: 'chart-timeline', label: 'Gantt' },
  timeline: { icon: 'timeline-clock-outline', label: 'Historique' },
  records: { icon: 'account-group-outline', label: 'Techniciens' },
  choices: { icon: 'text-box-check-outline', label: 'Choix' },
  tree: { icon: 'file-tree-outline', label: 'Arborescence' },
  json: { icon: 'code-json', label: 'Réponse API' },
  carousel: { icon: 'view-carousel-outline', label: 'Carrousel' },
  tabs: { icon: 'tab', label: 'Dossier à onglets' },
  accordion: { icon: 'unfold-more-horizontal', label: 'FAQ' },
  steps: { icon: 'chart-timeline-variant', label: 'Étapes' },
  checklist: { icon: 'checkbox-marked-outline', label: 'Checklist' },
  progress: { icon: 'target', label: 'Objectifs' },
  heatmap: { icon: 'grid', label: 'Carte d’activité' },
  diff: { icon: 'file-compare', label: 'Diff de code' },
  approval: { icon: 'shield-check-outline', label: 'Approbation' },
  sources: { icon: 'web', label: 'Sources' },
  tags: { icon: 'tag-multiple-outline', label: 'Thèmes' },
  files: { icon: 'folder-multiple-outline', label: 'Fichiers' },
  cards: { icon: 'view-grid-outline', label: 'Équipements' },
  compare: { icon: 'compare-horizontal', label: 'Comparatif' },
  upload: { icon: 'upload-outline', label: 'Envoi de fichier' },
  agenda: { icon: 'calendar-clock-outline', label: 'Agenda' },
};

function answerFor(prompt: string): { text: string; widgets: DemoWidget[] } {
  const q = prompt.toLocaleLowerCase('fr');
  if (/outil|capabilit|sais-tu|faire quoi/.test(q))
    return {
      text: 'Voici les blocs que le harnais peut afficher. Choisissez un scénario ci-dessus pour en voir une combinaison en contexte.',
      widgets: [
        { kind: 'stats', title: 'Indicateurs et graphiques', detail: 'Mesures, tendances et comparaisons.' },
        { kind: 'table', title: 'Données et listes', detail: 'Tableaux, fiches et historiques.' },
        { kind: 'form', title: 'Actions et saisie', detail: 'Formulaires, choix, validations et fichiers.' },
        { kind: 'calendar', title: 'Organisation', detail: 'Calendriers, agendas, Kanban et Gantt.' },
        { kind: 'tree', title: 'Contenu avancé', detail: 'Arborescences, code, sources et approbations.' },
      ],
    };
  if (/client|relanc|encours|retard|facture/.test(q))
    return {
      text: 'J’ai trouvé 8 comptes avec un encours. Les deux premiers dépassent 30 jours de retard :',
      widgets: [
        {
          kind: 'table',
          title: 'Clients à relancer',
          detail: '8 comptes · recherche, tri et pagination · encours cumulé : 13 030 000 FCFA',
        },
        {
          kind: 'timeline',
          title: 'Dernières relances',
          detail: '08:12 · Bolloré Logistics CI — relance envoyée\nHier · Transports Yao — promesse de règlement',
        },
      ],
    };
  if (/intervention|dépannage|technicien|devis/.test(q))
    return {
      text: 'Complétez les informations nécessaires pour planifier l’intervention. La soumission est simulée et reste sur cet appareil.',
      widgets: [
        {
          kind: 'form',
          title: 'Nouvelle demande d’intervention',
          detail:
            'Client · véhicule · type d’intervention · date · créneau · priorité · équipements · durée · notes · notification SMS',
        },
        {
          kind: 'records',
          title: 'Techniciens disponibles',
          detail: 'Awa Koné · 4 km\nYao Kouamé · 9 km\nIbrahim Traoré · 15 km',
        },
      ],
    };
  if (/agenda|semaine|rendez|calendrier|planning|disponib/.test(q))
    return {
      text: 'Voici les rendez-vous planifiés. Mercredi après-midi reste disponible.',
      widgets: [
        {
          kind: 'calendar',
          title: 'Interventions du mois',
          detail: '9 rendez-vous planifiés · Installation Bolloré · Dépannage SOTRA · Audit Cargill',
        },
        {
          kind: 'agenda',
          title: 'Agenda de la semaine',
          detail: 'Lun 09:00 · Installation · Bolloré\nMer 14:00 · Créneau libre\nVen 11:00 · Formation chauffeurs',
        },
      ],
    };
  if (/kanban|tâche|taches|équipe/.test(q))
    return {
      text: 'Voici l’avancement de l’équipe. Une tâche de remplacement de sonde est en retard.',
      widgets: [
        {
          kind: 'kanban',
          title: 'Suivi des tâches',
          detail: 'À faire · 2\nEn cours · 2\nTerminé · 1\nINT-0412 · Installer balise CI-4521-AB',
        },
      ],
    };
  if (/gantt|roadmap|feuille de route|déploiement|jalon/.test(q))
    return {
      text: 'Voici la feuille de route du déploiement sur les deux prochaines semaines.',
      widgets: [
        {
          kind: 'gantt',
          title: 'Déploiement des balises',
          detail:
            'Équipe Nord · Repérage sites (80 %) · Installation lot 1\nÉquipe Sud · Formation chauffeurs (40 %)\nÉquipe Port · Recette port (25 %)',
        },
        {
          kind: 'steps',
          title: 'Prochaines étapes',
          detail: 'Repérage terminé · Installation en cours · Recette à venir',
        },
      ],
    };
  if (/carte|map|gps|position|flotte|véhicule|trajet|zone/.test(q))
    return {
      text: 'La flotte compte 8 véhicules suivis. Un véhicule a quitté sa zone autorisée à Port-Bouët.',
      widgets: [
        {
          kind: 'map',
          title: 'Flotte en temps réel',
          detail: 'Abidjan · 8 véhicules suivis · 5 en mouvement · 2 à l’arrêt · 1 alerte (CI-9902-NP)',
        },
        {
          kind: 'timeline',
          title: 'Historique de l’alerte',
          detail: '10:05 · Sortie de zone Port-Bouët\n10:07 · Superviseur prévenu',
        },
      ],
    };
  if (/graph|chiffre|\bca\b|ventes|revenu|statist|tableau de bord|dashboard/.test(q))
    return {
      text: 'Le chiffre d’affaires progresse de 30 % sur un an. Abidjan reste la première région.',
      widgets: [
        {
          kind: 'stats',
          title: 'Activité',
          detail: '42 véhicules actifs · 12 480 km parcourus · 5 alertes ouvertes · disponibilité 96,4 %',
        },
        {
          kind: 'chart',
          title: 'Chiffre d’affaires mensuel',
          detail: 'En millions FCFA · 2026 vs 2025 · progression régulière depuis mai',
        },
        {
          kind: 'chart',
          title: 'Répartition régionale',
          detail: 'Abidjan · 1 420 M\nBouaké · 396 M\nSan-Pédro · 274 M',
        },
      ],
    };
  if (/document|arborescence/.test(q))
    return {
      text: 'Voici le dossier documentaire. Sélectionnez les pièces utiles avant de générer le rapport.',
      widgets: [
        {
          kind: 'tree',
          title: 'Documents du dossier client',
          detail:
            'Contrats\n  CTR-2026-0042.pdf · Signé\n  Avenant n°1.pdf · En attente\nFactures\n  FAC-2026-0911.pdf · Impayée',
        },
        { kind: 'files', title: 'Fichiers générés', detail: 'Rapport client.pdf · prêt à être envoyé' },
      ],
    };
  if (/compar|offre|formule|prix|équipement/.test(q))
    return {
      text: 'Pour une flotte de cette taille, la formule Pro offre le meilleur équilibre.',
      widgets: [
        {
          kind: 'compare',
          title: 'Comparatif des formules',
          detail: 'Essentiel · 4 500 FCFA/véhicule\nPro · 7 500 FCFA/véhicule · recommandé\nEntreprise · sur devis',
        },
        { kind: 'cards', title: 'Équipements recommandés', detail: 'Balise GPS · Caméra embarquée · Sonde carburant' },
        {
          kind: 'carousel',
          title: 'Nos offres de suivi',
          detail: '4 formules disponibles · faites défiler dans le catalogue',
        },
      ],
    };
  if (/mise en service|procédure|installation|onboarding|étape/.test(q))
    return {
      text: 'La mise en service est en cours. Deux contrôles restent à effectuer avant l’installation.',
      widgets: [
        {
          kind: 'steps',
          title: 'Mise en service client',
          detail: 'Compte créé · Contrat validé · Matériel à installer · Formation à planifier',
        },
        {
          kind: 'checklist',
          title: 'Contrôles avant installation',
          detail: 'Vérifier le véhicule · Confirmer le créneau · Préparer le matériel',
        },
        { kind: 'progress', title: 'Objectif du trimestre', detail: 'Installations · 76 % de l’objectif atteint' },
      ],
    };
  if (/faq|question|comment|aide/.test(q))
    return {
      text: 'Voici les réponses disponibles dans la base de connaissances.',
      widgets: [
        {
          kind: 'accordion',
          title: 'Questions fréquentes',
          detail:
            'Comment installer une balise GPS ?\nQuelle est la durée de l’abonnement ?\nComment ajouter un véhicule ?',
        },
        {
          kind: 'sources',
          title: 'Sources consultées',
          detail: 'Guide de mise en service · Centre d’aide · Documentation produit',
        },
      ],
    };
  if (/fichier|upload|envoyer|analyse/.test(q))
    return {
      text: 'Vous pouvez joindre un export de trajets, une facture ou une liste de véhicules. Le traitement est simulé.',
      widgets: [
        {
          kind: 'upload',
          title: 'Fichier à analyser',
          detail: 'Formats acceptés : CSV, XLSX, PDF · taille maximale : 20 Mo',
        },
      ],
    };
  if (/code|bug|corrig|api|json/.test(q))
    return {
      text: 'Voici une simulation de réponse développeur avec les outils et blocs associés.',
      widgets: [
        { kind: 'json', title: 'Réponse API véhicule', detail: 'GET /vehicules/CI-9902-NP · 200 OK · 84 ms' },
        { kind: 'diff', title: 'Correctif proposé', detail: 'geofence.service.ts · modification simulée (+5 −3)' },
        {
          kind: 'approval',
          title: 'Validation requise',
          detail: 'Confirmer le correctif et lancer les vérifications.',
        },
      ],
    };
  return {
    text: 'Je peux afficher des clients, un planning, des graphiques, une carte ou un formulaire. Choisissez un scénario rapide pour découvrir les blocs disponibles.',
    widgets: [
      {
        kind: 'choices',
        title: 'Que souhaitez-vous consulter ?',
        detail: 'La flotte sur une carte · Les clients à relancer · Le planning · Les indicateurs',
      },
      { kind: 'tags', title: 'Thèmes disponibles', detail: 'Clients · Flotte · Interventions · Documents · Ventes' },
    ],
  };
}

export default function HarnaisPage() {
  const theme = useKitTheme();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(STARTING_MESSAGES);
  const [checked, setChecked] = useState<string[]>([]);
  const nextId = useRef(2);

  const send = (text = draft) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const answer = answerFor(trimmed);
    const now = nextId.current;
    nextId.current += 2;
    setMessages((current) => [
      ...current,
      { id: now, from: 'user', text: trimmed },
      { id: now + 1, from: 'assistant', text: answer.text, widgets: answer.widgets },
    ]);
    setDraft('');
  };

  return (
    <Page testID="harnais">
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text variant="titleLarge" accessibilityRole="header">
            Harnais
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Assistant de démonstration local · scénarios, réponses et widgets simulés.
          </Text>
        </View>
        <Chip icon="circle" compact>
          Local
        </Chip>
      </View>

      <Card mode="outlined">
        <Card.Title
          title="Scénarios rapides"
          subtitle="Essayez les réponses interactives inspirées du harnais Flutter"
        />
        <Card.Content style={styles.scenarios}>
          {SCENARIOS.map((scenario) => (
            <Button
              key={scenario.title}
              mode="outlined"
              icon="play-outline"
              contentStyle={styles.scenarioButton}
              onPress={() => send(scenario.message)}
            >
              {scenario.title}
            </Button>
          ))}
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Title
          title="Conversation de test"
          left={(props) => <Avatar.Icon {...props} icon="robot-outline" />}
          right={() => (
            <IconButton
              icon="refresh"
              accessibilityLabel="Réinitialiser la conversation"
              onPress={() => {
                setMessages(STARTING_MESSAGES);
                setChecked([]);
              }}
            />
          )}
        />
        <Card.Content style={styles.messages}>
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageRow, message.from === 'user' && styles.userRow]}>
              {message.from === 'assistant' ? (
                <Avatar.Icon
                  size={32}
                  icon="robot-outline"
                  style={{ backgroundColor: theme.colors.secondaryContainer }}
                  color={theme.colors.onSecondaryContainer}
                />
              ) : null}
              <View style={styles.messageContent}>
                <View
                  style={[
                    styles.bubble,
                    {
                      backgroundColor:
                        message.from === 'user' ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <Text variant="bodyMedium">{message.text}</Text>
                </View>
                {message.widgets?.map((widget, index) => {
                  const info = WIDGET_INFO[widget.kind];
                  const key = `${message.id}-${index}`;
                  const isCheckable =
                    widget.kind === 'checklist' || widget.kind === 'choices' || widget.kind === 'approval';
                  const selected = checked.includes(key);
                  return (
                    <Card key={key} mode="outlined" style={styles.widget}>
                      <Card.Title
                        title={widget.title}
                        subtitle={info.label}
                        titleVariant="titleSmall"
                        left={(props) => <Avatar.Icon {...props} size={36} icon={info.icon} />}
                      />
                      <Card.Content style={styles.widgetContent}>
                        <Text variant="bodySmall">{widget.detail}</Text>
                        {widget.kind === 'stats' ? (
                          <View style={styles.statsRow}>
                            {['42 actifs', '5 alertes', '96,4 %'].map((item) => (
                              <Chip key={item} compact>
                                {item}
                              </Chip>
                            ))}
                          </View>
                        ) : null}
                        {widget.kind === 'chart' || widget.kind === 'progress' ? (
                          <ProgressBar progress={widget.kind === 'progress' ? 0.76 : 0.72} style={styles.progress} />
                        ) : null}
                        {widget.kind === 'map' ? (
                          <View style={[styles.mapPreview, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Text variant="labelSmall">ABIDJAN</Text>
                            <View style={styles.mapMarkers}>
                              <Chip compact icon="map-marker">
                                5 en mouvement
                              </Chip>
                              <Chip compact icon="alert">
                                1 alerte
                              </Chip>
                            </View>
                          </View>
                        ) : null}
                        {widget.kind === 'form' ? (
                          <TextInput mode="outlined" dense label="Immatriculation" placeholder="CI-0000-AB" />
                        ) : null}
                        {widget.kind === 'table' ? (
                          <TextInput
                            mode="outlined"
                            dense
                            label="Rechercher un client"
                            left={<TextInput.Icon icon="magnify" />}
                          />
                        ) : null}
                        {widget.kind === 'accordion' ? (
                          <List.Accordion title="Afficher une réponse">
                            <Text variant="bodySmall" style={styles.accordionText}>
                              Les guides et informations de la base de connaissance sont disponibles pour cette
                              démonstration.
                            </Text>
                          </List.Accordion>
                        ) : null}
                        {isCheckable ? (
                          <Button
                            compact
                            mode={selected ? 'contained' : 'outlined'}
                            icon={selected ? 'check' : 'chevron-right'}
                            onPress={() =>
                              setChecked((items) => (selected ? items.filter((item) => item !== key) : [...items, key]))
                            }
                          >
                            {selected ? 'Sélectionné' : widget.kind === 'approval' ? 'Approuver' : 'Sélectionner'}
                          </Button>
                        ) : null}
                        {widget.kind === 'upload' ? (
                          <Button
                            mode="outlined"
                            icon="paperclip"
                            onPress={() => setChecked((items) => [...items, key])}
                          >
                            {selected ? 'Fichier joint (simulation)' : 'Joindre un fichier'}
                          </Button>
                        ) : null}
                      </Card.Content>
                    </Card>
                  );
                })}
              </View>
            </View>
          ))}
        </Card.Content>
        <Card.Actions style={styles.composer}>
          <TextInput
            mode="outlined"
            label="Votre message"
            value={draft}
            onChangeText={setDraft}
            style={styles.input}
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
          <IconButton
            icon="send"
            mode="contained"
            accessibilityLabel="Envoyer"
            onPress={() => send()}
            style={styles.send}
          />
        </Card.Actions>
      </Card>

      <Card mode="outlined">
        <Card.Title title="Accès au catalogue" subtitle="Ouvre une galerie de composants" />
        <Card.Content style={styles.categoryList}>
          {KIT_CATEGORIES.map((category) => (
            <List.Item
              key={category.id}
              title={category.label}
              description={`${category.sections.length} exemples`}
              left={(props) => <List.Icon {...props} icon={category.icon} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push(`/components/${category.id}`)}
              style={styles.categoryItem}
            />
          ))}
        </Card.Content>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  headingText: { flex: 1, gap: space.s1 },
  scenarios: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  scenarioButton: { minHeight: MIN_TOUCH },
  messages: { gap: space.s3 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.s2 },
  userRow: { justifyContent: 'flex-end' },
  messageContent: { flex: 1, gap: space.s2 },
  bubble: { alignSelf: 'flex-start', maxWidth: '100%', borderRadius: radius.lg, padding: space.s3 },
  widget: { marginTop: space.s1 },
  widgetContent: { gap: space.s2 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s1 },
  progress: { marginTop: space.s1 },
  mapPreview: { minHeight: 130, borderRadius: radius.md, padding: space.s3, justifyContent: 'space-between' },
  mapMarkers: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s1 },
  accordionText: { paddingHorizontal: space.s3, paddingBottom: space.s2 },
  composer: { alignItems: 'center', gap: space.s1 },
  input: { flex: 1 },
  send: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH },
  categoryList: { gap: space.s1 },
  categoryItem: { minHeight: MIN_TOUCH },
});
