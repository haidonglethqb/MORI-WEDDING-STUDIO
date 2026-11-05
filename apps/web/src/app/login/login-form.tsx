'use client'

import { useState } from 'react'

const DEMO_ACCOUNTS = [
  {
    label: 'Khách hàng',
    email: 'customer@mori.local',
    password: 'MoriWedding2026!',
    badge: 'Xem việc & đặt thiệp',
  },
  {
    label: 'Xưởng Studio',
    email: 'studio@mori.local',
    password: 'MoriWedding2026!',
    badge: 'Duyệt in & hàng đợi',
  },
  {
    label: 'Quản trị viên',
    email: 'admin@mori.local',
    password: 'MoriWedding2026!',
    badge: 'Toàn quyền hệ thống',
  },
]

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function handleLogin(targetEmail?: string, targetPass?: string) {
    const docEmail = typeof document !== 'undefined' ? (document.querySelector('input[name="email"]') as HTMLInputElement)?.value : ''
    const docPass = typeof document !== 'undefined' ? (document.querySelector('input[name="password"]') as HTMLInputElement)?.value : ''
    const finalEmail = (targetEmail ?? (email || docEmail) ?? '').trim()
    const finalPass = targetPass ?? (password || docPass) ?? ''

    if (!finalEmail || !finalPass) {
      setStatus('Vui lòng nhập đầy đủ email và mật khẩu.')
      setIsError(true)
      return
    }
    setLoading(true)
    setStatus('Đang xác thực thông tin...')
    setIsError(false)

    try {
      const response = await fetch('/login/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: finalEmail, password: finalPass }),
      })

      if (response.status === 401) {
        setStatus('Email hoặc mật khẩu không chính xác.')
        setIsError(true)
        setLoading(false)
        return
      }

      if (!response.ok) {
        setStatus('Không thể kết nối đến máy chủ xác thực.')
        setIsError(true)
        setLoading(false)
        return
      }

      const body = (await response.json()) as { user?: { displayName?: string; role?: string } }
      const displayName = body.user?.displayName ?? 'bạn'
      setStatus(`Đăng nhập thành công! Xin chào ${displayName}. Đang chuyển trang...`)
      setIsError(false)

      const targetPath = body.user?.role === 'STUDIO' || body.user?.role === 'ADMIN' ? '/studio' : '/workspace'
      setTimeout(() => {
        window.location.assign(targetPath)
      }, 300)
    } catch {
      setStatus('Đã xảy ra lỗi kết nối mạng.')
      setIsError(true)
      setLoading(false)
    }
  }

  return (
    <div className="login-card">
      <div className="login-header">
        <span className="login-badge">MORI ATELIER</span>
        <h1>Đăng nhập tài khoản</h1>
        <p>Truy cập không gian quản lý thiệp cưới và đơn hàng của bạn.</p>
      </div>

      <div className="demo-accounts-box">
        <span className="demo-title">Tài khoản dùng thử (bấm để điền nhanh):</span>
        <div className="demo-buttons">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              className="demo-btn"
              onClick={() => {
                setEmail(acc.email)
                setPassword(acc.password)
                void handleLogin(acc.email, acc.password)
              }}
            >
              <strong>{acc.label}</strong>
              <small>{acc.badge}</small>
            </button>
          ))}
        </div>
      </div>

      <form
        className="login-form-inner"
        method="POST"
        action="javascript:void(0)"
        onSubmit={(event) => {
          event.preventDefault()
          void handleLogin()
        }}
      >
        <label className="field-group">
          <span>Địa chỉ Email</span>
          <input
            name="email"
            type="email"
            placeholder="vd: ban@example.com"
            autoComplete="username"
            value={email}
            disabled={loading}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field-group">
          <span>Mật khẩu</span>
          <input
            name="password"
            type="password"
            placeholder="••••••••••••"
            autoComplete="current-password"
            value={password}
            disabled={loading}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập vào hệ thống'}
        </button>

        {status && (
          <div className={`status-banner ${isError ? 'status-error' : 'status-success'}`}>
            {status}
          </div>
        )}

        <div className="login-footer-links">
          <a href="/forgot">Quên mật khẩu?</a>
          <span className="dot-divider">·</span>
          <a href="/register">Tạo tài khoản mới</a>
          <span className="dot-divider">·</span>
          <a href="/">Về trang chủ</a>
        </div>
      </form>
    </div>
  )
}
