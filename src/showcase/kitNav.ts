// Catalogue repris de ui-kit-flutter lib/showcase/kit_nav.dart (fix/success-contrast, 6921a8a).
import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface KitSection {
  id: string;
  label: string;
}

export interface KitCategory {
  id: string;
  label: string;
  icon: IconName;
  description: string;
  sections: readonly KitSection[];
}

export const KIT_CATEGORIES: readonly KitCategory[] = [
  {
    id: 'typography',
    label: 'Typographie',
    icon: 'format-text',
    description:
      'Familles, échelle, hiérarchie, graisses, interlignage, interlettrage, mesure, contraste, chiffres, troncature, typographie française, tailles fluides, testeur.',
    sections: [
      {
        id: 'families',
        label: 'Familles de polices',
      },
      {
        id: 'scale',
        label: 'Échelle typographique',
      },
      {
        id: 'hierarchy',
        label: 'Hiérarchie & rythme',
      },
      {
        id: 'weights',
        label: 'Graisses',
      },
      {
        id: 'line-height',
        label: 'Interlignage',
      },
      {
        id: 'tracking',
        label: 'Interlettrage',
      },
      {
        id: 'measure',
        label: 'Longueur de ligne',
      },
      {
        id: 'color',
        label: 'Couleur & contraste',
      },
      {
        id: 'alignment',
        label: 'Alignement & césure',
      },
      {
        id: 'numbers',
        label: 'Chiffres & formats',
      },
      {
        id: 'overflow',
        label: 'Troncature',
      },
      {
        id: 'inline',
        label: 'Styles en ligne',
      },
      {
        id: 'prose',
        label: 'Contenu éditorial',
      },
      {
        id: 'french',
        label: 'Typographie française',
      },
      {
        id: 'fluid',
        label: 'Typographie fluide',
      },
      {
        id: 'a11y',
        label: 'Accessibilité',
      },
      {
        id: 'playground',
        label: 'Testeur',
      },
    ],
  },
  {
    id: 'forms',
    label: 'Formulaires',
    icon: 'form-select',
    description:
      'Input, textarea, select, autocomplete, dates, checkbox, radio, toggle, upload, recherche, validation.',
    sections: [
      {
        id: 'input',
        label: 'Input',
      },
      {
        id: 'input-material',
        label: 'Input Material',
      },
      {
        id: 'textarea',
        label: 'Textarea',
      },
      {
        id: 'mask',
        label: 'Masque de saisie',
      },
      {
        id: 'select',
        label: 'Select',
      },
      {
        id: 'multi-select',
        label: 'Multi-select',
      },
      {
        id: 'autocomplete',
        label: 'Autocomplete',
      },
      {
        id: 'date',
        label: 'Date picker',
      },
      {
        id: 'date-range',
        label: 'Date range',
      },
      {
        id: 'time',
        label: 'Time picker',
      },
      {
        id: 'checkbox',
        label: 'Checkbox',
      },
      {
        id: 'radio',
        label: 'Radio',
      },
      {
        id: 'toggle',
        label: 'Toggle',
      },
      {
        id: 'slider',
        label: 'Slider',
      },
      {
        id: 'upload',
        label: 'File upload',
      },
      {
        id: 'search',
        label: 'Search',
      },
      {
        id: 'validation',
        label: 'Form validation',
      },
      {
        id: 'crud-dialog',
        label: 'Formulaire en modale',
      },
    ],
  },
  {
    id: 'fields',
    label: 'Champs avancés',
    icon: 'form-textbox',
    description:
      'OTP, nombre +/−, montant FCFA, intervalle, notation, couleur, texte riche, Markdown, signature, tree-select, transfert, tags, adresse, mot de passe, copie.',
    sections: [
      {
        id: 'otp',
        label: 'Code OTP / PIN',
      },
      {
        id: 'stepper',
        label: 'Nombre + / −',
      },
      {
        id: 'currency',
        label: 'Montant / devise',
      },
      {
        id: 'range',
        label: 'Intervalle',
      },
      {
        id: 'rating',
        label: 'Notation',
      },
      {
        id: 'color',
        label: 'Sélecteur de couleur',
      },
      {
        id: 'rich-text',
        label: 'Texte riche',
      },
      {
        id: 'markdown',
        label: 'Markdown',
      },
      {
        id: 'signature',
        label: 'Signature',
      },
      {
        id: 'tree-select',
        label: 'Sélection arborescente',
      },
      {
        id: 'transfer',
        label: 'Liste de transfert',
      },
      {
        id: 'tags',
        label: 'Tags',
      },
      {
        id: 'address',
        label: 'Adresse avec carte',
      },
      {
        id: 'password',
        label: 'Mot de passe',
      },
      {
        id: 'copy',
        label: 'Valeur à copier',
      },
      {
        id: 'form',
        label: 'Formulaire complet',
      },
    ],
  },
  {
    id: 'buttons',
    label: 'Boutons',
    icon: 'gesture-tap-button',
    description: 'Primary, secondary, outline, ghost, danger, success, icône, loading, disabled.',
    sections: [
      {
        id: 'variants',
        label: 'Variantes',
      },
      {
        id: 'states',
        label: 'États',
      },
      {
        id: 'icon',
        label: 'Icon buttons',
      },
      {
        id: 'header',
        label: 'Actions de page',
      },
      {
        id: 'segmented',
        label: 'Segmentés & toggles',
      },
      {
        id: 'menu',
        label: 'Menu & split',
      },
      {
        id: 'fab',
        label: 'FAB',
      },
      {
        id: 'sizes',
        label: 'Tailles & formes',
      },
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    icon: 'compass-outline',
    description: 'Header, sidebar, navbar, onglets, breadcrumb, pagination, stepper, menus.',
    sections: [
      {
        id: 'header',
        label: 'Header',
      },
      {
        id: 'sidebar',
        label: 'Sidebar / drawer',
      },
      {
        id: 'navbar',
        label: 'Barre de navigation',
      },
      {
        id: 'tabs',
        label: 'Tabs',
      },
      {
        id: 'breadcrumb',
        label: 'Breadcrumb',
      },
      {
        id: 'pagination',
        label: 'Pagination',
      },
      {
        id: 'stepper',
        label: 'Stepper',
      },
      {
        id: 'menu',
        label: 'Menu',
      },
    ],
  },
  {
    id: 'data',
    label: 'Data display',
    icon: 'table',
    description:
      'Tables (dont table avancée), cartes, listes, liste descriptive, timeline, badges, avatars, compteurs, graphiques, diff, audit log, QR code.',
    sections: [
      {
        id: 'table',
        label: 'Table',
      },
      {
        id: 'table-states',
        label: 'États de table',
      },
      {
        id: 'advanced-table',
        label: 'Table avancée',
      },
      {
        id: 'cards',
        label: 'Cards',
      },
      {
        id: 'list',
        label: 'List',
      },
      {
        id: 'description-list',
        label: 'Liste descriptive',
      },
      {
        id: 'timeline',
        label: 'Timeline',
      },
      {
        id: 'badge',
        label: 'Badge',
      },
      {
        id: 'chip',
        label: 'Chip',
      },
      {
        id: 'avatar',
        label: 'Avatar',
      },
      {
        id: 'stats',
        label: 'Statistics cards',
      },
      {
        id: 'counters',
        label: 'Compteurs animés',
      },
      {
        id: 'charts',
        label: 'Graphiques',
      },
      {
        id: 'diff',
        label: 'Diff',
      },
      {
        id: 'audit',
        label: 'Audit log',
      },
      {
        id: 'qr',
        label: 'QR code & code-barres',
      },
      {
        id: 'empty',
        label: 'Empty state',
      },
    ],
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: 'bell-ring-outline',
    description:
      'Alertes, toasts, modales, drawers, confirmation, loaders, skeletons, erreurs, upload multiple, bannière hors ligne, page de résultat, annulation.',
    sections: [
      {
        id: 'alert',
        label: 'Alert',
      },
      {
        id: 'toast',
        label: 'Toast / Snackbar',
      },
      {
        id: 'modal',
        label: 'Modal',
      },
      {
        id: 'dialog',
        label: 'Dialog',
      },
      {
        id: 'confirm',
        label: 'Confirmation',
      },
      {
        id: 'drawer',
        label: 'Drawer / bottom sheet',
      },
      {
        id: 'tooltip',
        label: 'Tooltip',
      },
      {
        id: 'loading',
        label: 'Loading',
      },
      {
        id: 'skeleton',
        label: 'Skeleton',
      },
      {
        id: 'error',
        label: 'Error state',
      },
      {
        id: 'upload-queue',
        label: 'Envoi multiple',
      },
      {
        id: 'banner',
        label: 'Bannière globale',
      },
      {
        id: 'result',
        label: 'Page de résultat',
      },
      {
        id: 'undo',
        label: 'Snackbar « Annuler »',
      },
    ],
  },
  {
    id: 'planning',
    label: 'Planning',
    icon: 'timeline-outline',
    description: 'Kanban, Gantt, notes, vue groupée, calendrier, agenda — modèle générique et filtres optionnels.',
    sections: [
      {
        id: 'model',
        label: 'Modèle & options',
      },
      {
        id: 'kanban',
        label: 'Kanban',
      },
      {
        id: 'timeline',
        label: 'Timeline / Gantt',
      },
      {
        id: 'notes',
        label: 'Grille de notes',
      },
      {
        id: 'grouped',
        label: 'Vue groupée',
      },
      {
        id: 'calendar',
        label: 'Calendrier',
      },
      {
        id: 'agenda',
        label: 'Agenda',
      },
    ],
  },
  {
    id: 'maps',
    label: 'Cartes',
    icon: 'map-outline',
    description: 'Fonds gratuits, marqueurs, clustering, trajets, zones, dessin, mode sombre.',
    sections: [
      {
        id: 'basemaps',
        label: 'Fonds de carte',
      },
      {
        id: 'markers',
        label: 'Marqueurs',
      },
      {
        id: 'cluster',
        label: 'Clustering',
      },
      {
        id: 'routes',
        label: 'Trajets',
      },
      {
        id: 'zones',
        label: 'Zones / géofences',
      },
      {
        id: 'draw',
        label: 'Dessin',
      },
      {
        id: 'compact',
        label: 'Carte compacte',
      },
      {
        id: 'states',
        label: 'États',
      },
    ],
  },
  {
    id: 'media',
    label: 'Médias',
    icon: 'image-multiple-outline',
    description: 'Lecteur vidéo, YouTube, lecteur audio, PDF, visionneuse de fichiers, carrousel, recadrage d’image.',
    sections: [
      {
        id: 'video',
        label: 'Lecteur vidéo',
      },
      {
        id: 'youtube',
        label: 'Lecteur YouTube',
      },
      {
        id: 'audio',
        label: 'Lecteur audio',
      },
      {
        id: 'pdf',
        label: 'Lecteur PDF',
      },
      {
        id: 'viewer',
        label: 'Visionneuse de fichiers',
      },
      {
        id: 'carousel',
        label: 'Carrousel',
      },
      {
        id: 'image-gallery',
        label: 'Galerie d’images',
      },
      {
        id: 'video-gallery',
        label: 'Galerie vidéo',
      },
      {
        id: 'masonry',
        label: 'Grille masonry',
      },
      {
        id: 'cropper',
        label: 'Recadrage d’image',
      },
    ],
  },
  {
    id: 'interactions',
    label: 'Interactions',
    icon: 'gesture-tap',
    description:
      'Palette de commandes, raccourcis et gestes, popover riche, visite guidée, centre de notifications, menu contextuel.',
    sections: [
      {
        id: 'palette',
        label: 'Palette de commandes',
      },
      {
        id: 'shortcuts',
        label: 'Raccourcis & gestes',
      },
      {
        id: 'popover',
        label: 'Popover riche',
      },
      {
        id: 'tour',
        label: 'Visite guidée',
      },
      {
        id: 'notifications',
        label: 'Centre de notifications',
      },
      {
        id: 'context-menu',
        label: 'Menu contextuel',
      },
    ],
  },
  {
    id: 'material',
    label: 'Material',
    icon: 'puzzle-outline',
    description: 'Accordion, tree, drag & drop, chips input, card, grid list, bottom sheet, virtual scroll, ripple.',
    sections: [
      {
        id: 'accordion',
        label: 'Accordion',
      },
      {
        id: 'tree',
        label: 'Tree',
      },
      {
        id: 'drag-drop',
        label: 'Drag & drop',
      },
      {
        id: 'chips-input',
        label: 'Chips input',
      },
      {
        id: 'card',
        label: 'Card',
      },
      {
        id: 'grid-list',
        label: 'Grid list',
      },
      {
        id: 'bottom-sheet',
        label: 'Bottom sheet',
      },
      {
        id: 'virtual-scroll',
        label: 'Virtual scroll',
      },
      {
        id: 'ripple',
        label: 'Ripple',
      },
    ],
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: 'view-dashboard-edit-outline',
    description: 'Page layout, dashboard, colonnes, sidebar, pleine largeur, sections, conteneurs responsive.',
    sections: [
      {
        id: 'page',
        label: 'Page layout',
      },
      {
        id: 'dashboard',
        label: 'Dashboard layout',
      },
      {
        id: 'two-cols',
        label: 'Deux colonnes',
      },
      {
        id: 'three-cols',
        label: 'Trois colonnes',
      },
      {
        id: 'sidebar',
        label: 'Sidebar layout',
      },
      {
        id: 'full',
        label: 'Pleine largeur',
      },
      {
        id: 'sections',
        label: 'Card sections',
      },
      {
        id: 'responsive',
        label: 'Conteneurs responsive',
      },
      {
        id: 'breakpoints',
        label: 'Breakpoints',
      },
    ],
  },
];

export const categoryById = (id: string): KitCategory | undefined => KIT_CATEGORIES.find((c) => c.id === id);
