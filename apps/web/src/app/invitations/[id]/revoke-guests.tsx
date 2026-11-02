'use client'

import { useRef, useState } from 'react'

export function RevokeGuests({
  invitationId,
  version,
  onRevoked,
}: {
  invitationId: string
  version: number
  onRevoked: (version: number) => void
}) {
  const key = useRef(`revoke-guests-${crypto.randomUUID()}`)
  const [confirm, setConfirm] = useState(false)
  const [status, setStatus] = useState('Các đường dẫn cũ sẽ phải phát lại.')

  async function revoke() {
    setStatus('Đang thu hồi')
    const response = await fetch(`/invitations/${invitationId}/revoke-guest-access`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ expectedVersion: version, confirm }),
    })
    if (response.status === 409) {
      setStatus('Cần xác nhận, hoặc bản nháp đã đổi. Tải lại trước khi thu hồi.')
      return
    }
    if (!response.ok) {
      setStatus('Chưa thu hồi được.')
      return
    }
    const saved = (await response.json()) as { version: number }
    onRevoked(saved.version)
    setStatus('Đã khóa phiên khách cũ. Hãy phát lại đường dẫn.')
  }

  return (
    <fieldset>
      <legend>Khách đang mở thiệp</legend>
      <label>
        <input type="checkbox" checked={confirm} onChange={(event) => setConfirm(event.target.checked)} />
        Tôi hiểu các đường dẫn cũ phải phát lại
      </label>
      <button type="button" onClick={() => void revoke()} disabled={!confirm}>
        Thu hồi mọi phiên khách
      </button>
      <p>{status}</p>
    </fieldset>
  )
}
