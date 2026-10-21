import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  DataTable,
  IconButton,
  List,
  ProgressBar,
  Searchbar,
  SegmentedButtons,
  Text,
} from 'react-native-paper';

import { Page } from '../shell/Page';
import { radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

const initialClients = [
  { id: 'CLI-1040', name: 'Transports Yao & Fils', city: 'Abidjan', vehicles: 24, state: 'Actif', revenue: 1250000 },
  { id: 'CLI-1072', name: 'Bolloré Logistics CI', city: 'Abidjan', vehicles: 48, state: 'Actif', revenue: 2480000 },
  { id: 'CLI-1091', name: 'SOTRA', city: 'Abidjan', vehicles: 130, state: 'Actif', revenue: 8400000 },
  { id: 'CLI-1120', name: 'Negoce du Nord', city: 'Korhogo', vehicles: 12, state: 'En attente', revenue: 620000 },
  { id: 'CLI-1153', name: 'Ivoire Express', city: 'Bouaké', vehicles: 32, state: 'Actif', revenue: 1975000 },
] as const;
type Client = (typeof initialClients)[number];

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

export function DataGallery() {
  const theme = useKitTheme();
  const [clients, setClients] = useState<Client[]>([...initialClients]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'vehicles'>('name');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [tableState, setTableState] = useState('data');
  const [count, setCount] = useState(1248);
  const [period, setPeriod] = useState('month');
  const [chart, setChart] = useState('area');
  const [auditFilter, setAuditFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(
    () =>
      clients
        .filter((client) => `${client.name} ${client.id} ${client.city}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name, 'fr') : b.vehicles - a.vehicles)),
    [clients, query, sort],
  );
  const flipSort = (key: 'name' | 'vehicles') => setSort(key);
  const toggleRow = (id: string) =>
    setSelectedRows((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  const stateLabel =
    tableState === 'loading'
      ? 'Chargement des clients…'
      : tableState === 'empty'
        ? 'Aucun client ne correspond à ces filtres.'
        : 'Impossible de charger les clients.';

  return (
    <Page testID="category-data">
      <Text variant="titleLarge" accessibilityRole="header">
        Data display
      </Text>
      <Text variant="bodyLarge">
        Tables, listes, cartes, indicateurs, graphiques et historique d’activité avec données locales déterministes.
      </Text>
      <Section title="Table">
        <Searchbar placeholder="Rechercher un client…" value={query} onChangeText={setQuery} />
        <ScrollView horizontal>
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title onPress={() => flipSort('name')}>Client {sort === 'name' ? '↑' : ''}</DataTable.Title>
              <DataTable.Title>Ville</DataTable.Title>
              <DataTable.Title numeric onPress={() => flipSort('vehicles')}>
                Véhicules {sort === 'vehicles' ? '↓' : ''}
              </DataTable.Title>
              <DataTable.Title>Statut</DataTable.Title>
            </DataTable.Header>
            {filtered.slice((page - 1) * 4, page * 4).map((client) => (
              <DataTable.Row key={client.id} onPress={() => toggleRow(client.id)}>
                <DataTable.Cell>{client.name}</DataTable.Cell>
                <DataTable.Cell>{client.city}</DataTable.Cell>
                <DataTable.Cell numeric>{client.vehicles}</DataTable.Cell>
                <DataTable.Cell>{client.state}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
        <View style={styles.row}>
          <Button onPress={() => setPage(Math.max(1, page - 1))}>Précédent</Button>
          <Text>
            Page {page} sur {Math.max(1, Math.ceil(filtered.length / 4))}
          </Text>
          <Button onPress={() => setPage(Math.min(Math.ceil(filtered.length / 4), page + 1))}>Suivant</Button>
        </View>
      </Section>
      <Section title="États de table">
        <SegmentedButtons
          value={tableState}
          onValueChange={setTableState}
          buttons={[
            { value: 'data', label: 'Données' },
            { value: 'loading', label: 'Chargement' },
            { value: 'empty', label: 'Vide' },
            { value: 'error', label: 'Erreur' },
          ]}
        />
        {tableState === 'data' ? (
          <Text>5 clients · dernière synchronisation à 14:05</Text>
        ) : (
          <View style={styles.stateBox}>
            {tableState === 'loading' ? <ProgressBar indeterminate /> : null}
            <Text variant="titleSmall">{stateLabel}</Text>
            {tableState === 'error' ? <Button onPress={() => setTableState('data')}>Réessayer</Button> : null}
          </View>
        )}
      </Section>
      <Section title="Table avancée">
        <View style={styles.row}>
          <Text variant="labelLarge">{selectedRows.length} sélectionné(s)</Text>
          <Button
            icon="delete-outline"
            disabled={!selectedRows.length}
            onPress={() => {
              setClients((items) => items.filter((client) => !selectedRows.includes(client.id)));
              setSelectedRows([]);
            }}
          >
            Supprimer
          </Button>
          <Button icon="download-outline" onPress={() => setCopied(true)}>
            Exporter
          </Button>
        </View>
        <ScrollView horizontal>
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title>Choix</DataTable.Title>
              <DataTable.Title>Référence</DataTable.Title>
              <DataTable.Title>Client</DataTable.Title>
              <DataTable.Title numeric>CA mensuel</DataTable.Title>
            </DataTable.Header>
            {clients.map((client) => (
              <DataTable.Row key={client.id} onPress={() => toggleRow(client.id)}>
                <DataTable.Cell>
                  <Checkbox
                    status={selectedRows.includes(client.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleRow(client.id)}
                  />
                </DataTable.Cell>
                <DataTable.Cell>{client.id}</DataTable.Cell>
                <DataTable.Cell>{client.name}</DataTable.Cell>
                <DataTable.Cell numeric>{client.revenue.toLocaleString('fr-FR')}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
        {copied ? <Text variant="bodySmall">Export préparé localement.</Text> : null}
      </Section>
      <Section title="Cards">
        <View style={styles.cardsRow}>
          {clients.slice(0, 2).map((client) => (
            <Card key={client.id} mode="outlined" style={styles.entityCard}>
              <Card.Title
                title={client.name}
                subtitle={client.id}
                left={(p) => (
                  <Avatar.Text
                    {...p}
                    size={36}
                    label={client.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  />
                )}
              />
              <Card.Content style={styles.content}>
                <Text>
                  {client.city} · {client.vehicles} véhicules
                </Text>
                <Chip icon="check-circle-outline">{client.state}</Chip>
                <Button>Ouvrir la fiche</Button>
              </Card.Content>
            </Card>
          ))}
        </View>
      </Section>
      <Section title="List">
        <List.Item
          title="CI-4521-AB · Toyota Hilux"
          description="Transports Yao & Fils · il y a 12 s"
          left={(p) => <List.Icon {...p} icon="truck-outline" />}
          right={() => <Chip compact>54 km/h</Chip>}
        />
        <List.Item
          title="CI-0418-GH · Mitsubishi L200"
          description="Bolloré Logistics CI · il y a 2 min"
          left={(p) => <List.Icon {...p} icon="truck-outline" />}
          right={() => (
            <Chip compact icon="alert">
              Alerte
            </Chip>
          )}
        />
        <List.Item
          title="Nouvelle intervention"
          description="INT-0420 · Aujourd’hui à 14:30"
          left={(p) => <List.Icon {...p} icon="wrench-outline" />}
          right={(p) => <IconButton {...p} icon="chevron-right" accessibilityLabel="Ouvrir l’intervention" />}
        />
      </Section>
      <Section title="Liste descriptive">
        <Description label="Raison sociale" value="Transports Yao & Fils" />
        <Description label="Code client" value="CLI-1040" />
        <Description label="Contact principal" value="Jean Kouassi · +225 07 22 31 44 58" />
        <Description label="Adresse" value="Yopougon, Abidjan, Côte d’Ivoire" />
        <Description label="Contrat" value="Premium — Flotte · 24 véhicules" />
      </Section>
      <Section title="Timeline">
        <View style={styles.timeline}>
          {[
            ['14:05', 'Paiement reçu', 'FAC-2026-0874 · Bolloré Logistics CI'],
            ['11:32', 'Intervention clôturée', 'INT-0412 · Mariam K.'],
            ['09:18', 'Véhicule entré en zone', 'CI-4521-AB · Plateau'],
            ['Hier', 'Contrat renouvelé', 'Transports Yao & Fils'],
          ].map(([time, title, detail], index) => (
            <View key={title} style={styles.timelineRow}>
              <View
                style={[styles.timelineDot, { backgroundColor: index ? theme.colors.secondary : theme.colors.primary }]}
              />
              <View style={styles.timelineText}>
                <Text variant="labelSmall">{time}</Text>
                <Text variant="titleSmall">{title}</Text>
                <Text variant="bodySmall">{detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>
      <Section title="Badge">
        <View style={styles.row}>
          {[
            ['Actif', theme.colors.primary],
            ['En attente', theme.colors.tertiary],
            ['Suspendu', theme.colors.error],
            ['Nouveau', theme.colors.secondary],
          ].map(([label, color]) => (
            <Badge key={label} style={{ backgroundColor: color }}>
              {label}
            </Badge>
          ))}
        </View>
        <View style={styles.row}>
          <Chip icon="circle">En ligne</Chip>
          <Chip icon="check">Payé</Chip>
          <Chip icon="alert">À vérifier</Chip>
        </View>
      </Section>
      <Section title="Chip">
        <View style={styles.row}>
          {['Tous', 'Actifs', 'En attente', 'Archivés'].map((value) => (
            <Chip key={value} selected={query === value} onPress={() => setQuery(query === value ? '' : value)}>
              {value}
            </Chip>
          ))}
        </View>
        <View style={styles.row}>
          <Chip avatar={<Avatar.Text size={24} label="AM" />}>Aïcha M.</Chip>
          <Chip icon="close-circle-outline" onClose={() => setQuery('')}>
            Filtre actif
          </Chip>
        </View>
      </Section>
      <Section title="Avatar">
        <View style={styles.row}>
          {[
            ['AM', 'Aïcha M.'],
            ['JK', 'Jean K.'],
            ['MK', 'Mariam K.'],
            ['YN', 'Yao N.'],
          ].map(([initials, label], index) => (
            <View key={initials ?? index} style={styles.avatarItem}>
              <Avatar.Text size={index === 0 ? 52 : 40} label={initials ?? 'AM'} />
              <Text variant="labelSmall">{label ?? ''}</Text>
            </View>
          ))}
        </View>
        <Text variant="bodySmall">Groupes d’utilisateurs · avatars textuels et illustrés</Text>
      </Section>
      <Section title="Statistics cards">
        <View style={styles.cardsRow}>
          {[
            ['1 284', 'Clients', '+8,2 %'],
            ['8 432', 'Véhicules', '+4,1 %'],
            ['55,8 M', 'CA octobre', '+9,2 %'],
          ].map(([value, label, trend]) => (
            <Card key={label} mode="contained" style={styles.statCard}>
              <Card.Content style={styles.content}>
                <Text variant="headlineSmall">{value}</Text>
                <Text>{label}</Text>
                <Chip icon="trending-up">{trend}</Chip>
              </Card.Content>
            </Card>
          ))}
        </View>
      </Section>
      <Section title="Compteurs animés">
        <View style={styles.row}>
          <IconButton
            icon="minus"
            accessibilityLabel="Diminuer le total"
            onPress={() => setCount((value) => Math.max(0, value - 25))}
          />
          <Text variant="displaySmall">{count.toLocaleString('fr-FR')}</Text>
          <IconButton
            icon="plus"
            accessibilityLabel="Augmenter le total"
            onPress={() => setCount((value) => value + 25)}
          />
          <Chip>Clients suivis</Chip>
        </View>
        <Text variant="bodySmall">
          Variation totale · +{(count - 1200).toLocaleString('fr-FR')} depuis la période précédente
        </Text>
      </Section>
      <Section title="Graphiques">
        <SegmentedButtons
          value={period}
          onValueChange={setPeriod}
          buttons={[
            { value: 'month', label: 'Mois' },
            { value: 'quarter', label: 'Trimestre' },
            { value: 'year', label: 'Année' },
          ]}
        />
        <SegmentedButtons
          value={chart}
          onValueChange={setChart}
          buttons={[
            { value: 'area', label: 'Aire' },
            { value: 'bar', label: 'Colonnes' },
            { value: 'donut', label: 'Anneau' },
          ]}
        />
        <Card mode="contained">
          <Card.Content>
            <Text variant="titleMedium">
              Chiffre d’affaires · {period === 'month' ? '2026' : period === 'quarter' ? 'Trimestre' : 'Année'}
            </Text>
            <ChartPreview theme={theme} type={chart} />
          </Card.Content>
        </Card>
      </Section>
      <Section title="Diff">
        <View style={styles.diffLine}>
          <Text style={styles.diffPrefix}>−</Text>
          <Text style={styles.diffOld}>Échéance du contrat : 31/12/2026</Text>
        </View>
        <View style={styles.diffLine}>
          <Text style={styles.diffPrefix}>+</Text>
          <Text style={styles.diffNew}>Échéance du contrat : 28/02/2027</Text>
        </View>
        <Text variant="bodySmall">Modifié par Jean Kouassi · aujourd’hui à 14:05</Text>
      </Section>
      <Section title="Audit log">
        <SegmentedButtons
          value={auditFilter}
          onValueChange={setAuditFilter}
          buttons={[
            { value: 'all', label: 'Tout' },
            { value: 'changes', label: 'Modifications' },
            { value: 'access', label: 'Accès' },
          ]}
        />
        {[
          ['14:05', 'Jean Kouassi', 'a modifié le contrat CLI-1040', 'changes'],
          ['11:32', 'Mariam Kone', 'a clôturé INT-0412', 'changes'],
          ['09:00', 'Aïcha Diallo', 's’est connectée', 'access'],
        ]
          .filter((item) => auditFilter === 'all' || item[3] === auditFilter)
          .map(([time, who, action]) => (
            <List.Item
              key={time}
              title={`${who} ${action}`}
              description={`21 oct. 2026 · ${time}`}
              left={(p) => <List.Icon {...p} icon="history" />}
            />
          ))}
      </Section>
      <Section title="QR code & code-barres">
        <View style={styles.row}>
          <View style={styles.qr}>
            <Text style={styles.qrText}>▣ ▢ ▣ ▣</Text>
            <Text style={styles.qrText}>▢ ▣ ▢ ▣</Text>
            <Text style={styles.qrText}>▣ ▣ ▢ ▣</Text>
            <Text style={styles.qrText}>▢ ▢ ▣ ▣</Text>
          </View>
          <View style={styles.barcode}>
            {Array.from({ length: 24 }, (_, index) => (
              <View key={index} style={{ width: index % 3 === 0 ? 3 : 1, height: 60, backgroundColor: '#171717' }} />
            ))}
          </View>
        </View>
        <Text>FAC-2026-0912 · 356307042441013</Text>
        <Button icon={copied ? 'check' : 'content-copy'} onPress={() => setCopied(true)}>
          {copied ? 'Référence copiée' : 'Copier la référence'}
        </Button>
      </Section>
      <Section title="Empty state">
        <View style={styles.empty}>
          <IconButton icon="database-search-outline" size={40} accessibilityLabel="Aucun résultat" />
          <Text variant="titleMedium">Aucun client trouvé</Text>
          <Text>Essayez d’autres termes ou réinitialisez les filtres.</Text>
          <Button
            mode="contained-tonal"
            onPress={() => {
              setQuery('');
              setTableState('data');
            }}
          >
            Effacer les filtres
          </Button>
        </View>
      </Section>
    </Page>
  );
}

function Description({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.description}>
      <Text variant="labelMedium">{label}</Text>
      <Text variant="bodyMedium">{value}</Text>
    </View>
  );
}
function ChartPreview({ theme, type }: { theme: ReturnType<typeof useKitTheme>; type: string }) {
  return type === 'donut' ? (
    <View style={styles.donut}>
      <Text variant="titleMedium">55,8 M</Text>
    </View>
  ) : (
    <View style={styles.chart}>
      {[42, 55, 48, 76, 63, 87, 70, 94, 80, 116].map((height, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: type === 'bar' ? height : height * 0.7,
              backgroundColor: index === 9 ? theme.colors.primary : theme.colors.primaryContainer,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s2 },
  table: { minWidth: 620 },
  stateBox: { minHeight: 90, alignItems: 'center', justifyContent: 'center', gap: space.s2 },
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  entityCard: { flex: 1, minWidth: 240 },
  statCard: { flex: 1, minWidth: 145 },
  description: {
    flexDirection: 'row',
    gap: space.s2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#aab2c0',
    paddingVertical: space.s2,
  },
  timeline: { gap: space.s2 },
  timelineRow: { flexDirection: 'row', gap: space.s3 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineText: { flex: 1, gap: space.s1 },
  avatarItem: { alignItems: 'center', gap: space.s1 },
  chart: {
    minHeight: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: space.s3,
  },
  bar: { width: 16, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  donut: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    margin: space.s4,
    borderWidth: 22,
    borderColor: '#8eb0ef',
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffLine: { flexDirection: 'row', alignItems: 'center', gap: space.s2, padding: space.s2, borderRadius: radius.sm },
  diffPrefix: { fontWeight: '700' },
  diffOld: { color: '#b3261e', textDecorationLine: 'line-through' },
  diffNew: { color: '#166534' },
  qr: { width: 92, height: 92, backgroundColor: '#fff', justifyContent: 'center', padding: space.s1 },
  qrText: { fontFamily: 'SpaceMono_400Regular', fontSize: 12, color: '#111', letterSpacing: 2 },
  barcode: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: space.s2,
    backgroundColor: '#fff',
  },
  empty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: space.s1 },
});
