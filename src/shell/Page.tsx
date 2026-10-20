import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { KeyboardSafe } from '../mobile';
import { space } from '../theme/tokens';

/** Page défilante du catalogue : marges du kit, clavier géré, pas de hauteur fixe (texte à 200 %). */
export function Page({ children, testID }: { children: ReactNode; testID?: string }) {
  return (
    <KeyboardSafe testID={testID} contentContainerStyle={styles.content}>
      {children}
    </KeyboardSafe>
  );
}

const styles = StyleSheet.create({ content: { padding: space.s4, gap: space.s4, paddingBottom: space.s8 } });
