import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  CheckboxTile,
  DateField,
  KitCalendar,
  KitSwitch,
  NumberStepper,
  OtpInput,
  RatingInput,
  SearchableSelect,
  TagInput,
  TransferList,
  TreeSelect,
  hexToHsv,
  hsvToHex,
  maskFormat,
  parseHex,
  passwordScore,
} from '../src/components';
import { fileSize } from '../src/core/format';
import { SnackProvider } from '../src/core/snack';
import { DEMO_CLIENTS, ZONES_TREE } from '../src/data/showcase';
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

describe('logique des champs', () => {
  it('masque de saisie (MaskFormatter)', () => {
    expect(maskFormat('+225 ## ## ## ## ##', '0707123456')).toBe('+225 07 07 12 34 56');
    expect(maskFormat('#### AA ##', '1234ab01')).toBe('1234 AB 01');
    expect(maskFormat('##/##/####', '24102026')).toBe('24/10/2026');
    expect(maskFormat('CLI-#####', '1043')).toBe('CLI-1043');
    expect(maskFormat('#### AA ##', '12x')).toBe('12');
  });
  it('robustesse du mot de passe', () => {
    expect(passwordScore('')).toBe(0);
    expect(passwordScore('abc')).toBe(0);
    expect(passwordScore('abcdefgh')).toBe(1);
    expect(passwordScore('Abcdefg1')).toBe(3);
    expect(passwordScore('Abcdefg1!')).toBe(4);
    expect(passwordScore('Abcdefghijk1')).toBe(4);
  });
  it('couleurs HSV ↔ hexadécimal', () => {
    for (const hex of ['#006a6a', '#ef4444', '#ffffff', '#000000', '#3b82f6'])
      expect(hsvToHex(hexToHsv(hex))).toBe(hex);
    expect(parseHex('#00FFAA')).toBe('#00ffaa');
    expect(parseHex('12345')).toBeNull();
  });
  it('taille de fichier', () => {
    expect(fileSize(1258000)).toBe('1,2 Mo');
    expect(fileSize(86000)).toBe('84 Ko');
    expect(fileSize(512)).toBe('512 o');
  });
  it('clients de démonstration identiques à Flutter', () => {
    expect(DEMO_CLIENTS).toHaveLength(40);
    expect(DEMO_CLIENTS[0]).toMatchObject({
      code: 'CLI-1040',
      raisonSociale: 'Transports Yao & Fils',
      email: 'jean.kouassi@transports.ci',
      telephone: '+225 07 10 20 30',
      ville: 'Abidjan',
      statut: 'actif',
    });
    expect(DEMO_CLIENTS[3]).toMatchObject({ code: 'CLI-1049', statut: 'suspendu', vehicules: 35 });
  });
});

