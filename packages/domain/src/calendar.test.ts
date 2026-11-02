import { describe, expect, it } from 'vitest'
import { buildEventCalendar } from './calendar.js'

const input = {
  uid: 'event-1@mori',
  sequence: 2,
  title: 'Lễ, cưới\nMai',
  localStart: '20261101T180000',
  timeZone: 'Asia/Ho_Chi_Minh',
}

describe('buildEventCalendar', () => {
  it('escapes summary text and keeps a stable uid', () => {
    const file = buildEventCalendar(input)
    expect(file).toContain('UID:event-1@mori')
    expect(file).toContain('SEQUENCE:2')
    expect(file).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20261101T180000')
    expect(file).toContain('SUMMARY:Lễ\\, cưới\\nMai')
    expect(file.endsWith('\r\n')).toBe(true)
    expect(buildEventCalendar({ ...input, sequence: 3 })).toContain('UID:event-1@mori')
  })
})
