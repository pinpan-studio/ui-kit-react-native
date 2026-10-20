import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface DrawerEntry {
  key: string;
  label: string;
  href: string;
  icon: IconName;
  /** Index de destination (onglets) le cas échéant. */
  destIndex?: number;
}

/** Entrées du tiroir, dans l'ordre de KitDrawer (kit_shell.dart). */
export const DRAWER_ENTRIES: readonly DrawerEntry[] = [
  { key: 'showcase', label: 'UI Showcase', href: '/', icon: 'palette-outline', destIndex: 0 },
  { key: 'components', label: 'Composants', href: '/components', icon: 'widgets-outline', destIndex: 1 },
  { key: 'layouts', label: 'Layouts', href: '/layouts', icon: 'view-dashboard-outline', destIndex: 2 },
  { key: 'harnais', label: 'Harnais (assistant IA)', href: '/harnais', icon: 'creation-outline', destIndex: 3 },
  { key: 'examples', label: 'Pages d’exemple', href: '/examples', icon: 'web' },
  { key: 'pages-gallery', label: 'Galerie des pages', href: '/pages-gallery', icon: 'bookmark-multiple-outline' },
  { key: 'showcases', label: 'Showcases', href: '/showcases', icon: 'devices' },
];

export const EXTRA_PATHS: readonly string[] = DRAWER_ENTRIES.filter((e) => e.destIndex === undefined).map(
  (e) => e.href,
);
