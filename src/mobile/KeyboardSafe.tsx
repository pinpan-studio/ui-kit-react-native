import type { ReactNode, Ref } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ScrollViewInstance,
  type ScrollViewProps,
} from 'react-native';

interface Props extends ScrollViewProps {
  children: ReactNode;
  /** Barre d'actions collée en bas : elle remonte avec le clavier. */
  footer?: ReactNode;
  scrollRef?: Ref<ScrollViewInstance>;
}

/**
 * Le champ qui a le focus reste visible au-dessus du clavier, et le `footer` remonte avec lui.
 * Fonctionne en edge-to-edge (Android 15+), où `adjustResize` ne suffit plus.
 */
export function KeyboardSafe({ children, footer, contentContainerStyle, scrollRef, ...rest }: Props) {
  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={contentContainerStyle}
        {...rest}
      >
        {children}
      </ScrollView>
      {footer}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
