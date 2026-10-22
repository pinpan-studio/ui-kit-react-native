/**
 * Défilement vers une section (`initialSection` du DocPage Flutter, `Scrollable.ensureVisible`).
 * Les sections publient leur position au fil des `onLayout` ; dès que la cible est connue,
 * on défile une seule fois, sans animation, comme le post-frame callback de Flutter.
 */
export function createSectionScroller(target: string | undefined, scrollTo: (y: number) => void, offset = 8) {
  const positions = new Map<string, number>();
  let done = !target;
  return {
    positions,
    onLayout(id: string, y: number) {
      positions.set(id, y);
      if (!done && id === target) {
        done = true;
        scrollTo(Math.max(0, y - offset));
      }
    },
    goTo(id: string) {
      const y = positions.get(id);
      if (y !== undefined) scrollTo(Math.max(0, y - offset));
      return y !== undefined;
    },
  };
}
