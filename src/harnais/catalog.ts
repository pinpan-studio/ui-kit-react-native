import { weekday } from '../core/format';
import { FLOTTE } from '../data/map';
import type { KitTone } from '../theme';
import type {
  HzArtifact,
  HzAttachment,
  HzBlock,
  HzConversation,
  HzMessage,
  HzModel,
  HzOption,
  HzToolKind,
  HzValues,
  HzW,
  HzWidgetData,
} from './models';

/** Données, intentions et scénarios simulés du Harnais (`hz_catalog.dart`). */

let seq = 0;
const nid = () => `b${seq++}`;

/** Widget de réponse avec son cadre. */
const w = (data: HzWidgetData, frame: { title?: string; subtitle?: string; icon?: string } = {}): HzW => ({
  ...data,
  ...frame,
  block: 'widget',
  id: nid(),
});
const text = (t: string): HzBlock => ({ block: 'text', id: nid(), text: t });
const list = (items: string[]): HzBlock => ({ block: 'list', id: nid(), items });
const code = (c: string, lang: string, file?: string): HzBlock => ({ block: 'code', id: nid(), code: c, lang, file });
export const tool = (
  kind: HzToolKind,
  label: string,
  target: string,
  output?: string,
): Extract<HzBlock, { block: 'tool' }> => ({
  block: 'tool',
  id: nid(),
  tool: kind,
  label,
  target,
  status: 'done',
  output,
});
const thinking = (t: string, duration: string): HzBlock => ({ block: 'thinking', id: nid(), text: t, duration });
const artifact = (id: string): HzBlock => ({ block: 'artifact', id: nid(), artifact: id });

export const HZ_MODELS: HzModel[] = [
  { id: 'opus', label: 'Opus 5.5', description: 'Le plus capable pour les tâches complexes', badge: 'Pro' },
  { id: 'sonnet', label: 'Sonnet 5.5', description: 'Équilibre idéal pour le quotidien' },
  { id: 'haiku', label: 'Haiku 5.5', description: 'Le plus rapide pour les réponses courtes' },
];

export const HZ_SUGGESTIONS: [string, string, string][] = [
  ['mi:space-dashboard', 'Synthèse', 'Fais-moi un tableau de bord complet de l’activité.'],
  ['mi:map', 'Carte', 'Montre-moi la flotte sur une carte.'],
  ['mi:show-chart', 'Graphique', 'Analyse l’évolution des ventes cette année.'],
  ['mi:table-rows', 'Tableau', 'Liste des clients à relancer.'],
  ['mi:edit-note', 'Formulaire', 'Je veux créer une demande d’intervention.'],
  ['mi:calendar-month', 'Calendrier', 'Affiche le calendrier des interventions.'],
  ['mi:view-kanban', 'Kanban', 'Montre l’avancement des tâches de l’équipe.'],
  ['mi:timeline', 'Gantt', 'Montre la feuille de route du déploiement.'],
  ['mi:account-tree', 'Arborescence', 'Explore les documents du dossier client.'],
  ['mi:difference', 'Corriger un bug', 'Corrige le bug des alertes de zone en double.'],
  ['mi:apps', 'Tous les outils', 'Quels outils peux-tu utiliser ?'],
];

export const HZ_ATTACHABLE: HzAttachment[] = [
  { name: 'app-shell.component.ts', kind: 'code', size: '4 Ko' },
  { name: 'maquette-sidecar.png', kind: 'image', size: '312 Ko' },
  { name: 'cahier-des-charges.pdf', kind: 'pdf', size: '1,2 Mo' },
  { name: 'ventes-T3.xlsx', kind: 'sheet', size: '86 Ko' },
];

const SIDECAR_CODE = `export function Sidecar({ items, selected, onSelect }: SidecarProps) {
  /** Module dont la sous-navigation est déployée (null = rail seul). */
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));
  // …
}`;

export const HZ_ARTIFACTS: HzArtifact[] = [
  { id: 'art-sidecar', title: 'Sidecar.tsx', kind: 'code', lang: 'tsx', version: 2, content: SIDECAR_CODE },
  {
    id: 'art-palette',
    title: 'Palette sombre — notes',
    kind: 'document',
    lang: 'markdown',
    version: 1,
    content: `# Palette sombre accessible

Fond      #0A0D10   (contraste texte 15,8:1)
Surface   #191C1C
Bordure   rgba(255,255,255,.08)
Texte     #E0E3E2
Primaire  #00DDDD   (AA sur surface)

Règle : chaque couleur d'état garde un ratio ≥ 4,5:1 sur la surface.`,
  },
];

export const HZ_TASKS: [string, 'done' | 'running' | 'todo'][] = [
  ['Lire le shell et la galerie de navigation', 'done'],
  ['Fusionner rail et sous-navigation', 'done'],
  ['Animer l’ouverture de la colonne', 'done'],
  ['Extraire un composant réutilisable', 'running'],
  ['Brancher le Sidecar dans le shell', 'todo'],
];

/** Fichiers du contexte : nom, emplacement, jetons, type. */
export const HZ_CONTEXT: [string, string, number, 'code' | 'image'][] = [
  ['NavigationGallery.tsx', 'showcase', 4200, 'code'],
  ['Navigation.tsx', 'components/navigation', 3100, 'code'],
  ['showcase.ts', 'data', 900, 'code'],
  ['maquette-sidecar.png', 'pièce jointe', 1600, 'image'],
];
export const HZ_CONTEXT_LIMIT = 200000;

const day = (offset: number, hour = 9) => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate() + offset, hour);
};

// ─── Briques de widgets (W) ──────────────────────────────────────────

