import { getPrismaClient } from '@mori/database'

type Tx = Parameters<Parameters<ReturnType<typeof getPrismaClient>['$transaction']>[0]>[0]

export async function markScheduleReconfirmation(tx: Tx, eventId: string): Promise<void> {
  await tx.rsvpEventAnswer.updateMany({
    where: { eventId },
    data: { needsReconfirmation: true },
  })
}
