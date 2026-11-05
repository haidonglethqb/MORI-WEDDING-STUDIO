'use client'

import { useState } from 'react'

export function VerifyForm() {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function verify() {
    if (!token.trim()) {
      setStatus('Vui lòng dán mã xác nhận từ email của bạn.')
      setIsError(true)
      return
    }
    setLoading(true)
    setStatus('Đang xác nhận mã kích hoạt...')
    setIsError(false)

    try {
      const response = await fetch('/verify/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      })
      setLoading(false)
      if (response.ok) {
        setStatus('Tài khoản đã kích hoạt thành công! Đang chuyển đến trang đăng nhập...')
        setIsError(false)
        setTimeout(() => {
          window.location.assign('/login')
        }, 1200)
        return
      }
      setIsError(true)
      setStatus(token.trim().length < 20 ? 'Mã xác nhận chưa đủ độ dài.' : 'Mã xác nhận không hợp lệ hoặc đã hết hạn.')
    } catch {
      setLoading(false)
      setIsError(true)
      setStatus('Đã xảy ra lỗi mạng khi xác nhận.')
    }
  }

  async function resend() {
    if (!email.trim()) {
      setStatus('Vui lòng nhập địa chỉ email để gửi lại mã.')
      setIsError(true)
      return
    }
    setResending(true)
    setStatus('Đang gửi lại mã xác nhận...')
    setIsError(false)

    try {
      const response = await fetch('/verify/resend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setResending(false)
      if (response.ok) {
        setStatus('Nếu email còn chờ xác nhận, một mã mới đã được gửi vào hộp thư của bạn.')
        setIsError(false)
        return
      }
      setIsError(true)
      setStatus('Không thể gửi lại mã xác nhận. Vui lòng kiểm tra lại email.')
    } catch {
      setResending(false)
      setIsError(true)
      setStatus('Đã xảy ra lỗi mạng khi gửi lại mã.')
    }
  }

  return (
    <div className="login-card">
      <div className="login-header">
        <span className="login-badge">XÁC THỰC EMAIL BẢO MẬT</span>
        <h1>Kích hoạt tài khoản</h1>
        <p>Dán mã bảo mật được gửi trong hòm thư email của bạn để bắt đầu sử dụng.</p>
      </div>

      <form
        className="login-form-inner"
        method="POST"
        action="javascript:void(0)"
        onSubmit={(event) => {
          event.preventDefault()
          void verify()
        }}
      >
        <label className="field-group">
          <span>Mã xác nhận email (Token)</span>
          <input
            name="token"
            value={token}
            placeholder="Dán chuỗi mã bí mật từ email..."
            onChange={(event) => setToken(event.target.value)}
            autoComplete="one-time-code"
            disabled={loading}
          />
        </label>

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? 'Đang kích hoạt...' : 'Kích hoạt tài khoản ngay'}
        </button>

        {status && (
          <div className={`status-banner ${isError ? 'status-error' : 'status-success'}`}>
            {status}
          </div>
        )}

        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px dashed #dcd8ce' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#55634f', display: 'block', marginBottom: '8px' }}>
            Chưa nhận được mã? Gửi lại mã mới:
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              value={email}
              placeholder="Nhập email của bạn..."
              disabled={resending}
              onChange={(event) => setEmail(event.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d5d0c4',
                fontSize: '13px',
              }}
            />
            <button
              type="button"
              disabled={resending}
              onClick={() => void resend()}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #55634f',
                background: '#ffffff',
                color: '#55634f',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {resending ? '...' : 'Gửi lại'}
            </button>
          </div>
        </div>

        <div className="login-footer-links" style={{ marginTop: '20px' }}>
          <a href="/login">Đã có tài khoản? Đăng nhập</a>
          <span className="dot-divider">·</span>
          <a href="/register">Tạo tài khoản mới</a>
          <span className="dot-divider">·</span>
          <a href="/">Trang chủ</a>
        </div>
      </form>
    </div>
  )
}
