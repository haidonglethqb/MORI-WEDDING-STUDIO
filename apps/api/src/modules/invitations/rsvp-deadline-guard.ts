import { ConflictException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

type Tx = Parameters<Parameters<ReturnType<typeof getPrismaClient>['$transaction']>[0]>[0]

const LOCAL_START = /^\d{8}T\d{6}$/
const TIME_ZONE = /^[A-Za-z_]+(?:\/[A-Za-z_]+)+$/

export async function assertDeadlineBeforeEvent(
  tx: Tx,
  invitationId: string,
  localStart: string | null,
  timeZone: string | null,
): Promise<void> {
  if (!localStart || !timeZone) return
  if (!LOCAL_START.test(localStart) || !TIME_ZONE.test(timeZone)) {
    throw new ConflictException('The event schedule cannot be used for an RSVP deadline')
  }
  const rows = await tx.$queryRaw<{ mode: string; hasDeadline: boolean; beforeStart: boolean | null }[]>`
    SELECT "rsvpMode"::text AS mode,
           ("rsvpDeadlineAt" IS NOT NULL) AS "hasDeadline",
           CASE
             WHEN "rsvpDeadlineAt" IS NULL THEN NULL
             ELSE "rsvpDeadlineAt" < (
               to_timestamp(${localStart}, 'YYYYMMDD"T"HH24MISS') AT TIME ZONE ${timeZone}
             )
           END AS "beforeStart"
    FROM invitations
    WHERE id = ${invitationId}::uuid
  `
  const row = rows[0]
  if (!row || row.mode === 'OFF' || !row.hasDeadline) return
  if (!row.beforeStart) {
    throw new ConflictException('Move the RSVP deadline before the event, or turn RSVP off, before publishing')
  }
}
