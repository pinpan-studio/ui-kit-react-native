import { fold } from '../core/format';
import type { KitTone } from '../theme';

/**
 * Données statiques des écrans d'exemple (`data/examples_data.dart`, miroir des jeux Angular) : session,
 * clients, factures, messages, produits, modules, articles, commentaires, tableau de bord, kanban,
 * supervision, messagerie instantanée, fichiers, fil d'équipe, paramètres. Montants en FCFA.
 */

// ─── Session ────────────────────────────────────────────────────────────────

export const CURRENT_USER = {
  id: 'u-001',
  fullname: 'Jean Kouassi',
  mail: 'jean.kouassi@example.com',
  phone: '+225 07 07 12 34 56',
  role: 'Administrateur',
};

export const ORGANISATION = { nom: 'SC Storage', sigle: 'SCS', ville: 'Abidjan', pays: 'Côte d’Ivoire' };

// ─── Clients ────────────────────────────────────────────────────────────────

export type ClientStatus = 'actif' | 'prospect' | 'suspendu' | 'inactif';

export const CLIENT_STATUS: Record<ClientStatus, { label: string; tone: KitTone }> = {
  actif: { label: 'Actif', tone: 'success' },
  prospect: { label: 'Prospect', tone: 'info' },
  suspendu: { label: 'Suspendu', tone: 'warning' },
  inactif: { label: 'Inactif', tone: 'neutral' },
};
export const CLIENT_STATUSES = Object.keys(CLIENT_STATUS) as ClientStatus[];

export interface ExClient {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  sector: string;
  status: ClientStatus;
  revenue: number;
  invoices: number;
  since: Date;
  owner: string;
}

const NAMES: [string, string, string][] = [
  ['Sotra Logistique', 'Aya Koné', 'Transport'],
  ['Ivoire Agro SA', 'Moussa Traoré', 'Agro-industrie'],
  ['Banque Lagune', 'Fatou Diabaté', 'Finance'],
  ['Cacao Plus', 'Yao N’Guessan', 'Agro-industrie'],
  ['Clinique Riviera', 'Dr Awa Bamba', 'Santé'],
  ['Batim CI', 'Koffi Assi', 'BTP'],
  ['Orca Télécom', 'Mariam Ouattara', 'Télécoms'],
  ['Hôtel Assinie', 'Serge Kacou', 'Hôtellerie'],
  ['Pharma Sud', 'Inès Coulibaly', 'Santé'],
  ['Energie Nord', 'Ibrahim Sanogo', 'Énergie'],
  ['Café Akwaba', 'Rose Adjoua', 'Restauration'],
  ['Mines de Tongon', 'Alain Gnamien', 'Mines'],
  ['École Les Palmiers', 'Nadia Touré', 'Éducation'],
  ['AutoPro Yopougon', 'Didier Zadi', 'Automobile'],
  ['Textile Bouaké', 'Salif Konaté', 'Industrie'],
  ['Port Sec San Pedro', 'Linda Ehui', 'Transport'],
  ['Studio Lagune', 'Eric Brou', 'Médias'],
  ['Agence Kôrô', 'Mireille Yapi', 'Services'],
  ['FreshMarket', 'Hervé Tanoh', 'Distribution'],
  ['Assur’Ivoire', 'Kadi Fofana', 'Assurance'],
  ['Cimenterie Est', 'Paul Amani', 'Industrie'],
  ['Digital Baobab', 'Grace Kouamé', 'Numérique'],
  ['Radio Plateau', 'Jules Ahoua', 'Médias'],
  ['Ferme Bio Dabou', 'Clarisse Djè', 'Agro-industrie'],
];
const CITIES = ['Abidjan', 'Bouaké', 'San Pedro', 'Yamoussoukro', 'Korhogo', 'Daloa', 'Man', 'Grand-Bassam'];
const STATUSES: ClientStatus[] = ['actif', 'actif', 'prospect', 'actif', 'suspendu', 'actif', 'inactif', 'prospect'];
export const OWNERS = ['Jean Kouassi', 'Aïcha Diallo', 'Marc Yao', 'Sarah Bamba'];
const pad2 = (n: number) => String(n).padStart(2, '0');

/** `EX_CLIENTS` — même formule de génération que la version Angular / Flutter. */
export const EX_CLIENTS: ExClient[] = NAMES.map(([name, contact, sector], i) => ({
  id: `c-${101 + i}`,
  name,
  contact,
  sector,
  email: `${fold(contact)
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '.')}@${fold(name)
    .replace(/[^a-z]/g, '')
    .slice(0, 12)}.ci`,
  phone: `+225 07 ${pad2(10 + ((i * 37) % 89))} ${pad2(10 + ((i * 53) % 89))} ${pad2(10 + ((i * 71) % 89))}`,
  city: CITIES[i % CITIES.length]!,
  status: STATUSES[i % STATUSES.length]!,
  revenue: (((i * 7919) % 97) + 8) * 1250000,
  invoices: ((i * 13) % 40) + 2,
  since: new Date(2019 + (i % 7), (i * 5) % 12, 1 + ((i * 11) % 27)),
  owner: OWNERS[i % OWNERS.length]!,
}));

export const exClientById = (id?: string) => EX_CLIENTS.find((c) => c.id === id) ?? EX_CLIENTS[0]!;

export const EX_ACTIVITY: { icon: string; tone: KitTone; text: string; at: string; who: string }[] = [
  {
    icon: 'mi:receipt-long',
    tone: 'primary',
    text: 'Facture FAC-2026-0412 émise · 4 250 000 FCFA',
    at: 'Il y a 12 min',
    who: 'Jean Kouassi',
  },
  { icon: 'mi:payments', tone: 'success', text: 'Paiement reçu de Banque Lagune', at: 'Il y a 1 h', who: 'Système' },
  {
    icon: 'mi:person-add',
    tone: 'info',
    text: 'Nouveau prospect : Digital Baobab',
    at: 'Il y a 3 h',
    who: 'Aïcha Diallo',
  },
  {
    icon: 'mi:warning',
    tone: 'warning',
    text: 'Relance : Clinique Riviera, 2 factures en retard',
    at: 'Hier',
    who: 'Système',
  },
  { icon: 'mi:description', tone: 'purple', text: 'Contrat signé avec Orca Télécom', at: 'Hier', who: 'Marc Yao' },
  { icon: 'mi:block', tone: 'error', text: 'Compte suspendu : Pharma Sud', at: 'Il y a 2 j', who: 'Sarah Bamba' },
];

export const EX_INVOICES: {
  ref: string;
  date: string;
  amount: number;
  status: 'en attente' | 'payée' | 'en retard';
}[] = [
  { ref: 'FAC-2026-0412', date: '2026-10-14', amount: 4250000, status: 'en attente' },
  { ref: 'FAC-2026-0388', date: '2026-09-30', amount: 1870000, status: 'payée' },
  { ref: 'FAC-2026-0351', date: '2026-09-02', amount: 2400000, status: 'en retard' },
  { ref: 'FAC-2026-0310', date: '2026-08-05', amount: 960000, status: 'payée' },
  { ref: 'FAC-2026-0277', date: '2026-07-11', amount: 3150000, status: 'payée' },
];
export const invoiceTone = (s: string): KitTone =>
  s === 'payée' ? 'success' : s === 'en retard' ? 'error' : 'warning';

// ─── Messagerie ─────────────────────────────────────────────────────────────

