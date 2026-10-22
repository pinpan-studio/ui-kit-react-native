import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SnackProvider } from '../src/core/snack';
import { InboxExample } from '../src/showcase/examples/AppComms';
import { CheckoutFormExample } from '../src/showcase/examples/FormsExamples';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

jest.mock('expo-router', () => ({
  usePathname: () => '/',
  router: { navigate: jest.fn(), push: jest.fn(), back: jest.fn() },
}));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
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

// Mêmes cas que `test/forms_keyboard_test.dart` et `test/inbox_swipe_test.dart` du kit Flutter.
describe('Commande : enchaînement des champs au clavier', () => {
  it('« Suivant » sur les premiers champs, « OK » sur le dernier, barre d’action visible', async () => {
    await renderKit(<CheckoutFormExample />);
    const fields = [
      screen.getByDisplayValue('Aya Koné'),
      screen.getByDisplayValue('+225 07 07 12 34 56'),
      screen.getByDisplayValue('Cocody Angré, 8e tranche'),
      screen.getByPlaceholderText('Portail bleu, à côté de la pharmacie…'),
    ];
    expect(fields.slice(0, 3).map((f) => f.props.returnKeyType)).toEqual(['next', 'next', 'next']);
    expect(fields[3]!.props.returnKeyType).toBe('done');
    expect(screen.getByText('Continuer')).toBeTruthy();
  });
});

describe('Messagerie : balayer pour archiver', () => {
  it('archive le message, « Annuler » le restaure', async () => {
    await renderKit(<InboxExample />);
    expect(screen.getAllByText('Aya Koné').length).toBeGreaterThan(0);
    // Ligne balayable (SwipeRow) : action d'accessibilité « archive », comme un lecteur d'écran.
    // Remonte du nom de l'expéditeur jusqu'à la ligne balayable qui porte l'action « archive ».
    let row = screen.getAllByText('Aya Koné')[0]!;
    while (!row.props.accessibilityActions?.some((x: { name: string }) => x.name === 'archive')) row = row.parent!;
    await fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'archive' } });
    expect(screen.queryByText('Aya Koné')).toBeNull();
    expect(screen.getByText('Message archivé')).toBeTruthy();
    await fireEvent.press(screen.getByText('Annuler'));
    expect(screen.getAllByText('Aya Koné').length).toBeGreaterThan(0);
  });
});
