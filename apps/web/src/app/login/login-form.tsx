'use client'

import { useState } from 'react'

const DEMO_ACCOUNTS = [
  { label: 'Khách hàng', email: 'customer@mori.local', password: 'MoriWedding2026!', badge: 'Xem RSVP & đơn hàng' },
  { label: 'Xưởng Studio', email: 'studio@mori.local', password: 'MoriWedding2026!', badge: 'Hàng đợi duyệt in' },
  { label: 'Quản trị viên', email: 'admin@mori.local', password: 'MoriWedding2026!', badge: 'Cấu hình toàn hệ thống' },
]

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function handleLogin(targetEmail?: string, targetPass?: string) {
    const finalEmail = (targetEmail ?? email).trim()
    const finalPass = targetPass ?? password

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
      setStatus(`Đăng nhập thành công! Xin chào ${displayName}.`)
      setIsError(false)

      const targetPath = body.user?.role === 'STUDIO' || body.user?.role === 'ADMIN' ? '/studio' : '/workspace'
      setTimeout(() => {
        window.location.assign(targetPath)
      }, 350)
    } catch {
      setStatus('Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại.')
      setIsError(true)
      setLoading(false)
    }
  }

  return (
    <div className="atelier-card">
      <div className="atelier-header">
        <div className="atelier-crest-mark" aria-hidden="true">M</div>
        <span className="atelier-kicker">MORI ATELIER · HAUTE PAPETERIE</span>
        <h1>Đăng nhập không gian xưởng</h1>
        <p>Quản lý bộ thiệp cưới, phê duyệt bản in thử và lưu trữ kỷ niệm cưới.</p>
      </div>

      <form
        className="atelier-form"
        method="POST"
        action="javascript:void(0)"
        onSubmit={(event) => {
          event.preventDefault()
          void handleLogin()
        }}
      >
        <label className="atelier-field">
          <span>Địa chỉ Email</span>
          <input
            name="email"
            type="email"
            placeholder="ten.ban@domain.vn"
            autoComplete="username"
            value={email}
            disabled={loading}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="atelier-field">
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

        <button type="submit" className="atelier-primary-btn" disabled={loading}>
          {loading ? 'Đang xác thực...' : 'Đăng nhập vào Atelier'}
        </button>

        {status && (
          <div className={`status-banner ${isError ? 'status-error' : 'status-success'}`}>
            {status}
          </div>
        )}

        <div className="atelier-links">
          <a href="/forgot">Quên mật khẩu?</a>
          <span className="sep-dot">·</span>
          <a href="/register">Tạo tài khoản mới</a>
          <span className="sep-dot">·</span>
          <a href="/">Trang chủ</a>
        </div>
      </form>

      <details className="atelier-dev-drawer">
        <summary className="dev-drawer-toggle">
          <span>✦ Khám phá tài khoản thử nghiệm (Dev / Review)</span>
        </summary>
        <div className="dev-drawer-content">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              className="dev-pill-btn"
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
      </details>
    </div>
  )
}
