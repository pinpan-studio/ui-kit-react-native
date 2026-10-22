import { createContext, useContext, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type AccessibilityActionInfo,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { hapticToggle } from '../../mobile/haptics';
import { elevation, useKitTheme } from '../../theme';

/**
 * Glisser-déposer à l'appui long (`LongPressDraggable` / `DragTarget` Flutter) : une `DragArea` affiche le
 * fantôme sous le doigt et confie la donnée à la cible (`DropTarget`) sous le point de relâche.
 * Le geste reste doublé d'actions de lecteur d'écran sur chaque élément.
 */

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ViewRef = ComponentRef<typeof View>;

interface Target {
  ref: ViewRef | null;
  rect: Rect | null;
  accepts: (data: unknown) => boolean;
  onDrop: (data: unknown) => void;
}

interface DragApi {
  start: (data: unknown, ghost: ReactNode, x: number, y: number, width: number) => void;
  move: (x: number, y: number) => void;
  end: (x: number, y: number) => void;
  register: (id: string, t: Target) => void;
  unregister: (id: string) => void;
  hover: string | null;
  dragging: unknown;
}

const DragContext = createContext<DragApi | null>(null);

const inside = (r: Rect | null, x: number, y: number) =>
  !!r && x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;

/** Zone de glisser-déposer : affiche le fantôme et résout la cible au relâchement. */
export function DragArea({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colorMode } = useKitTheme();
  const area = useRef<ViewRef>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const targets = useRef(new Map<string, Target>());
  const [ghost, setGhost] = useState<{ node: ReactNode; x: number; y: number; width: number } | null>(null);
  const [dragging, setDragging] = useState<unknown>(null);
  const [hover, setHover] = useState<string | null>(null);

  const hit = (x: number, y: number) => {
    for (const [id, t] of targets.current) if (inside(t.rect, x, y) && t.accepts(dragging)) return id;
    return null;
  };

  const api: DragApi = {
    hover,
    dragging,
    register: (id, t) => targets.current.set(id, t),
    unregister: (id) => targets.current.delete(id),
    start: (data, node, x, y, width) => {
      hapticToggle();
      setDragging(data);
      area.current?.measureInWindow((ax, ay) => setOrigin({ x: ax, y: ay }));
      for (const t of targets.current.values())
        t.ref?.measureInWindow((tx, ty, tw, th) => (t.rect = { x: tx, y: ty, width: tw, height: th }));
      setGhost({ node, x, y, width });
    },
    move: (x, y) => {
      setGhost((g) => (g ? { ...g, x, y } : g));
      setHover(hit(x, y));
    },
    end: (x, y) => {
      const id = hit(x, y);
      const t = id ? targets.current.get(id) : undefined;
      if (t) t.onDrop(dragging);
      setGhost(null);
      setDragging(null);
      setHover(null);
    },
  };

  return (
    <DragContext.Provider value={api}>
      <View ref={area} style={style}>
        {children}
        {ghost ? (
          <View
            pointerEvents="none"
            style={[
              styles.ghost,
              elevation(4, colorMode),
              {
                width: ghost.width,
                left: ghost.x - origin.x - ghost.width / 2,
                top: ghost.y - origin.y - 24,
              },
            ]}
          >
            {ghost.node}
          </View>
        ) : null}
      </View>
    </DragContext.Provider>
  );
}

/**
 * Élément déplaçable : appui long (400 ms) puis glisser ; un toucher bref déclenche `onPress`.
 * Tant que le glisser n'a pas commencé, un défilement du parent reprend la main.
 */
export function Draggable({
  data,
  children,
  ghost,
  width = 220,
  onPress,
  accessibilityActions,
  onAccessibilityAction,
  accessibilityLabel,
  style,
}: {
  data: unknown;
  children: ReactNode;
  /** Rendu du fantôme (par défaut, l'élément lui-même). */
  ghost?: ReactNode;
  width?: number;
  onPress?: () => void;
  accessibilityActions?: AccessibilityActionInfo[];
  onAccessibilityAction?: (name: string) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const drag = useContext(DragContext);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const active = useRef(false);
  const startPt = useRef({ x: 0, y: 0 });
  const isDragged = drag?.dragging === data;
  const page = (e: GestureResponderEvent) => ({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Appui long puis glisser pour déplacer"
      accessibilityActions={[...(onPress ? [{ name: 'activate' }] : []), ...(accessibilityActions ?? [])]}
      onAccessibilityAction={(e) =>
        e.nativeEvent.actionName === 'activate' ? onPress?.() : onAccessibilityAction?.(e.nativeEvent.actionName)
      }
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => !active.current}
      onResponderGrant={(e) => {
        const p = page(e);
        startPt.current = p;
        active.current = false;
        timer.current = setTimeout(() => {
          active.current = true;
          drag?.start(data, ghost ?? children, startPt.current.x, startPt.current.y, width);
        }, 400);
      }}
      onResponderMove={(e) => {
        const p = page(e);
        if (active.current) drag?.move(p.x, p.y);
        else if (Math.hypot(p.x - startPt.current.x, p.y - startPt.current.y) > 8) clearTimeout(timer.current);
      }}
      onResponderRelease={(e) => {
        clearTimeout(timer.current);
        const p = page(e);
        if (active.current) drag?.end(p.x, p.y);
        else if (Math.hypot(p.x - startPt.current.x, p.y - startPt.current.y) <= 8) onPress?.();
        active.current = false;
      }}
      onResponderTerminate={() => {
        clearTimeout(timer.current);
        if (active.current) drag?.end(-1, -1);
        active.current = false;
      }}
      style={[style, isDragged && styles.dragged]}
    >
      {children}
    </View>
  );
}

/** Cible de dépôt : `children` reçoit `hovering` pour mettre en évidence la zone survolée. */
export function DropTarget({
  id,
  accepts = () => true,
  onDrop,
  children,
  style,
}: {
  id: string;
  accepts?: (data: unknown) => boolean;
  onDrop: (data: unknown) => void;
  children: (hovering: boolean) => ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const drag = useContext(DragContext);
  const ref = useRef<ViewRef>(null);
  return (
    <View
      ref={(v) => {
        ref.current = v;
        if (v) drag?.register(id, { ref: v, rect: null, accepts, onDrop });
        else drag?.unregister(id);
      }}
      style={style}
    >
      {children(drag?.hover === id)}
    </View>
  );
}

const styles = StyleSheet.create({
  ghost: { position: 'absolute', transform: [{ rotate: '1.7deg' }], zIndex: 100 },
  dragged: { opacity: 0.3 },
});
