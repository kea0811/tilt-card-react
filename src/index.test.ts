import { describe, expect, it } from 'vitest';
import { VERSION } from './index';

describe('tilt-card-react', () => {
  it('exposes the package version', () => {
    expect(VERSION).toBe('0.1.0');
  });
});
