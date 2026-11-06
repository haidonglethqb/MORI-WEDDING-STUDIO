import { describe, expect, it } from 'vitest'
import { Socket } from 'node:net'
import { SmtpAccountMail } from './smtp-account-mail.js'

async function isPortReachable(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket()
    socket.setTimeout(300)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.once('error', () => {
      socket.destroy()
      resolve(false)
    })
    socket.connect(port, host)
  })
}

describe('SmtpAccountMail', () => {
  it('delivers a verification message to Mailpit without the token in the subject', async (ctx) => {
    const reachable = await isPortReachable(1025)
    if (!reachable) {
      ctx.skip()
      return
    }

    const token = `verify-${Date.now()}`
    const email = `mail-${Date.now()}@example.com`
    const mail = new SmtpAccountMail({
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      from: 'noreply@mori.localhost',
    })

    try {
      await mail.sendVerification({ userId: 'user', email, token })
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === 'ECONNREFUSED') {
        ctx.skip()
        return
      }
      throw err
    }

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
