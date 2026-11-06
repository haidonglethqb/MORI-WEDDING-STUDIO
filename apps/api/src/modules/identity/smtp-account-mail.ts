import nodemailer from 'nodemailer'
import type { AccountMail, VerificationMail } from './account-mail.js'

export interface SmtpTarget {
  host: string
  port: number
  secure: boolean
  user?: string
  password?: string
  from: string
}

/** Sends account verification and password reset messages through authenticated SMTP. */
export class SmtpAccountMail implements AccountMail {
  private readonly transporter: ReturnType<typeof nodemailer.createTransport>

  constructor(private readonly target: SmtpTarget) {
    this.transporter = nodemailer.createTransport({
      host: target.host,
      port: target.port,
      secure: target.secure,
      requireTLS: !target.secure,
      auth: target.user && target.password
        ? { user: target.user, pass: target.password }
        : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    })
  }

  sendVerification(message: VerificationMail): Promise<void> {
    return this.sendMessage(message, 'Confirm your MORI account', 'account verification')
  }

  sendPasswordReset(message: VerificationMail): Promise<void> {
    return this.sendMessage(message, 'Reset your MORI password', 'password reset')
  }

  private async sendMessage(
    message: VerificationMail,
    subject: string,
    purpose: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: this.target.from,
      to: message.email,
      subject,
      text: `Use this ${purpose} token:\n\n${message.token}\n`,
    })
  }
}
