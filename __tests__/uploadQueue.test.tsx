import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UploadQueue } from '../src/components';
import { useThemeStore } from '../src/store/themeStore';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

// Fichier séparé : les minuteurs simulés de ce test ne doivent pas déborder sur les autres.
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

beforeEach(() => useThemeStore.setState({ mode: 'light', paletteId: 'cyan' }));

describe('UploadQueue', () => {
  it('envoie les fichiers ; « photo » échoue puis peut être relancé', async () => {
    jest.useFakeTimers();
    const { unmount } = await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <KitThemeProvider>
          <UploadQueue />
        </KitThemeProvider>
      </SafeAreaProvider>,
    );
    await fireEvent.press(screen.getByText('Envoyer 5 fichiers'));
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    expect(screen.getByText('4 / 5 envoyé(s) · 1 échec(s)')).toBeTruthy();
    expect(screen.getByText('Échec : délai dépassé')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Réessayer photo-installation.png'));
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    expect(screen.getByText('5 / 5 envoyé(s)')).toBeTruthy();
    // Démonter tant que les minuteurs simulés sont actifs, sinon l'intervalle survit au test.
    await unmount();
    jest.useRealTimers();
  });
});
