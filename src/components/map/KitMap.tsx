import { useEffect, useImperativeHandle, useRef, useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { ActivityIndicator, Icon, Menu, TouchableRipple } from 'react-native-paper';
import Svg, { Circle, Line, Polygon, Polyline, Text as SvgText } from 'react-native-svg';

import {
  elevation,
  font,
  radius as radii,
  space,
  toneColor,
  toneLight,
  toneText,
  useKitTheme,
  withAlpha,
  type KitTone,
} from '../../theme';
import { BLACK, WHITE } from '../../theme/swatches';
import {
  BASEMAPS,
  BASEMAP_IDS,
  TILE,
  attributionOf,
  clampZoom,
  clusterMarkers,
  fitBounds,
  metersPerPixel,
  project,
  tileUrl,
  unproject,
  type Basemap,
  type DrawTool,
  type DrawnShape,
  type LatLng,
  type MapMarkerData,
  type MapRouteData,
  type MapZoneData,
} from './models';

type ViewRef = ComponentRef<typeof View>;

export interface KitMapHandle {
  flyTo: (p: LatLng, zoom?: number) => void;
  /** Recadre sur le contenu (marqueurs, trajets, zones), sinon revient au centre initial. */
  fit: () => void;
}

const DEFAULT_CENTER: LatLng = { lat: 5.33, lng: -4.01 };
/** Au-delà de ce déplacement (dp), le toucher devient un glisser. */
const SLOP = 6;

const DRAW_TOOLS: Record<DrawTool, { icon: string; label: string }> = {
  marker: { icon: 'mi:add-location-alt', label: 'Placer un point' },
  line: { icon: 'mi:timeline', label: 'Tracer une ligne' },
  polygon: { icon: 'pentagon-outline', label: 'Dessiner une zone' },
};

/**
 * Carte du kit (`KitMap` Flutter, `<app-map>`) sans dépendance native : tuiles Web Mercator gratuites
 * affichées en images, zones, trajets et dessins en SVG, marqueurs « flat » touchables, regroupement,
 * contrôles (zoom, recentrer, fond), légende et popup qui suivent le thème. Glisser pour déplacer,
 * pincer pour zoomer.
 */
export function KitMap({
  ref,
  height = 320,
  center: initialCenter = DEFAULT_CENTER,
  zoom: initialZoom = 12,
  markers = [],
  routes = [],
  zones = [],
  basemap,
  cluster = false,
  showBasemapSwitcher = true,
  showZoom = true,
  fitToContent = false,
  drawTools = [],
  onShapesChanged,
  legend = [],
  interactive = true,
  radius = radii.lg,
  testID,
}: {
  ref?: Ref<KitMapHandle>;
  height?: number;
  center?: LatLng;
  zoom?: number;
  markers?: MapMarkerData[];
  routes?: MapRouteData[];
  zones?: MapZoneData[];
  /** Fond imposé ; sinon gris clair / gris foncé selon le thème. */
  basemap?: Basemap;
  cluster?: boolean;
  showBasemapSwitcher?: boolean;
  showZoom?: boolean;
  fitToContent?: boolean;
  drawTools?: DrawTool[];
  onShapesChanged?: (shapes: DrawnShape[]) => void;
  legend?: [string, KitTone][];
  /** `false` : vignette figée (ni glisser ni pincer). */
  interactive?: boolean;
  radius?: number;
  testID?: string;
}) {
  const { kit, colorMode } = useKitTheme();
  const root = useRef<ViewRef>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState({ center: initialCenter, zoom: initialZoom });
  const [chosen, setChosen] = useState(basemap);
  const [menu, setMenu] = useState(false);
  const [popup, setPopup] = useState<MapMarkerData | null>(null);
  const [tool, setTool] = useState<DrawTool | null>(null);
  const [shapes, setShapes] = useState<DrawnShape[]>([]);
  const [draft, setDraft] = useState<LatLng[]>([]);
  const gesture = useRef({ x: 0, y: 0, dist: 0, touches: 0, moved: false, ox: 0, oy: 0, view });

  const bm: Basemap = chosen ?? (colorMode === 'dark' ? 'canvasDark' : 'canvasLight');
  const { w, h } = size;
  const origin = project(view.center, view.zoom);
  const toScreen = (p: LatLng) => {
    const q = project(p, view.zoom);
    return { x: q.x - origin.x + w / 2, y: q.y - origin.y + h / 2 };
  };
  const toLatLng = (x: number, y: number) => unproject(origin.x + x - w / 2, origin.y + y - h / 2, view.zoom);
  const visible = (x: number, y: number) => x > -60 && y > -60 && x < w + 60 && y < h + 60;

  const allPoints = [
    ...markers.map((m) => m.point),
    ...routes.flatMap((r) => r.points),
    ...zones.flatMap((z) => [...(z.polygon ?? []), ...(z.center ? [z.center] : [])]),
  ];
  const fitView = (width: number, height_: number) =>
    fitBounds(allPoints, width, height_) ?? { center: initialCenter, zoom: initialZoom };

  useImperativeHandle(ref, () => ({
    flyTo: (p, zoom = 15) => setView({ center: p, zoom: clampZoom(zoom) }),
    fit: () => setView(fitView(w, h)),
  }));

  const zoomBy = (d: number) => setView((v) => ({ ...v, zoom: clampZoom(v.zoom + d) }));
  const setAllShapes = (next: DrawnShape[]) => {
    setShapes(next);
    onShapesChanged?.(next);
  };

  const onTapAt = (x: number, y: number) => {
    const p = toLatLng(x, y);
    if (tool === 'marker') setAllShapes([...shapes, { tool, points: [p] }]);
    else if (tool) setDraft((d) => [...d, p]);
    else setPopup(null);
  };
  const finishDraft = () => {
    if (tool && tool !== 'marker' && draft.length >= (tool === 'polygon' ? 3 : 2))
      setAllShapes([...shapes, { tool, points: draft }]);
    setDraft([]);
  };

  // ── Gestes : glisser (1 doigt), pincer (2 doigts), toucher ─────────
  const pinch = (e: GestureResponderEvent) => {
    const [a, b] = e.nativeEvent.touches;
    return a && b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : 0;
  };
  const restart = (e: GestureResponderEvent) => {
    const g = gesture.current;
    g.x = e.nativeEvent.pageX;
    g.y = e.nativeEvent.pageY;
    g.dist = pinch(e);
    g.touches = e.nativeEvent.touches.length;
    g.view = view;
  };
  const handlers = {
    onStartShouldSetResponderCapture: (e: GestureResponderEvent) => {
      gesture.current.moved = false;
      restart(e);
      root.current?.measureInWindow((x, y) => {
        gesture.current.ox = x;
        gesture.current.oy = y;
      });
      return false;
    },
    onStartShouldSetResponder: () => interactive || tool !== null,
    onMoveShouldSetResponderCapture: (e: GestureResponderEvent) =>
      interactive &&
      (e.nativeEvent.touches.length > 1 ||
        Math.hypot(e.nativeEvent.pageX - gesture.current.x, e.nativeEvent.pageY - gesture.current.y) > SLOP),
    onResponderTerminationRequest: () => false,
    onResponderGrant: restart,
    onResponderMove: (e: GestureResponderEvent) => {
      if (!interactive) return;
      const g = gesture.current;
      if (e.nativeEvent.touches.length !== g.touches) restart(e);
      if (g.dist > 0) {
        g.moved = true;
        setView({ center: g.view.center, zoom: clampZoom(g.view.zoom + Math.log2(pinch(e) / g.dist)) });
        return;
      }
      const dx = e.nativeEvent.pageX - g.x;
      const dy = e.nativeEvent.pageY - g.y;
      if (!g.moved && Math.hypot(dx, dy) <= SLOP) return;
      g.moved = true;
      const c = project(g.view.center, g.view.zoom);
      setView({ center: unproject(c.x - dx, c.y - dy, g.view.zoom), zoom: g.view.zoom });
    },
    onResponderRelease: (e: GestureResponderEvent) => {
      const g = gesture.current;
      if (!g.moved) onTapAt(e.nativeEvent.pageX - g.ox, e.nativeEvent.pageY - g.oy);
    },
  };

  // ── Tuiles ────────────────────────────────────────────────────────
  const tz = Math.min(BASEMAPS[bm].maxZoom, Math.round(view.zoom));
  const scale = 2 ** (view.zoom - tz);
  const tc = project(view.center, tz);
  const left = tc.x - w / 2 / scale;
  const top = tc.y - h / 2 / scale;
  const n = 2 ** tz;
  const tiles: { key: string; uri: string; x: number; y: number }[] = [];
  if (w > 0)
    for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + h / scale) / TILE); ty++) {
      if (ty < 0 || ty >= n) continue;
      for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + w / scale) / TILE); tx++)
        tiles.push({
          key: `${tz}/${tx}/${ty}`,
          uri: tileUrl(bm, tz, ((tx % n) + n) % n, ty),
          x: (tx * TILE - left) * scale,
          y: (ty * TILE - top) * scale,
        });
    }
  const tileSize = TILE * scale + 0.5;

  const line = (ps: LatLng[]) =>
    ps
      .map(toScreen)
      .map((p) => `${p.x},${p.y}`)
      .join(' ');
  const draftColor = kit.primary;
  const toolActive = tool !== null;

  return (
    <View
      ref={root}
      testID={testID}
      collapsable={false}
      onLayout={(e) => {
        const { width, height: hh } = e.nativeEvent.layout;
        if (fitToContent && size.w === 0) setView(fitView(width, hh));
        setSize({ w: width, h: hh });
      }}
      style={[styles.map, { height, borderRadius: radius, backgroundColor: kit.hover }]}
      {...handlers}
    >
      {tiles.map((t) => (
        <Image
          key={t.key}
          source={{ uri: t.uri }}
          fadeDuration={0}
          style={[styles.abs, { left: t.x, top: t.y, width: tileSize, height: tileSize }]}
        />
      ))}

      {w > 0 ? (
        <Svg width={w} height={h} style={styles.abs} pointerEvents="none">
          {zones.map((z) => {
            const col = toneColor(z.tone ?? 'primary', kit);
            if (z.center) {
              const c = toScreen(z.center);
              const r = (z.radius ?? 500) / metersPerPixel(z.center.lat, view.zoom);
              return (
                <Circle key={z.id} cx={c.x} cy={c.y} r={r} fill={col} fillOpacity={0.16} stroke={col} strokeWidth={2} />
              );
            }
            if (!z.polygon) return null;
            const s = z.polygon.map(toScreen);
            const cx = s.reduce((a, p) => a + p.x, 0) / s.length;
            const cy = s.reduce((a, p) => a + p.y, 0) / s.length;
            return [
              <Polygon
                key={z.id}
                points={line(z.polygon)}
                fill={col}
                fillOpacity={0.16}
                stroke={col}
                strokeWidth={2}
              />,
              <SvgText
                key={`${z.id}-l`}
                x={cx}
                y={cy + 4}
                fontSize={11}
                fontWeight="700"
                textAnchor="middle"
                fill={toneText(z.tone ?? 'primary', kit)}
              >
                {z.label}
              </SvgText>,
            ];
          })}
          {routes.map((r) => [
            r.dashed ? null : (
              <Polyline
                key={`${r.id}-halo`}
                points={line(r.points)}
                fill="none"
                stroke={WHITE}
                strokeOpacity={colorMode === 'dark' ? 0.15 : 0.9}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ),
            <Polyline
              key={r.id}
              points={line(r.points)}
              fill="none"
              stroke={toneColor(r.tone ?? 'primary', kit)}
              strokeWidth={4.5}
              strokeDasharray={r.dashed ? [10, 8] : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />,
          ])}
          {shapes.map((s, i) =>
            s.tool === 'polygon' ? (
              <Polygon
                key={i}
                points={line(s.points)}
                fill={draftColor}
                fillOpacity={0.18}
                stroke={draftColor}
                strokeWidth={2.5}
              />
            ) : s.tool === 'line' ? (
              <Polyline key={i} points={line(s.points)} fill="none" stroke={draftColor} strokeWidth={4} />
            ) : null,
          )}
          {tool === 'polygon' && draft.length >= 3 ? (
            <Polygon
              points={line(draft)}
              fill={draftColor}
              fillOpacity={0.1}
              stroke={draftColor}
              strokeWidth={2}
              strokeDasharray={[8, 6]}
            />
          ) : (tool === 'line' && draft.length >= 2) || draft.length === 2 ? (
            <Polyline points={line(draft)} fill="none" stroke={draftColor} strokeWidth={3} strokeDasharray={[8, 6]} />
          ) : null}
          {draft.map(toScreen).map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={5.5} fill={WHITE} stroke={draftColor} strokeWidth={3} />
          ))}
        </Svg>
      ) : null}

      {w > 0
        ? shapes
            .filter((s) => s.tool === 'marker')
            .map((s, i) => {
              const p = toScreen(s.points[0]!);
              return (
                <View key={`pin${i}`} pointerEvents="none" style={[styles.abs, { left: p.x - 17, top: p.y - 30 }]}>
                  <Icon source="mi:place" size={34} color={draftColor} />
                </View>
              );
            })
        : null}
      {w > 0
        ? routes
            .filter((r) => r.endpoints && r.points.length > 1)
            .flatMap((r) =>
              (
                [
                  [r.points[0]!, kit.success, 'mi:play-arrow', 'Départ'],
                  [r.points[r.points.length - 1]!, kit.error, 'mi:flag', 'Arrivée'],
                ] as const
              ).map(([pt, col, icon, label]) => {
                const p = toScreen(pt);
                return (
                  <View
                    key={`${r.id}-${label}`}
                    accessibilityLabel={label}
                    style={[styles.abs, styles.endpoint, { left: p.x - 13, top: p.y - 13, backgroundColor: col }]}
                  >
                    <Icon source={icon} size={14} color={WHITE} />
                  </View>
                );
              }),
            )
        : null}
      {w > 0
        ? clusterMarkers(markers, view.zoom, cluster).map(({ point, group }) => {
            const p = toScreen(point);
            if (!visible(p.x, p.y)) return null;
            const first = group[0]!;
            if (group.length === 1)
              return (
                <TouchableRipple
                  key={first.id}
                  borderless
                  onPress={() => (toolActive ? undefined : setPopup(first))}
                  accessibilityRole="button"
                  accessibilityLabel={first.title ?? first.tooltip ?? first.id}
                  style={[styles.abs, styles.markerBox, { left: p.x - 22, top: p.y - 22 }]}
                >
                  <FlatMarker data={first} selected={popup?.id === first.id} />
                </TouchableRipple>
              );
            return (
              <TouchableRipple
                key={`c${first.id}`}
                borderless
                onPress={() => setView({ center: point, zoom: Math.min(view.zoom + 2, 16) })}
                accessibilityRole="button"
                accessibilityLabel={`${group.length} balises, zoomer`}
                style={[styles.abs, styles.clusterBox, { left: p.x - 32, top: p.y - 32 }]}
              >
                <ClusterBubble group={group} />
              </TouchableRipple>
            );
          })
        : null}

      <View style={[styles.attribution, { backgroundColor: withAlpha(kit.card, 0.8) }]} pointerEvents="none">
        <Text style={[font('400', 11), { color: kit.textSecondary }]}>{attributionOf(bm)}</Text>
      </View>

      <View style={styles.controls}>
        {showZoom ? (
          <ControlGroup>
            <CtlBtn icon="mi:add" label="Zoom avant" onPress={() => zoomBy(1)} />
            <CtlBtn icon="mi:remove" label="Zoom arrière" onPress={() => zoomBy(-1)} />
          </ControlGroup>
        ) : null}
        <ControlGroup>
          <CtlBtn icon="mi:center-focus-strong" label="Recentrer" onPress={() => setView(fitView(w, h))} />
        </ControlGroup>
        {showBasemapSwitcher ? (
          <ControlGroup>
            <Menu
              visible={menu}
              onDismiss={() => setMenu(false)}
              anchor={<CtlBtn icon="mi:layers" label="Fond de carte" onPress={() => setMenu(true)} />}
            >
              {BASEMAP_IDS.map((b) => (
                <Menu.Item
                  key={b}
                  title={BASEMAPS[b].label}
                  leadingIcon={BASEMAPS[b].icon}
                  trailingIcon={b === bm ? 'mi:check' : undefined}
                  onPress={() => {
                    setChosen(b);
                    setMenu(false);
                  }}
                />
              ))}
            </Menu>
          </ControlGroup>
        ) : null}
      </View>

      {drawTools.length ? (
        <View style={styles.drawTools}>
          <ControlGroup>
            {drawTools.map((t) => (
              <CtlBtn
                key={t}
                icon={DRAW_TOOLS[t].icon}
                label={DRAW_TOOLS[t].label}
                active={tool === t}
                onPress={() => {
                  setDraft([]);
                  setTool(tool === t ? null : t);
                }}
              />
            ))}
            <CtlBtn
              icon="mi:delete-sweep"
              label="Tout effacer"
              onPress={() => {
                setDraft([]);
                setAllShapes([]);
              }}
            />
          </ControlGroup>
        </View>
      ) : null}

      {tool ? (
        <View style={[styles.hint, elevation(3, colorMode), { backgroundColor: kit.card }]}>
          <Icon source="mi:touch-app" size={18} color={kit.primary} />
          <Text style={[font('400', 12), styles.fill, { color: kit.textPrimary }]}>
            {tool === 'marker'
              ? 'Touchez la carte pour placer un point'
              : `Touchez la carte pour ajouter des sommets (${draft.length})`}
          </Text>
          {tool === 'marker' ? (
            <TouchableRipple onPress={() => setTool(null)} accessibilityRole="button" style={styles.hintBtn}>
              <Text style={[font('600', 14), { color: kit.primary }]}>OK</Text>
            </TouchableRipple>
          ) : (
            <>
              <TouchableRipple
                borderless
                disabled={!draft.length}
                onPress={() => setDraft((d) => d.slice(0, -1))}
                accessibilityRole="button"
                accessibilityLabel="Annuler le dernier"
                style={styles.undo}
              >
                <Icon source="mi:undo" size={18} color={draft.length ? kit.textPrimary : kit.disabledContent} />
              </TouchableRipple>
              <TouchableRipple
                onPress={finishDraft}
                accessibilityRole="button"
                style={[styles.finish, { backgroundColor: kit.primary }]}
              >
                <Text style={[font('600', 14), { color: kit.onPrimary }]}>Terminer</Text>
              </TouchableRipple>
            </>
          )}
        </View>
      ) : null}

      {legend.length ? (
        <View style={[styles.legend, { backgroundColor: withAlpha(kit.card, 0.94), borderColor: kit.border }]}>
          {legend.map(([l, t]) => (
            <View key={l} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: toneColor(t, kit) }]} />
              <Text style={[font('400', 11.5), { color: kit.textPrimary }]}>{l}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {popup ? (
        <View style={[styles.popup, elevation(4, colorMode), { backgroundColor: kit.card }]}>
          <View style={[styles.popupDisc, { backgroundColor: toneLight(popup.tone ?? 'primary', kit) }]}>
            <Icon source={popup.icon ?? 'mi:place'} size={18} color={toneColor(popup.tone ?? 'primary', kit)} />
          </View>
          <View style={styles.fill}>
            <Text style={[font('700', 13), { color: kit.textPrimary }]}>{popup.title ?? popup.id}</Text>
            {popup.lines?.map((l) => (
              <Text key={l} style={[font('400', 12), { color: kit.textSecondary }]}>
                {l}
              </Text>
            ))}
          </View>
          <TouchableRipple
            borderless
            onPress={() => setPopup(null)}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            style={styles.popupClose}
          >
            <Icon source="mi:close" size={18} color={kit.textSecondary} />
          </TouchableRipple>
        </View>
      ) : null}
    </View>
  );
}

