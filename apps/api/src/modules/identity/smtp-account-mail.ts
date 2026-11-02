import { connect } from 'node:net'
import type { AccountMail, VerificationMail } from './account-mail.js'

export interface SmtpTarget {
  host: string
  port: number
  from: string
}

/** Sends account mail over SMTP. The token is in the body, never the subject. */
export class SmtpAccountMail implements AccountMail {
  constructor(private readonly target: SmtpTarget) {}

  sendVerification(message: VerificationMail): Promise<void> {
    return sendMessage(this.target, message, 'Confirm your MORI account', 'verification')
  }

  sendPasswordReset(message: VerificationMail): Promise<void> {
    return sendMessage(this.target, message, 'Reset your MORI password', 'password reset')
  }
}

function sendMessage(
  target: SmtpTarget,
  message: VerificationMail,
  subject: string,
  purpose: string,
): Promise<void> {
  const body = [
    `From: MORI <${target.from}>`,
    `To: ${message.email}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    `Use this ${purpose} token:`,
    message.token,
    '',
  ].join('\r\n')
  return smtpSend(target, message.email, body)
}

function smtpSend(target: SmtpTarget, to: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = connect(target.port, target.host)
    const steps = [
      `EHLO mori.localhost\r\n`,
      `MAIL FROM:<${target.from}>\r\n`,
      `RCPT TO:<${to}>\r\n`,
      `DATA\r\n`,
      `${data}\r\n.\r\n`,
      `QUIT\r\n`,
    ]
    let step = 0
    socket.on('error', reject)
    socket.on('data', () => {
      const next = steps[step]
      step += 1
      if (next) socket.write(next)
      if (step >= steps.length) {
        socket.end()
        resolve()
      }
    })
  })
}
