export function webglAvailable(): boolean {
  const probe = document.createElement('canvas')
  const gl = probe.getContext('webgl')
  if (!gl) return false
  gl.getExtension('WEBGL_lose_context')?.loseContext()
  return true
}
