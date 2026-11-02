import type { NextFunction, Request, Response } from 'express'

export const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ['Referrer-Policy', 'no-referrer'],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
  ['Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"],
]

export function securityHeadersMiddleware(_request: Request, response: Response, next: NextFunction): void {
  for (const [name, value] of SECURITY_HEADERS) response.setHeader(name, value)
  next()
}
