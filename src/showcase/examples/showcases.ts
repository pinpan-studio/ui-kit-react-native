import { PAGE_EXAMPLES } from '../pageExamples';

/** Écran montré par un showcase : page d'exemple, démo de gabarit ou route du catalogue. */
export type ShowcaseTarget =
  { slug: string; chat?: boolean; param?: string } | { demo: 'shell' } | { harnais: string | null };

export interface Showcase {
  id: string;
  group: string;
  label: string;
  icon: string;
  path: string;
  tags: string[];
  target: ShowcaseTarget;
  /** Choix d'adaptation, quand l'entrée de référence n'a pas de page dédiée. */
  note?: string;
}

/** Groupes de showcases : identifiant, libellé, icône, description. */
export const SHOWCASE_GROUPS: [string, string, string, string][] = [
  ['modules', 'Modules', 'mi:apps', 'Les sous-modules du kit, tels qu’ils s’affichent dans l’application.'],
  [
    'auth',
    'Authentification',
    'mi:lock-outline',
    'Connexion, inscription, récupération et vérification, sous plusieurs dispositions de formulaire.',
  ],
  [
    'forms',
    'Formulaires',
    'mi:dynamic-form',
    'Formulaires complets : contact, commande, assistant, questionnaire, réservation, candidature.',
  ],
  [
    'content',
    'Contenu éditorial',
    'mi:auto-stories',
    'Typographie de lecture et discussions : blog, article, documentation, fil d’équipe.',
  ],
  [
    'layouts',
    'Dispositions d’application',
    'mi:space-dashboard',
    'Gabarits complets : navigation, modules, listes de données, détail, tableaux de bord.',
  ],
];

const s = (
  id: string,
  group: string,
  label: string,
  icon: string,
  path: string,
  tags: string[],
  target: ShowcaseTarget,
  note?: string,
): Showcase => ({ id, group, label, icon, path, tags, target, note });

/** Registre des showcases (`kShowcases` Flutter). */
export const SHOWCASES: Showcase[] = [
  s('main', 'modules', 'Main', 'mi:space-dashboard', '/main', ['shell', 'rail', 'drawer'], { demo: 'shell' }),
  s('harnais', 'modules', 'Harnais · accueil', 'mi:auto-awesome', '/harnais', ['IA', 'chat'], { harnais: null }),
  s('harnais-conversation', 'modules', 'Harnais · conversation', 'mi:forum', '/harnais/c-sidecar', ['IA', 'artefact'], {
    harnais: 'c-sidecar',
  }),
  ...PAGE_EXAMPLES.filter((p) => p.group === 'Authentification').map((p) =>
    s(`auth-${p.route.slice(5)}`, 'auth', p.title, 'mi:login', `/examples/${p.route}`, ['authentification'], {
      slug: p.slug,
    }),
  ),
  s('form-contact', 'forms', 'Contact', 'mi:contact-mail', '/examples/forms/contact', ['validation'], {
    slug: 'contact',
  }),
  s(
    'form-checkout',
    'forms',
    'Commande & paiement',
    'mi:shopping-cart-checkout',
    '/examples/forms/checkout',
    ['Mobile Money', 'carte', 'récapitulatif'],
    { slug: 'checkout' },
  ),
  s(
    'form-onboarding',
    'forms',
    'Assistant d’accueil',
    'mi:rocket-launch',
    '/examples/forms/onboarding',
    ['wizard', 'invitations'],
    { slug: 'onboarding' },
  ),
  s('form-survey', 'forms', 'Questionnaire', 'mi:quiz', '/examples/forms/survey', ['NPS', 'notation'], {
    slug: 'survey',
  }),
  s('form-booking', 'forms', 'Réservation', 'mi:event-available', '/examples/forms/booking', ['créneaux'], {
    slug: 'booking',
  }),
  s(
    'form-application',
    'forms',
    'Candidature',
    'mi:assignment-ind',
    '/examples/forms/application',
    ['formulaire long', 'signature'],
    { slug: 'application' },
  ),
  s('content-article', 'content', 'Article', 'mi:article', '/examples/app/blog/:slug', ['typographie'], {
    slug: 'article',
  }),
  s('content-blog', 'content', 'Blog', 'mi:auto-stories', '/examples/app/blog', ['articles'], { slug: 'blog' }),
  s('content-docs', 'content', 'Documentation', 'mi:menu-book', '/examples/app/docs', ['sommaire'], { slug: 'docs' }),
  s('content-feed', 'content', 'Fil d’équipe', 'mi:dynamic-feed', '/examples/app/feed', ['publications'], {
    slug: 'feed',
  }),
  s('app-dashboard', 'layouts', 'Tableau de bord', 'mi:dashboard', '/examples/app/dashboard', ['KPI', 'graphiques'], {
    slug: 'dashboard',
  }),
  s(
    'app-list',
    'layouts',
    'Liste de données',
    'mi:table-rows',
    '/examples/app/clients',
    ['table', 'filtres'],
    { slug: 'clients' },
    'Même page que Clients, comme côté Angular (même route).',
  ),
  s('app-detail', 'layouts', 'Fiche détail', 'mi:article', '/examples/app/clients/c-104', ['onglets', 'KPI'], {
    slug: 'client-detail',
  }),
  s('app-inbox', 'layouts', 'Maître / détail', 'mi:mark-email-unread', '/examples/app/inbox', ['split', 'messagerie'], {
    slug: 'inbox',
  }),
  s('app-catalog', 'layouts', 'Catalogue en grille', 'mi:grid-view', '/examples/app/catalog', ['cartes'], {
    slug: 'catalog',
  }),
  s('app-kanban', 'layouts', 'Tableau kanban', 'mi:view-kanban', '/examples/app/board', ['kanban'], { slug: 'board' }),
  s('app-modules', 'layouts', 'Lanceur de modules', 'mi:apps', '/examples/app/modules', ['tuiles'], {
    slug: 'modules',
  }),
  s('app-files', 'layouts', 'Gestionnaire de fichiers', 'mi:folder-open', '/examples/app/files', ['grille / liste'], {
    slug: 'files',
  }),
  s('app-files-columns', 'layouts', 'Fichiers en colonnes', 'mi:view-week', '/examples/app/files/columns', ['Finder'], {
    slug: 'files-columns',
  }),
  s('app-monitoring', 'layouts', 'Supervision', 'mi:monitor-heart', '/examples/app/monitoring', ['incidents'], {
    slug: 'monitoring',
  }),
  s('app-chat', 'layouts', 'Messagerie instantanée', 'mi:chat', '/examples/app/chat', ['plein écran'], {
    slug: 'chat',
  }),
  s(
    'app-chat-panel',
    'layouts',
    'Messagerie en panneau latéral',
    'mi:view-sidebar',
    '/examples/app/dashboard?chat=c-aya',
    ['panneau droit'],
    { slug: 'dashboard', chat: true },
    'Tableau de bord avec la messagerie (ChatPanel) ouverte en panneau latéral.',
  ),
  s(
    'app-file-picker',
    'layouts',
    'Sélecteur de fichiers (modale)',
    'mi:file-open',
    '/examples/app/files?picker=1',
    ['modale', 'sélection multiple'],
    { slug: 'files', param: 'picker' },
    'Gestionnaire de fichiers qui ouvre le sélecteur de fichiers au démarrage.',
  ),
  s('app-settings', 'layouts', 'Paramètres', 'mi:settings', '/examples/app/settings', ['sous-navigation'], {
    slug: 'settings',
  }),
];
