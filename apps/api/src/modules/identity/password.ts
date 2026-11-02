import { hash, verify } from '@node-rs/argon2'

const ARGON = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON)
}

export function verifyPassword(hashed: string, password: string): Promise<boolean> {
  return verify(hashed, password, ARGON)
}