/** Marqueur « flat » : disque teinté à liseré blanc, icône blanche, halo pulsé, flèche de cap. */
export function FlatMarker({ data, selected = false }: { data: MapMarkerData; selected?: boolean }) {
  const { kit } = useKitTheme();
  const col = toneColor(data.tone ?? 'primary', kit);
  const size = selected ? 34 : 28;
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!data.pulse) return;
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [data.pulse, pulse]);
  return (
    <View style={styles.markerBox} pointerEvents="none">
      {data.pulse ? (
        <Animated.View
          style={[
            styles.halo,
            {
              backgroundColor: col,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 44 / 28] }) }],
            },
          ]}
        />
      ) : null}
      {data.heading !== undefined ? (
        <View style={[styles.heading, { transform: [{ rotate: `${data.heading}deg` }] }]}>
          <Icon source="mi:navigation" size={12} color={col} />
        </View>
      ) : null}
      <View
        style={[
          styles.disc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: col,
            boxShadow: `0 2px 6px ${withAlpha(BLACK, 0.25)}`,
          },
        ]}
      >
        <Icon source={data.icon ?? 'mi:place'} size={size * 0.52} color={WHITE} />
      </View>
    </View>
  );
}

/** Bulle de regroupement : taille selon l'effectif, couleur de l'état le plus critique. */
function ClusterBubble({ group }: { group: MapMarkerData[] }) {
  const { kit } = useKitTheme();
  const col = group.some((m) => m.tone === 'error')
    ? kit.error
    : group.some((m) => m.tone === 'warning')
      ? kit.warning
      : kit.primary;
  const size = group.length > 100 ? 52 : group.length > 20 ? 44 : 36;
  return (
    <View
      style={[
        styles.ring,
        { width: size + 12, height: size + 12, borderRadius: size / 2 + 6, backgroundColor: withAlpha(col, 0.3) },
      ]}
    >
      <View
        style={[
          styles.disc,
          { width: size, height: size, borderRadius: size / 2, borderWidth: 0, backgroundColor: withAlpha(col, 0.9) },
        ]}
      >
        <Text style={[font('800', 13), { color: WHITE }]}>{group.length}</Text>
      </View>
    </View>
  );
}

