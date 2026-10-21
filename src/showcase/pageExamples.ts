export interface PageExample {
  slug: string;
  title: string;
  group: 'Application' | 'Authentification' | 'Formulaires';
  description: string;
  icon: string;
}

/** Registre des 33 entrées de `lib/examples/examples_index.dart` de ui-kit-flutter. */
export const PAGE_EXAMPLES: readonly PageExample[] = [
  {
    slug: 'dashboard',
    title: 'Tableau de bord',
    group: 'Application',
    description: 'KPI, graphique et activité',
    icon: 'view-dashboard-outline',
  },
  {
    slug: 'clients',
    title: 'Clients',
    group: 'Application',
    description: 'Liste filtrable de clients',
    icon: 'account-group-outline',
  },
  {
    slug: 'client-detail',
    title: 'Fiche client',
    group: 'Application',
    description: 'Détail avec onglets',
    icon: 'account-box-outline',
  },
  {
    slug: 'inbox',
    title: 'Messagerie',
    group: 'Application',
    description: 'Liste et lecture côte à côte',
    icon: 'email-outline',
  },
  {
    slug: 'catalog',
    title: 'Catalogue',
    group: 'Application',
    description: 'Produits, catégories, panier',
    icon: 'storefront-outline',
  },
  {
    slug: 'board',
    title: 'Tableau kanban',
    group: 'Application',
    description: 'Colonnes de tâches',
    icon: 'view-kanban-outline',
  },
  {
    slug: 'modules',
    title: 'Modules',
    group: 'Application',
    description: 'Activation des modules',
    icon: 'view-grid-outline',
  },
  {
    slug: 'blog',
    title: 'Blog',
    group: 'Application',
    description: 'Liste d’articles',
    icon: 'newspaper-variant-outline',
  },
  { slug: 'article', title: 'Article', group: 'Application', description: 'Page de lecture', icon: 'text-box-outline' },
  {
    slug: 'docs',
    title: 'Documentation',
    group: 'Application',
    description: 'Sommaire et contenu',
    icon: 'book-open-page-variant-outline',
  },
  { slug: 'files', title: 'Fichiers', group: 'Application', description: 'Grille ou liste', icon: 'folder-outline' },
  {
    slug: 'files-columns',
    title: 'Fichiers · Colonnes',
    group: 'Application',
    description: 'Navigation en colonnes',
    icon: 'view-column-outline',
  },
  {
    slug: 'monitoring',
    title: 'Supervision',
    group: 'Application',
    description: 'État des services',
    icon: 'monitor-dashboard',
  },
  { slug: 'chat', title: 'Messages', group: 'Application', description: 'Conversations et fil', icon: 'chat-outline' },
  {
    slug: 'feed',
    title: 'Fil d’actualité',
    group: 'Application',
    description: 'Publications et réactions',
    icon: 'rss',
  },
  {
    slug: 'settings',
    title: 'Paramètres',
    group: 'Application',
    description: 'Profil, notifications, sécurité',
    icon: 'cog-outline',
  },

  {
    slug: 'auth-centered',
    title: 'Connexion centrée',
    group: 'Authentification',
    description: 'Connexion avec fournisseurs sociaux',
    icon: 'login',
  },
  {
    slug: 'auth-split-right',
    title: 'Connexion, panneau à gauche',
    group: 'Authentification',
    description: 'Formulaire avec panneau latéral gauche',
    icon: 'view-split-vertical',
  },
  {
    slug: 'auth-split-left',
    title: 'Connexion, panneau à droite',
    group: 'Authentification',
    description: 'Formulaire avec panneau latéral droit',
    icon: 'view-split-vertical',
  },
  {
    slug: 'auth-image',
    title: 'Connexion sur image',
    group: 'Authentification',
    description: 'Écran de connexion illustré',
    icon: 'image-outline',
  },
  {
    slug: 'auth-minimal',
    title: 'Connexion minimale',
    group: 'Authentification',
    description: 'Formulaire épuré avec liens rapides',
    icon: 'login-variant',
  },
  {
    slug: 'auth-register',
    title: 'Inscription en 3 étapes',
    group: 'Authentification',
    description: 'Création de compte progressive',
    icon: 'account-plus-outline',
  },
  {
    slug: 'auth-social',
    title: 'Connexion sociale',
    group: 'Authentification',
    description: 'Choix d’un fournisseur de connexion',
    icon: 'account-multiple-outline',
  },
  {
    slug: 'auth-accounts',
    title: 'Choix du compte',
    group: 'Authentification',
    description: 'Sélection parmi les comptes connus',
    icon: 'account-switch-outline',
  },
  {
    slug: 'auth-forgot',
    title: 'Mot de passe oublié',
    group: 'Authentification',
    description: 'Récupération du compte par e-mail',
    icon: 'lock-reset',
  },
  {
    slug: 'auth-otp',
    title: 'Code de vérification',
    group: 'Authentification',
    description: 'Vérification en deux étapes',
    icon: 'numeric',
  },
  {
    slug: 'auth-lock',
    title: 'Session verrouillée',
    group: 'Authentification',
    description: 'Réouverture d’une session protégée',
    icon: 'lock-outline',
  },

  {
    slug: 'contact',
    title: 'Contact',
    group: 'Formulaires',
    description: 'Formulaire de contact avec coordonnées',
    icon: 'email-outline',
  },
  {
    slug: 'checkout',
    title: 'Commande',
    group: 'Formulaires',
    description: 'Tunnel de paiement en 3 étapes',
    icon: 'shopping-outline',
  },
  {
    slug: 'onboarding',
    title: 'Onboarding',
    group: 'Formulaires',
    description: 'Configuration de l’espace en 4 étapes',
    icon: 'rocket-launch-outline',
  },
  {
    slug: 'survey',
    title: 'Questionnaire',
    group: 'Formulaires',
    description: 'Sondage NPS question par question',
    icon: 'poll',
  },
  {
    slug: 'booking',
    title: 'Réservation',
    group: 'Formulaires',
    description: 'Choix de prestation, jour et créneau',
    icon: 'calendar-check-outline',
  },
  {
    slug: 'application',
    title: 'Candidature',
    group: 'Formulaires',
    description: 'Formulaire à sections avec barre fixe',
    icon: 'file-document-edit-outline',
  },
];

export function pageExampleBySlug(slug: string): PageExample | undefined {
  return PAGE_EXAMPLES.find((item) => item.slug === slug);
}
