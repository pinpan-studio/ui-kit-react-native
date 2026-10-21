import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PagesGallery from '../src/app/pages';
import { SnackProvider } from '../src/core/snack';
import { EX_CLIENTS, FM_ITEMS, fmSize } from '../src/data/examples';
import { ExAppShell } from '../src/showcase/examples/ExAppShell';
import { PAGE_EXAMPLES } from '../src/showcase/pageExamples';
import { useThemeStore } from '../src/store/themeStore';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  usePathname: () => '/pages/dashboard',
  router: { push: (...a: unknown[]) => mockPush(...a), back: jest.fn(), navigate: jest.fn(), replace: jest.fn() },
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
  mockPush.mockClear();
});

describe('données des exemples', () => {
  it('clients générés comme la référence Angular / Flutter', () => {
    expect(EX_CLIENTS).toHaveLength(24);
    expect(EX_CLIENTS[0]).toMatchObject({ id: 'c-101', email: 'aya.kone@sotralogisti.ci', status: 'actif' });
    expect(EX_CLIENTS[19]!.email).toBe('kadi.fofana@assurivoire.ci');
    expect(EX_CLIENTS[1]!.phone).toBe('+225 07 47 63 81');
  });

  it('tailles de fichiers et arborescence', () => {
    expect(fmSize(184320)).toBe('180 Ko');
    expect(fmSize(4812000)).toBe('4,6 Mo');
    expect(fmSize(undefined)).toBe('—');
    expect(FM_ITEMS.filter((f) => f.parent === 'photos')).toHaveLength(7);
  });
});

describe('pages d’exemple', () => {
  it('index : 33 entrées en 3 groupes', async () => {
    await renderKit(<PagesGallery />);
    expect(PAGE_EXAMPLES).toHaveLength(33);
    expect(screen.getByText('APPLICATIONS')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Supervision. État des services'));
    expect(mockPush).toHaveBeenCalledWith('/pages/monitoring');
  });

  it('shell : tableau de bord, menu, fiche client empilée puis retour', async () => {
    await renderKit(<ExAppShell initial="dashboard" />);
    expect(screen.getByText('Facturé et encaissé')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Afficher le menu'));
    await fireEvent.press(screen.getAllByText('Clients').at(-1)!);
    expect(screen.getByText(/24 comptes/)).toBeTruthy();
    await fireEvent.press(screen.getAllByText('Sotra Logistique')[0]!);
    expect(screen.getByText('c-101 · Transport · Abidjan')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Retour'));
    expect(screen.getByText(/24 comptes/)).toBeTruthy();
  });

  it('messagerie : lecture puis archivage', async () => {
    await renderKit(<ExAppShell initial="inbox" />);
    await fireEvent.press(screen.getByLabelText(/^Aya Koné\. Livraison du lot 14/));
    expect(screen.getByText('bon-livraison-14.pdf')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Archiver'));
    expect(screen.queryByText('bon-livraison-14.pdf')).toBeNull();
  });

  it('paramètres : sections', async () => {
    await renderKit(<ExAppShell initial="settings" />);
    await fireEvent.press(screen.getByText('API & intégrations'));
    expect(screen.getByText('Clé secrète')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Afficher la clé'));
    expect(screen.getByText('sk_demo_51Nf3a9QeLx2Tb8Rk0pYv')).toBeTruthy();
  });

  it('fichiers : ouverture d’un dossier', async () => {
    await renderKit(<ExAppShell initial="files" />);
    await fireEvent.press(screen.getByLabelText('Photos terrain'));
    expect(screen.getAllByText(/Flotte stationnée - Plateau\.jpg/).length).toBeGreaterThan(0);
  });
});