export interface ExMessage {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  body: string[];
  at: string;
  unread: boolean;
  starred: boolean;
  label?: [string, KitTone];
  attachments?: string[];
}

export const EX_MESSAGES: ExMessage[] = [
  {
    id: 'm1',
    from: 'Aya Koné',
    email: 'aya.kone@sotra.ci',
    subject: 'Livraison du lot 14 — créneau confirmé',
    at: '09:24',
    unread: true,
    starred: true,
    label: ['Logistique', 'info'],
    attachments: ['bon-livraison-14.pdf'],
    preview: 'Bonjour, nous confirmons le créneau de jeudi 8h pour la livraison du lot 14…',
    body: [
      'Bonjour Jean,',
      'Nous confirmons le créneau de jeudi 8 h pour la livraison du lot 14 au dépôt de Vridi. Le camion arrivera avec 32 palettes.',
      'Vous trouverez le bon de livraison en pièce jointe. Merci de prévoir deux agents pour le déchargement.',
      'Bien cordialement,\nAya Koné — Sotra Logistique',
    ],
  },
  {
    id: 'm2',
    from: 'Fatou Diabaté',
    email: 'f.diabate@banquelagune.ci',
    subject: 'Relevé de compte septembre',
    at: '08:02',
    unread: true,
    starred: false,
    label: ['Finance', 'success'],
    preview: 'Veuillez trouver ci-joint le relevé de compte du mois de septembre…',
    body: [
      'Bonjour,',
      'Veuillez trouver ci-joint le relevé de compte du mois de septembre. Le solde créditeur s’élève à 48 320 000 FCFA.',
      'Cordialement,\nFatou Diabaté',
    ],
  },
  {
    id: 'm3',
    from: 'Marc Yao',
    email: 'marc.yao@exemple.ci',
    subject: 'Re: Proposition Orca Télécom',
    at: 'Hier',
    unread: false,
    starred: true,
    preview: 'Le client a validé la proposition, je prépare le contrat pour signature…',
    body: [
      'Salut Jean,',
      'Le client a validé la proposition à 12,4 M FCFA. Je prépare le contrat pour une signature lundi.',
      'Marc',
    ],
  },
  {
    id: 'm4',
    from: 'Support UI Kit',
    email: 'support@uikit.dev',
    subject: 'Votre ticket #4821 a été résolu',
    at: 'Hier',
    unread: false,
    starred: false,
    label: ['Support', 'purple'],
    preview: 'Bonne nouvelle : le problème d’export PDF est corrigé dans la version 2.4…',
    body: [
      'Bonjour,',
      'Bonne nouvelle : le problème d’export PDF est corrigé dans la version 2.4. Aucune action n’est requise de votre part.',
      'L’équipe Support',
    ],
  },
  {
    id: 'm5',
    from: 'Dr Awa Bamba',
    email: 'a.bamba@clinique-riviera.ci',
    subject: 'Échéancier de paiement',
    at: 'Lun.',
    unread: false,
    starred: false,
    label: ['Relance', 'warning'],
    preview: 'Suite à votre relance, nous proposons un règlement en trois échéances…',
    body: [
      'Monsieur Kouassi,',
      'Suite à votre relance, nous proposons un règlement en trois échéances mensuelles à compter du 1er novembre.',
      'Dr Awa Bamba',
    ],
  },
  {
    id: 'm6',
    from: 'Serge Kacou',
    email: 'serge@hotel-assinie.ci',
    subject: 'Réservation séminaire décembre',
    at: 'Dim.',
    unread: false,
    starred: false,
    preview: 'Nous avons bien noté votre demande pour 40 personnes du 12 au 14 décembre…',
    body: [
      'Bonjour,',
      'Nous avons bien noté votre demande pour 40 personnes du 12 au 14 décembre. Un devis vous sera adressé sous 48 h.',
      'Serge Kacou — Hôtel Assinie',
    ],
  },
  {
    id: 'm7',
    from: 'Grace Kouamé',
    email: 'grace@digitalbaobab.ci',
    subject: 'Atelier design system',
    at: '12 oct.',
    unread: false,
    starred: false,
    preview: 'Merci pour l’atelier de mardi ! Voici le compte rendu et les prochaines étapes…',
    body: [
      'Merci pour l’atelier de mardi !',
      'Voici le compte rendu et les prochaines étapes : audit des composants, jetons de couleur, documentation.',
      'Grace',
    ],
  },
];

// ─── Catalogue ──────────────────────────────────────────────────────────────

export interface ExProduct {
  id: string;
  name: string;
  category: string;
  icon: string;
  hue: number;
  price: number;
  rating: number;
  stock: number;
  badge?: string;
}

const PRODUCTS: [string, string, string, number][] = [
  ['Casque sans fil Pro', 'Audio', 'mi:headphones', 210],
  ['Enceinte nomade', 'Audio', 'mi:speaker', 190],
  ['Montre connectée S2', 'Objets connectés', 'mi:watch', 260],
  ['Ordinateur portable 14"', 'Informatique', 'mi:laptop-mac', 220],
  ['Écran 27" QHD', 'Informatique', 'mi:monitor', 200],
  ['Clavier mécanique', 'Informatique', 'mi:keyboard', 280],
  ['Smartphone X12', 'Téléphonie', 'mi:smartphone', 170],
  ['Tablette 11"', 'Téléphonie', 'mi:tablet', 160],
  ['Appareil photo hybride', 'Photo', 'mi:photo-camera', 20],
  ['Drone compact', 'Photo', 'mi:flight', 30],
  ['Console portable', 'Jeux', 'mi:sports-esports', 300],
  ['Routeur Wi-Fi 6', 'Réseau', 'mi:router', 140],
];

export const EX_PRODUCTS: ExProduct[] = PRODUCTS.map(([name, category, icon, hue], i) => ({
  id: `p-${i + 1}`,
  name,
  category,
  icon,
  hue,
  price: (((i * 37) % 23) + 4) * 15000,
  rating: 3.5 + ((i * 7) % 15) / 10,
  stock: (i * 17) % 9 === 0 ? 0 : (i * 17) % 40,
  badge: i % 5 === 0 ? 'Nouveau' : i % 4 === 1 ? '-20 %' : undefined,
}));
export const EX_CATEGORIES = [...new Set(EX_PRODUCTS.map((p) => p.category))];

export const EX_MODULES: {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  count?: string;
  badge?: number;
}[] = [
  {
    id: 'crm',
    label: 'Clients',
    icon: 'mi:groups',
    description: 'Comptes, contacts et opportunités',
    color: '#0ea5e9',
    count: '1 248 comptes',
    badge: 3,
  },
  {
    id: 'billing',
    label: 'Facturation',
    icon: 'mi:receipt-long',
    description: 'Devis, factures, encaissements',
    color: '#10b981',
    count: '86 factures ce mois',
  },
  {
    id: 'stock',
    label: 'Stocks',
    icon: 'mi:inventory-2',
    description: 'Articles, entrepôts, mouvements',
    color: '#f59e0b',
    count: '4 entrepôts',
  },
  {
    id: 'planning',
    label: 'Planning',
    icon: 'mi:calendar-month',
    description: 'Interventions et rendez-vous',
    color: '#8b5cf6',
    count: '14 aujourd’hui',
    badge: 2,
  },
  {
    id: 'fleet',
    label: 'Flotte',
    icon: 'mi:local-shipping',
    description: 'Véhicules, trajets, balises',
    color: '#ef4444',
    count: '62 véhicules',
  },
  {
    id: 'hr',
    label: 'Ressources humaines',
    icon: 'mi:badge',
    description: 'Employés, congés, paie',
    color: '#ec4899',
    count: '138 employés',
  },
  {
    id: 'docs',
    label: 'Documents',
    icon: 'mi:folder-open',
    description: 'GED, modèles, signatures',
    color: '#64748b',
    count: '2,4 Go',
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: 'mi:insights',
    description: 'Tableaux de bord et exports',
    color: '#06b6d4',
    count: '18 rapports',
  },
  {
    id: 'support',
    label: 'Support',
    icon: 'mi:support-agent',
    description: 'Tickets et base de connaissances',
    color: '#f97316',
    count: '7 tickets ouverts',
    badge: 7,
  },
  {
    id: 'settings',
    label: 'Administration',
    icon: 'mi:admin-panel-settings',
    description: 'Utilisateurs, rôles, intégrations',
    color: '#475569',
  },
];