export const W = {
  fleetStats: () =>
    w({
      type: 'stats',
      items: [
        {
          label: 'Véhicules actifs',
          value: '42',
          delta: '+3',
          up: true,
          tone: 'success',
          icon: 'mi:local-shipping',
          hint: 'sur 48',
          spark: [36, 37, 39, 38, 40, 39, 42],
        },
        {
          label: 'Km parcourus',
          value: '12 480',
          delta: '+8 %',
          up: true,
          tone: 'primary',
          icon: 'mi:route',
          hint: '7 derniers jours',
          spark: [1500, 1720, 1650, 1880, 1790, 1960, 1980],
        },
        {
          label: 'Alertes ouvertes',
          value: '5',
          delta: '−2',
          up: false,
          tone: 'warning',
          icon: 'mi:notifications-active',
          spark: [9, 8, 8, 7, 6, 7, 5],
        },
        {
          label: 'Disponibilité',
          value: '96,4 %',
          delta: '+0,6 pt',
          up: true,
          tone: 'info',
          icon: 'mi:verified',
          spark: [95.2, 95.6, 95.4, 95.9, 96.1, 96.0, 96.4],
        },
      ],
    }),
  fleetMap: () =>
    w(
      {
        type: 'map',
        markers: FLOTTE,
        legend: [
          ['En mouvement', 'success'],
          ['À l’arrêt', 'warning'],
          ['Maintenance', 'info'],
          ['Alerte', 'error'],
        ],
      },
      { title: 'Flotte en temps réel', subtitle: 'Abidjan · 8 véhicules suivis', icon: 'mi:map' },
    ),
  salesChart: () =>
    w(
      {
        type: 'chart',
        kind: 'area',
        unit: ' M',
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct'],
        series: [
          { label: '2026', data: [182, 196, 210, 205, 231, 248, 240, 262, 275, 291] },
          { label: '2025', data: [160, 171, 175, 182, 190, 201, 198, 210, 216, 224] },
        ],
      },
      { title: 'Chiffre d’affaires mensuel', subtitle: 'En millions FCFA · 2026 vs 2025', icon: 'mi:show-chart' },
    ),
  mixChart: () =>
    w(
      {
        type: 'chart',
        kind: 'doughnut',
        unit: ' %',
        labels: ['Abonnement', 'Installation', 'Maintenance', 'Matériel'],
        series: [{ label: 'Part', data: [54, 21, 15, 10] }],
      },
      { title: 'Répartition par offre', subtitle: 'Part du CA · octobre', icon: 'mi:donut-large' },
    ),
  regionChart: () =>
    w(
      {
        type: 'chart',
        kind: 'hbar',
        unit: ' M',
        labels: ['Abidjan', 'Bouaké', 'San-Pédro', 'Yamoussoukro', 'Korhogo'],
        series: [{ label: 'CA', data: [1420, 396, 274, 211, 138] }],
      },
      { title: 'CA par région', subtitle: 'Millions FCFA · cumul annuel', icon: 'mi:bar-chart' },
    ),
  clientsTable: () =>
    w(
      {
        type: 'table',
        searchable: true,
        pageSize: 5,
        columns: [
          { key: 'client', label: 'Client', kind: 'person' },
          { key: 'ville', label: 'Ville' },
          { key: 'encours', label: 'Encours', kind: 'number', unit: ' FCFA' },
          { key: 'retard', label: 'Retard', kind: 'number', unit: ' j' },
          {
            key: 'statut',
            label: 'Statut',
            kind: 'badge',
            tones: { Critique: 'error', 'À relancer': 'warning', 'En cours': 'info', Réglé: 'success' },
          },
          { key: 'recouvre', label: 'Recouvré', kind: 'progress' },
        ],
        rows: [
          {
            client: 'Bolloré Logistics CI',
            ville: 'Abidjan',
            encours: 4850000,
            retard: 47,
            statut: 'Critique',
            recouvre: 20,
          },
          {
            client: 'Transports Yao SARL',
            ville: 'Bouaké',
            encours: 2310000,
            retard: 32,
            statut: 'À relancer',
            recouvre: 45,
          },
          { client: 'SOTRA', ville: 'Abidjan', encours: 1980000, retard: 18, statut: 'En cours', recouvre: 60 },
          {
            client: 'Cargill Côte d’Ivoire',
            ville: 'San-Pédro',
            encours: 1420000,
            retard: 12,
            statut: 'En cours',
            recouvre: 72,
          },
          { client: 'Orange CI', ville: 'Abidjan', encours: 980000, retard: 9, statut: 'À relancer', recouvre: 35 },
          { client: 'SIFCA', ville: 'Abidjan', encours: 760000, retard: 5, statut: 'En cours', recouvre: 88 },
          { client: 'Nestlé CI', ville: 'Yamoussoukro', encours: 420000, retard: 2, statut: 'Réglé', recouvre: 100 },
          { client: 'CIE', ville: 'Korhogo', encours: 310000, retard: 1, statut: 'Réglé', recouvre: 100 },
        ],
      },
      { title: 'Clients à relancer', subtitle: '8 comptes · triés par encours', icon: 'mi:table-rows' },
    ),
  interventionForm: () =>
    w(
      {
        type: 'form',
        formId: 'intervention',
        description: 'Il me manque quelques informations pour planifier le technicien.',
        submitLabel: 'Planifier l’intervention',
        fields: [
          {
            key: 'client',
            label: 'Client',
            kind: 'select',
            icon: 'mi:business',
            required: true,
            options: [
              { value: 'bollore', label: 'Bolloré Logistics CI' },
              { value: 'yao', label: 'Transports Yao SARL' },
              { value: 'sotra', label: 'SOTRA' },
            ],
          },
          {
            key: 'vehicule',
            label: 'Immatriculation',
            kind: 'text',
            icon: 'mi:directions-car',
            placeholder: 'CI-0000-AB',
            required: true,
          },
          {
            key: 'type',
            label: 'Type d’intervention',
            kind: 'segmented',
            value: 'install',
            options: [
              { value: 'install', label: 'Installation', icon: 'mi:add-circle' },
              { value: 'repair', label: 'Dépannage', icon: 'mi:build' },
              { value: 'remove', label: 'Retrait', icon: 'mi:remove-circle' },
            ],
          },
          { key: 'date', label: 'Date souhaitée', kind: 'date', required: true },
          {
            key: 'creneau',
            label: 'Créneau',
            kind: 'select',
            value: 'matin',
            options: [
              { value: 'matin', label: 'Matin (8 h – 12 h)' },
              { value: 'aprem', label: 'Après-midi (13 h – 17 h)' },
            ],
          },
          {
            key: 'priorite',
            label: 'Priorité',
            kind: 'radio',
            value: 'normale',
            options: [
              { value: 'basse', label: 'Basse' },
              { value: 'normale', label: 'Normale' },
              { value: 'urgente', label: 'Urgente' },
            ],
          },
          {
            key: 'equipements',
            label: 'Équipements',
            kind: 'chips',
            value: ['balise'],
            options: [
              { value: 'balise', label: 'Balise GPS' },
              { value: 'camera', label: 'Caméra' },
              { value: 'sonde', label: 'Sonde carburant' },
              { value: 'immob', label: 'Anti-démarrage' },
            ],
          },
          {
            key: 'duree',
            label: 'Durée estimée',
            kind: 'slider',
            min: 30,
            max: 240,
            step: 15,
            value: 90,
            unit: ' min',
          },
          { key: 'notes', label: 'Précisions', kind: 'textarea', placeholder: 'Accès au site, contact sur place…' },
          { key: 'sms', label: 'Prévenir le client par SMS', kind: 'toggle', value: true },
        ],
      },
      { title: 'Nouvelle demande d’intervention', icon: 'mi:build' },
    ),
  feedbackForm: () =>
    w(
      {
        type: 'form',
        formId: 'feedback',
        submitLabel: 'Envoyer',
        fields: [
          { key: 'note', label: 'Satisfaction globale', kind: 'rating', value: 4 },
          { key: 'ponctuel', label: 'Le technicien était ponctuel', kind: 'checkbox', value: true },
          { key: 'commentaire', label: 'Commentaire', kind: 'textarea' },
        ],
      },
      { title: 'Votre avis sur l’intervention', icon: 'mi:reviews' },
    ),
  planningCalendar: () => {
    const items: [number, number, string, KitTone][] = [
      [0, 9, 'Installation · Bolloré', 'primary'],
      [0, 14, 'Dépannage · SOTRA', 'warning'],
      [1, 10, 'Audit · Cargill', 'info'],
      [3, 8, 'Retrait · Orange CI', 'neutral'],
      [5, 11, 'Formation chauffeurs', 'purple'],
      [7, 9, 'Installation · Yao', 'primary'],
      [9, 15, 'Recette port', 'success'],
      [-2, 10, 'Dépannage · CIE', 'error'],
      [12, 9, 'Installation · SIFCA', 'primary'],
    ];
    return w(
      {
        type: 'calendar',
        items: items.map(([d, h, t, tone], i) => ({
          id: `cal${i}`,
          title: t,
          start: day(d, h),
          end: day(d, h + 2),
          tone,
        })),
      },
      { title: 'Interventions du mois', subtitle: '9 rendez-vous planifiés', icon: 'mi:calendar-month' },
    );
  },
  tasksKanban: () =>
    w(
      {
        type: 'kanban',
        columns: [
          { key: 'todo', label: 'À faire', tone: 'info' },
          { key: 'doing', label: 'En cours', tone: 'warning' },
          { key: 'done', label: 'Terminé', tone: 'success' },
        ],
        items: [
          {
            id: 'k1',
            ref: 'INT-0412',
            title: 'Installer balise CI-4521-AB',
            status: 'todo',
            tone: 'primary',
            assignee: 'Awa Koné',
            due: day(1),
          },
          {
            id: 'k2',
            ref: 'INT-0415',
            title: 'Remplacer sonde carburant',
            status: 'todo',
            tone: 'warning',
            assignee: 'Yao Kouamé',
            due: day(-1),
          },
          {
            id: 'k3',
            ref: 'INT-0409',
            title: 'Dépannage caméra Actros',
            status: 'doing',
            tone: 'info',
            assignee: 'Awa Koné',
            progress: 60,
          },
          {
            id: 'k4',
            ref: 'INT-0402',
            title: 'Retrait boîtier Kangoo',
            status: 'doing',
            tone: 'neutral',
            assignee: 'Ibrahim Traoré',
            progress: 30,
          },
          {
            id: 'k5',
            ref: 'INT-0398',
            title: 'Audit flotte SOTRA',
            status: 'done',
            tone: 'success',
            assignee: 'Yao Kouamé',
            done: true,
          },
        ],
      },
      { title: 'Suivi des tâches', subtitle: 'Équipe technique', icon: 'mi:view-kanban' },
    ),
  rolloutGantt: () =>
    w(
      {
        type: 'gantt',
        groups: [
          { key: 'a', label: 'Équipe Nord' },
          { key: 'b', label: 'Équipe Sud', tone: 'purple' },
          { key: 'c', label: 'Équipe Port', tone: 'warning' },
        ],
        items: [
          { id: 'g1', title: 'Repérage sites', group: 'a', start: day(-3), end: day(1), tone: 'info', progress: 80 },
          {
            id: 'g2',
            title: 'Installation lot 1',
            group: 'a',
            start: day(2),
            end: day(8),
            tone: 'primary',
            progress: 0,
          },
          {
            id: 'g3',
            title: 'Formation chauffeurs',
            group: 'b',
            start: day(0),
            end: day(4),
            tone: 'purple',
            progress: 40,
          },
          { id: 'g4', title: 'Installation lot 2', group: 'b', start: day(5), end: day(12), tone: 'primary' },
          { id: 'g5', title: 'Recette port', group: 'c', start: day(-1), end: day(6), tone: 'warning', progress: 25 },
        ],
      },
      { title: 'Déploiement des balises', subtitle: 'Feuille de route · 3 équipes', icon: 'mi:timeline' },
    ),
  incidentTimeline: () =>
    w(
      {
        type: 'timeline',
        items: [
          {
            time: '08:12',
            title: 'Départ du dépôt',
            text: 'Koumassi, atelier',
            tone: 'neutral',
            icon: 'mi:play-arrow',
          },
          { time: '09:40', title: 'Entrée zone aéroport', tone: 'info', icon: 'mi:login' },
          {
            time: '10:05',
            title: 'Sortie de zone autorisée',
            text: 'Geofence « Port-Bouët » franchie',
            tone: 'error',
            icon: 'mi:warning',
          },
          { time: '10:07', title: 'Alerte envoyée au superviseur', tone: 'warning', icon: 'mi:notifications-active' },
        ],
      },
      { title: 'Historique de l’alerte', subtitle: 'CI-9902-NP · Isuzu D-Max', icon: 'mi:history' },
    ),
  technicians: () =>
    w(
      {
        type: 'records',
        items: [
          {
            title: 'Awa Koné',
            subtitle: 'Installation & dépannage',
            meta: 'à 4 km',
            tone: 'success',
            badge: 'Disponible',
            badgeTone: 'success',
            tags: ['Balise', 'Caméra'],
          },
          {
            title: 'Yao Kouamé',
            subtitle: 'Sondes carburant',
            meta: 'à 9 km',
            tone: 'primary',
            badge: '1 créneau',
            badgeTone: 'warning',
            tags: ['Sonde'],
          },
          {
            title: 'Ibrahim Traoré',
            subtitle: 'Poids lourds',
            meta: 'à 15 km',
            tone: 'purple',
            badge: 'Indisponible',
            tags: ['Actros', 'Anti-démarrage'],
          },
        ],
      },
      { title: 'Techniciens disponibles', subtitle: 'Demain matin · Abidjan', icon: 'mi:engineering' },
    ),
  whatNext: () =>
    w({
      type: 'choices',
      question: 'Que voulez-vous voir ensuite ?',
      options: [
        { value: 'carte', label: 'La flotte sur une carte', icon: 'mi:map' },
        { value: 'graphique', label: 'L’évolution du CA', icon: 'mi:show-chart' },
        { value: 'tableau', label: 'Les clients à relancer', icon: 'mi:table-rows' },
        { value: 'formulaire', label: 'Créer une intervention', icon: 'mi:edit-note' },
        { value: 'calendrier', label: 'Le planning du mois', icon: 'mi:calendar-month' },
        { value: 'outils', label: 'Autres outils…', icon: 'mi:apps' },
      ],
    }),
  callout: (tone: KitTone, icon: string, title: string, t: string) =>
    w({ type: 'callout', tone, icon, title, text: t }),
};

