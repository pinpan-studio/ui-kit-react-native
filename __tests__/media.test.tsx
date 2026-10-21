import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  FileViewer,
  KitAudioPlayer,
  KitMap,
  KitVideoPlayer,
  MasonryGrid,
  YoutubeFacade,
  clusterMarkers,
  distance,
  fitBounds,
  metersPerPixel,
  project,
  shapeLabel,
  tileUrl,
  unproject,
} from '../src/components';
import { mmss } from '../src/core/format';
import { SnackProvider } from '../src/core/snack';
import { FLOTTE, POSITIONS_DENSES } from '../src/data/map';
import { VIEWER_FILES } from '../src/data/media';
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
const layout = (width: number, height: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height } } });

beforeEach(() => useThemeStore.setState({ mode: 'light', paletteId: 'cyan' }));

describe('géométrie de carte', () => {
  it('projection Web Mercator réversible', () => {
    const p = { lat: 5.3237, lng: -4.0193 };
    const q = project(p, 12);
    const back = unproject(q.x, q.y, 12);
    expect(back.lat).toBeCloseTo(p.lat, 6);
    expect(back.lng).toBeCloseTo(p.lng, 6);
    expect(project({ lat: 0, lng: 0 }, 0)).toEqual({ x: 128, y: 128 });
  });

  it('distances et échelle', () => {
    // Un degré de latitude ≈ 111,2 km.
    expect(distance({ lat: 5, lng: -4 }, { lat: 6, lng: -4 })).toBeGreaterThan(111000);
    expect(distance({ lat: 5, lng: -4 }, { lat: 6, lng: -4 })).toBeLessThan(111400);
    expect(metersPerPixel(0, 0)).toBeCloseTo(156543.03, 1);
    expect(shapeLabel({ tool: 'polygon', points: [] })).toBe('Zone · 0 sommets');
    expect(
      shapeLabel({
        tool: 'line',
        points: [
          { lat: 5, lng: -4 },
          { lat: 5.01, lng: -4 },
        ],
      }),
    ).toBe('Tracé · 1,11 km');
  });

  it('cadrage et regroupement', () => {
    const fit = fitBounds(
      FLOTTE.map((m) => m.point),
      390,
      320,
    );
    expect(fit?.zoom).toBeGreaterThan(10);
    expect(fit?.zoom).toBeLessThan(14);
    expect(fitBounds([{ lat: 5, lng: -4 }], 390, 320)).toBeNull();
    const far = clusterMarkers(POSITIONS_DENSES, 6, true);
    expect(far.length).toBeLessThan(20);
    expect(far.reduce((a, c) => a + c.group.length, 0)).toBe(POSITIONS_DENSES.length);
    expect(clusterMarkers(POSITIONS_DENSES, 15, true)).toHaveLength(POSITIONS_DENSES.length);
  });

  it('URL de tuile selon le fond', () => {
    expect(tileUrl('osm', 3, 4, 5)).toBe('https://tile.openstreetmap.org/3/4/5.png');
    expect(tileUrl('streets', 3, 4, 5)).toContain('/tile/3/5/4');
  });
});

describe('KitMap', () => {
  it('marqueurs touchables, popup, zoom', async () => {
    await renderKit(<KitMap markers={FLOTTE} fitToContent testID="map" />);
    await fireEvent(screen.getByTestId('map'), 'layout', layout(390, 320));
    await fireEvent.press(screen.getByLabelText('CI-4521-AB · Toyota Hilux'));
    expect(screen.getByText('En mouvement · 54 km/h')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Fermer'));
    expect(screen.queryByText('En mouvement · 54 km/h')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Zoom avant'));
    expect(screen.getByLabelText('Recentrer')).toBeTruthy();
  });

  it('dessin : outil actif et consigne', async () => {
    const onShapes = jest.fn();
    await renderKit(<KitMap drawTools={['marker', 'line']} onShapesChanged={onShapes} />);
    await fireEvent.press(screen.getByLabelText('Tracer une ligne'));
    expect(screen.getByText('Touchez la carte pour ajouter des sommets (0)')).toBeTruthy();
    await fireEvent.press(screen.getByText('Terminer'));
    expect(onShapes).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Tout effacer'));
    expect(onShapes).toHaveBeenCalledWith([]);
  });
});

describe('médias', () => {
  it('durée m:ss', () => {
    expect(mmss(0)).toBe('0:00');
    expect(mmss(134000)).toBe('2:14');
    expect(mmss(23999)).toBe('0:23');
  });

  it('audio : ±15 s et bascule lecture / pause', async () => {
    await renderKit(<KitAudioPlayer title="Appel client" duration={60000} />);
    await fireEvent.press(screen.getByLabelText('Avancer de 15 secondes'));
    expect(screen.getByText('0:15')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Reculer de 15 secondes'));
    expect(screen.getAllByText('0:00').length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByLabelText('Lire, Appel client'));
    await fireEvent.press(screen.getByLabelText('Pause, Appel client'));
    expect(screen.getByLabelText('Lire, Appel client')).toBeTruthy();
  });

  it('vidéo : vitesse, son, double-toucher annoncé', async () => {
    await renderKit(<KitVideoPlayer />);
    expect(screen.getByLabelText('Lire, Trajet CI-4521-AB')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Couper le son'));
    expect(screen.getByLabelText('Activer le son')).toBeTruthy();
    expect(screen.getByLabelText('Vitesse ×1')).toBeTruthy();
  });

  it('façade YouTube : aucun lecteur avant le toucher', async () => {
    await renderKit(<YoutubeFacade title="Présentation" />);
    expect(screen.queryByLabelText('Position de lecture')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Lire la vidéo YouTube : Présentation, 4:32'));
    expect(screen.getByLabelText('Position de lecture')).toBeTruthy();
  });

  it('visionneuse : en-tête du fichier ouvert', async () => {
    await renderKit(<FileViewer files={VIEWER_FILES} index={7} onClose={() => undefined} />);
    expect(screen.getAllByText('firmware-v03.28.bin').length).toBeGreaterThan(0);
    expect(screen.getByText('512 Ko · 8 / 8')).toBeTruthy();
    expect(screen.getByText('Aperçu indisponible')).toBeTruthy();
  });

  it('masonry : toutes les tuiles', async () => {
    await renderKit(<MasonryGrid count={5} />);
    expect(screen.getByText('Site 5')).toBeTruthy();
  });
});
