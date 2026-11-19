import type { CSSProperties } from 'react'
import type { InvitationContent } from '@mori/contracts'
import type { DigitalInvitationModel, PalettePreset } from './digital-template-types'

export interface ParsedEventDate {
  year: number
  month: number
  day: number
  hour: string
  minute: string
  viDateLine: string
  shortDotDate: string
  romanDateLine: string
  targetMs: number
}

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

function toRomanYear(num: number): string {
  const table: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let rem = num
  let out = ''
  for (const [val, sym] of table) {
    while (rem >= val) {
      out += sym
      rem -= val
    }
  }
  return out
}

function toRomanDay(num: number): string {
  return num >= 1 && num <= 31 ? toRomanYear(num) : String(num)
}

export function parseEventDate(eventLocalStart: string): ParsedEventDate | null {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(eventLocalStart)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = match[4] ?? '18'
  const minute = match[5] ?? '00'
  const utcDate = new Date(Date.UTC(year, month - 1, day, Number(hour), Number(minute), 0))
  if (Number.isNaN(utcDate.getTime())) return null

  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'UTC' }).format(utcDate)
  const monthLabel = String(month).padStart(2, '0')
  const dayLabel = String(day).padStart(2, '0')
  const romanMonth = ROMAN_MONTHS[month - 1] ?? monthLabel

  return {
    year,
    month,
    day,
    hour,
    minute,
    viDateLine: `${weekday} · ${dayLabel} Tháng ${monthLabel}, ${year}`,
    shortDotDate: `${dayLabel}.${monthLabel}.${year}`,
    romanDateLine: `${toRomanDay(day)} · ${romanMonth} · ${toRomanYear(year)}`,
    targetMs: Date.UTC(year, month - 1, day, Number(hour), Number(minute), 0) - 7 * 3600 * 1000,
  }
}

export function computeCountdown(targetMs: number, nowMs: number) {
  const diff = Math.max(0, targetMs - nowMs)
  const totalMinutes = Math.floor(diff / 60_000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
  }
}

export function resolveGoogleMapsHref(mapUrl: string, venueName: string, venueAddress: string): string {
  const clean = mapUrl.trim()
  if (clean.startsWith('https://') || clean.startsWith('http://')) return clean
  const query = [venueName, venueAddress].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'Vietnam')}`
}

export function coupleInitials(names: [string, string]): string {
  const first = names[0].trim().split(/\s+/).pop()?.[0] ?? 'M'
  const second = names[1].trim().split(/\s+/).pop()?.[0] ?? 'Q'
  return `${first.toUpperCase()} & ${second.toUpperCase()}`
}

export function buildPaletteVars(palette: PalettePreset): CSSProperties {
  return {
    '--tpl-bg': palette.bg,
    '--tpl-surface': palette.surface,
    '--tpl-text': palette.text,
    '--tpl-muted': palette.muted,
    '--tpl-accent': palette.accent,
    '--tpl-border': palette.border,
    '--tpl-btn-text': palette.buttonText,
  } as CSSProperties
}

export function toInvitationContentPayload(model: DigitalInvitationModel): InvitationContent {
  const first = model.displayNames[0].trim() || 'Tên một'
  const second = model.displayNames[1].trim() || 'Tên hai'
  const eventTitle = model.eventTitle.trim() || 'Lễ cưới'
  const cleanGallery = model.photos.galleryUrls.map((u) => u.trim()).filter(Boolean).slice(0, 4)
  const cleanHero = model.photos.heroUrl.trim()
  const cleanStory = model.photos.storyCaption.trim()
  const cleanMap = model.mapUrl.trim()

  return {
    schemaVersion: 1,
    displayNames: [first, second],
    eventTitle,
    ...(model.greeting.trim() ? { greeting: model.greeting.trim() } : {}),
    ...(model.eventLocalStart ? { eventLocalStart: model.eventLocalStart } : {}),
    ...(model.timeZone ? { timeZone: model.timeZone } : {}),
    templateId: model.templateId,
    coupleRoles: [model.coupleRoles[0].trim(), model.coupleRoles[1].trim()],
    families: {
      groomParents: model.families.groomParents.trim(),
      groomOrigin: model.families.groomOrigin.trim(),
      brideParents: model.families.brideParents.trim(),
      brideOrigin: model.families.brideOrigin.trim(),
    },
    ...(model.lunarDate.trim() ? { lunarDate: model.lunarDate.trim() } : {}),
    ...(model.venueName.trim() ? { venueName: model.venueName.trim() } : {}),
    ...(model.venueAddress.trim() ? { venueAddress: model.venueAddress.trim() } : {}),
    ...(cleanMap ? { mapUrl: cleanMap } : {}),
    scheduleItems: model.scheduleItems.map((s) => ({ time: s.time.trim(), label: s.label.trim() })),
    photos: {
      ...(cleanHero ? { heroUrl: cleanHero } : {}),
      ...(cleanGallery.length > 0 ? { galleryUrls: cleanGallery } : {}),
      ...(cleanStory ? { storyCaption: cleanStory } : {}),
    },
    templateConfig: { ...model.templateConfig },
  }
}
