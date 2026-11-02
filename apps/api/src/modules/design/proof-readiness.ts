import { ConflictException } from '@nestjs/common'

export function assertProofReady(revision: { renderState: string; faceMapComplete: boolean }): void {
  if (revision.renderState !== 'READY' || !revision.faceMapComplete) {
    throw new ConflictException({
      code: 'PROOF_NOT_READY',
      message: 'This proof is not ready for review',
    })
  }
}
