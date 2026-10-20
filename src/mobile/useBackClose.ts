import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Bouton retour Android : tant que `open` est vrai, il ferme d'abord la feuille / le dialogue
 * au lieu de quitter l'écran. Les feuilles empilées s'enregistrent après : la plus récente gagne.
 */
export function useBackClose(open: boolean, close: () => void): void {
  useEffect(() => {
    if (!open) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [open, close]);
}
