import { z } from 'zod'

const confirmed = z.literal(true)

export const ApproveProofSchema = z
  .object({
    manifestHash: z.string().trim().min(1).max(200),
    scopeFingerprint: z.string().trim().min(1).max(200),
    acknowledgementVersion: z.string().trim().min(1).max(40),
    acknowledgement: z
      .object({
        names: confirmed,
        dates: confirmed,
        venues: confirmed,
        quantitySpec: confirmed,
        screenColour: confirmed,
        version: confirmed,
      })
      .strict(),
  })
  .strict()

export type ApproveProof = z.infer<typeof ApproveProofSchema>
