'use client'

import type { ReactNode } from 'react'
import { MoriIcon } from '../../../components/mori-icon'
import { InvitationCalendarAction } from './invitation-calendar-action'

interface DigitalViewProps {
  slug: string
  displayNames: [string, string]
  eventTitle: string
  greeting: string | null
  eventLocalStart?: string | undefined
  timeZone?: string | undefined
  partyName?: string | null
  rsvpSection?: ReactNode
}

function formatEventDate(value: string, timeZone: string): string | null {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day, hour, minute] = match
  if (!year || !month || !day || !hour || !minute) return null
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  const dateText = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(date)
  return `${dateText} · ${hour}:${minute} (${timeZone})`
}

export function DigitalInvitationView({
  slug,
  displayNames,
  eventTitle,
  greeting,
  eventLocalStart,
  timeZone,
  partyName,
  rsvpSection,
}: DigitalViewProps) {
  const eventDate = eventLocalStart && timeZone ? formatEventDate(eventLocalStart, timeZone) : null

  return (
    <div className="digital-invitation-stage">
      <article className="public-invitation-card">
        <div className="public-invitation-border" aria-hidden="true" />
        <span className="public-invitation-kicker">THIỆP MỜI</span>
        <MoriIcon className="public-invitation-mark" name="heart" />

        {partyName ? (
          <p className="public-invitation-guest">Trân trọng kính mời <strong>{partyName}</strong></p>
        ) : null}

        <h1 className="public-invitation-names">
          <span>{displayNames[0]}</span>
          <span className="public-invitation-amp">&amp;</span>
          <span>{displayNames[1]}</span>
        </h1>
        <span className="public-invitation-rule" aria-hidden="true" />
        <p className="public-invitation-event">{eventTitle}</p>

        {eventDate ? (
          <time className="public-invitation-date" dateTime={eventLocalStart ?? undefined}>
            <MoriIcon name="calendar" /> {eventDate}
          </time>
        ) : null}

        {greeting ? <blockquote className="public-invitation-greeting">{greeting}</blockquote> : null}
        {!greeting ? <p className="public-invitation-note">Rất mong được đón tiếp bạn trong ngày vui.</p> : null}

        {eventDate ? <InvitationCalendarAction href={`/i/${encodeURIComponent(slug)}/calendar`} /> : null}
      </article>
      {rsvpSection}
    </div>
  )
}
