'use client'

import { useState } from 'react'

export function RegisterForm() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('Mật khẩu cần từ 15 đến 128 ký tự.')

  async function submit() {
    setStatus('Đang gửi')
    const response = await fetch('/register/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName, email, password }),
    })
    if (response.status === 400 || response.status === 422) {
      const body = (await response.json()) as { detail?: string; title?: string; violations?: { message: string }[] }
      const text = `${body.detail ?? ''} ${body.title ?? ''} ${(body.violations ?? []).map((item) => item.message).join(' ')}`
      if (text.includes('common')) {
        setStatus('Mật khẩu quá phổ biến.')
        return
      }
      if (text.includes('15') || text.includes('Too small') || text.includes('Too big')) {
        setStatus('Mật khẩu cần từ 15 đến 128 ký tự.')
        return
      }
      setStatus('Thông tin chưa hợp lệ.')
      return
    }
    if (!response.ok) {
      setStatus('Chưa tạo được tài khoản.')
      return
    }
    setStatus('Đã nhận yêu cầu. Kiểm tra email để xác nhận tài khoản.')
  }

  return (
    <form
      className="login"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <h1>Tạo tài khoản</h1>
      <label>
        Tên hiển thị
        <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
      </label>
      <label>
        Email
        <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Mật khẩu
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button type="submit">Tạo tài khoản</button>
      <p>{status}</p>
      <p>
        <a href="/verify">Nhập mã xác nhận</a>
      </p>
      <p>
        <a href="/login">Đã có tài khoản</a>
      </p>
    </form>
  )
}
