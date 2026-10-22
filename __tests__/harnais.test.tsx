import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SnackProvider } from '../src/core/snack';
import { buildConversations, detectIntent, scenarioFor } from '../src/harnais/catalog';
import { HarnaisScreen } from '../src/harnais/HarnaisScreen';
import type { HzW, HzWidgetType } from '../src/harnais/models';
import { createHarnaisStore, HZ_TIMING } from '../src/harnais/store';
import { useThemeStore } from '../src/store/themeStore';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), navigate: jest.fn() } }));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
const renderKit = async (ui: ReactElement) =>
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <KitThemeProvider>
        <SnackProvider>{ui}</SnackProvider>
      </KitThemeProvider>
    </SafeAreaProvider>,
  );

beforeAll(() => {
  // Génération simulée accélérée : l'ordre des étapes reste le même.
  Object.assign(HZ_TIMING, { thinking: 1, tool: 1, word: 0, widget: 1 });
});
beforeEach(() => useThemeStore.setState({ mode: 'light', paletteId: 'cyan' }));

const widgetsOf = (blocks: { block: string }[]) => blocks.filter((b): b is HzW => b.block === 'widget');
const lastMessage = (store: ReturnType<typeof createHarnaisStore>) => {
  const s = store.getState();
  return s.conversations.find((c) => c.id === s.activeId)!.messages.at(-1)!;
};

describe('catalogue', () => {
  it('détecte l’intention de la demande', () => {
    expect(detectIntent('Montre-moi la flotte sur une carte.')).toBe('map');
    expect(detectIntent('Fais-moi un tableau de bord complet')).toBe('overview');
    expect(detectIntent('Corrige le bug des alertes')).toBe('code');
    expect(detectIntent('Je veux créer une demande d’intervention.')).toBe('form');
    expect(detectIntent('Bonjour')).toBe('clarify');
  });

  it('les conversations de démo couvrent les 33 types de widgets', () => {
    const types = new Set<HzWidgetType>();
    const visit = (w: HzW) => {
      types.add(w.type);
      if (w.type === 'modal') w.blocks.forEach(visit);
      if (w.type === 'tabs') w.tabs.forEach((t) => t[3].forEach(visit));
      if (w.type === 'accordion') w.items.forEach((i) => i[3].forEach(visit));
    };
    for (const c of buildConversations()) for (const m of c.messages) widgetsOf(m.blocks).forEach(visit);
    expect(types.size).toBe(33);
    expect(widgetsOf(scenarioFor('clarify').blocks)[0]!.type).toBe('choices');
  });
});

describe('store', () => {
  it('ouvre la conversation initiale avec son modèle', () => {
    const s = createHarnaisStore('c-palette').getState();
    expect(s.activeId).toBe('c-palette');
    expect(s.modelId).toBe('sonnet');
    expect(createHarnaisStore().getState().activeId).toBeNull();
  });

  it('génère une réponse : réflexion, outil, texte puis widgets', async () => {
    const store = createHarnaisStore();
    await store.getState().send('Montre-moi la flotte sur une carte.');
    const s = store.getState();
    expect(s.generating).toBe(false);
    expect(s.conversations[0]!.title).toBe('Montre-moi la flotte sur une carte.');
    const m = lastMessage(store);
    expect(m.streaming).toBe(false);
    expect(m.blocks.map((b) => b.block).slice(0, 3)).toEqual(['thinking', 'tool', 'text']);
    expect(widgetsOf(m.blocks).map((w) => w.type)).toEqual(['map', 'timeline', 'callout']);
  });

  it('arrêt : la réponse est marquée interrompue', async () => {
    const store = createHarnaisStore();
    const run = store.getState().send('Liste des clients à relancer');
    store.getState().stop();
    await run;
    expect(lastMessage(store).stopped).toBe(true);
    expect(store.getState().generating).toBe(false);
  });

  it('autorisation puis formulaire : la réponse est mémorisée et suivie', async () => {
    const store = createHarnaisStore();
    await store.getState().send('Corrige le bug des alertes de zone en double.');
    const approval = widgetsOf(lastMessage(store).blocks).find((w) => w.type === 'approval')!;
    await store.getState().answer(approval, { value: 'approve', label: 'Autoriser' });
    const conv = store.getState().conversations[0]!;
    expect(widgetsOf(conv.messages[1]!.blocks).find((w) => w.id === approval.id)!.selected).toBe('approve');
    expect(widgetsOf(lastMessage(store).blocks).map((w) => w.type)).toEqual(['steps', 'callout']);

    await store.getState().send('Je veux créer une demande d’intervention.');
    const form = widgetsOf(lastMessage(store).blocks)[0]!;
    await store.getState().submitForm(form, { client: 'sotra', sms: false }, 'Client : SOTRA');
    expect(widgetsOf(lastMessage(store).blocks).map((w) => w.type)).toEqual(['records', 'callout', 'form']);
  });

  it('relance : la dernière réponse est remplacée', async () => {
    const store = createHarnaisStore('c-csv');
    const before = store.getState().conversations.find((c) => c.id === 'c-csv')!.messages.length;
    await store.getState().retry();
    const after = store.getState().conversations.find((c) => c.id === 'c-csv')!.messages;
    expect(after).toHaveLength(before);
    expect(after.at(-1)!.blocks[0]!.block).toBe('thinking');
  });
});

