import { afterAll, describe, expect, it } from 'vitest'
import { UnauthorizedException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { IdentityService } from './identity.service.js'
import { createSessionToken } from './session-token.js'

const email = `session-expiry-${Date.now()}@example.com`

describe('session expiry', () => {
  const identity = new IdentityService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('rejects a session when the database says it has expired', async () => {
    const prisma = getPrismaClient()
    const user = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Mai An', status: 'ACTIVE' },
    })
    const { token, digest } = createSessionToken()
    const session = await prisma.session.create({
      data: {
        tokenDigest: digest,
        userId: user.id,
        idleExpiresAt: new Date('2099-01-01T00:00:00.000Z'),
        absoluteExpiresAt: new Date('2099-01-01T00:00:00.000Z'),
      },
    })

    await prisma.$executeRaw`
      UPDATE sessions SET "idleExpiresAt" = NOW() - interval '1 second' WHERE id = ${session.id}::uuid
    `
    await expect(identity.currentUser(token)).rejects.toBeInstanceOf(UnauthorizedException)

    await prisma.$executeRaw`
      UPDATE sessions
      SET "idleExpiresAt" = NOW() + interval '1 day',
          "absoluteExpiresAt" = NOW() - interval '1 second'
      WHERE id = ${session.id}::uuid
    `
    await expect(identity.currentUser(token)).rejects.toBeInstanceOf(UnauthorizedException)

    await prisma.$executeRaw`
      UPDATE sessions
      SET "idleExpiresAt" = NOW() + interval '1 day',
          "absoluteExpiresAt" = NOW() + interval '30 days'
      WHERE id = ${session.id}::uuid
    `
    expect((await identity.currentUser(token)).email).toBe(email)
    const stored = await prisma.session.findUniqueOrThrow({ where: { id: session.id } })
    expect(stored.idleExpiresAt.getTime()).toBeGreaterThan(Date.now() + 6 * 24 * 60 * 60 * 1000)
  })
})