import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, List, SegmentedButtons, Text } from 'react-native-paper';

import { Page } from '../shell/Page';
import { radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

const fleet = [
  { id: 'CI-4521-AB', label: 'Toyota Hilux', status: 'En mouvement', color: 'success', x: 25, y: 32 },
  { id: 'CI-2087-CD', label: 'Isuzu D-Max', status: 'À l’arrêt', color: 'warning', x: 69, y: 25 },
  { id: 'CI-7734-EF', label: 'Hyundai H1', status: 'Maintenance', color: 'info', x: 55, y: 68 },
  { id: 'CI-0418-GH', label: 'Mitsubishi L200', status: 'Alerte', color: 'error', x: 82, y: 65 },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" accessibilityRole="header">
        {title}
      </Text>
      <Card mode="outlined">
        <Card.Content style={styles.content}>{children}</Card.Content>
      </Card>
    </View>
  );
}

export function MapsGallery() {
  const theme = useKitTheme();
  const [basemap, setBasemap] = useState('Rues');
  const [selected, setSelected] = useState<string>(fleet[0].id);
  const [zoom, setZoom] = useState(1);
  const [shapeCount, setShapeCount] = useState(0);
  const [drawTool, setDrawTool] = useState('point');
  const [mapState, setMapState] = useState('loading');
  const selectedVehicle = fleet.find((vehicle) => vehicle.id === selected) ?? fleet[0];

  return (
    <Page testID="category-maps">
      <Text variant="titleLarge" accessibilityRole="header">
        Cartes
      </Text>
      <Text variant="bodyLarge">
        Exemples cartographiques locaux : fonds illustrés, flotte, trajets, zones, dessin et états.
      </Text>

      <Section title="Fonds de carte">
        <View style={styles.row}>
          {['Gris', 'Rues', 'Topo', 'Satellite', 'OSM'].map((item) => (
            <Chip key={item} selected={basemap === item} onPress={() => setBasemap(item)}>
              {item}
            </Chip>
          ))}
        </View>
        <MapPanel theme={theme} mode={basemap} zoom={zoom} markers={fleet} selected={selected} onSelect={setSelected} />
        <Text variant="bodySmall">Fond actif : {basemap} · exemple schématique local</Text>
      </Section>

      <Section title="Marqueurs">
        <MapPanel theme={theme} mode="Rues" zoom={zoom} markers={fleet} selected={selected} onSelect={setSelected} />
        <View style={styles.row}>
          {fleet.map((item) => (
            <Chip key={item.id} selected={item.id === selected} icon="map-marker" onPress={() => setSelected(item.id)}>
              {item.id}
            </Chip>
          ))}
        </View>
        <List.Item
          title={`${selectedVehicle.id} · ${selectedVehicle.label}`}
          description={`${selectedVehicle.status} · Plateau, Abidjan · il y a 12 s`}
          left={(p) => <List.Icon {...p} icon="car-outline" />}
          right={() => <Chip>{selectedVehicle.status}</Chip>}
        />
      </Section>

      <Section title="Clustering">
        <Text variant="bodyMedium">420 balises regroupées par zone. Touchez la bulle pour zoomer dans le groupe.</Text>
        <MapPanel theme={theme} mode="Rues" zoom={zoom} clustered onZoom={() => setZoom(Math.min(2, zoom + 0.25))} />
        <View style={styles.row}>
          <Button icon="minus" onPress={() => setZoom(Math.max(0.75, zoom - 0.25))}>
            Dézoomer
          </Button>
          <Text>Zoom {Math.round(zoom * 100)} %</Text>
          <Button icon="plus" onPress={() => setZoom(Math.min(2, zoom + 0.25))}>
            Zoomer
          </Button>
        </View>
      </Section>

      <Section title="Trajets">
        <MapPanel theme={theme} mode="Rues" zoom={1} route selected={selected} markers={fleet.slice(0, 2)} />
        <View style={styles.row}>
          <Chip icon="circle">Trajet réalisé · 18,4 km</Chip>
          <Chip icon="circle-outline">Itinéraire prévu · 16,9 km</Chip>
        </View>
        <Text variant="bodySmall">Départ · Plateau, Abidjan → Arrivée · Cocody · durée 42 min</Text>
      </Section>

      <Section title="Zones / géofences">
        <MapPanel theme={theme} mode="Rues" zoom={1} zones />
        <List.Item
          title="Dépôt de Vridi"
          description="Zone de service · rayon 500 m"
          left={(p) => <List.Icon {...p} icon="map-marker-radius-outline" />}
          right={() => <Chip icon="check-circle">Active</Chip>}
        />
        <List.Item
          title="Port autonome"
          description="Zone restreinte · polygone"
          left={(p) => <List.Icon {...p} icon="pentagon-outline" />}
          right={() => <Chip icon="alert">Restreinte</Chip>}
        />
      </Section>

      <Section title="Dessin">
        <SegmentedButtons
          value={drawTool}
          onValueChange={setDrawTool}
          buttons={[
            { value: 'point', label: 'Point', icon: 'map-marker' },
            { value: 'line', label: 'Ligne', icon: 'chart-timeline-variant' },
            { value: 'area', label: 'Zone', icon: 'vector-polygon' },
          ]}
        />
        <MapPanel
          theme={theme}
          mode="Rues"
          zoom={1}
          drawing={shapeCount > 0}
          onSelect={() => setShapeCount(shapeCount + 1)}
        />
        <View style={styles.row}>
          <Button icon="plus" mode="contained" onPress={() => setShapeCount(shapeCount + 1)}>
            Ajouter un {drawTool === 'point' ? 'point' : drawTool === 'line' ? 'sommet' : 'sommet de zone'}
          </Button>
          <Button icon="undo" onPress={() => setShapeCount(Math.max(0, shapeCount - 1))}>
            Annuler
          </Button>
          <Button icon="check" onPress={() => setShapeCount(0)}>
            Terminer
          </Button>
        </View>
        <Text variant="bodySmall">
          {shapeCount ? `${shapeCount} point(s) dans le tracé` : 'Touchez la carte pour placer un point.'}
        </Text>
      </Section>

      <Section title="Carte compacte">
        <MapPanel theme={theme} mode="Rues" zoom={1} compact markers={[fleet[0]]} selected={fleet[0].id} />
        <List.Item
          title="CI-4521-AB · Toyota Hilux"
          description="Plateau, bd de la République · il y a 12 s"
          left={(p) => <List.Icon {...p} icon="truck-outline" />}
          right={() => <Chip icon="speedometer">54 km/h</Chip>}
        />
      </Section>

      <Section title="États">
        <SegmentedButtons
          value={mapState}
          onValueChange={setMapState}
          buttons={[
            { value: 'loading', label: 'Chargement' },
            { value: 'empty', label: 'Vide' },
            { value: 'error', label: 'Erreur' },
          ]}
        />
        <View style={[styles.stateBox, { backgroundColor: theme.colors.surfaceVariant }]}>
          <IconButton
            icon={
              mapState === 'loading'
                ? 'map-clock-outline'
                : mapState === 'empty'
                  ? 'map-marker-off-outline'
                  : 'alert-circle-outline'
            }
            size={32}
            accessibilityLabel={`État : ${mapState}`}
          />
          <Text variant="titleSmall">
            {mapState === 'loading'
              ? 'Chargement des positions…'
              : mapState === 'empty'
                ? 'Aucun véhicule dans cette zone'
                : 'Carte indisponible'}
          </Text>
          <Text variant="bodySmall">
            {mapState === 'loading'
              ? 'Dernière actualisation il y a 12 s'
              : mapState === 'empty'
                ? 'Modifiez la zone ou les filtres.'
                : 'Vérifiez la connexion puis réessayez.'}
          </Text>
          {mapState === 'error' ? <Button onPress={() => setMapState('loading')}>Réessayer</Button> : null}
        </View>
      </Section>
    </Page>
  );
}

