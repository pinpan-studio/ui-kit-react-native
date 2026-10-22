import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { GestureStateManager, usePanGesture, type PanGesture } from 'react-native-gesture-handler';

import { motion } from '../theme/tokens';
import { useReducedMotion } from './useReducedMotion';

/** Part de la course au-delà de laquelle un glissé relâché ferme la surcouche. */
const CLOSE_RATIO = 0.3;
/** Vitesse (pt/s) d'un geste lancé qui ferme, quelle que soit la distance. */
const FLING_VELOCITY = 800;

/**
 * Entrée, sortie et geste de fermeture d'une surcouche glissante (feuille basse, tiroir) :
 * l'équivalent de `showModalBottomSheet` / `Drawer` Flutter.
 *
 * - `offset` vaut 0 ouvert et `distance` (vers le bas) ou `-distance` (vers la gauche) fermé ;
 * - la surcouche reste montée (`mounted`) le temps de l'animation de sortie ;
 * - `onDismiss` n'est appelé qu'une fois, après la sortie, quand la fermeture vient de l'intérieur
 *   (fond, geste, bouton) ; si le parent passe `visible` à `false`, seule l'animation est jouée ;
 * - « Réduire les animations » : apparition et disparition immédiates, le geste reste actif.
 *
 * Le geste passe par react-native-gesture-handler (`gesture`, à poser sur un `GestureDetector`
 * dans une `GestureHandlerRootView` propre à la `Modal`) : sur iOS, un glissé vertical
 * suivi par le système de répondeurs JS est annulé par les reconnaisseurs natifs.
 */
export function useSheetGesture({
  visible,
  onDismiss,
  distance,
  axis = 'y',
  grabZone,
}: {
  visible: boolean;
  onDismiss: () => void;
  /** Course de l'animation : hauteur de la feuille ou largeur du tiroir. */
  distance: number;
  /** `y` : la feuille sort vers le bas · `x` : le tiroir sort vers la gauche. */
  axis?: 'x' | 'y';
  /**
   * Zone (ordonnée du toucher initial, depuis le haut de la surcouche) où le geste peut démarrer :
   * poignée et en-tête d'une feuille, pour ne jamais concurrencer le défilement du contenu.
   * Partout si absente.
   */
  grabZone?: (y: number) => boolean;
}): {
  mounted: boolean;
  offset: Animated.Value;
  /** Opacité du fond : 1 ouvert, 0 fermé. */
  scrim: Animated.AnimatedInterpolation<number>;
  gesture: PanGesture;
  close: () => void;
} {
  const reduced = useReducedMotion();
  const sign = axis === 'y' ? 1 : -1;
  const closed = sign * Math.max(distance, 1);
  const [mounted, setMounted] = useState(visible);
  const [offset] = useState(() => new Animated.Value(closed));
  const closing = useRef(false);
  const latest = useRef({ onDismiss, closed, reduced, grabZone });
  useEffect(() => {
    latest.current = { onDismiss, closed, reduced, grabZone };
  });
  // Ouverture : montée immédiate pendant le rendu (la sortie, elle, attend la fin de l'animation).
  if (visible && !mounted) setMounted(true);

  const animateOut = useCallback(
    (after?: () => void) => {
      const done = () => {
        setMounted(false);
        after?.();
      };
      if (latest.current.reduced) {
        offset.setValue(latest.current.closed);
        done();
        return;
      }
      Animated.timing(offset, {
        toValue: latest.current.closed,
        duration: motion.base,
        easing: motion.easing.accelerate,
        useNativeDriver: true,
      }).start(({ finished }) => finished && done());
    },
    [offset],
  );

  /** Fermeture demandée depuis la surcouche : animation, puis `onDismiss` une seule fois. */
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    animateOut(() => latest.current.onDismiss());
  }, [animateOut]);

  useEffect(() => {
    if (visible) {
      closing.current = false;
      if (latest.current.reduced) {
        offset.setValue(0);
        return;
      }
      offset.setValue(latest.current.closed);
      Animated.timing(offset, {
        toValue: 0,
        duration: motion.medium,
        easing: motion.easing.decelerate,
        useNativeDriver: true,
      }).start();
    } else if (!closing.current) {
      // Fermeture pilotée par le parent (bouton « Valider », navigation…) : sortie animée seulement.
      closing.current = true;
      animateOut();
    }
  }, [visible, offset, animateOut]);

  const settle = useCallback(() => {
    Animated.spring(offset, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 18 }).start();
  }, [offset]);

  const gesture = usePanGesture({
    runOnJS: true,
    // Démarre seulement dans le sens de la fermeture ; échoue si le doigt part sur l'autre axe.
    activeOffsetY: axis === 'y' ? 8 : undefined,
    failOffsetX: axis === 'y' ? [-16, 16] : undefined,
    activeOffsetX: axis === 'x' ? -8 : undefined,
    failOffsetY: axis === 'x' ? [-16, 16] : undefined,
    onTouchesDown: (e) => {
      const touch = e.allTouches[0];
      const zone = latest.current.grabZone;
      if (touch && zone && !zone(touch.y)) GestureStateManager.fail(e.handlerTag);
    },
    onUpdate: (e) => {
      const main = axis === 'y' ? e.translationY : e.translationX;
      // Seulement dans le sens de la fermeture ; un léger frein dans l'autre sens.
      offset.setValue(sign * main > 0 ? main : main / 6);
    },
    onDeactivate: (e) => {
      const main = sign * (axis === 'y' ? e.translationY : e.translationX);
      const speed = sign * (axis === 'y' ? e.velocityY : e.velocityX);
      if (main > Math.abs(latest.current.closed) * CLOSE_RATIO || speed > FLING_VELOCITY) {
        closing.current = true;
        animateOut(() => latest.current.onDismiss());
      } else settle();
    },
  });

  const scrim = offset.interpolate({
    inputRange: sign > 0 ? [0, Math.abs(closed)] : [closed, 0],
    outputRange: sign > 0 ? [1, 0] : [0, 1],
    extrapolate: 'clamp',
  });

  return { mounted, offset, scrim, gesture, close };
}
