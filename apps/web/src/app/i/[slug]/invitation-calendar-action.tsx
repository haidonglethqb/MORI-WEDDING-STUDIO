'use client'

interface CalendarProps {
  title: string
  venue: string
  displayNames: [string, string]
}

export function InvitationCalendarAction({ title, venue, displayNames }: CalendarProps) {
  function openGoogleCalendar() {
    const text = encodeURIComponent(`Lễ Thành Hôn · ${displayNames[0]} & ${displayNames[1]}`)
    const details = encodeURIComponent(`${title} — Trân trọng kính mời quý khách tham dự chung vui cùng hai gia đình.`)
    const location = encodeURIComponent(venue)
    const dates = '20261128T100000Z/20261128T140000Z'
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}&dates=${dates}`, '_blank')
  }

  function openGoogleMaps() {
    const query = encodeURIComponent(`${venue}, Hà Nội`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  return (
    <div className="event-action-buttons-row">
      <button
        type="button"
        onClick={openGoogleCalendar}
        className="event-action-btn calendar-btn"
      >
        <span className="action-btn-icon">📅</span>
        <span>Thêm vào Google / Apple Calendar</span>
      </button>

      <button
        type="button"
        onClick={openGoogleMaps}
        className="event-action-btn maps-btn"
      >
        <span className="action-btn-icon">🗺️</span>
        <span>Chỉ đường Google Maps</span>
      </button>
    </div>
  )
}
