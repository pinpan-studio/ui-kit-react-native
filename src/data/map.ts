import type { MapMarkerData, MapRouteData, MapZoneData } from '../components/map/models';
import type { KitTone } from '../theme';

/** Données géographiques statiques (Abidjan et environs). */
export const FLOTTE: MapMarkerData[] = [
  {
    id: 'v1',
    point: { lat: 5.3237, lng: -4.0193 },
    title: 'CI-4521-AB · Toyota Hilux',
    lines: ['En mouvement · 54 km/h', 'Plateau, bd de la République'],
    icon: 'mi:local-shipping',
    tone: 'success',
    pulse: true,
    heading: 120,
    tooltip: 'CI-4521-AB',
  },
  {
    id: 'v2',
    point: { lat: 5.36, lng: -3.99 },
    title: 'CI-2210-CD · Renault Kangoo',
    lines: ['À l’arrêt depuis 12 min', 'Cocody, Riviera 2'],
    icon: 'mi:airport-shuttle',
    tone: 'warning',
    tooltip: 'CI-2210-CD',
  },
  {
    id: 'v3',
    point: { lat: 5.345, lng: -4.08 },
    title: 'CI-3307-EF · Suzuki Swift',
    lines: ['En mouvement · 38 km/h', 'Yopougon, Selmer'],
    icon: 'mi:directions-car',
    tone: 'success',
    pulse: true,
    heading: 40,
    tooltip: 'CI-3307-EF',
  },
  {
    id: 'v4',
    point: { lat: 5.303, lng: -3.985 },
    title: 'CI-0418-GH · Yamaha Crux',
    lines: ['Hors ligne depuis 2 j', 'Marcory, zone 4'],
    icon: 'mi:two-wheeler',
    tone: 'error',
    tooltip: 'CI-0418-GH',
  },
  {
    id: 'v5',
    point: { lat: 5.293, lng: -4.005 },
    title: 'CI-7781-JK · Mercedes Actros',
    lines: ['Moteur coupé', 'Treichville, port'],
    icon: 'mi:local-shipping',
    tone: 'neutral',
    tooltip: 'CI-7781-JK',
  },
  {
    id: 'v6',
    point: { lat: 5.418, lng: -4.02 },
    title: 'CI-1150-LM · Toyota Coaster',
    lines: ['En mouvement · 61 km/h', 'Abobo, gare'],
    icon: 'mi:directions-bus',
    tone: 'success',
    pulse: true,
    heading: 200,
    tooltip: 'CI-1150-LM',
  },
  {
    id: 'v7',
    point: { lat: 5.255, lng: -3.93 },
    title: 'CI-9902-NP · Isuzu D-Max',
    lines: ['Alerte : sortie de zone', 'Port-Bouët, aéroport'],
    icon: 'mi:warning',
    tone: 'error',
    pulse: true,
    tooltip: 'CI-9902-NP',
  },
  {
    id: 'v8',
    point: { lat: 5.297, lng: -3.948 },
    title: 'CI-6630-QR · Peugeot Partner',
    lines: ['En maintenance', 'Koumassi, atelier'],
    icon: 'mi:build',
    tone: 'info',
    tooltip: 'CI-6630-QR',
  },
];

export const FLOTTE_LEGEND: [string, KitTone][] = [
  ['En mouvement', 'success'],
  ['À l’arrêt', 'warning'],
  ['Maintenance', 'info'],
  ['Alerte', 'error'],
];

/** Nuage de 420 balises pour la démo de regroupement (pseudo-aléatoire déterministe). */
export const POSITIONS_DENSES: MapMarkerData[] = (() => {
  const centres = [
    [5.33, -4.02, 0.06],
    [7.69, -5.03, 0.05],
    [4.75, -6.64, 0.04],
    [6.82, -5.28, 0.04],
    [9.45, -5.63, 0.03],
  ] as const;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const out: MapMarkerData[] = [];
  centres.forEach(([lat0, lng0, spread], ci) => {
    const n = ci === 0 ? 220 : 50;
    for (let i = 0; i < n; i++) {
      const r = rnd();
      const lat = lat0 + (rnd() - 0.5) * spread * 2;
      const lng = lng0 + (rnd() - 0.5) * spread * 2;
      out.push({
        id: `p${ci}-${i}`,
        point: { lat, lng },
        icon: 'mi:sensors',
        tone: r > 0.9 ? 'error' : r > 0.75 ? 'warning' : 'success',
        title: `Balise #${1000 + out.length}`,
        lines: [r > 0.9 ? 'Hors ligne' : 'En ligne'],
      });
    }
  });
  return out;
})();

const pts = (...p: [number, number][]) => p.map(([lat, lng]) => ({ lat, lng }));

export const TRAJETS: MapRouteData[] = [
  {
    id: 't1',
    label: 'Trajet réalisé · 38 km · 52 min',
    tone: 'primary',
    endpoints: true,
    points: pts(
      [5.3237, -4.0193],
      [5.31, -4.005],
      [5.295, -3.99],
      [5.285, -3.96],
      [5.26, -3.93],
      [5.245, -3.89],
      [5.23, -3.83],
      [5.215, -3.78],
      [5.2, -3.738],
    ),
  },
  {
    id: 't2',
    label: 'Itinéraire prévu',
    tone: 'warning',
    dashed: true,
    points: pts([5.2, -3.738], [5.24, -3.76], [5.29, -3.82], [5.33, -3.89], [5.36, -3.99]),
  },
];

export const TRAJET_ETAPES: MapMarkerData[] = [
  {
    id: 'e1',
    point: { lat: 5.26, lng: -3.93 },
    title: 'Arrêt 8 min',
    lines: ['10:42 – 10:50', 'Port-Bouët'],
    icon: 'mi:pause',
    tone: 'warning',
  },
  {
    id: 'e2',
    point: { lat: 5.23, lng: -3.83 },
    title: 'Excès de vitesse',
    lines: ['94 km/h (limite 70)', '11:05'],
    icon: 'mi:speed',
    tone: 'error',
  },
];

export const ZONES: MapZoneData[] = [
  {
    id: 'z1',
    label: 'Dépôt central (rayon 600 m)',
    tone: 'success',
    center: { lat: 5.303, lng: -3.985 },
    radius: 600,
  },
  {
    id: 'z2',
    label: 'Zone portuaire — accès restreint',
    tone: 'error',
    polygon: pts([5.299, -4.018], [5.301, -3.999], [5.286, -3.996], [5.282, -4.015]),
  },
  {
    id: 'z3',
    label: 'Secteur de livraison Cocody',
    tone: 'info',
    polygon: pts([5.375, -4.005], [5.38, -3.97], [5.35, -3.96], [5.342, -3.995]),
  },
  {
    id: 'z4',
    label: 'Aéroport (rayon 1,5 km)',
    tone: 'warning',
    center: { lat: 5.255, lng: -3.93 },
    radius: 1500,
  },
];

export const ZONE_MARKERS: MapMarkerData[] = [
  {
    id: 'zm1',
    point: { lat: 5.303, lng: -3.985 },
    icon: 'mi:warehouse',
    tone: 'success',
    title: 'Dépôt central',
    lines: ['12 véhicules présents'],
  },
];
