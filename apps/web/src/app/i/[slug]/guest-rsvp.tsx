'use client'

import { useEffect, useState } from 'react'

interface RsvpSheet {
  version: number
  events: { eventId: string; title: string }[]
}

export function GuestRsvp({ slug }: { slug: string }) {
  const [sheet, setSheet] = useState<RsvpSheet | null>(null)
  const [status, setStatus] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  useEffect(() => {
    void fetch(`/i/${encodeURIComponent(slug)}/rsvp`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return
        setSheet((await response.json()) as RsvpSheet)
      })
      .catch(() => setStatus('Chưa mở được thông tin lời đáp.'))
  }, [slug])

  async function answer(eventId: string, attending: boolean) {
    if (!sheet) return
    setSelectedEventId(eventId)
    setStatus('Đang ghi nhận phản hồi...')
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
      setStatus('Chưa ghi nhận được phản hồi. Quý khách vui lòng thử lại sau.')
      return
    }
    const saved = (await response.json()) as { version: number }
    setSheet({ ...sheet, version: saved.version })
    setStatus(
      attending
        ? '✦ Gia đình xin trân trọng cảm ơn và hẹn gặp quý khách tại buổi tiệc!'
        : 'Gia đình đã nhận thông tin. Chân thành cảm ơn lời chúc của quý khách.',
    )
  }

  if (!sheet) return null

  return (
    <section className="guest-rsvp-box">
      <h2>Xác nhận sự hiện diện</h2>
      <p className="guest-rsvp-desc">
        Sự hiện diện của quý khách là niềm hân hạnh vô cùng to lớn cho gia đình chúng tôi.
      </p>

      {sheet.events.length === 0 ? (
        <p className="guest-rsvp-desc">Chưa có sự kiện nào mở nhận lời đáp.</p>
      ) : null}

      {sheet.events.map((event) => (
        <div key={event.eventId} className="guest-rsvp-event">
          <h3 className="guest-rsvp-event-title">{event.title}</h3>
          <div className="guest-rsvp-buttons">
            <button
              type="button"
              className="rsvp-btn-yes"
              onClick={() => void answer(event.eventId, true)}
            >
              Trân trọng tham dự ✦
            </button>
            <button
              type="button"
              className="rsvp-btn-no"
              onClick={() => void answer(event.eventId, false)}
            >
              Rất tiếc không thể đến
            </button>
          </div>
          {status && selectedEventId === event.eventId ? (
            <div className="guest-rsvp-status">{status}</div>
          ) : null}
        </div>
      ))}
    </section>
  )
}
