import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface Destination {
  key: string;
  href: '/' | '/components' | '/layouts' | '/harnais';
  label: string;
  icon: IconName;
  activeIcon: IconName;
}

/** Les 4 destinations de la NavigationBar de ui-kit-flutter (kit_shell.dart). */
export const DESTINATIONS: readonly Destination[] = [
  { key: 'showcase', href: '/', label: 'Showcase', icon: 'palette-outline', activeIcon: 'palette' },
  { key: 'components', href: '/components', label: 'Composants', icon: 'widgets-outline', activeIcon: 'widgets' },
  { key: 'layouts', href: '/layouts', label: 'Layouts', icon: 'view-dashboard-outline', activeIcon: 'view-dashboard' },
  { key: 'harnais', href: '/harnais', label: 'Harnais', icon: 'creation-outline', activeIcon: 'creation' },
];

export function activeIndex(pathname: string): number {
  const i = DESTINATIONS.findIndex((d) => d.href !== '/' && pathname.startsWith(d.href));
  return i === -1 ? 0 : i;
}

export type NavMode = 'bar' | 'rail' | 'drawer';

/** Règle Flutter : barre en bas < 600 dp, rail de 600 à 840 dp, panneau latéral au-delà. */
export function navModeFor(width: number): NavMode {
  if (width < 600) return 'bar';
  if (width < 840) return 'rail';
  return 'drawer';
}
