'use client'

import { useRef, useState } from 'react'

interface AddressChoice {
  addressId: string
  recipientName: string
  locality: string
}

export function PlaceOrderButton({
  requestId,
  quoteId,
  expectedVersion,
  totalAmountVnd,
  requestKind,
  addresses,
  isReadyToOrder = true,
}: {
  requestId: string
  quoteId: string
  expectedVersion: number
  totalAmountVnd: string
  requestKind: string
  addresses: AddressChoice[]
  isReadyToOrder?: boolean
}) {
  const key = useRef(`order-${crypto.randomUUID()}`)
  const needsAddress = requestKind !== 'DIGITAL'
  const [addressId, setAddressId] = useState(addresses[0]?.addressId ?? '')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function place() {
    if (!isReadyToOrder) {
      setStatus('Vui lòng duyệt bản in mẫu ở bên dưới trước khi gửi đơn.')
      return
    }
    if (needsAddress && !addressId) {
      setStatus('Vui lòng chọn địa chỉ giao nhận trước.')
      return
    }
    setLoading(true)
    setStatus('Đang gửi yêu cầu đặt đơn...')
    try {
      const response = await fetch(`/requests/${requestId}/place-order`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          quoteId,
          expectedVersion,
          idempotencyKey: key.current,
          ...(needsAddress ? { shippingAddressId: addressId } : {}),
        }),
      })

      if (response.ok) {
        const created = (await response.json()) as { orderId: string }
        setStatus('✦ Đã tạo đơn thành công! Đang chuyển đến trang đơn hàng...')
        setTimeout(() => {
          window.location.assign(`/orders/${created.orderId}`)
        }, 800)
        return
      }

      setLoading(false)
      if (response.status === 409) {
        setStatus('Bản in chưa được duyệt hoặc báo giá đã hết hạn. Vui lòng kiểm tra lại.')
        return
      }
      setStatus('Chưa gửi được đơn. Vui lòng thử lại sau.')
    } catch {
      setLoading(false)
      setStatus('Đã xảy ra lỗi kết nối mạng.')
    }
  }

  return (
    <div>
      {needsAddress ? (
        addresses.length === 0 ? (
          <p>
            <a href="/addresses">Thêm địa chỉ giao</a> trước khi gửi đơn.
          </p>
        ) : (
          <label>
            Địa chỉ giao
            <select value={addressId} onChange={(event) => setAddressId(event.target.value)}>
              {addresses.map((address) => (
                <option key={address.addressId} value={address.addressId}>
                  {address.recipientName} · {address.locality}
                </option>
              ))}
            </select>
          </label>
        )
      ) : null}
      <div style={{ marginTop: '12px' }}>
        <button
          type="button"
          onClick={() => void place()}
          disabled={loading || (needsAddress && addresses.length === 0)}
          style={{
            padding: '10px 22px',
            background: isReadyToOrder ? '#3e4a39' : '#8c9587',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Đang gửi...' : `✦ Gửi yêu cầu đặt đơn (${Number(totalAmountVnd).toLocaleString('vi-VN')} ₫)`}
        </button>
        {status ? (
          <p style={{ fontSize: '13px', color: status.startsWith('✦') ? '#2e4a2a' : '#b91c1c', marginTop: '8px' }}>
            {status}
          </p>
        ) : null}
      </div>
    </div>
  )
}