// ─── Boîte à outils avancée (X) ──────────────────────────────────────

const clientIdentity = () =>
  w(
    {
      type: 'keyvalue',
      items: [
        { label: 'Raison sociale', value: 'Bolloré Logistics CI', icon: 'mi:business' },
        { label: 'Compte', value: 'CLI-002', mono: true, copy: true },
        { label: 'RCCM', value: 'CI-ABJ-2003-B-1234', mono: true, copy: true },
        { label: 'Contact', value: 'Mme Aya Diallo', icon: 'mi:person' },
        { label: 'Téléphone', value: '+225 07 07 45 12 98', icon: 'mi:call', copy: true },
        { label: 'Statut', value: 'Retard de paiement', icon: 'mi:warning', tone: 'error' },
      ],
    },
    { title: 'Identité', icon: 'mi:badge' },
  );

const activityValues = () => {
  let s = 11;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 12 }, (_, c) =>
      Math.round((r > 4 ? 0.25 : 1) * (c > 1 && c < 10 ? 1 : 0.4) * (20 + rnd() * 80)),
    ),
  );
};

const BEFORE = `  check(position: Position, zone: Zone): void {
    const inside = zone.contains(position);
    if (!inside) {
      this.alertes.emit({ code: 'GEOFENCE_EXIT', vehicule: position.vehicule });
    }
  }`;
const AFTER = `  check(position: Position, zone: Zone): void {
    const inside = zone.contains(position);
    const wasInside = this.state.get(position.vehicule) ?? true;
    // On n'alerte qu'au franchissement, pas à chaque position hors zone.
    if (wasInside && !inside) {
      this.alertes.emit({ code: 'GEOFENCE_EXIT', vehicule: position.vehicule });
    }
    this.state.set(position.vehicule, inside);
  }`;

