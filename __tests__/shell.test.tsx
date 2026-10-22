import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { navModeFor } from '../src/shell/destinations';
import { AdaptiveShell, useShellExit } from '../src/shell/AdaptiveShell';
import { useThemeStore } from '../src/store/themeStore';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

let mockPath = '/';
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  usePathname: () => mockPath,
  router: { navigate: (...a: unknown[]) => mockNavigate(...a), back: jest.fn() },
}));

let mockWidth = 390;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 844, scale: 3, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 390;
  mockPath = '/';
  mockNavigate.mockClear();
});

/** Écran immersif de test : sa propre action de sortie, comme le Harnais. */
function Immersive() {
  const exit = useShellExit();
  return (
    <Pressable accessibilityLabel="Retour au catalogue" onPress={exit}>
      <Text>Contenu</Text>
    </Pressable>
  );
}

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

const renderShell = async () =>
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <KitThemeProvider>
        <AdaptiveShell>
          <Text>Contenu</Text>
        </AdaptiveShell>
      </KitThemeProvider>
    </SafeAreaProvider>,
  );

describe('navigation adaptative', () => {
  it('barre < 600, rail 600–840, panneau > 840', () => {
    expect(navModeFor(390)).toBe('bar');
    expect(navModeFor(600)).toBe('rail');
    expect(navModeFor(839)).toBe('rail');
    expect(navModeFor(840)).toBe('drawer');
  });
});

describe('AdaptiveShell', () => {
  it('rend la barre du bas, le contenu et des boutons d’icône nommés', async () => {
    await renderShell();
    expect(screen.getByText('Contenu')).toBeTruthy();
    expect(screen.getByTestId('bottom-bar')).toBeTruthy();
    expect(screen.getByLabelText('Choisir la palette et le mode')).toBeTruthy();
    expect(screen.getByLabelText('Ouvrir le menu')).toBeTruthy();
  });

  it('tablette 700 dp : rail ; 1024 dp : panneau latéral', async () => {
    mockWidth = 700;
    const r = await renderShell();
    expect(screen.getByTestId('adaptive-shell-rail')).toBeTruthy();
    expect(screen.queryByTestId('bottom-bar')).toBeNull();
    await r.unmount();
    mockWidth = 1024;
    await renderShell();
    expect(screen.getByTestId('side-panel')).toBeTruthy();
  });

  it('le bouton mode sombre bascule le thème', async () => {
    useThemeStore.setState({ mode: 'light' });
    await renderShell();
    await fireEvent.press(screen.getByTestId('toggle-dark'));
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('la feuille de palettes change la palette', async () => {
    await renderShell();
    await fireEvent.press(screen.getByTestId('open-palette'));
    await fireEvent.press(screen.getByTestId('palette-red'));
    expect(useThemeStore.getState().paletteId).toBe('red');
  });

  it('Harnais : plein écran, sortie vers la destination précédente', async () => {
    mockPath = '/layouts';
    const tree = () => (
      <SafeAreaProvider initialMetrics={metrics}>
        <KitThemeProvider>
          <AdaptiveShell>
            <Immersive />
          </AdaptiveShell>
        </KitThemeProvider>
      </SafeAreaProvider>
    );
    const r = await render(tree());
    mockPath = '/harnais';
    await r.rerender(tree());
    expect(screen.getByTestId('adaptive-shell-immersive')).toBeTruthy();
    expect(screen.queryByTestId('bottom-bar')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Retour au catalogue'));
    expect(mockNavigate).toHaveBeenCalledWith('/layouts');
  });

  it('Harnais en tablette : ni rail ni panneau', async () => {
    mockWidth = 1024;
    mockPath = '/harnais';
    await renderShell();
    expect(screen.queryByTestId('side-panel')).toBeNull();
    expect(screen.getByTestId('adaptive-shell-immersive')).toBeTruthy();
  });
});
