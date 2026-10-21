import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, List, ProgressBar, Text, TextInput } from 'react-native-paper';

import { Page } from '../shell/Page';
import { radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

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

export function MaterialGallery() {
  const theme = useKitTheme();
  const [expanded, setExpanded] = useState('client');
  const [treeOpen, setTreeOpen] = useState<string[]>(['src', 'app']);
  const [selected, setSelected] = useState('');
  const [tasks, setTasks] = useState([
    'Vérifier l’alimentation 12 V',
    'Fixer le boîtier',
    'Brancher le relais',
    'Positionner l’antenne',
    'Tester la remontée GPS',
  ]);
  const [todo, setTodo] = useState(['Balise CI-4521-AB', 'Sonde carburant SOTRA', 'Caméra Actros']);
  const [done, setDone] = useState(['Firmware 12 balises']);
  const [tags, setTags] = useState(['Abidjan', 'Poids lourds', 'Premium']);
  const [tagInput, setTagInput] = useState('');
  const [sheet, setSheet] = useState(false);
  const [visibleRows, setVisibleRows] = useState(12);
  const [ripples, setRipples] = useState(0);

  const toggleTree = (id: string) =>
    setTreeOpen((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  const shiftTask = (index: number, delta: number) =>
    setTasks((items) => {
      const next = [...items];
      const to = Math.max(0, Math.min(items.length - 1, index + delta));
      const item = next.splice(index, 1)[0];
      if (item) next.splice(to, 0, item);
      return next;
    });

  return (
    <Page testID="category-material">
      <Text variant="titleLarge" accessibilityRole="header">
        Material
      </Text>
      <Text variant="bodyLarge">
        Accordéons, arbre, réorganisation, saisie de tags, cartes, grille, feuille basse, liste virtualisée et retours
        tactiles.
      </Text>
      <Section title="Accordion / Expansion panel">
        {(
          [
            ['client', 'Informations client', 'Transports Yao & Fils · CLI-1040 · Abidjan, Yopougon'],
            ['contract', 'Contrat', 'Premium — Flotte · 24 véhicules · échéance 28/02/2027'],
            ['billing', 'Facturation', 'Virement à 30 jours · 1 250 000 FCFA / mois'],
          ] as const
        ).map(([id, title, detail]) => (
          <List.Accordion
            key={id}
            title={title}
            expanded={expanded === id}
            onPress={() => setExpanded(expanded === id ? '' : id)}
            left={(p) => (
              <List.Icon
                {...p}
                icon={id === 'client' ? 'domain' : id === 'contract' ? 'file-document-outline' : 'receipt-text-outline'}
              />
            )}
          >
            <List.Item title={detail} description="Appuyez sur l’en-tête pour développer ou réduire." />
          </List.Accordion>
        ))}
        <Text variant="labelLarge">Questions fréquentes</Text>
        {(
          [
            ['Comment réinitialiser une balise ?', 'Envoyez la commande « cpureset » ou coupez l’alimentation 30 s.'],
            ['Quelle est la précision GPS ?', 'Entre 2 et 5 m en zone dégagée ; jusqu’à 15 m en ville.'],
            ['Puis-je exporter l’historique ?', 'Oui, au format XLSX ou CSV depuis l’onglet Trajets.'],
          ] as const
        ).map(([q, a]) => (
          <List.Accordion key={q} title={q}>
            <List.Item title={a} />
          </List.Accordion>
        ))}
      </Section>

      <Section title="Tree">
        <TreeRow
          label="src"
          id="src"
          level={0}
          open={treeOpen.includes('src')}
          selected={selected === 'src'}
          onToggle={toggleTree}
          onSelect={setSelected}
        />
        {treeOpen.includes('src') ? (
          <>
            <TreeRow
              label="app"
              id="app"
              level={1}
              open={treeOpen.includes('app')}
              selected={selected === 'app'}
              onToggle={toggleTree}
              onSelect={setSelected}
            />
            {treeOpen.includes('app') ? (
              <>
                <TreeRow
                  label="index.tsx"
                  id="index"
                  level={2}
                  file
                  selected={selected === 'index'}
                  onSelect={setSelected}
                />
                <TreeRow
                  label="components/"
                  id="components"
                  level={2}
                  open={treeOpen.includes('components')}
                  selected={selected === 'components'}
                  onToggle={toggleTree}
                  onSelect={setSelected}
                />
                {treeOpen.includes('components') ? (
                  <TreeRow
                    label="[category].tsx"
                    id="category"
                    level={3}
                    file
                    selected={selected === 'category'}
                    onSelect={setSelected}
                  />
                ) : null}
              </>
            ) : null}
            <TreeRow
              label="theme/"
              id="theme"
              level={1}
              open={treeOpen.includes('theme')}
              selected={selected === 'theme'}
              onToggle={toggleTree}
              onSelect={setSelected}
            />
            {treeOpen.includes('theme') ? (
              <TreeRow
                label="buildTheme.ts"
                id="buildTheme"
                level={2}
                file
                selected={selected === 'buildTheme'}
                onSelect={setSelected}
              />
            ) : null}
          </>
        ) : null}
        {selected ? <Text variant="bodySmall">Sélection : {selected}</Text> : null}
      </Section>

      <Section title="Drag & drop">
        <Text variant="labelLarge">Checklist de pose · utilisez les flèches pour réordonner</Text>
        {tasks.map((task, index) => (
          <List.Item
            key={task}
            title={task}
            left={() => <Text style={styles.number}>{index + 1}</Text>}
            right={() => (
              <View style={styles.moveButtons}>
                <IconButton
                  icon="chevron-up"
                  accessibilityLabel={`Monter ${task}`}
                  disabled={index === 0}
                  onPress={() => shiftTask(index, -1)}
                />
                <IconButton
                  icon="chevron-down"
                  accessibilityLabel={`Descendre ${task}`}
                  disabled={index === tasks.length - 1}
                  onPress={() => shiftTask(index, 1)}
                />
              </View>
            )}
          />
        ))}
        <View style={styles.twoLists}>
          <View style={styles.listColumn}>
            <Text variant="labelLarge">À faire</Text>
            {todo.map((item) => (
              <Chip
                key={item}
                onPress={() => {
                  setTodo((items) => items.filter((value) => value !== item));
                  setDone((items) => [...items, item]);
                }}
              >
                {item}
              </Chip>
            ))}
          </View>
          <View style={styles.listColumn}>
            <Text variant="labelLarge">Terminé</Text>
            {done.map((item) => (
              <Chip
                key={item}
                onPress={() => {
                  setDone((items) => items.filter((value) => value !== item));
                  setTodo((items) => [...items, item]);
                }}
              >
                {item}
              </Chip>
            ))}
          </View>
        </View>
      </Section>

      <Section title="Chips input">
        <TextInput
          label="Ajouter un critère"
          mode="outlined"
          value={tagInput}
          onChangeText={setTagInput}
          onSubmitEditing={() => {
            if (tagInput.trim()) setTags((items) => [...items, tagInput.trim()]);
            setTagInput('');
          }}
          right={
            <TextInput.Icon
              icon="plus"
              onPress={() => {
                if (tagInput.trim()) setTags((items) => [...items, tagInput.trim()]);
                setTagInput('');
              }}
            />
          }
        />
        <View style={styles.row}>
          {tags.map((tag) => (
            <Chip key={tag} onClose={() => setTags((items) => items.filter((item) => item !== tag))}>
              {tag}
            </Chip>
          ))}
        </View>
        <Text variant="bodySmall">Suggestions : Bouaké · Utilitaires · Essentiel · Impayés</Text>
      </Section>

      <Section title="Card">
        <Card mode="elevated">
          <Card.Title
            title="Toyota Hilux"
            subtitle="CI-1024-AB"
            left={(p) => <List.Icon {...p} icon="truck-outline" />}
            right={(p) => <IconButton {...p} icon="dots-vertical" accessibilityLabel="Options du véhicule" />}
          />
        </Card>
        <Card mode="contained">
          <Card.Content style={styles.content}>
            <View style={[styles.art, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text variant="titleMedium">Dépôt de Koumassi</Text>
            </View>
            <Text variant="titleMedium">Dépôt de Koumassi</Text>
            <Text>12 véhicules · 3 techniciens</Text>
            <View style={styles.row}>
              <Button>Itinéraire</Button>
              <Button>Détails</Button>
            </View>
          </Card.Content>
        </Card>
        <Card mode="outlined">
          <Card.Content style={styles.content}>
            <Text variant="labelMedium">ABONNEMENT</Text>
            <Text variant="titleLarge">Premium — Flotte</Text>
            <ProgressBar progress={0.62} />
            <Text variant="bodySmall">62 % de la période écoulée</Text>
          </Card.Content>
        </Card>
      </Section>

      <Section title="Grid list">
        <View style={styles.grid}>
          {['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Man'].map((city, index) => (
            <Card
              key={city}
              mode="contained"
              style={[
                styles.gridItem,
                {
                  backgroundColor: [
                    theme.colors.primaryContainer,
                    theme.colors.secondaryContainer,
                    theme.colors.tertiaryContainer,
                  ][index % 3],
                },
              ]}
            >
              <Card.Content style={styles.gridContent}>
                <Text variant="headlineSmall">{['⌖', '◉', '◌', '◎', '⊙', '◇'][index]}</Text>
                <Text variant="labelLarge">{city}</Text>
                <Text variant="bodySmall">{3 + index * 2} sites</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Bottom sheet">
        <Button mode="contained-tonal" icon="share-outline" onPress={() => setSheet(true)}>
          Partager le rapport
        </Button>
        <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
          <View style={styles.sheetBackdrop}>
            <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.sheetHandle} />
              <Text variant="titleLarge">Partager le rapport</Text>
              <Text>Choisissez un format à envoyer.</Text>
              <List.Item
                title="Copier le lien"
                left={(p) => <List.Icon {...p} icon="link-variant" />}
                onPress={() => setSheet(false)}
              />
              <List.Item
                title="Envoyer par e-mail"
                left={(p) => <List.Icon {...p} icon="email-outline" />}
                onPress={() => setSheet(false)}
              />
              <Button mode="contained" onPress={() => setSheet(false)}>
                Fermer
              </Button>
            </View>
          </View>
        </Modal>
      </Section>

      <Section title="Virtual scroll">
        <Text variant="bodySmall">Éléments 1–{Math.min(visibleRows, 100)} sur 100 · fenêtre locale paginée</Text>
        <ScrollView nestedScrollEnabled style={styles.virtualList}>
          {Array.from({ length: Math.min(visibleRows, 100) }, (_, index) => (
            <List.Item
              key={index}
              title={`Intervention INT-${String(4100 + index).padStart(4, '0')}`}
              description={`${['Abidjan', 'Bouaké', 'Cocody', 'Yopougon'][index % 4]} · ${['En attente', 'En cours', 'Clôturée'][index % 3]}`}
              left={(p) => <List.Icon {...p} icon="clipboard-text-outline" />}
            />
          ))}
        </ScrollView>
        <Button
          icon="chevron-down"
          onPress={() => setVisibleRows(Math.min(100, visibleRows + 12))}
          disabled={visibleRows >= 100}
        >
          Charger plus
        </Button>
      </Section>

      <Section title="Ripple">
        <Text variant="bodyMedium">Touchez les éléments pour voir leur état sélectionné.</Text>
        <View style={styles.row}>
          <Button mode="text" icon="gesture-tap" onPress={() => setRipples(ripples + 1)}>
            Bouton texte
          </Button>
          <Button mode="outlined" icon="gesture-tap" onPress={() => setRipples(ripples + 1)}>
            Bouton contour
          </Button>
          <IconButton
            mode="contained-tonal"
            icon="heart-outline"
            accessibilityLabel="Ajouter aux favoris"
            onPress={() => setRipples(ripples + 1)}
          />
        </View>
        <Text variant="bodySmall">Interactions : {ripples}</Text>
      </Section>
    </Page>
  );
}

function TreeRow({
  label,
  id,
  level,
  open,
  selected,
  file = false,
  onToggle,
  onSelect,
}: {
  label: string;
  id: string;
  level: number;
  open?: boolean;
  selected: boolean;
  file?: boolean;
  onToggle?: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <List.Item
      title={label}
      style={{ paddingLeft: level * 20 }}
      left={(p) => <List.Icon {...p} icon={file ? 'file-outline' : open ? 'folder-open-outline' : 'folder-outline'} />}
      right={() =>
        !file ? (
          <IconButton
            icon={open ? 'chevron-down' : 'chevron-right'}
            accessibilityLabel={`${open ? 'Réduire' : 'Développer'} ${label}`}
            onPress={() => onToggle?.(id)}
          />
        ) : null
      }
      onPress={() => (file ? onSelect(id) : onToggle?.(id))}
      description={selected ? 'Sélectionné' : undefined}
    />
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s3 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s1 },
  number: { width: 28, textAlign: 'center', alignSelf: 'center', fontWeight: '700' },
  moveButtons: { flexDirection: 'row' },
  twoLists: { flexDirection: 'row', gap: space.s2 },
  listColumn: { flex: 1, gap: space.s1 },
  art: { height: 96, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  gridItem: { width: '48%', minWidth: 130 },
  gridContent: { minHeight: 116, alignItems: 'center', justifyContent: 'center', gap: space.s1 },
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0007' },
  sheet: { padding: space.s4, gap: space.s2, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888',
    marginBottom: space.s2,
  },
  virtualList: { maxHeight: 300, borderWidth: 1, borderColor: '#aab2c0', borderRadius: radius.md },
});
