'use client'

import { useState } from 'react'

export function VerifyForm() {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('Dán mã trong email xác nhận.')

  async function verify() {
    setStatus('Đang xác nhận')
    const response = await fetch('/verify/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: token.trim() }),
    })
    if (response.ok) {
      setStatus('Đã xác nhận. Bạn có thể đăng nhập.')
      return
    }
    setStatus(token.trim().length < 20 ? 'Mã chưa đủ dài.' : 'Mã không còn dùng được.')
  }

  async function resend() {
    setStatus('Đang gửi lại')
    const response = await fetch('/verify/resend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    setStatus(response.ok ? 'Nếu email còn chờ xác nhận, mã mới sẽ được gửi.' : 'Chưa gửi lại được.')
  }

  return (
    <div className="login">
      <h1>Xác nhận email</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void verify()
        }}
      >
        <label>
          Mã xác nhận
          <input value={token} onChange={(event) => setToken(event.target.value)} autoComplete="one-time-code" />
        </label>
        <button type="submit">Xác nhận</button>
      </form>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void resend()
        }}
      >
        <label>
          Gửi lại mã
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <button type="submit">Gửi lại</button>
      </form>
      <p>{status}</p>
      <p>
        <a href="/login">Đăng nhập</a>
      </p>
    </div>
  )
}