function ControlGroup({ children }: { children: ReactNode }) {
  const { kit, colorMode } = useKitTheme();
  return (
    <View style={[styles.group, elevation(2, colorMode), { backgroundColor: kit.card }]}>
      <View style={[styles.groupInner, { gap: StyleSheet.hairlineWidth, backgroundColor: kit.border }]}>
        {children}
      </View>
    </View>
  );
}

function CtlBtn({
  icon,
  label,
  onPress,
  active = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const { kit } = useKitTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={5}
      style={[styles.ctl, { backgroundColor: active ? kit.primaryLight : kit.card }]}
    >
      <Icon source={icon} size={20} color={active ? kit.primary : kit.textPrimary} />
    </TouchableRipple>
  );
}

/** Aperçu de carte en chargement, vide ou en erreur, sur fond quadrillé. */
export function MapStatePlaceholder({ kind, height = 200 }: { kind: 'loading' | 'empty' | 'error'; height?: number }) {
  const { kit } = useKitTheme();
  const [w, setW] = useState(0);
  const [icon, title, sub, tone]: [string, string, string, KitTone] =
    kind === 'loading'
      ? ['mi:map', 'Chargement de la carte…', 'Récupération des positions', 'primary']
      : kind === 'error'
        ? ['mi:wifi-off', 'Carte indisponible', 'Les tuiles n’ont pas pu être chargées.', 'error']
        : ['mi:location-off', 'Aucune position', 'Aucun véhicule ne correspond aux filtres.', 'neutral'];
  const grid = (len: number) => Array.from({ length: Math.ceil(len / 28) }, (_, i) => i * 28);
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessibilityRole={kind === 'loading' ? 'progressbar' : undefined}
      style={[styles.placeholder, { height, backgroundColor: kit.hover, borderColor: kit.border }]}
    >
      {w > 0 ? (
        <Svg width={w} height={height} style={styles.abs}>
          {grid(w).map((x) => (
            <Line key={`x${x}`} x1={x} x2={x} y1={0} y2={height} stroke={kit.border} strokeWidth={1} />
          ))}
          {grid(height).map((y) => (
            <Line key={`y${y}`} x1={0} x2={w} y1={y} y2={y} stroke={kit.border} strokeWidth={1} />
          ))}
        </Svg>
      ) : null}
      {kind === 'loading' ? (
        <ActivityIndicator size={32} color={kit.primary} />
      ) : (
        <View style={[styles.stateDisc, { backgroundColor: toneLight(tone, kit) }]}>
          <Icon source={icon} size={24} color={toneColor(tone, kit)} />
        </View>
      )}
      <Text style={[font('700', 14), styles.mt10, { color: kit.textPrimary }]}>{title}</Text>
      <Text style={[font('400', 12), { color: kit.textSecondary }]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  abs: { position: 'absolute', left: 0, top: 0 },
  map: { overflow: 'hidden' },
  markerBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  clusterBox: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 28, height: 28, borderRadius: 14 },
  heading: { position: 'absolute', width: 44, height: 44, alignItems: 'center' },
  disc: { alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: WHITE },
  ring: { alignItems: 'center', justifyContent: 'center' },
  endpoint: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attribution: { position: 'absolute', right: 0, bottom: 0, paddingHorizontal: 6, paddingVertical: 2 },
  controls: { position: 'absolute', right: 10, top: 10, gap: 8 },
  drawTools: { position: 'absolute', left: 10, top: 10 },
  group: { borderRadius: radii.md },
  groupInner: { borderRadius: radii.md, overflow: 'hidden' },
  ctl: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hint: {
    position: 'absolute',
    left: 10,
    right: 60,
    bottom: 28,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    paddingLeft: space.s3,
    paddingRight: space.s2,
    paddingVertical: space.s2,
  },
  hintBtn: { paddingHorizontal: space.s3, paddingVertical: 6, borderRadius: radii.full },
  undo: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  finish: { minHeight: 32, paddingHorizontal: space.s3, borderRadius: radii.full, justifyContent: 'center' },
  legend: {
    position: 'absolute',
    left: 10,
    bottom: 24,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: space.s3,
    paddingVertical: space.s2,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  popup: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 24,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: space.s3,
    paddingRight: space.s1,
    paddingVertical: space.s3,
  },
  popupDisc: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  popupClose: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  placeholder: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateDisc: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  mt10: { marginTop: 10 },
});
