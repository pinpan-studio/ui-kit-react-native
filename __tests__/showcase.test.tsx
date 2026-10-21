import { fireEvent, render, screen, within } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ShowcaseHome from '../src/app/index';
import LayoutsPage from '../src/app/layouts';
import { SnackProvider } from '../src/core/snack';
import { AdaptiveShell } from '../src/shell/AdaptiveShell';
import { ThemeSettings } from '../src/shell/ThemeSettings';
import { LAYOUT_TEMPLATES } from '../src/showcase/layouts/templates';
import { AuthDemo } from '../src/showcase/layouts/AuthDemo';
import { DetailPageDemo } from '../src/showcase/layouts/DetailPageDemo';
import { PublicPageDemo } from '../src/showcase/layouts/PublicPageDemo';
import { DEMO_CLIENTS } from '../src/data/showcase';
import { useThemeStore } from '../src/store/themeStore';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

const mockNavigate = jest.fn();
const mockPush = jest.fn();
let mockPath = '/';
jest.mock('expo-router', () => ({
  usePathname: () => mockPath,
  useLocalSearchParams: () => ({}),
  router: {
    navigate: (...a: unknown[]) => mockNavigate(...a),
    push: (...a: unknown[]) => mockPush(...a),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
const renderKit = async (ui: ReactElement) =>
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <KitThemeProvider>
        <SnackProvider>{ui}</SnackProvider>
      </KitThemeProvider>
    </SafeAreaProvider>,
  );

beforeEach(() => {
  useThemeStore.setState({ mode: 'light', paletteId: 'cyan' });
  mockNavigate.mockClear();
  mockPush.mockClear();
  mockPath = '/';
});

describe('Showcase', () => {
  it('sections du catalogue Flutter et raccourcis', async () => {
    await renderKit(<ShowcaseHome />);
    const toc = within(screen.getByLabelText('Sommaire')).getAllByRole('tab');
    expect(toc.map((t) => t.props.accessibilityLabel ?? '')).toHaveLength(6);
    for (const id of ['themes', 'colors', 'typography', 'spacing', 'icons', 'catalog'])
      expect(screen.getByTestId(`section-${id}`)).toBeTruthy();
    await fireEvent.press(screen.getByText('Kanban'));
    expect(mockNavigate).toHaveBeenCalledWith('/components/planning?section=kanban');
  });

  it('chiffres clés : galeries, gabarits', async () => {
    await renderKit(<ShowcaseHome />);
    await fireEvent.press(screen.getByLabelText(`${LAYOUT_TEMPLATES.length} gabarits d’écran`));
    expect(mockNavigate).toHaveBeenCalledWith('/layouts');
  });

  it('filtre des icônes', async () => {
    await renderKit(<ShowcaseHome />);
    await fireEvent.changeText(screen.getByLabelText('Filtrer les icônes'), 'zzz');
    expect(screen.getByText('Aucune icône')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Filtrer les icônes'), 'local_ship');
    expect(screen.getByText('1 icône(s)')).toBeTruthy();
  });

  it('réglages de thème : mode et palette', async () => {
    await renderKit(<ThemeSettings />);
    await fireEvent.press(screen.getByTestId('palette-red'));
    expect(useThemeStore.getState().paletteId).toBe('red');
    expect(screen.getByLabelText('Palette Rouge').props.accessibilityState).toMatchObject({ selected: true });
  });
});

describe('Layouts', () => {
  it('7 gabarits ; une carte ouvre la démo plein écran', async () => {
    await renderKit(<LayoutsPage />);
    expect(screen.getByText('7 gabarits')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(/^Fiche détail\./));
    expect(mockPush).toHaveBeenCalledWith('/layouts/detail');
    await fireEvent.press(screen.getByLabelText(/^Dialogs & formulaires\./));
    expect(mockNavigate).toHaveBeenCalledWith('/components/feedback?section=modal');
  });

  it('panneau latéral : liste de tâches', async () => {
    await renderKit(<LayoutsPage />);
    await fireEvent.press(screen.getByLabelText(/^Panneau latéral \/ feuille\./));
    expect(screen.getByText('Tâches du jour')).toBeTruthy();
  });

  it('les démos s’affichent sans la navigation du catalogue', async () => {
    mockPath = '/layouts/auth';
    await renderKit(
      <AdaptiveShell>
        <Text>Démo</Text>
      </AdaptiveShell>,
    );
    expect(screen.getByTestId('adaptive-shell-immersive')).toBeTruthy();
    expect(screen.queryByTestId('bottom-bar')).toBeNull();
  });
});

describe('démos de gabarits', () => {
  it('authentification : mot de passe oublié puis retour', async () => {
    await renderKit(<AuthDemo />);
    expect(screen.getByText('Connexion')).toBeTruthy();
    await fireEvent.press(screen.getByText('Mot de passe oublié ?'));
    expect(screen.getByText('Envoyer le code')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Retour à la connexion'));
    expect(screen.getByText('Se connecter')).toBeTruthy();
  });

  it('fiche détail : onglets', async () => {
    await renderKit(<DetailPageDemo client={DEMO_CLIENTS[0]!} />);
    expect(screen.getByText('Coordonnées')).toBeTruthy();
    await fireEvent.press(screen.getByText('Factures'));
    expect(screen.getByText('FAC-2026-0912')).toBeTruthy();
  });

  it('page publique : total et moyens de paiement', async () => {
    await renderKit(<PublicPageDemo />);
    await fireEvent.press(screen.getByText(/^Payer 585\s000\sFCFA$/));
    expect(screen.getByLabelText('Payer avec Wave')).toBeTruthy();
  });
});
