import type { CSSProperties, PointerEvent as ReactPointerEvent, RefCallback } from 'react';

/** A single tilt update, reported through {@link TiltOptions.onTilt}. */
export interface TiltState {
  /** Rotation around the X axis, in degrees. */
  rotateX: number;
  /** Rotation around the Y axis, in degrees. */
  rotateY: number;
  /** Which input produced this update. */
  source: 'pointer' | 'gyro';
}

export interface TiltOptions {
  /** Maximum tilt angle in degrees. @default 14 */
  maxTilt?: number;
  /** Scale applied while the pointer is over the card. @default 1.04 */
  scale?: number;
  /** CSS perspective distance in px — lower is more dramatic. @default 1000 */
  perspective?: number;
  /** Transition duration in ms for the transform settling. @default 400 */
  speed?: number;
  /** Tilt away from the pointer instead of toward it. @default false */
  reverse?: boolean;
  /** Peak opacity of the glare highlight, 0–1. @default 0.25 */
  glareMaxOpacity?: number;
  /** React to device orientation (mobile gyroscope). @default true */
  gyro?: boolean;
  /** Turn the whole effect off. @default false */
  disabled?: boolean;
  /** Keep the card still when the user prefers reduced motion. @default true */
  respectReducedMotion?: boolean;
  /** Called with the current tilt on every update. */
  onTilt?: (state: TiltState) => void;
}

/** Props to spread onto the element you want to tilt. */
export interface TiltProps {
  ref: RefCallback<HTMLElement>;
  style: CSSProperties;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => void;
}

export interface UseTiltResult {
  /** Spread onto the element you want to tilt: `<div {...tiltProps}>`. */
  tiltProps: TiltProps;
  /** False when `disabled` or when reduced motion wins. */
  active: boolean;
}
