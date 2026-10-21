import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import {
  AuditLog,
  AvatarStack,
  BadgedIcon,
  BarcodeBlock,
  ConfirmDialog,
  CountDot,
  DescriptionList,
  EmptyState,
  ErrorState,
  InputChip,
  KitAvatar,
  KitButton,
  KitCard,
  KitChart,
  KitChip,
  KitDataTable,
  KitIconButton,
  KitProgressBar,
  KitTimeline,
  KpiCard,
  QrBlock,
  ResponsiveGrid,
  RingGauge,
  SegmentedToggle,
  SelectSheet,
  SkeletonListTile,
  Sparkline,
  StatCounter,
  StatusBadge,
  SwipeRow,
  TextDiff,
  TrendChip,
  type AuditEntry,
  type ChartKind,
  type ChartSeries,
  type KitColumn,
} from '../components';
import { date, dayMonth, fcfa, number, compact, time } from '../core/format';
import { useKitSnack } from '../core/snack';
import {
  CA_2025,
  CA_2026,
  CLIENT_STATUTS,
  DEMO_CLIENTS,
  MOIS,
  NOTIFICATIONS,
  STATUT_LABEL,
  STATUT_TONE,
  TIMELINE_EVENTS,
  VILLES,
  type ClientStatut,
  type DemoClient,
} from '../data/showcase';
import { font, kitText, space, tabular, toneColor, toneLight, useKitTheme, type KitTone } from '../theme';
import { Demo, DemoWrap, DocPage, Gap, type DocSection } from './doc';

const V1 = `Article 4 — Conditions financières
Les prestations sont facturées mensuellement, terme à échoir.
Le règlement intervient à trente (30) jours date de facture.
Tout retard entraîne une pénalité de 1 % par mois.
Les prix sont révisables chaque année au 1er janvier.

Article 5 — Résiliation
Chaque partie peut résilier avec un préavis de trois (3) mois.
La résiliation est notifiée par lettre recommandée.`;
const V2 = `Article 4 — Conditions financières
Les prestations sont facturées mensuellement, terme à échoir.
Le règlement intervient à quarante-cinq (45) jours date de facture, par virement ou mobile money.
Tout retard entraîne une pénalité de 1,5 % par mois.
Les prix sont révisables chaque année au 1er janvier.

Article 5 — Résiliation
Chaque partie peut résilier avec un préavis de deux (2) mois.
La résiliation est notifiée par lettre recommandée ou par email avec accusé de réception.
Aucune indemnité n'est due en cas de résiliation à l'échéance.`;
const CFG1 = `{
  "intervalle_gps": 30,
  "vitesse_max": 90,
  "coupe_moteur": false,
  "alertes": ["sortie_zone", "batterie_faible"]
}`;
const CFG2 = `{
  "intervalle_gps": 15,
  "vitesse_max": 90,
  "coupe_moteur": true,
  "alertes": ["sortie_zone", "batterie_faible", "exces_vitesse"]
}`;

const AUDIT: AuditEntry[] = [
  {
    user: 'Aminata Diallo',
    action: 'update',
    hoursAgo: 0.3,
    target: 'Client CLI-1040',
    meta: 'Android · 41.202.x.x',
    changes: [
      { label: 'Téléphone', before: '+225 07 10 20 30 40', after: '+225 05 44 21 18 90' },
      { label: 'Véhicules', before: '12', after: '14' },
    ],
  },
  {
    user: 'Koffi N’Guessan',
    action: 'comment',
    hoursAgo: 1.2,
    target: 'Ticket #4521',
    comment: 'Balise remplacée, la remontée GPS est de nouveau normale. Client prévenu par téléphone.',
  },
  {
    user: 'Aminata Diallo',
    action: 'status',
    hoursAgo: 3,
    target: 'Contrat CTR-2026-0412',
    changes: [
      { label: 'Statut', before: 'Brouillon', after: 'Signé' },
      { label: 'Signé le', after: '15/10/2026' },
    ],
  },
  {
    user: 'Serge Kouamé',
    action: 'create',
    hoursAgo: 26,
    target: 'Véhicule CI-8843-UV',
    changes: [
      { label: 'Marque', after: 'Nissan Navara' },
      { label: 'Groupe', after: 'Livraisons Nord' },
    ],
  },
  {
    user: 'Serge Kouamé',
    action: 'export',
    hoursAgo: 28,
    target: 'Rapport de trajets (septembre)',
    meta: 'XLSX · 2 480 lignes',
  },
  { user: 'Jean Kouassi', action: 'delete', hoursAgo: 52, target: 'Zone « Dépôt provisoire »' },
  { user: 'Jean Kouassi', action: 'login', hoursAgo: 55, meta: 'Application mobile · Android' },
];

