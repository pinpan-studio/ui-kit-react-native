/**
 * Jeux de données génériques de la galerie de composants (`lib/data/showcase_data.dart`).
 * Déterministes (aucun aléatoire) : rendu identique à chaque lancement.
 */
import type { KitTone } from '../theme';

export type ClientStatut = 'actif' | 'inactif' | 'suspendu' | 'resilie';

export const STATUT_LABEL: Record<ClientStatut, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
  suspendu: 'Suspendu',
  resilie: 'Résilié',
};

/** `STATUT_COLOR` */
export const STATUT_TONE: Record<ClientStatut, KitTone> = {
  actif: 'success',
  inactif: 'neutral',
  suspendu: 'warning',
  resilie: 'error',
};

export const CLIENT_STATUTS: readonly ClientStatut[] = ['actif', 'inactif', 'suspendu', 'resilie'];

export interface DemoClient {
  id: string;
  code: string;
  raisonSociale: string;
  contact: string;
  email: string;
  telephone: string;
  ville: string;
  secteur: string;
  vehicules: number;
  caMensuel: number;
  statut: ClientStatut;
  createdAt: Date;
}

export const RAISONS = [
  'Transports Yao & Fils',
  'Bolloré Logistics CI',
  'SOTRA Abidjan',
  'Kouamé BTP',
  'Ivoire Express Livraison',
  'CFAO Motors CI',
  'Groupe Diallo Négoce',
  'SIFCA Logistique',
  'Coulibaly Frères Transit',
  'Aka Mobilité',
  'Sahel Cargo',
  'Bamba Distribution',
  'Ouattara Services',
  'San-Pédro Shipping',
  'Yamoussoukro Taxi Pool',
  'Bouaké Agro Transport',
  'Gbaka Line',
  'Atlantique Fret',
  'Konan Location Auto',
  'Treichville Moto Pro',
  'Cocody Premium Cars',
  'Plateau VTC',
  'Daloa Céréales',
  'Korhogo Coton Logistique',
  'Man Minerais',
  'Assinie Tourisme',
  'Grand-Bassam Bus',
  'Yopougon Livraison',
  'Abobo Transports',
  'Marcory Auto-École',
  'Port-Bouët Conteneurs',
  'Bingerville Agrumes',
  'Anyama Kola Export',
  'Divo Cacao Trans',
  'Gagnoa Bois',
  'Soubré Palmeraie',
  'Odienné Bétail',
  'Bondoukou Négoce',
  'Abengourou Hévéa',
  'Agboville Maraîchers',
];

export const CONTACTS = [
  'Jean Kouassi',
  'Marie Yao',
  'Aminata Diallo',
  'Koffi N’Guessan',
  'Fatou Bamba',
  'Serge Kouamé',
  'Awa Coulibaly',
  'Patrick Aka',
  'Mariam Ouattara',
  'Eric Konan',
  'Christelle Tanoh',
  'Ibrahim Traoré',
  'Nadège Gnagne',
  'Yves Brou',
  'Alimata Koné',
  'Didier Assi',
  'Sandrine Ehui',
  'Moussa Sanogo',
  'Brigitte Adjoua',
  'Hervé Kacou',
];

export const VILLES = ['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Daloa', 'Korhogo', 'Man', 'Gagnoa'];
export const SECTEURS = ['Transport', 'Logistique', 'BTP', 'Distribution', 'Agro-industrie', 'Location', 'Tourisme'];

const STATUT_CYCLE: ClientStatut[] = ['actif', 'actif', 'actif', 'suspendu', 'actif', 'inactif', 'actif', 'resilie'];

const SLUG_FROM = 'àâäéèêëîïôöùûüçœ’';
const SLUG_TO = 'aaaeeeeiioouuucoe';

function slug(s: string): string {
  let out = '';
  for (const ch of s.toLowerCase()) {
    const i = SLUG_FROM.indexOf(ch);
    out += i >= 0 ? (SLUG_TO[i] ?? '') : ch;
  }
  return out.replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
}

const p2 = (n: number) => String(n).padStart(2, '0');

export const DEMO_CLIENTS: DemoClient[] = RAISONS.map((raison, i) => {
  const contact = CONTACTS[i % CONTACTS.length] ?? '';
  return {
    id: `cli-${String(i + 1).padStart(3, '0')}`,
    code: `CLI-${1040 + i * 3}`,
    raisonSociale: raison,
    contact,
    email: `${slug(contact)}@${slug(raison).split('.')[0]}.ci`,
    telephone: `+225 07 ${p2(10 + ((i * 13) % 89))} ${p2(20 + ((i * 17) % 79))} ${p2(30 + ((i * 7) % 69))}`,
    ville: VILLES[i % VILLES.length] ?? '',
    secteur: SECTEURS[i % SECTEURS.length] ?? '',
    vehicules: 2 + ((i * 11) % 47),
    caMensuel: 150000 + ((i * 137500) % 4850000),
    statut: STATUT_CYCLE[i % STATUT_CYCLE.length] ?? 'actif',
    createdAt: new Date(2024 + (i % 3), (i * 5) % 12, ((i * 7) % 28) + 1),
  };
});

export interface TreeNodeData {
  id: string;
  label: string;
  icon?: string;
  meta?: string;
  children?: TreeNodeData[];
}

