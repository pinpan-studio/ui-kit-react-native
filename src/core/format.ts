/** Formats d'affichage du kit (`Fmt` Flutter, `lib/core/format.dart`). */

/** Initiales (2 au plus) d'un nom : « Mariam Koné » → « MK ». */
export function initials(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}
