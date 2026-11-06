'use client'

import { useEffect, useState } from 'react'

interface RsvpSheet {
  version: number
  events: { eventId: string; title: string }[]
}

export function GuestRsvp({ slug, coupleNames }: { slug: string; coupleNames?: string }) {
  const [sheet, setSheet] = useState<RsvpSheet | null>(null)
  const [status, setStatus] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [count, setCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [wish, setWish] = useState('')
  const [wishSent, setWishSent] = useState(false)

  useEffect(() => {
    void fetch(`/i/${encodeURIComponent(slug)}/rsvp`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return
        setSheet((await response.json()) as RsvpSheet)
      })
      .catch(() => {})
  }, [slug])

  async function answer(eventId: string, attending: boolean) {
    if (!sheet) return
    setSelectedEventId(eventId)
    setLoading(true)
    setStatus('Đang ghi nhận phản hồi...')

    try {
      const response = await fetch(`/i/${encodeURIComponent(slug)}/rsvp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          eventId,
          expectedVersion: sheet.version,
          status: attending ? 'ATTENDING' : 'DECLINED',
          attendeeCount: attending ? count : 0,
        }),
      })

      setLoading(false)

      if (response.status === 409) {
        setStatus('Rất tiếc, thời hạn xác nhận tham dự (RSVP) đã kết thúc hoặc bản ghi đã thay đổi.')
        return
      }

      if (!response.ok) {
        setStatus('Chưa ghi nhận được phản hồi. Quý khách vui lòng thử lại sau.')
        return
      }

      const saved = (await response.json()) as { version: number }
      setSheet({ ...sheet, version: saved.version })
      setStatus(
        attending
          ? `✦ Gia đình xin trân trọng cảm ơn và hẹn đón tiếp ${count} quý khách tại buổi tiệc!`
          : 'Gia đình đã nhận thông tin. Chân thành cảm ơn tình cảm và lời chúc của quý khách.',
      )
    } catch {
      setLoading(false)
      setStatus('Lỗi kết nối máy chủ.')
    }
  }

  return (
    <section className="guest-rsvp-box">
      <h2>Xác nhận hiện diện &amp; Lời chúc phúc</h2>
      <p className="guest-rsvp-desc">
        Sự hiện diện và lời chúc của quý khách là niềm hân hạnh vô cùng to lớn cho hai gia đình chúng tôi.
      </p>

      {sheet && sheet.events.length > 0 ? (
        sheet.events.map((event) => (
          <div key={event.eventId} className="guest-rsvp-event">
            <h3 className="guest-rsvp-event-title">{event.title}</h3>

            <div className="rsvp-attendee-picker">
              <span>Số lượng khách tham dự:</span>
              <div className="count-selector-btn-group">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`count-select-pill ${count === num ? 'active' : ''}`}
                    onClick={() => setCount(num)}
                  >
                    {num} người
                  </button>
                ))}
              </div>
            </div>

            <div className="guest-rsvp-buttons">
              <button
                type="button"
                disabled={loading}
                className="rsvp-btn-yes"
                onClick={() => void answer(event.eventId, true)}
              >
                {loading ? 'Đang gửi...' : `Trân trọng tham dự (${count} khách) ✦`}
              </button>
              <button
                type="button"
                disabled={loading}
                className="rsvp-btn-no"
                onClick={() => void answer(event.eventId, false)}
              >
                Gửi lời chúc từ xa
              </button>
            </div>
            {status && selectedEventId === event.eventId ? (
              <div className="guest-rsvp-status">{status}</div>
            ) : null}
          </div>
        ))
      ) : null}

      {/* Sổ lưu bút chúc phúc trực tuyến */}
      <div className="guest-wishes-box">
        <h4 className="wishes-box-title">Gửi lời chúc phúc đến Tân Lang &amp; Tân Nương</h4>
        {wishSent ? (
          <div className="wish-sent-success">
            <span>💐</span>
            <strong>Lời chúc của bạn đã được gửi thành công đến đôi uyên ương!</strong>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (wish.trim()) setWishSent(true)
            }}
            className="wishes-form"
          >
            <textarea
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder={`Viết lời chúc phúc chân thành gửi đến ${coupleNames || 'đôi uyên ương'}...`}
              rows={3}
              className="wishes-textarea"
            />
            <button type="submit" disabled={!wish.trim()} className="wishes-submit-btn">
              Gửi lời chúc phúc ✦
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
