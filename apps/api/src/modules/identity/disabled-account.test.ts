import { afterAll, describe, expect, it } from 'vitest'
import { UnauthorizedException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { IdentityService } from './identity.service.js'

const email = `disabled-${Date.now()}@example.com`
const password = 'correct horse battery'

describe('disabled account', () => {
  const identity = new IdentityService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('stops an open session and refuses a new login', async () => {
    const prisma = getPrismaClient()
    await identity.register({ email, displayName: 'Mai An', password })
    const login = await identity.login({ email, password })
    expect((await identity.currentUser(login.sessionToken)).email).toBe(email)
    const user = await prisma.user.findUniqueOrThrow({ where: { normalizedEmail: email } })

    await prisma.user.update({ where: { id: user.id }, data: { status: 'DISABLED' } })

    await expect(identity.currentUser(login.sessionToken)).rejects.toBeInstanceOf(UnauthorizedException)
    await expect(identity.listSessions(login.sessionToken)).rejects.toBeInstanceOf(UnauthorizedException)
    await expect(identity.login({ email, password })).rejects.toBeInstanceOf(UnauthorizedException)
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(1)
  })
})