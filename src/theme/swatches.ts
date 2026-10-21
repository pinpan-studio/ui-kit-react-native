/**
 * Couleurs fixes des composants de saisie, indépendantes de la palette (`kColorPresets`,
 * encre de signature et surligneur Flutter).
 */

/** Pastilles du sélecteur de couleur. */
export const COLOR_PRESETS = [
  '#4f6bed',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#22c55e',
  '#84cc16',
  '#eab308',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#a855f7',
  '#8b5cf6',
  '#64748b',
  '#334155',
  '#0f172a',
] as const;

/** Encre bleue de la signature manuscrite. */
export const INK_BLUE = '#1d4ed8';

/** Surligneur jaune de l'éditeur de texte riche (40 %). */
export const HIGHLIGHT = '#fde04766';

/** Texte foncé lisible sur une couleur claire (`contrastOn` Flutter). */
export const ON_LIGHT = '#0f172a';

/** Teinte pure (saturation et valeur à 100 %), pour les dégradés du sélecteur de couleur. */
export const HUE_STOPS = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'] as const;

/** Blanc et noir des dégradés saturation / valeur. */
export const WHITE = '#ffffff';
export const BLACK = '#000000';

/** Scènes illustrées de démonstration (`DemoArt`) : ciel, collines, soleil / véhicule. */
export const ART_PALETTES = [
  ['#0ea5e9', '#006a6a', '#fde68a'],
  ['#f97316', '#7c2d12', '#ffedd5'],
  ['#8b5cf6', '#1e1b4b', '#f5d0fe'],
  ['#22c55e', '#14532d', '#fef9c3'],
  ['#ef4444', '#450a0a', '#fecaca'],
  ['#06b6d4', '#083344', '#cffafe'],
] as const;

/** Bitume de la route des scènes `DemoArt`. */
export const ART_ROAD = '#1f2937';

/** Page de document « papier » (aperçu PDF) : fond, encre, texte atténué, en-tête de tableau, lignes. */
export const PAPER = {
  bg: '#ffffff',
  ink: '#1f2937',
  muted: '#6b7280',
  brand: '#006a6a',
  header: '#f1f5f9',
  line: '#e5e7eb',
} as const;

/** Fond de la visionneuse PDF, autour des pages. */
export const PDF_BACKDROP = { light: '#525659', dark: '#0b0f12' } as const;

/** Bouton de lecture de la façade YouTube. */
export const YOUTUBE_RED = '#ff0000';

/** Couleurs de marque des moyens de paiement (page publique de proforma). */
export const PAYMENT_BRANDS: readonly [string, string][] = [
  ['Orange Money', '#ff7900'],
  ['MTN MoMo', '#ffcc00'],
  ['Wave', '#1dc4ff'],
  ['Carte bancaire', '#64748b'],
];
