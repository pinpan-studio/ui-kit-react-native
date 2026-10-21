import { fireEvent, render, screen, within } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  CommandPalette,
  EMPTY_FILTERS,
  ExpansionTile,
  KanbanBoard,
  LongPressMenu,
  NotificationCenter,
  ReorderList,
  TreeView,
  addDays,
  applyPlanningFilters,
  daysBetween,
  fuzzyScore,
  isLate,
  startOfWeek,
  type PlanningItem,
} from '../src/components';
import { SnackProvider } from '../src/core/snack';
import { FILES_TREE } from '../src/data/showcase';
import { INTERVENTION_COLUMNS, INTERVENTION_FILTERS, buildInterventions } from '../src/data/planning';
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

describe('modèle de planification', () => {
  const now = new Date(2026, 9, 21, 12);
  const item = (p: Partial<PlanningItem>): PlanningItem => ({ id: 'x', title: 'Pose balise', ...p });

  it('retard : échéance passée et non terminé', () => {
    expect(isLate(item({ due: addDays(now, -1) }), now)).toBe(true);
    expect(isLate(item({ due: addDays(now, -1), done: true }), now)).toBe(false);
    expect(isLate(item({ due: addDays(now, 1) }), now)).toBe(false);
  });

  it('dates : lundi de la semaine, écart en jours', () => {
    expect(startOfWeek(now).getDay()).toBe(1);
    expect(daysBetween(now, addDays(now, 3))).toBe(3);
  });

  it('filtres : recherche, valeur déclarée, retard', () => {
    const items = buildInterventions();
    expect(applyPlanningFilters(items, INTERVENTION_FILTERS, EMPTY_FILTERS)).toBe(items);
    const first = items[0]!;
    const hits = applyPlanningFilters(items, INTERVENTION_FILTERS, { ...EMPTY_FILTERS, search: first.ref! });
    expect(hits.map((i) => i.id)).toContain(first.id);
    const late = applyPlanningFilters(items, INTERVENTION_FILTERS, { ...EMPTY_FILTERS, lateOnly: true });
    expect(late.every((i) => isLate(i))).toBe(true);
  });

  it('kanban : déplacement au lecteur d’écran', async () => {
    const onMove = jest.fn();
    const items = buildInterventions().filter((i) => i.status === 'planifiee');
    await renderKit(<KanbanBoard columns={INTERVENTION_COLUMNS} items={items} onMove={onMove} />);
    const card = screen.getAllByHintText('Appui long puis glisser pour déplacer')[0]!;
    await fireEvent(card, 'accessibilityAction', { nativeEvent: { actionName: 'en_route' } });
    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ status: 'planifiee' }), 'en_route');
  });
});

describe('interactions', () => {
  it('recherche floue : sous-chaîne, puis lettres dans l’ordre', () => {
    expect(fuzzyScore('cli', 'nouveau client')).toBe(8);
    expect(fuzzyScore('nvc', 'nouveau client')).toBeGreaterThanOrEqual(100);
    expect(fuzzyScore('zz', 'nouveau client')).toBeNull();
  });

  it('palette : filtre et exécute une commande', async () => {
    const onRun = jest.fn();
    await renderKit(
      <CommandPalette
        visible
        onDismiss={() => undefined}
        onRun={onRun}
        commands={[
          { label: 'Nouveau client', icon: 'mi:person-add', group: 'Actions' },
          { label: 'Exporter la liste', icon: 'mi:download', group: 'Actions' },
        ]}
      />,
    );
    await fireEvent.changeText(screen.getByLabelText('Rechercher une commande'), 'export');
    expect(screen.queryByText('Nouveau client')).toBeNull();
    await fireEvent.press(screen.getByText('Exporter la liste'));
    expect(onRun).toHaveBeenCalledWith(expect.objectContaining({ label: 'Exporter la liste' }));
  });

  it('centre de notifications : tout marquer lu', async () => {
    const onUnread = jest.fn();
    await renderKit(<NotificationCenter onUnreadChange={onUnread} now={new Date(2026, 9, 21, 12)} />);
    await fireEvent.press(screen.getByText('Tout lu'));
    expect(onUnread).toHaveBeenLastCalledWith(0);
  });

  it('menu contextuel : actions exposées au lecteur d’écran', async () => {
    const onSelect = jest.fn();
    await renderKit(
      <LongPressMenu
        accessibilityLabel="Rapport.pdf"
        onSelect={onSelect}
        items={[
          { value: 'open', label: 'Ouvrir', icon: 'mi:open-in-new' },
          'divider',
          { value: 'delete', label: 'Supprimer', icon: 'mi:delete', danger: true },
        ]}
      >
        <Text>Rapport.pdf</Text>
      </LongPressMenu>,
    );
    await fireEvent(screen.getByLabelText('Rapport.pdf'), 'accessibilityAction', { nativeEvent: { actionName: 'a1' } });
    expect(onSelect).toHaveBeenCalledWith('delete');
  });

  it('liste réordonnable : monter au lecteur d’écran', async () => {
    const onReorder = jest.fn();
    await renderKit(<ReorderList items={['A', 'B']} onReorder={onReorder} renderItem={(t) => <Text>{t}</Text>} />);
    await fireEvent(screen.getByLabelText('2. B'), 'accessibilityAction', { nativeEvent: { actionName: 'up' } });
    expect(onReorder).toHaveBeenCalledWith(1, 0);
  });
});

describe('Material', () => {
  it('ExpansionTile : état déplié annoncé', async () => {
    await renderKit(
      <ExpansionTile title="Contrat">
        <Text>Premium</Text>
      </ExpansionTile>,
    );
    expect(screen.queryByText('Premium')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Contrat' }));
    expect(screen.getByText('Premium')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Contrat', expanded: true })).toBeTruthy();
  });

  it('TreeView : dossiers dépliables, feuille sélectionnable', async () => {
    const onSelect = jest.fn();
    await renderKit(<TreeView nodes={FILES_TREE} initiallyOpen={['src']} onSelect={onSelect} />);
    expect(screen.queryByText('main.dart')).toBeNull();
    await fireEvent.press(screen.getByLabelText('app'));
    await fireEvent.press(screen.getByLabelText('main.dart, 1 Ko'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'main' }));
    expect(within(screen.getByLabelText('src')).queryByText('src')).toBeTruthy();
  });
});
