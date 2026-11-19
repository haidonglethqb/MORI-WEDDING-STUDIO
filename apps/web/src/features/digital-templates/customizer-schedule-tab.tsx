'use client'

import type { DigitalInvitationModel } from './digital-template-types'

interface Props {
  model: DigitalInvitationModel
  onChange: (next: DigitalInvitationModel) => void
}

function splitEventLocalStart(value: string): { date: string; time: string } {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/.exec(value)
  if (!m) return { date: '', time: '' }
  return { date: `${m[1]}-${m[2]}-${m[3]}`, time: `${m[4]}:${m[5]}` }
}

export function CustomizerScheduleTab({ model, onChange }: Props) {
  const { date, time } = splitEventLocalStart(model.eventLocalStart)

  function updateDateTime(nextDate: string, nextTime: string) {
    if (!nextDate) {
      onChange({ ...model, eventLocalStart: '' })
      return
    }
    const cleanDate = nextDate.replaceAll('-', '')
    const cleanTime = (nextTime || '18:00').replaceAll(':', '')
    if (/^\d{8}$/.test(cleanDate) && /^\d{4}$/.test(cleanTime)) {
      onChange({ ...model, eventLocalStart: `${cleanDate}T${cleanTime}00` })
    }
  }

  function updateSlot(index: number, field: 'time' | 'label', value: string) {
    const next = model.scheduleItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    )
    onChange({ ...model, scheduleItems: next })
  }

  function addSlot() {
    if (model.scheduleItems.length >= 6) return
    onChange({
      ...model,
      scheduleItems: [...model.scheduleItems, { time: '18:00', label: 'Đón khách & Chụp ảnh' }],
    })
  }

  function removeSlot(index: number) {
    onChange({
      ...model,
      scheduleItems: model.scheduleItems.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="cfg-stack">
      <div className="cfg-two-col">
        <div className="cfg-block">
          <label className="cfg-label">Ngày cưới (Dương lịch)</label>
          <input
            type="date"
            className="cfg-input"
            value={date}
            onChange={(e) => updateDateTime(e.target.value, time)}
          />
        </div>
        <div className="cfg-block">
          <label className="cfg-label">Giờ cử hành</label>
          <input
            type="time"
            className="cfg-input"
            value={time}
            onChange={(e) => updateDateTime(date || '2026-12-20', e.target.value)}
          />
        </div>
      </div>

      <div className="cfg-block">
        <label className="cfg-label">Ngày Âm lịch hiển thị</label>
        <input
          className="cfg-input"
          placeholder="Ví dụ: Nhằm ngày 12 tháng 11 năm Bính Ngọ"
          value={model.lunarDate}
          onChange={(e) => onChange({ ...model, lunarDate: e.target.value })}
        />
      </div>

      <div className="cfg-block">
        <label className="cfg-label">Tên sảnh / Trung tâm tiệc cưới</label>
        <input
          className="cfg-input"
          placeholder="VD: Grand Ballroom · White Palace"
          value={model.venueName}
          onChange={(e) => onChange({ ...model, venueName: e.target.value })}
        />
      </div>

      <div className="cfg-block">
        <label className="cfg-label">Địa chỉ chi tiết</label>
        <input
          className="cfg-input"
          placeholder="Số nhà, đường, quận/huyện, thành phố"
          value={model.venueAddress}
          onChange={(e) => onChange({ ...model, venueAddress: e.target.value })}
        />
      </div>

      <div className="cfg-block">
        <label className="cfg-label">Link Google Maps (tùy chọn — tự động tìm theo địa chỉ nếu để trống)</label>
        <input
          type="url"
          className="cfg-input"
          placeholder="https://maps.google.com/..."
          value={model.mapUrl}
          onChange={(e) => onChange({ ...model, mapUrl: e.target.value })}
        />
      </div>

      <div className="cfg-block">
        <div className="cfg-row-between">
          <span className="cfg-label">Lịch trình buổi lễ ({model.scheduleItems.length}/6 mốc)</span>
          {model.scheduleItems.length < 6 ? (
            <button type="button" className="cfg-mini-btn" onClick={addSlot}>
              + Thêm mốc
            </button>
          ) : null}
        </div>
        {model.scheduleItems.length === 0 ? (
          <small className="cfg-sub-label">Chưa có mốc lịch trình nào — bấm “+ Thêm mốc” để thêm.</small>
        ) : (
          <div className="cfg-schedule-rows">
            {model.scheduleItems.map((slot, idx) => (
              <div key={idx} className="cfg-schedule-row is-removable">
                <input
                  className="cfg-input cfg-time-input"
                  value={slot.time}
                  placeholder="18:00"
                  onChange={(e) => updateSlot(idx, 'time', e.target.value)}
                />
                <input
                  className="cfg-input"
                  value={slot.label}
                  placeholder="Tên hoạt động"
                  onChange={(e) => updateSlot(idx, 'label', e.target.value)}
                />
                <button
                  type="button"
                  className="cfg-remove-slot-btn"
                  onClick={() => removeSlot(idx)}
                  aria-label="Xóa mốc lịch trình"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
