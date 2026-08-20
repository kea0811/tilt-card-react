interface OrientationPermissionApi {
  requestPermission?: () => Promise<string>;
}

/**
 * Asks iOS 13+ for device-orientation access. Safari only resolves the
 * underlying prompt when this is called from a user gesture (tap/click), so
 * wire it to a button. Resolves `true` when gyro events will flow — including
 * on platforms that never gate them — and `false` when they won't.
 */
export async function requestGyroPermission(): Promise<boolean> {
  if (typeof DeviceOrientationEvent === 'undefined') {
    return false;
  }
  const { requestPermission } = DeviceOrientationEvent as unknown as OrientationPermissionApi;
  if (typeof requestPermission !== 'function') {
    return true;
  }
  try {
    return (await requestPermission()) === 'granted';
  } catch {
    // Safari rejects when called outside a user gesture.
    return false;
  }
}
