'use client'

import { useState } from 'react'

export function ResetForm() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function submit() {
    if (!token.trim() || !password) {
      setStatus('Vui lòng nhập đầy đủ mã xác nhận và mật khẩu mới.')
      setIsError(true)
      return
    }
    setLoading(true)
    setStatus('Đang đặt lại mật khẩu...')
    setIsError(false)

    try {
      const response = await fetch('/reset/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), password }),
      })
      setLoading(false)

      if (response.ok) {
        setStatus('Mật khẩu mới đã được cập nhật thành công! Đang chuyển đến trang đăng nhập...')
        setIsError(false)
        setTimeout(() => {
          window.location.assign('/login')
        }, 1200)
        return
      }

      if (response.status === 400 || response.status === 422) {
        const body = (await response.json()) as { title?: string; violations?: { message: string }[] }
        const text = `${body.title ?? ''} ${(body.violations ?? []).map((item) => item.message).join(' ')}`
        setIsError(true)
        if (text.includes('15') || text.includes('Too small') || text.includes('Too big') || text.includes('common')) {
          setStatus(text.includes('common') ? 'Mật khẩu quá phổ biến, vui lòng chọn mật khẩu khác.' : 'Mật khẩu cần từ 15 đến 128 ký tự.')
          return
        }
      }
      setIsError(true)
      setStatus('Mã đặt lại không hợp lệ hoặc đã hết hạn sử dụng.')
    } catch {
      setLoading(false)
      setIsError(true)
      setStatus('Đã xảy ra lỗi mạng. Vui lòng thử lại.')
    }
  }

  return (
    <div className="login-card">
      <div className="login-header">
        <span className="login-badge">BẢO MẬT TÀI KHOẢN</span>
        <h1>Đặt mật khẩu mới</h1>
        <p>Dán mã xác nhận từ email và thiết lập mật khẩu mới (tối thiểu 15 ký tự).</p>
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
          <span>Mã xác nhận (Token)</span>
          <input
            name="token"
            value={token}
            placeholder="Dán mã từ email khôi phục..."
            disabled={loading}
            onChange={(event) => setToken(event.target.value)}
          />
        </label>

        <label className="field-group">
          <span>Mật khẩu mới</span>
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
          {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu mới'}
        </button>

        {status && (
          <div className={`status-banner ${isError ? 'status-error' : 'status-success'}`}>
            {status}
          </div>
        )}

        <div className="login-footer-links">
          <a href="/login">Đã nhớ mật khẩu? Đăng nhập</a>
          <span className="dot-divider">·</span>
          <a href="/">Trang chủ</a>
        </div>
      </form>
    </div>
  )
}
