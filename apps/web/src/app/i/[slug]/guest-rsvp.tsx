'use client'

import { useEffect, useState } from 'react'

interface RsvpSheet {
  version: number
  events: { eventId: string; title: string }[]
}

export function GuestRsvp({ slug }: { slug: string }) {
  const [sheet, setSheet] = useState<RsvpSheet | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    void fetch(`/i/${encodeURIComponent(slug)}/rsvp`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return
        setSheet((await response.json()) as RsvpSheet)
      })
      .catch(() => setStatus('Chưa mở được lời đáp.'))
  }, [slug])

  async function answer(eventId: string, attending: boolean) {
    if (!sheet) return
    setStatus('Đang ghi')
    const response = await fetch(`/i/${encodeURIComponent(slug)}/rsvp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventId,
        expectedVersion: sheet.version,
        status: attending ? 'ATTENDING' : 'DECLINED',
        attendeeCount: attending ? 1 : 0,
      }),
    })
    if (!response.ok) {
      setStatus('Chưa ghi được lời đáp.')
      return
    }
    const saved = (await response.json()) as { version: number }
    setSheet({ ...sheet, version: saved.version })
    setStatus(attending ? 'Đã ghi tham dự.' : 'Đã ghi không tham dự.')
  }

  if (!sheet) return null
  return (
    <section>
      <h2>Lời đáp</h2>
      {sheet.events.length === 0 ? <p>Chưa có buổi để trả lời.</p> : null}
      <ul>
        {sheet.events.map((event) => (
          <li key={event.eventId}>
            {event.title}
            <button type="button" onClick={() => void answer(event.eventId, true)}>
              Tham dự
            </button>
            <button type="button" onClick={() => void answer(event.eventId, false)}>
              Không tham dự
            </button>
          </li>
        ))}
      </ul>
      {status ? <p>{status}</p> : null}
    </section>
  )
}
