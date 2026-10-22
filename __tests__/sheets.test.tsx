import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FormSheet, KitBottomSheet, ModalDrawer } from '../src/components';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

const wrap = (ui: ReactElement) => (
  <SafeAreaProvider initialMetrics={metrics}>
    <KitThemeProvider>{ui}</KitThemeProvider>
  </SafeAreaProvider>
);

/** Laisse les animations d'entrée / de sortie se terminer. */
const settle = async () => {
  await act(() => new Promise((resolve) => setTimeout(resolve, 450)));
};

describe('KitBottomSheet : sortie animée et fermeture unique', () => {
  it('le fond ferme la feuille : onDismiss une seule fois, après l’animation', async () => {
    const onDismiss = jest.fn();
    await render(
      wrap(
        <KitBottomSheet visible onDismiss={onDismiss}>
          <Text>Contenu</Text>
        </KitBottomSheet>,
      ),
    );
    await settle();
    const scrim = screen.getByLabelText('Fermer', { includeHiddenElements: true });
    await fireEvent.press(scrim);
    await fireEvent.press(scrim);
    await settle();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('fermeture par le parent : animation de sortie sans appeler onDismiss', async () => {
    const onDismiss = jest.fn();
    const sheet = (visible: boolean) =>
      wrap(
        <KitBottomSheet visible={visible} onDismiss={onDismiss}>
          <Text>Contenu</Text>
        </KitBottomSheet>,
      );
    const view = await render(sheet(true));
    await settle();
    expect(screen.getByText('Contenu')).toBeTruthy();
    await view.rerender(sheet(false));
    await settle();
    expect(onDismiss).not.toHaveBeenCalled();
    expect(screen.queryByText('Contenu')).toBeNull();
  });

  it('FormSheet garde ses actions et se ferme par « Annuler »', async () => {
    const onDismiss = jest.fn();
    await render(
      wrap(
        <FormSheet visible title="Client" onDismiss={onDismiss}>
          <Text>Champs</Text>
        </FormSheet>,
      ),
    );
    await settle();
    await fireEvent.press(screen.getByText('Annuler'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('ModalDrawer : sortie animée', () => {
  it('le voile ferme le tiroir une seule fois', async () => {
    const onDismiss = jest.fn();
    await render(
      wrap(
        <ModalDrawer visible onDismiss={onDismiss}>
          <Text>Menu</Text>
        </ModalDrawer>,
      ),
    );
    await settle();
    await fireEvent.press(screen.getByLabelText('Fermer le menu', { includeHiddenElements: true }));
    await settle();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
