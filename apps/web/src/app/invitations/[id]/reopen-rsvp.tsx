'use client'

import { useState } from 'react'

export function ReopenRsvp({ invitationId }: { invitationId: string }) {
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState('Chỉ mở lại khi lời đáp đã đóng, và hạn phải trước giờ buổi.')

  async function reopen() {
    setStatus('Đang mở lại')
    const parsed = new Date(deadline)
    const response = await fetch(`/invitations/${invitationId}/rsvp-deadline`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deadline: Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString() }),
    })
    setStatus(response.ok ? 'Đã mở lại lời đáp.' : 'Chưa mở lại được. Hạn phải nằm trước giờ buổi.')
  }

  return (
    <fieldset>
      <legend>Hạn lời đáp</legend>
      <label>
        Hạn mới
        <input type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
      </label>
      <button type="button" onClick={() => void reopen()}>
        Mở lại lời đáp
      </button>
      <p>{status}</p>
    </fieldset>
  )
}