/** Zones d'intervention (sélection arborescente). */
export const ZONES_TREE: TreeNodeData[] = [
  {
    id: 'abj',
    label: 'Abidjan',
    icon: 'mi:location-city',
    children: [
      {
        id: 'abj-n',
        label: 'Abidjan Nord',
        children: [
          { id: 'abobo', label: 'Abobo' },
          { id: 'yop', label: 'Yopougon' },
          { id: 'adj', label: 'Adjamé' },
        ],
      },
      {
        id: 'abj-s',
        label: 'Abidjan Sud',
        children: [
          { id: 'marc', label: 'Marcory' },
          { id: 'treich', label: 'Treichville' },
          { id: 'kouma', label: 'Koumassi' },
          { id: 'pb', label: 'Port-Bouët' },
        ],
      },
      {
        id: 'coco',
        label: 'Cocody',
        children: [
          { id: 'riv', label: 'Riviera' },
          { id: 'ang', label: 'Angré' },
        ],
      },
    ],
  },
  {
    id: 'centre',
    label: 'Centre',
    icon: 'mi:landscape',
    children: [
      { id: 'yakro', label: 'Yamoussoukro' },
      { id: 'bke', label: 'Bouaké' },
    ],
  },
  {
    id: 'ouest',
    label: 'Ouest',
    icon: 'mi:forest',
    children: [
      { id: 'sp', label: 'San-Pédro' },
      { id: 'man', label: 'Man' },
      { id: 'daloa', label: 'Daloa' },
    ],
  },
];

export type PlaceKind = 'road' | 'poi' | 'area';

export interface PlaceOption {
  id: string;
  label: string;
  detail: string;
  city: string;
  lat: number;
  lng: number;
  kind: PlaceKind;
}

export const PLACE_ICON: Record<PlaceKind, string> = {
  road: 'signpost-outline',
  poi: 'mi:place',
  area: 'mi:location-city',
};

const place = (id: string, label: string, detail: string, city: string, lat: number, lng: number, kind: PlaceKind) => ({
  id,
  label,
  detail,
  city,
  lat,
  lng,
  kind,
});

/** Répertoire d'adresses ivoiriennes (aucun géocodage distant). */
export const DEMO_PLACES: PlaceOption[] = [
  place('a1', 'Boulevard de la République', 'Plateau, Abidjan', 'Abidjan', 5.3237, -4.0193, 'road'),
  place('a2', 'Riviera 2, rue des Jardins', 'Cocody, Abidjan', 'Abidjan', 5.36, -3.99, 'road'),
  place('a3', 'Carrefour Selmer', 'Yopougon, Abidjan', 'Abidjan', 5.345, -4.08, 'poi'),
  place('a4', 'Zone 4, rue du Docteur Blanchard', 'Marcory, Abidjan', 'Abidjan', 5.303, -3.985, 'road'),
  place('a5', 'Port autonome d’Abidjan', 'Treichville, Abidjan', 'Abidjan', 5.293, -4.005, 'poi'),
  place('a6', 'Gare routière d’Abobo', 'Abobo, Abidjan', 'Abidjan', 5.418, -4.02, 'poi'),
  place('a7', 'Aéroport Félix-Houphouët-Boigny', 'Port-Bouët, Abidjan', 'Abidjan', 5.255, -3.93, 'poi'),
  place('a8', 'Boulevard Valéry Giscard d’Estaing', 'Koumassi, Abidjan', 'Abidjan', 5.297, -3.948, 'road'),
  place('a9', 'Angré 8e tranche', 'Cocody, Abidjan', 'Abidjan', 5.398, -3.987, 'area'),
  place('a10', 'Avenue Houphouët-Boigny', 'Bouaké', 'Bouaké', 7.6906, -5.0306, 'road'),
  place('a11', 'Basilique Notre-Dame de la Paix', 'Yamoussoukro', 'Yamoussoukro', 6.8115, -5.297, 'poi'),
  place('a12', 'Port de San-Pédro', 'San-Pédro', 'San-Pédro', 4.7485, -6.6363, 'poi'),
  place('a13', 'Quartier Commerce', 'Korhogo', 'Korhogo', 9.458, -5.6296, 'area'),
  place('a14', 'Marché central', 'Daloa', 'Daloa', 6.8774, -6.4502, 'poi'),
  place('a15', 'Plage d’Assinie Mafia', 'Assinie', 'Assinie', 5.133, -3.283, 'area'),
  place('a16', 'Quartier France', 'Grand-Bassam', 'Grand-Bassam', 5.198, -3.738, 'area'),
];

export interface DemoNotification {
  icon: string;
  tone: KitTone;
  title: string;
  text: string;
  minutesAgo: number;
  read?: boolean;
  category: string;
}

export const NOTIFICATIONS: DemoNotification[] = [
  {
    icon: 'mi:warning-amber',
    tone: 'error',
    title: 'Sortie de zone',
    text: 'CI-9902-NP a quitté la geofence « Port-Bouët ».',
    minutesAgo: 4,
    category: 'Alertes',
  },
  {
    icon: 'mi:payments',
    tone: 'success',
    title: 'Paiement reçu',
    text: 'Bolloré Logistics CI a réglé FAC-2026-0874 (2 100 000 FCFA).',
    minutesAgo: 22,
    category: 'Finance',
  },
  {
    icon: 'mi:engineering',
    tone: 'info',
    title: 'Intervention planifiée',
    text: 'INT-0412 confiée à Kouamé Aya pour demain 08:30.',
    minutesAgo: 75,
    category: 'Terrain',
  },
  {
    icon: 'mi:sim-card',
    tone: 'warning',
    title: 'Forfait SIM bientôt épuisé',
    text: '12 cartes SIM sous 10 % de data restante.',
    minutesAgo: 180,
    read: true,
    category: 'Système',
  },
  {
    icon: 'mi:person-add',
    tone: 'primary',
    title: 'Nouveau client',
    text: 'Lôh Logistique a signé un contrat de 6 véhicules.',
    minutesAgo: 1440,
    read: true,
    category: 'Commercial',
  },
];
