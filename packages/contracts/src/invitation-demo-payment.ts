import { z } from 'zod'
import { StorefrontPaymentMethodSchema } from './storefront.js'

export const ConfirmInvitationDemoPaymentSchema = z.strictObject({
  method: StorefrontPaymentMethodSchema.exclude(['COD']),
})

export type ConfirmInvitationDemoPayment = z.infer<typeof ConfirmInvitationDemoPaymentSchema>

export interface InvitationDemoPaymentDetails {
  amountVnd: string
  isFixture: true
  method: ConfirmInvitationDemoPayment['method'] | null
}
