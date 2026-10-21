import { StatusBar } from 'expo-status-bar';
import { useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import type { IconProps } from 'react-native-paper/lib/typescript/components/MaterialCommunityIcon';

import { useThemeStore } from '../store/themeStore';
import { buildTheme } from './buildTheme';

/**
 * Icônes : MaterialCommunityIcons par défaut (variantes `-outline` des `Icons.*_outlined` Flutter) ;
 * préfixe `mi:` pour le glyphe Material Icons exact (`Icons.*` plein), ex. `mi:smart-button`.
 */
function KitIconSource({ name, ...props }: IconProps) {
  if (name.startsWith('mi:')) return <MaterialIcons {...props} name={name.slice(3) as never} />;
  return <MaterialCommunityIcons {...props} name={name as never} />;
}

/** Applique palette + mode (clair / sombre / système) à toute l'app. */
export function KitThemeProvider({ children }: { children: ReactNode }) {
  const paletteId = useThemeStore((s) => s.paletteId);
  const pref = useThemeStore((s) => s.mode);
  const system = useColorScheme();
  const mode = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  const theme = useMemo(() => buildTheme(paletteId, mode), [paletteId, mode]);
  return (
    <PaperProvider theme={theme} settings={{ icon: KitIconSource }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </PaperProvider>
  );
}
