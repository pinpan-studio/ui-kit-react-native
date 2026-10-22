import type { KitTheme } from '../../theme/buildTheme';
import { withAlpha } from '../../theme/colors';

/** Variantes de KitButton (kit_buttons.dart) — correspondance Angular Material dans le commentaire Flutter. */
export type KitButtonVariant =
  'primary' | 'raised' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dangerOutline' | 'success' | 'tertiary';

export const BUTTON_VARIANTS: readonly KitButtonVariant[] = [
  'primary',
  'raised',
  'secondary',
  'outline',
  'ghost',
  'danger',
  'dangerOutline',
  'success',
  'tertiary',
];

export interface ButtonColors {
  bg: string | null;
  fg: string;
  border: string | null;
  elevation: number;
}

/**
 * Couleurs d'un KitButton. Danger suit le rôle M3 error / onError de la palette (aussi en sombre) ;
 * Success : #22c55e + texte #052e16 (6,54:1). Désactivé M3 : contenu on-surface 38 %, conteneur et
 * bordure on-surface 12 %.
 */
export function buttonColors(variant: KitButtonVariant, theme: KitTheme, disabled = false): ButtonColors {
  const c = theme.colors;
  const base: ButtonColors = (() => {
    switch (variant) {
      case 'primary':
        return { bg: c.primary, fg: c.onPrimary, border: null, elevation: 0 };
      case 'raised':
        return { bg: theme.roles.surfaceContainerLow, fg: c.primary, border: null, elevation: 1 };
      case 'secondary':
        return { bg: null, fg: c.primary, border: c.outlineVariant, elevation: 0 };
      case 'outline':
        return { bg: null, fg: c.onSurface, border: c.outlineVariant, elevation: 0 };
      case 'ghost':
        return { bg: null, fg: c.primary, border: null, elevation: 0 };
      case 'danger':
        return { bg: c.error, fg: c.onError, border: null, elevation: 0 };
      case 'dangerOutline':
        return { bg: null, fg: c.error, border: withAlpha(c.error, 0.5), elevation: 0 };
      case 'success':
        return { bg: theme.kit.success, fg: theme.kit.onSuccess, border: null, elevation: 0 };
      case 'tertiary':
        return { bg: c.tertiary, fg: c.onTertiary, border: null, elevation: 0 };
    }
  })();
  if (!disabled) return base;
  return {
    bg: base.bg === null ? null : theme.kit.disabledContainer,
    fg: theme.kit.disabledContent,
    border: base.border === null ? null : theme.kit.disabledContainer,
    elevation: 0,
  };
}

export type KitTone = 'primary' | 'success' | 'warning' | 'error';

/**
 * Texte / icône de ton posé sur un fond « -light » (lot contraste, liste-kits.md) :
 * clair → nuance 800 (#166534, #854d0e), sombre → 300 ; error garde le rôle M3
 * (clair : error, sombre : on-error-container #ffdad6).
 */
export function toneText(tone: KitTone, theme: KitTheme): string {
  const dark = theme.dark;
  switch (tone) {
    case 'primary':
      return theme.colors.primary;
    case 'success':
      return dark ? '#86efac' : '#166534';
    case 'warning':
      return dark ? '#fde047' : '#854d0e';
    case 'error':
      return dark ? theme.colors.onErrorContainer : theme.colors.error;
  }
}

/** Couleur pleine du ton (`toneVar`) — couleurs globales du kit, inchangées. */
export function toneColor(tone: KitTone, theme: KitTheme): string {
  switch (tone) {
    case 'primary':
      return theme.colors.primary;
    case 'success':
      return theme.kit.success;
    case 'warning':
      return theme.kit.warning;
    case 'error':
      return theme.colors.error;
  }
}

/** Fond léger du ton (`--*-color-light`). */
export function toneLight(tone: KitTone, theme: KitTheme): string {
  switch (tone) {
    case 'primary':
      return theme.kit.primaryLight;
    case 'success':
      return theme.kit.successLight;
    case 'warning':
      return theme.kit.warningLight;
    case 'error':
      return withAlpha(theme.colors.error, theme.dark ? 0.16 : 0.1);
  }
}
