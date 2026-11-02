import {
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { assertPasswordAcceptable, normalizeEmail } from '@mori/domain'
import type { CurrentUser, LoginRequest, RegisterRequest } from '@mori/contracts'
import { ACCOUNT_MAIL, LoggingAccountMail, type AccountMail } from './account-mail.js'
import { hashPassword, verifyPassword } from './password.js'
import { createSessionToken, digestToken } from './session-token.js'

const CUSTOMER_IDLE_MS = 7 * 24 * 60 * 60 * 1000
const CUSTOMER_ABSOLUTE_MS = 30 * 24 * 60 * 60 * 1000
const TOKEN_TTL_MS = 30 * 60 * 1000

export interface RegisteredAccount {
  accepted: true
}

@Injectable()
export class IdentityService {
  private readonly mail: AccountMail

  constructor(@Optional() @Inject(ACCOUNT_MAIL) mail?: AccountMail) {
    this.mail = mail ?? new LoggingAccountMail()
  }

  async register(input: RegisterRequest): Promise<RegisteredAccount> {
    try {
      assertPasswordAcceptable(input.password)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password is not acceptable'
      throw new UnprocessableEntityException(message)
    }
    const email = normalizeEmail(input.email)
    const passwordHash = await hashPassword(input.password)
    const prisma = getPrismaClient()
    const existing = await prisma.user.findUnique({ where: { normalizedEmail: email } })
    if (existing) return { accepted: true }

    const { token } = createSessionToken()
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)
    const created = await prisma.user.create({
      data: {
        normalizedEmail: email,
        displayName: input.displayName.trim(),
        credential: { create: { passwordHash } },
        authTokens: {
          create: {
            digest: digestToken(token),
            purpose: 'EMAIL_VERIFICATION',
            expiresAt,
          },
        },
      },
    })
    await this.mail.sendVerification({ userId: created.id, email, token })
    return { accepted: true }
  }

  async login(input: LoginRequest): Promise<{ user: CurrentUser; sessionToken: string }> {
    const email = normalizeEmail(input.email)
    const prisma = getPrismaClient()
    const user = await prisma.user.findUnique({
      where: { normalizedEmail: email },
      include: { credential: true },
    })
    const passwordOk =
      user?.credential != null &&
      (await verifyPassword(user.credential.passwordHash, input.password))
    if (!user || !passwordOk || user.status === 'DISABLED') {
      throw new UnauthorizedException('Invalid email or password')
    }

    const now = Date.now()
    const { token, digest } = createSessionToken()
    await prisma.session.create({
      data: {
        tokenDigest: digest,
        userId: user.id,
        idleExpiresAt: new Date(now + CUSTOMER_IDLE_MS),
        absoluteExpiresAt: new Date(now + CUSTOMER_ABSOLUTE_MS),
      },
    })
    return { user: toCurrentUser(user), sessionToken: token }
  }

  async currentUser(sessionToken: string | undefined): Promise<CurrentUser> {
    if (!sessionToken) throw new UnauthorizedException('Authentication required')
    const prisma = getPrismaClient()
    const session = await prisma.session.findUnique({
      where: { tokenDigest: digestToken(sessionToken) },
      include: { user: true },
    })
    if (!session || session.user.status === 'DISABLED') {
      throw new UnauthorizedException('Authentication required')
    }
    const live = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM sessions
      WHERE id = ${session.id}::uuid
        AND "revokedAt" IS NULL
        AND "idleExpiresAt" > NOW()
        AND "absoluteExpiresAt" > NOW()
    `
    if (!live[0]) throw new UnauthorizedException('Authentication required')
    await prisma.$executeRaw`
      UPDATE sessions
      SET "idleExpiresAt" = NOW() + interval '7 days'
      WHERE id = ${session.id}::uuid
    `
    return toCurrentUser(session.user)
  }

  async logout(sessionToken: string | undefined): Promise<{ loggedOut: true }> {
    if (sessionToken) {
      await getPrismaClient().session.updateMany({
        where: { tokenDigest: digestToken(sessionToken), revokedAt: null },
        data: { revokedAt: new Date() },
      })
    }
    return { loggedOut: true }
  }

  async listSessions(sessionToken: string | undefined) {
    const user = await this.currentUser(sessionToken)
    const digest = digestToken(sessionToken ?? '')
    const sessions = await getPrismaClient().session.findMany({
      where: { userId: user.id, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    return sessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt.toISOString(),
      current: session.tokenDigest === digest,
    }))
  }

  async revokeSession(
    sessionToken: string | undefined,
    sessionId: string,
  ): Promise<{ revoked: true }> {
    const user = await this.currentUser(sessionToken)
    const revoked = await getPrismaClient().session.updateMany({
      where: { id: sessionId, userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    if (revoked.count !== 1) throw new NotFoundException()
    return { revoked: true }
  }
}

function toCurrentUser(user: {
  id: string
  normalizedEmail: string
  displayName: string
  role: 'CUSTOMER' | 'STUDIO' | 'ADMIN'
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'DISABLED'
}): CurrentUser {
  return {
    id: user.id,
    email: user.normalizedEmail,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
  }
}
