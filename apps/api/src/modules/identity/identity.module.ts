import { Module } from '@nestjs/common'
import { ACCOUNT_MAIL, LoggingAccountMail, type AccountMail } from './account-mail.js'
import { SmtpAccountMail } from './smtp-account-mail.js'
import { AccountRecoveryService } from './account-recovery.service.js'
import { AddressBookController } from './address-book.controller.js'
import { AddressBookService } from './address-book.service.js'
import { IdentityController, MeController } from './identity.controller.js'
import { IdentityService } from './identity.service.js'

@Module({
  controllers: [IdentityController, MeController, AddressBookController],
  providers: [
    IdentityService,
    AccountRecoveryService,
    AddressBookService,
    {
      provide: ACCOUNT_MAIL,
      useFactory: (): AccountMail => {
        const host = process.env['SMTP_HOST']
        if (!host) {
          if (process.env['NODE_ENV'] === 'production' || process.env['APP_ENV'] === 'production') {
            throw new Error('SMTP_HOST configuration is required in production environment')
          }
          return new LoggingAccountMail()
        }
        const port = Number(process.env['SMTP_PORT'] ?? '1025')
        const user = process.env['SMTP_USER'] ?? ''
        const password = process.env['SMTP_PASSWORD'] ?? ''
        const from = process.env['SMTP_FROM'] ?? user
        const secureValue = process.env['SMTP_SECURE']
        const secure = secureValue ? parseBoolean(secureValue) : port === 465
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
          throw new Error('SMTP_PORT must be a valid TCP port')
        }
        if (!user || !password || !from) {
          throw new Error('SMTP_USER, SMTP_PASSWORD, and SMTP_FROM are required when SMTP is enabled')
        }
        if (!secure && port === 465) {
          throw new Error('SMTP port 465 requires implicit TLS (SMTP_SECURE=true)')
        }
        return new SmtpAccountMail({ host, port, secure, user, password, from })
      },
    },
  ],
  exports: [IdentityService],
})
export class IdentityModule {}

function parseBoolean(value: string): boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error('SMTP_SECURE must be true or false')
}
