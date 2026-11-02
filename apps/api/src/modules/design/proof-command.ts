import { UnprocessableEntityException } from '@nestjs/common'
import { ApproveProofSchema } from '@mori/contracts'
import { ProofService } from './proof.service.js'

const proofs = new ProofService()

export async function approveProofCommand(
  actorUserId: string,
  revisionId: string,
  body: unknown,
): Promise<void> {
  const parsed = ApproveProofSchema.safeParse(body)
  if (!parsed.success) {
    throw new UnprocessableEntityException('This command has fields that are not allowed')
  }
  await proofs.approve({
    actorUserId,
    revisionId,
    manifestHash: parsed.data.manifestHash,
    scopeFingerprint: parsed.data.scopeFingerprint,
    acknowledgementVersion: parsed.data.acknowledgementVersion,
    acknowledgement: parsed.data.acknowledgement,
  })
}
