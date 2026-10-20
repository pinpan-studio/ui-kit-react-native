import { StatusBar } from 'expo-status-bar';
import { useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useThemeStore } from '../store/themeStore';
import { buildTheme } from './buildTheme';

/** Applique palette + mode (clair / sombre / système) à toute l'app. */
export function KitThemeProvider({ children }: { children: ReactNode }) {
  const paletteId = useThemeStore((s) => s.paletteId);
  const pref = useThemeStore((s) => s.mode);
  const system = useColorScheme();
  const mode = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  const theme = useMemo(() => buildTheme(paletteId, mode), [paletteId, mode]);
  return (
    <PaperProvider
      theme={theme}
      settings={{ icon: (props) => <MaterialCommunityIcons {...props} name={props.name as never} /> }}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </PaperProvider>
  );
}