export const X = {
  documentsTree: () =>
    w(
      {
        type: 'tree',
        submitLabel: 'Générer le rapport avec ces pièces',
        nodes: [
          {
            id: 'contrats',
            label: 'Contrats',
            icon: 'mi:folder',
            children: [
              {
                id: 'c1',
                label: 'CTR-2026-0042.pdf',
                icon: 'mi:picture-as-pdf',
                meta: '1,2 Mo',
                badge: 'Signé',
                badgeTone: 'success',
              },
              {
                id: 'c2',
                label: 'Avenant n°1.pdf',
                icon: 'mi:picture-as-pdf',
                meta: '340 Ko',
                badge: 'En attente',
                badgeTone: 'warning',
              },
            ],
          },
          {
            id: 'factures',
            label: 'Factures',
            icon: 'mi:folder',
            children: [
              {
                id: 'f1',
                label: 'FAC-2026-0911.pdf',
                icon: 'mi:receipt-long',
                meta: '4 850 000 F',
                badge: 'Impayée',
                badgeTone: 'error',
              },
              { id: 'f2', label: 'FAC-2026-0874.pdf', icon: 'mi:receipt-long', meta: '2 100 000 F' },
              { id: 'f3', label: 'FAC-2026-0812.pdf', icon: 'mi:receipt-long', meta: '1 980 000 F' },
            ],
          },
          {
            id: 'interventions',
            label: 'Interventions',
            icon: 'mi:folder',
            children: [
              { id: 'i1', label: 'Rapport INT-0409.pdf', icon: 'mi:build', meta: '12/10' },
              {
                id: 'i2',
                label: 'Photos installation',
                icon: 'mi:folder',
                children: [
                  { id: 'p1', label: 'cabine.jpg', icon: 'mi:image', meta: '2,4 Mo' },
                  { id: 'p2', label: 'boitier.jpg', icon: 'mi:image', meta: '1,9 Mo' },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Documents du dossier client',
        subtitle: 'Bolloré Logistics CI · cochez ce qu’il faut inclure',
        icon: 'mi:account-tree',
      },
    ),
  apiJson: () =>
    w(
      {
        type: 'json',
        data: {
          immatriculation: 'CI-9902-NP',
          modele: 'Isuzu D-Max',
          enLigne: true,
          vitesse: 0,
          position: { lat: 5.255, lng: -3.93, precision: 6 },
          alertes: [{ code: 'GEOFENCE_EXIT', niveau: 'critique', heure: '10:05' }],
          capteurs: { carburant: 62, batterie: 12.6, temperatureMoteur: 88 },
        },
      },
      {
        title: 'Réponse de l’API véhicule',
        subtitle: 'GET /vehicules/CI-9902-NP · 200 OK · 84 ms',
        icon: 'mi:data-object',
      },
    ),
  offersCarousel: () =>
    w(
      {
        type: 'carousel',
        slides: [
          {
            title: 'Suivi essentiel',
            tag: 'Le plus vendu',
            icon: 'mi:gps-fixed',
            tone: 'primary',
            text: 'Position en temps réel, historique 90 jours et alertes de zone pour les flottes légères.',
            stats: [
              ['Prix', '9 900 F/mois'],
              ['Clients', '312'],
            ],
          },
          {
            title: 'Poids lourds',
            tag: 'Transport',
            image: 'truck',
            tone: 'info',
            text: 'Sondes carburant, temps de conduite et rapports chronotachygraphe.',
            stats: [
              ['Prix', '18 500 F/mois'],
              ['Économie', '−14 % carburant'],
            ],
          },
          {
            title: 'Vidéo embarquée',
            icon: 'mi:videocam',
            tone: 'purple',
            text: 'Caméra double face, détection de fatigue et extraits vidéo sur incident.',
            stats: [['Prix', '24 000 F/mois']],
          },
          {
            title: 'Anti-démarrage',
            icon: 'mi:lock',
            tone: 'error',
            text: 'Coupure moteur à distance et déverrouillage par badge chauffeur.',
            stats: [['Option', '+4 500 F/mois']],
          },
        ],
      },
      { title: 'Nos offres de suivi', subtitle: '4 formules · faites défiler', icon: 'mi:view-carousel' },
    ),
  clientIdentity,
  clientModal: () =>
    w(
      {
        type: 'modal',
        summary:
          'Bolloré Logistics CI · 48 véhicules suivis · encours de 4 850 000 FCFA, dont une facture en retard de 47 jours.',
        button: 'Ouvrir la fiche',
        dialogTitle: 'Bolloré Logistics CI',
        dialogSubtitle: 'Client depuis mars 2021 · Abidjan, Plateau',
        blocks: [
          clientIdentity(),
          w({
            type: 'stats',
            items: [
              {
                label: 'Véhicules',
                value: '48',
                icon: 'mi:local-shipping',
                tone: 'primary',
                spark: [38, 40, 41, 44, 45, 48],
              },
              {
                label: 'Encours',
                value: '4,85 M',
                icon: 'mi:account-balance-wallet',
                tone: 'error',
                delta: '+1,2 M',
                up: true,
              },
              { label: 'Satisfaction', value: '4,6 / 5', icon: 'mi:sentiment-satisfied', tone: 'success' },
            ],
          }),
          w(
            {
              type: 'timeline',
              items: [
                {
                  time: '12/10',
                  title: 'Relance facture FAC-0911',
                  text: 'Par e-mail, sans réponse',
                  tone: 'warning',
                  icon: 'mi:mail',
                },
                { time: '08/10', title: 'Intervention INT-0409 clôturée', tone: 'success', icon: 'mi:build' },
                {
                  time: '02/10',
                  title: 'Appel du responsable flotte',
                  text: 'Demande de 6 balises supplémentaires',
                  tone: 'info',
                  icon: 'mi:call',
                },
              ],
            },
            { title: 'Derniers échanges' },
          ),
        ],
      },
      { title: 'Fiche client complète', icon: 'mi:business' },
    ),
  clientTabs: () =>
    w(
      {
        type: 'tabs',
        tabs: [
          [
            'Aperçu',
            'mi:dashboard',
            null,
            [
              w({
                type: 'stats',
                items: [
                  {
                    label: 'CA annuel',
                    value: '58,2 M',
                    tone: 'primary',
                    icon: 'mi:payments',
                    spark: [3.9, 4.4, 4.1, 4.8, 5.2, 5.6, 5.1, 5.9],
                  },
                  {
                    label: 'Véhicules',
                    value: '48',
                    tone: 'success',
                    icon: 'mi:local-shipping',
                    spark: [38, 40, 41, 44, 45, 48],
                  },
                  {
                    label: 'Tickets ouverts',
                    value: '3',
                    tone: 'warning',
                    icon: 'mi:support-agent',
                    spark: [6, 5, 7, 4, 3, 3],
                  },
                ],
              }),
              w({
                type: 'paragraph',
                text: 'Client stratégique : il représente 12 % du CA de la région d’Abidjan. Le retard de paiement est récent et lié à un changement d’interlocuteur comptable.',
              }),
            ],
          ],
          [
            'Factures',
            'mi:receipt-long',
            '3',
            [
              w({
                type: 'table',
                columns: [
                  { key: 'num', label: 'N°', kind: 'mono' },
                  { key: 'date', label: 'Date' },
                  { key: 'montant', label: 'Montant', kind: 'number', unit: ' F' },
                  {
                    key: 'statut',
                    label: 'Statut',
                    kind: 'badge',
                    tones: { Payée: 'success', Impayée: 'error', Partielle: 'warning' },
                  },
                ],
                rows: [
                  { num: 'FAC-0911', date: '28/08', montant: 4850000, statut: 'Impayée' },
                  { num: 'FAC-0874', date: '28/07', montant: 2100000, statut: 'Partielle' },
                  { num: 'FAC-0812', date: '28/06', montant: 1980000, statut: 'Payée' },
                ],
              }),
            ],
          ],
          [
            'Contacts',
            'mi:contacts',
            null,
            [
              w({
                type: 'records',
                items: [
                  { title: 'Aya Diallo', subtitle: 'Responsable flotte', meta: 'principal', tags: ['Décisionnaire'] },
                  {
                    title: 'Marc Kouadio',
                    subtitle: 'Comptabilité fournisseurs',
                    meta: 'nouveau',
                    tone: 'warning',
                    badge: 'À contacter',
                    badgeTone: 'warning',
                  },
                ],
              }),
            ],
          ],
          [
            'Historique',
            'mi:history',
            null,
            [
              w({
                type: 'timeline',
                items: [
                  { time: '2021', title: 'Signature du premier contrat', tone: 'success', icon: 'mi:handshake' },
                  { time: '2024', title: 'Extension à 40 véhicules', tone: 'info', icon: 'mi:trending-up' },
                  { time: '2026', title: 'Passage à l’offre Poids lourds', tone: 'primary', icon: 'mi:local-shipping' },
                ],
              }),
            ],
          ],
        ],
      },
      {
        title: 'Dossier Bolloré Logistics CI',
        subtitle: 'Toutes les informations, par onglet',
        icon: 'mi:folder-shared',
      },
    ),
  faqAccordion: () =>
    w(
      {
        type: 'accordion',
        items: [
          [
            'Combien de temps dure une installation ?',
            'mi:schedule',
            true,
            [
              w({
                type: 'paragraph',
                text: 'Comptez 45 à 90 minutes par véhicule selon les options. Le véhicule reste immobilisé pendant toute la durée.',
              }),
              w({
                type: 'progress',
                items: [
                  { label: 'Balise seule', value: 45, target: 90, unit: ' min', tone: 'success' },
                  { label: 'Balise + caméra', value: 90, target: 90, unit: ' min', tone: 'warning' },
                ],
              }),
            ],
          ],
          [
            'Que se passe-t-il en cas de perte de réseau ?',
            'mi:signal-cellular-off',
            false,
            [
              w({
                type: 'paragraph',
                text: 'La balise stocke jusqu’à 30 jours de positions et les renvoie dès que le réseau revient.',
              }),
            ],
          ],
          [
            'Quels documents fournir ?',
            'mi:description',
            false,
            [
              w({
                type: 'checklist',
                items: [
                  ['Carte grise du véhicule', true, null],
                  ['Pièce d’identité du gérant', true, null],
                  ['Bon de commande signé', false, null],
                ],
              }),
            ],
          ],
        ],
      },
      { title: 'Questions fréquentes', subtitle: 'Balises GPS et abonnements', icon: 'mi:quiz' },
    ),
  onboardingSteps: () =>
    w(
      {
        type: 'steps',
        steps: [
          { label: 'Contrat signé', status: 'done', text: '02/10' },
          { label: 'Pièces reçues', status: 'done', text: '05/10' },
          { label: 'Installation', status: 'current', text: 'en cours' },
          { label: 'Formation', status: 'todo' },
          { label: 'Recette', status: 'todo' },
        ],
      },
      { title: 'Mise en service d’un nouveau client', icon: 'mi:linear-scale' },
    ),
  installChecklist: () =>
    w(
      {
        type: 'checklist',
        items: [
          ['Véhicule disponible sur site', true, 'confirmé'],
          ['Batterie > 12,2 V', true, null],
          ['Emplacement boîtier validé avec le client', false, null],
          ['Carte SIM activée', false, 'ICCID requis'],
          ['Photos avant / après', false, null],
        ],
      },
      { title: 'Contrôles avant installation', subtitle: 'Cochez au fur et à mesure', icon: 'mi:checklist' },
    ),
  objectives: () =>
    w(
      {
        type: 'progress',
        items: [
          { label: 'Nouvelles installations', value: 142, target: 200 },
          { label: 'Chiffre d’affaires', value: 291, target: 320, unit: ' M', tone: 'success' },
          { label: 'Taux de résolution J+1', value: 87, target: 95, unit: ' %', tone: 'warning' },
          { label: 'Recouvrement', value: 61, target: 90, unit: ' %', tone: 'error' },
        ],
      },
      { title: 'Objectifs du trimestre', subtitle: 'T4 2026 · au 14 octobre', icon: 'mi:track-changes' },
    ),
  activityHeatmap: () =>
    w(
      {
        type: 'heatmap',
        rows: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        cols: Array.from({ length: 12 }, (_, i) => `${7 + i}h`),
        values: activityValues(),
        unit: ' trajets',
      },
      {
        title: 'Activité des véhicules',
        subtitle: 'Trajets démarrés par heure · 4 dernières semaines',
        icon: 'mi:grid-on',
      },
    ),
  usageStats: () =>
    w({
      type: 'stats',
      items: [
        {
          label: 'Trajets / jour',
          value: '386',
          delta: '+6 %',
          up: true,
          tone: 'primary',
          icon: 'mi:route',
          spark: [320, 335, 341, 352, 360, 371, 386],
        },
        { label: 'Heure de pointe', value: '8 h – 9 h', tone: 'info', icon: 'mi:schedule', hint: 'lun. – ven.' },
        {
          label: 'Moteur à l’arrêt',
          value: '11 %',
          delta: '−3 pt',
          up: false,
          tone: 'success',
          icon: 'mi:local-gas-station',
          spark: [16, 15, 14, 14, 13, 12, 11],
        },
      ],
    }),
  codeDiff: () =>
    w(
      { type: 'diff', file: 'src/app/alertes/geofence.service.ts', before: BEFORE, after: AFTER },
      { title: 'Correctif proposé', subtitle: 'Alerte de zone déclenchée deux fois', icon: 'mi:difference' },
    ),
  approvalTests: () =>
    w({
      type: 'approval',
      risk: 'warning',
      title: 'Autoriser l’exécution de cette commande ?',
      text: 'Je dois lancer les tests du service d’alertes pour vérifier le correctif. Aucun fichier ne sera modifié.',
      command: 'npm run test -- --include=src/app/alertes/**',
    }),
  webSources: () =>
    w(
      {
        type: 'sources',
        items: [
          {
            title: 'Cadre réglementaire des données de géolocalisation',
            site: 'artci.ci',
            date: 'sept. 2026',
            snippet:
              'Les données de position des véhicules professionnels sont des données personnelles dès lors qu’elles permettent d’identifier un conducteur…',
          },
          {
            title: 'Obligation de chronotachygraphe pour les poids lourds',
            site: 'transports.gouv.ci',
            date: 'août 2026',
            snippet: 'À compter de janvier 2027, tout véhicule de plus de 3,5 t affecté au transport de marchandises…',
          },
          {
            title: 'La télématique s’impose dans la logistique ouest-africaine',
            site: 'jeuneafrique.com',
            date: 'juil. 2026',
          },
          { title: 'ISO 15638 — Cadre des applications télématiques coopératives', site: 'iso.org' },
        ],
      },
      { title: 'Sources consultées', subtitle: '4 résultats pertinents', icon: 'mi:travel-explore' },
    ),
  topicTags: () =>
    w(
      {
        type: 'tags',
        items: [
          ['Données personnelles', 12, 'error'],
          ['Chronotachygraphe', 8, 'warning'],
          ['Poids lourds', 7, 'info'],
          ['Consentement', 5, 'purple'],
          ['Conservation 12 mois', 3, 'primary'],
          ['ARTCI', 3, 'neutral'],
        ],
      },
      { title: 'Thèmes détectés', icon: 'mi:sell' },
    ),
  reportFiles: () =>
    w(
      {
        type: 'files',
        items: [
          { name: 'Rapport-Bollore-T4.pdf', ext: 'pdf', size: '2,8 Mo', date: 'à l’instant', by: 'Harnais' },
          { name: 'Encours-clients.xls', ext: 'xls', size: '84 Ko', date: 'à l’instant', by: 'Harnais' },
          { name: 'Trajets-octobre.csv', ext: 'csv', size: '1,1 Mo', date: 'à l’instant', by: 'Harnais' },
        ],
      },
      { title: 'Fichiers générés', subtitle: 'Prêts à être envoyés', icon: 'mi:folder' },
    ),
  offerCards: () =>
    w(
      {
        type: 'cards',
        items: [
          {
            title: 'Balise GT-06',
            icon: 'mi:gps-fixed',
            text: 'GPS + GSM, batterie de secours 8 h.',
            price: '45 000 F',
            meta: 'en stock',
            tags: ['4G', 'IP67'],
            cta: 'Ajouter',
          },
          {
            title: 'Sonde carburant',
            icon: 'mi:local-gas-station',
            tone: 'warning',
            text: 'Mesure capacitive ±1 %.',
            price: '120 000 F',
            meta: '5 j',
            tags: ['Poids lourds'],
            cta: 'Ajouter',
          },
          {
            title: 'Caméra DC-2',
            icon: 'mi:videocam',
            tone: 'purple',
            text: 'Double face, détection de fatigue.',
            price: '185 000 F',
            meta: 'en stock',
            cta: 'Ajouter',
          },
          {
            title: 'Lecteur de badge',
            icon: 'mi:badge',
            tone: 'info',
            text: 'Identification du chauffeur.',
            price: '32 000 F',
            meta: '10 j',
            cta: 'Ajouter',
          },
        ],
      },
      { title: 'Équipements recommandés', subtitle: 'Pour une flotte mixte de 48 véhicules', icon: 'mi:grid-view' },
    ),
  plansCompare: () =>
    w(
      {
        type: 'compare',
        plans: [
          ['Essentiel', '9 900 F', null, false],
          ['Pro', '14 500 F', 'le meilleur rapport', true],
          ['Poids lourds', '18 500 F', null, false],
        ],
        features: [
          ['Position temps réel', [true, true, true]],
          ['Historique', ['90 j', '12 mois', '24 mois']],
          ['Alertes de zone', [true, true, true]],
          ['Rapports automatiques', [false, true, true]],
          ['Sonde carburant', [false, 'option', true]],
          ['Chronotachygraphe', [false, false, true]],
          ['Support', ['e-mail', '7j/7', 'dédié']],
        ],
      },
      { title: 'Comparatif des formules', subtitle: 'Prix par véhicule et par mois', icon: 'mi:compare' },
    ),
  uploadRequest: () =>
    w(
      { type: 'upload', hint: 'CSV, Excel, PDF ou JSON · lu localement, rien n’est envoyé sur un serveur.' },
      {
        title: 'Fichier à analyser',
        subtitle: 'Export de trajets, factures ou liste de véhicules',
        icon: 'mi:upload-file',
      },
    ),
  weekAgenda: () => {
    const items: [number, number, number, string, KitTone][] = [
      [0, 8, 10, 'Installation · Bolloré', 'primary'],
      [0, 14, 16, 'Dépannage · SOTRA', 'warning'],
      [1, 9, 11, 'Audit · Cargill', 'info'],
      [2, 10, 12, 'Retrait · Orange CI', 'neutral'],
      [3, 13, 15, 'Formation chauffeurs', 'purple'],
    ];
    return w(
      {
        type: 'agenda',
        items: items.map(([d, h1, h2, t, tone], i) => ({
          id: `ag${i}`,
          title: t,
          start: day(d, h1),
          end: day(d, h2),
          tone,
        })),
      },
      { title: 'Agenda de la semaine', subtitle: 'Awa Koné · technicienne', icon: 'mi:today' },
    );
  },
  moreTools: () =>
    w({
      type: 'choices',
      question: 'Je peux aussi :',
      options: [
        { value: 'arborescence', label: 'Explorer les documents', icon: 'mi:account-tree' },
        { value: 'fiche client', label: 'Ouvrir une fiche client', icon: 'mi:badge' },
        { value: 'offres', label: 'Présenter les offres', icon: 'mi:view-carousel' },
        { value: 'comparer', label: 'Comparer les formules', icon: 'mi:compare' },
        { value: 'corrige le bug', label: 'Corriger un bug', icon: 'mi:difference' },
        { value: 'importer un fichier', label: 'Analyser un fichier', icon: 'mi:upload-file' },
        { value: 'veille réglementaire', label: 'Faire une veille', icon: 'mi:travel-explore' },
        { value: 'objectifs', label: 'Suivre les objectifs', icon: 'mi:track-changes' },
      ],
    }),
};

// ─── Intentions et scénarios ─────────────────────────────────────────

export type HzIntent =
  | 'map'
  | 'chart'
  | 'table'
  | 'form'
  | 'calendar'
  | 'agenda'
  | 'kanban'
  | 'gantt'
  | 'overview'
  | 'code'
  | 'upload'
  | 'detail'
  | 'tree'
  | 'json'
  | 'carousel'
  | 'compare'
  | 'process'
  | 'sources'
  | 'activity'
  | 'objectives'
  | 'faq'
  | 'tools'
  | 'clarify';

const RULES: [HzIntent, RegExp][] = [
  ['overview', /tableau de bord|dashboard|synthèse|vue d.ensemble|démo|rapport/i],
  ['tools', /outils|que sais-tu faire|que peux-tu|capacités|autre chose/i],
  ['code', /code|diff|correctif|patch|bug|corrige|commit|test/i],
  ['upload', /importer|import |upload|téléverser|fichier à analyser|analyser un fichier|joindre/i],
  ['detail', /fiche|détail|profil|modal|dossier client|onglets/i],
  ['json', /json|\bapi\b|payload|données brutes|réponse brute/i],
  ['tree', /arborescence|dossier|répertoire|structure|organigramme|permissions|explorer|documents/i],
  ['compare', /compar|versus| vs |choisir entre|meilleure formule/i],
  ['carousel', /carrousel|carousel|galerie|offres|catalogue|produits|équipements|nouveautés/i],
  ['process', /étapes|processus|procédure|onboarding|checklist|contrôles|mise en service|marche à suivre/i],
  ['sources', /source|web|actualité|veille|article|presse|réglementa/i],
  ['activity', /activité|heatmap|chaleur|connexions|usage|fréquentation|heures/i],
  ['objectives', /objectif|kpi|progression|performance|cible/i],
  ['faq', /faq|questions fréquentes|aide|explique/i],
  ['agenda', /agenda|semaine|journée|aujourd.hui/i],
  ['form', /formulaire|demande|réserv|inscri|créer|ajout|nouveau|nouvelle|signal|ticket|devis/i],
  ['map', /carte|map|localis|position|flotte|véhicule|trajet|zone|gps/i],
  ['chart', /graph|chart|courbe|évolution|tendance|ventes|chiffre|ca |revenu|statist|analyse/i],
  ['table', /tableau|liste|clients|export|lignes|registre|inventaire/i],
  ['calendar', /calendrier|rendez|rdv|planning du mois|disponib/i],
  ['kanban', /kanban|tâches|taches|backlog|colonnes|avancement/i],
  ['gantt', /gantt|projet|déploiement|jalon|feuille de route|roadmap/i],
];

export const detectIntent = (prompt: string): HzIntent => RULES.find(([, re]) => re.test(prompt))?.[0] ?? 'clarify';

/** Réponse simulée : outil(s) « utilisés », introduction, blocs, conclusion. */
export interface HzScenario {
  tool: string;
  intro: string;
  blocks: HzBlock[];
  outro?: string;
  tools?: Extract<HzBlock, { block: 'tool' }>[];
}

export function scenarioFor(intent: HzIntent): HzScenario {
  switch (intent) {
    case 'map':
      return {
        tool: 'positions GPS · 8 véhicules',
        intro: 'Voici la position actuelle de la flotte. Un véhicule est en alerte (sortie de zone à Port-Bouët) :',
        blocks: [
          W.fleetMap(),
          W.incidentTimeline(),
          W.callout(
            'warning',
            'mi:warning',
            '1 véhicule hors zone',
            'CI-9902-NP a quitté la geofence autorisée à 10:05. Le superviseur a été prévenu.',
          ),
        ],
        outro: 'Je peux planifier une intervention sur ce véhicule si besoin.',
      };
    case 'chart':
      return {
        tool: 'ventes 2025 – 2026',
        intro: 'Le chiffre d’affaires progresse de `+30 %` sur un an. Les trois vues ci-dessous résument la tendance :',
        blocks: [
          W.salesChart(),
          list([
            'Croissance régulière depuis mai, portée par les abonnements.',
            'Abidjan concentre près des deux tiers du CA.',
            'La maintenance gagne 3 points de part sur le trimestre.',
          ]),
          W.mixChart(),
          W.regionChart(),
        ],
      };
    case 'table':
      return {
        tool: 'encours clients',
        intro: 'J’ai trouvé 8 clients avec un encours. Les deux premiers dépassent 30 jours de retard :',
        blocks: [W.clientsTable()],
        outro: 'Vous pouvez trier les colonnes et filtrer la liste directement dans le tableau.',
      };
    case 'form':
      return {
        tool: 'référentiel clients & véhicules',
        intro:
          'Avec plaisir. Complétez ce formulaire et je planifie l’intervention avec le technicien le plus proche :',
        blocks: [W.interventionForm()],
      };
    case 'calendar':
      return {
        tool: 'agenda des techniciens',
        intro: 'Voici le planning du mois. Les journées les plus chargées sont en début de semaine :',
        blocks: [W.planningCalendar()],
      };
    case 'kanban':
      return {
        tool: 'tâches de l’équipe',
        intro: 'Voici l’avancement des tâches. Une tâche est en retard (sonde carburant) :',
        blocks: [W.tasksKanban()],
      };
    case 'gantt':
      return {
        tool: 'feuille de route',
        intro: 'Voici la feuille de route du déploiement sur les deux prochaines semaines :',
        blocks: [W.rolloutGantt()],
      };
    case 'overview':
      return {
        tool: 'flotte, ventes et encours',
        intro: 'Voici une synthèse complète de l’activité :',
        blocks: [W.fleetStats(), W.salesChart(), W.fleetMap(), W.clientsTable(), W.whatNext()],
      };
    case 'tools':
      return {
        tool: 'capacités disponibles',
        intro: 'Je peux afficher l’information sous la forme la plus utile. Voici ce que je sais faire :',
        blocks: [X.moreTools()],
      };
    case 'code':
      return {
        tool: 'geofence.service.ts',
        tools: [
          tool('search', 'Recherche', 'GEOFENCE_EXIT', '3 occurrences'),
          tool('read', 'Lecture', 'geofence.service.ts', '84 lignes'),
          tool('edit', 'Modification', 'geofence.service.ts', '+5 −3'),
        ],
        intro:
          'J’ai trouvé la cause : l’alerte est émise à chaque position hors zone, au lieu d’une seule fois au franchissement. Voici le correctif :',
        blocks: [X.codeDiff(), X.approvalTests()],
      };
    case 'upload':
      return {
        tool: 'formats pris en charge',
        intro: 'Envoyez-moi le fichier : je l’analyse et je vous en fais une synthèse.',
        blocks: [X.uploadRequest()],
      };
    case 'detail':
      return {
        tool: 'dossier CLI-002',
        intro: 'Voici le dossier du client. L’essentiel est dans les onglets, et la fiche complète s’ouvre en modale :',
        blocks: [X.clientTabs(), X.clientModal()],
      };
    case 'json':
      return {
        tool: 'API véhicules',
        tools: [tool('web', 'Requête', 'GET /vehicules/CI-9902-NP', '200 OK · 84 ms')],
        intro: 'Voici la réponse brute de l’API, dépliable champ par champ :',
        blocks: [X.apiJson()],
      };
    case 'tree':
      return {
        tool: 'GED · dossier client',
        intro: 'Voici l’arborescence du dossier. Sélectionnez les pièces à inclure dans le rapport :',
        blocks: [X.documentsTree()],
      };
    case 'compare':
      return {
        tool: 'grille tarifaire 2026',
        intro: 'Pour une flotte comme la vôtre, la formule Pro offre le meilleur équilibre :',
        blocks: [X.plansCompare(), X.offerCards()],
      };
    case 'carousel':
      return {
        tool: 'catalogue des offres',
        intro: 'Voici nos offres, à faire défiler :',
        blocks: [X.offersCarousel(), X.offerCards()],
      };
    case 'process':
      return {
        tool: 'procédure de mise en service',
        intro: 'Voici où en est la mise en service, et les contrôles restants :',
        blocks: [X.onboardingSteps(), X.installChecklist()],
      };
    case 'sources':
      return {
        tool: 'veille réglementaire',
        tools: [tool('web', 'Recherche web', 'réglementation géolocalisation Côte d’Ivoire', '18 résultats')],
        intro:
          'Deux évolutions vous concernent directement : la protection des données de position et le chronotachygraphe obligatoire en 2027.',
        blocks: [
          X.webSources(),
          X.topicTags(),
          W.callout(
            'info',
            'mi:gavel',
            'À anticiper',
            'Les poids lourds de plus de 3,5 t devront être équipés d’un chronotachygraphe avant janvier 2027.',
          ),
        ],
      };
    case 'activity':
      return {
        tool: 'trajets des 4 dernières semaines',
        intro: 'L’activité se concentre en semaine entre 8 h et 17 h, avec un pic le matin :',
        blocks: [X.usageStats(), X.activityHeatmap()],
      };
    case 'objectives':
      return {
        tool: 'objectifs T4',
        intro: 'Le CA est en bonne voie ; le recouvrement est l’objectif le plus à risque :',
        blocks: [X.objectives()],
      };
    case 'faq':
      return {
        tool: 'base de connaissances',
        intro: 'Voici les réponses aux questions les plus fréquentes :',
        blocks: [X.faqAccordion()],
      };
    case 'agenda':
      return {
        tool: 'agenda technicien',
        intro: 'Voici l’agenda de la semaine. Mercredi après-midi est encore libre :',
        blocks: [X.weekAgenda()],
      };
    case 'clarify':
      return {
        tool: 'contexte',
        intro: 'Je peux vous répondre sous plusieurs formes. Choisissez ce qui vous serait le plus utile :',
        blocks: [W.whatNext()],
      };
  }
}

/** Suite donnée à un formulaire soumis. */
export function formFollowUp(formId: string, values: HzValues): HzScenario {
  if (formId === 'intervention') {
    const d = values.date;
    const date = d instanceof Date ? weekday(d) : 'à la date choisie';
    return {
      tool: 'disponibilités techniciens',
      intro: `C’est noté : intervention planifiée ${date}. Voici les techniciens disponibles, Awa Koné est la plus proche :`,
      blocks: [
        W.technicians(),
        W.callout(
          'success',
          'mi:event-available',
          'Intervention INT-0418 créée',
          values.sms === true
            ? 'Le client recevra un SMS de confirmation la veille.'
            : 'Aucun SMS ne sera envoyé au client.',
        ),
        W.feedbackForm(),
      ],
      outro: 'Vous pourrez recueillir l’avis du client après l’intervention avec le formulaire ci-dessus.',
    };
  }
  const note = typeof values.note === 'number' ? Math.round(values.note) : '—';
  return {
    tool: 'enregistrement',
    intro: 'Merci, votre retour a bien été enregistré.',
    blocks: [W.callout('success', 'mi:check-circle', 'Avis enregistré', `Note : ${note} / 5.`)],
  };
}

/** Suite donnée à une réponse interactive (choix, autorisation, fichier, sélection dans un arbre). */
export function answerFollowUp(type: string, option: HzOption): HzScenario {
  if (type === 'approval')
    return option.value === 'approve'
      ? {
          tool: 'tests',
          tools: [tool('bash', 'Terminal', 'npm run test -- --include=src/app/alertes/**', '14 tests réussis · 2,1 s')],
          intro: 'Les tests passent. Le correctif est prêt :',
          blocks: [
            w({
              type: 'steps',
              steps: [
                { label: 'Cause identifiée', status: 'done' },
                { label: 'Correctif écrit', status: 'done' },
                { label: 'Tests', status: 'done', text: '14 / 14' },
                { label: 'Revue', status: 'current' },
              ],
            }),
            W.callout(
              'success',
              'mi:check-circle',
              'Prêt à être relu',
              'Les alertes de zone ne sont plus envoyées qu’une seule fois par franchissement.',
            ),
          ],
        }
      : {
          tool: 'alternatives',
          intro:
            'D’accord, je ne lance rien. Le correctif reste en attente : vous pouvez exécuter les tests vous-même.',
          blocks: [code('npm run test -- --include=src/app/alertes/**', 'bash')],
        };
  if (type === 'upload')
    return {
      tool: 'lecture du fichier',
      tools: [tool('read', 'Lecture', option.label, '1 240 lignes · 9 colonnes')],
      intro: 'J’ai analysé le fichier. Voici ce qu’il contient :',
      blocks: [
        w(
          {
            type: 'keyvalue',
            items: [
              { label: 'Nom', value: option.label, icon: 'mi:description' },
              { label: 'Lignes', value: '1 240' },
              { label: 'Colonnes', value: '9' },
              { label: 'Période', value: '01/09 → 30/09' },
              { label: 'Doublons', value: '3', tone: 'warning' },
              { label: 'Valeurs manquantes', value: '0,4 %' },
            ],
          },
          { title: 'Fichier' },
        ),
        w(
          {
            type: 'tags',
            items: [
              ['immatriculation', null, null],
              ['date', null, null],
              ['départ', null, null],
              ['arrivée', null, null],
              ['distance_km', null, 'primary'],
              ['durée', null, null],
              ['conducteur', null, null],
              ['carburant_l', null, 'primary'],
              ['alerte', null, 'warning'],
            ],
          },
          { title: 'Colonnes détectées' },
        ),
        w(
          {
            type: 'chart',
            kind: 'bar',
            unit: ' km',
            labels: ['S36', 'S37', 'S38', 'S39'],
            series: [{ label: 'Distance', data: [11200, 12480, 11950, 13100] }],
          },
          { title: 'Distance par semaine' },
        ),
      ],
      outro: 'Souhaitez-vous que je corrige les 3 doublons ?',
    };
  if (type === 'tree')
    return {
      tool: 'génération du rapport',
      intro: 'Le rapport est prêt avec les pièces sélectionnées :',
      blocks: [X.reportFiles(), W.callout('success', 'mi:task-alt', 'Rapport généré', option.label)],
    };
  return scenarioFor(detectIntent(option.value));
}

// ─── Conversations initiales ─────────────────────────────────────────

const ask = (id: string, time: string, t: string): HzMessage => ({ id, role: 'user', time, blocks: [text(t)] });
const reply = (id: string, time: string, blocks: HzBlock[], extra: Partial<HzMessage> = {}): HzMessage => ({
  id,
  role: 'assistant',
  time,
  blocks,
  ...extra,
});

export const buildConversations = (): HzConversation[] => [
  {
    id: 'c-demo',
    title: 'Démo · rapport d’activité flotte',
    group: 'Aujourd’hui',
    pinned: true,
    project: 'Démo',
    model: 'opus',
    messages: [
      ask('d1', '10:02', 'Fais-moi un rapport d’activité de la flotte et des ventes, avec tout ce qui est utile.'),
      reply('d2', '10:03', [
        thinking(
          'Le rapport doit couvrir l’état de la flotte (carte, alertes), la dynamique commerciale (CA, mix, régions) et les encours. Je termine par un formulaire pour planifier l’action corrective.',
          '4 s',
        ),
        tool('search', 'Recherche', 'positions GPS', '8 véhicules'),
        tool('read', 'Lecture', 'ventes-T3.xlsx', '1 240 lignes'),
        text('Voici le rapport. Les indicateurs sont bons, avec un point d’attention sur un véhicule hors zone.'),
        W.fleetStats(),
        W.fleetMap(),
        W.incidentTimeline(),
        W.callout(
          'warning',
          'mi:warning',
          'Point d’attention',
          'CI-9902-NP est sorti de sa zone autorisée. Une intervention est recommandée.',
        ),
        W.salesChart(),
        W.mixChart(),
        W.regionChart(),
        W.clientsTable(),
        W.tasksKanban(),
        W.rolloutGantt(),
        W.planningCalendar(),
        text('Pour traiter l’alerte, j’ai besoin de quelques informations :'),
        W.interventionForm(),
      ]),
    ],
  },
  {
    id: 'c-outils',
    title: 'Démo · boîte à outils de l’agent',
    group: 'Aujourd’hui',
    pinned: true,
    project: 'Démo',
    model: 'opus',
    messages: [
      ask('o1', '11:20', 'Montre-moi tout ce que tu peux afficher pour m’aider à décider.'),
      reply('o2', '11:21', [
        thinking(
          'Je présente chaque outil sur un cas concret : explorer, détailler, comparer, mesurer, sourcer, puis demander une validation.',
          '3 s',
        ),
        text('Voici l’ensemble des outils que je peux utiliser dans une réponse, sur des données d’exemple.'),
        text('**Explorer et naviguer**'),
        X.clientTabs(),
        X.clientModal(),
        X.documentsTree(),
        X.offersCarousel(),
        X.faqAccordion(),
        text('**Mesurer et préciser**'),
        X.usageStats(),
        X.objectives(),
        X.activityHeatmap(),
        X.onboardingSteps(),
        X.installChecklist(),
        X.clientIdentity(),
        X.plansCompare(),
        X.offerCards(),
        text('**Sourcer et inspecter**'),
        X.webSources(),
        X.topicTags(),
        X.apiJson(),
        X.reportFiles(),
        X.weekAgenda(),
        text('**Agir avec votre accord**'),
        X.codeDiff(),
        X.approvalTests(),
        X.uploadRequest(),
        X.moreTools(),
      ]),
    ],
  },
  {
    id: 'c-sidecar',
    title: 'Sidecar de navigation',
    group: 'Aujourd’hui',
    project: 'UI Kit',
    model: 'opus',
    messages: [
      {
        id: 'm1',
        role: 'user',
        time: '09:12',
        attachments: [{ name: 'maquette-sidecar.png', kind: 'image', size: '312 Ko' }],
        blocks: [
          text(
            'Combine le rail d’icônes et la sous-navigation de module en un seul Sidecar. Par défaut on ne voit que le rail ; au toucher d’une icône, une seconde colonne s’ouvre avec les sous-menus.',
          ),
        ],
      },
      reply(
        'm2',
        '09:13',
        [
          thinking(
            'Le rail et la sous-navigation partagent déjà les mêmes jetons (surface, rayon, couleurs actives). Le plus simple est un conteneur unique dont la largeur s’anime entre « rail seul » et « rail + panneau ».',
            '6 s',
          ),
          tool('search', 'Recherche', 'components/navigation', '3 fichiers trouvés'),
          tool('read', 'Lecture', 'NavigationGallery.tsx', '308 lignes'),
          tool('edit', 'Modification', 'Navigation.tsx', '+62 −48'),
          tool('bash', 'Terminal', 'npx tsc --noEmit', 'aucune erreur (2,4 s)'),
          text('C’est fait : le Sidecar remplace les deux démos. Voici le comportement :'),
          list([
            'Par défaut, seul le rail est visible (logo, icônes, avatar).',
            'Un toucher sur une icône l’active et déploie une colonne de `220 px` avec les sous-menus.',
            'Re-toucher l’icône ou le chevron replie la colonne.',
          ]),
          text('J’ai aussi extrait la logique dans un composant autonome, prêt à être branché dans le shell :'),
          artifact('art-sidecar'),
        ],
        { feedback: 'up' },
      ),
      ask('m3', '09:20', 'Parfait. Comment je l’utilise dans le shell ?'),
      reply('m4', '09:20', [
        text('Placez-le dans le tiroir sur téléphone, et à gauche du contenu sur tablette :'),
        code(
          '{wide ? <Sidecar items={DEMO_MENU} selected={id} onSelect={go} /> : null}\n<ModalDrawer visible={drawer} onDismiss={close}>\n  <Sidecar items={DEMO_MENU} selected={id} onSelect={go} />\n</ModalDrawer>',
          'tsx',
          'AppShell.tsx',
        ),
      ]),
    ],
  },
  {
    id: 'c-palette',
    title: 'Palette sombre accessible',
    group: 'Aujourd’hui',
    project: 'UI Kit',
    model: 'sonnet',
    messages: [
      ask('p1', '08:02', 'Propose une palette sombre qui respecte le contraste AA avec notre couleur primaire teal.'),
      reply('p2', '08:03', [
        text('Voici une base testée : chaque couleur garde un ratio d’au moins 4,5:1 sur la surface.'),
        artifact('art-palette'),
      ]),
    ],
  },
  {
    id: 'c-csv',
    title: 'Export CSV des factures',
    group: 'Hier',
    model: 'sonnet',
    messages: [
      ask('x1', '17:40', 'Comment exporter une liste en CSV sans dépendance ?'),
      reply('x2', '17:41', [
        text('Construisez les lignes à partir des données puis partagez le fichier :'),
        code("const csv = [cols.join(';'), ...rows.map((r) => cols.map((c) => r[c]).join(';'))].join('\\n');", 'ts'),
      ]),
    ],
  },
  {
    id: 'c-reunion',
    title: 'Résumé réunion produit',
    group: 'Hier',
    model: 'haiku',
    messages: [
      ask('r1', '11:05', 'Résume les décisions de la réunion produit en cinq points.'),
      reply('r2', '11:05', [
        list([
          'Le Sidecar devient la navigation par défaut.',
          'Les pages métiers sont retirées du kit.',
          'Le mode sombre est prioritaire pour la v2.',
          'Les démos restent 100 % statiques.',
          'Revue d’accessibilité avant la fin du mois.',
        ]),
      ]),
    ],
  },
  {
    id: 'c-migration',
    title: 'Migration Expo SDK 58',
    group: '7 derniers jours',
    project: 'UI Kit',
    model: 'opus',
    messages: [
      ask('g1', 'Lun.', 'Quelles sont les étapes pour migrer le kit vers le dernier SDK Expo ?'),
      reply('g2', 'Lun.', [
        text(
          'Lancez `npx expo install expo@latest --fix`, puis `npx expo-doctor` et vérifiez les API dépréciées signalées par `npx tsc --noEmit`.',
        ),
      ]),
    ],
  },
  {
    id: 'c-sql',
    title: 'Requêtes SQL lentes',
    group: '7 derniers jours',
    model: 'sonnet',
    messages: [
      ask('s1', 'Mar.', "Pourquoi ma requête avec un LIKE '%abc%' est-elle lente ?"),
      reply('s2', 'Mar.', [
        text(
          'Un joker en tête empêche l’usage d’un index B-tree. Utilisez un index trigramme ou une recherche plein texte.',
        ),
      ]),
    ],
  },
  {
    id: 'c-e2e',
    title: 'Plan de tests e2e',
    group: '30 derniers jours',
    model: 'haiku',
    messages: [
      ask('e1', '2 oct.', 'Liste les parcours critiques à couvrir en e2e.'),
      reply('e2', '2 oct.', [
        text('Connexion, navigation dans le shell, ouverture du panneau de compte et bascule du thème.'),
      ]),
    ],
  },
];
