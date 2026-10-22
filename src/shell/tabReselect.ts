import { usePathname } from 'expo-router';
import { useEffect, useRef, type RefObject } from 'react';

type Listener = (href: string) => void;
const listeners = new Set<Listener>();

/** L'onglet `href`, déjà actif et à sa racine, a été touché à nouveau (`KitTabReselect` Flutter). */
export function emitTabReselect(href: string): void {
  listeners.forEach((l) => l(href));
}

/**
 * Remonte en haut de la liste quand l'onglet de la page est touché à nouveau,
 * seulement si la page affichée est la racine de cet onglet.
 */
export function useScrollToTopOnReselect(
  scroll: RefObject<{ scrollTo: (o: { y: number; animated: boolean }) => void } | null>,
): void {
  const pathname = usePathname();
  const current = useRef(pathname);
  useEffect(() => {
    current.current = pathname;
  }, [pathname]);
  useEffect(() => {
    const onReselect: Listener = (href) => {
      if (href === current.current) scroll.current?.scrollTo({ y: 0, animated: true });
    };
    listeners.add(onReselect);
    return () => {
      listeners.delete(onReselect);
    };
  }, [scroll]);
}
