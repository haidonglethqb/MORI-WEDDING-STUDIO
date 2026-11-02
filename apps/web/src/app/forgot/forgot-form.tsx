'use client'

import { useState } from 'react'

export function ForgotForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('Nhập email của tài khoản.')

  async function submit() {
    setStatus('Đang gửi')
    const response = await fetch('/forgot/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    setStatus(
      response.ok
        ? 'Nếu email có tài khoản, mã đặt lại mật khẩu sẽ được gửi.'
        : 'Chưa gửi được yêu cầu.',
    )
  }

  return (
    <form
      className="login"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <h1>Quên mật khẩu</h1>
      <label>
        Email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <button type="submit">Gửi mã</button>
      <p>{status}</p>
      <p>
        <a href="/reset">Đặt mật khẩu mới</a>
      </p>
    </form>
  )
}
