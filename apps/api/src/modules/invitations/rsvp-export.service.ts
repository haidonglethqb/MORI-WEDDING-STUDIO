import { Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { RsvpListService, type ListedRsvp } from './rsvp-list.service.js'

@Injectable()
export class RsvpExportService {
  constructor(private readonly lists: RsvpListService) {}

  async exportCsv(actorUserId: string, invitationId: string): Promise<string> {
    const rows = await this.lists.list(actorUserId, invitationId)
    await getPrismaClient().rsvpExportAudit.create({
      data: { invitationId, actorUserId, rowCount: rows.length },
    })
    return toCsv(rows)
  }
}

function toCsv(rows: ListedRsvp[]): string {
  const lines = ['partyName,status,attendeeCount']
  for (const row of rows) {
    lines.push(`${csvCell(row.partyName)},${csvCell(row.status)},${row.attendeeCount}`)
  }
  return lines.join('\n')
}

function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  if (!/[",\n\r]/.test(safe)) return safe
  return `"${safe.replaceAll('"', '""')}"`
}
