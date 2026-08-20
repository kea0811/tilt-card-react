import type { CSSProperties, HTMLAttributes } from 'react';
import { useTilt } from './useTilt';
import type { TiltOptions } from './types';

export interface TiltCardProps extends HTMLAttributes<HTMLDivElement>, TiltOptions {
  /** Render the moving glare highlight layer. @default false */
  glare?: boolean;
}

const glareStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  borderRadius: 'inherit',
  background:
    'radial-gradient(circle at var(--tilt-gx, 50%) var(--tilt-gy, 50%), rgba(255, 255, 255, var(--tilt-go, 0)) 0%, rgba(255, 255, 255, 0) 65%)',
};

/**
 * A `<div>` wired up with {@link useTilt}. Children with a `translateZ`
 * transform (see `parallax()`) float above the surface; pass `glare` for a
 * light highlight that follows the pointer.
 */
export function TiltCard({
  maxTilt,
  scale,
  perspective,
  speed,
  reverse,
  glareMaxOpacity,
  gyro,
  disabled,
  respectReducedMotion,
  onTilt,
  glare = false,
  style,
  children,
  ...rest
}: TiltCardProps) {
  const { tiltProps } = useTilt({
    maxTilt,
    scale,
    perspective,
    speed,
    reverse,
    glareMaxOpacity,
    gyro,
    disabled,
    respectReducedMotion,
    onTilt,
  });

  return (
    <div
      {...rest}
      ref={tiltProps.ref}
      onPointerMove={tiltProps.onPointerMove}
      onPointerLeave={tiltProps.onPointerLeave}
      style={{ position: 'relative', ...tiltProps.style, ...style }}
    >
      {children}
      {glare ? <div aria-hidden="true" data-tilt-glare="" style={glareStyle} /> : null}
    </div>
  );
}
