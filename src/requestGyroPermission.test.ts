import { describe, it, expect, vi, afterEach } from 'vitest';
import { requestGyroPermission } from './requestGyroPermission';

describe('requestGyroPermission', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves false when DeviceOrientationEvent does not exist', async () => {
    vi.stubGlobal('DeviceOrientationEvent', undefined);
    await expect(requestGyroPermission()).resolves.toBe(false);
  });

  it('resolves true when no permission gate exists (Android, desktop)', async () => {
    vi.stubGlobal('DeviceOrientationEvent', class {});
    await expect(requestGyroPermission()).resolves.toBe(true);
  });

  it('resolves true when iOS grants access', async () => {
    vi.stubGlobal('DeviceOrientationEvent', {
      requestPermission: vi.fn().mockResolvedValue('granted'),
    });
    await expect(requestGyroPermission()).resolves.toBe(true);
  });

  it('resolves false when iOS denies access', async () => {
    vi.stubGlobal('DeviceOrientationEvent', {
      requestPermission: vi.fn().mockResolvedValue('denied'),
    });
    await expect(requestGyroPermission()).resolves.toBe(false);
  });

  it('resolves false when the prompt rejects (no user gesture)', async () => {
    vi.stubGlobal('DeviceOrientationEvent', {
      requestPermission: vi.fn().mockRejectedValue(new Error('user gesture required')),
    });
    await expect(requestGyroPermission()).resolves.toBe(false);
  });
});
