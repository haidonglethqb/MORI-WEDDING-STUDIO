'use client'

import { useEffect, useState } from 'react'

interface InvitationEvent {
  eventId: string
  title: string
  retired: boolean
}

export function RetireEvent({ invitationId }: { invitationId: string }) {
  const [events, setEvents] = useState<InvitationEvent[]>([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    void fetch(`/invitations/${invitationId}/events`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return
        setEvents((await response.json()) as InvitationEvent[])
      })
      .catch(() => setStatus('Chưa mở được danh sách buổi.'))
  }, [invitationId])

  async function retire(eventId: string) {
    setStatus('Đang gỡ buổi')
    const response = await fetch(`/invitations/${invitationId}/events/${eventId}/retire`, { method: 'POST' })
    if (!response.ok) {
      setStatus('Chưa gỡ được buổi.')
      return
    }
    setEvents((current) => current.map((event) => (event.eventId === eventId ? { ...event, retired: true } : event)))
    setStatus('Đã gỡ buổi. Lời đáp cũ vẫn còn.')
  }

  if (events.length === 0) return null
  return (
    <section>
      <h2>Buổi</h2>
      <ul>
        {events.map((event) => (
          <li key={event.eventId}>
            {event.title}
            {event.retired ? ' · Đã gỡ' : ''}
            {event.retired ? null : (
              <button type="button" onClick={() => void retire(event.eventId)}>
                Gỡ buổi
              </button>
            )}
          </li>
        ))}
      </ul>
      {status ? <p>{status}</p> : null}
    </section>
  )
}
