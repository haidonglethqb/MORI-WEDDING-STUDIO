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
}: {
  requestId: string
  quoteId: string
  expectedVersion: number
  totalAmountVnd: string
  requestKind: string
  addresses: AddressChoice[]
}) {
  const key = useRef(`order-${crypto.randomUUID()}`)
  const needsAddress = requestKind !== 'DIGITAL'
  const [addressId, setAddressId] = useState(addresses[0]?.addressId ?? '')
  const [status, setStatus] = useState('')

  async function place() {
    if (needsAddress && !addressId) {
      setStatus('Chọn địa chỉ giao trước.')
      return
    }
    setStatus('Đang gửi đơn')
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
    setStatus(response.ok ? 'Đã gửi yêu cầu đơn.' : 'Chưa gửi được đơn.')
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
      <p>
        <button type="button" onClick={() => void place()} disabled={needsAddress && addresses.length === 0}>
          Gửi đơn {totalAmountVnd} VND
        </button>
        {status ? <span> {status}</span> : null}
      </p>
    </div>
  )
}
