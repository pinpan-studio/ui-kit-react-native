import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { KitDataTable } from '../src/components';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

let mockWidth = 390;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 844, scale: 3, fontScale: 1 }),
}));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
const ROWS = Array.from({ length: 20 }, (_, i) => `Client ${i + 1}`);

const renderTable = async () =>
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <KitThemeProvider>
        <KitDataTable<string>
          rows={ROWS}
          keyOf={(r) => r}
          columns={[{ label: 'Nom', cell: (r) => <Text>{r}</Text> }]}
          cardBuilder={(r) => <Text>{r}</Text>}
          initialMode="card"
        />
      </KitThemeProvider>
    </SafeAreaProvider>,
  );

// Mêmes cas que `test/data_table_test.dart` du kit Flutter.
describe('KitDataTable : cartes sur téléphone', () => {
  it('« Afficher plus » ajoute une tranche, sans pages', async () => {
    mockWidth = 390;
    await renderTable();
    expect(screen.getByText('8 sur 20')).toBeTruthy();
    expect(screen.queryByText('Client 9')).toBeNull();
    await fireEvent.press(screen.getByText('Afficher 8 de plus'));
    expect(screen.getByText('16 sur 20')).toBeTruthy();
    expect(screen.getByText('Client 9')).toBeTruthy();
    await fireEvent.press(screen.getByText('Afficher 4 de plus'));
    expect(screen.getByText('20 sur 20')).toBeTruthy();
    expect(screen.queryByText(/de plus/)).toBeNull();
  });

  it('tablette : la pagination reste', async () => {
    mockWidth = 800;
    await renderTable();
    expect(screen.queryByText(/de plus/)).toBeNull();
    expect(screen.queryByText('8 sur 20')).toBeNull();
  });
});
