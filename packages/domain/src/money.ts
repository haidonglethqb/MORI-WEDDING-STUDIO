/** Integer VND. JSON uses decimal strings; never floating point. */

const VND_PATTERN = /^(0|[1-9][0-9]*)$/
export const MAX_ORDER_VND = 1_000_000_000n

export function parseVnd(amount: string): bigint {
  if (!VND_PATTERN.test(amount)) {
    throw new Error('VND amount must be a non-negative integer decimal string')
  }
  const value = BigInt(amount)
  if (value > MAX_ORDER_VND) {
    throw new Error('VND amount exceeds the configured maximum')
  }
  return value
}

export function formatVnd(amount: bigint): string {
  if (amount < 0n || amount > MAX_ORDER_VND) {
    throw new Error('VND amount is outside the allowed range')
  }
  return amount.toString()
}
