/** Yaw for a flat card. Front stays at 0. Back turns halfway, it is not a mirrored front. */

export function flatCardYaw(face: 'front' | 'back'): number {
  return face === 'front' ? 0 : Math.PI
}
