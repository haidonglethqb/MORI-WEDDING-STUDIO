import { afterAll, describe, expect, it } from 'vitest'
import { ForbiddenException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { IdentityService } from '../modules/identity/identity.service.js'
import { assertMutationOrigin } from './origin-guard.js'

const email = `origin-login-${Date.now()}@example.com`
const password = 'correct horse battery'

describe('login origin', () => {
  const identity = new IdentityService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('refuses a foreign origin before opening a session', async () => {
    const prisma = getPrismaClient()
    await identity.register({ email, displayName: 'Mai An', password })
    const user = await prisma.user.findUniqueOrThrow({ where: { normalizedEmail: email } })

    await expect(run('https://evil.example', () => identity.login({ email, password }))).rejects.toBeInstanceOf(
      ForbiddenException,
    )
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0)

    const login = await run('http://app.mori.localhost', () => identity.login({ email, password }))
    expect(login.user.email).toBe(email)
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(1)
  })
})

async function run<T>(origin: string | undefined, action: () => Promise<T>): Promise<T> {
  assertMutationOrigin(origin)
  return action()
}
