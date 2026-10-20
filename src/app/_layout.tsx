import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdaptiveShell } from '../shell/AdaptiveShell';
import { FONT_ASSETS } from '../theme/fonts';
import { KitThemeProvider } from '../theme/KitThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
          </AdaptiveShell>
        </KitThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
