import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  Breadcrumb,
  KitChart,
  KitDataTable,
  KitPaginator,
  KitStepper,
  KitTabs,
  QrBlock,
  StepsIndicator,
  code128,
  dayKey,
  diffLines,
  niceScale,
  type KitColumn,
} from '../src/components';
import { SnackProvider } from '../src/core/snack';
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

describe('logique', () => {
  it('Code 128 B : départ, clé modulo 103, arrêt, 11 modules par symbole', () => {
    const w = code128('AB');
    // Départ B (104), A (33), B (34), clé (104 + 33 + 68) % 103 = 102, arrêt.
    expect(w.slice(0, 6)).toEqual([2, 1, 1, 2, 1, 4]);
    expect(w.slice(-7)).toEqual([2, 3, 3, 1, 1, 1, 2]);
    expect(w.slice(18, 24)).toEqual([4, 1, 1, 1, 3, 1]);
    const symbols = w.slice(0, -7);
    for (let i = 0; i < symbols.length; i += 6) expect(symbols.slice(i, i + 6).reduce((a, b) => a + b, 0)).toBe(11);
    expect(code128('FAC-2026-0912')).toHaveLength(6 * 15 + 7);
  });

  it('diff ligne à ligne (plus longue sous-séquence commune)', () => {
    expect(diffLines('a\nb\nc', 'a\nx\nc')).toEqual([
      { op: 'same', text: 'a', oldNo: 1, newNo: 1 },
      { op: 'del', text: 'b', oldNo: 2 },
      { op: 'add', text: 'x', newNo: 2 },
      { op: 'same', text: 'c', oldNo: 3, newNo: 3 },
    ]);
  });

  it('échelle « ronde » des axes', () => {
    expect(niceScale(55.8)).toEqual({ max: 60, step: 10 });
    expect(niceScale(155)).toEqual({ max: 200, step: 50 });
    expect(niceScale(9)).toEqual({ max: 10, step: 2 });
  });

  it('groupes de jours du journal d’audit', () => {
    const now = new Date(2026, 9, 21, 15, 0);
    expect(dayKey(new Date(2026, 9, 21, 9, 0), now)).toBe('Aujourd’hui');
    expect(dayKey(new Date(2026, 9, 20, 23, 0), now)).toBe('Hier');
    expect(dayKey(new Date(2026, 9, 14, 9, 0), now)).toBe('mercredi 14 octobre');
  });
});

interface Row {
  id: string;
  name: string;
  qty: number;
}
const ROWS: Row[] = [
  { id: '1', name: 'Bravo', qty: 3 },
  { id: '2', name: 'Alpha', qty: 10 },
  { id: '3', name: 'Charlie', qty: 1 },
];
const COLS: KitColumn<Row>[] = [
  { label: 'Nom', cell: (r) => r.name, sortValue: (r) => r.name },
  {
    label: 'Quantité',
    numeric: true,
    cell: (r) => String(r.qty),
    sortValue: (r) => r.qty,
    total: (rs) => String(rs.reduce((a, r) => a + r.qty, 0)),
  },
  { label: 'Code', hidden: true, cell: (r) => `C-${r.id}` },
];

