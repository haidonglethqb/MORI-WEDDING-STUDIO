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
  const [status, setStatus] = useState('Khóa toàn bộ phiên mời riêng tư đã phát hành trước đây.')

  async function revoke() {
    setStatus('Đang thu hồi quyền truy cập...')
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
      setStatus('Chưa thu hồi được quyền truy cập.')
      return
    }
    const saved = (await response.json()) as { version: number }
    onRevoked(saved.version)
    setStatus('Đã khóa toàn bộ phiên khách mời cũ. Vui lòng phát lại đường dẫn mới.')
  }

  return (
    <fieldset className="editor-tool-fieldset">
      <legend>Thu hồi phiên khách mời</legend>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', margin: '8px 0 12px', cursor: 'pointer' }}>
        <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
        Tôi xác nhận muốn hủy quyền truy cập của các liên kết khách cũ
      </label>
      <button
        type="button"
        className="editor-btn-secondary"
        style={{ color: '#9b1c1c', borderColor: '#f8b4b4', fontSize: '12px', padding: '6px 14px' }}
        onClick={() => void revoke()}
        disabled={!confirm}
      >
        Thu hồi mọi phiên khách mời
      </button>
      <div style={{ fontSize: '12px', color: '#7a8275', marginTop: '8px' }}>{status}</div>
    </fieldset>
  )
}
