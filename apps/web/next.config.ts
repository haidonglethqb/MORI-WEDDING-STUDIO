import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

if (process.env.NODE_ENV === 'production') {
  securityHeaders.push({
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  })
}

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/i/:slug',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
    ]
  },

  // Enforce the import boundary: apps/web must not import packages/database
  // (enforced further by dependency-cruiser in P01; this is a build-time hint)
  experimental: {
    optimizePackageImports: [],
  },

  // API origin is a server-side runtime env var, never exposed as NEXT_PUBLIC_
  // Read directly from process.env in server components - no client bundle exposure
}

export default nextConfig
