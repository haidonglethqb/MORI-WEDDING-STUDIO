import { describe, expect, it } from 'vitest'
import { SmtpAccountMail } from './smtp-account-mail.js'

describe('SmtpAccountMail', () => {
  it('delivers a verification message to Mailpit without the token in the subject', async () => {
    const token = `verify-${Date.now()}`
    const email = `mail-${Date.now()}@example.com`
    const mail = new SmtpAccountMail({
      host: '127.0.0.1',
      port: 1025,
      from: 'noreply@mori.localhost',
    })
    await mail.sendVerification({ userId: 'user', email, token })

    const listed = await fetch('http://127.0.0.1:8025/api/v1/search?query=' + encodeURIComponent(email))
    expect(listed.ok).toBe(true)
    const body = (await listed.json()) as {
      messages: { ID: string; Subject: string }[]
    }
    const message = body.messages[0]
    expect(message?.Subject).toBe('Confirm your MORI account')
    expect(message?.Subject.includes(token)).toBe(false)

    const raw = await fetch(`http://127.0.0.1:8025/api/v1/message/${message?.ID}`)
    const detail = (await raw.json()) as { Text: string }
    expect(detail.Text).toContain(token)
  })
})
