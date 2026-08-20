import { describe, it, expect } from 'vitest';
import { parallax } from './parallax';

describe('parallax', () => {
  it('lifts a layer toward the viewer', () => {
    expect(parallax(40)).toEqual({
      transform: 'translateZ(40px)',
      transformStyle: 'preserve-3d',
    });
  });

  it('pushes a layer behind the surface with a negative depth', () => {
    expect(parallax(-20).transform).toBe('translateZ(-20px)');
  });

  it('keeps a zero-depth layer on the surface', () => {
    expect(parallax(0).transform).toBe('translateZ(0px)');
  });
});
