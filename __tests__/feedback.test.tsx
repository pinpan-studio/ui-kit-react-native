import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  ConfirmDialog,
  GlobalBanner,
  KitAlert,
  KitButton,
  PriorityMessage,
  PromptDialog,
  ResultView,
} from '../src/components';
import { SnackProvider, useKitSnack } from '../src/core/snack';
import { useThemeStore } from '../src/store/themeStore';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
const renderKit = async (ui: ReactElement) =>
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <KitThemeProvider>
        <SnackProvider>{ui}</SnackProvider>
      </KitThemeProvider>
    </SafeAreaProvider>,
  );

beforeEach(() => useThemeStore.setState({ mode: 'light', paletteId: 'cyan' }));

describe('alertes et bannières', () => {
  it('KitAlert : rôle alerte, action et fermeture', async () => {
    const onClose = jest.fn();
    const onAction = jest.fn();
    await renderKit(
      <KitAlert
        tone="info"
        title="Mise à jour"
        text="Firmware disponible."
        action="Planifier"
        onAction={onAction}
        onClose={onClose}
      />,
    );
    expect(screen.getByText('Mise à jour')).toBeTruthy();
    await fireEvent.press(screen.getByText('Planifier'));
    await fireEvent.press(screen.getByLabelText('Fermer l’alerte'));
    expect(onAction).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('KitAlert compacte : titre et texte sur une ligne', async () => {
    await renderKit(<KitAlert compact tone="success" title="OK" text="Enregistré." />);
    expect(screen.getByText('OK — Enregistré.')).toBeTruthy();
  });

  it('GlobalBanner : titre, complément et fermeture', async () => {
    const onClose = jest.fn();
    await renderKit(<GlobalBanner tone="warning" title="Abonnement" text="dans 12 jours" onClose={onClose} />);
    expect(screen.getByText(/dans 12 jours/)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Fermer la bannière'));
    expect(onClose).toHaveBeenCalled();
  });

  it('ResultView : titre annoncé et actions', async () => {
    await renderKit(
      <ResultView
        tone="success"
        title="Paiement confirmé"
        actions={<KitButton label="Voir le reçu" onPress={() => undefined} />}
      />,
    );
    expect(screen.getByRole('header', { name: 'Paiement confirmé' })).toBeTruthy();
    expect(screen.getByText('Voir le reçu')).toBeTruthy();
  });
});

describe('dialogues', () => {
  it('ConfirmDialog : la saisie de confirmation déverrouille le bouton', async () => {
    const onResult = jest.fn();
    await renderKit(
      <ConfirmDialog
        visible
        title="Résilier ?"
        message="…"
        confirm="Résilier"
        danger
        typeToConfirm="CTR-0042"
        onResult={onResult}
      />,
    );
    const confirm = screen.getByRole('button', { name: 'Résilier' });
    expect(confirm.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.changeText(screen.getByLabelText('Saisissez CTR-0042 pour confirmer'), 'CTR-0042');
    await fireEvent.press(screen.getByRole('button', { name: 'Résilier' }));
    expect(onResult).toHaveBeenCalledWith(true);
  });

  it('ConfirmDialog : Annuler renvoie false', async () => {
    const onResult = jest.fn();
    await renderKit(<ConfirmDialog visible title="Clôturer ?" message="…" onResult={onResult} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Annuler' }));
    expect(onResult).toHaveBeenCalledWith(false);
  });

  it('PromptDialog : valeur initiale modifiable', async () => {
    const onResult = jest.fn();
    await renderKit(
      <PromptDialog visible title="Renommer" initial="Livraisons Nord" hint="Nom du groupe" onResult={onResult} />,
    );
    await fireEvent.changeText(screen.getByLabelText('Nom du groupe'), 'Livraisons Sud');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onResult).toHaveBeenCalledWith('Livraisons Sud');
  });

  it('PriorityMessage : bloquant tant que « J’ai lu » n’est pas coché', async () => {
    const onDismiss = jest.fn();
    await renderKit(<PriorityMessage visible title="Maintenance" message="…" onDismiss={onDismiss} />);
    expect(screen.queryByLabelText('Fermer')).toBeNull();
    expect(screen.getByRole('button', { name: 'Continuer' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
    await fireEvent.press(screen.getByRole('checkbox', { name: 'J’ai lu et compris ce message' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(onDismiss).toHaveBeenCalled();
  });
});

function SnackDemo() {
  const snack = useKitSnack();
  return (
    <>
      <Text
        onPress={() => snack.show('Tâche supprimée', { action: 'Annuler', onAction: () => snack.show('Restaurée') })}
      >
        Supprimer
      </Text>
      <Text onPress={() => snack.banner('Message en haut')}>Bannière</Text>
    </>
  );
}

describe('snackbars', () => {
  it('action « Annuler » et bannière du haut', async () => {
    await renderKit(<SnackDemo />);
    await fireEvent.press(screen.getByText('Supprimer'));
    expect(await screen.findByText('Tâche supprimée')).toBeTruthy();
    await fireEvent.press(screen.getByText('Annuler'));
    expect(await screen.findByText('Restaurée')).toBeTruthy();
    await fireEvent.press(screen.getByText('Bannière'));
    expect(screen.getByText('Message en haut')).toBeTruthy();
    await fireEvent.press(screen.getByText('OK'));
    expect(screen.queryByText('Message en haut')).toBeNull();
  });
});
