/**
 * Données des vues de planification (`lib/data/planning_data.dart`). Dates relatives à aujourd'hui :
 * retards, ligne « aujourd'hui » et agenda restent parlants.
 */
import type { PlanningColumn, PlanningFilter, PlanningGroup, PlanningItem } from '../components/planning/models';
import type { KitTone } from '../theme';

const d = (offsetDays: number, h = 0, m = 0, now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays, h, m);

/** Jour `dow` (0 = lundi) de la semaine courante. */
const w = (dow: number, h: number, m = 0, now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) + dow, h, m);

// ─── Interventions terrain (kanban, notes, vue groupée, calendrier) ─────────
export const INTERVENTION_COLUMNS: PlanningColumn[] = [
  { key: 'planifiee', label: 'Planifiée', tone: 'info' },
  { key: 'en_route', label: 'En route', tone: 'purple' },
  { key: 'sur_site', label: 'Sur site', tone: 'warning' },
  { key: 'cloturee', label: 'Clôturée', tone: 'success' },
];

export const TECHNICIENS: PlanningGroup[] = [
  { key: 'kouame', label: 'Kouamé Aya', subtitle: 'Abidjan Sud', tone: 'primary' },
  { key: 'traore', label: 'Traoré Ibrahim', subtitle: 'Abidjan Nord', tone: 'info' },
  { key: 'yao', label: 'Yao Serge', subtitle: 'Bouaké', tone: 'purple' },
];

const TYPE_TONE: Record<string, KitTone> = {
  installation: 'primary',
  maintenance: 'info',
  diagnostic: 'warning',
  desinstallation: 'neutral',
};
export const TYPE_LABEL: Record<string, string> = {
  installation: 'Installation',
  maintenance: 'Maintenance',
  diagnostic: 'Diagnostic',
  desinstallation: 'Désinstallation',
};

function inter(
  n: number,
  title: string,
  type: string,
  status: string,
  tech: string,
  due: number,
  description?: string,
  tags: string[] = [],
): PlanningItem {
  const g = TECHNICIENS.find((t) => t.key === tech);
  return {
    id: `int-${n}`,
    ref: `INT-${String(400 + n).padStart(4, '0')}`,
    title,
    description,
    status,
    group: tech,
    assignee: g?.label,
    due: d(due, 17),
    start: d(due, 8 + (n % 8)),
    done: status === 'cloturee',
    progress: status === 'cloturee' ? 100 : status === 'sur_site' ? 60 : status === 'en_route' ? 20 : 0,
    tone: TYPE_TONE[type],
    badge: TYPE_LABEL[type],
    badgeTone: TYPE_TONE[type],
    tags,
    fields: { type, zone: g?.subtitle ?? '' },
  };
}

export const buildInterventions = (): PlanningItem[] => [
  inter(
    1,
    'Pose balise — Transports Yao (CI-4521-AB)',
    'installation',
    'planifiee',
    'kouame',
    1,
    'Pose d’une balise FMB920 avec coupure moteur. Prévoir relais 12 V.',
  ),
  inter(
    2,
    'Balise hors ligne — SOTRA bus 112',
    'diagnostic',
    'planifiee',
    'traore',
    -2,
    'Aucune position depuis 48 h. Vérifier alimentation et carte SIM.',
    ['Urgent'],
  ),
  inter(
    3,
    'Maintenance capteur carburant',
    'maintenance',
    'en_route',
    'yao',
    0,
    'Recalibrage de la sonde après remplacement du réservoir.',
  ),
  inter(
    4,
    'Installation flotte — 6 véhicules Lôh Logistique',
    'installation',
    'sur_site',
    'kouame',
    0,
    'Lot de 6 balises + boutons SOS.',
  ),
  inter(5, 'Retrait balise — fin de contrat CFAO', 'desinstallation', 'planifiee', 'traore', 3),
  inter(6, 'Remplacement antenne GPS', 'maintenance', 'cloturee', 'yao', -3),
  inter(
    7,
    'Diagnostic coupure intermittente',
    'diagnostic',
    'sur_site',
    'traore',
    -1,
    'Coupures aléatoires signalées par le client depuis lundi.',
  ),
  inter(8, 'Pose caméra embarquée — Bolloré', 'installation', 'planifiee', 'yao', 5),
  inter(9, 'Contrôle annuel — flotte Ivoire Express', 'maintenance', 'cloturee', 'kouame', -5),
  inter(10, 'Mise à jour firmware (12 balises)', 'maintenance', 'en_route', 'kouame', 2),
  inter(11, 'Installation boîtier température — Agro CI', 'installation', 'planifiee', 'traore', 8),
  inter(12, 'Retrait équipement accidenté', 'desinstallation', 'cloturee', 'yao', -7),
];