const CHART_KINDS: [ChartKind, string][] = [
  ['line', 'Ligne'],
  ['area', 'Aire'],
  ['bar', 'Barres'],
  ['hbar', 'Horizontal'],
  ['stacked', 'Empilé'],
  ['doughnut', 'Anneau'],
  ['pie', 'Secteurs'],
  ['radar', 'Radar'],
];

const TRUCK = require('../../assets/images/camion.png');
const LOGO = require('../../assets/images/logo.png');

const sante = (x: DemoClient) => 62 + ((x.vehicules * 7) % 38);

/** `/components/data` — tables, cartes, listes, timeline, badges, KPI, graphiques, diff, audit, QR (`DataGallery`). */
export function DataGallery({ initialSection }: { initialSection?: string }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [clients, setClients] = useState(DEMO_CLIENTS);
  const [statutOverride, setStatutOverride] = useState<Record<string, ClientStatut>>({});
  const [villeOverride, setVilleOverride] = useState<Record<string, string>>({});
  const [tableState, setTableState] = useState('loading');
  const [chart, setChart] = useState<ChartKind>('area');
  const [kpiSeed, setKpiSeed] = useState(0);
  const [chips, setChips] = useState(['Transport', 'Abidjan']);
  const [editing, setEditing] = useState<{ kind: 'statut' | 'ville'; row: DemoClient } | null>(null);
  const [toDelete, setToDelete] = useState<DemoClient[] | null>(null);

  const statut = (x: DemoClient) => statutOverride[x.id] ?? x.statut;
  const ville = (x: DemoClient) => villeOverride[x.id] ?? x.ville;

  const clientCard = (x: DemoClient, selected: boolean) => {
    const st = statut(x);
    return (
      <KitCard color={selected ? kit.primaryLight : undefined} borderColor={selected ? kit.primary : undefined}>
        <View style={styles.rowGap12}>
          <KitAvatar name={x.raisonSociale} size={40} />
          <View style={styles.fill}>
            <Text numberOfLines={1} style={[kitText.cardTitle, { fontSize: 15, color: kit.textPrimary }]}>
              {x.raisonSociale}
            </Text>
            <Text style={[font('400', 11, 'mono'), { color: kit.textMuted }]}>{x.code}</Text>
          </View>
          {selected ? (
            <Icon source="mi:check-circle" size={24} color={kit.primary} />
          ) : (
            <StatusBadge label={STATUT_LABEL[st]} tone={STATUT_TONE[st]} />
          )}
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.rowGap4}>
            <Icon source="mi:location-on" size={15} color={kit.textMuted} />
            <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{ville(x)}</Text>
          </View>
          <View style={styles.rowGap4}>
            <Icon source="mi:local-shipping" size={15} color={kit.textMuted} />
            <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{`${x.vehicules} véh.`}</Text>
          </View>
          <Text style={[font('700', 12.5), tabular, { color: kit.textPrimary }]}>{fcfa(x.caMensuel)}</Text>
        </View>
      </KitCard>
    );
  };

  const name = (x: DemoClient) => (
    <Text numberOfLines={1} style={[font('600', 13), { color: kit.textPrimary }]}>
      {x.raisonSociale}
    </Text>
  );
  const code = (x: DemoClient) => <Text style={[font('400', 11.5, 'mono'), { color: kit.textPrimary }]}>{x.code}</Text>;
  const badge = (x: DemoClient) => <StatusBadge label={STATUT_LABEL[statut(x)]} tone={STATUT_TONE[statut(x)]} />;

  const basicCols: KitColumn<DemoClient>[] = [
    { label: 'Raison sociale', width: 170, sortValue: (x) => x.raisonSociale, cell: name },
    { label: 'Code', width: 100, sortValue: (x) => x.code, cell: code },
    { label: 'Ville', width: 120, sortValue: ville, cell: ville },
    { label: 'Véhicules', width: 100, numeric: true, sortValue: (x) => x.vehicules, cell: (x) => String(x.vehicules) },
    { label: 'CA mensuel', width: 140, numeric: true, sortValue: (x) => x.caMensuel, cell: (x) => fcfa(x.caMensuel) },
    { label: 'Statut', width: 120, sortValue: (x) => CLIENT_STATUTS.indexOf(statut(x)), cell: badge },
  ];

  const advancedCols: KitColumn<DemoClient>[] = [
    { label: 'Raison sociale', width: 160, sortValue: (x) => x.raisonSociale, cell: name },
    { label: 'Code', width: 100, sortValue: (x) => x.code, cell: code },
    { label: 'Contact', width: 150, cell: (x) => x.contact },
    { label: 'Ville', width: 130, sortValue: ville, cell: ville, onEdit: (row) => setEditing({ kind: 'ville', row }) },
    { label: 'Secteur', width: 120, cell: (x) => x.secteur },
    {
      label: 'Véhicules',
      width: 100,
      numeric: true,
      sortValue: (x) => x.vehicules,
      cell: (x) => String(x.vehicules),
      total: (r) => number(r.reduce((a, x) => a + x.vehicules, 0)),
    },
    {
      label: 'CA mensuel',
      width: 140,
      numeric: true,
      sortValue: (x) => x.caMensuel,
      cell: (x) => fcfa(x.caMensuel),
      total: (r) => compact(r.reduce((a, x) => a + x.caMensuel, 0)),
    },
    {
      label: 'Remontée',
      width: 150,
      sortValue: sante,
      cell: (x) => (
        <View style={styles.health}>
          <View style={styles.fill}>
            <KitProgressBar
              value={sante(x) / 100}
              tone={sante(x) > 85 ? 'success' : sante(x) > 70 ? 'warning' : 'error'}
            />
          </View>
          <Text style={[font('400', 11.5), { color: kit.textPrimary }]}>{`${sante(x)} %`}</Text>
        </View>
      ),
    },
    { label: 'Email', width: 230, hidden: true, cell: (x) => x.email },
    { label: 'Téléphone', width: 160, hidden: true, cell: (x) => x.telephone },
    { label: 'Client depuis', width: 120, sortValue: (x) => x.createdAt, cell: (x) => date(x.createdAt) },
    {
      label: 'Statut',
      width: 120,
      sortValue: (x) => CLIENT_STATUTS.indexOf(statut(x)),
      cell: badge,
      onEdit: (row) => setEditing({ kind: 'statut', row }),
    },
  ];

  const ca = 55800000 + kpiSeed * 1350000;
  const veh = 8432 + kpiSeed * 37;

  const s26: ChartSeries = { label: '2026', data: CA_2026.slice(0, 10) };
  const s25: ChartSeries = { label: '2025', data: CA_2025.slice(0, 10) };
  const [chartLabels, chartSeries]: [string[], ChartSeries[]] =
    chart === 'doughnut' || chart === 'pie'
      ? [['Abonnement', 'Installation', 'Maintenance', 'Matériel'], [{ label: 'Part', data: [54, 21, 15, 10] }]]
      : chart === 'hbar'
        ? [
            ['Abidjan', 'Bouaké', 'San-Pédro', 'Yamoussoukro', 'Korhogo'],
            [{ label: 'CA', data: [312, 96, 74, 58, 31] }],
          ]
        : chart === 'radar'
          ? [
              ['Réactivité', 'Qualité', 'Délais', 'Prix', 'Support', 'Couverture'],
              [
                { label: 'Lookas', data: [8, 9, 7, 6, 9, 8] },
                { label: 'Marché', data: [6, 7, 6, 7, 5, 6] },
              ],
            ]
          : chart === 'stacked'
            ? [
                ['T1', 'T2', 'T3', 'T4'],
                [
                  { label: 'Abonnements', data: [92, 101, 112, 120] },
                  { label: 'Installations', data: [31, 36, 29, 40] },
                  { label: 'Matériel', data: [12, 18, 15, 22] },
                ],
              ]
            : [MOIS.slice(0, 10), [s26, s25]];

  const sections: DocSection[] = [
    {
      id: 'table',
      title: 'Table',
      source: 'KitDataTable (styles/entity-list)',
      description:
        'Liste principale : vue cartes (par défaut en mobile) ou tableau défilant à 1re colonne fixe. Recherche, tri par en-tête, pagination.',
      children: (
        <Demo
          label="Clients (40)"
          flush
          code={`<KitDataTable
  rows={clients}
  columns={[…]}
  keyOf={(c) => c.id}
  searchText={(c) => \`\${c.raisonSociale} \${c.code}\`}
  cardBuilder={(c, selected) => <ClientCard client={c} />}
/>`}
        >
          <View style={styles.pad12}>
            <KitDataTable
              rows={clients}
              keyOf={(x) => x.id}
              initialMode="card"
              columns={basicCols}
              searchText={(x) => `${x.raisonSociale} ${x.code} ${x.ville}`}
              cardBuilder={clientCard}
              pageSize={5}
              onRowPress={(x) => snack.show(`Ouverture de ${x.raisonSociale}`)}
            />
          </View>
        </Demo>
      ),
    },
    {
      id: 'table-states',
      title: 'États de table',
      description: 'Chargement (squelettes), vide, aucun résultat de recherche, erreur.',
      children: (
        <Demo label="États">
          <Gap>
            <SegmentedToggle
              value={tableState}
              expand
              onChange={setTableState}
              options={[
                { value: 'loading', label: 'Chargement' },
                { value: 'empty', label: 'Vide' },
                { value: 'noresult', label: 'Recherche' },
                { value: 'error', label: 'Erreur' },
              ]}
            />
            {tableState === 'loading' ? (
              <View>
                <SkeletonListTile />
                <SkeletonListTile />
                <SkeletonListTile />
              </View>
            ) : tableState === 'empty' ? (
              <EmptyState
                icon="mi:groups"
                title="Aucun client trouvé"
                subtitle="Ajustez vos critères de recherche ou ajoutez un nouveau client."
                actionLabel="Nouveau client"
                onAction={() => snack.demoAction('Création')}
              />
            ) : tableState === 'noresult' ? (
              <EmptyState
                icon="mi:search-off"
                title="Aucun résultat"
                subtitle="Aucun client ne correspond à « Korhogo Transit »."
              />
            ) : (
              <ErrorState code="HTTP 503 · réf. 7f2c-91" onRetry={() => setTableState('loading')} />
            )}
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'advanced-table',
      title: 'Table avancée',
      source: 'KitDataTable (selectable, bulkActions, columnToggle, total, onEdit)',
      description:
        'Sélection multiple et actions groupées, colonnes masquables, ligne de total, édition en ligne (touchez une cellule marquée ✎).',
      children: (
        <Demo label="Clients" flush>
          <View style={styles.pad12}>
            <KitDataTable
              rows={clients}
              keyOf={(x) => x.id}
              selectable
              columnToggle
              dense
              searchText={(x) => `${x.raisonSociale} ${x.code} ${x.contact}`}
              cardBuilder={clientCard}
              bulkActions={[
                { id: 'export', label: 'Exporter', icon: 'mi:download' },
                { id: 'mail', label: 'Envoyer un email', icon: 'mi:mail-outline' },
                { id: 'suspend', label: 'Suspendre', icon: 'mi:pause-circle-outline' },
                { id: 'delete', label: 'Supprimer', icon: 'mi:delete-outline', danger: true },
              ]}
              onBulk={(a, rows) => {
                if (a === 'delete') setToDelete(rows);
                else if (a === 'suspend')
                  setStatutOverride((o) => ({
                    ...o,
                    ...Object.fromEntries(rows.map((r) => [r.id, 'suspendu' as ClientStatut])),
                  }));
                else snack.demoAction(`${a === 'export' ? 'Export' : 'Email'} de ${rows.length} client(s)`);
              }}
              columns={advancedCols}
            />
          </View>
        </Demo>
      ),
    },
    {
      id: 'cards',
      title: 'Cards',
      source: '.entity-card · .panel-card',
      cols: 3,
      children: [
        <Demo key="entity" label="Carte d’entité">
          {clients[1] ? clientCard(clients[1], false) : null}
        </Demo>,
        <Demo key="product" label="Carte produit">
          <KitCard padding={0}>
            <View style={[styles.productHero, { backgroundColor: kit.primaryLight }]}>
              <Image source={TRUCK} style={styles.truck} resizeMode="contain" accessibilityIgnoresInvertColors />
              <View style={styles.productBadge}>
                <StatusBadge label="Populaire" tone="tertiary" />
              </View>
            </View>
            <View style={styles.pad16}>
              <Text style={[kitText.cardTitle, { color: kit.textPrimary }]}>Suivi Poids lourds</Text>
              <Text style={[kitText.bodySm, styles.mt4, { color: kit.textSecondary }]}>
                Sondes carburant, temps de conduite, chronotachygraphe.
              </Text>
              <View style={[styles.rowCenter, styles.mt10]}>
                <Text style={[styles.fill, { color: kit.textPrimary }]}>
                  <Text style={font('700', 20, 'heading')}>18 500</Text>
                  <Text style={[font('400', 12), { color: kit.textSecondary }]}> FCFA/mois</Text>
                </Text>
                <KitIconButton
                  icon="mi:add-shopping-cart"
                  size={20}
                  mode="contained-tonal"
                  accessibilityLabel="Ajouter au devis"
                  onPress={() => snack.demoAction('Ajout au devis')}
                />
              </View>
            </View>
          </KitCard>
        </Demo>,
        <Demo key="panel" label="Panneau de section">
          <KitCard
            title="Informations générales"
            icon="mi:info-outline"
            trailing={
              <KitIconButton
                icon="mi:edit"
                size={18}
                accessibilityLabel="Modifier"
                iconColor={kit.textSecondary}
                onPress={() => undefined}
              />
            }
          >
            <DescriptionList
              columns={1}
              horizontal
              items={[
                { label: 'Offre', value: 'Premium — Flotte' },
                { label: 'Véhicules', value: '24' },
                { label: 'Statut', value: 'Actif', type: 'badge', tone: 'success' },
              ]}
            />
          </KitCard>
        </Demo>,
      ],
    },
    {
      id: 'list',
      title: 'List',
      source: 'Liste · SwipeRow',
      description: 'Listes compactes ; balayez une ligne pour l’archiver (geste mobile).',
      cols: 2,
      children: [
        <Demo key="avatars" label="Liste avec avatars" flush>
          {clients.slice(0, 4).map((x) => (
            <TouchableRipple key={x.id} onPress={() => undefined} accessibilityRole="button" style={styles.listRow}>
              <View style={styles.rowGap16}>
                <KitAvatar name={x.contact} online={x.vehicules % 2 === 0} />
                <View style={styles.fill}>
                  <Text style={[font('500', 14), { color: kit.textPrimary }]}>{x.contact}</Text>
                  <Text
                    style={[font('400', 12.5), { color: kit.textSecondary }]}
                  >{`${x.raisonSociale} · ${ville(x)}`}</Text>
                </View>
                <Icon source="mi:chevron-right" size={24} color={kit.textMuted} />
              </View>
            </TouchableRipple>
          ))}
        </Demo>,
        <Demo key="swipe" label="Balayer pour archiver" flush>
          <SwipeList />
        </Demo>,
      ],
    },
    {
      id: 'description-list',
      title: 'Liste descriptive (clé / valeur)',
      source: 'DescriptionList',
      children: [
        <Demo key="grid" label="Grille (copie, liens, badge, multiligne)">
          <DescriptionList
            columns={3}
            items={[
              { label: 'Raison sociale', value: 'Transports Yao & Fils', icon: 'mi:business' },
              { label: 'Code client', value: 'CLI-1040', type: 'mono', copy: true },
              { label: 'Statut', value: 'Actif', type: 'badge', tone: 'success' },
              { label: 'Contact', value: 'Jean Kouassi', icon: 'mi:person-outline' },
              { label: 'Email', value: 'jean.kouassi@transports-yao.ci', type: 'email', copy: true },
              { label: 'Téléphone', value: '+225 07 10 20 30 40', type: 'phone' },
              { label: 'RCCM', value: 'CI-ABJ-2019-B-12345', type: 'mono', copy: true, hint: 'Registre du commerce' },
              { label: 'Site web', value: 'transports-yao.ci', type: 'link' },
              { label: 'Gestionnaire', value: null },
              {
                label: 'Adresse',
                value: 'Zone industrielle de Yopougon\nLot 412, BP 1234 Abidjan 01',
                type: 'multiline',
                full: true,
              },
            ]}
          />
        </Demo>,
        <Demo key="h" label="Horizontale (contrat en cours)">
          <DescriptionList
            horizontal
            title="Contrat en cours"
            items={[
              { label: 'Offre', value: 'Premium — Flotte' },
              { label: 'Début', value: '01/03/2026' },
              { label: 'Échéance', value: '28/02/2027' },
              { label: 'Montant mensuel', value: '1 250 000 FCFA' },
              { label: 'Paiement', value: 'Virement, à 30 jours' },
              { label: 'Renouvellement', value: 'Tacite', type: 'badge', tone: 'info' },
            ]}
          />
        </Demo>,
      ],
    },
    {
      id: 'timeline',
      title: 'Timeline',
      source: 'KitTimeline',
      cols: 2,
      children: [
        <Demo key="cycle" label="Cycle d’une requête">
          <KitTimeline
            items={TIMELINE_EVENTS.map((e) => ({
              title: e.titre,
              text: e.texte,
              time: `${dayMonth(e.date)} · ${time(e.date.getHours(), e.date.getMinutes())}`,
              icon: e.icon,
              tone: e.tone,
            }))}
          />
        </Demo>,
        <Demo key="dense" label="Dense">
          <KitTimeline
            dense
            items={[
              { title: 'Départ du dépôt', time: '08:12', icon: 'mi:play-arrow', tone: 'neutral' },
              { title: 'Entrée zone aéroport', time: '09:40', icon: 'mi:login', tone: 'info' },
              {
                title: 'Sortie de zone autorisée',
                text: 'Geofence « Port-Bouët » franchie',
                time: '10:05',
                icon: 'mi:warning',
                tone: 'error',
              },
              { title: 'Alerte envoyée', time: '10:07', icon: 'mi:notifications-active', tone: 'warning' },
            ]}
          />
        </Demo>,
      ],
    },
    {
      id: 'badge',
      title: 'Badge',
      source: 'StatusBadge (.m3-badge) · BadgedIcon',
      cols: 2,
      children: [
        <Demo key="status" label="Statuts">
          <DemoWrap spacing={8}>
            <StatusBadge label="Actif" tone="success" icon="mi:check-circle" />
            <StatusBadge label="Suspendu" tone="warning" />
            <StatusBadge label="Résilié" tone="error" />
            <StatusBadge label="Installé" tone="info" />
            <StatusBadge label="Premium" tone="purple" icon="mi:workspace-premium" />
            <StatusBadge label="Brouillon" />
            <StatusBadge label="Nouveau" tone="primary" uppercase={false} />
          </DemoWrap>
        </Demo>,
        <Demo key="dots" label="Pastilles d’icône">
          <DemoWrap spacing={20}>
            <BadgedIcon icon="bell-outline" count={3} />
            <BadgedIcon icon="mi:mail-outline" count={12} badgeColor={kit.primary} />
            <BadgedIcon icon="mi:chat-bubble-outline" dot />
            <BadgedIcon icon="cart-outline" count="99+" />
            <View style={styles.rowGap6}>
              <Text style={{ color: kit.textPrimary }}>Alertes</Text>
              <CountDot count={5} />
            </View>
          </DemoWrap>
        </Demo>,
      ],
    },
    {
      id: 'chip',
      title: 'Chip',
      source: 'KitChip · InputChip',
      cols: 2,
      children: [
        <Demo key="filters" label="Filtres">
          <DemoWrap spacing={8}>
            {['Transport', 'Logistique', 'Abidjan', 'Bouaké', 'Premium'].map((t) => (
              <KitChip
                key={t}
                label={t}
                selected={chips.includes(t)}
                onPress={() => setChips(chips.includes(t) ? chips.filter((c) => c !== t) : [...chips, t])}
              />
            ))}
          </DemoWrap>
        </Demo>,
        <Demo key="input" label="Saisie & actions">
          <DemoWrap spacing={8}>
            <View style={styles.rowGap4}>
              <KitAvatar name="Awa Koné" size={24} />
              <InputChip label="Awa Koné" onRemove={() => undefined} />
            </View>
            <InputChip label="Marcory" onRemove={() => undefined} />
            <KitChip label="Ajouter un filtre" icon="mi:add" onPress={() => undefined} />
            <KitChip label="Lecture seule" />
          </DemoWrap>
        </Demo>,
      ],
    },
    {
      id: 'avatar',
      title: 'Avatar',
      source: 'KitAvatar · AvatarStack',
      cols: 3,
      children: [
        <Demo key="sizes" label="Tailles">
          <DemoWrap>
            <KitAvatar name="Jean Kouassi" size={24} />
            <KitAvatar name="Marie Yao" size={32} />
            <KitAvatar name="Aminata Diallo" size={40} />
            <KitAvatar name="Koffi N’Guessan" size={56} />
          </DemoWrap>
        </Demo>,
        <Demo key="presence" label="Image & présence">
          <DemoWrap>
            <KitAvatar name="Logo" size={48} image={LOGO} />
            <KitAvatar name="Fatou Bamba" size={48} online />
            <KitAvatar name="Serge Kouamé" size={48} online={false} />
          </DemoWrap>
        </Demo>,
        <Demo key="group" label="Groupe">
          <AvatarStack
            names={['Jean Kouassi', 'Marie Yao', 'Aminata Diallo', 'Koffi N’Guessan', 'Fatou Bamba', 'Serge Kouamé']}
          />
        </Demo>,
      ],
    },
    {
      id: 'stats',
      title: 'Statistics cards',
      source: '.kpi-card · Sparkline',
      children: [
        <ResponsiveGrid key="kpi" minItemWidth={240}>
          <KpiCard icon="mi:groups" value="1 284" label="Clients actifs" tone="primary" delta="+4,2 %" up />
          <KpiCard icon="mi:local-shipping" value="8 432" label="Véhicules suivis" tone="info" delta="+3,1 %" up />
          <KpiCard icon="mi:payments" value="55,8" unit="M FCFA" label="CA du mois" tone="success" delta="+9,2 %" up />
          <KpiCard icon="mi:warning-amber" value="17" label="Alertes ouvertes" tone="warning" delta="−5" up={false} />
        </ResponsiveGrid>,
        <Demo key="spark" label="Tuiles avec mini-courbe">
          <ResponsiveGrid minItemWidth={200} spacing={10}>
            <SparkTile
              label="Km parcourus"
              value="12 480"
              delta="+8 %"
              up
              tone="primary"
              data={[1500, 1720, 1650, 1880, 1790, 1960, 1980]}
            />
            <SparkTile
              label="Disponibilité"
              value="96,4 %"
              delta="+0,6 pt"
              up
              tone="success"
              data={[95.2, 95.6, 95.4, 95.9, 96.1, 96.0, 96.4]}
            />
            <SparkTile
              label="Impayés"
              value="4,9 M"
              delta="+12 %"
              up
              good={false}
              tone="error"
              data={[3.1, 3.4, 3.2, 3.9, 4.2, 4.4, 4.9]}
            />
          </ResponsiveGrid>
        </Demo>,
      ],
    },
    {
      id: 'counters',
      title: 'Compteurs animés & tendances',
      source: 'StatCounter · TrendChip · RingGauge',
      children: (
        <Demo label="Animation au changement" hint="touchez « Actualiser »">
          <Gap>
            <View style={styles.rowCenter}>
              <View style={styles.fill}>
                <Text style={[kitText.label, { color: kit.textSecondary }]}>CA du mois</Text>
                <StatCounter value={ca} compact suffix=" FCFA" />
                <TrendChip text="+9,2 % vs sept." />
              </View>
              <View style={styles.fill}>
                <Text style={[kitText.label, { color: kit.textSecondary }]}>Véhicules</Text>
                <StatCounter value={veh} />
                <TrendChip text="+3,1 % vs sept." />
              </View>
              <RingGauge value={0.72 + (kpiSeed % 3) * 0.08} tone="success" />
            </View>
            <KitButton
              label="Actualiser"
              icon="mi:refresh"
              variant="secondary"
              onPress={() => setKpiSeed((s) => s + 1)}
            />
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'charts',
      title: 'Graphiques',
      source: 'KitChart (SVG)',
      description: 'Couleurs du thème, grille discrète, info-bulles au toucher. Touchez un point ou une barre.',
      children: (
        <Demo
          label="Types"
          code={`<KitChart
  kind="area"
  labels={mois}
  series={[{ label: '2026', data: ca2026 }, { label: '2025', data: ca2025 }]}
  compactValues
/>`}
        >
          <Gap>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {CHART_KINDS.map(([k, l]) => (
                <KitChip key={k} label={l} selected={chart === k} onPress={() => setChart(k)} />
              ))}
            </ScrollView>
            <KitChart
              key={chart}
              kind={chart}
              labels={chartLabels}
              series={chartSeries}
              compactValues={chart === 'line' || chart === 'area' || chart === 'bar'}
              unit={
                chart === 'doughnut' || chart === 'pie' ? ' %' : chart === 'hbar' || chart === 'stacked' ? ' M' : ''
              }
            />
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'diff',
      title: 'Comparaison de versions (diff)',
      source: 'TextDiff · diffLines (LCS)',
      description: 'Vue unifiée adaptée à l’écran étroit ; les lignes identiques peuvent être repliées.',
      children: [
        <Demo key="text" label="Contrat (texte)">
          <TextDiff before={V1} after={V2} fileName="contrat-cadre.txt" />
        </Demo>,
        <Demo key="code" label="Configuration (code)">
          <TextDiff before={CFG1} after={CFG2} fileName="gt06-config.json" mono />
        </Demo>,
      ],
    },
    {
      id: 'audit',
      title: 'Historique des modifications (audit log)',
      source: 'AuditLog',
      children: (
        <Demo label="Activité du compte">
          <AuditLog entries={AUDIT} />
        </Demo>
      ),
    },
    {
      id: 'qr',
      title: 'QR code & code-barres',
      source: 'react-native-qrcode-svg · Code 128 (SVG)',
      cols: 3,
      children: [
        <Demo key="link" label="Lien de suivi">
          <QrBlock data="https://suivi.lookas.ci/v/CI-4521-AB" label="Suivi CI-4521-AB" />
        </Demo>,
        <Demo key="wifi" label="Wi-Fi atelier + logo">
          <QrBlock data="WIFI:T:WPA;S:Atelier-Lookas;P:balise2026;;" label="Atelier-Lookas" withLogo />
        </Demo>,
        <Demo key="barcode" label="Code-barres Code 128">
          <View style={styles.centerItems}>
            <BarcodeBlock data="FAC-2026-0912" />
          </View>
        </Demo>,
      ],
    },
    {
      id: 'empty',
      title: 'Empty state',
      source: 'EmptyState',
      cols: 2,
      children: [
        <Demo key="action" label="Avec action">
          <EmptyState
            icon="mi:inventory-2"
            title="Aucun produit trouvé"
            subtitle="Ajustez vos critères de recherche ou ajoutez un nouveau produit."
            actionLabel="Nouveau produit"
            onAction={() => snack.demoAction('Création')}
          />
        </Demo>,
        <Demo key="compact" label="Compact">
          <EmptyState compact icon="mi:notifications-off" title="Aucune notification" subtitle="Vous êtes à jour." />
        </Demo>,
      ],
    },
  ];

  return (
    <View style={styles.fill}>
      <DocPage
        title="Data display"
        icon="mi:table-chart"
        initialSection={initialSection}
        testID="category-data"
        subtitle="Affichage de données du design system « registre » : tables (cartes en mobile), cartes d’entité, listes compactes, timelines, badges de statut, KPI et graphiques."
        sections={sections}
      />
      <SelectSheet<string>
        visible={editing !== null}
        onDismiss={() => setEditing(null)}
        title={editing?.kind === 'statut' ? `Statut — ${editing.row.raisonSociale}` : 'Ville'}
        searchable={editing?.kind === 'ville'}
        selected={editing ? (editing.kind === 'statut' ? statut(editing.row) : ville(editing.row)) : null}
        options={
          editing?.kind === 'statut'
            ? CLIENT_STATUTS.map((s) => ({ value: s, label: STATUT_LABEL[s], tone: STATUT_TONE[s] }))
            : VILLES.map((v) => ({ value: v, label: v }))
        }
        onSelect={(v) => {
          if (editing && v) {
            if (editing.kind === 'statut') setStatutOverride((o) => ({ ...o, [editing.row.id]: v as ClientStatut }));
            else setVilleOverride((o) => ({ ...o, [editing.row.id]: v }));
          }
          setEditing(null);
        }}
      />
      <ConfirmDialog
        visible={toDelete !== null}
        title={`Supprimer ${toDelete?.length ?? 0} client(s) ?`}
        message="Cette action est irréversible."
        confirm="Supprimer"
        danger
        onResult={(ok) => {
          const rows = toDelete ?? [];
          setToDelete(null);
          if (ok) setClients((cs) => cs.filter((c) => !rows.includes(c)));
        }}
      />
    </View>
  );
}

function SparkTile({
  label,
  value,
  delta,
  up,
  good = true,
  tone,
  data,
}: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  good?: boolean;
  tone: KitTone;
  data: number[];
}) {
  const { kit } = useKitTheme();
  return (
    <KitCard padding={space.s4}>
      <Text style={[font('400', 12), { color: kit.textSecondary }]}>{label}</Text>
      <View style={[styles.rowCenter, styles.mt2]}>
        <Text style={[font('700', 20, 'heading'), styles.fill, { color: kit.textPrimary }]}>{value}</Text>
        <TrendChip text={delta} up={up} goodWhenUp={good} />
      </View>
      <View style={styles.mt6}>
        <Sparkline data={data} color={toneColor(tone, kit)} />
      </View>
    </KitCard>
  );
}

/** Notifications à balayer : archiver (droite) ou supprimer (gauche), avec « Annuler ». */
function SwipeList() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [items, setItems] = useState(NOTIFICATIONS);
  if (items.length === 0) {
    return (
      <EmptyState
        compact
        icon="mi:inbox"
        title="Boîte vide"
        subtitle="Tout est archivé."
        actionLabel="Restaurer"
        actionIcon="mi:restore"
        onAction={() => setItems(NOTIFICATIONS)}
      />
    );
  }
  return (
    <View>
      {items.map((n) => (
        <SwipeRow
          key={n.title}
          onDismiss={(d) => {
            const i = items.indexOf(n);
            setItems((l) => l.filter((x) => x !== n));
            snack.show(d === 'archive' ? 'Archivé' : 'Supprimé', {
              action: 'Annuler',
              onAction: () => setItems((l) => [...l.slice(0, i), n, ...l.slice(i)]),
            });
          }}
        >
          <View style={styles.notif}>
            <View style={[styles.notifDisc, { backgroundColor: toneLight(n.tone, kit) }]}>
              <Icon source={n.icon} size={19} color={toneColor(n.tone, kit)} />
            </View>
            <View style={styles.fill}>
              <Text style={[font(n.read ? '500' : '700', 14), { color: kit.textPrimary }]}>{n.title}</Text>
              <Text numberOfLines={1} style={[font('400', 12.5), { color: kit.textSecondary }]}>
                {n.text}
              </Text>
            </View>
          </View>
        </SwipeRow>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad12: { padding: space.s3 },
  pad16: { padding: space.s4 },
  mt2: { marginTop: 2 },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt10: { marginTop: 10 },
  centerItems: { alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowGap4: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowGap6: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowGap12: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowGap16: { flexDirection: 'row', alignItems: 'center', gap: space.s4 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 6, marginTop: 12 },
  health: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  productHero: { height: 110, alignItems: 'center', justifyContent: 'center' },
  truck: { height: 84, width: '80%' },
  productBadge: { position: 'absolute', top: 10, left: 10 },
  listRow: { minHeight: 64, justifyContent: 'center', paddingHorizontal: space.s4 },
  chips: { gap: space.s2 },
  notif: { flexDirection: 'row', alignItems: 'center', gap: space.s4, paddingHorizontal: space.s4, minHeight: 64 },
  notifDisc: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
