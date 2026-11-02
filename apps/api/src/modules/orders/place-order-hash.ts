import { createHash } from 'node:crypto'

export const PLACE_ORDER_COMMAND = 'place-order'

export function placeOrderHash(input: {
  requestId: string
  quoteId: string
  expectedVersion: number
  shippingAddressId?: string
}): string {
  const canonical = JSON.stringify({
    expectedVersion: input.expectedVersion,
    quoteId: input.quoteId,
    requestId: input.requestId,
    shippingAddressId: input.shippingAddressId ?? null,
  })
  return createHash('sha256').update(canonical).digest('hex')
}
