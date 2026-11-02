import { BadRequestException, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { assertPasswordAcceptable, normalizeEmail } from '@mori/domain'
import { ACCOUNT_MAIL, type AccountMail } from './account-mail.js'
import { consumeAuthToken } from './consume-auth-token.js'
import { hashPassword } from './password.js'
import { createSessionToken, digestToken } from './session-token.js'

const TOKEN_TTL_MS = 30 * 60 * 1000

@Injectable()
export class AccountRecoveryService {
  constructor(@Inject(ACCOUNT_MAIL) private readonly mail: AccountMail) {}

  async verifyEmail(token: string): Promise<{ verified: true }> {
    const prisma = getPrismaClient()
    const userId = await consumeAuthToken(prisma, digestToken(token), 'EMAIL_VERIFICATION')
    if (!userId) throw new BadRequestException('This link is invalid or expired')
    await prisma.user.update({
      where: { id: userId },
      data: { verifiedAt: new Date(), status: 'ACTIVE' },
    })
    return { verified: true }
  }

  async resendVerification(emailInput: string): Promise<{ accepted: true }> {
    const email = normalizeEmail(emailInput)
    const prisma = getPrismaClient()
    const user = await prisma.user.findUnique({ where: { normalizedEmail: email } })
    if (!user || user.verifiedAt) return { accepted: true }
    const recent = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM auth_tokens
      WHERE "userId" = ${user.id}::uuid
        AND purpose::text = 'EMAIL_VERIFICATION'
        AND "usedAt" IS NULL
        AND "createdAt" > NOW() - interval '60 seconds'
    `
    if (recent[0]) return { accepted: true }
    const { token } = createSessionToken()
    await prisma.authToken.create({
      data: {
        digest: digestToken(token),
        userId: user.id,
        purpose: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    })
    await this.mail.sendVerification({ userId: user.id, email, token })
    return { accepted: true }
  }

  async forgotPassword(emailInput: string): Promise<{ accepted: true }> {
    const email = normalizeEmail(emailInput)
    const prisma = getPrismaClient()
    const user = await prisma.user.findUnique({ where: { normalizedEmail: email } })
    if (!user) return { accepted: true }
    const { token } = createSessionToken()
    await prisma.authToken.create({
      data: {
        digest: digestToken(token),
        userId: user.id,
        purpose: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    })
    await this.mail.sendPasswordReset({ userId: user.id, email, token })
    return { accepted: true }
  }

  async resetPassword(token: string, password: string): Promise<{ reset: true }> {
    try {
      assertPasswordAcceptable(password)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password is not acceptable'
      throw new UnprocessableEntityException(message)
    }
    const prisma = getPrismaClient()
    const now = new Date()
    const userId = await consumeAuthToken(prisma, digestToken(token), 'PASSWORD_RESET')
    if (!userId) throw new BadRequestException('This link is invalid or expired')
    const passwordHash = await hashPassword(password)
    await prisma.$transaction([
      prisma.credential.update({ where: { userId }, data: { passwordHash, passwordChangedAt: now } }),
      prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now } }),
    ])
    return { reset: true }
  }
}
