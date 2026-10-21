import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { KitSlider, KitTextField, MarkdownView } from '../src/components';
import { SnackProvider } from '../src/core/snack';
import { ButtonsGallery } from '../src/showcase/ButtonsGallery';
import { Demo, DocPage } from '../src/showcase/doc';
import { categoryById } from '../src/showcase/kitNav';
import { TypographyGallery } from '../src/showcase/TypographyGallery';
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

const layout = (y: number) => ({ nativeEvent: { layout: { x: 0, y, width: 358, height: 400 } } });

beforeEach(() => useThemeStore.setState({ mode: 'light', paletteId: 'cyan' }));

describe('DocPage', () => {
  const sections = [
    { id: 'a', title: 'Première', children: <Text>A</Text> },
    { id: 'b', title: 'Deuxième', source: 'Source()', description: 'Desc', children: <Text>B</Text> },
  ];

  it('hero, sommaire en onglets, en-têtes de sections', async () => {
    await renderKit(<DocPage title="Boutons" subtitle="Sous-titre" sections={sections} />);
    expect(screen.getByText('COMPOSANTS')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Boutons' })).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByRole('tab', { name: 'Première' }).props.accessibilityState).toMatchObject({ selected: true });
    expect(screen.getByText('Source()')).toBeTruthy();
  });

  it('toucher une puce active la section (après mise en page)', async () => {
    await renderKit(<DocPage title="T" sections={sections} />);
    await fireEvent(screen.getByTestId('section-a'), 'layout', layout(80));
    await fireEvent(screen.getByTestId('section-b'), 'layout', layout(600));
    await fireEvent.press(screen.getByRole('tab', { name: 'Deuxième' }));
    expect(screen.getByRole('tab', { name: 'Deuxième' }).props.accessibilityState).toMatchObject({ selected: true });
  });

  it('ouvre directement la section demandée', async () => {
    await renderKit(<DocPage title="T" sections={sections} initialSection="b" />);
    await fireEvent(screen.getByTestId('section-b'), 'layout', layout(600));
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(r));
    });
    expect(screen.getByRole('tab', { name: 'Deuxième' }).props.accessibilityState).toMatchObject({ selected: true });
  });

  it('Demo : extrait de code affiché à la demande et copiable', async () => {
    await renderKit(
      <Demo label="Exemple" code="<KitButton />">
        <Text>Rendu</Text>
      </Demo>,
    );
    expect(screen.queryByText('<KitButton />')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Voir le code'));
    expect(screen.getByText('<KitButton />')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Copier'));
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('<KitButton />');
    expect(await screen.findByText('Extrait copié dans le presse-papiers')).toBeTruthy();
  });
});

describe.each([
  ['typography', TypographyGallery],
  ['buttons', ButtonsGallery],
] as const)('galerie %s', (id, Gallery) => {
  it.each(['light', 'dark'] as const)('mêmes sections que le catalogue Flutter (%s)', async (mode) => {
    useThemeStore.setState({ mode });
    await renderKit(<Gallery />);
    const cat = categoryById(id);
    expect(cat).toBeDefined();
    for (const s of cat?.sections ?? []) expect(screen.getByTestId(`section-${s.id}`)).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(cat?.sections.length ?? 0);
  });
});

describe('galerie Boutons : interactions', () => {
  it('une variante affiche une snackbar', async () => {
    await renderKit(<ButtonsGallery />);
    await fireEvent.press(screen.getByRole('button', { name: 'Danger outline' }));
    expect(await screen.findAllByText('Danger outline')).toHaveLength(2);
  });
});

describe('galerie Typographie : correcteur', () => {
  it('corrige le texte saisi', async () => {
    await renderKit(<TypographyGallery />);
    await fireEvent.changeText(screen.getByLabelText('Texte à corriger'), 'Prix : 15000 FCFA !');
    expect(screen.getByText(/Prix/)).toBeTruthy();
  });
});

describe('KitSlider', () => {
  it('réglable au lecteur d’écran, calé sur les crans', async () => {
    const onChange = jest.fn();
    await renderKit(
      <KitSlider value={0.5} min={0} max={1} divisions={4} onChange={onChange} accessibilityLabel="Volume" />,
    );
    const slider = screen.getByLabelText('Volume');
    expect(slider.props.accessibilityValue).toMatchObject({ min: 0, max: 1, now: 0.5 });
    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onChange).toHaveBeenLastCalledWith(0.75);
    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onChange).toHaveBeenLastCalledWith(0.25);
  });
});

describe('KitTextField', () => {
  it('libellé, obligatoire, aide et erreur', async () => {
    const onChangeText = jest.fn();
    await renderKit(
      <>
        <KitTextField label="E-mail" required helper="Professionnel" onChangeText={onChangeText} />
        <KitTextField label="Téléphone" errorText="Numéro invalide" />
      </>,
    );
    expect(screen.getByText('Professionnel')).toBeTruthy();
    expect(screen.getByText('Numéro invalide')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'a@b.ci');
    expect(onChangeText).toHaveBeenCalledWith('a@b.ci');
  });
});

describe('MarkdownView', () => {
  it('titres, listes, cases, citation, code en ligne', async () => {
    await renderKit(
      <MarkdownView source={'## Titre\n\n- un **gras**\n- [x] fait\n1. premier\n\n> citation\n\nTexte `code`'} />,
    );
    expect(screen.getByRole('header')).toBeTruthy();
    expect(screen.getByText('gras')).toBeTruthy();
    expect(screen.getByText('fait')).toBeTruthy();
    expect(screen.getByText('1.')).toBeTruthy();
    expect(screen.getByText('citation')).toBeTruthy();
    expect(screen.getByText(' code ')).toBeTruthy();
  });
});
