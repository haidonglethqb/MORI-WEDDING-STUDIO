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
        return new SmtpAccountMail({ host, port, from: 'noreply@mori.localhost' })
      },
    },
  ],
  exports: [IdentityService],
})
export class IdentityModule {}