describe('composants de saisie', () => {
  it('OtpInput : chiffres seuls, code complet signalé', async () => {
    const onChange = jest.fn();
    const onCompleted = jest.fn();
    await renderKit(<OtpInput value="" onChange={onChange} onCompleted={onCompleted} length={4} />);
    await fireEvent.changeText(screen.getByLabelText('Code de vérification'), '12a345');
    expect(onChange).toHaveBeenCalledWith('1234');
    expect(onCompleted).toHaveBeenCalledWith('1234');
  });

  it('NumberStepper : pas et bornes', async () => {
    const onChange = jest.fn();
    await renderKit(
      <NumberStepper value={1} min={1} max={60} step={6} onChange={onChange} accessibilityLabel="Durée" />,
    );
    expect(screen.getByRole('button', { name: 'Diminuer Durée' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Augmenter Durée' }));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('SearchableSelect : la feuille choisit une valeur', async () => {
    const onChange = jest.fn();
    await renderKit(
      <SearchableSelect
        label="Ville"
        value={null}
        onChange={onChange}
        options={[
          { value: 'abj', label: 'Abidjan' },
          { value: 'bke', label: 'Bouaké' },
        ]}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Ville' }));
    await fireEvent.press(screen.getByText('Bouaké'));
    expect(onChange).toHaveBeenCalledWith('bke');
  });

  it('SearchableSelect : recherche insensible aux accents dès 7 options', async () => {
    await renderKit(
      <SearchableSelect
        label="Ville"
        value={null}
        onChange={() => undefined}
        options={['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Daloa', 'Korhogo', 'Man'].map((v) => ({
          value: v,
          label: v,
        }))}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Ville' }));
    await fireEvent.changeText(screen.getByLabelText('Rechercher…'), 'pedro');
    expect(screen.getByText('San-Pédro')).toBeTruthy();
    expect(screen.queryByText('Daloa')).toBeNull();
  });

  it('DateField : choix dans le calendrier puis effacement', async () => {
    const onChange = jest.fn();
    const { rerender } = await renderKit(
      <DateField label="Échéance" value={new Date(2026, 9, 24)} onChange={onChange} />,
    );
    expect(screen.getByRole('button', { name: 'Échéance' }).props.accessibilityValue).toMatchObject({
      text: '24/10/2026',
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Échéance' }));
    await fireEvent.press(screen.getByRole('button', { name: '30 octobre 2026' }));
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 9, 30));
    void rerender;
    await fireEvent.press(screen.getByRole('button', { name: 'Effacer la date' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('KitCalendar : bornes désactivées et navigation', async () => {
    const onSelect = jest.fn();
    await renderKit(
      <KitCalendar
        value={new Date(2026, 0, 15)}
        first={new Date(2026, 0, 10)}
        last={new Date(2026, 11, 31)}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByRole('button', { name: '5 janvier 2026' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(screen.getByRole('button', { name: 'Mois précédent' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Mois suivant' }));
    expect(screen.getByText('février 2026')).toBeTruthy();
  });

  it('TreeSelect : cascade et état indéterminé', async () => {
    const onChange = jest.fn();
    await renderKit(<TreeSelect nodes={ZONES_TREE} selected={new Set(['marc'])} onChange={onChange} />);
    expect(screen.getByLabelText('Sélectionner Abidjan Sud').props.accessibilityState).toMatchObject({
      checked: 'mixed',
    });
    await fireEvent.press(screen.getByLabelText('Sélectionner Centre'));
    expect([...(onChange.mock.calls[0]?.[0] as Set<string>)].sort()).toEqual(['bke', 'marc', 'yakro']);
  });

  it('TransferList : tout ajouter', async () => {
    const onChange = jest.fn();
    await renderKit(<TransferList available={['A', 'B']} chosen={['C']} onChange={onChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Tout ajouter' }));
    expect(onChange).toHaveBeenCalledWith([], ['C', 'A', 'B']);
  });

  it('TagInput : ajout par virgule, doublons ignorés, limite', async () => {
    const onChange = jest.fn();
    await renderKit(<TagInput tags={['urgent']} max={2} onChange={onChange} />);
    const input = screen.getByLabelText('Ajouter un tag…');
    await fireEvent.changeText(input, 'URGENT,');
    expect(onChange).not.toHaveBeenCalled();
    await fireEvent.changeText(input, 'vip,');
    expect(onChange).toHaveBeenCalledWith(['urgent', 'vip']);
    expect(screen.getByText('1 / 2')).toBeTruthy();
  });

  it('RatingInput : toucher la note courante la remet à zéro', async () => {
    const onChange = jest.fn();
    await renderKit(<RatingInput value={3} onChange={onChange} />);
    await fireEvent.press(screen.getByRole('radio', { name: 'Note 3 sur 5' }));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('KitSwitch et CheckboxTile : états accessibles', async () => {
    const onSwitch = jest.fn();
    const onCheck = jest.fn();
    await renderKit(
      <>
        <KitSwitch value={false} onChange={onSwitch} accessibilityLabel="Notifications" />
        <CheckboxTile value={null} onChange={onCheck} title="Toutes" />
      </>,
    );
    await fireEvent.press(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onSwitch).toHaveBeenCalledWith(true);
    const tile = screen.getByRole('checkbox', { name: 'Toutes' });
    expect(tile.props.accessibilityState).toMatchObject({ checked: 'mixed' });
    await fireEvent.press(tile);
    expect(onCheck).toHaveBeenCalledWith(true);
  });
});
