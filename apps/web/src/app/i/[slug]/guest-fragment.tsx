'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function GuestFragment({ slug }: { slug: string }) {
  const router = useRouter()

  useEffect(() => {
    const secret = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('guest')
    if (!secret) return
    void fetch(`/i/${encodeURIComponent(slug)}/guest-session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret }),
    }).then((response) => {
      if (!response.ok) return
      const url = new URL(window.location.href)
      url.hash = ''
      history.replaceState(null, '', `${url.pathname}${url.search}`)
      router.refresh()
    })
  }, [router, slug])

  return null
}