// ─── Contenus : articles, commentaires, documentation ──────────────────────

export interface Person {
  name: string;
  color: string;
  role: string;
  bio?: string;
}

const P = {
  me: { name: 'Jean Kouassi', color: '#0ea5e9', role: 'Administrateur' },
  aya: { name: 'Aya Koné', color: '#8b5cf6', role: 'Opérations' },
  marc: { name: 'Marc Yao', color: '#10b981', role: 'Développeur' },
  grace: { name: 'Grace Kouamé', color: '#f59e0b', role: 'Designer' },
  ibrahim: { name: 'Ibrahim Sanogo', color: '#ef4444', role: 'Produit' },
  nadia: { name: 'Nadia Touré', color: '#ec4899', role: 'Rédaction' },
  koffi: { name: 'Koffi N’Guessan', color: '#0891b2', role: 'Technicien' },
  fatou: { name: 'Fatou Diabaté', color: '#7c3aed', role: 'Juridique' },
} satisfies Record<string, Person>;

/** Bloc d'article ; le texte garde le Markdown en ligne de la source. */
export type ArticleBlock =
  | { type: 'lead' | 'h2' | 'h3' | 'pullquote'; text: string }
  | { type: 'p'; text: string; dropcap?: boolean }
  | { type: 'list'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { type: 'callout'; tone: 'info' | 'success' | 'warning' | 'neutral'; title?: string; text: string }
  | { type: 'code'; code: string; lang: string; filename?: string }
  | { type: 'figure'; icon: string; caption: string }
  | { type: 'quote'; text: string; cite: string }
  | { type: 'divider' };

const LONG: ArticleBlock[] = [
  {
    type: 'lead',
    text: 'Un design system n’est pas une bibliothèque de boutons. C’est un **langage commun** entre designers, développeurs et métiers — et comme tout langage, il vit, s’use et se réforme.',
  },
  {
    type: 'p',
    dropcap: true,
    text: 'Il y a deux ans, notre application comptait quatorze nuances de bleu, neuf tailles de titres et autant de façons d’afficher une date. Chaque écran était cohérent avec lui-même, aucun ne l’était avec ses voisins. Les équipes livraient vite, mais chaque nouvelle page ajoutait un peu plus de dette visuelle.',
  },
  {
    type: 'p',
    text: 'Nous avons alors pris une décision simple : avant d’ajouter un composant, nous le cherchons dans le kit. S’il n’existe pas, nous le construisons **dans** le kit, documenté et testé, puis nous l’utilisons.',
  },
  { type: 'h2', text: 'Commencer par la typographie' },
  {
    type: 'p',
    text: 'La typographie porte 90 % de l’interface. Avant les couleurs, avant les composants, nous avons fixé une échelle : un ratio de 1,2 (tierce mineure), arrondi sur une grille de 2 px. Deux familles seulement : *Outfit* pour les titres, *Inter* pour le texte.',
  },
  {
    type: 'table',
    caption: 'Échelle typographique retenue (px).',
    head: ['Rôle', 'Taille', 'Interlignage', 'Graisse'],
    rows: [
      ['Display', '40', '1,15', '700'],
      ['Titre 1', '32', '1,2', '700'],
      ['Titre 2', '24', '1,25', '600'],
      ['Corps', '14 – 16', '1,55', '400'],
      ['Légende', '12', '1,4', '400'],
    ],
  },
  {
    type: 'callout',
    tone: 'info',
    title: 'La mesure compte',
    text: 'Une ligne de texte confortable fait entre **60 et 75 caractères**. Au-delà, l’œil peine à retrouver le début de la ligne suivante : nous plafonnons le corps de texte à `68ch`.',
  },
  { type: 'h3', text: 'Les règles de la typographie française' },
  {
    type: 'p',
    text: 'Le français a ses propres conventions : espace insécable avant les signes doubles, guillemets « chevrons », apostrophe typographique, séparateur de milliers en espace fine. Nous les appliquons automatiquement à la saisie.',
  },
  {
    type: 'list',
    items: [
      'Espace fine insécable avant `; ! ?` et espace insécable avant `:`',
      'Guillemets « … » avec espaces insécables intérieures',
      'Montants : 1 250 000 FCFA, heures : 14 h 05',
      'Points de suspension en un seul caractère (…)',
    ],
  },
  {
    type: 'pullquote',
    text: 'Un composant qui n’est pas documenté n’existe pas. Un composant documenté mais pas utilisé non plus.',
  },
  { type: 'h2', text: 'Des jetons plutôt que des valeurs' },
  {
    type: 'p',
    text: 'Chaque couleur est un **rôle**, jamais une valeur : `--primary-color`, `--text-secondary`, `--border-color`. Le mode sombre et les 41 thèmes de couleur deviennent alors un simple changement de jeu de jetons.',
  },
  {
    type: 'code',
    lang: 'scss',
    filename: 'styles/_tokens.scss',
    code: ':root {\n  --primary-color: var(--mat-sys-primary);\n  --text-primary: #1f2937;\n  --text-secondary: #4b5563;\n  --border-color: #e5e7eb;\n  --radius-card: 24px;\n}\n\n.card {\n  border: 1px solid var(--border-color);\n  border-radius: var(--radius-card);\n}',
  },
  {
    type: 'figure',
    icon: 'mi:palette',
    caption: 'Les rôles de couleur Material 3, déclinés en clair et en sombre pour chaque thème.',
  },
  { type: 'h2', text: 'Mesurer l’adoption' },
  {
    type: 'p',
    text: 'Un kit se juge à son usage. Chaque mois, nous comptons les composants maison encore présents dans le code et les écarts de style relevés en revue.',
  },
  {
    type: 'quote',
    text: 'Le jour où un nouvel arrivant a livré un écran complet sans écrire une ligne de CSS, nous avons su que le kit avait gagné.',
    cite: 'Grace Kouamé, lead design',
  },
  {
    type: 'callout',
    tone: 'success',
    title: 'Résultat après 18 mois',
    text: '84 % des écrans n’utilisent que des composants du kit, et le temps moyen de conception d’une page est passé de 5 à 2 jours.',
  },
  { type: 'divider' },
  {
    type: 'p',
    text: 'Il reste du chemin : l’accessibilité des graphiques, la densité des tableaux sur mobile, les formulaires très longs. Ce sera l’objet des prochains articles.',
  },
];

const short = (lead: string, h: string): ArticleBlock[] => [
  { type: 'lead', text: lead },
  {
    type: 'p',
    text: 'Cet article d’exemple illustre la mise en page éditoriale du kit : chapô, intertitres, listes, encadrés et citations, avec une mesure de ligne confortable.',
  },
  { type: 'h2', text: h },
  {
    type: 'p',
    text: 'Les données sont statiques. Ouvrez l’article principal pour voir l’ensemble des blocs disponibles et le fil de commentaires complet.',
  },
  {
    type: 'callout',
    tone: 'neutral',
    text: 'Astuce : tous les blocs acceptent le Markdown en ligne, **gras**, *italique*, `code` et [liens](#).',
  },
];

export interface Article {
  slug: string;
  title: string;
  dek: string;
  category: string;
  tags: string[];
  author: Person;
  date: string;
  minutes: number;
  hue: number;
  icon: string;
  blocks: ArticleBlock[];
  featured?: boolean;
}

export const ARTICLES: Article[] = [
  {
    slug: 'design-system-langage-commun',
    title: 'Un design system, c’est d’abord un langage commun',
    dek: 'Ce que deux ans de composants partagés nous ont appris sur la typographie, les jetons et l’adoption.',
    category: 'Design',
    tags: ['design system', 'typographie', 'jetons'],
    author: {
      name: 'Grace Kouamé',
      color: '#f59e0b',
      role: 'Lead design',
      bio: 'Designer produit à Abidjan, Grace anime l’équipe design system et la communauté UI Kit.',
    },
    date: '2026-10-14',
    minutes: 8,
    hue: 185,
    icon: 'mi:auto-stories',
    featured: true,
    blocks: LONG,
  },
  {
    slug: 'formulaires-longs-sans-douleur',
    title: 'Des formulaires longs, sans douleur',
    dek: 'Découper, enregistrer en continu, valider au bon moment : nos règles pour les formulaires de plus de 20 champs.',
    category: 'UX',
    tags: ['formulaires', 'validation'],
    author: P.nadia,
    date: '2026-10-09',
    minutes: 6,
    hue: 280,
    icon: 'mi:dynamic-form',
    blocks: short(
      'Un formulaire long n’est pas un mauvais formulaire : c’est un formulaire mal découpé.',
      'Une étape, une intention',
    ),
  },
  {
    slug: 'mobile-money-paiement',
    title: 'Intégrer le Mobile Money dans un tunnel de paiement',
    dek: 'Orange Money, MTN MoMo, Wave : concevoir un parcours clair quand la confirmation arrive par SMS.',
    category: 'Produit',
    tags: ['paiement', 'mobile'],
    author: P.ibrahim,
    date: '2026-10-02',
    minutes: 5,
    hue: 30,
    icon: 'mi:phone-iphone',
    blocks: short('Le paiement mobile est la norme : le tunnel doit l’être aussi.', 'Attendre la confirmation'),
  },
  {
    slug: 'mode-sombre-sans-regret',
    title: 'Le mode sombre, sans regret',
    dek: 'Contrastes, élévation, images : les pièges du thème sombre et comment les éviter.',
    category: 'Design',
    tags: ['thème', 'accessibilité'],
    author: P.marc,
    date: '2026-09-25',
    minutes: 4,
    hue: 230,
    icon: 'mi:dark-mode',
    blocks: short('Inverser les couleurs ne suffit pas.', 'L’élévation par la lumière'),
  },
  {
    slug: 'tableaux-sur-mobile',
    title: 'Que faire des tableaux sur mobile ?',
    dek: 'Cartes, colonnes prioritaires, défilement horizontal : comparaison de quatre stratégies.',
    category: 'UX',
    tags: ['responsive', 'tableaux'],
    author: P.aya,
    date: '2026-09-18',
    minutes: 7,
    hue: 150,
    icon: 'mi:table-rows',
    blocks: short('Un tableau de 8 colonnes ne tiendra jamais dans 393 px.', 'Choisir ce qui compte'),
  },
  {
    slug: 'ecrire-pour-interface',
    title: 'Écrire pour l’interface',
    dek: 'Boutons, erreurs, états vides : le microtexte est une partie du design.',
    category: 'Rédaction',
    tags: ['UX writing'],
    author: P.nadia,
    date: '2026-09-11',
    minutes: 5,
    hue: 340,
    icon: 'mi:edit-note',
    blocks: short('Un bon libellé de bouton dit ce qui va se passer.', 'Verbes d’action'),
  },
];
export const BLOG_CATEGORIES = ['Tous', ...new Set(ARTICLES.map((a) => a.category))];

export interface CommentItem {
  id: string;
  author: Person;
  at: string;
  likes: number;
  text: string;
  byAuthor?: boolean;
  pinned?: boolean;
  reactions?: [string, number][];
  replies?: CommentItem[];
}

export const COMMENTS: CommentItem[] = [
  {
    id: 'k1',
    author: P.grace,
    at: 'il y a 2 j',
    likes: 24,
    text: 'Merci pour vos retours ! Le prochain article portera sur **la densité des tableaux sur mobile**. Dites-moi en réponse ce que vous aimeriez y voir.',
    byAuthor: true,
    pinned: true,
    reactions: [
      ['🎉', 6],
      ['❤️', 3],
    ],
    replies: [
      {
        id: 'k1a',
        author: P.marc,
        at: 'il y a 2 j',
        likes: 5,
        text: 'Les colonnes figées et le défilement horizontal, surtout avec la sélection multiple.',
      },
      {
        id: 'k1b',
        author: P.aya,
        at: 'il y a 1 j',
        likes: 2,
        text: '@Marc-Yao +1, et les actions groupées : sur mobile on ne sait jamais où les mettre.',
      },
      {
        id: 'k1c',
        author: P.ibrahim,
        at: 'il y a 20 h',
        likes: 1,
        text: 'Et les filtres ! Une feuille du bas (*bottom sheet*) marche bien chez nous.',
      },
      { id: 'k1d', author: P.grace, at: 'il y a 18 h', likes: 3, text: 'Noté, merci à tous 🙏', byAuthor: true },
    ],
  },
  {
    id: 'k2',
    author: P.marc,
    at: 'il y a 1 j',
    likes: 12,
    text: 'Le passage sur les jetons est exactement ce qu’il nous manquait. Petite question : vous générez les palettes à la compilation ou à l’exécution ?\n\n```\nnode tools/generate-themes.mjs\n```',
    replies: [
      {
        id: 'k2a',
        author: P.grace,
        at: 'il y a 1 j',
        likes: 4,
        text: 'À la compilation pour les 41 thèmes prédéfinis, à l’exécution pour le **studio de thème** (couleur personnalisée).',
        byAuthor: true,
      },
    ],
  },
  {
    id: 'k3',
    author: P.nadia,
    at: 'il y a 9 h',
    likes: 7,
    text: 'Bravo pour la partie typographie française. Les espaces fines avant `?` et `!` sont trop souvent oubliées.',
    reactions: [['👍', 4]],
  },
  {
    id: 'k4',
    author: P.aya,
    at: 'il y a 3 h',
    likes: 1,
    text: 'Est-ce que le kit est utilisable dans une application Flutter aussi ?',
  },
];

export interface DocNode {
  label: string;
  slug?: string;
  icon?: string;
  badge?: string;
  children?: DocNode[];
}

export const DOCS_NAV: DocNode[] = [
  {
    label: 'Prise en main',
    icon: 'mi:rocket-launch',
    children: [
      { label: 'Introduction', slug: 'introduction' },
      { label: 'Installation', slug: 'installation', badge: 'v2' },
      { label: 'Thèmes', slug: 'themes' },
    ],
  },
  {
    label: 'Fondations',
    icon: 'mi:foundation',
    children: [
      { label: 'Typographie', slug: 'typographie' },
      { label: 'Couleurs', slug: 'couleurs' },
      { label: 'Espacements', slug: 'espacements' },
    ],
  },
  {
    label: 'Composants',
    icon: 'mi:widgets',
    children: [
      { label: 'Boutons', slug: 'boutons' },
      { label: 'Formulaires', slug: 'formulaires' },
      { label: 'Commentaires', slug: 'commentaires', badge: 'Nouveau' },
      { label: 'Article', slug: 'article', badge: 'Nouveau' },
    ],
  },
  {
    label: 'Guides',
    icon: 'mi:menu-book',
    children: [
      { label: 'Accessibilité', slug: 'accessibilite' },
      { label: 'Contribuer', slug: 'contribuer' },
    ],
  },
];

export const DOC_PAGE: ArticleBlock[] = [
  {
    type: 'lead',
    text: '`<app-comment-thread>` affiche un fil de discussion complet : saisie, tri, réponses imbriquées, réactions, modification et suppression.',
  },
  { type: 'h2', text: 'Utilisation' },
  {
    type: 'code',
    lang: 'html',
    filename: 'article.component.html',
    code: '<app-comment-thread\n  [comments]="comments"\n  [me]="currentUser"\n  [mentionables]="team"\n  moderator\n  (changed)="save($event)" />',
  },
  {
    type: 'p',
    text: 'Le composant garde une copie locale de la liste : les interactions sont immédiates, et chaque modification est émise via `changed` pour que l’hôte la persiste.',
  },
  { type: 'h2', text: 'Propriétés' },
  {
    type: 'table',
    head: ['Entrée', 'Type', 'Défaut', 'Description'],
    rows: [
      ['`comments`', '`CommentItem[]`', '`[]`', 'Commentaires et réponses.'],
      ['`me`', '`CommentAuthor`', '`null`', 'Utilisateur courant (droits de modification).'],
      ['`mentionables`', '`CommentAuthor[]`', '`[]`', 'Personnes proposées après « @ ».'],
      ['`compact`', '`boolean`', '`false`', 'Variante resserrée, saisie en bas.'],
      ['`moderator`', '`boolean`', '`false`', 'Autorise l’épinglage.'],
      ['`visibleReplies`', '`number`', '`2`', 'Réponses visibles avant « Afficher plus ».'],
    ],
  },
  { type: 'h3', text: 'Saisie seule' },
  {
    type: 'p',
    text: '`<app-comment-composer>` peut être utilisé seul : barre de mise en forme Markdown, mentions, aperçu, compteur et envoi par ⌘/Ctrl + Entrée.',
  },
  {
    type: 'callout',
    tone: 'warning',
    title: 'Contenu utilisateur',
    text: 'Le texte est échappé avant le rendu Markdown : aucun HTML saisi n’est interprété.',
  },
  { type: 'h2', text: 'Accessibilité' },
  {
    type: 'list',
    items: [
      'Les boutons J’aime et réactions exposent `aria-pressed`.',
      'Les mentions se naviguent au clavier (↑ ↓ Entrée Échap).',
      'Chaque commentaire a une ancre `#comment-<id>` partageable.',
    ],
  },
];

// ─── Tableau de bord ────────────────────────────────────────────────────────

export interface DashPeriod {
  id: string;
  label: string;
  compare: string;
  kpi: number[];
  trend: number[];
  labels: string[];
  a: number[];
  b: number[];
}

export const DASH_PERIODS: DashPeriod[] = [
  {
    id: '7j',
    label: '7 jours',
    compare: 'vs semaine précédente',
    kpi: [27.9e6, 22.1e6, 9, 7.3e6],
    trend: [6.2, 4.8, 12.5, -3.1],
    labels: ['Sam', 'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    a: [2.1, 0.8, 4.6, 5.2, 3.9, 6.1, 5.4],
    b: [1.8, 0.6, 3.1, 4.4, 3.2, 4.9, 4.1],
  },
  {
    id: '30j',
    label: '30 jours',
    compare: 'vs mois précédent',
    kpi: [119e6, 96.1e6, 38, 7.3e6],
    trend: [9.4, 8.1, 4.6, -2.3],
    labels: ['S1', 'S2', 'S3', 'S4'],
    a: [24, 31, 28, 36],
    b: [19, 26, 24, 27],
  },
  {
    id: '12m',
    label: '12 mois',
    compare: 'vs année précédente',
    kpi: [1.14e9, 0.99e9, 412, 7.3e6],
    trend: [12.4, 10.2, 18.0, -8.5],
    labels: ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct'],
    a: [82, 95, 71, 78, 90, 99, 104, 97, 88, 93, 115, 128],
    b: [70, 81, 66, 70, 79, 84, 92, 85, 80, 82, 98, 96],
  },
];

/** (libellé, icône, unité, hausse = bonne nouvelle) */
export const DASH_KPIS: [string, string, string, boolean][] = [
  ['Chiffre d’affaires', 'mi:payments', 'FCFA', true],
  ['Encaissé', 'mi:account-balance-wallet', 'FCFA', true],
  ['Nouveaux clients', 'mi:person-add', '', true],
  ['Impayés', 'mi:schedule', 'FCFA', false],
];

export const DASH_TABS: [string, string][] = [
  ['Vue d’ensemble', 'mi:space-dashboard'],
  ['Ventes', 'mi:bar-chart'],
  ['Clients', 'mi:pie-chart'],
  ['Opérations', 'mi:insights'],
];

export const DASH_GOALS: [string, number, string][] = [
  ['Chiffre d’affaires', 72, '128,4 M sur 178 M FCFA'],
  ['Taux d’encaissement', 88, 'Cible 90 %'],
  ['Nouveaux comptes', 45, '38 sur 85'],
];

// ─── Kanban ─────────────────────────────────────────────────────────────────

export const BOARD_COLUMNS: [string, string, KitTone][] = [
  ['todo', 'À faire', 'neutral'],
  ['doing', 'En cours', 'info'],
  ['review', 'En revue', 'warning'],
  ['done', 'Terminé', 'success'],
];

export interface BoardTask {
  id: string;
  ref: string;
  title: string;
  status: string;
  assignee: string;
  progress?: number;
  badge?: [string, KitTone];
  tags?: string[];
}

export const BOARD_TASKS: BoardTask[] = [
  {
    id: 't1',
    ref: 'SOT-101',
    title: 'Audit des entrepôts de Vridi',
    status: 'todo',
    assignee: 'Marc Yao',
    badge: ['Terrain', 'info'],
  },
  {
    id: 't2',
    ref: 'SOT-102',
    title: 'Import des 1 200 références articles',
    status: 'todo',
    assignee: 'Aïcha Diallo',
    tags: ['data'],
  },
  {
    id: 't3',
    ref: 'SOT-103',
    title: 'Paramétrage des tarifs transport',
    status: 'todo',
    assignee: 'Jean Kouassi',
    badge: ['Urgent', 'error'],
  },
  {
    id: 't4',
    ref: 'SOT-097',
    title: 'Formation des chefs de quai',
    status: 'doing',
    assignee: 'Sarah Bamba',
    progress: 60,
  },
  {
    id: 't5',
    ref: 'SOT-098',
    title: 'Connexion API balises GPS',
    status: 'doing',
    assignee: 'Marc Yao',
    progress: 35,
    badge: ['Technique', 'purple'],
  },
  {
    id: 't6',
    ref: 'SOT-099',
    title: 'Modèles de bons de livraison',
    status: 'doing',
    assignee: 'Aïcha Diallo',
    progress: 80,
  },
  {
    id: 't7',
    ref: 'SOT-094',
    title: 'Recette du module facturation',
    status: 'review',
    assignee: 'Jean Kouassi',
    progress: 90,
  },
  { id: 't8', ref: 'SOT-095', title: 'Droits d’accès par site', status: 'review', assignee: 'Sarah Bamba' },
  { id: 't9', ref: 'SOT-090', title: 'Atelier de cadrage', status: 'done', assignee: 'Jean Kouassi', progress: 100 },
  {
    id: 't10',
    ref: 'SOT-091',
    title: 'Création des comptes utilisateurs',
    status: 'done',
    assignee: 'Aïcha Diallo',
    progress: 100,
  },
];

// ─── Supervision ────────────────────────────────────────────────────────────

export type ServiceHealth = 'up' | 'degraded' | 'down' | 'maintenance';

/** (id, nom, groupe, icône, statut, disponibilité 90 j, latence ms) */
export const MON_SERVICES: [string, string, string, string, ServiceHealth, number, number][] = [
  ['api', 'API publique', 'Plateforme', 'mi:api', 'up', 99.98, 84],
  ['pay', 'Paiements Mobile Money', 'Plateforme', 'mi:payments', 'degraded', 99.71, 412],
  ['web', 'Application web', 'Plateforme', 'mi:language', 'up', 99.99, 120],
  ['mobile', 'API mobile', 'Plateforme', 'mi:smartphone', 'up', 99.95, 96],
  ['gps', 'Passerelle GPS (balises)', 'Terrain', 'mi:satellite-alt', 'up', 99.9, 38],
  ['sms', 'Envoi SMS', 'Tiers', 'mi:sms', 'up', 99.6, 640],
  ['mail', 'E-mails transactionnels', 'Tiers', 'mi:mail', 'maintenance', 99.92, 230],
  ['backup', 'Sauvegardes', 'Infrastructure', 'mi:backup', 'up', 100.0, 0],
];

export const MON_HEALTH: Record<ServiceHealth, [string, KitTone]> = {
  up: ['Opérationnel', 'success'],
  degraded: ['Dégradé', 'warning'],
  down: ['Panne', 'error'],
  maintenance: ['Maintenance', 'info'],
};

/** (id, titre, gravité, statut, début, service, responsable) */
export const MON_INCIDENTS: [string, string, string, string, string, string, string][] = [
  [
    'INC-214',
    'Latence élevée sur les callbacks Mobile Money',
    'majeur',
    'en cours',
    'il y a 38 min',
    'Paiements',
    'Marc Yao',
  ],
  [
    'INC-213',
    'Échec de l’export Sage nocturne',
    'mineur',
    'surveillance',
    'il y a 7 h',
    'Tâches planifiées',
    'Fatou Diabaté',
  ],
  ['INC-211', 'Perte de signal de 2 balises sur l’axe nord', 'mineur', 'résolu', 'hier', 'Passerelle GPS', 'Aya Koné'],
  [
    'INC-207',
    'Indisponibilité partielle des SMS (opérateur)',
    'critique',
    'résolu',
    'il y a 3 j',
    'Envoi SMS',
    'Ibrahim Sanogo',
  ],
];

/** (nom, planification, dernière exécution, durée, statut) */
export const MON_JOBS: [string, string, string, string, 'ok' | 'running' | 'failed'][] = [
  ['Relances automatiques', 'Chaque jour · 09:00', 'aujourd’hui 09:00', '42 s', 'ok'],
  ['Synchronisation comptable', 'Toutes les heures', 'il y a 12 min', '3 min 08', 'running'],
  ['Export Sage', 'Chaque nuit · 02:00', 'aujourd’hui 02:00', '—', 'failed'],
  ['Sauvegarde complète', 'Chaque nuit · 03:30', 'aujourd’hui 03:30', '18 min', 'ok'],
  ['Purge des journaux', 'Dimanche · 04:00', 'il y a 5 j', '1 min 12', 'ok'],
];

/** (libellé, valeur, unité, icône, indication) */
export const MON_KPIS: [string, string, string, string, string][] = [
  ['Disponibilité (30 j)', '99,94', '%', 'mi:verified', 'SLO 99,9 %'],
  ['Latence p95', '184', 'ms', 'mi:speed', 'objectif < 250 ms'],
  ['Taux d’erreur', '0,42', '%', 'mi:error-outline', '5xx / total'],
  ['Alertes actives', '3', '', 'mi:notifications-active', '1 critique'],
];

// ─── Messagerie instantanée ─────────────────────────────────────────────────

export interface ChatPerson {
  id: string;
  name: string;
  color: string;
  role: string;
  online: boolean;
}

export const CHAT_PEOPLE: ChatPerson[] = [
  { id: 'me', name: 'Jean Kouassi', color: '#0ea5e9', role: 'Administrateur', online: true },
  { id: 'aya', name: 'Aya Koné', color: '#8b5cf6', role: 'Opérations', online: true },
  { id: 'marc', name: 'Marc Yao', color: '#10b981', role: 'Développeur', online: true },
  { id: 'grace', name: 'Grace Kouamé', color: '#f59e0b', role: 'Designer', online: false },
  { id: 'ibrahim', name: 'Ibrahim Sanogo', color: '#ef4444', role: 'Produit', online: true },
  { id: 'fatou', name: 'Fatou Diabaté', color: '#7c3aed', role: 'Juridique', online: false },
  { id: 'koffi', name: 'Koffi N’Guessan', color: '#0891b2', role: 'Technicien', online: true },
  { id: 'sarah', name: 'Sarah Bamba', color: '#db2777', role: 'Formation', online: false },
];
export const chatPerson = (id: string) => CHAT_PEOPLE.find((p) => p.id === id) ?? CHAT_PEOPLE[0]!;

export interface ChatConv {
  id: string;
  kind: 'direct' | 'group' | 'channel';
  name: string;
  members: string[];
  unread: number;
  pinned?: boolean;
  muted?: boolean;
  description?: string;
  /** (auteur, texte) ; texte vide = note vocale ; auteur `system` = message système. */
  messages: [string, string][];
}

export const chatTitle = (c: ChatConv) =>
  c.kind === 'direct' ? chatPerson(c.members[1]!).name : c.kind === 'channel' ? `# ${c.name}` : c.name;

export const CHAT_CONVERSATIONS: ChatConv[] = [
  {
    id: 'c-aya',
    kind: 'direct',
    name: '',
    members: ['me', 'aya'],
    unread: 2,
    pinned: true,
    messages: [
      ['aya', 'Bonjour Jean, tu as pu valider le planning de jeudi ?'],
      ['me', 'Oui, c’est validé. Le camion arrive à 8 h.'],
      ['aya', 'Top. Je préviens l’équipe du quai.'],
      ['aya', 'Les quais 2 et 3 sont prêts 📦'],
      ['aya', 'On a aussi reçu le bon de livraison signé.'],
      ['me', 'Excellent travail, merci à toute l’équipe !'],
      ['aya', 'Merci ! Petite question : on garde le créneau de 8 h pour le lot 15 ?'],
      ['aya', 'Ou on décale à 9 h à cause de la marée ?'],
    ],
  },
  {
    id: 'c-ops',
    kind: 'group',
    name: 'Équipe opérations',
    members: ['me', 'aya', 'koffi', 'sarah', 'marc'],
    unread: 5,
    description: 'Coordination terrain, livraisons et interventions.',
    messages: [
      ['system', 'Jean a créé le groupe « Équipe opérations »'],
      ['koffi', 'Installation terminée chez Transports Yao, 12 balises posées.'],
      ['sarah', 'Formation des chefs de quai : 8 personnes inscrites pour lundi.'],
      ['koffi', ''],
      ['aya', 'Koffi, tu peux passer à Vridi après ?'],
      ['koffi', 'Oui, j’y serai vers 14 h.'],
      ['marc', 'La connexion API des balises est en recette, retours bienvenus 🙌'],
    ],
  },
  {
    id: 'c-marc',
    kind: 'direct',
    name: '',
    members: ['me', 'marc'],
    unread: 0,
    messages: [
      ['marc', 'Le client a validé la proposition à 12,4 M FCFA.'],
      ['me', 'Génial 🎉 On prépare le contrat pour lundi ?'],
      ['marc', 'Oui, je m’en occupe.'],
    ],
  },
  {
    id: 'c-general',
    kind: 'channel',
    name: 'général',
    members: ['me', 'aya', 'marc', 'grace', 'ibrahim', 'fatou', 'koffi', 'sarah'],
    unread: 0,
    muted: true,
    description: 'Annonces et informations pour toute l’entreprise.',
    messages: [
      ['ibrahim', 'La version 2.4 est en production : export PDF corrigé, nouveaux rapports.'],
      ['grace', 'Les nouvelles illustrations du site sont en ligne ✨'],
    ],
  },
  {
    id: 'c-fatou',
    kind: 'direct',
    name: '',
    members: ['me', 'fatou'],
    unread: 0,
    messages: [
      ['fatou', 'Voici la version signée du contrat cadre.'],
      ['me', 'Merci Fatou, je classe ça dans le dossier Contrats.'],
    ],
  },
  {
    id: 'c-grace',
    kind: 'direct',
    name: '',
    members: ['me', 'grace'],
    unread: 0,
    messages: [
      ['grace', 'Tu as un moment pour revoir les maquettes du tableau de bord ?'],
      ['me', 'Demain matin si ça te va.'],
    ],
  },
];

// ─── Fichiers ───────────────────────────────────────────────────────────────

export type FmKind = 'folder' | 'image' | 'video' | 'audio' | 'pdf' | 'sheet' | 'slides' | 'doc' | 'text' | 'archive';

export interface FmItem {
  id: string;
  name: string;
  kind: FmKind;
  parent: string | null;
  days: number;
  owner: string;
  size?: number;
  color?: string;
  shared?: boolean;
  starred?: boolean;
}

/** `FM_KINDS` : libellé, icône, couleur. */
export const FM_KINDS: Record<FmKind, [string, string, string]> = {
  folder: ['Dossier', 'mi:folder', '#64748b'],
  image: ['Image', 'mi:image', '#8b5cf6'],
  video: ['Vidéo', 'mi:movie', '#ec4899'],
  audio: ['Audio', 'mi:audiotrack', '#f59e0b'],
  pdf: ['PDF', 'mi:picture-as-pdf', '#ef4444'],
  sheet: ['Tableur', 'mi:table-chart', '#10b981'],
  slides: ['Présentation', 'mi:slideshow', '#f97316'],
  doc: ['Document', 'mi:description', '#3b82f6'],
  text: ['Texte', 'mi:article', '#0ea5e9'],
  archive: ['Archive', 'mi:folder-zip', '#78716c'],
};

const PHOTO_CAPTIONS = [
  'Flotte stationnée - Plateau',
  'Dépôt de Yopougon au coucher du soleil',
  'Axe Abidjan - Yamoussoukro',
  'Port de San-Pédro',
  'Atelier d’installation des balises',
];

export const FM_ITEMS: FmItem[] = [
  { id: 'docs', name: 'Documents', kind: 'folder', parent: null, days: 1, owner: 'Jean Kouassi', color: '#3b82f6' },
  {
    id: 'contracts',
    name: 'Contrats',
    kind: 'folder',
    parent: 'docs',
    days: 3,
    owner: 'Jean Kouassi',
    color: '#3b82f6',
    shared: true,
  },
  {
    id: 'invoices',
    name: 'Factures 2026',
    kind: 'folder',
    parent: 'docs',
    days: 0,
    owner: 'Jean Kouassi',
    color: '#10b981',
  },
  {
    id: 'photos',
    name: 'Photos terrain',
    kind: 'folder',
    parent: null,
    days: 2,
    owner: 'Jean Kouassi',
    color: '#8b5cf6',
    starred: true,
  },
  { id: 'media', name: 'Médias', kind: 'folder', parent: null, days: 4, owner: 'Jean Kouassi', color: '#ec4899' },
  {
    id: 'sotra',
    name: 'Projet Sotra',
    kind: 'folder',
    parent: null,
    days: 1,
    owner: 'Jean Kouassi',
    color: '#f59e0b',
    shared: true,
    starred: true,
  },
  {
    id: 'f1',
    name: 'Contrat cadre 2026.pdf',
    kind: 'pdf',
    parent: 'contracts',
    days: 3,
    owner: 'Fatou Diabaté',
    starred: true,
    shared: true,
  },
  {
    id: 'f2',
    name: 'Avenant n°2 — Cacao Plus.pdf',
    kind: 'pdf',
    parent: 'contracts',
    days: 12,
    owner: 'Fatou Diabaté',
  },
  { id: 'f3', name: 'FAC-2026-0981.pdf', kind: 'pdf', parent: 'invoices', days: 0, owner: 'Jean Kouassi' },
  { id: 'f4', name: 'FAC-2026-0974.pdf', kind: 'pdf', parent: 'invoices', days: 5, owner: 'Jean Kouassi' },
  {
    id: 'f5',
    name: 'Relevé septembre.xlsx',
    kind: 'sheet',
    parent: 'invoices',
    days: 9,
    owner: 'Fatou Diabaté',
    size: 184320,
  },
  { id: 'f6', name: 'Clients actifs.csv', kind: 'text', parent: 'docs', days: 1, owner: 'Aïcha Diallo' },
  {
    id: 'f7',
    name: 'Compte rendu atelier.txt',
    kind: 'text',
    parent: 'docs',
    days: 2,
    owner: 'Grace Kouamé',
    shared: true,
  },
  {
    id: 'f8',
    name: 'Présentation T4.pptx',
    kind: 'slides',
    parent: 'docs',
    days: 6,
    owner: 'Ibrahim Sanogo',
    size: 4812000,
  },
  {
    id: 'f9',
    name: 'Procédure d’installation.docx',
    kind: 'doc',
    parent: 'docs',
    days: 20,
    owner: 'Marc Yao',
    size: 642000,
  },
  ...Array.from({ length: 7 }, (_, i): FmItem => ({
    id: `ph${i}`,
    name: `${PHOTO_CAPTIONS[i % 5]}.jpg`,
    kind: 'image',
    parent: 'photos',
    days: i,
    owner: i % 2 === 1 ? 'Aya Koné' : 'Marc Yao',
  })),
  ...Array.from({ length: 3 }, (_, i): FmItem => ({
    id: `q${i}`,
    name: `Quai ${i + 2} - Vridi.jpg`,
    kind: 'image',
    parent: 'sotra',
    days: i + 1,
    owner: 'Aya Koné',
  })),
  {
    id: 'f10',
    name: 'Message vocal - technicien.wav',
    kind: 'audio',
    parent: 'media',
    days: 1,
    owner: 'Koffi N’Guessan',
  },
  { id: 'f11', name: 'Appel client - Transports Yao.wav', kind: 'audio', parent: 'media', days: 6, owner: 'Support' },
  {
    id: 'f12',
    name: 'Archives 2025.zip',
    kind: 'archive',
    parent: 'media',
    days: 40,
    owner: 'Jean Kouassi',
    size: 412000000,
  },
  {
    id: 'f13',
    name: 'Planning de déploiement.pdf',
    kind: 'pdf',
    parent: 'sotra',
    days: 1,
    owner: 'Jean Kouassi',
    shared: true,
  },
  {
    id: 'f14',
    name: 'Budget Sotra.xlsx',
    kind: 'sheet',
    parent: 'sotra',
    days: 2,
    owner: 'Ibrahim Sanogo',
    size: 96256,
    starred: true,
  },
  { id: 'f15', name: 'Rapport mensuel.pdf', kind: 'pdf', parent: null, days: 4, owner: 'Jean Kouassi' },
  {
    id: 'f16',
    name: 'Trajet CI-4521-AB.webm',
    kind: 'video',
    parent: 'media',
    days: 0,
    owner: 'Marc Yao',
    starred: true,
  },
];

/** `formatBytes` (Ko / Mo / Go, virgule décimale). */
export function fmSize(n?: number): string {
  if (!n) return '—';
  const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
  let v = n;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  const s = u === 0 || v >= 100 ? String(Math.round(v)) : v.toFixed(1).replace('.', ',');
  return `${s} ${units[u]}`;
}

export const fmModified = (days: number) => (days === 0 ? 'Aujourd’hui' : days === 1 ? 'Hier' : `Il y a ${days} j`);

// ─── Fil d'équipe ───────────────────────────────────────────────────────────

export interface FeedPost {
  id: string;
  author: Person;
  at: string;
  likes: number;
  text: string;
  /** `photos`, `poll` ou « type · détail » (vidéo, note vocale, document, lien, YouTube). */
  media: string;
  comments?: CommentItem[];
  poll?: [string, [string, number][]];
}

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'p1',
    author: P.aya,
    at: 'il y a 2 h',
    likes: 18,
    text: 'Le nouvel entrepôt de **Vridi** est opérationnel ! Merci à toute l’équipe logistique pour ces trois semaines intenses. Les premières livraisons partent lundi.',
    media: 'photos',
    comments: [
      {
        id: 'f1',
        author: P.marc,
        at: 'il y a 1 h',
        likes: 3,
        text: 'Super, on teste ça dès lundi sur l’entrepôt de Vridi.',
      },
      { id: 'f2', author: P.aya, at: 'il y a 40 min', likes: 1, text: '@Marc-Yao je te prépare les accès.' },
    ],
  },
  {
    id: 'p2',
    author: P.marc,
    at: 'il y a 3 h',
    likes: 24,
    text: 'Démo du **suivi en temps réel** sur l’axe Abidjan – Yamoussoukro : la trace se met à jour toutes les 5 secondes.',
    media: 'video · Trajet CI-4521-AB',
  },
  {
    id: 'p3',
    author: P.ibrahim,
    at: 'il y a 5 h',
    likes: 9,
    text: 'Petit sondage pour l’atelier produit de vendredi :',
    media: 'poll',
    comments: [
      {
        id: 'f3',
        author: P.nadia,
        at: 'il y a 3 h',
        likes: 2,
        text: 'Les nouvelles illustrations sont magnifiques 😍',
      },
    ],
    poll: [
      'Quel module voulez-vous améliorer en priorité ?',
      [
        ['Facturation', 14],
        ['Planning terrain', 22],
        ['Application mobile', 9],
        ['Rapports', 5],
      ],
    ],
  },
  {
    id: 'p4',
    author: P.koffi,
    at: 'il y a 6 h',
    likes: 4,
    text: 'Note vocale depuis le chantier de San-Pédro 👇',
    media: 'voice · Note vocale',
  },
  {
    id: 'p5',
    author: P.fatou,
    at: 'hier',
    likes: 11,
    text: 'Le **contrat cadre 2026** est signé. Version finale ci-dessous, merci de vous y référer pour les nouvelles commandes.',
    media: 'document · Contrat cadre 2026.pdf · 4 pages',
  },
  {
    id: 'p6',
    author: P.grace,
    at: 'hier',
    likes: 31,
    text: 'Nouvel article sur le blog. Vos commentaires sont les bienvenus 🙌',
    media: `link · ${ARTICLES[0]!.title}`,
    comments: [],
  },
  {
    id: 'p7',
    author: P.nadia,
    at: 'hier',
    likes: 15,
    text: 'Pour la pause café : un court-métrage libre qui sert de référence pour nos tests vidéo.',
    media: 'youtube · Big Buck Bunny · 10:34',
  },
];

