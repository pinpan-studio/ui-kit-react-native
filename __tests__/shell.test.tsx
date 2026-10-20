import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { navModeFor } from '../src/shell/destinations';
import { AdaptiveShell } from '../src/shell/AdaptiveShell';
import { useThemeStore } from '../src/store/themeStore';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

jest.mock('expo-router', () => ({
  usePathname: () => '/',
  router: { navigate: jest.fn(), back: jest.fn() },
}));

let mockWidth = 390;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 844, scale: 3, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 390;
});

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
});
