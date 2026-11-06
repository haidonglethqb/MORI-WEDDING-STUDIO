'use client'

import { useRef, useState } from 'react'
import '../../workspace/request-stepper.css'

interface AddressChoice { addressId: string; recipientName: string; locality: string }
export function PlaceOrderButton({ requestId, quoteId, expectedVersion, totalAmountVnd, requestKind, addresses, isReadyToOrder = true }: {
  requestId: string; quoteId: string; expectedVersion: number; totalAmountVnd: string; requestKind: string; addresses: AddressChoice[]; isReadyToOrder?: boolean
}) {
  const key = useRef<string | null>(null)
  const needsAddress = requestKind !== 'DIGITAL'
  const [addressId, setAddressId] = useState(addresses[0]?.addressId ?? '')
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const selectedAddress = addresses.find((address) => address.addressId === addressId)

  async function place() {
    if (loading) return
    if (!isReadyToOrder) { setStatus('Vui lòng duyệt bản in mẫu ở bên dưới trước khi gửi đơn.'); return }
    if (needsAddress && !addressId) { setStatus('Vui lòng chọn địa chỉ giao nhận trước.'); return }
    setLoading(true); setStatus('Đang gửi yêu cầu đặt đơn...')
    if (!key.current) key.current = `order-${crypto.randomUUID()}`
    try {
      const response = await fetch(`/requests/${requestId}/place-order`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quoteId, expectedVersion, idempotencyKey: key.current, ...(needsAddress ? { shippingAddressId: addressId } : {}) }),
      })
      if (response.ok) {
        const created = (await response.json()) as { orderId: string }
        setStatus('Đã tạo đơn thành công. Đang mở trang đơn hàng...')
        window.location.assign(`/orders/${created.orderId}`); return
      }
      setStatus(response.status === 409 ? 'Bản in chưa được duyệt hoặc báo giá đã hết hạn. Vui lòng kiểm tra lại.' : 'Chưa gửi được đơn. Vui lòng thử lại sau.')
    } catch { setStatus('Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại.') }
    setLoading(false)
  }

  return <div className="request-stepper order-stepper">
    <ol className="request-stepper-progress" aria-label="Các bước gửi đơn"><li className="is-active" aria-current={step === 0 ? 'step' : undefined}><span>1</span>{needsAddress ? 'Giao nhận' : 'Loại thiệp'}</li><li className={step === 1 ? 'is-active' : ''} aria-current={step === 1 ? 'step' : undefined}><span>2</span>Kiểm tra & gửi</li></ol>
    <div className="request-stepper-content" key={step}>{step === 0 ? <><h3>{needsAddress ? 'Chọn địa chỉ giao' : 'Thiệp trực tuyến'}</h3>{needsAddress ? addresses.length === 0 ? <p><a href="/addresses">Thêm địa chỉ giao</a> trước khi gửi đơn.</p> : <label>Địa chỉ giao<select className="order-stepper-select" value={addressId} onChange={(event) => { setAddressId(event.target.value); key.current = null }}><option value="">Chọn địa chỉ</option>{addresses.map((address) => <option key={address.addressId} value={address.addressId}>{address.recipientName} · {address.locality}</option>)}</select></label> : <p>Thiệp số không yêu cầu địa chỉ giao nhận.</p>}{!isReadyToOrder ? <p>Vui lòng duyệt bản in mẫu ở bên dưới trước khi gửi đơn.</p> : null}</> : <><h3>Kiểm tra trước khi gửi</h3><p>Báo giá: <strong>{BigInt(totalAmountVnd).toLocaleString('vi-VN')} ₫</strong></p>{needsAddress && selectedAddress ? <p>Giao đến: {selectedAddress.recipientName} · {selectedAddress.locality}</p> : null}</>}</div>
    <div className="request-stepper-actions">{step === 1 ? <button type="button" disabled={loading} onClick={() => { setStep(0); setStatus('') }}>← Quay lại</button> : <span />}{step === 0 ? <button type="button" className="request-stepper-primary" disabled={!isReadyToOrder || (needsAddress && !addressId)} onClick={() => setStep(1)}>Tiếp tục →</button> : <button type="button" className="request-stepper-primary" disabled={loading} onClick={() => void place()}>{loading ? 'Đang gửi...' : 'Gửi yêu cầu đặt đơn'}</button>}</div>
    {status ? <p className="request-stepper-status" role="status" aria-live="polite">{status}</p> : null}
  </div>
}