function MapPanel({
  theme,
  mode,
  zoom,
  markers = [],
  selected,
  clustered = false,
  route = false,
  zones = false,
  drawing = false,
  compact = false,
  onSelect,
  onZoom,
}: {
  theme: ReturnType<typeof useKitTheme>;
  mode: string;
  zoom: number;
  markers?: readonly {
    id: string;
    label: string;
    status: string;
    color: 'success' | 'warning' | 'info' | 'error';
    x: number;
    y: number;
  }[];
  selected?: string;
  clustered?: boolean;
  route?: boolean;
  zones?: boolean;
  drawing?: boolean;
  compact?: boolean;
  onSelect?: (id: string) => void;
  onZoom?: () => void;
}) {
  const tint =
    mode === 'Satellite'
      ? theme.colors.tertiaryContainer
      : mode === 'Topo'
        ? theme.colors.secondaryContainer
        : theme.colors.surfaceVariant;
  return (
    <View
      accessibilityLabel="Carte schématique locale"
      style={[styles.map, { height: compact ? 150 : 220, backgroundColor: tint }]}
    >
      <View style={[styles.road, styles.roadA, { backgroundColor: theme.colors.surface }]} />
      <View style={[styles.road, styles.roadB, { backgroundColor: theme.colors.surface }]} />
      <View style={[styles.road, styles.roadC, { backgroundColor: theme.colors.surface }]} />
      {zones ? (
        <>
          <View
            style={[styles.zone, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }]}
          />
          <View
            style={[
              styles.zone,
              styles.zoneDanger,
              { borderColor: theme.colors.error, backgroundColor: theme.colors.errorContainer },
            ]}
          />
        </>
      ) : null}
      {route ? <View style={[styles.route, { borderColor: theme.colors.primary }]} /> : null}
      {clustered ? (
        <>
          <View style={[styles.cluster, { left: '25%', top: '31%', backgroundColor: theme.colors.primary }]}>
            <Text style={styles.clusterText}>128</Text>
          </View>
          <View style={[styles.cluster, { left: '57%', top: '49%', backgroundColor: theme.colors.error }]}>
            <Text style={styles.clusterText}>64</Text>
          </View>
          <View style={[styles.cluster, { left: '71%', top: '23%', backgroundColor: theme.colors.tertiary }]}>
            <Text style={styles.clusterText}>42</Text>
          </View>
        </>
      ) : (
        markers.map((marker) => (
          <Chip
            key={marker.id}
            compact
            icon="map-marker"
            onPress={() => onSelect?.(marker.id)}
            style={[
              styles.marker,
              {
                left: `${marker.x * zoom}%`,
                top: `${marker.y * zoom}%`,
                backgroundColor: marker.color === 'error' ? theme.colors.error : theme.kit[marker.color],
              },
            ]}
            textStyle={{ color: '#ffffff' }}
          >
            {marker.id.split('-')[1]}
          </Chip>
        ))
      )}
      {drawing ? (
        <View style={[styles.drawPoint, { left: '45%', top: '53%', backgroundColor: theme.colors.error }]} />
      ) : null}
      {clustered ? (
        <IconButton icon="plus" style={styles.zoomButton} accessibilityLabel="Zoomer sur le groupe" onPress={onZoom} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s3 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s1 },
  map: { borderRadius: radius.lg, overflow: 'hidden', position: 'relative' },
  road: { position: 'absolute', borderRadius: 12 },
  roadA: { left: '-10%', top: '41%', width: '120%', height: 18, transform: [{ rotate: '-17deg' }] },
  roadB: { left: '15%', top: '-15%', width: 15, height: '140%', transform: [{ rotate: '23deg' }] },
  roadC: { left: '70%', top: '-12%', width: 12, height: '130%', transform: [{ rotate: '-29deg' }] },
  zone: {
    position: 'absolute',
    left: '13%',
    top: '19%',
    width: '40%',
    height: '62%',
    borderWidth: 2,
    borderRadius: 58,
    opacity: 0.75,
  },
  zoneDanger: { left: '52%', top: '31%', width: '32%', height: '43%', borderStyle: 'dashed' },
  route: {
    position: 'absolute',
    left: '21%',
    top: '25%',
    width: '58%',
    height: '49%',
    borderWidth: 4,
    borderRadius: 75,
    borderStyle: 'dashed',
    transform: [{ rotate: '-18deg' }],
  },
  marker: { position: 'absolute', transform: [{ translateX: -22 }, { translateY: -18 }], minWidth: 44 },
  cluster: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterText: { color: '#fff', fontWeight: '700' },
  drawPoint: { position: 'absolute', width: 12, height: 12, borderRadius: 6 },
  zoomButton: { position: 'absolute', right: 4, bottom: 4, backgroundColor: '#ffffff' },
  stateBox: {
    minHeight: 150,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.s3,
  },
});
