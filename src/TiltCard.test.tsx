import { describe, it, expect, vi, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TiltCard } from './TiltCard';

function mockRect(el: HTMLElement): void {
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
  } as DOMRect);
}

function movePointer(el: Element, clientX: number, clientY: number): void {
  fireEvent(el, new MouseEvent('pointermove', { clientX, clientY, bubbles: true }));
}

describe('TiltCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children and forwards div props, without a glare layer by default', () => {
    render(
      <TiltCard data-testid="card" id="hero" className="fancy">
        Hello depth
      </TiltCard>,
    );
    const el = screen.getByTestId('card');
    expect(el).toHaveTextContent('Hello depth');
    expect(el).toHaveAttribute('id', 'hero');
    expect(el).toHaveClass('fancy');
    expect(el.querySelector('[data-tilt-glare]')).toBeNull();
    expect(el.style.position).toBe('relative');
    expect(el.style.transition).toContain('400ms');
  });

  it('renders a decorative glare layer when glare is set', () => {
    render(
      <TiltCard data-testid="card" glare>
        Shiny
      </TiltCard>,
    );
    const glareEl = screen.getByTestId('card').querySelector('[data-tilt-glare]');
    expect(glareEl).not.toBeNull();
    expect(glareEl).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges user style on top of the tilt style', () => {
    render(
      <TiltCard data-testid="card" style={{ padding: '4px' }}>
        Styled
      </TiltCard>,
    );
    const el = screen.getByTestId('card');
    expect(el.style.padding).toBe('4px');
    expect(el.style.position).toBe('relative');
  });

  it('tilts on pointer move and reports through onTilt', () => {
    const onTilt = vi.fn();
    render(
      <TiltCard data-testid="card" maxTilt={10} onTilt={onTilt}>
        Tilts
      </TiltCard>,
    );
    const el = screen.getByTestId('card');
    mockRect(el);

    movePointer(el, 200, 100); // bottom-right: nx = 1, ny = 1
    expect(el.style.getPropertyValue('--tilt-rx')).toBe('-10deg');
    expect(el.style.getPropertyValue('--tilt-ry')).toBe('10deg');
    expect(onTilt).toHaveBeenCalledWith({ rotateX: -10, rotateY: 10, source: 'pointer' });
  });

  it('works under StrictMode', () => {
    const { unmount } = render(
      <StrictMode>
        <TiltCard data-testid="card" glare>
          Strict
        </TiltCard>
      </StrictMode>,
    );
    const el = screen.getByTestId('card');
    mockRect(el);

    movePointer(el, 200, 0);
    expect(el.style.getPropertyValue('--tilt-ry')).toBe('14deg');
    expect(() => unmount()).not.toThrow();
  });
});
