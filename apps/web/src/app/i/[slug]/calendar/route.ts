interface RouteContext {
  params: Promise<{ slug: string }>
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug } = await context.params
  try {
    const upstream = await fetch(
      `${apiOrigin()}/api/v1/public/invitations/${encodeURIComponent(slug)}/calendar`,
      { cache: 'no-store' },
    )
    if (!upstream.ok) return new Response(null, { status: upstream.status === 404 ? 404 : 503 })

    return new Response(await upstream.arrayBuffer(), {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="mori-invitation.ics"',
      },
    })
  } catch {
    return new Response(null, { status: 503, headers: { 'Cache-Control': 'private, no-store' } })
  }
}
