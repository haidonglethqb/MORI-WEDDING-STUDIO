import { createHash, randomBytes } from 'node:crypto'

export function createSessionToken(): { token: string; digest: string } {
  const token = randomBytes(32).toString('base64url')
  return { token, digest: digestToken(token) }
}

export function digestToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
