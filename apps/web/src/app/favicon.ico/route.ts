const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#32462f"/>
  <text x="16" y="22" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#f8f6f0" text-anchor="middle">M</text>
</svg>`

export function GET() {
  return new Response(FAVICON_SVG, {
    status: 200,
    headers: {
      'content-type': 'image/svg+xml',
      'cache-control': 'public, max-age=86400, immutable',
    },
  })
}

