/** Account emails compare as NFKC, trimmed, lowercased. */

export function normalizeEmail(email: string): string {
  return email.normalize('NFKC').trim().toLowerCase()
}
