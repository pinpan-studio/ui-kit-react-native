import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavPanel } from '../src/shell/NavPanel';
import { normalize, searchCatalog } from '../src/showcase/search';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  usePathname: () => '/',
  router: { navigate: (...a: unknown[]) => mockNavigate(...a) },
}));

describe('searchCatalog', () => {
  it('ignore la casse et les accents', () => {
    expect(normalize('  Éléments ')).toBe('elements');
    const a = searchCatalog('mediAs');
    const b = searchCatalog('Médias');
    expect(a).toEqual(b);
    expect(a[0]).toMatchObject({ kind: 'category', category: { id: 'media' } });
  });

  it('trouve catégories et sections', () => {
    const hits = searchCatalog('table');
    expect(hits.some((h) => h.kind === 'section' && h.section.id === 'advanced-table')).toBe(true);
    const cat = searchCatalog('boutons');
    expect(cat).toEqual([expect.objectContaining({ kind: 'category' })]);
  });

  it('requête vide ou introuvable : aucun résultat', () => {
    expect(searchCatalog('   ')).toEqual([]);
    expect(searchCatalog('zzzz')).toEqual([]);
  });
});

describe('NavPanel : champ « Rechercher un composant… »', () => {
  const renderPanel = () =>
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <KitThemeProvider>
          <NavPanel />
        </KitThemeProvider>
      </SafeAreaProvider>,
    );

  it('filtre et ouvre une section', async () => {
    await renderPanel();
    const input = screen.getByLabelText('Rechercher un composant');
    await fireEvent.changeText(input, 'SIGNATURE');
    expect(screen.getByTestId('drawer-results')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Signature, dans Champs avancés'));
    expect(mockNavigate).toHaveBeenCalledWith('/components/fields?section=signature');
  });

  it('déplie une catégorie et ouvre une de ses sections', async () => {
    await renderPanel();
    expect(screen.getByText('COMPOSANTS')).toBeTruthy();
    expect(screen.queryByLabelText('Signature, dans Champs avancés')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Champs avancés'));
    await fireEvent.press(screen.getByLabelText('Signature, dans Champs avancés'));
    expect(mockNavigate).toHaveBeenCalledWith('/components/fields?section=signature');
    await fireEvent.press(screen.getByLabelText('Harnais (assistant IA)'));
    expect(mockNavigate).toHaveBeenCalledWith('/harnais');
  });

  it('affiche un état vide', async () => {
    await renderPanel();
    await fireEvent.changeText(screen.getByLabelText('Rechercher un composant'), 'xyzzy');
    expect(screen.getByText('Aucun résultat pour « xyzzy »')).toBeTruthy();
  });
});
