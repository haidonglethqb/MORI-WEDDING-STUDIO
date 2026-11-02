import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { AccountRecoveryService } from './account-recovery.service.js'
import { LoggingAccountMail } from './account-mail.js'
import { createSessionToken } from './session-token.js'

const email = `resend-${Date.now()}@example.com`

describe('resend verification', () => {
  const recovery = new AccountRecoveryService(new LoggingAccountMail())

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('waits 60 database seconds before issuing another verification token', async () => {
    const prisma = getPrismaClient()
    const user = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Mai An', status: 'PENDING_VERIFICATION' },
    })
    const first = createSessionToken()
    const token = await prisma.authToken.create({
      data: {
        digest: first.digest,
        userId: user.id,
        purpose: 'EMAIL_VERIFICATION',
        expiresAt: new Date('2099-01-01T00:00:00.000Z'),
      },
    })

    await recovery.resendVerification(email)
    expect(await prisma.authToken.count({ where: { userId: user.id, purpose: 'EMAIL_VERIFICATION' } })).toBe(1)

    await prisma.$executeRaw`
      UPDATE auth_tokens
      SET "createdAt" = NOW() - interval '2 minutes'
      WHERE id = ${token.id}::uuid
    `
    await recovery.resendVerification(email)
    expect(await prisma.authToken.count({ where: { userId: user.id, purpose: 'EMAIL_VERIFICATION' } })).toBe(2)

    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE', verifiedAt: new Date() },
    })
    await recovery.resendVerification(email)
    expect(await prisma.authToken.count({ where: { userId: user.id, purpose: 'EMAIL_VERIFICATION' } })).toBe(2)
  })
})