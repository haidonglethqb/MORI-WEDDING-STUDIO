import { UnprocessableEntityException } from '@nestjs/common'

export interface ProofAcknowledgement {
  names: boolean
  dates: boolean
  venues: boolean
  quantitySpec: boolean
  screenColour: boolean
  version: boolean
}

export function assertProofAcknowledgement(acknowledgement: ProofAcknowledgement): void {
  const complete =
    acknowledgement.names &&
    acknowledgement.dates &&
    acknowledgement.venues &&
    acknowledgement.quantitySpec &&
    acknowledgement.screenColour &&
    acknowledgement.version
  if (!complete) {
    throw new UnprocessableEntityException('Approval needs every acknowledgement')
  }
}
