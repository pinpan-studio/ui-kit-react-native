import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavPanel } from '../src/shell/NavPanel';
import { createSectionScroller } from '../src/showcase/doc/sectionScroller';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  usePathname: () => '/',
  router: { navigate: (...a: unknown[]) => mockNavigate(...a) },
}));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
const wrap = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <KitThemeProvider>{ui}</KitThemeProvider>
    </SafeAreaProvider>,
  );

const layout = (y: number) => ({ nativeEvent: { layout: { x: 0, y, width: 300, height: 200 } } });

describe('défilement vers ?section=', () => {
  it('createSectionScroller défile une fois quand la cible est mesurée', () => {
    const to = jest.fn();
    const s = createSectionScroller('states', to);
    s.onLayout('variants', 100);
    expect(to).not.toHaveBeenCalled();
    s.onLayout('states', 640);
    s.onLayout('states', 700);
    expect(to).toHaveBeenCalledTimes(1);
    expect(to).toHaveBeenCalledWith(632);
  });

  it('sans section : aucun défilement', () => {
    const to = jest.fn();
    const s = createSectionScroller(undefined, to);
    s.onLayout('a', 10);
    expect(to).not.toHaveBeenCalled();
  });
});

describe('tiroir : entrées Flutter KitDrawer', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('contient Pages d’exemple, Galerie des pages, Showcases', async () => {
    await wrap(<NavPanel />);
    for (const l of ['UI Showcase', 'Harnais (assistant IA)', 'Pages d’exemple', 'Galerie des pages', 'Showcases']) {
      expect(screen.getByLabelText(l)).toBeTruthy();
    }
    await fireEvent.press(screen.getByLabelText('Galerie des pages'));
    expect(mockNavigate).toHaveBeenCalledWith('/pages-gallery');
  });
});
