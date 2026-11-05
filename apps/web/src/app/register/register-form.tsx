'use client'

import { useState } from 'react'

export function RegisterForm() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function submit() {
    if (!displayName.trim() || !email.trim() || !password) {
      setStatus('Vui lòng điền đầy đủ tên, email và mật khẩu.')
      setIsError(true)
      return
    }
    setLoading(true)
    setStatus('Đang gửi yêu cầu đăng ký...')
    setIsError(false)

    try {
      const response = await fetch('/register/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim(), email: email.trim(), password }),
      })

      if (response.status === 400 || response.status === 422) {
        const body = (await response.json()) as { detail?: string; title?: string; violations?: { message: string }[] }
        const text = `${body.detail ?? ''} ${body.title ?? ''} ${(body.violations ?? []).map((item) => item.message).join(' ')}`
        setIsError(true)
        setLoading(false)
        if (text.includes('common')) {
          setStatus('Mật khẩu quá phổ biến, vui lòng chọn mật khẩu phức tạp hơn.')
          return
        }
        if (text.includes('15') || text.includes('Too small') || text.includes('Too big')) {
          setStatus('Mật khẩu bảo mật cần từ 15 đến 128 ký tự.')
          return
        }
        setStatus('Thông tin đăng ký chưa hợp lệ.')
        return
      }

      if (!response.ok) {
        setStatus('Chưa tạo được tài khoản. Vui lòng thử lại.')
        setIsError(true)
        setLoading(false)
        return
      }

      setIsError(false)
      setLoading(false)
      setStatus('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác nhận.')
    } catch {
      setStatus('Đã xảy ra lỗi mạng. Vui lòng thử lại.')
      setIsError(true)
      setLoading(false)
    }
  }

  return (
    <div className="login-card">
      <div className="login-header">
        <span className="login-badge">MORI ATELIER · HỘI VIÊN MỚI</span>
        <h1>Tạo tài khoản</h1>
        <p>Tham gia cùng MORI để lưu giữ thiệp cưới và theo dõi tiến trình chế tác.</p>
      </div>

      <form
        className="login-form-inner"
        method="POST"
        action="javascript:void(0)"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <label className="field-group">
          <span>Tên hiển thị / Cặp đôi</span>
          <input
            name="displayName"
            type="text"
            placeholder="vd: Minh Sơn & Thảo Vy"
            value={displayName}
            disabled={loading}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>

        <label className="field-group">
          <span>Địa chỉ Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="vd: ban@example.com"
            value={email}
            disabled={loading}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="field-group">
          <span>Mật khẩu (tối thiểu 15 ký tự)</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 15 ký tự bảo mật"
            value={password}
            disabled={loading}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản hội viên'}
        </button>

        {status && (
          <div className={`status-banner ${isError ? 'status-error' : 'status-success'}`}>
            {status}
          </div>
        )}

        <div className="login-footer-links">
          <a href="/login">Đã có tài khoản? Đăng nhập</a>
          <span className="dot-divider">·</span>
          <a href="/verify">Nhập mã xác nhận</a>
          <span className="dot-divider">·</span>
          <a href="/">Trang chủ</a>
        </div>
      </form>
    </div>
  )
}
