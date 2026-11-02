'use client'

import { useState } from 'react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('Nhập email và mật khẩu.')

  async function submit() {
    setStatus('Đang đăng nhập')
    const response = await fetch('/login/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (response.status === 401) {
      setStatus('Email hoặc mật khẩu không đúng.')
      return
    }
    if (!response.ok) {
      setStatus('Chưa đăng nhập được.')
      return
    }
    const body = (await response.json()) as { user?: { displayName?: string } }
    setStatus(`Đã đăng nhập${body.user?.displayName ? `, ${body.user.displayName}` : ''}.`)
  }

  return (
    <form
      className="login"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <h1>Tài khoản</h1>
      <label>
        Email
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        Mật khẩu
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button type="submit">Đăng nhập</button>
      <p>{status}</p>
      <p>
        <a href="/forgot">Quên mật khẩu</a>
      </p>
      <p>
        <a href="/register">Tạo tài khoản</a>
      </p>
    </form>
  )
}
