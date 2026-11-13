'use client'

import { useRef, useState } from 'react'

export function AddressForm() {
  const key = useRef(`address-${crypto.randomUUID()}`)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [lines, setLines] = useState('')
  const [locality, setLocality] = useState('')
  const [province, setProvince] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function save() {
    if (!name.trim() || !phone.trim() || !locality.trim() || !province.trim()) {
      setStatus('Vui lòng điền đầy đủ tên, số điện thoại, phường/quận và tỉnh/thành.')
      setIsError(true)
      return
    }
    setLoading(true)
    setStatus('Đang lưu địa chỉ...')
    setIsError(false)

    try {
      const response = await fetch('/addresses/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
        body: JSON.stringify({
          recipientName: name.trim(),
          phone: phone.trim(),
          addressLines: lines.trim() || 'Địa chỉ nhận hàng',
          locality: locality.trim(),
          province: province.trim(),
          countryCode: 'VN',
        }),
      })
      setLoading(false)
      if (response.ok) {
        setStatus('Đã lưu địa chỉ nhận thiệp thành công! Đang tải lại...')
        setIsError(false)
        setTimeout(() => window.location.reload(), 800)
        return
      }
      setIsError(true)
      setStatus('Chưa lưu được địa chỉ. Vui lòng kiểm tra lại thông tin.')
    } catch {
      setLoading(false)
      setIsError(true)
      setStatus('Lỗi kết nối mạng khi lưu địa chỉ.')
    }
  }

  return (
    <form
      className="atelier-form"
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <div className="atelier-form-row">
        <label className="field-group">
          <span>Tên người nhận</span>
          <input
            placeholder="vd: Minh Sơn"
            autoComplete="name"
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field-group">
          <span>Số điện thoại</span>
          <input
            placeholder="vd: 0912345678"
            type="tel"
            autoComplete="tel"
            value={phone}
            disabled={loading}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      </div>

      <label className="field-group">
        <span>Địa chỉ chi tiết (Số nhà, tên đường / tòa nhà)</span>
        <input
          placeholder="vd: 123 Phố Huế"
          value={lines}
          disabled={loading}
          onChange={(e) => setLines(e.target.value)}
        />
      </label>

      <div className="atelier-form-row">
        <label className="field-group">
          <span>Phường / Quận</span>
          <input
            placeholder="vd: Phường Hàng Bài, Hoàn Kiếm"
            value={locality}
            disabled={loading}
            onChange={(e) => setLocality(e.target.value)}
          />
        </label>
        <label className="field-group">
          <span>Tỉnh / Thành phố</span>
          <input
            placeholder="vd: Hà Nội"
            value={province}
            disabled={loading}
            onChange={(e) => setProvince(e.target.value)}
          />
        </label>
      </div>

      <div className="atelier-form-actions">
        <button type="submit" className="workspace-btn-primary" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu địa chỉ vào sổ tay'}
        </button>
      </div>

      {status && (
        <div role="status" className={`status-banner ${isError ? 'status-error' : 'status-success'}`}>
          {status}
        </div>
      )}
    </form>
  )
}
