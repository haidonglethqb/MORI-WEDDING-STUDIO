import { ConflictException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

type Tx = Parameters<Parameters<ReturnType<typeof getPrismaClient>['$transaction']>[0]>[0]

export async function acceptedProofId(tx: Tx, requestId: string): Promise<string> {
  const revision = await tx.designRevision.findFirst({
    where: { requestId, state: 'APPROVED', approval: { isNot: null } },
    include: { approval: true },
    orderBy: { sequence: 'desc' },
  })
  if (!revision?.approval || revision.approval.manifestHash !== revision.manifestHash) {
    throw new ConflictException('An approved proof is required')
  }
  return revision.id
}
