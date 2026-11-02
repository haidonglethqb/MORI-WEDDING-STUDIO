import { afterAll, describe, expect, it } from 'vitest'
import { getPrismaClient, disconnectPrismaClient } from '@mori/database'
import { IdentityService } from './identity.service.js'

const email = `p01-${Date.now()}@example.com`
const password = 'correct horse battery'

describe('IdentityService', () => {
  const service = new IdentityService()

  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('registers once, hides a duplicate, and opens a session', async () => {
    const first = await service.register({
      email,
      displayName: 'Mai An',
      password,
    })
    const second = await service.register({
      email: email.toUpperCase(),
      displayName: 'Other',
      password,
    })
    expect(first.accepted).toBe(true)
    expect(second.accepted).toBe(true)

    const prisma = getPrismaClient()
    const users = await prisma.user.count({ where: { normalizedEmail: email } })
    expect(users).toBe(1)

    const login = await service.login({ email, password })
    const me = await service.currentUser(login.sessionToken)
    expect(me.email).toBe(email)
    expect(me.displayName).toBe('Mai An')
  })
})
