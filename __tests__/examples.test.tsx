import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PagesGalleryScreen from '../src/app/pages-gallery';
import PagesGallery from '../src/app/pages';
import ShowcasesGallery from '../src/app/showcases';
import { SnackProvider } from '../src/core/snack';
import { EX_CLIENTS, FM_ITEMS, fmSize } from '../src/data/examples';
import { AuthExample } from '../src/showcase/examples/AuthExample';
import { ExAppShell } from '../src/showcase/examples/ExAppShell';
import { BookingFormExample, CheckoutFormExample, SurveyFormExample } from '../src/showcase/examples/FormsExamples';
import { SHOWCASES } from '../src/showcase/examples/showcases';
import { PAGE_EXAMPLES, pageKind } from '../src/showcase/pageExamples';
import { useThemeStore } from '../src/store/themeStore';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  usePathname: () => '/pages/dashboard',
  router: {
    push: (...a: unknown[]) => mockPush(...a),
    back: jest.fn(),
    navigate: (...a: unknown[]) => mockPush(...a),
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

describe('authentification et formulaires', () => {
  it('connexion : erreur si le mot de passe est trop court', async () => {
    await renderKit(<AuthExample variant="centered" />);
    await fireEvent.press(screen.getByText('Se connecter'));
    expect(screen.getByText('Mot de passe incorrect. Essayez « demo ».')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Mot de passe'), 'demo');
    await fireEvent.press(screen.getByText('Se connecter'));
    expect(screen.queryByText('Mot de passe incorrect. Essayez « demo ».')).toBeNull();
  });

  it('inscription : conditions obligatoires à l’étape 2', async () => {
    await renderKit(<AuthExample variant="register" />);
    await fireEvent.press(screen.getByText('Continuer'));
    await fireEvent.press(screen.getByText('Continuer'));
    expect(screen.getByText('Acceptez les conditions pour continuer.')).toBeTruthy();
  });

  it('réservation : confirmation après choix du créneau', async () => {
    await renderKit(<BookingFormExample />);
    await fireEvent.press(screen.getByText('14:00'));
    await fireEvent.press(screen.getByText('Confirmer la réservation'));
    expect(screen.getByText('Formation utilisateurs · Mer 21 octobre à 14:00')).toBeTruthy();
  });

  it('commande : total et étapes', async () => {
    await renderKit(<CheckoutFormExample />);
    expect(screen.getAllByText(/82\s500\sF CFA/).length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByText('Continuer'));
    expect(screen.getByText('Wave')).toBeTruthy();
  });

  it('questionnaire : navigation entre questions', async () => {
    await renderKit(<SurveyFormExample />);
    await fireEvent.press(screen.getByLabelText('Note 9 sur 10'));
    await fireEvent.press(screen.getByText('Question suivante'));
    expect(screen.getByText('Question 2 sur 5')).toBeTruthy();
  });
});

describe('galeries', () => {
  it('galerie des pages : filtre par type', async () => {
    await renderKit(<PagesGalleryScreen />);
    expect(screen.getByText('33 pages')).toBeTruthy();
    // Le premier « Assistant » est la puce de filtre (les suivants sont les badges des cartes).
    await fireEvent.press(screen.getAllByText('Assistant')[0]!);
    expect(screen.getByText('3 pages')).toBeTruthy();
    expect(pageKind('app/clients/:id')).toBe('Détail');
  });

  it('showcases : groupes et ouverture', async () => {
    await renderKit(<ShowcasesGallery />);
    expect(screen.getByText(`${SHOWCASES.length} écrans complets, à prévisualiser en plein écran.`)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Tableau kanban'));
    expect(mockPush).toHaveBeenCalledWith('/showcases/app-kanban');
  });
});
