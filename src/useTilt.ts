import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { TiltOptions, TiltState, UseTiltResult } from './types';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * The CSS custom properties the hook writes on the tilted element.
 * Child layers (glare, badges, custom effects) can read them with `var()`.
 */
export const TILT_CUSTOM_PROPS = [
  '--tilt-rx',
  '--tilt-ry',
  '--tilt-s',
  '--tilt-gx',
  '--tilt-gy',
  '--tilt-go',
] as const;

/** Degrees of physical device rotation that map to full tilt. */
const GYRO_RANGE = 32;

const clampUnit = (value: number): number => Math.min(1, Math.max(-1, value));

/**
 * Writes one tilt frame onto the element as CSS custom properties.
 * `nx`/`ny` are the normalized input position in [-1, 1].
 */
function writeTilt(
  el: HTMLElement,
  nx: number,
  ny: number,
  maxTilt: number,
  dir: number,
  scale: number,
  glareMaxOpacity: number,
): Pick<TiltState, 'rotateX' | 'rotateY'> {
  const rotateX = -ny * maxTilt * dir;
  const rotateY = nx * maxTilt * dir;
  el.style.setProperty('--tilt-rx', `${rotateX}deg`);
  el.style.setProperty('--tilt-ry', `${rotateY}deg`);
  el.style.setProperty('--tilt-s', String(scale));
  el.style.setProperty('--tilt-gx', `${50 + nx * 50}%`);
  el.style.setProperty('--tilt-gy', `${50 + ny * 50}%`);
  el.style.setProperty('--tilt-go', String(glareMaxOpacity));
  return { rotateX, rotateY };
}

/** Removes every tilt custom property; the CSS `var()` fallbacks take over. */
function clearTilt(el: HTMLElement): void {
  for (const prop of TILT_CUSTOM_PROPS) {
    el.style.removeProperty(prop);
  }
}

/**
 * Headless 3D tilt. Returns props to spread onto any element: pointer moves
 * tilt it toward the cursor on desktop, device orientation tilts it on
 * mobile. All motion is written as CSS custom properties, so child layers
 * can join the effect with plain CSS.
 */
export function useTilt(options?: TiltOptions): UseTiltResult {
  const {
    maxTilt = 14,
    scale = 1.04,
    perspective = 1000,
    speed = 400,
    reverse = false,
    glareMaxOpacity = 0.25,
    gyro = true,
    disabled = false,
    respectReducedMotion = true,
    onTilt,
  } = options ?? {};

  const prefersReduced = usePrefersReducedMotion();
  const active = !disabled && !(respectReducedMotion && prefersReduced);
  const dir = reverse ? -1 : 1;

  const [node, setNode] = useState<HTMLElement | null>(null);
  const ref = useCallback((el: HTMLElement | null) => {
    setNode(el);
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!active) {
        return;
      }
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }
      const nx = clampUnit(((event.clientX - rect.left) / rect.width) * 2 - 1);
      const ny = clampUnit(((event.clientY - rect.top) / rect.height) * 2 - 1);
      const rotation = writeTilt(el, nx, ny, maxTilt, dir, scale, glareMaxOpacity);
      onTilt?.({ ...rotation, source: 'pointer' });
    },
    [active, maxTilt, dir, scale, glareMaxOpacity, onTilt],
  );

  const onPointerLeave = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    clearTilt(event.currentTarget);
  }, []);

  // Gyroscope input. The whole listener lifecycle lives in this one effect
  // so StrictMode's simulated unmount/remount re-arms it correctly.
  useEffect(() => {
    if (!node || !gyro || !active) {
      return;
    }
    // The pitch the device rests at when the card first becomes visible is
    // treated as neutral, so the effect works flat on a table or held upright.
    let baseBeta: number | null = null;
    const onOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;
      if (beta === null || gamma === null) {
        return;
      }
      if (baseBeta === null) {
        baseBeta = beta;
      }
      const nx = clampUnit(gamma / GYRO_RANGE);
      const ny = clampUnit((beta - baseBeta) / GYRO_RANGE);
      const rotation = writeTilt(node, nx, ny, maxTilt, dir, scale, glareMaxOpacity);
      onTilt?.({ ...rotation, source: 'gyro' });
    };
    window.addEventListener('deviceorientation', onOrientation);
    return () => {
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [node, gyro, active, maxTilt, dir, scale, glareMaxOpacity, onTilt]);

  // If the effect is switched off mid-hover (prop change, reduced-motion
  // toggle), settle the card back to rest instead of freezing mid-tilt.
  useEffect(() => {
    if (!node || active) {
      return;
    }
    clearTilt(node);
  }, [node, active]);

  const style = useMemo<CSSProperties>(
    () => ({
      transform: `perspective(${perspective}px) rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg)) scale3d(var(--tilt-s, 1), var(--tilt-s, 1), 1)`,
      transformStyle: 'preserve-3d',
      transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
      willChange: 'transform',
    }),
    [perspective, speed],
  );

  return {
    tiltProps: { ref, style, onPointerMove, onPointerLeave },
    active,
  };
}
