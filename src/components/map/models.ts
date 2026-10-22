import type { KitTone } from '../../theme';

/**
 * Modèles de carte (`map.models.ts` / `map_models.dart`) et géométrie Web Mercator : projection,
 * distances, ajustement aux données, regroupement. Aucune dépendance cartographique native.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarkerData {
  id: string;
  point: LatLng;
  title?: string;
  /** Libellé court (puces, lecteur d'écran). */
  tooltip?: string;
  lines?: string[];
  icon?: string;
  tone?: KitTone;
  /** Halo pulsé (véhicule en mouvement). */
  pulse?: boolean;
  /** Cap en degrés (flèche). */
  heading?: number;
}

export interface MapRouteData {
  id: string;
  points: LatLng[];
  label?: string;
  tone?: KitTone;
  dashed?: boolean;
  /** Pastilles de départ et d'arrivée. */
  endpoints?: boolean;
}

export interface MapZoneData {
  id: string;
  label: string;
  tone?: KitTone;
  polygon?: LatLng[];
  center?: LatLng;
  /** Rayon en mètres (zone circulaire). */
  radius?: number;
}

/** Fonds de carte gratuits sans clé d'API : seules les tuiles sont téléchargées. */
export type Basemap = 'canvasLight' | 'canvasDark' | 'streets' | 'topo' | 'satellite' | 'osm';

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';

export const BASEMAPS: Record<Basemap, { label: string; icon: string; url: string; maxZoom: number }> = {
  canvasLight: {
    label: 'Gris clair',
    icon: 'mi:light-mode',
    url: `${ESRI}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    maxZoom: 16,
  },
  canvasDark: {
    label: 'Gris foncé',
    icon: 'mi:dark-mode',
    url: `${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    maxZoom: 16,
  },
  streets: {
    label: 'Rues',
    icon: 'mi:signpost',
    url: `${ESRI}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`,
    maxZoom: 19,
  },
  topo: {
    label: 'Topographique',
    icon: 'mi:terrain',
    url: `${ESRI}/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`,
    maxZoom: 19,
  },
  satellite: {
    label: 'Satellite',
    icon: 'mi:satellite-alt',
    url: `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
    maxZoom: 19,
  },
  osm: {
    label: 'OpenStreetMap',
    icon: 'mi:public',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
  },
};

export const BASEMAP_IDS = Object.keys(BASEMAPS) as Basemap[];

export const attributionOf = (b: Basemap) => (b === 'osm' ? '© OpenStreetMap' : '© Esri');

export const tileUrl = (b: Basemap, z: number, x: number, y: number) =>
  BASEMAPS[b].url.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));

export const TILE = 256;
export const MIN_ZOOM = 3;
export const MAX_ZOOM = 18;

/** Coordonnées « monde » en pixels au niveau de zoom `z` (Web Mercator, EPSG:3857). */
export function project(p: LatLng, z: number): { x: number; y: number } {
  const size = TILE * 2 ** z;
  const s = Math.sin((Math.max(-85.05, Math.min(85.05, p.lat)) * Math.PI) / 180);
  return {
    x: ((p.lng + 180) / 360) * size,
    y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * size,
  };
}

export function unproject(x: number, y: number, z: number): LatLng {
  const size = TILE * 2 ** z;
  const n = Math.PI - (2 * Math.PI * y) / size;
  return { lat: (180 / Math.PI) * Math.atan(Math.sinh(n)), lng: (x / size) * 360 - 180 };
}

/** Mètres par pixel à la latitude donnée. */
export const metersPerPixel = (lat: number, z: number) => (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** z;

/** Distance orthodromique en mètres (haversine). */
export function distance(a: LatLng, b: LatLng): number {
  const r = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
}

export const clampZoom = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));

/** Centre et zoom qui cadrent tous les points dans `w × h` avec une marge `pad`. */
export function fitBounds(points: LatLng[], w: number, h: number, pad = 48): { center: LatLng; zoom: number } | null {
  if (points.length < 2 || w <= 0 || h <= 0) return null;
  const px = points.map((p) => project(p, 0));
  const xs = px.map((p) => p.x);
  const ys = px.map((p) => p.y);
  const [x1, x2, y1, y2] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const zx = Math.log2(Math.max(1, w - 2 * pad) / Math.max(1e-9, x2 - x1));
  const zy = Math.log2(Math.max(1, h - 2 * pad) / Math.max(1e-9, y2 - y1));
  return { center: unproject((x1 + x2) / 2, (y1 + y2) / 2, 0), zoom: clampZoom(Math.min(zx, zy, 17)) };
}

/** Regroupement par grille dépendant du zoom (~60 px à l'écran), désactivé à partir du zoom 15. */
export function clusterMarkers(
  markers: MapMarkerData[],
  zoom: number,
  enabled: boolean,
): { point: LatLng; group: MapMarkerData[] }[] {
  if (!enabled || zoom >= 15) return markers.map((m) => ({ point: m.point, group: [m] }));
  const cell = (360 / 2 ** zoom) * 0.9;
  const buckets = new Map<string, MapMarkerData[]>();
  for (const m of markers) {
    const k = `${Math.floor(m.point.lat / cell)}:${Math.floor(m.point.lng / cell)}`;
    const b = buckets.get(k);
    if (b) b.push(m);
    else buckets.set(k, [m]);
  }
  return [...buckets.values()].map((g) => ({
    point: {
      lat: g.reduce((a, m) => a + m.point.lat, 0) / g.length,
      lng: g.reduce((a, m) => a + m.point.lng, 0) / g.length,
    },
    group: g,
  }));
}

/** Outils de dessin (équivalent Leaflet Draw / Geoman). */
export type DrawTool = 'marker' | 'line' | 'polygon';

export interface DrawnShape {
  tool: DrawTool;
  points: LatLng[];
}

export function shapeLabel(s: DrawnShape): string {
  if (s.tool === 'marker') return 'Point';
  if (s.tool === 'polygon') return `Zone · ${s.points.length} sommets`;
  let m = 0;
  for (let i = 1; i < s.points.length; i++) m += distance(s.points[i - 1]!, s.points[i]!);
  return `Tracé · ${(m / 1000).toFixed(2).replace('.', ',')} km`;
}
