'use client'

import { useState } from 'react'
import type { EstimateResponse } from '@mori/contracts'
import './price-calculator.css'

export interface CalculatorOption {
  id: string
  label: string
  isFixture: boolean
}

export function PriceCalculator({ options }: { options: CalculatorOption[] }) {
  const [variantId, setVariantId] = useState('')
  const [quantity, setQuantity] = useState('100')
  const [result, setResult] = useState<EstimateResponse | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const selected = options.find((option) => option.id === variantId)

  async function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const count = Number(quantity)
    if (!selected || !Number.isInteger(count) || count < 1 || count > 10000) {
      setStatus('Chọn mẫu và nhập số lượng từ 1 đến 10.000.')
      return
    }
    setResult(null)
    setStatus('Đang tính dự toán...')
    setLoading(true)
    try {
      const response = await fetch('/pricing/estimate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: count }),
      })
      if (!response.ok) throw new Error('estimate unavailable')
      setResult((await response.json()) as EstimateResponse)
      setStatus('Đã cập nhật dự toán.')
    } catch {
      setStatus('Chưa thể tính dự toán cho lựa chọn này. Vui lòng thử lại hoặc liên hệ xưởng.')
    } finally {
      setLoading(false)
    }
  }

  const money = (amount: string | null) =>
    amount === null ? 'Chờ xác nhận' : `${BigInt(amount).toLocaleString('vi-VN')} ₫`

  const isFixtureResult = result?.isFixture === true || selected?.isFixture === true

  return (
    <section className="price-calculator" id="du-toan" aria-labelledby="calculator-title">
      <div className="price-calculator-heading">
        <span>DỰ TOÁN / THIỆP CƯỚI</span>
        <h2 id="calculator-title">
          Bắt đầu từ
          <br />
          <em>một con số.</em>
        </h2>
        <p>Chọn mẫu và số lượng để xem thông tin dự toán hiện có từ MORI.</p>
      </div>
      <div className="price-calculator-grid">
        <form onSubmit={(event) => void calculate(event)} className="price-calculator-form">
          <label htmlFor="estimate-variant">1. Chọn mẫu và quy cách</label>
          <select
            id="estimate-variant"
            value={variantId}
            disabled={loading}
            onChange={(e) => {
              setVariantId(e.target.value)
              setResult(null)
              setStatus('')
            }}
          >
            <option value="">Chọn mẫu thiệp</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
                {option.isFixture ? ' · Mẫu minh họa' : ''}
              </option>
            ))}
          </select>
          <label htmlFor="estimate-quantity">2. Số lượng bộ thiệp</label>
          <input
            id="estimate-quantity"
            type="number"
            min="1"
            max="10000"
            step="1"
            required
            value={quantity}
            disabled={loading}
            onChange={(e) => {
              setQuantity(e.target.value)
              setResult(null)
              setStatus('')
            }}
          />
          <button type="submit" disabled={loading || !options.length}>
            {loading ? 'Đang tính...' : 'Xem dự toán →'}
          </button>
          {options.length === 0 ? (
            <p>Chưa có mẫu hỗ trợ dự toán. Hãy trao đổi với xưởng để được tư vấn.</p>
          ) : null}
        </form>
        <div className="price-calculator-result" aria-live="polite">
          <span>KẾT QUẢ / THAM KHẢO</span>
          <h3>{selected?.label ?? 'Chọn mẫu để bắt đầu'}</h3>
          {result ? (
            <>
              <dl>
                <div>
                  <dt>Số lượng</dt>
                  <dd>{result.quantity.toLocaleString('vi-VN')} bộ</dd>
                </div>
                <div>
                  <dt>Giá trị thiệp</dt>
                  <dd>{money(result.merchandiseVnd)}</dd>
                </div>
                <div>
                  <dt>Vận chuyển &amp; thuế</dt>
                  <dd>Chờ xác nhận</dd>
                </div>
              </dl>
              <strong>{result.quoteRequired ? 'Cần báo giá từ xưởng' : money(result.totalVnd)}</strong>
              <p>
                {isFixtureResult
                  ? 'Dữ liệu mẫu minh họa, không phải giá thực tế. '
                  : ''}
                Tổng dự toán sẽ được xác nhận sau khi có đầy đủ chi phí.
              </p>
            </>
          ) : (
            <p>Thông tin giá sẽ hiển thị ở đây sau khi bạn chọn mẫu và số lượng.</p>
          )}
          <a href="/workspace">Tạo yêu cầu thiết kế ↗</a>
        </div>
      </div>
      {status ? (
        <p className="price-calculator-status" role="status">
          {status}
        </p>
      ) : null}
    </section>
  )
}