describe('écran', () => {
  it('accueil : salutation et suggestions, puis réponse', async () => {
    await renderKit(<HarnaisScreen onExit={jest.fn()} />);
    expect(screen.getByText(/, Jean$/)).toBeTruthy();
    expect(screen.getByText('Nouvelle conversation')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Carte'));
    await waitFor(() => expect(screen.getByText('Flotte en temps réel')).toBeTruthy());
    expect(screen.getAllByText('Montre-moi la flotte sur une carte.').length).toBeGreaterThan(0);
  });

  it('conversation initiale, artefact et panneau latéral', async () => {
    await renderKit(<HarnaisScreen onExit={jest.fn()} initialConversation="c-sidecar" />);
    expect(screen.getByText('Sidecar de navigation')).toBeTruthy();
    expect(screen.getByText('UI Kit')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Ouvrir Sidecar.tsx'));
    await fireEvent.press(screen.getByText('Contexte'));
    expect(screen.getByText('9 800 / 200 000 jetons (4,9 %)'.replace(/ /g, ' '))).toBeTruthy();
    await fireEvent.press(screen.getByText('Tâches'));
    expect(screen.getByText('Brancher le Sidecar dans le shell')).toBeTruthy();
  });

  it('tiroir : recherche et ouverture d’une conversation', async () => {
    await renderKit(<HarnaisScreen onExit={jest.fn()} />);
    await fireEvent.press(screen.getByLabelText('Conversations'));
    expect(screen.getByText('ÉPINGLÉES')).toBeTruthy();
    await fireEvent.changeText(screen.getByPlaceholderText('Rechercher…'), 'sql');
    expect(screen.queryByText('Export CSV des factures')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Requêtes SQL lentes'));
    expect(screen.getByText(/index trigramme/)).toBeTruthy();
  });

  it('démos : tous les widgets se rendent', async () => {
    await renderKit(<HarnaisScreen onExit={jest.fn()} initialConversation="c-outils" />);
    expect(screen.getByText('Comparatif des formules')).toBeTruthy();
    expect(screen.getByText('Autoriser l’exécution de cette commande ?')).toBeTruthy();
    await renderKit(<HarnaisScreen onExit={jest.fn()} initialConversation="c-demo" />);
    expect(screen.getByText('Nouvelle demande d’intervention')).toBeTruthy();
  });

  it('formulaire : champs obligatoires', async () => {
    await renderKit(<HarnaisScreen onExit={jest.fn()} initialConversation="c-demo" />);
    await fireEvent.press(screen.getByText('Planifier l’intervention'));
    expect(screen.getAllByText('Champ obligatoire').length).toBeGreaterThan(0);
  });
});
