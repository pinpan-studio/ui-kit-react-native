import { useTheme } from 'react-native-paper';

import type { KitTheme } from './buildTheme';

/** Thème courant avec les rôles M3 complets et les couleurs du kit. */
export const useKitTheme = () => useTheme<KitTheme>();
