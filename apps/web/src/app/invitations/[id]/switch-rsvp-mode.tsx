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
    mode === 'OPEN' ? 'Khách mở đang được trả lời.' : 'Chỉ nhóm trong danh sách được trả lời.',
  )

  async function switchMode() {
    setStatus('Đang chuyển')
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
    setStatus('Chỉ nhóm trong danh sách được trả lời. Lời đáp cũ vẫn còn.')
  }

  if (mode !== 'OPEN') return <p>{status}</p>

  return (
    <fieldset>
      <legend>Cách trả lời</legend>
      <label>
        <input type="checkbox" checked={confirm} onChange={(event) => setConfirm(event.target.checked)} />
        Khách mở sẽ không sửa lời đáp nữa
      </label>
      <button type="button" onClick={() => void switchMode()} disabled={!confirm}>
        Chuyển sang danh sách khách
      </button>
      <p>{status}</p>
    </fieldset>
  )
}
