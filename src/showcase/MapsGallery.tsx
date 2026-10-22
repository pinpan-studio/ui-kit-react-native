import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';

import {
  BASEMAPS,
  BASEMAP_IDS,
  KitChip,
  KitMap,
  MapStatePlaceholder,
  SegmentedToggle,
  StatusBadge,
  shapeLabel,
  type Basemap,
  type DrawnShape,
  type KitMapHandle,
} from '../components';
import { FLOTTE, FLOTTE_LEGEND, POSITIONS_DENSES, TRAJETS, TRAJET_ETAPES, ZONES, ZONE_MARKERS } from '../data/map';
import { font, radius, space, toneColor, useKitTheme } from '../theme';
import { Demo, DocPage, Gap, type DocSection } from './doc';

const SHAPE_ICON = { marker: 'mi:place', line: 'mi:timeline', polygon: 'pentagon-outline' } as const;

/** `/components/maps` — KitMap : fonds gratuits, marqueurs, regroupement, trajets, zones, dessin, carte compacte, états. */
export function MapsGallery({ initialSection }: { initialSection?: string }) {
  const { kit } = useKitTheme();
  const fleet = useRef<KitMapHandle>(null);
  const [basemap, setBasemap] = useState<Basemap>('streets');
  const [selected, setSelected] = useState<string | null>(null);
  const [shapes, setShapes] = useState<DrawnShape[]>([]);
  const [state, setState] = useState<'loading' | 'empty' | 'error'>('loading');
  const first = FLOTTE[0]!;

  const sections: DocSection[] = [
    {
      id: 'basemaps',
      title: 'Fonds de carte',
      source: 'Basemap (Esri Canvas, Rues, Topo, Satellite, OpenStreetMap)',
      description:
        'Par défaut, gris clair ou gris foncé selon le thème. Le bouton « calques » de la carte permet aussi de changer de fond.',
      children: (
        <Demo label="Sélecteur de fond" flush>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {BASEMAP_IDS.map((b) => (
              <KitChip
                key={b}
                label={BASEMAPS[b].label}
                icon={BASEMAPS[b].icon}
                selected={basemap === b}
                onPress={() => setBasemap(b)}
              />
            ))}
          </ScrollView>
          <KitMap key={basemap} basemap={basemap} height={260} radius={0} zoom={13} showBasemapSwitcher={false} />
        </Demo>
      ),
    },
    {
      id: 'markers',
      title: 'Marqueurs',
      source: 'MapMarkerData · FlatMarker',
      description:
        'Disque teinté avec icône, halo pulsé pour les véhicules en mouvement, flèche de cap. Touchez un marqueur : popup en carte flottante ; la liste sous la carte centre le véhicule.',
      children: (
        <Demo label="Flotte en temps réel" flush>
          <KitMap ref={fleet} height={320} radius={0} markers={FLOTTE} fitToContent legend={FLOTTE_LEGEND} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWide}>
            {FLOTTE.map((m) => (
              <KitChip
                key={m.id}
                label={m.tooltip ?? m.id}
                icon={m.icon}
                selected={selected === m.id}
                onPress={() => {
                  setSelected(m.id);
                  fleet.current?.flyTo(m.point, 15);
                }}
              />
            ))}
          </ScrollView>
        </Demo>
      ),
    },
    {
      id: 'cluster',
      title: 'Clustering',
      source: 'KitMap cluster',
      description:
        '420 balises réparties en Côte d’Ivoire. Les bulles se divisent en zoomant ; leur couleur reflète l’état le plus critique. Touchez une bulle pour zoomer.',
      children: (
        <Demo label="Parc de balises" flush>
          <KitMap
            height={340}
            radius={0}
            markers={POSITIONS_DENSES}
            cluster
            zoom={6.4}
            center={{ lat: 7.4, lng: -5.5 }}
          />
        </Demo>
      ),
    },
    {
      id: 'routes',
      title: 'Trajets',
      source: 'MapRouteData (plein, pointillé, départ / arrivée)',
      children: (
        <Demo label="Trajet réalisé vs prévu" flush>
          <KitMap height={300} radius={0} routes={TRAJETS} markers={TRAJET_ETAPES} fitToContent />
          <View style={styles.routeLegend}>
            {TRAJETS.map((r) => (
              <View key={r.id} style={styles.routeItem}>
                <View style={[styles.routeSwatch, { backgroundColor: toneColor(r.tone ?? 'primary', kit) }]} />
                <Text style={[font('400', 12), styles.shrink, { color: kit.textSecondary }]}>{r.label}</Text>
              </View>
            ))}
          </View>
        </Demo>
      ),
    },
    {
      id: 'zones',
      title: 'Zones / géofences',
      source: 'MapZoneData (cercle en mètres, polygone)',
      children: (
        <Demo label="Géofences" flush>
          <KitMap height={300} radius={0} zones={ZONES} markers={ZONE_MARKERS} fitToContent />
          {ZONES.map((z) => {
            const restricted = z.tone === 'error';
            return (
              <View key={z.id} style={styles.zoneRow}>
                <Icon
                  source={z.center ? 'mi:radio-button-checked' : 'pentagon-outline'}
                  size={24}
                  color={toneColor(z.tone ?? 'primary', kit)}
                />
                <Text numberOfLines={1} style={[font('500', 13), styles.fill, { color: kit.textPrimary }]}>
                  {z.label}
                </Text>
                <StatusBadge label={restricted ? 'Restreinte' : 'Active'} tone={restricted ? 'error' : 'success'} />
              </View>
            );
          })}
        </Demo>
      ),
    },
    {
      id: 'draw',
      title: 'Dessin',
      source: 'KitMap drawTools — équivalent Leaflet Draw / Geoman',
      description:
        'Choisissez un outil (point, ligne, zone) puis touchez la carte ; « Terminer » ferme la forme, ↶ annule le dernier sommet.',
      children: (
        <Demo label="Éditeur de zones" flush>
          <KitMap
            height={340}
            radius={0}
            zoom={13}
            drawTools={['marker', 'line', 'polygon']}
            onShapesChanged={setShapes}
          />
          <View style={styles.shapes}>
            {shapes.length ? (
              shapes.map((s, i) => <KitChip key={i} label={shapeLabel(s)} icon={SHAPE_ICON[s.tool]} />)
            ) : (
              <Text style={[font('400', 12.5), { color: kit.textMuted }]}>Aucune forme dessinée.</Text>
            )}
          </View>
        </Demo>
      ),
    },
    {
      id: 'compact',
      title: 'Carte compacte',
      source: 'KitMap interactive={false}',
      description: 'Vignette non interactive pour une fiche (position du véhicule, adresse d’un client).',
      cols: 2,
      children: [
        <Demo key="vehicle" label="Fiche véhicule" flush>
          <KitMap
            height={150}
            radius={0}
            interactive={false}
            showZoom={false}
            showBasemapSwitcher={false}
            zoom={15}
            center={first.point}
            markers={[first]}
          />
          <View style={styles.tile}>
            <Icon source="mi:local-shipping" size={24} color={kit.textSecondary} />
            <View style={styles.fill}>
              <Text style={[font('500', 14), { color: kit.textPrimary }]}>CI-4521-AB · Toyota Hilux</Text>
              <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>
                Plateau, bd de la République · il y a 12 s
              </Text>
            </View>
            <StatusBadge label="54 km/h" tone="success" uppercase={false} />
          </View>
        </Demo>,
        <Demo key="address" label="Adresse client" flush>
          <KitMap
            height={200}
            radius={0}
            interactive={false}
            showZoom={false}
            showBasemapSwitcher={false}
            zoom={14}
            center={ZONE_MARKERS[0]!.point}
            markers={ZONE_MARKERS}
          />
        </Demo>,
      ],
    },
    {
      id: 'states',
      title: 'États',
      source: 'MapStatePlaceholder',
      children: (
        <Demo label="Chargement · vide · erreur">
          <Gap>
            <SegmentedToggle
              expand
              value={state}
              onChange={setState}
              options={[
                { value: 'loading', label: 'Chargement' },
                { value: 'empty', label: 'Vide' },
                { value: 'error', label: 'Erreur' },
              ]}
            />
            <MapStatePlaceholder kind={state} />
          </Gap>
        </Demo>
      ),
    },
  ];

  return (
    <DocPage
      title="Cartes"
      icon="mi:map"
      initialSection={initialSection}
      testID="category-maps"
      subtitle="Composant KitMap sans dépendance native : fonds de carte libres sans clé d’API (seules les tuiles sont téléchargées), marqueurs flat, clustering, trajets, zones, dessin au doigt. Contrôles et popups suivent le thème clair / sombre."
      sections={sections}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  shrink: { flexShrink: 1 },
  chips: { gap: space.s2, padding: space.s2 },
  chipsWide: { gap: space.s2, padding: space.s3 },
  routeLegend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6, padding: space.s3 },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  routeSwatch: { width: 22, height: 4, borderRadius: radius.full },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 48, paddingHorizontal: space.m },
  shapes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: space.s3 },
  tile: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m },
});
