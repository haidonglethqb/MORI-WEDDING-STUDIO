import { afterAll, describe, expect, it } from 'vitest'
import { BadRequestException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { AccountRecoveryService } from './account-recovery.service.js'
import { LoggingAccountMail } from './account-mail.js'
import { createSessionToken } from './session-token.js'

const email = `token-expiry-${Date.now()}@example.com`

describe('auth token expiry', () => {
  const recovery = new AccountRecoveryService(new LoggingAccountMail())

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('rejects an expired or wrong-purpose token and accepts one use', async () => {
    const prisma = getPrismaClient()
    const user = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Mai An', status: 'PENDING_VERIFICATION' },
    })
    const verification = createSessionToken()
    const reset = createSessionToken()
    const verifyRow = await prisma.authToken.create({
      data: {
        digest: verification.digest,
        userId: user.id,
        purpose: 'EMAIL_VERIFICATION',
        expiresAt: new Date('2099-01-01T00:00:00.000Z'),
      },
    })
    await prisma.authToken.create({
      data: {
        digest: reset.digest,
        userId: user.id,
        purpose: 'PASSWORD_RESET',
        expiresAt: new Date('2099-01-01T00:00:00.000Z'),
      },
    })
    await prisma.$executeRaw`
      UPDATE auth_tokens SET "expiresAt" = NOW() - interval '1 second' WHERE id = ${verifyRow.id}::uuid
    `

    await expect(recovery.verifyEmail(verification.token)).rejects.toBeInstanceOf(BadRequestException)
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).status).toBe('PENDING_VERIFICATION')
    expect((await prisma.authToken.findUniqueOrThrow({ where: { id: verifyRow.id } })).usedAt).toBeNull()

    await prisma.$executeRaw`
      UPDATE auth_tokens SET "expiresAt" = NOW() + interval '30 minutes' WHERE id = ${verifyRow.id}::uuid
    `
    await expect(recovery.verifyEmail(reset.token)).rejects.toBeInstanceOf(BadRequestException)
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).status).toBe('PENDING_VERIFICATION')

    await recovery.verifyEmail(verification.token)
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).status).toBe('ACTIVE')
    expect((await prisma.authToken.findUniqueOrThrow({ where: { id: verifyRow.id } })).usedAt).toBeTruthy()
    await expect(recovery.verifyEmail(verification.token)).rejects.toBeInstanceOf(BadRequestException)
  })
})