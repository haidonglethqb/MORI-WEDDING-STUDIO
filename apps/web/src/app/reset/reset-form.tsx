'use client'

import { useState } from 'react'

export function ResetForm() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('Dán mã trong email và chọn mật khẩu mới.')

  async function submit() {
    setStatus('Đang đặt lại')
    const response = await fetch('/reset/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: token.trim(), password }),
    })
    if (response.ok) {
      setStatus('Đã đặt mật khẩu mới. Các phiên cũ đã đóng.')
      return
    }
    if (response.status === 400 || response.status === 422) {
      const body = (await response.json()) as { title?: string; violations?: { message: string }[] }
      const text = `${body.title ?? ''} ${(body.violations ?? []).map((item) => item.message).join(' ')}`
      if (text.includes('15') || text.includes('Too small') || text.includes('Too big') || text.includes('common')) {
        setStatus(text.includes('common') ? 'Mật khẩu quá phổ biến.' : 'Mật khẩu cần từ 15 đến 128 ký tự.')
        return
      }
    }
    setStatus('Mã không còn dùng được.')
  }

  return (
    <form
      className="login"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <h1>Đặt mật khẩu mới</h1>
      <label>
        Mã đặt lại
        <input value={token} onChange={(event) => setToken(event.target.value)} />
      </label>
      <label>
        Mật khẩu mới
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button type="submit">Đặt lại</button>
      <p>{status}</p>
      <p>
        <a href="/login">Đăng nhập</a>
      </p>
    </form>
  )
}
