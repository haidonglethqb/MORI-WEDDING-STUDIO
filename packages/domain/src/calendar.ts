export interface CalendarEventInput {
  uid: string
  sequence: number
  title: string
  localStart: string
  timeZone: string
}

export function buildEventCalendar(input: CalendarEventInput): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MORI//Wedding//EN',
    'BEGIN:VEVENT',
    `UID:${escapeText(input.uid)}`,
    `SEQUENCE:${input.sequence}`,
    `DTSTART;TZID=${input.timeZone}:${input.localStart}`,
    `SUMMARY:${escapeText(input.title)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

export function escapeText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\n', '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
}

function foldLine(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  let rest = line
  parts.push(rest.slice(0, 75))
  rest = rest.slice(75)
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 74)}`)
    rest = rest.slice(74)
  }
  return parts.join('\r\n')
}
