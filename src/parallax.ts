import type { CSSProperties } from 'react';

/**
 * Style helper for layers inside a tilted card. Positive `depth` lifts the
 * layer toward the viewer, so it drifts against the card as it tilts.
 *
 * ```tsx
 * <TiltCard>
 *   <h3 style={parallax(40)}>Floats 40px above the card</h3>
 * </TiltCard>
 * ```
 */
export function parallax(depth: number): CSSProperties {
  return {
    transform: `translateZ(${depth}px)`,
    transformStyle: 'preserve-3d',
  };
}
