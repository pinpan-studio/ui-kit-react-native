/** Maquette schématique d'un gabarit. */
export type Wire = 'shell' | 'detail' | 'auth' | 'public' | 'drawer' | 'dialog' | 'kit';

/** Ouverture d'un gabarit : démo plein écran, panneau latéral, galerie ou accueil du catalogue. */
export type TemplateOpen =
  | { kind: 'demo'; demo: 'shell' | 'detail' | 'auth' | 'public' }
  | { kind: 'panel' }
  | { kind: 'gallery'; category: string; section: string }
  | { kind: 'home' };

export interface LayoutTemplate {
  id: Wire;
  title: string;
  icon: string;
  file: string;
  description: string;
  open: TemplateOpen;
}

/** Gabarits d'écran complets (`LayoutsGalleryPage` Flutter). */
export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'shell',
    title: 'Shell applicatif',
    icon: 'mi:space-dashboard',
    file: 'showcase/layouts/AppShellDemo.tsx',
    description:
      'Barre d’application (recherche, notifications, compte) + tiroir Sidecar + barre de navigation basse + FAB contextuel. Sur tablette, le Sidecar reste visible à gauche.',
    open: { kind: 'demo', demo: 'shell' },
  },
  {
    id: 'detail',
    title: 'Fiche détail',
    icon: 'mi:article',
    file: 'DetailPageDemo',
    description:
      'En-tête repliable (identité, statut, actions), KPI, onglets de sous-listes, actions principales au pouce.',
    open: { kind: 'demo', demo: 'detail' },
  },
  {
    id: 'auth',
    title: 'Authentification',
    icon: 'mi:lock-person',
    file: 'AuthDemo',
    description: 'Connexion, connexion Google, mot de passe oublié et code OTP — sans authentification réelle.',
    open: { kind: 'demo', demo: 'auth' },
  },
  {
    id: 'public',
    title: 'Page publique',
    icon: 'mi:public',
    file: 'PublicPageDemo',
    description: 'Proforma consultable via un lien partagé, paiement mobile money simulé.',
    open: { kind: 'demo', demo: 'public' },
  },
  {
    id: 'drawer',
    title: 'Panneau latéral / feuille',
    icon: 'mi:view-sidebar',
    file: 'SidePanel',
    description:
      'Le drawer droit 360 px du web : feuille basse quasi plein écran sur téléphone, panneau latéral sur tablette.',
    open: { kind: 'panel' },
  },
  {
    id: 'dialog',
    title: 'Dialogs & formulaires',
    icon: 'mi:open-in-new',
    file: 'FormSheet · ConfirmDialog',
    description:
      'Formulaires en feuille (CrudDialog), confirmations, messages poussés. Voir aussi la galerie Feedback.',
    open: { kind: 'gallery', category: 'feedback', section: 'modal' },
  },
  {
    id: 'kit',
    title: 'Catalogue (UI Kit)',
    icon: 'mi:widgets',
    file: 'shell/AdaptiveShell.tsx',
    description:
      'Layout de ce catalogue : barre basse (Showcase, Composants, Layouts, Harnais), tiroir recherchable, pages documentaires avec sommaire collant.',
    open: { kind: 'home' },
  },
];
