/**
 * Origin and CSRF validation harness testing Next.js BFF mutation routes.
 * Enforces dynamic origins, fail-closed on missing origin/referer, and Sec-Fetch-Site.
 */

export interface BffOriginValidationResult {
  ok: boolean
  upstreamOrigin?: string
  status?: number
  errorCode?: string
}

export function validateTestBffOrigin(input: {
  origin?: string | null
  referer?: string | null
  secFetchSite?: string | null
  method?: string
  allowedOrigins?: string[]
}): BffOriginValidationResult {
  const allowed = new Set(
    input.allowedOrigins ?? [
      'http://app.mori.localhost',
      'http://invite.mori.localhost',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env['PUBLIC_APP_ORIGIN'] ?? 'https://app.mori.vn',
      process.env['PUBLIC_INVITE_ORIGIN'] ?? 'https://invite.mori.vn',
    ],
  )

  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
    (input.method ?? 'POST').toUpperCase(),
  )

  // Modern browser metadata defense
  if (input.secFetchSite === 'cross-site') {
    return { ok: false, status: 403, errorCode: 'CROSS_SITE_REJECTED' }
  }

  if (input.origin) {
    if (!allowed.has(input.origin)) {
      return { ok: false, status: 403, errorCode: 'CROSS_SITE_REJECTED' }
    }
    const upstream =
      input.origin.startsWith('http://localhost:') || input.origin.startsWith('http://127.0.0.1:')
        ? 'http://app.mori.localhost'
        : input.origin
    return { ok: true, upstreamOrigin: upstream }
  }

  if (input.referer) {
    try {
      const parsed = new URL(input.referer).origin
      if (!allowed.has(parsed)) {
        return { ok: false, status: 403, errorCode: 'CROSS_SITE_REJECTED' }
      }
      return { ok: true, upstreamOrigin: parsed }
    } catch {
      return { ok: false, status: 403, errorCode: 'CROSS_SITE_REJECTED' }
    }
  }

  // Fail-closed requirement: browser mutations omitting both Origin and Referer must fail
  if (isMutation) {
    return { ok: false, status: 403, errorCode: 'CROSS_SITE_REJECTED' }
  }

  return { ok: true, upstreamOrigin: 'http://app.mori.localhost' }
}
