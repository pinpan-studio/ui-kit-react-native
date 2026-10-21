import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  AvatarStack,
  CountDot,
  EmptyState,
  ErrorState,
  FilterChipButton,
  KitAvatar,
  KitButton,
  KitCard,
  KitProgressBar,
  KpiCard,
  LabeledDivider,
  LineAction,
  PageHeader,
  ResponsiveGrid,
  RoundIconButton,
  SegmentedToggle,
  Skeleton,
  SkeletonListTile,
  SplitButton,
  StatusBadge,
  TrendChip,
  ViewModeToggle,
} from '../src/components';
import { initials } from '../src/core/format';
import { useThemeStore } from '../src/store/themeStore';
import { buildTheme } from '../src/theme/buildTheme';
import { KitThemeProvider } from '../src/theme/KitThemeProvider';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

const renderKit = async (ui: ReactElement) =>
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <KitThemeProvider>{ui}</KitThemeProvider>
    </SafeAreaProvider>,
  );

const flat = (el: { props: { style?: unknown } }) => StyleSheet.flatten(el.props.style as never) ?? {};

const noop = () => undefined;

/** Tous les composants, avec leurs props les plus complètes. */
const gallery = (
  <>
    <KitButton label="Enregistrer" icon="content-save-outline" onPress={noop} />
    {(['raised', 'secondary', 'outline', 'ghost', 'danger', 'dangerOutline', 'success', 'tertiary'] as const).map(
      (v) => (
        <KitButton key={v} label={v} variant={v} onPress={noop} />
      ),
    )}
    <KitButton label="Désactivé" />
    <KitButton label="Envoyer" loading loadingLabel="Envoi…" onPress={noop} size="compact" shape="rounded" />
    <LineAction label="Voir tout" onPress={noop} />
    <RoundIconButton icon="refresh" accessibilityLabel="Actualiser" onPress={noop} active />
    <SplitButton
      label="Exporter"
      icon="download"
      onPress={noop}
      items={[{ label: 'PDF', icon: 'file' }]}
      onSelect={noop}
    />
    <KitCard title="Carte" icon="information-outline" trailing={<StatusBadge label="Actif" tone="success" />} shadow>
      <Text>Contenu</Text>
    </KitCard>
    <KpiCard icon="cash" value="12,4" unit="M FCFA" label="Chiffre d’affaires" delta="+8 %" up />
    <TrendChip text="-3 %" up={false} />
    <StatusBadge label="En retard" tone="error" icon="alert" />
    <CountDot count={4} />
    <KitAvatar name="Mariam Koné" online />
    <AvatarStack names={['A B', 'C D', 'E F', 'G H', 'I J', 'K L']} />
    <FilterChipButton label="Ouverts" count={12} active />
    <SegmentedToggle
      value="a"
      onChange={noop}
      options={[
        { value: 'a', label: 'Jour' },
        { value: 'b', label: 'Semaine' },
      ]}
    />
    <ViewModeToggle mode="card" onChange={noop} />
    <Skeleton width={120} />
    <SkeletonListTile />
    <EmptyState actionLabel="Créer" onAction={noop} />
    <ErrorState code="ERR_NETWORK" onRetry={noop} />
    <PageHeader title="Clients" breadcrumb="Accueil / Clients" subtitle="248 clients" actions={<Text>Action</Text>} />
    <LabeledDivider label="ou" />
    <KitProgressBar value={0.4} accessibilityLabel="Progression" />
    <ResponsiveGrid>
      <Text>Un</Text>
      <Text>Deux</Text>
    </ResponsiveGrid>
  </>
);

describe.each(['light', 'dark'] as const)('composants du kit en %s', (mode) => {
  beforeEach(() => useThemeStore.setState({ mode, paletteId: 'cyan' }));

  it('se rendent tous', async () => {
    await renderKit(gallery);
    expect(screen.getByText('Enregistrer')).toBeTruthy();
    expect(screen.getByText('Envoi…')).toBeTruthy();
    expect(screen.getByText('EN RETARD')).toBeTruthy();
    expect(screen.getByText('MK')).toBeTruthy();
    expect(screen.getByText('+2')).toBeTruthy();
    expect(screen.getByText('ACCUEIL / CLIENTS')).toBeTruthy();
    expect(screen.getByText('ERR_NETWORK')).toBeTruthy();
  });

  it('KitCard : fond card, rayon 24, sans contour', async () => {
    await renderKit(
      <KitCard testID="card">
        <Text>x</Text>
      </KitCard>,
    );
    const s = flat(screen.getByTestId('card'));
    expect(s.backgroundColor).toBe(buildTheme('cyan', mode).kit.card);
    expect(s.borderRadius).toBe(24);
    expect(s.borderWidth).toBeUndefined();
  });
});