// ─── Paramètres ─────────────────────────────────────────────────────────────

export const SETTINGS_SECTIONS: [string, string, string][] = [
  ['profile', 'Profil', 'mi:person'],
  ['security', 'Sécurité', 'mi:shield'],
  ['api', 'API & intégrations', 'mi:key'],
  ['notifications', 'Notifications', 'mi:notifications'],
  ['appearance', 'Apparence', 'mi:palette'],
  ['danger', 'Zone sensible', 'mi:warning'],
];

export const SETTINGS_SECRET = 'sk_demo_51Nf3a9QeLx2Tb8Rk0pYv';
export const SETTINGS_SKILL_SUGGESTIONS = [
  'Logistique',
  'Facturation',
  'Formation',
  'Support',
  'Achats',
  'Comptabilité',
];
export const SETTINGS_PROFILE_BIO = 'Administrateur de l’espace SC Storage.';
export const SETTINGS_PROFILE_SKILLS = ['Logistique', 'Formation'];
export const SETTINGS_SECURITY: [string, string, boolean][] = [
  ['Vérification en deux étapes', 'Code SMS à chaque nouvelle connexion', true],
  ['Connexion avec Google', 'jean.kouassi@gmail.com', true],
  ['Alertes de connexion', 'E-mail lors d’une connexion inhabituelle', false],
];
export const SETTINGS_SESSIONS: [string, string, string, boolean][] = [
  ['MacBook Pro · Chrome', 'Abidjan · maintenant', 'mi:laptop-mac', true],
  ['iPhone 15 Pro · Safari', 'Abidjan · il y a 2 h', 'mi:phone-iphone', false],
];
/** (libellé, détail, e-mail, push, SMS) */
export const SETTINGS_NOTIFS: [string, string, boolean, boolean, boolean][] = [
  ['Nouvelles factures', 'Émises par votre équipe', true, true, false],
  ['Paiements reçus', 'Tous moyens de paiement', true, false, false],
  ['Relances', 'Factures échues', false, true, true],
  ['Mentions', 'Commentaires et fil d’équipe', true, true, false],
];
