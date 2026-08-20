import { describe, it, expect, vi, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useTilt, TILT_CUSTOM_PROPS } from './useTilt';
import type { TiltOptions } from './types';

function TiltProbe({ options }: { options?: TiltOptions }) {
  const { tiltProps, active } = useTilt(options);
  return (
    <div data-testid="tilt" data-active={active ? 'yes' : 'no'} {...tiltProps}>
      surface
    </div>
  );
}

function mockRect(el: HTMLElement, overrides: Partial<DOMRect> = {}): void {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    right: 200,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...overrides,
  } as DOMRect);
}

/**
 * jsdom's PointerEvent support is missing, but React routes events by their
 * type string, so a MouseEvent named "pointermove" reaches onPointerMove with
 * real coordinates. onPointerLeave is synthesized from bubbling "pointerout".
 */
function movePointer(el: Element, clientX: number, clientY: number): void {
  fireEvent(el, new MouseEvent('pointermove', { clientX, clientY, bubbles: true }));
}

function leavePointer(el: Element): void {
  fireEvent(el, new MouseEvent('pointerout', { bubbles: true }));
}

function fireOrientation(beta: number | null, gamma: number | null): void {
  const event = Object.assign(new Event('deviceorientation'), { beta, gamma });
  act(() => {
    window.dispatchEvent(event);
  });
}

function tiltProp(el: HTMLElement, prop: string): string {
  return el.style.getPropertyValue(prop);
}

function expectAtRest(el: HTMLElement): void {
  for (const prop of TILT_CUSTOM_PROPS) {
    expect(tiltProp(el, prop)).toBe('');
  }
}

function installReducedMotion(matches: boolean): void {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList);
}

