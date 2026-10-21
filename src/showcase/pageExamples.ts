export interface PageExample {
  slug: string;
  /** Route de l'exemple dans le kit de référence (`app/…`, `auth/…`, `forms/…`). */
  route: string;
  title: string;
  group: 'Applications' | 'Authentification' | 'Formulaires';
  description: string;
  icon: string;
  /** Page du shell d'exemples (écrans « Applications »). */
  shell?: string;
}

/** Registre des 33 pages d'exemple (`kExampleGroups` de ui-kit-flutter). */
export const PAGE_EXAMPLES: readonly PageExample[] = [
  {
    slug: 'dashboard',
    route: 'app/dashboard',
    title: 'Tableau de bord',
    group: 'Applications',
    description: 'KPI, graphique et activité',
    icon: 'mi:space-dashboard',
    shell: 'dashboard',
  },
  {
    slug: 'clients',
    route: 'app/clients',
    title: 'Clients',
    group: 'Applications',
    description: 'Liste filtrable de clients',
    icon: 'mi:people-outline',
    shell: 'clients',
  },
  {
    slug: 'client-detail',
    route: 'app/clients/:id',
    title: 'Fiche client',
    group: 'Applications',
    description: 'Détail avec onglets',
    icon: 'mi:person-outline',
    shell: 'clients/:id',
  },
  {
    slug: 'inbox',
    route: 'app/inbox',
    title: 'Messagerie',
    group: 'Applications',
    description: 'Liste et lecture côte à côte',
    icon: 'mi:inbox',
    shell: 'inbox',
  },
  {
    slug: 'catalog',
    route: 'app/catalog',
    title: 'Catalogue',
    group: 'Applications',
    description: 'Produits, catégories, panier',
    icon: 'mi:storefront',
    shell: 'catalog',
  },
  {
    slug: 'board',
    route: 'app/board',
    title: 'Tableau kanban',
    group: 'Applications',
    description: 'Colonnes de tâches',
    icon: 'mi:view-kanban',
    shell: 'board',
  },
  {
    slug: 'modules',
    route: 'app/modules',
    title: 'Modules',
    group: 'Applications',
    description: 'Activation des modules',
    icon: 'mi:extension',
    shell: 'modules',
  },
  {
    slug: 'blog',
    route: 'app/blog',
    title: 'Blog',
    group: 'Applications',
    description: 'Liste d’articles',
    icon: 'mi:newspaper',
    shell: 'blog',
  },
  {
    slug: 'article',
    route: 'app/blog/:slug',
    title: 'Article',
    group: 'Applications',
    description: 'Page de lecture',
    icon: 'mi:article',
    shell: 'blog/:slug',
  },
  {
    slug: 'docs',
    route: 'app/docs',
    title: 'Documentation',
    group: 'Applications',
    description: 'Sommaire et contenu',
    icon: 'mi:menu-book',
    shell: 'docs',
  },
  {
    slug: 'files',
    route: 'app/files',
    title: 'Fichiers',
    group: 'Applications',
    description: 'Grille ou liste',
    icon: 'mi:folder-open',
    shell: 'files',
  },
  {
    slug: 'files-columns',
    route: 'app/files/columns',
    title: 'Fichiers · Colonnes',
    group: 'Applications',
    description: 'Navigation en colonnes',
    icon: 'mi:view-column',
    shell: 'files/columns',
  },
  {
    slug: 'monitoring',
    route: 'app/monitoring',
    title: 'Supervision',
    group: 'Applications',
    description: 'État des services',
    icon: 'mi:monitor-heart',
    shell: 'monitoring',
  },
  {
    slug: 'chat',
    route: 'app/chat',
    title: 'Messages',
    group: 'Applications',
    description: 'Conversations et fil',
    icon: 'mi:chat-bubble-outline',
    shell: 'chat',
  },
  {
    slug: 'feed',
    route: 'app/feed',
    title: 'Fil d’actualité',
    group: 'Applications',
    description: 'Publications et réactions',
    icon: 'mi:dynamic-feed',
    shell: 'feed',
  },
  {
    slug: 'settings',
    route: 'app/settings',
    title: 'Paramètres',
    group: 'Applications',
    description: 'Profil, notifications, sécurité',
    icon: 'mi:settings',
    shell: 'settings',
  },
  {
    slug: 'auth-centered',
    route: 'auth/centered',
    title: 'Connexion centrée',
    group: 'Authentification',
    description: '/examples/auth/centered',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'auth-split-right',
    route: 'auth/split-right',
    title: 'Connexion, panneau à gauche',
    group: 'Authentification',
    description: '/examples/auth/split-right',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'auth-split-left',
    route: 'auth/split-left',
    title: 'Connexion, panneau à droite',
    group: 'Authentification',
    description: '/examples/auth/split-left',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'auth-image',
    route: 'auth/image',
    title: 'Connexion sur image',
    group: 'Authentification',
    description: '/examples/auth/image',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'auth-minimal',
    route: 'auth/minimal',
    title: 'Connexion minimale',
    group: 'Authentification',
    description: '/examples/auth/minimal',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'auth-register',
    route: 'auth/register',
    title: 'Inscription en 3 étapes',
    group: 'Authentification',
    description: '/examples/auth/register',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'auth-social',
    route: 'auth/social',
    title: 'Connexion sociale',
    group: 'Authentification',
    description: '/examples/auth/social',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'auth-accounts',
    route: 'auth/accounts',
    title: 'Choix du compte',
    group: 'Authentification',
    description: '/examples/auth/accounts',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'auth-forgot',
    route: 'auth/forgot',
    title: 'Mot de passe oublié',
    group: 'Authentification',
    description: '/examples/auth/forgot',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'auth-otp',
    route: 'auth/otp',
    title: 'Code de vérification',
    group: 'Authentification',
    description: '/examples/auth/otp',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'auth-lock',
    route: 'auth/lock',
    title: 'Session verrouillée',
    group: 'Authentification',
    description: '/examples/auth/lock',
    icon: 'mi:lock-outline',
  },
  {
    slug: 'contact',
    route: 'forms/contact',
    title: 'Contact',
    group: 'Formulaires',
    description: 'Formulaire de contact avec coordonnées',
    icon: 'mi:mail-outline',
  },
  {
    slug: 'checkout',
    route: 'forms/checkout',
    title: 'Commande',
    group: 'Formulaires',
    description: 'Tunnel de paiement en 3 étapes',
    icon: 'mi:shopping-bag',
  },
  {
    slug: 'onboarding',
    route: 'forms/onboarding',
    title: 'Onboarding',
    group: 'Formulaires',
    description: 'Configuration de l’espace en 4 étapes',
    icon: 'mi:rocket-launch',
  },
  {
    slug: 'survey',
    route: 'forms/survey',
    title: 'Questionnaire',
    group: 'Formulaires',
    description: 'Sondage NPS question par question',
    icon: 'mi:poll',
  },
  {
    slug: 'booking',
    route: 'forms/booking',
    title: 'Réservation',
    group: 'Formulaires',
    description: 'Choix de prestation, jour et créneau',
    icon: 'mi:event',
  },
  {
    slug: 'application',
    route: 'forms/application',
    title: 'Candidature',
    group: 'Formulaires',
    description: 'Long formulaire à sections avec barre fixe',
    icon: 'mi:badge',
  },
];

export function pageExampleBySlug(slug: string): PageExample | undefined {
  return PAGE_EXAMPLES.find((item) => item.slug === slug);
}

/** Type de page (`PageEntry.kind`), déduit de la route. */
export function pageKind(route: string): string {
  if (route.startsWith('auth/')) return 'Authentification';
  if (['forms/onboarding', 'forms/checkout', 'forms/survey'].some((r) => route.startsWith(r))) return 'Assistant';
  if (route.startsWith('forms/')) return 'Formulaire';
  if (route.includes('dashboard') || route.includes('monitoring')) return 'Tableau de bord';
  if (route.includes('settings')) return 'Paramètres';
  if (route.includes('board')) return 'Kanban';
  if (route.includes(':')) return 'Détail';
  if (['clients', 'inbox', 'files', 'catalog'].some((r) => route.includes(r))) return 'Liste';
  if (['blog', 'docs', 'feed'].some((r) => route.includes(r))) return 'Publique';
  return 'Autre';
}
