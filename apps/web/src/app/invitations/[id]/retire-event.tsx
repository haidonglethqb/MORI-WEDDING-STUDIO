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
      .catch(() => setStatus('Chưa mở được danh sách buổi lễ.'))
  }, [invitationId])

  async function retire(eventId: string) {
    setStatus('Đang gỡ buổi lễ...')
    const response = await fetch(`/invitations/${invitationId}/events/${eventId}/retire`, { method: 'POST' })
    if (!response.ok) {
      setStatus('Chưa gỡ được buổi lễ.')
      return
    }
    setEvents((current) => current.map((event) => (event.eventId === eventId ? { ...event, retired: true } : event)))
    setStatus('Đã gỡ buổi lễ. Các phản hồi trước đây vẫn được lưu trữ.')
  }

  if (events.length === 0) return null

  return (
    <fieldset className="editor-tool-fieldset">
      <legend>Quản lý các sự kiện / Buổi lễ</legend>
      <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {events.map((event) => (
          <li key={event.eventId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span>
              {event.title} {event.retired ? <strong style={{ color: '#9b1c1c' }}>· [Đã đóng]</strong> : null}
            </span>
            {!event.retired ? (
              <button
                type="button"
                className="editor-btn-secondary"
                style={{ color: '#9b1c1c', borderColor: '#f8b4b4', padding: '4px 10px', fontSize: '12px' }}
                onClick={() => void retire(event.eventId)}
              >
                Gỡ bỏ sự kiện
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {status ? <div style={{ fontSize: '12px', color: '#7a8275' }}>{status}</div> : null}
    </fieldset>
  )
}