describe('useTilt', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('pointer input', () => {
    it('tilts toward the pointer with default options', () => {
      render(<TiltProbe />);
      const el = screen.getByTestId('tilt');
      mockRect(el);

      movePointer(el, 200, 0); // top-right corner: nx = 1, ny = -1
      expect(tiltProp(el, '--tilt-rx')).toBe('14deg');
      expect(tiltProp(el, '--tilt-ry')).toBe('14deg');
      expect(tiltProp(el, '--tilt-s')).toBe('1.04');
      expect(tiltProp(el, '--tilt-gx')).toBe('100%');
      expect(tiltProp(el, '--tilt-gy')).toBe('0%');
      expect(tiltProp(el, '--tilt-go')).toBe('0.25');
      expect(el).toHaveAttribute('data-active', 'yes');
    });

    it('honors every custom option, including reverse and onTilt', () => {
      const onTilt = vi.fn();
      render(
        <TiltProbe
          options={{
            maxTilt: 20,
            scale: 1.1,
            perspective: 800,
            speed: 90,
            reverse: true,
            glareMaxOpacity: 0.5,
            gyro: false,
            disabled: false,
            respectReducedMotion: false,
            onTilt,
          }}
        />,
      );
      const el = screen.getByTestId('tilt');
      mockRect(el);

      movePointer(el, 200, 100); // bottom-right corner: nx = 1, ny = 1
      expect(tiltProp(el, '--tilt-rx')).toBe('20deg'); // reversed
      expect(tiltProp(el, '--tilt-ry')).toBe('-20deg');
      expect(tiltProp(el, '--tilt-s')).toBe('1.1');
      expect(tiltProp(el, '--tilt-gx')).toBe('100%');
      expect(tiltProp(el, '--tilt-gy')).toBe('100%');
      expect(tiltProp(el, '--tilt-go')).toBe('0.5');
      expect(onTilt).toHaveBeenCalledWith({ rotateX: 20, rotateY: -20, source: 'pointer' });
    });

    it('clamps pointer positions outside the card bounds', () => {
      render(<TiltProbe />);
      const el = screen.getByTestId('tilt');
      mockRect(el);

      movePointer(el, 500, -50);
      expect(tiltProp(el, '--tilt-rx')).toBe('14deg');
      expect(tiltProp(el, '--tilt-ry')).toBe('14deg');
      expect(tiltProp(el, '--tilt-gx')).toBe('100%');
      expect(tiltProp(el, '--tilt-gy')).toBe('0%');
    });

    it('settles back to rest on pointer leave', () => {
      render(<TiltProbe />);
      const el = screen.getByTestId('tilt');
      mockRect(el);

      movePointer(el, 200, 0);
      expect(tiltProp(el, '--tilt-rx')).toBe('14deg');

      leavePointer(el);
      expectAtRest(el);
    });

    it('does nothing while disabled', () => {
      render(<TiltProbe options={{ disabled: true }} />);
      const el = screen.getByTestId('tilt');
      mockRect(el);

      movePointer(el, 200, 0);
      expectAtRest(el);
      expect(el).toHaveAttribute('data-active', 'no');
    });

    it('does nothing when the card has zero width', () => {
      render(<TiltProbe />);
      const el = screen.getByTestId('tilt');
      // jsdom's real getBoundingClientRect reports 0x0 — exactly the guard case.
      movePointer(el, 50, 50);
      expectAtRest(el);
    });

    it('does nothing when the card has zero height', () => {
      render(<TiltProbe />);
      const el = screen.getByTestId('tilt');
      mockRect(el, { height: 0, bottom: 0 });

      movePointer(el, 50, 50);
      expectAtRest(el);
    });
  });

  describe('reduced motion', () => {
    it('stays still when the user prefers reduced motion', () => {
      installReducedMotion(true);
      render(<TiltProbe />);
      const el = screen.getByTestId('tilt');
      mockRect(el);

      movePointer(el, 200, 0);
      expectAtRest(el);
      expect(el).toHaveAttribute('data-active', 'no');
    });

    it('tilts despite the preference when respectReducedMotion is false', () => {
      installReducedMotion(true);
      render(<TiltProbe options={{ respectReducedMotion: false }} />);
      const el = screen.getByTestId('tilt');
      mockRect(el);

      movePointer(el, 200, 0);
      expect(tiltProp(el, '--tilt-rx')).toBe('14deg');
      expect(el).toHaveAttribute('data-active', 'yes');
    });
  });

  describe('gyroscope input', () => {
    it('tilts from device orientation, calibrated to the first beta reading', () => {
      render(<TiltProbe />);
      const el = screen.getByTestId('tilt');

      fireOrientation(40, 16); // first event: beta 40 becomes neutral, gamma 16 / 32 = 0.5
      expect(tiltProp(el, '--tilt-rx')).toBe('0deg');
      expect(tiltProp(el, '--tilt-ry')).toBe('7deg');
      expect(tiltProp(el, '--tilt-gx')).toBe('75%');
      expect(tiltProp(el, '--tilt-gy')).toBe('50%');

      fireOrientation(8, 0); // pitch back past the clamp: (8 - 40) / 32 = -1
      expect(tiltProp(el, '--tilt-rx')).toBe('14deg');
      expect(tiltProp(el, '--tilt-ry')).toBe('0deg');
      expect(tiltProp(el, '--tilt-gy')).toBe('0%');
    });

    it('ignores orientation events with a null beta', () => {
      render(<TiltProbe />);
      const el = screen.getByTestId('tilt');

      fireOrientation(null, 10);
      expectAtRest(el);
    });

    it('ignores orientation events with a null gamma', () => {
      render(<TiltProbe />);
      const el = screen.getByTestId('tilt');

      fireOrientation(10, null);
      expectAtRest(el);
    });

    it('ignores orientation when gyro is off', () => {
      render(<TiltProbe options={{ gyro: false }} />);
      const el = screen.getByTestId('tilt');

      fireOrientation(40, 16);
      expectAtRest(el);
    });

    it('ignores orientation while disabled', () => {
      render(<TiltProbe options={{ disabled: true }} />);
      const el = screen.getByTestId('tilt');

      fireOrientation(40, 16);
      expectAtRest(el);
    });

    it('reports gyro tilt through onTilt', () => {
      const onTilt = vi.fn();
      render(<TiltProbe options={{ onTilt }} />);

      fireOrientation(40, 16);
      fireOrientation(72, 32); // (72 - 40) / 32 = 1, 32 / 32 = 1
      expect(onTilt).toHaveBeenCalledTimes(2);
      expect(onTilt).toHaveBeenLastCalledWith({ rotateX: -14, rotateY: 14, source: 'gyro' });
    });

    it('removes the orientation listener on unmount', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<TiltProbe />);

      const registration = addSpy.mock.calls.find(([type]) => type === 'deviceorientation');
      expect(registration).toBeDefined();

      unmount();
      expect(removeSpy).toHaveBeenCalledWith('deviceorientation', registration?.[1]);
    });

    it('does not listen before a node is attached', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const { result } = renderHook(() => useTilt());

      fireOrientation(40, 16);
      expect(result.current.active).toBe(true);
      expect(addSpy.mock.calls.some(([type]) => type === 'deviceorientation')).toBe(false);
    });
  });

  describe('lifecycle', () => {
    it('clears an in-flight tilt when the hook becomes inactive', () => {
      const { rerender } = render(<TiltProbe />);
      const el = screen.getByTestId('tilt');
      mockRect(el);

      movePointer(el, 200, 0);
      expect(tiltProp(el, '--tilt-rx')).toBe('14deg');

      rerender(<TiltProbe options={{ disabled: true }} />);
      expectAtRest(el);
    });

    it('exposes perspective and speed through the static style', () => {
      const { result } = renderHook(() => useTilt({ perspective: 600, speed: 250 }));
      expect(result.current.tiltProps.style.transform).toContain('perspective(600px)');
      expect(result.current.tiltProps.style.transition).toContain('250ms');

      const { result: defaults } = renderHook(() => useTilt());
      expect(defaults.current.tiltProps.style.transform).toContain('perspective(1000px)');
      expect(defaults.current.tiltProps.style.transition).toContain('400ms');
    });

    it('survives StrictMode double-invoking effects', () => {
      const { unmount } = render(
        <StrictMode>
          <TiltProbe />
        </StrictMode>,
      );
      const el = screen.getByTestId('tilt');
      mockRect(el);

      movePointer(el, 200, 0);
      expect(tiltProp(el, '--tilt-rx')).toBe('14deg');

      fireOrientation(40, 16);
      fireOrientation(72, 32);
      expect(tiltProp(el, '--tilt-gy')).toBe('100%');

      expect(() => unmount()).not.toThrow();
    });
  });
});
