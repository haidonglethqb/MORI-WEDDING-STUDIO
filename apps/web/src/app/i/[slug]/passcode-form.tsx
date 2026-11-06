'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoriIcon } from '../../../components/mori-icon'

export function PasscodeForm({ slug }: { slug: string }) {
  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function submitPasscode(e: React.FormEvent) {
    e.preventDefault()
    if (!passcode.trim()) {
      setError('Vui lòng nhập mã bảo mật.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/i/${encodeURIComponent(slug)}/passcode`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      })

      if (response.ok) {
        router.refresh()
        return
      }

      setError('Mã bảo mật không chính xác. Quý khách vui lòng thử lại.')
    } catch {
      setError('Không thể kết nối đến máy chủ xác thực.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submitPasscode(e)
      }}
      className="passcode-card-form"
    >
      <MoriIcon className="passcode-icon" name="lock" />
      <h2 className="passcode-title">Thiệp cưới được bảo vệ</h2>
      <p className="passcode-desc">
        Gia đình đã thiết lập mã bảo vệ cho thiệp cưới này. Quý khách vui lòng nhập mã PIN hoặc mật mã được cung cấp để mở thiệp.
      </p>

      <div className="passcode-input-group">
        <input
          type="password"
          name="passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Nhập mã bảo mật thiệp..."
          className="passcode-input"
          autoFocus
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="passcode-submit-btn"
        >
          {loading ? 'Đang mở...' : 'Mở thiệp cưới ✦'}
        </button>
      </div>

      {error ? <p className="passcode-error-msg">{error}</p> : null}
      <small className="passcode-hint-note">
        * Mẹo: Mã bảo mật thường là ngày cưới hoặc dãy số riêng cô dâu chú rể đã gửi cho bạn.
      </small>
    </form>
  )
}
