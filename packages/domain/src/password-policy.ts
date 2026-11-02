const MIN_LENGTH = 15
const MAX_LENGTH = 128

const BLOCKED = new Set([
  'passwordpassword',
  'changemeplease1',
  'qwertyuiopasdfg',
])

export function assertPasswordAcceptable(password: string): void {
  if (password.length < MIN_LENGTH || password.length > MAX_LENGTH) {
    throw new Error('Password must be 15 to 128 characters')
  }
  if (BLOCKED.has(password.toLowerCase())) {
    throw new Error('Password is too common')
  }
}
