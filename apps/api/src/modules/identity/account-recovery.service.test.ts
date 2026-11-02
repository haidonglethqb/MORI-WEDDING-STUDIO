import { afterAll, describe, expect, it } from 'vitest'
import { UnauthorizedException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import type { AccountMail, VerificationMail } from './account-mail.js'
import { AccountRecoveryService } from './account-recovery.service.js'
import { IdentityService } from './identity.service.js'

const email = `p01-recover-${Date.now()}@example.com`
const password = 'correct horse battery'

class CapturingMail implements AccountMail {
  verification: VerificationMail | undefined
  reset: VerificationMail | undefined

  sendVerification(message: VerificationMail): Promise<void> {
    this.verification = message
    return Promise.resolve()
  }

  sendPasswordReset(message: VerificationMail): Promise<void> {
    this.reset = message
    return Promise.resolve()
  }
}

describe('account recovery', () => {
  const mail = new CapturingMail()
  const identity = new IdentityService(mail)
  const recovery = new AccountRecoveryService(mail)

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('verifies once, then a reset revokes the open session', async () => {
    await identity.register({ email, displayName: 'Mai An', password })
    const verificationToken = mail.verification?.token
    expect(verificationToken).toBeTruthy()

    await recovery.verifyEmail(verificationToken ?? '')
    await expect(recovery.verifyEmail(verificationToken ?? '')).rejects.toThrow(/invalid or expired/)

    const login = await identity.login({ email, password })
    expect((await identity.currentUser(login.sessionToken)).status).toBe('ACTIVE')

    await recovery.forgotPassword('nobody@example.com')
    await recovery.forgotPassword(email)
    const resetToken = mail.reset?.token
    expect(resetToken).toBeTruthy()

    const nextPassword = 'a different passphrase'
    await recovery.resetPassword(resetToken ?? '', nextPassword)
    await expect(identity.currentUser(login.sessionToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
    const again = await identity.login({ email, password: nextPassword })
    expect(again.user.email).toBe(email)
  })
})