export const INTERVENTION_FILTERS: PlanningFilter[] = [
  {
    key: 'type',
    label: 'Type',
    allLabel: 'Tous les types',
    options: Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
  },
  {
    key: 'zone',
    label: 'Zone',
    allLabel: 'Toutes les zones',
    options: ['Abidjan Sud', 'Abidjan Nord', 'Bouaké'].map((z) => ({ value: z, label: z })),
  },
  {
    key: 'group',
    label: 'Technicien',
    allLabel: 'Tous',
    options: TECHNICIENS.map((t) => ({ value: t.key, label: t.label })),
  },
];

// ─── Réservations de véhicules de service (Gantt) ───────────────────────────
export const VEHICULES: PlanningGroup[] = [
  { key: 'v1', label: 'Toyota Hilux', subtitle: 'CI-1024-AB', icon: 'mi:local-shipping', tone: 'primary' },
  { key: 'v2', label: 'Renault Kangoo', subtitle: 'CI-2210-CD', icon: 'mi:airport-shuttle', tone: 'info' },
  { key: 'v3', label: 'Suzuki Swift', subtitle: 'CI-3307-EF', icon: 'mi:directions-car', tone: 'purple' },
  { key: 'v4', label: 'Yamaha Crux', subtitle: 'CI-0418-GH', icon: 'mi:two-wheeler', tone: 'cyan' },
];

export const buildReservations = (): PlanningItem[] => [
  {
    id: 'r1',
    ref: 'RSV-101',
    title: 'Tournée Abidjan Sud',
    group: 'v1',
    start: d(-6),
    end: d(-2),
    done: true,
    assignee: 'Kouamé Aya',
    tone: 'success',
    fields: { motif: 'tournee' },
  },
  {
    id: 'r2',
    ref: 'RSV-102',
    title: 'Déploiement Lôh Logistique',
    group: 'v1',
    start: d(-1),
    end: d(3),
    due: d(2),
    progress: 55,
    assignee: 'Kouamé Aya',
    tone: 'primary',
    fields: { motif: 'installation' },
  },
  {
    id: 'r3',
    ref: 'RSV-103',
    title: 'Mission Bouaké',
    group: 'v2',
    start: d(-4),
    end: d(-1),
    due: d(-2),
    progress: 80,
    assignee: 'Yao Serge',
    tone: 'warning',
    fields: { motif: 'mission' },
  },
  {
    id: 'r4',
    ref: 'RSV-104',
    title: 'Livraison matériel Yamoussoukro',
    group: 'v2',
    start: d(2),
    end: d(4),
    assignee: 'Traoré Ibrahim',
    tone: 'info',
    fields: { motif: 'livraison' },
  },
  {
    id: 'r5',
    ref: 'RSV-105',
    title: 'Visite client CFAO',
    group: 'v3',
    start: d(0),
    end: d(0),
    assignee: 'Traoré Ibrahim',
    tone: 'purple',
    fields: { motif: 'visite' },
  },
  {
    id: 'r6',
    ref: 'RSV-106',
    title: 'Révision garage',
    group: 'v3',
    start: d(5),
    end: d(7),
    tone: 'neutral',
    fields: { motif: 'entretien' },
  },
  {
    id: 'r7',
    ref: 'RSV-107',
    title: 'Courses urgentes',
    group: 'v4',
    start: d(-3),
    end: d(1),
    assignee: 'Coulibaly Awa',
    tone: 'error',
    fields: { motif: 'mission' },
  },
  {
    id: 'r8',
    ref: 'RSV-108',
    title: 'Relevés compteurs',
    group: 'v4',
    start: d(1),
    end: d(2),
    assignee: 'Coulibaly Awa',
    tone: 'info',
    fields: { motif: 'tournee' },
  },
  {
    id: 'r9',
    ref: 'RSV-109',
    title: 'Formation conduite',
    group: 'v1',
    start: d(6),
    end: d(9),
    tone: 'purple',
    fields: { motif: 'formation' },
  },
];

