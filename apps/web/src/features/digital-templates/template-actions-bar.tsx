'use client'

import { useEffect, useState } from 'react'
import { MoriIcon } from '../../components/mori-icon'
import { computeCountdown } from './template-view-utils'

interface TemplateCountdownProps {
  targetMs: number
  variant: 'vogue' | 'palace' | 'botanical'
}

export function TemplateCountdown({ targetMs, variant }: TemplateCountdownProps) {
  const [nowMs, setNowMs] = useState<number>(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  const { days, hours, minutes } = computeCountdown(targetMs, nowMs)

  return (
    <div className={`tpl-countdown tpl-countdown--${variant}`} aria-label="Đếm ngược ngày cưới">
      <div className="tpl-count-unit">
        <strong>{days}</strong>
        <small>{variant === 'vogue' ? 'DAYS' : 'NGÀY'}</small>
      </div>
      <span className="tpl-count-sep">:</span>
      <div className="tpl-count-unit">
        <strong>{hours}</strong>
        <small>{variant === 'vogue' ? 'HOURS' : 'GIỜ'}</small>
      </div>
      <span className="tpl-count-sep">:</span>
      <div className="tpl-count-unit">
        <strong>{minutes}</strong>
        <small>{variant === 'vogue' ? 'MINS' : 'PHÚT'}</small>
      </div>
    </div>
  )
}

interface TemplateUtilityRowProps {
  showMapButton: boolean
  mapHref: string
  calendarHref?: string | undefined
  showAudio: boolean
}

export function TemplateUtilityRow({
  showMapButton,
  mapHref,
  calendarHref,
  showAudio,
}: TemplateUtilityRowProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="tpl-utility-stack">
      {(showMapButton || calendarHref) ? (
        <div className="tpl-action-links">
          {showMapButton ? (
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="tpl-action-btn"
            >
              <MoriIcon name="map-pin" />
              <span>Chỉ đường Google Maps</span>
            </a>
          ) : null}
          {calendarHref ? (
            <a href={calendarHref} className="tpl-action-btn tpl-action-btn--outline">
              <MoriIcon name="calendar" />
              <span>Lưu lịch (.ics)</span>
            </a>
          ) : null}
        </div>
      ) : null}

      {showAudio ? (
        <button
          type="button"
          onClick={() => setPlaying((prev) => !prev)}
          className="tpl-audio-pill"
          aria-pressed={playing}
        >
          <span className="tpl-audio-icon">{playing ? '❚❚' : '▶'}</span>
          <span className="tpl-audio-meta">
            <strong>Canon in D · Acoustic Atelier</strong>
            <small>{playing ? 'Đang phát giai điệu lễ cưới' : 'Chạm để bật nhạc nền'}</small>
          </span>
          <span className={`tpl-audio-bars ${playing ? 'is-playing' : ''}`} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>
      ) : null}
    </div>
  )
}