describe('KitDataTable', () => {
  const table = (onBulk = jest.fn()) => (
    <KitDataTable
      rows={ROWS}
      columns={COLS}
      keyOf={(r) => r.id}
      searchText={(r) => r.name}
      cardBuilder={(r) => <Text>{`carte ${r.name}`}</Text>}
      selectable
      bulkActions={[{ id: 'delete', label: 'Supprimer', icon: 'mi:delete-outline', danger: true }]}
      onBulk={onBulk}
    />
  );

  it('vue tableau : tri, colonnes masquées, total', async () => {
    await renderKit(table());
    expect(screen.queryByText('C-1')).toBeNull();
    expect(screen.getByText('Total (3)')).toBeTruthy();
    expect(screen.getByText('14')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Nom' }));
    const names = screen.getAllByText(/^(Alpha|Bravo|Charlie)$/).map((n) => n.props.children);
    expect(names).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(screen.getByRole('button', { name: 'Nom, tri croissant' })).toBeTruthy();
  });

  it('recherche et état vide', async () => {
    await renderKit(table());
    await fireEvent.changeText(screen.getByLabelText('Rechercher…'), 'zzz');
    expect(screen.getByText('Aucun résultat')).toBeTruthy();
  });

  it('sélection puis action groupée', async () => {
    const onBulk = jest.fn();
    await renderKit(table(onBulk));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Tout sélectionner' }));
    expect(screen.getByText('3 sélectionné(s)')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Supprimer' }));
    expect((onBulk.mock.calls[0]?.[1] as Row[]).map((r) => r.id)).toEqual(['1', '2', '3']);
    expect(screen.queryByText('3 sélectionné(s)')).toBeNull();
  });

  it('vue cartes', async () => {
    await renderKit(table());
    await fireEvent.press(screen.getByRole('radio', { name: 'Cartes' }));
    expect(screen.getByText('carte Bravo')).toBeTruthy();
  });
});

describe('navigation', () => {
  it('KitPaginator : plage, pages visibles, bornes', async () => {
    const onPage = jest.fn();
    await renderKit(<KitPaginator page={3} pageSize={10} total={248} onPage={onPage} />);
    expect(screen.getByText('21–30 sur 248')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Page 25' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Page 3' }).props.accessibilityState).toMatchObject({ selected: true });
    await fireEvent.press(screen.getByRole('button', { name: 'Suivant' }));
    expect(onPage).toHaveBeenCalledWith(4);
  });

  it('StepsIndicator : étape courante et retour arrière seulement', async () => {
    const onPress = jest.fn();
    await renderKit(<StepsIndicator steps={['Client', 'Véhicules', 'Offre']} current={1} onPress={onPress} />);
    expect(screen.getByText('Étape 2 sur 3 · Véhicules')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Étape 1 : Client, terminée' }));
    expect(onPress).toHaveBeenCalledWith(0);
    expect(screen.getByRole('button', { name: 'Étape 3 : Offre' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('KitStepper : Continuer avance, contenu de l’étape courante', async () => {
    const onChange = jest.fn();
    await renderKit(
      <KitStepper
        current={0}
        onChange={onChange}
        steps={[
          { label: 'Devis', content: <Text>Contenu devis</Text> },
          { label: 'Pose', content: <Text>Contenu pose</Text> },
        ]}
      />,
    );
    expect(screen.getByText('Contenu devis')).toBeTruthy();
    expect(screen.queryByText('Contenu pose')).toBeNull();
    await fireEvent.press(screen.getByText('Continuer'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('KitTabs et Breadcrumb', async () => {
    const onSelect = jest.fn();
    const onCrumb = jest.fn();
    await renderKit(
      <>
        <KitTabs tabs={[{ label: 'Infos' }, { label: 'Véhicules', count: 12 }]} selected={0} onSelect={onSelect} />
        <Breadcrumb items={['Accueil', 'Clients', 'Fiche']} onPress={onCrumb} />
      </>,
    );
    await fireEvent.press(screen.getByRole('tab', { name: 'Véhicules, 12' }));
    expect(onSelect).toHaveBeenCalledWith(1);
    await fireEvent.press(screen.getByText('Clients'));
    expect(onCrumb).toHaveBeenCalledWith(1);
  });
});

describe('affichage', () => {
  it('KitChart : résumé accessible des données', async () => {
    await renderKit(<KitChart kind="bar" labels={['T1', 'T2']} series={[{ label: 'CA', data: [12, 15] }]} unit=" M" />);
    expect(screen.getByLabelText('Graphique : CA : T1 12 M, T2 15 M')).toBeTruthy();
  });

  it('KitChart anneau : légende avec valeurs', async () => {
    await renderKit(
      <KitChart kind="doughnut" labels={['A', 'B']} series={[{ label: 'Part', data: [60, 40] }]} unit=" %" />,
    );
    expect(screen.getByText('A · 60 %')).toBeTruthy();
    // Le centre de l'anneau s'affiche une fois la largeur mesurée.
    await fireEvent(screen.getByLabelText('Graphique : A 60 %, B 40 %'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 320, height: 220 } },
    });
    expect(screen.getByText('Total')).toBeTruthy();
  });

  it('QrBlock : image nommée', async () => {
    await renderKit(<QrBlock data="https://suivi.lookas.ci" label="Suivi" />);
    expect(screen.getByLabelText('QR code : Suivi')).toBeTruthy();
  });
});
