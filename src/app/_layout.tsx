import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdaptiveShell } from '../shell/AdaptiveShell';
import { FONT_ASSETS } from '../theme/fonts';
import { KitThemeProvider } from '../theme/KitThemeProvider';
import { useKitTheme } from '../theme/useKitTheme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Racines des onglets de la barre du bas : on passe de l'une à l'autre en fondu, sans glissement. */
const TAB_ROOTS = ['index', 'components/index', 'layouts/index', 'harnais'] as const;

/**
 * Pile de routes au fond du thème (sinon le fond clair par défaut de la navigation reste visible en sombre).
 * Pages de détail : transition native de la plateforme (glissement et retour au bord sur iOS) ;
 * racines d'onglet : fondu, comme un changement d'onglet.
 */
function ThemedStack() {
  const { colors } = useKitTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {TAB_ROOTS.map((name) => (
        <Stack.Screen key={name} name={name} options={{ animation: 'fade' }} />
      ))}
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(FONT_ASSETS);
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, error]);
  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KitThemeProvider>
          <AdaptiveShell>
            <ThemedStack />
          </AdaptiveShell>
        </KitThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
