import { describe, expect, it } from 'vitest';
import * as api from './index';

describe('public API', () => {
  it('exports the component, hooks, and helpers', () => {
    expect(api.TiltCard).toBeTypeOf('function');
    expect(api.useTilt).toBeTypeOf('function');
    expect(api.parallax).toBeTypeOf('function');
    expect(api.requestGyroPermission).toBeTypeOf('function');
    expect(api.usePrefersReducedMotion).toBeTypeOf('function');
    expect(api.TILT_CUSTOM_PROPS).toContain('--tilt-rx');
  });
});