describe('KitButton', () => {
  beforeEach(() => useThemeStore.setState({ mode: 'light', paletteId: 'cyan' }));

  it('déclenche onPress ; sans onPress il est désactivé', async () => {
    const onPress = jest.fn();
    await renderKit(
      <>
        <KitButton label="Valider" onPress={onPress} />
        <KitButton label="Inactif" />
      </>,
    );
    await fireEvent.press(screen.getByText('Valider'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Inactif' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('chargement : libellé de chargement, occupé et non cliquable', async () => {
    const onPress = jest.fn();
    await renderKit(<KitButton label="Envoyer" loadingLabel="Envoi…" loading onPress={onPress} />);
    await fireEvent.press(screen.getByText('Envoi…'));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button').props.accessibilityState).toMatchObject({ busy: true, disabled: true });
  });

  it('pilule 40 dp, police Inter 600 14, couleurs primary / on-primary', async () => {
    await renderKit(<KitButton label="OK" onPress={noop} testID="ok" />);
    const { kit } = buildTheme('cyan', 'light');
    const label = flat(screen.getByText('OK'));
    expect(label).toMatchObject({ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: kit.onPrimary });
    expect(flat(screen.getByTestId('ok'))).toMatchObject({ minHeight: 40, paddingHorizontal: 20, borderRadius: 20 });
  });
});

describe('comportements', () => {
  beforeEach(() => useThemeStore.setState({ mode: 'light', paletteId: 'cyan' }));

  it('CountDot plafonne à 99+', async () => {
    await renderKit(<CountDot count={120} />);
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('SegmentedToggle : radio cochée et changement de valeur', async () => {
    const onChange = jest.fn();
    await renderKit(
      <SegmentedToggle
        value="day"
        onChange={onChange}
        options={[
          { value: 'day', label: 'Jour' },
          { value: 'week', label: 'Semaine' },
        ]}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Jour' }).props.accessibilityState).toMatchObject({ checked: true });
    await fireEvent.press(screen.getByText('Semaine'));
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('ViewModeToggle : segments nommés même sans libellé', async () => {
    const onChange = jest.fn();
    await renderKit(<ViewModeToggle mode="card" onChange={onChange} showLabels={false} />);
    await fireEvent.press(screen.getByRole('radio', { name: 'Liste' }));
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('FilterChipButton : sélection annoncée avec le compteur', async () => {
    await renderKit(<FilterChipButton label="Ouverts" count={3} active onPress={noop} />);
    expect(screen.getByRole('button', { name: 'Ouverts, 3' }).props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  // Le Menu Paper attend une mesure de mise en page absente sous Jest : la sélection se vérifie à l'écran.
  it('SplitButton : action principale et bouton de menu nommé', async () => {
    const onPress = jest.fn();
    await renderKit(
      <SplitButton
        label="Exporter"
        icon="download"
        onPress={onPress}
        items={[{ label: 'Exporter en PDF', icon: 'file' }]}
        onSelect={noop}
      />,
    );
    await fireEvent.press(screen.getByText('Exporter'));
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Plus d’options' })).toBeTruthy();
  });

  it('EmptyState et ErrorState déclenchent leur action', async () => {
    const onAction = jest.fn();
    const onRetry = jest.fn();
    await renderKit(
      <>
        <EmptyState actionLabel="Ajouter un client" onAction={onAction} />
        <ErrorState onRetry={onRetry} />
      </>,
    );
    await fireEvent.press(screen.getByText('Ajouter un client'));
    await fireEvent.press(screen.getByText('Réessayer'));
    expect(onAction).toHaveBeenCalled();
    expect(onRetry).toHaveBeenCalled();
  });

  it('KitProgressBar borne la valeur et l’annonce en %', async () => {
    await renderKit(<KitProgressBar value={1.4} accessibilityLabel="Envoi" />);
    expect(screen.getByLabelText('Envoi').props.accessibilityValue).toMatchObject({ now: 100 });
  });

  it('RoundIconButton : cible tactile de 48 dp pour 40 dp visibles', async () => {
    await renderKit(<RoundIconButton icon="refresh" accessibilityLabel="Actualiser" onPress={noop} />);
    expect(screen.getByLabelText('Actualiser').props.hitSlop).toBe(4);
  });

  it('initiales : 2 premières lettres en capitales', () => {
    expect(initials('Mariam Koné')).toBe('MK');
    expect(initials('  awa  ')).toBe('A');
    expect(initials('')).toBe('?');
    expect(initials('Jean Paul Kouassi')).toBe('JP');
  });
});
