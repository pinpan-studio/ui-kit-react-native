import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Appbar, BottomNavigation, Modal, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SnackProvider } from '../core/snack';
import { hapticToggle, KitIconButton, useBackClose } from '../mobile';
import { categoryById } from '../showcase/kitNav';
import { pageExampleBySlug } from '../showcase/pageExamples';
import { useThemeStore } from '../store/themeStore';
import { useKitTheme } from '../theme/useKitTheme';
import { activeIndex, DESTINATIONS, navModeFor } from './destinations';
import { NavPanel } from './NavPanel';
import { NavRail } from './NavRail';
import { PaletteSheet } from './PaletteSheet';

function titleFor(pathname: string): string {
  if (pathname === '/') return 'UI Showcase';
  const m = pathname.match(/^\/components\/([^/]+)/);
  if (m?.[1]) return categoryById(m[1])?.label ?? 'Composants';
  if (pathname === '/pages') return 'Pages d’exemple';
  const page = pathname.match(/^\/pages\/([^/]+)/);
  if (page?.[1]) return pageExampleBySlug(page[1])?.title ?? 'Exemple';
  return DESTINATIONS[activeIndex(pathname)]?.label ?? 'UI Kit';
}

/**
 * Shell adaptatif : barre d'application + navigation selon les classes de largeur Material 3 :
 * barre en bas < 600 dp (comme Flutter, avec tiroir), rail 600–840 dp, panneau latéral permanent au-delà.
 * Sur l'onglet Harnais, toute la navigation est masquée (comme kit_shell.dart) et une action de sortie
 * ramène à la destination précédente.
 * Les démos de gabarits (`/layouts/<démo>`) s'affichent en plein écran, avec leur propre barre, comme les
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
  useBackClose(harnais, exitHarnais);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pref = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  useBackClose(drawerOpen, closeDrawer);

  const select = (i: number) => {
    const d = DESTINATIONS[i];
    if (d) router.navigate(d.href);
  };
  const toggleDark = () => {
    hapticToggle();
    setMode(theme.dark ? 'light' : 'dark');
  };
  const canGoBack = pathname.split('/').filter(Boolean).length > 1;

  if (/^\/layouts\/[^/]+/.test(pathname))
    return (
      <View style={[styles.fill, { backgroundColor: theme.colors.background }]} testID="adaptive-shell-immersive">
        <SnackProvider bottomInset={insets.bottom}>{children}</SnackProvider>
      </View>
    );

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]} testID={`adaptive-shell-${navMode}`}>
      <Appbar.Header mode="small" statusBarHeight={insets.top} style={{ backgroundColor: theme.colors.surface }}>
        {harnais ? (
          <KitIconButton
            icon="close"
            accessibilityLabel="Quitter le harnais"
            onPress={exitHarnais}
            testID="exit-harnais"
          />
        ) : canGoBack ? (
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
        {!harnais && navMode === 'rail' && <NavRail index={index} onSelect={select} insetLeft={insets.left} />}
        {!harnais && navMode === 'drawer' && (
          <View
            style={[styles.panel, { paddingLeft: insets.left, backgroundColor: theme.roles.surfaceContainerLow }]}
            testID="side-panel"
          >
            <NavPanel />
          </View>
        )}
        <View
          style={[
            styles.fill,
            { paddingRight: insets.right, paddingLeft: harnais || navMode === 'bar' ? insets.left : 0 },
            (harnais || navMode !== 'bar') && { paddingBottom: insets.bottom },
          ]}
        >
          <SnackProvider bottomInset={harnais || navMode !== 'bar' ? insets.bottom : 0}>{children}</SnackProvider>
        </View>
      </View>

      {!harnais && navMode === 'bar' && (
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
          renderIcon={({ route, focused, color }) => {
            const d = DESTINATIONS.find((x) => x.key === route.key);
            return d ? <MaterialCommunityIcons name={focused ? d.activeIcon : d.icon} size={24} color={color} /> : null;
          }}
          safeAreaInsets={{ bottom: insets.bottom, left: insets.left, right: insets.right }}
        />
      )}

      <Portal>
        <Modal
          visible={drawerOpen}
          onDismiss={closeDrawer}
          style={styles.drawerModal}
          contentContainerStyle={[
            styles.drawer,
            { backgroundColor: theme.roles.surfaceContainerLow, paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <NavPanel onNavigate={closeDrawer} />
        </Modal>
      </Portal>
      <PaletteSheet visible={paletteOpen} onDismiss={closePalette} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  panel: { width: 280 },
  drawerModal: { justifyContent: 'flex-start', alignItems: 'flex-start', margin: 0 },
  drawer: { width: 300, maxWidth: '85%', height: '100%', borderTopRightRadius: 16, borderBottomRightRadius: 16 },
});
