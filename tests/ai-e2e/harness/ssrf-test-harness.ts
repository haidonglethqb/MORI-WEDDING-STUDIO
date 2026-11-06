/**
 * SSRF validation harness for admin provider connection test endpoints.
 * Guards against private networks, loopback, cloud metadata, and unauthorized schemes.
 */

export const ALLOWED_PROVIDER_HOSTS = new Set([
  'api.modelapi.vn',
  'api.groq.com',
  'api.openai.com',
])

export interface SsrfValidationResult {
  valid: boolean
  resolvedHost?: string
  reason?: string
}

const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/, // AWS / GCP / Azure metadata
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
]

export function validateTestProviderUrl(
  rawUrl: string,
  allowedHosts: Set<string> = ALLOWED_PROVIDER_HOSTS,
): SsrfValidationResult {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { valid: false, reason: 'INVALID_URL' }
  }

  // Scheme must be strictly https:
  if (parsed.protocol !== 'https:') {
    return { valid: false, reason: 'DISALLOWED_PROTOCOL' }
  }

  const hostname = parsed.hostname.toLowerCase()

  // Pre-flight check against private/loopback/metadata IP ranges
  for (const pattern of BLOCKED_HOST_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, resolvedHost: hostname, reason: 'BLOCKED_PRIVATE_IP' }
    }
  }

  // Whitelist check
  if (!allowedHosts.has(hostname)) {
    return { valid: false, resolvedHost: hostname, reason: 'HOST_NOT_ALLOWLISTED' }
  }

  return { valid: true, resolvedHost: hostname }
}
