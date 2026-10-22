import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Appbar, BottomNavigation } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModalDrawer } from '../components';
import { SnackProvider } from '../core/snack';
import { hapticToggle, KitIconButton, useBackClose } from '../mobile';
import { categoryById } from '../showcase/kitNav';
import { useThemeStore } from '../store/themeStore';
import { font } from '../theme/typography';
import { useKitTheme } from '../theme/useKitTheme';
import { activeIndex, DESTINATIONS, navModeFor } from './destinations';
import { NavPanel } from './NavPanel';
import { NavRail } from './NavRail';
import { emitTabReselect } from './tabReselect';
import { PaletteSheet } from './PaletteSheet';

/** Sortie d'un écran immersif (Harnais) : retour à la dernière destination du shell. */
const ExitContext = createContext<() => void>(() => router.navigate('/'));
export const useShellExit = () => useContext(ExitContext);

function titleFor(pathname: string): string {
  if (pathname === '/') return 'UI Showcase';
  const m = pathname.match(/^\/components\/([^/]+)/);
  if (m?.[1]) return categoryById(m[1])?.label ?? 'Composants';
  if (pathname === '/pages') return 'Pages d’exemple';
  if (pathname === '/pages-gallery') return 'Galerie des pages';
  if (pathname === '/showcases') return 'Showcases';
  return DESTINATIONS[activeIndex(pathname)]?.label ?? 'UI Kit';
}

/**
 * Shell adaptatif : barre d'application + navigation selon les classes de largeur Material 3 :
 * barre en bas < 600 dp (comme Flutter, avec tiroir), rail 600–840 dp, panneau latéral permanent au-delà.
 * Le Harnais s'affiche en plein écran avec sa propre barre (comme kit_shell.dart) ; sa sortie
 * (`useShellExit`) ramène à la destination précédente.
 * Les démos de gabarits (`/layouts/<démo>`) les pages d'exemple (`/pages/<page>`) et les showcases (`/showcases/<id>`) s'affichent en plein écran, avec leur propre barre, comme les
 * routes poussées par-dessus le shell dans Flutter.
 * Les fonds vont jusqu'aux bords ; le contenu respecte les zones sûres.
 */
export function AdaptiveShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const theme = useKitTheme();
  const pathname = usePathname();
  const index = activeIndex(pathname);
  const harnais = DESTINATIONS[index]?.key === 'harnais';
  const navMode = navModeFor(width);
  const lastOutside = useRef<string>('/');
  useEffect(() => {
    if (!harnais) lastOutside.current = pathname;
  }, [harnais, pathname]);
  const exitHarnais = useCallback(() => router.navigate(lastOutside.current as never), []);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pref = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  useBackClose(drawerOpen, closeDrawer);

  // Dernière page de chaque onglet : un onglet retrouve sa page en cours (comme les piles par onglet Flutter).
  const lastPath = useRef<Record<number, string>>({});
  useEffect(() => {
    lastPath.current[index] = pathname;
  }, [index, pathname]);
  const select = (i: number) => {
    const d = DESTINATIONS[i];
    if (!d) return;
    if (i !== index) {
      router.navigate((lastPath.current[i] ?? d.href) as never);
      return;
    }
    // Onglet actif touché à nouveau : retour à sa racine, ou en haut de la page s'il y est déjà.
    if (pathname !== d.href) router.navigate(d.href);
    else emitTabReselect(d.href);
  };
  const toggleDark = () => {
    hapticToggle();
    setMode(theme.dark ? 'light' : 'dark');
  };
  const canGoBack = pathname.split('/').filter(Boolean).length > 1;

  if (harnais || /^\/(layouts|pages|showcases)\/[^/]+/.test(pathname))
    return (
      <View style={[styles.fill, { backgroundColor: theme.colors.background }]} testID="adaptive-shell-immersive">
        <ExitContext.Provider value={exitHarnais}>
          <SnackProvider bottomInset={insets.bottom}>{children}</SnackProvider>
        </ExitContext.Provider>
      </View>
    );

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]} testID={`adaptive-shell-${navMode}`}>
      <Appbar.Header mode="small" statusBarHeight={insets.top} style={{ backgroundColor: theme.colors.surface }}>
        {canGoBack ? (
          <Appbar.BackAction accessibilityLabel="Retour" onPress={() => router.back()} />
        ) : navMode !== 'drawer' ? (
          <KitIconButton icon="menu" accessibilityLabel="Ouvrir le menu" onPress={() => setDrawerOpen(true)} />
        ) : null}
        <Appbar.Content title={titleFor(pathname)} titleStyle={{ fontFamily: theme.fonts.titleLarge.fontFamily }} />
        <KitIconButton
          icon={theme.dark ? 'white-balance-sunny' : 'mi:dark-mode'}
          accessibilityLabel={theme.dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          accessibilityHint={pref === 'system' ? 'Le mode suit actuellement le système' : undefined}
          onPress={toggleDark}
          testID="toggle-dark"
        />
        <KitIconButton
          icon="palette-outline"
          accessibilityLabel="Choisir la palette et le mode"
          onPress={() => setPaletteOpen(true)}
          testID="open-palette"
        />
      </Appbar.Header>

      <View style={[styles.fill, styles.row]}>
        {navMode === 'rail' && <NavRail index={index} onSelect={select} insetLeft={insets.left} />}
        {navMode === 'drawer' && (
          <View
            style={[styles.panel, { paddingLeft: insets.left, backgroundColor: theme.kit.card }]}
            testID="side-panel"
          >
            <NavPanel />
          </View>
        )}
        <View
          style={[
            styles.fill,
            { paddingRight: insets.right, paddingLeft: navMode === 'bar' ? insets.left : 0 },
            navMode !== 'bar' && { paddingBottom: insets.bottom },
          ]}
        >
          <SnackProvider bottomInset={navMode !== 'bar' ? insets.bottom : 0}>{children}</SnackProvider>
        </View>
      </View>

      {navMode === 'bar' && (
        <BottomNavigation.Bar
          testID="bottom-bar"
          navigationState={{
            index,
            routes: DESTINATIONS.map((d) => ({
              key: d.key,
              title: d.label,
              focusedIcon: d.activeIcon,
              unfocusedIcon: d.icon,
              accessibilityLabel: d.label,
            })),
          }}
          onTabPress={({ route }) => {
            hapticToggle();
            select(DESTINATIONS.findIndex((d) => d.key === route.key));
          }}
          renderLabel={({ route, focused, color }) => (
            // Libellé actif en gras, comme la NavigationBar Flutter.
            <Text style={[font(focused ? '700' : '500', 12), styles.tabLabel, { color }]} numberOfLines={1}>
              {DESTINATIONS.find((x) => x.key === route.key)?.label}
            </Text>
          )}
          renderIcon={({ route, focused, color }) => {
            const d = DESTINATIONS.find((x) => x.key === route.key);
            return d ? <MaterialCommunityIcons name={focused ? d.activeIcon : d.icon} size={24} color={color} /> : null;
          }}
          safeAreaInsets={{ bottom: insets.bottom, left: insets.left, right: insets.right }}
        />
      )}

      <ModalDrawer visible={drawerOpen} onDismiss={closeDrawer}>
        <NavPanel onNavigate={closeDrawer} />
      </ModalDrawer>
      <PaletteSheet visible={paletteOpen} onDismiss={closePalette} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  panel: { width: 280 },
  tabLabel: { textAlign: 'center' },
});
