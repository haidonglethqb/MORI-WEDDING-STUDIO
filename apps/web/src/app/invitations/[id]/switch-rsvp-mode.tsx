'use client'

import { useState } from 'react'

export function SwitchRsvpMode({
  invitationId,
  mode,
  onSwitched,
}: {
  invitationId: string
  mode: 'OFF' | 'OPEN' | 'GUEST_LIST'
  onSwitched: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  const [status, setStatus] = useState(
    mode === 'OPEN' ? 'Hiện tại: Khách mời mở được phép tự phản hồi.' : 'Hiện tại: Chỉ nhóm khách trong danh sách được trả lời.',
  )

  async function switchMode() {
    setStatus('Đang chuyển chế độ...')
    const response = await fetch(`/invitations/${invitationId}/rsvp-mode`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'GUEST_LIST', confirm }),
    })
    if (!response.ok) {
      setStatus('Chưa chuyển được. Cần xác nhận, và thiệp phải đang mở.')
      return
    }
    onSwitched()
    setStatus('Đã chuyển sang chế độ danh sách mời riêng tư.')
  }

  if (mode !== 'OPEN') {
    return <div style={{ fontSize: '12px', color: '#7a8275', margin: '8px 0' }}>{status}</div>
  }

  return (
    <fieldset className="editor-tool-fieldset">
      <legend>Phương thức tiếp nhận lời đáp</legend>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', margin: '8px 0 12px', cursor: 'pointer' }}>
        <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
        Khách vãng lai sẽ không thể gửi hoặc sửa lời đáp nữa
      </label>
      <button
        type="button"
        className="editor-btn-secondary"
        style={{ fontSize: '12px', padding: '6px 14px' }}
        onClick={() => void switchMode()}
        disabled={!confirm}
      >
        Chuyển sang chế độ Danh sách khách
      </button>
      <div style={{ fontSize: '12px', color: '#7a8275', marginTop: '8px' }}>{status}</div>
    </fieldset>
  )
}
