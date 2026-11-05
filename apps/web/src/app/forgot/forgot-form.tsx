'use client'

import { useState } from 'react'

export function ForgotForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function submit() {
    if (!email.trim()) {
      setStatus('Vui lòng nhập địa chỉ email đã đăng ký.')
      setIsError(true)
      return
    }
    setLoading(true)
    setStatus('Đang gửi yêu cầu...')
    setIsError(false)

    try {
      const response = await fetch('/forgot/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setLoading(false)
      if (response.ok) {
        setStatus('Nếu email tồn tại trong hệ thống, mã đặt lại mật khẩu đã được gửi đến bạn.')
        setIsError(false)
        return
      }
      setIsError(true)
      setStatus('Không thể gửi yêu cầu đặt lại mật khẩu lúc này.')
    } catch {
      setLoading(false)
      setIsError(true)
      setStatus('Đã xảy ra lỗi mạng. Vui lòng thử lại.')
    }
  }

  return (
    <div className="login-card">
      <div className="login-header">
        <span className="login-badge">KHÔI PHỤC TÀI KHOẢN</span>
        <h1>Quên mật khẩu</h1>
        <p>Nhập email đăng ký của bạn để nhận liên kết và mã đặt lại mật khẩu an toàn.</p>
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
          <span>Địa chỉ Email của bạn</span>
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

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi mã khôi phục mật khẩu'}
        </button>

        {status && (
          <div className={`status-banner ${isError ? 'status-error' : 'status-success'}`}>
            {status}
          </div>
        )}

        <div className="login-footer-links">
          <a href="/reset">Đã có mã? Đặt mật khẩu mới</a>
          <span className="dot-divider">·</span>
          <a href="/login">Quay lại đăng nhập</a>
          <span className="dot-divider">·</span>
          <a href="/">Trang chủ</a>
        </div>
      </form>
    </div>
  )
}