export const MOTIF_FILTER: PlanningFilter = {
  key: 'motif',
  label: 'Motif',
  allLabel: 'Tous les motifs',
  options: [
    ['tournee', 'Tournée'],
    ['installation', 'Installation'],
    ['mission', 'Mission'],
    ['livraison', 'Livraison'],
    ['visite', 'Visite'],
    ['entretien', 'Entretien'],
    ['formation', 'Formation'],
  ].map(([value = '', label = '']) => ({ value, label })),
};

// ─── Projet de déploiement sans groupes ─────────────────────────────────────
export const buildPhases = (): PlanningItem[] => [
  { id: 'p1', ref: 'P1', title: 'Cadrage & devis', start: d(-12), end: d(-8), done: true, tone: 'success' },
  {
    id: 'p2',
    ref: 'P2',
    title: 'Commande des balises',
    start: d(-8),
    end: d(-3),
    due: d(-4),
    progress: 90,
    tone: 'info',
  },
  { id: 'p3', ref: 'P3', title: 'Installation sur la flotte', start: d(-3), end: d(6), progress: 40, tone: 'primary' },
  { id: 'p4', ref: 'P4', title: 'Formation des exploitants', start: d(5), end: d(8), tone: 'purple' },
  { id: 'p5', ref: 'P5', title: 'Recette & mise en service', start: d(8), end: d(11), tone: 'warning' },
];

// ─── Rendez-vous (agenda) ───────────────────────────────────────────────────
export const buildRendezVous = (): PlanningItem[] => [
  {
    id: 'a1',
    title: 'Point hebdo exploitation',
    start: w(0, 9),
    end: w(0, 10),
    tone: 'primary',
    assignee: 'Équipe ops',
    fields: { kind: 'reunion' },
  },
  {
    id: 'a2',
    title: 'Démo plateforme — Agro CI',
    start: w(0, 11),
    end: w(0, 12, 30),
    tone: 'purple',
    fields: { kind: 'client' },
  },
  {
    id: 'a3',
    title: 'Installation CI-4521-AB',
    start: w(1, 8, 30),
    end: w(1, 11),
    tone: 'info',
    assignee: 'Kouamé Aya',
    fields: { kind: 'terrain' },
  },
  {
    id: 'a4',
    title: 'Appel fournisseur Teltonika',
    start: w(1, 10),
    end: w(1, 10, 45),
    tone: 'warning',
    fields: { kind: 'reunion' },
  },
  {
    id: 'a5',
    title: 'Diagnostic SOTRA bus 112',
    start: w(2, 14),
    end: w(2, 16),
    tone: 'error',
    assignee: 'Traoré Ibrahim',
    fields: { kind: 'terrain' },
  },
  {
    id: 'a6',
    title: 'Revue des impayés',
    start: w(2, 15),
    end: w(2, 16, 30),
    tone: 'neutral',
    fields: { kind: 'reunion' },
  },
  {
    id: 'a7',
    title: 'Formation nouveaux techniciens',
    start: w(3, 9),
    end: w(3, 12),
    tone: 'success',
    fields: { kind: 'formation' },
  },
  {
    id: 'a8',
    title: 'Visite Bolloré — caméras',
    start: w(3, 14, 30),
    end: w(3, 15, 30),
    tone: 'purple',
    fields: { kind: 'client' },
  },
  { id: 'a9', title: 'Inventaire du stock', start: w(4, 0), tone: 'info', fields: { kind: 'interne' } },
  {
    id: 'a10',
    title: 'Clôture mensuelle',
    start: w(4, 16),
    end: w(4, 18),
    tone: 'primary',
    fields: { kind: 'reunion' },
  },
  { id: 'a11', title: 'Astreinte week-end', start: w(5, 0), tone: 'warning', fields: { kind: 'interne' } },
  {
    id: 'a12',
    title: 'Point flotte Lôh Logistique',
    start: w(1, 15),
    end: w(1, 16),
    tone: 'info',
    fields: { kind: 'client' },
  },
];

export const RDV_KIND_FILTER: PlanningFilter = {
  key: 'kind',
  label: 'Catégorie',
  allLabel: 'Toutes',
  options: [
    ['reunion', 'Réunion'],
    ['client', 'Client'],
    ['terrain', 'Terrain'],
    ['formation', 'Formation'],
    ['interne', 'Interne'],
  ].map(([value = '', label = '']) => ({ value, label })),
};
